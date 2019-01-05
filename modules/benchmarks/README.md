# How to run the benchmarks locally

## Run in the browser

```bash
# Build the Angular packages.
yarn tsc -p packages/

# Build the e2e tests which are part of the "modules/"
./modules/build.sh

# Start server that serves all benchmark e2e apps.
yarn gulp serve
```

Now you can open benchmark e2e apps using their appropriate URLs. For example:

```
http://localhost:8000/all/benchmarks/src/tree/ng2/index.html
```

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

## Compile *_aot.ts files

These files are compiled as part of the compiler_cli integration tests.
See `@angular/compile_cli/integrationtest/tsconfig.json`
