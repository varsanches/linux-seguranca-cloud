@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 goto sempython
echo VozKriolu Studio - a abrir em http://localhost:8080  (feche esta janela para parar)
start "" http://localhost:8080/
python -m http.server 8080 --bind 127.0.0.1 --protocol HTTP/1.1
goto fim
:sempython
echo Precisa de Python 3 (https://python.org). Em alternativa, abra index.html diretamente (com limites: ver LEIA-ME.md).
:fim
pause
