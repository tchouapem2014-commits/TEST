@echo off
REM ============================================================
REM RALPH WIGGUM - SpiraXCapture Development Loop v2.0
REM ============================================================
REM Inspired by: https://github.com/frankbria/ralph-claude-code
REM Usage: ralph.bat [max_iterations]
REM Stop: Ctrl+C
REM ============================================================

setlocal enabledelayedexpansion

set ITERATION=0
set MAX_ITERATIONS=%1
if "%MAX_ITERATIONS%"=="" set MAX_ITERATIONS=30
set PROMPT_FILE=PROMPT.md
set COMPLETION_MARKER=COMPLETE

echo ============================================================
echo  RALPH WIGGUM - SpiraXCapture Modernization
echo ============================================================
echo  Prompt: %PROMPT_FILE%
echo  Max iterations: %MAX_ITERATIONS%
echo  Completion marker: ^<promise^>%COMPLETION_MARKER%^</promise^>
echo  Press Ctrl+C to stop
echo ============================================================
echo.

:loop
set /a ITERATION+=1

if %ITERATION% gtr %MAX_ITERATIONS% (
    echo.
    echo [RALPH] Max iterations reached: %MAX_ITERATIONS%
    echo [RALPH] Consider reviewing progress and adjusting PROMPT.md
    goto :end
)

echo.
echo ============================================================
echo [RALPH] Iteration %ITERATION% / %MAX_ITERATIONS% - %date% %time%
echo ============================================================

REM Execute Claude Code with the prompt file
REM --print reads the prompt, --dangerously-skip-permissions for automation
claude --print "%CD%\%PROMPT_FILE%" --dangerously-skip-permissions 2>&1 | findstr /C:"%COMPLETION_MARKER%" >nul

if !errorlevel! equ 0 (
    echo.
    echo ============================================================
    echo [RALPH] SUCCESS! Completion marker found at iteration %ITERATION%
    echo ============================================================

    REM Try to generate package
    echo [RALPH] Generating SpiraApp package...
    cd ..\spiraapp-package-generator 2>nul
    if exist package.json (
        call npm run build --input="%CD%\..\SpiraXCapture" 2>&1
        if !errorlevel! equ 0 (
            echo [RALPH] Package generated successfully!
            move /Y *.spiraapp "..\SpiraXCapture\" >nul 2>&1
        ) else (
            echo [RALPH] Package generation failed, but code may be complete
        )
        cd ..\SpiraXCapture
    ) else (
        cd ..\SpiraXCapture
        echo [RALPH] Package generator not found
    )
    goto :end
)

REM Check if files exist and try to build anyway
if exist capture.js (
    echo [RALPH] Checking syntax...
    node -c capture.js >nul 2>&1
    if !errorlevel! neq 0 (
        echo [RALPH] JavaScript syntax errors detected, continuing...
    )
)

REM Small delay between iterations to avoid rate limiting
timeout /t 3 /nobreak >nul

goto :loop

:end
echo.
echo ============================================================
echo [RALPH] Session complete after %ITERATION% iterations
echo [RALPH] Review changes in: %CD%
echo ============================================================
pause
