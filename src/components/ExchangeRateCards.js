/**
 * ExchangeRateCards 组件 - 汇率信息卡片
 */
function ExchangeRateCards({
    exchangeRate, 
    setExchangeRate, 
    usdCnyRate, 
    setUsdCnyRate,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    // 如果没有 formatCurrency，使用默认实现
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { maximumFractionDigits });
    });
    
    return h('div', { className: "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" },
        h('div', { className: "px-4 py-3 border-b border-slate-100 flex items-center justify-between" },
            h('p', { className: "text-xs font-black text-slate-700 uppercase tracking-wider" }, t('exchangeRate')),
            h(Icon, { name: 'Globe2', size: 16, className: "text-blue-500" })
        ),
        h('div', { className: "divide-y divide-slate-100" },
        // CNY/RUB 汇率卡片
        h('div', { className: "p-4 flex items-center gap-3 hover:bg-slate-50/60 transition-colors" },
            h('div', { className: "w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-inner shrink-0" }, 
                h(Icon, { name: 'Globe', size: 18 })
            ),
            h('div', { className: "min-w-0 flex-1" },
                h('p', { className: "text-[10px] text-blue-400 font-black tracking-wider uppercase" }, "CNY/RUB"),
                h('input', {
                    type: "number",
                    value: exchangeRate === 0 ? '' : exchangeRate,
                    onChange: (e) => {
                        const val = e.target.value;
                        setExchangeRate(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "text-xl font-black w-full bg-transparent outline-none focus:text-blue-600 transition-colors"
                })
            )
        ),
        
        // USD/CNY 汇率卡片
        h('div', { className: "p-4 flex items-center gap-3 hover:bg-slate-50/60 transition-colors" },
            h('div', { className: "w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0" }, 
                h(Icon, { name: 'TrendingUp', size: 18 })
            ),
            h('div', { className: "min-w-0 flex-1" },
                h('p', { className: "text-[10px] text-slate-400 font-black tracking-wider uppercase" }, "USD/CNY"),
                h('input', {
                    type: "number",
                    value: usdCnyRate === 0 ? '' : usdCnyRate,
                    onChange: (e) => {
                        const val = e.target.value;
                        setUsdCnyRate(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "text-xl font-black w-full bg-transparent outline-none focus:text-blue-600 transition-colors"
                })
            )
        )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.ExchangeRateCards = ExchangeRateCards;
}

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.ExchangeRateCards 访问
export { ExchangeRateCards };
