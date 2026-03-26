const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'cemetery.db');

let db;
let SQL;

// 初始化数据库
async function initDb() {
  // 确保 data 目录存在
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 加载 sql.js
  SQL = await initSqlJs();

  // 如果数据库文件存在，加载它
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
    console.log('数据库加载成功:', dbPath);
  } else {
    // 创建新数据库
    db = new SQL.Database();
    console.log('创建新数据库');
  }

  // 初始化表结构
  db.run(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'other',
      avatar_url TEXT,
      bio TEXT,
      epitaph TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('persons 表已初始化');

  // 保存到文件
  saveDb();

  return db;
}

// 保存数据库到文件
function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// 执行查询（获取多条）
function all(sql, params = []) {
  if (!db) throw new Error('数据库未初始化');
  const stmt = db.prepare(sql);
  // 绑定查询参数，确保 SQL 中的 `?` 占位符能正确被替换
  stmt.bind(params);
  const result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
}

// 执行查询（获取单条）
function get(sql, params = []) {
  if (!db) throw new Error('数据库未初始化');
  const stmt = db.prepare(sql);
  // 绑定查询参数，确保 SQL 中的 `?` 占位符能正确被替换
  stmt.bind(params);
  if (stmt.step()) {
    const result = stmt.getAsObject();
    stmt.free();
    return result;
  }
  stmt.free();
  return undefined;
}

// 执行运行（插入、更新、删除）
function run(sql, params = []) {
  if (!db) throw new Error('数据库未初始化');

  try {
    // 使用 prepared statement 执行
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();

    // 获取最后插入的ID
    let lastID = 0;
    try {
      const idStmt = db.prepare("SELECT last_insert_rowid() as id");
      if (idStmt.step()) {
        lastID = idStmt.getAsObject().id;
      }
      idStmt.free();
    } catch (e) {
      console.log('获取lastID失败:', e.message);
    }

    // 获取影响的行数（简化处理）
    const changes = 1;

    // 保存到文件
    saveDb();

    return { lastID, changes };
  } catch (err) {
    console.error('SQL执行失败:', err);
    throw err;
  }
}

module.exports = {
  initDb,
  all,
  get,
  run,
  saveDb
};
