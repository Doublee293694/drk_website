// 全局变量
let currentUser = null;
let currentToken = null;
let currentDate = new Date();
let currentFilter = 'all';
let currentTheme = 'light';
let importData = null;

// API 基础配置
const API_BASE = '/api';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeEventListeners();
});

// 检查认证状态
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentToken = token;
        currentUser = JSON.parse(user);
        showMainApp();
        loadDashboardData();
    } else {
        showAuthModal();
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 模态框关闭事件
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// 显示认证模态框
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

// 显示主应用
function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('username').textContent = currentUser.username;
}

// 切换认证标签
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.style.display = 'none');
    
    if (tab === 'login') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('loginForm').style.display = 'block';
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').style.display = 'block';
    }
}

// 用户注册
async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
            loadDashboardData();
        } else {
            alert('注册失败: ' + data.error);
        }
    } catch (error) {
        console.error('注册错误:', error);
        alert('注册失败，请重试');
    }
}

// 用户登录
async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
            loadDashboardData();
        } else {
            alert('登录失败: ' + data.error);
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录失败，请重试');
    }
}

// 用户退出
function logout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthModal();
}

// 显示指定部分
function showSection(sectionName) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 移除所有导航按钮的活跃状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示指定部分
    document.getElementById(sectionName).classList.add('active');
    
    // 激活对应的导航按钮
    event.target.classList.add('active');
    
    // 根据部分加载相应数据
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'notes':
            loadNotes();
            break;
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        // 加载今日事件
        const todayEvents = await fetchEvents();
        const today = new Date().toDateString();
        const todayEventsList = todayEvents.filter(event => 
            new Date(event.start_date).toDateString() === today
        );
        
        document.getElementById('todayEvents').innerHTML = todayEventsList.length > 0 
            ? todayEventsList.map(event => `<div class="event-item">${event.title}</div>`).join('')
            : '<p>今日无事件</p>';
        
        // 加载待办任务
        const tasks = await fetchTasks();
        const pendingTasks = tasks.filter(task => !task.completed);
        
        document.getElementById('pendingTasks').innerHTML = pendingTasks.length > 0
            ? pendingTasks.slice(0, 5).map(task => `<div class="task-item">${task.title}</div>`).join('')
            : '<p>无待办任务</p>';
        
        // 加载最近笔记
        const notes = await fetchNotes();
        const recentNotes = notes.slice(0, 3);
        
        document.getElementById('recentNotes').innerHTML = recentNotes.length > 0
            ? recentNotes.map(note => `<div class="note-item">${note.title}</div>`).join('')
            : '<p>暂无笔记</p>';
        
        // 统计信息
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalEvents = todayEvents.length;
        
        document.getElementById('stats').innerHTML = `
            <div class="stat-item">
                <strong>${completedTasks}</strong> 已完成任务
            </div>
            <div class="stat-item">
                <strong>${pendingTasks.length}</strong> 待办任务
            </div>
            <div class="stat-item">
                <strong>${totalEvents}</strong> 总事件数
            </div>
        `;
        
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
    }
}

// 日历相关函数
function loadCalendar() {
    generateCalendar();
    loadEventsForCalendar();
}

function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${year}年 ${monthNames[month]}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // 星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'calendar-weekdays';
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'weekday';
        dayElement.textContent = day;
        weekdaysRow.appendChild(dayElement);
    });
    calendarGrid.appendChild(weekdaysRow);
    
    // 日期网格
    const daysRow = document.createElement('div');
    daysRow.className = 'calendar-days';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = date.toISOString().split('T')[0];
        
        if (date.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        
        if (date.toDateString() === new Date().toDateString()) {
            dayElement.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        dayElement.appendChild(dayEvents);
        
        dayElement.addEventListener('click', () => {
            showEventModal(date);
        });
        
        daysRow.appendChild(dayElement);
    }
    
    calendarGrid.appendChild(daysRow);
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
    loadEventsForCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
    loadEventsForCalendar();
}

