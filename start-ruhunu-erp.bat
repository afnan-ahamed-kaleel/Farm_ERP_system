@echo off
title Ruhunu Farm Pro - System Starter
color 0A

echo ===================================================
echo     STARTING RUHUNU FARM PRO ERP SYSTEM
echo ===================================================
echo.

:: 1. Start Docker Database
echo [1/3] Checking Database (Docker)...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [!] Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting 15 seconds for Docker engine to load...
    timeout /t 15 /nobreak >nul
    docker compose up -d
)
echo [OK] Database is running on port 54320.
echo.

:: 2. Start Backend API
echo [2/3] Starting Backend API on port 3000...
start "Ruhunu ERP - Backend (Port 3000)" cmd /k "cd /d %~dp0backend && npm run start:dev"

:: 3. Start Frontend UI
echo [3/3] Starting Frontend UI on port 51730...
start "Ruhunu ERP - Frontend (Port 51730)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait 5 seconds then open in browser
timeout /t 5 /nobreak >nul
echo Opening ERP System in your browser...
start http://localhost:51730

echo.
echo ===================================================
echo   ALL SYSTEMS ONLINE!
echo   Frontend : http://localhost:51730
echo   Backend  : http://localhost:3000
echo   Database : localhost:54320 (PostgreSQL)
echo ===================================================
timeout /t 5 >nul
