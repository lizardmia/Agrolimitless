/**
 * OverseaSection 组件 - 海外段参数输入
 */
function OverseaSection({
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
}) {
    const h = React.createElement;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    // 如果没有 formatCurrency，使用默认实现
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { maximumFractionDigits });
    });
    
    return h('div', { className: "bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3 shadow-sm" },
        h('div', { className: "flex justify-between items-center mb-2" },
            h('h4', { className: "text-sm font-bold text-orange-600 flex items-center gap-2 italic uppercase tracking-wider underline decoration-orange-200 decoration-2 underline-offset-4" },
                h(Icon, { name: 'Globe', size: 14 }),
                " 1. 海外段计算参数"
            ),
            h('button', {
                onClick: () => {
                    if (typeof window !== 'undefined' && window.openFarmPriceReverseModal) {
                        window.openFarmPriceReverseModal();
                    } else {
                        console.warn('openFarmPriceReverseModal 函数未找到');
                    }
                },
                className: "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap",
                title: "倒推农场采购价"
            },
                h(Icon, { name: 'Calculator', size: 14 }),
                "倒推采购价"
            )
        ),
        h('div', { className: "space-y-2" },
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold uppercase tracking-tighter" }, "农场采购价 (RUB/t)"),
                h('input', {
                    type: "number",
                    value: farmPriceRub === 0 ? '' : farmPriceRub,
                    onChange: e => {
                        const val = e.target.value;
                        setFarmPriceRub(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                })
            ),
            h('div', { className: "grid grid-cols-2 gap-2" },
                h('div', null,
                    h('div', { className: "flex justify-between items-center mb-1" },
                        h('label', { className: "text-[10px] text-slate-400 font-bold" }, "短驳费1"),
                        h('button', {
                            onClick: () => setUnit1(unit1 === 'RUB/t' ? 'RUB/柜' : 'RUB/t'),
                            className: "text-[8px] bg-orange-100 px-1 rounded font-bold text-orange-600"
                        }, unit1)
                    ),
                    h('input', {
                        type: "number",
                        value: overseaLogistics1 === 0 ? '' : overseaLogistics1,
                        onChange: e => {
                            const val = e.target.value;
                            setOverseaLogistics1(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                    })
                ),
                h('div', null,
                    h('div', { className: "flex justify-between items-center mb-1" },
                        h('label', { className: "text-[10px] text-slate-400 font-bold" }, "短驳费2"),
                        h('button', {
                            onClick: () => setUnit2(unit2 === 'RUB/t' ? 'RUB/柜' : 'RUB/t'),
                            className: "text-[8px] bg-orange-100 px-1 rounded font-bold text-orange-600"
                        }, unit2)
                    ),
                    h('input', {
                        type: "number",
                        value: overseaLogistics2 === 0 ? '' : overseaLogistics2,
                        onChange: e => {
                            const val = e.target.value;
                            setOverseaLogistics2(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                    })
                )
            ),
            h('div', { className: "space-y-2" },
                // 添加按钮（固定在顶部）
                h('button', {
                    onClick: addExportExtra,
                    className: "w-full bg-white/60 p-2 rounded-xl border border-dashed border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-sm flex items-center justify-center gap-2 text-orange-500 hover:text-orange-600"
                },
                    h(Icon, { name: 'Plus', size: 14 }),
                    h('span', { className: "text-[10px] font-black" }, "添加海外杂费")
                ),
                // 海外杂费列表（可滚动容器）
                h('div', { 
                    className: "max-h-64 overflow-y-auto space-y-2 pr-1 scrollable-list"
                },
                    exportExtras.map(item =>
                        h('div', { key: item.id, className: "bg-white/60 p-2 rounded-xl border border-orange-50 space-y-2 shadow-sm hover:shadow-md transition-shadow" },
                            h('div', { className: "flex gap-2 items-center" },
                                h('input', {
                                    type: "text",
                                    value: item.name,
                                    onChange: e => updateExportExtra(item.id, 'name', e.target.value),
                                    placeholder: "费用项目",
                                    className: "flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                }),
                                h('button', {
                                    onClick: () => deleteExportExtra(item.id),
                                    className: "text-slate-300 hover:text-rose-400 transition-colors p-1 hover:bg-rose-50 rounded"
                                }, h(Icon, { name: 'Trash2', size: 14 }))
                            ),
                            h('div', { className: "flex gap-2 items-center" },
                                h('input', {
                                    type: "number",
                                    value: item.value === '' ? '' : item.value,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateExportExtra(item.id, 'value', val === '' ? '' : Number(val));
                                    },
                                    placeholder: "0",
                                    className: "flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-orange-800 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                }),
                                h('button', {
                                    onClick: () => toggleExportExtraUnit(item.id),
                                    className: `px-2 py-1.5 rounded-lg text-[10px] font-black border transition-all ${item.unit === 'RUB/container' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`
                                }, item.unit === 'RUB/container' ? 'RUB/柜' : 'RUB/t')
                            )
                        )
                    )
                )
            ),
            // 海外到站预估卡片
            h('div', { className: "bg-white p-4 rounded-xl border border-orange-200 shadow-sm mt-3" },
                h('div', { className: "flex items-center gap-3" },
                    h('div', { className: "w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 flex-shrink-0" }, 
                        h(Icon, { name: 'MapPin', size: 20 })
                    ),
                    h('div', { className: "flex-1" },
                        h('p', { className: "text-[10px] text-slate-400 font-medium tracking-tight mb-1" }, "海外到站预估"),
                        h('div', { className: "flex flex-col" },
                            h('p', { className: "text-xl font-bold leading-none text-orange-700" },
                                formatCurrencyLocal(russianArrivalPriceRub, { maximumFractionDigits: 0 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-1" }, " RUB/t")
                            ),
                            h('p', { className: "text-xs font-bold text-indigo-500 mt-1" },
                                "≈ ¥ ",
                                formatCurrencyLocal(russianArrivalPriceCny, { maximumFractionDigits: 2 })
                            )
                        )
                    )
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.OverseaSection = OverseaSection;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
