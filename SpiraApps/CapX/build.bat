@echo off
REM ============================================================
REM Build CapX SpiraApp Package
REM ============================================================
cd /d d:\RRRR\SpiraApps\spiraapp-package-generator
call npm run build --input="d:\RRRR\SpiraApps\CapX" --output="d:\RRRR\SpiraApps\CapX"
cd /d d:\RRRR\SpiraApps\CapX
