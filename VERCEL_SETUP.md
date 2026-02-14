# Vercel 账户设置指南

## 🔐 问题：Social Account is not yet connected

当你看到 "Social Account is not yet connected to any Vercel user. Sign up?" 时，说明你的 GitHub 账号还没有关联到 Vercel 账户。

---

## ✅ 解决方案

### 方案一：创建新账户（推荐）

1. **点击 "Sign up"** 按钮
2. **选择注册方式**：
   - 使用 GitHub（会创建新 Vercel 账户并关联 GitHub）
   - 使用邮箱注册（后续可以关联 GitHub）

3. **如果选择 GitHub**：
   - 授权 GitHub 访问
   - Vercel 会自动创建账户并关联
   - 完成！

4. **如果选择邮箱**：
   - 输入邮箱和密码
   - 验证邮箱
   - 登录后可以关联 GitHub：
     - Settings → Connected Accounts → Connect GitHub

---

## 📝 详细步骤

### 步骤 1：访问 Vercel

访问 [https://vercel.com](https://vercel.com)

### 步骤 2：注册账户

**方式 A：使用 GitHub（最简单）**

1. 点击右上角 **"Sign Up"**
2. 选择 **"Continue with GitHub"**
3. 授权 GitHub 访问权限
4. 完成注册

**方式 B：使用邮箱**

1. 点击 **"Sign Up"**
2. 选择 **"Sign up with Email"**
3. 输入邮箱和密码
4. 验证邮箱（检查收件箱）
5. 完成注册

### 步骤 3：关联 GitHub（如果使用邮箱注册）

1. 登录 Vercel
2. 点击右上角头像 → **"Settings"**
3. 左侧菜单选择 **"Connected Accounts"**
4. 找到 **GitHub**，点击 **"Connect"**
5. 授权 GitHub 访问
6. 完成关联

---

## 🚀 注册后立即部署

### 快速部署流程

1. **登录 Vercel**
   - 使用刚创建的账户登录

2. **导入项目**
   - 点击 **"Add New Project"**（或 "Import Project"）
   - 如果已关联 GitHub，会显示你的仓库列表
   - 选择你的项目仓库

3. **配置项目**（通常自动检测）
   - Framework: Vite ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
   - Install Command: `npm install` ✅

4. **部署**
   - 点击 **"Deploy"**
   - 等待 1-2 分钟
   - 完成！

---

## 🔄 如果已经注册过

### 检查账户状态

1. **尝试登录**
   - 访问 [vercel.com/login](https://vercel.com/login)
   - 使用邮箱或 GitHub 登录

2. **找回账户**
   - 如果忘记密码：点击 "Forgot password"
   - 如果忘记邮箱：尝试使用 GitHub 登录

3. **关联 GitHub**
   - 登录后：Settings → Connected Accounts
   - 连接 GitHub 账号

---

## 🆘 常见问题

### Q: 为什么需要关联 GitHub？

**A:** Vercel 需要访问你的 GitHub 仓库来：
- 自动部署代码
- 监听代码更新
- 创建预览部署

### Q: 可以使用其他 Git 服务吗？

**A:** 可以！Vercel 支持：
- GitHub ✅
- GitLab ✅
- Bitbucket ✅

### Q: 不想关联 GitHub 怎么办？

**A:** 可以使用 Vercel CLI 手动部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### Q: 授权后没有看到仓库？

**A:** 检查：
1. GitHub 授权时是否勾选了仓库访问权限
2. 仓库是否为私有（需要授权私有仓库访问）
3. 刷新页面或重新连接 GitHub

---

## 📋 完整注册流程（图文说明）

### 1. 访问 Vercel

打开 [https://vercel.com](https://vercel.com)

### 2. 点击 Sign Up

页面右上角或中间的大按钮

### 3. 选择注册方式

- **GitHub**（推荐）：一键注册并关联
- **GitLab**：如果有 GitLab 账号
- **Bitbucket**：如果有 Bitbucket 账号
- **Email**：使用邮箱注册

### 4. 授权访问

如果选择 GitHub：
- 点击 "Authorize Vercel"
- 选择要授权的仓库（或全部）
- 完成授权

### 5. 完成注册

- 自动跳转到 Vercel 控制台
- 可以开始部署项目了！

---

## 🎯 推荐流程

**最快方式（2 分钟）：**

1. 访问 vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 GitHub
5. 完成！

**然后部署（3 分钟）：**

1. 点击 "Add New Project"
2. 选择仓库
3. 点击 "Deploy"
4. 完成！

**总计：5 分钟** ⚡

---

## 🔐 安全提示

- ✅ Vercel 是可信的平台（被 Next.js 官方推荐）
- ✅ 授权时可以选择只授权特定仓库
- ✅ 可以随时在 GitHub Settings 中撤销授权
- ✅ Vercel 不会修改你的代码，只读取和部署

---

## 📚 相关链接

- [Vercel 官网](https://vercel.com)
- [Vercel 文档](https://vercel.com/docs)
- [GitHub 授权管理](https://github.com/settings/applications)

---

**提示**：如果遇到任何问题，可以：
1. 查看 Vercel 的帮助文档
2. 联系 Vercel 支持
3. 尝试使用邮箱注册后再关联 GitHub
