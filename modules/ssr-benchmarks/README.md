## Intro

This small benchmark suite is dedicated to mesure & describe how compute time is spent when rendering an application like in SSR.

## Struture

* `./main.ts` is the entry point to run the benchmark 
* `./src` contains a sample app that exports a `render` function.
* This app render a table of variable size, which depends on data (`initData()`)
* This app is then rendered X numbers of times

* Individual function calls are measured with `startMeasuring()`/`stopMeasuring()` from the core package. 
* If you add a new measure, make sure to add it also to the `levels` map for it to be represented correctly in the result

## Build & run

`yarn bazel run //modules/ssr-benchmarks:run`


### Running the benchmark in a browser environment

`yarn bazel run //modules/ssr-benchmarks:run_browser`

This bazel target will build the benchmark, start a http-server with a html that will load the benckmark script. 
The benchmark script with this target will have DOM Emulation disabled. 
The result will be visible in the devtools console. 

Note: Due to the CLI adding some polyfills, @angular/build is patched to disable DOM emulation and running server code inside a browser:  
1.  removing an import from `node:module` in `polyfills.server.mjs` (with `tail ...`)
2.  removing the import of `platform-server/init`. 

To run create a usable flame chart, prepare a narrowed run (like `benchmarkRun(10000, 20);`). 
Then in the performance tab of the devtools, trigger "Record & Reload" to generate a profile.

### Deopt Explorer 

A target is dedicated to generate a v8 log that can be fed to the [Deopt Explorer extension](https://github.com/microsoft/deoptexplorer-vscode).

1. Run `yarn bazel run //modules/ssr-benchmarks:run_deopt`, 
2. open the project generated at the path after `Successfully ran all commands in test directory:`,
3. open the logfile in the extension

## Result example 

=== table with 10000 rows, with 1000 renders ===
┌─────────┬──────────────────────────────────────┬──────────┬──────────┬────────────┬───────────┐
│ (index) │                 name                 │   min    │ average  │ percentage │    max    │
├─────────┼──────────────────────────────────────┼──────────┼──────────┼────────────┼───────────┤
│    0    │ ' renderApplication                ' │ '77.0ms' │ '86.4ms' │  '100.0%'  │ '259.2ms' │
│    1    │ '  └ createServerPlatform          ' │ '0.0ms'  │ '0.1ms'  │   '0.1%'   │  '3.7ms'  │
│    2    │ '  └ bootstrap                     ' │ '35.9ms' │ '42.6ms' │  '49.3%'   │ '138.4ms' │
│    3    │ '  └ _render                       ' │ '39.7ms' │ '43.8ms' │  '50.7%'   │ '124.9ms' │
│    4    │ '   └ whenStable                   ' │ '0.0ms'  │ '0.0ms'  │   '0.0%'   │  '0.0ms'  │
│    5    │ '   └ prepareForHydration          ' │ '13.1ms' │ '14.8ms' │  '17.1%'   │ '53.4ms'  │
│    6    │ '   └ insertEventRecordScript      ' │ '0.0ms'  │ '0.0ms'  │   '0.0%'   │  '0.0ms'  │
│    7    │ '   └ serializeTransferStateFactory' │ '0.0ms'  │ '0.0ms'  │   '0.0%'   │  '0.1ms'  │
│    8    │ '   └ renderToString               ' │ '7.3ms'  │ '8.9ms'  │  '10.3%'   │ '41.8ms'  │
└─────────┴──────────────────────────────────────┴──────────┴──────────┴────────────┴───────────┘

Note: The max measure is often an outlier of the first few measures, probably before the JIT optimisation happens