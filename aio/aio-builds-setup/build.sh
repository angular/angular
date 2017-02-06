#!/bin/bash

set -eux -o pipefail

# Constants
DOCKERBUILD_DIR="`dirname $0`/dockerbuild"
SCRIPTS_JS_DIR="$DOCKERBUILD_DIR/scripts-js"
DEFAULT_IMAGE_NAME_AND_TAG="aio-builds:latest"

# Build `scripts-js/`
cd "$SCRIPTS_JS_DIR"
yarn install
yarn run build
cd -

# Create docker image
nameAndOptionalTag=$([ $# -eq 0 ] && echo $DEFAULT_IMAGE_NAME_AND_TAG || echo $1)
sudo docker build --tag $nameAndOptionalTag $DOCKERBUILD_DIR
