# Prompt Recorder

记录所有给 AI 发出的 prompt 或者给 agent 发出的指令。

## 功能特性

- 🔍 自动收集浏览器和编辑器中的 AI 对话
- 📊 SQLite 数据库存储
- 🔎 强大的搜索和过滤（来源、标签、分类、时间、LLM 平台）
- 📤 导出为 CSV/JSON（支持筛选条件）
- 🚀 Windows 开机自动启动

## 快速开始

### 安装

```bash
git clone https://github.com/wasjer/-prompt_recorder.git
cd -prompt_recorder
npm run install:all
```

### 启动

**生产模式（推荐）：**
```powershell
.\scripts\start-all.ps1
```
访问：`http://localhost:3001`

**开发模式：**
```bash
# 终端1：后端
cd backend && npm run dev

# 终端2：前端
cd frontend && npm run dev
```

### 自动启动（Windows）

以管理员身份运行：
```powershell
.\scripts\setup-autostart.ps1
```

## 使用

### Web 界面

访问 `http://localhost:3001`，支持：
- 搜索和过滤（关键字、来源、LLM、时间、标签、分类）
- 导出数据（All/Filtered CSV/JSON）
- 查看统计和编辑记录

### 浏览器扩展

1. 编译：`cd extension/browser && npm run build`
2. 在 Chrome/Edge 中加载 `extension/browser` 目录

#### 支持的平台

- ChatGPT: `https://chat.openai.com` 或 `https://chatgpt.com`
- Claude: `https://claude.ai`
- Gemini: `https://gemini.google.com`
- Perplexity: `https://www.perplexity.ai`
- Qwen (通义千问): `https://qianwen.aliyun.com`
- Doubao (豆包): `https://www.doubao.com`

### 编辑器扩展（VSCode/Cursor）

1. 打开 `extension/editor` 目录
2. 按 `F5` 启动扩展开发窗口
3. 使用命令 "Record Prompt" 记录提示词

## API 示例

```powershell
# 创建
$body = @{content="test"; source="manual"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/prompts -Method POST -Body $body -ContentType "application/json"

# 搜索
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?search=Python&llm=ChatGPT"

# 导出
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/csv -OutFile prompts.csv
```

## 项目结构

```
prompt_recorder/
├── backend/          # Node.js + Express + SQLite
├── frontend/         # React + TypeScript
├── extension/
│   ├── browser/     # 浏览器扩展
│   └── editor/       # 编辑器扩展
└── scripts/          # 启动和配置脚本
```

## 常见问题

**端口被占用：**
```powershell
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

**自动启动不工作：**
```powershell
Get-ScheduledTask -TaskName "PromptRecorder"
.\scripts\start-all.ps1  # 手动测试
```

**数据位置：** `backend/data/prompts.db`

## 许可证

MIT License
