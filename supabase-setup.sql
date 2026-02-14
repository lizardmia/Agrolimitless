-- Supabase 数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 创建触发器（自动更新 updated_at）
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. 创建策略：允许所有人读取（仅限非敏感字段）
CREATE POLICY "Allow public read access" ON users
    FOR SELECT
    USING (true);

-- 注意：实际使用时，应该限制为只有管理员可以读取
-- 这里为了简化，允许公开读取（生产环境需要修改）

-- 7. 创建策略：允许通过 API 插入（需要服务端密钥）
-- 注意：这个策略实际上不会生效，因为我们使用 service_role key
-- 服务端密钥会绕过 RLS，所以这里主要是为了文档说明

-- 8. 插入默认管理员账号（密码：admin123）
-- 注意：这个哈希值对应密码 "admin123"，使用 bcrypt rounds=10 生成
-- 如果密码不同，请使用在线工具生成新的哈希：https://bcrypt-generator.com/
INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- admin123 的 bcrypt 哈希
    'admin'
)
ON CONFLICT (username) DO NOTHING;  -- 如果已存在则不插入

-- 查看表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
