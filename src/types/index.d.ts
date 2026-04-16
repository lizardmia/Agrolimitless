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
  /** 杂费项增值税率（%），仅用于展示，不参与总价计算 */
  vatRate?: number;
}

export interface DomesticExtra extends ExtraItem {
  unit: 'CNY/ton' | 'CNY/柜';
}

/** 海外段：农场采购价 + 短驳（可多组叠加） */
export interface OverseaFarmHaulModule {
  id: number;
  farmPriceRub: number;
  shortHaulDistanceKm: number;
  shortHaulPricePerKmPerContainer: number;
  /** 短驳费增值税率（%），仅展示 */
  shortHaulVatRate: number;
}

// 计算参数
export interface PricingParams {
  // 汇率参数
  exchangeRate?: number;
  usdCnyRate?: number;
  
  // 海外段参数
  farmPriceRub?: number;
  shortHaulDistanceKm?: number;
  shortHaulPricePerKmPerContainer?: number;
  /** 若设置则覆盖由公里数算出的每吨短驳费（用于多段短驳汇总） */
  shortHaulFeePerTonOverride?: number;
  exportExtras?: OverseaExtra[];
  
  // 海外段-期望盈利与关税计算选项
  expectedProfitPercent?: number;       // 期望盈利百分点（0~100）
  includeShortHaulInDuty?: boolean;     // 关税计算是否包含短驳费
  exportPriceRub?: number;              // 关税计算使用的出口价格（RUB/t），不填则用进口结算货值
  
  // 税收政策
  dutyRate?: number;
  vatRate?: number;
  
  // 出口板块政策
  exportPolicyMode?: 'no-duty' | 'with-duty' | 'planned';
  exportDutyRate?: number;
  exportVatRate?: number;
  exportPlanType?: 'planned' | 'unplanned';
  
  // 国内段参数
  importPriceRub?: number;
  importPriceUnit?: ImportPriceUnit;
  intlFreightOverseasUsd?: number;
  intlFreightDomesticUsd?: number;
  insuranceRate?: number;
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
  baseRussianArrivalPriceRub: number;   // 未调整的原始海外到站预估（RUB/t）
  exportVatRebateRub?: number;  // 出口增值税退税（RUB/t）
  exportDutyRub?: number;  // 出口关税（RUB/t）
  adjustedRussianArrivalPriceRub?: number;  // 调整后的海外到站预估（RUB/t）
  adjustedRussianArrivalPriceCny?: number;  // 调整后的海外到站预估（CNY/t）
  overseaProfitRubCalculated: number;
  // 期望盈利相关
  suggestedFarmPriceRub?: number;       // 兼容旧字段，固定为0
  suggestedExportPriceRub?: number;     // 建议出口价格（RUB/t）
  suggestedExportDutyRub?: number;      // 建议出口价对应的关税（RUB/t）
  effectiveDutyBaseRub?: number;        // 实际关税计算基础价（出口价格 or 进口结算货值）
  // 国内段
  importValueCny: number;
  intlFreightOverseasCnyPerTon: number;
  intlFreightDomesticCnyPerTon: number;
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
