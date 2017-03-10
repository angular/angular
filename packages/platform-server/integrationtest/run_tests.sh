#!/usr/bin/env bash

set -eu -o pipefail

cd `dirname $0`

echo "#################################"
echo "Running platform-server end to end tests"
echo "#################################"

npm install

npm run test
