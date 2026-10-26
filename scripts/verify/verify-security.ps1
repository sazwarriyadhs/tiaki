$ErrorActionPreference = "Stop"

$ROOT = "D:\TIAKI"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TIAKI SECURITY FOUNDATION VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$container = "tiaki-postgres"
$db = "tiaki"
$user = "tiaki"

Write-Host "`n[1] PostgreSQL" -ForegroundColor Yellow

$health = docker inspect `
    --format "{{.State.Health.Status}}" `
    $container 2>$null

if ($health -ne "healthy") {
    throw "PostgreSQL container is not healthy."
}

Write-Host "[PASS] PostgreSQL healthy" -ForegroundColor Green

Write-Host "`n[2] Migration 047" -ForegroundColor Yellow

$migration = Join-Path $ROOT "db\migrations\047_auth_security.sql"

if (-not (Test-Path $migration)) {
    throw "047_auth_security.sql missing."
}

Write-Host "[PASS] 047_auth_security.sql exists" -ForegroundColor Green

Write-Host "`n[3] Database migration" -ForegroundColor Yellow

docker exec $container psql `
    -U $user `
    -d $db `
    -v ON_ERROR_STOP=1 `
    -c "SELECT filename FROM public.schema_migrations WHERE filename='047_auth_security.sql';"

Write-Host "[PASS] Migration ledger checked" -ForegroundColor Green

Write-Host "`n[4] Auth tables" -ForegroundColor Yellow

docker exec $container psql `
    -U $user `
    -d $db `
    -v ON_ERROR_STOP=1 `
    -c "\dt app.auth_*"

Write-Host "[PASS] Auth tables checked" -ForegroundColor Green

Write-Host "`n[5] Auth table counts" -ForegroundColor Yellow

docker exec $container psql `
    -U $user `
    -d $db `
    -v ON_ERROR_STOP=1 `
    -c "SELECT
          (SELECT count(*) FROM app.auth_accounts) AS auth_accounts,
          (SELECT count(*) FROM app.auth_refresh_sessions) AS refresh_sessions;"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " SECURITY FOUNDATION VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
