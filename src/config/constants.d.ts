/**
 * constants.js 的类型声明文件
 */
import type { OverseaExtra, DomesticExtra, OverseaFarmHaulModule } from '../types/index.d';

export interface DefaultValues {
    exchangeRate: number;
    usdCnyRate: number;
    category: string;
    subType: string;
    policyName: string;
    farmPriceRub: number;
    shortHaulDistanceKm: number;
    shortHaulPricePerKmPerContainer: number;
    overseaModules: OverseaFarmHaulModule[];
    exportExtras: OverseaExtra[];
    dutyRate: number;
    vatRate: number;
    exportPolicyName: string;
    exportPolicyMode: 'no-duty' | 'with-duty' | 'planned';
    exportDutyRate: number;
    exportVatRate: number;
    exportPlanType: 'planned' | 'unplanned';
    importPriceRub: number;
    importPriceUnit: string;
    intlFreightOverseasUsd: number;
    intlFreightDomesticUsd: number;
    insuranceRate: number;
    domesticShortHaulCny: number;
    domesticExtras: DomesticExtra[];
    totalContainers: number;
    tonsPerContainer: number;
    collectionDays: number;
    interestRate: number;
    sellingPriceCny: number;
}

export declare const DEFAULT_VALUES: DefaultValues;
