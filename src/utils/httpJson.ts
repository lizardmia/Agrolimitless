/**
 * 安全读取 fetch Response 的 JSON 正文（单次 .text()，避免空 body / 双次读取导致报错）。
 * 空正文或仅空白 → null；非合法 JSON → null。
 */
export async function readResponseJson<T = unknown>(response: Response): Promise<T | null> {
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return null;
    }
}

export function errorMessageFromBody(body: unknown, response: Response, fallback: string): string {
    if (body && typeof body === 'object' && 'error' in body) {
        const e = (body as { error?: unknown }).error;
        if (e !== undefined && e !== null && String(e).trim() !== '') return String(e);
    }
    return response.statusText?.trim() || `HTTP ${response.status}` || fallback;
}
