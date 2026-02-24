# Prompt Recorder Editor Extension - Installation Script
# Run this script to install the extension

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder Editor Extension Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Current directory: $scriptDir" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Compile TypeScript
Write-Host "[2/4] Compiling TypeScript..." -ForegroundColor Yellow
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Compilation failed!" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  ✓ TypeScript compiled" -ForegroundColor Green
Write-Host ""

# Step 3: Check if vsce is installed
Write-Host "[3/4] Checking for vsce..." -ForegroundColor Yellow
$vsceInstalled = Get-Command vsce -ErrorAction SilentlyContinue
if (-not $vsceInstalled) {
    Write-Host "  Installing vsce globally..." -ForegroundColor Yellow
    npm install -g @vscode/vsce
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Warning: Failed to install vsce. You can install it manually later." -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ vsce installed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ vsce is already installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Package extension
Write-Host "[4/4] Packaging extension..." -ForegroundColor Yellow
vsce package --allow-missing-repository
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Packaging failed!" -ForegroundColor Red
    Write-Host "Make sure vsce is installed: npm install -g @vscode/vsce" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "  ✓ Extension packaged" -ForegroundColor Green
Write-Host ""

# Find the generated .vsix file
$vsixFile = Get-ChildItem -Path $scriptDir -Filter "*.vsix" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Cursor/VSCode" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+X to open Extensions panel" -ForegroundColor White
Write-Host "3. Click the '...' menu (top right)" -ForegroundColor White
Write-Host "4. Select 'Install from VSIX...'" -ForegroundColor White
Write-Host "5. Select this file: $($vsixFile.FullName)" -ForegroundColor White
Write-Host "6. Restart Cursor/VSCode after installation" -ForegroundColor White
Write-Host ""
Write-Host "The extension will auto-activate on startup!" -ForegroundColor Green
Write-Host ""

pause
