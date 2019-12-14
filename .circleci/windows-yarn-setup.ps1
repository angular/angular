# Use our local, vendored yarn in the global `yarn` command.
$globalYarnDir = "$HOME\AppData\Roaming\yarn"
$localYarnPath = & ${Env:ProgramFiles}\nodejs\node.exe ".\.circleci\get-vendored-yarn-path.js"

# Create a directory to put the yarn PowerShell script.
New-Item -Path "$globalYarnDir" -ItemType "directory" >$null

# Create the yarn PowerShell script (using the inferred path to the local yarn script).
Get-Content -Path ".\.circleci\windows-yarn.ps1.template" |
  %{$_ -replace "{{ LOCAL_YARN_PATH_PLACEHOLDER }}", "$localYarnPath"} |
  Add-Content -Path "$globalYarnDir\yarn.ps1"

# Add the directory containing the yarn PowerShell script to `PATH`.
Add-Content -Path $profile -Value ('$Env:path = "{0};" + $Env:path' -f $globalYarnDir)
