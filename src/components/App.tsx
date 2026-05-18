/**
 * App 组件 - 主应用组件（TypeScript + Vite 版本）
 * 使用模块化组件和工具函数
 */
import { useState, useMemo, useEffect, useCallback, createElement } from 'react';
import html2canvas from 'html2canvas';
import { Header } from './Header';
// 导入 JS 组件（通过类型声明文件）
import { ExchangeRateCards } from './ExchangeRateCards';
import { FarmPriceReverseModal } from './FarmPriceReverseModal.tsx';
import { Login } from './Login.tsx';
import { UserManagement } from './UserManagement.tsx';
// 导入工具函数
import { calculatePricing, PRODUCT_CATEGORIES } from '../utils/calculations.ts';
import { DEFAULT_VALUES } from '../config/constants.js';
import { isAuthenticated, logout, getCurrentUser, canManageUsers, canViewFca, canViewDap, canViewDomestic } from '../utils/auth.ts';
import { createTranslator, type Language } from '../utils/i18n.ts';
import type { PricingResults, OverseaExtra, DomesticExtra, OverseaFarmHaulModule } from '../types/index.d';
import { skuKey, type SkuLocalSaveMarks } from '../utils/skuPolicyMarkers.ts';
import { readResponseJson, errorMessageFromBody } from '../utils/httpJson.ts';

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
    const [isDownloadingScreenshot, setIsDownloadingScreenshot] = useState(false);
    
    // 保存语言选择到localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);
    
    // 创建翻译函数（每次 language 改变时重新创建）
    const t = useMemo(() => createTranslator(language), [language]);
    
    // 调试：验证 t 函数是否正确工作
    useEffect(() => {
        const testKey = 'customsValue';
        const testResult = t(testKey);
        if (testResult === testKey) {
            console.error(`[App] ❌ 翻译函数有问题: key="${testKey}", language="${language}", 返回键名本身`);
        } else {
            console.log(`[App] ✅ 翻译函数正常: key="${testKey}", language="${language}", result="${testResult}"`);
        }
    }, [language, t]);
    
    // 海外段参数（农场+短驳可多组）
    const [overseaModules, setOverseaModules] = useState<OverseaFarmHaulModule[]>(() => {
        const m = DEFAULT_VALUES.overseaModules;
        return Array.isArray(m) && m.length > 0
            ? (m as OverseaFarmHaulModule[])
            : [{ id: 1, farmPriceRub: 0, shortHaulDistanceKm: 0, shortHaulPricePerKmPerContainer: 0, shortHaulVatRate: 0 }];
    });
    const [exportExtras, setExportExtras] = useState(DEFAULT_VALUES.exportExtras);
    // 期望盈利与关税计算选项
    const [expectedProfitPercent, setExpectedProfitPercent] = useState(0);
    /** 每吨期望盈利（RUB/t）；与百分点二选一：有值且百分点为 0 时建议价=保本价+此项 */
    const [expectedProfitPerTonRub, setExpectedProfitPerTonRub] = useState<number | undefined>(undefined);
    const [includeShortHaulInDuty, setIncludeShortHaulInDuty] = useState(true);
    const [exportPriceRub, setExportPriceRub] = useState(0);
    /** 关税计算用：不含退税口径的出口价（不填则与主字段一致走进口结算货值fallback，由计算层处理） */
    const [exportPriceNoRebateRub, setExportPriceNoRebateRub] = useState(0);
    
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

    const SKU_SAVE_MARKS_KEY = 'skuSaveMarks';
    const [skuSaveMarks, setSkuSaveMarks] = useState<Record<string, SkuLocalSaveMarks>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = sessionStorage.getItem(SKU_SAVE_MARKS_KEY);
            if (raw) return JSON.parse(raw) as Record<string, SkuLocalSaveMarks>;
        } catch {
            /* ignore */
        }
        return {};
    });

    const markSkuImportSaved = useCallback(() => {
        setSkuSaveMarks((prev) => {
            const key = skuKey(category, subType);
            const next = { ...prev, [key]: { ...prev[key], importSaved: true } };
            try {
                sessionStorage.setItem(SKU_SAVE_MARKS_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, [category, subType]);

    const markSkuExportSaved = useCallback(() => {
        setSkuSaveMarks((prev) => {
            const key = skuKey(category, subType);
            const next = { ...prev, [key]: { ...prev[key], exportSaved: true } };
            try {
                sessionStorage.setItem(SKU_SAVE_MARKS_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, [category, subType]);

    /** 仅根据「保存进口 / 保存出口」按钮写入的会话标记展示，不与服务端整行混用 */
    const currentSkuSaveMarks = useMemo(() => {
        const m = skuSaveMarks[skuKey(category, subType)];
        return {
            hasImport: !!m?.importSaved,
            hasExport: !!m?.exportSaved,
        };
    }, [category, subType, skuSaveMarks]);
    
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
                
                const policy = await readResponseJson<Record<string, unknown>>(response);
                
                if (policy) {
                    // 加载入口关税政策
                    if (policy.import_duty_rate !== null && policy.import_duty_rate !== undefined) {
                        setDutyRate(Number(policy.import_duty_rate));
                    }
                    if (policy.import_vat_rate !== null && policy.import_vat_rate !== undefined) {
                        setVatRate(Number(policy.import_vat_rate));
                    }
                    if (policy.import_policy_name) {
                        setPolicyName(String(policy.import_policy_name));
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

    const farmPriceRubSum = useMemo(
        () => overseaModules.reduce((s, m) => s + (Number(m.farmPriceRub) || 0), 0),
        [overseaModules]
    );
    const shortHaulFeePerTonTotal = useMemo(() => {
        const tpc = tonsPerContainer || 1;
        return overseaModules.reduce((s, m) => {
            const km = Number(m.shortHaulDistanceKm) || 0;
            const pp = Number(m.shortHaulPricePerKmPerContainer) || 0;
            return s + (km * 2 * pp) / tpc;
        }, 0);
    }, [overseaModules, tonsPerContainer]);
    
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

            const body = await readResponseJson<{ error?: string }>(response);
            if (!response.ok) {
                throw new Error(errorMessageFromBody(body, response, '保存失败'));
            }

            console.log("保存入口关税政策成功:", body);
            setSaveStatus(`${t('saveSuccess')} [${subType}] ${t('importTaxPolicy')}: ${t('duty')}${dutyRate}%, ${t('vat')}${vatRate}%`);
            markSkuImportSaved();
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
                let errMsg = '保存失败';
                try {
                    const err = text.trim() ? JSON.parse(text) : null;
                    if (err && typeof err === 'object' && err.error) errMsg = String(err.error);
                } catch {
                    /* ignore */
                }
                throw new Error(errMsg);
            }

            const result = await readResponseJson(response);
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
            
            const data = await readResponseJson<unknown[]>(response);
            setFarmRecords(Array.isArray(data) ? data : []);
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
                let errMsg = '删除失败';
                try {
                    const err = text.trim() ? JSON.parse(text) : null;
                    if (err && typeof err === 'object' && err.error) errMsg = String(err.error);
                } catch {
                    /* ignore */
                }
                throw new Error(errMsg);
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

            const exportBody = await readResponseJson<{ error?: string }>(response);
            if (!response.ok) {
                throw new Error(errorMessageFromBody(exportBody, response, '保存失败'));
            }

            console.log("保存出口关税政策成功:", exportBody);
            const modeText = exportPolicyMode === 'no-duty' ? '无关税' : exportPolicyMode === 'with-duty' ? '有关税' : '计划内/计划外';
            setExportSaveStatus(`已成功保存 [${subType}] 的出口政策: ${modeText}`);
            markSkuExportSaved();
            setTimeout(() => setExportSaveStatus(null), 3500);
        } catch (error: any) {
            console.error("保存出口关税政策失败:", error);
            setExportSaveStatus(`保存失败: ${error.message}`);
            setTimeout(() => setExportSaveStatus(null), 3500);
        }
    };
    
    const addExportExtra = () => setExportExtras([...exportExtras, { id: Date.now(), name: '', value: '', unit: 'RUB/ton', vatRate: 0 }]);
    const deleteExportExtra = (id: number) => setExportExtras(exportExtras.filter((item: OverseaExtra) => item.id !== id));
    const updateExportExtra = (id: number, field: string, value: any) => setExportExtras(exportExtras.map((item: OverseaExtra) => item.id === id ? { ...item, [field]: value } : item));
    const toggleExportExtraUnit = (id: number) => setExportExtras(exportExtras.map((item: OverseaExtra) => item.id === id ? { ...item, unit: item.unit === 'RUB/ton' ? 'RUB/container' : 'RUB/ton' } : item));
    
    const addDomesticExtra = () => setDomesticExtras([...domesticExtras, { id: Date.now(), name: '', value: '', unit: 'CNY/柜' }]);
    const deleteDomesticExtra = (id: number) => setDomesticExtras(domesticExtras.filter((item: DomesticExtra) => item.id !== id));
    const updateDomesticExtra = (id: number, field: string, value: any) => setDomesticExtras(domesticExtras.map((item: DomesticExtra) => item.id === id ? { ...item, [field]: value } : item));
    const toggleDomesticExtraUnit = (id: number) => setDomesticExtras(domesticExtras.map((item: DomesticExtra) => item.id === id ? { ...item, unit: item.unit === 'CNY/柜' ? 'CNY/ton' : 'CNY/柜' } : item));

    // 固定 id，用于标识自动插入的"海外短驳费（转CNY）"条目
    const SHORT_HAUL_AUTO_ID = -9999;

    // 当"不包含短驳入关税"时，自动将海外短驳费转为 CNY/ton 插入国内杂费
    useEffect(() => {
        const shortHaulCny = shortHaulFeePerTonTotal / (exchangeRate || 1);

        if (!includeShortHaulInDuty && shortHaulCny > 0) {
            // 插入或更新该条目
            setDomesticExtras((prev: DomesticExtra[]) => {
                const exists = prev.find((item: DomesticExtra) => item.id === SHORT_HAUL_AUTO_ID);
                if (exists) {
                    return prev.map((item: DomesticExtra) =>
                        item.id === SHORT_HAUL_AUTO_ID
                            ? { ...item, value: Math.round(shortHaulCny * 100) / 100 }
                            : item
                    );
                }
                return [...prev, {
                    id: SHORT_HAUL_AUTO_ID,
                    name: '海外短驳费(转CNY)',
                    value: Math.round(shortHaulCny * 100) / 100,
                    unit: 'CNY/ton'
                }];
            });
        } else {
            // 包含或短驳费为0时，移除该条目
            setDomesticExtras((prev: DomesticExtra[]) =>
                prev.filter((item: DomesticExtra) => item.id !== SHORT_HAUL_AUTO_ID)
            );
        }
    }, [includeShortHaulInDuty, shortHaulFeePerTonTotal, exchangeRate]);
    
    // === 计算 ===
    const results: PricingResults = useMemo(() => {
        return calculatePricing({
            exchangeRate,
            usdCnyRate,
            farmPriceRub: farmPriceRubSum,
            shortHaulDistanceKm: 0,
            shortHaulPricePerKmPerContainer: 0,
            shortHaulFeePerTonOverride: shortHaulFeePerTonTotal,
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
            sellingPriceCny,
            expectedProfitPercent,
            includeShortHaulInDuty,
            exportPriceRub,
            exportPriceNoRebateRub,
            expectedProfitPerTonRub
        });
    }, [
        exchangeRate, usdCnyRate, farmPriceRubSum, shortHaulFeePerTonTotal, exportExtras, dutyRate, vatRate,
        exportPolicyMode, exportDutyRate, exportVatRate, exportPlanType,
        importPriceRub, importPriceUnit, intlFreightOverseasUsd, intlFreightDomesticUsd, insuranceRate, domesticShortHaulCny,
        domesticExtras, totalContainers, tonsPerContainer, collectionDays,
        interestRate, sellingPriceCny,
        expectedProfitPercent, expectedProfitPerTonRub, includeShortHaulInDuty, exportPriceRub, exportPriceNoRebateRub
    ]);
    
    // 当建议出口价变化时，自动填入不含退税口径出口价。
    // 若期望盈利为0，自动填入保本出口价 P（总收入 P+退税 = 总支出 C+关税，见 calculatePricing.breakEvenExportPriceRub）。
    // 含退税口径不随期望盈利点联动，避免与不含退税价格混用。
    useEffect(() => {
        const suggested = results.suggestedExportPriceRub ?? 0;
        const be = results.breakEvenExportPriceRub ?? 0;
        const beNoRebate = results.breakEvenExportPriceNoRebateRub ?? 0;
        const tonRaw = expectedProfitPerTonRub;
        const tonDefined =
            tonRaw !== undefined && tonRaw !== null && Number.isFinite(Number(tonRaw));
        const tonProfit = tonDefined ? Math.max(0, Number(tonRaw)) : 0;

        if (suggested > 0) {
            if (expectedProfitPercent === 0 && tonDefined) {
                setExportPriceNoRebateRub(Math.round(beNoRebate + tonProfit));
            } else {
                setExportPriceNoRebateRub(Math.round(suggested));
            }
        } else if (expectedProfitPercent === 0 && exportDutyRate > 0) {
            if (be > 0) {
                setExportPriceNoRebateRub(beNoRebate > 0 ? beNoRebate : 0);
            }
        } else if (expectedProfitPercent === 0 && exportDutyRate === 0) {
            setExportPriceNoRebateRub(beNoRebate > 0 ? beNoRebate : 0);
        }
    }, [
        results.suggestedExportPriceRub,
        results.breakEvenExportPriceRub,
        results.breakEvenExportPriceNoRebateRub,
        expectedProfitPercent,
        exportDutyRate,
        expectedProfitPerTonRub,
    ]);
    
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

    const currentUser = getCurrentUser();
    const canUserManageUsers = canManageUsers(currentUser);
    const showOverseaSection = canViewFca(currentUser);
    const showExportPolicySection = canViewFca(currentUser);
    const showRailFreightSection = canViewDap(currentUser);
    const showDomesticSection = canViewDomestic(currentUser);
    const showImportPolicySection = canViewDomestic(currentUser);
    const showKpiSections = canViewFca(currentUser);
    const visibleCoreSectionCount = [
        showOverseaSection,
        showExportPolicySection,
        showRailFreightSection,
        showDomesticSection,
        showImportPolicySection
    ].filter(Boolean).length;
    const coreGridClass =
        visibleCoreSectionCount <= 1
            ? 'grid grid-cols-1 gap-6'
            : visibleCoreSectionCount === 2
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : visibleCoreSectionCount === 3
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                    : visibleCoreSectionCount === 4
                        ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6'
                        : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6';

    const handleDownloadScreenshot = async () => {
        const content = document.querySelector<HTMLElement>('[data-screenshot-content="true"]');
        if (!content || isDownloadingScreenshot) return;

        setShowLanguageMenu(false);
        setIsDownloadingScreenshot(true);
        document.body.classList.add('image-export-mode');

        try {
            await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
            const sourceCanvas = await html2canvas(content, {
                backgroundColor: '#f4f7fe',
                scale: Math.min(2, window.devicePixelRatio || 1),
                useCORS: true,
                logging: false,
                windowWidth: content.scrollWidth,
                windowHeight: content.scrollHeight
            });

            const targetWidth = 2480;
            const targetHeight = 1754;
            const padding = 48;
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = targetWidth;
            outputCanvas.height = targetHeight;

            const ctx = outputCanvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            const scale = Math.min(
                (targetWidth - padding * 2) / sourceCanvas.width,
                (targetHeight - padding * 2) / sourceCanvas.height
            );
            const drawWidth = sourceCanvas.width * scale;
            const drawHeight = sourceCanvas.height * scale;
            const drawX = (targetWidth - drawWidth) / 2;
            const drawY = (targetHeight - drawHeight) / 2;

            ctx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight);

            const link = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            link.download = `pricing-page-${date}.png`;
            link.href = outputCanvas.toDataURL('image/png');
            link.click();
        } finally {
            document.body.classList.remove('image-export-mode');
            setIsDownloadingScreenshot(false);
        }
    };

    // === 渲染 ===
    return (
        <>
            <FarmPriceReverseModal
                isOpen={isReverseModalOpen}
                onClose={() => setIsReverseModalOpen(false)}
                onApply={(result) => {
                    const totalFarmRub = result.farmPriceRub;
                    setOverseaModules((mods) => {
                        const rest = mods.slice(1).reduce((s, m) => s + (Number(m.farmPriceRub) || 0), 0);
                        const firstFarm = Math.max(0, Number(totalFarmRub) - rest);
                        return mods.map((m, i) => (i === 0 ? { ...m, farmPriceRub: firstFarm } : m));
                    });
                    if (result.importPriceRubPerTon !== undefined) {
                        const nextImportPrice =
                            importPriceUnit === 'RUB/柜'
                                ? result.importPriceRubPerTon * (tonsPerContainer || 1)
                                : result.importPriceRubPerTon;
                        setImportPriceRub(Math.max(0, nextImportPrice));
                    }
                    setIsReverseModalOpen(false);
                }}
                exchangeRate={exchangeRate}
                usdCnyRate={usdCnyRate}
                shortHaulFeePerTon={shortHaulFeePerTonTotal}
                exportExtras={exportExtras}
                includeShortHaulInDuty={includeShortHaulInDuty}
                dutyRate={dutyRate}
                vatRate={vatRate}
                intlFreightOverseasUsd={intlFreightOverseasUsd}
                intlFreightDomesticUsd={intlFreightDomesticUsd}
                insuranceRate={insuranceRate}
                domesticShortHaulCny={domesticShortHaulCny}
                domesticExtras={domesticExtras}
                tonsPerContainer={tonsPerContainer}
                language={language}
                t={t}
            />
            <div className="min-h-screen bg-[#f4f7fe] p-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6" data-screenshot-content="true">
                {/* 用户管理按钮和登出按钮 */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-3">
                        {canUserManageUsers && (
                            <button
                                onClick={() => setShowUserManagement(!showUserManagement)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors text-sm"
                            >
                                {showUserManagement ? t('back') : `👤 ${t('userManagement')}`}
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{t('currentUser')}: {currentUser?.username}</span>
                            {currentUser?.role === 'admin' && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">{t('admin')}</span>
                            )}
                            {currentUser?.role === 'ddp' && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">DDP</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadScreenshot}
                            disabled={isDownloadingScreenshot}
                            className="no-print bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-wait transition-colors text-sm flex items-center gap-2"
                            title={t('downloadScreenshot')}
                        >
                            <span>🖼️</span>
                            <span>{isDownloadingScreenshot ? t('generatingScreenshot') : t('downloadScreenshot')}</span>
                        </button>
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
                {showUserManagement && canUserManageUsers ? (
                    <UserManagement />
                ) : (
                    <>
                        <Header language={language} t={t} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                            <ExchangeRateCards
                                exchangeRate={exchangeRate}
                                setExchangeRate={setExchangeRate}
                                usdCnyRate={usdCnyRate}
                                setUsdCnyRate={setUsdCnyRate}
                                language={language}
                                t={t}
                            />
                            
                            {/* 农场名称输入和保存 */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">🏡 {t('farmName')}</p>
                                </div>
                                <div className="p-4">
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={farmName}
                                        onChange={(e) => setFarmName(e.target.value)}
                                        placeholder={t('enterFarmName')}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={saveFarmRecord}
                                            className="bg-blue-600 text-white px-3 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <span>💾</span>
                                            <span>{t('saveRecord')}</span>
                                        </button>
                                        <button
                                            onClick={() => setShowFarmRecords(true)}
                                            className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <span>📋</span>
                                            <span>{t('viewRecords')}</span>
                                        </button>
                                    </div>
                                </div>
                                {farmSaveStatus && (
                                    <div className={`text-xs font-bold py-2 px-3 rounded-lg mt-3 ${
                                        farmSaveStatus.includes(t('saveFailed')) || farmSaveStatus.includes('失败')
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {farmSaveStatus}
                                    </div>
                                )}
                                </div>
                            </div>

                            {/* 产品选择 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">🏷️ {t('productCategory')}</p>
                                </div>
                                <div className="p-4">
                                <div className="grid grid-cols-1 gap-2.5">
                                    <select
                                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-100"
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
                                        {PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES].map(item => {
                                            const sm = skuSaveMarks[skuKey(category, item)];
                                            const hasImport = !!sm?.importSaved;
                                            const hasExport = !!sm?.exportSaved;
                                            const baseLabel = t(`subtype_${item}`) || item;
                                            const marks = [
                                                hasImport ? t('skuPolicyMarkImport') : null,
                                                hasExport ? t('skuPolicyMarkExport') : null
                                            ].filter(Boolean);
                                            const suffix = marks.length > 0 ? `  [${marks.join('/')}]` : '';
                                            const titleParts: string[] = [];
                                            if (hasImport) titleParts.push(String(t('skuPolicyMarkImport')));
                                            if (hasExport) titleParts.push(String(t('skuPolicyMarkExport')));
                                            const optTitle =
                                                marks.length > 0
                                                    ? `${baseLabel} — ${titleParts.join(', ')}`
                                                    : baseLabel;
                                            return (
                                                <option key={item} value={item} title={optTitle}>
                                                    {baseLabel}
                                                    {suffix}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 leading-snug">{t('skuPolicyLegend')}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                                    <span className={currentSkuSaveMarks.hasImport ? 'font-bold text-blue-600' : 'text-slate-400'}>
                                        {t('skuSavedImportLabel')}: {currentSkuSaveMarks.hasImport ? t('skuSavedYes') : t('skuSavedNo')}
                                    </span>
                                    <span className="text-slate-300" aria-hidden>
                                        |
                                    </span>
                                    <span className={currentSkuSaveMarks.hasExport ? 'font-bold text-emerald-600' : 'text-slate-400'}>
                                        {t('skuSavedExportLabel')}: {currentSkuSaveMarks.hasExport ? t('skuSavedYes') : t('skuSavedNo')}
                                    </span>
                                </div>
                                </div>
                            </div>
                        </div>

                        {showKpiSections && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                        <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight">{t('basePriceNoInterest')}</p>
                                        <div className="flex items-baseline">
                                            <span className="text-sm font-bold mr-1 text-slate-400">¥</span>
                                            <span className="text-xl font-black text-[#1a2b4b] tracking-tighter">
                                                {results.baseLandingPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a2b4b] p-4 rounded-xl shadow-xl text-white">
                                        <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-tight">{t('totalPriceWithInterest')}</p>
                                        <div className="flex items-baseline">
                                            <span className="text-sm font-bold mr-1 text-slate-600">¥</span>
                                            <span className="text-xl font-black tracking-tighter">
                                                {results.fullCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                        <p className="text-emerald-700 text-[10px] mb-1 font-bold uppercase tracking-tight">{t('grossProfit')}</p>
                                        <div className="text-emerald-600 flex items-baseline">
                                            <span className="text-sm font-bold mr-1">¥</span>
                                            <span className="text-xl font-black tracking-tighter">
                                                {results.profitNoInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
                                        <p className="text-blue-700 text-[10px] mb-1 font-bold uppercase tracking-tight">{t('estimatedNetProfit')}</p>
                                        <div className="text-blue-600 flex items-baseline">
                                            <span className="text-sm font-bold mr-1">¥</span>
                                            <span className="text-xl font-black tracking-tighter">
                                                {results.profitWithInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#1a2b4b] rounded-2xl p-6 text-white shadow-xl space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <p className="text-[10px] text-blue-200 mb-2 font-bold uppercase tracking-widest italic">{t('totalContainers')}</p>
                                            <input
                                                type="number"
                                                value={totalContainers === 0 ? '' : totalContainers}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setTotalContainers(val === '' ? 0 : Number(val));
                                                }}
                                                placeholder="0"
                                                className="text-4xl font-black bg-transparent border-b-4 border-blue-400 w-full outline-none text-white focus:border-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-blue-200 mb-2 font-bold uppercase tracking-widest italic">{t('tonsPerContainer')}</p>
                                            <input
                                                type="number"
                                                value={tonsPerContainer === 0 ? '' : tonsPerContainer}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setTonsPerContainer(val === '' ? 0 : Number(val));
                                                }}
                                                placeholder="0"
                                                className="text-4xl font-black bg-transparent border-b-4 border-blue-400 w-full outline-none text-white focus:border-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-blue-500/50">
                                        <p className="text-[10px] text-blue-100 mb-2 font-black uppercase tracking-[0.2em] italic">{`${t('totalCapitalOccupied')} (${t('cny')})`}</p>
                                        <span className="text-4xl font-black tabular-nums drop-shadow-lg">
                                            ¥ {results.totalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest italic border-b-2 border-indigo-100 pb-2">{t('financeLeverage')}</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] text-slate-400 font-black uppercase">{t('collectionCycle')}</span>
                                            <span className="text-indigo-600 text-lg font-black">{collectionDays}<span className="text-[10px] font-normal uppercase"> Days</span></span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="150"
                                            value={collectionDays}
                                            onChange={e => setCollectionDays(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] text-slate-400 font-black uppercase">{t('annualInterestRate')}</span>
                                            <span className="text-indigo-600 text-lg font-black">{interestRate}% <span className="text-[10px] font-normal uppercase">APR</span></span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="15"
                                            step="0.1"
                                            value={interestRate}
                                            onChange={e => setInterestRate(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-xl shadow-indigo-100">
                                        <p className="text-[10px] opacity-70 mb-2 font-black uppercase italic tracking-[0.2em]">{t('financialCostPerTon')}</p>
                                        <div className="flex items-baseline">
                                            <span className="text-xl font-bold mr-1 opacity-50">¥</span>
                                            <span className="text-4xl font-black tracking-tighter">
                                                {results.interestExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                
                {/* 计算核心参数 - 横向排列 */}
                <div className={coreGridClass}>
                    {/* 1. 海外段计算参数 */}
                    {showOverseaSection && typeof window !== 'undefined' && (window as any).OverseaSection && createElement(
                        (window as any).OverseaSection,
                        {
                            overseaModules,
                            setOverseaModules,
                            exportExtras,
                            addExportExtra,
                            deleteExportExtra,
                            updateExportExtra,
                            toggleExportExtraUnit,
                            tonsPerContainer,
                            russianArrivalPriceRub: results.adjustedRussianArrivalPriceRub ?? results.russianArrivalPriceRub,
                            russianArrivalPriceCny: results.adjustedRussianArrivalPriceCny ?? results.russianArrivalPriceCny,
                            baseRussianArrivalPriceRub: results.baseRussianArrivalPriceRub,
                            exportVatRebateRub: results.exportVatRebateRub ?? 0,
                            exportDutyRub: results.exportDutyRub ?? 0,
                            exportDutyRate,
                            exportVatRate,
                            expectedProfitPercent,
                            setExpectedProfitPercent,
                            expectedProfitPerTonRub,
                            setExpectedProfitPerTonRub,
                            includeShortHaulInDuty,
                            setIncludeShortHaulInDuty,
                            exportPriceRub,
                            setExportPriceRub,
                            exportPriceNoRebateRub,
                            setExportPriceNoRebateRub,
                            suggestedFarmPriceRub: results.suggestedFarmPriceRub ?? 0,
                            suggestedExportPriceRub: results.suggestedExportPriceRub ?? 0,
                            suggestedExportDutyRub: results.suggestedExportDutyRub ?? 0,
                            effectiveDutyBaseRub: results.effectiveDutyBaseRub ?? 0,
                            effectiveDutyBaseNoRebateRub: results.effectiveDutyBaseNoRebateRub ?? 0,
                            breakEvenExportPriceRub: results.breakEvenExportPriceRub ?? 0,
                            breakEvenExportPriceNoRebateRub: results.breakEvenExportPriceNoRebateRub ?? 0,
                            language,
                            t
                        }
                    )}
                    
                    {/* 2. 出口板块政策 */}
                    {showExportPolicySection && typeof window !== 'undefined' && (window as any).ExportPolicySection && createElement(
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
                            exportSaved: currentSkuSaveMarks.hasExport,
                            language,
                            t
                        }
                    )}

                    {/* 3. 中欧班列运费 */}
                    {showRailFreightSection && typeof window !== 'undefined' && (window as any).RailFreightSection && createElement(
                        (window as any).RailFreightSection,
                        {
                            intlFreightOverseasUsd,
                            setIntlFreightOverseasUsd,
                            intlFreightDomesticUsd,
                            setIntlFreightDomesticUsd,
                            language,
                            t
                        }
                    )}
                    
                    {/* 4. 国内段计算参数 */}
                    {showDomesticSection && typeof window !== 'undefined' && (window as any).DomesticSection && createElement(
                        (window as any).DomesticSection,
                        {
                            importPriceRub,
                            setImportPriceRub,
	                            importPriceUnit,
	                            setImportPriceUnit: setImportPriceUnit as any,
	                            exchangeRate,
	                            results,
	                            subType,
	                            policyName,
	                            intlFreightOverseasUsd,
	                            intlFreightDomesticUsd,
	                            insuranceRate,
	                            setInsuranceRate,
	                            usdCnyRate,
	                            tonsPerContainer,
	                            dutyRate,
	                            vatRate,
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
                    
                    {/* 5. 进口税收政策 */}
                    {showImportPolicySection && typeof window !== 'undefined' && (window as any).PolicySection && createElement(
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
                            importSaved: currentSkuSaveMarks.hasImport,
                            language,
                            t
                        }
                    )}
                </div>
                
	                    </>
                )}
            </div>
        </div>
        </>
    );
}
