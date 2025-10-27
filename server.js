const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('database.sqlite');

// 创建表
db.serialize(() => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    notifications_enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 事件表
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 任务表
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    tags TEXT,
    due_date DATETIME,
    reminder_date DATETIME,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 笔记表
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT,
    category TEXT DEFAULT 'general',
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 文件表
  db.run(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 通知表
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT 0,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, username },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: this.lastID, username, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({ 
          token, 
          user: { id: user.id, username: user.username, email: user.email } 
        });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
});

// 获取用户事件
app.get('/api/events', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM events WHERE user_id = ? ORDER BY start_date',
    [req.user.id],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(events);
    }
  );
});

// 创建事件
app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  db.run(
    'INSERT INTO events (title, description, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?)',
    [title, description, start_date, end_date, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, description, start_date, end_date });
    }
  );
});

// 更新事件
app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, start_date, end_date } = req.body;
  
  db.run(
    'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
    [title, description, start_date, end_date, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event updated successfully' });
    }
  );
});

// 删除事件
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM events WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    }
  );
});

// 获取任务
app.get('/api/tasks', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(tasks);
    }
  );
});

// 创建任务
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, priority, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO tasks (title, description, priority, due_date, user_id) VALUES (?, ?, ?, ?, ?)',
    [title, description, priority || 'medium', due_date, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, description, priority, due_date });
    }
  );
});

// 更新任务状态
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { completed, title, description, priority, due_date } = req.body;
  
  let updateQuery = 'UPDATE tasks SET ';
  let params = [];
  let updates = [];
  
  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed);
  }
  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    params.push(priority);
  }
  if (due_date !== undefined) {
    updates.push('due_date = ?');
    params.push(due_date);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updateQuery += updates.join(', ') + ' WHERE id = ? AND user_id = ?';
  params.push(id, req.user.id);
  
  db.run(updateQuery, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// 删除任务
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    }
  );
});

// 获取笔记
app.get('/api/notes', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [req.user.id],
    (err, notes) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(notes);
    }
  );
});

// 创建笔记
app.post('/api/notes', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)',
    [title, content, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, content });
    }
  );
});

// 更新笔记
app.put('/api/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, content, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note updated successfully' });
    }
  );
});

// 删除笔记
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note deleted successfully' });
    }
  );
});

// 用户个人资料相关API
// 获取用户资料
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, avatar, first_name, last_name, phone, bio, timezone, theme, notifications_enabled FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(user);
    }
  );
});

// 更新用户资料
app.put('/api/profile', authenticateToken, (req, res) => {
  const { first_name, last_name, phone, bio, timezone, theme, notifications_enabled } = req.body;
  
  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, phone = ?, bio = ?, timezone = ?, theme = ?, notifications_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [first_name, last_name, phone, bio, timezone, theme, notifications_enabled, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// 修改密码
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    // 验证当前密码
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT password FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Password updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 文件上传
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  db.run(
    'INSERT INTO files (filename, original_name, file_path, file_size, mime_type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_size: req.file.size,
        mime_type: req.file.mimetype
      });
    }
  );
});

// 获取用户文件
app.get('/api/files', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(files);
    }
  );
});

// 删除文件
app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM files WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json({ message: 'File deleted successfully' });
    }
  );
});

// 通知相关API
// 获取通知
app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(notifications);
    }
  );
});

// 标记通知为已读
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Notification marked as read' });
    }
  );
});

// 删除通知
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Notification deleted successfully' });
    }
  );
});

// 数据导出
app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const [events, tasks, notes] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM events WHERE user_id = ?', [req.user.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.all('SELECT * FROM notes WHERE user_id = ?', [req.user.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user_id: req.user.id,
      events,
      tasks,
      notes
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="data-export.json"');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// 数据导入
app.post('/api/import', authenticateToken, (req, res) => {
  const { events, tasks, notes } = req.body;
  
  if (!events && !tasks && !notes) {
    return res.status(400).json({ error: 'No data to import' });
  }

  let importedCount = 0;
  let errorCount = 0;

  // 导入事件
  if (events && Array.isArray(events)) {
    events.forEach(event => {
      db.run(
        'INSERT INTO events (title, description, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?)',
        [event.title, event.description, event.start_date, event.end_date, req.user.id],
        function(err) {
          if (err) errorCount++;
          else importedCount++;
        }
      );
    });
  }

  // 导入任务
  if (tasks && Array.isArray(tasks)) {
    tasks.forEach(task => {
      db.run(
        'INSERT INTO tasks (title, description, completed, priority, category, tags, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.completed || 0, task.priority, task.category, task.tags, task.due_date, req.user.id],
        function(err) {
          if (err) errorCount++;
          else importedCount++;
        }
      );
    });
  }

  // 导入笔记
  if (notes && Array.isArray(notes)) {
    notes.forEach(note => {
      db.run(
        'INSERT INTO notes (title, content, tags, category, user_id) VALUES (?, ?, ?, ?, ?)',
        [note.title, note.content, note.tags, note.category, req.user.id],
        function(err) {
          if (err) errorCount++;
          else importedCount++;
        }
      );
    });
  }

  res.json({ 
    message: 'Import completed',
    imported: importedCount,
    errors: errorCount
  });
});

// 搜索功能
app.get('/api/search', authenticateToken, (req, res) => {
  const { q, type } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchTerm = `%${q}%`;
  const results = { events: [], tasks: [], notes: [] };

  // 搜索事件
  if (!type || type === 'events') {
    db.all(
      'SELECT * FROM events WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)',
      [req.user.id, searchTerm, searchTerm],
      (err, events) => {
        if (!err) results.events = events;
        checkComplete();
      }
    );
  } else {
    checkComplete();
  }

  // 搜索任务
  if (!type || type === 'tasks') {
    db.all(
      'SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)',
      [req.user.id, searchTerm, searchTerm, searchTerm],
      (err, tasks) => {
        if (!err) results.tasks = tasks;
        checkComplete();
      }
    );
  } else {
    checkComplete();
  }

  // 搜索笔记
  if (!type || type === 'notes') {
    db.all(
      'SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)',
      [req.user.id, searchTerm, searchTerm, searchTerm],
      (err, notes) => {
        if (!err) results.notes = notes;
        checkComplete();
      }
    );
  } else {
    checkComplete();
  }

  let completed = 0;
  function checkComplete() {
    completed++;
    if (completed === 3) {
      res.json(results);
    }
  }
});

// 统计信息
app.get('/api/stats', authenticateToken, (req, res) => {
  const stats = {};
  
  // 获取各种统计数据
  db.get('SELECT COUNT(*) as count FROM events WHERE user_id = ?', [req.user.id], (err, result) => {
    if (!err) stats.events = result.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [req.user.id], (err, result) => {
    if (!err) stats.tasks = result.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 1', [req.user.id], (err, result) => {
    if (!err) stats.completedTasks = result.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', [req.user.id], (err, result) => {
    if (!err) stats.notes = result.count;
    checkComplete();
  });

  let completed = 0;
  function checkComplete() {
    completed++;
    if (completed === 4) {
      stats.completionRate = stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0;
      res.json(stats);
    }
  }
});

// WordPress代理API
app.get('/api/wordpress', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch WordPress data' });
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

