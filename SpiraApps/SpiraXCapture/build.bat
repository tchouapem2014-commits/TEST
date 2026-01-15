@echo off
REM Build SpiraXCapture package

set npm_config_input=d:\RRRR\SpiraApps\SpiraXCapture
set npm_config_output=d:\RRRR\SpiraApps\SpiraXCapture

cd /d d:\RRRR\SpiraApps\spiraapp-package-generator
node index.js

echo.
echo Build complete. Check for .spiraapp file in SpiraXCapture folder.
pause
