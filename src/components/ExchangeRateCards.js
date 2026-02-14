/**
 * ExchangeRateCards 组件 - 汇率信息卡片
 */
function ExchangeRateCards({
    exchangeRate, 
    setExchangeRate, 
    usdCnyRate, 
    setUsdCnyRate
}) {
    const h = React.createElement;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    // 如果没有 formatCurrency，使用默认实现
    const formatCurrencyLocal = formatCurrency || ((value, options = {}) => {
        const { maximumFractionDigits = 2 } = options;
        return value.toLocaleString(undefined, { maximumFractionDigits });
    });
    
    return h('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
        // CNY/RUB 汇率卡片
        h('div', { className: "bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow" },
            h('div', { className: "w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-inner" }, 
                h(Icon, { name: 'Globe', size: 24 })
            ),
            h('div', null,
                h('p', { className: "text-xs text-blue-400 font-medium tracking-tight uppercase" }, "汇率 (CNY/RUB)"),
                h('input', {
                    type: "number",
                    value: exchangeRate === 0 ? '' : exchangeRate,
                    onChange: (e) => {
                        const val = e.target.value;
                        setExchangeRate(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "text-2xl font-bold w-full bg-transparent outline-none focus:text-blue-600 transition-colors"
                })
            )
        ),
        
        // USD/CNY 汇率卡片
        h('div', { className: "bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow" },
            h('div', { className: "w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400" }, 
                h(Icon, { name: 'TrendingUp', size: 24 })
            ),
            h('div', null,
                h('p', { className: "text-xs text-slate-400 font-medium tracking-tight uppercase" }, "汇率 (USD/CNY)"),
                h('input', {
                    type: "number",
                    value: usdCnyRate === 0 ? '' : usdCnyRate,
                    onChange: (e) => {
                        const val = e.target.value;
                        setUsdCnyRate(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "text-2xl font-bold w-full bg-transparent outline-none focus:text-blue-600 transition-colors"
                })
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
