# PowerShell script to provision a Windows Server with BuildKite
# This script follows https://buildkite.com/docs/agent/v3/windows.

# Instructions

# VM creation:
# In Google Cloud Platform, create a Compute Engine instance.
# We recommend machine type n1-highcpu-16 (16 vCPUs, 14.4 GB memory).
# Use a windows boot disk with container support such as
# "Windows Server version 1803 Datacenter Core for Containers".
# Give it a name, then click "Create".

# VM setup:
# In the Compute Engine menu, select "VM Instances". Click on the VM name you chose before.
# Click "Set Windows Password" to choose a username and password.
# Click RDP to open a remote desktop via browser, using the username and password.
# In the Windows command prompt start an elevated powershell by inputing
# "powershell -Command "Start-Process PowerShell -Verb RunAs" followed by Enter.
# Download and execute this script from GitHub, passing the token (mandatory), tags (optional)
# and number of agents (optional) as args:
# ```
# Invoke-WebRequest -Uri https://raw.githubusercontent.com/angular/angular/master/.buildkite/provision-windows-buildkite.ps1 -OutFile provision.ps1
# .\provision.ps1 -token "MY_TOKEN" -tags "windows=true,another_tag=true" -agents 4
# ```
# The VM should restart and be fully configured.

# Creating extra VMs
# You can create an image of the current VM by following the instructions below.
# https://cloud.google.com/compute/docs/instances/windows/creating-windows-os-image
# Then create a new VM and choose "Custom images".


# Script proper.

# Get the token and tags from arguments.
param (
  [Parameter(Mandatory=$true)][string]$token,
  [string]$tags = ""
  [Int]$agents = 1
)

# Allow HTTPS
[Net.ServicePointManager]::SecurityProtocol = "tls12, tls11, tls"

# Helper to add to PATH.
# Will take current PATH so avoid running it after anything to modifies only the powershell session path.
function Add-Path ([string]$newPathItem) {
  $Env:Path+= ";" +  $newPathItem + ";"
  [Environment]::SetEnvironmentVariable("Path",$env:Path, [System.EnvironmentVariableTarget]::Machine)
}

# Install Git for Windows
Write-Host "Installing Git for Windows."
Invoke-WebRequest -Uri https://github.com/git-for-windows/git/releases/download/v2.19.1.windows.1/Git-2.19.1-64-bit.exe -OutFile git.exe
.\git.exe /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh" /DIR="C:\git"
Add-Path "C:\git\bin"
Remove-Item git.exe

# Download NSSM (https://nssm.cc/) to run the BuildKite agent as a service.
Write-Host "Downloading NSSM."
Invoke-WebRequest -Uri https://nssm.cc/ci/nssm-2.24-101-g897c7ad.zip -OutFile nssm.zip
Expand-Archive -Path nssm.zip -DestinationPath C:\nssm
Add-Path "C:\nssm\nssm-2.24-101-g897c7ad\win64"
Remove-Item nssm.zip

# Run the BuildKite agent install script
Write-Host "Installing BuildKite agent."
$env:buildkiteAgentToken = $token
$env:buildkiteAgentTags = $tags
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/buildkite/agent/master/install.ps1'))

# Configure the BuildKite agent clone and timestamp behavior
Add-Content C:\buildkite-agent\buildkite-agent.cfg "`ngit-clone-flags=--config core.autocrlf=input --config core.eol=lf --config core.longpaths=true --config core.symlinks=true`n"
Add-Content C:\buildkite-agent\buildkite-agent.cfg "`ntimestamp-lines=true`n"

# Register the BuildKite agent service using NSSM, so that it persists through restarts and is
# restarted if the process dies.
for ($i=1; $i -le $agents; $i++)
{
  $agentName = "buildkite-agent-$i"
  Write-Host "Registering $agentName as a service."
  nssm.exe install $agentName "C:\buildkite-agent\bin\buildkite-agent.exe" "start"
  nssm.exe set $agentName AppStdout "C:\buildkite-agent\$agentName.log"
  nssm.exe set $agentName AppStderr "C:\buildkite-agent\$agentName.log"
  nssm.exe status $agentName
  nssm.exe start $agentName
  nssm.exe status $agentName
}

# Restart the machine.
Restart-Computer
