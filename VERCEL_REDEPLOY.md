# 🚀 重新部署指南

## 步骤1：打开Deployments
1. 在Vercel中，找到项目 `drk-website`
2. 点击顶部的 **"Deployments"** 标签

## 步骤2：触发重新部署

### 方法A：Redeploy最新部署（最简单）
1. 找到列表中最新的部署（通常在最上面）
2. 点击右侧的 **"..."** (三个点图标)
3. 选择 **"Redeploy"**
4. 在弹出的确认框中，选择 **"Redeploy"**
5. ⏳ 等待部署完成（约1-2分钟）

### 方法B：通过Git触发（如果已连接GitHub）
如果您想通过Git触发：
1. 在终端运行：
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```
2. Vercel会自动检测并部署

## ✅ 部署完成标志
- 状态变为 **"Ready"** (绿色)
- URL变为可点击
- 显示 "Visit" 按钮

## 📋 部署完成后
访问您的网站测试功能！

