#!/bin/bash
set -e -o pipefail

exec >> /var/log/aio/init.log
exec 2>&1

# Start the services
echo [`date`] - Starting services...
service rsyslog start
service cron start
service dnsmasq start
service nginx start
service pm2-root start
aio-upload-server-prod start
echo [`date`] - Services started successfully.
