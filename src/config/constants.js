/**
 * 常量配置
 */

const DEFAULT_VALUES = {
    // 汇率
    exchangeRate: 11.37,
    usdCnyRate: 7.11,
    
    // 产品
    category: '谷物类',
    subType: '小麦',
    policyName: '常规进口税收政策',
    
    // 海外段（农场+短驳可多组；兼容旧字段仍保留为 0）
    farmPriceRub: 0,
    shortHaulDistanceKm: 0,
    shortHaulPricePerKmPerContainer: 0,
    overseaModules: [
        {
            id: 1,
            farmPriceRub: 0,
            shortHaulDistanceKm: 0,
            shortHaulPricePerKmPerContainer: 0,
            shortHaulVatRate: 0
        }
    ],
    exportExtras: [],
    
    // 税收政策
    dutyRate: 0,
    vatRate: 9,
    
    // 出口板块政策
    exportPolicyName: '常规出口税收政策',
    exportPolicyMode: 'no-duty', // 'no-duty' | 'with-duty' | 'planned'
    exportDutyRate: 0,
    exportVatRate: 10,
    exportPlanType: 'planned', // 'planned' | 'unplanned' - 计划内/计划外
    
    // 国内段
    importPriceRub: 0,
    importPriceUnit: 'RUB/t',
    intlFreightOverseasUsd: 0,  // 中欧班列运费 - 国外段 (USD/柜)
    intlFreightDomesticUsd: 0,   // 中欧班列运费 - 国内段 (USD/柜)
    insuranceRate: 0.003,  // 保费率（默认0.003，即0.3%）
    domesticShortHaulCny: 0,
    domesticExtras: [],
    
    // 批次
    totalContainers: 10,
    tonsPerContainer: 26,
    
    // 资金
    collectionDays: 45,
    interestRate: 6.0,
    
    // 销售
    sellingPriceCny: 5500
};

// 导出到全局（兼容 CDN 模式）
// 使用立即执行确保在 Babel 处理时正确导出
(function() {
    if (typeof window !== 'undefined') {
        window.constants = {
            DEFAULT_VALUES
        };
        console.log('constants 已导出到全局');
    }
})();

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.constants 访问
export { DEFAULT_VALUES };
