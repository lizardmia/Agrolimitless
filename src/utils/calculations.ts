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
    // 短驳费计算：公里数 * 2 * 每公里每柜价格（RUB/柜）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    // 转换为每吨价格
    const shortHaulFeePerTon = shortHaulFeePerContainer / tpc;
    
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 基础海外到站预估（未调整）
    const baseRussianArrivalPriceRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    
    // === 先算建议出口价（供后续关税计算使用）===
    // 公式：建议出口价 P = (base + P*exportDutyRate/100) * (1 + m)
    // 代数解（includeShortHaulInDuty=true）：P = base*(1+m) / (1 - r*(1+m))
    // 代数解（includeShortHaulInDuty=false）：P = (base - shortHaul*r)*(1+m) / (1 - r*(1+m))
    const suggestedExportPriceBase = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    const m = expectedProfitPercent / 100;
    const r = exportDutyRate / 100;
    const denominator = 1 - r * (1 + m);
    let suggestedExportPriceRub = 0;
    if (expectedProfitPercent > 0 && denominator > 0) {
        if (includeShortHaulInDuty) {
            suggestedExportPriceRub = suggestedExportPriceBase * (1 + m) / denominator;
        } else {
            const numerator = (suggestedExportPriceBase - shortHaulFeePerTon * r) * (1 + m);
            suggestedExportPriceRub = numerator / denominator;
        }
    }
    // 实际用于关税计算的出口价：优先用 exportPriceRub（App 层自动或手动填入），无则用建议值，再无则 0
    const effectiveExportPriceForDuty = exportPriceRub > 0
        ? exportPriceRub
        : (suggestedExportPriceRub > 0 ? suggestedExportPriceRub : 0);

    // === 出口板块政策计算 ===
    let exportVatRebateRub = 0;  // 出口增值税退税（RUB/t）
    let exportDutyRub = 0;  // 出口关税（RUB/t）
    let adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    
    if (exportPolicyMode === 'no-duty') {
        // 规则1：没有关税，只有增值税退税
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
            adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub;
        }
    } else if (exportPolicyMode === 'with-duty') {
        // 规则2：有关税
        if (exportVatRate > 0) {
            const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
            exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
        }
        // 关税 = 建议出口价格 × 关税税率（含/不含短驳取决于选项）
        const dutyBase = includeShortHaulInDuty
            ? effectiveExportPriceForDuty
            : effectiveExportPriceForDuty - shortHaulFeePerTon;
        exportDutyRub = Math.max(0, dutyBase) * (exportDutyRate / 100);
        // 海外到站预估 = 原值 - 增值税退税 + 关税
        adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub - exportVatRebateRub + exportDutyRub;
    } else if (exportPolicyMode === 'planned') {
        adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    }
    
    const russianArrivalPriceRub = adjustedRussianArrivalPriceRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    const adjustedRussianArrivalPriceCny = russianArrivalPriceCny;
    
    const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
        ? importPriceRub 
        : importPriceRub / tpc;
    
    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;
    
    // 建议出口价对应的关税金额（RUB/t）
    const suggestedExportDutyRub = suggestedExportPriceRub > 0
        ? (includeShortHaulInDuty
            ? suggestedExportPriceRub * r
            : (suggestedExportPriceRub - shortHaulFeePerTon) * r)
        : 0;

    const suggestedFarmPriceRub = 0;

    // === 关税计算基础价（出口价格 or 进口结算货值）===
    // 如果用户填了出口价格(exportPriceRub > 0)，用它作为关税基础；否则用进口结算货值
    // 含短驳选项：是否在关税基础中包含短驳费
    const effectiveDutyBaseRub = (() => {
        let base = exportPriceRub > 0 ? exportPriceRub : normalizedImportPriceRubPerTon;
        if (includeShortHaulInDuty) {
            base = base + shortHaulFeePerTon;
        }
        return base;
    })();

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
    shortHaulDistanceKm: number;
    shortHaulPricePerKmPerContainer: number;
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number {
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
    shortHaulDistanceKm: number;
    shortHaulPricePerKmPerContainer: number;
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    dutyRate: number;
    vatRate: number;
    intlFreightOverseasUsd: number;
    intlFreightDomesticUsd: number;
    domesticShortHaulCny: number;
    domesticExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number | null {
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
        intlFreightOverseasUsd,
        intlFreightDomesticUsd,
        insuranceRate,
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
    
    // 解方程：targetBaseLandingPriceCny = (importValueCny + intlFreightOverseasCnyPerTon) * (1 + dutyRate/100) * (1 + vatRate/100) + intlFreightDomesticCnyPerTon + domesticLogisticsCnyPerTon
    const taxFactor = (1 + dutyRate / 100) * (1 + vatRate / 100);
    const importValueCny = (targetBaseLandingPriceCny - intlFreightDomesticCnyPerTon - domesticLogisticsCnyPerTon) / taxFactor - intlFreightOverseasCnyPerTon;
    
    if (importValueCny <= 0) {
        return null; // 无解
    }
    
    // 将进口结算货值转换为RUB
    const importPriceRub = importValueCny * exchangeRate;
    
    // 假设进口结算货值 ≈ 海外到站价格（简化假设）
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
