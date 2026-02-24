# 测试指南

本文档介绍如何测试 Prompt Recorder 系统的各个组件。

## 前置条件

1. 确保后端服务正在运行：
   ```powershell
   npm run dev:backend
   ```
   应该看到：`🚀 Prompt Recorder Backend running on http://localhost:3001`

2. 确保前端服务正在运行（新终端）：
   ```powershell
   npm run dev:frontend
   ```
   应该看到：`Local: http://localhost:3000`

## 1. 测试后端 API

### 1.1 健康检查

```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

应该返回：
```json
{"status":"ok","timestamp":"2026-02-10T08:12:32.394Z"}
```

### 1.2 创建 Prompt

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

应该返回创建的 prompt 对象，包含 `id`、`timestamp` 等字段。

### 1.3 获取所有 Prompts

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing
```

应该返回：
```json
{
  "prompts": [...],
  "total": 1
}
```

### 1.4 搜索 Prompts

```powershell
# 按内容搜索
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?search=Python" -UseBasicParsing

# 按来源筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?source=manual" -UseBasicParsing

# 按标签筛选
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts?tags=python" -UseBasicParsing
```

### 1.5 获取单个 Prompt

```powershell
# 替换 {id} 为实际的 prompt ID
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/1 -UseBasicParsing
```

### 1.6 更新 Prompt

```powershell
$body = @{
    tags = "python,算法,测试"
    category = "编程示例"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/prompts/1 `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

### 1.7 获取统计信息

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/stats/summary -UseBasicParsing
```

应该返回：
```json
{
  "total": 1,
  "bySource": [...],
  "byCategory": [...],
  "recent": 1
}
```

### 1.8 导出数据

```powershell
# 导出为 CSV
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/csv -UseBasicParsing -OutFile prompts.csv

# 导出为 JSON
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/export/json -UseBasicParsing -OutFile prompts.json
```

### 1.9 删除 Prompt

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/prompts/1 -Method DELETE -UseBasicParsing
```

## 2. 测试前端 Web 界面

### 2.1 访问界面

1. 打开浏览器访问：`http://localhost:3000`
2. 应该看到 Prompt Recorder 的主界面

### 2.2 测试功能

#### 查看统计面板
- 点击 "Show Stats" 按钮
- 应该显示总 prompt 数、来源分布、分类统计等

#### 创建 Prompt（通过 API 或手动）
- 使用上面的 API 测试创建几个 prompt
- 刷新页面，应该看到新创建的 prompt

#### 搜索功能
- 在搜索框输入关键词（如 "Python"）
- 点击 "Search" 按钮
- 应该只显示匹配的 prompts

#### 过滤功能
- 使用 "Source" 下拉菜单选择来源
- 使用 "Tags" 输入框过滤标签
- 使用 "Category" 输入框过滤分类
- 使用日期范围选择器过滤时间

#### 排序功能
- 选择不同的排序方式（Timestamp/ID）
- 选择排序顺序（Ascending/Descending）

#### 查看详情
- 点击列表中的 "View" 按钮
- 应该弹出详情对话框，显示完整的 prompt 信息

#### 编辑 Prompt
- 在详情对话框中点击 "Edit"
- 修改 tags 或 category
- 点击 "Save"
- 刷新列表，应该看到更新

#### 删除 Prompt
- 在详情对话框中点击 "Delete"
- 确认删除
- 刷新列表，该 prompt 应该消失

#### 导出功能
- 点击 "Export CSV" 按钮
- 应该下载 `prompts.csv` 文件
- 点击 "Export JSON" 按钮
- 应该下载 `prompts.json` 文件

## 3. 测试浏览器扩展

### 3.1 安装扩展

1. 进入 `extension/browser` 目录
2. 编译 TypeScript：
   ```powershell
   npm run build
   ```
3. 在 Chrome/Edge 中打开扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
4. 启用"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择 `extension/browser` 目录

### 3.2 测试扩展

#### 检查连接状态
1. 点击扩展图标
2. 应该显示后端连接状态（✅ Connected 或 ❌ Backend not connected）

#### 测试自动记录
1. 访问 ChatGPT: `https://chat.openai.com`
2. 在输入框中输入一个 prompt（如 "解释一下量子计算"）
3. 等待 1-2 秒（防抖延迟）
4. 打开 Web 界面，应该看到新记录的 prompt，source 为 "browser"

#### 测试其他 AI 平台
- Claude: `https://claude.ai`
- Gemini: `https://gemini.google.com`
- Perplexity: `https://www.perplexity.ai`

#### 打开仪表板
1. 点击扩展图标
2. 点击 "Open Dashboard" 按钮
3. 应该在新标签页打开 Web 界面

