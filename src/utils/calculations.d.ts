/**
 * calculations.js 的类型声明文件
 */
import type { PricingParams, PricingResults, ProductCategories, CurrencyFormatOptions } from '../types/index.d';

export declare function calculatePricing(params?: PricingParams): PricingResults;
export declare const PRODUCT_CATEGORIES: ProductCategories;
export declare function formatCurrency(value: number, options?: CurrencyFormatOptions): string;

export declare function reverseFarmPriceFromArrivalPrice(params: {
    targetArrivalPriceCny: number;
    exchangeRate: number;
    overseaLogistics1: number;
    unit1: 'RUB/t' | 'RUB/柜';
    overseaLogistics2: number;
    unit2: 'RUB/t' | 'RUB/柜';
    exportExtras: Array<{ id: number; name: string; value: number | string; unit: string }>;
    tonsPerContainer: number;
}): number;

export declare function reverseFarmPriceFromBasePrice(params: {
    targetBaseLandingPriceCny: number;
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
}): number | null;
