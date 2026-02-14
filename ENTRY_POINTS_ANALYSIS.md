# 项目入口文件分析

## 📋 项目结构概览

项目支持**两种运行模式**，每种模式有不同的入口文件：

---

## 🎯 模式一：CDN 模式（当前主要使用）

### 入口文件链

```
index.modular.html
    ↓
src/index.js (JavaScript 入口)
    ↓
window.App (全局变量)
    ↓
src/components/App.new.js (主组件)
```

### 详细说明

1. **HTML 入口**: `index.modular.html`
   - 使用 CDN 加载 React、ReactDOM、Babel Standalone
   - 通过 `<script type="text/babel" src="...">` 加载所有组件
   - 最后加载 `src/index.js`

2. **JavaScript 入口**: `src/index.js`
   - 检查所有依赖是否加载完成
   - 从 `window.App` 获取 App 组件
   - 使用 `ReactDOM.createRoot` 渲染应用

3. **App 组件**: `src/components/App.new.js`
   - 通过全局变量 `window.App` 导出
   - 使用 `React.createElement` 创建组件
   - 依赖其他全局组件（`window.Header`, `window.Sidebar` 等）

### 启动方式

```bash
python3 dev-server.py
# 访问: http://localhost:8000/index.modular.html
```

---

## ⚡ 模式二：Vite 模式（TypeScript 版本）

### 入口文件链

```
index.vite.html
    ↓
src/main.tsx (TypeScript 入口)
    ↓
import { App } from './components/App'
    ↓
src/components/App.tsx (主组件)
```

### 详细说明

1. **HTML 入口**: `index.vite.html`
   - 最小化 HTML，只包含 `<div id="root">`
   - 通过 `<script type="module" src="/src/main.tsx">` 加载入口

2. **TypeScript 入口**: `src/main.tsx`
   - 使用 ES6 模块导入
   - 导入 `App` 组件：`import { App } from './components/App'`
   - 使用 JSX 语法：`<App />`

3. **App 组件**: `src/components/App.tsx`
   - TypeScript + JSX 版本
   - 使用 ES6 模块导入其他组件
   - ⚠️ **当前有 9+ 个错误**（需要修复）

### 启动方式

```bash
npm run dev
# 访问: http://localhost:8000
```

---

## 📁 App 组件文件说明

### 1. `src/components/App.js` (678 行)
- **状态**: 原始版本，单文件包含所有逻辑
- **用途**: 历史参考，可能不再使用
- **建议**: 可以删除或保留作为参考

### 2. `src/components/App.new.js` (273 行) ✅ **当前使用**
- **状态**: CDN 模式使用的版本
- **特点**: 
  - 使用 `React.createElement`
  - 通过全局变量访问组件
  - 已修复所有依赖问题
- **导出**: `window.App`

### 3. `src/components/App.tsx` (208 行) ⚠️ **有错误**
- **状态**: Vite 模式使用的版本
- **特点**:
  - TypeScript + JSX
  - ES6 模块导入
  - **当前有 9+ 个编译错误**
- **问题**: 可能导入路径不正确或类型错误

---

## 🔍 当前使用的入口

根据 `dev-server.py` 的配置：

```python
# 优先使用模块化版本
if os.path.exists('index.modular.html'):
    url = f"http://localhost:8000/index.modular.html"
elif os.path.exists('index.html'):
    url = f"http://localhost:8000/index.html"
else:
    url = f"http://localhost:8000/pricing-dashboard.html"
```

**当前主要入口**: `index.modular.html` → `src/index.js` → `App.new.js`

---

## 🛠️ 修复建议

### App.tsx 的错误修复

`App.tsx` 当前有 9+ 个错误，可能的原因：

1. **导入路径问题**
   ```typescript
   // 当前代码
   import { ExchangeRateCards } from './ExchangeRateCards.js';
   
   // 问题：JS 文件没有 ES6 export，应该使用全局变量或修复导入
   ```

2. **类型错误**
   - 可能需要添加类型定义
   - 检查 `src/types/index.d.ts` 是否完整

3. **组件导出问题**
   - JS 组件没有 ES6 export（已移除）
   - TypeScript 版本需要不同的导入方式

### 建议的修复方案

**方案一：修复 App.tsx 的导入**
- 创建 TypeScript 版本的组件包装器
- 或者修改导入方式使用全局变量

**方案二：统一使用 CDN 模式**
- 专注于 `App.new.js`
- 暂时不使用 Vite 模式

---

## 📊 文件使用情况总结

| 文件 | 模式 | 状态 | 用途 |
|------|------|------|------|
| `index.modular.html` | CDN | ✅ 使用中 | 主要入口 |
| `src/index.js` | CDN | ✅ 使用中 | JS 入口 |
| `src/components/App.new.js` | CDN | ✅ 使用中 | 主组件 |
| `index.vite.html` | Vite | ⚠️ 待修复 | TypeScript 入口 |
| `src/main.tsx` | Vite | ⚠️ 待修复 | TS 入口 |
| `src/components/App.tsx` | Vite | ⚠️ 有错误 | TS 主组件 |
| `src/components/App.js` | - | 📦 参考 | 原始版本 |

---

## 🎯 推荐操作

1. **当前开发**: 继续使用 CDN 模式（`index.modular.html`）
2. **修复 Vite 模式**: 修复 `App.tsx` 的错误（如果需要）
3. **清理文件**: 考虑删除或归档 `App.js`（如果不再需要）

---

**最后更新**: 2026年2月14日
