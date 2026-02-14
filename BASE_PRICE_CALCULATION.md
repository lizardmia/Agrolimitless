# 基础单价 (不含息) 计算说明

## 📋 概述

**基础单价 (不含息)** 是产品落地到国内后的完整成本价格，**不包含资金占用成本**。这是计算利润和资金需求的基础指标。

**显示位置**: `ResultsPanel` 组件的核心指标卡片区域  
**代码字段**: `baseLandingPrice`  
**单位**: CNY/t（人民币/吨）

---

## 🔢 计算公式

### 主公式

```
baseLandingPrice = 
    customValueCny 
    + dutyCny 
    + vatCny 
    + domesticLogisticsCnyPerTon
```

### 公式分解

#### 1. 关税完税价格 (`customValueCny`)

```
customValueCny = importValueCny + intlFreightCnyPerTon
```

**组成部分**：

- **进口结算货值 (CNY/t)**:
  ```
  importValueCny = normalizedImportPriceRubPerTon / exchangeRate
  ```
  - `normalizedImportPriceRubPerTon`: 标准化的进口结算货值（RUB/t）
  - `exchangeRate`: CNY/RUB 汇率

- **国际运费 (CNY/t)**:
  ```
  intlFreightCnyPerTon = (intlFreightUsd × usdCnyRate) / tonsPerContainer
  ```
  - `intlFreightUsd`: 中欧班列运费（USD/柜）
  - `usdCnyRate`: USD/CNY 汇率
  - `tonsPerContainer`: 单柜装载量（吨）

#### 2. 关税 (`dutyCny`)

```
dutyCny = customValueCny × (dutyRate / 100)
```

- `dutyRate`: 关税税率（%）

#### 3. 增值税 (`vatCny`)

```
vatCny = (customValueCny + dutyCny) × (vatRate / 100)
```

- `vatRate`: 增值税率（%）
- **注意**: 增值税的计税基础是完税价格 + 关税

#### 4. 国内物流总费用 (`domesticLogisticsCnyPerTon`)

```
domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal
```

**组成部分**：

- **国内短驳费标准化**:
  ```
  domesticLogisticsBase = domesticShortHaulCny / tonsPerContainer
  ```
  - `domesticShortHaulCny`: 国内陆运/短驳费（CNY/柜）

- **国内杂费合计**:
  ```
  dynamicExtrasTotal = Σ(每个国内杂费项目)
  ```
  对于每个杂费项目：
  - 如果 `item.unit === 'CNY/ton'`: 直接使用 `item.value`
  - 如果 `item.unit === 'CNY/柜'`: 使用 `item.value / tonsPerContainer`

---

## 📊 完整计算流程

```
开始
  ↓
[步骤1] 计算进口结算货值 (CNY/t)
  importValueCny = normalizedImportPriceRubPerTon / exchangeRate
  ↓
[步骤2] 计算国际运费 (CNY/t)
  intlFreightCnyPerTon = (intlFreightUsd × usdCnyRate) / tonsPerContainer
  ↓
[步骤3] 计算关税完税价格
  customValueCny = importValueCny + intlFreightCnyPerTon
  ↓
[步骤4] 计算关税
  dutyCny = customValueCny × (dutyRate / 100)
  ↓
[步骤5] 计算增值税
  vatCny = (customValueCny + dutyCny) × (vatRate / 100)
  ↓
[步骤6] 计算国内物流总费用
  domesticLogisticsBase = domesticShortHaulCny / tonsPerContainer
  dynamicExtrasTotal = Σ(国内杂费项目)
  domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal
  ↓
[步骤7] 计算基础单价 (不含息)
  baseLandingPrice = customValueCny + dutyCny + vatCny + domesticLogisticsCnyPerTon
  ↓
结束
```

---

## 💡 计算示例

### 示例数据

```
汇率参数:
  exchangeRate = 11.37 (CNY/RUB)
  usdCnyRate = 7.11 (USD/CNY)

批次参数:
  tonsPerContainer = 26 (吨/柜)

国内段参数:
  importPriceRub = 37000 (RUB/t)
  importPriceUnit = 'RUB/t'
  intlFreightUsd = 2000 (USD/柜)
  domesticShortHaulCny = 4680 (CNY/柜)
  domesticExtras = [
    { name: '港杂费', value: 1500, unit: 'CNY/柜' },
    { name: '代理费', value: 944, unit: 'CNY/柜' }
  ]

税收政策:
  dutyRate = 0 (%)
  vatRate = 9 (%)
```

### 计算过程

#### 步骤1: 计算进口结算货值 (CNY/t)

```
normalizedImportPriceRubPerTon = 37000 RUB/t (已经是 RUB/t)
importValueCny = 37000 / 11.37 = 3254.18 CNY/t
```

#### 步骤2: 计算国际运费 (CNY/t)

