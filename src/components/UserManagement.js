/**
 * UserManagement 组件 - 用户管理页面（仅超级管理员，CDN 版本）
 */
function UserManagement() {
    const { useState, useEffect } = React;
    const h = React.createElement;
    
    const { getAllUsers, createUser, updateUser, deleteUser, isAdmin, getCurrentUser } = window.auth || {};
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');

    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRole, setEditRole] = useState('user');

    useEffect(() => {
        if (!isAdmin || !isAdmin()) {
            setError('只有超级管理员可以访问此页面');
            setLoading(false);
            return;
        }
        loadUsers();
    }, []);

    const loadUsers = () => {
        try {
            const allUsers = getAllUsers();
            setUsers(allUsers);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setError('');
        setSuccess('');
        const result = createUser(newUsername, newPassword, newRole);
        
        if (result.success) {
            setSuccess('用户创建成功');
            setNewUsername('');
            setNewPassword('');
            setNewRole('user');
            setShowCreateModal(false);
            loadUsers();
        } else {
            setError(result.error || '创建失败');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditUsername(user.username);
        setEditPassword('');
        setEditRole(user.role);
        setError('');
        setSuccess('');
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        if (!editingUser) return;
        
        setError('');
        setSuccess('');
        
        const updates = {};
        if (editUsername !== editingUser.username) {
            updates.username = editUsername;
        }
        if (editPassword) {
            updates.password = editPassword;
        }
        if (editRole !== editingUser.role) {
            updates.role = editRole;
        }

        const result = updateUser(editingUser.id, updates);
        
        if (result.success) {
            setSuccess('用户更新成功');
            setShowEditModal(false);
            setEditingUser(null);
            loadUsers();
        } else {
            setError(result.error || '更新失败');
        }
    };

    const handleDelete = (userId) => {
        if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
            return;
        }

        setError('');
        setSuccess('');
        const result = deleteUser(userId);
        
        if (result.success) {
            setSuccess('用户删除成功');
            loadUsers();
        } else {
            setError(result.error || '删除失败');
        }
    };

    const currentUser = getCurrentUser ? getCurrentUser() : null;

    if (!isAdmin || !isAdmin()) {
        return h('div', { className: "p-6" },
            h('div', { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" },
                "只有超级管理员可以访问此页面"
            )
        );
    }

    if (loading) {
        return h('div', { className: "p-6 text-center" },
            h('div', { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }),
            h('p', { className: "mt-2 text-gray-600" }, "加载中...")
        );
    }

    return h('div', { className: "p-6" },
        h('div', { className: "bg-white rounded-2xl shadow-lg p-6" },
            h('div', { className: "flex justify-between items-center mb-6" },
                h('h2', { className: "text-2xl font-bold text-gray-800" }, "用户管理"),
                h('button', {
                    onClick: () => {
                        setShowCreateModal(true);
                        setError('');
                        setSuccess('');
                    },
                    className: "bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                }, "+ 创建用户")
            ),
            error && h('div', { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" }, error),
            success && h('div', { className: "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4" }, success),
            h('div', { className: "overflow-x-auto" },
                h('table', { className: "w-full border-collapse" },
                    h('thead', null,
                        h('tr', { className: "bg-gray-50 border-b border-gray-200" },
                            h('th', { className: "px-4 py-3 text-left text-sm font-bold text-gray-700" }, "用户名"),
                            h('th', { className: "px-4 py-3 text-left text-sm font-bold text-gray-700" }, "角色"),
                            h('th', { className: "px-4 py-3 text-left text-sm font-bold text-gray-700" }, "创建时间"),
                            h('th', { className: "px-4 py-3 text-left text-sm font-bold text-gray-700" }, "操作")
                        )
                    ),
                    h('tbody', null,
                        users.map((user) => h('tr', { key: user.id, className: "border-b border-gray-100 hover:bg-gray-50" },
                            h('td', { className: "px-4 py-3 text-sm text-gray-800" },
                                user.username,
                                currentUser && currentUser.id === user.id && h('span', { className: "ml-2 text-xs text-blue-600" }, "(当前用户)")
                            ),
                            h('td', { className: "px-4 py-3 text-sm" },
                                h('span', {
                                    className: `px-2 py-1 rounded text-xs font-bold ${
                                        user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`
                                }, user.role === 'admin' ? '超级管理员' : '普通用户')
                            ),
                            h('td', { className: "px-4 py-3 text-sm text-gray-600" },
                                new Date(user.createdAt).toLocaleString('zh-CN')
                            ),
                            h('td', { className: "px-4 py-3 text-sm" },
                                h('div', { className: "flex gap-2" },
                                    h('button', {
                                        onClick: () => handleEdit(user),
                                        className: "text-blue-600 hover:text-blue-800 font-bold text-xs"
                                    }, "编辑"),
                                    currentUser && currentUser.id !== user.id && h('button', {
                                        onClick: () => handleDelete(user.id),
                                        className: "text-red-600 hover:text-red-800 font-bold text-xs"
                                    }, "删除")
                                )
                            )
                        ))
                    )
                )
            )
        ),
        // 创建用户弹窗
        showCreateModal && h('div', { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
            h('div', { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" },
                h('h3', { className: "text-xl font-bold text-gray-800 mb-4" }, "创建用户"),
                h('div', { className: "space-y-4" },
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "用户名"),
                        h('input', {
                            type: "text",
                            value: newUsername,
                            onChange: (e) => setNewUsername(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                            placeholder: "请输入用户名"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "密码"),
                        h('input', {
                            type: "password",
                            value: newPassword,
                            onChange: (e) => setNewPassword(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                            placeholder: "请输入密码"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "角色"),
                        h('select', {
                            value: newRole,
                            onChange: (e) => setNewRole(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        },
                            h('option', { value: "user" }, "普通用户"),
                            h('option', { value: "admin" }, "超级管理员")
                        )
                    )
                ),
                h('div', { className: "flex gap-3 mt-6" },
                    h('button', {
                        onClick: handleCreate,
                        className: "flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    }, "创建"),
                    h('button', {
                        onClick: () => {
                            setShowCreateModal(false);
                            setError('');
                            setNewUsername('');
                            setNewPassword('');
                        },
                        className: "flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    }, "取消")
                )
            )
        ),
        // 编辑用户弹窗
        showEditModal && editingUser && h('div', { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
            h('div', { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" },
                h('h3', { className: "text-xl font-bold text-gray-800 mb-4" }, "编辑用户"),
                h('div', { className: "space-y-4" },
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "用户名"),
                        h('input', {
                            type: "text",
                            value: editUsername,
                            onChange: (e) => setEditUsername(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "新密码（留空则不修改）"),
                        h('input', {
                            type: "password",
                            value: editPassword,
                            onChange: (e) => setEditPassword(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                            placeholder: "留空则不修改密码"
                        })
                    ),
                    h('div', null,
                        h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "角色"),
                        h('select', {
                            value: editRole,
                            onChange: (e) => setEditRole(e.target.value),
                            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        },
                            h('option', { value: "user" }, "普通用户"),
                            h('option', { value: "admin" }, "超级管理员")
                        )
                    )
                ),
                h('div', { className: "flex gap-3 mt-6" },
                    h('button', {
                        onClick: handleUpdate,
                        className: "flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    }, "保存"),
                    h('button', {
                        onClick: () => {
                            setShowEditModal(false);
                            setEditingUser(null);
                            setError('');
                        },
                        className: "flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    }, "取消")
                )
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.UserManagement = UserManagement;
}
