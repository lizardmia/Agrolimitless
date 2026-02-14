/**
 * FinancePanel 组件 - 资金财务杠杆核算
 */
function FinancePanel({
    collectionDays,
    setCollectionDays,
    interestRate,
    setInterestRate,
    interestExpense
}) {
    const h = React.createElement;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { minimumFractionDigits, maximumFractionDigits });
    });
    
    return h('div', { className: "bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10 hover:shadow-lg transition-shadow" },
        h('div', { className: "space-y-8" },
            h('div', { className: "flex items-center gap-4" },
                h('div', { className: "w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner" }, 
                    h(Icon, { name: 'Clock', size: 24 })
                ),
                h('h4', { className: "text-sm font-black text-slate-800 uppercase tracking-widest italic border-b-2 border-indigo-100 pb-1" }, "资金财务杠杆核算")
            ),
            h('div', { className: "space-y-5" },
                h('div', { className: "flex justify-between items-end" },
                    h('span', { className: "text-[10px] text-slate-400 font-black uppercase" }, "资金周转周期 (回款天数)"),
                    h('span', { className: "text-indigo-600 text-lg font-black" },
                        collectionDays,
                        h('span', { className: "text-[10px] font-normal uppercase" }, " Days")
                    )
                ),
                h('input', {
                    type: "range",
                    min: "0",
                    max: "150",
                    value: collectionDays,
                    onChange: e => setCollectionDays(Number(e.target.value)),
                    className: "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                })
            ),
            h('div', { className: "space-y-5" },
                h('div', { className: "flex justify-between items-end" },
                    h('span', { className: "text-[10px] text-slate-400 font-black uppercase" }, "年化利率"),
                    h('span', { className: "text-indigo-600 text-lg font-black" },
                        interestRate,
                        "% ",
                        h('span', { className: "text-[10px] font-normal uppercase" }, "APR")
                    )
                ),
                h('input', {
                    type: "range",
                    min: "0",
                    max: "15",
                    step: "0.1",
                    value: interestRate,
                    onChange: e => setInterestRate(Number(e.target.value)),
                    className: "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                })
            )
        ),
        h('div', { className: "bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-8 text-white flex flex-col items-center justify-center shadow-2xl shadow-indigo-200 relative overflow-hidden group hover:scale-[1.02] transition-transform" },
            h('div', { className: "absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform" }, 
                h(Icon, { name: 'TrendingUp', size: 120 })
            ),
            h('p', { className: "text-[10px] opacity-70 mb-3 font-black uppercase italic tracking-[0.3em] z-10 text-center" }, "资金占用财务成本 (单吨)"),
            h('div', { className: "flex items-baseline mb-6 z-10" },
                h('span', { className: "text-2xl font-bold mr-1 opacity-50" }, "¥"),
                h('span', { className: "text-6xl font-black tracking-tighter" },
                    formatCurrencyLocal(interestExpense, { minimumFractionDigits: 2 })
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.FinancePanel = FinancePanel;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
