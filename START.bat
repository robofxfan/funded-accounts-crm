@echo off
title Funded Accounts CRM
color 0A
echo.
echo  ================================================
echo   FUNDED ACCOUNTS CRM — Starting...
echo  ================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo  [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo  ERROR: npm install failed. Make sure Node.js is installed.
        pause
        exit /b 1
    )
)

echo  [2/3] Setting up database...
call npx prisma db push --skip-generate
call npx tsx prisma/seed.ts

echo  [3/3] Starting server...
echo.
echo  ================================================
echo   App running at: http://localhost:3000
echo.
echo   Admin:      username=admin    password=admin123
echo   Accountant: username=accounts password=accounts123
echo  ================================================
echo.
start "" http://localhost:3000
call npx next dev
pause
