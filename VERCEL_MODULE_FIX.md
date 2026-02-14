# Vercel 模块导入错误修复

## 🔍 错误信息

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/api/lib/supabase'
```

这是因为 Vercel Serverless Functions 在 ESM（ES Modules）模式下需要明确的文件扩展名。

---

## ✅ 已修复

我已经更新了所有 API 文件，在导入路径中添加了 `.js` 扩展名：

- ✅ `api/auth/login.ts` - 已修复
- ✅ `api/users/index.ts` - 已修复
- ✅ `api/users/create.ts` - 已修复
- ✅ `api/users/[id].ts` - 已修复
- ✅ `api/users/init-admin.ts` - 已修复

**修改前**：
```typescript
import { supabase } from '../lib/supabase';
```

**修改后**：
```typescript
import { supabase } from '../lib/supabase.js';
```

**注意**：即使源文件是 `.ts`，在导入时也要使用 `.js` 扩展名，因为 TypeScript 编译后会变成 `.js` 文件。

---

## 🚀 下一步

1. **提交代码**
   ```bash
   git add .
   git commit -m "Fix Vercel module import paths"
   git push
   ```

2. **等待 Vercel 自动部署**
   - Vercel 会自动检测到代码推送
   - 开始新的部署

3. **测试 API**
   ```bash
   curl -X POST https://agrolimitless.vercel.app/api/users/init-admin \
     -H "Content-Type: application/json" \
     -d '{"password": "admin123"}'
   ```

---

## 📝 技术说明

### 为什么需要 `.js` 扩展名？

Vercel Serverless Functions 使用 Node.js ESM（ES Modules）模式，它要求：
- 所有导入路径必须包含文件扩展名
- 即使源文件是 `.ts`，导入时也要使用 `.js`（因为编译后是 `.js`）

### 其他解决方案

如果不想使用 `.js` 扩展名，可以：

1. **使用 CommonJS**（不推荐）
   - 修改 `package.json` 中的 `"type": "module"` 为 `"type": "commonjs"`
   - 但这会影响整个项目

2. **配置 TypeScript**（复杂）
   - 修改 `tsconfig.json` 添加路径映射
   - 需要额外的构建配置

**推荐**：使用 `.js` 扩展名（最简单、最可靠）

---

## ✅ 验证修复

部署后，检查 Vercel Function Logs：

1. **登录 Vercel Dashboard**
2. **Deployments** → 最新部署
3. **Functions** → `api/users/init-admin`
4. **Logs** - 应该没有模块找不到的错误

---

## 🎯 如果还有问题

如果修复后仍有问题，检查：

1. **确保所有导入都使用了 `.js` 扩展名**
2. **确保 `api/lib/supabase.ts` 文件存在**
3. **检查 Vercel 构建日志**，确认文件被正确部署
