# 扩展修复指南

## 问题：控制台显示 "Cannot use import statement outside a module"

这个问题已经修复！现在需要重新编译和加载扩展。

## 修复步骤

### 1. 重新编译扩展

```bash
cd extension/browser
npm run build
```

这会：
- 编译 TypeScript 为 JavaScript
- 将所有模块打包成一个文件 `content.bundle.js`

### 2. 重新加载扩展

1. 打开 `chrome://extensions/`
2. 找到 "Prompt Recorder" 扩展
3. **点击刷新图标**（或先禁用再启用）
4. 确保扩展已启用

### 3. 刷新页面

1. **完全关闭** ChatGPT/Gemini 标签页
2. **重新打开**页面
3. 按 `F12` 打开开发者工具
4. 切换到 "Console" 标签

### 4. 验证修复

应该立即看到：
```
Prompt Recorder: Content script loaded
Prompt Recorder: Content script initialized
Prompt Recorder: Current URL: ...
Prompt Recorder: Hostname: ...
Prompt Recorder: Monitoring ChatGPT (或 Gemini)
```

**不应该再看到**：
- ❌ "Cannot use import statement outside a module"
- ❌ "require is not defined"

### 5. 测试功能

1. 在输入框中输入内容
2. 应该看到：`Prompt Recorder: Input event detected`
3. 点击发送按钮
4. 应该看到：`Prompt Recorder: Send button clicked`
5. 应该看到：`✅ Prompt Recorder: Successfully recorded prompt: ...`

## 如果仍然有问题

### 检查文件是否存在

```bash
# 检查打包文件
ls extension/browser/dist/content.bundle.js
```

### 检查 manifest.json

确保 manifest.json 中使用的是 `content.bundle.js`：

```json
"js": ["dist/content.bundle.js"]
```

### 清除浏览器缓存

1. 关闭所有 ChatGPT/Gemini 标签页
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 重新打开页面

### 完全重新安装扩展

1. 在扩展管理页面移除扩展
2. 重新加载扩展目录
3. 刷新页面

## 技术说明

**问题原因**：
- TypeScript 编译后使用了 ES6 模块语法（`import`/`export`）
- 浏览器扩展的 content script 不支持 ES6 模块
- 也不支持 Node.js 的 `require()`

**解决方案**：
- 使用 CommonJS 编译 TypeScript
- 使用打包脚本将所有模块合并成一个文件
- 使用 IIFE（立即执行函数）包装，避免全局污染
