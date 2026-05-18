/**
 * DomesticSection 组件的类型声明
 */
import type React from 'react';
import type { DomesticExtra, PricingResults } from '../types/index.d';

export interface DomesticSectionProps {
    importPriceRub: number;
    setImportPriceRub: (value: number) => void;
    importPriceUnit: 'RUB/t' | 'RUB/柜';
    setImportPriceUnit: (value: 'RUB/t' | 'RUB/柜') => void;
    /** 卢布/人民币，与 calculatePricing 一致 */
    exchangeRate?: number;
    results?: PricingResults;
    subType?: string;
    policyName?: string;
    intlFreightOverseasUsd?: number;
    intlFreightDomesticUsd?: number;
    insuranceRate: number;
    setInsuranceRate: (value: number) => void;
    usdCnyRate?: number;
    tonsPerContainer?: number;
    dutyRate?: number;
    vatRate?: number;
    domesticShortHaulCny: number;
    setDomesticShortHaulCny: (value: number) => void;
    domesticExtras: DomesticExtra[];
    addDomesticExtra: () => void;
    deleteDomesticExtra: (id: number) => void;
    updateDomesticExtra: (id: number, field: string, value: any) => void;
    toggleDomesticExtraUnit: (id: number) => void;
    sellingPriceCny: number;
    setSellingPriceCny: (value: number) => void;
}

export declare function DomesticSection(props: DomesticSectionProps): JSX.Element;
