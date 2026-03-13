/**
 * Header 组件 - 页面头部（TypeScript 版本）
 */
import React from 'react';
import { Icon } from './Icon';
import type { Language } from '../utils/i18n';

interface HeaderProps {
    language?: Language;
    t?: (key: string) => string;
}

export function Header({ language = 'zh', t = (key) => key }: HeaderProps) {
    return (
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1a2b4b]">
                    <div className="bg-blue-600 p-1 rounded text-white">
                        <Icon name="Calculator" size={20} />
                    </div>
                    {t('pricingDashboard')}
                </h1>
                <p className="text-slate-400 italic text-sm underline decoration-blue-200">
                    {t('supplyChainSystem')}
                </p>
            </div>
            <div className="flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 items-center">
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        {t('systemStatus')}
                    </p>
                    <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                        <Icon name="CheckCircle2" size={12} />
                        {t('paramsAligned')}
                    </p>
                </div>
            </div>
        </div>
    );
}
