@echo off
echo ========================================
echo BVC-KU Vehicle Booking System
echo Starting Server...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
