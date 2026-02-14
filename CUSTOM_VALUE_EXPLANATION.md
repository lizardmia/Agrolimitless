# 关税完税价格计算说明

## ❓ 问题

**如果农场采购价格是 100 RUB/t，海外到站预估是 120 RUB/t，那么关税完税价格是多少？**

---

## ⚠️ 重要说明

**关税完税价格的计算不直接使用"农场采购价格"或"海外到站预估"！**

关税完税价格是基于**"进口结算货值"**计算的，而不是基于农场采购价格或海外到站预估。

---

## 🔢 关税完税价格的计算公式

```
关税完税价格 = 进口结算货值 (CNY/t) + 国际运费 (CNY/t)
customValueCny = importValueCny + intlFreightCnyPerTon
```

### 组成部分

#### 1. 进口结算货值 (CNY/t)

```
importValueCny = normalizedImportPriceRubPerTon / exchangeRate
```

- `normalizedImportPriceRubPerTon`: **进口结算货值**（RUB/t）
- `exchangeRate`: CNY/RUB 汇率

**注意**: `importPriceRub`（进口结算货值）是**独立输入参数**，不是从农场采购价格或海外到站预估计算出来的。

#### 2. 国际运费 (CNY/t)

```
intlFreightCnyPerTon = (intlFreightUsd × usdCnyRate) / tonsPerContainer
```

- `intlFreightUsd`: 中欧班列运费（USD/柜）
- `usdCnyRate`: USD/CNY 汇率
- `tonsPerContainer`: 单柜装载量（吨）

---

## 📊 概念区分

### 1. 农场采购价格 (`farmPriceRub`)

- **含义**: 在俄罗斯农场采购产品的价格
- **单位**: RUB/t
- **用途**: 用于计算"海外到站预估"

### 2. 海外到站预估 (`russianArrivalPriceRub`)

- **含义**: 产品到达俄罗斯到站点的总成本
- **计算公式**:
  ```
  russianArrivalPriceRub = 
      farmPriceRub 
      + 短驳费1 
      + 短驳费2 
      + 海外杂费合计
  ```
- **单位**: RUB/t
- **用途**: 显示海外段的成本

### 3. 进口结算货值 (`importPriceRub`)

- **含义**: **用于海关申报的货值**（通常与海外到站预估不同）
- **单位**: RUB/t 或 RUB/柜
- **用途**: **用于计算关税完税价格**
- **特点**: 这是**独立输入参数**，由用户手动输入

### 4. 关税完税价格 (`customValueCny`)

- **含义**: 用于计算关税和增值税的基础价格
- **计算公式**:
  ```
  customValueCny = importValueCny + intlFreightCnyPerTon
  ```
- **单位**: CNY/t
- **用途**: 作为关税和增值税的计税基础

---

## 💡 示例说明

### 场景设置

假设：
- **农场采购价格**: 100 RUB/t
- **海外到站预估**: 120 RUB/t
- **进口结算货值**: 需要**单独输入**（假设为 110 RUB/t）
- **汇率**: 11.37 CNY/RUB
- **国际运费**: 2000 USD/柜
- **USD/CNY 汇率**: 7.11
- **单柜装载量**: 26 吨

### 计算过程

#### 步骤1: 计算进口结算货值 (CNY/t)

```
importValueCny = 110 / 11.37 = 9.67 CNY/t
```

**注意**: 这里使用的是"进口结算货值"（110 RUB/t），而不是"农场采购价格"（100 RUB/t）或"海外到站预估"（120 RUB/t）。

#### 步骤2: 计算国际运费 (CNY/t)

```
intlFreightCnyPerTon = (2000 × 7.11) / 26
                     = 14220 / 26
                     = 546.92 CNY/t
```

#### 步骤3: 计算关税完税价格

```
关税完税价格 = 9.67 + 546.92 = 556.59 CNY/t
```

---

## 🎯 关键要点

### 1. **进口结算货值是独立参数**

- ❌ **不是**从农场采购价格计算出来的
- ❌ **不是**从海外到站预估计算出来的
- ✅ **是**用户手动输入的独立参数

### 2. **为什么需要单独输入？**

在实际业务中：
- **农场采购价格**: 实际采购成本
- **海外到站预估**: 包含所有海外段费用的总成本
- **进口结算货值**: 用于海关申报的货值（可能与实际成本不同）

海关申报时，通常使用**合同价格**或**发票价格**，而不是实际采购成本。

### 3. **关税完税价格的计算流程**

```
进口结算货值 (RUB/t)
  ↓
除以汇率
  ↓
进口结算货值 (CNY/t)
  ↓
加上国际运费 (CNY/t)
  ↓
关税完税价格 (CNY/t)
```

---

## 📋 完整计算链

```
农场采购价格 (100 RUB/t)
  ↓
+ 短驳费1 + 短驳费2 + 海外杂费
  ↓
海外到站预估 (120 RUB/t)
  ↓
（不用于关税完税价格计算）

进口结算货值 (110 RUB/t) ← 独立输入
  ↓
除以汇率 (11.37)
  ↓
进口结算货值 (9.67 CNY/t)
  ↓
+ 国际运费 (546.92 CNY/t)
  ↓
关税完税价格 (556.59 CNY/t)
```

---

## 🔍 代码位置

**文件**: `src/utils/calculations.ts`

**关键代码**:
```typescript
// 进口结算货值标准化
const normalizedImportPriceRubPerTon = importPriceUnit === 'RUB/t' 
    ? importPriceRub 
    : importPriceRub / tpc;

// 进口结算货值 (CNY/t)
const importValueCny = normalizedImportPriceRubPerTon / (exchangeRate || 1);

// 国际运费 (CNY/t)
const intlFreightCnyPerTon = (intlFreightUsd * usdCnyRate) / tpc;

// 关税完税价格
const customValueCny = importValueCny + intlFreightCnyPerTon;
```

---

## ❓ 回答原问题

**如果农场采购价格是 100 RUB/t，海外到站预估是 120 RUB/t，那么关税完税价格是多少？**

**答案**: **无法直接计算！**

因为关税完税价格需要以下信息：
1. ✅ **进口结算货值**（需要单独输入，不是从农场采购价格或海外到站预估计算）
2. ✅ **汇率** (CNY/RUB)
3. ✅ **国际运费** (USD/柜)
4. ✅ **USD/CNY 汇率**
5. ✅ **单柜装载量** (吨)

**如果已知进口结算货值**，例如：
- 进口结算货值 = 110 RUB/t
- 汇率 = 11.37 CNY/RUB
- 国际运费 = 2000 USD/柜
- USD/CNY 汇率 = 7.11
- 单柜装载量 = 26 吨

则：
```
关税完税价格 = (110 / 11.37) + ((2000 × 7.11) / 26)
            = 9.67 + 546.92
            = 556.59 CNY/t
```

---

## 📚 相关文档

- [计算规则文档.md](./计算规则文档.md) - 完整的计算规则说明
- [BASE_PRICE_CALCULATION.md](./BASE_PRICE_CALCULATION.md) - 基础单价计算说明
- [OVERSEA_ARRIVAL_CALCULATION.md](./OVERSEA_ARRIVAL_CALCULATION.md) - 海外到站预估计算说明

---

**文档创建时间**: 2026年2月14日
