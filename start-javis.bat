@echo off
chcp 65001 >nul
title Khoi dong Javis OS
cd /d "%~dp0"
set "CONG=7777"
for /f "tokens=1,* delims==" %%a in ('findstr /b /i "JAVIS_PORT=" .env 2^>nul') do set "CONG=%%b"

echo Bat Javis OS chay NEN - khong con cua so den (port %CONG%)...
REM Viec tat instance cu + chay server AN giao het cho start-javis.vbs (cua so an hoan toan).
REM Log ghi vao server\javis.log (mo file do neu can xem loi). Tat server: stop-javis.bat.
wscript //nologo start-javis.vbs

echo.
echo Da bat. Cho ~10 giay roi mo http://localhost:%CONG% va bam Ctrl+Shift+R.
echo (Tat server: chay stop-javis.bat. Xem loi: mo file server\javis.log)
timeout /t 4 >nul
