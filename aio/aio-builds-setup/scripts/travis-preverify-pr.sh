#!/bin/bash
set -eux -o pipefail

# Set up env
source "`dirname $0`/_env.sh"

# Build `scripts-js/`
(
  cd "$SCRIPTS_JS_DIR"
  yarn install
  yarn build
)

# Preverify PR
AIO_GITHUB_ORGANIZATION="angular" \
AIO_GITHUB_TEAM_SLUGS="angular-core,aio-contributors" \
AIO_GITHUB_TOKEN=$(echo ${GITHUB_TEAM_MEMBERSHIP_CHECK_KEY} | rev) \
AIO_REPO_SLUG=$TRAVIS_REPO_SLUG \
AIO_PREVERIFY_PR=$TRAVIS_PULL_REQUEST \
node "$SCRIPTS_JS_DIR/dist/lib/upload-server/index-preverify-pr"
