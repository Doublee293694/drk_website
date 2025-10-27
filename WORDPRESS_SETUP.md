# WordPress 在 /wordpress 子目录部署指南

## 🎯 实现目标

让您可以通过 `your-site.com/wordpress` 访问WordPress管理面板。

## 🚀 推荐方案：使用子域名（最佳实践）

### 架构设计

```
主站点: drk.com 或 your-site.com        → 您的Node.js应用
WordPress: wordpress.drk.com 或 blog.drk.com → WordPress博客
```

### 优势

- ✅ 完全独立部署，互不干扰
- ✅ WordPress使用自己的数据库和资源
- ✅ 更好的性能和SEO
- ✅ 独立备份和更新
- ✅ 符合Vercel部署最佳实践

### 实施步骤

#### 步骤1：准备WordPress项目

```bash
# 在GitHub创建新仓库用于WordPress
# 或使用WordPress托管服务
```

#### 步骤2：部署WordPress到Vercel

```bash
# 在Vercel中创建新项目
# 选择独立的WordPress部署
```

#### 步骤3：配置DNS

在您的域名DNS设置中添加：

```
类型: CNAME
名称: wordpress
值: wordpress-deployment.vercel.app
TTL: Auto
```

#### 步骤4：访问WordPress

配置完成后，访问：
- `wordpress.drk.com` - WordPress博客
- `wordpress.drk.com/wp-admin` - 管理面板

---

## 📝 方案二：在应用中嵌入WordPress（当前已实现）

您当前的网站已经集成了WordPress内容显示功能：

1. **访问博客功能**
   - 在您的网站中点击"博客"标签
   - 输入WordPress URL
   - 查看文章列表

2. **配置参考**
   - 将您的WordPress URL保存到配置
   - 可以同时连接多个WordPress网站

---

## 🔧 方案三：使用反向代理

如果您确实需要 `/wordpress` 路径访问WordPress：

### 对于Vercel部署

需要在 `vercel.json` 中添加配置（但Vercel不支持直接的PHP应用）。

### 推荐使用Serverless WordPress

使用支持Node.js的WordPress替代方案：

1. **使用Headless WordPress**
   - WordPress在后端（api.wordpress.com）
   - 您的前端通过API获取内容
   - 已经是当前实现方式 ✅

2. **使用Ghost CMS**
   - Node.js编写的CMS
   - 可以部署到Vercel
   - 更轻量级

3. **使用Strapi**
   - 开源无头CMS
   - Node.js + Express
   - 可以完全整合

---

## 💡 最佳方案推荐

### 对于您当前的情况

**最佳解决方案**：

1. **主站点** (`drk.com`) 
   - 您的Node.js应用（日历、任务、笔记）
   - 已经部署到Vercel ✅

2. **WordPress博客** (`blog.drk.com` 或 `wordpress.drk.com`)
   - 独立的WordPress站点
   - 部署到：
     - Vercel（Serverless WordPress）
     - 或使用WordPress.com
     - 或使用WordPress托管服务

3. **集成方式**
   - 使用WordPress REST API（当前已实现）✅
   - 在应用"博客"功能中显示WordPress内容

### 如何实现

#### 选项1：使用WordPress.com（最简单）

```bash
1. 注册 WordPress.com 账户
2. 创建新站点
3. 配置自定义域名 blog.drk.com
4. 在您的应用中连接到该URL
```

#### 选项2：使用Vercel + Headless WordPress

```bash
1. 使用 WordPress.com 或 WP Engine 作为后端
2. 通过REST API获取内容（当前已实现）✅
3. 在您的应用中展示内容
```

---

## 🎯 快速开始指南

### 当前您可以：

1. **在应用中查看WordPress博客**
   - 登录您的应用
   - 点击"博客"标签
   - 输入WordPress URL（如 `https://your-blog.com`）
   - 查看文章列表

2. **编辑WordPress内容**
   - 访问您的WordPress网站
   - 登录 WordPress 管理面板
   - 在WordPress中编辑文章
   - 在您的应用中查看最新内容

---

## 📞 实施建议

### 如果您想保留 `/wordpress` 路径

**建议**：
- 不要使用 `/wordpress` 子目录
- 使用子域名 `wordpress.drk.com`
- 或者使用当前的博客集成功能

**原因**：
- Vercel不支持直接运行PHP应用
- `/wordpress` 路径会让路由复杂化
- 子域名方案更清晰、更专业

---

## 🛠️ 配置示例

### 当前架构（推荐）

```
┌─────────────────┐
│   drk.com       │ ← 您的应用（已部署）✅
│  /日历          │
│  /任务          │
│  /笔记          │
│  /博客          │ ← WordPress内容（当前已实现）✅
└─────────────────┘

┌─────────────────┐
│wordpress.drk.com│ ← WordPress管理面板（需要独立部署）
│  /wp-admin      │
│  /posts         │
└─────────────────┘
```

---

## ✅ 总结

**您已经拥有的功能**：
- ✅ WordPress内容展示
- ✅ 文章列表和详情
- ✅ 在应用中查看博客

**下一步**：
1. 部署独立的WordPress网站到 `wordpress.drk.com`
2. 在应用中连接到该WordPress
3. 使用WordPress管理面板编辑内容
4. 在应用中查看最新内容

**不需要**：
- ❌ 在 `/wordpress` 子目录安装
- ❌ 修改Vercel路由配置
- ❌ 使用复杂的反向代理

---

**当前集成已经完全可用！** 🎉

只需：
1. 部署WordPress到子域名
2. 在应用"博客"功能中输入WordPress URL
3. 开始使用！

