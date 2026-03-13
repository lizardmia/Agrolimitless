/**
 * 农场记录 API
 * GET /api/farm-records - 获取所有农场记录
 * GET /api/farm-records?farmName=xxx - 根据农场名称查询
 * POST /api/farm-records - 保存农场记录
 * DELETE /api/farm-records/:id - 删除农场记录
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // GET 请求：获取记录
    if (req.method === 'GET') {
      const { farmName } = req.query;

      let query = supabase.from('farm_records').select('*').order('created_at', { ascending: false });

      // 如果指定了 farmName，查询特定农场
      if (farmName) {
        query = query.eq('farm_name', farmName as string);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get farm records error:', error);
        return res.status(500).json({ error: '获取农场记录失败', details: error.message });
      }

      return res.status(200).json(data || []);
    }

    // POST 请求：保存记录
    if (req.method === 'POST') {
      const {
        farmName,
        category,
        subType,
        productName,
        russianArrivalPriceRub,
        russianArrivalPriceCny,
        grossProfitCny
      } = req.body;

      // 验证必填字段
      if (!farmName || !category || !subType || !productName) {
        return res.status(400).json({ error: 'farmName, category, subType, productName 是必填字段' });
      }

      // 准备数据
      const recordData: any = {
        farm_name: farmName,
        category,
        sub_type: subType,
        product_name: productName,
        russian_arrival_price_rub: russianArrivalPriceRub ?? null,
        russian_arrival_price_cny: russianArrivalPriceCny ?? null,
        gross_profit_cny: grossProfitCny ?? null
      };

      const { data, error } = await supabase
        .from('farm_records')
        .insert(recordData)
        .select()
        .single();

      if (error) {
        console.error('Save farm record error:', error);
        return res.status(500).json({ error: '保存农场记录失败', details: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    // DELETE 请求：删除记录
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id 是必填字段' });
      }

      const { error } = await supabase
        .from('farm_records')
        .delete()
        .eq('id', id as string);

      if (error) {
        console.error('Delete farm record error:', error);
        return res.status(500).json({ error: '删除农场记录失败', details: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Farm records API error:', error);
    return res.status(500).json({ error: '服务器错误', details: error.message });
  }
}
