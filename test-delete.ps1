# Test delete functionality
Write-Host "=== Testing Delete Functionality ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check current count
Write-Host "1. Current prompts:" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
    Write-Host "   Total: $($stats.total)" -ForegroundColor White
} catch {
    Write-Host "   ERROR: Cannot connect to backend" -ForegroundColor Red
    exit 1
}

# 2. Get actual prompts
Write-Host ""
Write-Host "2. Getting prompts from API:" -ForegroundColor Yellow
try {
    $all = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?limit=100"
    Write-Host "   Count: $($all.prompts.Count)" -ForegroundColor White
    if ($all.prompts.Count -gt 0) {
        Write-Host "   First prompt ID: $($all.prompts[0].id)" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Delete all
Write-Host ""
Write-Host "3. Deleting all prompts:" -ForegroundColor Yellow
$confirm = Read-Host "   Delete all? (yes/no)"
if ($confirm -eq 'yes') {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete
        Write-Host "   SUCCESS: Deleted $($result.deletedCount) prompts" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response: $responseBody" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   Cancelled" -ForegroundColor Yellow
    exit 0
}

# 4. Verify deletion
Write-Host ""
Write-Host "4. Verifying deletion:" -ForegroundColor Yellow
Start-Sleep -Seconds 1
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
    Write-Host "   Total: $($stats.total)" -ForegroundColor White
    
    $all = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?limit=100"
    Write-Host "   Prompts array: $($all.prompts.Count)" -ForegroundColor White
    
    if ($stats.total -eq 0 -and $all.prompts.Count -eq 0) {
        Write-Host ""
        Write-Host "✓ SUCCESS: All prompts deleted!" -ForegroundColor Green
        Write-Host ""
        Write-Host "If frontend still shows data:" -ForegroundColor Yellow
        Write-Host "- Press Ctrl+Shift+R (hard refresh)" -ForegroundColor White
        Write-Host "- Or open DevTools (F12) -> Network -> Disable cache -> Refresh" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ WARNING: Data still exists!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
