# 费用项目空值修复

## 🐛 问题描述

用户反馈：为什么费用项目必须以0开始？

**问题原因：**
- 添加新费用项目时，默认值设置为 `0`
- 输入框类型为 `number`，空值会显示为 `0`
- 用户希望输入框可以为空，而不是强制显示 `0`

## ✅ 修复方案

### 1. 修改默认值

**修复前：**
```javascript
const addExportExtra = () => setExportExtras([...exportExtras, { 
    id: Date.now(), 
    name: '', 
    value: 0,  // ❌ 默认为 0
    unit: 'RUB/ton' 
}]);
```

**修复后：**
```javascript
const addExportExtra = () => setExportExtras([...exportExtras, { 
    id: Date.now(), 
    name: '', 
    value: '',  // ✅ 默认为空字符串
    unit: 'RUB/ton' 
}]);
```

### 2. 修改输入框处理

**修复前：**
```javascript
h('input', {
    type: "number",
    value: item.value,
    onChange: e => updateExportExtra(item.id, 'value', Number(e.target.value))
})
```

**修复后：**
```javascript
h('input', {
    type: "number",
    value: item.value === '' ? '' : item.value,
    onChange: e => {
        const val = e.target.value;
        updateExportExtra(item.id, 'value', val === '' ? '' : Number(val));
    },
    placeholder: "0"
})
```

### 3. 修改计算函数

**修复前：**
```javascript
const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
    return sum + (item.unit === 'RUB/ton' ? item.value : item.value / tpc);
}, 0);
```

**修复后：**
```javascript
const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
    const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
    return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
}, 0);
```

### 4. 更新类型定义

**修复前：**
```typescript
export interface ExtraItem {
  id: number;
  name: string;
  value: number;  // ❌ 只能是数字
  unit: string;
}
```

**修复后：**
```typescript
export interface ExtraItem {
  id: number;
  name: string;
  value: number | string;  // ✅ 允许空字符串
  unit: string;
}
```

---

## 📝 修改的文件

- ✅ `src/components/App.new.js` - 修改添加函数默认值
- ✅ `src/components/App.tsx` - 修改添加函数默认值
- ✅ `src/components/OverseaSection.js` - 修改输入框处理
- ✅ `src/components/DomesticSection.js` - 修改输入框处理
- ✅ `src/utils/calculations.js` - 修改计算函数处理空值
- ✅ `src/utils/calculations.ts` - 修改 TypeScript 版本计算函数
- ✅ `src/types/index.d.ts` - 更新类型定义

---

## 🎯 修复效果

### 修复前
- ❌ 添加新项目时，金额输入框显示 `0`
- ❌ 用户必须删除 `0` 才能输入新值
- ❌ 空值会被转换为 `0`

### 修复后
- ✅ 添加新项目时，金额输入框为空
- ✅ 用户可以直接输入数值
- ✅ 空值在计算时被视为 `0`（不影响计算结果）
- ✅ 输入框有占位符 `"0"` 提示

---

## 💡 计算逻辑

### 空值处理规则

1. **输入阶段**：
   - 允许空字符串 `''`
   - 允许数字值
   - 空值不会显示为 `0`

2. **计算阶段**：
   - 空字符串 `''` → 转换为 `0`
   - `null` 或 `undefined` → 转换为 `0`
   - 无效数字 → 转换为 `0`
   - 有效数字 → 使用原值

### 示例

```javascript
// 输入值
{ name: '装车费', value: '' }      → 计算时使用 0
{ name: '商检费', value: '300' }  → 计算时使用 300
{ name: '其他费', value: 0 }       → 计算时使用 0
{ name: '运费', value: null }      → 计算时使用 0
```

---

## 🧪 测试

刷新浏览器后，测试以下场景：

1. ✅ 点击"添加海外杂费"按钮
   - 金额输入框应该为空（不显示 `0`）
   - 有占位符 `"0"` 提示

2. ✅ 输入数值
   - 可以正常输入数字
   - 可以清空输入框

3. ✅ 计算功能
   - 空值不影响计算结果（视为 `0`）
   - 有值的项目正常参与计算

---

**修复完成时间**: 2026年2月14日
