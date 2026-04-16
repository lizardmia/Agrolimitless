/**
 * OverseaSection 组件 - 海外段参数输入
 */

/** 价内税：从含税金额中拆分出的增值税（仅展示，不参与到站预估等计算） */
function vatFromInclusiveRub(amountRub, ratePercent) {
    const a = Number(amountRub) || 0;
    const r = Number(ratePercent) || 0;
    if (a <= 0 || r <= 0) return 0;
    const rp = r / 100;
    return (a * rp) / (1 + rp);
}

function OverseaSection({
    overseaModules,
    setOverseaModules,
    exportExtras,
    addExportExtra,
    deleteExportExtra,
    updateExportExtra,
    toggleExportExtraUnit,
    tonsPerContainer,
    russianArrivalPriceRub,
    russianArrivalPriceCny,
    baseRussianArrivalPriceRub,
    exportVatRebateRub = 0,
    exportDutyRub = 0,
    exportDutyRate = 0,
    /** 与出口板块政策「出口增值税 %」挂钩，用于农场采购价价内税展示 */
    exportVatRate = 10,
    // 新增：期望盈利、短驳关税选项、出口价格
    expectedProfitPercent = 0,
    setExpectedProfitPercent,
    includeShortHaulInDuty = true,
    setIncludeShortHaulInDuty,
    exportPriceRub = 0,
    setExportPriceRub,
    suggestedFarmPriceRub = 0,
    suggestedExportPriceRub = 0,
    suggestedExportDutyRub = 0,
    effectiveDutyBaseRub = 0,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    const { useState, useEffect, useRef } = React;
    const { Icon } = window;
    const { formatCurrency } = window.calculations || {};
    
    // 组件内计算每吨成本基础（用于每吨期望盈利显示）
    const tpc = tonsPerContainer || 1;
    const modList = Array.isArray(overseaModules) ? overseaModules : [];

    const updateModule = (id, partial) => {
        if (!setOverseaModules) return;
        setOverseaModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...partial } : m)));
    };
    const addModule = () => {
        if (!setOverseaModules) return;
        setOverseaModules((prev) => [
            ...prev,
            { id: Date.now(), farmPriceRub: 0, shortHaulDistanceKm: 0, shortHaulPricePerKmPerContainer: 0, shortHaulVatRate: 0 }
        ]);
    };
    const removeModule = (id) => {
        if (!setOverseaModules) return;
        setOverseaModules((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
    };

    const farmPriceRubSum = modList.reduce((s, m) => s + (Number(m.farmPriceRub) || 0), 0);
    const shortHaulFeePerTonDisplay = modList.reduce((s, m) => {
        const km = Number(m.shortHaulDistanceKm) || 0;
        const pp = Number(m.shortHaulPricePerKmPerContainer) || 0;
        return s + (km * 2 * pp) / tpc;
    }, 0);
    const exportExtrasTotalDisplay = exportExtras.reduce((sum, item) => {
        const v = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? v : v / tpc);
    }, 0);
    const costBase = farmPriceRubSum + shortHaulFeePerTonDisplay + exportExtrasTotalDisplay;

    const farmPurchaseVatRatePct = Math.max(0, Number(exportVatRate) || 0);
    let farmVatDisplaySum = 0;
    let shortHaulVatDisplaySum = 0;
    modList.forEach((m) => {
        const fp = Number(m.farmPriceRub) || 0;
        if (fp > 0 && farmPurchaseVatRatePct > 0) {
            farmVatDisplaySum += vatFromInclusiveRub(fp, farmPurchaseVatRatePct);
        }
        const km = Number(m.shortHaulDistanceKm) || 0;
        const pp = Number(m.shortHaulPricePerKmPerContainer) || 0;
        const shPerTon = (km * 2 * pp) / tpc;
        const shVr = Number(m.shortHaulVatRate) || 0;
        if (shPerTon > 0 && shVr > 0) {
            shortHaulVatDisplaySum += vatFromInclusiveRub(shPerTon, shVr);
        }
    });
    const extrasVatDisplaySum = exportExtras.reduce((sum, item) => {
        const num = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        const perTon = item.unit === 'RUB/ton' ? num : num / tpc;
        const vr = item.vatRate === undefined || item.vatRate === '' ? 0 : Number(item.vatRate) || 0;
        return sum + vatFromInclusiveRub(perTon, vr);
    }, 0);
    const displayVatSumRub = farmVatDisplaySum + shortHaulVatDisplaySum + extrasVatDisplaySum;
    // 每吨期望盈利 = 建议出口价 - costBase
    const profitPerTon = suggestedExportPriceRub > 0
        ? suggestedExportPriceRub - costBase
        : 0;

    // 从每吨盈利反推百分点
    // 包含短驳：profit = costBase*(m+r)/(1-r)  => m = profit*(1-r)/costBase - r
    // 不含短驳：P = (costBase*(1+m) - shortHaul*r)/(1-r)，profit = P - costBase
    //   => profit*(1-r) = costBase*(1+m) - shortHaul*r - costBase*(1-r)
    //   => profit*(1-r) = costBase*m + costBase*r - shortHaul*r
    //   => m = [profit*(1-r) - r*(costBase - shortHaul)] / costBase
    const calcPercentFromProfit = (profit) => {
        if (costBase <= 0) return 0;
        const r = exportDutyRate / 100;
        let m;
        if (includeShortHaulInDuty) {
            m = (profit * (1 - r)) / costBase - r;
        } else {
            m = (profit * (1 - r) - r * (costBase - shortHaulFeePerTonDisplay)) / costBase;
        }
        return Math.round(m * 10000) / 100; // 保留2位小数，允许负值
    };
    // 保本最低每吨盈利（令 m=0 时的 profit）
    // 包含短驳：minProfit = costBase * r / (1-r)
    // 不含短驳：minProfit = r * (costBase - shortHaulFeePerTonDisplay) / (1-r)
    const _r = exportDutyRate / 100;
    const minBreakEvenProfit = costBase > 0 && _r < 1
        ? (includeShortHaulInDuty
            ? _r * costBase / (1 - _r)
            : _r * (costBase - shortHaulFeePerTonDisplay) / (1 - _r))
        : 0;
    
    // 每吨盈利输入框本地 state，与 profitPerTon 联动
    const [profitPerTonInput, setProfitPerTonInput] = React.useState('');
    // 标记是否由用户主动输入每吨盈利（防止循环覆盖）
    const isUserEditingProfit = React.useRef(false);

    // 当百分点驱动的 profitPerTon 变化时，同步到输入框（仅在非用户输入时）
    React.useEffect(() => {
        if (isUserEditingProfit.current) return;
        if (profitPerTon > 0) {
            setProfitPerTonInput(String(Math.round(profitPerTon)));
        } else if (expectedProfitPercent === 0) {
            setProfitPerTonInput('');
        }
    }, [profitPerTon, expectedProfitPercent]);
    const [showLossRatioTooltip, setShowLossRatioTooltip] = useState(false);
    const [openVatDetail, setOpenVatDetail] = useState(null);
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
    
    const shortHaulFeePerTon = shortHaulFeePerTonDisplay;
    
    // 计算物损比
    const lossRatio = russianArrivalPriceRub > 0 ? (shortHaulFeePerTon / russianArrivalPriceRub) * 100 : 0;
    
    return h('div', { className: "bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3 shadow-sm" },
        h('div', { className: "flex justify-between items-center mb-2" },
            h('h4', { className: "text-sm font-bold text-orange-600 flex items-center gap-2 italic uppercase tracking-wider underline decoration-orange-200 decoration-2 underline-offset-4" },
                h(Icon, { name: 'Globe', size: 14 }),
                ` 1. ${t('overseaSection')}`
            ),
            h('button', {
                onClick: () => {
                    if (typeof window !== 'undefined' && window.openFarmPriceReverseModal) {
                        window.openFarmPriceReverseModal();
                    } else {
                        console.warn('openFarmPriceReverseModal 函数未找到');
                    }
                },
                className: `bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${language === 'zh' ? 'whitespace-nowrap' : 'whitespace-normal leading-tight'}`,
                title: t('reverseFarmPrice')
            },
                h(Icon, { name: 'Calculator', size: 14 }),
                language === 'ru' ? [
                    'Обратный',
                    h('br', { key: 'br' }),
                    'расчет'
                ] : language === 'en' ? [
                    'Reverse',
                    h('br', { key: 'br' }),
                    'Purchase Price'
                ] : t('reversePurchasePrice')
            )
        ),
        h('div', { className: "space-y-2" },
            h('p', { className: "text-[9px] text-slate-500 italic" }, t('vatDisplayOnlyNote')),
            modList.map((mod, modIdx) => {
                const km = Number(mod.shortHaulDistanceKm) || 0;
                const pp = Number(mod.shortHaulPricePerKmPerContainer) || 0;
                const feePerContainer = km * 2 * pp;
                const shPerTon = feePerContainer / tpc;
                const farmP = Number(mod.farmPriceRub) || 0;
                const shVat = Number(mod.shortHaulVatRate) || 0;
                const showFarmD = openVatDetail === `${mod.id}-farm`;
                const showHaulD = openVatDetail === `${mod.id}-haul`;
                const vatPerTonHaul = shPerTon > 0 && shVat > 0 ? vatFromInclusiveRub(shPerTon, shVat) : 0;
                return h('div', { key: mod.id, className: "rounded-xl border border-orange-200 bg-white/70 p-3 space-y-2 shadow-sm" },
                    modList.length > 1 && h('div', { className: "flex justify-between items-center mb-1" },
                        h('span', { className: "text-[10px] font-bold text-orange-700" },
                            `${t('farmHaulModuleTitle')} ${modIdx + 1}`
                        ),
                        h('button', {
                            type: 'button',
                            onClick: () => removeModule(mod.id),
                            className: "text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                        }, t('removeFarmHaulModule'))
                    ),
                    h('div', null,
                        h('label', { className: "text-[10px] text-slate-500 font-bold uppercase tracking-tighter" }, `${t('farmPurchasePrice')} (RUB/t)`),
                        h('input', {
                            type: "number",
                            value: farmP === 0 ? '' : farmP,
                            onChange: e => {
                                const val = e.target.value;
                                updateModule(mod.id, { farmPriceRub: val === '' ? 0 : Number(val) });
                            },
                            placeholder: "0",
                            className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                        }),
                        farmP > 0 && h('div', { className: "mt-1.5 p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 space-y-1" },
                            h('div', { className: "flex justify-between items-center gap-2 text-[10px]" },
                                h('span', { className: "text-emerald-800 font-bold" },
                                    `${t('vatDisplayFarm')} (${t('vatRateLinkedExport')}: ${farmPurchaseVatRatePct}%)`
                                ),
                                h('span', { className: "text-emerald-700 font-black" },
                                    farmPurchaseVatRatePct > 0
                                        ? [
                                            formatCurrencyLocal(vatFromInclusiveRub(farmP, farmPurchaseVatRatePct), { maximumFractionDigits: 2 }),
                                            ` ${t('rubPerTon')}`
                                        ]
                                        : h('span', { className: "text-slate-400 font-normal" }, t('vatRateExportUnsetHint'))
                                )
                            ),
                            farmPurchaseVatRatePct > 0 && h('button', {
                                type: 'button',
                                onClick: () => setOpenVatDetail(showFarmD ? null : `${mod.id}-farm`),
                                className: "text-[9px] text-emerald-600 underline font-bold"
                            }, showFarmD ? t('vatCalcToggleHide') : t('vatCalcToggleShow')),
                            farmPurchaseVatRatePct > 0 && showFarmD && h('div', { className: "pt-1 border-t border-emerald-200 text-[8px] text-emerald-900 space-y-1 leading-relaxed" },
                                h('p', { className: "font-bold text-emerald-800" }, t('vatCalcDetailTitle')),
                                h('p', null, t('vatCalcStepFarmTpl').replace(/\{rate\}/g, String(farmPurchaseVatRatePct))),
                                h('p', null,
                                    '= ',
                                    formatCurrencyLocal(farmP, { maximumFractionDigits: 2 }),
                                    ` × ${farmPurchaseVatRatePct}% ÷ (100% + ${farmPurchaseVatRatePct}%) = `,
                                    formatCurrencyLocal(vatFromInclusiveRub(farmP, farmPurchaseVatRatePct), { maximumFractionDigits: 2 }),
                                    ` ${t('rubPerTon')}`
                                )
                            )
                        )
                    ),
                    h('div', { className: "bg-white p-3 rounded-xl border border-orange-200 shadow-sm" },
                        h('div', { className: "text-[10px] text-orange-600 font-black uppercase tracking-tighter mb-2" }, t('shortHaulFee')),
                        h('div', { className: "grid grid-cols-2 gap-3" },
                            h('div', null,
                                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, t('distanceKm')),
                                h('input', {
                                    type: "number",
                                    value: km === 0 ? '' : km,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateModule(mod.id, { shortHaulDistanceKm: val === '' ? 0 : Number(val) });
                                    },
                                    placeholder: "0",
                                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                })
                            ),
                            h('div', null,
                                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, t('pricePerKmPerContainer')),
                                h('input', {
                                    type: "number",
                                    value: pp === 0 ? '' : pp,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateModule(mod.id, { shortHaulPricePerKmPerContainer: val === '' ? 0 : Number(val) });
                                    },
                                    placeholder: "0",
                                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                })
                            )
                        ),
                        h('div', { className: "mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100" },
                            h('div', { className: "flex justify-between items-center" },
                                h('span', { className: "text-[9px] text-orange-600 font-bold" }, `${t('shortHaulFeeResult')}:`),
                                h('span', { className: "text-sm font-black text-orange-800" },
                                    formatCurrencyLocal(feePerContainer, { maximumFractionDigits: 2 }),
                                    ` ${t('rubPerContainer')}`
                                )
                            ),
                            h('p', { className: "text-[8px] text-slate-400 mt-1" },
                                `${t('calculationFormula')}: ${t('distanceKm')} × 2 × ${t('pricePerKmPerContainer')}`
                            )
                        ),
                        h('div', { className: "mt-2 space-y-1.5" },
                            h('label', { className: "text-[9px] text-slate-600 font-bold block" }, `${t('shortHaulVatRateLabel')} (%)`),
                            h('div', { className: "flex items-center gap-2" },
                                h('input', {
                                    type: "number",
                                    min: 0,
                                    step: 0.1,
                                    value: shVat === 0 ? '' : shVat,
                                    onChange: (e) => {
                                        const v = e.target.value;
                                        if (v === '') updateModule(mod.id, { shortHaulVatRate: 0 });
                                        else {
                                            const n = parseFloat(v);
                                            if (!isNaN(n) && n >= 0) updateModule(mod.id, { shortHaulVatRate: n });
                                        }
                                    },
                                    className: "w-24 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-200 outline-none",
                                    placeholder: "0"
                                }),
                                h('span', { className: "text-[10px] text-slate-500" }, '%')
                            ),
                            shPerTon > 0 && shVat > 0 && h('div', { className: "text-[10px] p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 space-y-1" },
                                h('div', { className: "flex justify-between items-center gap-2" },
                                    h('span', { className: "text-emerald-800 font-bold" }, t('vatPerTonShortHaul')),
                                    h('span', { className: "text-emerald-700 font-black" },
                                        formatCurrencyLocal(vatPerTonHaul, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    )
                                ),
                                h('button', {
                                    type: 'button',
                                    onClick: () => setOpenVatDetail(showHaulD ? null : `${mod.id}-haul`),
                                    className: "text-[9px] text-emerald-600 underline font-bold"
                                }, showHaulD ? t('vatCalcToggleHide') : t('vatCalcToggleShow')),
                                showHaulD && h('div', { className: "pt-1 border-t border-emerald-200 text-[8px] text-emerald-900 space-y-1 leading-relaxed" },
                                    h('p', { className: "font-bold text-emerald-800" }, t('vatCalcDetailTitle')),
                                    h('p', null, `① ${t('vatCalcStep1ShortHaul')}`),
                                    h('p', null,
                                        '= ',
                                        formatCurrencyLocal(km, { maximumFractionDigits: 0 }),
                                        ' × 2 × ',
                                        formatCurrencyLocal(pp, { maximumFractionDigits: 2 }),
                                        ' = ',
                                        formatCurrencyLocal(feePerContainer, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerContainer')}`
                                    ),
                                    h('p', null, `② ${t('vatCalcStep2PerTon')}`),
                                    h('p', null,
                                        '= ',
                                        formatCurrencyLocal(feePerContainer, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerContainer')} ÷ `,
                                        String(tpc),
                                        ' = ',
                                        formatCurrencyLocal(shPerTon, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    ),
                                    h('p', null, `③ ${t('vatCalcStep3Inclusive')}`),
                                    h('p', null,
                                        '= ',
                                        formatCurrencyLocal(shPerTon, { maximumFractionDigits: 2 }),
                                        ` × ${shVat}% ÷ (100% + ${shVat}%) = `,
                                        formatCurrencyLocal(vatPerTonHaul, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    )
                                )
                            )
                        )
                    )
                );
            }),
            h('button', {
                type: 'button',
                onClick: addModule,
                className: "w-full bg-white/60 p-2 rounded-xl border border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all shadow-sm flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700"
            },
                h(Icon, { name: 'Plus', size: 14 }),
                h('span', { className: "text-[10px] font-black" }, t('addFarmHaulModule'))
            ),
            h('div', { className: "space-y-2" },
                // 添加按钮（固定在顶部）
                h('button', {
                    onClick: addExportExtra,
                    className: "w-full bg-white/60 p-2 rounded-xl border border-dashed border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-sm flex items-center justify-center gap-2 text-orange-500 hover:text-orange-600"
                },
                    h(Icon, { name: 'Plus', size: 14 }),
                    h('span', { className: "text-[10px] font-black" }, t('addOverseasExtra'))
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
                                    placeholder: t('extraItemName'),
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
                                }, item.unit === 'RUB/container' ? t('rubPerContainer') : t('rubPerTon'))
                            ),
                            (() => {
                                const num = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
                                const perTon = item.unit === 'RUB/ton' ? num : num / tpc;
                                const vr = item.vatRate === undefined || item.vatRate === '' ? 0 : Number(item.vatRate) || 0;
                                const extraVat = vatFromInclusiveRub(perTon, vr);
                                return h('div', { className: "space-y-1" },
                                    h('div', { className: "flex flex-wrap gap-2 items-center" },
                                        h('label', { className: "text-[9px] text-slate-500 font-bold" }, `${t('extraVatRateLabel')} (%)`),
                                        h('input', {
                                            type: "number",
                                            min: 0,
                                            step: 0.1,
                                            value: vr === 0 ? '' : vr,
                                            onChange: (e) => {
                                                const v = e.target.value;
                                                if (v === '') updateExportExtra(item.id, 'vatRate', 0);
                                                else {
                                                    const n = parseFloat(v);
                                                    if (!isNaN(n) && n >= 0) updateExportExtra(item.id, 'vatRate', n);
                                                }
                                            },
                                            className: "w-20 p-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none",
                                            placeholder: "0"
                                        }),
                                        perTon > 0 && vr > 0 && h('span', { className: "text-[10px] text-emerald-700 font-bold ml-auto" },
                                            `${t('vatPerTonExtra')}: `,
                                            formatCurrencyLocal(extraVat, { maximumFractionDigits: 2 }),
                                            ` ${t('rubPerTon')}`
                                        )
                                    ),
                                    perTon > 0 && vr > 0 && h('details', { className: "text-[8px] text-emerald-900 border-t border-emerald-100 pt-1 mt-1" },
                                        h('summary', { className: "cursor-pointer text-emerald-600 font-bold" }, t('vatCalcDetailTitle')),
                                        item.unit === 'RUB/container' && h('p', { className: "mt-1 text-slate-600" },
                                            `① ${t('vatCalcExtraPerTonFromContainer')}: `,
                                            formatCurrencyLocal(num, { maximumFractionDigits: 2 }),
                                            ` ${t('rubPerContainer')} ÷ ${tpc} = `,
                                            formatCurrencyLocal(perTon, { maximumFractionDigits: 2 }),
                                            ` ${t('rubPerTon')}`
                                        ),
                                        h('p', { className: "mt-1" }, t('vatCalcStepExtra')),
                                        h('p', null,
                                            '= ',
                                            formatCurrencyLocal(perTon, { maximumFractionDigits: 2 }),
                                            ` × ${vr}% ÷ (100% + ${vr}%) = `,
                                            formatCurrencyLocal(extraVat, { maximumFractionDigits: 2 }),
                                            ` ${t('rubPerTon')}`
                                        )
                                    )
                                );
                            })()
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
                            h('p', { className: "text-[10px] text-slate-400 font-medium tracking-tight" }, t('overseasArrivalEstimate')),
                            h('div', { className: "flex items-center gap-1" },
                                h('p', { className: "text-[10px] text-orange-500 font-bold" }, t('lossRatio')),
                                h('button', {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        setShowLossRatioTooltip(!showLossRatioTooltip);
                                    },
                                    className: `text-slate-400 hover:text-orange-500 transition-colors cursor-pointer flex items-center justify-center w-4 h-4 rounded-full hover:bg-orange-50 ${showLossRatioTooltip ? 'text-orange-500 bg-orange-50' : ''}`,
                                    title: t('viewLossRatioDetails')
                                },
                                    h(Icon, { name: 'Info', size: 14 })
                                )
                            ),
                            showLossRatioTooltip && h('div', { 
                                className: "absolute top-6 left-0 z-50 bg-[#1a2b4b] text-white p-3 rounded-lg shadow-xl border border-orange-400 min-w-[200px]",
                                style: { zIndex: 50 },
                                onClick: (e) => e.stopPropagation()
                            },
                                h('div', { className: "text-[10px] font-bold mb-2 text-orange-300" }, t('lossRatio')),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    `${t('shortHaulFeePerTon')}: `,
                                    h('span', { className: "text-white font-bold" }, 
                                        formatCurrencyLocal(shortHaulFeePerTon, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    )
                                ),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    `${t('overseasArrivalEstimate')}: `,
                                    h('span', { className: "text-white font-bold" },
                                        formatCurrencyLocal(russianArrivalPriceRub, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    )
                                ),
                                h('div', { className: "text-[9px] text-slate-300 mb-1" },
                                    t('lossRatioFormula')
                                ),
                                h('div', { className: "text-xs font-black text-orange-300 mt-2 pt-2 border-t border-orange-500" },
                                    `${t('lossRatio')}: `,
                                    h('span', { className: "text-white" },
                                        formatCurrencyLocal(lossRatio, { maximumFractionDigits: 2 }),
                                        "%"
                                    )
                                )
                            )
                        ),
                        // 海外到站预估（农场采购价 + 短驳费 + 海外杂费合计）
                        h('div', { className: "flex flex-col gap-2" },
                            h('div', { className: "bg-orange-50 rounded-lg px-2 py-1.5 border border-orange-100" },
                                h('div', { className: "flex items-baseline gap-1" },
                                    h('span', { className: "text-xl font-black text-orange-700 leading-none" },
                                        formatCurrencyLocal(baseRussianArrivalPriceRub ?? russianArrivalPriceRub, { maximumFractionDigits: 0 })
                                    ),
                                    h('span', { className: "text-[9px] text-slate-400 font-normal" }, ` ${t('rubPerTon')}`)
                                ),
                                h('p', { className: "text-xs font-bold text-indigo-500 mt-0.5" },
                                    "≈ ¥ ",
                                    formatCurrencyLocal(russianArrivalPriceCny, { maximumFractionDigits: 2 })
                                )
                            ),
                            h('p', { className: "text-xs font-bold text-orange-600" },
                                `${t('lossRatio')}: `,
                                h('span', { className: "text-orange-700" },
                                    formatCurrencyLocal(lossRatio, { maximumFractionDigits: 2 }),
                                    "%"
                                )
                            )
                        )
                    )
                ),
                // 增值税总和、关税信息
                h('div', { className: "mt-3 pt-3 border-t border-slate-200 space-y-2" },
                    h('div', { className: "flex justify-between items-center" },
                        h('div', { className: "flex-1" },
                            h('p', { className: "text-[9px] text-slate-500 font-bold mb-1" }, t('vatSumTotal')),
                            h('p', { className: "text-[8px] text-slate-400" }, t('vatSumFormula'))
                        ),
                        h('div', { className: "text-right" },
                            h('p', { className: "text-sm font-bold text-green-600" },
                                formatCurrencyLocal(displayVatSumRub, { maximumFractionDigits: 2 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-1" }, ` ${t('rubPerTon')}`)
                            )
                        )
                    ),
                    // 关税
                    h('div', { className: "flex justify-between items-center" },
                        h('div', { className: "flex-1" },
                            h('p', { className: "text-[9px] text-slate-500 font-bold mb-1" }, t('dutyTax')),
                            h('p', { className: "text-[8px] text-slate-400" }, t('dutyFormula'))
                        ),
                        h('div', { className: "text-right" },
                            h('p', { className: "text-sm font-bold text-blue-600" },
                                formatCurrencyLocal(exportDutyRub, { maximumFractionDigits: 2 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-1" }, ` ${t('rubPerTon')}`)
                            )
                        )
                    ),
                    // 增值税总和减去关税
                    h('div', { className: "flex justify-between items-center pt-2 border-t border-slate-200" },
                        h('div', { className: "flex-1" },
                            h('p', { className: "text-[9px] text-slate-600 font-bold mb-1" }, t('vatMinusDuty')),
                            h('p', { className: "text-[8px] text-slate-400" }, t('vatSumMinusDutyFormula'))
                        ),
                        h('div', { className: "text-right" },
                            h('p', { className: "text-sm font-black text-purple-600" },
                                formatCurrencyLocal(displayVatSumRub - exportDutyRub, { maximumFractionDigits: 2 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-1" }, ` ${t('rubPerTon')}`)
                            )
                        )
                    )
                )
            ),

            // ─────────────────────────────────────────────────────────────
            // 新增3个控件
            // ─────────────────────────────────────────────────────────────

            // 1. 期望盈利百分点 + 建议出口价格
            h('div', { className: "mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200" },
                // 第一行：百分点输入
                h('div', { className: "flex items-center justify-between mb-1" },
                    h('label', { className: "text-[11px] font-bold text-emerald-700" },
                        t('expectedProfitPercent'), ' (%)'
                    ),
                    h('div', { className: "flex items-center gap-1" },
                        h('input', {
                            type: 'number',
                            min: 0,
                            step: 0.1,
                            value: expectedProfitPercent,
                            onChange: (e) => {
                                const val = e.target.value;
                                if (val === '' || val === '0') {
                                    setExpectedProfitPercent && setExpectedProfitPercent(0);
                                } else {
                                    const n = parseFloat(val);
                                    if (!isNaN(n) && n >= 0) setExpectedProfitPercent && setExpectedProfitPercent(n);
                                }
                            },
                            className: "w-20 text-right text-sm border border-emerald-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400",
                            placeholder: '0'
                        }),
                        h('span', { className: "text-xs text-emerald-600" }, '%')
                    )
                ),
                // 第二行：每吨期望盈利输入框（与百分点双向联动）
                h('div', { className: "flex items-center justify-between mb-1" },
                    h('label', { className: "text-[10px] text-emerald-600" },
                        t('expectedProfitPerTon')
                    ),
                    h('div', { className: "flex items-center gap-1" },
                        h('input', {
                            type: 'number',
                            step: 10,
                            value: profitPerTonInput,
                            onChange: (e) => {
                                const val = e.target.value;
                                isUserEditingProfit.current = true;
                                setProfitPerTonInput(val);
                                if (val === '') {
                                    setExpectedProfitPercent && setExpectedProfitPercent(0);
                                } else {
                                    const n = parseFloat(val);
                                    if (!isNaN(n)) {
                                        const pct = calcPercentFromProfit(n);
                                        setExpectedProfitPercent && setExpectedProfitPercent(Math.max(0, pct));
                                    }
                                }
                                // 短暂延迟后解除标记，让 effect 可以在下次百分点变化时正常同步
                                setTimeout(() => { isUserEditingProfit.current = false; }, 300);
                            },
                            className: "w-24 text-right text-sm border border-emerald-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400",
                            placeholder: '0'
                        }),
                        h('span', { className: "text-xs text-emerald-500" }, t('rubPerTon'))
                    )
                ),
                // 保本最低利润提示（关税>0时显示）
                exportDutyRate > 0 && costBase > 0 && h('p', { className: "text-[9px] text-amber-600 mb-1" },
                    `${t('breakEvenHint') || '保本最低每吨盈利'}: `,
                    h('span', { className: "font-bold" },
                        formatCurrencyLocal(minBreakEvenProfit, { maximumFractionDigits: 0 })
                    ),
                    ` ${t('rubPerTon')}`
                ),
                // 公式说明
                h('p', { className: "text-[9px] text-emerald-500 mb-2" }, t('suggestedExportFormula')),
                // 建议出口价格结果
                suggestedExportPriceRub > 0 && h('div', { className: "pt-2 border-t border-emerald-200 space-y-1" },
                    h('div', { className: "flex items-center justify-between" },
                        h('p', { className: "text-[10px] font-bold text-emerald-700" }, t('suggestedExportPrice')),
                        h('p', { className: "text-base font-black text-emerald-800" },
                            formatCurrencyLocal(suggestedExportPriceRub, { maximumFractionDigits: 0 }),
                            h('span', { className: "text-[9px] font-normal ml-1 text-emerald-500" }, t('rubPerTon'))
                        )
                    ),
                    suggestedExportDutyRub > 0 && h('div', { className: "flex items-center justify-between" },
                        h('p', { className: "text-[9px] text-emerald-500" }, t('suggestedExportDuty')),
                        h('p', { className: "text-sm font-bold text-emerald-600" },
                            formatCurrencyLocal(suggestedExportDutyRub, { maximumFractionDigits: 0 }),
                            h('span', { className: "text-[9px] font-normal ml-1 text-emerald-400" }, t('rubPerTon'))
                        )
                    )
                )
            ),

            // 2. 关税计算是否包含短驳费
            h('div', { className: "mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200" },
                h('p', { className: "text-[11px] font-bold text-amber-700 mb-2" },
                    t('includeShortHaulInDuty')
                ),
                h('div', { className: "flex gap-4" },
                    h('label', { className: "flex items-center gap-1.5 cursor-pointer" },
                        h('input', {
                            type: 'radio',
                            name: 'includeShortHaulInDuty',
                            checked: includeShortHaulInDuty === false,
                            onChange: () => setIncludeShortHaulInDuty && setIncludeShortHaulInDuty(false),
                            className: "accent-amber-600"
                        }),
                        h('span', { className: "text-xs text-amber-800" }, t('includeShortHaulNo'))
                    ),
                    h('label', { className: "flex items-center gap-1.5 cursor-pointer" },
                        h('input', {
                            type: 'radio',
                            name: 'includeShortHaulInDuty',
                            checked: includeShortHaulInDuty === true,
                            onChange: () => setIncludeShortHaulInDuty && setIncludeShortHaulInDuty(true),
                            className: "accent-amber-600"
                        }),
                        h('span', { className: "text-xs text-amber-800" }, t('includeShortHaulYes'))
                    )
                )
            ),

            // 3. 出口价格（关税计算用）
            h('div', { className: "mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200" },
                h('div', { className: "flex items-center justify-between mb-1" },
                    h('label', { className: "text-[11px] font-bold text-blue-700" },
                        t('exportPriceForDuty')
                    ),
                    h('div', { className: "flex items-center gap-1" },
                        h('input', {
                            type: 'number',
                            min: 0,
                            step: 100,
                            value: exportPriceRub === 0 ? '' : exportPriceRub,
                            onChange: (e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setExportPriceRub && setExportPriceRub(0);
                                } else {
                                    const n = parseFloat(val);
                                    if (!isNaN(n) && n >= 0) setExportPriceRub && setExportPriceRub(n);
                                }
                            },
                            className: "w-28 text-right text-sm border border-blue-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400",
                            placeholder: t('importSettlementValue')
                        }),
                        h('span', { className: "text-xs text-blue-600" }, 'RUB/t')
                    )
                ),
                h('p', { className: "text-[9px] text-blue-500 mt-1" }, t('exportPriceForDutyHint')),
                // 显示实际关税基础价
                effectiveDutyBaseRub > 0 && h('div', { className: "flex items-center justify-between pt-2 mt-2 border-t border-blue-200" },
                    h('p', { className: "text-[10px] text-blue-600" }, t('effectiveDutyBase')),
                    h('p', { className: "text-sm font-bold text-blue-700" },
                        formatCurrencyLocal(effectiveDutyBaseRub, { maximumFractionDigits: 0 }),
                        h('span', { className: "text-[9px] font-normal ml-1 text-blue-500" }, t('rubPerTon'))
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
