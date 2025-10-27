# 📝 如何获取Supabase的URL和Key - 详细步骤

## 🎯 目标：获取这两个值
```
SUPABASE_URL = ?
SUPABASE_KEY = ?
```

---

## 📍 步骤1：访问Supabase网站

1. 打开浏览器
2. 访问：**https://supabase.com**

## 📍 步骤2：登录账户

### 如果您有GitHub账户（推荐）：
1. 点击右上角 **"Start your project"** 或 **"Sign in"**
2. 点击 **"Continue with GitHub"**
3. 授权登录

### 如果您没有GitHub账户：
1. 点击 **"Sign up"**
2. 使用邮箱注册
3. 验证邮箱

## 📍 步骤3：创建新项目

1. 登录后，点击 **"New Project"** 按钮
2. 填写表单：

   **Organization**:
   - 如果有组织，选择它
   - 如果没有，会创建新的
   
   **Name**:
   - 输入：`drk-website`
   - 或任何您喜欢的名称
   
   **Database Password**:
   - ⚠️ **重要：设置一个强密码**
   - 建议：至少12位，包含大小写字母和数字
   - 例如：`MyDrkPass123!`
   - 📝 **把密码保存到安全的地方**
   
   **Region**:
   - 选择最近的位置
   - 推荐：
     - `Northeast Asia (Tokyo)` - 日本东京
     - `Southeast Asia (Singapore)` - 新加坡
     - `Southeast Asia (Mumbai)` - 印度
   
3. 点击 **"Create new project"** 绿色按钮
4. ⏳ **等待1-2分钟**让项目创建完成

## 📍 步骤4：执行SQL创建数据库表

### 4.1 打开SQL编辑器
1. 项目创建完成后，您会看到Dashboard
2. 点击左侧菜单中的 **"SQL Editor"**（文件图标 📄）
3. 点击右上角的 **"New query"** 按钮

### 4.2 粘贴SQL代码
1. 清空编辑器中的任何内容
2. **复制以下完整SQL代码**并粘贴：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 事件表
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  tags TEXT,
  due_date TIMESTAMP,
  reminder_date TIMESTAMP,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT,
  category TEXT DEFAULT 'general',
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 文件表
CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. 点击右下角的 **"RUN"** 按钮（或按 `Ctrl+Enter`）
4. ✅ 应该看到 "Success. No rows returned"

### 4.3 验证表已创建
1. 点击左侧菜单的 **"Table Editor"**（表格图标 📊）
2. 您应该看到以下表：
   - ✅ users
   - ✅ events
   - ✅ tasks
   - ✅ notes
   - ✅ files
   - ✅ notifications

## 📍 步骤5：获取Project URL和API Key

这是**最重要的步骤**！

### 5.1 打开API设置
1. 点击左侧菜单的 **"Settings"**（齿轮图标 ⚙️）
2. 在Settings页面，点击左侧的 **"API"**

### 5.2 找到并复制Project URL
1. 在"Project URL"部分
2. 您会看到类似这样的URL：
   ```
   https://abcdefgh.supabase.co
   ```
3. **全选并复制这个URL**
4. 📝 保存到一个安全的地方（记事本/文档）

### 5.3 找到并复制API Key
1. 向下滚动找到 "Project API keys" 部分
2. 找到 **"anon" "public"** 这一行（第一个key）
3. 您会看到类似这样的key：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM5NjAwMDAsImV4cCI6MjAwOTUzNjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. 点击key后面的 **"Copy"** 按钮或选择并复制
5. 📝 保存到一个安全的地方

## ✅ 您现在有了：

```
SUPABASE_URL = https://abcdefgh.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📍 步骤6：在Vercel配置

现在带着这两个值去Vercel：

1. 访问：https://vercel.com
2. 登录您的账户
3. 找到项目 `drk-website` 并点击
4. 点击 **"Settings"** 标签
5. 点击左侧 **"Environment Variables"**
6. 点击 **"Add"**
7. 添加第一个变量：
   - Key: `SUPABASE_URL`
   - Value: 您刚才复制的Project URL
   - 勾选所有环境（Production, Preview, Development）
   - 点击 **"Save"**
8. 再次点击 **"Add"**
9. 添加第二个变量：
   - Key: `SUPABASE_KEY`
   - Value: 您刚才复制的API Key
   - 勾选所有环境
   - 点击 **"Save"**

## 📍 步骤7：重新部署

1. 点击 **"Deployments"** 标签
2. 找到最新的部署
3. 点击右侧 **"..."**
4. 选择 **"Redeploy"**
5. ⏳ 等待1-2分钟

## ✅ 完成！

部署完成后，您的网站就可以：
- ✅ 注册新用户
- ✅ 登录账户
- ✅ 保存所有数据
- ✅ 持久化存储

---

## 📸 截图参考

如果您不确定界面在哪里：
- Project URL 通常在 Settings → API 页面的顶部
- API Key 在 "Project API keys" 部分，第一个 "anon public" key

---

**现在开始吧！** 预计总时间：10分钟 🚀

