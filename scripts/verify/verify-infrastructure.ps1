$ErrorActionPreference = "Continue"

$ROOT = "D:\TIAKI"

Set-Location $ROOT

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TIAKI INFRASTRUCTURE VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# DOCKER
# ------------------------------------------------------------

Write-Host "=== DOCKER SERVICES ===" -ForegroundColor Yellow

docker compose ps

Write-Host ""

# ------------------------------------------------------------
# POSTGRES
# ------------------------------------------------------------

Write-Host "=== POSTGRES ===" -ForegroundColor Yellow

docker exec tiaki-postgres pg_isready `
    -U tiaki `
    -d tiaki

Write-Host ""

# ------------------------------------------------------------
# REDIS
# ------------------------------------------------------------

Write-Host "=== REDIS ===" -ForegroundColor Yellow

docker exec tiaki-redis redis-cli ping

Write-Host ""

# ------------------------------------------------------------
# PORTS
# ------------------------------------------------------------

Write-Host "=== TIAKI PORTS ===" -ForegroundColor Yellow

$ports = @(
    15441,
    6385,
    8093,
    8011,
    3010,
    3011,
    3012,
    3013,
    9010,
    9011
)

foreach ($port in $ports) {

    $tcp = Get-NetTCPConnection `
        -LocalPort $port `
        -ErrorAction SilentlyContinue

    if ($tcp) {

        Write-Host "PORT $port -> LISTENING" -ForegroundColor Green

    } else {

        Write-Host "PORT $port -> NOT LISTENING" -ForegroundColor DarkGray
    }
}

Write-Host ""

# ------------------------------------------------------------
# NETWORK
# ------------------------------------------------------------

Write-Host "=== DOCKER NETWORK ===" -ForegroundColor Yellow

docker network inspect tiaki-network 2>$null

Write-Host ""

# ------------------------------------------------------------
# VOLUMES
# ------------------------------------------------------------

Write-Host "=== TIAKI VOLUMES ===" -ForegroundColor Yellow

docker volume ls |
    Select-String "tiaki"

Write-Host ""

# ------------------------------------------------------------
# MIGRATIONS
# ------------------------------------------------------------

Write-Host "=== MIGRATIONS ===" -ForegroundColor Yellow

$migrationPath = Join-Path $ROOT "db\migrations"

if (Test-Path $migrationPath) {

    $count = (
        Get-ChildItem `
            -Path $migrationPath `
            -Filter "*.sql" `
            -File `
            -ErrorAction SilentlyContinue
    ).Count

    Write-Host "Migration files: $count" -ForegroundColor Green

} else {

    Write-Host "Migration directory missing." -ForegroundColor Red
}

Write-Host ""

# ------------------------------------------------------------
# RESULT
# ------------------------------------------------------------

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
