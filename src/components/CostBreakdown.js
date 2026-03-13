/**
 * CostBreakdown 组件 - 成本拆解展示
 */
function CostBreakdown({ 
    results, 
    subType, 
    policyName,
    importPriceRub,
    exchangeRate,
    intlFreightOverseasUsd,
    intlFreightDomesticUsd,
    insuranceRate,
    usdCnyRate,
    tonsPerContainer,
    dutyRate,
    vatRate,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    
    // 确保 t 函数存在且正确工作
    // 检查 t 函数是否是默认的回退函数（返回键名本身）
    const isDefaultFallback = !t || typeof t !== 'function' || 
        (t.toString().includes('=> key') && !t.toString().includes('translations'));
    
    if (isDefaultFallback) {
        console.error(`[CostBreakdown] ❌ t 函数是默认回退函数或未传递: ${typeof t}, language: ${language}`);
        // 尝试从全局获取翻译函数（CDN 模式）
        if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.createTranslator === 'function') {
            t = window.i18n.createTranslator(language);
            console.log(`[CostBreakdown] ✅ 从 window.i18n 创建翻译函数`);
        } else {
            // 最后的回退：直接返回键名
            console.warn(`[CostBreakdown] ⚠️ 无法创建翻译函数，使用回退`);
            t = (key) => key;
        }
    }
    
    // 验证 t 函数是否正确工作
    const testKey = 'customsValue';
    const testResult = t(testKey);
    if (testResult === testKey) {
        console.error(`[CostBreakdown] ❌ 翻译失败！key="${testKey}", language="${language}", 返回键名本身`);
        console.error(`[CostBreakdown] t函数类型: ${typeof t}`);
        console.error(`[CostBreakdown] t函数源码:`, t.toString().substring(0, 200));
    } else {
        console.log(`[CostBreakdown] ✅ 翻译成功: key="${testKey}", language="${language}", result="${testResult}"`);
    }
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
            label: t('customsValue'),
            val: results.customValueCny,
            color: 'bg-purple-600',
            isTitle: true,
            calc: `(${t('importSettlementValue')} + ${t('intlFreightOverseas')}) × (1 + ${insuranceRate})`,
            children: [
                {
                    label: `${t('importSettlementValue').replace(/ \(RUB\)/g, '').replace(/ \(руб\)/gi, '')} (${t('cnyPerTon')})`,
                    val: results.importValueCny,
                    color: 'bg-orange-500',
                    calc: `${importPriceRub} / ${exchangeRate}`
                },
                {
                    label: `${t('intlFreightOverseas')}`,
                    val: results.intlFreightOverseasCnyPerTon,
                    color: 'bg-indigo-400',
                    calc: `(${intlFreightOverseasUsd} * ${usdCnyRate}) / ${tonsPerContainer}`
                },
                {
                    label: `${t('insurance')} (${t('cnyPerTon')})`,
                    val: (results.importValueCny + results.intlFreightOverseasCnyPerTon) * insuranceRate,
                    color: 'bg-purple-400',
                    calc: `(${t('importSettlementValue')} + ${t('intlFreightOverseas')}) × ${insuranceRate}`
                }
            ]
        },
        // 2. 关税 (dutyCny)
        {
            type: 'item',
            label: t('dutyTax'),
            val: results.dutyCny,
            color: 'bg-rose-500',
            calc: `${t('customsValue')} × ${(dutyRate * 100).toFixed(1)}%`
        },
        // 3. 增值税 (vatCny)
        {
            type: 'item',
            label: t('vatTax'),
            val: results.vatCny,
            color: 'bg-rose-400',
            calc: `(${t('customsValue')} + ${t('dutyTax')}) × ${(vatRate * 100).toFixed(1)}%`
        },
        // 4. 国际运费国内段 (intlFreightDomesticCnyPerTon)
        {
            type: 'item',
            label: `${t('intlFreightDomestic')} (${t('cnyPerTon')})`,
            val: results.intlFreightDomesticCnyPerTon,
            color: 'bg-indigo-300',
            calc: `(${intlFreightDomesticUsd} * ${usdCnyRate}) / ${tonsPerContainer}`
        },
        // 5. 国内物流总费用 (domesticLogisticsCnyPerTon)
        {
            type: 'group',
            label: t('domesticLogisticsTotal'),
            val: results.domesticLogisticsCnyPerTon,
            color: 'bg-blue-500',
            isHighlight: true,
            calc: `${t('domesticShortHaulFee')} + ${t('domesticExtrasTotal')}`,
            children: [
                {
                    label: t('domesticShortHaulFee'),
                    val: results.domesticLogisticsBase,
                    color: 'bg-blue-400',
                    calc: `${t('shortHaulFeeResult')} / ${tonsPerContainer}`
                },
                {
                    label: t('domesticExtrasTotal'),
                    val: results.dynamicExtrasTotal,
                    color: 'bg-blue-300',
                    calc: `Σ(${t('eachExtraItem')})`
                }
            ]
        }
    ];
    
    return h('div', { className: "bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100" },
        h('h4', { className: "text-sm font-bold text-slate-800 mb-8 flex justify-between items-center italic" },
            h('span', { className: "flex items-center gap-2" },
                h('div', { className: "w-1.5 h-6 bg-blue-600 rounded-full" }),
                ` ${t('auditCostBreakdown')} (${t('cnyPerTon')})`
            ),
            h('span', { className: "text-[10px] text-slate-400 font-medium tracking-tight" },
                `${t('boundProduct')}: `,
                h('b', { className: "text-blue-600" }, t(`subtype_${subType}`) || subType),
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
                    h('span', { className: "text-xs font-black text-slate-400 italic uppercase tracking-widest" }, t('baseLandingPrice').toUpperCase().replace(/\s/g, '-')),
                    h('span', { className: "text-xl font-black text-slate-800 italic" }, t('baseLandingPrice'))
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

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.CostBreakdown 访问
export { CostBreakdown };
