<a name="0.10.2"></a>
## [0.10.2](https://github.com/angular/angular/compare/zone.js-0.10.1...zone.js-0.10.2) (2019-08-13)


### Features

* **zone.js:** support Promise.allSettled ([#31849](https://github.com/angular/angular/issues/31849)) ([96cbcd6](https://github.com/angular/angular/commit/96cbcd6))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/angular/angular/compare/zone.js-0.10.0...zone.js-0.10.1) (2019-08-02)


### Bug Fixes

* **zone.js:** don't rely on global node typings outside of node/ directory ([#31783](https://github.com/angular/angular/issues/31783)) ([5c9a896](https://github.com/angular/angular/commit/5c9a896))
* **zone.js:** should expose some other internal intefaces ([#31866](https://github.com/angular/angular/issues/31866)) ([f5c605b](https://github.com/angular/angular/commit/f5c605b))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/angular/angular/compare/7b3bcc2...174770e) (2019-07-26)


### Bug Fixes

* **zone.js:** __load_patch and __symbol__ should be in zone_extern for closure compiler ([#31350](https://github.com/angular/angular/issues/31350)) ([6b51ed2](https://github.com/angular/angular/commit/6b51ed2))
* **zone.js:** don't fire unhandledrejection if Zone handled error ([#31718](https://github.com/angular/angular/issues/31718)) ([c7542a1](https://github.com/angular/angular/commit/c7542a1)), closes [#31701](https://github.com/angular/angular/issues/31701)
* **zone.js:** don't wrap uncaught promise error. ([#31443](https://github.com/angular/angular/issues/31443)) ([2bb9a65](https://github.com/angular/angular/commit/2bb9a65)), closes [#27840](https://github.com/angular/angular/issues/27840)
* **zone.js:** fix zone for Jasmine 3.3. ([#31497](https://github.com/angular/angular/issues/31497)) ([c4c340a](https://github.com/angular/angular/commit/c4c340a))
* **zone.js:** handle MSPointer event correctly ([#31722](https://github.com/angular/angular/issues/31722)) ([2c402d5](https://github.com/angular/angular/commit/2c402d5)), closes [#31699](https://github.com/angular/angular/issues/31699)
* **zone.js:** handle new api of electron 4 ([#31669](https://github.com/angular/angular/issues/31669)) ([a445826](https://github.com/angular/angular/commit/a445826)), closes [#31668](https://github.com/angular/angular/issues/31668)
* **zone.js:** hook should set correct current zone ([#31642](https://github.com/angular/angular/issues/31642)) ([17b32b5](https://github.com/angular/angular/commit/17b32b5)), closes [#31641](https://github.com/angular/angular/issues/31641)
* **zone.js:** move property patch to legacy ([#31660](https://github.com/angular/angular/issues/31660)) ([716af10](https://github.com/angular/angular/commit/716af10)), closes [#31659](https://github.com/angular/angular/issues/31659)
* **zone.js:** patch shadydom ([#31717](https://github.com/angular/angular/issues/31717)) ([35a025f](https://github.com/angular/angular/commit/35a025f)), closes [#31686](https://github.com/angular/angular/issues/31686)
* **zone.js:** restore definition of global ([#31453](https://github.com/angular/angular/issues/31453)) ([e6f1b04](https://github.com/angular/angular/commit/e6f1b04)), closes [/github.com/angular/zone.js/commit/71b93711806000d7788e79451478e20d6086aa8a#diff-dd469785fca8680a5b33b1e81c5cfd91R1420](https://github.com//github.com/angular/zone.js/commit/71b93711806000d7788e79451478e20d6086aa8a/issues/diff-dd469785fca8680a5b33b1e81c5cfd91R1420)
* **zone.js:** should remove on symbol property after removeAllListeners ([#31644](https://github.com/angular/angular/issues/31644)) ([a182714](https://github.com/angular/angular/commit/a182714)), closes [#31643](https://github.com/angular/angular/issues/31643)
* **zone.js:** update dart zone link ([#31646](https://github.com/angular/angular/issues/31646)) ([7f7033b](https://github.com/angular/angular/commit/7f7033b)), closes [#31645](https://github.com/angular/angular/issues/31645)
* **zone.js:** zone-mix should import correct browser module ([#31628](https://github.com/angular/angular/issues/31628)) ([87ce4e9](https://github.com/angular/angular/commit/87ce4e9)), closes [#31626](https://github.com/angular/angular/issues/31626)

<a name="0.9.1"></a>
## [0.9.1](https://github.com/angular/zone.js/compare/v0.9.0...0.9.1) (2019-04-30)


### Bug Fixes

* ensure that EventTarget is patched prior to legacy property descriptor patch ([#1214](https://github.com/angular/zone.js/issues/1214)) ([aca4728](https://github.com/angular/zone.js/commit/aca4728))
* fakeAsyncTest requestAnimationFrame should pass timestamp as parameter ([#1220](https://github.com/angular/zone.js/issues/1220)) ([62b8525](https://github.com/angular/zone.js/commit/62b8525)), closes [#1216](https://github.com/angular/zone.js/issues/1216)


### Features

* add option to disable jasmine clock patch, also rename the flag of auto jump in FakeAsyncTest ([#1222](https://github.com/angular/zone.js/issues/1222)) ([10e1b0c](https://github.com/angular/zone.js/commit/10e1b0c))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/angular/zone.js/compare/v0.8.29...0.9.0) (2019-03-12)


### Bug Fixes

* **lint:** fix [#1168](https://github.com/angular/zone.js/issues/1168), remove unused = null code ([#1171](https://github.com/angular/zone.js/issues/1171)) ([917e2af](https://github.com/angular/zone.js/commit/917e2af))
* **test:** fix [#1155](https://github.com/angular/zone.js/issues/1155), try/catch modify error.message ([#1157](https://github.com/angular/zone.js/issues/1157)) ([7e983d1](https://github.com/angular/zone.js/commit/7e983d1))
* **test:** fix: make fakeAsync test spec timer id global ([d32e79b](https://github.com/angular/zone.js/commit/d32e79b))
* **build:** fix: closure related fixes ([2a8415d](https://github.com/angular/zone.js/commit/2a8415d))
* **compile:** fix: remove finally definition from Promise interface ([47dd3f4](https://github.com/angular/zone.js/commit/47dd3f4))

### Doc

* **doc:** [#1181](https://github.com/angular/zone.js/pull/1181), Fix the typo in timer module documentation ([8f78b55](https://github.com/angular/zone.js/commit/8f78b55))
* **doc:** [#1163](https://github.com/angular/zone.js/pull/1163), Update YouTube video link ([f171821](https://github.com/angular/zone.js/commit/f171821))
* **doc:** [#1151](https://github.com/angular/zone.js/pull/1151), Re-phrase the lines for better understanding ([2a6444b](https://github.com/angular/zone.js/commit/2a6444b))
* **doc:** [#1152](https://github.com/angular/zone.js/pull/1152), change the word TimerTask to MacroTask ([f3995de](https://github.com/angular/zone.js/commit/f3995de))


### Features

* **test:** add benchmark page ([#1076](https://github.com/angular/zone.js/issues/1076)) ([128649a](https://github.com/angular/zone.js/commit/128649a))
* **test:** test(promise): add test cases for Promise.all with sync then operation ([#1158](https://github.com/angular/zone.js/issues/1158)) ([0b44e83](https://github.com/angular/zone.js/commit/0b44e83))
* **test:** feat: add an option __zone_symbol__disableDatePatching to allow disabling Date patching ([c378f87](https://github.com/angular/zone.js/commit/c378f87))

### Env

* **env:** change BLACK_LISTED_EVENTS to DISABLE_EVENTS ([9c65d25](https://github.com/angular/zone.js/commit/9c65d25))

### Build

* **build:** build zone-evergreen.js in es2015, add terser minify support ([2ad936b](https://github.com/angular/zone.js/commit/2ad936b))
* **build:** upgrade to pass jasmine 3.3 test ([82dfd75](https://github.com/angular/zone.js/commit/82dfd75))
* **build:** upgrade to typescript 3.2.2 ([fcdd559](https://github.com/angular/zone.js/commit/fcdd559))
* **build:** separate zone.js into evergreen only and legacy included bundles ([ac3851e](https://github.com/angular/zone.js/commit/ac3851e))
* **build:** make legacy standalone bundle ([a5fe09b](https://github.com/angular/zone.js/commit/a5fe09b))

<a name="0.8.29"></a>
## [0.8.29](https://github.com/angular/zone.js/compare/v0.8.28...0.8.29) (2019-01-22)


### Bug Fixes

* **core:** fix for tests in angular repo ([fd069db](https://github.com/angular/zone.js/commit/fd069db))


<a name="0.8.28"></a>
## [0.8.28](https://github.com/angular/zone.js/compare/v0.8.27...0.8.28) (2019-01-16)


### Bug Fixes

* **jasmine:** patch jasmine beforeAll/afterAll ([9d27abc4](https://github.com/angular/zone.js/commit/9d27abc4))


<a name="0.8.27"></a>
## [0.8.27](https://github.com/angular/zone.js/compare/v0.8.26...0.8.27) (2019-01-08)


### Bug Fixes

* **bluebird:** fix [#1112](https://github.com/angular/zone.js/issues/1112), bluebird chained callback should return a Bluebird Promise ([#1114](https://github.com/angular/zone.js/issues/1114)) ([6ba3169](https://github.com/angular/zone.js/commit/6ba3169))
* **core:** fix [#1108](https://github.com/angular/zone.js/issues/1108), window.onerror should have (message, source, lineno, colno, error) signiture ([#1109](https://github.com/angular/zone.js/issues/1109)) ([49e0548](https://github.com/angular/zone.js/commit/49e0548))
* **core:** fix [#1153](https://github.com/angular/zone.js/issues/1153), ZoneTask.toString should always be a string ([#1166](https://github.com/angular/zone.js/issues/1166)) ([afa1363](https://github.com/angular/zone.js/commit/afa1363))
* **core:** fix interval will still run after cancelled error ([#1156](https://github.com/angular/zone.js/issues/1156)) ([eb72ff4](https://github.com/angular/zone.js/commit/eb72ff4))
* **core:** use then directly when promise is not patchable ([#1079](https://github.com/angular/zone.js/issues/1079)) ([d7e0a31](https://github.com/angular/zone.js/commit/d7e0a31))
* **duplicate:** fix [#1081](https://github.com/angular/zone.js/issues/1081), load patch should also check the duplicate flag ([#1121](https://github.com/angular/zone.js/issues/1121)) ([8ce5e33](https://github.com/angular/zone.js/commit/8ce5e33))
* **event:** fix [#1110](https://github.com/angular/zone.js/issues/1110), nodejs EventEmitter should support Symbol eventName ([#1113](https://github.com/angular/zone.js/issues/1113)) ([96420d6](https://github.com/angular/zone.js/commit/96420d6))
* **event:** should pass boolean to addEventListener if not support passive ([#1053](https://github.com/angular/zone.js/issues/1053)) ([e9536ec](https://github.com/angular/zone.js/commit/e9536ec))
* **format:** update clang-format to 1.2.3 ([f238908](https://github.com/angular/zone.js/commit/f238908))
* **memory:** Add protection against excessive on prop patching ([#1106](https://github.com/angular/zone.js/issues/1106)) ([875086f](https://github.com/angular/zone.js/commit/875086f))
* **node:** fix [#1164](https://github.com/angular/zone.js/issues/1164), don't patch uncaughtException to prevent endless loop ([#1170](https://github.com/angular/zone.js/issues/1170)) ([33a0ad6](https://github.com/angular/zone.js/commit/33a0ad6))
* **node:** node patched method should copy original delegate's symbol properties ([#1095](https://github.com/angular/zone.js/issues/1095)) ([0a2f6ff](https://github.com/angular/zone.js/commit/0a2f6ff))
* **onProperty:** user quoted access for __Zone_ignore_on_properties ([#1134](https://github.com/angular/zone.js/issues/1134)) ([7201d44](https://github.com/angular/zone.js/commit/7201d44))
* **test:** karma-dist should test bundle under dist ([#1049](https://github.com/angular/zone.js/issues/1049)) ([0720d79](https://github.com/angular/zone.js/commit/0720d79))
* **tsc:** tsconfig.json strict:true ([915042d](https://github.com/angular/zone.js/commit/915042d))
* **xhr:** fix [#1072](https://github.com/angular/zone.js/issues/1072), should set scheduled flag to target ([#1074](https://github.com/angular/zone.js/issues/1074)) ([34c12e5](https://github.com/angular/zone.js/commit/34c12e5))
* **xhr:** should invoke xhr task after onload is triggered ([#1055](https://github.com/angular/zone.js/issues/1055)) ([2aab9c8](https://github.com/angular/zone.js/commit/2aab9c8))


### Features

* **build:** Upgrade to TypeScript 2.9 and rxjs6 ([#1122](https://github.com/angular/zone.js/issues/1122)) ([31fc127](https://github.com/angular/zone.js/commit/31fc127))
* **core:** upgrade to typescript 3.0.3 ([#1132](https://github.com/angular/zone.js/issues/1132)) ([60adc9c](https://github.com/angular/zone.js/commit/60adc9c))
* **Core:** fix [#910](https://github.com/angular/zone.js/issues/910), add a flag to allow user to ignore duplicate Zone error ([#1093](https://github.com/angular/zone.js/issues/1093)) ([a86c6d5](https://github.com/angular/zone.js/commit/a86c6d5))
* **custom-element:** patch customElement v1 APIs ([#1133](https://github.com/angular/zone.js/issues/1133)) ([427705f](https://github.com/angular/zone.js/commit/427705f))
* **error:** fix [#975](https://github.com/angular/zone.js/issues/975), can config how to load blacklist zone stack frames ([#1045](https://github.com/angular/zone.js/issues/1045)) ([ff3d545](https://github.com/angular/zone.js/commit/ff3d545))
* **fetch:** schedule macroTask when fetch ([#1075](https://github.com/angular/zone.js/issues/1075)) ([bf88c34](https://github.com/angular/zone.js/commit/bf88c34))



<a name="0.8.26"></a>
## [0.8.26](https://github.com/angular/zone.js/compare/v0.8.25...0.8.26) (2018-04-08)


### Bug Fixes

* **test:** fix [#1069](https://github.com/angular/zone.js/issues/1069), FakeDate should handle constructor parameter ([#1070](https://github.com/angular/zone.js/issues/1070)) ([b3fdd7e](https://github.com/angular/zone.js/commit/b3fdd7e))



<a name="0.8.25"></a>
## [0.8.25](https://github.com/angular/zone.js/compare/v0.8.24...0.8.25) (2018-04-04)


### Bug Fixes

* **test:** add async/fakeAsync into zone-testing bundle ([#1068](https://github.com/angular/zone.js/issues/1068)) ([3bdfdad](https://github.com/angular/zone.js/commit/3bdfdad))



<a name="0.8.24"></a>
## [0.8.24](https://github.com/angular/zone.js/compare/v0.8.23...0.8.24) (2018-04-02)


### Bug Fixes

* **test:** add flag to patch jasmine.clock, move fakeAsync/async into original bundle ([#1067](https://github.com/angular/zone.js/issues/1067)) ([389762c](https://github.com/angular/zone.js/commit/389762c))



<a name="0.8.24"></a>
## [0.8.24](https://github.com/angular/zone.js/compare/v0.8.23...0.8.24) (2018-04-02)


### Bug Fixes

* **test:** add flag to patch jasmine.clock, move fakeAsync/async into original bundle ([#1067](https://github.com/angular/zone.js/issues/1067)) ([389762c](https://github.com/angular/zone.js/commit/389762c))



<a name="0.8.23"></a>
## [0.8.23](https://github.com/angular/zone.js/compare/v0.8.22...0.8.23) (2018-04-01)


### Bug Fixes

* **test:** check setImmediate supports ([6c7e45b](https://github.com/angular/zone.js/commit/6c7e45b))



<a name="0.8.22"></a>
## [0.8.22](https://github.com/angular/zone.js/compare/v0.8.21...0.8.22) (2018-03-31)


### Bug Fixes

* **fakeAsync:** fix [#1050](https://github.com/angular/zone.js/issues/1050), should only reset patched Date.now until fakeAsync exit  ([#1051](https://github.com/angular/zone.js/issues/1051)) ([e15d735](https://github.com/angular/zone.js/commit/e15d735))
* **fakeAsyncTest:** fix [#1061](https://github.com/angular/zone.js/issues/1061), fakeAsync should support setImmediate ([#1062](https://github.com/angular/zone.js/issues/1062)) ([66c6f97](https://github.com/angular/zone.js/commit/66c6f97))



<a name="0.8.21"></a>
## [0.8.21](https://github.com/angular/zone.js/compare/v0.8.20...0.8.21) (2018-03-30)


### Bug Fixes

* add OriginalDelegate prop to Function::toString ([#993](https://github.com/angular/zone.js/issues/993)) ([2dc7e5c](https://github.com/angular/zone.js/commit/2dc7e5c))
* **core:** fix [#1000](https://github.com/angular/zone.js/issues/1000), check target is null or not when patchOnProperty ([#1004](https://github.com/angular/zone.js/issues/1004)) ([5c139e5](https://github.com/angular/zone.js/commit/5c139e5))
* **core:** fix [#946](https://github.com/angular/zone.js/issues/946), don't patch promise if it is not writable ([#1041](https://github.com/angular/zone.js/issues/1041)) ([c8c5990](https://github.com/angular/zone.js/commit/c8c5990))
* **event:** fix [#1021](https://github.com/angular/zone.js/issues/1021), removeListener/removeAllListeners should return eventEmitter ([#1022](https://github.com/angular/zone.js/issues/1022)) ([ab72df6](https://github.com/angular/zone.js/commit/ab72df6))
* **fakeAsync:** fix [#1056](https://github.com/angular/zone.js/issues/1056), fakeAsync timerId should not be zero ([#1057](https://github.com/angular/zone.js/issues/1057)) ([68682cd](https://github.com/angular/zone.js/commit/68682cd))
* **jasmine:** fix [#1015](https://github.com/angular/zone.js/issues/1015), make jasmine patch compatible to jasmine 3.x ([#1016](https://github.com/angular/zone.js/issues/1016)) ([e1df4bc](https://github.com/angular/zone.js/commit/e1df4bc))
* **patch:** fix [#998](https://github.com/angular/zone.js/issues/998), patch mediaQuery for new Safari ([#1003](https://github.com/angular/zone.js/issues/1003)) ([c7c7db5](https://github.com/angular/zone.js/commit/c7c7db5))
* **proxy:** proxyZone should call onHasTask when change delegate ([#1030](https://github.com/angular/zone.js/issues/1030)) ([40b110d](https://github.com/angular/zone.js/commit/40b110d))
* **test:** fix mocha compatible issue ([#1028](https://github.com/angular/zone.js/issues/1028)) ([c554e9f](https://github.com/angular/zone.js/commit/c554e9f))
* **testing:** fix [#1032](https://github.com/angular/zone.js/issues/1032), fakeAsync should pass parameters correctly ([#1033](https://github.com/angular/zone.js/issues/1033)) ([eefe983](https://github.com/angular/zone.js/commit/eefe983))


### Features

* **bluebird:** fix [#921](https://github.com/angular/zone.js/issues/921), [#977](https://github.com/angular/zone.js/issues/977), support bluebird ([#1039](https://github.com/angular/zone.js/issues/1039)) ([438210c](https://github.com/angular/zone.js/commit/438210c))
* **build:** use yarn instead of npm ([#1025](https://github.com/angular/zone.js/issues/1025)) ([ebd348c](https://github.com/angular/zone.js/commit/ebd348c))
* **core:** fix [#996](https://github.com/angular/zone.js/issues/996), expose UncaughtPromiseError ([#1040](https://github.com/angular/zone.js/issues/1040)) ([7f178b1](https://github.com/angular/zone.js/commit/7f178b1))
* **jasmine:** support Date.now in fakeAsyncTest ([#1009](https://github.com/angular/zone.js/issues/1009)) ([f22065e](https://github.com/angular/zone.js/commit/f22065e))
* **jsonp:** provide a help method to patch jsonp ([#997](https://github.com/angular/zone.js/issues/997)) ([008fd43](https://github.com/angular/zone.js/commit/008fd43))
* **patch:** fix [#1011](https://github.com/angular/zone.js/issues/1011), patch ResizeObserver ([#1012](https://github.com/angular/zone.js/issues/1012)) ([8ee88da](https://github.com/angular/zone.js/commit/8ee88da))
* **patch:** fix [#828](https://github.com/angular/zone.js/issues/828), patch socket.io client ([b3db9f4](https://github.com/angular/zone.js/commit/b3db9f4))
* **promise:** support Promise.prototype.finally ([#1005](https://github.com/angular/zone.js/issues/1005)) ([6a1a830](https://github.com/angular/zone.js/commit/6a1a830))
* **rollup:** use new rollup config to prevent warning ([#1006](https://github.com/angular/zone.js/issues/1006)) ([6b6b38a](https://github.com/angular/zone.js/commit/6b6b38a))
* **test:** can handle non zone aware task in promise ([#1014](https://github.com/angular/zone.js/issues/1014)) ([6852f1d](https://github.com/angular/zone.js/commit/6852f1d))
* **test:** move async/fakeAsync from angular to zone.js ([#1048](https://github.com/angular/zone.js/issues/1048)) ([a4b42cd](https://github.com/angular/zone.js/commit/a4b42cd))
* **testing:** can display pending tasks info when test timeout in jasmine/mocha ([#1038](https://github.com/angular/zone.js/issues/1038)) ([57bc80c](https://github.com/angular/zone.js/commit/57bc80c))



<a name="0.8.20"></a>
## [0.8.20](https://github.com/angular/zone.js/compare/v0.8.19...0.8.20) (2018-01-10)


### Bug Fixes

* **core:** add comment for shorter var/function name ([67e8178](https://github.com/angular/zone.js/commit/67e8178))
* **core:** add file check script in travis build ([615a6c1](https://github.com/angular/zone.js/commit/615a6c1))
* **core:** add helper method in util.ts to shorter zone.wrap/scehduleMacroTask ([8293c37](https://github.com/angular/zone.js/commit/8293c37))
* **core:** add rxjs test ([31832a7](https://github.com/angular/zone.js/commit/31832a7))
* **core:** fix [#989](https://github.com/angular/zone.js/issues/989), remove unuse code, use shorter name to reduce bundle size ([73b0061](https://github.com/angular/zone.js/commit/73b0061))
* **core:** fix shorter name closure conflict ([00a4e31](https://github.com/angular/zone.js/commit/00a4e31))
* **core:** remove unreadable short names ([957351e](https://github.com/angular/zone.js/commit/957351e))



<a name="0.8.18"></a>
## [0.8.18](https://github.com/angular/zone.js/compare/v0.8.17...0.8.18) (2017-09-27)


### Bug Fixes

* **event:** EventTarget of SourceBuffer in samsung tv will have null context ([#904](https://github.com/angular/zone.js/issues/904)) ([8718e07](https://github.com/angular/zone.js/commit/8718e07))
* **event:** fix [#883](https://github.com/angular/zone.js/issues/883), fix RTCPeerConnection Safari event not triggered issue ([#905](https://github.com/angular/zone.js/issues/905)) ([6f74efb](https://github.com/angular/zone.js/commit/6f74efb))
* **event:** fix [#911](https://github.com/angular/zone.js/issues/911), in IE, event handler event maybe undefined ([#913](https://github.com/angular/zone.js/issues/913)) ([4ba5d97](https://github.com/angular/zone.js/commit/4ba5d97))
* **event:** should handle event.stopImmediatePropagration ([#903](https://github.com/angular/zone.js/issues/903)) ([dcc285a](https://github.com/angular/zone.js/commit/dcc285a))
* **patch:** patchOnProperty getter should return original listener ([#887](https://github.com/angular/zone.js/issues/887)) ([d4e5ae8](https://github.com/angular/zone.js/commit/d4e5ae8))
* **patch:** Worker should patch onProperties ([#915](https://github.com/angular/zone.js/issues/915)) ([418a583](https://github.com/angular/zone.js/commit/418a583))
* **promise:** can set native promise after loading zone.js ([#899](https://github.com/angular/zone.js/issues/899)) ([956c729](https://github.com/angular/zone.js/commit/956c729))
* **timer:** fix [#314](https://github.com/angular/zone.js/issues/314), setTimeout/interval should return original timerId ([#894](https://github.com/angular/zone.js/issues/894)) ([aec4bd4](https://github.com/angular/zone.js/commit/aec4bd4))


### Features

* **compile:** fix [#892](https://github.com/angular/zone.js/issues/892), upgrade to typescript 2.3.4, support for...of when build zone-node ([#897](https://github.com/angular/zone.js/issues/897)) ([e999593](https://github.com/angular/zone.js/commit/e999593))
* **spec:** log URL in error when attempting XHR from FakeAsyncTestZone ([#893](https://github.com/angular/zone.js/issues/893)) ([874bfdc](https://github.com/angular/zone.js/commit/874bfdc))



<a name="0.8.17"></a>
## [0.8.17](https://github.com/angular/zone.js/compare/v0.8.16...0.8.17) (2017-08-23)


### Bug Fixes

* readonly property should not be patched ([#860](https://github.com/angular/zone.js/issues/860)) ([7fbd655](https://github.com/angular/zone.js/commit/7fbd655))
* suppress closure warnings/errors ([#861](https://github.com/angular/zone.js/issues/861)) ([deae751](https://github.com/angular/zone.js/commit/deae751))
* **module:** fix [#875](https://github.com/angular/zone.js/issues/875), can disable requestAnimationFrame ([#876](https://github.com/angular/zone.js/issues/876)) ([fcf187c](https://github.com/angular/zone.js/commit/fcf187c))
* **node:** remove reference to 'noop' ([#865](https://github.com/angular/zone.js/issues/865)) ([4032ddf](https://github.com/angular/zone.js/commit/4032ddf))
* **patch:** fix [#869](https://github.com/angular/zone.js/issues/869), should not patch readonly method ([#871](https://github.com/angular/zone.js/issues/871)) ([31d38c1](https://github.com/angular/zone.js/commit/31d38c1))
* **rxjs:** asap should runGuarded to let error inZone ([#884](https://github.com/angular/zone.js/issues/884)) ([ce3f12f](https://github.com/angular/zone.js/commit/ce3f12f))
* **rxjs:** fix [#863](https://github.com/angular/zone.js/issues/863), fix asap scheduler issue, add testcases ([#848](https://github.com/angular/zone.js/issues/848)) ([cbc58c1](https://github.com/angular/zone.js/commit/cbc58c1))
* **spec:** fix flush() behavior in handling periodic timers ([#881](https://github.com/angular/zone.js/issues/881)) ([eed776c](https://github.com/angular/zone.js/commit/eed776c))
* **task:** fix closure compatibility issue with ZoneDelegate._updateTaskCount ([#878](https://github.com/angular/zone.js/issues/878)) ([a03b84b](https://github.com/angular/zone.js/commit/a03b84b))


### Features

* **cordova:** fix [#868](https://github.com/angular/zone.js/issues/868), patch cordova FileReader ([#879](https://github.com/angular/zone.js/issues/879)) ([b1e5970](https://github.com/angular/zone.js/commit/b1e5970))
* **onProperty:** fix [#875](https://github.com/angular/zone.js/issues/875), can disable patch specified onProperties ([#877](https://github.com/angular/zone.js/issues/877)) ([a733688](https://github.com/angular/zone.js/commit/a733688))
* **patch:** fix [#833](https://github.com/angular/zone.js/issues/833), add IntersectionObserver support ([#880](https://github.com/angular/zone.js/issues/880)) ([f27ff14](https://github.com/angular/zone.js/commit/f27ff14))
* **performance:** onProperty handler use global wrapFn, other performance improve. ([#872](https://github.com/angular/zone.js/issues/872)) ([a66595a](https://github.com/angular/zone.js/commit/a66595a))
* **performance:** reuse microTaskQueue native promise ([#874](https://github.com/angular/zone.js/issues/874)) ([7ee8bcd](https://github.com/angular/zone.js/commit/7ee8bcd))
* **spec:** add a 'tick' callback to flush() ([#866](https://github.com/angular/zone.js/issues/866)) ([02cd40e](https://github.com/angular/zone.js/commit/02cd40e))



<a name="0.8.16"></a>
## [0.8.16](https://github.com/angular/zone.js/compare/v0.8.15...0.8.16) (2017-07-27)


### Bug Fixes

* **console:** console.log in nodejs should run in root Zone ([#855](https://github.com/angular/zone.js/issues/855)) ([5900d3a](https://github.com/angular/zone.js/commit/5900d3a))
* **promise:** fix [#850](https://github.com/angular/zone.js/issues/850), check Promise.then writable ([#851](https://github.com/angular/zone.js/issues/851)) ([6e44cab](https://github.com/angular/zone.js/commit/6e44cab))
* **spec:** do not count requestAnimationFrame as a pending timer ([#854](https://github.com/angular/zone.js/issues/854)) ([eca04b0](https://github.com/angular/zone.js/commit/eca04b0))


### Features

* **spec:** add an option to FakeAsyncTestZoneSpec to flush periodic timers ([#857](https://github.com/angular/zone.js/issues/857)) ([5c5ca1a](https://github.com/angular/zone.js/commit/5c5ca1a))



<a name="0.8.15"></a>
## [0.8.15](https://github.com/angular/zone.js/compare/v0.8.13...0.8.15) (2017-07-27)


### Features

* **rxjs:** fix [#830](https://github.com/angular/zone.js/issues/830), monkey patch rxjs to make rxjs run in correct zone ([#843](https://github.com/angular/zone.js/issues/843)) ([1ed83d0](https://github.com/angular/zone.js/commit/1ed83d0))



<a name="0.8.14"></a>
## [0.8.14](https://github.com/angular/zone.js/compare/v0.8.13...0.8.14) (2017-07-20)


### Bug Fixes

* **event:** fix [#836](https://github.com/angular/zone.js/issues/836), handle event callback call removeEventListener case ([#839](https://github.com/angular/zone.js/issues/839)) ([f301fa2](https://github.com/angular/zone.js/commit/f301fa2))
* **event:** fix memory leak for once, add more test cases ([#841](https://github.com/angular/zone.js/issues/841)) ([2143d9c](https://github.com/angular/zone.js/commit/2143d9c))
* **task:** fix [#832](https://github.com/angular/zone.js/issues/832), fix [#835](https://github.com/angular/zone.js/issues/835), task.data should be an object ([#834](https://github.com/angular/zone.js/issues/834)) ([3a4bfbd](https://github.com/angular/zone.js/commit/3a4bfbd))


### Features

* **rxjs:** fix [#830](https://github.com/angular/zone.js/issues/830), monkey patch rxjs to make rxjs run in correct zone ([#843](https://github.com/angular/zone.js/issues/843)) ([1ed83d0](https://github.com/angular/zone.js/commit/1ed83d0))



<a name="0.8.14"></a>
## [0.8.14](https://github.com/angular/zone.js/compare/v0.8.13...0.8.14) (2017-07-18)


### Bug Fixes

* **event:** fix [#836](https://github.com/angular/zone.js/issues/836), handle event callback call removeEventListener case ([#839](https://github.com/angular/zone.js/issues/839)) ([f301fa2](https://github.com/angular/zone.js/commit/f301fa2))
* **event:** fix memory leak for once, add more test cases ([#841](https://github.com/angular/zone.js/issues/841)) ([2143d9c](https://github.com/angular/zone.js/commit/2143d9c))
* **task:** fix [#832](https://github.com/angular/zone.js/issues/832), fix [#835](https://github.com/angular/zone.js/issues/835), task.data should be an object ([#834](https://github.com/angular/zone.js/issues/834)) ([3a4bfbd](https://github.com/angular/zone.js/commit/3a4bfbd))



<a name="0.8.13"></a>
## [0.8.13](https://github.com/angular/zone.js/compare/v0.8.12...0.8.13) (2017-07-12)


### Bug Fixes

* **promise:** fix [#806](https://github.com/angular/zone.js/issues/806), remove duplicate consolelog ([#807](https://github.com/angular/zone.js/issues/807)) ([f439fe2](https://github.com/angular/zone.js/commit/f439fe2))
* **spec:** fakeAsyncTestSpec should handle requestAnimationFrame ([#805](https://github.com/angular/zone.js/issues/805)) ([8260f1d](https://github.com/angular/zone.js/commit/8260f1d)), closes [#804](https://github.com/angular/zone.js/issues/804)
* **websocket:** fix [#824](https://github.com/angular/zone.js/issues/824), patch websocket onproperties correctly in PhantomJS ([#826](https://github.com/angular/zone.js/issues/826)) ([273cb85](https://github.com/angular/zone.js/commit/273cb85))


### Features

* **FakeAsyncTestZoneSpec:** FakeAsyncTestZoneSpec.flush() passes limit along to scheduler ([#831](https://github.com/angular/zone.js/issues/831)) ([667cd6f](https://github.com/angular/zone.js/commit/667cd6f))


### Performance Improvements

* **eventListener:** fix [#798](https://github.com/angular/zone.js/issues/798), improve EventTarget.addEventListener performance ([#812](https://github.com/angular/zone.js/issues/812)) ([b3a76d3](https://github.com/angular/zone.js/commit/b3a76d3))



<a name="0.8.12"></a>
## [0.8.12](https://github.com/angular/zone.js/compare/v0.8.11...0.8.12) (2017-06-07)


### Bug Fixes

* **doc:** fix [#793](https://github.com/angular/zone.js/issues/793), fix confuseing bluebird patch doc ([#794](https://github.com/angular/zone.js/issues/794)) ([0c5da04](https://github.com/angular/zone.js/commit/0c5da04))
* **patch:** fix [#791](https://github.com/angular/zone.js/issues/791), fix mediaQuery/Notification patch uses wrong global ([#792](https://github.com/angular/zone.js/issues/792)) ([67634ae](https://github.com/angular/zone.js/commit/67634ae))
* **toString:** fix [#802](https://github.com/angular/zone.js/issues/802), fix ios 9 MutationObserver toString error ([#803](https://github.com/angular/zone.js/issues/803)) ([68aa03e](https://github.com/angular/zone.js/commit/68aa03e))
* **xhr:** inner onreadystatechange should not triigger Zone callback ([#800](https://github.com/angular/zone.js/issues/800)) ([7bd1418](https://github.com/angular/zone.js/commit/7bd1418))


### Features

* **patch:** fix [#696](https://github.com/angular/zone.js/issues/696), patch HTMLCanvasElement.toBlob as MacroTask ([#788](https://github.com/angular/zone.js/issues/788)) ([7ca3995](https://github.com/angular/zone.js/commit/7ca3995))
* **patch:** fix [#758](https://github.com/angular/zone.js/issues/758), patch cordova.exec success/error with zone.wrap ([#789](https://github.com/angular/zone.js/issues/789)) ([857929d](https://github.com/angular/zone.js/commit/857929d))



<a name="0.8.11"></a>
## [0.8.11](https://github.com/angular/zone.js/compare/v0.8.10...0.8.11) (2017-05-19)


### Bug Fixes

* **closure:** patchOnProperty with exact eventNames as possible ([#768](https://github.com/angular/zone.js/issues/768)) ([582ff7b](https://github.com/angular/zone.js/commit/582ff7b))
* **patch:** fix [#744](https://github.com/angular/zone.js/issues/744), add namespace to load patch name ([#774](https://github.com/angular/zone.js/issues/774)) ([89f990a](https://github.com/angular/zone.js/commit/89f990a))
* **task:** fix [#778](https://github.com/angular/zone.js/issues/778), sometimes task will run after being canceled ([#780](https://github.com/angular/zone.js/issues/780)) ([b7238c8](https://github.com/angular/zone.js/commit/b7238c8))
* **webcomponents:** fix [#782](https://github.com/angular/zone.js/issues/782), fix conflicts with shadydom of webcomponents ([#784](https://github.com/angular/zone.js/issues/784)) ([245f8e9](https://github.com/angular/zone.js/commit/245f8e9))
* **webpack:** access `process` through `_global` so that WebPack does not accidently browserify ([#786](https://github.com/angular/zone.js/issues/786)) ([1919b36](https://github.com/angular/zone.js/commit/1919b36))



<a name="0.8.10"></a>
## [0.8.10](https://github.com/angular/zone.js/compare/v0.8.9...0.8.10) (2017-05-03)


### Bug Fixes

* **showError:** fix ignoreConsoleErrorUncaughtError may change during drain microtask ([#763](https://github.com/angular/zone.js/issues/763)) ([4baeb5c](https://github.com/angular/zone.js/commit/4baeb5c))
* **spec:** fix [#760](https://github.com/angular/zone.js/issues/760), fakeAsyncTestSpec should handle microtask with additional args ([#762](https://github.com/angular/zone.js/issues/762)) ([f8d17ac](https://github.com/angular/zone.js/commit/f8d17ac))
* Package Error stack rewriting as a separate bundle. ([#770](https://github.com/angular/zone.js/issues/770)) ([b5e33fd](https://github.com/angular/zone.js/commit/b5e33fd))
* **timer:** fix [#437](https://github.com/angular/zone.js/issues/437), [#744](https://github.com/angular/zone.js/issues/744), fix nativescript timer issue, fix nodejs v0.10.x timer issue ([#772](https://github.com/angular/zone.js/issues/772)) ([3218b5a](https://github.com/angular/zone.js/commit/3218b5a))


### Features

* make codebase more modular so that only parts of it can be loaded ([#748](https://github.com/angular/zone.js/issues/748)) ([e933cbd](https://github.com/angular/zone.js/commit/e933cbd))
* **patch:** load non standard api with new load module method ([#764](https://github.com/angular/zone.js/issues/764)) ([97c03b5](https://github.com/angular/zone.js/commit/97c03b5))



<a name="0.8.9"></a>
## [0.8.9](https://github.com/angular/zone.js/compare/v0.8.8...0.8.9) (2017-04-25)


### Bug Fixes

* **patch:** fix [#746](https://github.com/angular/zone.js/issues/746), check desc get is null and only patch window.resize additionally ([#747](https://github.com/angular/zone.js/issues/747)) ([e598310](https://github.com/angular/zone.js/commit/e598310))



<a name="0.8.8"></a>
## [0.8.8](https://github.com/angular/zone.js/compare/v0.8.7...0.8.8) (2017-04-21)


### Bug Fixes

* on<property> handling broken in v0.8.7 ([fbe7b13](https://github.com/angular/zone.js/commit/fbe7b13))



<a name="0.8.7"></a>
## [0.8.7](https://github.com/angular/zone.js/compare/v0.8.5...0.8.7) (2017-04-21)


### Bug Fixes

* **doc:** fix typo in document, fix a typescript warning in test ([#732](https://github.com/angular/zone.js/issues/732)) ([55cf064](https://github.com/angular/zone.js/commit/55cf064))
* **error:** fix [#706](https://github.com/angular/zone.js/issues/706), handleError when onHasTask throw error ([#709](https://github.com/angular/zone.js/issues/709)) ([06d1ac0](https://github.com/angular/zone.js/commit/06d1ac0))
* **error:** remove throw in Error constructor to improve performance in IE11 ([#704](https://github.com/angular/zone.js/issues/704)) ([88d1a49](https://github.com/angular/zone.js/commit/88d1a49)), closes [#698](https://github.com/angular/zone.js/issues/698)
* **listener:** fix [#616](https://github.com/angular/zone.js/issues/616), webdriver removeEventListener throw permission denied error ([#699](https://github.com/angular/zone.js/issues/699)) ([e02960d](https://github.com/angular/zone.js/commit/e02960d))
* **patch:** fix [#707](https://github.com/angular/zone.js/issues/707), should not try to patch non configurable property ([#717](https://github.com/angular/zone.js/issues/717)) ([e422fb1](https://github.com/angular/zone.js/commit/e422fb1))
* **patch:** fix [#708](https://github.com/angular/zone.js/issues/708), modify the canPatchDescriptor logic when browser don't provide onreadystatechange ([#711](https://github.com/angular/zone.js/issues/711)) ([7d4d07f](https://github.com/angular/zone.js/commit/7d4d07f))
* **patch:** fix [#719](https://github.com/angular/zone.js/issues/719), window onproperty callback this is undefined ([#723](https://github.com/angular/zone.js/issues/723)) ([160531b](https://github.com/angular/zone.js/commit/160531b))
* **task:** fix [#705](https://github.com/angular/zone.js/issues/705), don't json task.data to prevent cyclic error ([#712](https://github.com/angular/zone.js/issues/712)) ([92a39e2](https://github.com/angular/zone.js/commit/92a39e2))
* **test:** fix [#718](https://github.com/angular/zone.js/issues/718), use async test to do unhandle promise rejection test ([#726](https://github.com/angular/zone.js/issues/726)) ([0a06874](https://github.com/angular/zone.js/commit/0a06874))
* **test:** fix websocket test server will crash when test in chrome ([#733](https://github.com/angular/zone.js/issues/733)) ([5090cf9](https://github.com/angular/zone.js/commit/5090cf9))
* **toString:** fix [#666](https://github.com/angular/zone.js/issues/666), Zone patched method toString should like before patched ([#686](https://github.com/angular/zone.js/issues/686)) ([0d0ee53](https://github.com/angular/zone.js/commit/0d0ee53))
* resolve errors with closure ([#722](https://github.com/angular/zone.js/issues/722)) ([51e7ffe](https://github.com/angular/zone.js/commit/51e7ffe))
* **typo:** fix typo, remove extra semicolons, unify api doc ([#697](https://github.com/angular/zone.js/issues/697)) ([967a991](https://github.com/angular/zone.js/commit/967a991))


### Features

* **closure:** fix [#727](https://github.com/angular/zone.js/issues/727), add zone_externs.js for closure compiler ([#731](https://github.com/angular/zone.js/issues/731)) ([b60e9e6](https://github.com/angular/zone.js/commit/b60e9e6))
* **error:** Remove all Zone frames from stack ([#693](https://github.com/angular/zone.js/issues/693)) ([681a017](https://github.com/angular/zone.js/commit/681a017))
* **EventListenerOptions:** fix [#737](https://github.com/angular/zone.js/issues/737), add support to EventListenerOptions ([#738](https://github.com/angular/zone.js/issues/738)) ([a89830d](https://github.com/angular/zone.js/commit/a89830d))
* **patch:** fix [#499](https://github.com/angular/zone.js/issues/499), let promise instance toString active like native ([#734](https://github.com/angular/zone.js/issues/734)) ([2f11e67](https://github.com/angular/zone.js/commit/2f11e67))



<a name="0.8.5"></a>
## [0.8.5](https://github.com/angular/zone.js/compare/v0.8.4...0.8.5) (2017-03-21)


### Bug Fixes

* add support for subclassing of Errors ([81297ee](https://github.com/angular/zone.js/commit/81297ee))
* improve long-stack-trace stack format detection ([6010557](https://github.com/angular/zone.js/commit/6010557))
* remove left over console.log ([eeaab91](https://github.com/angular/zone.js/commit/eeaab91))
* **event:** fix [#667](https://github.com/angular/zone.js/issues/667), eventHandler should return result ([#682](https://github.com/angular/zone.js/issues/682)) ([5c4e24d](https://github.com/angular/zone.js/commit/5c4e24d))
* **jasmine:** modify jasmine test ifEnvSupports message ([#689](https://github.com/angular/zone.js/issues/689)) ([5635ac0](https://github.com/angular/zone.js/commit/5635ac0))
* **REVERT:** remove zone internal stack frames in error.stack ([#632](https://github.com/angular/zone.js/issues/632)) ([#690](https://github.com/angular/zone.js/issues/690)) ([291d5a0](https://github.com/angular/zone.js/commit/291d5a0))


### Features

* **dom:** fix [#664](https://github.com/angular/zone.js/issues/664), patch window,document,SVGElement onProperties ([#687](https://github.com/angular/zone.js/issues/687)) ([61aee2e](https://github.com/angular/zone.js/commit/61aee2e))



<a name="0.8.4"></a>
## [0.8.4](https://github.com/angular/zone.js/compare/v0.8.3...0.8.4) (2017-03-16)


### Bug Fixes

* correct declaration which breaks closure ([0e19304](https://github.com/angular/zone.js/commit/0e19304))
* stack rewriting now works with source maps ([bcd09a0](https://github.com/angular/zone.js/commit/bcd09a0))



<a name="0.8.3"></a>
## [0.8.3](https://github.com/angular/zone.js/compare/v0.8.1...0.8.3) (2017-03-15)


### Bug Fixes

* **zone:** consistent access to __symbol__ to work with closure ([f742394](https://github.com/angular/zone.js/commit/f742394))


<a name="0.8.2"></a>
## [0.8.2](https://github.com/angular/zone.js/compare/v0.8.1...0.8.2) (2017-03-14)


### Bug Fixes

* **zone:** fix [#674](https://github.com/angular/zone.js/issues/674), handle error.stack readonly case ([#675](https://github.com/angular/zone.js/issues/675)) ([8322be8](https://github.com/angular/zone.js/commit/8322be8))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/angular/zone.js/compare/v0.8.0...0.8.1) (2017-03-13)


### Bug Fixes

* **example:** Update counting.html ([#648](https://github.com/angular/zone.js/issues/648)) ([a63ae5f](https://github.com/angular/zone.js/commit/a63ae5f))
* **XHR:** fix [#671](https://github.com/angular/zone.js/issues/671), patch XMLHttpRequestEventTarget prototype ([300dc36](https://github.com/angular/zone.js/commit/300dc36))


### Features

* **error:** remove zone internal stack frames in error.stack ([#632](https://github.com/angular/zone.js/issues/632)) ([76fa891](https://github.com/angular/zone.js/commit/76fa891))
* **task:** add task lifecycle doc and testcases to explain task state transition. ([#651](https://github.com/angular/zone.js/issues/651)) ([ef39a44](https://github.com/angular/zone.js/commit/ef39a44))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/angular/zone.js/compare/v0.7.8...0.8.0) (2017-03-10)



### Features

* Upgrade TypeScript to v2.2.1



<a name="0.7.8"></a>
## [0.7.8](https://github.com/angular/zone.js/compare/v0.7.6...0.7.8) (2017-03-10)


### Bug Fixes

* **core:** remove debugger ([#639](https://github.com/angular/zone.js/issues/639)) ([0534b19](https://github.com/angular/zone.js/commit/0534b19))
* **error:** fix [#618](https://github.com/angular/zone.js/issues/618), ZoneAwareError should copy Error's static propeties ([#647](https://github.com/angular/zone.js/issues/647)) ([2d30914](https://github.com/angular/zone.js/commit/2d30914))
* **jasmine:** support "pending" `it` clauses with no test body ([96cb3d0](https://github.com/angular/zone.js/commit/96cb3d0)), closes [#659](https://github.com/angular/zone.js/issues/659)
* **minification:** fix [#607](https://github.com/angular/zone.js/issues/607) to change catch variable name to error/err ([#609](https://github.com/angular/zone.js/issues/609)) ([33d0d8d](https://github.com/angular/zone.js/commit/33d0d8d))
* **node:** patch crypto as macroTask and add test cases for crypto, remove http patch ([#612](https://github.com/angular/zone.js/issues/612)) ([9e81037](https://github.com/angular/zone.js/commit/9e81037))
* **package:** use fixed version typescript,clang-format and jasmine ([#650](https://github.com/angular/zone.js/issues/650)) ([84459f1](https://github.com/angular/zone.js/commit/84459f1))
* **patch:** check timer patch return undefined ([#628](https://github.com/angular/zone.js/issues/628)) ([47962df](https://github.com/angular/zone.js/commit/47962df))
* **patch:** fix [#618](https://github.com/angular/zone.js/issues/618), use zoneSymbol as property name to avoid name conflict ([#645](https://github.com/angular/zone.js/issues/645)) ([fcd8be5](https://github.com/angular/zone.js/commit/fcd8be5))
* **task:** findEventTask should return Task array ([#633](https://github.com/angular/zone.js/issues/633)) ([14c7a6f](https://github.com/angular/zone.js/commit/14c7a6f))
* **task:** fix [#638](https://github.com/angular/zone.js/issues/638), eventTask/Periodical task should not be reset after cancel in running state ([#642](https://github.com/angular/zone.js/issues/642)) ([eb9250d](https://github.com/angular/zone.js/commit/eb9250d))
* **timers:** cleanup task reference when exception ([#637](https://github.com/angular/zone.js/issues/637)) ([2594940](https://github.com/angular/zone.js/commit/2594940))
* **webapi:** refactor webapi to not import util.ts directly ([8b2543e](https://github.com/angular/zone.js/commit/8b2543e)), closes [#652](https://github.com/angular/zone.js/issues/652)
* **xhr:** fix [#657](https://github.com/angular/zone.js/issues/657), sometimes xhr will fire onreadystatechange with done twice ([#658](https://github.com/angular/zone.js/issues/658)) ([36c0899](https://github.com/angular/zone.js/commit/36c0899))
* **zonespec:** don't throw and exception when setInterval is called within a async test zone ([#641](https://github.com/angular/zone.js/issues/641)) ([c07560f](https://github.com/angular/zone.js/commit/c07560f))


### Features

* add Zone.root api ([#601](https://github.com/angular/zone.js/issues/601)) ([9818139](https://github.com/angular/zone.js/commit/9818139))
* allow tasks to be canceled and rescheduled on different zone in a zone delegate ([#629](https://github.com/angular/zone.js/issues/629)) ([76c6ebf](https://github.com/angular/zone.js/commit/76c6ebf))
* make fetch() zone-aware without triggering extra requests or uncatchable errors. ([#622](https://github.com/angular/zone.js/issues/622)) ([6731ad0](https://github.com/angular/zone.js/commit/6731ad0))
* **bluebird:** patch bluebird promise and treat it as microtask ([#655](https://github.com/angular/zone.js/issues/655)) ([e783bfa](https://github.com/angular/zone.js/commit/e783bfa))
* **electron/nw:** fix [#533](https://github.com/angular/zone.js/issues/533), in electron/nw.js, we may need to patch both browser API and nodejs API, so we need a zone-mix.js to contains both patched API. ([6d31734](https://github.com/angular/zone.js/commit/6d31734))
* **longStackTraceSpec:** handled promise rejection can also render longstacktrace ([#631](https://github.com/angular/zone.js/issues/631)) ([a4c6525](https://github.com/angular/zone.js/commit/a4c6525))
* **promise:** fix [#621](https://github.com/angular/zone.js/issues/621), add unhandledRejection handler and ignore consoleError ([#627](https://github.com/angular/zone.js/issues/627)) ([f3547cc](https://github.com/angular/zone.js/commit/f3547cc))


<a name="0.7.6"></a>
## [0.7.6](https://github.com/angular/zone.js/compare/v0.7.4...0.7.6) (2017-01-17)


### Bug Fixes

* **doc:** typo in comment and reformat README.md ([#590](https://github.com/angular/zone.js/issues/590)) ([95ad315](https://github.com/angular/zone.js/commit/95ad315))
* **ZoneAwareError:** Error should keep prototype chain and can be called without new ([82722c3](https://github.com/angular/zone.js/commit/82722c3)), closes [#546](https://github.com/angular/zone.js/issues/546) [#554](https://github.com/angular/zone.js/issues/554) [#555](https://github.com/angular/zone.js/issues/555)
* [#536](https://github.com/angular/zone.js/issues/536), add notification api patch ([#599](https://github.com/angular/zone.js/issues/599)) ([83dfa97](https://github.com/angular/zone.js/commit/83dfa97))
* [#593](https://github.com/angular/zone.js/issues/593), only call removeAttribute when have the method ([#594](https://github.com/angular/zone.js/issues/594)) ([1401d60](https://github.com/angular/zone.js/commit/1401d60))
* [#595](https://github.com/angular/zone.js/issues/595), refactor ZoneAwareError property copy ([#597](https://github.com/angular/zone.js/issues/597)) ([f7330de](https://github.com/angular/zone.js/commit/f7330de))
* [#604](https://github.com/angular/zone.js/issues/604), sometimes setInterval test spec will fail on Android 4.4 ([#605](https://github.com/angular/zone.js/issues/605)) ([e3cd1f4](https://github.com/angular/zone.js/commit/e3cd1f4))
* add missing test MutationObserver ([5c7bc01](https://github.com/angular/zone.js/commit/5c7bc01))
* Promise.toString() to look like native function ([f854ce0](https://github.com/angular/zone.js/commit/f854ce0))



<a name="0.7.5"></a>
## [0.7.5](https://github.com/angular/zone.js/compare/v0.7.4...0.7.5) (2017-01-12)


### Bug Fixes

* patch fs methods as macrotask, add test cases of fs watcher ([#572](https://github.com/angular/zone.js/issues/572)) ([e1d3240](https://github.com/angular/zone.js/commit/e1d3240))
* fix [#577](https://github.com/angular/zone.js/issues/577), canPatchViaPropertyDescriptor test should add configurable to XMLHttpRequest.prototype ([#578](https://github.com/angular/zone.js/issues/578)) ([c297752](https://github.com/angular/zone.js/commit/c297752))
* fix [#551](https://github.com/angular/zone.js/issues/551), add toJSON to ZoneTask to prevent cyclic error ([#576](https://github.com/angular/zone.js/issues/576)) ([03d19f9](https://github.com/angular/zone.js/commit/03d19f9))
* fix [#574](https://github.com/angular/zone.js/issues/574), captureStackTrace will have additional stackframe from Zone will break binding.js ([#575](https://github.com/angular/zone.js/issues/575)) ([41f5306](https://github.com/angular/zone.js/commit/41f5306))
* fix [#569](https://github.com/angular/zone.js/issues/569), request will cause updateTaskCount failed if we call abort multipletimes ([#570](https://github.com/angular/zone.js/issues/570)) ([62f1449](https://github.com/angular/zone.js/commit/62f1449))
* add web-api.ts to patch mediaQuery ([#571](https://github.com/angular/zone.js/issues/571)) ([e92f934](https://github.com/angular/zone.js/commit/e92f934))
* fix [#584](https://github.com/angular/zone.js/issues/584), remove android 4.1~4.3, add no-ssl options to make android 4.4 pass test ([#586](https://github.com/angular/zone.js/issues/586)) ([7cd570e](https://github.com/angular/zone.js/commit/7cd570e))
* Fix [#532](https://github.com/angular/zone.js/issues/532), Fix [#566](https://github.com/angular/zone.js/issues/566), add tslint in ci, add tslint/format/test/karma in precommit of git ([#565](https://github.com/angular/zone.js/issues/565)) ([fb8d51c](https://github.com/angular/zone.js/commit/fb8d51c))
* docs(zone.ts): fix  typo ([#583](https://github.com/angular/zone.js/issues/583)) ([ecbef87](https://github.com/angular/zone.js/commit/ecbef87))
* add missing test MutationObserver ([5c7bc01](https://github.com/angular/zone.js/commit/5c7bc01))
* Promise.toString() to look like native function ([f854ce0](https://github.com/angular/zone.js/commit/f854ce0))
* **ZoneAwareError:** Error should keep prototype chain and can be called without new ([82722c3](https://github.com/angular/zone.js/commit/82722c3)), closes [#546](https://github.com/angular/zone.js/issues/546) [#554](https://github.com/angular/zone.js/issues/554) [#555](https://github.com/angular/zone.js/issues/555)



<a name="0.7.4"></a>
## [0.7.4](https://github.com/angular/zone.js/compare/v0.7.1...0.7.4) (2016-12-31)


### Bug Fixes

* add better Type safety ([610649b](https://github.com/angular/zone.js/commit/610649b))
* add missing test MutationObserver ([5c7bc01](https://github.com/angular/zone.js/commit/5c7bc01))
* correct currentZone passed into delegate methods ([dc12d8e](https://github.com/angular/zone.js/commit/dc12d8e)), closes [#587](https://github.com/angular/zone.js/issues/587) [#539](https://github.com/angular/zone.js/issues/539)
* correct zone.min.js not including zone ([384f5ec](https://github.com/angular/zone.js/commit/384f5ec))
* Correct ZoneAwareError prototype chain ([ba7858c](https://github.com/angular/zone.js/commit/ba7858c)), closes [#546](https://github.com/angular/zone.js/issues/546) [#547](https://github.com/angular/zone.js/issues/547)
* formatting issue. ([c70e9ec](https://github.com/angular/zone.js/commit/c70e9ec))
* inline event handler issue  ([20b5a5d](https://github.com/angular/zone.js/commit/20b5a5d)), closes [#525](https://github.com/angular/zone.js/issues/525) [#540](https://github.com/angular/zone.js/issues/540)
* parameterize `wrap` method on `Zone` ([#542](https://github.com/angular/zone.js/issues/542)) ([f522e1b](https://github.com/angular/zone.js/commit/f522e1b))
* **closure:** avoid property renaming on globals ([af14646](https://github.com/angular/zone.js/commit/af14646))
* Prevent adding  listener for xhrhttprequest multiple times ([9509747](https://github.com/angular/zone.js/commit/9509747)), closes [#529](https://github.com/angular/zone.js/issues/529) [#527](https://github.com/angular/zone.js/issues/527) [#287](https://github.com/angular/zone.js/issues/287) [#530](https://github.com/angular/zone.js/issues/530)
* Promise.toString() to look like native function ([f854ce0](https://github.com/angular/zone.js/commit/f854ce0))
* **closure:** Fix closure error suppression comment. ([#552](https://github.com/angular/zone.js/issues/552)) ([2643783](https://github.com/angular/zone.js/commit/2643783))
* Run tests on both the build as well as the dist folder ([#514](https://github.com/angular/zone.js/issues/514)) ([c0604f5](https://github.com/angular/zone.js/commit/c0604f5))
* support  nw.js environment ([486010b](https://github.com/angular/zone.js/commit/486010b)), closes [#524](https://github.com/angular/zone.js/issues/524)


### Features

* Patch captureStackTrace/prepareStackTrace to ZoneAwareError, patch process.nextTick, fix removeAllListeners bug ([#516](https://github.com/angular/zone.js/issues/516)) ([c36c0bc](https://github.com/angular/zone.js/commit/c36c0bc)), closes [#484](https://github.com/angular/zone.js/issues/484) [#491](https://github.com/angular/zone.js/issues/491)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/angular/zone.js/compare/v0.7.0...v0.7.1) (2016-11-22)


### Bug Fixes

* missing zone from the build file ([e961833](https://github.com/angular/zone.js/commit/e961833))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/angular/zone.js/compare/0.6.25...v0.7.0) (2016-11-22)


### Bug Fixes

* **node:** crash when calling listeners() for event with no listeners ([431f6f0](https://github.com/angular/zone.js/commit/431f6f0))
* support clearing the timeouts with numeric IDs ([fea6d68](https://github.com/angular/zone.js/commit/fea6d68)), closes [#461](https://github.com/angular/zone.js/issues/461)
* **promise:** include stack trace in an unhandlerd promise ([#463](https://github.com/angular/zone.js/issues/463)) ([737f8d8](https://github.com/angular/zone.js/commit/737f8d8))
* **property-descriptor:** do not use document object in Safari web worker ([51f2e1f](https://github.com/angular/zone.js/commit/51f2e1f))
* Add WebSocket to the NO_EVENT_TARGET list to be patched as well ([#493](https://github.com/angular/zone.js/issues/493)) ([d8c15eb](https://github.com/angular/zone.js/commit/d8c15eb))
* fix wrong usage of == caught by closure compiler ([#510](https://github.com/angular/zone.js/issues/510)) ([d7d8eb5](https://github.com/angular/zone.js/commit/d7d8eb5))
* fluent interface for EventEmitter ([#475](https://github.com/angular/zone.js/issues/475)) ([c5130a6](https://github.com/angular/zone.js/commit/c5130a6))
* lint errors ([ed87c26](https://github.com/angular/zone.js/commit/ed87c26))
* make fetch promise patching safe ([16be7f9](https://github.com/angular/zone.js/commit/16be7f9)), closes [#451](https://github.com/angular/zone.js/issues/451)
* Make the check for ZoneAwarePromise more stringent ([#495](https://github.com/angular/zone.js/issues/495)) ([c69df25](https://github.com/angular/zone.js/commit/c69df25))
* run all timers in passage of time in a single fakeAsync's tick call ([a85db4c](https://github.com/angular/zone.js/commit/a85db4c)), closes [#454](https://github.com/angular/zone.js/issues/454)
* stop using class extends as it breaks rollup ([b52cf02](https://github.com/angular/zone.js/commit/b52cf02))
* use strict equality in scheduleQueueDrain ([#504](https://github.com/angular/zone.js/issues/504)) ([4b4249c](https://github.com/angular/zone.js/commit/4b4249c))


### Features

* add mocha support ([41a9047](https://github.com/angular/zone.js/commit/41a9047))
* **Error:** Rewrite Error stack frames to include zone ([e1c2a02](https://github.com/angular/zone.js/commit/e1c2a02))



<a name="0.6.25"></a>
## [0.6.25](https://github.com/angular/zone.js/compare/0.6.24...0.6.25) (2016-09-20)


### Bug Fixes

* **zonespecs:** revert unwrapping of zonespecs which actually require global ([#460](https://github.com/angular/zone.js/issues/460)) ([28a14f8](https://github.com/angular/zone.js/commit/28a14f8))



<a name="0.6.24"></a>
## [0.6.24](https://github.com/angular/zone.js/compare/v0.6.23...0.6.24) (2016-09-19)


### Bug Fixes

* **bundling:** switch to using umd bundles ([#457](https://github.com/angular/zone.js/issues/457)) ([8dd06e5](https://github.com/angular/zone.js/commit/8dd06e5)), closes [#456](https://github.com/angular/zone.js/issues/456)



<a name="0.6.23"></a>
## [0.6.23](https://github.com/angular/zone.js/compare/v0.6.22...v0.6.23) (2016-09-14)


### Bug Fixes

* **fetch:** correct chrome not able to load about://blank ([3844435](https://github.com/angular/zone.js/commit/3844435)), closes [#444](https://github.com/angular/zone.js/issues/444)



<a name="0.6.22"></a>
## [0.6.22](https://github.com/angular/zone.js/compare/v0.6.21...v0.6.22) (2016-09-14)


### Bug Fixes

* use fetch(about://blank) to prevent exception on MS Edge ([#442](https://github.com/angular/zone.js/issues/442)) ([8b81537](https://github.com/angular/zone.js/commit/8b81537)), closes [#436](https://github.com/angular/zone.js/issues/436) [#439](https://github.com/angular/zone.js/issues/439)


### Features

* **node:** patch most fs methods ([#438](https://github.com/angular/zone.js/issues/438)) ([4c8a155](https://github.com/angular/zone.js/commit/4c8a155))
* **node:** patch outgoing http requests to capture the zone ([#430](https://github.com/angular/zone.js/issues/430)) ([100b82b](https://github.com/angular/zone.js/commit/100b82b))



<a name="0.6.21"></a>
## [0.6.21](https://github.com/angular/zone.js/compare/v0.6.20...v0.6.21) (2016-09-11)


### Bug Fixes

* proper detection of global in WebWorker ([0a7a155](https://github.com/angular/zone.js/commit/0a7a155))



<a name="0.6.20"></a>
## [0.6.20](https://github.com/angular/zone.js/compare/v0.6.19...v0.6.20) (2016-09-10)



<a name="0.6.19"></a>
## [0.6.19](https://github.com/angular/zone.js/compare/v0.6.17...v0.6.19) (2016-09-10)


### Bug Fixes

* provide a more usefull error when configuring properties ([1fe4df0](https://github.com/angular/zone.js/commit/1fe4df0))
* **jasmine:** propagate all arguments of it/describe/etc... ([a85fd68](https://github.com/angular/zone.js/commit/a85fd68))
* **long-stack:** Safer writing of stack traces. ([6767ff5](https://github.com/angular/zone.js/commit/6767ff5))
* **promise:** support more aggressive optimization. ([#431](https://github.com/angular/zone.js/issues/431)) ([26fc3da](https://github.com/angular/zone.js/commit/26fc3da))
* **XHR:** Don't send sync XHR through ZONE ([6e2f13c](https://github.com/angular/zone.js/commit/6e2f13c)), closes [#377](https://github.com/angular/zone.js/issues/377)


### Features

* assert that right ZoneAwarePromise is available ([#420](https://github.com/angular/zone.js/issues/420)) ([4c35e5b](https://github.com/angular/zone.js/commit/4c35e5b))



<a name="0.6.17"></a>
## [0.6.17](https://github.com/angular/zone.js/compare/v0.6.15...v0.6.17) (2016-08-22)


### Bug Fixes

* **browser:** use XMLHttpRequest.DONE constant on target instead of the global interface ([#395](https://github.com/angular/zone.js/issues/395)) ([3b4c20b](https://github.com/angular/zone.js/commit/3b4c20b)), closes [#394](https://github.com/angular/zone.js/issues/394)
* **jasmine:** spelling error of 'describe' in jasmine patch prevented application of sync zone ([d38ccde](https://github.com/angular/zone.js/commit/d38ccde)), closes [#412](https://github.com/angular/zone.js/issues/412)
* **patchProperty:** return null as the default value ([#413](https://github.com/angular/zone.js/issues/413)) ([396942b](https://github.com/angular/zone.js/commit/396942b)), closes [#319](https://github.com/angular/zone.js/issues/319)
* IE10/11 timeout issues. ([382182c](https://github.com/angular/zone.js/commit/382182c))



<a name="0.6.15"></a>
## [0.6.15](https://github.com/angular/zone.js/compare/v0.6.14...v0.6.15) (2016-08-19)


### Bug Fixes

* broken build. ([#406](https://github.com/angular/zone.js/issues/406)) ([5e3c207](https://github.com/angular/zone.js/commit/5e3c207))
* **tasks:** do not drain the microtask queue early. ([ff88bb4](https://github.com/angular/zone.js/commit/ff88bb4))
* **tasks:** do not drain the microtask queue early. ([d4a1436](https://github.com/angular/zone.js/commit/d4a1436))



<a name="0.6.14"></a>
## [0.6.14](https://github.com/angular/zone.js/compare/v0.6.13...v0.6.14) (2016-08-17)


### Features

* **jasmine:** patch jasmine to understand zones. ([3a054be](https://github.com/angular/zone.js/commit/3a054be))
* **trackingZone:** Keep track of tasks to see outstanding tasks. ([4942b4a](https://github.com/angular/zone.js/commit/4942b4a))



<a name="0.6.13"></a>
## [0.6.13](https://github.com/angular/zone.js/compare/v0.6.12...v0.6.13) (2016-08-15)


### Bug Fixes

* **browser:** make Object.defineProperty patch safer ([#392](https://github.com/angular/zone.js/issues/392)) ([597c634](https://github.com/angular/zone.js/commit/597c634)), closes [#391](https://github.com/angular/zone.js/issues/391)
* **browser:** patch Window when EventTarget is missing. ([#368](https://github.com/angular/zone.js/issues/368)) ([fcef80d](https://github.com/angular/zone.js/commit/fcef80d)), closes [#367](https://github.com/angular/zone.js/issues/367)
* **browser:** patchTimer cancelAnimationFrame ([#353](https://github.com/angular/zone.js/issues/353)) ([bf77fbb](https://github.com/angular/zone.js/commit/bf77fbb)), closes [#326](https://github.com/angular/zone.js/issues/326) [Leaflet/Leaflet#4588](https://github.com/Leaflet/Leaflet/issues/4588)
* **browser:** should not throw with frozen prototypes ([#351](https://github.com/angular/zone.js/issues/351)) ([27ca2a9](https://github.com/angular/zone.js/commit/27ca2a9))
* **build:** fix broken master due to setTimeout not returning a number on node ([d43b4b8](https://github.com/angular/zone.js/commit/d43b4b8))
* **doc:** Fixed the home page example. ([#348](https://github.com/angular/zone.js/issues/348)) ([9a0aa4a](https://github.com/angular/zone.js/commit/9a0aa4a))
* throw if trying to load zone more then once. ([6df5f93](https://github.com/angular/zone.js/commit/6df5f93))
* **fakeAsync:** throw error on rejected promisees. ([fd1dfcc](https://github.com/angular/zone.js/commit/fd1dfcc))
* **promise:** allow Promise subclassing ([dafad98](https://github.com/angular/zone.js/commit/dafad98))
* **XHR.responseBlob:** don't access XHR.responseBlob on old android webkit ([#329](https://github.com/angular/zone.js/issues/329)) ([ed69756](https://github.com/angular/zone.js/commit/ed69756))


### Features

* return timeout Id in ZoneTask.toString (fixes [#341](https://github.com/angular/zone.js/issues/341)) ([80ae6a8](https://github.com/angular/zone.js/commit/80ae6a8)), closes [#375](https://github.com/angular/zone.js/issues/375)
* **jasmine:** Switch jasmine patch to use microtask and preserve zone. ([5f519de](https://github.com/angular/zone.js/commit/5f519de))
* **ProxySpec:** create a ProxySpec which can proxy to other ZoneSpecs. ([2d02e39](https://github.com/angular/zone.js/commit/2d02e39))
* **zone:** Add Zone.getZone api ([0621014](https://github.com/angular/zone.js/commit/0621014))



<a name="0.6.12"></a>
## [0.6.12](https://github.com/angular/zone.js/compare/v0.6.11...v0.6.12) (2016-04-19)


### Bug Fixes

* **property-descriptor:** do not fail for events without targets ([3a8deef](https://github.com/angular/zone.js/commit/3a8deef))


### Features

* Add a zone spec for fake async test zone. ([#330](https://github.com/angular/zone.js/issues/330)) ([34159b4](https://github.com/angular/zone.js/commit/34159b4))



<a name="0.6.11"></a>
## [0.6.11](https://github.com/angular/zone.js/compare/v0.6.9...v0.6.11) (2016-04-14)


### Bug Fixes

* Suppress closure compiler warnings about unknown 'process' variable. ([e125173](https://github.com/angular/zone.js/commit/e125173)), closes [#295](https://github.com/angular/zone.js/issues/295)
* **setTimeout:** fix for [#290](https://github.com/angular/zone.js/issues/290), allow clearTimeout to be called in setTimeout callback ([a6967ad](https://github.com/angular/zone.js/commit/a6967ad)), closes [#301](https://github.com/angular/zone.js/issues/301)
* **WebSocket patch:** fix WebSocket constants copy ([#299](https://github.com/angular/zone.js/issues/299)) ([5dc4339](https://github.com/angular/zone.js/commit/5dc4339))
* **xhr:** XHR macrotasks allow abort after XHR has completed ([#311](https://github.com/angular/zone.js/issues/311)) ([c70f011](https://github.com/angular/zone.js/commit/c70f011))
* **zone:** remove debugger statement ([#292](https://github.com/angular/zone.js/issues/292)) ([01cec16](https://github.com/angular/zone.js/commit/01cec16))
* window undefined in node environments ([f8d5dc7](https://github.com/angular/zone.js/commit/f8d5dc7)), closes [#305](https://github.com/angular/zone.js/issues/305)


### Features

* **zonespec:** add a spec for synchronous tests ([#294](https://github.com/angular/zone.js/issues/294)) ([55da3d8](https://github.com/angular/zone.js/commit/55da3d8))
* node/node ([29fc5d2](https://github.com/angular/zone.js/commit/29fc5d2))



<a name="0.6.9"></a>
## [0.6.9](https://github.com/angular/zone.js/compare/v0.6.5...v0.6.9) (2016-04-04)


### Bug Fixes

* Allow calling clearTimeout from within the setTimeout callback ([a8ea55d](https://github.com/angular/zone.js/commit/a8ea55d)), closes [#302](https://github.com/angular/zone.js/issues/302)
* Canceling already run task should not double decrement task counter ([faa3485](https://github.com/angular/zone.js/commit/faa3485)), closes [#290](https://github.com/angular/zone.js/issues/290)
* **xhr:** don't throw on an xhr which is aborted before sending ([8827e1e](https://github.com/angular/zone.js/commit/8827e1e))
* **zone:** remove debugger statement ([d7c116b](https://github.com/angular/zone.js/commit/d7c116b))


### Features

* **zonespec:** add a spec for synchronous tests ([0a6a434](https://github.com/angular/zone.js/commit/0a6a434))
* treat XHRs as macrotasks ([fd39f97](https://github.com/angular/zone.js/commit/fd39f97))



<a name="0.6.5"></a>
## [0.6.5](https://github.com/angular/zone.js/compare/v0.6.2...v0.6.5) (2016-03-21)


### Bug Fixes

* disable safari 7 ([4a4d4f6](https://github.com/angular/zone.js/commit/4a4d4f6))
* **browser/utils:** calling removeEventListener twice with the same args should not cause errors ([1787339](https://github.com/angular/zone.js/commit/1787339)), closes [#283](https://github.com/angular/zone.js/issues/283) [#284](https://github.com/angular/zone.js/issues/284)
* **patching:** call native cancel method ([5783663](https://github.com/angular/zone.js/commit/5783663)), closes [#278](https://github.com/angular/zone.js/issues/278) [#279](https://github.com/angular/zone.js/issues/279)
* **utils:** add the ability to prevent the default action of onEvent (onclick, onpaste,etc..) by returning false. ([99940c3](https://github.com/angular/zone.js/commit/99940c3)), closes [#236](https://github.com/angular/zone.js/issues/236)
* **WebSocket patch:** keep WebSocket constants ([f25b087](https://github.com/angular/zone.js/commit/f25b087)), closes [#267](https://github.com/angular/zone.js/issues/267)
* **zonespec:** Do not crash on error if last task had no data ([0dba019](https://github.com/angular/zone.js/commit/0dba019)), closes [#281](https://github.com/angular/zone.js/issues/281)


### Features

* **indexdb:** Added property patches and event target methods as well as tests for Indexed DB ([84a251f](https://github.com/angular/zone.js/commit/84a251f)), closes [#204](https://github.com/angular/zone.js/issues/204)
* **zonespec:** add a spec for asynchronous tests ([aeeb05c](https://github.com/angular/zone.js/commit/aeeb05c)), closes [#275](https://github.com/angular/zone.js/issues/275)



<a name="0.6.2"></a>
## [0.6.2](https://github.com/angular/zone.js/compare/v0.6.1...v0.6.2) (2016-03-03)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/angular/zone.js/compare/v0.6.0...v0.6.1) (2016-02-29)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/angular/zone.js/compare/v0.5.15...v0.6.0) (2016-02-29)


### Chores

* **everything:** Major Zone Rewrite/Reimplementation ([63d4552](https://github.com/angular/zone.js/commit/63d4552))


### BREAKING CHANGES

* everything: This is a brand new implementation which is not backwards compatible.



<a name="0.5.15"></a>
## [0.5.15](https://github.com/angular/zone.js/compare/v0.5.14...v0.5.15) (2016-02-17)


### Bug Fixes

* **WebWorker:** Patch WebSockets and XMLHttpRequest in WebWorker ([45a6bc1](https://github.com/angular/zone.js/commit/45a6bc1)), closes [#249](https://github.com/angular/zone.js/issues/249)
* **WebWorker:** Patch WebSockets and XMLHttpRequest in WebWorker ([9041a3a](https://github.com/angular/zone.js/commit/9041a3a)), closes [#249](https://github.com/angular/zone.js/issues/249)



<a name="0.5.14"></a>
## [0.5.14](https://github.com/angular/zone.js/compare/v0.5.11...v0.5.14) (2016-02-11)



<a name="0.5.11"></a>
## [0.5.11](https://github.com/angular/zone.js/compare/v0.5.10...v0.5.11) (2016-01-27)


### Bug Fixes

* correct incorrect example path in karma config ([b0a624d](https://github.com/angular/zone.js/commit/b0a624d))
* correct test relaying on jasmine timeout ([4f7d6ae](https://github.com/angular/zone.js/commit/4f7d6ae))
* **WebSocket:** don't patch EventTarget methods twice ([345e56c](https://github.com/angular/zone.js/commit/345e56c)), closes [#235](https://github.com/angular/zone.js/issues/235)


### Features

* **wtf:** add wtf support to (set/clear)Timeout/Interval/Immediate ([6659fd5](https://github.com/angular/zone.js/commit/6659fd5))



<a name="0.5.10"></a>
## [0.5.10](https://github.com/angular/zone.js/compare/v0.5.9...v0.5.10) (2015-12-11)


### Bug Fixes

* **keys:** Do not use Symbol which are broken in Chrome 39.0.2171 (Dartium) ([c48301b](https://github.com/angular/zone.js/commit/c48301b))
* **Promise:** Make sure we check for native Promise before es6-promise gets a chance to polyfill ([fa18d4c](https://github.com/angular/zone.js/commit/fa18d4c))



<a name="0.5.9"></a>
## [0.5.9](https://github.com/angular/zone.js/compare/v0.5.8...v0.5.9) (2015-12-09)


### Bug Fixes

* **keys:** do not declare functions inside blocks ([d44d699](https://github.com/angular/zone.js/commit/d44d699)), closes [#194](https://github.com/angular/zone.js/issues/194)
* **keys:** Symbol is being checked for type of function ([6714be6](https://github.com/angular/zone.js/commit/6714be6))
* **mutation-observe:** output of typeof operator should be string ([19703e3](https://github.com/angular/zone.js/commit/19703e3))
* **util:** origin addEventListener/removeEventListener should be called without eventListener ([26e7f51](https://github.com/angular/zone.js/commit/26e7f51)), closes [#198](https://github.com/angular/zone.js/issues/198)
* **utils:** should have no effect when called addEventListener/removeEventListener without eventListener. ([5bcc6ae](https://github.com/angular/zone.js/commit/5bcc6ae))



<a name="0.5.8"></a>
## [0.5.8](https://github.com/angular/zone.js/compare/v0.5.7...v0.5.8) (2015-10-06)


### Bug Fixes

* **addEventListener:** when called from the global scope ([a23d61a](https://github.com/angular/zone.js/commit/a23d61a)), closes [#190](https://github.com/angular/zone.js/issues/190)
* **EventTarget:** apply the patch even if `Window` is not defined ([32c6df9](https://github.com/angular/zone.js/commit/32c6df9))



<a name="0.5.7"></a>
## [0.5.7](https://github.com/angular/zone.js/compare/v0.5.6...v0.5.7) (2015-09-29)


### Bug Fixes

* **RequestAnimationFrame:** pass the timestamp to the callback ([79a37c0](https://github.com/angular/zone.js/commit/79a37c0)), closes [#187](https://github.com/angular/zone.js/issues/187)



<a name="0.5.6"></a>
## [0.5.6](https://github.com/angular/zone.js/compare/v0.5.5...v0.5.6) (2015-09-25)


### Bug Fixes

* **Jasmine:** add support for jasmine 2 done.fail() ([1d4370b](https://github.com/angular/zone.js/commit/1d4370b)), closes [#180](https://github.com/angular/zone.js/issues/180)
* **utils:** fixes event target patch in web workers ([ad5c0c8](https://github.com/angular/zone.js/commit/ad5c0c8))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/angular/zone.js/compare/v0.5.4...v0.5.5) (2015-09-11)


### Bug Fixes

* **lib/utils:** adds compliant handling of useCapturing param for EventTarget methods ([dd2e1bf](https://github.com/angular/zone.js/commit/dd2e1bf))
* **lib/utils:** fixes incorrect behaviour when re-adding the same event listener fn ([1b804cf](https://github.com/angular/zone.js/commit/1b804cf))
* **longStackTraceZone:** modifies stackFramesFilter to exclude zone.js frames ([50ce9f3](https://github.com/angular/zone.js/commit/50ce9f3))


### Features

* **lib/core:** add/removeEventListener hooks ([1897440](https://github.com/angular/zone.js/commit/1897440))
* **lib/patch/file-reader:** zone-binds FileReader#onEventName listeners ([ce589b9](https://github.com/angular/zone.js/commit/ce589b9)), closes [#137](https://github.com/angular/zone.js/issues/137)



<a name="0.5.4"></a>
## [0.5.4](https://github.com/angular/zone.js/compare/v0.5.3...v0.5.4) (2015-08-31)


### Bug Fixes

* js path in examples ([c7a2ed9](https://github.com/angular/zone.js/commit/c7a2ed9))
* **zone:** fix conflict with Polymer elements ([77b4c0d](https://github.com/angular/zone.js/commit/77b4c0d))


### Features

* **patch:** support requestAnimationFrame time loops ([3d6dc08](https://github.com/angular/zone.js/commit/3d6dc08))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/angular/zone.js/compare/v0.5.2...v0.5.3) (2015-08-21)


### Bug Fixes

* **addEventListener patch:** ignore FunctionWrapper for IE11 & Edge dev tools ([3b0ca3f](https://github.com/angular/zone.js/commit/3b0ca3f))
* **utils:** event listener patches break when passed an object implementing EventListener ([af88ff8](https://github.com/angular/zone.js/commit/af88ff8))
* **WebWorker:** Fix patching in WebWorker ([2cc59d8](https://github.com/angular/zone.js/commit/2cc59d8))


### Features

* **zone.js:** support Android browser ([93b5555](https://github.com/angular/zone.js/commit/93b5555))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/angular/zone.js/compare/v0.5.1...v0.5.2) (2015-07-01)


### Bug Fixes

* **jasmine patch:** forward timeout ([2dde717](https://github.com/angular/zone.js/commit/2dde717))
* **zone.bind:** throw an error if arg is not a function ([ee4262a](https://github.com/angular/zone.js/commit/ee4262a))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/angular/zone.js/compare/v0.5.0...v0.5.1) (2015-06-10)


### Bug Fixes

* **PatchClass:** copy static properties ([b91f8fe](https://github.com/angular/zone.js/commit/b91f8fe)), closes [#127](https://github.com/angular/zone.js/issues/127)
* **register-element:** add check for callback being own property of opts ([8bce00e](https://github.com/angular/zone.js/commit/8bce00e)), closes [#52](https://github.com/angular/zone.js/issues/52)


### Features

* **fetch:** patch the fetch API ([4d3d524](https://github.com/angular/zone.js/commit/4d3d524)), closes [#108](https://github.com/angular/zone.js/issues/108)
* **geolocation:** patch the API ([cd13da1](https://github.com/angular/zone.js/commit/cd13da1)), closes [#113](https://github.com/angular/zone.js/issues/113)
* **jasmine:** export the jasmine patch ([639d5e7](https://github.com/angular/zone.js/commit/639d5e7))
* **test:** serve lib/ files instead of dist/ ([f835213](https://github.com/angular/zone.js/commit/f835213))
* **zone.js:** support IE9+ ([554fae0](https://github.com/angular/zone.js/commit/554fae0))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/angular/zone.js/compare/v0.4.4...v0.5.0) (2015-05-08)


### Bug Fixes

* always run jasmine's done callbacks for async tests in jasmine's zone ([b7f3d04](https://github.com/angular/zone.js/commit/b7f3d04)), closes [#91](https://github.com/angular/zone.js/issues/91)
* don't fork new zones for callbacks from the root zone ([531d0ec](https://github.com/angular/zone.js/commit/531d0ec)), closes [#92](https://github.com/angular/zone.js/issues/92)
* **MutationObserver:** executes hooks in the creation zone ([3122a48](https://github.com/angular/zone.js/commit/3122a48))
* **test:** fix an ineffective assertion ([d85d2cf](https://github.com/angular/zone.js/commit/d85d2cf))
* minor fixes ([18f5511](https://github.com/angular/zone.js/commit/18f5511))


### Code Refactoring

* split zone.js into CJS modules, add zone-microtask.js ([2e52900](https://github.com/angular/zone.js/commit/2e52900))


### Features

* **scheduling:** Prefer MutationObserver over Promise in FF ([038bdd9](https://github.com/angular/zone.js/commit/038bdd9))
* **scheduling:** Support Promise.then() fallbacks to enqueue a microtask ([74eff1c](https://github.com/angular/zone.js/commit/74eff1c))
* add isRootZone api ([bf925bf](https://github.com/angular/zone.js/commit/bf925bf))
* make root zone id to be 1 ([605e213](https://github.com/angular/zone.js/commit/605e213))


### BREAKING CHANGES

* New child zones are now created only from a async task
that installed a custom zone.

Previously even without a custom zone installed (e.g.
LongStacktracesZone), we would spawn new
child zones for all asynchronous events. This is undesirable and
generally not useful.

It does not make sense for us to create new zones for callbacks from the
root zone since we care
only about callbacks from installed custom zones. This reduces the
overhead of zones.

This primarily means that LongStackTraces zone won't be able to trace
events back to Zone.init(),
but instead the starting point will be the installation of the
LongStacktracesZone. In all practical
situations this should be sufficient.
* zone.js as well as *-zone.js files are moved from / to dist/



<a name="0.4.4"></a>
## [0.4.4](https://github.com/angular/zone.js/compare/v0.4.3...v0.4.4) (2015-05-07)


### Bug Fixes

* commonjs wrapper ([7b4fdde](https://github.com/angular/zone.js/commit/7b4fdde)), closes [#19](https://github.com/angular/zone.js/issues/19)
* fork the zone in first example (README) ([7b6e8ed](https://github.com/angular/zone.js/commit/7b6e8ed))
* prevent aliasing original window reference ([63b42bd](https://github.com/angular/zone.js/commit/63b42bd))
* use strcit mode for the zone.js code only ([16855e5](https://github.com/angular/zone.js/commit/16855e5))
* **test:** use console.log rather than dump in tests ([490e6dd](https://github.com/angular/zone.js/commit/490e6dd))
* **websockets:** patch websockets via descriptors ([d725f46](https://github.com/angular/zone.js/commit/d725f46)), closes [#81](https://github.com/angular/zone.js/issues/81)
* **websockets:** properly patch websockets in Safari 7.0 ([3ba6fa1](https://github.com/angular/zone.js/commit/3ba6fa1)), closes [#88](https://github.com/angular/zone.js/issues/88)
* **websockets:** properly patch websockets on Safari 7.1 ([1799a20](https://github.com/angular/zone.js/commit/1799a20))


### Features

* add websockets example ([edb17d2](https://github.com/angular/zone.js/commit/edb17d2))
* log a warning if we suspect duplicate Zone install ([657f6fe](https://github.com/angular/zone.js/commit/657f6fe))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/angular/zone.js/compare/v0.4.2...v0.4.3) (2015-04-08)


### Bug Fixes

* **zone:** keep argument[0] refs around. ([48573ff](https://github.com/angular/zone.js/commit/48573ff))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/angular/zone.js/compare/v0.4.1...v0.4.2) (2015-03-27)


### Bug Fixes

* **zone.js:** don't make function declaration in block scope ([229fd8f](https://github.com/angular/zone.js/commit/229fd8f)), closes [#53](https://github.com/angular/zone.js/issues/53) [#54](https://github.com/angular/zone.js/issues/54)


### Features

* **bindPromiseFn:** add bindPromiseFn method ([643f2ac](https://github.com/angular/zone.js/commit/643f2ac)), closes [#49](https://github.com/angular/zone.js/issues/49)
* **lstz:** allow getLongStacktrace to be called with zero args ([26a4dc2](https://github.com/angular/zone.js/commit/26a4dc2)), closes [#47](https://github.com/angular/zone.js/issues/47)
* **Zone:** add unique id to each zone ([fb338b6](https://github.com/angular/zone.js/commit/fb338b6)), closes [#45](https://github.com/angular/zone.js/issues/45)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/angular/zone.js/compare/v0.4.0...v0.4.1) (2015-02-20)


### Bug Fixes

* **patchViaPropertyDescriptor:** disable if properties are not configurable ([fb5e644](https://github.com/angular/zone.js/commit/fb5e644)), closes [#42](https://github.com/angular/zone.js/issues/42)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/angular/zone.js/compare/v0.3.0...v0.4.0) (2015-02-04)


### Bug Fixes

* **WebSocket:** patch WebSocket instance ([7b8e1e6](https://github.com/angular/zone.js/commit/7b8e1e6))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/angular/zone.js/compare/v0.2.4...v0.3.0) (2014-06-12)


### Bug Fixes

* add events for webgl contexts ([4b6e411](https://github.com/angular/zone.js/commit/4b6e411))
* bind prototype chain callback of custom element descriptor ([136e518](https://github.com/angular/zone.js/commit/136e518))
* dequeue tasks from the zone that enqueued it ([f127fd4](https://github.com/angular/zone.js/commit/f127fd4))
* do not reconfig property descriptors of prototypes ([e9dfbed](https://github.com/angular/zone.js/commit/e9dfbed))
* patch property descriptors in Object.create ([7b7258b](https://github.com/angular/zone.js/commit/7b7258b)), closes [#24](https://github.com/angular/zone.js/issues/24)
* support mozRequestAnimationFrame ([886f67d](https://github.com/angular/zone.js/commit/886f67d))
* wrap non-configurable custom element callbacks ([383b479](https://github.com/angular/zone.js/commit/383b479)), closes [#24](https://github.com/angular/zone.js/issues/24)
* wrap Object.defineProperties ([f587f17](https://github.com/angular/zone.js/commit/f587f17)), closes [#24](https://github.com/angular/zone.js/issues/24)



<a name="0.2.4"></a>
## [0.2.4](https://github.com/angular/zone.js/compare/v0.2.3...v0.2.4) (2014-05-23)



<a name="0.2.3"></a>
## [0.2.3](https://github.com/angular/zone.js/compare/v0.2.2...v0.2.3) (2014-05-23)


### Bug Fixes

* remove dump ([45fb7ba](https://github.com/angular/zone.js/commit/45fb7ba))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/angular/zone.js/compare/v0.2.1...v0.2.2) (2014-05-22)


### Bug Fixes

* correctly detect support for document.registerElement ([ab1d487](https://github.com/angular/zone.js/commit/ab1d487))
* dont automagically dequeue on setInterval ([da99e15](https://github.com/angular/zone.js/commit/da99e15))
* fork should deep clone objects ([21b47ae](https://github.com/angular/zone.js/commit/21b47ae))
* support MutationObserver.disconnect ([ad711b8](https://github.com/angular/zone.js/commit/ad711b8))


### Features

* add stackFramesFilter to longStackTraceZone ([7133de0](https://github.com/angular/zone.js/commit/7133de0))
* expose hooks for enqueuing and dequing tasks ([ba72f34](https://github.com/angular/zone.js/commit/ba72f34))
* improve countingZone and example ([86328fb](https://github.com/angular/zone.js/commit/86328fb))
* support document.registerElement ([d3c785a](https://github.com/angular/zone.js/commit/d3c785a)), closes [#18](https://github.com/angular/zone.js/issues/18)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/angular/zone.js/compare/v0.2.0...v0.2.1) (2014-04-24)


### Bug Fixes

* add support for WebKitMutationObserver ([d1a2c8e](https://github.com/angular/zone.js/commit/d1a2c8e))
* preserve setters when wrapping XMLHttpRequest ([fb46688](https://github.com/angular/zone.js/commit/fb46688)), closes [#17](https://github.com/angular/zone.js/issues/17)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/angular/zone.js/compare/v0.1.1...v0.2.0) (2014-04-17)


### Bug Fixes

* patch all properties on the proto chain ([b6d76f0](https://github.com/angular/zone.js/commit/b6d76f0))
* patch MutationObserver ([1c4e85e](https://github.com/angular/zone.js/commit/1c4e85e))
* wrap XMLHttpRequest when we cant patch protos ([76de58e](https://github.com/angular/zone.js/commit/76de58e))


### Features

* add exceptZone ([b134391](https://github.com/angular/zone.js/commit/b134391))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/angular/zone.js/compare/v0.1.0...v0.1.1) (2014-03-31)


### Features

* add commonjs support ([0fe349e](https://github.com/angular/zone.js/commit/0fe349e))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/angular/zone.js/compare/v0.0.0...v0.1.0) (2014-03-31)


### Bug Fixes

* improve patching browsers with EventTarget ([7d3a8b1](https://github.com/angular/zone.js/commit/7d3a8b1))
* improve stacktrace capture on Safari ([46a6fbc](https://github.com/angular/zone.js/commit/46a6fbc))
* long stack trace test ([01ce3b3](https://github.com/angular/zone.js/commit/01ce3b3))
* prevent calling addEventListener on non-functions ([7acebca](https://github.com/angular/zone.js/commit/7acebca))
* throw if a zone does not define an onError hook ([81d5f49](https://github.com/angular/zone.js/commit/81d5f49))
* throw if a zone does not define an onError hook ([3485c1b](https://github.com/angular/zone.js/commit/3485c1b))


### Features

* add decorator syntax ([c6202a1](https://github.com/angular/zone.js/commit/c6202a1))
* add onZoneCreated hook ([f7badb6](https://github.com/angular/zone.js/commit/f7badb6))
* patch onclick in Chrome and Safari ([7205295](https://github.com/angular/zone.js/commit/7205295))
* refactor and test counting zone ([648a95d](https://github.com/angular/zone.js/commit/648a95d))
* support Promise ([091f44e](https://github.com/angular/zone.js/commit/091f44e))



<a name="0.0.0"></a>
# 0.0.0 (2013-09-18)



