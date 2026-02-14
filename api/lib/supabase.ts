/**
 * Supabase 客户端配置
 * 用于 Vercel Serverless Functions
 */
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建 Supabase 客户端（使用 service_role key，可以绕过 RLS）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
