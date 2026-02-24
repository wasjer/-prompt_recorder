# Prompt Recorder 后台服务自动启动设置

## 快速设置（只需一次）

### 步骤 1：以管理员身份运行 PowerShell

1. 按 `Win + X`
2. 选择 "Windows PowerShell (管理员)" 或 "终端 (管理员)"
3. 如果提示 UAC，点击 "是"

### 步骤 2：运行自动启动设置脚本

在 PowerShell 中执行：

```powershell
cd D:\garage\-prompt_recorder\-prompt_recorder
.\setup-autostart.ps1
```

### 步骤 3：验证设置

设置完成后，运行测试脚本：

```powershell
.\test-autostart.ps1
```

## 验证自动启动是否配置成功

### 方法 1：检查任务计划程序

```powershell
Get-ScheduledTask -TaskName "PromptRecorderBackend"
```

如果看到任务信息，说明配置成功。

### 方法 2：检查服务状态

```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

如果返回 `StatusCode: 200`，说明服务正在运行。

### 方法 3：重启测试

1. 重启电脑
2. 登录后等待 10-20 秒
3. 运行测试脚本验证：

```powershell
.\test-autostart.ps1
```

## 手动启动/停止服务

### 手动启动后台服务

```powershell
.\start-backend.ps1
```

### 停止后台服务

```powershell
# 查找 Node.js 进程
Get-Process node | Where-Object {$_.Path -like "*nodejs*"}

# 停止进程（替换 PID 为实际进程 ID）
Stop-Process -Id <PID> -Force
```

或者使用任务管理器：
1. 按 `Ctrl + Shift + Esc` 打开任务管理器
2. 找到 `node.exe` 进程
3. 右键点击，选择 "结束任务"

## 禁用自动启动

如果以后不想自动启动，可以删除计划任务：

```powershell
# 以管理员身份运行
Unregister-ScheduledTask -TaskName "PromptRecorderBackend" -Confirm:$false
```

## 重新启用自动启动

如果之前禁用了，可以重新运行设置脚本：

```powershell
# 以管理员身份运行
.\setup-autostart.ps1
```

## 常见问题

### Q: 设置脚本提示需要管理员权限？

A: 计划任务需要管理员权限才能创建。请右键点击 PowerShell，选择 "以管理员身份运行"。

### Q: 重启后服务没有自动启动？

A: 
1. 检查任务计划程序中的任务是否启用：
   ```powershell
   Get-ScheduledTask -TaskName "PromptRecorderBackend" | Select-Object State
   ```
2. 检查任务是否在用户登录时触发：
   ```powershell
   (Get-ScheduledTask -TaskName "PromptRecorderBackend").Triggers
   ```
3. 查看任务历史记录：
   - 打开 "任务计划程序" (taskschd.msc)
   - 找到 "PromptRecorderBackend" 任务
   - 查看 "历史记录" 标签页

### Q: 服务启动失败？

A: 
1. 检查 Node.js 是否安装：
   ```powershell
   node --version
   ```
2. 检查后端代码是否已编译：
   ```powershell
   Test-Path backend\dist\server.js
   ```
3. 如果没有编译，手动编译：
   ```powershell
   cd backend
   npm run build
   ```

### Q: 如何查看服务日志？

A: 后台服务在后台运行，没有可见窗口。如果需要查看日志：
1. 手动启动服务（可以看到输出）：
   ```powershell
   cd backend
   npm run dev
   ```
2. 或者修改启动脚本，将输出保存到日志文件

## 注意事项

- 自动启动任务会在**用户登录时**触发，不是系统启动时
- 服务启动需要几秒钟时间，请等待 10-20 秒后再测试
- 如果修改了后端代码，需要重新编译（`npm run build`）
- 前端服务**不会**自动启动，需要手动打开浏览器访问
