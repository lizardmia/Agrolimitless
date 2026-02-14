/**
 * Login 组件 - 登录页面（CDN 版本）
 */
function Login({ onLoginSuccess }) {
    const { useState } = React;
    const h = React.createElement;
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { login } = window.auth || {};
        if (!login) {
            setError('认证模块未加载');
            setLoading(false);
            return;
        }

        const result = login(username, password);
        
        if (result.success) {
            onLoginSuccess();
        } else {
            setError(result.error || '登录失败');
        }
        
        setLoading(false);
    };

    return h('div', { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" },
        h('div', { className: "bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" },
            h('div', { className: "text-center mb-8" },
                h('div', { className: "inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4" },
                    h('svg', { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                        h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" })
                    )
                ),
                h('h1', { className: "text-2xl font-bold text-gray-800 mb-2" }, "登录"),
                h('p', { className: "text-gray-500 text-sm" }, "Agrolimitless & Transglobe 定价看板")
            ),
            h('form', { onSubmit: handleSubmit, className: "space-y-6" },
                error && h('div', { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" }, error),
                h('div', null,
                    h('label', { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-2" }, "用户名"),
                    h('input', {
                        id: "username",
                        type: "text",
                        value: username,
                        onChange: (e) => setUsername(e.target.value),
                        required: true,
                        className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                        placeholder: "请输入用户名",
                        disabled: loading
                    })
                ),
                h('div', null,
                    h('label', { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-2" }, "密码"),
                    h('input', {
                        id: "password",
                        type: "password",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                        placeholder: "请输入密码",
                        disabled: loading
                    })
                ),
                h('button', {
                    type: "submit",
                    disabled: loading,
                    className: "w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                }, loading ? '登录中...' : '登录')
            )
        )
    );
}

// 导出到全局（兼容 CDN 模式）
if (typeof window !== 'undefined') {
    window.Login = Login;
}
