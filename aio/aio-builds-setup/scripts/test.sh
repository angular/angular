#!/bin/bash
set -eux -o pipefail

# Set up env
source "`dirname $0`/_env.sh"

# Test `scripts-js/`
(
  cd "$SCRIPTS_JS_DIR"
  yarn install --frozen-lockfile --non-interactive
  yarn test
)
