const express = require('express');
const path = require('path');

const app = express();

// 中间件
app.use(express.static('public'));

// 主页路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;

