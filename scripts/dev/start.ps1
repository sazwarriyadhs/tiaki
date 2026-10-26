$ErrorActionPreference = "Stop"

Set-Location "D:\TIAKI"

docker compose up -d

Write-Host ""
Write-Host "TIAKI infrastructure started." -ForegroundColor Green
docker compose ps