## 4. 测试编辑器扩展

### 4.1 安装扩展

1. 进入 `extension/editor` 目录
2. 编译 TypeScript：
   ```powershell
   npm run compile
   ```
3. 在 VSCode/Cursor 中：
   - 按 `F5` 打开扩展开发窗口
   - 或使用 `vsce package` 打包为 `.vsix` 文件安装

### 4.2 测试扩展

#### 手动记录 Prompt
1. 在 VSCode/Cursor 中按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Record Prompt"
3. 在弹出的输入框中输入或粘贴 prompt
4. 应该显示成功消息："✅ Prompt recorded successfully"
5. 打开 Web 界面，应该看到新记录的 prompt，source 为 "cursor" 或 "vscode"

#### 打开仪表板
1. 使用命令面板 (`Ctrl+Shift+P`)
2. 输入 "Open Dashboard"
3. 应该打开 Web 界面

#### 配置检查
1. 打开设置 (`Ctrl+,`)
2. 搜索 "promptRecorder"
3. 检查配置项：
   - `promptRecorder.apiUrl`: 应该是 `http://localhost:3001/api/prompts`
   - `promptRecorder.autoRecord`: 是否启用自动记录

## 5. 端到端测试流程

### 完整测试场景

1. **启动服务**
   ```powershell
   # 终端 1: 启动后端
   npm run dev:backend
   
   # 终端 2: 启动前端
   npm run dev:frontend
   ```

2. **通过浏览器扩展记录**
   - 访问 ChatGPT
   - 输入 prompt
   - 在 Web 界面查看记录

3. **通过编辑器扩展记录**
   - 在 Cursor/VSCode 中使用命令记录 prompt
   - 在 Web 界面查看记录

4. **通过 API 手动记录**
   - 使用 PowerShell 脚本创建 prompt
   - 在 Web 界面查看记录

5. **在 Web 界面管理**
   - 搜索和过滤
   - 编辑 tags 和 category
   - 查看统计信息
   - 导出数据

6. **验证数据持久化**
   - 停止后端服务
   - 重新启动后端服务
   - 数据应该仍然存在

## 6. 常见问题排查

### 后端无法启动
- 检查端口 3001 是否被占用
- 检查数据库文件权限
- 查看控制台错误信息

### 前端无法连接后端
- 确认后端服务正在运行
- 检查 `vite.config.ts` 中的代理配置
- 检查浏览器控制台的网络请求

### 扩展无法记录
- 检查后端服务是否运行
- 检查扩展的 API URL 配置
- 查看浏览器控制台的错误信息
- 确认扩展已正确安装和启用

### 数据丢失
- 检查 `backend/data/prompts.db` 文件是否存在
- 检查文件权限
- 查看后端日志

## 7. 性能测试

### 大量数据测试

```powershell
# 创建 100 个测试 prompt
1..100 | ForEach-Object {
    $body = @{
        content = "Test prompt $_ - $(Get-Date)"
        source = "manual"
        tags = "test"
        category = "测试"
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri http://localhost:3001/api/prompts `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing | Out-Null
    
    Write-Host "Created prompt $_"
}
```

然后测试：
- 列表加载速度
- 搜索性能
- 过滤性能
- 导出性能

## 8. 自动化测试脚本

创建一个 PowerShell 测试脚本：

```powershell
# test-api.ps1
Write-Host "Testing Prompt Recorder API..." -ForegroundColor Green

# 健康检查
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
Write-Host "✅ Health check passed" -ForegroundColor Green

# 创建 prompt
Write-Host "`n2. Creating prompt..." -ForegroundColor Yellow
$body = @{
    content = "测试 prompt - $(Get-Date)"
    source = "manual"
    tags = "测试,自动化"
    category = "测试"
} | ConvertTo-Json

$create = Invoke-WebRequest -Uri http://localhost:3001/api/prompts `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing

$prompt = $create.Content | ConvertFrom-Json
Write-Host "✅ Created prompt ID: $($prompt.id)" -ForegroundColor Green

# 获取所有 prompts
Write-Host "`n3. Getting all prompts..." -ForegroundColor Yellow
$all = Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing
Write-Host "✅ Retrieved prompts" -ForegroundColor Green

# 获取统计
Write-Host "`n4. Getting statistics..." -ForegroundColor Yellow
$stats = Invoke-WebRequest -Uri http://localhost:3001/api/prompts/stats/summary -UseBasicParsing
Write-Host "✅ Retrieved statistics" -ForegroundColor Green

Write-Host "`n✅ All tests passed!" -ForegroundColor Green
```

运行测试：
```powershell
.\test-api.ps1
```
