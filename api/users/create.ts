/**
 * 创建用户 API
 * POST /api/users/create
 * 仅管理员可以创建用户
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase.js';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, role = 'user' } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: '角色必须是 admin 或 user' });
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 加密密码
    const password_hash = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash,
        role
      })
      .select('id, username, role, created_at, updated_at')
      .single();

    if (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ error: '创建用户失败' });
    }

    return res.status(201).json({ success: true, user });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
