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
import { createTranslator, type Language } from '../utils/i18n.ts';
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
    
    // 农场记录相关状态
    const [farmName, setFarmName] = useState('');
    const [farmSaveStatus, setFarmSaveStatus] = useState<string | null>(null);
    const [showFarmRecords, setShowFarmRecords] = useState(false);
    const [farmRecords, setFarmRecords] = useState<any[]>([]);
    
    // 语言选择状态（从localStorage读取，默认中文）
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'zh' || saved === 'ru' || saved === 'en') ? saved : 'zh';
    });
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    
    // 保存语言选择到localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);
    
    // 创建翻译函数
    const t = createTranslator(language);
    
    // 海外段参数
    const [farmPriceRub, setFarmPriceRub] = useState(DEFAULT_VALUES.farmPriceRub);
    const [shortHaulDistanceKm, setShortHaulDistanceKm] = useState(DEFAULT_VALUES.shortHaulDistanceKm);
    const [shortHaulPricePerKmPerContainer, setShortHaulPricePerKmPerContainer] = useState(DEFAULT_VALUES.shortHaulPricePerKmPerContainer);
    const [exportExtras, setExportExtras] = useState(DEFAULT_VALUES.exportExtras);
    
    // 税收政策
    const [dutyRate, setDutyRate] = useState(DEFAULT_VALUES.dutyRate);
    const [vatRate, setVatRate] = useState(DEFAULT_VALUES.vatRate);
    
    // 出口板块政策
    const [exportPolicyName, setExportPolicyName] = useState(DEFAULT_VALUES.exportPolicyName);
    const [exportPolicyMode, setExportPolicyMode] = useState<'no-duty' | 'with-duty' | 'planned'>(DEFAULT_VALUES.exportPolicyMode as 'no-duty' | 'with-duty' | 'planned');
    const [exportDutyRate, setExportDutyRate] = useState(DEFAULT_VALUES.exportDutyRate);
    const [exportVatRate, setExportVatRate] = useState(DEFAULT_VALUES.exportVatRate);
    const [exportPlanType, setExportPlanType] = useState<'planned' | 'unplanned'>(DEFAULT_VALUES.exportPlanType as 'planned' | 'unplanned');
    const [exportSaveStatus, setExportSaveStatus] = useState<string | null>(null);
    
    // 从数据库加载SKU的关税政策
    useEffect(() => {
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
                        setExportPolicyMode(policy.export_policy_mode as 'no-duty' | 'with-duty' | 'planned');
                    }
                    if (policy.export_duty_rate !== null && policy.export_duty_rate !== undefined) {
                        setExportDutyRate(Number(policy.export_duty_rate));
                    }
                    if (policy.export_vat_rate !== null && policy.export_vat_rate !== undefined) {
                        setExportVatRate(Number(policy.export_vat_rate));
                    }
                    if (policy.export_plan_type) {
                        setExportPlanType(policy.export_plan_type as 'planned' | 'unplanned');
                    }
                    
                    console.log('已加载SKU关税政策:', policy);
                }
            } catch (error) {
                console.error('加载SKU政策失败:', error);
            }
        };
        
        loadSkuPolicy();
    }, [category, subType]);
    
    // 当语言或子类型变化时，更新政策名称
    useEffect(() => {
        if (subType) {
            const translatedSubType = t(`subtype_${subType}`) || subType;
            setPolicyName(`${translatedSubType}${t('importTaxPolicy')}`);
            setExportPolicyName(`${translatedSubType}${t('exportTaxPolicy')}`);
        }
    }, [language, subType, t]);
    
    // 国内段参数
    const [importPriceRub, setImportPriceRub] = useState(DEFAULT_VALUES.importPriceRub);
    const [importPriceUnit, setImportPriceUnit] = useState<'RUB/t' | 'RUB/柜'>(DEFAULT_VALUES.importPriceUnit as 'RUB/t' | 'RUB/柜');
    const [intlFreightOverseasUsd, setIntlFreightOverseasUsd] = useState(DEFAULT_VALUES.intlFreightOverseasUsd);
    const [intlFreightDomesticUsd, setIntlFreightDomesticUsd] = useState(DEFAULT_VALUES.intlFreightDomesticUsd);
    const [insuranceRate, setInsuranceRate] = useState(DEFAULT_VALUES.insuranceRate);
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
        // 政策名称会在 useEffect 中自动更新
    };
    
    // 处理子类型变化，自动更新政策名称
    const handleSubTypeChange = (val: string) => {
        setSubType(val);
        // 政策名称会在 useEffect 中自动更新
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
            setSaveStatus(`${t('saveSuccess')} [${subType}] ${t('importTaxPolicy')}: ${t('duty')}${dutyRate}%, ${t('vat')}${vatRate}%`);
            setTimeout(() => setSaveStatus(null), 3500);
        } catch (error: any) {
            console.error("保存入口关税政策失败:", error);
            setSaveStatus(`保存失败: ${error.message}`);
            setTimeout(() => setSaveStatus(null), 3500);
        }
    };
    
    // 保存出口关税政策到数据库
    // 保存农场记录
    const saveFarmRecord = async () => {
        if (!farmName.trim()) {
            setFarmSaveStatus(t('pleaseEnterFarmName'));
            setTimeout(() => setFarmSaveStatus(null), 3000);
            return;
        }

        const productName = `${category} > ${subType}`;
        const recordData = {
            id: Date.now().toString(), // 本地存储使用时间戳作为 ID
            farm_name: farmName.trim(),
            category,
            sub_type: subType,
            product_name: productName,
            russian_arrival_price_rub: results.adjustedRussianArrivalPriceRub ?? results.russianArrivalPriceRub,
            russian_arrival_price_cny: results.adjustedRussianArrivalPriceCny ?? results.russianArrivalPriceCny,
            gross_profit_cny: results.profitNoInterest,
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/farm-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    farmName: farmName.trim(),
                    category,
                    subType,
                    productName,
                    russianArrivalPriceRub: results.adjustedRussianArrivalPriceRub ?? results.russianArrivalPriceRub,
                    russianArrivalPriceCny: results.adjustedRussianArrivalPriceCny ?? results.russianArrivalPriceCny,
                    grossProfitCny: results.profitNoInterest
                }),
            });

            // 检查响应内容类型
            const contentType = response.headers.get('content-type') || '';
            
            // 如果 API 不可用，使用 localStorage 作为回退
            if (!response.ok || !contentType.includes('application/json')) {
                const text = await response.text();
                if (text.includes('import') || text.includes('export') || !response.ok) {
                    console.warn('API 路由在本地开发环境中不可用，使用 localStorage 作为回退');
                    // 使用 localStorage 保存
                    const stored = localStorage.getItem('farm_records');
                    const records = stored ? JSON.parse(stored) : [];
                    records.push(recordData);
                    localStorage.setItem('farm_records', JSON.stringify(records));
                    setFarmSaveStatus(`已成功保存农场记录到本地: ${farmName.trim()}`);
                    setTimeout(() => setFarmSaveStatus(null), 3000);
                    // 不清空农场名称，保留输入
                    return;
                }
                const error = await response.json();
                throw new Error(error.error || '保存失败');
            }

            const result = await response.json();
            console.log("保存农场记录成功:", result);
            setFarmSaveStatus(`${t('saveSuccess')} ${t('farmRecords')}: ${farmName.trim()}`);
            setTimeout(() => setFarmSaveStatus(null), 3000);
        } catch (error: any) {
            // 如果 API 调用失败，尝试使用 localStorage
            if (error.message && (error.message.includes('JSON') || error.message.includes('fetch'))) {
                try {
                    const stored = localStorage.getItem('farm_records');
                    const records = stored ? JSON.parse(stored) : [];
                    records.push(recordData);
                    localStorage.setItem('farm_records', JSON.stringify(records));
                    setFarmSaveStatus(`已成功保存农场记录到本地: ${farmName.trim()}`);
                    setTimeout(() => setFarmSaveStatus(null), 3000);
                    // 不清空农场名称，保留输入
                    return;
                } catch (e) {
                    console.error('localStorage 保存失败:', e);
                }
            }
            console.error("保存农场记录失败:", error);
            setFarmSaveStatus(`${t('saveFailed')}: ${error.message}`);
            setTimeout(() => setFarmSaveStatus(null), 3000);
        }
    };

    // 加载农场记录
    const loadFarmRecords = async () => {
        try {
            const response = await fetch('/api/farm-records');
            
            // 检查响应内容类型
            const contentType = response.headers.get('content-type') || '';
            
            // 如果返回的不是 JSON，可能是本地开发环境 API 不可用
            if (!contentType.includes('application/json')) {
                const text = await response.text();
                // 如果返回的是 TypeScript/JavaScript 代码，说明 API 路由未正确配置
                if (text.includes('import') || text.includes('export')) {
                    console.warn('API 路由在本地开发环境中不可用，使用 localStorage 作为回退');
                    // 使用 localStorage 作为回退
                    const stored = localStorage.getItem('farm_records');
                    if (stored) {
                        try {
                            const data = JSON.parse(stored);
                            setFarmRecords(data || []);
                            return;
                        } catch (e) {
                            console.error('解析 localStorage 数据失败:', e);
                        }
                    }
                    setFarmRecords([]);
                    return;
                }
                throw new Error('API 返回了非 JSON 格式的数据');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 响应错误:', errorText);
                throw new Error(`加载失败: ${response.status}`);
            }
            
            const data = await response.json();
            setFarmRecords(data || []);
        } catch (error: any) {
            console.error('加载农场记录失败:', error);
            // 尝试使用 localStorage 作为回退
            try {
                const stored = localStorage.getItem('farm_records');
                if (stored) {
                    const data = JSON.parse(stored);
                    setFarmRecords(data || []);
                    console.log('已从 localStorage 加载农场记录');
                    return;
                }
            } catch (e) {
                console.error('从 localStorage 加载失败:', e);
            }
            setFarmRecords([]);
        }
    };

    // 打开查看记录弹窗时加载数据
    useEffect(() => {
        if (showFarmRecords) {
            loadFarmRecords();
        }
    }, [showFarmRecords]);

    // 删除农场记录
    const deleteFarmRecord = async (id: string) => {
        if (!confirm(t('confirmDelete'))) {
            return;
        }

        try {
            const response = await fetch(`/api/farm-records?id=${id}`, {
                method: 'DELETE',
            });

            // 检查是否是本地开发环境
            const contentType = response.headers.get('content-type') || '';
            if (!response.ok || !contentType.includes('application/json')) {
                const text = await response.text();
                if (text.includes('import') || text.includes('export') || !response.ok) {
                    // 使用 localStorage 删除
                    const stored = localStorage.getItem('farm_records');
                    if (stored) {
                        const records = JSON.parse(stored);
                        const filtered = records.filter((r: any) => r.id !== id);
                        localStorage.setItem('farm_records', JSON.stringify(filtered));
                        loadFarmRecords();
                        return;
                    }
                }
                const error = await response.json();
                throw new Error(error.error || '删除失败');
            }

            // 重新加载记录
            loadFarmRecords();
        } catch (error: any) {
            // 如果 API 失败，尝试使用 localStorage
            if (error.message && (error.message.includes('JSON') || error.message.includes('fetch'))) {
                try {
                    const stored = localStorage.getItem('farm_records');
                    if (stored) {
                        const records = JSON.parse(stored);
                        const filtered = records.filter((r: any) => r.id !== id);
                        localStorage.setItem('farm_records', JSON.stringify(filtered));
                        loadFarmRecords();
                        return;
                    }
                } catch (e) {
                    console.error('localStorage 删除失败:', e);
                }
            }
            console.error('删除农场记录失败:', error);
            alert(`删除失败: ${error.message}`);
        }
    };
    
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
        } catch (error: any) {
            console.error("保存出口关税政策失败:", error);
            setExportSaveStatus(`保存失败: ${error.message}`);
            setTimeout(() => setExportSaveStatus(null), 3500);
        }
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
            importPriceUnit: importPriceUnit as 'RUB/t' | 'RUB/柜',
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
                shortHaulDistanceKm={shortHaulDistanceKm}
                shortHaulPricePerKmPerContainer={shortHaulPricePerKmPerContainer}
                exportExtras={exportExtras}
                dutyRate={dutyRate}
                vatRate={vatRate}
                importPriceRub={importPriceRub}
                importPriceUnit={importPriceUnit}
                intlFreightOverseasUsd={intlFreightOverseasUsd}
                intlFreightDomesticUsd={intlFreightDomesticUsd}
                insuranceRate={insuranceRate}
                domesticShortHaulCny={domesticShortHaulCny}
                domesticExtras={domesticExtras}
                tonsPerContainer={tonsPerContainer}
                collectionDays={collectionDays}
                interestRate={interestRate}
                language={language}
                t={t}
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
                                {showUserManagement ? t('back') : `👤 ${t('userManagement')}`}
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{t('currentUser')}: {getCurrentUser()?.username}</span>
                            {isAdmin() && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">{t('admin')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* 语言选择按钮 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                            >
                                <span>🌐</span>
                                <span>
                                    {language === 'zh' ? '中文' : language === 'ru' ? 'Русский' : 'English'}
                                </span>
                                <span className="text-xs">▼</span>
                            </button>
                            {showLanguageMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowLanguageMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-20 min-w-[120px]">
                                        <button
                                            onClick={() => {
                                                setLanguage('zh');
                                                setShowLanguageMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                                language === 'zh' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                                            }`}
                                        >
                                            中文
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLanguage('ru');
                                                setShowLanguageMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                                language === 'ru' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                                            }`}
                                        >
                                            Русский
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLanguage('en');
                                                setShowLanguageMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                                language === 'en' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                                            }`}
                                        >
                                            English
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>

                {/* 用户管理页面 */}
                {showUserManagement && isAdmin() ? (
                    <UserManagement />
                ) : (
                    <>
                        <Header language={language} t={t} />
                <ExchangeRateCards
                    exchangeRate={exchangeRate}
                    setExchangeRate={setExchangeRate}
                    usdCnyRate={usdCnyRate}
                    setUsdCnyRate={setUsdCnyRate}
                    language={language}
                    t={t}
                />
                
                {/* 农场名称输入和保存 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                        <label className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">🏡 {t('farmName')}</label>
                        <input
                            type="text"
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            placeholder={t('enterFarmName')}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                        <button
                            onClick={saveFarmRecord}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                        >
                            <span>💾</span>
                            <span>{t('saveRecord')}</span>
                        </button>
                        <button
                            onClick={() => setShowFarmRecords(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                        >
                            <span>📋</span>
                            <span>{t('viewRecords')}</span>
                        </button>
                    </div>
                    {farmSaveStatus && (
                        <div className={`text-xs font-bold py-2 px-3 rounded-lg ${
                            farmSaveStatus.includes(t('saveFailed')) || farmSaveStatus.includes('失败')
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                        }`}>
                            {farmSaveStatus}
                        </div>
                    )}
                </div>

                {/* 查看农场记录弹窗 */}
                {showFarmRecords && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">{t('farmRecords')}</h3>
                                <button
                                    onClick={() => setShowFarmRecords(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {farmRecords.length === 0 ? (
                                    <div className="text-center text-slate-400 py-8">{t('noRecords')}</div>
                                ) : (
                                    <div className="space-y-3">
                                        {farmRecords.map((record: any) => (
                                            <div key={record.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm font-bold text-slate-800">🏡 {record.farm_name}</span>
                                                            <span className="text-xs text-slate-500">•</span>
                                                            <span className="text-sm text-slate-600">{record.product_name}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                                                    <div>
                                                                        <span className="text-slate-500">{t('overseasArrivalEstimate')} (RUB/t): </span>
                                                                        <span className="font-bold text-orange-600">
                                                                            {record.russian_arrival_price_rub 
                                                                                ? record.russian_arrival_price_rub.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                                                : '-'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-500">{t('overseasArrivalEstimate')} (CNY/t): </span>
                                                                        <span className="font-bold text-indigo-600">
                                                                            {record.russian_arrival_price_cny 
                                                                                ? `¥ ${record.russian_arrival_price_cny.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                                                                : '-'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-500">{t('grossProfit')}: </span>
                                                                        <span className="font-bold text-green-600">
                                                                            {record.gross_profit_cny 
                                                                                ? `¥ ${record.gross_profit_cny.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                                                                : '-'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-slate-400 mt-2">
                                                                    {t('saveTime')}: {new Date(record.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : language === 'ru' ? 'ru-RU' : 'en-US')}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteFarmRecord(record.id)}
                                                                className="ml-4 text-red-500 hover:text-red-700 transition-colors text-sm"
                                                            >
                                                                {t('delete')}
                                                            </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 产品选择 */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-3">🏷️ {t('productCategory')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-3 bg-[#f8faff] border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-100"
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {Object.keys(PRODUCT_CATEGORIES).map(cat => 
                                <option key={cat} value={cat}>{t(`category_${cat}`) || cat}</option>
                            )}
                        </select>
                        <select
                            className="p-3 bg-blue-600 text-white border-none rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-300"
                            value={subType}
                            onChange={(e) => handleSubTypeChange(e.target.value)}
                        >
                            {PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES].map(item => 
                                <option key={item} value={item}>{t(`subtype_${item}`) || item}</option>
                            )}
                        </select>
                    </div>
                </div>
                
                {/* 计算核心参数 - 横向排列 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* 1. 海外段计算参数 */}
                    {typeof window !== 'undefined' && (window as any).OverseaSection && createElement(
                        (window as any).OverseaSection,
                        {
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
                            russianArrivalPriceCny: results.adjustedRussianArrivalPriceCny ?? results.russianArrivalPriceCny,
                            exportVatRebateRub: results.exportVatRebateRub ?? 0,
                            exportDutyRub: results.exportDutyRub ?? 0,
                            language,
                            t
                        }
                    )}
                    
                    {/* 2. 出口板块政策 */}
                    {typeof window !== 'undefined' && (window as any).ExportPolicySection && createElement(
                        (window as any).ExportPolicySection,
                        {
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
                            saveExportPolicy,
                            language,
                            t
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
                            setSellingPriceCny,
                            language,
                            t
                        }
                    )}
                    
                    {/* 4. 进口税收政策 */}
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
                            savePolicy,
                            language,
                            t
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
                        intlFreightOverseasUsd={intlFreightOverseasUsd}
                        intlFreightDomesticUsd={intlFreightDomesticUsd}
                        insuranceRate={insuranceRate}
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
                        language={language}
                        t={t}
                    />
                </div>
                    </>
                )}
            </div>
        </div>
        </>
    );
}
