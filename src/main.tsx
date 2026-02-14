/**
 * 主入口文件（TypeScript + Vite 版本）
 */
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/main.css';

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
import './components/FarmPriceReverseModal.js';

// 导入工具函数（让它们执行并设置全局变量）
import './utils/calculations.js';
import './config/constants.js';

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
