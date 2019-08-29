#!/bin/bash
# Using `+e` so that all checks are run and we get a complete report (even if some checks failed).
set +e -u -o pipefail


# Variables
exitCode=0


# Helpers
function reportStatus {
  local lastExitCode=$?
  echo "$1: $([[ $lastExitCode -eq 0 ]] && echo OK || echo NOT OK)"
  [[ $lastExitCode -eq 0 ]] || exitCode=1
}


# Check services
services=(
  rsyslog
  cron
  nginx
  pm2-root
)
for s in ${services[@]}; do
  service $s status > /dev/null
  reportStatus "Service '$s'"
done


# Check servers
origins=(
  http://$AIO_PREVIEW_SERVER_HOSTNAME:$AIO_PREVIEW_SERVER_PORT
  http://$AIO_NGINX_HOSTNAME:$AIO_NGINX_PORT_HTTP
  https://$AIO_NGINX_HOSTNAME:$AIO_NGINX_PORT_HTTPS
)
for o in ${origins[@]}; do
  curl --fail --silent $o/health-check > /dev/null
  reportStatus "Server '$o'"
done


# Check resolution of external URLs
origins=(
  https://google.com
)
for o in ${origins[@]}; do
  curl --fail --silent $o > /dev/null
  reportStatus "External URL '$o'"
done


# Exit
exit $exitCode
