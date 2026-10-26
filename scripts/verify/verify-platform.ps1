$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host " TIAKI PLATFORM VERIFICATION"
Write-Host "============================================================"
Write-Host ""

Set-Location "D:\TIAKI"

Write-Host "[1] Docker" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "[2] PostgreSQL" -ForegroundColor Cyan

$container = docker ps --filter "name=tiaki-postgres" --format "{{.Names}}"

if ($container) {
    docker exec $container pg_isready -U tiaki -d tiaki
}
else {
    Write-Host "PostgreSQL container not running." -ForegroundColor Red
}

Write-Host ""
Write-Host "[3] Repository" -ForegroundColor Cyan

$dirs = @(
    "apps",
    "services",
    "ai",
    "db",
    "packages",
    "infrastructure",
    "docs",
    "scripts",
    "tests"
)

foreach ($dir in $dirs) {
    if (Test-Path "D:\TIAKI\$dir") {
        Write-Host "OK  $dir" -ForegroundColor Green
    }
    else {
        Write-Host "MISS $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "TIAKI verification completed." -ForegroundColor Green
