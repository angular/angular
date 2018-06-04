#!/bin/bash
set -eu -o pipefail

# Set up env variables for production
export AIO_GITHUB_TOKEN=$(head -c -1 /aio-secrets/GITHUB_TOKEN 2>/dev/null || echo "MISSING_GITHUB_TOKEN")
export AIO_PREVIEW_DEPLOYMENT_TOKEN=$(head -c -1 /aio-secrets/PREVIEW_DEPLOYMENT_TOKEN 2>/dev/null || echo "MISSING_PREVIEW_DEPLOYMENT_TOKEN")

# Start the upload-server instance
action=$([ "$1" == "stop" ] && echo "stop" || echo "start")
pm2 $action $AIO_SCRIPTS_JS_DIR/dist/lib/upload-server \
  --uid $AIO_WWW_USER \
  --log /var/log/aio/upload-server-prod.log \
  --name aio-upload-server-prod \
  ${@:2}
