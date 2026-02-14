/**
 * 入口文件（CDN 版本）
 * 初始化 React 应用，加载所有组件
 */

// 检查所有必需的组件和工具是否已加载
function checkDependencies() {
    const required = {
        'React': typeof React !== 'undefined',
        'ReactDOM': typeof ReactDOM !== 'undefined',
        'App': typeof window.App !== 'undefined',
        'Header': typeof window.Header !== 'undefined',
        'ExchangeRateCards': typeof window.ExchangeRateCards !== 'undefined',
        'Sidebar': typeof window.Sidebar !== 'undefined',
        'ResultsPanel': typeof window.ResultsPanel !== 'undefined',
        'CostBreakdown': typeof window.CostBreakdown !== 'undefined',
        'FinancePanel': typeof window.FinancePanel !== 'undefined',
        'calculations': typeof window.calculations !== 'undefined',
        'constants': typeof window.constants !== 'undefined',
        'Icon': typeof window.Icon !== 'undefined'
    };
    
    const missing = Object.keys(required).filter(key => !required[key]);
    return { allLoaded: missing.length === 0, missing };
}

// 等待所有资源加载完成
function renderApp() {
    try {
        console.log('开始渲染应用...');
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            console.error('Root element not found');
            return;
        }

        // 检查 React 和 ReactDOM 是否已加载
        if (typeof React === 'undefined') {
            console.error('React 未加载');
            rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>错误：React 库未正确加载</h2><p>请检查网络连接或刷新页面。</p></div>';
            return;
        }
        
        if (typeof ReactDOM === 'undefined') {
            console.error('ReactDOM 未加载');
            rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>错误：ReactDOM 库未正确加载</h2><p>请检查网络连接或刷新页面。</p></div>';
            return;
        }

        console.log('React 版本:', React.version);
        console.log('ReactDOM 已加载');

        // 检查所有依赖
        const deps = checkDependencies();
        if (!deps.allLoaded) {
            console.warn('部分依赖未加载:', deps.missing);
            console.log('当前已加载的组件:', {
                App: typeof window.App !== 'undefined',
                Header: typeof window.Header !== 'undefined',
                ExchangeRateCards: typeof window.ExchangeRateCards !== 'undefined',
                Sidebar: typeof window.Sidebar !== 'undefined',
                ResultsPanel: typeof window.ResultsPanel !== 'undefined',
                CostBreakdown: typeof window.CostBreakdown !== 'undefined',
                FinancePanel: typeof window.FinancePanel !== 'undefined',
                calculations: typeof window.calculations !== 'undefined',
                constants: typeof window.constants !== 'undefined',
                Icon: typeof window.Icon !== 'undefined'
            });
            // 继续等待
            return false;
        }

        console.log('所有依赖已加载');

        const h = React.createElement;
        const App = window.App;

        // 检查 App 组件是否定义
        if (typeof App === 'undefined') {
            console.error('App 组件未定义');
            rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>错误：App 组件未定义</h2><p>请检查代码是否正确。</p></div>';
            return false;
        }

        // 使用 React 18 的 createRoot API
        if (ReactDOM.createRoot) {
            console.log('使用 React 18 createRoot API');
            const root = ReactDOM.createRoot(rootElement);
            root.render(h(App));
        } else {
            console.log('使用 React 17 render API');
            // 降级到 React 17 的 render API
            ReactDOM.render(h(App), rootElement);
        }
        console.log('应用渲染完成');
        return true;
    } catch (error) {
        console.error('Error rendering app:', error);
        console.error('Error stack:', error.stack);
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>渲染错误</h2><p>' + error.message + '</p><pre style="background: #f0f0f0; padding: 10px; overflow: auto;">' + error.stack + '</pre></div>';
        }
        return false;
    }
}

// 等待页面和 Babel 处理完成
function tryRender() {
    const success = renderApp();
    if (!success) {
        // 如果渲染失败，等待一段时间后重试（最多重试 20 次，每次等待 200ms）
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
            attempts++;
            console.log(`尝试渲染 (${attempts}/${maxAttempts})...`);
            const success = renderApp();
            if (success || attempts >= maxAttempts) {
                clearInterval(interval);
                if (attempts >= maxAttempts && !success) {
                    const rootElement = document.getElementById('root');
                    if (rootElement) {
                        rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>错误：组件加载超时</h2><p>请检查浏览器控制台查看详细信息。</p></div>';
                    }
                }
            }
        }, 200);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // 给 Babel 一些时间处理代码
        setTimeout(tryRender, 300);
    });
} else {
    // 页面已加载，给 Babel 一些时间处理代码
    setTimeout(tryRender, 300);
}
