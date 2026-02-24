# Prompt Recorder 扩展故障排除

## 错误：command 'promptRecorder.recordPrompt' not found

### 原因
扩展虽然已安装，但没有正确激活，导致命令未注册。

### 解决方案

#### 方法 1：重新加载窗口（最简单）

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Reload Window"
3. 选择 "Developer: Reload Window"
4. 等待窗口重新加载
5. 再次尝试使用 "Record Prompt" 命令

#### 方法 2：重启 Cursor/VSCode

1. 完全关闭 Cursor/VSCode
2. 重新打开 Cursor/VSCode
3. 等待扩展自动激活（通常需要几秒钟）
4. 尝试使用命令

#### 方法 3：检查扩展是否激活

1. 按 `Ctrl+Shift+U` 打开输出面板
2. 在下拉菜单中选择 "Log (Extension Host)"
3. 查找是否有 "Prompt Recorder extension is now active" 的日志
4. 如果没有，说明扩展未激活

#### 方法 4：重新安装扩展

如果以上方法都不行，可能需要重新安装：

1. 按 `Ctrl+Shift+X` 打开扩展面板
2. 找到 "Prompt Recorder" 扩展
3. 点击 "卸载" 按钮
4. 重新安装 `.vsix` 文件：
   - 点击扩展面板右上角的 `...` 菜单
   - 选择 "Install from VSIX..."
   - 选择 `prompt-recorder-editor-1.0.0.vsix` 文件
5. 重启 Cursor/VSCode

#### 方法 5：检查扩展输出日志

1. 按 `Ctrl+Shift+U` 打开输出面板
2. 在下拉菜单中选择 "Log (Extension Host)"
3. 查看是否有错误信息
4. 常见的错误：
   - 模块加载失败
   - API 客户端初始化失败
   - 后端连接失败

### 验证扩展是否正常工作

扩展激活后，你应该能看到：

1. **启动消息**（可选）：
   - "Prompt Recorder is active. Use 'Record Prompt' command to manually record prompts."

2. **输出日志**：
   - 在 "Log (Extension Host)" 中看到 "Prompt Recorder extension is now active"

3. **命令可用**：
   - 按 `Ctrl+Shift+P`
   - 输入 "Record Prompt"，应该能找到命令

### 常见问题

#### Q: 扩展安装后没有反应？

A: 扩展使用 `onStartupFinished` 激活事件，会在 Cursor/VSCode 启动后自动激活。如果未激活，尝试重新加载窗口。

#### Q: 命令找到了，但执行失败？

A: 检查后端服务是否运行：
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

#### Q: 扩展一直无法激活？

A: 
1. 检查扩展的 `package.json` 中的 `main` 字段是否正确指向 `./dist/extension.js`
2. 检查 `dist/extension.js` 文件是否存在
3. 查看输出日志中的错误信息

### 获取帮助

如果以上方法都无法解决问题，请：
1. 查看输出日志（`Ctrl+Shift+U` -> "Log (Extension Host)"）
2. 记录错误信息
3. 检查后端服务是否正常运行
