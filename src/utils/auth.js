/**
 * 用户认证工具函数（CDN 版本）
 */

// 默认超级管理员账号
const DEFAULT_ADMIN = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// 从 localStorage 获取用户列表
function getUsers() {
    const stored = localStorage.getItem('users');
    if (!stored) {
        // 初始化：只有超级管理员
        const users = [DEFAULT_ADMIN];
        localStorage.setItem('users', JSON.stringify(users));
        return users;
    }
    return JSON.parse(stored);
}

// 保存用户列表到 localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 获取当前登录用户
function getCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
}

// 设置当前登录用户
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// 登录
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        return { success: true, user };
    }
    
    return { success: false, error: '用户名或密码错误' };
}

// 登出
function logout() {
    setCurrentUser(null);
}

// 检查是否已登录
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// 检查是否是超级管理员
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// 获取所有用户（仅管理员）
function getAllUsers() {
    if (!isAdmin()) {
        throw new Error('只有超级管理员可以查看用户列表');
    }
    return getUsers();
}

// 创建用户（仅管理员）
function createUser(username, password, role = 'user') {
    if (!isAdmin()) {
        return { success: false, error: '只有超级管理员可以创建用户' };
    }
    
    const users = getUsers();
    
    if (users.some(u => u.username === username)) {
        return { success: false, error: '用户名已存在' };
    }
    
    const newUser = {
        id: `user-${Date.now()}`,
        username,
        password,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
}

// 更新用户（仅管理员）
function updateUser(userId, updates) {
    if (!isAdmin()) {
        return { success: false, error: '只有超级管理员可以修改用户' };
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: '用户不存在' };
    }
    
    if (updates.username && users.some((u, i) => i !== userIndex && u.username === updates.username)) {
        return { success: false, error: '用户名已存在' };
    }
    
    const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
    }
    
    return { success: true, user: updatedUser };
}

// 删除用户（仅管理员）
function deleteUser(userId) {
    if (!isAdmin()) {
        return { success: false, error: '只有超级管理员可以删除用户' };
    }
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return { success: false, error: '不能删除当前登录的用户' };
    }
    
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
        return { success: false, error: '用户不存在' };
    }
    
    saveUsers(filteredUsers);
    return { success: true };
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.auth = {
        login,
        logout,
        isAuthenticated,
        isAdmin,
        getCurrentUser,
        getAllUsers,
        createUser,
        updateUser,
        deleteUser
    };
    console.log('auth 已导出到全局');
}
