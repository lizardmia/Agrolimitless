/**
 * DomesticSection 组件 - 国内段参数输入
 */
function DomesticSection({
    importPriceRub,
    setImportPriceRub,
    importPriceUnit,
    setImportPriceUnit,
    intlFreightOverseasUsd,
    setIntlFreightOverseasUsd,
    intlFreightDomesticUsd,
    setIntlFreightDomesticUsd,
    insuranceRate,
    setInsuranceRate,
    domesticShortHaulCny,
    setDomesticShortHaulCny,
    domesticExtras,
    addDomesticExtra,
    deleteDomesticExtra,
    updateDomesticExtra,
    toggleDomesticExtraUnit,
    sellingPriceCny,
    setSellingPriceCny,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    const { Icon } = window;
    
    return h('div', { className: "bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3 shadow-sm" },
        h('h4', { className: "text-sm font-bold text-orange-600 flex items-center gap-2 italic uppercase tracking-wider underline decoration-orange-200 decoration-2 underline-offset-4" },
            h(Icon, { name: 'Truck', size: 14 }),
            ` 3. ${t('domesticSection')}`
        ),
        h('div', { className: "space-y-3" },
            h('div', { className: "bg-white p-3 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow" },
                h('div', { className: "flex justify-between items-center mb-1 text-[10px] text-orange-400 font-black uppercase tracking-wider" },
                    h('span', null, t('importSettlementValue')),
                    h('button', {
                        onClick: () => setImportPriceUnit(importPriceUnit === 'RUB/t' ? 'RUB/柜' : 'RUB/t'),
                        className: "bg-orange-50 px-2 py-0.5 rounded text-[9px] text-orange-500 font-bold border border-orange-100"
                    }, importPriceUnit === 'RUB/t' ? t('rubPerTon') : t('rubPerContainer'))
                ),
                h('input', {
                    type: "number",
                    value: importPriceRub === 0 ? '' : importPriceRub,
                    onChange: e => {
                        const val = e.target.value;
                        setImportPriceRub(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-1 bg-transparent border-none text-xl font-black text-orange-800 focus:ring-0 outline-none"
                })
            ),
            h('div', { className: "grid grid-cols-2 gap-2" },
                h('div', null,
                    h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('chinaEuropeFreightOverseas')),
                    h('input', {
                        type: "number",
                        value: intlFreightOverseasUsd === 0 ? '' : intlFreightOverseasUsd,
                        onChange: e => {
                            const val = e.target.value;
                            setIntlFreightOverseasUsd(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none"
                    })
                ),
                h('div', null,
                    h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('chinaEuropeFreightDomestic')),
                    h('input', {
                        type: "number",
                        value: intlFreightDomesticUsd === 0 ? '' : intlFreightDomesticUsd,
                        onChange: e => {
                            const val = e.target.value;
                            setIntlFreightDomesticUsd(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none"
                    })
                )
            ),
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('insuranceRate')),
                h('input', {
                    type: "number",
                    step: "0.001",
                    value: insuranceRate === 0 ? '' : insuranceRate,
                    onChange: e => {
                        const val = e.target.value;
                        setInsuranceRate(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0.003",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none"
                }),
                h('p', { className: "text-[9px] text-slate-400 mt-1" }, t('insuranceRateDefault'))
            ),
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('domesticShortHaul')),
                h('input', {
                    type: "number",
                    value: domesticShortHaulCny === 0 ? '' : domesticShortHaulCny,
                    onChange: e => {
                        const val = e.target.value;
                        setDomesticShortHaulCny(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-orange-800 shadow-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none"
                })
            ),
            h('div', { className: "space-y-2 pt-2" },
                h('p', { className: "text-[10px] text-orange-600 font-black uppercase tracking-widest border-l-2 border-orange-300 pl-2" }, `${t('domesticExtrasDetail')} (CNY)`),
                // 添加按钮（固定在顶部）
                h('button', {
                    onClick: addDomesticExtra,
                    className: "w-full bg-white/60 p-2 rounded-xl border border-dashed border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-sm flex items-center justify-center gap-2 text-orange-500 hover:text-orange-600"
                },
                    h(Icon, { name: 'Plus', size: 14 }),
                    h('span', { className: "text-[10px] font-black" }, t('addDomesticExtra'))
                ),
                // 国内杂费列表（可滚动容器）
                h('div', { 
                    className: "max-h-64 overflow-y-auto space-y-2 pr-1 scrollable-list"
                },
                    domesticExtras.map(item =>
                        h('div', { key: item.id, className: "bg-white/60 p-2 rounded-xl border border-orange-50 space-y-2 shadow-sm hover:shadow-md transition-shadow" },
                            h('div', { className: "flex gap-2 items-center" },
                                h('input', {
                                    type: "text",
                                    value: item.name,
                                    onChange: e => updateDomesticExtra(item.id, 'name', e.target.value),
                                    placeholder: t('item'),
                                    className: "flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                }),
                                h('button', {
                                    onClick: () => deleteDomesticExtra(item.id),
                                    className: "text-slate-300 hover:text-rose-400 transition-colors p-1 hover:bg-rose-50 rounded"
                                }, h(Icon, { name: 'Trash2', size: 14 }))
                            ),
                            h('div', { className: "flex gap-2 items-center" },
                                h('input', {
                                    type: "number",
                                    value: item.value === '' ? '' : item.value,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateDomesticExtra(item.id, 'value', val === '' ? '' : Number(val));
                                    },
                                    placeholder: "0",
                                    className: "flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-orange-800 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                }),
                                h('button', {
                                    onClick: () => toggleDomesticExtraUnit(item.id),
                                    className: `px-2 py-1.5 rounded-lg text-[10px] font-black border transition-all ${item.unit === 'CNY/柜' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`
                                }, item.unit === 'CNY/柜' ? t('cnyPerContainer') : t('cnyPerTon'))
                            )
                        )
                    )
                )
            ),
            h('div', { className: "pt-2" },
                h('label', { className: "text-[10px] text-orange-700 font-black mb-1 block uppercase text-center tracking-widest italic" }, `🎯 ${t('targetSellingPrice')}`),
                h('input', {
                    type: "number",
                    value: sellingPriceCny === 0 ? '' : sellingPriceCny,
                    onChange: e => {
                        const val = e.target.value;
                        setSellingPriceCny(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-3 bg-orange-600 text-white rounded-2xl text-xl font-black text-center shadow-xl border-none ring-4 ring-orange-100 outline-none focus:scale-105 transition-transform placeholder:text-orange-300"
                })
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.DomesticSection = DomesticSection;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
