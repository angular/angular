#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`
export NODE_PATH=$NODE_PATH:$(pwd)/dist/all:$(pwd)/dist/tools
$(npm bin)/tsc -p tools
node dist/tools/tsc-watch/ node watch
# node dist/tools/tsc-watch/ browser watch
