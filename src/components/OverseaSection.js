/**
 * OverseaSection 组件 - 海外段参数输入
 */
function OverseaSection({
    farmPriceRub,
    setFarmPriceRub,
    shortHaulDistanceKm,
    setShortHaulDistanceKm,
    shortHaulPricePerKmPerContainer,
    setShortHaulPricePerKmPerContainer,
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
    const shortHaulFeePerTonDisplay = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer / tpc;
    const exportExtrasTotalDisplay = exportExtras.reduce((sum, item) => {
        const v = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
        return sum + (item.unit === 'RUB/ton' ? v : v / tpc);
    }, 0);
    // 成本 base = 农场采购价 + 短驳费/t + 杂费/t
    const costBase = farmPriceRub + shortHaulFeePerTonDisplay + exportExtrasTotalDisplay;
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
    
    // 计算短驳费（每吨，RUB/t）
    const shortHaulFeePerContainer = shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer;
    const shortHaulFeePerTon = tonsPerContainer > 0 ? shortHaulFeePerContainer / tonsPerContainer : 0;
    
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
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold uppercase tracking-tighter" }, `${t('farmPurchasePrice')} (RUB/t)`),
                h('input', {
                    type: "number",
                    value: farmPriceRub === 0 ? '' : farmPriceRub,
                    onChange: e => {
                        const val = e.target.value;
                        setFarmPriceRub(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                })
            ),
            h('div', { className: "bg-white p-3 rounded-xl border border-orange-200 shadow-sm" },
                h('div', { className: "text-[10px] text-orange-600 font-black uppercase tracking-tighter mb-2" }, t('shortHaulFee')),
                h('div', { className: "grid grid-cols-2 gap-3" },
                    h('div', null,
                        h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, t('distanceKm')),
                        h('input', {
                            type: "number",
                            value: shortHaulDistanceKm === 0 ? '' : shortHaulDistanceKm,
                            onChange: e => {
                                const val = e.target.value;
                                setShortHaulDistanceKm(val === '' ? 0 : Number(val));
                            },
                            placeholder: "0",
                            className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1" }, t('pricePerKmPerContainer')),
                        h('input', {
                            type: "number",
                            value: shortHaulPricePerKmPerContainer === 0 ? '' : shortHaulPricePerKmPerContainer,
                            onChange: e => {
                                const val = e.target.value;
                                setShortHaulPricePerKmPerContainer(val === '' ? 0 : Number(val));
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
                            formatCurrencyLocal(shortHaulDistanceKm * 2 * shortHaulPricePerKmPerContainer, { maximumFractionDigits: 2 }),
                            ` ${t('rubPerContainer')}`
                        )
                    ),
                    h('p', { className: "text-[8px] text-slate-400 mt-1" },
                        `${t('calculationFormula')}: ${t('distanceKm')} × 2 × ${t('pricePerKmPerContainer')}`
                    )
                )
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
                            )
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
                        // 两个版本的海外到站预估
                        h('div', { className: "flex flex-col gap-2" },
                            // 版本1：含增值税退税（调整后）
                            h('div', { className: "bg-orange-50 rounded-lg px-2 py-1.5 border border-orange-100" },
                                h('p', { className: "text-[9px] text-orange-500 font-bold mb-0.5" }, t('overseasArrivalWithVat')),
                                h('div', { className: "flex items-baseline gap-1" },
                                    h('span', { className: "text-xl font-black text-orange-700 leading-none" },
                                        formatCurrencyLocal(russianArrivalPriceRub, { maximumFractionDigits: 0 })
                                    ),
                                    h('span', { className: "text-[9px] text-slate-400 font-normal" }, ` ${t('rubPerTon')}`)
                                ),
                                h('p', { className: "text-xs font-bold text-indigo-500 mt-0.5" },
                                    "≈ ¥ ",
                                    formatCurrencyLocal(russianArrivalPriceCny, { maximumFractionDigits: 2 })
                                )
                            ),
                            // 版本2：不含增值税退税（原始价格）
                            baseRussianArrivalPriceRub !== undefined && baseRussianArrivalPriceRub !== russianArrivalPriceRub && h('div', { className: "bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200" },
                                h('p', { className: "text-[9px] text-slate-500 font-bold mb-0.5" }, t('overseasArrivalWithoutVat')),
                                h('div', { className: "flex items-baseline gap-1" },
                                    h('span', { className: "text-lg font-bold text-slate-600 leading-none" },
                                        formatCurrencyLocal(baseRussianArrivalPriceRub, { maximumFractionDigits: 0 })
                                    ),
                                    h('span', { className: "text-[9px] text-slate-400 font-normal" }, ` ${t('rubPerTon')}`)
                                )
                            ),
                            // 物损比
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
                // 增值税、关税信息
                h('div', { className: "mt-3 pt-3 border-t border-slate-200 space-y-2" },
                    // 增值税
                    h('div', { className: "flex justify-between items-center" },
                        h('div', { className: "flex-1" },
                            h('p', { className: "text-[9px] text-slate-500 font-bold mb-1" }, t('vatTax')),
                            h('p', { className: "text-[8px] text-slate-400" }, t('vatFormula'))
                        ),
                        h('div', { className: "text-right" },
                            h('p', { className: "text-sm font-bold text-green-600" },
                                formatCurrencyLocal(exportVatRebateRub, { maximumFractionDigits: 2 }),
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
                    // 增值税减去关税
                    h('div', { className: "flex justify-between items-center pt-2 border-t border-slate-200" },
                        h('div', { className: "flex-1" },
                            h('p', { className: "text-[9px] text-slate-600 font-bold mb-1" }, t('vatMinusDuty')),
                            h('p', { className: "text-[8px] text-slate-400" }, t('vatMinusDutyFormula'))
                        ),
                        h('div', { className: "text-right" },
                            h('p', { className: "text-sm font-black text-purple-600" },
                                formatCurrencyLocal(exportVatRebateRub - exportDutyRub, { maximumFractionDigits: 2 }),
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
