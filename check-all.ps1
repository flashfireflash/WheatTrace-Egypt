param(
    [switch]$SkipFrontend = $false
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "WheatTrace Egypt - Unified Check Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Building Backend..." -ForegroundColor Yellow
dotnet build .\WheatTrace.slnx
if ($LASTEXITCODE -ne 0) { Write-Host "Backend build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n[2/4] Running Backend Tests..." -ForegroundColor Yellow
dotnet test .\WheatTrace.slnx
if ($LASTEXITCODE -ne 0) { Write-Host "Backend tests failed!" -ForegroundColor Red; exit 1 }

if (-not $SkipFrontend) {
    Write-Host "`n[3/4] Building Frontend..." -ForegroundColor Yellow
    cd .\apps\web\
    cmd /c npm ci --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) { Write-Host "Frontend npm ci failed!" -ForegroundColor Red; cd ..\..\; exit 1 }

    cmd /c npm run build
    if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed!" -ForegroundColor Red; cd ..\..\; exit 1 }

    Write-Host "`n[4/4] NPM Security Audit..." -ForegroundColor Yellow
    cmd /c npm audit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend audit failed vulnerabilities found!" -ForegroundColor Red
        cd ..\..\
        exit 1
    }
    Write-Host "Audit completed." -ForegroundColor Green
    cd ..\..\
} else {
    Write-Host "`nSkipping Frontend checks as requested..." -ForegroundColor DarkGray
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ All System Checks Passed Successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
