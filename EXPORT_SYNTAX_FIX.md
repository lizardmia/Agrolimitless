# Export 语法错误修复

## 🐛 问题描述

浏览器控制台出现错误：
```
Uncaught SyntaxError: `import` can only be used in `import()` or `import.meta`. (86:45)
```

## 🔍 问题原因

在 `ExchangeRateCards.js` 文件中，尝试使用 `typeof import` 来检查模块环境：

```javascript
// ❌ 错误代码
if (typeof window === 'undefined' || (typeof import !== 'undefined' && typeof import.meta !== 'undefined')) {
    export { ExchangeRateCards };
}
```

**问题：**
- `import` 是一个关键字，不能用于 `typeof` 检查
- 在非模块环境中，`import` 关键字会导致语法错误
- Babel Standalone 在转换代码时会遇到这个问题

## ✅ 修复方案

**移除条件 ES6 export**

由于 CDN 模式使用 Babel Standalone，它会将 ES6 `export` 转换为 CommonJS，导致 `exports is not defined` 错误。因此，在 CDN 模式下不应该使用 ES6 export。

**修复后的代码：**
```javascript
// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.ExchangeRateCards = ExchangeRateCards;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
// 如果需要 ES6 模块支持，请使用 Vite 构建版本
```

## 📝 说明

### CDN 模式 vs Vite 模式

- **CDN 模式**：
  - 只使用全局变量导出（`window.xxx`）
  - 不使用 ES6 `export` 语句
  - 通过 Babel Standalone 在浏览器中转换 JSX

- **Vite 模式**：
  - 使用 ES6 模块系统
  - 支持 `import/export`
  - TypeScript 文件（`.tsx`）可以使用 ES6 export

### 为什么不能使用条件 export？

1. **语法限制**：`import` 是关键字，不能用于 `typeof` 检查
2. **Babel 转换**：Babel Standalone 会转换所有 `export` 语句
3. **环境检测困难**：无法可靠地检测是否在模块环境中

### 解决方案

- **CDN 模式**：只使用全局变量导出
- **Vite 模式**：使用 TypeScript 文件（`.tsx`），支持 ES6 export
- **类型声明**：通过 `.d.ts` 文件为 JS 文件提供类型支持

---

**修复完成时间**: 2026年2月14日
