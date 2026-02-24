# Prompt Recorder - Unified Auto-start Setup Script
# This script sets up auto-start for both frontend and backend
# Frontend will be built and served by backend in production mode
# Usage: Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder - Unified Auto-start Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Error: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Get project path
$projectPath = $PSScriptRoot
$backendPath = Join-Path $projectPath "backend"
$frontendPath = Join-Path $projectPath "frontend"

# Check if paths exist
if (-not (Test-Path $backendPath)) {
    Write-Host "Error: Cannot find backend directory: $backendPath" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Error: Cannot find frontend directory: $frontendPath" -ForegroundColor Red
    pause
    exit 1
}

# Check package.json files
$backendPackageJson = Join-Path $backendPath "package.json"
$frontendPackageJson = Join-Path $frontendPath "package.json"
if (-not (Test-Path $backendPackageJson)) {
    Write-Host "Error: Cannot find backend package.json: $backendPackageJson" -ForegroundColor Red
    pause
    exit 1
}
if (-not (Test-Path $frontendPackageJson)) {
    Write-Host "Error: Cannot find frontend package.json: $frontendPackageJson" -ForegroundColor Red
    pause
    exit 1
}

# Get Node.js path
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "Error: Cannot find Node.js, please install Node.js first" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Project path: $projectPath" -ForegroundColor Green
Write-Host "Backend path: $backendPath" -ForegroundColor Green
Write-Host "Frontend path: $frontendPath" -ForegroundColor Green
Write-Host "Node.js path: $nodePath" -ForegroundColor Green
Write-Host ""

# Check if start-all.ps1 exists
$startAllScript = Join-Path $projectPath "start-all.ps1"
if (-not (Test-Path $startAllScript)) {
    Write-Host "Error: Cannot find start-all.ps1. Please ensure it exists." -ForegroundColor Red
    pause
    exit 1
}

# Create VBS script (for hidden window)
$vbsScript = Join-Path $projectPath "start-all-hidden.vbs"
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""$startAllScript""", 0, False
Set WshShell = Nothing
"@

Write-Host "Creating VBS hidden window script..." -ForegroundColor Yellow
$vbsContent | Out-File -FilePath $vbsScript -Encoding ASCII
Write-Host "VBS script created: $vbsScript" -ForegroundColor Green

# Check for existing tasks in Task Scheduler
$taskName = "PromptRecorder"
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Found existing task, will delete and recreate..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Also remove old separate tasks if they exist
$oldBackendTask = Get-ScheduledTask -TaskName "PromptRecorderBackend" -ErrorAction SilentlyContinue
if ($oldBackendTask) {
    Write-Host "Removing old backend task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "PromptRecorderBackend" -Confirm:$false
}

$oldFrontendTask = Get-ScheduledTask -TaskName "PromptRecorderFrontend" -ErrorAction SilentlyContinue
if ($oldFrontendTask) {
    Write-Host "Removing old frontend task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "PromptRecorderFrontend" -Confirm:$false
}

# Create scheduled task
Write-Host "Creating Windows scheduled task..." -ForegroundColor Yellow

$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsScript`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Prompt Recorder - Auto-start backend and frontend on login (frontend served by backend on port 3001)" | Out-Null
    Write-Host "Scheduled task created: $taskName" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to create scheduled task: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  - Frontend will be built automatically on startup" -ForegroundColor White
Write-Host "  - Backend will run in production mode" -ForegroundColor White
Write-Host "  - Frontend will be served by backend on http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "1. Service will auto-start on next login" -ForegroundColor White
Write-Host "2. Access the application at: http://localhost:3001" -ForegroundColor White
Write-Host "3. To test immediately, run: .\start-all.ps1" -ForegroundColor White
Write-Host "4. To disable auto-start, run: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White
Write-Host "5. To check task status, run: Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host ""
Write-Host "Note: First startup may take longer as it builds the frontend." -ForegroundColor Gray
Write-Host ""

pause
