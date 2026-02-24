# Prompt Recorder API 测试脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder API 测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$apiUrl = "$baseUrl/api/prompts"

# 1. 健康检查
Write-Host "`n[1/8] 健康检查..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✅ 后端服务运行正常" -ForegroundColor Green
    Write-Host "   状态: $($healthData.status)" -ForegroundColor Gray
    Write-Host "   时间: $($healthData.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 后端服务未运行或无法访问" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
    exit 1
}

# 2. 创建 Prompt
Write-Host "`n[2/8] 创建测试 Prompt..." -ForegroundColor Yellow
try {
    $body = @{
        content = "这是一个测试 prompt - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        source = "manual"
        tags = "测试,自动化,PowerShell"
        category = "测试"
        metadata = @{
            test = $true
            script = "test-api.ps1"
        }
    } | ConvertTo-Json

    $create = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    $prompt = $create.Content | ConvertFrom-Json
    $promptId = $prompt.id
    Write-Host "✅ Prompt 创建成功" -ForegroundColor Green
    Write-Host "   ID: $promptId" -ForegroundColor Gray
    Write-Host "   内容: $($prompt.content.Substring(0, [Math]::Min(50, $prompt.content.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ 创建 Prompt 失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
    exit 1
}

# 3. 获取所有 Prompts
Write-Host "`n[3/8] 获取所有 Prompts..." -ForegroundColor Yellow
try {
    $all = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
    $allData = $all.Content | ConvertFrom-Json
    Write-Host "✅ 获取成功" -ForegroundColor Green
    Write-Host "   总数: $($allData.total)" -ForegroundColor Gray
    Write-Host "   返回: $($allData.prompts.Count) 条" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 4. 获取单个 Prompt
Write-Host "`n[4/8] 获取单个 Prompt (ID: $promptId)..." -ForegroundColor Yellow
try {
    $single = Invoke-WebRequest -Uri "$apiUrl/$promptId" -UseBasicParsing
    $singleData = $single.Content | ConvertFrom-Json
    Write-Host "✅ 获取成功" -ForegroundColor Green
    Write-Host "   内容: $($singleData.content)" -ForegroundColor Gray
    Write-Host "   来源: $($singleData.source)" -ForegroundColor Gray
    Write-Host "   标签: $($singleData.tags)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 5. 搜索 Prompts
Write-Host "`n[5/8] 搜索 Prompts (关键词: '测试')..." -ForegroundColor Yellow
try {
    $search = Invoke-WebRequest -Uri "$apiUrl?search=测试" -UseBasicParsing
    $searchData = $search.Content | ConvertFrom-Json
    Write-Host "✅ 搜索成功" -ForegroundColor Green
    Write-Host "   找到: $($searchData.total) 条" -ForegroundColor Gray
} catch {
    Write-Host "❌ 搜索失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 6. 更新 Prompt
Write-Host "`n[6/8] 更新 Prompt (ID: $promptId)..." -ForegroundColor Yellow
try {
    $updateBody = @{
        tags = "测试,自动化,PowerShell,已更新"
        category = "测试-已更新"
    } | ConvertTo-Json

    $update = Invoke-WebRequest -Uri "$apiUrl/$promptId" `
        -Method PATCH `
        -ContentType "application/json" `
        -Body $updateBody `
        -UseBasicParsing

    $updatedData = $update.Content | ConvertFrom-Json
    Write-Host "✅ 更新成功" -ForegroundColor Green
    Write-Host "   新标签: $($updatedData.tags)" -ForegroundColor Gray
    Write-Host "   新分类: $($updatedData.category)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 更新失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 7. 获取统计信息
Write-Host "`n[7/8] 获取统计信息..." -ForegroundColor Yellow
try {
    $stats = Invoke-WebRequest -Uri "$apiUrl/stats/summary" -UseBasicParsing
    $statsData = $stats.Content | ConvertFrom-Json
    Write-Host "✅ 获取成功" -ForegroundColor Green
    Write-Host "   总数: $($statsData.total)" -ForegroundColor Gray
    Write-Host "   最近7天: $($statsData.recent)" -ForegroundColor Gray
    Write-Host "   按来源分布:" -ForegroundColor Gray
    $statsData.bySource | ForEach-Object {
        Write-Host "     - $($_.source): $($_.count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 获取统计失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 8. 删除 Prompt
Write-Host "`n[8/8] 删除测试 Prompt (ID: $promptId)..." -ForegroundColor Yellow
try {
    $delete = Invoke-WebRequest -Uri "$apiUrl/$promptId" -Method DELETE -UseBasicParsing
    Write-Host "✅ 删除成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 删除失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 所有测试完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
