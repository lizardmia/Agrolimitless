# 数字输入框 0 值显示修复

## 🐛 问题描述

用户反馈：为什么短驳费等数字输入框前面有个 `0`？

**问题原因：**
- 当数字输入框的值为 `0` 时，会显示 `0`
- 用户希望输入框可以为空，而不是强制显示 `0`
- 影响用户体验，需要删除 `0` 才能输入新值

## ✅ 修复方案

### 统一处理所有数字输入框

为所有数字输入框添加空值处理：

**修复前：**
```javascript
h('input', {
    type: "number",
    value: overseaLogistics2,
    onChange: e => setOverseaLogistics2(Number(e.target.value))
})
```

**修复后：**
```javascript
h('input', {
    type: "number",
    value: overseaLogistics2 === 0 ? '' : overseaLogistics2,
    onChange: e => {
        const val = e.target.value;
        setOverseaLogistics2(val === '' ? 0 : Number(val));
    },
    placeholder: "0"
})
```

### 修复逻辑

1. **显示逻辑**：
   - 如果值为 `0`，显示空字符串 `''`
   - 否则显示实际值

2. **输入逻辑**：
   - 如果输入为空，设置为 `0`
   - 否则转换为数字

3. **占位符**：
   - 添加 `placeholder: "0"` 提示用户

---

## 📝 修复的文件列表

### 海外段参数
- ✅ `src/components/OverseaSection.js`
  - 农场采购价 (`farmPriceRub`)
  - 短驳费1 (`overseaLogistics1`)
  - 短驳费2 (`overseaLogistics2`)

### 汇率参数
- ✅ `src/components/ExchangeRateCards.js`
  - CNY/RUB 汇率 (`exchangeRate`)
  - USD/CNY 汇率 (`usdCnyRate`)

### 税收政策参数
- ✅ `src/components/PolicySection.js`
  - 关税税率 (`dutyRate`)
  - 增值税率 (`vatRate`)

### 国内段参数
- ✅ `src/components/DomesticSection.js`
  - 进口结算货值 (`importPriceRub`)
  - 中欧班列运费 (`intlFreightUsd`)
  - 国内短驳费 (`domesticShortHaulCny`)
  - 目标销售单价 (`sellingPriceCny`)

### 批次参数
- ✅ `src/components/ResultsPanel.js`
  - 批次总柜数 (`totalContainers`)
  - 单柜装载 (`tonsPerContainer`)

---

## 🎯 修复效果

### 修复前
- ❌ 值为 `0` 时，输入框显示 `0`
- ❌ 用户必须删除 `0` 才能输入新值
- ❌ 影响输入体验

### 修复后
- ✅ 值为 `0` 时，输入框为空
- ✅ 有占位符 `"0"` 提示
- ✅ 用户可以直接输入数值
- ✅ 空值在计算时视为 `0`（不影响计算结果）

---

## 💡 计算逻辑

### 空值处理

所有数字输入框的空值处理规则：

1. **显示阶段**：
   - `0` → 显示为空
   - 其他值 → 正常显示

2. **输入阶段**：
   - 空字符串 `''` → 存储为 `0`
   - 有效数字 → 存储为数字

3. **计算阶段**：
   - 所有计算函数已经正确处理 `0` 值
   - 空值不会影响计算结果

---

## 🧪 测试场景

刷新浏览器后，测试以下场景：

1. ✅ **短驳费2**（默认值为 0）
   - 输入框应该为空
   - 有占位符 `"0"` 提示
   - 可以直接输入数值

2. ✅ **关税税率**（默认值为 0）
   - 输入框应该为空
   - 有占位符 `"0"` 提示
   - 可以直接输入数值

3. ✅ **其他数字输入框**
   - 所有值为 `0` 的输入框都为空
   - 有占位符提示
   - 可以正常输入

---

## 📊 修复统计

- **修复的输入框数量**: 12+ 个
- **涉及的文件**: 5 个组件文件
- **用户体验**: ✅ 显著提升

---

**修复完成时间**: 2026年2月14日
