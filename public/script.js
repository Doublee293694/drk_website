// 全局变量
let currentUser = null;
let currentToken = null;
let currentDate = new Date();
let currentFilter = 'all';

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
                    ${task.due_date ? `<span>截止: ${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
                </div>
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
            if (task.due_date) {
                document.getElementById('taskDueDate').value = 
                    new Date(task.due_date).toISOString().slice(0, 16);
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
        due_date: formData.get('taskDueDate') || document.getElementById('taskDueDate').value
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
        } else {
            const data = await response.json();
            alert('保存任务失败: ' + data.error);
        }
    } catch (error) {
        console.error('保存任务错误:', error);
        alert('保存任务失败，请重试');
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
        content: formData.get('noteContent') || document.getElementById('noteContent').value
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
        } else {
            const data = await response.json();
            alert('保存笔记失败: ' + data.error);
        }
    } catch (error) {
        console.error('保存笔记错误:', error);
        alert('保存笔记失败，请重试');
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
