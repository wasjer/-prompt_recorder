# Clear all prompts
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Clear All Prompts" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Check if backend is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 2
    Write-Host "Backend is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend is NOT running!" -ForegroundColor Red
    Write-Host "Please start backend: cd backend; npm run dev" -ForegroundColor Yellow
    pause
    exit 1
}

# Get current stats
Write-Host "Getting current stats..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
    Write-Host "Current prompts: $($stats.total)" -ForegroundColor White
} catch {
    Write-Host "Warning: Could not get stats" -ForegroundColor Yellow
}

# Confirm deletion
Write-Host ""
$confirm = Read-Host "Delete all prompts? (type 'yes' to confirm)"
if ($confirm -ne 'yes') {
    Write-Host "Cancelled" -ForegroundColor Yellow
    pause
    exit 0
}

# Delete all
Write-Host ""
Write-Host "Deleting all prompts..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete
    Write-Host "Success! Deleted $($result.deletedCount) prompts" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Delete failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might mean:" -ForegroundColor Yellow
    Write-Host "1. Backend needs to be restarted (Ctrl+C, then: cd backend; npm run dev)" -ForegroundColor White
    Write-Host "2. The route fix hasn't been applied yet" -ForegroundColor White
    pause
    exit 1
}

# Verify
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
    Write-Host "Remaining prompts: $($stats.total)" -ForegroundColor White
} catch {
    Write-Host "Could not verify" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
pause
