# 定价看板 - 实时调试指南

> ⚡ **5分钟快速上手**: 查看 [快速开始.md](./快速开始.md)  
> 📖 **详细使用说明**: 查看 [使用说明.md](./使用说明.md) 了解完整的功能介绍、操作指南和计算逻辑说明  
> 🖥️ **Cursor 分屏调试**: 查看 [Cursor调试指南.md](./Cursor调试指南.md) 了解如何在 Cursor 中进行分屏和屏内调试  
> 🚀 **Vite 构建版本**: 查看 [README_VITE.md](./README_VITE.md) 了解使用 Vite 和 npm 的现代化开发流程  
> 📦 **安装指南**: 查看 [INSTALL.md](./INSTALL.md) 了解如何安装依赖和启动项目

## 🚀 快速开始

### 方法一：使用 Python 开发服务器（推荐）

```bash
# 启动开发服务器
python3 dev-server.py

# 或者使用简单的 HTTP 服务器
python3 -m http.server 8000
```

然后在浏览器中访问：`http://localhost:8000/pricing-dashboard.html`

### 方法二：使用 Shell 脚本

```bash
./dev-server.sh
```

### 方法三：直接打开文件

直接在浏览器中打开 `pricing-dashboard.html` 文件（功能完整，但某些浏览器可能限制本地文件访问）

## 🔧 实时调试

1. **启动开发服务器**（使用上面的任一方法）

2. **打开浏览器开发者工具**
   - Chrome/Edge: 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Safari: 按 `Cmd+Option+I` (需要先在偏好设置中启用开发者菜单)

3. **修改代码**
   - 在 Cursor 中编辑 `pricing-dashboard.html`
   - 保存文件 (`Cmd+S` / `Ctrl+S`)

4. **查看更改**
   - 刷新浏览器 (`Cmd+R` / `Ctrl+R` 或 `F5`)
   - 或者使用硬刷新 (`Cmd+Shift+R` / `Ctrl+Shift+R`) 清除缓存

## 🐛 调试技巧

### 查看控制台日志

打开浏览器开发者工具的 Console 标签页，可以看到：
- 保存政策时的日志输出
- JavaScript 错误信息
- React 组件的警告

### 检查元素

使用 Elements/Inspector 标签页：
- 查看 DOM 结构
- 检查 CSS 样式
- 实时修改样式进行测试

### 网络请求

在 Network 标签页中可以看到：
- CDN 资源加载情况（React, Tailwind CSS 等）
- 加载时间

### React DevTools（可选）

如果想使用 React DevTools 进行更深入的调试：

1. 安装 React DevTools 浏览器扩展
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools
   - Firefox: https://addons.mozilla.org/firefox/addon/react-devtools/

2. 打开开发者工具，会看到 "Components" 和 "Profiler" 标签页

## 📝 常见问题

### Q: 修改后刷新页面没有变化？
A: 尝试硬刷新 (`Cmd+Shift+R` / `Ctrl+Shift+R`)，或者清除浏览器缓存

### Q: 控制台有错误？
A: 检查：
- 网络连接是否正常（需要加载 CDN 资源）
- 浏览器控制台的错误信息
- 代码语法是否正确

### Q: 样式没有生效？
A: 检查：
- Tailwind CSS CDN 是否正常加载
- 浏览器开发者工具中查看样式是否被应用
- 是否有 CSS 冲突

## 🎯 开发工作流建议

1. **保持开发服务器运行**
   - 在终端中运行 `python3 dev-server.py`
   - 保持终端窗口打开

2. **使用双屏或分屏**
   - 一边是 Cursor 编辑器
   - 另一边是浏览器

3. **使用浏览器自动刷新扩展**（可选）
   - Chrome: Live Server, Auto Refresh Plus
   - Firefox: Auto Reload

4. **使用 Cursor 的预览功能**
   - Cursor 可能支持 HTML 预览
   - 或者使用内置的浏览器预览

## 📦 文件说明

### 核心文件
- `index.html` - 主 HTML 文件（新版本，模块化结构）✨
- `pricing-dashboard.html` - 原始单文件版本（保留作为备份）

### 源代码
- `src/index.js` - 应用入口文件
- `src/components/Icon.js` - 图标组件
- `src/components/App.js` - 主应用组件
- `src/styles/main.css` - 样式文件

### 配置文件
- `package.json` - 项目配置
- `.gitignore` - Git 忽略文件

### 开发服务器
- `dev-server.py` - Python 开发服务器（推荐）
- `dev-server.sh` - Shell 脚本开发服务器

### 文档
- `README.md` - 开发调试指南（本文件）
- `PROJECT_STRUCTURE.md` - 项目结构说明 📁
- `快速开始.md` - 5分钟快速上手指南 ⚡
- `使用说明.md` - 详细的功能使用说明文档
- `计算规则文档.md` - 详细的输入输出定义和计算公式
- `Cursor调试指南.md` - Cursor IDE 分屏与屏内调试指南

## 💡 提示

- 修改代码后记得保存文件
- 使用浏览器的开发者工具进行调试
- 查看控制台日志了解应用运行状态
- 保存政策时会输出日志到控制台
