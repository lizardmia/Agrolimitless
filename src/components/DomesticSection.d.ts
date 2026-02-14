/**
 * DomesticSection 组件的类型声明
 */
import type React from 'react';
import type { DomesticExtra } from '../types/index.d';

export interface DomesticSectionProps {
    importPriceRub: number;
    setImportPriceRub: (value: number) => void;
    importPriceUnit: 'RUB/t' | 'RUB/柜';
    setImportPriceUnit: (value: 'RUB/t' | 'RUB/柜') => void;
    intlFreightUsd: number;
    setIntlFreightUsd: (value: number) => void;
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
