/**
 * Header 组件 - 页面头部
 */
function Header() {
    const h = React.createElement;
    const { Icon } = window;
    
    return h('div', { className: "max-w-7xl mx-auto flex justify-between items-center mb-6" },
        h('div', null,
            h('h1', { className: "text-2xl font-bold flex items-center gap-2 text-[#1a2b4b]" },
                h('div', { className: "bg-blue-600 p-1 rounded text-white" }, 
                    h(Icon, { name: 'Calculator', size: 20 })
                ),
                "Agrolimitless & Transglobe 定价看板"
            ),
            h('p', { className: "text-slate-400 italic text-sm underline decoration-blue-200" }, 
                "跨境供应链全链路核算系统"
            )
        ),
        h('div', { className: "flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 items-center" },
            h('div', { className: "text-right" },
                h('p', { className: "text-[10px] text-slate-400 font-bold uppercase tracking-tighter" }, "系统计算状态"),
                h('p', { className: "text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end" },
                    h(Icon, { name: 'CheckCircle2', size: 12 }),
                    " 参数实时对齐"
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.Header = Header;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
