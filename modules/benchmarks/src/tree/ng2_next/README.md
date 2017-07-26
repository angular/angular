# Ng2 Next Benchmark

This benchmark uses the upcoming view engine for Angular, which moves
more functionality from codegen into runtime to reduce generated code size.

As we introduce more runtime code, we need to be very careful to not
regress in performance, compared to the pure codegen solution.

## Initial results: size of Deep Tree Benchmark

File size for Tree benchmark template,
view class of the component + the 2 embedded view classes (without imports nor host view factory):

                               | bytes | ratio | bytes (gzip) | ratio (gzip)
------------------------------ | ----- | ----- | ------------ | ------------
Source template + annotation   | 245   | 1x    | 159          | 1x
Gen code (Closure minified)    | 2693  | 11.9x | 746          | 4.7x
New View Engine (minified)     | 868   | 3.5x  | 436          | 2.7x

## Initial results: performance of Deep Tree Benchmark

Measured locally on a MacBook Pro.

BENCHMARK deepTree....
Description:
- bundles: false
- depth: 11
- forceGc: false
- regressionSlopeMetric: scriptTime
- sampleSize: 20
- userAgent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36

...createOnly   |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2             |      11461.24+-21% |         12.35+-42% |         1.15+-429% |          72.49+-4% |          49.61+-4% |          82.69+-6%
ng2 next        |       6207.77+-93% |          9.84+-84% |         3.35+-238% |          73.95+-4% |          49.86+-4% |         77.53+-10%

...update       |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2             |               0.00 |         0.00+-435% |         0.00+-435% |          13.34+-8% |          28.55+-8% |          13.34+-8%
ng2 next        |       175.02+-435% |         0.74+-435% |         0.00+-302% |         20.55+-12% |          28.00+-6% |         20.55+-12%

...pure cd (10x) |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2             |      2155.57+-238% |         0.24+-238% |         0.00+-238% |          19.32+-9% |           2.54+-6% |          19.32+-9%
ng2 next        |       908.12+-366% |         1.62+-325% |         0.49+-435% |          30.66+-6% |          2.62+-19% |          30.66+-6%