async function loadEventsForCalendar() {
    try {
        const events = await fetchEvents();
        const eventsByDate = {};
        
        events.forEach(event => {
            const date = new Date(event.start_date).toISOString().split('T')[0];
            if (!eventsByDate[date]) {
                eventsByDate[date] = [];
            }
            eventsByDate[date].push(event);
        });
        
        document.querySelectorAll('.calendar-day').forEach(dayElement => {
            const date = dayElement.dataset.date;
            const dayEvents = dayElement.querySelector('.day-events');
            dayEvents.innerHTML = '';
            
            if (eventsByDate[date]) {
                dayElement.classList.add('has-events');
                eventsByDate[date].forEach(event => {
                    const eventDot = document.createElement('div');
                    eventDot.className = 'event-dot';
                    eventDot.title = event.title;
                    dayEvents.appendChild(eventDot);
                });
            }
        });
    } catch (error) {
        console.error('加载日历事件失败:', error);
    }
}

// 事件模态框
function showEventModal(date = null) {
    document.getElementById('eventModal').style.display = 'block';
    document.getElementById('eventModalTitle').textContent = '添加事件';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    
    if (date) {
        const startDate = new Date(date);
        startDate.setHours(9, 0);
        const endDate = new Date(date);
        endDate.setHours(10, 0);
        
        document.getElementById('eventStartDate').value = 
            startDate.toISOString().slice(0, 16);
        document.getElementById('eventEndDate').value = 
            endDate.toISOString().slice(0, 16);
    }
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

async function saveEvent(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const eventData = {
        title: formData.get('eventTitle') || document.getElementById('eventTitle').value,
        description: formData.get('eventDescription') || document.getElementById('eventDescription').value,
        start_date: formData.get('eventStartDate') || document.getElementById('eventStartDate').value,
        end_date: formData.get('eventEndDate') || document.getElementById('eventEndDate').value
    };
    
    const eventId = document.getElementById('eventId').value;
    
    try {
        const url = eventId ? `${API_BASE}/events/${eventId}` : `${API_BASE}/events`;
        const method = eventId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
            closeEventModal();
            loadCalendar();
            loadDashboardData();
        } else {
            const data = await response.json();
            alert('保存事件失败: ' + data.error);
        }
    } catch (error) {
        console.error('保存事件错误:', error);
        alert('保存事件失败，请重试');
    }
}

// 任务相关函数
async function loadTasks() {
    try {
        const tasks = await fetchTasks();
        displayTasks(tasks);
    } catch (error) {
        console.error('加载任务失败:', error);
    }
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>暂无任务</h3>
                <p>点击"添加任务"按钮创建您的第一个任务</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id}, this.checked)">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${getPriorityText(task.priority)}</span>
                    ${task.category ? `<span class="task-category ${task.category}">${getCategoryText(task.category)}</span>` : ''}
                    ${task.due_date ? `<span>截止: ${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
                </div>
                ${task.tags ? `<div class="task-tags">${task.tags.split(',').map(tag => `<span class="task-tag">${tag.trim()}</span>`).join('')}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})">编辑</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': '低',
        'medium': '中',
        'high': '高'
    };
    return priorityMap[priority] || '中';
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadTasks();
}

function showTaskModal(taskId = null) {
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskModalTitle').textContent = taskId ? '编辑任务' : '添加任务';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = taskId || '';
    
    if (taskId) {
        // 加载任务数据
        loadTaskData(taskId);
    }
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
}

async function loadTaskData(taskId) {
    try {
        const tasks = await fetchTasks();
        const task = tasks.find(t => t.id == taskId);
        
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category || 'general';
            document.getElementById('taskTags').value = task.tags || '';
            if (task.due_date) {
                document.getElementById('taskDueDate').value = 
                    new Date(task.due_date).toISOString().slice(0, 16);
            }
            if (task.reminder_date) {
                document.getElementById('taskReminder').value = 
                    new Date(task.reminder_date).toISOString().slice(0, 16);
            }
        }
    } catch (error) {
        console.error('加载任务数据失败:', error);
    }
}

