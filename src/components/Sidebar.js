/**
 * Sidebar 组件 - 侧边栏参数输入（完整版本）
 */
function Sidebar({
    // 产品选择
    category,
    setCategory,
    subType,
    setSubType,
    productCategories,
    handleCategoryChange,
    
    // 海外段参数
    farmPriceRub,
    setFarmPriceRub,
    overseaLogistics1,
    setOverseaLogistics1,
    unit1,
    setUnit1,
    overseaLogistics2,
    setOverseaLogistics2,
    unit2,
    setUnit2,
    exportExtras,
    addExportExtra,
    deleteExportExtra,
    updateExportExtra,
    toggleExportExtraUnit,
    russianArrivalPriceRub,
    russianArrivalPriceCny,
    
    // 税收政策
    policyName,
    setPolicyName,
    dutyRate,
    setDutyRate,
    vatRate,
    setVatRate,
    saveStatus,
    savePolicy,
    
    // 国内段参数
    importPriceRub,
    setImportPriceRub,
    importPriceUnit,
    setImportPriceUnit,
    intlFreightUsd,
    setIntlFreightUsd,
    domesticShortHaulCny,
    setDomesticShortHaulCny,
    domesticExtras,
    addDomesticExtra,
    deleteDomesticExtra,
    updateDomesticExtra,
    toggleDomesticExtraUnit,
    sellingPriceCny,
    setSellingPriceCny
}) {
    const h = React.createElement;
    const { Icon } = window;
    const { PRODUCT_CATEGORIES } = window.calculations || {};
    const categories = productCategories || PRODUCT_CATEGORIES || {};
    
    return h('div', { className: "col-span-1 md:col-span-4 space-y-6" },
        h('div', { className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-100" },
            h('h3', { className: "text-lg font-bold flex items-center gap-2 mb-6 text-[#1a2b4b]" },
                h(Icon, { name: 'Settings', size: 18, className: "text-blue-500" }),
                " 计算核心参数"
            ),
            h('div', { className: "space-y-4" },
                // 产品选择
                h('div', { className: "space-y-2" },
                    h('label', { className: "text-xs text-slate-400 font-bold uppercase" }, "🏷️ 产品类目与规格"),
                    h('div', { className: "grid grid-cols-2 gap-2" },
                        h('select', {
                            className: "p-3 bg-[#f8faff] border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-100",
                            value: category,
                            onChange: (e) => handleCategoryChange(e.target.value)
                        },
                            Object.keys(categories).map(cat => 
                                h('option', { key: cat, value: cat }, cat)
                            )
                        ),
                        h('select', {
                            className: "p-3 bg-blue-600 text-white border-none rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-300",
                            value: subType,
                            onChange: (e) => setSubType(e.target.value)
                        },
                            categories[category].map(item => 
                                h('option', { key: item, value: item }, item)
                            )
                        )
                    )
                ),
                
                // 海外段参数
                h(window.OverseaSection, {
                    farmPriceRub,
                    setFarmPriceRub,
                    overseaLogistics1,
                    setOverseaLogistics1,
                    unit1,
                    setUnit1,
                    overseaLogistics2,
                    setOverseaLogistics2,
                    unit2,
                    setUnit2,
                    exportExtras,
                    addExportExtra,
                    deleteExportExtra,
                    updateExportExtra,
                    toggleExportExtraUnit,
                    russianArrivalPriceRub,
                    russianArrivalPriceCny
                }),
                
                // 税收政策
                h(window.PolicySection, {
                    policyName,
                    setPolicyName,
                    dutyRate,
                    setDutyRate,
                    vatRate,
                    setVatRate,
                    category,
                    subType,
                    saveStatus,
                    savePolicy
                }),
                
                // 国内段参数
                h(window.DomesticSection, {
                    importPriceRub,
                    setImportPriceRub,
                    importPriceUnit,
                    setImportPriceUnit,
                    intlFreightUsd,
                    setIntlFreightUsd,
                    domesticShortHaulCny,
                    setDomesticShortHaulCny,
                    domesticExtras,
                    addDomesticExtra,
                    deleteDomesticExtra,
                    updateDomesticExtra,
                    toggleDomesticExtraUnit,
                    sellingPriceCny,
                    setSellingPriceCny
                })
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
