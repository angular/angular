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

