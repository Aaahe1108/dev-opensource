@echo off
rem dev-opensource 构建脚本：输出到 .vitepress/dist
setlocal
set "PATH=D:\1\2;D:\1\2\devtools;%PATH%"
cd /d "%~dp0"
call "D:\1\2\devtools\pnpm.cmd" run build
echo.
echo 构建完成，静态文件位于 .vitepress\dist\
pause
endlocal
