# TypeScript 迁移指南

## 📋 当前状态

### 已完成的 TypeScript 文件

- ✅ `src/main.tsx` - 入口文件
- ✅ `src/components/App.tsx` - 主应用组件
- ✅ `src/components/Header.tsx` - 头部组件
- ✅ `src/components/Icon.tsx` - 图标组件
- ✅ `src/utils/calculations.ts` - 计算工具（TypeScript 版本）
- ✅ `src/types/index.d.ts` - 类型定义

### 待迁移的组件

以下组件仍使用 JavaScript + React.createElement 模式：

- `ExchangeRateCards.js`
- `Sidebar.js`
- `OverseaSection.js`
- `PolicySection.js`
- `DomesticSection.js`
- `ResultsPanel.js`
- `CostBreakdown.js`
- `FinancePanel.js`

---

## 🔄 迁移策略

### 方案一：逐步迁移（推荐）

1. **保持 JS 组件可用**
   - JS 组件通过全局变量导出
   - TypeScript 组件通过适配器使用

2. **逐步转换**
   - 每次转换一个组件
   - 保持功能不变
   - 添加类型注解

### 方案二：使用适配器

创建适配器文件，让 TypeScript 可以使用 JS 组件：

```typescript
// src/components/adapters.ts
import React from 'react';

// 声明全局组件类型
declare global {
    interface Window {
        ExchangeRateCards: React.ComponentType<any>;
        Sidebar: React.ComponentType<any>;
        // ... 其他组件
    }
}

// 导出适配的组件
export const ExchangeRateCards = window.ExchangeRateCards;
export const Sidebar = window.Sidebar;
// ...
```

---

## 🛠️ 迁移步骤

### 步骤 1: 转换组件为 JSX

将 `React.createElement` 转换为 JSX：

**之前（JS）:**
```javascript
return h('div', { className: "..." },
    h('h1', null, "标题")
);
```

**之后（TSX）:**
```typescript
return (
    <div className="...">
        <h1>标题</h1>
    </div>
);
```

### 步骤 2: 添加类型注解

```typescript
interface ComponentProps {
    value: number;
    onChange: (value: number) => void;
}

export function Component({ value, onChange }: ComponentProps) {
    // ...
}
```

### 步骤 3: 更新导入

```typescript
// 之前
import { Component } from './Component.js';

// 之后
import { Component } from './Component';
```

---

## 📝 组件迁移示例

### ExchangeRateCards 组件迁移

**之前（JS）:**
```javascript
export function ExchangeRateCards({ exchangeRate, setExchangeRate }) {
    const h = React.createElement;
    return h('div', { className: "..." }, ...);
}
```

**之后（TSX）:**
```typescript
interface ExchangeRateCardsProps {
    exchangeRate: number;
    setExchangeRate: (value: number) => void;
    usdCnyRate: number;
    setUsdCnyRate: (value: number) => void;
    russianArrivalPriceRub: number;
    russianArrivalPriceCny: number;
}

export function ExchangeRateCards({
    exchangeRate,
    setExchangeRate,
    usdCnyRate,
    setUsdCnyRate,
    russianArrivalPriceRub,
    russianArrivalPriceCny
}: ExchangeRateCardsProps) {
    return (
        <div className="...">
            {/* JSX 内容 */}
        </div>
    );
}
```

---

## 🚀 快速开始

### 使用当前混合模式

当前项目支持混合模式：
- TypeScript 入口和主组件
- JavaScript 子组件（通过全局变量）

**启动开发服务器：**
```bash
npm install
npm run dev
```

### 完全迁移到 TypeScript

1. **转换所有组件为 TSX**
   ```bash
   # 重命名文件
   mv src/components/ExchangeRateCards.js src/components/ExchangeRateCards.tsx
   ```

2. **添加类型注解**
   - 添加 Props 接口
   - 添加返回类型

3. **更新导入**
   - 移除 `.js` 扩展名
   - 使用 ES6 导入

---

## 💡 最佳实践

### 1. 类型定义优先

先定义类型，再实现组件：

```typescript
interface Props {
    // ...
}

export function Component(props: Props) {
    // ...
}
```

### 2. 使用类型导入

```typescript
import type { PricingResults } from '../types';
```

### 3. 组件 Props 类型

```typescript
interface ComponentProps {
    required: string;
    optional?: number;
    callback: (value: number) => void;
}
```

### 4. 事件处理类型

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
};
```

---

## 🔧 工具支持

### VSCode 扩展推荐

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript Vue Plugin** - TS 支持

### 配置建议

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 📚 相关资源

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vite TypeScript 指南](https://vitejs.dev/guide/features.html#typescript)

---

**最后更新**: 2026年2月
