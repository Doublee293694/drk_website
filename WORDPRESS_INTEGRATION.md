# WordPress 集成指南

## 📋 概述

您的网站现在支持WordPress博客集成！可以在您的应用中嵌入WordPress文章内容。

## 🔌 集成方式

### 方式1：直接调用WordPress REST API（推荐）

您的网站现在可以直接从任何WordPress网站获取文章内容：

1. 导航到**"博客"**标签
2. 输入WordPress网站URL
3. 点击"加载博客"
4. 查看文章列表

### 支持的WordPress功能

- ✅ 文章列表显示
- ✅ 文章详情查看
- ✅ 特色图片
- ✅ 文章摘要
- ✅ 发布日期
- ✅ 作者信息
- ✅ 文章分类
- ✅ 跳转到原文

## 🚀 使用方法

### 1. 访问博客功能

1. 登录您的网站
2. 点击导航栏的**"博客"**按钮
3. 在URL输入框中输入WordPress网站地址

### 2. 加载博客文章

```
输入格式：
https://your-blog.com
或
https://www.your-blog.com
```

### 3. 查看文章

- 点击文章卡片查看完整内容
- 在模态框中阅读文章
- 点击"阅读原文"跳转到WordPress网站

## ⚙️ WordPress配置要求

### 确保WordPress REST API已启用

WordPress REST API默认是启用的。如果没有启用，请检查：

1. **插件冲突**
   - 某些插件可能禁用REST API
   - 检查是否有"Disable REST API"插件

2. **检查API是否可用**
   ```
   https://your-blog.com/wp-json/wp/v2/posts
   ```
   访问这个URL应该返回JSON格式的文章数据

3. **CORS设置**
   - 如果您的WordPress网站不在同一域名，可能需要配置CORS
   - 或者使用我们提供的代理API

### WordPress服务器配置

如果遇到CORS问题，可以在WordPress的`.htaccess`文件中添加：

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

## 🎨 自定义配置

### 更改显示的文章数量

编辑 `public/script.js`：

```javascript
const apiUrl = `${blogUrl}/wp-json/wp/v2/posts?_embed&per_page=10`;
// 将 10 改为您想要的数量
```

### 添加更多WordPress数据

WordPress REST API支持很多其他资源：

```javascript
// 获取分类
https://your-blog.com/wp-json/wp/v2/categories

// 获取标签
https://your-blog.com/wp-json/wp/v2/tags

// 获取用户
https://your-blog.com/wp-json/wp/v2/users

// 搜索文章
https://your-blog.com/wp-json/wp/v2/posts?search=keyword
```

## 🔄 替代集成方案

### 方案A：完全迁移到WordPress

如果您希望将整个应用功能迁移到WordPress：

1. 创建WordPress主题
2. 使用WordPress插件实现功能
3. 使用WordPress数据库

**优势**：
- 统一的CMS系统
- 丰富的插件生态
- 更好的SEO

**劣势**：
- 需要重写功能代码
- 性能可能不如现有应用

### 方案B：WordPress作为子站点

1. 将WordPress安装到 `/blog` 子目录
2. 使用子域名 `blog.your-site.com`
3. 在应用和WordPress之间共享用户

**配置步骤**：
```bash
# 在您的主域名下创建blog目录
your-domain.com/
your-domain.com/blog/  (WordPress)
```

### 方案C：WordPress作为主站点

1. WordPress作为主站点（drk.com）
2. 将应用部署到子域名
3. 使用WordPress的多站点功能

**配置步骤**：
```bash
drk.com/  (WordPress主站)
app.drk.com/  (您的应用)
blog.drk.com/  (如果需要独立博客)
```

## 📱 移动端优化

WordPress集成已经响应式设计，在移动设备上也能完美显示。

## 🔐 安全考虑

### 公开API访问

WordPress REST API默认是公开的，但如果您的文章需要权限控制：

1. **使用私密文章**
2. **安装认证插件**
3. **使用应用密码**

### API限流

考虑实施API限流以防止滥用：

```javascript
// 在server.js中
app.use('/api/wordpress', (req, res, next) => {
  // 实现限流逻辑
  next();
});
```

## 🐛 故障排除

### 问题1：无法加载文章

**可能原因**：
- WordPress网站不可访问
- REST API被禁用
- 防火墙阻止了请求

**解决方案**：
1. 检查URL是否正确
2. 访问 `your-blog.com/wp-json/wp/v2/posts` 查看是否返回数据
3. 检查WordPress安全插件设置

### 问题2：CORS错误

**错误信息**：
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**解决方案**：
1. 使用服务器代理（已实现）
2. 在WordPress端配置CORS
3. 使用WordPress的CORS插件

### 问题3：文章内容不完整

**可能原因**：
- WordPress插件过滤了内容
- 文章内容过长被截断

**解决方案**：
1. 检查WordPress内容过滤设置
2. 调整摘要长度设置

## 📊 性能优化

### 缓存WordPress数据

实现客户端缓存：

```javascript
// 缓存文章列表
localStorage.setItem('wordpress_posts', JSON.stringify(posts));
```

### 服务端缓存

在server.js中实现：

```javascript
const cache = {};
app.get('/api/wordpress', (req, res) => {
  // 实现缓存逻辑
});
```

## 🎯 下一步建议

1. **尝试集成**：使用现有的WordPress博客测试集成
2. **自定义样式**：调整博客显示样式匹配您的品牌
3. **添加功能**：根据需求添加更多WordPress功能
4. **优化性能**：实施缓存策略

## 📞 支持

如果您遇到问题：
1. 检查WordPress网站是否可访问
2. 验证REST API是否启用
3. 查看浏览器控制台错误信息

---

**WordPress集成已就绪！开始使用吧！** 🚀
