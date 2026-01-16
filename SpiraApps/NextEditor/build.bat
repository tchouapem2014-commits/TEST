@echo off
REM ============================================================
REM NextEditor Quick Build
REM ============================================================
REM Usage: build.bat [minimal|standard|full]
REM ============================================================

setlocal

set MODE=%1
if "%MODE%"=="" set MODE=standard

echo.
echo NextEditor Build - %MODE% mode
echo.

if "%MODE%"=="minimal" (
    powershell -ExecutionPolicy Bypass -File "%~dp0build-optimized.ps1" -Minimal -Report
) else if "%MODE%"=="full" (
    powershell -ExecutionPolicy Bypass -File "%~dp0build-optimized.ps1" -Full -Report
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0build-optimized.ps1" -Report
)

echo.
pause
