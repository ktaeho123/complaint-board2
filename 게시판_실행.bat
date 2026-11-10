@echo off
chcp 65001 > nul
echo ===================================================
echo   학과 소통 ^& 불만 게시판을 시작합니다...
echo ===================================================

cd /d "%~dp0"

echo 1. 웹 브라우저를 엽니다: http://localhost:3000
start http://localhost:3000

echo 2. 개발 서버를 실행합니다...
npm run dev
pause

