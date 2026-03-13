/**
 * Header 组件 - 页面头部
 */
function Header({ language = 'zh', t = (key) => key }) {
    const h = React.createElement;
    const { Icon } = window;
    
    return h('div', { className: "max-w-7xl mx-auto flex justify-between items-center mb-6" },
        h('div', null,
            h('h1', { className: "text-2xl font-bold flex items-center gap-2 text-[#1a2b4b]" },
                h('div', { className: "bg-blue-600 p-1 rounded text-white" }, 
                    h(Icon, { name: 'Calculator', size: 20 })
                ),
                t('pricingDashboard')
            ),
            h('p', { className: "text-slate-400 italic text-sm underline decoration-blue-200" }, 
                t('supplyChainSystem')
            )
        ),
        h('div', { className: "flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 items-center" },
            h('div', { className: "text-right" },
                h('p', { className: "text-[10px] text-slate-400 font-bold uppercase tracking-tighter" }, t('systemStatus')),
                h('p', { className: "text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end" },
                    h(Icon, { name: 'CheckCircle2', size: 12 }),
                    ` ${t('paramsAligned')}`
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.Header = Header;
}

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.Header 访问
export { Header };
