$ErrorActionPreference = "Stop"

$Container = "tiaki-postgres"
$Database = "tiaki"
$DbUser = "tiaki"

$Root = "D:\TIAKI"
$ApiRoot = "D:\TIAKI\services\api"

$SqlFile = "D:\TIAKI\scripts\bootstrap\owner-bootstrap.sql"
$HelperDir = "D:\TIAKI\services\api\cmd\_tiaki_hash"
$HelperFile = "D:\TIAKI\services\api\cmd\_tiaki_hash\main.go"

$OwnerEmail = "owner@tiaki.local"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TIAKI OWNER BOOTSTRAP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# PostgreSQL
# ------------------------------------------------------------

Write-Host "[1] PostgreSQL" -ForegroundColor Yellow

$status = docker inspect -f "{{.State.Status}}" $Container 2>$null

if ($LASTEXITCODE -ne 0) {
    throw "Docker container $Container not found"
}

if ($status.Trim() -ne "running") {
    throw "$Container is not running"
}

Write-Host "[PASS] PostgreSQL container running" -ForegroundColor Green

docker exec $Container pg_isready -U $DbUser -d $Database 2>$null | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "PostgreSQL is not ready"
}

Write-Host "[PASS] PostgreSQL ready" -ForegroundColor Green

# ------------------------------------------------------------
# Tables
# ------------------------------------------------------------

Write-Host ""
Write-Host "[2] Schema" -ForegroundColor Yellow

$tables = @(
    "app.organisations",
    "app.users",
    "app.organisation_users",
    "app.user_roles",
    "app.roles",
    "app.auth_accounts"
)

foreach ($table in $tables) {

    $check = docker exec $Container psql `
        -U $DbUser `
        -d $Database `
        -tA `
        -c "SELECT to_regclass('$table') IS NOT NULL;"

    if ($check.Trim() -ne "t") {
        throw "Missing table: $table"
    }

    Write-Host "[PASS] $table" -ForegroundColor Green
}

# ------------------------------------------------------------
# Owner role
# ------------------------------------------------------------

Write-Host ""
Write-Host "[3] Owner role" -ForegroundColor Yellow

$ownerRole = docker exec $Container psql `
    -U $DbUser `
    -d $Database `
    -tA `
    -c "SELECT count(*) FROM app.roles WHERE code='owner';"

if ($ownerRole.Trim() -ne "1") {
    throw "owner role does not exist"
}

Write-Host "[PASS] owner role exists" -ForegroundColor Green

# ------------------------------------------------------------
# Password
# ------------------------------------------------------------

Write-Host ""
Write-Host "[4] Password" -ForegroundColor Yellow

$p1 = Read-Host "Enter owner password (minimum 12 characters)" -AsSecureString
$p2 = Read-Host "Confirm owner password" -AsSecureString

$b1 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($p1)
$b2 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($p2)

try {
    $password1 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b1)
    $password2 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b2)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b1)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b2)
}

if ($password1.Length -lt 12) {
    throw "Password must contain at least 12 characters"
}

if ($password1 -cne $password2) {
    throw "Password confirmation does not match"
}

Write-Host "[PASS] Password policy satisfied" -ForegroundColor Green

# ------------------------------------------------------------
# bcrypt helper
# ------------------------------------------------------------

Write-Host ""
Write-Host "[5] bcrypt" -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path $HelperDir | Out-Null

$go = @"
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"

    "golang.org/x/crypto/bcrypt"
)

func main() {
    r := bufio.NewReader(os.Stdin)

    password, err := r.ReadString('\n')
    if err != nil && len(password) == 0 {
        panic(err)
    }

    password = strings.TrimRight(password, "\r\n")

    hash, err := bcrypt.GenerateFromPassword(
        []byte(password),
        12,
    )

    if err != nil {
        panic(err)
    }

    fmt.Print(string(hash))
}
"@

[System.IO.File]::WriteAllText(
    $HelperFile,
    $go,
    [System.Text.UTF8Encoding]::new($false)
)

if (-not [System.IO.File]::Exists($HelperFile)) {
    throw "bcrypt helper was not created"
}

