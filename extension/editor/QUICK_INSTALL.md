# 快速安装指南

## ⚠️ 重要提示

**不要直接复制 Markdown 文档中的代码块到 PowerShell！**

Markdown 文档中的代码块包含 ```powershell 和 ``` 这样的语法标记，这些不是 PowerShell 命令。

## ✅ 正确的安装方法

### 方法一：使用安装脚本（推荐）

直接运行安装脚本：

```powershell
cd extension/editor
.\install.ps1
```

脚本会自动完成所有步骤，并生成 `.vsix` 文件。

### 方法二：手动执行命令

如果脚本无法运行，可以手动执行以下命令（**只复制命令，不要复制代码块标记**）：

1. **安装依赖**
   ```
   cd extension/editor
   npm install
   ```

2. **编译代码**
   ```
   npm run compile
   ```

3. **安装打包工具（如果未安装）**
   ```
   npm install -g @vscode/vsce
   ```

4. **打包扩展**
   ```
   vsce package
   ```

5. **在 Cursor/VSCode 中安装**
   - 打开 Cursor/VSCode
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 点击右上角的 `...` 菜单
   - 选择 "Install from VSIX..."
   - 选择生成的 `.vsix` 文件
   - **重启 Cursor/VSCode**

## 常见错误

### 错误：无法将"```powershell"项识别为 cmdlet

**原因**：你复制了 Markdown 代码块的标记（```powershell 和 ```）

**解决**：只复制代码块中的实际命令，不要复制 ``` 标记

### 错误：找不到 vsce 命令

**解决**：运行 `npm install -g @vscode/vsce` 安装打包工具

### 错误：编译失败

**解决**：
1. 确保已安装 Node.js
2. 运行 `npm install` 安装依赖
3. 检查 `tsconfig.json` 配置是否正确

## 验证安装

安装完成后，重启 Cursor/VSCode，然后：

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Record Prompt"，应该能看到命令
3. 输入 "Open Dashboard"，应该能看到命令

如果能看到这些命令，说明扩展已成功安装并激活！
