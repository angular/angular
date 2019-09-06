### Build

yarn bazel build //packages/core/test/render3/perf:{name}.min_debug.es2015.js --define=compile=aot

### Run 

node dist/bin/packages/core/test/render3/perf/{name}.min_debug.es2015.js

### Profile

node --no-turbo-inlining --inspect-brk dist/bin/packages/core/test/render3/perf/{name}.min_debug.es2015.js

then connect with a debugger (the `--inspect-brk` option will make sure that benchmark execution doesn't start until a debugger is connected and the code execution is manually resumed). 

The actual benchmark code has calls that will start (`console.profile`) and stop (`console.profileEnd`) a profiling session.

### Notes

In all the above commands {name} should be replaced with the actual benchmark (folder) name, ex.:
- build: `yarn bazel build //packages/core/test/render3/perf:noop_change_detection.min_debug.es2015.js --define=compile=aot`
- run: `time node dist/bin/packages/core/test/render3/perf/noop_change_detection.min_debug.es2015.js`
- profile: `node --no-turbo-inlining --inspect-brk dist/bin/packages/core/test/render3/perf/noop_change_detection.min_debug.es2015.js profile`
