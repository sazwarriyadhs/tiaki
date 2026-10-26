$ErrorActionPreference = "Stop"

Set-Location "D:\TIAKI"

Write-Host "Running TIAKI tests..." -ForegroundColor Cyan

if (Test-Path "services\api") {
    Push-Location "services\api"

    if (Get-Command go -ErrorAction SilentlyContinue) {
        go test ./...
    }
    else {
        Write-Host "Go not installed - skipped API tests." -ForegroundColor Yellow
    }

    Pop-Location
}

Write-Host "Tests completed." -ForegroundColor Green
