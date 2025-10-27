# 部署指南

## 🌐 域名注册步骤

### 1. 选择域名注册商
推荐注册商：
- **Namecheap** - 价格便宜，界面友好
- **GoDaddy** - 全球最大注册商
- **阿里云** - 国内服务，中文支持

### 2. 注册域名
1. 访问注册商网站
2. 搜索 `drk.com` 检查可用性
3. 如果可用，完成注册流程
4. 支付费用（约$10-15/年）

## 🚀 部署到云服务

### 选项A：Vercel部署（推荐）
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 将代码推送到GitHub仓库
4. 在Vercel中导入项目
5. 自动部署完成

### 选项B：Netlify部署
1. 访问 [netlify.com](https://netlify.com)
2. 连接GitHub仓库
3. 配置构建设置
4. 部署完成

### 选项C：Railway部署
1. 访问 [railway.app](https://railway.app)
2. 连接GitHub
3. 选择项目部署
4. 获得公网URL

## 🔗 域名配置

### 1. 获取部署URL
部署完成后，您会得到一个URL，例如：
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- Railway: `https://your-app.railway.app`

### 2. 配置DNS
在域名注册商的控制面板中：
1. 找到DNS管理
2. 添加CNAME记录：
   - 主机记录：`www`
   - 记录值：`your-app.vercel.app`
3. 添加A记录（如果需要根域名）：
   - 主机记录：`@`
   - 记录值：Vercel的IP地址

## 💡 推荐流程

1. **先注册域名** `drk.com`
2. **部署到Vercel**（免费且简单）
3. **配置DNS** 将域名指向Vercel
4. **等待生效**（通常几分钟到几小时）

## 📝 注意事项

- 域名注册需要真实信息
- 建议选择1-2年注册期
- 记得设置自动续费
- 保护域名注册信息隐私
- 考虑购买SSL证书（Vercel免费提供）

## 🆓 免费替代方案

如果不想花钱注册域名，可以使用：
- `your-app.vercel.app`
- `your-app.netlify.app`
- `your-app.railway.app`

这些子域名完全免费！
