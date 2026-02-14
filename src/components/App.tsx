/**
 * App 组件 - 主应用组件（TypeScript + Vite 版本）
 * 使用模块化组件和工具函数
 */
import { useState, useMemo, useEffect, createElement } from 'react';
import { Header } from './Header';
// 导入 JS 组件（通过类型声明文件）
import { ExchangeRateCards } from './ExchangeRateCards';
import { ResultsPanel } from './ResultsPanel';
import { CostBreakdown } from './CostBreakdown';
import { FinancePanel } from './FinancePanel';
import { FarmPriceReverseModal } from './FarmPriceReverseModal.tsx';
import { Login } from './Login.tsx';
import { UserManagement } from './UserManagement.tsx';
// 导入工具函数
import { calculatePricing, PRODUCT_CATEGORIES } from '../utils/calculations.ts';
import { DEFAULT_VALUES } from '../config/constants.js';
import { isAuthenticated, isAdmin, logout, getCurrentUser } from '../utils/auth.ts';
import type { PricingResults, OverseaExtra, DomesticExtra } from '../types/index.d';

export function App() {
    // === 认证状态 ===
    // 检查登录状态（添加详细日志）
    const checkAuth = () => {
        try {
            const currentUser = getCurrentUser();
            console.log('=== 认证检查开始 ===');
            console.log('getCurrentUser() 返回值:', currentUser);
            console.log('localStorage.getItem("currentUser"):', localStorage.getItem('currentUser'));
            
            const auth = isAuthenticated();
            console.log('isAuthenticated() 返回值:', auth);
            
            if (auth) {
                console.log('✅ 用户已登录:', currentUser);
            } else {
                console.log('❌ 用户未登录，应该显示登录页面');
            }
            console.log('=== 认证检查结束 ===');
            return auth;
        } catch (error) {
            console.error('认证检查出错:', error);
            return false;
        }
    };
    
    const [authenticated, setAuthenticated] = useState(() => {
        const auth = checkAuth();
        return auth;
    });
    const [showUserManagement, setShowUserManagement] = useState(false);
    
    // === 状态管理 ===
    const [exchangeRate, setExchangeRate] = useState(DEFAULT_VALUES.exchangeRate);
    const [usdCnyRate, setUsdCnyRate] = useState(DEFAULT_VALUES.usdCnyRate);
    const [category, setCategory] = useState(DEFAULT_VALUES.category);
    const [subType, setSubType] = useState(DEFAULT_VALUES.subType);
    const [policyName, setPolicyName] = useState(DEFAULT_VALUES.policyName);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    
    // 海外段参数
    const [farmPriceRub, setFarmPriceRub] = useState(DEFAULT_VALUES.farmPriceRub);
    const [overseaLogistics1, setOverseaLogistics1] = useState(DEFAULT_VALUES.overseaLogistics1);
    const [unit1, setUnit1] = useState<'RUB/t' | 'RUB/柜'>(DEFAULT_VALUES.unit1 as 'RUB/t' | 'RUB/柜');
    const [overseaLogistics2, setOverseaLogistics2] = useState(DEFAULT_VALUES.overseaLogistics2);
    const [unit2, setUnit2] = useState<'RUB/t' | 'RUB/柜'>(DEFAULT_VALUES.unit2 as 'RUB/t' | 'RUB/柜');
    const [exportExtras, setExportExtras] = useState(DEFAULT_VALUES.exportExtras);
    
    // 税收政策
    const [dutyRate, setDutyRate] = useState(DEFAULT_VALUES.dutyRate);
    const [vatRate, setVatRate] = useState(DEFAULT_VALUES.vatRate);
    
    // 国内段参数
    const [importPriceRub, setImportPriceRub] = useState(DEFAULT_VALUES.importPriceRub);
    const [importPriceUnit, setImportPriceUnit] = useState<'RUB/t' | 'RUB/柜'>(DEFAULT_VALUES.importPriceUnit as 'RUB/t' | 'RUB/柜');
    const [intlFreightUsd, setIntlFreightUsd] = useState(DEFAULT_VALUES.intlFreightUsd);
    const [domesticShortHaulCny, setDomesticShortHaulCny] = useState(DEFAULT_VALUES.domesticShortHaulCny);
    const [sellingPriceCny, setSellingPriceCny] = useState(DEFAULT_VALUES.sellingPriceCny);
    const [domesticExtras, setDomesticExtras] = useState(DEFAULT_VALUES.domesticExtras);
    
    // 批次参数
    const [totalContainers, setTotalContainers] = useState(DEFAULT_VALUES.totalContainers);
    const [tonsPerContainer, setTonsPerContainer] = useState(DEFAULT_VALUES.tonsPerContainer);
    
    // 资金参数
    const [collectionDays, setCollectionDays] = useState(DEFAULT_VALUES.collectionDays);
    const [interestRate, setInterestRate] = useState(DEFAULT_VALUES.interestRate);
    
    // 弹窗状态
    const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
    
    // 暴露打开弹窗的函数到全局（供JS组件调用）
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).openFarmPriceReverseModal = () => setIsReverseModalOpen(true);
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any).openFarmPriceReverseModal;
            }
        };
    }, []);
    
    // === 事件处理 ===
    const handleCategoryChange = (val: string) => {
        setCategory(val as any);
        const firstSub = PRODUCT_CATEGORIES[val as keyof typeof PRODUCT_CATEGORIES][0];
        setSubType(firstSub);
        setPolicyName(`${firstSub}进口税收政策`);
    };
    
    const savePolicy = () => {
        const policyData = {
            timestamp: new Date().toISOString(),
            policyName,
            targetProduct: { category, subType },
            rates: { dutyRate, vatRate }
        };
        console.log("Saving Policy with Product Association:", policyData);
        setSaveStatus(`已成功保存 [${subType}] 的税收政策: 关税${dutyRate}%, 增值税${vatRate}%`);
        setTimeout(() => setSaveStatus(null), 3500);
    };
    
    const addExportExtra = () => setExportExtras([...exportExtras, { id: Date.now(), name: '', value: '', unit: 'RUB/ton' }]);
    const deleteExportExtra = (id: number) => setExportExtras(exportExtras.filter((item: OverseaExtra) => item.id !== id));
    const updateExportExtra = (id: number, field: string, value: any) => setExportExtras(exportExtras.map((item: OverseaExtra) => item.id === id ? { ...item, [field]: value } : item));
    const toggleExportExtraUnit = (id: number) => setExportExtras(exportExtras.map((item: OverseaExtra) => item.id === id ? { ...item, unit: item.unit === 'RUB/ton' ? 'RUB/container' : 'RUB/ton' } : item));
    
    const addDomesticExtra = () => setDomesticExtras([...domesticExtras, { id: Date.now(), name: '', value: '', unit: 'CNY/柜' }]);
    const deleteDomesticExtra = (id: number) => setDomesticExtras(domesticExtras.filter((item: DomesticExtra) => item.id !== id));
    const updateDomesticExtra = (id: number, field: string, value: any) => setDomesticExtras(domesticExtras.map((item: DomesticExtra) => item.id === id ? { ...item, [field]: value } : item));
    const toggleDomesticExtraUnit = (id: number) => setDomesticExtras(domesticExtras.map((item: DomesticExtra) => item.id === id ? { ...item, unit: item.unit === 'CNY/柜' ? 'CNY/ton' : 'CNY/柜' } : item));
    
    // === 计算 ===
    const results: PricingResults = useMemo(() => {
        return calculatePricing({
            exchangeRate,
            usdCnyRate,
            farmPriceRub,
            overseaLogistics1,
            unit1: unit1 as 'RUB/t' | 'RUB/柜',
            overseaLogistics2,
            unit2: unit2 as 'RUB/t' | 'RUB/柜',
            exportExtras,
            dutyRate,
            vatRate,
            importPriceRub,
            importPriceUnit: importPriceUnit as 'RUB/t' | 'RUB/柜',
            intlFreightUsd,
            domesticShortHaulCny,
            domesticExtras,
            totalContainers,
            tonsPerContainer,
            collectionDays,
            interestRate,
            sellingPriceCny
        });
    }, [
        exchangeRate, usdCnyRate, farmPriceRub, overseaLogistics1, unit1,
        overseaLogistics2, unit2, exportExtras, dutyRate, vatRate,
        importPriceRub, importPriceUnit, intlFreightUsd, domesticShortHaulCny,
        domesticExtras, totalContainers, tonsPerContainer, collectionDays,
        interestRate, sellingPriceCny
    ]);
    
    // 暴露打开弹窗的函数到全局（供JS组件调用）
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).openFarmPriceReverseModal = () => setIsReverseModalOpen(true);
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any).openFarmPriceReverseModal;
            }
        };
    }, []);
    
    // === 认证处理 ===
    const handleLoginSuccess = () => {
        setAuthenticated(true);
    };

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        setShowUserManagement(false);
    };

    // 如果未登录，显示登录页面
    console.log('=== 渲染检查 ===');
    console.log('authenticated 状态:', authenticated);
    console.log('Login 组件:', Login);
    
    if (!authenticated) {
        console.log('✅ 显示登录页面');
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    
    console.log('✅ 用户已登录，显示主应用');

    // === 渲染 ===
    return (
        <>
            <FarmPriceReverseModal
                isOpen={isReverseModalOpen}
                onClose={() => setIsReverseModalOpen(false)}
                onApply={(farmPriceRub) => {
                    setFarmPriceRub(farmPriceRub);
                    setIsReverseModalOpen(false);
                }}
                exchangeRate={exchangeRate}
                usdCnyRate={usdCnyRate}
                overseaLogistics1={overseaLogistics1}
                unit1={unit1}
                overseaLogistics2={overseaLogistics2}
                unit2={unit2}
                exportExtras={exportExtras}
                dutyRate={dutyRate}
                vatRate={vatRate}
                importPriceRub={importPriceRub}
                importPriceUnit={importPriceUnit}
                intlFreightUsd={intlFreightUsd}
                domesticShortHaulCny={domesticShortHaulCny}
                domesticExtras={domesticExtras}
                tonsPerContainer={tonsPerContainer}
                collectionDays={collectionDays}
                interestRate={interestRate}
            />
            <div className="min-h-screen bg-[#f4f7fe] p-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* 用户管理按钮和登出按钮 */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-3">
                        {isAdmin() && (
                            <button
                                onClick={() => setShowUserManagement(!showUserManagement)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors text-sm"
                            >
                                {showUserManagement ? '← 返回' : '👤 用户管理'}
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>当前用户: {getCurrentUser()?.username}</span>
                            {isAdmin() && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">管理员</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                    >
                        登出
                    </button>
                </div>

                {/* 用户管理页面 */}
                {showUserManagement && isAdmin() ? (
                    <UserManagement />
                ) : (
                    <>
                        <Header />
                <ExchangeRateCards
                    exchangeRate={exchangeRate}
                    setExchangeRate={setExchangeRate}
                    usdCnyRate={usdCnyRate}
                    setUsdCnyRate={setUsdCnyRate}
                />
                
                {/* 产品选择 */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-3">🏷️ 产品类目与规格</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-3 bg-[#f8faff] border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-100"
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {Object.keys(PRODUCT_CATEGORIES).map(cat => 
                                <option key={cat} value={cat}>{cat}</option>
                            )}
                        </select>
                        <select
                            className="p-3 bg-blue-600 text-white border-none rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-300"
                            value={subType}
                            onChange={(e) => setSubType(e.target.value)}
                        >
                            {PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES].map(item => 
                                <option key={item} value={item}>{item}</option>
                            )}
                        </select>
                    </div>
                </div>
                
                {/* 计算核心参数 - 横向排列 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. 海外段计算参数 */}
                    {typeof window !== 'undefined' && (window as any).OverseaSection && createElement(
                        (window as any).OverseaSection,
                        {
                            farmPriceRub,
                            setFarmPriceRub,
                            overseaLogistics1,
                            setOverseaLogistics1,
                            unit1,
                            setUnit1: setUnit1 as any,
                            overseaLogistics2,
                            setOverseaLogistics2,
                            unit2,
                            setUnit2: setUnit2 as any,
                            exportExtras,
                            addExportExtra,
                            deleteExportExtra,
                            updateExportExtra,
                            toggleExportExtraUnit,
                            russianArrivalPriceRub: results.russianArrivalPriceRub,
                            russianArrivalPriceCny: results.russianArrivalPriceCny
                        }
                    )}
                    
                    {/* 2. 进口税收政策 */}
                    {typeof window !== 'undefined' && (window as any).PolicySection && createElement(
                        (window as any).PolicySection,
                        {
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
                        }
                    )}
                    
                    {/* 3. 国内段计算参数 */}
                    {typeof window !== 'undefined' && (window as any).DomesticSection && createElement(
                        (window as any).DomesticSection,
                        {
                            importPriceRub,
                            setImportPriceRub,
                            importPriceUnit,
                            setImportPriceUnit: setImportPriceUnit as any,
                            intlFreightUsd,
                            setIntlFreightUsd,
                            domesticShortHaulCny,
                            setDomesticShortHaulCny,
                            domesticExtras,
                            addDomesticExtra,
                            deleteDomesticExtra,
                            updateDomesticExtra,
                            toggleDomesticExtraUnit,
                            sellingPriceCny,
                            setSellingPriceCny
                        }
                    )}
                </div>
                
                {/* 结果展示区域 */}
                <div className="space-y-6">
                    <ResultsPanel
                        results={results}
                        totalContainers={totalContainers}
                        setTotalContainers={setTotalContainers}
                        tonsPerContainer={tonsPerContainer}
                        setTonsPerContainer={setTonsPerContainer}
                    />
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
                    <FinancePanel
                        collectionDays={collectionDays}
                        setCollectionDays={setCollectionDays}
                        interestRate={interestRate}
                        setInterestRate={setInterestRate}
                        interestExpense={results.interestExpense}
                    />
                </div>
                    </>
                )}
            </div>
        </div>
        </>
    );
}