async function saveTask(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = {
        title: formData.get('taskTitle') || document.getElementById('taskTitle').value,
        description: formData.get('taskDescription') || document.getElementById('taskDescription').value,
        priority: formData.get('taskPriority') || document.getElementById('taskPriority').value,
        due_date: formData.get('taskDueDate') || document.getElementById('taskDueDate').value,
        category: formData.get('taskCategory') || document.getElementById('taskCategory').value,
        tags: formData.get('taskTags') || document.getElementById('taskTags').value,
        reminder_date: formData.get('taskReminder') || document.getElementById('taskReminder').value
    };
    
    const taskId = document.getElementById('taskId').value;
    
    try {
        const url = taskId ? `${API_BASE}/tasks/${taskId}` : `${API_BASE}/tasks`;
        const method = taskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            closeTaskModal();
            loadTasks();
            loadDashboardData();
            showNotification('任务保存成功', 'success');
        } else {
            const data = await response.json();
            showNotification('保存任务失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('保存任务错误:', error);
        showNotification('保存任务失败，请重试', 'error');
    }
}

async function toggleTask(taskId, completed) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ completed })
        });
        
        if (response.ok) {
            loadTasks();
            loadDashboardData();
        } else {
            const data = await response.json();
            alert('更新任务失败: ' + data.error);
        }
    } catch (error) {
        console.error('更新任务错误:', error);
        alert('更新任务失败，请重试');
    }
}

function editTask(taskId) {
    showTaskModal(taskId);
}

async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            loadTasks();
            loadDashboardData();
        } else {
            const data = await response.json();
            alert('删除任务失败: ' + data.error);
        }
    } catch (error) {
        console.error('删除任务错误:', error);
        alert('删除任务失败，请重试');
    }
}

// 笔记相关函数
async function loadNotes() {
    try {
        const notes = await fetchNotes();
        displayNotes(notes);
    } catch (error) {
        console.error('加载笔记失败:', error);
    }
}

function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>暂无笔记</h3>
                <p>点击"添加笔记"按钮创建您的第一篇笔记</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-item" onclick="viewNote(${note.id})">
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content || '无内容'}</div>
            <div class="note-meta">
                <span>${new Date(note.updated_at).toLocaleDateString()}</span>
                <div class="note-actions" onclick="event.stopPropagation()">
                    <button class="edit-btn" onclick="editNote(${note.id})">编辑</button>
                    <button class="delete-btn" onclick="deleteNote(${note.id})">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showNoteModal(noteId = null) {
    document.getElementById('noteModal').style.display = 'block';
    document.getElementById('noteModalTitle').textContent = noteId ? '编辑笔记' : '添加笔记';
    document.getElementById('noteForm').reset();
    document.getElementById('noteId').value = noteId || '';
    
    if (noteId) {
        loadNoteData(noteId);
    }
}

function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
}

async function loadNoteData(noteId) {
    try {
        const notes = await fetchNotes();
        const note = notes.find(n => n.id == noteId);
        
        if (note) {
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content || '';
            document.getElementById('noteTags').value = note.tags || '';
            document.getElementById('noteCategory').value = note.category || 'general';
        }
    } catch (error) {
        console.error('加载笔记数据失败:', error);
    }
}

async function saveNote(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const noteData = {
        title: formData.get('noteTitle') || document.getElementById('noteTitle').value,
        content: formData.get('noteContent') || document.getElementById('noteContent').value,
        tags: formData.get('noteTags') || document.getElementById('noteTags').value,
        category: formData.get('noteCategory') || document.getElementById('noteCategory').value
    };
    
    const noteId = document.getElementById('noteId').value;
    
    try {
        const url = noteId ? `${API_BASE}/notes/${noteId}` : `${API_BASE}/notes`;
        const method = noteId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(noteData)
        });
        
        if (response.ok) {
            closeNoteModal();
            loadNotes();
            loadDashboardData();
            showNotification('笔记保存成功', 'success');
        } else {
            const data = await response.json();
            showNotification('保存笔记失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('保存笔记错误:', error);
        showNotification('保存笔记失败，请重试', 'error');
    }
}

function viewNote(noteId) {
    showNoteModal(noteId);
}

function editNote(noteId) {
    showNoteModal(noteId);
}

async function deleteNote(noteId) {
    if (!confirm('确定要删除这篇笔记吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            loadNotes();
            loadDashboardData();
        } else {
            const data = await response.json();
            alert('删除笔记失败: ' + data.error);
        }
    } catch (error) {
        console.error('删除笔记错误:', error);
        alert('删除笔记失败，请重试');
    }
}

