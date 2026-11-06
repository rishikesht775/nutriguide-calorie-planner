$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host 'NutriGuide development setup' -ForegroundColor Green
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js 22 or newer is required. Install it from https://nodejs.org/ and run this script again.'
}

$nodeVersion = node --version
Write-Host "Using Node.js $nodeVersion"

npm install
npm run test:install-browsers
Write-Host ''
Write-Host 'Setup complete.' -ForegroundColor Green
Write-Host 'Run npm run dev to start the app.'
Write-Host 'Run npm run test:e2e to run Playwright.'
