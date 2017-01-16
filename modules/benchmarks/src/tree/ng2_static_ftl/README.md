# Ng2 Static Faster Than BaseLine (FTL) Benchmark

This benchmark was produced in the following way:

1. Run AoT over the root component, one branch component
   and the leaf component of the ng2_static benchmark
2. Move all 3 component classes to `tree.ts`
3. Add a `depth` property to the view factory constructor of
   the `TreeBranchComponent` and pass it down to nested view factory calls
   to be able to use the same view factory for all
   nesting levels. This is just to make the experiment simpler to not
   need to change so much code.
4. Optimize the `tree_branch.ngfactory.ts` and `tree_leaf.ngfactory.ts`
   (see below)

The goal of this benchmark is to explore what kind of
code the Ng2 compiler should generate in order to get faster.
I.e. right now, the Ng2 compiler _does not_ produce this kind of code,
but hopefully will in the future.

## Optimizations and cleanups

See `tree_branch.ngfactory.ts` and `tree_leaf.ngfactory.ts`.

Performance:

- remove view factory functions, call the constructor of the view class directly
- remove `createInternal` and move the logic into the constructor
- remove `AppView` parent class
- generate direct calls to `detectChangesInternal` / `destroyInternal` of nested components
- remove `Renderer` and `SanitizationService` to update
   the dom directly via `document.createElement` / `element.appendChild` / setting
   `Text.nodeValue` / `Element.style....`
- remove `AppElement`
- create component instance in view constructor

Code size:
- helper methods `createElementAndAppend` / `createTextAndAppend` / `createAnchorAndAppend`
- wrap dirty check for `TreeComponent.data` into the method `updateData`
  in the view class
- remove `injectorGetInternal` assuming we can detect that nobody is injecting an `Injector`


## Initial results: File size

File size for view class of the component (without imports nor host view factory):
* before: 81 LOC
* after: 53 LOC

## Initial results: Deep Tree Benchmark

BENCHMARK deepTree....
Description:
- bundles: false
- depth: 11
- forceGc: false
- regressionSlopeMetric: scriptTime
- runId: f9ae32f0-8580-11e6-914d-9f4f8dbfb5e8
- sampleSize: 20
- userAgent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36

...createOnly   |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2.static      |      10068.17+-33% |          9.50+-43% |          0.01+-84% |         83.01+-18% |         57.81+-19% |         92.33+-16%
ng2.ftl         |       493.36+-435% |         0.65+-435% |         0.00+-435% |         28.48+-16% |          53.97+-7% |         28.48+-16%
baseline        |        53.81+-435% |         0.10+-435% |         0.00+-435% |         19.79+-20% |         52.08+-19% |         19.89+-20%
incremental_dom |       311.14+-254% |         2.43+-248% |         0.00+-207% |         68.30+-20% |         59.31+-19% |         70.73+-19%

.....update     |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2.static      |               0.00 |               0.00 |               0.00 |         24.65+-12% |         31.43+-22% |         24.65+-12%
ng2.ftl         |               0.00 |         0.00+-435% |         0.00+-435% |         16.02+-13% |          29.15+-9% |         16.02+-13%
baseline        |       509.97+-176% |         0.65+-269% |         0.40+-434% |         28.32+-16% |         35.80+-33% |         28.32+-16%
incremental_dom |       961.48+-246% |         0.52+-311% |         0.31+-435% |         28.94+-19% |         36.13+-21% |         28.94+-19%

Ratios (create, pureScriptTime)
- 2.9x faster than current implementation
- 2.3x faster than incremental dom
- 1.4x slower than baseline