```
intlFreightCnyPerTon = (2000 × 7.11) / 26
                     = 14220 / 26
                     = 546.92 CNY/t
```

#### 步骤3: 计算关税完税价格

```
customValueCny = 3254.18 + 546.92 = 3801.10 CNY/t
```

#### 步骤4: 计算关税

```
dutyCny = 3801.10 × (0 / 100) = 0 CNY/t
```

#### 步骤5: 计算增值税

```
vatCny = (3801.10 + 0) × (9 / 100)
       = 3801.10 × 0.09
       = 342.10 CNY/t
```

#### 步骤6: 计算国内物流总费用

```
domesticLogisticsBase = 4680 / 26 = 180.00 CNY/t

dynamicExtrasTotal = (1500 / 26) + (944 / 26)
                   = 57.69 + 36.31
                   = 94.00 CNY/t

domesticLogisticsCnyPerTon = 180.00 + 94.00 = 274.00 CNY/t
```

#### 步骤7: 计算基础单价 (不含息)

```
baseLandingPrice = 3801.10 + 0 + 342.10 + 274.00
                 = 4417.20 CNY/t
```

---

## 🎯 关键要点

### 1. **"不含息"的含义**

- ✅ **包含**: 进口货值、国际运费、关税、增值税、国内物流费用
- ❌ **不包含**: 资金占用成本（利息）

### 2. **单位标准化**

所有费用都需要转换为 **CNY/t**（人民币/吨）：

- **按柜费用** → 除以 `tonsPerContainer`
- **按吨费用** → 直接使用

### 3. **增值税计算顺序**

增值税的计税基础是：
```
计税基础 = 关税完税价格 + 关税
```

因此，增值税的计算顺序必须在关税之后。

### 4. **与"总计单价 (含息)"的关系**

```
总计单价 (含息) = 基础单价 (不含息) + 资金占用财务成本
fullCost = baseLandingPrice + interestExpense
```

### 5. **与利润计算的关系**

```
毛利 (不含息) = 销售单价 - 基础单价 (不含息)
profitNoInterest = sellingPriceCny - baseLandingPrice

预计净利 (含息) = 销售单价 - 总计单价 (含息)
profitWithInterest = sellingPriceCny - fullCost
```

---

## 📈 影响因素

以下参数的变化会影响"基础单价 (不含息)"：

| 参数类别 | 参数名称 | 影响方向 |
|---------|---------|---------|
| 汇率 | CNY/RUB 汇率 | 直接影响进口货值 |
| 汇率 | USD/CNY 汇率 | 直接影响国际运费 |
| 国内段 | 进口结算货值 | 正相关 |
| 国内段 | 中欧班列运费 | 正相关 |
| 税收政策 | 关税税率 | 正相关（影响关税） |
| 税收政策 | 增值税率 | 正相关（影响增值税） |
| 国内段 | 国内短驳费 | 正相关 |
| 国内段 | 国内杂费 | 正相关 |
| 批次参数 | 单柜装载量 | 反相关（影响单位转换） |

---

## 🔍 代码位置

### 计算函数

**文件**: `src/utils/calculations.ts` (或 `calculations.js`)

**函数**: `calculatePricing()`

**关键代码**:
```typescript
// 国内段计算
const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);
const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;
const customValueCny = importValueCny + intlFreightCnyPerTon;
const dutyCny = customValueCny * (dutyRate / 100);
const vatCny = (customValueCny + dutyCny) * (vatRate / 100);

const domesticLogisticsBase = domesticShortHaulCny / tpc;
const dynamicExtrasTotal = domesticExtras.reduce((sum, item) => {
    const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
    return sum + (item.unit === 'CNY/ton' ? value : value / tpc);
}, 0);
const domesticLogisticsCnyPerTon = domesticLogisticsBase + dynamicExtrasTotal;

const baseLandingPrice = customValueCny + dutyCny + vatCny + domesticLogisticsCnyPerTon;
```

### 显示组件

**文件**: `src/components/ResultsPanel.js`

**显示代码**:
```javascript
h('div', { className: "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform" },
    h('p', { className: "text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight" }, "基础单价 (不含息)"),
    h('div', { className: "flex items-baseline" },
        h('span', { className: "text-sm font-bold mr-1 text-slate-400" }, "¥"),
        h('span', { className: "text-2xl font-black text-[#1a2b4b] tracking-tighter" },
            formatCurrencyLocal(results.baseLandingPrice, { maximumFractionDigits: 2 })
        )
    )
)
```

---

## 📚 相关文档

- [计算规则文档.md](./计算规则文档.md) - 完整的计算规则说明
- [OVERSEA_ARRIVAL_CALCULATION.md](./OVERSEA_ARRIVAL_CALCULATION.md) - 海外到站预估计算说明

---

**文档创建时间**: 2026年2月14日
