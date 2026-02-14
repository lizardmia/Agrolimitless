/**
 * 用户认证工具函数
 * 支持两种模式：
 * 1. API 模式（生产环境）：调用 Vercel API，数据存储在 Supabase
 * 2. localStorage 模式（开发/回退）：使用浏览器本地存储
 */

export interface User {
    id: string;
    username: string;
    password?: string; // 仅用于 localStorage 模式
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

// API 基础路径
const API_BASE = '/api';

// 检查是否使用 API 模式（通过环境变量或配置）
const USE_API = import.meta.env.VITE_USE_API === 'true' || import.meta.env.PROD;

// ==================== API 模式 ====================

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: '请求失败' }));
        throw new Error(error.error || '请求失败');
    }

    return response.json();
}

// 登录（API 模式）
async function loginAPI(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Login API error:', {
                status: response.status,
                statusText: response.statusText,
                data
            });
            return { success: false, error: data.error || data.message || `服务器错误 (${response.status})` };
        }

        if (data.success && data.user) {
            // 保存到 localStorage（用于前端状态管理）
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            return { success: true, user: data.user };
        }

        return { success: false, error: data.error || '登录失败' };
    } catch (error: any) {
        console.error('Login API request failed:', error);
        return { success: false, error: error.message || '网络错误，请检查 API 配置' };
    }
}

// 获取所有用户（API 模式）
async function getAllUsersAPI(): Promise<User[]> {
    try {
        return await apiRequest('/users');
    } catch (error: any) {
        throw new Error(error.message || '获取用户列表失败');
    }
}

// 创建用户（API 模式）
async function createUserAPI(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const data = await apiRequest('/users/create', {
            method: 'POST',
            body: JSON.stringify({ username, password, role }),
        });

        if (data.success && data.user) {
            return { success: true, user: data.user };
        }

        return { success: false, error: data.error || '创建用户失败' };
    } catch (error: any) {
        return { success: false, error: error.message || '创建用户失败' };
    }
}

// 更新用户（API 模式）
async function updateUserAPI(userId: string, updates: { username?: string; password?: string; role?: 'admin' | 'user' }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const data = await apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });

        if (data.success && data.user) {
            // 如果更新的是当前登录用户，更新 localStorage
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            }
            return { success: true, user: data.user };
        }

        return { success: false, error: data.error || '更新用户失败' };
    } catch (error: any) {
        return { success: false, error: error.message || '更新用户失败' };
    }
}

// 删除用户（API 模式）
async function deleteUserAPI(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const data = await apiRequest(`/users/${userId}`, {
            method: 'DELETE',
        });

        if (data.success) {
            return { success: true };
        }

        return { success: false, error: data.error || '删除用户失败' };
    } catch (error: any) {
        return { success: false, error: error.message || '删除用户失败' };
    }
}

// ==================== localStorage 模式（回退）====================

// 默认超级管理员账号
const DEFAULT_ADMIN: User = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// 从 localStorage 获取用户列表
function getUsersLocal(): User[] {
    const stored = localStorage.getItem('users');
    if (!stored) {
        const users = [DEFAULT_ADMIN];
        localStorage.setItem('users', JSON.stringify(users));
        return users;
    }
    return JSON.parse(stored);
}

// 保存用户列表到 localStorage
function saveUsersLocal(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
}

// 登录（localStorage 模式）
function loginLocal(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = getUsersLocal();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: '用户名或密码错误' };
}

// 获取所有用户（localStorage 模式）
function getAllUsersLocal(): User[] {
    return getUsersLocal();
}

// 创建用户（localStorage 模式）
function createUserLocal(username: string, password: string, role: 'admin' | 'user' = 'user'): { success: boolean; user?: User; error?: string } {
    const users = getUsersLocal();
    
    if (users.some(u => u.username === username)) {
        return { success: false, error: '用户名已存在' };
    }
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        password,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsersLocal(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
}

// 更新用户（localStorage 模式）
function updateUserLocal(userId: string, updates: { username?: string; password?: string; role?: 'admin' | 'user' }): { success: boolean; user?: User; error?: string } {
    const users = getUsersLocal();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: '用户不存在' };
    }
    
    if (updates.username && users.some((u, i) => i !== userIndex && u.username === updates.username)) {
        return { success: false, error: '用户名已存在' };
    }
    
    const updatedUser: User = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    saveUsersLocal(users);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        setCurrentUser(userWithoutPassword);
    }
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return { success: true, user: userWithoutPassword };
}

// 删除用户（localStorage 模式）
function deleteUserLocal(userId: string): { success: boolean; error?: string } {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return { success: false, error: '不能删除当前登录的用户' };
    }
    
    const users = getUsersLocal();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
        return { success: false, error: '用户不存在' };
    }
    
    saveUsersLocal(filteredUsers);
    return { success: true };
}

// ==================== 统一接口 ====================

// 获取当前登录用户
export function getCurrentUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
}

// 设置当前登录用户
export function setCurrentUser(user: User | null): void {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// 登录
export function login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> | { success: boolean; user?: User; error?: string } {
    if (USE_API) {
        return loginAPI(username, password);
    }
    return loginLocal(username, password);
}

// 登出
export function logout(): void {
    setCurrentUser(null);
}

// 检查是否已登录
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

// 检查是否是超级管理员
export function isAdmin(): boolean {
    const user = getCurrentUser();
    return user?.role === 'admin';
}

// 获取所有用户（仅管理员）
export function getAllUsers(): Promise<User[]> | User[] {
    if (!isAdmin()) {
        throw new Error('只有超级管理员可以查看用户列表');
    }
    
    if (USE_API) {
        return getAllUsersAPI();
    }
    return getAllUsersLocal();
}

// 创建用户（仅管理员）
export function createUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; user?: User; error?: string }> | { success: boolean; user?: User; error?: string } {
    if (!isAdmin()) {
        return Promise.resolve({ success: false, error: '只有超级管理员可以创建用户' });
    }
    
    if (USE_API) {
        return createUserAPI(username, password, role);
    }
    return createUserLocal(username, password, role);
}

// 更新用户（仅管理员）
export function updateUser(userId: string, updates: { username?: string; password?: string; role?: 'admin' | 'user' }): Promise<{ success: boolean; user?: User; error?: string }> | { success: boolean; user?: User; error?: string } {
    if (!isAdmin()) {
        return Promise.resolve({ success: false, error: '只有超级管理员可以修改用户' });
    }
    
    if (USE_API) {
        return updateUserAPI(userId, updates);
    }
    return updateUserLocal(userId, updates);
}

// 删除用户（仅管理员）
export function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string } {
    if (!isAdmin()) {
        return Promise.resolve({ success: false, error: '只有超级管理员可以删除用户' });
    }
    
    if (USE_API) {
        return deleteUserAPI(userId);
    }
    return deleteUserLocal(userId);
}
