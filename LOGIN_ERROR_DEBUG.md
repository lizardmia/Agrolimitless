# 登录 API 500 错误调试指南

## 🔍 错误信息

```
/api/auth/login:1  Failed to load resource: the server responded with a status of 500
```

这表明登录 API 返回了 500 服务器错误。

---

## ✅ 可能的原因和解决方案

### 原因 1：Vercel 环境变量未配置（最常见）

**症状**：
- API 返回 500 错误
- Vercel Function Logs 显示：`Missing Supabase environment variables`

**解决**：

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 选择项目

2. **配置环境变量**
   - Settings → Environment Variables
   - 添加：
     ```
     SUPABASE_URL = https://snoszkedymnkwsfknaly.supabase.co
     SUPABASE_SERVICE_ROLE_KEY = 你的service_role_key
     ```
   - 选择所有环境（Production、Preview、Development）
   - 保存

3. **重新部署**
   - Deployments → 最新部署 → Redeploy

---

### 原因 2：Supabase 数据库表未创建

**症状**：
- API 返回 500 错误
- Vercel Function Logs 显示：`relation "users" does not exist`

**解决**：

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目

2. **执行 SQL 脚本**
   - SQL Editor → New query
   - 复制 `supabase-setup.sql` 的内容
   - 执行

3. **验证表已创建**
   - Table Editor → 应该能看到 `users` 表

---

### 原因 3：Supabase 密钥错误

**症状**：
- API 返回 500 错误
- Vercel Function Logs 显示：`Invalid API key`

**解决**：

1. **检查 Supabase Dashboard**
   - Settings → API
   - 确认使用的是 `service_role key`（不是 `anon/public key`）
   - 确认密钥完整（没有截断）

2. **更新 Vercel 环境变量**
   - 使用正确的 `service_role key`
   - 重新部署

---

### 原因 4：本地开发环境问题

**症状**：
- 本地 `npm run dev` 时 API 调用失败
- 错误：`Failed to fetch` 或 `Network error`

**解决**：

1. **检查是否使用 API 模式**
   - 查看 `.env.local` 文件
   - 确认 `VITE_USE_API=true`

2. **检查 API 基础路径**
   - 本地开发时，API 路径应该是 `/api/...`
   - Vite 会自动代理到开发服务器

3. **如果本地不想使用 API**
   - 设置 `VITE_USE_API=false`
   - 或删除 `.env.local` 中的 `VITE_USE_API`
   - 会使用 localStorage 模式

---

## 🔧 调试步骤

### 第一步：查看 Vercel Function Logs

1. **登录 Vercel Dashboard**
2. **选择项目** → **Deployments**
3. **点击最新部署**
4. **点击 "Functions" 标签页**
5. **点击 `api/auth/login`**
6. **查看 "Logs" 部分**

应该能看到具体的错误信息，例如：
- `Missing Supabase environment variables`
- `relation "users" does not exist`
- `Invalid API key`

---

### 第二步：测试 API 端点

在终端执行：

```bash
curl -X POST https://agrolimitless.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

查看返回的错误信息。

---

### 第三步：检查浏览器控制台

1. **打开浏览器开发者工具**（F12）
2. **切换到 Network（网络）标签页**
3. **尝试登录**
4. **点击失败的请求**（`/api/auth/login`）
5. **查看 Response（响应）标签页**

应该能看到服务器返回的错误信息。

---

## 🎯 快速检查清单

- [ ] Vercel 环境变量已配置（`SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`）
- [ ] 环境变量选择了所有环境
- [ ] 已重新部署应用
- [ ] Supabase 数据库表已创建（执行了 `supabase-setup.sql`）
- [ ] Supabase 密钥是正确的 `service_role key`
- [ ] 管理员账号已创建（在 Supabase 中）

---

## 🆘 如果所有方法都失败

### 临时解决方案：使用 localStorage 模式

如果 API 一直有问题，可以临时使用 localStorage 模式：

1. **删除或注释 `.env.local` 中的 `VITE_USE_API`**
2. **重启开发服务器**
3. **应用会使用 localStorage 模式**
4. **可以在 Supabase Dashboard 中手动创建用户数据**

---

## 📝 已改进的错误处理

我已经更新了代码，现在会：
- ✅ 显示更详细的错误信息
- ✅ 在控制台输出调试日志
- ✅ 在 API 响应中包含错误详情

重新部署后，错误信息会更清晰。

---

## ✅ 推荐操作流程

1. **检查 Vercel Function Logs**（最重要）
   - 查看具体错误信息
   - 根据错误信息修复

2. **配置环境变量**（如果缺失）
   - 在 Vercel Dashboard 中配置
   - 重新部署

3. **创建数据库表**（如果未创建）
   - 在 Supabase Dashboard 中执行 SQL
   - 创建管理员账号

4. **测试登录**
   - 使用浏览器测试
   - 查看控制台错误信息
