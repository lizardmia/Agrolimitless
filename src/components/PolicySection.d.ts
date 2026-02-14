/**
 * PolicySection 组件的类型声明
 */
import type React from 'react';

export interface PolicySectionProps {
    policyName: string;
    setPolicyName: (value: string) => void;
    dutyRate: number;
    setDutyRate: (value: number) => void;
    vatRate: number;
    setVatRate: (value: number) => void;
    category: string;
    subType: string;
    saveStatus: string | null;
    savePolicy: () => void;
}

export declare function PolicySection(props: PolicySectionProps): JSX.Element;
