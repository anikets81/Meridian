# Start TaskView visitor demo (with sample data)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env.postgresql")) {
    Copy-Item ".env.postgresql.example" ".env.postgresql"
}
if (-not (Test-Path ".env.taskview")) {
    Copy-Item ".env.taskview.example" ".env.taskview"
}

Write-Host "Starting TaskView visitor demo..." -ForegroundColor Cyan
Write-Host "(First run: downloads images, migrates DB, seeds demo data — may take a few minutes)" -ForegroundColor DarkGray
docker compose up -d

Write-Host ""
Write-Host "Demo starting. When seed completes:" -ForegroundColor Green
Write-Host "  Web:      http://localhost:8888"
Write-Host "  API:      http://localhost:1725"
Write-Host ""
Write-Host "  Username: visitor" -ForegroundColor Yellow
Write-Host "  Password: visitor!!" -ForegroundColor Yellow
Write-Host "  Or click 'Continue as demo user' on the login page (dev web / rebuilt web image)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Track seed progress: docker compose logs -f seed-demo"
