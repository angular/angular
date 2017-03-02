#!/bin/sh

cd `dirname $0`
./build.sh

gulp serve-examples &

(cd ../../../ && NODE_PATH=$NODE_PATH:dist/all $(npm bin)/protractor protractor-examples-e2e.conf.js --bundles=true)
