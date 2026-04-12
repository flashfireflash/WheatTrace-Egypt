# WheatTrace Egypt

## Overview
Monorepo for the WheatTrace API (`ASP.NET Core`) and web dashboard (`React + Vite`).

## Requirements
- `.NET SDK 10`
- `Node.js 20+`
- `PostgreSQL`

## Configuration
Copy values from `.env.example` into your local `.env` and `appsettings.Development.json`.

> ⚠️ **CRITICAL WARNING:**
> The system now enforces a strict **Secure By Default** policy.
> You MUST configure `WHEATTRACE_DEFAULT_PASSWORD` and `WHEATTRACE_SUPER_PASSWORD` in your environment variables or local `appsettings.json`.
> If you start the API without setting these secrets, **the system will immediately throw an `InvalidOperationException` and crash** to prevent creating test accounts with known or blank passwords. No fallback passwords exist in the code.

Important backend variables:
- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`

Important script variables:
- `WHEATTRACE_API_BASE_URL`
- `WHEATTRACE_USERNAME`
- `WHEATTRACE_PASSWORD`
- `WHEATTRACE_INSPECTOR_ID`
- `DATABASE_URL`

## Run The API
From the repo root:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=wheattrace;Username=postgres;Password=change_me"
$env:Jwt__Key="replace_with_a_long_random_secret"
$env:Jwt__Issuer="WheatTrace"
$env:Jwt__Audience="WheatTrace"
dotnet run --project .\src\WheatTrace.Api\
```

The API listens using the launch profile in `src/WheatTrace.Api`.

## Run The Web App

```powershell
cd .\apps\web\
npm install --legacy-peer-deps
npm run dev
```

The web app expects the API to be available on the same origin via `/api`, or through your local proxy/setup.

## Tests And Checks
Backend:

```powershell
dotnet test .\WheatTrace.slnx
```

Frontend:

```powershell
cd .\apps\web\
npm test -- --run
npm run build
```

## Helper Scripts
The local Node scripts in the repo root no longer contain embedded credentials.
Before running them, export the required environment variables from `.env.example`.

Example:

```powershell
$env:WHEATTRACE_API_BASE_URL="http://localhost:5036"
$env:WHEATTRACE_USERNAME="admin"
$env:WHEATTRACE_PASSWORD="change_me"
node .\test_users_api.js
```

## Current Notes
- `Ghost mode` remains enabled intentionally.
- `GeneralMonitor` and `OperationsMonitor` keep national scope and use the same national dashboard/map behavior.
- The biggest remaining frontend performance hotspot is the manager area if more route-level splitting is needed later.
