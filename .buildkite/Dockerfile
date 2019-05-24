# Heavily based on https://github.com/StefanScherer/dockerfiles-windows/ images.
# Combines the node windowsservercore image with the Bazel Prerequisites (https://docs.bazel.build/versions/master/install-windows.html).
# msys install taken from https://github.com/StefanScherer/dockerfiles-windows/issues/30
# VS redist install taken from https://github.com/StefanScherer/dockerfiles-windows/blob/master/apache/Dockerfile
# The nanoserver image won't work because MSYS2 does not run in it https://github.com/Alexpux/MSYS2-packages/issues/1493

# Before building this image, you must locally build node-windows:10.13.0-windowsservercore-1803.
# Clone https://github.com/StefanScherer/dockerfiles-windows/commit/4ce7101a766b9b880ac262479dd9126b64d656cf and build using
# docker build -t node-windows:10.13.0-windowsservercore-1803 --build-arg core=microsoft/windowsservercore:1803 --build-arg target=microsoft/windowsservercore:1803 .
FROM node-windows:10.13.0-windowsservercore-1803

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Install 7zip to extract msys2
RUN Invoke-WebRequest -UseBasicParsing 'https://www.7-zip.org/a/7z1805-x64.exe' -OutFile 7z.exe
# For some reason the last letter in the destination directory is lost. So '/D=C:\\7zip0' will extract to '/D=C:\\7zip'.
RUN Start-Process -FilePath 'C:\\7z.exe' -ArgumentList '/S', '/D=C:\\7zip0' -NoNewWindow -Wait

# Extract msys2
RUN Invoke-WebRequest -UseBasicParsing 'http://repo.msys2.org/distrib/x86_64/msys2-base-x86_64-20180531.tar.xz' -OutFile msys2.tar.xz
RUN Start-Process -FilePath 'C:\\7zip\\7z' -ArgumentList 'e', 'msys2.tar.xz' -Wait
RUN Start-Process -FilePath 'C:\\7zip\\7z' -ArgumentList 'x', 'msys2.tar', '-oC:\\' -Wait
RUN Remove-Item msys2.tar.xz
RUN Remove-Item msys2.tar
RUN Remove-Item 7z.exe
RUN Remove-Item -Recurse 7zip

# Add MSYS2 to PATH, and set BAZEL_SH
RUN [Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\msys64\usr\bin', [System.EnvironmentVariableTarget]::Machine)
RUN [Environment]::SetEnvironmentVariable('BAZEL_SH', 'C:\msys64\usr\bin\bash.exe', [System.EnvironmentVariableTarget]::Machine)

# Install Microsoft Visual C++ Redistributable for Visual Studio 2015
RUN Invoke-WebRequest -UseBasicParsing 'https://download.microsoft.com/download/9/3/F/93FCF1E7-E6A4-478B-96E7-D4B285925B00/vc_redist.x64.exe' -OutFile vc_redist.x64.exe
RUN Start-Process 'c:\\vc_redist.x64.exe' -ArgumentList '/Install', '/Passive', '/NoRestart' -NoNewWindow -Wait
RUN Remove-Item vc_redist.x64.exe

# Add a fix for https://github.com/docker/for-win/issues/2920 as entry point to the container.
SHELL ["cmd", "/c"]
COPY "fix-msys64.cmd" "C:\\fix-msys64.cmd"
ENTRYPOINT cmd /C C:\\fix-msys64.cmd && cmd /c

CMD ["cmd.exe"]
