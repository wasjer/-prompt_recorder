# Prompt Recorder - Verify Auto-start Configuration
# This script verifies that auto-start is properly configured

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder - Auto-start Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Scheduled Task exists
Write-Host "[1/4] Checking scheduled task..." -ForegroundColor Yellow
$task = Get-ScheduledTask -TaskName "PromptRecorderBackend" -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "  ✓ Task found: $($task.TaskName)" -ForegroundColor Green
    Write-Host "    State: $($task.State)" -ForegroundColor $(if ($task.State -eq 'Ready') { 'Green' } else { 'Yellow' })
    
    # Check triggers
    $hasLogonTrigger = $task.Triggers | Where-Object { $_.CimClass.CimClassName -eq 'MSFT_TaskLogonTrigger' }
    if ($hasLogonTrigger) {
        Write-Host "    ✓ Logon trigger configured" -ForegroundColor Green
    } else {
        Write-Host "    ✗ No logon trigger found" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ✗ Task NOT found" -ForegroundColor Red
    Write-Host "    Run: .\setup-autostart.ps1 (as Administrator)" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check 2: Startup script exists
Write-Host "[2/4] Checking startup script..." -ForegroundColor Yellow
$startScript = Join-Path $PSScriptRoot "start-backend.ps1"
if (Test-Path $startScript) {
    Write-Host "  ✓ Startup script found: $startScript" -ForegroundColor Green
} else {
    Write-Host "  ✗ Startup script NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 3: VBS script exists
Write-Host "[3/4] Checking VBS script..." -ForegroundColor Yellow
$vbsScript = Join-Path $PSScriptRoot "start-backend-hidden.vbs"
if (Test-Path $vbsScript) {
    Write-Host "  ✓ VBS script found: $vbsScript" -ForegroundColor Green
} else {
    Write-Host "  ✗ VBS script NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check 4: Backend files exist
Write-Host "[4/4] Checking backend files..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
$distFile = Join-Path $backendPath "dist\server.js"
if (Test-Path $distFile) {
    Write-Host "  ✓ Backend compiled: $distFile" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Backend not compiled: $distFile" -ForegroundColor Yellow
    Write-Host "    Will auto-build on first startup" -ForegroundColor Gray
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ Auto-start configuration is OK!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your computer to test auto-start" -ForegroundColor White
    Write-Host "2. After login, wait 10-20 seconds" -ForegroundColor White
    Write-Host "3. Run: Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing" -ForegroundColor White
    Write-Host "4. If StatusCode is 200, auto-start is working!" -ForegroundColor White
} else {
    Write-Host "✗ Auto-start configuration has issues" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please run:" -ForegroundColor Yellow
    Write-Host "  .\setup-autostart.ps1 (as Administrator)" -ForegroundColor White
}

Write-Host ""
