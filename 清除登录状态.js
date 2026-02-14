// 清除登录状态的脚本
// 在浏览器控制台（Console）中运行此脚本

// 方法一：只清除登录状态
localStorage.removeItem('currentUser');
console.log('✅ 已清除登录状态');
location.reload();

// 方法二：清除所有 localStorage（如果需要）
// localStorage.clear();
// console.log('✅ 已清除所有 localStorage');
// location.reload();
