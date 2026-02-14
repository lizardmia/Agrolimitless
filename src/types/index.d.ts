/**
 * TypeScript 类型定义
 */

// 产品类别
export type ProductCategory = '谷物类' | '豆类' | '油籽类' | '饲料类';

export type ProductSubType = 
  // 谷物类
  | '小麦' | '大麦' | '玉米' | '荞麦' | '黑麦' | '大米' | '小米' | '燕麦'
  // 豆类
  | '豌豆' | '扁豆'
  // 油籽类
  | '亚麻籽' | '油葵' | '葵仁' | '油菜籽' | '大豆'
  // 饲料类
  | '豆粕' | '豆饼' | '菜籽饼' | '菜籽粕' | '亚麻籽饼' | '亚麻籽粕' | '葵粕' | '甜菜粕';

// 单位类型
export type OverseaUnit = 'RUB/t' | 'RUB/柜';
export type DomesticUnit = 'CNY/ton' | 'CNY/柜';
export type ImportPriceUnit = 'RUB/t' | 'RUB/柜';

// 杂费项目
export interface ExtraItem {
  id: number;
  name: string;
  value: number | string; // 允许空字符串，用于未填写的项目
  unit: string;
}

export interface OverseaExtra extends ExtraItem {
  unit: 'RUB/ton' | 'RUB/container';
}

export interface DomesticExtra extends ExtraItem {
  unit: 'CNY/ton' | 'CNY/柜';
}

// 计算参数
export interface PricingParams {
  // 汇率参数
  exchangeRate?: number;
  usdCnyRate?: number;
  
  // 海外段参数
  farmPriceRub?: number;
  overseaLogistics1?: number;
  unit1?: OverseaUnit;
  overseaLogistics2?: number;
  unit2?: OverseaUnit;
  exportExtras?: OverseaExtra[];
  
  // 税收政策
  dutyRate?: number;
  vatRate?: number;
  
  // 国内段参数
  importPriceRub?: number;
  importPriceUnit?: ImportPriceUnit;
  intlFreightUsd?: number;
  domesticShortHaulCny?: number;
  domesticExtras?: DomesticExtra[];
  
  // 批次参数
  totalContainers?: number;
  tonsPerContainer?: number;
  
  // 资金参数
  collectionDays?: number;
  interestRate?: number;
  
  // 销售价格
  sellingPriceCny?: number;
}

// 计算结果
export interface PricingResults {
  totalTons: number;
  russianArrivalPriceRub: number;
  russianArrivalPriceCny: number;
  overseaProfitRubCalculated: number;
  importValueCny: number;
  intlFreightCnyPerTon: number;
  customValueCny: number;
  dutyCny: number;
  vatCny: number;
  domesticLogisticsBase: number;
  dynamicExtrasTotal: number;
  domesticLogisticsCnyPerTon: number;
  baseLandingPrice: number;
  interestExpense: number;
  fullCost: number;
  profitNoInterest: number;
  profitWithInterest: number;
  totalCapital: number;
}

// 产品类别配置
export type ProductCategories = {
  [K in ProductCategory]: ProductSubType[];
};

// 税收政策数据
export interface PolicyData {
  timestamp: string;
  policyName: string;
  targetProduct: {
    category: ProductCategory;
    subType: ProductSubType;
  };
  rates: {
    dutyRate: number;
    vatRate: number;
  };
}

// 货币格式化选项
export interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
}
