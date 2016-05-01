#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

export NODE_PATH="$NODE_PATH:${PWD}/dist/all/"

# node dist/tools/tsc-watch/ node watch
node dist/tools/tsc-watch/ browser watch
