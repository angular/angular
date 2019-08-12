### Build

yarn bazel build //packages/core/test/render3/perf/interpolation:bundle.min_debug.es2015.js --define=compile=aot

### Run 

time node --no-turbo-inlining dist/bin/packages/core/test/render3/perf/interpolation/bundle.min_debug.es2015.js

### Profile

node --no-turbo-inlining --inspect-brk dist/bin/packages/core/test/render3/perf/interpolation/bundle.min_debug.es2015.js