#!/bin/bash
set -eux -o pipefail

# Set up env
source "`dirname $0`/_env.sh"
readonly defaultImageNameAndTag="aio-builds:latest"

# Build `scripts-js/`
# (Necessary, because only `scripts-js/dist/` is copied to the docker image.)
(
  cd "$SCRIPTS_JS_DIR"
  yarn install --frozen-lockfile --non-interactive
  yarn build
)

# Create docker image
readonly nameAndOptionalTag=${1:-$defaultImageNameAndTag}
sudo docker build --tag $nameAndOptionalTag ${@:2} $DOCKERBUILD_DIR
