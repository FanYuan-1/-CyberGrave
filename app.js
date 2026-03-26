const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// 数据库就绪标志
let dbReady = false;

// 中间件
app.use(cors());
app.use(express.json());

// 禁用缓存
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 检查数据库就绪
app.use('/api', (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({ error: '数据库未就绪，请稍后再试' });
  }
  next();
});

app.use(express.static('public'));

// 允许的 category 值
const ALLOWED_CATEGORIES = ['anime', 'internet', 'fiction', 'real', 'self', 'other'];

// GET /api/persons - 获取所有人物列表（支持搜索和筛选）
app.get('/api/persons', (req, res) => {
  try {
    const { search, category } = req.query;

    let sql = 'SELECT * FROM persons WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category && ALLOWED_CATEGORIES.includes(category)) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY updated_at DESC';

    const rows = db.all(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('查询失败:', err);
    res.status(500).json({ error: '服务器内部错误: ' + err.message });
  }
});

// GET /api/persons/:id - 获取单个人物详情
app.get('/api/persons/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.get('SELECT * FROM persons WHERE id = ?', [id]);

    if (!row) {
      return res.status(404).json({ error: '人物不存在' });
    }

    res.json(row);
  } catch (err) {
    console.error('查询失败:', err);
    res.status(500).json({ error: '服务器内部错误: ' + err.message });
  }
});

// POST /api/persons - 创建新人物
app.post('/api/persons', (req, res) => {
  console.log('收到创建请求:', req.body);

  try {
    const { name, category, avatar_url, bio, epitaph } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '姓名(name)为必填项' });
    }

    const finalCategory = ALLOWED_CATEGORIES.includes(category) ? category : 'other';

    const sql = `
      INSERT INTO persons (name, category, avatar_url, bio, epitaph, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;

    const result = db.run(sql, [name.trim(), finalCategory, avatar_url || null, bio || null, epitaph || null]);
    console.log('插入结果:', result);

    if (!result || !result.lastID) {
      throw new Error('插入失败，未获取到ID');
    }

    const newRow = db.get('SELECT * FROM persons WHERE id = ?', [result.lastID]);
    console.log('新创建的记录:', newRow);

    res.status(201).json(newRow);
  } catch (err) {
    console.error('创建失败:', err);
    res.status(500).json({ error: '创建失败: ' + err.message });
  }
});

// PUT /api/persons/:id - 更新人物
app.put('/api/persons/:id', (req, res) => {
  console.log('收到更新请求:', req.params.id, req.body);

  try {
    const { id } = req.params;
    const { name, category, avatar_url, bio, epitaph } = req.body;

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: '姓名(name)不能为空' });
    }

    const row = db.get('SELECT * FROM persons WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: '人物不存在' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(ALLOWED_CATEGORIES.includes(category) ? category : 'other');
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url || null);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio || null);
    }
    if (epitaph !== undefined) {
      updates.push('epitaph = ?');
      params.push(epitaph || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供要更新的字段' });
    }

    updates.push("updated_at = datetime('now')");

    const sql = `UPDATE persons SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = db.run(sql, params);
    console.log('更新结果:', result);

    res.json({ updated: result.changes });
  } catch (err) {
    console.error('更新失败:', err);
    res.status(500).json({ error: '更新失败: ' + err.message });
  }
});

// DELETE /api/persons/:id - 删除人物
app.delete('/api/persons/:id', (req, res) => {
  try {
    const { id } = req.params;

    const row = db.get('SELECT * FROM persons WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: '人物不存在' });
    }

    const result = db.run('DELETE FROM persons WHERE id = ?', [id]);
    console.log('删除结果:', result);

    res.json({ deleted: result.changes });
  } catch (err) {
    console.error('删除失败:', err);
    res.status(500).json({ error: '删除失败: ' + err.message });
  }
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ error: '服务器内部错误: ' + err.message });
});

// 启动服务器
async function start() {
  try {
    await db.initDb();
    dbReady = true;
    console.log('数据库初始化完成');

    app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`赛博公墓服务器已启动`);
      console.log(`访问: http://localhost:${PORT}`);
      console.log(`=================================`);
    });
  } catch (err) {
    console.error('启动失败:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
