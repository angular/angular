# How to run the benchmarks_external locally

$ cp -r ./modules/benchmarks_external ./dist/all/
$ ./node_modules/.bin/tsc -p modules --emitDecoratorMetadata -w
$ gulp serve
$ open http://localhost:8000/all/benchmarks_external/src/tree/index.html?bundles=false
