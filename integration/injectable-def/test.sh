#!/bin/bash
set -e -x

rm -rf node_modules/lib1_built node_modules/lib2_built dist/

ngc -p tsconfig-lib1.json
cp src/package-lib1.json node_modules/lib1_built/package.json

ngc -p tsconfig-lib2.json
cp src/package-lib2.json node_modules/lib2_built/package.json

ngc -p tsconfig-app.json

node ./dist/src/main.js
