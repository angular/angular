#!/bin/bash
set -eux -o pipefail

# Set up env
source "`dirname $0`/env.sh"

# Test `scripts-js/`
cd "$SCRIPTS_JS_DIR"
yarn install
yarn test
cd -
