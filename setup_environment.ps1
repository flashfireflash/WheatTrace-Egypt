# setup_environment.ps1
# Automates the full setup for the secure, free local test environment + Local AI

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " WheatTrace Egypt - Local Test Env Setup       " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Check Python & Install Semgrep
Write-Host ">>> Checking for Python (required for Semgrep)..." -ForegroundColor Yellow
if (Get-Command 'python' -ErrorAction SilentlyContinue) {
    Write-Host "Python found! Installing Semgrep..." -ForegroundColor Green
    python -m pip install semgrep
} else {
    Write-Host "[WARNING] Python not found via command line. Semgrep requires Python." -ForegroundColor Red
    Write-Host "Please install Python from python.org or Windows Store to use Semgrep locally." -ForegroundColor Red
}

# 2. Setup Ollama
Write-Host "`n>>> Checking for Ollama..." -ForegroundColor Yellow
if (Get-Command 'ollama' -ErrorAction SilentlyContinue) {
    Write-Host "Ollama is already installed! Pulling Mistral model..." -ForegroundColor Green
    ollama pull mistral
} else {
    Write-Host "Ollama not found. Please download it from https://ollama.com/download/windows" -ForegroundColor Magenta
    Write-Host "Once installed run: ollama pull mistral" -ForegroundColor Magenta
}

# 3. Frontend Dependencies Install
Write-Host "`n>>> Installing testing dependencies for the Vite React Frontend..." -ForegroundColor Yellow
Set-Location -Path "apps\web" -ErrorAction Stop

Write-Host "Installing vitest, jsdom, and testing-library components..." -ForegroundColor Green
cmd.exe /c "npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8 --legacy-peer-deps"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host " SETUP COMPLETE!" -ForegroundColor Green
Write-Host " To run all tests and security checks:"
Write-Host " cd apps/web"
Write-Host " npm run all"
Write-Host "===============================================" -ForegroundColor Cyan
