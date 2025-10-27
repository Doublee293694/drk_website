# 🔧 在Vercel配置Supabase - 快速指南

## 📋 前提条件

在执行以下步骤之前，您需要：

1. ✅ 已创建Supabase账户
2. ✅ 已创建Supabase项目
3. ✅ 已执行SQL创建表
4. ✅ 已获取Project URL和API Key

---

## 🚀 步骤1：登录Vercel

1. 访问：https://vercel.com
2. 登录您的账户

## 🚀 步骤2：进入项目设置

1. 在Dashboard中，找到项目 `drk-website`
2. 点击项目名称进入

## 🚀 步骤3：打开环境变量设置

1. 点击顶部的 **"Settings"** 标签
2. 在左侧菜单中，点击 **"Environment Variables"**

## 🚀 步骤4：添加第一个环境变量 - SUPABASE_URL

1. 点击 **"Add"** 按钮
2. 填写信息：
   - **Key**: `SUPABASE_URL`
   - **Value**: 您的Supabase Project URL
     - 格式类似：`https://xxxxx.supabase.co`
   - **Environments**: 勾选所有（Production, Preview, Development）
3. 点击 **"Save"**

## 🚀 步骤5：添加第二个环境变量 - SUPABASE_KEY

1. 再次点击 **"Add"** 按钮
2. 填写信息：
   - **Key**: `SUPABASE_KEY`
   - **Value**: 您的Supabase anon/public key
     - 格式类似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Environments**: 勾选所有（Production, Preview, Development）
3. 点击 **"Save"**

## 🚀 步骤6：验证环境变量

您应该看到两个环境变量：
```
✅ SUPABASE_URL    [Production, Preview, Development]
✅ SUPABASE_KEY    [Production, Preview, Development]
```

## 🚀 步骤7：重新部署

### 方法A：通过Git自动部署（推荐）

1. 如果您的代码已推送到GitHub
2. Vercel会自动检测到新的环境变量
3. 前往 "Deployments"
4. 应该会看到新的部署正在进行

### 方法B：手动重新部署

1. 在Vercel中，点击 **"Deployments"** 标签
2. 找到最新的部署
3. 点击右侧的 **"..."** (三个点)
4. 选择 **"Redeploy"**
5. 确认 **"Redeploy"**
6. ⏳ 等待1-2分钟

## ✅ 步骤8：验证部署

部署完成后：

1. 点击 "Visit" 按钮或访问您的URL
2. 打开网站
3. 点击 **"注册"**
4. 填写测试信息：
   - 用户名：`test`
   - 邮箱：`test@example.com`
   - 密码：`test123`
5. 点击 **"注册"**

### 如果成功 ✅
- 应该会成功创建账户并登录
- 说明Supabase配置正确！

### 如果失败 ❌
- 查看Vercel日志
- 检查环境变量是否正确
- 确认Supabase表已创建

---

## 🔍 如何查看Vercel日志

如果遇到错误：

1. 在Vercel中，点击 "Deployments"
2. 点击最新的部署
3. 查看 "Function Logs"
4. 查找错误信息

---

## 📝 环境变量格式示例

```
SUPABASE_URL=https://abcdefghijklmn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM5NjAwMDAsImV4cCI6MjAwOTUzNjAwMH0.xxxxxxx
```

⚠️ **注意**：
- 不要包含引号
- 确保复制完整的URL和Key
- Key通常是一串很长的字符

---

## ❓ 常见问题

### Q: 在哪里找到Supabase的URL和Key？

**A**: 在Supabase Dashboard:
1. 点击左侧 "Settings" (齿轮图标 ⚙️)
2. 点击 "API"
3. 找到 "Project URL" 和 "anon public" key

### Q: 环境变量添加后没有生效？

**A**: 
1. 确认已保存
2. 重新部署一次
3. 清除浏览器缓存

### Q: 如何确认环境变量已设置？

**A**: 
1. 在Vercel Settings → Environment Variables
2. 应该看到 SUPABASE_URL 和 SUPABASE_KEY
3. 两个都应该勾选所有环境

---

**现在就去Vercel配置吧！** 🚀

