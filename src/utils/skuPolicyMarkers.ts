/**
 * 根据 sku_policies 接口行判断：是否在 UI 上显示「进口 / 出口」关税政策已保存标记。
 * 与单条 upsert 存储一致：用字段组合推断用户是否曾配置过对应侧（非纯默认占位）。
 */

export interface SkuPolicyMarkers {
    hasImport: boolean;
    hasExport: boolean;
}

/** 本地会话中记录的「曾点击保存」状态（与服务端合并展示） */
export interface SkuLocalSaveMarks {
    importSaved?: boolean;
    exportSaved?: boolean;
}

export function skuKey(category: string, subType: string): string {
    return `${category}::${subType}`;
}

/** 服务端推断 + 本地保存成功标记（OR 合并） */
export function mergeSkuMarkers(server: SkuPolicyMarkers, local?: SkuLocalSaveMarks | null): SkuPolicyMarkers {
    if (!local) return server;
    return {
        hasImport: server.hasImport || !!local.importSaved,
        hasExport: server.hasExport || !!local.exportSaved,
    };
}

function num(v: unknown): number {
    if (v === null || v === undefined || v === '') return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

/** 任意 API 返回的行；无记录时传 null/undefined */
export function markersFromSkuPolicyRow(row: unknown): SkuPolicyMarkers {
    if (!row || typeof row !== 'object') {
        return { hasImport: false, hasExport: false };
    }
    const p = row as Record<string, unknown>;

    const importDuty = num(p.import_duty_rate);
    const importName =
        p.import_policy_name != null && String(p.import_policy_name).trim() !== ''
            ? String(p.import_policy_name).trim()
            : '';
    const hasImport = importDuty > 0 || importName !== '';

    const mode = p.export_policy_mode != null ? String(p.export_policy_mode) : '';
    const exportDuty = num(p.export_duty_rate);
    const exportVat = num(p.export_vat_rate);
    const hasExport =
        mode === 'with-duty' ||
        mode === 'planned' ||
        exportDuty > 0 ||
        (Number.isFinite(exportVat) && exportVat !== 10);

    return { hasImport, hasExport };
}
