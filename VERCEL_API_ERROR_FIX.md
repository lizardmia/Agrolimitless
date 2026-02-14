# Vercel API 错误修复指南

## 🔍 错误信息

```
A server error has occurred
FUNCTION_INVOCATION_FAILED
```

这个错误通常表示：
1. ❌ **环境变量未配置**（最常见）
2. ❌ Supabase 连接失败
3. ❌ 代码运行时错误
4. ❌ 依赖未安装

---

## ✅ 解决方案

### 第一步：检查环境变量（最重要）

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 选择项目：`Agrolimitless` 或你的项目名

2. **进入项目设置**
   - 点击项目名称
   - 点击 **"Settings"** 标签页
   - 点击左侧菜单的 **"Environment Variables"**

3. **检查是否配置了以下变量**：
   ```
   SUPABASE_URL = https://snoszkedymnkwsfknaly.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = 你的service_role_key
   ```

4. **如果没有配置**：
   - 点击 **"Add New"**
   - 添加 `SUPABASE_URL`
   - 添加 `SUPABASE_SERVICE_ROLE_KEY`
   - **重要**：选择所有环境（Production、Preview、Development）
   - 点击 **"Save"**

5. **重新部署**
   - 在 Vercel Dashboard 中
   - 点击 **"Deployments"** 标签页
   - 点击最新部署右侧的 **"..."** 菜单
   - 选择 **"Redeploy"**
   - 或推送新代码触发自动部署

---

### 第二步：查看 Vercel 日志

1. **在 Vercel Dashboard**
   - 点击 **"Deployments"** 标签页
   - 点击最新的部署
   - 点击 **"Functions"** 标签页
   - 点击 `api/users/init-admin` 函数
   - 查看 **"Logs"** 部分

2. **查找错误信息**：
   - 应该能看到具体的错误原因
   - 例如：`Missing Supabase environment variables`

---

### 第三步：验证环境变量

在 Vercel Dashboard 的 Function Logs 中，你应该能看到：

**如果环境变量缺失**：
```
Error: Missing Supabase environment variables
```

**如果 Supabase 连接失败**：
```
Error: Invalid API key
```

---

### 第四步：测试 API

配置环境变量并重新部署后，再次测试：

```bash
curl -X POST https://agrolimitless.vercel.app/api/users/init-admin \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

**成功响应**：
```json
{
  "success": true,
  "message": "默认管理员账号创建成功",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "admin",
    ...
  }
}
```

---

## 🔧 其他可能的问题

### 问题 1：Supabase 表未创建

**检查**：
1. 在 Supabase Dashboard > SQL Editor
2. 执行 `supabase-setup.sql`
3. 确认 `users` 表已创建

### 问题 2：Supabase 密钥错误

**检查**：
1. 在 Supabase Dashboard > Settings > API
2. 确认复制的是 `service_role key`（不是 `anon/public key`）
3. 确认密钥完整（没有截断）

### 问题 3：代码错误

**检查**：
1. 查看 Vercel Function Logs
2. 查找具体的错误堆栈
3. 检查代码语法

---

## 🎯 快速检查清单

- [ ] 在 Vercel 中配置了 `SUPABASE_URL`
- [ ] 在 Vercel 中配置了 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 环境变量选择了所有环境（Production、Preview、Development）
- [ ] 重新部署了应用
- [ ] 在 Supabase 中创建了 `users` 表
- [ ] Supabase 密钥是正确的 `service_role key`

---

## 🆘 如果还是失败

### 方法一：使用 Supabase Dashboard 直接创建（推荐）

既然 API 有问题，可以直接在 Supabase Dashboard 中创建管理员：

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目

2. **打开 SQL Editor**
   - 点击 **"SQL Editor"**
   - 点击 **"New query"**

3. **执行以下 SQL**：

```sql
-- 使用在线工具生成 bcrypt 哈希：https://bcrypt-generator.com/
-- 输入密码：admin123，选择 rounds：10
-- 复制生成的哈希值替换下面的值

INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- admin123 的哈希
    'admin'
)
ON CONFLICT (username) DO NOTHING;
```

4. **点击 "Run"** 执行

5. **验证**：
   - 在 Table Editor 中查看 `users` 表
   - 应该能看到 `username = 'admin'` 的记录

---

### 方法二：检查 Vercel 构建日志

1. **在 Vercel Dashboard**
   - 点击 **"Deployments"**
   - 点击最新部署
   - 查看 **"Build Logs"**

2. **查找错误**：
   - 检查是否有构建错误
   - 检查依赖是否正确安装

---

## 📝 总结

**最可能的原因**：环境变量未配置

**最快的解决方法**：
1. 在 Vercel Dashboard 配置环境变量
2. 重新部署
3. 或直接在 Supabase Dashboard 中创建管理员（更简单）

---

## ✅ 推荐流程

1. ✅ **先在 Supabase Dashboard 中创建管理员**（最简单，不依赖 API）
2. ✅ **然后配置 Vercel 环境变量**（用于后续 API 功能）
3. ✅ **测试登录功能**

这样即使 API 有问题，也能先使用应用！
