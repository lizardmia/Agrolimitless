/**
 * FarmPriceReverseModal 组件 - 倒推农场采购价弹窗
 */
import { useState } from 'react';
import { reverseFarmPriceFromArrivalPrice, reverseFarmPriceFromBasePrice } from '../utils/calculations';
import type { OverseaExtra, DomesticExtra } from '../types/index.d';
import type { Language } from '../utils/i18n';

interface FarmPriceReverseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (farmPriceRub: number) => void;
    
    // 当前参数（用于计算）
    exchangeRate: number;
    usdCnyRate: number;
    shortHaulDistanceKm: number;
    shortHaulPricePerKmPerContainer: number;
    exportExtras: OverseaExtra[];
    dutyRate: number;
    vatRate: number;
    importPriceRub: number;
    importPriceUnit: 'RUB/t' | 'RUB/柜';
    intlFreightOverseasUsd: number;
    intlFreightDomesticUsd: number;
    insuranceRate: number;
    domesticShortHaulCny: number;
    domesticExtras: DomesticExtra[];
    tonsPerContainer: number;
    collectionDays: number;
    interestRate: number;
    
    // 多语言支持
    language?: Language;
    t?: (key: string) => string;
}

export function FarmPriceReverseModal({
    isOpen,
    onClose,
    onApply,
    exchangeRate,
    usdCnyRate,
    shortHaulDistanceKm,
    shortHaulPricePerKmPerContainer,
    exportExtras,
    dutyRate,
    vatRate,
    importPriceRub,
    importPriceUnit,
    intlFreightOverseasUsd,
    intlFreightDomesticUsd,
    domesticShortHaulCny,
    domesticExtras,
    tonsPerContainer,
    collectionDays,
    interestRate,
    language = 'zh',
    t = (key) => key
}: FarmPriceReverseModalProps) {
    const [mode, setMode] = useState<'arrival' | 'base'>('arrival');
    const [targetArrivalPriceCny, setTargetArrivalPriceCny] = useState<number>(0);
    const [targetBaseLandingPriceCny, setTargetBaseLandingPriceCny] = useState<number>(0);
    const [calculatedFarmPrice, setCalculatedFarmPrice] = useState<number | null>(null);
    
    if (!isOpen) return null;
    
    const handleCalculate = () => {
        let result: number | null = null;
        
        if (mode === 'arrival') {
            if (targetArrivalPriceCny > 0) {
                result = reverseFarmPriceFromArrivalPrice({
                    targetArrivalPriceCny,
                    exchangeRate,
                    shortHaulDistanceKm,
                    shortHaulPricePerKmPerContainer,
                    exportExtras,
                    tonsPerContainer
                });
            }
        } else {
            if (targetBaseLandingPriceCny > 0) {
                result = reverseFarmPriceFromBasePrice({
                    targetBaseLandingPriceCny,
                    exchangeRate,
                    usdCnyRate,
                    shortHaulDistanceKm,
                    shortHaulPricePerKmPerContainer,
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
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold text-slate-800 ${language !== 'zh' ? 'leading-tight' : ''}`}>
                            {language === 'ru' ? (
                                <>
                                    Обратный расчет<br />цены закупки фермы
                                </>
                            ) : language === 'en' ? (
                                <>
                                    Reverse Farm<br />Purchase Price
                                </>
                            ) : (
                                t('reverseFarmPrice')
                            )}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* 计算模式选择 */}
                    <div>
                        <label className="text-sm font-bold text-slate-600 mb-3 block">{t('calculationMode')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setMode('arrival');
                                    setCalculatedFarmPrice(null);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    mode === 'arrival'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className={`font-bold mb-1 leading-tight break-words ${language !== 'zh' ? 'text-sm' : ''}`}>
                                    {language === 'ru' ? (
                                        <>
                                            Режим 1: Целевая цена<br />прибытия за границу
                                        </>
                                    ) : language === 'en' ? (
                                        <>
                                            Mode 1: Target<br />Overseas Arrival Price
                                        </>
                                    ) : (
                                        t('mode1TargetArrivalPrice')
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 leading-tight">{t('mode1Desc')}</div>
                            </button>
                            <button
                                onClick={() => {
                                    setMode('base');
                                    setCalculatedFarmPrice(null);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    mode === 'base'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className={`font-bold mb-1 leading-tight break-words ${language !== 'zh' ? 'text-sm' : ''}`}>
                                    {language === 'ru' ? (
                                        <>
                                            Режим 2: Целевая<br />базовая стоимость
                                        </>
                                    ) : language === 'en' ? (
                                        <>
                                            Mode 2: Target<br />Base Cost Price
                                        </>
                                    ) : (
                                        t('mode2TargetBasePrice')
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 leading-tight">{t('mode2Desc')}</div>
                            </button>
                        </div>
                    </div>
                    
                    {/* 输入区域 */}
                    <div className="space-y-4">
                        {mode === 'arrival' ? (
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">
                                    {t('targetArrivalPrice')} (CNY/t)
                                </label>
                                <input
                                    type="number"
                                    value={targetArrivalPriceCny === 0 ? '' : targetArrivalPriceCny}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setTargetArrivalPriceCny(val === '' ? 0 : Number(val));
                                        setCalculatedFarmPrice(null);
                                    }}
                                    placeholder="0"
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {t('targetArrivalPriceHint')}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">
                                    {t('targetBaseLandingPrice')} (CNY/t)
                                </label>
                                <input
                                    type="number"
                                    value={targetBaseLandingPriceCny === 0 ? '' : targetBaseLandingPriceCny}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setTargetBaseLandingPriceCny(val === '' ? 0 : Number(val));
                                        setCalculatedFarmPrice(null);
                                    }}
                                    placeholder="0"
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {t('targetBaseLandingPriceHint')}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* 计算按钮 */}
                    <button
                        onClick={handleCalculate}
                        disabled={
                            (mode === 'arrival' && targetArrivalPriceCny <= 0) ||
                            (mode === 'base' && targetBaseLandingPriceCny <= 0)
                        }
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('calculateFarmPrice')}
                    </button>
                    
                    {/* 结果显示 */}
                    {calculatedFarmPrice !== null && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                    ✓
                                </div>
                                <div>
                                    <div className="font-bold text-green-800">{t('calculationResult')}</div>
                                    <div className="text-sm text-green-600">{t('suggestedFarmPrice')}</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-green-700 mb-2">
                                {calculatedFarmPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} RUB/t
                            </div>
                            <div className="text-sm text-green-600">
                                ≈ {(calculatedFarmPrice / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} CNY/t
                            </div>
                            <button
                                onClick={handleApply}
                                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                                {t('applyThisPrice')}
                            </button>
                        </div>
                    )}
                    
                    {calculatedFarmPrice === null && calculatedFarmPrice !== undefined && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                            {t('cannotCalculateFarmPrice')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
