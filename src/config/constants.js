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
    
    // 海外段
    farmPriceRub: 35000,
    overseaLogistics1: 1346.15,
    unit1: 'RUB/t',
    overseaLogistics2: 0,
    unit2: 'RUB/t',
    exportExtras: [
        { id: 1, name: '装车费', value: 1200, unit: 'RUB/ton' },
        { id: 2, name: '商检费', value: 300, unit: 'RUB/ton' }
    ],
    
    // 税收政策
    dutyRate: 0,
    vatRate: 9,
    
    // 国内段
    importPriceRub: 37000,
    importPriceUnit: 'RUB/t',
    intlFreightUsd: 2000,
    domesticShortHaulCny: 4680,
    domesticExtras: [
        { id: 1, name: '港杂费', value: 1500, unit: 'CNY/柜' },
        { id: 2, name: '代理费', value: 944, unit: 'CNY/柜' }
    ],
    
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
