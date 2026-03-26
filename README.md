# 赛博公墓 (Cyber Cemetery)

一个虚拟人物纪念页面Web应用，允许用户浏览、创建和编辑虚拟人物的纪念页面（墓志铭）。任何人都可以贡献内容，类似一个协作式的数字纪念碑。

## 功能特性

- **首页列表** - 展示所有已收录人物，支持按分类筛选和关键词搜索
- **人物详情** - 查看完整信息（生平、墓志铭等）
- **编辑人物** - 修改已有信息
- **新增人物** - 创建新人物（可为自己撰写墓志铭）

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端 | Node.js + Express | 提供 REST API |
| 数据库 | SQLite3 | 轻量级文件数据库 |
| 前端 | 原生 HTML/CSS/JS | 简洁高效 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start
# 或
npm run dev
```

服务将在 http://localhost:3000 运行

### 访问应用

打开浏览器访问 http://localhost:3000

## API 接口

### 获取所有人物
```
GET /api/persons
```
- 查询参数：`search`（搜索关键词）、`category`（分类筛选）

### 获取单个人物
```
GET /api/persons/:id
```

### 创建人物
```
POST /api/persons
Content-Type: application/json

{
  "name": "姓名",
  "category": "分类",
  "avatar_url": "头像URL",
  "bio": "生平介绍",
  "epitaph": "墓志铭"
}
```

### 更新人物
```
PUT /api/persons/:id
Content-Type: application/json
```

### 删除人物
```
DELETE /api/persons/:id
```

## 项目结构

```
cyber-cemetery/
├── app.js                # 后端入口
├── db.js                 # 数据库连接与初始化
├── package.json
├── public/
│   ├── index.html        # 首页列表
│   ├── detail.html       # 详情页
│   ├── edit.html         # 编辑/新增页
│   ├── style.css         # 全局样式
│   └── script.js         # 公共函数
└── data/
    └── cemetery.db       # SQLite 数据库
```

## 分类说明

- `anime` - 动漫角色
- `internet` - 网红/虚拟主播
- `fiction` - 小说人物
- `real` - 现实人物
- `self` - 自建墓志铭
- `other` - 其他

## 许可证

MIT
