/**
 * OverseaSection 组件 - 海外段参数输入
 */
function OverseaSection({
    farmPriceRub,
    setFarmPriceRub,
    shortHaulDistanceKm,
    setShortHaulDistanceKm,
    shortHaulPricePerKmPerContainer,
    setShortHaulPricePerKmPerContainer,
    exportExtras,
    addExportExtra,
    deleteExportExtra,
    updateExportExtra,
    toggleExportExtraUnit,
    tonsPerContainer,
    russianArrivalPriceRub,
    russianArrivalPriceCny
}) {
    const h = React.createElement;
    const { useState, useEffect, useRef } = React;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    // 物损比提示框显示状态
    const [showLossRatioTooltip, setShowLossRatioTooltip] = useState(false);
    const tooltipRef = useRef(null);
    
    // 点击外部区域关闭提示框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowLossRatioTooltip(false);
            }
        };
        
        if (showLossRatioTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLossRatioTooltip]);
    
    // 如果没有 formatCurrency，使用默认实现
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { maximumFractionDigits });
    });
    
    // 计算短驳费（每吨，RUB/t）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    const shortHaulFeePerTon = tonsPerContainer > 0 ? shortHaulFeePerContainer / tonsPerContainer : 0;
    
    // 计算物损比
    const lossRatio = russianArrivalPriceRub > 0 ? (shortHaulFeePerTon / russianArrivalPriceRub) * 100 : 0;
    
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
            h('div', { className: "bg-white p-3 rounded-xl border border-orange-200 shadow-sm" },
                h('div', { className: "text-[10px] text-orange-600 font-black uppercase tracking-tighter mb-2" }, "短驳费计算"),
                h('div', { className: "grid grid-cols-2 gap-3" },
                    h('div', null,
                        h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, "公里数"),
                        h('input', {
                            type: "number",
                            value: shortHaulDistanceKm === 0 ? '' : shortHaulDistanceKm,
                            onChange: e => {
                                const val = e.target.value;
                                setShortHaulDistanceKm(val === '' ? 0 : Number(val));
                            },
                            placeholder: "0",
                            className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, "每公里每柜价格 (RUB)"),
                        h('input', {
                            type: "number",
                            value: shortHaulPricePerKmPerContainer === 0 ? '' : shortHaulPricePerKmPerContainer,
                            onChange: e => {
                                const val = e.target.value;
                                setShortHaulPricePerKmPerContainer(val === '' ? 0 : Number(val));
                            },
                            placeholder: "0",
                            className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                        })
                    )
                ),
                h('div', { className: "mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100" },
                    h('div', { className: "flex justify-between items-center" },
                        h('span', { className: "text-[9px] text-orange-600 font-bold" }, "短驳费:"),
                        h('span', { className: "text-sm font-black text-orange-800" },
                            formatCurrencyLocal(shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer, { maximumFractionDigits: 2 }),
                            " RUB/柜"
                        )
                    ),
                    h('p', { className: "text-[8px] text-slate-400 mt-1" },
                        "计算公式: 公里数 × 2 × 每公里每柜价格"
                    )
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
                    h('div', { className: "flex-1 relative", ref: tooltipRef },
                        h('div', { className: "flex items-center gap-2 mb-1" },
                            h('p', { className: "text-[10px] text-slate-400 font-medium tracking-tight" }, "海外到站预估"),
                            h('div', { className: "flex items-center gap-1" },
                                h('p', { className: "text-[10px] text-orange-500 font-bold" }, "物损比"),
                                h('button', {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        setShowLossRatioTooltip(!showLossRatioTooltip);
                                    },
                                    className: `text-slate-400 hover:text-orange-500 transition-colors cursor-pointer flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-50 ${showLossRatioTooltip ? 'text-orange-500 bg-orange-50' : ''}`,
                                    title: "查看物损比详情"
                                },
                                    h(Icon, { name: 'Info', size: 14 })
                                )
                            ),
                            showLossRatioTooltip && h('div', { 
                                className: "absolute top-6 left-0 z-50 bg-[#1a2b4b] text-white p-3 rounded-lg shadow-xl border border-orange-400 min-w-[200px]",
                                style: { zIndex: 50 },
                                onClick: (e) => e.stopPropagation()
                            },
                                h('div', { className: "text-[10px] font-bold mb-2 text-orange-300" }, "物损比"),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    "短驳费（每吨）: ",
                                    h('span', { className: "text-white font-bold" }, 
                                        formatCurrencyLocal(shortHaulFeePerTon, { maximumFractionDigits: 2 }),
                                        " RUB/t"
                                    )
                                ),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    "海外到站预估: ",
                                    h('span', { className: "text-white font-bold" },
                                        formatCurrencyLocal(russianArrivalPriceRub, { maximumFractionDigits: 2 }),
                                        " RUB/t"
                                    )
                                ),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    "计算公式: 短驳费 ÷ 海外到站预估"
                                ),
                                h('div', { className: "text-xs font-black text-orange-300 mt-2 pt-2 border-t border-orange-500" },
                                    "物损比: ",
                                    h('span', { className: "text-white" },
                                        formatCurrencyLocal(lossRatio, { maximumFractionDigits: 2 }),
                                        "%"
                                    )
                                )
                            )
                        ),
                        h('div', { className: "flex flex-col" },
                            h('p', { className: "text-xl font-bold leading-none text-orange-700" },
                                formatCurrencyLocal(russianArrivalPriceRub, { maximumFractionDigits: 0 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-1" }, " RUB/t")
                            ),
                            h('p', { className: "text-xs font-bold text-indigo-500 mt-1" },
                                "≈ ¥ ",
                                formatCurrencyLocal(russianArrivalPriceCny, { maximumFractionDigits: 2 })
                            ),
                            h('p', { className: "text-xs font-bold text-orange-600 mt-1" },
                                "物损比: ",
                                h('span', { className: "text-orange-700" },
                                    formatCurrencyLocal(lossRatio, { maximumFractionDigits: 2 }),
                                    "%"
                                )
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
