#!/bin/bash

set -eux -o pipefail

# Constants
SCRIPTS_JS_DIR="`dirname $0`/dockerbuild/scripts-js"

# Test `scripts-js/`
cd "$SCRIPTS_JS_DIR"
yarn install
yarn test
cd -
