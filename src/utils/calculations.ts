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
        exportPriceRub = 0,                // 关税计算使用的出口价格（0 = 使用进口结算货值）
        exportPriceNoRebateRub,
        expectedProfitPerTonRub
    } = params;

    const totalTons = totalContainers * tonsPerContainer;
    const tpc = tonsPerContainer || 1;

    const normalizedImportPriceRubPerTon =
        importPriceUnit === 'RUB/t' ? importPriceRub : importPriceRub / tpc;
    /** 出口关税计税价：填写出口价则用出口价，否则用进口结算货值（RUB/t） */
    const exportPriceForDutyRub =
        exportPriceRub > 0 ? Number(exportPriceRub) : normalizedImportPriceRubPerTon;
    const exportPriceNoRebateForDutyRub =
        exportPriceNoRebateRub !== undefined &&
        exportPriceNoRebateRub !== null &&
        Number(exportPriceNoRebateRub) > 0
            ? Number(exportPriceNoRebateRub)
            : normalizedImportPriceRubPerTon;

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

    // 全栈成本 = 农场 + 短驳 + 杂费（建议出口价/关税基数仍用此项）
    const fullOverseaStackRub = farmPriceRub + shortHaulFeePerTon + exportExtrasTotalRub;
    // 海外到站预估：选择「关税计算不包含短驳费」时不计入短驳费
    const baseRussianArrivalPriceRub = includeShortHaulInDuty
        ? fullOverseaStackRub
        : farmPriceRub + exportExtrasTotalRub;

    // 期望盈利百分点对应的成本基数：不含短驳时与到站预估一致（短驳费及短驳价内税不参与）
    const suggestedExportPriceBase = includeShortHaulInDuty
        ? fullOverseaStackRub
        : farmPriceRub + exportExtrasTotalRub;
    const m = expectedProfitPercent / 100;
    const r = exportDutyRate / 100;

    // 出口增值税退税（农场价内税，用于保本与展示）
    let exportVatRebateRub = 0;
    if (exportVatRate > 0) {
        const priceExcludingVat = farmPriceRub / (1 + exportVatRate / 100);
        exportVatRebateRub = priceExcludingVat * (exportVatRate / 100);
    }
    const rebateRub = exportVatRebateRub;

    // 保本出口价（需先于「按每吨盈利」建议出口价）
    // 「关税计算不包含短驳」时：短驳公里/单价/短驳增值税率均不参与保本 P（与到站 C 一致，仅 P+R=C+rP 或 P=C+rP）
    let breakEvenExportPriceRub = 0;
    if (exportDutyRate > 0 && r < 1) {
        const numerator = baseRussianArrivalPriceRub - rebateRub;
        if (numerator > 0) {
            breakEvenExportPriceRub = Math.round(numerator / (1 - r));
        }
    } else {
        breakEvenExportPriceRub = Math.round(Math.max(0, baseRussianArrivalPriceRub - rebateRub));
    }

    let breakEvenExportPriceNoRebateRub = 0;
    if (exportDutyRate > 0 && r < 1) {
        const numeratorNoRebate = baseRussianArrivalPriceRub;
        if (numeratorNoRebate > 0) {
            breakEvenExportPriceNoRebateRub = Math.round(numeratorNoRebate / (1 - r));
        }
    } else {
        breakEvenExportPriceNoRebateRub = Math.round(Math.max(0, baseRussianArrivalPriceRub));
    }

    // 建议出口价：百分点优先；否则若百分点为 0 且填写了每吨盈利，则 保本价 + 每吨盈利（关税随建议出口价变动）
    let suggestedExportPriceRub = 0;
    const tonProfitRaw = expectedProfitPerTonRub;
    const tonProfitDefined =
        tonProfitRaw !== undefined &&
        tonProfitRaw !== null &&
        Number.isFinite(Number(tonProfitRaw));
    const tonProfit = tonProfitDefined ? Number(tonProfitRaw) : NaN;

    if (expectedProfitPercent > 0 && r < 1) {
        // 不含短驳时 suggestedExportPriceBase 已不含短驳，与保本同口径，不再用短驳费修正分子
        suggestedExportPriceRub = suggestedExportPriceBase * (1 + m) / (1 - r);
        if (suggestedExportPriceRub < 0) suggestedExportPriceRub = 0;
    } else if (tonProfitDefined && expectedProfitPercent === 0) {
        suggestedExportPriceRub = Math.max(0, breakEvenExportPriceRub + Math.max(0, tonProfit));
    }

    // === 出口板块政策展示 ===
    let exportDutyRub = 0;
    const adjustedRussianArrivalPriceRub = baseRussianArrivalPriceRub;
    if (exportPolicyMode === 'with-duty') {
        exportDutyRub = exportPriceForDutyRub * (exportDutyRate / 100);
    }

    const russianArrivalPriceRub = baseRussianArrivalPriceRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    const adjustedRussianArrivalPriceCny = russianArrivalPriceCny;

    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;

    const suggestedExportDutyRub = suggestedExportPriceRub > 0 ? suggestedExportPriceRub * r : 0;

    const suggestedFarmPriceRub = 0;

    const effectiveDutyBaseRub = exportPriceForDutyRub;
    const effectiveDutyBaseNoRebateRub = exportPriceNoRebateForDutyRub;

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
        effectiveDutyBaseNoRebateRub,
        breakEvenExportPriceRub,
        breakEvenExportPriceNoRebateRub,
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
