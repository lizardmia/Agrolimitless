/**
 * FarmPriceReverseModal 组件 - 倒推农场采购价弹窗
 */
import { useState } from 'react';
import { reverseFarmPriceFromArrivalPrice, reverseFarmPriceFromBasePrice } from '../utils/calculations';
import type { OverseaExtra, DomesticExtra } from '../types/index.d';

interface FarmPriceReverseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (farmPriceRub: number) => void;
    
    // 当前参数（用于计算）
    exchangeRate: number;
    usdCnyRate: number;
    overseaLogistics1: number;
    unit1: 'RUB/t' | 'RUB/柜';
    overseaLogistics2: number;
    unit2: 'RUB/t' | 'RUB/柜';
    exportExtras: OverseaExtra[];
    dutyRate: number;
    vatRate: number;
    importPriceRub: number;
    importPriceUnit: 'RUB/t' | 'RUB/柜';
    intlFreightUsd: number;
    domesticShortHaulCny: number;
    domesticExtras: DomesticExtra[];
    tonsPerContainer: number;
    collectionDays: number;
    interestRate: number;
}

export function FarmPriceReverseModal({
    isOpen,
    onClose,
    onApply,
    exchangeRate,
    usdCnyRate,
    overseaLogistics1,
    unit1,
    overseaLogistics2,
    unit2,
    exportExtras,
    dutyRate,
    vatRate,
    importPriceRub,
    importPriceUnit,
    intlFreightUsd,
    domesticShortHaulCny,
    domesticExtras,
    tonsPerContainer,
    collectionDays,
    interestRate
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
                    overseaLogistics1,
                    unit1,
                    overseaLogistics2,
                    unit2,
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
                    overseaLogistics1,
                    unit1,
                    overseaLogistics2,
                    unit2,
                    exportExtras,
                    dutyRate,
                    vatRate,
                    intlFreightUsd,
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
                        <h3 className="text-xl font-bold text-slate-800">倒推农场采购价</h3>
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
                        <label className="text-sm font-bold text-slate-600 mb-3 block">计算模式</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setMode('arrival');
                                    setCalculatedFarmPrice(null);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    mode === 'arrival'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="font-bold mb-1">模式1：目标海外到站价格</div>
                                <div className="text-xs text-slate-500">根据目标海外到站价格（CNY/t）倒推</div>
                            </button>
                            <button
                                onClick={() => {
                                    setMode('base');
                                    setCalculatedFarmPrice(null);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    mode === 'base'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="font-bold mb-1">模式2：目标基础成本价</div>
                                <div className="text-xs text-slate-500">根据目标基础成本价（CNY/t）倒推</div>
                            </button>
                        </div>
                    </div>
                    
                    {/* 输入区域 */}
                    <div className="space-y-4">
                        {mode === 'arrival' ? (
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">
                                    目标海外到站价格 (CNY/t)
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
                                    输入目标海外到站价格（人民币/吨），系统将倒推出所需的农场采购价
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">
                                    目标基础成本价 (CNY/t)
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
                                    输入目标基础成本价（不含息），系统将倒推出所需的农场采购价
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
                        计算农场采购价
                    </button>
                    
                    {/* 结果显示 */}
                    {calculatedFarmPrice !== null && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                    ✓
                                </div>
                                <div>
                                    <div className="font-bold text-green-800">计算结果</div>
                                    <div className="text-sm text-green-600">建议的农场采购价</div>
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
                                应用此价格
                            </button>
                        </div>
                    )}
                    
                    {calculatedFarmPrice === null && calculatedFarmPrice !== undefined && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                            无法计算出有效的农场采购价，请检查输入参数
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
