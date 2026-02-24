# 浏览器扩展故障排查

## 问题：发送消息后没有记录

### 检查步骤

#### 1. 检查后端服务是否运行

打开浏览器控制台（F12），查看是否有错误信息。

**测试后端连接：**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

应该返回：`{"status":"ok","timestamp":"..."}`

如果后端未运行：
```bash
npm run dev:backend
```

#### 2. 检查扩展是否正确加载

1. 打开扩展管理页面：`chrome://extensions/`
2. 找到 "Prompt Recorder" 扩展
3. 确保扩展已启用（开关是蓝色）
4. 点击"详情"查看扩展信息

#### 3. 检查控制台日志

1. 访问 ChatGPT 或 Gemini
2. 按 `F12` 打开开发者工具
3. 切换到 "Console" 标签
4. 应该看到类似这样的日志：
   ```
   Prompt Recorder: Monitoring ChatGPT
   Prompt Recorder: Setting up listeners...
   Prompt Recorder: Input element found and marked
   ```

5. 在输入框中输入内容，应该看到：
   ```
   Prompt Recorder: Input event detected
   Prompt Recorder: Attempting to record prompt...
   ```

6. 点击发送按钮，应该看到：
   ```
   Prompt Recorder: Send button clicked
   Prompt Recorder: Submit event detected
   ✅ Prompt Recorder: Successfully recorded prompt: ...
   ```

#### 4. 检查网络请求

1. 在开发者工具中切换到 "Network" 标签
2. 发送一条消息
3. 应该看到对 `http://localhost:3001/api/prompts` 的 POST 请求
4. 检查请求状态：
   - ✅ 200/201: 成功
   - ❌ CORS 错误: 检查后端 CORS 配置
   - ❌ 连接失败: 后端未运行

#### 5. 常见问题

**问题 1: CORS 错误**
```
Access to fetch at 'http://localhost:3001/api/prompts' from origin 'https://chat.openai.com' has been blocked by CORS policy
```

**解决**: 确保后端服务正在运行，并且 CORS 已正确配置。

**问题 2: 找不到输入框**
```
Prompt Recorder: Could not find input element
```

**解决**: 
- 刷新页面
- 等待页面完全加载
- 某些 AI 平台使用动态加载，可能需要等待几秒

**问题 3: 后端连接失败**
```
Network error - Is the backend running at http://localhost:3001?
```

**解决**: 
1. 启动后端服务：`npm run dev:backend`
2. 验证后端运行：访问 `http://localhost:3001/health`

**问题 4: 内容太短**
```
Prompt Recorder: Content too short, skipping
```

**解决**: 这是正常的，系统只记录长度超过 10 个字符的内容。

#### 6. 手动测试

在浏览器控制台中运行：

```javascript
// 测试后端连接
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// 手动发送测试 prompt
fetch('http://localhost:3001/api/prompts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Test prompt from console',
    source: 'manual'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

#### 7. 重新加载扩展

如果以上步骤都正常，但依然无法记录：

1. 在扩展管理页面，点击扩展的"刷新"图标
2. 或者禁用后重新启用扩展
3. 刷新 AI 平台页面

#### 8. 检查扩展文件

确保扩展已正确编译：

```bash
cd extension/browser
npm run build
```

检查 `dist` 目录中是否有以下文件：
- `content.js`
- `background.js`
- `config.js`
- `apiClient.js`

## 调试模式

扩展会在控制台输出详细的调试信息。如果看不到任何日志：

1. 检查控制台过滤器设置
2. 确保没有过滤掉 "Prompt Recorder" 的日志
3. 尝试清除控制台并重新加载页面

## 获取帮助

如果问题依然存在，请提供以下信息：

1. 浏览器控制台的完整错误信息
2. Network 标签中的请求详情
3. 后端服务的日志输出
4. 使用的 AI 平台（ChatGPT, Gemini 等）
