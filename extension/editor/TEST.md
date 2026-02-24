# Prompt Recorder 扩展测试指南

## 前置条件

1. **确保后端服务正在运行**
   ```powershell
   # 检查后端是否运行
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```
   应该返回：`{"status":"ok","timestamp":"..."}`

2. **如果后端未运行，启动它**
   ```powershell
   cd backend
   npm run dev
   ```

## 测试步骤

### 1. 验证扩展已激活

1. 在 Cursor/VSCode 中按 `Ctrl+Shift+U` 打开输出面板
2. 在下拉菜单中选择 "Log (Extension Host)"
3. 应该能看到类似这样的日志：
   ```
   Prompt Recorder extension is now active
   ```

### 2. 测试手动记录 Prompt

1. **打开命令面板**
   - 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)

2. **输入命令**
   - 输入 "Record Prompt" 或 "Prompt Recorder: Record Prompt"
   - 选择该命令

3. **输入测试内容**
   - 在弹出的输入框中输入测试内容，例如：
     ```
     帮我写一个Python函数来计算斐波那契数列
     ```
   - 点击确定或按 Enter

4. **验证记录成功**
   - 应该看到成功提示："✅ Prompt recorded successfully"
   - 如果失败，会显示错误信息

### 3. 测试打开仪表板

1. **打开命令面板**
   - 按 `Ctrl+Shift+P`

2. **输入命令**
   - 输入 "Open Dashboard" 或 "Prompt Recorder: Open Dashboard"
   - 选择该命令

3. **验证**
   - 应该自动在浏览器中打开 `http://localhost:3000`
   - 在 Web 界面中应该能看到刚才记录的 prompt

### 4. 验证数据已保存

1. **在 Web 界面中检查**
   - 打开 `http://localhost:3000`
   - 应该能看到刚才记录的 prompt
   - source 应该显示为 "cursor" 或 "vscode"

2. **或者通过 API 检查**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing
   ```

### 5. 测试配置

1. **打开设置**
   - 按 `Ctrl+,` 打开设置
   - 搜索 "promptRecorder"

2. **检查配置项**
   - `promptRecorder.apiUrl`: 应该是 `http://localhost:3001/api/prompts`
   - `promptRecorder.autoRecord`: 是否启用自动记录

3. **修改配置测试**
   - 可以修改 `apiUrl` 测试错误处理
   - 修改后需要重新加载窗口才能生效

## 故障排除

### 问题：命令找不到

**解决方案：**
1. 确认扩展已安装并启用
2. 按 `Ctrl+Shift+P`，输入 "Reload Window" 重新加载窗口
3. 如果还是不行，重启 Cursor/VSCode

### 问题：记录失败，显示连接错误

**解决方案：**
1. 检查后端服务是否运行：
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```
2. 检查扩展配置中的 `apiUrl` 是否正确
3. 查看输出日志中的错误信息

### 问题：打开仪表板失败

**解决方案：**
1. 确认前端服务正在运行（`http://localhost:3000`）
2. 如果前端未运行，启动它：
   ```powershell
   cd frontend
   npm run dev
   ```

### 问题：扩展没有自动激活

**解决方案：**
1. 查看输出日志（`Ctrl+Shift+U` -> "Log (Extension Host)"）
2. 检查是否有错误信息
3. 尝试重新加载窗口（`Ctrl+Shift+P` -> "Reload Window"）
4. 如果还是不行，重启 Cursor/VSCode

## 完整测试流程

1. ✅ 启动后端服务
2. ✅ 启动前端服务（可选，用于查看数据）
3. ✅ 在 Cursor/VSCode 中验证扩展已激活
4. ✅ 测试手动记录功能
5. ✅ 测试打开仪表板功能
6. ✅ 在 Web 界面中验证数据已保存
7. ✅ 测试配置功能

## 预期结果

- ✅ 扩展在 Cursor/VSCode 启动时自动激活
- ✅ "Record Prompt" 命令可以正常使用
- ✅ "Open Dashboard" 命令可以正常使用
- ✅ 记录的 prompt 可以保存到后端
- ✅ 在 Web 界面中可以查看记录的 prompt
