# How to run the examples locally

$ cp -r ./modules/playground ./dist/all/
$ ./node_modules/.bin/tsc -p modules --emitDecoratorMetadata -w
$ gulp serve
$ open http://localhost:8000/all/playground/src/hello_world/index.html?bundles=false
