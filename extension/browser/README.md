# Prompt Recorder - Browser Extension

浏览器扩展，自动记录您在 AI 平台上的 prompt。

## 安装

### 开发模式

1. 安装依赖
```bash
npm install
```

2. 编译 TypeScript
```bash
npm run build
```

3. 在 Chrome/Edge 中加载扩展
   - 打开 `chrome://extensions/` 或 `edge://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择此目录

## 配置

在 `src/config.ts` 中可以配置：
- 后端 API 地址
- 支持的 AI 平台
- 防抖延迟时间

## 支持的平台

- ChatGPT
- Claude
- Gemini
- Perplexity

## 使用

安装扩展后，访问支持的 AI 平台，扩展会自动记录您输入的 prompt。确保后端服务正在运行（默认 `http://localhost:3001`）。

## 故障排查

如果扩展无法记录 prompt，请查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 获取详细的故障排查指南。

### 快速检查

1. **后端服务是否运行？**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```

2. **查看浏览器控制台**
   - 按 `F12` 打开开发者工具
   - 切换到 "Console" 标签
   - 应该看到 "Prompt Recorder: Monitoring ..." 的日志

3. **检查网络请求**
   - 在开发者工具的 "Network" 标签中
   - 发送消息后应该看到对 `http://localhost:3001/api/prompts` 的请求

## 调试

扩展会在浏览器控制台输出详细的调试信息，包括：
- 平台检测
- 输入框查找
- 事件监听
- API 请求状态

如果看不到日志，请检查控制台过滤器设置。
