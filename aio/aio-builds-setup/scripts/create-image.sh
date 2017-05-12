#!/bin/bash
set -eux -o pipefail

# Set up env
source "`dirname $0`/_env.sh"
readonly defaultImageNameAndTag="aio-builds:latest"

# Create docker image
readonly nameAndOptionalTag=${1:-$defaultImageNameAndTag}
sudo docker build --tag $nameAndOptionalTag ${@:2} $DOCKERBUILD_DIR
