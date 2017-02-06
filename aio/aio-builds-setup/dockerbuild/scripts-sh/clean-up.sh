#!/bin/bash
set -e -o pipefail

node $AIO_SCRIPTS_JS_DIR/dist/lib/clean-up >> /var/log/aio/clean-up.log 2>&1
