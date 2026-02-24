# Prompt Recorder - 安装指南

## 功能概述

1. ✅ **筛选导出功能**：支持按时间段、关键字、途径、LLM名称等条件筛选并导出
2. ✅ **开机自动启动**：后端服务开机自动启动
3. ✅ **Cursor/VSCode扩展**：在编辑器中记录AI提示词

## 安装步骤

### 1. 安装依赖

在项目根目录运行：

```powershell
npm run install:all
```

或者分别安装：

```powershell
cd backend
npm install

cd ../frontend
npm install

cd ../extension/editor
npm install
```

### 2. 编译代码

```powershell
# 编译后端
cd backend
npm run build

# 编译前端（可选，开发模式会自动编译）
cd ../frontend
npm run build

# 编译编辑器扩展
cd ../extension/editor
npm run compile
```

### 3. 设置开机自动启动

**以管理员身份运行 PowerShell**，然后执行：

```powershell
cd D:\garage\-prompt_recorder\-prompt_recorder
.\setup-autostart.ps1
```

脚本会：
- 创建启动脚本 `start-backend.ps1`
- 创建 Windows 任务计划，在登录时自动启动后端服务

**验证自动启动：**
```powershell
# 查看任务状态
Get-ScheduledTask -TaskName "PromptRecorderBackend"

# 手动测试启动脚本
.\start-backend.ps1
```

### 4. 安装浏览器扩展

1. 打开 Chrome/Edge 浏览器
2. 访问 `chrome://extensions/` 或 `edge://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension/browser` 目录

**注意：** 确保已编译浏览器扩展：
```powershell
cd extension/browser
npm run build
```

### 5. 安装 Cursor/VSCode 扩展

#### 方法一：开发模式（推荐用于测试）

1. 在 VSCode/Cursor 中打开 `extension/editor` 目录
2. 按 `F5` 启动扩展开发窗口
3. 在新窗口中测试扩展

#### 方法二：打包安装

1. 安装 `vsce`（如果未安装）：
```powershell
npm install -g @vscode/vsce
```

2. 打包扩展：
```powershell
cd extension/editor
vsce package
```

3. 在 VSCode/Cursor 中安装：
   - 打开命令面板 (`Ctrl+Shift+P`)
   - 输入 "Extensions: Install from VSIX..."
   - 选择生成的 `.vsix` 文件

### 6. 启动服务

#### 开发模式

```powershell
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端
cd frontend
npm run dev
```

#### 生产模式

```powershell
# 启动后端（如果已设置自动启动，则无需手动启动）
cd backend
npm start

# 前端需要构建后部署，或使用开发服务器
cd frontend
npm run dev
```

## 使用说明

### 前端筛选导出功能

1. 访问前端页面（默认 `http://localhost:5173`）
2. 使用筛选条件：
   - **关键字搜索**：在搜索框输入关键词
   - **途径（Source）**：选择 browser/cursor/vscode/manual
   - **LLM名称**：选择 ChatGPT/Claude/Gemini/Perplexity
   - **时间段**：选择开始和结束日期
   - **标签/分类**：输入标签或分类名称

3. 导出数据：
   - **All CSV/JSON**：导出所有数据
   - **Filtered CSV/JSON**：按当前筛选条件导出

### Cursor/VSCode 扩展使用

#### 手动记录提示词

1. 打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. 输入 "Record Prompt" 或 "Prompt Recorder: Record Prompt"
3. 在弹出的输入框中输入或粘贴提示词
4. 点击确定

#### 打开仪表板

1. 打开命令面板
2. 输入 "Open Dashboard" 或 "Prompt Recorder: Open Dashboard"
3. 浏览器会自动打开前端页面

#### 配置扩展

在 VSCode/Cursor 设置中搜索 "promptRecorder"：

- `promptRecorder.apiUrl`: 后端API地址（默认：`http://localhost:3001/api/prompts`）
- `promptRecorder.autoRecord`: 是否自动记录（默认：`true`）

**注意：** 由于 VSCode/Cursor 的 AI 功能可能不直接暴露 API，自动记录功能可能有限。建议使用手动记录命令。

## 故障排除

### 后端服务无法启动

1. 检查端口是否被占用：
```powershell
netstat -ano | findstr :3001
```

2. 检查 Node.js 是否安装：
```powershell
node --version
```

3. 检查依赖是否安装：
```powershell
cd backend
npm install
```

### 浏览器扩展无法加载

1. 检查扩展是否已编译：
```powershell
cd extension/browser
npm run build
```

2. 检查 `dist/content.bundle.js` 是否存在

3. 查看浏览器控制台错误信息

### Cursor/VSCode 扩展无法工作

1. 检查扩展是否已编译：
```powershell
cd extension/editor
npm run compile
```

2. 检查 `dist/extension.js` 是否存在

3. 检查后端服务是否运行：
```powershell
curl http://localhost:3001/health
```

4. 查看 VSCode/Cursor 输出面板（选择 "Prompt Recorder"）

### 开机自动启动不工作

1. 检查任务计划是否存在：
```powershell
Get-ScheduledTask -TaskName "PromptRecorderBackend"
```

2. 检查任务是否启用：
```powershell
Get-ScheduledTask -TaskName "PromptRecorderBackend" | Select-Object State
```

3. 手动运行启动脚本测试：
```powershell
.\start-backend.ps1
```

4. 查看任务历史记录：
```powershell
Get-WinEvent -LogName Microsoft-Windows-TaskScheduler/Operational | Where-Object {$_.Message -like "*PromptRecorder*"} | Select-Object -First 10
```

## 更新日志

### v1.1.0 (当前版本)

- ✅ 添加筛选导出功能（时间段、关键字、途径、LLM名称）
- ✅ 修复开机自动启动脚本
- ✅ 完善 Cursor/VSCode 扩展功能
- ✅ 添加 LLM 名称筛选

### v1.0.0

- ✅ 基础功能：记录、查看、导出提示词
- ✅ 浏览器扩展支持
- ✅ 前端 Web 界面
