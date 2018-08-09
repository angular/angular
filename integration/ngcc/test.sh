#!/bin/bash

set -e -x

PATH=$PATH:$(npm bin)

ivy-ngcc fesm2015,esm2015
ngc -p tsconfig-app.json

# Look for correct output
grep "directives: \[\S*\.NgIf\]" dist/src/main.js > /dev/null
