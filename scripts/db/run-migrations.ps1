$ErrorActionPreference = "Stop"

$ROOT = "D:\TIAKI"
$MIGRATIONS = Join-Path $ROOT "db\migrations"
$ENV_FILE = Join-Path $ROOT ".env"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TIAKI DATABASE MIGRATIONS" -ForegroundColor Cyan
Write-Host " Production Docker-Native Migration Runner" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# LOAD ENV
# ============================================================

if (-not (Test-Path $ENV_FILE)) {
    throw ".env not found: $ENV_FILE"
}

$envMap = @{}

Get-Content $ENV_FILE | ForEach-Object {
    $line = $_.Trim()

    if (
        $line -and
        -not $line.StartsWith("#") -and
        $line.Contains("=")
    ) {
        $parts = $line.Split("=", 2)
        $envMap[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$container = if ($envMap.ContainsKey("POSTGRES_CONTAINER")) {
    $envMap["POSTGRES_CONTAINER"]
} else {
    "tiaki-postgres"
}

$db = if ($envMap.ContainsKey("POSTGRES_DB")) {
    $envMap["POSTGRES_DB"]
} else {
    "tiaki"
}

$dbUser = if ($envMap.ContainsKey("POSTGRES_USER")) {
    $envMap["POSTGRES_USER"]
} else {
    "tiaki"
}

# ============================================================
# DOCKER CHECK
# ============================================================

Write-Host "[CHECK] PostgreSQL container" -ForegroundColor Yellow

$state = docker inspect `
    --format "{{.State.Status}}" `
    $container 2>$null

if ($LASTEXITCODE -ne 0 -or $state -ne "running") {
    throw "PostgreSQL container '$container' is not running."
}

Write-Host "[PASS] $container running" -ForegroundColor Green

$health = docker inspect `
    --format "{{.State.Health.Status}}" `
    $container 2>$null

if ($health -ne "healthy") {
    throw "PostgreSQL container '$container' is not healthy. Current state: $health"
}

Write-Host "[PASS] PostgreSQL healthy" -ForegroundColor Green

# ============================================================
# PSQL HELPER
# ============================================================

function Invoke-Psql {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Sql
    )

    $output = docker exec `
        $container `
        psql `
        -X `
        -v ON_ERROR_STOP=1 `
        -U $dbUser `
        -d $db `
        -t `
        -A `
        -c $Sql

    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL command failed."
    }

    return ($output -join "`n").Trim()
}

function Invoke-PsqlFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$File
    )

    $tmp = "/tmp/tiaki-migration.sql"

    docker cp $File "${container}:${tmp}"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to copy migration file into PostgreSQL container."
    }

    try {

        docker exec `
            $container `
            psql `
            -X `
            -v ON_ERROR_STOP=1 `
            -U $dbUser `
            -d $db `
            -f $tmp

        if ($LASTEXITCODE -ne 0) {
            throw "Migration SQL failed: $File"
        }

    }
    finally {

        docker exec `
            $container `
            rm `
            -f `
            $tmp 2>$null | Out-Null
    }
}

# ============================================================
# DATABASE READY
# ============================================================

Write-Host ""
Write-Host "[CHECK] Database readiness" -ForegroundColor Yellow

$ready = Invoke-Psql "SELECT 1;"

if ($ready -ne "1") {
    throw "Database readiness check failed."
}

Write-Host "[PASS] Database ready: $db" -ForegroundColor Green

# ============================================================
# VALIDATE EXISTING LEDGER STRUCTURE
# ============================================================

Write-Host ""
Write-Host "[CHECK] Migration ledger structure" -ForegroundColor Yellow

$ledgerColumns = Invoke-Psql @"
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schema_migrations'
ORDER BY ordinal_position;
"@

$requiredColumns = @(
    "version",
    "filename",
    "checksum",
    "applied_at",
    "execution_ms"
)

foreach ($required in $requiredColumns) {

    if ($ledgerColumns -notmatch "(?m)^$required$") {
        throw "schema_migrations is missing required column: $required"
    }
}

Write-Host "[PASS] schema_migrations structure verified" -ForegroundColor Green

# ============================================================
# DISCOVER MIGRATIONS
# ============================================================

$files = Get-ChildItem `
    -Path $MIGRATIONS `
    -Filter "*.sql" `
    -File |
    Sort-Object Name

if ($files.Count -eq 0) {
    throw "No migration files found in $MIGRATIONS"
}

Write-Host ""
Write-Host "Migration files : $($files.Count)" -ForegroundColor White

# ============================================================
# VALIDATE SEQUENCE
# ============================================================

$expected = 1

foreach ($file in $files) {

    if ($file.Name -notmatch "^(\d{3})_.+\.sql$") {
        throw "Invalid migration filename: $($file.Name)"
    }

    $version = [int]$Matches[1]

    if ($version -ne $expected) {
        throw "Migration sequence error. Expected $expected but found $version in $($file.Name)"
    }

    $expected++
}

$latestVersion = $expected - 1

Write-Host "[PASS] Migration sequence 001-$('{0:D3}' -f $latestVersion)" -ForegroundColor Green

# ============================================================
# DESTRUCTIVE SQL GUARD
# ============================================================

$destructivePatterns = @(
    '(?im)\bDROP\s+DATABASE\b',
    '(?im)\bDROP\s+SCHEMA\b',
    '(?im)\bTRUNCATE\b',
    '(?im)\bDROP\s+TABLE\b'
)

foreach ($file in $files) {

    $content = Get-Content `
        -Path $file.FullName `
        -Raw

    foreach ($pattern in $destructivePatterns) {

        if ($content -match $pattern) {
            throw "Destructive SQL detected in $($file.Name): $pattern"
        }
    }
}

Write-Host "[PASS] Destructive SQL guard" -ForegroundColor Green

# ============================================================
# LOAD APPLIED MIGRATIONS
# ============================================================

$rows = Invoke-Psql @"
SELECT
    version || '|' ||
    filename || '|' ||
    checksum
FROM public.schema_migrations
ORDER BY version;
"@

$applied = @{}

if ($rows) {

    foreach ($line in ($rows -split "`r?`n")) {

        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $parts = $line.Split("|", 3)

        if ($parts.Count -ne 3) {
            throw "Invalid schema_migrations row: $line"
        }

        $version = [int]$parts[0]
        $filename = $parts[1]
        $checksum = $parts[2]

        $applied[$filename] = @{
            Version = $version
            Checksum = $checksum
        }
    }
}

Write-Host "Database records: $($applied.Count)" -ForegroundColor White

# ============================================================
# APPLY MIGRATIONS
# ============================================================

$appliedNow = 0
$skipped = 0

foreach ($file in $files) {

    if ($file.Name -notmatch "^(\d{3})_(.+)\.sql$") {
        throw "Invalid migration filename: $($file.Name)"
    }

    $version = [int]$Matches[1]
    $name = $file.Name

    $sha = (
        Get-FileHash `
            -Path $file.FullName `
            -Algorithm SHA256
    ).Hash.ToLowerInvariant()

    # --------------------------------------------------------
    # Already applied
    # --------------------------------------------------------

    if ($applied.ContainsKey($name)) {

        $record = $applied[$name]

        if ($record.Version -ne $version) {
            throw @"
MIGRATION VERSION DRIFT

Migration : $name
Filesystem: $version
Database  : $($record.Version)
"@
        }

        if ($record.Checksum -ne $sha) {
            throw @"
MIGRATION CHECKSUM DRIFT

Migration : $name
Version   : $version
Database  : $($record.Checksum)
Filesystem: $sha

Applied migrations are immutable.
Create a NEW migration instead.
"@
        }

        Write-Host "[SKIP] $name" -ForegroundColor DarkGray

        $skipped++
        continue
    }

    # --------------------------------------------------------
    # New migration
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "[APPLY] $name" -ForegroundColor Yellow

    $started = [DateTime]::UtcNow

    Invoke-PsqlFile $file

    $elapsed = (
        [DateTime]::UtcNow - $started
    ).TotalMilliseconds

    $executionMs = [Math]::Max(
        0,
        [int64][Math]::Round($elapsed)
    )

    $escapedName = $name.Replace("'", "''")
    $escapedSha = $sha.Replace("'", "''")

    # IMPORTANT:
    # Existing production ledger requires:
    # version, filename, checksum, applied_at, execution_ms

    Invoke-Psql @"
INSERT INTO public.schema_migrations
(
    version,
    filename,
    checksum,
    applied_at,
    execution_ms
)
VALUES
(
    $version,
    '$escapedName',
    '$escapedSha',
    now(),
    $executionMs
);
"@ | Out-Null

    Write-Host "[PASS] $name ($executionMs ms)" -ForegroundColor Green

    $appliedNow++
}

# ============================================================
# FINAL VERIFICATION
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " FINAL MIGRATION VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$ledgerCount = [int](Invoke-Psql @"
SELECT count(*)
FROM public.schema_migrations;
"@)

if ($ledgerCount -ne $files.Count) {
    throw "Migration ledger mismatch. Files=$($files.Count), Database=$ledgerCount"
}

Write-Host "[PASS] Migration ledger : $ledgerCount/$($files.Count)" -ForegroundColor Green

$maxVersion = [int](Invoke-Psql @"
SELECT COALESCE(MAX(version), 0)
FROM public.schema_migrations;
"@)

if ($maxVersion -ne $latestVersion) {
    throw "Latest migration version mismatch. Expected=$latestVersion Actual=$maxVersion"
}

Write-Host "[PASS] Latest version   : $('{0:D3}' -f $maxVersion)" -ForegroundColor Green

# ============================================================
# CHECKSUM VERIFICATION
# ============================================================

$drift = 0

foreach ($file in $files) {

    $version = [int]$file.Name.Substring(0, 3)

    $sha = (
        Get-FileHash `
            -Path $file.FullName `
            -Algorithm SHA256
    ).Hash.ToLowerInvariant()

    $escapedName = $file.Name.Replace("'", "''")

    $dbSha = Invoke-Psql @"
SELECT checksum
FROM public.schema_migrations
WHERE version = $version
  AND filename = '$escapedName';
"@

    if ($dbSha -ne $sha) {

        Write-Host "[FAIL] Checksum: $($file.Name)" -ForegroundColor Red

        $drift++
    }
}

if ($drift -ne 0) {
    throw "Checksum verification failed: $drift migration(s)."
}

Write-Host "[PASS] All migration checksums verified" -ForegroundColor Green

# ============================================================
# FINAL STATUS
# ============================================================

$latest = $files[-1]

Write-Host ""
Write-Host "Migration files : $($files.Count)" -ForegroundColor White
Write-Host "Database records: $ledgerCount" -ForegroundColor White
Write-Host "Applied now     : $appliedNow" -ForegroundColor White
Write-Host "Skipped         : $skipped" -ForegroundColor White
Write-Host "Latest          : $($latest.Name)" -ForegroundColor White
Write-Host "Checksum        : VERIFIED" -ForegroundColor Green
Write-Host "Destructive ops : NONE" -ForegroundColor Green
Write-Host "Database        : $db" -ForegroundColor White
Write-Host "Container       : $container" -ForegroundColor White
Write-Host ""
Write-Host "TIAKI DATABASE MIGRATIONS PASSED" -ForegroundColor Green
Write-Host "STATUS          : READY" -ForegroundColor Green
Write-Host ""
