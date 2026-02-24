# Prompt Recorder - 自动启动说明

## ✅ 当前状态

**后台服务自动启动已配置完成！**

- ✓ Windows 计划任务已创建
- ✓ 登录触发器已配置
- ✓ 启动脚本已就绪
- ✓ 后端代码已编译

## 🚀 工作原理

每次你**登录 Windows** 时，系统会自动：
1. 触发计划任务 "PromptRecorderBackend"
2. 运行隐藏的 PowerShell 脚本启动后台服务
3. 后台服务在 `http://localhost:3001` 运行

**注意**：服务启动需要几秒钟时间，登录后请等待 10-20 秒。

## 📋 验证自动启动

### 方法 1：重启测试（推荐）

1. **重启电脑**
2. **登录后等待 10-20 秒**
3. **打开 PowerShell，运行**：
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
   ```
4. **如果看到 `StatusCode: 200`，说明自动启动成功！**

### 方法 2：检查计划任务

```powershell
Get-ScheduledTask -TaskName "PromptRecorderBackend"
```

### 方法 3：运行验证脚本

```powershell
.\verify-autostart.ps1
```

## 🛠️ 常用命令

### 检查服务状态
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

### 手动启动服务（如果需要）
```powershell
.\start-backend.ps1
```

### 查看计划任务详情
```powershell
Get-ScheduledTask -TaskName "PromptRecorderBackend" | Format-List *
```

### 禁用自动启动（如果以后不需要）
```powershell
# 以管理员身份运行
Unregister-ScheduledTask -TaskName "PromptRecorderBackend" -Confirm:$false
```

### 重新启用自动启动
```powershell
# 以管理员身份运行
.\setup-autostart.ps1
```

## 📝 关于前端

**前端服务不会自动启动**，需要手动打开浏览器访问：
- 地址：`http://localhost:3000`
- 建议：将地址添加到浏览器收藏夹，需要时手动打开

## ⚠️ 注意事项

1. **自动启动时机**：服务在**用户登录时**启动，不是系统启动时
2. **启动延迟**：服务启动需要几秒钟，请耐心等待
3. **代码更新**：如果修改了后端代码，需要重新编译：
   ```powershell
   cd backend
   npm run build
   ```
4. **端口占用**：如果端口 3001 被占用，服务可能无法启动

## 🔍 故障排除

### 问题：重启后服务没有启动

**检查步骤**：
1. 检查计划任务是否启用：
   ```powershell
   (Get-ScheduledTask -TaskName "PromptRecorderBackend").State
   ```
   应该是 `Ready`

2. 查看任务历史记录：
   - 打开 "任务计划程序" (`Win + R`，输入 `taskschd.msc`)
   - 找到 "PromptRecorderBackend" 任务
   - 查看 "历史记录" 标签页，查看是否有错误

3. 手动运行启动脚本测试：
   ```powershell
   .\start-backend.ps1
   ```

### 问题：服务启动失败

**可能原因**：
1. Node.js 未安装或路径不正确
2. 后端代码未编译
3. 端口被占用

**解决方法**：
1. 检查 Node.js：
   ```powershell
   node --version
   ```

2. 重新编译后端：
   ```powershell
   cd backend
   npm run build
   ```

3. 检查端口占用：
   ```powershell
   netstat -ano | findstr :3001
   ```

## 📚 相关文件

- `setup-autostart.ps1` - 自动启动设置脚本（需要管理员权限）
- `start-backend.ps1` - 后台服务启动脚本
- `start-backend-hidden.vbs` - 隐藏窗口启动脚本
- `verify-autostart.ps1` - 验证自动启动配置
- `test-autostart.ps1` - 测试自动启动功能
- `AUTOSTART_SETUP.md` - 详细设置指南

## ✨ 总结

**你现在只需要**：
1. ✅ 重启电脑测试自动启动（可选）
2. ✅ 正常使用浏览器扩展记录 Prompt
3. ✅ 需要查看记录时，手动打开 `http://localhost:3000`

**后台服务会自动在后台运行，无需手动操作！** 🎉
