#!/bin/bash

set -u -e -o pipefail

BIN=$(cd .. && npm bin)

$BIN/tsc -p worker/tsconfig.json
$BIN/rollup -c worker/rollup-worker.config.js


$BIN/tsc -p cli/tsconfig.json
$BIN/rollup -c cli/rollup-cli.config.js

echo "#!/usr/bin/env node" > ../../dist/packages-dist/service-worker/ngsw-config.js

cat ../../dist/packages-dist/service-worker/ngsw-config-tmp.js >> ../../dist/packages-dist/service-worker/ngsw-config.js
rm ../../dist/packages-dist/service-worker/ngsw-config-tmp.js