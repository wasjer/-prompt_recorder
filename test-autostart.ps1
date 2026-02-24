# Test Auto-start Configuration
# This script checks if auto-start is configured correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder - Auto-start Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check backend task
Write-Host "Checking backend auto-start task..." -ForegroundColor Yellow
$backendTask = Get-ScheduledTask -TaskName "PromptRecorderBackend" -ErrorAction SilentlyContinue
if ($backendTask) {
    Write-Host "  ✓ Backend task found" -ForegroundColor Green
    Write-Host "    State: $($backendTask.State)" -ForegroundColor White
    Write-Host "    Last Run: $($backendTask.LastRunTime)" -ForegroundColor White
    Write-Host "    Next Run: $($backendTask.NextRunTime)" -ForegroundColor White
} else {
    Write-Host "  ✗ Backend task NOT found" -ForegroundColor Red
    Write-Host "    Run: .\setup-autostart.ps1 (as Administrator)" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend task
Write-Host "Checking frontend auto-start task..." -ForegroundColor Yellow
$frontendTask = Get-ScheduledTask -TaskName "PromptRecorderFrontend" -ErrorAction SilentlyContinue
if ($frontendTask) {
    Write-Host "  ✓ Frontend task found" -ForegroundColor Green
    Write-Host "    State: $($frontendTask.State)" -ForegroundColor White
    Write-Host "    Last Run: $($frontendTask.LastRunTime)" -ForegroundColor White
    Write-Host "    Next Run: $($frontendTask.NextRunTime)" -ForegroundColor White
} else {
    Write-Host "  ✗ Frontend task NOT found" -ForegroundColor Yellow
    Write-Host "    Run: .\setup-autostart-frontend.ps1 (as Administrator)" -ForegroundColor Yellow
}

Write-Host ""

# Check if services are running
Write-Host "Checking if services are running..." -ForegroundColor Yellow

# Check backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "  ✓ Backend service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Backend service is NOT running" -ForegroundColor Red
    Write-Host "    Start manually: cd backend; npm run dev" -ForegroundColor Yellow
}

# Check frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Frontend service is NOT running" -ForegroundColor Yellow
    Write-Host "    Start manually: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test auto-start after reboot:" -ForegroundColor Yellow
Write-Host "1. Restart your computer" -ForegroundColor White
Write-Host "2. After login, wait 10-20 seconds" -ForegroundColor White
Write-Host "3. Run this script again to verify services started" -ForegroundColor White
Write-Host ""

pause
