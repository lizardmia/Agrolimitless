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
        sellingPriceCny = 5500,
        
        // 海外段-期望盈利与关税计算选项
        expectedProfitPercent = 0,
        includeShortHaulInDuty = false,
        exportPriceRub = 0
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
    
    // === 先算建议出口价（供后续关税计算使用）===
    // 定义：利润 = costBase × m（加成率）
    // P = costBase*(1+m)/(1-r)
    const suggestedExportPriceBase = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    const m = expectedProfitPercent / 100;
    const r = exportDutyRate / 100;
    let suggestedExportPriceRub = 0;
    if (expectedProfitPercent > 0 && r < 1) {
        if (includeShortHaulInDuty) {
            suggestedExportPriceRub = suggestedExportPriceBase * (1 + m) / (1 - r);
        } else {
            suggestedExportPriceRub = (suggestedExportPriceBase * (1 + m) - shortHaulFeePerTon * r) / (1 - r);
        }
        if (suggestedExportPriceRub < 0) suggestedExportPriceRub = 0;
    }
    // 实际用于关税计算的出口价
    const effectiveExportPriceForDuty = exportPriceRub > 0
        ? exportPriceRub
        : (suggestedExportPriceRub > 0 ? suggestedExportPriceRub : 0);

    // === 出口板块政策计算 ===
    let exportVatRebateRub = 0;
    let exportDutyRub = 0;
    let adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    
    if (exportPolicyMode === 'no-duty') {
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
            adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub;
        }
    } else if (exportPolicyMode === 'with-duty') {
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
        }
        // 关税 = 建议出口价格 × 关税税率
        const dutyBase = includeShortHaulInDuty
            ? effectiveExportPriceForDuty
            : effectiveExportPriceForDuty - shortHaulFeePerTon;
        exportDutyRub = Math.max(0, dutyBase) * (exportDutyRate / 100);
        adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub + exportDutyRub;
    } else if (exportPolicyMode === 'planned') {
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
    
    const suggestedExportDutyRub = suggestedExportPriceRub > 0
        ? (includeShortHaulInDuty
            ? suggestedExportPriceRub * r
            : (suggestedExportPriceRub - shortHaulFeePerTon) * r)
        : 0;
    const suggestedFarmPriceRub = 0;

    // === 关税计算基础价 ===
    const effectiveDutyBaseRub = (() => {
        let base = exportPriceRub > 0 ? exportPriceRub : normalizedImportPriceRubPerTon;
        if (includeShortHaulInDuty) {
            base = base + shortHaulFeePerTon;
        }
        return base;
    })();
    
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
        baseRussianArrivalPriceRub,
        exportVatRebateRub,
        exportDutyRub,
        adjustedRussianArrivalPriceRub,
        adjustedRussianArrivalPriceCny,
        overseaProfitRubCalculated,
        suggestedFarmPriceRub,
        suggestedExportPriceRub,
        suggestedExportDutyRub,
        effectiveDutyBaseRub,
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
