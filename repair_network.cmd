@echo off
echo Clearing the routing tables of all gateways...
route -f >nul 2>nul
echo.

echo Releasing the IP address...
ipconfig /release >nul 2>nul
echo.

echo Renewing the IP address...
ipconfig /renew >nul 2>nul
echo.

echo Flushing Address Resolution Protocol (ARP) cache...
arp -d * >nul 2>nul
echo.

echo Reloading the NetBIOS name cache...
nbtstat -R >nul 2>nul
echo.

echo Sending NetBIOS name update...
nbtstat -RR >nul 2>nul
echo.

echo Flushing Domain Name System (DNS) cache...
ipconfig /flushdns >nul 2>nul
echo.

echo Registering DNS name...
ipconfig /registerdns >nul 2>nul
echo.

echo Completed.
pause