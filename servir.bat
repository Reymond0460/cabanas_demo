@echo off
rem Abre la demo en http://localhost:5173 (necesita Python instalado)
cd /d "%~dp0"
start "" http://localhost:5173
python -m http.server 5173
