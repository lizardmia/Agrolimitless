/**
 * UserManagement 组件 - 用户管理页面（仅超级管理员）
 */
import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, isAdmin, getCurrentUser } from '../utils/auth.ts';
import type { User } from '../utils/auth.ts';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 创建用户表单
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

    // 编辑用户表单
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRole, setEditRole] = useState<'admin' | 'user'>('user');

    useEffect(() => {
        if (!isAdmin()) {
            setError('只有超级管理员可以访问此页面');
            return;
        }
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const allUsers = await Promise.resolve(getAllUsers());
            setUsers(Array.isArray(allUsers) ? allUsers : []);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setError('');
        setSuccess('');
        
        try {
            const result = await Promise.resolve(createUser(newUsername, newPassword, newRole));
            
            if (result.success) {
                setSuccess('用户创建成功');
                setNewUsername('');
                setNewPassword('');
                setNewRole('user');
                setShowCreateModal(false);
                await loadUsers();
            } else {
                setError(result.error || '创建失败');
            }
        } catch (err: any) {
            setError(err.message || '创建失败');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditUsername(user.username);
        setEditPassword('');
        setEditRole(user.role);
        setError('');
        setSuccess('');
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        
        setError('');
        setSuccess('');
        
        const updates: { username?: string; password?: string; role?: 'admin' | 'user' } = {};
        if (editUsername !== editingUser.username) {
            updates.username = editUsername;
        }
        if (editPassword) {
            updates.password = editPassword;
        }
        if (editRole !== editingUser.role) {
            updates.role = editRole;
        }

        try {
            const result = await Promise.resolve(updateUser(editingUser.id, updates));
            
            if (result.success) {
                setSuccess('用户更新成功');
                setShowEditModal(false);
                setEditingUser(null);
                await loadUsers();
            } else {
                setError(result.error || '更新失败');
            }
        } catch (err: any) {
            setError(err.message || '更新失败');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
            return;
        }

        setError('');
        setSuccess('');
        
        try {
            const result = await Promise.resolve(deleteUser(userId));
            
            if (result.success) {
                setSuccess('用户删除成功');
                await loadUsers();
            } else {
                setError(result.error || '删除失败');
            }
        } catch (err: any) {
            setError(err.message || '删除失败');
        }
    };

    const currentUser = getCurrentUser();

    if (!isAdmin()) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    只有超级管理员可以访问此页面
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            setError('');
                            setSuccess('');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        + 创建用户
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">用户名</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">角色</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">创建时间</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {user.username}
                                        {currentUser?.id === user.id && (
                                            <span className="ml-2 text-xs text-blue-600">(当前用户)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            user.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {user.role === 'admin' ? '超级管理员' : '普通用户'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(user.createdAt).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                            >
                                                编辑
                                            </button>
                                            {currentUser?.id !== user.id && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-800 font-bold text-xs"
                                                >
                                                    删除
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 创建用户弹窗 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">创建用户</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="请输入用户名"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="请输入密码"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="user">普通用户</option>
                                    <option value="admin">超级管理员</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCreate}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                创建
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setError('');
                                    setNewUsername('');
                                    setNewPassword('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑用户弹窗 */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">编辑用户</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">新密码（留空则不修改）</label>
                                <input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="留空则不修改密码"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="user">普通用户</option>
                                    <option value="admin">超级管理员</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                保存
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingUser(null);
                                    setError('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
