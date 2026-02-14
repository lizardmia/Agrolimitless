/**
 * Header 组件 - 页面头部（TypeScript 版本）
 */
import React from 'react';
import { Icon } from './Icon';

export function Header() {
    return (
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1a2b4b]">
                    <div className="bg-blue-600 p-1 rounded text-white">
                        <Icon name="Calculator" size={20} />
                    </div>
                    Agrolimitless & Transglobe 定价看板
                </h1>
                <p className="text-slate-400 italic text-sm underline decoration-blue-200">
                    跨境供应链全链路核算系统
                </p>
            </div>
            <div className="flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 items-center">
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        系统计算状态
                    </p>
                    <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                        <Icon name="CheckCircle2" size={12} />
                        参数实时对齐
                    </p>
                </div>
            </div>
        </div>
    );
}
