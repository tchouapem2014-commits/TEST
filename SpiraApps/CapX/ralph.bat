@echo off
REM ============================================================
REM RALPH WIGGUM - CapX Development Loop v1.0
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
echo  RALPH WIGGUM - CapX Development
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

REM Check JavaScript syntax first
if exist capx.js (
    echo [RALPH] Checking JavaScript syntax...
    node -c capx.js >nul 2>&1
    if !errorlevel! neq 0 (
        echo [RALPH] WARNING: JavaScript syntax errors detected
        echo [RALPH] Running Claude to fix...
    ) else (
        echo [RALPH] Syntax OK
    )
)

REM Execute Claude Code with the prompt file
REM --print reads the prompt, --dangerously-skip-permissions for automation
claude --print "%CD%\%PROMPT_FILE%" --dangerously-skip-permissions 2>&1 | findstr /C:"%COMPLETION_MARKER%" >nul

if !errorlevel! equ 0 (
    echo.
    echo ============================================================
    echo [RALPH] SUCCESS! Completion marker found at iteration %ITERATION%
    echo ============================================================

    REM Final syntax check
    echo [RALPH] Final syntax verification...
    node -c capx.js >nul 2>&1
    if !errorlevel! neq 0 (
        echo [RALPH] ERROR: Final syntax check failed!
        echo [RALPH] Continuing loop to fix...
        timeout /t 3 /nobreak >nul
        goto :loop
    )

    REM Try to generate package
    echo [RALPH] Generating SpiraApp package...
    cd ..\spiraapp-package-generator 2>nul
    if exist package.json (
        call npm run build --input="%CD%\..\CapX" 2>&1
        if !errorlevel! equ 0 (
            echo [RALPH] Package generated successfully!
            for %%f in (*.spiraapp) do (
                move /Y "%%f" "..\CapX\" >nul 2>&1
                echo [RALPH] Moved %%f to CapX folder
            )
        ) else (
            echo [RALPH] Package generation failed
            echo [RALPH] Check spiraapp-package-generator configuration
        )
        cd ..\CapX
    ) else (
        cd ..\CapX
        echo [RALPH] Package generator not found at ..\spiraapp-package-generator
        echo [RALPH] Manual package generation required
    )
    goto :end
)

REM Small delay between iterations to avoid rate limiting
echo [RALPH] No completion marker found, continuing...
timeout /t 3 /nobreak >nul

goto :loop

:end
echo.
echo ============================================================
echo [RALPH] Session complete after %ITERATION% iterations
echo [RALPH] Review changes in: %CD%
echo ============================================================
echo.
echo Files in project:
dir /b *.js *.yaml *.md *.spiraapp 2>nul
echo.
pause
