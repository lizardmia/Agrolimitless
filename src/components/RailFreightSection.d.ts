/**
 * RailFreightSection 组件的类型声明
 */
export interface RailFreightSectionProps {
    intlFreightOverseasUsd: number;
    setIntlFreightOverseasUsd: (value: number) => void;
    intlFreightDomesticUsd: number;
    setIntlFreightDomesticUsd: (value: number) => void;
    language?: string;
    t?: (key: string) => string;
}

export declare function RailFreightSection(props: RailFreightSectionProps): JSX.Element;
