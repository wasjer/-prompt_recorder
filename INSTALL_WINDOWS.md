# Windows 安装说明

## 问题

`better-sqlite3` 需要 Visual Studio Build Tools 来编译原生模块，这在 Windows 上可能很麻烦。

## 解决方案

我们已经将数据库库替换为 `sql.js`，这是一个纯 JavaScript 的 SQLite 实现，**不需要任何编译工具**。

## 安装步骤

1. **清理之前的安装**（如果之前安装失败）：
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force extension/browser/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force extension/editor/node_modules -ErrorAction SilentlyContinue
```

2. **重新安装依赖**：
```powershell
npm run install:all
```

现在应该可以成功安装了！

## 如果仍然遇到问题

### 选项 1：单独安装每个工作区

```powershell
cd backend
npm install
cd ../frontend
npm install
cd ../extension/browser
npm install
cd ../editor
npm install
```

### 选项 2：使用 yarn（如果 npm 有问题）

```powershell
npm install -g yarn
yarn install
```

## 验证安装

安装完成后，尝试启动后端：

```powershell
cd backend
npm run dev
```

如果看到 "🚀 Prompt Recorder Backend running on http://localhost:3001"，说明安装成功！

## 性能说明

`sql.js` 是纯 JavaScript 实现，性能可能略低于 `better-sqlite3`，但对于个人使用的 prompt 记录系统来说完全足够。优点是：
- ✅ 无需编译工具
- ✅ 跨平台兼容
- ✅ 易于安装和部署
