/**
 * 计算工具函数（TypeScript 版本）
 */
import type { PricingParams, PricingResults, ProductCategories, CurrencyFormatOptions } from '../types/index.d';

/**
 * 产品类别配置
 */
export const PRODUCT_CATEGORIES: ProductCategories = {
    '谷物类': ['小麦', '大麦', '玉米', '荞麦', '黑麦', '大米', '小米', '燕麦'],
    '豆类': ['豌豆', '扁豆'],
    '油籽类': ['亚麻籽', '油葵', '葵仁', '油菜籽', '大豆'],
    '饲料类': ['豆粕', '豆饼', '菜籽饼', '菜籽粕', '亚麻籽饼', '亚麻籽粕', '葵粕', '甜菜粕']
};

/**
 * 计算定价结果
 */
export function calculatePricing(params: PricingParams = {}): PricingResults {
    const {
        // 汇率参数
        exchangeRate = 11.37,
        usdCnyRate = 7.11,
        
        // 海外段参数
        farmPriceRub = 35000,
        shortHaulDistanceKm = 100,
        shortHaulPricePerKmPerContainer = 6.73,
        shortHaulFeePerTonOverride,
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
        expectedProfitPercent = 0,          // 期望盈利百分点
        includeShortHaulInDuty = false,     // 关税计算是否包含短驳费
        exportPriceRub = 0                  // 关税计算使用的出口价格（0 = 使用进口结算货值）
    } = params;

    const totalTons = totalContainers * tonsPerContainer;
    const tpc = tonsPerContainer || 1;
    
    // === 海外段计算 ===
    // 短驳费：默认由公里数推算；多段短驳汇总时可传入 shortHaulFeePerTonOverride（RUB/t）
    let shortHaulFeePerTon =
        (shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer) / tpc;
    if (
        shortHaulFeePerTonOverride !== undefined &&
        shortHaulFeePerTonOverride !== null &&
        Number.isFinite(Number(shortHaulFeePerTonOverride))
    ) {
        shortHaulFeePerTon = Number(shortHaulFeePerTonOverride);
    }
    
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 基础海外到站预估（未调整）
    const baseRussianArrivalPriceRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    
    // === 先算建议出口价（供后续关税计算使用）===
    // 定义：利润 = costBase × m（加成率，相对成本的盈利比例）
    // 关税 = P × r，则 P = costBase + costBase×m + P×r
    // 解得：P = costBase*(1+m) / (1-r)
    // 每吨盈利 profit = P - costBase = costBase*(m+r)/(1-r)
    const suggestedExportPriceBase = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    const m = expectedProfitPercent / 100;
    const r = exportDutyRate / 100;
    let suggestedExportPriceRub = 0;
    if (expectedProfitPercent > 0 && r < 1) {
        if (includeShortHaulInDuty) {
            // 关税基数 = P（含短驳）：P = base*(1+m)/(1-r)
            suggestedExportPriceRub = suggestedExportPriceBase * (1 + m) / (1 - r);
        } else {
            // 关税基数 = P - shortHaulFeePerTon：
            // P = base*(1+m) + (P - shortHaul)*r
            // P*(1-r) = base*(1+m) - shortHaul*r
            // P = (base*(1+m) - shortHaul*r) / (1-r)
            suggestedExportPriceRub = (suggestedExportPriceBase * (1 + m) - shortHaulFeePerTon * r) / (1 - r);
        }
        if (suggestedExportPriceRub < 0) suggestedExportPriceRub = 0;
    }
    // === 出口板块政策计算 ===
    // 海外到站预估（展示与下游利润口径）= 农场采购价 + 短驳费/t + 海外杂费合计
    let exportVatRebateRub = 0;  // 仅用于明细展示
    let exportDutyRub = 0;
    const adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;

    if (exportPolicyMode === 'no-duty') {
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
        }
    } else if (exportPolicyMode === 'with-duty') {
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
        }
        // 出口关税 = 海外到站预估（基础合计）× 出口关税税率
        exportDutyRub = baseRussianArrivalPriceRub * (exportDutyRate / 100);
    }

    const russianArrivalPriceRub = baseRussianArrivalPriceRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    const adjustedRussianArrivalPriceCny = russianArrivalPriceCny;
    
    const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
        ? importPriceRub 
        : importPriceRub / tpc;
    
    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;
    
    // 建议出口价对应的关税（同税率 × 建议出口价）
    const suggestedExportDutyRub = suggestedExportPriceRub > 0 ? suggestedExportPriceRub * r : 0;

    const suggestedFarmPriceRub = 0;

    // 出口关税计税基础展示：与海外到站预估（基础合计）一致
    const effectiveDutyBaseRub = baseRussianArrivalPriceRub;

    // === 国内段计算 ===
    const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);
    
    // 国际运费拆分：国外段和国内段
    const intlFreightOverseasCnyPerTon = (intlFreightOverseasUsd * usdCnyRate) / tpc;  // 国外段运费（参与关税计算）
    const intlFreightDomesticCnyPerTon = (intlFreightDomesticUsd * usdCnyRate) / tpc;  // 国内段运费（不参与关税计算）
    const intlFreightCnyPerTon = intlFreightOverseasCnyPerTon + intlFreightDomesticCnyPerTon;  // 总运费
    
    // 关税完税价格 = (进口结算货值 + 国外段运费) * (1 + 保费率)
    const customValueCny = (importValueCny + intlFreightOverseasCnyPerTon) * (1 + insuranceRate);
    const dutyCny = customValueCny * (dutyRate / 100);
    const vatCny = (customValueCny + dutyCny) * (vatRate / 100);
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 基础成本价 = 关税完税价格 + 关税 + 增值税 + 国内段运费 + 国内物流费用
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
 * 根据目标海外到站价格倒推农场采购价
 */
