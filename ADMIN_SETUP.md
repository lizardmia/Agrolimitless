# 创建默认管理员账号指南

## ⚠️ 重要：必须创建管理员账号

如果不创建默认管理员账号，**会有问题**：
- ❌ 无法登录应用（没有账号）
- ❌ 无法使用任何功能
- ❌ 无法创建其他用户

---

## 🎯 方法一：通过 Supabase Dashboard（最简单，推荐）

### 步骤：

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目：`lizardmia's Project`

2. **打开 SQL Editor**
   - 点击左侧菜单的 **"SQL Editor"**
   - 点击 **"New query"**

3. **执行以下 SQL**（创建管理员并设置密码为 `admin123`）：

```sql
-- 检查是否已存在 admin 用户
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE username = 'admin') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- 插入默认管理员（密码：admin123）
        -- 注意：这里使用 bcrypt 哈希值，对应密码 "admin123"
        INSERT INTO users (username, password_hash, role)
        VALUES (
            'admin',
            '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
            'admin'
        );
        
        RAISE NOTICE '默认管理员账号创建成功：用户名 admin，密码 admin123';
    ELSE
        RAISE NOTICE '管理员账号已存在';
    END IF;
END $$;
```

**注意**：上面的哈希值是示例，实际需要使用正确的 bcrypt 哈希。

### 更简单的方法：使用在线工具生成哈希

1. **访问在线 bcrypt 生成器**
   - https://bcrypt-generator.com/
   - 或 https://www.bcrypt.fr/

2. **生成哈希**
   - 输入密码：`admin123`
   - 选择 rounds：`10`
   - 复制生成的哈希值

3. **在 Supabase SQL Editor 中执行**：

```sql
INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '你复制的哈希值',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
```

---

## 🎯 方法二：通过 API（需要先部署到 Vercel）

### 第一步：获取 Vercel 域名

#### 方式 A：从 Vercel Dashboard 查看

1. **登录 Vercel**
   - 访问：https://vercel.com/dashboard

2. **选择你的项目**
   - 点击项目名称

3. **查看域名**
   - 在项目页面顶部会显示域名
   - 格式通常是：`项目名.vercel.app`
   - 例如：`agrolimitless.vercel.app` 或 `pricing-dashboard-xxx.vercel.app`

#### 方式 B：从部署日志查看

1. **在 Vercel Dashboard**
2. **点击 "Deployments" 标签页**
3. **点击最新的部署**
4. **查看 "Domains" 部分**

#### 方式 C：从终端查看（如果使用 Vercel CLI）

```bash
vercel ls
# 会显示所有项目的域名
```

---

### 第二步：调用初始化 API

**替换命令中的域名**：

```bash
curl -X POST https://你的域名.vercel.app/api/users/init-admin \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

**实际示例**（如果你的域名是 `agrolimitless.vercel.app`）：

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
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 🎯 方法三：直接在 Supabase Table Editor 中插入

1. **打开 Supabase Dashboard**
   - 点击 **"Table Editor"** → **"users"** 表

2. **点击 "Insert"** → **"Insert row"**

3. **填写字段**：
   - `username`: `admin`
   - `password_hash`: （需要先通过在线工具生成 bcrypt 哈希）
   - `role`: `admin`

4. **点击 "Save"**

**注意**：`password_hash` 需要是 bcrypt 哈希值，不能直接填密码。

---

## 🔧 推荐流程

### 开发阶段（本地）

1. ✅ 执行 `supabase-setup.sql` 创建表结构
2. ✅ 使用**方法一**（SQL Editor）创建管理员账号
3. ✅ 本地测试登录功能

### 生产环境（Vercel）

1. ✅ 部署代码到 Vercel
2. ✅ 配置环境变量
3. ✅ 使用**方法二**（API）创建管理员账号
4. ✅ 测试登录功能

---

## ✅ 验证管理员账号

创建后，可以通过以下方式验证：

1. **在 Supabase Table Editor 中查看**
   - 应该能看到 `username = 'admin'` 的记录

2. **尝试登录**
   - 用户名：`admin`
   - 密码：`admin123`
   - 应该能成功登录

---

## 🆘 常见问题

### Q: 如果忘记密码怎么办？

A: 可以通过以下方式重置：
1. 在 Supabase Table Editor 中直接修改 `password_hash`
2. 或删除 admin 用户，重新创建

### Q: 可以创建多个管理员吗？

A: 可以！只需要创建多个 `role = 'admin'` 的用户即可。

### Q: 密码哈希在哪里生成？

A: 使用在线工具：
- https://bcrypt-generator.com/
- https://www.bcrypt.fr/

### Q: 如何修改管理员密码？

A: 
1. 登录应用后，通过用户管理页面修改
2. 或在 Supabase Table Editor 中直接修改 `password_hash`

---

## 📝 总结

**最简单的方法**：
1. 在 Supabase SQL Editor 中执行 SQL 插入管理员
2. 使用在线工具生成 bcrypt 哈希
3. 复制哈希值到 SQL 中

**最安全的方法**：
1. 部署到 Vercel
2. 调用初始化 API
3. 密码自动加密
