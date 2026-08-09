# Seed the visitor demo user + sample data into the local dev stack (API on :8080, Postgres on :5433).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\seed

$env:API_URL = "http://localhost:8080"
$env:DB_HOST = "localhost"
$env:DB_USER = "tvdbuser"
$env:DB_PASSWORD = "tvdbpass"
$env:DB_NAME = "taskviewdb"
$env:DB_PORT = "5433"

Write-Host "Seeding visitor demo into local dev API ($env:API_URL)..." -ForegroundColor Cyan
bun run seed-demo.ts

Write-Host ""
Write-Host "Demo login:" -ForegroundColor Green
Write-Host "  Username: visitor"
Write-Host "  Password: visitor!!"
