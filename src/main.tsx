/**
 * 主入口文件（TypeScript + Vite 版本）
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/main.css';

// 将 React 设置为全局变量（供 JS 组件使用）
if (typeof window !== 'undefined') {
    (window as any).React = React;
}

// 导入 JS 组件（让它们执行并设置全局变量，供 App.tsx 使用）
// 这些组件会通过 window.XXX 导出，供 App.tsx 中的 createElement 使用
import './components/Icon.js';
import './components/Header.js';
import './components/ExchangeRateCards.js';
import './components/OverseaSection.js';
import './components/PolicySection.js';
import './components/DomesticSection.js';
import './components/ResultsPanel.js';
import './components/CostBreakdown.js';
import './components/FinancePanel.js';
// FarmPriceReverseModal 使用 .tsx 版本，在 App.tsx 中已导入

// 导入工具函数（让它们执行并设置全局变量）
import './utils/calculations.js';
import './config/constants.js';

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
