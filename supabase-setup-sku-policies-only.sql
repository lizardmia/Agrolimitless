-- ==================== SKU 关税政策表（仅新增部分）====================
-- 如果已经执行过用户表部分，只需要执行这个文件即可

-- 9. 创建 SKU 关税政策表
CREATE TABLE IF NOT EXISTS sku_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(255) NOT NULL,  -- 产品类别（如：谷物类）
  sub_type VARCHAR(255) NOT NULL,   -- 产品子类型（如：小麦）
  -- 入口关税政策
  import_duty_rate DECIMAL(10, 2) DEFAULT 0,  -- 入口关税税率
  import_vat_rate DECIMAL(10, 2) DEFAULT 0,   -- 入口增值税税率
  import_policy_name VARCHAR(255),              -- 入口政策名称
  -- 出口关税政策
  export_policy_mode VARCHAR(50) DEFAULT 'no-duty',  -- 出口政策模式：no-duty, with-duty, planned
  export_duty_rate DECIMAL(10, 2) DEFAULT 0,   -- 出口关税税率
  export_vat_rate DECIMAL(10, 2) DEFAULT 0,    -- 出口增值税税率
  export_plan_type VARCHAR(50) DEFAULT 'planned',  -- 计划类型：planned, unplanned
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 唯一约束：每个SKU只能有一条记录
  UNIQUE(category, sub_type)
);

-- 10. 创建索引
CREATE INDEX IF NOT EXISTS idx_sku_policies_category_subtype ON sku_policies(category, sub_type);
CREATE INDEX IF NOT EXISTS idx_sku_policies_updated_at ON sku_policies(updated_at);

-- 11. 创建触发器（自动更新 updated_at）
-- 注意：如果之前已经创建了 update_updated_at_column 函数，这一步会使用已有的函数
CREATE TRIGGER update_sku_policies_updated_at 
    BEFORE UPDATE ON sku_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. 启用 Row Level Security (RLS)
ALTER TABLE sku_policies ENABLE ROW LEVEL SECURITY;

-- 13. 创建策略：允许所有人读取和写入（生产环境需要限制）
CREATE POLICY "Allow public read access" ON sku_policies
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access" ON sku_policies
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access" ON sku_policies
    FOR UPDATE
    USING (true);

-- 查看表结构（验证是否创建成功）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sku_policies'
ORDER BY ordinal_position;
