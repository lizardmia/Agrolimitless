/**
 * constants.js 的类型声明文件
 */
import type { OverseaExtra, DomesticExtra } from '../types/index.d';

export interface DefaultValues {
    exchangeRate: number;
    usdCnyRate: number;
    category: string;
    subType: string;
    policyName: string;
    farmPriceRub: number;
    overseaLogistics1: number;
    unit1: string;
    overseaLogistics2: number;
    unit2: string;
    exportExtras: OverseaExtra[];
    dutyRate: number;
    vatRate: number;
    importPriceRub: number;
    importPriceUnit: string;
    intlFreightUsd: number;
    domesticShortHaulCny: number;
    domesticExtras: DomesticExtra[];
    totalContainers: number;
    tonsPerContainer: number;
    collectionDays: number;
    interestRate: number;
    sellingPriceCny: number;
}

export declare const DEFAULT_VALUES: DefaultValues;
