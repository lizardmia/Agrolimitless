/**
 * OverseaSection 组件的类型声明
 */
import type React from 'react';
import type { OverseaExtra } from '../types/index.d';

export interface OverseaSectionProps {
    farmPriceRub: number;
    setFarmPriceRub: (value: number) => void;
    overseaLogistics1: number;
    setOverseaLogistics1: (value: number) => void;
    unit1: 'RUB/t' | 'RUB/柜';
    setUnit1: (value: 'RUB/t' | 'RUB/柜') => void;
    overseaLogistics2: number;
    setOverseaLogistics2: (value: number) => void;
    unit2: 'RUB/t' | 'RUB/柜';
    setUnit2: (value: 'RUB/t' | 'RUB/柜') => void;
    exportExtras: OverseaExtra[];
    addExportExtra: () => void;
    deleteExportExtra: (id: number) => void;
    updateExportExtra: (id: number, field: string, value: any) => void;
    toggleExportExtraUnit: (id: number) => void;
    russianArrivalPriceRub: number;
    russianArrivalPriceCny: number;
}

export declare function OverseaSection(props: OverseaSectionProps): JSX.Element;
