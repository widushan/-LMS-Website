@echo off
REM Design Evaluation Analysis - Run from project root
echo Running Design Evaluation Analysis...
echo.

node scripts/analyze-design.js

echo.
echo Analysis complete! Check design-analysis-report.json for detailed results.
pause
