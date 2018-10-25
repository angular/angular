#!/bin/bash
set -eu -o pipefail

# Set up env variables
export AIO_CIRCLE_CI_TOKEN=UNUSED_CIRCLE_CI_TOKEN
export AIO_GITHUB_TOKEN=$(head -c -1 /aio-secrets/GITHUB_TOKEN 2>/dev/null)

# Run the clean-up
node $AIO_SCRIPTS_JS_DIR/dist/lib/clean-up >> /var/log/aio/clean-up.log 2>&1
