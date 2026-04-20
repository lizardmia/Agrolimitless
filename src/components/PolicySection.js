/**
 * PolicySection 组件 - 税收政策输入
 */
function PolicySection({
    policyName,
    setPolicyName,
    dutyRate,
    setDutyRate,
    vatRate,
    setVatRate,
    category,
    subType,
    saveStatus,
    savePolicy,
    /** 当前规格是否已在服务端/本会话保存过进口政策 */
    importSaved = false,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    const { Icon } = window;
    
    return h('div', { className: "bg-blue-50 p-4 rounded-3xl border border-blue-200 space-y-4 shadow-sm ring-4 ring-blue-50 relative overflow-hidden" },
        saveStatus && h('div', { className: "absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-black py-1 px-4 flex items-center gap-2 animate-in slide-in-from-top duration-300 z-20 shadow-lg" },
            h(Icon, { name: 'CheckCircle2', size: 12 }),
            saveStatus
        ),
        h('div', { className: "flex justify-between items-center border-b border-blue-200 pb-2" },
            h('h4', { className: "text-sm font-black text-blue-700 flex flex-wrap items-center gap-2 italic uppercase tracking-wider" },
                h(Icon, { name: 'ShieldCheck', size: 16 }),
                ` 4. ${t('importTaxPolicyTitle')}`,
                importSaved && h('span', {
                    className: "text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 border border-blue-300/80 not-italic tracking-normal normal-case",
                    title: t('policySavedBadge')
                }, t('policySavedBadge'))
            ),
            h('button', {
                onClick: savePolicy,
                className: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-lg shadow-blue-200",
                title: `${t('savePolicyTooltip')} [${subType}] ${t('taxPolicyConfig')}`
            },
                h(Icon, { name: 'Save', size: 14 }),
                h('span', { className: "text-[10px] font-bold" }, t('savePolicyButton'))
            )
        ),
        h('div', { className: "space-y-3" },
            h('div', { className: "flex flex-col gap-1" },
                h('label', { className: "text-[10px] text-blue-500 font-black uppercase tracking-widest block" }, t('policyName')),
                h('div', { className: "flex items-center gap-2" },
                    h('input', {
                        type: "text",
                        value: policyName,
                        onChange: e => setPolicyName(e.target.value),
                        className: "flex-1 p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm"
                    }),
                    h('div', { className: "group relative" },
                        h(Icon, { name: 'Info', size: 14, className: "text-blue-300 cursor-help" }),
                        h('div', { className: "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#1a2b4b] text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl border border-blue-400" },
                            `${t('clickSavePolicy')} `,
                            h('span', { className: "text-blue-300" }, `[${subType}]`),
                            ` ${t('associated')}`
                        )
                    )
                )
            ),
            h('div', { className: "grid grid-cols-2 gap-3" },
                h('div', { className: "bg-white p-3 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-colors" },
                    h('label', { className: "text-[10px] text-rose-400 font-black uppercase tracking-tighter block mb-1" }, `${t('dutyRate')} %`),
                    h('input', {
                        type: "number",
                        value: dutyRate === 0 ? '' : dutyRate,
                        onChange: e => {
                            const val = e.target.value;
                            setDutyRate(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full bg-transparent text-lg font-black text-rose-600 focus:ring-0 outline-none"
                    })
                ),
                h('div', { className: "bg-white p-3 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-colors" },
                    h('label', { className: "text-[10px] text-rose-400 font-black uppercase tracking-tighter block mb-1" }, `${t('vatRate')} %`),
                    h('input', {
                        type: "number",
                        value: vatRate === 0 ? '' : vatRate,
                        onChange: e => {
                            const val = e.target.value;
                            setVatRate(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full bg-transparent text-lg font-black text-rose-600 focus:ring-0 outline-none"
                    })
                )
            ),
            h('div', { className: "p-2 bg-blue-100/50 rounded-lg border border-blue-100" },
                h('p', { className: "text-[9px] text-blue-500 font-bold leading-tight" },
                    `${t('associatedProductStatus')}: `,
                    h('span', { className: "text-blue-700 underline" }, `${t(`category_${category}`) || category} > ${t(`subtype_${subType}`) || subType}`)
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.PolicySection = PolicySection;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
