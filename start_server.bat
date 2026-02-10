@echo off
title POS Server
cd /d "d:\MDP"
echo Starting POS Server on http://localhost:3000
echo Press Ctrl+C to stop the server
python -m http.server 3000 --bind 0.0.0.0
pause
