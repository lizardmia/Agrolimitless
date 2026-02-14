/**
 * JS 组件的类型声明文件
 * 用于 TypeScript 导入 JS 组件
 */
import type React from 'react';
import type { PricingResults, ProductCategories, OverseaExtra, DomesticExtra } from '../types/index.d';

// ExchangeRateCards 组件
export interface ExchangeRateCardsProps {
    exchangeRate: number;
    setExchangeRate: (value: number) => void;
    usdCnyRate: number;
    setUsdCnyRate: (value: number) => void;
}

export declare function ExchangeRateCards(props: ExchangeRateCardsProps): JSX.Element;

// Sidebar 组件
export interface SidebarProps {
    category: string;
    setCategory: (value: string) => void;
    subType: string;
    setSubType: (value: string) => void;
    productCategories: ProductCategories;
    handleCategoryChange: (val: string) => void;
    farmPriceRub: number;
    setFarmPriceRub: (value: number) => void;
    overseaLogistics1: number;
    setOverseaLogistics1: (value: number) => void;
    unit1: string;
    setUnit1: (value: string) => void | React.Dispatch<React.SetStateAction<'RUB/t' | 'RUB/柜'>>;
    overseaLogistics2: number;
    setOverseaLogistics2: (value: number) => void;
    unit2: string;
    setUnit2: (value: string) => void | React.Dispatch<React.SetStateAction<'RUB/t' | 'RUB/柜'>>;
    exportExtras: OverseaExtra[];
    addExportExtra: () => void;
    deleteExportExtra: (id: number) => void;
    updateExportExtra: (id: number, field: string, value: any) => void;
    toggleExportExtraUnit: (id: number) => void;
    russianArrivalPriceRub: number;
    russianArrivalPriceCny: number;
    policyName: string;
    setPolicyName: (value: string) => void;
    dutyRate: number;
    setDutyRate: (value: number) => void;
    vatRate: number;
    setVatRate: (value: number) => void;
    saveStatus: string | null;
    savePolicy: () => void;
    importPriceRub: number;
    setImportPriceRub: (value: number) => void;
    importPriceUnit: string;
    setImportPriceUnit: (value: string) => void | React.Dispatch<React.SetStateAction<'RUB/t' | 'RUB/柜'>>;
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

export declare function Sidebar(props: SidebarProps): JSX.Element;

// ResultsPanel 组件
export interface ResultsPanelProps {
    results: PricingResults;
    totalContainers: number;
    setTotalContainers: (value: number) => void;
    tonsPerContainer: number;
    setTonsPerContainer: (value: number) => void;
}

export declare function ResultsPanel(props: ResultsPanelProps): JSX.Element;

// CostBreakdown 组件
export interface CostBreakdownProps {
    results: PricingResults;
    subType: string;
    policyName: string;
    importPriceRub: number;
    exchangeRate: number;
    intlFreightUsd: number;
    usdCnyRate: number;
    tonsPerContainer: number;
    dutyRate: number;
    vatRate: number;
}

export declare function CostBreakdown(props: CostBreakdownProps): JSX.Element;

// FinancePanel 组件
export interface FinancePanelProps {
    collectionDays: number;
    setCollectionDays: (value: number) => void;
    interestRate: number;
    setInterestRate: (value: number) => void;
    interestExpense: number;
}

export declare function FinancePanel(props: FinancePanelProps): JSX.Element;
