# Seed the visitor demo workspace against a hosted Render API + Postgres.
# Get DB credentials from Render Dashboard → meridian-db → Connect → External Connection.
#
# Usage:
#   .\seed-render.ps1 -DbHost "dpg-xxx.oregon-postgres.render.com" -DbPassword "your-db-password"
#
param(
  [string]$ApiUrl = "https://meridian-api-v19l.onrender.com",
  [string]$DbHost = "",
  [string]$DbUser = "taskview",
  [string]$DbPassword = "",
  [string]$DbName = "taskviewdb",
  [string]$DbPort = "5432"
)

$ErrorActionPreference = "Stop"

if (-not $DbHost -or -not $DbPassword) {
  Write-Host "Missing database connection details." -ForegroundColor Red
  Write-Host ""
  Write-Host "Render Dashboard → meridian-db → Connect → External Connection"
  Write-Host "Then run:"
  Write-Host '  .\seed-render.ps1 -DbHost "YOUR_HOST" -DbPassword "YOUR_PASSWORD"'
  exit 1
}

Set-Location $PSScriptRoot\..\visitor-demo\seed

$env:API_URL = $ApiUrl.TrimEnd('/')
$env:DB_HOST = $DbHost
$env:DB_USER = $DbUser
$env:DB_PASSWORD = $DbPassword
$env:DB_NAME = $DbName
$env:DB_PORT = $DbPort

Write-Host "Seeding demo data via $env:API_URL ..." -ForegroundColor Cyan
Write-Host "(This can take 2–5 minutes on Render free tier while the API wakes up.)" -ForegroundColor DarkGray

if (Get-Command bun -ErrorAction SilentlyContinue) {
  bun run seed-demo.ts
} else {
  npm install --omit=dev 2>$null
  node --experimental-strip-types seed-demo.ts
}

Write-Host ""
Write-Host "Demo ready — sign in on your Vercel app with:" -ForegroundColor Green
Write-Host "  Username: visitor"
Write-Host "  Password: visitor!!"
Write-Host ""
Write-Host "Use the 'Try the demo' button or these credentials (not the default admin user)." -ForegroundColor Yellow
