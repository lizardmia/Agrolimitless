/**
 * 登录 API
 * POST /api/auth/login
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
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
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;
    return res.status(200).json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