export function reverseFarmPriceFromArrivalPrice(params: {
    targetArrivalPriceCny: number;  // 目标海外到站价格（CNY/t）
    exchangeRate: number;
    shortHaulDistanceKm?: number;
    shortHaulPricePerKmPerContainer?: number;
    /** 每吨短驳费（RUB/t），优先于公里数推算 */
    shortHaulFeePerTon?: number;
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number {
    const {
        targetArrivalPriceCny,
        exchangeRate,
        shortHaulDistanceKm = 0,
        shortHaulPricePerKmPerContainer = 0,
        shortHaulFeePerTon: shortHaulFeePerTonParam,
        exportExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    const shortHaulFeePerTon =
        shortHaulFeePerTonParam !== undefined && shortHaulFeePerTonParam !== null && Number.isFinite(Number(shortHaulFeePerTonParam))
            ? Number(shortHaulFeePerTonParam)
            : (shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer) / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 目标海外到站价格（RUB/t）
    const targetArrivalPriceRub = targetArrivalPriceCny * exchangeRate;
    
    // 倒推农场采购价
    // russianArrivalPriceRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub
    // farmPriceRub = russianArrivalPriceRub - shortHaulFeePerTon - exportExtrasTotalRub
    const farmPriceRub = targetArrivalPriceRub - shortHaulFeePerTon - exportExtrasTotalRub;
    
    return Math.max(0, farmPriceRub); // 确保不为负数
}

/**
 * 根据目标基础成本价倒推农场采购价
 * 注意：这是一个简化版本，假设进口结算货值与海外到站价格相关
 */
export function reverseFarmPriceFromBasePrice(params: {
    targetBaseLandingPriceCny: number;  // 目标基础成本价
    exchangeRate: number;
    usdCnyRate: number;
    shortHaulDistanceKm?: number;
    shortHaulPricePerKmPerContainer?: number;
    shortHaulFeePerTon?: number;
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    dutyRate: number;
    vatRate: number;
    intlFreightOverseasUsd: number;
    intlFreightDomesticUsd: number;
    insuranceRate?: number;
    domesticShortHaulCny: number;
    domesticExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number | null {
    const {
        targetBaseLandingPriceCny,
        exchangeRate,
        usdCnyRate,
        shortHaulDistanceKm = 0,
        shortHaulPricePerKmPerContainer = 0,
        shortHaulFeePerTon: shortHaulFeePerTonParam,
        exportExtras,
        dutyRate,
        vatRate,
        intlFreightOverseasUsd,
        intlFreightDomesticUsd,
        insuranceRate = 0,
        domesticShortHaulCny,
        domesticExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 计算国内段固定成本（不依赖进口结算货值的部分）
    const intlFreightOverseasCnyPerTon = (intlFreightOverseasUsd * usdCnyRate) / tpc;
    const intlFreightDomesticCnyPerTon = (intlFreightDomesticUsd * usdCnyRate) / tpc;
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 与 calculations.js 一致：含税因子含保费率
    const taxFactor = (1 + insuranceRate) * (1 + dutyRate / 100) * (1 + vatRate / 100);
    const importValueCny = (targetBaseLandingPriceCny - intlFreightDomesticCnyPerTon - domesticLogisticsCnyPerTon) / taxFactor - intlFreightOverseasCnyPerTon;
    
    if (importValueCny <= 0) {
        return null; // 无解
    }
    
    // 将进口结算货值转换为RUB
    const importPriceRub = importValueCny * exchangeRate;
    
    // 假设进口结算货值 ≈ 海外到站价格（简化假设）
    const shortHaulFeePerTon =
        shortHaulFeePerTonParam !== undefined && shortHaulFeePerTonParam !== null && Number.isFinite(Number(shortHaulFeePerTonParam))
            ? Number(shortHaulFeePerTonParam)
            : (shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer) / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 倒推农场采购价
    // 假设：importPriceRub ≈ russianArrivalPriceRub（简化）
    // russianArrivalPriceRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub
    // farmPriceRub = importPriceRub - shortHaulFeePerTon - exportExtrasTotalRub
    const farmPriceRub = importPriceRub - shortHaulFeePerTon - exportExtrasTotalRub;
    
    return Math.max(0, farmPriceRub);
}

/**
 * 格式化货币
 */
export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
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
