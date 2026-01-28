@echo off
echo Running Design Evaluation Analysis...
echo.

REM Change to project root directory (parent of scripts folder)
cd /d "%~dp0.."

node scripts/analyze-design.js

echo.
echo Analysis complete! Check design-analysis-report.json for detailed results.
pause
