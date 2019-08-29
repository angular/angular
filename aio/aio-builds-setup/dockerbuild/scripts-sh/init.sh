#!/bin/bash
set -eu -o pipefail

exec >> /var/log/aio/init.log
exec 2>&1

# Start the services
echo [`date`] - Starting services...
mkdir -p $AIO_NGINX_LOGS_DIR
mkdir -p $TEST_AIO_NGINX_LOGS_DIR

service rsyslog start
service cron start
service dnsmasq start
service nginx start
service pm2-root start
aio-preview-server-prod start
echo [`date`] - Services started successfully.
