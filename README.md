# Prompt Recorder

记录所有给 AI 发出的 prompt 或者给 agent 发出的指令。Record all prompts sent to AI or instructions issued to agents.

## 功能特性

- 🔍 **自动收集**: 自动记录浏览器和编辑器中的 AI 对话
- 📊 **数据管理**: 使用 SQLite 数据库存储所有 prompt
- 🔎 **搜索过滤**: 强大的搜索和过滤功能，支持按来源、标签、分类、时间范围、LLM 平台筛选
- 📈 **统计分析**: 查看 prompt 使用统计，包括来源分布、分类统计等
- 📤 **数据导出**: 支持导出为 CSV 或 JSON 格式（支持筛选条件导出）
- 🎨 **现代界面**: 美观的 Web 界面，方便查看和管理
- 🚀 **自动启动**: 支持 Windows 开机自动启动（后端和前端）

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
- Windows 10/11（自动启动功能）

### 安装

1. 克隆仓库
```bash
git clone https://github.com/wasjer/-prompt_recorder.git
cd -prompt_recorder
```

2. 安装所有依赖
```bash
npm run install:all
```

> **Windows 用户注意**: 我们已经使用 `sql.js`（纯 JavaScript）替代了需要编译的 `better-sqlite3`，无需安装 Visual Studio Build Tools。

### 启动服务

#### 方式一：生产模式（推荐）

使用统一启动脚本，前端会被构建并由后端提供服务：

```powershell
.\scripts\start-all.ps1
```

等待 10-20 秒后，访问：`http://localhost:3001`

#### 方式二：开发模式

**终端 1：启动后端**
```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

**终端 2：启动前端**
```bash
cd frontend
npm run dev
```

前端界面将在 `http://localhost:3000` 启动。

**验证服务：**
- 后端：访问 `http://localhost:3001/health`，应返回 `{"status":"ok"}`
- 前端：访问 `http://localhost:3000` 或 `http://localhost:3001`（生产模式）

### 配置自动启动（Windows）

**以管理员身份运行 PowerShell**，然后执行：

```powershell
.\scripts\setup-autostart.ps1
```

这个脚本会：
- ✅ 配置前端自动构建
- ✅ 配置后端以生产模式自动启动
- ✅ 前端通过后端在 `http://localhost:3001` 提供服务
- ✅ 创建 Windows 计划任务，开机自动启动

**验证自动启动：**
```powershell
# 查看任务状态
Get-ScheduledTask -TaskName "PromptRecorder"

# 手动测试
.\scripts\start-all.ps1
```

**禁用自动启动：**
```powershell
# 以管理员身份运行
Unregister-ScheduledTask -TaskName "PromptRecorder" -Confirm:$false
```

## 使用指南

### Web 界面使用

1. **查看所有 Prompts**
   - 访问 `http://localhost:3001`（生产模式）或 `http://localhost:3000`（开发模式）
   - 在主界面可以看到所有已记录的 prompts

2. **搜索和过滤**
   - **关键字搜索**: 在搜索框输入关键词
   - **按来源**: 选择 Browser、Cursor、VSCode 或 Manual
   - **按 LLM 平台**: 选择 ChatGPT、Claude、Gemini、Perplexity、Qwen、Doubao 等
   - **按标签**: 输入标签关键词
   - **按分类**: 输入分类名称
   - **按时间**: 选择开始和结束日期

3. **导出数据**
   - **All CSV/JSON**: 导出所有数据
   - **Filtered CSV/JSON**: 按当前筛选条件导出
   - CSV 文件包含 UTF-8 BOM，支持 Excel 正确显示中文
   - CSV 包含 AI Platform 列，显示提示词所属的 AI 平台

4. **查看详情和编辑**
   - 点击列表中的 "View" 按钮
   - 可以查看完整的 prompt 信息
   - 可以编辑 tags 和 category
   - 可以删除 prompt

5. **查看统计**
   - 点击 "Show Stats" 按钮
   - 查看总数、来源分布、分类统计等

### 浏览器扩展

#### 安装

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

#### 支持的平台

- ChatGPT: `https://chat.openai.com` 或 `https://chatgpt.com`
- Claude: `https://claude.ai`
- Gemini: `https://gemini.google.com`
- Perplexity: `https://www.perplexity.ai`
- Qwen (通义千问): `https://qianwen.aliyun.com`
- Doubao (豆包): `https://www.doubao.com`

#### 使用

- 访问支持的 AI 平台
- 在输入框中输入 prompt
- 扩展会自动记录（等待 1-2 秒防抖延迟）
- 点击扩展图标可以查看连接状态和打开仪表板

### 编辑器扩展（VSCode/Cursor）

#### 安装

**开发模式：**
1. 在 VSCode/Cursor 中打开 `extension/editor` 目录
2. 按 `F5` 启动扩展开发窗口

**打包安装：**
```powershell
cd extension/editor
npm install
npm run compile
npm install -g @vscode/vsce
vsce package --allow-missing-repository
# 然后在 VSCode/Cursor 中安装生成的 .vsix 文件
```

#### 使用

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

### API 使用

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

#### 获取 Prompts

