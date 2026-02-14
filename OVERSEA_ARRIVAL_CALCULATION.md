# 海外到站预估计算说明

## 📊 什么是"海外到站预估"？

"海外到站预估"是指**俄罗斯到站价格**，表示货物从农场采购到俄罗斯到站点的总成本。

## 🧮 计算公式

### 俄罗斯到站价格（RUB/吨）

```
russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub
```

**详细分解：**

1. **农场采购价** (`farmPriceRub`)
   - 单位：RUB/t（卢布/吨）
   - 默认值：35000 RUB/t

2. **短驳费1** (`log1`)
   - 如果单位是 `RUB/t`：直接使用 `overseaLogistics1`
   - 如果单位是 `RUB/柜`：转换为 `overseaLogistics1 / tonsPerContainer`
   - 公式：`log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc`
   - 默认值：1346.15 RUB/t

3. **短驳费2** (`log2`)
   - 如果单位是 `RUB/t`：直接使用 `overseaLogistics2`
   - 如果单位是 `RUB/柜`：转换为 `overseaLogistics2 / tonsPerContainer`
   - 公式：`log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc`
   - 默认值：0 RUB/t

4. **海外杂费合计** (`exportExtrasTotalRub`)
   - 遍历所有海外杂费项目
   - 如果单位是 `RUB/ton`：直接累加 `item.value`
   - 如果单位是 `RUB/container`：转换为 `item.value / tonsPerContainer` 后累加
   - 空值视为 `0`
   - 公式：
     ```javascript
     exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
         const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
         return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
     }, 0);
     ```
   - 默认值：1500 RUB/t（装车费 1200 + 商检费 300）

### 俄罗斯到站价格（CNY/吨）

```
russianArrivalPriceCny = russianArrivalPriceRub / exchangeRate
```

- **汇率** (`exchangeRate`)：CNY/RUB 汇率
- 默认值：11.37
- 将卢布价格转换为人民币价格

---

## 📝 计算示例

### 示例数据

- 农场采购价：35000 RUB/t
- 短驳费1：1346.15 RUB/t
- 短驳费2：0 RUB/t
- 海外杂费：
  - 装车费：1200 RUB/ton
  - 商检费：300 RUB/ton
- 汇率：11.37 CNY/RUB

### 计算过程

**步骤 1：计算海外杂费合计**
```
exportExtrasTotalRub = 1200 + 300 = 1500 RUB/t
```

**步骤 2：计算俄罗斯到站价格（RUB）**
```
russianArrivalPriceRub = 35000 + 1346.15 + 0 + 1500
                       = 37846.15 RUB/t
```

**步骤 3：计算俄罗斯到站价格（CNY）**
```
russianArrivalPriceCny = 37846.15 / 11.37
                        = 3328.60 CNY/t
```

---

## 🔍 代码实现

### JavaScript 版本 (`calculations.js`)

```javascript
// === 海外段计算 ===
// 单位标准化
const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;

// 海外杂费合计
const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
    const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
    return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
}, 0);

// 俄罗斯到站价格
const russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub;
const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
```

### TypeScript 版本 (`calculations.ts`)

```typescript
// === 海外段计算 ===
const log1 = unit1 === 'RUB/t' ? overseaLogistics1 : overseaLogistics1 / tpc;
const log2 = unit2 === 'RUB/t' ? overseaLogistics2 : overseaLogistics2 / tpc;

const exportExtrasTotalRub = exportExtras.reduce((sum, item) => {
    const value = item.value === '' || item.value == null ? 0 : Number(item.value) || 0;
    return sum + (item.unit === 'RUB/ton' ? value : value / tpc);
}, 0);

const russianArrivalPriceRub = farmPriceRub + log1 + log2 + exportExtrasTotalRub;
const russianArrivalPriceCny = russianArrivalPriceRub / (exchangeRate || 1);
```

---

## 📊 单位转换说明

### 短驳费单位转换

| 输入单位 | 转换方式 | 说明 |
|---------|---------|------|
| `RUB/t` | 直接使用 | 已经是每吨价格 |
| `RUB/柜` | `值 / tonsPerContainer` | 需要除以每柜吨数 |

### 海外杂费单位转换

| 输入单位 | 转换方式 | 说明 |
|---------|---------|------|
| `RUB/ton` | 直接累加 | 已经是每吨价格 |
| `RUB/container` | `值 / tonsPerContainer` | 需要除以每柜吨数 |

**示例：**
- 如果 `tonsPerContainer = 26`（每柜26吨）
- 短驳费1 = 35000 RUB/柜
- 转换后：`35000 / 26 = 1346.15 RUB/t`

---

## 🎯 影响因素

以下参数会影响"海外到站预估"的计算：

1. **农场采购价** (`farmPriceRub`)
   - 直接影响，1:1 关系

2. **短驳费1** (`overseaLogistics1`)
   - 直接影响，1:1 关系
   - 受单位影响（RUB/t 或 RUB/柜）

3. **短驳费2** (`overseaLogistics2`)
   - 直接影响，1:1 关系
   - 受单位影响（RUB/t 或 RUB/柜）

4. **海外杂费列表** (`exportExtras`)
   - 累加影响
   - 每个项目的金额和单位都会影响结果

5. **汇率** (`exchangeRate`)
   - 影响 CNY 版本的价格
   - 汇率越高，CNY 价格越低

6. **每柜吨数** (`tonsPerContainer`)
   - 影响单位转换
   - 如果费用单位是"每柜"，需要除以这个值

---

## 📈 显示位置

"海外到站预估"在以下位置显示：

1. **汇率卡片区域** (`ExchangeRateCards.js`)
   - 显示 RUB 版本：`russianArrivalPriceRub`
   - 显示 CNY 版本：`russianArrivalPriceCny`

2. **成本拆解模块** (`CostBreakdown.js`)
   - 作为成本构成的一部分显示

---

## 💡 使用建议

1. **准确性**
   - 确保农场采购价准确
   - 准确输入所有海外杂费

2. **单位注意**
   - 注意短驳费和杂费的单位
   - 如果单位是"每柜"，系统会自动转换为"每吨"

3. **汇率更新**
   - 定期更新汇率以获得准确的 CNY 价格

---

**最后更新**: 2026年2月14日
