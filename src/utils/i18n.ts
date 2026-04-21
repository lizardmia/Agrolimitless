/**
 * 多语言翻译工具
 */

export type Language = 'zh' | 'ru' | 'en';

export interface Translations {
    [key: string]: {
        zh: string;
        ru: string;
        en: string;
    };
}

// 翻译字典
const translations: Translations = {
    // 通用
    'exchangeRate': {
        zh: '汇率',
        ru: 'Курс валют',
        en: 'Exchange Rate'
    },
    'logout': {
        zh: '登出',
        ru: 'Выход',
        en: 'Logout'
    },
    'userManagement': {
        zh: '用户管理',
        ru: 'Управление пользователями',
        en: 'User Management'
    },
    'currentUser': {
        zh: '当前用户',
        ru: 'Текущий пользователь',
        en: 'Current User'
    },
    'admin': {
        zh: '管理员',
        ru: 'Администратор',
        en: 'Admin'
    },
    'back': {
        zh: '← 返回',
        ru: '← Назад',
        en: '← Back'
    },
    
    // 农场记录
    'farmName': {
        zh: '农场名称',
        ru: 'Название фермы',
        en: 'Farm Name'
    },
    'saveRecord': {
        zh: '保存记录',
        ru: 'Сохранить запись',
        en: 'Save Record'
    },
    'viewRecords': {
        zh: '查看记录',
        ru: 'Просмотр записей',
        en: 'View Records'
    },
    'farmRecords': {
        zh: '农场记录',
        ru: 'Записи фермы',
        en: 'Farm Records'
    },
    'noRecords': {
        zh: '暂无记录',
        ru: 'Нет записей',
        en: 'No Records'
    },
    'delete': {
        zh: '删除',
        ru: 'Удалить',
        en: 'Delete'
    },
    'saveTime': {
        zh: '保存时间',
        ru: 'Время сохранения',
        en: 'Save Time'
    },
    'overseasArrivalEstimate': {
        zh: '海外到站预估',
        ru: 'Оценка прибытия за границу',
        en: 'Overseas Arrival Estimate'
    },
    'overseasArrivalWithVat': {
        zh: '含增值税退税',
        ru: 'С возвратом НДС',
        en: 'With VAT Rebate'
    },
    'overseasArrivalWithoutVat': {
        zh: '不含增值税退税 (原价)',
        ru: 'Без возврата НДС (исходная)',
        en: 'Without VAT Rebate (Base)'
    },
    'grossProfit': {
        zh: '毛利 (不含息)',
        ru: 'Валовая прибыль (без процентов)',
        en: 'Gross Profit (No Interest)'
    },
    
    // 产品
    'productCategory': {
        zh: '产品类目与规格',
        ru: 'Категория и спецификация продукта',
        en: 'Product Category & Specification'
    },
    /** SKU 下拉中：已保存进口关税政策 */
    'skuPolicyMarkImport': {
        zh: '进',
        ru: 'Имп',
        en: 'I'
    },
    /** SKU 下拉中：已保存出口关税政策 */
    'skuPolicyMarkExport': {
        zh: '出',
        ru: 'Экс',
        en: 'E'
    },
    'skuPolicyLegend': {
        zh: '标记 [进]「保存进口政策」后、[出]「保存出口政策」后分别显示，互不混用',
        ru: '[Имп] — после сохранения импорта, [Экс] — после сохранения экспорта, не смешиваются',
        en: '[I] after Save import policy; [E] after Save export — shown separately'
    },
    'skuSavedImportLabel': {
        zh: '进口政策',
        ru: 'Имп. политика',
        en: 'Import'
    },
    'skuSavedExportLabel': {
        zh: '出口政策',
        ru: 'Эксп. политика',
        en: 'Export'
    },
    'skuSavedYes': {
        zh: '已保存',
        ru: 'Сохранено',
        en: 'Saved'
    },
    'skuSavedNo': {
        zh: '未保存',
        ru: 'Нет',
        en: 'Not saved'
    },
    'policySavedBadge': {
        zh: '已保存',
        ru: 'Сохр.',
        en: 'Saved'
    },
    'enterFarmName': {
        zh: '请输入农场名称',
        ru: 'Введите название фермы',
        en: 'Enter Farm Name'
    },
    
    // 政策
    'savePolicy': {
        zh: '保存政策',
        ru: 'Сохранить политику',
        en: 'Save Policy'
    },
    'importTaxPolicy': {
        zh: '进口税收政策',
        ru: 'Политика импортных налогов',
        en: 'Import Tax Policy'
    },
    'exportTaxPolicy': {
        zh: '出口税收政策',
        ru: 'Политика экспортных налогов',
        en: 'Export Tax Policy'
    },
    
    // 保存状态
    'saveSuccess': {
        zh: '已成功保存',
        ru: 'Успешно сохранено',
        en: 'Successfully Saved'
    },
    'saveFailed': {
        zh: '保存失败',
        ru: 'Ошибка сохранения',
        en: 'Save Failed'
    },
    'pleaseEnterFarmName': {
        zh: '请输入农场名称',
        ru: 'Пожалуйста, введите название фермы',
        en: 'Please Enter Farm Name'
    },
    
    // 确认删除
    'confirmDelete': {
        zh: '确定要删除这条记录吗？',
        ru: 'Вы уверены, что хотите удалить эту запись?',
        en: 'Are you sure you want to delete this record?'
    },
    'duty': {
        zh: '关税',
        ru: 'Пошлина',
        en: 'Duty'
    },
    'vat': {
        zh: '增值税',
        ru: 'НДС',
        en: 'VAT'
    },
    'toLocal': {
        zh: '到本地',
        ru: 'на локальное хранилище',
        en: 'to Local Storage'
    },
    
    // 政策相关
    'policyName': {
        zh: '政策名称',
        ru: 'Название политики',
        en: 'Policy Name'
    },
    'savePolicyButton': {
        zh: '保存政策',
        ru: 'Сохранить политику',
        en: 'Save Policy'
    },
    'savePolicyTooltip': {
        zh: '保存当前',
        ru: 'Сохранить текущую',
        en: 'Save current'
    },
    'taxPolicyConfig': {
        zh: '的税收政策配置',
        ru: 'конфигурацию налоговой политики',
        en: 'tax policy configuration'
    },
    'exportPolicyConfig': {
        zh: '的出口政策配置',
        ru: 'конфигурацию экспортной политики',
        en: 'export policy configuration'
    },
    'clickSavePolicy': {
        zh: '点击"保存政策"将把当前税率与产品规格',
        ru: 'Нажмите "Сохранить политику", чтобы связать текущие ставки с',
        en: 'Click "Save Policy" to associate current rates with'
    },
    'associated': {
        zh: '关联。',
        ru: 'спецификацией продукта.',
        en: 'product specification.'
    },
    'associatedProductStatus': {
        zh: '关联产品状态',
        ru: 'Статус связанного продукта',
        en: 'Associated Product Status'
    },
    
    // 税率相关
    'dutyRate': {
        zh: '关税税率',
        ru: 'Ставка пошлины',
        en: 'Duty Rate'
    },
    'vatRate': {
        zh: '增值税率',
        ru: 'Ставка НДС',
        en: 'VAT Rate'
    },
    'exportDutyRate': {
        zh: '出口关税',
        ru: 'Экспортная пошлина',
        en: 'Export Duty'
    },
    'exportVatRate': {
        zh: '出口增值税',
        ru: 'Экспортный НДС',
        en: 'Export VAT'
    },
    
    // 出口政策规则
    'taxRules': {
        zh: '税务规则',
        ru: 'Налоговые правила',
        en: 'Tax Rules'
    },
    'rule1NoDuty': {
        zh: '规则1：无关税',
        ru: 'Правило 1: Без пошлины',
        en: 'Rule 1: No Duty'
    },
    'rule1Desc': {
        zh: '只有增值税退税，海外到站预估减去退税',
        ru: 'Только возврат НДС, оценка прибытия за границу минус возврат',
        en: 'Only VAT rebate, overseas arrival estimate minus rebate'
    },
    'rule2WithDuty': {
        zh: '规则2：有关税',
        ru: 'Правило 2: С пошлиной',
        en: 'Rule 2: With Duty'
    },
    'rule2Desc': {
        zh: '减去增值税退税 + 加上关税',
        ru: 'Минус возврат НДС + плюс пошлина',
        en: 'Minus VAT rebate + plus duty'
    },
    'rule3Planned': {
        zh: '规则3：计划内/计划外',
        ru: 'Правило 3: Плановое/внеплановое',
        en: 'Rule 3: Planned/Unplanned'
    },
    'rule3Desc': {
        zh: '预留功能',
        ru: 'Резервная функция',
        en: 'Reserved Feature'
    },
    'planType': {
        zh: '计划类型',
        ru: 'Тип плана',
        en: 'Plan Type'
    },
    'planned': {
        zh: '计划内',
        ru: 'Плановое',
        en: 'Planned'
    },
    'unplanned': {
        zh: '计划外',
        ru: 'Внеплановое',
        en: 'Unplanned'
    },
    
    // 海外段
    'overseaSection': {
        zh: '海外段计算参数',
        ru: 'Параметры расчета зарубежного сегмента',
        en: 'Overseas Segment Parameters'
    },
    'farmPurchasePrice': {
        zh: '农场采购价',
        ru: 'Цена закупки фермы',
        en: 'Farm Purchase Price'
    },
    'shortHaulFee': {
        zh: '短驳费计算',
        ru: 'Расчет короткой перевозки',
        en: 'Short Haul Fee Calculation'
    },
    'distanceKm': {
        zh: '公里数',
        ru: 'Расстояние (км)',
        en: 'Distance (km)'
    },
    'pricePerKmPerContainer': {
        zh: '每公里每柜价格 (RUB)',
        ru: 'Цена за км за контейнер (RUB)',
        en: 'Price per km per container (RUB)'
    },
    'shortHaulFeeResult': {
        zh: '短驳费',
        ru: 'Плата за короткую перевозку',
        en: 'Short Haul Fee'
    },
    'farmHaulModuleTitle': {
        zh: '农场采购与短驳',
        ru: 'Закупка и короткая перевозка',
        en: 'Farm purchase & short haul'
    },
    'addFarmHaulModule': {
        zh: '添加农场+短驳模块',
        ru: 'Добавить блок (ферма + перевозка)',
        en: 'Add farm + short-haul block'
    },
    'removeFarmHaulModule': {
        zh: '删除此模块',
        ru: 'Удалить блок',
        en: 'Remove this block'
    },
    'calculationFormula': {
        zh: '计算公式',
        ru: 'Формула расчета',
        en: 'Calculation Formula'
    },
    'lossRatio': {
        zh: '物损比',
        ru: 'Коэффициент потерь',
        en: 'Loss Ratio'
    },
    'viewLossRatioDetails': {
        zh: '查看物损比详情',
        ru: 'Просмотр деталей коэффициента потерь',
        en: 'View Loss Ratio Details'
    },
    'shortHaulFeePerTon': {
        zh: '短驳费（每吨）',
        ru: 'Плата за короткую перевозку (за тонну)',
        en: 'Short Haul Fee (per ton)'
    },
    'lossRatioFormula': {
        zh: '计算公式: 短驳费 ÷ 海外到站预估',
        ru: 'Формула расчета: Плата за короткую перевозку ÷ Оценка прибытия за границу',
        en: 'Formula: Short Haul Fee ÷ Overseas Arrival Estimate'
    },
    'vatTax': {
        zh: '增值税',
        ru: 'НДС',
        en: 'VAT'
    },
    'vatSumTotal': {
        zh: '增值税的总和',
        ru: 'Сумма НДС',
        en: 'Total VAT (sum)'
    },
    'vatSumFormula': {
        zh: '计算公式: 各模块农场采购价增值税(同出口增值税率) + 各模块短驳费增值税 + 各杂费增值税（价内税，仅展示）',
        ru: 'Формула: НДС закупки по блокам + НДС перевозки по блокам + НДС по доп. (в цене, только показ)',
        en: 'Formula: per-block farm VAT (export rate) + per-block short-haul VAT + extras VAT (display only)'
    },
    'vatSumMinusDutyFormula': {
        zh: '计算公式: 增值税总和 − 关税',
        ru: 'Формула: сумма НДС − пошлина',
        en: 'Formula: total VAT − duty'
    },
    'vatDisplayOnlyNote': {
        zh: '以下增值税仅展示（价内税），不参与到站预估等计算',
        ru: 'НДС ниже только для отображения (в цене), не влияет на расчёты',
        en: 'VAT below is display-only (inclusive), not used in totals'
    },
    'vatDisplayFarm': {
        zh: '农场采购价增值税',
        ru: 'НДС закупки на ферме',
        en: 'Farm purchase VAT'
    },
    'vatRateFixed10': {
        zh: '税率 10%（固定）',
        ru: 'Ставка 10% (фикс.)',
        en: 'Rate 10% (fixed)'
    },
    'vatRateLinkedExport': {
        zh: '同出口增值税率',
        ru: 'Как экспортная ставка НДС',
        en: 'Same as export VAT %'
    },
    'vatRateExportUnsetHint': {
        zh: '请在出口政策中填写出口增值税率',
        ru: 'Укажите экспортный НДС в политике',
        en: 'Set export VAT % in export policy'
    },
    'shortHaulVatRateLabel': {
        zh: '短驳费增值税率',
        ru: 'Ставка НДС на короткую перевозку',
        en: 'Short haul VAT rate'
    },
    'vatPerTonShortHaul': {
        zh: '短驳费增值税（每吨）',
        ru: 'НДС перевозки (руб/т)',
        en: 'Short haul VAT (per ton)'
    },
    'extraVatRateLabel': {
        zh: '杂费增值税率',
        ru: 'Ставка НДС на доп. расход',
        en: 'Extra VAT rate'
    },
    'vatPerTonExtra': {
        zh: '杂费增值税（每吨）',
        ru: 'НДС доп. расхода (руб/т)',
        en: 'Extra VAT (per ton)'
    },
    'vatCalcDetailTitle': {
        zh: '价内税计算过程',
        ru: 'Расчёт НДС (в цене)',
        en: 'Inclusive VAT breakdown'
    },
    'vatCalcToggleShow': {
        zh: '查看详细计算过程',
        ru: 'Показать расчёт',
        en: 'Show calculation steps'
    },
    'vatCalcToggleHide': {
        zh: '收起',
        ru: 'Скрыть',
        en: 'Hide'
    },
    'vatCalcStep1ShortHaul': {
        zh: '短驳费（每柜）= 公里数 × 2 × 每公里每柜价',
        ru: 'Перевозка (за конт.) = км × 2 × цена/км/конт.',
        en: 'Short haul (per container) = km × 2 × price/km/container'
    },
    'vatCalcStep2PerTon': {
        zh: '短驳费（每吨）= 短驳费（每柜）÷ 每柜吨数',
        ru: 'Перевозка (руб/т) = за контейнер ÷ тонн/конт.',
        en: 'Short haul (per ton) = per-container fee ÷ tons per container'
    },
    'vatCalcStep3Inclusive': {
        zh: '每吨增值税（价内税）= 每吨含税金额 × 税率 ÷ (100% + 税率)',
        ru: 'НДС/т (в цене) = сумма/т × ставка ÷ (100% + ставка)',
        en: 'VAT/t (inclusive) = amount/t × rate ÷ (100% + rate)'
    },
    'vatCalcStepFarm': {
        zh: '农场采购价增值税（价内税）= 采购价 × 10% ÷ (100% + 10%)',
        ru: 'НДС закупки = цена × 10% ÷ (100% + 10%)',
        en: 'Farm VAT = price × 10% ÷ (100% + 10%)'
    },
    'vatCalcStepFarmTpl': {
        zh: '农场采购价增值税（价内税）= 采购价 × {rate}% ÷ (100% + {rate}%)',
        ru: 'НДС закупки (в цене) = цена × {rate}% ÷ (100% + {rate}%)',
        en: 'Farm VAT (inclusive) = price × {rate}% ÷ (100% + {rate}%)'
    },
    'vatCalcStepExtra': {
        zh: '杂费增值税（每吨，价内税）= 杂费含税（每吨）× 税率 ÷ (100% + 税率)',
        ru: 'НДС доп. = сумма/т × ставка ÷ (100% + ставка)',
        en: 'Extra VAT/t = inclusive extra/t × rate ÷ (100% + rate)'
    },
    'vatCalcExtraPerTonFromContainer': {
        zh: '杂费（每吨）= 杂费（每柜）÷ 每柜吨数',
        ru: 'Доп./т = доп./конт. ÷ тонн/конт.',
        en: 'Extra (per ton) = per-container ÷ tons per container'
    },
    'vatFormula': {
        zh: '计算公式: 采购价（不含税） × 增值税率',
        ru: 'Формула расчета: Цена покупки (без налога) × Ставка НДС',
        en: 'Formula: Purchase Price (excluding tax) × VAT Rate'
    },
    'dutyTax': {
        zh: '关税',
        ru: 'Пошлина',
        en: 'Duty'
    },
    'dutyFormula': {
        zh: '计算公式: 出口价格 × 关税税率',
        ru: 'Формула: Экспортная цена × Ставка экспортной пошлины',
        en: 'Formula: Export price × Export duty rate'
    },
    'vatMinusDuty': {
        zh: '增值税总和 - 关税',
        ru: 'Сумма НДС − пошлина',
        en: 'Total VAT − Duty'
    },
    'vatMinusDutyFormula': {
        zh: '计算公式: 增值税总和 − 关税',
        ru: 'Формула: сумма НДС − пошлина',
        en: 'Formula: total VAT − duty'
    },
    
    // 国内段
    'domesticSection': {
        zh: '国内段计算参数',
        ru: 'Параметры расчета внутреннего сегмента',
        en: 'Domestic Segment Parameters'
    },
    'importSettlementValue': {
        zh: '进口结算货值 (RUB)',
        ru: 'Стоимость импортного расчета (RUB)',
        en: 'Import Settlement Value (RUB)'
    },
    'chinaEuropeFreightOverseas': {
        zh: '中欧班列运费 - 国外段 (USD/柜)',
        ru: 'Фрахт Китай-Европа - Зарубежный сегмент (USD/контейнер)',
        en: 'China-Europe Freight - Overseas Segment (USD/container)'
    },
    'chinaEuropeFreightDomestic': {
        zh: '中欧班列运费 - 国内段 (USD/柜)',
        ru: 'Фрахт Китай-Европа - Внутренний сегмент (USD/контейнер)',
        en: 'China-Europe Freight - Domestic Segment (USD/container)'
    },
    'insuranceRate': {
        zh: '保费率',
        ru: 'Ставка страхования',
        en: 'Insurance Rate'
    },
    'insuranceRateDefault': {
        zh: '默认值: 0.003 (0.3%)，保费 = (进口结算货值 + 国际运费国外段) × 保费率 (CNY/t)',
        ru: 'По умолчанию: 0.003 (0.3%), Страхование = (Стоимость импортного расчета + Международный фрахт зарубежного сегмента) × Ставка страхования (CNY/t)',
        en: 'Default: 0.003 (0.3%), Insurance = (Import Settlement Value + International Freight Overseas Segment) × Insurance Rate (CNY/t)'
    },
    'domesticShortHaul': {
        zh: '国内陆运/短驳费 (CNY/柜)',
        ru: 'Внутренняя перевозка/короткая перевозка (CNY/контейнер)',
        en: 'Domestic Land Transport/Short Haul (CNY/container)'
    },
    'domesticExtras': {
        zh: '国内杂费',
        ru: 'Внутренние дополнительные расходы',
        en: 'Domestic Extras'
    },
    'addExtra': {
        zh: '添加',
        ru: 'Добавить',
        en: 'Add'
    },
    'sellingPrice': {
        zh: '销售价格 (CNY/t)',
        ru: 'Цена продажи (CNY/t)',
        en: 'Selling Price (CNY/t)'
    },
    
    // 进口政策
    'importTaxPolicyTitle': {
        zh: '4. 进口税收政策',
        ru: '4. Политика импортных налогов',
        en: '4. Import Tax Policy'
    },
    
    // 出口政策
    'exportPolicyTitle': {
        zh: '2. 出口板块政策',
        ru: '2. Политика экспортного сектора',
        en: '2. Export Sector Policy'
    },
    'exportTaxPolicyPlaceholder': {
        zh: '出口税收政策',
        ru: 'Политика экспортных налогов',
        en: 'Export Tax Policy'
    },
    'reverseFarmPrice': {
        zh: '倒推农场采购价',
        ru: 'Обратный расчет цены закупки фермы',
        en: 'Reverse Farm Purchase Price'
    },
    'reversePurchasePrice': {
        zh: '倒推采购价',
        ru: 'Обратный расчет цены покупки',
        en: 'Reverse Purchase Price'
    },
    'item': {
        zh: '项目',
        ru: 'Пункт',
        en: 'Item'
    },
    'targetSellingPrice': {
        zh: '目标销售单价 (CNY/t)',
        ru: 'Целевая цена продажи (CNY/t)',
        en: 'Target Selling Price (CNY/t)'
    },
    'domesticExtrasDetail': {
        zh: '国内杂费明细',
        ru: 'Детали внутренних дополнительных расходов',
        en: 'Domestic Extras Detail'
    },
    'addDomesticExtra': {
        zh: '添加国内杂费',
        ru: 'Добавить внутренние дополнительные расходы',
        en: 'Add Domestic Extra'
    },
    'container': {
        zh: '柜',
        ru: 'Контейнер',
        en: 'Container'
    },
    'ton': {
        zh: '吨',
        ru: 'Тонна',
        en: 'Ton'
    },
    
    // 成本拆解
    'auditCostBreakdown': {
        zh: '审计级成本拆解',
        ru: 'Аудит разбивки затрат',
        en: 'Audit-Level Cost Breakdown'
    },
    'boundProduct': {
        zh: '绑定产品',
        ru: 'Привязанный продукт',
        en: 'Bound Product'
    },
    'customsValue': {
        zh: '关税完税价格',
        ru: 'Таможенная стоимость',
        en: 'Customs Value'
    },
    'intlFreightOverseas': {
        zh: '国际运费国外段 (CNY/t)',
        ru: 'Международный фрахт зарубежного сегмента (CNY/t)',
        en: 'International Freight Overseas Segment (CNY/t)'
    },
    'insurance': {
        zh: '保费',
        ru: 'Страхование',
        en: 'Insurance'
    },
    'intlFreightDomestic': {
        zh: '国际运费国内段',
        ru: 'Международный фрахт внутреннего сегмента',
        en: 'International Freight Domestic Segment'
    },
    'domesticLogisticsTotal': {
        zh: '国内物流总费用',
        ru: 'Общие расходы на внутреннюю логистику',
        en: 'Domestic Logistics Total Cost'
    },
    'domesticShortHaulFee': {
        zh: '国内短驳费',
        ru: 'Плата за внутреннюю короткую перевозку',
        en: 'Domestic Short Haul Fee'
    },
    'domesticExtrasTotal': {
        zh: '国内杂费合计',
        ru: 'Итого внутренние дополнительные расходы',
        en: 'Domestic Extras Total'
    },
    'eachExtraItem': {
        zh: '各杂费项目',
        ru: 'Каждый пункт дополнительных расходов',
        en: 'Each Extra Item'
    },
    'baseLandingPrice': {
        zh: '落地基础成本价',
        ru: 'Базовая стоимость приземления',
        en: 'Base Landing Price'
    },
    
    // 结果面板
    'basePriceNoInterest': {
        zh: '基础单价 (不含息)',
        ru: 'Базовая цена за единицу (без процентов)',
        en: 'Base Unit Price (No Interest)'
    },
    'totalPriceWithInterest': {
        zh: '总计单价 (含息)',
        ru: 'Общая цена за единицу (с процентами)',
        en: 'Total Unit Price (With Interest)'
    },
    'estimatedNetProfit': {
        zh: '预计净利 (含息)',
        ru: 'Ожидаемая чистая прибыль (с процентами)',
        en: 'Estimated Net Profit (With Interest)'
    },
    'totalContainers': {
        zh: '批次总柜数',
        ru: 'Общее количество контейнеров в партии',
        en: 'Total Containers in Batch'
    },
    'tonsPerContainer': {
        zh: '单柜装载 (吨)',
        ru: 'Загрузка на контейнер (тонн)',
        en: 'Tons Per Container'
    },
    'totalCapitalOccupied': {
        zh: '全案资金占用额度',
        ru: 'Общий объем занятого капитала',
        en: 'Total Capital Occupied'
    },
    
    // 财务面板
    'financeLeverage': {
        zh: '资金财务杠杆核算',
        ru: 'Расчет финансового рычага',
        en: 'Financial Leverage Calculation'
    },
    'collectionCycle': {
        zh: '资金周转周期 (回款天数)',
        ru: 'Цикл оборота средств (дни возврата)',
        en: 'Collection Cycle (Days)'
    },
    'annualInterestRate': {
        zh: '年化利率',
        ru: 'Годовая процентная ставка',
        en: 'Annual Interest Rate'
    },
    'financialCostPerTon': {
        zh: '资金占用财务成本 (单吨)',
        ru: 'Финансовые затраты на занятый капитал (за тонну)',
        en: 'Financial Cost Per Ton'
    },
    
    // Header
    'pricingDashboard': {
        zh: 'Agrolimitless & Transglobe 定价看板',
        ru: 'Agrolimitless & Transglobe Панель ценообразования',
        en: 'Agrolimitless & Transglobe Pricing Dashboard'
    },
    'supplyChainSystem': {
        zh: '跨境供应链全链路核算系统',
        ru: 'Система учета полной цепочки трансграничной поставки',
        en: 'Cross-Border Supply Chain Full-Link Accounting System'
    },
    'systemStatus': {
        zh: '系统计算状态',
        ru: 'Статус расчета системы',
        en: 'System Calculation Status'
    },
    'paramsAligned': {
        zh: '参数实时对齐',
        ru: 'Параметры выровнены в реальном времени',
        en: 'Parameters Real-Time Aligned'
    },
    
    // Sidebar
    'coreCalculationParams': {
        zh: '计算核心参数',
        ru: 'Основные параметры расчета',
        en: 'Core Calculation Parameters'
    },
    'productCategorySpec': {
        zh: '产品类目与规格',
        ru: 'Категория и спецификация продукта',
        en: 'Product Category & Specification'
    },
    
    // 产品类目翻译
    'category_谷物类': {
        zh: '谷物类',
        ru: 'Зерновые',
        en: 'Grains'
    },
    'category_豆类': {
        zh: '豆类',
        ru: 'Бобовые',
        en: 'Legumes'
    },
    'category_油籽类': {
        zh: '油籽类',
        ru: 'Масличные культуры',
        en: 'Oilseeds'
    },
    'category_饲料类': {
        zh: '饲料类',
        ru: 'Кормовые',
        en: 'Feed'
    },
    
    // 产品规格翻译
    'subtype_小麦': {
        zh: '小麦',
        ru: 'Пшеница',
        en: 'Wheat'
    },
    'subtype_大麦': {
        zh: '大麦',
        ru: 'Ячмень',
        en: 'Barley'
    },
    'subtype_玉米': {
        zh: '玉米',
        ru: 'Кукуруза',
        en: 'Corn'
    },
    'subtype_荞麦': {
        zh: '荞麦',
        ru: 'Гречиха',
        en: 'Buckwheat'
    },
    'subtype_黑麦': {
        zh: '黑麦',
        ru: 'Рожь',
        en: 'Rye'
    },
    'subtype_大米': {
        zh: '大米',
        ru: 'Рис',
        en: 'Rice'
    },
    'subtype_小米': {
        zh: '小米',
        ru: 'Просо',
        en: 'Millet'
    },
    'subtype_燕麦': {
        zh: '燕麦',
        ru: 'Овес',
        en: 'Oats'
    },
    'subtype_豌豆': {
        zh: '豌豆',
        ru: 'Горох',
        en: 'Peas'
    },
    'subtype_扁豆': {
        zh: '扁豆',
        ru: 'Чечевица',
        en: 'Lentils'
    },
    'subtype_亚麻籽': {
        zh: '亚麻籽',
        ru: 'Льняное семя',
        en: 'Flaxseed'
    },
    'subtype_油葵': {
        zh: '油葵',
        ru: 'Подсолнечник',
        en: 'Sunflower'
    },
    'subtype_葵仁': {
        zh: '葵仁',
        ru: 'Ядро подсолнечника',
        en: 'Sunflower Kernel'
    },
    'subtype_油菜籽': {
        zh: '油菜籽',
        ru: 'Рапс',
        en: 'Rapeseed'
    },
    'subtype_大豆': {
        zh: '大豆',
        ru: 'Соя',
        en: 'Soybean'
    },
    'subtype_豆粕': {
        zh: '豆粕',
        ru: 'Соевый шрот',
        en: 'Soybean Meal'
    },
    'subtype_豆饼': {
        zh: '豆饼',
        ru: 'Соевый жмых',
        en: 'Soybean Cake'
    },
    'subtype_菜籽饼': {
        zh: '菜籽饼',
        ru: 'Рапсовый жмых',
        en: 'Rapeseed Cake'
    },
    'subtype_菜籽粕': {
        zh: '菜籽粕',
        ru: 'Рапсовый шрот',
        en: 'Rapeseed Meal'
    },
    'subtype_亚麻籽饼': {
        zh: '亚麻籽饼',
        ru: 'Льняной жмых',
        en: 'Flaxseed Cake'
    },
    'subtype_亚麻籽粕': {
        zh: '亚麻籽粕',
        ru: 'Льняной шрот',
        en: 'Flaxseed Meal'
    },
    'subtype_葵粕': {
        zh: '葵粕',
        ru: 'Подсолнечный шрот',
        en: 'Sunflower Meal'
    },
    'subtype_甜菜粕': {
        zh: '甜菜粕',
        ru: 'Свекольный жом',
        en: 'Beet Pulp'
    },
    
    // 倒推农场采购价弹窗
    'calculationMode': {
        zh: '计算模式',
        ru: 'Режим расчета',
        en: 'Calculation Mode'
    },
    'mode1TargetArrivalPrice': {
        zh: '模式1：目标海外到站价格',
        ru: 'Режим 1: Целевая цена прибытия за границу',
        en: 'Mode 1: Target Overseas Arrival Price'
    },
    'mode1Desc': {
        zh: '根据目标海外到站价格（CNY/t）倒推',
        ru: 'Обратный расчет на основе целевой цены прибытия за границу (CNY/t)',
        en: 'Reverse calculate based on target overseas arrival price (CNY/t)'
    },
    'mode2TargetBasePrice': {
        zh: '模式2：目标基础成本价',
        ru: 'Режим 2: Целевая базовая стоимость',
        en: 'Mode 2: Target Base Cost Price'
    },
    'mode2Desc': {
        zh: '根据目标基础成本价（CNY/t）倒推',
        ru: 'Обратный расчет на основе целевой базовой стоимости (CNY/t)',
        en: 'Reverse calculate based on target base cost price (CNY/t)'
    },
    'targetArrivalPrice': {
        zh: '目标海外到站价格',
        ru: 'Целевая цена прибытия за границу',
        en: 'Target Overseas Arrival Price'
    },
    'targetArrivalPriceHint': {
        zh: '输入目标海外到站价格（人民币/吨），系统将倒推出所需的农场采购价',
        ru: 'Введите целевую цену прибытия за границу (юань/тонна), система рассчитает требуемую цену закупки фермы',
        en: 'Enter target overseas arrival price (CNY/ton), system will reverse calculate the required farm purchase price'
    },
    'targetBaseLandingPrice': {
        zh: '目标基础成本价',
        ru: 'Целевая базовая стоимость приземления',
        en: 'Target Base Landing Price'
    },
    'targetBaseLandingPriceHint': {
        zh: '输入目标基础成本价（不含息），系统将倒推出所需的农场采购价',
        ru: 'Введите целевую базовую стоимость приземления (без процентов), система рассчитает требуемую цену закупки фермы',
        en: 'Enter target base landing price (excluding interest), system will reverse calculate the required farm purchase price'
    },
    'calculateFarmPrice': {
        zh: '计算农场采购价',
        ru: 'Рассчитать цену закупки фермы',
        en: 'Calculate Farm Purchase Price'
    },
    'calculationResult': {
        zh: '计算结果',
        ru: 'Результат расчета',
        en: 'Calculation Result'
    },
    'suggestedFarmPrice': {
        zh: '建议的农场采购价',
        ru: 'Рекомендуемая цена закупки фермы',
        en: 'Suggested Farm Purchase Price'
    },
    'applyThisPrice': {
        zh: '应用此价格',
        ru: 'Применить эту цену',
        en: 'Apply This Price'
    },
    'cannotCalculateFarmPrice': {
        zh: '无法计算出有效的农场采购价，请检查输入参数',
        ru: 'Невозможно рассчитать действительную цену закупки фермы, проверьте входные параметры',
        en: 'Cannot calculate valid farm purchase price, please check input parameters'
    },
    
    // 单位翻译
    'rubPerTon': {
        zh: 'RUB/t',
        ru: 'RUB/т',
        en: 'RUB/t'
    },
    'rubPerContainer': {
        zh: 'RUB/柜',
        ru: 'RUB/контейнер',
        en: 'RUB/container'
    },
    'cnyPerTon': {
        zh: 'CNY/t',
        ru: 'CNY/т',
        en: 'CNY/t'
    },
    'cnyPerContainer': {
        zh: 'CNY/柜',
        ru: 'CNY/контейнер',
        en: 'CNY/container'
    },
    'cny': {
        zh: 'CNY',
        ru: 'CNY',
        en: 'CNY'
    },
    
    // 期望盈利与关税选项
    'expectedProfitPercent': {
        zh: '期望盈利百分点',
        ru: 'Ожидаемая прибыль (%)',
        en: 'Expected Profit (%)'
    },
    'expectedProfitPerTon': {
        zh: '每吨期望盈利',
        ru: 'Прибыль на тонну',
        en: 'Profit per Ton'
    },
    'breakEvenExportTitle': {
        zh: '收支平衡（保本）出口价',
        ru: 'Безубыточная экспортная цена (P)',
        en: 'Break-even export price (P)'
    },
    'breakEvenExportDesc': {
        zh: '总收入 = P + 退税 R；总支出 = 前期成本 C + 出口关税（r×P）。C 为海外到站：选「包含短驳」时含短驳费；选「不包含」时不含短驳费，且保本 P 与短驳公里、每公里价、短驳增值税率无关。由 P + R = C + r×P 解出 P（取整）。',
        ru: 'Выручка: P + R; расходы: C + пошлина r×P. C — прибытие: с перевозкой или без; при исключении перевозки из базы пошлины вводы по перевозке не меняют P. Равенство → P (округление).',
        en: 'Revenue: P + rebate R; cost: C + duty r×P. C is arrival (includes short haul only if selected). If short haul is excluded from duty base, break-even P ignores short-haul inputs. Solve P + R = C + r×P (rounded).'
    },
    'breakEvenCostShort': {
        zh: '（前期成本）',
        ru: '(C)',
        en: '(cost C)'
    },
    'breakEvenRebateShort': {
        zh: '（退税）',
        ru: '(R)',
        en: '(rebate R)'
    },
    'breakEvenExportResultLabel': {
        zh: '保本出口价（取整）',
        ru: 'P (округл.)',
        en: 'Break-even P (rounded)'
    },
    'breakEvenRoundedNote': {
        zh: '结果已忽略小数，取整数卢布/吨。',
        ru: 'Значение округлено до целых RUB/т.',
        en: 'Rounded to integer RUB/t.'
    },
    'breakEvenNotApplicable': {
        zh: '当前参数下无法得到正保本出口价（例如 C−R ≤ 0 或关税率无效）。',
        ru: 'При текущих данных положительная безубыточная цена не вычисляется.',
        en: 'No positive break-even P under current inputs.'
    },
    'breakEvenExportNoRebateTitle': {
        zh: '不含退税的保本出口价',
        ru: 'Безубыточная цена без учёта возврата НДС',
        en: 'Break-even export price (no rebate)'
    },
    'breakEvenExportNoRebateDesc': {
        zh: '总收入 = 出口价 P（不计入退税 R）；总支出与关税口径与上行相同。平衡：P = C + 关税，解出 P（取整）。',
        ru: 'Выручка = P (без R); расходы и база пошлины как выше. Равенство P = C + пошлина → P.',
        en: 'Revenue = P only (no R); duty base same as above. Balance: P = C + duty.'
    },
    'breakEvenExportNoRebateResultLabel': {
        zh: '保本出口价（不含退税，取整）',
        ru: 'P без возврата НДС (округл.)',
        en: 'Break-even P without rebate (rounded)'
    },
    'breakEvenNotApplicableNoRebate': {
        zh: '当前参数下无法得到正的不含退税保本出口价（例如 C ≤ 0 或关税率无效）。',
        ru: 'Положительная цена без возврата НДС не вычисляется.',
        en: 'No positive break-even P (no rebate) under current inputs.'
    },
    'expectedProfitHint': {
        zh: '根据期望盈利倒推建议农场采购价',
        ru: 'Обратный расчет рекомендуемой цены закупки на ферме',
        en: 'Reverse calculate suggested farm purchase price'
    },
    'suggestedFarmPurchasePrice': {
        zh: '建议农场采购价',
        ru: 'Рекомендуемая цена закупки',
        en: 'Suggested Farm Purchase Price'
    },
    'suggestedExportPrice': {
        zh: '建议出口价格',
        ru: 'Рекомендуемая экспортная цена',
        en: 'Suggested Export Price'
    },
    'suggestedExportDuty': {
        zh: '其中关税',
        ru: 'в т.ч. пошлина',
        en: 'incl. Duty'
    },
    'suggestedExportFormula': {
        zh: '期望盈利%>0：全成本栈按加成与税率反推出口价；%=0 且填每吨盈利：建议出口价=保本出口价+每吨盈利。建议关税=建议出口价×出口税率',
        ru: 'При прибыли %>0: полная база; при %=0 и прибыли/т: P=Pс保本+прибыль/т. Пошлина=P×ставка',
        en: 'If profit %>0: full-cost markup; if %=0 and profit/t: P=break-even P + profit/t. Duty=P×export duty rate'
    },
    'includeShortHaulInDuty': {
        zh: '关税计算包含短驳费',
        ru: 'Включить короткую перевозку в расчет пошлины',
        en: 'Include Short Haul in Duty Calc'
    },
    'includeShortHaulYes': {
        zh: '包含',
        ru: 'Включить',
        en: 'Include'
    },
    'includeShortHaulNo': {
        zh: '不包含',
        ru: 'Не включать',
        en: 'Exclude'
    },
    'exportPriceForDuty': {
        zh: '关税计算-出口价格 (RUB/t)',
        ru: 'Цена экспорта для расчета пошлины (RUB/т)',
        en: 'Export Price for Duty Calc (RUB/t)'
    },
    'exportPriceForDutyHint': {
        zh: '填写此值则用出口价格计算关税，不填则使用进口结算货值',
        ru: 'Если заполнено, используется для расчета пошлины; иначе используется импортная стоимость',
        en: 'If filled, use this price for duty calculation; otherwise use import settlement value'
    },
    'effectiveDutyBase': {
        zh: '实际关税基础价',
        ru: 'Фактическая база для пошлины',
        en: 'Effective Duty Base'
    },
    'exportPriceForDutyNoRebate': {
        zh: '关税计算-出口价格（不含退税）(RUB/t)',
        ru: 'Цена экспорта без возврата НДС для пошлины (RUB/т)',
        en: 'Export price for duty (no rebate) (RUB/t)'
    },
    'exportPriceForDutyNoRebateHint': {
        zh: '不含退税口径的计税用出口价；不填则使用进口结算货值',
        ru: 'Без возврата НДС; если пусто — импортная стоимость',
        en: 'Duty base export price excluding rebate; if blank, import settlement value'
    },
    'effectiveDutyBaseNoRebate': {
        zh: '实际关税基础价（不含退税）',
        ru: 'База пошлины (без возврата НДС)',
        en: 'Effective duty base (no rebate)'
    },
    'addOverseasExtra': {
        zh: '添加海外杂费',
        ru: 'Добавить доп. расходы (заграница)',
        en: 'Add Overseas Extra'
    },
    'extraItemName': {
        zh: '费用项目',
        ru: 'Статья расходов',
        en: 'Item Name'
    },
    /** 海外杂费常用项目名称（英文用语按业务约定） */
    'exportExtraPreset_packageCost': {
        zh: '袋子费用',
        ru: 'Стоимость упаковочных мешков / тары',
        en: 'package cost'
    },
    'exportExtraPreset_laborCost': {
        zh: '打包人力费用',
        ru: 'Стоимость труда на упаковку',
        en: 'labor cost'
    },
    'exportExtraPreset_packageLaborCombo': {
        zh: '打包服务费（袋子+人力）',
        ru: 'Услуги упаковки (материалы + труд)',
        en: 'package+labor cost'
    },
    'exportExtraPreset_labTestConformity': {
        zh: '符合性声明实验室检测费',
        ru: 'Лабораторные испытания для декларации соответствия',
        en: 'laboratory test for the declaration of conformity'
    },
    'exportExtraPreset_quarantineConclusion': {
        zh: '检疫证明',
        ru: 'Карантинное заключение',
        en: 'quarantine Conclusion'
    },
    'exportExtraPreset_fumigation': {
        zh: '熏蒸费用',
        ru: 'Фумигация',
        en: 'fumigation'
    },
    'exportExtraPreset_safetyQualityCert': {
        zh: '安全与质量证书',
        ru: 'Сертификат безопасности и качества',
        en: 'certificate of safety and quality'
    },
    'exportExtraPreset_customsBroker': {
        zh: '出口报关费',
        ru: 'Таможенное оформление экспорта / брокер',
        en: 'customs declaration /broker'
    },
    'exportExtraPreset_certificateOfOrigin': {
        zh: '原产地证书',
        ru: 'Сертификат происхождения / CT-1',
        en: 'Certificate of Origin / CT-1'
    },
    'exportExtraPreset_sdizOperational': {
        zh: 'SDIZ操作费',
        ru: 'Операционные расходы SDIZ',
        en: 'SDIZ operational cost'
    },
    'exportExtraPreset_myExportOperational': {
        zh: 'my export操作费',
        ru: 'Операционные расходы My Export',
        en: 'my export operational cost'
    }
};

/**
 * 获取翻译文本
 */
export function t(key: string, language: Language = 'zh'): string {
    const translation = translations[key];
    if (!translation) {
        console.warn(`Translation key "${key}" not found`);
        return key;
    }
    return translation[language] || translation.zh;
}

/**
 * 创建翻译函数（用于组件内使用）
 */
export function createTranslator(language: Language) {
    return (key: string) => {
        const result = t(key, language);
        // 调试：如果返回键名本身，说明翻译失败
        if (result === key && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            console.warn(`[i18n] 翻译键未找到: "${key}", 语言: "${language}"`);
        }
        return result;
    };
}
