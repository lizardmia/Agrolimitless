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
        shortHaulDistanceKm = 100,
        shortHaulPricePerKmPerContainer = 6.73,
        exportExtras = [],
        
        // 税收政策
        dutyRate = 0,
        vatRate = 9,
        
        // 出口板块政策
        exportPolicyMode = 'no-duty',
        exportDutyRate = 0,
        exportVatRate = 10,
        exportPlanType = 'planned',
        
        // 国内段参数
        importPriceRub = 37000,
        importPriceUnit = 'RUB/t',
        intlFreightOverseasUsd = 1500,  // 中欧班列运费 - 国外段 (USD/柜)
        intlFreightDomesticUsd = 500,   // 中欧班列运费 - 国内段 (USD/柜)
        insuranceRate = 0.003,  // 保费率（默认0.003，即0.3%）
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
    // 短驳费计算：公里数 * 2 * 每公里每柜价格（RUB/柜）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    // 转换为每吨价格
    const shortHaulFeePerTon = shortHaulFeePerContainer / tpc;
    
    // 海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 基础海外到站预估（未调整）
    const baseRussianArrivalPriceRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    
    // === 出口板块政策计算 ===
    let exportVatRebateRub = 0;  // 出口增值税退税（RUB/t）
    let exportDutyRub = 0;  // 出口关税（RUB/t）
    let adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    
    if (exportPolicyMode === 'no-duty') {
        // 规则1：没有关税，只有增值税退税
        // 采购价含税 = farmPriceRub
        // 增值税退税 = farmPriceRub / (1 + exportVatRate/100) * (exportVatRate/100)
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
            adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub;
        }
    } else if (exportPolicyMode === 'with-duty') {
        // 规则2：有关税
        // 增值税退税 = farmPriceRub / (1 + exportVatRate/100) * (exportVatRate/100)
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
        }
        // 关税 = 进口结算货值 * 关税税率
        const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
            ? importPriceRub 
            : importPriceRub / tpc;
        exportDutyRub = normalizedImportPriceRubPerTon * (exportDutyRate / 100);
        // 海外到站预估 = 原值 - 增值税退税 + 关税
        adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub + exportDutyRub;
    } else if (exportPolicyMode === 'planned') {
        // 规则3：计划内/计划外（预留）
        // 暂时不调整，保持原值
        adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    }
    
    const russianArrivalPriceRub = adjustedRussianArrivalPriceRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    const adjustedRussianArrivalPriceCny = russianArrivalPriceCny;
    
    // 进口结算货值标准化
    const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
        ? importPriceRub 
        : importPriceRub / tpc;
    
    // 海外段利润
    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;
    
    // === 国内段计算 ===
    // 进口结算货值(人民币)
    const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);
    
    // 国际运费拆分：国外段和国内段
    const intlFreightOverseasCnyPerTon = (intlFreightOverseasUsd * usdCnyRate) / tpc;  // 国外段运费（参与关税计算）
    const intlFreightDomesticCnyPerTon = (intlFreightDomesticUsd * usdCnyRate) / tpc;  // 国内段运费（不参与关税计算）
    const intlFreightCnyPerTon = intlFreightOverseasCnyPerTon + intlFreightDomesticCnyPerTon;  // 总运费
    
    // 关税完税价格 = (进口结算货值 + 国外段运费) * (1 + 保费率)
    const customValueCny = (importValueCny + intlFreightOverseasCnyPerTon) * (1 + insuranceRate);
    
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
    
    // 落地基础成本价 = 关税完税价格 + 关税 + 增值税 + 国内段运费 + 国内物流费用
    const baseLandingPrice = customValueCny + dutyCny + vatCny + intlFreightDomesticCnyPerTon + domesticLogisticsCnyPerTon;
    
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
        exportVatRebateRub,
        exportDutyRub,
        adjustedRussianArrivalPriceRub,
        adjustedRussianArrivalPriceCny,
        overseaProfitRubCalculated,
        importValueCny,
        intlFreightOverseasCnyPerTon,
        intlFreightDomesticCnyPerTon,
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
        shortHaulDistanceKm,
        shortHaulPricePerKmPerContainer,
        exportExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 短驳费计算：公里数 * 2 * 每公里每柜价格（RUB/柜）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    // 转换为每吨价格
    const shortHaulFeePerTon = shortHaulFeePerContainer / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 目标海外到站价格（RUB/t）
    const targetArrivalPriceRub = targetArrivalPriceCny * exchangeRate;
    
    // 倒推农场采购价
    const farmPriceRub = targetArrivalPriceRub - shortHaulFeePerTon - exportExtrasTotalRub;
    
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
        shortHaulDistanceKm,
        shortHaulPricePerKmPerContainer,
        exportExtras,
        dutyRate,
        vatRate,
        intlFreightOverseasUsd,
        intlFreightDomesticUsd,
        insuranceRate,
        domesticShortHaulCny,
        domesticExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 计算国内段固定成本
    const intlFreightOverseasCnyPerTon = (intlFreightOverseasUsd * usdCnyRate) / tpc;
    const intlFreightDomesticCnyPerTon = (intlFreightDomesticUsd * usdCnyRate) / tpc;
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 解方程倒推进口结算货值
    // targetBaseLandingPriceCny = (importValueCny + intlFreightOverseasCnyPerTon) * (1 + insuranceRate) * (1 + dutyRate/100) * (1 + vatRate/100) + intlFreightDomesticCnyPerTon + domesticLogisticsCnyPerTon
    const taxFactor = (1 + insuranceRate) * (1 + dutyRate / 100) * (1 + vatRate / 100);
    const importValueCny = (targetBaseLandingPriceCny - intlFreightDomesticCnyPerTon - domesticLogisticsCnyPerTon) / taxFactor - intlFreightOverseasCnyPerTon;
    
    if (importValueCny <= 0) {
        return null;
    }
    
    // 转换为RUB
    const importPriceRub = importValueCny * exchangeRate;
    
    // 短驳费计算：公里数 * 2 * 每公里每柜价格（RUB/柜）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    // 转换为每吨价格
    const shortHaulFeePerTon = shortHaulFeePerContainer / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 倒推农场采购价
    const farmPriceRub = importPriceRub - shortHaulFeePerTon - exportExtrasTotalRub;
    
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

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.calculations 访问
export {
    calculatePricing,
    PRODUCT_CATEGORIES,
    formatCurrency,
    reverseFarmPriceFromArrivalPrice,
    reverseFarmPriceFromBasePrice
};
