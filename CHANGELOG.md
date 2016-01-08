<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2016-01-08)


### Bug Fixes

* **benchpress:** fix flake ([9d28147](https://github.com/angular/angular/commit/9d28147)), closes [#6161](https://github.com/angular/angular/issues/6161)
* **CHANGELOG:** typo ([d116861](https://github.com/angular/angular/commit/d116861)), closes [#6075](https://github.com/angular/angular/issues/6075) [#6078](https://github.com/angular/angular/issues/6078)
* **code size:** revert previous devMode change to restore size targets ([c47d85b](https://github.com/angular/angular/commit/c47d85b))
* **core:** IE only supports parentNode ([630d931](https://github.com/angular/angular/commit/630d931)), closes [#5994](https://github.com/angular/angular/issues/5994)
* **docs:** fix an import in TOOLS_DART.md ([3524946](https://github.com/angular/angular/commit/3524946)), closes [#5923](https://github.com/angular/angular/issues/5923)
* **forms:** fix SelectControlValueAccessor not to call onChange twice ([b44d36c](https://github.com/angular/angular/commit/b44d36c)), closes [#5969](https://github.com/angular/angular/issues/5969)
* **router:** correctly sort route matches with children by specificity ([b2bc50d](https://github.com/angular/angular/commit/b2bc50d)), closes [#5848](https://github.com/angular/angular/issues/5848) [#6011](https://github.com/angular/angular/issues/6011)
* **router:** preserve specificity for redirects ([a038bb9](https://github.com/angular/angular/commit/a038bb9)), closes [#5933](https://github.com/angular/angular/issues/5933)
* **TemplateParser:** do not match on attrs that are bindings ([9a70f1a](https://github.com/angular/angular/commit/9a70f1a)), closes [#5914](https://github.com/angular/angular/issues/5914)

### Features

* **core:** improve NoAnnotationError message ([197cf09](https://github.com/angular/angular/commit/197cf09)), closes [#4866](https://github.com/angular/angular/issues/4866) [#5927](https://github.com/angular/angular/issues/5927)
* **core:** improve stringify for dart to handle closures ([e67ebb7](https://github.com/angular/angular/commit/e67ebb7))
* **core:** speed up view creation via code gen for view factories. ([7ae23ad](https://github.com/angular/angular/commit/7ae23ad)), closes [#5993](https://github.com/angular/angular/issues/5993)
* **router:** support links with just auxiliary routes ([2a2f9a9](https://github.com/angular/angular/commit/2a2f9a9)), closes [#5930](https://github.com/angular/angular/issues/5930)

### Performance Improvements

* **dart/transform:** Avoid unnecessary reads for files with no view ([89f32f8](https://github.com/angular/angular/commit/89f32f8)), closes [#6183](https://github.com/angular/angular/issues/6183)


### BREAKING CHANGES

* Platform pipes can only contain types and arrays of types,
  but no bindings any more.
* When using transformers, platform pipes need to be specified explicitly
  in the pubspec.yaml via the new config option
  `platform_pipes`.
* `Compiler.compileInHost` now returns a `HostViewFactoryRef`
* Component view is not yet created when component constructor is called.
  -> use `onInit` lifecycle callback to access the view of a component
* `ViewRef#setLocal` has been moved to new type `EmbeddedViewRef`
* `internalView` is gone, use `EmbeddedViewRef.rootNodes` to access
  the root nodes of an embedded view
* `renderer.setElementProperty`, `..setElementStyle`, `..setElementAttribute` now
  take a native element instead of an ElementRef
* `Renderer` interface now operates on plain native nodes,
  instead of `RenderElementRef`s or `RenderViewRef`s


<a name="2.0.0-beta.0"></a>
# 2.0.0-beta.0 (2015-12-15)




<a name="2.0.0-alpha.55"></a>
# 2.0.0-alpha.55 (2015-12-15)


### Bug Fixes

* **router:** export ROUTER_LINK_DSL_PROVIDER and hide MockPopStateEvent ([fc75220](https://github.com/angular/angular/commit/fc75220))

### Features

* **core:** enable dev mode by default ([3dca9d5](https://github.com/angular/angular/commit/3dca9d5))


### BREAKING CHANGES

* Before
Previously Angular would run in dev prod mode by default, and you could enable the dev mode by calling enableDevMode.
After
Now, Angular runs in the dev mode by default, and you can enable the prod mode by calling enableProdMode.



<a name="2.0.0-alpha.54"></a>
# 2.0.0-alpha.54 (2015-12-15)


### Bug Fixes

* **bundles:** don't include RxJS in System.register bundles ([77b7cae](https://github.com/angular/angular/commit/77b7cae))
* **bundles:** remove ngUpgrade from the angular2.js bundle ([283962f](https://github.com/angular/angular/commit/283962f)), closes [#5739](https://github.com/angular/angular/issues/5739) [#5854](https://github.com/angular/angular/issues/5854)
* **bundles:** remove polyfills from angular2.js bundle ([2983558](https://github.com/angular/angular/commit/2983558)), closes [#5881](https://github.com/angular/angular/issues/5881)
* **bundles:** rename the testing.js bundle ([d55655f](https://github.com/angular/angular/commit/d55655f)), closes [#5899](https://github.com/angular/angular/issues/5899) [#5776](https://github.com/angular/angular/issues/5776)
* **bundles:** rename UMD bundles ([61b9468](https://github.com/angular/angular/commit/61b9468)), closes [#5898](https://github.com/angular/angular/issues/5898)
* **changelog:** fix rxjs operator import paths ([a79fe05](https://github.com/angular/angular/commit/a79fe05)), closes [#5864](https://github.com/angular/angular/issues/5864)
* **docs,benchmarks:** remove invalid </input> closing tags ([5b63b67](https://github.com/angular/angular/commit/5b63b67))


### BREAKING CHANGES

* System.register testing bundle was renamed:
`testing.js` -> `testing.dev.js`

* UMD bundles were renamed:
* `angular2.umd.js` -> `angular2-all.umd.js`
* `angular2-testing.umd.js` -> `angular2-all-testing.umd.js`

* RxJS used to be bundled with Angular 2 code and this is not the case
any more. RxJS needs to be loaded explicitly.

* Previously `angular2.js`, `angular2.min.js` and `angular2.dev.js` bundles
would have zone.js and reflect-metadata pre-appended. New bundles don't
contain zone.js nor reflect-metadata - those external dependencies can
be easily loaded into a browser using `angular2-polyfills.js`

* `ngUpgrade` related symbols are no longer part of the `angular2.js`
bundle. `ngUpgrade` has a dedicated `upgrade.js` bundle now.



<a name="2.0.0-alpha.53"></a>
# 2.0.0-alpha.53 (2015-12-13)


### Bug Fixes

* **angular2:** don't export compiler bits as public API ([20c6eeb](https://github.com/angular/angular/commit/20c6eeb)), closes [#5815](https://github.com/angular/angular/issues/5815) [#5797](https://github.com/angular/angular/issues/5797)
* **angular2:** remove `angular2.ts` module ([200dc00](https://github.com/angular/angular/commit/200dc00)), closes [#5815](https://github.com/angular/angular/issues/5815) [#5844](https://github.com/angular/angular/issues/5844)
* **animate:** ensure transition properties are removed once the animation is over ([b8e69a2](https://github.com/angular/angular/commit/b8e69a2))
* **async:** improve Rx support in ObservableWrapper ([4a17e69](https://github.com/angular/angular/commit/4a17e69))
* **async:** support BehaviorSubjects in async pipe ([398f024](https://github.com/angular/angular/commit/398f024))
* **bundles:** don't use angular2/angular2 in config of System.register bundles ([8c69497](https://github.com/angular/angular/commit/8c69497))
* **changelog:** fix ngFor on template ([3190c59](https://github.com/angular/angular/commit/3190c59)), closes [#5785](https://github.com/angular/angular/issues/5785)
* **compiler:** remove AppRootUrl ([ed2c25e](https://github.com/angular/angular/commit/ed2c25e))
* **core:** workaround for typescript@1.7.3 breakage #5784 ([30e25ac](https://github.com/angular/angular/commit/30e25ac)), closes [#5784](https://github.com/angular/angular/issues/5784)
* **dom_renderer:** moveNodeAfterSiblings should not detach the reference node ([edcb34d](https://github.com/angular/angular/commit/edcb34d)), closes [#5077](https://github.com/angular/angular/issues/5077) [#5759](https://github.com/angular/angular/issues/5759)
* **HtmlParser:** allow ng-content elements regardless the namespace ([080469f](https://github.com/angular/angular/commit/080469f)), closes [#5745](https://github.com/angular/angular/issues/5745)
* **parse5:** support comment nodes with getText and setText ([693d9dc](https://github.com/angular/angular/commit/693d9dc)), closes [#5805](https://github.com/angular/angular/issues/5805)
* **public_spec:** check exports of barrels instead of angular2/angular2 ([979162d](https://github.com/angular/angular/commit/979162d)), closes [#5841](https://github.com/angular/angular/issues/5841)
* **styles:** Escape \r characters in compiled text ([92ddc62](https://github.com/angular/angular/commit/92ddc62)), closes [#5772](https://github.com/angular/angular/issues/5772) [#5835](https://github.com/angular/angular/issues/5835)
* **TemplateParser:** match element and attributes regardless the namespace ([7c13372](https://github.com/angular/angular/commit/7c13372))
* **upgrade:** allow directives with empty template ([2ca5e38](https://github.com/angular/angular/commit/2ca5e38))
* **web_workers:** remove unnecessary setup module and AppRootUrl ([a885f37](https://github.com/angular/angular/commit/a885f37)), closes [#5820](https://github.com/angular/angular/issues/5820)

### Features

* **benchpress:** add receivedData + requestCount to PerflogMetric ([fe1dd77](https://github.com/angular/angular/commit/fe1dd77)), closes [#5750](https://github.com/angular/angular/issues/5750)
* **dom_renderer:** add setBindingDebugInfo method ([79399e1](https://github.com/angular/angular/commit/79399e1)), closes [#5227](https://github.com/angular/angular/issues/5227)
* **facade:** do not reexport Observable from angular2/core ([43f42d9](https://github.com/angular/angular/commit/43f42d9))
* **Headers:** implement `toJSON` ([0cb32c2](https://github.com/angular/angular/commit/0cb32c2))
* **renderer:** use a comment instead of an element when stamping out template>` elements ([194dc7d](https://github.com/angular/angular/commit/194dc7d)), closes [#4805](https://github.com/angular/angular/issues/4805)


### BREAKING CHANGES

* Before import {Observable} from 'angular2/core'
After import {Observable} from 'rxjs/Observable';

* S:
The setupWebWorker function exported from 
angular2/platform/worker_app  no longer returns a promise of providers, 
but instead synchronously returns providers.
Related to #5815

* `angular2/angular2` was removed. Use the correct import from one of the barrels. E.g. `angular2/core`, `angular2/platform/browser`,  `angular2/common`, …
Note: This only applies to JavaScript, Dart is not changed.

* The following symbols are not exported from angular2/angular2 any more:
`UrlResolver`, `AppRootUrl`, `getUrlScheme`, `DEFAULT_PACKAGE_URL_PROVIDER`.
Use imports from `angular2/compiler` instead.



<a name="2.0.0-alpha.52"></a>
# 2.0.0-alpha.52 (2015-12-10)


### Features

* camelCase Angular (kebab-case removal) ([da9b46a](https://github.com/angular/angular/commit/da9b46a))
* **camelCase Angular:** legacy template transformer ([9e44dd8](https://github.com/angular/angular/commit/9e44dd8))


### BREAKING CHANGES

* Angular is now fully camel case.
Before:
    <p *ng-if="cond">
    <my-cmp [my-prop]="exp">
    <my-cmp (my-event)="action()">
    <my-cmp [(my-prop)]="prop">
    <input #my-input>
    <template ng-for #my-item [ng-for-of]=items #my-index="index">
After
    <p *ngIf="cond">
    <my-cmp [myProp]="exp">
    <my-cmp (myEvent)="action()">
    <my-cmp [(myProp)]="prop">
    <input #myInput>`,
    <template ngFor="#my-item" [ngForOf]=items #myIndex="index">
The full details are found in [angular2/docs/migration/kebab-case.md](https://github.com/angular/angular/blob/master/modules/angular2/docs/migration/kebab-case.md)



<a name="2.0.0-alpha.51"></a>
# 2.0.0-alpha.51 (2015-12-10)


### Features

* **bundles:** add angular-testing UMD bundle ([d6d759d](https://github.com/angular/angular/commit/d6d759d)), closes [#5581](https://github.com/angular/angular/issues/5581) [#5734](https://github.com/angular/angular/issues/5734)
* **core:** provide support for relative assets for components ([28860d3](https://github.com/angular/angular/commit/28860d3)), closes [#5634](https://github.com/angular/angular/issues/5634)
* **core:** provide support for relative assets for components ([db096a5](https://github.com/angular/angular/commit/db096a5)), closes [#5634](https://github.com/angular/angular/issues/5634) [#5634](https://github.com/angular/angular/issues/5634)

### Reverts

* feat(core): provide support for relative assets for components ([5f0ce30](https://github.com/angular/angular/commit/5f0ce30))



<a name="2.0.0-alpha.50"></a>
# 2.0.0-alpha.50 (2015-12-09)


### Bug Fixes

* **http:** use `any` for res.json() return ([cbf7888](https://github.com/angular/angular/commit/cbf7888)), closes [#5636](https://github.com/angular/angular/issues/5636) [#5646](https://github.com/angular/angular/issues/5646)
* **testing:** remove Symbol dummy shim ([c1ae49d](https://github.com/angular/angular/commit/c1ae49d)), closes [#5067](https://github.com/angular/angular/issues/5067) [#5719](https://github.com/angular/angular/issues/5719)

### Features

* **testing:** package angular2_testing to prepare it for publishing ([cc8f1f9](https://github.com/angular/angular/commit/cc8f1f9)), closes [#5682](https://github.com/angular/angular/issues/5682)



<a name="2.0.0-alpha.49"></a>
# 2.0.0-alpha.49 (2015-12-09)


### Bug Fixes

* **bootstrap:** fix the configuration of ExceptionHandler ([0d9a1de](https://github.com/angular/angular/commit/0d9a1de))
* **build:** lock down version of package:code_transformers ([85d89ba](https://github.com/angular/angular/commit/85d89ba))
* **bundles:** clean-up and re-organize UMD bundles ([fb4f1e8](https://github.com/angular/angular/commit/fb4f1e8)), closes [#5593](https://github.com/angular/angular/issues/5593) [#5697](https://github.com/angular/angular/issues/5697)
* **bundles:** remove SFX bundle ([a4ba46c](https://github.com/angular/angular/commit/a4ba46c)), closes [#5665](https://github.com/angular/angular/issues/5665) [#5712](https://github.com/angular/angular/issues/5712)
* **bundles:** rename external-dependencies to angular-polyfills ([b3c91b1](https://github.com/angular/angular/commit/b3c91b1)), closes [#5714](https://github.com/angular/angular/issues/5714) [#5716](https://github.com/angular/angular/issues/5716)
* **changelog:** add RxJS imports breaking change ([ad48169](https://github.com/angular/angular/commit/ad48169)), closes [#5678](https://github.com/angular/angular/issues/5678)
* **changelog:** correct import path ([86c74cf](https://github.com/angular/angular/commit/86c74cf)), closes [#5681](https://github.com/angular/angular/issues/5681)
* **compiler:** support properties on SVG elements ([daaa8ee](https://github.com/angular/angular/commit/daaa8ee)), closes [#5653](https://github.com/angular/angular/issues/5653)
* **dynamic_component_loader:** leave the view tree in a consistent state when hydration fails ([0df8bc4](https://github.com/angular/angular/commit/0df8bc4)), closes [#5718](https://github.com/angular/angular/issues/5718)
* **form:** Form directives are exportedAs 'ngForm' (was 'form') ([8657ca4](https://github.com/angular/angular/commit/8657ca4)), closes [#5658](https://github.com/angular/angular/issues/5658) [#5709](https://github.com/angular/angular/issues/5709)
* **HtmlLexer:** handle CR in input stream per HTML spec ([9850e68](https://github.com/angular/angular/commit/9850e68)), closes [#5618](https://github.com/angular/angular/issues/5618) [#5629](https://github.com/angular/angular/issues/5629)
* **HtmlLexer:** tag name must follow "<" without space ([47f1d12](https://github.com/angular/angular/commit/47f1d12))
* **HtmlParser:** Do not add parent element for template children ([3a43861](https://github.com/angular/angular/commit/3a43861)), closes [#5638](https://github.com/angular/angular/issues/5638)
* **HtmlParser:** ignore LF immediately following pre, textarea & listing ([eb0ea93](https://github.com/angular/angular/commit/eb0ea93)), closes [#5630](https://github.com/angular/angular/issues/5630) [#5688](https://github.com/angular/angular/issues/5688)
* **HtmlParser:** mark <source> elements as void ([50490b5](https://github.com/angular/angular/commit/50490b5)), closes [#5663](https://github.com/angular/angular/issues/5663) [#5668](https://github.com/angular/angular/issues/5668)
* **npm:** move es6-shim from devDependencies to dependencies ([21542ed](https://github.com/angular/angular/commit/21542ed))
* **package:** relock RxJS to alpha.11 ([4b1618c](https://github.com/angular/angular/commit/4b1618c)), closes [#5643](https://github.com/angular/angular/issues/5643) [#5644](https://github.com/angular/angular/issues/5644)
* **router:** set correct redirect/default URL from hashchange ([aa85856](https://github.com/angular/angular/commit/aa85856)), closes [#5590](https://github.com/angular/angular/issues/5590) [#5683](https://github.com/angular/angular/issues/5683)

### Features

* **HtmlLexer:** allow "<" in text tokens ([aecf681](https://github.com/angular/angular/commit/aecf681)), closes [#5550](https://github.com/angular/angular/issues/5550)
* **TemplateParser:** allow template elements regardless the namespace  ([1f35048](https://github.com/angular/angular/commit/1f35048)), closes [#5703](https://github.com/angular/angular/issues/5703)


### BREAKING CHANGES

* The existing sfx bundle (angular2.sfx.dev.js) is replaced by UMD bundles:
angular2.umd.js and angular2.umd.dev.js. The new UMD bundles dont have
polyfills (zone.js, reflect-metadata) pre-appended. Those polyfills
can be easily loaded by including the angular-polyfills.js bundle.

* The `external-dependencies.js` bundle was removed.
Use `angular-polyfills.js` instead.

* Number and content of UMD bundles have changed:
- we only publish one bundle that contains: core, common, platform/browser, http, router, instrumentation and upgrade
- exported names have changed and now:
  - core is exported as `ng.core`
  - common is exported as `ng.common`
  - platform/browser is exported as `ng.platform.browser`
  - http is exported as `ng.http`
  - router is exported as `ng.router`
  - instrumentation is exported as `ng.instrumentation`
  - upgrade is exported as `ng.upgrade`

* Before:
    <form #f="form">
After:
    <form #f="ngForm">



<a name="2.0.0-alpha.48"></a>
# 2.0.0-alpha.48 (2015-12-05)


### Bug Fixes

* **build:** change npm publish script not to remove angular folder when building benchpress ([47d0942](https://github.com/angular/angular/commit/47d0942))
* **build:** include benchpress into browser_tree ([87ac36f](https://github.com/angular/angular/commit/87ac36f))
* **core/forms:**  input[type=text] .valueChanges fires unexpectedly ([680f7e0](https://github.com/angular/angular/commit/680f7e0)), closes [#4768](https://github.com/angular/angular/issues/4768) [#5284](https://github.com/angular/angular/issues/5284) [#5401](https://github.com/angular/angular/issues/5401)
* **dart/reflection:** Fix `NoReflectionCapabilities` interface ([0a3a17f](https://github.com/angular/angular/commit/0a3a17f)), closes [#5559](https://github.com/angular/angular/issues/5559) [#5578](https://github.com/angular/angular/issues/5578)
* **HtmlParser:** close void elements on all node types ([9c6b929](https://github.com/angular/angular/commit/9c6b929)), closes [#5528](https://github.com/angular/angular/issues/5528)
* **HtmlParser:** do not add a tbody parent for tr inside thead & tfoot ([c58e7e0](https://github.com/angular/angular/commit/c58e7e0)), closes [#5403](https://github.com/angular/angular/issues/5403)
* **HtmlParser:** ng-content is not a void element ([e67e195](https://github.com/angular/angular/commit/e67e195)), closes [#5563](https://github.com/angular/angular/issues/5563) [#5586](https://github.com/angular/angular/issues/5586)
* **WebWorker:** Add @AngularEntrypoint to worker_app bundle ([5e50859](https://github.com/angular/angular/commit/5e50859)), closes [#5588](https://github.com/angular/angular/issues/5588)

### Features

* **core:** remove typings from package.json to disallow 'import * as n from 'angular2''' ([9a65ea7](https://github.com/angular/angular/commit/9a65ea7))
* **dart/transform:** Add quick_transformer ([f77ca7b](https://github.com/angular/angular/commit/f77ca7b)), closes [#5484](https://github.com/angular/angular/issues/5484)
* **dart/transform:** Introduce @AngularEntrypoint() ([6b2ef25](https://github.com/angular/angular/commit/6b2ef25))
* **HtmlParser:** add most common named character references ([d90a226](https://github.com/angular/angular/commit/d90a226)), closes [#5546](https://github.com/angular/angular/issues/5546) [#5579](https://github.com/angular/angular/issues/5579)
* **HtmlParser:** better error message when a void tag has content ([62c2ed7](https://github.com/angular/angular/commit/62c2ed7))
* **HtmlParser:** enforce no end tag for void elements ([5660446](https://github.com/angular/angular/commit/5660446))
* **HtmlParser:** enforce only void & foreign elts can be self closed ([d388c0a](https://github.com/angular/angular/commit/d388c0a)), closes [#5591](https://github.com/angular/angular/issues/5591)
* **mocks:** Mark mock objects @Injectable() ([35e32bb](https://github.com/angular/angular/commit/35e32bb)), closes [#5576](https://github.com/angular/angular/issues/5576)
* **router:** implement router link DSL ([4ea5b6e](https://github.com/angular/angular/commit/4ea5b6e)), closes [#5557](https://github.com/angular/angular/issues/5557) [#5562](https://github.com/angular/angular/issues/5562)
* **sourcemaps:** use inline source maps and inline sources in node_tree ([7e18d4c](https://github.com/angular/angular/commit/7e18d4c)), closes [#5617](https://github.com/angular/angular/issues/5617)
* **test:** add angular2_testing dart library ([93a1ec2](https://github.com/angular/angular/commit/93a1ec2)), closes [#3289](https://github.com/angular/angular/issues/3289)
* **testing:** export useful properties from componentFixture ([e9f873a](https://github.com/angular/angular/commit/e9f873a))
* **typings:** import global-es6.d.ts in core ([22e9590](https://github.com/angular/angular/commit/22e9590))


### BREAKING CHANGES

* `<whatever />` used to be expanded to `<whatever></whatever>`.
The parser now follows the HTML5 spec more closely.
Only void and foreign elements can be self closed.

* End tags used to be tolerated for void elements with no content.
They are no more allowed so that we more closely follow the HTML5 spec.

* Before
import * as ng from 'angular2';
After
import * as core from 'angular2/core';



<a name="2.0.0-alpha.47"></a>
# 2.0.0-alpha.47 (2015-12-01)


### Bug Fixes

* **analyzer:** fix dart analyzer errors ([56e7364](https://github.com/angular/angular/commit/56e7364)), closes [#4992](https://github.com/angular/angular/issues/4992)
* **benchmarks:** fix tracing categories to work with Dartium ([64bd963](https://github.com/angular/angular/commit/64bd963)), closes [#5209](https://github.com/angular/angular/issues/5209)
* **benchmarks:** update react and polymer benchmarks and get tree update numbers for all of the b ([bc10dc3](https://github.com/angular/angular/commit/bc10dc3)), closes [#4709](https://github.com/angular/angular/issues/4709)
* **benchpress:** increase sampling frequency ([127d6b6](https://github.com/angular/angular/commit/127d6b6)), closes [#4985](https://github.com/angular/angular/issues/4985)
* **build:** do not reexport compiler from angular2/angular2 ([30d35b5](https://github.com/angular/angular/commit/30d35b5)), closes [#5422](https://github.com/angular/angular/issues/5422)
* **build:** EMFILE error on Windows when executing JS unit tests ([1dc8a0a](https://github.com/angular/angular/commit/1dc8a0a)), closes [#4525](https://github.com/angular/angular/issues/4525) [#4796](https://github.com/angular/angular/issues/4796)
* **build:** fix npm install not to depend on minimist ([6d70cd7](https://github.com/angular/angular/commit/6d70cd7)), closes [#5282](https://github.com/angular/angular/issues/5282)
* **build:** fix source maps ([87d56ac](https://github.com/angular/angular/commit/87d56ac)), closes [#5444](https://github.com/angular/angular/issues/5444)
* **build:** increase memory limit ([2cd0f07](https://github.com/angular/angular/commit/2cd0f07))
* **build:** reorder bundling step ([5fecb3b](https://github.com/angular/angular/commit/5fecb3b)), closes [#5208](https://github.com/angular/angular/issues/5208)
* **ChangeDetector:** support for NaN ([1316c3e](https://github.com/angular/angular/commit/1316c3e)), closes [#4853](https://github.com/angular/angular/issues/4853)
* **compiler:** create literal property bindings for empty *… directives. ([b2dc5c2](https://github.com/angular/angular/commit/b2dc5c2)), closes [#4916](https://github.com/angular/angular/issues/4916)
* **compiler:** dedup directives in template compiler ([87ddc8f](https://github.com/angular/angular/commit/87ddc8f)), closes [#5311](https://github.com/angular/angular/issues/5311) [#5464](https://github.com/angular/angular/issues/5464)
* **compiler:** do not match directives to variable names ([711dbf4](https://github.com/angular/angular/commit/711dbf4))
* **compiler:** don’t lowercase attributes to support svg ([6133f2c](https://github.com/angular/angular/commit/6133f2c)), closes [#5166](https://github.com/angular/angular/issues/5166)
* **compiler:** load style urls in runtime mode correctly ([27dbd2d](https://github.com/angular/angular/commit/27dbd2d)), closes [#4952](https://github.com/angular/angular/issues/4952)
* **compiler:** remove style when [style.foo]='exp' evaluates to null ([f1989e7](https://github.com/angular/angular/commit/f1989e7)), closes [#5110](https://github.com/angular/angular/issues/5110) [#5114](https://github.com/angular/angular/issues/5114)
* **compiler:** support events on a template element that are consumed via a direct expression ([3118d5c](https://github.com/angular/angular/commit/3118d5c)), closes [#4883](https://github.com/angular/angular/issues/4883)
* **core:** Add an error state for ChangeDetectors that is set when bindings or lifecycle ev ([d1b54d6](https://github.com/angular/angular/commit/d1b54d6)), closes [#4323](https://github.com/angular/angular/issues/4323) [#4953](https://github.com/angular/angular/issues/4953)
* **core:** Export dev mode API in Dart. ([a3e6406](https://github.com/angular/angular/commit/a3e6406)), closes [#5233](https://github.com/angular/angular/issues/5233)
* **core:** Fix typo ([485c85b](https://github.com/angular/angular/commit/485c85b)), closes [#4803](https://github.com/angular/angular/issues/4803)
* **core:** Provide setDevMode() to enable/disable development mode in Javascript. ([4bb9c46](https://github.com/angular/angular/commit/4bb9c46))
* **core:** reexport PLATFORM_DIRECTIVES and PLATFORM_PIPES in dart ([01ebff4](https://github.com/angular/angular/commit/01ebff4))
* **core:** Run component disposal before destroyRootHostView() to avoid crash if change det ([b22eddf](https://github.com/angular/angular/commit/b22eddf)), closes [#5226](https://github.com/angular/angular/issues/5226)
* **core:** Unload components when individually disposed. ([1ff1792](https://github.com/angular/angular/commit/1ff1792))
* **core:** various dart-specific fixes for core and facades ([4a43230](https://github.com/angular/angular/commit/4a43230))
* **dart:** fix the static_browser platform not to include compiler ([ad6fb06](https://github.com/angular/angular/commit/ad6fb06)), closes [#5321](https://github.com/angular/angular/issues/5321)
* **dart/transform:** Consider of line numbers in inliner_for_test ([a31e2f5](https://github.com/angular/angular/commit/a31e2f5)), closes [#5281](https://github.com/angular/angular/issues/5281) [#5285](https://github.com/angular/angular/issues/5285)
* **dart/transform:** Fix issue with deferred in .ng_deps ([6be95ae](https://github.com/angular/angular/commit/6be95ae))
* **dart/transform:** Gracefully handle empty .ng_meta.json files ([a87c5d9](https://github.com/angular/angular/commit/a87c5d9))
* **dart/transform:** Omit bootstrap.dart in ng_deps ([0db0252](https://github.com/angular/angular/commit/0db0252)), closes [#5315](https://github.com/angular/angular/issues/5315) [#5348](https://github.com/angular/angular/issues/5348)
* **debug_element:** don’t descend into merged embedded views on `componentChildren`. ([60bedb4](https://github.com/angular/angular/commit/60bedb4)), closes [#4920](https://github.com/angular/angular/issues/4920)
* **default_value_accessor:** support custom input elements that fire custom change events. ([56a9b02](https://github.com/angular/angular/commit/56a9b02)), closes [#4878](https://github.com/angular/angular/issues/4878)
* **di:** allow dependencies as flat array ([6514b8c](https://github.com/angular/angular/commit/6514b8c))
* **EventEmitter:** resolve onError and onComplete asynchronously ([019cb41](https://github.com/angular/angular/commit/019cb41)), closes [#4443](https://github.com/angular/angular/issues/4443)
* **examples:** Don't generate Dart code for TS examples in nested directories. ([b571baa](https://github.com/angular/angular/commit/b571baa))
* **facades:** reduce node count by 1 in assertionsEnabled ([edfa35b](https://github.com/angular/angular/commit/edfa35b))
* **forms:** Export the NG_VALUE_ACCESSOR binding token. ([fee5dea](https://github.com/angular/angular/commit/fee5dea))
* **forms:** handle control change in NgFormControl ([d29a9a9](https://github.com/angular/angular/commit/d29a9a9))
* **forms:** scope value accessors, validators, and async validators to self ([ba64b5e](https://github.com/angular/angular/commit/ba64b5e)), closes [#5440](https://github.com/angular/angular/issues/5440)
* **forms:** update compose to handle null validators ([9d58f46](https://github.com/angular/angular/commit/9d58f46))
* **http:** error on non-200 status codes ([201f189](https://github.com/angular/angular/commit/201f189)), closes [#5130](https://github.com/angular/angular/issues/5130)
* **http:** Fix all requests defaulting to Get ([e1d7bdc](https://github.com/angular/angular/commit/e1d7bdc)), closes [#5309](https://github.com/angular/angular/issues/5309) [#5397](https://github.com/angular/angular/issues/5397)
* **http:** refactor 'require' statements to 'import' declarations for Rx ([bcd926a](https://github.com/angular/angular/commit/bcd926a)), closes [#5287](https://github.com/angular/angular/issues/5287)
* **http:** return Response headers ([4332ccf](https://github.com/angular/angular/commit/4332ccf)), closes [#5237](https://github.com/angular/angular/issues/5237)
* **http:** return URL in Response ([46fc153](https://github.com/angular/angular/commit/46fc153)), closes [#5165](https://github.com/angular/angular/issues/5165)
* **http:** use Observable<Response> on Http methods ([a9b1270](https://github.com/angular/angular/commit/a9b1270)), closes [#5017](https://github.com/angular/angular/issues/5017)
* **http:** use Response for JSONP errors ([31687ef](https://github.com/angular/angular/commit/31687ef))
* **JsonPipe:** marks json pipe as not pure Marked json pipe as not pure so that it runs all the ([fc016b5](https://github.com/angular/angular/commit/fc016b5)), closes [#4821](https://github.com/angular/angular/issues/4821)
* **lang:** avoid infinite loop when calling assert() ([5c48236](https://github.com/angular/angular/commit/5c48236)), closes [#4981](https://github.com/angular/angular/issues/4981) [#4983](https://github.com/angular/angular/issues/4983)
* **lint:** enforce that module-private members have @internal. ([098201d](https://github.com/angular/angular/commit/098201d)), closes [#4645](https://github.com/angular/angular/issues/4645) [#4989](https://github.com/angular/angular/issues/4989)
* **material:** Disable md-grid-list tests until #5132 is fixed. ([0b11051](https://github.com/angular/angular/commit/0b11051))
* **ng_class:** support sets correctly ([2957b0b](https://github.com/angular/angular/commit/2957b0b)), closes [#4910](https://github.com/angular/angular/issues/4910)
* **ng-content:** wildcard ng-content has to go last. ([39626a9](https://github.com/angular/angular/commit/39626a9)), closes [#5016](https://github.com/angular/angular/issues/5016)
* **NgFor:** allow default templates with ng-for-template ([2d0c8f1](https://github.com/angular/angular/commit/2d0c8f1)), closes [#5161](https://github.com/angular/angular/issues/5161)
* **parser:** do not crash on untokenizable quote prefixes ([b90de66](https://github.com/angular/angular/commit/b90de66)), closes [#5486](https://github.com/angular/angular/issues/5486)
* **Pipe:** pure is an optional argument ([7ba426c](https://github.com/angular/angular/commit/7ba426c))
* **Pipes:** mark date & slice as non-pure ([2f1f83a](https://github.com/angular/angular/commit/2f1f83a))
* **playground:** fix the inbox example ([6240245](https://github.com/angular/angular/commit/6240245))
* **publish:** syntax fix ([9985968](https://github.com/angular/angular/commit/9985968))
* **render:** create svg elements with the right namespace ([ac52bfd](https://github.com/angular/angular/commit/ac52bfd)), closes [#4506](https://github.com/angular/angular/issues/4506) [#4949](https://github.com/angular/angular/issues/4949)
* **renderer:** apply host element encapsulation also if the parent component is not encapsulate ([344776f](https://github.com/angular/angular/commit/344776f)), closes [#5240](https://github.com/angular/angular/issues/5240)
* **renderer:** support `xlink:href` attribute in svg ([540b8c2](https://github.com/angular/angular/commit/540b8c2)), closes [#4956](https://github.com/angular/angular/issues/4956)
* **router:** apply APP_BASE_HREF when using PathLocationStrategy ([ac38812](https://github.com/angular/angular/commit/ac38812)), closes [#5028](https://github.com/angular/angular/issues/5028)
* **router:** fix a typing issue ([4215afc](https://github.com/angular/angular/commit/4215afc)), closes [#5518](https://github.com/angular/angular/issues/5518)
* **router:** fix error message text ([280cd33](https://github.com/angular/angular/commit/280cd33))
* **router:** properly serialize aux routes ([23784a2](https://github.com/angular/angular/commit/23784a2))
* **router:** respect LocationStrategy when constructing hrefs in links ([2a3e11d](https://github.com/angular/angular/commit/2a3e11d)), closes [#4333](https://github.com/angular/angular/issues/4333)
* **router:** respond to hashchange events ([53bddec](https://github.com/angular/angular/commit/53bddec)), closes [#5013](https://github.com/angular/angular/issues/5013)
* **RouterLink:** do not prevent default behavior if target set on anchor element ([a69e7fe](https://github.com/angular/angular/commit/a69e7fe)), closes [#4233](https://github.com/angular/angular/issues/4233) [#5082](https://github.com/angular/angular/issues/5082)
* **setup:** set tsconfig so that it works in editors ([fb8b815](https://github.com/angular/angular/commit/fb8b815))
* **shadow_css:** strip comments and fix logic for parsing rules. ([d8775e0](https://github.com/angular/angular/commit/d8775e0)), closes [#5037](https://github.com/angular/angular/issues/5037) [#5011](https://github.com/angular/angular/issues/5011)
* **style_url_resolver:** include `asset:` urls into precompiled stylesheets. ([d8b3601](https://github.com/angular/angular/commit/d8b3601)), closes [#4926](https://github.com/angular/angular/issues/4926)
* **test:** "integration tests svg should support svg elements" fails in non-Chrome browsers ([c4964e7](https://github.com/angular/angular/commit/c4964e7)), closes [#4987](https://github.com/angular/angular/issues/4987) [#5000](https://github.com/angular/angular/issues/5000)
* **test:** Android browser does not support calc() a CSS unit value ([e37799a](https://github.com/angular/angular/commit/e37799a)), closes [#5001](https://github.com/angular/angular/issues/5001)
* **transformers:** Fix @Input/@Output annotations with setters/getters ([d9f362a](https://github.com/angular/angular/commit/d9f362a)), closes [#5251](https://github.com/angular/angular/issues/5251) [#5259](https://github.com/angular/angular/issues/5259)
* **transformers:** use BarbackMode instead of assertionEnabled to enable debug info generation ([7f3223b](https://github.com/angular/angular/commit/7f3223b)), closes [#5245](https://github.com/angular/angular/issues/5245) [#5466](https://github.com/angular/angular/issues/5466)
* **typings:** don't expose RootTestComponent_ ([05d29a9](https://github.com/angular/angular/commit/05d29a9)), closes [#4776](https://github.com/angular/angular/issues/4776) [#4777](https://github.com/angular/angular/issues/4777)
* **typings:** two errors not reported by our build: ([7f6289c](https://github.com/angular/angular/commit/7f6289c))
* remove internal usages of deprecated overrideOnTurnDone ([c814dfb](https://github.com/angular/angular/commit/c814dfb)), closes [#5079](https://github.com/angular/angular/issues/5079)
* **url_resolver:** always replace `package:` in Dart, even if it came from `baseUrl`. ([fd9b675](https://github.com/angular/angular/commit/fd9b675)), closes [#4775](https://github.com/angular/angular/issues/4775)
* **web worker:** remove usages of deprecated zone API ([d59c20c](https://github.com/angular/angular/commit/d59c20c)), closes [#5425](https://github.com/angular/angular/issues/5425)
* **WebWorker:** Don't send messages when the buffer is empty ([8485ef9](https://github.com/angular/angular/commit/8485ef9)), closes [#4138](https://github.com/angular/angular/issues/4138)
* **WebWorker:** Fix bug causing multi browser demo to crash ([eba7073](https://github.com/angular/angular/commit/eba7073)), closes [#4839](https://github.com/angular/angular/issues/4839)
* remove deprecated zone API usage in testability ([3593d85](https://github.com/angular/angular/commit/3593d85)), closes [#5084](https://github.com/angular/angular/issues/5084)
* **WebWorker:** Serialize scroll events ([84d1f93](https://github.com/angular/angular/commit/84d1f93)), closes [#4836](https://github.com/angular/angular/issues/4836) [#4840](https://github.com/angular/angular/issues/4840)

### Features

* **bootstrap:** add platform and app initializers ([3c43a8c](https://github.com/angular/angular/commit/3c43a8c)), closes [#5355](https://github.com/angular/angular/issues/5355)
* **build:** add an option to disable type checks when running tests ([4e585bc](https://github.com/angular/angular/commit/4e585bc)), closes [#5299](https://github.com/angular/angular/issues/5299)
* **bundles:** publish UMD bundles ([fa725b4](https://github.com/angular/angular/commit/fa725b4)), closes [#5223](https://github.com/angular/angular/issues/5223)
* **change detection:** remove support for "if" ([0a94021](https://github.com/angular/angular/commit/0a94021)), closes [#4616](https://github.com/angular/angular/issues/4616)
* **change_detect:** Guard `checkNoChanges` behind `assertionsEnabled` ([63e853d](https://github.com/angular/angular/commit/63e853d)), closes [#4560](https://github.com/angular/angular/issues/4560)
* **ChangeDetector:** Add support for short-circuiting ([7e92d2e](https://github.com/angular/angular/commit/7e92d2e))
* **Compiler:** case sensitive html parser ([86aeb8b](https://github.com/angular/angular/commit/86aeb8b))
* **Compiler:** case sensitive html parser ([36a423f](https://github.com/angular/angular/commit/36a423f)), closes [#4417](https://github.com/angular/angular/issues/4417) [#5264](https://github.com/angular/angular/issues/5264)
* **Compiler:** case sensitive html parser ([a8edc1e](https://github.com/angular/angular/commit/a8edc1e)), closes [#4417](https://github.com/angular/angular/issues/4417) [#5264](https://github.com/angular/angular/issues/5264)
* **Compiler:** case sensitive html parser ([adb8756](https://github.com/angular/angular/commit/adb8756))
* **core:** add support for ambient directives ([5948aba](https://github.com/angular/angular/commit/5948aba))
* **core:** add support for ambient directives to dart transformers ([4909fed](https://github.com/angular/angular/commit/4909fed)), closes [#5129](https://github.com/angular/angular/issues/5129)
* **core:** extract platforms out of core ([0eab4fc](https://github.com/angular/angular/commit/0eab4fc)), closes [#5219](https://github.com/angular/angular/issues/5219) [#5280](https://github.com/angular/angular/issues/5280)
* **core:** extract platforms out of core ([3f4628c](https://github.com/angular/angular/commit/3f4628c)), closes [#5219](https://github.com/angular/angular/issues/5219)
* **core:** make transformers handle @Input/@Output/@HostBinding/@HostListener ([16bc238](https://github.com/angular/angular/commit/16bc238)), closes [#5080](https://github.com/angular/angular/issues/5080)
* **core:** PlatformRef and ApplicationRef support registration of disposal functions. ([8dd3082](https://github.com/angular/angular/commit/8dd3082))
* **core:** renam AMBIENT_DIRECTIVES and AMBIENT_PIPES into PLATFORM_DIRECTIVES and PLATFORM ([e27665c](https://github.com/angular/angular/commit/e27665c)), closes [#5201](https://github.com/angular/angular/issues/5201)
* **dart:** Support forcing dev mode via enableDevMode in Dart. ([a8d9dbf](https://github.com/angular/angular/commit/a8d9dbf)), closes [#5193](https://github.com/angular/angular/issues/5193)
* **dart/transform:** Add getters, setters, methods to NgDepsModel ([d68955a](https://github.com/angular/angular/commit/d68955a))
* **dart/transform:** Avoid overwriting assets ([ca5e31b](https://github.com/angular/angular/commit/ca5e31b))
* **dart/transform:** Bail early for files with no deferred libraries ([f80321f](https://github.com/angular/angular/commit/f80321f))
* **dart/transform:** Do not declare outputs ([27ead8c](https://github.com/angular/angular/commit/27ead8c))
* **dart/transform:** Do not re-process generated files ([8f91ff8](https://github.com/angular/angular/commit/8f91ff8))
* **dart/transform:** Match runtime semantics for template values ([bdd031a](https://github.com/angular/angular/commit/bdd031a))
* **dart/transform:** Parse `directives` dependencies from the Dart ast ([2604402](https://github.com/angular/angular/commit/2604402))
* **dart/transform:** Simplify dependency imports ([9d0b61b](https://github.com/angular/angular/commit/9d0b61b))
* **facade:** add a way to convert observables into promises ([2c201d3](https://github.com/angular/angular/commit/2c201d3))
* **facade:** add a way to detect if an object is a Promise ([fc50829](https://github.com/angular/angular/commit/fc50829))
* **facade:** add ObservableWrapper.fromPromise ([53bd6e1](https://github.com/angular/angular/commit/53bd6e1))
* **facade:** add support for async validators returning observables ([4439106](https://github.com/angular/angular/commit/4439106)), closes [#5032](https://github.com/angular/angular/issues/5032)
* **forms:** add support for adding async validators via template ([31c12af](https://github.com/angular/angular/commit/31c12af))
* **forms:** add support for async validations ([bb2b961](https://github.com/angular/angular/commit/bb2b961))
* **forms:** add support for Validator ([547e011](https://github.com/angular/angular/commit/547e011))
* **forms:** Export NumberValueAccessor ([25ddd87](https://github.com/angular/angular/commit/25ddd87))
* **forms:** Implement a way to manually set errors on a control ([ed4826b](https://github.com/angular/angular/commit/ed4826b)), closes [#4917](https://github.com/angular/angular/issues/4917)
* **forms:** implements a combinator for composing async validators ([cf449dd](https://github.com/angular/angular/commit/cf449dd))
* **forms:** remove controlsErrors ([7343ef0](https://github.com/angular/angular/commit/7343ef0)), closes [#5102](https://github.com/angular/angular/issues/5102)
* **forms:** support adding validators to ControlGroup via template ([7580628](https://github.com/angular/angular/commit/7580628)), closes [#4954](https://github.com/angular/angular/issues/4954)
* **forms:** update FormBuilder to support async validations ([1c322f1](https://github.com/angular/angular/commit/1c322f1)), closes [#5020](https://github.com/angular/angular/issues/5020)
* **forms:** Use the DefaultValueAccessor for controls with an ng-default-control attribute. ([f21e782](https://github.com/angular/angular/commit/f21e782)), closes [#5076](https://github.com/angular/angular/issues/5076)
* **ngUpgrade:** simple example ([9d0d33f](https://github.com/angular/angular/commit/9d0d33f))
* **parser:** allows users install custom AST transformers ([a43ed79](https://github.com/angular/angular/commit/a43ed79)), closes [#5382](https://github.com/angular/angular/issues/5382)
* **Parser:** associate pipes right to left ([4639f44](https://github.com/angular/angular/commit/4639f44)), closes [#4605](https://github.com/angular/angular/issues/4605) [#4716](https://github.com/angular/angular/issues/4716)
* **renderer:** use a comment instead of an element when stamping out `<template>` elements ([bb9cfe6](https://github.com/angular/angular/commit/bb9cfe6)), closes [#4805](https://github.com/angular/angular/issues/4805) [#5227](https://github.com/angular/angular/issues/5227)
* **router:** add support for APP_BASE_HREF to HashLocationStrategy ([1bec4f6](https://github.com/angular/angular/commit/1bec4f6)), closes [#4935](https://github.com/angular/angular/issues/4935) [#5368](https://github.com/angular/angular/issues/5368) [#5451](https://github.com/angular/angular/issues/5451)
* **router:** add support for route links with no leading slash ([07cdc2f](https://github.com/angular/angular/commit/07cdc2f)), closes [#4623](https://github.com/angular/angular/issues/4623)
* **router:** allow linking to auxiliary routes ([0b1ff2d](https://github.com/angular/angular/commit/0b1ff2d)), closes [#4694](https://github.com/angular/angular/issues/4694)
* **router:** Make RootRouter disposable to allow cleanup of Location subscription. ROUTER_PRO ([2e059dc](https://github.com/angular/angular/commit/2e059dc)), closes [#4915](https://github.com/angular/angular/issues/4915)
* **router:** provide RouteConfig object for AuxRoute ([0ebe283](https://github.com/angular/angular/commit/0ebe283)), closes [#4319](https://github.com/angular/angular/issues/4319)
* move NgZone to Stream/Observable-based callback API ([491e1fd](https://github.com/angular/angular/commit/491e1fd))
* **router:** Support unsubscription from Location by returning the subscription. ([2674eac](https://github.com/angular/angular/commit/2674eac))
* **templates:** introduce quoted expressions to support 3rd-party expression languages ([b6ec238](https://github.com/angular/angular/commit/b6ec238))
* **testing:** use zones to avoid the need for injectAsync ([0c9596a](https://github.com/angular/angular/commit/0c9596a))
* upgrade clang-format to 1.0.32. ([4a1b873](https://github.com/angular/angular/commit/4a1b873))
* **validators:** Add a pending state to AbstractControl ([c9fba3f](https://github.com/angular/angular/commit/c9fba3f))
* **validators:** Allow errors at both the group/array level or their children ([28d88c5](https://github.com/angular/angular/commit/28d88c5))

### Performance Improvements

* **dart/transform:** Restrict visibility/mutability of codegen ([45b33c5](https://github.com/angular/angular/commit/45b33c5)), closes [#5009](https://github.com/angular/angular/issues/5009)


### BREAKING CHANGES

* previously http would only error on network errors to match the fetch
specification. Now status codes less than 200 and greater than 299 will
cause Http's Observable to error.

* Remove if statement support from actions.

* A few private helpers (e.g., platformCommon or applicationCommon) were removed or replaced with other helpers. Look at PLATFORM_COMMON_PROVIDERS, APPLICATION_COMMON_PROVIDERS, BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS to see if they export the providers you need.

* AMBIENT_DIRECTIVES -> PLATFORM_DIRECTIVES
AMBIENT_PIPES -> PLATFORM_PIPES

* Previously, the controlsErrors getter of ControlGroup and ControlArray returned the errors of their direct children. This was confusing because the result did not include the errors of nested children (ControlGroup -> ControlGroup -> Control). Making controlsErrors to include such errors would require inventing some custom serialization format, which applications would have to understand.
Since controlsErrors was just a convenience method, and it was causing confusing, we are removing it. If you want to get the errors of the whole form serialized into a single object, you can manually traverse the form and accumulate the errors. This way you have more control over how the errors are serialized.

* A few private helpers (e.g., platformCommon or applicationCommon) were removed or replaced with other helpers. Look at PLATFORM_COMMON_PROVIDERS, APPLICATION_COMMON_PROVIDERS, BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS to see if they export the providers you need.

* errors format has changed from validators. Now errors from
a control or an array's children are prefixed with 'controls' while errors
from the object itself are left at the root level.
Example:
Given a Control group as follows:
var group = new ControlGroup({
  login: new Control("", required),
  password: new Control("", required),
  passwordConfirm: new Control("", required)
});
Before:
group.errors
{
  login: {required: true},
  password: {required: true},
  passwordConfirm: {required: true},
}
After:
group.errors
{
  controls: {
    login: {required: true},
    password: {required: true},
    passwordConfirm: {required: true},
  }
}

* Before:
`1 + 1 | pipe:a | pipe:b` was parsed as `(1 + 1) | pipe:(a | pipe:b)`
After:
`1 + 1 | pipe:a | pipe:b` is parsed as `((1 + 1) | pipe:a) | pipe:b`

* S:
- deprecates these methods in NgZone: overrideOnTurnStart, overrideOnTurnDone, overrideOnEventDone, overrideOnErrorHandler
- introduces new API in NgZone that may shadow other API used by existing applications.

* S:
- you can no longer use a #foo or a var-foo to apply directive [foo], although
  it didn't work properly anyway.
This commit is fixing breakage caused by the switch to pre-compiler (exact SHA
unknown).

* Before:
ControlGroup.errors and ControlArray.errors returned a reduced value of their children controls' errors.
After:
ControlGroup.errors and ControlArray.errors return the errors of the group and array.
And ControlGroup.controlsErrors and ControlArray.controlsErrors return the reduce value of their children controls' errors.



<a name="2.0.0-alpha.44"></a>
# 2.0.0-alpha.44 (2015-10-15)


### Bug Fixes

* **compiler:** attribute case in IE9 ([b89c5bc](https://github.com/angular/angular/commit/b89c5bc)), closes [#4743](https://github.com/angular/angular/issues/4743)
* **compiler:** explicitly support event bindings also on `<template>` elements ([cec8b58](https://github.com/angular/angular/commit/cec8b58)), closes [#4712](https://github.com/angular/angular/issues/4712)
* **dart/transform:** Handle empty .ng_deps.dart files ([5a50597](https://github.com/angular/angular/commit/5a50597))
* **dart/transform:** Parse directives agnostic of annotation order ([efddc90](https://github.com/angular/angular/commit/efddc90))
* **forms:** emit value changes after errors and status are set ([b716d23](https://github.com/angular/angular/commit/b716d23)), closes [#4714](https://github.com/angular/angular/issues/4714)
* **style_compiler:** don’t resolve absolute urls that start with a `/` during compilation ([a941fb0](https://github.com/angular/angular/commit/a941fb0)), closes [#4763](https://github.com/angular/angular/issues/4763)
* **style_compiler:** don’t touch urls in stylesheets and keep stylesheets with absolute urls in templ ([7dde18b](https://github.com/angular/angular/commit/7dde18b)), closes [#4740](https://github.com/angular/angular/issues/4740)
* **testing:** let DOM adapter dictate XHR implementation for tests ([d7ab5d4](https://github.com/angular/angular/commit/d7ab5d4))
* **transformers:** show nice error message when an invalid uri is found ([6436f96](https://github.com/angular/angular/commit/6436f96)), closes [#4731](https://github.com/angular/angular/issues/4731)

### Features

* **forms:** add input[type=number] value accessor ([65c737f](https://github.com/angular/angular/commit/65c737f)), closes [#4014](https://github.com/angular/angular/issues/4014) [#4761](https://github.com/angular/angular/issues/4761)
* **ngUpgrade:** add support for upgrade/downgrade of injectables ([d896e43](https://github.com/angular/angular/commit/d896e43)), closes [#4766](https://github.com/angular/angular/issues/4766)
* **ngUpgrade:** faster ng2->ng1 adapter by only compiling ng1 once ([053b7a5](https://github.com/angular/angular/commit/053b7a5))
* **query:** add filter and reduce to QueryList ([bfbf18d](https://github.com/angular/angular/commit/bfbf18d)), closes [#4710](https://github.com/angular/angular/issues/4710)



<a name="2.0.0-alpha.42"></a>
# 2.0.0-alpha.42 (2015-10-13)


### Bug Fixes

* **build:** Fix serve.js.dev to build bundles ([3b03660](https://github.com/angular/angular/commit/3b03660)), closes [#4700](https://github.com/angular/angular/issues/4700)
* **docs:** minor @link fixes. ([3a801c1](https://github.com/angular/angular/commit/3a801c1)), closes [#4696](https://github.com/angular/angular/issues/4696)
* **publish:** emit type declarations with CJS build ([57649d1](https://github.com/angular/angular/commit/57649d1)), closes [#4706](https://github.com/angular/angular/issues/4706) [#4708](https://github.com/angular/angular/issues/4708)
* **test:** command compiler attr merge test in IE ([e15e242](https://github.com/angular/angular/commit/e15e242))

### Features

* **build:** add tasks to watch and recompile js and dart ([50e922f](https://github.com/angular/angular/commit/50e922f))
* **forms:** add minlength and maxlength validators ([e82a35d](https://github.com/angular/angular/commit/e82a35d)), closes [#4705](https://github.com/angular/angular/issues/4705)



<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2015-10-13)


### Bug Fixes

* **compiler:** merge `class` and `style` attributes from the element with the host attributes ([eacc8e3](https://github.com/angular/angular/commit/eacc8e3)), closes [#4583](https://github.com/angular/angular/issues/4583) [#4680](https://github.com/angular/angular/issues/4680)
* **compiler:** shadow CSS @import test in some browsers ([0def28e](https://github.com/angular/angular/commit/0def28e)), closes [#4629](https://github.com/angular/angular/issues/4629)
* **docs:** Updated docs for default router location strategy ([075011f](https://github.com/angular/angular/commit/075011f)), closes [#4517](https://github.com/angular/angular/issues/4517)
* **router:** properly read and serialize query params ([8bc40d3](https://github.com/angular/angular/commit/8bc40d3)), closes [#3957](https://github.com/angular/angular/issues/3957) [#4225](https://github.com/angular/angular/issues/4225) [#3784](https://github.com/angular/angular/issues/3784)
* **test_lib:** don't mock out XHR via MockXHR by default in tests ([6abed8d](https://github.com/angular/angular/commit/6abed8d)), closes [#4539](https://github.com/angular/angular/issues/4539) [#4682](https://github.com/angular/angular/issues/4682)
* **typings:** add more missing typings. ([aab0c57](https://github.com/angular/angular/commit/aab0c57)), closes [#4636](https://github.com/angular/angular/issues/4636)
* **typings:** fix typings which were previously unchecked ([c178ad4](https://github.com/angular/angular/commit/c178ad4)), closes [#4625](https://github.com/angular/angular/issues/4625)
* **typings:** missing types in ListWrapper typings ([597f79e](https://github.com/angular/angular/commit/597f79e))

### Features

* **core:** desugar [()] to [prop] and (prop-change) ([7c6130c](https://github.com/angular/angular/commit/7c6130c)), closes [#4658](https://github.com/angular/angular/issues/4658)
* **di:** change the params of Provider and provide to start with "use" ([1aeafd3](https://github.com/angular/angular/commit/1aeafd3)), closes [#4684](https://github.com/angular/angular/issues/4684)
* **di:** rename Binding into Provider ([1eb0162](https://github.com/angular/angular/commit/1eb0162)), closes [#4416](https://github.com/angular/angular/issues/4416) [#4654](https://github.com/angular/angular/issues/4654)
* **facade:** add fromISODate method ([440fd11](https://github.com/angular/angular/commit/440fd11))
* **ngFor:** support a custom template ([6207b1a](https://github.com/angular/angular/commit/6207b1a)), closes [#4637](https://github.com/angular/angular/issues/4637)
* **ngUpgrade:** support for content project from ng1->ng2 ([cd90e6e](https://github.com/angular/angular/commit/cd90e6e))
* **ngUpgrade:** transclude content from ng2->ng1 ([19c1bd7](https://github.com/angular/angular/commit/19c1bd7)), closes [#4640](https://github.com/angular/angular/issues/4640)
* **test:** Add an external version of the test library ([a1fa2e4](https://github.com/angular/angular/commit/a1fa2e4))


### BREAKING CHANGES

* Before
```
<cmp [(prop)]="field"> was desugared to <cmp [prop]="field" (prop)="field=$event">
```
After
```
<cmp [(prop)]="field"> is desugared to <cmp [prop]="field" (prop-change)="field=$event">
```



