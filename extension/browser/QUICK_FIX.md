# 快速修复指南

## 问题：控制台看不到 "Prompt Recorder" 日志

如果控制台中没有看到任何 "Prompt Recorder" 的日志，说明 content script 没有加载。

### 解决步骤

1. **重新编译扩展**
   ```bash
   cd extension/browser
   npm run build
   ```

2. **重新加载扩展**
   - 打开 `chrome://extensions/`
   - 找到 "Prompt Recorder"
   - 点击刷新图标（或先禁用再启用）

3. **刷新页面**
   - 完全关闭 ChatGPT/Gemini 标签页
   - 重新打开页面
   - 按 F12 打开控制台
   - 应该立即看到：`Prompt Recorder: Content script initialized`

4. **检查扩展是否正确加载**
   - 在扩展管理页面，点击 "详情"
   - 查看是否有错误信息
   - 检查 "Service Worker" 状态

5. **手动测试 content script**
   在浏览器控制台运行：
   ```javascript
   // 检查 content script 是否加载
   console.log('Manual test: Content script check');
   
   // 检查平台检测
   const hostname = window.location.hostname;
   console.log('Hostname:', hostname);
   console.log('Is ChatGPT?', hostname.includes('openai.com') || hostname.includes('chatgpt.com'));
   console.log('Is Gemini?', hostname.includes('gemini.google.com'));
   ```

### 如果仍然没有日志

1. **检查 manifest.json 的 URL 匹配**
   - 确保当前页面的 URL 匹配 manifest.json 中的 patterns
   - ChatGPT: `chat.openai.com` 或 `chatgpt.com`
   - Gemini: `gemini.google.com`

2. **检查 dist/content.js 是否存在**
   ```bash
   ls extension/browser/dist/content.js
   ```

3. **查看扩展错误**
   - 在扩展管理页面点击 "检查视图 Service Worker"
   - 查看是否有错误

4. **尝试重新安装扩展**
   - 移除扩展
   - 重新加载扩展目录
