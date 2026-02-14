# 组件使用指南

## 📋 组件列表

### 核心组件

1. **Header** - 页面头部
2. **ExchangeRateCards** - 汇率信息卡片
3. **Sidebar** - 侧边栏参数输入（完整版）
4. **ResultsPanel** - 结果展示面板
5. **CostBreakdown** - 成本拆解展示
6. **FinancePanel** - 资金财务杠杆核算

### 子组件

1. **OverseaSection** - 海外段参数输入
2. **PolicySection** - 税收政策输入
3. **DomesticSection** - 国内段参数输入
4. **Icon** - 图标组件

---

## 📦 组件结构

```
src/components/
├── Icon.js              # 图标组件
├── Header.js            # 头部组件
├── ExchangeRateCards.js # 汇率卡片
├── Sidebar.js           # 侧边栏（主组件）
├── OverseaSection.js   # 海外段子组件
├── PolicySection.js     # 税收政策子组件
├── DomesticSection.js   # 国内段子组件
├── ResultsPanel.js      # 结果面板
├── CostBreakdown.js     # 成本拆解
├── FinancePanel.js      # 资金面板
├── App.js              # 原始 App（CDN 版本）
└── App.new.js          # 新 App（模块化版本）
```

---

## 🔌 组件 Props

### Header

```javascript
<Header />
// 无 props
```

### ExchangeRateCards

```javascript
<ExchangeRateCards
    exchangeRate={11.37}
    setExchangeRate={setExchangeRate}
    usdCnyRate={7.11}
    setUsdCnyRate={setUsdCnyRate}
    russianArrivalPriceRub={results.russianArrivalPriceRub}
    russianArrivalPriceCny={results.russianArrivalPriceCny}
/>
```

### Sidebar

```javascript
<Sidebar
    // 产品选择
    category={category}
    setCategory={setCategory}
    subType={subType}
    setSubType={setSubType}
    productCategories={PRODUCT_CATEGORIES}
    handleCategoryChange={handleCategoryChange}
    
    // 海外段参数（传递给 OverseaSection）
    farmPriceRub={farmPriceRub}
    setFarmPriceRub={setFarmPriceRub}
    // ... 更多海外段参数
    
    // 税收政策（传递给 PolicySection）
    policyName={policyName}
    setPolicyName={setPolicyName}
    // ... 更多税收政策参数
    
    // 国内段参数（传递给 DomesticSection）
    importPriceRub={importPriceRub}
    setImportPriceRub={setImportPriceRub}
    // ... 更多国内段参数
/>
```

### ResultsPanel

```javascript
<ResultsPanel
    results={results}
    totalContainers={totalContainers}
    setTotalContainers={setTotalContainers}
    tonsPerContainer={tonsPerContainer}
    setTonsPerContainer={setTonsPerContainer}
/>
```

### CostBreakdown

```javascript
<CostBreakdown
    results={results}
    subType={subType}
    policyName={policyName}
    importPriceRub={importPriceRub}
    exchangeRate={exchangeRate}
    intlFreightUsd={intlFreightUsd}
    usdCnyRate={usdCnyRate}
    tonsPerContainer={tonsPerContainer}
    dutyRate={dutyRate}
    vatRate={vatRate}
/>
```

### FinancePanel

```javascript
<FinancePanel
    collectionDays={collectionDays}
    setCollectionDays={setCollectionDays}
    interestRate={interestRate}
    setInterestRate={setInterestRate}
    interestExpense={results.interestExpense}
/>
```

---

## 🎯 使用示例

### 完整应用示例

```javascript
import { App } from './components/App.new.js';

// App 组件内部已经组合了所有子组件
<App />
```

### 单独使用组件

```javascript
import { Sidebar } from './components/Sidebar.js';
import { ResultsPanel } from './components/ResultsPanel.js';

function MyApp() {
    const [results, setResults] = useState({});
    // ... 状态管理
    
    return (
        <div>
            <Sidebar {...sidebarProps} />
            <ResultsPanel results={results} />
        </div>
    );
}
```

---

## 🔧 自定义组件

### 创建新组件

```javascript
// src/components/MyComponent.js
export function MyComponent({ prop1, prop2 }) {
    const h = React.createElement;
    
    return h('div', { className: "..." },
        // 组件内容
    );
}
```

### 使用组件

```javascript
import { MyComponent } from './components/MyComponent.js';

// 在 App 中使用
h(MyComponent, { prop1: value1, prop2: value2 })
```

---

## 📝 组件开发规范

### 1. 命名规范

- 组件文件名：PascalCase（如 `MyComponent.js`）
- 组件函数名：PascalCase（如 `export function MyComponent`）
- Props 使用解构：`{ prop1, prop2 }`

### 2. Props 类型

虽然当前使用 JavaScript，但建议：
- 使用 JSDoc 注释描述 props
- 为复杂 props 创建类型定义（TypeScript）

### 3. 组件结构

```javascript
/**
 * 组件说明
 */
export function Component({ prop1, prop2 }) {
    const h = React.createElement;
    
    // 1. Hooks（如果有）
    // 2. 计算/处理逻辑
    // 3. 事件处理函数
    // 4. 返回 JSX
    return h('div', { ... }, ...);
}
```

---

## 🐛 调试技巧

### 1. 组件隔离测试

创建测试文件：

```javascript
// test-component.js
import { Sidebar } from './components/Sidebar.js';

// 测试组件
const testProps = {
    category: '谷物类',
    // ... 其他 props
};

// 渲染测试
```

### 2. 使用 React DevTools

安装 React DevTools 浏览器扩展，可以：
- 查看组件树
- 检查 props
- 调试状态

### 3. 控制台日志

```javascript
export function Component({ prop1 }) {
    console.log('Component props:', { prop1 });
    // ...
}
```

---

## 📚 相关文档

- [React 组件文档](https://react.dev/learn/your-first-component)
- [组件设计原则](./PROJECT_STRUCTURE.md)
- [TypeScript 指南](./TYPESCRIPT_GUIDE.md)

---

**最后更新**: 2026年2月
