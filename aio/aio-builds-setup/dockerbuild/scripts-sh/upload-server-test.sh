#!/bin/bash
set -e -o pipefail

# Set up env variables for testing
export AIO_BUILDS_DIR=$TEST_AIO_BUILDS_DIR
export AIO_DOMAIN_NAME=$TEST_AIO_DOMAIN_NAME
export AIO_GITHUB_ORGANIZATION=$TEST_AIO_GITHUB_ORGANIZATION
export AIO_GITHUB_TEAM_SLUGS=$TEST_AIO_GITHUB_TEAM_SLUGS
export AIO_PREVIEW_DEPLOYMENT_TOKEN=$TEST_AIO_PREVIEW_DEPLOYMENT_TOKEN
export AIO_REPO_SLUG=$TEST_AIO_REPO_SLUG
export AIO_UPLOAD_HOSTNAME=$TEST_AIO_UPLOAD_HOSTNAME
export AIO_UPLOAD_PORT=$TEST_AIO_UPLOAD_PORT

export AIO_GITHUB_TOKEN=$(head -c -1 /aio-secrets/TEST_GITHUB_TOKEN 2>/dev/null || echo "TEST_GITHUB_TOKEN")
export AIO_PREVIEW_DEPLOYMENT_TOKEN=$(head -c -1 /aio-secrets/TEST_PREVIEW_DEPLOYMENT_TOKEN 2>/dev/null || echo "TEST_PREVIEW_DEPLOYMENT_TOKEN")

# Start the upload-server instance
# TODO(gkalpak): Ideally, the upload server should be run as a non-privileged user.
#                (Currently, there doesn't seem to be a straight forward way.)
appName=aio-upload-server-test
if [[ "$1" == "stop" ]]; then
  pm2 delete $appName
else
  pm2 start $AIO_SCRIPTS_JS_DIR/dist/lib/upload-server/index-test.js \
    --log /var/log/aio/upload-server-test.log \
    --name $appName \
    --no-autorestart \
    ${@:2}
fi
