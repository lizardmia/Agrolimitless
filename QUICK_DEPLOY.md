# 🚀 快速部署指南（5分钟）

## 推荐方案：Vercel（最简单）

### 步骤 1：准备代码

确保代码已提交到 GitHub：

```bash
git add .
git commit -m "准备部署"
git push origin main
```

### 步骤 2：部署到 Vercel

1. **访问** [https://vercel.com](https://vercel.com)
2. **登录**：使用 GitHub 账号登录
3. **导入项目**：
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"
4. **配置**（通常自动检测）：
   - Framework Preset: **Vite** ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
5. **部署**：
   - 点击 "Deploy"
   - 等待 1-2 分钟
6. **完成**：
   - 获得地址：`https://your-project.vercel.app`
   - 自动配置 HTTPS ✅
   - 全球 CDN ✅

### 步骤 3：后续更新

每次推送代码到 GitHub，Vercel 会自动重新部署！

```bash
git add .
git commit -m "更新功能"
git push origin main
# Vercel 自动部署 ✨
```

---

## 备选方案：Netlify

### 步骤

1. 访问 [https://www.netlify.com](https://www.netlify.com)
2. 使用 GitHub 登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择仓库
5. 配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy site"
7. 完成！

---

## 本地测试构建

部署前先测试：

```bash
# 安装依赖
npm install

# 构建
npm run build

# 预览构建结果
npm run preview
```

如果预览正常，就可以部署了！

---

## 常见问题

**Q: 部署后页面空白？**
- 检查浏览器控制台错误
- 确认 `vite.config.ts` 中 `base` 配置正确

**Q: 资源文件 404？**
- 检查构建输出目录是否为 `dist`
- 确认资源路径使用相对路径

**Q: 如何自定义域名？**
- Vercel: Settings → Domains → Add Domain
- Netlify: Site settings → Domain management

---

## 📚 详细文档

查看 `DEPLOYMENT_GUIDE.md` 获取更多部署方案和详细说明。
