#!/bin/bash
set -e -o pipefail

# Start the upload-server instance
# TODO(gkalpak): Ideally, the upload server should be run as a non-privileged user.
#                (Currently, there doesn't seem to be a straight forward way.)
action=$([ "$1" == "stop" ] && echo "stop" || echo "start")
pm2 $action $AIO_SCRIPTS_JS_DIR/dist/lib/upload-server \
  --log /var/log/aio/upload-server-prod.log \
  --name aio-upload-server-prod \
  ${@:2}
