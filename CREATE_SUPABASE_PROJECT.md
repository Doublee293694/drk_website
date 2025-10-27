# 🚀 在Supabase创建新项目 - 详细步骤

## 📍 您当前的状态
- ✅ 已用GitHub登录Supabase
- ❌ 还没有创建项目

## 🎯 现在需要做什么
创建一个新项目，然后配置数据库

---

## 📝 步骤1：创建新项目

### 1.1 选择或创建Organization

登录Supabase后，您会看到Dashboard或组织选择页面：

**场景A：如果看到"Select an organization"页面**
- 选择或创建一个Organization
- 点击 "Create Organization" 创建新的
- 或选择已有的

**场景B：如果已经在一个Organization中**
- 直接进入下一步

### 1.2 点击创建新项目按钮

您应该会看到：
- 一个绿色的 **"New Project"** 按钮
- 或一个 **"+"** 加号按钮

点击它！

### 1.3 填写项目信息

会看到一个表单，填写：

**Name**:
```
drk-website
```
或任何您喜欢的名称

**Database Password**:
- ⚠️ **这是重要的一步！**
- 输入一个强密码：
  - 至少12位
  - 包含大写字母、小写字母、数字
  - 例如：`MyDrk2024Pass!`
- 📝 **记住这个密码！** 保存到安全的地方
- ⚠️ **数据库密码不能找回，一定要记住！**

**Region**:
选择最近的位置：
- 推荐：`Northeast Asia (Tokyo)` - 东京
- 或：`Southeast Asia (Singapore)` - 新加坡
- 或：`Southeast Asia (Mumbai)` - 印度

**Subscription**: 
保持选择 **"Free"** （免费计划）

### 1.4 创建项目
1. 确认所有信息正确
2. 点击绿色的 **"Create new project"** 按钮
3. ⏳ 等待项目创建（约60-120秒）
   - 您会看到进度条
   - 等待完成

---

## ✅ 项目创建成功后的界面

创建完成后，您会看到：
- Dashboard主页
- 左侧有很多菜单选项
- 顶部显示您的项目名称

---

## 📝 步骤2：准备数据库表

现在需要创建数据库表：

### 2.1 打开SQL Editor
1. 点击左侧菜单的 **"SQL Editor"** 图标
   - 看起来像文件或代码图标
   - 位置通常在顶部菜单中

### 2.2 创建新查询
1. 点击右上角的 **"New query"** 按钮
2. 会看到一个代码编辑器

### 2.3 粘贴SQL代码
1. **删除**编辑器中现有的任何内容
2. **复制**以下完整的SQL代码并粘贴：

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

### 2.4 执行SQL
1. 点击编辑器右下角的 **"RUN"** 按钮
   - 或按键盘快捷键 `Ctrl+Enter` (Windows) 或 `Cmd+Enter` (Mac)
2. 等待执行完成
3. ✅ 应该看到成功消息："Success. No rows returned"

### 2.5 验证表已创建
1. 点击左侧菜单的 **"Table Editor"**（表格图标）
2. 您应该看到以下表：
   - ✅ users
   - ✅ events
   - ✅ tasks
   - ✅ notes
   - ✅ files
   - ✅ notifications

---

## 📝 步骤3：获取Project URL和API Key

这是配置Vercel需要的！

### 3.1 打开API设置
1. 点击左侧菜单的 **"Settings"**（齿轮图标 ⚙️）
2. 在Settings页面中，点击左侧的 **"API"**

### 3.2 复制Project URL
1. 在 **"Project URL"** 部分
2. 您会看到一个类似这样的URL：
   ```
   https://abcdefghijk.supabase.co
   ```
3. **全选并复制**这个URL
4. 保存到记事本或文档中

### 3.3 复制API Key
1. 滚动到 **"Project API keys"** 部分
2. 找到 **"anon" "public"** 这一行（通常是最上面的）
3. 您会看到一长串字符，类似：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM5NjAwMDAsImV4cCI6MjAwOTUzNjAwMH0.xxxxxxxxxxxxxxx
   ```
4. 点击key旁边的 **"Copy"** 按钮（眼睛图标旁边）
5. 或选择并复制key
6. 保存到记事本或文档中

---

## ✅ 现在您有了！

```
✅ Project URL: https://xxxxx.supabase.co
✅ API Key: eyJhbGciOiJIUzI1NiIs...
```

---

## 🎯 下一步：配置Vercel

现在带这两个值去Vercel：

1. 访问：https://vercel.com
2. 登录您的账户
3. 找到项目 `drk-website`
4. 点击进入
5. 点击 **"Settings"** 标签
6. 点击 **"Environment Variables"**
7. 点击 **"Add"**
8. 添加第一个：
   - Key: `SUPABASE_URL`
   - Value: 粘贴您刚才复制的Project URL
9. 再次点击 **"Add"**
10. 添加第二个：
    - Key: `SUPABASE_KEY`
    - Value: 粘贴您刚才复制的API Key
11. 保存并重新部署

---

## 📸 如果您找不到按钮

### 找不到"New Project"按钮？
- 查看页面顶部
- 或右上角
- 可能显示为绿色的 "+ New Project"

### 找不到SQL Editor？
- 点击左侧菜单最上面的 **"SQL Editor"**
- 图标看起来像代码或文档

### 找不到Settings？
- 左侧菜单最底部，点击 **"Settings"**（齿轮图标 ⚙️）

---

**开始创建项目吧！** 预计时间：5分钟 ⏰

