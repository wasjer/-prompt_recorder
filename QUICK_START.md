# Prompt Recorder - 快速启动指南

## 🚀 一键配置自动启动（推荐）

### 步骤 1：以管理员身份运行 PowerShell

1. 按 `Win + X`
2. 选择 "Windows PowerShell (管理员)" 或 "终端 (管理员)"
3. 如果提示 UAC，点击 "是"

### 步骤 2：运行统一自动启动设置

```powershell
cd D:\garage\-prompt_recorder\-prompt_recorder
.\setup-autostart-all.ps1
```

这个脚本会：
- ✅ 配置前端自动构建
- ✅ 配置后端以生产模式自动启动
- ✅ 前端通过后端在 `http://localhost:3001` 提供服务
- ✅ 创建 Windows 计划任务，开机自动启动

### 步骤 3：验证配置

设置完成后，可以立即测试：

```powershell
.\start-all.ps1
```

等待 10-20 秒后，访问：`http://localhost:3001`

## 📋 工作原理

### 生产模式配置

- **前端**：构建为静态文件（`frontend/dist`）
- **后端**：以生产模式运行（`NODE_ENV=production`）
- **服务方式**：后端同时提供 API 和前端静态文件
- **访问地址**：`http://localhost:3001`

### 自动启动流程

每次登录 Windows 时：
1. 触发计划任务 "PromptRecorder"
2. 自动构建前端（如果代码有更新）
3. 以生产模式启动后端
4. 后端服务前端静态文件
5. 可通过 `http://localhost:3001` 访问

## 🛠️ 手动启动（如果需要）

如果自动启动未配置或需要手动启动：

```powershell
.\start-all.ps1
```

这个脚本会：
1. 检查并安装前端依赖（如果需要）
2. 构建前端
3. 检查并构建后端（如果需要）
4. 以生产模式启动后端

## 🔍 验证服务状态

### 检查后端服务

```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

如果返回 `StatusCode: 200`，说明服务正在运行。

### 检查前端界面

打开浏览器访问：`http://localhost:3001`

应该能看到 Prompt Recorder 的 Web 界面。

## ⚙️ 管理自动启动

### 查看计划任务

```powershell
Get-ScheduledTask -TaskName "PromptRecorder"
```

### 禁用自动启动

```powershell
# 以管理员身份运行
Unregister-ScheduledTask -TaskName "PromptRecorder" -Confirm:$false
```

### 重新启用自动启动

```powershell
# 以管理员身份运行
.\setup-autostart-all.ps1
```

## 📝 注意事项

1. **首次启动较慢**：首次启动需要构建前端，可能需要 30-60 秒
2. **后续启动较快**：如果代码未更新，构建会跳过，启动更快
3. **端口占用**：确保端口 3001 未被其他程序占用
4. **代码更新**：如果修改了前端代码，需要重新构建（自动启动脚本会自动处理）

## 🐛 故障排除

### 问题：访问 http://localhost:3001 显示连接错误

**检查步骤**：
1. 检查服务是否运行：
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```

2. 检查计划任务是否启用：
   ```powershell
   (Get-ScheduledTask -TaskName "PromptRecorder").State
   ```

3. 手动启动测试：
   ```powershell
   .\start-all.ps1
   ```

### 问题：前端界面显示但无法加载数据

**可能原因**：
- 后端 API 未正常启动
- 检查浏览器控制台的网络请求

**解决方法**：
1. 检查后端健康状态：
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```

2. 检查 API 端点：
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/api/prompts -UseBasicParsing
   ```

### 问题：启动失败

**检查步骤**：
1. 检查 Node.js 是否安装：
   ```powershell
   node --version
   ```

2. 检查依赖是否安装：
   ```powershell
   cd frontend
   Test-Path node_modules
   cd ..\backend
   Test-Path node_modules
   ```

3. 如果依赖缺失，手动安装：
   ```powershell
   cd frontend
   npm install
   cd ..\backend
   npm install
   ```

## ✨ 总结

配置完成后，你只需要：
1. ✅ 重启电脑
2. ✅ 登录后等待 10-20 秒
3. ✅ 打开浏览器访问 `http://localhost:3001`
4. ✅ 开始使用 Prompt Recorder！

**所有服务都会自动启动，无需手动操作！** 🎉
