@echo off
REM ============================================================
REM RALPH WIGGUM - SpiraXCapture Development Loop
REM ============================================================
REM Usage: ralph.bat
REM Stop: Ctrl+C
REM ============================================================

setlocal enabledelayedexpansion

set ITERATION=0
set MAX_ITERATIONS=50
set LOG_DIR=output
set PROMPT_FILE=PROMPT.md

echo ============================================================
echo  RALPH WIGGUM - SpiraXCapture Development
echo ============================================================
echo  Prompt: %PROMPT_FILE%
echo  Max iterations: %MAX_ITERATIONS%
echo  Press Ctrl+C to stop
echo ============================================================

if not exist %LOG_DIR% mkdir %LOG_DIR%

:loop
set /a ITERATION+=1

if %ITERATION% gtr %MAX_ITERATIONS% (
    echo.
    echo [RALPH] Max iterations reached: %MAX_ITERATIONS%
    goto :end
)

echo.
echo ============================================================
echo [RALPH] Iteration %ITERATION% / %MAX_ITERATIONS% - %date% %time%
echo ============================================================

REM Execute Claude Code with the prompt
claude --print "%CD%\%PROMPT_FILE%" 2>&1

REM Check if manifest.yaml and capture.js exist
if exist manifest.yaml (
    if exist capture.js (
        echo.
        echo [RALPH] Files created, checking validity...

        REM Try to generate package
        cd ..\..\spiraapp-package-generator 2>nul
        if exist package.json (
            call npm run build -- --input="..\SpiraApps\SpiraXCapture" --output="..\SpiraApps\SpiraXCapture" 2>&1
            if !errorlevel! equ 0 (
                echo.
                echo ============================================================
                echo [RALPH] SUCCESS! Package generated at iteration %ITERATION%
                echo ============================================================
                cd ..\SpiraApps\SpiraXCapture
                goto :end
            )
            cd ..\SpiraApps\SpiraXCapture
        ) else (
            echo [RALPH] Package generator not found, continuing...
        )
    )
)

REM Small delay between iterations
timeout /t 2 /nobreak >nul

goto :loop

:end
echo.
echo [RALPH] Session complete after %ITERATION% iterations
echo [RALPH] Check output in: %CD%
pause
