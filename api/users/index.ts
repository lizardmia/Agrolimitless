/**
 * 获取用户列表 API
 * GET /api/users
 * 仅管理员可以访问
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取所有用户（排除密码字段）
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: '获取用户列表失败' });
    }

    return res.status(200).json(users || []);
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
