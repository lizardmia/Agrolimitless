/**
 * OverseaSection 组件的类型声明
 */
import type React from 'react';
import type { OverseaExtra, OverseaFarmHaulModule } from '../types/index.d';

export interface OverseaSectionProps {
    overseaModules: OverseaFarmHaulModule[];
    setOverseaModules: React.Dispatch<React.SetStateAction<OverseaFarmHaulModule[]>>;
    exportExtras: OverseaExtra[];
    addExportExtra: () => void;
    deleteExportExtra: (id: number) => void;
    updateExportExtra: (id: number, field: string, value: any) => void;
    toggleExportExtraUnit: (id: number) => void;
    tonsPerContainer: number;
    russianArrivalPriceRub: number;
    russianArrivalPriceCny: number;
    baseRussianArrivalPriceRub?: number;
    exportVatRebateRub?: number;
    exportDutyRub?: number;
    exportDutyRate?: number;
    exportVatRate?: number;
    expectedProfitPercent?: number;
    setExpectedProfitPercent?: (n: number) => void;
    includeShortHaulInDuty?: boolean;
    setIncludeShortHaulInDuty?: (b: boolean) => void;
    exportPriceRub?: number;
    setExportPriceRub?: (n: number) => void;
    suggestedFarmPriceRub?: number;
    suggestedExportPriceRub?: number;
    suggestedExportDutyRub?: number;
    effectiveDutyBaseRub?: number;
    language?: string;
    t?: (key: string) => string;
}

export declare function OverseaSection(props: OverseaSectionProps): JSX.Element;
