/**
 * CostBreakdown 组件 - 成本拆解展示
 */
function CostBreakdown({ 
    results, 
    subType, 
    policyName,
    importPriceRub,
    exchangeRate,
    intlFreightUsd,
    usdCnyRate,
    tonsPerContainer,
    dutyRate,
    vatRate
}) {
    const h = React.createElement;
    const { formatCurrency } = window.calculations || {};
    
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { minimumFractionDigits, maximumFractionDigits });
    });
    
    // 按照层级结构组织显示
    const breakdownItems = [
        // 1. 关税完税价格 (customValueCny)
        {
            type: 'group',
            label: '关税完税价格 (customValueCny)',
            val: results.customValueCny,
            color: 'bg-purple-600',
            isTitle: true,
            calc: '进口结算货值 (CNY/t) + 国际运费 (CNY/t)',
            children: [
                {
                    label: '进口结算货值 (CNY/t)',
                    val: results.importValueCny,
                    color: 'bg-orange-500',
                    calc: `${importPriceRub} / ${exchangeRate}`
                },
                {
                    label: '国际运费 (CNY/t)',
                    val: results.intlFreightCnyPerTon,
                    color: 'bg-indigo-400',
                    calc: `(${intlFreightUsd} * ${usdCnyRate}) / ${tonsPerContainer}`
                }
            ]
        },
        // 2. 关税 (dutyCny)
        {
            type: 'item',
            label: '关税 (dutyCny)',
            val: results.dutyCny,
            color: 'bg-rose-500',
            calc: `完税价格 × 关税税率`
        },
        // 3. 增值税 (vatCny)
        {
            type: 'item',
            label: '增值税 (vatCny)',
            val: results.vatCny,
            color: 'bg-rose-400',
            calc: `(完税价格 + 关税) × 增值税率`
        },
        // 4. 国内物流总费用 (domesticLogisticsCnyPerTon)
        {
            type: 'group',
            label: '国内物流总费用 (domesticLogisticsCnyPerTon)',
            val: results.domesticLogisticsCnyPerTon,
            color: 'bg-blue-500',
            isHighlight: true,
            calc: '国内短驳费 + 国内杂费合计',
            children: [
                {
                    label: '国内短驳费',
                    val: results.domesticLogisticsBase,
                    color: 'bg-blue-400',
                    calc: `短驳费 / ${tonsPerContainer}`
                },
                {
                    label: '国内杂费合计',
                    val: results.dynamicExtrasTotal,
                    color: 'bg-blue-300',
                    calc: 'Σ(各杂费项目)'
                }
            ]
        }
    ];
    
    return h('div', { className: "bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100" },
        h('h4', { className: "text-sm font-bold text-slate-800 mb-8 flex justify-between items-center italic" },
            h('span', { className: "flex items-center gap-2" },
                h('div', { className: "w-1.5 h-6 bg-blue-600 rounded-full" }),
                " 审计级成本拆解 (CNY/T)"
            ),
            h('span', { className: "text-[10px] text-slate-400 font-medium tracking-tight" },
                "绑定产品: ",
                h('b', { className: "text-blue-600" }, subType),
                ` (${policyName})`
            )
        ),
        h('div', { className: "space-y-4" },
            breakdownItems.map((item, idx) => {
                if (item.type === 'group') {
                    // 分组显示：主项 + 子项
                    return h('div', { key: idx, className: "space-y-2" },
                        // 主项
                        h('div', { 
                            className: `flex items-center justify-between p-4 rounded-2xl transition-all ${item.isHighlight || item.isTitle ? 'bg-slate-50 shadow-inner border-2 border-purple-100' : 'bg-slate-50 hover:bg-slate-100'}`
                        },
                            h('div', { className: "flex items-center gap-4" },
                                h('div', { className: `w-3 h-3 rounded-full ${item.color} shadow-sm` }),
                                h('span', { className: `text-sm font-black ${item.isTitle ? 'text-purple-700' : item.isHighlight ? 'text-blue-700' : 'text-slate-700'}` }, item.label)
                            ),
                            h('div', { className: "flex-1 border-b-2 border-dotted border-slate-300 mx-6 opacity-40" }),
                            h('div', { className: "text-right" },
                                h('span', { className: `text-lg font-black ${item.isTitle ? 'text-purple-600' : item.isHighlight ? 'text-blue-700' : 'text-slate-800'}` },
                                    "¥ ",
                                    formatCurrencyLocal(item.val, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                                ),
                                item.calc && h('p', { className: "text-[10px] font-bold text-slate-400 tracking-tighter mt-1" },
                                    item.calc
                                )
                            )
                        ),
                        // 子项
                        h('div', { className: "ml-6 space-y-1.5 pl-4 border-l-2 border-slate-200" },
                            item.children.map((child, childIdx) =>
                                h('div', { 
                                    key: childIdx,
                                    className: "flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/50 transition-all"
                                },
                                    h('div', { className: "flex items-center gap-3" },
                                        h('div', { className: `w-2 h-2 rounded-full ${child.color} shadow-sm` }),
                                        h('span', { className: "text-xs font-bold text-slate-600" }, child.label)
                                    ),
                                    h('div', { className: "flex-1 border-b border-dotted border-slate-200 mx-4 opacity-30" }),
                                    h('div', { className: "text-right" },
                                        h('span', { className: "text-sm font-black text-slate-700" },
                                            "¥ ",
                                            formatCurrencyLocal(child.val, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                                        ),
                                        child.calc && h('p', { className: "text-[9px] font-bold text-slate-300 tracking-tighter mt-0.5" },
                                            child.calc
                                        )
                                    )
                                )
                            )
                        )
                    );
                } else {
                    // 单项显示
                    return h('div', { 
                        key: idx, 
                        className: `flex items-center justify-between p-4 rounded-2xl transition-all ${item.isHighlight || item.isTitle ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'}` 
                    },
                        h('div', { className: "flex items-center gap-4" },
                            h('div', { className: `w-3 h-3 rounded-full ${item.color} shadow-sm` }),
                            h('span', { className: `text-sm font-black ${item.isTitle ? 'text-purple-700' : item.isHighlight ? 'text-blue-700' : 'text-slate-700'}` }, item.label)
                        ),
                        h('div', { className: "flex-1 border-b-2 border-dotted border-slate-300 mx-6 opacity-40" }),
                        h('div', { className: "text-right" },
                            h('span', { className: `text-lg font-black ${item.isTitle ? 'text-purple-600' : item.isHighlight ? 'text-blue-700' : 'text-slate-800'}` },
                                "¥ ",
                                formatCurrencyLocal(item.val, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                            ),
                            item.calc && h('p', { className: "text-[10px] font-bold text-slate-400 tracking-tighter mt-1" },
                                item.calc
                            )
                        )
                    );
                }
            }),
            h('div', { className: "pt-8 mt-6 border-t-2 border-slate-100 flex justify-between items-center" },
                h('div', { className: "flex flex-col" },
                    h('span', { className: "text-xs font-black text-slate-400 italic uppercase tracking-widest" }, "LANDING-PRICE-BASE"),
                    h('span', { className: "text-xl font-black text-slate-800 italic" }, "落地基础成本价")
                ),
                h('span', { className: "text-4xl font-black text-[#1a2b4b] drop-shadow-sm" },
                    "¥ ",
                    formatCurrencyLocal(results.baseLandingPrice, { minimumFractionDigits: 2 })
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.CostBreakdown = CostBreakdown;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
