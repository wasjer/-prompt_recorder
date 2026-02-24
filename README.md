# Prompt Recorder

记录所有给 AI 发出的 prompt 或者给 agent 发出的指令。Record all prompts sent to AI or instructions issued to agents.

## 功能特性

- 🔍 **自动收集**: 自动记录浏览器和编辑器中的 AI 对话
- 📊 **数据管理**: 使用 SQLite 数据库存储所有 prompt
- 🔎 **搜索过滤**: 强大的搜索和过滤功能，支持按来源、标签、分类、时间范围筛选
- 📈 **统计分析**: 查看 prompt 使用统计，包括来源分布、分类统计等
- 📤 **数据导出**: 支持导出为 CSV 或 JSON 格式
- 🎨 **现代界面**: 美观的 Web 界面，方便查看和管理

## 系统架构

系统包含以下组件：

- **后端服务** (Node.js + Express + SQLite): 提供 RESTful API 和数据存储
- **浏览器扩展** (Chrome/Edge): 自动记录浏览器中 AI 平台的 prompt
- **编辑器扩展** (VSCode/Cursor): 记录编辑器中的 AI 对话
- **Web 界面** (React + TypeScript): 查看、搜索、管理所有记录的 prompt

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装

1. 克隆仓库
```bash
git clone <repository-url>
cd prompt_recorder
```

2. 安装所有依赖
```bash
npm run install:all
```

> **Windows 用户注意**: 如果遇到编译错误，请查看 [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md)。我们已经使用 `sql.js`（纯 JavaScript）替代了需要编译的 `better-sqlite3`，无需安装 Visual Studio Build Tools。

### 启动服务

#### 1. 启动后端服务

在项目根目录运行：

```bash
npm run dev:backend
```

或者：

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

**验证后端是否正常运行：**

打开浏览器访问：`http://localhost:3001/health`

应该看到：
```json
{"status":"ok","timestamp":"..."}
```

#### 2. 启动前端界面（新终端窗口）

在项目根目录运行：

```bash
npm run dev:frontend
```

或者：

```bash
cd frontend
npm run dev
```

前端界面将在 `http://localhost:3000` 启动。

**访问 Web 界面：**

打开浏览器访问：`http://localhost:3000`

## 使用指南

### 方式一：通过 Web 界面使用

1. **查看所有 Prompts**
   - 访问 `http://localhost:3000`
   - 在主界面可以看到所有已记录的 prompts

2. **搜索 Prompts**
   - 在搜索框输入关键词
   - 点击 "Search" 按钮
   - 支持按内容搜索

3. **过滤 Prompts**
   - **按来源**: 选择 Browser、Cursor、VSCode 或 Manual
   - **按标签**: 输入标签关键词
   - **按分类**: 输入分类名称
   - **按时间**: 选择开始和结束日期

4. **查看详情**
   - 点击列表中的 "View" 按钮
   - 可以查看完整的 prompt 信息
   - 可以编辑 tags 和 category
   - 可以删除 prompt

5. **查看统计**
   - 点击 "Show Stats" 按钮
   - 查看总数、来源分布、分类统计等

6. **导出数据**
   - 点击 "Export CSV" 导出为 CSV 格式
   - 点击 "Export JSON" 导出为 JSON 格式

### 方式二：通过 API 使用

#### 创建 Prompt

**PowerShell:**
```powershell
$body = @{
    content = "帮我写一个Python函数来计算斐波那契数列"
    source = "manual"
    tags = "python,算法"
    category = "编程"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/prompts `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "帮我写一个Python函数来计算斐波那契数列",
    "source": "manual",
    "tags": "python,算法",
    "category": "编程"
  }'
```

#### 获取所有 Prompts

**PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing
```

**curl:**
```bash
curl http://localhost:3001/api/prompts
```

#### 搜索 Prompts

**PowerShell:**
```powershell
# 按内容搜索
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?search=Python" -UseBasicParsing

# 按来源筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?source=manual" -UseBasicParsing

# 按标签筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?tags=python" -UseBasicParsing
```

#### 获取统计信息

**PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/stats/summary -UseBasicParsing
```

#### 导出数据

**PowerShell:**
```powershell
# 导出为 CSV
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/csv -UseBasicParsing -OutFile prompts.csv

# 导出为 JSON
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/json -UseBasicParsing -OutFile prompts.json
```

### 方式三：通过浏览器扩展使用

#### 安装浏览器扩展

1. **编译扩展**
   ```bash
   cd extension/browser
   npm install
   npm run build
   ```

2. **加载扩展**
   - 打开 Chrome/Edge 浏览器
   - 访问 `chrome://extensions/` 或 `edge://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `extension/browser` 目录

3. **使用扩展**
   - 访问支持的 AI 平台（ChatGPT, Claude, Gemini, Perplexity）
   - 在输入框中输入 prompt
   - 扩展会自动记录（等待 1-2 秒防抖延迟）
   - 点击扩展图标可以查看连接状态和打开仪表板

#### 支持的平台

- ChatGPT: `https://chat.openai.com` 或 `https://chatgpt.com`
- Claude: `https://claude.ai`
- Gemini: `https://gemini.google.com`
- Perplexity: `https://www.perplexity.ai`

### 方式四：通过编辑器扩展使用

#### 安装编辑器扩展

1. **编译扩展**
   ```bash
   cd extension/editor
   npm install
   npm run compile
   ```

2. **在 VSCode/Cursor 中安装**
   - 按 `F5` 打开扩展开发窗口（开发模式）
   - 或使用 `vsce package` 打包为 `.vsix` 文件安装

#### 使用扩展

