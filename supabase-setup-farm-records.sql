-- ==================== 农场记录表 ====================
-- 用于存储农场名称、产品信息、海外到站预估和毛利

-- 创建农场记录表
CREATE TABLE IF NOT EXISTS farm_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name VARCHAR(255) NOT NULL,  -- 农场名称
  category VARCHAR(255) NOT NULL,    -- 产品类别（如：谷物类）
  sub_type VARCHAR(255) NOT NULL,    -- 产品子类型（如：小麦）
  product_name VARCHAR(255) NOT NULL,  -- 产品名称（category + subType）
  russian_arrival_price_rub DECIMAL(15, 2),  -- 海外到站预估（RUB/t）
  russian_arrival_price_cny DECIMAL(15, 2),   -- 海外到站预估（CNY/t）
  gross_profit_cny DECIMAL(15, 2),           -- 毛利（不含息）（CNY/t）
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_farm_records_farm_name ON farm_records(farm_name);
CREATE INDEX IF NOT EXISTS idx_farm_records_product_name ON farm_records(product_name);
CREATE INDEX IF NOT EXISTS idx_farm_records_created_at ON farm_records(created_at DESC);

-- 创建触发器（自动更新 updated_at）
CREATE TRIGGER update_farm_records_updated_at 
    BEFORE UPDATE ON farm_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security (RLS)
ALTER TABLE farm_records ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取和写入（生产环境需要限制）
CREATE POLICY "Allow public read access" ON farm_records
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access" ON farm_records
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access" ON farm_records
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete access" ON farm_records
    FOR DELETE
    USING (true);

-- 查看表结构（验证是否创建成功）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'farm_records'
ORDER BY ordinal_position;
