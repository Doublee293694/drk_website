# 🚀 立即设置Supabase - 完整指南

## ⚡ 现在跟着这些步骤操作！

### 步骤1：创建Supabase账户（2分钟）

1. 访问：https://supabase.com
2. 点击右上角 "Start your project" 或 "Sign in with GitHub"
3. 使用GitHub账户登录（最简单）

### 步骤2：创建项目（2分钟）

1. 登录后，点击 "New Project"
2. 填写信息：
   - **Organization**: 选择您的组织或创建新的
   - **Name**: `drk-website`
   - **Database Password**: ⚠️ **重要！记住这个密码**
     - 建议使用强密码
     - 保存到一个安全的地方
   - **Region**: 选择最近的位置
     - 推荐：`Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
3. 点击 "Create new project"
4. ⏳ 等待创建完成（约60秒）

### 步骤3：执行SQL创建表（3分钟）

创建完成后：

1. 点击左侧菜单的 "SQL Editor" 图标
2. 点击 "New query" 按钮
3. 清空编辑器内容
4. **复制并粘贴**以下完整SQL代码：

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

-- 创建索引提升性能
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
```

5. 点击右下角的 "RUN" 按钮（或按 Ctrl+Enter）
6. ✅ 应该看到 "Success. No rows returned"

### 步骤4：获取API密钥（1分钟）

1. 点击左侧 "Settings" (齿轮图标 ⚙️)
2. 点击 "API"
3. **复制以下信息**到记事本：
   - **Project URL**: 
     ```
     https://xxxxx.supabase.co
     ```
   - **anon public key**: 
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
4. 保存这些信息，稍后需要

### 步骤5：在Vercel添加环境变量（2分钟）

1. 打开新标签页，访问：https://vercel.com
2. 登录您的账户
3. 找到项目 `drk-website`
4. 点击项目进入详情
5. 点击上方 "Settings" 标签
6. 点击左侧 "Environment Variables"
7. 点击 "Add" 按钮
8. **添加第一个变量**：
   - **Name**: `SUPABASE_URL`
   - **Value**: 粘贴您复制的 Project URL
   - Environment: 选择 "Production"
   - 点击 "Save"
9. 点击 "Add" 按钮
10. **添加第二个变量**：
    - **Name**: `SUPABASE_KEY`
    - **Value**: 粘贴您复制的 anon public key
    - Environment: 选择 "Production"
    - 点击 "Save"

### 步骤6：重新部署（1分钟）

1. 在Vercel中，点击顶部的 "Deployments" 标签
2. 找到最新的部署（应该是最上面的）
3. 点击右侧 "..." 菜单
4. 选择 "Redeploy"
5. 确认 "Redeploy"
6. ⏳ 等待部署完成（约2分钟）

### 步骤7：测试网站

1. 部署完成后，复制生成的URL
2. 访问您的网站
3. 点击 "注册"
4. 创建测试账户
5. ✅ 如果成功，就完成了！

---

## 🎉 完成！

如果注册成功，说明Supabase已正确配置！

现在您的网站拥有：
- ✅ 用户注册和登录
- ✅ 数据持久化存储
- ✅ 所有功能可用
- ✅ 跨设备同步

---

## ❓ 如果遇到问题

### 问题1：注册失败
**检查**：
- Vercel环境变量是否正确
- Supabase表是否已创建
- 浏览器控制台是否有错误

### 问题2：环境变量未生效
**解决**：
1. 在Vercel Settings中删除环境变量
2. 重新添加
3. 重新部署

### 问题3：SQL执行失败
**解决**：
1. 检查SQL语法
2. 逐个表创建
3. 检查错误信息

---

**现在开始设置吧！** 预计总时间：10分钟

