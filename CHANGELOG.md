<a name="7.1.0-rc.0"></a>
# [7.1.0-rc.0](https://github.com/angular/angular/compare/7.1.0-beta.2...7.1.0-rc.0) (2018-11-14)


### Bug Fixes

* **compiler-cli:** add missing tslib dependency ([#27063](https://github.com/angular/angular/issues/27063)) ([c31e78f](https://github.com/angular/angular/commit/c31e78f))
* **compiler-cli:** only pass canonical genfile paths to compiler host ([#27062](https://github.com/angular/angular/issues/27062)) ([0ada23a](https://github.com/angular/angular/commit/0ada23a))
* **router:** add `relativeLinkResolution` to `recognize` operator ([#26990](https://github.com/angular/angular/issues/26990)) ([a752971](https://github.com/angular/angular/commit/a752971)), closes [#26983](https://github.com/angular/angular/issues/26983)


### Features

* **router:** add pathParamsChange mode for runGuardsAndResolvers ([#26861](https://github.com/angular/angular/issues/26861)) ([bf6ac6c](https://github.com/angular/angular/commit/bf6ac6c)), closes [#18253](https://github.com/angular/angular/issues/18253)



<a name="7.0.4"></a>
## [7.0.4](https://github.com/angular/angular/compare/7.0.3...7.0.4) (2018-11-14)


### Bug Fixes

* **compiler-cli:** add missing tslib dependency ([#27063](https://github.com/angular/angular/issues/27063)) ([4348c47](https://github.com/angular/angular/commit/4348c47))
* **compiler-cli:** only pass canonical genfile paths to compiler host ([#27062](https://github.com/angular/angular/issues/27062)) ([188e9ce](https://github.com/angular/angular/commit/188e9ce))
* **router:** add `relativeLinkResolution` to `recognize` operator ([#26990](https://github.com/angular/angular/issues/26990)) ([d304427](https://github.com/angular/angular/commit/d304427)), closes [#26983](https://github.com/angular/angular/issues/26983)



<a name="7.1.0-beta.2"></a>
# [7.1.0-beta.2](https://github.com/angular/angular/compare/7.1.0-beta.1...7.1.0-beta.2) (2018-11-07)


### Bug Fixes

* **bazel:** unknown replay compiler error in windows ([#26711](https://github.com/angular/angular/issues/26711)) ([aed95fd](https://github.com/angular/angular/commit/aed95fd))
* **core:** ensure that `ɵdefineNgModule` is available in flat-file formats ([#26403](https://github.com/angular/angular/issues/26403)) ([a64859b](https://github.com/angular/angular/commit/a64859b))
* **router:** remove type bludgeoning of context and outlet when running CanDeactivate ([#26496](https://github.com/angular/angular/issues/26496)) ([496372d](https://github.com/angular/angular/commit/496372d)), closes [#18253](https://github.com/angular/angular/issues/18253)
* **service-worker:** add typing to public api guard and fix lint errors ([#25860](https://github.com/angular/angular/issues/25860)) ([1061875](https://github.com/angular/angular/commit/1061875))
* **upgrade:** improve downgrading-related error messages ([#26217](https://github.com/angular/angular/issues/26217)) ([7dbc103](https://github.com/angular/angular/commit/7dbc103))
* **upgrade:** make typings compatible with older AngularJS typings ([#26880](https://github.com/angular/angular/issues/26880)) ([64647af](https://github.com/angular/angular/commit/64647af)), closes [#26420](https://github.com/angular/angular/issues/26420)


### Features

* **compiler:** ability to mark an InvokeFunctionExpr as pure ([#26860](https://github.com/angular/angular/issues/26860)) ([4dfa71f](https://github.com/angular/angular/commit/4dfa71f))
* **forms:** add updateOn option to FormBuilder ([#24599](https://github.com/angular/angular/issues/24599)) ([e9e804f](https://github.com/angular/angular/commit/e9e804f))
* **router:** allow guards to return UrlTree as well as boolean ([#26521](https://github.com/angular/angular/issues/26521)) ([081f95c](https://github.com/angular/angular/commit/081f95c))
* **router:** allow redirect from guards by returning UrlTree ([#26521](https://github.com/angular/angular/issues/26521)) ([152ca66](https://github.com/angular/angular/commit/152ca66))
* **router:** guard returning UrlTree cancels current navigation and redirects ([#26521](https://github.com/angular/angular/issues/26521)) ([4e9f2e5](https://github.com/angular/angular/commit/4e9f2e5)), closes [#24618](https://github.com/angular/angular/issues/24618)
* **service-worker:** add typing for messagesClicked in SwPush service ([#25860](https://github.com/angular/angular/issues/25860)) ([c78c221](https://github.com/angular/angular/commit/c78c221))
* **service-worker:** close notifications and focus window on click ([#25860](https://github.com/angular/angular/issues/25860)) ([f5d5a3d](https://github.com/angular/angular/commit/f5d5a3d))
* **service-worker:** handle 'notificationclick' events ([#25860](https://github.com/angular/angular/issues/25860)) ([cf6ea28](https://github.com/angular/angular/commit/cf6ea28)), closes [#20956](https://github.com/angular/angular/issues/20956) [#22311](https://github.com/angular/angular/issues/22311)
* **upgrade:** support downgrading multiple modules ([#26217](https://github.com/angular/angular/issues/26217)) ([93837e9](https://github.com/angular/angular/commit/93837e9)), closes [#26062](https://github.com/angular/angular/issues/26062)



<a name="7.0.3"></a>
## [7.0.3](https://github.com/angular/angular/compare/7.0.2...7.0.3) (2018-11-07)


### Bug Fixes

* **bazel:** unknown replay compiler error in windows ([#26711](https://github.com/angular/angular/issues/26711)) ([4d532df](https://github.com/angular/angular/commit/4d532df))
* **router:** remove type bludgeoning of context and outlet when running CanDeactivate ([#26496](https://github.com/angular/angular/issues/26496)) ([dc05385](https://github.com/angular/angular/commit/dc05385)), closes [#18253](https://github.com/angular/angular/issues/18253)
* **upgrade:** make typings compatible with older AngularJS typings ([#26880](https://github.com/angular/angular/issues/26880)) ([315d95c](https://github.com/angular/angular/commit/315d95c)), closes [#26420](https://github.com/angular/angular/issues/26420)



<a name="7.1.0-beta.1"></a>
# [7.1.0-beta.1](https://github.com/angular/angular/compare/7.1.0-beta.0...7.1.0-beta.1) (2018-10-31)


### Bug Fixes

* **compiler:** generate inputs with aliases properly ([#26774](https://github.com/angular/angular/issues/26774)) ([19fcfc3](https://github.com/angular/angular/commit/19fcfc3))
* **compiler:** generate relative paths only in summary file errors ([#26759](https://github.com/angular/angular/issues/26759)) ([56f44be](https://github.com/angular/angular/commit/56f44be))
* **core:** ignore comment nodes under unsafe elements ([#25879](https://github.com/angular/angular/issues/25879)) ([d5cbcef](https://github.com/angular/angular/commit/d5cbcef))
* **core:** Remove static dependency from [@angular](https://github.com/angular)/core to [@angular](https://github.com/angular)/compiler ([#26734](https://github.com/angular/angular/issues/26734)) ([d042c4a](https://github.com/angular/angular/commit/d042c4a))
* **core:** support computed base class in metadata inheritance ([#24014](https://github.com/angular/angular/issues/24014)) ([95743e3](https://github.com/angular/angular/commit/95743e3))



<a name="7.0.2"></a>
## [7.0.2](https://github.com/angular/angular/compare/7.0.1...7.0.2) (2018-10-31)


### Bug Fixes

* **compiler:** generate relative paths only in summary file errors ([#26759](https://github.com/angular/angular/issues/26759)) ([c01f340](https://github.com/angular/angular/commit/c01f340))
* **core:** Remove static dependency from [@angular](https://github.com/angular)/core to [@angular](https://github.com/angular)/compiler ([#26734](https://github.com/angular/angular/issues/26734)) ([#26879](https://github.com/angular/angular/issues/26879)) ([257ac83](https://github.com/angular/angular/commit/257ac83))
* **core:** support computed base class in metadata inheritance ([#24014](https://github.com/angular/angular/issues/24014)) ([b3c6409](https://github.com/angular/angular/commit/b3c6409))



<a name="7.1.0-beta.0"></a>
# [7.1.0-beta.0](https://github.com/angular/angular/compare/7.0.0-rc.1...7.1.0-beta.0) (2018-10-24)


### Bug Fixes
* **core:** allow null value for renderer setElement(…) ([#17065](https://github.com/angular/angular/issues/17065)) ([ff15043](https://github.com/angular/angular/commit/ff15043)), closes [#13686](https://github.com/angular/angular/issues/13686)
* **router:** fix regression where navigateByUrl promise didn't resolve on CanLoad failure ([#26455](https://github.com/angular/angular/issues/26455)) ([1c9b065](https://github.com/angular/angular/commit/1c9b065)), closes [#26284](https://github.com/angular/angular/issues/26284)
* **service-worker:** clean up caches from old SW versions ([#26319](https://github.com/angular/angular/issues/26319)) ([2326b9c](https://github.com/angular/angular/commit/2326b9c))
* **upgrade:** properly destroy upgraded component elements and descendants ([#26209](https://github.com/angular/angular/issues/26209)) ([071934e](https://github.com/angular/angular/commit/071934e)), closes [#26208](https://github.com/angular/angular/issues/26208)


### Features

* **router:** add prioritizedGuardValue operator optimization and allowing UrlTree return from guard ([#26478](https://github.com/angular/angular/issues/26478)) ([fdfedce](https://github.com/angular/angular/commit/fdfedce))



<a name="7.0.1"></a>
## [7.0.1](https://github.com/angular/angular/compare/7.0.0...7.0.1) (2018-10-24)




<a name="7.0.0"></a>
# [7.0.0](https://github.com/angular/angular/compare/7.0.0-rc.1...7.0.0) (2018-10-18)


### Release Highlights & Update instructions

To learn about the release highlights and our new CLI-powered update workflow for your projects please check out the [v7 release announcement](https://blog.angular.io/version-7-of-angular-cli-prompts-virtual-scroll-drag-and-drop-and-more-c594e22e7b8c).


### Dependency updates

* @angular/core now depends on
  * TypeScript 3.1
  * RxJS 6.3
* @angular/platform-server now depends on Domino 2.1


### Features

* **core:** add DoBootstrap interface. ([#24558](https://github.com/angular/angular/issues/24558)) ([732026c](https://github.com/angular/angular/commit/732026c)), closes [#24557](https://github.com/angular/angular/issues/24557)
* **compiler:** add "original" placeholder value on extracted XMB ([#25079](https://github.com/angular/angular/issues/25079)) ([e99d860](https://github.com/angular/angular/commit/e99d860))
* **compiler-cli:** add support to extend `angularCompilerOptions` ([#22717](https://github.com/angular/angular/issues/22717)) ([d7e5bbf](https://github.com/angular/angular/commit/d7e5bbf)), closes [#22684](https://github.com/angular/angular/issues/22684)
* **bazel:** add additional parameters to `ts_api_guardian_test` def ([#25694](https://github.com/angular/angular/issues/25694)) ([2a21ca0](https://github.com/angular/angular/commit/2a21ca0))
* **elements:** enable Shadow DOM v1 and slots ([#24861](https://github.com/angular/angular/issues/24861)) ([c9844a2](https://github.com/angular/angular/commit/c9844a2))
* **platform-server:** update domino to v2.1.0 ([#25564](https://github.com/angular/angular/issues/25564)) ([3fb0da2](https://github.com/angular/angular/commit/3fb0da2))
* **router:** warn if navigation triggered outside Angular zone ([#24959](https://github.com/angular/angular/issues/24959)) ([010e35d](https://github.com/angular/angular/commit/010e35d)), closes [#15770](https://github.com/angular/angular/issues/15770) [#15946](https://github.com/angular/angular/issues/15946) [#24728](https://github.com/angular/angular/issues/24728)
* **router:** add UrlSegment[] to CanLoad interface ([#13127](https://github.com/angular/angular/issues/13127)) ([07d8d39](https://github.com/angular/angular/commit/07d8d39)), closes [#12411](https://github.com/angular/angular/issues/12411)



### Bug Fixes

* add mappings for ngfactory & ngsummary files to their module names in aot summary resolver ([#25335](https://github.com/angular/angular/issues/25335)) ([02e201a](https://github.com/angular/angular/commit/02e201a))
* **bazel:** Cache fileNameToModuleName lookups ([#25731](https://github.com/angular/angular/issues/25731)) ([f394ba0](https://github.com/angular/angular/commit/f394ba0))
* **bazel:** allow compile_strategy to be (privately) imported ([#25080](https://github.com/angular/angular/issues/25080)) ([0d1d589](https://github.com/angular/angular/commit/0d1d589))
* **bazel:** correct type concatenated to devmode_js ([#25467](https://github.com/angular/angular/issues/25467)) ([fb2c524](https://github.com/angular/angular/commit/fb2c524))
* **bazel:** move bazel managed runtime deps for downstream usage ([#25690](https://github.com/angular/angular/issues/25690)) ([6ed7993](https://github.com/angular/angular/commit/6ed7993))
* **bazel:** only lookup amd module-name tags in .d.ts files ([#25710](https://github.com/angular/angular/issues/25710)) ([42072c4](https://github.com/angular/angular/commit/42072c4))
* **bazel:** protractor rule should include *.e2e-spec.js ([#25701](https://github.com/angular/angular/issues/25701)) ([3809e0f](https://github.com/angular/angular/commit/3809e0f))
* **bazel:** specify the package and lock files using the workspace ([#25694](https://github.com/angular/angular/issues/25694)) ([ddc1335](https://github.com/angular/angular/commit/ddc1335))
* **benchpress:** Use performance.mark() instead of console.time() ([#24114](https://github.com/angular/angular/issues/24114)) ([06d0400](https://github.com/angular/angular/commit/06d0400))
* **common:** register locale data for all equivalent closure locales ([#25867](https://github.com/angular/angular/issues/25867)) ([d83f9d4](https://github.com/angular/angular/commit/d83f9d4))
* **compiler-cli:** correct realPath to realpath. ([#25023](https://github.com/angular/angular/issues/25023)) ([01e6dab](https://github.com/angular/angular/commit/01e6dab))
* **compiler-cli:** use the oldProgram option in watch mode ([#21364](https://github.com/angular/angular/issues/21364)) ([c6e5b97](https://github.com/angular/angular/commit/c6e5b97)), closes [#21361](https://github.com/angular/angular/issues/21361)
* **compiler:** Fix look up of entryComponents in AOT Summaries ([#24892](https://github.com/angular/angular/issues/24892)) ([00d3666](https://github.com/angular/angular/commit/00d3666))
* **compiler:** add hostVars and support pure functions in host bindings ([#25626](https://github.com/angular/angular/issues/25626)) ([b424b31](https://github.com/angular/angular/commit/b424b31))
* **compiler:** update compiler to flatten nested template fns ([#24943](https://github.com/angular/angular/issues/24943)) ([fe14f18](https://github.com/angular/angular/commit/fe14f18))
* **compiler:** update compiler to generate new slot allocations ([#25607](https://github.com/angular/angular/issues/25607)) ([27e2039](https://github.com/angular/angular/commit/27e2039))
* **core:** In Testability.whenStable update callback, pass more complete ([#25010](https://github.com/angular/angular/issues/25010)) ([16c03c0](https://github.com/angular/angular/commit/16c03c0))
* **core:** add missing `peerDependency ` to `[@angular](https://github.com/angular)/compiler` ([#26033](https://github.com/angular/angular/issues/26033)) ([549de1e](https://github.com/angular/angular/commit/549de1e)), closes [/github.com/angular/angular/commit/919f42fea1df4b9e38b7d688aef5f2de668e9d3e#diff-58563046c4439699f2e6a89187099a54](https://github.com//github.com/angular/angular/commit/919f42fea1df4b9e38b7d688aef5f2de668e9d3e/issues/diff-58563046c4439699f2e6a89187099a54)
* **core:** allow null value for renderer setElement(…) ([#17065](https://github.com/angular/angular/issues/17065)) ([ff15043](https://github.com/angular/angular/commit/ff15043)), closes [#13686](https://github.com/angular/angular/issues/13686)
* **core:** do not clear element content when using shadow dom ([#24861](https://github.com/angular/angular/issues/24861)) ([6e828bb](https://github.com/angular/angular/commit/6e828bb))
* **core:** size regression with closure compiler ([#25531](https://github.com/angular/angular/issues/25531)) ([1f59f2f](https://github.com/angular/angular/commit/1f59f2f))
* **core:** throw error message when @Output not initialized ([#19116](https://github.com/angular/angular/issues/19116)) ([adf510f](https://github.com/angular/angular/commit/adf510f)), closes [#3664](https://github.com/angular/angular/issues/3664)
* **elements:** add compiler dependency ([#24861](https://github.com/angular/angular/issues/24861)) ([6143da6](https://github.com/angular/angular/commit/6143da6))
* **elements:** add compiler to integration ([#24861](https://github.com/angular/angular/issues/24861)) ([a080ffc](https://github.com/angular/angular/commit/a080ffc))
* **elements:** strict null checks ([#24861](https://github.com/angular/angular/issues/24861)) ([a8210d0](https://github.com/angular/angular/commit/a8210d0))
* **router:** fix regression where navigateByUrl promise didn't resolve on CanLoad failure ([#26455](https://github.com/angular/angular/issues/26455)) ([1c9b065](https://github.com/angular/angular/commit/1c9b065)), closes [#26284](https://github.com/angular/angular/issues/26284)
* **router:** mount correct component if router outlet was not instantiated and if using a route reuse strategy ([#25313](https://github.com/angular/angular/issues/25313)) ([#25314](https://github.com/angular/angular/issues/25314)) ([8dc2b11](https://github.com/angular/angular/commit/8dc2b11))
* **router:** take base uri into account in `setUpLocationSync()` ([#20244](https://github.com/angular/angular/issues/20244)) ([ba1e25f](https://github.com/angular/angular/commit/ba1e25f)), closes [#20061](https://github.com/angular/angular/issues/20061)
* **service-worker:** clean up caches from old SW versions ([#26319](https://github.com/angular/angular/issues/26319)) ([00b5c7b](https://github.com/angular/angular/commit/00b5c7b))
* **service-worker:** do not blow up when caches are unwritable ([#26042](https://github.com/angular/angular/issues/26042)) ([2bd767c](https://github.com/angular/angular/commit/2bd767c))
* **upgrade:** properly destroy upgraded component elements and descendants ([#26209](https://github.com/angular/angular/issues/26209)) ([071934e](https://github.com/angular/angular/commit/071934e)), closes [#26208](https://github.com/angular/angular/issues/26208)
* **upgrade:** trigger `$destroy` event on upgraded component element ([#25357](https://github.com/angular/angular/issues/25357)) ([2a672a9](https://github.com/angular/angular/commit/2a672a9)), closes [#25334](https://github.com/angular/angular/issues/25334)




<a name="6.1.10"></a>
## [6.1.10](https://github.com/angular/angular/compare/6.1.9...6.1.10) (2018-10-10)


### Bug Fixes

* **platform-browser:** fix [#22155](https://github.com/angular/angular/issues/22155), destroy hammer manager when `HammerInstance.off()` is run ([#22156](https://github.com/angular/angular/issues/22156)) ([3b4d9dc](https://github.com/angular/angular/commit/3b4d9dc))
* **upgrade:** properly destroy upgraded component elements and descendants ([#26209](https://github.com/angular/angular/issues/26209)) ([623adbb](https://github.com/angular/angular/commit/623adbb)), closes [#26208](https://github.com/angular/angular/issues/26208)




<a name="6.1.9"></a>
## [6.1.9](https://github.com/angular/angular/compare/6.1.8...6.1.9) (2018-09-26)




<a name="6.1.7"></a>
## [6.1.7](https://github.com/angular/angular/compare/6.1.6...6.1.7) (2018-09-06)


### Bug Fixes

* **bazel:** protractor rule should include *.e2e-spec.js ([#25701](https://github.com/angular/angular/issues/25701)) ([ed6b68b](https://github.com/angular/angular/commit/ed6b68b))
* **core:** size regression with closure compiler ([#25531](https://github.com/angular/angular/issues/25531)) ([ebcf762](https://github.com/angular/angular/commit/ebcf762))
* **docs-infra:** show "suggest edits" only for /guide and /tutorial dirs ([#24378](https://github.com/angular/angular/issues/24378)) ([66b7870](https://github.com/angular/angular/commit/66b7870))
* **upgrade:** trigger `$destroy` event on upgraded component element ([#25357](https://github.com/angular/angular/issues/25357)) ([82e0676](https://github.com/angular/angular/commit/82e0676)), closes [#25334](https://github.com/angular/angular/issues/25334)
* **router:** warn if navigation triggered outside Angular zone ([#24959](https://github.com/angular/angular/issues/24959)) ([23a96dc](https://github.com/angular/angular/commit/23a96dc)), closes [#15770](https://github.com/angular/angular/issues/15770) [#15946](https://github.com/angular/angular/issues/15946) [#24728](https://github.com/angular/angular/issues/24728)



<a name="6.1.6"></a>
## [6.1.6](https://github.com/angular/angular/compare/6.1.5...6.1.6) (2018-08-29)


### Bug Fixes

* **bazel:** Cache fileNameToModuleName lookups ([#25731](https://github.com/angular/angular/issues/25731)) ([3e690e0](https://github.com/angular/angular/commit/3e690e0))
* **bazel:** only lookup amd module-name tags in .d.ts files ([#25710](https://github.com/angular/angular/issues/25710)) ([7aff364](https://github.com/angular/angular/commit/7aff364))


Note: the 6.1.5 release on npm accidentally glitched-out midway, so we cut 6.1.6 instead. sorry! :-)



<a name="6.1.4"></a>
## [6.1.4](https://github.com/angular/angular/compare/6.1.3...6.1.4) (2018-08-22)


### Bug Fixes

* **router:** default scroll position restoration to disabled ([#25586](https://github.com/angular/angular/issues/25586)) ([7e61645](https://github.com/angular/angular/commit/7e61645)), closes [#25145](https://github.com/angular/angular/issues/25145)



<a name="6.1.3"></a>
## [6.1.3](https://github.com/angular/angular/compare/6.1.2...6.1.3) (2018-08-15)


### Bug Fixes

* **service-worker:** `Cache-Control: no-cache` on assets breaks service worker ([#25408](https://github.com/angular/angular/issues/25408)) ([1319ff4](https://github.com/angular/angular/commit/1319ff4)), closes [#25442](https://github.com/angular/angular/issues/25442)



<a name="6.1.2"></a>
## [6.1.2](https://github.com/angular/angular/compare/6.1.1...6.1.2) (2018-08-08)


### Bug Fixes

* **router:** take base uri into account in `setUpLocationSync()` ([#20244](https://github.com/angular/angular/issues/20244)) ([ae9b4e6](https://github.com/angular/angular/commit/ae9b4e6)), closes [#20061](https://github.com/angular/angular/issues/20061)
* add mappings for ngfactory & ngsummary files to their module names in aot summary resolver ([#25335](https://github.com/angular/angular/issues/25335)) ([054fbbe](https://github.com/angular/angular/commit/054fbbe))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/angular/angular/compare/6.1.0...6.1.1) (2018-08-02)

* **compiler-cli:** correct tsickle dependency version to fix typescript 2.9 compatibility ([fec29fa](https://github.com/angular/angular/commit/317c7087c56b72aa74cd6d6a8f719e6e7fec29fa))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/angular/angular/compare/6.0.0-rc.5...6.1.0) (2018-07-25)

### Bug Fixes

* **animations:** always render end-state styles for orphaned DOM nodes ([#24236](https://github.com/angular/angular/issues/24236)) ([dc4a3d0](https://github.com/angular/angular/commit/dc4a3d0))
* **animations:** set animations styles properly on platform-server ([#24624](https://github.com/angular/angular/issues/24624)) ([0b356d4](https://github.com/angular/angular/commit/0b356d4))
* **animations:** do not throw errors when a destroyed component is animated ([#23836](https://github.com/angular/angular/issues/23836)) ([d2a8687](https://github.com/angular/angular/commit/d2a8687))
* **animations:** Fix browser detection logic ([#24188](https://github.com/angular/angular/issues/24188)) ([b492b9e](https://github.com/angular/angular/commit/b492b9e))
* **animations:** properly clean up queried element styles in safari/edge ([#23633](https://github.com/angular/angular/issues/23633)) ([da9ff25](https://github.com/angular/angular/commit/da9ff25))
* **animations:** retain state styling for nodes that are moved around ([#23534](https://github.com/angular/angular/issues/23534)) ([65211f4](https://github.com/angular/angular/commit/65211f4))
* **animations:** retain trigger-state for nodes that are moved around ([#24238](https://github.com/angular/angular/issues/24238)) ([8db928d](https://github.com/angular/angular/commit/8db928d))
* **bazel:** Allow ng_module to depend on targets w no deps ([#24446](https://github.com/angular/angular/issues/24446)) ([282d351](https://github.com/angular/angular/commit/282d351))
* **benchpress:** Fix promise chain in chrome_driver_extension. ([#23458](https://github.com/angular/angular/issues/23458)) ([d4b6c41](https://github.com/angular/angular/commit/d4b6c41))
* **common:** do not round factional seconds ([#24831](https://github.com/angular/angular/issues/24831)) ([a527c69](https://github.com/angular/angular/commit/a527c69)), closes [#24384](https://github.com/angular/angular/issues/24384)
* **common:** format fractional seconds ([#24844](https://github.com/angular/angular/issues/24844)) ([0b4d85e](https://github.com/angular/angular/commit/0b4d85e)), closes [#24831](https://github.com/angular/angular/issues/24831)
* **common:** properly update collection reference in NgForOf ([#24684](https://github.com/angular/angular/issues/24684)) ([ff84c5c](https://github.com/angular/angular/commit/ff84c5c)), closes [#24155](https://github.com/angular/angular/issues/24155)
* **common:** use correct currency format for locale de-AT ([#24658](https://github.com/angular/angular/issues/24658)) ([dcabb05](https://github.com/angular/angular/commit/dcabb05)), closes [#24609](https://github.com/angular/angular/issues/24609)
* **common:** use correct ICU plural for locale mk ([#24659](https://github.com/angular/angular/issues/24659)) ([64a8584](https://github.com/angular/angular/commit/64a8584))
* **compiler:** fix a few non-tree-shakeable code patterns ([#24677](https://github.com/angular/angular/issues/24677)) ([50d4a4f](https://github.com/angular/angular/commit/50d4a4f))
* **compiler:** i18n_extractor now outputs the correct source file name ([#24885](https://github.com/angular/angular/issues/24885)) ([c8ad965](https://github.com/angular/angular/commit/c8ad965)), closes [#24884](https://github.com/angular/angular/issues/24884)
* **compiler:** support `.` in import statements. ([#20634](https://github.com/angular/angular/issues/20634)) ([d8f7b29](https://github.com/angular/angular/commit/d8f7b29)), closes [#20363](https://github.com/angular/angular/issues/20363)
* **compiler:** avoid a crash in ngc-wrapped. ([#23468](https://github.com/angular/angular/issues/23468)) ([e1c4930](https://github.com/angular/angular/commit/e1c4930))
* **compiler:** generate constant array for i18n attributes ([#23837](https://github.com/angular/angular/issues/23837)) ([cfde36d](https://github.com/angular/angular/commit/cfde36d))
* **compiler:** generate core-compliant hostBindings property ([#24087](https://github.com/angular/angular/issues/24087)) ([01b5acd](https://github.com/angular/angular/commit/01b5acd)), closes [#24013](https://github.com/angular/angular/issues/24013)
* **compiler:** handle undefined annotation metadata ([#23349](https://github.com/angular/angular/issues/23349)) ([ca776c5](https://github.com/angular/angular/commit/ca776c5))
* **compiler-cli:** Use typescript to resolve modules for metadata ([#22856](https://github.com/angular/angular/issues/22856)) ([0d5f2d3](https://github.com/angular/angular/commit/0d5f2d3))
* **compiler-cli:** don't rely on incompatible TS method ([#23550](https://github.com/angular/angular/issues/23550)) ([b1f040f](https://github.com/angular/angular/commit/b1f040f))
* **core:** stop reusing provider definitions across NgModuleRef instances ([#25022](https://github.com/angular/angular/issues/25022)) ([6b859da](https://github.com/angular/angular/commit/6b859da)), closes [#25018](https://github.com/angular/angular/issues/25018)
* **core:** mark NgModule as not the root if APP_ROOT is set to false ([#24814](https://github.com/angular/angular/issues/24814)) ([1089261](https://github.com/angular/angular/commit/1089261))
* **core:** use addCustomEqualityTester instead of overriding toEqual ([#22983](https://github.com/angular/angular/issues/22983)) ([0922228](https://github.com/angular/angular/commit/0922228)), closes [#22939](https://github.com/angular/angular/issues/22939)
* **core:** Injector correctly honors the @Self flag ([#24520](https://github.com/angular/angular/issues/24520)) ([ccbda9d](https://github.com/angular/angular/commit/ccbda9d))
* **core:** avoid eager providers re-initialization ([#23559](https://github.com/angular/angular/issues/23559)) ([0c6dc45](https://github.com/angular/angular/commit/0c6dc45))
* **core:** call ngOnDestroy on all services that have it ([#23755](https://github.com/angular/angular/issues/23755)) ([fc03427](https://github.com/angular/angular/commit/fc03427)), closes [#22466](https://github.com/angular/angular/issues/22466) [#22240](https://github.com/angular/angular/issues/22240) [#14818](https://github.com/angular/angular/issues/14818)
* **docs-infra:** fix table header layout in API pages ([#24919](https://github.com/angular/angular/issues/24919)) ([3cd9645](https://github.com/angular/angular/commit/3cd9645))
* **elements:** always check to create strategy ([#23825](https://github.com/angular/angular/issues/23825)) ([b1cda36](https://github.com/angular/angular/commit/b1cda36))
* **elements:** prevent closure renaming of platform properties ([#23843](https://github.com/angular/angular/issues/23843)) ([d4b8b24](https://github.com/angular/angular/commit/d4b8b24))
* **forms:** properly handle special properties in FormGroup.get ([#22249](https://github.com/angular/angular/issues/22249)) ([9367e91](https://github.com/angular/angular/commit/9367e91)), closes [#17195](https://github.com/angular/angular/issues/17195)
* **language-service:** do not overwrite native `Reflect` ([#24299](https://github.com/angular/angular/issues/24299)) ([6881404](https://github.com/angular/angular/commit/6881404)), closes [#21420](https://github.com/angular/angular/issues/21420)
* **platform-browser:** add missing deps for HammerGesturesPlugin ([#24682](https://github.com/angular/angular/issues/24682)) ([13d60ea](https://github.com/angular/angular/commit/13d60ea))
* **platform-browser:** mark Meta and Title services as tree shakable providers ([#24815](https://github.com/angular/angular/issues/24815)) ([197387d](https://github.com/angular/angular/commit/197387d))
* **platform-browser:** workaround wrong import path generated by ngc for DOCUMENT ([#24830](https://github.com/angular/angular/issues/24830)) ([7d27ecc](https://github.com/angular/angular/commit/7d27ecc))
* **platform-server:** avoid clash between server and client style encapsulation attributes ([#24158](https://github.com/angular/angular/issues/24158)) ([b96a3c8](https://github.com/angular/angular/commit/b96a3c8))
* **platform-server:** avoid dependency cycle when using http interceptor ([#24229](https://github.com/angular/angular/issues/24229)) ([60aa943](https://github.com/angular/angular/commit/60aa943)), closes [#23023](https://github.com/angular/angular/issues/23023)
* **platform-server:** don't reflect innerHTML property to attribute ([#24213](https://github.com/angular/angular/issues/24213)) ([6a663a4](https://github.com/angular/angular/commit/6a663a4)), closes [#19278](https://github.com/angular/angular/issues/19278)
* **platform-server:** provide Domino DOM types globally ([#24116](https://github.com/angular/angular/issues/24116)) ([c73196e](https://github.com/angular/angular/commit/c73196e)), closes [#23280](https://github.com/angular/angular/issues/23280) [#23133](https://github.com/angular/angular/issues/23133)
* **router:** Fix _lastPathIndex in deeply nested empty paths ([#22394](https://github.com/angular/angular/issues/22394)) ([968f153](https://github.com/angular/angular/commit/968f153))
* **router:** add ability to recover from malformed url ([#23283](https://github.com/angular/angular/issues/23283)) ([86d254d](https://github.com/angular/angular/commit/86d254d)), closes [#21468](https://github.com/angular/angular/issues/21468)
* **router:** fix lazy loading of aux routes ([#23459](https://github.com/angular/angular/issues/23459)) ([5731d07](https://github.com/angular/angular/commit/5731d07)), closes [#10981](https://github.com/angular/angular/issues/10981)
* **router:** avoid freezing queryParams in-place ([#22663](https://github.com/angular/angular/issues/22663)) ([89f64e5](https://github.com/angular/angular/commit/89f64e5)), closes [#22617](https://github.com/angular/angular/issues/22617)
* **router:** cache route handle if found ([#22475](https://github.com/angular/angular/issues/22475)) ([4cfa571](https://github.com/angular/angular/commit/4cfa571)), closes [#22474](https://github.com/angular/angular/issues/22474)
* **router:** correct the segment parsing so it won't break on ampersand ([#23684](https://github.com/angular/angular/issues/23684)) ([553a680](https://github.com/angular/angular/commit/553a680))
* **service-worker:** don't include sourceMappingURL in ngsw-worker ([#24877](https://github.com/angular/angular/issues/24877)) ([8620373](https://github.com/angular/angular/commit/8620373)), closes [#23596](https://github.com/angular/angular/issues/23596)
* **service-worker:** avoid network requests when looking up hashed resources in cache ([#24127](https://github.com/angular/angular/issues/24127)) ([52d43a9](https://github.com/angular/angular/commit/52d43a9))
* **service-worker:** fix `SwPush.unsubscribe()` ([#24162](https://github.com/angular/angular/issues/24162)) ([3ed2d75](https://github.com/angular/angular/commit/3ed2d75)), closes [#24095](https://github.com/angular/angular/issues/24095)
* **service-worker:** add badge to NOTIFICATION_OPTION_NAMES ([#23241](https://github.com/angular/angular/issues/23241)) ([fb59b2d](https://github.com/angular/angular/commit/fb59b2d)), closes [#23196](https://github.com/angular/angular/issues/23196)
* **service-worker:** check platformBrowser before accessing navigator.serviceWorker ([#21231](https://github.com/angular/angular/issues/21231)) ([0bdd30e](https://github.com/angular/angular/commit/0bdd30e))
* **service-worker:** correctly handle requests with empty `clientId` ([#23625](https://github.com/angular/angular/issues/23625)) ([e0ed59e](https://github.com/angular/angular/commit/e0ed59e)), closes [#23526](https://github.com/angular/angular/issues/23526)
* **service-worker:** deprecate `versionedFiles` in asset-group resources ([#23584](https://github.com/angular/angular/issues/23584)) ([1d378e2](https://github.com/angular/angular/commit/1d378e2))

### Features

* **bazel:** Initial commit of protractor_web_test_suite ([#24787](https://github.com/angular/angular/issues/24787)) ([71e0df0](https://github.com/angular/angular/commit/71e0df0))
* **bazel:** protractor_web_test_suite for release ([#24787](https://github.com/angular/angular/issues/24787)) ([161ff5c](https://github.com/angular/angular/commit/161ff5c))
* **common:** introduce KeyValuePipe ([#24319](https://github.com/angular/angular/issues/24319)) ([2b49bf7](https://github.com/angular/angular/commit/2b49bf7))
* **compiler:** support `// ...` and `// TODO` in mock compiler expectations ([#23441](https://github.com/angular/angular/issues/23441)) ([c6b206e](https://github.com/angular/angular/commit/c6b206e))
* **compiler-cli:** update `tsickle` to `0.29.x` ([#24233](https://github.com/angular/angular/issues/24233)) ([f69ac67](https://github.com/angular/angular/commit/f69ac67))
* **core:** export defaultKeyValueDiffers to private api ([#24319](https://github.com/angular/angular/issues/24319)) ([92b278c](https://github.com/angular/angular/commit/92b278c))
* **core:** expose a Compiler API for accessing module ids from NgModule types ([#24258](https://github.com/angular/angular/issues/24258)) ([bd02b27](https://github.com/angular/angular/commit/bd02b27))
* **core:** KeyValueDiffer#diff allows null values ([#24319](https://github.com/angular/angular/issues/24319)) ([52ce9d5](https://github.com/angular/angular/commit/52ce9d5))
* **core:** add support for ShadowDOM v1 ([#24718](https://github.com/angular/angular/issues/24718)) ([3553977](https://github.com/angular/angular/commit/3553977))
(https://github.com/angular/angular/commit/328971f)), closes [#24616](https://github.com/angular/angular/issues/24616)
* **platform-browser:** add HammerJS lazy-loader symbols to public API ([#23943](https://github.com/angular/angular/issues/23943)) ([26fbf1d](https://github.com/angular/angular/commit/26fbf1d))
* **platform-browser:** allow lazy-loading HammerJS ([#23906](https://github.com/angular/angular/issues/23906)) ([313bdce](https://github.com/angular/angular/commit/313bdce))
* **platform-server:** use EventManagerPlugin on the server ([#24132](https://github.com/angular/angular/issues/24132)) ([d6595eb](https://github.com/angular/angular/commit/d6595eb))
* **router:** add urlUpdateStrategy allow updating the browser URL at the beginning of navigation ([#24820](https://github.com/angular/angular/issues/24820)) ([328971f]
* **router:** add navigation execution context info to activation hooks ([#24204](https://github.com/angular/angular/issues/24204)) ([20c463e](https://github.com/angular/angular/commit/20c463e)), closes [#24202](https://github.com/angular/angular/issues/24202)
* **router:** implement scrolling restoration service ([#20030](https://github.com/angular/angular/issues/20030)) ([49c5234](https://github.com/angular/angular/commit/49c5234)), closes [#13636](https://github.com/angular/angular/issues/13636) [#10929](https://github.com/angular/angular/issues/10929) [#7791](https://github.com/angular/angular/issues/7791) [#6595](https://github.com/angular/angular/issues/6595)
* **service-worker:** add support for `?` in SW config globbing ([#24105](https://github.com/angular/angular/issues/24105)) ([250527c](https://github.com/angular/angular/commit/250527c))
* typescript 2.9 support ([#24652](https://github.com/angular/angular/issues/24652)) ([e3064d5](https://github.com/angular/angular/commit/e3064d5))

### build

* **bazel:** turn on preserve-symlinks ([#24881](https://github.com/angular/angular/issues/24881)) ([c438b5e](https://github.com/angular/angular/commit/c438b5e))

### Angular Labs (experimental feature) breaking change

* **bazel:** Use of @angular/bazel rules now requires calling ng_setup_workspace() in your WORKSPACE file.

For example:

    local_repository(
        name = "angular",
        path = "node_modules/@angular/bazel",
    )

    load("@angular//:index.bzl", "ng_setup_workspace")

    ng_setup_workspace()

<a name="6.0.9"></a>
## [6.0.9](https://github.com/angular/angular/compare/6.0.8...6.0.9) (2018-07-11)


### Bug Fixes
* **common:** format fractional seconds ([#24844](https://github.com/angular/angular/issues/24844)) ([3c93d07](https://github.com/angular/angular/commit/3c93d07)), closes [#24831](https://github.com/angular/angular/issues/24831)


<a name="6.0.8"></a>
## [6.0.8](https://github.com/angular/angular/compare/6.0.7...6.0.8) (2018-07-11)


### Bug Fixes

* **common:** do not round factional seconds ([#24831](https://github.com/angular/angular/issues/24831)) ([0746485](https://github.com/angular/angular/commit/0746485)), closes [#24384](https://github.com/angular/angular/issues/24384)
* **common:** properly update collection reference in NgForOf ([#24684](https://github.com/angular/angular/issues/24684)) ([9a98de9](https://github.com/angular/angular/commit/9a98de9)), closes [#24155](https://github.com/angular/angular/issues/24155)
* **common:** use correct currency format for locale de-AT ([#24658](https://github.com/angular/angular/issues/24658)) ([a92f111](https://github.com/angular/angular/commit/a92f111)), closes [#24609](https://github.com/angular/angular/issues/24609)
* **compiler-cli:** Use typescript to resolve modules for metadata ([#22856](https://github.com/angular/angular/issues/22856)) ([7717ff1](https://github.com/angular/angular/commit/7717ff1))
* **core:** use addCustomEqualityTester instead of overriding toEqual ([#22983](https://github.com/angular/angular/issues/22983)) ([b8975a9](https://github.com/angular/angular/commit/b8975a9)), closes [#22939](https://github.com/angular/angular/issues/22939)
* **language-service:** do not overwrite native `Reflect` ([#24299](https://github.com/angular/angular/issues/24299)) ([de1c44f](https://github.com/angular/angular/commit/de1c44f)), closes [#21420](https://github.com/angular/angular/issues/21420)
* **router:** add ability to recover from malformed url ([#23283](https://github.com/angular/angular/issues/23283)) ([2d4f4b5](https://github.com/angular/angular/commit/2d4f4b5)), closes [#21468](https://github.com/angular/angular/issues/21468)
* **service-worker:** avoid network requests when looking up hashed resources in cache ([#24127](https://github.com/angular/angular/issues/24127)) ([183b079](https://github.com/angular/angular/commit/183b079))


### Features

* **core:** add support for ShadowDOM v1 ([#24718](https://github.com/angular/angular/issues/24718)) ([6c55a13](https://github.com/angular/angular/commit/6c55a13))

<a name="6.0.7"></a>
## [6.0.7](https://github.com/angular/angular/compare/6.0.6...6.0.7) (2018-06-27)


### Bug Fixes

* **animations:** set animations styles properly on platform-server ([#24624](https://github.com/angular/angular/issues/24624)) ([0b356d4](https://github.com/angular/angular/commit/0b356d4))
* **common:** use correct ICU plural for locale mk ([#24659](https://github.com/angular/angular/issues/24659)) ([64a8584](https://github.com/angular/angular/commit/64a8584))

<a name="6.0.6"></a>
## [6.0.6](https://github.com/angular/angular/compare/6.0.5...6.0.6) (2018-06-20)


### Bug Fixes

* **compiler:** support `.` in import statements. ([#20634](https://github.com/angular/angular/issues/20634)) ([e543c73](https://github.com/angular/angular/commit/e543c73)), closes [#20363](https://github.com/angular/angular/issues/20363)
* **core:** Injector correctly honors the @Self flag ([#24520](https://github.com/angular/angular/issues/24520)) ([f5b3661](https://github.com/angular/angular/commit/f5b3661))

<a name="6.0.5"></a>
## [6.0.5](https://github.com/angular/angular/compare/6.0.4...6.0.5) (2018-06-13)

* **animations:** always render end-state styles for orphaned DOM nodes ([#24236](https://github.com/angular/angular/issues/24236)) ([0139173](https://github.com/angular/angular/commit/0139173))
* **bazel:** Allow ng_module to depend on targets w no deps ([#24446](https://github.com/angular/angular/issues/24446)) ([ea3669e](https://github.com/angular/angular/commit/ea3669e))
* **docs-infra:** use script nomodule to load IE polyfills, skip other polyfills ([#24317](https://github.com/angular/angular/issues/24317)) ([e876535](https://github.com/angular/angular/commit/e876535)), closes [#23647](https://github.com/angular/angular/issues/23647)
* **router:** fix lazy loading of aux routes ([#23459](https://github.com/angular/angular/issues/23459)) ([d20877b](https://github.com/angular/angular/commit/d20877b)), closes [#10981](https://github.com/angular/angular/issues/10981)
* **service-worker:** fix `SwPush.unsubscribe()` ([#24162](https://github.com/angular/angular/issues/24162)) ([ea2987c](https://github.com/angular/angular/commit/ea2987c)), closes [#24095](https://github.com/angular/angular/issues/24095)

<a name="6.0.4"></a>
## [6.0.4](https://github.com/angular/angular/compare/6.0.3...6.0.4) (2018-06-06)


### Bug Fixes

* **animations:** Fix browser detection logic ([#24188](https://github.com/angular/angular/issues/24188)) ([c9eb491](https://github.com/angular/angular/commit/c9eb491))
* **animations:** retain trigger-state for nodes that are moved around ([#24238](https://github.com/angular/angular/issues/24238)) ([19deca1](https://github.com/angular/angular/commit/19deca1))
* **forms:** properly handle special properties in FormGroup.get ([#22249](https://github.com/angular/angular/issues/22249)) ([dc3e8aa](https://github.com/angular/angular/commit/dc3e8aa)), closes [#17195](https://github.com/angular/angular/issues/17195)
* **platform-server:** avoid clash between server and client style encapsulation attributes ([#24158](https://github.com/angular/angular/issues/24158)) ([e9f2203](https://github.com/angular/angular/commit/e9f2203))
* **platform-server:** avoid dependency cycle when using http interceptor ([#24229](https://github.com/angular/angular/issues/24229)) ([2991b1b](https://github.com/angular/angular/commit/2991b1b)), closes [#23023](https://github.com/angular/angular/issues/23023)
* **platform-server:** don't reflect innerHTML property to attibute ([#24213](https://github.com/angular/angular/issues/24213)) ([c17098d](https://github.com/angular/angular/commit/c17098d)), closes [#19278](https://github.com/angular/angular/issues/19278)
* **platform-server:** provide Domino DOM types globally ([#24116](https://github.com/angular/angular/issues/24116)) ([906b3ec](https://github.com/angular/angular/commit/906b3ec)), closes [#23280](https://github.com/angular/angular/issues/23280) [#23133](https://github.com/angular/angular/issues/23133)


<a name="6.0.3"></a>
## [6.0.3](https://github.com/angular/angular/compare/6.0.2...6.0.3) (2018-05-22)


### Bug Fixes

* **service-worker:** check platformBrowser before accessing navigator.serviceWorker ([#21231](https://github.com/angular/angular/issues/21231)) ([0ee5b7e](https://github.com/angular/angular/commit/0ee5b7e))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/angular/angular/compare/6.0.1...6.0.2) (2018-05-15)


### Bug Fixes

* **animations:** do not throw errors when a destroyed component is animated ([#23836](https://github.com/angular/angular/issues/23836)) ([752b83a](https://github.com/angular/angular/commit/752b83a))
* **service-worker:** deprecate `versionedFiles` in asset-group resources ([#23584](https://github.com/angular/angular/issues/23584)) ([c6b618d](https://github.com/angular/angular/commit/c6b618d))



<a name="6.0.1"></a>
# [6.0.1](https://github.com/angular/angular/compare/6.0.0...6.0.1) (2018-05-11)


### Bug Fixes

* **animations:** properly clean up queried element styles in safari/edge ([#23686](https://github.com/angular/angular/issues/23686)) ([3824e3f](https://github.com/angular/angular/commit/3824e3f))
* **animations:** retain state styling for nodes that are moved around ([#23686](https://github.com/angular/angular/issues/23686)) ([05aa5e0](https://github.com/angular/angular/commit/05aa5e0))
* **core:** call ngOnDestroy on all services that have it ([#23755](https://github.com/angular/angular/issues/23755)) ([5581e97](https://github.com/angular/angular/commit/5581e97)), closes [#22466](https://github.com/angular/angular/issues/22466) [#22240](https://github.com/angular/angular/issues/22240) [#14818](https://github.com/angular/angular/issues/14818)
* **elements:** always check to create strategy ([#23825](https://github.com/angular/angular/issues/23825)) ([d280077](https://github.com/angular/angular/commit/d280077))
* **router:** avoid freezing queryParams in-place ([#22663](https://github.com/angular/angular/issues/22663)) ([3d8799b](https://github.com/angular/angular/commit/3d8799b)), closes [#22617](https://github.com/angular/angular/issues/22617)
* **router:** correct the segment parsing so it won't break on ampersand ([#23684](https://github.com/angular/angular/issues/23684)) ([8733843](https://github.com/angular/angular/commit/8733843))
* **service-worker:** correctly handle requests with empty `clientId` ([#23625](https://github.com/angular/angular/issues/23625)) ([2254ac2](https://github.com/angular/angular/commit/2254ac2)), closes [#23526](https://github.com/angular/angular/issues/23526)



<a name="6.0.0"></a>
# [6.0.0](https://github.com/angular/angular/compare/6.0.0-beta.0...6.0.0) (2018-05-03)

### Release Highlights & Update instructions

Angular v6 is the first release of Angular that unifies the Framework, Material and CLI.

To learn about the release highlights and our new CLI-powered update workflow for your projects please check out the [v6 release announcement](https://blog.angular.io/version-6-0-0-of-angular-now-available-cc56b0efa7a4).



### Dependency updates

* @angular/core now depends on
  * TypeScript 2.7
  * RxJS 6.0.0
  * tslib 1.9.0
* @angular/platform-server now depends on Domino 2.0



### Small Features

* **animations:** only use the WA-polyfill alongside AnimationBuilder ([#22143](https://github.com/angular/angular/issues/22143)) ([b2f366b](https://github.com/angular/angular/commit/b2f366b)), closes [#17496](https://github.com/angular/angular/issues/17496)
* **animations:** expose `element` and `params` within transition matchers ([#22693](https://github.com/angular/angular/issues/22693)) ([58b94e6](https://github.com/angular/angular/commit/58b94e6))
* **common:** better error message when non-template element used in NgIf ([#22274](https://github.com/angular/angular/issues/22274)) ([67cf11d](https://github.com/angular/angular/commit/67cf11d)), closes [#16410](https://github.com/angular/angular/issues/16410)
* **common:** export functions to format numbers, percents, currencies & dates ([#22423](https://github.com/angular/angular/issues/22423)) ([4180912](https://github.com/angular/angular/commit/4180912)), closes [#20536](https://github.com/angular/angular/issues/20536)
* **compiler:** lower @NgModule ids if needed ([#23031](https://github.com/angular/angular/issues/23031)) ([bd024c0](https://github.com/angular/angular/commit/bd024c0))
* **compiler:** implement "enableIvy" compiler option ([#21427](https://github.com/angular/angular/issues/21427)) ([64d16de](https://github.com/angular/angular/commit/64d16de))
* **compiler:** mark @NgModules in provider lists for identification at runtime ([#22005](https://github.com/angular/angular/issues/22005)) ([2d5e7d1](https://github.com/angular/angular/commit/2d5e7d1))
* **compiler:** add support for marker tags in xliff serializers ([#21250](https://github.com/angular/angular/issues/21250)) ([f74130c](https://github.com/angular/angular/commit/f74130c)), closes [#21078](https://github.com/angular/angular/issues/21078)
* **compiler:** support for singleline, multiline & jsdoc comments ([#22715](https://github.com/angular/angular/issues/22715)) ([3b167be](https://github.com/angular/angular/commit/3b167be))
* **compiler-cli:** lower loadChildren fields to allow dynamic module paths ([#23088](https://github.com/angular/angular/issues/23088)) ([550433a](https://github.com/angular/angular/commit/550433a))
* **compiler-cli:** check unvalidated combination of ngc and TypeScript ([#22293](https://github.com/angular/angular/issues/22293)) ([3ceee99](https://github.com/angular/angular/commit/3ceee99)), closes [#20669](https://github.com/angular/angular/issues/20669)
* **compiler-cli:** reflect static methods added to classes in metadata ([#21926](https://github.com/angular/angular/issues/21926)) ([eb8ddd2](https://github.com/angular/angular/commit/eb8ddd2))
* **compiler-cli:** Check unvalidated combination of ngc and TypeScript ([#22293](https://github.com/angular/angular/issues/22293)) ([3ceee99](https://github.com/angular/angular/commit/3ceee99)), closes [#20669](https://github.com/angular/angular/issues/20669)
* **compiler-cli:** add resource inlining to ngc ([#22615](https://github.com/angular/angular/issues/22615)) ([b5be18f](https://github.com/angular/angular/commit/b5be18f))
* **compiler-cli:** require node 8 as runtime engine ([#22669](https://github.com/angular/angular/issues/22669)) ([c602563](https://github.com/angular/angular/commit/c602563))
* **core:** add binding name to content changed error ([#20352](https://github.com/angular/angular/issues/20352)) ([d3bf54b](https://github.com/angular/angular/commit/d3bf54b))
* **core:** optional generic type for ElementRef ([#20765](https://github.com/angular/angular/issues/20765)) ([d3d9aac](https://github.com/angular/angular/commit/d3d9aac)), closes [#13139](https://github.com/angular/angular/issues/13139)
* **core:** set `preserveWhitespaces` to false by default ([#22046](https://github.com/angular/angular/issues/22046)) ([f1a0632](https://github.com/angular/angular/commit/f1a0632)), closes [#22027](https://github.com/angular/angular/issues/22027)
* **core:** support metadata reflection for native class types ([#22356](https://github.com/angular/angular/issues/22356)) ([5c89d6b](https://github.com/angular/angular/commit/5c89d6b)), closes [#21731](https://github.com/angular/angular/issues/21731)
* **core:** change @Injectable() to support tree-shakeable tokens ([#22005](https://github.com/angular/angular/issues/22005)) ([235a235](https://github.com/angular/angular/commit/235a235))
* **core:** support metadata reflection for native class types ([#22356](https://github.com/angular/angular/issues/22356)) ([b7544cc](https://github.com/angular/angular/commit/b7544cc)), closes [#21731](https://github.com/angular/angular/issues/21731)
* **core:** allow direct scoping of @Injectables to the root injector ([#22185](https://github.com/angular/angular/issues/22185)) ([7ac34e4](https://github.com/angular/angular/commit/7ac34e4))
* **core:** add task tracking to Testability ([#16863](https://github.com/angular/angular/issues/16863)) ([37fedd0](https://github.com/angular/angular/commit/37fedd0))
* **forms:** handle string with and without line boundary on pattern validator ([#19256](https://github.com/angular/angular/issues/19256)) ([54bf179](https://github.com/angular/angular/commit/54bf179))
* **forms:** multiple validators for array method ([#20766](https://github.com/angular/angular/issues/20766)) ([941e88f](https://github.com/angular/angular/commit/941e88f)), closes [#20665](https://github.com/angular/angular/issues/20665)
* **forms:** allow markAsPending to emit events ([#20212](https://github.com/angular/angular/issues/20212)) ([e86b64b](https://github.com/angular/angular/commit/e86b64b)), closes [#17958](https://github.com/angular/angular/issues/17958)
* **platform-browser:** add token marking which the type of animation module nearest in the injector tree ([#23075](https://github.com/angular/angular/issues/23075)) ([b551f84](https://github.com/angular/angular/commit/b551f84))
* **platform-browser:** do not throw error when Hammer.js not loaded ([#22257](https://github.com/angular/angular/issues/22257)) ([991300b](https://github.com/angular/angular/commit/991300b)), closes [#16992](https://github.com/angular/angular/issues/16992)
* **platform-browser:** fix [#19604](https://github.com/angular/angular/issues/19604), can config hammerOptions ([#21979](https://github.com/angular/angular/issues/21979)) ([1d571b2](https://github.com/angular/angular/commit/1d571b2))
* **platform-server:** bump Domino to v2.0 ([#22411](https://github.com/angular/angular/issues/22411)) ([d3827a0](https://github.com/angular/angular/commit/d3827a0))
* **router:** add navigationSource and restoredState to NavigationStart event ([#21728](https://github.com/angular/angular/issues/21728)) ([c40ae7f](https://github.com/angular/angular/commit/c40ae7f))
* **service-worker:** add support for configuring navigations URLs ([#23339](https://github.com/angular/angular/issues/23339)) ([08325aa](https://github.com/angular/angular/commit/08325aa)), closes [#20404](https://github.com/angular/angular/issues/20404)
* **service-worker:** add helper script which will uninstall SW ([#21863](https://github.com/angular/angular/issues/21863)) ([b10540a](https://github.com/angular/angular/commit/b10540a))




### Bug Fixes

* **animations:** report correct totalTime value even during noOp animations ([#22225](https://github.com/angular/angular/issues/22225)) ([e1bf067](https://github.com/angular/angular/commit/e1bf067))
* **animations:** avoid animation insertions during router back/refresh ([#21977](https://github.com/angular/angular/issues/21977)) ([f88fba0](https://github.com/angular/angular/commit/f88fba0)), closes [#19712](https://github.com/angular/angular/issues/19712)
* **animations:** treat numeric state name values as strings ([#22923](https://github.com/angular/angular/issues/22923)) ([e5e1b0d](https://github.com/angular/angular/commit/e5e1b0d))
* **animations:** fix increment/decrement aliases example ([#18323](https://github.com/angular/angular/issues/18323)) ([d2aa8ac](https://github.com/angular/angular/commit/d2aa8ac))
* **common:** NgClass should properly take className changes into account ([#21937](https://github.com/angular/angular/issues/21937)) ([4a42669](https://github.com/angular/angular/commit/4a42669)), closes [#21932](https://github.com/angular/angular/issues/21932)
* **common:** fix the titlecase pipe ([#22600](https://github.com/angular/angular/issues/22600)) ([7966744](https://github.com/angular/angular/commit/7966744))
* **common:** add locale currency values ([#21783](https://github.com/angular/angular/issues/21783)) ([420cc7a](https://github.com/angular/angular/commit/420cc7a)), closes [#20385](https://github.com/angular/angular/issues/20385)
* **common:** round currencies based on decimal digits in `CurrencyPipe` ([#21783](https://github.com/angular/angular/issues/21783)) ([44154e7](https://github.com/angular/angular/commit/44154e7)), closes [#10189](https://github.com/angular/angular/issues/10189)
* **common:** weaken AsyncPipe transform signature ([#22169](https://github.com/angular/angular/issues/22169)) ([be59c3a](https://github.com/angular/angular/commit/be59c3a))
* **common:** http testing library should not convert null to a string when flushing a mock request ([#21417](https://github.com/angular/angular/issues/21417)) ([8b14488](https://github.com/angular/angular/commit/8b14488)), closes [#20744](https://github.com/angular/angular/issues/20744)
* **common:** correct mapping of Observable methods ([#20518](https://github.com/angular/angular/issues/20518)) ([2639b4b](https://github.com/angular/angular/commit/2639b4b)), closes [#20516](https://github.com/angular/angular/issues/20516)
* **common:** then and else template might be set to null ([#22298](https://github.com/angular/angular/issues/22298)) ([8115edc](https://github.com/angular/angular/commit/8115edc))
* **common:** A null value should remove the style on IE ([#21679](https://github.com/angular/angular/issues/21679)) ([7d49443](https://github.com/angular/angular/commit/7d49443)), closes [#21064](https://github.com/angular/angular/issues/21064)
* **common:** fallback to last defined value for named date and time formats ([#21299](https://github.com/angular/angular/issues/21299)) ([879756d](https://github.com/angular/angular/commit/879756d)), closes [#21282](https://github.com/angular/angular/issues/21282)
* **common:** set correct timezone for ISO8601 dates in Safari ([#21506](https://github.com/angular/angular/issues/21506)) ([05208b8](https://github.com/angular/angular/commit/05208b8)), closes [#21491](https://github.com/angular/angular/issues/21491)
* **compiler:** fix ICU select messages to use male/female/other ([#21713](https://github.com/angular/angular/issues/21713)) ([cb5090c](https://github.com/angular/angular/commit/cb5090c))
* **compiler:** avoid a crash in ngc-wrapped. ([#23468](https://github.com/angular/angular/issues/23468)) ([0bc8443](https://github.com/angular/angular/commit/0bc8443))
* **compiler:** handle undefined annotation metadata ([#23349](https://github.com/angular/angular/issues/23349)) ([b9431e8](https://github.com/angular/angular/commit/b9431e8))
* **compiler:** don't typecheck all inputs ([#22899](https://github.com/angular/angular/issues/22899)) ([838a610](https://github.com/angular/angular/commit/838a610))
* **compiler:** fix support for html-like text in translatable attributes ([#23053](https://github.com/angular/angular/issues/23053)) ([28058b7](https://github.com/angular/angular/commit/28058b7))
* **compiler:** take quoting into account when determining if object literals can be shared ([#22942](https://github.com/angular/angular/issues/22942)) ([d98e9e7](https://github.com/angular/angular/commit/d98e9e7))
* **compiler:** do not emit line/char in ngsummary files. ([#22840](https://github.com/angular/angular/issues/22840)) ([5c387a7](https://github.com/angular/angular/commit/5c387a7))
* **compiler:** make unary plus operator consistent to JavaScript ([#22154](https://github.com/angular/angular/issues/22154)) ([72f8abd](https://github.com/angular/angular/commit/72f8abd)), closes [#22089](https://github.com/angular/angular/issues/22089)
* **compiler:** allow tree-shakeable injectables to depend on string tokens ([#22376](https://github.com/angular/angular/issues/22376)) ([dd53447](https://github.com/angular/angular/commit/dd53447))
* **compiler:** don't strip `/*# sourceURL ... */` ([#16088](https://github.com/angular/angular/issues/16088)) ([5f681f9](https://github.com/angular/angular/commit/5f681f9))
* **compiler:** cache external reference resolution ([#21359](https://github.com/angular/angular/issues/21359)) ([e3e2fc0](https://github.com/angular/angular/commit/e3e2fc0))
* **compiler:** make `.ngsummary.json` files idempotent ([#21448](https://github.com/angular/angular/issues/21448)) ([e64b1e9](https://github.com/angular/angular/commit/e64b1e9))
* **compiler-cli:** shorten resolved module name in fileNameToModuleName to npm package name for typings ([#23231](https://github.com/angular/angular/issues/23231)) ([6199ea5](https://github.com/angular/angular/commit/6199ea5))
* **compiler-cli:** strictMetadataEmit should not break on non-compliant libraries ([#23275](https://github.com/angular/angular/issues/23275)) ([5814355](https://github.com/angular/angular/commit/5814355)), closes [#22210](https://github.com/angular/angular/issues/22210)
* **compiler-cli:** flat module index metadata should be transformed ([#23129](https://github.com/angular/angular/issues/23129)) ([f99cb5c](https://github.com/angular/angular/commit/f99cb5c))
* **compiler-cli:** use numeric comparison for TypeScript version ([#22705](https://github.com/angular/angular/issues/22705)) ([193737a](https://github.com/angular/angular/commit/193737a)), closes [#22593](https://github.com/angular/angular/issues/22593)
* **compiler-cli:** disableTypeScriptVersionCheck should be applied even for older tsc versions ([#22669](https://github.com/angular/angular/issues/22669)) ([3f70aba](https://github.com/angular/angular/commit/3f70aba))
* **compiler-cli:** emit correct css string escape sequences ([#22776](https://github.com/angular/angular/issues/22776)) ([6e5e819](https://github.com/angular/angular/commit/6e5e819))
* **compiler-cli:** do not fold errors past calls in the collector ([#21708](https://github.com/angular/angular/issues/21708)) ([dd86790](https://github.com/angular/angular/commit/dd86790))
* **compiler-cli:** do not lower expressions in non-modules ([#21649](https://github.com/angular/angular/issues/21649)) ([7f93aad](https://github.com/angular/angular/commit/7f93aad))
* **core:** fix [#20582](https://github.com/angular/angular/issues/20582), don't need to wrap zone in location change listener ([#20640](https://github.com/angular/angular/issues/20640)) ([f791e9f](https://github.com/angular/angular/commit/f791e9f))
* **core:** fix proper propagation of subscriptions in EventEmitter ([#22016](https://github.com/angular/angular/issues/22016)) ([e81606c](https://github.com/angular/angular/commit/e81606c)), closes [#21999](https://github.com/angular/angular/issues/21999)
* **core:** fix chained http call ([#20924](https://github.com/angular/angular/issues/20924)) ([7e3f9a4](https://github.com/angular/angular/commit/7e3f9a4)), closes [#20921](https://github.com/angular/angular/issues/20921)
* **core:** should check Zone existence when scheduleMicroTask ([#20656](https://github.com/angular/angular/issues/20656)) ([3a86940](https://github.com/angular/angular/commit/3a86940))
* **core:** avoid eager providers re-initialization ([#23559](https://github.com/angular/angular/issues/23559)) ([697b6c0](https://github.com/angular/angular/commit/697b6c0))
* **core:** add stacktrace in log when error during cleanup component in TestBed ([#22162](https://github.com/angular/angular/issues/22162)) ([16d1700](https://github.com/angular/angular/commit/16d1700))
* **core:** ensure initial value of QueryList length ([#21980](https://github.com/angular/angular/issues/21980)) ([#21982](https://github.com/angular/angular/issues/21982)) ([e56de10](https://github.com/angular/angular/commit/e56de10)), closes [#21980](https://github.com/angular/angular/issues/21980)
* **core:** use appropriate inert document strategy for Firefox & Safari ([#17019](https://github.com/angular/angular/issues/17019)) ([a751649](https://github.com/angular/angular/commit/a751649))
* **core:** properly handle function without prototype in reflector ([#22284](https://github.com/angular/angular/issues/22284)) ([a7ebf5a](https://github.com/angular/angular/commit/a7ebf5a)), closes [#19978](https://github.com/angular/angular/issues/19978)
* **core:** require factory to be provided for shakeable InjectionToken ([#22207](https://github.com/angular/angular/issues/22207)) ([f755db7](https://github.com/angular/angular/commit/f755db7)), closes [#22205](https://github.com/angular/angular/issues/22205)
* **core:** remove core animation import symbols ([#22692](https://github.com/angular/angular/issues/22692)) ([f5a98f4](https://github.com/angular/angular/commit/f5a98f4))
* **forms:** improve error message for invalid value accessors ([#22731](https://github.com/angular/angular/issues/22731)) ([23cc3ef](https://github.com/angular/angular/commit/23cc3ef))
* **forms:** make Validators.email support optional controls ([#20869](https://github.com/angular/angular/issues/20869)) ([140e7c0](https://github.com/angular/angular/commit/140e7c0))
* **forms:** prevent event emission on enable/disable when emitEvent is false ([#12366](https://github.com/angular/angular/issues/12366)) ([#21018](https://github.com/angular/angular/issues/21018)) ([0bcfae7](https://github.com/angular/angular/commit/0bcfae7))
* **forms:** set state before emitting a value from ngModelChange ([#21514](https://github.com/angular/angular/issues/21514)) ([9744a1c](https://github.com/angular/angular/commit/9744a1c)), closes [#21513](https://github.com/angular/angular/issues/21513)
* **forms:** publish missing types ([#19941](https://github.com/angular/angular/issues/19941)) ([2707012](https://github.com/angular/angular/commit/2707012))
* **forms:** set state before emitting a value from ngModelChange ([#21514](https://github.com/angular/angular/issues/21514)) ([3e6a86f](https://github.com/angular/angular/commit/3e6a86f)), closes [#21513](https://github.com/angular/angular/issues/21513)
* **language-service:** Clear caches when program changes ([#21337](https://github.com/angular/angular/issues/21337)) ([43e1520](https://github.com/angular/angular/commit/43e1520)), closes [#19405](https://github.com/angular/angular/issues/19405)
* **platform-browser:** add @Injectable where it was missing ([#22005](https://github.com/angular/angular/issues/22005)) ([0a1a397](https://github.com/angular/angular/commit/0a1a397))
* **platform-browser:** support 0/false/null values in transfer_state ([#22179](https://github.com/angular/angular/issues/22179)) ([6435ecd](https://github.com/angular/angular/commit/6435ecd))
* **platform-browser:** do not throw error when Hammer.js not loaded ([#22257](https://github.com/angular/angular/issues/22257)) ([991300b](https://github.com/angular/angular/commit/991300b)), closes [#16992](https://github.com/angular/angular/issues/16992)
* **platform-browser:** fix [#19604](https://github.com/angular/angular/issues/19604), can config hammerOptions ([#21979](https://github.com/angular/angular/issues/21979)) ([1d571b2](https://github.com/angular/angular/commit/1d571b2))
* **platform-server:** require node v8+ ([#23331](https://github.com/angular/angular/issues/23331)) ([bbfa1d3](https://github.com/angular/angular/commit/bbfa1d3))
* **platform-server:** generate correct stylings for camel case names ([#22263](https://github.com/angular/angular/issues/22263)) ([40ba009](https://github.com/angular/angular/commit/40ba009)), closes [#19235](https://github.com/angular/angular/issues/19235)
* **platform-server:** add styles to elements correctly ([#22527](https://github.com/angular/angular/issues/22527)) ([cd2ebd2](https://github.com/angular/angular/commit/cd2ebd2))
* **router:** cache route handle if found ([#22475](https://github.com/angular/angular/issues/22475)) ([d8de648](https://github.com/angular/angular/commit/d8de648)), closes [#22474](https://github.com/angular/angular/issues/22474)
* **router:** don't use spread operator to workaround an issue in closure compiler ([#22884](https://github.com/angular/angular/issues/22884)) ([e6c731f](https://github.com/angular/angular/commit/e6c731f))
* **router:** make locationSyncBootstrapListener public due to change in output after TS 2.7 update in [#22669](https://github.com/angular/angular/issues/22669) ([#22896](https://github.com/angular/angular/issues/22896)) ([623d769](https://github.com/angular/angular/commit/623d769))
* **router:** correct over-encoding of URL fragment ([#22687](https://github.com/angular/angular/issues/22687)) ([0bf6fa5](https://github.com/angular/angular/commit/0bf6fa5))
* **router:** don't mutate route configs ([#22358](https://github.com/angular/angular/issues/22358)) ([45eff4c](https://github.com/angular/angular/commit/45eff4c)), closes [#22203](https://github.com/angular/angular/issues/22203)
* **router:** fix URL serialization so special characters are only encoded where needed ([#22337](https://github.com/angular/angular/issues/22337)) ([094666d](https://github.com/angular/angular/commit/094666d)), closes [#10280](https://github.com/angular/angular/issues/10280)
* **router:** don't use ParamsInheritanceStrategy in declarations ([#21574](https://github.com/angular/angular/issues/21574)) ([925e654](https://github.com/angular/angular/commit/925e654)), closes [#21456](https://github.com/angular/angular/issues/21456)
* **service-worker:** add badge to NOTIFICATION_OPTION_NAMES ([#23241](https://github.com/angular/angular/issues/23241)) ([fb59b2d](https://github.com/angular/angular/commit/fb59b2d)), closes [#23196](https://github.com/angular/angular/issues/23196)
* **service-worker:** let `*` match 0 characters in globs ([#23339](https://github.com/angular/angular/issues/23339)) ([6c2c958](https://github.com/angular/angular/commit/6c2c958))
* **service-worker:** do not enter degraded mode when offline ([#22883](https://github.com/angular/angular/issues/22883)) ([9e9b8dd](https://github.com/angular/angular/commit/9e9b8dd)), closes [#21636](https://github.com/angular/angular/issues/21636)
* **service-worker:** fix LruList bugs ([#22769](https://github.com/angular/angular/issues/22769)) ([8c2a578](https://github.com/angular/angular/commit/8c2a578)), closes [#22218](https://github.com/angular/angular/issues/22218) [#22768](https://github.com/angular/angular/issues/22768)
* **service-worker:** ignore invalid `only-if-cached` requests ([#22883](https://github.com/angular/angular/issues/22883)) ([d9dc46e](https://github.com/angular/angular/commit/d9dc46e)), closes [#22362](https://github.com/angular/angular/issues/22362)
* **service-worker:** properly handle invalid hashes in all scenarios ([#21288](https://github.com/angular/angular/issues/21288)) ([3951098](https://github.com/angular/angular/commit/3951098))
* **upgrade:** correctly handle downgraded `OnPush` components ([#22209](https://github.com/angular/angular/issues/22209)) ([ad9ce5c](https://github.com/angular/angular/commit/ad9ce5c)), closes [#14286](https://github.com/angular/angular/issues/14286)
* **upgrade:** propagate return value of resumeBootstrap ([#22754](https://github.com/angular/angular/issues/22754)) ([a2330ff](https://github.com/angular/angular/commit/a2330ff)), closes [#22723](https://github.com/angular/angular/issues/22723)
* **upgrade:** two-way binding and listening for event ([#22772](https://github.com/angular/angular/issues/22772)) ([2b3de63](https://github.com/angular/angular/commit/2b3de63)), closes [#22734](https://github.com/angular/angular/issues/22734)
* **upgrade:** correctly destroy nested downgraded component ([#22400](https://github.com/angular/angular/issues/22400)) ([8a85888](https://github.com/angular/angular/commit/8a85888)), closes [#22392](https://github.com/angular/angular/issues/22392)
* **upgrade:** correctly handle `=` bindings in `[@angular](https://github.com/angular)/upgrade` ([#22167](https://github.com/angular/angular/issues/22167)) ([f089bf5](https://github.com/angular/angular/commit/f089bf5))
* **upgrade:** fix empty transclusion content with AngularJS@>=1.5.8 ([#22167](https://github.com/angular/angular/issues/22167)) ([13ab91e](https://github.com/angular/angular/commit/13ab91e)), closes [#22175](https://github.com/angular/angular/issues/22175)



### Possible Breaking Changes

* **animations:** When animation is triggered within a disabled zone, the associated event (which an instance of AnimationEvent) will no longer report the totalTime as 0 (it will emit the actual time of the animation).

  To detect if an animation event is reporting a disabled animation then the `event.disabled` property can be used instead.


* **compiler:** The `<template>` tag was deprecated in Angular v4 to avoid collisions (i.e. when using Web Components).

  This change removes support for `<template>`. `<ng-template>` should be used instead.

  BEFORE:

      <!-- html template -->
      <template>some template content</template>

      # tsconfig.json
      {
        # ...
        "angularCompilerOptions": {
          # ...
          # This option is no more supported and will have no effect
          "enableLegacyTemplate": [true|false]
        }
      }

  AFTER:

      <!-- html template -->
      <ng-template>some template content</ng-template>

* **core:** it is no longer possible to import animation-related functions from @angular/core. All animation symbols must now be imported from @angular/animations.


* **forms:** - `AbstractControl#statusChanges` now emits an event of `'PENDING'` when you call `AbstractControl#markAsPending`
  - Previously it did not emit an event when you called `markAsPending`
  - To migrate you would need to ensure that if you are filtering or checking events from `statusChanges` that you account for the new event when calling `markAsPending`


* **forms:** ngModelChange is now emitted after the value/validity is updated on its control.

  Previously, ngModelChange was emitted before its underlying control was updated.
  This was fine if you passed through the value directly through the $event keyword, e.g.

  ```
  <input [(ngModel)]="name" (ngModelChange)="onChange($event)">

  onChange(value) {
     console.log(value);               // would log updated value
  }
  ```

  However, if you had a handler for the ngModelChange event that checked the value through the control,
  you would get the old value rather than the updated value. e.g:

  ```
  <input #modelDir="ngModel" [(ngModel)]="name" (ngModelChange)="onChange(modelDir)">

  onChange(ngModel: NgModel) {
    console.log(ngModel.value);        // would log old value, not updated value
  }
  ```

  Now the value and validity will be updated before the ngModelChange event is emitted,
  so the same setup will log the updated value.

  ```
  onChange(ngModel: NgModel) {
     console.log(ngModel.value);       // will log updated value
  }
  ```

  We think this order will be less confusing when the control is checked directly.
  You will only need to update your app if it has relied on this bug to keep track of the old control value.
  If that is the case, you should be able to track the old value directly by saving it on your component.



<a name="5.2.10"></a>
## [5.2.10](https://github.com/angular/angular/compare/5.2.9...5.2.10) (2018-04-16)


### Bug Fixes

* **animations:** avoid animation insertions during router back/refresh ([#21977](https://github.com/angular/angular/issues/21977)) ([641cc49](https://github.com/angular/angular/commit/641cc49)), closes [#19712](https://github.com/angular/angular/issues/19712)
* **common:** properly take className changes into account ([#21937](https://github.com/angular/angular/issues/21937)) ([54e9108](https://github.com/angular/angular/commit/54e9108)), closes [#21932](https://github.com/angular/angular/issues/21932)
* **compiler:** fix support for html-like text in translatable attributes ([#23053](https://github.com/angular/angular/issues/23053)) ([4f7c369](https://github.com/angular/angular/commit/4f7c369))
* **compiler-cli:** emit correct css string escape sequences ([#22776](https://github.com/angular/angular/issues/22776)) ([db0afa9](https://github.com/angular/angular/commit/db0afa9))
* **forms:** improve error message for invalid value accessors ([#22731](https://github.com/angular/angular/issues/22731)) ([dd61595](https://github.com/angular/angular/commit/dd61595))
* **service-worker:** add badge to NOTIFICATION_OPTION_NAMES ([#23241](https://github.com/angular/angular/issues/23241)) ([7b23983](https://github.com/angular/angular/commit/7b23983)), closes [#23196](https://github.com/angular/angular/issues/23196)
* **service-worker:** do not enter degraded mode when offline ([#22883](https://github.com/angular/angular/issues/22883)) ([ae9c25f](https://github.com/angular/angular/commit/ae9c25f)), closes [#21636](https://github.com/angular/angular/issues/21636)
* **service-worker:** fix LruList bugs ([#22769](https://github.com/angular/angular/issues/22769)) ([65f8943](https://github.com/angular/angular/commit/65f8943)), closes [#22218](https://github.com/angular/angular/issues/22218) [#22768](https://github.com/angular/angular/issues/22768)
* **service-worker:** ignore invalid `only-if-cached` requests ([#22883](https://github.com/angular/angular/issues/22883)) ([0d4fe38](https://github.com/angular/angular/commit/0d4fe38)), closes [#22362](https://github.com/angular/angular/issues/22362)
* **upgrade:** correctly handle downgraded `OnPush` components ([#22209](https://github.com/angular/angular/issues/22209)) ([f43fba6](https://github.com/angular/angular/commit/f43fba6)), closes [#14286](https://github.com/angular/angular/issues/14286)
* **upgrade:** propagate return value of resumeBootstrap ([#22754](https://github.com/angular/angular/issues/22754)) ([ae76eec](https://github.com/angular/angular/commit/ae76eec)), closes [#22723](https://github.com/angular/angular/issues/22723)
* **upgrade:** two-way binding and listening for event ([#22772](https://github.com/angular/angular/issues/22772)) ([5391f96](https://github.com/angular/angular/commit/5391f96)), closes [#22734](https://github.com/angular/angular/issues/22734)



<a name="4.4.7"></a>
## [4.4.7](https://github.com/angular/angular/compare/4.4.6...4.4.7) (2018-04-16)


### Bug Fixes

* **core:** use appropriate inert document strategy for Firefox & Safari ([#22077](https://github.com/angular/angular/issues/22077)) ([2c5cf19](https://github.com/angular/angular/commit/2c5cf19))



<a name="5.2.9"></a>
## [5.2.9](https://github.com/angular/angular/compare/5.2.8...5.2.9) (2018-03-14)


### Bug Fixes

* **platform-server:** add styles to elements correctly ([#22527](https://github.com/angular/angular/issues/22527)) ([fc6dfc2](https://github.com/angular/angular/commit/fc6dfc2))
* **router:** correct over-encoding of URL fragment ([#22687](https://github.com/angular/angular/issues/22687)) ([86517f2](https://github.com/angular/angular/commit/86517f2))



<a name="5.2.8"></a>
## [5.2.8](https://github.com/angular/angular/compare/5.2.7...5.2.8) (2018-03-07)


### Bug Fixes

* **platform-server:** generate correct stylings for camel case names ([#22263](https://github.com/angular/angular/issues/22263)) ([de02a7a](https://github.com/angular/angular/commit/de02a7a)), closes [#19235](https://github.com/angular/angular/issues/19235)
* **router:** don't mutate route configs ([#22358](https://github.com/angular/angular/issues/22358)) ([8f0a064](https://github.com/angular/angular/commit/8f0a064)), closes [#22203](https://github.com/angular/angular/issues/22203)
* **router:** fix URL serialization so special characters are only encoded where needed ([#22337](https://github.com/angular/angular/issues/22337)) ([789a47e](https://github.com/angular/angular/commit/789a47e)), closes [#10280](https://github.com/angular/angular/issues/10280)
* **upgrade:** correctly destroy nested downgraded component ([#22400](https://github.com/angular/angular/issues/22400)) ([4aef9de](https://github.com/angular/angular/commit/4aef9de)), closes [#22392](https://github.com/angular/angular/issues/22392)
* **upgrade:** correctly handle `=` bindings in `[@angular](https://github.com/angular)/upgrade` ([#22167](https://github.com/angular/angular/issues/22167)) ([6638390](https://github.com/angular/angular/commit/6638390))
* **upgrade:** fix empty transclusion content with AngularJS@>=1.5.8 ([#22167](https://github.com/angular/angular/issues/22167)) ([a9a0e27](https://github.com/angular/angular/commit/a9a0e27)), closes [#22175](https://github.com/angular/angular/issues/22175)



<a name="5.2.7"></a>
## [5.2.7](https://github.com/angular/angular/compare/5.2.6...5.2.7) (2018-02-28)


### Bug Fixes

* **platform-server:** generate correct stylings for camel case names ([#22263](https://github.com/angular/angular/issues/22263)) ([de02a7a](https://github.com/angular/angular/commit/de02a7a)), closes [#19235](https://github.com/angular/angular/issues/19235)
* **router:** don't mutate route configs ([#22358](https://github.com/angular/angular/issues/22358)) ([8f0a064](https://github.com/angular/angular/commit/8f0a064)), closes [#22203](https://github.com/angular/angular/issues/22203)
* **upgrade:** correctly destroy nested downgraded component ([#22400](https://github.com/angular/angular/issues/22400)) ([4aef9de](https://github.com/angular/angular/commit/4aef9de)), closes [#22392](https://github.com/angular/angular/issues/22392)
* **upgrade:** correctly handle `=` bindings in `[@angular](https://github.com/angular)/upgrade` ([#22167](https://github.com/angular/angular/issues/22167)) ([6638390](https://github.com/angular/angular/commit/6638390))
* **upgrade:** fix empty transclusion content with AngularJS@>=1.5.8 ([#22167](https://github.com/angular/angular/issues/22167)) ([a9a0e27](https://github.com/angular/angular/commit/a9a0e27)), closes [#22175](https://github.com/angular/angular/issues/22175)



<a name="5.2.6"></a>
## [5.2.6](https://github.com/angular/angular/compare/5.2.5...5.2.6) (2018-02-22)

### Bug Fixes

* **common:** correct mapping of Observable methods ([#20518](https://github.com/angular/angular/issues/20518)) ([ce5e8fa](https://github.com/angular/angular/commit/ce5e8fa)), closes [#20516](https://github.com/angular/angular/issues/20516)
* **common:** then and else template might be set to null ([#22298](https://github.com/angular/angular/issues/22298)) ([af6a056](https://github.com/angular/angular/commit/af6a056))
* **compiler-cli:** add missing entry point to package, update tsickle ([#22295](https://github.com/angular/angular/issues/22295)) ([c5418c7](https://github.com/angular/angular/commit/c5418c7))
* **core:** properly handle function without prototype in reflector ([#22284](https://github.com/angular/angular/issues/22284)) ([5ec38f2](https://github.com/angular/angular/commit/5ec38f2)), closes [#19978](https://github.com/angular/angular/issues/19978)
* **core:** support metadata reflection for native class types ([#22356](https://github.com/angular/angular/issues/22356)) ([ee91de9](https://github.com/angular/angular/commit/ee91de9)), closes [#21731](https://github.com/angular/angular/issues/21731)



<a name="5.2.5"></a>
## [5.2.5](https://github.com/angular/angular/compare/5.2.4...5.2.5) (2018-02-14)

### Bug Fixes

* **aio:** update Firebase redirects and SW routes ([#21763](https://github.com/angular/angular/pull/21763)) ([#22104](https://github.com/angular/angular/pull/22104)) ([15ff7ba](https://github.com/angular/angular/commit/15ff7ba)), closes [#21377](https://github.com/angular/angular/issues/21377)
* **bazel:** allow TS to read ambient typings ([#21876](https://github.com/angular/angular/issues/21876)) ([d57fd0b](https://github.com/angular/angular/commit/d57fd0b)), closes [#21872](https://github.com/angular/angular/issues/21872)
* **bazel:** improve error message for missing assets ([#22096](https://github.com/angular/angular/issues/22096)) ([c5ec8d9](https://github.com/angular/angular/commit/c5ec8d9)), closes [#22095](https://github.com/angular/angular/issues/22095)
* **common:** weaken AsyncPipe transform signature ([#22169](https://github.com/angular/angular/issues/22169)) ([c6bdc83](https://github.com/angular/angular/commit/c6bdc83))
* **compiler:** make unary plus operator consistent to JavaScript ([#22154](https://github.com/angular/angular/issues/22154)) ([1b8ea10](https://github.com/angular/angular/commit/1b8ea10)), closes [#22089](https://github.com/angular/angular/issues/22089)
* **core:** add stacktrace in log when error during cleanup component in TestBed ([#22162](https://github.com/angular/angular/issues/22162)) ([c4f841f](https://github.com/angular/angular/commit/c4f841f))
* **core:** ensure initial value of QueryList length ([#21980](https://github.com/angular/angular/issues/21980)) ([#21982](https://github.com/angular/angular/issues/21982)) ([47b73fd](https://github.com/angular/angular/commit/47b73fd)), closes [#21980](https://github.com/angular/angular/issues/21980)
* **core:** use appropriate inert document strategy for Firefox & Safari ([#17019](https://github.com/angular/angular/issues/17019)) ([47b71d9](https://github.com/angular/angular/commit/47b71d9))
* **forms:** prevent event emission on enable/disable when emitEvent is false ([#12366](https://github.com/angular/angular/issues/12366)) ([#21018](https://github.com/angular/angular/issues/21018)) ([56b9591](https://github.com/angular/angular/commit/56b9591))
* **language-service:** correct instructions to install the language service ([#22000](https://github.com/angular/angular/issues/22000)) ([0b23573](https://github.com/angular/angular/commit/0b23573))
* **platform-browser:** support 0/false/null values in transfer_state ([#22179](https://github.com/angular/angular/issues/22179)) ([da6ab91](https://github.com/angular/angular/commit/da6ab91))



<a name="5.2.4"></a>
## [5.2.4](https://github.com/angular/angular/compare/5.2.3...5.2.4) (2018-02-07)


### Bug Fixes

* **common:** don't convert null to a string when flushing a mock request ([#21417](https://github.com/angular/angular/issues/21417)) ([c4fb696](https://github.com/angular/angular/commit/c4fb696)), closes [#20744](https://github.com/angular/angular/issues/20744)
* **core:** fix [#20582](https://github.com/angular/angular/issues/20582), don't need to wrap zone in location change listener ([#22007](https://github.com/angular/angular/issues/22007)) ([ce51ea9](https://github.com/angular/angular/commit/ce51ea9))
* **core:** fix proper propagation of subscriptions in EventEmitter ([#22016](https://github.com/angular/angular/issues/22016)) ([c6645e7](https://github.com/angular/angular/commit/c6645e7)), closes [#21999](https://github.com/angular/angular/issues/21999)
* **core:** should check Zone existence when scheduleMicroTask ([#20656](https://github.com/angular/angular/issues/20656)) ([aa9ba7f](https://github.com/angular/angular/commit/aa9ba7f))



<a name="5.2.3"></a>
## [5.2.3](https://github.com/angular/angular/compare/5.2.2...5.2.3) (2018-01-31)


### Bug Fixes

* **common:** allow HttpInterceptors to inject HttpClient ([#19809](https://github.com/angular/angular/issues/19809)) ([ed2b717](https://github.com/angular/angular/commit/ed2b717)), closes [#18224](https://github.com/angular/angular/issues/18224)
* **common:** generate closure-locale data file with exported plural functions ([#21873](https://github.com/angular/angular/issues/21873)) ([c2f5ed5](https://github.com/angular/angular/commit/c2f5ed5)), closes [#21870](https://github.com/angular/angular/issues/21870)
* **core:** fix retrieving the binding name when an expression changes ([#21814](https://github.com/angular/angular/issues/21814)) ([81d64d6](https://github.com/angular/angular/commit/81d64d6)), closes [#21735](https://github.com/angular/angular/issues/21735) [#21788](https://github.com/angular/angular/issues/21788)
* **forms:** allow FormBuilder to create controls with any formState type ([#20917](https://github.com/angular/angular/issues/20917)) ([56f3e18](https://github.com/angular/angular/commit/56f3e18)), closes [#20368](https://github.com/angular/angular/issues/20368)
* **forms:** inserting and removing controls should work in re-bound form arrays ([#21822](https://github.com/angular/angular/issues/21822)) ([fad99cc](https://github.com/angular/angular/commit/fad99cc)), closes [#21501](https://github.com/angular/angular/issues/21501)
* **language-service:** ensure correct paths are passed to TypeScript ([#21812](https://github.com/angular/angular/issues/21812)) ([250c8da](https://github.com/angular/angular/commit/250c8da))
* **language-service:** spell diagnostics correctly ([#21812](https://github.com/angular/angular/issues/21812)) ([778e6e7](https://github.com/angular/angular/commit/778e6e7))
* **router:** remove [@internal](https://github.com/internal) tag on ParamInheritanceType ([#21773](https://github.com/angular/angular/issues/21773)) ([35a0721](https://github.com/angular/angular/commit/35a0721)), closes [#21456](https://github.com/angular/angular/issues/21456)



<a name="5.2.2"></a>
## [5.2.2](https://github.com/angular/angular/compare/5.2.1...5.2.2) (2018-01-25)


### Bug Fixes

* **common:** A null value should remove the style on IE ([#21679](https://github.com/angular/angular/issues/21679)) ([c12ea3a](https://github.com/angular/angular/commit/c12ea3a)), closes [#21064](https://github.com/angular/angular/issues/21064)
* **common:** don't remove special characters when extracting CLDR data ([#21626](https://github.com/angular/angular/issues/21626)) ([a62c186](https://github.com/angular/angular/commit/a62c186))
* **common:** extract plural function from i18n locale data files for TS 2.6 ([#21626](https://github.com/angular/angular/issues/21626)) ([71f9eaa](https://github.com/angular/angular/commit/71f9eaa)), closes [#21608](https://github.com/angular/angular/issues/21608)
* **common:** fallback to last defined value for named date and time formats ([#21299](https://github.com/angular/angular/issues/21299)) ([982eb7b](https://github.com/angular/angular/commit/982eb7b)), closes [#21282](https://github.com/angular/angular/issues/21282)
* **compiler:** add support for marker tags in xliff serializers ([#21250](https://github.com/angular/angular/issues/21250)) ([02352bc](https://github.com/angular/angular/commit/02352bc)), closes [#21078](https://github.com/angular/angular/issues/21078)
* **compiler:** Don't strip `/*# sourceURL ... */` ([#16088](https://github.com/angular/angular/issues/16088)) ([de6c644](https://github.com/angular/angular/commit/de6c644))
* **compiler:** fix ICU select messages to use male/female/other ([#21713](https://github.com/angular/angular/issues/21713)) ([8e44577](https://github.com/angular/angular/commit/8e44577))
* **compiler-cli:** do not fold errors past calls in the collector ([#21708](https://github.com/angular/angular/issues/21708)) ([52970c0](https://github.com/angular/angular/commit/52970c0))
* **compiler-cli:** do not lower expressions in non-modules ([#21649](https://github.com/angular/angular/issues/21649)) ([ba4ea82](https://github.com/angular/angular/commit/ba4ea82))
* **router:** don't use ParamsInheritanceStrategy in declarations ([#21574](https://github.com/angular/angular/issues/21574)) ([8b3fbb5](https://github.com/angular/angular/commit/8b3fbb5)), closes [#21456](https://github.com/angular/angular/issues/21456)



<a name="5.2.1"></a>
## [5.2.1](https://github.com/angular/angular/compare/5.2.0...5.2.1) (2018-01-17)


### Bug Fixes

* **animations:** fix increment/decrement aliases example ([#18323](https://github.com/angular/angular/issues/18323)) ([48c1898](https://github.com/angular/angular/commit/48c1898))
* **benchpress:** should still support selenium_webdriver < 3.6.0 ([#21477](https://github.com/angular/angular/issues/21477)) ([3c6a506](https://github.com/angular/angular/commit/3c6a506))
* **common:** set correct timezone for ISO8601 dates in Safari ([#21506](https://github.com/angular/angular/issues/21506)) ([8e9cd57](https://github.com/angular/angular/commit/8e9cd57)), closes [#21491](https://github.com/angular/angular/issues/21491)
* **compiler:** cache external reference resolution ([#21359](https://github.com/angular/angular/issues/21359)) ([c32e833](https://github.com/angular/angular/commit/c32e833))
* **compiler:** make `.ngsummary.json` files idempotent ([#21448](https://github.com/angular/angular/issues/21448)) ([a931a41](https://github.com/angular/angular/commit/a931a41))
* **core:** fix chained http call ([#20924](https://github.com/angular/angular/issues/20924)) ([54e7576](https://github.com/angular/angular/commit/54e7576)), closes [#20921](https://github.com/angular/angular/issues/20921)
* **language-service:** Clear caches when program changes ([#21337](https://github.com/angular/angular/issues/21337)) ([cc9419d](https://github.com/angular/angular/commit/cc9419d)), closes [#19405](https://github.com/angular/angular/issues/19405)
* **service-worker:** properly handle invalid hashes in all scenarios ([#21288](https://github.com/angular/angular/issues/21288)) ([51eb3d4](https://github.com/angular/angular/commit/51eb3d4))


### Features

* **core:** add binding name to content changed error ([#20352](https://github.com/angular/angular/issues/20352)) ([4556532](https://github.com/angular/angular/commit/4556532))
* **forms:** handle string with and without line boundary on pattern validator ([#19256](https://github.com/angular/angular/issues/19256)) ([75f8522](https://github.com/angular/angular/commit/75f8522))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/angular/angular/compare/5.2.0-rc.0...5.2.0) (2018-01-10)


### Bug Fixes

* **bazel:** Give correct module names for ES6 output ([#21320](https://github.com/angular/angular/issues/21320)) ([9728dce](https://github.com/angular/angular/commit/9728dce)), closes [#21022](https://github.com/angular/angular/issues/21022)
* **benchpress:** forward compat with selenium_webdriver 3.6.0 ([#21399](https://github.com/angular/angular/issues/21399)) ([6040ee3](https://github.com/angular/angular/commit/6040ee3))
* **benchpress:** work around missing events from Chrome 63 ([#21396](https://github.com/angular/angular/issues/21396)) ([fa03ae1](https://github.com/angular/angular/commit/fa03ae1))
* **common:** export currencies via `getCurrencySymbol` ([#20983](https://github.com/angular/angular/issues/20983)) ([fecf768](https://github.com/angular/angular/commit/fecf768))

Note: Due to an animation fix back in 5.1.1 ([c2b3792](https://github.com/angular/angular/commit/c2b3792a3b5fa5215fe2ef7e0ac6511086ffe4c1)) which allows for nested :leave queries to work within animation sequences, all elements that are dynamically inserted (*ngIf, *ngFor, etc…) now contain the special CSS class: “ng-star-inserted”. This may cause failures within unit tests if there are any assertions that match against element.className directly. (An easy fix for this is to match using a regular expression instead of asserting the className string directly.)

<a name="5.2.0-rc.0"></a>
# [5.2.0-rc.0](https://github.com/angular/angular/compare/5.2.0-beta.1...5.2.0-rc.0) (2018-01-04)


### Bug Fixes

* **animations:** avoid infinite loop with multiple blocked sub triggers ([#21119](https://github.com/angular/angular/issues/21119)) ([86a36ea](https://github.com/angular/angular/commit/86a36ea))
* **animations:** renaming issue with DOMAnimation. ([#21125](https://github.com/angular/angular/issues/21125)) ([871ece6](https://github.com/angular/angular/commit/871ece6))
* **common:** handle JS floating point errors in percent pipe ([#20329](https://github.com/angular/angular/issues/20329)) ([07b81ae](https://github.com/angular/angular/commit/07b81ae)), closes [#20136](https://github.com/angular/angular/issues/20136)
* **language-service:** ignore null metadatas ([#20557](https://github.com/angular/angular/issues/20557)) ([3e47ea2](https://github.com/angular/angular/commit/3e47ea2)), closes [#20260](https://github.com/angular/angular/issues/20260)
* **router:** fix wildcard route with lazy loaded module (again) ([#18139](https://github.com/angular/angular/issues/18139)) ([5ba1cf1](https://github.com/angular/angular/commit/5ba1cf1)), closes [#13848](https://github.com/angular/angular/issues/13848)



<a name="5.1.3"></a>
## [5.1.3](https://github.com/angular/angular/compare/5.1.2...5.1.3) (2018-01-03)


### Bug Fixes

* **animations:** avoid infinite loop with multiple blocked sub triggers ([#21119](https://github.com/angular/angular/issues/21119)) ([3e34fa8](https://github.com/angular/angular/commit/3e34fa8))
* **animations:** renaming issue with DOMAnimation. ([#21125](https://github.com/angular/angular/issues/21125)) ([d1f4500](https://github.com/angular/angular/commit/d1f4500))
* **common:** handle JS floating point errors in percent pipe ([#20329](https://github.com/angular/angular/issues/20329)) ([fa0e8ef](https://github.com/angular/angular/commit/fa0e8ef)), closes [#20136](https://github.com/angular/angular/issues/20136)
* **language-service:** ignore null metadatas ([#20557](https://github.com/angular/angular/issues/20557)) ([48a1f32](https://github.com/angular/angular/commit/48a1f32)), closes [#20260](https://github.com/angular/angular/issues/20260)
* **router:** fix wildcard route with lazy loaded module (again) ([#18139](https://github.com/angular/angular/issues/18139)) ([8c99175](https://github.com/angular/angular/commit/8c99175)), closes [#13848](https://github.com/angular/angular/issues/13848)


<a name="5.2.0-beta.1"></a>
# [5.2.0-beta.1](https://github.com/angular/angular/compare/5.2.0-beta.0...5.2.0-beta.1) (2017-12-20)


### Bug Fixes

* **compiler:** generate the correct imports for summary type-check ([d91ff17](https://github.com/angular/angular/commit/d91ff17))
* **forms:** avoid producing an error with hostBindingTypeCheck ([d213a20](https://github.com/angular/angular/commit/d213a20))


### Features

* **compiler:** allow ngIf to use the ngIf expression directly as a guard ([82bcd83](https://github.com/angular/angular/commit/82bcd83))
* **router:** add "paramsInheritanceStrategy" router configuration option ([5efea2f](https://github.com/angular/angular/commit/5efea2f)), closes [#20572](https://github.com/angular/angular/issues/20572)



<a name="5.1.2"></a>
## [5.1.2](https://github.com/angular/angular/compare/5.1.1...5.1.2) (2017-12-20)


### Bug Fixes

* **common:** fix a Closure compilation issue. ([267ebf3](https://github.com/angular/angular/commit/267ebf3))
* **compiler:** make tsx file aot compatible ([756dd34](https://github.com/angular/angular/commit/756dd34)), closes [#20555](https://github.com/angular/angular/issues/20555)
* **compiler:** report an error for recursive module references ([ced575f](https://github.com/angular/angular/commit/ced575f))
* **compiler-cli:** do not emit invalid .metadata.json files ([a1d4c2d](https://github.com/angular/angular/commit/a1d4c2d))
* **compiler-cli:** do not force type checking on .js files ([3b63e16](https://github.com/angular/angular/commit/3b63e16))
* **service-worker:** check for updates on navigation ([a33182c](https://github.com/angular/angular/commit/a33182c)), closes [#20877](https://github.com/angular/angular/issues/20877)
* **upgrade:** replaces get/setAngularLib with get/setAngularJSGlobal ([66cc2fa](https://github.com/angular/angular/commit/66cc2fa))



<a name="5.2.0-beta.0"></a>
# [5.2.0-beta.0](https://github.com/angular/angular/compare/5.1.0...5.2.0-beta.0) (2017-12-13)


### Features

* **animations:** re-introduce support for transition matching functions ([#20723](https://github.com/angular/angular/issues/20723)) ([590d93b](https://github.com/angular/angular/commit/590d93b)), closes [#18959](https://github.com/angular/angular/issues/18959)
* **compiler:** add a pseudo $any() function to disable type checking ([#20876](https://github.com/angular/angular/issues/20876)) ([70cd124](https://github.com/angular/angular/commit/70cd124))
* **compiler:** narrow types of expressions used in *ngIf ([#20702](https://github.com/angular/angular/issues/20702)) ([e7d9cb3](https://github.com/angular/angular/commit/e7d9cb3))
* **core:** add source to `StaticInjectorError` message ([#20817](https://github.com/angular/angular/issues/20817)) ([b7738e1](https://github.com/angular/angular/commit/b7738e1)), closes [#19302](https://github.com/angular/angular/issues/19302)
* **forms:** allow nulls on setAsyncValidators ([#20327](https://github.com/angular/angular/issues/20327)) ([d41d2c4](https://github.com/angular/angular/commit/d41d2c4)), closes [#20296](https://github.com/angular/angular/issues/20296)



<a name="5.1.1"></a>
## [5.1.1](https://github.com/angular/angular/compare/5.1.0...5.1.1) (2017-12-13)


### Bug Fixes

* **animations:** ensure multi-level route leave animations are queryable ([#20787](https://github.com/angular/angular/issues/20787)) ([d09d497](https://github.com/angular/angular/commit/d09d497)), closes [#19807](https://github.com/angular/angular/issues/19807)
* **animations:** ensure the web-animations driver properly handles empty keyframes ([#20648](https://github.com/angular/angular/issues/20648)) ([c3e8731](https://github.com/angular/angular/commit/c3e8731)), closes [#15858](https://github.com/angular/angular/issues/15858)
* **animations:** properly recover and cleanup DOM when CD failures occur ([#20719](https://github.com/angular/angular/issues/20719)) ([e6a2805](https://github.com/angular/angular/commit/e6a2805)), closes [#19093](https://github.com/angular/angular/issues/19093)
* **animations:** support webkit-based vendor prefixes for prop validations ([#19055](https://github.com/angular/angular/issues/19055)) ([501f01e](https://github.com/angular/angular/commit/501f01e)), closes [#18921](https://github.com/angular/angular/issues/18921)
* **bazel:** don't equate moduleName with fileName ([#20895](https://github.com/angular/angular/issues/20895)) ([0c9f7b0](https://github.com/angular/angular/commit/0c9f7b0))
* **compiler:** support referencing enums in namespaces ([#20947](https://github.com/angular/angular/issues/20947)) ([d6da798](https://github.com/angular/angular/commit/d6da798)), closes [#18170](https://github.com/angular/angular/issues/18170)
* **compiler-cli:** disable checkTypes in emit. ([#20828](https://github.com/angular/angular/issues/20828)) ([160a154](https://github.com/angular/angular/commit/160a154))
* **compiler-cli:** fix swallowed Error messages ([#20846](https://github.com/angular/angular/issues/20846)) ([6727336](https://github.com/angular/angular/commit/6727336))
* **compiler-cli:** merge [@fileoverview](https://github.com/fileoverview) comments. ([#20870](https://github.com/angular/angular/issues/20870)) ([be9a737](https://github.com/angular/angular/commit/be9a737))
* **router:** NavigationError and NavigationCancel should be emitted after resetting the URL ([#20803](https://github.com/angular/angular/issues/20803)) ([baeec4d](https://github.com/angular/angular/commit/baeec4d))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/angular/angular/compare/5.1.0-rc.1...5.1.0) (2017-12-06)


### Bug Fixes

* **animations:** ensure DOM is cleaned up after multiple [@trigger](https://github.com/trigger) leave animations finish ([#20740](https://github.com/angular/angular/issues/20740)) ([b78ada1](https://github.com/angular/angular/commit/b78ada1)), closes [#20541](https://github.com/angular/angular/issues/20541)
* **service-worker:** initialize in browser only ([#20782](https://github.com/angular/angular/issues/20782)) ([7cabaa0](https://github.com/angular/angular/commit/7cabaa0)), closes [#20360](https://github.com/angular/angular/issues/20360)
* **service-worker:** esm2015 points to wrong path ([#20800](https://github.com/angular/angular/issues/20800)) ([da3563c](https://github.com/angular/angular/commit/da3563c))



<a name="5.1.0-rc.1"></a>
# [5.1.0-rc.1](https://github.com/angular/angular/compare/5.1.0-rc.0...5.1.0-rc.1) (2017-12-01)


### Bug Fixes

* **compiler-cli:** propagate ts.SourceFile moduleName into metadata ([f841fbe](https://github.com/angular/angular/commit/f841fbe))
* **service-worker:** allow disabling SW while still using services ([65f4fad](https://github.com/angular/angular/commit/65f4fad))
* **service-worker:** don't crash if SW not supported ([b9a91a5](https://github.com/angular/angular/commit/b9a91a5))
* **service-worker:** send initialization signal from the application ([3fbcde9](https://github.com/angular/angular/commit/3fbcde9))
* **service-worker:** use relative path for ngsw.json ([f582620](https://github.com/angular/angular/commit/f582620))



<a name="5.0.5"></a>
## [5.0.5](https://github.com/angular/angular/compare/5.0.4...5.0.5) (2017-12-01)


### Bug Fixes

* **compiler-cli:** propagate ts.SourceFile moduleName into metadata ([a2ff4ab](https://github.com/angular/angular/commit/a2ff4ab))
* **service-worker:** allow disabling SW while still using services ([f99335b](https://github.com/angular/angular/commit/f99335b))
* **service-worker:** don't crash if SW not supported ([ee37d4b](https://github.com/angular/angular/commit/ee37d4b))
* **service-worker:** send initialization signal from the application ([6bf07b4](https://github.com/angular/angular/commit/6bf07b4))
* **service-worker:** use relative path for ngsw.json ([56c98f7](https://github.com/angular/angular/commit/56c98f7))



<a name="5.1.0-rc.0"></a>
# [5.1.0-rc.0](https://github.com/angular/angular/compare/5.1.0-beta.2...5.1.0-rc.0) (2017-12-01)


### Bug Fixes

* **animations:** ensure multi-level enter animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([dd6237e](https://github.com/angular/angular/commit/dd6237e))
* **animations:** ensure multi-level enter animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([b2a586c](https://github.com/angular/angular/commit/b2a586c))
* **animations:** ensure multi-level leave animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([1366762](https://github.com/angular/angular/commit/1366762))
* **animations:** ensure multi-level leave animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([c2b3792](https://github.com/angular/angular/commit/c2b3792))
* **bazel:** produce named AMD modules for codegen ([#20547](https://github.com/angular/angular/issues/20547)) ([6e83204](https://github.com/angular/angular/commit/6e83204)), closes [#19422](https://github.com/angular/angular/issues/19422)
* **common:** accept falsy values as HTTP bodies ([#19958](https://github.com/angular/angular/issues/19958)) ([15a54df](https://github.com/angular/angular/commit/15a54df)), closes [#19825](https://github.com/angular/angular/issues/19825) [#19195](https://github.com/angular/angular/issues/19195)
* **common:** don't strip XSSI prefix for if error isn't JSON ([#19958](https://github.com/angular/angular/issues/19958)) ([aafa75d](https://github.com/angular/angular/commit/aafa75d))
* **common:** remove useless guard in HttpClient ([#19958](https://github.com/angular/angular/issues/19958)) ([eb01ad5](https://github.com/angular/angular/commit/eb01ad5)), closes [#19223](https://github.com/angular/angular/issues/19223)
* **common:** treat an empty body as null when parsing JSON in HttpClient ([#19958](https://github.com/angular/angular/issues/19958)) ([503be69](https://github.com/angular/angular/commit/503be69)), closes [#18680](https://github.com/angular/angular/issues/18680) [#19413](https://github.com/angular/angular/issues/19413) [#19502](https://github.com/angular/angular/issues/19502) [#19555](https://github.com/angular/angular/issues/19555)
* **compiler:** correctly detect when to serialze summary metadata ([#20668](https://github.com/angular/angular/issues/20668)) ([8bb42df](https://github.com/angular/angular/commit/8bb42df))
* **compiler-cli:** fix memory leak in program creation ([#20692](https://github.com/angular/angular/issues/20692)) ([71e5de6](https://github.com/angular/angular/commit/71e5de6)), closes [#20691](https://github.com/angular/angular/issues/20691)
* **compiler-cli:** normalize sourcepaths for i18n extracted files ([#20417](https://github.com/angular/angular/issues/20417)) ([de78307](https://github.com/angular/angular/commit/de78307)), closes [#20416](https://github.com/angular/angular/issues/20416)
* **core:** should use native addEventListener in ngZone ([#20672](https://github.com/angular/angular/issues/20672)) ([65a2cb8](https://github.com/angular/angular/commit/65a2cb8))
* **language-service:** Allow empty templates ([#20651](https://github.com/angular/angular/issues/20651)) ([3203069](https://github.com/angular/angular/commit/3203069)), closes [#19406](https://github.com/angular/angular/issues/19406)
* **language-service:** Fix crash when no script files are found ([#20550](https://github.com/angular/angular/issues/20550)) ([54bfe14](https://github.com/angular/angular/commit/54bfe14)), closes [#19325](https://github.com/angular/angular/issues/19325)


### Features

* **common:** add locale id parameter to `registerLocaleData` ([#20623](https://github.com/angular/angular/issues/20623)) ([24bf3e2](https://github.com/angular/angular/commit/24bf3e2))
* **compiler-cli:** improve error messages produced during structural errors ([#20459](https://github.com/angular/angular/issues/20459)) ([8ecda94](https://github.com/angular/angular/commit/8ecda94))



<a name="5.0.4"></a>
## [5.0.4](https://github.com/angular/angular/compare/5.0.3...5.0.4) (2017-12-01)


### Bug Fixes

* **animations:** ensure multi-level enter animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([22bbd6e](https://github.com/angular/angular/commit/22bbd6e))
* **animations:** ensure multi-level leave animations work ([#19455](https://github.com/angular/angular/issues/19455)) ([c7b211c](https://github.com/angular/angular/commit/c7b211c))
* **common:** accept falsy values as HTTP bodies ([#19958](https://github.com/angular/angular/issues/19958)) ([66fd1f8](https://github.com/angular/angular/commit/66fd1f8)), closes [#19825](https://github.com/angular/angular/issues/19825) [#19195](https://github.com/angular/angular/issues/19195)
* **common:** don't strip XSSI prefix for if error isn't JSON ([#19958](https://github.com/angular/angular/issues/19958)) ([ead7596](https://github.com/angular/angular/commit/ead7596))
* **common:** remove useless guard in HttpClient ([#19958](https://github.com/angular/angular/issues/19958)) ([e099911](https://github.com/angular/angular/commit/e099911)), closes [#19223](https://github.com/angular/angular/issues/19223)
* **common:** treat an empty body as null when parsing JSON in HttpClient ([#19958](https://github.com/angular/angular/issues/19958)) ([bdaee50](https://github.com/angular/angular/commit/bdaee50)), closes [#18680](https://github.com/angular/angular/issues/18680) [#19413](https://github.com/angular/angular/issues/19413) [#19502](https://github.com/angular/angular/issues/19502) [#19555](https://github.com/angular/angular/issues/19555)
* **compiler-cli:** fix memory leak in program creation ([#20692](https://github.com/angular/angular/issues/20692)) ([38be44d](https://github.com/angular/angular/commit/38be44d)), closes [#20691](https://github.com/angular/angular/issues/20691)
* **compiler-cli:** normalize sourcepaths for i18n extracted files ([#20417](https://github.com/angular/angular/issues/20417)) ([2b0c896](https://github.com/angular/angular/commit/2b0c896)), closes [#20416](https://github.com/angular/angular/issues/20416)



<a name="5.1.0-beta.2"></a>
# [5.1.0-beta.2](https://github.com/angular/angular/compare/5.1.0-beta.1...5.1.0-beta.2) (2017-11-22)


### Bug Fixes

* **animations:** always fire inner trigger callbacks even if blocked by parent animations ([#19753](https://github.com/angular/angular/issues/19753)) ([0e012c9](https://github.com/angular/angular/commit/0e012c9)), closes [#19100](https://github.com/angular/angular/issues/19100)
* **animations:** always fire start and done callbacks in order for noop animations ([#20570](https://github.com/angular/angular/issues/20570)) ([ffb6dbe](https://github.com/angular/angular/commit/ffb6dbe))
* **animations:** validate against trigger() names that use @ symbols ([#20326](https://github.com/angular/angular/issues/20326)) ([1861e41](https://github.com/angular/angular/commit/1861e41))
* **benchpress:** Allow ignoring navigationStart events in perflog metric. ([#20312](https://github.com/angular/angular/issues/20312)) ([717ac5a](https://github.com/angular/angular/commit/717ac5a))
* **common:** return ISubscription from Location.subscribe() ([#20429](https://github.com/angular/angular/issues/20429)) ([437a044](https://github.com/angular/angular/commit/437a044)), closes [#20406](https://github.com/angular/angular/issues/20406)
* **compiler:** emit correct type-check-blocks with TemplateRef's ([#20463](https://github.com/angular/angular/issues/20463)) ([68b53c0](https://github.com/angular/angular/commit/68b53c0))
* **compiler:** support event bindings in `fullTemplateTypeCheck` ([#20490](https://github.com/angular/angular/issues/20490)) ([4ed0439](https://github.com/angular/angular/commit/4ed0439))
* **core:** fix [#20532](https://github.com/angular/angular/issues/20532), should be able to cancel listener from mixed zone ([#20538](https://github.com/angular/angular/issues/20538)) ([a740e4f](https://github.com/angular/angular/commit/a740e4f))
* **core:** should support event.stopImmediatePropagation ([#20469](https://github.com/angular/angular/issues/20469)) ([997336b](https://github.com/angular/angular/commit/997336b))
* **forms:** updateOn should check if change occurred ([#20358](https://github.com/angular/angular/issues/20358)) ([69c53c3](https://github.com/angular/angular/commit/69c53c3)), closes [#20259](https://github.com/angular/angular/issues/20259)


### Features

* **platform-browser-dynamic:** export `JitCompilerFactory` ([#20478](https://github.com/angular/angular/issues/20478)) ([d7a727c](https://github.com/angular/angular/commit/d7a727c)), closes [#20125](https://github.com/angular/angular/issues/20125)



<a name="5.0.3"></a>
## [5.0.3](https://github.com/angular/angular/compare/5.0.2...5.0.3) (2017-11-22)


### Bug Fixes

* **animations:** always fire inner trigger callbacks even if blocked by parent animations ([#19753](https://github.com/angular/angular/issues/19753)) ([814f062](https://github.com/angular/angular/commit/814f062)), closes [#19100](https://github.com/angular/angular/issues/19100)
* **animations:** validate against trigger() names that use @ symbols ([#20326](https://github.com/angular/angular/issues/20326)) ([15795d0](https://github.com/angular/angular/commit/15795d0))
* **benchpress:** Allow ignoring navigationStart events in perflog metric. ([#20312](https://github.com/angular/angular/issues/20312)) ([9ca6ee9](https://github.com/angular/angular/commit/9ca6ee9))
* **common:** return ISubscription from Location.subscribe() ([#20429](https://github.com/angular/angular/issues/20429)) ([bc904b1](https://github.com/angular/angular/commit/bc904b1)), closes [#20406](https://github.com/angular/angular/issues/20406)
* **compiler:** emit correct type-check-blocks with TemplateRef's ([#20463](https://github.com/angular/angular/issues/20463)) ([81f1d42](https://github.com/angular/angular/commit/81f1d42))
* **compiler:** support event bindings in `fullTemplateTypeCheck` ([#20490](https://github.com/angular/angular/issues/20490)) ([b53ead4](https://github.com/angular/angular/commit/b53ead4))
* **core:** fix [#20532](https://github.com/angular/angular/issues/20532), should be able to cancel listener from mixed zone ([#20538](https://github.com/angular/angular/issues/20538)) ([0feba49](https://github.com/angular/angular/commit/0feba49))
* **core:** should support event.stopImmediatePropagation ([#20469](https://github.com/angular/angular/issues/20469)) ([82aace6](https://github.com/angular/angular/commit/82aace6))
* **forms:** updateOn should check if change occurred ([#20358](https://github.com/angular/angular/issues/20358)) ([f9f2c20](https://github.com/angular/angular/commit/f9f2c20)), closes [#20259](https://github.com/angular/angular/issues/20259)


<a name="5.1.0-beta.1"></a>
# [5.1.0-beta.1](https://github.com/angular/angular/compare/5.1.0-beta.0...5.1.0-beta.1) (2017-11-16)


### Bug Fixes

* **animations:** always fire inner trigger callbacks even if blocked by parent animations ([#19753](https://github.com/angular/angular/issues/19753)) ([d47b2a6](https://github.com/angular/angular/commit/d47b2a6)), closes [#19100](https://github.com/angular/angular/issues/19100)
* **animations:** ensure final state() styles are applied within @.disabled animations ([#20267](https://github.com/angular/angular/issues/20267)) ([20aafff](https://github.com/angular/angular/commit/20aafff)), closes [#20266](https://github.com/angular/angular/issues/20266)
* **bazel:** adjust mock of tsconfig for ng_module rule unit test ([#20175](https://github.com/angular/angular/issues/20175)) ([c2a24b4](https://github.com/angular/angular/commit/c2a24b4))
* **compiler:** fix corner cases in shadow CSS ([c32f5fd](https://github.com/angular/angular/commit/c32f5fd))
* **compiler:** recognize @NgModule with a redundant @Injectable ([#20320](https://github.com/angular/angular/issues/20320)) ([c33a576](https://github.com/angular/angular/commit/c33a576))
* **compiler:** show explanatory text in template errors ([#20313](https://github.com/angular/angular/issues/20313)) ([3257fcd](https://github.com/angular/angular/commit/3257fcd))
* **core:** ensure init lifecycle events are called ([#20258](https://github.com/angular/angular/issues/20258)) ([24cf8b3](https://github.com/angular/angular/commit/24cf8b3))
* **language-service:** pass compilerOptions.paths to ReflectorHost ([#20222](https://github.com/angular/angular/issues/20222)) ([eb8013e](https://github.com/angular/angular/commit/eb8013e))
* **router:** 'merge' queryParamHandling strategy should be able to remove query params ([#19733](https://github.com/angular/angular/issues/19733)) ([a622e19](https://github.com/angular/angular/commit/a622e19)), closes [#18463](https://github.com/angular/angular/issues/18463) [#17202](https://github.com/angular/angular/issues/17202)
* Update test code to type-check under TS 2.5 ([#20175](https://github.com/angular/angular/issues/20175)) ([5ec1717](https://github.com/angular/angular/commit/5ec1717))

### Features

* **typescript:** support TypeScript 2.5 ([a9f3e2b](https://github.com/angular/angular/commit/a9f3e2b)), closes [#20175](https://github.com/angular/angular/issues/20175)

> Note, if you do `Injector.get(Token)` where `Token` has static members, you'll run into https://github.com/Microsoft/TypeScript/issues/20102 where the returned type is `{}` rather than `Token`. Use `Injector.get<Token>(Token)` to work around.

<a name="5.0.2"></a>
## [5.0.2](https://github.com/angular/angular/compare/5.0.1...5.0.2) (2017-11-16)


### Bug Fixes

* **animations:** ensure final state() styles are applied within @.disabled animations ([#20267](https://github.com/angular/angular/issues/20267)) ([8b1a6b1](https://github.com/angular/angular/commit/8b1a6b1)), closes [#20266](https://github.com/angular/angular/issues/20266)
* **compiler:** fix corner cases in shadow CSS ([5d1cd57](https://github.com/angular/angular/commit/5d1cd57))
* **compiler:** recognize @NgModule with a redundant @Injectable ([#20320](https://github.com/angular/angular/issues/20320)) ([4cc6abb](https://github.com/angular/angular/commit/4cc6abb))
* **compiler:** show explanatory text in template errors ([#20313](https://github.com/angular/angular/issues/20313)) ([424a323](https://github.com/angular/angular/commit/424a323))
* **router:** 'merge' queryParamHandling strategy should be able to remove query params ([#19733](https://github.com/angular/angular/issues/19733)) ([b732fb9](https://github.com/angular/angular/commit/b732fb9)), closes [#18463](https://github.com/angular/angular/issues/18463) [#17202](https://github.com/angular/angular/issues/17202)


<a name="5.1.0-beta.0"></a>
# [5.1.0-beta.0](https://github.com/angular/angular/compare/5.0.0-rc.4...5.1.0-beta.0) (2017-11-08)

### Bug Fixes

* **compiler:** don't overwrite missingTranslation's value in JIT ([#19952](https://github.com/angular/angular/issues/19952)) ([799cbb9](https://github.com/angular/angular/commit/799cbb9))
* **compiler:** report a reasonable error with invalid metadata ([#20062](https://github.com/angular/angular/issues/20062)) ([da22c48](https://github.com/angular/angular/commit/da22c48))
* **compiler-cli:** don't report emit diagnostics when `--noEmitOnError` is off ([#20063](https://github.com/angular/angular/issues/20063)) ([8639995](https://github.com/angular/angular/commit/8639995))
* **core:** `__symbol__` should return `__zone_symbol__` without zone.js loaded ([#19541](https://github.com/angular/angular/issues/19541)) ([678d1cf](https://github.com/angular/angular/commit/678d1cf))
* **core:** should support event.stopImmediatePropagation ([#19222](https://github.com/angular/angular/issues/19222)) ([7083791](https://github.com/angular/angular/commit/7083791))
* **platform-browser:** support Symbols in custom `jasmineToString()` method ([#19794](https://github.com/angular/angular/issues/19794)) ([5a6efa7](https://github.com/angular/angular/commit/5a6efa7))

### Features

* **compiler:** introduce `TestBed.overrideTemplateUsingTestingModule` ([a460066](https://github.com/angular/angular/commit/a460066)), closes [#19815](https://github.com/angular/angular/issues/19815)


<a name="5.0.1"></a>
## [5.0.1](https://github.com/angular/angular/compare/5.0.0...5.0.1) (2017-11-08)


### Bug Fixes

* **compiler:** don't overwrite missingTranslation's value in JIT ([#19952](https://github.com/angular/angular/issues/19952)) ([799cbb9](https://github.com/angular/angular/commit/799cbb9))
* **compiler:** report a reasonable error with invalid metadata ([#20062](https://github.com/angular/angular/issues/20062)) ([da22c48](https://github.com/angular/angular/commit/da22c48))
* **compiler-cli:** don't report emit diagnostics when `--noEmitOnError` is off ([#20063](https://github.com/angular/angular/issues/20063)) ([8639995](https://github.com/angular/angular/commit/8639995))
* **core:** `__symbol__` should return `__zone_symbol__` without zone.js loaded ([#19541](https://github.com/angular/angular/issues/19541)) ([678d1cf](https://github.com/angular/angular/commit/678d1cf))
* **core:** should support event.stopImmediatePropagation ([#19222](https://github.com/angular/angular/issues/19222)) ([7083791](https://github.com/angular/angular/commit/7083791))
* **platform-browser:** support Symbols in custom `jasmineToString()` method ([#19794](https://github.com/angular/angular/issues/19794)) ([5a6efa7](https://github.com/angular/angular/commit/5a6efa7))


<a name="5.0.0"></a>
# [5.0.0](https://github.com/angular/angular/compare/5.0.0-rc.9...5.0.0) pentagonal-donut (2017-11-01)

### Features

* **animations:** allow @.disabled property to work without an expression ([#18713](https://github.com/angular/angular/issues/18713)) ([2159342](https://github.com/angular/angular/commit/2159342))
* **animations:** report errors when invalid CSS properties are detected ([#18718](https://github.com/angular/angular/issues/18718)) ([409688f](https://github.com/angular/angular/commit/409688f)), closes [#18701](https://github.com/angular/angular/issues/18701)
* **animations:** support :increment and :decrement transition aliases ([6f45519](https://github.com/angular/angular/commit/6f45519))
* **animations:** support negative query limit values ([86ffacf](https://github.com/angular/angular/commit/86ffacf)), closes [#19259](https://github.com/angular/angular/issues/19259)
* **common:** accept object map for HttpClient headers & params ([#18490](https://github.com/angular/angular/issues/18490)) ([1b1d5f1](https://github.com/angular/angular/commit/1b1d5f1))
* **common:** drop use of the Intl API to improve browser support ([#18284](https://github.com/angular/angular/issues/18284)) ([079d884](https://github.com/angular/angular/commit/079d884)), closes [#10809](https://github.com/angular/angular/issues/10809) [#9524](https://github.com/angular/angular/issues/9524) [#7008](https://github.com/angular/angular/issues/7008) [#9324](https://github.com/angular/angular/issues/9324) [#7590](https://github.com/angular/angular/issues/7590) [#6724](https://github.com/angular/angular/issues/6724) [#3429](https://github.com/angular/angular/issues/3429) [#17576](https://github.com/angular/angular/issues/17576) [#17478](https://github.com/angular/angular/issues/17478) [#17319](https://github.com/angular/angular/issues/17319) [#17200](https://github.com/angular/angular/issues/17200) [#16838](https://github.com/angular/angular/issues/16838) [#16624](https://github.com/angular/angular/issues/16624) [#16625](https://github.com/angular/angular/issues/16625) [#16591](https://github.com/angular/angular/issues/16591) [#14131](https://github.com/angular/angular/issues/14131) [#12632](https://github.com/angular/angular/issues/12632) [#11376](https://github.com/angular/angular/issues/11376) [#11187](https://github.com/angular/angular/issues/11187)
* **common:** generate `closure-locale.ts` to tree shake locale data ([#18907](https://github.com/angular/angular/issues/18907)) ([4878936](https://github.com/angular/angular/commit/4878936))
* **common:** mark NgTemplateOutlet API as stable ([0a73e8d](https://github.com/angular/angular/commit/0a73e8d))
* **compiler-cli:** add watch mode to `ngc` ([#18818](https://github.com/angular/angular/issues/18818)) ([06d01b2](https://github.com/angular/angular/commit/06d01b2))
* **compiler-cli:** lower metadata `useValue` and `data` literal fields ([#18905](https://github.com/angular/angular/issues/18905)) ([0e64261](https://github.com/angular/angular/commit/0e64261))
* **compiler:** add representation of placeholders to xliff & xmb ([b3085e9](https://github.com/angular/angular/commit/b3085e9)), closes [#17345](https://github.com/angular/angular/issues/17345)
* **compiler:** allow multiple exportAs names ([#18723](https://github.com/angular/angular/issues/18723)) ([7ec28fe](https://github.com/angular/angular/commit/7ec28fe))
* **compiler:** enabled strict checking of parameters to an `@Injectable` ([#19412](https://github.com/angular/angular/issues/19412)) ([dfb8d21](https://github.com/angular/angular/commit/dfb8d21))
* **compiler:** make `.ngsummary.json` files portable ([2572bf5](https://github.com/angular/angular/commit/2572bf5))
* **compiler:** reuse the TypeScript typecheck for template typechecking. ([#19152](https://github.com/angular/angular/issues/19152)) ([996c7c2](https://github.com/angular/angular/commit/996c7c2))
* **compiler:** set `enableLegacyTemplate` to false by default ([#18756](https://github.com/angular/angular/issues/18756)) ([56238fe](https://github.com/angular/angular/commit/56238fe))
* **compiler:** use typescript for resolving resource paths ([43226cb](https://github.com/angular/angular/commit/43226cb))
* **core:** Create StaticInjector which does not depend on Reflect polyfill. ([d9d00bd](https://github.com/angular/angular/commit/d9d00bd))
* **core:** add option to remove blank text nodes from compiled templates ([#18823](https://github.com/angular/angular/issues/18823)) ([b8b551c](https://github.com/angular/angular/commit/b8b551c))
* **core:** support for bootstrap with custom zone ([#17672](https://github.com/angular/angular/issues/17672)) ([344a5ca](https://github.com/angular/angular/commit/344a5ca))
* **forms:** add default updateOn values for groups and arrays ([#18536](https://github.com/angular/angular/issues/18536)) ([ff5c58b](https://github.com/angular/angular/commit/ff5c58b))
* **forms:** add options arg to abstract controls ([ebef5e6](https://github.com/angular/angular/commit/ebef5e6))
* **forms:** add status to `AbstractControlDirective` ([233ef93](https://github.com/angular/angular/commit/233ef93))
* **forms:** add updateOn and ngFormOptions to NgForm ([0d45828](https://github.com/angular/angular/commit/0d45828))
* **forms:** add updateOn blur option to FormControls ([#18408](https://github.com/angular/angular/issues/18408)) ([333a708](https://github.com/angular/angular/commit/333a708)), closes [#7113](https://github.com/angular/angular/issues/7113)
* **forms:** add updateOn submit option to FormControls ([#18514](https://github.com/angular/angular/issues/18514)) ([f69561b](https://github.com/angular/angular/commit/f69561b))
* **forms:** add updateOn support to ngModelOptions ([1cfa79c](https://github.com/angular/angular/commit/1cfa79c))
* **platform-server:** add an API to transfer state from server ([#19134](https://github.com/angular/angular/issues/19134)) ([cfd9ca0](https://github.com/angular/angular/commit/cfd9ca0))
* **platform-server:** provide a DOM implementation on the server ([2f2d5f3](https://github.com/angular/angular/commit/2f2d5f3)), closes [#14638](https://github.com/angular/angular/issues/14638)
* **platform-server:** provide a way to hook into renderModule* ([#19023](https://github.com/angular/angular/issues/19023)) ([8dfc3c3](https://github.com/angular/angular/commit/8dfc3c3))
* **router:** add ActivationStart/End events ([8f79150](https://github.com/angular/angular/commit/8f79150))
* **router:** add events tracking activation of individual routes ([49cd851](https://github.com/angular/angular/commit/49cd851))
* **service-worker:** introduce the [@angular](https://github.com/angular)/service-worker package ([#19274](https://github.com/angular/angular/issues/19274)) ([d442b68](https://github.com/angular/angular/commit/d442b68))
* **upgrade:** propagate touched state of NgModelController ([59c23c7](https://github.com/angular/angular/commit/59c23c7))
* **upgrade:** support lazy-loading Angular module into AngularJS app ([30e76fc](https://github.com/angular/angular/commit/30e76fc))
* update angular to support TypeScript 2.4 ([ca5aeba](https://github.com/angular/angular/commit/ca5aeba))


### Performance Improvements

* **animations:** reduce size of bundle by removing AST classes ([#19539](https://github.com/angular/angular/issues/19539)) ([d5c9c5f](https://github.com/angular/angular/commit/d5c9c5f))
* **compiler:** don’t emit summaries for jit by default ([b086891](https://github.com/angular/angular/commit/b086891))
* **compiler:** fix perf issue in loading aot summaries in jit compiler ([fbc9537](https://github.com/angular/angular/commit/fbc9537))
* **compiler:** make the creation of `ts.Program` faster. ([#19275](https://github.com/angular/angular/issues/19275)) ([edd5f5a](https://github.com/angular/angular/commit/edd5f5a))
* **compiler:** only emit changed files for incremental compilation ([745b59f](https://github.com/angular/angular/commit/745b59f))
* **compiler:** only type check input files when using bazel ([#19581](https://github.com/angular/angular/issues/19581)) ([0b06ea1](https://github.com/angular/angular/commit/0b06ea1))
* **compiler:** only use tsickle if needed ([#19275](https://github.com/angular/angular/issues/19275)) ([8f95b75](https://github.com/angular/angular/commit/8f95b75))
* **compiler:** skip type check and emit in bazel in some cases. ([#19646](https://github.com/angular/angular/issues/19646)) ([a22121d](https://github.com/angular/angular/commit/a22121d))
* **compiler:** speed up loading of summaries for bazel. ([#19581](https://github.com/angular/angular/issues/19581)) ([81167d9](https://github.com/angular/angular/commit/81167d9))
* **compiler:** speed up watch mode ([#19275](https://github.com/angular/angular/issues/19275)) ([6665d76](https://github.com/angular/angular/commit/6665d76))
* **core:** Remove decorator DSL which depends on Reflect ([cac130e](https://github.com/angular/angular/commit/cac130e))
* **core:** add option to remove blank text nodes from compiled templates ([d2c0d98](https://github.com/angular/angular/commit/d2c0d98))
* **core:** use native addEventListener for faster rendering. ([#18107](https://github.com/angular/angular/issues/18107)) ([6279e50](https://github.com/angular/angular/commit/6279e50))
* **core** switch angular to use StaticInjector instead of ReflectiveInjector ([fcadbf4](https://github.com/angular/angular/commit/fcadbf4)), closes [#18496](https://github.com/angular/angular/issues/18496)
* latest tsickle to tree shake: abstract class methods & interfaces ([#18236](https://github.com/angular/angular/issues/18236)) ([b7a6f52](https://github.com/angular/angular/commit/b7a6f52))


### BREAKING CHANGES

* **compiler**: Angular now requires TypeScript 2.4.x.
* **compiler**: split compiler and core. `@angular/platform-server` now additionally depends on `@angular/platform-browser-dynamic` as a peer dependency. ([#18683](https://github.com/angular/angular/issues/18683)) ([0cc77b4](https://github.com/angular/angular/commit/0cc77b4))
* `platformXXXX()` no longer accepts providers which depend on reflection. Specifically the method signature went from `Provider[]` to `StaticProvider[]`.

Example:
Before:
```
[
  MyClass,
  {provide: ClassA, useClass: SubClassA}
]

```

After:
```
[
  {provide: MyClass, deps: [Dep1,...]},
  {provide: ClassA, useClass: SubClassA, deps: [Dep1,...]}
]
```

NOTE: This only applies to platform creation and providers for the JIT
compiler. It does not apply to `@Component` or `@NgModule` provides
declarations.

Benchpress note: Previously Benchpress also supported reflective
provides, which now require static providers.


#### I18n Changes (@angular/common)
Because of multiple bugs and browser inconsistencies, we have dropped the intl api in favor of data exported from the Unicode Common Locale Data Repository (CLDR). Unfortunately we had to change the i18n pipes (date, number, currency, percent) and there are some breaking changes.

  ##### I18n pipes:
  - Breaking change:
    - By default Angular now only contains locale data for the language `en-US`, if you set the value of `LOCALE_ID` to another locale, you will have to import new locale data for this language because we don't use the intl API anymore.
  - Features:
    - you don't need to use the intl polyfill for Angular anymore.
    - all i18n pipes now have an additional last parameter `locale` which allows you to use a specific locale instead of the one defined in the token `LOCALE_ID` (whose default value is `en-US`).
    - the new locale data extracted from CLDR are now available to developers as well and can be used through an API (which should be especially useful for library authors).
    - you can still use the old pipes for now, but their names have been changed and they are no longer included in the `CommonModule`. To use them, you will have to import the `DeprecatedI18NPipesModule` after the `CommonModule` (the order is important):

    ```ts
    import { NgModule } from '@angular/core';
    import { CommonModule, DeprecatedI18NPipesModule } from '@angular/common';

    @NgModule({
      imports: [
        CommonModule,
        // import deprecated module after
        DeprecatedI18NPipesModule
      ]
    })
    export class AppModule { }
    ```

    Don't forget that you will still need to import the intl API polyfill if you want to use those deprecated pipes.

  ##### Date pipe
  - Breaking changes:
    - the predefined formats (`short`, `shortTime`, `shortDate`, `medium`, ...) now use the patterns given by CLDR (like it was in AngularJS) instead of the ones from the intl API. You might notice some changes, e.g. `shortDate` will be `8/15/17` instead of `8/15/2017` for `en-US`.
    - the narrow version of eras is now `GGGGG` instead of `G`, the format `G` is now similar to `GG` and `GGG`.
    - the narrow version of months is now `MMMMM` instead of `L`, the format `L` is now the short standalone version of months.
    - the narrow version of the week day is now `EEEEE` instead of `E`, the format `E` is now similar to `EE` and `EEE`.
    - the timezone `z` will now fallback to `O` and output `GMT+1` instead of the complete zone name (e.g. `Pacific Standard Time`), this is because the quantity of data required to have all the zone names in all of the existing locales is too big.
    - the timezone `Z` will now output the ISO8601 basic format, e.g. `+0100`, you should now use `ZZZZ` to get `GMT+01:00`.

    | Field type | Format        | Example value         | v4 | v5            |
    |------------|---------------|-----------------------|----|---------------|
    | Eras       | Narrow        | A for AD              | G  | GGGGG         |
    | Months     | Narrow        | S for September       | L  | MMMMM         |
    | Week day   | Narrow        | M for Monday          | E  | EEEEE         |
    | Timezone   | Long location | Pacific Standard Time | z  | Not available |
    | Timezone   | Long GMT      | GMT+01:00             | Z  | ZZZZ          |

  - Features
    - new predefined formats `long`, `full`, `longTime`, `fullTime`.
    - the format `yyy` is now supported, e.g. the year `52` will be `052` and the year `2017` will be `2017`.
    - standalone months are now supported with the formats `L` to `LLLLL`.
    - week of the year is now supported with the formats `w` and `ww`, e.g. weeks `5` and `05`.
    - week of the month is now supported with the format `W`, e.g. week `3`.
    - fractional seconds are now supported with the format `S` to `SSS`.
    - day periods for AM/PM now supports additional formats `aa`, `aaa`, `aaaa` and `aaaaa`. The formats `a` to `aaa` are similar, while `aaaa` is the wide version if available (e.g. `ante meridiem` for `am`), or equivalent to `a` otherwise, and `aaaaa` is the narrow version (e.g. `a` for `am`).
    - extra day periods are now supported with the formats `b` to `bbbbb` (and `B` to `BBBBB` for the standalone equivalents), e.g. `morning`, `noon`, `afternoon`, ....
    - the short non-localized timezones are now available with the format `O` to `OOOO`. The formats `O` to `OOO` will output `GMT+1` while the format `OOOO` will be `GMT+01:00`.
    - the ISO8601 basic time zones are now available with the formats `Z` to `ZZZZZ`. The formats `Z` to `ZZZ` will output `+0100`, while the format `ZZZZ` will be `GMT+01:00` and `ZZZZZ` will be `+01:00`.

  - Bug fixes
    - the date pipe will now work exactly the same across all browsers, which will fix a lot of bugs for safari and IE.
    - eras can now be used on their own without the date, e.g. the format `GG` will be `AD` instead of `8 15, 2017 AD`.

  ##### Currency pipe
  - Breaking change:
    - the default value for `symbolDisplay` is now `symbol` instead of `code`. This means that by default you will see `$4.99` for `en-US` instead of `USD4.99` previously.

  * Deprecation:
    - the second parameter of the currency pipe (`symbolDisplay`) is no longer a boolean, it now takes the values `code`, `symbol` or `symbol-narrow`. A boolean value is still valid for now, but it is deprecated and it will print a warning message in the console.

  - Features:
    - you can now choose between `code`, `symbol` or `symbol-narrow` which gives you access to more options for some currencies (e.g. the canadian dollar with the code `CAD` has the symbol `CA$` and the symbol-narrow `$`).

  ##### Percent pipe
  - Breaking change
    - if you don't specify the number of digits to round to, the local format will be used (and it usually rounds numbers to 0 digits, instead of not rounding previously), e.g. `{{ 3.141592 | percent }}` will output `314%` for the locale `en-US` instead of `314.1592%` previously.


### Deprecated code
* **compiler**: The method `ngGetContentSelectors()` has been removed as it was deprecated since v4. Use `ComponentFactory.ngContentSelectors` instead.
* **compiler**: the compiler option `enableLegacyTemplate` is now disabled by default as the `<template>` element was deprecated since v4. Use `<ng-template>` instead. The option `enableLegacyTemplate` and the `<template>` element will both be removed in Angular v6.
* **compiler**: the option `useDebug` for the compiler has been removed as it had no effect and was deprecated since v4. ([#18778](https://github.com/angular/angular/issues/18778)) ([499d05d](https://github.com/angular/angular/commit/499d05d))
* **compiler**: deprecate i18n comments in favor of `ng-container` ([#18998](https://github.com/angular/angular/issues/18998)) ([66a5dab](https://github.com/angular/angular/commit/66a5dab))
* **common**: `NgFor` has been removed as it was deprecated since v4. Use `NgForOf` instead. This does not impact the use of `*ngFor` in your templates. ([#18758](https://github.com/angular/angular/issues/18758)) ([ec56760](https://github.com/angular/angular/commit/ec56760))
* **common**: `NgTemplateOutlet#ngOutletContext` has been removed as it was deprecated since v4. Use `NgTemplateOutlet#ngTemplateOutletContext` instead. ([#18780](https://github.com/angular/angular/issues/18780)) ([7522987](https://github.com/angular/angular/commit/7522987))
* **core**: `ErrorHandler` no longer takes a parameter as it was not used and deprecated since v4. ([#18759](https://github.com/angular/angular/issues/18759)) ([8f41326](https://github.com/angular/angular/commit/8f41326))
* **core**: `ReflectiveInjector` is now deprecated. Use `Injector.create` as a replacement.
* **core**: `Testability#findBindings` has been removed as it was deprecated since v4. Use `Testability#findProviders` instead. ([#18782](https://github.com/angular/angular/issues/18782)) ([f2a2a6b](https://github.com/angular/angular/commit/f2a2a6b))
* **core**: `DebugNode#source` has been removed as it was deprecated since v4. ([#18779](https://github.com/angular/angular/issues/18779)) ([d61b902](https://github.com/angular/angular/commit/d61b902))
* **core**: `OpaqueToken` has been removed as it was deprecated since v4. Use `InjectionToken` instead. ([#18971](https://github.com/angular/angular/issues/18971)) ([3c4eef8](https://github.com/angular/angular/commit/3c4eef8))
* **core**: `DifferFactory.create` no longer takes ChangeDetectionRef as a first argument as it was not used and deprecated since v4. ([#18757](https://github.com/angular/angular/issues/18757)) ([be9713c](https://github.com/angular/angular/commit/be9713c))
* **core**: `TrackByFn` has been removed because it was deprecated since v4. Use `TrackByFunction` instead. ([#18757](https://github.com/angular/angular/issues/18757)) ([596e9f4](https://github.com/angular/angular/commit/596e9f4))
* **http**: deprecate @angular/http in favor of @angular/common/http ([#18906](https://github.com/angular/angular/issues/18906)) ([72c7b6e](https://github.com/angular/angular/commit/72c7b6e))
* **router**: `RouterOutlet` properties `locationInjector` and `locationFactoryResolver` have been removed as they were deprecated since v4. ([#18781](https://github.com/angular/angular/issues/18781)) ([d1c4a94](https://github.com/angular/angular/commit/d1c4a94), [a9ef858](https://github.com/angular/angular/commit/a9ef858))
* **router**: the values `true`, `false`, `legacy_enabled` and `legacy_disabled` for the router parameter `initialNavigation` have been removed as they were deprecated. Use `enabled` or `disabled` instead. ([#18781](https://github.com/angular/angular/issues/18781)) ([d76761b](https://github.com/angular/angular/commit/d76761b))
* **platform-browser**: `NgProbeToken` has been removed from `@angular/platform-browser` as it was deprecated since v4. Import it from `@angular/core` instead. ([#18760](https://github.com/angular/angular/issues/18760)) ([d7f42bf](https://github.com/angular/angular/commit/d7f42bf))
* **platform-webworker**: `PRIMITIVE` has been removed as it was deprecated since v4. Use `SerializerTypes.PRIMITIVE` instead. ([#18761](https://github.com/angular/angular/issues/18761)) ([a56468c](https://github.com/angular/angular/commit/a56468c))



<a name="4.4.6"></a>
## [4.4.6](https://github.com/angular/angular/compare/4.4.5...4.4.6) (2017-10-18)


### Bug Fixes

* **animations:** properly support boolean-based transitions and state changes ([#19672](https://github.com/angular/angular/issues/19672)) ([f983a6c](https://github.com/angular/angular/commit/f983a6c)), closes [#9396](https://github.com/angular/angular/issues/9396) [#12337](https://github.com/angular/angular/issues/12337)
* **common:** attempt to JSON.parse errors for JSON responses ([#19773](https://github.com/angular/angular/issues/19773)) ([269f5ac](https://github.com/angular/angular/commit/269f5ac))
* **router:** RouterLinkActive should update its state right after checking the children ([53a807a](https://github.com/angular/angular/commit/53a807a)), closes [#18983](https://github.com/angular/angular/issues/18983)


### Performance Improvements

* **animations:** reduce size of bundle by removing AST classes ([#19673](https://github.com/angular/angular/issues/19673)) ([76d2496](https://github.com/angular/angular/commit/76d2496))



<a name="4.4.5"></a>
## [4.4.5](https://github.com/angular/angular/compare/4.4.4...4.4.5) (2017-10-12)


### Bug Fixes

* **compiler:** `TestBed.overrideProvider` should keep imported `NgModule`s eager ([#19624](https://github.com/angular/angular/issues/19624)) ([734378c](https://github.com/angular/angular/commit/734378c))
* **compiler:** correctly instantiate eager providers that are used via `Injector.get` ([#19558](https://github.com/angular/angular/issues/19558)) ([e292548](https://github.com/angular/angular/commit/e292548)), closes [#15501](https://github.com/angular/angular/issues/15501)
* **compiler:** disallow references for select and index evaluation ([95f3b1d](https://github.com/angular/angular/commit/95f3b1d))
* **core:** make dynamic & inline code checking behave the same ([#19189](https://github.com/angular/angular/issues/19189)) ([6c66031](https://github.com/angular/angular/commit/6c66031))
* **platform-browser:** support customEqualityTesters when overriding Jasmine toEqual ([cc8ae32](https://github.com/angular/angular/commit/cc8ae32))
* **tsc-wrapped:** don't rewrite imports when annotating for closure ([#19579](https://github.com/angular/angular/issues/19579)) ([c9f8718](https://github.com/angular/angular/commit/c9f8718))


<a name="4.4.4"></a>
## [4.4.4](https://github.com/angular/angular/compare/4.4.3...4.4.4) (2017-09-28)


### Bug Fixes

* **animations:** support negative query limit value ([#19419](https://github.com/angular/angular/issues/19419)) ([bc81fbd](https://github.com/angular/angular/commit/bc81fbd)), closes [#19232](https://github.com/angular/angular/issues/19232)
* **compiler:** correctly map error message locations ([#19424](https://github.com/angular/angular/issues/19424)) ([c3b39ba](https://github.com/angular/angular/commit/c3b39ba))
* **compiler:** do not consider a reference with members as a reference ([#19466](https://github.com/angular/angular/issues/19466)) ([7fc2dce](https://github.com/angular/angular/commit/7fc2dce))
* **compiler:** skip &nbsp; when trimming / removing whitespaces ([#19310](https://github.com/angular/angular/issues/19310)) ([c7aa8a1](https://github.com/angular/angular/commit/c7aa8a1)), closes [#19304](https://github.com/angular/angular/issues/19304)
* **tsc-wrapped:** add metadata for `type` declarations ([#19040](https://github.com/angular/angular/issues/19040)) ([ae52851](https://github.com/angular/angular/commit/ae52851))


<a name="4.4.3"></a>
## [4.4.3](https://github.com/angular/angular/compare/4.4.2...4.4.3) (2017-09-19)


### Bug Fixes

* **tsc-wrapped:** deduplicate metadata only when the module is the same ([#19261](https://github.com/angular/angular/issues/19261)) ([0371538](https://github.com/angular/angular/commit/0371538)), closes [#19219](https://github.com/angular/angular/issues/19219)


<a name="4.4.2"></a>
## [4.4.2](https://github.com/angular/angular/compare/4.4.1...4.4.2) (2017-09-18)


### Bug Fixes

* **platform-server**: fix for packaging issues [#19250](https://github.com/angular/angular/issues/19250)


<a name="4.4.1"></a>
## [4.4.1](https://github.com/angular/angular/compare/4.3.6...4.4.1) (2017-09-15)


### Bug Fixes

* **animations:** do not leak DOM nodes/styling for host triggered animations ([#18853](https://github.com/angular/angular/issues/18853)) ([1cc3fe2](https://github.com/angular/angular/commit/1cc3fe2)), closes [#18606](https://github.com/angular/angular/issues/18606)
* **common:** fix improper packaging for [@angular](https://github.com/angular)/common/http ([#18613](https://github.com/angular/angular/issues/18613)) ([a203a95](https://github.com/angular/angular/commit/a203a95))
* **common:** fix XSSI prefix stripping by using JSON.parse always ([#18466](https://github.com/angular/angular/issues/18466)) ([8821723](https://github.com/angular/angular/commit/8821723)), closes [#18396](https://github.com/angular/angular/issues/18396) [#18453](https://github.com/angular/angular/issues/18453)
* **compiler:** normalize the locale name ([#18963](https://github.com/angular/angular/issues/18963)) ([497e017](https://github.com/angular/angular/commit/497e017))
* **core:** complete EventEmitter in QueryList on component destroy ([#18902](https://github.com/angular/angular/issues/18902)) ([7d137d7](https://github.com/angular/angular/commit/7d137d7)), closes [#18741](https://github.com/angular/angular/issues/18741)
* **tsc-wrapped:** deduplicate metadata for re-exported modules ([48ae1a6](https://github.com/angular/angular/commit/48ae1a6))
* **tsc-wrapped:** fix metadata symbol reference ([f6a7183](https://github.com/angular/angular/commit/f6a7183))
* **upgrade:** remove code setting id attribute. ([#19182](https://github.com/angular/angular/issues/19182)) ([b20c5d2](https://github.com/angular/angular/commit/b20c5d2)), closes [#18446](https://github.com/angular/angular/issues/18446)


### Features

* **compiler:** allow multiple exportAs names ([#18723](https://github.com/angular/angular/issues/18723)) ([7ec28fe](https://github.com/angular/angular/commit/7ec28fe))
* **core:** add option to remove blank text nodes from compiled templates ([#18823](https://github.com/angular/angular/issues/18823)) ([b8b551c](https://github.com/angular/angular/commit/b8b551c))


Note: the 4.4.0 release on npm accidentally glitched-out midway, so we cut 4.4.1 instead. oops :-)



<a name="4.3.6"></a>
## [4.3.6](https://github.com/angular/angular/compare/4.3.5...4.3.6) (2017-08-23)


### Bug Fixes

* **animations:** ensure animations are disabled on the element containing the @.disabled flag ([#18714](https://github.com/angular/angular/issues/18714)) ([5d68c83](https://github.com/angular/angular/commit/5d68c83))
* **animations:** make sure @.disabled respects disabled parent/sub animation sequences ([#18715](https://github.com/angular/angular/issues/18715)) ([c3dcbf9](https://github.com/angular/angular/commit/c3dcbf9))
* **animations:** make sure animation cancellations respect AUTO style values ([#18787](https://github.com/angular/angular/issues/18787)) ([9a754f9](https://github.com/angular/angular/commit/9a754f9)), closes [#17450](https://github.com/angular/angular/issues/17450)
* **animations:** resolve error when using AnimationBuilder with platform-server ([#18642](https://github.com/angular/angular/issues/18642)) ([f9b2905](https://github.com/angular/angular/commit/f9b2905)), closes [#18635](https://github.com/angular/angular/issues/18635)
* **animations:** restore auto-style support for removed DOM nodes ([#18787](https://github.com/angular/angular/issues/18787)) ([e1f45a3](https://github.com/angular/angular/commit/e1f45a3))
* **core:** correct order in ContentChildren query result ([#18326](https://github.com/angular/angular/issues/18326)) ([fec3b1a](https://github.com/angular/angular/commit/fec3b1a)), closes [#16568](https://github.com/angular/angular/issues/16568)
* **core:** make sure onStable runs in the right zone ([#18706](https://github.com/angular/angular/issues/18706)) ([ee5591d](https://github.com/angular/angular/commit/ee5591d))


### Features

* **animations:** allow @.disabled property to work without an expression ([#18713](https://github.com/angular/angular/issues/18713)) ([ac58914](https://github.com/angular/angular/commit/ac58914))
* **common:** add an empty DeprecatedI18NPipesModule module ([793f31b](https://github.com/angular/angular/commit/793f31b))



<a name="4.3.5"></a>
## [4.3.5](https://github.com/angular/angular/compare/4.3.4...4.3.5) (2017-08-16)


### Bug Fixes

* **core:** forbid destroyed views to be inserted or moved in VC ([972538b](https://github.com/angular/angular/commit/972538b)), closes [#18615](https://github.com/angular/angular/issues/18615)
* **forms:** re-assigning options should not clear select ([a1624f2](https://github.com/angular/angular/commit/a1624f2)), closes [#18330](https://github.com/angular/angular/issues/18330)


<a name="4.3.4"></a>
## [4.3.4](https://github.com/angular/angular/compare/4.3.3...4.3.4) (2017-08-10)

### Bug Fixes

* **animations:** revert container/queried animations accordingly during cancel ([#18516](https://github.com/angular/angular/issues/18516)) ([5a165eb](https://github.com/angular/angular/commit/5a165eb))
* **animations:** support persisting dynamic styles within animation states ([#18468](https://github.com/angular/angular/issues/18468)) ([e0660b1](https://github.com/angular/angular/commit/e0660b1)), closes [#18423](https://github.com/angular/angular/issues/18423) [#17505](https://github.com/angular/angular/issues/17505)
* **benchpress:** compile cleanly with TS 2.4 ([#18455](https://github.com/angular/angular/issues/18455)) ([5afc7ab](https://github.com/angular/angular/commit/5afc7ab))
* **compiler:** cleanly compile with TypeScript 2.4 ([#18456](https://github.com/angular/angular/issues/18456)) ([5e4054b](https://github.com/angular/angular/commit/5e4054b))
* **compiler:** ignore [@import](https://github.com/import) in multi-line css ([#18452](https://github.com/angular/angular/issues/18452)) ([e7e7622](https://github.com/angular/angular/commit/e7e7622)), closes [#18038](https://github.com/angular/angular/issues/18038)


<a name="4.3.3"></a>
## [4.3.3](https://github.com/angular/angular/compare/4.3.2...4.3.3) (2017-08-02)

### Bug Fixes

* **compiler:** fix for element needing implicit parent placed in top-level ng-container ([f5cbc2e](https://github.com/angular/angular/commit/f5cbc2e)), closes [#18314](https://github.com/angular/angular/issues/18314)


<a name="4.3.2"></a>
## [4.3.2](https://github.com/angular/angular/compare/4.3.1...4.3.2) (2017-07-26)


### Bug Fixes

* **animations:** export BrowserModule as apart of BrowserAnimationsModule ([#18263](https://github.com/angular/angular/issues/18263)) ([cbeb197](https://github.com/angular/angular/commit/cbeb197))
* **compiler:** add equiv & disp attributes to Xliff2 ICU placeholders ([#18283](https://github.com/angular/angular/issues/18283)) ([a084619](https://github.com/angular/angular/commit/a084619)), closes [#17344](https://github.com/angular/angular/issues/17344)
* **compiler:** allow numbers for ICU message cases in lexer ([#18095](https://github.com/angular/angular/issues/18095)) ([a8ac77b](https://github.com/angular/angular/commit/a8ac77b)), closes [#17799](https://github.com/angular/angular/issues/17799)
* **core:** invoke error handler outside of the Angular Zone ([#18269](https://github.com/angular/angular/issues/18269)) ([a1bb9c2](https://github.com/angular/angular/commit/a1bb9c2)), closes [#17073](https://github.com/angular/angular/issues/17073) [#7774](https://github.com/angular/angular/issues/7774)
* **platform-server:** don't clobber parse5 properties when setting ([#18237](https://github.com/angular/angular/issues/18237)) ([97135e8](https://github.com/angular/angular/commit/97135e8)), closes [#17050](https://github.com/angular/angular/issues/17050)
* **router:** child CanActivate guard should wait for parent to complete ([#18110](https://github.com/angular/angular/issues/18110)) ([b9e32c8](https://github.com/angular/angular/commit/b9e32c8)), closes [#15670](https://github.com/angular/angular/issues/15670)
* **router:** should throw when lazy loaded module doesn't define any routes ([#15001](https://github.com/angular/angular/issues/15001)) ([be49e0e](https://github.com/angular/angular/commit/be49e0e)), closes [#14596](https://github.com/angular/angular/issues/14596)
* **upgrade:** throw error if trying to get injector before setting ([#18209](https://github.com/angular/angular/issues/18209)) ([1f106d7](https://github.com/angular/angular/commit/1f106d7))



<a name="4.3.1"></a>
## [4.3.1](https://github.com/angular/angular/compare/4.3.0...4.3.1) (2017-07-19)


### Bug Fixes

* **animations:** always camelcase style property names that contain auto styles ([383d896](https://github.com/angular/angular/commit/383d896)), closes [#17938](https://github.com/angular/angular/issues/17938)
* **animations:** capture cancelled animation styles within grouped animations ([333ffd8](https://github.com/angular/angular/commit/333ffd8)), closes [#17170](https://github.com/angular/angular/issues/17170)
* **animations:** do not crash animations if a nested component fires CD during CD ([4c1f32b](https://github.com/angular/angular/commit/4c1f32b)), closes [#18193](https://github.com/angular/angular/issues/18193)
* **animations:** make sure @.disabled works in non-animation components ([a5c4bb5](https://github.com/angular/angular/commit/a5c4bb5))
* **common:** send flushed body as error instead of null ([17b7bc3](https://github.com/angular/angular/commit/17b7bc3)), closes [#18181](https://github.com/angular/angular/issues/18181)
* **compiler:** ensure jit external id arguments names are unique ([4671168](https://github.com/angular/angular/commit/4671168))
* **compiler-cli:** don't generate empty `<target/>` when extracting xliff ([f0476fc](https://github.com/angular/angular/commit/f0476fc)), closes [#15754](https://github.com/angular/angular/issues/15754)
* **platform-server:** provide XhrFactory for HttpClient ([4ce29f3](https://github.com/angular/angular/commit/4ce29f3))
* **router:** canDeactivate guards should run from bottom to top ([1ac78bf](https://github.com/angular/angular/commit/1ac78bf)), closes [#15657](https://github.com/angular/angular/issues/15657)
* **router:** should navigate to the same url when config changes ([4340bea](https://github.com/angular/angular/commit/4340bea)), closes [#15535](https://github.com/angular/angular/issues/15535)
* **router:** should run resolvers for the same route concurrently ([ec89f37](https://github.com/angular/angular/commit/ec89f37)), closes [#14279](https://github.com/angular/angular/issues/14279)
* **router:** terminal route in custom matcher ([5d275e9](https://github.com/angular/angular/commit/5d275e9))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/angular/angular/compare/4.3.0-rc.0...4.3.0) (2017-07-14)


### Bug Fixes

* **animations:** do not delay style() values before a stagger() runs ([34f3832](https://github.com/angular/angular/commit/34f3832)), closes [#17412](https://github.com/angular/angular/issues/17412)
* **animations:** do not remove container nodes when children are queried by a parent animation ([d699c35](https://github.com/angular/angular/commit/d699c35)), closes [#17746](https://github.com/angular/angular/issues/17746)
* **animations:** do not validate style overlap errors in different transitions ([f2ee1dc](https://github.com/angular/angular/commit/f2ee1dc))
* **animations:** properly collect :enter nodes that exist within multi-level DOM trees ([40f77cb](https://github.com/angular/angular/commit/40f77cb)), closes [#17632](https://github.com/angular/angular/issues/17632)
* **animations:** compute removal node height correctly ([185075d](https://github.com/angular/angular/commit/185075d))
* **animations:** do not treat a `0` animation state as `void` ([451257a](https://github.com/angular/angular/commit/451257a))
* **animations:** properly collect :enter nodes in a partially updated collection ([6ca4692](https://github.com/angular/angular/commit/6ca4692)), closes [#17440](https://github.com/angular/angular/issues/17440)
* **animations:** remove duplicate license header ([e096a85](https://github.com/angular/angular/commit/e096a85))
* **common/http:** document HttpClient, fixing a few other issues ([1855989](https://github.com/angular/angular/commit/1855989))
* **common/http:** don't guess Content-Type for FormData bodies ([#18104](https://github.com/angular/angular/issues/18104)) ([4f1e4ff](https://github.com/angular/angular/commit/4f1e4ff)), closes [#18096](https://github.com/angular/angular/issues/18096)
* **common/http:** expose reportProgress option on HttpClient API ([#18083](https://github.com/angular/angular/issues/18083)) ([9f28e83](https://github.com/angular/angular/commit/9f28e83))
* **common/http:** rename HttpXsrfModule to HttpClientXsrfModule ([3ecc5e5](https://github.com/angular/angular/commit/3ecc5e5))
* **compiler:** avoid emitting self importing factories ([4352dd2](https://github.com/angular/angular/commit/4352dd2))
* **compiler-cli:** find lazy routes in nested module import arrays ([8c89cc4](https://github.com/angular/angular/commit/8c89cc4))
* **core:** add needed closure compiler warning suppression ([e80851d](https://github.com/angular/angular/commit/e80851d))
* **core:** argument destructuring sometimes breaks strictNullChecks ([c59c390](https://github.com/angular/angular/commit/c59c390))
* **language-service:** infer `any` `ngForOf` of type `any` ([f194f18](https://github.com/angular/angular/commit/f194f18))
* **language-service:** rollup `tslib` into the language service package ([4e6be15](https://github.com/angular/angular/commit/4e6be15))
* **router:** fix outdated homepage url in NPM package ([#17899](https://github.com/angular/angular/issues/17899)) ([df06e8b](https://github.com/angular/angular/commit/df06e8b))
* **router:** update the version placeholder so that it gets replaced during the build ([d3c92a3](https://github.com/angular/angular/commit/d3c92a3)), closes [#17403](https://github.com/angular/angular/issues/17403)
* **tsc-wrapped:** report errors for invalid ast forms ([#17994](https://github.com/angular/angular/issues/17994)) ([ce0f4f0](https://github.com/angular/angular/commit/ce0f4f0))
* **tsc-wrapped:** support as and class expressions ([#16904](https://github.com/angular/angular/issues/16904)) ([45ffe54](https://github.com/angular/angular/commit/45ffe54))
* **tsc-wrapped:** skip collecting metadata for default functions ([46ddf50](https://github.com/angular/angular/commit/46ddf50))
* **upgrade:** bring the dynamic version closer to the static one ([11db3bd](https://github.com/angular/angular/commit/11db3bd)), closes [#16627](https://github.com/angular/angular/issues/16627) [#11044](https://github.com/angular/angular/issues/11044)



### Features

* **animations:** support disabling animations for sub elements ([8e28382](https://github.com/angular/angular/commit/8e28382)), closes [#16483](https://github.com/angular/angular/issues/16483)
* **common/http:** new HttpClient API ([37797e2](https://github.com/angular/angular/commit/37797e2))
* **common/http:** on-by-default XSRF support in HttpClient ([#18108](https://github.com/angular/angular/issues/18108)) ([dd04f09](https://github.com/angular/angular/commit/dd04f09)), closes [#18100](https://github.com/angular/angular/issues/18100)
* **compiler:** adds support for quoted object keys in the parser ([798947e](https://github.com/angular/angular/commit/798947e))
* **compiler:** do not evaluate metadata expressions that can use references ([#18001](https://github.com/angular/angular/issues/18001)) ([ddb766e](https://github.com/angular/angular/commit/ddb766e))
* **compiler:** update the schema by extracting from latest chrome ([#17858](https://github.com/angular/angular/issues/17858)) ([dd7c113](https://github.com/angular/angular/commit/dd7c113))
* **compiler:** add support `::ng-deep` ([b754e60](https://github.com/angular/angular/commit/b754e60))
* **compiler-cli:** add parameters to ngc main needed by bazel rules ([#17885](https://github.com/angular/angular/issues/17885)) ([c1474f3](https://github.com/angular/angular/commit/c1474f3))
* **compiler-cli:** new compiler api and command-line using TypeScript transformers ([3097083](https://github.com/angular/angular/commit/3097083))
* **core:** update zone.js to 0.8.12 ([5ac3919](https://github.com/angular/angular/commit/5ac3919))
* **router:** add router-level events for GuardsCheck and Resolve ([#17601](https://github.com/angular/angular/issues/17601)) ([8a1a989](https://github.com/angular/angular/commit/8a1a989))
* **upgrade:** fix support for `directive.link` in upgraded components ([0193be7](https://github.com/angular/angular/commit/0193be7))




<a name="4.2.6"></a>
## [4.2.6](https://github.com/angular/angular/compare/4.2.5...4.2.6) (2017-07-08)


### Bug Fixes

* **animations:** ensure `:animating` queries collect previous animation elements properly ([d48b7d3](https://github.com/angular/angular/commit/d48b7d3))
* **animations:** properly cleanup query artificats when animation construction fails ([00de9ff](https://github.com/angular/angular/commit/00de9ff))
* **animations:** properly detect state transition changes for object literals ([00c9741](https://github.com/angular/angular/commit/00c9741))
* **animations:** properly handle cancelled animation style application ([cf57527](https://github.com/angular/angular/commit/cf57527))
* **compiler:** emits quoted keys only if they are quoted in the original template ([45ae14c](https://github.com/angular/angular/commit/45ae14c)), closes [#14292](https://github.com/angular/angular/issues/14292)
* **compiler:** fix merge error ([6307581](https://github.com/angular/angular/commit/6307581))
* **compiler:** fix types ([5ea9b62](https://github.com/angular/angular/commit/5ea9b62))
* **compiler:** remove i18n markup even if no translations ([#17999](https://github.com/angular/angular/issues/17999)) ([2763577](https://github.com/angular/angular/commit/2763577)), closes [#11042](https://github.com/angular/angular/issues/11042)
* **compiler-cli:** fix relative source paths on windows for extracted msg ([#17915](https://github.com/angular/angular/issues/17915)) ([991f8ad](https://github.com/angular/angular/commit/991f8ad)), closes [#16639](https://github.com/angular/angular/issues/16639)
* **core:** fix re-insertions in the iterable differ ([#17891](https://github.com/angular/angular/issues/17891)) ([a318093](https://github.com/angular/angular/commit/a318093)), closes [#17852](https://github.com/angular/angular/issues/17852)
* **language-service:** do not crash when hovering over a label definitions ([#17974](https://github.com/angular/angular/issues/17974)) ([2ab9057](https://github.com/angular/angular/commit/2ab9057))
* **language-service:** ignore hover of symbols not in the TypeScript program ([#17969](https://github.com/angular/angular/issues/17969)) ([fe09e10](https://github.com/angular/angular/commit/fe09e10))
* **router:** encode URLs the same way AngularJS did (closer to spec) ([#17890](https://github.com/angular/angular/issues/17890)) ([8f7cce3](https://github.com/angular/angular/commit/8f7cce3)), closes [#16067](https://github.com/angular/angular/issues/16067)
* **router:** export missing UrlMatcher and UrlMatchResult types ([12a2099](https://github.com/angular/angular/commit/12a2099)), closes [#15140](https://github.com/angular/angular/issues/15140)
* **tsc-wrapped:** emit exports metadata in flat modules ([#17893](https://github.com/angular/angular/issues/17893)) ([ee7d134](https://github.com/angular/angular/commit/ee7d134))
* **upgrade:** fix transclusion on upgraded components ([#17971](https://github.com/angular/angular/issues/17971)) ([5337874](https://github.com/angular/angular/commit/5337874)), closes [#13271](https://github.com/angular/angular/issues/13271)
* **upgrade:** fix transclusion on upgraded components ([#17971](https://github.com/angular/angular/issues/17971)) ([30beb52](https://github.com/angular/angular/commit/30beb52)), closes [#13271](https://github.com/angular/angular/issues/13271)


### Performance Improvements

* **core:** refactor NgZone, decrease size by 1.2Kb ([#17773](https://github.com/angular/angular/issues/17773)) ([6d55a80](https://github.com/angular/angular/commit/6d55a80))



<a name="4.2.5"></a>
## [4.2.5](https://github.com/angular/angular/compare/4.2.4...4.2.5) (2017-06-29)


### Bug Fixes

* **animations:** do not delay style() values before a stagger() runs ([7559b78](https://github.com/angular/angular/commit/7559b78)), closes [#17412](https://github.com/angular/angular/issues/17412)
* **animations:** do not remove container nodes when children are queried by a parent animation ([ec4ae60](https://github.com/angular/angular/commit/ec4ae60)), closes [#17746](https://github.com/angular/angular/issues/17746)
* **animations:** do not validate style overlap errors in different transitions ([6909171](https://github.com/angular/angular/commit/6909171))
* **animations:** properly collect :enter nodes that exist within multi-level DOM trees ([79b6346](https://github.com/angular/angular/commit/79b6346)), closes [#17632](https://github.com/angular/angular/issues/17632)
* **core:** add needed closure compiler warning suppression ([f31b0d6](https://github.com/angular/angular/commit/f31b0d6))



<a name="4.2.4"></a>
## [4.2.4](https://github.com/angular/angular/compare/4.2.3...4.2.4) (2017-06-21)


### Bug Fixes

* **compiler:** avoid emitting self importing factories ([c112232](https://github.com/angular/angular/commit/c112232))
* **compiler-cli:** find lazy routes in nested module import arrays ([59299de](https://github.com/angular/angular/commit/59299de))
* **core**: argument destructuring sometimes breaks strictNullChecks ([77860a0](https://github.com/angular/angular/commit/77860a0))
* **forms:** roll back breaking change with min/max directives ([4ab7353](https://github.com/angular/angular/commit/4ab7353)), closes [#17491](https://github.com/angular/angular/issues/17491)
* **language-service:** infer `any` `ngForOf` of type `any` ([63a5f33](https://github.com/angular/angular/commit/63a5f33))
* **language-service:** rollup `tslib` into the language service package ([20eb5cf](https://github.com/angular/angular/commit/20eb5cf))
* **router:** update the version placeholder so that it gets replaced during the build ([7de1ae2](https://github.com/angular/angular/commit/7de1ae2)), closes [#17403](https://github.com/angular/angular/issues/17403)
* **tsc-wrapped:** skip collecting metadata for default functions ([3390648](https://github.com/angular/angular/commit/3390648))



<a name="4.2.3"></a>
## [4.2.3](https://github.com/angular/angular/compare/4.2.1...4.2.3) (2017-06-16)


### Bug Fixes

* **animations:** compute removal node height correctly ([185075d](https://github.com/angular/angular/commit/185075d))
* **animations:** do not treat a `0` animation state as `void` ([451257a](https://github.com/angular/angular/commit/451257a))
* **animations:** properly collect :enter nodes in a partially updated collection ([6ca4692](https://github.com/angular/angular/commit/6ca4692)), closes [#17440](https://github.com/angular/angular/issues/17440)
* **animations:** remove duplicate license header ([b192dd5](https://github.com/angular/angular/commit/b192dd5))
* **forms:** temp roll back breaking change with min/max directives ([b8c39cd](https://github.com/angular/angular/commit/b8c39cd)), closes [#17491](https://github.com/angular/angular/issues/17491)



<a name="4.2.2"></a>
## [4.2.2](https://github.com/angular/angular/compare/4.2.1...4.2.2) (2017-06-12)


### Bug Fixes

* **animations:** compute removal node height correctly ([185075d](https://github.com/angular/angular/commit/185075d))
* **animations:** do not treat a `0` animation state as `void` ([451257a](https://github.com/angular/angular/commit/451257a))
* **animations:** properly collect :enter nodes in a partially updated collection ([6ca4692](https://github.com/angular/angular/commit/6ca4692)), closes [#17440](https://github.com/angular/angular/issues/17440)
* **compiler:** don’t always compile `.ngfactory.ts` files by default ([ed73d4f](https://github.com/angular/angular/commit/ed73d4f3ac6b542bf5ea3eb73fbe91e2ceabcdb4))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/angular/angular/compare/4.2.0-rc.2...4.2.1) (2017-06-09)


### Bug Fixes


* **compiler:** don’t write summaries for jit by default ([d3a5f1a](https://github.com/angular/angular/commit/d3a5f1a))
* **http:** move destructuring inside {Request,Response}Options ctor ([c2d31fb](https://github.com/angular/angular/commit/c2d31fb)), closes [#16663](https://github.com/angular/angular/issues/16663)



<a name="4.2.0"></a>
# [4.2.0](https://github.com/angular/angular/compare/4.2.0-rc.2...4.2.0) salubrious-stratagem (2017-06-08)


### Bug Fixes

* **animations:** ensure web-animations understands a numeric CSS perspective value ([819514a](https://github.com/angular/angular/commit/819514a)), closes [#14007](https://github.com/angular/angular/issues/14007)
* **animations:** evaluate substitutions on option param values ([e9886d7](https://github.com/angular/angular/commit/e9886d7))
* **forms:** fix min and max validator behavior on non-numbers ([a222c3e](https://github.com/angular/angular/commit/a222c3e))
* **router:** opening links in new window ([4c32cb9](https://github.com/angular/angular/commit/4c32cb9))
* **upgrade:** call setInterval outside the Angular zone ([269bbe0](https://github.com/angular/angular/commit/269bbe0))


### Features

* **compiler-cli:** introduce synchronous codegen API ([b00b80a](https://github.com/angular/angular/commit/b00b80a))


### Performance Improvements

* **animations:** do not create a closure each time a node is removed ([fe6b39d](https://github.com/angular/angular/commit/fe6b39d))
* **animations:** only apply `:leave` flags if animations are set to run ([b55adee](https://github.com/angular/angular/commit/b55adee))



<a name="4.2.0-rc.2"></a>
# [4.2.0-rc.2](https://github.com/angular/angular/compare/4.2.0-rc.1...4.2.0-rc.2) (2017-06-01)

### Bug Fixes

* **animations:** always change to desired animation state even if no transition fires ([#17025](https://github.com/angular/angular/issues/17025)) ([665e707](https://github.com/angular/angular/commit/665e707)), closes [#16947](https://github.com/angular/angular/issues/16947)
* **animations:** do not retain deleted nodes during an non-removal animation ([#17153](https://github.com/angular/angular/issues/17153)) ([068133e](https://github.com/angular/angular/commit/068133e)), closes [#17086](https://github.com/angular/angular/issues/17086)
* **common:** always use 'other' case for locales with no plural rules ([#16990](https://github.com/angular/angular/issues/16990)) ([535d9da](https://github.com/angular/angular/commit/535d9da))
* **compiler:** enableLegacyTemplate should not be ignored ([#17051](https://github.com/angular/angular/issues/17051)) ([8ffa483](https://github.com/angular/angular/commit/8ffa483)), closes [#15555](https://github.com/angular/angular/issues/15555)
* **router:** make remove trailing slash consistent with URL params ([c20f60b](https://github.com/angular/angular/commit/c20f60b)), closes [#16069](https://github.com/angular/angular/issues/16069)

### Features

* **compiler:** emit typescript nodes from an output ast ([#16823](https://github.com/angular/angular/issues/16823)) ([18bf772](https://github.com/angular/angular/commit/18bf772))
* **compiler-cli:** produce template diagnostics error messages ([#17125](https://github.com/angular/angular/issues/17125)) ([230255f](https://github.com/angular/angular/commit/230255f))
* **tsc-wrapped:** always convert shorthand imports ([#16898](https://github.com/angular/angular/issues/16898)) ([ea8a43d](https://github.com/angular/angular/commit/ea8a43d))

### Performance Improvements

* **animations:** do not place enterId values on elements for querying purposes ([#17150](https://github.com/angular/angular/issues/17150)) ([ad6a57e](https://github.com/angular/angular/commit/ad6a57e))

<a name="4.2.0-rc.1"></a>
# [4.2.0-rc.1](https://github.com/angular/angular/compare/4.2.0-rc.0...4.2.0-rc.1) (2017-05-26)

### Bug Fixes

* **animations:** repair flicker issues with WA polyfill ([#16937](https://github.com/angular/angular/issues/16937)) ([e7d9fd8](https://github.com/angular/angular/commit/e7d9fd8)), closes [#16919](https://github.com/angular/angular/issues/16919) [#16918](https://github.com/angular/angular/issues/16918)
* **animations:** use a lightweight renderer for non-animation components ([#17003](https://github.com/angular/angular/issues/17003)) ([3ab86bd](https://github.com/angular/angular/commit/3ab86bd))
* **compiler:** compile `.ngfactory.ts` files even if nobody references them. ([#16899](https://github.com/angular/angular/issues/16899)) ([573b861](https://github.com/angular/angular/commit/573b861)), closes [#16741](https://github.com/angular/angular/issues/16741)
* **compiler:** do not report type errors for arguments with `@Inject` ([#16222](https://github.com/angular/angular/issues/16222)) ([27761b4](https://github.com/angular/angular/commit/27761b4)), closes [#15424](https://github.com/angular/angular/issues/15424)
* **core:** make decorators closure safe ([#16905](https://github.com/angular/angular/issues/16905)) ([a80ac0a](https://github.com/angular/angular/commit/a80ac0a)), closes [#16889](https://github.com/angular/angular/issues/16889)
* **tsc-wrapped:** ignore `|null` and `|undefined` when collecting types ([#16222](https://github.com/angular/angular/issues/16222)) ([1651a8f](https://github.com/angular/angular/commit/1651a8f))
* **tsc-wrapped:** resolve short-hand literal values to locals ([#16873](https://github.com/angular/angular/issues/16873)) ([11c10b2](https://github.com/angular/angular/commit/11c10b2))


### Features

* **compiler:** add location note to extracted xliff2 files ([#16791](https://github.com/angular/angular/issues/16791)) ([08dfe91](https://github.com/angular/angular/commit/08dfe91)), closes [#16531](https://github.com/angular/angular/issues/16531)
* **core:** update zone.js to 0.8.10 and expose the flush method ([#16860](https://github.com/angular/angular/issues/16860)) ([85d4c4b](https://github.com/angular/angular/commit/85d4c4b))
* **tsc-wrapped:** support template literals in metadata collection ([#16880](https://github.com/angular/angular/issues/16880)) ([6e41add](https://github.com/angular/angular/commit/6e41add))



<a name="4.2.0-rc.0"></a>
# [4.2.0-rc.0](https://github.com/angular/angular/compare/4.2.0-beta.0...4.2.0-rc.0) (2017-05-19)


### Bug Fixes

* **animations:** make sure reusable animation substitutions work without default params ([#16875](https://github.com/angular/angular/issues/16875)) ([7d9f96a](https://github.com/angular/angular/commit/7d9f96a))
* **animations:** only require one flushMicrotasks call when testing animations ([6cb93c1](https://github.com/angular/angular/commit/6cb93c1))
* **compiler:** avoid a `...null` spread in extraction ([#16547](https://github.com/angular/angular/issues/16547)) ([e0a8376](https://github.com/angular/angular/commit/e0a8376))
* **compiler-cli:** allow '==' to compare nullable types ([#16731](https://github.com/angular/angular/issues/16731)) ([d761059](https://github.com/angular/angular/commit/d761059))
* **core:** detach projected views when a parent view is destroyed ([#16592](https://github.com/angular/angular/issues/16592)) ([f0f6544](https://github.com/angular/angular/commit/f0f6544)), closes [#15578](https://github.com/angular/angular/issues/15578)
* **core:** projected views should be dirty checked when the declaring component is dirty checked. ([#16592](https://github.com/angular/angular/issues/16592)) ([fcc91d8](https://github.com/angular/angular/commit/fcc91d8)), closes [#14321](https://github.com/angular/angular/issues/14321)
* **http:** flatten metadata for [@angular](https://github.com/angular)/http/testing ([9da6340](https://github.com/angular/angular/commit/9da6340)), closes [#15521](https://github.com/angular/angular/issues/15521)
* **http:** honor RequestArgs.search and RequestArgs.params map type ([aef5245](https://github.com/angular/angular/commit/aef5245)), closes [#15761](https://github.com/angular/angular/issues/15761) [#16392](https://github.com/angular/angular/issues/16392)
* **http:** introduce encodingHint for text() for better ArrayBuffer support ([7ae7a84](https://github.com/angular/angular/commit/7ae7a84)), closes [#15932](https://github.com/angular/angular/issues/15932) [#16420](https://github.com/angular/angular/issues/16420)
* **router:** fix redirect to a URL with a param having multiple values ([#16376](https://github.com/angular/angular/issues/16376)) ([5d4b36f](https://github.com/angular/angular/commit/5d4b36f)), closes [#16310](https://github.com/angular/angular/issues/16310)


### Features

* **animations:** introduce a wave of new animation features ([16c8167](https://github.com/angular/angular/commit/16c8167))
* **animations:** introduce routable animation support ([f1a9e3c](https://github.com/angular/angular/commit/f1a9e3c))
* add .ngsummary.ts files to support AOT unit tests ([547c363](https://github.com/angular/angular/commit/547c363))
* introduce `TestBed.overrideProvider` ([#16725](https://github.com/angular/angular/issues/16725)) ([39b92f7](https://github.com/angular/angular/commit/39b92f7))
* **compiler:** support a non-null postfix assert ([#16672](https://github.com/angular/angular/issues/16672)) ([b9521b5](https://github.com/angular/angular/commit/b9521b5))
* **core:** introduce fixture.whenRenderingDone for testing ([#16732](https://github.com/angular/angular/issues/16732)) ([38c524d](https://github.com/angular/angular/commit/38c524d))


### Performance Improvements

* **animations:** reduce size of animations bundle ([712630c](https://github.com/angular/angular/commit/712630c))



<a name="4.1.3"></a>
## [4.1.3](https://github.com/angular/angular/compare/4.1.2...4.1.3) (2017-05-17)


### Bug Fixes

* add typescript 2.3.2 typings test ([#16738](https://github.com/angular/angular/issues/16738)) ([a5bdbed](https://github.com/angular/angular/commit/a5bdbed)), closes [#16663](https://github.com/angular/angular/issues/16663)
* **compiler-cli:** import routing module with forRoot ([#16438](https://github.com/angular/angular/issues/16438)) ([b7f8581](https://github.com/angular/angular/commit/b7f8581))
* **platform-server:** wait for async app initializers to complete before removing server side styles ([#16712](https://github.com/angular/angular/issues/16712)) ([0a82f7d](https://github.com/angular/angular/commit/0a82f7d)), closes [#15716](https://github.com/angular/angular/issues/15716)
* **router:** Wrap Promise-like instances in native Promises ([#16759](https://github.com/angular/angular/issues/16759)) ([883ca28](https://github.com/angular/angular/commit/883ca28))
* **upgrade:** Prevent renaming of $inject property ([#16706](https://github.com/angular/angular/issues/16706)) ([afb7540](https://github.com/angular/angular/commit/afb7540))
* **upgrade:** use quote to prevent ClossureCompiler obfuscating $event. ([#16724](https://github.com/angular/angular/issues/16724)) ([47df3d6](https://github.com/angular/angular/commit/47df3d6))



<a name="4.2.0-beta.1"></a>
# [4.2.0-beta.1](https://github.com/angular/angular/compare/4.2.0-beta.0...4.2.0-beta.1) (2017-05-10)


### Features

* add .ngsummary.ts files to support AOT unit tests ([547c363](https://github.com/angular/angular/commit/547c363))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/angular/angular/compare/4.1.1...4.1.2) (2017-05-10)


### Bug Fixes

* **compiler:** avoid a `...null` spread in extraction ([#16547](https://github.com/angular/angular/issues/16547)) ([d0e1688](https://github.com/angular/angular/commit/d0e1688))
* **core:** detach projected views when a parent view is destroyed ([#16592](https://github.com/angular/angular/issues/16592)) ([ee6705a](https://github.com/angular/angular/commit/ee6705a)), closes [#15578](https://github.com/angular/angular/issues/15578)
* **core:** projected views should be dirty checked when the declaring component is dirty checked. ([#16592](https://github.com/angular/angular/issues/16592)) ([9218812](https://github.com/angular/angular/commit/9218812)), closes [#14321](https://github.com/angular/angular/issues/14321)
* **http:** flatten metadata for [@angular](https://github.com/angular)/http/testing ([9c70a3c](https://github.com/angular/angular/commit/9c70a3c)), closes [#15521](https://github.com/angular/angular/issues/15521)
* **http:** honor RequestArgs.search and RequestArgs.params map type ([63066f7](https://github.com/angular/angular/commit/63066f7)), closes [#15761](https://github.com/angular/angular/issues/15761) [#16392](https://github.com/angular/angular/issues/16392)
* **http:** introduce encodingHint for text() for better ArrayBuffer support ([ec3b6e9](https://github.com/angular/angular/commit/ec3b6e9)), closes [#15932](https://github.com/angular/angular/issues/15932) [#16420](https://github.com/angular/angular/issues/16420)
* **router:** fix redirect to a URL with a param having multiple values ([#16376](https://github.com/angular/angular/issues/16376)) ([915eae5](https://github.com/angular/angular/commit/915eae5)), closes [#16310](https://github.com/angular/angular/issues/16310)



<a name="4.2.0-beta.0"></a>
# [4.2.0-beta.0](https://github.com/angular/angular/compare/4.1.0...4.2.0-beta.0) (2017-05-04)


### Bug Fixes

* **core**: strictNullCheck support. ([#16389](https://github.com/angular/angular/issues/16389)) ([#16389](https://github.com/angular/angular/issues/16389)) ([8c09d10](https://github.com/angular/angular/commit/8c09d10)), closes [#16357](https://github.com/angular/angular/issues/16357)
* **core:** allow directives to inject the component’s `ChangeDetectorRef`. ([#16394](https://github.com/angular/angular/issues/16394)) ([392d584](https://github.com/angular/angular/commit/392d584)), closes [#12816](https://github.com/angular/angular/issues/12816)
* **core:** allow to detach `OnPush` components ([#16394](https://github.com/angular/angular/issues/16394)) ([aa8bba4](https://github.com/angular/angular/commit/aa8bba4)), closes [#9720](https://github.com/angular/angular/issues/9720)
* **core:** don’t set `ng-version` for dynamically created components ([#16394](https://github.com/angular/angular/issues/16394)) ([a4de214](https://github.com/angular/angular/commit/a4de214)), closes [#15880](https://github.com/angular/angular/issues/15880)
* **core:** don’t stop change detection because of errors ([e263e19](https://github.com/angular/angular/commit/e263e19)), closes [#9531](https://github.com/angular/angular/issues/9531) [#2413](https://github.com/angular/angular/issues/2413) [#15925](https://github.com/angular/angular/issues/15925)
* **language-service:** remove asserts for non-null expressions ([#16422](https://github.com/angular/angular/issues/16422)) ([253345c](https://github.com/angular/angular/commit/253345c))
* **upgrade:** initialize all inputs in time for `ngOnChanges()` ([b3e63c0](https://github.com/angular/angular/commit/b3e63c0)), closes [#16212](https://github.com/angular/angular/issues/16212)


### Features

* **compiler-cli:** add param to set MissingTranslationStrategy on ngc ([#15987](https://github.com/angular/angular/issues/15987)) ([6e2abcd](https://github.com/angular/angular/commit/6e2abcd)), closes [#15808](https://github.com/angular/angular/issues/15808)
* **core:** add `begin` and `end` renderer methods to track change detection ([7f9c589](https://github.com/angular/angular/commit/7f9c589))
* **core:** allow custom selector when bootstrapping components ([#15668](https://github.com/angular/angular/issues/15668)) ([900a88b](https://github.com/angular/angular/commit/900a88b)), closes [#7136](https://github.com/angular/angular/issues/7136)
* **core:** upgrade dep on zone.js to 0.8.9 ([#16401](https://github.com/angular/angular/issues/16401)) ([065b76d](https://github.com/angular/angular/commit/065b76d))
* **forms:** introduce min and max validators ([#15813](https://github.com/angular/angular/issues/15813)) ([81925fa](https://github.com/angular/angular/commit/81925fa))
* **language-service:** provide external file list to TypeScript ([#16417](https://github.com/angular/angular/issues/16417)) ([f4b771a](https://github.com/angular/angular/commit/f4b771a))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/angular/angular/compare/4.1.0...4.1.1) (2017-05-04)


### Bug Fixes

* **core**: strictNullCheck support. ([#16389](https://github.com/angular/angular/issues/16389)) ([#16389](https://github.com/angular/angular/issues/16389)) ([427d63a](https://github.com/angular/angular/commit/427d63a)), closes [#16357](https://github.com/angular/angular/issues/16357)
* **core:** allow directives to inject the component’s `ChangeDetectorRef`. ([#16394](https://github.com/angular/angular/issues/16394)) ([f66e59e](https://github.com/angular/angular/commit/f66e59e)), closes [#12816](https://github.com/angular/angular/issues/12816)
* **core:** allow to detach `OnPush` components ([#16394](https://github.com/angular/angular/issues/16394)) ([acf83b9](https://github.com/angular/angular/commit/acf83b9)), closes [#9720](https://github.com/angular/angular/issues/9720)
* **core:** don’t set `ng-version` for dynamically created components ([#16394](https://github.com/angular/angular/issues/16394)) ([85a1b54](https://github.com/angular/angular/commit/85a1b54)), closes [#15880](https://github.com/angular/angular/issues/15880)
* **core:** don’t stop change detection because of errors ([07cef36](https://github.com/angular/angular/commit/07cef36)), closes [#9531](https://github.com/angular/angular/issues/9531) [#2413](https://github.com/angular/angular/issues/2413) [#15925](https://github.com/angular/angular/issues/15925)
* **language-service:** remove asserts for non-null expressions ([#16422](https://github.com/angular/angular/issues/16422)) ([c060110](https://github.com/angular/angular/commit/c060110))
* **upgrade:** initialize all inputs in time for `ngOnChanges()` ([dd4e501](https://github.com/angular/angular/commit/dd4e501)), closes [#16212](https://github.com/angular/angular/issues/16212)



<a name="4.1.0"></a>
# [4.1.0](https://github.com/angular/angular/compare/4.1.0-rc.0...4.1.0) (2017-04-26)


### Bug Fixes

* **router:** forward the query parameters in the ng1 -> ng2 url sync ([#16249](https://github.com/angular/angular/issues/16249)) ([2f97731](https://github.com/angular/angular/commit/2f97731)), closes [#16067](https://github.com/angular/angular/issues/16067)
* **upgrade:** use correct attribute name for upgraded component's bindings ([#16128](https://github.com/angular/angular/issues/16128)) ([d1fb066](https://github.com/angular/angular/commit/d1fb066)), closes [#8856](https://github.com/angular/angular/issues/8856)


<a name="4.1.0-rc.0"></a>
# [4.1.0-rc.0](https://github.com/angular/angular/compare/4.1.0-beta.0...4.1.0-rc.0) (2017-04-21)


### Bug Fixes

* **benchpress:** chrome - prevent trace buffer overflow ([2f44206](https://github.com/angular/angular/commit/2f44206))
* **benchpress:** Update types for TypeScript nullability support ([14669f2](https://github.com/angular/angular/commit/14669f2))
* **common:** Update types for TypeScript nullability support ([d8b73e4](https://github.com/angular/angular/commit/d8b73e4))
* **compiler:** fix build error in xliff2 ([bd704c9](https://github.com/angular/angular/commit/bd704c9))
* **compiler:** fix inheritance for AOT with summaries ([#15583](https://github.com/angular/angular/issues/15583)) ([8ef621a](https://github.com/angular/angular/commit/8ef621a))
* **compiler:** ignore calls to unresolved symbols in metadata ([38a7e0d](https://github.com/angular/angular/commit/38a7e0d)), closes [#15969](https://github.com/angular/angular/issues/15969)
* **compiler:** ignore calls to unresolved symbols in metadata ([#15970](https://github.com/angular/angular/issues/15970)) ([ce47d33](https://github.com/angular/angular/commit/ce47d33)), closes [#15969](https://github.com/angular/angular/issues/15969)
* **compiler:** Inform user where Quoted error was thrown ([a77b126](https://github.com/angular/angular/commit/a77b126))
* **compiler:** make I18NHtmlParser provider AoT-compliant ([#15980](https://github.com/angular/angular/issues/15980)) ([745731e](https://github.com/angular/angular/commit/745731e))
* **compiler:** support `<ng-container>` whatever the namespace ([5b141fb](https://github.com/angular/angular/commit/5b141fb)), closes [#14257](https://github.com/angular/angular/issues/14257)
* **compiler:** suppress another closure warning ([#16137](https://github.com/angular/angular/issues/16137)) ([11b0213](https://github.com/angular/angular/commit/11b0213))
* **compiler:** Update types for TypeScript nullability support ([09d9f5f](https://github.com/angular/angular/commit/09d9f5f))
* **core:** benchmarks - enable ng1 benchmark again ([bccfaa4](https://github.com/angular/angular/commit/bccfaa4))
* **core:** distribute externs for testability API ([#16179](https://github.com/angular/angular/issues/16179)) ([da66884](https://github.com/angular/angular/commit/da66884))
* **core:** key-value differ changes iteration ([#15968](https://github.com/angular/angular/issues/15968)) ([cb5a7ef](https://github.com/angular/angular/commit/cb5a7ef)), closes [#14997](https://github.com/angular/angular/issues/14997)
* **forms:** Update types for TypeScript nullability support ([6649743](https://github.com/angular/angular/commit/6649743))
* **forms:** Update types for TypeScript nullability support ([57bc245](https://github.com/angular/angular/commit/57bc245))
* **forms:** Update types for TypeScript nullability support ([#15859](https://github.com/angular/angular/issues/15859)) ([6a2e08d](https://github.com/angular/angular/commit/6a2e08d))
* **http:** Update types for TypeScript nullability support ([c36ec9b](https://github.com/angular/angular/commit/c36ec9b))
* **http:** Update types for TypeScript nullability support ([ec028b8](https://github.com/angular/angular/commit/ec028b8))
* **language-service:** avoid throwing exceptions when reporting metadata errors ([7764c5c](https://github.com/angular/angular/commit/7764c5c))
* **language-service:** detect when there isn't a tsconfig.json ([258d539](https://github.com/angular/angular/commit/258d539)), closes [#15874](https://github.com/angular/angular/issues/15874)
* **language-service:** improve resilience to incomplete information ([71a8627](https://github.com/angular/angular/commit/71a8627))
* **language-service:** infer correct type of `?.` expressions ([0a3a9af](https://github.com/angular/angular/commit/0a3a9af)), closes [#15885](https://github.com/angular/angular/issues/15885)
* **language-service:** initialize static reflector correctly ([fe0d02f](https://github.com/angular/angular/commit/fe0d02f)), closes [#15768](https://github.com/angular/angular/issues/15768)
* **language-service:** look for type constructors on canonical symbol ([2ddf3bc](https://github.com/angular/angular/commit/2ddf3bc))
* **language-service:** only use canonical symbols ([5a88d2f](https://github.com/angular/angular/commit/5a88d2f))
* **language-service:** parse extended i18n forms ([bde9771](https://github.com/angular/angular/commit/bde9771))
* **language-service:** resolve any parameter types to any result ([5fbb0d0](https://github.com/angular/angular/commit/5fbb0d0))
* **language-service:** respect baseUrl compiler option ([f21ff90](https://github.com/angular/angular/commit/f21ff90)), closes [#15974](https://github.com/angular/angular/issues/15974)
* **language-service:** Update types for TypeScript nullability support ([540581d](https://github.com/angular/angular/commit/540581d))
* **packaging:** increased buffer size ([#15840](https://github.com/angular/angular/issues/15840)) ([65af964](https://github.com/angular/angular/commit/65af964))
* **platform-browser:** Update types for TypeScript nullability support ([728c9d0](https://github.com/angular/angular/commit/728c9d0)), closes [#15898](https://github.com/angular/angular/issues/15898)
* **platform-server:** handle innerText ([#15818](https://github.com/angular/angular/issues/15818)) ([9394835](https://github.com/angular/angular/commit/9394835))
* **router:** fix query param parsing ([a487563](https://github.com/angular/angular/commit/a487563))
* **router:** prevent `RouterLinkActive` from causing an infinite CD loop ([82417b3](https://github.com/angular/angular/commit/82417b3)), closes [#15825](https://github.com/angular/angular/issues/15825)
* **router:** relax nullability requirements ([a0d124b](https://github.com/angular/angular/commit/a0d124b))
* turn on nullability in the code base. ([5293794](https://github.com/angular/angular/commit/5293794))
* Update types for TypeScript nullability support in examples ([6f5fccf](https://github.com/angular/angular/commit/6f5fccf))
* **router:** the preloader use the module from the loaded config ([6d12aa9](https://github.com/angular/angular/commit/6d12aa9))
* **router:** Update types for TypeScript nullability support ([56c46d7](https://github.com/angular/angular/commit/56c46d7))
* **router:** Update types for TypeScript nullability support ([bc43188](https://github.com/angular/angular/commit/bc43188))
* **tsc-wrapped:** collect new expressions with no arguments ([#15908](https://github.com/angular/angular/issues/15908)) ([70b1d6d](https://github.com/angular/angular/commit/70b1d6d)), closes [#15906](https://github.com/angular/angular/issues/15906)
* **tsc-wrapped:** ensure valid path separators in metadata ([96aa236](https://github.com/angular/angular/commit/96aa236))
* **upgrade:** Update types for TypeScript nullability support ([01d93f3](https://github.com/angular/angular/commit/01d93f3)), closes [#15897](https://github.com/angular/angular/issues/15897)


### Features

* **animations:** Update types for TypeScript nullability support ([38d75d4](https://github.com/angular/angular/commit/38d75d4)), closes [#15870](https://github.com/angular/angular/issues/15870)
* **compiler:** add source files to xmb/xliff translations ([#14705](https://github.com/angular/angular/issues/14705)) ([4054055](https://github.com/angular/angular/commit/4054055)), closes [#14190](https://github.com/angular/angular/issues/14190)
* **compiler:** Implement i18n XLIFF 2.0 serializer ([#14185](https://github.com/angular/angular/issues/14185)) ([09c4cb2](https://github.com/angular/angular/commit/09c4cb2)), closes [#11735](https://github.com/angular/angular/issues/11735)
* **upgrade:** allow setting the angularjs lib at runtime ([#15168](https://github.com/angular/angular/issues/15168)) ([e927aea](https://github.com/angular/angular/commit/e927aea))
* **upgrade:** allow setting the angularjs lib at runtime ([#15168](https://github.com/angular/angular/issues/15168)) ([8ad464d](https://github.com/angular/angular/commit/8ad464d))
* **upgrade:** fixes for allow setting the angularjs lib at runtime ([90814e4](https://github.com/angular/angular/commit/90814e4))
* add support for TS 2.2 ([3c8a61e](https://github.com/angular/angular/commit/3c8a61e))
* add support for TS 2.3 ([014594f](https://github.com/angular/angular/commit/014594f))



<a name="4.0.3"></a>
## [4.0.3](https://github.com/angular/angular/compare/4.0.2...4.0.3) (2017-04-21)


### Bug Fixes

* **benchpress:** chrome - prevent trace buffer overflow ([d216f94](https://github.com/angular/angular/commit/d216f94))
* **compiler:** fix build error in xliff2 ([1870347](https://github.com/angular/angular/commit/1870347))
* **compiler:** ignore calls to unresolved symbols in metadata ([d4038ab](https://github.com/angular/angular/commit/d4038ab)), closes [#15969](https://github.com/angular/angular/issues/15969)
* **compiler:** ignore calls to unresolved symbols in metadata ([#15970](https://github.com/angular/angular/issues/15970)) ([db25f08](https://github.com/angular/angular/commit/db25f08)), closes [#15969](https://github.com/angular/angular/issues/15969)
* **compiler:** Inform user where Quoted error was thrown ([3184cc5](https://github.com/angular/angular/commit/3184cc5))
* **compiler:** suppress another closure warning ([#16137](https://github.com/angular/angular/issues/16137)) ([72e240a](https://github.com/angular/angular/commit/72e240a))
* **core:** benchmarks - enable ng1 benchmark again ([ccac4c6](https://github.com/angular/angular/commit/ccac4c6))
* **core:** distribute externs for testability API ([#16179](https://github.com/angular/angular/issues/16179)) ([e377d9d](https://github.com/angular/angular/commit/e377d9d))
* **core:** key-value differ changes iteration ([#15968](https://github.com/angular/angular/issues/15968)) ([a8600dc](https://github.com/angular/angular/commit/a8600dc)), closes [#14997](https://github.com/angular/angular/issues/14997)
* **language-service:** only use canonical symbols ([786093a](https://github.com/angular/angular/commit/786093a))
* **packaging:** increased buffer size ([#15840](https://github.com/angular/angular/issues/15840)) ([88ad490](https://github.com/angular/angular/commit/88ad490))
* **platform-server:** handle innerText ([#15818](https://github.com/angular/angular/issues/15818)) ([7de340d](https://github.com/angular/angular/commit/7de340d))
* **router:** prevent `RouterLinkActive` from causing an infinite CD loop ([4479c42](https://github.com/angular/angular/commit/4479c42)), closes [#15825](https://github.com/angular/angular/issues/15825)
* **tsc-wrapped:** collect new expressions with no arguments ([#15908](https://github.com/angular/angular/issues/15908)) ([41cac9e](https://github.com/angular/angular/commit/41cac9e)), closes [#15906](https://github.com/angular/angular/issues/15906)


### Features

* **compiler:** Implement i18n XLIFF 2.0 serializer ([#14185](https://github.com/angular/angular/issues/14185)) ([a7d8edd](https://github.com/angular/angular/commit/a7d8edd)), closes [#11735](https://github.com/angular/angular/issues/11735)
* **upgrade:** allow setting the angularjs lib at runtime ([#15168](https://github.com/angular/angular/issues/15168)) ([a75d056](https://github.com/angular/angular/commit/a75d056))
* **upgrade:** allow setting the angularjs lib at runtime ([#15168](https://github.com/angular/angular/issues/15168)) ([4f172b0](https://github.com/angular/angular/commit/4f172b0))
* **upgrade:** fixes for allow setting the angularjs lib at runtime ([bb6932d](https://github.com/angular/angular/commit/bb6932d))
* add support for TS 2.3 ([5cf101f](https://github.com/angular/angular/commit/5cf101f))



<a name="4.1.0-beta.1"></a>
# [4.1.0-beta.1](https://github.com/angular/angular/compare/4.1.0-beta.0...4.1.0-beta.1) (2017-04-12)


### Bug Fixes

* **compiler:** fix inheritance for AOT with summaries ([#15583](https://github.com/angular/angular/issues/15583)) ([8ef621a](https://github.com/angular/angular/commit/8ef621a))
* **language-service:** avoid throwing exceptions when reporting metadata errors ([7764c5c](https://github.com/angular/angular/commit/7764c5c))
* **language-service:** detect when there isn't a tsconfig.json ([258d539](https://github.com/angular/angular/commit/258d539)), closes [#15874](https://github.com/angular/angular/issues/15874)
* **language-service:** improve resilience to incomplete information ([71a8627](https://github.com/angular/angular/commit/71a8627))
* **language-service:** initialize static reflector correctly ([fe0d02f](https://github.com/angular/angular/commit/fe0d02f)), closes [#15768](https://github.com/angular/angular/issues/15768)
* **language-service:** parse extended i18n forms ([bde9771](https://github.com/angular/angular/commit/bde9771))
* **language-service:** resolve any parameter types to any result ([5fbb0d0](https://github.com/angular/angular/commit/5fbb0d0))
* **router:** fix query param parsing ([a487563](https://github.com/angular/angular/commit/a487563))
* **router:** the preloader use the module from the loaded config ([6d12aa9](https://github.com/angular/angular/commit/6d12aa9))
* **tsc-wrapped:** ensure valid path separators in metadata ([96aa236](https://github.com/angular/angular/commit/96aa236))


### Features

* **animations:** Update types for TypeScript nullability support ([38d75d4](https://github.com/angular/angular/commit/38d75d4)), closes [#15870](https://github.com/angular/angular/issues/15870)
* **benchpress:** Update types for TypeScript nullability support ([14669f2](https://github.com/angular/angular/commit/14669f2))
* **common:** Update types for TypeScript nullability support ([d8b73e4](https://github.com/angular/angular/commit/d8b73e4))
* **compiler:** Update types for TypeScript nullability support ([09d9f5f](https://github.com/angular/angular/commit/09d9f5f))
* **language-service:** Update types for TypeScript nullability support ([540581d](https://github.com/angular/angular/commit/540581d))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/angular/angular/compare/4.0.1...4.0.2) (2017-04-11)


### Bug Fixes

* **compiler:** fix inheritance for AOT with summaries ([#15583](https://github.com/angular/angular/issues/15583)) ([1864ccb](https://github.com/angular/angular/commit/1864ccb))
* **language-service:** avoid throwing exceptions when reporting metadata errors ([0861fda](https://github.com/angular/angular/commit/0861fda))
* **language-service:** detect when there isn't a tsconfig.json ([168a2eb](https://github.com/angular/angular/commit/168a2eb)), closes [#15874](https://github.com/angular/angular/issues/15874)
* **language-service:** improve resilience to incomplete information ([e4277a0](https://github.com/angular/angular/commit/e4277a0))
* **language-service:** initialize static reflector correctly ([5b99533](https://github.com/angular/angular/commit/5b99533)), closes [#15768](https://github.com/angular/angular/issues/15768)
* **language-service:** parse extended i18n forms ([c9c7acd](https://github.com/angular/angular/commit/c9c7acd))
* **language-service:** resolve any parameter types to any result ([feae7b6](https://github.com/angular/angular/commit/feae7b6))
* **router:** fix query param parsing ([2f41b52](https://github.com/angular/angular/commit/2f41b52))
* **router:** the preloader use the module from the loaded config ([978f809](https://github.com/angular/angular/commit/978f809))
* **tsc-wrapped:** ensure valid path separators in metadata ([c10e50c](https://github.com/angular/angular/commit/c10e50c))



<a name="4.1.0-beta.0"></a>
# [4.1.0-beta.0](https://github.com/angular/angular/compare/4.0.0...4.1.0-beta.0) (2017-03-29)

### Features

* **compiler:** support ICU messages in XLIFF ([b8d5f87](https://github.com/angular/angular/commit/b8d5f87)), closes [#12636](https://github.com/angular/angular/issues/12636) [#15068](https://github.com/angular/angular/issues/15068)

Note: 4.1.0-beta.0 release also contains all the changes present in the 4.0.1 release.


<a name="4.0.1"></a>
## [4.0.1](https://github.com/angular/angular/compare/4.0.0...4.0.1) (2017-03-29)


### Bug Fixes

* **animations:** make sure style calculations are not computed too early ([#15540](https://github.com/angular/angular/issues/15540)) ([c828511](https://github.com/angular/angular/commit/c828511)), closes [#15507](https://github.com/angular/angular/issues/15507)
* **compiler:** allow single quotes into named interpolations ([#15461](https://github.com/angular/angular/issues/15461)) ([a654875](https://github.com/angular/angular/commit/a654875)), closes [#15318](https://github.com/angular/angular/issues/15318)
* **compiler:** ignore errors when evaluating base classes ([#15560](https://github.com/angular/angular/issues/15560)) ([a88413f](https://github.com/angular/angular/commit/a88413f)), closes [#15536](https://github.com/angular/angular/issues/15536)
* **compiler:** throw when a component defines both template and templateUrl ([#15572](https://github.com/angular/angular/issues/15572)) ([902bb2f](https://github.com/angular/angular/commit/902bb2f)), closes [#15566](https://github.com/angular/angular/issues/15566)
* **core:** check for undefined on normalizeDebugBindingValue ([#15503](https://github.com/angular/angular/issues/15503)) ([b8c0a97](https://github.com/angular/angular/commit/b8c0a97)), closes [#15494](https://github.com/angular/angular/issues/15494)
* **core:** fix inheritance in JIT mode for TS 2.1 ([#15599](https://github.com/angular/angular/issues/15599)) ([ca66530](https://github.com/angular/angular/commit/ca66530)), closes [#15502](https://github.com/angular/angular/issues/15502)
* **core:** fix the key/value differ ([#15539](https://github.com/angular/angular/issues/15539)) ([e72124c](https://github.com/angular/angular/commit/e72124c)), closes [#15457](https://github.com/angular/angular/issues/15457)
* **core:** improve error msg for invalid KeyValueDiffer.diff arg ([#15489](https://github.com/angular/angular/issues/15489)) ([d74e4d0](https://github.com/angular/angular/commit/d74e4d0)), closes [#15402](https://github.com/angular/angular/issues/15402)
* **core:** Update types for TypeScript nullability support ([#15472](https://github.com/angular/angular/issues/15472)) ([8c4b963](https://github.com/angular/angular/commit/8c4b963))
* **language-service:** be resilient to invalidate ordering ([#15470](https://github.com/angular/angular/issues/15470)) ([a2c2b87](https://github.com/angular/angular/commit/a2c2b87)), closes [#15466](https://github.com/angular/angular/issues/15466)
* **language-service:** correctly determine base members of types ([#15600](https://github.com/angular/angular/issues/15600)) ([0fe4985](https://github.com/angular/angular/commit/0fe4985)), closes [#15460](https://github.com/angular/angular/issues/15460)
* **language-service:** don't require `reflect-metadata` module to be provided ([#15569](https://github.com/angular/angular/issues/15569)) ([bfa4f70](https://github.com/angular/angular/commit/bfa4f70)), closes [#15568](https://github.com/angular/angular/issues/15568)
* **language-service:** guard access to `Symbol.members` ([#15529](https://github.com/angular/angular/issues/15529)) ([bf25e94](https://github.com/angular/angular/commit/bf25e94)), closes [#15528](https://github.com/angular/angular/issues/15528)
* **language-service:** improve performance of `updateModuleAnalysis()` ([#15543](https://github.com/angular/angular/issues/15543)) ([5597fd3](https://github.com/angular/angular/commit/5597fd3))
* **router:** should run CanActivate after CanDeactivate guards ([75478b2](https://github.com/angular/angular/commit/75478b2)), closes [#14059](https://github.com/angular/angular/issues/14059) [#15467](https://github.com/angular/angular/issues/15467)
* **router:** shouldn't execute CanLoad when a route has been loaded ([2360676](https://github.com/angular/angular/commit/2360676)), closes [#14475](https://github.com/angular/angular/issues/14475) [#15438](https://github.com/angular/angular/issues/15438)


### Performance Improvements

* **router:** don't create new serializer every time UrlTree.toString is called ([#15565](https://github.com/angular/angular/issues/15565)) ([fd61145](https://github.com/angular/angular/commit/fd61145))

<a name="4.0.0"></a>
# [4.0.0](https://github.com/angular/angular/compare/4.0.0-rc.6...4.0.0) invisible-makeover (2017-03-23)


### Bug Fixes

* **compiler:** assume queries with no matches as static ([#15429](https://github.com/angular/angular/issues/15429)) ([c8ab5cb](https://github.com/angular/angular/commit/c8ab5cb)), closes [#15417](https://github.com/angular/angular/issues/15417)
* **compiler:** correctly handle when `toString` is exported ([#15430](https://github.com/angular/angular/issues/15430)) ([0dda01e](https://github.com/angular/angular/commit/0dda01e)), closes [#15420](https://github.com/angular/angular/issues/15420)
* **platform-browser:** setAttribute should work with xmlns namespace ([#14874](https://github.com/angular/angular/issues/14874)) ([92084f2](https://github.com/angular/angular/commit/92084f2)), closes [#14865](https://github.com/angular/angular/issues/14865)
* **router:** should pass new data to Observable when query params change ([#15387](https://github.com/angular/angular/issues/15387)) ([08f2f08](https://github.com/angular/angular/commit/08f2f08)), closes [#15290](https://github.com/angular/angular/issues/15290)
* prevent strictNullChecks support until [#15432](https://github.com/angular/angular/issues/15432) is fixed ([#15434](https://github.com/angular/angular/issues/15434)) ([b800a0c](https://github.com/angular/angular/commit/b800a0c))

### BREAKING CHANGES

From 4.0.0 @angular/core uses a [`WeakMap`](https://github.com/angular/angular/commit/52b21275f4c2c26c46627f5648b41a33bb5c8283), a polyfill needs to be included for [browsers that do not support it natively](http://kangax.github.io/compat-table/es6/#test-WeakMap).

<a name="4.0.0-rc.6"></a>
# [4.0.0-rc.6](https://github.com/angular/angular/compare/4.0.0-rc.5...4.0.0-rc.6) (2017-03-23)


### Bug Fixes

* **animations:** correct the main entry path in package.json ([#15300](https://github.com/angular/angular/issues/15300)) ([2489e4b](https://github.com/angular/angular/commit/2489e4b))
* **animations:** ensure empty animate() steps work at the end of a sequence ([#15328](https://github.com/angular/angular/issues/15328)) ([fbccd5c](https://github.com/angular/angular/commit/fbccd5c)), closes [#15310](https://github.com/angular/angular/issues/15310)
* **animations:** ensure enter/leave cancellations work ([#15323](https://github.com/angular/angular/issues/15323)) ([9bf2fb4](https://github.com/angular/angular/commit/9bf2fb4)), closes [#15315](https://github.com/angular/angular/issues/15315)
* **animations:** make sure easing values work with web-animations ([#15195](https://github.com/angular/angular/issues/15195)) ([f925910](https://github.com/angular/angular/commit/f925910)), closes [#15115](https://github.com/angular/angular/issues/15115)
* **animations:** make sure non-transitioned leave operations cancel existing animations ([#15254](https://github.com/angular/angular/issues/15254)) ([a6fb78e](https://github.com/angular/angular/commit/a6fb78e)), closes [#15213](https://github.com/angular/angular/issues/15213)
* **animations:** only process element nodes through the animation engine ([#15268](https://github.com/angular/angular/issues/15268)) ([80075af](https://github.com/angular/angular/commit/80075af)), closes [#15267](https://github.com/angular/angular/issues/15267)
* **animations:** only treat view removals as `void` state transitions ([#15245](https://github.com/angular/angular/issues/15245)) ([c66437f](https://github.com/angular/angular/commit/c66437f)), closes [#15223](https://github.com/angular/angular/issues/15223)
* **animations:** stringify boolean values as `1` and `0` ([#15311](https://github.com/angular/angular/issues/15311)) ([94da801](https://github.com/angular/angular/commit/94da801)), closes [#15247](https://github.com/angular/angular/issues/15247)
* **compiler:** add an empty content for source file of non mapped code. ([#15246](https://github.com/angular/angular/issues/15246)) ([8415910](https://github.com/angular/angular/commit/8415910))
* **compiler:** don’t call `check` if we don’t need to ([#15322](https://github.com/angular/angular/issues/15322)) ([764e90f](https://github.com/angular/angular/commit/764e90f))
* **compiler:** look for flat module resources using declaration module path ([#15367](https://github.com/angular/angular/issues/15367)) ([90d2518](https://github.com/angular/angular/commit/90d2518)), closes [#15221](https://github.com/angular/angular/issues/15221)
* **compiler:** only log template deprecation warning once ([#15364](https://github.com/angular/angular/issues/15364)) ([08d8675](https://github.com/angular/angular/commit/08d8675))
* **compiler:** use attribute id to merge translations ([#15302](https://github.com/angular/angular/issues/15302)) ([1d7693c](https://github.com/angular/angular/commit/1d7693c)), closes [#15234](https://github.com/angular/angular/issues/15234)
* **compiler-cli:** adding missing format xliff for the extractor ([#15386](https://github.com/angular/angular/issues/15386)) ([a50d79d](https://github.com/angular/angular/commit/a50d79d))
* **core:** allow tree shaking of component factories and styles ([#15214](https://github.com/angular/angular/issues/15214)) ([2a0e55f](https://github.com/angular/angular/commit/2a0e55f)), closes [#15181](https://github.com/angular/angular/issues/15181)
* **core:** don’t create a comment for components with empty template. ([#15260](https://github.com/angular/angular/issues/15260)) ([f8c075a](https://github.com/angular/angular/commit/f8c075a)), closes [#15143](https://github.com/angular/angular/issues/15143)
* **core:** mark components for check when host events trigger. ([#15359](https://github.com/angular/angular/issues/15359)) ([64beae9](https://github.com/angular/angular/commit/64beae9)), closes [#15352](https://github.com/angular/angular/issues/15352)
* **core:** only apply `WrappedValue` to the binding of the pipe ([#15257](https://github.com/angular/angular/issues/15257)) ([0c43535](https://github.com/angular/angular/commit/0c43535)), closes [#15116](https://github.com/angular/angular/issues/15116)
* **core:** provide `NgModuleRef` in `ViewContainerRef.createComponent`. ([#15350](https://github.com/angular/angular/issues/15350)) ([431eb30](https://github.com/angular/angular/commit/431eb30)), closes [#15241](https://github.com/angular/angular/issues/15241)
* **core:** stringify shouldn't throw when toString returns null/undefined ([#14975](https://github.com/angular/angular/issues/14975)) ([8e6995c](https://github.com/angular/angular/commit/8e6995c)), closes [#14948](https://github.com/angular/angular/issues/14948)
* **core:** trigger host animations for elements that are removed. ([#15251](https://github.com/angular/angular/issues/15251)) ([0d3e314](https://github.com/angular/angular/commit/0d3e314)), closes [#14813](https://github.com/angular/angular/issues/14813) [#15193](https://github.com/angular/angular/issues/15193)
* **core:** update peer dep on zone.js to ^0.8.5 ([#15365](https://github.com/angular/angular/issues/15365)) ([97149f9](https://github.com/angular/angular/commit/97149f9)), closes [#15185](https://github.com/angular/angular/issues/15185)
* **forms:** make composition event buffering configurable ([#15256](https://github.com/angular/angular/issues/15256)) ([5efc860](https://github.com/angular/angular/commit/5efc860)), closes [#15079](https://github.com/angular/angular/issues/15079)
* **platform-server:** interpret Native view encapsulation as Emulated on the server ([#15155](https://github.com/angular/angular/issues/15155)) ([de3d2ee](https://github.com/angular/angular/commit/de3d2ee))
* **platform-server:** setup NoopAnimationsModule in ServerModule by default ([#15131](https://github.com/angular/angular/issues/15131)) ([5c5c2ae](https://github.com/angular/angular/commit/5c5c2ae)), closes [#15098](https://github.com/angular/angular/issues/15098) [#14784](https://github.com/angular/angular/issues/14784)
* **platform-server:** throw a better error message for relative URLs ([#15357](https://github.com/angular/angular/issues/15357)) ([15a082c](https://github.com/angular/angular/commit/15a082c)), closes [#15349](https://github.com/angular/angular/issues/15349)
* **tsc-wrapped:** emit flat module format correctly on Windows ([#15215](https://github.com/angular/angular/issues/15215)) ([6e9264a](https://github.com/angular/angular/commit/6e9264a)), closes [#15192](https://github.com/angular/angular/issues/15192)
* **tsc-wrapped:** use windows friendly path normalization in bundler ([#15374](https://github.com/angular/angular/issues/15374)) ([c584997](https://github.com/angular/angular/commit/c584997)), closes [#15289](https://github.com/angular/angular/issues/15289)
* **upgrade:** component injectors should not link the module injector tree ([#15385](https://github.com/angular/angular/issues/15385)) ([ea49a95](https://github.com/angular/angular/commit/ea49a95))


### Features

* **core:** expose `inputs`, `outputs` and `ngContentSelectors` on `ComponentFactory`. ([#15214](https://github.com/angular/angular/issues/15214)) ([791534f](https://github.com/angular/angular/commit/791534f))
* **router:** add `ParamMap.keys` to get a list of parameters ([d3eda7a](https://github.com/angular/angular/commit/d3eda7a))
* **router:** introduce `ParamMap` to access parameters ([a755b71](https://github.com/angular/angular/commit/a755b71))
* **tsc-wrapped:** record original location of flattened symbols ([#15367](https://github.com/angular/angular/issues/15367)) ([7354949](https://github.com/angular/angular/commit/7354949))
* **upgrade:** use `ComponentFactory.inputs/outputs/ngContentSelectors` ([#15214](https://github.com/angular/angular/issues/15214)) ([9429032](https://github.com/angular/angular/commit/9429032))



<a name="4.0.0-rc.5"></a>
# [4.0.0-rc.5](https://github.com/angular/angular/compare/4.0.0-rc.4...4.0.0-rc.5) (2017-03-17)


### Bug Fixes

* **compiler-cli:** update the tsc-wrapped dependency version ([#15226](https://github.com/angular/angular/issues/15226)) ([7fb4528](https://github.com/angular/angular/commit/7fb4528))



<a name="4.0.0-rc.4"></a>
# [4.0.0-rc.4](https://github.com/angular/angular/compare/4.0.0-rc.3...4.0.0-rc.4) (2017-03-17)


### Bug Fixes

* **animations:** always fire callbacks even for noop animations ([#15170](https://github.com/angular/angular/issues/15170)) ([3f38c6f](https://github.com/angular/angular/commit/3f38c6f))
* **animations:** make sure easing values are applied to an empty animate() step ([#15174](https://github.com/angular/angular/issues/15174)) ([62d5543](https://github.com/angular/angular/commit/62d5543)), closes [#15115](https://github.com/angular/angular/issues/15115)
* **animations:** support multiple state names per state() call ([#15147](https://github.com/angular/angular/issues/15147)) ([36ce0af](https://github.com/angular/angular/commit/36ce0af)), closes [#14732](https://github.com/angular/angular/issues/14732)
* **compiler:** always use `ng://` prefix for sourcemap urls ([#15218](https://github.com/angular/angular/issues/15218)) ([994089d](https://github.com/angular/angular/commit/994089d))
* **compiler:** fix utf8encode, move to sharted utils, add tests ([#15076](https://github.com/angular/angular/issues/15076)) ([959a03a](https://github.com/angular/angular/commit/959a03a))
* **compiler:** generated code should pass `noUnusedLocals` check ([50ab06e](https://github.com/angular/angular/commit/50ab06e)), closes [#14797](https://github.com/angular/angular/issues/14797)
* **compiler:** Improve error message for missing annotations ([#14724](https://github.com/angular/angular/issues/14724)) ([3c15916](https://github.com/angular/angular/commit/3c15916))
* **compiler:** improve error msg for unexpected closing tags ([#14747](https://github.com/angular/angular/issues/14747)) ([5f9fb91](https://github.com/angular/angular/commit/5f9fb91)), closes [#6652](https://github.com/angular/angular/issues/6652)
* **compiler:** make sourcemaps work in AOT mode ([492153a](https://github.com/angular/angular/commit/492153a))
* **compiler:** only warn for `[@Injectable](https://github.com/Injectable)` classes with invalid args. ([5c34066](https://github.com/angular/angular/commit/5c34066)), closes [#15003](https://github.com/angular/angular/issues/15003)
* **compiler:** shouldn't throw when Symbol is used as DI token ([#13701](https://github.com/angular/angular/issues/13701)) ([8b5c6b2](https://github.com/angular/angular/commit/8b5c6b2)), closes [#13314](https://github.com/angular/angular/issues/13314)
* **compiler:** support interface types in injectable constructors ([#14894](https://github.com/angular/angular/issues/14894)) ([b00fe20](https://github.com/angular/angular/commit/b00fe20)), closes [#12631](https://github.com/angular/angular/issues/12631)
* **compiler:** warning prints "WARNING" instead of "ERROR" ([#15125](https://github.com/angular/angular/issues/15125)) ([3b1956b](https://github.com/angular/angular/commit/3b1956b))
* **core:** don’t recreate `TemplateRef` when used as a reference. ([#15066](https://github.com/angular/angular/issues/15066)) ([df914ef](https://github.com/angular/angular/commit/df914ef)), closes [#14873](https://github.com/angular/angular/issues/14873)
* **core:** don’t throw if queries change during change detection. ([06fc42b](https://github.com/angular/angular/commit/06fc42b)), closes [#14925](https://github.com/angular/angular/issues/14925)
* **core:** ErrorHandler should not rethrow an error by default ([#15077](https://github.com/angular/angular/issues/15077)) ([#15208](https://github.com/angular/angular/issues/15208)) ([77fd91d](https://github.com/angular/angular/commit/77fd91d)), closes [#14949](https://github.com/angular/angular/issues/14949) [#15182](https://github.com/angular/angular/issues/15182) [#14316](https://github.com/angular/angular/issues/14316)
* **core:** update peer dep on zone.js to ^0.8.4 ([#15209](https://github.com/angular/angular/issues/15209)) ([d2fbbb4](https://github.com/angular/angular/commit/d2fbbb4)), closes [#15180](https://github.com/angular/angular/issues/15180) [#15185](https://github.com/angular/angular/issues/15185)
* **core:** use presence of .subscribe to detect observables rather then Symbol.observable ([#15171](https://github.com/angular/angular/issues/15171)) ([6e98757](https://github.com/angular/angular/commit/6e98757)), closes [#14298](https://github.com/angular/angular/issues/14298) [#14473](https://github.com/angular/angular/issues/14473) [#14926](https://github.com/angular/angular/issues/14926)
* **forms:** ensure observable validators are properly canceled ([#15132](https://github.com/angular/angular/issues/15132)) ([26d4ce2](https://github.com/angular/angular/commit/26d4ce2))
* **forms:** remove equalsTo validator ([#15050](https://github.com/angular/angular/issues/15050)) ([778f7d6](https://github.com/angular/angular/commit/778f7d6))
* element injector vs module injector ([#15044](https://github.com/angular/angular/issues/15044)) ([13686bb](https://github.com/angular/angular/commit/13686bb)), closes [#12869](https://github.com/angular/angular/issues/12869) [#12889](https://github.com/angular/angular/issues/12889) [#13885](https://github.com/angular/angular/issues/13885) [#13870](https://github.com/angular/angular/issues/13870)
* **http:** Make ResponseOptionsArgs an interface ([#14607](https://github.com/angular/angular/issues/14607)) ([#14623](https://github.com/angular/angular/issues/14623)) ([f1b33ab](https://github.com/angular/angular/commit/f1b33ab)), closes [#13708](https://github.com/angular/angular/issues/13708)
* **platform-browser:** prevent clobbered elements from freezing the browser ([a4076c7](https://github.com/angular/angular/commit/a4076c7))
* **platform-server:** correctly implement get href in parse5 adapter ([#15022](https://github.com/angular/angular/issues/15022)) ([80649ea](https://github.com/angular/angular/commit/80649ea))
* **platform-server:** fix an exception when HostListener('window:scroll') is used on the server ([#15019](https://github.com/angular/angular/issues/15019)) ([4f7d62a](https://github.com/angular/angular/commit/4f7d62a))
* correct UMD resolutions for platform-browser_animations ([#15190](https://github.com/angular/angular/issues/15190)) ([923d0c5](https://github.com/angular/angular/commit/923d0c5)), closes [#15114](https://github.com/angular/angular/issues/15114)
* don't instantiate providers with ngOnDestroy eagerly. ([#15070](https://github.com/angular/angular/issues/15070)) ([2c5a671](https://github.com/angular/angular/commit/2c5a671)), closes [#14552](https://github.com/angular/angular/issues/14552)
* fix path locally to empty.js ([#15073](https://github.com/angular/angular/issues/15073)) ([80112a9](https://github.com/angular/angular/commit/80112a9))
* **platform-server:** fix get/set title in parse5 adapter ([#14965](https://github.com/angular/angular/issues/14965)) ([018e5c9](https://github.com/angular/angular/commit/018e5c9))
* **platform-server:** handle styles with extra ':'s correctly ([#15189](https://github.com/angular/angular/issues/15189)) ([013d806](https://github.com/angular/angular/commit/013d806))
* **platform-server:** support svg elements with namespaced attributes ([#15101](https://github.com/angular/angular/issues/15101)) ([f093501](https://github.com/angular/angular/commit/f093501))
* **router:** fix query parameters with multiple values ([#15129](https://github.com/angular/angular/issues/15129)) ([029d0f2](https://github.com/angular/angular/commit/029d0f2)), closes [#14796](https://github.com/angular/angular/issues/14796)
* **tsc-wrapped:** emit js files in all cases ([c0e05e6](https://github.com/angular/angular/commit/c0e05e6))


### Code Refactoring

* **core:** use flags in `Renderer2.setStyle` instead of booleans ([#15045](https://github.com/angular/angular/issues/15045)) ([ff71eff](https://github.com/angular/angular/commit/ff71eff))

### Features

* **common:** support `as` syntax in template/* bindings ([#15025](https://github.com/angular/angular/issues/15025)) ([c10c060](https://github.com/angular/angular/commit/c10c060)), closes [#15020](https://github.com/angular/angular/issues/15020)
* **compiler-cli:** support metadata file aliases ([0ab49d4](https://github.com/angular/angular/commit/0ab49d4))
* **core:** allow to provide multiple default testing modules ([#15054](https://github.com/angular/angular/issues/15054)) ([6c8638c](https://github.com/angular/angular/commit/6c8638c))
* **core:** expose `inputs`, `outputs` and `ngContentSelectors` on `ComponentFactory`. ([1171f91](https://github.com/angular/angular/commit/1171f91))
* **upgrade:** support multi-slot projection in upgrade/static ([#14282](https://github.com/angular/angular/issues/14282)) ([914797a](https://github.com/angular/angular/commit/914797a)), closes [#14261](https://github.com/angular/angular/issues/14261)
* **upgrade:** use `ComponentFactory.inputs/outputs/ngContentSelectors` ([a3e32fb](https://github.com/angular/angular/commit/a3e32fb))
* introduce source maps for templates ([#15011](https://github.com/angular/angular/issues/15011)) ([cdc882b](https://github.com/angular/angular/commit/cdc882b))

### BREAKING CHANGES

* Previously, any provider that had an ngOnDestroy lifecycle hook would be created eagerly.

  Now, only classes that are annotated with @Component, @Directive, @Pipe, @NgModule are eager. Providers only become eager if they are either directly or transitively injected into one of the above.

  This also makes all `useValue` providers eager, which
  should have no observable impact other than code size.

  **EXPECTED IMPACT**:
  Making providers eager was an incorrect behavior and never documented.
  Also, providers that are used by a directive / pipe / ngModule stay eager.
  So the impact should be rather small.

* DebugNode.source no longer returns the source location of a node.

  Closes 14013

* core: (since v4 rc.1)
  - `Renderer2.setStyle` no longer takes booleans but rather a
     bit mask of flags.



<a name="2.4.10"></a>
## [2.4.10](https://github.com/angular/angular/compare/2.4.9...2.4.10) (2017-03-17)

### Bug Fixes

* **compiler:** fix decoding surrogate pairs ([#15154](https://github.com/angular/angular/issues/15154)) ([e5c9bbc](https://github.com/angular/angular/commit/e5c9bbc))
* **router:** do not finish bootstrap until all the routes are resolved ([#15121](https://github.com/angular/angular/issues/15121)) ([34403cd](https://github.com/angular/angular/commit/34403cd))


<a name="4.0.0-rc.3"></a>
# [4.0.0-rc.3](https://github.com/angular/angular/compare/4.0.0-rc.2...4.0.0-rc.3) (2017-03-10)


### Bug Fixes

* **compiler:** don’t throw for empty array literal in assignments ([#14878](https://github.com/angular/angular/issues/14878)) ([6cd3326](https://github.com/angular/angular/commit/6cd3326)), closes [#14782](https://github.com/angular/angular/issues/14782)
* **compiler:** improve error message when a module imports itself ([#14646](https://github.com/angular/angular/issues/14646)) ([6bc6482](https://github.com/angular/angular/commit/6bc6482)), closes [#14644](https://github.com/angular/angular/issues/14644)
* **core:** allow to use the `Renderer` outside of views. ([#14882](https://github.com/angular/angular/issues/14882)) ([ba4b6f5](https://github.com/angular/angular/commit/ba4b6f5)), closes [#14872](https://github.com/angular/angular/issues/14872)
* **router:** do not finish bootstrap until all the routes are resolved ([#14762](https://github.com/angular/angular/issues/14762)) ([5df998d](https://github.com/angular/angular/commit/5df998d))
* **upgrade:** populate upgraded component's view before creating the controller ([#14289](https://github.com/angular/angular/issues/14289)) ([07122f0](https://github.com/angular/angular/commit/07122f0)), closes [#13912](https://github.com/angular/angular/issues/13912)
* throw for synthetic properties / listeners by default ([#14880](https://github.com/angular/angular/issues/14880)) ([3651d8d](https://github.com/angular/angular/commit/3651d8d))


### BREAKING CHANGES

#### since 4.0 rc.1:
- rename `RendererV2` to `Renderer2`
- rename `RendererTypeV2` to `RendererType2`
- rename `RendererFactoryV2` to `RendererFactory2`

<a name="2.4.9"></a>
## [2.4.9](https://github.com/angular/angular/compare/2.4.8...2.4.9) (2017-03-02)


### Bug Fixes

* **http:** Make ResponseOptionsArgs an interface ([b658fa9](https://github.com/angular/angular/commit/b658fa9)), closes [#13708](https://github.com/angular/angular/issues/13708)
* **router:** improve robustness ([#14602](https://github.com/angular/angular/issues/14602)) ([2a12346](https://github.com/angular/angular/commit/2a12346))


### Reverts

* fix(router): do not finish bootstrap until all the routes are resolved ([#14327](https://github.com/angular/angular/issues/14327)) ([de36f8a](https://github.com/angular/angular/commit/de36f8a)), closes [#14681](https://github.com/angular/angular/issues/14681) [#14588](https://github.com/angular/angular/issues/14588)



<a name="4.0.0-rc.2"></a>
## [4.0.0-rc.2](https://github.com/angular/angular/compare/4.0.0-rc.1...4.0.0-rc.2) (2017-03-02)


### Bug Fixes

* **animations:** make animations work in AOT ([#14775](https://github.com/angular/angular/issues/14775)) ([9560ad8](https://github.com/angular/angular/commit/9560ad8))
* **compiler:** apply element bindings before host bindings ([#14823](https://github.com/angular/angular/issues/14823)) ([79fc1e3](https://github.com/angular/angular/commit/79fc1e3))
* **compiler:** fix identifier names of `EMPTY_MAP` / `EMPTY_ARRAY` ([#14806](https://github.com/angular/angular/issues/14806)) ([5ba55b0](https://github.com/angular/angular/commit/5ba55b0))
* **compiler:** quote `animation` in `RendererTypeV2` and skip if empty ([#14773](https://github.com/angular/angular/issues/14773)) ([77682a3](https://github.com/angular/angular/commit/77682a3))
* **core:** call lifecycle hooks for siblings in declaration order ([d2e4256](https://github.com/angular/angular/commit/d2e4256))
* **core:** fix `isComponentView()` and `isEmbeddedView()` tests ([#14789](https://github.com/angular/angular/issues/14789)) ([5753de5](https://github.com/angular/angular/commit/5753de5)), closes [#14778](https://github.com/angular/angular/issues/14778)
* **language-service:** tolerate errors in decorators ([#14634](https://github.com/angular/angular/issues/14634)) ([6bae737](https://github.com/angular/angular/commit/6bae737)), closes [#14631](https://github.com/angular/angular/issues/14631)
* **platform-server:** don't setup Testability and TestabilityRegistry on the server ([#14510](https://github.com/angular/angular/issues/14510)) ([47bdc2b](https://github.com/angular/angular/commit/47bdc2b))
* **tsc-wrapped:** validate metadata in static members of a class ([#14772](https://github.com/angular/angular/issues/14772)) ([a6996a9](https://github.com/angular/angular/commit/a6996a9)), closes [#13481](https://github.com/angular/angular/issues/13481)
* **upgrade:** fix upgrade component Closure optimization. ([#14801](https://github.com/angular/angular/issues/14801)) ([968995a](https://github.com/angular/angular/commit/968995a))


### Performance Improvements

* delete pre-view-engine core, compiler, platform-browser, etc code ([#14788](https://github.com/angular/angular/issues/14788)) ([126fda2](https://github.com/angular/angular/commit/126fda2))
* **compiler:** make identifiers for generated code small to improve dev size ([5caab71](https://github.com/angular/angular/commit/5caab71f7dc64b10f3544b2a3b2650e1666adbf1))



<a name="4.0.0-rc.1"></a>
# [4.0.0-rc.1](https://github.com/angular/angular/compare/4.0.0-beta.8...4.0.0-rc.1) (2017-02-24)

We are excited to share 4.0.0-RC.1 with the community. This is a feature-complete pre-release of 4.0.0. Upgrade to get to know the new features to be released in 4.0.0, and to help us validate the release.

It’s important to note that this release has been tested extensively. All Angular applications within Google use the master branch of Angular, so every commit is tested and validated at scale prior to any release.

## We Need Your Help
Please give this RC a try and test it with your projects! We have spent a significant amount of time working to ensure that this release is backwards compatible and will work with your existing code, but you may have use cases we haven’t anticipated. If you are broken by this release, let us know so that we can look into it right away. We are also looking for feedback related to the ergonomics of any newly added APIs.

## What’s New

### View Engine
We’ve made changes under the hood to what AOT generated code looks like. These changes should reduce the size of the generated code for your components by more than half in some cases. Read the [Design Doc](https://docs.google.com/document/d/195L4WaDSoI_kkW094LlShH6gT3B7K1GZpSBnnLkQR-g/preview) for the View Engine updates.


### Enhanced `*ngIf` syntax
Our template binding syntax now supports a couple helpful changes. You can now use an if/else style syntax, and assign local variables such as when unrolling an observable.

```
<ng-template #loading>Loading...</ng-template>
<div *ngIf="userObservable | async; else loading; let user">
  {{ user.name }}
</div>
```


### Animation Package
We have pulled Animations into their own package. This means that if you don’t use Animations, this extra code will not end up in your production bundles. This also allows you to more easily find documentation and to take better advantage of autocompletion. If you do need animations, libraries like Material will automatically import the module (once you install it via NPM), or you can add it yourself to your main NgModule.


### TypeScript 2.1
We’ve updated Angular to a more recent version of TypeScript. This will improve the speed of `ngc` and you will get better type checking throughout your application.


### StrictNullChecks
Angular is now compliant with [TypeScript’s StrictNullChecks](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html). This means that you can enable StrictNullChecks in your project, if desired.


### Universal
Universal, the project that allows developers to run Angular on a server, is now up to date with Angular again, and has been adopted by the Angular team. This release now includes the results of the work from the Universal team over the last few months. The majority of the Universal code is now in platform-server. To learn more about this change, take a look the new [`renderModuleFactory`](https://github.com/angular/angular/blob/56f232cdd70a352cb9151bc7cfe8981bc2710ea6/modules/%40angular/platform-server/src/utils.ts#L63-L72) method, or Rob Wormald’s [Demo Repository](https://github.com/robwormald/ng-universal-demo/). More documentation is forthcoming.


<a name="flat-es-modules-esm"></a><!-- legacy anchor link, keep it here -->
### Flat ES Modules (Flat ESM / FESM)
We now ship flattened versions of our modules ("rolled up" version of our code in the EcmaScript Module format, see [example file](https://github.com/angular/core-builds/blob/85cbe3f8d6107af033b0f8b56456c181cbcb5eb7/%40angular/core.js)). This format should help tree-shaking, help reduce the size of your generated bundles, and speed up build, transpilation, and loading in the browser in certain scenarios.


### ES2015 Builds
We now also ship our packages in the ES2015 Flat ESM format. This option is experimental and opt-in (configure your webpack to resolve ["es2015" property](https://github.com/angular/core-builds/blob/dc0c8d828a8bae6591d2b9c77974271481af818c/package.json#L7) in package.json over the regular ["module" property](https://github.com/angular/core-builds/blob/dc0c8d828a8bae6591d2b9c77974271481af818c/package.json#L6)).


## Known Issues

The following is a list of known issues that will be fixed in the next rcs.

- Source maps are missing in npm packages
- Generated bundles will be larger temporarily while we validate new code paths and remove old ones
- angular.io docs have not been updated to reflect API changes in 4.0
- legacy UMD bundles don't have correct RxJS mappings when running in ES5 mode without a module system


## Installing RC.1
We have two main ways to update. If you have an existing project, you should be able to run:

On Linux/Mac: `npm install @angular/{common,compiler,compiler-cli,core,forms,http,platform-browser,platform-browser-dynamic,platform-server,router,animations}@next --save`
On Windows: `npm install @angular/common@next @angular/compiler@next @angular/compiler-cli@next @angular/core@next @angular/forms@next @angular/http@next @angular/platform-browser@next @angular/platform-browser-dynamic@next @angular/platform-server@next @angular/router@next @angular/animations@next --save`


Then run whatever `ng serve` or `npm start` command you normally use, and everything should work.

*Please ensure that you are using Typescript v2.1.6 or higher.*

*If you rely on Animations* you’ll also need to install the animations package `@angular/animations` and import the new `BrowserAnimationsModule` from `@angular/platform-browser/animations` in your root NgModule. Without this, your code will compile and run, but animations won’t activate.
Imports from `@angular/core` were deprecated, use imports from the new package `import { trigger, state, style, transition, animate } from '@angular/animations';`.

## What's next?
We have [three more release candidates scheduled](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md) before our planned GA the week of March 22. In the meantime we'll be looking for your feedback, fixing bugs and working on docs.


## Commit Summary

### Features

* **compiler:** Add a `enableLegacyTemplate` option to support `<template>` ([e99d721](https://github.com/angular/angular/commit/e99d721))
* **compiler:** introduce `<ng-template>`, deprecate `<template>` and `template` attribute ([bf8eb41](https://github.com/angular/angular/commit/bf8eb41))
* **compiler-cli:** add a `locale` option to ng-xi18n ([234f059](https://github.com/angular/angular/commit/234f059)), closes [#12303](https://github.com/angular/angular/issues/12303) [#14537](https://github.com/angular/angular/issues/14537)
* **compiler-cli:** add an `outFile` option to ng-xi18n ([39f56fa](https://github.com/angular/angular/commit/39f56fa)), closes [#11416](https://github.com/angular/angular/issues/11416) [#14508](https://github.com/angular/angular/issues/14508) [#14657](https://github.com/angular/angular/issues/14657)
* **core:** enable new view engine ([d3a98c7](https://github.com/angular/angular/commit/d3a98c7))
* **core:** make `new Inject()` optional for deps specified as `InjectionToken` ([#14486](https://github.com/angular/angular/issues/14486)) ([d6a58f9](https://github.com/angular/angular/commit/d6a58f9)), closes [#10625](https://github.com/angular/angular/issues/10625)
* **core:** add a PLATFORM_ID token that provides a platform id Object. ([#14647](https://github.com/angular/angular/issues/14647)) ([a1d4769](https://github.com/angular/angular/commit/a1d4769))
* **forms:** add option to use browser's native validation and angular forms ([#13566](https://github.com/angular/angular/issues/13566)) ([8742432](https://github.com/angular/angular/commit/8742432)), closes [#13573](https://github.com/angular/angular/issues/13573)
* **forms:** introduce AsyncValidator interface ([#13483](https://github.com/angular/angular/issues/13483)) ([551fe50](https://github.com/angular/angular/commit/551fe50)), closes [#13398](https://github.com/angular/angular/issues/13398)
* **router:** add `RouteConfigLoadStart` and `RouteConfigLoadEnd` events ([78e8814](https://github.com/angular/angular/commit/78e8814))
* **router:** add an option to rerun guards and resolvers when query changes ([c2e0f71](https://github.com/angular/angular/commit/c2e0f71)), closes [#14514](https://github.com/angular/angular/issues/14514) [#14567](https://github.com/angular/angular/issues/14567)
* **router:** add an option to rerun guards and resolvers when query changes ([#14624](https://github.com/angular/angular/issues/14624)) ([41da599](https://github.com/angular/angular/commit/41da599)), closes [#14514](https://github.com/angular/angular/issues/14514) [#14567](https://github.com/angular/angular/issues/14567)
* **router:** introduce RouteConfigLoaded event ([7df6f46](https://github.com/angular/angular/commit/7df6f46)), closes [#14036](https://github.com/angular/angular/issues/14036)


### Bug Fixes

* **common:** do not reference deprecated classes in providers ([#14523](https://github.com/angular/angular/issues/14523)) ([#14523](https://github.com/angular/angular/issues/14523)) ([a23634d](https://github.com/angular/angular/commit/a23634d)), closes [#14521](https://github.com/angular/angular/issues/14521)
* **core:** host bindings and host listeners for animations ([5049a50](https://github.com/angular/angular/commit/5049a50))
* **http:** Make ResponseOptionsArgs an interface ([#14607](https://github.com/angular/angular/issues/14607)) ([fbe4b76](https://github.com/angular/angular/commit/fbe4b76)), closes [#13708](https://github.com/angular/angular/issues/13708)
* **packaging:** properly build the core-testing bundle ([4301dce](https://github.com/angular/angular/commit/4301dce))
* **platform-webworker:** integrate review feedback ([601fd3e](https://github.com/angular/angular/commit/601fd3e)), closes [#14581](https://github.com/angular/angular/issues/14581)
* **router:** do not finish bootstrap until all the routes are resolved ([#14608](https://github.com/angular/angular/issues/14608)) ([2a191ca](https://github.com/angular/angular/commit/2a191ca)), closes [#12162](https://github.com/angular/angular/issues/12162) [#14155](https://github.com/angular/angular/issues/14155)
* app ids for better style tag management for ssr ([#14632](https://github.com/angular/angular/issues/14632)) ([88bc143](https://github.com/angular/angular/commit/88bc143))


### Code Refactoring

* **core:** deprecate `RootRenderer` / `Renderer` ([ccb636c](https://github.com/angular/angular/commit/ccb636c))
* **core:** change abstract classes for interfaces ([#12324](https://github.com/angular/angular/issues/12324)) ([ee747f7](https://github.com/angular/angular/commit/ee747f7)), closes [#10083](https://github.com/angular/angular/issues/10083)


### Performance Improvements

* distribute smaller bundled code and include es2015 bundle ([de795ea](https://github.com/angular/angular/commit/de795ea))


### BREAKING CHANGES

* core: Because all lifecycle hooks are now interfaces the code that uses 'extends' keyword will no longer compile. Introduced by ([ee747f7](https://github.com/angular/angular/commit/ee747f7)).

  To migrate the code follow the example below:

  Before:
  ```
  @Component()
  class SomeComponent extends OnInit {}
  ```
  After:
  ```
  @Component()
  class SomeComponent implements OnInit {}
  ```

  Based on our research we don't expect anyone to be affected by this change.

* `RootRenderer` cannot be used any more, use `RendererFactoryV2` instead. Introduced by ([ccb636c](https://github.com/angular/angular/commit/ccb636c)).

  Note: `Renderer` can still be injected/used, but is deprecated.

Note: the 4.0.0-rc.0 release on npm accidentally omitted one bug fix, so we cut rc.1 instead. oops :-)



<a name="4.0.0-beta.8"></a>
## [4.0.0-beta.8](https://github.com/angular/angular/compare/4.0.0-beta.7...4.0.0-beta.8) (2017-02-18)


### Features
* **packaging**: allow applications to turn on strictNullChecks mode in TypeScript ([#14382](https://github.com/angular/angular/pull/14382)) ([03e855a](https://github.com/angular/angular/commit/03e855ae8f9e9b86251320c7551a96092bd8b0c4))
* **common:** added typed overloaded for `AsyncPipe.transform()` ([#14367](https://github.com/angular/angular/issues/14367)) ([4da7925](https://github.com/angular/angular/commit/4da7925))
* **compiler:** add support for source map generation ([#14258](https://github.com/angular/angular/issues/14258)) ([7ac38aa](https://github.com/angular/angular/commit/7ac38aa)), closes [#14125](https://github.com/angular/angular/issues/14125)
* **compiler:** add target locale to the translation bundles ([#14290](https://github.com/angular/angular/issues/14290)) ([bb4db2d](https://github.com/angular/angular/commit/bb4db2d))
* **compiler:** generate shallow imports compiler generated references ([#14388](https://github.com/angular/angular/issues/14388)) ([8b81bb1](https://github.com/angular/angular/commit/8b81bb1))
* **compiler:** implement style encapsulation for new view engine ([#14518](https://github.com/angular/angular/issues/14518)) ([0fa3895](https://github.com/angular/angular/commit/0fa3895))
* **compiler:** integrate compiler with view engine - change detection tests work ([#14412](https://github.com/angular/angular/issues/14412)) ([e4e9dbe](https://github.com/angular/angular/commit/e4e9dbe))
* **compiler:** integrate compiler with view engine - main integration tests work ([#14284](https://github.com/angular/angular/issues/14284)) ([baa654a](https://github.com/angular/angular/commit/baa654a))
* **compiler:** integrate compiler with view engine ([#14487](https://github.com/angular/angular/issues/14487)) ([4e7752a](https://github.com/angular/angular/commit/4e7752a))
* **core:** add isStable Observable property to ApplicationRef to indicate when it's stable and unstable ([#14337](https://github.com/angular/angular/issues/14337)) ([c481798](https://github.com/angular/angular/commit/c481798))
* **platform-server:** add API to render Module and ModuleFactory to string ([#14381](https://github.com/angular/angular/issues/14381)) ([b4d444a](https://github.com/angular/angular/commit/b4d444a))
* **platform-server:** Implement PlatformLocation for platformServer() ([#14405](https://github.com/angular/angular/issues/14405)) ([9e28568](https://github.com/angular/angular/commit/9e28568))
* **platform-server:** support [@angular](https://github.com/angular)/http from [@angular](https://github.com/angular)/platform-server ([9559d3e](https://github.com/angular/angular/commit/9559d3e))
* **tsc-wrapped:** add an option to `ngc` to bundle metadata ([#14509](https://github.com/angular/angular/issues/14509)) ([3b89670](https://github.com/angular/angular/commit/3b89670))


### Bug Fixes

* **compiler:** disable non-components as an entry component ([#14335](https://github.com/angular/angular/issues/14335)) ([44bb337](https://github.com/angular/angular/commit/44bb337))
* **compiler:** improve error message for unknown elements ([#14373](https://github.com/angular/angular/issues/14373)) ([2c6dab9](https://github.com/angular/angular/commit/2c6dab9))
* **compiler:** improve error messages in aot compiler ([#14333](https://github.com/angular/angular/issues/14333)) ([a696f4a](https://github.com/angular/angular/commit/a696f4a))
* **compiler:** improve error msg for unknown properties on ([#14373](https://github.com/angular/angular/issues/14373)) ([e5a144d](https://github.com/angular/angular/commit/e5a144d)), closes [#14070](https://github.com/angular/angular/issues/14070)
* **core:** Remove ChangeDetectorRef Parameter from KeyValueDifferFactory and IterableDifferFactory ([#14311](https://github.com/angular/angular/issues/14311)) ([45cc444](https://github.com/angular/angular/commit/45cc444))
* **core:** suppress a Closure Compiler warning ([#14484](https://github.com/angular/angular/issues/14484)) ([2f2b65b](https://github.com/angular/angular/commit/2f2b65b))
* **forms:** getRawValue should correctly work with nested FormGroups/Arrays ([#12964](https://github.com/angular/angular/issues/12964)) ([1ece736](https://github.com/angular/angular/commit/1ece736)), closes [#12963](https://github.com/angular/angular/issues/12963)
* **http:** REVERT: remove dots from jsonp callback name ([#13219](https://github.com/angular/angular/issues/13219)) ([4676df5](https://github.com/angular/angular/commit/4676df5))
* **platform-browser:** allow to mix shadow dom with non shadow dom ([ab26b65](https://github.com/angular/angular/commit/ab26b65))
* **platform-browser:** should not throw for debug attrs containing $ ([#14353](https://github.com/angular/angular/issues/14353)) ([1cfbefe](https://github.com/angular/angular/commit/1cfbefe)), closes [#9566](https://github.com/angular/angular/issues/9566)
* **platform-browser:** should only add styles with native encapsulation in shadow DOM ([#14313](https://github.com/angular/angular/issues/14313)) ([53cf2ec](https://github.com/angular/angular/commit/53cf2ec)), closes [#7887](https://github.com/angular/angular/issues/7887)
* **platform-server:** allow multiple instances of platformServer and platformDynamicServer ([17486fd](https://github.com/angular/angular/commit/17486fd))
* **platform-server:** default unspecified sections of the url to empty string ([#14512](https://github.com/angular/angular/issues/14512)) ([612f120](https://github.com/angular/angular/commit/612f120))
* **platform-server:** read initial location from INITIAL_CONFIG if present ([56f232c](https://github.com/angular/angular/commit/56f232c))
* **platform-server:** reflect properties to attributes for known elements, for serialization ([047cda5](https://github.com/angular/angular/commit/047cda5))
* **platform-server:** render styles in app component instead of <head> ([30380d0](https://github.com/angular/angular/commit/30380d0))
* **upgrade:** Prevent property renaming for $inject. ([96d06f7](https://github.com/angular/angular/commit/96d06f7))


### DEPRECATIONS

* core: `KeyValueDifferFactory` and `IterableDifferFactory` no longer have `ChangeDetectorRef` as
  a parameter. It was not used and has been there for historical reasons. If you call
  `DifferFactory.create(...)` remove the `ChangeDetectorRef` argument. Introduced by ([#14311](https://github.com/angular/angular/pull/14311)).


### BREAKING CHANGES

* common: Classes that derive from `AsyncPipe` and override
`transform()` might not compile correctly. The much more common use of `async` pipe in
templates is unaffected. We expect no or little impact on apps from this change, file an issue if we break you. Introduced by ([#14367](https://github.com/angular/angular/issues/14367)) ([4da7925](https://github.com/angular/angular/commit/4da7925)).

  * Mitigation: Update derived classes of `AsyncPipe` that override `transform()` to include the type parameter overloads.



<a name="2.4.8"></a>
## [2.4.8](https://github.com/angular/angular/compare/2.4.7...2.4.8) (2017-02-18)


### Bug Fixes

* **forms:** getRawValue should correctly work with nested FormGroups/Arrays ([#12964](https://github.com/angular/angular/issues/12964)) ([ea7737e](https://github.com/angular/angular/commit/ea7737e)), closes [#12963](https://github.com/angular/angular/issues/12963)
* **http:** REVERT: remove dots from jsonp callback name ([#13219](https://github.com/angular/angular/issues/13219)) ([9ceb5d1](https://github.com/angular/angular/commit/9ceb5d1))
* **platform-browser:** should only add styles with native encapsulation in shadow DOM ([#14313](https://github.com/angular/angular/issues/14313)) ([fadaf1e](https://github.com/angular/angular/commit/fadaf1e)), closes [#7887](https://github.com/angular/angular/issues/7887)
* **router:** do not finish bootstrap until all the routes are resolved ([#14327](https://github.com/angular/angular/issues/14327)) ([541de26](https://github.com/angular/angular/commit/541de26)), closes [#12162](https://github.com/angular/angular/issues/12162)
* **upgrade:** correctly project content on downgraded components with structural directives ([#14274](https://github.com/angular/angular/issues/14274)) ([74cb575](https://github.com/angular/angular/commit/74cb575)), closes [#14260](https://github.com/angular/angular/issues/14260)
* **upgrade:** pass correct values to `ngOnChanges` for interpolation bindings ([#14400](https://github.com/angular/angular/issues/14400)) ([7c87c52](https://github.com/angular/angular/commit/7c87c52))



<a name="4.0.0-beta.7"></a>
## [4.0.0-beta.7](https://github.com/angular/angular/compare/4.0.0-beta.6...4.0.0-beta.7) (2017-02-09)


### Bug Fixes

* build and test fixes for TS 2.1 ([#13294](https://github.com/angular/angular/issues/13294)) ([ef32e6b](https://github.com/angular/angular/commit/ef32e6b))
* **benchmarks:** don’t force gc on the `profile` buttons ([#14345](https://github.com/angular/angular/issues/14345)) ([f6b5965](https://github.com/angular/angular/commit/f6b5965))
* **build:** make fsevents an optional dependency in npm ([#13945](https://github.com/angular/angular/issues/13945)) ([4370049](https://github.com/angular/angular/commit/4370049))
* **compiler-cli:** prevent ng-xi18n from emitting the compilation output ([#14115](https://github.com/angular/angular/issues/14115)) ([e58d683](https://github.com/angular/angular/commit/e58d683)), closes [#13567](https://github.com/angular/angular/issues/13567)
* **tsc-wrapped:** use tsickle's new source map composition feature ([#14150](https://github.com/angular/angular/issues/14150)) ([5bccff0](https://github.com/angular/angular/commit/5bccff0))
* **upgrade:** pass correct values to `ngOnChanges` for interpolation bindings ([#14301](https://github.com/angular/angular/issues/14301)) ([1e3dd3d](https://github.com/angular/angular/commit/1e3dd3d))


### Performance Improvements

* **upgrade:** unregister `$doCheck` watcher when destroying upgraded component ([#14303](https://github.com/angular/angular/issues/14303)) ([94312f0](https://github.com/angular/angular/commit/94312f0))
* Don’t subclass Error; resulting in smaller binary ([#14160](https://github.com/angular/angular/issues/14160)) ([c33fda2](https://github.com/angular/angular/commit/c33fda2))


### BREAKING CHANGES

* Angular 4 will support only TypeScript 2.1, so we no longer provide backwards compatibility to TS 1.8.



<a name="2.4.7"></a>
## [2.4.7](https://github.com/angular/angular/compare/2.4.6...2.4.7) (2017-02-09)


### Bug Fixes

* **upgrade:** allow non-element selectors for downgraded components ([#14291](https://github.com/angular/angular/issues/14291)) ([5bb47db](https://github.com/angular/angular/commit/5bb47db))


<a name="4.0.0-beta.6"></a>
## [4.0.0-beta.6](https://github.com/angular/angular/compare/4.0.0-beta.5...4.0.0-beta.6) (2017-02-03)


### Bug Fixes

* suppress some closure compiler warnings ([#14198](https://github.com/angular/angular/issues/14198)) ([2205829](https://github.com/angular/angular/commit/2205829))
* **common:** add PopStateEvent interface ([#13400](https://github.com/angular/angular/issues/13400)) ([fe44118](https://github.com/angular/angular/commit/fe44118)), closes [#13378](https://github.com/angular/angular/issues/13378)
* **common:** DatePipe shouldn't throw for NaN ([#14117](https://github.com/angular/angular/issues/14117)) ([7ad616a](https://github.com/angular/angular/commit/7ad616a)), closes [#14103](https://github.com/angular/angular/issues/14103)
* **common:** DatePipe should parses input string even if it's not a valid date in browser ([#13895](https://github.com/angular/angular/issues/13895)) ([093cc04](https://github.com/angular/angular/commit/093cc04)), closes [#12334](https://github.com/angular/angular/issues/12334) [#13874](https://github.com/angular/angular/issues/13874)
* **common:** use Symbol.observable to detect observables rather then presence of .subscribe ([#14067](https://github.com/angular/angular/issues/14067)) ([ff290af](https://github.com/angular/angular/commit/ff290af)), closes [#8848](https://github.com/angular/angular/issues/8848)
* **compiler:** allow empty translations for attributes ([#14085](https://github.com/angular/angular/issues/14085)) ([05b2b49](https://github.com/angular/angular/commit/05b2b49)), closes [#13897](https://github.com/angular/angular/issues/13897)
* avoid closure compiler warning ([#14229](https://github.com/angular/angular/issues/14229)) ([1bc5368](https://github.com/angular/angular/commit/1bc5368))
* **router:** should allow navigation from root component in ngOnInit hook ([#13932](https://github.com/angular/angular/issues/13932)) ([47d41d4](https://github.com/angular/angular/commit/47d41d4)), closes [#13795](https://github.com/angular/angular/issues/13795)
* failing integration test ([8270bec](https://github.com/angular/angular/commit/8270bec))
* lint errors to make circle-ci green ([e0e5e78](https://github.com/angular/angular/commit/e0e5e78))
* **router:** should find guard provided in a lazy loaded module ([#13929](https://github.com/angular/angular/issues/13929)) ([e075b1b](https://github.com/angular/angular/commit/e075b1b)), closes [#13530](https://github.com/angular/angular/issues/13530)
* ngModel should use rxjs/symbol/observable to detect observable ([#14236](https://github.com/angular/angular/issues/14236)) ([a7479f6](https://github.com/angular/angular/commit/a7479f6))
* **compiler:** allow expressions or functions in extends ([#14158](https://github.com/angular/angular/issues/14158)) ([b4214d6](https://github.com/angular/angular/commit/b4214d6)), closes [#14154](https://github.com/angular/angular/issues/14154)
* **compiler:** fix missing translations handling ([#14113](https://github.com/angular/angular/issues/14113)) ([827c3fe](https://github.com/angular/angular/commit/827c3fe))
* **compiler:** only lex messages that are needed by angular ([#14208](https://github.com/angular/angular/issues/14208)) ([5921c87](https://github.com/angular/angular/commit/5921c87))
* **core:** add bootstrapped modules into platform modules list ([#13740](https://github.com/angular/angular/issues/13740)) ([863285a](https://github.com/angular/angular/commit/863285a)), closes [#12015](https://github.com/angular/angular/issues/12015)
* **core:** ViewContainerRef.indexOf should not throw error when empty ([#13220](https://github.com/angular/angular/issues/13220)) ([a277e97](https://github.com/angular/angular/commit/a277e97))
* **forms:** async validator cancels previous subscription when input has changed ([#13222](https://github.com/angular/angular/issues/13222)) ([6c7300c](https://github.com/angular/angular/commit/6c7300c)), closes [#12709](https://github.com/angular/angular/issues/12709) [#9120](https://github.com/angular/angular/issues/9120) [#10074](https://github.com/angular/angular/issues/10074) [#8923](https://github.com/angular/angular/issues/8923)
* **forms:** fix broken unit test ([#14179](https://github.com/angular/angular/issues/14179)) ([1df9319](https://github.com/angular/angular/commit/1df9319))
* **forms:** show a blank line when nothing is selected in IE or Edge ([#13903](https://github.com/angular/angular/issues/13903)) ([029f558](https://github.com/angular/angular/commit/029f558)), closes [#10010](https://github.com/angular/angular/issues/10010)
* **forms:** verify functions passed into async validators returns Observable or Promise ([#14053](https://github.com/angular/angular/issues/14053)) ([94f84c5](https://github.com/angular/angular/commit/94f84c5))
* **http:** remove dots from jsonp callback name ([#13219](https://github.com/angular/angular/issues/13219)) ([9e5617e](https://github.com/angular/angular/commit/9e5617e))
* **http:** use params without RequestOptions ([#14101](https://github.com/angular/angular/issues/14101)) ([5f2b317](https://github.com/angular/angular/commit/5f2b317)), closes [#14100](https://github.com/angular/angular/issues/14100)
* **language-service:** do not crash when Angular cannot be located ([#14123](https://github.com/angular/angular/issues/14123)) ([49fb814](https://github.com/angular/angular/commit/49fb814)), closes [#14122](https://github.com/angular/angular/issues/14122)
* **platform-browser:** remove style nodes on destroy ([#13744](https://github.com/angular/angular/issues/13744)) ([cd3901f](https://github.com/angular/angular/commit/cd3901f)), closes [#11746](https://github.com/angular/angular/issues/11746)
* **router:** fix CanActivateChild guard provided in a lazy loaded module ([#13989](https://github.com/angular/angular/issues/13989)) ([579567c](https://github.com/angular/angular/commit/579567c)), closes [#12275](https://github.com/angular/angular/issues/12275)
* **testing:** async/fakeAsync/inject/withModule helpers should pass through context to callback functions ([#13718](https://github.com/angular/angular/issues/13718)) ([5f40e5b](https://github.com/angular/angular/commit/5f40e5b))
* **upgrade:** detect async downgrade component changes ([#14039](https://github.com/angular/angular/issues/14039)) ([20b454c](https://github.com/angular/angular/commit/20b454c)), closes [#6385](https://github.com/angular/angular/issues/6385) [#6385](https://github.com/angular/angular/issues/6385)
* **upgrade:** respect hierarchical injectors for downgraded components ([#14037](https://github.com/angular/angular/issues/14037)) ([1367cd9](https://github.com/angular/angular/commit/1367cd9))
* **compiler:** improve error messages in aot compiler ([#14017](https://github.com/angular/angular/issues/14017)) ([665dde2](https://github.com/angular/angular/commit/665dde2))


### Features

* **common:** rename underlying `NgFor` class and add a type parameter ([#14104](https://github.com/angular/angular/issues/14104)) ([86b2b25](https://github.com/angular/angular/commit/86b2b25))
* **compiler:** allow missing translations ([#14113](https://github.com/angular/angular/issues/14113)) ([8775ab9](https://github.com/angular/angular/commit/8775ab9)), closes [#13861](https://github.com/angular/angular/issues/13861)
* **compiler:** do not parse xtb messages not needed by angular ([#14111](https://github.com/angular/angular/issues/14111)) ([f7fba74](https://github.com/angular/angular/commit/f7fba74)), closes [#14046](https://github.com/angular/angular/issues/14046)
* **compiler:** generate type parameters for generic type references ([#14104](https://github.com/angular/angular/issues/14104)) ([69e14b5](https://github.com/angular/angular/commit/69e14b5))
* **core:** add query support to view engine ([1e729d7](https://github.com/angular/angular/commit/1e729d7)), closes [#14084](https://github.com/angular/angular/issues/14084)
* **forms:** add email validator ([#13709](https://github.com/angular/angular/issues/13709)) ([d69717c](https://github.com/angular/angular/commit/d69717c)), closes [#13706](https://github.com/angular/angular/issues/13706)
* **forms:** add equalsTo validator ([#14052](https://github.com/angular/angular/issues/14052)) ([7b7ae5f](https://github.com/angular/angular/commit/7b7ae5f))
* **core:** add NgModule support to NgComponentOutlet directive ([#14088](https://github.com/angular/angular/issues/14088)) ([3ef73c2](https://github.com/angular/angular/commit/3ef73c2)), closes [#14043](https://github.com/angular/angular/issues/14043)
* **router:** deprecate preserveQueryParams,add queryParamsHandling ([#14095](https://github.com/angular/angular/issues/14095)) ([c87c3be](https://github.com/angular/angular/commit/c87c3be))
* **tsc-wrapped:** record arity of generic classes ([#14104](https://github.com/angular/angular/issues/14104)) ([1079b93](https://github.com/angular/angular/commit/1079b93))
* **upgrade:** allow non-element selectors for downgraded components ([#14037](https://github.com/angular/angular/issues/14037)) ([9aafdc7](https://github.com/angular/angular/commit/9aafdc7))
* **upgrade:** export VERSION from `upgrade/static` ([#14037](https://github.com/angular/angular/issues/14037)) ([7670cc1](https://github.com/angular/angular/commit/7670cc1))
* **upgrade:** return a function (instead of array) from `downgradeInjectable()` ([#14037](https://github.com/angular/angular/issues/14037)) ([1f90f29](https://github.com/angular/angular/commit/1f90f29))
* **forms:** provide a method to compare options ([#13349](https://github.com/angular/angular/issues/13349)) ([f89d004](https://github.com/angular/angular/commit/f89d004)), closes [#13268](https://github.com/angular/angular/issues/13268)


### Performance Improvements

* use abstract keyword where possible to decrease file size. ([#14112](https://github.com/angular/angular/issues/14112)) ([670b680](https://github.com/angular/angular/commit/670b680))
* **core** simplify ReflectiveInjector by removing code for Dart implementation ([#14126](https://github.com/angular/angular/issues/14126)) ([670b680](https://github.com/angular/angular/commit/670b680))


### BREAKING CHANGES

* common: A definition of `Iterable<T>` is now required to correctly compile
Angular applications. Support for `Iterable<T>` is not required at
runtime but a type definition `Iterable<T>` must be available.

`NgFor`, and now `NgForOf<T>`, already supports `Iterable<T>` at
runtime. With this change the type definition is updated to reflect
this support.

Migration:
- add "es2015.iterable.ts" to your tsconfig.json "libs" fields.

Part of #12398
* upgrade: Previously, `upgrade/static/downgradeInjectable` returned an array of the form:

```js
['dep1', 'dep2', ..., function factory(dep1, dep2, ...) { ... }]
```

Now it returns a function with an `$inject` property:

```js
factory.$inject = ['dep1', 'dep2', ...];
function factory(dep1, dep2, ...) { ... }
```

It shouldn't affect the behavior of apps, since both forms are equally suitable
to be used for registering AngularJS injectable services, but it is possible
that type-checking might fail or that current code breaks if it relies on the
returned value being an array.



<a name="2.4.6"></a>
## [2.4.6](https://github.com/angular/angular/compare/2.4.5...2.4.6) (2017-02-03)


### Bug Fixes

* **common:** add PopStateEvent interface ([#13400](https://github.com/angular/angular/issues/13400)) ([71567d1](https://github.com/angular/angular/commit/71567d1)), closes [#13378](https://github.com/angular/angular/issues/13378)
* **common:** DatePipe doesn't throw for NaN ([#14117](https://github.com/angular/angular/issues/14117)) ([32cc675](https://github.com/angular/angular/commit/32cc675)), closes [#14103](https://github.com/angular/angular/issues/14103)
* **common:** DatePipe parses input string if it's not a valid date in browser ([#13895](https://github.com/angular/angular/issues/13895)) ([e641636](https://github.com/angular/angular/commit/e641636)), closes [#12334](https://github.com/angular/angular/issues/12334) [#13874](https://github.com/angular/angular/issues/13874)
* **common:** introduce isObservable method ([#14067](https://github.com/angular/angular/issues/14067)) ([109f0d1](https://github.com/angular/angular/commit/109f0d1)), closes [#8848](https://github.com/angular/angular/issues/8848)
* **compiler:** allow empty translations for attributes ([#14085](https://github.com/angular/angular/issues/14085)) ([f3d5506](https://github.com/angular/angular/commit/f3d5506)), closes [#13897](https://github.com/angular/angular/issues/13897)
* **core:** add bootstrapped modules into platform modules list ([#13740](https://github.com/angular/angular/issues/13740)) ([250dbc4](https://github.com/angular/angular/commit/250dbc4)), closes [#12015](https://github.com/angular/angular/issues/12015)
* **core:** ViewContainerRef.indexOf should not throw error when empty ([#13220](https://github.com/angular/angular/issues/13220)) ([41b8d95](https://github.com/angular/angular/commit/41b8d95))
* **forms:** show a blank line when nothing is selected in IE or Edge ([#13903](https://github.com/angular/angular/issues/13903)) ([09e2d20](https://github.com/angular/angular/commit/09e2d20)), closes [#10010](https://github.com/angular/angular/issues/10010)
* **forms:** verify functions passed into async validators returns Observable or Promise ([#14053](https://github.com/angular/angular/issues/14053)) ([774e1db](https://github.com/angular/angular/commit/774e1db))
* ngModel should use rxjs/symbol/observable to detect observable ([#14236](https://github.com/angular/angular/issues/14236)) ([7e639aa](https://github.com/angular/angular/commit/7e639aa))
* **http:** remove dots from jsonp callback name ([#13219](https://github.com/angular/angular/issues/13219)) ([1eece50](https://github.com/angular/angular/commit/1eece50))
* **i18n:** parse ICU messages while normalizing templates ([#14153](https://github.com/angular/angular/issues/14153)) ([8d4aa82](https://github.com/angular/angular/commit/8d4aa82))
* **language-service:** do not crash when Angular cannot be located ([#14123](https://github.com/angular/angular/issues/14123)) ([a5b4af0](https://github.com/angular/angular/commit/a5b4af0)), closes [#14122](https://github.com/angular/angular/issues/14122)
* **platform-browser:** remove style nodes on destroy ([#13744](https://github.com/angular/angular/issues/13744)) ([0614289](https://github.com/angular/angular/commit/0614289)), closes [#11746](https://github.com/angular/angular/issues/11746)
* **router:** fix CanActivate redirect to the root on initial load ([#13929](https://github.com/angular/angular/issues/13929)) ([a047124](https://github.com/angular/angular/commit/a047124)), closes [#13530](https://github.com/angular/angular/issues/13530)
* **router:** should find guard provided in a lazy loaded module ([#13989](https://github.com/angular/angular/issues/13989)) ([0965636](https://github.com/angular/angular/commit/0965636)), closes [#12275](https://github.com/angular/angular/issues/12275)
* **router:** should allow navigation from root component in ngOnInit hook ([#13932](https://github.com/angular/angular/issues/13932)) ([4d2901d](https://github.com/angular/angular/commit/4d2901d)), closes [#13795](https://github.com/angular/angular/issues/13795)
* **testing:** async/fakeAsync/inject/withModule helpers should pass through context to callback functions ([#13718](https://github.com/angular/angular/issues/13718)) ([70bbdf5](https://github.com/angular/angular/commit/70bbdf5))
* **upgrade:** detect async downgrade component changes ([#14039](https://github.com/angular/angular/issues/14039)) ([117fa79](https://github.com/angular/angular/commit/117fa79)), closes [#6385](https://github.com/angular/angular/issues/6385) [#6385](https://github.com/angular/angular/issues/6385)



<a name="4.0.0-beta.5"></a>
## [4.0.0-beta.5](https://github.com/angular/angular/compare/4.0.0-beta.3...4.0.0-beta.5) (2017-01-25)


### Bug Fixes

* **animations:** fix internal jscompiler issue and AOT quoting ([#13798](https://github.com/angular/angular/issues/13798)) ([c2aa981](https://github.com/angular/angular/commit/c2aa981))
* **common:** support numeric value as discrete cases for NgPlural ([#13876](https://github.com/angular/angular/issues/13876)) ([f364557](https://github.com/angular/angular/commit/f364557))
* **compiler:** [i18n] XMB/XTB placeholder names can contain only A-Z, 0-9, _n ([d02eab4](https://github.com/angular/angular/commit/d02eab4))
* **compiler:** fix regexp to support firefox 31 ([#14082](https://github.com/angular/angular/issues/14082)) ([b2f9d56](https://github.com/angular/angular/commit/b2f9d56)), closes [#14029](https://github.com/angular/angular/issues/14029) [#13900](https://github.com/angular/angular/issues/13900)
* **core:** export animation classes required for Renderer impl ([#14002](https://github.com/angular/angular/issues/14002)) ([83361d8](https://github.com/angular/angular/commit/83361d8)), closes [#14001](https://github.com/angular/angular/issues/14001)
* **core:** fix not declared variable in view engine ([#14045](https://github.com/angular/angular/issues/14045)) ([d3a3a8e](https://github.com/angular/angular/commit/d3a3a8e))
* **http:** don't create a blob out of ArrayBuffer when type is application/octet-stream ([#13992](https://github.com/angular/angular/issues/13992)) ([1200cf2](https://github.com/angular/angular/commit/1200cf2)), closes [#13973](https://github.com/angular/angular/issues/13973)
* **router:** enable loadChildren with function in aot ([#13909](https://github.com/angular/angular/issues/13909)) ([635bf02](https://github.com/angular/angular/commit/635bf02)), closes [#11075](https://github.com/angular/angular/issues/11075)
* **router:** routerLinkActive should not throw when not initialized ([#13273](https://github.com/angular/angular/issues/13273)) ([e8ea741](https://github.com/angular/angular/commit/e8ea741)), closes [#13270](https://github.com/angular/angular/issues/13270)
* **upgrade:** detect async downgrade component changes ([#13812](https://github.com/angular/angular/issues/13812)) ([d6382bf](https://github.com/angular/angular/commit/d6382bf)), closes [#6385](https://github.com/angular/angular/issues/6385) [#6385](https://github.com/angular/angular/issues/6385) [#10660](https://github.com/angular/angular/issues/10660) [#12318](https://github.com/angular/angular/issues/12318) [#12034](https://github.com/angular/angular/issues/12034)
* **upgrade/static:** ensure upgraded injector is initialized early enough ([#14065](https://github.com/angular/angular/issues/14065)) ([6152eb2](https://github.com/angular/angular/commit/6152eb2)), closes [#13811](https://github.com/angular/angular/issues/13811)


### Features

* **build:** optionally build an ES2015 distro ([#13471](https://github.com/angular/angular/issues/13471)) ([be6c95a](https://github.com/angular/angular/commit/be6c95a))
* **core:** add event support to view engine ([0adb97b](https://github.com/angular/angular/commit/0adb97b))
* **core:** add initial view engine ([#14014](https://github.com/angular/angular/issues/14014)) ([2f87eb5](https://github.com/angular/angular/commit/2f87eb5))
* **core:** add pure expression support to view engine ([6541737](https://github.com/angular/angular/commit/6541737))
* **core:** Add type information to injector.get() ([#13785](https://github.com/angular/angular/issues/13785)) ([d169c24](https://github.com/angular/angular/commit/d169c24))
* **security:** allow calc and gradient functions. ([#13943](https://github.com/angular/angular/issues/13943)) ([e19bf70](https://github.com/angular/angular/commit/e19bf70))
* **tsc-wrapped:** Support of vinyl like config file was added ([#13987](https://github.com/angular/angular/issues/13987)) ([0c7726d](https://github.com/angular/angular/commit/0c7726d))
* **upgrade:** Support ng-model in downgraded components ([#10578](https://github.com/angular/angular/issues/10578)) ([e21e9c5](https://github.com/angular/angular/commit/e21e9c5))

### DEPRECATIONS

* `OpaqueToken` is now deprecated, use `InjectionToken<T>` instead.
* `Injector.get(token: any, notFoundValue?: any): any` is now deprecated
  use the same method which is now overloaded as
  `Injector.get<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T): T;`

### BREAKING CHANGES

* core: - Because `injector.get()` is now parameterize it is possible that code
  which used to work no longer type checks. Example would be if one
  injects `Foo` but configures it as `{provide: Foo, useClass: MockFoo}`.
  The injection instance will be that of `MockFoo` but the type will be
  `Foo` instead of `any` as in the past. This means that it was possible
  to call a method on `MockFoo` in the past which now will fail type
  check. See this example:

```
class Foo {}
class MockFoo extends Foo {
  setupMock();
}

var PROVIDERS = [
  {provide: Foo, useClass: MockFoo}
];

...

function myTest(injector: Injector) {
  var foo = injector.get(Foo);
  // This line used to work since `foo` used to be `any` before this
  // change, it will now be `Foo`, and `Foo` does not have `setUpMock()`.
  // The fix is to downcast: `injector.get(Foo) as MockFoo`.
  foo.setUpMock();
}
```



<a name="2.4.5"></a>
## [2.4.5](https://github.com/angular/angular/compare/2.4.4...2.4.5) (2017-01-25)


### Bug Fixes

* **compiler:** [i18n] XMB/XTB placeholder names can contain only A-Z, 0-9, _n ([5492fad](https://github.com/angular/angular/commit/5492fad))
* **compiler:** fix regexp to support firefox 31 ([#14082](https://github.com/angular/angular/issues/14082)) ([bd2eecb](https://github.com/angular/angular/commit/bd2eecb)), closes [#14029](https://github.com/angular/angular/issues/14029) [#13900](https://github.com/angular/angular/issues/13900)
* **core:** export animation classes required for Renderer impl ([#14002](https://github.com/angular/angular/issues/14002)) ([fd4f9ac](https://github.com/angular/angular/commit/fd4f9ac)), closes [#14001](https://github.com/angular/angular/issues/14001)
* **upgrade:** ensure upgraded injector is initialized early enough ([#14065](https://github.com/angular/angular/issues/14065)) ([3b2fb23](https://github.com/angular/angular/commit/3b2fb23)), closes [#13811](https://github.com/angular/angular/issues/13811)



<a name="4.0.0-beta.4"></a>
## [4.0.0-beta.4](https://github.com/angular/angular/compare/4.0.0-beta.3...4.0.0-beta.4) (2017-01-19)


### Bug Fixes

* **animations:** fix internal jscompiler issue and AOT quoting ([#13798](https://github.com/angular/angular/issues/13798)) ([c2aa981](https://github.com/angular/angular/commit/c2aa981))
* **common:** support numeric value as discrete cases for NgPlural ([#13876](https://github.com/angular/angular/issues/13876)) ([f364557](https://github.com/angular/angular/commit/f364557))
* **http:** don't create a blob out of ArrayBuffer when type is application/octet-stream ([#13992](https://github.com/angular/angular/issues/13992)) ([1200cf2](https://github.com/angular/angular/commit/1200cf2)), closes [#13973](https://github.com/angular/angular/issues/13973)
* **router:** enable loadChildren with function in aot ([#13909](https://github.com/angular/angular/issues/13909)) ([635bf02](https://github.com/angular/angular/commit/635bf02)), closes [#11075](https://github.com/angular/angular/issues/11075)
* **router:** routerLinkActive should not throw when not initialized ([#13273](https://github.com/angular/angular/issues/13273)) ([e8ea741](https://github.com/angular/angular/commit/e8ea741)), closes [#13270](https://github.com/angular/angular/issues/13270)
* **security:** allow calc and gradient functions. ([#13943](https://github.com/angular/angular/issues/13943)) ([e19bf70](https://github.com/angular/angular/commit/e19bf70))
* **upgrade:** detect async downgrade component changes ([#13812](https://github.com/angular/angular/issues/13812)) ([d6382bf](https://github.com/angular/angular/commit/d6382bf)), closes [#6385](https://github.com/angular/angular/issues/6385) [#6385](https://github.com/angular/angular/issues/6385) [#10660](https://github.com/angular/angular/issues/10660) [#12318](https://github.com/angular/angular/issues/12318) [#12034](https://github.com/angular/angular/issues/12034)


### Features

* **build:** optionally build an ES2015 distro ([#13471](https://github.com/angular/angular/issues/13471)) ([be6c95a](https://github.com/angular/angular/commit/be6c95a))
* **core:** Add type information to injector.get() ([#13785](https://github.com/angular/angular/issues/13785)) ([d169c24](https://github.com/angular/angular/commit/d169c24))


### BREAKING CHANGES

* core: - Because `injector.get()` is now parameterized it is possible that code
  which used to work no longer type checks. Example would be if one
  injects `Foo` but configures it as `{provide: Foo, useClass: MockFoo}`.
  The injection instance will be that of `MockFoo` but the type will be
  `Foo` instead of `any` as in the past. This means that it was possible
  to call a method on `MockFoo` in the past which now will fail type
  check. See this example:

```
class Foo {}
class MockFoo extends Foo {
  setupMock();
}

var PROVIDERS = [
  {provide: Foo, useClass: MockFoo}
];

...

function myTest(injector: Injector) {
  var foo = injector.get(Foo);
  // This line used to work since `foo` used to be `any` before this
  // change, it will now be `Foo`, and `Foo` does not have `setUpMock()`.
  // The fix is to downcast: `injector.get(Foo) as MockFoo`.
  foo.setUpMock();
}
```



<a name="2.4.4"></a>
## [2.4.4](https://github.com/angular/angular/compare/2.4.3...2.4.4) (2017-01-19)

* **animations:** fix internal jscompiler issue and AOT quoting ([#13798](https://github.com/angular/angular/issues/13798)) ([261fd16](https://github.com/angular/angular/commit/261fd16))
* **common:** support numeric value as discrete cases for NgPlural ([#13876](https://github.com/angular/angular/issues/13876)) ([3d0b1b8](https://github.com/angular/angular/commit/3d0b1b8))
* **http:** don't create a blob out of ArrayBuffer when type is application/octet-stream ([#13992](https://github.com/angular/angular/issues/13992)) ([015878a](https://github.com/angular/angular/commit/015878a)), closes [#13973](https://github.com/angular/angular/issues/13973)
* **router:** enable loadChildren with function in aot ([#13909](https://github.com/angular/angular/issues/13909)) ([2af5862](https://github.com/angular/angular/commit/2af5862)), closes [#11075](https://github.com/angular/angular/issues/11075)
* **router:** routerLinkActive should not throw when not initialized ([#13273](https://github.com/angular/angular/issues/13273)) ([49c4b0f](https://github.com/angular/angular/commit/49c4b0f)), closes [#13270](https://github.com/angular/angular/issues/13270)
* **security:** allow calc and gradient functions. ([#13943](https://github.com/angular/angular/issues/13943)) ([bd15110](https://github.com/angular/angular/commit/bd15110))
* **upgrade:** detect async downgrade component changes ([#13812](https://github.com/angular/angular/issues/13812)) ([2250082](https://github.com/angular/angular/commit/2250082)), closes [#6385](https://github.com/angular/angular/issues/6385) [#6385](https://github.com/angular/angular/issues/6385) [#10660](https://github.com/angular/angular/issues/10660) [#12318](https://github.com/angular/angular/issues/12318) [#12034](https://github.com/angular/angular/issues/12034)



<a name="4.0.0-beta.3"></a>
## [4.0.0-beta.3](https://github.com/angular/angular/compare/4.0.0-beta.2...4.0.0-beta.3) (2017-01-11)


### Bug Fixes

* **compiler:** avoid evaluating arguments to unknown decorators ([d061adc](https://github.com/angular/angular/commit/d061adc)), closes [#13605](https://github.com/angular/angular/issues/13605)
* **compiler:** fix template binding parsing (`*directive="-..."`) ([e5c6bb4](https://github.com/angular/angular/commit/e5c6bb4)), closes [#13800](https://github.com/angular/angular/issues/13800)
* **compiler-cli:** add support for more than 2 levels of nested lazy routes ([5d9cbd7](https://github.com/angular/angular/commit/5d9cbd7)), closes [angular/angular-cli#3663](https://github.com/angular/angular-cli/issues/3663)
* **compiler-cli:** avoid handling functions in loadChildren as lazy load routes paths ([aeed737](https://github.com/angular/angular/commit/aeed737)), closes [angular/angular-cli#3204](https://github.com/angular/angular-cli/issues/3204)
* **core:** Add type information to  differs ([8c7e93b](https://github.com/angular/angular/commit/8c7e93b)), closes [#13382](https://github.com/angular/angular/issues/13382)
* **i18n:** translate attributes inside elements marked for translation ([424e6c4](https://github.com/angular/angular/commit/424e6c4)), closes [#13796](https://github.com/angular/angular/issues/13796) [#13814](https://github.com/angular/angular/issues/13814)
* **router:** RouterLink mirrors input `target` as attribute ([d9a22da](https://github.com/angular/angular/commit/d9a22da)), closes [#13837](https://github.com/angular/angular/issues/13837)
* **router:** throw an error when navigate to null/undefined path ([46cb04d](https://github.com/angular/angular/commit/46cb04d)), closes [#10560](https://github.com/angular/angular/issues/10560) [#13384](https://github.com/angular/angular/issues/13384)
* **router:** fix checking for object intersection ([6d29fae](https://github.com/angular/angular/commit/6d29fae))


### Features

* **animations:** expose the `element` value within transition events ([4bae4b3](https://github.com/angular/angular/commit/4bae4b3))
* **animations:** expose the `triggerName` within the transition event ([3f67ab0](https://github.com/angular/angular/commit/3f67ab0)), closes [#13600](https://github.com/angular/angular/issues/13600)
* **animations:** support function types in transitions ([9211a22](https://github.com/angular/angular/commit/9211a22)), closes [#13538](https://github.com/angular/angular/issues/13538) [#13537](https://github.com/angular/angular/issues/13537)
* **language-service:** support TS2.2 plugin model ([99aa49a](https://github.com/angular/angular/commit/99aa49a))
* **NgComponentOutlet:** add NgComponentOutlet directive ([8578682](https://github.com/angular/angular/commit/8578682)), closes [#11168](https://github.com/angular/angular/issues/11168)
* **NgTemplateOutlet:** Make NgTemplateOutlet compatible with * syntax ([c0178de](https://github.com/angular/angular/commit/c0178de))
* **router:** call resolver when upstream params change ([#12942](https://github.com/angular/angular/issues/12942)) ([d4d3782](https://github.com/angular/angular/commit/d4d3782))


### BREAKING CHANGES

* core: - `IterableChangeRecord` is now an interface and parameterized on `<V>`.
  This should not be an issue unless your code does
  `new IterableChangeRecord` which it should not have a reason to do.
- `KeyValueChangeRecord` is now an interface and parameterized on `<V>`.
  This should not be an issue unless your code does
  `new KeyValueChangeRecord` which it should not have a reason to do.

### DEPRECATION

* Deprecate `ngOutletContext`. Use `ngTemplateOutletContext` instead.
* `CollectionChangeRecord` is renamed to `IterableChangeRecord`.
  `CollectionChangeRecord` is aliased to `IterableChangeRecord` and is
  marked as `@deprecated`. It will be removed in `v6.x.x`.
* Deprecate `DefaultIterableDiffer` as it is private class which
  was erroneously exposed.
* Deprecate `KeyValueDiffers#factories` as it is private field which
  was erroneously exposed.
* Deprecate `IterableDiffers#factories` as it is private field which
  was erroneously exposed.



<a name="2.4.3"></a>
## [2.4.3](https://github.com/angular/angular/compare/2.4.2...2.4.3) (2017-01-11)


### Bug Fixes

* **compiler:** avoid evaluating arguments to unknown decorators ([5e9d3db](https://github.com/angular/angular/commit/5e9d3db)), closes [#13605](https://github.com/angular/angular/issues/13605)
* **compiler:** fix template binding parsing (`*directive="-..."`) ([7dc12b9](https://github.com/angular/angular/commit/7dc12b9)), closes [#13800](https://github.com/angular/angular/issues/13800)
* **compiler-cli:** add support for more than 2 levels of nested lazy routes ([6164eb2](https://github.com/angular/angular/commit/6164eb2)), closes [angular/angular-cli#3663](https://github.com/angular/angular-cli/issues/3663)
* **compiler-cli:** avoid handling functions in loadChildren as lazy load routes paths ([313683f](https://github.com/angular/angular/commit/313683f)), closes [angular/angular-cli#3204](https://github.com/angular/angular-cli/issues/3204)
* **i18n:** translate attributes inside elements marked for translation ([d7f2a3c](https://github.com/angular/angular/commit/d7f2a3c))
* **router:** RouterLink mirrors input `target` as attribute ([1c82b58](https://github.com/angular/angular/commit/1c82b58)), closes [#13837](https://github.com/angular/angular/issues/13837)
* **router:** throw an error when navigate to null/undefined path ([61ba223](https://github.com/angular/angular/commit/61ba223)), closes [#10560](https://github.com/angular/angular/issues/10560) [#13384](https://github.com/angular/angular/issues/13384)
* **router:** fix checking for object intersection ([1692265](https://github.com/angular/angular/commit/1692265))



<a name="2.4.2"></a>
## [2.4.2](https://github.com/angular/angular/compare/2.4.1...2.4.2) (2017-01-06)


### Bug Fixes

* **common:** add link to trackBy docs from the error message ([#13634](https://github.com/angular/angular/issues/13634)) ([f723437](https://github.com/angular/angular/commit/f723437))
* **common:** do not override locale provided on bootstrap ([#13654](https://github.com/angular/angular/issues/13654)) ([5f49c3e](https://github.com/angular/angular/commit/5f49c3e)), closes [#13607](https://github.com/angular/angular/issues/13607)
* **common:** allow null/undefined values for `NgForTrackBy` ([6be55cc](https://github.com/angular/angular/commit/6be55cc)), closes [#13641](https://github.com/angular/angular/issues/13641)
* **compiler:** don’t throw when using `ANALYZE_FOR_ENTRY_COMPONENTS` with user classes ([#13679](https://github.com/angular/angular/issues/13679)) ([230e33f](https://github.com/angular/angular/commit/230e33f)), closes [#13565](https://github.com/angular/angular/issues/13565)
* **compiler:** query `<template>` elements before their children. ([#13677](https://github.com/angular/angular/issues/13677)) ([1cd73c7](https://github.com/angular/angular/commit/1cd73c7)), closes [#13118](https://github.com/angular/angular/issues/13118) [#13167](https://github.com/angular/angular/issues/13167)
* **compiler:** allow "." in attribute selectors ([#13653](https://github.com/angular/angular/issues/13653)) ([29ffdfd](https://github.com/angular/angular/commit/29ffdfd)), closes [#13645](https://github.com/angular/angular/issues/13645) [#13982](https://github.com/angular/angular/issues/13982)
* **core:** animations no longer silently exits if the element is not apart of the DOM ([#13763](https://github.com/angular/angular/issues/13763)) ([f1cde43](https://github.com/angular/angular/commit/f1cde43))
* **core:** animations should blend in all previously transitioned styles into next animation if interrupted ([#13148](https://github.com/angular/angular/issues/13148)) ([b245b92](https://github.com/angular/angular/commit/b245b92))
* **core:** remove reference to "Angular 2" in dev mode warning ([#13751](https://github.com/angular/angular/issues/13751)) ([21f5f05](https://github.com/angular/angular/commit/21f5f05))
* **core/testing:** improve misleading error message when don't call compileComponents ([#13543](https://github.com/angular/angular/issues/13543)) ([0e7f9f0](https://github.com/angular/angular/commit/0e7f9f0)), closes [#11301](https://github.com/angular/angular/issues/11301)
* **forms:** Validators.required properly validate arrays ([#13362](https://github.com/angular/angular/issues/13362)) ([17c5fa9](https://github.com/angular/angular/commit/17c5fa9)), closes [#12274](https://github.com/angular/angular/issues/12274)
* **language-service:** support TypeScript 2.1 ([#13655](https://github.com/angular/angular/issues/13655)) ([56b4296](https://github.com/angular/angular/commit/56b4296))
* **router:** fix lazy loaded module with wildcard route ([#13649](https://github.com/angular/angular/issues/13649)) ([5754ecc](https://github.com/angular/angular/commit/5754ecc)), closes [#12955](https://github.com/angular/angular/issues/12955)
* **router:** routerLink support of null ([#13380](https://github.com/angular/angular/issues/13380)) ([018865e](https://github.com/angular/angular/commit/018865e)), closes [#6971](https://github.com/angular/angular/issues/6971)
* **router:** update route snapshot before emit new values ([#13558](https://github.com/angular/angular/issues/13558)) ([9f6a647](https://github.com/angular/angular/commit/9f6a647)), closes [#12912](https://github.com/angular/angular/issues/12912)
* **upgrade:** fix/improve support for lifecycle hooks ([#13020](https://github.com/angular/angular/issues/13020)) ([21942a8](https://github.com/angular/angular/commit/21942a8))



<a name="4.0.0-beta.2"></a>
## [4.0.0-beta.2](https://github.com/angular/angular/compare/4.0.0-beta.1...4.0.0-beta.2) (2017-01-06)


### Features

* **compiler:** generate less code for bindings to DOM elements ([db49d42](https://github.com/angular/angular/commit/db49d42))
* **compiler:** generate proper reexports in `.ngfactory.ts` files to not need transitive deps for compiling `.ngfactory.ts` files. ([#13524](https://github.com/angular/angular/issues/13524)) ([9c69703](https://github.com/angular/angular/commit/9c69703)), closes [#12787](https://github.com/angular/angular/issues/12787)
* **router:** add an extra argument to CanDeactivate interface ([#13560](https://github.com/angular/angular/issues/13560)) ([69fa3bb](https://github.com/angular/angular/commit/69fa3bb)), closes [#9853](https://github.com/angular/angular/issues/9853)


### Bug Fixes

* **compiler:** improve error message for undefined providers ([#13546](https://github.com/angular/angular/issues/13546)) ([6b02b80](https://github.com/angular/angular/commit/6b02b80)), closes [#10835](https://github.com/angular/angular/issues/10835)
* **compiler:** improve the error when template is not a string ([2c0c86e](https://github.com/angular/angular/commit/2c0c86e)), closes [#8708](https://github.com/angular/angular/issues/8708) [#13377](https://github.com/angular/angular/issues/13377)
* **compiler:** throw an error for invalid provider ([#13544](https://github.com/angular/angular/issues/13544)) ([445ed43](https://github.com/angular/angular/commit/445ed43)), closes [#8870](https://github.com/angular/angular/issues/8870)
* **i18n:** parse ICU messages while normalizing templates ([e74d8aa](https://github.com/angular/angular/commit/e74d8aa))

Note: 4.0.0-beta.2 release also contains all the changes present in the 2.4.2 release.


### BREAKING CHANGES

* **core**: `SimpleChange` now takes an additional argument that defines whether this is the first
change or not. This is a low profile API and we don't expect anyone to be affected by this change.
If you are impacted by this change please file an issue. ([465516b](https://github.com/angular/angular/commit/465516b))




<a name="4.0.0-beta.1"></a>
## [4.0.0-beta.1](https://github.com/angular/angular/compare/2.4.0-marker...4.0.0-beta.1) (2016-12-22)

### Features

* **upgrade:** support the `$doCheck()` lifecycle hook in `UpgradeComponent` ([#13015](https://github.com/angular/angular/issues/13015)) ([9da4c25](https://github.com/angular/angular/commit/9da4c25))

Note: 4.0.0-beta.1 release also contains all the changes present in the 2.4.0 and the 2.4.1 releases.

<a name="2.4.1"></a>
## [2.4.1](https://github.com/angular/angular/compare/2.4.0...2.4.1) (2016-12-21)

### Bug Fixes

* **animations:** always quote string map key values in AOT code ([#13602](https://github.com/angular/angular/issues/13602)) ([6a5e46c](https://github.com/angular/angular/commit/6a5e46c))
* **animations:** always recover from a failed animation step ([#13604](https://github.com/angular/angular/issues/13604)) ([d788c67](https://github.com/angular/angular/commit/d788c67))
* **compiler:** ignore `@import` in comments ([#13368](https://github.com/angular/angular/issues/13368)) ([6316e5d](https://github.com/angular/angular/commit/6316e5d)), closes [#12196](https://github.com/angular/angular/issues/12196)
* **core:** improve error message when component factory cannot be found ([#13541](https://github.com/angular/angular/issues/13541)) ([b9e979e](https://github.com/angular/angular/commit/b9e979e)), closes [#12678](https://github.com/angular/angular/issues/12678)
* **router:** should reset location if a navigation by location is successful ([#13545](https://github.com/angular/angular/issues/13545)) ([a38f14b](https://github.com/angular/angular/commit/a38f14b)), closes [#13491](https://github.com/angular/angular/issues/13491)



<a name="2.4.0"></a>
# [2.4.0 stability-interjection](https://github.com/angular/angular/compare/2.3.1...2.4.0) (2016-12-20)


### Bug Fixes

* **animations:** allow players to be destroyed before initialized ([#13346](https://github.com/angular/angular/issues/13346)) ([b36f4bc](https://github.com/angular/angular/commit/b36f4bc)), closes [#13293](https://github.com/angular/angular/issues/13293)
* **build:** use bash string comparison operator ([#13502](https://github.com/angular/angular/issues/13502)) ([50afbe0](https://github.com/angular/angular/commit/50afbe0))
* **compiler:** do not lex `}}` when interpolation is disabled ([#13531](https://github.com/angular/angular/issues/13531)) ([9b87bb6](https://github.com/angular/angular/commit/9b87bb6)), closes [#13525](https://github.com/angular/angular/issues/13525)
* **compiler-cli:** produce metadata for .d.ts files without metadata ([#13526](https://github.com/angular/angular/issues/13526)) ([debb0c9](https://github.com/angular/angular/commit/debb0c9)), closes [#13307](https://github.com/angular/angular/issues/13307) [#13473](https://github.com/angular/angular/issues/13473) [#13521](https://github.com/angular/angular/issues/13521)
* **i18n:** add a default example to xmb placeholders ([#13507](https://github.com/angular/angular/issues/13507)) ([3f17841](https://github.com/angular/angular/commit/3f17841))
* **upgrade:** fix `registerForNg1Tests` ([#13522](https://github.com/angular/angular/issues/13522)) ([c26c24c](https://github.com/angular/angular/commit/c26c24c))


### Features

* update to `rxjs@5.0.1` and unpin the rxjs peerDeps via `^5.0.1` ([#13572](https://github.com/angular/angular/issues/13572)) ([8d5da1e](https://github.com/angular/angular/commit/8d5da1e)), closes [#13561](https://github.com/angular/angular/issues/13561) [#13478](https://github.com/angular/angular/issues/13478)


<a name="4.0.0-beta.0"></a>
## [4.0.0-beta.0](https://github.com/angular/angular/compare/2.3.0...4.0.0-beta.0) (2016-12-15)


### Features

* **common:** add a `titlecase` pipe ([#13324](https://github.com/angular/angular/issues/13324)) ([61d7c1e](https://github.com/angular/angular/commit/61d7c1e)), closes [#11436](https://github.com/angular/angular/issues/11436)
* **common:** export NgLocaleLocalization ([#13367](https://github.com/angular/angular/issues/13367)) ([56dce0e](https://github.com/angular/angular/commit/56dce0e)), closes [#11921](https://github.com/angular/angular/issues/11921)
* **compiler:** add id property to i18nMessage ([6dd5201](https://github.com/angular/angular/commit/6dd5201))
* **compiler:** digest methods return i18nMessage id if sets ([562f7a2](https://github.com/angular/angular/commit/562f7a2))
* **forms:** add novalidate by default ([#13092](https://github.com/angular/angular/issues/13092)) ([4c35be3](https://github.com/angular/angular/commit/4c35be3))
* **http:** simplify URLSearchParams creation ([#13338](https://github.com/angular/angular/issues/13338)) ([90c2235](https://github.com/angular/angular/commit/90c2235)), closes [#8858](https://github.com/angular/angular/issues/8858)
* **language-service:** warn when a method isn't called in an event ([#13437](https://github.com/angular/angular/issues/13437)) ([9ec0a4e](https://github.com/angular/angular/commit/9ec0a4e))
* **platform browser:** introduce Meta service ([#12322](https://github.com/angular/angular/issues/12322)) ([72361fb](https://github.com/angular/angular/commit/72361fb))
* **router:** routerLink add tabindex attribute ([#13094](https://github.com/angular/angular/issues/13094)) ([a006c14](https://github.com/angular/angular/commit/a006c14)), closes [#10895](https://github.com/angular/angular/issues/10895)
* **testing:** add overrideTemplate method ([#13372](https://github.com/angular/angular/issues/13372)) ([169ed82](https://github.com/angular/angular/commit/169ed82)), closes [#10685](https://github.com/angular/angular/issues/10685)
* **common** ngIf now supports else; saves condition to local var ([b4db73d](https://github.com/angular/angular/commit/b4db73d)), closes [#13061](https://github.com/angular/angular/issues/13061) [#13297](https://github.com/angular/angular/issues/13297)

Note: 4.0.0-beta.0 release also contains all the changes present in the 2.3.1 release.

<a name="2.3.1"></a>
## [2.3.1](https://github.com/angular/angular/compare/2.3.0...2.3.1) (2016-12-15)


### Bug Fixes

* **animations:** always cleanup players after they have finished internally ([#13334](https://github.com/angular/angular/issues/13334)) ([a26e054](https://github.com/angular/angular/commit/a26e054)), closes [#13333](https://github.com/angular/angular/issues/13333)
* **animations:** throw errors and normalize offset beyond the range of [0,1] ([6557bc3](https://github.com/angular/angular/commit/6557bc3)), closes [#13348](https://github.com/angular/angular/issues/13348) [#13440](https://github.com/angular/angular/issues/13440)
* **compiler:** emit quoted object literal keys if the source is quoted ([ecfad46](https://github.com/angular/angular/commit/ecfad46)), closes [#13249](https://github.com/angular/angular/issues/13249) [#13356](https://github.com/angular/angular/issues/13356)
* **compiler:** fix merge error in compiler_host ([69b52eb](https://github.com/angular/angular/commit/69b52eb))
* **compiler:** fix PR 13322 ([#13331](https://github.com/angular/angular/issues/13331)) ([79728b4](https://github.com/angular/angular/commit/79728b4))
* **compiler:** fix simplify a reference without a name ([1c279b3](https://github.com/angular/angular/commit/1c279b3)), closes [#13470](https://github.com/angular/angular/issues/13470)
* **compiler:** fix transpiled ES5 code ([#13322](https://github.com/angular/angular/issues/13322)) ([6c1d790](https://github.com/angular/angular/commit/6c1d790)), closes [#13301](https://github.com/angular/angular/issues/13301)
* **compiler:** generated CSS files suffixed with ngstyle. ([#13353](https://github.com/angular/angular/issues/13353)) ([c8a9b70](https://github.com/angular/angular/commit/c8a9b70)), closes [#13141](https://github.com/angular/angular/issues/13141)
* **compiler:** make sure provider values with `name` property don’t break. ([efa2d80](https://github.com/angular/angular/commit/efa2d80)), closes [#13394](https://github.com/angular/angular/issues/13394) [#13445](https://github.com/angular/angular/issues/13445)
* **compiler:** narrow the span reported for invalid pipes ([307d305](https://github.com/angular/angular/commit/307d305)), closes [#13326](https://github.com/angular/angular/issues/13326) [#13411](https://github.com/angular/angular/issues/13411)
* **compiler:** propagate exports when upgrading metadata to v2 ([f6ef7d6](https://github.com/angular/angular/commit/f6ef7d6))
* **compiler:** resolver should merge host bindings and listeners ([#13474](https://github.com/angular/angular/issues/13474)) ([6aeaca3](https://github.com/angular/angular/commit/6aeaca3)), closes [#13327](https://github.com/angular/angular/issues/13327)
* **compiler:** support dotted property binding ([8db184d](https://github.com/angular/angular/commit/8db184d)), closes [angular/flex-layout#34](https://github.com/angular/flex-layout/issues/34)
* **compiler:** update to metadata version 3 ([#13464](https://github.com/angular/angular/issues/13464)) ([b9b557c](https://github.com/angular/angular/commit/b9b557c))
* **core:** detectChanges() doesn't work on detached instance ([4d6ac9d](https://github.com/angular/angular/commit/4d6ac9d)), closes [#13426](https://github.com/angular/angular/issues/13426) [#13472](https://github.com/angular/angular/issues/13472)
* **core:** properly destroy embedded Views attatched to ApplicationRef ([#13459](https://github.com/angular/angular/issues/13459)) ([d40bbf4](https://github.com/angular/angular/commit/d40bbf4)), closes [#13062](https://github.com/angular/angular/issues/13062)
* **core:** remove logError from logGroup ([#12925](https://github.com/angular/angular/issues/12925)) ([5fab871](https://github.com/angular/angular/commit/5fab871))
* **forms:** ensure `select[multiple]` retains selections ([b3dcff0](https://github.com/angular/angular/commit/b3dcff0)), closes [#12527](https://github.com/angular/angular/issues/12527) [#12654](https://github.com/angular/angular/issues/12654)
* **forms:** fix Validators.min/maxLength with FormArray ([#13095](https://github.com/angular/angular/issues/13095)) ([7383e4a](https://github.com/angular/angular/commit/7383e4a)), closes [#13089](https://github.com/angular/angular/issues/13089)
* **forms:** introduce checkbox required validator ([124267c](https://github.com/angular/angular/commit/124267c)), closes [#11459](https://github.com/angular/angular/issues/11459) [#13364](https://github.com/angular/angular/issues/13364)
* **http:** check response body text against undefined ([#13017](https://github.com/angular/angular/issues/13017)) ([f106a18](https://github.com/angular/angular/commit/f106a18))
* **http:** create a copy of headers when merge options ([#13365](https://github.com/angular/angular/issues/13365)) ([65c9b5b](https://github.com/angular/angular/commit/65c9b5b)), closes [#11980](https://github.com/angular/angular/issues/11980)
* **language-service:** correctly type `undefined` ([0a7364f](https://github.com/angular/angular/commit/0a7364f)), closes [#13412](https://github.com/angular/angular/issues/13412) [#13414](https://github.com/angular/angular/issues/13414)
* **compiler**: better error when directive not listed in NgModule.declarations ([b0cd514](https://github.com/angular/angular/commit/b0cd514))
* **language-service:** treat string unions as strings ([#13406](https://github.com/angular/angular/issues/13406)) ([14dd2b3](https://github.com/angular/angular/commit/14dd2b3)), closes [#13403](https://github.com/angular/angular/issues/13403)
* **router:** add support for query params with multiple values ([e4d5a5f](https://github.com/angular/angular/commit/e4d5a5f)), closes [#11373](https://github.com/angular/angular/issues/11373)
* **router:** Use T type in Resolve interface ([#13242](https://github.com/angular/angular/issues/13242)) ([5ee8155](https://github.com/angular/angular/commit/5ee8155))
* **selector:** SelectorMatcher match elements with :not selector ([#12977](https://github.com/angular/angular/issues/12977)) ([392c9ac](https://github.com/angular/angular/commit/392c9ac))
* **tsc-wrapped:** generate metadata for exports without module specifier ([cd03c77](https://github.com/angular/angular/commit/cd03c77)), closes [#13327](https://github.com/angular/angular/issues/13327)
* **upgrade:** fix downgrade content projection and injector inheritance ([86c5098](https://github.com/angular/angular/commit/86c5098)), closes [#6629](https://github.com/angular/angular/issues/6629) [#7727](https://github.com/angular/angular/issues/7727) [#8729](https://github.com/angular/angular/issues/8729) [#9643](https://github.com/angular/angular/issues/9643) [#9649](https://github.com/angular/angular/issues/9649) [#12675](https://github.com/angular/angular/issues/12675)
* **upgrade:** enable AngularJS unit testing of upgrade module ([2fc0560](https://github.com/angular/angular/commit/2fc0560)), closes [#5462](https://github.com/angular/angular/issues/5462) [#12675](https://github.com/angular/angular/issues/12675)


### Performance Improvements

* **animations:** always run the animation queue outside of zones ([e2622ad](https://github.com/angular/angular/commit/e2622ad)), closes [#13440](https://github.com/angular/angular/issues/13440)

### Note ###

Due to regression in the 2.3.0 release that was fixed by [#13464](https://github.com/angular/angular/pull/13464),
components that have been compiled using 2.3.0 and published to npm will need to be recompiled and republished.

The >=2.3.1 compiler will issue is the following error if it encounters components compiled with 2.3.0:
`Unsupported metadata version 2 for module ${module}. This module should be compiled with a newer version of ngc`.

We are adding more tests to our test suite to catch these kinds of problems before we cut a release.

<a name="2.3.0"></a>
# [2.3.0](https://github.com/angular/angular/compare/2.3.0-rc.0...2.3.0) (2016-12-07)


### Bug Fixes

* **common:** make sure the plural category exists ([#13169](https://github.com/angular/angular/issues/13169)) ([82c81cd](https://github.com/angular/angular/commit/82c81cd)), closes [#12379](https://github.com/angular/angular/issues/12379)
* **compiler:** include the summaries of reexported modules / directives / pipes ([#13196](https://github.com/angular/angular/issues/13196)) ([75d1617](https://github.com/angular/angular/commit/75d1617))
* **compiler:** serialize any `StaticSymbol` correctly, not matter in which context ([5614c4f](https://github.com/angular/angular/commit/5614c4f))
* **compiler:** short-circuit expressions with an index ([#13263](https://github.com/angular/angular/issues/13263)) ([f31c947](https://github.com/angular/angular/commit/f31c947)), closes [#13254](https://github.com/angular/angular/issues/13254)
* **core:** display framework version on bootstrapped component ([#13252](https://github.com/angular/angular/issues/13252)) ([16efb13](https://github.com/angular/angular/commit/16efb13))
* **facade:** cache original format string ([#12764](https://github.com/angular/angular/issues/12764)) ([a132287](https://github.com/angular/angular/commit/a132287))
* **http:** set the default Accept header ([#12989](https://github.com/angular/angular/issues/12989)) ([986abbe](https://github.com/angular/angular/commit/986abbe)), closes [#6354](https://github.com/angular/angular/issues/6354)
* **language-service:** avoid throwing for invalid class declarations ([#13257](https://github.com/angular/angular/issues/13257)) ([93556a5](https://github.com/angular/angular/commit/93556a5)), closes [#13253](https://github.com/angular/angular/issues/13253)
* **language-service:** do not throw for invalid metadata ([#13261](https://github.com/angular/angular/issues/13261)) ([4a09c81](https://github.com/angular/angular/commit/4a09c81)), closes [#13255](https://github.com/angular/angular/issues/13255)
* **language-service:** remove incompletely used parameter from `createLanguageServiceFromTypescript()` ([#13278](https://github.com/angular/angular/issues/13278)) ([25c2141](https://github.com/angular/angular/commit/25c2141)), closes [#13277](https://github.com/angular/angular/issues/13277)
* **language-service:** update to use `CompilerHost` from compiler-cli ([#13189](https://github.com/angular/angular/issues/13189)) ([3ff6554](https://github.com/angular/angular/commit/3ff6554))
* **router:** allow specifying a matcher without specifying a path ([bbb7a39](https://github.com/angular/angular/commit/bbb7a39)), closes [#12972](https://github.com/angular/angular/issues/12972)
* **router:** fix replaceUrl on RouterLink directives ([349ad75](https://github.com/angular/angular/commit/349ad75))
* **router:** fix skipLocationChanges on RouterLink directives ([f562cbf](https://github.com/angular/angular/commit/f562cbf)), closes [#13156](https://github.com/angular/angular/issues/13156)
* **router:** make setUpLocationChangeListener idempotent ([25e5b2f](https://github.com/angular/angular/commit/25e5b2f))
* **router:** runs guards every time when unsuccessfully navigating to the same url over and over again ([#13209](https://github.com/angular/angular/issues/13209)) ([d46b8de](https://github.com/angular/angular/commit/d46b8de))
* **router:** throw a better error message when AngularJS is not bootstraped ([c767df0](https://github.com/angular/angular/commit/c767df0))
* **router:** validate nested routes ([#13224](https://github.com/angular/angular/issues/13224)) ([2893c2c](https://github.com/angular/angular/commit/2893c2c)), closes [#12827](https://github.com/angular/angular/issues/12827)
* **tsc-wrapped:** have UserError display the actual error ([393c100](https://github.com/angular/angular/commit/393c100))


### Features

* **compiler:** read and write `.ngsummary.json` files ([614a35d](https://github.com/angular/angular/commit/614a35d)), closes [#12787](https://github.com/angular/angular/issues/12787)



<a name="2.3.0-rc.0"></a>
# [2.3.0-rc.0](https://github.com/angular/angular/compare/2.3.0-beta.0...2.3.0-rc.0) (2016-11-30)


### Bug Fixes

* **animations:** blend in all previously transitioned styles into next animation if interrupted ([#13014](https://github.com/angular/angular/issues/13014)) ([ef96763](https://github.com/angular/angular/commit/ef96763)), closes [#13013](https://github.com/angular/angular/issues/13013)
* **benchmarks:** use sanitized style values ([#12943](https://github.com/angular/angular/issues/12943)) ([fc5ac1e](https://github.com/angular/angular/commit/fc5ac1e))
* **build:** update versions of umd bundles ([#13038](https://github.com/angular/angular/issues/13038)) ([86ffa88](https://github.com/angular/angular/commit/86ffa88)), closes [#13037](https://github.com/angular/angular/issues/13037)
* **changelog:** replace beta.1 with beta.0 ([#12961](https://github.com/angular/angular/issues/12961)) ([07a986d](https://github.com/angular/angular/commit/07a986d))
* **ci:** pin version of npm on CircleCI ([#12954](https://github.com/angular/angular/issues/12954)) ([a3884db](https://github.com/angular/angular/commit/a3884db))
* **closure:** quote date pattern aliases ([#13012](https://github.com/angular/angular/issues/13012)) ([7dcca30](https://github.com/angular/angular/commit/7dcca30))
* **common:** update DatePipe to allow closure compilation ([b2b7219](https://github.com/angular/angular/commit/b2b7219))
* **compiler:** correctly evaluate references to static functions ([#13133](https://github.com/angular/angular/issues/13133)) ([627282d](https://github.com/angular/angular/commit/627282d))
* **compiler:** fix performance regression caused by 5b0f9e2 ([43c0e9a](https://github.com/angular/angular/commit/43c0e9a)), closes [#13146](https://github.com/angular/angular/issues/13146)
* **compiler:** fix versions of `@angular/tsc-wrapped` ([bccf0e6](https://github.com/angular/angular/commit/bccf0e6))
* **compiler-cli:** fix paths in source maps to be relative ([2a3ca7b](https://github.com/angular/angular/commit/2a3ca7b)), closes [#13040](https://github.com/angular/angular/issues/13040)
* **compiler-cli:** pin the version of `tsc-wrapped` ([966bcba](https://github.com/angular/angular/commit/966bcba))
* **language-service:** harden against partial normalization of directives ([2975d89](https://github.com/angular/angular/commit/2975d89))
* **core:** shrinkwrap was out of date with packages. ([e45b7ff](https://github.com/angular/angular/commit/e45b7ff))
* **language-service:** make link check pass ([7194fc2](https://github.com/angular/angular/commit/7194fc2))
* **router:** guards restore an incorrect url when used with skipLocationChange ([ad20d7d](https://github.com/angular/angular/commit/ad20d7d)), closes [#12825](https://github.com/angular/angular/issues/12825)
* **router:** support redirects to named outlets ([602522b](https://github.com/angular/angular/commit/602522b)), closes [#12740](https://github.com/angular/angular/issues/12740) [#9921](https://github.com/angular/angular/issues/9921)
* **tsc-wrapped:** set correct version number ([897555c](https://github.com/angular/angular/commit/897555c))
* **tsc-wrapped:** still emit version 1 metadata to allow use of new components in old setups ([bc69c74](https://github.com/angular/angular/commit/bc69c74))
* **upgrade:** call ng1 lifecycle hooks ([#12875](https://github.com/angular/angular/issues/12875)) ([1ef4696](https://github.com/angular/angular/commit/1ef4696))
* **version:** take all of version string after patch version ([f275f36](https://github.com/angular/angular/commit/f275f36))


### Features

* **core:** update RxJS peer dependency to 5.0.0-rc.4 Please see [this gist](https://gist.github.com/robwormald/19dea0c70a6e01aadced6731aed4f9f7) if you depend on the `cache` operator ([2d6a003](https://github.com/angular/angular/commit/2d6a003)), closes [#13125](https://github.com/angular/angular/issues/13125)
* **core:** upgrade zone.js to v0.7.1 ([c4bbafc](https://github.com/angular/angular/commit/c4bbafc))
* **build:** record angular version in the dom ([#13164](https://github.com/angular/angular/issues/13164)) ([e628b66](https://github.com/angular/angular/commit/e628b66))
* **core:** expose destroy() method on ViewRef ([808275a](https://github.com/angular/angular/commit/808275a))
* **core:** properly support inheritance ([f5c8e09](https://github.com/angular/angular/commit/f5c8e09)), closes [#11606](https://github.com/angular/angular/issues/11606) [#12892](https://github.com/angular/angular/issues/12892)
* **language-service:** add services to support editors ([#12987](https://github.com/angular/angular/issues/12987)) ([519a324](https://github.com/angular/angular/commit/519a324))
* **router:** add support for custom route reuse strategies ([42cf06f](https://github.com/angular/angular/commit/42cf06f))
* **tools:** allow disabling annotation lowering ([c1a62e2](https://github.com/angular/angular/commit/c1a62e2))



<a name="2.2.4"></a>
## [2.2.4](https://github.com/angular/angular/compare/2.2.3...2.2.4) (2016-11-30)


### Bug Fixes

* **common:** update DatePipe to allow closure compilation ([eba53fd](https://github.com/angular/angular/commit/eba53fd))
* **compiler:** fix performance regression caused by 5b0f9e2 ([ee2d6e5](https://github.com/angular/angular/commit/ee2d6e5)), closes [#13146](https://github.com/angular/angular/issues/13146)
* **compiler-cli:** fix paths in source maps to be relative ([eb173bc](https://github.com/angular/angular/commit/eb173bc)), closes [#13040](https://github.com/angular/angular/issues/13040)



<a name="2.2.3"></a>
## [2.2.3](https://github.com/angular/angular/compare/2.2.2...2.2.3) (2016-11-23)

### Bug Fixes

* **compiler:** Revert: fix versions of `@angular/tsc-wrapped` ([015ca47](https://github.com/angular/angular/commit/015ca47))
* **animations:** Revert: blend in all previously transitioned styles into next animation if interrupted ([c12e56e](https://github.com/angular/angular/commit/c12e56e))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/angular/angular/compare/2.2.1...2.2.2) (2016-11-22)


### Bug Fixes

* **animations:** blend in all previously transitioned styles into next animation if interrupted ([#13014](https://github.com/angular/angular/issues/13014)) ([ea4fc9b](https://github.com/angular/angular/commit/ea4fc9b)), closes [#13013](https://github.com/angular/angular/issues/13013)
* **benchmarks:** use sanitized style values ([#12943](https://github.com/angular/angular/issues/12943)) ([33a7902](https://github.com/angular/angular/commit/33a7902))
* **closure:** quote date pattern aliases ([#13012](https://github.com/angular/angular/issues/13012)) ([0956ace](https://github.com/angular/angular/commit/0956ace))
* **compiler:** fix versions of `@angular/tsc-wrapped` ([2fe6fb1](https://github.com/angular/angular/commit/2fe6fb1))
* **router:** add a banner file for the router ([#12919](https://github.com/angular/angular/issues/12919)) ([8df328b](https://github.com/angular/angular/commit/8df328b))
* **router:** add a banner file for the router ([#12919](https://github.com/angular/angular/issues/12919)) ([511cd4d](https://github.com/angular/angular/commit/511cd4d))
* **router:** removes a peer dependency from router to upgrade ([115f18f](https://github.com/angular/angular/commit/115f18f))
* **router:** removes a peer dependency from router to upgrade ([87d5d49](https://github.com/angular/angular/commit/87d5d49))
* **router:** support redirects to named outlets ([09226d9](https://github.com/angular/angular/commit/09226d9)), closes [#12740](https://github.com/angular/angular/issues/12740) [#9921](https://github.com/angular/angular/issues/9921)
* **upgrade:** call ng1 lifecycle hooks ([#12875](https://github.com/angular/angular/issues/12875)) ([462316b](https://github.com/angular/angular/commit/462316b))



<a name="2.3.0-beta.0"></a>
# [2.3.0-beta.0](https://github.com/angular/angular/compare/2.2.0...2.3.0-beta.0) (2016-11-17)

### Bug Fixes

* **compiler:** assert xliff messages have translations ([7908679](https://github.com/angular/angular/commit/7908679)), closes [#12815](https://github.com/angular/angular/issues/12815) [#12604](https://github.com/angular/angular/issues/12604)
* **compiler:** updates hash algo for xmb/xtb files ([2f14415](https://github.com/angular/angular/commit/2f14415))
* **core:** fix placeholders handling in i18n. ([76e4911](https://github.com/angular/angular/commit/76e4911)), closes [#12512](https://github.com/angular/angular/issues/12512)
* **core:** misc i18n fixes ([ed5e98d](https://github.com/angular/angular/commit/ed5e98d))
* **core:** xmb serializer uses decimal messaged IDs ([08c038e](https://github.com/angular/angular/commit/08c038e)), closes [#12511](https://github.com/angular/angular/issues/12511)
* **platform-browser:** enable AOT ([efbbefd](https://github.com/angular/angular/commit/efbbefd)), closes [#12783](https://github.com/angular/angular/issues/12783)

### Features

* **core:** add `attachView` / `detachView` to ApplicationRef ([9f7d32a](https://github.com/angular/angular/commit/9f7d32a)), closes [#9293](https://github.com/angular/angular/issues/9293)
* **core:** expose `ViewRef` as `ChangeDetectorRef` ([1b5384e](https://github.com/angular/angular/commit/1b5384e)), closes [#12722](https://github.com/angular/angular/issues/12722)
* **core:** implements a decimal fingerprint for i18n ([582550a](https://github.com/angular/angular/commit/582550a))
* **router:** register router with ngprobe ([c2fae72](https://github.com/angular/angular/commit/c2fae72))
* **router_link:** add skipLocationChange and replaceUrl inputs ([#12850](https://github.com/angular/angular/issues/12850)) ([46d1502](https://github.com/angular/angular/commit/46d1502))

Note: The 2.3.0-beta.0 release also contains all the changes present in the 2.2.1 release.



<a name="2.2.1"></a>
## [2.2.1](https://github.com/angular/angular/compare/2.2.0...2.2.1) (2016-11-17)


### Bug Fixes

* **animations:** only pass in same typed players as previous players into web-animations ([#12907](https://github.com/angular/angular/issues/12907)) ([583d283](https://github.com/angular/angular/commit/583d283))
* **animations:** retain styling when transition destinations are changed ([#12208](https://github.com/angular/angular/issues/12208)) ([5c46c49](https://github.com/angular/angular/commit/5c46c49)), closes [#9661](https://github.com/angular/angular/issues/9661)
* **core:** support `ngTemplateOutlet` in production mode ([#12921](https://github.com/angular/angular/issues/12921)) ([4628798](https://github.com/angular/angular/commit/4628798)), closes [#12911](https://github.com/angular/angular/issues/12911)
* **http:** correctly handle response body for 204 status code ([21a4de9](https://github.com/angular/angular/commit/21a4de9)), closes [#12830](https://github.com/angular/angular/issues/12830) [#12393](https://github.com/angular/angular/issues/12393)
* **http:** return request url if it cannot be retrieved from response ([845ea23](https://github.com/angular/angular/commit/845ea23)), closes [#12837](https://github.com/angular/angular/issues/12837)
* **upgrade:** make AoT ngUpgrade work with the testability API and resumeBootstrap() ([#12910](https://github.com/angular/angular/issues/12910)) ([dc1662a](https://github.com/angular/angular/commit/dc1662a))
* **platform-browser:** fix disableDebugTools() ([#12918](https://github.com/angular/angular/issues/12918)) ([7b67bad](https://github.com/angular/angular/commit/7b67bad))
* **router:** add a banner file for the router ([#12919](https://github.com/angular/angular/issues/12919)) ([364642d](https://github.com/angular/angular/commit/364642d))
* **router:** removes a peer dependency from router to upgrade ([1dcf1f4](https://github.com/angular/angular/commit/1dcf1f4))
* **forms** allow for null values in HTML select options bound with ngValue ([e0ce545](https://github.com/angular/angular/commit/e0ce545)), closes [#10349](https://github.com/angular/angular/issues/10349)
* **router:** should not create a route state if navigation is canceled ([#12868](https://github.com/angular/angular/issues/12868)) ([dabaf85](https://github.com/angular/angular/commit/dabaf85)), closes [#12776](https://github.com/angular/angular/issues/12776)
* **common:** select should allow for null values in HTML select options bound with ngValue ([e02c180](https://github.com/angular/angular/commit/e02c180)), closes [#12829](https://github.com/angular/angular/issues/12829)
* **compiler-cli:** support ctorParams in function closure ([#12876](https://github.com/angular/angular/issues/12876)) ([6cdc3b5](https://github.com/angular/angular/commit/6cdc3b5))


<a name="2.2.0"></a>
# [2.2.0 upgrade-firebooster](https://github.com/angular/angular/compare/2.2.0-rc.0...2.2.0) (2016-11-14)

### Features (summary of all features from 2.2.0-beta.0 - 2.2.0-rc.0 releases)

* **common:** support narrow forms for month and weekdays in DatePipe ([#12297](https://github.com/angular/angular/issues/12297)) ([f77ab6a](https://github.com/angular/angular/commit/f77ab6a)), closes [#12294](https://github.com/angular/angular/issues/12294)
* **core:** map 'for' attribute to 'htmlFor' property ([#10546](https://github.com/angular/angular/issues/10546)) ([634b3bb](https://github.com/angular/angular/commit/634b3bb)), closes [#7516](https://github.com/angular/angular/issues/7516)
* **core:** add the find method to QueryList ([7c16ef9](https://github.com/angular/angular/commit/7c16ef9))
* **forms:** add hasError and getError to AbstractControlDirective ([#11985](https://github.com/angular/angular/issues/11985)) ([592f40a](https://github.com/angular/angular/commit/592f40a)), closes [#7255](https://github.com/angular/angular/issues/7255)
* **forms:** add ng-pending CSS class during async validation ([#11243](https://github.com/angular/angular/issues/11243)) ([97bc971](https://github.com/angular/angular/commit/97bc971)), closes [#10336](https://github.com/angular/angular/issues/10336)
* **forms:** add emitEvent to AbstractControl methods ([#11949](https://github.com/angular/angular/issues/11949)) ([b9fc090](https://github.com/angular/angular/commit/b9fc090))
* **forms:** make 'parent' a public property of 'AbstractControl' ([#11855](https://github.com/angular/angular/issues/11855)) ([445e592](https://github.com/angular/angular/commit/445e592))
* **forms:** Validator.pattern accepts a RegExp ([#12323](https://github.com/angular/angular/issues/12323)) ([bf60418](https://github.com/angular/angular/commit/bf60418))
* **router:** add a provider making angular1/angular2 integration easier ([#12769](https://github.com/angular/angular/issues/12769)) ([6e35d13](https://github.com/angular/angular/commit/6e35d13))
* **router:** add support for custom url matchers ([7340735](https://github.com/angular/angular/commit/7340735)), closes [#12442](https://github.com/angular/angular/issues/12442) [#12772](https://github.com/angular/angular/issues/12772)
* **router:** export routerLinkActive w/ isActive property ([c9f58cf](https://github.com/angular/angular/commit/c9f58cf))
* **router:** add support for ng1/ng2 migration ([#12160](https://github.com/angular/angular/issues/12160)) ([8b9ab44](https://github.com/angular/angular/commit/8b9ab44))
* **upgrade:** add support for AoT compiled upgrade applications ([d6791ff](https://github.com/angular/angular/commit/d6791ff)), closes [#12239](https://github.com/angular/angular/issues/12239)
* **upgrade:** add support for `require` in UpgradeComponent ([fe1d0e2](https://github.com/angular/angular/commit/fe1d0e2))
* **upgrade:** add/improve support for lifecycle hooks in UpgradeComponent ([469010e](https://github.com/angular/angular/commit/469010e))



### Performance Improvements

* **compiler:** introduce direct rendering ([9c23884](https://github.com/angular/angular/commit/9c23884))
* **core:** don’t use `DomAdapter` nor zone for regular events ([648ce59](https://github.com/angular/angular/commit/648ce59))
* **core:** use `array.push` / `array.pop` instead of `splice` if possible ([0fc11a4](https://github.com/angular/angular/commit/0fc11a4))
* **platform-browser:** cache plugin resolution in the EventManager ([73593d4](https://github.com/angular/angular/commit/73593d4)), closes [#12824](https://github.com/angular/angular/issues/12824)
* **platform-browser:** don’t use `DomAdapter` any more ([d708a88](https://github.com/angular/angular/commit/d708a88))




### Bug Fixes

* **animations:** allow animations to be destroyed manually ([#12719](https://github.com/angular/angular/issues/12719)) ([fe35bc3](https://github.com/angular/angular/commit/fe35bc3)), closes [#12456](https://github.com/angular/angular/issues/12456)
* **animations:** always normalize style properties and values during compilation ([#12755](https://github.com/angular/angular/issues/12755)) ([a0e9fde](https://github.com/angular/angular/commit/a0e9fde)), closes [#11582](https://github.com/angular/angular/issues/11582) [#12481](https://github.com/angular/angular/issues/12481)
* **animations:** always trigger animations after the change detection check ([#12713](https://github.com/angular/angular/issues/12713)) ([383f23b](https://github.com/angular/angular/commit/383f23b))
* **animations:** ensure animations work with web-workers ([#12656](https://github.com/angular/angular/issues/12656)) ([19e869e](https://github.com/angular/angular/commit/19e869e))
* **animations:** ensure web-animations are caught within the Angular zone ([f80a157](https://github.com/angular/angular/commit/f80a157)), closes [#11881](https://github.com/angular/angular/issues/11881) [#11712](https://github.com/angular/angular/issues/11712) [#12355](https://github.com/angular/angular/issues/12355) [#11881](https://github.com/angular/angular/issues/11881) [#12546](https://github.com/angular/angular/issues/12546) [#12707](https://github.com/angular/angular/issues/12707) [#12774](https://github.com/angular/angular/issues/12774)
* **common:** `NgSwitch` - don’t create the default case if another case matches ([#12726](https://github.com/angular/angular/issues/12726)) ([d8f23f4](https://github.com/angular/angular/commit/d8f23f4)), closes [#11297](https://github.com/angular/angular/issues/11297) [#9420](https://github.com/angular/angular/issues/9420)
* **common:** I18nSelectPipe selects other case on default ([4708b24](https://github.com/angular/angular/commit/4708b24))
* **common:** no TZ Offset added by DatePipe for dates without time ([#12380](https://github.com/angular/angular/issues/12380)) ([2aba8b0](https://github.com/angular/angular/commit/2aba8b0))
* **common:** NgClass should throw a descriptive error when CSS class is not a string ([#12662](https://github.com/angular/angular/issues/12662)) ([f3793b5](https://github.com/angular/angular/commit/f3793b5)), closes [#12586](https://github.com/angular/angular/issues/12586)
* **common:** DatePipe should handle empty string ([#12374](https://github.com/angular/angular/issues/12374)) ([3dc6177](https://github.com/angular/angular/commit/3dc6177))
* **compiler:** don't convert undefined to null literals ([#11503](https://github.com/angular/angular/issues/11503)) ([f0cdb42](https://github.com/angular/angular/commit/f0cdb42)), closes [#11493](https://github.com/angular/angular/issues/11493)
* **compiler:** generate safe access strictNullChecks compatible code ([#12800](https://github.com/angular/angular/issues/12800)) ([a965d11](https://github.com/angular/angular/commit/a965d11)), closes [#12795](https://github.com/angular/angular/issues/12795)
* **compiler:** support more than 9 interpolations ([#12710](https://github.com/angular/angular/issues/12710)) ([22c021c](https://github.com/angular/angular/commit/22c021c)), closes [#10253](https://github.com/angular/angular/issues/10253)
* **compiler:** use the other case by default in ICU messages ([55dc0e4](https://github.com/angular/angular/commit/55dc0e4))
* **compiler-cli:** suppress closure compiler suspiciousCode check in codegen ([#12666](https://github.com/angular/angular/issues/12666)) ([7103754](https://github.com/angular/angular/commit/7103754))
* **compiler-cli:** suppress two more closure compiler checks in codegen ([#12698](https://github.com/angular/angular/issues/12698)) ([77cbf7f](https://github.com/angular/angular/commit/77cbf7f))
* **core:** allow to query content of templates that are stamped out at a different place ([f2bbef3](https://github.com/angular/angular/commit/f2bbef3)), closes [#12283](https://github.com/angular/angular/issues/12283) [#12094](https://github.com/angular/angular/issues/12094)
* **core:** apply host attributes to root elements ([#12761](https://github.com/angular/angular/issues/12761)) ([ad3bf6c](https://github.com/angular/angular/commit/ad3bf6c)), closes [#12744](https://github.com/angular/angular/issues/12744)
* **core:** ensure that component views that have no bindings recurse into nested components / view containers. ([051d748](https://github.com/angular/angular/commit/051d748))
* **core:** fix pseudo-selector shimming ([#12754](https://github.com/angular/angular/issues/12754)) ([acbf1d8](https://github.com/angular/angular/commit/acbf1d8)), closes [#12730](https://github.com/angular/angular/issues/12730) [#12354](https://github.com/angular/angular/issues/12354)
* **forms:** check if registerOnValidatorChange exists on validator before trying to invoke it ([#12801](https://github.com/angular/angular/issues/12801)) ([ef88147](https://github.com/angular/angular/commit/ef88147)), closes [#12593](https://github.com/angular/angular/issues/12593)
* **forms:** getRawValue returns any instead of Object ([#12599](https://github.com/angular/angular/issues/12599)) ([09092ac](https://github.com/angular/angular/commit/09092ac))
* **http:** preserve header case when copying headers ([#12697](https://github.com/angular/angular/issues/12697)) ([121e508](https://github.com/angular/angular/commit/121e508))
* **router:** advance a route only after its children have been deactivated ([#12676](https://github.com/angular/angular/issues/12676)) ([9ddf9b3](https://github.com/angular/angular/commit/9ddf9b3)), closes [#11715](https://github.com/angular/angular/issues/11715)
* **router:** avoid router initialization for non root components ([2a4bf9a](https://github.com/angular/angular/commit/2a4bf9a)), closes [#12338](https://github.com/angular/angular/issues/12338) [#12814](https://github.com/angular/angular/issues/12814)
* **router:** check if windows.console exists before using it ([#12348](https://github.com/angular/angular/issues/12348)) ([7886561](https://github.com/angular/angular/commit/7886561))
* **router:** correctly export concatMap operator in es5 ([#12430](https://github.com/angular/angular/issues/12430)) ([e25baa0](https://github.com/angular/angular/commit/e25baa0))
* **router:** do not require the creation of empty-path routes when no url left ([2c11093](https://github.com/angular/angular/commit/2c11093)), closes [#12133](https://github.com/angular/angular/issues/12133)
* **router:** ignore null or undefined query parameters ([#12333](https://github.com/angular/angular/issues/12333)) ([3052fb2](https://github.com/angular/angular/commit/3052fb2))
* **router:** incorrect injector is used when instantiating components loaded lazily ([#12817](https://github.com/angular/angular/issues/12817)) ([52be848](https://github.com/angular/angular/commit/52be848))
* **router:** resolve guard observables on the first emit ([#10412](https://github.com/angular/angular/issues/10412)) ([2e78b76](https://github.com/angular/angular/commit/2e78b76))
* **router:** Route.isActive also compares query params ([#12321](https://github.com/angular/angular/issues/12321)) ([785b7b6](https://github.com/angular/angular/commit/785b7b6))
* **router:** router should not swallow "unhandled" errors ([e5a753e](https://github.com/angular/angular/commit/e5a753e)), closes [#12802](https://github.com/angular/angular/issues/12802)
* **router:** throw an error when encounter undefined route ([#12389](https://github.com/angular/angular/issues/12389)) ([77dc1ab](https://github.com/angular/angular/commit/77dc1ab))
* **platform-browser:** enableDebugTools should create AngularTools by merging into context.ng ([#12003](https://github.com/angular/angular/issues/12003)) ([b2cf379](https://github.com/angular/angular/commit/b2cf379)), closes [#12002](https://github.com/angular/angular/issues/12002)
* **platform-browser:** provide the ability to register global hammer.js events ([768cddb](https://github.com/angular/angular/commit/768cddb)), closes [#12797](https://github.com/angular/angular/issues/12797)
* **tsc-wrapped:** harden collector against invalid asts ([#12793](https://github.com/angular/angular/issues/12793)) ([69f87ca](https://github.com/angular/angular/commit/69f87ca))



<a name="2.2.0-rc.0"></a>
# [2.2.0-rc.0](https://github.com/angular/angular/compare/2.2.0-beta.1...2.2.0-rc.0) (2016-11-02)


### Bug Fixes

* **compiler:** dedupe NgModule declarations, … ([a178bc6](https://github.com/angular/angular/commit/a178bc6))
* **compiler:** don’t double bind functions ([e391cac](https://github.com/angular/angular/commit/e391cac))
* **compiler:** Don’t throw on empty property bindings ([642c1db](https://github.com/angular/angular/commit/642c1db)), closes [#12583](https://github.com/angular/angular/issues/12583)
* **compiler:** support multiple components in a view container ([6fda972](https://github.com/angular/angular/commit/6fda972))
* **core:** improve error when multiple components match the same element ([e9fd864](https://github.com/angular/angular/commit/e9fd864)), closes [#7067](https://github.com/angular/angular/issues/7067)
* **router:** call data observers when the path changes ([1de04b2](https://github.com/angular/angular/commit/1de04b2))
* **router:** CanDeactivate receives a wrong component ([830a780](https://github.com/angular/angular/commit/830a780)), closes [#12592](https://github.com/angular/angular/issues/12592)
* **router:** rerun resolvers when url changes ([fe47e6b](https://github.com/angular/angular/commit/fe47e6b)), closes [#12603](https://github.com/angular/angular/issues/12603)
* **router:** reset URL to the stable state when a navigation gets canceled ([d509ee0](https://github.com/angular/angular/commit/d509ee0)), closes [#10321](https://github.com/angular/angular/issues/10321)
* **router:** routerLink should not prevent default on non-link elements ([8e221b8](https://github.com/angular/angular/commit/8e221b8))
* **router:** run navigations serially ([091c390](https://github.com/angular/angular/commit/091c390)), closes [#11754](https://github.com/angular/angular/issues/11754)
* **upgrade:** silent bootstrap failures ([fa93fd6](https://github.com/angular/angular/commit/fa93fd6)), closes [#12062](https://github.com/angular/angular/issues/12062)


### Features

* **core:** add the find method to QueryList ([7c16ef9](https://github.com/angular/angular/commit/7c16ef9))



<a name="2.1.2"></a>
# [2.1.2](https://github.com/angular/angular/compare/2.1.1...2.1.2) (2016-10-27)

### Bug Fixes

* **compiler:** don't access view local variables nor pipes in host expressions ([#12396](https://github.com/angular/angular/issues/12396)) ([867494a](https://github.com/angular/angular/commit/867494a)), closes [#12004](https://github.com/angular/angular/issues/12004) [#12071](https://github.com/angular/angular/issues/12071)
* **compiler:** walk third party modules ([#12453](https://github.com/angular/angular/issues/12453)) ([a838aba](https://github.com/angular/angular/commit/a838aba)), closes [#11889](https://github.com/angular/angular/issues/11889) [#12428](https://github.com/angular/angular/issues/12428)
* **compiler:** remove double exports of template_ast ([7742ec0](https://github.com/angular/angular/commit/7742ec0))
* **compiler:** use Maps instead of objects in selector implementation ([d321b0e](https://github.com/angular/angular/commit/d321b0e))
* **compiler-cli:** fix types ([ef15364](https://github.com/angular/angular/commit/ef15364))
* **compiler-cli:** assert that all pipes and directives are declared by a module  ([7221632](https://github.com/angular/angular/commit/7221632))
* **http:** overwrite already set xsrf header ([b4265e0](https://github.com/angular/angular/commit/b4265e0))
* **router:** add a test to make sure canDeactivate guards are called for aux routes ([fc60fa7](https://github.com/angular/angular/commit/fc60fa7)), closes [#11345](https://github.com/angular/angular/issues/11345)
* **router:** canDeactivate guards are not triggered for componentless routes ([b741853](https://github.com/angular/angular/commit/b741853)), closes [#12375](https://github.com/angular/angular/issues/12375)
* **router:** change router not to deactivate aux routes when navigating from a componentless routes ([52a853e](https://github.com/angular/angular/commit/52a853e))
* **router:** disallow component routes with named outlets ([8f2fa0f](https://github.com/angular/angular/commit/8f2fa0f)), closes [#11208](https://github.com/angular/angular/issues/11208) [#11082](https://github.com/angular/angular/issues/11082)
* **router:** preserve resolve data ([6ccbfd4](https://github.com/angular/angular/commit/6ccbfd4)), closes [#12306](https://github.com/angular/angular/issues/12306)



<a name="2.2.0-beta.1"></a>
# [2.2.0-beta.1](https://github.com/angular/angular/compare/2.2.0-beta.0...2.2.0-beta.1) (2016-10-27)

### Code Refactoring

* **upgrade:** re-export the new static upgrade APIs on new entry ([a26dd28](https://github.com/angular/angular/commit/a26dd28))


### Features

* **router:** export routerLinkActive w/ isActive property ([c9f58cf](https://github.com/angular/angular/commit/c9f58cf))


### BREAKING CHANGES (only for beta version users)

* upgrade: Four newly added APIs in 2.2.0-beta:
downgradeComponent, downgradeInjectable, UpgradeComponent, and UpgradeModule are no longer exported by @angular/upgrade.
Import these from @angular/upgrade/static instead.


Note: The 2.2.0-beta.1 release also contains all the changes present in the 2.1.2 release.



# [2.1.1](https://github.com/angular/angular/compare/2.1.0...2.1.1) (2016-10-20)

### Bug Fixes

* **compiler:** generate aot code for animation trigger output events ([#12291](https://github.com/angular/angular/issues/12291)) ([6e5f8b5](https://github.com/angular/angular/commit/6e5f8b5)), closes [#11707](https://github.com/angular/angular/issues/11707)
* **compiler:** don't redeclare a var in the same scope ([#12386](https://github.com/angular/angular/issues/12386)) ([cca4a5c](https://github.com/angular/angular/commit/cca4a5c))
* **core:** fix decorator default values ([bd1dcb5](https://github.com/angular/angular/commit/bd1dcb5))
* **core:** fix property decorators ([3993279](https://github.com/angular/angular/commit/3993279)), closes [#12224](https://github.com/angular/angular/issues/12224)
* **http:** make normalizeMethodName optimizer-compatible. ([#12370](https://github.com/angular/angular/issues/12370)) ([8409b65](https://github.com/angular/angular/commit/8409b65))
* **router:** correctly export filter operator in es5 ([#12286](https://github.com/angular/angular/issues/12286)) ([27d7677](https://github.com/angular/angular/commit/27d7677))
* **router:** do not update primary route if only secondary outlet is given ([#11797](https://github.com/angular/angular/issues/11797)) ([da5fc69](https://github.com/angular/angular/commit/da5fc69))
* **router:** fix lazy loading triggered by redirects from wildcard routes ([5ae6915](https://github.com/angular/angular/commit/5ae6915)), closes [#12183](https://github.com/angular/angular/issues/12183)
* **router:** module loader should start compiling modules when stubbedModules are set ([#11742](https://github.com/angular/angular/issues/11742)) ([b44b6ef](https://github.com/angular/angular/commit/b44b6ef))


### Performance Improvements

* **common:** optimize NgSwitch default case ([fdf4309](https://github.com/angular/angular/commit/fdf4309))



<a name="2.2.0-beta.0"></a>
# [2.2.0-beta.0](https://github.com/angular/angular/compare/2.1.0...2.2.0-beta.0) (2016-10-20)

### Features

* **common:** support narrow forms for month and weekdays in DatePipe ([#12297](https://github.com/angular/angular/issues/12297)) ([f77ab6a](https://github.com/angular/angular/commit/f77ab6a)), closes [#12294](https://github.com/angular/angular/issues/12294)
* **forms:** add hasError and getError to AbstractControlDirective ([#11985](https://github.com/angular/angular/issues/11985)) ([592f40a](https://github.com/angular/angular/commit/592f40a)), closes [#7255](https://github.com/angular/angular/issues/7255)
* **forms:** add ng-pending CSS class during async validation ([#11243](https://github.com/angular/angular/issues/11243)) ([97bc971](https://github.com/angular/angular/commit/97bc971)), closes [#10336](https://github.com/angular/angular/issues/10336)
* **forms:** Added emitEvent to AbstractControl methods ([#11949](https://github.com/angular/angular/issues/11949)) ([b9fc090](https://github.com/angular/angular/commit/b9fc090))
* **forms:** make 'parent' a public property of 'AbstractControl' ([#11855](https://github.com/angular/angular/issues/11855)) ([445e592](https://github.com/angular/angular/commit/445e592))
* **forms:** Validator.pattern accepts a RegExp ([#12323](https://github.com/angular/angular/issues/12323)) ([bf60418](https://github.com/angular/angular/commit/bf60418))
* **upgrade:** add support for AoT compiled upgrade applications ([d6791ff](https://github.com/angular/angular/commit/d6791ff)), closes [#12239](https://github.com/angular/angular/issues/12239)
* **router:** add support for ng1/ng2 migration ([#12160](https://github.com/angular/angular/issues/12160)) ([8b9ab44](https://github.com/angular/angular/commit/8b9ab44))

Note: The 2.2.0-beta.0 release also contains all the changes present in the 2.1.1 release.



<a name="2.1.0"></a>
# [2.1.0 incremental-metamorphosis](https://github.com/angular/angular/compare/2.1.0-rc.0...2.1.0) (2016-10-12)


### Bug Fixes

* **compiler:** allow whitespace as `<ng-content>` content ([#12225](https://github.com/angular/angular/issues/12225)) ([df1718d](https://github.com/angular/angular/commit/df1718d))
* **compiler:** interpolation expressions report the correct offset ([#12125](https://github.com/angular/angular/issues/12125)) ([d641c36](https://github.com/angular/angular/commit/d641c36))
* **compiler:** properly shim `:host:before` and `:host(:before)` ([#12171](https://github.com/angular/angular/issues/12171)) ([aa92512](https://github.com/angular/angular/commit/aa92512)), closes [#12165](https://github.com/angular/angular/issues/12165)
* **compiler:** validate `@HostBinding` name ([#12139](https://github.com/angular/angular/issues/12139)) ([13ecc14](https://github.com/angular/angular/commit/13ecc14))
* **compiler-cli:** don't clone static symbols when simplifying annotation metadata ([#12158](https://github.com/angular/angular/issues/12158)) ([8c477b2](https://github.com/angular/angular/commit/8c477b2))
* **compiler-cli:** remove peerDependency on [@angular](https://github.com/angular)/platform-server ([#12122](https://github.com/angular/angular/issues/12122)) ([71b7654](https://github.com/angular/angular/commit/71b7654))
* **compiler-cli:** remove unused parse5 dependency from package.json ([eaaec69](https://github.com/angular/angular/commit/eaaec69))
* **forms:** allow optional fields with pattern and minlength validators ([#12147](https://github.com/angular/angular/issues/12147)) ([d22eeb7](https://github.com/angular/angular/commit/d22eeb7))
* **forms:** properly validate blank strings with minlength ([#12091](https://github.com/angular/angular/issues/12091)) ([f50c1da](https://github.com/angular/angular/commit/f50c1da))
* **http:** fix Headers initialization from Headers and Object ([#12106](https://github.com/angular/angular/issues/12106)) ([f4566f8](https://github.com/angular/angular/commit/f4566f8))
* **http:** Headers.append should append to the list ([a67c067](https://github.com/angular/angular/commit/a67c067))
* **platform-browser-dynamic:** mark platformBrowserDynamic as stable API ([#12154](https://github.com/angular/angular/issues/12154)) ([bcef5ef](https://github.com/angular/angular/commit/bcef5ef))
* **router:** improve error message ([#12102](https://github.com/angular/angular/issues/12102)) ([e06303a](https://github.com/angular/angular/commit/e06303a))
* **router:** parent resolve should complete before merging resolved data ([1681e4f](https://github.com/angular/angular/commit/1681e4f)), closes [#12032](https://github.com/angular/angular/issues/12032)
* **router:** wildcards routes should support lazy loading ([40b92dd](https://github.com/angular/angular/commit/40b92dd)), closes [#12024](https://github.com/angular/angular/issues/12024)
* **upgrade:** allow compilerOptions in bootstrap ([#10575](https://github.com/angular/angular/issues/10575)) ([5effc33](https://github.com/angular/angular/commit/5effc33))



<a name="2.1.0-rc.0"></a>
# [2.1.0-rc.0](https://github.com/angular/angular/compare/2.1.0-beta.0...2.1.0-rc.0) (2016-10-05)

### Features

* **animations:** provide aliases for `:enter` and `:leave` transitions ([#11991](https://github.com/angular/angular/issues/11991)) ([e884f48](https://github.com/angular/angular/commit/e884f48))

Note: 2.1.0-rc.0 release also contains all the changes present in the 2.0.2 release.



<a name="2.1.0-beta.0"></a>
# [2.1.0-beta.0](https://github.com/angular/angular/compare/2.0.0...2.1.0-beta.0) (2016-09-23)

### Features

* **router:** add router preloader to optimistically preload routes ([5a84982](https://github.com/angular/angular/commit/5a84982))


### Bug Fixes
* **router:** update the router not to reset router state when updating root component ([#11799](https://github.com/angular/angular/issues/11799)) ([31dce72](https://github.com/angular/angular/commit/31dce72))

Note: 2.1.0-beta.0 release also contains all the changes present in the 2.0.1 release.



<a name="2.0.2"></a>
## [2.0.2](https://github.com/angular/angular/compare/2.0.1...2.0.2) (2016-10-05)


### Bug Fixes

* **common:** correctly removes styles on IE ([#11953](https://github.com/angular/angular/pull/11953)), closes [#7916](https://github.com/angular/angular/issues/7916)
* **compiler:** do not embed templateUrl in view factories in non-debug mode. ([#11818](https://github.com/angular/angular/issues/11818)) ([51e1994](https://github.com/angular/angular/commit/51e1994)), closes [#11117](https://github.com/angular/angular/issues/11117)
* **compiler:** move detection of unsafe properties for binding to ElementSchemaRegistry ([#11378](https://github.com/angular/angular/issues/11378)) ([5911c3b](https://github.com/angular/angular/commit/5911c3b))
* **compiler:** fix `:host(tag)` and `:host-context(tag)` ([a6bb84e0](https://github.com/angular/angular/commit/a6bb84e02b7579f8d957ef6ba5b10d83482ed756)), closes [#11972](https://github.com/angular/angular/issues/11972)
* **compiler:** fix attribute selectors in :host and :host-context ([#12056](https://github.com/angular/angular/issues/12056)) ([6f7ed32](https://github.com/angular/angular/commit/6f7ed32)), closes [#11917](https://github.com/angular/angular/issues/11917)
* **compiler:** support `@page` and `@document` CSS rules ([#11878](https://github.com/angular/angular/issues/11878)) ([c99ef49](https://github.com/angular/angular/commit/c99ef49)), closes [#11860](https://github.com/angular/angular/issues/11860)
* **compiler:** support `[attr="value with space"]` ([bd012ef](https://github.com/angular/angular/commit/bd012ef)), closes [#6249](https://github.com/angular/angular/issues/6249)
* **compiler:** support quoted attribute values ([7395400](https://github.com/angular/angular/commit/7395400)), closes [#6085](https://github.com/angular/angular/issues/6085)
* **compiler:** fix `<x>` ctype names ([7578d85](https://github.com/angular/angular/commit/7578d85)), closes [#12000](https://github.com/angular/angular/issues/12000)
* **compiler-cli:** allow ReflectorHost passed as argument to CodeGenerator#create ([#11951](https://github.com/angular/angular/issues/11951)) ([826c98e](https://github.com/angular/angular/commit/826c98e))
* **forms:** properly validate empty strings with patterns ([#11450](https://github.com/angular/angular/issues/11450)) ([e00de0c](https://github.com/angular/angular/commit/e00de0c))
* **http:** preserve case of the first init, `set()` or `append()` ([#12023](https://github.com/angular/angular/issues/12023)) ([adb17fe](https://github.com/angular/angular/commit/adb17fe)), closes [#11624](https://github.com/angular/angular/issues/11624)
* **http:** remove url params if provided value is null or undefined ([#11990](https://github.com/angular/angular/issues/11990)) ([9cc0a4e](https://github.com/angular/angular/commit/9cc0a4e))
* **router:** do not reset the router state when updating the component ([#11867](https://github.com/angular/angular/issues/11867)) ([cf750e1](https://github.com/angular/angular/commit/cf750e1))
* **upgrade:** bind optional properties when upgrading from ng1 ([#11411](https://github.com/angular/angular/issues/11411)) ([0851238](https://github.com/angular/angular/commit/0851238)), closes [#10181](https://github.com/angular/angular/issues/10181)


<a name="2.0.1"></a>
## [2.0.1](https://github.com/angular/angular/compare/2.0.0...2.0.1) (2016-09-23)


### Bug Fixes

* **common:** fix ngOnChanges signature of NgTemplateOutlet directive ([14ee759](https://github.com/angular/angular/commit/14ee759))
* **compiler:** `[attribute~=value]` selector ([#11696](https://github.com/angular/angular/issues/11696)) ([734b8b8](https://github.com/angular/angular/commit/734b8b8)), closes [#9644](https://github.com/angular/angular/issues/9644)
* **compiler:** safe property access expressions work in event bindings ([#11724](https://github.com/angular/angular/issues/11724)) ([a95d652](https://github.com/angular/angular/commit/a95d652))
* **compiler:** throw when Component.moduleId is not a string ([bd4045b](https://github.com/angular/angular/commit/bd4045b)), closes [#11590](https://github.com/angular/angular/issues/11590)
* **compiler:** do not provide I18N values when they're not specified ([03aedbe](https://github.com/angular/angular/commit/03aedbe)), closes [#11643](https://github.com/angular/angular/issues/11643)
* **core:** ContentChild descendants should be queried by default ([0dc15eb](https://github.com/angular/angular/commit/0dc15eb)), closes [#11645](https://github.com/angular/angular/issues/11645)
* **forms:** disable all radios with disable() ([2860418](https://github.com/angular/angular/commit/2860418))
* **forms:** make setDisabledState optional for reactive form directives ([#11731](https://github.com/angular/angular/issues/11731)) ([51d73d3](https://github.com/angular/angular/commit/51d73d3)), closes [#11719](https://github.com/angular/angular/issues/11719)
* **forms:** support unbound disabled in ngModel ([#11736](https://github.com/angular/angular/issues/11736)) ([39e251e](https://github.com/angular/angular/commit/39e251e))
* **upgrade:** allow attribute selectors for components in ng2 which are not part of upgrade ([#11808](https://github.com/angular/angular/issues/11808)) ([b81e2e7](https://github.com/angular/angular/commit/b81e2e7)), closes [#11280](https://github.com/angular/angular/issues/11280)



<a name="2.0.0"></a>
# [2.0.0 proprioception-reinforcement](https://github.com/angular/angular/compare/2.0.0-rc.7...2.0.0) (2016-09-14)
