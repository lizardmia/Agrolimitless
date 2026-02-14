# Git Push 错误修复指南

## 🔍 错误信息

```
error: RPC failed; curl 16 Error in the HTTP2 framing layer
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

这是一个常见的 Git HTTP/2 协议问题。

---

## ✅ 解决方案

### 方案一：禁用 HTTP/2（推荐，最简单）

在项目目录执行：

```bash
git config http.version HTTP/1.1
```

然后重新 push：

```bash
git push
```

**全局设置**（所有 Git 仓库）：

```bash
git config --global http.version HTTP/1.1
```

---

### 方案二：增加缓冲区大小

```bash
git config http.postBuffer 524288000
```

然后重新 push：

```bash
git push
```

---

### 方案三：使用 SSH 代替 HTTPS

1. **检查是否已有 SSH 密钥**：

```bash
ls -al ~/.ssh
```

2. **如果没有，生成 SSH 密钥**：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

3. **添加 SSH 密钥到 GitHub**：

```bash
# 复制公钥
cat ~/.ssh/id_ed25519.pub
```

然后：
- 访问：https://github.com/settings/keys
- 点击 "New SSH key"
- 粘贴公钥内容

4. **修改远程仓库地址为 SSH**：

```bash
git remote set-url origin git@github.com:lizardmia/Agrolimitless.git
```

5. **重新 push**：

```bash
git push
```

---

### 方案四：分批推送（如果文件很大）

```bash
# 先推送少量提交
git push origin HEAD~5:main

# 然后推送剩余的
git push
```

---

### 方案五：检查网络连接

```bash
# 测试 GitHub 连接
curl -I https://github.com

# 如果连接有问题，可能需要：
# 1. 检查代理设置
# 2. 检查防火墙
# 3. 尝试使用 VPN
```

---

## 🎯 快速修复（推荐）

**执行以下命令**：

```bash
# 1. 禁用 HTTP/2
git config http.version HTTP/1.1

# 2. 增加缓冲区
git config http.postBuffer 524288000

# 3. 重新推送
git push
```

---

## 🔄 如果还是失败

### 检查 Git 配置

```bash
# 查看当前配置
git config --list | grep http

# 查看远程仓库
git remote -v
```

### 尝试强制推送（谨慎使用）

```bash
# 先备份
git branch backup-main

# 强制推送（会覆盖远程）
git push --force
```

**注意**：强制推送会覆盖远程仓库，确保没有其他人正在使用。

---

## 📋 常见原因

1. **网络不稳定**：HTTP/2 对网络要求更高
2. **文件太大**：超过 GitHub 的限制
3. **代理问题**：代理服务器不支持 HTTP/2
4. **GitHub 服务器问题**：临时故障

---

## ✅ 验证修复

修复后，应该能看到：

```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to 16 threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), X KiB | X MiB/s, done.
Total X (delta X), reused 0 (delta 0), pack-reused 0
To https://github.com/lizardmia/Agrolimitless.git
   xxxxx..xxxxx  main -> main
```

---

## 🆘 如果所有方法都失败

1. **检查 GitHub 状态**：
   - https://www.githubstatus.com/

2. **尝试稍后再试**：
   - 可能是 GitHub 临时故障

3. **联系 GitHub 支持**：
   - https://support.github.com/
