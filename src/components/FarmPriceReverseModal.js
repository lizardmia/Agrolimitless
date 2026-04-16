/**
 * FarmPriceReverseModal 组件 - 倒推农场采购价弹窗（CDN 版本）
 */
// 获取 React（Vite 模式下从全局获取，CDN 模式下也是全局）
const React = typeof window !== 'undefined' ? window.React : (typeof global !== 'undefined' ? global.React : null);
if (!React) {
    throw new Error('React is not available. Make sure React is loaded before this component.');
}
const { useState } = React;
const h = React.createElement;

function FarmPriceReverseModal({
    isOpen,
    onClose,
    onApply,
    exchangeRate,
    usdCnyRate,
    shortHaulFeePerTon,
    exportExtras,
    dutyRate,
    vatRate,
    importPriceRub,
    importPriceUnit,
    intlFreightOverseasUsd,
    intlFreightDomesticUsd,
    insuranceRate,
    domesticShortHaulCny,
    domesticExtras,
    tonsPerContainer,
    collectionDays,
    interestRate,
    language = 'zh',
    t = (key) => key
}) {
    const [mode, setMode] = useState('arrival');
    const [targetArrivalPriceCny, setTargetArrivalPriceCny] = useState(0);
    const [targetBaseLandingPriceCny, setTargetBaseLandingPriceCny] = useState(0);
    const [calculatedFarmPrice, setCalculatedFarmPrice] = useState(null);
    
    if (!isOpen) return null;
    
    const { reverseFarmPriceFromArrivalPrice, reverseFarmPriceFromBasePrice } = window.calculations || {};
    
    const handleCalculate = () => {
        let result = null;
        
        if (mode === 'arrival') {
            if (targetArrivalPriceCny > 0 && reverseFarmPriceFromArrivalPrice) {
                result = reverseFarmPriceFromArrivalPrice({
                    targetArrivalPriceCny,
                    exchangeRate,
                    shortHaulFeePerTon,
                    exportExtras,
                    tonsPerContainer
                });
            }
        } else {
            if (targetBaseLandingPriceCny > 0 && reverseFarmPriceFromBasePrice) {
                result = reverseFarmPriceFromBasePrice({
                    targetBaseLandingPriceCny,
                    exchangeRate,
                    usdCnyRate,
                    shortHaulFeePerTon,
                    exportExtras,
                    dutyRate,
                    vatRate,
                    intlFreightOverseasUsd,
                    intlFreightDomesticUsd,
                    insuranceRate,
                    domesticShortHaulCny,
                    domesticExtras,
                    tonsPerContainer
                });
            }
        }
        
        setCalculatedFarmPrice(result);
    };
    
    const handleApply = () => {
        if (calculatedFarmPrice !== null && calculatedFarmPrice > 0) {
            onApply(calculatedFarmPrice);
            onClose();
        }
    };
    
    const Icon = window.Icon;
    
    return h('div', {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    },
        h('div', {
            className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        },
            h('div', { className: "p-6 border-b border-slate-200" },
                h('div', { className: "flex justify-between items-center" },
                    h('h3', { 
                        className: `text-xl font-bold text-slate-800 ${language !== 'zh' ? 'leading-tight' : ''}`
                    }, language === 'ru' ? [
                        'Обратный расчет',
                        h('br', { key: 'br' }),
                        'цены закупки фермы'
                    ] : language === 'en' ? [
                        'Reverse Farm',
                        h('br', { key: 'br' }),
                        'Purchase Price'
                    ] : t('reverseFarmPrice')),
                    h('button', {
                        onClick: onClose,
                        className: "text-slate-400 hover:text-slate-600 transition-colors text-2xl"
                    }, "✕")
                )
            ),
            h('div', { className: "p-6 space-y-6" },
                // 计算模式选择
                h('div', null,
                    h('label', { className: "text-sm font-bold text-slate-600 mb-3 block" }, t('calculationMode')),
                    h('div', { className: "grid grid-cols-2 gap-3" },
                        h('button', {
                            onClick: () => {
                                setMode('arrival');
                                setCalculatedFarmPrice(null);
                            },
                            className: `p-4 rounded-xl border-2 transition-all text-left ${
                                mode === 'arrival'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`
                        },
                            h('div', { 
                                className: `font-bold mb-1 leading-tight break-words ${language !== 'zh' ? 'text-sm' : ''}`
                            }, language === 'ru' ? [
                                'Режим 1: Целевая цена',
                                h('br', { key: 'br1' }),
                                'прибытия за границу'
                            ] : language === 'en' ? [
                                'Mode 1: Target',
                                h('br', { key: 'br1' }),
                                'Overseas Arrival Price'
                            ] : t('mode1TargetArrivalPrice')),
                            h('div', { className: "text-xs text-slate-500 leading-tight" }, t('mode1Desc'))
                        ),
                        h('button', {
                            onClick: () => {
                                setMode('base');
                                setCalculatedFarmPrice(null);
                            },
                            className: `p-4 rounded-xl border-2 transition-all text-left ${
                                mode === 'base'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`
                        },
                            h('div', { 
                                className: `font-bold mb-1 leading-tight break-words ${language !== 'zh' ? 'text-sm' : ''}`
                            }, language === 'ru' ? [
                                'Режим 2: Целевая',
                                h('br', { key: 'br2' }),
                                'базовая стоимость'
                            ] : language === 'en' ? [
                                'Mode 2: Target',
                                h('br', { key: 'br2' }),
                                'Base Cost Price'
                            ] : t('mode2TargetBasePrice')),
                            h('div', { className: "text-xs text-slate-500 leading-tight" }, t('mode2Desc'))
                        )
                    )
                ),
                // 输入区域
                h('div', { className: "space-y-4" },
                    mode === 'arrival' ? h('div', null,
                        h('label', { className: "text-sm font-bold text-slate-600 mb-2 block" },
                            `${t('targetArrivalPrice')} (CNY/t)`
                        ),
                        h('input', {
                            type: "number",
                            value: targetArrivalPriceCny === 0 ? '' : targetArrivalPriceCny,
                            onChange: (e) => {
                                const val = e.target.value;
                                setTargetArrivalPriceCny(val === '' ? 0 : Number(val));
                                setCalculatedFarmPrice(null);
                            },
                            placeholder: "0",
                            className: "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        }),
                        h('p', { className: "text-xs text-slate-500 mt-1" },
                            t('targetArrivalPriceHint')
                        )
                    ) : h('div', null,
                        h('label', { className: "text-sm font-bold text-slate-600 mb-2 block" },
                            `${t('targetBaseLandingPrice')} (CNY/t)`
                        ),
                        h('input', {
                            type: "number",
                            value: targetBaseLandingPriceCny === 0 ? '' : targetBaseLandingPriceCny,
                            onChange: (e) => {
                                const val = e.target.value;
                                setTargetBaseLandingPriceCny(val === '' ? 0 : Number(val));
                                setCalculatedFarmPrice(null);
                            },
                            placeholder: "0",
                            className: "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        }),
                        h('p', { className: "text-xs text-slate-500 mt-1" },
                            t('targetBaseLandingPriceHint')
                        )
                    )
                ),
                // 计算按钮
                h('button', {
                    onClick: handleCalculate,
                    disabled: (mode === 'arrival' && targetArrivalPriceCny <= 0) ||
                              (mode === 'base' && targetBaseLandingPriceCny <= 0),
                    className: "w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                }, t('calculateFarmPrice')),
                // 结果显示
                calculatedFarmPrice !== null && calculatedFarmPrice > 0 ? h('div', {
                    className: "bg-green-50 border-2 border-green-200 rounded-xl p-6"
                },
                    h('div', { className: "flex items-center gap-3 mb-4" },
                        h('div', {
                            className: "w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
                        }, "✓"),
                        h('div', null,
                            h('div', { className: "font-bold text-green-800" }, t('calculationResult')),
                            h('div', { className: "text-sm text-green-600" }, t('suggestedFarmPrice'))
                        )
                    ),
                    h('div', { className: "text-3xl font-black text-green-700 mb-2" },
                        calculatedFarmPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                        " RUB/t"
                    ),
                    h('div', { className: "text-sm text-green-600" },
                        "≈ ",
                        (calculatedFarmPrice / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 }),
                        " CNY/t"
                    ),
                    h('button', {
                        onClick: handleApply,
                        className: "mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                    }, t('applyThisPrice'))
                ) : calculatedFarmPrice === null && calculatedFarmPrice !== undefined ? null : h('div', {
                    className: "bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm"
                }, t('cannotCalculateFarmPrice'))
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.FarmPriceReverseModal = FarmPriceReverseModal;
}

// ES6 模块导出（用于 Vite 构建）
// 在 Vite 构建时会被正确处理，CDN 模式下通过 window.FarmPriceReverseModal 访问
export { FarmPriceReverseModal };
