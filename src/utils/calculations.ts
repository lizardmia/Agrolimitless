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
    const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
    const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;
    
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    const russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub;
    const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
    
    const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
        ? importPriceRub 
        : importPriceRub / tpc;
    
    const overseaProfitRubCalculated = normalizedImportPriceRubPerTon - russianArrivalPriceRub;
    
    // === 国内段计算 ===
    const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);
    const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;
    const customValueCny = importValueCny + intlFreightCnyPerTon;
    const dutyCny = customValueCny * (dutyRate / 100);
    const vatCny = (customValueCny + dutyCny) * (vatRate / 100);
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
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
 * 根据目标海外到站价格倒推农场采购价
 */
export function reverseFarmPriceFromArrivalPrice(params: {
    targetArrivalPriceCny: number;  // 目标海外到站价格（CNY/t）
    exchangeRate: number;
    overseaLogistics1: number;
    unit1: 'RUB/t' | 'RUB/柜';
    overseaLogistics2: number;
    unit2: 'RUB/t' | 'RUB/柜';
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number {
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
    // russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub
    // farmPriceRub = russianArrivalPriceRub - log1 - log2 - exportExtrasTotalRub
    const farmPriceRub = targetArrivalPriceRub - log1 - log2 - exportExtrasTotalRub;
    
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
    overseaLogistics1: number;
    unit1: 'RUB/t' | 'RUB/柜';
    overseaLogistics2: number;
    unit2: 'RUB/t' | 'RUB/柜';
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    dutyRate: number;
    vatRate: number;
    intlFreightUsd: number;
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
        intlFreightUsd,
        domesticShortHaulCny,
        domesticExtras,
        tonsPerContainer
    } = params;
    
    const tpc = tonsPerContainer || 1;
    
    // 计算国内段固定成本（不依赖进口结算货值的部分）
    const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;
    
    const domesticLogisticsBase = domesticShortHaulCny / tpc;
    const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
    }, 0);
    const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;
    
    // 解方程：targetBaseLandingPriceCny = (importValueCny + intlFreightCnyPerTon) * (1 + dutyRate/100) * (1 + vatRate/100) + domesticLogisticsCnyPerTon
    const taxFactor = (1 + dutyRate / 100) * (1 + vatRate / 100);
    const importValueCny = (targetBaseLandingPriceCny - domesticLogisticsCnyPerTon) / taxFactor - intlFreightCnyPerTon;
    
    if (importValueCny <= 0) {
        return null; // 无解
    }
    
    // 将进口结算货值转换为RUB
    const importPriceRub = importValueCny * exchangeRate;
    
    // 假设进口结算货值 ≈ 海外到站价格（简化假设）
    // 标准化物流费用
    const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
    const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;
    
    // 计算海外杂费合计
    const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
        const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
    }, 0);
    
    // 倒推农场采购价
    // 假设：importPriceRub ≈ russianArrivalPriceRub（简化）
    // russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub
    // farmPriceRub = importPriceRub - log1 - log2 - exportExtrasTotalRub
    const farmPriceRub = importPriceRub - log1 - log2 - exportExtrasTotalRub;
    
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
