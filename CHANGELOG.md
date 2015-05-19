<a name"2.0.0-alpha.24"></a>
### 2.0.0-alpha.24 (2015-05-19)


#### Bug Fixes

* **Compiler:** add an error when a directive is null or undefined ([25cd6e43](https://github.com/angular/angular/commit/25cd6e43), closes [#1908](https://github.com/angular/angular/issues/1908))
* **benchmark:**
  * change If for NgIf ([cdbb2473](https://github.com/angular/angular/commit/cdbb2473))
  * fixes ng-if ng-for renaming for templates. ([38926f71](https://github.com/angular/angular/commit/38926f71))
* **build:** npm shrinkwrap to pick up changed SHA1. ([04a9eb88](https://github.com/angular/angular/commit/04a9eb88))
* **directives:** fix import path ([c20060d2](https://github.com/angular/angular/commit/c20060d2))
* **errors:** require passing stack traces explicitly in ng2 own code ([8ab77353](https://github.com/angular/angular/commit/8ab77353))
* **examples:** prefix directives with Ng ([0e82970a](https://github.com/angular/angular/commit/0e82970a))
* **facade:** MapWrapper.createFromPairs ([af9dcad8](https://github.com/angular/angular/commit/af9dcad8), closes [#1640](https://github.com/angular/angular/issues/1640))
* **ng1 benchmarks:** revert *ng-if to ng-if ([909233f7](https://github.com/angular/angular/commit/909233f7))
* **router:**
  * use appRootComponentToken to get root route configs ([791caf00](https://github.com/angular/angular/commit/791caf00), closes [#1947](https://github.com/angular/angular/issues/1947))
  * improve route matching priorities ([5db89071](https://github.com/angular/angular/commit/5db89071))
  * generate links for router-link with baseHref ([390cfb79](https://github.com/angular/angular/commit/390cfb79))
  * sort possible routes by cost ([17392f66](https://github.com/angular/angular/commit/17392f66))
* **tree-differ:** treat symlinks to deleted paths as removals ([aad57954](https://github.com/angular/angular/commit/aad57954), closes [#1961](https://github.com/angular/angular/issues/1961))


#### Features

* allow for forward references in injection ([1eea2b25](https://github.com/angular/angular/commit/1eea2b25), closes [#1891](https://github.com/angular/angular/issues/1891))
* **change_detection:**
  * json pipe ([98603824](https://github.com/angular/angular/commit/98603824), closes [#1957](https://github.com/angular/angular/issues/1957))
  * uppercase and lowercase pipes ([7a4a6353](https://github.com/angular/angular/commit/7a4a6353))
  * implemented change detection that can be configured with pregenerated change det ([08f21dbf](https://github.com/angular/angular/commit/08f21dbf))
* **compiler:**
  * special-case class attribute in hostAttributes ([3011cd86](https://github.com/angular/angular/commit/3011cd86), closes [#1774](https://github.com/angular/angular/issues/1774), [#1841](https://github.com/angular/angular/issues/1841))
  * added support for [()] syntax ([685a6507](https://github.com/angular/angular/commit/685a6507))
* **di:**
  * added hostInjector and viewInjector to the Directive annotation ([b066b8d1](https://github.com/angular/angular/commit/b066b8d1))
  * removed publishAs ([3a53f679](https://github.com/angular/angular/commit/3a53f679))
* **element_injector:** allow @Optional for ProtoViewRef ([bb2eda2d](https://github.com/angular/angular/commit/bb2eda2d))
* **errors:** preserve stack traces of user exceptions in Dart ([b6f29b44](https://github.com/angular/angular/commit/b6f29b44))
* **facade:** toUpperCase and toLowerCase ([557d54b3](https://github.com/angular/angular/commit/557d54b3))
* **fakeAsync:** allow simulating the passage of time ([0f002a5b](https://github.com/angular/angular/commit/0f002a5b))
* **forms:** improved error messages ([11e43851](https://github.com/angular/angular/commit/11e43851), closes [#1839](https://github.com/angular/angular/issues/1839))
* **pipe:** reexported pipes to genereate docs ([155b1e2b](https://github.com/angular/angular/commit/155b1e2b))


#### Breaking Changes

* `AppViewManager.createInPlaceHostView` is replaced by
`AppViewManager.createRootHostView` (for bootstrap) and
`AppViewManager.createFreeHostView` (for imperative components).

The later creates new host elements that are not attached anywhere.
To attach them, use `DomRenderer.getHostElement(hostviewRef)`
to get the host element.

Closes #1920

 ([421d8916](https://github.com/angular/angular/commit/421d8916))
* - renames `DirectiveMetadataReader` into `DirectiveResolver`
  and removes `src/core/compiler/directive_metadata`.

Fixes #1712
Fixes #1713
 ([ecb06801](https://github.com/angular/angular/commit/ecb06801))


<a name"2.0.0-alpha.23"></a>
### 2.0.0-alpha.23 (2015-05-12)


#### Bug Fixes

* **change_detection:** updated dynamic change detector not to mutate when throwing ([d717529e](https://github.com/angular/angular/commit/d717529e), closes [#1762](https://github.com/angular/angular/issues/1762))
* **dart:** Remove unused imports. ([4ce0d5e0](https://github.com/angular/angular/commit/4ce0d5e0))
* **forms:** export directives as const in Dart ([5036086f](https://github.com/angular/angular/commit/5036086f), closes [#1283](https://github.com/angular/angular/issues/1283))
* **gulpfile:** fixed test.unit.dart to format dart code before running test ([92d6aa1f](https://github.com/angular/angular/commit/92d6aa1f))
* **location:** dartium does not like pushState with null. ([c2a42d5d](https://github.com/angular/angular/commit/c2a42d5d))
* **router:**
  * add baseUrl to relative paths, but not absolute. ([a5741541](https://github.com/angular/angular/commit/a5741541), closes [#1783](https://github.com/angular/angular/issues/1783))
  * reuse common parent components ([ac80df09](https://github.com/angular/angular/commit/ac80df09))
  * router-link works without params ([77d1fc14](https://github.com/angular/angular/commit/77d1fc14))
  * strip base href from URLs when navigating ([853d1de6](https://github.com/angular/angular/commit/853d1de6))
* **test_lib:** spy funcs should match null arguments ([84dc6ae7](https://github.com/angular/angular/commit/84dc6ae7))
* **transformer:** remove classDefParser in favor of hardcoded strings to speed up build ([01d5c295](https://github.com/angular/angular/commit/01d5c295))
* **view:** fixed ProtoViewFactory to get all property bindings ([7f976381](https://github.com/angular/angular/commit/7f976381))


#### Features

* **PromisePipe:** add pipe for promises ([74987585](https://github.com/angular/angular/commit/74987585))
* **VmTurnZone:** Rework the implementation to minimize change detection runs ([e8a6c95e](https://github.com/angular/angular/commit/e8a6c95e))
* **change_detection.js:** export null pipes ([4b62a722](https://github.com/angular/angular/commit/4b62a722), closes [#1624](https://github.com/angular/angular/issues/1624))
* **compiler:**
  * added support for host actions ([f9c1de46](https://github.com/angular/angular/commit/f9c1de46))
  * allow setting attributes on a host element ([51839ca6](https://github.com/angular/angular/commit/51839ca6), closes [#1402](https://github.com/angular/angular/issues/1402))
* **di:**
  * support type literals in DI ([358a6750](https://github.com/angular/angular/commit/358a6750))
  * expose parent injector ([2185e7ce](https://github.com/angular/angular/commit/2185e7ce))
  * components can self-publish via publishAs ([1a0da11e](https://github.com/angular/angular/commit/1a0da11e))
* **directives:** export collection of core directives ([a5638a94](https://github.com/angular/angular/commit/a5638a94), closes [#1524](https://github.com/angular/angular/issues/1524))
* **dom:** add getBaseHref method ([05219a54](https://github.com/angular/angular/commit/05219a54))
* **facade:** add equals method to StringMapWrapper ([aff85b50](https://github.com/angular/angular/commit/aff85b50))
* **gulpfuile:** added watch.js.dev ([3256ff1c](https://github.com/angular/angular/commit/3256ff1c))
* **lang:** support const expressions in TS/JS and Dart ([4665726f](https://github.com/angular/angular/commit/4665726f), closes [#1796](https://github.com/angular/angular/issues/1796))
* **material:**
  * add early version of md-grid-list. ([8ef183b5](https://github.com/angular/angular/commit/8ef183b5), closes [#1683](https://github.com/angular/angular/issues/1683))
  * early version of md-input ([ad239218](https://github.com/angular/angular/commit/ad239218), closes [#1753](https://github.com/angular/angular/issues/1753))
* **view:** allow to transplant a view into a ViewContainer at another place. ([4f3433b5](https://github.com/angular/angular/commit/4f3433b5), closes [#1492](https://github.com/angular/angular/issues/1492))


#### Breaking Changes

* 
VmTurnZone has been renamed to NgZone.

- The public API has not chnanged,
- The "outer" zone is now named "mount" zone (private to NgZone).

 ([e11c2054](https://github.com/angular/angular/commit/e11c2054))
* 
A collection of all the form directives is exported
under `formDirectives`
while those were previously available
under `FormDirectives`.

Closes #1804

 ([229e770a](https://github.com/angular/angular/commit/229e770a))


<a name"2.0.0-alpha.22"></a>
### 2.0.0-alpha.22 (2015-05-07)


#### Bug Fixes

* **brocolli:** escape special regexp characters when building regexps ([a58c9f83](https://github.com/angular/angular/commit/a58c9f83), closes [#1721](https://github.com/angular/angular/issues/1721), [#1752](https://github.com/angular/angular/issues/1752))
* **build:**
  * build the broccoli tools with correct typescript version. ([6bba289a](https://github.com/angular/angular/commit/6bba289a))
  * use correct tsd command to get typings at requested versions ([1205f54d](https://github.com/angular/angular/commit/1205f54d))
  * revert typescript upgrade which broke the build. ([b5032fd3](https://github.com/angular/angular/commit/b5032fd3))
  * refer to newest version of hammerjs typings ([a7a94636](https://github.com/angular/angular/commit/a7a94636))
* **bundle:** update the bundle config to point to rx.js ([cf322130](https://github.com/angular/angular/commit/cf322130))
* **change_detector:** ensure that locals are only used when implicit receiver ([d4925b61](https://github.com/angular/angular/commit/d4925b61), closes [#1542](https://github.com/angular/angular/issues/1542))
* **compiler:**
  * clone templates before compiling them ([9e8d31d5](https://github.com/angular/angular/commit/9e8d31d5), closes [#1058](https://github.com/angular/angular/issues/1058))
  * changed the compiler to set up event listeners and host properties on host view  ([e3c11045](https://github.com/angular/angular/commit/e3c11045), closes [#1584](https://github.com/angular/angular/issues/1584))
  * only sets viewDefinition absUrl if the view has either a template or templateUrl ([3d625463](https://github.com/angular/angular/commit/3d625463), closes [#1326](https://github.com/angular/angular/issues/1326), [#1327](https://github.com/angular/angular/issues/1327))
* **decorators:**
  * incorrect annotation to decorator adapter ([b0c735f7](https://github.com/angular/angular/commit/b0c735f7))
  * fixed decorators ([49777648](https://github.com/angular/angular/commit/49777648))
  * fixes decorator reflection. ([be7504d4](https://github.com/angular/angular/commit/be7504d4))
  * updates missing benchmark and fixes typo. ([87dcd5eb](https://github.com/angular/angular/commit/87dcd5eb))
* **decorators.es6:** export Directive decorator ([93c331d1](https://github.com/angular/angular/commit/93c331d1), closes [#1688](https://github.com/angular/angular/issues/1688))
* **di:** improve error messages for invalid bindings ([ee1b574b](https://github.com/angular/angular/commit/ee1b574b), closes [#1515](https://github.com/angular/angular/issues/1515), [#1573](https://github.com/angular/angular/issues/1573))
* **docs:** fix broken docs test after addition of .ts extension to dgeni regex. ([62bf777e](https://github.com/angular/angular/commit/62bf777e))
* **exception_handler:** log errors via `console.error` ([ead21c91](https://github.com/angular/angular/commit/ead21c91))
* **formatter:** point to the newest clang-format ([51c47792](https://github.com/angular/angular/commit/51c47792))
* **router:**
  * fix for leading slash in dart ([c9cec600](https://github.com/angular/angular/commit/c9cec600))
  * navigate on popstate event ([2713b787](https://github.com/angular/angular/commit/2713b787))
  * throw if config does not contain required fields ([259f872c](https://github.com/angular/angular/commit/259f872c))
  * infer top-level routing from app component ([46ad3552](https://github.com/angular/angular/commit/46ad3552), closes [#1600](https://github.com/angular/angular/issues/1600))
  * use lists for RouteConfig annotations ([4965226f](https://github.com/angular/angular/commit/4965226f))
* **view:** changed view manager to hydrate change detector after creating directives ([c1579222](https://github.com/angular/angular/commit/c1579222))


#### Features

* **benchmark:** added an implementation of the tree benchmark in React ([e4342743](https://github.com/angular/angular/commit/e4342743))
* **benchmarks:** Add basic dart transformer benchmarks. ([1864f60a](https://github.com/angular/angular/commit/1864f60a))
* **decorators:**
  * adds decorator versions of DI annotations. ([457c15cd](https://github.com/angular/angular/commit/457c15cd))
  * adds support for parameter decorators. ([f863ea0d](https://github.com/angular/angular/commit/f863ea0d))
  * adds decorators to be used by TS and Babel transpiled apps. ([fb67e373](https://github.com/angular/angular/commit/fb67e373))
* **dom:** add location and history as DOM-like APIs. ([f356d033](https://github.com/angular/angular/commit/f356d033))
* **material:** add prototype dialog component w/ demo. ([f88c4b77](https://github.com/angular/angular/commit/f88c4b77))
* **router:**
  * adds the router to the self-executing bundle. ([8e1d53b5](https://github.com/angular/angular/commit/8e1d53b5))
  * export decorator version of RouteConfig ([75da6e4c](https://github.com/angular/angular/commit/75da6e4c))
  * route redirects ([91533313](https://github.com/angular/angular/commit/91533313))
  * sibling outlets ([9d5c33f9](https://github.com/angular/angular/commit/9d5c33f9))
  * export routerInjectables ([ef7014fe](https://github.com/angular/angular/commit/ef7014fe))
  * add location service ([ea546f50](https://github.com/angular/angular/commit/ea546f50))


#### Breaking Changes

* Previously, `Directive` was the abstract base class of several directives.
Now, `Directive` is the former `Decorator`, and `Component` inherits from it.

 ([f75a50c1](https://github.com/angular/angular/commit/f75a50c1))
* A dynamic component is just a component that has no @View annotation…
 ([8faf6364](https://github.com/angular/angular/commit/8faf6364))


<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2015-04-27)


## Features

- **dart/transform:** Dedup getters, setters, & methods
  ([15376a6d](https://github.com/angular/angular/commit/15376a6d243740c73cf90f55525d1710cdd156f5))
- **facade:** add isType method
  ([e617ca63](https://github.com/angular/angular/commit/e617ca6323902bd98c0f1eb990b82f6b8d3c98e3))
- **parser:** support === and !== operators
  ([afe0e454](https://github.com/angular/angular/commit/afe0e454537f9252f9cf313647e649cfa464f96f),
   [#1496](https://github.com/angular/angular/issues/1496), [#1500](https://github.com/angular/angular/issues/1500))
- **router:** add initial implementation
  ([1b2754da](https://github.com/angular/angular/commit/1b2754dacdd15e8fea429d56cdacb28eae76d2b1))
- **view:** reimplemented property setters using change detection
  ([8ccafb05](https://github.com/angular/angular/commit/8ccafb0524e3ac4c51af34ef88e0fe27482336a6))


## Performance Improvements

- **benchmarks:**
  - benchmark that measure cost of dynamic components
  ([427f0d02](https://github.com/angular/angular/commit/427f0d021c51ea6923edd07574a4cc74a1ef84e6))
  - benchmark measuring cost of decorators (fixes #1479)
  ([9fc9d535](https://github.com/angular/angular/commit/9fc9d535667c620017367877dbc2a3bc56d358b7))


## Other (malformed commit messages)

- **other:**
  - feat: alllow specifying directives as bindings
  ([4bab25b3](https://github.com/angular/angular/commit/4bab25b3666f4247434ad5cb871906fb063fef51),
   [#1498](https://github.com/angular/angular/issues/1498))
  - fix: export ShadowDom strategies
  ([6896305e](https://github.com/angular/angular/commit/6896305e34082c246769829e4258631c1d2363d1),
   [#1510](https://github.com/angular/angular/issues/1510), [#1511](https://github.com/angular/angular/issues/1511))

