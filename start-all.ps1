# Prompt Recorder - Unified Startup Script
# This script builds frontend and starts backend in production mode
# Frontend will be served by backend on http://localhost:3001

$ErrorActionPreference = "Stop"

# Get project paths
$projectPath = $PSScriptRoot
$backendPath = Join-Path $projectPath "backend"
$frontendPath = Join-Path $projectPath "frontend"

# Check if paths exist
if (-not (Test-Path $backendPath)) {
    Write-Host "Error: Cannot find backend directory: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Error: Cannot find frontend directory: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prompt Recorder - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build frontend
Write-Host "[1/3] Building frontend..." -ForegroundColor Yellow
Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Build frontend
Write-Host "  Building frontend (this may take a moment)..." -ForegroundColor Gray
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Check backend build
Write-Host "[2/3] Checking backend..." -ForegroundColor Yellow
Set-Location $backendPath

# Check if dist directory exists, if not, build
if (-not (Test-Path "dist\server.js")) {
    Write-Host "  Building backend code..." -ForegroundColor Gray
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Backend build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Backend ready" -ForegroundColor Green
Write-Host ""

# Step 3: Start backend in production mode
Write-Host "[3/3] Starting backend service (production mode)..." -ForegroundColor Yellow

# Get Node.js path
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "  Error: Cannot find Node.js" -ForegroundColor Red
    exit 1
}

# Start backend service with NODE_ENV=production
Write-Host "  Starting backend on http://localhost:3001..." -ForegroundColor Gray

# Use ProcessStartInfo to set environment variable
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = $nodePath
$processInfo.Arguments = "dist/server.js"
$processInfo.WorkingDirectory = $backendPath
$processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$processInfo.UseShellExecute = $false
$processInfo.EnvironmentVariables["NODE_ENV"] = "production"
$process = [System.Diagnostics.Process]::Start($processInfo)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Yellow
Write-Host "  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Wait 5-10 seconds for the service to fully start..." -ForegroundColor Gray
Write-Host ""
