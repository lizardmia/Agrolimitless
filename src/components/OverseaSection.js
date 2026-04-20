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
    expectedProfitPerTonRub,
    setExpectedProfitPerTonRub,
    includeShortHaulInDuty = true,
    setIncludeShortHaulInDuty,
    exportPriceRub = 0,
    setExportPriceRub,
    exportPriceNoRebateRub = 0,
    setExportPriceNoRebateRub,
    suggestedFarmPriceRub = 0,
    suggestedExportPriceRub = 0,
    suggestedExportDutyRub = 0,
    effectiveDutyBaseRub = 0,
    effectiveDutyBaseNoRebateRub = 0,
    breakEvenExportPriceRub = 0,
    breakEvenExportPriceNoRebateRub = 0,
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
    // 每吨期望盈利：按「吨」锚定时 = 建议出口价 − 保本价（与 calculatePricing 一致）；否则 = 建议价 − 全栈成本
    const tonAnchorMode =
        expectedProfitPerTonRub !== undefined &&
        expectedProfitPerTonRub !== null &&
        Number.isFinite(Number(expectedProfitPerTonRub)) &&
        expectedProfitPercent === 0;
    const profitPerTon = suggestedExportPriceRub > 0
        ? (tonAnchorMode
            ? suggestedExportPriceRub - (breakEvenExportPriceRub ?? 0)
            : suggestedExportPriceRub - costBase)
        : 0;

    // 每吨盈利输入框本地 state，与 profitPerTon 联动
    const [profitPerTonInput, setProfitPerTonInput] = React.useState('');
    // 标记是否由用户主动输入每吨盈利（防止循环覆盖）
    const isUserEditingProfit = React.useRef(false);

    // 同步每吨盈利输入框：吨锚定模式显示用户填入的每吨盈利；否则跟计算出的 profitPerTon
    React.useEffect(() => {
        if (isUserEditingProfit.current) return;
        if (
            tonAnchorMode &&
            expectedProfitPerTonRub !== undefined &&
            expectedProfitPerTonRub !== null
        ) {
            setProfitPerTonInput(String(Math.round(Number(expectedProfitPerTonRub))));
            return;
        }
        if (profitPerTon > 0) {
            setProfitPerTonInput(String(Math.round(profitPerTon)));
        } else if (expectedProfitPercent === 0) {
            setProfitPerTonInput('');
        }
    }, [profitPerTon, expectedProfitPercent, tonAnchorMode, expectedProfitPerTonRub]);
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
    
    return h('div', { className: "bg-orange-50/50 p-3 rounded-xl border border-orange-100 space-y-2 shadow-sm" },
        h('div', { className: "flex justify-between items-center gap-2 mb-1" },
            h('h4', { className: "text-xs font-bold text-orange-600 flex items-center gap-1.5" },
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
                className: `bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0 ${language === 'zh' ? 'whitespace-nowrap' : 'whitespace-normal leading-tight'}`,
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
                /** 关税计算不包含短驳时：短驳费输入区置灰提示（仍可编辑，便于切回「包含」后沿用） */
                const dutyInclHaul = includeShortHaulInDuty !== false;
                return h('div', { key: mod.id, className: "rounded-lg border border-orange-200 bg-white/70 p-2 space-y-1.5 shadow-sm" },
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
                    modIdx === 0 && h('div', { className: "mb-1.5 p-1.5 w-full bg-amber-50 rounded-lg border border-amber-200 flex flex-col justify-center" },
                        h('p', { className: "text-[9px] font-bold text-amber-700 mb-1 leading-tight" },
                            t('includeShortHaulInDuty')
                        ),
                        h('div', { className: "flex flex-wrap gap-x-3 gap-y-1" },
                            h('label', { className: "flex items-center gap-1 cursor-pointer" },
                                h('input', {
                                    type: 'radio',
                                    name: 'includeShortHaulInDuty',
                                    checked: includeShortHaulInDuty === false,
                                    onChange: () => setIncludeShortHaulInDuty && setIncludeShortHaulInDuty(false),
                                    className: "accent-amber-600"
                                }),
                                h('span', { className: "text-[10px] text-amber-800" }, t('includeShortHaulNo'))
                            ),
                            h('label', { className: "flex items-center gap-1 cursor-pointer" },
                                h('input', {
                                    type: 'radio',
                                    name: 'includeShortHaulInDuty',
                                    checked: includeShortHaulInDuty === true,
                                    onChange: () => setIncludeShortHaulInDuty && setIncludeShortHaulInDuty(true),
                                    className: "accent-amber-600"
                                }),
                                h('span', { className: "text-[10px] text-amber-800" }, t('includeShortHaulYes'))
                            )
                        )
                    ),
                    h('div', {
                        className: dutyInclHaul
                            ? 'bg-white p-2 rounded-lg border border-orange-200 shadow-sm'
                            : 'bg-slate-100/95 p-2 rounded-lg border border-slate-300/90 shadow-sm opacity-[0.92]'
                    },
                        h('div', {
                            className: dutyInclHaul
                                ? 'text-[9px] text-orange-600 font-black uppercase tracking-tighter mb-1.5'
                                : 'text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-1.5'
                        }, t('shortHaulFee')),
                        h('div', { className: "grid grid-cols-2 gap-3" },
                            h('div', null,
                                h('label', { className: dutyInclHaul ? "text-[10px] text-slate-500 font-bold block mb-1" : "text-[10px] text-slate-500/90 font-bold block mb-1" }, t('distanceKm')),
                                h('input', {
                                    type: "number",
                                    value: km === 0 ? '' : km,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateModule(mod.id, { shortHaulDistanceKm: val === '' ? 0 : Number(val) });
                                    },
                                    placeholder: "0",
                                    className: dutyInclHaul
                                        ? "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                        : "w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none"
                                })
                            ),
                            h('div', null,
                                h('label', { className: dutyInclHaul ? "text-[10px] text-slate-500 font-bold block mb-1" : "text-[10px] text-slate-500/90 font-bold block mb-1" }, t('pricePerKmPerContainer')),
                                h('input', {
                                    type: "number",
                                    value: pp === 0 ? '' : pp,
                                    onChange: e => {
                                        const val = e.target.value;
                                        updateModule(mod.id, { shortHaulPricePerKmPerContainer: val === '' ? 0 : Number(val) });
                                    },
                                    placeholder: "0",
                                    className: dutyInclHaul
                                        ? "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                        : "w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-400 outline-none"
                                })
                            )
                        ),
                        h('div', {
                            className: dutyInclHaul
                                ? "mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100"
                                : "mt-2 p-2 bg-slate-200/60 rounded-lg border border-slate-300/80"
                        },
                            h('div', { className: "flex justify-between items-center" },
                                h('span', {
                                    className: dutyInclHaul ? "text-[9px] text-orange-600 font-bold" : "text-[9px] text-slate-500 font-bold"
                                }, `${t('shortHaulFeeResult')}:`),
                                h('span', {
                                    className: dutyInclHaul ? "text-sm font-black text-orange-800" : "text-sm font-black text-slate-700"
                                },
                                    formatCurrencyLocal(feePerContainer, { maximumFractionDigits: 2 }),
                                    ` ${t('rubPerContainer')}`
                                )
                            ),
                            h('p', {
                                className: dutyInclHaul ? "text-[8px] text-slate-400 mt-1" : "text-[8px] text-slate-500 mt-1"
                            },
                                `${t('calculationFormula')}: ${t('distanceKm')} × 2 × ${t('pricePerKmPerContainer')}`
                            )
                        ),
                        h('div', { className: "mt-2 space-y-1.5" },
                            h('label', {
                                className: dutyInclHaul ? "text-[9px] text-slate-600 font-bold block" : "text-[9px] text-slate-500 font-bold block"
                            }, `${t('shortHaulVatRateLabel')} (%)`),
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
                                    className: dutyInclHaul
                                        ? "w-24 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-200 outline-none"
                                        : "w-24 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-slate-300 outline-none",
                                    placeholder: "0"
                                }),
                                h('span', { className: "text-[10px] text-slate-500" }, '%')
                            ),
                            shPerTon > 0 && shVat > 0 && h('div', {
                                className: dutyInclHaul
                                    ? "text-[10px] p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 space-y-1"
                                    : "text-[10px] p-2 rounded-lg bg-slate-200/50 border border-slate-300/70 space-y-1"
                            },
                                h('div', { className: "flex justify-between items-center gap-2" },
                                    h('span', {
                                        className: dutyInclHaul ? "text-emerald-800 font-bold" : "text-slate-600 font-bold"
                                    }, t('vatPerTonShortHaul')),
                                    h('span', {
                                        className: dutyInclHaul ? "text-emerald-700 font-black" : "text-slate-700 font-black"
                                    },
                                        formatCurrencyLocal(vatPerTonHaul, { maximumFractionDigits: 2 }),
                                        ` ${t('rubPerTon')}`
                                    )
                                ),
                                h('button', {
                                    type: 'button',
                                    onClick: () => setOpenVatDetail(showHaulD ? null : `${mod.id}-haul`),
                                    className: dutyInclHaul ? "text-[9px] text-emerald-600 underline font-bold" : "text-[9px] text-slate-500 underline font-bold"
                                }, showHaulD ? t('vatCalcToggleHide') : t('vatCalcToggleShow')),
                                showHaulD && h('div', {
                                    className: dutyInclHaul
                                        ? "pt-1 border-t border-emerald-200 text-[8px] text-emerald-900 space-y-1 leading-relaxed"
                                        : "pt-1 border-t border-slate-300 text-[8px] text-slate-700 space-y-1 leading-relaxed"
                                },
                                    h('p', { className: dutyInclHaul ? "font-bold text-emerald-800" : "font-bold text-slate-600" }, t('vatCalcDetailTitle')),
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
                    className: "max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollable-list"
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
            // 海外到站预估（紧凑布局）
            h('div', { className: "bg-white p-2.5 rounded-lg border border-orange-200 shadow-sm mt-2" },
                h('div', { className: "flex items-start gap-2" },
                    h('div', { className: "w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 flex-shrink-0 mt-0.5" },
                        h(Icon, { name: 'MapPin', size: 16 })
                    ),
                    h('div', { className: "flex-1 min-w-0 relative", ref: tooltipRef },
                        h('div', { className: "flex flex-wrap items-center gap-x-2 gap-y-0.5" },
                            h('p', { className: "text-[9px] text-slate-500 font-bold" }, t('overseasArrivalEstimate')),
                            h('span', { className: "text-[9px] text-orange-600 font-bold" },
                                `${t('lossRatio')} ${formatCurrencyLocal(lossRatio, { maximumFractionDigits: 1 })}%`
                            ),
                            h('button', {
                                type: 'button',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setShowLossRatioTooltip(!showLossRatioTooltip);
                                },
                                className: `text-slate-400 hover:text-orange-500 p-0.5 rounded ${showLossRatioTooltip ? 'text-orange-500' : ''}`,
                                title: t('viewLossRatioDetails')
                            }, h(Icon, { name: 'Info', size: 12 })),
                            showLossRatioTooltip && h('div', {
                                className: "absolute top-6 left-0 z-50 bg-[#1a2b4b] text-white p-2.5 rounded-lg shadow-xl border border-orange-400 min-w-[180px] text-[8px]",
                                onClick: (e) => e.stopPropagation()
                            },
                                h('div', { className: "font-bold mb-1 text-orange-300" }, t('lossRatio')),
                                h('div', { className: "text-slate-300 space-y-0.5" },
                                    `${t('shortHaulFeePerTon')}: `,
                                    formatCurrencyLocal(shortHaulFeePerTon, { maximumFractionDigits: 2 }), ` ${t('rubPerTon')}`,
                                    h('p', { className: "mt-1" }, t('lossRatioFormula')),
                                    h('p', { className: "font-black text-orange-300 mt-1" },
                                        `${t('lossRatio')}: ${formatCurrencyLocal(lossRatio, { maximumFractionDigits: 2 })}%`
                                    )
                                )
                            )
                        ),
                        h('div', { className: "mt-1.5 flex flex-wrap items-end gap-x-3 gap-y-1" },
                            h('span', { className: "text-lg font-black text-orange-700 leading-none" },
                                formatCurrencyLocal(baseRussianArrivalPriceRub ?? russianArrivalPriceRub, { maximumFractionDigits: 0 }),
                                h('span', { className: "text-[9px] text-slate-400 font-normal ml-0.5" }, t('rubPerTon'))
                            ),
                            h('span', { className: "text-[10px] font-bold text-indigo-500" },
                                '≈ ¥ ',
                                formatCurrencyLocal(russianArrivalPriceCny, { maximumFractionDigits: 2 })
                            )
                        )
                    )
                ),
                h('div', { className: "mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center" },
                    h('div', { className: "rounded-md bg-green-50/80 px-1 py-1 border border-green-100" },
                        h('p', { className: "text-[8px] text-slate-500 font-bold leading-tight" }, t('vatSumTotal')),
                        h('p', { className: "text-[10px] font-bold text-green-700 tabular-nums" },
                            formatCurrencyLocal(displayVatSumRub, { maximumFractionDigits: 0 })
                        )
                    ),
                    h('div', { className: "rounded-md bg-blue-50/80 px-1 py-1 border border-blue-100" },
                        h('p', { className: "text-[8px] text-slate-500 font-bold leading-tight" }, t('dutyTax')),
                        h('p', { className: "text-[10px] font-bold text-blue-600 tabular-nums" },
                            formatCurrencyLocal(exportDutyRub, { maximumFractionDigits: 0 })
                        )
                    ),
                    h('div', { className: "rounded-md bg-violet-50/80 px-1 py-1 border border-violet-100" },
                        h('p', { className: "text-[8px] text-slate-500 font-bold leading-tight" }, t('vatMinusDuty')),
                        h('p', { className: "text-[10px] font-black text-violet-700 tabular-nums" },
                            formatCurrencyLocal(displayVatSumRub - exportDutyRub, { maximumFractionDigits: 0 })
                        )
                    )
                )
            ),

            // 收支平衡（保本）：默认折叠，展开见参数与两种 P
            h('details', { className: "mt-2 rounded-lg border border-slate-200 bg-slate-50/90" },
                h('summary', { className: "cursor-pointer select-none px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-700 list-none [&::-webkit-details-marker]:hidden" },
                    h('span', { className: "text-slate-600" }, t('breakEvenExportTitle')),
                    h('span', { className: "font-mono text-indigo-600 text-[9px] tabular-nums" },
                        breakEvenExportPriceRub > 0
                            ? `P+退税 ${formatCurrencyLocal(breakEvenExportPriceRub, { maximumFractionDigits: 0 })}`
                            : '—',
                        ' · ',
                        breakEvenExportPriceNoRebateRub > 0
                            ? `P ${formatCurrencyLocal(breakEvenExportPriceNoRebateRub, { maximumFractionDigits: 0 })}`
                            : '—',
                        ` ${t('rubPerTon')}`
                    )
                ),
                h('div', { className: "px-2 pb-2 space-y-2 border-t border-slate-200 pt-2" },
                    h('p', { className: "text-[8px] text-slate-500 leading-snug" }, t('breakEvenExportDesc')),
                    h('div', { className: "text-[8px] text-slate-600 space-y-0.5 font-mono" },
                        h('p', null,
                            `C ${t('breakEvenCostShort')} = `,
                            formatCurrencyLocal(baseRussianArrivalPriceRub ?? 0, { maximumFractionDigits: 2 }),
                            ` ${t('rubPerTon')}`
                        ),
                        h('p', null,
                            `R ${t('breakEvenRebateShort')} = `,
                            formatCurrencyLocal(exportVatRebateRub ?? 0, { maximumFractionDigits: 2 }),
                            ` ${t('rubPerTon')}`
                        ),
                        h('p', null, `r = ${exportDutyRate}%`),
                        includeShortHaulInDuty && h('p', null,
                            `${t('shortHaulFeePerTon')} (SH) = `,
                            formatCurrencyLocal(shortHaulFeePerTonDisplay, { maximumFractionDigits: 2 }),
                            ` ${t('rubPerTon')}`
                        )
                    ),
                    breakEvenExportPriceRub > 0
                        ? h('div', { className: "pt-1" },
                            h('p', { className: "text-[9px] font-bold text-slate-700" }, t('breakEvenExportResultLabel')),
                            h('p', { className: "text-sm font-black text-indigo-700" },
                                'P = ',
                                formatCurrencyLocal(breakEvenExportPriceRub, { maximumFractionDigits: 0 }),
                                ` ${t('rubPerTon')}`
                            ),
                            h('p', { className: "text-[8px] text-slate-400" }, t('breakEvenRoundedNote'))
                        )
                        : h('p', { className: "text-[8px] text-amber-700" }, t('breakEvenNotApplicable')),
                    h('div', { className: "pt-2 border-t border-slate-200 space-y-1" },
                        h('p', { className: "text-[9px] font-bold text-slate-700" }, t('breakEvenExportNoRebateTitle')),
                        h('p', { className: "text-[8px] text-slate-500 leading-snug" }, t('breakEvenExportNoRebateDesc')),
                        breakEvenExportPriceNoRebateRub > 0
                            ? h('div', null,
                                h('p', { className: "text-[9px] font-bold text-slate-700" }, t('breakEvenExportNoRebateResultLabel')),
                                h('p', { className: "text-sm font-black text-slate-700" },
                                    'P = ',
                                    formatCurrencyLocal(breakEvenExportPriceNoRebateRub, { maximumFractionDigits: 0 }),
                                    ` ${t('rubPerTon')}`
                                ),
                                h('p', { className: "text-[8px] text-slate-400" }, t('breakEvenRoundedNote'))
                            )
                            : h('p', { className: "text-[8px] text-amber-700" }, t('breakEvenNotApplicableNoRebate'))
                    )
                )
            ),

            h('div', { className: "mt-2" },
                // 期望盈利 + 建议出口
                h('div', { className: "min-w-0 p-2 bg-emerald-50 rounded-lg border border-emerald-200" },
                    h('div', { className: "flex flex-wrap gap-x-3 gap-y-1.5 items-end justify-between" },
                        h('div', { className: "flex items-center gap-1 min-w-[120px]" },
                            h('label', { className: "text-[9px] font-bold text-emerald-700 whitespace-nowrap" },
                                t('expectedProfitPercent')
                            ),
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
                                        if (!isNaN(n) && n >= 0) {
                                            setExpectedProfitPercent && setExpectedProfitPercent(n);
                                            if (n > 0) {
                                                setExpectedProfitPerTonRub && setExpectedProfitPerTonRub(undefined);
                                                setProfitPerTonInput && setProfitPerTonInput('');
                                            }
                                        }
                                    }
                                },
                                className: "w-16 text-right text-xs border border-emerald-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400",
                                placeholder: '0'
                            }),
                            h('span', { className: "text-[10px] text-emerald-600" }, '%')
                        ),
                        h('div', { className: "flex items-center gap-1 flex-1 min-w-[140px]" },
                            h('label', { className: "text-[9px] text-emerald-600 font-bold whitespace-nowrap" },
                                t('expectedProfitPerTon')
                            ),
                            h('input', {
                                type: 'number',
                                step: 10,
                                value: profitPerTonInput,
                                onChange: (e) => {
                                    const val = e.target.value;
                                    isUserEditingProfit.current = true;
                                    setProfitPerTonInput(val);
                                    if (val === '') {
                                        setExpectedProfitPerTonRub && setExpectedProfitPerTonRub(undefined);
                                        setExpectedProfitPercent && setExpectedProfitPercent(0);
                                    } else {
                                        const n = parseFloat(val);
                                        if (!isNaN(n)) {
                                            setExpectedProfitPerTonRub && setExpectedProfitPerTonRub(n);
                                            setExpectedProfitPercent && setExpectedProfitPercent(0);
                                        }
                                    }
                                    setTimeout(() => { isUserEditingProfit.current = false; }, 300);
                                },
                                className: "w-20 text-right text-xs border border-emerald-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400",
                                placeholder: '0'
                            }),
                            h('span', { className: "text-[10px] text-emerald-500" }, t('rubPerTon'))
                        )
                    ),
                    h('p', { className: "text-[8px] text-emerald-600/90 mt-1.5 leading-snug" }, t('suggestedExportFormula')),
                    suggestedExportPriceRub > 0 && h('div', { className: "mt-1.5 pt-1.5 border-t border-emerald-200/80 space-y-0.5" },
                        h('div', { className: "flex items-center justify-between gap-2" },
                            h('p', { className: "text-[9px] font-bold text-emerald-800" }, t('suggestedExportPrice')),
                            h('p', { className: "text-sm font-black text-emerald-800 tabular-nums" },
                                formatCurrencyLocal(suggestedExportPriceRub, { maximumFractionDigits: 0 }),
                                h('span', { className: "text-[8px] font-normal ml-1 text-emerald-500" }, t('rubPerTon'))
                            )
                        ),
                        suggestedExportDutyRub > 0 && h('div', { className: "flex items-center justify-between gap-2" },
                            h('p', { className: "text-[8px] text-emerald-600" }, t('suggestedExportDuty')),
                            h('p', { className: "text-xs font-bold text-emerald-600 tabular-nums" },
                                formatCurrencyLocal(suggestedExportDutyRub, { maximumFractionDigits: 0 }),
                                h('span', { className: "text-[8px] font-normal ml-1 text-emerald-400" }, t('rubPerTon'))
                            )
                        )
                    )
                )
            ),

            // 关税计算出口价（双列）
            h('div', { className: "mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200" },
                h('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                    h('div', { className: "space-y-1" },
                        h('label', { className: "text-[9px] font-bold text-blue-700 leading-tight block" }, t('exportPriceForDuty')),
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
                                className: "min-w-0 flex-1 text-right text-xs border border-blue-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400",
                                placeholder: t('importSettlementValue')
                            }),
                            h('span', { className: "text-[10px] text-blue-600 shrink-0" }, 'RUB/t')
                        ),
                        h('p', { className: "text-[8px] text-blue-500 leading-snug" }, t('exportPriceForDutyHint')),
                        effectiveDutyBaseRub > 0 && h('p', { className: "text-[9px] text-blue-700 pt-0.5 border-t border-blue-200/80" },
                            h('span', { className: "text-blue-600" }, `${t('effectiveDutyBase')}: `),
                            h('span', { className: "font-bold tabular-nums" },
                                formatCurrencyLocal(effectiveDutyBaseRub, { maximumFractionDigits: 0 }),
                                ` ${t('rubPerTon')}`
                            )
                        )
                    ),
                    h('div', { className: "space-y-1" },
                        h('label', { className: "text-[9px] font-bold text-blue-700 leading-tight block" }, t('exportPriceForDutyNoRebate')),
                        h('div', { className: "flex items-center gap-1" },
                            h('input', {
                                type: 'number',
                                min: 0,
                                step: 100,
                                value: exportPriceNoRebateRub === 0 ? '' : exportPriceNoRebateRub,
                                onChange: (e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setExportPriceNoRebateRub && setExportPriceNoRebateRub(0);
                                    } else {
                                        const n = parseFloat(val);
                                        if (!isNaN(n) && n >= 0) setExportPriceNoRebateRub && setExportPriceNoRebateRub(n);
                                    }
                                },
                                className: "min-w-0 flex-1 text-right text-xs border border-blue-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400",
                                placeholder: t('importSettlementValue')
                            }),
                            h('span', { className: "text-[10px] text-blue-600 shrink-0" }, 'RUB/t')
                        ),
                        h('p', { className: "text-[8px] text-blue-500 leading-snug" }, t('exportPriceForDutyNoRebateHint')),
                        effectiveDutyBaseNoRebateRub > 0 && h('p', { className: "text-[9px] text-blue-700 pt-0.5 border-t border-blue-200/80" },
                            h('span', { className: "text-blue-600" }, `${t('effectiveDutyBaseNoRebate')}: `),
                            h('span', { className: "font-bold tabular-nums" },
                                formatCurrencyLocal(effectiveDutyBaseNoRebateRub, { maximumFractionDigits: 0 }),
                                ` ${t('rubPerTon')}`
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
