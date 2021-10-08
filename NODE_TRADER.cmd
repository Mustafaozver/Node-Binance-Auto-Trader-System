@echo off
title NodeJS Runner By Mustafa
cls
echo.
echo Node
node --version
node --max-old-space-size=10000 NODE_TRADER.js
pause