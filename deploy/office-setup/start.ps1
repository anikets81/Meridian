# Start TaskView office setup stack
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env.postgresql")) {
    Copy-Item ".env.postgresql.example" ".env.postgresql"
    Write-Host "Created .env.postgresql — edit passwords before production use." -ForegroundColor Yellow
}
if (-not (Test-Path ".env.taskview")) {
    Copy-Item ".env.taskview.example" ".env.taskview"
    Write-Host "Created .env.taskview — edit secrets before production use." -ForegroundColor Yellow
}

Write-Host "Starting TaskView (office setup)..." -ForegroundColor Cyan
docker compose up -d

Write-Host ""
Write-Host "TaskView is starting." -ForegroundColor Green
Write-Host "  Web:  http://localhost:8888"
Write-Host "  API:  http://localhost:1725"
Write-Host ""
Write-Host "Default admin (change after first login): user / user1!#Q" -ForegroundColor Yellow
