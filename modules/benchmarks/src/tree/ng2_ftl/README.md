# Ng2 Faster Than BaseLine (FTL) Benchmark

This benchmark was produced in a similar way as `ng2_static_ftl`,
but starting from the `ng2` benchmark, i.e. the benchmark
that only uses 1 component that contains itself via 2 `NgIf`s.

1. Run AoT over the `TreeComponent` and `AppModule`
2. Move the `ComponentFactory` and the corresponding host view class
   from `tree.ngfactory.ts` into `tree_host.ngfactory.ts`
3. Move the `NgModuleFactory` into the `app.ngfactory.ts`
4. Optimize the `tree.ngfactory.ts` (see below)

The goal of this benchmark is to explore what kind of
code the Ng2 compiler should generate in order to get faster.
I.e. right now, the Ng2 compiler _does not_ produce this kind of code,
but hopefully will in the future.


## Optimizations and cleanups

See `tree.ngfactory.ts` and `tree_leaf.ngfactory.ts`.

Performance:

- remove view factory functions, call the constructor of the view class directly
- remove `createInternal` and move the logic into the constructor
- generate direct calls to `detectChangesInternal` / `destroyInternal` of nested components
  _and_ view containers, don't use `viewChildren` / `contentChildren`
- remove `Renderer` and `SanitizationService` to update
  the dom directly via `document.createElement` / `element.appendChild` / setting
  `Text.nodeValue` / `Element.style....`
- remove `AppElement` on component host elements
- custom implementation of `ViewContainerRef` that uses
  the views as linked list, instead of an array (see `ftl_util`).
- custom implementation of TemplateRef which not use a closure, only a view and an index,
  and the view has a factory method that switches over the index
  (see `ftl_util`).
- Don't wrap Views into ViewRefs before passing to the user.
- View does not use an array to store root nodes,
  but rather has a generated method `visitRootNodes` (see below)
- ViewContainer, TemplateRef and views have minimal amount of fields
- use `insertBefore` as primitive.

Code size:
- inputs for `NgIf`, `TreeComponent` are wrapped into view class / directive wrapper method
  (see `ng_if.ngfactory.ts` and `tree.ngfactory.ts`).
- helper methods `createElementAndAppend` / `createTextAndAppend` / `createAnchorAndAppend`
- remove `injectorGetInternal` assuming we can detect that nobody is injecting an `Injector`

## Properties
- no allocation of arrays nor closures

## Background: why `visitRootNodes`?

* An embedded view has root nodes that need to be attached / detached
  to the DOM when the view is inserted.
* An embedded view can have view containers as root nodes. I.e. the root nodes
  of a view need to include the root nodes of all views in root view containers
* An embedded view can have `<ng-content>` as root nodes. I.e. the root
  nodes of a view need to include the projects nodes, which can
  include a view container, in which case they need to include the root nodes
  of all included views as well.

Previous implementation:
The generated view classes would store a (possible nested) array of root nodes
that can contain regular DOM nodes as well as ViewContainers.
The helper method `flattenNestedViewRootNodes` is used to convert this array
into a flat array of node.
However, this generates a new array and is probably hard to optimize for
a vm.

### Solution
Generate loop functions / methods.
I.e. a method like:
```
loopRootNodes(cb: (obj: any, ctx: any), ctx: any) {
  cb(this.node0, ctx);
  ...
}
```
These methods can easily be nested, i.e. a view container
can just loop over its views and call this method,
forwarding the callback!

Same is true for projection!
==> Tried it, no impact on the benchmark!

### Discarded Solution 1)
Generate `attach` / `detach` method on EmbeddedView,
which will `insertBefore` the root nodes. Also
generate `project` and `unproject` methods in the caller
of a component to add / remove nodes.

Problems:
- generates a lot of code!
- projected nodes can only be inserted into the DOM via
  `insertBefore`, but never via `appendChild` as
  the generated method `project` does it,
  and it can do only one of these two, but not both.

### Discarded Solution 2)
Generate a method `rootNodes` on every view that will
do produce a flattened array of nodes by generating the
right `concat` statements.

Problems:
- allocates arrays and `concat` calls that slows things down
  (an experiment showed about about 2-5%).

## Experiments tried
- just the fact of having another base class in the prototype chain
  is not a problem!
- Using a linked list over the views vs an array in ViewContainerRef
  has no impact on performance, given that we use `Array.prototype.push`
  for adding if possible (only tried with ngIf though...)
  * Using `Array.prototype.splice` to add made benchmark 2% slower though!
- creating an array with root nodes does not make the benchmark much slower.
  * Using `flattenNestedViewRootNodes` made it 5-10% slower!
  * Note that this benchmark only includes `NgIf`, i.e. it only
    inserts 1 entry into the array.
- creating an additional comment node for the view container,
  so it is safe to do `insertBefore`
  * this slows the benchmark down by 14% (added 2 comment nodes)!
  ==> the number of comment nodes is important!

## Open experiments:
- using ViewRef as a separate wrapper, compared to
  using the view itself as ref.
- using AppElement with an injector, native node, ...,
  compared to not having all of these fields
- using `insertAfter` instead of `insertBefore`?

## Initial resuls: size

File size for view class of the component + the 2 embedded view classes (without imports nor host view factory):
* before: 140 LOC
* after: 104 LOC

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
ng2             |       5926.64+-11% |          17.46+-5% |          0.02+-44% |          96.74+-9% |          49.72+-5% |         114.19+-8%
ng2.ftl         |       584.50+-435% |         0.43+-435% |         0.00+-435% |          33.98+-7% |          50.27+-5% |          33.98+-7%
baseline        |               0.00 |               0.00 |               0.00 |          15.83+-7% |          45.75+-4% |          15.83+-7%
incremental_dom |       100.82+-302% |         1.64+-321% |         0.00+-304% |          53.43+-9% |          43.96+-4% |         55.07+-13%

...update       |           gcAmount |             gcTime |        majorGcTime |     pureScriptTime |         renderTime |         scriptTime
--------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------
ng2             |               0.00 |         0.00+-435% |         0.00+-435% |          22.82+-9% |          29.52+-6% |          22.82+-9%
ng2.ftl         |       219.72+-301% |         0.97+-300% |         0.00+-302% |         17.37+-10% |          29.27+-5% |         17.37+-10%
baseline        |       530.73+-178% |         0.55+-281% |         0.35+-434% |          25.82+-8% |         31.67+-11% |          25.82+-8%
incremental_dom |      1057.56+-200% |         0.28+-201% |         0.00+-204% |          22.50+-9% |          28.03+-4% |          22.50+-9%

Ratios (create, pureScriptTime):
- 2.8x faster than current implementation
- 1.5x faster than incremental DOM
- 2.1x slower than baseline
