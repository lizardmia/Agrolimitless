/**
 * FarmPriceReverseModal 组件 - 倒推农场采购价弹窗
 */
import { useState } from 'react';
import { reverseFarmPriceFromArrivalPrice, reverseFarmPriceFromBasePrice } from '../utils/calculations';
import type { OverseaExtra, DomesticExtra } from '../types/index.d';
import type { Language } from '../utils/i18n';

export interface FarmPriceReverseApplyPayload {
    farmPriceRub: number;
    importPriceRubPerTon?: number;
}

interface FarmPriceReverseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (result: FarmPriceReverseApplyPayload) => void;
    
    // 当前参数（用于计算）
    exchangeRate: number;
    usdCnyRate: number;
    /** 每吨短驳费合计（RUB/t），优先于公里数推算 */
    shortHaulFeePerTon: number;
    exportExtras: OverseaExtra[];
    includeShortHaulInDuty: boolean;
    dutyRate: number;
    vatRate: number;
    intlFreightOverseasUsd: number;
    intlFreightDomesticUsd: number;
    insuranceRate: number;
    domesticShortHaulCny: number;
    domesticExtras: DomesticExtra[];
    tonsPerContainer: number;
    
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
    shortHaulFeePerTon,
    exportExtras,
    includeShortHaulInDuty,
    dutyRate,
    vatRate,
    intlFreightOverseasUsd,
    intlFreightDomesticUsd,
    insuranceRate,
    domesticShortHaulCny,
    domesticExtras,
    tonsPerContainer,
    language = 'zh',
    t = (key) => key
}: FarmPriceReverseModalProps) {
    const [mode, setMode] = useState<'arrival' | 'base'>('arrival');
    const [targetArrivalPriceCny, setTargetArrivalPriceCny] = useState<number>(0);
    const [targetBaseLandingPriceCny, setTargetBaseLandingPriceCny] = useState<number>(0);
    const [calculationResult, setCalculationResult] = useState<FarmPriceReverseApplyPayload | null | undefined>(undefined);
    
    if (!isOpen) return null;
    
    const handleCalculate = () => {
        let result: FarmPriceReverseApplyPayload | null = null;
        
        if (mode === 'arrival') {
            if (targetArrivalPriceCny > 0) {
                const farmPriceRub = reverseFarmPriceFromArrivalPrice({
                    targetArrivalPriceCny,
                    exchangeRate,
                    shortHaulFeePerTon,
                    exportExtras,
                    tonsPerContainer,
                    includeShortHaulInDuty
                });
                result = { farmPriceRub };
            }
        } else {
            if (targetBaseLandingPriceCny > 0) {
                const baseResult = reverseFarmPriceFromBasePrice({
                    targetBaseLandingPriceCny,
                    exchangeRate,
                    usdCnyRate,
                    shortHaulFeePerTon,
                    exportExtras,
                    includeShortHaulInDuty,
                    dutyRate,
                    vatRate,
                    intlFreightOverseasUsd,
                    intlFreightDomesticUsd,
                    insuranceRate,
                    domesticShortHaulCny,
                    domesticExtras,
                    tonsPerContainer
                });
                result = baseResult;
            }
        }
        
        setCalculationResult(result);
    };
    
    const handleApply = () => {
        if (calculationResult !== null && calculationResult !== undefined && calculationResult.farmPriceRub > 0) {
            onApply(calculationResult);
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
                                    setCalculationResult(undefined);
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
                                    setCalculationResult(undefined);
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
                                        setCalculationResult(undefined);
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
                                        setCalculationResult(undefined);
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
                    {calculationResult !== null && calculationResult !== undefined && (
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
                                {calculationResult.farmPriceRub.toLocaleString(undefined, { maximumFractionDigits: 2 })} RUB/t
                            </div>
                            <div className="text-sm text-green-600">
                                ≈ {(calculationResult.farmPriceRub / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} CNY/t
                            </div>
                            <button
                                onClick={handleApply}
                                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                                {t('applyThisPrice')}
                            </button>
                        </div>
                    )}
                    
                    {calculationResult === null && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                            {t('cannotCalculateFarmPrice')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
