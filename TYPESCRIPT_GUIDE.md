# TypeScript 使用指南

## 📋 目录

1. [安装 TypeScript](#安装-typescript)
2. [类型定义](#类型定义)
3. [使用 TypeScript](#使用-typescript)
4. [迁移指南](#迁移指南)

---

## 🔧 安装 TypeScript

### 安装依赖

```bash
npm install
```

这会自动安装 TypeScript 和相关类型定义。

### 验证安装

```bash
npx tsc --version
```

---

## 📝 类型定义

### 核心类型

所有类型定义在 `src/types/index.d.ts`：

- `PricingParams` - 计算参数类型
- `PricingResults` - 计算结果类型
- `ProductCategory` - 产品类别
- `ProductSubType` - 产品规格
- `ExtraItem` - 杂费项目
- `PolicyData` - 税收政策数据

### 使用示例

```typescript
import type { PricingParams, PricingResults } from '@types';

const params: PricingParams = {
    exchangeRate: 11.37,
    usdCnyRate: 7.11,
    // ...
};

const results: PricingResults = calculatePricing(params);
```

---

## 🚀 使用 TypeScript

### 开发模式

```bash
npm run dev
```

Vite 会自动处理 TypeScript 文件。

### 类型检查

```bash
# 检查类型错误
npx tsc --noEmit

# 监听模式
npx tsc --noEmit --watch
```

### 构建

```bash
npm run build
```

TypeScript 会被编译为 JavaScript。

---

## 📦 文件结构

```
src/
├── types/
│   └── index.d.ts          # 类型定义
├── utils/
│   ├── calculations.js     # JavaScript 版本
│   └── calculations.ts     # TypeScript 版本
├── components/
│   ├── *.js                # JavaScript 组件
│   └── *.tsx               # TypeScript 组件（待创建）
└── main.tsx                 # TypeScript 入口文件
```

---

## 🔄 迁移指南

### 步骤 1: 重命名文件

```bash
# 将 .js 文件重命名为 .tsx
mv src/components/App.new.js src/components/App.new.tsx
mv src/utils/calculations.js src/utils/calculations.ts
```

### 步骤 2: 添加类型注解

```typescript
// 之前
export function calculatePricing(params) {
    // ...
}

// 之后
import type { PricingParams, PricingResults } from '../types';

export function calculatePricing(params: PricingParams): PricingResults {
    // ...
}
```

### 步骤 3: 更新导入

```typescript
// 使用类型导入
import type { PricingParams } from '@types';
import { calculatePricing } from '@utils/calculations';
```

---

## 💡 最佳实践

### 1. 使用类型导入

```typescript
// ✅ 推荐
import type { PricingParams } from '@types';

// ❌ 不推荐
import { PricingParams } from '@types';
```

### 2. 组件 Props 类型

```typescript
interface ComponentProps {
    value: number;
    onChange: (value: number) => void;
}

export function Component({ value, onChange }: ComponentProps) {
    // ...
}
```

### 3. 使用类型断言

```typescript
// 当确定类型时
const element = document.getElementById('root')!;
```

### 4. 可选属性

```typescript
interface Config {
    required: string;
    optional?: number;
}
```

---

## 🐛 常见问题

### Q: TypeScript 错误但代码能运行？

A: TypeScript 是静态类型检查，不影响运行时。使用 `// @ts-ignore` 临时忽略错误，但应该修复类型问题。

### Q: 如何禁用严格模式？

A: 在 `tsconfig.json` 中设置 `"strict": false`（不推荐）。

### Q: 如何处理第三方库没有类型定义？

A: 创建 `src/types/vendor.d.ts`：

```typescript
declare module 'library-name' {
    export function someFunction(): void;
}
```

---

## 📚 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript 指南](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript 配置](https://vitejs.dev/guide/features.html#typescript)

---

**最后更新**: 2026年2月
