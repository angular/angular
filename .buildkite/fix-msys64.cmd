@echo off
REM Fix for https://github.com/docker/for-win/issues/2920
REM echo "Fixing msys64 folder..."
REM Touch all .dll files inside C:\msys64\
forfiles /p C:\msys64\ /s /m *.dll /c "cmd /c Copy /B @path+,, >NUL"
REM echo "Fixed msys64 folder."
