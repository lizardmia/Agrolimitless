/**
 * 用户更新和删除 API
 * PUT /api/users/[id] - 更新用户
 * DELETE /api/users/[id] - 删除用户
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '用户 ID 无效' });
  }

  try {
    if (req.method === 'PUT') {
      // 更新用户
      const { username, password, role } = req.body;
      const updates: any = {};

      // 检查用户名是否与其他用户冲突
      if (username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', id)
          .single();

        if (existingUser) {
          return res.status(400).json({ error: '用户名已存在' });
        }
        updates.username = username;
      }

      // 更新密码
      if (password) {
        updates.password_hash = await bcrypt.hash(password, 10);
      }

      // 更新角色
      if (role && (role === 'admin' || role === 'user')) {
        updates.role = role;
      }

      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select('id, username, role, created_at, updated_at')
        .single();

      if (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ error: '更新用户失败' });
      }

      return res.status(200).json({ success: true, user });
    } else if (req.method === 'DELETE') {
      // 删除用户
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ error: '删除用户失败' });
      }

      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('User operation error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
