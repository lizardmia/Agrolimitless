/**
 * 初始化默认管理员账号
 * 仅在首次部署时运行一次
 * 
 * 使用方法：
 * 1. 在 Supabase Dashboard > SQL Editor 中执行 supabase-setup.sql
 * 2. 然后调用此 API 创建默认管理员
 * 
 * POST /api/users/init-admin
 * Body: { "password": "admin123" }
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password = 'admin123' } = req.body;

    // 检查是否已存在 admin 用户
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      return res.status(400).json({ error: '管理员账号已存在' });
    }

    // 加密密码
    const password_hash = await bcrypt.hash(password, 10);

    // 创建管理员账号
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        password_hash,
        role: 'admin'
      })
      .select('id, username, role, created_at, updated_at')
      .single();

    if (error) {
      console.error('Init admin error:', error);
      return res.status(500).json({ error: '创建管理员账号失败' });
    }

    return res.status(201).json({ 
      success: true, 
      message: '默认管理员账号创建成功',
      user 
    });
  } catch (error: any) {
    console.error('Init admin error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
