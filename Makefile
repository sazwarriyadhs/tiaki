.PHONY: dev build test migrate seed verify

dev:
    powershell -ExecutionPolicy Bypass -File scripts/dev/start.ps1

build:
    powershell -ExecutionPolicy Bypass -File scripts/build/build-all.ps1

test:
    powershell -ExecutionPolicy Bypass -File scripts/verify/test-all.ps1

migrate:
    powershell -ExecutionPolicy Bypass -File scripts/db/run-migrations.ps1

seed:
    powershell -ExecutionPolicy Bypass -File scripts/seed/seed-all.ps1

verify:
    powershell -ExecutionPolicy Bypass -File scripts/verify/verify-platform.ps1
