/**
 * SKU 关税政策 API
 * GET /api/sku-policies?category=xxx&subType=xxx - 获取指定SKU的政策
 * GET /api/sku-policies - 获取所有SKU的政策
 * POST /api/sku-policies - 保存或更新SKU的政策
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // GET 请求：获取政策
    if (req.method === 'GET') {
      const { category, subType } = req.query;

      let query = supabase.from('sku_policies').select('*');

      // 如果指定了 category 和 subType，查询特定SKU
      if (category && subType) {
        const { data, error } = await query
          .eq('category', category)
          .eq('sub_type', subType)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
          console.error('Get SKU policy error:', error);
          return res.status(500).json({ error: '获取SKU政策失败', details: error.message });
        }

        return res.status(200).json(data || null);
      }

      // 否则获取所有政策
      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        console.error('Get all SKU policies error:', error);
        return res.status(500).json({ error: '获取所有SKU政策失败', details: error.message });
      }

      return res.status(200).json(data || []);
    }

    // POST 请求：保存或更新政策
    if (req.method === 'POST') {
      const {
        category,
        subType,
        // 入口关税政策
        importDutyRate,
        importVatRate,
        importPolicyName,
        // 出口关税政策
        exportPolicyMode,
        exportDutyRate,
        exportVatRate,
        exportPlanType
      } = req.body;

      // 验证必填字段
      if (!category || !subType) {
        return res.status(400).json({ error: 'category 和 subType 是必填字段' });
      }

      // 准备数据
      const policyData: any = {
        category,
        sub_type: subType,
        import_duty_rate: importDutyRate ?? 0,
        import_vat_rate: importVatRate ?? 0,
        import_policy_name: importPolicyName || null,
        export_policy_mode: exportPolicyMode || 'no-duty',
        export_duty_rate: exportDutyRate ?? 0,
        export_vat_rate: exportVatRate ?? 0,
        export_plan_type: exportPlanType || 'planned'
      };

      // 使用 upsert（如果存在则更新，不存在则插入）
      const { data, error } = await supabase
        .from('sku_policies')
        .upsert(policyData, {
          onConflict: 'category,sub_type',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Save SKU policy error:', error);
        return res.status(500).json({ error: '保存SKU政策失败', details: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('SKU policies API error:', error);
    return res.status(500).json({ error: '服务器错误', details: error.message });
  }
}
