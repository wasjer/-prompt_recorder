# Prompt Recorder - Editor Extension

VSCode/Cursor 扩展，记录编辑器中的 AI 对话。

## 安装

### 开发模式

1. 安装依赖
```bash
npm install
```

2. 编译 TypeScript
```bash
npm run compile
```

3. 在 VSCode/Cursor 中按 `F5` 打开扩展开发窗口

### 打包安装

```bash
npm install -g vsce
vsce package
```

然后在 VSCode/Cursor 中安装生成的 `.vsix` 文件。

## 配置

在 VSCode/Cursor 设置中配置：
- `promptRecorder.apiUrl`: 后端 API 地址
- `promptRecorder.autoRecord`: 是否自动记录

## 使用

### 手动记录

1. 使用命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. 输入 "Record Prompt"
3. 输入或粘贴要记录的 prompt

### 打开仪表板

使用命令 "Open Dashboard" 打开 Web 界面查看所有记录的 prompt。

## 注意事项

由于 VSCode/Cursor 的 AI 功能可能不直接暴露 API，自动记录功能可能有限。建议使用手动记录命令。
