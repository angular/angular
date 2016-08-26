# How to run the benchmarks locally

## Run in the browser
$ build.sh
$ cp -r ./modules/benchmarks ./dist/all/
$ ./node_modules/.bin/tsc -p modules --emitDecoratorMetadata -w
$ gulp serve
$ open http://localhost:8000/all/benchmarks/src/tree/ng2/index.html?bundles=false

## Run e2e tests
$ export NODE_PATH=$(pwd)/dist/all:$(pwd)/dist/tools
$ ./node_modules/.bin/protractor protractor-js-new-world.conf.js --specs=dist/all/benchmarks/e2e_test/tree_perf.js
