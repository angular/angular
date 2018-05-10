#!/bin/bash
set -eu -o pipefail

# Set up env variables for production
export AIO_CIRCLE_CI_TOKEN=$(head -c -1 /aio-secrets/CIRCLE_CI_TOKEN 2>/dev/null || echo "MISSING_CIRCLE_CI_TOKEN")
export AIO_GITHUB_TOKEN=$(head -c -1 /aio-secrets/GITHUB_TOKEN 2>/dev/null || echo "MISSING_GITHUB_TOKEN")

# Start the upload-server instance
action=$([ "$1" == "stop" ] && echo "stop" || echo "start")
pm2 $action $AIO_SCRIPTS_JS_DIR/dist/lib/upload-server \
  --uid $AIO_WWW_USER \
  --log /var/log/aio/upload-server-prod.log \
  --name aio-upload-server-prod \
  ${@:2}
