# How to run the benchmarks locally

## Run in the browser
$ build.sh (only needed 1x to copy over third party resources)
$ cp -r ./modules/benchmarks ./dist/all/
$ ./node_modules/.bin/tsc -p modules --emitDecoratorMetadata -w
$ gulp serve
$ open http://localhost:8000/all/benchmarks/src/tree/ng2/index.html?bundles=false

## Run e2e tests
$ export NODE_PATH=$(pwd)/dist/all:$(pwd)/dist/tools
$ ./node_modules/.bin/protractor protractor-e2e.conf.js --specs=dist/all/benchmarks/e2e_test/tree_spec.js

Options for protractor with `protractor-e2e.conf.js`:
- `--bundles=true`: use prebuilt bundles
- `--ng-help`: show all available options

## Run benchmarks tests
$ export NODE_PATH=$(pwd)/dist/all:$(pwd)/dist/tools
$ ./node_modules/.bin/protractor protractor-perf.conf.js --specs=dist/all/benchmarks/e2e_test/tree_perf.js

Options for protractor with `protractor-perf.conf.js`:
- `--bundles=true`: use prebuilt bundles
- `--ng-help`: show all available options
