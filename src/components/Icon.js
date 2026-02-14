/**
 * Icon 组件 - SVG 图标库
 * 使用 React.createElement 创建 SVG 图标
 */

const Icon = ({ name, size = 24, className = "", ...props }) => {
    const h = React.createElement;
    
    const icons = {
        Calculator: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('rect', { width: 16, height: 20, x: 4, y: 2, rx: 2 }),
            h('line', { x1: 8, y1: 6, x2: 16, y2: 6 }),
            h('line', { x1: 8, y1: 10, x2: 16, y2: 10 }),
            h('line', { x1: 8, y1: 14, x2: 16, y2: 14 }),
            h('line', { x1: 8, y1: 18, x2: 16, y2: 18 })
        ),
        Globe: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('line', { x1: 2, y1: 12, x2: 22, y2: 12 }),
            h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
        ),
        TrendingUp: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
            h('polyline', { points: '17 6 23 6 23 12' })
        ),
        MapPin: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
            h('circle', { cx: 12, cy: 10, r: 3 })
        ),
        Settings: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
            h('circle', { cx: 12, cy: 12, r: 3 })
        ),
        CheckCircle2: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
            h('polyline', { points: '22 4 12 14.01 9 11.01' })
        ),
        Plus: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
            h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
        ),
        Trash2: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M3 6h18' }),
            h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
            h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
            h('line', { x1: 10, y1: 11, x2: 10, y2: 17 }),
            h('line', { x1: 14, y1: 11, x2: 14, y2: 17 })
        ),
        Save: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
            h('polyline', { points: '17 21 17 13 7 13 7 21' }),
            h('polyline', { points: '7 3 7 8 15 8' })
        ),
        ShieldCheck: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.94a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }),
            h('path', { d: 'm9 12 2 2 4-4' })
        ),
        Truck: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('path', { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }),
            h('path', { d: 'M15 18H9' }),
            h('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3h-3' }),
            h('path', { d: 'M18 12h2' }),
            h('path', { d: 'M3 18h1' }),
            h('path', { d: 'M6 18h1' })
        ),
        Clock: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('polyline', { points: '12 6 12 12 16 14' })
        ),
        Info: (size) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
            h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 })
        )
    };
    
    const IconComponent = icons[name];
    if (!IconComponent) return null;
    return h('span', { className: `inline-flex items-center justify-center ${className}` }, IconComponent(size));
};

// 导出到全局（兼容 CDN 模式）
// 使用立即执行确保在 Babel 处理时正确导出
(function() {
    if (typeof window !== 'undefined') {
        window.Icon = Icon;
        console.log('Icon 已导出到全局');
    }
})();

// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
// 如果需要 ES6 模块支持，请使用 Vite 构建版本