```powershell
# 获取所有
Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing

# 搜索
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?search=Python" -UseBasicParsing

# 按来源筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?source=manual" -UseBasicParsing

# 按 LLM 平台筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?llm=ChatGPT" -UseBasicParsing

# 按日期范围筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?startDate=2024-01-01&endDate=2024-12-31" -UseBasicParsing
```

#### 导出数据

```powershell
# 导出为 CSV（所有数据）
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/csv -UseBasicParsing -OutFile prompts.csv

# 导出为 CSV（筛选）
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts/export/csv?llm=ChatGPT&source=browser" -UseBasicParsing -OutFile prompts-filtered.csv

# 导出为 JSON
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/json -UseBasicParsing -OutFile prompts.json
```

#### 清除数据

```powershell
# 清除所有数据（需要确认）
.\scripts\clear-prompts.ps1

# 或使用 API
Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete
```

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
GET /api/prompts?search=query&source=browser&llm=ChatGPT&limit=50&offset=0&sortBy=timestamp&sortOrder=desc
```

**查询参数：**
- `search`: 搜索关键词（内容）
- `source`: 来源筛选（browser, cursor, vscode, manual）
- `llm`: LLM 平台筛选（ChatGPT, Claude, Gemini, Perplexity, Qwen, Doubao）
- `tags`: 标签筛选
- `category`: 分类筛选
- `startDate`: 开始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）
- `limit`: 每页数量（默认 50）
- `offset`: 偏移量（默认 0）
- `sortBy`: 排序字段（timestamp 或 id）
- `sortOrder`: 排序顺序（asc 或 desc）

### 导出数据
```http
GET /api/prompts/export/csv?search=query&source=browser&llm=ChatGPT
GET /api/prompts/export/json?search=query&source=browser&llm=ChatGPT
```

支持所有查询参数进行筛选导出。

## 项目结构

```
prompt_recorder/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── server.ts     # Express 服务器
│   │   ├── routes/       # API 路由
│   │   ├── db/           # 数据库操作
│   │   ├── models/      # 数据模型
│   │   └── utils/       # 工具函数
│   ├── data/            # SQLite 数据库文件（自动创建）
│   └── package.json
├── extension/
│   ├── browser/         # 浏览器扩展
│   │   ├── src/         # TypeScript 源码
│   │   ├── manifest.json
│   │   └── package.json
│   └── editor/          # 编辑器扩展
│       ├── src/         # TypeScript 源码
│       └── package.json
├── frontend/            # Web 界面
│   ├── src/
│   │   ├── components/  # React 组件
│   │   └── api/         # API 客户端
│   └── package.json
├── scripts/             # 脚本文件
│   ├── start-all.ps1    # 统一启动脚本
│   ├── setup-autostart.ps1  # 自动启动配置
│   └── clear-prompts.ps1    # 清除数据
├── package.json         # Workspace 配置
└── README.md            # 本文档
```

## 数据存储

所有数据存储在本地 SQLite 数据库中：

- **位置**: `backend/data/prompts.db`
- **格式**: SQLite 数据库文件
- **备份**: 可以复制 `prompts.db` 文件进行备份
- **迁移**: 可以将数据库文件复制到其他机器使用

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

### CSV 导出中文乱码

**问题**: 导出的 CSV 文件在 Excel 中显示乱码

**解决**:
- CSV 文件已包含 UTF-8 BOM，应该可以正确显示
- 如果仍有问题，在 Excel 中：数据 → 从文本/CSV → 选择文件 → 编码选择 UTF-8

### 自动启动不工作

**问题**: 重启后服务没有自动启动

**解决**:
1. 检查任务计划是否启用：
   ```powershell
   (Get-ScheduledTask -TaskName "PromptRecorder").State
   ```
2. 查看任务历史记录：
   - 打开 "任务计划程序" (`Win + R`，输入 `taskschd.msc`)
   - 找到 "PromptRecorder" 任务
   - 查看 "历史记录" 标签页
3. 手动测试启动脚本：
   ```powershell
   .\scripts\start-all.ps1
   ```

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

### 配置

#### 后端配置

后端默认运行在 `http://localhost:3001`，可通过环境变量修改：

```bash
PORT=3001  # 端口号
NODE_ENV=development  # 环境模式
```

#### 浏览器扩展配置

在 `extension/browser/src/config.ts` 中配置：
- `API_URL`: 后端 API 地址（默认: `http://localhost:3001/api/prompts`）
- `DEBOUNCE_DELAY`: 防抖延迟时间（毫秒）
- `MIN_CONTENT_LENGTH`: 最小内容长度

#### 编辑器扩展配置

在 VSCode/Cursor 设置中配置：
- `promptRecorder.apiUrl`: 后端 API 地址
- `promptRecorder.autoRecord`: 是否自动记录

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.1.0
- ✅ 添加筛选导出功能（时间段、关键字、途径、LLM名称）
- ✅ 支持更多 AI 平台（Qwen, Doubao）
- ✅ 修复开机自动启动脚本
- ✅ 完善 Cursor/VSCode 扩展功能
- ✅ CSV 导出支持 UTF-8 BOM 和 AI Platform 列

### v1.0.0
- ✅ 初始版本
- ✅ 后端 API 完整实现
- ✅ Web 界面
- ✅ 浏览器扩展
- ✅ 编辑器扩展
- ✅ 数据导出功能
