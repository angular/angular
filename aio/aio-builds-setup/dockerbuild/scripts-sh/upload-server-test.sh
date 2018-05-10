#!/bin/bash
set -eu -o pipefail

# Start the upload-server instance
appName=aio-upload-server-test
if [[ "$1" == "stop" ]]; then
  pm2 delete $appName
else
  source aio-test-env
  pm2 start $AIO_SCRIPTS_JS_DIR/dist/lib/verify-setup/start-test-upload-server.js \
    --uid $AIO_WWW_USER \
    --log /var/log/aio/upload-server-test.log \
    --name $appName \
    --no-autorestart \
    ${@:2}
fi
