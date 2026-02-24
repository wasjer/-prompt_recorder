# Prompt Recorder - Editor Extension 安装指南

## 重要说明

编辑器扩展应该**随 Cursor/VSCode 自动启动**，不需要每次手动打开。扩展配置了 `onStartupFinished` 激活事件，会在编辑器启动时自动激活。

## 安装方法

### ⚠️ 重要提示

**不要直接复制 Markdown 文档中的代码块到 PowerShell！**

代码块中的 ```powershell 和 ``` 是 Markdown 语法标记，不是 PowerShell 命令。只复制代码块中的实际命令。

### 方法一：使用安装脚本（最简单）

直接运行安装脚本：

```powershell
cd extension/editor
.\install.ps1
```

脚本会自动完成所有步骤。

### 方法二：手动打包安装（推荐用于生产环境）

1. **编译扩展**
   
   在 PowerShell 中执行（**只复制命令，不要复制 ``` 标记**）：
   ```powershell
   cd extension/editor
   npm install
   npm run compile
   ```

2. **打包扩展**
   
   在 PowerShell 中执行：
   ```powershell
   npm install -g @vscode/vsce
   vsce package
   ```
   这会生成一个 `.vsix` 文件，例如：`prompt-recorder-editor-1.0.0.vsix`

3. **在 Cursor/VSCode 中安装**
   - 打开 Cursor/VSCode
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 点击右上角的 `...` 菜单
   - 选择 "Install from VSIX..."
   - 选择生成的 `.vsix` 文件
   - 安装完成后，**重启 Cursor/VSCode**

4. **验证安装**
   - 重启后，扩展会自动激活
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "Record Prompt"，应该能看到命令
   - 输入 "Open Dashboard"，应该能看到命令

### 方法二：开发模式（用于开发和测试）

1. **编译扩展**
   ```powershell
   cd extension/editor
   npm install
   npm run compile
   ```

2. **在 Cursor/VSCode 中打开扩展目录**
   - 打开 Cursor/VSCode
   - File -> Open Folder
   - 选择 `extension/editor` 目录

3. **启动调试**
   - 按 `F5` 或点击左侧调试图标
   - 选择 "Run Extension"
   - 会打开一个新的 Cursor/VSCode 窗口（扩展开发宿主）
   - 在新窗口中测试扩展功能

## 使用

### 手动记录 Prompt

1. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Record Prompt"
3. 在弹出的输入框中输入或粘贴 prompt
4. 点击确定

### 打开仪表板

1. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Open Dashboard"
3. 会在浏览器中打开 Web 界面

## 配置

在 Cursor/VSCode 设置中配置：

- `promptRecorder.apiUrl`: 后端 API 地址（默认：`http://localhost:3001/api/prompts`）
- `promptRecorder.autoRecord`: 是否自动记录（默认：`true`）

## 故障排除

### 扩展没有自动激活

1. **检查扩展是否已安装**
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 搜索 "Prompt Recorder"
   - 确认扩展已安装并启用

2. **检查激活事件**
   - 扩展配置了 `onStartupFinished`，应该在编辑器启动后自动激活
   - 如果未激活，尝试重启编辑器

3. **查看输出日志**
   - 按 `Ctrl+Shift+U` 打开输出面板
   - 选择 "Log (Extension Host)"
   - 查看是否有错误信息

### 命令找不到

1. **确认扩展已激活**
   - 查看输出日志确认扩展已加载
   - 如果未激活，重启编辑器

2. **重新加载窗口**
   - 按 `Ctrl+Shift+P`
   - 输入 "Reload Window"
   - 重新加载后扩展应该激活

### 无法连接到后端

1. **确认后端服务正在运行**
   - 访问 `http://localhost:3001/health`
   - 应该返回 `{"status":"ok"}`

2. **检查 API URL 配置**
   - 打开设置 (`Ctrl+,`)
   - 搜索 "promptRecorder.apiUrl"
   - 确认 URL 正确

## 注意事项

- 扩展会在 Cursor/VSCode 启动时自动激活，无需手动操作
- 如果使用开发模式（F5），扩展只在开发窗口中运行
- 生产环境建议使用打包安装方式
- 自动记录功能受 VSCode/Cursor API 限制，可能无法完全自动捕获所有 AI 对话
