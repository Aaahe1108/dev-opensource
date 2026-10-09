@echo off
rem dev-opensource 本地开发启动脚本
rem 使用 D:\1\2 自带的 Node.js + D:\1\2\devtools 中的 pnpm（无需全局安装）
setlocal
set "PATH=D:\1\2;D:\1\2\devtools;%PATH%"
cd /d "%~dp0"
call "D:\1\2\devtools\pnpm.cmd" dev
endlocal
