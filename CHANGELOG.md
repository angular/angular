<a name"2.0.0-alpha.26"></a>
### 2.0.0-alpha.26 (2015-06-03)


#### Bug Fixes

* format a file that slipped in. ([471a1b6d](https://github.com/angular/angular/commit/471a1b6d))
* fix clang errors ([01fb8e66](https://github.com/angular/angular/commit/01fb8e66))
* **ShadowCss:** keyframes tests failing in Safari ([4c8e11a5](https://github.com/angular/angular/commit/4c8e11a5), closes [#2283](https://github.com/angular/angular/issues/2283))
* **Tools:** Moves files out of dart2js/**/web. ([40150379](https://github.com/angular/angular/commit/40150379))
* **ast:** fix the size of a list in _evalListCache ([0387221d](https://github.com/angular/angular/commit/0387221d))
* **benchpress:**
  * support nested intervals ([c280fe81](https://github.com/angular/angular/commit/c280fe81))
  * add index to root of module ([383f0a1f](https://github.com/angular/angular/commit/383f0a1f))
* **binding:** unbalanced curly brackets in documentation ([a80921b4](https://github.com/angular/angular/commit/a80921b4))
* **browser_adapter:**
  * HTMLStyleElement.innerText does not trigger creation of CSS rules (Firefox) ([b2a24e02](https://github.com/angular/angular/commit/b2a24e02))
  * event creation fails (IE11, Firefox) ([665ccafd](https://github.com/angular/angular/commit/665ccafd))
  * element.getBoundingClientRect fails when element not in DOM (IE11) ([f35dbb99](https://github.com/angular/angular/commit/f35dbb99))
  * element.matches only available with prefix (IE11) ([a393f84f](https://github.com/angular/angular/commit/a393f84f))
  * assigning null to document.title sets the title to "null" (IE11, Firefox) ([92c2c33a](https://github.com/angular/angular/commit/92c2c33a))
* **build:**
  * remove nonexistant dart format task from gulpfile ([f74d7727](https://github.com/angular/angular/commit/f74d7727))
  * make dart formatter errors more readable ([31b66878](https://github.com/angular/angular/commit/31b66878))
  * also run ts tests in node. ([05774f6c](https://github.com/angular/angular/commit/05774f6c))
* **collection:**
  * iterator on Map keys is not supported (Safari) ([4b98ed11](https://github.com/angular/angular/commit/4b98ed11), closes [#2096](https://github.com/angular/angular/issues/2096))
  * new Map(iterable) is not supported (Safari) ([d308e55e](https://github.com/angular/angular/commit/d308e55e))
  * new Set(iterable) is not supported (IE11, Safari) ([57b88ec2](https://github.com/angular/angular/commit/57b88ec2), closes [#2063](https://github.com/angular/angular/issues/2063))
* **core:** resurrect OnChange interface ([d48fae35](https://github.com/angular/angular/commit/d48fae35))
* **dartdocs:** Hide duplicate exports from guinness. ([17e1d7f1](https://github.com/angular/angular/commit/17e1d7f1))
* **deps:** Update clang-format to 1.0.14. ([15f1eb28](https://github.com/angular/angular/commit/15f1eb28))
* **di:** allow `@Inject(…)` to work in dart2js and dynamic reflection ([4a3fd5e8](https://github.com/angular/angular/commit/4a3fd5e8), closes [#2185](https://github.com/angular/angular/issues/2185))
* **docs:** generate d.ts file only for angular2/angular2. ([0a0b84a0](https://github.com/angular/angular/commit/0a0b84a0))
* **dom:**
  * allow to correctly clone document fragments ([2351896c](https://github.com/angular/angular/commit/2351896c))
  * `querySelectorAll` should only query child nodes ([307011a9](https://github.com/angular/angular/commit/307011a9))
* **example:** unused event ([f83f1ee0](https://github.com/angular/angular/commit/f83f1ee0))
* **examples:** update form example to use NgIf ([1ad65582](https://github.com/angular/angular/commit/1ad65582))
* **facade:**
  * Make PromiseWrapper#all semantics equivalent ([22f59252](https://github.com/angular/angular/commit/22f59252))
  * Fix bug in TS indexOf ([cda35101](https://github.com/angular/angular/commit/cda35101))
* **fake_async:** fixed fakeAsync to throw instead of crashing on cjs ([5c53cf64](https://github.com/angular/angular/commit/5c53cf64))
* **forms:** disabled form tests on cjs until fakeAsync is fixed ([cd52d8a3](https://github.com/angular/angular/commit/cd52d8a3))
* **gulp:** prevent duplicate error messages ([381d4cb3](https://github.com/angular/angular/commit/381d4cb3), closes [#2021](https://github.com/angular/angular/issues/2021))
* **injectable:** add missing @Injectables annotations ([0c7f05f5](https://github.com/angular/angular/commit/0c7f05f5), closes [#2173](https://github.com/angular/angular/issues/2173))
* **package.json:** add `reflect-metadata` to package.json ([60801777](https://github.com/angular/angular/commit/60801777), closes [#2170](https://github.com/angular/angular/issues/2170))
* **render:**
  * only look for content tags in views that might have them. ([ba7956f5](https://github.com/angular/angular/commit/ba7956f5), closes [#2297](https://github.com/angular/angular/issues/2297))
  * don’t store a document fragment as bound element ([24bc4b66](https://github.com/angular/angular/commit/24bc4b66))
* **router:** event.defaultPrevented is not reliable (IE11) ([2287938f](https://github.com/angular/angular/commit/2287938f))
* **selector:** support multiple `:not` clauses ([62a95823](https://github.com/angular/angular/commit/62a95823), closes [#2243](https://github.com/angular/angular/issues/2243))
* **test:**
  * clang formatting errors ([05d66bba](https://github.com/angular/angular/commit/05d66bba))
  * solve CSS discrepancies across browsers ([fb42d590](https://github.com/angular/angular/commit/fb42d590), closes [#2177](https://github.com/angular/angular/issues/2177))
  * use a not expandable CSS rule in ShadowCSS spec (Firefox) ([588fbfd8](https://github.com/angular/angular/commit/588fbfd8), closes [#2061](https://github.com/angular/angular/issues/2061))
  * adds longer timers for NgZone and PromisePipe tests (IE11) ([661a0479](https://github.com/angular/angular/commit/661a0479), closes [#2055](https://github.com/angular/angular/issues/2055))
  * native shadow DOM is required (IE11, Firefox) ([9802debf](https://github.com/angular/angular/commit/9802debf))
  * function.name is not available (IE11) ([5103f080](https://github.com/angular/angular/commit/5103f080))
* **tests:** disable mobile emulation so benchmarks run on current chrome ([b071b66b](https://github.com/angular/angular/commit/b071b66b))
* **types:** parametrize QueryList. ([552985e3](https://github.com/angular/angular/commit/552985e3))


#### Features

* add support for the safe navigation (aka Elvis) operator ([a9be2ebf](https://github.com/angular/angular/commit/a9be2ebf), closes [#791](https://github.com/angular/angular/issues/791))
* **Directive:** convert properties to an array ([d7df853b](https://github.com/angular/angular/commit/d7df853b), closes [#2013](https://github.com/angular/angular/issues/2013))
* **ElementInjector:** support an arbitrary number of bindings ([b1c9bf14](https://github.com/angular/angular/commit/b1c9bf14), closes [#1853](https://github.com/angular/angular/issues/1853))
* **OpaqueToken:** now a const constructor ([c571b269](https://github.com/angular/angular/commit/c571b269))
* **RegExpWrapper:** implement a test method ([551586ce](https://github.com/angular/angular/commit/551586ce))
* **benchpress:** Add extension for ff metrics reporting ([b390f441](https://github.com/angular/angular/commit/b390f441), closes [#1976](https://github.com/angular/angular/issues/1976))
* **binding:** throw on binding to a blank alias ([ec2d8cc2](https://github.com/angular/angular/commit/ec2d8cc2), closes [#2068](https://github.com/angular/angular/issues/2068))
* **broccoli:** add incremental dartfmt plugin ([e5d06e47](https://github.com/angular/angular/commit/e5d06e47), closes [#2211](https://github.com/angular/angular/issues/2211))
* **change_detection:** added onInit and onCheck hooks ([c39c8ebc](https://github.com/angular/angular/commit/c39c8ebc))
* **change_detection.ts:** export PipeFactory ([93f464a1](https://github.com/angular/angular/commit/93f464a1), closes [#2245](https://github.com/angular/angular/issues/2245))
* **core:**
  * added support for detecting lifecycle events based on interfaces ([30b6542f](https://github.com/angular/angular/commit/30b6542f))
  * added missing interfaces for onDestroy and onAllChangesDone lifecycle events ([2b6a6530](https://github.com/angular/angular/commit/2b6a6530))
* **di:** added optional self parameter to Parent, Ancestor, and Unbounded ([34cfc9f4](https://github.com/angular/angular/commit/34cfc9f4))
* **dom:** add `setData()` method. ([6f3368ef](https://github.com/angular/angular/commit/6f3368ef))
* **facade:** add read/write access to global variables ([cdf791f0](https://github.com/angular/angular/commit/cdf791f0))
* **fakeAsync:** flush the microtasks before returning ([c7572ac1](https://github.com/angular/angular/commit/c7572ac1), closes [#2269](https://github.com/angular/angular/issues/2269))
* **form:** implemented an imperative way of updating the view by updating the value of a co ([652ed0cf](https://github.com/angular/angular/commit/652ed0cf))
* **forms:**
  * added support for status classes ([3baf815d](https://github.com/angular/angular/commit/3baf815d))
  * added touched and untouched to Control ([ec3a7828](https://github.com/angular/angular/commit/ec3a7828))
  * renamed control, control-group into ng-control and ng-control-group ([f543834b](https://github.com/angular/angular/commit/f543834b))
  * changed the selector of TemplatdrivenFormDirective to match <form> ([6bef1c41](https://github.com/angular/angular/commit/6bef1c41))
  * added ng-model ([559f54e9](https://github.com/angular/angular/commit/559f54e9))
  * implemented template-driven forms ([a9d6fd9a](https://github.com/angular/angular/commit/a9d6fd9a))
* **key_event:** alias esc to escape ([10bc7e94](https://github.com/angular/angular/commit/10bc7e94), closes [#2010](https://github.com/angular/angular/issues/2010))
* **reflector:** added a method to get type's interfaces ([34d75e89](https://github.com/angular/angular/commit/34d75e89))
* **render:** re-export render and export `DirectiveResolver` ([662da0d7](https://github.com/angular/angular/commit/662da0d7), closes [#2026](https://github.com/angular/angular/issues/2026))
* **router:** add the router bundle to the bundle task. ([05fa9bc9](https://github.com/angular/angular/commit/05fa9bc9))
* **router.js:**
  * export router injectables ([28ee0612](https://github.com/angular/angular/commit/28ee0612))
  * export routerDirectives ([1f20ef97](https://github.com/angular/angular/commit/1f20ef97))
* **test:**
  * added not.toBeNull ([74882c6c](https://github.com/angular/angular/commit/74882c6c))
  * add element probe ([f9908cd4](https://github.com/angular/angular/commit/f9908cd4), closes [#1992](https://github.com/angular/angular/issues/1992))
* **test_lib:**
  * add method to compare stringified DOM element ([c6335c12](https://github.com/angular/angular/commit/c6335c12), closes [#2106](https://github.com/angular/angular/issues/2106))
  * add `containsRegex` ([23d59df8](https://github.com/angular/angular/commit/23d59df8))
* **tests:** add TestComponentBuilder ([c32dbad7](https://github.com/angular/angular/commit/c32dbad7), closes [#1812](https://github.com/angular/angular/issues/1812))
* **transformers:** added support for lifecycle events ([f19970a4](https://github.com/angular/angular/commit/f19970a4))
* **view:**
  * introduce free embedded views ([5030ffb0](https://github.com/angular/angular/commit/5030ffb0))
  * add `AppViewListener` interface ([75578f41](https://github.com/angular/angular/commit/75578f41))


#### Breaking Changes

* 
- `Renderer.detachFreeHostView` was renamed to
  `Renderer.detachFreeView`
- `DomRenderer.getHostElement()` was generalized into
  `DomRenderer.getRootNodes()`

 ([5030ffb0](https://github.com/angular/angular/commit/5030ffb0))
* 
now a `const` constructor

 ([c571b269](https://github.com/angular/angular/commit/c571b269))
* 
Before

    @Directive(properties: {
      'sameName': 'sameName',
      'directiveProp': 'elProp | pipe'
    })

After

    @Directive(properties: [
      'sameName',
      'directiveProp: elProp | pipe'
    ])

 ([d7df853b](https://github.com/angular/angular/commit/d7df853b))


<a name"2.0.0-alpha.25"></a>
### 2.0.0-alpha.25 (2015-05-21)


#### Bug Fixes

* don't call onAllChangesDone on checkNoChanges ([a664f5a6](https://github.com/angular/angular/commit/a664f5a6))
* **XHRImpl:** fix errors, add a spec ([91ccc9af](https://github.com/angular/angular/commit/91ccc9af), closes [#1715](https://github.com/angular/angular/issues/1715))
* **browser:** template elements should have content imported instead of the element itself. ([c9ab8e4b](https://github.com/angular/angular/commit/c9ab8e4b))
* **di:** changed host and view injector to respect visibility ([705ee46f](https://github.com/angular/angular/commit/705ee46f))
* **element_injector:**
  * fixed element injector to inject view dependencies into its components ([b6b52e62](https://github.com/angular/angular/commit/b6b52e62))
  * fixed element injector to resolve dependencies of regular services ([28c2b8f4](https://github.com/angular/angular/commit/28c2b8f4))
* **forms:** changed forms to create only one value accessor instead of always creating Defau ([30c3e5a8](https://github.com/angular/angular/commit/30c3e5a8))
* **gulp:** continue watching when tasks throw ([ac28ac32](https://github.com/angular/angular/commit/ac28ac32), closes [#1915](https://github.com/angular/angular/issues/1915))
* **router:** router link should navigate to non-base Url. ([c4528321](https://github.com/angular/angular/commit/c4528321))
* **test_lib:** fixes nested beforeEach. ([826af401](https://github.com/angular/angular/commit/826af401))


#### Features

* **CD:** add support for === and !== ([0ae89ac0](https://github.com/angular/angular/commit/0ae89ac0))
* **PromisePipe:** remove ref onDestroy ([4afd2b41](https://github.com/angular/angular/commit/4afd2b41))
* **di:** changed toFactory to support dependency annotations ([f210c41c](https://github.com/angular/angular/commit/f210c41c))
* **forms:** migrated forms to typescript ([00c3693d](https://github.com/angular/angular/commit/00c3693d))
* **injector:** support forwardRef in toAlias ([fed86fc8](https://github.com/angular/angular/commit/fed86fc8))


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

