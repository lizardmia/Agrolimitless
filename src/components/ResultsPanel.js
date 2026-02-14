/**
 * ResultsPanel 组件 - 结果展示面板
 */
function ResultsPanel({ results, totalContainers, setTotalContainers, tonsPerContainer, setTonsPerContainer }) {
    const h = React.createElement;
    const { formatCurrency } = window.calculations || {};
    
    // 如果没有 formatCurrency，使用默认实现
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { maximumFractionDigits });
    });
    
    return h('div', { className: "space-y-6" },
        // 核心指标卡片
        h('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            h('div', { className: "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform" },
                h('p', { className: "text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight" }, "基础单价 (不含息)"),
                h('div', { className: "flex items-baseline" },
                    h('span', { className: "text-sm font-bold mr-1 text-slate-400" }, "¥"),
                    h('span', { className: "text-2xl font-black text-[#1a2b4b] tracking-tighter" },
                        formatCurrencyLocal(results.baseLandingPrice, { maximumFractionDigits: 2 })
                    )
                )
            ),
            h('div', { className: "bg-[#1a2b4b] p-6 rounded-[2rem] shadow-xl text-white hover:scale-[1.02] transition-transform" },
                h('p', { className: "text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight" }, "总计单价 (含息)"),
                h('div', { className: "flex items-baseline" },
                    h('span', { className: "text-sm font-bold mr-1 text-slate-600" }, "¥"),
                    h('span', { className: "text-2xl font-black tracking-tighter" },
                        formatCurrencyLocal(results.fullCost, { maximumFractionDigits: 2 })
                    )
                )
            ),
            h('div', { className: "p-5 lg:p-6 rounded-xl lg:rounded-[2rem] bg-emerald-50 border border-emerald-100 shadow-sm hover:scale-[1.02] transition-transform" },
                h('p', { className: "text-emerald-700 text-[10px] mb-1 font-bold uppercase tracking-tight" }, "毛利 (不含息)"),
                h('div', { className: "text-emerald-600 flex items-baseline" },
                    h('span', { className: "text-sm font-bold mr-1" }, "¥"),
                    h('span', { className: "text-2xl font-black tracking-tighter" },
                        formatCurrencyLocal(results.profitNoInterest, { maximumFractionDigits: 0 })
                    )
                )
            ),
            h('div', { className: "p-6 rounded-[2rem] bg-blue-50 border border-blue-100 shadow-sm hover:scale-[1.02] transition-transform" },
                h('p', { className: "text-blue-700 text-[10px] mb-1 font-bold uppercase tracking-tight" }, "预计净利 (含息)"),
                h('div', { className: "text-blue-600 flex items-baseline" },
                    h('span', { className: "text-sm font-bold mr-1" }, "¥"),
                    h('span', { className: "text-2xl font-black tracking-tighter" },
                        formatCurrencyLocal(results.profitWithInterest, { maximumFractionDigits: 0 })
                    )
                )
            )
        ),
        
        // 总案核算
        h('div', { className: "bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-blue-200 gap-8" },
            h('div', { className: "flex gap-10" },
                h('div', { className: "text-center md:text-left" },
                    h('p', { className: "text-[10px] text-blue-200 mb-2 font-bold uppercase tracking-widest italic" }, "批次总柜数"),
                    h('input', {
                        type: "number",
                        value: totalContainers === 0 ? '' : totalContainers,
                        onChange: e => {
                            const val = e.target.value;
                            setTotalContainers(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "text-5xl font-black bg-transparent border-b-4 border-blue-400 w-24 outline-none text-white focus:border-white transition-all"
                    })
                ),
                h('div', { className: "text-center md:text-left" },
                    h('p', { className: "text-[10px] text-blue-200 mb-2 font-bold uppercase tracking-widest italic" }, "单柜装载 (吨)"),
                    h('input', {
                        type: "number",
                        value: tonsPerContainer === 0 ? '' : tonsPerContainer,
                        onChange: e => {
                            const val = e.target.value;
                            setTonsPerContainer(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "text-5xl font-black bg-transparent border-b-4 border-blue-400 w-24 outline-none text-white focus:border-white transition-all"
                    })
                )
            ),
            h('div', { className: "text-center md:text-right border-l-0 md:border-l border-blue-500/50 pl-0 md:pl-10" },
                h('p', { className: "text-[10px] text-blue-100 mb-2 font-black uppercase tracking-[0.2em] italic" }, "全案资金占用额度 (CNY)"),
                h('span', { className: "text-5xl font-black tabular-nums drop-shadow-lg" },
                    "¥ ",
                    formatCurrencyLocal(results.totalCapital, { maximumFractionDigits: 0 })
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.ResultsPanel = ResultsPanel;
}

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.ResultsPanel 访问
export { ResultsPanel };