Write-Host "[PASS] bcrypt helper created" -ForegroundColor Green

Push-Location $ApiRoot

try {

    $hashOutput = $password1 | go run ".\cmd\_tiaki_hash\main.go" 2>&1

    if ($LASTEXITCODE -ne 0) {
        throw "bcrypt helper failed: $($hashOutput -join ' ')"
    }

}
finally {
    Pop-Location
}

$hash = ($hashOutput -join "").Trim()

if (-not $hash.StartsWith('$2')) {
    throw "Invalid bcrypt hash generated"
}

Write-Host "[PASS] bcrypt hash generated" -ForegroundColor Green

$password1 = $null
$password2 = $null

# ------------------------------------------------------------
# SQL file check
# ------------------------------------------------------------

Write-Host ""
Write-Host "[6] SQL bootstrap" -ForegroundColor Yellow

if (-not [System.IO.File]::Exists($SqlFile)) {
    throw "SQL file not found: $SqlFile"
}

Write-Host "[PASS] SQL file found" -ForegroundColor Green

# ------------------------------------------------------------
# Execute SQL
# ------------------------------------------------------------

Get-Content -LiteralPath $SqlFile -Raw |
    docker exec -i $Container psql `
        -U $DbUser `
        -d $Database `
        -v ON_ERROR_STOP=1 `
        -v "email=$OwnerEmail" `
        -v "display_name=TIAKI Platform Owner" `
        -v "legal_name=TIAKI Platform" `
        -v "trading_name=TIAKI" `
        -v "registration_no=TIAKI-PLATFORM-OWNER" `
        -v "password_hash=$hash"

if ($LASTEXITCODE -ne 0) {
    throw "Database bootstrap failed"
}

Write-Host "[PASS] Database bootstrap committed" -ForegroundColor Green

# ------------------------------------------------------------
# Cleanup
# ------------------------------------------------------------

$hash = $null

if ([System.IO.Directory]::Exists($HelperDir)) {
    Remove-Item -LiteralPath $HelperDir -Recurse -Force
}

Write-Host "[PASS] Temporary bcrypt helper removed" -ForegroundColor Green

# ------------------------------------------------------------
# Verification
# ------------------------------------------------------------

Write-Host ""
Write-Host "[7] Verification" -ForegroundColor Yellow

$verifySql = @"
SELECT
    u.email::text
    || ' | user=' || u.id::text
    || ' | org=' || ou.organisation_id::text
    || ' | org_role=' || ou.role_code
    || ' | auth=' || aa.status
    || ' | user_role=' || r.code
FROM app.users u
JOIN app.organisation_users ou
    ON ou.user_id = u.id
JOIN app.auth_accounts aa
    ON aa.user_id = u.id
JOIN app.user_roles ur
    ON ur.user_id = u.id
JOIN app.roles r
    ON r.id = ur.role_id
WHERE lower(u.email::text) = lower('$OwnerEmail')
  AND r.code = 'owner'
LIMIT 1;
"@

$result = $verifySql |
    docker exec -i $Container psql `
        -U $DbUser `
        -d $Database `
        -tA

if ($LASTEXITCODE -ne 0) {
    throw "Owner verification query failed"
}

if ([string]::IsNullOrWhiteSpace($result)) {
    throw "Owner identity verification failed"
}

Write-Host "[PASS] Owner identity verified" -ForegroundColor Green
Write-Host $result.Trim()

$authCount = (
    docker exec $Container psql `
        -U $DbUser `
        -d $Database `
        -tA `
        -c "SELECT count(*) FROM app.auth_accounts;"
).Trim()

$refreshCount = (
    docker exec $Container psql `
        -U $DbUser `
        -d $Database `
        -tA `
        -c "SELECT count(*) FROM app.auth_refresh_sessions;"
).Trim()

Write-Host ""
Write-Host "Auth accounts    : $authCount"
Write-Host "Refresh sessions : $refreshCount"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " TIAKI OWNER BOOTSTRAP PASSED" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Login : owner@tiaki.local"
Write-Host "Role  : owner"
Write-Host "Org   : TIAKI Platform"
Write-Host ""
