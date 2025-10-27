# 🚀 Supabase 设置指南

## 步骤1：创建Supabase账户

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用GitHub账户登录（推荐）

## 步骤2：创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: drk-website
   - **Database Password**: （设置一个强密码，记住它！）
   - **Region**: 选择最近的位置
3. 点击 "Create new project"
4. 等待项目创建（约1分钟）

## 步骤3：获取API密钥

项目创建后：

1. 点击左侧 "Settings" (齿轮图标)
2. 点击 "API"
3. 找到以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤4：创建数据库表

1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴以下SQL：

```sql
-- 创建用户表
CREATE TABLE users (
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

-- 创建事件表
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建任务表
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  tags TEXT,
  due_date TIMESTAMP,
  reminder_date TIMESTAMP,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建笔记表
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT,
  category TEXT DEFAULT 'general',
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建文件表
CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建通知表
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. 点击 "Run" 执行SQL
5. 确认所有表已创建成功

## 步骤5：在Vercel添加环境变量

1. 访问 https://vercel.com
2. 打开您的项目 `drk_website`
3. 点击 "Settings"
4. 点击 "Environment Variables"
5. 添加以下变量：

```
Name: SUPABASE_URL
Value: (您的Project URL)

Name: SUPABASE_KEY  
Value: (您的anon public key)
```

6. 点击 "Save"

## 步骤6：重新部署

在Vercel中：
1. 进入 "Deployments"
2. 点击最新部署的 "..." 菜单
3. 选择 "Redeploy"
4. 等待部署完成

## ✅ 完成

部署完成后，您的网站就可以：
- ✅ 注册和登录
- ✅ 保存所有数据
- ✅ 使用所有功能
- ✅ 数据持久化

---

**下一步**：修改代码连接Supabase

