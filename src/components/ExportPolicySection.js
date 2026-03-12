/**
 * ExportPolicySection 组件 - 出口板块政策
 */
function ExportPolicySection({
    exportPolicyName,
    setExportPolicyName,
    exportPolicyMode,
    setExportPolicyMode,
    exportDutyRate,
    setExportDutyRate,
    exportVatRate,
    setExportVatRate,
    exportPlanType,
    setExportPlanType,
    category,
    subType,
    exportSaveStatus,
    saveExportPolicy
}) {
    const h = React.createElement;
    const { Icon } = window;
    
    return h('div', { className: "bg-green-50 p-4 rounded-3xl border border-green-200 space-y-4 shadow-sm ring-4 ring-green-50 relative overflow-hidden" },
        exportSaveStatus && h('div', { className: "absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-black py-1 px-4 flex items-center gap-2 animate-in slide-in-from-top duration-300 z-20 shadow-lg" },
            h(Icon, { name: 'CheckCircle2', size: 12 }),
            exportSaveStatus
        ),
        h('div', { className: "flex justify-between items-center border-b border-green-200 pb-2" },
            h('h4', { className: "text-sm font-black text-green-700 flex items-center gap-2 italic uppercase tracking-wider" },
                h(Icon, { name: 'TrendingUp', size: 16 }),
                " 2. 出口板块政策"
            ),
            h('button', {
                onClick: saveExportPolicy,
                className: "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-lg shadow-green-200",
                title: `保存当前 [${subType}] 的出口政策配置`
            },
                h(Icon, { name: 'Save', size: 14 }),
                h('span', { className: "text-[10px] font-bold" }, "保存政策")
            )
        ),
        h('div', { className: "space-y-3" },
            h('div', { className: "flex flex-col gap-1" },
                h('label', { className: "text-[10px] text-green-500 font-black uppercase tracking-widest block" }, "政策名称"),
                h('input', {
                    type: "text",
                    value: exportPolicyName,
                    onChange: e => setExportPolicyName(e.target.value),
                    className: "w-full p-2.5 bg-white border border-green-200 rounded-xl text-xs font-bold text-green-800 focus:ring-2 focus:ring-green-400 outline-none transition-all shadow-sm",
                    placeholder: "出口税收政策"
                })
            ),
            
            // 规则选择（互斥）
            h('div', { className: "space-y-2" },
                h('label', { className: "text-[10px] text-green-600 font-black uppercase tracking-wider block" }, "税务规则"),
                h('div', { className: "space-y-2" },
                    // 规则1：没有关税
                    h('label', { className: "flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors" },
                        h('input', {
                            type: "radio",
                            name: "exportPolicyMode",
                            value: "no-duty",
                            checked: exportPolicyMode === 'no-duty',
                            onChange: e => setExportPolicyMode('no-duty'),
                            className: "text-green-600 focus:ring-green-500"
                        }),
                        h('div', { className: "flex-1" },
                            h('div', { className: "text-xs font-bold text-green-700" }, "规则1：无关税"),
                            h('div', { className: "text-[10px] text-green-600" }, "只有增值税退税，海外到站预估减去退税")
                        )
                    ),
                    // 规则2：有关税
                    h('label', { className: "flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors" },
                        h('input', {
                            type: "radio",
                            name: "exportPolicyMode",
                            value: "with-duty",
                            checked: exportPolicyMode === 'with-duty',
                            onChange: e => setExportPolicyMode('with-duty'),
                            className: "text-green-600 focus:ring-green-500"
                        }),
                        h('div', { className: "flex-1" },
                            h('div', { className: "text-xs font-bold text-green-700" }, "规则2：有关税"),
                            h('div', { className: "text-[10px] text-green-600" }, "减去增值税退税 + 加上关税")
                        )
                    ),
                    // 规则3：计划内/计划外
                    h('label', { className: "flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors" },
                        h('input', {
                            type: "radio",
                            name: "exportPolicyMode",
                            value: "planned",
                            checked: exportPolicyMode === 'planned',
                            onChange: e => setExportPolicyMode('planned'),
                            className: "text-green-600 focus:ring-green-500"
                        }),
                        h('div', { className: "flex-1" },
                            h('div', { className: "text-xs font-bold text-green-700" }, "规则3：计划内/计划外"),
                            h('div', { className: "text-[10px] text-green-600" }, "预留功能")
                        )
                    )
                )
            ),
            
            // 计划内/计划外选择（仅在规则3时显示）
            exportPolicyMode === 'planned' && h('div', { className: "space-y-2" },
                h('label', { className: "text-[10px] text-green-600 font-black uppercase tracking-wider block" }, "计划类型"),
                h('div', { className: "grid grid-cols-2 gap-2" },
                    h('label', { className: "flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors" },
                        h('input', {
                            type: "radio",
                            name: "exportPlanType",
                            value: "planned",
                            checked: exportPlanType === 'planned',
                            onChange: e => setExportPlanType('planned'),
                            className: "text-green-600 focus:ring-green-500"
                        }),
                        h('span', { className: "text-xs font-bold text-green-700" }, "计划内")
                    ),
                    h('label', { className: "flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors" },
                        h('input', {
                            type: "radio",
                            name: "exportPlanType",
                            value: "unplanned",
                            checked: exportPlanType === 'unplanned',
                            onChange: e => setExportPlanType('unplanned'),
                            className: "text-green-600 focus:ring-green-500"
                        }),
                        h('span', { className: "text-xs font-bold text-green-700" }, "计划外")
                    )
                )
            ),
            
            // 税率输入（根据规则显示）
            h('div', { className: "grid grid-cols-2 gap-2" },
                // 出口关税（规则2和规则3时显示）
                (exportPolicyMode === 'with-duty' || exportPolicyMode === 'planned') && h('div', { className: "bg-white p-3 rounded-2xl border border-green-100 shadow-sm hover:border-green-300 transition-colors" },
                    h('label', { className: "text-[10px] text-rose-400 font-black uppercase tracking-tighter block mb-1" }, "出口关税 %"),
                    h('input', {
                        type: "number",
                        value: exportDutyRate === 0 ? '' : exportDutyRate,
                        onChange: e => {
                            const val = e.target.value;
                            setExportDutyRate(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full bg-transparent text-lg font-black text-rose-600 focus:ring-0 outline-none"
                    })
                ),
                // 出口增值税（所有规则都显示）
                h('div', { className: "bg-white p-3 rounded-2xl border border-green-100 shadow-sm hover:border-green-300 transition-colors" },
                    h('label', { className: "text-[10px] text-rose-400 font-black uppercase tracking-tighter block mb-1" }, "出口增值税 %"),
                    h('input', {
                        type: "number",
                        value: exportVatRate === 0 ? '' : exportVatRate,
                        onChange: e => {
                            const val = e.target.value;
                            setExportVatRate(val === '' ? 0 : Number(val));
                        },
                        placeholder: "0",
                        className: "w-full bg-transparent text-lg font-black text-rose-600 focus:ring-0 outline-none"
                    })
                )
            ),
            
            h('div', { className: "p-2 bg-green-100/50 rounded-lg border border-green-100" },
                h('p', { className: "text-[9px] text-green-500 font-bold leading-tight" },
                    "关联产品状态: ",
                    h('span', { className: "text-green-700 underline" }, `${category} > ${subType}`)
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.ExportPolicySection = ExportPolicySection;
}
// ES6 模块导出（用于 Vite 构建）
export { ExportPolicySection };
