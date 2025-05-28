<a name="19.2.14"></a>
# 19.2.14 (2025-05-28)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [24bab55f0c](https://github.com/angular/angular/commit/24bab55f0c89c4fe6037780fd7b2e8c8aa5429b2) | fix | lexer support for template literals in object literals ([#61601](https://github.com/angular/angular/pull/61601)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [9e1cd49662](https://github.com/angular/angular/commit/9e1cd4966202d89c7310ab84c50b2c4231a0213e) | fix | preserve comments when removing unused imports ([#61674](https://github.com/angular/angular/pull/61674)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.13"></a>
# 19.2.13 (2025-05-23)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [2c876b4fc5](https://github.com/angular/angular/commit/2c876b4fc5d89ce925b1403e239c7d162e39346b) | fix | avoid injecting ApplicationRef in FetchBackend ([#61649](https://github.com/angular/angular/pull/61649)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [b15bddfa04](https://github.com/angular/angular/commit/b15bddfa04e11827166b466c9acbb89c77499d5d) | fix | do not register service worker if app is destroyed before it is ready to register ([#61101](https://github.com/angular/angular/pull/61101)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.12"></a>
# 19.2.12 (2025-05-21)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [126efc9972](https://github.com/angular/angular/commit/126efc9972e18806e71977d51a55f8ec2f0514d6) | fix | cancel reader when app is destroyed ([#61528](https://github.com/angular/angular/pull/61528)) |
| [efda872453](https://github.com/angular/angular/commit/efda8724535a8560a64b28cc2bf81df5931af686) | fix | prevent reading chunks if app is destroyed ([#61354](https://github.com/angular/angular/pull/61354)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [44bb328eae](https://github.com/angular/angular/commit/44bb328eaea028524206d0d2b9f12702c9bf3861) | fix | avoid conflicts between HMR code and local symbols ([#61550](https://github.com/angular/angular/pull/61550)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [107180260f](https://github.com/angular/angular/commit/107180260f2ac4ca8e8995e123f36944c8bec2f3) | fix | Always retain prior results for all files ([#61487](https://github.com/angular/angular/pull/61487)) |
| [1191e62d70](https://github.com/angular/angular/commit/1191e62d70ee16f3b083b635dd60a9f2e0c2d4c7) | fix | avoid ECMAScript private field metadata emit ([#61227](https://github.com/angular/angular/pull/61227)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2b1b14f4d3](https://github.com/angular/angular/commit/2b1b14f4d3751b9b3c351ddc412ecdcb2aea4781) | fix | cleanup `rxResource` abort listener ([#58306](https://github.com/angular/angular/pull/58306)) |
| [8f9b05eaaa](https://github.com/angular/angular/commit/8f9b05eaaabf14d7570fde16e26a73d69f78dc14) | fix | cleanup testability subscriptions ([#61261](https://github.com/angular/angular/pull/61261)) |
| [eb53bda470](https://github.com/angular/angular/commit/eb53bda470312d449039ef9b1494e3b6cc081e42) | fix | enable stashing only when `withEventReplay()` is invoked ([#61352](https://github.com/angular/angular/pull/61352)) |
| [94f5a4b4d6](https://github.com/angular/angular/commit/94f5a4b4d6ee195e05e7d2683ab386ee02d60a06) | fix | Testing should not throw when Zone does not patch test FW APIs ([#61376](https://github.com/angular/angular/pull/61376)) |
| [c0c69a5abc](https://github.com/angular/angular/commit/c0c69a5abc7262887eaa1f0b84a6ec22be225994) | fix | unregister `onDestroy` in `toSignal`. ([#61514](https://github.com/angular/angular/pull/61514)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [8edafd0559](https://github.com/angular/angular/commit/8edafd05599b402f383e36879f76f2d5507450e8) | perf | speed up resolution of base ([#61392](https://github.com/angular/angular/pull/61392)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.11"></a>
# 19.2.11 (2025-05-15)

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.10"></a>
# 19.2.10 (2025-05-07)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [89056a0356](https://github.com/angular/angular/commit/89056a035648906d82ed2bbf523b793bce732474) | fix | cleanup `updateLatestValue` if view is destroyed before promise resolves ([#61064](https://github.com/angular/angular/pull/61064)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4623b61448](https://github.com/angular/angular/commit/4623b6144897c6063139afa2d189be4e2e1d70ba) | fix | missing useExisting providers throwing for optional calls ([#61152](https://github.com/angular/angular/pull/61152)) |
| [400dbc5b89](https://github.com/angular/angular/commit/400dbc5b89a2af0ae5fd7830f6ea47352c8556ef) | fix | properly handle app stabilization with defer blocks ([#61056](https://github.com/angular/angular/pull/61056)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [a6f0d5bc20](https://github.com/angular/angular/commit/a6f0d5bc20382689b7336a7e1c79c0685252cc21) | fix | less aggressive ngServerMode cleanup ([#61106](https://github.com/angular/angular/pull/61106)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.9"></a>
# 19.2.9 (2025-04-30)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [946b844e0d](https://github.com/angular/angular/commit/946b844e0db7e8f2cabcaf4cb63abced62c01fc7) | fix | async EventEmitter error should not prevent stability ([#61028](https://github.com/angular/angular/pull/61028)) |
| [dbb87026ca](https://github.com/angular/angular/commit/dbb87026ca10c5fb04fc1a350da27ea42cea7dc5) | fix | call DestroyRef on destroy callback if view is destroyed [patch] ([#61061](https://github.com/angular/angular/pull/61061)) |
| [2e140a136a](https://github.com/angular/angular/commit/2e140a136a044a965da7f55e0d83731860671a05) | fix | prevent stash listener conflicts [patch] ([#61063](https://github.com/angular/angular/pull/61063)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.8"></a>
# 19.2.8 (2025-04-23)
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [ea4a211216](https://github.com/angular/angular/commit/ea4a21121681c78652f314c78c58390dca25f266) | fix | make NgForm emit FormSubmittedEvent and FormResetEvent ([#60887](https://github.com/angular/angular/pull/60887)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.7"></a>
# 19.2.7 (2025-04-16)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [37ab6814f5](https://github.com/angular/angular/commit/37ab6814f5485434d9642b9f9c28dd430864247b) | fix | issue a warning instead of an error when `NgOptimizedImage` exceeds the preload limit ([#60883](https://github.com/angular/angular/pull/60883)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b144126612](https://github.com/angular/angular/commit/b144126612e2cd14cbccc8d3cf4e2136a2e540ff) | fix | inject migration: replace param with this. ([#60713](https://github.com/angular/angular/pull/60713)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [d39e09da41](https://github.com/angular/angular/commit/d39e09da413732385a12ed21eb468649233e26d0) | fix | Include HTTP status code and headers when HTTP requests errored in `httpResource` ([#60802](https://github.com/angular/angular/pull/60802)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.6"></a>
# 19.2.6 (2025-04-09)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [3441f7b914](https://github.com/angular/angular/commit/3441f7b914c73ccdaacbcd935e945dc304c5962a) | fix | error if rawText isn't estimated correctly ([#60529](https://github.com/angular/angular/pull/60529)) ([#60753](https://github.com/angular/angular/pull/60753)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [fc946c5f72](https://github.com/angular/angular/commit/fc946c5f7261ee3e49fa037bc55703b9ffcfbff3) | fix | ensure HMR works with different output module type ([#60797](https://github.com/angular/angular/pull/60797)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [f2bfa3151e](https://github.com/angular/angular/commit/f2bfa3151ee7ecb335665d55741387bd67ebee9d) | fix | fix ng generate @angular/core:output-migration. Fixes angular[#58650](https://github.com/angular/angular/pull/58650) ([#60763](https://github.com/angular/angular/pull/60763)) |
| [9241615ad0](https://github.com/angular/angular/commit/9241615ad0825156f4bf31bc4308372e4789e902) | fix | reduce total memory usage of various migration schematics ([#60776](https://github.com/angular/angular/pull/60776)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [0e82d42774](https://github.com/angular/angular/commit/0e82d427743c1d22e1683da11f66e33846f38663) | fix | Do not provide element completions in end tag ([#60616](https://github.com/angular/angular/pull/60616)) |
| [fcdef1019f](https://github.com/angular/angular/commit/fcdef1019fd28c7261590ba484a949c809b9ceaf) | fix | Ensure dollar signs are escaped in completions ([#60597](https://github.com/angular/angular/pull/60597)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.5"></a>
# 19.2.5 (2025-04-02)
### 
| Commit | Type | Description |
| -- | -- | -- |
| [e61d06afb5](https://github.com/angular/angular/commit/e61d06afb5f68268b204bb2630930bb213620811) | fix | step 6 tutorial docs ([#60630](https://github.com/angular/angular/pull/60630)) |
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [fa48f98d9f](https://github.com/angular/angular/commit/fa48f98d9f7e7b74deba65bea9bc90843b1c283b) | fix | add missing peer dependency on `@angular/common` ([#60660](https://github.com/angular/angular/pull/60660)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [ca5aa4d55b](https://github.com/angular/angular/commit/ca5aa4d55b352d1ead43d78b6a74d9e3b57f8777) | fix | throw for invalid "as" expression in if block ([#60580](https://github.com/angular/angular/pull/60580)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [f4c4b10ea8](https://github.com/angular/angular/commit/f4c4b10ea8dc263c30d1051a83a72486344d81e4) | fix | Produce fatal diagnostic on duplicate decorated properties ([#60376](https://github.com/angular/angular/pull/60376)) |
| [22a0e54ac4](https://github.com/angular/angular/commit/22a0e54ac4ae7b943740dc314ff7f26ee7530ee5) | fix | support relative imports to symbols outside `rootDir` ([#60555](https://github.com/angular/angular/pull/60555)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [64da69f7b6](https://github.com/angular/angular/commit/64da69f7b68c906544b3cb76b2fc7ec42cc434a8) | fix | check ngDevMode for undefined ([#60565](https://github.com/angular/angular/pull/60565)) |
| [8f68d1bec3](https://github.com/angular/angular/commit/8f68d1bec320c8af4c28ad6c8dbeda4581e8299b) | fix | fix ng generate @angular/core:output-migration ([#60626](https://github.com/angular/angular/pull/60626)) |
| [bc79985c65](https://github.com/angular/angular/commit/bc79985c65c38dee17f5cb53f2a14768632f72dc) | fix | fix regexp for event types ([#60592](https://github.com/angular/angular/pull/60592)) |
| [006ac7f22f](https://github.com/angular/angular/commit/006ac7f22f47b110129ca603cfa34f5514d7b4dd) | fix | fixes [#592882](https://github.com/angular/angular/pull/592882) ng generate @angular/core:signal-queries-migration ([#60688](https://github.com/angular/angular/pull/60688)) |
| [da6e93f434](https://github.com/angular/angular/commit/da6e93f4341804cd16327596c30d8f9258b40d7e) | fix | preserve comments in internal inject migration ([#60588](https://github.com/angular/angular/pull/60588)) |
| [dbbddd1617](https://github.com/angular/angular/commit/dbbddd161721990f29a037f88f930b333712550e) | fix | prevent omission of deferred pipes in full compilation ([#60571](https://github.com/angular/angular/pull/60571)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [0e9e0348dd](https://github.com/angular/angular/commit/0e9e0348dd972c96ecee8bb990aba8c604dc704f) | fix | Update adapter to log instead of throw errors ([#60651](https://github.com/angular/angular/pull/60651)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [15f53f035b](https://github.com/angular/angular/commit/15f53f035ba64fa761db64d48dd9daa1499370e3) | fix | handle shorthand assignments in super call ([#60602](https://github.com/angular/angular/pull/60602)) |
| [4b161e6234](https://github.com/angular/angular/commit/4b161e62344a51e87f1b5c5778fd72e56fc37922) | fix | inject migration not handling super parameter referenced via this ([#60602](https://github.com/angular/angular/pull/60602)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [958e98e4f7](https://github.com/angular/angular/commit/958e98e4f7ab8e708440f03eb68612d1802b9a71) | fix | Add missing types to transition ([#60307](https://github.com/angular/angular/pull/60307)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [7cd89ad2c6](https://github.com/angular/angular/commit/7cd89ad2c66adeb625f75d23fea32e762162d3d5) | fix | assign initializing client's app version, when a request is for worker script ([#58131](https://github.com/angular/angular/pull/58131)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.4"></a>
# 19.2.4 (2025-03-26)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [081f5f5a83f](https://github.com/angular/angular/commit/081f5f5a83fef99718952519bed9fe39005d6d37) | fix | fix used templates are not deleted ([#60459](https://github.com/angular/angular/pull/60459)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [a2f622d82d6](https://github.com/angular/angular/commit/a2f622d82d6c0f93a5fdf34fc8e5829db04c7380) | fix | handle @angular/build:karma in ng add ([#60513](https://github.com/angular/angular/pull/60513)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [8e8ccc79279](https://github.com/angular/angular/commit/8e8ccc792790c876cf5831f3d7a504290c665a1b) | fix | ensure `platformBrowserTesting` includes `platformBrowser` providers ([#60480](https://github.com/angular/angular/pull/60480)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.3"></a>
# 19.2.3 (2025-03-19)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [aa8ea7a5b2](https://github.com/angular/angular/commit/aa8ea7a5b227913e3f15270dac48479481c47f9a) | fix | report more accurate diagnostic for invalid import ([#60455](https://github.com/angular/angular/pull/60455)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [13a8709b2b](https://github.com/angular/angular/commit/13a8709b2ba29ef3ab7d38bfb41cdd3d44c24c51) | fix | catch hydration marker with implicit body tag ([#60429](https://github.com/angular/angular/pull/60429)) |
| [296aded9da](https://github.com/angular/angular/commit/296aded9daaf04edd3cda623a220cbd2bf57e0f1) | fix | execute timer trigger outside zone ([#60392](https://github.com/angular/angular/pull/60392)) |
| [0615ffb4f7](https://github.com/angular/angular/commit/0615ffb4f7a41cca2a408419830411897d1826e6) | fix | include input name in error message ([#60404](https://github.com/angular/angular/pull/60404)) |
### platform-browser-dynamic
| Commit | Type | Description |
| -- | -- | -- |
| [1e06c8e8b6](https://github.com/angular/angular/commit/1e06c8e8b6473a19584ceb66945fd435ea4e6af9) | fix | ensure compiler is loaded before `@angular/common` ([#60458](https://github.com/angular/angular/pull/60458)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [9e1a1030c8](https://github.com/angular/angular/commit/9e1a1030c818e9849c00ded5f79535ea56976ea8) | fix | handle output emitters when downgrading a component ([#60369](https://github.com/angular/angular/pull/60369)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.2"></a>
# 19.2.2 (2025-03-12)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [90a16a1088](https://github.com/angular/angular/commit/90a16a10888eee37d8a61cdbfad070e002a3cfdf) | fix | support equality function in httpResource ([#60026](https://github.com/angular/angular/pull/60026)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [56b551d273](https://github.com/angular/angular/commit/56b551d273a0978e1f2e2ef914c1d7ae942a28a8) | fix | incorrect spans for template literals ([#60323](https://github.com/angular/angular/pull/60323)) ([#60331](https://github.com/angular/angular/pull/60331)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [23ca88522b](https://github.com/angular/angular/commit/23ca88522bbc23e24a2b20e48e62edcce3a42eb6) | fix | handle transformed classes when generating HMR code ([#60298](https://github.com/angular/angular/pull/60298)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6dc41265fd](https://github.com/angular/angular/commit/6dc41265fd47df3fd0462bcd8f451eb6aea972ef) | fix | check whether application is destroyed before initializing event replay ([#59789](https://github.com/angular/angular/pull/59789)) |
| [bb12b30d52](https://github.com/angular/angular/commit/bb12b30d5213912f50f53aff60a11e6d47349c82) | fix | ensures immediate trigger fires properly with lazy loaded routes ([#60203](https://github.com/angular/angular/pull/60203)) |
| [b144dd946e](https://github.com/angular/angular/commit/b144dd946e38e52ce716aca7c6ba7c1a1a02f13d) | fix | fix removal of a container reference used in the component file ([#60210](https://github.com/angular/angular/pull/60210)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [15c42969fc](https://github.com/angular/angular/commit/15c42969fc42c76e3bd593201164183fb82d70f6) | fix | add missing peer dependency for `rxjs` ([#60308](https://github.com/angular/angular/pull/60308)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [7bcdf7c143](https://github.com/angular/angular/commit/7bcdf7c1435f766b2b0bbd383358ef2ddabf217a) | fix | update symbols ([#60233](https://github.com/angular/angular/pull/60233)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.1"></a>
# 19.2.1 (2025-03-05)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c2de5f68b3](https://github.com/angular/angular/commit/c2de5f68b3d3cd8a0c43b3c4325a1a1db874e132) | fix | clean up `onUrlChange` listener when root scope is destroyed ([#60004](https://github.com/angular/angular/pull/60004)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [1dd94476b3](https://github.com/angular/angular/commit/1dd94476b35d08e753766b1d0c5d8af5faa017a9) | fix | ensure template IDs are not reused if a source file changes ([#60152](https://github.com/angular/angular/pull/60152)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [1b3b05bf72](https://github.com/angular/angular/commit/1b3b05bf7294963aa50f83b726db620b250b1a5c) | fix | cache ComponentRef inputs and outputs ([#60156](https://github.com/angular/angular/pull/60156)) |
| [330c24aed9](https://github.com/angular/angular/commit/330c24aed92e4b916fb7ac6a91fb17c3ae728869) | fix | prevent invoking replay listeners on disconnected nodes ([#60103](https://github.com/angular/angular/pull/60103)) |
| [cfad089cc3](https://github.com/angular/angular/commit/cfad089cc359cddf08d462662d2a6bf3acab9b22) | fix | prevents event replay from being called on comment nodes ([#60130](https://github.com/angular/angular/pull/60130)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [3f0116607d](https://github.com/angular/angular/commit/3f0116607dc3ad7e31cb4d895a56094f77c82f5d) | fix | Forward the tags for quick info from the type definition ([#59524](https://github.com/angular/angular/pull/59524)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.2.0"></a>
# 19.2.0 (2025-02-26)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [3e39da593a](https://github.com/angular/angular/commit/3e39da593a0a0c047a2a03b8d5fcabf9dbace40f) | feat | introduce experimental `httpResource` ([#59876](https://github.com/angular/angular/pull/59876)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [5b20bab96d](https://github.com/angular/angular/commit/5b20bab96d20fe89b5cc4b4af28edbaae2604da1) | feat | Add Skip Hydration diagnostic. ([#59576](https://github.com/angular/angular/pull/59576)) |
| [fe8a68329b](https://github.com/angular/angular/commit/fe8a68329b50363f914a728579392f3fc68670a6) | feat | support untagged template literals in expressions ([#59230](https://github.com/angular/angular/pull/59230)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2588985f43](https://github.com/angular/angular/commit/2588985f433b20a6a5a8d239347291f5d6fb2451) | feat | pass signal node to throwInvalidWriteToSignalErrorFn ([#59600](https://github.com/angular/angular/pull/59600)) |
| [168516462a](https://github.com/angular/angular/commit/168516462a9673b158fcaa38b8ce17bf684a8ac9) | feat | support default value in `resource()` ([#59655](https://github.com/angular/angular/pull/59655)) |
| [bc2ad7bfd3](https://github.com/angular/angular/commit/bc2ad7bfd37a61992b550943de5da0eab2eec98b) | feat | support streaming resources ([#59573](https://github.com/angular/angular/pull/59573)) |
| [146ab9a76e](https://github.com/angular/angular/commit/146ab9a76e6b4d8db7d08d34e2571ba5207f8756) | feat | support TypeScript 5.8 ([#59830](https://github.com/angular/angular/pull/59830)) |
| [6c92d65349](https://github.com/angular/angular/commit/6c92d653493404a5f13aa59cde390bcbed973fb6) | fix | add `hasValue` narrowing to `ResourceRef` ([#59708](https://github.com/angular/angular/pull/59708)) |
| [96e602ebe9](https://github.com/angular/angular/commit/96e602ebe9cdf7355befad22c11f9f91e0436e01) | fix | cancel in-progress request when same value is assigned ([#59280](https://github.com/angular/angular/pull/59280)) |
| [6789c7ef94](https://github.com/angular/angular/commit/6789c7ef947952551d7598fe37a3d86093b75720) | fix | Defer afterRender until after first CD ([#59455](https://github.com/angular/angular/pull/59455)) ([#59551](https://github.com/angular/angular/pull/59551)) |
| [c87e581dd9](https://github.com/angular/angular/commit/c87e581dd9e240c88cea50f222942873bdccd01d) | fix | Don't run effects in check no changes pass ([#59455](https://github.com/angular/angular/pull/59455)) ([#59551](https://github.com/angular/angular/pull/59551)) |
| [127fc0dc84](https://github.com/angular/angular/commit/127fc0dc847a4e8b62be36cdd980a067c4da974f) | fix | fix `resource()`'s `previous.state` ([#59708](https://github.com/angular/angular/pull/59708)) |
| [b592b1b051](https://github.com/angular/angular/commit/b592b1b0516786c52c7d0638c4e7545b0de8a545) | fix | fix race condition in resource() ([#59851](https://github.com/angular/angular/pull/59851)) |
| [a299e02e91](https://github.com/angular/angular/commit/a299e02e9141cdc4d74185deb58308fa010bb36e) | fix | preserve tracing snapshot until tick finishes ([#59796](https://github.com/angular/angular/pull/59796)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [fa0c3e3210](https://github.com/angular/angular/commit/fa0c3e3210885a36e5c9e9eb76e821032f5cd215) | feat | support type set in form validators ([#45793](https://github.com/angular/angular/pull/45793)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [1cd3a7db83](https://github.com/angular/angular/commit/1cd3a7db83e1d05a31d23324676420b614cdabe2) | feat | add migration to convert templates to use self-closing tags ([#57342](https://github.com/angular/angular/pull/57342)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [e6cb411e43](https://github.com/angular/angular/commit/e6cb411e4393a4b1f5852d3d7c5b9622504399b1) | fix | automatically disable animations on the server ([#59762](https://github.com/angular/angular/pull/59762)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [fc5d187da5](https://github.com/angular/angular/commit/fc5d187da5e8895d60caa35b7b59e234998eddf0) | fix | decouple server from animations module ([#59762](https://github.com/angular/angular/pull/59762)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.7"></a>
# 19.1.7 (2025-02-19)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [e9f10eb4c9](https://github.com/angular/angular/commit/e9f10eb4c950692992098619b9628ecefd1b36ce) | fix | clean up `urlChanges` subscribers when root scope is destroyed ([#59703](https://github.com/angular/angular/pull/59703)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [16fc074689](https://github.com/angular/angular/commit/16fc074689d31ef6886c49525b020bc6c1529d0e) | fix | avoid crash in isolated transform operations ([#59869](https://github.com/angular/angular/pull/59869)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [ec1e4c3d94](https://github.com/angular/angular/commit/ec1e4c3d9430f5ea4380252098d2b4b71d8a950f) | fix | Fix typing on `FormRecord`. ([#59993](https://github.com/angular/angular/pull/59993)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.6"></a>
# 19.1.6 (2025-02-12)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [01f669a274](https://github.com/angular/angular/commit/01f669a27425c5034a04274763cc60801f961aa2) | fix | handle tracking expressions requiring temporary variables ([#58520](https://github.com/angular/angular/pull/58520)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [dcfb9f1959](https://github.com/angular/angular/commit/dcfb9f1959164baf45f5f954b4bf681d650d8a2d) | fix | handle deferred blocks with shared dependencies correctly ([#59926](https://github.com/angular/angular/pull/59926)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [cab7a9b69c](https://github.com/angular/angular/commit/cab7a9b69c3a5d789432a87a554e8489c78a0f15) | fix | invalidate HMR component if replacement throws an error ([#59854](https://github.com/angular/angular/pull/59854)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [710759ddcc](https://github.com/angular/angular/commit/710759ddcc0ecbad68deb20821b535fd5deb69c6) | fix | account for let declarations in control flow migration ([#59861](https://github.com/angular/angular/pull/59861)) |
| [46f36a58bf](https://github.com/angular/angular/commit/46f36a58bf3a7b9131b6330e84d4adb3e73f3601) | fix | count used dependencies inside existing control flow ([#59861](https://github.com/angular/angular/pull/59861)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.5"></a>
# 19.1.5 (2025-02-06)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [d7b5c597ffc](https://github.com/angular/angular/commit/d7b5c597ffcb6469ae3f08a97e7790599d569cc4) | fix | gracefully fall back if const enum cannot be passed through ([#59815](https://github.com/angular/angular/pull/59815)) |
| [53a4668b58b](https://github.com/angular/angular/commit/53a4668b58b645e41baddc5b67d52ede21c8e945) | fix | handle const enums used inside HMR data ([#59815](https://github.com/angular/angular/pull/59815)) |
| [976125e0b4c](https://github.com/angular/angular/commit/976125e0b4cf4e7fb4621a7203e3f43b009885f0) | fix | handle enum members without initializers in partial evaluator ([#59815](https://github.com/angular/angular/pull/59815)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.4"></a>
# 19.1.4 (2025-01-29)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [544b9ee7ca0](https://github.com/angular/angular/commit/544b9ee7ca00925e62b7c74cf7930777a10aaf76) | fix | check whether application is destroyed before printing hydration stats ([#59716](https://github.com/angular/angular/pull/59716)) |
| [d6e78c072dc](https://github.com/angular/angular/commit/d6e78c072dcb5b0b6efc2b098fdb911ccddf6e81) | fix | ensure type is preserved during HMR ([#59700](https://github.com/angular/angular/pull/59700)) |
| [c2436702df9](https://github.com/angular/angular/commit/c2436702df980bbf2db0fe3bee4c72860edb4e63) | fix | fixes test timer-based test flakiness in CI ([#59674](https://github.com/angular/angular/pull/59674)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [44180645992](https://github.com/angular/angular/commit/44180645992f7d9018ccb2d7663530b3cffde36b) | fix | not setting initial value on signal-based input ([#59773](https://github.com/angular/angular/pull/59773)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [1828a840620](https://github.com/angular/angular/commit/1828a8406201827e52549c8afa487bf6364a70c3) | fix | prepend `baseHref` to `sourceMappingURL` in CSS content ([#59730](https://github.com/angular/angular/pull/59730)) |
| [1c84cbca30e](https://github.com/angular/angular/commit/1c84cbca30e6606e6df3f40346989d9434d89bc6) | fix | Update pseudoevent created by createMouseSpecialEvent to populate `_originalEvent` property ([#59690](https://github.com/angular/angular/pull/59690)) |
| [12256574626](https://github.com/angular/angular/commit/12256574626f04f5fe2b41e805f7bdc93d62df0a) | fix | Update pseudoevent created by createMouseSpecialEvent to populate `_originalEvent` property ([#59690](https://github.com/angular/angular/pull/59690)) |
| [3f4d5f636aa](https://github.com/angular/angular/commit/3f4d5f636aac90cabe32ff6c4d75180ced99eb97) | fix | Update pseudoevent created by createMouseSpecialEvent to populate `_originalEvent` property ([#59690](https://github.com/angular/angular/pull/59690)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [e3da35ec749](https://github.com/angular/angular/commit/e3da35ec749395239731158f89e29d47e7a9ef36) | fix | prevent error handling when injector is destroyed ([#59457](https://github.com/angular/angular/pull/59457)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [522acbf3d7e](https://github.com/angular/angular/commit/522acbf3d7ed502e7802117776acda3529a9a2b4) | fix | add missing `rxjs` peer dependency ([#59747](https://github.com/angular/angular/pull/59747)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.3"></a>
# 19.1.3 (2025-01-22)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [ecfb74d287](https://github.com/angular/angular/commit/ecfb74d287bec7bec37d0b476b321b047bef2c43) | fix | handle :host-context with comma-separated child selector ([#59276](https://github.com/angular/angular/pull/59276)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [53160e504d](https://github.com/angular/angular/commit/53160e504df44b05f59cacd9afeb40a0e627b744) | fix | extract parenthesized dependencies during HMR ([#59644](https://github.com/angular/angular/pull/59644)) |
| [39690969af](https://github.com/angular/angular/commit/39690969af14914df0c9b5a009b2df920f5c03e7) | fix | handle conditional expressions when extracting dependencies ([#59637](https://github.com/angular/angular/pull/59637)) |
| [78af7a5059](https://github.com/angular/angular/commit/78af7a5059cc3e03704ba63f8512351a40470557) | fix | handle new expressions when extracting dependencies ([#59637](https://github.com/angular/angular/pull/59637)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [408af24ff3](https://github.com/angular/angular/commit/408af24ff3490926e9992cb4f1f71914d71ad6ad) | fix | capture self-referencing component during HMR ([#59644](https://github.com/angular/angular/pull/59644)) |
| [d7575c201c](https://github.com/angular/angular/commit/d7575c201cfd61010952b3a633eec03e32f58220) | fix | replace metadata in place during HMR ([#59644](https://github.com/angular/angular/pull/59644)) |
| [26f6d4c485](https://github.com/angular/angular/commit/26f6d4c485b566d7bc127c78cc163c376d0fe6b5) | fix | skip component ID collision warning during SSR ([#59625](https://github.com/angular/angular/pull/59625)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [a62c84bc18](https://github.com/angular/angular/commit/a62c84bc188d41ea24cf0eca14ac18c4b917ccd0) | fix | avoid applying the same replacements twice when cleaning up unused imports ([#59656](https://github.com/angular/angular/pull/59656)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [b2b3816cb1](https://github.com/angular/angular/commit/b2b3816cb1c5c573dc9368f05fd2971671d7159f) | fix | clear renderer cache during HMR when using async animations ([#59644](https://github.com/angular/angular/pull/59644)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.2"></a>
# 19.1.2 (2025-01-20)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [8dcd889987](https://github.com/angular/angular/commit/8dcd88998700a94115a542462e6ae6beedbfbd9d) | fix | update `@ng/component` URL to be relative ([#59620](https://github.com/angular/angular/pull/59620)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [95a05bb202](https://github.com/angular/angular/commit/95a05bb2021acab02df3468212adf023d331a688) | fix | disable tree shaking during HMR ([#59595](https://github.com/angular/angular/pull/59595)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a4eb74c79c](https://github.com/angular/angular/commit/a4eb74c79cca802d8179118cf4d53c73285baadb) | fix | animation sometimes renderer not being destroyed during HMR ([#59574](https://github.com/angular/angular/pull/59574)) |
| [906413aba3](https://github.com/angular/angular/commit/906413aba31459e6499420ed14519d1280e182ad) | fix | change `Resource` to use explicit `undefined` in its typings ([#59024](https://github.com/angular/angular/pull/59024)) |
| [4eb541837c](https://github.com/angular/angular/commit/4eb541837cf28ce1950d782213291165a2436410) | fix | cleanup `_ejsa` when app is destroyed ([#59492](https://github.com/angular/angular/pull/59492)) |
| [5497102769](https://github.com/angular/angular/commit/549710276969ec4cf8c1e3d2f19d1fe9f755976e) | fix | cleanup stash listener when app is destroyed ([#59598](https://github.com/angular/angular/pull/59598)) |
| [266a8f2f2e](https://github.com/angular/angular/commit/266a8f2f2ebf9f5e310ba5de695be5072790e1e5) | fix | handle shadow DOM encapsulated component with HMR ([#59597](https://github.com/angular/angular/pull/59597)) |
| [6f7716268a](https://github.com/angular/angular/commit/6f7716268afa5146f2b2d0dbbea146defa9acfef) | fix | HMR not matching component that injects ViewContainerRef ([#59596](https://github.com/angular/angular/pull/59596)) |
| [d12a186d53](https://github.com/angular/angular/commit/d12a186d531b41e6a16f84446a1d54eaed010fc4) | fix | treat exceptions in `equal` as part of computation ([#55818](https://github.com/angular/angular/pull/55818)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.1"></a>
# 19.1.1 (2025-01-16)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [357795cb96](https://github.com/angular/angular/commit/357795cb96a1cd138ec263c468c9de8ca8b2af9c) | fix | run HMR replacement in the zone ([#59562](https://github.com/angular/angular/pull/59562)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [eb0b1851f4](https://github.com/angular/angular/commit/eb0b1851f494adfe72f583763a44bd2528a5956c) | fix | roll back HMR fix ([#59557](https://github.com/angular/angular/pull/59557)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.1.0"></a>
# 19.1.0 (2025-01-15)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [e4c50b3bea](https://github.com/angular/angular/commit/e4c50b3bea22ca2afba74465893c36730952f4b9) | feat | expose component instance in NgComponentOutlet ([#58698](https://github.com/angular/angular/pull/58698)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [ceadd28ea1](https://github.com/angular/angular/commit/ceadd28ea12140e8e78cdb706aff0487f5a87a3c) | fix | allow $any in two-way bindings ([#59362](https://github.com/angular/angular/pull/59362)) |
| [aed49ddaaa](https://github.com/angular/angular/commit/aed49ddaaa40d6e6816198b47ceada4e98cd636c) | fix | use chunk origin in template HMR request URL ([#59459](https://github.com/angular/angular/pull/59459)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [c5c20e9d86](https://github.com/angular/angular/commit/c5c20e9d86d72b33840dcf0adea02876437a589f) | fix | check event side of two-way bindings ([#59002](https://github.com/angular/angular/pull/59002)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d010e11b73](https://github.com/angular/angular/commit/d010e11b735562ded439989ddb84cc83c6c00e81) | feat | add event listener options to renderer ([#59092](https://github.com/angular/angular/pull/59092)) |
| [57f3550219](https://github.com/angular/angular/commit/57f3550219f2a57c7c26c9183e48ee66845e0439) | feat | add utility for resolving defer block information to ng global ([#59184](https://github.com/angular/angular/pull/59184)) |
| [22f191f763](https://github.com/angular/angular/commit/22f191f76339a08bb8f0f2dfbc60dde0f2e38e73) | feat | extend the set of profiler events ([#59183](https://github.com/angular/angular/pull/59183)) |
| [e894a5daea](https://github.com/angular/angular/commit/e894a5daea401b4e1173b0e66557ae40140eb9a0) | feat | set kind field on template and effect nodes ([#58865](https://github.com/angular/angular/pull/58865)) |
| [bd1f1294ae](https://github.com/angular/angular/commit/bd1f1294aeb0d47b24421b7b7a608988689a459f) | feat | support TypeScript 5.7 ([#58609](https://github.com/angular/angular/pull/58609)) |
| [9870b643bf](https://github.com/angular/angular/commit/9870b643bff46f089a3f0a30514fb7e062a66d56) | fix | Defer afterRender until after first CD ([#58250](https://github.com/angular/angular/pull/58250)) |
| [a5fc962094](https://github.com/angular/angular/commit/a5fc9620948c59da2146d46d27de388839b93254) | fix | Don't run effects in check no changes pass ([#58250](https://github.com/angular/angular/pull/58250)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [d298d25426](https://github.com/angular/angular/commit/d298d254269ff759111fbdef7736bc8b713638bc) | feat | add schematic to clean up unused imports ([#59353](https://github.com/angular/angular/pull/59353)) |
| [14fb8ce4c0](https://github.com/angular/angular/commit/14fb8ce4c00fc458cfbe1d7f2c85638c6165b636) | fix | resolve text replacement issue ([#59452](https://github.com/angular/angular/pull/59452)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [8c5db3cfb7](https://github.com/angular/angular/commit/8c5db3cfb75700dd64f4c8c073554c7086835950) | fix | avoid circular DI error in async renderer ([#59256](https://github.com/angular/angular/pull/59256)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [52a6710f54](https://github.com/angular/angular/commit/52a6710f54bcec81f4cde23a78b9f78d038156c5) | fix | complete router `events` on dispose ([#59327](https://github.com/angular/angular/pull/59327)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.7"></a>
# 19.0.7 (2025-01-15)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [2b4b7c3ebf](https://github.com/angular/angular/commit/2b4b7c3ebfb2d4f4fd96fd2f1890b67c832505fd) | fix | handle more node types when extracting dependencies ([#59445](https://github.com/angular/angular/pull/59445)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [f893d07232](https://github.com/angular/angular/commit/f893d0723262d699979d55e43e4ddbcf64a3fc13) | fix | destroy renderer when replacing styles during HMR ([#59514](https://github.com/angular/angular/pull/59514)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [eb2fcd1896](https://github.com/angular/angular/commit/eb2fcd1896e0b834b86fe79e8d806bdab24aabcc) | fix | incorrect stats when migrating queries with best effort mode ([#59463](https://github.com/angular/angular/pull/59463)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.6"></a>
# 19.0.6 (2025-01-08)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [06a55e9817](https://github.com/angular/angular/commit/06a55e98173ff7bdd4e2ac1263309f9b935240f0) | fix | account for more expression types when determining HMR dependencies ([#59323](https://github.com/angular/angular/pull/59323)) |
| [17fb20f85d](https://github.com/angular/angular/commit/17fb20f85db9f3c172c194c0436644f34b7176b1) | fix | preserve defer block dependencies during HMR when class metadata is disabled ([#59313](https://github.com/angular/angular/pull/59313)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [07afce81b8](https://github.com/angular/angular/commit/07afce81b8ce28d1b308ff25017a4d4993881f36) | fix | Ensure that a destroyed `effect` never run. ([#59415](https://github.com/angular/angular/pull/59415)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [dbb8980d03](https://github.com/angular/angular/commit/dbb8980d03485ad1cf0e19503c4e770b1ba0767e) | fix | avoid circular DI error in async renderer ([#59271](https://github.com/angular/angular/pull/59271)) |
| [6d00efde95](https://github.com/angular/angular/commit/6d00efde952971573359b32cab06d0a513600fe0) | fix | styles not replaced during HMR when using animations renderer ([#59393](https://github.com/angular/angular/pull/59393)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [144bccb687](https://github.com/angular/angular/commit/144bccb6872ece8fa1cf4954b5839054ccf20aa1) | fix | avoid component ID collisions with user code ([#59300](https://github.com/angular/angular/pull/59300)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.5"></a>
# 19.0.5 (2024-12-18)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3793218e77](https://github.com/angular/angular/commit/3793218e77d699ddfae95a53ad048d4bfb9f042c) | fix | avoid triggering `on timer` and `on idle` on the server ([#59177](https://github.com/angular/angular/pull/59177)) |
| [cfc96ed82c](https://github.com/angular/angular/commit/cfc96ed82cbe958ea7548718f76a2e7a3d6826a9) | fix | Fix nested timer serialization ([#59173](https://github.com/angular/angular/pull/59173)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [9085a8fbd8](https://github.com/angular/angular/commit/9085a8fbd8cb61e3ce45adfa9ca2e96ba0be6f62) | fix | Warn user when transfer state happens more than once ([#58935](https://github.com/angular/angular/pull/58935)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.4"></a>
# 19.0.4 (2024-12-12)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7e612171709](https://github.com/angular/angular/commit/7e6121717098462b4f53dc7212064243f2bcf024) | fix | consider pre-release versions when detecting feature support ([#59061](https://github.com/angular/angular/pull/59061)) |
| [cd764a31152](https://github.com/angular/angular/commit/cd764a31152004d37aa621efc4990c090d86f1e0) | fix | error in unused standalone imports diagnostic ([#59064](https://github.com/angular/angular/pull/59064)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [34ded10fa60](https://github.com/angular/angular/commit/34ded10fa6061a12531de8837a436cf0a1ac20b8) | fix | Fix a bug where snapshotted functions are being run twice if they return a nullish/falsey value. ([#59073](https://github.com/angular/angular/pull/59073)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [ae0802d63c5](https://github.com/angular/angular/commit/ae0802d63c50307791e8a5d765573836dfe89075) | fix | collect external component styles from server rendering ([#59031](https://github.com/angular/angular/pull/59031)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.3"></a>
# 19.0.3 (2024-12-04)

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.2"></a>
# 19.0.2 (2024-12-04)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [9f99196d23](https://github.com/angular/angular/commit/9f99196d239479bcba0b42a18a5155ed5a1764ff) | fix | account for multiple generated namespace imports in HMR ([#58924](https://github.com/angular/angular/pull/58924)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4792db9a6d](https://github.com/angular/angular/commit/4792db9a6d3a7dc076c9b200cd31a53a4fd30683) | fix | Explicitly manage TracingSnapshot lifecycle and dispose of it once it's been used. ([#58929](https://github.com/angular/angular/pull/58929)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [7b5bacc228](https://github.com/angular/angular/commit/7b5bacc2285803e6ac9691c2dae2361ddca9da9a) | fix | class content being deleted in some edge cases ([#58959](https://github.com/angular/angular/pull/58959)) |
| [d1cbdd6acb](https://github.com/angular/angular/commit/d1cbdd6acb228773e0fb33958978a14e12be178f) | fix | correctly strip away parameters surrounded by comments in inject migration ([#58959](https://github.com/angular/angular/pull/58959)) |
| [e17ff71c31](https://github.com/angular/angular/commit/e17ff71c318a1b32d5207b7516856f330f2bcf5a) | fix | don't migrate classes with parameters that can't be injected ([#58959](https://github.com/angular/angular/pull/58959)) |
| [7c5f990001](https://github.com/angular/angular/commit/7c5f990001c4aac9f48c5461421579c398295356) | fix | inject migration aggressively removing imports ([#58959](https://github.com/angular/angular/pull/58959)) |
| [4392ccedf9](https://github.com/angular/angular/commit/4392ccedf997e79486af7ad60172eea98ed3351f) | fix | inject migration dropping code if everything except super is removed ([#58959](https://github.com/angular/angular/pull/58959)) |
| [9cbebc6dda](https://github.com/angular/angular/commit/9cbebc6dda89d2fdfc52799aef1ea895dcac2d00) | fix | preserve type literals and tuples in inject migrations ([#58959](https://github.com/angular/angular/pull/58959)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [f3c388ecda](https://github.com/angular/angular/commit/f3c388ecda5e836946031a554827cdaee9801734) | fix | remove peer dependency on animations ([#58997](https://github.com/angular/angular/pull/58997)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.13"></a>
# 18.2.13 (2024-11-26)
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [06d70a25ea](https://github.com/angular/angular/commit/06d70a25ea7a6ef32f47516fcb8542d98ac45e14) | fix | take care of tests that import both HttpClientModule & HttpClientTestingModule. ([#58777](https://github.com/angular/angular/pull/58777)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.1"></a>
# 19.0.1 (2024-11-26)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [fb1fa8b0fc](https://github.com/angular/angular/commit/fb1fa8b0fc04c9cfac6551ca27bee89dcd7c72ac) | fix | more accurate diagnostics for host binding parser errors ([#58870](https://github.com/angular/angular/pull/58870)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [502ee0e722](https://github.com/angular/angular/commit/502ee0e7221a9e7cfa0fa3bd92298d3b650a7713) | fix | correctly clear template HMR internal renderer cache ([#58724](https://github.com/angular/angular/pull/58724)) |
| [99715104a1](https://github.com/angular/angular/commit/99715104a1a787c3899dfbfac6b44f28c7d24356) | fix | correctly perform lazy routes migration for components with additional decorators ([#58796](https://github.com/angular/angular/pull/58796)) |
| [118803035f](https://github.com/angular/angular/commit/118803035f366acdffc577ec857b888f764bb338) | fix | Ensure _tick is always run within the TracingSnapshot. ([#58881](https://github.com/angular/angular/pull/58881)) |
| [08b9452f01](https://github.com/angular/angular/commit/08b9452f012b2ef660f767c2f0a4bf86bb15bb61) | fix | Ensure resource sets an error ([#58855](https://github.com/angular/angular/pull/58855)) |
| [84f45ea3ff](https://github.com/angular/angular/commit/84f45ea3ffe02003350c6c19fdafdc6f4d521ccb) | fix | make component id generation more stable between client and server builds ([#58813](https://github.com/angular/angular/pull/58813)) |
| [d3491c7cee](https://github.com/angular/angular/commit/d3491c7cee3d110da1adb51f8047b4e1976ece71) | fix | Prevents race condition of cleanup for incremental hydration ([#58722](https://github.com/angular/angular/pull/58722)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [4dfe5b6cef](https://github.com/angular/angular/commit/4dfe5b6cefd7901a466b37b660f8b3a051a06cb3) | fix | work around TypeScript 5.7 issue ([#58731](https://github.com/angular/angular/pull/58731)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [a983865bff](https://github.com/angular/angular/commit/a983865bffa828a982ef7e56204924d9c2989ead) | fix | add fix for individual unused imports ([#58719](https://github.com/angular/angular/pull/58719)) |
| [e6e7a4e22b](https://github.com/angular/angular/commit/e6e7a4e22b0a654808e5eb88a30cd6effa383332) | fix | allow fixes to run without template info ([#58719](https://github.com/angular/angular/pull/58719)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5ce10264a4](https://github.com/angular/angular/commit/5ce10264a434ffc8e31cdc68208d2c3c7f8378ed) | fix | fix provide-initializer migration when using useFactory ([#58518](https://github.com/angular/angular/pull/58518)) |
| [d4f5c85f60](https://github.com/angular/angular/commit/d4f5c85f60133550303d59b3f9e3e34f14ca63ce) | fix | handle parameters with initializers in inject migration ([#58769](https://github.com/angular/angular/pull/58769)) |
| [a6d2d2dc10](https://github.com/angular/angular/commit/a6d2d2dc104608f14c3850b21bc23ba75ca04e4d) | fix | Mark hoisted properties as removed in inject migration ([#58804](https://github.com/angular/angular/pull/58804)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="19.0.0"></a>
# 19.0.0 (2024-11-19)

Blog post: https://blog.angular.dev/meet-angular-v19-7b29dfd05b84

## Breaking Changes
### compiler
- `this.foo` property reads no longer refer to template context variables. If you intended to read the template variable, do not use `this.`.
- changes to CSS selectors parsing where introduced, mainly to: pseudo selectors `:where()` and `:is()`,
  parsing of `:host` and `host-context`, parsing selectors within pseudo selector arguments (for instance comma separated selectors).
  These changes could lead to a different specificity of the resulting selectors and/or previously broken selectors being applied now,
  for example `:where(:host)` used to transform to `:where()[ng-host]` and is being `:where([ng-host])` now. Unlike the previous outcome,
  the new result can target elements and therefore could lead to breakages.
### core
- Angular directives, components and pipes are now standalone by default.
   * Specify `standalone: false` for declarations that are currently declared in `@NgModule`s.
   * `ng update` for v19 will take care of this automatically.
- TypeScript versions less than 5.5 are no longer supported.
- Timing changes for `effect` API (in developer preview):

  * effects which are triggered outside of change detection run as part of
    the change detection process instead of as a microtask. Depending on the
    specifics of application/test setup, this can result in them executing
    earlier or later (or requiring additional test steps to trigger; see below
    examples).

  * effects which are triggered during change detection (e.g. by input
    signals) run _earlier_, before the component's template.

- `ExperimentalPendingTasks` has been renamed to `PendingTasks`.
- The `autoDetect` feature of `ComponentFixture` will now
  attach the fixture to the `ApplicationRef`. As a result, errors during
  automatic change detection of the fixture be reported to the `ErrorHandler`.
  This change may cause custom error handlers to observe new failures that were previously unreported.
- `createComponent` will now render default fallback with empty `projectableNodes`.

  * When passing an empty array to `projectableNodes` in the `createComponent` API, the default fallback content
  of the `ng-content` will be rendered if present. To prevent rendering the default content, pass `document.createTextNode('')` as a `projectableNode`.

  ```ts
  // The first ng-content will render the default fallback content if present
  createComponent(MyComponent. { projectableNodes: [[], [secondNode]] });

  // To prevent projecting the default fallback content:
  createComponent(MyComponent. { projectableNodes: [[document.createTextNode('')], [secondNode]] });

  ```
- Errors that are thrown during `ApplicationRef.tick`
  will now be rethrown when using `TestBed`. These errors should be
  resolved by ensuring the test environment is set up correctly to
  complete change detection successfully. There are two alternatives to
  catch the errors:

  * Instead of waiting for automatic change detection to happen, trigger
    it synchronously and expect the error. For example, a jasmine test
    could write `expect(() => TestBed.inject(ApplicationRef).tick()).toThrow()`
  * `TestBed` will reject any outstanding `ComponentFixture.whenStable` promises. A jasmine test,
  for example, could write `expectAsync(fixture.whenStable()).toBeRejected()`.

  As a last resort, you can configure errors to _not_ be rethrown by
  setting `rethrowApplicationErrors` to `false` in `TestBed.configureTestingModule`.
- The timers that are used for zone coalescing and hybrid
  mode scheduling (which schedules an application state synchronization
  when changes happen outside the Angular zone) will now run in the zone
  above Angular rather than the root zone. This will mostly affect tests
  which use `fakeAsync`: these timers will now be visible to `fakeAsync`
  and can be affected by `tick` or `flush`.
- The deprecated `factories` property in `KeyValueDiffers` has been removed.
### elements
- as part of switching away from custom CD behavior to the
  hybrid scheduler, timing of change detection around custom elements has
  changed subtly. These changes make elements more efficient, but can cause
  tests which encoded assumptions about how or when elements would be checked
  to require updating.
### localize
- The `name` option in the `ng add `@localize`` schematic has been removed in favor of the `project` option.
### platform-browser
- The deprecated `BrowserModule.withServerTransition` method has been removed. Please use the `APP_ID` DI token to set the application id instead.
### router
- The `Router.errorHandler` property has been removed.
  Adding an error handler should be configured in either
  `withNavigationErrorHandler` with `provideRouter` or the `errorHandler`
  property in the extra options of `RouterModule.forRoot`. In addition,
  the error handler cannot be used to change the return value of the
  router navigation promise or prevent it from rejecting. Instead, if you
  want to prevent the promise from rejecting, use `resolveNavigationPromiseOnError`.
- The return type of the `Resolve` interface now includes
  `RedirectCommand`.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [24c6373820](https://github.com/angular/angular/commit/24c6373820231faf9d012a2e4d7ea945d3e8513b) | feat | add optional rounded transform support in cloudinary image loader ([#55364](https://github.com/angular/angular/pull/55364)) |
| [50f08e6c4b](https://github.com/angular/angular/commit/50f08e6c4bf1caeeb08d3505ce7fabd466b9c76b) | feat | automatically use sizes auto in NgOptimizedImage ([#57479](https://github.com/angular/angular/pull/57479)) |
| [13c13067bc](https://github.com/angular/angular/commit/13c13067bc3ed50cb80b0a86e62655448adb3051) | feat | disable keyvalue sorting using null compareFn ([#57487](https://github.com/angular/angular/pull/57487)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [a2e4ee0cb3](https://github.com/angular/angular/commit/a2e4ee0cb3d40cadc05e28d58b06853973944456) | feat | add diagnostic for unused standalone imports ([#57605](https://github.com/angular/angular/pull/57605)) |
| [0c9d721ac1](https://github.com/angular/angular/commit/0c9d721ac157662b2602cf0278ba4b79325f6882) | feat | add support for the `typeof` keyword in template expressions. ([#58183](https://github.com/angular/angular/pull/58183)) |
| [09f589f000](https://github.com/angular/angular/commit/09f589f0006f4b428b675b83c12c0dc8ebb7e45f) | fix | `this.a` should always refer to class property `a` ([#55183](https://github.com/angular/angular/pull/55183)) |
| [98804fd4be](https://github.com/angular/angular/commit/98804fd4beb6292f5a50ce728424fdb33c47f654) | fix | add more specific matcher for hydrate never block ([#58360](https://github.com/angular/angular/pull/58360)) |
| [b25121ee4a](https://github.com/angular/angular/commit/b25121ee4aba427954fef074a967b9332654be84) | fix | avoid having to duplicate core environment ([#58444](https://github.com/angular/angular/pull/58444)) |
| [560282aa9b](https://github.com/angular/angular/commit/560282aa9b3204ad8311017905beed63072c7303) | fix | control flow nodes with root at the end projected incorrectly ([#58607](https://github.com/angular/angular/pull/58607)) |
| [2be161d015](https://github.com/angular/angular/commit/2be161d015ce6bab0142b6e6c34a8ede6341f627) | fix | fix `:host` parsing in pseudo-selectors ([#58681](https://github.com/angular/angular/pull/58681)) |
| [806a61b5a6](https://github.com/angular/angular/commit/806a61b5a619d98c0226ba6a566b1562f6e16e5a) | fix | fix multiline selectors ([#58681](https://github.com/angular/angular/pull/58681)) |
| [a3cb530d84](https://github.com/angular/angular/commit/a3cb530d846bf4d15802b9f42b6dee5c9a3a08ee) | fix | handle typeof expressions in serializer ([#58217](https://github.com/angular/angular/pull/58217)) |
| [ba4340875a](https://github.com/angular/angular/commit/ba4340875ac8e338ff1390fc7897eecc704ef7c5) | fix | ignore placeholder-only i18n messages ([#58154](https://github.com/angular/angular/pull/58154)) |
| [e5d3abb298](https://github.com/angular/angular/commit/e5d3abb29842412f82a67562aceff245d493ec53) | fix | resolve `:host:host-context(.foo)` ([#58681](https://github.com/angular/angular/pull/58681)) |
| [80f56954ce](https://github.com/angular/angular/commit/80f56954cecf763e36bdcfbbd592a82d693eeef7) | fix | transform chained pseudo-selectors ([#58681](https://github.com/angular/angular/pull/58681)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [d9687f43dd](https://github.com/angular/angular/commit/d9687f43dd2ccfcf7dd3ee4f9066ce727f3224c6) | feat | 'strictStandalone' flag enforces standalone ([#57935](https://github.com/angular/angular/pull/57935)) |
| [9e87593055](https://github.com/angular/angular/commit/9e87593055a5314a67090bd15d5552c23b538050) | feat | ensure template style elements are preprocessed as inline styles ([#57429](https://github.com/angular/angular/pull/57429)) |
| [231e6ff6ca](https://github.com/angular/angular/commit/231e6ff6ca0dae0289a03615bcaed29455c2d4b8) | feat | generate the HMR replacement module ([#58205](https://github.com/angular/angular/pull/58205)) |
| [dbe612f2cd](https://github.com/angular/angular/commit/dbe612f2cd59adecdab3abb270b014c4b26e472c) | fix | disable standalone by default on older versions of Angular ([#58405](https://github.com/angular/angular/pull/58405)) |
| [d4d76ead80](https://github.com/angular/angular/commit/d4d76ead802837bc6cc7908bc9ebfefa73eb9969) | fix | do not fail fatal when references to non-existent module are discovered ([#58515](https://github.com/angular/angular/pull/58515)) |
| [33fe252c58](https://github.com/angular/angular/commit/33fe252c588ee94d6ef99e8070d35c483ec24fda) | fix | do not report unused declarations coming from an imported array ([#57940](https://github.com/angular/angular/pull/57940)) |
| [fb44323c51](https://github.com/angular/angular/commit/fb44323c51da5a86853aafd8a70ce0c25d6c0d7f) | fix | incorrectly generating relative file paths on case-insensitive platforms ([#58150](https://github.com/angular/angular/pull/58150)) |
| [22cd6869ef](https://github.com/angular/angular/commit/22cd6869ef453c342b206f84e857ef6c34922fa5) | fix | make the unused imports diagnostic easier to read ([#58468](https://github.com/angular/angular/pull/58468)) |
| [9bbb01c85e](https://github.com/angular/angular/commit/9bbb01c85e763b0457456a2393a834db15008671) | fix | report individual diagnostics for unused imports ([#58589](https://github.com/angular/angular/pull/58589)) |
| [4716c3b966](https://github.com/angular/angular/commit/4716c3b9660b01f4ef3642fb774270b7f4a13d1a) | perf | reduce duplicate component style resolution ([#57502](https://github.com/angular/angular/pull/57502)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6ea8e1e9aa](https://github.com/angular/angular/commit/6ea8e1e9aae028572873cf97aa1949c8153f458f) | feat | Add a schematics to migrate to `standalone: false`. ([#57643](https://github.com/angular/angular/pull/57643)) |
| [3ebe6b4ad4](https://github.com/angular/angular/commit/3ebe6b4ad401337e18619edc34477ae98226fa3e) | feat | Add async `run` method on `ExperimentalPendingTasks` ([#56546](https://github.com/angular/angular/pull/56546)) |
| [69fc5ae922](https://github.com/angular/angular/commit/69fc5ae9229b872a9ad70eb920087af2a378fead) | feat | Add incremental hydration public api ([#58249](https://github.com/angular/angular/pull/58249)) |
| [8ebbae88ca](https://github.com/angular/angular/commit/8ebbae88ca48b8aa78cd85deedbed19d44b8227e) | feat | Add rxjs operator prevent app stability until an event ([#56533](https://github.com/angular/angular/pull/56533)) |
| [19edf2c057](https://github.com/angular/angular/commit/19edf2c057f7587bc16812685d31a556521ad414) | feat | add syntactic sugar for initializers ([#53152](https://github.com/angular/angular/pull/53152)) |
| [c93b510f9b](https://github.com/angular/angular/commit/c93b510f9b2e23aa7a3848a04c05249fde14a9b1) | feat | allow passing `undefined` without needing to include it in the type argument of `input` ([#57621](https://github.com/angular/angular/pull/57621)) |
| [ab25a192ba](https://github.com/angular/angular/commit/ab25a192ba664863ad68d224b9b2df78da22769a) | feat | allow running output migration on a subset of paths ([#58299](https://github.com/angular/angular/pull/58299)) |
| [fc59e2a7b7](https://github.com/angular/angular/commit/fc59e2a7b7afa491a5ea740284a742574805eb36) | feat | change effect() execution timing & no-op `allowSignalWrites` ([#57874](https://github.com/angular/angular/pull/57874)) |
| [8bcc663a53](https://github.com/angular/angular/commit/8bcc663a53888717cdf4ce0c23404caa00abb1b2) | feat | drop support for TypeScript 5.4 ([#57577](https://github.com/angular/angular/pull/57577)) |
| [18d8d44b1f](https://github.com/angular/angular/commit/18d8d44b1f3d56a4eda68f2cafded7529e08d0f1) | feat | experimental `resource()` API for async dependencies ([#58255](https://github.com/angular/angular/pull/58255)) |
| [9762b24b5e](https://github.com/angular/angular/commit/9762b24b5e8d7ab3ed2321959492a77b01d8ae57) | feat | experimental impl of `rxResource()` ([#58255](https://github.com/angular/angular/pull/58255)) |
| [6b8c494d05](https://github.com/angular/angular/commit/6b8c494d05e545830fffb9626153480af6339ddc) | feat | flipping the default value for `standalone` to `true` ([#58169](https://github.com/angular/angular/pull/58169)) |
| [e6e5d29e83](https://github.com/angular/angular/commit/e6e5d29e830a0a74d7677d5f2345f29391064853) | feat | initial version of the output migration ([#57604](https://github.com/angular/angular/pull/57604)) |
| [be2e49639b](https://github.com/angular/angular/commit/be2e49639bda831831ad62d49253db942a83fd46) | feat | introduce `afterRenderEffect` ([#57549](https://github.com/angular/angular/pull/57549)) |
| [ec386e7f12](https://github.com/angular/angular/commit/ec386e7f1216e0047392e75ab686b310b073eb42) | feat | introduce debugName optional arg to framework signal functions ([#57073](https://github.com/angular/angular/pull/57073)) |
| [8311f00faa](https://github.com/angular/angular/commit/8311f00faaf282d1a5b1ddca29247a2fba94a692) | feat | introduce the reactive linkedSignal ([#58189](https://github.com/angular/angular/pull/58189)) |
| [1b1519224d](https://github.com/angular/angular/commit/1b1519224d10c1cd25d05d7b958772b9adee1e1a) | feat | mark input, output and model APIs as stable ([#57804](https://github.com/angular/angular/pull/57804)) |
| [a7eff3ffaa](https://github.com/angular/angular/commit/a7eff3ffaaecbcb3034130d475ff7b4e41a1e1cc) | feat | mark signal-based query APIs as stable ([#57921](https://github.com/angular/angular/pull/57921)) |
| [a1f229850a](https://github.com/angular/angular/commit/a1f229850ad36da009f772faa831da173a60268c) | feat | migrate ExperimentalPendingTasks to PendingTasks ([#57533](https://github.com/angular/angular/pull/57533)) |
| [3f1e7ab6ae](https://github.com/angular/angular/commit/3f1e7ab6ae984149004c449c04301b434ea64d2a) | feat | promote `outputFromObservable` & `outputToObservable` to stable. ([#58214](https://github.com/angular/angular/pull/58214)) |
| [97c44a1d6c](https://github.com/angular/angular/commit/97c44a1d6c41be250d585fba5af2bc2af4d98ae2) | feat | Promote `takeUntilDestroyed` to stable. ([#58200](https://github.com/angular/angular/pull/58200)) |
| [e5adf92965](https://github.com/angular/angular/commit/e5adf9296595644e415d5c147df08890be01ba77) | feat | stabilize `@let` syntax ([#57813](https://github.com/angular/angular/pull/57813)) |
| [b063468027](https://github.com/angular/angular/commit/b0634680272569501146bb7a9cdfe53033e25971) | feat | support TypeScript 5.6 ([#57424](https://github.com/angular/angular/pull/57424)) |
| [819ff034ce](https://github.com/angular/angular/commit/819ff034ce7cf014cedef60510b83af9340efa71) | feat | treat directives, pipes, components as  by default ([#58229](https://github.com/angular/angular/pull/58229)) |
| [ee426c62f0](https://github.com/angular/angular/commit/ee426c62f07579ec7dc89ce9582972cc1e3471d4) | fix | allow signal write error ([#57973](https://github.com/angular/angular/pull/57973)) |
| [c095679f92](https://github.com/angular/angular/commit/c095679f927ad67fec6c18cb140ea550ae02639e) | fix | avoid breaking change with apps using rxjs 6.x ([#58341](https://github.com/angular/angular/pull/58341)) |
| [71ee81af2c](https://github.com/angular/angular/commit/71ee81af2c4c5854a54cf94a48d5829da41878a7) | fix | clean up event contract once hydration is done ([#58174](https://github.com/angular/angular/pull/58174)) |
| [f03d274e87](https://github.com/angular/angular/commit/f03d274e87c919514a70d02c0699523957de7386) | fix | ComponentFixture autoDetect feature works like production ([#55228](https://github.com/angular/angular/pull/55228)) |
| [950a5540f1](https://github.com/angular/angular/commit/950a5540f15118e7360506ad82ec9dab5a11f789) | fix | Ensure the `ViewContext` is retained after closure minification ([#57903](https://github.com/angular/angular/pull/57903)) |
| [7b1e5be20b](https://github.com/angular/angular/commit/7b1e5be20b99c88246c6be78a4dcd64eb55cee1a) | fix | fallback to default ng-content with empty projectable nodes. ([#57480](https://github.com/angular/angular/pull/57480)) |
| [0300dd2e18](https://github.com/angular/angular/commit/0300dd2e18f064f2f57f7371e0dc5c01218b5019) | fix | Fix fixture.detectChanges with autoDetect disabled and zoneless ([#57416](https://github.com/angular/angular/pull/57416)) |
| [5fe57d4fbb](https://github.com/angular/angular/commit/5fe57d4fbb578c35a8e8ef037ae8c19c8a0e901c) | fix | fixes issues with control flow and incremental hydration ([#58644](https://github.com/angular/angular/pull/58644)) |
| [51933ef5a6](https://github.com/angular/angular/commit/51933ef5a6ce62df37945fa22e87e3868288e318) | fix | prevent errors on contract cleanup ([#58614](https://github.com/angular/angular/pull/58614)) |
| [fd7716440b](https://github.com/angular/angular/commit/fd7716440bec8f7ed042d79bafacf3048d45cd47) | fix | Prevents trying to trigger incremental hydration on CSR ([#58366](https://github.com/angular/angular/pull/58366)) |
| [656b5d3e78](https://github.com/angular/angular/commit/656b5d3e78004229a76488e0de1eb1d3508d8f6d) | fix | Re-assign error codes to be within core bounds (<1000) ([#53455](https://github.com/angular/angular/pull/53455)) |
| [6e0af6dbbb](https://github.com/angular/angular/commit/6e0af6dbbbe5e9a9e2e5809ada0b7b5a7e456402) | fix | resolve forward-referenced host directives during directive matching ([#58492](https://github.com/angular/angular/pull/58492)) |
| [468d3fb9b1](https://github.com/angular/angular/commit/468d3fb9b1c3dd6dff86afcb6d8f89cc4c29b24b) | fix | rethrow errors during ApplicationRef.tick in TestBed ([#57200](https://github.com/angular/angular/pull/57200)) |
| [226a67dabb](https://github.com/angular/angular/commit/226a67dabba90a488ad09ce7bb026b8883c90d4a) | fix | Schedulers run in zone above Angular rather than root ([#57553](https://github.com/angular/angular/pull/57553)) |
| [97fb86d331](https://github.com/angular/angular/commit/97fb86d3310ae891ba4d894a8d3479eda08bd4c2) | perf | set encapsulation to `None` for empty component styles ([#57130](https://github.com/angular/angular/pull/57130)) |
| [c15ec36bd1](https://github.com/angular/angular/commit/c15ec36bd1dcff4c7c387337a5bcfd928994db2f) | refactor | remove deprecated `factories` Property in `KeyValueDiffers` ([#58064](https://github.com/angular/angular/pull/58064)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [fe5c4e086a](https://github.com/angular/angular/commit/fe5c4e086add655bf53315d71b0736ff758c7199) | fix | support `output()`-shaped outputs ([#57535](https://github.com/angular/angular/pull/57535)) |
| [0cebfd7462](https://github.com/angular/angular/commit/0cebfd7462c6a7c6c3b0d66720c436a4b0eea19d) | fix | switch to `ComponentRef.setInput` & remove custom scheduler ([#56728](https://github.com/angular/angular/pull/56728)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [3e7d724037](https://github.com/angular/angular/commit/3e7d724037cca4d256b1442eda20d6c6ad91d279) | feat | add ability to clear a FormRecord ([#50750](https://github.com/angular/angular/pull/50750)) |
| [18b6f3339f](https://github.com/angular/angular/commit/18b6f3339f46b37ee67fce2fa8a900cc73b2f23c) | fix | fix FormRecord type inference ([#50750](https://github.com/angular/angular/pull/50750)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [4b9accdf16](https://github.com/angular/angular/commit/4b9accdf166f3990b3706de83ada15937fe786e2) | feat | promote `withRequestsMadeViaParent` to stable. ([#58221](https://github.com/angular/angular/pull/58221)) |
| [057cf7fb6b](https://github.com/angular/angular/commit/057cf7fb6bd2ac37a7a30d3a143e6737e386247f) | fix | preserve all headers from Headers object ([#57802](https://github.com/angular/angular/pull/57802)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [8da9fb49b5](https://github.com/angular/angular/commit/8da9fb49b54e50de2d028691f73fb773def62ecd) | feat | add code fix for unused standalone imports ([#57605](https://github.com/angular/angular/pull/57605)) |
| [1f067f4507](https://github.com/angular/angular/commit/1f067f4507b6e908fe991d5de0dc4d3a627ab2f9) | feat | add code reactoring action to migrate `@Input` to signal-input ([#57214](https://github.com/angular/angular/pull/57214)) |
| [56ee47f2ec](https://github.com/angular/angular/commit/56ee47f2ec6e983e2ffdf59476ab29a92590811e) | feat | allow code refactorings to compute edits asynchronously ([#57214](https://github.com/angular/angular/pull/57214)) |
| [bc83fc1e2e](https://github.com/angular/angular/commit/bc83fc1e2ebac1a99b6e8ed63cea48f48dd7c863) | feat | support converting to signal queries in VSCode extension ([#58106](https://github.com/angular/angular/pull/58106)) |
| [5c4305f024](https://github.com/angular/angular/commit/5c4305f0248ac3cc1adc76aebd3ef8af041039dc) | feat | support migrating full classes to signal inputs in VSCode ([#57975](https://github.com/angular/angular/pull/57975)) |
| [6342befff8](https://github.com/angular/angular/commit/6342befff8ee491f37e8912cccb0099bbbf01042) | feat | support migrating full classes to signal queries ([#58263](https://github.com/angular/angular/pull/58263)) |
| [7ecfd89592](https://github.com/angular/angular/commit/7ecfd8959219b6e2ec19e1244a6694711daf1782) | fix | The suppress diagnostics option should work for external templates ([#57873](https://github.com/angular/angular/pull/57873)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [9c3bd1b5d1](https://github.com/angular/angular/commit/9c3bd1b5d119bdcd4818892deae7f8a17861da42) | refactor | remove deprecated `name` option. ([#58063](https://github.com/angular/angular/pull/58063)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [dff4de0f75](https://github.com/angular/angular/commit/dff4de0f75741bc629462bb8da833b876c754453) | feat | add a combined migration for all signals APIs ([#58259](https://github.com/angular/angular/pull/58259)) |
| [b6bc93803c](https://github.com/angular/angular/commit/b6bc93803c246d47aac0d2d8619271d42b249a4a) | feat | add schematic to migrate to signal queries ([#58032](https://github.com/angular/angular/pull/58032)) |
| [2bfc64daf1](https://github.com/angular/angular/commit/2bfc64daf1cad9be8099759e8de7a361555ad5d1) | feat | expose output as function migration ([#58299](https://github.com/angular/angular/pull/58299)) |
| [59fe9bc772](https://github.com/angular/angular/commit/59fe9bc77236f1374427a851e55b0fa5216d9cf9) | feat | introduce signal input migration as `ng generate` schematic ([#57805](https://github.com/angular/angular/pull/57805)) |
| [90c7ec39a0](https://github.com/angular/angular/commit/90c7ec39a06e5c14711e0a42e2d6a478cde2b9cc) | fix | inject migration always inserting generated variables before super call ([#58393](https://github.com/angular/angular/pull/58393)) |
| [7a65cdd911](https://github.com/angular/angular/commit/7a65cdd911cbbf22445c916fc754d3a3304bc5fe) | fix | inject migration not inserting generated code after super call in some cases ([#58393](https://github.com/angular/angular/pull/58393)) |
| [c1aa411cf1](https://github.com/angular/angular/commit/c1aa411cf13259d991c8f224a2bafc3e9763fe8d) | fix | properly resolve tsconfig paths on windows ([#58137](https://github.com/angular/angular/pull/58137)) |
| [e26797b38e](https://github.com/angular/angular/commit/e26797b38efe0ac813601c10581f34b7591954c1) | fix | replace removed NgModules in tests with their exports ([#58627](https://github.com/angular/angular/pull/58627)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [c36a1c023b](https://github.com/angular/angular/commit/c36a1c023b34f9b2056e1bef6364787e8495bfad) | fix | correctly add external stylesheets to ShadowDOM components ([#58482](https://github.com/angular/angular/pull/58482)) |
| [5c61f46409](https://github.com/angular/angular/commit/5c61f46409855bb8fe66d71a9c16c00753032987) | refactor | remove deprecated `BrowserModule.withServerTransition` method ([#58062](https://github.com/angular/angular/pull/58062)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [9e82559de4](https://github.com/angular/angular/commit/9e82559de4e99a1aedf645a05b01fc08d3f4b1b1) | fix | destroy `PlatformRef` when error happens during the `bootstrap()` phase ([#58112](https://github.com/angular/angular/pull/58112)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [f271021e19](https://github.com/angular/angular/commit/f271021e190ede70bfd181d46f0a468a8e7fa144) | feat | Add `routerOutletData` input to `RouterOutlet` directive ([#57051](https://github.com/angular/angular/pull/57051)) |
| [b2790813a6](https://github.com/angular/angular/commit/b2790813a62e4dfdd77e27d1bb82201788476d06) | fix | Align RouterModule.forRoot errorHandler with provider error handler ([#57050](https://github.com/angular/angular/pull/57050)) |
| [a49c35ec76](https://github.com/angular/angular/commit/a49c35ec769461b9eb490719f0aa3e5aea8e243f) | fix | remove setter for `injector` on `OutletContext` ([#58343](https://github.com/angular/angular/pull/58343)) |
| [7436d3180e](https://github.com/angular/angular/commit/7436d3180ea5ad2c0b58d920bd45f8641a14cc8d) | fix | Update Resolve interface to include RedirectCommand like ResolveFn ([#57309](https://github.com/angular/angular/pull/57309)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [8ddce80a0b](https://github.com/angular/angular/commit/8ddce80a0bab4ebbd0f7db1c85ee27e4f0249db9) | feat | allow specifying maxAge for entire application ([#49601](https://github.com/angular/angular/pull/49601)) |
| [1479af978c](https://github.com/angular/angular/commit/1479af978cd2bbe4ee9f1ca9682684b8e5135fa7) | feat | finish implementation of refreshAhead feature ([#53356](https://github.com/angular/angular/pull/53356)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.12"></a>
# 18.2.12 (2024-11-14)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [4c38160853](https://github.com/angular/angular/commit/4c3816085363614497eecf6b722a91e15e1b2051) | fix | correct extraction of generics from type aliases ([#58548](https://github.com/angular/angular/pull/58548)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.11"></a>
# 18.2.11 (2024-11-06)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5f2d98a1b1](https://github.com/angular/angular/commit/5f2d98a1b1262a9cca84143fdf9829537138fc5c) | fix | avoid slow stringification when checking for duplicates in dev mode ([#58521](https://github.com/angular/angular/pull/58521)) |
| [3aa45a2fa1](https://github.com/angular/angular/commit/3aa45a2fa11ad568d12c622e0a9a94bbf1552118) | fix | resolve forward-referenced host directives during directive matching ([#58492](https://github.com/angular/angular/pull/58492)) ([#58500](https://github.com/angular/angular/pull/58500)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.10"></a>
# 18.2.10 (2024-10-30)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [69dce38e778](https://github.com/angular/angular/commit/69dce38e778cb4c15aa06347031765a84e3ac6a5) | fix | transform pseudo selectors correctly for the encapsulated view. ([#58417](https://github.com/angular/angular/pull/58417)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [3b989ac5bd9](https://github.com/angular/angular/commit/3b989ac5bd951a3d28bcd0ada150fc81503a016a) | fix | Adding  arb format to the list of valid formats in the localization extractor cli ([#58287](https://github.com/angular/angular/pull/58287)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.9"></a>
# 18.2.9 (2024-10-23)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b0ab653965](https://github.com/angular/angular/commit/b0ab653965cf88fcfde23fc6a6cc78ce3121a30f) | fix | report when NgModule imports or exports itself ([#58231](https://github.com/angular/angular/pull/58231)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.8"></a>
# 18.2.8 (2024-10-10)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [11692c8dab](https://github.com/angular/angular/commit/11692c8dab2a78dc8780ceed301242d51dee7c9c) | fix | add multiple :host and nested selectors support ([#57796](https://github.com/angular/angular/pull/57796)) |
| [66dcc691f5](https://github.com/angular/angular/commit/66dcc691f55eafc9de9a233b9bab53284fc13e1b) | fix | allow combinators inside pseudo selectors ([#57796](https://github.com/angular/angular/pull/57796)) |
| [48a1437e77](https://github.com/angular/angular/commit/48a1437e77be5c3b29b8bbcd1b5d7784fbb67e68) | fix | fix comment typo ([#57796](https://github.com/angular/angular/pull/57796)) |
| [d325f9b55f](https://github.com/angular/angular/commit/d325f9b55f248e5bd059645be901f210018f8fa2) | fix | fix parsing of the :host-context with pseudo selectors ([#57796](https://github.com/angular/angular/pull/57796)) |
| [aea747ab3b](https://github.com/angular/angular/commit/aea747ab3bcbca79dbbc7ddfc41e11b9e43952eb) | fix | preserve attributes attached to :host selector ([#57796](https://github.com/angular/angular/pull/57796)) |
| [21be258be6](https://github.com/angular/angular/commit/21be258be687a300ca22daad823e0b931029db35) | fix | scope :host-context inside pseudo selectors, do not decrease specificity ([#57796](https://github.com/angular/angular/pull/57796)) |
| [7a6fd427d5](https://github.com/angular/angular/commit/7a6fd427d5ad70ad4c50693f54a6e77bf51eea86) | fix | transform pseudo selectors correctly for the encapsulated view ([#57796](https://github.com/angular/angular/pull/57796)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [f187c3abf8](https://github.com/angular/angular/commit/f187c3abf8b9547b2692995f344cd7dcb9f32ebc) | fix | defer symbols only used in types ([#58104](https://github.com/angular/angular/pull/58104)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [46bafb0b0a](https://github.com/angular/angular/commit/46bafb0b0a952d8e9c2a0099f0607354697bbeaa) | fix | clean up afterRender after it is executed ([#58119](https://github.com/angular/angular/pull/58119)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [b40875a2cc](https://github.com/angular/angular/commit/b40875a2cc28a94015e6392044a03b30c2559999) | fix | destroy `PlatformRef` when error happens during the `bootstrap()` phase ([#58112](https://github.com/angular/angular/pull/58112)) ([#58135](https://github.com/angular/angular/pull/58135)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.7"></a>
# 18.2.7 (2024-10-02)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [249d0260f9](https://github.com/angular/angular/commit/249d0260f97a2fec8e4daef0b1565ba40b27d370) | fix | execute checks and remove placeholder when image is already loaded ([#55444](https://github.com/angular/angular/pull/55444)) |
| [46a2ad39f5](https://github.com/angular/angular/commit/46a2ad39f53f6e3b224dfe4b25087c08830713b6) | fix | prevent warning about oversize image twice ([#58021](https://github.com/angular/angular/pull/58021)) |
| [8f2b0ede59](https://github.com/angular/angular/commit/8f2b0ede5962ad30171843cd7af80c8878b35b53) | fix | skip checking whether SVGs are oversized ([#57966](https://github.com/angular/angular/pull/57966)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [901c1e1a7f](https://github.com/angular/angular/commit/901c1e1a7faadee73af4f9e6c37efa778f406ab8) | fix | correctly get the type of nested function call expressions ([#57010](https://github.com/angular/angular/pull/57010)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2f347ef8fc](https://github.com/angular/angular/commit/2f347ef8fcef8645d86047d7a339405c0156aa43) | fix | provide flag to opt into manual cleanup for after render hooks ([#57917](https://github.com/angular/angular/pull/57917)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [ca637fe6a9](https://github.com/angular/angular/commit/ca637fe6a95bd020221d71cd0581a3394070cf2c) | fix | cleanup JSONP script listeners once loading completed ([#57877](https://github.com/angular/angular/pull/57877)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [b9d846dad7](https://github.com/angular/angular/commit/b9d846dad77832dff44b112ac22951e0f31733ba) | fix | delete constructor if it only has super call ([#58013](https://github.com/angular/angular/pull/58013)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [e40a4fa3c7](https://github.com/angular/angular/commit/e40a4fa3c71c9ad76c1546b38ca2e9f74eff7dc0) | fix | support input signal bindings ([#57020](https://github.com/angular/angular/pull/57020)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.6"></a>
# 18.2.6 (2024-09-25)

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.5"></a>
# 18.2.5 (2024-09-18)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [e685ed883a](https://github.com/angular/angular/commit/e685ed883a09628c2b87a11a17ffb6d858d51c54) | fix | extended diagnostics not validating ICUs ([#57845](https://github.com/angular/angular/pull/57845)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [76709d5d6e](https://github.com/angular/angular/commit/76709d5d6ec1f83e3f44641704b540636f91b5f4) | fix | Handle `@let` declaration with array when `preparingForHydration` ([#57816](https://github.com/angular/angular/pull/57816)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5c866942a1](https://github.com/angular/angular/commit/5c866942a1b8a60e3a024385048bbb2f52f84513) | fix | account for explicit standalone: false in migration ([#57803](https://github.com/angular/angular/pull/57803)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.4"></a>
# 18.2.4 (2024-09-11)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [b619d6987e](https://github.com/angular/angular/commit/b619d6987efe054b9b37c24e578f58792b25d146) | fix | produce less noisy errors when parsing control flow ([#57711](https://github.com/angular/angular/pull/57711)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [9895e4492f](https://github.com/angular/angular/commit/9895e4492fbe357b584ca5a6dd86d2c9d50d9fda) | fix | replace leftover modules with their exports during pruning ([#57684](https://github.com/angular/angular/pull/57684)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.3"></a>
# 18.2.3 (2024-09-04)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [de68e049e4](https://github.com/angular/angular/commit/de68e049e40ab702d9e2b7dd02070de9856377df) | fix | Dynamicaly call the global fetch implementation ([#57531](https://github.com/angular/angular/pull/57531)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.2"></a>
# 18.2.2 (2024-08-28)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [106917af878](https://github.com/angular/angular/commit/106917af87868a801d536371511436247ca17382) | fix | avoid leaking memory if component throws during creation ([#57546](https://github.com/angular/angular/pull/57546)) |
| [6d3a2af146a](https://github.com/angular/angular/commit/6d3a2af146a83f362501f911790503776383369f) | fix | Do not bubble capture events. ([#57476](https://github.com/angular/angular/pull/57476)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [5d2e243c76a](https://github.com/angular/angular/commit/5d2e243c76ac55080bce35b9c3704ad9c2e4a932) | fix | Dynamicaly call the global fetch implementation ([#57531](https://github.com/angular/angular/pull/57531)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [804925b1149](https://github.com/angular/angular/commit/804925b11492cbcaa586c90958615abe5c525e5f) | fix | Do not unnecessarily run matcher twice on route matching ([#57530](https://github.com/angular/angular/pull/57530)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [03ec620e31a](https://github.com/angular/angular/commit/03ec620e31a0335a05013659daaa947010df6778) | fix | Address Trusted Types violations in @angular/upgrade ([#57454](https://github.com/angular/angular/pull/57454)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.1"></a>
# 18.2.1 (2024-08-22)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [9de30a7b1c](https://github.com/angular/angular/commit/9de30a7b1cbda5bd85db607266ad533c1aac0a02) | fix | Allow zoneless scheduler to run inside `fakeAsync` ([#56932](https://github.com/angular/angular/pull/56932)) |
| [286012fb89](https://github.com/angular/angular/commit/286012fb89270bd9330ffeb229f3a14b6e67d2a9) | fix | handle hydration of components that project content conditionally ([#57383](https://github.com/angular/angular/pull/57383)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [0bb649b8fa](https://github.com/angular/angular/commit/0bb649b8fa22a0db4f383db29995105b0b4adc81) | fix | account for members with doc strings and no modifiers ([#57389](https://github.com/angular/angular/pull/57389)) |
| [3b63082384](https://github.com/angular/angular/commit/3b63082384b396514dd836b7763202536f3f4f23) | fix | avoid migrating route component in tests ([#57317](https://github.com/angular/angular/pull/57317)) |
| [6b4357fae4](https://github.com/angular/angular/commit/6b4357fae45f0c187c8d23649b94a828dd9aaa6e) | fix | preserve type when using inject decorator ([#57389](https://github.com/angular/angular/pull/57389)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.2.0"></a>
# 18.2.0 (2024-08-14)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c8e2885136](https://github.com/angular/angular/commit/c8e2885136b08981333a336b7b2ba553266eba63) | feat | Add extended diagnostic to warn when there are uncalled functions in event bindings ([#56295](https://github.com/angular/angular/pull/56295)) ([#56295](https://github.com/angular/angular/pull/56295)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [98ed5b609e](https://github.com/angular/angular/commit/98ed5b609e76d3d2b464abfe49d70413c54d3eee) | feat | run JIT transform on classes with `jit: true` opt-out ([#56892](https://github.com/angular/angular/pull/56892)) |
| [c76b440ac0](https://github.com/angular/angular/commit/c76b440ac007128c53699797811bc586220ccbe9) | fix | add warning for unused let declarations ([#57033](https://github.com/angular/angular/pull/57033)) |
| [0f0a1f2836](https://github.com/angular/angular/commit/0f0a1f28365cdb2dc6abed5ec75d4f6ba7ff1578) | fix | emitting references to ngtypecheck files ([#57138](https://github.com/angular/angular/pull/57138)) |
| [6c2fbda694](https://github.com/angular/angular/commit/6c2fbda6942adbc7b21f3dfc1db0a42638223a1a) | fix | extended diagnostic visitor not visiting template attributes ([#57033](https://github.com/angular/angular/pull/57033)) |
| [e11c0c42d2](https://github.com/angular/angular/commit/e11c0c42d2cbcdf8a5d75a4e24a6a5dbed33943e) | fix | run JIT transforms on `@NgModule` classes with `jit: true` ([#57212](https://github.com/angular/angular/pull/57212)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [f7918f5272](https://github.com/angular/angular/commit/f7918f52720d3e903281154725cb257a952e8896) | feat | Add 'flush' parameter option to fakeAsync to flush after the test ([#57239](https://github.com/angular/angular/pull/57239)) |
| [fab673a1dd](https://github.com/angular/angular/commit/fab673a1ddbca19ff9734f92a5ef0cc16be5708c) | feat | add ng generate schematic to convert to inject ([#57056](https://github.com/angular/angular/pull/57056)) |
| [7919982063](https://github.com/angular/angular/commit/7919982063e7638ffabe2127d4803bb930c791bc) | feat | Add whenStable helper on ApplicationRef ([#57190](https://github.com/angular/angular/pull/57190)) |
| [3459289ef0](https://github.com/angular/angular/commit/3459289ef079a80e84bb92e20c25fb6cae18aaf8) | feat | bootstrapModule can configure NgZone in providers ([#57060](https://github.com/angular/angular/pull/57060)) |
| [296216cbe1](https://github.com/angular/angular/commit/296216cbe1c70822d4b444321d218d57c89621b2) | fix | Allow hybrid CD scheduling to support multiple "Angular zones" ([#57267](https://github.com/angular/angular/pull/57267)) |
| [8718abce90](https://github.com/angular/angular/commit/8718abce900617275d80ca56141d4e4436481b69) | fix | Deprecate ignoreChangesOutsideZone option ([#57029](https://github.com/angular/angular/pull/57029)) |
| [827070e331](https://github.com/angular/angular/commit/827070e3314d4c3acee77920dc0d5375398917ab) | fix | Do not run image performance warning checks on server ([#57234](https://github.com/angular/angular/pull/57234)) |
| [ca89ef9141](https://github.com/angular/angular/commit/ca89ef9141191d56415bdf62354f5125800a4039) | fix | handle shorthand assignment in the inject migration ([#57134](https://github.com/angular/angular/pull/57134)) |
| [5dcdbfcba9](https://github.com/angular/angular/commit/5dcdbfcba934a930468aec140a7183b034466bdf) | fix | rename the equality function option in toSignal ([#56769](https://github.com/angular/angular/pull/56769)) |
| [2a4f488a6c](https://github.com/angular/angular/commit/2a4f488a6cb8bdadece70c8aa076c02fae801688) | fix | warnings for oversized images and lazy-lcp present with bootstrapModule ([#57060](https://github.com/angular/angular/pull/57060)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [4bb558ab0c](https://github.com/angular/angular/commit/4bb558ab0cbf2e5e34816377e977128a177a977a) | feat | support writing code refactorings ([#56895](https://github.com/angular/angular/pull/56895)) |
| [7663debce1](https://github.com/angular/angular/commit/7663debce1a8411a763a27b7cf8bc5955f8ea2ed) | perf | quick exit if no code fixes can exist ([#57000](https://github.com/angular/angular/pull/57000)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [147eee4253](https://github.com/angular/angular/commit/147eee42530b8e7d6a99f37c8eba7a38cbe29522) | feat | add migration to convert standalone component routes to be lazy loaded ([#56428](https://github.com/angular/angular/pull/56428)) |
| [cb442a0ce7](https://github.com/angular/angular/commit/cb442a0ce7183c7d0e315a58ade75aa09bdaf6dd) | fix | account for parameters with union types ([#57127](https://github.com/angular/angular/pull/57127)) |
| [166166d79e](https://github.com/angular/angular/commit/166166d79ebe2405989b869f96a04e1dee182666) | fix | add alias to inject migration ([#57127](https://github.com/angular/angular/pull/57127)) |
| [b1a9d0f4de](https://github.com/angular/angular/commit/b1a9d0f4de75c4b8b837379ae466a393543ed458) | fix | avoid duplicating comments when generating properties ([#57367](https://github.com/angular/angular/pull/57367)) |
| [5d76401ff5](https://github.com/angular/angular/commit/5d76401ff5e06437e65f4a8a6f44794fdcb088a6) | fix | preserve optional parameters ([#57367](https://github.com/angular/angular/pull/57367)) |
| [1cf616f671](https://github.com/angular/angular/commit/1cf616f6710d1324e24bc3421a1edc84c8bb1a02) | fix | remove generic arguments from the injected type reference ([#57127](https://github.com/angular/angular/pull/57127)) |
| [ba0df30ef6](https://github.com/angular/angular/commit/ba0df30ef617df0a8b6b7286f0147f7d1509330e) | fix | remove unused imports in inject migration ([#57179](https://github.com/angular/angular/pull/57179)) |
| [aae9646a1b](https://github.com/angular/angular/commit/aae9646a1b5a5ce114e624d9c1452d9f4c71b969) | fix | unwrap injected forwardRef ([#57127](https://github.com/angular/angular/pull/57127)) |
| [604270619a](https://github.com/angular/angular/commit/604270619a21a50f980904c48d87ea5c46aff56d) | perf | speed up signal input migration by combining two analyze phases ([#57318](https://github.com/angular/angular/pull/57318)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [6c76c91e15](https://github.com/angular/angular/commit/6c76c91e151b53dfaccb4be43d43a8d857715dd7) | feat | Add defaultQueryParamsHandling to router configuration ([#57198](https://github.com/angular/angular/pull/57198)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.5"></a>
# 18.1.5 (2024-08-14)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [5401332b0e](https://github.com/angular/angular/commit/5401332b0ef1ec398a5e9767ca73cec544635c93) | fix | generate valid TS 5.6 type checking code ([#57303](https://github.com/angular/angular/pull/57303)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e39b22a932](https://github.com/angular/angular/commit/e39b22a932384f228e97414c44d10c7e158dfd2f) | fix | Account for addEventListener to be passed a Window or Document. ([#57282](https://github.com/angular/angular/pull/57282)) |
| [db65bc25ca](https://github.com/angular/angular/commit/db65bc25cab413221fef1c2cdaf7c53f569219c8) | fix | Account for addEventListener to be passed a Window or Document. ([#57354](https://github.com/angular/angular/pull/57354)) |
| [0e024ecc27](https://github.com/angular/angular/commit/0e024ecc27815c308feef0dbdf36d4d751af4436) | fix | complete post-hydration cleanup in components that use ViewContainerRef ([#57300](https://github.com/angular/angular/pull/57300)) |
| [822db64b93](https://github.com/angular/angular/commit/822db64b937db8a581ec9612cf9e3e6e149c820f) | fix | skip hydration for i18n nodes that were not projected ([#57356](https://github.com/angular/angular/pull/57356)) |
| [810f76f574](https://github.com/angular/angular/commit/810f76f57416853d5bc006e57bea070416117e79) | fix | take skip hydration flag into account while hydrating i18n blocks ([#57299](https://github.com/angular/angular/pull/57299)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.4"></a>
# 18.1.4 (2024-08-07)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [6a99f83659](https://github.com/angular/angular/commit/6a99f836593de35989cddc3db849da133814f8fb) | fix | reduce chance of conflicts between generated factory and local variables ([#57181](https://github.com/angular/angular/pull/57181)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [afb05ff1cb](https://github.com/angular/angular/commit/afb05ff1cb008478c98987edfa54ec848ae555d6) | fix | support JIT transforms before other transforms modifying classes ([#57262](https://github.com/angular/angular/pull/57262)) |
| [bae54a1621](https://github.com/angular/angular/commit/bae54a1621e1c0427519abfa81fc4796c43f1551) | perf | improve performance of `interpolatedSignalNotInvoked` extended diagnostic ([#57291](https://github.com/angular/angular/pull/57291)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [6ac209c24f](https://github.com/angular/angular/commit/6ac209c24f46a1240b1a186eb403c79ef596d68a) | fix | avoid generating TS suggestion diagnostics for templates ([#56241](https://github.com/angular/angular/pull/56241)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.3"></a>
# 18.1.3 (2024-07-31)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [31dea066d6](https://github.com/angular/angular/commit/31dea066d636bb49fa18b1172815b1ef7af4dbe5) | fix | reduce chance of conflicts between generated factory and local variables ([#57181](https://github.com/angular/angular/pull/57181)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [1f9e090910](https://github.com/angular/angular/commit/1f9e09091076924a2f2c2d4bd6e5f65303bf8fea) | fix | emitting references to ngtypecheck files ([#57138](https://github.com/angular/angular/pull/57138)) ([#57202](https://github.com/angular/angular/pull/57202)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [f7ab04018e](https://github.com/angular/angular/commit/f7ab04018ea0fe12781de987fff40fd1dc30f3f0) | fix | errors during ApplicationRef.tick should be rethrown for zoneless tests ([#56993](https://github.com/angular/angular/pull/56993)) |
| [eaa83f9d27](https://github.com/angular/angular/commit/eaa83f9d279855b104597d396e39fe3496470daf) | fix | hydration error in some let declaration setups ([#57173](https://github.com/angular/angular/pull/57173)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.2"></a>
# 18.1.2 (2024-07-24)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [463945003d](https://github.com/angular/angular/commit/463945003dcf253c64809ffdcddabedb87e78e06) | fix | limit the number of chained instructions ([#57069](https://github.com/angular/angular/pull/57069)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [e904f34020](https://github.com/angular/angular/commit/e904f3402053ce9098854a31f2652020dd79e8f9) | fix | add warning for unused let declarations ([#57033](https://github.com/angular/angular/pull/57033)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [9e52c1c840](https://github.com/angular/angular/commit/9e52c1c8402dd5a54cf73caafff4a5b81d73fabd) | fix | `afterNextRender` hooks return that callback value. ([#57031](https://github.com/angular/angular/pull/57031)) |
| [b9fb98c67c](https://github.com/angular/angular/commit/b9fb98c67c29d8e5697b72788f09f1263e8130f4) | fix | tree shake dev mode error message ([#57035](https://github.com/angular/angular/pull/57035)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.1"></a>
# 18.1.1 (2024-07-17)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [a1cb9dfc0d](https://github.com/angular/angular/commit/a1cb9dfc0d3539d16020a53dd4c32311240a6265) | fix | Don't run preconnect assertion on the server. ([#56213](https://github.com/angular/angular/pull/56213)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [daf0317bdc](https://github.com/angular/angular/commit/daf0317bdcef79445eead4a3e0e1be75671f43fb) | fix | JIT mode incorrectly interpreting host directive configuration in partial compilation ([#57002](https://github.com/angular/angular/pull/57002)) |
| [d7dca6dbb6](https://github.com/angular/angular/commit/d7dca6dbb6d8afc77a988de0b7471ac4e078762e) | fix | use strict equality for 'code' comparison ([#56944](https://github.com/angular/angular/pull/56944)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [c94a897248](https://github.com/angular/angular/commit/c94a8972488f62656f5d0368b8763776e2cd39c6) | fix | avoid emitting references to typecheck files in TS 5.4 ([#56961](https://github.com/angular/angular/pull/56961)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5682527d94](https://github.com/angular/angular/commit/5682527d949b078e92ff7588c7e25dad37fffc52) | fix | not all callbacks running when registered at the same time ([#56981](https://github.com/angular/angular/pull/56981)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [b666d2c20f](https://github.com/angular/angular/commit/b666d2c20f932f435fa6c51e1d74d7bca53381f2) | fix | fix common module removal ([#56968](https://github.com/angular/angular/pull/56968)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.12"></a>
# 17.3.12 (2024-07-17)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [327bae473b](https://github.com/angular/angular/commit/327bae473b4ed430efefb4663312a01f59304081) | fix | JIT mode incorrectly interpreting host directive configuration in partial compilation ([#57002](https://github.com/angular/angular/pull/57002)) ([#57003](https://github.com/angular/angular/pull/57003)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.1.0"></a>
# 18.1.0 (2024-07-10)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [f25653e231](https://github.com/angular/angular/commit/f25653e2311152d30b14d25acb0dccb4e2b5ea56) | fix | typo in NgOptimizedImage warning ([#56756](https://github.com/angular/angular/pull/56756)) |
| [9b35726e42](https://github.com/angular/angular/commit/9b35726e42ebdeed138a25581e0a7eefff466206) | fix | typo in warning for NgOptimizedDirective ([#56817](https://github.com/angular/angular/pull/56817)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [fd6cd0422d](https://github.com/angular/angular/commit/fd6cd0422d2d761d2c6cc0cd41838fbba8a3f010) | feat | Add extended diagnostic to warn when there are uncalled functions in event bindings ([#56295](https://github.com/angular/angular/pull/56295)) |
| [341a116d61](https://github.com/angular/angular/commit/341a116d611c095ed414c82612adb529e7be310c) | fix | allow more characters in let declaration name ([#56764](https://github.com/angular/angular/pull/56764)) |
| [2a1291e942](https://github.com/angular/angular/commit/2a1291e942a3cd645ee635e72e7d83722383d39b) | fix | give precedence to local let declarations over parent ones ([#56752](https://github.com/angular/angular/pull/56752)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [66e582551e](https://github.com/angular/angular/commit/66e582551eb081e422e0df41badce1821c46dc62) | fix | avoid duplicate diagnostics for let declarations read before definition ([#56843](https://github.com/angular/angular/pull/56843)) |
| [4d18c5bfd5](https://github.com/angular/angular/commit/4d18c5bfd54c53655955c8cd90472081ade40b34) | fix | flag all conflicts between let declarations and local symbols ([#56752](https://github.com/angular/angular/pull/56752)) |
| [9e21582456](https://github.com/angular/angular/commit/9e215824565f0d30da7edb20087c4460069a6660) | fix | Show template syntax errors in local compilation modified ([#55855](https://github.com/angular/angular/pull/55855)) |
| [5996502921](https://github.com/angular/angular/commit/599650292107f8856c7cd41791bd0856f9d14eb1) | fix | type check let declarations nested inside nodes ([#56752](https://github.com/angular/angular/pull/56752)) |
| [cdebf751e4](https://github.com/angular/angular/commit/cdebf751e4949048b01acc92de2517f46fcd5d37) | fix | used before declared diagnostic not firing for control flow blocks ([#56843](https://github.com/angular/angular/pull/56843)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [ea3c802056](https://github.com/angular/angular/commit/ea3c80205653af109c688a4d4808143b34591d54) | feat | Add a schematic to migrate afterRender phase flag ([#55648](https://github.com/angular/angular/pull/55648)) |
| [5df3e78c99](https://github.com/angular/angular/commit/5df3e78c9907f522f2f96c087b10ca12d57f7028) | feat | add equality function to rxjs-interop `toSignal` ([#56447](https://github.com/angular/angular/pull/56447)) |
| [0a48d584f2](https://github.com/angular/angular/commit/0a48d584f2ffeebb9402032182d4fc13a260c5cf) | feat | add support for let syntax ([#56715](https://github.com/angular/angular/pull/56715)) |
| [352e0782ec](https://github.com/angular/angular/commit/352e0782ec37d2adcc662cfc69c83d38058a34bf) | feat | expose signal input metadata in `ComponentMirror` ([#56402](https://github.com/angular/angular/pull/56402)) |
| [a655e46447](https://github.com/angular/angular/commit/a655e46447962bf56bf0184e3104328b9f7c1531) | feat | Redesign the `afterRender` & `afterNextRender` phases API ([#55648](https://github.com/angular/angular/pull/55648)) |
| [e5a6f91722](https://github.com/angular/angular/commit/e5a6f917225aafa7c5c860f280d2aafe3615727e) | feat | support TypeScript 5.5 ([#56096](https://github.com/angular/angular/pull/56096)) |
| [38effcc63e](https://github.com/angular/angular/commit/38effcc63eea360e948dc22860add72d3aa02288) | fix | Add back phase flag option as a deprecated API ([#55648](https://github.com/angular/angular/pull/55648)) |
| [86bcfd3e49](https://github.com/angular/angular/commit/86bcfd3e498b8ec1de1a2a1ad0847fe567f7e9d4) | fix | improve docs on afterRender hooks ([#56522](https://github.com/angular/angular/pull/56522)) |
| [b2445a0953](https://github.com/angular/angular/commit/b2445a095314aa66da038d3093e6a1b18fe5768b) | fix | link errors to ADEV ([#55554](https://github.com/angular/angular/pull/55554)) ([#56038](https://github.com/angular/angular/pull/56038)) |
| [03a2acd2a3](https://github.com/angular/angular/commit/03a2acd2a3bdc87aaeb6b835a7c1016f800b31cb) | fix | properly remove imports in the afterRender phase migration ([#56524](https://github.com/angular/angular/pull/56524)) |
| [4d87b9e899](https://github.com/angular/angular/commit/4d87b9e899381894a1de90f251da58613a96eed0) | fix | rename the equality function option in toSignal ([#56769](https://github.com/angular/angular/pull/56769)) ([#56922](https://github.com/angular/angular/pull/56922)) |
| [8bd4c074af](https://github.com/angular/angular/commit/8bd4c074afe85b739dff4d3c4dcc19384c42b85e) | fix | toSignal equal option should be passed to inner computed ([#56903](https://github.com/angular/angular/pull/56903)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [00bde8b1c2](https://github.com/angular/angular/commit/00bde8b1c2d1511da40526a374d4e94d31e0d575) | fix | Make `NgControlStatus` host bindings `OnPush` compatible ([#55720](https://github.com/angular/angular/pull/55720)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [cc21989132](https://github.com/angular/angular/commit/cc21989132bc64b981df83cb6ff6e1506b42a1d0) | fix | Make `Content-Type` header case insensitive ([#56541](https://github.com/angular/angular/pull/56541)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [b400e2e4d4](https://github.com/angular/angular/commit/b400e2e4d4c27a9c8d8e91b52852ef7b64f7591a) | feat | autocompletion for the component not imported ([#55595](https://github.com/angular/angular/pull/55595)) |
| [67b2c336bc](https://github.com/angular/angular/commit/67b2c336bc0bdce3f7ae054c094990a9831f5b20) | fix | import the default exported component correctly ([#56432](https://github.com/angular/angular/pull/56432)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [a13f5da773](https://github.com/angular/angular/commit/a13f5da77303f4ab2f1543df1de1f416216b5a9c) | feat | Allow `UrlTree` as an input to `routerLink` ([#56265](https://github.com/angular/angular/pull/56265)) |
| [1d3a7529b4](https://github.com/angular/angular/commit/1d3a7529b4fa3617a5d6a97e742cb13818253a14) | feat | Set a different browser URL from the one for route matching ([#53318](https://github.com/angular/angular/pull/53318)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.7"></a>
# 18.0.7 (2024-07-10)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [85f77b5cda](https://github.com/angular/angular/commit/85f77b5cda26cefa322e232b4336ae965279f72b) | fix | fix CSS animation rule scope ([#56800](https://github.com/angular/angular/pull/56800)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [95d7076d1a](https://github.com/angular/angular/commit/95d7076d1a8c3d0d9544ca7091e78af11cd963b6) | perf | execute `fetch` outside of Angular zone ([#56820](https://github.com/angular/angular/pull/56820)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [d6fff45e73](https://github.com/angular/angular/commit/d6fff45e735044612795ae37cf62968bdb0758dd) | fix | Fix cf migration let condition semicolon order ([#56913](https://github.com/angular/angular/pull/56913)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.6"></a>
# 18.0.6 (2024-07-03)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [a55719f55e](https://github.com/angular/angular/commit/a55719f55eb9b75799dfe41bb56cacdd85b4bd9f) | fix | Don't run preconnect assertion on the server. ([#56213](https://github.com/angular/angular/pull/56213)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4909844805](https://github.com/angular/angular/commit/4909844805635d62535bcb247ef1ca65927c6a3d) | fix | establish proper defer injector hierarchy for components attached to ApplicationRef ([#56763](https://github.com/angular/angular/pull/56763)) |
| [fec5b80aaf](https://github.com/angular/angular/commit/fec5b80aaff402bb62bd21d7e8c4182d2484a97f) | fix | support injection of object with null constructor. ([#56553](https://github.com/angular/angular/pull/56553)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [b7d3ecc873](https://github.com/angular/angular/commit/b7d3ecc873b2cafe45ffa1bbfc8cfeda4b4c9e6b) | fix | routes should not get stale providers ([#56798](https://github.com/angular/angular/pull/56798)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.5"></a>
# 18.0.5 (2024-06-26)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2f73281dfd](https://github.com/angular/angular/commit/2f73281dfd97fd254179770cbdbda5236f5f37fd) | fix | improve docs on afterRender hooks ([#56525](https://github.com/angular/angular/pull/56525)) |
| [be9e4892f9](https://github.com/angular/angular/commit/be9e4892f9d2e3dbc772b732a130f97d67cba965) | fix | improve support for i18n hydration of projected content ([#56192](https://github.com/angular/angular/pull/56192)) |
| [5f9bd5521e](https://github.com/angular/angular/commit/5f9bd5521eaadb4106c43eb2f8e7ac25777e9ea6) | fix | prevent calling devMode only function on `@defer` error. ([#56559](https://github.com/angular/angular/pull/56559)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.4"></a>
# 18.0.4 (2024-06-20)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [ec0d1bf6f3](https://github.com/angular/angular/commit/ec0d1bf6f337fc4f2c29cacaa6ca5b915eb4e561) | fix | insert constant statements after the first group of imports ([#56431](https://github.com/angular/angular/pull/56431)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [83ffa94783](https://github.com/angular/angular/commit/83ffa9478372db3e5dd2d256d266a5612008da0a) | fix | do not activate event replay when no events are registered ([#56509](https://github.com/angular/angular/pull/56509)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [5578681da2](https://github.com/angular/angular/commit/5578681da27345b0c8260eb5d73e702d19581abd) | fix | Delay the view transition to ensure renders in microtasks complete ([#56494](https://github.com/angular/angular/pull/56494)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.3"></a>
# 18.0.3 (2024-06-12)
### benchpress
| Commit | Type | Description |
| -- | -- | -- |
| [ebf00aa0659](https://github.com/angular/angular/commit/ebf00aa06592a966b72c81ff4ca09c6ef1344a20) | fix | adjust supported browser names for headless chrome ([#56360](https://github.com/angular/angular/pull/56360)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dbd0fa00f8c](https://github.com/angular/angular/commit/dbd0fa00f8c742a9b804ce2a96a0add552a179dd) | fix | async EventEmitter should contribute to app stability ([#56308](https://github.com/angular/angular/pull/56308)) |
| [625ca3e2b3f](https://github.com/angular/angular/commit/625ca3e2b3f04fb770ecbef03a9a4151c54e201b) | fix | signals should be tracked when embeddedViewRef.detectChanges is called ([#55719](https://github.com/angular/angular/pull/55719)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [d6dd3dbdb09](https://github.com/angular/angular/commit/d6dd3dbdb09da956a7c7c95187ae29347568b2e9) | fix | add `@angular/localize/init` as polyfill in `angular.json` ([#56300](https://github.com/angular/angular/pull/56300)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [c07e1b33569](https://github.com/angular/angular/commit/c07e1b335695ce8e5402e7d7ad7810ccd472b224) | fix | resolve error in standalone migration ([#56302](https://github.com/angular/angular/pull/56302)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.2"></a>
# 18.0.2 (2024-06-05)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [78cf9bfc0e](https://github.com/angular/angular/commit/78cf9bfc0eb1e78c1f6d3a562e65982579698896) | fix | Do not migrate `HttpClientModule` imports on components. ([#56067](https://github.com/angular/angular/pull/56067)) |
| [616cdef474](https://github.com/angular/angular/commit/616cdef4748d5112460cf58200832585856777d6) | fix | don't coerce all producers to consumers on liveness change ([#56140](https://github.com/angular/angular/pull/56140)) |
| [2a440e1064](https://github.com/angular/angular/commit/2a440e1064bddc839df91dbe77fc27bb8bd15641) | fix | Fix shouldPreventDefaultBeforeDispatching bug ([#56188](https://github.com/angular/angular/pull/56188)) |
| [290a47d842](https://github.com/angular/angular/commit/290a47d8427f4854234cb2b4244871eaf1f82c19) | fix | handle missing `withI18nSupport()` call for components that use i18n blocks ([#56175](https://github.com/angular/angular/pull/56175)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [b70b80ba55](https://github.com/angular/angular/commit/b70b80ba55ff16a5dd10e07c7120b0d3aecd5d2d) | fix | do not generate aliased variables with the same name ([#56154](https://github.com/angular/angular/pull/56154)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.1"></a>
# 18.0.1 (2024-05-29)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [419ffa2026](https://github.com/angular/angular/commit/419ffa20265e4b9b5b1d92045ec40f59f5c4de2e) | fix | optimize track function that only passes $index ([#55872](https://github.com/angular/angular/pull/55872)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [4c7efc005a](https://github.com/angular/angular/commit/4c7efc005a8d0d343f437007740254b1d35c718b) | fix | interpolatedSignalNotInvoked diagnostic for class, style, attribute and animation bindings ([#55969](https://github.com/angular/angular/pull/55969)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4e6ea0e19c](https://github.com/angular/angular/commit/4e6ea0e19c52c9aceb635accb379572c78a457da) | fix | handle elements with local refs in event replay serialization logic ([#56076](https://github.com/angular/angular/pull/56076)) |
| [d73a0175cb](https://github.com/angular/angular/commit/d73a0175cb2d8c74e6bb877dc30eec07fd484fff) | fix | link errors to ADEV ([#55554](https://github.com/angular/angular/pull/55554)) |
| [985a215b10](https://github.com/angular/angular/commit/985a215b102be2a58dd4d13e1c05399f58f3078e) | fix | typo in zoneless warning ([#55974](https://github.com/angular/angular/pull/55974)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [ba85d08158](https://github.com/angular/angular/commit/ba85d081583277a5b7a04bc349a3a8d528467c52) | fix | handle empty ngSwitchCase ([#56105](https://github.com/angular/angular/pull/56105)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.10"></a>
# 17.3.10 (2024-05-22)

<!-- CHANGELOG SPLIT MARKER -->

<a name="18.0.0"></a>
# 18.0.0 (2024-05-22)

[Blog post "Angular v18 is now available"](http://goo.gle/angular-v18).

## Breaking Changes
### animations
- Deprecated `matchesElement` method has been removed from `AnimationDriver` as it is unused.
### common
- The deprecated `isPlatformWorkerUi` and `isPlatformWorkerApp` have been removed without replacement, as they serve no purpose since the removal of the WebWorker platform.
### compiler
- Angular only supports writable expressions inside of two-way bindings.
### compiler-cli
- * Angular no longer supports TypeScript versions older than 5.4.
### core
- `OnPush` views at the root of the application need to
  be marked dirty for their host bindings to refresh. Previously, the host
  bindings were refreshed for all root views without respecting the
  `OnPush` change detection strategy.
- The `ComponentFixture` `autoDetect` feature will no
  longer refresh the component's host view when the component is `OnPush`
  and not marked dirty. This exposes existing issues in components which
  claim to be `OnPush` but do not correctly call `markForCheck` when they
  need to be refreshed. If this change causes test failures, the easiest
  fix is to change the component to `ChangeDetectionStrategy.Default`.
- `ComponentFixture.whenStable` now matches the
  `ApplicationRef.isStable` observable. Prior to this change, stability
  of the fixture did not include everything that was considered in
  `ApplicationRef`. `whenStable` of the fixture will now include unfinished
  router navigations and unfinished `HttpClient` requests. This will cause
  tests that `await` the `whenStable` promise to time out when there are
  incomplete requests. To fix this, remove the `whenStable`,
  instead wait for another condition, or ensure `HttpTestingController`
  mocks responses for all requests. Try adding `HttpTestingController.verify()`
  before your `await fixture.whenStable` to identify the open requests.
  Also, make sure your tests wait for the stability promise. We found many
  examples of tests that did not, meaning the expectations did not execute
  within the test body.

  In addition, `ComponentFixture.isStable` would synchronously switch to
  true in some scenarios but will now always be asynchronous.
- Angular will ensure change detection runs, even when the state update originates from
  outside the zone, tests may observe additional rounds of change
  detection compared to the previous behavior.

  This change will be more likely to impact existing unit tests.
  This should usually be seen as more correct and the test should be updated,
  but in cases where it is too much effort to debug, the test can revert to the old behavior by adding
  `provideZoneChangeDetection({schedulingMode: NgZoneSchedulingMode.NgZoneOnly})`
  to the `TestBed` providers.

  Similarly, applications which may want to update state outside the zone
  and _not_ trigger change detection can add
  `provideZoneChangeDetection({schedulingMode: NgZoneSchedulingMode.NgZoneOnly})`
  to the providers in `bootstrapApplication` or add
  `schedulingMode: NgZoneSchedulingMode.NgZoneOnly` to the
  `BootstrapOptions` of `bootstrapModule`.
- When Angular runs change detection, it will continue to
  refresh any views attached to `ApplicationRef` that are still marked for
  check after one round completes. In rare cases, this can result in infinite
  loops when certain patterns continue to mark views for check using
  `ChangeDetectorRef.detectChanges`. This will be surfaced as a runtime
  error with the `NG0103` code.
- `async` has been removed, use `waitForAsync` instead.
- The `ComponentFixture.autoDetect` feature now executes
  change detection for the fixture within `ApplicationRef.tick`. This more
  closely matches the behavior of how a component would refresh in
  production. The order of component refresh in tests may be slightly
  affected as a result, especially when dealing with additional components
  attached to the application, such as dialogs. Tests sensitive to this
  type of change (such as screenshot tests) may need to be updated.
  Concretely, this change means that the component will refresh _before_
  additional views attached to `ApplicationRef` (i.e. dialog components).
  Prior to this change, the fixture component would refresh _after_ other
  views attached to the application.
- The exact timing of change detection execution when
  using event or run coalescing with `NgZone` is now the first of either
  `setTimeout` or `requestAnimationFrame`. Code which relies on this
  timing (usually by accident) will need to be adjusted. If a callback
  needs to execute after change detection, we recommend `afterNextRender`
  instead of something like `setTimeout`.
- Newly created and views marked for check and reattached
  during change detection are now guaranteed to be refreshed in that same
  change detection cycle. Previously, if they were attached at a location
  in the view tree that was already checked, they would either throw
  `ExpressionChangedAfterItHasBeenCheckedError` or not be refreshed until
  some future round of change detection. In rare circumstances, this
  correction can cause issues. We identified one instance that relied on
  the previous behavior by reading a value on initialization which was
  queued to be updated in a microtask instead of being available in the
  current change detection round. The component only read this value during
  initialization and did not read it again after the microtask updated it.
- Testability methods `increasePendingRequestCount`,
  `decreasePendingRequestCount` and `getPendingRequestCount` have been
  removed. This information is tracked with zones.
### http
- By default we now prevent caching of HTTP requests that require authorization . To opt-out from this behaviour use the `includeRequestsWithAuthHeaders` option in `withHttpTransferCache`.

  Example:
  ```ts
  withHttpTransferCache({
    includeRequestsWithAuthHeaders: true,
  })
  ```
### platform-browser
- Deprecated `StateKey`, `TransferState` and `makeStateKey` have been removed from `@angular/platform-browser`, use the same APIs from `@angular/core`.
### platform-browser-dynamic
- No longer used `RESOURCE_CACHE_PROVIDER` APIs have been removed.
### platform-server
- deprecated `platformDynamicServer` has been removed. Add an `import @angular/compiler` and replace the usage with `platformServer`
- deprecated `ServerTransferStateModule` has been removed. `TransferState` can be use without providing this module.
- deprecated `useAbsoluteUrl` and `baseUrl` been removed from `PlatformConfig`. Provide and absolute `url` instead.
- Legacy handling or Node.js URL parsing has been removed from `ServerPlatformLocation`.

  The main differences are;
    - `pathname` is always suffixed with a `/`.
    - `port` is empty when `http:` protocol and port in url is `80`
   - `port` is empty when `https:` protocol and port in url is `443`
### router
- Guards can now return `RedirectCommand` for redirects
  in addition to `UrlTree`. Code which expects only `boolean` or `UrlTree`
  values in `Route` types will need to be adjusted.
- This change allows `Route.redirectTo` to be a function
  in addition to the previous string. Code which expects `redirectTo` to
  only be a string on `Route` objects will need to be adjusted.
- When a a guard returns a `UrlTree` as a redirect, the
  redirecting navigation will now use `replaceUrl` if the initial
  navigation was also using the `replaceUrl` option. If this is not
  desirable, the redirect can configure new `NavigationBehaviorOptions` by
  returning a `RedirectCommand` with the desired options instead of `UrlTree`.
- Providers available to the routed components always
  come from the injector heirarchy of the routes and never inherit from
  the `RouterOutlet`. This means that providers available only to the
  component that defines the `RouterOutlet` will no longer be available to
  route components in any circumstances. This was already the case
  whenever routes defined providers, either through lazy loading an
  `NgModule` or through explicit `providers` on the route config.
- Providers available to the routed components always
  come from the injector heirarchy of the routes and never inherit from
  the `RouterOutlet`. This means that providers available only to the
  component that defines the `RouterOutlet` will no longer be available to
  route components in any circumstances. This was already the case
  whenever routes defined providers, either through lazy loading an
  `NgModule` or through explicit `providers` on the route config.
## Deprecations
### common
- `getCurrencySymbol`, `getLocaleCurrencyCode`, `getLocaleCurrencyName`, `getLocaleCurrencySymbol`, `getLocaleDateFormat`, `getLocaleDateTimeFormat`, `getLocaleDayNames`, `getLocaleDayPeriods`, `getLocaleDirection`, `getLocaleEraNames`, `getLocaleExtraDayPeriodRules`, `getLocaleExtraDayPeriods`, `getLocaleFirstDayOfWeek`, `getLocaleId`, `getLocaleMonthNames`, `getLocaleNumberFormat`, `getLocaleNumberSymbol`, `getLocalePluralCase`, `getLocaleTimeFormat`, `getLocaleWeekEndRange`, `getNumberOfCurrencyDigits`
### core
- `@Component.interpolation` is deprecated. Use Angular's
  delimiters instead.
### http
- `HttpClientModule`, `HttpClientXsrfModule` and `HttpClientJsonpModule`

  As mentionned, those modules can be replaced by provider function only.
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [bcce85af72](https://github.com/angular/angular/commit/bcce85af72a82634f60b31d66a5ef42ecd844ce8) | refactor | remove deprecated `matchesElement` from `AnimationDriver` ([#55479](https://github.com/angular/angular/pull/55479)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [d34c033902](https://github.com/angular/angular/commit/d34c033902b4e7543796de6c57d0cfd09093eb43) | refactor | Deprecate Local Data API functions ([#54483](https://github.com/angular/angular/pull/54483)) |
| [3b0de30b37](https://github.com/angular/angular/commit/3b0de30b37f558d4815ca9a61db1010aaf3df068) | refactor | remove deprecated `isPlatformWorkerApp` and `isPlatformWorkerUi` API ([#55302](https://github.com/angular/angular/pull/55302)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [91b007e58f](https://github.com/angular/angular/commit/91b007e58ffb91f7c396cbc0333a91d18f02bd27) | fix | add math elements to schema ([#55631](https://github.com/angular/angular/pull/55631)) |
| [33d0102304](https://github.com/angular/angular/commit/33d0102304e2213ee0af0bc86028a4f564c81ed4) | fix | allow comments between connected blocks ([#55966](https://github.com/angular/angular/pull/55966)) |
| [7fc7f3f05f](https://github.com/angular/angular/commit/7fc7f3f05f0139dd773032fd5ad308f8d2a9fcf5) | fix | capture all control flow branches for content projection in if blocks ([#54921](https://github.com/angular/angular/pull/54921)) |
| [a369f43fbd](https://github.com/angular/angular/commit/a369f43fbdf45456bbae1caf71ef7becd15d1e90) | fix | capture switch block cases for content projection ([#54921](https://github.com/angular/angular/pull/54921)) |
| [eb625d3783](https://github.com/angular/angular/commit/eb625d37839c3b9f20a2ffb3af06426f9910c8ac) | fix | declare for loop aliases in addition to new name ([#54942](https://github.com/angular/angular/pull/54942)) |
| [f824911510](https://github.com/angular/angular/commit/f8249115102204dbb957a0d292ed5342ea5108e9) | fix | For `FatalDiagnosticError`, hide the `message` field without affecting the emit ([#55160](https://github.com/angular/angular/pull/55160)) |
| [a040fb720a](https://github.com/angular/angular/commit/a040fb720af7db08b328a9f78511c9881f50482d) | fix | maintain multiline CSS selectors during CSS scoping ([#55509](https://github.com/angular/angular/pull/55509)) |
| [39624c6b12](https://github.com/angular/angular/commit/39624c6b129252af352c22c6d6f12ef153477bfc) | fix | output input flags as a literal ([#55215](https://github.com/angular/angular/pull/55215)) |
| [eba92cfa55](https://github.com/angular/angular/commit/eba92cfa55500f3558c02edd0aa348ae118794e0) | fix | prevent usage of reserved control flow symbol in custom interpolation context. ([#55809](https://github.com/angular/angular/pull/55809)) |
| [7d5bc1c628](https://github.com/angular/angular/commit/7d5bc1c62870d9c68e06eddec229a9b8988e92ee) | fix | remove container index from conditional instruction ([#55190](https://github.com/angular/angular/pull/55190)) |
| [4eb0165750](https://github.com/angular/angular/commit/4eb0165750d8c65812502343a70ef4cc35c725b9) | fix | remove support for unassignable expressions in two-way bindings ([#55342](https://github.com/angular/angular/pull/55342)) |
| [e1650e3b13](https://github.com/angular/angular/commit/e1650e3b13556ab09c919cfdf97913fa0291622c) | fix | throw error if item name and context variables conflict ([#55045](https://github.com/angular/angular/pull/55045)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [5bd188a394](https://github.com/angular/angular/commit/5bd188a394d30053099e2c83fe79136d590e5399) | feat | add partial compilation support for deferred blocks ([#54908](https://github.com/angular/angular/pull/54908)) |
| [b02b31a915](https://github.com/angular/angular/commit/b02b31a915333e680cf96de5d0f965a6e2639028) | feat | drop support for TypeScript older than 5.4 ([#54961](https://github.com/angular/angular/pull/54961)) |
| [78188e877a](https://github.com/angular/angular/commit/78188e877a4db8655bdd3dc5012b70b12a7234de) | fix | add diagnostic if initializer API is used outside of an initializer ([#54993](https://github.com/angular/angular/pull/54993)) |
| [69a83993b3](https://github.com/angular/angular/commit/69a83993b3772dd98cc10d3e12b0ca6c66293cf2) | fix | do not throw when retrieving TCB symbol for signal input with restricted access ([#55774](https://github.com/angular/angular/pull/55774)) |
| [4f4f41016e](https://github.com/angular/angular/commit/4f4f41016e897c3fab77ffc23fcfeddadaa782c1) | fix | dom property binding check in signal extended diagnostic ([#54324](https://github.com/angular/angular/pull/54324)) |
| [7a16d7e969](https://github.com/angular/angular/commit/7a16d7e969eaf5a9475ffdd21a4bf637ce523856) | fix | don't type check the bodies of control flow nodes in basic mode ([#55360](https://github.com/angular/angular/pull/55360)) |
| [8d93597a82](https://github.com/angular/angular/commit/8d93597a82860112a5398828745653a7e27dcef0) | fix | fix type narrowing of `@if` with aliases ([#55835](https://github.com/angular/angular/pull/55835)) |
| [9b424d7224](https://github.com/angular/angular/commit/9b424d7224db46edb16c81979c7e231d5e3db5e9) | fix | preserve original reference to non-deferrable dependency ([#54759](https://github.com/angular/angular/pull/54759)) |
| [694ba79cbf](https://github.com/angular/angular/commit/694ba79cbf7aaed1079b1fabf53ea446162fc933) | fix | report cases where initializer APIs are used in a non-directive class ([#54993](https://github.com/angular/angular/pull/54993)) |
| [6219341d26](https://github.com/angular/angular/commit/6219341d267ae7689299835b90f0afa0fe61e213) | fix | report errors when initializer APIs are used on private fields ([#54981](https://github.com/angular/angular/pull/54981)) |
| [c04ffb1fa6](https://github.com/angular/angular/commit/c04ffb1fa61f5164ee5eb7c05b7d76292042ff0b) | fix | use switch statements to narrow Angular switch blocks ([#55168](https://github.com/angular/angular/pull/55168)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a730f09ae9](https://github.com/angular/angular/commit/a730f09ae9e729da79a3e0951e15e0139ef67713) | feat | Add a public API to establish events to be replayed and an attribute to mark an element with an event handler. ([#55356](https://github.com/angular/angular/pull/55356)) |
| [fdd560ea14](https://github.com/angular/angular/commit/fdd560ea14f2f35608e26102c7fac0471a634b3e) | feat | Add ability to configure zone change detection to use zoneless scheduler ([#55252](https://github.com/angular/angular/pull/55252)) |
| [bce5e2344f](https://github.com/angular/angular/commit/bce5e2344f312dc3a8a30d54e412958bd07180c1) | feat | Add build target for jsaction contract binary. ([#55319](https://github.com/angular/angular/pull/55319)) |
| [666d646575](https://github.com/angular/angular/commit/666d646575800e9326eebd513776f8e92b0357e9) | feat | Add event delegation library to queue up events and replay them when the application is ready ([#55121](https://github.com/angular/angular/pull/55121)) |
| [5f06ca8f55](https://github.com/angular/angular/commit/5f06ca8f5539ed208bae0b110887b5538ac4041f) | feat | add HOST_TAG_NAME token ([#54751](https://github.com/angular/angular/pull/54751)) |
| [a600a39d0c](https://github.com/angular/angular/commit/a600a39d0cf9bb8fc2b6786e6f31acb78b7acc6e) | feat | add support for fallback content in ng-content ([#54854](https://github.com/angular/angular/pull/54854)) |
| [146306a141](https://github.com/angular/angular/commit/146306a1417c378920d80a6d91fd847f22e407ab) | feat | add support for i18n hydration ([#54823](https://github.com/angular/angular/pull/54823)) |
| [f09c5a7bc4](https://github.com/angular/angular/commit/f09c5a7bc455a59aea133264cbf9fd9ef7509a7f) | feat | Add zoneless change detection provider as experimental ([#55329](https://github.com/angular/angular/pull/55329)) |
| [d28614b90e](https://github.com/angular/angular/commit/d28614b90eff835639747e8961fe61e874c44666) | feat | Modify EventType from an enum to an object. ([#55323](https://github.com/angular/angular/pull/55323)) |
| [ac863ded48](https://github.com/angular/angular/commit/ac863ded4818af3426ef5888c706a2bd8c79c0be) | feat | provide ExperimentalPendingTasks API ([#55487](https://github.com/angular/angular/pull/55487)) |
| [1ee9f32621](https://github.com/angular/angular/commit/1ee9f32621f6d72e8038a08f5ad4a0cfe8bd6a13) | feat | Synchronize changes from internal JSAction codebase. ([#55182](https://github.com/angular/angular/pull/55182)) |
| [d888da4606](https://github.com/angular/angular/commit/d888da460696ee74bb4c10a19ac49e3fa1948399) | fix | `ApplicationRef.tick` should respect OnPush for host bindings ([#53718](https://github.com/angular/angular/pull/53718)) |
| [64f870c12b](https://github.com/angular/angular/commit/64f870c12bae1ad66509f0d65f8d3e051aae6eaa) | fix | `ApplicationRef.tick` should respect OnPush for host bindings ([#53718](https://github.com/angular/angular/pull/53718)) ([#53718](https://github.com/angular/angular/pull/53718)) |
| [8cad4e8cbe](https://github.com/angular/angular/commit/8cad4e8cbe2baf20dae7b7ef1f4253a4940cbba0) | fix | `ComponentFixture` `autoDetect` respects `OnPush` flag of host view ([#54824](https://github.com/angular/angular/pull/54824)) |
| [658cf8c384](https://github.com/angular/angular/commit/658cf8c3840b637284a5bb6c9751226d24ccbf9f) | fix | `ComponentFixture` stability should match `ApplicationRef` ([#54949](https://github.com/angular/angular/pull/54949)) |
| [2fc11eae9e](https://github.com/angular/angular/commit/2fc11eae9ea65160866bf7ba46c10520ae9a141f) | fix | account for re-projected ng-content elements with fallback content ([#54854](https://github.com/angular/angular/pull/54854)) |
| [0cbd73c6e9](https://github.com/angular/angular/commit/0cbd73c6e9931dc4938054fc6f7831bdee2606a4) | fix | add warning when using zoneless but zone.js is still loaded ([#55769](https://github.com/angular/angular/pull/55769)) |
| [d5edfde6ee](https://github.com/angular/angular/commit/d5edfde6ee3d65bf7f938ecfeac9f30633f8731b) | fix | afterRender hooks registered outside change detection can mark views dirty ([#55623](https://github.com/angular/angular/pull/55623)) |
| [de7447d15e](https://github.com/angular/angular/commit/de7447d15ed964ae26f0dace4cb3b08f5cccb1c1) | fix | Angular should not ignore changes that happen outside the zone ([#55102](https://github.com/angular/angular/pull/55102)) |
| [ba8e465974](https://github.com/angular/angular/commit/ba8e46597435a827670f10b971b2c58f7033b180) | fix | Change Detection will continue to refresh views while marked for check ([#54734](https://github.com/angular/angular/pull/54734)) |
| [5a10f405d3](https://github.com/angular/angular/commit/5a10f405d315a28b9a000c669e9b1cb3fa24a7f1) | fix | complete the removal of deprecation `async` function ([#55491](https://github.com/angular/angular/pull/55491)) |
| [24bc0ed4f2](https://github.com/angular/angular/commit/24bc0ed4f2de47bd998338d73cba394fb45dd497) | fix | ComponentFixture autodetect should detect changes within ApplicationRef.tick ([#54733](https://github.com/angular/angular/pull/54733)) |
| [1c0ec56c46](https://github.com/angular/angular/commit/1c0ec56c462cf18fb38aae29858165a08b5a2a82) | fix | correctly project single-root content inside control flow ([#54921](https://github.com/angular/angular/pull/54921)) |
| [840c375255](https://github.com/angular/angular/commit/840c375255dc381674bb27746d9ababd14567c33) | fix | do not save point-in-time `setTimeout` and `rAF` references ([#55124](https://github.com/angular/angular/pull/55124)) |
| [10c5cdb49c](https://github.com/angular/angular/commit/10c5cdb49c51c95086febd37f4d88a9b944d7e1c) | fix | ensure change detection runs in a reasonable timeframe with zone coalescing ([#54578](https://github.com/angular/angular/pull/54578)) |
| [ad045efd4b](https://github.com/angular/angular/commit/ad045efd4b1565e01c14399998143538ebfbfd99) | fix | Ensure views marked for check are refreshed during change detection ([#54735](https://github.com/angular/angular/pull/54735)) |
| [69085ea26e](https://github.com/angular/angular/commit/69085ea26e11f372578999337b2d8f099600b630) | fix | error about provideExperimentalCheckNoChangesForDebug uses wrong name ([#55824](https://github.com/angular/angular/pull/55824)) |
| [0147e0b85a](https://github.com/angular/angular/commit/0147e0b85a4f1201b1ae5edaa0d2bc708a13673e) | fix | exhaustive checkNoChanges should only do a single pass ([#55839](https://github.com/angular/angular/pull/55839)) |
| [e02bcf89cf](https://github.com/angular/angular/commit/e02bcf89cf77c3118c649a7db68e66a78f16155c) | fix | Fix clearing of pending task in zoneless cleanup implementation ([#55074](https://github.com/angular/angular/pull/55074)) |
| [0cec9e4f9a](https://github.com/angular/angular/commit/0cec9e4f9a90ec59f0e9838dcbd82705b1709fc0) | fix | Fix null dereference error `addEvent` ([#55353](https://github.com/angular/angular/pull/55353)) |
| [44c0ed83a6](https://github.com/angular/angular/commit/44c0ed83a6499fa96f65a27bc5c926579c06b6d2) | fix | hide implementation details of ExperimentalPendingTasks ([#55516](https://github.com/angular/angular/pull/55516)) |
| [314112de99](https://github.com/angular/angular/commit/314112de99bb97475a0d8bdbddf84a3b3ce4a8fb) | fix | Prevent `markForCheck` during change detection from causing infinite loops ([#54900](https://github.com/angular/angular/pull/54900)) |
| [a5fa279b6e](https://github.com/angular/angular/commit/a5fa279b6e9f5ab4005d6d33107f0e1bb48d05de) | fix | prevent i18n hydration from cleaning projected nodes ([#54823](https://github.com/angular/angular/pull/54823)) |
| [6534c035c0](https://github.com/angular/angular/commit/6534c035c099b30987d6fd1346aea454b79cc79d) | fix | Remove deprecated Testability methods ([#53768](https://github.com/angular/angular/pull/53768)) |
| [a5c57c7484](https://github.com/angular/angular/commit/a5c57c7484f1dc3afab4ece4e969a4a7308cdeca) | fix | resolve error for multiple component instances that use fallback content ([#55478](https://github.com/angular/angular/pull/55478)) |
| [f44a5e4604](https://github.com/angular/angular/commit/f44a5e460491a29e5c0cad5577bade8347d52e11) | fix | support content projection and VCRs in i18n ([#54823](https://github.com/angular/angular/pull/54823)) |
| [0510930a25](https://github.com/angular/angular/commit/0510930a257e610460c875dbbc5566fd06547814) | fix | TestBed should not override NgZone from initTestEnvironment ([#55226](https://github.com/angular/angular/pull/55226)) |
| [e9a0c86766](https://github.com/angular/angular/commit/e9a0c86766ab15c896e026120f0c63c2fb1f9e04) | fix | TestBed should not override NgZone from initTestEnvironment ([#55226](https://github.com/angular/angular/pull/55226)) |
| [700c0520bb](https://github.com/angular/angular/commit/700c0520bb638952ba41a8d8260cf12afb078c0e) | fix | Update ApplicationRef.tick loop to only throw in dev mode ([#54848](https://github.com/angular/angular/pull/54848)) |
| [a99cb7ce5b](https://github.com/angular/angular/commit/a99cb7ce5b77a125ab660da8ebef23ecb158e2e3) | fix | zoneless scheduler should check if Zone is defined before accessing it ([#55118](https://github.com/angular/angular/pull/55118)) |
| [1fd63e9cff](https://github.com/angular/angular/commit/1fd63e9cff9159a8c10c35a0af43bc986e4e8e26) | refactor | deprecate `@Component.interpolation` ([#55778](https://github.com/angular/angular/pull/55778)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [1c736dc3b2](https://github.com/angular/angular/commit/1c736dc3b258a502360cda40b3a00c07102ccbf5) | feat | Unified Control State Change Events ([#54579](https://github.com/angular/angular/pull/54579)) |
| [61007dced0](https://github.com/angular/angular/commit/61007dced0f3396c40efcd2617c130633fb9837a) | fix | Add event for forms submitted & reset ([#55667](https://github.com/angular/angular/pull/55667)) |
| [2e27ca9ddf](https://github.com/angular/angular/commit/2e27ca9ddfc1f3f0387cd720071e85ff46f19db6) | fix | Allow canceled async validators to emit. ([#55134](https://github.com/angular/angular/pull/55134)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [6f88d80758](https://github.com/angular/angular/commit/6f88d8075895bd80592b1b7e0fba8202a58a5417) | feat | allow caching requests with different origins between server and client ([#55274](https://github.com/angular/angular/pull/55274)) |
| [8eacb6e4b9](https://github.com/angular/angular/commit/8eacb6e4b982a5aa23cfbf9078dc4e19d9466d73) | feat | exclude caching for authenticated HTTP requests ([#55034](https://github.com/angular/angular/pull/55034)) |
| [d9b339fdbc](https://github.com/angular/angular/commit/d9b339fdbc0f8d1e9bb7b1e4190e7d80e68542f9) | fix | resolve `withRequestsMadeViaParent` behavior with `withFetch` ([#55652](https://github.com/angular/angular/pull/55652)) |
| [ef665a40a5](https://github.com/angular/angular/commit/ef665a40a580ff4df79617084ac83738f28ae924) | refactor | Deprecate `HttpClientModule` & related modules ([#54020](https://github.com/angular/angular/pull/54020)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [6d1b82df32](https://github.com/angular/angular/commit/6d1b82df32049cfaba2f6a50b9639b6e3b722170) | fix | allow external projects to use provided compiler options ([#55035](https://github.com/angular/angular/pull/55035)) |
| [a48afe0d94](https://github.com/angular/angular/commit/a48afe0d9478aca314e68552f4af77f4123563cd) | fix | avoid generating TS syntactic diagnostics for templates ([#55091](https://github.com/angular/angular/pull/55091)) |
| [bd236cc150](https://github.com/angular/angular/commit/bd236cc150e1b21932612ecf91678be77a503d18) | fix | implement getDefinitionAtPosition for Angular templates ([#55269](https://github.com/angular/angular/pull/55269)) |
| [4166dfc1b6](https://github.com/angular/angular/commit/4166dfc1b62a83b60203bfe45a6d4aa7148a0b23) | fix | prevent underlying TS Service from handling template files ([#55003](https://github.com/angular/angular/pull/55003)) |
| [b7f2fd4739](https://github.com/angular/angular/commit/b7f2fd473988a561bfd032386d8955e90c8d91ed) | fix | use type-only import in plugin factory ([#55996](https://github.com/angular/angular/pull/55996)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [f914f6a362](https://github.com/angular/angular/commit/f914f6a3628847c06cbdde9c90cd417fb2f4c61f) | feat | Migration schematics for `HttpClientModule` ([#54020](https://github.com/angular/angular/pull/54020)) |
| [8459ee46cb](https://github.com/angular/angular/commit/8459ee46cba7f63966c41a2fb7199ec295a91cbb) | fix | handle more cases in HttpClientModule migration ([#55640](https://github.com/angular/angular/pull/55640)) |
| [c4b2f18709](https://github.com/angular/angular/commit/c4b2f18709076f8c400bd26226be37ae07e5e83d) | fix | migrate HttpClientTestingModule in test modules ([#55803](https://github.com/angular/angular/pull/55803)) |
| [bb4a4016a9](https://github.com/angular/angular/commit/bb4a4016a9a29a9c56342ee01d866b0c8a3fb419) | fix | preserve existing properties in HttpClientModule migration ([#55777](https://github.com/angular/angular/pull/55777)) |
| [f93e5180be](https://github.com/angular/angular/commit/f93e5180be1e20a59ff68f12853653f4f3282846) | fix | resolve multiple structural issues with HttpClient migration ([#55557](https://github.com/angular/angular/pull/55557)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [45ae7a6b60](https://github.com/angular/angular/commit/45ae7a6b60019bd49b8a58122a0d5bcbda7e245b) | feat | add withI18nSupport() in developer preview ([#55130](https://github.com/angular/angular/pull/55130)) |
| [23f914f101](https://github.com/angular/angular/commit/23f914f1012545330f6a5aeed4e862bf0e66117b) | fix | Use the right namespace for mathML. ([#55622](https://github.com/angular/angular/pull/55622)) |
| [cba336d4f1](https://github.com/angular/angular/commit/cba336d4f1badd601b24a58fc51bde995f45682d) | refactor | remove deprecated transfer state APIs ([#55474](https://github.com/angular/angular/pull/55474)) |
### platform-browser-dynamic
| Commit | Type | Description |
| -- | -- | -- |
| [eb20c1a8b1](https://github.com/angular/angular/commit/eb20c1a8b18e2e080c856e3e1bf7bcd02f3bfd28) | refactor | unused `RESOURCE_CACHE_PROVIDER` API has been removed ([#54875](https://github.com/angular/angular/pull/54875)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [5674c644ab](https://github.com/angular/angular/commit/5674c644abf51ae8764befd3011742ff1febdf29) | fix | add `nonce` attribute to event record script ([#55495](https://github.com/angular/angular/pull/55495)) |
| [e71e869112](https://github.com/angular/angular/commit/e71e869112af1c0ee7a9dd64a963ad7af14a40e2) | fix | remove event dispatch script from HTML when hydration is disabled ([#55681](https://github.com/angular/angular/pull/55681)) |
| [07ac017731](https://github.com/angular/angular/commit/07ac017731f0e08ea3736f1f212093a28648a304) | refactor | remove deprecated `platformDynamicServer` API ([#54874](https://github.com/angular/angular/pull/54874)) |
| [e8b588d8b7](https://github.com/angular/angular/commit/e8b588d8b7fc014aaef99d4b0c1e4567b4aa195d) | refactor | remove deprecated `ServerTransferStateModule` API ([#54874](https://github.com/angular/angular/pull/54874)) |
| [3b1967ca64](https://github.com/angular/angular/commit/3b1967ca64479df9137b3ad7a0d04dbaff6496f4) | refactor | remove deprecated `useAbsoluteUrl` and `baseUrl` from `PlatformConfig` ([#54874](https://github.com/angular/angular/pull/54874)) |
| [2357d3566c](https://github.com/angular/angular/commit/2357d3566c4d18dc40cbda6644ed459ef7703893) | refactor | remove legacy URL handling logic ([#54874](https://github.com/angular/angular/pull/54874)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [4a42961393](https://github.com/angular/angular/commit/4a42961393b3abf40f34374df059d3959dadecc0) | feat | `withNavigationErrorHandler` can convert errors to redirects ([#55370](https://github.com/angular/angular/pull/55370)) |
| [8735af08b9](https://github.com/angular/angular/commit/8735af08b976b30cf236a83f9e8b64b5ff62e9f3) | feat | Add ability to return `UrlTree` with `NavigationBehaviorOptions` from guards ([#45023](https://github.com/angular/angular/pull/45023)) |
| [87f3f27f90](https://github.com/angular/angular/commit/87f3f27f9087d757e18e8e2a0f2fca6f2a2c7edf) | feat | Allow resolvers to return `RedirectCommand` ([#54556](https://github.com/angular/angular/pull/54556)) |
| [2b802587f2](https://github.com/angular/angular/commit/2b802587f27186baa493c1dd01f42d568b652f38) | feat | Allow Route.redirectTo to be a function which returns a string or UrlTree ([#52606](https://github.com/angular/angular/pull/52606)) |
| [60f1d681e0](https://github.com/angular/angular/commit/60f1d681e0ba66d3d94b0819f2c612f095c2d3d3) | fix | preserve replaceUrl when returning a urlTree from CanActivate ([#54042](https://github.com/angular/angular/pull/54042)) |
| [3839cfbb18](https://github.com/angular/angular/commit/3839cfbb18fcc70cae5a6ba4ba7676b1c4acf7a0) | fix | Routed components never inherit `RouterOutlet` `EnvironmentInjector` ([#54265](https://github.com/angular/angular/pull/54265)) |
| [da906fdafc](https://github.com/angular/angular/commit/da906fdafcbb302fa280a162d1c1f04369be2efa) | fix | Routed components never inherit `RouterOutlet` `EnvironmentInjector` ([#54265](https://github.com/angular/angular/pull/54265)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [3bc63eaaf3](https://github.com/angular/angular/commit/3bc63eaaf344712ac6de1c9618d4558d9443c848) | fix | avoid running CDs on `controllerchange` ([#54222](https://github.com/angular/angular/pull/54222)) |
| [e598634c10](https://github.com/angular/angular/commit/e598634c10a60936ec4199b221eca4e901220763) | fix | remove `controllerchange` listener when app is destroyed ([#55365](https://github.com/angular/angular/pull/55365)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.9"></a>
# 17.3.9 (2024-05-15)

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.8"></a>
# 17.3.8 (2024-05-08)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c21b459ba6](https://github.com/angular/angular/commit/c21b459ba6520fd5835e23800338ac9c997fee91) | fix | add math elements to schema ([#55631](https://github.com/angular/angular/pull/55631)) ([#55645](https://github.com/angular/angular/pull/55645)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3818436ebc](https://github.com/angular/angular/commit/3818436ebc649267bb39b976b6b567b7f2b06a64) | fix | don't schedule timer triggers on the server ([#55605](https://github.com/angular/angular/pull/55605)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.7"></a>
# 17.3.7 (2024-05-01)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [51ac883167](https://github.com/angular/angular/commit/51ac8831670637b562dfa135bec1e27a0b49f21d) | fix | don't type check the bodies of control flow nodes in basic mode ([#55558](https://github.com/angular/angular/pull/55558)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [af0eb846a5](https://github.com/angular/angular/commit/af0eb846a572d0e9de2c6bb7016ddd339473dc00) | fix | render hooks should not specifically run outside the Angular zone ([#55399](https://github.com/angular/angular/pull/55399)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [3eea50da64](https://github.com/angular/angular/commit/3eea50da644f6023e7f001b8738c54cb89aece4c) | fix | Scroller should scroll as soon as change detection completes ([#55105](https://github.com/angular/angular/pull/55105)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.6"></a>
# 17.3.6 (2024-04-25)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [826861b1fa](https://github.com/angular/angular/commit/826861b1fa7693010743f5dd881fb31ec33eee52) | fix | DeferBlockFixture.render should not wait for stability ([#55271](https://github.com/angular/angular/pull/55271)) |
| [5cf14da35c](https://github.com/angular/angular/commit/5cf14da35cce1ea4456bae4365d3dbe6667b1881) | fix | make `ActivatedRoute` inject correct instance inside `@defer` blocks ([#55374](https://github.com/angular/angular/pull/55374)) |
| [8979fba2c5](https://github.com/angular/angular/commit/8979fba2c5813673767a133caeec9ac768d17329) | fix | skip defer timers on the server ([#55480](https://github.com/angular/angular/pull/55480)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.5"></a>
# 17.3.5 (2024-04-17)

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.4"></a>
# 17.3.4 (2024-04-10)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [53427d875d](https://github.com/angular/angular/commit/53427d875d33de16b1dbb04e76a9fe32a2b8a445) | fix | invalid ImageKit quality parameter ([#55193](https://github.com/angular/angular/pull/55193)) |
| [766548c3ec](https://github.com/angular/angular/commit/766548c3ecc06ffd8f06ed9a7d0cbb3db6f1b0f6) | fix | skip transfer cache on client ([#55012](https://github.com/angular/angular/pull/55012)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.2"></a>
# 17.3.2 (2024-03-28)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [2b7bad5151](https://github.com/angular/angular/commit/2b7bad515100cbfa40b3e8d844bae13d43fd5602) | fix | invoke method-based tracking function with context ([#54960](https://github.com/angular/angular/pull/54960)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b478dfbfda](https://github.com/angular/angular/commit/b478dfbfda3f32fbe723a1e8725e86490422520d) | fix | report errors when initializer APIs are used on private fields ([#55070](https://github.com/angular/angular/pull/55070)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [708ba8115f](https://github.com/angular/angular/commit/708ba8115f7ad05201db5c529aefe4dd48fc64c5) | fix | establish proper injector resolution order for `@defer` blocks ([#55079](https://github.com/angular/angular/pull/55079)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [cb433af0e1](https://github.com/angular/angular/commit/cb433af0e1ba61073eb4a02ccd75cf360e9fd409) | fix | include transferCache when cloning HttpRequest ([#54939](https://github.com/angular/angular/pull/54939)) |
| [64f202cab9](https://github.com/angular/angular/commit/64f202cab9e7a5c873b17bbddd02368006426152) | fix | manage different body types for caching POST requests ([#54980](https://github.com/angular/angular/pull/54980)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [2f9d94bc4a](https://github.com/angular/angular/commit/2f9d94bc4ab5a94e620a13404aba4e094f8b2344) | fix | account for variables in imports initializer ([#55081](https://github.com/angular/angular/pull/55081)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [365fd50407](https://github.com/angular/angular/commit/365fd504077d0e7509efc3077ea4ae8bbafb01f7) | fix | RouterLinkActive will always remove active classes when links are not active ([#54982](https://github.com/angular/angular/pull/54982)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.1"></a>
# 17.3.1 (2024-03-20)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c0788200e2](https://github.com/angular/angular/commit/c0788200e26406bacb90ee0079ea9753eebd1b32) | fix | capture data bindings for content projection purposes in blocks ([#54876](https://github.com/angular/angular/pull/54876)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [99e9474aa2](https://github.com/angular/angular/commit/99e9474aa2ccccdf4385fbac6b62b1a4585ed4b4) | fix | symbol feature detection for the compiler ([#54711](https://github.com/angular/angular/pull/54711)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.3.0"></a>
# 17.3.0 (2024-03-13)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1a6beae8a2](https://github.com/angular/angular/commit/1a6beae8a2bdcff27d4c1e402f98246a52247906) | feat | Enable template pipeline by default. ([#54571](https://github.com/angular/angular/pull/54571)) |
| [f386a04c9d](https://github.com/angular/angular/commit/f386a04c9ddc2951c8105d5cafcce7b4bedea569) | fix | handle two-way bindings to signal-based template variables in instruction generation ([#54714](https://github.com/angular/angular/pull/54714)) |
| [1f129f114e](https://github.com/angular/angular/commit/1f129f114edb21137d74471dd6b652848d2ffb68) | fix | not catching for loop empty tracking expressions ([#54772](https://github.com/angular/angular/pull/54772)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [12dc4d074e](https://github.com/angular/angular/commit/12dc4d074e63edaff626003ad6136a8d122b2ba6) | fix | account for as expression in docs extraction ([#54414](https://github.com/angular/angular/pull/54414)) |
| [da7fbb40f0](https://github.com/angular/angular/commit/da7fbb40f06e6e37504f69e7b335f8219f424de2) | fix | detect when the linker is working in unpublished angular and widen supported versions ([#54439](https://github.com/angular/angular/pull/54439)) |
| [492e03f699](https://github.com/angular/angular/commit/492e03f699ca95df4cf854885253f63a5a1fb5c1) | fix | flag two-way bindings to non-signal values in templates ([#54714](https://github.com/angular/angular/pull/54714)) |
| [5afa4f0ec1](https://github.com/angular/angular/commit/5afa4f0ec1b64b88ef875d48bd143e0f36e0a955) | fix | support `ModuleWithProviders` literal detection with `typeof` ([#54650](https://github.com/angular/angular/pull/54650)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [331b16efd2](https://github.com/angular/angular/commit/331b16efd2f5af876e6dc0ad2474ee7a87b00de5) | feat | add API to inject attributes on the host node ([#54604](https://github.com/angular/angular/pull/54604)) |
| [fb540e169a](https://github.com/angular/angular/commit/fb540e169a78a61f38d611f538eea8fdb0971f1d) | feat | add migration for invalid two-way bindings ([#54630](https://github.com/angular/angular/pull/54630)) |
| [c687b8f453](https://github.com/angular/angular/commit/c687b8f4531252cd1c3dfbb9a7bd42bdbe666a36) | feat | expose new `output()` API ([#54650](https://github.com/angular/angular/pull/54650)) |
| [c809069f21](https://github.com/angular/angular/commit/c809069f213244afd0e2d803a6a43510b218e6f5) | feat | introduce `outputFromObservable()` interop function ([#54650](https://github.com/angular/angular/pull/54650)) |
| [aff65fd1f4](https://github.com/angular/angular/commit/aff65fd1f4a61ed76a6f9b623852f197eb3500e4) | feat | introduce `outputToObservable` interop helper ([#54650](https://github.com/angular/angular/pull/54650)) |
| [974958913c](https://github.com/angular/angular/commit/974958913ca632971f878a045537472f2c99c665) | feat | support TypeScript 5.4 ([#54414](https://github.com/angular/angular/pull/54414)) |
| [39a50f9a8d](https://github.com/angular/angular/commit/39a50f9a8df5afc4968d18924f3d9d7d6b649d3a) | fix | ensure all initializer functions run in an injection context ([#54761](https://github.com/angular/angular/pull/54761)) |
| [243ccce624](https://github.com/angular/angular/commit/243ccce62475ae03a2e727d2b3cb2d51a595c4a7) | fix | exclude class attribute intended for projection matching from directive matching ([#54800](https://github.com/angular/angular/pull/54800)) |
| [2909e9817d](https://github.com/angular/angular/commit/2909e9817daf69b6478d7d09229491a9a48cff16) | fix | prevent infinite loops in clobbered elements check ([#54425](https://github.com/angular/angular/pull/54425)) |
| [7243c704cf](https://github.com/angular/angular/commit/7243c704cf8a4986fae419793027458e142658f0) | fix | return a readonly signal on `asReadonly`. ([#54706](https://github.com/angular/angular/pull/54706)) |
| [bb35414a38](https://github.com/angular/angular/commit/bb35414a38f8a8447d03c66dc5bf60b84409f9e3) | perf | speed up retrieval of `DestroyRef` in `EventEmitter` ([#54748](https://github.com/angular/angular/pull/54748)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [8d37ed035c](https://github.com/angular/angular/commit/8d37ed035c9e9796ba9a7b1f055404ea220dbb3b) | fix | exclude caching for authenticated HTTP requests ([#54746](https://github.com/angular/angular/pull/54746)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [c1c7384e02](https://github.com/angular/angular/commit/c1c7384e02becc623c6a42985f7178ca98137264) | feat | Add reusable types for router guards ([#54580](https://github.com/angular/angular/pull/54580)) |
| [7225485311](https://github.com/angular/angular/commit/722548531108e247660ebe6966b99b57d510b615) | fix | Navigations triggered by cancellation events should cancel previous navigation ([#54710](https://github.com/angular/angular/pull/54710)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.4"></a>
# 17.2.4 (2024-03-06)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [917b9bdd2e](https://github.com/angular/angular/commit/917b9bdd2eec9cd6395adb0cbde979490bcc3a88) | fix | unwrap expressions with type parameters in query read property ([#54647](https://github.com/angular/angular/pull/54647)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [586cc24a10](https://github.com/angular/angular/commit/586cc24a102d51e7c42ecc839124353afe459073) | fix | apply TestBed provider overrides to `@defer` dependencies ([#54667](https://github.com/angular/angular/pull/54667)) |
| [b558a01c84](https://github.com/angular/angular/commit/b558a01c84a1fe4f9e047e92d99d69f02f2ccc4f) | fix | generic inference for signal inputs may break with `--strictFunctionTypes` ([#54652](https://github.com/angular/angular/pull/54652)) |
| [443e5f1591](https://github.com/angular/angular/commit/443e5f1591896909eab6ad157bb4b5db50a49f26) | fix | return a readonly signal on `asReadonly`. ([#54719](https://github.com/angular/angular/pull/54719)) |
| [ffbafc7d4a](https://github.com/angular/angular/commit/ffbafc7d4a3c61226cb5c524b3ff42ed4f9f1d76) | fix | untrack various core operations ([#54614](https://github.com/angular/angular/pull/54614)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.3"></a>
# 17.2.3 (2024-02-27)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [1a526f2881](https://github.com/angular/angular/commit/1a526f28814429c05b003edbe40500b7069e1404) | perf | `AsyncPipe` should not call `markForCheck` on subscription ([#54554](https://github.com/angular/angular/pull/54554)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [2aefed8763](https://github.com/angular/angular/commit/2aefed87632293c5570e17653a7d270162ea35c3) | fix | catch function instance properties in interpolated signal diagnostic ([#54325](https://github.com/angular/angular/pull/54325)) |
| [48aec63ee4](https://github.com/angular/angular/commit/48aec63ee48fe9d20c1f1565b044ec359100736d) | fix | identify aliased initializer functions ([#54480](https://github.com/angular/angular/pull/54480)) |
| [daf7c611b2](https://github.com/angular/angular/commit/daf7c611b23797ba2dba24e20e26c344902e7bc7) | fix | identify aliased initializer functions ([#54609](https://github.com/angular/angular/pull/54609)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [57123524a2](https://github.com/angular/angular/commit/57123524a2e1481987eaf239d2ae7f1216291864) | fix | collect providers from NgModules while rendering `@defer` block ([#52881](https://github.com/angular/angular/pull/52881)) |
| [79a32816dc](https://github.com/angular/angular/commit/79a32816dcb57e9b02ba6e18261c6dccd14b0b23) | fix | fix typo in injectors.svg file ([#54596](https://github.com/angular/angular/pull/54596)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [dbe673b027](https://github.com/angular/angular/commit/dbe673b02751b8bf12f6f6f79b843dd268d965e1) | fix | resolve infinite loop for a single line element with a long tag name and angle bracket on a new line ([#54588](https://github.com/angular/angular/pull/54588)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.2"></a>
# 17.2.2 (2024-02-21)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [d34e3298db](https://github.com/angular/angular/commit/d34e3298db2da9d3aa8f8e2c49e1d1aed849e7d2) | fix | image placeholder not removed in OnPush component ([#54515](https://github.com/angular/angular/pull/54515)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [6447c0eecc](https://github.com/angular/angular/commit/6447c0eecc15800417bb5bde2d273865c559b7d4) | fix | adding the inert property to the "SCHEMA" array ([#53148](https://github.com/angular/angular/pull/53148)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [0a3edfb543](https://github.com/angular/angular/commit/0a3edfb5433e1b67f37d7b3f69a5c77b48eedce6) | fix | correctly detect deferred dependencies across scoped nodes ([#54499](https://github.com/angular/angular/pull/54499)) |
| [790f4f7c26](https://github.com/angular/angular/commit/790f4f7c26474af2b1d81a4f3c761047bf920edf) | fix | use correct symbol name for default imported symbols in defer blocks ([#54495](https://github.com/angular/angular/pull/54495)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3bd5860c74](https://github.com/angular/angular/commit/3bd5860c749517c4d35850703c53a768138b7bde) | fix | properly execute content queries for root components ([#54457](https://github.com/angular/angular/pull/54457)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [bb57d34110](https://github.com/angular/angular/commit/bb57d34110ea8796f5c5f522b98dadf078e8ad8a) | fix | Fix cf migration regular expression to include underscores ([#54533](https://github.com/angular/angular/pull/54533)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [3e31f1a34e](https://github.com/angular/angular/commit/3e31f1a34ee97a802a4032cd9e7816d683a51d5e) | fix | Clear internal transition when navigation finalizes ([#54261](https://github.com/angular/angular/pull/54261)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.1"></a>
# 17.2.1 (2024-02-14)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7234824228](https://github.com/angular/angular/commit/7234824228df11249a5ebe01a6dee381be74e02e) | fix | fix broken version detection condition ([#54443](https://github.com/angular/angular/pull/54443)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.2.0"></a>
# 17.2.0 (2024-02-14)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [03c3b3eb79](https://github.com/angular/angular/commit/03c3b3eb79ec061b0031d6ad7ba386d185c87d8d) | feat | add Netlify image loader ([#54311](https://github.com/angular/angular/pull/54311)) |
| [f5c520b836](https://github.com/angular/angular/commit/f5c520b836c4545c7043649f28b3a0369c168747) | feat | add placeholder to NgOptimizedImage ([#53783](https://github.com/angular/angular/pull/53783)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [47e6e84101](https://github.com/angular/angular/commit/47e6e841016abfca0c1aa84051d82a04b3027617) | feat | Add a TSConfig option `useTemplatePipeline` ([#54057](https://github.com/angular/angular/pull/54057)) |
| [66e940aebf](https://github.com/angular/angular/commit/66e940aebfd5a93944860a4e0dbd14e1072f80f2) | feat | scope selectors in @starting-style ([#53943](https://github.com/angular/angular/pull/53943)) |
| [7b4d275f49](https://github.com/angular/angular/commit/7b4d275f494a64c38b61cea7045ba8b6e8447b78) | fix | Fix the template pipeline option ([#54148](https://github.com/angular/angular/pull/54148)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7e861c640e](https://github.com/angular/angular/commit/7e861c640edf90c5f8d4f7e091861d3d98cd49c0) | feat | generate extra imports for component local dependencies in local mode ([#53543](https://github.com/angular/angular/pull/53543)) |
| [3263df23f2](https://github.com/angular/angular/commit/3263df23f2f4da722ef2c1a1dacfb0866498dd60) | feat | generate global imports in local compilation mode ([#53543](https://github.com/angular/angular/pull/53543)) |
| [b774e22d8e](https://github.com/angular/angular/commit/b774e22d8e384f43e9cd8f5c55475d06e7f66988) | feat | make it configurable to generate alias reexports ([#53937](https://github.com/angular/angular/pull/53937)) |
| [3e1384048e](https://github.com/angular/angular/commit/3e1384048eb76c92532ae19aa2883318121c00e8) | feat | support host directives for local compilation mode ([#53877](https://github.com/angular/angular/pull/53877)) |
| [a592904c69](https://github.com/angular/angular/commit/a592904c691844d2c1aed00bd914edabef49f9b1) | fix | allow custom/duplicate decorators for `@Injectable` classes in local compilation mode ([#54139](https://github.com/angular/angular/pull/54139)) |
| [4b1d948b36](https://github.com/angular/angular/commit/4b1d948b36285ec6d80dbe93e0b92133f9d4be94) | fix | consider the case of duplicate Angular decorators in local compilation diagnostics ([#54139](https://github.com/angular/angular/pull/54139)) |
| [96bcf4fb12](https://github.com/angular/angular/commit/96bcf4fb1208d1f073784a2cde4a03553e905807) | fix | forbid custom/duplicate decorator when option `forbidOrphanComponents` is set ([#54139](https://github.com/angular/angular/pull/54139)) |
| [64fa5715c6](https://github.com/angular/angular/commit/64fa5715c696101fba0b4f8623eaec0eadc5b159) | fix | generating extra imports in local compilation mode when cycle is introduced ([#53543](https://github.com/angular/angular/pull/53543)) |
| [6c8b09468a](https://github.com/angular/angular/commit/6c8b09468a05a80cba3960861f0ab8d3bae80415) | fix | highlight the unresolved element in the @Component.styles array for the error LOCAL_COMPILATION_UNRESOLVED_CONST ([#54230](https://github.com/angular/angular/pull/54230)) |
| [0970129e20](https://github.com/angular/angular/commit/0970129e20f77dc309f2b4f76f961b310124778c) | fix | show proper error for custom decorators in local compilation mode ([#53983](https://github.com/angular/angular/pull/53983)) |
| [f39cb06418](https://github.com/angular/angular/commit/f39cb064183d984254bdf4e41b61d3dc9379738a) | fix | show specific error for unresolved @Directive.exportAs in local compilation mode ([#54230](https://github.com/angular/angular/pull/54230)) |
| [f3851b5945](https://github.com/angular/angular/commit/f3851b59459a1d9c214ace3db5a716d51c1f93c7) | fix | show specific error for unresolved @HostBinding's argument in local compilation mode ([#54230](https://github.com/angular/angular/pull/54230)) |
| [39ddd884e8](https://github.com/angular/angular/commit/39ddd884e826cc0be63fd0f7d7de20d642877ef9) | fix | show specific error for unresolved @HostListener's event name in local compilation mode ([#54230](https://github.com/angular/angular/pull/54230)) |
| [5d633240fd](https://github.com/angular/angular/commit/5d633240fd5927c4318a9240e60c3a30b2333cee) | fix | show the correct message for the error LOCAL_COMPILATION_UNRESOLVED_CONST when an unresolved symbol used for @Component.styles ([#54230](https://github.com/angular/angular/pull/54230)) |
| [58b8a232d6](https://github.com/angular/angular/commit/58b8a232d64f5fe3207c90c8145cab36e7e192c2) | fix | support jumping to definitions of signal-based inputs ([#54053](https://github.com/angular/angular/pull/54053)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [702ab28b4c](https://github.com/angular/angular/commit/702ab28b4c07a903c403a20af2ca287348b6afd0) | feat | add support for model inputs ([#54252](https://github.com/angular/angular/pull/54252)) |
| [e95ef2cbc6](https://github.com/angular/angular/commit/e95ef2cbc6f850d8fe96218b74cff76cea947674) | feat | expose queries as signals ([#54283](https://github.com/angular/angular/pull/54283)) |
| [656bc282e3](https://github.com/angular/angular/commit/656bc282e345c5e37a9189a0a4daa631e02c31bf) | fix | add toString implementation to signals ([#54002](https://github.com/angular/angular/pull/54002)) |
| [62b87b4551](https://github.com/angular/angular/commit/62b87b4551d77815f58af152d1921de3733621ba) | fix | do not crash for signal query that does not have any matches ([#54353](https://github.com/angular/angular/pull/54353)) |
| [4b96f370ee](https://github.com/angular/angular/commit/4b96f370eea08d2531cc54f65a651f94b504692d) | fix | expose model signal subcribe for type checking purposes ([#54357](https://github.com/angular/angular/pull/54357)) |
| [744cb1e561](https://github.com/angular/angular/commit/744cb1e561d9b0cbffd20ad612d5ea9e2cf6b2e7) | fix | return the same children query results if there are no changes ([#54392](https://github.com/angular/angular/pull/54392)) |
| [6d00115bf4](https://github.com/angular/angular/commit/6d00115bf45731b80178e11921df6ec1dc89efaf) | fix | show placeholder block on the server with immediate trigger ([#54394](https://github.com/angular/angular/pull/54394)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [1c536250b6](https://github.com/angular/angular/commit/1c536250b6112c67a68159de50c4afe0dbc440f8) | fix | Use string body to generate transfer cache key. ([#54379](https://github.com/angular/angular/pull/54379)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.3"></a>
# 17.1.3 (2024-02-08)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [bc4a6a9715](https://github.com/angular/angular/commit/bc4a6a9715547881ed8e65169a5aaebfd3188a7f) | fix | do not error due to multiple components named equally ([#54273](https://github.com/angular/angular/pull/54273)) |
| [a997e08c6f](https://github.com/angular/angular/commit/a997e08c6f5c5321e5d18f3368ff0886fa133d59) | fix | handle default imports in defer blocks ([#53695](https://github.com/angular/angular/pull/53695)) |
| [63a9027720](https://github.com/angular/angular/commit/63a9027720611002c6ee3b443a11e9feff213059) | fix | interpolatedSignalNotInvoked diagnostic for model signals ([#54338](https://github.com/angular/angular/pull/54338)) |
| [40e1edc977](https://github.com/angular/angular/commit/40e1edc977fbe398adc535167f8ede2db8985656) | fix | properly catch fatal diagnostics in type checking ([#54309](https://github.com/angular/angular/pull/54309)) |
| [9f6605d11b](https://github.com/angular/angular/commit/9f6605d11b7ee75f289b5a2ed69e201d65b038d8) | fix | support jumping to definitions of signal-based inputs ([#54233](https://github.com/angular/angular/pull/54233)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [7df133dcc2](https://github.com/angular/angular/commit/7df133dcc243cd6b0f779fa35de7f916e6938301) | fix | `afterRender` hooks should allow updating state ([#54074](https://github.com/angular/angular/pull/54074)) |
| [744e20641a](https://github.com/angular/angular/commit/744e20641a21d18c324bd9c157c8912d38741826) | fix | Fix possible infinite loop with `markForCheck` by partially reverting [#54074](https://github.com/angular/angular/pull/54074) ([#54329](https://github.com/angular/angular/pull/54329)) |
| [0fb114274c](https://github.com/angular/angular/commit/0fb114274cead9f317a2fc902cc3a3f6b046e708) | fix | update imports to be compatible with rxjs 6 ([#54193](https://github.com/angular/angular/pull/54193)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [238f2a8bc9](https://github.com/angular/angular/commit/238f2a8bc9c46b0d08aff163349ecc1493441a69) | fix | Clear internal transition when navigation finalizes ([#54261](https://github.com/angular/angular/pull/54261)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.2"></a>
# 17.1.2 (2024-01-31)
###
| Commit | Type | Description |
| -- | -- | -- |
| [ccddacf11d](https://github.com/angular/angular/commit/ccddacf11deaebeda12e1bdb6e93ec401397d352) | fix | cta clickability issue in adev homepage. ([#52905](https://github.com/angular/angular/pull/52905)) |
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [98d545fafa](https://github.com/angular/angular/commit/98d545fafa7fc3b1fb3ae049ce655e33ef9bd423) | fix | cleanup DOM elements when root view is removed with async animations ([#53033](https://github.com/angular/angular/pull/53033)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [cdc5e39532](https://github.com/angular/angular/commit/cdc5e3953237a192beafd6330f9d9e36ede34f2c) | fix | The date pipe should return ISO format for week and week-year as intended in the unit test. ([#53879](https://github.com/angular/angular/pull/53879)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [f12b01ec88](https://github.com/angular/angular/commit/f12b01ec88eaf18041c2e46335428627aa0d7744) | fix | Update type check block to fix control flow source mappings ([#53980](https://github.com/angular/angular/pull/53980)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c477e876e3](https://github.com/angular/angular/commit/c477e876e39495b855b096440d53cf1dd1ad33c6) | fix | change defer block fixture default behavior to playthrough ([#54088](https://github.com/angular/angular/pull/54088)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [8264382a6b](https://github.com/angular/angular/commit/8264382a6bf389fb3fca75fa2d6c0a2aa5a1e42f) | fix | error in standalone migration when non-array value is used as declarations in TestBed ([#54122](https://github.com/angular/angular/pull/54122)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.1"></a>
# 17.1.1 (2024-01-24)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [f222bee8fa](https://github.com/angular/angular/commit/f222bee8fa037f437761e5f7f127f22f280e9154) | fix | revert commit that replaced `last` helper with native `Array.at(-1)` ([#54021](https://github.com/angular/angular/pull/54021)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.1.0"></a>
# 17.1.0 (2024-01-17)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [79ff91a813](https://github.com/angular/angular/commit/79ff91a813e544929cb5eb5f9aab762a9f3d0435) | fix | allow TS jsDocParsingMode host option to be programmatically set ([#53126](https://github.com/angular/angular/pull/53126)) |
| [5613051a8b](https://github.com/angular/angular/commit/5613051a8bd2626ae347292807b2bf21085c4c02) | fix | allow TS jsDocParsingMode host option to be programmatically set again ([#53292](https://github.com/angular/angular/pull/53292)) |
| [df8a825910](https://github.com/angular/angular/commit/df8a825910951bebf34a4eede42f3ce5cd3e6fb7) | fix | project empty block root node ([#53620](https://github.com/angular/angular/pull/53620)) |
| [478d622265](https://github.com/angular/angular/commit/478d6222650884478314985e3d5132587c4f670c) | fix | project empty block root node in template pipeline ([#53620](https://github.com/angular/angular/pull/53620)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [abdc7e4578](https://github.com/angular/angular/commit/abdc7e45786667e4283912024a641975f1917d97) | feat | support type-checking for generic signal inputs ([#53521](https://github.com/angular/angular/pull/53521)) |
| [e620b3a724](https://github.com/angular/angular/commit/e620b3a724cb615af24b7779c0ab492d24efb8cc) | fix | add compiler option to disable control flow content projection diagnostic ([#53311](https://github.com/angular/angular/pull/53311)) |
| [4c1d69e288](https://github.com/angular/angular/commit/4c1d69e2880f22745c820eee630d10071e4fa86b) | fix | add diagnostic for control flow that prevents content projection ([#53190](https://github.com/angular/angular/pull/53190)) |
| [76ceebad04](https://github.com/angular/angular/commit/76ceebad047f62972654a8c934c77d8d02d9fa14) | fix | do not throw fatal error if extended type check fails ([#53896](https://github.com/angular/angular/pull/53896)) |
| [1a6eaa0fea](https://github.com/angular/angular/commit/1a6eaa0fea1024b919e17ac9d2e8c07df7916de8) | fix | input transform in local compilation mode ([#53645](https://github.com/angular/angular/pull/53645)) |
| [56a76d73e0](https://github.com/angular/angular/commit/56a76d73e037aeea1975808d5c51608fd23d4fa6) | fix | modify `getConstructorDependencies` helper to work with reflection host after the previous change ([#52215](https://github.com/angular/angular/pull/52215)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [863be4b698](https://github.com/angular/angular/commit/863be4b6981dc60ca0610b0e61d2ba1f5759e2a3) | feat | expose new `input` API for signal-based inputs ([#53872](https://github.com/angular/angular/pull/53872)) |
| [94096c6ede](https://github.com/angular/angular/commit/94096c6ede67436a349ae07901f2bb418bf9f461) | feat | support TypeScript 5.3 ([#52572](https://github.com/angular/angular/pull/52572)) |
| [69b384c0d1](https://github.com/angular/angular/commit/69b384c0d16f631741339d8757c32ef08260cfce) | fix | `SignalNode` reactive node incorrectly exposing unset field ([#53571](https://github.com/angular/angular/pull/53571)) |
| [6f79507ea7](https://github.com/angular/angular/commit/6f79507ea7f272d8d09250e222ca831f407867d8) | fix | Change defer block fixture default behavior to playthrough ([#53956](https://github.com/angular/angular/pull/53956)) |
| [32f908ab70](https://github.com/angular/angular/commit/32f908ab70f1b9ed3f92df1cae05ddde68932404) | fix | do not accidentally inherit input transforms when overridden ([#53571](https://github.com/angular/angular/pull/53571)) |
| [bdd61c768a](https://github.com/angular/angular/commit/bdd61c768a28b56c68634b99c036986499829f45) | fix | replace assertion with more intentional error ([#52234](https://github.com/angular/angular/pull/52234)) |
| [0daca457bb](https://github.com/angular/angular/commit/0daca457bb5bb6ffe14b7037264f8497eb5b3daf) | fix | TestBed should still use the microtask queue to schedule effects ([#53843](https://github.com/angular/angular/pull/53843)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [5c1d441029](https://github.com/angular/angular/commit/5c1d4410298e20cb03d7a1ddf7931538b6a181b4) | feat | Add info property to `NavigationExtras` ([#53303](https://github.com/angular/angular/pull/53303)) |
| [50d7916278](https://github.com/angular/angular/commit/50d79162785bb8d3e158a7a4a3733f4c75d3b127) | feat | Add router configuration to resolve navigation promise on error ([#48910](https://github.com/angular/angular/pull/48910)) |
| [a5a9b408e2](https://github.com/angular/angular/commit/a5a9b408e2eb64dcf1d3ca16da4897649dd2fc34) | feat | Add transient info to RouterLink input ([#53784](https://github.com/angular/angular/pull/53784)) |
| [726530a9af](https://github.com/angular/angular/commit/726530a9af9c8daf7295cc3548f24e70f380d70e) | feat | Allow `onSameUrlNavigation: 'ignore'` in `navigateByUrl` ([#52265](https://github.com/angular/angular/pull/52265)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.9"></a>
# 17.0.9 (2024-01-10)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c22b513b3f](https://github.com/angular/angular/commit/c22b513b3f45c49baf4d6e571735aa4aa33b7845) | fix | remove unused parameters from the ngClass constructor ([#53831](https://github.com/angular/angular/pull/53831)) |
| [bd9f89d1c8](https://github.com/angular/angular/commit/bd9f89d1c8e295f00ef3399c6bedca4e2ce0e89e) | fix | server-side rendering error when using in-memory scrolling ([#53683](https://github.com/angular/angular/pull/53683)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [92fd6cc42e](https://github.com/angular/angular/commit/92fd6cc42e0a217f4575404ea8e2af462f14ae18) | fix | generate less code for advance instructions ([#53845](https://github.com/angular/angular/pull/53845)) |
| [6a41961fbd](https://github.com/angular/angular/commit/6a41961fbdf921f7a3ab82e92185eab751c0d153) | fix | ignore empty switch blocks ([#53776](https://github.com/angular/angular/pull/53776)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7309463697](https://github.com/angular/angular/commit/7309463697110d848781bfe81f04b6070c759928) | fix | interpolatedSignalNotInvoked diagnostic ([#53585](https://github.com/angular/angular/pull/53585)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [441db5123f](https://github.com/angular/angular/commit/441db5123f368c5fe3a505a79b97309e8400250f) | fix | `afterRender` hooks now only run on `ApplicationRef.tick` ([#52455](https://github.com/angular/angular/pull/52455)) |
| [f9120d79cb](https://github.com/angular/angular/commit/f9120d79cb88a9f14c4baa6981f71a5afbd984e1) | fix | allow effect to be used inside an ErrorHandler ([#53713](https://github.com/angular/angular/pull/53713)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [e92c86b77f](https://github.com/angular/angular/commit/e92c86b77ff7d400c034740ee0ad68acb626a22f) | fix | Fix empty switch case offset bug in cf migration ([#53839](https://github.com/angular/angular/pull/53839)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [91cb16fde9](https://github.com/angular/angular/commit/91cb16fde9ff68bcdc760428c47f4ebf3e476bd2) | fix | Do not delete global Event ([#53659](https://github.com/angular/angular/pull/53659)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.8"></a>
# 17.0.8 (2023-12-21)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [de5c9ca8e9](https://github.com/angular/angular/commit/de5c9ca8e9a026ad752aab348bd137f647cc3cc9) | fix | correctly intercept index in loop tracking function ([#53604](https://github.com/angular/angular/pull/53604)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d79489255a](https://github.com/angular/angular/commit/d79489255a48a55b136746856af0d8be51bbe665) | fix | avoid repeated work when parsing version ([#53598](https://github.com/angular/angular/pull/53598)) |
| [513fee871e](https://github.com/angular/angular/commit/513fee871eb5d1c8a12bfe64878276b1d9c07705) | fix | tree shake version class ([#53598](https://github.com/angular/angular/pull/53598)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [eb7c29c7b6](https://github.com/angular/angular/commit/eb7c29c7b64a64853c7f7691912835240b62dfeb) | fix | cf migration - detect and error when result is invalid i18n nesting ([#53638](https://github.com/angular/angular/pull/53638)) |
| [ed936ba0e9](https://github.com/angular/angular/commit/ed936ba0e9d5323095aa486dc58d8b088b4d64cc) | fix | cf migration - detect and error when result is invalid i18n nesting ([#53638](https://github.com/angular/angular/pull/53638)) ([#53639](https://github.com/angular/angular/pull/53639)) |
| [5c2f2539e2](https://github.com/angular/angular/commit/5c2f2539e27bd18fd586c5977d853cd827f7b004) | fix | cf migration - ensure full check runs for all imports ([#53637](https://github.com/angular/angular/pull/53637)) |
| [817dc1b27f](https://github.com/angular/angular/commit/817dc1b27fcf32db8f8d8417bdd46a1763460f11) | fix | cf migration - fix bug in attribute formatting ([#53636](https://github.com/angular/angular/pull/53636)) |
| [7ac60bab9a](https://github.com/angular/angular/commit/7ac60bab9a4bb7a5af037a2de47339bd7837b157) | fix | cf migration - improve import declaration handling ([#53622](https://github.com/angular/angular/pull/53622)) |
| [c3f85e51a9](https://github.com/angular/angular/commit/c3f85e51a970aa458b920835573fa4e392e6f909) | fix | cf migration - preserve indentation on attribute strings ([#53625](https://github.com/angular/angular/pull/53625)) |
| [e73205ff5a](https://github.com/angular/angular/commit/e73205ff5ae4c382924266520f271b56972a0db6) | fix | cf migration - stop removing empty newlines from i18n blocks ([#53578](https://github.com/angular/angular/pull/53578)) |
| [886aa7b2a9](https://github.com/angular/angular/commit/886aa7b2a99a301eb6e35dc1a59ef918f0bea348) | fix | Fix cf migration bug with parsing for loop conditions properly ([#53558](https://github.com/angular/angular/pull/53558)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [0696ab6a5b](https://github.com/angular/angular/commit/0696ab6a5bea8acd6dafde488151150bf3332b79) | fix | Should not freeze original object used for route data ([#53635](https://github.com/angular/angular/pull/53635)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.7"></a>
# 17.0.7 (2023-12-13)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [4fd5409090](https://github.com/angular/angular/commit/4fd5409090b5556ecde3b4e2e1f09955e71443f4) | fix | handle ambient types in input transform function ([#51474](https://github.com/angular/angular/pull/51474)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [a603338fe8](https://github.com/angular/angular/commit/a603338fe800a133c64b1573f2f805978c947725) | fix | generate less type checking code in for loops ([#53515](https://github.com/angular/angular/pull/53515)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [58ed76be93](https://github.com/angular/angular/commit/58ed76be937c23713e05609da3195ebafeb49794) | fix | Avoid refreshing a host view twice when using transplanted views ([#53021](https://github.com/angular/angular/pull/53021)) |
| [c16b5e8290](https://github.com/angular/angular/commit/c16b5e82901b28b8ca0b72009c56aaeca68c58b0) | fix | Multiple subscribers to ApplicationRef.isStable should all see values ([#53541](https://github.com/angular/angular/pull/53541)) |
| [17dbf8b8e2](https://github.com/angular/angular/commit/17dbf8b8e2a0979515d07341b4a869a78fab8583) | fix | remove signal equality check short-circuit ([#53446](https://github.com/angular/angular/pull/53446)) |
| [5b4add27b6](https://github.com/angular/angular/commit/5b4add27b6d9d3ba55740818dc00659b6d462b87) | fix | update feature usage marker ([#53542](https://github.com/angular/angular/pull/53542)) |
| [68d111c841](https://github.com/angular/angular/commit/68d111c8416dff43a83bb9de1241b4847d80eae7) | perf | avoid changes Observable creation on QueryList ([#53498](https://github.com/angular/angular/pull/53498)) |
| [044cb553b4](https://github.com/angular/angular/commit/044cb553b4b8ed2f5f9a80131c5da84b3c964d9f) | perf | optimize memory allocation when reconcilling lists ([#52245](https://github.com/angular/angular/pull/52245)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [96ab999698](https://github.com/angular/angular/commit/96ab999698ca186b8e2b95177ea6f2c84e43628a) | fix | CF Migration - ensure bound ngIfElse cases ignore line breaks ([#53435](https://github.com/angular/angular/pull/53435)) |
| [c9a1c6f1c7](https://github.com/angular/angular/commit/c9a1c6f1c7455431755dc31e00d72864931bf819) | fix | cf migration - undo changes when html fails to parse post migration ([#53530](https://github.com/angular/angular/pull/53530)) |
| [b75aca1d74](https://github.com/angular/angular/commit/b75aca1d747e1bb55d4f3f6996bb2cb363e34f5b) | fix | CF migration only remove newlines of changed template content ([#53508](https://github.com/angular/angular/pull/53508)) |
| [e88a12d5b3](https://github.com/angular/angular/commit/e88a12d5b3cf0e7c55c15c6820362d4d1e25ecaa) | fix | cf migration validate structure of ngswitch before migrating ([#53530](https://github.com/angular/angular/pull/53530)) |
| [543df3dca5](https://github.com/angular/angular/commit/543df3dca52597aae298a01271337949d891dc65) | fix | ensure we do not overwrite prior template replacements in migration ([#53393](https://github.com/angular/angular/pull/53393)) |
| [d232ea143f](https://github.com/angular/angular/commit/d232ea143f99fffc190c126d01920e965ffde3a3) | fix | fix cf migration import removal when errors occur ([#53502](https://github.com/angular/angular/pull/53502)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [d5c631bf36](https://github.com/angular/angular/commit/d5c631bf3663b414b6d7734352804e594bfa2772) | fix | Get correct base path when using "." as base href when serving from the file:// protocol. ([#53547](https://github.com/angular/angular/pull/53547)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [e750e4edcf](https://github.com/angular/angular/commit/e750e4edcfe812bcee82d4a2f53fd8acd8792f08) | fix | provide more actionable error message when route is not matched in production mode ([#53523](https://github.com/angular/angular/pull/53523)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.6"></a>
# 17.0.6 (2023-12-06)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [a2e5f483f5](https://github.com/angular/angular/commit/a2e5f483f5a869c0cca205f092049e252a02b710) | fix | generate proper code for nullish coalescing in styling host bindings ([#53305](https://github.com/angular/angular/pull/53305)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [66ecf4c274](https://github.com/angular/angular/commit/66ecf4c2748b43b7e53af00499b153bbe70dd684) | fix | add compiler option to disable control flow content projection diagnostic ([#53387](https://github.com/angular/angular/pull/53387)) |
| [74e6ce5d23](https://github.com/angular/angular/commit/74e6ce5d233c8763b6c437fab5d81d7b89ae6cd4) | fix | add diagnostic for control flow that prevents content projection ([#53387](https://github.com/angular/angular/pull/53387)) |
| [6ec7a42b95](https://github.com/angular/angular/commit/6ec7a42b9578aa34a66bb7c81ac491bb18f98941) | fix | avoid conflicts with built-in global variables in for loop blocks ([#53319](https://github.com/angular/angular/pull/53319)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [0a53f96094](https://github.com/angular/angular/commit/0a53f9609462fc59cf20c7fe1436d153c23e0412) | fix | cleanup signal consumers for all views ([#53351](https://github.com/angular/angular/pull/53351)) |
| [4fc1581bbc](https://github.com/angular/angular/commit/4fc1581bbcd98e607eb2bbd9976c64c92a70d827) | fix | handle hydration of multiple nodes projected in a single slot ([#53270](https://github.com/angular/angular/pull/53270)) |
| [14e66533ec](https://github.com/angular/angular/commit/14e66533ec49184723a66652253e9ae863a972e0) | fix | support hydration for cases when content is re-projected using ng-template ([#53304](https://github.com/angular/angular/pull/53304)) |
| [8e366e8911](https://github.com/angular/angular/commit/8e366e8911434d5b91e83e215320caae72f6adf8) | fix | support swapping hydrated views in `@for` loops ([#53274](https://github.com/angular/angular/pull/53274)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [45064f1ae1](https://github.com/angular/angular/commit/45064f1ae1ceb9c5a1f1053077f77370e3e9fdb2) | fix | CF migration - ensure NgIfElse attributes are properly removed ([#53298](https://github.com/angular/angular/pull/53298)) |
| [a6275cfa54](https://github.com/angular/angular/commit/a6275cfa54d680d6612a1c91e5d3f6b86b828fbc) | fix | CF Migration - Fix case of aliases on i18n ng-templates preventing removal ([#53299](https://github.com/angular/angular/pull/53299)) |
| [58a96e0f50](https://github.com/angular/angular/commit/58a96e0f50f2d59376aa357188ad0792b39e4e70) | fix | CF Migration add support for ngIf with just a then ([#53297](https://github.com/angular/angular/pull/53297)) |
| [26e40c7f89](https://github.com/angular/angular/commit/26e40c7f8916612034b03dae4f74e53b61d39d86) | fix | CF Migration fix missing alias for bound ngifs ([#53296](https://github.com/angular/angular/pull/53296)) |
| [836aeba01d](https://github.com/angular/angular/commit/836aeba01db526676610802daff4e8ebca8cef1e) | fix | Change CF Migration ng-template placeholder generation and handling ([#53394](https://github.com/angular/angular/pull/53394)) |
| [72d22ba7ee](https://github.com/angular/angular/commit/72d22ba7eea87e2873a765aa69b3d923b9d6cc6d) | fix | fix regexp for else and then in cf migration ([#53257](https://github.com/angular/angular/pull/53257)) |
| [7a2facae8a](https://github.com/angular/angular/commit/7a2facae8af3240b21fc17857a770dad793b7b6d) | fix | handle aliases on bound ngIf migrations ([#53261](https://github.com/angular/angular/pull/53261)) |
| [5104a89b30](https://github.com/angular/angular/commit/5104a89b3035fb07ce23e09974dc9998ef6932ca) | fix | handle nested ng-template replacement safely in CF migration ([#53368](https://github.com/angular/angular/pull/53368)) |
| [2a4e3f5373](https://github.com/angular/angular/commit/2a4e3f5373dfbc2a1634d67e646c30d8bbe4fea8) | fix | handle templates outside of component in cf migration ([#53368](https://github.com/angular/angular/pull/53368)) |
| [0db75ab5b1](https://github.com/angular/angular/commit/0db75ab5b1c8c79a0e7ca1d6094092f0cb3e3939) | fix | remove setting that removes comments in CF migration ([#53350](https://github.com/angular/angular/pull/53350)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [13ade13a15](https://github.com/angular/angular/commit/13ade13a15f0c5b5f782d2fda0f7a96b3c606198) | fix | Ensure canMatch guards run on wildcard routes ([#53239](https://github.com/angular/angular/pull/53239)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.5"></a>
# 17.0.5 (2023-11-29)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6be88040d1](https://github.com/angular/angular/commit/6be88040d134b8c8d7efd2068296f68b8b7efbdd) | fix | avoid stale provider info when TestBed.overrideProvider is used ([#52918](https://github.com/angular/angular/pull/52918)) |
| [dee50f1d78](https://github.com/angular/angular/commit/dee50f1d78d009f74edfa53f11fd6998b1af5441) | fix | inherit host directives ([#52992](https://github.com/angular/angular/pull/52992)) |
| [07920d96d4](https://github.com/angular/angular/commit/07920d96d4e9831fd14ff01a3dd44af1017b28ca) | fix | Reattached views that are dirty from a signal update should refresh ([#53001](https://github.com/angular/angular/pull/53001)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [aab7fb8654](https://github.com/angular/angular/commit/aab7fb865486b94d6aabbe548894f8083f4e6cfe) | fix | Add ngForTemplate support to control flow migration ([#53076](https://github.com/angular/angular/pull/53076)) |
| [dbd6f386ea](https://github.com/angular/angular/commit/dbd6f386ea81e7f29bc1cb34fb8efbba8c290ea8) | fix | allows colons in ngIf else cases to migrate ([#53076](https://github.com/angular/angular/pull/53076)) |
| [5b9f896009](https://github.com/angular/angular/commit/5b9f896009d9c57c91d44e1cb7adf80c29fbfb4c) | fix | cf migration fix migrating empty switch default ([#53237](https://github.com/angular/angular/pull/53237)) |
| [2b3d3b0fe1](https://github.com/angular/angular/commit/2b3d3b0fe10134739ec9982a776837a273ec8e1d) | fix | CF migration log warning when collection aliasing detected in `@for` ([#53238](https://github.com/angular/angular/pull/53238)) |
| [dffeac8386](https://github.com/angular/angular/commit/dffeac8386bed73ef0b2337c33f122af9884bb82) | fix | cf migration removes unnecessary bound ngifelse attribute ([#53236](https://github.com/angular/angular/pull/53236)) |
| [00cb3339ba](https://github.com/angular/angular/commit/00cb3339bab738100e4164339420f2492be91fd1) | fix | control flow migration formatting fixes ([#53076](https://github.com/angular/angular/pull/53076)) |
| [c22af72f75](https://github.com/angular/angular/commit/c22af72f753b9ad3886561228a0cfd938a2a6de9) | fix | fix off by one issue with template removal in CF migration ([#53255](https://github.com/angular/angular/pull/53255)) |
| [ba6d7fe018](https://github.com/angular/angular/commit/ba6d7fe0184dd1d9dbab088d767097948b78d9a4) | fix | fixes CF migration i18n ng-template offsets ([#53212](https://github.com/angular/angular/pull/53212)) |
| [8f6affdd64](https://github.com/angular/angular/commit/8f6affdd64c6022c6a96fddac564c0ec05c5da9b) | fix | fixes control flow migration common module removal ([#53076](https://github.com/angular/angular/pull/53076)) |
| [6ae408847c](https://github.com/angular/angular/commit/6ae408847ce5943ff34c7432a76533b69f08cb63) | fix | properly handle ngIfThen cases in CF migration ([#53256](https://github.com/angular/angular/pull/53256)) |
| [0fcef65cea](https://github.com/angular/angular/commit/0fcef65cea8a7687afdf90e6e0e0c396f5792606) | fix | Update CF migration to skip templates with duplicate ng-template names ([#53204](https://github.com/angular/angular/pull/53204)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [91486aaf07](https://github.com/angular/angular/commit/91486aaf0754cb38bc9846f1d9532b1a0941f53a) | fix | Resolvers in different parts of the route tree should be able to execute together ([#52934](https://github.com/angular/angular/pull/52934)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.4"></a>
# 17.0.4 (2023-11-20)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [7f1c55755d](https://github.com/angular/angular/commit/7f1c55755d94444aa2c07fc62c276bb158e69f24) | fix | remove `load` on image once it fails to load ([#52990](https://github.com/angular/angular/pull/52990)) |
| [fafcb0d23f](https://github.com/angular/angular/commit/fafcb0d23f1f687a2fe5c8349b916586ffadc375) | fix | scan images once page is loaded ([#52991](https://github.com/angular/angular/pull/52991)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [98376f2c09](https://github.com/angular/angular/commit/98376f2c09e9c28d1473123a2a1f4fb1c9d1cb1e) | fix | changed after checked error in for loops ([#52935](https://github.com/angular/angular/pull/52935)) |
| [291deac663](https://github.com/angular/angular/commit/291deac6636a6f99a98dd0c9096ebe3b0547bb9e) | fix | generate i18n instructions for blocks ([#52958](https://github.com/angular/angular/pull/52958)) |
| [49dca36880](https://github.com/angular/angular/commit/49dca36880a1c1c394533e8a94db9c5ef412ebd2) | fix | nested for loops incorrectly calculating computed variables ([#52931](https://github.com/angular/angular/pull/52931)) |
| [f01b7183d2](https://github.com/angular/angular/commit/f01b7183d2064f41c0f5e30ee976cc91c15e06c5) | fix | produce placeholder for blocks in i18n bundles ([#52958](https://github.com/angular/angular/pull/52958)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [f671f86ac2](https://github.com/angular/angular/commit/f671f86ac28d434b2fd492ef005749fe0275ece9) | fix | add diagnostic for control flow that prevents content projection ([#52726](https://github.com/angular/angular/pull/52726)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [db1a8ebdb4](https://github.com/angular/angular/commit/db1a8ebdb4da8673107ba4ba08c42d484b733c03) | fix | cleanup loading promise when no dependencies are defined ([#53031](https://github.com/angular/angular/pull/53031)) |
| [31a1575334](https://github.com/angular/angular/commit/31a1575334ef78822d947ed858d8365ca5665f2f) | fix | handle local refs when `getDeferBlocks` is invoked in tests ([#52973](https://github.com/angular/angular/pull/52973)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [ac9cd6108f](https://github.com/angular/angular/commit/ac9cd6108f6fe25e9c7a11db9816c6e07d241515) | fix | control flow migration fails for async pipe with unboxing of observable ([#52756](https://github.com/angular/angular/pull/52756)) ([#52972](https://github.com/angular/angular/pull/52972)) |
| [13bf5b7007](https://github.com/angular/angular/commit/13bf5b700739aadb2e5a210441fb815a8501ad65) | fix | Fixes control flow migration if then else case ([#53006](https://github.com/angular/angular/pull/53006)) |
| [492ad4698a](https://github.com/angular/angular/commit/492ad4698aaef51a3d24ae90f617a2ba3fae901e) | fix | fixes migrations of nested switches in control flow ([#53010](https://github.com/angular/angular/pull/53010)) |
| [0fad36eff2](https://github.com/angular/angular/commit/0fad36eff2b228baa3b8868810d4ac86eb6db459) | fix | tweaks to formatting in control flow migration ([#53058](https://github.com/angular/angular/pull/53058)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.3"></a>
# 17.0.3 (2023-11-15)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [f5872c9921](https://github.com/angular/angular/commit/f5872c992181a2c231890b83f92ec03ec9606802) | fix | prevent the AsyncAnimationRenderer from calling the delegate when there is no element. ([#52570](https://github.com/angular/angular/pull/52570)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6a1d4ed667](https://github.com/angular/angular/commit/6a1d4ed6670f5965a654e40997aa266a99925f50) | fix | handle non-container environment injector cases ([#52774](https://github.com/angular/angular/pull/52774)) |
| [5de7575be8](https://github.com/angular/angular/commit/5de7575be83b9829e65ad245034ee7ab1d966044) | fix | reset cached scope for components that were overridden using TestBed ([#52916](https://github.com/angular/angular/pull/52916)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [7c066a4af4](https://github.com/angular/angular/commit/7c066a4af4faae25ee722c19576c63c3833066ee) | fix | Use the response `content-type` to set the blob `type`. ([#52840](https://github.com/angular/angular/pull/52840)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [4e200bf13b](https://github.com/angular/angular/commit/4e200bf13b284fa89bbb0854cbb85dc8fe94d8bb) | fix | Add missing support for ngForOf ([#52903](https://github.com/angular/angular/pull/52903)) |
| [d033540d0f](https://github.com/angular/angular/commit/d033540d0f874a7a05b79c00e3151ed076fa71c3) | fix | Add support for bound versions of NgIfElse and NgIfThenElse ([#52869](https://github.com/angular/angular/pull/52869)) |
| [aa2d815648](https://github.com/angular/angular/commit/aa2d815648dbf3303cfe72bf976a4a87de406ee0) | fix | Add support for removing imports post migration ([#52763](https://github.com/angular/angular/pull/52763)) |
| [3831942771](https://github.com/angular/angular/commit/38319427711f4dab4e4d64ff48aecc7727085031) | fix | Fixes issue with multiple if elses with same template ([#52863](https://github.com/angular/angular/pull/52863)) |
| [e1f84a31dc](https://github.com/angular/angular/commit/e1f84a31dcac413251329c3b695a253234c6aae6) | fix | passed in paths will be respected in nx workspaces ([#52796](https://github.com/angular/angular/pull/52796)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.2"></a>
# 17.0.2 (2023-11-09)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7a95cccf50](https://github.com/angular/angular/commit/7a95cccf50c01a3733c6015551f8864e246d9239) | fix | add interpolatedSignalNotInvoked to diagnostics ([#52687](https://github.com/angular/angular/pull/52687)) |
| [a548c0333e](https://github.com/angular/angular/commit/a548c0333ecc993073ee7df054119a6fdde1d27b) | fix | incorrect inferred type of for loop implicit variables ([#52732](https://github.com/angular/angular/pull/52732)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2cea80c6e2](https://github.com/angular/angular/commit/2cea80c6e21c113d12c38c4b3219c5f3f5944bd8) | fix | error code in image performance warning ([#52727](https://github.com/angular/angular/pull/52727)) |
| [b16fc2610a](https://github.com/angular/angular/commit/b16fc2610a37b7407713e1e0018d92372f1349e9) | fix | limit rate of markers invocations ([#52742](https://github.com/angular/angular/pull/52742)) |
| [44c48a4835](https://github.com/angular/angular/commit/44c48a48358c92c32301b578966a8e1ee9a867d8) | fix | properly update collection with repeated keys in `@for` ([#52697](https://github.com/angular/angular/pull/52697)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.1"></a>
# 17.0.1 (2023-11-08)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [5c6f3f8ec0](https://github.com/angular/angular/commit/5c6f3f8ec0f1dd9b5505f3c94e654a675e75f147) | fix | Don't override the backend when using the InMemoryWebAPI ([#52425](https://github.com/angular/angular/pull/52425)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [70d30c28e0](https://github.com/angular/angular/commit/70d30c28e04f4ead51145e4e47df342492bfb336) | fix | Add support for ng-templates with i18n attributes ([#52597](https://github.com/angular/angular/pull/52597)) |
| [4f125c5f9a](https://github.com/angular/angular/commit/4f125c5f9ae572a8216ec1fbb88f52e47b875e1e) | fix | Switches to multiple passes to fix several reported bugs ([#52592](https://github.com/angular/angular/pull/52592)) |

Web Frameworks: the internet frontier.<br/>
These are the voyages of the framework Angular.<br/>
Its continuing mission:<br/>
To explore strange, new technologies.<br/>
To seek out new users and new applications.<br/>
To boldly go where no web framework has gone before.<br/>

In honor of v17.0.1

```
                                                  ______
                                     ___.--------'------`---------.____
                               _.---'----------------------------------`---.__
                             .'___=]===========================================
,-----------------------..__/.'         >--.______        _______.---'
]====================<==||(__)        .'          `------'
`-----------------------`' ----.___--/
     /       /---'                 `/
    /_______(______________________/
    `-------------.--------------.'
                   \________|_.-'
```

Live long and prosper 🖖🏻

<!-- CHANGELOG SPLIT MARKER -->

<a name="17.0.0"></a>
# 17.0.0 (2023-11-08)

[Blog post "Angular v17 is now available"](http://goo.gle/angular-v17).

## Breaking Changes
###
- Node.js v16 support has been removed and the minimum support version has been bumped to 18.13.0.

  Node.js v16 is planned to be End-of-Life on 2023-09-11. Angular will stop supporting Node.js v16 in Angular v17. For Node.js release schedule details, please see: https://github.com/nodejs/release#release-schedule
### common
- the NgSwitch directive now defaults to the === equality operator,
  migrating from the previously used == operator. NgSwitch expressions and / or
  individual condition values need adjusting to this stricter equality
  check. The added warning message should help pin-pointing NgSwitch
  usages where adjustments are needed.
### core
- Angular now requires `zone.js` version `~0.14.0`
- Versions of TypeScript older than 5.2 are no longer supported.
- The  `mutate` method was removed from the `WritableSignal` interface and completely
  dropped from the public API surface. As an alternative, please use the `update` method and
  make immutable changes to the object.

  Example before:

  ```typescript
  items.mutate(itemsArray => itemsArray.push(newItem));
  ```

  Example after:

  ```typescript
  items.update(itemsArray => [itemsArray, …newItem]);
  ```
- `OnPush` components that are created dynamically now
  only have their host bindings refreshed and `ngDoCheck run` during change
  detection if they are dirty.
  Previously, a bug in the change detection would result in the `OnPush`
  configuration of dynamically created components to be ignored when
  executing host bindings and the `ngDoCheck` function. This is
  rarely encountered but can happen if code has a handle on the
  `ComponentRef` instance and updates values read in the `OnPush`
  component template without then calling either `markForCheck` or
  `detectChanges` on that component's `ChangeDetectorRef`.
### platform-browser
- `REMOVE_STYLES_ON_COMPONENT_DESTROY` default value is now `true`. This causes CSS of components to be removed from the DOM when destroyed. You retain the previous behaviour by providing the `REMOVE_STYLES_ON_COMPONENT_DESTROY` injection token.

  ```ts
  import {REMOVE_STYLES_ON_COMPONENT_DESTROY} from '@angular/platform-browser';
  ...
  providers: [{
    provide: REMOVE_STYLES_ON_COMPONENT_DESTROY,
    useValue: false,
  }]
  ```
- The `withNoDomReuse()` function was removed from the public API. If you need to disable hydration, you can exclude the `provideClientHydration()` call from provider list in your application (which would disable hydration features for the entire application) or use `ngSkipHydration` attribute to disable hydration for particular components. See this guide for additional information: https://angular.io/guide/hydration#how-to-skip-hydration-for-particular-components.
### router
- Absolute redirects no longer prevent further redirects.
  Route configurations may need to be adjusted to prevent infinite
  redirects where additional redirects were previously ignored after an
  absolute redirect occurred.
- Routes with `loadComponent` would incorrectly cause
  child routes to inherit their data by default. The default
  `paramsInheritanceStrategy` is `emptyOnly`. If parent data should be
  inherited in child routes, this should be manually set to `always`.
- `urlHandlingStrategy` has been removed from the Router public API.
  This should instead be configured through the provideRouter or RouterModule.forRoot APIs.
- The following Router properties have been removed from
  the public API:

  - canceledNavigationResolution
  - paramsInheritanceStrategy
  - titleStrategy
  - urlUpdateStrategy
  - malformedUriErrorHandler

  These should instead be configured through the `provideRouter` or
  `RouterModule.forRoot` APIs.
- The `setupTestingRouter` function has been removed. Use
  `RouterModule.forRoot` or `provideRouter` to setup the `Router` for
  tests instead.
- `malformedUriErrorHandler` is no longer available in
  the `RouterModule.forRoot` options. URL parsing errors should instead be
  handled in the `UrlSerializer.parse` method.
### zone.js
- Deep and legacy `dist/` imports like `zone.js/bundles/zone-testing.js` and `zone.js/dist/zone` are no longer allowed. `zone-testing-bundle` and `zone-testing-node-bundle` are also no longer part of the package.

  The proper way to import `zone.js` and `zone.js/testing` is:
  ```js
  import 'zone.js';
  import 'zone.js/testing';
  ```
## Deprecations
### animations
- The `AnimationDriver.NOOP` symbol is deprecated, use `NoopAnimationDriver` instead.
### core
- `ChangeDetectorRef.checkNoChanges` is deprecated.

  Test code should use `ComponentFixture` instead of `ChangeDetectorRef`.
  Application code should not call `ChangeDetectorRef.checkNoChanges` directly.
- Swapping out the context object for `EmbeddedViewRef`
  is no longer supported. Support for this was introduced with v12.0.0, but
  this pattern is rarely used. There is no replacement, but you can use
  simple assignments in most cases, or `Object.assign` , or alternatively
  still replace the full object by using a `Proxy` (see `NgTemplateOutlet`
  as an example).

  Also adds a warning if the deprecated
- NgProbeToken

  The `NgProbeToken` is not used internally since the transition from View Engine to Ivy. The token has no utility and can be removed from applications and libraries.
###
| Commit | Type | Description |
| -- | -- | -- |
| [59aa0634f4](https://github.com/angular/angular/commit/59aa0634f4d4694203f2a69c40017fe5a3962514) | build | remove support for Node.js v16 ([#51755](https://github.com/angular/angular/pull/51755)) |
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [e753278faa](https://github.com/angular/angular/commit/e753278faae79a53e235e0d8e03f89555a712d80) | feat | Add the possibility of lazy loading animations code. ([#50738](https://github.com/angular/angular/pull/50738)) |
| [698c058e1c](https://github.com/angular/angular/commit/698c058e1c975c573722407f4843a4a774ceb92a) | fix | remove code duplication between entry-points ([#51500](https://github.com/angular/angular/pull/51500)) |
| [0598613950](https://github.com/angular/angular/commit/0598613950c76f4a13601c6942e30ab4ce1e3b67) | refactor | deprecation of `AnimationDriver.NOOP` ([#51843](https://github.com/angular/angular/pull/51843)) |
### benchpress
| Commit | Type | Description |
| -- | -- | -- |
| [2da3551a70](https://github.com/angular/angular/commit/2da3551a703ebef401d76a8e88e388437e851d85) | feat | report gc and render time spent in script ([#50771](https://github.com/angular/angular/pull/50771)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [fe2fd7e1a8](https://github.com/angular/angular/commit/fe2fd7e1a898a4525c219065a6d0908988dfd7e2) | feat | make the warning for lazy-loaded lcp image an error ([#51748](https://github.com/angular/angular/pull/51748)) |
| [dde3fdabbd](https://github.com/angular/angular/commit/dde3fdabbd24b48dd6afd120d23e92a3605eb04d) | feat | upgrade warning to logged error for lazy-loaded LCP images using NgOptimizedImage ([#52004](https://github.com/angular/angular/pull/52004)) |
| [da056a1fe2](https://github.com/angular/angular/commit/da056a1fe2816299319fb3f87416316be2029479) | fix | add missing types field for @angular/common/locales of exports in package.json ([#52080](https://github.com/angular/angular/pull/52080)) |
| [85843e8212](https://github.com/angular/angular/commit/85843e8212e99deb8b70f3d3f8dfe002b978cbb1) | fix | allow to specify only some properties of `DatePipeConfig` ([#51287](https://github.com/angular/angular/pull/51287)) |
| [3bd85fb7b0](https://github.com/angular/angular/commit/3bd85fb7b0723ed807bca771e9fa95af60a3cfaf) | fix | apply fixed_srcset_width value only to fixed srcsets ([#52459](https://github.com/angular/angular/pull/52459)) |
| [65b460448e](https://github.com/angular/angular/commit/65b460448ec5fdcee5aecca0cdc3cf498b0832cb) | fix | missing space in ngSwitch equality warning ([#52180](https://github.com/angular/angular/pull/52180)) |
| [86c5e34601](https://github.com/angular/angular/commit/86c5e34601d7901a11688124aa902646524177eb) | fix | remove code duplication between entry-points ([#51500](https://github.com/angular/angular/pull/51500)) |
| [28a5925f53](https://github.com/angular/angular/commit/28a5925f53790067d45f1f68d204a36088dbf5e3) | fix | use === operator to match NgSwitch cases ([#51504](https://github.com/angular/angular/pull/51504)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1934524a0c](https://github.com/angular/angular/commit/1934524a0c673fb65cd927c55c712f59446f9c93) | feat | add docs extraction for type aliases ([#52118](https://github.com/angular/angular/pull/52118)) |
| [7f6d9a73ab](https://github.com/angular/angular/commit/7f6d9a73ab8b658d0d8148080dfefb2550bee6b4) | feat | expand class api doc extraction ([#51733](https://github.com/angular/angular/pull/51733)) |
| [a7fa25306f](https://github.com/angular/angular/commit/a7fa25306f8ce47d8aa330531382106efec55a55) | feat | extract api docs for interfaces ([#52006](https://github.com/angular/angular/pull/52006)) |
| [7bfe20707f](https://github.com/angular/angular/commit/7bfe20707fedff7290e12356a1545644b436d41c) | feat | extract api for fn overloads and abtract classes ([#52040](https://github.com/angular/angular/pull/52040)) |
| [c7daf7ea16](https://github.com/angular/angular/commit/c7daf7ea1692391f7cac8f794ed777887a2764af) | feat | extract directive docs info ([#51733](https://github.com/angular/angular/pull/51733)) |
| [e0b1bb33d7](https://github.com/angular/angular/commit/e0b1bb33d77babe881f77f52cb1b71e345f5696b) | feat | extract doc info for JsDoc ([#51733](https://github.com/angular/angular/pull/51733)) |
| [b9c70158ab](https://github.com/angular/angular/commit/b9c70158abecd81a5af512c8b4da685851cf159f) | feat | extract docs for accessors, rest params, and types ([#51733](https://github.com/angular/angular/pull/51733)) |
| [a24ae994a0](https://github.com/angular/angular/commit/a24ae994a0470fdac09a69937fd0580cff6c6d68) | feat | extract docs for top level functions and consts ([#51733](https://github.com/angular/angular/pull/51733)) |
| [2e41488296](https://github.com/angular/angular/commit/2e41488296879685b19dfba8d78037690347bda3) | feat | extract docs info for enums, pipes, and NgModules ([#51733](https://github.com/angular/angular/pull/51733)) |
| [34495b3533](https://github.com/angular/angular/commit/34495b35337892ab209d9955ff7fe2897a0c5d41) | feat | extract docs via exports ([#51828](https://github.com/angular/angular/pull/51828)) |
| [7e82df45c5](https://github.com/angular/angular/commit/7e82df45c5bb72ec3dafaa07dc1eaa5d463b006c) | feat | initial skeleton for API doc extraction ([#51733](https://github.com/angular/angular/pull/51733)) |
| [6795cccbbb](https://github.com/angular/angular/commit/6795cccbbbfc17bbf88fb8197aa172cca67fa2d2) | fix | account for type-only imports in defer blocks ([#52343](https://github.com/angular/angular/pull/52343)) |
| [23bfa10ac8](https://github.com/angular/angular/commit/23bfa10ac809f6b27d32647210c52329f0e4262e) | fix | add diagnostic for inaccessible deferred trigger ([#51922](https://github.com/angular/angular/pull/51922)) |
| [31295a3cf9](https://github.com/angular/angular/commit/31295a3cf907a61e7115d9039a83a232b263a676) | fix | allocating unnecessary slots in conditional instruction ([#51913](https://github.com/angular/angular/pull/51913)) |
| [2aaddd3f64](https://github.com/angular/angular/commit/2aaddd3f64bb8891bb4bdcadf05d427a89338112) | fix | allow comments between switch cases ([#52449](https://github.com/angular/angular/pull/52449)) |
| [ddd9df68bb](https://github.com/angular/angular/commit/ddd9df68bb2e907dd820f239aaf819425cb95df8) | fix | allow decimals in defer block time values ([#52433](https://github.com/angular/angular/pull/52433)) |
| [7dbd47fb30](https://github.com/angular/angular/commit/7dbd47fb3015117c420f984181bfcb48e533525a) | fix | allow newlines in track and let expressions ([#52137](https://github.com/angular/angular/pull/52137)) |
| [0eae992c4e](https://github.com/angular/angular/commit/0eae992c4e03b7c9039476e03b72e92d662293df) | fix | allow nullable values in for loop block ([#51997](https://github.com/angular/angular/pull/51997)) |
| [073ebfe09e](https://github.com/angular/angular/commit/073ebfe09eccd5d01d27fcc46fc5d4465c1851ff) | fix | apply style on :host attributes in prod builds. ([#49118](https://github.com/angular/angular/pull/49118)) |
| [81a287a79a](https://github.com/angular/angular/commit/81a287a79afc16d43c0fd24d7aea54be4414940a) | fix | avoid error in template parser for tag names that can occur in object prototype ([#52225](https://github.com/angular/angular/pull/52225)) |
| [6c58252521](https://github.com/angular/angular/commit/6c582525217197dd777d5bb9e62d6aaa2c70a996) | fix | compilation error when for loop block expression contains new line ([#52447](https://github.com/angular/angular/pull/52447)) |
| [9d19c8e317](https://github.com/angular/angular/commit/9d19c8e31752d211f575246282358b83afe90969) | fix | don't allocate variable to for loop expression ([#52158](https://github.com/angular/angular/pull/52158)) |
| [9acd2ac98b](https://github.com/angular/angular/commit/9acd2ac98bc3b6ffc5a8d6c19f7290d05fe1f896) | fix | enable block syntax in the linker ([#51979](https://github.com/angular/angular/pull/51979)) |
| [1d871c03a5](https://github.com/angular/angular/commit/1d871c03a523e10bb838cb0f9550595cfbd9d14d) | fix | forward referenced dependencies not identified as deferrable ([#52017](https://github.com/angular/angular/pull/52017)) |
| [16ff08ec70](https://github.com/angular/angular/commit/16ff08ec70bfa192041ba050e550676e8d505a05) | fix | narrow the type of expressions in event listeners inside if blocks ([#52069](https://github.com/angular/angular/pull/52069)) |
| [ac0d5dcfd6](https://github.com/angular/angular/commit/ac0d5dcfd6015ec4283ed1a5cf241f130f4c5cf5) | fix | narrow the type of expressions in event listeners inside switch blocks ([#52069](https://github.com/angular/angular/pull/52069)) |
| [02edb43067](https://github.com/angular/angular/commit/02edb4306736e6f12e87a4164c17eca6cbdfe151) | fix | narrow the type of the aliased if block expression ([#51952](https://github.com/angular/angular/pull/51952)) |
| [83067b3ef2](https://github.com/angular/angular/commit/83067b3ef257dbc7b1c20d50645615d19023ba51) | fix | ng-template directive invoke twice at the root of control flow ([#52515](https://github.com/angular/angular/pull/52515)) |
| [17078a3fe1](https://github.com/angular/angular/commit/17078a3fe1e9b90e48952b6c12b6e6b774b97810) | fix | pipes used inside defer triggers not being picked up ([#52071](https://github.com/angular/angular/pull/52071)) |
| [861ce3a7c5](https://github.com/angular/angular/commit/861ce3a7c574340a6164ad0de13f49bda3e172da) | fix | pipes using DI not working in blocks ([#52112](https://github.com/angular/angular/pull/52112)) |
| [1f5039bbd6](https://github.com/angular/angular/commit/1f5039bbd6de8450e5511af00044ddd2f4314016) | fix | project control flow root elements into correct slot ([#52414](https://github.com/angular/angular/pull/52414)) |
| [81c315ec6e](https://github.com/angular/angular/commit/81c315ec6ea37c55d951d3b38b6c551226173be5) | fix | template type checking not reporting diagnostics for incompatible type comparisons ([#52322](https://github.com/angular/angular/pull/52322)) |
| [1beef49d80](https://github.com/angular/angular/commit/1beef49d80809fbb0e7c8e95f17096c39ac8940a) | fix | update the minVersion if component uses block syntax ([#51979](https://github.com/angular/angular/pull/51979)) |
| [386e1e9500](https://github.com/angular/angular/commit/386e1e950033ad98661e5077a4f119df0e7b3008) | fix | work around TypeScript bug when narrowing switch statements ([#52110](https://github.com/angular/angular/pull/52110)) |
| [e5bca43224](https://github.com/angular/angular/commit/e5bca432248add0a19102f6afeae145f1a33ee8a) | perf | further reduce bundle size using arrow functions ([#52010](https://github.com/angular/angular/pull/52010)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [5b66330329](https://github.com/angular/angular/commit/5b66330329fd066a7c347f040a330b4c7f2a0a2b) | fix | allow non-array imports for standalone component in local compilation mode ([#51819](https://github.com/angular/angular/pull/51819)) |
| [377a7abfda](https://github.com/angular/angular/commit/377a7abfda60a6ddd55a41531e3653bcad78b0a2) | fix | bypass static resolving of the component's changeDetection field in local compilation mode ([#51848](https://github.com/angular/angular/pull/51848)) |
| [19c3dc18d3](https://github.com/angular/angular/commit/19c3dc18d3c0cfd83efec2c8f81b40860d570346) | fix | fix NgModule injector def in local compilation mode when imports/exports are non-array expressions ([#51819](https://github.com/angular/angular/pull/51819)) |
| [11bb19cafc](https://github.com/angular/angular/commit/11bb19cafcf447b7ce6ade146d431a43c3e2c682) | fix | handle nested qualified names in ctor injection in local compilation mode ([#51947](https://github.com/angular/angular/pull/51947)) |
| [f91f222b55](https://github.com/angular/angular/commit/f91f222b55f249089d267c72a9c0ab5b09d7c932) | fix | resolve component encapsulation enum in local compilation mode ([#51848](https://github.com/angular/angular/pull/51848)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [59b6ec6be8](https://github.com/angular/angular/commit/59b6ec6be8cc464a6e74449ac7e0f2554ac7392b) | docs | Deprecate `ChangeDetectorRef.checkNoChanges` ([#52431](https://github.com/angular/angular/pull/52431)) |
| [4f04d1cdab](https://github.com/angular/angular/commit/4f04d1cdab2fc5217566c0c01b7df10c74a93afa) | feat | add new list reconcilation algorithm ([#51980](https://github.com/angular/angular/pull/51980)) |
| [c7127b98b5](https://github.com/angular/angular/commit/c7127b98b555449f99e24a81c828ab7b1c6c4a4e) | feat | add schematic to escape block syntax characters ([#51905](https://github.com/angular/angular/pull/51905)) |
| [50275e58b8](https://github.com/angular/angular/commit/50275e58b80acfc52239908a6c61523e99f6731c) | feat | Add schematic to migrate control flow syntax ([#52035](https://github.com/angular/angular/pull/52035)) |
| [81b67aa987](https://github.com/angular/angular/commit/81b67aa98767078aebae22150d3441372772c28f) | feat | add support for zone.js 0.14.0 ([#51774](https://github.com/angular/angular/pull/51774)) |
| [048f400efc](https://github.com/angular/angular/commit/048f400efc75011e888ea25d214a0211f91b96d4) | feat | add warnings for oversized images and lazy-lcp ([#51846](https://github.com/angular/angular/pull/51846)) |
| [93675dc797](https://github.com/angular/angular/commit/93675dc797cb9f897c19fe298455dec52b900113) | feat | conditional built-in control flow ([#51346](https://github.com/angular/angular/pull/51346)) |
| [4427e1ebc2](https://github.com/angular/angular/commit/4427e1ebc29f5541cfe6a404f212de4359441812) | feat | create function to assert not running inside reactive context ([#52049](https://github.com/angular/angular/pull/52049)) |
| [e23aaa7d75](https://github.com/angular/angular/commit/e23aaa7d75efdd52be4dd7ca9267bc60d36059c2) | feat | drop support for older TypeScript versions ([#51792](https://github.com/angular/angular/pull/51792)) |
| [43e6fb0606](https://github.com/angular/angular/commit/43e6fb0606e15584dcb4478ad4eaa8e825dda83e) | feat | enable block syntax ([#51994](https://github.com/angular/angular/pull/51994)) |
| [3cbb2a8ecf](https://github.com/angular/angular/commit/3cbb2a8ecf202c814c37ab241ce9f57fb574692e) | feat | implement deferred block interaction triggers ([#51830](https://github.com/angular/angular/pull/51830)) |
| [8be2c48b7c](https://github.com/angular/angular/commit/8be2c48b7cda5e99f3d1efa9f26eb2615fea6a8b) | feat | implement new block syntax ([#51891](https://github.com/angular/angular/pull/51891)) |
| [a54713c831](https://github.com/angular/angular/commit/a54713c8316787eea160cfdb7f2778a087fe59ed) | feat | implement ɵgetInjectorMetadata debug API ([#51900](https://github.com/angular/angular/pull/51900)) |
| [5b88d136af](https://github.com/angular/angular/commit/5b88d136affdaa35e7015c00281b86cae040321b) | feat | mark core signal APIs as stable ([#51821](https://github.com/angular/angular/pull/51821)) |
| [8eef694def](https://github.com/angular/angular/commit/8eef694def3dc660779168925a380179c7e30993) | feat | Provide a diagnostic for missing Signal invocation in template interpolation. ([#49660](https://github.com/angular/angular/pull/49660)) |
| [40113f653c](https://github.com/angular/angular/commit/40113f653c2468315e1dea64f17e545840cc5e22) | feat | Remove deprecated `CompilerOptions.useJit` and`CompilerOptions.missingTranslation`. ([#49672](https://github.com/angular/angular/pull/49672)) |
| [68ba798ae3](https://github.com/angular/angular/commit/68ba798ae3551b789a86d46b0a3bb61d42ef3f87) | feat | revamp the runtime error message for orphan components to include full component info ([#51919](https://github.com/angular/angular/pull/51919)) |
| [1a4aee7e49](https://github.com/angular/angular/commit/1a4aee7e49074e3bc3f3099bff88eaee9b2ab255) | feat | show runtime error for orphan component rendering ([#52061](https://github.com/angular/angular/pull/52061)) |
| [687b96186c](https://github.com/angular/angular/commit/687b96186c7da731927e55e714061ea2de718505) | feat | support deferred hover triggers ([#51874](https://github.com/angular/angular/pull/51874)) |
| [e2e3d69a27](https://github.com/angular/angular/commit/e2e3d69a277990ab79aac7aae43cbdd398e13ed9) | feat | support deferred triggers with implicit triggers ([#51922](https://github.com/angular/angular/pull/51922)) |
| [16f5fc40a4](https://github.com/angular/angular/commit/16f5fc40a49cee0d29711df1783f297ff30b5c6e) | feat | support deferred viewport triggers ([#51874](https://github.com/angular/angular/pull/51874)) |
| [59387ee476](https://github.com/angular/angular/commit/59387ee476dff1a893a01fe5cbee3c95b93c0cdb) | feat | support styles and styleUrl as strings ([#51715](https://github.com/angular/angular/pull/51715)) |
| [9cc52b9b85](https://github.com/angular/angular/commit/9cc52b9b85ffa5cb65c6886e81b5bff10dde8d52) | feat | support TypeScript 5.2 ([#51334](https://github.com/angular/angular/pull/51334)) |
| [7d42dc3c02](https://github.com/angular/angular/commit/7d42dc3c023391e12ea607beb227fd4426e1694d) | feat | the new list reconciliation algorithm for built-in for ([#51980](https://github.com/angular/angular/pull/51980)) |
| [935c1816fd](https://github.com/angular/angular/commit/935c1816fd04caab24be66f8ef67851c88d3d4da) | fix | add `rejectErrors` option to `toSignal` ([#52474](https://github.com/angular/angular/pull/52474)) |
| [5411864c2e](https://github.com/angular/angular/commit/5411864c2e74b52e7df8022719f0fd792b50a849) | fix | adjust toSignal types to handle more common cases ([#51991](https://github.com/angular/angular/pull/51991)) |
| [dcf18dc74c](https://github.com/angular/angular/commit/dcf18dc74c260253bbf394626beb712a831824f3) | fix | allow toSignal calls in reactive context ([#51831](https://github.com/angular/angular/pull/51831)) |
| [dbffdc09c2](https://github.com/angular/angular/commit/dbffdc09c25c93868aa13ae368c9fd21a4c359fb) | fix | avoid duplicated code between entry-points (primary, testing, rxjs-interop) ([#51500](https://github.com/angular/angular/pull/51500)) |
| [4f69d620d9](https://github.com/angular/angular/commit/4f69d620d94663592780b2875acbc2b1918775f9) | fix | deferred blocks not removing content immediately when animations are enabled ([#51971](https://github.com/angular/angular/pull/51971)) |
| [df58c0b714](https://github.com/angular/angular/commit/df58c0b714e37152ddf81855ee31f93f9fa71e30) | fix | disallow `afterRender` in reactive contexts ([#52138](https://github.com/angular/angular/pull/52138)) |
| [5d61221ed7](https://github.com/angular/angular/commit/5d61221ed7b4a5d1ef005183045d45238b19a446) | fix | disallow using `effect` inside reactive contexts ([#52138](https://github.com/angular/angular/pull/52138)) |
| [99e7629159](https://github.com/angular/angular/commit/99e7629159afbb8550957a265c5bd75f7e13f052) | fix | do not remove used ng-template nodes in control flow migration ([#52186](https://github.com/angular/angular/pull/52186)) |
| [c7ff9dff2c](https://github.com/angular/angular/commit/c7ff9dff2c14aba70e92b9e216a2d4d97d6ef71e) | fix | drop mutate function from the signals public API ([#51821](https://github.com/angular/angular/pull/51821)) |
| [00128e3853](https://github.com/angular/angular/commit/00128e38538f12fe9bc72ede9b55149e0be5ead0) | fix | drop mutate function from the signals public API ([#51821](https://github.com/angular/angular/pull/51821)) ([#51986](https://github.com/angular/angular/pull/51986)) |
| [ddef3ac9a4](https://github.com/angular/angular/commit/ddef3ac9a42677b900c998b2af7cd23a8213aa3a) | fix | effects wait for ngOnInit for their first run ([#52473](https://github.com/angular/angular/pull/52473)) |
| [5ead7d412d](https://github.com/angular/angular/commit/5ead7d412d847c85176a321e58d12dcdfc0dab67) | fix | ensure a consumer drops all its stale producers ([#51722](https://github.com/angular/angular/pull/51722)) |
| [1dd8558f82](https://github.com/angular/angular/commit/1dd8558f82aeb5f5819629d5e25b616343d27f1f) | fix | Ensure backwards-referenced transplanted views are refreshed ([#51854](https://github.com/angular/angular/pull/51854)) |
| [50ad074505](https://github.com/angular/angular/commit/50ad074505c15d09fe5d85fb443d9a2775125f87) | fix | framework debug APIs getDependenciesForTokenInInjector and getInjectorMetadata ([#51719](https://github.com/angular/angular/pull/51719)) |
| [80e7a0f8fa](https://github.com/angular/angular/commit/80e7a0f8fa13ad72a32b07cd1722efab3722fa49) | fix | guard usages of `performance.mark` ([#52505](https://github.com/angular/angular/pull/52505)) |
| [b9ea2d6900](https://github.com/angular/angular/commit/b9ea2d690015dd5b919df239a5ded66f2969b97b) | fix | handle aliased index with no space in control flow migration ([#52444](https://github.com/angular/angular/pull/52444)) |
| [ffe9b1fcc2](https://github.com/angular/angular/commit/ffe9b1fcc2ecb8dc0d36c7f9228ac1a052554eef) | fix | handle for alias with as in control flow migration ([#52183](https://github.com/angular/angular/pull/52183)) |
| [e5720edb46](https://github.com/angular/angular/commit/e5720edb460a1bb51475c78d3bd442da52991a46) | fix | handle if alias in control flow migration ([#52181](https://github.com/angular/angular/pull/52181)) |
| [4461cefa4f](https://github.com/angular/angular/commit/4461cefa4f8db21009ab10a2a53de664163a86d2) | fix | handle trackBy and aliased index in control flow migration ([#52423](https://github.com/angular/angular/pull/52423)) |
| [7368b8aaeb](https://github.com/angular/angular/commit/7368b8aaeba2ef0972a8bb261208c7281e050bb9) | fix | host directive validation not picking up duplicate directives on component node ([#52073](https://github.com/angular/angular/pull/52073)) |
| [696f003553](https://github.com/angular/angular/commit/696f003553a0ca6886329728511dd46761de909b) | fix | mutation bug in `getDependenciesFromInjectable` ([#52450](https://github.com/angular/angular/pull/52450)) |
| [d487014785](https://github.com/angular/angular/commit/d48701478518d97a1fd5b4744963530494f93958) | fix | Remove no longer needed build rule related to removed migration ([#52143](https://github.com/angular/angular/pull/52143)) |
| [4da08dc2ef](https://github.com/angular/angular/commit/4da08dc2ef439d3eced7199afb9a104cfd7b54cc) | fix | remove unnecessary migration ([#52141](https://github.com/angular/angular/pull/52141)) |
| [384d7aacd0](https://github.com/angular/angular/commit/384d7aacd04dfbb951d9d4ab493759c12cf35645) | fix | replace assertion with more intentional error ([#52427](https://github.com/angular/angular/pull/52427)) |
| [40bb45f329](https://github.com/angular/angular/commit/40bb45f3297359866cab39044dba06b3e809b096) | fix | Respect OnPush change detection strategy for dynamically created components ([#51356](https://github.com/angular/angular/pull/51356)) |
| [3a19d6b743](https://github.com/angular/angular/commit/3a19d6b7437e1812ae70b3784fd6a8a185b330b1) | fix | run afterRender callbacks outside of the Angular zone ([#51385](https://github.com/angular/angular/pull/51385)) |
| [a2ba5482c3](https://github.com/angular/angular/commit/a2ba5482c3032df808cb684444f76e2825a4fd36) | fix | use TNode instead of LView for mapping injector providers ([#52436](https://github.com/angular/angular/pull/52436)) |
| [d5dad3eb4c](https://github.com/angular/angular/commit/d5dad3eb4cd837032da72899f0796c6d431cb2c9) | fix | viewport trigger deregistering callbacks multiple times ([#52115](https://github.com/angular/angular/pull/52115)) |
| [8e4a7ab52b](https://github.com/angular/angular/commit/8e4a7ab52bc85172efd12e42304e1b8da446ff75) | perf | avoid repeated access to LContainer and trackBy calculation ([#52227](https://github.com/angular/angular/pull/52227)) |
| [1dc14d9853](https://github.com/angular/angular/commit/1dc14d98539b9063b14c6463a534a4129b0a4643) | perf | avoid unnecessary callbacks in after render hooks ([#52292](https://github.com/angular/angular/pull/52292)) |
| [e90694259e](https://github.com/angular/angular/commit/e90694259e31f264f05d4aa9ebe275638577ce1a) | perf | build-in for should update indexes only when views were added / removed ([#52051](https://github.com/angular/angular/pull/52051)) |
| [1032c1e1a5](https://github.com/angular/angular/commit/1032c1e1a5f5de28f38ede1786cf973f8e8b7a53) | perf | cache LiveCollectionLContainerImpl ([#52227](https://github.com/angular/angular/pull/52227)) |
| [685d01e106](https://github.com/angular/angular/commit/685d01e1065dad6dc52eaac9eb9527100994f5ce) | perf | chain template instructions ([#51546](https://github.com/angular/angular/pull/51546)) |
| [88a0af64fd](https://github.com/angular/angular/commit/88a0af64fde58cbf71e8e2a22c39fabb8f0ee8fb) | perf | generate arrow functions for pure function calls ([#51668](https://github.com/angular/angular/pull/51668)) |
| [37d627dbd4](https://github.com/angular/angular/commit/37d627dbd4083662b103de2e28102e6ff31a9192) | perf | minimze trackBy calculations ([#52227](https://github.com/angular/angular/pull/52227)) |
| [3861a73135](https://github.com/angular/angular/commit/3861a73135ca9111c0ec10d52ee7db0a0e95f262) | perf | Update LView consumer to only mark component for check ([#52302](https://github.com/angular/angular/pull/52302)) |
| [9b9e11fcaf](https://github.com/angular/angular/commit/9b9e11fcaf5d8d639ff1d7b8feddb01751b47e14) | refactor | deprecate allowing full context object to be replaced in `EmbeddedViewRef` ([#51887](https://github.com/angular/angular/pull/51887)) |
| [ba9fc2419e](https://github.com/angular/angular/commit/ba9fc2419eee0d72c573463016a872a4b69f71c1) | refactor | deprecate the `NgProbeToken` ([#51396](https://github.com/angular/angular/pull/51396)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [7dde42a5df](https://github.com/angular/angular/commit/7dde42a5dfdab30e9420708722e0bef9f1467d1f) | feat | allow customization of the HttpTransferCache. ([#52029](https://github.com/angular/angular/pull/52029)) |
| [8156b3d4ec](https://github.com/angular/angular/commit/8156b3d4ec44a3b0489cc21763790a3be2969f7e) | fix | Don't override the backend when using the InMemoryWebAPI ([#52425](https://github.com/angular/angular/pull/52425)) |
| [bd9e91ecf7](https://github.com/angular/angular/commit/bd9e91ecf7af877e4ecf08a16eda7b4e59707541) | perf | reduce data transfer when using HTTP caching ([#52347](https://github.com/angular/angular/pull/52347)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [449830f24e](https://github.com/angular/angular/commit/449830f24e78ebd977ca3210ab3541912d959245) | feat | Complete inside @switch ([#52153](https://github.com/angular/angular/pull/52153)) |
| [e2416a284f](https://github.com/angular/angular/commit/e2416a284ff086752c809689ef74588f02e5f0e4) | feat | Enable go to definition of styleUrl ([#51746](https://github.com/angular/angular/pull/51746)) |
| [023a181ba5](https://github.com/angular/angular/commit/023a181ba5f489deb0a47bbc9b290621ad38304a) | feat | Implement outlining spans for control flow blocks ([#52062](https://github.com/angular/angular/pull/52062)) |
| [7c052bb6ef](https://github.com/angular/angular/commit/7c052bb6efde580afc61d6c50e787353c103e3e1) | feat | Support autocompletion for blocks ([#52121](https://github.com/angular/angular/pull/52121)) |
| [9d565cd6d6](https://github.com/angular/angular/commit/9d565cd6d682e5c86ee8d43e1ee1c0f8866eb274) | fix | Autocomplete block keywords in more cases ([#52198](https://github.com/angular/angular/pull/52198)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [5a20a44c64](https://github.com/angular/angular/commit/5a20a44c64066e47894ca3cbe26327766ca89a42) | fix | ng-add schematics for application builder ([#51777](https://github.com/angular/angular/pull/51777)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [f0da7c2e44](https://github.com/angular/angular/commit/f0da7c2e44a29c5a71cf4880388989d129f4c6e8) | feat | schematic to remove deprecated CompilerOptions properties ([#49672](https://github.com/angular/angular/pull/49672)) |
| [965ce5a8c5](https://github.com/angular/angular/commit/965ce5a8c514237aa8e4c03a5e4b5527a1a19d96) | feat | Schematics for `TransferState`, `StateKey` and `makeStateKey` migration. ([#49594](https://github.com/angular/angular/pull/49594)) |
| [09e905ad67](https://github.com/angular/angular/commit/09e905ad672294d36f36eb2728b3483ab2e729fc) | fix | account for separator characters inside strings ([#52525](https://github.com/angular/angular/pull/52525)) |
| [4c878f90d2](https://github.com/angular/angular/commit/4c878f90d2cba689703d8def9dade3b7f8f6e8f1) | fix | Add support for nested structures inside a switch statement ([#52358](https://github.com/angular/angular/pull/52358)) |
| [d7397fb29b](https://github.com/angular/angular/commit/d7397fb29b400f193a2cda7af70058ac39247e6f) | fix | Ensure control flow migration ignores new block syntax ([#52402](https://github.com/angular/angular/pull/52402)) |
| [6a01d62b9d](https://github.com/angular/angular/commit/6a01d62b9df33732ea3dbef8de1385c8c0cb8a88) | fix | fix broken migration when no control flow is present ([#52399](https://github.com/angular/angular/pull/52399)) |
| [9c2be715a3](https://github.com/angular/angular/commit/9c2be715a3f6ea6b1d0184f5d79f5a3dfef4b576) | fix | Fixes a bug in the ngFor pre-v5 alias translation ([#52531](https://github.com/angular/angular/pull/52531)) |
| [54fed68bbf](https://github.com/angular/angular/commit/54fed68bbfed34a631df64ac6a32e99d2fade50a) | fix | Fixes the root level template offset in control flow migration ([#52355](https://github.com/angular/angular/pull/52355)) |
| [57404d4723](https://github.com/angular/angular/commit/57404d4723d3634f2b5dfdc9af1af50d8f61da70) | fix | handle comma-separated syntax in ngFor ([#52525](https://github.com/angular/angular/pull/52525)) |
| [54bc384661](https://github.com/angular/angular/commit/54bc384661ae7b884dbb822592e75df281aa02dd) | fix | handle nested classes in block entities migration ([#52309](https://github.com/angular/angular/pull/52309)) |
| [c9b1ddff4d](https://github.com/angular/angular/commit/c9b1ddff4d16cca149ca2b1faae729bf454b61e5) | fix | handle nested classes in control flow migration ([#52309](https://github.com/angular/angular/pull/52309)) |
| [6988a0070e](https://github.com/angular/angular/commit/6988a0070e9849b58738bba82d6f9eb9e3b27330) | fix | handle ngIf else condition with no whitespaces ([#52504](https://github.com/angular/angular/pull/52504)) |
| [e40e55d902](https://github.com/angular/angular/commit/e40e55d902e09c36da4cf73b5ab31b6b65584518) | fix | Remove unhelpful parsing errors from the log ([#52401](https://github.com/angular/angular/pull/52401)) |
| [c267f54bc3](https://github.com/angular/angular/commit/c267f54bc36e1c92f526071e2d78455daf8a588c) | fix | Update regex to better match ng-templates ([#52529](https://github.com/angular/angular/pull/52529)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [c340d6e044](https://github.com/angular/angular/commit/c340d6e0440bd982dff6f9f4f4229931c62d2c08) | feat | enable removal of styles on component destroy by default ([#51571](https://github.com/angular/angular/pull/51571)) |
| [c5daa6ce77](https://github.com/angular/angular/commit/c5daa6ce776724d44c02cc97f1a349a85cb2a819) | feat | expose `EventManagerPlugin` in the public API. ([#49969](https://github.com/angular/angular/pull/49969)) |
| [5b375d106f](https://github.com/angular/angular/commit/5b375d106f2e02afadad8f5a60c37558318ea091) | fix | Fire Animations events when using async animations. ([#52087](https://github.com/angular/angular/pull/52087)) |
| [65786b2b96](https://github.com/angular/angular/commit/65786b2b96ba198034ff23bb14571a659a491b50) | fix | prevent duplicate stylesheets from being created ([#52019](https://github.com/angular/angular/pull/52019)) |
| [75d610d420](https://github.com/angular/angular/commit/75d610d420ce3a1ec6429d79c72ec6ef6c2c9a10) | fix | set animation properties when using async animations. ([#52087](https://github.com/angular/angular/pull/52087)) |
| [3c0577f991](https://github.com/angular/angular/commit/3c0577f99140b75688cb8ae969738325cc871548) | perf | disable styles of removed components instead of removing ([#51808](https://github.com/angular/angular/pull/51808)) |
| [c9cde3ab10](https://github.com/angular/angular/commit/c9cde3ab103699bc3f941d8176ee0b0373fcf7e0) | perf | only append style element on creation ([#52237](https://github.com/angular/angular/pull/52237)) |
| [dbc14eb41d](https://github.com/angular/angular/commit/dbc14eb41d540ab3f7509e41cdf64ac6fe33e13a) | refactor | remove `withNoDomReuse` function ([#52057](https://github.com/angular/angular/pull/52057)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [0c66e2424c](https://github.com/angular/angular/commit/0c66e2424c84f92765c727a98f8d2199f4b1a809) | fix | resolve relative requests URL ([#52326](https://github.com/angular/angular/pull/52326)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [1da28f4825](https://github.com/angular/angular/commit/1da28f482517ea53a18e4eb526c7c9708e6fcb55) | feat | Add callback to execute when a view transition is created ([#52002](https://github.com/angular/angular/pull/52002)) |
| [73e4bf2ed2](https://github.com/angular/angular/commit/73e4bf2ed2471faf44a49b591e19a390d5867449) | feat | Add feature to support the View Transitions API ([#51314](https://github.com/angular/angular/pull/51314)) |
| [86e91463af](https://github.com/angular/angular/commit/86e91463afc1f3d3d71a669fb2919f2b8bc5a1ca) | feat | Add option to skip the first view transition ([#51825](https://github.com/angular/angular/pull/51825)) |
| [ce1b915868](https://github.com/angular/angular/commit/ce1b915868e654cdb679e9381db9d3bd3d68d5c4) | fix | Allow redirects after an absolute redirect ([#51731](https://github.com/angular/angular/pull/51731)) |
| [37df395be0](https://github.com/angular/angular/commit/37df395be070a11b8cd84c0ff3af9290d15c4e9d) | fix | children of routes with loadComponent should not inherit parent data by default ([#52114](https://github.com/angular/angular/pull/52114)) |
| [4dce8766f8](https://github.com/angular/angular/commit/4dce8766f8a3a33ffab0b3df5981ad209db42c77) | fix | Ensure newly resolved data is inherited by child routes ([#52167](https://github.com/angular/angular/pull/52167)) |
| [f464e39364](https://github.com/angular/angular/commit/f464e39364da6436fc4b5a703f66fe7dee70818c) | fix | Ensure title observable gets latest values ([#51561](https://github.com/angular/angular/pull/51561)) |
| [b2aff43621](https://github.com/angular/angular/commit/b2aff4362129feb746856fc3d0f8e73b1927a037) | fix | Remove `urlHandlingStrategy` from public Router properties ([#51631](https://github.com/angular/angular/pull/51631)) |
| [c62e680098](https://github.com/angular/angular/commit/c62e680098a8c26fb2234336613185f7ab273483) | fix | Remove deprecated Router properties ([#51502](https://github.com/angular/angular/pull/51502)) |
| [3c6258c85b](https://github.com/angular/angular/commit/3c6258c85b37535c1178e84509b7c9ed3a1359e4) | fix | Remove deprecated setupTestingRouter function ([#51826](https://github.com/angular/angular/pull/51826)) |
| [0b3e6a41d0](https://github.com/angular/angular/commit/0b3e6a41d025997d2947125d875ac26ecd1b86d9) | fix | Remove malformedUriErrorHandler from `ExtraOptions` ([#51745](https://github.com/angular/angular/pull/51745)) |
| [c03baed854](https://github.com/angular/angular/commit/c03baed8547c2c1da576307c708d2682dfdf3742) | fix | use DOCUMENT token instead of document directly in view transitions ([#51814](https://github.com/angular/angular/pull/51814)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.12"></a>
# 16.2.12 (2023-11-02)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [03f4050636](https://github.com/angular/angular/commit/03f4050636a385cf2e920b06e7ec94d6b5f32383) | fix | remove `finish` listener once player is destroyed ([#51136](https://github.com/angular/angular/pull/51136)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [e092184a5c](https://github.com/angular/angular/commit/e092184a5c3d98f4be329e4037c9039c1b420d75) | fix | apply fixed_srcset_width values only to fixed srcsets ([#52486](https://github.com/angular/angular/pull/52486)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b3b4ae4c3a](https://github.com/angular/angular/commit/b3b4ae4c3ae5f307e68e3a57f84c9e2dfc9938fb) | fix | properly emit literal types in input coercion function arguments ([#52437](https://github.com/angular/angular/pull/52437)) |
| [873c4f2454](https://github.com/angular/angular/commit/873c4f2454716520881f9d684364bdd6ab6ef722) | fix | use originally used module specifier for transform functions ([#52437](https://github.com/angular/angular/pull/52437)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.11"></a>
# 16.2.11 (2023-10-25)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [54ea3b65c3](https://github.com/angular/angular/commit/54ea3b65c35254b220054541f2fbc52384486156) | fix | emit provider configured event when a service is configured with `providedIn` ([#52365](https://github.com/angular/angular/pull/52365)) |
| [78533324dc](https://github.com/angular/angular/commit/78533324dcda2e884fbe489aaa6b37fa9a6fadbc) | fix | get root and platform injector providers in special cases ([#52365](https://github.com/angular/angular/pull/52365)) |
| [019a0f4c22](https://github.com/angular/angular/commit/019a0f4c225d6bb6f741b37bf272b62899fe1f69) | fix | load global utils before creating platform injector in the standalone case ([#52365](https://github.com/angular/angular/pull/52365)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [b79b4aca91](https://github.com/angular/angular/commit/b79b4aca914aefda1605fc8d069ac8d84283f1b3) | fix | `RouterTestingHarness` should throw if a component is expected but navigation fails ([#52357](https://github.com/angular/angular/pull/52357)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.10"></a>
# 16.2.10 (2023-10-18)

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.9"></a>
# 16.2.9 (2023-10-11)
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [51a5baace3](https://github.com/angular/angular/commit/51a5baace3b1eee130fa911327773066139cc68e) | fix | reset() call with null values on nested group ([#48830](https://github.com/angular/angular/pull/48830)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.8"></a>
# 16.2.8 (2023-10-04)
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [b732961fc3](https://github.com/angular/angular/commit/b732961fc3c6eec3cf5508330cc09d6a0a2d8f9a) | fix | Retain correct language service when `ts.Project` reloads ([#51912](https://github.com/angular/angular/pull/51912)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [966ce9790a](https://github.com/angular/angular/commit/966ce9790aa7c9414bcd35b49621f169d67b5669) | fix | throw a critical error when handleFetch fails ([#51960](https://github.com/angular/angular/pull/51960)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.10"></a>
# 15.2.10 (2023-10-04)
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [9fe08968b8](https://github.com/angular/angular/commit/9fe08968b84b92da47ce91f5d2860b3aa23d2d2b) | fix | throw a critical error when handleFetch fail ([#51989](https://github.com/angular/angular/pull/51989)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.7"></a>
# 16.2.7 (2023-09-27)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [39a3e34e03](https://github.com/angular/angular/commit/39a3e34e035b324bfa1f1a11cf452272c91011c6) | fix | allow toSignal calls in reactive context ([#51831](https://github.com/angular/angular/pull/51831)) ([#51892](https://github.com/angular/angular/pull/51892)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [c3d901eacf](https://github.com/angular/angular/commit/c3d901eacfe8d035441e5c990f6e6b2630d592f5) | fix | throw a critical error when `handleFetch` fails ([#51885](https://github.com/angular/angular/pull/51885)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.6"></a>
# 16.2.6 (2023-09-20)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [82712f80df](https://github.com/angular/angular/commit/82712f80dfc6aed2baf8d8f80c3552a6707c88ff) | fix | ensure a consumer drops all its stale producers ([#51722](https://github.com/angular/angular/pull/51722)) ([#51772](https://github.com/angular/angular/pull/51772)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.5"></a>
# 16.2.5 (2023-09-13)

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.4"></a>
# 16.2.4 (2023-09-06)

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.3"></a>
# 16.2.3 (2023-08-30)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [04c6574280](https://github.com/angular/angular/commit/04c65742802537c8bd725f9a7a931955a67684d9) | fix | remove unnecessary escaping in regex expressions ([#51554](https://github.com/angular/angular/pull/51554)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [dbd761f528](https://github.com/angular/angular/commit/dbd761f528a08cba0fbdd476b115e1445683cf36) | fix | correct incomplete escaping ([#51557](https://github.com/angular/angular/pull/51557)) |
| [5c36fc784f](https://github.com/angular/angular/commit/5c36fc784f292608f7485c5513aeb98e5745d17c) | fix | remove unnecessary escaping in regex expressions ([#51554](https://github.com/angular/angular/pull/51554)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dcd1add06f](https://github.com/angular/angular/commit/dcd1add06f9facb87de89c144967cc95a2dac27c) | fix | correct incomplete escaping ([#51557](https://github.com/angular/angular/pull/51557)) |
| [20d62603c2](https://github.com/angular/angular/commit/20d62603c2f86c810fda0b3b503327dce232a6d3) | fix | handle hydration of view containers that use component hosts as anchors ([#51456](https://github.com/angular/angular/pull/51456)) |
| [e6b301caa2](https://github.com/angular/angular/commit/e6b301caa25c1532a4db2e8521bdea3f911316b1) | fix | remove unnecessary escaping in regex expressions ([#51554](https://github.com/angular/angular/pull/51554)) |
| [0c7c852ee7](https://github.com/angular/angular/commit/0c7c852ee7ba3c1943cafce4c58760eef1b0aea4) | fix | run afterRender callbacks outside of the Angular zone ([#51551](https://github.com/angular/angular/pull/51551)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [8081fdd22d](https://github.com/angular/angular/commit/8081fdd22d6889f92e11cbe4c53d80bddd496a9a) | fix | correct incomplete escaping ([#51557](https://github.com/angular/angular/pull/51557)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.2"></a>
# 16.2.2 (2023-08-23)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [a43c0772ea](https://github.com/angular/angular/commit/a43c0772ea74410b0492a178c656268a465d3b09) | fix | Allow safeUrl for ngSrc in NgOptimizedImage ([#51351](https://github.com/angular/angular/pull/51351)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [39ace8664b](https://github.com/angular/angular/commit/39ace8664b843225a75dd706236ae13e171126d3) | fix | enforce a minimum version to be used when a library uses input transform ([#51413](https://github.com/angular/angular/pull/51413)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [36f434e49d](https://github.com/angular/angular/commit/36f434e49d24f0393950299486141a121d42e044) | fix | guard the jasmine hooks ([#51394](https://github.com/angular/angular/pull/51394)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [b0396e7164](https://github.com/angular/angular/commit/b0396e7164c08e01d24d2d8411edf1ccf4b52826) | fix | Ensure `canceledNavigationResolution: 'computed'` works on first page ([#51441](https://github.com/angular/angular/pull/51441)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.1"></a>
# 16.2.1 (2023-08-16)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [232a8c1b8d](https://github.com/angular/angular/commit/232a8c1b8dadf3f886b4bd0142613d116c865759) | fix | Apply named outlets to children empty paths not appearing in the URL ([#51292](https://github.com/angular/angular/pull/51292)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.0"></a>
# 16.2.0 (2023-08-09)
### benchpress
| Commit | Type | Description |
| -- | -- | -- |
| [dd850b2ab7](https://github.com/angular/angular/commit/dd850b2ab781f24065550f8a948ced498e0f1e99) | fix | correctly report GC memory amounts ([#50760](https://github.com/angular/angular/pull/50760)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [29d358170b](https://github.com/angular/angular/commit/29d358170b046f4a6773dfdfbbd1050f54deb301) | feat | add component input binding support for NgComponentOutlet ([#51148](https://github.com/angular/angular/pull/51148)) |
| [1837efb9da](https://github.com/angular/angular/commit/1837efb9daf5c8e86a99a06ecc77bb42bc60dbb0) | feat | Allow ngSrc to be changed post-init ([#50683](https://github.com/angular/angular/pull/50683)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c27a1e61d6](https://github.com/angular/angular/commit/c27a1e61d64a67aa169086f7db11bcfd5bb7d2fc) | feat | scope selectors in @scope queries ([#50747](https://github.com/angular/angular/pull/50747)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [12bad6576d](https://github.com/angular/angular/commit/12bad6576d2ffe4667118b214d9c7598ed3d8edb) | fix | libraries compiled with v16.1+ breaking with Angular framework v16.0.x ([#50714](https://github.com/angular/angular/pull/50714)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e53d4ecf4c](https://github.com/angular/angular/commit/e53d4ecf4cfd9e64d6ba8c8b19adbb7df9cfc047) | feat | add afterRender and afterNextRender ([#50607](https://github.com/angular/angular/pull/50607)) |
| [98d262fd27](https://github.com/angular/angular/commit/98d262fd27795014ee3988b08d3c48a0dfb63c40) | feat | create injector debugging APIs ([#48639](https://github.com/angular/angular/pull/48639)) |
| [cdaa2a8a9e](https://github.com/angular/angular/commit/cdaa2a8a9eab490b55bbb841ede4f54a2656df30) | feat | support Provider type in Injector.create ([#49587](https://github.com/angular/angular/pull/49587)) |
| [9f490da7e2](https://github.com/angular/angular/commit/9f490da7e27e495cb45d2064af9091731422a6b1) | fix | handle hydration of view containers for root components ([#51247](https://github.com/angular/angular/pull/51247)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [0b14e4ef74](https://github.com/angular/angular/commit/0b14e4ef742b1c0f73d873e2c337683b60f46845) | feat | exposes the `fixture` of the `RouterTestingHarness` ([#50280](https://github.com/angular/angular/pull/50280)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.9"></a>
# 16.1.9 (2023-08-09)

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.8"></a>
# 16.1.8 (2023-08-02)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [cc722ea1f5](https://github.com/angular/angular/commit/cc722ea1f5b16f5a4fddc1ecd91b21b3005242ae) | fix | return full spans for Comment nodes ([#50855](https://github.com/angular/angular/pull/50855)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.7"></a>
# 16.1.7 (2023-07-26)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [916916d835](https://github.com/angular/angular/commit/916916d8357a3b045cbe6ec1b850c980be1bdb12) | fix | check whether `Zone` is defined ([#51119](https://github.com/angular/angular/pull/51119)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.6"></a>
# 16.1.6 (2023-07-19)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [dea8dc0378](https://github.com/angular/angular/commit/dea8dc0378c5b777b1879f22189fe32cbe61b36b) | fix | Run fetch request out the angular zone ([#50981](https://github.com/angular/angular/pull/50981)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.5"></a>
# 16.1.5 (2023-07-13)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [f920fcbd94](https://github.com/angular/angular/commit/f920fcbd94d8a1b8cbd2b80f349ed85b4e730a0e) | fix | Ensure elements are removed from the cache after leave animation. ([#50929](https://github.com/angular/angular/pull/50929)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [499fb5c772](https://github.com/angular/angular/commit/499fb5c772332c03ebd8bbf7e1e6cba80dc0def0) | fix | ensure that standalone components get correct injector instances ([#50954](https://github.com/angular/angular/pull/50954)) |
| [c65913ecb7](https://github.com/angular/angular/commit/c65913ecb7de96ee0178c64136c5ffbc62348f34) | fix | handle `deref` returning `null` on `RefactiveNode`. ([#50992](https://github.com/angular/angular/pull/50992)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [31419f6a3b](https://github.com/angular/angular/commit/31419f6a3b7d57c5e789d6073d7b6505cf720c13) | perf | do not remove renderer from cache when `REMOVE_STYLES_ON_COMPONENT_DESTROY` is enabled. ([#51005](https://github.com/angular/angular/pull/51005)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [3efb577cf3](https://github.com/angular/angular/commit/3efb577cf3b38dda89cba05871224951d1f88146) | fix | Use `takeUntil` on leaky subscription. ([#50901](https://github.com/angular/angular/pull/50901)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.4"></a>
# 16.1.4 (2023-07-06)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4ba5850ba6](https://github.com/angular/angular/commit/4ba5850ba6b1748cf02b94649ab1ec359b4540ad) | fix | use `setTimeout` when coalescing tasks in Node.js ([#50820](https://github.com/angular/angular/pull/50820)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [a4348355ce](https://github.com/angular/angular/commit/a4348355ce630273f762099fe6887a90ef799119) | fix | allow for downgraded components to work with component-router ([#50871](https://github.com/angular/angular/pull/50871)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.3"></a>
# 16.1.3 (2023-06-28)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dd6fc5785f](https://github.com/angular/angular/commit/dd6fc5785fcf10b88db8b87d726af604668bc143) | fix | expose input transform function on ComponentFactory and ComponentMirror ([#50713](https://github.com/angular/angular/pull/50713)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [e1bbe47c23](https://github.com/angular/angular/commit/e1bbe47c234a495766cc07a9741a194954a6b9b4) | fix | support input transform functions ([#50713](https://github.com/angular/angular/pull/50713)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [79dd6a847a](https://github.com/angular/angular/commit/79dd6a847a742ccf69597b122026758ad2b0b629) | fix | wait until animation completion before destroying renderer ([#50677](https://github.com/angular/angular/pull/50677)) |
| [a797f41d1b](https://github.com/angular/angular/commit/a797f41d1bcf11945673ef6d0474f33ad4614602) | fix | wait until animation completion before destroying renderer ([#50860](https://github.com/angular/angular/pull/50860)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.2"></a>
# 16.1.2 (2023-06-21)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [9488a3fd46](https://github.com/angular/angular/commit/9488a3fd4640b902243f441cf54776160da1a0fe) | fix | Send query params on fetch request ([#50740](https://github.com/angular/angular/pull/50740)) |
| [5ae001829c](https://github.com/angular/angular/commit/5ae001829c3f3594e3c10f30e0b89ea1eb2b84fb) | fix | use serializeBody to support JSON payload in FetchBackend ([#50776](https://github.com/angular/angular/pull/50776)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.1"></a>
# 16.1.1 (2023-06-14)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [71360b3a3e](https://github.com/angular/angular/commit/71360b3a3e7cb3419176c89f8c78ebd2e14ff880) | fix | libraries compiled with v16.1+ breaking with Angular framework v16.0.x ([#50715](https://github.com/angular/angular/pull/50715)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d9bed48eb5](https://github.com/angular/angular/commit/d9bed48eb590bc4a45769835bccc206d418f620c) | fix | extend toSignal to accept any Subscribable ([#50162](https://github.com/angular/angular/pull/50162)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5e1d8444ae](https://github.com/angular/angular/commit/5e1d8444ae2952b4e9e5d7089200e7a3ac700e0d) | fix | Prevent a component from importing itself. ([#50554](https://github.com/angular/angular/pull/50554)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.0"></a>
# 16.1.0 (2023-06-13)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [4e663297c5](https://github.com/angular/angular/commit/4e663297c564078c8185c6a73e2baa844406a315) | fix | error when reading compiled input transforms metadata in JIT mode ([#50600](https://github.com/angular/angular/pull/50600)) |
| [721bc72649](https://github.com/angular/angular/commit/721bc72649b7d73f730298e04a4606a8bfd53011) | fix | resolve deprecation warning with TypeScript 5.1 ([#50460](https://github.com/angular/angular/pull/50460)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [68017d4e75](https://github.com/angular/angular/commit/68017d4e75abed78b378dce54f860cfa0d0fa42f) | feat | add ability to transform input values ([#50420](https://github.com/angular/angular/pull/50420)) |
| [69dadd2502](https://github.com/angular/angular/commit/69dadd25020ee84364466c0740f695984dd8c84d) | feat | support TypeScript 5.1 ([#50156](https://github.com/angular/angular/pull/50156)) |
| [c0ebe34cbd](https://github.com/angular/angular/commit/c0ebe34cbd235dc0b5e56fbe37429b77c0d91170) | fix | add additional component metadata to component ID generation ([#50336](https://github.com/angular/angular/pull/50336)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [85c5427582](https://github.com/angular/angular/commit/85c54275825a57fd3c7055a99e58bb211e085af9) | feat | Introduction of the `fetch` Backend for the `HttpClient` ([#50247](https://github.com/angular/angular/pull/50247)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.6"></a>
# 16.0.6 (2023-06-13)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [05ac0868c9](https://github.com/angular/angular/commit/05ac0868c9149fafcb0a0b815b31a65119090838) | fix | avoid duplicated content during hydration while processing a component with i18n ([#50644](https://github.com/angular/angular/pull/50644)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.5"></a>
# 16.0.5 (2023-06-08)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [703b8fcac1](https://github.com/angular/angular/commit/703b8fcac1c9051bf2f342e5502b3cf28dbcab2c) | fix | do not remove comments in component styles ([#50346](https://github.com/angular/angular/pull/50346)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2b6da93e19](https://github.com/angular/angular/commit/2b6da93e191a4250dfc81a7bd54c86e45909ea2d) | fix | incorrectly throwing error for self-referencing component ([#50559](https://github.com/angular/angular/pull/50559)) |
| [c992109d6c](https://github.com/angular/angular/commit/c992109d6c385a2b471f08eaa56701dfd513f219) | fix | wait for HTTP in `ngOnInit` correctly before server render ([#50573](https://github.com/angular/angular/pull/50573)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [c0d4086c6e](https://github.com/angular/angular/commit/c0d4086c6eb7685571366b65cd68a51de186f1a3) | fix | surface errors during rendering ([#50587](https://github.com/angular/angular/pull/50587)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.4"></a>
# 16.0.4 (2023-06-01)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [df65c4fc8f](https://github.com/angular/angular/commit/df65c4fc8f71ab9bf59ec4e5e820d136b12fb570) | fix | Trigger leave animation when ViewContainerRef is injected ([#48705](https://github.com/angular/angular/pull/48705)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [7e1bc513de](https://github.com/angular/angular/commit/7e1bc513dead7d809f5ba2e6edc45b85af12f828) | fix | untrack subscription and unsubscription in async pipe ([#50522](https://github.com/angular/angular/pull/50522)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [9970b29ace](https://github.com/angular/angular/commit/9970b29acef11f1dfedd2640520b4bca4b996f81) | fix | update `ApplicationRef.isStable` to account for rendering pending tasks ([#50425](https://github.com/angular/angular/pull/50425)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.3"></a>
# 16.0.3 (2023-05-24)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c11041e372](https://github.com/angular/angular/commit/c11041e37260ac658e96e98fde5dea6d85b24aae) | fix | adds missing symbols for animation standalone bundling test ([#50434](https://github.com/angular/angular/pull/50434)) |
| [98e8fdf40e](https://github.com/angular/angular/commit/98e8fdf40e598f2c2a4d0c11de302ea13e586a1a) | fix | fix `Self` flag inside embedded views with custom injectors ([#50270](https://github.com/angular/angular/pull/50270)) |
| [199ff4fe7f](https://github.com/angular/angular/commit/199ff4fe7f2cd4b561703e8520c2d6ccc1e2afb7) | fix | host directives incorrectly validating aliased bindings ([#50364](https://github.com/angular/angular/pull/50364)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [080bbd2137](https://github.com/angular/angular/commit/080bbd21377d099c91aa0c6ea8ca634423cd8125) | fix | create macrotask during request handling instead of load start ([#50406](https://github.com/angular/angular/pull/50406)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.2"></a>
# 16.0.2 (2023-05-17)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c1016d4e57](https://github.com/angular/angular/commit/c1016d4e578152dcdfe7c4a4673f27e12bfabf8d) | fix | add additional component metadata to component ID generation ([#50340](https://github.com/angular/angular/pull/50340)) |
| [cc41758b59](https://github.com/angular/angular/commit/cc41758b595da46a3fd14a58b3832c77b251b940) | fix | allow onDestroy unregistration while destroying ([#50237](https://github.com/angular/angular/pull/50237)) |
| [7d679bdb59](https://github.com/angular/angular/commit/7d679bdb59815e7e816337532d069d68cf45a6d8) | fix | allow passing value of any type to `isSignal` function ([#50035](https://github.com/angular/angular/pull/50035)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.1"></a>
# 16.0.1 (2023-05-10)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [52c74d3b4a](https://github.com/angular/angular/commit/52c74d3b4a8d60b60c9e572541b6ccae0d704754) | fix | add additional component metadata to component ID generation ([#50203](https://github.com/angular/angular/pull/50203)) |
| [048b6b1e0d](https://github.com/angular/angular/commit/048b6b1e0d9d93d63e6fde2c16a9c3e2b221b581) | fix | bootstrapApplication call not rejected when error is thrown in importProvidersFrom module ([#50120](https://github.com/angular/angular/pull/50120)) |
| [d68796782f](https://github.com/angular/angular/commit/d68796782ff4ce1f389f14dcff31d393ddaa195d) | fix | handle hydration of root components with injected ViewContainerRef ([#50136](https://github.com/angular/angular/pull/50136)) |
| [f751ce6445](https://github.com/angular/angular/commit/f751ce64453f6ccede13b7bfd02b817eda0b40f7) | fix | handle projection of hydrated containters into components that skip hydration ([#50199](https://github.com/angular/angular/pull/50199)) |
| [346ab73dd9](https://github.com/angular/angular/commit/346ab73dd95fd2adfd8cb4064b9f12a6171e51d5) | fix | only try to retrieve transferred state on the browser ([#50144](https://github.com/angular/angular/pull/50144)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0"></a>
# 16.0.0 (2023-05-03)

[Blog post "Angular v16 is now available"](https://goo.gle/angular-v16).

## Breaking Changes
###
- Angular Compatibility Compiler (ngcc) has been removed and as a result Angular View Engine libraries will no longer work
- Deprecated `EventManager` method `addGlobalEventListener` has been removed as it is not used by Ivy.
### bazel
- Several changes to the Angular Package Format (APF)
  - Removal of FESM2015
  - Replacing ES2020 with ES2022
  - Replacing FESM2020 with FESM2022
- Several changes to the Angular Package Format (APF)
  - Removal of FESM2015
  - Replacing ES2020 with ES2022
  - Replacing FESM2020 with FESM2022
### common
- `MockPlatformLocation` is now provided by default in tests.
  Existing tests may have behaviors which rely on
  `BrowserPlatformLocation` instead. For example, direct access to the
  `window.history` in either the test or the component rather than going
  through the Angular APIs (`Location.getState()`). The quickest fix is to
  update the providers in the test suite to override the provider again
  `TestBed.configureTestingModule({providers: [{provide: PlatformLocation, useClass: BrowserPlatformLocation}]})`.
  The ideal fix would be to update the code to instead be compatible with
  `MockPlatformLocation` instead.
-  If the 'ngTemplateOutletContext' is different from the context, it will result in a compile-time error.

  Before the change, the following template was compiling:

  ```typescript
  interface MyContext {
    $implicit: string;
  }

  @Component({
    standalone: true,
    imports: [NgTemplateOutlet],
    selector: 'person',
    template: `
      <ng-container
        *ngTemplateOutlet="
          myTemplateRef;
          context: { $implicit: 'test', xxx: 'xxx' }
        "></ng-container>
    `,
  })
  export class PersonComponent {
    myTemplateRef!: TemplateRef<MyContext>;
  }
  ```
  However, it does not compile now because the 'xxx' property does not exist in 'MyContext', resulting in the error: 'Type '{ $implicit: string; xxx: string; }' is not assignable to type 'MyContext'.'

  The solution is either:
  - add the 'xxx' property to 'MyContext' with the correct type or
  - add '$any(...)' inside the template to make the error disappear. However, adding '$any(...)' does not correct the error but only preserves the previous behavior of the code.
- Deprecated `XhrFactory` export from `@angular/common/http` has been removed. Use `XhrFactory` from `@angular/common` instead.
### compiler
- * TypeScript 4.8 is no longer supported.
### core
- QueryList.filter now supports type guard functions, which will result in type narrowing. Previously if you used type guard functions, it resulted in no changes to the return type. Now the type would be narrowed, which might require updates to the application code that relied on the old behavior.
- `zone.js` versions `0.11.x` and `0.12.x` are not longer supported.
- * `entryComponents` has been deleted from the `@NgModule` and `@Component` public APIs. Any usages can be removed since they weren't doing anyting.
  * `ANALYZE_FOR_ENTRY_COMPONENTS` injection token has been deleted. Any references can be removed.
- ComponentRef.setInput will only set the input on the
  component if it is different from the previous value (based on `Object.is`
  equality). If code relies on the input always being set, it should be
  updated to copy objects or wrap primitives in order to ensure the input
  value differs from the previous call to `setInput`.
- `RendererType2.styles` no longer accepts a nested arrays.
- The `APP_ID` token value is no longer randomly generated. If you are bootstrapping multiple application on the same page you will need to set to provide the `APP_ID` yourself.

  ```ts
  bootstrapApplication(ComponentA, {
    providers: [
     { provide: APP_ID, useValue: 'app-a' },
     // ... other providers ...
    ]
  });
  ```
- The `ReflectiveInjector` and related symbols were removed. Please update the code to avoid references to the `ReflectiveInjector` symbol. Use `Injector.create` as a replacement to create an injector instead.
- Node.js v14 support has been removed

  Node.js v14 is planned to be End-of-Life on 2023-04-30. Angular will stop supporting Node.js v14 in Angular v16. Angular v16 will continue to officially support Node.js versions v16 and v18.
### platform-browser
- The deprecated `BrowserTransferStateModule` was removed, since it's no longer needed. The `TransferState` class can be injected without providing the module. The `BrowserTransferStateModule` was empty starting from v14 and you can just remove the reference to that module from your applications.
### platform-server
- Users that are using SSR with JIT mode will now need to add  `import to @angular/compiler` before bootstrapping the application.

  **NOTE:** this does not effect users using the Angular CLI.
- `renderApplication` method no longer accepts a root component as first argument. Instead, provide a bootstrapping function that returns a `Promise<ApplicationRef>`.

  Before
  ```ts
  const output: string = await renderApplication(RootComponent, options);
  ```

  Now
  ```ts
  const bootstrap = () => bootstrapApplication(RootComponent, appConfig);
  const output: string = await renderApplication(bootstrap, options);
  ```
- `renderModuleFactory` has been removed. Use `renderModule` instead.
### router
- The `Scroll` event's `routerEvent` property may also be
  a `NavigationSkipped` event. Previously, it was only a `NavigationEnd`
  event.
- `ComponentFactoryResolver` has been removed from Router APIs.
  Component factories are not required to create an instance of a component
  dynamically. Passing a factory resolver via resolver argument is no longer needed
  and code can instead use `ViewContainerRef.createComponent` without the
  factory resolver.
- The `RouterEvent` type is no longer present in the `Event` union type representing all router event types. If you have code using something like `filter((e: Event): e is RouterEvent => e instanceof RouterEvent)`, you'll need to update it to `filter((e: Event|RouterEvent): e is RouterEvent => e instanceof RouterEvent)`.
- Tests which mock `ActivatedRoute` instances may need to be adjusted
  because Router.createUrlTree now does the right thing in more
  scenarios. This means that tests with invalid/incomplete ActivatedRoute mocks
  may behave differently than before. Additionally, tests may now navigate
  to a real URL where before they would navigate to the root. Ensure that
  tests provide expected routes to match.
  There is rarely production impact, but it has been found that relative
  navigations when using an `ActivatedRoute` that does not appear in the
  current router state were effectively ignored in the past. By creating
  the correct URLs, this sometimes resulted in different navigation
  behavior in the application. Most often, this happens when attempting to
  create a navigation that only updates query params using an empty
  command array, for example `router.navigate([], {relativeTo: route,
  queryParams: newQueryParams})`. In this case, the `relativeTo` property
  should be removed.
## Deprecations
### core
-  `makeStateKey`, `StateKey` and  `TransferState` exports have been moved from `@angular/platform-browser` to `@angular/core`. Please update the imports.

  ```diff
  - import {makeStateKey, StateKey, TransferState} from '@angular/platform-browser';
  + import {makeStateKey, StateKey, TransferState} from '@angular/core';
  ```
- `EnvironmentInjector.runInContext` is now deprecated, with
  `runInInjectionContext` functioning as a direct replacement:

  ```typescript
  // Previous method version (deprecated):
  envInjector.runInContext(fn);
  // New standalone function:
  runInInjectionContext(envInjector, fn);
  ```
- The `@Directive`/`@Component` `moduleId` property is now
  deprecated. It did not have any effect for multiple major versions and
  will be removed in v17.
### platform-browser
- `BrowserModule.withServerTransition` has been deprecated. `APP_ID` should be used instead to set the application ID.
  NB: Unless, you render multiple Angular applications on the same page, setting an application ID is not necessary.

  Before:
  ```ts
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    ...
  ]
  ```

  After:
  ```ts
  imports: [
    BrowserModule,
    { provide: APP_ID, useValue: 'serverApp' },
    ...
  ],
  ```
- `ApplicationConfig` has moved, please import `ApplicationConfig` from `@angular/core` instead.
### platform-server
- `PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` platform-server config options  are deprecated as these were not used.
###
| Commit | Type | Description |
| -- | -- | -- |
| [48aa96ea13](https://github.com/angular/angular/commit/48aa96ea13ebfadf2f6b13516c7702dae740a7be) | refactor | remove Angular Compatibility Compiler (ngcc) ([#49101](https://github.com/angular/angular/pull/49101)) |
| [2703fd6260](https://github.com/angular/angular/commit/2703fd626040c5e65401ebd776404a3b9e284724) | refactor | remove deprecated `EventManager` method `addGlobalEventListener` ([#49645](https://github.com/angular/angular/pull/49645)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [5dce2a5a3a](https://github.com/angular/angular/commit/5dce2a5a3a00693d835a57934b9abacce5a33dfa) | feat | Provide MockPlatformLocation by default in BrowserTestingModule ([#49137](https://github.com/angular/angular/pull/49137)) |
| [d47fef72cb](https://github.com/angular/angular/commit/d47fef72cb497db555e67db50997b3b1cc3ee590) | fix | strict type checking for ngtemplateoutlet ([#48374](https://github.com/angular/angular/pull/48374)) |
| [c41a21658c](https://github.com/angular/angular/commit/c41a21658c9a56044b5d7f62cab4fcad5a5732c7) | refactor | remove deprecated `XhrFactory` export from `http` entrypoint ([#49251](https://github.com/angular/angular/pull/49251)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1a6ca68154](https://github.com/angular/angular/commit/1a6ca68154dd73bac4b8d2e094d97952f60b3e30) | feat | add support for compile-time required inputs ([#49304](https://github.com/angular/angular/pull/49304)) |
| [13dd614cd1](https://github.com/angular/angular/commit/13dd614cd1da65eee947fd6971b7d6e1d6def207) | feat | add support for compile-time required inputs ([#49453](https://github.com/angular/angular/pull/49453)) |
| [8f539c11f4](https://github.com/angular/angular/commit/8f539c11f40be12207ab42bdf1f87a154a5a2d04) | feat | add support for compile-time required inputs ([#49468](https://github.com/angular/angular/pull/49468)) |
| [79cdfeb392](https://github.com/angular/angular/commit/79cdfeb3921687dfbc8fea8d9f7ba4dbb14a7193) | feat | drop support for TypeScript 4.8 ([#49155](https://github.com/angular/angular/pull/49155)) |
| [1407a9aeaf](https://github.com/angular/angular/commit/1407a9aeaf5edf33dfb9b52d7b2baaebef9b80ed) | feat | support multiple configuration files in `extends` ([#49125](https://github.com/angular/angular/pull/49125)) |
| [9de1e9da8f](https://github.com/angular/angular/commit/9de1e9da8fc7d102f74389d9a270c4608bf0dd64) | fix | incorrectly matching directives on attribute bindings ([#49713](https://github.com/angular/angular/pull/49713)) |
| [6623810e4d](https://github.com/angular/angular/commit/6623810e4d3347edaccbbb214fa883ab6a669936) | fix | Produce diagnositc if directive used in host binding is not exported ([#49527](https://github.com/angular/angular/pull/49527)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [03d1d00ad9](https://github.com/angular/angular/commit/03d1d00ad9f88a2c449cceab64c1328787576162) | feat | Add an extended diagnostic for `nSkipHydration` ([#49512](https://github.com/angular/angular/pull/49512)) |
| [ed817e32fe](https://github.com/angular/angular/commit/ed817e32fe0239c0f08ce342c7ad224055d56f84) | fix | Catch FatalDiagnosticError during template type checking ([#49527](https://github.com/angular/angular/pull/49527)) |
| [49fe974501](https://github.com/angular/angular/commit/49fe974501b6f446eaedf2490f2d456a5967318f) | perf | optimize NgModule emit for standalone components ([#49837](https://github.com/angular/angular/pull/49837)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [89d291c367](https://github.com/angular/angular/commit/89d291c367e6b1b4618999c4044dcafcc1953109) | feat | add `assertInInjectionContext` ([#49529](https://github.com/angular/angular/pull/49529)) |
| [4e9531f777](https://github.com/angular/angular/commit/4e9531f7773e7bf0d3034a36c62f34f914e4a451) | feat | add `mergeApplicationConfig` method ([#49253](https://github.com/angular/angular/pull/49253)) |
| [d7d6514add](https://github.com/angular/angular/commit/d7d6514add2912a18c50f190aaa8afafa313bc9e) | feat | Add ability to configure `NgZone` in `bootstrapApplication` ([#49557](https://github.com/angular/angular/pull/49557)) |
| [bc5ddabdcb](https://github.com/angular/angular/commit/bc5ddabdcb39e6ebbe2da03dc8ec49bbe26c677d) | feat | add Angular Signals to the public API ([#49150](https://github.com/angular/angular/pull/49150)) |
| [17e9862653](https://github.com/angular/angular/commit/17e9862653758ebdbd29771cd4ec8a59436497d6) | feat | add API to provide CSP nonce for inline stylesheets ([#49444](https://github.com/angular/angular/pull/49444)) |
| [605c536420](https://github.com/angular/angular/commit/605c5364208d9ab60041121e2ebbcfb2a1a52c1a) | feat | add migration to remove `moduleId` references ([#49496](https://github.com/angular/angular/pull/49496)) |
| [99d874fe3b](https://github.com/angular/angular/commit/99d874fe3b486f3669b0e8f1910e31c4fa278308) | feat | add support for TypeScript 5.0 ([#49126](https://github.com/angular/angular/pull/49126)) |
| [d1617c449d](https://github.com/angular/angular/commit/d1617c449d23c6573803cce36391134e8d0103a3) | feat | allow removal of previously registered DestroyRef callbacks ([#49493](https://github.com/angular/angular/pull/49493)) |
| [b2327f4df1](https://github.com/angular/angular/commit/b2327f4df12ca91d7cdbc3dc5c0f5cb3ab88a30e) | feat | Allow typeguards on QueryList.filter ([#48042](https://github.com/angular/angular/pull/48042)) |
| [061f3d1086](https://github.com/angular/angular/commit/061f3d1086421b921403f7d358c02f84927b699b) | feat | Drop public `factories` property for `IterableDiffers` : Breaking change ([#49598](https://github.com/angular/angular/pull/49598)) |
| [fdf61974d1](https://github.com/angular/angular/commit/fdf61974d1155b771d7d53c7bbc3bd2b0f6681cb) | feat | drop support for `zone.js` versions `<=0.12.0` ([#49331](https://github.com/angular/angular/pull/49331)) |
| [9c5fd50de4](https://github.com/angular/angular/commit/9c5fd50de4489d98b40668f7d9885c18d9a43c73) | feat | effects can optionally return a cleanup function ([#49625](https://github.com/angular/angular/pull/49625)) |
| [c024574f46](https://github.com/angular/angular/commit/c024574f46f18c42c1e5b02afa6c1e3e4219d25b) | feat | expose `makeStateKey`, `StateKey` and  `TransferState` ([#49563](https://github.com/angular/angular/pull/49563)) |
| [a5f1737d1c](https://github.com/angular/angular/commit/a5f1737d1c2435b1476c1277bdc9a6827377465f) | feat | expose onDestroy on ApplicationRef ([#49677](https://github.com/angular/angular/pull/49677)) |
| [e883198460](https://github.com/angular/angular/commit/e8831984601da631afc29f9fd72d36f57696f936) | feat | implement `takeUntilDestroyed` in rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
| [0814f20594](https://github.com/angular/angular/commit/0814f2059406dff9cefdd8b210756b6fdcba15b1) | feat | introduce `runInInjectionContext` and deprecate prior version ([#49396](https://github.com/angular/angular/pull/49396)) |
| [0f5c8003cc](https://github.com/angular/angular/commit/0f5c8003ccd1a75516d6a0e31cdb752d031ec430) | feat | introduce concept of DestroyRef ([#49158](https://github.com/angular/angular/pull/49158)) |
| [9b65b84cb9](https://github.com/angular/angular/commit/9b65b84cb9a0392d8aef5b52b34d35c7c5b9f566) | feat | Mark components for check if they read a signal ([#49153](https://github.com/angular/angular/pull/49153)) |
| [8997bdc03b](https://github.com/angular/angular/commit/8997bdc03bd3ef0dc1ac68c913bf7d09340cee0d) | feat | prototype implementation of @angular/core/rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
| [585e34bf6c](https://github.com/angular/angular/commit/585e34bf6c86f7b056b0aafaaca056baedaedae3) | feat | remove entryComponents ([#49484](https://github.com/angular/angular/pull/49484)) |
| [aad05ebeb4](https://github.com/angular/angular/commit/aad05ebeb44afad29fd989019638590344ba61eb) | feat | support usage of non-experimental decorators with TypeScript 5.0 ([#49492](https://github.com/angular/angular/pull/49492)) |
| [6d7be42da7](https://github.com/angular/angular/commit/6d7be42da7b77632290b935e1db7f20983bdd07b) | fix | add newline to hydration mismatch error ([#49965](https://github.com/angular/angular/pull/49965)) |
| [f8e25864e8](https://github.com/angular/angular/commit/f8e25864e8e35214a321b1c48a926d370f725e13) | fix | allow async functions in effects ([#49783](https://github.com/angular/angular/pull/49783)) |
| [84216dabfc](https://github.com/angular/angular/commit/84216dabfcfc6e082f6042a0658fb0cb7a323525) | fix | catch errors from source signals outside of .next ([#49769](https://github.com/angular/angular/pull/49769)) |
| [be23b7ce65](https://github.com/angular/angular/commit/be23b7ce650634c95f6709a879c89bbad45c4701) | fix | ComponentRef.setInput only sets input when not equal to previous ([#49607](https://github.com/angular/angular/pull/49607)) |
| [316c91b1a4](https://github.com/angular/angular/commit/316c91b1a47f1fb574045553288acca5fcb6e354) | fix | deprecate `moduleId` `@Component` property ([#49496](https://github.com/angular/angular/pull/49496)) |
| [fd9dcd36cd](https://github.com/angular/angular/commit/fd9dcd36cdf9ad92f404567f6c8c0914544b6e0d) | fix | Ensure effects can be created when Zone is not defined ([#49890](https://github.com/angular/angular/pull/49890)) |
| [9180f98f0e](https://github.com/angular/angular/commit/9180f98f0ec1707455786430d8ad022f3a1386fa) | fix | ensure takeUntilDestroyed unregisters onDestroy listener on unsubscribe ([#49901](https://github.com/angular/angular/pull/49901)) |
| [4721c48a24](https://github.com/angular/angular/commit/4721c48a24bf4e72fd4742097ec8505a08f87579) | fix | error if document body is null ([#49818](https://github.com/angular/angular/pull/49818)) |
| [2650f1afc1](https://github.com/angular/angular/commit/2650f1afc1cf53423b433c2ee1782aae9d6117e4) | fix | execute input setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [f8b95b9da6](https://github.com/angular/angular/commit/f8b95b9da62d0c8719a38d230f389db5268c0b01) | fix | execute query setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [ef91a2e0fe](https://github.com/angular/angular/commit/ef91a2e0fe66378635d0787bd6d953eb8d31d881) | fix | execute template creation in non-reactive context ([#49883](https://github.com/angular/angular/pull/49883)) |
| [87549af73c](https://github.com/angular/angular/commit/87549af73c675d33b2c87d083e05a82b18332bf0) | fix | Fix capitalization of toObservableOptions ([#49832](https://github.com/angular/angular/pull/49832)) |
| [0e5f9ba6f4](https://github.com/angular/angular/commit/0e5f9ba6f427a79a0b741c1780cd2ff72cc3100a) | fix | generate consistent component IDs ([#48253](https://github.com/angular/angular/pull/48253)) |
| [fedc75624c](https://github.com/angular/angular/commit/fedc75624c5dcfaaa2b5ef901e7e700309770a26) | fix | include inner ViewContainerRef anchor nodes into ViewRef.rootNodes output ([#49867](https://github.com/angular/angular/pull/49867)) |
| [df1dfc4c17](https://github.com/angular/angular/commit/df1dfc4c17abc6799f2e8f3f5f8604a7bf3d173a) | fix | make sure that lifecycle hooks are not tracked ([#49701](https://github.com/angular/angular/pull/49701)) |
| [c34d7e0822](https://github.com/angular/angular/commit/c34d7e0822c21f7b6e7dfd46d3e12cd6ebb7390e) | fix | onDestroy should be registered only on valid DestroyRef ([#49804](https://github.com/angular/angular/pull/49804)) |
| [2f2ef14f9e](https://github.com/angular/angular/commit/2f2ef14f9e6b64445f76cb9e3f5958abe2439157) | fix | resolve `InitialRenderPendingTasks` promise on complete ([#49784](https://github.com/angular/angular/pull/49784)) |
| [c7d8d3ee37](https://github.com/angular/angular/commit/c7d8d3ee3757c2540baf739001b0fc13c096a4a4) | fix | toObservable should allow writes to signals in the effect ([#49769](https://github.com/angular/angular/pull/49769)) |
| [b4531f1d82](https://github.com/angular/angular/commit/b4531f1d82dc37d00487ff862f058e2574cec318) | fix | typing of TestBed Common token. ([#49997](https://github.com/angular/angular/pull/49997)) |
| [a4e749ffca](https://github.com/angular/angular/commit/a4e749ffca5b1f726c365cecaf0f5c4f13eec8d9) | fix | When using setInput, mark view dirty in same was as `markForCheck` ([#49711](https://github.com/angular/angular/pull/49711)) |
| [9b9c818f99](https://github.com/angular/angular/commit/9b9c818f99c44473e915bedd157146c88e44989a) | perf | change `RendererType2.styles` to accept a only a flat array ([#49072](https://github.com/angular/angular/pull/49072)) |
| [82d6fbb109](https://github.com/angular/angular/commit/82d6fbb109491607bd2e4feaa35c3dace79e4576) | refactor | generate a static application ID ([#49422](https://github.com/angular/angular/pull/49422)) |
| [3b863ddc1e](https://github.com/angular/angular/commit/3b863ddc1e67a2fa7627ad78e172c839781e81b6) | refactor | Remove `ReflectiveInjector` symbol ([#48103](https://github.com/angular/angular/pull/48103)) |
| [f594725951](https://github.com/angular/angular/commit/f594725951fafde475ee99ffccf1175c13c48288) | refactor | remove Node.js v14 support ([#49255](https://github.com/angular/angular/pull/49255)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [07a1aa3004](https://github.com/angular/angular/commit/07a1aa300404969155ed1eb3cd02f4a766e07963) | feat | Improve typings form (async)Validators ([#48679](https://github.com/angular/angular/pull/48679)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [aff1512950](https://github.com/angular/angular/commit/aff15129501511569bbb4ff6dfcb16ad1c01890d) | feat | allow `HttpClient` to cache requests ([#49509](https://github.com/angular/angular/pull/49509)) |
| [15c91a53ae](https://github.com/angular/angular/commit/15c91a53ae2cc1f34e05b158be69e10e9f43043b) | fix | delay accessing `pendingTasks.whenAllTasksComplete` ([#49784](https://github.com/angular/angular/pull/49784)) |
| [9f0c6d1ed1](https://github.com/angular/angular/commit/9f0c6d1ed1d30eb5596fc68d8bd30ab132998ae6) | fix | ensure new cache state is returned on each request ([#49749](https://github.com/angular/angular/pull/49749)) |
| [45a6ac09fd](https://github.com/angular/angular/commit/45a6ac09fdd2228fa4bbf5188ba8e67298754e7e) | fix | force macro task creation during HTTP request ([#49546](https://github.com/angular/angular/pull/49546)) |
| [2a580b6f0b](https://github.com/angular/angular/commit/2a580b6f0b05d917dc220c4b7b69a8b3f59e6e98) | fix | HTTP cache was being disabled prematurely ([#49826](https://github.com/angular/angular/pull/49826)) |
| [2eb9b8b402](https://github.com/angular/angular/commit/2eb9b8b402807aec817d0a58137f7d359c46d055) | fix | wait for all XHR requests to finish before stabilizing application ([#49776](https://github.com/angular/angular/pull/49776)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5e5dac278d](https://github.com/angular/angular/commit/5e5dac278d57d29277f0847f025e7dfa850bec45) | feat | Migration to remove `Router` guard and resolver interfaces ([#49337](https://github.com/angular/angular/pull/49337)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [761e02d912](https://github.com/angular/angular/commit/761e02d912e4f910f9e5e915c019dc1fef0d0839) | feat | add a public API function to enable non-destructive hydration ([#49666](https://github.com/angular/angular/pull/49666)) |
| [630af63fae](https://github.com/angular/angular/commit/630af63fae2e279e88805aecf01db58be6dfbafb) | feat | deprecate `withServerTransition` call ([#49422](https://github.com/angular/angular/pull/49422)) |
| [81e7d15ef6](https://github.com/angular/angular/commit/81e7d15ef65b70c9734ebfd2c865e70d743263dc) | feat | enable HTTP request caching when using `provideClientHydration` ([#49699](https://github.com/angular/angular/pull/49699)) |
| [74c925c19c](https://github.com/angular/angular/commit/74c925c19c5a8f4823fa929700f6599970cd61d3) | fix | export deprecated `TransferState` as type ([#50015](https://github.com/angular/angular/pull/50015)) |
| [2312eb53ef](https://github.com/angular/angular/commit/2312eb53ef5862e0866c29d11dec2a9b7b6a064c) | fix | KeyEventsPlugin should keep the same behavior ([#49330](https://github.com/angular/angular/pull/49330)) |
| [c934a8e72b](https://github.com/angular/angular/commit/c934a8e72bec9f96ccf1a1de1a3384d40dfd2731) | fix | only add `ng-app-id` to style on server side ([#49465](https://github.com/angular/angular/pull/49465)) |
| [9165ff2517](https://github.com/angular/angular/commit/9165ff2517448b43bb910001816108702088e93e) | fix | reuse server generated component styles ([#48253](https://github.com/angular/angular/pull/48253)) |
| [e8e36811d5](https://github.com/angular/angular/commit/e8e36811d5700d23a6d853c78e6314b19d937e5e) | fix | set nonce attribute in a platform compatible way ([#49624](https://github.com/angular/angular/pull/49624)) |
| [3aa85a8087](https://github.com/angular/angular/commit/3aa85a8087643ce79da6d1aeae7b925bb76315a5) | refactor | move `ApplicationConfig` to core ([#49253](https://github.com/angular/angular/pull/49253)) |
| [9bd9a11f4e](https://github.com/angular/angular/commit/9bd9a11f4e21e5a7cc9da18f150f6dd520e7cd1e) | refactor | remove deprecated `BrowserTransferStateModule` symbol ([#49718](https://github.com/angular/angular/pull/49718)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [b5278cc115](https://github.com/angular/angular/commit/b5278cc115ee6383a20783967b9e7da3f6184dcd) | feat | `renderApplication` now accepts a bootstrapping method ([#49248](https://github.com/angular/angular/pull/49248)) |
| [056d68002f](https://github.com/angular/angular/commit/056d68002fbe6024b486bb7220bc77f8f9a07707) | feat | add `provideServerSupport` function to provide server capabilities to an application ([#49380](https://github.com/angular/angular/pull/49380)) |
| [7870fb07fe](https://github.com/angular/angular/commit/7870fb07fe6b25f5ebb22497bff3a03b7b5fc646) | feat | rename `provideServerSupport` to `provideServerRendering` ([#49678](https://github.com/angular/angular/pull/49678)) |
| [a08a8ff108](https://github.com/angular/angular/commit/a08a8ff108bba88ba4bd7f30a6a8c1bcadb13db7) | fix | bundle @angular/domino in via esbuild ([#49229](https://github.com/angular/angular/pull/49229)) |
| [5ea624f313](https://github.com/angular/angular/commit/5ea624f3135c71316c36eb94445d818f9157d988) | fix | remove dependency on `@angular/platform-browser-dynamic` ([#50064](https://github.com/angular/angular/pull/50064)) |
| [e99460865e](https://github.com/angular/angular/commit/e99460865e6a038be08a3436422ad129901aec8c) | refactor | deprecate `useAbsoluteUrl` and `baseUrl` ([#49546](https://github.com/angular/angular/pull/49546)) |
| [41f27ad086](https://github.com/angular/angular/commit/41f27ad08643839d09daf4588069a3f8fe627070) | refactor | remove `renderApplication` overload that accepts a component ([#49463](https://github.com/angular/angular/pull/49463)) |
| [17abe6dc96](https://github.com/angular/angular/commit/17abe6dc96a443de0c2f9575bb160042a031fed1) | refactor | remove deprecated `renderModuleFactory` ([#49247](https://github.com/angular/angular/pull/49247)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [ea32c3289a](https://github.com/angular/angular/commit/ea32c3289ad773a821b3432fb8d4c36d0d9fbd9d) | feat | Expose information about the last successful `Navigation` ([#49235](https://github.com/angular/angular/pull/49235)) |
| [455c728525](https://github.com/angular/angular/commit/455c7285257a8def53ae6c9d14e9848d72ae2613) | feat | helper functions to convert class guards to functional ([#48709](https://github.com/angular/angular/pull/48709)) |
| [f982a3f965](https://github.com/angular/angular/commit/f982a3f965995c4883780b0d48cb5d1411ebad0f) | feat | Opt-in for binding `Router` information to component inputs ([#49633](https://github.com/angular/angular/pull/49633)) |
| [1f055b90b6](https://github.com/angular/angular/commit/1f055b90b65cce2d0d063ed44cb0f8fbecb9b1f6) | fix | Ensure anchor scrolling happens on ignored same URL navigations ([#48025](https://github.com/angular/angular/pull/48025)) |
| [6193a3d406](https://github.com/angular/angular/commit/6193a3d40619c34127ec011a895e8fde3c5d8c48) | fix | fix = not parsed in router segment name ([#47332](https://github.com/angular/angular/pull/47332)) |
| [c0b1b7becf](https://github.com/angular/angular/commit/c0b1b7becf65d5f21018a1794aafe9bbfbd5ce05) | fix | Remove deprecated ComponentFactoryResolver from APIs ([#49239](https://github.com/angular/angular/pull/49239)) |
| [1e32709e0e](https://github.com/angular/angular/commit/1e32709e0e16f553ed3e7778705c9a0c5641d0af) | fix | remove RouterEvent from Event union type ([#46061](https://github.com/angular/angular/pull/46061)) |
| [3c7e637374](https://github.com/angular/angular/commit/3c7e63737407287986c65136efd1f53d1215a53e) | fix | Route matching should only happen once when navigating ([#49163](https://github.com/angular/angular/pull/49163)) |
| [1600687fe5](https://github.com/angular/angular/commit/1600687fe518e67adcc629c78857720a5118d489) | fix | Route matching should only happen once when navigating ([#49163](https://github.com/angular/angular/pull/49163)) |
| [31f210bf2c](https://github.com/angular/angular/commit/31f210bf2cd8a5cc8245c05a30ae3b8f8b9d826a) | fix | Router.createUrlTree should work with any ActivatedRoute ([#48508](https://github.com/angular/angular/pull/48508)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [5e7fc259ea](https://github.com/angular/angular/commit/5e7fc259ead62ee9b4f8a9a77a455065b6a8e2d8) | feat | add function to provide service worker ([#48247](https://github.com/angular/angular/pull/48247)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.9"></a>
# 15.2.9 (2023-05-03)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [9107e931ca](https://github.com/angular/angular/commit/9107e931cad6c7543f717796a75648cefee2fd12) | fix | fix incorrectly reported distortion for padded images ([#49889](https://github.com/angular/angular/pull/49889)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7c58885797](https://github.com/angular/angular/commit/7c58885797af407d8399206340e79fe3d2beffb8) | fix | catch fatal diagnostic when getting diagnostics for components ([#50046](https://github.com/angular/angular/pull/50046)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.8"></a>
# 15.2.8 (2023-04-19)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2fff8fadbe](https://github.com/angular/angular/commit/2fff8fadbeff9df3bc09b8847dbf08febbe3b5f8) | fix | handle invalid classes in class array bindings ([#49924](https://github.com/angular/angular/pull/49924)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [05a0225deb](https://github.com/angular/angular/commit/05a0225deb126849f3798e828f6dbef7c221ec57) | fix | prevent headers from throwing an error when initializing numerical values ([#49379](https://github.com/angular/angular/pull/49379)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [09a42d988e](https://github.com/angular/angular/commit/09a42d988e654825648205c8df90f7ca4d034c74) | fix | canceledNavigationResolution: 'computed' with redirects to the current URL ([#49793](https://github.com/angular/angular/pull/49793)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.7"></a>
# 15.2.7 (2023-04-12)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [b0c1a90f55](https://github.com/angular/angular/commit/b0c1a90f55ecfafb4fd5c22cdd1b4a5f12573f22) | fix | Produce diagnositc if directive used in host binding is not exported ([#49792](https://github.com/angular/angular/pull/49792)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [a40529af2e](https://github.com/angular/angular/commit/a40529af2e2923f1dbdae8898a0e94e9e63a3fcf) | fix | Catch FatalDiagnosticError during template type checking ([#49792](https://github.com/angular/angular/pull/49792)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [702ec90110](https://github.com/angular/angular/commit/702ec901100b2d84efdf0b16d8347f8b28b94d5d) | fix | When using setInput, mark view dirty in same way as `markForCheck` ([#49747](https://github.com/angular/angular/pull/49747)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Kristiyan Kostadinov, Matthieu Riegler and Nikola Kološnjaji

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.4.0"></a>
# 13.4.0 (2023-04-06)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ae34dbca1b](https://github.com/angular/angular/commit/ae34dbca1be10b0245a751bb0596599e95d7b4aa) | feat | Backport NgOptimizedImage to v13 |
## Special Thanks
Alex Castle and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.6"></a>
# 15.2.6 (2023-04-05)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d9efa1b0d7](https://github.com/angular/angular/commit/d9efa1b0d742217de1164f7904c202b2697348d9) | feat | change the URL sanitization to only block javascript: URLs ([#49659](https://github.com/angular/angular/pull/49659)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [cad7274ef9](https://github.com/angular/angular/commit/cad7274ef90914f0c24d071473a6cbae0e5b8250) | fix | create correct URL relative to path with empty child ([#49691](https://github.com/angular/angular/pull/49691)) |
| [9b61379096](https://github.com/angular/angular/commit/9b6137909690d6cbfdd8cbef502e9e2ac0d28c4a) | fix | Ensure initial navigation clears current navigation when blocking ([#49572](https://github.com/angular/angular/pull/49572)) |
## Special Thanks
Andrew Scott, Guillaume Weghsteen, John Manners, Johnny Gérard, Matthieu Riegler, Robin Richtsfeld, Sandra Limacher, Sarthak Thakkar, Vinit Neogi and vikram menon

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.5"></a>
# 15.2.5 (2023-03-29)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ca5acadb78](https://github.com/angular/angular/commit/ca5acadb78c33bf896001a5810cb4be15ff7bc86) | fix | invalid ImageKit transformation ([#49201](https://github.com/angular/angular/pull/49201)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [077f6b4674](https://github.com/angular/angular/commit/077f6b4674c01bfed083e73a17d848e226e543b4) | fix | do not unquote CSS values ([#49460](https://github.com/angular/angular/pull/49460)) |
| [c3cff35869](https://github.com/angular/angular/commit/c3cff35869648fdf70c9707c3d87bcfdcc84d903) | fix | handle trailing comma in object literal ([#49535](https://github.com/angular/angular/pull/49535)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d201fc2dec](https://github.com/angular/angular/commit/d201fc2dec1a3a9cc6952ebb46cb672200a78236) | fix | set style property value to empty string instead of an invalid value ([#49460](https://github.com/angular/angular/pull/49460)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [978d37f324](https://github.com/angular/angular/commit/978d37f324ce4a1fe9b57f3d9430d7c28ecf6131) | fix | Ensure Router preloading works with lazy component and static children ([#49571](https://github.com/angular/angular/pull/49571)) |
| [a844435514](https://github.com/angular/angular/commit/a844435514962c52f4fb480bcfab7ee6519a59cc) | fix | fix [#49457](https://github.com/angular/angular/pull/49457) outlet activating with old info ([#49459](https://github.com/angular/angular/pull/49459)) |
## Special Thanks
Alan Agius, Andrew Scott, Asaf Malin, Jan Cabadaj, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sid and Tano Abeleyra

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.4"></a>
# 15.2.4 (2023-03-22)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [bae6b5ceb1](https://github.com/angular/angular/commit/bae6b5ceb16bd87c8146aa29564a8d29135a6f95) | fix | Allow `TestBed.configureTestingModule` to work with recursive cycle of standalone components. ([#49473](https://github.com/angular/angular/pull/49473)) |
| [087f4412af](https://github.com/angular/angular/commit/087f4412afe9ccdefe7d63012af749b79f3e84d0) | fix | more accurate matching of classes during content projection ([#48888](https://github.com/angular/angular/pull/48888)) |
## Special Thanks
Aditya Srinivasan, Alex Rickabaugh, Andrew Scott, Kristiyan Kostadinov, Masaoki Kobayashi, Matthieu Riegler, Paul Gschwendtner, Peter Götz, Thomas Pischke, Virginia Dooley and avmaxim

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.3"></a>
# 15.2.3 (2023-03-16)
## Special Thanks
Alan Agius, Esteban Gehring, Matthieu Riegler and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.3.0"></a>
# 14.3.0 (2023-03-13)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [37bbc61cfe](https://github.com/angular/angular/commit/37bbc61cfeca1531a80393636c096ce452a67d27) | feat | Backport NgOptimizedImage to Angular 14. |
## Special Thanks
Alex Castle, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.2"></a>
# 15.2.2 (2023-03-08)
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [6207d6f1f0](https://github.com/angular/angular/commit/6207d6f1f0771ff3b74379367e65af665ef0e51c) | fix | add protractor support if protractor imports are detected ([#49274](https://github.com/angular/angular/pull/49274)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sai Kartheek Bommisetty and Vinit Neogi

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.1"></a>
# 15.2.1 (2023-03-01)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [f0e926074d](https://github.com/angular/angular/commit/f0e926074df189b3e3ca361a6a3bcd852c05e010) | fix | make Location.normalize() return the correct path when the base path contains characters that interfere with regex syntax. ([#49181](https://github.com/angular/angular/pull/49181)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [04d8b6c61a](https://github.com/angular/angular/commit/04d8b6c61a0d0a2d61b9202d09774f3ab347e82f) | fix | do not persist component analysis if template/styles are missing ([#49184](https://github.com/angular/angular/pull/49184)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d60ea6ab5a](https://github.com/angular/angular/commit/d60ea6ab5a22cb4f3677e34d0d7f6be0c3fe23fe) | fix | update zone.js peerDependencies ranges ([#49244](https://github.com/angular/angular/pull/49244)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [44d095a61c](https://github.com/angular/angular/commit/44d095a61cb340ea1f5e0a19370ea839378b02c3) | fix | avoid migrating the same class multiple times in standalone migration ([#49245](https://github.com/angular/angular/pull/49245)) |
| [92b0bda9e4](https://github.com/angular/angular/commit/92b0bda9e4e7117552f929bf86acfc0ae65779a1) | fix | delete barrel exports in standalone migration ([#49176](https://github.com/angular/angular/pull/49176)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [3062442728](https://github.com/angular/angular/commit/30624427289ad65bdbabd865d028146753c3a97a) | fix | add error message when using loadComponent with a NgModule ([#49164](https://github.com/angular/angular/pull/49164)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Aristeidis Bampakos, Craig Spence, Doug Parker, Iván Navarro, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Michael Ziluck, Paul Gschwendtner, Stephanie Tuerk, Vincent and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.0"></a>
# 15.2.0 (2023-02-22)
## Deprecations
###
- Class and `InjectionToken` guards and resolvers are
  deprecated. Instead, write guards as plain JavaScript functions and
  inject dependencies with `inject` from `@angular/core`.
###
| Commit | Type | Description |
| -- | -- | -- |
| [926c35f4ac](https://github.com/angular/angular/commit/926c35f4ac70f5e4d142e545d6d056dd67aac97b) | docs | Deprecate class and InjectionToken and resolvers ([#47924](https://github.com/angular/angular/pull/47924)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [54b24eb40f](https://github.com/angular/angular/commit/54b24eb40fed13c926305ad475202a5608d41c6b) | feat | Add loaderParams attribute to NgOptimizedImage ([#48907](https://github.com/angular/angular/pull/48907)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [0cf11167f1](https://github.com/angular/angular/commit/0cf11167f13108992ec781e88ab2a7d1fc7f5a0d) | fix | incorrectly detecting forward refs when symbol already exists in file ([#48988](https://github.com/angular/angular/pull/48988)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a154db8a81](https://github.com/angular/angular/commit/a154db8a81cbdfed8c3d0db1e2a5bf43aa3e0bbf) | feat | add ng generate schematic to convert declarations to standalone ([#48790](https://github.com/angular/angular/pull/48790)) |
| [345e737daa](https://github.com/angular/angular/commit/345e737daa7b9f635a4c2923358e5e765f716434) | feat | add ng generate schematic to convert to standalone bootstrapping APIs ([#48848](https://github.com/angular/angular/pull/48848)) |
| [e7318fc758](https://github.com/angular/angular/commit/e7318fc758d9e64d1a7f60a2c7071a769b73e7d8) | feat | add ng generate schematic to remove unnecessary modules ([#48832](https://github.com/angular/angular/pull/48832)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [4ae384fd61](https://github.com/angular/angular/commit/4ae384fd619a13eaadf737d08a97f07e1f6b273c) | feat | Allow auto-imports of a pipe via quick fix when its selector is used, both directly and via reexports. ([#48354](https://github.com/angular/angular/pull/48354)) |
| [141333411e](https://github.com/angular/angular/commit/141333411e67769d752c7162e4cb03376022f5e1) | feat | Introduce a new NgModuleIndex, and use it to suggest re-exports. ([#48354](https://github.com/angular/angular/pull/48354)) |
| [d0145033bd](https://github.com/angular/angular/commit/d0145033bd11eccd16fa8b61ba9170037d0c62b3) | fix | generate forwardRef for same file imports ([#48898](https://github.com/angular/angular/pull/48898)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [2796230e95](https://github.com/angular/angular/commit/2796230e953eb8c29d6227a1a3858f5f08a8f200) | fix | add `enum` in `mode` option in `standalone` schema ([#48851](https://github.com/angular/angular/pull/48851)) |
| [816e76a578](https://github.com/angular/angular/commit/816e76a5789b041fee78ddd278c0e0d19b9a617a) | fix | automatically prune root module after bootstrap step ([#49030](https://github.com/angular/angular/pull/49030)) |
| [bdbf21d04b](https://github.com/angular/angular/commit/bdbf21d04ba74a6f73469242076d6ce697c57edf) | fix | avoid generating imports with forward slashes ([#48993](https://github.com/angular/angular/pull/48993)) |
| [32cf4e5cb9](https://github.com/angular/angular/commit/32cf4e5cb989f365296d519dddf72fb38ca47c40) | fix | avoid internal modules when generating imports ([#48958](https://github.com/angular/angular/pull/48958)) |
| [521ccfbe6c](https://github.com/angular/angular/commit/521ccfbe6ce9af1a7ddd6ab5e70151b7198f82ef) | fix | avoid interrupting the migration if language service lookup fails ([#49010](https://github.com/angular/angular/pull/49010)) |
| [a40cd47aa7](https://github.com/angular/angular/commit/a40cd47aa7ebccfbeeb26e397e03f1372aa10a55) | fix | avoid modifying testing modules without declarations ([#48921](https://github.com/angular/angular/pull/48921)) |
| [1afa6ed322](https://github.com/angular/angular/commit/1afa6ed3227e784e3fe2b4b31443961589cb6332) | fix | don't add ModuleWithProviders to standalone test components ([#48987](https://github.com/angular/angular/pull/48987)) |
| [c98c6a8452](https://github.com/angular/angular/commit/c98c6a845286b9b89daf275a9c4a2bdbc7ad77a7) | fix | don't copy animations modules into the imports of test components ([#49147](https://github.com/angular/angular/pull/49147)) |
| [8389557848](https://github.com/angular/angular/commit/83895578488bd35c7e47609f092907eb0f53f435) | fix | don't copy unmigrated declarations into imports array ([#48882](https://github.com/angular/angular/pull/48882)) |
| [f82bdc4b01](https://github.com/angular/angular/commit/f82bdc4b01f93a7103870449d37da61cc4c4f179) | fix | don't delete classes that may provide dependencies transitively ([#48866](https://github.com/angular/angular/pull/48866)) |
| [759db12e0b](https://github.com/angular/angular/commit/759db12e0b618fcb51f4cb141adeb49bfa495a60) | fix | duplicated comments on migrated classes ([#48966](https://github.com/angular/angular/pull/48966)) |
| [ba38178d19](https://github.com/angular/angular/commit/ba38178d1918d413f9c2260c40eb6542eadfddba) | fix | generate forwardRef for same file imports ([#48898](https://github.com/angular/angular/pull/48898)) |
| [03fcb36cfd](https://github.com/angular/angular/commit/03fcb36cfd36731028bf288f156e16cb8ac4c758) | fix | migrate HttpClientModule to provideHttpClient() ([#48949](https://github.com/angular/angular/pull/48949)) |
| [2de6dae16d](https://github.com/angular/angular/commit/2de6dae16d4b0b83f0517a3033cda44ba44154ed) | fix | migrate RouterModule.forRoot with a config object to use features ([#48935](https://github.com/angular/angular/pull/48935)) |
| [770191cf1f](https://github.com/angular/angular/commit/770191cf1f1254546625dfa7a882b716c3f0aab3) | fix | migrate tests when switching to standalone bootstrap API ([#48987](https://github.com/angular/angular/pull/48987)) |
| [c7926b5773](https://github.com/angular/angular/commit/c7926b57730c23f765a00d3dd9f92079c95e87e0) | fix | move standalone migrations into imports ([#48987](https://github.com/angular/angular/pull/48987)) |
| [65c74ed93e](https://github.com/angular/angular/commit/65c74ed93e04cb560c27838d440c6aa7a9859a4e) | fix | normalize paths to posix ([#48850](https://github.com/angular/angular/pull/48850)) |
| [6377487b1a](https://github.com/angular/angular/commit/6377487b1ab7679cef9a44f88440fe5e8eb97480) | fix | only exclude bootstrapped declarations from initial standalone migration ([#48987](https://github.com/angular/angular/pull/48987)) |
| [e9e4449a43](https://github.com/angular/angular/commit/e9e4449a43430e026e61b0f05ebd32dd830fa916) | fix | preserve tsconfig in standalone migration ([#48987](https://github.com/angular/angular/pull/48987)) |
| [ffad1b49d9](https://github.com/angular/angular/commit/ffad1b49d95ab90637e7184f92cb5136d490d865) | fix | reduce number of files that need to be checked ([#48987](https://github.com/angular/angular/pull/48987)) |
| [ba7a757cc5](https://github.com/angular/angular/commit/ba7a757cc5a2f3f942adcbabdcd5b7aef33ea493) | fix | return correct alias when conflicting import exists ([#49139](https://github.com/angular/angular/pull/49139)) |
| [49a7c9f94a](https://github.com/angular/angular/commit/49a7c9f94ae8f89907da8b3620242e62f87ec5a4) | fix | standalone migration incorrectly throwing path error for multi app projects ([#48958](https://github.com/angular/angular/pull/48958)) |
| [584976e6c8](https://github.com/angular/angular/commit/584976e6c8a783d40578ab191132673300394a52) | fix | support --defaults in standalone migration ([#48921](https://github.com/angular/angular/pull/48921)) |
| [03f47ac901](https://github.com/angular/angular/commit/03f47ac9019eddbcb373b50c41bc6f523293ece1) | fix | use consistent quotes in generated imports ([#48876](https://github.com/angular/angular/pull/48876)) |
| [ebae506d89](https://github.com/angular/angular/commit/ebae506d894a90c38e0f2dd1e948acabdb0fdf2e) | fix | use import remapper in root component ([#49046](https://github.com/angular/angular/pull/49046)) |
| [40c976c909](https://github.com/angular/angular/commit/40c976c90975878852a87b7722076eb78944098b) | fix | use NgForOf instead of NgFor ([#49022](https://github.com/angular/angular/pull/49022)) |
| [4ac25b2aff](https://github.com/angular/angular/commit/4ac25b2affab4f959ad8c111f1e429a05b435422) | perf | avoid re-traversing nodes when resolving bootstrap call dependencies ([#49010](https://github.com/angular/angular/pull/49010)) |
| [26cb7ab2e6](https://github.com/angular/angular/commit/26cb7ab2e6ac9b61904361a8a544467b69eef3f3) | perf | speed up language service lookups ([#49010](https://github.com/angular/angular/pull/49010)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [bf4ad38117](https://github.com/angular/angular/commit/bf4ad3811762d9ba43d18c3360d014a9ceb06b4d) | fix | remove styles from DOM of destroyed components ([#48298](https://github.com/angular/angular/pull/48298)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [25e220a23a](https://github.com/angular/angular/commit/25e220a23ab90520efc65f05cd9b7a22db582b87) | fix | avoid duplicate TransferState info after renderApplication call ([#49094](https://github.com/angular/angular/pull/49094)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [31b94c762f](https://github.com/angular/angular/commit/31b94c762fc91ab6cabe08ea6812780fdcf92a64) | feat | Add a withNavigationErrorHandler feature to provideRouter ([#48551](https://github.com/angular/angular/pull/48551)) |
| [dedac8d3f7](https://github.com/angular/angular/commit/dedac8d3f73ebf4f05b773454e2a22ab5fa4bf7c) | feat | Add test helper for trigger navigations in tests ([#48552](https://github.com/angular/angular/pull/48552)) |
## Special Thanks
Alan Agius, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Dylan Hunn, Ikko Eltociear Ashimine, Ilyass, Jessica Janiuk, Joey Perrott, John Manners, Kalbarczyk, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Virginia Dooley, Walid Bouguima, cexbrayat and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.5"></a>
# 15.1.5 (2023-02-15)
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [5f2a3edcf2](https://github.com/angular/angular/commit/5f2a3edcf27cfe6ffc6ae4d67ca2b47953f26336) | fix | Make radio buttons respect `[attr.disabled]` ([#48864](https://github.com/angular/angular/pull/48864)) |
## Special Thanks
AleksanderBodurri, Alvaro Junqueira, Dylan Hunn, Joey Perrott, Matthieu Riegler, PaloMiklo and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.4"></a>
# 15.1.4 (2023-02-08)
## Special Thanks
Jessica Janiuk, Kian Yang Lee, Matthieu Riegler, Redouane Bekkouche and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.3"></a>
# 15.1.3 (2023-02-02)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [d36dfd4b62](https://github.com/angular/angular/commit/d36dfd4b626ff4c5894ca67136f71dd1f7f56e3e) | fix | fix non-animatable warnings for easing ([#48583](https://github.com/angular/angular/pull/48583)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [a334e4efbe](https://github.com/angular/angular/commit/a334e4efbe9380776e574f745390901552df771e) | fix | warn if using ngSrcset without a configured image loader ([#48804](https://github.com/angular/angular/pull/48804)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [171b4d4640](https://github.com/angular/angular/commit/171b4d46407e7c2860fdce4a5196fd6a34b455f0) | fix | incorrect code when non-null assertion is used after a safe access ([#48801](https://github.com/angular/angular/pull/48801)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [9e86dd231b](https://github.com/angular/angular/commit/9e86dd231bd0fb818da537191bbe197f15efc44d) | fix | Fixed file format issue with lint ([#48859](https://github.com/angular/angular/pull/48859)) |
| [af31f98b00](https://github.com/angular/angular/commit/af31f98b00a5d3decbb39df1f998346b3002b89e) | fix | migration host incorrectly reading empty files ([#48849](https://github.com/angular/angular/pull/48849)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [73972c684e](https://github.com/angular/angular/commit/73972c684e214bc0e7c88338e001ff99a14dbcdc) | fix | insert transfer state `script` before other `script` tags ([#48868](https://github.com/angular/angular/pull/48868)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [d5b2c249a3](https://github.com/angular/angular/commit/d5b2c249a3b220d0a47413c6e1054fd49d9d8cd8) | fix | Handle routerLink directive on svg anchors. ([#48857](https://github.com/angular/angular/pull/48857)) |
## Special Thanks
Alan Agius, Besim Gürbüz, Brecht Billiet, Dario Piotrowicz, Dylan Hunn, Iván Navarro, Jessica Janiuk, Kristiyan Kostadinov, Matthieu Riegler, Onkar Ruikar, Payam Valadkhan, Santosh Yadav, Virginia Dooley and Walid Bouguima

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.2"></a>
# 15.1.2 (2023-01-25)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [98ccb57117](https://github.com/angular/angular/commit/98ccb571176632cf4d434e9e54b086bb63601148) | fix | handle css selectors with space after an escaped character. ([#48558](https://github.com/angular/angular/pull/48558)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [145f848a10](https://github.com/angular/angular/commit/145f848a10b4dc791cbf42b803983357735d5f86) | fix | resolve deprecation warning ([#48812](https://github.com/angular/angular/pull/48812)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [a6b10f6e59](https://github.com/angular/angular/commit/a6b10f6e597e666a55ef1cd2aecdf3a309cebad8) | fix | 'createUrlTreeFromSnapshot' with empty paths and named outlets ([#48734](https://github.com/angular/angular/pull/48734)) |
## Special Thanks
Alan Agius, AleksanderBodurri, Andrew Kushnir, Andrew Scott, Charles Lyding, Dylan Hunn, JoostK, Matthieu Riegler, Paul Gschwendtner, Payam Valadkhan, Virginia Dooley, Yann Thomas LE MOIGNE and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.1"></a>
# 15.1.1 (2023-01-18)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [68ce4f6ab4](https://github.com/angular/angular/commit/68ce4f6ab495f78858281b902e6433fe90ed6dbf) | fix | Update `Location` to get a normalized URL valid in case a represented URL starts with the substring equals `APP_BASE_HREF` ([#48489](https://github.com/angular/angular/pull/48489)) |
| [032b2bd689](https://github.com/angular/angular/commit/032b2bd689e24ece61e23bfe9a39a11676958b8d) | perf | avoid excessive DOM mutation in NgClass ([#48433](https://github.com/angular/angular/pull/48433)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dd54f6bd96](https://github.com/angular/angular/commit/dd54f6bd963f859d18af90d5b3834c443ec073f9) | fix | makeEnvironmentProviders should accept EnvironmentProviders ([#48720](https://github.com/angular/angular/pull/48720)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Scott, Aristeidis Bampakos, Bob Watson, Jens, Konstantin Kharitonov, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Vladyslav Slipchenko, ced, dario-piotrowicz, mgechev and ノウラ

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.0"></a>
# 15.1.0 (2023-01-10)
## Deprecations
### router
- CanLoad guards in the Router are deprecated. Use CanMatch
  instead.
- router writable properties

  The following strategies are meant to be configured by registering the
  application strategy in DI via the `providers` in the root `NgModule` or
  `bootstrapApplication`:
  * `routeReuseStrategy`
  * `titleStrategy`
  * `urlHandlingStrategy`

  The following options are meant to be configured using the options
  available in `RouterModule.forRoot` or `provideRouter`.
  * `onSameUrlNavigation`
  * `paramsInheritanceStrategy`
  * `urlUpdateStrategy`
  * `canceledNavigationResolution`

  The following options are available in `RouterModule.forRoot` but not
  available in `provideRouter`:
  * `malformedUriErrorHandler` - This was found to not be used anywhere
    internally.
  * `errorHandler` - Developers can instead subscribe to `Router.events`
    and filter for `NavigationError`.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [fe50813664](https://github.com/angular/angular/commit/fe50813664809a1177132a77bd2a316ad0858b9e) | feat | Add BrowserPlatformLocation to the public API ([#48488](https://github.com/angular/angular/pull/48488)) |
| [2f4f0638c7](https://github.com/angular/angular/commit/2f4f0638c74dccfc2d0522f67ab226d3227c0566) | fix | Add data attribtue to NgOptimizedImage ([#48497](https://github.com/angular/angular/pull/48497)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [a532d71975](https://github.com/angular/angular/commit/a532d71975bef463223fd5d8322e3140760c9134) | feat | allow self-closing tags on custom elements ([#48535](https://github.com/angular/angular/pull/48535)) |
| [caf7228f8a](https://github.com/angular/angular/commit/caf7228f8ac7e45e3fafeaee0576ae96738a047f) | fix | resolve deprecation warning ([#48652](https://github.com/angular/angular/pull/48652)) |
| [33f35b04ef](https://github.com/angular/angular/commit/33f35b04ef0f32f25624a6be59f8635675e3e131) | fix | type-only symbols incorrectly retained when downlevelling custom decorators ([#48638](https://github.com/angular/angular/pull/48638)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [caedef0f5b](https://github.com/angular/angular/commit/caedef0f5b37ac6530885223b26879c39c36c1bd) | fix | update `@babel/core` dependency and lock version ([#48634](https://github.com/angular/angular/pull/48634)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6acae1477a](https://github.com/angular/angular/commit/6acae1477a212bbd85d0670913c2925fa3bc0c24) | feat | Add `TestBed.runInInjectionContext` to help test functions which use `inject` ([#47955](https://github.com/angular/angular/pull/47955)) |
| [38421578a2](https://github.com/angular/angular/commit/38421578a2573bcbc86c927ed4015e20fc39f04a) | feat | Make the `isStandalone()` function available in public API ([#48114](https://github.com/angular/angular/pull/48114)) |
| [dd42974b07](https://github.com/angular/angular/commit/dd42974b070b068135c1bc34072486ae440e45e0) | feat | support TypeScript 4.9 ([#48005](https://github.com/angular/angular/pull/48005)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [8aa8b4b77c](https://github.com/angular/angular/commit/8aa8b4b77cefcdd400ec9767b946b295ef42a066) | fix | Form provider FormsModule.withConfig return a FormsModule ([#48526](https://github.com/angular/angular/pull/48526)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [5f0b53c735](https://github.com/angular/angular/commit/5f0b53c7352f19480185c6b5c769e5012a2d2faa) | feat | Allow auto-imports to suggest multiple possible imports. ([#47787](https://github.com/angular/angular/pull/47787)) |
| [6a8ea29a04](https://github.com/angular/angular/commit/6a8ea29a04c35071d807bd2809e7fcbadd49f048) | fix | expose `package.json` for vscode extension resolution ([#48678](https://github.com/angular/angular/pull/48678)) |
| [ce8160ecb2](https://github.com/angular/angular/commit/ce8160ecb28d6765d438eb65035835984eb956ec) | fix | Prevent crashes on unemitable references ([#47938](https://github.com/angular/angular/pull/47938)) |
| [e615b598ba](https://github.com/angular/angular/commit/e615b598bab9c67bc34a44e39ef1d7066f9bf052) | fix | ship `/api` entry-point ([#48670](https://github.com/angular/angular/pull/48670)) |
| [6ce7d76a0e](https://github.com/angular/angular/commit/6ce7d76a0ea9cfc1591bee408719fa6da069344f) | fix | update packages/language-service/build.sh script to work with vscode-ng-language-service's new Bazel build ([#48663](https://github.com/angular/angular/pull/48663)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [a1a8e91eca](https://github.com/angular/angular/commit/a1a8e91ecaded6a2e4d700109a26d3117ad77c9c) | fix | add triple slash type reference on `@angular/localize` on `ng  add ([#48502](https://github.com/angular/angular/pull/48502)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [cc284afbbc](https://github.com/angular/angular/commit/cc284afbbc33b91884882204c5958a44a5d11392) | fix | combine newly-added imports in import manager ([#48620](https://github.com/angular/angular/pull/48620)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [228e992db7](https://github.com/angular/angular/commit/228e992db75bd7a2213b4596e6e2a8696578aa19) | docs | Deprecate canLoad guards in favor of canMatch ([#48180](https://github.com/angular/angular/pull/48180)) |
| [0a8b8a66cd](https://github.com/angular/angular/commit/0a8b8a66cdfb86586811c79bec938b3ab7215e8f) | docs | Deprecate public members of Router that are meant to be configured elsewhere ([#48006](https://github.com/angular/angular/pull/48006)) |
| [332461bd0c](https://github.com/angular/angular/commit/332461bd0c5f5734a9d7f051f0f4c6c173dd87c9) | feat | Add ability to override `onSameUrlNavigation` default per-navigation ([#48050](https://github.com/angular/angular/pull/48050)) |
| [f58ad86e51](https://github.com/angular/angular/commit/f58ad86e51817f83ff18db790a347528262b850b) | feat | Add feature provider for enabling hash navigation ([#48301](https://github.com/angular/angular/pull/48301)) |
| [73f03ad2d2](https://github.com/angular/angular/commit/73f03ad2d29811dda2ee03c5f18c79ebc9519c0b) | feat | Add new NavigationSkipped event for ignored navigations ([#48024](https://github.com/angular/angular/pull/48024)) |
| [3fe75710d9](https://github.com/angular/angular/commit/3fe75710d97a0f3224b2b09c45d9b8a9ad6efe91) | fix | page refresh should not destroy history state ([#48540](https://github.com/angular/angular/pull/48540)) |
## Special Thanks
Alan Agius, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bob Watson, Charles Lyding, Derek Cormier, Doug Parker, Dylan Hunn, George Kalpakas, Greg Magolan, Jessica Janiuk, JiaLiPassion, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Renan Ferro, Tim Gates, Vadim, Virginia Dooley, ced, mgechev, piyush132000, robertIsaac and sr5434

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.4"></a>
# 15.0.4 (2022-12-14)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [6c1064c72f](https://github.com/angular/angular/commit/6c1064c72f7d5b9a455813046939ab0161c143bf) | fix | fix incorrect handling of camel-case css properties ([#48436](https://github.com/angular/angular/pull/48436)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [f30d18a942](https://github.com/angular/angular/commit/f30d18a9424afacbd47d70f91e233e286bb94b0d) | fix | Fix TestBed.overrideProvider type to include multi ([#48424](https://github.com/angular/angular/pull/48424)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b55d2dab5d](https://github.com/angular/angular/commit/b55d2dab5d76ffa809ac1feb78392a75c3081dec) | fix | evaluate const tuple types statically ([#48091](https://github.com/angular/angular/pull/48091)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, BrowserPerson, Jens, Jessica Janiuk, Joey Perrott, JoostK, Konstantin Kharitonov, Lukas Matta, Piotr Kowalski, Virginia Dooley, Yannick Baron, dario-piotrowicz, lsst25, piyush132000 and why520crazy

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.3"></a>
# 15.0.3 (2022-12-07)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [50b1c2bf52](https://github.com/angular/angular/commit/50b1c2bf520e88828eadefcb2d0acaf151f8118e) | fix | Don't generate srcsets with very large sources ([#47997](https://github.com/angular/angular/pull/47997)) |
| [bf44dc234a](https://github.com/angular/angular/commit/bf44dc234a32069cb297ef7d3a87c2004cad8b00) | fix | Update `Location` to support base href containing `origin` ([#48327](https://github.com/angular/angular/pull/48327)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [9a5d84249a](https://github.com/angular/angular/commit/9a5d84249a0fd6b5c2a77c7ab6cbf72d90c45ee3) | fix | make sure selectors inside container queries are correctly scoped ([#48353](https://github.com/angular/angular/pull/48353)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [167bc0d163](https://github.com/angular/angular/commit/167bc0d1638ffd6fe91bcb40f96c2ab90f3e01cb) | fix | Produce diagnostic rather than crash when using invalid hostDirective ([#48314](https://github.com/angular/angular/pull/48314)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e4dcaa513e](https://github.com/angular/angular/commit/e4dcaa513e7d5ccd3a63edf6132792873f01f7c1) | fix | unable to inject ChangeDetectorRef inside host directives ([#48355](https://github.com/angular/angular/pull/48355)) |
## Special Thanks
Alan Agius, Alex Castle, Andrew Kushnir, Andrew Scott, Bob Watson, Derek Cormier, Joey Perrott, Konstantin Kharitonov, Kristiyan Kostadinov, Paul Gschwendtner, Pawel Kozlowski, dario-piotrowicz and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.2"></a>
# 15.0.2 (2022-11-30)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [86a21f5569](https://github.com/angular/angular/commit/86a21f5569bc4b8060a882bd3d542a6c002438c7) | fix | accept inheriting the constructor from a class in a library ([#48156](https://github.com/angular/angular/pull/48156)) |
## Special Thanks
Alan Agius, Andrew Scott, Aristeidis Bampakos, Bob Watson, Derek Cormier, JoostK, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Rokas Brazdžionis, mgechev and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.1"></a>
# 15.0.1 (2022-11-22)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [930af9dd26](https://github.com/angular/angular/commit/930af9dd2607754e778922a4bb31055123229e24) | fix | Fix MockPlatformLocation events and missing onPopState implementation ([#48113](https://github.com/angular/angular/pull/48113)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [b342e55509](https://github.com/angular/angular/commit/b342e5550928c14ddfb33861189f67b39e163d05) | fix | don't mutate validators array ([#47830](https://github.com/angular/angular/pull/47830)) |
| [a12a120272](https://github.com/angular/angular/commit/a12a120272024e49bd3d80d9ed1ae30dcf8622f8) | fix | FormBuilder.group return right type with shorthand parameters. ([#48084](https://github.com/angular/angular/pull/48084)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [cc8b76ef7c](https://github.com/angular/angular/commit/cc8b76ef7cb908d2c95229f39bf82a13ca59570b) | fix | correctly handle host directive inputs/outputs ([#48147](https://github.com/angular/angular/pull/48147)) |
| [a8c33bf931](https://github.com/angular/angular/commit/a8c33bf93132425a617381e4aa9a6f0e8e0ddf5b) | fix | update packages/language-service/build.sh script to work with vscode-ng-language-service's new Bazel build ([#48120](https://github.com/angular/angular/pull/48120)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [e4309d57d8](https://github.com/angular/angular/commit/e4309d57d893e111bda3744a61630d1888ddbc02) | fix | correct type of nextState parameter in canDeactivate ([#48038](https://github.com/angular/angular/pull/48038)) |
| [9baefd085f](https://github.com/angular/angular/commit/9baefd085fb079c312c4c03d79775a0fcff933b9) | fix | Ensure renavigating in component init works with enabledBlocking ([#48063](https://github.com/angular/angular/pull/48063)) |
| [fa5528fb5f](https://github.com/angular/angular/commit/fa5528fb5f0fe6e4e6ea85d39e43262018520c43) | fix | restore 'history.state' on popstate even if navigationId missing ([#48033](https://github.com/angular/angular/pull/48033)) |
## Special Thanks
Alan Agius, Andrew Scott, Bjarki, Bob Watson, Brooke, Derek Cormier, Dylan Hunn, George Kalpakas, Greg Magolan, Ikko Ashimine, Ivan Rodriguez, Jessica Janiuk, Joe Roxbury, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Mikhail Savchuk, Nebojsa Cvetkovic, Pawel Kozlowski, Volodymyr and Wooshaah

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.17"></a>
# 12.2.17 (2022-11-22)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b871db57da](https://github.com/angular/angular/commit/b871db57daab10ef6d4d92041177458f19fd3ebd) | fix | hardening attribute and property binding rules for <iframe> elements ([#48059](https://github.com/angular/angular/pull/48059)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Looshch, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.12"></a>
# 13.3.12 (2022-11-21)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b1d7b79ff4](https://github.com/angular/angular/commit/b1d7b79ff4619d6e7967455d7cda72754f5dab9a) | fix | hardening attribute and property binding rules for <iframe> elements ([#48029](https://github.com/angular/angular/pull/48029)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Looshch, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.12"></a>
# 14.2.12 (2022-11-21)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [54814c8e9b](https://github.com/angular/angular/commit/54814c8e9ba6b82a7f4748ef2b2f47507efd758b) | fix | hardening attribute and property binding rules for <iframe> elements ([#48028](https://github.com/angular/angular/pull/48028)) |
## Special Thanks
Andrew Kushnir

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.0"></a>
# 15.0.0 (2022-11-16)

[Blog post "Angular v15 is now available"](https://goo.gle/angular-v15).

## Breaking Changes
### compiler
- Keyframes names are now prefixed with the component's "scope name".
  For example, the following keyframes rule in a component definition,
  whose "scope name" is host-my-cmp:

     @keyframes foo { ... }

  will become:

     @keyframes host-my-cmp_foo { ... }

  Any TypeScript/JavaScript code which relied on the names of keyframes rules
  will no longer match.

  The recommended solutions in this case are to either:
  - change the component's view encapsulation to the `None` or `ShadowDom`
  - define keyframes rules in global stylesheets (e.g styles.css)
  - define keyframes rules programmatically in code.
### compiler-cli
- Invalid constructors for DI may now report compilation errors

  When a class inherits its constructor from a base class, the compiler may now
  report an error when that constructor cannot be used for DI purposes. This may
  either be because the base class is missing an Angular decorator such as
  `@Injectable()` or `@Directive()`, or because the constructor contains parameters
  which do not have an associated token (such as primitive types like `string`).
  These situations used to behave unexpectedly at runtime, where the class may be
  constructed without any of its constructor parameters, so this is now reported
  as an error during compilation.

  Any new errors that may be reported because of this change can be resolved either
  by decorating the base class from which the constructor is inherited, or by adding
  an explicit constructor to the class for which the error is reported.
- Angular compiler option `enableIvy` has been removed as Ivy is the only rendering engine.
### core
- Angular no longer supports Node.js versions `14.[15-19].x` and `16.[10-12].x`. Current supported versions of Node.js are `14.20.x`, `16.13.x` and `18.10.x`.
- TypeScript versions older than 4.8 are no longer supported.
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
- Existing iframe usages may have `src` or `srcdoc` preceding other attributes. Such usages may need to be updated to ensure compliance with the new stricter rules around iframe bindings.
### forms
- setDisabledState will always be called when a `ControlValueAccessor` is attached. You can opt-out with `FormsModule.withConfig` or `ReactiveFormsModule.withConfig`.
### localize
- - `canParse` method has been removed from all translation parsers in `@angular/localize/tools`. `analyze` should be used instead.
  -  the `hint` parameter in the`parse` methods is now mandatory.
### router
- Previously, the `RouterOutlet` would immediately
  instantiate the component being activated during navigation. Now the
  component is not instantiated until the change detection runs. This
  could affect tests which do not trigger change detection after a router
  navigation. In rarer cases, this can affect production code that relies
  on the exact timing of component availability.
- The title property is now required on ActivatedRouteSnapshot
- `relativeLinkResolution` is no longer configurable in
  the Router. This option was used as a means to opt out of a bug fix.
## Deprecations
### common
- The `DATE_PIPE_DEFAULT_TIMEZONE` token is now deprecated in favor
  of the `DATE_PIPE_DEFAULT_OPTIONS` token, which accepts an object
  as a value and the timezone can be defined as a field (called `timezone`)
  on that object.
### core
- - The ability to pass an `NgModule` to the `providedIn` option for
  `@Injectable` and `InjectionToken` is now deprecated.

  `providedIn: NgModule` was intended to be a tree-shakable alternative to
  NgModule providers. It does not have wide usage, and in most cases is used
  incorrectly, in circumstances where `providedIn: 'root'` should be
  preferred. If providers should truly be scoped to a specific NgModule, use
  `NgModule.providers` instead.

  - The ability to set `providedIn: 'any'` for an `@Injectable` or
  `InjectionToken` is now deprecated.

  `providedIn: 'any'` is an option with confusing semantics and is almost
  never used apart from a handful of esoteric cases internal to the framework.
- The bit field signature of `Injector.get()` has been deprecated, in favor of the new options object.
- The bit field signature of `TestBed.inject()` has been deprecated, in favor of the new options object.
### router
- The `RouterLinkWithHref` directive is deprecated, use the `RouterLink` directive instead. The `RouterLink` contains the code from the `RouterLinkWithHref` to handle elements with `href` attributes.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c0c7efaf7c](https://github.com/angular/angular/commit/c0c7efaf7c8a53c1a6f137aac960757cc804f263) | feat | add `provideLocationMocks()` function to provide Location mocks ([#47674](https://github.com/angular/angular/pull/47674)) |
| [75e6297f09](https://github.com/angular/angular/commit/75e6297f0901cc98aea1626a138a820e68d026ec) | feat | add <link> preload tag on server for priority img ([#47343](https://github.com/angular/angular/pull/47343)) |
| [4fde292bb5](https://github.com/angular/angular/commit/4fde292bb58f5d5bc3cf6e634f7cff9eb0d13d84) | feat | Add automatic srcset generation to ngOptimizedImage ([#47547](https://github.com/angular/angular/pull/47547)) |
| [9483343ebf](https://github.com/angular/angular/commit/9483343ebf958297ebcb81ef313d356296a41f41) | feat | Add fill mode to NgOptimizedImage ([#47738](https://github.com/angular/angular/pull/47738)) |
| [bdb5371033](https://github.com/angular/angular/commit/bdb5371033d8e9a110619861323e8383a32d5900) | feat | add injection token for default DatePipe configuration ([#47157](https://github.com/angular/angular/pull/47157)) |
| [449d29b701](https://github.com/angular/angular/commit/449d29b701ee5a50e7279d44f4c3888a5d6f7e96) | fix | Add fetchpriority to ngOptimizedImage preloads ([#48010](https://github.com/angular/angular/pull/48010)) |
| [4f52d4e474](https://github.com/angular/angular/commit/4f52d4e47416494b4054e43a0d96383bde7813ca) | fix | don't generate srcset if noopImageLoader is used ([#47804](https://github.com/angular/angular/pull/47804)) |
| [3a18398d83](https://github.com/angular/angular/commit/3a18398d8303fb4ae1923b3a182e6abb92e3117b) | fix | Don't warn about image distortion is fill mode is enabled ([#47824](https://github.com/angular/angular/pull/47824)) |
| [edea15f2c6](https://github.com/angular/angular/commit/edea15f2c63675e86248a25649008a10e1384334) | fix | export the IMAGE_CONFIG token ([#48051](https://github.com/angular/angular/pull/48051)) |
| [8abf1c844c](https://github.com/angular/angular/commit/8abf1c844c656b41a604098889db76e8c63da720) | fix | fix formatting on oversized image error ([#47188](https://github.com/angular/angular/pull/47188)) |
| [ca7bf65933](https://github.com/angular/angular/commit/ca7bf6593380fa760891d29fba5c9f61c6e9bf8b) | fix | rename `rawSrc` -> `ngSrc` in NgOptimizedImage directive ([#47362](https://github.com/angular/angular/pull/47362)) |
| [b3879dbf14](https://github.com/angular/angular/commit/b3879dbf1470ab4f31e676f1f8909cd50d963844) | fix | support density descriptors with 2+ decimals ([#47197](https://github.com/angular/angular/pull/47197)) |
| [fa4798095e](https://github.com/angular/angular/commit/fa4798095e3820087c4a3bccc9638c5e979315da) | fix | update size error to mention 'fill' mode ([#47797](https://github.com/angular/angular/pull/47797)) |
| [23f210c0ab](https://github.com/angular/angular/commit/23f210c0abfb6104f4aa2f39d0efd096c2b7574d) | fix | warn if using supported CDN but not built-in loader ([#47330](https://github.com/angular/angular/pull/47330)) |
| [945432e3fa](https://github.com/angular/angular/commit/945432e3fa2cb22ff911eda2a8ad3302a8adba5a) | fix | Warn on fill ngOptimizedImage without height ([#48036](https://github.com/angular/angular/pull/48036)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [051f75648d](https://github.com/angular/angular/commit/051f75648d6065949796ac1c7ea67e71e31b011e) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
| [39b72e208b](https://github.com/angular/angular/commit/39b72e208b46d80f1d9a802cebf043c2ccf3c5f2) | fix | update element schema ([#47552](https://github.com/angular/angular/pull/47552)) |
| [48b354a83e](https://github.com/angular/angular/commit/48b354a83e6d94735a03eebb3a52c5698e7a0f44) | fix | update element schema ([#47552](https://github.com/angular/angular/pull/47552)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [bc54687c7b](https://github.com/angular/angular/commit/bc54687c7b91efe451aa744d2d3a15ca3524231e) | fix | exclude abstract classes from `strictInjectionParameters` requirement ([#44615](https://github.com/angular/angular/pull/44615)) |
| [309b2cde51](https://github.com/angular/angular/commit/309b2cde51d1577d6561e826be01e2b5fce43c49) | fix | implement more host directive validations as diagnostics ([#47768](https://github.com/angular/angular/pull/47768)) |
| [2e1dddec45](https://github.com/angular/angular/commit/2e1dddec45fef8291b1f3abce2a937e28bb75a87) | fix | support hasInvalidatedResolutions. ([#47585](https://github.com/angular/angular/pull/47585)) |
| [19ad4987f9](https://github.com/angular/angular/commit/19ad4987f9070222bb2fb8bd07a43ed7995f602a) | fix | use @ts-ignore. ([#47636](https://github.com/angular/angular/pull/47636)) |
| [8fcadaad48](https://github.com/angular/angular/commit/8fcadaad48b2b1328f47b7603b230445a26f95a8) | perf | cache source file for reporting type-checking diagnostics ([#47471](https://github.com/angular/angular/pull/47471)) |
| [16f96eeabf](https://github.com/angular/angular/commit/16f96eeabf77964092b4b6a830e29f2761ffaeec) | refactor | remove `enableIvy` options ([#47346](https://github.com/angular/angular/pull/47346)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e3cef4a784](https://github.com/angular/angular/commit/e3cef4a7843d22fd004f1e27afcc42d0fbbef74a) | docs | deprecate `providedIn: NgModule` and `providedIn: 'any'` ([#47616](https://github.com/angular/angular/pull/47616)) |
| [1b9fd46d14](https://github.com/angular/angular/commit/1b9fd46d14ed46f78b6d761b3917ded1f0d51e0d) | feat | add support for Node.js version 18 ([#47730](https://github.com/angular/angular/pull/47730)) |
| [ed11a13c3c](https://github.com/angular/angular/commit/ed11a13c3c5cccb0094c1a4ff9c60ea741a42067) | feat | drop support for TypeScript 4.6 and 4.7 ([#47690](https://github.com/angular/angular/pull/47690)) |
| [db28badfe6](https://github.com/angular/angular/commit/db28badfe67f404e81dacd7c3131af105feb3412) | feat | enable the new directive composition API ([#47642](https://github.com/angular/angular/pull/47642)) |
| [7de1469be6](https://github.com/angular/angular/commit/7de1469be62b08037681ee9e75614fb800700ef8) | feat | introduce EnvironmentProviders wrapper type ([#47669](https://github.com/angular/angular/pull/47669)) |
| [841c8e5138](https://github.com/angular/angular/commit/841c8e51386645d7fd26642f41952ed8f0a2dbe5) | feat | support object-based DI flags in Injector.get() ([#46761](https://github.com/angular/angular/pull/46761)) |
| [120555a626](https://github.com/angular/angular/commit/120555a626d66523e46ce01681b11a0f38e3a40a) | feat | support object-based DI flags in TestBed.inject() ([#46761](https://github.com/angular/angular/pull/46761)) |
| [96c0e42e61](https://github.com/angular/angular/commit/96c0e42e61b8a4fced1354da0162c06e7b029cf3) | fix | allow readonly arrays for standalone imports ([#47851](https://github.com/angular/angular/pull/47851)) |
| [28f289b825](https://github.com/angular/angular/commit/28f289b825be7f4bf6dc5db69197741867b8ea23) | fix | hardening attribute and property binding rules for <iframe> elements ([#47964](https://github.com/angular/angular/pull/47964)) |
| [d4b3c0b47c](https://github.com/angular/angular/commit/d4b3c0b47c32a9a664d3073164d04c0385058008) | fix | hardening rules related to the attribute order on iframe elements ([#47935](https://github.com/angular/angular/pull/47935)) |
| [85330f3fd9](https://github.com/angular/angular/commit/85330f3fd9ac6381ce3aa18479ed8195d2ac215e) | fix | update `isDevMode` to rely on `ngDevMode` ([#47475](https://github.com/angular/angular/pull/47475)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [a8569e3802](https://github.com/angular/angular/commit/a8569e38029724a7d77935bccce99117a7e1aefa) | feat | export forms utility functions: isFormArray, isFormGroup… ([#47718](https://github.com/angular/angular/pull/47718)) |
| [96b7fe93af](https://github.com/angular/angular/commit/96b7fe93af361a1cf2ea5477970f64ba6f3d8cd5) | fix | call `setDisabledState` on `ControlValueAcessor` when control is enabled ([#47576](https://github.com/angular/angular/pull/47576)) |
| [a99d9d67f3](https://github.com/angular/angular/commit/a99d9d67f382c18b46c4c1c6765bbda445ca0b8c) | fix | don't mutate validators array ([#47830](https://github.com/angular/angular/pull/47830)) |
| [2625dc1312](https://github.com/angular/angular/commit/2625dc13127da9f8d5fa79f1b32ad132d6656c63) | fix | Improve a very commonly viewed error message by adding a guide. ([#47969](https://github.com/angular/angular/pull/47969)) |
| [ae29f98c20](https://github.com/angular/angular/commit/ae29f98c20390abbf84d2df312ee5e8766195d60) | fix | Runtime error pages must begin with leading zero ([#47991](https://github.com/angular/angular/pull/47991)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [3ba99e286a](https://github.com/angular/angular/commit/3ba99e286a166d122fb334171b6a9a1e6461a724) | feat | allow for child `HttpClient`s to request via parents ([#47502](https://github.com/angular/angular/pull/47502)) |
| [84d0d33c35](https://github.com/angular/angular/commit/84d0d33c3537f0da927e0ce449ede78ef9bebc6b) | feat | introduce `provideHttpClientTesting` provider function ([#47502](https://github.com/angular/angular/pull/47502)) |
| [62c7a7a16e](https://github.com/angular/angular/commit/62c7a7a16e035c3a5346270dc4c5c6de85bf9137) | feat | introduce functional interceptors ([#47502](https://github.com/angular/angular/pull/47502)) |
| [e47b129070](https://github.com/angular/angular/commit/e47b129070655f2e9eeac58bc2d0ea5648f41045) | feat | introduce the `provideHttpClient()` API ([#47502](https://github.com/angular/angular/pull/47502)) |
| [ea16a98dfe](https://github.com/angular/angular/commit/ea16a98dfef0de33c192e328f151cca39749a488) | fix | better handle unexpected `undefined` XSRF tokens ([#47683](https://github.com/angular/angular/pull/47683)) |
| [e7b48da713](https://github.com/angular/angular/commit/e7b48da713f32c02c096f1342ab8b0d7ec696ca5) | fix | rename `withLegacyInterceptors` to `withInterceptorsFromDi` ([#47901](https://github.com/angular/angular/pull/47901)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [bebef5fb43](https://github.com/angular/angular/commit/bebef5fb43dcf54a109499d0d9dd701786c33f60) | feat | Quick fix to import a component when its selector is used ([#47088](https://github.com/angular/angular/pull/47088)) |
| [e7ee53c541](https://github.com/angular/angular/commit/e7ee53c541da0a1f85c217354ec9901010ae0de9) | feat | support to fix invalid banana in box ([#47393](https://github.com/angular/angular/pull/47393)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [400a6b5e37](https://github.com/angular/angular/commit/400a6b5e3707f3939d84c659a115b75ef15d2c09) | fix | add polyfill in polyfills array instead of polyfills.ts ([#47569](https://github.com/angular/angular/pull/47569)) |
| [b6fd814542](https://github.com/angular/angular/commit/b6fd81454207bd256a48d5726f3bd7e6ce6a489b) | fix | update ng add schematic to support Angular CLI version 15 ([#47763](https://github.com/angular/angular/pull/47763)) |
| [d36fd3d9e4](https://github.com/angular/angular/commit/d36fd3d9e41984818af5e1aad5e3004574d837bb) | refactor | remove deprecated `canParse` method from TranslationParsers ([#47275](https://github.com/angular/angular/pull/47275)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [2908eba59c](https://github.com/angular/angular/commit/2908eba59c25e9a1fc5aa257b4a8a247db82079e) | fix | align server renderer interface with base renderer ([#47868](https://github.com/angular/angular/pull/47868)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [7bee28d037](https://github.com/angular/angular/commit/7bee28d037a8a21a7440293b3e8c118cc93ec8c1) | feat | add a migration to remove `relativeLinkResolution` usages ([#47604](https://github.com/angular/angular/pull/47604)) |
| [5163e3d876](https://github.com/angular/angular/commit/5163e3d876cdfd6d309d7e35aefa6f07ef62715e) | feat | Add UrlTree constructor to public API ([#47186](https://github.com/angular/angular/pull/47186)) |
| [da58801f95](https://github.com/angular/angular/commit/da58801f95c66c201e332189af25702bdd722f3f) | feat | auto-unwrap default exports when lazy loading ([#47586](https://github.com/angular/angular/pull/47586)) |
| [c3f857975d](https://github.com/angular/angular/commit/c3f857975d56cac6ad3939d64f76a51455159c23) | feat | make RouterOutlet name an Input so it can be set dynamically ([#46569](https://github.com/angular/angular/pull/46569)) |
| [f73ef21442](https://github.com/angular/angular/commit/f73ef2144279b6b26902510f90ca1fccb8e166b2) | feat | merge `RouterLinkWithHref` into `RouterLink` ([#47630](https://github.com/angular/angular/pull/47630)) |
| [16c8f55663](https://github.com/angular/angular/commit/16c8f55663c30270fcd647b1a8a20ddbc8923349) | feat | migrate `RouterLinkWithHref` references to `RouterLink` ([#47599](https://github.com/angular/angular/pull/47599)) |
| [07017a7bd3](https://github.com/angular/angular/commit/07017a7bd30c6bb7bd1b94a9fd1b112ee68c9ced) | feat | prevent `provideRouter()` from usage in @Component ([#47669](https://github.com/angular/angular/pull/47669)) |
| [79e9e8ab77](https://github.com/angular/angular/commit/79e9e8ab779d230f6a1df25c4ccff94b13129305) | fix | Delay router scroll event until navigated components have rendered ([#47563](https://github.com/angular/angular/pull/47563)) |
| [6a88bad019](https://github.com/angular/angular/commit/6a88bad0192516f26a5a008c0634b73456b9447c) | fix | Ensure ActivatedRouteSnapshot#title has correct value ([#47481](https://github.com/angular/angular/pull/47481)) |
| [7b89d95c0e](https://github.com/angular/angular/commit/7b89d95c0e7370d33f006aba8e67bafb53a2fd4f) | fix | Remove deprecated relativeLinkResolution ([#47623](https://github.com/angular/angular/pull/47623)) |
## Special Thanks
Alan Agius, AleksanderBodurri, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Charles Lyding, Dylan Hunn, Ferdinand Malcher, George Kalpakas, Jeremy Elbourn, Jessica Janiuk, JiaLiPassion, Joey Perrott, JoostK, Kara Erickson, Kristiyan Kostadinov, Martin Probst, Matthias Weiß, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Sabareesh Kappagantu, WD Snoeijer, angular-robot[bot], arturovt, ced, dario-piotrowicz, ivanwonder and jaybell

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.11"></a>
# 14.2.11 (2022-11-16)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [aef353c143](https://github.com/angular/angular/commit/aef353c143ea4e31d76f00ae91efe49eecc3a321) | fix | Ensure renavigating in component init works with enabledBlocking ([#48066](https://github.com/angular/angular/pull/48066)) |
## Special Thanks
Alan Agius, Andrew Scott and Mujo Osmanovic

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.10"></a>
# 14.2.10 (2022-11-09)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a4312e1be5](https://github.com/angular/angular/commit/a4312e1be55f0677a77c9015688dbd4cf8163c69) | fix | add` zone.js` version `0.12.x` as a valid peer dependency ([#48002](https://github.com/angular/angular/pull/48002)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [db867fee77](https://github.com/angular/angular/commit/db867fee77bc62f367fc5d484fc3951d72d998c8) | fix | fix redirectTo on named outlets - resolves [#33783](https://github.com/angular/angular/pull/33783) ([#47927](https://github.com/angular/angular/pull/47927)) |
## Special Thanks
Alan Agius, Albert Szekely, Andrew Scott, Doug Parker, Kristiyan Kostadinov, Markus Eckstein, Peter Scriven and abergquist

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.9"></a>
# 14.2.9 (2022-11-03)
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [92d28bdd99](https://github.com/angular/angular/commit/92d28bdd99d3e18f42f6ed8494344b72b15d0104) | perf | resolve memory leak when using animations with shadow DOM ([#47903](https://github.com/angular/angular/pull/47903)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [d2d9bbf5ce](https://github.com/angular/angular/commit/d2d9bbf5ce5a2f5e95e7c836fbca67d90db62371) | fix | call `onSerialize` when state is empty ([#47888](https://github.com/angular/angular/pull/47888)) |
## Special Thanks
Alan Agius, Kristiyan Kostadinov, Virginia Dooley and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.8"></a>
# 14.2.8 (2022-10-26)
## Special Thanks
Andrew Scott, Balaji, Paul Gschwendtner, WD Snoeijer, onrails and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.7"></a>
# 14.2.7 (2022-10-19)
## Special Thanks
Bob Watson, Charles Barnes, Joey Perrott, Virginia Dooley, WD Snoeijer, abergquist and urugator

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.6"></a>
# 14.2.6 (2022-10-12)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [3fd176a905](https://github.com/angular/angular/commit/3fd176a9054bea6f6c4cd22e8ff3b8f63b86b637) | fix | add missing period to error message ([#47744](https://github.com/angular/angular/pull/47744)) |
| [c3821f5ab5](https://github.com/angular/angular/commit/c3821f5ab5bf54b2c9d7868da79a742d4e4b7667) | perf | minimize filesystem calls when generating shims ([#47682](https://github.com/angular/angular/pull/47682)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, Charles Lyding, Joey Perrott, Joshua Morony, Mathew Berg, Paul Gschwendtner, Peter Dickten, Renan Ferro, Sri Ram, WD Snoeijer, markostanimirovic and Álvaro Martínez

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.5"></a>
# 14.2.5 (2022-10-05)

This release contains various API docs improvements.

## Special Thanks
Alexander Wiebe, Ciprian Sauliuc, Dmytro Mezhenskyi, George Kalpakas, Joe Martin (Crowdstaffing), Jordan, Ole M, Paul Gschwendtner, Pawel Kozlowski and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.4"></a>
# 14.2.4 (2022-09-28)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [a4b66fe1e5](https://github.com/angular/angular/commit/a4b66fe1e5acaf148069933720499652f21a7bce) | perf | cache source file for reporting type-checking diagnostics ([#47508](https://github.com/angular/angular/pull/47508)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2c46b5ab24](https://github.com/angular/angular/commit/2c46b5ab24e209381bca70d875bf0e98a2846ef5) | fix | correctly check for `typeof` of undefined in `ngDevMode` check ([#47480](https://github.com/angular/angular/pull/47480)) |
## Special Thanks
Alan Agius, Ashley Hunter, Doug Parker, Jessica Janiuk, JoostK, Kristiyan Kostadinov, Rokas Brazdžionis and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.3"></a>
# 14.2.3 (2022-09-21)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [bba2dae812](https://github.com/angular/angular/commit/bba2dae81263d07c55cd059eb8ef51baa7774055) | fix | make sure that the useAnimation function delay is applied ([#47468](https://github.com/angular/angular/pull/47468)) |
## Special Thanks
AleksanderBodurri, Andrew Kushnir, Andrew Scott, Bob Watson, George Kalpakas, Joey Perrott, Mauro Mattos, dario-piotrowicz, fabioemoutinho and famzila

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.2"></a>
# 14.2.2 (2022-09-14)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [937e6c5b3d](https://github.com/angular/angular/commit/937e6c5b3d4c4bfc6ba202ee6692bc2fd8a35b89) | fix | make sure that the animation function delay is applied ([#47285](https://github.com/angular/angular/pull/47285)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c9bdf9bab1](https://github.com/angular/angular/commit/c9bdf9bab1bc4cc4da207f6bfc8ebc75eb605486) | fix | rename `rawSrc` -> `ngSrc` in NgOptimizedImage directive ([#47362](https://github.com/angular/angular/pull/47362)) ([#47396](https://github.com/angular/angular/pull/47396)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a3e1303f04](https://github.com/angular/angular/commit/a3e1303f04d4afe456f3728939b3aa54e29f9fb3) | fix | imply @Optional flag when a default value is provided ([#47242](https://github.com/angular/angular/pull/47242)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [80c66a1e57](https://github.com/angular/angular/commit/80c66a1e57af33342ed851a0de886fc17b53f7a3) | fix | don't prevent default behavior for forms with method="dialog" ([#47308](https://github.com/angular/angular/pull/47308)) |
## Special Thanks
Abhishek Rawat, Andrew Kushnir, Benjamin Chanudet, Bob Watson, George Kalpakas, Ikko Ashimine, Kristiyan Kostadinov, Marc Wrobel, Mariia Subkov, Pawel Kozlowski, Sebastian, abergquist, dario-piotrowicz, onrails and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.1"></a>
# 14.2.1 (2022-09-07)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c0d7ac9ec2](https://github.com/angular/angular/commit/c0d7ac9ec2df9af36d80382bc70c4580720f35a3) | fix | improve formatting of image warnings ([#47299](https://github.com/angular/angular/pull/47299)) |
| [1875ce520a](https://github.com/angular/angular/commit/1875ce520afe7b5c55680b8c6a938a2331dda599) | fix | use DOCUMENT token to query for preconnect links ([#47353](https://github.com/angular/angular/pull/47353)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [0e35829580](https://github.com/angular/angular/commit/0e3582958079f798a75240873aebf3c4f5e3df5b) | fix | avoid errors for inputs with Object-builtin names ([#47220](https://github.com/angular/angular/pull/47220)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [6091786696](https://github.com/angular/angular/commit/60917866961b7ab80ec9637c72300f2707aadd09) | fix | include headers in requests for assets ([#47260](https://github.com/angular/angular/pull/47260)) |
| [28d33505fd](https://github.com/angular/angular/commit/28d33505fd4be00eaf4bf417cd27e20733ddfb80) | fix | only consider GET requests as navigation requests ([#47263](https://github.com/angular/angular/pull/47263)) |
## Special Thanks
Aristeidis Bampakos, Asaf M, Bingo's Code, Bob Watson, Daniel Ostrovsky, George Kalpakas, Giovanni Alberto Rivas, Jeremy Elbourn, Jobayer Hossain, Joe Martin (Crowdstaffing), Joey Perrott, JoostK, Kara Erickson, Kristiyan Kostadinov, Maina Wycliffe, Sabareesh Kappagantu, Simona Cotin, Sonu Sindhu, Yann Provoost, abergquist, jaybell and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.0"></a>
# 14.2.0 (2022-08-25)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [b96e571897](https://github.com/angular/angular/commit/b96e571897e815ff509188f15b60c66b1bafa358) | fix | fix stagger timing not handling params ([#47208](https://github.com/angular/angular/pull/47208)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [b380fdd59e](https://github.com/angular/angular/commit/b380fdd59e368e89908ea915f150cdc9f5a87a7f) | feat | add a density cap for image srcsets ([#47082](https://github.com/angular/angular/pull/47082)) |
| [7ce497e5bc](https://github.com/angular/angular/commit/7ce497e5bc6502bed8099d2592888f3164cdcf1f) | feat | add built-in Imgix loader ([#47082](https://github.com/angular/angular/pull/47082)) |
| [bff870db61](https://github.com/angular/angular/commit/bff870db6146850248597889550f676d81a85c90) | feat | add cloudflare loader ([#47082](https://github.com/angular/angular/pull/47082)) |
| [86e77a5d55](https://github.com/angular/angular/commit/86e77a5d559eddb285e74cc34c0db73de5645022) | feat | add Image directive skeleton ([#45627](https://github.com/angular/angular/pull/45627)) ([#47082](https://github.com/angular/angular/pull/47082)) |
| [0566205a02](https://github.com/angular/angular/commit/0566205a02c5dc87a01a0aa40cb5cdf147c81f11) | feat | Add image lazy loading and fetchpriority ([#47082](https://github.com/angular/angular/pull/47082)) |
| [4e952ba216](https://github.com/angular/angular/commit/4e952ba216297eb60fb3bae797b73f5b72c7660b) | feat | add loaders for cloudinary & imagekit ([#47082](https://github.com/angular/angular/pull/47082)) |
| [e854a8cdde](https://github.com/angular/angular/commit/e854a8cdde0f2fd00e67c0a841c8f6f0abcea18b) | feat | add loading attr to NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [8d3701cb4c](https://github.com/angular/angular/commit/8d3701cb4c167fb8b2153359a71e4f222d3d5657) | feat | add warnings re: image distortion ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d5f7da2120](https://github.com/angular/angular/commit/d5f7da21207f7808dffb3932fa61d22614e6bd57) | feat | define public API surface for NgOptimizedImage directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d3c3426aa4](https://github.com/angular/angular/commit/d3c3426aa41bd4092da3a9dd6951cab63f217db4) | feat | detect LCP images in `NgOptimizedImage` and assert if `priority` is set ([#47082](https://github.com/angular/angular/pull/47082)) |
| [451b85ca17](https://github.com/angular/angular/commit/451b85ca176e0aeae6358016e2695ea133d9ec56) | feat | explain why width/height is required ([#47082](https://github.com/angular/angular/pull/47082)) |
| [586274fe65](https://github.com/angular/angular/commit/586274fe65c5184b633e0e5ac12ca91979f138b2) | feat | provide an ability to exclude origins from preconnect checks in NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [57f3386e5b](https://github.com/angular/angular/commit/57f3386e5b5a3d6edc9e6d8c60b442b16e5c4a20) | feat | support custom srcset attributes in NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [7baf9a46cd](https://github.com/angular/angular/commit/7baf9a46cde2eb2d923c6b2d5e6afb51de9e3f2b) | feat | verify that priority images have preconnect links ([#47082](https://github.com/angular/angular/pull/47082)) |
| [f81765b333](https://github.com/angular/angular/commit/f81765b333881bd156383d81be62c06ff00380c1) | feat | warn if rendered size is much smaller than intrinsic ([#47082](https://github.com/angular/angular/pull/47082)) |
| [e2ab99b95e](https://github.com/angular/angular/commit/e2ab99b95efd893c49d15c02cccd72ef82ea1cae) | fix | allow null/undefined to be passed to ngClass input ([#39280](https://github.com/angular/angular/pull/39280)) ([#46906](https://github.com/angular/angular/pull/46906)) |
| [bedf537951](https://github.com/angular/angular/commit/bedf537951e64c55dde9b38936e451daa4a4bde9) | fix | allow null/undefined to be passed to ngStyle input ([#47069](https://github.com/angular/angular/pull/47069)) |
| [f9511bf6e8](https://github.com/angular/angular/commit/f9511bf6e8322f292421bcc0fa7851535aeaac85) | fix | avoid interacting with a destroyed injector ([#47243](https://github.com/angular/angular/pull/47243)) |
| [dc29e21b14](https://github.com/angular/angular/commit/dc29e21b141574247b5f9f859c019b4ad4be9742) | fix | consider density descriptors with multiple digits as valid ([#47230](https://github.com/angular/angular/pull/47230)) |
| [801daf82d1](https://github.com/angular/angular/commit/801daf82d119a39f21d26812b28c8551c58d841b) | fix | detect `data:` and `blob:` inputs in `NgOptimizedImage` directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [fff8056e7f](https://github.com/angular/angular/commit/fff8056e7f5fffd6d54315ca3897505ad5da725f) | fix | fix formatting on oversized image error ([#47188](https://github.com/angular/angular/pull/47188)) ([#47232](https://github.com/angular/angular/pull/47232)) |
| [1ca2ce19ab](https://github.com/angular/angular/commit/1ca2ce19ab871c76bee3ad67ee9c610284ca9281) | fix | remove default for image width ([#47082](https://github.com/angular/angular/pull/47082)) |
| [c5db867ddc](https://github.com/angular/angular/commit/c5db867ddcac10720a23487461994bbf682898e9) | fix | remove duplicate deepForEach ([#47189](https://github.com/angular/angular/pull/47189)) |
| [1cf43deb18](https://github.com/angular/angular/commit/1cf43deb1899440c0bd468f8bf31390d4f23d678) | fix | sanitize `rawSrc` and `rawSrcset` values in NgOptimizedImage directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d71dfe931f](https://github.com/angular/angular/commit/d71dfe931f71bff71e4e7af96aebd59f31cd4079) | fix | set bound width and height onto host element ([#47082](https://github.com/angular/angular/pull/47082)) |
| [32caa8b669](https://github.com/angular/angular/commit/32caa8b66908097522658360e5907c5004c13eeb) | fix | support density descriptors with 2+ decimals ([#47197](https://github.com/angular/angular/pull/47197)) ([#47232](https://github.com/angular/angular/pull/47232)) |
| [ae4405f0bf](https://github.com/angular/angular/commit/ae4405f0bf1c94fe86d9e9a62360834e80cef8e7) | fix | throw if srcset is used with rawSrc ([#47082](https://github.com/angular/angular/pull/47082)) |
| [0c8eb8bc82](https://github.com/angular/angular/commit/0c8eb8bc82c26596092d4774fcdac255aecdec90) | perf | monitor LCP only for images without `priority` attribute ([#47082](https://github.com/angular/angular/pull/47082)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [ea89677c12](https://github.com/angular/angular/commit/ea89677c125c16654e3e521998b575687c2bd20c) | feat | support more recent version of `tsickle` ([#47018](https://github.com/angular/angular/pull/47018)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d1e83e1b30](https://github.com/angular/angular/commit/d1e83e1b30f2cea9f2ed16bff2d3b969335072ab) | feat | add `createComponent` function ([#46685](https://github.com/angular/angular/pull/46685)) |
| [10becab70e](https://github.com/angular/angular/commit/10becab70e0f2afee29da7b3358eedcc22f655a2) | feat | add `reflectComponentType` function ([#46685](https://github.com/angular/angular/pull/46685)) |
| [4b377d3a6d](https://github.com/angular/angular/commit/4b377d3a6d069da23ec577f8deca761b01d4e2f5) | feat | introduce createApplication API ([#46475](https://github.com/angular/angular/pull/46475)) |
| [31429eaccc](https://github.com/angular/angular/commit/31429eaccc973672efb4ed98a628cf9842e24b02) | feat | support TypeScript 4.8 ([#47038](https://github.com/angular/angular/pull/47038)) |
| [796840209c](https://github.com/angular/angular/commit/796840209cd38aacc5061a31701efe7eda1f6587) | fix | align TestBed interfaces and implementation ([#46635](https://github.com/angular/angular/pull/46635)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [426af91a42](https://github.com/angular/angular/commit/426af91a42104d6ce227ab52c8c4db3e218f5e03) | feat | add `FormBuilder.record()` method ([#46485](https://github.com/angular/angular/pull/46485)) |
| [b302797de4](https://github.com/angular/angular/commit/b302797de47409b988ad77e87f766a5f18374ded) | fix | Correctly infer `FormBuilder` types involving `[value, validators]` shorthand in more cases. ([#47034](https://github.com/angular/angular/pull/47034)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [598b72bd05](https://github.com/angular/angular/commit/598b72bd05ea33468c70ac35b8ea5286439f41d9) | feat | support fix the component missing member ([#46764](https://github.com/angular/angular/pull/46764)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [07606e3181](https://github.com/angular/angular/commit/07606e3181fc7aa9f9185eb771fc9c44f01fe344) | feat | add `isEmpty` method to the `TransferState` class ([#46915](https://github.com/angular/angular/pull/46915)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [2b4d7f6733](https://github.com/angular/angular/commit/2b4d7f6733e10e45e3ca8a448307bbc2834fc4a1) | feat | support document reference in render functions ([#47032](https://github.com/angular/angular/pull/47032)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [0abb67af59](https://github.com/angular/angular/commit/0abb67af59a92a2b29082a259aa9f4ea3fbaab7d) | feat | allow guards and resolvers to be plain functions ([#46684](https://github.com/angular/angular/pull/46684)) |
| [75df404467](https://github.com/angular/angular/commit/75df4044675c61d2b646437cfe64fe828a39b3a0) | feat | Create APIs for using Router without RouterModule ([#47010](https://github.com/angular/angular/pull/47010)) |
| [10289f1f6e](https://github.com/angular/angular/commit/10289f1f6e3d5935304a38d4300d4dadfea66150) | feat | expose resolved route title ([#46826](https://github.com/angular/angular/pull/46826)) |
| [8600732b09](https://github.com/angular/angular/commit/8600732b090a4c253eb89ffde6db3858e4a2021c) | feat | Expose the default matcher for `Routes` used by the `Router` ([#46913](https://github.com/angular/angular/pull/46913)) |
| [422323cee0](https://github.com/angular/angular/commit/422323cee00192239d1ab279e6a7c3a808098169) | feat | improve typings for RouterLink boolean inputs ([#47101](https://github.com/angular/angular/pull/47101)) |
| [26ea97688c](https://github.com/angular/angular/commit/26ea97688cba5850588d8da83abaf8b539577241) | feat | Make router directives standalone ([#46758](https://github.com/angular/angular/pull/46758)) |
| [2a43beec15](https://github.com/angular/angular/commit/2a43beec159990b8c4bafc7f189e2bd85002dc7a) | fix | Fix route recognition behavior with some versions of rxjs ([#47098](https://github.com/angular/angular/pull/47098)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [383090858c](https://github.com/angular/angular/commit/383090858caf04c27ee8b320cceca2da0ae54bb3) | feat | support `sendRequest` as a `notificationclick` action ([#46912](https://github.com/angular/angular/pull/46912)) |
| [3f548610dd](https://github.com/angular/angular/commit/3f548610dd05f484cd33fa2cee4e3693ed731126) | fix | export NoNewVersionDetectedEvent ([#47044](https://github.com/angular/angular/pull/47044)) |
| [482b6119c2](https://github.com/angular/angular/commit/482b6119c2f3fff5ec0623e101d308a49c416b42) | fix | update golden `index.md` ([#47044](https://github.com/angular/angular/pull/47044)) |
## Special Thanks
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bob Watson, Cédric Exbrayat, Dylan Hunn, Emmanuel Roux, FatalMerlin, George Kalpakas, Ilia Mirkin, Jan Kuehle, Jeremy Elbourn, Jessica Janiuk, JiaLiPassion, Kalbarczyk, Kara Erickson, Katie Hempenius, Kristiyan Kostadinov, Merlin, Paul Gschwendtner, Pawel Kozlowski, Tristan Sprößer, Victor Porof, angular-robot[bot], dario-piotrowicz, ivanwonder and vyom

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.3"></a>
# 14.1.3 (2022-08-17)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [0583227708](https://github.com/angular/angular/commit/05832277089f9df9cde424d62033661620826592) | fix | infinite loop in parser assignment expression with invalid left-hand expression ([#47151](https://github.com/angular/angular/pull/47151)) |
## Special Thanks
AlirezaEbrahimkhani, Alma Eyre, Andrew Scott, Bob Watson, George Kalpakas, Kalbarczyk, Kristiyan Kostadinov, Leosvel Pérez Espinosa, Roman Matusevich and Sonu Kapoor

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.2"></a>
# 14.1.2 (2022-08-10)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5ff715c549](https://github.com/angular/angular/commit/5ff715c5497fcbcbb33eb93770470fff5a816cd5) | fix | check if transplanted views are attached to change detector ([#46974](https://github.com/angular/angular/pull/46974)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [439d77e852](https://github.com/angular/angular/commit/439d77e852c2e08d384c420a2c3a962a804c60f1) | fix | Fix route recognition behavior with some versions of rxjs ([#47098](https://github.com/angular/angular/pull/47098)) ([#47112](https://github.com/angular/angular/pull/47112)) |
## Special Thanks
4javier, Andrew Kushnir, Andrew Scott, AntonioCardenas, Bob Watson, Bruno Barbosa, Eduardo Speroni, Edward, George Kalpakas, Jan Melcher, Kristiyan Kostadinov, Mladen Jakovljević, Paul Gschwendtner, Pawel Kozlowski, Roman Matusevich, Vovch, ashide2729, ileil and onrails

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.1"></a>
# 14.1.1 (2022-08-03)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3606917732](https://github.com/angular/angular/commit/3606917732e5ad887426c1cbccf6e375eff905d6) | fix | improve the missing control flow directive message ([#46903](https://github.com/angular/angular/pull/46903)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [79825d3f10](https://github.com/angular/angular/commit/79825d3f1078c9b91eeb5e4699718ccde6c458b5) | fix | Do not call preload method when not necessary ([#47007](https://github.com/angular/angular/pull/47007)) |
| [05f3f7445a](https://github.com/angular/angular/commit/05f3f7445a0bbe3c7ffed3aec308ca8888e77d99) | fix | Use correct return type for provideRoutes function ([#46941](https://github.com/angular/angular/pull/46941)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Quinn, Andrew Scott, Aristeidis Bampakos, Asaf M, Bob Watson, Cédric Exbrayat, Durairaj Subramaniam, George Kalpakas, Ivaylo Kirov, J Rob Gant, Kristiyan Kostadinov, Marek Hám, Paul Gschwendtner, Roman Matusevich and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.0"></a>
# 14.1.0 (2022-07-20)
## Deprecations
### core
- The `createNgModuleRef` is deprecated in favor of newly added `createNgModule` one.
- The bit field signature of `inject()` has been deprecated, in favor of the
  new options object. Correspondingly, `InjectFlags` is deprecated as well.
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [55308f2df5](https://github.com/angular/angular/commit/55308f2df5b0f6e8e40e3c4085c463a5b83c5ed1) | feat | add `provideAnimations()` and `provideNoopAnimations()` functions ([#46793](https://github.com/angular/angular/pull/46793)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [4a2e7335b1](https://github.com/angular/angular/commit/4a2e7335b180190800cf2c5db8ed1c8841dbf473) | feat | make the `CommonModule` pipes standalone ([#46401](https://github.com/angular/angular/pull/46401)) |
| [a7597dd080](https://github.com/angular/angular/commit/a7597dd08026a4071758323d54ccbfb382e0c780) | feat | make the CommonModule directives standalone ([#46469](https://github.com/angular/angular/pull/46469)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [33ce3883a5](https://github.com/angular/angular/commit/33ce3883a5d962adf5ee7feffd3426feefe0c0b5) | feat | Add extended diagnostic to warn when missing let on ngForOf ([#46683](https://github.com/angular/angular/pull/46683)) |
| [6f11a58040](https://github.com/angular/angular/commit/6f11a580406877e440c43df31fae3d5f120cafed) | feat | Add extended diagnostic to warn when text attributes are intended to be bindings ([#46161](https://github.com/angular/angular/pull/46161)) |
| [9e836c232f](https://github.com/angular/angular/commit/9e836c232ff66043bc101b905dae4c8bde18bc58) | feat | warn when style suffixes are used with attribute bindings ([#46651](https://github.com/angular/angular/pull/46651)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [93c65e7b14](https://github.com/angular/angular/commit/93c65e7b1468bb0c696dec1bc3362422a2ca5170) | feat | add extended diagnostic for non-nullable optional chains ([#46686](https://github.com/angular/angular/pull/46686)) |
| [131d029da1](https://github.com/angular/angular/commit/131d029da16b7d486cdc200f00160b9a11871fb2) | feat | detect missing control flow directive imports in standalone components ([#46146](https://github.com/angular/angular/pull/46146)) |
| [6b8e60c06a](https://github.com/angular/angular/commit/6b8e60c06a4f9a5fdbce9e7971d403ccb2bc6e8e) | fix | improve the missingControlFlowDirective message ([#46846](https://github.com/angular/angular/pull/46846)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e8e8e5f171](https://github.com/angular/angular/commit/e8e8e5f1718f605c62a671b0ff15fa4dff7d8229) | feat | add `createComponent` function |
| [b5153814af](https://github.com/angular/angular/commit/b5153814af3e6b1ec8550ddf39584efd7cca36be) | feat | add `reflectComponentType` function |
| [96c6139c9a](https://github.com/angular/angular/commit/96c6139c9ab35aa6ab2330a5a79a5906d5c2e8be) | feat | add ability to set inputs on ComponentRef ([#46641](https://github.com/angular/angular/pull/46641)) |
| [a6d5fe202c](https://github.com/angular/angular/commit/a6d5fe202cafb419f3beb8d09711132124b6aa9a) | feat | alias `createNgModuleRef` as `createNgModule` ([#46789](https://github.com/angular/angular/pull/46789)) |
| [71e606d3c3](https://github.com/angular/angular/commit/71e606d3c3cfdcf93a6e40f84fd69aa75c5cca42) | feat | expose EnvironmentInjector on ApplicationRef ([#46665](https://github.com/angular/angular/pull/46665)) |
| [19e6d9ccd3](https://github.com/angular/angular/commit/19e6d9ccd36c7776fcee7de541bba413fd6dcabf) | feat | import AsyncStackTaggingZone if available ([#46693](https://github.com/angular/angular/pull/46693)) |
| [a7a14df5f8](https://github.com/angular/angular/commit/a7a14df5f8ff2d1e6a4dba3ac53f4479a6646810) | feat | introduce `EnvironmentInjector.runInContext` API ([#46653](https://github.com/angular/angular/pull/46653)) |
| [fa52b6e906](https://github.com/angular/angular/commit/fa52b6e906e549e1c6b4a4f4428596d093fb0549) | feat | options object to supersede bit flags for `inject()` ([#46649](https://github.com/angular/angular/pull/46649)) |
| [af20112222](https://github.com/angular/angular/commit/af20112222fcfa961ff9a2dee4050dd59aa4156e) | feat | support the descendants option for ContentChild queries ([#46638](https://github.com/angular/angular/pull/46638)) |
| [945a3ad359](https://github.com/angular/angular/commit/945a3ad359cd2fe3456f635b0fe36effbfe8d5c2) | fix | Fix `runInContext` for `NgModuleRef` injector ([#46877](https://github.com/angular/angular/pull/46877)) |
| [bb7c80477b](https://github.com/angular/angular/commit/bb7c80477b1258f48971b67b2eade6a4b41337f2) | fix | make parent injector argument required in `createEnvironmentInjector` ([#46397](https://github.com/angular/angular/pull/46397)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [82acbf919b](https://github.com/angular/angular/commit/82acbf919bae2ddb6a46f41239aa2a101901f089) | feat | improve error message for nullish header ([#46059](https://github.com/angular/angular/pull/46059)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [53ca936366](https://github.com/angular/angular/commit/53ca936366fb908278571bae5fcc7fa08b19a5a0) | feat | Add ability to create `UrlTree` from any `ActivatedRouteSnapshot` ([#45877](https://github.com/angular/angular/pull/45877)) |
| [de058bba99](https://github.com/angular/angular/commit/de058bba9979f68de2320118b537e6be4dbb888d) | feat | Add CanMatch guard to control whether a Route should match ([#46021](https://github.com/angular/angular/pull/46021)) |
| [6c1357dd7d](https://github.com/angular/angular/commit/6c1357dd7d5f466575398ebc32c581068d9bf2df) | feat | Add stable cancelation code to `NavigationCancel` event ([#46675](https://github.com/angular/angular/pull/46675)) |
| [a4ce273e50](https://github.com/angular/angular/commit/a4ce273e50551e6c6bc8f3a86591b04760de7ba4) | feat | Add the target `RouterStateSnapshot` to `NavigationError` ([#46731](https://github.com/angular/angular/pull/46731)) |
| [abe3759e24](https://github.com/angular/angular/commit/abe3759e2417c0396d75e226edcef2fae99e363b) | fix | allow to return `UrlTree` from `CanMatchFn` ([#46455](https://github.com/angular/angular/pull/46455)) |
| [e8c7dd10e9](https://github.com/angular/angular/commit/e8c7dd10e93d338456131e11d600bf758ee48634) | fix | Ensure `APP_INITIALIZER` of `enabledBlocking` option completes ([#46026](https://github.com/angular/angular/pull/46026)) |
| [ce20ed067f](https://github.com/angular/angular/commit/ce20ed067f12714ee6488ffe07f1a1c18bb60a15) | fix | Ensure Route injector is created before running CanMatch guards ([#46394](https://github.com/angular/angular/pull/46394)) |
| [6a7b818d94](https://github.com/angular/angular/commit/6a7b818d94fdd13d81a01285e3e4be953a29cc06) | fix | Ensure target `RouterStateSnapshot` is defined in `NavigationError` ([#46842](https://github.com/angular/angular/pull/46842)) |
| [f94c6f433d](https://github.com/angular/angular/commit/f94c6f433dba3924b79f137cfcc49d2dfd4d679c) | fix | Expose CanMatchFn as public API ([#46394](https://github.com/angular/angular/pull/46394)) |
| [e8ae0fe3e9](https://github.com/angular/angular/commit/e8ae0fe3e91e2e805146fad0d2f0976b1f886112) | fix | Fix cancelation code for canLoad rejections ([#46752](https://github.com/angular/angular/pull/46752)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [e9cb0454dc](https://github.com/angular/angular/commit/e9cb0454dce2113cfd5ba11deeca6cdcf47d47f0) | feat | more closely align `UpgradeModule#bootstrap()` with `angular.bootstrap()` ([#46214](https://github.com/angular/angular/pull/46214)) |
## Special Thanks
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Cédric Exbrayat, Dmitrij Kuba, Dylan Hunn, George Kalpakas, Jessica Janiuk, JiaLiPassion, Joey Perrott, John Vandenberg, JoostK, Keith Li, Or'el Ben-Ya'ir, Paul Gschwendtner, Pawel Kozlowski, SyedAhm3r, arturovt, mariu, markostanimirovic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.7"></a>
# 14.0.7 (2022-07-20)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [5bdbb6285b](https://github.com/angular/angular/commit/5bdbb6285b77f070347a5878bbd8218f6e01b5e8) | fix | make sure falsy values are added to _globalTimelineStyles ([#46863](https://github.com/angular/angular/pull/46863)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [41253f9c46](https://github.com/angular/angular/commit/41253f9c467aa9742ef0b69ddd063043fe0300e2) | fix | inputs/outputs incorrectly parsed in jit mode ([#46813](https://github.com/angular/angular/pull/46813)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4e77c7fbf3](https://github.com/angular/angular/commit/4e77c7fbf38f27741617303165068e1cb1ef6354) | fix | do not invoke jasmine `done` callback multiple times with `waitForAsync` |
## Special Thanks
Andrew Kushnir, Andrew Scott, Bob Watson, Cédric Exbrayat, Doug Parker, George Kalpakas, Jessica Janiuk, Kristiyan Kostadinov, Paul Gschwendtner, acvi, dario-piotrowicz, jnizet and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.6"></a>
# 14.0.6 (2022-07-13)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [99697dae66](https://github.com/angular/angular/commit/99697dae668d8df07a5c46caf08a071371131e56) | fix | only consider used pipes for inline type-check requirement ([#46807](https://github.com/angular/angular/pull/46807)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [4f469cbef3](https://github.com/angular/angular/commit/4f469cbef3664746750338d167964c247151de01) | fix | expose ControlConfig in public API ([#46594](https://github.com/angular/angular/pull/46594)) |
| [e8c8b695f2](https://github.com/angular/angular/commit/e8c8b695f20174a520ca1ba88164458c31e5b024) | fix | Move all remaining errors in Forms to use RuntimeErrorCode. ([#46654](https://github.com/angular/angular/pull/46654)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [14863acb1a](https://github.com/angular/angular/commit/14863acb1a642e9f6d36ea5d10d64f26d84ad475) | fix | add `--project` option to `ng-add` schematic ([#46664](https://github.com/angular/angular/pull/46664)) |
## Special Thanks
Alan Agius, Andrew Scott, Bob Watson, Dylan Hunn, George Kalpakas, Ivaylo Kirov, Jessica Janiuk, JoostK, Joshua VanAllen, Lukas Matta, Marcin Wosinek, Nicolas Molina Monroy, Paul Gschwendtner, SoulsMark, Uday Sony, dario-piotrowicz, markostanimirovic and zhysky

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.5"></a>
# 14.0.5 (2022-07-06)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [a3bd65e2b8](https://github.com/angular/angular/commit/a3bd65e2b87a2b5676c920778598fa6afd2cda9f) | fix | Ensure `APP_INITIALIZER` of `enabledBlocking` option completes ([#46634](https://github.com/angular/angular/pull/46634)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, George Kalpakas, Paul Gschwendtner and Pawel Kozlowski

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.4"></a>
# 14.0.4 (2022-06-29)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [51be9bbe29](https://github.com/angular/angular/commit/51be9bbe29e12ae0e8d4777cdac5c7466c8b6184) | fix | cleanup DOM elements when the root view is removed ([#45143](https://github.com/angular/angular/pull/45143)) |
| [999aca86c8](https://github.com/angular/angular/commit/999aca86c89030b6a9023cd2835636ee487334f2) | fix | enable shadowElements to leave when their parent does ([#46459](https://github.com/angular/angular/pull/46459)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [42aed6b13e](https://github.com/angular/angular/commit/42aed6b13efef59c1c33472adc4f2df5d52d4c20) | fix | handle CSS custom properties in NgStyle ([#46451](https://github.com/angular/angular/pull/46451)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [1e7f22f00a](https://github.com/angular/angular/commit/1e7f22f00ab10a6ae01729e3355871e51bc8bf4d) | fix | trigger `ApplicationRef.destroy` when Platform is destroyed ([#46497](https://github.com/angular/angular/pull/46497)) |
| [8bde2dbc71](https://github.com/angular/angular/commit/8bde2dbc714a0d9f7cda80c7893ab213d1e3f931) | fix | Update ngfor error code to be negative ([#46555](https://github.com/angular/angular/pull/46555)) |
| [57e8fc00eb](https://github.com/angular/angular/commit/57e8fc00eba92618c2cf063589ba1a88d3b30055) | fix | Updates error to use RuntimeError code ([#46526](https://github.com/angular/angular/pull/46526)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [74a26d870e](https://github.com/angular/angular/commit/74a26d870e2437f779c8c70f0b811f1d0bf8d4ee) | fix | Convert existing reactive errors to use RuntimeErrorCode. ([#46560](https://github.com/angular/angular/pull/46560)) |
| [747872212d](https://github.com/angular/angular/commit/747872212d12660eee59024202840e7d3ebfc866) | fix | Update a Forms validator error to use RuntimeError ([#46537](https://github.com/angular/angular/pull/46537)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [d6fac9e914](https://github.com/angular/angular/commit/d6fac9e914ad13f1ed63ea6a3738c245e547eaae) | fix | Ensure that new `RouterOutlet` instances work after old ones are destroyed ([#46554](https://github.com/angular/angular/pull/46554)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bezael, Chad Ramos, Chellappan, Cédric Exbrayat, Dylan Hunn, George Kalpakas, Jeremy Meiss, Jessica Janiuk, Joey Perrott, KMathy, Kristiyan Kostadinov, Paul Gschwendtner, Pawel Kozlowski, Ramesh Thiruchelvam, Vaibhav Kumar, arturovt, dario-piotrowicz and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.3"></a>
# 14.0.3 (2022-06-22)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [3dd7bb3f8f](https://github.com/angular/angular/commit/3dd7bb3f8fa009e245bfc91aa06a485d0cb27586) | fix | reset the start and done fns on player reset ([#46364](https://github.com/angular/angular/pull/46364)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c086653655](https://github.com/angular/angular/commit/c0866536558fa5abb91e1ba51fa84ea0321e6864) | fix | deduplicate imports of standalone components in JIT compiler ([#46439](https://github.com/angular/angular/pull/46439)) |
| [5d3b97e1f8](https://github.com/angular/angular/commit/5d3b97e1f8d5d004621df1004e00f128064d73cd) | fix | handle NgModules with standalone pipes in TestBed correctly ([#46407](https://github.com/angular/angular/pull/46407)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [6ad7b40a6f](https://github.com/angular/angular/commit/6ad7b40a6fe1b447173a44e7750f2b9abcb6fc0a) | fix | invalid style attribute being generated for null values ([#46433](https://github.com/angular/angular/pull/46433)) |
## Special Thanks
4javier, Aakash, Alan Agius, Andrew Kushnir, Aristeidis Bampakos, Dany Paredes, Derek Cormier, JoostK, Kristiyan Kostadinov, Paul Gschwendtner, Ramesh Thiruchelvam, behrooz bozorg chami, dario-piotrowicz, markostanimirovic, renovate[bot] and web-dave

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.2"></a>
# 14.0.2 (2022-06-15)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ef5cba3df7](https://github.com/angular/angular/commit/ef5cba3df783691433fe918f8f3c05878784c0f8) | fix | allow null in ngComponentOutlet ([#46280](https://github.com/angular/angular/pull/46280)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [8ecfd71fd7](https://github.com/angular/angular/commit/8ecfd71fd7a44628500668fbb59fdc08de8b8140) | fix | don't emit empty providers array ([#46301](https://github.com/angular/angular/pull/46301)) |
| [b92c1a6ada](https://github.com/angular/angular/commit/b92c1a6adada5923b1fd69e24560ae5bfd67dd5a) | fix | use inline type-check blocks for components outside `rootDir` ([#46096](https://github.com/angular/angular/pull/46096)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3fd8948b4a](https://github.com/angular/angular/commit/3fd8948b4a04dc504be3d4dd751a5554673423bb) | fix | Resolve forwardRef declarations for jit ([#46334](https://github.com/angular/angular/pull/46334)) |
## Special Thanks
Alex Rickabaugh, Andrew Scott, Badawi7, Daniel Schmitz, Derek Cormier, JoostK, Kevin Davila, Kristiyan Kostadinov, Paul Draper, Paul Gschwendtner, Tom Eustace, Totati, Younes Jaaidi, alefra, dario-piotrowicz, markostanimirovic, mgechev, piyush132000, sten-bone and vivekkoya

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.1"></a>
# 14.0.1 (2022-06-08)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [b00d237c0e](https://github.com/angular/angular/commit/b00d237c0ef726bdc262d81bcc3a3cb33181dbd9) | fix | update API extractor version ([#46259](https://github.com/angular/angular/pull/46259)) |
| [9a0a7bac21](https://github.com/angular/angular/commit/9a0a7bac21decae7662a8a2ec9488f60daa97e10) | perf | reduce input files for `ng_package` rollup and type bundle actions ([#46187](https://github.com/angular/angular/pull/46187)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [dde0b7f4b3](https://github.com/angular/angular/commit/dde0b7f4b3bc658b67a97644c8655252803be663) | fix | allow FormBuilder.group(...) to accept optional fields. ([#46253](https://github.com/angular/angular/pull/46253)) |
## Special Thanks
Adrien Crivelli, Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Dylan Hunn, Fabrizio Fallico, George Kalpakas, Jelle Bruisten, JoostK, Kristiyan Kostadinov, Krzysztof Platis, Paul Gschwendtner, Phalgun Vaddepalli, San Leen, dario-piotrowicz, mgechev and wellWINeo

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.0"></a>
# 14.0.0 (2022-06-02)

[Blog post "Angular v14 is now available"](https://goo.gle/angular-v14).

## Breaking Changes
### animations
- The `AnimationDriver.getParentElement` method has become required, so any
  implementors of this interface are now required to provide an implementation
  for this method. This breakage is unlikely to affect application developers,
  as `AnimationDriver` is not expected to be implemented in user code.
### common
- Adds new required class member that any implementors of the LocationStrategy will need to satisfy.
  Location does not depend on PlatformLocation anymore.
### compiler
- Keyframes names are now prefixed with the component's "scope name".
  For example, the following keyframes rule in a component definition,
  whose "scope name" is host-my-cmp:

     @keyframes foo { ... }

  will become:

     @keyframes host-my-cmp_foo { ... }

  Any TypeScript/JavaScript code which relied on the names of keyframes rules
  will no longer match.

  The recommended solutions in this case are to either:
  - change the component's view encapsulation to the `None` or `ShadowDom`
  - define keyframes rules in global stylesheets (e.g styles.css)
  - define keyframes rules programmatically in code.

### core
- Support for Node.js v12 has been removed as it will become EOL on 2022-04-30. Please use Node.js v14.15 or later.
- TypeScript versions older than 4.6 are no longer supported.
- Forms [email] input coercion

  Forms [email] input value will be considered as true if it is defined with any value rather
  than false and 'false'.
- Since Ivy, TestBed doesn't use AOT summaries. The `aotSummaries` fields in TestBed APIs were present, but unused. The fields were deprecated in previous major version and in v14 those fields are removed. The `aotSummaries` fields were completely unused, so you can just drop them from the TestBed APIs usage.
### forms
- Forms classes accept a generic.

  Forms model classes now accept a generic type parameter. Untyped versions of these classes are available to opt-out of the new, stricter behavior.
- objects with a length key set to zero will no longer validate as empty.

  This is technically a breaking change, since objects with a key `length` and value `0` will no longer validate as empty. This is a very minor change, and any reliance on this behavior is probably a bug anyway.
### http
- Queries including + will now actually query for + instead of space.
  Most workarounds involving custom codecs will be unaffected.
  Possible server-side workarounds will need to be undone.
- JSONP will throw an error when headers are set on a reques

  JSONP does not support headers being set on requests. Before when
  a request was sent to a JSONP backend that had headers set the headers
  were ignored. The JSONP backend will now throw an error if it
  receives a request that has any headers set. Any uses of JSONP
  on requests with headers set will need to remove the headers
  to avoid the error.
### platform-browser
- This change may cause a breaking change in unit tests that are implicitly depending on a specific
  number and sequence of change detections in order for their assertions to pass.
- This may break invalid calls to `TransferState` methods.

  This tightens parameter types of `TransferState` usage, and is a minor breaking change which may reveal existing problematic calls.
### router
- The type of `Route.pathMatch` is now stricter. Places that use
  `pathMatch` will likely need to be updated to have an explicit
  `Route`/`Routes` type so that TypeScript does not infer the type as
  `string`.
- When returning a `Promise` from the
  `LoadChildrenCallback`, the possible type is now restricted to
  `Type<any>|NgModuleFactory<any>` rather than `any`.
- `initialNavigation: 'enabled'` was deprecated in v11 and is replaced by
  `initialNavigation: 'enabledBlocking'`.
- The type of `component` on `ActivatedRoute` and `ActivatedRouteSnapshot`
  includes `string`. In reality, this is not the case. The component
  cannot be anything other than a component class.
- * The type of `initialUrl` is set to `string|UrlTree` but in reality,
    the `Router` only sets it to a value that will always be `UrlTree`
  * `initialUrl` is documented as "The target URL passed into the
    `Router#navigateByUrl()` call before navigation" but the value
    actually gets set to something completely different. It's set to the
    current internal `UrlTree` of the Router at the time navigation
    occurs.

  With this change, there is no exact replacement for the old value of
  `initialUrl` because it was never intended to be exposed.
  `Router.url` is likely the best replacement for this.
  In more specific use-cases, tracking the `finalUrl` between successful
  navigations can also be used as a replacement.
- Lazy loaded configs are now also validated once loaded like the
  initial set of routes are. Lazy loaded modules which have invalid Route
  configs will now error. Note that this is only done in dev mode so
  there is no production impact of this change.
- When a guard returns a `UrlTree`, the router would previously schedule
  the redirect navigation within a `setTimeout`. This timeout is now removed,
  which can result in test failures due to incorrectly written tests.
  Tests which perform navigations should ensure that all timeouts are
  flushed before making assertions. Tests should ensure they are capable
  of handling all redirects from the original navigation.
- Previously, resolvers were waiting to be completed
  before proceeding with the navigation and the Router would take the last
  value emitted from the resolver.
  The router now takes only the first emitted value by the resolvers
  and then proceeds with navigation. This is now consistent with `Observables`
  returned by other guards: only the first value is used.
### zone.js
- in TaskTrackingZoneSpec track a periodic task until it is cancelled

  The breaking change is scoped only to the plugin
  `zone.js/plugins/task-tracking`. If you used `TaskTrackingZoneSpec` and
  checked the pending macroTasks e.g. using `(this.ngZone as any)._inner
  ._parent._properties.TaskTrackingZone.getTasksFor('macroTask')`, then
  its behavior slightly changed for periodic macrotasks. For example,
  previously the `setInterval` macrotask was no longer tracked after its
  callback was executed for the first time. Now it's tracked until
  the task is explicitly cancelled, e.g  with `clearInterval(id)`.

## Deprecations
### common
- The `ngModuleFactory` input of the `NgComponentOutlet` directive is deprecated in favor of a newly added `ngModule` input. The `ngModule` input accepts references to the NgModule class directly, without the need to resolve module factory first.
### forms
- The `initialValueIsDefault` option has been deprecated and replaced with the otherwise-identical `nonNullable` option, for the sake of naming consistency.
- It is now deprecated to provide *both* `AbstractControlOption`s and an async validators argument to a FormControl. Previously, the async validators would just be silently dropped, resulting in a probably buggy forms. Now, the constructor call is deprecated, and Angular will print a warning in devmode.
### router
- The `resolver` argument of the `RouterOutletContract.activateWith` function and the `resolver` field of the `OutletContext` class are deprecated. Passing component factory resolvers are no longer needed. The `ComponentFactoryResolver`-related symbols were deprecated in `@angular/core` package since v13.
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [a6fa37bc6e](https://github.com/angular/angular/commit/a6fa37bc6e705fee48f555d4b8022915094e8b16) | feat | make validateStyleProperty check dev-mode only ([#45570](https://github.com/angular/angular/pull/45570)) |
| [79d334b138](https://github.com/angular/angular/commit/79d334b1385685d0fd1451534df2ed3cbaefa0b6) | feat | provide warnings for non-animatable CSS properties ([#45212](https://github.com/angular/angular/pull/45212)) |
| [f8dc660605](https://github.com/angular/angular/commit/f8dc66060591e1ce42265a7862c3df16e40b05e1) | fix | allow animations with unsupported CSS properties ([#44729](https://github.com/angular/angular/pull/44729)) |
| [2a75754ee8](https://github.com/angular/angular/commit/2a75754ee823032e651bc596887a2186dc6846ae) | fix | apply default params when resolved value is null or undefined ([#45339](https://github.com/angular/angular/pull/45339)) |
| [e46b379204](https://github.com/angular/angular/commit/e46b37920438d84bff895498c0a102dd1ffba178) | fix | implement missing transition delay ([#44799](https://github.com/angular/angular/pull/44799)) |
| [5c7c56bc85](https://github.com/angular/angular/commit/5c7c56bc859b195bf6710f6c1479d9e18dde35b1) | perf | improve algorithm to balance animation namespaces ([#45057](https://github.com/angular/angular/pull/45057)) |
| [4c778cdb28](https://github.com/angular/angular/commit/4c778cdb28de128c6ddecd2fd6cb6257d675500b) | perf | made errors in the animations package tree shakeable ([#45004](https://github.com/angular/angular/pull/45004)) |
| [7a81481fb2](https://github.com/angular/angular/commit/7a81481fb29e94b550db7ad68270eccf26bb2743) | perf | Remove generic objects in favor of Maps ([#44482](https://github.com/angular/angular/pull/44482)) |
| [6642e3c8fd](https://github.com/angular/angular/commit/6642e3c8fd7d3b5ed22710667b2c41a46f14eda8) | perf | remove no longer needed CssKeyframes classes ([#44903](https://github.com/angular/angular/pull/44903)) |
| [59559fdbac](https://github.com/angular/angular/commit/59559fdbacc00bee380b1e88c79d08b6e856ebbe) | refactor | make `AnimationDriver.getParentElement` required ([#45114](https://github.com/angular/angular/pull/45114)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [31d7c3bd71](https://github.com/angular/angular/commit/31d7c3bd71fdab3fef1b4615ecb8124fe6c165bd) | feat | add getState method to LocationStrategy interface ([#45648](https://github.com/angular/angular/pull/45648)) |
| [c89cf63059](https://github.com/angular/angular/commit/c89cf63059370bba43717483e3d9627499dfe815) | feat | support NgModule as an input to the NgComponentOutlet ([#44815](https://github.com/angular/angular/pull/44815)) |
| [38c03a2035](https://github.com/angular/angular/commit/38c03a20358db3f8621c023b98e627cd385731c0) | feat | support years greater than 9999 ([#43622](https://github.com/angular/angular/pull/43622)) |
| [bedb257afc](https://github.com/angular/angular/commit/bedb257afc1ca12eb221536ea44ade960e62cda0) | fix | cleanup URL change listeners when the root view is removed ([#44901](https://github.com/angular/angular/pull/44901)) |
| [10691c626b](https://github.com/angular/angular/commit/10691c626bf381bedfa278e9d50ab922b4b656cd) | fix | properly cast http param values to strings ([#42643](https://github.com/angular/angular/pull/42643)) |
| [05d50b849b](https://github.com/angular/angular/commit/05d50b849bb891c37c3eefab81a45099057dfd78) | perf | make `NgLocalization` token tree-shakable ([#45118](https://github.com/angular/angular/pull/45118)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [bb8d7091c6](https://github.com/angular/angular/commit/bb8d7091c64a785758ae347b1a9bcdeeed95897c) | fix | exclude empty styles from emitted metadata ([#45459](https://github.com/angular/angular/pull/45459)) |
| [4d6a1d6722](https://github.com/angular/angular/commit/4d6a1d672210219328b33f4f96210870563066ee) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
| [f03e313f24](https://github.com/angular/angular/commit/f03e313f24465cbe9ce99aa5f9f482a6c6b5485f) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [9cf14ff03d](https://github.com/angular/angular/commit/9cf14ff03dc7a848413b323dfb943fcd26f1217e) | feat | exclude abstract classes from `strictInjectionParameters` requirement ([#44615](https://github.com/angular/angular/pull/44615)) |
| [0072eb48ba](https://github.com/angular/angular/commit/0072eb48ba1c6f549703988b7fd7ba3e09058048) | feat | initial implementation of standalone components ([#44812](https://github.com/angular/angular/pull/44812)) |
| [2142ffd295](https://github.com/angular/angular/commit/2142ffd295de491eb8582c2eb1712b5b48044f24) | feat | propagate `standalone` flag to runtime ([#44973](https://github.com/angular/angular/pull/44973)) |
| [6f653e05f9](https://github.com/angular/angular/commit/6f653e05f985141ae4d2d90af78b2bc001595661) | feat | standalone types imported into NgModule scopes ([#44973](https://github.com/angular/angular/pull/44973)) |
| [752ddbc165](https://github.com/angular/angular/commit/752ddbc165359c2ff987c24f715d0a36fd604ec0) | feat | Support template binding to protected component members ([#45823](https://github.com/angular/angular/pull/45823)) |
| [3d13343975](https://github.com/angular/angular/commit/3d133439754cbf5d5a20bb3c714c8673c848e465) | fix | better error messages for NgModule structural issues ([#44973](https://github.com/angular/angular/pull/44973)) |
| [046dad1a8d](https://github.com/angular/angular/commit/046dad1a8d878ea537a6e2ef5f5ef24a85a2cf02) | fix | fix issue with incremental tracking of APIs for pipes ([#45672](https://github.com/angular/angular/pull/45672)) |
| [27b4af7240](https://github.com/angular/angular/commit/27b4af7240ea964d1e4d51b83118f10321163627) | fix | full side-effectful registration of NgModules with ids ([#45024](https://github.com/angular/angular/pull/45024)) |
| [32c625d027](https://github.com/angular/angular/commit/32c625d0279d9fd55178ced47c45969da533eedc) | fix | handle forwardRef in imports of standalone component ([#45869](https://github.com/angular/angular/pull/45869)) |
| [06050ac2b4](https://github.com/angular/angular/commit/06050ac2b4937836096fb331ec71bacb5a1fc231) | fix | handle inline type-check blocks in nullish coalescing extended check ([#45454](https://github.com/angular/angular/pull/45454)) |
| [a524a50361](https://github.com/angular/angular/commit/a524a50361bb408cf8baf8ff209378a1db967545) | fix | handle standalone components with cycles ([#46029](https://github.com/angular/angular/pull/46029)) |
| [724e88e042](https://github.com/angular/angular/commit/724e88e042b1a89691d48879673b5e1b161c3d9a) | fix | preserve `forwardRef` for component scopes ([#46139](https://github.com/angular/angular/pull/46139)) |
| [9cfea3d522](https://github.com/angular/angular/commit/9cfea3d522c0e4a34bb3a5d0fa9d04f64de39b49) | fix | report invalid imports in standalone components during resolve phase ([#45827](https://github.com/angular/angular/pull/45827)) |
| [c0778b4dfc](https://github.com/angular/angular/commit/c0778b4dfc1c107543b3db6f1958814a0812c7df) | fix | Support resolve animation name from the DTS ([#45107](https://github.com/angular/angular/pull/45107)) |
| [f2e5234e07](https://github.com/angular/angular/commit/f2e5234e078b6d4771d07e8b28b8098f1faeb176) | fix | update unknown tag error for aot standalone components ([#45919](https://github.com/angular/angular/pull/45919)) |
| [35f20afcac](https://github.com/angular/angular/commit/35f20afcac4877963e4a3e5d85b67ed8cb000af9) | fix | use existing imports for standalone dependencies ([#46029](https://github.com/angular/angular/pull/46029)) |
| [8155428ba6](https://github.com/angular/angular/commit/8155428ba65c38c0c15f2666727202a7b360c1bd) | perf | ignore the module.id anti-pattern for NgModule ids ([#45024](https://github.com/angular/angular/pull/45024)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [174ce7dd13](https://github.com/angular/angular/commit/174ce7dd13f6d8f941d3aa0b843559614cb68b0c) | feat | add `ApplicationRef.destroy` method ([#45624](https://github.com/angular/angular/pull/45624)) |
| [5771b18a98](https://github.com/angular/angular/commit/5771b18a989c3c75d713ffb75cd7c047c63e4090) | feat | add the `bootstrapApplication` function ([#45674](https://github.com/angular/angular/pull/45674)) |
| [69018c9f42](https://github.com/angular/angular/commit/69018c9f42d14c1c7aa8271b406d6d247de1c564) | feat | allow for injector to be specified when creating an embedded view ([#45156](https://github.com/angular/angular/pull/45156)) |
| [94c949a60a](https://github.com/angular/angular/commit/94c949a60ad0de1f5385ec97f2c1933cb1d55f22) | feat | allow for injector to be specified when creating an embedded view ([#45156](https://github.com/angular/angular/pull/45156)) |
| [e702cafcf2](https://github.com/angular/angular/commit/e702cafcf2fef53968ef52ce17cb343f3a12bb53) | feat | allow to throw on unknown elements in tests ([#45479](https://github.com/angular/angular/pull/45479)) |
| [6662a97c61](https://github.com/angular/angular/commit/6662a97c61f133a14f2d117f71e4d2b8f4a83c32) | feat | allow to throw on unknown elements in tests ([#45479](https://github.com/angular/angular/pull/45479)) |
| [a6675925b0](https://github.com/angular/angular/commit/a6675925b0b6f313d4932a753bd4aa4cb473b5f3) | feat | allow to throw on unknown properties in tests ([#45853](https://github.com/angular/angular/pull/45853)) |
| [6eaaefd22e](https://github.com/angular/angular/commit/6eaaefd22ebb95ee896a62237832ff2f2defdee0) | feat | drop support for Node.js 12 ([#45286](https://github.com/angular/angular/pull/45286)) |
| [c9d566ce4b](https://github.com/angular/angular/commit/c9d566ce4b6e9097d9eceb7ac3964a0b25c404ad) | feat | drop support for TypeScript 4.4 and 4.5 ([#45394](https://github.com/angular/angular/pull/45394)) |
| [b568a5e708](https://github.com/angular/angular/commit/b568a5e708579f5035f40c7218fbba39ad6b3065) | feat | implement `importProvidersFrom` function ([#45626](https://github.com/angular/angular/pull/45626)) |
| [d5a6cd1111](https://github.com/angular/angular/commit/d5a6cd11110c78762a8e6115a718f5851508dbf2) | feat | implement EnvironmentInjector with adapter to NgModuleRef ([#45626](https://github.com/angular/angular/pull/45626)) |
| [5a10fc4f82](https://github.com/angular/angular/commit/5a10fc4f8287d448c88ce2f6c97c48307af34af1) | feat | implement standalone directives, components, and pipes ([#45687](https://github.com/angular/angular/pull/45687)) |
| [e461f716d4](https://github.com/angular/angular/commit/e461f716d4b736829d53de26ba6dddb58f476746) | feat | move ANIMATION_MODULE_TYPE injection token into core ([#44970](https://github.com/angular/angular/pull/44970)) |
| [94bba76a4a](https://github.com/angular/angular/commit/94bba76a4a9594a5eb90e581f407f1b70697e715) | feat | support TypeScript 4.6 ([#45190](https://github.com/angular/angular/pull/45190)) |
| [29039fcdbc](https://github.com/angular/angular/commit/29039fcdbcb8cab040d88dabe2dcb1abae34cb4e) | feat | support TypeScript 4.7 ([#45749](https://github.com/angular/angular/pull/45749)) |
| [225e4f2dbe](https://github.com/angular/angular/commit/225e4f2dbeac5982982fb94eac65ea931c44247a) | feat | triggerEventHandler accept optional eventObj ([#45279](https://github.com/angular/angular/pull/45279)) |
| [401dec46eb](https://github.com/angular/angular/commit/401dec46eb71e33ae3ef185b8f92ed2b3b7661fd) | feat | update TestBed to recognize Standalone Components ([#45809](https://github.com/angular/angular/pull/45809)) |
| [35653ce337](https://github.com/angular/angular/commit/35653ce337b59336ebb06f07dfed027e5037ed06) | fix | add more details to the MISSING_INJECTION_CONTEXT error ([#46166](https://github.com/angular/angular/pull/46166)) |
| [d36fa111eb](https://github.com/angular/angular/commit/d36fa111eb677d504a9952d8b4ca53560cadd04d) | fix | avoid Closure Compiler error in restoreView ([#45445](https://github.com/angular/angular/pull/45445)) |
| [0bc77f4cab](https://github.com/angular/angular/commit/0bc77f4cabb3fe76accb120f7aba57ebfee9262b) | fix | better error message when unknown property is present ([#46147](https://github.com/angular/angular/pull/46147)) |
| [f3eb7d9ecb](https://github.com/angular/angular/commit/f3eb7d9ecb9a82e7396cca658e3250e47c853153) | fix | Ensure the `StandaloneService` is retained after closure minification ([#45783](https://github.com/angular/angular/pull/45783)) |
| [701405fa71](https://github.com/angular/angular/commit/701405fa710177ed1c963f61686ebb910e5ec74e) | fix | handle AOT-compiled standalone components in TestBed correctly ([#46052](https://github.com/angular/angular/pull/46052)) |
| [ddce357d1d](https://github.com/angular/angular/commit/ddce357d1db9694bc69c114deb96e26d2651fb8b) | fix | improve TestBed declarations standalone error message ([#45999](https://github.com/angular/angular/pull/45999)) |
| [ba9f30c9a6](https://github.com/angular/angular/commit/ba9f30c9a6af19b34d13962303ec96997c7c3d56) | fix | include component name into unknown element/property error message ([#46160](https://github.com/angular/angular/pull/46160)) |
| [9fa6f5a552](https://github.com/angular/angular/commit/9fa6f5a552b7780ce32aa5a60273d4008a7b6afb) | fix | incorrectly inserting elements inside `<template>` element ([#43429](https://github.com/angular/angular/pull/43429)) |
| [d5719c2e0f](https://github.com/angular/angular/commit/d5719c2e0fb237be71d658444bbfe2410e05086a) | fix | input coercion ([#42803](https://github.com/angular/angular/pull/42803)) |
| [be161bef79](https://github.com/angular/angular/commit/be161bef798ac5309df8390e3c2bba2cf84cb530) | fix | memory leak in event listeners inside embedded views ([#43075](https://github.com/angular/angular/pull/43075)) |
| [fa755b2a54](https://github.com/angular/angular/commit/fa755b2a541274336541e8870852e73718ad62d4) | fix | prevent `BrowserModule` providers from being loaded twice ([#45826](https://github.com/angular/angular/pull/45826)) |
| [3172b4cc99](https://github.com/angular/angular/commit/3172b4cc9972a7d347b3078484c9adcb15cf270c) | fix | produce proper error message for unknown props on `<ng-template>`s ([#46068](https://github.com/angular/angular/pull/46068)) |
| [4f1a813596](https://github.com/angular/angular/commit/4f1a813596a40f7885d369eb8917aedcce9dd795) | fix | restore NgModule state correctly after TestBed overrides ([#46049](https://github.com/angular/angular/pull/46049)) |
| [3f7ecec59b](https://github.com/angular/angular/commit/3f7ecec59b894d2a92f4b5643d2a23891938bde8) | fix | set correct context for inject() for component ctors ([#45991](https://github.com/angular/angular/pull/45991)) |
| [4e413d9240](https://github.com/angular/angular/commit/4e413d9240259fca1b1e548c5c405e646f8e68c8) | fix | support nested arrays of providers in `EnvironmentInjector` ([#45789](https://github.com/angular/angular/pull/45789)) |
| [fde4942cdf](https://github.com/angular/angular/commit/fde4942cdf5133119b13ed26ee2f6976b787d84c) | fix | throw if standalone components are present in `@NgModule.bootstrap` ([#45825](https://github.com/angular/angular/pull/45825)) |
| [560188bf12](https://github.com/angular/angular/commit/560188bf126f259328477773cabb367587a257d5) | fix | update unknown property error to account for standalone components in AOT ([#46159](https://github.com/angular/angular/pull/46159)) |
| [df339d8abf](https://github.com/angular/angular/commit/df339d8abf979c715c35db813c5a80252a92eba7) | fix | update unknown tag error for jit standalone components ([#45920](https://github.com/angular/angular/pull/45920)) |
| [aafac7228f](https://github.com/angular/angular/commit/aafac7228f3d18bb720e85d2b889df446122f4c7) | fix | verify standalone component imports in JiT ([#45777](https://github.com/angular/angular/pull/45777)) |
| [e9317aee71](https://github.com/angular/angular/commit/e9317aee71f64f4aadea0529601e589b37f6b46f) | perf | allow `checkNoChanges` mode to be tree-shaken in production ([#45913](https://github.com/angular/angular/pull/45913)) |
| [071c8af8ba](https://github.com/angular/angular/commit/071c8af8ba89163270f17657c0c7f1c944f186f7) | perf | avoid storing LView in `__ngContext__` ([#45051](https://github.com/angular/angular/pull/45051)) |
| [a96c4827c4](https://github.com/angular/angular/commit/a96c4827c4f62e1d665d8544a3e66c51d2644c88) | perf | make `Compiler`, `ApplicationRef` and `ApplicationInitStatus` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) |
| [45d98e7ca5](https://github.com/angular/angular/commit/45d98e7ca5accf918e2602cbc17805e11e18896b) | perf | make `IterableDiffers` and `KeyValueDiffers` tree-shakable ([#45094](https://github.com/angular/angular/pull/45094)) |
| [1e60fe0a3e](https://github.com/angular/angular/commit/1e60fe0a3eeb6bd46997f7eeb4825351cfbe3c44) | perf | make `LOCALE_ID` and other tokens from `ApplicationModule` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) |
| [88f1168506](https://github.com/angular/angular/commit/88f1168506befd0665125da1fca2a719cb27dbb5) | perf | only track LViews that are referenced in `__ngContext__` ([#45172](https://github.com/angular/angular/pull/45172)) |
| [9add714b13](https://github.com/angular/angular/commit/9add714b13740db621eb2b200d72be74cc7eb630) | refactor | remove deprecated `aotSummaries` fields in TestBed config ([#45487](https://github.com/angular/angular/pull/45487)) |
### devtools tabs
| Commit | Type | Description |
| -- | -- | -- |
| [6c284ef32e](https://github.com/angular/angular/commit/6c284ef32e53a8dabbc368b9cf69f1b6f1a377b7) | fix | stop scroll occuring at tabs level |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [2dbdebc646](https://github.com/angular/angular/commit/2dbdebc6467074c7005c09ef5c229029f8d3607c) | feat | Add `FormBuilder.nonNullable`. ([#45852](https://github.com/angular/angular/pull/45852)) |
| [e0a2248b32](https://github.com/angular/angular/commit/e0a2248b3233b5d384f33859ef6207613cad909d) | feat | Add a FormRecord type. ([#45607](https://github.com/angular/angular/pull/45607)) |
| [7ee121f595](https://github.com/angular/angular/commit/7ee121f595a47338b31098ae51a6f91d80c8fdce) | feat | Add untyped versions of the model classes for use in migration. ([#45205](https://github.com/angular/angular/pull/45205)) |
| [89d299105a](https://github.com/angular/angular/commit/89d299105a4ae11985fb809f42cd0e34511207c9) | feat | Implement strict types for the Angular Forms package. ([#43834](https://github.com/angular/angular/pull/43834)) |
| [f490c2de4e](https://github.com/angular/angular/commit/f490c2de4e1ada26e62e35c0d70cb90e55297658) | feat | support negative indices in FormArray methods. ([#44848](https://github.com/angular/angular/pull/44848)) |
| [39be06037d](https://github.com/angular/angular/commit/39be06037daf65ae9298b5bdb4cd50785c16332f) | fix | Add a `nonNullable` option to `FormControl` for consistency. |
| [4332897baa](https://github.com/angular/angular/commit/4332897baa2226ef246ee054fdd5254e3c129109) | fix | Add UntypedFormBuilder ([#45268](https://github.com/angular/angular/pull/45268)) |
| [5d13e58aed](https://github.com/angular/angular/commit/5d13e58aed8b7641f0b2d4f0c9015cb90ff4edb5) | fix | Allow NonNullableFormBuilder to be injected. ([#45904](https://github.com/angular/angular/pull/45904)) |
| [8dd3f82f94](https://github.com/angular/angular/commit/8dd3f82f946bae86dc6c678d8694ab73d915bbfa) | fix | Correct empty validator to handle objects with a property `length: 0`. ([#33729](https://github.com/angular/angular/pull/33729)) |
| [ff3f5a8d12](https://github.com/angular/angular/commit/ff3f5a8d12e3243620e311b690a050e26493e539) | fix | Fix a typing bug in FormBuilder. ([#45684](https://github.com/angular/angular/pull/45684)) |
| [fe0e42a996](https://github.com/angular/angular/commit/fe0e42a996d5b70f4c0923cb6570c9a8032b1298) | fix | Make UntypedFormBuilder assignable to FormBuilder, and vice versa. ([#45421](https://github.com/angular/angular/pull/45421)) |
| [b36dec6b5b](https://github.com/angular/angular/commit/b36dec6b5b05de0d40581726c59db9f962a97124) | fix | not picking up disabled state if group is swapped out and disabled ([#43499](https://github.com/angular/angular/pull/43499)) |
| [9f6fa5b746](https://github.com/angular/angular/commit/9f6fa5b746cbdd4a71f67728ff6b663ad26c6a29) | fix | Prevent FormBuilder from distributing unions to control types. ([#45942](https://github.com/angular/angular/pull/45942)) |
| [aa7b857be8](https://github.com/angular/angular/commit/aa7b857be89a62e6dcfe62c418acf0823525d265) | fix | Property renaming safe code ([#45271](https://github.com/angular/angular/pull/45271)) |
| [cae1e44608](https://github.com/angular/angular/commit/cae1e44608227ac80682401190c6d28ef39b3269) | fix | Update the typed forms migration to use `FormArray<T>` instead of `FormArray<T[]>`. ([#44933](https://github.com/angular/angular/pull/44933)) |
| [d336ba96d9](https://github.com/angular/angular/commit/d336ba96d922363235688f54d8af108ef7ab01f0) | fix | Update the typed forms migration. ([#45281](https://github.com/angular/angular/pull/45281)) |
| [018550ed50](https://github.com/angular/angular/commit/018550ed5025de9737794b683eb7c0697d83d430) | fix | Value and RawValue should be part of the public API. ([#45978](https://github.com/angular/angular/pull/45978)) |
| [2e96cede3e](https://github.com/angular/angular/commit/2e96cede3e2d9ac399c10d3bfe25259b92a5276e) | fix | Warn on FormControls that are constructed with both options and asyncValidators. |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [76a9a24cdc](https://github.com/angular/angular/commit/76a9a24cdcb87e36868e2e29d1831af2dec3a818) | fix | encode + signs in query params as %2B (angular[#11058](https://github.com/angular/angular/pull/11058)) ([#45111](https://github.com/angular/angular/pull/45111)) |
| [d43c0e973f](https://github.com/angular/angular/commit/d43c0e973f4389c74eb19a7f6b667bd2e1d380fe) | fix | Throw error when headers are supplied in JSONP request ([#45210](https://github.com/angular/angular/pull/45210)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [9d4af65e34](https://github.com/angular/angular/commit/9d4af65e343e41b48cb9afd12c2b61d8ca61a9ac) | feat | Provide plugin to delegate rename requests to Angular ([#44696](https://github.com/angular/angular/pull/44696)) |
| [3ae133c69e](https://github.com/angular/angular/commit/3ae133c69e1c78d5ddf772cacf222f909faccd70) | fix | Fix detection of Angular for v14+ projects ([#45998](https://github.com/angular/angular/pull/45998)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [a50e2da64a](https://github.com/angular/angular/commit/a50e2da64a4297d1bc994a267203c2097da2efaf) | fix | ensure transitively loaded compiler code is tree-shakable ([#45405](https://github.com/angular/angular/pull/45405)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [d56a537196](https://github.com/angular/angular/commit/d56a537196d2ab0f3f48821889020d2f5bc621ba) | feat | Add migration to add explicit `Route`/`Routes` type ([#45084](https://github.com/angular/angular/pull/45084)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [74a2e2e2ec](https://github.com/angular/angular/commit/74a2e2e2ecb81a31c7fbec42d7770937b09e33a4) | fix | cope with packages following APF v14+ ([#45833](https://github.com/angular/angular/pull/45833)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [a01bcb8e7e](https://github.com/angular/angular/commit/a01bcb8e7eaf63ac9466a78dd4d15228241da900) | fix | do not run change detection when loading Hammer ([#44921](https://github.com/angular/angular/pull/44921)) |
| [b32647dc68](https://github.com/angular/angular/commit/b32647dc68b055da0c49c86d6e7e2a7d2ec5954a) | fix | Make transfer state key typesafe. ([#23020](https://github.com/angular/angular/pull/23020)) |
| [c7bf75dd5e](https://github.com/angular/angular/commit/c7bf75dd5e7f3f80a3c2afb8586ae46f7258f349) | fix | remove obsolete shim for Map comparison in Jasmine ([#45521](https://github.com/angular/angular/pull/45521)) |
| [23c4c9601e](https://github.com/angular/angular/commit/23c4c9601e1bdd8bd2e37d9e0468440a44971b95) | perf | avoid including Testability by default in `bootstrapApplication` ([#45885](https://github.com/angular/angular/pull/45885)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [dff5586d52](https://github.com/angular/angular/commit/dff5586d5243f914b9054b5ab7ac71d57edfa973) | feat | implement `renderApplication` function ([#45785](https://github.com/angular/angular/pull/45785)) |
| [22c71be94c](https://github.com/angular/angular/commit/22c71be94c3a695ca0cd0316065d807abb46355f) | fix | update `renderApplication` to move `appId` to options ([#45844](https://github.com/angular/angular/pull/45844)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [f4fd1a8262](https://github.com/angular/angular/commit/f4fd1a82620b5b3899c5e8c89fa06b084ee5792e) | feat | Add `EnvironmentInjector` to `RouterOutlet.activateWith` ([#45597](https://github.com/angular/angular/pull/45597)) |
| [910de8bc33](https://github.com/angular/angular/commit/910de8bc3379b1452c0bc23a866b5108d6d94e55) | feat | Add `Route.title` with a configurable `TitleStrategy` ([#43307](https://github.com/angular/angular/pull/43307)) |
| [4e0957a4e1](https://github.com/angular/angular/commit/4e0957a4e10d1ae188faa843043a2314c9873c52) | feat | Add ability to specify providers on a Route ([#45673](https://github.com/angular/angular/pull/45673)) |
| [dea8c86cd5](https://github.com/angular/angular/commit/dea8c86cd57f8e1720634928805f9ea0ba8f0baa) | feat | add ariaCurrentWhenActive input to RouterLinkActive directive ([#45167](https://github.com/angular/angular/pull/45167)) |
| [41e2a68e30](https://github.com/angular/angular/commit/41e2a68e30c12e5ad3e26047c3a4032e9aa1a6e1) | feat | add type properties to all router events ([#44189](https://github.com/angular/angular/pull/44189)) |
| [4962a4a332](https://github.com/angular/angular/commit/4962a4a3324d5972f364d768b38b21a33fdb7d7c) | feat | Allow `loadChildren` to return a `Route` array ([#45700](https://github.com/angular/angular/pull/45700)) |
| [791bd31424](https://github.com/angular/angular/commit/791bd3142432ed7caf14a68a6e434b27004e634b) | feat | set stricter type for Route.title ([#44939](https://github.com/angular/angular/pull/44939)) |
| [50004c143b](https://github.com/angular/angular/commit/50004c143ba9b1e041c7b30caf98f6582d3d26d4) | feat | Support lazy loading standalone components with `loadComponent` ([#45705](https://github.com/angular/angular/pull/45705)) |
| [7fd416d060](https://github.com/angular/angular/commit/7fd416d060bd873bc88dffed41946c51aa649ec1) | fix | Fix type of Route.pathMatch to be more accurate ([#45176](https://github.com/angular/angular/pull/45176)) |
| [1c11a57155](https://github.com/angular/angular/commit/1c11a5715576632a4fb7170202395cf95dfbce09) | fix | merge interited resolved data and static data ([#45276](https://github.com/angular/angular/pull/45276)) |
| [f8f3ab377b](https://github.com/angular/angular/commit/f8f3ab377b8842c2bae0f215a0e90aaa3a1e070a) | fix | Remove `any` from `LoadChildrenCallback` type ([#45524](https://github.com/angular/angular/pull/45524)) |
| [d4fc12fa19](https://github.com/angular/angular/commit/d4fc12fa19dbe5e89189bb52c37e5d37a00a663c) | fix | Remove deprecated initialNavigation option ([#45729](https://github.com/angular/angular/pull/45729)) |
| [989e840cce](https://github.com/angular/angular/commit/989e840cce7ebe94311ae898786e09b1b41ce7f6) | fix | Remove unused string type for ActivatedRoute.component ([#45625](https://github.com/angular/angular/pull/45625)) |
| [64f837d2c0](https://github.com/angular/angular/commit/64f837d2c0fbcf722d32b35a87e87220bfe61f65) | fix | Update `Navigation#initialUrl` to match documentation and reality ([#43863](https://github.com/angular/angular/pull/43863)) |
| [96fd29c6d2](https://github.com/angular/angular/commit/96fd29c6d2d2abc5afee4d21a3e964a79aa39844) | fix | validate lazy loaded configs ([#45526](https://github.com/angular/angular/pull/45526)) |
| [f13295f3a3](https://github.com/angular/angular/commit/f13295f3a3a1d622d15cf8339360d53feba824b5) | perf | cancel the navigation instantly if at least one resolver doesn't emit any value ([#45621](https://github.com/angular/angular/pull/45621)) |
| [1d2f5c1101](https://github.com/angular/angular/commit/1d2f5c1101ccd182f5b528de52583a1b98dd6789) | refactor | deprecate no longer needed resolver fields ([#45597](https://github.com/angular/angular/pull/45597)) |
| [7b367d9d90](https://github.com/angular/angular/commit/7b367d9d908e15222645a45e2ba133b9d9da76b7) | refactor | Remove unnecessary setTimeout in UrlTree redirects ([#45735](https://github.com/angular/angular/pull/45735)) |
| [c9679760b2](https://github.com/angular/angular/commit/c9679760b2bf5c607c957c20482b9cea7a21702b) | refactor | take only the first emitted value of every resolver to make it consistent with guards ([#44573](https://github.com/angular/angular/pull/44573)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [ec0a0e0669](https://github.com/angular/angular/commit/ec0a0e0669ef5d2f524fbf9a540eb2b306b2e24a) | feat | add `cacheOpaqueResponses` option for data-groups ([#44723](https://github.com/angular/angular/pull/44723)) |
| [bd04fbc05b](https://github.com/angular/angular/commit/bd04fbc05b0397de966a493a863e1054203c86d9) | feat | emit a notification when the service worker is already up-to-date after check ([#45216](https://github.com/angular/angular/pull/45216)) |
## Special Thanks
Adrian Kunz, Alan Agius, AleksanderBodurri, Alex Rickabaugh, AlirezaEbrahimkhani, Amir Rustamzadeh, Andrew Kushnir, Andrew Scott, Chabbey François, Charles Lyding, Cédric Exbrayat, Daan De Smedt, David Schmidt, Derek Cormier, Dmitrij Kuba, Doug Parker, Dylan Hunn, Emma Twersky, George Kalpakas, George Looshch, Jan Kuehle, Jessica Janiuk, JiaLiPassion, JimMorrison723, Joe Martin (Crowdstaffing), Joey Perrott, JoostK, Kristiyan Kostadinov, Krzysztof Platis, Leosvel Pérez Espinosa, Maddie Klein, Mark Whitfeld, Martin Sikora, Michael-Doner, Michal Materowski, Minko Gechev, Paul Gschwendtner, Pawel Kozlowski, Payam Shahidi, Pusztai Tibor, Ricardo Mattiazzi Baumgartner, Roy Dorombozi, Ruslan Lekhman, Samuel Littley, Sergej Grilborzer, Sumit Arora, Tobias Speicher, Virginia Dooley, Zack Elliott, alirezaghey, ananyahs96, arturovt, cexbrayat, dario-piotrowicz, ivanwonder, kamikopi, markostanimirovic, markwhitfeld, mgechev, renovate[bot], twerske and zverbeta



Earlier changelog entries can be found in CHANGELOG_ARCHIVE.md file.