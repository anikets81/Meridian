# Reset visitor demo — deletes all data and re-seeds sample content
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Stopping demo and removing database volume..." -ForegroundColor Yellow
docker compose down -v

Write-Host "Restarting with fresh demo data..." -ForegroundColor Cyan
docker compose up -d

Write-Host ""
Write-Host "Reset started. Watch seed: docker compose logs -f seed-demo" -ForegroundColor Green
Write-Host "Login: visitor / visitor!!" -ForegroundColor Yellow
