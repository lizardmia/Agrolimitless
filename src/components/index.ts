/**
 * 组件导出索引（TypeScript 适配器）
 * 将 JS 组件适配为 TypeScript 可用的模块
 */

// 由于当前组件使用全局变量模式，我们需要动态导入
// 或者创建适配器

// 对于 Vite + TypeScript，我们需要确保组件正确导出
// 这里提供一个适配层

export { Header } from './Header';
export { Icon } from './Icon';

// 其他组件暂时需要通过全局变量访问
// 或者逐步转换为 TypeScript