1. **手动记录 Prompt**
   - 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
   - 输入 "Record Prompt"
   - 在弹出的输入框中输入或粘贴 prompt
   - 点击确定

2. **打开仪表板**
   - 使用命令面板
   - 输入 "Open Dashboard"
   - 会在浏览器中打开 Web 界面

3. **配置扩展**
   - 打开设置 (`Ctrl+,`)
   - 搜索 "promptRecorder"
   - 配置 API URL（默认: `http://localhost:3001/api/prompts`）
   - 配置是否自动记录

## 数据存储

所有数据存储在本地 SQLite 数据库中：

- **位置**: `backend/data/prompts.db`
- **格式**: SQLite 数据库文件
- **备份**: 可以复制 `prompts.db` 文件进行备份
- **迁移**: 可以将数据库文件复制到其他机器使用

## API 文档

### 创建 Prompt
```http
POST /api/prompts
Content-Type: application/json

{
  "content": "Your prompt here",
  "source": "browser" | "cursor" | "vscode" | "manual",
  "url": "optional url or file path",
  "tags": "optional,comma,separated,tags",
  "category": "optional category",
  "metadata": {}
}
```

### 获取 Prompts
```http
GET /api/prompts?search=query&source=browser&limit=50&offset=0&sortBy=timestamp&sortOrder=desc
```

**查询参数：**
- `search`: 搜索关键词（内容）
- `source`: 来源筛选（browser, cursor, vscode, manual）
- `tags`: 标签筛选
- `category`: 分类筛选
- `startDate`: 开始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）
- `limit`: 每页数量（默认 50）
- `offset`: 偏移量（默认 0）
- `sortBy`: 排序字段（timestamp 或 id）
- `sortOrder`: 排序顺序（asc 或 desc）

### 获取单个 Prompt
```http
GET /api/prompts/:id
```

### 更新 Prompt
```http
PATCH /api/prompts/:id
Content-Type: application/json

{
  "content": "Updated content",
  "tags": "updated,tags",
  "category": "updated category",
  "metadata": {}
}
```

### 删除 Prompt
```http
DELETE /api/prompts/:id
```

### 获取统计信息
```http
GET /api/prompts/stats/summary
```

### 导出数据
```http
GET /api/prompts/export/csv
GET /api/prompts/export/json
```

## 项目结构

```
prompt_recorder/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── server.ts     # Express 服务器
│   │   ├── routes/       # API 路由
│   │   ├── db/           # 数据库操作
│   │   ├── models/       # 数据模型
│   │   └── utils/        # 工具函数
│   ├── data/             # SQLite 数据库文件（自动创建）
│   └── package.json
├── extension/
│   ├── browser/          # 浏览器扩展
│   │   ├── src/          # TypeScript 源码
│   │   ├── manifest.json # 扩展配置
│   │   └── package.json
│   └── editor/           # 编辑器扩展
│       ├── src/          # TypeScript 源码
│       └── package.json
├── frontend/             # Web 界面
│   ├── src/
│   │   ├── components/   # React 组件
│   │   └── api/          # API 客户端
│   └── package.json
├── package.json          # Workspace 配置
├── README.md             # 本文档
├── TESTING.md            # 测试指南
└── INSTALL_WINDOWS.md    # Windows 安装说明
```

## 常见问题

### 后端无法启动

**问题**: 端口 3001 被占用

**解决**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3001

# 停止进程（替换 PID）
taskkill /F /PID <PID>
```

### 前端无法连接后端

**问题**: 前端显示连接错误

**解决**:
1. 确认后端服务正在运行（访问 `http://localhost:3001/health`）
2. 检查 `frontend/vite.config.ts` 中的代理配置
3. 检查浏览器控制台的网络请求

### 扩展无法记录

**问题**: 浏览器扩展不记录 prompt

**解决**:
1. 检查后端服务是否运行
2. 点击扩展图标，查看连接状态
3. 检查扩展的 API URL 配置（`extension/browser/src/config.ts`）
4. 查看浏览器控制台的错误信息

### 数据丢失

**问题**: 重启后数据不见了

**解决**:
1. 检查 `backend/data/prompts.db` 文件是否存在
2. 检查文件权限
3. 查看后端日志中的错误信息

### 中文乱码

**问题**: 中文内容显示为乱码

**解决**:
- 确保使用 UTF-8 编码
- 在 PowerShell 中使用 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`

## 开发

### 构建

```bash
# 构建所有项目
npm run build

# 构建特定项目
cd backend && npm run build
cd frontend && npm run build
cd extension/browser && npm run build
cd extension/editor && npm run compile
```

### 测试

详细的测试指南请查看 [TESTING.md](TESTING.md)

快速测试 API：
```powershell
# 运行自动化测试脚本
.\test-api.ps1
```

## 配置

### 后端配置

后端默认运行在 `http://localhost:3001`，可通过环境变量修改：

```bash
PORT=3001  # 端口号
NODE_ENV=development  # 环境模式
```

### 浏览器扩展配置

在 `extension/browser/src/config.ts` 中配置：
- `API_URL`: 后端 API 地址（默认: `http://localhost:3001/api/prompts`）
- `DEBOUNCE_DELAY`: 防抖延迟时间（毫秒）
- `MIN_CONTENT_LENGTH`: 最小内容长度

### 编辑器扩展配置

在 VSCode/Cursor 设置中配置：
- `promptRecorder.apiUrl`: 后端 API 地址
- `promptRecorder.autoRecord`: 是否自动记录

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 后端 API 完整实现
- ✅ Web 界面
- ✅ 浏览器扩展
- ✅ 编辑器扩展
- ✅ 数据导出功能
