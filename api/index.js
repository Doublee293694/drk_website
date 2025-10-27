const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Supabase初始化
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase connected');
} else {
  console.log('⚠️ Supabase not configured - using fallback mode');
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 内存数据库fallback
let memoryDb = {
  users: [],
  events: [],
  tasks: [],
  notes: [],
  files: [],
  userIdCounter: 1
};

// JWT验证中间件
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
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, email, password: hashedPassword }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
      
      const token = jwt.sign(
        { id: data.id, username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ token, user: { id: data.id, username, email } });
    } else {
      const newUser = {
        id: memoryDb.userIdCounter++,
        username,
        email,
        password: hashedPassword
      };
      memoryDb.users.push(newUser);
      
      const token = jwt.sign(
        { id: newUser.id, username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ token, user: { id: newUser.id, username, email } });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 用户登录
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    let user = null;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error || !data) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user = data;
    } else {
      user = memoryDb.users.find(u => u.username === username);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户事件
app.get('/events', authenticateToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', req.user.id)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      res.json(data || []);
    } else {
      const events = memoryDb.events.filter(e => e.user_id === req.user.id);
      res.json(events);
    }
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 创建事件
app.post('/events', authenticateToken, async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .insert([{ title, description, start_date, end_date, user_id: req.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const newEvent = {
        id: Date.now(),
        title,
        description,
        start_date,
        end_date,
        user_id: req.user.id,
        created_at: new Date().toISOString()
      };
      memoryDb.events.push(newEvent);
      res.json(newEvent);
    }
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 获取任务
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } else {
      const tasks = memoryDb.tasks.filter(t => t.user_id === req.user.id);
      res.json(tasks);
    }
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 创建任务
app.post('/tasks', authenticateToken, async (req, res) => {
  const { title, description, priority, due_date, category, tags, reminder_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, description, priority, due_date, category, tags, reminder_date, user_id: req.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const newTask = {
        id: Date.now(),
        title,
        description,
        completed: false,
        priority: priority || 'medium',
        category: category || 'general',
        tags,
        due_date,
        reminder_date,
        user_id: req.user.id,
        created_at: new Date().toISOString()
      };
      memoryDb.tasks.push(newTask);
      res.json(newTask);
    }
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 获取笔记
app.get('/notes', authenticateToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', req.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } else {
      const notes = memoryDb.notes.filter(n => n.user_id === req.user.id);
      res.json(notes);
    }
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 创建笔记
app.post('/notes', authenticateToken, async (req, res) => {
  const { title, content, tags, category } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, content, tags, category, user_id: req.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const newNote = {
        id: Date.now(),
        title,
        content,
        tags,
        category: category || 'general',
        user_id: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryDb.notes.push(newNote);
      res.json(newNote);
    }
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 搜索功能
app.get('/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const results = { events: [], tasks: [], notes: [] };

  try {
    if (supabase) {
      const [eventsData, tasksData, notesData] = await Promise.all([
        supabase.from('events').select('*').eq('user_id', req.user.id).or(`title.ilike.%${q}%,description.ilike.%${q}%`),
        supabase.from('tasks').select('*').eq('user_id', req.user.id).or(`title.ilike.%${q}%,description.ilike.%${q}%`),
        supabase.from('notes').select('*').eq('user_id', req.user.id).or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      ]);
      
      results.events = eventsData.data || [];
      results.tasks = tasksData.data || [];
      results.notes = notesData.data || [];
    } else {
      const searchLower = q.toLowerCase();
      results.events = memoryDb.events.filter(e => 
        e.user_id === req.user.id && 
        (e.title?.toLowerCase().includes(searchLower) || e.description?.toLowerCase().includes(searchLower))
      );
      results.tasks = memoryDb.tasks.filter(t => 
        t.user_id === req.user.id && 
        (t.title?.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower))
      );
      results.notes = memoryDb.notes.filter(n => 
        n.user_id === req.user.id && 
        (n.title?.toLowerCase().includes(searchLower) || n.content?.toLowerCase().includes(searchLower))
      );
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search error' });
  }
});

// 统计信息
app.get('/stats', authenticateToken, async (req, res) => {
  try {
    let stats = {};
    
    if (supabase) {
      const [eventsCount, tasksCount, completedCount, notesCount] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id).eq('completed', true),
        supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id)
      ]);
      
      stats.events = eventsCount.count || 0;
      stats.tasks = tasksCount.count || 0;
      stats.completedTasks = completedCount.count || 0;
      stats.notes = notesCount.count || 0;
    } else {
      stats.events = memoryDb.events.filter(e => e.user_id === req.user.id).length;
      stats.tasks = memoryDb.tasks.filter(t => t.user_id === req.user.id).length;
      stats.completedTasks = memoryDb.tasks.filter(t => t.user_id === req.user.id && t.completed).length;
      stats.notes = memoryDb.notes.filter(n => n.user_id === req.user.id).length;
    }
    
    stats.completionRate = stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0;
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Stats error' });
  }
});

module.exports = app;

