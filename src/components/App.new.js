/**
 * App 组件 - 主应用组件（重构版本）
 * 使用模块化组件和工具函数
 */
const { useState, useMemo, useEffect } = React;
const h = React.createElement;

// 从全局或模块导入组件（延迟获取，确保组件已加载）
function getComponent(name) {
    if (typeof window === 'undefined') return null;
    return window[name];
}

// 从全局导入工具函数（延迟获取）
function getCalculations() {
    if (typeof window === 'undefined' || !window.calculations) {
        console.warn('calculations 未加载');
        return { calculatePricing: () => ({}), PRODUCT_CATEGORIES: {}, formatCurrency: (v) => v.toString() };
    }
    return window.calculations;
}

function getConstants() {
    if (typeof window === 'undefined' || !window.constants) {
        console.warn('constants 未加载');
        return { DEFAULT_VALUES: {} };
    }
    return window.constants;
}

// 在函数内部获取，而不是在文件顶部
function App() {
    // 从全局获取认证函数
    const auth = window.auth || {};
    const { isAuthenticated, isAdmin, logout, getCurrentUser } = auth;
    
    // 从全局获取组件（每次渲染时获取，确保最新）
    const Header = getComponent('Header');
    const ExchangeRateCards = getComponent('ExchangeRateCards');
    const Sidebar = getComponent('Sidebar');
    const ResultsPanel = getComponent('ResultsPanel');
    const CostBreakdown = getComponent('CostBreakdown');
    const FinancePanel = getComponent('FinancePanel');
    const FarmPriceReverseModal = getComponent('FarmPriceReverseModal');
    const Login = getComponent('Login');
    const UserManagement = getComponent('UserManagement');
    const ExportPolicySection = getComponent('ExportPolicySection');
    
    // 从全局获取工具函数
    const { calculatePricing, PRODUCT_CATEGORIES } = getCalculations();
    const { DEFAULT_VALUES } = getConstants();
    
    // === 认证状态 ===
    const [authenticated, setAuthenticated] = useState(() => {
        if (isAuthenticated) {
            return isAuthenticated();
        }
        return false;
    });
    const [showUserManagement, setShowUserManagement] = useState(false);
    
    // 检查必需的组件是否已加载
    if (!Header || !ExchangeRateCards || !Sidebar || !ResultsPanel || !CostBreakdown || !FinancePanel) {
        const missing = [];
        if (!Header) missing.push('Header');
        if (!ExchangeRateCards) missing.push('ExchangeRateCards');
        if (!Sidebar) missing.push('Sidebar');
        if (!ResultsPanel) missing.push('ResultsPanel');
        if (!CostBreakdown) missing.push('CostBreakdown');
        if (!FinancePanel) missing.push('FinancePanel');
        console.warn('组件未加载:', missing);
        return h('div', { 
            style: { padding: '20px', fontFamily: 'sans-serif', color: '#666' },
            className: 'min-h-screen bg-[#f4f7fe] flex items-center justify-center'
        }, 
            h('div', { style: { textAlign: 'center' } },
                h('h2', { style: { color: '#f59e0b', marginBottom: '10px' } }, '正在加载组件...'),
                h('p', null, `等待组件加载: ${missing.join(', ')}`),
                h('p', { style: { fontSize: '12px', color: '#999', marginTop: '10px' } }, '如果长时间未加载，请检查浏览器控制台')
            )
        );
    }
    
    if (!calculatePricing || !PRODUCT_CATEGORIES || !DEFAULT_VALUES || Object.keys(DEFAULT_VALUES).length === 0) {
        console.warn('工具函数未加载');
        return h('div', { 
            style: { padding: '20px', fontFamily: 'sans-serif', color: '#666' },
            className: 'min-h-screen bg-[#f4f7fe] flex items-center justify-center'
        }, 
            h('div', { style: { textAlign: 'center' } },
                h('h2', { style: { color: '#f59e0b', marginBottom: '10px' } }, '正在加载工具函数...'),
                h('p', null, '请稍候...')
            )
        );
    }
    
    // === 状态管理 ===
    const [exchangeRate, setExchangeRate] = useState(DEFAULT_VALUES?.exchangeRate ?? 11.37);
    const [usdCnyRate, setUsdCnyRate] = useState(DEFAULT_VALUES?.usdCnyRate ?? 7.11);
    const [category, setCategory] = useState(DEFAULT_VALUES?.category ?? '谷物类');
    const [subType, setSubType] = useState(DEFAULT_VALUES?.subType ?? '小麦');
    const [policyName, setPolicyName] = useState(DEFAULT_VALUES?.policyName ?? '常规进口税收政策');
    const [saveStatus, setSaveStatus] = useState(null);
    
    // 海外段参数
    const [farmPriceRub, setFarmPriceRub] = useState(DEFAULT_VALUES?.farmPriceRub ?? 35000);
    const [shortHaulDistanceKm, setShortHaulDistanceKm] = useState(DEFAULT_VALUES?.shortHaulDistanceKm ?? 100);
    const [shortHaulPricePerKmPerContainer, setShortHaulPricePerKmPerContainer] = useState(DEFAULT_VALUES?.shortHaulPricePerKmPerContainer ?? 6.73);
    const [exportExtras, setExportExtras] = useState(DEFAULT_VALUES?.exportExtras ?? []);
    
    // 税收政策
    const [dutyRate, setDutyRate] = useState(DEFAULT_VALUES?.dutyRate ?? 0);
    const [vatRate, setVatRate] = useState(DEFAULT_VALUES?.vatRate ?? 9);
    
    // 出口板块政策
    const [exportPolicyName, setExportPolicyName] = useState(DEFAULT_VALUES?.exportPolicyName ?? '常规出口税收政策');
    const [exportPolicyMode, setExportPolicyMode] = useState(DEFAULT_VALUES?.exportPolicyMode ?? 'no-duty');
    const [exportDutyRate, setExportDutyRate] = useState(DEFAULT_VALUES?.exportDutyRate ?? 0);
    const [exportVatRate, setExportVatRate] = useState(DEFAULT_VALUES?.exportVatRate ?? 10);
    const [exportPlanType, setExportPlanType] = useState(DEFAULT_VALUES?.exportPlanType ?? 'planned');
    const [exportSaveStatus, setExportSaveStatus] = useState(null);
    
    // 从数据库加载SKU的关税政策
    React.useEffect(() => {
        const loadSkuPolicy = async () => {
            if (!category || !subType) return;
            
            try {
                const response = await fetch(`/api/sku-policies?category=${encodeURIComponent(category)}&subType=${encodeURIComponent(subType)}`);
                
                if (!response.ok) {
                    console.warn('加载SKU政策失败:', response.statusText);
                    return;
                }
                
                const policy = await response.json();
                
                if (policy) {
                    // 加载入口关税政策
                    if (policy.import_duty_rate !== null && policy.import_duty_rate !== undefined) {
                        setDutyRate(Number(policy.import_duty_rate));
                    }
                    if (policy.import_vat_rate !== null && policy.import_vat_rate !== undefined) {
                        setVatRate(Number(policy.import_vat_rate));
                    }
                    if (policy.import_policy_name) {
                        setPolicyName(policy.import_policy_name);
                    }
                    
                    // 加载出口关税政策
                    if (policy.export_policy_mode) {
                        setExportPolicyMode(policy.export_policy_mode);
                    }
                    if (policy.export_duty_rate !== null && policy.export_duty_rate !== undefined) {
                        setExportDutyRate(Number(policy.export_duty_rate));
                    }
                    if (policy.export_vat_rate !== null && policy.export_vat_rate !== undefined) {
                        setExportVatRate(Number(policy.export_vat_rate));
                    }
                    if (policy.export_plan_type) {
                        setExportPlanType(policy.export_plan_type);
                    }
                    
                    console.log('已加载SKU关税政策:', policy);
                }
            } catch (error) {
                console.error('加载SKU政策失败:', error);
            }
        };
        
        loadSkuPolicy();
    }, [category, subType]);
    
    // 国内段参数
    const [importPriceRub, setImportPriceRub] = useState(DEFAULT_VALUES?.importPriceRub ?? 37000);
    const [importPriceUnit, setImportPriceUnit] = useState(DEFAULT_VALUES?.importPriceUnit ?? 'RUB/t');
    const [intlFreightOverseasUsd, setIntlFreightOverseasUsd] = useState(DEFAULT_VALUES?.intlFreightOverseasUsd ?? 1500);
    const [intlFreightDomesticUsd, setIntlFreightDomesticUsd] = useState(DEFAULT_VALUES?.intlFreightDomesticUsd ?? 500);
    const [insuranceRate, setInsuranceRate] = useState(DEFAULT_VALUES?.insuranceRate ?? 0.003);
    const [domesticShortHaulCny, setDomesticShortHaulCny] = useState(DEFAULT_VALUES?.domesticShortHaulCny ?? 4680);
    const [sellingPriceCny, setSellingPriceCny] = useState(DEFAULT_VALUES?.sellingPriceCny ?? 5500);
    const [domesticExtras, setDomesticExtras] = useState(DEFAULT_VALUES?.domesticExtras ?? []);
    
    // 批次参数
    const [totalContainers, setTotalContainers] = useState(DEFAULT_VALUES?.totalContainers ?? 10);
    const [tonsPerContainer, setTonsPerContainer] = useState(DEFAULT_VALUES?.tonsPerContainer ?? 26);
    
    // 资金参数
    const [collectionDays, setCollectionDays] = useState(DEFAULT_VALUES?.collectionDays ?? 45);
    const [interestRate, setInterestRate] = useState(DEFAULT_VALUES?.interestRate ?? 6.0);
    
    // 弹窗状态
    const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
    
    // === 认证处理 ===
    const handleLoginSuccess = () => {
        setAuthenticated(true);
    };

    const handleLogout = () => {
        if (logout) {
            logout();
        }
        setAuthenticated(false);
        setShowUserManagement(false);
    };
    
    // 如果未登录，显示登录页面
    console.log('=== 认证检查 ===');
    console.log('authenticated:', authenticated);
    console.log('isAuthenticated 函数:', isAuthenticated);
    console.log('Login 组件:', Login);
    console.log('auth 对象:', auth);
    
    if (!authenticated) {
        console.log('❌ 用户未登录，显示登录页面');
        if (!Login) {
            console.warn('Login 组件未加载');
            return h('div', { className: "min-h-screen bg-[#f4f7fe] flex items-center justify-center" },
                h('div', { className: "text-center" },
                    h('p', { className: "text-gray-600" }, "正在加载登录组件..."),
                    h('p', { className: "text-xs text-gray-400 mt-2" }, "如果长时间未加载，请检查浏览器控制台")
                )
            );
        }
        console.log('✅ 渲染 Login 组件');
        return h(Login, { onLoginSuccess: handleLoginSuccess });
    }
    
    console.log('✅ 用户已登录，显示主应用');
    
    // 暴露打开弹窗的函数到全局（供JS组件调用）
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.openFarmPriceReverseModal = () => setIsReverseModalOpen(true);
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete window.openFarmPriceReverseModal;
            }
        };
    }, []);
    
    // === 事件处理 ===
    const handleCategoryChange = (val) => {
        setCategory(val);
        const firstSub = PRODUCT_CATEGORIES[val][0];
        setSubType(firstSub);
        setPolicyName(`${firstSub}进口税收政策`);
        setExportPolicyName(`${firstSub}出口税收政策`);
    };
    
    // 保存入口关税政策到数据库
    const savePolicy = async () => {
        try {
            const response = await fetch('/api/sku-policies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category,
                    subType,
                    importDutyRate: dutyRate,
                    importVatRate: vatRate,
                    importPolicyName: policyName,
                    // 同时保存出口政策（如果已设置）
                    exportPolicyMode,
                    exportDutyRate,
                    exportVatRate,
                    exportPlanType
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '保存失败');
            }

            const result = await response.json();
            console.log("保存入口关税政策成功:", result);
            setSaveStatus(`已成功保存 [${subType}] 的税收政策: 关税${dutyRate}%, 增值税${vatRate}%`);
            setTimeout(() => setSaveStatus(null), 3500);
        } catch (error) {
            console.error("保存入口关税政策失败:", error);
            setSaveStatus(`保存失败: ${error.message}`);
            setTimeout(() => setSaveStatus(null), 3500);
        }
    };
    
    // 保存出口关税政策到数据库
    const saveExportPolicy = async () => {
        try {
            const response = await fetch('/api/sku-policies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category,
                    subType,
                    // 同时保存入口政策（如果已设置）
                    importDutyRate: dutyRate,
                    importVatRate: vatRate,
                    importPolicyName: policyName,
                    // 出口政策
                    exportPolicyMode,
                    exportDutyRate,
                    exportVatRate,
                    exportPlanType
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '保存失败');
            }

            const result = await response.json();
            console.log("保存出口关税政策成功:", result);
            const modeText = exportPolicyMode === 'no-duty' ? '无关税' : exportPolicyMode === 'with-duty' ? '有关税' : '计划内/计划外';
            setExportSaveStatus(`已成功保存 [${subType}] 的出口政策: ${modeText}`);
            setTimeout(() => setExportSaveStatus(null), 3500);
        } catch (error) {
            console.error("保存出口关税政策失败:", error);
            setExportSaveStatus(`保存失败: ${error.message}`);
            setTimeout(() => setExportSaveStatus(null), 3500);
        }
    };
    
    const addExportExtra = () => setExportExtras([...exportExtras, { id: Date.now(), name: '', value: '', unit: 'RUB/ton' }]);
    const deleteExportExtra = (id) => setExportExtras(exportExtras.filter(item => item.id !== id));
    const updateExportExtra = (id, field, value) => setExportExtras(exportExtras.map(item => item.id === id ? { ...item, [field]: value } : item));
    const toggleExportExtraUnit = (id) => setExportExtras(exportExtras.map(item => item.id === id ? { ...item, unit: item.unit === 'RUB/ton' ? 'RUB/container' : 'RUB/ton' } : item));
    
    const addDomesticExtra = () => setDomesticExtras([...domesticExtras, { id: Date.now(), name: '', value: '', unit: 'CNY/柜' }]);
    const deleteDomesticExtra = (id) => setDomesticExtras(domesticExtras.filter(item => item.id !== id));
    const updateDomesticExtra = (id, field, value) => setDomesticExtras(domesticExtras.map(item => item.id === id ? { ...item, [field]: value } : item));
    const toggleDomesticExtraUnit = (id) => setDomesticExtras(domesticExtras.map(item => item.id === id ? { ...item, unit: item.unit === 'CNY/柜' ? 'CNY/ton' : 'CNY/柜' } : item));
    
    // === 计算 ===
    const results = useMemo(() => {
        return calculatePricing({
            exchangeRate,
            usdCnyRate,
            farmPriceRub,
            shortHaulDistanceKm,
            shortHaulPricePerKmPerContainer,
            exportExtras,
            dutyRate,
            vatRate,
            exportPolicyMode,
            exportDutyRate,
            exportVatRate,
            exportPlanType,
            importPriceRub,
            importPriceUnit,
            intlFreightOverseasUsd,
            intlFreightDomesticUsd,
            insuranceRate,
            domesticShortHaulCny,
            domesticExtras,
            totalContainers,
            tonsPerContainer,
            collectionDays,
            interestRate,
            sellingPriceCny
        });
    }, [
        exchangeRate, usdCnyRate, farmPriceRub, shortHaulDistanceKm, shortHaulPricePerKmPerContainer, exportExtras, dutyRate, vatRate,
        exportPolicyMode, exportDutyRate, exportVatRate, exportPlanType,
        importPriceRub, importPriceUnit, intlFreightOverseasUsd, intlFreightDomesticUsd, insuranceRate, domesticShortHaulCny,
        domesticExtras, totalContainers, tonsPerContainer, collectionDays,
        interestRate, sellingPriceCny
    ]);
    
    // === 渲染 ===
    return h('div', { className: "min-h-screen bg-[#f4f7fe] p-6 font-sans text-slate-800" },
        // 用户管理按钮和登出按钮
        h('div', { className: "max-w-7xl mx-auto mb-4" },
            h('div', { className: "flex justify-between items-center" },
                h('div', { className: "flex gap-3" },
                    isAdmin && isAdmin() && UserManagement && h('button', {
                        onClick: () => setShowUserManagement(!showUserManagement),
                        className: "bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors text-sm"
                    }, showUserManagement ? '← 返回' : '👤 用户管理'),
                    h('div', { className: "flex items-center gap-2 text-sm text-gray-600" },
                        h('span', null, `当前用户: ${getCurrentUser ? getCurrentUser()?.username || '' : ''}`),
                        isAdmin && isAdmin() && h('span', { className: "px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold" }, "管理员")
                    )
                ),
                h('button', {
                    onClick: handleLogout,
                    className: "bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                }, "登出")
            )
        ),
        // 用户管理页面或主应用
        showUserManagement && isAdmin && isAdmin() && UserManagement ? h(UserManagement) : h('div', { className: "max-w-7xl mx-auto space-y-6" },
            h(Header),
            h(ExchangeRateCards, {
                exchangeRate,
                setExchangeRate,
                usdCnyRate,
                setUsdCnyRate
            }),
            // 产品选择
            h('div', { className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-100" },
                h('label', { className: "text-xs text-slate-400 font-bold uppercase block mb-3" }, "🏷️ 产品类目与规格"),
                h('div', { className: "grid grid-cols-2 gap-2" },
                    h('select', {
                        className: "p-3 bg-[#f8faff] border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-100",
                        value: category,
                        onChange: (e) => handleCategoryChange(e.target.value)
                    },
                        Object.keys(PRODUCT_CATEGORIES).map(cat => 
                            h('option', { key: cat, value: cat }, cat)
                        )
                    ),
                    h('select', {
                        className: "p-3 bg-blue-600 text-white border-none rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-300",
                        value: subType,
                        onChange: (e) => setSubType(e.target.value)
                    },
                        PRODUCT_CATEGORIES[category].map(item => 
                            h('option', { key: item, value: item }, item)
                        )
                    )
                )
            ),
            // 计算核心参数 - 横向排列
            h('div', { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6" },
                // 1. 海外段计算参数
                h(window.OverseaSection, {
                    farmPriceRub,
                    setFarmPriceRub,
                    shortHaulDistanceKm,
                    setShortHaulDistanceKm,
                    shortHaulPricePerKmPerContainer,
                    setShortHaulPricePerKmPerContainer,
                    exportExtras,
                    addExportExtra,
                    deleteExportExtra,
                    updateExportExtra,
                    toggleExportExtraUnit,
                    tonsPerContainer,
                    russianArrivalPriceRub: results.adjustedRussianArrivalPriceRub ?? results.russianArrivalPriceRub,
                    russianArrivalPriceCny: results.adjustedRussianArrivalPriceCny ?? results.russianArrivalPriceCny
                }),
                // 2. 出口板块政策
                ExportPolicySection && h(ExportPolicySection, {
                    exportPolicyName,
                    setExportPolicyName,
                    exportPolicyMode,
                    setExportPolicyMode,
                    exportDutyRate,
                    setExportDutyRate,
                    exportVatRate,
                    setExportVatRate,
                    exportPlanType,
                    setExportPlanType,
                    category,
                    subType,
                    exportSaveStatus,
                    saveExportPolicy
                }),
                // 3. 国内段计算参数
                h(window.DomesticSection, {
                    importPriceRub,
                    setImportPriceRub,
                    importPriceUnit,
                    setImportPriceUnit,
                    intlFreightOverseasUsd,
                    setIntlFreightOverseasUsd,
                    intlFreightDomesticUsd,
                    setIntlFreightDomesticUsd,
                    insuranceRate,
                    setInsuranceRate,
                    domesticShortHaulCny,
                    setDomesticShortHaulCny,
                    domesticExtras,
                    addDomesticExtra,
                    deleteDomesticExtra,
                    updateDomesticExtra,
                    toggleDomesticExtraUnit,
                    sellingPriceCny,
                    setSellingPriceCny
                }),
                // 4. 进口税收政策
                h(window.PolicySection, {
                    policyName,
                    setPolicyName,
                    dutyRate,
                    setDutyRate,
                    vatRate,
                    setVatRate,
                    category,
                    subType,
                    saveStatus,
                    savePolicy
                })
            ),
            // 结果展示区域
            h('div', { className: "space-y-6" },
                h(ResultsPanel, {
                    results,
                    totalContainers,
                    setTotalContainers,
                    tonsPerContainer,
                    setTonsPerContainer
                }),
                h(CostBreakdown, {
                    results,
                    subType,
                    policyName,
                    importPriceRub,
                    exchangeRate,
                    intlFreightOverseasUsd,
                    intlFreightDomesticUsd,
                    insuranceRate,
                    usdCnyRate,
                    tonsPerContainer,
                    dutyRate,
                    vatRate
                }),
                h(FinancePanel, {
                    collectionDays,
                    setCollectionDays,
                    interestRate,
                    setInterestRate,
                    interestExpense: results.interestExpense
                })
            ),
            // 倒推弹窗
            FarmPriceReverseModal && h(FarmPriceReverseModal, {
                isOpen: isReverseModalOpen,
                onClose: () => setIsReverseModalOpen(false),
                onApply: (farmPriceRub) => {
                    setFarmPriceRub(farmPriceRub);
                    setIsReverseModalOpen(false);
                },
                exchangeRate,
                usdCnyRate,
            shortHaulDistanceKm,
            shortHaulPricePerKmPerContainer,
                exportExtras,
                dutyRate,
                vatRate,
                importPriceRub,
                importPriceUnit,
                    intlFreightOverseasUsd,
                    intlFreightDomesticUsd,
                domesticShortHaulCny,
                domesticExtras,
                tonsPerContainer,
                collectionDays,
                interestRate
            })
        )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.App = App;
}
// 注意：在 CDN 模式下不使用 ES6 export，因为 Babel Standalone 会转换为 CommonJS
