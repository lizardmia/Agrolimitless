/**
 * 计算工具函数
 * 包含所有定价计算的核心逻辑
 */

/**
 * 计算定价结果
 * @param {Object} params - 所有输入参数
 * @returns {Object} 计算结果
 */
function calculatePricing(params) {
    const {
        // 汇率参数
        exchangeRate = 11.37,
        usdCnyRate = 7.11,
        
        // 海外段参数
        farmPriceRub = 35000,
        overseaLogistics1 = 1346.15,
        unit1 = 'RUB/t',
        overseaLogistics2 = 0,
        unit2 = 'RUB/t',
        exportExtras = [],
        
        // 税收政策
        dutyRate = 0,
        vatRate = 9,
        
        // 国内段参数
        importPriceRub = 37000,
        importPriceUnit = 'RUB/t',
        intlFreightUsd = 2000,
        domesticShortHaulCny = 4680,
        domesticExtras = [],
        
        // 批次参数
        totalContainers = 10,
        tonsPerContainer = 26,
        
        // 资金参数
        collectionDays = 45,
        interestRate = 6.0,
        
        // 销售价格
        sellingPriceCny = 5500
    } = params;

    const totalTons = totalContainers * tonsPerContainer;
    const tpc = tonsPerContainer || 1;
    
    // === 海外段计算 ===
    // 单位标准化
    const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
    const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;
    
    // 海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 俄罗斯到站价格
    const russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    
    // 进口结算货值标准化
    const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
        ? importPriceRub 
        : importPriceRub / tpc;
    
    // 海外段利润
    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;
    
    // === 国内段计算 ===
    // 进口结算货值(人民币)
    const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);
    
    // 国际运费(人民币/吨)
    const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;
    
    // 关税完税价格
    const customValueCny = importValueCny + intlFreightCnyPerTon;
    
    // 关税
    const dutyCny = customValueCny * (dutyRate / 100);
    
    // 增值税
    const vatCny = (customValueCny + dutyCny) * (vatRate / 100);
    
    // 国内物流费用
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 落地基础成本价
    const baseLandingPrice = customValueCny + dutyCny + vatCny + domesticLogisticsCnyPerTon;
    
    // === 资金成本计算 ===
    const interestExpense = baseLandingPrice * (interestRate / 100) * (collectionDays / 365);
    const fullCost = baseLandingPrice + interestExpense;
    
    // === 利润计算 ===
    const profitNoInterest = sellingPriceCny - baseLandingPrice;
    const profitWithInterest = sellingPriceCny - fullCost;
    
    // === 批次总成本 ===
    const totalCapital = baseLandingPrice * totalTons;
    
    return {
        totalTons,
        russianArrivalPriceRub,
        russianArrivalPriceCny,
        overseaProfitRubCalculated,
        importValueCny,
        intlFreightCnyPerTon,
        customValueCny,
        dutyCny,
        vatCny,
        domesticLogisticsBase,
        dynamicExtrasTotal,
        domesticLogisticsCnyPerTon,
        baseLandingPrice,
        interestExpense,
        fullCost,
        profitNoInterest,
        profitWithInterest,
        totalCapital
    };
}

/**
 * 产品类别配置
 */
const PRODUCT_CATEGORIES = {
    '谷物类': ['小麦', '大麦', '玉米', '荞麦', '黑麦', '大米', '小米', '燕麦'],
    '豆类': ['豌豆', '扁豆'],
    '油籽类': ['亚麻籽', '油葵', '葵仁', '油菜籽', '大豆'],
    '饲料类': ['豆粕', '豆饼', '菜籽饼', '菜籽粕', '亚麻籽饼', '亚麻籽粕', '葵粕', '甜菜粕']
};

/**
 * 根据目标海外到站价格倒推农场采购价
 */
function reverseFarmPriceFromArrivalPrice(params) {
    const {
        targetArrivalPriceCny,
        exchangeRate,
        overseaLogistics1,
        unit1,
        overseaLogistics2,
        unit2,
        exportExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 标准化物流费用
    const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
    const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 目标海外到站价格（RUB/t）
    const targetArrivalPriceRub = targetArrivalPriceCny * exchangeRate;
    
    // 倒推农场采购价
    const farmPriceRub = targetArrivalPriceRub - log1 - log2 - exportExtrasTotalRub;
    
    return Math.max(0, farmPriceRub);
}

/**
 * 根据目标基础成本价倒推农场采购价
 */
function reverseFarmPriceFromBasePrice(params) {
    const {
        targetBaseLandingPriceCny,
        exchangeRate,
        usdCnyRate,
        overseaLogistics1,
        unit1,
        overseaLogistics2,
        unit2,
        exportExtras,
        dutyRate,
        vatRate,
        intlFreightUsd,
        domesticShortHaulCny,
        domesticExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 计算国内段固定成本
    const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 解方程倒推进口结算货值
    const taxFactor = (1 + dutyRate / 100) * (1 + vatRate / 100);
    const importValueCny = (targetBaseLandingPriceCny - domesticLogisticsCnyPerTon) / taxFactor - intlFreightCnyPerTon;
    
    if (importValueCny <= 0) {
        return null;
    }
    
    // 转换为RUB
    const importPriceRub = importValueCny * exchangeRate;
    
    // 标准化物流费用
    const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
    const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 倒推农场采购价
    const farmPriceRub = importPriceRub - log1 - log2 - exportExtrasTotalRub;
    
    return Math.max(0, farmPriceRub);
}

/**
 * 格式化货币
 * @param {number} value - 数值
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的字符串
 */
function formatCurrency(value, options = {}) {
    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        prefix = '',
        suffix = ''
    } = options;
    
    return `${prefix}${value.toLocaleString(undefined, { 
        minimumFractionDigits, 
        maximumFractionDigits 
    })}${suffix}`;
}

// 导出到全局（兼容 CDN 模式）
// 使用立即执行确保在 Babel 处理时正确导出
(function() {
    if (typeof window !== 'undefined') {
        window.calculations = {
            calculatePricing,
            PRODUCT_CATEGORIES,
            formatCurrency,
            reverseFarmPriceFromArrivalPrice,
            reverseFarmPriceFromBasePrice
        };
        console.log('calculations 已导出到全局');
    }
})();

// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
// 如果需要 ES6 模块支持，请使用 Vite 构建版本
