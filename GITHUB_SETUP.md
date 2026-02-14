# GitHub 代码提交指南

## 📋 步骤概览

1. ✅ 初始化 Git 仓库
2. ✅ 添加文件到暂存区
3. ✅ 创建初始提交
4. 🔄 在 GitHub 上创建仓库
5. 🔄 添加远程仓库并推送

---

## ✅ 已完成的步骤

### 1. 初始化 Git 仓库

```bash
git init
```

### 2. 添加文件到暂存区

```bash
git add .
```

### 3. 创建初始提交

```bash
git commit -m "Initial commit: 定价看板应用"
```

---

## 🔄 接下来需要做的步骤

### 4. 在 GitHub 上创建仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 **"+"** 按钮，选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `pricing-dashboard`（或你喜欢的名字）
   - **Description**: `Agrolimitless & Transglobe 定价看板应用`
   - **Visibility**: 选择 Public（公开）或 Private（私有）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"（我们已经有了代码）
4. 点击 **"Create repository"**

### 5. 添加远程仓库并推送

创建仓库后，GitHub 会显示命令。使用以下命令：

```bash
# 添加远程仓库（将 YOUR_USERNAME 和 REPO_NAME 替换为你的实际值）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 或者使用 SSH（如果你配置了 SSH 密钥）
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

---

## 📝 完整命令序列

```bash
# 1. 初始化仓库（已完成）
git init

# 2. 添加文件（已完成）
git add .

# 3. 创建提交（需要执行）
git commit -m "Initial commit: 定价看板应用"

# 4. 在 GitHub 上创建仓库（手动操作）

# 5. 添加远程仓库（需要执行，替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 6. 推送代码（需要执行）
git branch -M main
git push -u origin main
```

---

## 🔐 身份配置（如果还没有配置）

如果是第一次使用 Git，需要先配置身份：

```bash
# 配置用户名
git config --global user.name "你的名字"

# 配置邮箱
git config --global user.email "your.email@example.com"
```

---

## 🔑 GitHub 认证

### 方式一：使用 Personal Access Token（推荐）

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token"
3. 选择权限：至少勾选 `repo`
4. 生成后复制 token
5. 推送时使用 token 作为密码

### 方式二：使用 SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 复制公钥内容
cat ~/.ssh/id_ed25519.pub

# 在 GitHub Settings → SSH and GPG keys 中添加公钥
```

---

## 📦 项目文件说明

### 会被提交的文件
- ✅ 源代码文件（`src/`）
- ✅ 配置文件（`package.json`, `tsconfig.json`, `vite.config.ts`）
- ✅ HTML 入口文件
- ✅ 文档文件（`.md`）
- ✅ `.gitignore`

### 不会被提交的文件（已在 .gitignore 中）
- ❌ `node_modules/`（依赖包）
- ❌ `dist/`（构建输出）
- ❌ `.env`（环境变量）
- ❌ IDE 配置文件
- ❌ 临时文件

---

## 🚀 后续提交

以后修改代码后，使用以下命令提交：

```bash
# 查看修改的文件
git status

# 添加修改的文件
git add .

# 或者添加特定文件
git add src/components/App.tsx

# 创建提交
git commit -m "描述你的修改"

# 推送到 GitHub
git push
```

---

## 📚 有用的 Git 命令

```bash
# 查看提交历史
git log

# 查看文件差异
git diff

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main
```

---

## ⚠️ 注意事项

1. **不要提交敏感信息**：确保 `.env` 文件在 `.gitignore` 中
2. **不要提交大文件**：避免提交 `node_modules/` 等大文件夹
3. **提交信息要清晰**：使用有意义的提交信息
4. **定期推送**：避免本地代码丢失

---

## 🆘 常见问题

### Q: 推送时提示需要认证？
A: 使用 Personal Access Token 或配置 SSH 密钥

### Q: 如何撤销最后一次提交？
A: `git reset --soft HEAD~1`（保留修改）或 `git reset --hard HEAD~1`（丢弃修改）

### Q: 如何查看远程仓库地址？
A: `git remote -v`

### Q: 如何更改远程仓库地址？
A: `git remote set-url origin NEW_URL`

---

**最后更新**: 2026年2月14日