// API 调用函数
async function fetchEvents() {
    const response = await fetch(`${API_BASE}/events`, {
        headers: {
            'Authorization': `Bearer ${currentToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    
    return await response.json();
}

async function fetchTasks() {
    const response = await fetch(`${API_BASE}/tasks`, {
        headers: {
            'Authorization': `Bearer ${currentToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    
    const tasks = await response.json();
    
    // 根据当前过滤器过滤任务
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

async function fetchNotes() {
    const response = await fetch(`${API_BASE}/notes`, {
        headers: {
            'Authorization': `Bearer ${currentToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    
    return await response.json();
}

// 文件管理功能
async function loadFiles() {
    try {
        const response = await fetch(`${API_BASE}/files`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch files');
        }
        
        const files = await response.json();
        displayFiles(files);
    } catch (error) {
        console.error('加载文件失败:', error);
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('filesList');
    
    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>暂无文件</h3>
                <p>点击"上传文件"按钮上传您的第一个文件</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.original_name}</div>
                <div class="file-meta">
                    ${formatFileSize(file.file_size)} • ${new Date(file.created_at).toLocaleDateString()}
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-secondary" onclick="deleteFile(${file.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            showNotification('文件上传成功', 'success');
            loadFiles();
            fileInput.value = '';
        } else {
            const data = await response.json();
            showNotification('文件上传失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('文件上传错误:', error);
        showNotification('文件上传失败，请重试', 'error');
    }
}

async function deleteFile(fileId) {
    if (!confirm('确定要删除这个文件吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            showNotification('文件删除成功', 'success');
            loadFiles();
        } else {
            const data = await response.json();
            showNotification('文件删除失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('文件删除错误:', error);
        showNotification('文件删除失败，请重试', 'error');
    }
}

// 数据导出功能
async function exportData() {
    try {
        const response = await fetch(`${API_BASE}/export`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('数据导出成功', 'success');
    } catch (error) {
        console.error('数据导出失败:', error);
        showNotification('数据导出失败，请重试', 'error');
    }
}

// 数据导入功能
function showImportModal() {
    document.getElementById('importModal').style.display = 'block';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importBtn').disabled = true;
    importData = null;
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            importData = data;
            
            // 显示预览
            const preview = document.getElementById('importPreview');
            const previewData = document.getElementById('importData');
            
            previewData.innerHTML = `
                <div><strong>事件:</strong> ${data.events ? data.events.length : 0} 个</div>
                <div><strong>任务:</strong> ${data.tasks ? data.tasks.length : 0} 个</div>
                <div><strong>笔记:</strong> ${data.notes ? data.notes.length : 0} 个</div>
                <div><strong>导出日期:</strong> ${data.export_date ? new Date(data.export_date).toLocaleString() : '未知'}</div>
            `;
            
            preview.style.display = 'block';
            document.getElementById('importBtn').disabled = false;
        } catch (error) {
            showNotification('文件格式错误，请选择有效的JSON文件', 'error');
        }
    };
    reader.readAsText(file);
}

async function confirmImport() {
    if (!importData) return;
    
    try {
        const response = await fetch(`${API_BASE}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(importData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`数据导入成功！导入了 ${result.imported} 个项目`, 'success');
            closeImportModal();
            
            // 刷新相关页面
            loadDashboardData();
            loadCalendar();
            loadTasks();
            loadNotes();
        } else {
            const data = await response.json();
            showNotification('数据导入失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('数据导入错误:', error);
        showNotification('数据导入失败，请重试', 'error');
    }
}

// 搜索功能
function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    const types = [];
    if (document.getElementById('searchEvents').checked) types.push('events');
    if (document.getElementById('searchTasks').checked) types.push('tasks');
    if (document.getElementById('searchNotes').checked) types.push('notes');
    
    if (types.length === 0) {
        showNotification('请至少选择一个搜索类型', 'warning');
        return;
    }
    
    try {
        const typeParam = types.length === 3 ? '' : `&type=${types.join(',')}`;
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}${typeParam}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const results = await response.json();
        displaySearchResults(results, query);
    } catch (error) {
        console.error('搜索失败:', error);
        showNotification('搜索失败，请重试', 'error');
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    let html = '';
    
    if (results.events.length > 0) {
        html += `
            <div class="search-result-section">
                <h3><i class="fas fa-calendar"></i> 事件 (${results.events.length})</h3>
                ${results.events.map(event => `
                    <div class="search-result-item">
                        <div class="search-result-title">${highlightText(event.title, query)}</div>
                        <div class="search-result-content">${highlightText(event.description || '', query)}</div>
                        <div class="search-result-meta">${new Date(event.start_date).toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (results.tasks.length > 0) {
        html += `
            <div class="search-result-section">
                <h3><i class="fas fa-tasks"></i> 任务 (${results.tasks.length})</h3>
                ${results.tasks.map(task => `
                    <div class="search-result-item">
                        <div class="search-result-title">${highlightText(task.title, query)}</div>
                        <div class="search-result-content">${highlightText(task.description || '', query)}</div>
                        <div class="search-result-meta">
                            ${task.completed ? '已完成' : '待完成'} • 
                            ${task.category ? getCategoryText(task.category) : ''} • 
                            ${task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (results.notes.length > 0) {
        html += `
            <div class="search-result-section">
                <h3><i class="fas fa-sticky-note"></i> 笔记 (${results.notes.length})</h3>
                ${results.notes.map(note => `
                    <div class="search-result-item">
                        <div class="search-result-title">${highlightText(note.title, query)}</div>
                        <div class="search-result-content">${highlightText(note.content || '', query)}</div>
                        <div class="search-result-meta">${new Date(note.updated_at).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (html === '') {
        html = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>未找到结果</h3>
                <p>没有找到包含 "${query}" 的内容</p>
            </div>
        `;
    }
    
    searchResults.innerHTML = html;
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function getCategoryText(category) {
    const categoryMap = {
        'general': '一般',
        'work': '工作',
        'personal': '个人',
        'study': '学习',
        'project': '项目',
        'urgent': '紧急'
    };
    return categoryMap[category] || category;
}

// 个人资料功能
let currentProfileTab = 'info';

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const profile = await response.json();
        displayProfile(profile);
        loadProfileStats();
    } catch (error) {
        console.error('加载个人资料失败:', error);
    }
}

function displayProfile(profile) {
    document.getElementById('firstName').value = profile.first_name || '';
    document.getElementById('lastName').value = profile.last_name || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('bio').value = profile.bio || '';
    document.getElementById('timezone').value = profile.timezone || 'UTC';
    document.getElementById('theme').value = profile.theme || 'light';
    document.getElementById('notificationsEnabled').checked = profile.notifications_enabled;
    
    if (profile.avatar) {
        document.getElementById('profileAvatar').src = profile.avatar;
    }
    
    // 应用主题
    applyTheme(profile.theme || 'light');
}

async function loadProfileStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        const stats = await response.json();
        displayProfileStats(stats);
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}

function displayProfileStats(stats) {
    const statsContainer = document.getElementById('profileStats');
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span>总事件</span>
            <span>${stats.events || 0}</span>
        </div>
        <div class="stat-item">
            <span>总任务</span>
            <span>${stats.tasks || 0}</span>
        </div>
        <div class="stat-item">
            <span>已完成</span>
            <span>${stats.completedTasks || 0}</span>
        </div>
        <div class="stat-item">
            <span>完成率</span>
            <span>${stats.completionRate || 0}%</span>
        </div>
        <div class="stat-item">
            <span>笔记数</span>
            <span>${stats.notes || 0}</span>
        </div>
    `;
}

function switchProfileTab(tab) {
    // 隐藏所有标签内容
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 移除所有标签按钮的活跃状态
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(`profile${tab.charAt(0).toUpperCase() + tab.slice(1)}`).style.display = 'block';
    
    // 激活选中的标签按钮
    event.target.classList.add('active');
    
    currentProfileTab = tab;
}

async function updateProfile(event) {
    event.preventDefault();
    
    const profileData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value,
        timezone: document.getElementById('timezone').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            showNotification('个人资料更新成功', 'success');
        } else {
            const data = await response.json();
            showNotification('更新失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('更新个人资料错误:', error);
        showNotification('更新失败，请重试', 'error');
    }
}

async function updateSettings(event) {
    event.preventDefault();
    
    const settingsData = {
        theme: document.getElementById('theme').value,
        notifications_enabled: document.getElementById('notificationsEnabled').checked
    };
    
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(settingsData)
        });
        
        if (response.ok) {
            showNotification('设置更新成功', 'success');
            applyTheme(settingsData.theme);
        } else {
            const data = await response.json();
            showNotification('更新失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('更新设置错误:', error);
        showNotification('更新失败，请重试', 'error');
    }
}

async function updatePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('新密码和确认密码不匹配', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/profile/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.ok) {
            showNotification('密码修改成功', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            const data = await response.json();
            showNotification('密码修改失败: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('修改密码错误:', error);
        showNotification('密码修改失败，请重试', 'error');
    }
}

function changeAvatar() {
    // 简单的头像更换功能
    const newAvatar = prompt('请输入头像URL:');
    if (newAvatar) {
        document.getElementById('profileAvatar').src = newAvatar;
        showNotification('头像更新成功', 'success');
    }
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', theme);
}

// 通知功能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 自动移除通知
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 更新showSection函数以支持新功能
function showSection(sectionName) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 移除所有导航按钮的活跃状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示指定部分
    document.getElementById(sectionName).classList.add('active');
    
    // 激活对应的导航按钮
    event.target.classList.add('active');
    
    // 根据部分加载相应数据
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'notes':
            loadNotes();
            break;
        case 'files':
            loadFiles();
            break;
        case 'search':
            // 搜索页面不需要预加载
            break;
        case 'profile':
            loadProfile();
            break;
        case 'blog':
            // 博客页面无需预加载
            break;
    }
}

// WordPress博客集成功能
let wordPressPosts = [];

async function loadWordPressBlog() {
    const wpUrl = document.getElementById('wordpressUrl').value.trim();
    
    if (!wpUrl) {
        showNotification('请输入WordPress网站URL', 'error');
        return;
    }
    
    // 确保URL格式正确
    const blogUrl = wpUrl.endsWith('/') ? wpUrl.slice(0, -1) : wpUrl;
    const apiUrl = `${blogUrl}/wp-json/wp/v2/posts?_embed&per_page=10`;
    
    try {
        showNotification('正在加载博客内容...', 'info');
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('无法连接到WordPress网站');
        }
        
        const posts = await response.json();
        wordPressPosts = posts;
        displayBlogPosts(posts, blogUrl);
        
        showNotification(`成功加载 ${posts.length} 篇文章`, 'success');
    } catch (error) {
        console.error('加载博客失败:', error);
        showNotification('加载博客失败，请检查URL是否正确', 'error');
        
        const blogPosts = document.getElementById('blogPosts');
        blogPosts.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>加载失败</h3>
                <p>无法连接到WordPress网站</p>
                <p style="font-size: 12px; color: #999;">请确保：</p>
                <ul style="text-align: left; font-size: 12px; color: #999;">
                    <li>WordPress网站已启用REST API</li>
                    <li>URL格式正确（包含http://或https://）</li>
                    <li>网站可以正常访问</li>
                </ul>
            </div>
        `;
    }
}

function displayBlogPosts(posts, blogUrl) {
    const blogPosts = document.getElementById('blogPosts');
    
    if (posts.length === 0) {
        blogPosts.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>暂无文章</h3>
                <p>该WordPress网站还没有发布任何文章</p>
            </div>
        `;
        return;
    }
    
    blogPosts.innerHTML = posts.map((post, index) => {
        const excerpt = post.excerpt ? 
            post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
            '暂无摘要';
        
        const date = new Date(post.date).toLocaleDateString('zh-CN');
        const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] ? 
            post._embedded['wp:featuredmedia'][0].source_url : null;
        
        return `
            <div class="blog-post-item" onclick="showBlogPost(${index})">
                ${featuredImage ? `<img src="${featuredImage}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">` : ''}
                <div class="blog-post-title">${post.title.rendered}</div>
                <div class="blog-post-excerpt">${excerpt}</div>
                <div class="blog-post-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-eye"></i> ${post._links['self'] ? '阅读' : ''}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showBlogPost(index) {
    const post = wordPressPosts[index];
    if (!post) return;
    
    const blogUrl = document.getElementById('wordpressUrl').value.replace(/\/$/, '');
    
    document.getElementById('blogTitle').innerHTML = post.title.rendered;
    document.getElementById('blogContent').innerHTML = post.content.rendered;
    document.getElementById('blogLink').href = post.link;
    
    // 设置文章元信息
    const authorName = post._embedded && post._embedded.author ? 
        post._embedded.author[0].name : '未知作者';
    const publishDate = new Date(post.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('blogAuthor').innerHTML = `<i class="fas fa-user"></i> ${authorName}`;
    document.getElementById('blogDate').innerHTML = `<i class="fas fa-calendar"></i> ${publishDate}`;
    
    document.getElementById('blogModal').style.display = 'block';
}

// 添加WordPress代理API到后端

// 初始化主题
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});
