@echo off
cd /d "%~dp0"
set "OLLAMA_HOME=%LOCALAPPDATA%\Programs\Ollama"
if exist "%OLLAMA_HOME%\ollama.exe" set "PATH=%OLLAMA_HOME%;%PATH%"
where ollama >nul 2>&1
if errorlevel 1 (
  echo Ollama is not installed yet. Install it from https://ollama.com/download/windows
  start "" https://ollama.com/download/windows
  pause
  exit /b 1
)
echo Checking the local study model. The first download is about 3 GB.
ollama list | findstr /i /b /c:"qwen3.5:2b" >nul
if errorlevel 1 (
  ollama pull qwen3.5:2b
  if errorlevel 1 (
    echo Ollama could not download the model. Open the Ollama app and try again.
    pause
    exit /b 1
  )
)
start "StudySpark server" /min node server.js
timeout /t 2 /nobreak >nul
start "StudySpark" http://localhost:3000
echo StudySpark is running with its local AI. Keep the minimized server window open while you use it.
pause
