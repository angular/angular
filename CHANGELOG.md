<a name="13.0.0-next.0"></a>
# 13.0.0-next.0 (2021-08-04)
### compiler-cli
| Commit | Description |
| -- | -- |
| [ed9cfb674f](https://github.com/angular/angular/commit/ed9cfb674f8e52b416ccdaf9aa9c46955b8448f5) | fix(compiler-cli): use correct module resolution context for absolute imports in .d.ts files ([#42879](https://github.com/angular/angular/pull/42879)) |
| [5fb23eccea](https://github.com/angular/angular/commit/5fb23ecceaccf0629308dd50210b65f67d51f024) | perf(compiler-cli): skip analysis in incremental builds for files without Angular behavior ([#42562](https://github.com/angular/angular/pull/42562)) |
### core
| Commit | Description |
| -- | -- |
| [8628826535](https://github.com/angular/angular/commit/8628826535233ba5bc6b973cef860355b4c41931) | fix(core): incorrect error reported when trying to re-create view which had an error during creation ([#43005](https://github.com/angular/angular/pull/43005)) |
| [eefe1682e8](https://github.com/angular/angular/commit/eefe1682e8099b73b6e50bb227b5a7f63105c63d) | fix(core): correctly handle `null` or `undefined` in `ErrorHandler#handleError()` ([#42881](https://github.com/angular/angular/pull/42881)) |
### forms
| Commit | Description |
| -- | -- |
| [1d9d02696e](https://github.com/angular/angular/commit/1d9d02696eadbee2c2f719e432efca22f1e494e9) | feat(forms): add hasValidators, addValidators, and removeValidators methods (for both sync and async) ([#42838](https://github.com/angular/angular/pull/42838)) |
| [a502279592](https://github.com/angular/angular/commit/a50227959222f39884aac284544d1626aee5ca64) | feat(forms): allow minLength/maxLength validator to be bound to `null` ([#42565](https://github.com/angular/angular/pull/42565)) |
### language-service
| Commit | Description |
| -- | -- |
| [f0c5ba08f6](https://github.com/angular/angular/commit/f0c5ba08f63c60f7542dfd3592c4cfd42bd579bc) | fix(language-service): global autocomplete doesn't work when the user tries to modify the symbol ([#42923](https://github.com/angular/angular/pull/42923)) |
| [7c35ca0e00](https://github.com/angular/angular/commit/7c35ca0e0030f2ded12ddca9092e31f510cebeb1) | feat(language-service): support autocomplete string literal union types in templates ([#42729](https://github.com/angular/angular/pull/42729)) |
### router
| Commit | Description |
| -- | -- |
| [0d81b007e4](https://github.com/angular/angular/commit/0d81b007e48a0ac801d2614601fb8180a3517865) | fix(router): add missing outlet events to RouterOutletContract ([#42431](https://github.com/angular/angular/pull/42431)) |
| [dbae00195e](https://github.com/angular/angular/commit/dbae00195e114ac8b967201283962a7e2c0581b4) | feat(router): ability to provide custom route reuse strategy via DI for `RouterTestingModule` ([#42434](https://github.com/angular/angular/pull/42434)) |
## Special Thanks:
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Daniel Trevino, Dmitrij Kuba, Dylan Hunn, George Kalpakas, Joe Martin, Joey Perrott, JoostK, Kristiyan Kostadinov, Nichola Alkhouri, Paul Gschwendtner, Pete Bacon Darwin, Steven Masala, Teri Glover, Vladyslav, Yuvaraj, atscott, codebriefcase, dario-piotrowicz, iRealNirmal and ivanwonder


<a name="12.2.0"></a>
# 12.2.0 (2021-08-04)
### core
| Commit | Description |
| -- | -- |
| [bd7f0d8b70](https://github.com/angular/angular/commit/bd7f0d8b70150a7e4e7550f4380a2e731cf2b942) | fix(core): incorrect error reported when trying to re-create view which had an error during creation ([#43005](https://github.com/angular/angular/pull/43005)) |
### language-service
| Commit | Description |
| -- | -- |
| [aace1e71d8](https://github.com/angular/angular/commit/aace1e71d8fb5e1e52fcd86e2a26892d1016c43e) | fix(language-service): global autocomplete doesn't work when the user tries to modify the symbol ([#42923](https://github.com/angular/angular/pull/42923)) |
## Special Thanks:
Alex Rickabaugh, Joe Martin, Joey Perrott, Kristiyan Kostadinov, Nichola Alkhouri, Paul Gschwendtner, Pete Bacon Darwin, atscott, dario-piotrowicz and ivanwonder


<a name="12.1.5"></a>
# 12.1.5 (2021-08-04)
This release contains various API docs improvements.


<a name="12.2.0-rc.0"></a>
# 12.2.0-rc.0 (2021-07-28)
### compiler-cli
| Commit | Description |
| -- | -- |
| [ed9cfb674f](https://github.com/angular/angular/commit/ed9cfb674f8e52b416ccdaf9aa9c46955b8448f5) | fix(compiler-cli): use correct module resolution context for absolute imports in .d.ts files ([#42879](https://github.com/angular/angular/pull/42879)) |
| [5fb23eccea](https://github.com/angular/angular/commit/5fb23ecceaccf0629308dd50210b65f67d51f024) | perf(compiler-cli): skip analysis in incremental builds for files without Angular behavior ([#42562](https://github.com/angular/angular/pull/42562)) |
### core
| Commit | Description |
| -- | -- |
| [eefe1682e8](https://github.com/angular/angular/commit/eefe1682e8099b73b6e50bb227b5a7f63105c63d) | fix(core): correctly handle `null` or `undefined` in `ErrorHandler#handleError()` ([#42881](https://github.com/angular/angular/pull/42881)) |
### forms
| Commit | Description |
| -- | -- |
| [1d9d02696e](https://github.com/angular/angular/commit/1d9d02696eadbee2c2f719e432efca22f1e494e9) | feat(forms): add hasValidators, addValidators, and removeValidators methods (for both sync and async) ([#42838](https://github.com/angular/angular/pull/42838)) |
| [a502279592](https://github.com/angular/angular/commit/a50227959222f39884aac284544d1626aee5ca64) | feat(forms): allow minLength/maxLength validator to be bound to `null` ([#42565](https://github.com/angular/angular/pull/42565)) |
### language-service
| Commit | Description |
| -- | -- |
| [7c35ca0e00](https://github.com/angular/angular/commit/7c35ca0e0030f2ded12ddca9092e31f510cebeb1) | feat(language-service): support autocomplete string literal union types in templates ([#42729](https://github.com/angular/angular/pull/42729)) |
### router
| Commit | Description |
| -- | -- |
| [0d81b007e4](https://github.com/angular/angular/commit/0d81b007e48a0ac801d2614601fb8180a3517865) | fix(router): add missing outlet events to RouterOutletContract ([#42431](https://github.com/angular/angular/pull/42431)) |
| [dbae00195e](https://github.com/angular/angular/commit/dbae00195e114ac8b967201283962a7e2c0581b4) | feat(router): ability to provide custom route reuse strategy via DI for `RouterTestingModule` ([#42434](https://github.com/angular/angular/pull/42434)) |
## Special Thanks:
Andrew Scott, Daniel Trevino, Dmitrij Kuba, Dylan Hunn, George Kalpakas, Joey Perrott, JoostK, Paul Gschwendtner, Pete Bacon Darwin, Steven Masala, Teri Glover, Vladyslav, Yuvaraj, codebriefcase, iRealNirmal and ivanwonder


<a name="12.1.4"></a>
# 12.1.4 (2021-07-28)
### compiler-cli
| Commit | Description |
| -- | -- |
| [77ae4459d3](https://github.com/angular/angular/commit/77ae4459d34515493ddf62c7ecdf237260176809) | fix(compiler-cli): use correct module resolution context for absolute imports in .d.ts files ([#42879](https://github.com/angular/angular/pull/42879)) |
| [f589b01672](https://github.com/angular/angular/commit/f589b01672d13c1a174b880437d00a910899f29d) | perf(compiler-cli): skip analysis in incremental builds for files without Angular behavior ([#42562](https://github.com/angular/angular/pull/42562)) |
### core
| Commit | Description |
| -- | -- |
| [a779a1029b](https://github.com/angular/angular/commit/a779a1029b90039ea39d579ecbc98812c301080a) | fix(core): correctly handle `null` or `undefined` in `ErrorHandler#handleError()` ([#42881](https://github.com/angular/angular/pull/42881)) |
## Special Thanks:
Andrew Scott, Daniel Trevino, Dylan Hunn, George Kalpakas, Joey Perrott, JoostK, Paul Gschwendtner, Pete Bacon Darwin, Teri Glover, Vladyslav, Yuvaraj and codebriefcase

<a name="12.2.0-next.3"></a>
# 12.2.0-next.3 (2021-07-21)
### animations
| Commit | Description |
| -- | -- |
| [f12c53342c](https://github.com/angular/angular/commit/f12c53342c433eb8ef5650c78f0115f82f5b1567) | fix(animations): normalize final styles in buildStyles ([#42763](https://github.com/angular/angular/pull/42763)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [70c3461be3](https://github.com/angular/angular/commit/70c3461be38765efedac1e4c5dd1156023a29690) | fix(compiler-cli): use correct module import for types behind a `forwardRef` ([#42887](https://github.com/angular/angular/pull/42887)) |
| [07d7e6034f](https://github.com/angular/angular/commit/07d7e6034f2a9adae643b3a8e64e2cc794596c8c) | perf(compiler-cli): optimize cycle detection using a persistent cache ([#41271](https://github.com/angular/angular/pull/41271)) |
### core
| Commit | Description |
| -- | -- |
| [307dac67bc](https://github.com/angular/angular/commit/307dac67bc933ab3b017333b3085af8fba8193dc) | fix(core): use correct injector when resolving DI tokens from within a directive provider factory ([#42886](https://github.com/angular/angular/pull/42886)) |
## Special Thanks:
Alan Agius, Alex Rickabaugh, David Shevitz, George Kalpakas, Joey Perrott, JoostK, Krzysztof Kotowicz, Minko Gechev, Paul Gschwendtner and dario-piotrowicz

<a name="12.1.3"></a>
# 12.1.3 (2021-07-21)
### animations
| Commit | Description |
| -- | -- |
| [3cddc3d6bc](https://github.com/angular/angular/commit/3cddc3d6bc1045b76980ba3e866350d58deb0718) | fix(animations): normalize final styles in buildStyles ([#42763](https://github.com/angular/angular/pull/42763)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [d207ea06d1](https://github.com/angular/angular/commit/d207ea06d1bb554e822bab2eadcf12ef50117bd4) | fix(compiler-cli): use correct module import for types behind a `forwardRef` ([#42887](https://github.com/angular/angular/pull/42887)) |
| [e6d520f3d9](https://github.com/angular/angular/commit/e6d520f3d9104c63129b94fbf5fe54b392715fc5) | perf(compiler-cli): optimize cycle detection using a persistent cache ([#41271](https://github.com/angular/angular/pull/41271)) |
### core
| Commit | Description |
| -- | -- |
| [a6db152c78](https://github.com/angular/angular/commit/a6db152c78bc82ef39e529ab5ea55f810b17fa2e) | fix(core): use correct injector when resolving DI tokens from within a directive provider factory ([#42886](https://github.com/angular/angular/pull/42886)) |
## Special Thanks:
Alan Agius, David Shevitz, George Kalpakas, Joey Perrott, JoostK, Krzysztof Kotowicz, Minko Gechev, Paul Gschwendtner and dario-piotrowicz


<a name="12.2.0-next.2"></a>
# 12.2.0-next.2 (2021-07-14)
### bazel
| Commit | Description |
| -- | -- |
| [7e04116d15](https://github.com/angular/angular/commit/7e04116d1572b5b2b7862ba037f90ab6142a927f) | fix(bazel): enable dts bundling for Ivy packages ([#42728](https://github.com/angular/angular/pull/42728)) |
### common
| Commit | Description |
| -- | -- |
| [e42aa6c13b](https://github.com/angular/angular/commit/e42aa6c13b9f1f8f5b2e8c27e97380bf574db873) | fix(common): re-sort output of `KeyValuePipe` when `compareFn` changes ([#42821](https://github.com/angular/angular/pull/42821)) |
### compiler
| Commit | Description |
| -- | -- |
| [b33665ab2c](https://github.com/angular/angular/commit/b33665ab2c7c8c5536b5dc4f488a457100524dc3) | fix(compiler): add mappings for all HTML entities ([#42818](https://github.com/angular/angular/pull/42818)) |
| [404c8d0d88](https://github.com/angular/angular/commit/404c8d0d88b88ae3ab5a80609d508fb2ecdf0d27) | fix(compiler): incorrect context object being referenced from listener instructions inside embedded views ([#42755](https://github.com/angular/angular/pull/42755)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [81dce5c664](https://github.com/angular/angular/commit/81dce5c6649ddc56903a37ef6a26dcd3ee37df96) | fix(compiler-cli): check split two way binding ([#42601](https://github.com/angular/angular/pull/42601)) |
| [4c482bf3f1](https://github.com/angular/angular/commit/4c482bf3f1768a18b35e0648c91029504a8d8649) | fix(compiler-cli): properly emit literal types when recreating type parameters in a different file ([#42761](https://github.com/angular/angular/pull/42761)) |
| [30c82cd177](https://github.com/angular/angular/commit/30c82cd17757f41d56afe71f69a90ac812a3201f) | fix(compiler-cli): inline type checking instructions no longer prevent incremental reuse ([#42759](https://github.com/angular/angular/pull/42759)) |
| [4c78984ad2](https://github.com/angular/angular/commit/4c78984ad26825851d78d6f0339d8e4cb7bf1e54) | fix(compiler-cli): support reflecting namespace declarations ([#42728](https://github.com/angular/angular/pull/42728)) |
| [74350a5cf1](https://github.com/angular/angular/commit/74350a5cf1035f0d33640dce845a1f78aa33f009) | fix(compiler-cli): return directives for an element on a microsyntax template ([#42640](https://github.com/angular/angular/pull/42640)) |
### core
| Commit | Description |
| -- | -- |
| [cd2d82a91a](https://github.com/angular/angular/commit/cd2d82a91a5f547ae4c3d369f7f777245324c9e5) | fix(core): associate the NgModule scope for an overridden component ([#42817](https://github.com/angular/angular/pull/42817)) |
| [51156f3f07](https://github.com/angular/angular/commit/51156f3f0798fe5bc6f69cf38ba2f2947aab89aa) | fix(core): allow proper type inference when `ngFor` is used with a `trackBy` function ([#42692](https://github.com/angular/angular/pull/42692)) |
| [0f23f7343e](https://github.com/angular/angular/commit/0f23f7343ec9bdcd2d40f6f474d2a4f5e38e2627) | fix(core): error in TestBed if module is reset mid-compilation in ViewEngine ([#42669](https://github.com/angular/angular/pull/42669)) |
### language-service
| Commit | Description |
| -- | -- |
| [ffeea63f43](https://github.com/angular/angular/commit/ffeea63f43e6a7fd46be4a8cd5a5d254c98dea08) | fix(language-service): Do not override TS LS methods not supported by VE NgLS ([#42727](https://github.com/angular/angular/pull/42727)) |
### service-worker
| Commit | Description |
| -- | -- |
| [cb2ca9a66e](https://github.com/angular/angular/commit/cb2ca9a66ef54d9f1b3df5ac14962dc3810b4cc1) | fix(service-worker): correctly handle unrecoverable state when a client no longer exists ([#42736](https://github.com/angular/angular/pull/42736)) |
| [f592a12005](https://github.com/angular/angular/commit/f592a120057c3787ad6b7385b6f8e10928627e9e) | fix(service-worker): avoid storing redundant metadata for hashed assets ([#42606](https://github.com/angular/angular/pull/42606)) |
## Special Thanks:
Alan Agius, Andrew Kushnir, Andrew Scott, Arthur Ming, Bastian, Borislav Ivanov, Daniel Trevino, David Gilson, David Shevitz, Gabriele Franchitto, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Mark Goho, Meir Blumenfeld, Paul Gschwendtner, Pete Bacon Darwin, Ryan Andersen, Theoklitos Bampouris, behrooz bozorg chami, dario-piotrowicz, ivanwonder and mgechev


<a name="12.1.2"></a>
# 12.1.2 (2021-07-14)
### bazel
| Commit | Description |
| -- | -- |
| [4a8ab4f149](https://github.com/angular/angular/commit/4a8ab4f1499a560bb4373b088785e43f26384e1c) | fix(bazel): enable dts bundling for Ivy packages ([#42728](https://github.com/angular/angular/pull/42728)) |
### common
| Commit | Description |
| -- | -- |
| [d654c7933a](https://github.com/angular/angular/commit/d654c7933a732c23dc1e68b17766457d2d11a4d8) | fix(common): re-sort output of `KeyValuePipe` when `compareFn` changes ([#42821](https://github.com/angular/angular/pull/42821)) |
### compiler
| Commit | Description |
| -- | -- |
| [2566cbb48c](https://github.com/angular/angular/commit/2566cbb48cddd23c4b29d01ad557bc71ac716700) | fix(compiler): add mappings for all HTML entities ([#42818](https://github.com/angular/angular/pull/42818)) |
| [65330f03a9](https://github.com/angular/angular/commit/65330f03a92f2743719d0e0d4cedcaadbb8c5b21) | fix(compiler): incorrect context object being referenced from listener instructions inside embedded views ([#42755](https://github.com/angular/angular/pull/42755)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [17d3de25da](https://github.com/angular/angular/commit/17d3de25daf339612c267001f0c2237533d7c789) | fix(compiler-cli): properly emit literal types when recreating type parameters in a different file ([#42761](https://github.com/angular/angular/pull/42761)) |
| [0a17e98ae2](https://github.com/angular/angular/commit/0a17e98ae2813338f03e3e01bb7cfa6024f4632b) | fix(compiler-cli): inline type checking instructions no longer prevent incremental reuse ([#42759](https://github.com/angular/angular/pull/42759)) |
| [45116097c1](https://github.com/angular/angular/commit/45116097c1dafd902014e0f680e0d50023467883) | fix(compiler-cli): support reflecting namespace declarations ([#42728](https://github.com/angular/angular/pull/42728)) |
| [df5cc1fbbf](https://github.com/angular/angular/commit/df5cc1fbbf1b1f02f1f45603552a2530bb59688d) | fix(compiler-cli): return directives for an element on a microsyntax template ([#42640](https://github.com/angular/angular/pull/42640)) |
### core
| Commit | Description |
| -- | -- |
| [63013546e1](https://github.com/angular/angular/commit/63013546e130d823db26ad96e1d4cb346e633a03) | fix(core): associate the NgModule scope for an overridden component ([#42817](https://github.com/angular/angular/pull/42817)) |
| [9ebd41e39c](https://github.com/angular/angular/commit/9ebd41e39c597ef6df2de2fb63d6458337e2757d) | fix(core): allow proper type inference when `ngFor` is used with a `trackBy` function ([#42692](https://github.com/angular/angular/pull/42692)) |
| [41c6877c01](https://github.com/angular/angular/commit/41c6877c013ba84ba5e46309b2310c097ad9e354) | fix(core): error in TestBed if module is reset mid-compilation in ViewEngine ([#42669](https://github.com/angular/angular/pull/42669)) |
### language-service
| Commit | Description |
| -- | -- |
| [97c18f4527](https://github.com/angular/angular/commit/97c18f4527187206db8b0f5730b80d2220027f9f) | fix(language-service): Do not override TS LS methods not supported by VE NgLS ([#42727](https://github.com/angular/angular/pull/42727)) |
### service-worker
| Commit | Description |
| -- | -- |
| [d87917542a](https://github.com/angular/angular/commit/d87917542a00ed6f58c7b95e3eba6aeddc5eee01) | fix(service-worker): correctly handle unrecoverable state when a client no longer exists ([#42736](https://github.com/angular/angular/pull/42736)) |
| [f2523a8fef](https://github.com/angular/angular/commit/f2523a8fef549fab6ec480ecfc966c9d938a5423) | fix(service-worker): avoid storing redundant metadata for hashed assets ([#42606](https://github.com/angular/angular/pull/42606)) |
## Special Thanks:
Alan Agius, Andrew Kushnir, Andrew Scott, Arthur Ming, Bastian, Borislav Ivanov, David Gilson, David Shevitz, Gabriele Franchitto, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Mark Goho, Meir Blumenfeld, Paul Gschwendtner, Pete Bacon Darwin, Ryan Andersen, Theoklitos Bampouris, behrooz bozorg chami, dario-piotrowicz, ivanwonder and mgechev


<a name="12.2.0-next.1"></a>
# 12.2.0-next.1 (2021-06-30)
### compiler
| Commit | Description |
| -- | -- |
| [9f5cc7c808](https://github.com/angular/angular/commit/9f5cc7c808458f312543c7c044fe7a361cdc7798) | feat(compiler): support number separators in templates ([#42672](https://github.com/angular/angular/pull/42672)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [37a740c659](https://github.com/angular/angular/commit/37a740c6590b7725053f8578d39e53ecba4f5727) | fix(compiler-cli): add support for partially evaluating types ([#41661](https://github.com/angular/angular/pull/41661)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [234b5edcc7](https://github.com/angular/angular/commit/234b5edcc7d24cfe5d418f93181844cdf12e5ec8) | fix(platform-browser): in `Meta.addTag()` do not add duplicate meta tags ([#42703](https://github.com/angular/angular/pull/42703)) |
## Special Thanks:
Alan Agius, Alex Rickabaugh, Dario Piotrowicz, George Kalpakas, George Looshch, Joey Perrott, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, Paul Gschwendtner, Pete Bacon Darwin, Zach Arend, codebriefcase, dario-piotrowicz, marvinbeckert, mgechev and pavlenko


<a name="12.1.1"></a>
# 12.1.1 (2021-06-30)
### compiler-cli
| Commit | Description |
| -- | -- |
| [f6b828e292](https://github.com/angular/angular/commit/f6b828e292fe29108abcf8aa63c61f5677c2ef70) | fix(compiler-cli): add support for partially evaluating types ([#41661](https://github.com/angular/angular/pull/41661)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [d19ddd1a87](https://github.com/angular/angular/commit/d19ddd1a87127c3eaa6f5a832af3db2eb52793cd) | fix(platform-browser): in `Meta.addTag()` do not add duplicate meta tags ([#42703](https://github.com/angular/angular/pull/42703)) |
## Special Thanks:
Alan Agius, Dario Piotrowicz, George Kalpakas, George Looshch, Lars Gyrup Brink Nielsen, Paul Gschwendtner, Pete Bacon Darwin, Zach Arend, codebriefcase, dario-piotrowicz, marvinbeckert, mgechev and pavlenko


<a name="12.2.0-next.0"></a>
# 12.2.0-next.0 (2021-06-24)

This release contains the same set of changes as 12.1.0.


<a name="12.1.0"></a>
# 12.1.0 (2021-06-24)
### compiler
| Commit | Description |
| -- | -- |
| [9de65dbdce](https://github.com/angular/angular/commit/9de65dbdceac3077881fbc49717f33d0f379e21d) | fix(compiler): should not break a text token on a non-valid start tag ([#42605](https://github.com/angular/angular/pull/42605)) |
| [c873440ad2](https://github.com/angular/angular/commit/c873440ad285279edafff65645a73f5da8e5bafe) | fix(compiler): do not allow unterminated interpolation to leak into later tokens ([#42605](https://github.com/angular/angular/pull/42605)) |
| [cc672f05bf](https://github.com/angular/angular/commit/cc672f05bf4e2f03fa415ebd2d69514594c9bc9d) | feat(compiler): add support for shorthand property declarations in templates ([#42421](https://github.com/angular/angular/pull/42421)) |
| [f52df99fe3](https://github.com/angular/angular/commit/f52df99fe369854c4ee49e3c01afa29cf2ae7126) | fix(compiler): generate view restoration for keyed write inside template listener ([#42603](https://github.com/angular/angular/pull/42603)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [874de59d35](https://github.com/angular/angular/commit/874de59d35e03114867611abe41e662e7bc9b138) | fix(compiler-cli): change default ngcc  hash algorithm to be FIPS compliant ([#42582](https://github.com/angular/angular/pull/42582)) |
| [729eea5716](https://github.com/angular/angular/commit/729eea57165f8931f3d2ea7b7c09d6c094968ad4) | fix(compiler-cli): transform type references in generic type parameter default ([#42492](https://github.com/angular/angular/pull/42492)) |
### core
| Commit | Description |
| -- | -- |
| [873229f24b](https://github.com/angular/angular/commit/873229f24be292ac9e909993e28c2ae2cef4033a) | feat(core): add opt-in test module teardown configuration ([#42566](https://github.com/angular/angular/pull/42566)) |
### router
| Commit | Description |
| -- | -- |
| [07c1ddc487](https://github.com/angular/angular/commit/07c1ddc48775967190b9c50530bae20c97140c0f) | fix(router): error if module is destroyed before location is initialized ([#42560](https://github.com/angular/angular/pull/42560)) |
### service-worker
| Commit | Description |
| -- | -- |
| [cc30dc0713](https://github.com/angular/angular/commit/cc30dc0713d6976426114968caa1be3e782df0d4) | fix(service-worker): ensure obsolete caches are always cleaned up ([#42622](https://github.com/angular/angular/pull/42622)) |
| [01128f5b5d](https://github.com/angular/angular/commit/01128f5b5d7e6cbca8f4844672b51565c19ba8e7) | fix(service-worker): ensure caches are cleaned up when failing to load state ([#42622](https://github.com/angular/angular/pull/42622)) |
| [73b0275dc2](https://github.com/angular/angular/commit/73b0275dc2dd64bbb39be3a8079b418a40e89cfd) | fix(service-worker): improve ServiceWorker cache names ([#42622](https://github.com/angular/angular/pull/42622)) |
| [7507ed2e54](https://github.com/angular/angular/commit/7507ed2e54b0d33aeec32e63126e3212dd2d911a) | fix(service-worker): use correct names when listing `CacheDatabase` tables ([#42622](https://github.com/angular/angular/pull/42622)) |
| [53fe557da7](https://github.com/angular/angular/commit/53fe557da743992943f520c860d2f093eecc429e) | feat(service-worker): include ServiceWorker version in debug info ([#42622](https://github.com/angular/angular/pull/42622)) |
| [d546501ab5](https://github.com/angular/angular/commit/d546501ab5df6d738bede85ea949053513e02849) | feat(service-worker): add `openWindow`, `focusLastFocusedOrOpen` and `navigateLastFocusedOrOpen` ([#42520](https://github.com/angular/angular/pull/42520)) |
| [9498da1038](https://github.com/angular/angular/commit/9498da1038ffa854effa672fac3a898039853375) | fix(service-worker): correctly determine client ID on navigation requests ([#42607](https://github.com/angular/angular/pull/42607)) |
## Special Thanks:
Alex Rickabaugh, Dale Harris, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Németh Tamás, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Umair Hafeez, codingnuclei and mgechev

<a name="12.1.0-next.6"></a>
# 12.1.0-next.6 (2021-06-16)
### compiler
| Commit | Description |
| -- | -- |
| [8c1e0e6ad0](https://github.com/angular/angular/commit/8c1e0e6ad0eba7ece827d899311cf7d25f64db1a) | fix(compiler): always match close tag to the nearest open element ([#42554](https://github.com/angular/angular/pull/42554)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [22bda2226b](https://github.com/angular/angular/commit/22bda2226bd42d081b7314c1b11144ad79ad1c44) | fix(compiler-cli): prevent prior compilations from being retained in watch builds ([#42537](https://github.com/angular/angular/pull/42537)) |
### core
| Commit | Description |
| -- | -- |
| [3961b3c360](https://github.com/angular/angular/commit/3961b3c3606bb835e539c66d5ac8d91d2a9b0f80) | fix(core): ensure that autoRegisterModuleById registration in ɵɵdefineNgModule is not DCE-ed by closure ([#42529](https://github.com/angular/angular/pull/42529)) |
### forms
| Commit | Description |
| -- | -- |
| [7180ec9e7c](https://github.com/angular/angular/commit/7180ec9e7c3e33c1acfba1f40190d2de804c062e) | fix(forms): changes to status not always being emitted to statusChanges observable for async validators. ([#42553](https://github.com/angular/angular/pull/42553)) |
### language-service
| Commit | Description |
| -- | -- |
| [4001e9d808](https://github.com/angular/angular/commit/4001e9d80852101a30b1adb1e501438b5846c463) | fix(language-service): 'go to defininition' for objects defined in template ([#42559](https://github.com/angular/angular/pull/42559)) |
| [228beeabd1](https://github.com/angular/angular/commit/228beeabd1542941cbfff46ad78d52c1df3d283a) | fix(language-service): Use last child end span for parent without close tag ([#42554](https://github.com/angular/angular/pull/42554)) |
## Special Thanks:
Ahmed Ayed, Alan Agius, Alex Rickabaugh, Andrew Scott, Ankit Choudhary, Aristeidis Bampakos, Daniel Trevino, Dario Piotrowicz, Dylan Hunn, George Kalpakas, Igor Minar, JiaLiPassion, JoostK, Kapunahele Wong, Kristiyan Kostadinov, Marius Bethge, Mladen Jakovljević, Paul Gschwendtner, Pete Bacon Darwin, Pham Huu Hien, Renovate Bot, dario-piotrowicz and gobika21f


<a name="12.0.5"></a>
# 12.0.5 (2021-06-16)
### compiler
| Commit | Description |
| -- | -- |
| [89fc131ef8](https://github.com/angular/angular/commit/89fc131ef87ef0dca4c95960e2b5e3d7cf77070c) | fix(compiler): always match close tag to the nearest open element ([#42554](https://github.com/angular/angular/pull/42554)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [60dbf017fb](https://github.com/angular/angular/commit/60dbf017fbca5de55f9e5e95044d780740a0e4b8) | fix(compiler-cli): prevent prior compilations from being retained in watch builds ([#42537](https://github.com/angular/angular/pull/42537)) |
### core
| Commit | Description |
| -- | -- |
| [785da0f1bf](https://github.com/angular/angular/commit/785da0f1bfa163b232009b4c9123b26b545a09dc) | fix(core): ensure that autoRegisterModuleById registration in ɵɵdefineNgModule is not DCE-ed by closure ([#42529](https://github.com/angular/angular/pull/42529)) |
### forms
| Commit | Description |
| -- | -- |
| [6f1b907b79](https://github.com/angular/angular/commit/6f1b907b79eaf386f63affc16791bf92a7fea1ab) | fix(forms): changes to status not always being emitted to statusChanges observable for async validators. ([#42553](https://github.com/angular/angular/pull/42553)) |
### language-service
| Commit | Description |
| -- | -- |
| [8192f1e1c2](https://github.com/angular/angular/commit/8192f1e1c2283e2bd07759a6d507c0c79685a4eb) | fix(language-service): 'go to defininition' for objects defined in template ([#42559](https://github.com/angular/angular/pull/42559)) |
| [11e0f53352](https://github.com/angular/angular/commit/11e0f533527ef89dc825a0dd73b652a4ccbdf58b) | fix(language-service): Use last child end span for parent without close tag ([#42554](https://github.com/angular/angular/pull/42554)) |
## Special Thanks:
Ahmed Ayed, Alan Agius, Andrew Scott, Ankit Choudhary, Aristeidis Bampakos, Daniel Trevino, Dario Piotrowicz, Dylan Hunn, George Kalpakas, Igor Minar, JiaLiPassion, JoostK, Kapunahele Wong, Kristiyan Kostadinov, Marius Bethge, Pete Bacon Darwin, Pham Huu Hien, dario-piotrowicz and gobika21


<a name="12.1.0-next.5"></a>
# 12.1.0-next.5 (2021-06-09)
### common
| Commit | Description |
| -- | -- |
| [85c7f7691e](https://github.com/angular/angular/commit/85c7f7691e7d4358acff2c0ab5e26cda415a8483) | fix(common): infer correct type when `trackBy` is used in `ngFor` ([#41995](https://github.com/angular/angular/pull/41995)) |
| [374fa2c26f](https://github.com/angular/angular/commit/374fa2c26f56cd7c82b3e62a079fa785f11ac624) | fix(common): initialize currencyCode in currencyPipe ([#40505](https://github.com/angular/angular/pull/40505)) |
### compiler
| Commit | Description |
| -- | -- |
| [afd68e5674](https://github.com/angular/angular/commit/afd68e5674e99a64fe5acc40e08cc8386dc6a454) | feat(compiler): emit diagnostic for shadow dom components with an invalid selector ([#42245](https://github.com/angular/angular/pull/42245)) |
| [ba084857ea](https://github.com/angular/angular/commit/ba084857ea018a4a77cfc855f0276dcaa2a0c2fa) | feat(compiler): support safe keyed read expressions ([#41911](https://github.com/angular/angular/pull/41911)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [bd1836b999](https://github.com/angular/angular/commit/bd1836b999938fdec98dd6cbfa407d3bcf828e3c) | fix(compiler-cli): exclude type-only imports from cycle analysis ([#42453](https://github.com/angular/angular/pull/42453)) |
### core
| Commit | Description |
| -- | -- |
| [25f763cff8](https://github.com/angular/angular/commit/25f763cff86b4b0ef49eb0105c2093c97c58b6fe) | feat(core): support TypeScript 4.3 ([#42022](https://github.com/angular/angular/pull/42022)) |
### forms
| Commit | Description |
| -- | -- |
| [47270d9e63](https://github.com/angular/angular/commit/47270d9e638260a08c0b11f9ac8cbcd02a49ac86) | feat(forms): add `ng-submitted` class to forms that have been submitted. ([#42132](https://github.com/angular/angular/pull/42132)) |
| [751cd83ae3](https://github.com/angular/angular/commit/751cd83ae3ee5c971f2d4b72af1aaa691305a866) | fix(forms): the `min` and `max` validators should work correctly with `0` as a value ([#42412](https://github.com/angular/angular/pull/42412)) |
### language-service
| Commit | Description |
| -- | -- |
| [a493ea9bcb](https://github.com/angular/angular/commit/a493ea9bcb2a1d94481d30e41db8b0bdf235ab42) | fix(language-service): fix autocomplete info display for some cases ([#42472](https://github.com/angular/angular/pull/42472)) |
| [fe22c2b0b6](https://github.com/angular/angular/commit/fe22c2b0b6852a4808d8f5477ec84df2c29a5103) | fix(language-service): Correct rename info for pipe name expressions ([#41974](https://github.com/angular/angular/pull/41974)) |
### router
| Commit | Description |
| -- | -- |
| [c44ab4f6da](https://github.com/angular/angular/commit/c44ab4f6dad7c326df73f8f1c780810e776ad671) | fix(router): fix `serializeQueryParams` logic ([#42481](https://github.com/angular/angular/pull/42481)) |
## Special Thanks:
Alex, Alex Inkin, Andrew Kushnir, Andrew Scott, Chris, David Shevitz, Dylan Hunn, George Kalpakas, Gourav102, Igor Minar, Jessica Janiuk, Joey Perrott, JoostK, Kapunahele Wong, Kristiyan Kostadinov, MarsiBarsi, MrJithil, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Sam Severance, Santosh Yadav, Teri Glover, Tiago Temporin, Vahid Mohammadi, anups1, cindygk, iRealNirmal, kuncevic and mgechev


<a name="12.0.4"></a>
# 12.0.4 (2021-06-09)
### common
| Commit | Description |
| -- | -- |
| [200cc31df4](https://github.com/angular/angular/commit/200cc31df4a194221694bd853265a05e870a246a) | fix(common): infer correct type when `trackBy` is used in `ngFor` ([#41995](https://github.com/angular/angular/pull/41995)) |
| [0dad375de7](https://github.com/angular/angular/commit/0dad375de77f56991a65ace9a9aad70fa814b29f) | fix(common): initialize currencyCode in currencyPipe ([#40505](https://github.com/angular/angular/pull/40505)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [b6d6a34eef](https://github.com/angular/angular/commit/b6d6a34eef9bd3c8434cde8dcee9dcbd47e753b6) | fix(compiler-cli): exclude type-only imports from cycle analysis ([#42453](https://github.com/angular/angular/pull/42453)) |
### forms
| Commit | Description |
| -- | -- |
| [50c87e86b6](https://github.com/angular/angular/commit/50c87e86b618b0f71dbd2ec4938415beb383f08b) | fix(forms): the `min` and `max` validators should work correctly with `0` as a value ([#42412](https://github.com/angular/angular/pull/42412)) |
### language-service
| Commit | Description |
| -- | -- |
| [34dd3c360b](https://github.com/angular/angular/commit/34dd3c360b9d585fd0286a5c766456470fe19dca) | fix(language-service): fix autocomplete info display for some cases ([#42472](https://github.com/angular/angular/pull/42472)) |
### router
| Commit | Description |
| -- | -- |
| [a77ec5bcab](https://github.com/angular/angular/commit/a77ec5bcab5307d426abc436714ea673a5880b3f) | fix(router): fix `serializeQueryParams` logic ([#42481](https://github.com/angular/angular/pull/42481)) |
## Special Thanks:
Alex, Alex Inkin, Andrew Kushnir, Andrew Scott, Chris, David Shevitz, George Kalpakas, Gourav102, Igor Minar, Joey Perrott, JoostK, Kapunahele Wong, Kristiyan Kostadinov, MarsiBarsi, MrJithil, Paul Gschwendtner, Pete Bacon Darwin, Sam Severance, Santosh Yadav, Teri Glover, Tiago Temporin, Vahid Mohammadi, anups1, cindygk, iRealNirmal, kuncevic and mgechev


<a name="12.1.0-next.4"></a>
# 12.1.0-next.4 (2021-06-02)
### compiler-cli
| Commit | Description |
| -- | -- |
| [e039075a28](https://github.com/angular/angular/commit/e039075a2837b0decf17cfbd5382d675c331bbeb) | fix(compiler-cli): better detect classes that are indirectly exported ([#42207](https://github.com/angular/angular/pull/42207)) |
## Special Thanks:
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, David Pfeiffer, David Shevitz, Doug Parker, Dylan Hunn, George Kalpakas, Igor Minar, Joey Perrott, JoostK, Kristiyan Kostadinov, Renovate Bot, Sam Severance, Serguei Cambour, Suguru Inatomi, Teri Glover, Wagner Maciel, Zach Arend, mgechev and 不肖・高橋


<a name="12.0.3"></a>
# 12.0.3 (2021-06-02)
### compiler-cli
| Commit | Description |
| -- | -- |
| [8bdcca1e08](https://github.com/angular/angular/commit/8bdcca1e08eaeb031a940f95e8afe91081cd2482) | fix(compiler-cli): better detect classes that are indirectly exported ([#42207](https://github.com/angular/angular/pull/42207)) |
## Special Thanks:
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, David Pfeiffer, David Shevitz, Doug Parker, Dylan Hunn, George Kalpakas, Igor Minar, Joey Perrott, JoostK, Kristiyan Kostadinov, Sam Severance, Serguei Cambour, Suguru Inatomi, Teri Glover, Wagner Maciel, Zach Arend, mgechev and 不肖・高橋


<a name="12.0.2"></a>
# 12.0.2 (2021-05-26)
### forms
| Commit | Description |
| -- | -- |
| [19d7bf4162](https://github.com/angular/angular/commit/19d7bf4162fa111a35d0fd556c464521968881ea) | fix(forms): Add float number support for min and max validator ([#42223](https://github.com/angular/angular/pull/42223)) |
### migrations
| Commit | Description |
| -- | -- |
| [11c7bec065](https://github.com/angular/angular/commit/11c7bec065f505894e99a54031e3d82b6d84b9f8) | fix(migrations): add migration to replace `/deep/` with `::ng-deep` ([#42214](https://github.com/angular/angular/pull/42214)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [84ab81c286](https://github.com/angular/angular/commit/84ab81c2863d3b2a3a0037913748a13011eeddc1) | fix(platform-browser): update started state on reset ([#41608](https://github.com/angular/angular/pull/41608)) |
## Special Thanks:
Alan Agius, Andrew Scott, David Shevitz, George Kalpakas, Igor Minar, Joey Perrott, Kapunahele Wong, Madleina Scheidegger, Paul Gschwendtner, Pete Bacon Darwin, Sam Severance, Teri Glover, Zach Arend, chenyunhsin, iRealNirmal, mgechev and twerske

<a name="12.1.0-next.3"></a>
# 12.1.0-next.3 (2021-05-26)
### forms
| Commit | Description |
| -- | -- |
| [3d9062dad7](https://github.com/angular/angular/commit/3d9062dad74c28e7c5b7849ae35dcb2e85ee7921) | fix(forms): Add float number support for min and max validator ([#42223](https://github.com/angular/angular/pull/42223)) |
### migrations
| Commit | Description |
| -- | -- |
| [7f6213a2f4](https://github.com/angular/angular/commit/7f6213a2f48caca4207b820d355bf9feb5d4e05c) | fix(migrations): add migration to replace `/deep/` with `::ng-deep` ([#42214](https://github.com/angular/angular/pull/42214)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [3a6af8e629](https://github.com/angular/angular/commit/3a6af8e629ba03d1202053a0ee9150372bbeda49) | fix(platform-browser): update started state on reset ([#41608](https://github.com/angular/angular/pull/41608)) |
## Special Thanks:
Alan Agius, Andrew Scott, David Shevitz, George Kalpakas, Igor Minar, Joey Perrott, Kapunahele Wong, Madleina Scheidegger, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Sam Severance, Teri Glover, Zach Arend, chenyunhsin, iRealNirmal, mgechev and twerske


<a name="12.1.0-next.2"></a>
# 12.1.0-next.2 (2021-05-19)
### common
| Commit | Description |
| -- | -- |
| [4bc3cf216d](https://github.com/angular/angular/commit/4bc3cf216d0a4053e114157f3522c3b666788644) | feat(common): add URLSearchParams to request body ([#37852](https://github.com/angular/angular/pull/37852)) |
### language-service
| Commit | Description |
| -- | -- |
| [1be5d659a5](https://github.com/angular/angular/commit/1be5d659a51d10b05bee50bd5d7cd06070198c4c) | fix(language-service): fully de-duplicate reference and rename results ([#40523](https://github.com/angular/angular/pull/40523)) |
| [a86ca4fe04](https://github.com/angular/angular/commit/a86ca4fe049e68710b612a8e3323c256115a805e) | feat(language-service): Enable renaming of pipes ([#40523](https://github.com/angular/angular/pull/40523)) |
## Special Thanks:
Ajit Singh, Alan Agius, Alan Cohen, Alex Rickabaugh, Amadou Sall, Andrew J Asche, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Ben Lesh, Bendik Skarpnes, Benjamin Kindle, Charles Lyding, Chau Tran, Cosmin Ababei, Daniel Díaz, David Shevitz, Dharmen Shah, Dmitrij Kuba, Dylan Hunn, Eduard Bondarenko, Emily Wenberg, Front-end developer, George Kalpakas, Georgii Dolzhykov, Gopal Jayaraman, Gourav102, Gérôme Grignon, Hugo Mejia, Igor Minar, Jesse Palmer, Jessica Janiuk, JiaLiPassion, Joey Perrott, JoostK, Julien Marcou, Kapunahele Wong, Keen Yee Liau, Kirk Larkin, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, Martin Sikora, Mathias Schäfer, Michael Hladky, Mikhail, Misko Hevery, MrJithil, Nishu Goel, Oluwole Majiyagbe, Paul Gschwendtner, Paul Muriel Biya-Bi, Pete Bacon Darwin, Pierre Portejoie, Richard Sithole, Sagar Pandita, Sam Severance, Sumit Arora, Talha Azhar, Teri Glover, Wojciech Okoński, Zach Arend, Zack DeRose, aschaap, cexbrayat, iRealNirmal, iron, jeripeierSBB, mgechev, nirmal bhagwani, pavlenko, profanis, rachid Oussanaa, sovtara, unknown, va-stefanek and wagnermaciel


<a name="12.0.1"></a>
# 12.0.1 (2021-05-19)
### benchpress
| Commit | Description |
| -- | -- |
| [28ee9864a4](https://github.com/angular/angular/commit/28ee9864a4e2f46fc95d4e2d7469b28f0cce0686) | fix(benchpress): update the check for start and end events ([#42085](https://github.com/angular/angular/pull/42085)) |
### compiler
| Commit | Description |
| -- | -- |
| [52c07e403e](https://github.com/angular/angular/commit/52c07e403ed49ac8fcedcd23fd0c4b385b614672) | fix(compiler): unclear lexer error when using private identifier in expressions ([#42027](https://github.com/angular/angular/pull/42027)) |
### core
| Commit | Description |
| -- | -- |
| [3a46ad96ea](https://github.com/angular/angular/commit/3a46ad96ea337e8b498e29d8364706e667089fde) | fix(core): global listeners not being bound on non-node host elements ([#42014](https://github.com/angular/angular/pull/42014)) |
### forms
| Commit | Description |
| -- | -- |
| [9b90c03a9f](https://github.com/angular/angular/commit/9b90c03a9f6931390d65c26a11d3cea94a9ce9d6) | fix(forms): registerOnValidatorChange should be called for ngModelGroup. ([#41971](https://github.com/angular/angular/pull/41971)) |
## Special Thanks:
Alex Rickabaugh, Daniel Díaz, David Shevitz, Dylan Hunn, Front-end developer, George Kalpakas, Joey Perrott, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, MrJithil, Paul Gschwendtner, Renovate Bot, Sam Severance, Sumit Arora, iRealNirmal, iron, mgechev, rachid Oussanaa and wagnermaciel


<a name="12.0.0"></a>
# 12.0.0 (2021-05-12)

[Blog post "Angular v12 is now available"](https://blog.angular.io/angular-v12-is-now-available-32ed51fbfd49).


### Bug Fixes

* **animations:** ensure consistent transition namespace ordering ([#19854](https://github.com/angular/angular/issues/19854)) ([01cc995](https://github.com/angular/angular/commit/01cc99589bc449eaf3b1de2c94636de878843fba))
* **animations:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([e918250](https://github.com/angular/angular/commit/e918250a0624cff9bbbbdb016a069303a99fb8cc))
* **animations:** cleanup DOM elements when the root view is removed ([#41059](https://github.com/angular/angular/issues/41059)) ([c49b280](https://github.com/angular/angular/commit/c49b28013a6c017c9afc73bbc00bb4fdcf15c70e))
* **animations:** allow animations on elements in the shadow DOM ([#40134](https://github.com/angular/angular/issues/40134)) ([dad42c8](https://github.com/angular/angular/commit/dad42c8cd669357f9c862023abc5f4695863040d)), closes [#25672](https://github.com/angular/angular/issues/25672)
* **animations:** cleanup DOM elements when the root view is removed ([#41001](https://github.com/angular/angular/issues/41001)) ([a31da48](https://github.com/angular/angular/commit/a31da4850788800ba9735d617e7e3bb621a79c93))
* **bazel:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([8503246](https://github.com/angular/angular/commit/85032460f133162cc712ab3b9f04d42ff3b6d6d9))
* **bazel:** update build tooling for latest changes in rules_nodejs ([#40710](https://github.com/angular/angular/issues/40710)) ([696f7bc](https://github.com/angular/angular/commit/696f7bc))
* **bazel:** update integration test to use rules_nodejs@3.1.0 ([#40710](https://github.com/angular/angular/issues/40710)) ([34de89a](https://github.com/angular/angular/commit/34de89a))
* **bazel:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([2c90391](https://github.com/angular/angular/commit/2c90391))
* **benchpress:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([e721a5d](https://github.com/angular/angular/commit/e721a5d))
* **common:** add  right ContentType for boolean values with HttpClient request body([#38924](https://github.com/angular/angular/issues/38924)) ([#41885](https://github.com/angular/angular/issues/41885)) ([922a602](https://github.com/angular/angular/commit/922a60283183c47a268fd084302b2bc87267a73e))
* **common:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([f2b6fd8](https://github.com/angular/angular/commit/f2b6fd87056cf3159e8ecc275ce654e47fdfa6f0))
* **common:** viewport scroller not finding elements inside the shadow DOM ([#41644](https://github.com/angular/angular/issues/41644)) ([c0f5ba3](https://github.com/angular/angular/commit/c0f5ba3d36b2509a71d09c436d247211a58ee80d)), closes [#41470](https://github.com/angular/angular/issues/41470)
* **common:** temporarily re-export and deprecate `XhrFactory` ([#41393](https://github.com/angular/angular/issues/41393)) ([7dfa446](https://github.com/angular/angular/commit/7dfa446c4ace99f4b64069cf672dcaa3665a1f5b))
* **common:** cleanup location change listeners when the root view is removed ([#40867](https://github.com/angular/angular/issues/40867)) ([38524c4](https://github.com/angular/angular/commit/38524c4d29290d3339ad2d7335a0ea84f5701d26)), closes [#31546](https://github.com/angular/angular/issues/31546)
* **common:** allow number or boolean as http params ([#40663](https://github.com/angular/angular/issues/40663)) ([91cdc11](https://github.com/angular/angular/commit/91cdc11aa0347d1b71f2f732e00af9c3ff8078fc)), closes [#23856](https://github.com/angular/angular/issues/23856)
* **common:** avoid mutating context object in NgTemplateOutlet ([#40360](https://github.com/angular/angular/issues/40360)) ([d3705b3](https://github.com/angular/angular/commit/d3705b3284113f752ee05e9f0d2f6e75c723ea5b)), closes [#24515](https://github.com/angular/angular/issues/24515)
* **compiler:** preserve @page rules in encapsulated styles ([#41915](https://github.com/angular/angular/issues/41915)) ([3e365ba](https://github.com/angular/angular/commit/3e365ba81e313ee31af7a8e9042e33fc046067e0)), closes [#26269](https://github.com/angular/angular/issues/26269)
* **compiler:** strip scoped selectors from `@font-face` rules ([#41815](https://github.com/angular/angular/issues/41815)) ([2a11cda](https://github.com/angular/angular/commit/2a11cdab51a2d8d7f644ceca744568a1617f5242)), closes [#41751](https://github.com/angular/angular/issues/41751)
* **compiler:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([bae8126](https://github.com/angular/angular/commit/bae81269c7461063821be7beb66b516e5a8995ce))
* **compiler:** non-literal inline templates incorrectly processed in partial compilation ([#41583](https://github.com/angular/angular/issues/41583)) ([ab257b3](https://github.com/angular/angular/commit/ab257b370127dce70bd3ee7ad6d64d3a9ad5ae95))
* **compiler:** not generating update instructions for ng-template inside alternate namespaces ([#41669](https://github.com/angular/angular/issues/41669)) ([2bcbbda](https://github.com/angular/angular/commit/2bcbbda78913be014534fde72318ab09795350f9)), closes [#41308](https://github.com/angular/angular/issues/41308)
* **compiler:** avoid parsing EmptyExpr with a backwards span ([#41581](https://github.com/angular/angular/issues/41581)) ([e1a2930](https://github.com/angular/angular/commit/e1a29308933e99ee3e0d92aae42b33834f20f50a))
* **compiler:** handle case-sensitive CSS custom properties ([#41380](https://github.com/angular/angular/issues/41380)) ([e112e32](https://github.com/angular/angular/commit/e112e320bf6c2b60e8ecea46f80bcaec593c65b7)), closes [#41364](https://github.com/angular/angular/issues/41364)
* **compiler:** include used components during JIT compilation of partial component declaration ([#41353](https://github.com/angular/angular/issues/41353)) ([ff9470b](https://github.com/angular/angular/commit/ff9470b0a0196a3638f19028bba15e002cb0ff27)), closes [#41104](https://github.com/angular/angular/issues/41104) [#41318](https://github.com/angular/angular/issues/41318)
* **compiler:** support multiple `:host-context()` selectors ([#40494](https://github.com/angular/angular/issues/40494)) ([07b7af3](https://github.com/angular/angular/commit/07b7af3)), closes [#19199](https://github.com/angular/angular/issues/19199)
* **compiler:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([f728490](https://github.com/angular/angular/commit/f728490))
* **compiler-cli:** use '' for the source map URL of indirect templates ([#41973](https://github.com/angular/angular/issues/41973)) ([7a4d980](https://github.com/angular/angular/commit/7a4d9805ea73d1b6a7659987da77d266d5e01b88)), closes [#40854](https://github.com/angular/angular/issues/40854)
* **compiler-cli:** expose the linker as a Babel plugin ([#41918](https://github.com/angular/angular/issues/41918)) ([8fdac8f](https://github.com/angular/angular/commit/8fdac8f4361fd4ac0f20c21c98289c19e8864347))
* **compiler-cli:** prefer non-aliased exports in reference emitters ([#41866](https://github.com/angular/angular/issues/41866)) ([75bb931](https://github.com/angular/angular/commit/75bb931889b946c243161a6ce0503bc7d08a6565)), closes [#41443](https://github.com/angular/angular/issues/41443) [#41277](https://github.com/angular/angular/issues/41277)
* **compiler-cli:** allow linker to process minified booleans ([#41747](https://github.com/angular/angular/issues/41747)) ([1fb6724](https://github.com/angular/angular/commit/1fb6724b1f66c4681ddb201bc9b5441d20f5b920)), closes [#41655](https://github.com/angular/angular/issues/41655)
* **compiler-cli:** match string indexed partial declarations ([#41747](https://github.com/angular/angular/issues/41747)) ([f885750](https://github.com/angular/angular/commit/f8857507642f5d12eebf4ef1ca68b63cc51f4f81)), closes [#41655](https://github.com/angular/angular/issues/41655)
* **compiler-cli:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([5b463f4](https://github.com/angular/angular/commit/5b463f4541946c795835c9d9cfd7a21e7b0caffc))
* **compiler-cli:** autocomplete literal types in templates. ([#41456](https://github.com/angular/angular/issues/41456)) ([#41645](https://github.com/angular/angular/issues/41645)) ([8b2b5ef](https://github.com/angular/angular/commit/8b2b5ef903a21b599dfc4bfe8b0c64f7c136c3a9))
* **compiler-cli:** do not error with prepocessing if component has no inline styles ([#41602](https://github.com/angular/angular/issues/41602)) ([a5fe8b9](https://github.com/angular/angular/commit/a5fe8b95893798467c4eea2b3d38d49f6d0ce1b3))
* **compiler-cli:** ensure the compiler tracks `ts.Program`s correctly ([#41291](https://github.com/angular/angular/issues/41291)) ([deacc74](https://github.com/angular/angular/commit/deacc741e0ee41666292d2e2c07812a78daf5d6f))
* **compiler-cli:** prevent eliding default imports in incremental recompilations ([#41557](https://github.com/angular/angular/issues/41557)) ([7f16515](https://github.com/angular/angular/commit/7f1651574ee95eaaa5f636fc37be7b07d1a808e5)), closes [#41377](https://github.com/angular/angular/issues/41377)
* **compiler-cli:** resolve `rootDirs` to absolute ([#41359](https://github.com/angular/angular/issues/41359)) ([3e0fda9](https://github.com/angular/angular/commit/3e0fda96b827e577cc300f46e8497cb6c810ad61)), closes [#36290](https://github.com/angular/angular/issues/36290)
* **compiler-cli:** add `useInlining` option to type check config ([#41043](https://github.com/angular/angular/issues/41043)) ([09aefd2](https://github.com/angular/angular/commit/09aefd29045db77689f4dc16a6abae09a79cfb81)), closes [#40963](https://github.com/angular/angular/issues/40963)
* **compiler-cli:** `readConfiguration` existing options should override options in tsconfig ([#40694](https://github.com/angular/angular/issues/40694)) ([b7c4d07](https://github.com/angular/angular/commit/b7c4d07e81277f7aed566e443d1d4e1395c5a2f4))
* **compiler-cli:** extend `angularCompilerOptions` in tsconfig from node ([#40694](https://github.com/angular/angular/issues/40694)) ([5eb1954](https://github.com/angular/angular/commit/5eb195416bf73f2fa59de52531724d8d19392975)), closes [#36715](https://github.com/angular/angular/issues/36715)
* **compiler-cli:** update ngcc integration tests for latest changes in rules_nodejs ([#40710](https://github.com/angular/angular/issues/40710)) ([d7f5755](https://github.com/angular/angular/commit/d7f5755))
* **compiler-cli:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([b75d7cb](https://github.com/angular/angular/commit/b75d7cb))
* **core:** do not retain dynamically compiled components and modules ([#42003](https://github.com/angular/angular/issues/42003)) ([1449c5c](https://github.com/angular/angular/commit/1449c5c8ff3bf706c501130fe261627effe5d212)), closes [#19997](https://github.com/angular/angular/issues/19997)
* **core:** invoke profiler around ngOnDestroy lifecycle hooks ([#41969](https://github.com/angular/angular/issues/41969)) ([e9ddc57](https://github.com/angular/angular/commit/e9ddc57f948f0cb18e3e334aeb3084d1b49689b1))
* **core:** AsyncPipe now compatible with RxJS 7 ([#41590](https://github.com/angular/angular/issues/41590)) ([9759bca](https://github.com/angular/angular/commit/9759bca339b44ed78ec6aafab0336d531d285f90))
* **core:** handle multiple i18n attributes with expression bindings ([#41882](https://github.com/angular/angular/issues/41882)) ([73c6c64](https://github.com/angular/angular/commit/73c6c64f82d45c34203d4d18d759ad0c33a6b221)), closes [#41869](https://github.com/angular/angular/issues/41869)
* **core:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([f9c1f08](https://github.com/angular/angular/commit/f9c1f089573e0158eb5e4443658cfd25aeeeb091))
* **core:** detect synthesized constructors that have been downleveled using TS 4.2 ([#41305](https://github.com/angular/angular/issues/41305)) ([274dc15](https://github.com/angular/angular/commit/274dc15452739e4fab2f647804a64d5b797cfed5)), closes [#41298](https://github.com/angular/angular/issues/41298)
* **core:** Switch `emitDistinctChangesOnlyDefaultValue` to true ([#41121](https://github.com/angular/angular/issues/41121)) ([7096246](https://github.com/angular/angular/commit/70962465b5795f0a192f745016b1c461e7c8790b))
* **core:** remove duplicated EMPTY_OBJ constant ([#41066](https://github.com/angular/angular/issues/41066)) ([bf158e7](https://github.com/angular/angular/commit/bf158e7ff0715aabeae3c2c1ac923bf8cc7e4cfd))
* **core:** remove duplicated EMPTY_ARRAY constant ([#40991](https://github.com/angular/angular/issues/40991)) ([e12d9de](https://github.com/angular/angular/commit/e12d9dec64bc3d02e58f8f85a65a939394fb9531))
* **core:** allow EmbeddedViewRef context to be updated ([#40360](https://github.com/angular/angular/issues/40360)) ([a3e1719](https://github.com/angular/angular/commit/a3e17190e7e7e0329ed3643299c24d5fd510b7d6)), closes [#24515](https://github.com/angular/angular/issues/24515)
* **core:** make DefaultIterableDiffer keep the order of duplicates ([#23941](https://github.com/angular/angular/issues/23941)) ([a826926](https://github.com/angular/angular/commit/a826926)), closes [#23815](https://github.com/angular/angular/issues/23815)
* **core:** NgZone coaleascing options should trigger onStable correctly ([#40540](https://github.com/angular/angular/issues/40540)) ([22f9e45](https://github.com/angular/angular/commit/22f9e45))
* **elements:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([4f5d094](https://github.com/angular/angular/commit/4f5d094f3a385cdc6d93c7676457484e3d8b6b09))
* **elements:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([efd4149](https://github.com/angular/angular/commit/efd4149))
* **forms:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([dc975ba](https://github.com/angular/angular/commit/dc975bac93a8087d1f31a31db60ef313147e589f))
* **http:** complete the request on timeout ([#39807](https://github.com/angular/angular/issues/39807)) ([61a0b6d](https://github.com/angular/angular/commit/61a0b6d)), closes [#26453](https://github.com/angular/angular/issues/26453)
* **http:** emit error on XMLHttpRequest abort event ([#40767](https://github.com/angular/angular/issues/40767)) ([3897265](https://github.com/angular/angular/commit/3897265)), closes [#22324](https://github.com/angular/angular/issues/22324)
* **language-service:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([9b6198c](https://github.com/angular/angular/commit/9b6198c16f122dd934ac6a66d2ada21df26839b5))
* **language-service:** use script versions for incremental compilations ([#41475](https://github.com/angular/angular/issues/41475)) ([78236bf](https://github.com/angular/angular/commit/78236bfdcaeb66c5846eb0435d727942bb88f7c5))
* **language-service:** Only provide Angular property completions in templates ([#41278](https://github.com/angular/angular/issues/41278)) ([0226a11](https://github.com/angular/angular/commit/0226a11c185da2d1e6f7833972d3f12205a6ae59))
* **language-service:** Add plugin option to force strictTemplates ([#41062](https://github.com/angular/angular/issues/41062)) ([e9e7c33](https://github.com/angular/angular/commit/e9e7c33f3c170648ec8c86d859980c7fe78fba39))
* **language-service:** use single entry point for Ivy and View Engine ([#40967](https://github.com/angular/angular/issues/40967)) ([e986a97](https://github.com/angular/angular/commit/e986a9787b7787c3cffef69d06a2e7e1228e3f40))
* **localize:** relax error to warning for missing target ([#41944](https://github.com/angular/angular/issues/41944)) ([35ceed2](https://github.com/angular/angular/commit/35ceed2061a890a70576dc7afa0b779f3779ae7b)), closes [#21690](https://github.com/angular/angular/issues/21690)
* **localize:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([658ed1f](https://github.com/angular/angular/commit/658ed1f904ef0013c3b08e2b2182cf246ef55b2b))
* **localize:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([4b469c9](https://github.com/angular/angular/commit/4b469c9))
* **ngcc:** detect synthesized constructors that have been downleveled using TS 4.2 ([#41305](https://github.com/angular/angular/issues/41305)) ([8d3da56](https://github.com/angular/angular/commit/8d3da56eda12070df1fb473c8609f3a94d77bfd6)), closes [#41298](https://github.com/angular/angular/issues/41298)
* **platform-browser:** prevent memory leak of style nodes if shadow DOM encapsulation is used ([#42005](https://github.com/angular/angular/issues/42005)) ([d555555](https://github.com/angular/angular/commit/d5555558d00774520dbda40d48721bda2cb9dd1a)), closes [#36655](https://github.com/angular/angular/issues/36655)
* **platform-browser:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([ea05cfd](https://github.com/angular/angular/commit/ea05cfd0c5a99840f4522b604c33a5b2f7f25f7d))
* **platform-browser:** configure `XhrFactory` to use `BrowserXhr` ([#41313](https://github.com/angular/angular/issues/41313)) ([e0028e5](https://github.com/angular/angular/commit/e0028e57410281e190caa74e0986320f6591d27b)), closes [#41311](https://github.com/angular/angular/issues/41311)
* **platform-browser:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([7ecfd2d](https://github.com/angular/angular/commit/7ecfd2d))
* **platform-browser-dynamic:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([bc45029](https://github.com/angular/angular/commit/bc45029a5437bcea45fa00549241685a1a3f32d0))
* **platform-server:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([4b9d4fa](https://github.com/angular/angular/commit/4b9d4fa3e729a3af13fb5b50de3e5c73c1d6923f))
* **router:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([0067edd](https://github.com/angular/angular/commit/0067edd1469a428c11bbe6358fd5650e79abf774))
* **router:** Only retrieve stored route when reuse strategy indicates it should reattach ([#30263](https://github.com/angular/angular/issues/30263)) ([a4ff071](https://github.com/angular/angular/commit/a4ff071e3f08e3de6d4d3f97c747c2f42b827c49)), closes [#23162](https://github.com/angular/angular/issues/23162)
* **router:** recursively merge empty path matches ([#41584](https://github.com/angular/angular/issues/41584)) ([1179dc8](https://github.com/angular/angular/commit/1179dc8cb32c9fc451d2af9215c4740af9d2e291)), closes [#41481](https://github.com/angular/angular/issues/41481)
* **router:** fragment can be null ([#37336](https://github.com/angular/angular/issues/37336)) ([b555160](https://github.com/angular/angular/commit/b5551609fe02787641bdfdb0a6edfded413a3b52)), closes [#23894](https://github.com/angular/angular/issues/23894) [#34197](https://github.com/angular/angular/issues/34197)
* **router:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([350dada](https://github.com/angular/angular/commit/350dada))
* **service-worker:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([6b823d7](https://github.com/angular/angular/commit/6b823d7071d59234ab52bdf7eaa248df6b7d9faa))
* **service-worker:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([4f7ff96](https://github.com/angular/angular/commit/4f7ff96))
* **upgrade:** preserve $interval.flush when ngMocks is being used ([#30229](https://github.com/angular/angular/issues/30229)) ([87dc851](https://github.com/angular/angular/commit/87dc8511ccb9c75d78866ebd2c250ea96fc91bd0))
* **upgrade:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([10c4523](https://github.com/angular/angular/commit/10c45239a68e82ea52c1601fae09953aa7843351))


### Build System

* `ng_package` no longer generate minified UMDs ([#41425](https://github.com/angular/angular/issues/41425)) ([5a8bc1b](https://github.com/angular/angular/commit/5a8bc1bfe1c809705dfaa7e4723dd055308cd468))


### Features

* **animations:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([547363a](https://github.com/angular/angular/commit/547363a851567f66e9aee6c80f9e98c739889969))
* **animations:** add support for disabling animations through BrowserAnimationsModule.withConfig ([#40731](https://github.com/angular/angular/issues/40731)) ([29d8a0a](https://github.com/angular/angular/commit/29d8a0ab09a13600405343037079d151c3a04095))
* **bazel:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([d583d92](https://github.com/angular/angular/commit/d583d926db537cc74f9235cad51189dbe83fbb44))
* **common:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([e0250e5](https://github.com/angular/angular/commit/e0250e567ae47ed7b77e9d88a3289727c056a6f1))
* **common:** add `historyGo` method to `Location` service ([#38890](https://github.com/angular/angular/issues/38890)) ([e05a6f3](https://github.com/angular/angular/commit/e05a6f3bb3048e9a94a4b154526221dea290312d))
* **common:** support ICU standard "stand alone day of week" with `DatePipe` ([#40766](https://github.com/angular/angular/issues/40766)) ([c56ecab](https://github.com/angular/angular/commit/c56ecab515c28d2ad45c630080bfbf549675528a)), closes [#26922](https://github.com/angular/angular/issues/26922)
* **common:** implement `appendAll()` method on `HttpParams` ([#20930](https://github.com/angular/angular/issues/20930)) ([575a2d1](https://github.com/angular/angular/commit/575a2d1)), closes [#20798](https://github.com/angular/angular/issues/20798)
* **compiler:** support nullish coalescing in templates ([#41437](https://github.com/angular/angular/issues/41437)) ([ec27bd4](https://github.com/angular/angular/commit/ec27bd4ed1cc086d76d8142fadf87354b38aa61a)), closes [#36528](https://github.com/angular/angular/issues/36528)
* **compiler:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([75cc813](https://github.com/angular/angular/commit/75cc8133ad8efd6453694f222e2cc6789c4de7b2))
* **compiler:** emit @__PURE__ or [@pure](https://github.com/pure)OrBreakMyCode annotations in the generated code ([#41096](https://github.com/angular/angular/issues/41096)) ([9c21028](https://github.com/angular/angular/commit/9c210281d4073289ff4633a866e395ca34e97ef9))
* **compiler-cli:** mark ability to use partial compilation mode as stable ([#41518](https://github.com/angular/angular/issues/41518)) ([6ba67c6](https://github.com/angular/angular/commit/6ba67c6fff52d5da443f36fa1bfe1cc1f0919c51)), closes [#41496](https://github.com/angular/angular/issues/41496)
* **compiler-cli:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([b7bd238](https://github.com/angular/angular/commit/b7bd23817ed81c7359c0559e825ca385975fcafd))
* **compiler-cli:** support transforming component style resources ([#41307](https://github.com/angular/angular/issues/41307)) ([1de04b1](https://github.com/angular/angular/commit/1de04b124e1e92ea21a070c9d928664f193d220c))
* **compiler-cli:** support producing Closure-specific PURE annotations ([#41021](https://github.com/angular/angular/issues/41021)) ([fbc9df1](https://github.com/angular/angular/commit/fbc9df181ea50527cb755382b54b8b45d0f9ef39))
* **core:** introduce getDirectiveMetadata global debugging utility ([#41525](https://github.com/angular/angular/issues/41525)) ([a07f303](https://github.com/angular/angular/commit/a07f30370848ecd051649a4862de39cf5bc2b541))
* **core:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([e66a5fb](https://github.com/angular/angular/commit/e66a5fbca687464421bf5e892ba16aa31448c2b9))
* **core:** support `forwardRef` in `providedIn` of `Injectable` declaration ([#41426](https://github.com/angular/angular/issues/41426)) ([f7c294e](https://github.com/angular/angular/commit/f7c294ee0f4131dae83d4b6a7fa4e497df84aa57)), closes [#41205](https://github.com/angular/angular/issues/41205)
* **core:** add migration for  `XhrFactory` import ([#41313](https://github.com/angular/angular/issues/41313)) ([95ff5ec](https://github.com/angular/angular/commit/95ff5ecb239d55a239113b0a2e1f7620f6e34676))
* **core:** drop support for TypeScript 4.0 and 4.1 ([#41158](https://github.com/angular/angular/issues/41158)) ([fa04894](https://github.com/angular/angular/commit/fa048948be75c30dafebda69efbeb81776460500))
* **core:** support TypeScript 4.2 ([#41158](https://github.com/angular/angular/issues/41158)) ([59ef409](https://github.com/angular/angular/commit/59ef40988e94f3173134368bc7d4e2726cdd8455))
* **core:** manually annotate de-sugarred core tree-shakable providers with [@pure](https://github.com/pure)OrBreakMyCode ([#41096](https://github.com/angular/angular/issues/41096)) ([03d47d5](https://github.com/angular/angular/commit/03d47d570167a5a70b17552ca2c8d531683d900f))
* **core:** more precise type for `APP_INITIALIZER` token ([#40986](https://github.com/angular/angular/issues/40986)) ([ca721c2](https://github.com/angular/angular/commit/ca721c2972f44d903a0e12fae3397ab62769e649)), closes [#40729](https://github.com/angular/angular/issues/40729)
* **core:** drop support for zone.js 0.10.x ([#40823](https://github.com/angular/angular/issues/40823)) ([aaf9b31](https://github.com/angular/angular/commit/aaf9b31fb472826c279a720cc875007987f9aa6f)), closes [angular/angular-cli#20034](https://github.com/angular/angular-cli/issues/20034)
* **core:** support APP_INITIALIZER work with observable ([#33222](https://github.com/angular/angular/issues/33222)) ([ca17ac5](https://github.com/angular/angular/commit/ca17ac523cc2ed8046931c86a2c12d97fb6796ca)), closes [#15088](https://github.com/angular/angular/issues/15088)
* **elements:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([12fc08b](https://github.com/angular/angular/commit/12fc08bf9c07f14fce1790e751bd3f6779ed55dd))
* **forms:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([a0006a6](https://github.com/angular/angular/commit/a0006a6bfb78e09d355baca63065958458b5d8cd))
* **forms:** add `emitEvent` option for AbstractControl-based class methods ([#31031](https://github.com/angular/angular/issues/31031)) ([4ec045e](https://github.com/angular/angular/commit/4ec045e12b7614b901d4ef643988b86f09dfeee5)), closes [#29662](https://github.com/angular/angular/issues/29662)
* **forms:** introduce min and max validators ([#39063](https://github.com/angular/angular/issues/39063)) ([8fb83ea](https://github.com/angular/angular/commit/8fb83ea)), closes [#16352](https://github.com/angular/angular/issues/16352)
* **http:** introduce HttpContext request context ([#25751](https://github.com/angular/angular/issues/25751)) ([1644d64](https://github.com/angular/angular/commit/1644d64398491d4a324a5eee492d1fd37df52a01))
* **http:** expose a list of human-readable http status codes ([#23548](https://github.com/angular/angular/issues/23548)) ([6fe3a1d](https://github.com/angular/angular/commit/6fe3a1d)), closes [#23543](https://github.com/angular/angular/issues/23543)
* **language-service:** implement signature help ([#41581](https://github.com/angular/angular/issues/41581)) ([c7f9516](https://github.com/angular/angular/commit/c7f9516ab920baee755d61ce0deea502e88a58ba))
* **language-service:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([86621be](https://github.com/angular/angular/commit/86621bec580f3234c39169606ef9853e7bca1f4b))
* **language-service:** add perf tracing to LanguageService ([#41319](https://github.com/angular/angular/issues/41319)) ([90f85da](https://github.com/angular/angular/commit/90f85da2de72f320653e6292968f70c87876bada))
* **language-service:** add command for getting components for a template file ([#40655](https://github.com/angular/angular/issues/40655)) ([5cde4ad](https://github.com/angular/angular/commit/5cde4ad))
* **language-service:** Add diagnostics to suggest turning on strict mode ([#40423](https://github.com/angular/angular/issues/40423)) ([ecae75f](https://github.com/angular/angular/commit/ecae75f))
* **language-service:** Implement `getRenameInfo` ([#40439](https://github.com/angular/angular/issues/40439)) ([4e8198d](https://github.com/angular/angular/commit/4e8198d))
* **language-service:** initial implementation for `findRenameLocations` ([#40140](https://github.com/angular/angular/issues/40140)) ([9a5ac47](https://github.com/angular/angular/commit/9a5ac47))
* **language-service:** view template typecheck block ([#39974](https://github.com/angular/angular/issues/39974)) ([d482f5c](https://github.com/angular/angular/commit/d482f5c))
* **localize:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([590d4dd](https://github.com/angular/angular/commit/590d4dd5789788a8bd073d495df13e27725c4488))
* **localize:** add scripts to migrate away from legacy message IDs ([#41026](https://github.com/angular/angular/issues/41026)) ([1735430](https://github.com/angular/angular/commit/17354304768f3c2b272c4c5d5636b5709287276f))
* **ngcc:** support `__read` helper as used by TypeScript 4.2 ([#41201](https://github.com/angular/angular/issues/41201)) ([66e9970](https://github.com/angular/angular/commit/66e997069102a12c607d830c7edf91cb202e5902))
* **ngcc:** support `__spreadArray` helper as used by TypeScript 4.2 ([#41201](https://github.com/angular/angular/issues/41201)) ([7b1214e](https://github.com/angular/angular/commit/7b1214eca2dd2f09e723a46bed857fcb7d40bc0b)) [#40394](https://github.com/angular/angular/issues/40394)
* **platform-browser:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([ef0d1c3](https://github.com/angular/angular/commit/ef0d1c354534f027837f95860955abd81f6c2bd7))
* **platform-browser-dynamic:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([b714f7b](https://github.com/angular/angular/commit/b714f7b93137ab9a064d5d93e4986025c08447db))
* **platform-server:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([c901b4d](https://github.com/angular/angular/commit/c901b4d11f9892b98d5df82d6f9cc0da54ae847f))
* **platform-server:** allow shimming the global env sooner ([#40559](https://github.com/angular/angular/issues/40559)) ([43ecf8a](https://github.com/angular/angular/commit/43ecf8a77bc7e92d3c635b450de904732e938e64)), closes [#24551](https://github.com/angular/angular/issues/24551) [#39950](https://github.com/angular/angular/issues/39950) [#39950](https://github.com/angular/angular/issues/39950)
* **router:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([c30b171](https://github.com/angular/angular/commit/c30b171d20474d29323beb7cc99dc69c22d0f7fd))
* **router:** add migration for ActivatedRouteSnapshot.fragment ([#41092](https://github.com/angular/angular/issues/41092)) ([190fa07](https://github.com/angular/angular/commit/190fa07b9a416defb581d2bf76d1deef7baefce6)), closes [#37336](https://github.com/angular/angular/issues/37336)
* **router:** Add more fine-tuned control in `routerLinkActiveOptions` ([#40303](https://github.com/angular/angular/issues/40303)) ([6c05c80](https://github.com/angular/angular/commit/6c05c80f19bc84189cc1d2f2e029f6f13d60dc18)), closes [#13205](https://github.com/angular/angular/issues/13205)
* **router:** Allow for custom router outlet implementations ([#40827](https://github.com/angular/angular/issues/40827)) ([a82fddf](https://github.com/angular/angular/commit/a82fddf1ce6166e0f697e429370eade114094670))
* **service-worker:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([fc597f1](https://github.com/angular/angular/commit/fc597f1db5d1774278803c24ecdd2bca387bf69b))
* **upgrade:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([beafa22](https://github.com/angular/angular/commit/beafa22de9aceadf0e6ba63d0124a2dab66ae6dd))


### Performance Improvements

* **common:** remove unused methods from DomAdapter ([#41102](https://github.com/angular/angular/issues/41102)) ([3c66b10](https://github.com/angular/angular/commit/3c66b100dd6f05f53740f596c5eadb999c27c9c4))
* **compiler:** reduce amount of generated code for safe accesses and nullish coalescing ([#41563](https://github.com/angular/angular/issues/41563)) ([9a3b82f](https://github.com/angular/angular/commit/9a3b82f19d26819c95c340d702c1c32787f2931e)), closes [#41437](https://github.com/angular/angular/issues/41437) [#41491](https://github.com/angular/angular/issues/41491)
* **compiler-cli:** allow incremental compilation in the presence of redirected source files ([#41448](https://github.com/angular/angular/issues/41448)) ([ffea31f](https://github.com/angular/angular/commit/ffea31f433c1f71b78a2245d52d2969503db1784))
* **compiler-cli:** cache results of `absoluteFromSourceFile` ([#41475](https://github.com/angular/angular/issues/41475)) ([fab1a64](https://github.com/angular/angular/commit/fab1a6468e53ab6c59e2c3aebb3ed1ecd1a6e5e8))
* **core:** minor improvements to listener instructions ([#41807](https://github.com/angular/angular/issues/41807)) ([9346d61](https://github.com/angular/angular/commit/9346d61d92c722175ca7673efe475e838546fef7))
* **core:** avoid storing LView in __ngContext__ ([#41358](https://github.com/angular/angular/issues/41358)) ([990067a](https://github.com/angular/angular/commit/990067a0c6df8e97c5bbffec00a76f13c4d4c903)), closes [#41047](https://github.com/angular/angular/issues/41047)
* **core:** optimize getDirectives ([#41525](https://github.com/angular/angular/issues/41525)) ([f7e391a](https://github.com/angular/angular/commit/f7e391a912153d1ce43f9d0cf06d23121d1d49cd))


### BREAKING CHANGES

* Minified UMD bundles are no longer included in the distributed NPM packages.
* **animations:** DOM elements are now correctly removed when the root view is removed.
If you are using SSR and use the app's HTML for rendering, you will need
to ensure that you save the HTML to a variable before destorying the
app.
It is also possible that tests could be accidentally relying on the old behavior by
trying to find an element that was not removed in a previous test. If
this is the case, the failing tests should be updated to ensure they
have proper setup code which initializes elements they rely on.
* **common:** Methods of the `PlatformLocation` class, namely `onPopState` and `onHashChange`,
used to return `void`. Now those methods return functions that can be called
to remove event handlers.
* **common:** The methods of the `HttpParams` class now accept `string | number | boolean`
instead of `string` for the value of a parameter.
If you extended this class in your application,
you'll have to update the signatures of your methods to reflect these changes.
* **compiler-cli:** Linked libraries no longer generate legacy i18n message ids. Any downstream
application that provides translations for these messages, will need to
migrate their message ids using the `localize-migrate` command line tool.
* **core:** Angular no longer maintains support for node v10
* **core:** Previously the `ng.getDirectives` function threw an error in case a
given DOM node had no Angular context associated with it (for example
if a function was called for a DOM element outside of an Angular app).
This behavior was inconsistent with other debugging utilities under `ng`
namespace, which handled this situation without raising an exception.
Now calling the `ng.getDirectives` function for such DOM nodes would
result in an empty array returned from that function.
* **core:** Switching default of `emitDistinctChangesOnlyDefaultValue`
which changes the default behavior and may cause some applications which
rely on the incorrect behavior to fail.

`emitDistinctChangesOnly` flag has also been deprecated and will be
removed in a future major release.

The previous implementation would fire changes `QueryList.changes.subscribe`
whenever the `QueryList` was recomputed. This resulted in an artificially
high number of change notifications, as it is possible that recomputing
`QueryList` results in the same list. When the `QueryList` gets recomputed
is an implementation detail, and it should not be the thing that determines
how often change event should fire.

Unfortunately, fixing the behavior outright caused too many existing
applications to fail. For this reason, Angular considers this fix a
breaking fix and has introduced a flag in `@ContentChildren` and
`@ViewChildren`, that controls the behavior.

```
export class QueryCompWithStrictChangeEmitParent {
  @ContentChildren('foo', {
    // This option is the new default with this change.
    emitDistinctChangesOnly: true,
  })
  foos!: QueryList<any>;
}
```
For backward compatibility before v12
`emitDistinctChangesOnlyDefaultValue` was set to `false`. This change
changes the default to `true`.
* **core:** The type of the `APP_INITIALIZER` token has been changed to more accurately
reflect the types of return values that are handled by Angular. Previously,
each initializer callback was typed to return `any`, this is now
`Promise<unknown> | Observable<unknown> | void`. In the unlikely event that
your application uses the `Injector.get` or `TestBed.inject` API to inject
the `APP_INITIALIZER` token, you may need to update the code to account for
the stricter type.

Additionally, TypeScript may report the TS2742 error if the `APP_INITIALIZER`
token is used in an expression of which its inferred type has to be emitted
into a .d.ts file. To workaround this, an explicit type annotation is needed,
which would typically be `Provider` or `Provider[]`.
* **core:** Minimum supported `zone.js` version is `0.11.4`
* **forms:** The `emitEvent` option was added to the following `FormArray` and `FormGroup` methods:

* FormGroup.addControl
* FormGroup.removeControl
* FormGroup.setControl
* FormArray.push
* FormArray.insert
* FormArray.removeAt
* FormArray.setControl
* FormArray.clear

If your app has custom classes that extend `FormArray` or `FormGroup` classes and override the
above-mentioned methods, you may need to update your implementation to take the new options into
account and make sure that overrides are compatible from a types perspective.
* **forms:** Previously `min` and `max` attributes defined on the `<input type="number">`
were ignored by Forms module. Now presence of these attributes would
trigger min/max validation logic (in case `formControl`, `formControlName`
or `ngModel` directives are also present on a given input) and
corresponding form control status would reflect that.
* **platform-browser:** `XhrFactory` has been moved from `@angular/common/http` to `@angular/common`.

**Before**
```ts
import {XhrFactory} from '@angular/common/http';
```

**After**
```ts
import {XhrFactory} from '@angular/common';
```

* **router:** Strict null checks will report on fragment potentially being null.
Migration path: add null check.
* **router:** The type of the `RouterLinkActive.routerLinkActiveOptions` input was
expanded to allow more fine-tuned control. Code that previously read
this property may need to be updated to account for the new type.



<a name="11.2.14"></a>
# 11.2.14 (2021-05-12)
### core
| Commit | Description |
| -- | -- |
| 5bb7c0ef3a | fix(core): do not retain dynamically compiled components and modules (#42003) |
| 40cc29aa6e | fix(core): invoke profiler around ngOnDestroy lifecycle hooks (#41969) |
### platform-browser
| Commit | Description |
| -- | -- |
| f66c9ae749 | fix(platform-browser): prevent memory leak of style nodes if shadow DOM encapsulation is used (#42005) |
## Special Thanks:
Alex Rickabaugh, Andrew J Asche, Georgii Dolzhykov, Joey Perrott, Joost Koehoorn, Julien Marcou, Kapunahele Wong, Pete Bacon Darwin, Richard Sithole, Teri Glover, iRealNirmal, Minko Gechev, profanis and va-stefanek



# 12.1.0-next.1 (2021-05-05)


### Bug Fixes

* **common:** add body as an optional property on the options of HttpClient.delete ([#19438](https://github.com/angular/angular/issues/19438)) ([#41723](https://github.com/angular/angular/issues/41723)) ([6b8baad](https://github.com/angular/angular/commit/6b8baad94096225837dddc6ccf0826c59582d467))
* **compiler-cli:** expose the linker as a Babel plugin ([#41918](https://github.com/angular/angular/issues/41918)) ([6eafaa7](https://github.com/angular/angular/commit/6eafaa7b5e2b85e53b4213f9f7756474609a0fa3))
* **compiler-cli:** prefer non-aliased exports in reference emitters ([#41866](https://github.com/angular/angular/issues/41866)) ([35450c7](https://github.com/angular/angular/commit/35450c78f7908d43c1d7d8598c915a8c86a28d2e)), closes [#41443](https://github.com/angular/angular/issues/41443) [#41277](https://github.com/angular/angular/issues/41277)
* **core:** handle multiple i18n attributes with expression bindings ([#41882](https://github.com/angular/angular/issues/41882)) ([9b4b281](https://github.com/angular/angular/commit/9b4b281c5223084834019664fbe5248521caadae)), closes [#41869](https://github.com/angular/angular/issues/41869)


### Features

* **compiler:** support directive selectors with attributes containing `$` ([#41567](https://github.com/angular/angular/issues/41567)) ([1758d02](https://github.com/angular/angular/commit/1758d0297267a8d46042d2f926eebb2263a345e5)), closes [#41244](https://github.com/angular/angular/issues/41244) [#41500](https://github.com/angular/angular/issues/41500) [#41500](https://github.com/angular/angular/issues/41500)


### Performance Improvements

* **core:** minor improvements to listener instructions ([#41807](https://github.com/angular/angular/issues/41807)) ([6581a1b](https://github.com/angular/angular/commit/6581a1b48dc6a3ddb6d371d26d765aaa0f0b04c1))


### BREAKING CHANGES

* Minified UMD bundles are no longer included in the distributed NPM packages.
* **core:** Angular no longer maintains support for node v10
* **core:** Previously the `ng.getDirectives` function threw an error in case a
given DOM node had no Angular context associated with it (for example
if a function was called for a DOM element outside of an Angular app).
This behavior was inconsistent with other debugging utilities under `ng`
namespace, which handled this situation without raising an exception.
Now calling the `ng.getDirectives` function for such DOM nodes would
result in an empty array returned from that function.
* **compiler-cli:** Linked libraries no longer generate legacy i18n message ids. Any downstream
application that provides translations for these messages, will need to
migrate their message ids using the `localize-migrate` command line tool.



## 11.2.13 (2021-05-05)


### Bug Fixes

* **animations:** ensure consistent transition namespace ordering ([#19854](https://github.com/angular/angular/issues/19854)) ([a58562a](https://github.com/angular/angular/commit/a58562a515492f827e5215bca184a332a68fb538))
* **common:** add  right ContentType for boolean values with HttpClient request body([#38924](https://github.com/angular/angular/issues/38924)) ([#41885](https://github.com/angular/angular/issues/41885)) ([ae0fa08](https://github.com/angular/angular/commit/ae0fa0885eb0dd91b3ce77d2a7d948aa64ca41f0))
* **core:** AsyncPipe now compatible with RxJS 7 ([#41590](https://github.com/angular/angular/issues/41590)) ([7a86ebf](https://github.com/angular/angular/commit/7a86ebfcf6d0a2beb66ae628e58ef0741d624e11))
* **core:** handle multiple i18n attributes with expression bindings ([#41912](https://github.com/angular/angular/issues/41912)) ([345f5c4](https://github.com/angular/angular/commit/345f5c487aad26551cd510f13223a71ceae3f634)), closes [#41869](https://github.com/angular/angular/issues/41869)
* **localize:** relax error to warning for missing target ([#41944](https://github.com/angular/angular/issues/41944)) ([3150f9f](https://github.com/angular/angular/commit/3150f9f66db3d3bd81425341dd5921c6f42324e6)), closes [#21690](https://github.com/angular/angular/issues/21690)



## 11.2.12 (2021-04-28)


### Bug Fixes

* **compiler:** strip scoped selectors from `[@font-face](https://github.com/font-face)` rules ([#41815](https://github.com/angular/angular/issues/41815)) ([de39b49](https://github.com/angular/angular/commit/de39b49c6d8f95ab96feeecc7b8867cf3b4c0ea4)), closes [#41751](https://github.com/angular/angular/issues/41751)
* **upgrade:** preserve $interval.flush when ngMocks is being used ([#30229](https://github.com/angular/angular/issues/30229)) ([dd46b87](https://github.com/angular/angular/commit/dd46b87bc7c2bb47ef1c57f0de2598cdd6f537e6))



## 11.2.11 (2021-04-21)


### Bug Fixes

* **common:** viewport scroller not finding elements inside the shadow DOM ([#41644](https://github.com/angular/angular/issues/41644)) ([3aa9235](https://github.com/angular/angular/commit/3aa92355ef730e19d8c7b555a35c3e68b76e37ba)), closes [#41470](https://github.com/angular/angular/issues/41470)
* **compiler-cli:** autocomplete literal types in templates ([296f887](https://github.com/angular/angular/commit/296f8873832a369f3c512fcba3215a6fcdb71e66))
* **router:** Only retrieve stored route when reuse strategy indicates it should reattach ([#30263](https://github.com/angular/angular/issues/30263)) ([f4376fc](https://github.com/angular/angular/commit/f4376fc0d45f1658555c5ac29c3dee93bdfb43fc)), closes  [#23162](https://github.com/angular/angular/issues/23162)
* **router:** recursively merge empty path matches ([#41584](https://github.com/angular/angular/issues/41584)) ([8d62813](https://github.com/angular/angular/commit/8d6281311c8c21d4f113fdfdd8e5736e297ec184)), closes [#41481](https://github.com/angular/angular/issues/41481)



## 11.2.10 (2021-04-14)


### Bug Fixes

* **compiler-cli:** prevent eliding default imports in incremental recompilations ([#41586](https://github.com/angular/angular/issues/41586)) ([43050a1](https://github.com/angular/angular/commit/43050a16de1dfcf8090461d9bc8d9804a98d3403)), closes [#41377](https://github.com/angular/angular/issues/41377)
* **compiler-cli:** show a more specific error for Ivy NgModules ([#41534](https://github.com/angular/angular/issues/41534)) ([09eb125](https://github.com/angular/angular/commit/09eb1257d86061a26551d11efc042ba864b343d3))
* **core:** error if DebugRenderer2.destroyNode is called twice in a row ([#41565](https://github.com/angular/angular/issues/41565)) ([419c189](https://github.com/angular/angular/commit/419c189ad3620cbe02e1927875ca7fa72a46627f))
* **language-service:** bound attributes should not break directive matching ([#41597](https://github.com/angular/angular/issues/41597)) ([3dbcc7f](https://github.com/angular/angular/commit/3dbcc7f7a1f011f007c6b5abc2aff228bffba9b6)), closes [/github.com/angular/angular/blob/cdf1ea1951fb7187b1f6c9bb8a847c859c41e0b8/packages/compiler/src/render3/view/util.ts#L174-L206](https://github.com//github.com/angular/angular/blob/cdf1ea1951fb7187b1f6c9bb8a847c859c41e0b8/packages/compiler/src/render3/view/util.ts/issues/L174-L206)
* **language-service:** resolve to the pre-compiled style when compiled css url is provided ([#41538](https://github.com/angular/angular/issues/41538)) ([3d54980](https://github.com/angular/angular/commit/3d549809c3c8659197f323fc78a9fb3756e9969e)), closes [angular/vscode-ng-language-service#1263](https://github.com/angular/vscode-ng-language-service/issues/1263)
* **language-service:** use 'any' instead of failing for inline TCBs ([#41513](https://github.com/angular/angular/issues/41513)) ([f76873e](https://github.com/angular/angular/commit/f76873e4d5aefe9276873ee0270c331561329d9c)), closes [#41395](https://github.com/angular/angular/issues/41395)
* **router:** handle new navigations from a NavigationEnd event ([#41262](https://github.com/angular/angular/issues/41262)) ([#41511](https://github.com/angular/angular/issues/41511)) ([e34299a](https://github.com/angular/angular/commit/e34299af256326366ef2176bd905d9a64158f2df)), closes [#37460](https://github.com/angular/angular/issues/37460)
* **router:** Remove information about attached component when deactivating route ([#41381](https://github.com/angular/angular/issues/41381)) ([646f4a1](https://github.com/angular/angular/commit/646f4a1fe6057b0c70d61a20f3aecf28e71654da)), closes [#41379](https://github.com/angular/angular/issues/41379)


### Performance Improvements

* **compiler-cli:** allow incremental compilation in the presence of redirected source files ([#41587](https://github.com/angular/angular/issues/41587)) ([616145e](https://github.com/angular/angular/commit/616145e1a7aa594a26345ac0af909ecbacbe7b70))



## 11.2.9 (2021-04-07)


### Bug Fixes

* **bazel:** add missing dependency on `tslib` ([#41480](https://github.com/angular/angular/issues/41480)) ([8d005e5](https://github.com/angular/angular/commit/8d005e51322b68bb66ff311fc78fa34dd440b123)), closes [11.2.8/src/api-extractor/index.js#L20](https://github.com/11.2.8/src/api-extractor/index.js/issues/L20)
* **compiler-cli:** Allow analysis to continue with invalid style url ([#41403](https://github.com/angular/angular/issues/41403)) ([#41489](https://github.com/angular/angular/issues/41489)) ([07131fa](https://github.com/angular/angular/commit/07131fa8ef9f9e6930cf297c27e450c15fb4f10b))
* **compiler-cli:** fix extending angularCompilerOptions from non relative extension less TypeScript configuration files ([#41349](https://github.com/angular/angular/issues/41349)) ([e0165fd](https://github.com/angular/angular/commit/e0165fd7f8374694c1f9d74ecdea5af4f8bba4c7)), closes [#41343](https://github.com/angular/angular/issues/41343)


### Features

* **bazel:** allow setting `compilationMode` in `ng_module` rule ([#41418](https://github.com/angular/angular/issues/41418)) ([e6da38a](https://github.com/angular/angular/commit/e6da38a5e017bbb2e52857472363b5ab2cd84281))


### Performance Improvements

* **core:** add private hooks around user code executed by the runtime ([#41421](https://github.com/angular/angular/issues/41421)) ([94af9d9](https://github.com/angular/angular/commit/94af9d95bbde5d068e89d6697d87851dc246a88f))
* **language-service:** add perf tracing to LanguageService ([#41401](https://github.com/angular/angular/issues/41401)) ([7b0a800](https://github.com/angular/angular/commit/7b0a800b69170c6d32cc49dbc8961b2e2821fe40))



## 11.2.8 (2021-04-01)


### Bug Fixes

* **compiler:** handle case-sensitive CSS custom properties ([#41380](https://github.com/angular/angular/issues/41380)) ([f9da272](https://github.com/angular/angular/commit/f9da27214b74d60d398cf46493767711e710635c)), closes [#41364](https://github.com/angular/angular/issues/41364)



## 11.2.7 (2021-03-24)


### Bug Fixes

* **compiler:** correctly process multiple rules containing `:host` selectors ([#41261](https://github.com/angular/angular/issues/41261)) ([f358d6b](https://github.com/angular/angular/commit/f358d6b113e1a8215fcb50dbc3c5db8799699901)), closes [#41237](https://github.com/angular/angular/issues/41237)
* **compiler-cli:** add `useInlining` option to type check config ([#41268](https://github.com/angular/angular/issues/41268)) ([57644e9](https://github.com/angular/angular/commit/57644e95aadbfe9c8f336be77a22f7a5e1859758)), closes [#40963](https://github.com/angular/angular/issues/40963)
* **core:** remove obsolete check for [class] and [className] presence ([#41254](https://github.com/angular/angular/issues/41254)) ([8a53b54](https://github.com/angular/angular/commit/8a53b5454eea7b4db09498d9018687aa0b0ca7f3))
* **language-service:** show suggestion when type inference is suboptimal ([#41072](https://github.com/angular/angular/issues/41072)) ([18cd7a0](https://github.com/angular/angular/commit/18cd7a0c6921983556fe1fffbff93d42ae138007)), closes [angular/vscode-ng-language-service#1155](https://github.com/angular/vscode-ng-language-service/issues/1155) [#41042](https://github.com/angular/angular/issues/41042)



## 11.2.6 (2021-03-17)


### Bug Fixes

* **core:** remove duplicated EMPTY_OBJ constant ([#41153](https://github.com/angular/angular/issues/41153)) ([fa97166](https://github.com/angular/angular/commit/fa97166361b17802f8d1771e18b47ac55a117a53))
* **forms:** properly handle the change to the FormGroup shape ([#40829](https://github.com/angular/angular/issues/40829)) ([60ac964](https://github.com/angular/angular/commit/60ac9643334b83b6b720afd1b7d7fadf02c4e7fc)), closes [#13788](https://github.com/angular/angular/issues/13788)
* **localize:** render correct closing tag placeholder names in XLIFF 2 ([#41152](https://github.com/angular/angular/issues/41152)) ([7dbb550](https://github.com/angular/angular/commit/7dbb550946031d212b334b9e805e198232bc933b)), closes [#41142](https://github.com/angular/angular/issues/41142)
* **localize:** trim extracted `equiv-text` values ([#41180](https://github.com/angular/angular/issues/41180)) ([ed6c09a](https://github.com/angular/angular/commit/ed6c09ae45faa598b505c68bd68fe0d1ba3300c4)), closes [#41176](https://github.com/angular/angular/issues/41176)
* **ngcc:** do not compile JavaScript sources if typings-only processing is repeated ([#41209](https://github.com/angular/angular/issues/41209)) ([be050b2](https://github.com/angular/angular/commit/be050b2582eed2ad036fb4dd679926a146e17264)), closes [#41198](https://github.com/angular/angular/issues/41198)


### Performance Improvements

* **forms:** avoid direct references to the `Validators` class ([#41189](https://github.com/angular/angular/issues/41189)) ([#41220](https://github.com/angular/angular/issues/41220)) ([804b6b6](https://github.com/angular/angular/commit/804b6b66853aa53f446b3e9c3cb921ae8cb794c2))
* **forms:** make `FormBuilder` class tree-shakable ([#41126](https://github.com/angular/angular/issues/41126)) ([ffc93e0](https://github.com/angular/angular/commit/ffc93e0946dc7c5a2a64a25a97dbae551b3ffbec))
* **forms:** make `RadioControlRegistry` class tree-shakable ([#41126](https://github.com/angular/angular/issues/41126)) ([6414590](https://github.com/angular/angular/commit/6414590f8d09d5d33a9022b023e025fc1452f5b5))
* **forms:** make built-in ControlValueAccessors more tree-shakable ([#41146](https://github.com/angular/angular/issues/41146)) ([#41197](https://github.com/angular/angular/issues/41197)) ([5908eda](https://github.com/angular/angular/commit/5908eda7c11ebff169d07598e54f62d7e35f6580))



## 11.2.5 (2021-03-10)


### Bug Fixes

* **bazel:** fix incorrect rollup plugin method signature ([#41101](https://github.com/angular/angular/issues/41101)) ([925746b](https://github.com/angular/angular/commit/925746b6d8a84ce7281e9044f88bb1146dc1cd44))
* **language-service:** Only provide dom completions for inline templates ([#41078](https://github.com/angular/angular/issues/41078)) ([a05eb13](https://github.com/angular/angular/commit/a05eb13caa546e23caa2dee37435e549059d17c3))


### Performance Improvements

* **compiler-cli:** avoid module resolution in cycle analysis ([#40948](https://github.com/angular/angular/issues/40948)) ([532ae73](https://github.com/angular/angular/commit/532ae73738ded1764209072c4c1b17553d18f009))
* **compiler-cli:** detect semantic changes and their effect on an incremental rebuild ([#40947](https://github.com/angular/angular/issues/40947)) ([e35ecea](https://github.com/angular/angular/commit/e35eceabac6aef10a0505bcb08572ab0bafa70da)), closes [#34867](https://github.com/angular/angular/issues/34867) [#40635](https://github.com/angular/angular/issues/40635) [#40728](https://github.com/angular/angular/issues/40728)
* **compiler-cli:** ensure module resolution cache is reused for type-check program ([#39693](https://github.com/angular/angular/issues/39693)) ([16f90ca](https://github.com/angular/angular/commit/16f90cac4b78d8a9207ecbbcf515518bc01cb7b2))
* **compiler-cli:** use bound symbol in import graph in favor of module resolution ([#40948](https://github.com/angular/angular/issues/40948)) ([2035b15](https://github.com/angular/angular/commit/2035b15d7a35418ead6347c4e2cc0d9816a643d9))



## 11.2.4 (2021-03-03)


### Bug Fixes

* **compiler:** allow binding to autocomplete property on select and textarea elements ([#40928](https://github.com/angular/angular/issues/40928)) ([20fb638](https://github.com/angular/angular/commit/20fb63812ce4d750fe5d71fe7aa70ed5ac9b07c7)), closes [#39490](https://github.com/angular/angular/issues/39490)
* **compiler:** ensure JIT compilation of ɵɵngDeclarePipe() works ([#40929](https://github.com/angular/angular/issues/40929)) ([55eb7b5](https://github.com/angular/angular/commit/55eb7b5681ef4ef921dc690a2a1f0621aaf56e4e))
* **compiler:** recover from an incomplete open tag at the end of a file ([#41054](https://github.com/angular/angular/issues/41054)) ([c675acd](https://github.com/angular/angular/commit/c675acda7f42dba4709d1a7a898313f86ae7ad8e))
* **compiler-cli:** `readConfiguration` existing options should override options in tsconfig ([#40694](https://github.com/angular/angular/issues/40694)) ([#41036](https://github.com/angular/angular/issues/41036)) ([2f3e2df](https://github.com/angular/angular/commit/2f3e2dff33c298cf5824372fe85c1de781c6f1af))
* **compiler-cli:** ensure ngcc can handle wildcard base-paths ([#41033](https://github.com/angular/angular/issues/41033)) ([27d55f6](https://github.com/angular/angular/commit/27d55f6730b923f789798639f8def7f3ce8ad5f4)), closes [#41014](https://github.com/angular/angular/issues/41014)
* **compiler-cli:** extend `angularCompilerOptions` in tsconfig from node ([#40694](https://github.com/angular/angular/issues/40694)) ([#41036](https://github.com/angular/angular/issues/41036)) ([e3ccd56](https://github.com/angular/angular/commit/e3ccd56567fdc7ca00f3a0c7c7e5033b2bece865)), closes [/github.com/microsoft/TypeScript/blob/b346f5764e4d500ebdeff7086e43690ea533a305/src/compiler/commandLineParser.ts#L2603-L2628](https://github.com//github.com/microsoft/TypeScript/blob/b346f5764e4d500ebdeff7086e43690ea533a305/src/compiler/commandLineParser.ts/issues/L2603-L2628) [#36715](https://github.com/angular/angular/issues/36715)
* **language-service:** Add plugin option to force strictTemplates ([#41063](https://github.com/angular/angular/issues/41063)) ([95f748c](https://github.com/angular/angular/commit/95f748c238490edb983df80c8fd2b67f0c6ef24f))
* **language-service:** Always attempt HTML AST to template AST conversion for LS ([#41068](https://github.com/angular/angular/issues/41068)) ([6dd5497](https://github.com/angular/angular/commit/6dd54972d4efa968b84ecf71ac2b306d500a2ed7)), closes [angular/vscode-ng-language-service#1140](https://github.com/angular/vscode-ng-language-service/issues/1140)
* **language-service:** can't provide the Input and Output custom binding property name ([#41005](https://github.com/angular/angular/issues/41005)) ([1b1b65e](https://github.com/angular/angular/commit/1b1b65e1ea4c0b2cde6a267db2ef070395cc09d8))
* **language-service:** don't show external template diagnostics in ts files ([#41070](https://github.com/angular/angular/issues/41070)) ([9322e6a](https://github.com/angular/angular/commit/9322e6a076228cc5ea212f3cbe3bbdb6bb8cea82)), closes [#41032](https://github.com/angular/angular/issues/41032)
* **language-service:** only provide template results on reference requests ([#41041](https://github.com/angular/angular/issues/41041)) ([ef87953](https://github.com/angular/angular/commit/ef87953bc62d43254e3a532b2fe8f16e186f2612))
* **language-service:** provide element completions after open tag < ([#41068](https://github.com/angular/angular/issues/41068)) ([f09e7ab](https://github.com/angular/angular/commit/f09e7abdf0625a565bd890b5aa38274b59d58161)), closes [angular/vscode-ng-language-service#1140](https://github.com/angular/vscode-ng-language-service/issues/1140)
* **ngcc:** do not fail hard when a format-path points to a non-existing or empty file ([#40985](https://github.com/angular/angular/issues/40985)) ([06ff277](https://github.com/angular/angular/commit/06ff277b605760fc0c43346f4997fc5fdfa2ee24)), closes [/github.com/angular/angular/blob/3077c9a1f89c5bd75fb96c16e/packages/compiler-cli/ngcc/src/main.ts#L124](https://github.com//github.com/angular/angular/blob/3077c9a1f89c5bd75fb96c16e/packages/compiler-cli/ngcc/src/main.ts/issues/L124) [#40965](https://github.com/angular/angular/issues/40965)



## 11.2.3 (2021-02-24)


### Performance Improvements

* **language-service:** Skip Angular analysis when quick info requested outside a template ([#40956](https://github.com/angular/angular/issues/40956)) ([0dd1fac](https://github.com/angular/angular/commit/0dd1facc3292aec6b0ca6fd65fc73efae2c194fc))



## 11.2.2 (2021-02-22)


### Bug Fixes

* **animations:** error when setting position before starting animation ([#28255](https://github.com/angular/angular/issues/28255)) ([f1c64b3](https://github.com/angular/angular/commit/f1c64b3f38ed38c2d0c7369f6ee5dea5bbc24cf3))
* **http:** emit error on XMLHttpRequest abort event ([#40786](https://github.com/angular/angular/issues/40786)) ([4a32579](https://github.com/angular/angular/commit/4a32579a4d660b774c380314033e15787dfe4631)), closes [#22324](https://github.com/angular/angular/issues/22324)
* **http:** ignore question mark when params are parsed ([#40610](https://github.com/angular/angular/issues/40610)) ([3b884ed](https://github.com/angular/angular/commit/3b884ed1fc1b1c89c1da9aa6ee0e6b21ff4aa024)), closes [#28722](https://github.com/angular/angular/issues/28722)
* **platform-browser:** ensure that Hammer loader is called only once ([#40911](https://github.com/angular/angular/issues/40911)) ([f8055f6](https://github.com/angular/angular/commit/f8055f6fb839e5817a83c484d96afb77bae0aed5)), closes [#25995](https://github.com/angular/angular/issues/25995)


### Performance Improvements

* **core:** use `ngDevMode` to tree-shake warning ([#40876](https://github.com/angular/angular/issues/40876)) ([c8a2e3a](https://github.com/angular/angular/commit/c8a2e3ae1c12cadd505cdd5a12e26a7231682415))
* **language-service:** short-circuit LS operations when we know there is no Angular information to provide ([#40946](https://github.com/angular/angular/issues/40946)) ([73a3ff1](https://github.com/angular/angular/commit/73a3ff11cbca21ec0a64e064c7968c93c0bd8e0a))



<a name="11.2.1"></a>
## 11.2.1 (2021-02-17)


### Bug Fixes

* **compiler:** handle `:host-context` and `:host` in the same selector ([#40494](https://github.com/angular/angular/issues/40494)) ([ab8ea87](https://github.com/angular/angular/commit/ab8ea8707842b98b8154f5cbe942b4b24724b6ca)), closes [#14349](https://github.com/angular/angular/issues/14349)
* **compiler:** support multiple `:host-context()` selectors ([#40494](https://github.com/angular/angular/issues/40494)) ([c20e304](https://github.com/angular/angular/commit/c20e3047a58ce2404551c0b51d539e77687e7283)), closes [#19199](https://github.com/angular/angular/issues/19199)
* **compiler:** support multiple selectors in `:host-context()` ([#40494](https://github.com/angular/angular/issues/40494)) ([fb0ce21](https://github.com/angular/angular/commit/fb0ce2178add49f204486c41ef94936f0f178086))
* **compiler-cli:** set TS original node on imported namespace identifiers ([#40711](https://github.com/angular/angular/issues/40711)) ([87ac052](https://github.com/angular/angular/commit/87ac05290ac12ccca10580d10d092d747dae9b40))
* **core:** address Trusted Types bug in Chrome 83 ([#40815](https://github.com/angular/angular/issues/40815)) ([b5f2070](https://github.com/angular/angular/commit/b5f20700c2b9c5edebbfeac8c656f290e4d5d7ea))
* **http:** complete the request on timeout ([#40771](https://github.com/angular/angular/issues/40771)) ([a2a5b4a](https://github.com/angular/angular/commit/a2a5b4add5e68cebe89a4d2b6eff2d75e4cd23c7))
* **router:** fix load interaction of navigation and preload strategies ([#40389](https://github.com/angular/angular/issues/40389)) ([4906bf6](https://github.com/angular/angular/commit/4906bf6a50f307fb69080d276c3b91a60ba7fbae)), closes [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557) [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557)
* **router:** fix load interaction of navigation and preload strategies ([#40389](https://github.com/angular/angular/issues/40389)) ([bba1981](https://github.com/angular/angular/commit/bba1981c6e1963e5cd1f2c704bb656ca8fcec531)), closes [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557) [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557)



<a name="11.2.0"></a>
# 11.2.0 (2021-02-10)


### Bug Fixes

* **animations:** properly track listeners for a removed element ([#40712](https://github.com/angular/angular/issues/40712)) ([74cb759](https://github.com/angular/angular/commit/74cb759))
* **common:** date is not correctly formatted when year is between 0 and 99 ([#40448](https://github.com/angular/angular/issues/40448)) ([bf85f04](https://github.com/angular/angular/commit/bf85f04)), closes [#40377](https://github.com/angular/angular/issues/40377)
* **compiler:** include parenthesis in expression source spans ([#40740](https://github.com/angular/angular/issues/40740)) ([e99c4e2](https://github.com/angular/angular/commit/e99c4e2)), closes [#40721](https://github.com/angular/angular/issues/40721)
* **compiler:** throw error for duplicate template references ([#40538](https://github.com/angular/angular/issues/40538)) ([7e0ff8c](https://github.com/angular/angular/commit/7e0ff8c)), closes [#40536](https://github.com/angular/angular/issues/40536)
* **compiler-cli:** don't crash when we can't resolve a resource ([#40660](https://github.com/angular/angular/issues/40660)) ([95446fb](https://github.com/angular/angular/commit/95446fb)), closes [angular/vscode-ng-language-service#1079](https://github.com/angular/vscode-ng-language-service/issues/1079)
* **core:** properly move embedded views of dynamic component's projectable nodes ([#37167](https://github.com/angular/angular/issues/37167)) ([9ae21ee](https://github.com/angular/angular/commit/9ae21ee)), closes [#37120](https://github.com/angular/angular/issues/37120)
* **localize:** improve invalid syntax in extraction error message ([#40724](https://github.com/angular/angular/issues/40724)) ([24600ff](https://github.com/angular/angular/commit/24600ff))
* **localize:** support downleveled inlined helper localize calls ([#40754](https://github.com/angular/angular/issues/40754)) ([415ad8d](https://github.com/angular/angular/commit/415ad8d)), closes [#40702](https://github.com/angular/angular/issues/40702)
* **router:** stop emitting to event observable on destroy ([#40638](https://github.com/angular/angular/issues/40638)) ([737bc7a](https://github.com/angular/angular/commit/737bc7a)), closes [#40502](https://github.com/angular/angular/issues/40502)



<a name="11.2.0-rc.0"></a>
# 11.2.0-rc.0 (2021-02-03)

This release contains the same set the of changes as 11.2.0-next.1.


<a name="11.2.0-next.1"></a>
# 11.2.0-next.1 (2021-02-03)


### Bug Fixes

* **common:** parse `YYYY-MM` strings as UTC dates ([#40620](https://github.com/angular/angular/issues/40620)) ([4c5f18d](https://github.com/angular/angular/commit/4c5f18d)), closes [#33944](https://github.com/angular/angular/issues/33944)
* **common:** parse `YYYY` strings as UTC dates ([#40629](https://github.com/angular/angular/issues/40629)) ([46d4326](https://github.com/angular/angular/commit/46d4326)), closes [#33944](https://github.com/angular/angular/issues/33944) [#40620](https://github.com/angular/angular/issues/40620)
* **compiler:** Don't set expression text to synthetic `$implicit` when empty ([#40583](https://github.com/angular/angular/issues/40583)) ([9d396f8](https://github.com/angular/angular/commit/9d396f8))
* **compiler:** exclude trailing whitespace from element source spans ([#40513](https://github.com/angular/angular/issues/40513)) ([7a6d1e2](https://github.com/angular/angular/commit/7a6d1e2)), closes [#39148](https://github.com/angular/angular/issues/39148)
* **compiler-cli:** preserve user line endings in diagnostic template parse ([#40597](https://github.com/angular/angular/issues/40597)) ([caafac2](https://github.com/angular/angular/commit/caafac2))
* **core:** ensure the type `T` of `EventEmitter<T>` can be inferred ([#40644](https://github.com/angular/angular/issues/40644)) ([5c54767](https://github.com/angular/angular/commit/5c54767)), closes [#40637](https://github.com/angular/angular/issues/40637)
* **core:** remove duplicated EMPTY_ARRAY constant ([#40587](https://github.com/angular/angular/issues/40587)) ([cabe8be](https://github.com/angular/angular/commit/cabe8be))


### Performance Improvements

* **language-service:** update NgCompiler via resource-only path when able ([#40585](https://github.com/angular/angular/issues/40585)) ([07a3d7a](https://github.com/angular/angular/commit/07a3d7a))


<a name="11.1.2"></a>
## 11.1.2 (2021-02-03)


### Bug Fixes

* **common:** parse `YYYY-MM` strings as UTC dates ([#40620](https://github.com/angular/angular/issues/40620)) ([cafd4f5](https://github.com/angular/angular/commit/cafd4f5)), closes [#33944](https://github.com/angular/angular/issues/33944)
* **common:** parse `YYYY` strings as UTC dates ([#40629](https://github.com/angular/angular/issues/40629)) ([b823049](https://github.com/angular/angular/commit/b823049)), closes [#33944](https://github.com/angular/angular/issues/33944) [#40620](https://github.com/angular/angular/issues/40620)
* **compiler:** Don't set expression text to synthetic `$implicit` when empty ([#40583](https://github.com/angular/angular/issues/40583)) ([5dab521](https://github.com/angular/angular/commit/5dab521))
* **compiler:** exclude trailing whitespace from element source spans ([#40513](https://github.com/angular/angular/issues/40513)) ([726ec88](https://github.com/angular/angular/commit/726ec88)), closes [#39148](https://github.com/angular/angular/issues/39148)
* **compiler-cli:** preserve user line endings in diagnostic template parse ([#40597](https://github.com/angular/angular/issues/40597)) ([00eeebf](https://github.com/angular/angular/commit/00eeebf))
* **core:** ensure the type `T` of `EventEmitter<T>` can be inferred ([#40644](https://github.com/angular/angular/issues/40644)) ([8f9ba8e](https://github.com/angular/angular/commit/8f9ba8e)), closes [#40637](https://github.com/angular/angular/issues/40637)
* **core:** remove duplicated EMPTY_ARRAY constant ([#40587](https://github.com/angular/angular/issues/40587)) ([abdf25c](https://github.com/angular/angular/commit/abdf25c))


### Performance Improvements

* **language-service:** update NgCompiler via resource-only path when able ([#40680](https://github.com/angular/angular/issues/40680)) ([0047eb3](https://github.com/angular/angular/commit/0047eb3))


<a name="11.1.1"></a>
## 11.1.1 (2021-01-27)


### Bug Fixes

* **compiler-cli:** handle pseudo cycles in inline source-maps ([#40435](https://github.com/angular/angular/issues/40435)) ([566206b](https://github.com/angular/angular/commit/566206b)), closes [#40408](https://github.com/angular/angular/issues/40408)
* **compiler-cli:** use `Map` rather than `object` for map of partial linkers ([#40563](https://github.com/angular/angular/issues/40563)) ([33e0f2b](https://github.com/angular/angular/commit/33e0f2b))
* **core:** fix possible XSS attack in development through SSR ([#40525](https://github.com/angular/angular/issues/40525)) ([97ec6e4](https://github.com/angular/angular/commit/97ec6e4))
* **core:** improve injector debug information in `ngDevMode` ([#40476](https://github.com/angular/angular/issues/40476)) ([4bb38c9](https://github.com/angular/angular/commit/4bb38c9))
* **forms:** allow `patchValue()` method of `FormGroup` and `FormArray` classes to skip `null` values ([#40534](https://github.com/angular/angular/issues/40534)) ([2fab148](https://github.com/angular/angular/commit/2fab148)), closes [#36672](https://github.com/angular/angular/issues/36672) [#21021](https://github.com/angular/angular/issues/21021)
* **forms:** properly cleanup in cases when FormControlName has no CVA ([#40526](https://github.com/angular/angular/issues/40526)) ([72fc6aa](https://github.com/angular/angular/commit/72fc6aa)), closes [#39235](https://github.com/angular/angular/issues/39235) [#40521](https://github.com/angular/angular/issues/40521)
* **language-service:** implement realpath to resolve symlinks ([#40593](https://github.com/angular/angular/issues/40593)) ([77efc27](https://github.com/angular/angular/commit/77efc27))
* **language-service:** recognize incomplete pipe bindings with whitespace ([#40346](https://github.com/angular/angular/issues/40346)) ([d88f18e](https://github.com/angular/angular/commit/d88f18e))
* **localize:** include meaning in generated ARB files ([#40546](https://github.com/angular/angular/issues/40546)) ([5661298](https://github.com/angular/angular/commit/5661298)), closes [#40506](https://github.com/angular/angular/issues/40506)
* **router:** always stringify matrix parameters ([#25095](https://github.com/angular/angular/issues/25095)) ([a8a27ef](https://github.com/angular/angular/commit/a8a27ef)), closes [#23165](https://github.com/angular/angular/issues/23165)
* **router:** Fix occasional error when creating url tree in IE 11 and Edge ([#40488](https://github.com/angular/angular/issues/40488)) ([69fd942](https://github.com/angular/angular/commit/69fd942))
* **service-worker:** handle error with console.error ([#40236](https://github.com/angular/angular/issues/40236)) ([37710b9](https://github.com/angular/angular/commit/37710b9))


### Features

* **language-service:** Add diagnostics to suggest turning on strict mode ([#40568](https://github.com/angular/angular/issues/40568)) ([defa627](https://github.com/angular/angular/commit/defa627))


### Performance Improvements

* **compiler-cli:** introduce fast path for resource-only updates ([#40561](https://github.com/angular/angular/issues/40561)) ([156103c](https://github.com/angular/angular/commit/156103c))
* **core:** simplify bloom bucket computation ([#40489](https://github.com/angular/angular/issues/40489)) ([106734a](https://github.com/angular/angular/commit/106734a))



<a name="11.1.0"></a>
# 11.1.0 (2021-01-20)


### Bug Fixes

* **animations:** getAnimationStyle causes exceptions in older browsers ([#29709](https://github.com/angular/angular/issues/29709)) ([66d863f](https://github.com/angular/angular/commit/66d863f))
* **animations:** replace copy of query selector node-list from "spread" to "for" ([#39646](https://github.com/angular/angular/issues/39646)) ([bfa197f](https://github.com/angular/angular/commit/bfa197f)), closes [#38551](https://github.com/angular/angular/issues/38551)
* **common:** add `HttpParamsOptions` to the public api ([#35829](https://github.com/angular/angular/issues/35829)) ([b33b89d](https://github.com/angular/angular/commit/b33b89d)), closes [#20276](https://github.com/angular/angular/issues/20276)
* **common:** Prefer to use pageXOffset / pageYOffset instance of scrollX / scrollY ([#28262](https://github.com/angular/angular/issues/28262)) ([b1d300d](https://github.com/angular/angular/commit/b1d300d))
* **compiler:** correct the `KeySpan` for animation events and properties ([#40347](https://github.com/angular/angular/issues/40347)) ([524415e](https://github.com/angular/angular/commit/524415e))
* **compiler:** incorrectly interpreting some HostBinding names ([#40233](https://github.com/angular/angular/issues/40233)) ([1045465](https://github.com/angular/angular/commit/1045465)), closes [#40220](https://github.com/angular/angular/issues/40220) [#40230](https://github.com/angular/angular/issues/40230) [#18698](https://github.com/angular/angular/issues/18698)
* **compiler:** recover event parse when animation event name is empty ([#39925](https://github.com/angular/angular/issues/39925)) ([15b15be](https://github.com/angular/angular/commit/15b15be))
* **compiler:** avoid duplicate i18n blocks for i18n attrs on elements with structural directives ([#40077](https://github.com/angular/angular/issues/40077)) ([caa4666](https://github.com/angular/angular/commit/caa4666)), closes [#39942](https://github.com/angular/angular/issues/39942)
* **compiler:** handle strings inside bindings that contain binding characters ([#39826](https://github.com/angular/angular/issues/39826)) ([dc6d40e](https://github.com/angular/angular/commit/dc6d40e)), closes [#39601](https://github.com/angular/angular/issues/39601)
* **compiler:** disallow i18n of security-sensitive attributes ([#39554](https://github.com/angular/angular/issues/39554)) ([c8a99ef](https://github.com/angular/angular/commit/c8a99ef))
* **compiler:** ensure that placeholders have the correct sourceSpan ([#39717](https://github.com/angular/angular/issues/39717)) ([0462a61](https://github.com/angular/angular/commit/0462a61)), closes [#39671](https://github.com/angular/angular/issues/39671)
* **compiler:** only promote Trusted Types to constants when necessary ([#39554](https://github.com/angular/angular/issues/39554)) ([4916870](https://github.com/angular/angular/commit/4916870))
* **compiler:** report better error on interpolation in an expression ([#30300](https://github.com/angular/angular/issues/30300)) ([94e790d](https://github.com/angular/angular/commit/94e790d))
* **compiler-cli:** do not duplicate repeated source-files in rendered source-maps ([#40237](https://github.com/angular/angular/issues/40237)) ([3158858](https://github.com/angular/angular/commit/3158858))
* **compiler-cli:** remove classes in .d.ts files from provider checks ([#40118](https://github.com/angular/angular/issues/40118)) ([973bb40](https://github.com/angular/angular/commit/973bb40))
* **animations:** implement getPosition in browser animation builder ([#39983](https://github.com/angular/angular/issues/39983)) ([ca08625](https://github.com/angular/angular/commit/ca08625))
* **compiler-cli:** correct incremental behavior even with broken imports ([#39923](https://github.com/angular/angular/issues/39923)) ([c7c5b2f](https://github.com/angular/angular/commit/c7c5b2f))
* **compiler-cli:** remove the concept of an errored trait ([#39923](https://github.com/angular/angular/issues/39923)) ([6d42954](https://github.com/angular/angular/commit/6d42954))
* **compiler-cli:** track poisoned scopes with a flag ([#39923](https://github.com/angular/angular/issues/39923)) ([0823622](https://github.com/angular/angular/commit/0823622))
* **compiler-cli:** report error when a reference target is missing instead of crashing ([#39805](https://github.com/angular/angular/issues/39805)) ([453b32f](https://github.com/angular/angular/commit/453b32f)), closes [#38618](https://github.com/angular/angular/issues/38618) [#39744](https://github.com/angular/angular/issues/39744)
* **core:** fix possible XSS attack in development through SSR. ([#40136](https://github.com/angular/angular/issues/40136)) ([47d9b6d](https://github.com/angular/angular/commit/47d9b6d))
* **core:** set `ngDevMode` to `false` when calling `enableProdMode()` ([#40124](https://github.com/angular/angular/issues/40124)) ([70b4816](https://github.com/angular/angular/commit/70b4816))
* **core:** Allow passing AbstractType to the inject function ([#37958](https://github.com/angular/angular/issues/37958)) ([a1b6ad0](https://github.com/angular/angular/commit/a1b6ad0))
* **core:** Ensure OnPush ancestors are marked dirty when events occur ([#39833](https://github.com/angular/angular/issues/39833)) ([68d4a74](https://github.com/angular/angular/commit/68d4a74)), closes [#39832](https://github.com/angular/angular/issues/39832)
* **core:** meta addTag() adds incorrect attribute for httpEquiv ([#32531](https://github.com/angular/angular/issues/32531)) ([ff0a90e](https://github.com/angular/angular/commit/ff0a90e))
* **core:** migration error if program contains files outside of the project ([#39790](https://github.com/angular/angular/issues/39790)) ([1a26f6d](https://github.com/angular/angular/commit/1a26f6d)), closes [#39778](https://github.com/angular/angular/issues/39778)
* **core:** not invoking object's toString when rendering to the DOM ([#39843](https://github.com/angular/angular/issues/39843)) ([11cd37f](https://github.com/angular/angular/commit/11cd37f)), closes [#38839](https://github.com/angular/angular/issues/38839)
* **core:** remove duplicated noop function ([#39761](https://github.com/angular/angular/issues/39761)) ([066126a](https://github.com/angular/angular/commit/066126a))
* **core:** support `Attribute` DI decorator in `deps` section of a token ([#37085](https://github.com/angular/angular/issues/37085)) ([f5cbf0b](https://github.com/angular/angular/commit/f5cbf0b)), closes [#36479](https://github.com/angular/angular/issues/36479)
* **core:** remove application from the testability registry when the root view is removed ([#39876](https://github.com/angular/angular/issues/39876)) ([df27027](https://github.com/angular/angular/commit/df27027)), closes [#22106](https://github.com/angular/angular/issues/22106)
* **core:** Support extending differs from root `NgModule` ([#39981](https://github.com/angular/angular/issues/39981)) ([5fc4508](https://github.com/angular/angular/commit/5fc4508)), closes [#25015](https://github.com/angular/angular/issues/25015) [#11309](https://github.com/angular/angular/issues/11309) [#18554](https://github.com/angular/angular/issues/18554)
* **core:** unsubscribe from the `onError` when the root view is removed ([#39940](https://github.com/angular/angular/issues/39940)) ([5a3a154](https://github.com/angular/angular/commit/5a3a154))
* **core:** `QueryList` should not fire changes if the underlying list did not change. ([#40091](https://github.com/angular/angular/issues/40091)) ([76f3633](https://github.com/angular/angular/commit/76f3633))
* **core:** fix fakeAsync() error messages ([#40442](https://github.com/angular/angular/issues/40442)) ([ad2b50b](https://github.com/angular/angular/commit/ad2b50b))
* **forms:** error if control is removed as a result of another one being reset ([#40462](https://github.com/angular/angular/issues/40462)) ([2c5ad5c](https://github.com/angular/angular/commit/2c5ad5c)), closes [#33401](https://github.com/angular/angular/issues/33401)
* **forms:** clean up connection between FormControl/FormGroup and corresponding directive instances ([#39235](https://github.com/angular/angular/issues/39235)) ([a384961](https://github.com/angular/angular/commit/a384961)), closes [#20007](https://github.com/angular/angular/issues/20007) [#37431](https://github.com/angular/angular/issues/37431) [#39590](https://github.com/angular/angular/issues/39590)
* **language-service:** fix go to definition for template variables and references ([#40455](https://github.com/angular/angular/issues/40455)) ([#40491](https://github.com/angular/angular/issues/40491)) ([3e134e4](https://github.com/angular/angular/commit/3e134e4))
* **language-service:** Paths on Windows should be normalized ([#40492](https://github.com/angular/angular/issues/40492)) ([b8e47e2](https://github.com/angular/angular/commit/b8e47e2)), closes [/github.com/angular/vscode-ng-language-service/blob/9fca9c66510974c26d5c21b31adb9fa39ac0a38a/server/src/session.ts#L594](https://github.com//github.com/angular/vscode-ng-language-service/blob/9fca9c66510974c26d5c21b31adb9fa39ac0a38a/server/src/session.ts/issues/L594)
* **language-service:** report non-template diagnostics ([#40331](https://github.com/angular/angular/issues/40331)) ([4db89f4](https://github.com/angular/angular/commit/4db89f4))
* **language-service:** diagnostic and definition should work for absolute url ([#40406](https://github.com/angular/angular/issues/40406)) ([625d2c2](https://github.com/angular/angular/commit/625d2c2))
* **language-service:** reinstate overridden compiler option after change ([#40364](https://github.com/angular/angular/issues/40364)) ([811cacc](https://github.com/angular/angular/commit/811cacc))
* **language-service:** Support 'find references' for two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([ebb7ac5](https://github.com/angular/angular/commit/ebb7ac5))
* **language-service:** Support 'go to definition' for two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([a9d8c22](https://github.com/angular/angular/commit/a9d8c22))
* **language-service:** Support completions of two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([7d74853](https://github.com/angular/angular/commit/7d74853))
* **language-service:** Do not include $event parameter in reference results ([#40158](https://github.com/angular/angular/issues/40158)) ([d466db8](https://github.com/angular/angular/commit/d466db8)), closes [#40157](https://github.com/angular/angular/issues/40157)
* **language-service:** include compilerOptions.rootDir in rootDirs ([#40243](https://github.com/angular/angular/issues/40243)) ([a62416c](https://github.com/angular/angular/commit/a62416c)), closes [angular/vscode-ng-language-service#1039](https://github.com/angular/vscode-ng-language-service/issues/1039)
* **language-service:** LSParseConfigHost.resolve should not concat abs paths ([#40242](https://github.com/angular/angular/issues/40242)) ([0264f76](https://github.com/angular/angular/commit/0264f76))
* **language-service:** return all typecheck files via getExternalFiles ([#40162](https://github.com/angular/angular/issues/40162)) ([183fb7e](https://github.com/angular/angular/commit/183fb7e))
* **language-service:** shorthand syntax with variables ([#40239](https://github.com/angular/angular/issues/40239)) ([12cb39c](https://github.com/angular/angular/commit/12cb39c))
* **language-service:** force compileNonExportedClasses: false in LS ([#40092](https://github.com/angular/angular/issues/40092)) ([028e4f7](https://github.com/angular/angular/commit/028e4f7))
* **language-service:** Prevent matching nodes after finding a keySpan ([#40047](https://github.com/angular/angular/issues/40047)) ([1bf1b68](https://github.com/angular/angular/commit/1bf1b68))
* **language-service:** do not return external template that does not exist ([#39898](https://github.com/angular/angular/issues/39898)) ([2b84882](https://github.com/angular/angular/commit/2b84882))
* **language-service:** do not treat file URIs as general URLs ([#39917](https://github.com/angular/angular/issues/39917)) ([3b70098](https://github.com/angular/angular/commit/3b70098))
* **localize:** ensure extracted messages are serialized in a consistent order ([#40192](https://github.com/angular/angular/issues/40192)) ([212245f](https://github.com/angular/angular/commit/212245f)), closes [#39262](https://github.com/angular/angular/issues/39262)
* **ngcc:** copy (and update) source-maps for unmodified source files ([#40429](https://github.com/angular/angular/issues/40429)) ([e2e3862](https://github.com/angular/angular/commit/e2e3862)), closes [#40358](https://github.com/angular/angular/issues/40358)
* **service-worker:** handle error with ErrorHandler ([#39990](https://github.com/angular/angular/issues/39990)) ([74e42cf](https://github.com/angular/angular/commit/74e42cf)), closes [#39913](https://github.com/angular/angular/issues/39913)
* **router:** correctly handle string command in outlets ([#39728](https://github.com/angular/angular/issues/39728)) ([c33a823](https://github.com/angular/angular/commit/c33a823)), closes [#18928](https://github.com/angular/angular/issues/18928)
* **router:** lazy loaded modules without RouterModule.forChild() won't cause an infinite loop ([#36605](https://github.com/angular/angular/issues/36605)) ([6675b6f](https://github.com/angular/angular/commit/6675b6f)), closes [#29164](https://github.com/angular/angular/issues/29164)
* **router:** remove duplicated getOutlet function ([#39764](https://github.com/angular/angular/issues/39764)) ([5fa7673](https://github.com/angular/angular/commit/5fa7673))
* **service-worker:** correctly handle failed cache-busted request ([#39786](https://github.com/angular/angular/issues/39786)) ([6046419](https://github.com/angular/angular/commit/6046419)), closes [#39775](https://github.com/angular/angular/issues/39775) [#39775](https://github.com/angular/angular/issues/39775)
* **upgrade:** avoid memory leak when removing downgraded components ([#39965](https://github.com/angular/angular/issues/39965)) ([6dc43a4](https://github.com/angular/angular/commit/6dc43a4)), closes [#26209](https://github.com/angular/angular/issues/26209) [#39911](https://github.com/angular/angular/issues/39911) [#39921](https://github.com/angular/angular/issues/39921)
* **upgrade:** fix HMR for hybrid applications ([#40045](https://github.com/angular/angular/issues/40045)) ([b4b21bd](https://github.com/angular/angular/commit/b4b21bd)), closes [#39935](https://github.com/angular/angular/issues/39935)


### Performance Improvements

* **animations:** use `ngDevMode` to tree-shake warning ([#39964](https://github.com/angular/angular/issues/39964)) ([9ebe423](https://github.com/angular/angular/commit/9ebe423))
* **common:** use `ngDevMode` to tree-shake warnings ([#39964](https://github.com/angular/angular/issues/39964)) ([f022efa](https://github.com/angular/angular/commit/f022efa))
* **core:** use `ngDevMode` to tree-shake `checkNoChanges` ([#39964](https://github.com/angular/angular/issues/39964)) ([e1fe9ec](https://github.com/angular/angular/commit/e1fe9ec))
* **core:** use `ngDevMode` to tree-shake warnings ([#39959](https://github.com/angular/angular/issues/39959)) ([8b0cccc](https://github.com/angular/angular/commit/8b0cccc))
* **core:** make DI decorators tree-shakable when used for `useFactory` deps config ([#40145](https://github.com/angular/angular/issues/40145)) ([0664d75](https://github.com/angular/angular/commit/0664d75)), closes [#40143](https://github.com/angular/angular/issues/40143)
* **forms:** use `ngDevMode` to tree-shake `_ngModelWarning` ([#39964](https://github.com/angular/angular/issues/39964)) ([7954c8d](https://github.com/angular/angular/commit/7954c8d))
* **ngcc:** do not copy files that have been processed ([#40429](https://github.com/angular/angular/issues/40429)) ([798aae4](https://github.com/angular/angular/commit/798aae4))


### Features

* **common:** allow any Subscribable in async pipe ([#39627](https://github.com/angular/angular/issues/39627)) ([c7f4abf](https://github.com/angular/angular/commit/c7f4abf))
* **compiler:** recover expression parsing in more malformed pipe cases ([#39437](https://github.com/angular/angular/issues/39437)) ([e336572](https://github.com/angular/angular/commit/e336572))
* **compiler:** support recovery of malformed property writes ([#39103](https://github.com/angular/angular/issues/39103)) ([e44e10b](https://github.com/angular/angular/commit/e44e10b))
* **compiler:** add schema for Trusted Types sinks ([#39554](https://github.com/angular/angular/issues/39554)) ([358c50e](https://github.com/angular/angular/commit/358c50e))
* **compiler:** support error reporting in I18nMetaVisitor ([#39554](https://github.com/angular/angular/issues/39554)) ([bb70a9b](https://github.com/angular/angular/commit/bb70a9b))
* **compiler:** support tagged template literals in code generator ([#39122](https://github.com/angular/angular/issues/39122)) ([ef89274](https://github.com/angular/angular/commit/ef89274))
* **compiler:** allow trailing comma in array literal ([#22277](https://github.com/angular/angular/issues/22277)) ([8d613c1](https://github.com/angular/angular/commit/8d613c1)), closes [#20773](https://github.com/angular/angular/issues/20773)
* **compiler-cli:** implement partial directive declaration linking ([#39518](https://github.com/angular/angular/issues/39518)) ([87e9cd6](https://github.com/angular/angular/commit/87e9cd6))
* **compiler-cli:** partial compilation of directives ([#39518](https://github.com/angular/angular/issues/39518)) ([8c0a92b](https://github.com/angular/angular/commit/8c0a92b))
* **compiler-cli:** add support for using TypeScript 4.1 ([#39571](https://github.com/angular/angular/issues/39571)) ([a7e7c21](https://github.com/angular/angular/commit/a7e7c21))
* **compiler-cli:** support for partial compilation of components ([#39707](https://github.com/angular/angular/issues/39707)) ([e75244e](https://github.com/angular/angular/commit/e75244e))
* **compiler-cli:** expose function to allow short-circuiting of linking ([#40137](https://github.com/angular/angular/issues/40137)) ([7dcf286](https://github.com/angular/angular/commit/7dcf286))
* **compiler-cli:** JIT compilation of component declarations ([#40127](https://github.com/angular/angular/issues/40127)) ([d4327d5](https://github.com/angular/angular/commit/d4327d5))
* **compiler-cli:** JIT compilation of directive declarations ([#40101](https://github.com/angular/angular/issues/40101)) ([9186f1f](https://github.com/angular/angular/commit/9186f1f))
* **core:** add shouldCoalesceRunChangeDetection option to coalesce change detections in the same event loop. ([#39422](https://github.com/angular/angular/issues/39422)) ([5e92d64](https://github.com/angular/angular/commit/5e92d64)), closes [#39348](https://github.com/angular/angular/issues/39348) [#39348](https://github.com/angular/angular/issues/39348)
* **core:** adds get method to QueryList ([#36907](https://github.com/angular/angular/issues/36907)) ([a965589](https://github.com/angular/angular/commit/a965589)), closes [#29467](https://github.com/angular/angular/issues/29467)
* **core:** Add schematic to fix invalid `Route` configs ([#40067](https://github.com/angular/angular/issues/40067)) ([805b4f9](https://github.com/angular/angular/commit/805b4f9))
* **language-service:** log Angular compiler options ([#40364](https://github.com/angular/angular/issues/40364)) ([6a9e328](https://github.com/angular/angular/commit/6a9e328))
* **language-service:** autocomplete pipe binding expressions ([#40032](https://github.com/angular/angular/issues/40032)) ([cbb6eae](https://github.com/angular/angular/commit/cbb6eae))
* **language-service:** autocompletion of element tags ([#40032](https://github.com/angular/angular/issues/40032)) ([e42250f](https://github.com/angular/angular/commit/e42250f))
* **language-service:** autocompletion within expression contexts ([#39727](https://github.com/angular/angular/issues/39727)) ([93a8326](https://github.com/angular/angular/commit/93a8326))
* **language-service:** complete attributes on elements ([#40032](https://github.com/angular/angular/issues/40032)) ([66378ed](https://github.com/angular/angular/commit/66378ed))
* **language-service:** completions for structural directives ([#40032](https://github.com/angular/angular/issues/40032)) ([2a74431](https://github.com/angular/angular/commit/2a74431))
* **language-service:** enable get references for directive and component from template ([#40054](https://github.com/angular/angular/issues/40054)) ([973f797](https://github.com/angular/angular/commit/973f797))
* **language-service:** Add "find references" capability to Ivy integrated LS ([#39768](https://github.com/angular/angular/issues/39768)) ([06a782a](https://github.com/angular/angular/commit/06a782a))
* **language-service:** implement autocompletion for global properties (Ivy) ([#39250](https://github.com/angular/angular/issues/39250)) ([28a0bcb](https://github.com/angular/angular/commit/28a0bcb))
* **language-service:** Implement go to definition for style and template urls ([#39202](https://github.com/angular/angular/issues/39202)) ([563fb6c](https://github.com/angular/angular/commit/563fb6c))
* **localize:** support Application Resource Bundle (ARB) translation file format ([#36795](https://github.com/angular/angular/issues/36795)) ([5684ac5](https://github.com/angular/angular/commit/5684ac5))
* **platform-browser:** add doubletap HammerJS support ([#26362](https://github.com/angular/angular/issues/26362)) ([b5c0f9d](https://github.com/angular/angular/commit/b5c0f9d)), closes [#23954](https://github.com/angular/angular/issues/23954)
* **router:** add `relativeTo` as an input to `routerLink` ([#39720](https://github.com/angular/angular/issues/39720)) ([112324a](https://github.com/angular/angular/commit/112324a)), closes [#13523](https://github.com/angular/angular/issues/13523)



<a name="11.0.9"></a>
## 11.0.9 (2021-01-13)


### Bug Fixes

* **compiler:** incorrectly inferring content type of SVG-specific title tag ([#40259](https://github.com/angular/angular/issues/40259)) ([642c45b](https://github.com/angular/angular/commit/642c45b)), closes [#31503](https://github.com/angular/angular/issues/31503)
* **compiler-cli:** prevent stack overflow in decorator transform for large number of files ([#40374](https://github.com/angular/angular/issues/40374)) ([ff36485](https://github.com/angular/angular/commit/ff36485)), closes [#40276](https://github.com/angular/angular/issues/40276)
* **ngcc:** compute the correct package paths for target entry-points ([#40376](https://github.com/angular/angular/issues/40376)) ([584b78a](https://github.com/angular/angular/commit/584b78a)), closes [#40352](https://github.com/angular/angular/issues/40352) [#40357](https://github.com/angular/angular/issues/40357)
* **router:** better ngZone checking for warning ([#25839](https://github.com/angular/angular/issues/25839)) ([adf42da](https://github.com/angular/angular/commit/adf42da)), closes [#25837](https://github.com/angular/angular/issues/25837)
* **service-worker:** allow checking for updates when constantly polling the server ([#40234](https://github.com/angular/angular/issues/40234)) ([a7befd5](https://github.com/angular/angular/commit/a7befd5)), closes [#40207](https://github.com/angular/angular/issues/40207)
* **service-worker:** ensure SW stays alive while notifying clients about unrecoverable state ([#40234](https://github.com/angular/angular/issues/40234)) ([c01b5ea](https://github.com/angular/angular/commit/c01b5ea))



<a name="11.0.8"></a>
## 11.0.8 (2021-01-11)


### Bug Fixes

* **core:** memory leak if view container host view is destroyed while view ref is not ([#40219](https://github.com/angular/angular/issues/40219)) ([f691e85](https://github.com/angular/angular/commit/f691e85)), closes [#38648](https://github.com/angular/angular/issues/38648)
* **forms:** handle standalone `<form>` tag correctly in `NgControlStatusGroup` directive ([#40344](https://github.com/angular/angular/issues/40344)) ([b3f322f](https://github.com/angular/angular/commit/b3f322f)), closes [#38391](https://github.com/angular/angular/issues/38391)
* **router:** Remove usage of `Object.values` to avoid the need for a polyfill ([#40370](https://github.com/angular/angular/issues/40370)) ([c44dd84](https://github.com/angular/angular/commit/c44dd84))



<a name="11.0.7"></a>
## 11.0.7 (2021-01-07)


### Bug Fixes

* **router:** correctly deactivate children with componentless parent ([#40196](https://github.com/angular/angular/issues/40196)) ([7060ae2](https://github.com/angular/angular/commit/7060ae2)), closes [/github.com/angular/angular/blob/362f45c4bf1bb49a90b014d2053f4c4474d132c0/packages/router/src/operators/activate_routes.ts#L151-L158](https://github.com//github.com/angular/angular/blob/362f45c4bf1bb49a90b014d2053f4c4474d132c0/packages/router/src/operators/activate_routes.ts/issues/L151-L158) [#20694](https://github.com/angular/angular/issues/20694)
* **router:** Remove usage of `Object.entries` to avoid the need for a polyfill ([#40340](https://github.com/angular/angular/issues/40340)) ([6429be1](https://github.com/angular/angular/commit/6429be1))



<a name="11.0.6"></a>
## 11.0.6 (2021-01-06)


### Bug Fixes

* **compiler:** don't report parse error for interpolation inside string in property binding ([#40267](https://github.com/angular/angular/issues/40267)) ([7977509](https://github.com/angular/angular/commit/7977509)), closes [#39826](https://github.com/angular/angular/issues/39826) [#39601](https://github.com/angular/angular/issues/39601)
* **compiler:** incorrectly encapsulating selectors with escape sequences ([#40264](https://github.com/angular/angular/issues/40264)) ([1bfbfaa](https://github.com/angular/angular/commit/1bfbfaa)), closes [#31844](https://github.com/angular/angular/issues/31844)
* **compiler-cli:** handle `\r\n` line-endings correctly in source-mapping ([#40187](https://github.com/angular/angular/issues/40187)) ([b865b32](https://github.com/angular/angular/commit/b865b32)), closes [#40169](https://github.com/angular/angular/issues/40169) [#39654](https://github.com/angular/angular/issues/39654)
* **compiler-cli:** ngcc - remove outdated link ([#40285](https://github.com/angular/angular/issues/40285)) ([0b00d65](https://github.com/angular/angular/commit/0b00d65)), closes [#39837](https://github.com/angular/angular/issues/39837)
* **core:** Call `onDestroy` in production mode as well ([#40120](https://github.com/angular/angular/issues/40120)) ([632fe60](https://github.com/angular/angular/commit/632fe60)), closes [#39876](https://github.com/angular/angular/issues/39876) [#40105](https://github.com/angular/angular/issues/40105)
* **core:** ensure sanitizer works if DOMParser return null body ([#40107](https://github.com/angular/angular/issues/40107)) ([add7cbb](https://github.com/angular/angular/commit/add7cbb)), closes [#39834](https://github.com/angular/angular/issues/39834)
* **core:** error if detectChanges is called at the wrong time under specific circumstances ([#40206](https://github.com/angular/angular/issues/40206)) ([ef13e83](https://github.com/angular/angular/commit/ef13e83)), closes [#38611](https://github.com/angular/angular/issues/38611)
* **core:** take @Host into account while processing `useFactory` arguments ([#40122](https://github.com/angular/angular/issues/40122)) ([#40313](https://github.com/angular/angular/issues/40313)) ([45838c0](https://github.com/angular/angular/commit/45838c0))
* **router:** apply redirects should match named outlets with empty path parents ([#40029](https://github.com/angular/angular/issues/40029)) ([#40315](https://github.com/angular/angular/issues/40315)) ([f542e4e](https://github.com/angular/angular/commit/f542e4e)), closes [#38379](https://github.com/angular/angular/issues/38379) [#38379](https://github.com/angular/angular/issues/38379) [#39952](https://github.com/angular/angular/issues/39952) [#10726](https://github.com/angular/angular/issues/10726) [#30410](https://github.com/angular/angular/issues/30410)
* **router:** Ensure named outlets with empty path parents are recognized ([#40029](https://github.com/angular/angular/issues/40029)) ([#40315](https://github.com/angular/angular/issues/40315)) ([c722c43](https://github.com/angular/angular/commit/c722c43))
* **router:** Router should focus element after scrolling ([#40241](https://github.com/angular/angular/issues/40241)) ([a1dcfc5](https://github.com/angular/angular/commit/a1dcfc5)), closes [#30067](https://github.com/angular/angular/issues/30067)



<a name="11.0.5"></a>
## 11.0.5 (2020-12-16)


### Bug Fixes

* **compiler:** handle strings inside bindings that contain binding characters ([#39826](https://github.com/angular/angular/issues/39826)) ([f5aab2b](https://github.com/angular/angular/commit/f5aab2b)), closes [#39601](https://github.com/angular/angular/issues/39601)
* **core:** fix possible XSS attack in development through SSR. ([#40136](https://github.com/angular/angular/issues/40136)) ([0aa220b](https://github.com/angular/angular/commit/0aa220b))
* **core:** set `ngDevMode` to `false` when calling `enableProdMode()` ([#40124](https://github.com/angular/angular/issues/40124)) ([922f492](https://github.com/angular/angular/commit/922f492))
* **upgrade:** fix HMR for hybrid applications ([#40045](https://github.com/angular/angular/issues/40045)) ([c4c7509](https://github.com/angular/angular/commit/c4c7509)), closes [#39935](https://github.com/angular/angular/issues/39935)



<a name="11.0.4"></a>
## 11.0.4 (2020-12-09)


### Bug Fixes

* **animations:** implement getPosition in browser animation builder ([#39983](https://github.com/angular/angular/issues/39983)) ([5a765f0](https://github.com/angular/angular/commit/5a765f0))
* **compiler-cli:** correct incremental behavior even with broken imports ([#39967](https://github.com/angular/angular/issues/39967)) ([adeeb84](https://github.com/angular/angular/commit/adeeb84))
* **compiler-cli:** remove the concept of an errored trait ([#39967](https://github.com/angular/angular/issues/39967)) ([0aa35ec](https://github.com/angular/angular/commit/0aa35ec))
* **compiler-cli:** track poisoned scopes with a flag ([#39967](https://github.com/angular/angular/issues/39967)) ([178cc51](https://github.com/angular/angular/commit/178cc51))
* **core:** remove application from the testability registry when the root view is removed ([#39876](https://github.com/angular/angular/issues/39876)) ([3680ad1](https://github.com/angular/angular/commit/3680ad1)), closes [#22106](https://github.com/angular/angular/issues/22106)
* **core:** unsubscribe from the `onError` when the root view is removed ([#39940](https://github.com/angular/angular/issues/39940)) ([35309bb](https://github.com/angular/angular/commit/35309bb))
* **language-service:** do not return external template that does not exist ([#39898](https://github.com/angular/angular/issues/39898)) ([6b6fcd7](https://github.com/angular/angular/commit/6b6fcd7))
* **language-service:** do not treat file URIs as general URLs ([#39917](https://github.com/angular/angular/issues/39917)) ([829988b](https://github.com/angular/angular/commit/829988b))
* **service-worker:** handle error with ErrorHandler ([#39990](https://github.com/angular/angular/issues/39990)) ([588dbd3](https://github.com/angular/angular/commit/588dbd3)), closes [#39913](https://github.com/angular/angular/issues/39913)
* **upgrade:** avoid memory leak when removing downgraded components ([#39965](https://github.com/angular/angular/issues/39965)) ([97310d3](https://github.com/angular/angular/commit/97310d3)), closes [#26209](https://github.com/angular/angular/issues/26209) [#39911](https://github.com/angular/angular/issues/39911) [#39921](https://github.com/angular/angular/issues/39921)


### Performance Improvements

* **animations:** use `ngDevMode` to tree-shake warning ([#39964](https://github.com/angular/angular/issues/39964)) ([72aad32](https://github.com/angular/angular/commit/72aad32))
* **common:** use `ngDevMode` to tree-shake warnings ([#39964](https://github.com/angular/angular/issues/39964)) ([bf3de9b](https://github.com/angular/angular/commit/bf3de9b))
* **core:** use `ngDevMode` to tree-shake `checkNoChanges` ([#39964](https://github.com/angular/angular/issues/39964)) ([2fbb684](https://github.com/angular/angular/commit/2fbb684))
* **core:** use `ngDevMode` to tree-shake warnings ([#39959](https://github.com/angular/angular/issues/39959)) ([1e3534f](https://github.com/angular/angular/commit/1e3534f))
* **forms:** use `ngDevMode` to tree-shake `_ngModelWarning` ([#39964](https://github.com/angular/angular/issues/39964)) ([735556d](https://github.com/angular/angular/commit/735556d))



<a name="11.0.3"></a>
## 11.0.3 (2020-12-02)


### Bug Fixes

* **animations:** getAnimationStyle causes exceptions in older browsers ([#29709](https://github.com/angular/angular/issues/29709)) ([cb1d77a](https://github.com/angular/angular/commit/cb1d77a))
* **animations:** replace copy of query selector node-list from "spread" to "for" ([#39646](https://github.com/angular/angular/issues/39646)) ([e95cd2a](https://github.com/angular/angular/commit/e95cd2a)), closes [#38551](https://github.com/angular/angular/issues/38551)
* **common:** Prefer to use pageXOffset / pageYOffset instance of scrollX / scrollY ([#28262](https://github.com/angular/angular/issues/28262)) ([5692607](https://github.com/angular/angular/commit/5692607))
* **compiler:** ensure that placeholders have the correct sourceSpan ([#39717](https://github.com/angular/angular/issues/39717)) ([8ec7156](https://github.com/angular/angular/commit/8ec7156)), closes [#39671](https://github.com/angular/angular/issues/39671)
* **compiler:** report better error on interpolation in an expression ([#30300](https://github.com/angular/angular/issues/30300)) ([6dc74fd](https://github.com/angular/angular/commit/6dc74fd))
* **compiler-cli:** report error when a reference target is missing instead of crashing ([#39805](https://github.com/angular/angular/issues/39805)) ([8634611](https://github.com/angular/angular/commit/8634611)), closes [#38618](https://github.com/angular/angular/issues/38618) [#39744](https://github.com/angular/angular/issues/39744)
* **core:** Ensure OnPush ancestors are marked dirty when events occur ([#39833](https://github.com/angular/angular/issues/39833)) ([01c1bfd](https://github.com/angular/angular/commit/01c1bfd)), closes [#39832](https://github.com/angular/angular/issues/39832)
* **core:** meta addTag() adds incorrect attribute for httpEquiv ([#32531](https://github.com/angular/angular/issues/32531)) ([3114b0a](https://github.com/angular/angular/commit/3114b0a))
* **core:** migration error if program contains files outside of the project ([#39790](https://github.com/angular/angular/issues/39790)) ([7dcc212](https://github.com/angular/angular/commit/7dcc212)), closes [#39778](https://github.com/angular/angular/issues/39778)
* **core:** not invoking object's toString when rendering to the DOM ([#39843](https://github.com/angular/angular/issues/39843)) ([75e22ab](https://github.com/angular/angular/commit/75e22ab)), closes [#38839](https://github.com/angular/angular/issues/38839)
* **core:** remove duplicated noop function ([#39761](https://github.com/angular/angular/issues/39761)) ([26a1337](https://github.com/angular/angular/commit/26a1337))
* **core:** support `Attribute` DI decorator in `deps` section of a token ([#37085](https://github.com/angular/angular/issues/37085)) ([aaa3111](https://github.com/angular/angular/commit/aaa3111)), closes [#36479](https://github.com/angular/angular/issues/36479)
* **router:** correctly handle string command in outlets ([#39728](https://github.com/angular/angular/issues/39728)) ([50c19a2](https://github.com/angular/angular/commit/50c19a2)), closes [#18928](https://github.com/angular/angular/issues/18928)
* **router:** remove duplicated getOutlet function ([#39764](https://github.com/angular/angular/issues/39764)) ([df231ad](https://github.com/angular/angular/commit/df231ad))
* **service-worker:** correctly handle failed cache-busted request ([#39786](https://github.com/angular/angular/issues/39786)) ([7bf73d7](https://github.com/angular/angular/commit/7bf73d7)), closes [#39775](https://github.com/angular/angular/issues/39775) [#39775](https://github.com/angular/angular/issues/39775)

### DEPRECATIONS

* **forms:** Mark the {[key: string]: any} type for the options property of the FormBuilder.group method as deprecated. Using AbstractControlOptions gives the same functionality and is type-safe.



<a name="11.0.2"></a>
## 11.0.2 (2020-11-19)


### Bug Fixes

* **router:** migration incorrectly replacing deprecated key ([#39763](https://github.com/angular/angular/issues/39763)) ([0237845](https://github.com/angular/angular/commit/0237845)), closes [#38762](https://github.com/angular/angular/issues/38762) [#39755](https://github.com/angular/angular/issues/39755)



<a name="11.0.1"></a>
## 11.0.1 (2020-11-18)


### Bug Fixes

* **compiler-cli:** incorrectly type checking calls to implicit template variables ([#39686](https://github.com/angular/angular/issues/39686)) ([e05cfdd](https://github.com/angular/angular/commit/e05cfdd)), closes [#39634](https://github.com/angular/angular/issues/39634)       * **compiler-cli:** setComponentScope should only list used components/pipes ([#39662](https://github.com/angular/angular/issues/39662)) ([8d317df](https://github.com/angular/angular/commit/8d317df))                                                                               * **core:** handle !important in style property value ([#39603](https://github.com/angular/angular/issues/39603)) ([978f081](https://github.com/angular/angular/commit/978f081)), closes [#35323](https://github.com/angular/angular/issues/35323)                                    * **core:** not inserting ViewContainerRef nodes when inside root of a component ([#39599](https://github.com/angular/angular/issues/39599)) ([20db90a](https://github.com/angular/angular/commit/20db90a)), closes [#39556](https://github.com/angular/angular/issues/39556)         * **core:** remove deprecated wtfZoneSpec from NgZone ([#37864](https://github.com/angular/angular/issues/37864)) ([e02bea8](https://github.com/angular/angular/commit/e02bea8)), closes [#33949](https://github.com/angular/angular/issues/33949)
* **forms:** more precise control cleanup ([#39623](https://github.com/angular/angular/issues/39623)) ([050cea9](https://github.com/angular/angular/commit/050cea9))
* **http:** queue jsonp <script> tag onLoad event handler in microtask ([#39512](https://github.com/angular/angular/issues/39512)) ([10e4ac0](https://github.com/angular/angular/commit/10e4ac0)), closes [#39496](https://github.com/angular/angular/issues/39496)

### Performance Improvements

* **compiler:** optimize computation of i18n message ids ([#39694](https://github.com/angular/angular/issues/39694)) ([1891455](https://github.com/angular/angular/commit/1891455))
* **compiler:** use raw bytes to represent utf-8 encoded strings ([#39694](https://github.com/angular/angular/issues/39694)) ([882ff8f](https://github.com/angular/angular/commit/882ff8f))
* **compiler-cli:** reduce filesystem hits during resource resolution ([#39604](https://github.com/angular/angular/issues/39604)) ([a7adcbd](https://github.com/angular/angular/commit/a7adcbd))



<a name="11.0.0"></a>
# 11.0.0 (2020-11-11)

[Blog post "Version 11 of Angular Now Available"](https://blog.angular.io/version-11-of-angular-now-available-74721b7952f7).


### Bug Fixes

* **bazel:** only providing stamping information if the `--stamp` flag is used ([#39392](https://github.com/angular/angular/issues/39392)) ([84e09a0](https://github.com/angular/angular/commit/84e09a0))
* **common:** do not round up fractions of a millisecond in `DatePipe` ([#38009](https://github.com/angular/angular/issues/38009)) ([26f2820](https://github.com/angular/angular/commit/26f2820)), closes [#37989](https://github.com/angular/angular/issues/37989)
* **common:** mark locale data arrays as readonly ([#30397](https://github.com/angular/angular/issues/30397)) ([6acea54](https://github.com/angular/angular/commit/6acea54)), closes [#27003](https://github.com/angular/angular/issues/27003)
* **common:** add `params` and `reportProgress` options to `HttpClient.put()` overload ([#37873](https://github.com/angular/angular/issues/37873)) ([dd8d8c8](https://github.com/angular/angular/commit/dd8d8c8)), closes [#23600](https://github.com/angular/angular/issues/23600)
* **common:** correct and simplify typing of `KeyValuePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([4dfe0fa](https://github.com/angular/angular/commit/4dfe0fa))
* **common:** correct and simplify typing of `AsyncPipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([5f815c0](https://github.com/angular/angular/commit/5f815c0))
* **common:** correct and simplify typing of `I18nPluralPipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([3b919ef](https://github.com/angular/angular/commit/3b919ef))
* **common:** correct typing and implementation of `SlicePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([4744c22](https://github.com/angular/angular/commit/4744c22))
* **common:** let case conversion pipes accept type unions with `null` ([#37447](https://github.com/angular/angular/issues/37447)) ([c7d5555](https://github.com/angular/angular/commit/c7d5555)), closes [#36259](https://github.com/angular/angular/issues/36259)
* **common:** add boolean to valid json for testing ([#37893](https://github.com/angular/angular/issues/37893)) ([3c474ec](https://github.com/angular/angular/commit/3c474ec)), closes [#20690](https://github.com/angular/angular/issues/20690)
* **common:** update locales using new CLDR data ([#39343](https://github.com/angular/angular/issues/39343)) ([3738233](https://github.com/angular/angular/commit/3738233))
* **common:** change the week-numbering year format from `r` -> `Y` ([#39495](https://github.com/angular/angular/issues/39495)) ([feda78e](https://github.com/angular/angular/commit/feda78e))
* **compiler:** source span for microsyntax text att should be key span ([#38766](https://github.com/angular/angular/issues/38766)) ([8f349b2](https://github.com/angular/angular/commit/8f349b2))
* **compiler:** promote constants in templates to Trusted Types ([#39211](https://github.com/angular/angular/issues/39211)) ([6e18d2d](https://github.com/angular/angular/commit/6e18d2d))
* **compiler:** do not throw away render3 AST on errors ([#39413](https://github.com/angular/angular/issues/39413)) ([d76beda](https://github.com/angular/angular/commit/d76beda))
* **compiler:** treat i18n attributes with no bindings as static attributes ([#39408](https://github.com/angular/angular/issues/39408)) ([bf1caa7](https://github.com/angular/angular/commit/bf1caa7)), closes [#38231](https://github.com/angular/angular/issues/38231)
* **compiler:** preserve `this.$event` and `this.$any` accesses in expressions ([#39323](https://github.com/angular/angular/issues/39323)) ([a8e0db7](https://github.com/angular/angular/commit/a8e0db7)), closes [#30278](https://github.com/angular/angular/issues/30278)
* **compiler:** ensure that i18n message-parts have the correct source-span ([#39486](https://github.com/angular/angular/issues/39486)) ([63f9e16](https://github.com/angular/angular/commit/63f9e16))
* **compiler:** skipping leading whitespace should not break placeholder source-spans ([#39486](https://github.com/angular/angular/issues/39486)) ([b8e9b3d](https://github.com/angular/angular/commit/b8e9b3d)), closes [#39195](https://github.com/angular/angular/issues/39195)
* **compiler-cli:** compute source-mappings for localized strings ([#38645](https://github.com/angular/angular/issues/38645)) ([7e0b3fd](https://github.com/angular/angular/commit/7e0b3fd))
* **compiler-cli:** generate `let` statements in ES2015+ mode ([#38775](https://github.com/angular/angular/issues/38775)) ([123bff7](https://github.com/angular/angular/commit/123bff7))
* **compiler-cli:** perform DOM schema checks even in basic mode in g3 ([#38943](https://github.com/angular/angular/issues/38943)) ([40975e0](https://github.com/angular/angular/commit/40975e0))
* **compiler-cli:** type checking of expressions within ICUs ([#39072](https://github.com/angular/angular/issues/39072)) ([0a16e60](https://github.com/angular/angular/commit/0a16e60)), closes [#39064](https://github.com/angular/angular/issues/39064)
* **compiler-cli:** generating invalid `setClassMetadata` call in ES5 for class with custom decorator ([#39527](https://github.com/angular/angular/issues/39527)) ([b0bbc1f](https://github.com/angular/angular/commit/b0bbc1f)), closes [#39509](https://github.com/angular/angular/issues/39509)
* **compiler-cli:** report missing pipes when `fullTemplateTypeCheck` is disabled ([#39320](https://github.com/angular/angular/issues/39320)) ([67ea7b6](https://github.com/angular/angular/commit/67ea7b6)), closes [#38195](https://github.com/angular/angular/issues/38195)
* **compiler-cli:** avoid duplicate diagnostics about unknown pipes ([#39517](https://github.com/angular/angular/issues/39517)) ([c68ca49](https://github.com/angular/angular/commit/c68ca49))
* **compiler-cli:** do not drop non-Angular decorators when downleveling ([#39577](https://github.com/angular/angular/issues/39577)) ([f51cf29](https://github.com/angular/angular/commit/f51cf29)), closes [#39574](https://github.com/angular/angular/issues/39574)
* **core:** remove `CollectionChangeRecord` symbol ([#38668](https://github.com/angular/angular/issues/38668)) ([fdea180](https://github.com/angular/angular/commit/fdea180))
* **core:** ensure `TestBed` is not instantiated before override provider ([#38717](https://github.com/angular/angular/issues/38717)) ([c8f056b](https://github.com/angular/angular/commit/c8f056b))
* **core:** use single quotes for relative link resolution migration to align with style guide ([#39070](https://github.com/angular/angular/issues/39070)) ([8894706](https://github.com/angular/angular/commit/8894706))
* **core:** migrate relative link resolution with single quotes ([#39102](https://github.com/angular/angular/issues/39102)) ([049b453](https://github.com/angular/angular/commit/049b453))
* **core:** use Trusted Types policy in inert DOM builder ([#39208](https://github.com/angular/angular/issues/39208)) ([7d49299](https://github.com/angular/angular/commit/7d49299))
* **core:** use Trusted Types policy in `createNamedArrayType()` ([#39209](https://github.com/angular/angular/issues/39209)) ([f6d5cdf](https://github.com/angular/angular/commit/f6d5cdf))
* **core:** guard reading of global `ngDevMode` for undefined. ([#36055](https://github.com/angular/angular/issues/36055)) ([f541e5f](https://github.com/angular/angular/commit/f541e5f))
* **core:** do not error when `ngDevMode` is undeclared ([#39415](https://github.com/angular/angular/issues/39415)) ([cc32932](https://github.com/angular/angular/commit/cc32932))
* **core:** store ICU state in `LView` rather than in `TView` ([#39233](https://github.com/angular/angular/issues/39233)) ([0992b67](https://github.com/angular/angular/commit/0992b67)), closes [#37021](https://github.com/angular/angular/issues/37021) [#38144](https://github.com/angular/angular/issues/38144) [#38073](https://github.com/angular/angular/issues/38073)
* **core:** `markDirty()` should only mark flags when really scheduling tick. ([#39316](https://github.com/angular/angular/issues/39316)) ([3b6497b](https://github.com/angular/angular/commit/3b6497b)), closes [#39296](https://github.com/angular/angular/issues/39296)
* **core:** access injected parent values using `SkipSelf` ([#39464](https://github.com/angular/angular/issues/39464)) ([7cb9e19](https://github.com/angular/angular/commit/7cb9e19))
* **elements:** update the view of an `OnPush` component when inputs change ([#39452](https://github.com/angular/angular/issues/39452)) ([dd28855](https://github.com/angular/angular/commit/dd28855)), closes [#38948](https://github.com/angular/angular/issues/38948)
* **forms:** ensure to emit `statusChanges` on subsequent value update/validations ([#38354](https://github.com/angular/angular/issues/38354)) ([d9fea85](https://github.com/angular/angular/commit/d9fea85)), closes [#20424](https://github.com/angular/angular/issues/20424) [#14542](https://github.com/angular/angular/issues/14542)
* **forms:** type `NG_VALUE_ACCESSOR` injection token as array ([#29723](https://github.com/angular/angular/issues/29723)) ([2b1b718](https://github.com/angular/angular/commit/2b1b718)), closes [#29351](https://github.com/angular/angular/issues/29351)
* **forms:** improve types of directive constructor arguments ([#38944](https://github.com/angular/angular/issues/38944)) ([246de9a](https://github.com/angular/angular/commit/246de9a))
* **forms:** include `null` in `.parent` of abstract control ([#32671](https://github.com/angular/angular/issues/32671)) ([f4f1bcc](https://github.com/angular/angular/commit/f4f1bcc)), closes [#16999](https://github.com/angular/angular/issues/16999)
* **forms:** remove validators while cleaning up a control ([#39234](https://github.com/angular/angular/issues/39234)) ([43b4940](https://github.com/angular/angular/commit/43b4940))
* **language-service:** hybrid visitor returns parent node of `BoundAttribute` ([#38995](https://github.com/angular/angular/issues/38995)) ([323be39](https://github.com/angular/angular/commit/323be39))
* **language-service:** [Ivy] hybrid visitor should not locate let keyword ([#39061](https://github.com/angular/angular/issues/39061)) ([70e13dc](https://github.com/angular/angular/commit/70e13dc))
* **language-service:** [Ivy] create compiler only when program changes ([#39231](https://github.com/angular/angular/issues/39231)) ([8f1317f](https://github.com/angular/angular/commit/8f1317f))
* **localize:** render placeholder types in extracted XLIFF files ([#39398](https://github.com/angular/angular/issues/39398)) ([32163ef](https://github.com/angular/angular/commit/32163ef)), closes [#38791](https://github.com/angular/angular/issues/38791)
* **localize:** serialize all the message locations to XLIFF ([#39411](https://github.com/angular/angular/issues/39411)) ([f5710c6](https://github.com/angular/angular/commit/f5710c6)), closes [#39330](https://github.com/angular/angular/issues/39330)
* **ngcc:** ensure that "inline exports" can be interpreted correctly ([#39267](https://github.com/angular/angular/issues/39267)) ([822b838](https://github.com/angular/angular/commit/822b838))
* **ngcc:** capture UMD/CommonJS inner class implementation node correctly ([#39346](https://github.com/angular/angular/issues/39346)) ([fc2e3cc](https://github.com/angular/angular/commit/fc2e3cc))
* **platform-server:** resolve absolute URL from `baseUrl` ([#39334](https://github.com/angular/angular/issues/39334)) ([b4e8399](https://github.com/angular/angular/commit/b4e8399))
* **platform-webworker:** remove @angular/platform-webworker and @angular/platform-webworker-dynamic ([#38846](https://github.com/angular/angular/issues/38846)) ([93c3d8f](https://github.com/angular/angular/commit/93c3d8f))
* **router:** fix arguments order for call to `shouldReuseRoute` ([#26949](https://github.com/angular/angular/issues/26949)) ([3817e5f](https://github.com/angular/angular/commit/3817e5f)), closes [#16192](https://github.com/angular/angular/issues/16192)
* **router:** support lazy loading for empty path named outlets ([#38379](https://github.com/angular/angular/issues/38379)) ([926ffcd](https://github.com/angular/angular/commit/926ffcd)), closes [#12842](https://github.com/angular/angular/issues/12842)
* **router:** set `relativeLinkResolution` to `corrected` by default ([#25609](https://github.com/angular/angular/issues/25609)) ([837889f](https://github.com/angular/angular/commit/837889f))
* **router:** properly assign `ExtraOptions` to `Router` in `RouterTestingModule` ([#39096](https://github.com/angular/angular/issues/39096)) ([d8c0534](https://github.com/angular/angular/commit/d8c0534)), closes [#23347](https://github.com/angular/angular/issues/23347)
* **router:** allow undefined inputs on `routerLink` ([#39151](https://github.com/angular/angular/issues/39151)) ([b0b4953](https://github.com/angular/angular/commit/b0b4953))
* **router:** create schematic for `preserveQueryParams` ([#38762](https://github.com/angular/angular/issues/38762)) ([93ee05d](https://github.com/angular/angular/commit/93ee05d))
* **router:** remove `preserveQueryParams` symbol ([#38762](https://github.com/angular/angular/issues/38762)) ([783a5bd](https://github.com/angular/angular/commit/783a5bd))
* **router:** fix incorrect type signature for `createUrlTree` ([#39347](https://github.com/angular/angular/issues/39347)) ([161b278](https://github.com/angular/angular/commit/161b278))
* **router:** ensure all outlets are used when commands have a prefix ([#39456](https://github.com/angular/angular/issues/39456)) ([b2f3952](https://github.com/angular/angular/commit/b2f3952))
* **service-worker:** fix condition to check for a cache-busted request ([#36847](https://github.com/angular/angular/issues/36847)) ([5be4edf](https://github.com/angular/angular/commit/5be4edf))


### Features

* **common:** add ISO week-numbering year formats support to `formatDate` ([#38828](https://github.com/angular/angular/issues/38828)) ([984ed39](https://github.com/angular/angular/commit/984ed39))
* **common:** stricter types for `DatePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([daf8b7f](https://github.com/angular/angular/commit/daf8b7f))
* **common:** stricter types for number pipes ([#37447](https://github.com/angular/angular/issues/37447)) ([7b2aac9](https://github.com/angular/angular/commit/7b2aac9))
* **compiler:** parse and recover on incomplete opening HTML tags ([#38681](https://github.com/angular/angular/issues/38681)) ([6ae3b68](https://github.com/angular/angular/commit/6ae3b68)), closes [#38596](https://github.com/angular/angular/issues/38596)
* **compiler:** add `keySpan` to `Variable` node ([#38965](https://github.com/angular/angular/issues/38965)) ([239968d](https://github.com/angular/angular/commit/239968d))
* **compiler-cli:** `TemplateTypeChecker` operation to get `Symbol` from a template node ([#38618](https://github.com/angular/angular/issues/38618)) ([c4556db](https://github.com/angular/angular/commit/c4556db))
* **compiler-cli:** add ability to get `Symbol` of `Template`s and `Element`s in component template ([#38618](https://github.com/angular/angular/issues/38618)) ([cf2e8b9](https://github.com/angular/angular/commit/cf2e8b9))
* **compiler-cli:** add ability to get `Symbol` of AST expression in component template ([#38618](https://github.com/angular/angular/issues/38618)) ([f56ece4](https://github.com/angular/angular/commit/f56ece4))
* **compiler-cli:** add ability to get symbol of reference or variable ([#38618](https://github.com/angular/angular/issues/38618)) ([19598b4](https://github.com/angular/angular/commit/19598b4))
* **compiler-cli:** define interfaces to be used for `TemplateTypeChecker` ([#38618](https://github.com/angular/angular/issues/38618)) ([9e77bd3](https://github.com/angular/angular/commit/9e77bd3))
* **compiler-cli:** support getting resource dependencies for a source file ([#38048](https://github.com/angular/angular/issues/38048)) ([5dbf357](https://github.com/angular/angular/commit/5dbf357))
* **core:** add automated migration to replace `async` with `waitForAsync` ([#39212](https://github.com/angular/angular/issues/39212)) ([5ce71e0](https://github.com/angular/angular/commit/5ce71e0))
* **core:** add automated migration to replace `ViewEncapsulation.Native` ([#38882](https://github.com/angular/angular/issues/38882)) ([0e733f3](https://github.com/angular/angular/commit/0e733f3))
* **core:** add `initialNavigation` schematic ([#36926](https://github.com/angular/angular/issues/36926)) ([0ec7043](https://github.com/angular/angular/commit/0ec7043))
* **core:** add Trusted Types workaround for `Function` constructor ([#39209](https://github.com/angular/angular/issues/39209)) ([5913e5c](https://github.com/angular/angular/commit/5913e5c))
* **core:** create internal Trusted Types module ([#39207](https://github.com/angular/angular/issues/39207)) ([0875fd2](https://github.com/angular/angular/commit/0875fd2))
* **core:** depend on type definitions for Trusted Types ([#39207](https://github.com/angular/angular/issues/39207)) ([c4266fb](https://github.com/angular/angular/commit/c4266fb))
* **core:** remove `ViewEncapsulation.Native` ([#38882](https://github.com/angular/angular/issues/38882)) ([4a1c12c](https://github.com/angular/angular/commit/4a1c12c))
* **forms:** add migration for `AbstractControl.parent` accesses ([#39009](https://github.com/angular/angular/issues/39009)) ([aeec223](https://github.com/angular/angular/commit/aeec223)), closes [#32671](https://github.com/angular/angular/issues/32671)
* **language-service:** add `getDefinitionAndBoundSpan` (go to definition) ([#39101](https://github.com/angular/angular/issues/39101)) ([3975dd9](https://github.com/angular/angular/commit/3975dd9))
* **language-service:** add quick info for inline templates in ivy ([#39060](https://github.com/angular/angular/issues/39060)) ([904adb7](https://github.com/angular/angular/commit/904adb7))
* **language-service:** [Ivy] `getSemanticDiagnostics` for external templates ([#39065](https://github.com/angular/angular/issues/39065)) ([63624a2](https://github.com/angular/angular/commit/63624a2))
* **language-service:** add `getTypeDefinitionAtPosition` (go to type definition) ([#39145](https://github.com/angular/angular/issues/39145)) ([a84976f](https://github.com/angular/angular/commit/a84976f))
* **language-service:** add module name to directive quick info ([#39121](https://github.com/angular/angular/issues/39121)) ([4604fe9](https://github.com/angular/angular/commit/4604fe9))
* **router:** add migration to update calls to `navigateByUrl` and `createUrlTree` with invalid parameters ([#38825](https://github.com/angular/angular/issues/38825)) ([7849fdd](https://github.com/angular/angular/commit/7849fdd))
* **router:** add `relativeLinkResolution` migration to update default value ([#38698](https://github.com/angular/angular/issues/38698)) ([15ea811](https://github.com/angular/angular/commit/15ea811))
* **router:** add new `initialNavigation` options to replace legacy ([#37480](https://github.com/angular/angular/issues/37480)) ([c4becca](https://github.com/angular/angular/commit/c4becca))
* **service-worker:** add `UnrecoverableStateError` ([#36847](https://github.com/angular/angular/issues/36847)) ([036a2fa](https://github.com/angular/angular/commit/036a2fa)), closes [#36539](https://github.com/angular/angular/issues/36539)
* **service-worker:** add the option to prefer network for navigation requests ([#38565](https://github.com/angular/angular/issues/38565)) ([a206852](https://github.com/angular/angular/commit/a206852)), closes [#38194](https://github.com/angular/angular/issues/38194)


### Performance Improvements

* **compiler-cli:** only emit directive/pipe references that are used ([#38539](https://github.com/angular/angular/issues/38539)) ([077f516](https://github.com/angular/angular/commit/077f516))
* **compiler-cli:** optimize computation of type-check scope information ([#38539](https://github.com/angular/angular/issues/38539)) ([297c060](https://github.com/angular/angular/commit/297c060))
* **compiler-cli:** only generate template context declaration when used ([#39321](https://github.com/angular/angular/issues/39321)) ([1ac0500](https://github.com/angular/angular/commit/1ac0500))
* **core:** do not recurse into modules that have already been registered ([#39514](https://github.com/angular/angular/issues/39514)) ([5c13c67](https://github.com/angular/angular/commit/5c13c67)), closes [#39487](https://github.com/angular/angular/issues/39487)
* **router:** use `ngDevMode` to tree-shake error messages in router ([#38674](https://github.com/angular/angular/issues/38674)) ([db21c4f](https://github.com/angular/angular/commit/db21c4f))


### BREAKING CHANGES

* **common:**
  - **[6acea54](https://github.com/angular/angular/commit/6acea54f62fe7e62e9b36458b30d98501277236f):**
    The locale data API has been marked as returning readonly arrays, rather than mutable arrays, since these arrays are shared across calls to the API.
    If you were mutating them (e.g. calling `sort()`, `push()`, `splice()`, etc.) then your code will no longer compile.
    If you need to mutate the array, you should now make a copy (e.g. by calling `slice()`) and mutate the copy.
  - **[26f2820](https://github.com/angular/angular/commit/26f28200bf3a909024184c61111f4cd20ac41edd):**
    When passing a date-time formatted string to the `DatePipe` in a format that contains fractions of a millisecond, the milliseconds will now always be rounded down rather than to the nearest millisecond.
    Most applications will not be affected by this change.
    If this is not the desired behaviour then consider pre-processing the string to round the millisecond part before passing it to the `DatePipe`.
  - **[4744c22](https://github.com/angular/angular/commit/4744c229dbd372746a38ebbcdae2245f945ebcc4):**
    The `slice` pipe now returns `null` for the `undefined` input value, which is consistent with the behavior of most pipes.
    If you rely on `undefined` being the result in that case, you now need to check for it explicitly.
  - **[4dfe0fa](https://github.com/angular/angular/commit/4dfe0fa068007c28ca3b4a1476ed4ba1d2d86064):**
    The typing of the `keyvalue` pipe has been fixed to report that for input objects that have `number` keys, the result will contain the string representation of the keys.
    This was already the case and the types have simply been updated to reflect this.
    Please update the consumers of the pipe output if they were relying on the incorrect types.
    Note that this does not affect use cases where the input values are `Map`s, so if you need to preserve `number`s, this is an effective way.
  - **[7b2aac9](https://github.com/angular/angular/commit/7b2aac97df63717fd2dfbb81903d12221ae29ba1):**
    The signatures of the number pipes now explicitly state which types are accepted.
    This should only cause issues in corner cases, as any other values would result in runtime exceptions.
  - **[daf8b7f](https://github.com/angular/angular/commit/daf8b7f10038c7ecf7ea78bc6fe39766c85224a6):**
    The signature of the `date` pipe now explicitly states which types are accepted.
    This should only cause issues in corner cases, as any other values would result in runtime exceptions.
  - **[5f815c0](https://github.com/angular/angular/commit/5f815c05650c15e414fe72cddaa2b690a7962273):**
    The `async` pipe no longer claims to return `undefined` for an input that was typed as `undefined`.
    Note that the code actually returned `null` on `undefined` inputs.
    In the unlikely case you were relying on this, please fix the typing of the consumers of the pipe output.
  - **[c7d5555](https://github.com/angular/angular/commit/c7d5555dfb14f5deca4a2d947fe82a68453e5f09):**
    The case conversion pipes no longer let falsy values through.
    They now map both `null` and `undefined` to `null` and raise an exception on invalid input (`0`, `false`, `NaN`) just like most "common pipes".
    If your code required falsy values to pass through, you need to handle them explicitly.
* **compiler:**
  - **[736e064](https://github.com/angular/angular/commit/736e0644b02bc4606a7ae0c974d1b06e993708f6):**
    TypeScript 3.9 is no longer supported, please upgrade to TypeScript 4.0.
* **compiler-cli:**
  - **[0a16e60](https://github.com/angular/angular/commit/0a16e60afae27c7af023cf617de05297dddf5135):**
    Expressions within ICUs are now type-checked again, fixing a regression in Ivy.
    This may cause compilation failures if errors are found in expressions that appear within an ICU.
    Please correct these expressions to resolve the type-check errors.
* **core:**
  - **[fdea180](https://github.com/angular/angular/commit/fdea1804d6d46d33c71640972ff45a8d5cc82f8b):**
    `CollectionChangeRecord` has been removed, use `IterableChangeRecord` instead.
  - **[c8f056b](https://github.com/angular/angular/commit/c8f056beb696d176530ee4e86f64964c3b834c9a):**
    If you call `TestBed.overrideProvider` after TestBed initialization, provider overrides are not applied.
    This behavior is consistent with other override methods (such as `TestBed.overrideDirective`, etc) but they throw an error to indicate that, when the check was missing in the `TestBed.overrideProvider` function.
    Now calling `TestBed.overrideProvider` after `TestBed` initialization also triggers an error, thus there is a chance that some tests (where `TestBed.overrideProvider` is called after `TestBed` initialization) will start to fail and require updates to move `TestBed.overrideProvider` calls before `TestBed` initialization is completed.
  - **[4ca1c73](https://github.com/angular/angular/commit/4ca1c736bb020de166b6a1fbfb9fe264602ccd5c):**
    In v10, IE 9, 10, and IE mobile support was deprecated.
    In v11, Angular framework removes IE 9, 10, and IE mobile support completely.
    Supporting outdated browsers like these increases bundle size, code complexity, and test load, and also requires time and effort that could be spent on improvements to the framework.
    For example, fixing issues can be more difficult, as a straightforward fix for modern browsers could break old ones that have quirks due to not receiving updates from vendors.
  - **[4a1c12c](https://github.com/angular/angular/commit/4a1c12c773f14dbfc5db61087f415d56f60127cf):**
    `ViewEncapsulation.Native` has been removed. Use `ViewEncapsulation.ShadowDom` instead.
    Existing usages will be updated automatically by `ng update`.
* **forms:**
  - **[d9fea85](https://github.com/angular/angular/commit/d9fea857db0638149f200ca86c7852c01c9787f4):**
    Previously if `FormControl`, `FormGroup` and `FormArray` class instances had async validators defined at initialization time, the status change event was not emitted once async validators completed.
    After this change the status event is emitted into the `statusChanges` observable.
    If your code relies on the old behavior, you can filter/ignore this additional status change event.
  - **[246de9a](https://github.com/angular/angular/commit/246de9aaad2a85c39f4e624ba25e444d716fe486):**
    Directives in the `@angular/forms` package used to have `any[]` as a type of `validators` and `asyncValidators` arguments in constructors.
    Now these arguments are properly typed, so if your code relies on directive constructor types it may require some updates to improve type safety.
  - **[f4f1bcc](https://github.com/angular/angular/commit/f4f1bcc99711be277205dcd8ef6fc5a1873cb227):**
    Type of `AbstractFormControl.parent` now includes `null`.
    `null` is now included in the types of `.parent`.
    If you don't already have a check for this case, the TypeScript compiler might complain.
    A v11 migration exists which adds the non-null assertion operator where necessary.
    In an unlikely case your code was testing the parent against `undefined` with strict equality, you'll need to change this to `=== null` instead, since the parent is now explicitly initialized with `null` instead of being left `undefined`.
* **platform-server:**
  - **[b4e8399](https://github.com/angular/angular/commit/b4e8399144ae4b6d4f0da9ff2a8e1fa73643f766):**
    If you use `useAbsoluteUrl` to setup `platform-server`, you now need to also specify `baseUrl`.
    We are intentionally making this a breaking change in a minor release, because if `useAbsoluteUrl` is set to `true` then the behavior of the application could be unpredictable, resulting in issues that are hard to discover but could be affecting production environments.
* **platform-webworker:**
  - **[93c3d8f](https://github.com/angular/angular/commit/93c3d8f9fd79014bf700a1447503f5ee6f170bf9):**
    @angular/platform-webworker and @angular/platform-webworker-dynamic have been removed as they were deprecated in v8.
* **router:**
  - **[3817e5f](https://github.com/angular/angular/commit/3817e5f1dfeb9de26fa2ea4068a37565f435214f):**
    This change corrects the argument order when calling `RouteReuseStrategy#shouldReuseRoute`.
    Previously, when evaluating child routes, they would be called with the future and current arguments would be swapped.
    If your `RouteReuseStrategy` relies specifically on only the future or current snapshot state, you may need to update the `shouldReuseRoute` implementation's use of "future" and "current" `ActivatedRouteSnapshot`s.
  - **[e4f4d18](https://github.com/angular/angular/commit/e4f4d18e7e73a7c755d3b79cf599e0e04270000d):**
    While the new parameter types allow a variable of type `NavigationExtras` to be passed in, they will not allow object literals, as they may only specify known properties.
    They will also not accept types that do not have properties in common with the ones in the `Pick`.
    To fix this error, only specify properties from the `NavigationExtras` which are actually used in the respective function calls or use a type assertion on the object or variable: `as NavigationExtras`.
  - **[837889f](https://github.com/angular/angular/commit/837889f0a47521d3de5c445ac3ffeedfe47fc109):**
    This commit changes the default value of `relativeLinkResolution` from `'legacy'` to `'default'`.
    If your application previously used the default by not specifying a value in the `ExtraOptions` and uses relative links when navigating from children of empty path routes, you will need to update your `RouterModule` to specifically specify `'legacy'` for `relativeLinkResolution`.
    See https://angular.io/api/router/ExtraOptions#relativeLinkResolution for more details.
  - **[c4becca](https://github.com/angular/angular/commit/c4becca0e4238640461c43567a6d3e16b8c5d3f3):**
    The `initialNavigation` property for the options in `RouterModule.forRoot` no longer supports `legacy_disabled`, `legacy_enabled`, `true`, or `false` as valid values.
    `legacy_enabled` (the old default) is instead `enabledNonBlocking`.
  - **[c4becca](https://github.com/angular/angular/commit/c4becca0e4238640461c43567a6d3e16b8c5d3f3):**
    `enabled` is deprecated as a valid value for the `RouterModule.forRoot` `initialNavigation` option.
    `enabledBlocking` has been introduced to replace it.
  - **[783a5bd](https://github.com/angular/angular/commit/783a5bd7bbae35562e21aaa27771c54091fb9812):**
    `preserveQueryParams` has been removed, use `queryParamsHandling: "preserve"` instead.
  - **[b0b4953](https://github.com/angular/angular/commit/b0b4953fd654aeda2f358b0af1ab32d20b368930):**
    If you were accessing the `RouterLink` values of `queryParams`, `fragment` or `queryParamsHandling` you might need to relax the typing to also accept `undefined` and `null`.


### Code Refactoring

* **compiler:** remove support for TypeScript 3.9 ([#39313](https://github.com/angular/angular/issues/39313)) ([736e064](https://github.com/angular/angular/commit/736e0644b02bc4606a7ae0c974d1b06e993708f6))
* **router:** adjust type of parameter in `navigateByUrl` and `createUrlTree` to be more accurate ([#38227](https://github.com/angular/angular/issues/38227)) ([e4f4d18](https://github.com/angular/angular/commit/e4f4d18)), closes [#18798](https://github.com/angular/angular/issues/18798)




<a name="10.2.3"></a>
## 10.2.3 (2020-11-09)


### Bug Fixes

* **compiler:** ensure that i18n message-parts have the correct source-span ([#39589](https://github.com/angular/angular/issues/39589)) ([e67a331](https://github.com/angular/angular/commit/e67a331))
* **compiler:** skipping leading whitespace should not break placeholder source-spans ([#39589](https://github.com/angular/angular/issues/39589)) ([2b684b7](https://github.com/angular/angular/commit/2b684b7)), closes [#39195](https://github.com/angular/angular/issues/39195)
* **compiler-cli:** avoid duplicate diagnostics about unknown pipes ([#39517](https://github.com/angular/angular/issues/39517)) ([861e4fa](https://github.com/angular/angular/commit/861e4fa))
* **compiler-cli:** do not drop non-Angular decorators when downleveling ([#39577](https://github.com/angular/angular/issues/39577)) ([1c6cf8a](https://github.com/angular/angular/commit/1c6cf8a)), closes [#39574](https://github.com/angular/angular/issues/39574)



<a name="10.2.2"></a>
## 10.2.2 (2020-11-04)


### Bug Fixes

* **compiler-cli:** report missing pipes when `fullTemplateTypeCheck` is disabled ([#39320](https://github.com/angular/angular/issues/39320)) ([71d0063](https://github.com/angular/angular/commit/71d0063)), closes [#38195](https://github.com/angular/angular/issues/38195)
* **core:** markDirty() should only mark flags when really scheduling tick. ([#39316](https://github.com/angular/angular/issues/39316)) ([8c82106](https://github.com/angular/angular/commit/8c82106)), closes [#39296](https://github.com/angular/angular/issues/39296)
* **router:** Ensure all outlets are used when commands have a prefix ([#39456](https://github.com/angular/angular/issues/39456)) ([85d5242](https://github.com/angular/angular/commit/85d5242))


### Performance Improvements

* **core:** do not recurse into modules that have already been registered ([#39514](https://github.com/angular/angular/issues/39514)) ([812355c](https://github.com/angular/angular/commit/812355c)), closes [#39487](https://github.com/angular/angular/issues/39487)



<a name="10.2.1"></a>
## 10.2.1 (2020-10-28)


### Bug Fixes

* **bazel:** only providing stamping information if the --stamp flag is used ([#39392](https://github.com/angular/angular/issues/39392)) ([ed88407](https://github.com/angular/angular/commit/ed88407))
* **core:** do not error when `ngDevMode` is undeclared ([#39415](https://github.com/angular/angular/issues/39415)) ([fcebc83](https://github.com/angular/angular/commit/fcebc83))
* **localize:** render placeholder types in extracted XLIFF files ([#39459](https://github.com/angular/angular/issues/39459)) ([ea1baf9](https://github.com/angular/angular/commit/ea1baf9)), closes [#38791](https://github.com/angular/angular/issues/38791)
* **localize:** serialize all the message locations to XLIFF ([#39411](https://github.com/angular/angular/issues/39411)) ([db51de8](https://github.com/angular/angular/commit/db51de8)), closes [#39330](https://github.com/angular/angular/issues/39330)
* **ngcc:** capture UMD/CommonJS inner class implementation node correctly ([#39346](https://github.com/angular/angular/issues/39346)) ([bdaa714](https://github.com/angular/angular/commit/bdaa714))



<a name="10.2.0"></a>
# 10.2.0 (2020-10-21)


### Bug Fixes

* **core:** guard reading of global `ngDevMode` for undefined. ([#36055](https://github.com/angular/angular/issues/36055)) ([02405f1](https://github.com/angular/angular/commit/02405f1))
* **platform-server:** Resolve absolute URL from baseUrl ([#39334](https://github.com/angular/angular/issues/39334)) ([71fb99f](https://github.com/angular/angular/commit/71fb99f))


### BREAKING CHANGES

* **platform-server:** If you use `useAbsoluteUrl` to setup `platform-server`, you now need to
also specify `baseUrl`.
We are intentionally making this a breaking change in a minor release,
because if `useAbsoluteUrl` is set to `true` then the behavior of the
application could be unpredictable, resulting in issues that are hard to
discover but could be affecting production environments.



<a name="10.1.6"></a>
## 10.1.6 (2020-10-14)


### Bug Fixes

* **compiler:** incorrectly encapsulating [@import](https://github.com/import) containing colons and semicolons ([#38716](https://github.com/angular/angular/issues/38716)) ([52a0c6b](https://github.com/angular/angular/commit/52a0c6b)), closes [#38587](https://github.com/angular/angular/issues/38587)
* **compiler-cli:** support namespaced query types in directives ([#38959](https://github.com/angular/angular/issues/38959)) ([#39272](https://github.com/angular/angular/issues/39272)) ([f752ab9](https://github.com/angular/angular/commit/f752ab9))
* **elements:** detect matchesSelector prototype without IIFE ([#37799](https://github.com/angular/angular/issues/37799)) ([952fd86](https://github.com/angular/angular/commit/952fd86)), closes [#24551](https://github.com/angular/angular/issues/24551)
* **ngcc:** ensure that "inline exports" can be interpreted correctly ([#39272](https://github.com/angular/angular/issues/39272)) ([e08d021](https://github.com/angular/angular/commit/e08d021))
* **ngcc:** handle aliases in UMD export declarations ([#38959](https://github.com/angular/angular/issues/38959)) ([#39272](https://github.com/angular/angular/issues/39272)) ([9963c5d](https://github.com/angular/angular/commit/9963c5d)), closes [#38947](https://github.com/angular/angular/issues/38947)
* **ngcc:** map `exports` to the current module in UMD files ([#38959](https://github.com/angular/angular/issues/38959)) ([#39272](https://github.com/angular/angular/issues/39272)) ([13c4a7b](https://github.com/angular/angular/commit/13c4a7b))
* **ngcc:** support inline export declarations in UMD files ([#38959](https://github.com/angular/angular/issues/38959)) ([#39272](https://github.com/angular/angular/issues/39272)) ([9c875b3](https://github.com/angular/angular/commit/9c875b3)), closes [#38947](https://github.com/angular/angular/issues/38947)


### build

* upgrade angular build, integration/bazel and [@angular](https://github.com/angular)/bazel package to rule_nodejs 2.2.0 ([#39182](https://github.com/angular/angular/issues/39182)) ([7628c36](https://github.com/angular/angular/commit/7628c36))


### Performance Improvements

* **ngcc:** do not rescan program source files when referenced from multiple root files ([#39254](https://github.com/angular/angular/issues/39254)) ([5221df8](https://github.com/angular/angular/commit/5221df8)), closes [#39240](https://github.com/angular/angular/issues/39240)



<a name="10.1.5"></a>
## 10.1.5 (2020-10-07)


### Bug Fixes

* **router:** update getRouteGuards to check if the context outlet is activated ([#39049](https://github.com/angular/angular/issues/39049)) ([771f731](https://github.com/angular/angular/commit/771f731)), closes [#39030](https://github.com/angular/angular/issues/39030)
* **compiler:** Recover on malformed keyed reads and keyed writes ([#39004](https://github.com/angular/angular/issues/39004)) ([f50313f](https://github.com/angular/angular/commit/f50313f)), closes [#38596](https://github.com/angular/angular/issues/38596)



<a name="10.1.4"></a>
## 10.1.4 (2020-09-30)


### Bug Fixes

* **compiler-cli:** enable [@types](https://github.com/types) discovery in incremental rebuilds ([#39011](https://github.com/angular/angular/issues/39011)) ([6e99427](https://github.com/angular/angular/commit/6e99427)), closes [#38979](https://github.com/angular/angular/issues/38979)



<a name="10.1.3"></a>
## 10.1.3 (2020-09-23)


### Bug Fixes

* **http:** Fix error message when we call jsonp without importing HttpClientJsonpModule ([#38756](https://github.com/angular/angular/issues/38756)) ([3902ec0](https://github.com/angular/angular/commit/3902ec0))
* **ngcc:** fix compilation of `ChangeDetectorRef` in pipe constructors ([#38892](https://github.com/angular/angular/issues/38892)) ([093c3a1](https://github.com/angular/angular/commit/093c3a1)), closes [#38666](https://github.com/angular/angular/issues/38666) [#38883](https://github.com/angular/angular/issues/38883)


### Reverts

* feat(router): better warning message when a router outlet has not been instantiated ([#38920](https://github.com/angular/angular/issues/38920)) ([04d0aa6](https://github.com/angular/angular/commit/04d0aa6))




<a name="10.1.2"></a>
## 10.1.2 (2020-09-16)


### Bug Fixes

* **compiler:** detect pipes in ICUs in template binder ([#38810](https://github.com/angular/angular/issues/38810)) ([ec2dbe7](https://github.com/angular/angular/commit/ec2dbe7)), closes [#38539](https://github.com/angular/angular/issues/38539) [#38539](https://github.com/angular/angular/issues/38539) [#38539](https://github.com/angular/angular/issues/38539)
* **core:** clear the `RefreshTransplantedView` when detached ([#38768](https://github.com/angular/angular/issues/38768)) ([edb7f90](https://github.com/angular/angular/commit/edb7f90)), closes [#38619](https://github.com/angular/angular/issues/38619)
* **localize:** ensure that `formatOptions` is optional ([#38787](https://github.com/angular/angular/issues/38787)) ([a47383d](https://github.com/angular/angular/commit/a47383d))
* **router:** Ensure routes are processed in priority order and only if needed ([#38780](https://github.com/angular/angular/issues/38780)) ([9c51ba3](https://github.com/angular/angular/commit/9c51ba3)), closes [#38691](https://github.com/angular/angular/issues/38691)
* **upgrade:** add try/catch when downgrading injectables ([#38671](https://github.com/angular/angular/issues/38671)) ([5de2ac3](https://github.com/angular/angular/commit/5de2ac3)), closes [#37579](https://github.com/angular/angular/issues/37579)


### Performance Improvements

* **compiler-cli:** only emit directive/pipe references that are used ([#38843](https://github.com/angular/angular/issues/38843)) ([5658405](https://github.com/angular/angular/commit/5658405))
* **compiler-cli:** optimize computation of type-check scope information ([#38843](https://github.com/angular/angular/issues/38843)) ([ebede67](https://github.com/angular/angular/commit/ebede67))
* **ngcc:** introduce cache for sharing data across entry-points ([#38840](https://github.com/angular/angular/issues/38840)) ([58411e7](https://github.com/angular/angular/commit/58411e7))
* **ngcc:** reduce maximum worker count ([#38840](https://github.com/angular/angular/issues/38840)) ([ea36466](https://github.com/angular/angular/commit/ea36466))



<a name="10.1.1"></a>
## 10.1.1 (2020-09-09)


### Bug Fixes

* **compiler:** correct confusion between field and property names ([#38685](https://github.com/angular/angular/issues/38685)) ([a1c34c6](https://github.com/angular/angular/commit/a1c34c6))
* **compiler-cli:** compute source-mappings for localized strings ([#38747](https://github.com/angular/angular/issues/38747)) ([b4eb016](https://github.com/angular/angular/commit/b4eb016)), closes [#38588](https://github.com/angular/angular/issues/38588)
* **compiler-cli:** ensure that a declaration is available in type-to-value conversion ([#38684](https://github.com/angular/angular/issues/38684)) ([56d5ff2](https://github.com/angular/angular/commit/56d5ff2)), closes [#38670](https://github.com/angular/angular/issues/38670)
* **core:** reset `tView` between tests in Ivy TestBed ([#38659](https://github.com/angular/angular/issues/38659)) ([efc7606](https://github.com/angular/angular/commit/efc7606)), closes [#38600](https://github.com/angular/angular/issues/38600)
* **localize:** do not expose NodeJS typings in $localize runtime code ([#38700](https://github.com/angular/angular/issues/38700)) ([4de8dc3](https://github.com/angular/angular/commit/4de8dc3)), closes [#38692](https://github.com/angular/angular/issues/38692)
* **localize:** enable whitespace preservation marker in XLIFF files ([#38737](https://github.com/angular/angular/issues/38737)) ([190dca0](https://github.com/angular/angular/commit/190dca0)), closes [#38679](https://github.com/angular/angular/issues/38679)
* **localize:** install `[@angular](https://github.com/angular)/localize` in `devDependencies` by default ([#38680](https://github.com/angular/angular/issues/38680)) ([dbab744](https://github.com/angular/angular/commit/dbab744)), closes [#38329](https://github.com/angular/angular/issues/38329)
* **localize:** render context of translation file parse errors ([#38673](https://github.com/angular/angular/issues/38673)) ([32f33f0](https://github.com/angular/angular/commit/32f33f0)), closes [#38377](https://github.com/angular/angular/issues/38377)
* **localize:** render location in XLIFF 2 even if there is no metadata ([#38713](https://github.com/angular/angular/issues/38713)) ([ab4f953](https://github.com/angular/angular/commit/ab4f953)), closes [#38705](https://github.com/angular/angular/issues/38705)
* **ngcc:** use aliased exported types correctly ([#38666](https://github.com/angular/angular/issues/38666)) ([6a28675](https://github.com/angular/angular/commit/6a28675)), closes [#38238](https://github.com/angular/angular/issues/38238)
* **router:** If users are using the Alt key when clicking the router links, prioritize browser’s default behavior ([#38375](https://github.com/angular/angular/issues/38375)) ([309709d](https://github.com/angular/angular/commit/309709d))


### Performance Improvements

* **core:** use `ngDevMode` to tree-shake error messages ([#38612](https://github.com/angular/angular/issues/38612)) ([b084bff](https://github.com/angular/angular/commit/b084bff))



<a name="10.1.0"></a>
# 10.1.0 (2020-09-02)


### Features

* **bazel:** provide LinkablePackageInfo from ng_module ([#37623](https://github.com/angular/angular/issues/37623)) ([6898eab](https://github.com/angular/angular/commit/6898eab))
* **common:** add ReadonlyMap in place of Map in keyValuePipe ([#37311](https://github.com/angular/angular/issues/37311)) ([3373453](https://github.com/angular/angular/commit/3373453)), closes [#37308](https://github.com/angular/angular/issues/37308)
* **compiler-cli:** add `SourceFile.getOriginalLocation()` to sourcemaps package ([#32912](https://github.com/angular/angular/issues/32912)) ([6abb8d0](https://github.com/angular/angular/commit/6abb8d0))
* **compiler-cli:** Add compiler option to report errors when assigning to restricted input fields ([#38249](https://github.com/angular/angular/issues/38249)) ([71138f6](https://github.com/angular/angular/commit/71138f6))
* **compiler-cli:** add support for TypeScript 4.0 ([#38076](https://github.com/angular/angular/issues/38076)) ([0fc44e0](https://github.com/angular/angular/commit/0fc44e0))
* **compiler-cli:** explain why an expression cannot be used in AOT compilations ([#37587](https://github.com/angular/angular/issues/37587)) ([712f1bd](https://github.com/angular/angular/commit/712f1bd))
* **compiler:** support unary operators for more accurate type checking ([#37918](https://github.com/angular/angular/issues/37918)) ([874792d](https://github.com/angular/angular/commit/874792d)), closes [#20845](https://github.com/angular/angular/issues/20845) [#36178](https://github.com/angular/angular/issues/36178)
* **core:** rename async to waitForAsync to avoid confusing ([#37583](https://github.com/angular/angular/issues/37583)) ([8f07429](https://github.com/angular/angular/commit/8f07429))
* **core:** support injection token as predicate in queries ([#37506](https://github.com/angular/angular/issues/37506)) ([97dc85b](https://github.com/angular/angular/commit/97dc85b)), closes [#21152](https://github.com/angular/angular/issues/21152) [#36144](https://github.com/angular/angular/issues/36144)
* **core:** update reference and doc to change `async` to `waitAsync`. ([#37583](https://github.com/angular/angular/issues/37583)) ([8fbf40b](https://github.com/angular/angular/commit/8fbf40b))
* **forms:** AbstractControl to store raw validators in addition to combined validators function ([#37881](https://github.com/angular/angular/issues/37881)) ([ad7046b](https://github.com/angular/angular/commit/ad7046b))
* **localize:** allow duplicate messages to be handled during extraction ([#38082](https://github.com/angular/angular/issues/38082)) ([cf9a47b](https://github.com/angular/angular/commit/cf9a47b)), closes [#38077](https://github.com/angular/angular/issues/38077)
* **localize:** expose `canParse()` diagnostics ([#37909](https://github.com/angular/angular/issues/37909)) ([ec32eba](https://github.com/angular/angular/commit/ec32eba)), closes [#37901](https://github.com/angular/angular/issues/37901)
* **localize:** implement message extraction tool ([#32912](https://github.com/angular/angular/issues/32912)) ([190561d](https://github.com/angular/angular/commit/190561d))
* **platform-browser:** Allow `sms`-URLs ([#31463](https://github.com/angular/angular/issues/31463)) ([fc5c34d](https://github.com/angular/angular/commit/fc5c34d)), closes [#31462](https://github.com/angular/angular/issues/31462)
* **platform-server:** add option for absolute URL HTTP support ([#37539](https://github.com/angular/angular/issues/37539)) ([d37049a](https://github.com/angular/angular/commit/d37049a)), closes [#37071](https://github.com/angular/angular/issues/37071)
* **router:** better warning message when a router outlet has not been instantiated ([#30246](https://github.com/angular/angular/issues/30246)) ([1609815](https://github.com/angular/angular/commit/1609815))


### Bug Fixes

* **bazel:** fix integration test for bazel building ([#38629](https://github.com/angular/angular/issues/38629)) ([dd82f2f](https://github.com/angular/angular/commit/dd82f2f))
* **common:** date pipe gives wrong week number ([#37632](https://github.com/angular/angular/issues/37632)) ([ef1fb6d](https://github.com/angular/angular/commit/ef1fb6d)), closes [#33961](https://github.com/angular/angular/issues/33961)
* **common:** narrow `NgIf` context variables in template type checker ([#36627](https://github.com/angular/angular/issues/36627)) ([9c8bc4a](https://github.com/angular/angular/commit/9c8bc4a))
* **compiler-cli:** avoid creating value expressions for symbols from type-only imports ([#37912](https://github.com/angular/angular/issues/37912)) ([18098d3](https://github.com/angular/angular/commit/18098d3)), closes [#37900](https://github.com/angular/angular/issues/37900)
* **compiler-cli:** ensure source-maps can handle webpack:// protocol ([#32912](https://github.com/angular/angular/issues/32912)) ([decd95e](https://github.com/angular/angular/commit/decd95e))
* **compiler-cli:** only read source-map comment from last line ([#32912](https://github.com/angular/angular/issues/32912)) ([07a07e3](https://github.com/angular/angular/commit/07a07e3))
* **compiler-cli:** type-check inputs that include undefined when there's coercion members ([#38273](https://github.com/angular/angular/issues/38273)) ([7525f3a](https://github.com/angular/angular/commit/7525f3a))
* **compiler:** incorrectly inferring namespace for HTML nodes inside SVG ([#38477](https://github.com/angular/angular/issues/38477)) ([0dda97e](https://github.com/angular/angular/commit/0dda97e)), closes [#37218](https://github.com/angular/angular/issues/37218)
* **compiler:** mark `NgModuleFactory` construction as not side effectful ([#38147](https://github.com/angular/angular/issues/38147)) ([7f8c222](https://github.com/angular/angular/commit/7f8c222))
* **core:** Allow modification of lifecycle hooks any time before bootstrap ([#35464](https://github.com/angular/angular/issues/35464)) ([737506e](https://github.com/angular/angular/commit/737506e)), closes [#30497](https://github.com/angular/angular/issues/30497)
* **core:** detect DI parameters in JIT mode for downleveled ES2015 classes ([#38463](https://github.com/angular/angular/issues/38463)) ([ca07da4](https://github.com/angular/angular/commit/ca07da4)), closes [#38453](https://github.com/angular/angular/issues/38453)
* **core:** determine required DOMParser feature availability ([#36578](https://github.com/angular/angular/issues/36578)) ([#36578](https://github.com/angular/angular/issues/36578)) ([c509243](https://github.com/angular/angular/commit/c509243))
* **core:** do not trigger CSP alert/report in Firefox and Chrome ([#36578](https://github.com/angular/angular/issues/36578)) ([#36578](https://github.com/angular/angular/issues/36578)) ([b950d46](https://github.com/angular/angular/commit/b950d46)), closes [#25214](https://github.com/angular/angular/issues/25214)
* **core:** move generated i18n statements to the `consts` field of ComponentDef ([#38404](https://github.com/angular/angular/issues/38404)) ([cb05c01](https://github.com/angular/angular/commit/cb05c01))
* **elements:** run strategy methods in correct zone ([#37814](https://github.com/angular/angular/issues/37814)) ([8df888d](https://github.com/angular/angular/commit/8df888d)), closes [#24181](https://github.com/angular/angular/issues/24181)
* **forms:** handle form groups/arrays own pending async validation ([#22575](https://github.com/angular/angular/issues/22575)) ([77b62a5](https://github.com/angular/angular/commit/77b62a5)), closes [#10064](https://github.com/angular/angular/issues/10064)
* **language-service:** non-existent module format in package output ([#37623](https://github.com/angular/angular/issues/37623)) ([413a0fb](https://github.com/angular/angular/commit/413a0fb))
* **localize:** ensure required XLIFF parameters are serialized ([#38575](https://github.com/angular/angular/issues/38575)) ([f0af387](https://github.com/angular/angular/commit/f0af387)), closes [#38570](https://github.com/angular/angular/issues/38570)
* **localize:** extract the correct message ids ([#38498](https://github.com/angular/angular/issues/38498)) ([ac461e1](https://github.com/angular/angular/commit/ac461e1))
* **localize:** render ICU placeholders in extracted translation files ([#38484](https://github.com/angular/angular/issues/38484)) ([81c3e80](https://github.com/angular/angular/commit/81c3e80))
* **localize:** render text of extracted placeholders ([#38536](https://github.com/angular/angular/issues/38536)) ([14e90be](https://github.com/angular/angular/commit/14e90be))
* **ngcc:** detect synthesized delegate constructors for downleveled ES2015 classes ([#38463](https://github.com/angular/angular/issues/38463)) ([3b9c802](https://github.com/angular/angular/commit/3b9c802)), closes [#38453](https://github.com/angular/angular/issues/38453) [#38453](https://github.com/angular/angular/issues/38453)
* **router:** defer loading of wildcard module until needed ([#38348](https://github.com/angular/angular/issues/38348)) ([8f708b5](https://github.com/angular/angular/commit/8f708b5)), closes [#25494](https://github.com/angular/angular/issues/25494)
* **router:** fix navigation ignoring logic to compare to the browser url ([#37716](https://github.com/angular/angular/issues/37716)) ([a5ffca0](https://github.com/angular/angular/commit/a5ffca0)), closes [#16710](https://github.com/angular/angular/issues/16710) [#13586](https://github.com/angular/angular/issues/13586)
* **router:** properly compare array queryParams for equality ([#37709](https://github.com/angular/angular/issues/37709)) ([#37860](https://github.com/angular/angular/issues/37860)) ([1801d0c](https://github.com/angular/angular/commit/1801d0c))
* **router:** remove parenthesis for primary outlet segment after removing auxiliary outlet segment ([#24656](https://github.com/angular/angular/issues/24656)) ([#37163](https://github.com/angular/angular/issues/37163)) ([71f008f](https://github.com/angular/angular/commit/71f008f))
* **router:** restore 'history.state' object for navigations coming from Angular router ([#28108](https://github.com/angular/angular/issues/28108)) ([#28176](https://github.com/angular/angular/issues/28176)) ([df76a20](https://github.com/angular/angular/commit/df76a20))

### Code Refactoring
* **router:** export DefaultRouteReuseStrategy to Router public_api ([#31575](https://github.com/angular/angular/issues/31575)) ([ca79880](https://github.com/angular/angular/commit/ca79880))




### Performance Improvements
* **compiler-cli:** don't emit template guards when child scope is empty ([#38418](https://github.com/angular/angular/issues/38418)) ([1388c17](https://github.com/angular/angular/commit/1388c17))
* **compiler-cli:** fix regressions in incremental program reuse ([#37641](https://github.com/angular/angular/issues/37641)) ([5103d90](https://github.com/angular/angular/commit/5103d90))
* **compiler-cli:** only generate directive declarations when used ([#38418](https://github.com/angular/angular/issues/38418)) ([fb8f4b4](https://github.com/angular/angular/commit/fb8f4b4))
* **compiler-cli:** only generate type-check code for referenced DOM elements ([#38418](https://github.com/angular/angular/issues/38418)) ([f42e6ce](https://github.com/angular/angular/commit/f42e6ce))
* **forms:** use internal `ngDevMode` flag to tree-shake error messages in prod builds ([#37821](https://github.com/angular/angular/issues/37821)) ([201a546](https://github.com/angular/angular/commit/201a546)), closes [#37697](https://github.com/angular/angular/issues/37697)
* **ngcc:** shortcircuit tokenizing in ESM dependency host ([#37639](https://github.com/angular/angular/issues/37639)) ([bd7f440](https://github.com/angular/angular/commit/bd7f440))
* **ngcc:** use `EntryPointManifest` to speed up noop `ProgramBaseEntryPointFinder` ([#37665](https://github.com/angular/angular/issues/37665)) ([9318e23](https://github.com/angular/angular/commit/9318e23))
* **router:** apply prioritizedGuardValue operator to optimize CanLoad guards ([#37523](https://github.com/angular/angular/issues/37523)) ([d7dd295](https://github.com/angular/angular/commit/d7dd295))



<a name="10.0.14"></a>
## 10.0.14 (2020-08-26)


<a name="10.0.12"></a>
## 10.0.12 (2020-08-24)


### Bug Fixes

* **compiler-cli:** adding references to const enums in runtime code ([#38542](https://github.com/angular/angular/issues/38542)) ([814b436](https://github.com/angular/angular/commit/814b436)), closes [#38513](https://github.com/angular/angular/issues/38513)
* **core:** remove closing body tag from inert DOM builder ([#38454](https://github.com/angular/angular/issues/38454)) ([5528536](https://github.com/angular/angular/commit/5528536))
* **localize:** include the last placeholder in parsed translation text ([#38452](https://github.com/angular/angular/issues/38452)) ([57d1a48](https://github.com/angular/angular/commit/57d1a48))
* **localize:** parse all parts of a translation with nested HTML ([#38452](https://github.com/angular/angular/issues/38452)) ([07b99f5](https://github.com/angular/angular/commit/07b99f5)), closes [#38422](https://github.com/angular/angular/issues/38422)


### Features

* **language-service:** introduce hybrid visitor to locate AST node ([#38540](https://github.com/angular/angular/issues/38540)) ([66d8c22](https://github.com/angular/angular/commit/66d8c22))


<a name="10.0.11"></a>
## 10.0.11 (2020-08-19)


### Bug Fixes

* **router:** ensure routerLinkActive updates when associated routerLinks change (resubmit of [#38349](https://github.com/angular/angular/issues/38349)) ([#38511](https://github.com/angular/angular/issues/38511)) ([0af9533](https://github.com/angular/angular/commit/0af9533)), closes [#18469](https://github.com/angular/angular/issues/18469)



<a name="10.0.10"></a>
## 10.0.10 (2020-08-17)


### Bug Fixes

* **common:** Allow scrolling when browser supports scrollTo ([#38468](https://github.com/angular/angular/issues/38468)) ([b32126c](https://github.com/angular/angular/commit/b32126c)), closes [#30630](https://github.com/angular/angular/issues/30630)
* **core:** detect DI parameters in JIT mode for downleveled ES2015 classes ([#38500](https://github.com/angular/angular/issues/38500)) ([863acb6](https://github.com/angular/angular/commit/863acb6)), closes [#38453](https://github.com/angular/angular/issues/38453)
* **core:** error if CSS custom property in host binding has number in name ([#38432](https://github.com/angular/angular/issues/38432)) ([cb83b8a](https://github.com/angular/angular/commit/cb83b8a)), closes [#37292](https://github.com/angular/angular/issues/37292)
* **core:** fix multiple nested views removal from ViewContainerRef ([#38317](https://github.com/angular/angular/issues/38317)) ([d5e09f4](https://github.com/angular/angular/commit/d5e09f4)), closes [#38201](https://github.com/angular/angular/issues/38201)
* **ngcc:** detect synthesized delegate constructors for downleveled ES2015 classes ([#38500](https://github.com/angular/angular/issues/38500)) ([f3dd6c2](https://github.com/angular/angular/commit/f3dd6c2)), closes [#38453](https://github.com/angular/angular/issues/38453) [#38453](https://github.com/angular/angular/issues/38453)
* **router:** ensure routerLinkActive updates when associated routerLinks change ([#38349](https://github.com/angular/angular/issues/38349)) ([989e8a1](https://github.com/angular/angular/commit/989e8a1)), closes [#18469](https://github.com/angular/angular/issues/18469)



<a name="10.0.9"></a>
## 10.0.9 (2020-08-12)


### Bug Fixes

* **common:** ensure scrollRestoration is writable ([#30630](https://github.com/angular/angular/issues/30630)) ([#38357](https://github.com/angular/angular/issues/38357)) ([58f4b3a](https://github.com/angular/angular/commit/58f4b3a)), closes [#30629](https://github.com/angular/angular/issues/30629)
* **compiler:** evaluate safe navigation expressions in correct binding order ([#37911](https://github.com/angular/angular/issues/37911)) ([f5b9d87](https://github.com/angular/angular/commit/f5b9d87)), closes [#37194](https://github.com/angular/angular/issues/37194)
* **compiler-cli:** avoid creating value expressions for symbols from type-only imports ([#38415](https://github.com/angular/angular/issues/38415)) ([ca2b4bc](https://github.com/angular/angular/commit/ca2b4bc)), closes [#37912](https://github.com/angular/angular/issues/37912)
* **compiler-cli:** infer quote expressions as any type in type checker ([#37917](https://github.com/angular/angular/issues/37917)) ([5b87c67](https://github.com/angular/angular/commit/5b87c67)), closes [#36568](https://github.com/angular/angular/issues/36568)
* **compiler-cli:** mark eager `NgModuleFactory` construction as not side effectful ([#38320](https://github.com/angular/angular/issues/38320)) ([016a41b](https://github.com/angular/angular/commit/016a41b)), closes [#38147](https://github.com/angular/angular/issues/38147)
* **compiler-cli:** match wrapHost parameter types within plugin interface ([#38004](https://github.com/angular/angular/issues/38004)) ([df01a82](https://github.com/angular/angular/commit/df01a82))
* **compiler-cli:** preserve quotes in class member names ([#38387](https://github.com/angular/angular/issues/38387)) ([c9acb7b](https://github.com/angular/angular/commit/c9acb7b)), closes [#38311](https://github.com/angular/angular/issues/38311)
* **core:** prevent NgModule scope being overwritten in JIT compiler ([#37795](https://github.com/angular/angular/issues/37795)) ([3acebdc](https://github.com/angular/angular/commit/3acebdc)), closes [#37105](https://github.com/angular/angular/issues/37105)
* **core:** queries not matching string injection tokens ([#38321](https://github.com/angular/angular/issues/38321)) ([32109dc](https://github.com/angular/angular/commit/32109dc)), closes [#38313](https://github.com/angular/angular/issues/38313) [#38315](https://github.com/angular/angular/issues/38315)
* **core:** Store the currently selected ICU in `LView` ([#38345](https://github.com/angular/angular/issues/38345)) ([ee5123f](https://github.com/angular/angular/commit/ee5123f))
* **platform-server:** remove styles added by ServerStylesHost on destruction ([#38367](https://github.com/angular/angular/issues/38367)) ([7f11149](https://github.com/angular/angular/commit/7f11149))
* **router:** prevent calling unsubscribe on undefined subscription in RouterPreloader ([#38344](https://github.com/angular/angular/issues/38344)) ([4151314](https://github.com/angular/angular/commit/4151314))
* **service-worker:** fix the chrome debugger syntax highlighter ([#38332](https://github.com/angular/angular/issues/38332)) ([f5d5bac](https://github.com/angular/angular/commit/f5d5bac))


<a name="10.0.8"></a>
## 10.0.8 (2020-08-04)


### Bug Fixes

* **compiler:** add PURE annotation to getInheritedFactory calls ([#38291](https://github.com/angular/angular/issues/38291)) ([03d8e31](https://github.com/angular/angular/commit/03d8e31))
* **compiler:** update unparsable character reference entity error messages ([#38319](https://github.com/angular/angular/issues/38319)) ([cea4678](https://github.com/angular/angular/commit/cea4678)), closes [#26067](https://github.com/angular/angular/issues/26067)



<a name="10.0.7"></a>
## 10.0.7 (2020-07-30)


### Bug Fixes

* **compiler:** Metadata should not include methods on Object.prototype ([#38292](https://github.com/angular/angular/issues/38292)) ([879ff08](https://github.com/angular/angular/commit/879ff08))



<a name="10.0.6"></a>
## 10.0.6 (2020-07-28)


### Bug Fixes

* **compiler:** share identical stylesheets between components in the same file ([#38213](https://github.com/angular/angular/issues/38213)) ([264950b](https://github.com/angular/angular/commit/264950b)), closes [#38204](https://github.com/angular/angular/issues/38204)
* **compiler-cli:** Add support for string literal class members ([#38226](https://github.com/angular/angular/issues/38226)) ([b1e7775](https://github.com/angular/angular/commit/b1e7775))
* **core:** `Attribute` decorator `attributeName` is mandatory ([#38131](https://github.com/angular/angular/issues/38131)) ([1c4fcce](https://github.com/angular/angular/commit/1c4fcce)), closes [#32658](https://github.com/angular/angular/issues/32658)
* **core:** unify the signature between ngZone and noopZone ([#37581](https://github.com/angular/angular/issues/37581)) ([d5264f5](https://github.com/angular/angular/commit/d5264f5))



<a name="10.0.5"></a>
## 10.0.5 (2020-07-22)


### Bug Fixes

* **compiler:** properly associate source spans for implicitly closed elements ([#38126](https://github.com/angular/angular/issues/38126)) ([e80278c](https://github.com/angular/angular/commit/e80278c)), closes [#36118](https://github.com/angular/angular/issues/36118)
* **compiler-cli:** ensure file_system handles mixed Windows drives ([#38030](https://github.com/angular/angular/issues/38030)) ([dba4023](https://github.com/angular/angular/commit/dba4023)), closes [#36777](https://github.com/angular/angular/issues/36777)
* **core:** Allow modification of lifecycle hooks any time before bootstrap ([#38119](https://github.com/angular/angular/issues/38119)) ([14b4718](https://github.com/angular/angular/commit/14b4718)), closes [#30497](https://github.com/angular/angular/issues/30497)
* **core:** error due to integer overflow when there are too many host bindings ([#38014](https://github.com/angular/angular/issues/38014)) ([7b6e73c](https://github.com/angular/angular/commit/7b6e73c)), closes [#37876](https://github.com/angular/angular/issues/37876) [#37876](https://github.com/angular/angular/issues/37876)
* **core:** incorrectly validating properties on ng-content and ng-container ([#37773](https://github.com/angular/angular/issues/37773)) ([17ddab9](https://github.com/angular/angular/commit/17ddab9))



<a name="10.0.4"></a>
## 10.0.4 (2020-07-15)


### Bug Fixes

* **bazel:** ng_module rule does not expose flat module information in Ivy ([#36971](https://github.com/angular/angular/issues/36971)) ([b76a2dc](https://github.com/angular/angular/commit/b76a2dc))
* **compiler:** check more cases for pipe usage inside host bindings ([#37883](https://github.com/angular/angular/issues/37883)) ([a94383f](https://github.com/angular/angular/commit/a94383f)), closes [#34655](https://github.com/angular/angular/issues/34655) [#37610](https://github.com/angular/angular/issues/37610)
* **language-service:** non-existent module format in package output ([#37778](https://github.com/angular/angular/issues/37778)) ([12f1773](https://github.com/angular/angular/commit/12f1773))
* **language-service:** remove completion for string ([#37983](https://github.com/angular/angular/issues/37983)) ([387e838](https://github.com/angular/angular/commit/387e838))
* **ngcc:** report a warning if ngcc tries to use a solution-style tsconfig ([#38003](https://github.com/angular/angular/issues/38003)) ([e3b8010](https://github.com/angular/angular/commit/e3b8010)), closes [#36386](https://github.com/angular/angular/issues/36386)
* **service-worker:** correctly handle relative base href ([#37922](https://github.com/angular/angular/issues/37922)) ([b186db7](https://github.com/angular/angular/commit/b186db7)), closes [#25055](https://github.com/angular/angular/issues/25055) [#25055](https://github.com/angular/angular/issues/25055)
* **service-worker:** correctly serve `ngsw/state` with a non-root SW scope ([#37922](https://github.com/angular/angular/issues/37922)) ([dc42c97](https://github.com/angular/angular/commit/dc42c97)), closes [#30505](https://github.com/angular/angular/issues/30505)


### Features

* **bazel:** provide LinkablePackageInfo from ng_module ([#37778](https://github.com/angular/angular/issues/37778)) ([6cd10a1](https://github.com/angular/angular/commit/6cd10a1)), closes [/github.com/bazelbuild/rules_nodejs/blob/9a5de3728b05bf1647bbb87ad99f54e626604705/internal/linker/link_node_modules.bzl#L144-L146](https://github.com//github.com/bazelbuild/rules_nodejs/blob/9a5de3728b05bf1647bbb87ad99f54e626604705/internal/linker/link_node_modules.bzl/issues/L144-L146)


<a name="10.0.3"></a>
## 10.0.3 (2020-07-08)


### Bug Fixes

* **core:** handle spaces after `select` and `plural` ICU keywords ([#37866](https://github.com/angular/angular/issues/37866)) ([790bb94](https://github.com/angular/angular/commit/790bb94))



<a name="9.1.12"></a>
## [9.1.12](https://github.com/angular/angular/compare/9.1.11...9.1.12) (2020-07-08)


### Bug Fixes

* **core:** infinite loop if injectable using inheritance has a custom decorator ([6c1ab47](https://github.com/angular/angular/commit/6c1ab47)), closes [#35733](https://github.com/angular/angular/issues/35733)



<a name="10.0.2"></a>
## [10.0.2](https://github.com/angular/angular/compare/10.0.1...10.0.2) (2020-06-30)


### Bug Fixes

* **core:** determine required DOMParser feature availability ([#36578](https://github.com/angular/angular/issues/36578)) ([#37783](https://github.com/angular/angular/issues/37783)) ([12a71bc](https://github.com/angular/angular/commit/12a71bc))
* **core:** do not trigger CSP alert/report in Firefox and Chrome ([#36578](https://github.com/angular/angular/issues/36578)) ([#37783](https://github.com/angular/angular/issues/37783)) ([b0b7248](https://github.com/angular/angular/commit/b0b7248)), closes [#25214](https://github.com/angular/angular/issues/25214)
* **core:** don't consider inherited NG_ELEMENT_ID during DI ([#37574](https://github.com/angular/angular/issues/37574)) ([64b0ae9](https://github.com/angular/angular/commit/64b0ae9)), closes [#36235](https://github.com/angular/angular/issues/36235)
* **core:** error when invoking callbacks registered via ViewRef.onDestroy ([#37543](https://github.com/angular/angular/issues/37543)) ([75b119e](https://github.com/angular/angular/commit/75b119e)), closes [#36213](https://github.com/angular/angular/issues/36213)
* **core:** error when invoking callbacks registered via ViewRef.onDestroy ([#37543](https://github.com/angular/angular/issues/37543)) ([#37783](https://github.com/angular/angular/issues/37783)) ([df2cd37](https://github.com/angular/angular/commit/df2cd37)), closes [#36213](https://github.com/angular/angular/issues/36213)
* **core:** fake_async_fallback should have the same logic with fake-async ([#37680](https://github.com/angular/angular/issues/37680)) ([7a91b23](https://github.com/angular/angular/commit/7a91b23))
* **elements:** fire custom element output events during component initialization ([#37570](https://github.com/angular/angular/issues/37570)) ([89e16ed](https://github.com/angular/angular/commit/89e16ed)), closes [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts#L167-L170](https://github.com//github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts/issues/L167-L170) [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts#L164](https://github.com//github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts/issues/L164) [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/component-factory-strategy.ts#L158](https://github.com//github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/component-factory-strategy.ts/issues/L158) [#36141](https://github.com/angular/angular/issues/36141)
* **language-service:** incorrect autocomplete results on unknown symbol ([#37518](https://github.com/angular/angular/issues/37518)) ([7c0b25f](https://github.com/angular/angular/commit/7c0b25f))
* **ngcc:** ensure lockfile is removed when analyzeFn fails ([#37739](https://github.com/angular/angular/issues/37739)) ([1a1f99a](https://github.com/angular/angular/commit/1a1f99a))
* **ngcc:** prevent including JavaScript sources outside of the package ([#37596](https://github.com/angular/angular/issues/37596)) ([4b90b6a](https://github.com/angular/angular/commit/4b90b6a)), closes [#37508](https://github.com/angular/angular/issues/37508)


### Performance Improvements

* **compiler-cli:** fix memory leak in retained incremental state ([#37835](https://github.com/angular/angular/issues/37835)) ([57a518a](https://github.com/angular/angular/commit/57a518a))



<a name="10.0.1"></a>
## [10.0.1](https://github.com/angular/angular/compare/10.0.0...10.0.1) (2020-06-26)


### Bug Fixes

* **core:** cleanup DOM elements when root view is removed ([#37600](https://github.com/angular/angular/issues/37600)) ([64f2ffa](https://github.com/angular/angular/commit/64f2ffa)), closes [#36449](https://github.com/angular/angular/issues/36449)
* **forms:** change error message ([#37643](https://github.com/angular/angular/issues/37643)) ([c5bc2e7](https://github.com/angular/angular/commit/c5bc2e7))
* **forms:** correct usage of `selectedOptions` ([#37620](https://github.com/angular/angular/issues/37620)) ([dfb58c4](https://github.com/angular/angular/commit/dfb58c4)), closes [#37433](https://github.com/angular/angular/issues/37433)
* **http:** avoid abort a request when fetch operation is completed ([#37367](https://github.com/angular/angular/issues/37367)) ([a5d5f67](https://github.com/angular/angular/commit/a5d5f67))
* **language-service:** reinstate getExternalFiles() ([#37750](https://github.com/angular/angular/issues/37750)) ([ad6680f](https://github.com/angular/angular/commit/ad6680f))
* **migrations:** do not incorrectly add todo for @Injectable or @Pipe ([#37732](https://github.com/angular/angular/issues/37732)) ([13020b9](https://github.com/angular/angular/commit/13020b9)), closes [#37726](https://github.com/angular/angular/issues/37726)
* **router:** `RouterLinkActive` should run CD when setting `isActive` ([#21411](https://github.com/angular/angular/issues/21411)) ([a8ea817](https://github.com/angular/angular/commit/a8ea817)), closes [#15943](https://github.com/angular/angular/issues/15943) [#19934](https://github.com/angular/angular/issues/19934)
* **router:** add null support for RouterLink directive ([#32616](https://github.com/angular/angular/issues/32616)) ([69948ce](https://github.com/angular/angular/commit/69948ce))
* **router:** fix error when calling ParamMap.get function ([#31599](https://github.com/angular/angular/issues/31599)) ([3190ccf](https://github.com/angular/angular/commit/3190ccf))


### Performance Improvements

* **compiler-cli:** fix regressions in incremental program reuse ([#37690](https://github.com/angular/angular/issues/37690)) ([96b96fb](https://github.com/angular/angular/commit/96b96fb))



<a name="10.0.0"></a>
# [10.0.0](https://github.com/angular/angular/compare/10.0.0-rc.6...10.0.0) (2020-06-24)

[Blog post "Version 10 of Angular Now Available"](https://blog.angular.io/version-10-of-angular-now-available-78960babd41).


### Release Highlights & Update instructions
To learn about the release highlights and our CLI-powered automated update workflow for your projects please check out the [v10 release announcement](https://blog.angular.io/version-10-of-angular-now-available-78960babd41).


### Features

* **bazel:** expose explicit mapping from closure to devmode files ([#36262](https://github.com/angular/angular/issues/36262)) ([ba796bb](https://github.com/angular/angular/commit/ba796bb))
* **bazel:** simplify ng_package by dropping esm5 and fesm5 ([#36944](https://github.com/angular/angular/issues/36944)) ([9dbb30f](https://github.com/angular/angular/commit/9dbb30f))
* **compiler-cli:** report error if undecorated class with Angular features is discovered ([#36921](https://github.com/angular/angular/issues/36921)) ([4c92cf4](https://github.com/angular/angular/commit/4c92cf4))
* **compiler:** Propagate value span of ExpressionBinding to ParsedProperty ([#36133](https://github.com/angular/angular/issues/36133)) ([d714b95](https://github.com/angular/angular/commit/d714b95))
* **compiler:** add dependency info and ng-content selectors to metadata ([#35695](https://github.com/angular/angular/issues/35695)) ([32ce8b1](https://github.com/angular/angular/commit/32ce8b1))
* **compiler:** add name spans for property reads and method calls ([#36826](https://github.com/angular/angular/issues/36826)) ([eb34aa5](https://github.com/angular/angular/commit/eb34aa5))
* **core** make generic mandatory for ModuleWithProviders ([#36892](https://github.com/angular/angular/issues/36892)) ([20cc3ab](https://github.com/angular/angular/commit/20cc3ab))
* **core** update to tslib 2.0 and move to direct dependencies ([#37198](https://github.com/angular/angular/pull/37198)), closes [#37188](https://github.com/angular/angular/issues/37188)
* **core:** undecorated-classes migration should handle derived abstract classes ([#35339](https://github.com/angular/angular/issues/35339)) ([c24ad56](https://github.com/angular/angular/commit/c24ad56))
* **core:** undecorated-classes-with-decorated-fields migration should handle classes with lifecycle hooks ([#36921](https://github.com/angular/angular/issues/36921)) ([c6ecdc9](https://github.com/angular/angular/commit/c6ecdc9))
* **language-service:** Remove HTML entities autocompletion ([#37515](https://github.com/angular/angular/issues/37515)) ([67bd88b](https://github.com/angular/angular/commit/67bd88b))
* **language-service:** TS references from template items ([#37437](https://github.com/angular/angular/issues/37437)) ([bf2cb6f](https://github.com/angular/angular/commit/bf2cb6f))
* **language-service:** [ivy] Parse Angular compiler options ([#36922](https://github.com/angular/angular/issues/36922)) ([dbd0f8e](https://github.com/angular/angular/commit/dbd0f8e))
* **language-service:** [ivy] wrap ngtsc to handle typecheck files ([#36930](https://github.com/angular/angular/issues/36930)) ([1142c37](https://github.com/angular/angular/commit/1142c37))
* **localize:** support merging multiple translation files ([#36792](https://github.com/angular/angular/issues/36792)) ([72f534f](https://github.com/angular/angular/commit/72f534f))
* **ngcc:** allow async locking timeouts to be configured ([#36838](https://github.com/angular/angular/issues/36838)) ([38f805c](https://github.com/angular/angular/commit/38f805c))
* **ngcc:** implement a program-based entry-point finder ([#37075](https://github.com/angular/angular/issues/37075)) ([f3ccd29](https://github.com/angular/angular/commit/f3ccd29))
* **ngcc:** support for new APF where `module` points to esm2015 output ([#36944](https://github.com/angular/angular/issues/36944)) ([c98a4d6](https://github.com/angular/angular/commit/c98a4d6))
* **ngcc:** support marking an in-progress task as unprocessed ([#36626](https://github.com/angular/angular/issues/36626)) ([4665c35](https://github.com/angular/angular/commit/4665c35))
* **ngcc:** support reverting a file written by `FileWriter` ([#36626](https://github.com/angular/angular/issues/36626)) ([772ccf0](https://github.com/angular/angular/commit/772ccf0))
* **platform-server:** use absolute URLs from Location for HTTP ([#37071](https://github.com/angular/angular/issues/37071)) ([9edea0b](https://github.com/angular/angular/commit/9edea0b))
* **router:** allow CanLoad guard to return UrlTree ([#36610](https://github.com/angular/angular/issues/36610)) ([00e6cb1](https://github.com/angular/angular/commit/00e6cb1)), closes [#26521](https://github.com/angular/angular/issues/26521) [#28306](https://github.com/angular/angular/issues/28306)
* **service-worker:** include `CacheQueryOptions` options in ngsw-config ([#34663](https://github.com/angular/angular/issues/34663)) ([dc9f4b9](https://github.com/angular/angular/commit/dc9f4b9)), closes [#28443](https://github.com/angular/angular/issues/28443)
* **service-worker:** support timeout in `registerWhenStable` SW registration strategy ([#35870](https://github.com/angular/angular/issues/35870)) ([00efacf](https://github.com/angular/angular/commit/00efacf)), closes [#34464](https://github.com/angular/angular/issues/34464)
* **service-worker:** use `ignoreVary: true` when retrieving responses from cache ([#34663](https://github.com/angular/angular/issues/34663)) ([ee35e22](https://github.com/angular/angular/commit/ee35e22)), closes [#36638](https://github.com/angular/angular/issues/36638)
* remove TypeScript 3.6 and 3.7 support ([#36329](https://github.com/angular/angular/issues/36329)) ([fbd281c](https://github.com/angular/angular/commit/fbd281c))
* remove support for TypeScript 3.8 ([#37129](https://github.com/angular/angular/issues/37129)) ([6466fb2](https://github.com/angular/angular/commit/6466fb2))


### Bug Fixes

* **bazel:** ng_package rule should update "package.json" of ts_library targets ([#36944](https://github.com/angular/angular/issues/36944)) ([d5293d2](https://github.com/angular/angular/commit/d5293d2))
* **common:** `locales/global/*.js` are not ES5 compliant ([#36342](https://github.com/angular/angular/issues/36342)) ([078b0be](https://github.com/angular/angular/commit/078b0be)), closes [angular/angular-cli#16394](https://github.com/angular/angular-cli/issues/16394)
* **common:** format day-periods that cross midnight ([#36611](https://github.com/angular/angular/issues/36611)) ([c6e5fc4](https://github.com/angular/angular/commit/c6e5fc4)), closes [#36566](https://github.com/angular/angular/issues/36566)
* **common:** let `KeyValuePipe` accept type unions with `null` ([#36093](https://github.com/angular/angular/issues/36093)) ([d783519](https://github.com/angular/angular/commit/d783519)), closes [#35743](https://github.com/angular/angular/issues/35743)
* **common:** prevent duplicate URL change notifications ([#37404](https://github.com/angular/angular/issues/37404)) ([fff424a](https://github.com/angular/angular/commit/fff424a))
* **common:** prevent duplicate URL change notifications ([#37459](https://github.com/angular/angular/issues/37459)) ([0864726](https://github.com/angular/angular/commit/0864726))
* **compiler-cli:** `isCaseSensitive()` returns correct value ([#36859](https://github.com/angular/angular/issues/36859)) ([fc4741f](https://github.com/angular/angular/commit/fc4741f))
* **compiler-cli:** compute the correct target output for `$localize` messages ([#36989](https://github.com/angular/angular/issues/36989)) ([4e1b5e4](https://github.com/angular/angular/commit/4e1b5e4))
* **compiler-cli:** don't try to tag non-ts files as shims ([#36987](https://github.com/angular/angular/issues/36987)) ([42d1091](https://github.com/angular/angular/commit/42d1091))
* **compiler-cli:** downlevel angular decorators to static properties ([#37382](https://github.com/angular/angular/issues/37382)) ([323651b](https://github.com/angular/angular/commit/323651b)), closes [#30586](https://github.com/angular/angular/issues/30586) [#30106](https://github.com/angular/angular/issues/30106) [#30586](https://github.com/angular/angular/issues/30586) [#30141](https://github.com/angular/angular/issues/30141)
* **compiler-cli:** ensure LogicalFileSystem handles case-sensitivity ([#36859](https://github.com/angular/angular/issues/36859)) ([53a8459](https://github.com/angular/angular/commit/53a8459))
* **compiler-cli:** ensure LogicalFileSystem maintains case in paths ([#37008](https://github.com/angular/angular/issues/37008)) ([3dfc770](https://github.com/angular/angular/commit/3dfc770)), closes [#36992](https://github.com/angular/angular/issues/36992) [#36993](https://github.com/angular/angular/issues/36993) [#37000](https://github.com/angular/angular/issues/37000)
* **compiler-cli:** ensure `MockFileSystem` handles case-sensitivity ([#36859](https://github.com/angular/angular/issues/36859)) ([26eacd4](https://github.com/angular/angular/commit/26eacd4))
* **compiler-cli:** ensure `getRootDirs()` handles case-sensitivity ([#36859](https://github.com/angular/angular/issues/36859)) ([3f3e9b7](https://github.com/angular/angular/commit/3f3e9b7))
* **compiler-cli:** fix bug tracking indirect NgModule dependencies ([#36211](https://github.com/angular/angular/issues/36211)) ([bab90a7](https://github.com/angular/angular/commit/bab90a7))
* **compiler-cli:** fix case-sensitivity issues in NgtscCompilerHost ([#36859](https://github.com/angular/angular/issues/36859)) ([0ec0ff3](https://github.com/angular/angular/commit/0ec0ff3))
* **compiler-cli:** normalize mock Windows file paths correctly ([#36859](https://github.com/angular/angular/issues/36859)) ([b682bd1](https://github.com/angular/angular/commit/b682bd1))
* **compiler-cli:** pass real source spans where they are empty ([#31805](https://github.com/angular/angular/issues/31805)) ([e893c5a](https://github.com/angular/angular/commit/e893c5a))
* **compiler-cli:** use CompilerHost to ensure canonical file paths ([#36859](https://github.com/angular/angular/issues/36859)) ([a10c126](https://github.com/angular/angular/commit/a10c126))
* **compiler-cli:** use ModuleWithProviders type if static eval fails ([#37126](https://github.com/angular/angular/issues/37126)) ([305b5a3](https://github.com/angular/angular/commit/305b5a3))
* **compiler:** avoid generating i18n attributes in plain form ([#36422](https://github.com/angular/angular/issues/36422)) ([88b0985](https://github.com/angular/angular/commit/88b0985))
* **compiler:** avoid undefined expressions in holey array ([#36343](https://github.com/angular/angular/issues/36343)) ([5516802](https://github.com/angular/angular/commit/5516802))
* **compiler:** handle type references to namespaced symbols correctly ([#36106](https://github.com/angular/angular/issues/36106)) ([4aa4e6f](https://github.com/angular/angular/commit/4aa4e6f)), closes [#36006](https://github.com/angular/angular/issues/36006)
* **compiler:** normalize line endings in ICU expansions ([#36741](https://github.com/angular/angular/issues/36741)) ([70dd27f](https://github.com/angular/angular/commit/70dd27f)), closes [#36725](https://github.com/angular/angular/issues/36725)
* **compiler:** remove outdated and invalid warning for unresolved DI parameters ([#36985](https://github.com/angular/angular/issues/36985)) ([d0280a0](https://github.com/angular/angular/commit/d0280a0))
* **compiler:** resolve enum values in binary operations ([#36461](https://github.com/angular/angular/issues/36461)) ([64022f5](https://github.com/angular/angular/commit/64022f5)), closes [#35584](https://github.com/angular/angular/issues/35584)
* **compiler:** switch to 'referencedFiles' for shim generation ([#36211](https://github.com/angular/angular/issues/36211)) ([4213e8d](https://github.com/angular/angular/commit/4213e8d))
* **compiler:** unable to resolve destructuring variable declarations ([#37497](https://github.com/angular/angular/issues/37497)) ([df10597](https://github.com/angular/angular/commit/df10597)), closes [#36917](https://github.com/angular/angular/issues/36917)
* **core:** Host classes should not be fed back into `@Input` ([#35889](https://github.com/angular/angular/issues/35889)) ([cda2530](https://github.com/angular/angular/commit/cda2530)), closes [#35383](https://github.com/angular/angular/issues/35383)
* **core:** Refresh transplanted views at insertion point only ([#35968](https://github.com/angular/angular/issues/35968)) ([1786586](https://github.com/angular/angular/commit/1786586)), closes [#35400](https://github.com/angular/angular/issues/35400) [#21324](https://github.com/angular/angular/issues/21324)
* **core:** attempt to recover from user errors during creation ([#36381](https://github.com/angular/angular/issues/36381)) ([3d82aa7](https://github.com/angular/angular/commit/3d82aa7)), closes [#31221](https://github.com/angular/angular/issues/31221)
* **core:** avoid migration error when non-existent symbol is imported ([#36367](https://github.com/angular/angular/issues/36367)) ([d43c306](https://github.com/angular/angular/commit/d43c306)), closes [#36346](https://github.com/angular/angular/issues/36346)
* **core:** correct "development mode" console message ([#36571](https://github.com/angular/angular/issues/36571)) ([8d8e419](https://github.com/angular/angular/commit/8d8e419)), closes [#36570](https://github.com/angular/angular/issues/36570)
* **core:** disable tsickle pass when producing APF packages ([#37221](https://github.com/angular/angular/issues/37221)) ([a1001f2](https://github.com/angular/angular/commit/a1001f2))
* **core:** do not use unbound attributes as inputs to structural directives ([#36441](https://github.com/angular/angular/issues/36441)) ([acf6075](https://github.com/angular/angular/commit/acf6075))
* **core:** handle empty translations correctly ([#36499](https://github.com/angular/angular/issues/36499)) ([b1f1d3f](https://github.com/angular/angular/commit/b1f1d3f)), closes [#36476](https://github.com/angular/angular/issues/36476)
* **core:** handle pluralize functions that expect a number ([#36901](https://github.com/angular/angular/issues/36901)) ([2ff4b35](https://github.com/angular/angular/commit/2ff4b35)), closes [#36888](https://github.com/angular/angular/issues/36888)
* **core:** handle synthetic props in Directive host bindings correctly ([#35568](https://github.com/angular/angular/issues/35568)) ([f27deea](https://github.com/angular/angular/commit/f27deea)), closes [#35501](https://github.com/angular/angular/issues/35501)
* **core:** infinite loop if injectable using inheritance has a custom decorator ([#37022](https://github.com/angular/angular/issues/37022)) ([bc54936](https://github.com/angular/angular/commit/bc54936)), closes [#35733](https://github.com/angular/angular/issues/35733)
* **core:** inheritance delegate ctor regex updated to work on minified code ([#36962](https://github.com/angular/angular/issues/36962)) ([ea971f7](https://github.com/angular/angular/commit/ea971f7))
* **core:** log error instead of warning for unknown properties and elements ([#36399](https://github.com/angular/angular/issues/36399)) ([9d9d46f](https://github.com/angular/angular/commit/9d9d46f)), closes [#35699](https://github.com/angular/angular/issues/35699)
* **core:** missing-injectable migration should not migrate `@NgModule` classes ([#36369](https://github.com/angular/angular/issues/36369)) ([28995db](https://github.com/angular/angular/commit/28995db)), closes [#35700](https://github.com/angular/angular/issues/35700)
* **core:** ngOnDestroy on multi providers called with incorrect context ([#35840](https://github.com/angular/angular/issues/35840)) ([95fc3d4](https://github.com/angular/angular/commit/95fc3d4)), closes [#35231](https://github.com/angular/angular/issues/35231)
* **core:** pipes injecting viewProviders when used on a component host node ([#36512](https://github.com/angular/angular/issues/36512)) ([81d23b3](https://github.com/angular/angular/commit/81d23b3)), closes [#36146](https://github.com/angular/angular/issues/36146)
* **core:** prevent unknown property check for AOT-compiled components ([#36072](https://github.com/angular/angular/issues/36072)) ([4a9f0be](https://github.com/angular/angular/commit/4a9f0be)), closes [#35945](https://github.com/angular/angular/issues/35945)
* **core:** properly get root nodes from embedded views with <ng-content> ([#36051](https://github.com/angular/angular/issues/36051)) ([e30e132](https://github.com/angular/angular/commit/e30e132)), closes [#35967](https://github.com/angular/angular/issues/35967)
* **core:** properly identify modules affected by overrides in TestBed ([#36649](https://github.com/angular/angular/issues/36649)) ([942b986](https://github.com/angular/angular/commit/942b986)), closes [#36619](https://github.com/angular/angular/issues/36619)
* **core:** reenable decorator downleveling for Angular npm packages ([#37317](https://github.com/angular/angular/issues/37317)) ([d16a7f3](https://github.com/angular/angular/commit/d16a7f3)), closes [#37221](https://github.com/angular/angular/issues/37221) [#37221](https://github.com/angular/angular/issues/37221)
* **core:** run `APP_INITIALIZER`s before accessing `LOCALE_ID` token in Ivy TestBed ([#36237](https://github.com/angular/angular/issues/36237)) ([1649743](https://github.com/angular/angular/commit/1649743)), closes [#36230](https://github.com/angular/angular/issues/36230)
* **core:** should fake a top event task when coalescing events to prevent draining microTaskQueue too early. ([#36841](https://github.com/angular/angular/issues/36841)) ([9b8eb42](https://github.com/angular/angular/commit/9b8eb42)), closes [#36839](https://github.com/angular/angular/issues/36839)
* **core:** undecorated-classes-with-decorated-fields migration does not decorate derived classes ([#35339](https://github.com/angular/angular/issues/35339)) ([32eafef](https://github.com/angular/angular/commit/32eafef)), closes [#34376](https://github.com/angular/angular/issues/34376)
* **core:** undecorated-classes-with-decorated-fields migration should avoid error if base class has no value declaration ([#36543](https://github.com/angular/angular/issues/36543)) ([ca67748](https://github.com/angular/angular/commit/ca67748)), closes [#36522](https://github.com/angular/angular/issues/36522)
* **core:** workaround Terser inlining bug ([#36200](https://github.com/angular/angular/issues/36200)) ([0ce8ad3](https://github.com/angular/angular/commit/0ce8ad3))
* **elements:** capture input properties set before upgrading the element ([#36114](https://github.com/angular/angular/issues/36114)) ([2fc5ae5](https://github.com/angular/angular/commit/2fc5ae5)), closes [#30848](https://github.com/angular/angular/issues/30848) [#31416](https://github.com/angular/angular/issues/31416)
* **elements:** correctly handle getting/setting properties before connecting the element ([#36114](https://github.com/angular/angular/issues/36114)) ([327980b](https://github.com/angular/angular/commit/327980b)), closes [#30848](https://github.com/angular/angular/issues/30848)
* **elements:** correctly handle setting inputs to `undefined` ([#36140](https://github.com/angular/angular/issues/36140)) ([9ba46d9](https://github.com/angular/angular/commit/9ba46d9))
* **elements:** correctly set `SimpleChange#firstChange` for pre-existing inputs ([#36140](https://github.com/angular/angular/issues/36140)) ([b14ac96](https://github.com/angular/angular/commit/b14ac96)), closes [#36130](https://github.com/angular/angular/issues/36130)
* **elements:** do not break when the constructor of an Angular Element is not called ([#36114](https://github.com/angular/angular/issues/36114)) ([89b44d1](https://github.com/angular/angular/commit/89b44d1))
* **elements:** fire custom element output events during component initialization ([#36161](https://github.com/angular/angular/issues/36161)) ([e9bff5f](https://github.com/angular/angular/commit/e9bff5f)), closes [#36141](https://github.com/angular/angular/issues/36141)
* **forms:** handle numeric values properly in the validator ([#36157](https://github.com/angular/angular/issues/36157)) ([88a235d](https://github.com/angular/angular/commit/88a235d)), closes [#35591](https://github.com/angular/angular/issues/35591)
* **forms:** number input fires valueChanges twice ([#36087](https://github.com/angular/angular/issues/36087)) ([97d6d90](https://github.com/angular/angular/commit/97d6d90)), closes [#12540](https://github.com/angular/angular/issues/12540)
* **language-service:** Improve signature selection by finding exact match ([#37494](https://github.com/angular/angular/issues/37494)) ([e97a2d4](https://github.com/angular/angular/commit/e97a2d4))
* **language-service:** Recover from error in analyzing Ng Modules ([#37108](https://github.com/angular/angular/issues/37108)) ([2c1f35e](https://github.com/angular/angular/commit/2c1f35e))
* **language-service:** disable update the `[@angular](https://github.com/angular)/core` module ([#36783](https://github.com/angular/angular/issues/36783)) ([dd049ca](https://github.com/angular/angular/commit/dd049ca))
* **language-service:** infer type of elements of array-like objects ([#36312](https://github.com/angular/angular/issues/36312)) ([fe2b692](https://github.com/angular/angular/commit/fe2b692)), closes [#36191](https://github.com/angular/angular/issues/36191)
* **language-service:** properly evaluate types in comparable expressions ([#36529](https://github.com/angular/angular/issues/36529)) ([8be0972](https://github.com/angular/angular/commit/8be0972))
* **language-service:** use empty statement as parent of type node ([#36989](https://github.com/angular/angular/issues/36989)) ([a32cbed](https://github.com/angular/angular/commit/a32cbed))
* **language-service:** use the `HtmlAst` to get the span of HTML tag ([#36371](https://github.com/angular/angular/issues/36371)) ([81195a2](https://github.com/angular/angular/commit/81195a2))
* **language-service:** wrong completions in conditional operator ([#37505](https://github.com/angular/angular/issues/37505)) ([32020f9](https://github.com/angular/angular/commit/32020f9))
* **localize:** allow ICU expansion case to start with any character except `}` ([#36123](https://github.com/angular/angular/issues/36123)) ([fced8ee](https://github.com/angular/angular/commit/fced8ee)), closes [#31586](https://github.com/angular/angular/issues/31586)
* **localize:** ensure `getLocation()` works ([#36853](https://github.com/angular/angular/issues/36853)) ([70b25a3](https://github.com/angular/angular/commit/70b25a3))
* **localize:** include legacy ids when describing messages ([#36761](https://github.com/angular/angular/issues/36761)) ([47f9867](https://github.com/angular/angular/commit/47f9867))
* **ngcc:** `viaModule` should be `null` for local imports ([#36989](https://github.com/angular/angular/issues/36989)) ([d268d2a](https://github.com/angular/angular/commit/d268d2a))
* **ngcc:** add process title ([#36448](https://github.com/angular/angular/issues/36448)) ([76a8cd5](https://github.com/angular/angular/commit/76a8cd5)), closes [36414#issuecomment-609644282](https://github.com/angular/angular/issues/36414#issuecomment-609644282)
* **ngcc:** allow ngcc configuration to match pre-release versions of packages ([#36370](https://github.com/angular/angular/issues/36370)) ([326240e](https://github.com/angular/angular/commit/326240e))
* **ngcc:** capture dynamic import expressions as well as declarations ([#37075](https://github.com/angular/angular/issues/37075)) ([5c0bdae](https://github.com/angular/angular/commit/5c0bdae))
* **ngcc:** correctly detect external files from nested `node_modules/` ([#36559](https://github.com/angular/angular/issues/36559)) ([6ab43d7](https://github.com/angular/angular/commit/6ab43d7)), closes [#36526](https://github.com/angular/angular/issues/36526)
* **ngcc:** correctly detect imported TypeScript helpers ([#36284](https://github.com/angular/angular/issues/36284)) ([ca25c95](https://github.com/angular/angular/commit/ca25c95)), closes [#36089](https://github.com/angular/angular/issues/36089)
* **ngcc:** correctly get config for packages in nested `node_modules/` ([#37040](https://github.com/angular/angular/issues/37040)) ([9ade1c3](https://github.com/angular/angular/commit/9ade1c3))
* **ngcc:** correctly get config for sub-entry-points when primary entry-point is ignored ([#37040](https://github.com/angular/angular/issues/37040)) ([bf57776](https://github.com/angular/angular/commit/bf57776))
* **ngcc:** correctly identify relative Windows-style import paths ([#36372](https://github.com/angular/angular/issues/36372)) ([aecf9de](https://github.com/angular/angular/commit/aecf9de))
* **ngcc:** correctly identify the package path of secondary entry-points ([#36249](https://github.com/angular/angular/issues/36249)) ([995cd15](https://github.com/angular/angular/commit/995cd15)), closes [#35747](https://github.com/angular/angular/issues/35747)
* **ngcc:** correctly retrieve a package's version from its `package.json` ([#37040](https://github.com/angular/angular/issues/37040)) ([11c0402](https://github.com/angular/angular/commit/11c0402))
* **ngcc:** detect non-emitted, non-imported TypeScript helpers ([#36418](https://github.com/angular/angular/issues/36418)) ([5fa7b8b](https://github.com/angular/angular/commit/5fa7b8b))
* **ngcc:** display output from the unlocker process on Windows ([#36569](https://github.com/angular/angular/issues/36569)) ([e041ac6](https://github.com/angular/angular/commit/e041ac6))
* **ngcc:** display unlocker process output in sync mode ([#36637](https://github.com/angular/angular/issues/36637)) ([cabf997](https://github.com/angular/angular/commit/cabf997)), closes [/github.com/nodejs/node/issues/3596#issuecomment-250890218](https://github.com/nodejs/node/issues/3596#issuecomment-250890218)
* **ngcc:** do not inline source-maps for non-inline typings source-maps ([#37363](https://github.com/angular/angular/issues/37363)) ([b4e26b5](https://github.com/angular/angular/commit/b4e26b5)), closes [#37324](https://github.com/angular/angular/issues/37324)
* **ngcc:** do not run in parallel mode if there are less than 3 CPU cores ([#36626](https://github.com/angular/angular/issues/36626)) ([4c63241](https://github.com/angular/angular/commit/4c63241))
* **ngcc:** do not scan import expressions in d.ts files ([#37503](https://github.com/angular/angular/issues/37503)) ([8248307](https://github.com/angular/angular/commit/8248307))
* **ngcc:** do not spawn more processes than intended in parallel mode ([#36280](https://github.com/angular/angular/issues/36280)) ([5cee709](https://github.com/angular/angular/commit/5cee709)), closes [#35719](https://github.com/angular/angular/issues/35719) [#36278](https://github.com/angular/angular/issues/36278)
* **ngcc:** do not spawn unlocker processes on cluster workers ([#36569](https://github.com/angular/angular/issues/36569)) ([66effde](https://github.com/angular/angular/commit/66effde)), closes [#35861](https://github.com/angular/angular/issues/35861)
* **ngcc:** do not use cached file-system ([#36687](https://github.com/angular/angular/issues/36687)) ([0c2ed4c](https://github.com/angular/angular/commit/0c2ed4c)), closes [/github.com/angular/angular-cli/issues/16860#issuecomment-614694269](https://github.com/angular/angular-cli/issues/16860#issuecomment-614694269)
* **ngcc:** do not warn if `paths` mapping does not exist ([#36525](https://github.com/angular/angular/issues/36525)) ([717df13](https://github.com/angular/angular/commit/717df13)), closes [#36518](https://github.com/angular/angular/issues/36518)
* **ngcc:** do not write entry-point manifest outside node_modules ([#36299](https://github.com/angular/angular/issues/36299)) ([c6dd900](https://github.com/angular/angular/commit/c6dd900)), closes [#36296](https://github.com/angular/angular/issues/36296)
* **ngcc:** don't crash on cyclic source-map references ([#36452](https://github.com/angular/angular/issues/36452)) ([ee70a18](https://github.com/angular/angular/commit/ee70a18)), closes [#35727](https://github.com/angular/angular/issues/35727) [#35757](https://github.com/angular/angular/issues/35757)
* **ngcc:** ensure reflection hosts can handle TS 3.9 IIFE wrapped classes ([#36989](https://github.com/angular/angular/issues/36989)) ([d7440c4](https://github.com/angular/angular/commit/d7440c4))
* **ngcc:** ensure rendering formatters work with IIFE wrapped classes ([#36989](https://github.com/angular/angular/issues/36989)) ([c8ee390](https://github.com/angular/angular/commit/c8ee390))
* **ngcc:** ensure that more dependencies are found by `EsmDependencyHost` ([#37075](https://github.com/angular/angular/issues/37075)) ([c6872c0](https://github.com/angular/angular/commit/c6872c0))
* **ngcc:** find decorated constructor params on IIFE wrapped classes ([#37436](https://github.com/angular/angular/issues/37436)) ([2cb3b66](https://github.com/angular/angular/commit/2cb3b66)), closes [#37330](https://github.com/angular/angular/issues/37330)
* **ngcc:** force ngcc to exit on error ([#36622](https://github.com/angular/angular/issues/36622)) ([663b768](https://github.com/angular/angular/commit/663b768)), closes [#36616](https://github.com/angular/angular/issues/36616)
* **ngcc:** give up re-spawning crashed worker process after 3 attempts ([#36626](https://github.com/angular/angular/issues/36626)) ([793cb32](https://github.com/angular/angular/commit/793cb32))
* **ngcc:** handle `ENOMEM` errors in worker processes ([#36626](https://github.com/angular/angular/issues/36626)) ([4779c4b](https://github.com/angular/angular/commit/4779c4b))
* **ngcc:** handle bad path mappings when finding entry-points ([#36331](https://github.com/angular/angular/issues/36331)) ([cc4b813](https://github.com/angular/angular/commit/cc4b813)), closes [#36313](https://github.com/angular/angular/issues/36313) [#36283](https://github.com/angular/angular/issues/36283)
* **ngcc:** handle entry-points within container folders ([#36305](https://github.com/angular/angular/issues/36305)) ([38ad1d9](https://github.com/angular/angular/commit/38ad1d9)), closes [#35756](https://github.com/angular/angular/issues/35756) [#36216](https://github.com/angular/angular/issues/36216)
* **ngcc:** identifier ModuleWithProviders functions in IIFE wrapped classes ([#37206](https://github.com/angular/angular/issues/37206)) ([97e1399](https://github.com/angular/angular/commit/97e1399)), closes [#37189](https://github.com/angular/angular/issues/37189)
* **ngcc:** provide a unique exit code for timeouts ([#36838](https://github.com/angular/angular/issues/36838)) ([d805526](https://github.com/angular/angular/commit/d805526))
* **ngcc:** recognize enum declarations emitted in JavaScript ([#36550](https://github.com/angular/angular/issues/36550)) ([89c5890](https://github.com/angular/angular/commit/89c5890)), closes [#35584](https://github.com/angular/angular/issues/35584)
* **ngcc:** sniff `main` property for ESM5 format ([#36396](https://github.com/angular/angular/issues/36396)) ([2463548](https://github.com/angular/angular/commit/2463548)), closes [#35788](https://github.com/angular/angular/issues/35788)
* **ngcc:** support ModuleWithProviders functions that delegate ([#36948](https://github.com/angular/angular/issues/36948)) ([fafa50d](https://github.com/angular/angular/commit/fafa50d)), closes [#36892](https://github.com/angular/angular/issues/36892)
* **ngcc:** support TS 3.9 wrapped ES2015 classes ([#36884](https://github.com/angular/angular/issues/36884)) ([db4c59d](https://github.com/angular/angular/commit/db4c59d))
* **ngcc:** support `defineProperty()` re-exports in CommonJS and UMD ([#36989](https://github.com/angular/angular/issues/36989)) ([91092f6](https://github.com/angular/angular/commit/91092f6))
* **ngcc:** support ignoring deep-imports via package config ([#36423](https://github.com/angular/angular/issues/36423)) ([f9fb833](https://github.com/angular/angular/commit/f9fb833)), closes [#35750](https://github.com/angular/angular/issues/35750)
* **ngcc:** support recovering when a worker process crashes ([#36626](https://github.com/angular/angular/issues/36626)) ([966598c](https://github.com/angular/angular/commit/966598c)), closes [#36278](https://github.com/angular/angular/issues/36278)
* **ngcc:** support simple `browser` property in entry-points ([#36396](https://github.com/angular/angular/issues/36396)) ([6b3aa60](https://github.com/angular/angular/commit/6b3aa60)), closes [#36062](https://github.com/angular/angular/issues/36062)
* **ngcc:** use annotateForClosureCompiler option ([#36652](https://github.com/angular/angular/issues/36652)) ([eca8d11](https://github.com/angular/angular/commit/eca8d11)), closes [#36618](https://github.com/angular/angular/issues/36618)
* **ngcc:** use path-mappings from tsconfig in dependency resolution ([#36180](https://github.com/angular/angular/issues/36180)) ([380de1e](https://github.com/angular/angular/commit/380de1e)), closes [#36119](https://github.com/angular/angular/issues/36119)
* **ngcc:** use preserve whitespaces from tsconfig if provided ([#36189](https://github.com/angular/angular/issues/36189)) ([b8e9a30](https://github.com/angular/angular/commit/b8e9a30)), closes [#35871](https://github.com/angular/angular/issues/35871)
* **platform-server:** correctly handle absolute relative URLs ([#37341](https://github.com/angular/angular/issues/37341)) ([420d1c3](https://github.com/angular/angular/commit/420d1c3)), closes [#37314](https://github.com/angular/angular/issues/37314)
* **platform-server:** update `xhr2` dependency ([#36366](https://github.com/angular/angular/issues/36366)) ([b59bc0e](https://github.com/angular/angular/commit/b59bc0e)), closes [#36358](https://github.com/angular/angular/issues/36358)
* **router:** Fix relative link generation from empty path components ([#37446](https://github.com/angular/angular/issues/37446)) ([585e3f6](https://github.com/angular/angular/commit/585e3f6)), closes [#26243](https://github.com/angular/angular/issues/26243) [#13011](https://github.com/angular/angular/issues/13011) [#35687](https://github.com/angular/angular/issues/35687)
* **router:** allow UrlMatcher to return null ([#36402](https://github.com/angular/angular/issues/36402)) ([568e9df](https://github.com/angular/angular/commit/568e9df)), closes [#29824](https://github.com/angular/angular/issues/29824)
* **router:** cancel navigation when at least one resolver completes with no "next" emission ([#24621](https://github.com/angular/angular/issues/24621)) ([d9c4840](https://github.com/angular/angular/commit/d9c4840)), closes [#24195](https://github.com/angular/angular/issues/24195)
* **router:** fix navigation ignoring logic to compare to the browser url ([#37408](https://github.com/angular/angular/issues/37408)) ([5db2e79](https://github.com/angular/angular/commit/5db2e79)), closes [#16710](https://github.com/angular/angular/issues/16710) [#13586](https://github.com/angular/angular/issues/13586)
* **router:** pass correct component to canDeactivate checks when using two or more sibling router-outlets ([#36302](https://github.com/angular/angular/issues/36302)) ([80e6c07](https://github.com/angular/angular/commit/80e6c07)), closes [#34614](https://github.com/angular/angular/issues/34614)
* **router:** state data missing in routerLink ([#36462](https://github.com/angular/angular/issues/36462)) ([e0415db](https://github.com/angular/angular/commit/e0415db)), closes [#33173](https://github.com/angular/angular/issues/33173)
* **router:** update type for routerLink to include null and undefined ([#37018](https://github.com/angular/angular/issues/37018)) ([ef9f8df](https://github.com/angular/angular/commit/ef9f8df)), closes [#13380](https://github.com/angular/angular/issues/13380) [#36544](https://github.com/angular/angular/issues/36544)
* **service-worker:** Don't stay locked in EXISTING_CLIENTS_ONLY if corrupted data ([#37453](https://github.com/angular/angular/issues/37453)) ([6f93847](https://github.com/angular/angular/commit/6f93847)), closes [#31109](https://github.com/angular/angular/issues/31109) [#31865](https://github.com/angular/angular/issues/31865)
* **service-worker:** by default register the SW after 30s even the app never stabilizes ([#35870](https://github.com/angular/angular/issues/35870)) ([29e8a64](https://github.com/angular/angular/commit/29e8a64)), closes [#34464](https://github.com/angular/angular/issues/34464)
* **service-worker:** prevent SW registration strategies from affecting app stabilization ([#35870](https://github.com/angular/angular/issues/35870)) ([2d7c95f](https://github.com/angular/angular/commit/2d7c95f))
* **upgrade:** update $locationShim to handle Location changes before initialization ([#36498](https://github.com/angular/angular/issues/36498)) ([0cc53fb](https://github.com/angular/angular/commit/0cc53fb)), closes [#36492](https://github.com/angular/angular/issues/36492)
* add aikidave as reviewer for DOCS: Marketing ([#37014](https://github.com/angular/angular/issues/37014)) ([286fbf4](https://github.com/angular/angular/commit/286fbf4))


### Code Refactoring

* **common:** remove WrappedValue from AsyncPipe ([#36633](https://github.com/angular/angular/issues/36633)) ([49be32c](https://github.com/angular/angular/commit/49be32c)), closes [#29927](https://github.com/angular/angular/issues/29927)



### Performance Improvements

* **compiler-cli:** perform template type-checking incrementally ([#36211](https://github.com/angular/angular/issues/36211)) ([ecffc35](https://github.com/angular/angular/commit/ecffc35))
* **compiler-cli:** split Ivy template type-checking into multiple files ([#36211](https://github.com/angular/angular/issues/36211)) ([b861e9c](https://github.com/angular/angular/commit/b861e9c))
* **core:** avoid pulling in jit-specific code in aot bundles ([#37372](https://github.com/angular/angular/issues/37372)) ([#37514](https://github.com/angular/angular/issues/37514)) ([6114cd2](https://github.com/angular/angular/commit/6114cd2)), closes [#29083](https://github.com/angular/angular/issues/29083)
* **forms:** optimize internal method _anyControls in FormGroup ([#32534](https://github.com/angular/angular/issues/32534)) ([6c7467a](https://github.com/angular/angular/commit/6c7467a))
* **ngcc:** allow immediately reporting a stale lock file ([#37250](https://github.com/angular/angular/issues/37250)) ([930d204](https://github.com/angular/angular/commit/930d204))
* **ngcc:** cache parsed tsconfig between runs ([#37417](https://github.com/angular/angular/issues/37417)) ([f9daa13](https://github.com/angular/angular/commit/f9daa13)), closes [#36882](https://github.com/angular/angular/issues/36882)
* **ngcc:** only compute basePaths in TargetedEntryPointFinder when needed ([#36881](https://github.com/angular/angular/issues/36881)) ([ec6b9cc](https://github.com/angular/angular/commit/ec6b9cc)), closes [#36874](https://github.com/angular/angular/issues/36874)
* **ngcc:** only load  if it is needed ([#36486](https://github.com/angular/angular/issues/36486)) ([3bedfda](https://github.com/angular/angular/commit/3bedfda))
* **ngcc:** read dependencies from entry-point manifest ([#36486](https://github.com/angular/angular/issues/36486)) ([a185efb](https://github.com/angular/angular/commit/a185efb)), closes [#issuecomment-608401834](https://github.com/angular/angular#issuecomment-608401834)
* **ngcc:** reduce the size of the entry-point manifest file ([#36486](https://github.com/angular/angular/issues/36486)) ([ec0ce60](https://github.com/angular/angular/commit/ec0ce60))
* **ngcc:** speed up the `getBasePaths()` computation ([#36881](https://github.com/angular/angular/issues/36881)) ([e037840](https://github.com/angular/angular/commit/e037840))



#### Dependency updates
@angular/compiler-cli now requires:
- TypeScript 3.9


### BREAKING CHANGES

* TypeScript 3.6, 3.7 and 3.8 are no longer supported, please update to TypeScript 3.9.
* **core:** Angular npm packages no longer contain jsdoc comments
to support Closure Compiler's advanced optimizations

The support for Closure Compiler in Angular packages has been
experimental and broken for quite some time.

As of TS3.9, Closure is unusable with the JavaScript emit. Please follow
https://github.com/microsoft/TypeScript/issues/38374 for more
information and updates.

If you used Closure Compiler with Angular in the past, you will likely
be better off consuming Angular packages built from sources directly
rather than consuming the version we publish on npm,
which is primarily optimized for Webpack/Rollup + Terser build pipeline.

As a temporary workaround, you might consider using your current build
pipeline with Closure flag `--compilation_level=SIMPLE`. This flag
will ensure that your build pipeline produces buildable and
runnable artifacts, at the cost of increased payload size due to
advanced optimizations being disabled.

If you were affected by this change, please help us understand your
needs by leaving a comment on https://github.com/angular/angular/issues/37234.

* **core:** make generic mandatory for ModuleWithProviders

A generic type parameter has always been required for the `ModuleWithProviders` pattern to work with Ivy, but prior to this commit, View Engine allowed the generic type to be omitted (though support was officially deprecated).
If you're using `ModuleWithProviders` without a generic type in your application code, a v10 migration will update your code for you.

However, if you are using View Engine and also depending on a library that omits the generic type, you will now get a build time error similar to:

```
error TS2314: Generic type 'ModuleWithProviders<T>' requires 1 type argument(s).
```

In this case, ngcc won't help you (because it's Ivy-only) and the migration only covers application code.
You should contact the library author to fix their library to provide a type parameter when they use this class.

As a workaround, we suggest setting `skipLibChecks` to false in your tsconfig or updating your app to use Ivy.

* **forms:** Number inputs no longer listen to the `change` event.

Tests which trigger `change` events need to be updated to trigger `input` events instead.

The `change` event was in place to support IE9, as we found that `input` events were not fired with backspace or cut actions. If you need to maintain IE9 support, you will need to add a change event listener to number inputs and call the `onChange` method of `NumberValueAccessor` manually.

Lastly, old versions of WebDriver would synthetically trigger the `change` event on `WebElement.clear` and `WebElement.sendKeys`. If you are using an old version of WebDriver, you may need to update tests to ensure `input` events are triggered. For example, you could use `element.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);` in place of `element.clear()`.
* **forms:** The `minLength` and `maxLength` validators now verify that the form control's value has a
numeric `length` property, and only validate for length if that's the case.

Previously, falsey values without the length property (such as `0` or
`false` values) were triggering validation errors. If your code relies on
the old behavior, you can include other validators such as [min][1] or
[requiredTrue][2] to the list of validators for a particular field.

[1]: https://angular.io/api/forms/Validators#min
[2]: https://angular.io/api/forms/Validators#requiredTrue
* **bazel:** esm5 and fesm5 format is no longer distributed in
Angular's npm packages e.g. @angular/core

If you are not using Angular CLI to build your application or library,
and you need to be able to build es5 artifacts, then you will need to
downlevel the distributed Angular code to es5 on your own.

Angular CLI will automatically downlevel the code to es5 if differential
loading is enabled in the Angular project, so no action is required from
Angular CLI users.

* **core:** Warnings about unknown elements are now logged as errors. This won't break your app, but it may trip up tools that expect nothing to be logged via `console.error`.
* **router:** Any resolver which return EMPTY will cancel navigation.
If you want to allow the navigation to continue, you will need to update the resolvers to emit
some value, (i.e. defaultIfEmpty(...), of(...), etc).
* **service-worker:** Previously, [Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary)
headers would be taken into account when retrieving resources from the
cache, completely preventing the retrieval of cached assets (due to
ServiceWorker implementation details) and leading to unpredictable
behavior due to inconsistent/buggy implementations in different
browsers.

Now, `Vary` headers are ignored when retrieving resources from the
ServiceWorker caches, which can result in resources being retrieved even
when their headers are different. If your application needs to
differentiate its responses based on request headers, please make sure
the Angular ServiceWorker is [configured](https://angular.io/guide/service-worker-config)
to avoid caching the affected resources.
* **common:** This change could result in ExpressionChangedAfterItHasBeenChecked errors that
were not detected before. The error could previously have gone undetected
because two WrappedValues are considered "equal" in all cases for the purposes
of the check, even if their respective unwrapped values are not.

Additionally, `[val]=(observable | async).someProperty` will no longer
trigger change detection if the value of `someProperty` is identical to
the value in the previous emit. If you need to force change detection,
either update the binding to use an object whose reference changes or
subscribe to the observable and call markForCheck as needed.

* **common:** format day-periods that cross midnight

    When formatting a time with the `b` or `B` format codes, the rendered
    string was not correctly handling day periods that spanned midnight.
    Instead the logic was falling back to the default case of `AM`.

    Now the logic has been updated so that it matches times that are within
    a day period that spans midnight, so it will now render the correct
    output, such as `at night` in the case of English.

    Applications that are using either `formatDate()` or `DatePipe` and any
    of the `b` or `B` format codes will be affected by this change.

* **router:** UrlMatcher's type now reflects that it could always return
    null.

    If you implemented your own Router or Recognizer class, please update it to
    handle matcher returning null.




<a name="9.1.11"></a>
## [9.1.11](https://github.com/angular/angular/compare/9.1.10...9.1.11) (2020-06-10)

### Reverts

* **elements:** fire custom element output events during component initialization ([dc9da17](https://github.com/angular/angular/commit/dc9da17))


<a name="9.1.10"></a>
## [9.1.10](https://github.com/angular/angular/compare/9.1.9...9.1.10) (2020-06-09)


### Bug Fixes

* **elements:** fire custom element output events during component initialization ([454e073](https://github.com/angular/angular/commit/454e073)), closes [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts#L167-L170](https://github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts/issues/L167-L170) [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts#L164](https://github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/create-custom-element.ts/issues/L164) [/github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/component-factory-strategy.ts#L158](https://github.com/angular/angular/blob/c0143cb2abdd172de1b95fd1d2c4cfc738640e28/packages/elements/src/component-factory-strategy.ts/issues/L158) [#36141](https://github.com/angular/angular/issues/36141)


### Performance Improvements

* **ngcc:** cache parsed tsconfig between runs ([1aae94a](https://github.com/angular/angular/commit/1aae94a)), closes [#37417](https://github.com/angular/angular/issues/37417) [#36882](https://github.com/angular/angular/issues/36882)



<a name="9.1.9"></a>
## [9.1.9](https://github.com/angular/angular/compare/9.1.8...9.1.9) (2020-05-20)

This release contains a re-submit of the following 3 commits with fixes for TS 3.8.

### Bug Fixes

* **elements:** capture input properties set before upgrading the element ([#36114](https://github.com/angular/angular/issues/36114)) ([#37226](https://github.com/angular/angular/issues/37226)) ([a33cb2d](https://github.com/angular/angular/commit/a33cb2d)), closes [#30848](https://github.com/angular/angular/issues/30848) [#31416](https://github.com/angular/angular/issues/31416)
* **elements:** correctly handle getting/setting properties before connecting the element ([#36114](https://github.com/angular/angular/issues/36114)) ([#37226](https://github.com/angular/angular/issues/37226)) ([6ac0042](https://github.com/angular/angular/commit/6ac0042)), closes [/github.com/angular/angular/pull/31416/files#r300326698](https://github.com/angular/angular/pull/31416/files/issues/r300326698)
* **elements:** do not break when the constructor of an Angular Element is not called ([#36114](https://github.com/angular/angular/issues/36114)) ([#37226](https://github.com/angular/angular/issues/37226)) ([1465372](https://github.com/angular/angular/commit/1465372))



<a name="9.1.8"></a>
## [9.1.8](https://github.com/angular/angular/compare/9.1.6...9.1.8) (2020-05-20)


### Bug Fixes

* **core:** Host classes should not be fed back into `@Input` ([#35889](https://github.com/angular/angular/issues/35889)) ([f872b69](https://github.com/angular/angular/commit/f872b69)), closes [#35383](https://github.com/angular/angular/issues/35383)
* **core:** inheritance delegate ctor regex updated to work on minified code ([#36962](https://github.com/angular/angular/issues/36962)) ([e3d3395](https://github.com/angular/angular/commit/e3d3395))
* **elements:** capture input properties set before upgrading the element ([#36114](https://github.com/angular/angular/issues/36114)) ([1c8f179](https://github.com/angular/angular/commit/1c8f179)), closes [#30848](https://github.com/angular/angular/issues/30848) [#31416](https://github.com/angular/angular/issues/31416)
* **elements:** correctly handle getting/setting properties before connecting the element ([#36114](https://github.com/angular/angular/issues/36114)) ([363f14c](https://github.com/angular/angular/commit/363f14c)), closes [/github.com/angular/angular/pull/31416/files#r300326698](https://github.com/angular/angular/pull/31416/files/issues/r300326698)
* **elements:** do not break when the constructor of an Angular Element is not called ([#36114](https://github.com/angular/angular/issues/36114)) ([87b9f08](https://github.com/angular/angular/commit/87b9f08))
* **router:** update type for routerLink to include null and undefined ([#37018](https://github.com/angular/angular/issues/37018)) ([7de7871](https://github.com/angular/angular/commit/7de7871)), closes [#13380](https://github.com/angular/angular/issues/13380) [#36544](https://github.com/angular/angular/issues/36544)


<a name="9.1.7"></a>
## [9.1.7](https://github.com/angular/angular/compare/9.1.6...9.1.7) (2020-05-13)

This release contains various API docs improvements.


<a name="9.1.6"></a>
## [9.1.6](https://github.com/angular/angular/compare/9.1.5...9.1.6) (2020-05-08)

### Bug Fixes

* **compiler-cli**: Revert "fix(compiler-cli): fix case-sensitivity issues in NgtscCompilerHost (#36968)" (#37003)



<a name="9.1.5"></a>
## [9.1.5](https://github.com/angular/angular/compare/9.1.4...9.1.5) (2020-05-07)


### Bug Fixes

* **compiler-cli:** `isCaseSensitive()` returns correct value ([#36968](https://github.com/angular/angular/issues/36968)) ([4becc1b](https://github.com/angular/angular/commit/4becc1b))
* **compiler-cli:** ensure `getRootDirs()` handles case-sensitivity ([#36968](https://github.com/angular/angular/issues/36968)) ([5bddeea](https://github.com/angular/angular/commit/5bddeea))
* **compiler-cli:** ensure `MockFileSystem` handles case-sensitivity ([#36968](https://github.com/angular/angular/issues/36968)) ([b6c042d](https://github.com/angular/angular/commit/b6c042d))
* **compiler-cli:** ensure LogicalFileSystem handles case-sensitivity ([#36968](https://github.com/angular/angular/issues/36968)) ([65337fb](https://github.com/angular/angular/commit/65337fb))
* **compiler-cli:** fix case-sensitivity issues in NgtscCompilerHost ([#36968](https://github.com/angular/angular/issues/36968)) ([4abd603](https://github.com/angular/angular/commit/4abd603))
* **compiler-cli:** normalize mock Windows file paths correctly ([#36968](https://github.com/angular/angular/issues/36968)) ([654868f](https://github.com/angular/angular/commit/654868f))
* **compiler-cli:** use CompilerHost to ensure canonical file paths ([#36968](https://github.com/angular/angular/issues/36968)) ([7e9d5f5](https://github.com/angular/angular/commit/7e9d5f5))
* **core:** handle pluralize functions that expect a number ([#36901](https://github.com/angular/angular/issues/36901)) ([e5317d5](https://github.com/angular/angular/commit/e5317d5)), closes [#36888](https://github.com/angular/angular/issues/36888)
* **core:** properly get root nodes from embedded views with <ng-content> ([#36051](https://github.com/angular/angular/issues/36051)) ([a576852](https://github.com/angular/angular/commit/a576852)), closes [#35967](https://github.com/angular/angular/issues/35967)
* **core:** Refresh transplanted views at insertion point only ([#35968](https://github.com/angular/angular/issues/35968)) ([c8c2272](https://github.com/angular/angular/commit/c8c2272)), closes [#35400](https://github.com/angular/angular/issues/35400) [#21324](https://github.com/angular/angular/issues/21324)
* **localize:** ensure `getLocation()` works ([#36920](https://github.com/angular/angular/issues/36920)) ([701016d](https://github.com/angular/angular/commit/701016d))
* **ngcc:** do not run in parallel mode if there are less than 3 CPU cores ([#36626](https://github.com/angular/angular/issues/36626)) ([3800455](https://github.com/angular/angular/commit/3800455))
* **ngcc:** give up re-spawing crashed worker process after 3 attempts ([#36626](https://github.com/angular/angular/issues/36626)) ([1863733](https://github.com/angular/angular/commit/1863733))
* **ngcc:** handle `ENOMEM` errors in worker processes ([#36626](https://github.com/angular/angular/issues/36626)) ([901b980](https://github.com/angular/angular/commit/901b980))
* **ngcc:** support ModuleWithProviders functions that delegate ([#36948](https://github.com/angular/angular/issues/36948)) ([9d13ee0](https://github.com/angular/angular/commit/9d13ee0)), closes [#36892](https://github.com/angular/angular/issues/36892)
* **ngcc:** support recovering when a worker process crashes ([#36626](https://github.com/angular/angular/issues/36626)) ([f30307a](https://github.com/angular/angular/commit/f30307a)), closes [#36278](https://github.com/angular/angular/issues/36278)
* **ngcc:** partially support TS 3.9 wrapped ES2015 classes ([#36884](https://github.com/angular/angular/issues/36884)) ([ebb4733](https://github.com/angular/angular/commit/ebb4733))


### Performance Improvements

* **ngcc:** only compute basePaths in TargetedEntryPointFinder when needed ([#36881](https://github.com/angular/angular/issues/36881)) ([5ea51b2](https://github.com/angular/angular/commit/5ea51b2)), closes [#36874](https://github.com/angular/angular/issues/36874)
* **ngcc:** speed up the `getBasePaths()` computation ([#36881](https://github.com/angular/angular/issues/36881)) ([b6d0e21](https://github.com/angular/angular/commit/b6d0e21))



<a name="9.1.4"></a>
## [9.1.4](https://github.com/angular/angular/compare/9.1.3...9.1.4) (2020-04-29)


### Bug Fixes

* **core:** attempt to recover from user errors during creation ([#36381](https://github.com/angular/angular/issues/36381)) ([d743331](https://github.com/angular/angular/commit/d743331)), closes [#31221](https://github.com/angular/angular/issues/31221)
* **core:** handle synthetic props in Directive host bindings correctly ([#35568](https://github.com/angular/angular/issues/35568)) ([0f389fa](https://github.com/angular/angular/commit/0f389fa)), closes [#35501](https://github.com/angular/angular/issues/35501)
* **language-service:** disable update the `[@angular](https://github.com/angular)/core` module ([#36783](https://github.com/angular/angular/issues/36783)) ([d3a77ea](https://github.com/angular/angular/commit/d3a77ea))
* **localize:** include legacy ids when describing messages ([#36761](https://github.com/angular/angular/issues/36761)) ([aa94cd5](https://github.com/angular/angular/commit/aa94cd5))
* **ngcc:** recognize enum declarations emitted in JavaScript ([#36550](https://github.com/angular/angular/issues/36550)) ([c440165](https://github.com/angular/angular/commit/c440165)), closes [#35584](https://github.com/angular/angular/issues/35584)



<a name="9.1.3"></a>
## [9.1.3](https://github.com/angular/angular/compare/9.1.2...9.1.3) (2020-04-22)


### Bug Fixes

* **compiler:** avoid generating i18n attributes in plain form ([#36422](https://github.com/angular/angular/issues/36422)) ([08b8b51](https://github.com/angular/angular/commit/08b8b51))
* **core:** do not use unbound attributes as inputs to structural directives ([#36441](https://github.com/angular/angular/issues/36441)) ([c0ed57d](https://github.com/angular/angular/commit/c0ed57d))
* **core:** handle empty translations correctly ([#36499](https://github.com/angular/angular/issues/36499)) ([a5ea100](https://github.com/angular/angular/commit/a5ea100)), closes [#36476](https://github.com/angular/angular/issues/36476)
* **core:** missing-injectable migration should not migrate `@NgModule` classes ([#36369](https://github.com/angular/angular/issues/36369)) ([0bd50e2](https://github.com/angular/angular/commit/0bd50e2)), closes [#35700](https://github.com/angular/angular/issues/35700)
* **core:** pipes injecting viewProviders when used on a component host node ([#36512](https://github.com/angular/angular/issues/36512)) ([5ae8473](https://github.com/angular/angular/commit/5ae8473)), closes [#36146](https://github.com/angular/angular/issues/36146)
* **core:** prevent unknown property check for AOT-compiled components ([#36072](https://github.com/angular/angular/issues/36072)) ([fe1d9ba](https://github.com/angular/angular/commit/fe1d9ba)), closes [#35945](https://github.com/angular/angular/issues/35945)
* **core:** properly identify modules affected by overrides in TestBed ([#36649](https://github.com/angular/angular/issues/36649)) ([9724169](https://github.com/angular/angular/commit/9724169)), closes [#36619](https://github.com/angular/angular/issues/36619)
* **language-service:** properly evaluate types in comparable expressions ([#36529](https://github.com/angular/angular/issues/36529)) ([5bab498](https://github.com/angular/angular/commit/5bab498))
* **ngcc:** display unlocker process output in sync mode ([#36637](https://github.com/angular/angular/issues/36637)) ([da159bd](https://github.com/angular/angular/commit/da159bd)), closes [/github.com/nodejs/node/issues/3596#issuecomment-250890218](https://github.com/nodejs/node/issues/3596/issues/issuecomment-250890218)
* **ngcc:** do not use cached file-system ([#36687](https://github.com/angular/angular/issues/36687)) ([18be33a](https://github.com/angular/angular/commit/18be33a)), closes [/github.com/angular/angular-cli/issues/16860#issuecomment-614694269](https://github.com/angular/angular-cli/issues/16860/issues/issuecomment-614694269)



<a name="9.1.2"></a>
## [9.1.2](https://github.com/angular/angular/compare/9.1.1...9.1.2) (2020-04-15)


### Bug Fixes

* **compiler:** handle type references to namespaced symbols correctly ([#36106](https://github.com/angular/angular/issues/36106)) ([468cf69](https://github.com/angular/angular/commit/468cf69)), closes [#36006](https://github.com/angular/angular/issues/36006)
* **core:** undecorated-classes-with-decorated-fields migration should avoid error if base class has no value declaration ([#36543](https://github.com/angular/angular/issues/36543)) ([3992341](https://github.com/angular/angular/commit/3992341)), closes [#36522](https://github.com/angular/angular/issues/36522)
* **ngcc:** correctly detect external files from nested `node_modules/` ([#36559](https://github.com/angular/angular/issues/36559)) ([8c559ef](https://github.com/angular/angular/commit/8c559ef)), closes [#36526](https://github.com/angular/angular/issues/36526)
* **ngcc:** display output from the unlocker process on Windows ([#36569](https://github.com/angular/angular/issues/36569)) ([12266b2](https://github.com/angular/angular/commit/12266b2))
* **ngcc:** do not spawn unlocker processes on cluster workers ([#36569](https://github.com/angular/angular/issues/36569)) ([e385abc](https://github.com/angular/angular/commit/e385abc)), closes [#35861](https://github.com/angular/angular/issues/35861)
* **ngcc:** do not warn if `paths` mapping does not exist ([#36525](https://github.com/angular/angular/issues/36525)) ([33eee43](https://github.com/angular/angular/commit/33eee43)), closes [#36518](https://github.com/angular/angular/issues/36518)
* **ngcc:** force ngcc to exit on error ([#36622](https://github.com/angular/angular/issues/36622)) ([933cbfb](https://github.com/angular/angular/commit/933cbfb)), closes [#36616](https://github.com/angular/angular/issues/36616)
* **router:** pass correct component to canDeactivate checks when using two or more sibling router-outlets ([#36302](https://github.com/angular/angular/issues/36302)) ([8e7f903](https://github.com/angular/angular/commit/8e7f903)), closes [#34614](https://github.com/angular/angular/issues/34614)
* **upgrade:** update $locationShim to handle Location changes before initialization ([#36498](https://github.com/angular/angular/issues/36498)) ([a67afcc](https://github.com/angular/angular/commit/a67afcc)), closes [#36492](https://github.com/angular/angular/issues/36492)

### Performance Improvements
* **ngcc:** only load  if it is needed ([#36486](https://github.com/angular/angular/issues/36486)) ([e06512b](https://github.com/angular/angular/commit/e06512b))                                                                             * **ngcc:** read dependencies from entry-point manifest ([#36486](https://github.com/angular/angular/issues/36486)) ([918e628](https://github.com/angular/angular/commit/918e628)), closes [#issuecomment-608401834](https://github.com/angular/angular/issues/issuecomment-608401834)
* **ngcc:** reduce the size of the entry-point manifest file ([#36486](https://github.com/angular/angular/issues/36486)) ([603b094](https://github.com/angular/angular/commit/603b094))


<a name="9.1.1"></a>
## [9.1.1](https://github.com/angular/angular/compare/9.1.0...9.1.1) (2020-04-07)


### Bug Fixes

* **compiler:** avoid undefined expressions in holey array ([#36343](https://github.com/angular/angular/issues/36343)) ([90cae34](https://github.com/angular/angular/commit/90cae34))
* **compiler:** resolve enum values in binary operations ([#36461](https://github.com/angular/angular/issues/36461)) ([cbc25bb](https://github.com/angular/angular/commit/cbc25bb)), closes [#35584](https://github.com/angular/angular/issues/35584)
* **compiler-cli:** pass real source spans where they are empty ([#31805](https://github.com/angular/angular/issues/31805)) ([4894220](https://github.com/angular/angular/commit/4894220))
* **core:** avoid migration error when non-existent symbol is imported ([#36367](https://github.com/angular/angular/issues/36367)) ([dff52ec](https://github.com/angular/angular/commit/dff52ec)), closes [#36346](https://github.com/angular/angular/issues/36346)
* **core:** ngOnDestroy on multi providers called with incorrect context ([#35840](https://github.com/angular/angular/issues/35840)) ([af42694](https://github.com/angular/angular/commit/af42694)), closes [#35231](https://github.com/angular/angular/issues/35231)
* **core:** run `APP_INITIALIZER`s before accessing `LOCALE_ID` token in Ivy TestBed ([#36237](https://github.com/angular/angular/issues/36237)) ([5c28af0](https://github.com/angular/angular/commit/5c28af0)), closes [#36230](https://github.com/angular/angular/issues/36230)
* **core:** undecorated-classes-with-decorated-fields migration does not decorate derived classes ([#35339](https://github.com/angular/angular/issues/35339)) ([5ff5a11](https://github.com/angular/angular/commit/5ff5a11)), closes [#34376](https://github.com/angular/angular/issues/34376)
* **core:** undecorated-classes migration should handle derived abstract classes ([#35339](https://github.com/angular/angular/issues/35339)) ([a631b99](https://github.com/angular/angular/commit/a631b99))
* **language-service:** infer type of elements of array-like objects ([#36312](https://github.com/angular/angular/issues/36312)) ([ff523c9](https://github.com/angular/angular/commit/ff523c9)), closes [#36191](https://github.com/angular/angular/issues/36191)
* **language-service:** use the `HtmlAst` to get the span of HTML tag ([#36371](https://github.com/angular/angular/issues/36371)) ([ffa4e11](https://github.com/angular/angular/commit/ffa4e11))
* **ngcc:** add process title ([#36448](https://github.com/angular/angular/issues/36448)) ([136596d](https://github.com/angular/angular/commit/136596d)), closes [/github.com/angular/angular/issues/36414#issuecomment-609644282](https://github.com/angular/angular/issues/36414/issues/issuecomment-609644282)
* **ngcc:** allow ngcc configuration to match pre-release versions of packages ([#36370](https://github.com/angular/angular/issues/36370)) ([cb0a2a0](https://github.com/angular/angular/commit/cb0a2a0))
* **ngcc:** correctly detect imported TypeScript helpers ([#36284](https://github.com/angular/angular/issues/36284)) ([879457c](https://github.com/angular/angular/commit/879457c)), closes [#36089](https://github.com/angular/angular/issues/36089)
* **ngcc:** correctly identify relative Windows-style import paths ([#36372](https://github.com/angular/angular/issues/36372)) ([0daa488](https://github.com/angular/angular/commit/0daa488))
* **ngcc:** correctly identify the package path of secondary entry-points ([#36249](https://github.com/angular/angular/issues/36249)) ([e53b686](https://github.com/angular/angular/commit/e53b686)), closes [#35747](https://github.com/angular/angular/issues/35747)
* **ngcc:** detect non-emitted, non-imported TypeScript helpers ([#36418](https://github.com/angular/angular/issues/36418)) ([93b32d3](https://github.com/angular/angular/commit/93b32d3))
* **ngcc:** do not spawn more processes than intended in parallel mode ([#36280](https://github.com/angular/angular/issues/36280)) ([6ea232e](https://github.com/angular/angular/commit/6ea232e)), closes [#35719](https://github.com/angular/angular/issues/35719) [#36278](https://github.com/angular/angular/issues/36278) [/github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/main.ts#L429](https://github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/main.ts/issues/L429) [/github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts#L108](https://github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts/issues/L108) [/github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts#L110](https://github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts/issues/L110) [/github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts#L199](https://github.com/angular/angular/blob/b8e9a30d3b6/packages/compiler-cli/ngcc/src/execution/cluster/master.ts/issues/L199)
* **ngcc:** do not write entry-point manifest outside node_modules ([#36299](https://github.com/angular/angular/issues/36299)) ([bb8744d](https://github.com/angular/angular/commit/bb8744d)), closes [#36296](https://github.com/angular/angular/issues/36296)
* **ngcc:** don't crash on cyclic source-map references ([#36452](https://github.com/angular/angular/issues/36452)) ([56af303](https://github.com/angular/angular/commit/56af303)), closes [#35727](https://github.com/angular/angular/issues/35727) [#35757](https://github.com/angular/angular/issues/35757)
* **ngcc:** handle bad path mappings when finding entry-points ([#36331](https://github.com/angular/angular/issues/36331)) ([7bb3588](https://github.com/angular/angular/commit/7bb3588)), closes [#36313](https://github.com/angular/angular/issues/36313) [#36283](https://github.com/angular/angular/issues/36283)
* **ngcc:** handle entry-points within container folders ([#36305](https://github.com/angular/angular/issues/36305)) ([392ef93](https://github.com/angular/angular/commit/392ef93)), closes [#35756](https://github.com/angular/angular/issues/35756) [#36216](https://github.com/angular/angular/issues/36216)
* **ngcc:** sniff `main` property for ESM5 format ([#36396](https://github.com/angular/angular/issues/36396)) ([93cbef2](https://github.com/angular/angular/commit/93cbef2)), closes [#35788](https://github.com/angular/angular/issues/35788)
* **ngcc:** support ignoring deep-imports via package config ([#36423](https://github.com/angular/angular/issues/36423)) ([31eaf78](https://github.com/angular/angular/commit/31eaf78)), closes [#35750](https://github.com/angular/angular/issues/35750)
* **ngcc:** support simple `browser` property in entry-points ([#36396](https://github.com/angular/angular/issues/36396)) ([b0d680d](https://github.com/angular/angular/commit/b0d680d)), closes [#36062](https://github.com/angular/angular/issues/36062)
* **platform-server:** update `xhr2` dependency ([#36366](https://github.com/angular/angular/issues/36366)) ([14ae3c0](https://github.com/angular/angular/commit/14ae3c0)), closes [#36358](https://github.com/angular/angular/issues/36358)
* **router:** state data missing in routerLink ([#36462](https://github.com/angular/angular/issues/36462)) ([0e7a89a](https://github.com/angular/angular/commit/0e7a89a)), closes [#33173](https://github.com/angular/angular/issues/33173)


<a name="9.1.0"></a>
# [9.1.0](https://github.com/angular/angular/compare/9.0.0...9.1.0) (2020-03-25)

[Blog post "Version 9.1 of Angular Now Available — TypeScript 3.8, faster builds, and more"](https://blog.angular.io/version-9-1-of-angular-now-available-typescript-3-8-faster-builds-and-more-eb292f989428).


### Release Highlights

To learn about the release highlights and our CLI-powered automated update workflow for your projects please check out the [v9.1 release announcement](https://blog.angular.io/version-9-1-of-angular-now-available-typescript-3-8-faster-builds-and-more-eb292f989428).

* TypeScript 3.8 update
* ngcc improvements
  * performance optimizations
  * concurrency & reliability improvements for monorepo use-cases (npm postinstall script no longer recommended)
* i18n now supports RTL locale info
* Ivy compatibility fixes


### Features

* **bazel:** enable ivy template type-checking in g3 ([#35672](https://github.com/angular/angular/issues/35672)) ([8f5b7f3](https://github.com/angular/angular/commit/8f5b7f3))
* **bazel:** transform generated shims (in Ivy) with tsickle ([#35975](https://github.com/angular/angular/issues/35975)) ([e3ecdc6](https://github.com/angular/angular/commit/e3ecdc6)), closes [#35848](https://github.com/angular/angular/issues/35848)
* **compiler-cli:** implement NgTscPlugin on top of the NgCompiler API ([#34792](https://github.com/angular/angular/issues/34792)) ([3c69442dbd](https://github.com/angular/angular/commit/3c69442dbd))
* **compiler:** Add sourceSpan and keySpan to TemplateBinding ([#35897](https://github.com/angular/angular/issues/35897)) ([06779cf](https://github.com/angular/angular/commit/06779cf))
* **compiler:** Propagate source span and value span to Variable AST ([#36047](https://github.com/angular/angular/issues/36047)) ([31bec8c](https://github.com/angular/angular/commit/31bec8c))
* **compiler:** add dependency info and ng-content selectors to metadata ([#35695](https://github.com/angular/angular/issues/35695)) ([fb70083](https://github.com/angular/angular/commit/fb70083))
* **language-service:** improve non-callable error message ([#35271](https://github.com/angular/angular/issues/35271)) ([acc483e](https://github.com/angular/angular/commit/acc483e))
* **language-service:** modularize error messages ([#35678](https://github.com/angular/angular/issues/35678)) ([47a1811](https://github.com/angular/angular/commit/47a1811)), closes [#32663](https://github.com/angular/angular/issues/32663)
* **ngcc:** implement source-map flattening ([#35132](https://github.com/angular/angular/issues/35132)) ([df816c9](https://github.com/angular/angular/commit/df816c9))
* **ngcc:** pause async ngcc processing if another process has the lockfile ([#35131](https://github.com/angular/angular/issues/35131)) ([eef0753](https://github.com/angular/angular/commit/eef0753))
* **ngcc:** support invalidating the entry-point manifest ([#35931](https://github.com/angular/angular/issues/35931)) ([8ea61a1](https://github.com/angular/angular/commit/8ea61a1))
* **zone.js** add a temp solution to support passive event listeners. ([#34503](https://github.com/angular/angular/issues/34503)) ([f9d483e](https://github.com/angular/angular/commit/f9d483e))
* **zone.js** add an tickOptions parameter with property processNewMacroTasksSynchronously. ([#33838](https://github.com/angular/angular/issues/33838)) ([17b862c](https://github.com/angular/angular/commit/17b862c)), closes [#33799](https://github.com/angular/angular/issues/33799)
* **zone.js** add interface definitions which zone extends EventTarget ([#35304](https://github.com/angular/angular/issues/35304)) ([4acb676](https://github.com/angular/angular/commit/4acb676)), closes [#35173](https://github.com/angular/angular/issues/35173)
* **zone.js** support passive event options by defining global variables in zone.js config file ([#34503](https://github.com/angular/angular/issues/34503)) ([d7d359e](https://github.com/angular/angular/commit/d7d359e))
* define all zone.js configurations to typescript interfaces ([#35329](https://github.com/angular/angular/issues/35329)) ([03d88c7](https://github.com/angular/angular/commit/03d88c7))
* typescript 3.8 support ([#35864](https://github.com/angular/angular/issues/35864)) ([95c729f](https://github.com/angular/angular/commit/95c729f))


### Performance Improvements

* **core:** add micro benchmark for destroy hook invocation ([#35784](https://github.com/angular/angular/issues/35784)) ([0653db1](https://github.com/angular/angular/commit/0653db1))
* **core:** adding micro benchmark for host bindings ([#35705](https://github.com/angular/angular/issues/35705)) ([8fed1fe](https://github.com/angular/angular/commit/8fed1fe)), closes [#35568](https://github.com/angular/angular/issues/35568)
* **core:** avoid recursive scope recalculation when TestBed.overrideModule is used ([#35454](https://github.com/angular/angular/issues/35454)) ([0a1a989](https://github.com/angular/angular/commit/0a1a989))
* **core:** use multiple directives in host bindings micro benchmark ([#35736](https://github.com/angular/angular/issues/35736)) ([5bc39f8](https://github.com/angular/angular/commit/5bc39f8))
* **ivy:** remove unused event argument in listener instructions ([#35097](https://github.com/angular/angular/issues/35097)) ([9228d7f](https://github.com/angular/angular/commit/9228d7f))
* **ngcc:** link segment markers for faster traversal ([#36027](https://github.com/angular/angular/issues/36027)) ([47025e0](https://github.com/angular/angular/commit/47025e0))
* **ngcc:** only create tasks for non-processed formats ([#35719](https://github.com/angular/angular/issues/35719)) ([d7efc45](https://github.com/angular/angular/commit/d7efc45))
* **ngcc:** reduce directory traversing ([#35756](https://github.com/angular/angular/issues/35756)) ([e0a35e1](https://github.com/angular/angular/commit/e0a35e1)), closes [#35717](https://github.com/angular/angular/issues/35717)
* **ngcc:** spawn workers lazily ([#35719](https://github.com/angular/angular/issues/35719)) ([dc40a93](https://github.com/angular/angular/commit/dc40a93)), closes [#35717](https://github.com/angular/angular/issues/35717)
* **ngcc:** store the position of SegmentMarkers to avoid unnecessary computation ([#36027](https://github.com/angular/angular/issues/36027)) ([772bb5e](https://github.com/angular/angular/commit/772bb5e))
* **ngcc:** use binary search when flattening mappings ([#36027](https://github.com/angular/angular/issues/36027)) ([348ff0c](https://github.com/angular/angular/commit/348ff0c))
* **ngcc:** use line start positions for computing offsets in source-map flattening ([#36027](https://github.com/angular/angular/issues/36027)) ([e890082](https://github.com/angular/angular/commit/e890082))
* **ngcc:** use the `EntryPointManifest` in `DirectoryWalkerEntryPointFinder` ([#35931](https://github.com/angular/angular/issues/35931)) ([ec9f4d5](https://github.com/angular/angular/commit/ec9f4d5))


### Bug Fixes

* **animations:** Remove ɵAnimationDriver from private exports ([#35690](https://github.com/angular/angular/issues/35690)) ([ec789b0](https://github.com/angular/angular/commit/ec789b0))
* **animations:** allow computeStyle to work on elements created in Node ([#35810](https://github.com/angular/angular/issues/35810)) ([17cf04e](https://github.com/angular/angular/commit/17cf04e))
* **animations:** false positive when detecting Node in Webpack builds ([#35134](https://github.com/angular/angular/issues/35134)) ([dc4ae4b](https://github.com/angular/angular/commit/dc4ae4b)), closes [#35117](https://github.com/angular/angular/issues/35117)
* **animations:** process shorthand `margin` and `padding` styles correctly ([#35701](https://github.com/angular/angular/issues/35701)) ([35c9f0d](https://github.com/angular/angular/commit/35c9f0d)), closes [#35463](https://github.com/angular/angular/issues/35463)
* **bazel:** do not use manifest paths for generated imports within compilation unit ([#35841](https://github.com/angular/angular/issues/35841)) ([9581658](https://github.com/angular/angular/commit/9581658))
* **bazel:** ng_package rule creates incorrect UMD module exports ([#35792](https://github.com/angular/angular/issues/35792)) ([5c2a908](https://github.com/angular/angular/commit/5c2a908)), closes [angular/components#18652](https://github.com/angular/components/issues/18652)
* **bazel:** prod server doesn't serve files in windows ([#35991](https://github.com/angular/angular/issues/35991)) ([96e3449](https://github.com/angular/angular/commit/96e3449))
* **bazel:** update several packages for better windows support ([#35991](https://github.com/angular/angular/issues/35991)) ([32f099a](https://github.com/angular/angular/commit/32f099a))
* **bazel:** update typescript peer dependency range ([#36013](https://github.com/angular/angular/issues/36013)) ([5e3a898](https://github.com/angular/angular/commit/5e3a898))
* **common:** let `KeyValuePipe` accept type unions with `null` ([#36093](https://github.com/angular/angular/issues/36093)) ([407fa42](https://github.com/angular/angular/commit/407fa42)), closes [#35743](https://github.com/angular/angular/issues/35743)
* **compiler-cli:** TypeScript peer dependency range ([#36008](https://github.com/angular/angular/issues/36008)) ([5f7d066](https://github.com/angular/angular/commit/5f7d066))
* **compiler-cli:** suppress extraRequire errors in Closure Compiler ([#35737](https://github.com/angular/angular/issues/35737)) ([c296bfc](https://github.com/angular/angular/commit/c296bfc))
* **compiler:** Propagate value span of ExpressionBinding to ParsedProperty ([#36133](https://github.com/angular/angular/issues/36133)) ([2ce5fa3](https://github.com/angular/angular/commit/2ce5fa3))
* **compiler:** do not recurse to find static symbols of same module ([#35262](https://github.com/angular/angular/issues/35262)) ([e179c58](https://github.com/angular/angular/commit/e179c58))
* **compiler:** record correct end of expression ([#34690](https://github.com/angular/angular/issues/34690)) ([df890d7](https://github.com/angular/angular/commit/df890d7)), closes [#33477](https://github.com/angular/angular/issues/33477)
* **compiler:** support directive inputs with interpolations on `<ng-template>`s ([#35984](https://github.com/angular/angular/issues/35984)) ([79659ee](https://github.com/angular/angular/commit/79659ee)), closes [#35752](https://github.com/angular/angular/issues/35752)
* **compiler:** support i18n attributes on `<ng-template>` tags ([#35681](https://github.com/angular/angular/issues/35681)) ([40da51f](https://github.com/angular/angular/commit/40da51f))
* **compiler:** type-checking error for duplicate variables in templates ([#35674](https://github.com/angular/angular/issues/35674)) ([2c41bb8](https://github.com/angular/angular/commit/2c41bb8)), closes [#35186](https://github.com/angular/angular/issues/35186)
* **compiler:** use FatalDiagnosticError to generate better error messages ([#35244](https://github.com/angular/angular/issues/35244)) ([646655d](https://github.com/angular/angular/commit/646655d))
* **core:** Add `style="{{exp}}"` based interpolation ([#34202](https://github.com/angular/angular/issues/34202)) ([2562a3b](https://github.com/angular/angular/commit/2562a3b)), closes [#33575](https://github.com/angular/angular/issues/33575)
* **core:** Remove `debugger` statement ([#35763](https://github.com/angular/angular/issues/35763)) ([8f38eb7](https://github.com/angular/angular/commit/8f38eb7)), closes [#35470](https://github.com/angular/angular/issues/35470)
* **core:** Remove `debugger` statement when assert is thrown ([#35763](https://github.com/angular/angular/issues/35763)) ([4003538](https://github.com/angular/angular/commit/4003538)), closes [#35470](https://github.com/angular/angular/issues/35470)
* **core:** add `noSideEffects()` to `make*Decorator()` functions ([#35769](https://github.com/angular/angular/issues/35769)) ([dc6a791](https://github.com/angular/angular/commit/dc6a791))
* **core:** add `noSideEffects()` to `ɵɵdefineComponent()` ([#35769](https://github.com/angular/angular/issues/35769)) ([ba36127](https://github.com/angular/angular/commit/ba36127))
* **core:** add strictLiteralTypes to align core + VE checking of literals ([#35462](https://github.com/angular/angular/issues/35462)) ([4253662](https://github.com/angular/angular/commit/4253662))
* **core:** adhere to bootstrap options for JIT compiled components ([#35534](https://github.com/angular/angular/issues/35534)) ([e342ffd](https://github.com/angular/angular/commit/e342ffd)), closes [#35230](https://github.com/angular/angular/issues/35230)
* **core:** allow null / undefined values in query results ([#35796](https://github.com/angular/angular/issues/35796)) ([5652fb1](https://github.com/angular/angular/commit/5652fb1)), closes [#35673](https://github.com/angular/angular/issues/35673)
* **core:** better handing of ICUs outside of i18n blocks ([#35347](https://github.com/angular/angular/issues/35347)) ([c013dd4](https://github.com/angular/angular/commit/c013dd4))
* **core:** better inference for circularly referenced directive types ([#35622](https://github.com/angular/angular/issues/35622)) ([173a1ac](https://github.com/angular/angular/commit/173a1ac)), closes [#35372](https://github.com/angular/angular/issues/35372) [#35603](https://github.com/angular/angular/issues/35603) [#35522](https://github.com/angular/angular/issues/35522)
* **core:** correctly concatenate static and dynamic binding to `class` when shadowed ([#35350](https://github.com/angular/angular/issues/35350)) ([8c75f21](https://github.com/angular/angular/commit/8c75f21)), closes [#35335](https://github.com/angular/angular/issues/35335)
* **core:** don't re-invoke pure pipes that throw and arguments are the same ([#35827](https://github.com/angular/angular/issues/35827)) ([19cfaf7](https://github.com/angular/angular/commit/19cfaf7))
* **core:** emulate a View Engine type-checking bug with safe navigation ([#35462](https://github.com/angular/angular/issues/35462)) ([a61fe41](https://github.com/angular/angular/commit/a61fe41))
* **core:** error in AOT when pipe inherits constructor from injectable that uses DI ([#35468](https://github.com/angular/angular/issues/35468)) ([e17bde9](https://github.com/angular/angular/commit/e17bde9)), closes [#35277](https://github.com/angular/angular/issues/35277)
* **core:** error when accessing NgModuleRef.componentFactoryResolver in constructor ([#35637](https://github.com/angular/angular/issues/35637)) ([835618c](https://github.com/angular/angular/commit/835618c)), closes [#35580](https://github.com/angular/angular/issues/35580)
* **core:** handle `<ng-template>` with local refs in i18n blocks ([#35758](https://github.com/angular/angular/issues/35758)) ([ef75875](https://github.com/angular/angular/commit/ef75875))
* **core:** incorrectly generating shared pure function between null and object literal ([#35481](https://github.com/angular/angular/issues/35481)) ([22786c8](https://github.com/angular/angular/commit/22786c8)), closes [#33705](https://github.com/angular/angular/issues/33705) [#35298](https://github.com/angular/angular/issues/35298)
* **core:** injecting incorrect provider when re-providing injectable with useClass ([#34574](https://github.com/angular/angular/issues/34574)) ([0bc35a7](https://github.com/angular/angular/commit/0bc35a7)), closes [#34110](https://github.com/angular/angular/issues/34110)
* **core:** log error instead of warning for unknown properties and elements ([#35798](https://github.com/angular/angular/issues/35798)) ([00f3c58](https://github.com/angular/angular/commit/00f3c58)), closes [#35699](https://github.com/angular/angular/issues/35699)
* **core:** make subclass inherit developer-defined data ([#35105](https://github.com/angular/angular/issues/35105)) ([a756161](https://github.com/angular/angular/commit/a756161))
* **core:** provide a more detailed error message for NG6002/NG6003 ([#35620](https://github.com/angular/angular/issues/35620)) ([2d89b5d](https://github.com/angular/angular/commit/2d89b5d))
* **core:** remove side effects from `ɵɵNgOnChangesFeature()` ([#35769](https://github.com/angular/angular/issues/35769)) ([9cf85d2](https://github.com/angular/angular/commit/9cf85d2))
* **core:** remove side effects from `ɵɵgetInheritedFactory()` ([#35769](https://github.com/angular/angular/issues/35769)) ([c195d22](https://github.com/angular/angular/commit/c195d22))
* **core:** remove support for `Map`/`Set` in `[class]`/`[style]` bindings ([#35392](https://github.com/angular/angular/issues/35392)) ([2ca7984](https://github.com/angular/angular/commit/2ca7984))
* **core:** support sanitizer value in the [style] bindings ([#35564](https://github.com/angular/angular/issues/35564)) ([3af103a](https://github.com/angular/angular/commit/3af103a)), closes [#35476](https://github.com/angular/angular/issues/35476)
* **core:** treat `[class]` and `[className]` as unrelated bindings ([#35668](https://github.com/angular/angular/issues/35668)) ([a153b61](https://github.com/angular/angular/commit/a153b61)), closes [#35577](https://github.com/angular/angular/issues/35577)
* **core:** unable to NgModuleRef.injector in module constructor ([#35731](https://github.com/angular/angular/issues/35731)) ([1f8a243](https://github.com/angular/angular/commit/1f8a243)), closes [#35677](https://github.com/angular/angular/issues/35677) [#35639](https://github.com/angular/angular/issues/35639)
* **core:** undecorated-classes-with-di migration should handle libraries generated with CLI versions past v6.2.0 ([#35824](https://github.com/angular/angular/issues/35824)) ([59607dc](https://github.com/angular/angular/commit/59607dc)), closes [#34985](https://github.com/angular/angular/issues/34985)
* **core:** use proper configuration to compile Injectable in JIT ([#35706](https://github.com/angular/angular/issues/35706)) ([7b13977](https://github.com/angular/angular/commit/7b13977))
* **core:** verify parsed ICU expression at runtime before executing it ([#35923](https://github.com/angular/angular/issues/35923)) ([8c2d842](https://github.com/angular/angular/commit/8c2d842)), closes [#35689](https://github.com/angular/angular/issues/35689)
* **core:** workaround Terser inlining bug ([#36200](https://github.com/angular/angular/issues/36200)) ([f71d132](https://github.com/angular/angular/commit/f71d132))
* **elements:** correctly handle setting inputs to `undefined` ([#36140](https://github.com/angular/angular/issues/36140)) ([e066bdd](https://github.com/angular/angular/commit/e066bdd))
* **elements:** correctly set `SimpleChange#firstChange` for pre-existing inputs ([#36140](https://github.com/angular/angular/issues/36140)) ([447a600](https://github.com/angular/angular/commit/447a600)), closes [#36130](https://github.com/angular/angular/issues/36130)
* **ivy:** `LFrame` needs to release memory on `leaveView()` ([#35156](https://github.com/angular/angular/issues/35156)) ([b9b512f](https://github.com/angular/angular/commit/b9b512f)), closes [#35148](https://github.com/angular/angular/issues/35148)
* **ivy:** add attributes and classes to host elements based on selector ([#34481](https://github.com/angular/angular/issues/34481)) ([f95b8ce](https://github.com/angular/angular/commit/f95b8ce))
* **ivy:** error if directive with synthetic property binding is on same node as directive that injects ViewContainerRef ([#35343](https://github.com/angular/angular/issues/35343)) ([d6bc63f](https://github.com/angular/angular/commit/d6bc63f)), closes [#35342](https://github.com/angular/angular/issues/35342)
* **ivy:** narrow `NgIf` context variables in template type checker ([#35125](https://github.com/angular/angular/issues/35125)) ([40039d8](https://github.com/angular/angular/commit/40039d8)), closes [#34572](https://github.com/angular/angular/issues/34572)
* **ivy:** queries should match elements inside ng-container with the descendants: false option ([#35384](https://github.com/angular/angular/issues/35384)) ([3f4e02b](https://github.com/angular/angular/commit/3f4e02b)), closes [#34768](https://github.com/angular/angular/issues/34768)
* **ivy:** support dynamic query tokens in AOT mode ([#35307](https://github.com/angular/angular/issues/35307)) ([3e3a1ef](https://github.com/angular/angular/commit/3e3a1ef)), closes [#34267](https://github.com/angular/angular/issues/34267)
* **ivy:** wrong context passed to ngOnDestroy when resolved multiple times ([#35249](https://github.com/angular/angular/issues/35249)) ([5fbfe69](https://github.com/angular/angular/commit/5fbfe69)), closes [#35167](https://github.com/angular/angular/issues/35167)
* **language-service:** fix calculation of pipe spans ([#35986](https://github.com/angular/angular/issues/35986)) ([406419b](https://github.com/angular/angular/commit/406419b))
* **language-service:** get the right 'ElementAst' in the nested HTML tag ([#35317](https://github.com/angular/angular/issues/35317)) ([8e354da](https://github.com/angular/angular/commit/8e354da))
* **language-service:** infer $implicit value for ngIf template contexts ([#35941](https://github.com/angular/angular/issues/35941)) ([18b1bd4](https://github.com/angular/angular/commit/18b1bd4))
* **language-service:** infer context type of structural directives ([#35537](https://github.com/angular/angular/issues/35537)) ([#35561](https://github.com/angular/angular/issues/35561)) ([54fd33f](https://github.com/angular/angular/commit/54fd33f))
* **language-service:** provide completions for the structural directive that only injects the 'ViewContainerRef' ([#35466](https://github.com/angular/angular/issues/35466)) ([66c06eb](https://github.com/angular/angular/commit/66c06eb))
* **language-service:** provide hover for interpolation in attribute value ([#35494](https://github.com/angular/angular/issues/35494)) ([049f118](https://github.com/angular/angular/commit/049f118)), closes [PR#34847](https://github.com/PR/issues/34847)
* **language-service:** resolve the real path for symlink ([#35895](https://github.com/angular/angular/issues/35895)) ([4e1d780](https://github.com/angular/angular/commit/4e1d780))
* **language-service:** resolve the variable from the template context first ([#35982](https://github.com/angular/angular/issues/35982)) ([3d46a45](https://github.com/angular/angular/commit/3d46a45))
* **localize:** allow ICU expansion case to start with any character except `}` ([#36123](https://github.com/angular/angular/issues/36123)) ([0767d37](https://github.com/angular/angular/commit/0767d37)), closes [#31586](https://github.com/angular/angular/issues/31586)
* **localize:** improve matching and parsing of XLIFF 1.2 translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([350ac11](https://github.com/angular/angular/commit/350ac11))
* **localize:** improve matching and parsing of XLIFF 2.0 translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([08071e5](https://github.com/angular/angular/commit/08071e5))
* **localize:** improve matching and parsing of XTB translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([0e2a577](https://github.com/angular/angular/commit/0e2a577))
* **localize:** improve placeholder mismatch error message ([#35593](https://github.com/angular/angular/issues/35593)) ([53f059e](https://github.com/angular/angular/commit/53f059e))
* **localize:** merge translation from all  XLIFF `<file>` elements ([#35936](https://github.com/angular/angular/issues/35936)) ([fc4c3c3](https://github.com/angular/angular/commit/fc4c3c3)), closes [#35839](https://github.com/angular/angular/issues/35839)
* **localize:** show helpful error when providing an invalid cli option ([#36010](https://github.com/angular/angular/issues/36010)) ([aad02e8](https://github.com/angular/angular/commit/aad02e8))
* **localize:** support minified ES5 `$localize` calls ([#35562](https://github.com/angular/angular/issues/35562)) ([df75451](https://github.com/angular/angular/commit/df75451)), closes [#35376](https://github.com/angular/angular/issues/35376)
* **ngcc:** add default config for `angular2-highcharts` ([#35527](https://github.com/angular/angular/issues/35527)) ([3cc8127](https://github.com/angular/angular/commit/3cc8127)), closes [#35399](https://github.com/angular/angular/issues/35399)
* **ngcc:** allow deep-import warnings to be ignored ([#35683](https://github.com/angular/angular/issues/35683)) ([20b0c80](https://github.com/angular/angular/commit/20b0c80)), closes [#35615](https://github.com/angular/angular/issues/35615)
* **ngcc:** capture path-mapped entry-points that start with same string ([#35592](https://github.com/angular/angular/issues/35592)) ([71b5970](https://github.com/angular/angular/commit/71b5970)), closes [#35536](https://github.com/angular/angular/issues/35536)
* **ngcc:** consistently delegate to TypeScript host for typing files ([#36089](https://github.com/angular/angular/issues/36089)) ([9e70bcb](https://github.com/angular/angular/commit/9e70bcb)), closes [#35078](https://github.com/angular/angular/issues/35078)
* **ngcc:** correctly detect emitted TS helpers in ES5 ([#35191](https://github.com/angular/angular/issues/35191)) ([bd6a39c](https://github.com/angular/angular/commit/bd6a39c))
* **ngcc:** correctly detect outer aliased class identifiers in ES5 ([#35527](https://github.com/angular/angular/issues/35527)) ([fde8915](https://github.com/angular/angular/commit/fde8915)), closes [#35399](https://github.com/angular/angular/issues/35399)
* **ngcc:** do not crash on entry-point that fails to compile ([#36083](https://github.com/angular/angular/issues/36083)) ([ff665b9](https://github.com/angular/angular/commit/ff665b9))
* **ngcc:** do not crash on overlapping entry-points ([#36083](https://github.com/angular/angular/issues/36083)) ([c9f554c](https://github.com/angular/angular/commit/c9f554c))
* **ngcc:** handle imports in dts files when processing CommonJS ([#35191](https://github.com/angular/angular/issues/35191)) ([b6e8847](https://github.com/angular/angular/commit/b6e8847)), closes [#34356](https://github.com/angular/angular/issues/34356)
* **ngcc:** handle mappings outside the content when flattening source-maps ([#35718](https://github.com/angular/angular/issues/35718)) ([73cf7d5](https://github.com/angular/angular/commit/73cf7d5)), closes [#35709](https://github.com/angular/angular/issues/35709)
* **ngcc:** handle missing sources when flattening source-maps ([#35718](https://github.com/angular/angular/issues/35718)) ([72c4fda](https://github.com/angular/angular/commit/72c4fda)), closes [#35709](https://github.com/angular/angular/issues/35709)
* **ngcc:** handle multiple original sources when flattening source-maps ([#36027](https://github.com/angular/angular/issues/36027)) ([a40be00](https://github.com/angular/angular/commit/a40be00))
* **ngcc:** introduce a new LockFile implementation that uses a child-process ([#35861](https://github.com/angular/angular/issues/35861)) ([c55f900](https://github.com/angular/angular/commit/c55f900)), closes [#35761](https://github.com/angular/angular/issues/35761)
* **ngcc:** show helpful error when providing an invalid option ([#36010](https://github.com/angular/angular/issues/36010)) ([1f89c61](https://github.com/angular/angular/commit/1f89c61))
* **ngcc:** use path-mappings from tsconfig in dependency resolution ([#36180](https://github.com/angular/angular/issues/36180)) ([6defe96](https://github.com/angular/angular/commit/6defe96)), closes [#36119](https://github.com/angular/angular/issues/36119)
* **ngcc:** use preserve whitespaces from tsconfig if provided ([#36189](https://github.com/angular/angular/issues/36189)) ([aef4323](https://github.com/angular/angular/commit/aef4323)), closes [#35871](https://github.com/angular/angular/issues/35871)
* **platform-browser:** add missing peerDependency on `[@angular](https://github.com/angular)/animations` ([#35949](https://github.com/angular/angular/issues/35949)) ([64d6f13](https://github.com/angular/angular/commit/64d6f13)), closes [#35888](https://github.com/angular/angular/issues/35888)
* **router:** removed unused ApplicationRef dependency ([#35642](https://github.com/angular/angular/issues/35642)) ([c839c05](https://github.com/angular/angular/commit/c839c05)), closes [/github.com/angular/angular/commit/5a849829c42330d7e88e83e916e6e36380c97a97#diff-c0baae5e1df628e1a217e8dc38557](https://github.com/angular/angular/commit/5a849829c42330d7e88e83e916e6e36380c97a97/issues/diff-c0baae5e1df628e1a217e8dc38557)
* **router:** state data missing in routerLink ([#33203](https://github.com/angular/angular/issues/33203)) ([de67978](https://github.com/angular/angular/commit/de67978))
* **service-worker:** treat 503 as offline ([#35595](https://github.com/angular/angular/issues/35595)) ([96cdf03](https://github.com/angular/angular/commit/96cdf03)), closes [#35571](https://github.com/angular/angular/issues/35571)
* fix flaky test cases of passive events ([#35679](https://github.com/angular/angular/issues/35679)) ([8ef29b6](https://github.com/angular/angular/commit/8ef29b6))

<a name="9.0.7"></a>
## [9.0.7](https://github.com/angular/angular/compare/9.0.6...9.0.7) (2020-03-18)


### Bug Fixes

* **compiler:** do not recurse to find static symbols of same module ([#35262](https://github.com/angular/angular/issues/35262)) ([a52b568](https://github.com/angular/angular/commit/a52b568))
* **compiler:** support directive inputs with interpolations on `<ng-template>`s ([#35984](https://github.com/angular/angular/issues/35984)) ([a6bf31b](https://github.com/angular/angular/commit/a6bf31b)), closes [#35752](https://github.com/angular/angular/issues/35752)
* **core:** don't re-invoke pure pipes that throw and arguments are the same ([#35827](https://github.com/angular/angular/issues/35827)) ([3fa632b](https://github.com/angular/angular/commit/3fa632b))
* **core:** verify parsed ICU expression at runtime before executing it ([#35923](https://github.com/angular/angular/issues/35923)) ([9cd115d](https://github.com/angular/angular/commit/9cd115d)), closes [#35689](https://github.com/angular/angular/issues/35689)
* **language-service:** infer $implicit value for ngIf template contexts ([#35941](https://github.com/angular/angular/issues/35941)) ([f5e4410](https://github.com/angular/angular/commit/f5e4410))
* **ngcc:** a new LockFile implementation that uses a child-process ([#35934](https://github.com/angular/angular/issues/35934)) ([743ce7b](https://github.com/angular/angular/commit/743ce7b)), closes [#35761](https://github.com/angular/angular/issues/35761)
* **ngcc:** consistently delegate to TypeScript host for typing files ([#36089](https://github.com/angular/angular/issues/36089)) ([76d7188](https://github.com/angular/angular/commit/76d7188)), closes [#35078](https://github.com/angular/angular/issues/35078)
* **ngcc:** handle multiple original sources when flattening source-maps ([#36027](https://github.com/angular/angular/issues/36027)) ([e6167cf](https://github.com/angular/angular/commit/e6167cf))


### Performance Improvements

* **ngcc:** link segment markers for faster traversal ([#36027](https://github.com/angular/angular/issues/36027)) ([a0fa63b](https://github.com/angular/angular/commit/a0fa63b))
* **ngcc:** store the position of SegmentMarkers to avoid unnecessary computation ([#36027](https://github.com/angular/angular/issues/36027)) ([4ce9098](https://github.com/angular/angular/commit/4ce9098))
* **ngcc:** use binary search when flattening mappings ([#36027](https://github.com/angular/angular/issues/36027)) ([8768fc4](https://github.com/angular/angular/commit/8768fc4))
* **ngcc:** use line start positions for computing offsets in source-map flattening ([#36027](https://github.com/angular/angular/issues/36027)) ([daa2a08](https://github.com/angular/angular/commit/daa2a08))



<a name="9.0.6"></a>
## [9.0.6](https://github.com/angular/angular/compare/9.0.5...9.0.6) (2020-03-10)


### Bug Fixes

* **bazel:** do not use manifest paths for generated imports within compilation unit ([#35841](https://github.com/angular/angular/issues/35841)) ([5ea9a61](https://github.com/angular/angular/commit/5ea9a61))
* **compiler:** process `imports` first and `declarations` second while calculating scopes ([#35850](https://github.com/angular/angular/issues/35850)) ([6f2fd6e](https://github.com/angular/angular/commit/6f2fd6e)), closes [#35502](https://github.com/angular/angular/issues/35502)
* **core:** add `noSideEffects()` to `make*Decorator()` functions ([#35769](https://github.com/angular/angular/issues/35769)) ([#35846](https://github.com/angular/angular/issues/35846)) ([4fe3f37](https://github.com/angular/angular/commit/4fe3f37))
* **core:** add `noSideEffects()` to `ɵɵdefineComponent()` ([#35769](https://github.com/angular/angular/issues/35769)) ([#35846](https://github.com/angular/angular/issues/35846)) ([68ca32f](https://github.com/angular/angular/commit/68ca32f))
* **core:** remove side effects from `ɵɵgetInheritedFactory()` ([#35769](https://github.com/angular/angular/issues/35769)) ([#35846](https://github.com/angular/angular/issues/35846)) ([000c834](https://github.com/angular/angular/commit/000c834))
* **core:** remove side effects from `ɵɵNgOnChangesFeature()` ([#35769](https://github.com/angular/angular/issues/35769)) ([#35846](https://github.com/angular/angular/issues/35846)) ([d24ce21](https://github.com/angular/angular/commit/d24ce21))
* **core:** undecorated-classes-with-di migration should handle libraries generated with CLI versions past v6.2.0 ([#35824](https://github.com/angular/angular/issues/35824)) ([eaf5b58](https://github.com/angular/angular/commit/eaf5b58)), closes [#34985](https://github.com/angular/angular/issues/34985)
* **language-service:** resolve the variable from the template context first ([#35982](https://github.com/angular/angular/issues/35982)) ([f882ff0](https://github.com/angular/angular/commit/f882ff0))
* **localize:** improve matching and parsing of XLIFF 1.2 translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([677d666](https://github.com/angular/angular/commit/677d666))
* **localize:** improve matching and parsing of XLIFF 2.0 translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([689964b](https://github.com/angular/angular/commit/689964b))
* **localize:** improve matching and parsing of XTB translation files ([#35793](https://github.com/angular/angular/issues/35793)) ([9f68ff9](https://github.com/angular/angular/commit/9f68ff9))
* **localize:** merge translation from all  XLIFF `<file>` elements ([#35936](https://github.com/angular/angular/issues/35936)) ([83d7819](https://github.com/angular/angular/commit/83d7819)), closes [#35839](https://github.com/angular/angular/issues/35839)
* **platform-browser:** add missing peerDependency on `[@angular](https://github.com/angular)/animations` ([#35949](https://github.com/angular/angular/issues/35949)) ([db9704a](https://github.com/angular/angular/commit/db9704a)), closes [#35888](https://github.com/angular/angular/issues/35888)
* **router:** state data missing in routerLink ([#33203](https://github.com/angular/angular/issues/33203)) ([773d7b8](https://github.com/angular/angular/commit/773d7b8))


### Performance Improvements

* **ngcc:** reduce directory traversing ([#35756](https://github.com/angular/angular/issues/35756)) ([2eaf420](https://github.com/angular/angular/commit/2eaf420)), closes [#35717](https://github.com/angular/angular/issues/35717)


<a name="9.0.5"></a>
## [9.0.5](https://github.com/angular/angular/compare/9.0.4...9.0.5) (2020-03-04)


### Bug Fixes

* **animations:** allow computeStyle to work on elements created in Node ([#35810](https://github.com/angular/angular/issues/35810)) ([2b63b7f](https://github.com/angular/angular/commit/2b63b7f))
* **animations:** process shorthand `margin` and `padding` styles correctly ([#35701](https://github.com/angular/angular/issues/35701)) ([2e251b7](https://github.com/angular/angular/commit/2e251b7)), closes [#35463](https://github.com/angular/angular/issues/35463)
* **bazel:** ng_package rule creates incorrect UMD module exports ([#35792](https://github.com/angular/angular/issues/35792)) ([c272351](https://github.com/angular/angular/commit/c272351)), closes [angular/components#18652](https://github.com/angular/components/issues/18652)
* **compiler:** support i18n attributes on `<ng-template>` tags ([#35681](https://github.com/angular/angular/issues/35681)) ([d1966fc](https://github.com/angular/angular/commit/d1966fc))
* **compiler:** type-checking error for duplicate variables in templates ([#35674](https://github.com/angular/angular/issues/35674)) ([1207295](https://github.com/angular/angular/commit/1207295)), closes [#35186](https://github.com/angular/angular/issues/35186)
* **core:** allow null / undefined values in query results ([#35796](https://github.com/angular/angular/issues/35796)) ([120ce42](https://github.com/angular/angular/commit/120ce42)), closes [#35673](https://github.com/angular/angular/issues/35673)
* **core:** handle `<ng-template>` with local refs in i18n blocks ([#35758](https://github.com/angular/angular/issues/35758)) ([5a14a15](https://github.com/angular/angular/commit/5a14a15))
* **core:** log error instead of warning for unknown properties and elements ([#35798](https://github.com/angular/angular/issues/35798)) ([218e82e](https://github.com/angular/angular/commit/218e82e)), closes [#35699](https://github.com/angular/angular/issues/35699)
* **core:** Remove `debugger` statement ([#35763](https://github.com/angular/angular/issues/35763)) ([e201a84](https://github.com/angular/angular/commit/e201a84)), closes [#35470](https://github.com/angular/angular/issues/35470)
* **core:** Remove `debugger` statement when assert is thrown ([#35763](https://github.com/angular/angular/issues/35763)) ([d3ee052](https://github.com/angular/angular/commit/d3ee052)), closes [#35470](https://github.com/angular/angular/issues/35470)
* **core:** treat `[class]` and `[className]` as unrelated bindings ([#35668](https://github.com/angular/angular/issues/35668)) ([48025eb](https://github.com/angular/angular/commit/48025eb)), closes [#35577](https://github.com/angular/angular/issues/35577)
* **core:** unable to NgModuleRef.injector in module constructor ([#35731](https://github.com/angular/angular/issues/35731)) ([1980d69](https://github.com/angular/angular/commit/1980d69)), closes [#35677](https://github.com/angular/angular/issues/35677) [#35639](https://github.com/angular/angular/issues/35639)
* **core:** use proper configuration to compile Injectable in JIT ([#35706](https://github.com/angular/angular/issues/35706)) ([df0859f](https://github.com/angular/angular/commit/df0859f))
* **ivy:** narrow `NgIf` context variables in template type checker ([#35125](https://github.com/angular/angular/issues/35125)) ([fcad075](https://github.com/angular/angular/commit/fcad075)), closes [#34572](https://github.com/angular/angular/issues/34572)
* **ivy:** support dynamic query tokens in AOT mode ([#35307](https://github.com/angular/angular/issues/35307)) ([52fc087](https://github.com/angular/angular/commit/52fc087)), closes [#34267](https://github.com/angular/angular/issues/34267)


### Features

* **language-service:** modularize error messages ([#35678](https://github.com/angular/angular/issues/35678)) ([bcff873](https://github.com/angular/angular/commit/bcff873)), closes [#32663](https://github.com/angular/angular/issues/32663)


### Performance Improvements

* **core:** add micro benchmark for destroy hook invocation ([#35784](https://github.com/angular/angular/issues/35784)) ([a07917b](https://github.com/angular/angular/commit/a07917b))
* **core:** adding micro benchmark for host bindings ([#35705](https://github.com/angular/angular/issues/35705)) ([4ec7cd1](https://github.com/angular/angular/commit/4ec7cd1)), closes [#35568](https://github.com/angular/angular/issues/35568)
* **core:** use multiple directives in host bindings micro benchmark ([#35736](https://github.com/angular/angular/issues/35736)) ([e13fcba](https://github.com/angular/angular/commit/e13fcba))
* **ngcc:** only create tasks for non-processed formats ([#35719](https://github.com/angular/angular/issues/35719)) ([#35832](https://github.com/angular/angular/issues/35832)) ([3fdd304](https://github.com/angular/angular/commit/3fdd304))
* **ngcc:** spawn workers lazily ([#35719](https://github.com/angular/angular/issues/35719)) ([#35832](https://github.com/angular/angular/issues/35832)) ([525dc6a](https://github.com/angular/angular/commit/525dc6a)), closes [#35717](https://github.com/angular/angular/issues/35717)


<a name="9.0.4"></a>
## [9.0.4](https://github.com/angular/angular/compare/9.0.3...9.0.4) (2020-02-27)


### Bug Fixes

* **ngcc:** allow deep-import warnings to be ignored ([#35683](https://github.com/angular/angular/issues/35683)) ([9064f4e](https://github.com/angular/angular/commit/9064f4e)), closes [#35615](https://github.com/angular/angular/issues/35615)
* **ngcc:** handle mappings outside the content when flattening source-maps ([#35718](https://github.com/angular/angular/issues/35718)) ([bfe7657](https://github.com/angular/angular/commit/bfe7657)), closes [#35709](https://github.com/angular/angular/issues/35709)
* **ngcc:** handle missing sources when flattening source-maps ([#35718](https://github.com/angular/angular/issues/35718)) ([7ff845b](https://github.com/angular/angular/commit/7ff845b)), closes [#35709](https://github.com/angular/angular/issues/35709)


<a name="9.0.3"></a>
## [9.0.3](https://github.com/angular/angular/compare/9.0.2...9.0.3) (2020-02-27)


### Bug Fixes

* **animations:** false positive when detecting Node in Webpack builds ([#35134](https://github.com/angular/angular/issues/35134)) ([224aaae](https://github.com/angular/angular/commit/224aaae)), closes [#35117](https://github.com/angular/angular/issues/35117)
* **animations:** Remove ɵAnimationDriver from private exports ([#35690](https://github.com/angular/angular/issues/35690)) ([c2dbcd3](https://github.com/angular/angular/commit/c2dbcd3))
* **compiler:** use FatalDiagnosticError to generate better error messages ([#35244](https://github.com/angular/angular/issues/35244)) ([72664ca](https://github.com/angular/angular/commit/72664ca))
* **core:** make subclass inherit developer-defined data ([#35105](https://github.com/angular/angular/issues/35105)) ([f5e1faa](https://github.com/angular/angular/commit/f5e1faa))
* **core:** support sanitizer value in the [style] bindings ([#35564](https://github.com/angular/angular/issues/35564)) ([36dc1c7](https://github.com/angular/angular/commit/36dc1c7)), closes [#35476](https://github.com/angular/angular/issues/35476)
* **core:** Add `style="{{exp}}"` based interpolation ([#34202](https://github.com/angular/angular/issues/34202)) ([d63ba9c](https://github.com/angular/angular/commit/d63ba9c)), closes [#33575](https://github.com/angular/angular/issues/33575)
* **core:** add strictLiteralTypes to align core + VE checking of literals ([#35462](https://github.com/angular/angular/issues/35462)) ([628f957](https://github.com/angular/angular/commit/628f957))
* **core:** better inference for circularly referenced directive types ([#35622](https://github.com/angular/angular/issues/35622)) ([4c2bd64](https://github.com/angular/angular/commit/4c2bd64)), closes [#35372](https://github.com/angular/angular/issues/35372) [#35603](https://github.com/angular/angular/issues/35603) [#35522](https://github.com/angular/angular/issues/35522)
* **core:** emulate a View Engine type-checking bug with safe navigation ([#35462](https://github.com/angular/angular/issues/35462)) ([02599e4](https://github.com/angular/angular/commit/02599e4))
* **core:** error in AOT when pipe inherits constructor from injectable that uses DI ([#35468](https://github.com/angular/angular/issues/35468)) ([bb09cd0](https://github.com/angular/angular/commit/bb09cd0)), closes [#35277](https://github.com/angular/angular/issues/35277)
* **core:** error when accessing NgModuleRef.componentFactoryResolver in constructor ([#35637](https://github.com/angular/angular/issues/35637)) ([d690488](https://github.com/angular/angular/commit/d690488)), closes [#35580](https://github.com/angular/angular/issues/35580)
* **core:** incorrectly generating shared pure function between null and object literal ([#35481](https://github.com/angular/angular/issues/35481)) ([8a531e2](https://github.com/angular/angular/commit/8a531e2)), closes [#33705](https://github.com/angular/angular/issues/33705) [#35298](https://github.com/angular/angular/issues/35298)
* **core:** injecting incorrect provider when re-providing injectable with useClass ([#34574](https://github.com/angular/angular/issues/34574)) ([79aaaa3](https://github.com/angular/angular/commit/79aaaa3)), closes [#34110](https://github.com/angular/angular/issues/34110)
* **core:** provide a more detailed error message for NG6002/NG6003 ([#35620](https://github.com/angular/angular/issues/35620)) ([e6c416f](https://github.com/angular/angular/commit/e6c416f))
* **language-service:** get the right 'ElementAst' in the nested HTML tag ([#35317](https://github.com/angular/angular/issues/35317)) ([7403ba1](https://github.com/angular/angular/commit/7403ba1))
* **language-service:** infer context type of structural directives ([#35537](https://github.com/angular/angular/issues/35537)) ([#35561](https://github.com/angular/angular/issues/35561)) ([a491f7e](https://github.com/angular/angular/commit/a491f7e))
* **language-service:** provide hover for interpolation in attribute value ([#35494](https://github.com/angular/angular/issues/35494)) ([0700279](https://github.com/angular/angular/commit/0700279)), closes [PR#34847](https://github.com/PR/issues/34847)
* **localize:** improve placeholder mismatch error message ([#35593](https://github.com/angular/angular/issues/35593)) ([1112875](https://github.com/angular/angular/commit/1112875))
* **localize:** support minified ES5 `$localize` calls ([#35562](https://github.com/angular/angular/issues/35562)) ([bc7a8a8](https://github.com/angular/angular/commit/bc7a8a8)), closes [#35376](https://github.com/angular/angular/issues/35376)
* **ngcc:** add default config for `angular2-highcharts` ([#35527](https://github.com/angular/angular/issues/35527)) ([aebd662](https://github.com/angular/angular/commit/aebd662)), closes [#35399](https://github.com/angular/angular/issues/35399)
* **ngcc:** capture path-mapped entry-points that start with same string ([#35592](https://github.com/angular/angular/issues/35592)) ([d83f62d](https://github.com/angular/angular/commit/d83f62d)), closes [#35536](https://github.com/angular/angular/issues/35536)
* **ngcc:** correctly detect emitted TS helpers in ES5 ([#35191](https://github.com/angular/angular/issues/35191)) ([af4fe3a](https://github.com/angular/angular/commit/af4fe3a))
* **ngcc:** correctly detect outer aliased class identifiers in ES5 ([#35527](https://github.com/angular/angular/issues/35527)) ([39bd9a7](https://github.com/angular/angular/commit/39bd9a7)), closes [#35399](https://github.com/angular/angular/issues/35399)
* **ngcc:** handle imports in dts files when processing CommonJS ([#35191](https://github.com/angular/angular/issues/35191)) ([12e3db8](https://github.com/angular/angular/commit/12e3db8)), closes [#34356](https://github.com/angular/angular/issues/34356)
* **router:** removed unused ApplicationRef dependency ([#35642](https://github.com/angular/angular/issues/35642)) ([2f140f5](https://github.com/angular/angular/commit/2f140f5)), closes [/github.com/angular/angular/commit/5a849829c42330d7e88e83e916e6e36380c97a97#diff-c0baae5e1df628e1a217e8dc38557](https://github.com/angular/angular/commit/5a849829c42330d7e88e83e916e6e36380c97a97/issues/diff-c0baae5e1df628e1a217e8dc38557)
* **service-worker:** treat 503 as offline ([#35595](https://github.com/angular/angular/issues/35595)) ([64a415b](https://github.com/angular/angular/commit/64a415b)), closes [#35571](https://github.com/angular/angular/issues/35571)


### Features

* **ngcc:** implement source-map flattening ([#35132](https://github.com/angular/angular/issues/35132)) ([0a8e8cd](https://github.com/angular/angular/commit/0a8e8cd))
* **zone.js** add an tickOptions parameter with property processNewMacroTasksSynchronously. ([#33838](https://github.com/angular/angular/issues/33838)) ([7d2ea93](https://github.com/angular/angular/commit/7d2ea93)), closes [#33799](https://github.com/angular/angular/issues/33799)


### Performance Improvements

* **core:** avoid recursive scope recalculation when TestBed.overrideModule is used ([#35454](https://github.com/angular/angular/issues/35454)) ([349539e](https://github.com/angular/angular/commit/349539e))
* **core:** remove unused event argument in listener instructions ([#35097](https://github.com/angular/angular/issues/35097)) ([afc5b3e](https://github.com/angular/angular/commit/afc5b3e))



<a name="9.0.2"></a>
## [9.0.2](https://github.com/angular/angular/compare/9.0.1...9.0.2) (2020-02-19)


### Bug Fixes

* **core:** better handing of ICUs outside of i18n blocks ([#35347](https://github.com/angular/angular/issues/35347)) ([4fb5e21](https://github.com/angular/angular/commit/4fb5e21))
* **core:** correctly concatenate static and dynamic binding to `class` when shadowed ([#35350](https://github.com/angular/angular/issues/35350)) ([8220363](https://github.com/angular/angular/commit/8220363)), closes [#35335](https://github.com/angular/angular/issues/35335)
* **core:** remove support for `Map`/`Set` in `[class]`/`[style]` bindings ([#35392](https://github.com/angular/angular/issues/35392)) ([1797390](https://github.com/angular/angular/commit/1797390))
* **ivy:** `LFrame` needs to release memory on `leaveView()` ([#35156](https://github.com/angular/angular/issues/35156)) ([4b1dcaf](https://github.com/angular/angular/commit/4b1dcaf)), closes [#35148](https://github.com/angular/angular/issues/35148)
* **ivy:** add attributes and classes to host elements based on selector ([#34481](https://github.com/angular/angular/issues/34481)) ([03a8b16](https://github.com/angular/angular/commit/03a8b16))
* **ivy:** error if directive with synthetic property binding is on same node as directive that injects ViewContainerRef ([#35343](https://github.com/angular/angular/issues/35343)) ([a30fd29](https://github.com/angular/angular/commit/a30fd29)), closes [#35342](https://github.com/angular/angular/issues/35342)
* **ivy:** queries should match elements inside ng-container with the descendants: false option ([#35384](https://github.com/angular/angular/issues/35384)) ([fd4ce84](https://github.com/angular/angular/commit/fd4ce84)), closes [#34768](https://github.com/angular/angular/issues/34768)
* **ivy:** wrong context passed to ngOnDestroy when resolved multiple times ([#35249](https://github.com/angular/angular/issues/35249)) ([0671e54](https://github.com/angular/angular/commit/0671e54)), closes [#35167](https://github.com/angular/angular/issues/35167)



<a name="9.0.1"></a>
## [9.0.1](https://github.com/angular/angular/compare/9.0.0...9.0.1) (2020-02-12)


### Bug Fixes

* **bazel:** devserver shows blank page in Windows ([#35159](https://github.com/angular/angular/issues/35159)) ([727f92f](https://github.com/angular/angular/commit/727f92f))
* **bazel:** spawn prod server using port 4200 ([#35160](https://github.com/angular/angular/issues/35160)) ([829f506](https://github.com/angular/angular/commit/829f506))
* **bazel:** update ibazel to 0.11.1 ([#35158](https://github.com/angular/angular/issues/35158)) ([4e6d237](https://github.com/angular/angular/commit/4e6d237))
* **compiler:** report errors for missing binding names ([#34595](https://github.com/angular/angular/issues/34595)) ([d13cab7](https://github.com/angular/angular/commit/d13cab7))
* **elements:** schematics fail with schema.json not found error ([#35211](https://github.com/angular/angular/issues/35211)) ([94d002b](https://github.com/angular/angular/commit/94d002b)), closes [#35154](https://github.com/angular/angular/issues/35154)
* **forms:** change Array.reduce usage to Array.forEach ([#35349](https://github.com/angular/angular/issues/35349)) ([554c2cb](https://github.com/angular/angular/commit/554c2cb))
* **ivy:** ensure module imports are instantiated before the module being declared ([#35172](https://github.com/angular/angular/issues/35172)) ([b6a3a73](https://github.com/angular/angular/commit/b6a3a73))
* **ivy:** repeat template guards to narrow types in event handlers ([#35193](https://github.com/angular/angular/issues/35193)) ([dea1b96](https://github.com/angular/angular/commit/dea1b96)), closes [#35073](https://github.com/angular/angular/issues/35073)
* **ivy:** set namespace for host elements of dynamically created components ([#35136](https://github.com/angular/angular/issues/35136)) ([480a4c3](https://github.com/angular/angular/commit/480a4c3))
* **language-service:** Suggest ? and ! operator on nullable receiver ([#35200](https://github.com/angular/angular/issues/35200)) ([3cc24a9](https://github.com/angular/angular/commit/3cc24a9))
* **ngcc:** ensure that path-mapped secondary entry-points are processed correctly ([#35227](https://github.com/angular/angular/issues/35227)) ([c3c1140](https://github.com/angular/angular/commit/c3c1140)), closes [#35188](https://github.com/angular/angular/issues/35188)



<a name="9.0.0"></a>
# [9.0.0](https://github.com/angular/angular/compare/8.2.14...9.0.0) (2020-02-06)

[Blog post "Version 9 of Angular Now Available — Project Ivy has arrived!"](https://blog.angular.io/version-9-of-angular-now-available-project-ivy-has-arrived-23c97b63cfa3).


### Release Highlights & Update instructions
To learn about the release highlights and our CLI-powered automated update workflow for your projects please check out the [v9 release announcement](https://blog.angular.io/version-9-of-angular-now-available-project-ivy-has-arrived-23c97b63cfa3).


#### Dependency updates
@angular/core now requires:
- RxJS 6.5

@angular/compiler-cli now requires:
- TypeScript 3.6 or 3.7


### Bug Fixes

* **benchpress:** formatted spec files ([#35127](https://github.com/angular/angular/issues/35127)) ([63868df](https://github.com/angular/angular/commit/63868df))
* **ivy:** recompile on template change in ngc watch mode on Windows ([#34015](https://github.com/angular/angular/issues/34015)) ([a5c9cd7](https://github.com/angular/angular/commit/a5c9cd7)), closes [#32869](https://github.com/angular/angular/issues/32869)
* **ivy:** support emitting a reference to interface declarations ([#34849](https://github.com/angular/angular/issues/34849)) ([ad9ec52](https://github.com/angular/angular/commit/ad9ec52)), closes [#34021](https://github.com/angular/angular/issues/34021) [#34837](https://github.com/angular/angular/issues/34837)
* **ivy:** template type-check errors from TS should not use NG error codes ([#35146](https://github.com/angular/angular/issues/35146)) ([cf3071f](https://github.com/angular/angular/commit/cf3071f))
* **ivy:** host-styling throws assert exception inside *ngFor ([#35133](https://github.com/angular/angular/issues/35133)) ([31e9873](https://github.com/angular/angular/commit/31e9873)), closes [#35118](https://github.com/angular/angular/issues/35118)
* **ngcc:** correctly invalidate cache when moving/removing files/directories ([#35106](https://github.com/angular/angular/issues/35106)) ([22357d4](https://github.com/angular/angular/commit/22357d4)), closes [/github.com/angular/angular/blob/4d36b2f6e/packages/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies.ts#L54](https://github.com/angular/angular/blob/4d36b2f6e/packages/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies.ts/issues/L54) [/github.com/angular/angular/blob/4d36b2f6e/packages/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies.ts#L61](https://github.com/angular/angular/blob/4d36b2f6e/packages/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies.ts/issues/L61) [#35095](https://github.com/angular/angular/issues/35095)
* **ngcc:** do not lock if the target is not compiled by Angular ([#35057](https://github.com/angular/angular/issues/35057)) ([c30c518](https://github.com/angular/angular/commit/c30c518)), closes [#35000](https://github.com/angular/angular/issues/35000)
* **compiler-cli:** add `sass` as a valid css preprocessor extension ([#35052](https://github.com/angular/angular/issues/35052)) ([7f96fbb](https://github.com/angular/angular/commit/7f96fbb))
* should also allow subclass Promise without Symbol.species ([#34533](https://github.com/angular/angular/issues/34533)) ([0de632a](https://github.com/angular/angular/commit/0de632a))
* **common:** http/testing expectOne lists the received requests if no matches ([#27005](https://github.com/angular/angular/issues/27005)) ([c7f0c01](https://github.com/angular/angular/commit/c7f0c01)), closes [#18013](https://github.com/angular/angular/issues/18013)
* **common:** remove extra & in http params ([#34896](https://github.com/angular/angular/issues/34896)) ([bd8605a](https://github.com/angular/angular/commit/bd8605a))
* **ivy:** catch FatalDiagnosticError thrown from preanalysis phase ([#34801](https://github.com/angular/angular/issues/34801)) ([c0e73e0](https://github.com/angular/angular/commit/c0e73e0))
* **ivy:** ensure `DebugNode`/`DebugElement` are tree-shakeable in Ivy ([#35003](https://github.com/angular/angular/issues/35003)) ([23c0147](https://github.com/angular/angular/commit/23c0147)), closes [#30130](https://github.com/angular/angular/issues/30130)
* **ivy:** ensure multi providers in ModuleWithProviders are not duplicated ([#34914](https://github.com/angular/angular/issues/34914)) ([4975f89](https://github.com/angular/angular/commit/4975f89))
* **ivy:** update ViewContainerRef to get the correct parentInjector ([#35013](https://github.com/angular/angular/issues/35013)) ([eaa4a5a](https://github.com/angular/angular/commit/eaa4a5a))
* **language-service:** prune duplicate returned definitions ([#34995](https://github.com/angular/angular/issues/34995)) ([71f5417](https://github.com/angular/angular/commit/71f5417)), closes [/github.com/angular/angular/pull/34847#discussion_r371006680](https://github.com/angular/angular/pull/34847/issues/discussion_r371006680)
* **language-service:** remove repeated symbol definitions for structural directive ([#34847](https://github.com/angular/angular/issues/34847)) ([35916d3](https://github.com/angular/angular/commit/35916d3))
* **language-service:** warn, not error, on missing context members ([#35036](https://github.com/angular/angular/issues/35036)) ([0e76821](https://github.com/angular/angular/commit/0e76821))
* **localize:** re-enable filename in code-frame error messages ([#34994](https://github.com/angular/angular/issues/34994)) ([c7c7b20](https://github.com/angular/angular/commit/c7c7b20)), closes [/github.com/angular/angular/pull/34974/files#r371034476](https://github.com/angular/angular/pull/34974/files/issues/r371034476)
* **ngcc:** improve lockfile error message ([#35001](https://github.com/angular/angular/issues/35001)) ([1d31c81](https://github.com/angular/angular/commit/1d31c81)), closes [#35000](https://github.com/angular/angular/issues/35000)
* **ivy:** correctly emit component when it's removed from its module ([#34912](https://github.com/angular/angular/issues/34912)) ([adc663e](https://github.com/angular/angular/commit/adc663e)), closes [#34813](https://github.com/angular/angular/issues/34813)
* **ivy:** DebugNode.classes not working on SVG elements ([#34872](https://github.com/angular/angular/issues/34872)) ([7e8aac1](https://github.com/angular/angular/commit/7e8aac1)), closes [#34868](https://github.com/angular/angular/issues/34868)
* **ivy:** disable use of aliasing in template type-checking ([#34649](https://github.com/angular/angular/issues/34649)) ([2cf7d0f](https://github.com/angular/angular/commit/2cf7d0f))
* **ivy:** don't detect changes on detached child embedded views ([#34846](https://github.com/angular/angular/issues/34846)) ([62e1186](https://github.com/angular/angular/commit/62e1186)), closes [#34816](https://github.com/angular/angular/issues/34816)
* **ivy:** ensure eventListeners added outside angular context are not called... ([#34514](https://github.com/angular/angular/issues/34514)) ([b6dfb4d](https://github.com/angular/angular/commit/b6dfb4d))
* **ivy:** type-check multiple bindings to the same input ([#34649](https://github.com/angular/angular/issues/34649)) ([ba7f2f1](https://github.com/angular/angular/commit/ba7f2f1))
* **ivy:** type-checking of properties which map to multiple fields ([#34649](https://github.com/angular/angular/issues/34649)) ([b04d4ba](https://github.com/angular/angular/commit/b04d4ba))
* **ivy:** use any for generic context checks when !strictTemplates ([#34649](https://github.com/angular/angular/issues/34649)) ([e69d02c](https://github.com/angular/angular/commit/e69d02c))
* **ivy:** wrap 'as any' casts in parentheses when needed ([#34649](https://github.com/angular/angular/issues/34649)) ([bf01b66](https://github.com/angular/angular/commit/bf01b66))
* **language-service:** Diagnostic span should point to class name ([#34932](https://github.com/angular/angular/issues/34932)) ([c9db7bd](https://github.com/angular/angular/commit/c9db7bd))
* **language-service:** Make metadata in Declaration non-optional ([#34936](https://github.com/angular/angular/issues/34936)) ([37727ce](https://github.com/angular/angular/commit/37727ce))
* **language-service:** rename getDiagnostics to getSemanticDiagnostics ([#34909](https://github.com/angular/angular/issues/34909)) ([20dc436](https://github.com/angular/angular/commit/20dc436))
* **ngcc:** do not attempt compilation when analysis fails ([#34889](https://github.com/angular/angular/issues/34889)) ([080a8bf](https://github.com/angular/angular/commit/080a8bf)), closes [#34288](https://github.com/angular/angular/issues/34288) [#34500](https://github.com/angular/angular/issues/34500)
* **ngcc:** do not collect private declarations from external packages ([#34811](https://github.com/angular/angular/issues/34811)) ([c80392b](https://github.com/angular/angular/commit/c80392b)), closes [#34544](https://github.com/angular/angular/issues/34544) [#34544](https://github.com/angular/angular/issues/34544)
* **ngcc:** libraries using spread in object literals cannot be processed ([#34661](https://github.com/angular/angular/issues/34661)) ([4eeb6cf](https://github.com/angular/angular/commit/4eeb6cf))
* **ngcc:** only lock ngcc after targeted entry-point check ([#34722](https://github.com/angular/angular/issues/34722)) ([3897fb9](https://github.com/angular/angular/commit/3897fb9))
* **ngcc:** update `package.json` deterministically ([#34870](https://github.com/angular/angular/issues/34870)) ([a10d2a8](https://github.com/angular/angular/commit/a10d2a8)), closes [#34635](https://github.com/angular/angular/issues/34635)
* **common:** expose getLocaleCurrencyCode publicly ([#34946](https://github.com/angular/angular/issues/34946)) ([622737c](https://github.com/angular/angular/commit/622737c))
* **compiler-cli:** require node 10 as runtime engine ([#34722](https://github.com/angular/angular/issues/34722)) ([7b77b3d](https://github.com/angular/angular/commit/7b77b3d))
* **language-service:** specific suggestions for template context diags ([#34751](https://github.com/angular/angular/issues/34751)) ([cc7fca4](https://github.com/angular/angular/commit/cc7fca4))
* **language-service:** support multiple symbol definitions ([#34782](https://github.com/angular/angular/issues/34782)) ([2f2396c](https://github.com/angular/angular/commit/2f2396c))
* **ngcc:** lock ngcc when processing ([#34722](https://github.com/angular/angular/issues/34722)) ([6dd51f1](https://github.com/angular/angular/commit/6dd51f1)), closes [/github.com/angular/angular/issues/32431#issuecomment-571825781](https://github.com/angular/angular/issues/32431/issues/issuecomment-571825781)
* work around 'noImplicityAny' incompatibility due to ts3.7 update ([#34798](https://github.com/angular/angular/issues/34798)) ([251d548](https://github.com/angular/angular/commit/251d548))
* **animations:** not waiting for child animations to finish when removing parent in Ivy ([#34702](https://github.com/angular/angular/issues/34702)) ([92c17fe](https://github.com/angular/angular/commit/92c17fe)), closes [#33597](https://github.com/angular/angular/issues/33597)
* **common:** ensure diffing in ngStyle/ngClass correctly emits value changes ([#34307](https://github.com/angular/angular/issues/34307)) ([93a035f](https://github.com/angular/angular/commit/93a035f)), closes [#34336](https://github.com/angular/angular/issues/34336) [#34444](https://github.com/angular/angular/issues/34444)
* **ivy:** ensure that `LOCALE_ID` is set after app initializers ([#34830](https://github.com/angular/angular/issues/34830)) ([7643913](https://github.com/angular/angular/commit/7643913)), closes [#34701](https://github.com/angular/angular/issues/34701)
* **ivy:** more accurate detection of pipes in host bindings ([#34655](https://github.com/angular/angular/issues/34655)) ([da69335](https://github.com/angular/angular/commit/da69335))
* **ngcc:** do not add DTS deep imports to missing packages list ([#34695](https://github.com/angular/angular/issues/34695)) ([32d4d97](https://github.com/angular/angular/commit/32d4d97)), closes [#34720](https://github.com/angular/angular/issues/34720)
* **forms:** accept number length in length validators ([#32057](https://github.com/angular/angular/issues/32057)) ([3113bb7](https://github.com/angular/angular/commit/3113bb7))
* **forms:** disabled input acceptance member not properly applied ([#34502](https://github.com/angular/angular/issues/34502)) ([cbb175f](https://github.com/angular/angular/commit/cbb175f))
* **ivy:** do not reset view dirty state in check no changes mode ([#34495](https://github.com/angular/angular/issues/34495)) ([8ef1c60](https://github.com/angular/angular/commit/8ef1c60))
* **ivy:** don't run decorator handlers against declaration files ([#34557](https://github.com/angular/angular/issues/34557)) ([08c2581](https://github.com/angular/angular/commit/08c2581)), closes [#33264](https://github.com/angular/angular/issues/33264)
* **ivy:** handle overloaded constructors in ngtsc ([#34590](https://github.com/angular/angular/issues/34590)) ([a7ca658](https://github.com/angular/angular/commit/a7ca658))
* **ivy:** ngClass not applying classes with trailing/leading spaces ([#34539](https://github.com/angular/angular/issues/34539)) ([98ed7c6](https://github.com/angular/angular/commit/98ed7c6)), closes [#34476](https://github.com/angular/angular/issues/34476)
* **ivy:** Prevent errors when querying DebugElement roots that were outside angular context ([#34687](https://github.com/angular/angular/issues/34687)) ([f1cdb8f](https://github.com/angular/angular/commit/f1cdb8f))
* **ivy:** properly bootstrap components with attribute selectors ([#34450](https://github.com/angular/angular/issues/34450)) ([2c0b9ea](https://github.com/angular/angular/commit/2c0b9ea)), closes [#34349](https://github.com/angular/angular/issues/34349)
* **ivy:** warn instead of throwing for unknown elements ([#34524](https://github.com/angular/angular/issues/34524)) ([d9ae70e](https://github.com/angular/angular/commit/d9ae70e)), closes [/github.com/angular/angular/pull/33419#discussion_r339296216](https://github.com/angular/angular/pull/33419/issues/discussion_r339296216)
* **language-service:** apply suggested change. ([#34564](https://github.com/angular/angular/issues/34564)) ([b3af220](https://github.com/angular/angular/commit/b3af220))
* **language-service:** break the hover/definitions for two-way binding ([#34564](https://github.com/angular/angular/issues/34564)) ([eb5c20c](https://github.com/angular/angular/commit/eb5c20c))
* **language-service:** CRLF offset in inline template ([#34737](https://github.com/angular/angular/issues/34737)) ([80315b5](https://github.com/angular/angular/commit/80315b5))
* **language-service:** do not use an i18n parser for templates ([#34531](https://github.com/angular/angular/issues/34531)) ([cb7dcb3](https://github.com/angular/angular/commit/cb7dcb3))
* **language-service:** only visit directives ([#34564](https://github.com/angular/angular/issues/34564)) ([76d7aa7](https://github.com/angular/angular/commit/76d7aa7))
* **ngcc:** avoid error due to circular dependency in `EsmDependencyHost` ([#34512](https://github.com/angular/angular/issues/34512)) ([7c3172a](https://github.com/angular/angular/commit/7c3172a)), closes [/github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/utils.ts#L10](https://github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/utils.ts/issues/L10) [/github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/dependencies/esm_dependency_host.ts#L10](https://github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/dependencies/esm_dependency_host.ts/issues/L10) [/github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/dependencies/dependency_host.ts#L9](https://github.com/angular/angular/blob/18d89c9c8/packages/compiler-cli/ngcc/src/dependencies/dependency_host.ts/issues/L9)
* **ngcc:** correctly detect dependencies in CommonJS ([#34528](https://github.com/angular/angular/issues/34528)) ([ff02ddf](https://github.com/angular/angular/commit/ff02ddf))
* **ngcc:** correctly handle inline exports in UMD ([#34512](https://github.com/angular/angular/issues/34512)) ([7bbfccf](https://github.com/angular/angular/commit/7bbfccf))
* **ngcc:** don't crash if symbol has no declarations ([#34658](https://github.com/angular/angular/issues/34658)) ([4def99e](https://github.com/angular/angular/commit/4def99e)), closes [/github.com/angular/angular/blob/8d0de89e/packages/compiler-cli/src/ngtsc/reflection/src/typescript.ts#L309](https://github.com/angular/angular/blob/8d0de89e/packages/compiler-cli/src/ngtsc/reflection/src/typescript.ts/issues/L309) [#34560](https://github.com/angular/angular/issues/34560)
* **ngcc:** handle UMD factories that do not use all params ([#34660](https://github.com/angular/angular/issues/34660)) ([83868be](https://github.com/angular/angular/commit/83868be)), closes [#34653](https://github.com/angular/angular/issues/34653)
* **ngcc:** insert definitions after statement ([#34677](https://github.com/angular/angular/issues/34677)) ([f295240](https://github.com/angular/angular/commit/f295240)), closes [#34648](https://github.com/angular/angular/issues/34648)
* **ngcc:** recognize re-exports with `require()` calls in UMD ([#34512](https://github.com/angular/angular/issues/34512)) ([79be354](https://github.com/angular/angular/commit/79be354)), closes [/github.com/angular/angular/pull/34254/files#r359515373](https://github.com/angular/angular/pull/34254/files/issues/r359515373)
* **ngcc:** recognize re-exports with imported TS helpers in CommonJS and UMD ([#34527](https://github.com/angular/angular/issues/34527)) ([a88dc17](https://github.com/angular/angular/commit/a88dc17))
* **common:** remove trailing whitespace for CurrencyPipe ([#34642](https://github.com/angular/angular/issues/34642)) ([c42b90b](https://github.com/angular/angular/commit/c42b90b)), closes [#34641](https://github.com/angular/angular/issues/34641)
* **ivy:** append `advance` instructions before `i18nExp` ([#34436](https://github.com/angular/angular/issues/34436)) ([ba4c31c](https://github.com/angular/angular/commit/ba4c31c))
* **ivy:** correctly associate output bound events with directives ([#34479](https://github.com/angular/angular/issues/34479)) ([fde5067](https://github.com/angular/angular/commit/fde5067))
* **ivy:** Ensure ngProjectAs marker name appears at even attribute index ([#34617](https://github.com/angular/angular/issues/34617)) ([4f3215d](https://github.com/angular/angular/commit/4f3215d))
* **ivy:** skip field inheritance if InheritDefinitionFeature is present on parent def ([#34244](https://github.com/angular/angular/issues/34244)) ([22533fb](https://github.com/angular/angular/commit/22533fb))
* **ivy:** TestBed not unwrapping imports array function when overriding provider ([#34629](https://github.com/angular/angular/issues/34629)) ([963ed71](https://github.com/angular/angular/commit/963ed71)), closes [#34623](https://github.com/angular/angular/issues/34623)
* **language-service:** completions after "let x of |" in ngFor ([#34473](https://github.com/angular/angular/issues/34473)) ([ca8b584](https://github.com/angular/angular/commit/ca8b584))
* **language-service:** correctly parse expressions in an attribute ([#34517](https://github.com/angular/angular/issues/34517)) ([7a0d6e7](https://github.com/angular/angular/commit/7a0d6e7))
* **language-service:** The pipe method should not include parentheses ([#34485](https://github.com/angular/angular/issues/34485)) ([2845596](https://github.com/angular/angular/commit/2845596))
* **ngcc:** capture entry-point dependencies from typings as well as source ([#34494](https://github.com/angular/angular/issues/34494)) ([c692757](https://github.com/angular/angular/commit/c692757)), closes [#34411](https://github.com/angular/angular/issues/34411)
* **ngcc:** do not add trailing commas in UMD imports ([#34545](https://github.com/angular/angular/issues/34545)) ([e6850a3](https://github.com/angular/angular/commit/e6850a3)), closes [#34353](https://github.com/angular/angular/issues/34353) [#34525](https://github.com/angular/angular/issues/34525)
* **animations:** leaking detached nodes when parent has a leave transition ([#34409](https://github.com/angular/angular/issues/34409)) ([6607fb4](https://github.com/angular/angular/commit/6607fb4)), closes [#25744](https://github.com/angular/angular/issues/25744)
* **common:** ngStyle should ignore undefined values ([#34422](https://github.com/angular/angular/issues/34422)) ([ee1eebd](https://github.com/angular/angular/commit/ee1eebd)), closes [#34310](https://github.com/angular/angular/issues/34310)
* **ivy:** avoid duplicate errors in safe navigations and template guards ([#34417](https://github.com/angular/angular/issues/34417)) ([d6edeab](https://github.com/angular/angular/commit/d6edeab))
* **ivy:** avoid using __proto__ when reading metadata in JIT mode ([#34305](https://github.com/angular/angular/issues/34305)) ([08ce026](https://github.com/angular/angular/commit/08ce026))
* **ivy:** don't produce template diagnostics when scope is invalid ([#34460](https://github.com/angular/angular/issues/34460)) ([c1fd629](https://github.com/angular/angular/commit/c1fd629)), closes [#33849](https://github.com/angular/angular/issues/33849)
* **ivy:** generate a better error for template var writes ([#34339](https://github.com/angular/angular/issues/34339)) ([418d586](https://github.com/angular/angular/commit/418d586)), closes [#33674](https://github.com/angular/angular/issues/33674)
* **ivy:** i18n - remove `translate` function when clearing translations ([#34346](https://github.com/angular/angular/issues/34346)) ([1489e5e](https://github.com/angular/angular/commit/1489e5e)), closes [#32781](https://github.com/angular/angular/issues/32781)
* **ivy:** i18n instructions thrown off by sanitizer in IE11 ([#34305](https://github.com/angular/angular/issues/34305)) ([bed62b1](https://github.com/angular/angular/commit/bed62b1))
* **ivy:** improve ExpressionChangedAfterChecked error ([#34381](https://github.com/angular/angular/issues/34381)) ([7ea3984](https://github.com/angular/angular/commit/7ea3984))
* **ivy:** inconsistent attribute casing in DebugNode.attributes on IE ([#34305](https://github.com/angular/angular/issues/34305)) ([9bff8e7](https://github.com/angular/angular/commit/9bff8e7))
* **ivy:** incorrect injectable name logged in warning message on IE ([#34305](https://github.com/angular/angular/issues/34305)) ([60d1d5e](https://github.com/angular/angular/commit/60d1d5e))
* **ivy:** inheritance in JIT mode not working correctly on IE10 ([#34305](https://github.com/angular/angular/issues/34305)) ([65fb2fd](https://github.com/angular/angular/commit/65fb2fd))
* **ivy:** inheriting injectable definition from undecorated class not working on IE10 in JIT mode ([#34305](https://github.com/angular/angular/issues/34305)) ([d83599d](https://github.com/angular/angular/commit/d83599d))
* **ivy:** record correct absolute source span for ngForOf expressions ([#31813](https://github.com/angular/angular/issues/31813)) ([931cb5e](https://github.com/angular/angular/commit/931cb5e))
* **ivy:** reorder provider type checks to align with VE ([#34433](https://github.com/angular/angular/issues/34433)) ([7916b1e](https://github.com/angular/angular/commit/7916b1e))
* **ivy:** unknown property and element checks not working correctly in IE ([#34305](https://github.com/angular/angular/issues/34305)) ([0ff54f2](https://github.com/angular/angular/commit/0ff54f2))
* **ivy:** validate the NgModule declarations field ([#34404](https://github.com/angular/angular/issues/34404)) ([03e236a](https://github.com/angular/angular/commit/03e236a))
* **language-service:** HTML path should include last node before cursor ([#34440](https://github.com/angular/angular/issues/34440)) ([76e4870](https://github.com/angular/angular/commit/76e4870))
* **language-service:** Proper completions for properties and events ([#34445](https://github.com/angular/angular/issues/34445)) ([4e41bf9](https://github.com/angular/angular/commit/4e41bf9))
* **language-service:** Remove completions for let and of in ngFor ([#34434](https://github.com/angular/angular/issues/34434)) ([ab61480](https://github.com/angular/angular/commit/ab61480))
* **ngcc:** correctly match aliased classes between src and dts files ([#34254](https://github.com/angular/angular/issues/34254)) ([4bffb6b](https://github.com/angular/angular/commit/4bffb6b)), closes [#33593](https://github.com/angular/angular/issues/33593)
* **ngcc:** handle CommonJS re-exports by reference ([#34254](https://github.com/angular/angular/issues/34254)) ([9ca5faa](https://github.com/angular/angular/commit/9ca5faa))
* **ngcc:** handle imports in dts files when processing UMD ([#34356](https://github.com/angular/angular/issues/34356)) ([81c75cf](https://github.com/angular/angular/commit/81c75cf))
* **ngcc:** handle UMD re-exports ([#34254](https://github.com/angular/angular/issues/34254)) ([84a7d8a](https://github.com/angular/angular/commit/84a7d8a))
* **ngcc:** render UMD imports even if no prior imports ([#34353](https://github.com/angular/angular/issues/34353)) ([c26738d](https://github.com/angular/angular/commit/c26738d)), closes [#34138](https://github.com/angular/angular/issues/34138)
* **ngcc:** use the correct identifiers when updating typings files ([#34254](https://github.com/angular/angular/issues/34254)) ([c0c2ab3](https://github.com/angular/angular/commit/c0c2ab3))
* **bazel:** improve performance of tsHost.writeFile() ([#34331](https://github.com/angular/angular/issues/34331)) ([d7c459a](https://github.com/angular/angular/commit/d7c459a))
* **common:** update closure locales to include directionality data ([#34240](https://github.com/angular/angular/issues/34240)) ([a02bde7](https://github.com/angular/angular/commit/a02bde7))
* **compiler:** ensure localized strings are ES5 compatible for JIT mode ([#34265](https://github.com/angular/angular/issues/34265)) ([26dba21](https://github.com/angular/angular/commit/26dba21)), closes [#34246](https://github.com/angular/angular/issues/34246)
* **compiler:** switch to modern diagnostic formatting ([#34234](https://github.com/angular/angular/issues/34234)) ([60051eb](https://github.com/angular/angular/commit/60051eb))
* **compiler-cli:** allow declaration-only template type check members ([#34296](https://github.com/angular/angular/issues/34296)) ([bbb9412](https://github.com/angular/angular/commit/bbb9412))
* **ivy:** add flag to skip non-exported classes ([#33921](https://github.com/angular/angular/issues/33921)) ([#34340](https://github.com/angular/angular/issues/34340)) ([7ed984b](https://github.com/angular/angular/commit/7ed984b)), closes [#33724](https://github.com/angular/angular/issues/33724)
* **ivy:** align TestBed.overrideProvider with what happens with providers in TestBed providers array ([#33769](https://github.com/angular/angular/issues/33769)) ([10a33ef](https://github.com/angular/angular/commit/10a33ef))
* **ivy:** do not invoke change detection for destroyed views ([#34241](https://github.com/angular/angular/issues/34241)) ([24bbcaf](https://github.com/angular/angular/commit/24bbcaf))
* **ivy:** handle SafeStyles in [style.prop] correctly ([#34286](https://github.com/angular/angular/issues/34286)) ([b0d5784](https://github.com/angular/angular/commit/b0d5784)), closes [/github.com/angular/angular/blob/master/packages/core/src/render3/styling/bindings.ts#L620](https://github.com/angular/angular/blob/master/packages/core/src/render3/styling/bindings.ts/issues/L620)
* **ivy:** inherit static coercion members from base classes ([#34296](https://github.com/angular/angular/issues/34296)) ([edfaab6](https://github.com/angular/angular/commit/edfaab6)), closes [#33830](https://github.com/angular/angular/issues/33830)
* **ivy:** properly parenthesize ternary expressions when emitted ([#34221](https://github.com/angular/angular/issues/34221)) ([af36bc6](https://github.com/angular/angular/commit/af36bc6)), closes [#34087](https://github.com/angular/angular/issues/34087)
* **ivy:** throw a better error when DI can't inject a ctor param ([#33739](https://github.com/angular/angular/issues/33739)) ([#34340](https://github.com/angular/angular/issues/34340)) ([676aca1](https://github.com/angular/angular/commit/676aca1)), closes [#33637](https://github.com/angular/angular/issues/33637)
* **language-service:** bug of accessing a string index signature using dot notation ([#34177](https://github.com/angular/angular/issues/34177)) ([72a5a8c](https://github.com/angular/angular/commit/72a5a8c))
* **language-service:** Remove getExternalFiles() ([#34260](https://github.com/angular/angular/issues/34260)) ([0e911f8](https://github.com/angular/angular/commit/0e911f8))
* **language-service:** return the js primitive type name ([#34177](https://github.com/angular/angular/issues/34177)) ([b4680a6](https://github.com/angular/angular/commit/b4680a6))
* **language-service:** Simplify resolution logic in banner ([#34262](https://github.com/angular/angular/issues/34262)) ([7dfd327](https://github.com/angular/angular/commit/7dfd327))
* **ngcc:** ensure that bundle `rootDir` is the package path ([#34212](https://github.com/angular/angular/issues/34212)) ([69dd516](https://github.com/angular/angular/commit/69dd516))
* **ngcc:** fix undecorated child migration when `exportAs` is present ([#34014](https://github.com/angular/angular/issues/34014)) ([24d1f9e](https://github.com/angular/angular/commit/24d1f9e))
* **ngcc:** log Angular error codes correctly ([#34014](https://github.com/angular/angular/issues/34014)) ([3cd43c1](https://github.com/angular/angular/commit/3cd43c1))
* **ngcc:** report diagnostics from migrations ([#34014](https://github.com/angular/angular/issues/34014)) ([599dcd0](https://github.com/angular/angular/commit/599dcd0))
* **bazel:** don't rely on [@angular](https://github.com/angular)/core being as a depedency to install [@angular](https://github.com/angular)/bazel ([#34181](https://github.com/angular/angular/issues/34181)) ([716fc84](https://github.com/angular/angular/commit/716fc84)), closes [#34164](https://github.com/angular/angular/issues/34164)
* **bazel:** reenable template type checking in ng_module ([#34144](https://github.com/angular/angular/issues/34144)) ([572e731](https://github.com/angular/angular/commit/572e731)), closes [/github.com/angular/angular/blob/168abc6d6f52713383411b14980e104c99bfeef5/packages/compiler-cli/src/ngtsc/program.ts#L430-L434](https://github.com/angular/angular/blob/168abc6d6f52713383411b14980e104c99bfeef5/packages/compiler-cli/src/ngtsc/program.ts/issues/L430-L434)
* **common:** reflect input type in NgForOf context ([#33997](https://github.com/angular/angular/issues/33997)) ([b640d38](https://github.com/angular/angular/commit/b640d38))
* **common:** reflect input type in NgIf context ([#33997](https://github.com/angular/angular/issues/33997)) ([7504543](https://github.com/angular/angular/commit/7504543)), closes [#31556](https://github.com/angular/angular/issues/31556)
* **compiler:** i18n - trim whitespace from i18n custom ids ([#34154](https://github.com/angular/angular/issues/34154)) ([64317c6](https://github.com/angular/angular/commit/64317c6)), closes [#34147](https://github.com/angular/angular/issues/34147)
* **compiler-cli:** ensure that `ngI18nClosureMode` is guarded in generated code ([#34211](https://github.com/angular/angular/issues/34211)) ([4d02556](https://github.com/angular/angular/commit/4d02556))
* **core:** ensure that `ngI18nClosureMode` is guarded ([#34211](https://github.com/angular/angular/issues/34211)) ([2546261](https://github.com/angular/angular/commit/2546261))
* **ivy:** allow insertion of views attached to a different container ([#34156](https://github.com/angular/angular/issues/34156)) ([65cd811](https://github.com/angular/angular/commit/65cd811)), closes [#34152](https://github.com/angular/angular/issues/34152)
* **ivy:** consistenly return -1 from ViewContainerRef.indexOf for non-inserted view ([#34156](https://github.com/angular/angular/issues/34156)) ([0044c66](https://github.com/angular/angular/commit/0044c66))
* **ivy:** correctly support `ngProjectAs` on templates ([#34200](https://github.com/angular/angular/issues/34200)) ([41ea3c2](https://github.com/angular/angular/commit/41ea3c2))
* **ivy:** i18n - correctly parse XLIFF placeholders ([#34155](https://github.com/angular/angular/issues/34155)) ([d5a48b2](https://github.com/angular/angular/commit/d5a48b2)), closes [#34151](https://github.com/angular/angular/issues/34151)
* **ivy:** i18n - trim whitespace when parsing metadata ([#34154](https://github.com/angular/angular/issues/34154)) ([f4d714c](https://github.com/angular/angular/commit/f4d714c))
* **ivy:** incorrectly validating html foreign objects inside svg ([#34178](https://github.com/angular/angular/issues/34178)) ([4836fe0](https://github.com/angular/angular/commit/4836fe0)), closes [#34171](https://github.com/angular/angular/issues/34171)
* **ivy:** support ICUs with pipes ([#34198](https://github.com/angular/angular/issues/34198)) ([eae541b](https://github.com/angular/angular/commit/eae541b))
* **language-service:** determine correct type for ngFor exported values ([#34089](https://github.com/angular/angular/issues/34089)) ([12e4aa0](https://github.com/angular/angular/commit/12e4aa0))
* **language-service:** Do not produce diagnostics if metadata for NgModule not found ([#34113](https://github.com/angular/angular/issues/34113)) ([29de8d3](https://github.com/angular/angular/commit/29de8d3))
* implement Symbol.specics of Promise ([#34162](https://github.com/angular/angular/issues/34162)) ([1bab8c2](https://github.com/angular/angular/commit/1bab8c2)), closes [#34105](https://github.com/angular/angular/issues/34105) [#33989](https://github.com/angular/angular/issues/33989)
* **language-service:** Insert parentheses for method completion ([#33860](https://github.com/angular/angular/issues/33860)) ([fb22f18](https://github.com/angular/angular/commit/fb22f18))
* **language-service:** Make missing module suggestion instead of error ([#34115](https://github.com/angular/angular/issues/34115)) ([#34193](https://github.com/angular/angular/issues/34193)) ([d2538ca](https://github.com/angular/angular/commit/d2538ca))
* **language-service:** use host.error() instead of console.error() ([#34114](https://github.com/angular/angular/issues/34114)) ([7a7e999](https://github.com/angular/angular/commit/7a7e999))
* **ngcc:** render legacy i18n message ids by default ([#34135](https://github.com/angular/angular/issues/34135)) ([93ac362](https://github.com/angular/angular/commit/93ac362)), closes [#34056](https://github.com/angular/angular/issues/34056)
* **bazel:** ng_module should not emit shim files under bazel and Ivy ([#33765](https://github.com/angular/angular/issues/33765)) ([e24ed8d](https://github.com/angular/angular/commit/e24ed8d))
* **bazel:** update to tsickle 0.37.1 to fix peerDep warnings ([#33788](https://github.com/angular/angular/issues/33788)) ([719ca1d](https://github.com/angular/angular/commit/719ca1d))
* **core:** allow css custom variables/properties in the style sanitizer ([#33841](https://github.com/angular/angular/issues/33841)) ([61cc7a3](https://github.com/angular/angular/commit/61cc7a3)), closes [#23485](https://github.com/angular/angular/issues/23485) [#23485](https://github.com/angular/angular/issues/23485)
* **core:** remove deprecated and defunct wtf* apis ([#33949](https://github.com/angular/angular/issues/33949)) ([cf42019](https://github.com/angular/angular/commit/cf42019))
* **ivy:** avoid infinite recursion when evaluation source files ([#33772](https://github.com/angular/angular/issues/33772)) ([b12fde4](https://github.com/angular/angular/commit/b12fde4)), closes [#33734](https://github.com/angular/angular/issues/33734)
* **ivy:** avoid using stale cache in TestBed if module overrides are defined ([#33787](https://github.com/angular/angular/issues/33787)) ([fbd2133](https://github.com/angular/angular/commit/fbd2133))
* **ivy:** handle non-standard input/output names in template type checking ([#33741](https://github.com/angular/angular/issues/33741)) ([94257ac](https://github.com/angular/angular/commit/94257ac)), closes [#33590](https://github.com/angular/angular/issues/33590)
* **ivy:** i18n - ensure that escaped chars are handled in localized strings ([#34065](https://github.com/angular/angular/issues/34065)) ([00f8d6a](https://github.com/angular/angular/commit/00f8d6a))
* **ivy:** prevent unknown element check for AOT-compiled components ([#34024](https://github.com/angular/angular/issues/34024)) ([955a312](https://github.com/angular/angular/commit/955a312))
* **ivy:** remove TNodeType assertion from `directiveInject` instruction ([#33948](https://github.com/angular/angular/issues/33948)) ([90a9043](https://github.com/angular/angular/commit/90a9043))
* **ivy:** reset style property using ngStyle fix ([#33920](https://github.com/angular/angular/issues/33920)) ([b8ba6b0](https://github.com/angular/angular/commit/b8ba6b0))
* **ivy:** run pre-order hooks in injection order ([#34026](https://github.com/angular/angular/issues/34026)) ([ebe3229](https://github.com/angular/angular/commit/ebe3229)), closes [#32522](https://github.com/angular/angular/issues/32522)
* **ivy:** support ICUs without "other" cases ([#34042](https://github.com/angular/angular/issues/34042)) ([781003f](https://github.com/angular/angular/commit/781003f))
* **ivy:** support inserting a `viewRef` that is already present ([#34052](https://github.com/angular/angular/issues/34052)) ([978b500](https://github.com/angular/angular/commit/978b500)), closes [#33924](https://github.com/angular/angular/issues/33924)
* **ivy:** take styles extracted from template into account in JIT mode ([#34017](https://github.com/angular/angular/issues/34017)) ([b659aa3](https://github.com/angular/angular/commit/b659aa3))
* **ivy:** track changes across failed builds ([#33971](https://github.com/angular/angular/issues/33971)) ([1ffbde1](https://github.com/angular/angular/commit/1ffbde1)), closes [#32214](https://github.com/angular/angular/issues/32214)
* **ivy:** wrap functions from "providers" in parentheses in Closure mode ([#33609](https://github.com/angular/angular/issues/33609)) ([fc6ad19](https://github.com/angular/angular/commit/fc6ad19)), closes [/github.com/angular/tsickle/blob/d7974262571c8a17d684e5ba07680e1b1993afdd/src/jsdoc_transformer.ts#L1021](https://github.com/angular/tsickle/blob/d7974262571c8a17d684e5ba07680e1b1993afdd/src/jsdoc_transformer.ts/issues/L1021)
* **language-service:** determine index types accessed using dot notation ([#33884](https://github.com/angular/angular/issues/33884)) ([e8ec296](https://github.com/angular/angular/commit/e8ec296)), closes [#29811](https://github.com/angular/angular/issues/29811) [#29811](https://github.com/angular/angular/issues/29811)
* **language-service:** fix error of array-index out of bounds exception ([#33928](https://github.com/angular/angular/issues/33928)) ([b05ce85](https://github.com/angular/angular/commit/b05ce85))
* **language-service:** function.bind() should not be an error ([#34041](https://github.com/angular/angular/issues/34041)) ([#34046](https://github.com/angular/angular/issues/34046)) ([d22f3d6](https://github.com/angular/angular/commit/d22f3d6))
* **ngcc:** do not crash on packages that specify typings as an array ([#33973](https://github.com/angular/angular/issues/33973)) ([e456e58](https://github.com/angular/angular/commit/e456e58)), closes [#33646](https://github.com/angular/angular/issues/33646)
* **ngcc:** do not output duplicate ɵprov properties ([#34085](https://github.com/angular/angular/issues/34085)) ([5a8d25d](https://github.com/angular/angular/commit/5a8d25d))
* **ngcc:** render localized strings when in ES5 format ([#33857](https://github.com/angular/angular/issues/33857)) ([c6695fa](https://github.com/angular/angular/commit/c6695fa))
* **ngcc:** render UMD global imports correctly ([#34012](https://github.com/angular/angular/issues/34012)) ([83989b8](https://github.com/angular/angular/commit/83989b8))
* **ngcc:** report errors from `analyze` and `resolve` processing ([#33964](https://github.com/angular/angular/issues/33964)) ([ca5d772](https://github.com/angular/angular/commit/ca5d772)), closes [/github.com/angular/angular/issues/33685#issuecomment-557091719](https://github.com/angular/angular/issues/33685/issues/issuecomment-557091719)
* **router:** make routerLinkActive work with query params which contain arrays ([#22666](https://github.com/angular/angular/issues/22666)) ([f1bf5b2](https://github.com/angular/angular/commit/f1bf5b2)), closes [#22223](https://github.com/angular/angular/issues/22223)
* **service-worker:** allow creating post api requests after cache failure ([#33930](https://github.com/angular/angular/issues/33930)) ([63c9123](https://github.com/angular/angular/commit/63c9123)), closes [#33793](https://github.com/angular/angular/issues/33793)
* **service-worker:** throw when using the unsupported `versionedFiles` option in config ([#33903](https://github.com/angular/angular/issues/33903)) ([250e6fd](https://github.com/angular/angular/commit/250e6fd))
* **bazel:** add terser as an optional peer dependency ([#33891](https://github.com/angular/angular/issues/33891)) ([2d7b015](https://github.com/angular/angular/commit/2d7b015))
* **compiler-cli:** Refactor getTsTypeFromBuiltinType ([#33778](https://github.com/angular/angular/issues/33778)) ([09480d3](https://github.com/angular/angular/commit/09480d3))
* **core:** make QueryList implement Iterable in the type system ([#33536](https://github.com/angular/angular/issues/33536)) ([49571bf](https://github.com/angular/angular/commit/49571bf)), closes [#29842](https://github.com/angular/angular/issues/29842)
* **ivy:** always re-analyze the program during incremental rebuilds ([#33862](https://github.com/angular/angular/issues/33862)) ([30ddadc](https://github.com/angular/angular/commit/30ddadc)), closes [#32388](https://github.com/angular/angular/issues/32388)
* **ivy:** avoid cyclical dependency in imports ([#33831](https://github.com/angular/angular/issues/33831)) ([a61fb76](https://github.com/angular/angular/commit/a61fb76))
* **ivy:** constant object literals shared across element and component instances ([#33705](https://github.com/angular/angular/issues/33705)) ([93ba4c2](https://github.com/angular/angular/commit/93ba4c2))
* **ivy:** don't infer template context types when in full mode ([#33537](https://github.com/angular/angular/issues/33537)) ([595375f](https://github.com/angular/angular/commit/595375f)), closes [#33527](https://github.com/angular/angular/issues/33527)
* **ivy:** emit fs-relative paths when rootDir(s) aren't in effect ([#33828](https://github.com/angular/angular/issues/33828)) ([14156bd](https://github.com/angular/angular/commit/14156bd)), closes [#33659](https://github.com/angular/angular/issues/33659) [#33562](https://github.com/angular/angular/issues/33562)
* **ivy:** ExpressionChangedAfterItHasBeenCheckedError for SafeValue ([#33749](https://github.com/angular/angular/issues/33749)) ([cba6b7d](https://github.com/angular/angular/commit/cba6b7d)), closes [#33448](https://github.com/angular/angular/issues/33448)
* **ivy:** extend assertion in `directiveInject` function to support IcuContainers ([#33832](https://github.com/angular/angular/issues/33832)) ([8452458](https://github.com/angular/angular/commit/8452458))
* **ivy:** i18n - ensure that colons in i18n metadata are not rendered ([#33820](https://github.com/angular/angular/issues/33820)) ([bc28ca7](https://github.com/angular/angular/commit/bc28ca7))
* **ivy:** i18n - support "\", "`" and "${" sequences in i18n messages ([#33820](https://github.com/angular/angular/issues/33820)) ([b53a1ac](https://github.com/angular/angular/commit/b53a1ac))
* **ivy:** move setClassMetadata calls into a pure iife ([#33337](https://github.com/angular/angular/issues/33337)) ([213e3c3](https://github.com/angular/angular/commit/213e3c3))
* **ivy:** properly insert views before ng-container with injected ViewContainerRef ([#33853](https://github.com/angular/angular/issues/33853)) ([c7a3694](https://github.com/angular/angular/commit/c7a3694))
* **ivy:** properly insert views into ViewContainerRef injected by querying <ng-container> ([#33816](https://github.com/angular/angular/issues/33816)) ([f136dda](https://github.com/angular/angular/commit/f136dda))
* **ivy:** report watch mode diagnostics correctly ([#33862](https://github.com/angular/angular/issues/33862)) ([d92da13](https://github.com/angular/angular/commit/d92da13)), closes [#32213](https://github.com/angular/angular/issues/32213)
* **ivy:** reset style property value defined using [style.prop.px] ([#33780](https://github.com/angular/angular/issues/33780)) ([de8cf75](https://github.com/angular/angular/commit/de8cf75))
* **ivy:** retain JIT metadata unless JIT mode is explicitly disabled ([#33671](https://github.com/angular/angular/issues/33671)) ([5267c92](https://github.com/angular/angular/commit/5267c92))
* **ivy:** shadow all DOM properties in `DebugElement.properties` ([#33781](https://github.com/angular/angular/issues/33781)) ([5be23a3](https://github.com/angular/angular/commit/5be23a3)), closes [#33695](https://github.com/angular/angular/issues/33695)
* **ivy:** support for #id bootstrap selectors ([#33784](https://github.com/angular/angular/issues/33784)) ([9761ebe](https://github.com/angular/angular/commit/9761ebe)), closes [#33485](https://github.com/angular/angular/issues/33485)
* **language-service:** Function alias should be callable ([#33782](https://github.com/angular/angular/issues/33782)) ([ca63353](https://github.com/angular/angular/commit/ca63353))
* **language-service:** Provide completions for attribute values ([#33839](https://github.com/angular/angular/issues/33839)) ([0e20453](https://github.com/angular/angular/commit/0e20453))
* **language-service:** Recompute analyzed modules only when source files change ([#33806](https://github.com/angular/angular/issues/33806)) ([9882a82](https://github.com/angular/angular/commit/9882a82))
* **language-service:** Remove getTemplateReferences() from LanguageService API ([#33807](https://github.com/angular/angular/issues/33807)) ([0688a28](https://github.com/angular/angular/commit/0688a28))
* **ngcc:** always add exports for `ModuleWithProviders` references ([#33875](https://github.com/angular/angular/issues/33875)) ([f3d8f6a](https://github.com/angular/angular/commit/f3d8f6a)), closes [#33701](https://github.com/angular/angular/issues/33701)
* **ngcc:** correctly associate decorators with aliased classes ([#33878](https://github.com/angular/angular/issues/33878)) ([59a4b76](https://github.com/angular/angular/commit/59a4b76))
* **ngcc:** correctly include internal .d.ts files ([#33875](https://github.com/angular/angular/issues/33875)) ([0854dc8](https://github.com/angular/angular/commit/0854dc8))
* **ngcc:** do not emit ES2015 code in ES5 files ([#33514](https://github.com/angular/angular/issues/33514)) ([06e36e5](https://github.com/angular/angular/commit/06e36e5)), closes [#32665](https://github.com/angular/angular/issues/32665)
* **ngcc:** generate correct metadata for classes with getter/setter properties ([#33514](https://github.com/angular/angular/issues/33514)) ([21bd8c9](https://github.com/angular/angular/commit/21bd8c9)), closes [#30569](https://github.com/angular/angular/issues/30569)
* **ngcc:** properly detect origin of constructor param types ([#33901](https://github.com/angular/angular/issues/33901)) ([05d5c4f](https://github.com/angular/angular/commit/05d5c4f)), closes [#33677](https://github.com/angular/angular/issues/33677)
* **router:** make routerLinkActive work with query params which contain arrays ([#22666](https://github.com/angular/angular/issues/22666)) ([8e5ed20](https://github.com/angular/angular/commit/8e5ed20)), closes [#22223](https://github.com/angular/angular/issues/22223)
* **zone.js:** fixes typo of zone.js patch vrdisplaydisconnected property ([#33581](https://github.com/angular/angular/issues/33581)) ([1b7aa05](https://github.com/angular/angular/commit/1b7aa05)), closes [#33579](https://github.com/angular/angular/issues/33579)
* **common:** rerun cldr to remove � characters ([#33699](https://github.com/angular/angular/issues/33699)) ([011ecdf](https://github.com/angular/angular/commit/011ecdf))
* **common:** update CLDR generated files after change to npm sources ([#33634](https://github.com/angular/angular/issues/33634)) ([59b25da](https://github.com/angular/angular/commit/59b25da))
* **common:** update CLDR generated files to 36.0.0 ([#33584](https://github.com/angular/angular/issues/33584)) ([c1bd3bc](https://github.com/angular/angular/commit/c1bd3bc))
* **compiler:** correctly parse attributes with a dot in the name ([#32256](https://github.com/angular/angular/issues/32256)) ([687582f](https://github.com/angular/angular/commit/687582f))
* **compiler-cli:** Fix typo $implict ([#33633](https://github.com/angular/angular/issues/33633)) ([7bccef5](https://github.com/angular/angular/commit/7bccef5))
* **compiler-cli:** Pass SourceFile to getFullText() ([#33660](https://github.com/angular/angular/issues/33660)) ([33f6cd4](https://github.com/angular/angular/commit/33f6cd4))
* **core:** remove ngcc postinstall migration ([#33727](https://github.com/angular/angular/issues/33727)) ([508bbfd](https://github.com/angular/angular/commit/508bbfd))
* **core:** support `ngInjectableDef` on types with inherited `ɵprov` ([#33732](https://github.com/angular/angular/issues/33732)) ([4ec079f](https://github.com/angular/angular/commit/4ec079f))
* **ivy:** auto register NgModules with ID ([#33663](https://github.com/angular/angular/issues/33663)) ([4988094](https://github.com/angular/angular/commit/4988094))
* **ivy:** better support for i18n attributes on <ng-container>s ([#33599](https://github.com/angular/angular/issues/33599)) ([2046202](https://github.com/angular/angular/commit/2046202))
* **ivy:** ComponentFactory.create should clear host element content ([#33487](https://github.com/angular/angular/issues/33487)) ([d67a38b](https://github.com/angular/angular/commit/d67a38b))
* **ivy:** ensure module scope is rebuilt on dependent change ([#33522](https://github.com/angular/angular/issues/33522)) ([71238a9](https://github.com/angular/angular/commit/71238a9)), closes [#32416](https://github.com/angular/angular/issues/32416)
* **ivy:** ensure that the  correct `document` is available ([#33712](https://github.com/angular/angular/issues/33712)) ([8362696](https://github.com/angular/angular/commit/8362696)), closes [#33651](https://github.com/angular/angular/issues/33651)
* **ivy:** Handle overrides for {providedIn: AModule} in R3TestBed ([#33606](https://github.com/angular/angular/issues/33606)) ([d09ad82](https://github.com/angular/angular/commit/d09ad82))
* **ivy:** match directives on namespaced elements ([#33555](https://github.com/angular/angular/issues/33555)) ([99ead47](https://github.com/angular/angular/commit/99ead47)), closes [#32061](https://github.com/angular/angular/issues/32061)
* **ivy:** properly determine the first native node of a view ([#33627](https://github.com/angular/angular/issues/33627)) ([811275c](https://github.com/angular/angular/commit/811275c))
* **ivy:** properly insert views in front of empty views ([#33647](https://github.com/angular/angular/issues/33647)) ([c5737f4](https://github.com/angular/angular/commit/c5737f4))
* **ivy:** properly insert views in front of views with an empty element container ([#33647](https://github.com/angular/angular/issues/33647)) ([0b99884](https://github.com/angular/angular/commit/0b99884))
* **ivy:** provider override via TestBed should remove old providers from the list ([#33706](https://github.com/angular/angular/issues/33706)) ([f45d5dc](https://github.com/angular/angular/commit/f45d5dc))
* **ivy:** recompile component when template changes in ngc watch mode ([#33551](https://github.com/angular/angular/issues/33551)) ([da01dbc](https://github.com/angular/angular/commit/da01dbc)), closes [#32869](https://github.com/angular/angular/issues/32869)
* **ivy:** recompile component when template changes in ngc watch mode ([#33551](https://github.com/angular/angular/issues/33551)) ([cd8333c](https://github.com/angular/angular/commit/cd8333c)), closes [#32869](https://github.com/angular/angular/issues/32869)
* **ivy:** Run ChangeDetection on transplanted views ([#33644](https://github.com/angular/angular/issues/33644)) ([37ae45e](https://github.com/angular/angular/commit/37ae45e)), closes [#33393](https://github.com/angular/angular/issues/33393)
* **language-service:** Resolve template variable in nested ngFor ([#33676](https://github.com/angular/angular/issues/33676)) ([6615743](https://github.com/angular/angular/commit/6615743))
* **ngcc:** add default config for `ng2-dragula` ([#33797](https://github.com/angular/angular/issues/33797)) ([ecf38d4](https://github.com/angular/angular/commit/ecf38d4)), closes [#33718](https://github.com/angular/angular/issues/33718)
* **ngcc:** add reexports only once ([#33658](https://github.com/angular/angular/issues/33658)) ([83b635c](https://github.com/angular/angular/commit/83b635c))
* **ngcc:** ensure that adjacent statements go after helper calls ([#33689](https://github.com/angular/angular/issues/33689)) ([c540061](https://github.com/angular/angular/commit/c540061))
* generate the new locale files ([#33682](https://github.com/angular/angular/issues/33682)) ([72796b9](https://github.com/angular/angular/commit/72796b9))
* resolve event listeners not correct when registered outside of ngZone ([#33711](https://github.com/angular/angular/issues/33711)) ([9045e3e](https://github.com/angular/angular/commit/9045e3e)), closes [#33687](https://github.com/angular/angular/issues/33687)
* use full cldr data to support all locales ([#33682](https://github.com/angular/angular/issues/33682)) ([ea83125](https://github.com/angular/angular/commit/ea83125)), closes [#33681](https://github.com/angular/angular/issues/33681)
* **ngcc:** remove `__decorator` calls even when part of the IIFE return statement ([#33777](https://github.com/angular/angular/issues/33777)) ([e1df98b](https://github.com/angular/angular/commit/e1df98b))
* **ngcc:** support minified ES5 scenarios ([#33777](https://github.com/angular/angular/issues/33777)) ([49e517d](https://github.com/angular/angular/commit/49e517d))
* **compiler-cli:** attach the correct `viaModule` to namespace imports ([#33495](https://github.com/angular/angular/issues/33495)) ([1d141a8](https://github.com/angular/angular/commit/1d141a8)), closes [#32166](https://github.com/angular/angular/issues/32166)
* **compiler-cli:** Pass SourceFile to getLeadingTriviaWidth ([#33588](https://github.com/angular/angular/issues/33588)) ([4b62ba9](https://github.com/angular/angular/commit/4b62ba9))
* **compiler-cli:** remove unused CLI private exports ([#33242](https://github.com/angular/angular/issues/33242)) ([fc8eeca](https://github.com/angular/angular/commit/fc8eeca))
* **core:** renderer-to-renderer2 migration not migrating methods ([#33571](https://github.com/angular/angular/issues/33571)) ([d751ca7](https://github.com/angular/angular/commit/d751ca7))
* **core:** undecorated-classes-with-di migration should report config errors ([#33567](https://github.com/angular/angular/issues/33567)) ([c0ad47a](https://github.com/angular/angular/commit/c0ad47a))
* **ivy:** avoid implicit any errors in event handlers ([#33550](https://github.com/angular/angular/issues/33550)) ([e2d7b25](https://github.com/angular/angular/commit/e2d7b25)), closes [#33528](https://github.com/angular/angular/issues/33528)
* **ivy:** don't crash on an unknown localref target ([#33454](https://github.com/angular/angular/issues/33454)) ([9db59d0](https://github.com/angular/angular/commit/9db59d0))
* **ivy:** don't crash on unknown pipe ([#33454](https://github.com/angular/angular/issues/33454)) ([38758d8](https://github.com/angular/angular/commit/38758d8))
* **ivy:** more descriptive errors for nested i18n sections ([#33583](https://github.com/angular/angular/issues/33583)) ([d9a3892](https://github.com/angular/angular/commit/d9a3892))
* **language-service:** Should not crash if expr ends unexpectedly ([#33524](https://github.com/angular/angular/issues/33524)) ([9ebac71](https://github.com/angular/angular/commit/9ebac71))
* **ngcc:** handle new `__spreadArrays` tslib helper ([#33617](https://github.com/angular/angular/issues/33617)) ([d749dd3](https://github.com/angular/angular/commit/d749dd3)), closes [#33614](https://github.com/angular/angular/issues/33614)
* **ngcc:** override `getInternalNameOfClass()` and `getAdjacentNameOfClass()` for ES5 ([#33533](https://github.com/angular/angular/issues/33533)) ([93a23b9](https://github.com/angular/angular/commit/93a23b9))
* **ngcc:** render adjacent statements after static properties ([#33630](https://github.com/angular/angular/issues/33630)) ([fe12d0d](https://github.com/angular/angular/commit/fe12d0d)), closes [/github.com/angular/angular/pull/33337#issuecomment-545487737](https://github.com/angular/angular/pull/33337/issues/issuecomment-545487737)
* **ngcc:** render new definitions using the inner name of the class ([#33533](https://github.com/angular/angular/issues/33533)) ([85298e3](https://github.com/angular/angular/commit/85298e3))
* **service-worker:** ensure initialization before handling messages ([#32525](https://github.com/angular/angular/issues/32525)) ([72eba77](https://github.com/angular/angular/commit/72eba77)), closes [#25611](https://github.com/angular/angular/issues/25611)
* **compiler:** i18n - ignore `alt-trans` tags in XLIFF 1.2 ([#33450](https://github.com/angular/angular/issues/33450)) ([936700a](https://github.com/angular/angular/commit/936700a)), closes [#33161](https://github.com/angular/angular/issues/33161)
* **ivy:** descend into ICU containers when collecting rootNodes ([#33493](https://github.com/angular/angular/issues/33493)) ([563a507](https://github.com/angular/angular/commit/563a507))
* **ivy:** descend into view containers on elements when collecting rootNodes ([#33493](https://github.com/angular/angular/issues/33493)) ([87743f1](https://github.com/angular/angular/commit/87743f1))
* **ivy:** descend into view containers on ng-container when collecting rootNodes ([#33493](https://github.com/angular/angular/issues/33493)) ([a5167bd](https://github.com/angular/angular/commit/a5167bd))
* **ivy:** descend into view containers on ng-template when collecting rootNodes ([#33493](https://github.com/angular/angular/issues/33493)) ([502fb7e](https://github.com/angular/angular/commit/502fb7e))
* **ivy:** ensure overrides for 'multi: true' only appear once in final providers ([#33104](https://github.com/angular/angular/issues/33104)) ([e483aca](https://github.com/angular/angular/commit/e483aca))
* **ivy:** handle elements with local refs in i18n blocks ([#33415](https://github.com/angular/angular/issues/33415)) ([bd40c89](https://github.com/angular/angular/commit/bd40c89))
* **ivy:** i18n - support setting locales for each translation file ([#33381](https://github.com/angular/angular/issues/33381)) ([62b2840](https://github.com/angular/angular/commit/62b2840)), closes [#33323](https://github.com/angular/angular/issues/33323)
* **ivy:** i18n - update `localize-translate` to accept target-locales ([#33381](https://github.com/angular/angular/issues/33381)) ([41979d6](https://github.com/angular/angular/commit/41979d6))
* **language-service:** Improve signature selection for pipes with args ([#33456](https://github.com/angular/angular/issues/33456)) ([1de7579](https://github.com/angular/angular/commit/1de7579))
* **core:** missing-injectable migration should handle forwardRef ([#33286](https://github.com/angular/angular/issues/33286)) ([eeecbf2](https://github.com/angular/angular/commit/eeecbf2))
* **core:** missing-injectable migration should not migrate providers with "useExisting" ([#33286](https://github.com/angular/angular/issues/33286)) ([4d23b60](https://github.com/angular/angular/commit/4d23b60))
* **core:** missing-injectable migration should not update type definitions ([#33286](https://github.com/angular/angular/issues/33286)) ([335854f](https://github.com/angular/angular/commit/335854f))
* **ivy:** allow abstract directives to have an invalid constructor ([#32987](https://github.com/angular/angular/issues/32987)) ([8d15bfa](https://github.com/angular/angular/commit/8d15bfa)), closes [#32981](https://github.com/angular/angular/issues/32981)
* **ivy:** fix broken typechecking test on Windows ([#33376](https://github.com/angular/angular/issues/33376)) ([63f0ded](https://github.com/angular/angular/commit/63f0ded))
* **ivy:** split checkTypeOfReferences into DOM and non-DOM flags. ([#33365](https://github.com/angular/angular/issues/33365)) ([113411c](https://github.com/angular/angular/commit/113411c))
* **ivy:** support abstract directives in template type checking ([#33131](https://github.com/angular/angular/issues/33131)) ([a42057d](https://github.com/angular/angular/commit/a42057d)), closes [#30080](https://github.com/angular/angular/issues/30080)
* **language-service:** Do not show HTML elements and attrs for ext template ([#33388](https://github.com/angular/angular/issues/33388)) ([a78b701](https://github.com/angular/angular/commit/a78b701))
* **ngcc:** prevent reflected decorators from being clobbered ([#33362](https://github.com/angular/angular/issues/33362)) ([0de2dbf](https://github.com/angular/angular/commit/0de2dbf))
* **bazel:** remove deprecated ng_setup_workspace() function ([#33330](https://github.com/angular/angular/issues/33330)) ([8bc5fb2](https://github.com/angular/angular/commit/8bc5fb2))
* **compiler:** do not throw when using abstract directive from other compilation unit ([#33347](https://github.com/angular/angular/issues/33347)) ([355e54a](https://github.com/angular/angular/commit/355e54a))
* **compiler:** ensure that legacy ids are rendered for ICUs ([#33318](https://github.com/angular/angular/issues/33318)) ([5d86e4a](https://github.com/angular/angular/commit/5d86e4a))
* **ivy:** align VE + Ivy #ref types in fullTemplateTypeCheck: false ([#33261](https://github.com/angular/angular/issues/33261)) ([77240e1](https://github.com/angular/angular/commit/77240e1))
* **ivy:** handle method calls of local variables in template type checker ([#33132](https://github.com/angular/angular/issues/33132)) ([e2211ed](https://github.com/angular/angular/commit/e2211ed)), closes [#32900](https://github.com/angular/angular/issues/32900)
* **language-service:** Add directive selectors & banana-in-a-box to completions ([#33311](https://github.com/angular/angular/issues/33311)) ([49eec5d](https://github.com/angular/angular/commit/49eec5d))
* **language-service:** Add global symbol for $any() ([#33245](https://github.com/angular/angular/issues/33245)) ([3f257e9](https://github.com/angular/angular/commit/3f257e9))
* **language-service:** Preserve CRLF in templates for language-service ([#33241](https://github.com/angular/angular/issues/33241)) ([65a0d2b](https://github.com/angular/angular/commit/65a0d2b))
* **ngcc:** do not fail when multiple workers try to create the same directory ([#33237](https://github.com/angular/angular/issues/33237)) ([8017229](https://github.com/angular/angular/commit/8017229)), closes [/github.com/angular/angular/pull/33049#issuecomment-540485703](https://github.com/angular/angular/pull/33049/issues/issuecomment-540485703)
* **bazel:** Remove angular devkit and restore ngc postinstall ([#32946](https://github.com/angular/angular/issues/32946)) ([f036684](https://github.com/angular/angular/commit/f036684))
* **common:** remove deprecated support for intl API ([#29250](https://github.com/angular/angular/issues/29250)) ([9e7668f](https://github.com/angular/angular/commit/9e7668f)), closes [#18284](https://github.com/angular/angular/issues/18284)
* **compiler:** absolute source span for template attribute expressions ([#33189](https://github.com/angular/angular/issues/33189)) ([fd4fed1](https://github.com/angular/angular/commit/fd4fed1))
* **core:** add CLI instructions when localize polyfill is missing ([#33199](https://github.com/angular/angular/issues/33199)) ([5dfbcd5](https://github.com/angular/angular/commit/5dfbcd5))
* **ivy:** ensure errors are thrown during checkNoChanges for style/class bindings ([#33103](https://github.com/angular/angular/issues/33103)) ([f45c431](https://github.com/angular/angular/commit/f45c431))
* **ivy:** ensure map-based interpolation works with other map-based sources ([#33236](https://github.com/angular/angular/issues/33236)) ([7b64680](https://github.com/angular/angular/commit/7b64680))
* **ivy:** handling className as an input properly ([#33188](https://github.com/angular/angular/issues/33188)) ([6f203c9](https://github.com/angular/angular/commit/6f203c9))
* **ivy:** ignore non-property bindings to inputs in template type checker ([#33130](https://github.com/angular/angular/issues/33130)) ([08cb2fa](https://github.com/angular/angular/commit/08cb2fa)), closes [#32099](https://github.com/angular/angular/issues/32099) [#32496](https://github.com/angular/angular/issues/32496)
* **ivy:** throw better error for missing generic type in ModuleWithProviders ([#33187](https://github.com/angular/angular/issues/33187)) ([0e08ad6](https://github.com/angular/angular/commit/0e08ad6))
* **ivy:** use container i18n meta if a message is a single ICU ([#33191](https://github.com/angular/angular/issues/33191)) ([7e64bbe](https://github.com/angular/angular/commit/7e64bbe)), closes [#33171](https://github.com/angular/angular/issues/33171)
* **ivy:** use ReflectionHost to check exports when writing an import ([#33192](https://github.com/angular/angular/issues/33192)) ([de44570](https://github.com/angular/angular/commit/de44570))
* **language-service:** Increase project/script version in MockHost.reset() ([#33200](https://github.com/angular/angular/issues/33200)) ([43241a5](https://github.com/angular/angular/commit/43241a5))
* **language-service:** reset MockHost after every spec instead of creating new LS ([#33200](https://github.com/angular/angular/issues/33200)) ([11bf767](https://github.com/angular/angular/commit/11bf767))
* **ngcc:** avoid warning when reflecting on index signature member ([#33198](https://github.com/angular/angular/issues/33198)) ([78214e7](https://github.com/angular/angular/commit/78214e7)), closes [/github.com/angular/angular/blob/4659cc26e/packages/common/http/src/jsonp.ts#L39](https://github.com/angular/angular/blob/4659cc26e/packages/common/http/src/jsonp.ts/issues/L39)
* **ngcc:** better detection of end of decorator expression ([#33192](https://github.com/angular/angular/issues/33192)) ([5071083](https://github.com/angular/angular/commit/5071083))
* **ngcc:** Esm5ReflectionHost.getDeclarationOfIdentifier should handle aliased inner declarations ([#33252](https://github.com/angular/angular/issues/33252)) ([bfd07b3](https://github.com/angular/angular/commit/bfd07b3))
* **ngcc:** report the correct viaModule when reflecting over commonjs ([#33192](https://github.com/angular/angular/issues/33192)) ([afcff73](https://github.com/angular/angular/commit/afcff73))
* **router:** adjust UrlTree redirect to replace URL if in eager update ([#32988](https://github.com/angular/angular/issues/32988)) ([f6667f8](https://github.com/angular/angular/commit/f6667f8)), closes [#31168](https://github.com/angular/angular/issues/31168) [#27148](https://github.com/angular/angular/issues/27148)
* **upgrade:** remove unused version export ([#33180](https://github.com/angular/angular/issues/33180)) ([becd62d](https://github.com/angular/angular/commit/becd62d))
* **compiler-cli:** produce diagnostic messages in expression of PrefixNot node. ([#33087](https://github.com/angular/angular/issues/33087)) ([2ddc851](https://github.com/angular/angular/commit/2ddc851))
* **compiler-cli:** resolve type of exported *ngIf variable. ([#33016](https://github.com/angular/angular/issues/33016)) ([39587ad](https://github.com/angular/angular/commit/39587ad))
* **ivy:** avoid DOM element assertions if procedural renderer is used ([#33156](https://github.com/angular/angular/issues/33156)) ([11e04b1](https://github.com/angular/angular/commit/11e04b1))
* **ivy:** do not always accept `undefined` for directive inputs ([#33066](https://github.com/angular/angular/issues/33066)) ([50bf17a](https://github.com/angular/angular/commit/50bf17a)), closes [#32690](https://github.com/angular/angular/issues/32690)
* **ivy:** ensure sanitizer is not used when direct class application occurs ([#33154](https://github.com/angular/angular/issues/33154)) ([1cda80e](https://github.com/angular/angular/commit/1cda80e))
* **ivy:** i18n - add XLIFF aliases for legacy message id support ([#33160](https://github.com/angular/angular/issues/33160)) ([ad72c90](https://github.com/angular/angular/commit/ad72c90))
* **ivy:** i18n - strip meta blocks from untranslated messages ([#33097](https://github.com/angular/angular/issues/33097)) ([1845faa](https://github.com/angular/angular/commit/1845faa))
* **ivy:** i18n - support lazy-load template string helpers ([#33097](https://github.com/angular/angular/issues/33097)) ([83425fa](https://github.com/angular/angular/commit/83425fa))
* **ivy:** i18n - turn on legacy message-id support by default ([#33053](https://github.com/angular/angular/issues/33053)) ([f640a4a](https://github.com/angular/angular/commit/f640a4a))
* **language-service:** Use index.d.ts for typings ([#33043](https://github.com/angular/angular/issues/33043)) ([728cd84](https://github.com/angular/angular/commit/728cd84))
* google3 sync which requires type hints ([#33108](https://github.com/angular/angular/issues/33108)) ([0c69ec2](https://github.com/angular/angular/commit/0c69ec2))
* **ngcc:** rename the executable from `ivy-ngcc` to `ngcc` ([#33140](https://github.com/angular/angular/issues/33140)) ([1a34fbc](https://github.com/angular/angular/commit/1a34fbc))
* **service-worker:** continue serving api requests on cache failure ([#32996](https://github.com/angular/angular/issues/32996)) ([52483bf](https://github.com/angular/angular/commit/52483bf)), closes [#21412](https://github.com/angular/angular/issues/21412)
* **common:** expand type for "ngForOf" input to work with strict null checks ([#31371](https://github.com/angular/angular/issues/31371)) ([c1bb886](https://github.com/angular/angular/commit/c1bb886)), closes [#16373](https://github.com/angular/components/pull/16373)
* **core:** ngNoopZone should have the same signature with ngZone ([#32068](https://github.com/angular/angular/issues/32068)) ([3a53e2c](https://github.com/angular/angular/commit/3a53e2c)), closes [#32063](https://github.com/angular/angular/issues/32063)
* **core:** set migration schematic versions to valid semver versions ([#32991](https://github.com/angular/angular/issues/32991)) ([0119f46](https://github.com/angular/angular/commit/0119f46))
* **core:** update migration descriptions with links to AIO documentation ([#32991](https://github.com/angular/angular/issues/32991)) ([f8eca84](https://github.com/angular/angular/commit/f8eca84))
* **ivy:** avoid exposing `ng` with Closure Compiler enhanced optimizations ([#33010](https://github.com/angular/angular/issues/33010)) ([bad3434](https://github.com/angular/angular/commit/bad3434))
* **ivy:** generate ng-reflect properties for i18n attributes ([#32989](https://github.com/angular/angular/issues/32989)) ([90fb5d9](https://github.com/angular/angular/commit/90fb5d9))
* **ivy:** i18n - better translation warnings ([#32867](https://github.com/angular/angular/issues/32867)) ([97d5700](https://github.com/angular/angular/commit/97d5700))
* **ivy:** i18n - do not render message ids unnecessarily ([#32867](https://github.com/angular/angular/issues/32867)) ([9188751](https://github.com/angular/angular/commit/9188751))
* **ivy:** i18n - support colons in $localize metadata ([#32867](https://github.com/angular/angular/issues/32867)) ([d24ade9](https://github.com/angular/angular/commit/d24ade9))
* **ivy:** i18n - throw an error if a translation contains an invalid placeholder ([#32867](https://github.com/angular/angular/issues/32867)) ([601f87c](https://github.com/angular/angular/commit/601f87c))
* **ivy:** missing schematics field in localize package ([#33025](https://github.com/angular/angular/issues/33025)) ([d18289f](https://github.com/angular/angular/commit/d18289f)), closes [#32791](https://github.com/angular/angular/issues/32791)
* **ivy:** process nested animation metadata ([#32818](https://github.com/angular/angular/issues/32818)) ([c61e4d7](https://github.com/angular/angular/commit/c61e4d7)), closes [#32794](https://github.com/angular/angular/issues/32794)
* **ivy:** unable to bind style zero ([#32994](https://github.com/angular/angular/issues/32994)) ([3efb060](https://github.com/angular/angular/commit/3efb060)), closes [#32984](https://github.com/angular/angular/issues/32984)
* **language-service:** create StaticReflector once only ([#32543](https://github.com/angular/angular/issues/32543)) ([adb562b](https://github.com/angular/angular/commit/adb562b))
* **ivy:** ensure class/style values are debuggable through `DebugElement` ([#32842](https://github.com/angular/angular/issues/32842)) ([c32b2ae](https://github.com/angular/angular/commit/c32b2ae))
* **ivy:** ensure TestBed restores fields to the most original value ([#32823](https://github.com/angular/angular/issues/32823)) ([c8be987](https://github.com/angular/angular/commit/c8be987))
* **ivy:** include `ngProjectAs` into attributes array ([#32784](https://github.com/angular/angular/issues/32784)) ([966c2a3](https://github.com/angular/angular/commit/966c2a3))
* **ivy:** Only restore registered modules if user compiles modules with TestBed ([#32944](https://github.com/angular/angular/issues/32944)) ([63256b5](https://github.com/angular/angular/commit/63256b5))
* **ivy:** R3TestBed should clean up registered modules after each test ([#32872](https://github.com/angular/angular/issues/32872)) ([475e36a](https://github.com/angular/angular/commit/475e36a))
* **ivy:** refresh child components before executing ViewQuery function ([#32922](https://github.com/angular/angular/issues/32922)) ([72f3747](https://github.com/angular/angular/commit/72f3747))
* **language-service:** add closing quote in invalid test template ([#32785](https://github.com/angular/angular/issues/32785)) ([01e4d44](https://github.com/angular/angular/commit/01e4d44))
* **language-service:** Turn on strict mode for test project ([#32783](https://github.com/angular/angular/issues/32783)) ([28358b6](https://github.com/angular/angular/commit/28358b6))
* **ngcc:** ensure private exports are added for `ModuleWithProviders` ([#32902](https://github.com/angular/angular/issues/32902)) ([002a97d](https://github.com/angular/angular/commit/002a97d))
* **ngcc:** handle presence of both `ctorParameters` and `__decorate` ([#32901](https://github.com/angular/angular/issues/32901)) ([747f0cf](https://github.com/angular/angular/commit/747f0cf))
* **ngcc:** make the build-marker error more clear ([#32712](https://github.com/angular/angular/issues/32712)) ([0ea4875](https://github.com/angular/angular/commit/0ea4875)), closes [/github.com/angular/angular/issues/31354#issuecomment-532080537](https://github.com/angular/angular/issues/31354/issues/issuecomment-532080537)
* **upgrade:** fix AngularJsUrlCodec to support Safari ([#32959](https://github.com/angular/angular/issues/32959)) ([39e8ceb](https://github.com/angular/angular/commit/39e8ceb))
* **ivy:** ensure `window.ng.getDebugNode` returns debug info for component elements ([#32780](https://github.com/angular/angular/issues/32780)) ([5651fa3](https://github.com/angular/angular/commit/5651fa3))
* **ivy:** ensure multiple map-based bindings do not skip intermediate values ([#32774](https://github.com/angular/angular/issues/32774)) ([86fd571](https://github.com/angular/angular/commit/86fd571))
* **bazel:** ng_package(data) should support non-text files ([#32721](https://github.com/angular/angular/issues/32721)) ([df1c456](https://github.com/angular/angular/commit/df1c456))
* **compiler-cli:** fix typo in diagnostic template info. ([#32684](https://github.com/angular/angular/issues/32684)) ([f6d6667](https://github.com/angular/angular/commit/f6d6667)), closes [#32662](https://github.com/angular/angular/issues/32662)
* **core:** initialize global ngDevMode without toplevel side effects ([#32079](https://github.com/angular/angular/issues/32079)) ([5f095a5](https://github.com/angular/angular/commit/5f095a5)), closes [#31595](https://github.com/angular/angular/issues/31595)
* **core:** make injector.get() return default value with InjectFlags.Self flag on ([#27739](https://github.com/angular/angular/issues/27739)) ([0477bfc](https://github.com/angular/angular/commit/0477bfc)), closes [#27729](https://github.com/angular/angular/issues/27729)
* **ivy:** avoid unnecessary i18n instructions generation for <ng-template> with structural directives ([#32623](https://github.com/angular/angular/issues/32623)) ([5328bb2](https://github.com/angular/angular/commit/5328bb2))
* **ivy:** correct debug array names ([#32691](https://github.com/angular/angular/issues/32691)) ([52a6da0](https://github.com/angular/angular/commit/52a6da0))
* **ivy:** DebugNode throws exceptions when querying some properties ([#32622](https://github.com/angular/angular/issues/32622)) ([bfb3995](https://github.com/angular/angular/commit/bfb3995))
* **ivy:** ensure that `window.ng` utilities are published when NgModules are used ([#32725](https://github.com/angular/angular/issues/32725)) ([a0d04c6](https://github.com/angular/angular/commit/a0d04c6))
* **ivy:** i18n - start generated placeholder name at `PH` ([#32493](https://github.com/angular/angular/issues/32493)) ([f1b1de9](https://github.com/angular/angular/commit/f1b1de9))
* **ivy:** i18n - update the compiler to output `MessageId`s ([#32594](https://github.com/angular/angular/issues/32594)) ([b741a1c](https://github.com/angular/angular/commit/b741a1c))
* **ivy:** i18n - use `MessageId` for matching translations ([#32594](https://github.com/angular/angular/issues/32594)) ([357aa4a](https://github.com/angular/angular/commit/357aa4a))
* **language-service:** Lazily instantiate MetadataResolver ([#32631](https://github.com/angular/angular/issues/32631)) ([1771d6f](https://github.com/angular/angular/commit/1771d6f))
* **language-service:** Use tsLSHost.fileExists() to resolve modules ([#32642](https://github.com/angular/angular/issues/32642)) ([bbb2798](https://github.com/angular/angular/commit/bbb2798))
* **ngcc:** consistently use outer declaration for classes ([#32539](https://github.com/angular/angular/issues/32539)) ([373e133](https://github.com/angular/angular/commit/373e133)), closes [#32078](https://github.com/angular/angular/issues/32078)
* **ngcc:** correctly read static properties for aliased classes ([#32619](https://github.com/angular/angular/issues/32619)) ([c4e039a](https://github.com/angular/angular/commit/c4e039a)), closes [#32539](https://github.com/angular/angular/issues/32539) [#31791](https://github.com/angular/angular/issues/31791)
* **ngcc:** resolve imports in `.d.ts` files for UMD/CommonJS bundles ([#32619](https://github.com/angular/angular/issues/32619)) ([3c7da76](https://github.com/angular/angular/commit/3c7da76)), closes [#31791](https://github.com/angular/angular/issues/31791)
* **ngcc:** support UMD global factory in comma lists ([#32709](https://github.com/angular/angular/issues/32709)) ([e5a3de5](https://github.com/angular/angular/commit/e5a3de5))
* **core:** improve the "missing `$localize`" error message ([#32491](https://github.com/angular/angular/issues/32491)) ([a9ff48e](https://github.com/angular/angular/commit/a9ff48e))
* **ivy:** capture template source mapping details during preanalysis ([#32544](https://github.com/angular/angular/issues/32544)) ([a64eded](https://github.com/angular/angular/commit/a64eded)), closes [#32538](https://github.com/angular/angular/issues/32538)
* **ivy:** handle expressions in i18n attributes properly ([#32309](https://github.com/angular/angular/issues/32309)) ([f00d033](https://github.com/angular/angular/commit/f00d033))
* **ivy:** i18n - do not generate jsdoc comments for `$localize` ([#32473](https://github.com/angular/angular/issues/32473)) ([a731119](https://github.com/angular/angular/commit/a731119))
* **ivy:** maintain coalesced listeners order ([#32484](https://github.com/angular/angular/issues/32484)) ([098feec](https://github.com/angular/angular/commit/098feec))
* **ivy:** match class and attribute value without case-sensitivity ([#32548](https://github.com/angular/angular/issues/32548)) ([ded5724](https://github.com/angular/angular/commit/ded5724))
* **ivy:** node placed in incorrect order inside ngFor with ng-container ([#32324](https://github.com/angular/angular/issues/32324)) ([da42a76](https://github.com/angular/angular/commit/da42a76))
* **ivy:** restore global state after running refreshView ([#32521](https://github.com/angular/angular/issues/32521)) ([a1beba4](https://github.com/angular/angular/commit/a1beba4))
* **ivy:** template compiler should render correct $localize placeholder names ([#32509](https://github.com/angular/angular/issues/32509)) ([ea6a2e9](https://github.com/angular/angular/commit/ea6a2e9))
* **ivy:** unable to bind to properties that start with class or style ([#32421](https://github.com/angular/angular/issues/32421)) ([62d92f8](https://github.com/angular/angular/commit/62d92f8)), closes [#32310](https://github.com/angular/angular/issues/32310)
* **ivy:** unable to override ComponentFactoryResolver provider in tests ([#32512](https://github.com/angular/angular/issues/32512)) ([2124588](https://github.com/angular/angular/commit/2124588))
* **ivy:** warn instead of throwing for unknown properties ([#32463](https://github.com/angular/angular/issues/32463)) ([bc061b7](https://github.com/angular/angular/commit/bc061b7))
* **language-service:** Return empty external files during project initialization ([#32519](https://github.com/angular/angular/issues/32519)) ([a65d3fa](https://github.com/angular/angular/commit/a65d3fa))
* **language-service:** Use module resolution cache ([#32479](https://github.com/angular/angular/issues/32479)) ([6052b12](https://github.com/angular/angular/commit/6052b12))
* **ngcc:** only back up the original `prepublishOnly` script and not the overwritten one ([#32427](https://github.com/angular/angular/issues/32427)) ([38359b1](https://github.com/angular/angular/commit/38359b1))
* **service-worker:** keep serving clients on older versions if latest is invalidated ([#31865](https://github.com/angular/angular/issues/31865)) ([bda2b4e](https://github.com/angular/angular/commit/bda2b4e))
* **ivy:** add missing closure extern for \$localize ([#32460](https://github.com/angular/angular/issues/32460)) ([e8f9ba4](https://github.com/angular/angular/commit/e8f9ba4))
* **ivy:** ensure binding ordering doesn't mess up when a `NO_CHANGE` value is encountered ([#32143](https://github.com/angular/angular/issues/32143)) ([7cc4225](https://github.com/angular/angular/commit/7cc4225))
* **ivy:** i18n - handle translated text containing HTML comments ([#32475](https://github.com/angular/angular/issues/32475)) ([5d8eb74](https://github.com/angular/angular/commit/5d8eb74))
* **ivy:** ngcc - improve the "ngcc version changed" error message ([#32396](https://github.com/angular/angular/issues/32396)) ([d5101df](https://github.com/angular/angular/commit/d5101df))
* **ivy:** Prevent errors when querying for elements outside Angular context ([#32361](https://github.com/angular/angular/issues/32361)) ([260217a](https://github.com/angular/angular/commit/260217a))
* **language-service:** Create DirectiveKind enum ([#32376](https://github.com/angular/angular/issues/32376)) ([852afb3](https://github.com/angular/angular/commit/852afb3))
* **language-service:** Invalidate Reflector caches when program changes ([#32357](https://github.com/angular/angular/issues/32357)) ([97fc45f](https://github.com/angular/angular/commit/97fc45f))
* update all files/directories owned by DevInfra to new DevInfra Framework team alias ([#32247](https://github.com/angular/angular/issues/32247)) ([3758978](https://github.com/angular/angular/commit/3758978))
* **language-service:** re-add regressed templateUrl tests ([#32438](https://github.com/angular/angular/issues/32438)) ([1ed3531](https://github.com/angular/angular/commit/1ed3531)), closes [#32378](https://github.com/angular/angular/issues/32378)
* **language-service:** Use ts.CompletionEntry for completions ([#32375](https://github.com/angular/angular/issues/32375)) ([f6e88cd](https://github.com/angular/angular/commit/f6e88cd))
* **ngcc:** handle compilation diagnostics ([#31996](https://github.com/angular/angular/issues/31996)) ([f7471ee](https://github.com/angular/angular/commit/f7471ee)), closes [#31977](https://github.com/angular/angular/issues/31977)
* **common:** HttpParams fromObject accepts ReadonlyArray<string> ([#31072](https://github.com/angular/angular/issues/31072)) ([f5bec3f](https://github.com/angular/angular/commit/f5bec3f)), closes [#28452](https://github.com/angular/angular/issues/28452)
* **ivy:** debug node names should match user declaration ([#32328](https://github.com/angular/angular/issues/32328)) ([14feb56](https://github.com/angular/angular/commit/14feb56))
* **ivy:** ngtsc throws if "flatModuleOutFile" is set to null ([#32235](https://github.com/angular/angular/issues/32235)) ([4f7c971](https://github.com/angular/angular/commit/4f7c971))
* **ivy:** reset binding index before executing a template in `refreshView` call ([#32201](https://github.com/angular/angular/issues/32201)) ([6b245a3](https://github.com/angular/angular/commit/6b245a3))
* **ngcc:** do not analyze dependencies for non Angular entry-points ([#32303](https://github.com/angular/angular/issues/32303)) ([e563d77](https://github.com/angular/angular/commit/e563d77)), closes [#32302](https://github.com/angular/angular/issues/32302)
* **bazel:** pin `[@microsoft](https://github.com/microsoft)/api-extractor` ([#32187](https://github.com/angular/angular/issues/32187)) ([5da5ca5](https://github.com/angular/angular/commit/5da5ca5))
* **common:** update $locationShim to notify onChange listeners before emitting AngularJS events ([#32037](https://github.com/angular/angular/issues/32037)) ([5064dc7](https://github.com/angular/angular/commit/5064dc7))
* **compiler:** return enableIvy true when using `readConfiguration` ([#32234](https://github.com/angular/angular/issues/32234)) ([424ab48](https://github.com/angular/angular/commit/424ab48))
* **ivy:** get name directly from nativeNode ([#32198](https://github.com/angular/angular/issues/32198)) ([3dbc4ab](https://github.com/angular/angular/commit/3dbc4ab))
* **ivy:** handle empty bindings in template type checker ([#31594](https://github.com/angular/angular/issues/31594)) ([0db1b5d](https://github.com/angular/angular/commit/0db1b5d)), closes [#30076](https://github.com/angular/angular/issues/30076) [#30929](https://github.com/angular/angular/issues/30929)
* **ivy:** in ngcc, handle inline exports in commonjs code ([#32129](https://github.com/angular/angular/issues/32129)) ([02bab8c](https://github.com/angular/angular/commit/02bab8c))
* **ivy:** ngcc should only index .d.ts exports within the package ([#32129](https://github.com/angular/angular/issues/32129)) ([964d726](https://github.com/angular/angular/commit/964d726))
* **ivy:** ngTemplateOutlet error when switching between null and template value ([#32160](https://github.com/angular/angular/issues/32160)) ([c2868de](https://github.com/angular/angular/commit/c2868de)), closes [#32060](https://github.com/angular/angular/issues/32060)
* **ivy:** run template type-checking for all components ([#31952](https://github.com/angular/angular/issues/31952)) ([bfc26bc](https://github.com/angular/angular/commit/bfc26bc))
* **language-service:** Instantiate MetadataResolver once ([#32145](https://github.com/angular/angular/issues/32145)) ([6a0b1d5](https://github.com/angular/angular/commit/6a0b1d5))
* **language-service:** Remove 'context' used for module resolution ([#32015](https://github.com/angular/angular/issues/32015)) ([a91ab15](https://github.com/angular/angular/commit/a91ab15))
* **ngcc:** handle deep imports that already have an extension ([#32181](https://github.com/angular/angular/issues/32181)) ([4bbf16e](https://github.com/angular/angular/commit/4bbf16e)), closes [#32097](https://github.com/angular/angular/issues/32097)
* **ngcc:** ignore format properties that exist but are undefined ([#32205](https://github.com/angular/angular/issues/32205)) ([f8b995d](https://github.com/angular/angular/commit/f8b995d)), closes [#32052](https://github.com/angular/angular/issues/32052) [#32188](https://github.com/angular/angular/issues/32188)
* **bazel:** disable treeshaking when generating FESM and UMD bundles ([#32069](https://github.com/angular/angular/issues/32069)) ([4f37487](https://github.com/angular/angular/commit/4f37487))
* **compiler:** do not remove whitespace wrapping i18n expansions ([#31962](https://github.com/angular/angular/issues/31962)) ([0ddf0c4](https://github.com/angular/angular/commit/0ddf0c4))
* **ivy:** reuse compilation scope for incremental template changes. ([#31932](https://github.com/angular/angular/issues/31932)) ([eb5412d](https://github.com/angular/angular/commit/eb5412d)), closes [#31654](https://github.com/angular/angular/issues/31654)
* **language-service:** getSourceFile() should only be called on TS files ([#31920](https://github.com/angular/angular/issues/31920)) ([e8b8f6d](https://github.com/angular/angular/commit/e8b8f6d))
* **language-service:** Make Definition and QuickInfo compatible with TS LS ([#31972](https://github.com/angular/angular/issues/31972)) ([a8e2ee1](https://github.com/angular/angular/commit/a8e2ee1))
* **upgrade:** compile downgraded components synchronously (if possible) ([#31840](https://github.com/angular/angular/issues/31840)) ([c1ae612](https://github.com/angular/angular/commit/c1ae612)), closes [#27217](https://github.com/angular/angular/issues/27217) [#30330](https://github.com/angular/angular/issues/30330)


### Code Refactoring

* **forms:** remove ngForm element selector ([#33058](https://github.com/angular/angular/issues/33058)) ([0b1daa9](https://github.com/angular/angular/commit/0b1daa9))
* **core:** remove deprecated Renderer ([#33019](https://github.com/angular/angular/issues/33019)) ([2265cb5](https://github.com/angular/angular/commit/2265cb5))
* **bazel:** remove [@angular](https://github.com/angular)/bazel protractor rule now provided by [@bazel](https://github.com/bazel)/protractor ([#32485](https://github.com/angular/angular/issues/32485)) ([9448828](https://github.com/angular/angular/commit/9448828))


### Features

* performance improvement for eventListeners ([#34613](https://github.com/angular/angular/issues/34613)) ([d21b7a4](https://github.com/angular/angular/commit/d21b7a4))
* **ngcc:** automatically clean outdated ngcc artifacts ([#35079](https://github.com/angular/angular/issues/35079)) ([ae0df83](https://github.com/angular/angular/commit/ae0df83)), closes [#35082](https://github.com/angular/angular/issues/35082)
* **ivy:** Change static priority resolution to be same level as directive it belongs to ([#34938](https://github.com/angular/angular/issues/34938)) ([19c4895](https://github.com/angular/angular/commit/19c4895))
* **language-service:** completions for output $event properties in ([#34570](https://github.com/angular/angular/issues/34570)) ([2a53727](https://github.com/angular/angular/commit/2a53727))
* **language-service:** provide completion for $event variable ([#34570](https://github.com/angular/angular/issues/34570)) ([c246787](https://github.com/angular/angular/commit/c246787))
* **language-service:** provide hover for microsyntax in structural directive ([#34847](https://github.com/angular/angular/issues/34847)) ([baf4a63](https://github.com/angular/angular/commit/baf4a63))
* **common:** allow default currency code to be configurable ([#34771](https://github.com/angular/angular/issues/34771)) ([965f557](https://github.com/angular/angular/commit/965f557)), closes [#25461](https://github.com/angular/angular/issues/25461)
* **ivy:** improve `ExpressionChangedAfterChecked` error message for attributes ([#34505](https://github.com/angular/angular/issues/34505)) ([d63572e](https://github.com/angular/angular/commit/d63572e))
* **language-service:** completions support for template reference variables ([#34363](https://github.com/angular/angular/issues/34363)) ([937d3fd](https://github.com/angular/angular/commit/937d3fd))
* i18n - include currency code in locale data ([#34771](https://github.com/angular/angular/issues/34771)) ([c18a3fe](https://github.com/angular/angular/commit/c18a3fe))
* **language-service:** provide completion for $event variable ([#34566](https://github.com/angular/angular/issues/34566)) ([fa39a8c](https://github.com/angular/angular/commit/fa39a8c))
* **language-service:** support hover/definitions for structural directive ([#34564](https://github.com/angular/angular/issues/34564)) ([fe19327](https://github.com/angular/angular/commit/fe19327))
* **compiler:** record end of expression Token ([#33549](https://github.com/angular/angular/issues/33549)) ([8a25cd4](https://github.com/angular/angular/commit/8a25cd4)), closes [#33477](https://github.com/angular/angular/issues/33477)
* **language-service:** Append symbol type to hover tooltip ([#34515](https://github.com/angular/angular/issues/34515)) ([381b895](https://github.com/angular/angular/commit/381b895))
* **language-service:** Show documentation on hover ([#34506](https://github.com/angular/angular/issues/34506)) ([1660095](https://github.com/angular/angular/commit/1660095))
* **forms:** expand NgModel disabled type to work with strict template type checking ([#34438](https://github.com/angular/angular/issues/34438)) ([b1d4c58](https://github.com/angular/angular/commit/b1d4c58))
* **ivy:** error in ivy when inheriting a ctor from an undecorated base ([#34460](https://github.com/angular/angular/issues/34460)) ([f563c7c](https://github.com/angular/angular/commit/f563c7c))
* **ivy:** throw compilation error when providing undecorated classes ([#34460](https://github.com/angular/angular/issues/34460)) ([0638e65](https://github.com/angular/angular/commit/0638e65))
* **language-service:** completions support for indexed types ([#34047](https://github.com/angular/angular/issues/34047)) ([8a565c8](https://github.com/angular/angular/commit/8a565c8)), closes [angular/vscode-ng-language-service#110](https://github.com/angular/vscode-ng-language-service/issues/110) [angular/vscode-ng-language-service#277](https://github.com/angular/vscode-ng-language-service/issues/277)
* **language-service:** completions support for tuple array ([#33928](https://github.com/angular/angular/issues/33928)) ([7faa9bb](https://github.com/angular/angular/commit/7faa9bb))
* **bazel:** update ng-add to use bazel v1.1.0 ([#33813](https://github.com/angular/angular/issues/33813)) ([b1d0a4f](https://github.com/angular/angular/commit/b1d0a4f))
* **core:** missing-injectable migration should migrate empty object literal providers ([#33709](https://github.com/angular/angular/issues/33709)) ([b7c012f](https://github.com/angular/angular/commit/b7c012f))
* **common:** support loading locales from a global ([#33523](https://github.com/angular/angular/issues/33523)) ([c5894e0](https://github.com/angular/angular/commit/c5894e0))
* **ivy:** graceful evaluation of unknown or invalid expressions ([#33453](https://github.com/angular/angular/issues/33453)) ([ce30888](https://github.com/angular/angular/commit/ce30888))
* **ivy:** implement unknown element detection in jit mode ([#33419](https://github.com/angular/angular/issues/33419)) ([c83f501](https://github.com/angular/angular/commit/c83f501))
* add a flag in bootstrap to enable coalesce event change detection to improve performance ([#30533](https://github.com/angular/angular/issues/30533)) ([44623a1](https://github.com/angular/angular/commit/44623a1))
* **bazel:** update [@bazel](https://github.com/bazel)/schematics to Bazel 1.0.0 ([#33476](https://github.com/angular/angular/issues/33476)) ([540d104](https://github.com/angular/angular/commit/540d104)), closes [/github.com/angular/angular/pull/33367#issuecomment-547643246](https://github.com/angular/angular/pull/33367/issues/issuecomment-547643246)
* **bazel:** update bazel-schematics to use Ivy and new rollup_bundle ([#33435](https://github.com/angular/angular/issues/33435)) ([bf913cc](https://github.com/angular/angular/commit/bf913cc))
* **ivy:** i18n - support inlining of XTB formatted translation files ([#33444](https://github.com/angular/angular/issues/33444)) ([2c623fd](https://github.com/angular/angular/commit/2c623fd))
* **language-service:** add support for text replacement ([#33091](https://github.com/angular/angular/issues/33091)) ([da4eb91](https://github.com/angular/angular/commit/da4eb91))
* **ivy:** add a runtime feature to copy cmp/dir definitions ([#33362](https://github.com/angular/angular/issues/33362)) ([818c514](https://github.com/angular/angular/commit/818c514))
* **ivy:** add flag to disable checking of text attributes ([#33365](https://github.com/angular/angular/issues/33365)) ([d8ce212](https://github.com/angular/angular/commit/d8ce212))
* **ivy:** allow the locale to be set via a global property ([#33314](https://github.com/angular/angular/issues/33314)) ([fde8363](https://github.com/angular/angular/commit/fde8363))
* **ivy:** i18n - inline current locale at compile-time ([#33314](https://github.com/angular/angular/issues/33314)) ([fb84ea7](https://github.com/angular/angular/commit/fb84ea7))
* **ivy:** input type coercion for template type-checking ([#33243](https://github.com/angular/angular/issues/33243)) ([f1269d9](https://github.com/angular/angular/commit/f1269d9))
* **ivy:** strictness flags for template type checking ([#33365](https://github.com/angular/angular/issues/33365)) ([0d9be22](https://github.com/angular/angular/commit/0d9be22))
* **ivy:** verify whether TypeScript version is supported ([#33377](https://github.com/angular/angular/issues/33377)) ([4aa51b7](https://github.com/angular/angular/commit/4aa51b7))
* **ngcc:** add a migration for undecorated child classes ([#33362](https://github.com/angular/angular/issues/33362)) ([b381497](https://github.com/angular/angular/commit/b381497))
* **ngcc:** enable migrations to apply schematics to libraries ([#33362](https://github.com/angular/angular/issues/33362)) ([6b26748](https://github.com/angular/angular/commit/6b26748))
* **ngcc:** migrate services that are missing `@Injectable()` ([#33362](https://github.com/angular/angular/issues/33362)) ([31b9492](https://github.com/angular/angular/commit/31b9492))
* **core:** add ModuleWithProviders generic type migration ([#33217](https://github.com/angular/angular/issues/33217)) ([56731f6](https://github.com/angular/angular/commit/56731f6))
* **ivy:** enable re-export of the compilation scope of NgModules privately ([#33177](https://github.com/angular/angular/issues/33177)) ([c4733c1](https://github.com/angular/angular/commit/c4733c1)), closes [#29361](https://github.com/angular/angular/issues/29361)
* **ivy:** give shim generation its own compiler options ([#33256](https://github.com/angular/angular/issues/33256)) ([d4db746](https://github.com/angular/angular/commit/d4db746))
* **ngcc:** enable private NgModule re-exports in ngcc on request ([#33177](https://github.com/angular/angular/issues/33177)) ([e030375](https://github.com/angular/angular/commit/e030375))
* add a flag in bootstrap to enable coalesce event change detection to improve performance ([#30533](https://github.com/angular/angular/issues/30533)) ([21c1e14](https://github.com/angular/angular/commit/21c1e14))
* **ivy:** improve debugging experience for styles/classes ([#33179](https://github.com/angular/angular/issues/33179)) ([724707c](https://github.com/angular/angular/commit/724707c))
* typescript 3.6 support ([#32946](https://github.com/angular/angular/issues/32946)) ([86e1e6c](https://github.com/angular/angular/commit/86e1e6c)), closes [#32380](https://github.com/angular/angular/issues/32380)
* **ivy:** type checking of event bindings ([#33125](https://github.com/angular/angular/issues/33125)) ([6958d11](https://github.com/angular/angular/commit/6958d11))
* **language-service:** add Angular pseudo elements into completions ([#31248](https://github.com/angular/angular/issues/31248)) ([7c64b8d](https://github.com/angular/angular/commit/7c64b8d))
* **ngcc:** support --async flag (defaults to true) ([#33192](https://github.com/angular/angular/issues/33192)) ([2196114](https://github.com/angular/angular/commit/2196114))
* **ngcc:** support ignoreMissingDependencies in ngcc config ([#33192](https://github.com/angular/angular/issues/33192)) ([4da2dda](https://github.com/angular/angular/commit/4da2dda))
* **compiler:** record absolute span of template expressions in parser ([#31897](https://github.com/angular/angular/issues/31897)) ([b04488d](https://github.com/angular/angular/commit/b04488d)), closes [#31898](https://github.com/angular/angular/issues/31898)
* **core:** add postinstall ngcc migration ([#32999](https://github.com/angular/angular/issues/32999)) ([30d25f6](https://github.com/angular/angular/commit/30d25f6))
* **ivy:** better error messages for unknown components ([#33064](https://github.com/angular/angular/issues/33064)) ([d8249d1](https://github.com/angular/angular/commit/d8249d1))
* **ivy:** check regular attributes that correspond with directive inputs ([#33066](https://github.com/angular/angular/issues/33066)) ([cd7b199](https://github.com/angular/angular/commit/cd7b199))
* **ivy:** disable strict null checks for input bindings ([#33066](https://github.com/angular/angular/issues/33066)) ([ece0b2d](https://github.com/angular/angular/commit/ece0b2d))
* **ivy:** i18n - support source locale inlining ([#33101](https://github.com/angular/angular/issues/33101)) ([f433d66](https://github.com/angular/angular/commit/f433d66))
* change tslib from direct dependency to peerDependency ([#32167](https://github.com/angular/angular/issues/32167)) ([e2d5bc2](https://github.com/angular/angular/commit/e2d5bc2))
* **language-service:** directive info when looking up attribute's symbol ([#33127](https://github.com/angular/angular/issues/33127)) ([ce7f934](https://github.com/angular/angular/commit/ce7f934))
* **language-service:** hover information for component NgModules ([#33118](https://github.com/angular/angular/issues/33118)) ([e409ed0](https://github.com/angular/angular/commit/e409ed0)), closes [#32565](https://github.com/angular/angular/issues/32565)
* **ngcc:** support fallback to a default configuration ([#33008](https://github.com/angular/angular/issues/33008)) ([9167624](https://github.com/angular/angular/commit/9167624))
* **ngcc:** support version ranges in project/default configurations ([#33008](https://github.com/angular/angular/issues/33008)) ([90007e9](https://github.com/angular/angular/commit/90007e9))
* **core:** default to dynamic queries ([#32720](https://github.com/angular/angular/issues/32720)) ([7806596](https://github.com/angular/angular/commit/7806596))
* **core:** make static query flag optional ([#32986](https://github.com/angular/angular/issues/32986)) ([900d005](https://github.com/angular/angular/commit/900d005)), closes [#32686](https://github.com/angular/angular/issues/32686)
* **forms:** formGroupName and formArrayName also accepts a number ([#32607](https://github.com/angular/angular/issues/32607)) ([fee28e2](https://github.com/angular/angular/commit/fee28e2))
* **ivy:** i18n - implement compile-time inlining ([#32881](https://github.com/angular/angular/issues/32881)) ([2cdb3a0](https://github.com/angular/angular/commit/2cdb3a0))
* **ivy:** i18n - render legacy message ids in `$localize` if requested ([#32937](https://github.com/angular/angular/issues/32937)) ([bcbf3e4](https://github.com/angular/angular/commit/bcbf3e4))
* **language-service:** module definitions on directive hover ([#32763](https://github.com/angular/angular/issues/32763)) ([0d186dd](https://github.com/angular/angular/commit/0d186dd)), closes [#32565](https://github.com/angular/angular/issues/32565)
* **ngcc:** expose `--create-ivy-entry-points` option on ivy-ngcc ([#33049](https://github.com/angular/angular/issues/33049)) ([b2b917d](https://github.com/angular/angular/commit/b2b917d)), closes [/github.com/angular/angular/pull/32999#issuecomment-539937368](https://github.com/angular/angular/pull/32999/issues/issuecomment-539937368)
* update rxjs peerDependencies minimum requirment to 6.5.3 ([#32812](https://github.com/angular/angular/issues/32812)) ([66658c4](https://github.com/angular/angular/commit/66658c4))
* **ivy:** support ng-add in localize package ([#32791](https://github.com/angular/angular/issues/32791)) ([e41cbfb](https://github.com/angular/angular/commit/e41cbfb))
* **language-service:** allow retreiving synchronized analyzed NgModules ([#32779](https://github.com/angular/angular/issues/32779)) ([98feee7](https://github.com/angular/angular/commit/98feee7))
* **service-worker:** remove deprecated `versionedFiles` option ([#32862](https://github.com/angular/angular/issues/32862)) ([5d5c94d](https://github.com/angular/angular/commit/5d5c94d))
* **language-service:** expose determining the NgModule of a Directive ([#32710](https://github.com/angular/angular/issues/32710)) ([2846505](https://github.com/angular/angular/commit/2846505)), closes [#32565](https://github.com/angular/angular/issues/32565)
* **bazel:** support ts_library targets as entry-points for ng_package ([#32610](https://github.com/angular/angular/issues/32610)) ([217db9b](https://github.com/angular/angular/commit/217db9b))
* **core:** add dynamic queries schematic ([#32231](https://github.com/angular/angular/issues/32231)) ([f5982fd](https://github.com/angular/angular/commit/f5982fd))
* **core:** Mark TestBed.get as deprecated ([#32406](https://github.com/angular/angular/issues/32406)) ([a85eccd](https://github.com/angular/angular/commit/a85eccd)), closes [#32200](https://github.com/angular/angular/issues/32200) [#26491](https://github.com/angular/angular/issues/26491)
* **ivy:** expose `window.ng.getDebugNode` helper ([#32727](https://github.com/angular/angular/issues/32727)) ([4726ac2](https://github.com/angular/angular/commit/4726ac2))
* **ivy:** i18n - add syntax support for `$localize` metadata block ([#32594](https://github.com/angular/angular/issues/32594)) ([c7abb7d](https://github.com/angular/angular/commit/c7abb7d))
* **ivy:** i18n - reorganize entry-points for better reuse ([#32488](https://github.com/angular/angular/issues/32488)) ([2bf5606](https://github.com/angular/angular/commit/2bf5606))
* **language-service:** enable logging on TypeScriptHost ([#32645](https://github.com/angular/angular/issues/32645)) ([e82f56b](https://github.com/angular/angular/commit/e82f56b))
* **language-service:** provide diagnostic for invalid templateUrls ([#32586](https://github.com/angular/angular/issues/32586)) ([adeee0f](https://github.com/angular/angular/commit/adeee0f)), closes [#32564](https://github.com/angular/angular/issues/32564)
* **language-service:** provide diagnostics for invalid styleUrls ([#32674](https://github.com/angular/angular/issues/32674)) ([4c168ed](https://github.com/angular/angular/commit/4c168ed)), closes [#32564](https://github.com/angular/angular/issues/32564)
* **language-service:** add definitions for styleUrls ([#32464](https://github.com/angular/angular/issues/32464)) ([a391aeb](https://github.com/angular/angular/commit/a391aeb))
* **language-service:** add script to rebuild, refresh Angular dist ([#32515](https://github.com/angular/angular/issues/32515)) ([1716b91](https://github.com/angular/angular/commit/1716b91))
* **service-worker:** recover from `EXISTING_CLIENTS_ONLY` mode when there is a valid update ([#31865](https://github.com/angular/angular/issues/31865)) ([094538c](https://github.com/angular/angular/commit/094538c)), closes [#31109](https://github.com/angular/angular/issues/31109)
* **bazel:** update to the latest `[@microsoft](https://github.com/microsoft)/api-extractor` ([#32185](https://github.com/angular/angular/issues/32185)) ([350ea47](https://github.com/angular/angular/commit/350ea47))
* **core:** Adds DI support for `providedIn: 'platform'|'any'` ([#32154](https://github.com/angular/angular/issues/32154)) ([77c382c](https://github.com/angular/angular/commit/77c382c))
* **core:** Introduce TestBed.inject to replace TestBed.get ([#32200](https://github.com/angular/angular/issues/32200)) ([3aba7eb](https://github.com/angular/angular/commit/3aba7eb)), closes [#26491](https://github.com/angular/angular/issues/26491) [#29905](https://github.com/angular/angular/issues/29905)
* **ivy:** implement `$localize()` global function ([#31609](https://github.com/angular/angular/issues/31609)) ([b21397b](https://github.com/angular/angular/commit/b21397b))
* **language-service:** add definitions for templateUrl ([#32238](https://github.com/angular/angular/issues/32238)) ([46caf88](https://github.com/angular/angular/commit/46caf88)), closes [angular/vscode-ng-language-service#111](https://github.com/angular/vscode-ng-language-service/issues/111)
* **core:** add undecorated classes with decorated fields schematic ([#32130](https://github.com/angular/angular/issues/32130)) ([904a201](https://github.com/angular/angular/commit/904a201))
* **ivy:** use the schema registry to check DOM bindings ([#32171](https://github.com/angular/angular/issues/32171)) ([0677cf0](https://github.com/angular/angular/commit/0677cf0))
* **core:** add undecorated classes migration schematic ([#31650](https://github.com/angular/angular/issues/31650)) ([024c31d](https://github.com/angular/angular/commit/024c31d))
* **forms:** formControlName also accepts a number ([#30606](https://github.com/angular/angular/issues/30606)) ([628b0c1](https://github.com/angular/angular/commit/628b0c1))
* **compiler:** allow selector-less directives as base classes in View Engine ([#31379](https://github.com/angular/angular/issues/31379)) ([4055150](https://github.com/angular/angular/commit/4055150))
* **ivy:** support selector-less directive as base classes in Ivy ([#32125](https://github.com/angular/angular/issues/32125)) ([cfed0c0](https://github.com/angular/angular/commit/cfed0c0)), closes [#31379](https://github.com/angular/angular/issues/31379)
* **ivy:** make the Ivy compiler the default for ngc ([#32219](https://github.com/angular/angular/issues/32219)) ([ec4381d](https://github.com/angular/angular/commit/ec4381d))
* **ivy:** convert all ngtsc diagnostics to ts.Diagnostics ([#31952](https://github.com/angular/angular/issues/31952)) ([0287b23](https://github.com/angular/angular/commit/0287b23))



### Performance Improvements

* **ivy:** remove unused argument in hostBindings function ([#34969](https://github.com/angular/angular/issues/34969)) ([71a3c72](https://github.com/angular/angular/commit/71a3c72))
* **ivy:** add more styling use-cases to benchmarks ([#34923](https://github.com/angular/angular/issues/34923)) ([ef70a89](https://github.com/angular/angular/commit/ef70a89))
* **ivy:** add create scenario to the styling benchmark ([#34775](https://github.com/angular/angular/issues/34775)) ([1ec9515](https://github.com/angular/angular/commit/1ec9515))
* **ivy:** add noop change detection scenario to the styling benchmark ([#34775](https://github.com/angular/angular/issues/34775)) ([4928f1a](https://github.com/angular/angular/commit/4928f1a))
* **ivy:** add static style to the list of scenarios ([#34775](https://github.com/angular/angular/issues/34775)) ([a15f20b](https://github.com/angular/angular/commit/a15f20b))
* **ivy:** styling algorithm benchmark ([#34664](https://github.com/angular/angular/issues/34664)) ([f8d4ce7](https://github.com/angular/angular/commit/f8d4ce7))
* **ivy:** support simple generic type constraints in local type ctors ([#34021](https://github.com/angular/angular/issues/34021)) ([88adc30](https://github.com/angular/angular/commit/88adc30))
* **compiler:** optimize cloning cursors state ([#34332](https://github.com/angular/angular/issues/34332)) ([5d871b5](https://github.com/angular/angular/commit/5d871b5))
* **compiler:** speed up i18n digest computations ([#34332](https://github.com/angular/angular/issues/34332)) ([adb0663](https://github.com/angular/angular/commit/adb0663))
* **compiler:** use a shared interpolation regex ([#34332](https://github.com/angular/angular/issues/34332)) ([940e62b](https://github.com/angular/angular/commit/940e62b))
* **ivy:** cache export scopes extracted from declaration files ([#34332](https://github.com/angular/angular/issues/34332)) ([eb9a8ac](https://github.com/angular/angular/commit/eb9a8ac))
* **ivy:** eagerly parse the template twice during analysis ([#34334](https://github.com/angular/angular/issues/34334)) ([fb4a11a](https://github.com/angular/angular/commit/fb4a11a))
* **ivy:** reuse prior analysis work during incremental builds ([#34288](https://github.com/angular/angular/issues/34288)) ([c387952](https://github.com/angular/angular/commit/c387952))
* **ivy:** share instances of `DomElementSchemaRegistry` ([#34332](https://github.com/angular/angular/issues/34332)) ([ce94192](https://github.com/angular/angular/commit/ce94192))
* **ivy:** use module resolution cache ([#34332](https://github.com/angular/angular/issues/34332)) ([82442c5](https://github.com/angular/angular/commit/82442c5))
* **ivy:** chain listener instructions ([#33720](https://github.com/angular/angular/issues/33720)) ([#34340](https://github.com/angular/angular/issues/34340)) ([d3ec306](https://github.com/angular/angular/commit/d3ec306))
* **ivy:** chain styling instructions ([#33837](https://github.com/angular/angular/issues/33837)) ([#34340](https://github.com/angular/angular/issues/34340)) ([c66fd06](https://github.com/angular/angular/commit/c66fd06))
* add js-web-frameworks benchmark ([#34034](https://github.com/angular/angular/issues/34034)) ([bf16b0e](https://github.com/angular/angular/commit/bf16b0e))
* **ivy:** avoid duplicate state lookup and default function parameters ([#34183](https://github.com/angular/angular/issues/34183)) ([00f7372](https://github.com/angular/angular/commit/00f7372))
* **ivy:** do no work if moving a `viewRef` to the same position ([#34052](https://github.com/angular/angular/issues/34052)) ([d228801](https://github.com/angular/angular/commit/d228801))
* **ivy:** fix creation time micro-benchmarks ([#34031](https://github.com/angular/angular/issues/34031)) ([457ac3a](https://github.com/angular/angular/commit/457ac3a))
* **ivy:** R3TestBed - Do not process NgModuleDefs that have already been processed ([#33863](https://github.com/angular/angular/issues/33863)) ([05a18cc](https://github.com/angular/angular/commit/05a18cc))
* **ivy:** add micro-benchmark focused on directive input update ([#33798](https://github.com/angular/angular/issues/33798)) ([edd624b](https://github.com/angular/angular/commit/edd624b))
* **ivy:** don't store public input names in two places ([#33798](https://github.com/angular/angular/issues/33798)) ([105616c](https://github.com/angular/angular/commit/105616c))
* **ivy:** extract template's instruction first create pass processing ([#33856](https://github.com/angular/angular/issues/33856)) ([01af94c](https://github.com/angular/angular/commit/01af94c))
* **ivy:** Improve performance of transplanted views ([#33702](https://github.com/angular/angular/issues/33702)) ([a16a57e](https://github.com/angular/angular/commit/a16a57e))
* **core:** Avoid unnecessary creating provider factory ([#33742](https://github.com/angular/angular/issues/33742)) ([c315881](https://github.com/angular/angular/commit/c315881))
* **ivy:** add new benchmark focused on template creation ([#33511](https://github.com/angular/angular/issues/33511)) ([df1bef3](https://github.com/angular/angular/commit/df1bef3))
* **ivy:** add ngIf-like directive to the ng_template benchmark ([#33595](https://github.com/angular/angular/issues/33595)) ([e89c2dd](https://github.com/angular/angular/commit/e89c2dd))
* **ivy:** avoid native node retrieval from LView ([#33511](https://github.com/angular/angular/issues/33511)) ([083d48e](https://github.com/angular/angular/commit/083d48e))
* **ivy:** avoid repeated native node retrieval and patching ([#33322](https://github.com/angular/angular/issues/33322)) ([41caafc](https://github.com/angular/angular/commit/41caafc))
* **ivy:** avoid repeated tNode.initialInputs reads ([#33322](https://github.com/angular/angular/issues/33322)) ([4452d6d](https://github.com/angular/angular/commit/4452d6d))
* **ivy:** move local references into consts array ([#33129](https://github.com/angular/angular/issues/33129)) ([66725b7](https://github.com/angular/angular/commit/66725b7)), closes [#32798](https://github.com/angular/angular/issues/32798)
* **ivy:** avoid generating selectors array for directives without a selector ([#33431](https://github.com/angular/angular/issues/33431)) ([c3e9356](https://github.com/angular/angular/commit/c3e9356))
* **ivy:** apply [style]/[class] bindings directly to style/className ([#33336](https://github.com/angular/angular/issues/33336)) ([dcdb433](https://github.com/angular/angular/commit/dcdb433))
* **ivy:** apply static styles/classes directly to an element's style/className properties ([#33364](https://github.com/angular/angular/issues/33364)) ([5607ad8](https://github.com/angular/angular/commit/5607ad8))
* **ivy:** improve styling performance ([#33326](https://github.com/angular/angular/issues/33326)) ([d40ee6a](https://github.com/angular/angular/commit/d40ee6a))
* **ivy:** avoid unnecessary i18n pass while processing a template ([#33284](https://github.com/angular/angular/issues/33284)) ([7f7dc7c](https://github.com/angular/angular/commit/7f7dc7c))
* **ivy:** initialise inputs from static attrs on the first template pass only ([#33195](https://github.com/angular/angular/issues/33195)) ([aef7dca](https://github.com/angular/angular/commit/aef7dca))
* **ivy:** limit global state read / write in host bindings ([#33195](https://github.com/angular/angular/issues/33195)) ([3e14c2d](https://github.com/angular/angular/commit/3e14c2d))
* **ivy:** guard host binding execution with a TNode flag ([#33102](https://github.com/angular/angular/issues/33102)) ([d4d0723](https://github.com/angular/angular/commit/d4d0723))
* **ivy:** introduce micro-benchmark for directive instantiation ([#33082](https://github.com/angular/angular/issues/33082)) ([22d4efb](https://github.com/angular/angular/commit/22d4efb))
* **ivy:** limit memory reads in getOrCreateNodeInjectorForNode ([#33102](https://github.com/angular/angular/issues/33102)) ([dcca80b](https://github.com/angular/angular/commit/dcca80b))
* **ivy:** speed up bindings when no directives are present ([#32919](https://github.com/angular/angular/issues/32919)) ([b2decf0](https://github.com/angular/angular/commit/b2decf0))
* **ivy:** stricter null checks in setInputsFromAttrs ([#33102](https://github.com/angular/angular/issues/33102)) ([b800b88](https://github.com/angular/angular/commit/b800b88))
* **ivy:** use instanceof operator to check for NodeInjectorFactory instances ([#33082](https://github.com/angular/angular/issues/33082)) ([8d111da](https://github.com/angular/angular/commit/8d111da))
* **ivy:** add static attributes to the element_text_create benchmark ([#32997](https://github.com/angular/angular/issues/32997)) ([affae99](https://github.com/angular/angular/commit/affae99))
* **ivy:** attempt rendering initial styling only if present ([#32979](https://github.com/angular/angular/issues/32979)) ([6004703](https://github.com/angular/angular/commit/6004703))
* **ivy:** avoid memory allocation in the isAnimationProp check ([#32997](https://github.com/angular/angular/issues/32997)) ([9f0c549](https://github.com/angular/angular/commit/9f0c549))
* **ivy:** increase number of created views in the element_text_create benchmark ([#32979](https://github.com/angular/angular/issues/32979)) ([8593d0d](https://github.com/angular/angular/commit/8593d0d))
* **ivy:** limit TNode.inputs reads on first template pass ([#32979](https://github.com/angular/angular/issues/32979)) ([e6881b5](https://github.com/angular/angular/commit/e6881b5))
* **ivy:** move attributes array into component def ([#32798](https://github.com/angular/angular/issues/32798)) ([d5b87d3](https://github.com/angular/angular/commit/d5b87d3))
* **language-service:** improve Language service performance ([#32098](https://github.com/angular/angular/issues/32098)) ([65297cd](https://github.com/angular/angular/commit/65297cd))
* **ivy:** avoid repeat global state accesses in i18n instructions ([#32916](https://github.com/angular/angular/issues/32916)) ([ffc34b3](https://github.com/angular/angular/commit/ffc34b3))
* **ivy:** remove extra SafeStyle detection code ([#32775](https://github.com/angular/angular/issues/32775)) ([52552b0](https://github.com/angular/angular/commit/52552b0))
* **ivy:** avoid megamorphic reads during property binding ([#32574](https://github.com/angular/angular/issues/32574)) ([fcdd068](https://github.com/angular/angular/commit/fcdd068))
* **ivy:** avoid repeated lview reads in pipe instructions ([#32633](https://github.com/angular/angular/issues/32633)) ([73cb581](https://github.com/angular/angular/commit/73cb581))
* **ivy:** avoid repeated LView reads in property instructions ([#32681](https://github.com/angular/angular/issues/32681)) ([e6ed4a2](https://github.com/angular/angular/commit/e6ed4a2))
* **ivy:** avoid unnecessary DOM reads in styling instructions ([#32716](https://github.com/angular/angular/issues/32716)) ([05e1b3b](https://github.com/angular/angular/commit/05e1b3b))
* **ivy:** binding update benchmark ([#32574](https://github.com/angular/angular/issues/32574)) ([ea378a9](https://github.com/angular/angular/commit/ea378a9))
* **ivy:** convert all node-based benchmark to use a testing harness ([#32699](https://github.com/angular/angular/issues/32699)) ([1748aeb](https://github.com/angular/angular/commit/1748aeb))
* **ivy:** guard listening to outputs with isDirectiveHost ([#32495](https://github.com/angular/angular/issues/32495)) ([527ce3b](https://github.com/angular/angular/commit/527ce3b))
* **ivy:** initialise TNode inputs / outputs on the first creation pass ([#32608](https://github.com/angular/angular/issues/32608)) ([ad178c5](https://github.com/angular/angular/commit/ad178c5))
* **ivy:** introduce benchmark for listeners registration ([#32495](https://github.com/angular/angular/issues/32495)) ([024765b](https://github.com/angular/angular/commit/024765b))
* **ivy:** limit TNode.outputs reads ([#32495](https://github.com/angular/angular/issues/32495)) ([51292e2](https://github.com/angular/angular/commit/51292e2))
* **ivy:** run the expandng rows benchmark with es2015 ([#32716](https://github.com/angular/angular/issues/32716)) ([3ace25f](https://github.com/angular/angular/commit/3ace25f))
* **language-service:** keep analyzedModules cache when source files don't change ([#32562](https://github.com/angular/angular/issues/32562)) ([4f03323](https://github.com/angular/angular/commit/4f03323))
* **ivy:** check for animation synthetic props in dev mode only ([#32578](https://github.com/angular/angular/issues/32578)) ([7280710](https://github.com/angular/angular/commit/7280710))
* **ivy:** introduce a node-based micro-benchmarks harness ([#32510](https://github.com/angular/angular/issues/32510)) ([2895edc](https://github.com/angular/angular/commit/2895edc))
* **ivy:** replace select instruction with advance ([#32516](https://github.com/angular/angular/issues/32516)) ([664e001](https://github.com/angular/angular/commit/664e001))
* **ivy:** run tree benchmark with bundles and ngDevMode off ([#32558](https://github.com/angular/angular/issues/32558)) ([c3a1ef2](https://github.com/angular/angular/commit/c3a1ef2))
* **ngcc:** process tasks in parallel in async mode ([#32427](https://github.com/angular/angular/issues/32427)) ([e36e6c8](https://github.com/angular/angular/commit/e36e6c8))
* **core:** Make `PlatformLocation` tree-shakable ([#32154](https://github.com/angular/angular/issues/32154)) ([1537791](https://github.com/angular/angular/commit/1537791))
* **ivy:** add a micro benchmark for map-based style and class bindings ([#32401](https://github.com/angular/angular/issues/32401)) ([ba5e07e](https://github.com/angular/angular/commit/ba5e07e))
* **ivy:** add a micro benchmark for style and class bindings ([#32401](https://github.com/angular/angular/issues/32401)) ([df8e675](https://github.com/angular/angular/commit/df8e675))
* **ivy:** add element and text creation benchmark ([#32342](https://github.com/angular/angular/issues/32342)) ([85864ed](https://github.com/angular/angular/commit/85864ed))
* **ivy:** guard directive-related operations with a TNode flag ([#32445](https://github.com/angular/angular/issues/32445)) ([641c5c1](https://github.com/angular/angular/commit/641c5c1))
* **ivy:** properly initialise global state in the element_text_create benchmark ([#32397](https://github.com/angular/angular/issues/32397)) ([8dc3f36](https://github.com/angular/angular/commit/8dc3f36))
* **ivy:** remove renderStringify calls for text nodes creation ([#32342](https://github.com/angular/angular/issues/32342)) ([a1e91b0](https://github.com/angular/angular/commit/a1e91b0))
* **ivy:** remove repeated memory read / write in addComponentLogic ([#32339](https://github.com/angular/angular/issues/32339)) ([581b837](https://github.com/angular/angular/commit/581b837))
* **ivy:** run registerPostOrderHooks in the first template pass only ([#32342](https://github.com/angular/angular/issues/32342)) ([fac066e](https://github.com/angular/angular/commit/fac066e))
* **ivy:** minimise writes to the lView[BINDING_INDEX] / binding root ([#32263](https://github.com/angular/angular/issues/32263)) ([e3422e0](https://github.com/angular/angular/commit/e3422e0))
* **ivy:** store binding metadata in the ngDevMode only ([#32317](https://github.com/angular/angular/issues/32317)) ([0874bf4](https://github.com/angular/angular/commit/0874bf4))
* **core:** make sanitization tree-shakable in Ivy mode ([#31934](https://github.com/angular/angular/issues/31934)) ([2e4d17f](https://github.com/angular/angular/commit/2e4d17f))
* **ivy:** auto-call select(0) for non-empty views only ([#32131](https://github.com/angular/angular/issues/32131)) ([4d549f6](https://github.com/angular/angular/commit/4d549f6))
* **ivy:** avoid first template pass checks during view creation ([#32120](https://github.com/angular/angular/issues/32120)) ([4c3b791](https://github.com/angular/angular/commit/4c3b791))
* **ivy:** avoid for-of loops at runtime ([#32157](https://github.com/angular/angular/issues/32157)) ([abb44f7](https://github.com/angular/angular/commit/abb44f7))
* **ivy:** improve NaN checks in change detection ([#32212](https://github.com/angular/angular/issues/32212)) ([53bfa7c](https://github.com/angular/angular/commit/53bfa7c))
* **ivy:** interpolation micro-benchmark ([#32104](https://github.com/angular/angular/issues/32104)) ([be665d8](https://github.com/angular/angular/commit/be665d8))
* **ivy:** noop change detection micro-benchmark ([#32104](https://github.com/angular/angular/issues/32104)) ([c422c72](https://github.com/angular/angular/commit/c422c72))
* don't create holey arrays ([#32155](https://github.com/angular/angular/issues/32155)) ([6477057](https://github.com/angular/angular/commit/6477057))
* **ivy:** read selected index only when need in prop bindings ([#32212](https://github.com/angular/angular/issues/32212)) ([53f33c1](https://github.com/angular/angular/commit/53f33c1))
* **ivy:** split hooks processing into init and check phases ([#32131](https://github.com/angular/angular/issues/32131)) ([1062960](https://github.com/angular/angular/commit/1062960))
* **ivy:** split view processing into render (create) and refresh (update) pass ([#32020](https://github.com/angular/angular/issues/32020)) ([b9dfe66](https://github.com/angular/angular/commit/b9dfe66))
* **ivy:** don't read global state when interpolated values don't change ([#32093](https://github.com/angular/angular/issues/32093)) ([6eb9c2f](https://github.com/angular/angular/commit/6eb9c2f))



### Reverts

* "fix(ivy): recompile component when template changes in ngc watch mode ([#33551](https://github.com/angular/angular/issues/33551))" ([#33661](https://github.com/angular/angular/issues/33661)) ([cb55f60](https://github.com/angular/angular/commit/cb55f60))
* fix(ivy): Only restore registered modules if user compiles modules with TestBed ([#32944](https://github.com/angular/angular/issues/32944)) ([#33663](https://github.com/angular/angular/issues/33663)) ([f8e9c1e](https://github.com/angular/angular/commit/f8e9c1e))
* fix(ivy): R3TestBed should clean up registered modules after each test ([#32872](https://github.com/angular/angular/issues/32872)) ([#33663](https://github.com/angular/angular/issues/33663)) ([7c4366d](https://github.com/angular/angular/commit/7c4366d))
* build: remove vendored Babel typings ([#33176](https://github.com/angular/angular/issues/33176)) ([#33215](https://github.com/angular/angular/issues/33215)) ([e9ee685](https://github.com/angular/angular/commit/e9ee685))
* build: update webdriver-manager to support latest Chrome ([#33216](https://github.com/angular/angular/issues/33216)) ([a914859](https://github.com/angular/angular/commit/a914859))
* build: use http caching on windows CI runs ([#33238](https://github.com/angular/angular/issues/33238)) ([#33254](https://github.com/angular/angular/issues/33254)) ([117ca7c](https://github.com/angular/angular/commit/117ca7c))
* feat: add a flag in bootstrap to enable coalesce event change detection to improve performance ([#30533](https://github.com/angular/angular/issues/30533)) ([#33230](https://github.com/angular/angular/issues/33230)) ([082aed6](https://github.com/angular/angular/commit/082aed6))
* docs: create Issue and Pull Request markdown doc, explaining automatic locking policy ([#32405](https://github.com/angular/angular/issues/32405)) ([43619fc](https://github.com/angular/angular/commit/43619fc))


### BREAKING CHANGES

* **i18n:** The CLDR data has been updated to v36.0.0, which may cause some localized data strings to change. For example, the space separator used in numbers in the `fr` locales changed from `\xa0` to `\u202f` ([c1bd3bc](https://github.com/angular/angular/commit/c1bd3bc))
* **bazel:** @angular/bazel ng_setup_workspace() is no longer needed and has been removed.
We assume you will fetch rules_nodejs in your WORKSPACE file, and no other dependencies remain here.
Simply remove any calls to this function and the corresponding load statement.
* typescript 3.4 and 3.5 are no longer supported, please update to typescript 3.6
* We no longer directly have a direct depedency on `tslib`. Instead it is now listed a `peerDependency`.

Users not using the CLI will need to manually install `tslib` via;
```
yarn add tslib
```
or
```
npm install tslib --save
```
* **forms:** * `<ngForm></ngForm>` can no longer be used as a selector. Use `<ng-form></ng-form>` instead.
* The `NgFormSelectorWarning` directive has been removed.
* `FormsModule.withConfig` has been removed. Use the `FormsModule` directly.
* **core:** The deprecated type `Renderer` has been removed. Use `Renderer2` instead.
* **core:** The deprecated type `RenderComponentType` has been removed. Use `RendererType2` instead.
* **core:** The deprecated type `RootRenderer` has been removed. Use `RendererFactory2` instead.
* **service-worker:** Remove deprecated option `versionedFiles` from service worker asset group configuration in `ngsw-config.json`

Before
```json
"assetGroups": [
  {
    "name": "test",
    "resources": {
      "versionedFiles": [
        "/**/*.txt"
      ]
    }
  }
]
```

After
```json
"assetGroups": [
  {
    "name": "test",
    "resources": {
      "files": [
        "/**/*.txt"
      ]
    }
  }
]
```
* **ivy:** Translations (loaded via the `loadTranslations()` function) must now use
`MessageId` for the translation key rather than the previous `SourceMessage`
string.
* **ivy:** To attach the `$localize` function to the global scope import from
`@angular/localize/init`. Previously it was `@angular/localize`. To access the `loadTranslations()` and `clearTranslations()` functions,
import from `@angular/localize`. Previously it was `@angular/localize/run_time`.
* **bazel:** Angular bazel users using protractor_web_test_suite from @angular/bazel npm package should now switch to the @bazel/protractor npm package.

This should impact very few users and the user's that are impacted have a very easy upgrade path to switch to fetching the protractor_web_test_suite rule via the @bazel/protractor npm package.
* **ivy:** This commit removes the public export of `hasBeenProcessed()`.

This was exported to be availble to the CLI integration but was never
used. The change to the function signature is a breaking change in itself
so we remove the function altogether to simplify and lower the public
API surface going forward.
* **core:** Injector.get now accepts abstract classes to return
type-safe values. Previous implementation returned `any` through the
deprecated implementation.
* Angular now compiles with Ivy by default ([#32219](https://github.com/angular/angular/issues/32219)) ([ec4381d](https://github.com/angular/angular/commit/ec4381d)).

If you aren't familiar with Ivy, read our [blog post about the Ivy preview](https://blog.angular.io/its-time-for-the-compatibility-opt-in-preview-of-ivy-38f3542a282f?gi=8bfeb44b05c) and see the list of changes [here](https://docs.google.com/document/d/1Dije0AsJ0PxL3NaeNPxpYDeapj30b_QC0xfeIvIIzgg/preview).

* **ivy:** make Hammer support tree-shakable. Previously, in Ivy applications, Hammer providers were included by default. With this commit, apps that want Hammer support must import `HammerModule`in their root module. ([#32203](https://github.com/angular/angular/issues/32203)) ([de8ebbd](https://github.com/angular/angular/commit/de8ebbd))


### DEPRECATIONS

* **core:** TestBed.get function is marked as deprecated, use TestBed.inject instead.


<a name="8.2.14"></a>
## [8.2.14](https://github.com/angular/angular/compare/8.2.13...8.2.14) (2019-11-13)


### Bug Fixes

* **bazel:** exclude [@angular](https://github.com/angular)/cli from metadata build ([b43ae44](https://github.com/angular/angular/commit/b43ae44)), closes [#33502](https://github.com/angular/angular/issues/33502)
* **service-worker:** ensure initialization before handling messages ([#32525](https://github.com/angular/angular/issues/32525)) ([2840670](https://github.com/angular/angular/commit/2840670)), closes [#25611](https://github.com/angular/angular/issues/25611)


<a name="8.2.13"></a>
## [8.2.13](https://github.com/angular/angular/compare/8.2.12...8.2.13) (2019-10-30)


### Bug Fixes

* **compiler:** i18n - ignore `alt-trans` tags in XLIFF 1.2 ([#33464](https://github.com/angular/angular/issues/33464)) ([f97c464](https://github.com/angular/angular/commit/f97c464)), closes [#33161](https://github.com/angular/angular/issues/33161)


<a name="8.2.12"></a>
## [8.2.12](https://github.com/angular/angular/compare/8.2.11...8.2.12) (2019-10-23)


### Bug Fixes

* **upgrade:** remove unused version export ([#33180](https://github.com/angular/angular/issues/33180)) ([37cbcfa](https://github.com/angular/angular/commit/37cbcfa))


<a name="8.2.11"></a>
## [8.2.11](https://github.com/angular/angular/compare/8.2.10...8.2.11) (2019-10-15)


### Bug Fixes

* **service-worker:** continue serving api requests on cache failure ([#33165](https://github.com/angular/angular/issues/33165)) ([a2716ac](https://github.com/angular/angular/commit/a2716ac)), closes [#32996](https://github.com/angular/angular/issues/32996) [#21412](https://github.com/angular/angular/issues/21412)


<a name="8.2.10"></a>
## [8.2.10](https://github.com/angular/angular/compare/8.2.9...8.2.10) (2019-10-09)

This release contains various API docs improvements.


<a name="8.2.9"></a>
## [8.2.9](https://github.com/angular/angular/compare/8.2.8...8.2.9) (2019-10-02)


### Bug Fixes

* **upgrade:** fix AngularJsUrlCodec to support Safari ([#32959](https://github.com/angular/angular/issues/32959)) ([57457fb](https://github.com/angular/angular/commit/57457fb))


<a name="8.2.8"></a>
## [8.2.8](https://github.com/angular/angular/compare/8.2.7...8.2.8) (2019-09-25)

This release contains various API docs improvements.


<a name="8.2.7"></a>
## [8.2.7](https://github.com/angular/angular/compare/8.2.6...8.2.7) (2019-09-18)


### Bug Fixes

* **bazel:** ng_package(data) should support non-text files ([#32721](https://github.com/angular/angular/issues/32721)) ([ba1ef6b](https://github.com/angular/angular/commit/ba1ef6b))
* **compiler-cli:** fix typo in diagnostic template info. ([#32684](https://github.com/angular/angular/issues/32684)) ([947c076](https://github.com/angular/angular/commit/947c076)), closes [#32662](https://github.com/angular/angular/issues/32662)
* **language-service:** cache module resolution ([#32483](https://github.com/angular/angular/issues/32483)) ([1c5b157](https://github.com/angular/angular/commit/1c5b157))


<a name="8.2.6"></a>
## [8.2.6](https://github.com/angular/angular/compare/8.2.5...8.2.6) (2019-09-11)

This release contains various API docs improvements.


<a name="8.2.5"></a>
## [8.2.5](https://github.com/angular/angular/compare/8.2.4...8.2.5) (2019-09-04)

This release contains various API docs improvements.



### Bug Fixes

* **common:** HttpParams fromObject accepts ReadonlyArray<string> ([#31072](https://github.com/angular/angular/issues/31072)) ([b3ea698](https://github.com/angular/angular/commit/b3ea698)), closes [#28452](https://github.com/angular/angular/issues/28452)


<a name="8.2.4"></a>
## [8.2.4](https://github.com/angular/angular/compare/8.2.3...8.2.4) (2019-08-28)

This release contains various API docs improvements.


<a name="8.2.3"></a>
## [8.2.3](https://github.com/angular/angular/compare/8.2.2...8.2.3) (2019-08-21)


### Bug Fixes

* **bazel:** pin `[@microsoft](https://github.com/microsoft)/api-extractor` ([#32187](https://github.com/angular/angular/issues/32187)) ([a7b9478](https://github.com/angular/angular/commit/a7b9478))


<a name="8.2.2"></a>
## [8.2.2](https://github.com/angular/angular/compare/8.2.1...8.2.2) (2019-08-12)


### Bug Fixes

* **bazel:** disable treeshaking when generating FESM and UMD bundles ([#32069](https://github.com/angular/angular/issues/32069)) ([3420d29](https://github.com/angular/angular/commit/3420d29))


<a name="8.2.1"></a>
## [8.2.1](https://github.com/angular/angular/compare/8.2.0...8.2.1) (2019-08-08)


### Bug Fixes

* **upgrade:** compile downgraded components synchronously (if possible) ([#31840](https://github.com/angular/angular/issues/31840)) ([04ebd59](https://github.com/angular/angular/commit/04ebd59)), closes [#27217](https://github.com/angular/angular/issues/27217) [#30330](https://github.com/angular/angular/issues/30330)


<a name="8.2.0"></a>
# [8.2.0](https://github.com/angular/angular/compare/8.2.0-rc.0...8.2.0) (2019-07-31)


### Features

* **core:** TypeScript 3.5 support ([#31615](https://github.com/angular/angular/issues/31615)) ([6ece7db](https://github.com/angular/angular/commit/6ece7db))
* **core:** add automatic migration from Renderer to Renderer2 ([#30936](https://github.com/angular/angular/issues/30936)) ([c095597](https://github.com/angular/angular/commit/c095597))
* **bazel:** compile targets used for indexing by Kythe with Ivy ([#31786](https://github.com/angular/angular/issues/31786)) ([82055b2](https://github.com/angular/angular/commit/82055b2))
* **upgrade:** support $element in upgraded component template/templateUrl functions ([#31637](https://github.com/angular/angular/issues/31637)) ([29e1c53](https://github.com/angular/angular/commit/29e1c53))
* **bazel:** allow passing a custom bazel compiler host to ngc compile ([#31341](https://github.com/angular/angular/issues/31341)) ([a29dc96](https://github.com/angular/angular/commit/a29dc96))
* **bazel:** allow passing and rewriting an old bazel host ([#31381](https://github.com/angular/angular/issues/31381)) ([11a208f](https://github.com/angular/angular/commit/11a208f)), closes [#31341](https://github.com/angular/angular/issues/31341)


### Performance Improvements

* **compiler:** avoid copying from prototype while cloning an object ([#31638](https://github.com/angular/angular/issues/31638)) ([24ca582](https://github.com/angular/angular/commit/24ca582)), closes [#31627](https://github.com/angular/angular/issues/31627)

### Bug Fixes

* **core:** DebugElement.listeners not cleared on destroy ([#31820](https://github.com/angular/angular/issues/31820)) ([46b160e](https://github.com/angular/angular/commit/46b160e))
 * **bazel:** increase memory limit of ngc under bazel from 2 to 4 GB ([#31784](https://github.com/angular/angular/issues/31784)) ([5a8eb92](https://github.com/angular/angular/commit/5a8eb92))
* **core:** allow Z variations of CSS transforms in sanitizer ([#29264](https://github.com/angular/angular/issues/29264)) ([78e7fdd](https://github.com/angular/angular/commit/78e7fdd))
* **elements:** handle falsy initial value ([#31604](https://github.com/angular/angular/issues/31604)) ([7151eae](https://github.com/angular/angular/commit/7151eae)), closes [angular/angular#30834](https://github.com/angular/angular/issues/30834)
* **platform-browser:** debug element query predicates not compatible with strictFunctionTypes ([#30993](https://github.com/angular/angular/issues/30993)) ([10a1e19](https://github.com/angular/angular/commit/10a1e19))
* use the correct WTF array to iterate over ([#31208](https://github.com/angular/angular/issues/31208)) ([9204de9](https://github.com/angular/angular/commit/9204de9))
* **bazel:** pass custom bazel compiler host rather than rewriting one ([#31496](https://github.com/angular/angular/issues/31496)) ([0c61a35](https://github.com/angular/angular/commit/0c61a35))
* **compiler-cli:** Return original sourceFile instead of redirected sourceFile from getSourceFile ([#26036](https://github.com/angular/angular/issues/26036)) ([3166cff](https://github.com/angular/angular/commit/3166cff)), closes [#22524](https://github.com/angular/angular/issues/22524)
* **language-service:** Eagarly initialize data members ([#31577](https://github.com/angular/angular/issues/31577)) ([0110de2](https://github.com/angular/angular/commit/0110de2))
* **bazel:** revert location of xi18n outputs to bazel-genfiles ([#31410](https://github.com/angular/angular/issues/31410)) ([1d3e227](https://github.com/angular/angular/commit/1d3e227))
* **compiler:** give ASTWithSource its own visit method ([#31347](https://github.com/angular/angular/issues/31347)) ([6aaca21](https://github.com/angular/angular/commit/6aaca21))
* **service-worker:** cache opaque responses in data groups with `freshness` strategy ([#30977](https://github.com/angular/angular/issues/30977)) ([d7be38f](https://github.com/angular/angular/commit/d7be38f)), closes [#30968](https://github.com/angular/angular/issues/30968)
* **service-worker:** cache opaque responses when requests exceeds timeout threshold ([#30977](https://github.com/angular/angular/issues/30977)) ([93abc35](https://github.com/angular/angular/commit/93abc35))



<a name="8.1.3"></a>
## [8.1.3](https://github.com/angular/angular/compare/8.1.2...8.1.3) (2019-07-26)


### Bug Fixes

* **elements:** handle falsy initial value ([#31604](https://github.com/angular/angular/issues/31604)) ([434b796](https://github.com/angular/angular/commit/434b796)), closes [angular/angular#30834](https://github.com/angular/angular/issues/30834)


### Performance Improvements

* **compiler:** avoid copying from prototype while cloning an object ([#31638](https://github.com/angular/angular/issues/31638)) ([1f3daa0](https://github.com/angular/angular/commit/1f3daa0)), closes [#31627](https://github.com/angular/angular/issues/31627)




<a name="8.1.2"></a>
## [8.1.2](https://github.com/angular/angular/compare/8.1.0...8.1.2) (2019-07-17)


### Bug Fixes

* use the correct WTF array to iterate over ([#31208](https://github.com/angular/angular/issues/31208)) ([4aed480](https://github.com/angular/angular/commit/4aed480))
* **compiler-cli:** Return original sourceFile instead of redirected sourceFile from getSourceFile ([#26036](https://github.com/angular/angular/issues/26036)) ([13dbb98](https://github.com/angular/angular/commit/13dbb98)), closes [#22524](https://github.com/angular/angular/issues/22524)


<a name="8.1.1"></a>
## [8.1.1](https://github.com/angular/angular/compare/8.1.0...8.1.1) (2019-07-10)


### Bug Fixes

* **core:** export provider interfaces that are part of the public API types ([#31377](https://github.com/angular/angular/issues/31377)) ([bebf089](https://github.com/angular/angular/commit/bebf089)), closes [/github.com/angular/angular/pull/31377#discussion_r299254408](https://github.com/angular/angular/pull/31377/issues/discussion_r299254408) [/github.com/angular/angular/blob/9e34670b2/packages/core/src/di/interface/provider.ts#L365-L366](https://github.com/angular/angular/blob/9e34670b2/packages/core/src/di/interface/provider.ts/issues/L365-L366) [/github.com/angular/angular/blob/9e34670b2/packages/core/src/di/interface/provider.ts#L283-L284](https://github.com/angular/angular/blob/9e34670b2/packages/core/src/di/interface/provider.ts/issues/L283-L284) [/github.com/angular/angular/blob/9e34670b2/packages/core/src/di/index.ts#L23](https://github.com/angular/angular/blob/9e34670b2/packages/core/src/di/index.ts/issues/L23)



<a name="8.1.0"></a>
# [8.1.0](https://github.com/angular/angular/compare/8.1.0-rc.0...8.1.0) (2019-07-02)


### Bug Fixes

* **core:** handle `undefined` meta in `injectArgs` ([#31333](https://github.com/angular/angular/issues/31333)) ([80ccd6c](https://github.com/angular/angular/commit/80ccd6c)), closes [CLI #14888](https://github.com/angular/angular-cli/issues/14888)
* **service-worker:** cache opaque responses in data groups with `freshness` strategy ([#30977](https://github.com/angular/angular/issues/30977)) ([b0c3453](https://github.com/angular/angular/commit/b0c3453)), closes [#30968](https://github.com/angular/angular/issues/30968)
* **service-worker:** cache opaque responses when requests exceeds timeout threshold ([#30977](https://github.com/angular/angular/issues/30977)) ([a9038ef](https://github.com/angular/angular/commit/a9038ef))



<a name="8.1.0-rc.0"></a>
# [8.1.0-rc.0](https://github.com/angular/angular/compare/8.1.0-next.3...8.1.0-rc.0) (2019-06-26)


### Bug Fixes

* **bazel:** exclude all angular schematics folders from metadata build ([#31237](https://github.com/angular/angular/issues/31237)) ([16717fa](https://github.com/angular/angular/commit/16717fa)), closes [#31235](https://github.com/angular/angular/issues/31235)
* **bazel:** remove unsupported Css pre-processors from ng new ([#31234](https://github.com/angular/angular/issues/31234)) ([e83667a](https://github.com/angular/angular/commit/e83667a)), closes [#31209](https://github.com/angular/angular/issues/31209)
* **bazel:** update ng new schema to match the current ng new schema of [@schematics](https://github.com/schematics)/angular ([#31234](https://github.com/angular/angular/issues/31234)) ([805fc86](https://github.com/angular/angular/commit/805fc86)), closes [#31233](https://github.com/angular/angular/issues/31233)
* **compiler:** fix Elements not making a new ParseSourceSpan ([#31190](https://github.com/angular/angular/issues/31190)) ([7035f22](https://github.com/angular/angular/commit/7035f22))
* **compiler:** stringify `Object.create(null)` tokens ([#16848](https://github.com/angular/angular/issues/16848)) ([5e53956](https://github.com/angular/angular/commit/5e53956))
* **service-worker:** registration failed on Safari ([#31140](https://github.com/angular/angular/issues/31140)) ([a5dd4ed](https://github.com/angular/angular/commit/a5dd4ed)), closes [#31061](https://github.com/angular/angular/issues/31061)


### Features

* **upgrade:** provide unit test helpers for wiring up injectors ([#16848](https://github.com/angular/angular/issues/16848)) ([3fb78aa](https://github.com/angular/angular/commit/3fb78aa))



<a name="8.0.3"></a>
## [8.0.3](https://github.com/angular/angular/compare/8.0.2...8.0.3) (2019-06-26)


### Bug Fixes

* **bazel:** exclude all angular schematics folders from metadata build ([#31237](https://github.com/angular/angular/issues/31237)) ([6bad2ca](https://github.com/angular/angular/commit/6bad2ca)), closes [#31235](https://github.com/angular/angular/issues/31235)
* **bazel:** remove unsupported Css pre-processors from ng new ([#31234](https://github.com/angular/angular/issues/31234)) ([980bcaf](https://github.com/angular/angular/commit/980bcaf)), closes [#31209](https://github.com/angular/angular/issues/31209)
* **bazel:** update ng new schema to match the current ng new schema of [@schematics](https://github.com/schematics)/angular ([#31234](https://github.com/angular/angular/issues/31234)) ([48f7f65](https://github.com/angular/angular/commit/48f7f65)), closes [#31233](https://github.com/angular/angular/issues/31233)
* **service-worker:** registration failed on Safari ([#31140](https://github.com/angular/angular/issues/31140)) ([f470e69](https://github.com/angular/angular/commit/f470e69)), closes [#31061](https://github.com/angular/angular/issues/31061)



<a name="8.1.0-next.3"></a>
# [8.1.0-next.3](https://github.com/angular/angular/compare/8.1.0-next.2...8.1.0-next.3) (2019-06-19)


### Bug Fixes

* **bazel:** builder workspace should use nodejs v10.16.0 ([#31088](https://github.com/angular/angular/issues/31088)) ([a1fc4de](https://github.com/angular/angular/commit/a1fc4de))
* **core:** temporarily remove [@deprecated](https://github.com/deprecated) jsdoc tag for a TextBedStatic.get overload ([#30714](https://github.com/angular/angular/issues/30714)) ([6bc9c78](https://github.com/angular/angular/commit/6bc9c78)), closes [#30514](https://github.com/angular/angular/issues/30514)
* **language-service:** Remove 'any' in getQuickInfoAtPosition ([#31014](https://github.com/angular/angular/issues/31014)) ([a4601ec](https://github.com/angular/angular/commit/a4601ec))



<a name="8.0.2"></a>
## [8.0.2](https://github.com/angular/angular/compare/8.0.1...8.0.2) (2019-06-19)


### Bug Fixes

* **bazel:** builder workspace should use nodejs v10.16.0 ([#31088](https://github.com/angular/angular/issues/31088)) ([c198dc6](https://github.com/angular/angular/commit/c198dc6))
* **core:** temporarily remove [@deprecated](https://github.com/deprecated) jsdoc tag for a TextBedStatic.get overload ([#30714](https://github.com/angular/angular/issues/30714)) ([0a7aebb](https://github.com/angular/angular/commit/0a7aebb)), closes [#30514](https://github.com/angular/angular/issues/30514)
* **language-service:** Remove 'any' in getQuickInfoAtPosition ([#31014](https://github.com/angular/angular/issues/31014)) ([7f21449](https://github.com/angular/angular/commit/7f21449))



<a name="8.1.0-next.2"></a>
# [8.1.0-next.2](https://github.com/angular/angular/compare/8.1.0-next.1...8.1.0-next.2) (2019-06-13)


### Bug Fixes

* **bazel:** do not modify tsconfig.json ([#30877](https://github.com/angular/angular/issues/30877)) ([b086676](https://github.com/angular/angular/commit/b086676))
* **bazel:** exclude components schematics from build ([#30825](https://github.com/angular/angular/issues/30825)) ([05a43ca](https://github.com/angular/angular/commit/05a43ca))
* **bazel:** Load global stylesheet in dev and prod ([#30879](https://github.com/angular/angular/issues/30879)) ([17bfedd](https://github.com/angular/angular/commit/17bfedd))
* **common:** expose the `HttpUploadProgressEvent` interface as public API ([#30852](https://github.com/angular/angular/issues/30852)) ([5c18f23](https://github.com/angular/angular/commit/5c18f23)), closes [#30814](https://github.com/angular/angular/issues/30814)
* **service-worker:** avoid uncaught rejection warning when registration fails ([#30876](https://github.com/angular/angular/issues/30876)) ([81c2a94](https://github.com/angular/angular/commit/81c2a94))



<a name="8.0.1"></a>
## [8.0.1](https://github.com/angular/angular/compare/8.0.0...8.0.1) (2019-06-13)


### Bug Fixes

* **bazel:** do not modify tsconfig.json ([#30984](https://github.com/angular/angular/issues/30984)) ([49307f0](https://github.com/angular/angular/commit/49307f0))
* **bazel:** Load global stylesheet in dev and prod ([#30879](https://github.com/angular/angular/issues/30879)) ([5a7bcd1](https://github.com/angular/angular/commit/5a7bcd1))
* **common:** expose the `HttpUploadProgressEvent` interface as public API ([#30852](https://github.com/angular/angular/issues/30852)) ([4e8614b](https://github.com/angular/angular/commit/4e8614b)), closes [#30814](https://github.com/angular/angular/issues/30814)
* **core:** TypeScript related migrations should cater for BOM ([#30719](https://github.com/angular/angular/issues/30719)) ([26e3615](https://github.com/angular/angular/commit/26e3615)), closes [/github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/src/tree/recorder.ts#L72](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/src/tree/recorder.ts/issues/L72) [#30713](https://github.com/angular/angular/issues/30713)
* **service-worker:** avoid uncaught rejection warning when registration fails ([#30876](https://github.com/angular/angular/issues/30876)) ([08c38a1](https://github.com/angular/angular/commit/08c38a1))



<a name="8.1.0-next.1"></a>
# [8.1.0-next.1](https://github.com/angular/angular/compare/8.1.0-beta.0...8.1.0-next.1) (2019-06-05)


### Bug Fixes

* **core:** TypeScript related migrations should cater for BOM ([#30719](https://github.com/angular/angular/issues/30719)) ([80394ce](https://github.com/angular/angular/commit/80394ce)), closes [/github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/src/tree/recorder.ts#L72](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/src/tree/recorder.ts/issues/L72) [#30713](https://github.com/angular/angular/issues/30713)



<a name="8.1.0-beta.0"></a>
# [8.1.0-beta.0](https://github.com/angular/angular/compare/8.0.0...8.1.0-beta.0) (2019-05-30)


### Bug Fixes

* **bazel:** allow ts_library interop with list-typed inputs ([#30600](https://github.com/angular/angular/issues/30600)) ([3125376](https://github.com/angular/angular/commit/3125376))
* **bazel:** Bump ibazel to 0.10.1 for windows fixes ([#30196](https://github.com/angular/angular/issues/30196)) ([1353bf0](https://github.com/angular/angular/commit/1353bf0))
* **bazel:** Directly spawn native Bazel binary ([#30306](https://github.com/angular/angular/issues/30306)) ([2a0f497](https://github.com/angular/angular/commit/2a0f497))
* **bazel:** Disable sandbox on Mac OS ([#30460](https://github.com/angular/angular/issues/30460)) ([b6b1aec](https://github.com/angular/angular/commit/b6b1aec))
* **bazel:** Exclude common/upgrade* in metadata.tsconfig.json ([#30133](https://github.com/angular/angular/issues/30133)) ([1f4c380](https://github.com/angular/angular/commit/1f4c380))
* **bazel:** ng test should run specific ts_web_test_suite ([#30526](https://github.com/angular/angular/issues/30526)) ([e688e02](https://github.com/angular/angular/commit/e688e02))
* **bazel:** pass correct arguments to http_server in Windows ([#30346](https://github.com/angular/angular/issues/30346)) ([3aff79c](https://github.com/angular/angular/commit/3aff79c)), closes [#29785](https://github.com/angular/angular/issues/29785)
* **bazel:** update peerDep ranges ([#30155](https://github.com/angular/angular/issues/30155)) ([4ae0ee8](https://github.com/angular/angular/commit/4ae0ee8))
* **bazel:** Use existing npm/yarn lock files ([#30438](https://github.com/angular/angular/issues/30438)) ([ff29ccc](https://github.com/angular/angular/commit/ff29ccc))
* **compiler-cli:** log ngcc skipping messages as debug instead of info ([#30232](https://github.com/angular/angular/issues/30232)) ([60a8888](https://github.com/angular/angular/commit/60a8888))
* **core:** consistently use ng:/// for sourcemap URLs ([#29826](https://github.com/angular/angular/issues/29826)) ([392473e](https://github.com/angular/angular/commit/392473e))
* **core:** CSS sanitizer now allows parens in file names ([#30322](https://github.com/angular/angular/issues/30322)) ([728db88](https://github.com/angular/angular/commit/728db88))
* **core:** fix interpolate identifier in AOT ([#30243](https://github.com/angular/angular/issues/30243)) ([30d1f29](https://github.com/angular/angular/commit/30d1f29))
* **core:** migrations not always migrating all files ([#30269](https://github.com/angular/angular/issues/30269)) ([349935a](https://github.com/angular/angular/commit/349935a))
* **core:** remove deprecated `TestBed.deprecatedOverrideProvider` API ([#30576](https://github.com/angular/angular/issues/30576)) ([a96976e](https://github.com/angular/angular/commit/a96976e))
* **core:** require 'static' flag on queries in typings ([#30639](https://github.com/angular/angular/issues/30639)) ([84dd267](https://github.com/angular/angular/commit/84dd267))
* **core:** static-query migration errors not printed properly ([#30458](https://github.com/angular/angular/issues/30458)) ([6ceb903](https://github.com/angular/angular/commit/6ceb903))
* **core:** static-query migration fails with default parameter values ([#30269](https://github.com/angular/angular/issues/30269)) ([6357d4a](https://github.com/angular/angular/commit/6357d4a))
* **core:** static-query migration should gracefully exit if AOT compiler throws ([#30269](https://github.com/angular/angular/issues/30269)) ([509352f](https://github.com/angular/angular/commit/509352f))
* **core:** static-query migration should handle queries on accessors ([#30327](https://github.com/angular/angular/issues/30327)) ([0ffdb48](https://github.com/angular/angular/commit/0ffdb48))
* **core:** static-query migration should not fallback to test strategy ([#30458](https://github.com/angular/angular/issues/30458)) ([0cdf598](https://github.com/angular/angular/commit/0cdf598))
* **core:** static-query migration should not prompt if no queries are used ([#30254](https://github.com/angular/angular/issues/30254)) ([4c12d74](https://github.com/angular/angular/commit/4c12d74))
* **core:** static-query usage migration strategy should detect ambiguous query usage ([#30215](https://github.com/angular/angular/issues/30215)) ([8d3365e](https://github.com/angular/angular/commit/8d3365e))
* **core:** temporarily remove [@deprecated](https://github.com/deprecated) jsdoc tag for a TextBed.get overload ([#30514](https://github.com/angular/angular/issues/30514)) ([f6bf892](https://github.com/angular/angular/commit/f6bf892)), closes [#29290](https://github.com/angular/angular/issues/29290) [#29905](https://github.com/angular/angular/issues/29905)
* **language-service:** Remove tsserverlibrary from rollup globals ([#30123](https://github.com/angular/angular/issues/30123)) ([124e497](https://github.com/angular/angular/commit/124e497))
* **router:** ensure `history.state` is set in `eager` update mode ([#30154](https://github.com/angular/angular/issues/30154)) ([b40f6f3](https://github.com/angular/angular/commit/b40f6f3))
* **router:** ensure navigations start with the current URL value incase redirect is skipped ([#30344](https://github.com/angular/angular/issues/30344)) ([0fd9d08](https://github.com/angular/angular/commit/0fd9d08)), closes [#30340](https://github.com/angular/angular/issues/30340) [#30160](https://github.com/angular/angular/issues/30160)
* **router:** fix a problem with router not responding to back button ([#30160](https://github.com/angular/angular/issues/30160)) ([3327bd8](https://github.com/angular/angular/commit/3327bd8))
* **router:** IE 11 bug can break URL unification when comparing objects ([#30393](https://github.com/angular/angular/issues/30393)) ([197584d](https://github.com/angular/angular/commit/197584d))
* **router:** type cast correctly for IE 11 bug breaking URL Unification when comparing objects ([#30464](https://github.com/angular/angular/issues/30464)) ([53f3564](https://github.com/angular/angular/commit/53f3564))


### Features

* **bazel:** use `rbe_autoconfig()` and new container. ([#29336](https://github.com/angular/angular/issues/29336)) ([9abf114](https://github.com/angular/angular/commit/9abf114))
* **common:** add ability to watch for AngularJS URL updates through `onUrlChange` hook ([#30466](https://github.com/angular/angular/issues/30466)) ([1aff524](https://github.com/angular/angular/commit/1aff524))
* **common:** stricter types for `SlicePipe` ([#30156](https://github.com/angular/angular/issues/30156)) ([95830ee](https://github.com/angular/angular/commit/95830ee))
* **core:** deprecate integration with the Web Tracing Framework (WTF) ([#30642](https://github.com/angular/angular/issues/30642)) ([f310a59](https://github.com/angular/angular/commit/f310a59))
* **language-service:** Implement `definitionAndBoundSpan` ([#30125](https://github.com/angular/angular/issues/30125)) ([f491673](https://github.com/angular/angular/commit/f491673))
* **platform-webworker:** deprecate platform-webworker ([#30642](https://github.com/angular/angular/issues/30642)) ([ccc76f7](https://github.com/angular/angular/commit/ccc76f7))



<a name="8.0.0"></a>
# [8.0.0](https://github.com/angular/angular/compare/7.2.0...8.0.0) (2019-05-28)

[Blog post "Version 8 of Angular — Smaller bundles, CLI APIs, and alignment with the ecosystem"](https://blog.angular.io/version-8-of-angular-smaller-bundles-cli-apis-and-alignment-with-the-ecosystem-af0261112a27).


### Release Highlights & Update instructions
To learn about the release highlights and our CLI-powered automated update workflow for your projects please check out the [v8 release announcement](https://blog.angular.io/version-8-of-angular-smaller-bundles-cli-apis-and-alignment-with-the-ecosystem-af0261112a27).

### Features

* add support for TypeScript 3.4 (and drop older versions) ([#29372](https://github.com/angular/angular/issues/29372)) ([ef85336](https://github.com/angular/angular/commit/ef85336))
* **common:** stricter types for `SlicePipe` ([#30156](https://github.com/angular/angular/issues/30156)) ([722b2fa](https://github.com/angular/angular/commit/722b2fa))
* **bazel:** use `rbe_autoconfig()` and new container ([#29336](https://github.com/angular/angular/issues/29336)) ([e562acc](https://github.com/angular/angular/commit/e562acc))
* **common:** add @angular/common/upgrade package for `$location`-related APIs ([#30055](https://github.com/angular/angular/issues/30055)) ([152d99e](https://github.com/angular/angular/commit/152d99e))
* **common:** add ability to retrieve the state from `Location` service ([#30055](https://github.com/angular/angular/issues/30055)) ([b44b143](https://github.com/angular/angular/commit/b44b143))
* **common:** add ability to track all location changes ([#30055](https://github.com/angular/angular/issues/30055)) ([3a9cf3f](https://github.com/angular/angular/commit/3a9cf3f))
* **common:** add APIs to read component pieces of URL ([#30055](https://github.com/angular/angular/issues/30055)) ([b635fe8](https://github.com/angular/angular/commit/b635fe8))
* **common:** add `MockPlatformLocation` to enable more robust testing of `Location` services ([#30055](https://github.com/angular/angular/issues/30055)) ([d0672c2](https://github.com/angular/angular/commit/d0672c2))
* **common:** add `UrlCodec` type for use with upgrade applications ([#30055](https://github.com/angular/angular/issues/30055)) ([ec455e1](https://github.com/angular/angular/commit/ec455e1))
* **common:** provide replacement for AngularJS $location service ([#30055](https://github.com/angular/angular/issues/30055)) ([4277600](https://github.com/angular/angular/commit/4277600))
* remove deprecated `DOCUMENT` token from platform-browser ([#28117](https://github.com/angular/angular/issues/28117)) ([3a9d247](https://github.com/angular/angular/commit/3a9d247))
* **compiler:** support skipping leading trivia in template source-maps ([#30095](https://github.com/angular/angular/issues/30095)) ([304a12f](https://github.com/angular/angular/commit/304a12f))
* **core:** add missing ARIA attributes to html sanitizer ([#29685](https://github.com/angular/angular/issues/29685)) ([909557d](https://github.com/angular/angular/commit/909557d)), closes [#26815](https://github.com/angular/angular/issues/26815)
* **router:** deprecate loadChildren:string ([#30073](https://github.com/angular/angular/issues/30073)) ([c61df39](https://github.com/angular/angular/commit/c61df39))
* **service-worker:** allow configuring when the SW is registered ([#21842](https://github.com/angular/angular/issues/21842)) ([4cfba58](https://github.com/angular/angular/commit/4cfba58)), closes [#20970](https://github.com/angular/angular/issues/20970)
* **service-worker:** expose `SwRegistrationOptions` token to allow runtime config ([#21842](https://github.com/angular/angular/issues/21842)) ([39c0152](https://github.com/angular/angular/commit/39c0152))
* **service-worker:** support bypassing SW with specific header/query param ([#30010](https://github.com/angular/angular/issues/30010)) ([6200732](https://github.com/angular/angular/commit/6200732)), closes [#21191](https://github.com/angular/angular/issues/21191)
* **compiler-cli:** export tooling definitions ([#29929](https://github.com/angular/angular/issues/29929)) ([e1f51ea](https://github.com/angular/angular/commit/e1f51ea))
* **compiler-cli:** lower some exported expressions ([#30038](https://github.com/angular/angular/issues/30038)) ([8e73f9b](https://github.com/angular/angular/commit/8e73f9b))
* **core:** add schematics to move deprecated `DOCUMENT` import ([#29950](https://github.com/angular/angular/issues/29950)) ([645e305](https://github.com/angular/angular/commit/645e305))
* **bazel:** update the build to use the new architect api ([#29720](https://github.com/angular/angular/issues/29720)) ([902a53a](https://github.com/angular/angular/commit/902a53a))
* remove @angular/http dependency from @angular/platform-server ([#29408](https://github.com/angular/angular/issues/29408)) ([9745f55](https://github.com/angular/angular/commit/9745f55))
* **compiler-cli:** ngcc - make logging more configurable ([#29591](https://github.com/angular/angular/issues/29591)) ([8d3d75e](https://github.com/angular/angular/commit/8d3d75e))
* **core:** Add `AbstractType<T>` interface ([#29295](https://github.com/angular/angular/issues/29295)) ([afd4a4e](https://github.com/angular/angular/commit/afd4a4e)), closes [#26491](https://github.com/angular/angular/issues/26491)
* **core:** template-var-assignment update schematic ([#29608](https://github.com/angular/angular/issues/29608)) ([7c8f4e3](https://github.com/angular/angular/commit/7c8f4e3))
* **bazel:** Upgrade rules_nodejs and rules_sass ([#29388](https://github.com/angular/angular/issues/29388)) ([d6d081e](https://github.com/angular/angular/commit/d6d081e))
* **service-worker:** support multiple apps on different subpaths of a domain ([#27080](https://github.com/angular/angular/issues/27080)) ([e721c08](https://github.com/angular/angular/commit/e721c08)), closes [#21388](https://github.com/angular/angular/issues/21388)
* **bazel:** Eject Bazel ([#29167](https://github.com/angular/angular/issues/29167)) ([36a1550](https://github.com/angular/angular/commit/36a1550))
* **bazel:** Hide Bazel files in Bazel builder ([#29110](https://github.com/angular/angular/issues/29110)) ([7060d90](https://github.com/angular/angular/commit/7060d90))
* **forms:** clear (remove all) components from a FormArray ([#28918](https://github.com/angular/angular/issues/28918)) ([a68b1a1](https://github.com/angular/angular/commit/a68b1a1)), closes [#18531](https://github.com/angular/angular/issues/18531)
* **platform-server:** wait on returned `BEFORE_APP_SERIALIZED` promises ([#29120](https://github.com/angular/angular/issues/29120)) ([7102ea8](https://github.com/angular/angular/commit/7102ea8))
* **common:** add ability to watch for AngularJS URL updates through `onUrlChange` hook ([#30466](https://github.com/angular/angular/issues/30466)) ([8022d36](https://github.com/angular/angular/commit/8022d36))
* **common:** stricter types for SlicePipe ([#30156](https://github.com/angular/angular/issues/30156)) ([722b2fa](https://github.com/angular/angular/commit/722b2fa))
* add support for TypeScript 3.3 (and drop older versions) ([#29004](https://github.com/angular/angular/issues/29004)) ([75748d6](https://github.com/angular/angular/commit/75748d6))
* **core:** update schematic to migrate to explicit query timing ([#28983](https://github.com/angular/angular/issues/28983)) ([6215799](https://github.com/angular/angular/commit/6215799))
* **service-worker:** add JSON schema for service worker config ([#27859](https://github.com/angular/angular/issues/27859)) ([3bee0f6](https://github.com/angular/angular/commit/3bee0f6)), closes [#19847](https://github.com/angular/angular/issues/19847)
* **bazel:** add ts_config extending support for ng_module ([#21883](https://github.com/angular/angular/issues/21883)) ([edb6c2d](https://github.com/angular/angular/commit/edb6c2d))
* upgrade domino to v2.1.2 ([#28767](https://github.com/angular/angular/issues/28767)) ([fdca001](https://github.com/angular/angular/commit/fdca001))
* **compiler-cli:** make enableIvy ngtsc/true equivalent ([#28616](https://github.com/angular/angular/issues/28616)) ([1923c2f](https://github.com/angular/angular/commit/1923c2f))
* **core:** allow users to define timing of ViewChild/ContentChild queries ([#28810](https://github.com/angular/angular/issues/28810)) ([19afb79](https://github.com/angular/angular/commit/19afb79))
* **router:** add hash-based navigation option to setUpLocationSync ([#28609](https://github.com/angular/angular/issues/28609)) ([71d0eeb](https://github.com/angular/angular/commit/71d0eeb)), closes [#24429](https://github.com/angular/angular/issues/24429) [#21995](https://github.com/angular/angular/issues/21995)
* optionally save complete performance log in chrome benchpress tests ([#27551](https://github.com/angular/angular/issues/27551)) ([d42f32c](https://github.com/angular/angular/commit/d42f32c))
* **bazel:** add dts bundler as action to ng_module ([#28588](https://github.com/angular/angular/issues/28588)) ([3d39100](https://github.com/angular/angular/commit/3d39100))
* **compiler:** support tokenizing a sub-section of an input string ([#28055](https://github.com/angular/angular/issues/28055)) ([eeb560a](https://github.com/angular/angular/commit/eeb560a))
* **compiler:** support tokenizing escaped strings ([#28055](https://github.com/angular/angular/issues/28055)) ([2424184](https://github.com/angular/angular/commit/2424184))
* **compiler-cli:** no longer re-export external symbols by default ([#28633](https://github.com/angular/angular/issues/28633)) ([91b7152](https://github.com/angular/angular/commit/91b7152)), closes [#28594](https://github.com/angular/angular/issues/28594) [#25644](https://github.com/angular/angular/issues/25644) [#25644](https://github.com/angular/angular/issues/25644)
* **compiler-cli:** expose ngtsc as a TscPlugin ([#28435](https://github.com/angular/angular/issues/28435)) ([a227c52](https://github.com/angular/angular/commit/a227c52))
* **bazel:** Add support for SASS ([#28167](https://github.com/angular/angular/issues/28167)) ([f59f18c](https://github.com/angular/angular/commit/f59f18c))
* **compiler-cli:** resolve generated Sass/Less files to .css inputs ([#28166](https://github.com/angular/angular/issues/28166)) ([a58fd21](https://github.com/angular/angular/commit/a58fd21))
* **forms:** add `markAllAsTouched()` to `AbstractControl` ([#26812](https://github.com/angular/angular/issues/26812)) ([45bf911](https://github.com/angular/angular/commit/45bf911)), closes [#19400](https://github.com/angular/angular/issues/19400)
* **forms:** export NumberValueAccessor & RangeValueAccessor directives ([#27743](https://github.com/angular/angular/issues/27743)) ([ac15717](https://github.com/angular/angular/commit/ac15717))


### Bug Fixes

* **bazel:** allow `ts_library` interop with list-typed inputs ([#30600](https://github.com/angular/angular/issues/30600)) ([bf38df4](https://github.com/angular/angular/commit/bf38df4))
* **bazel:** Disable sandbox on Mac OS ([#30460](https://github.com/angular/angular/issues/30460)) ([3de26a8](https://github.com/angular/angular/commit/3de26a8))
* **bazel:** ng test should run specific ts_web_test_suite ([#30526](https://github.com/angular/angular/issues/30526)) ([8bc4da8](https://github.com/angular/angular/commit/8bc4da8))
* **core:** remove deprecated `TestBed.deprecatedOverrideProvider` API ([#30576](https://github.com/angular/angular/issues/30576)) ([5a46f94](https://github.com/angular/angular/commit/5a46f94))
* **core:** require 'static' flag on queries in typings ([#30641](https://github.com/angular/angular/issues/30641)) ([c8af830](https://github.com/angular/angular/commit/c8af830))
* **core:** temporarily remove [@deprecated](https://github.com/deprecated) jsdoc tag for a `TextBed.get` overload ([#30514](https://github.com/angular/angular/issues/30514)) ([561e01d](https://github.com/angular/angular/commit/561e01d)), closes [#29290](https://github.com/angular/angular/issues/29290) [#29905](https://github.com/angular/angular/issues/29905)
* **router:** type cast correctly for IE 11 bug breaking URL Unification when comparing objects ([#30464](https://github.com/angular/angular/issues/30464)) ([32daa93](https://github.com/angular/angular/commit/32daa93))
* **bazel:** Directly spawn native Bazel binary ([#30306](https://github.com/angular/angular/issues/30306)) ([d1fcc2b](https://github.com/angular/angular/commit/d1fcc2b))
* **bazel:** pass correct arguments to http_server in Windows ([#30346](https://github.com/angular/angular/issues/30346)) ([71eba45](https://github.com/angular/angular/commit/71eba45)), closes [#29785](https://github.com/angular/angular/issues/29785)
* **bazel:** Use existing npm/yarn lock files ([#30438](https://github.com/angular/angular/issues/30438)) ([3136d9f](https://github.com/angular/angular/commit/3136d9f))
* **compiler:** ensure strict mode when evaluating in JIT ([#30122](https://github.com/angular/angular/issues/30122)) ([192f108](https://github.com/angular/angular/commit/192f108))
* **core:** migrations not always migrating all files ([#30269](https://github.com/angular/angular/issues/30269)) ([e8ceae1](https://github.com/angular/angular/commit/e8ceae1))
* **core:** static-query migration errors not printed properly ([#30458](https://github.com/angular/angular/issues/30458)) ([fde3f46](https://github.com/angular/angular/commit/fde3f46))
* **core:** static-query migration fails with default parameter values ([#30269](https://github.com/angular/angular/issues/30269)) ([c3246e6](https://github.com/angular/angular/commit/c3246e6))
* **core:** static-query migration should gracefully exit if AOT compiler throws ([#30269](https://github.com/angular/angular/issues/30269)) ([a71d8a8](https://github.com/angular/angular/commit/a71d8a8))
* **core:** static-query migration should handle queries on accessors ([#30327](https://github.com/angular/angular/issues/30327)) ([dd299f9](https://github.com/angular/angular/commit/dd299f9))
* **core:** static-query migration should not fallback to test strategy ([#30458](https://github.com/angular/angular/issues/30458)) ([0fa48e8](https://github.com/angular/angular/commit/0fa48e8))
* **core:** static-query migration should not prompt if no queries are used ([#30254](https://github.com/angular/angular/issues/30254)) ([12fb639](https://github.com/angular/angular/commit/12fb639))
* **core:** static-query usage migration strategy should detect ambiguous query usage ([#30215](https://github.com/angular/angular/issues/30215)) ([e295c6a](https://github.com/angular/angular/commit/e295c6a))
* **router:** ensure navigations start with the current URL value incase redirect is skipped ([#30344](https://github.com/angular/angular/issues/30344)) ([9b88920](https://github.com/angular/angular/commit/9b88920)), closes [#30340](https://github.com/angular/angular/issues/30340) [#30160](https://github.com/angular/angular/issues/30160)
* **router:** IE 11 bug can break URL unification when comparing objects ([#30393](https://github.com/angular/angular/issues/30393)) ([c383491](https://github.com/angular/angular/commit/c383491))
* **bazel:** Bump ibazel to 0.10.1 for Windows fixes ([#30196](https://github.com/angular/angular/issues/30196)) ([9f68c35](https://github.com/angular/angular/commit/9f68c35))
* **compiler-cli:** log ngcc skipping messages as debug instead of info ([#30232](https://github.com/angular/angular/issues/30232)) ([548b003](https://github.com/angular/angular/commit/548b003))
* **core:** fix interpolate identifier in AOT ([#30243](https://github.com/angular/angular/issues/30243)) ([3fe3a84](https://github.com/angular/angular/commit/3fe3a84))
* **router:** ensure `history.state` is set in `eager` update mode ([#30154](https://github.com/angular/angular/issues/30154)) ([9720227](https://github.com/angular/angular/commit/9720227))
* **router:** fix a problem with router not responding to back button ([#30160](https://github.com/angular/angular/issues/30160)) ([132f01c](https://github.com/angular/angular/commit/132f01c))
* **language-service:** Remove tsserverlibrary from rollup globals ([#30123](https://github.com/angular/angular/issues/30123)) ([b706800](https://github.com/angular/angular/commit/b706800))
* disable injectable-pipe migration ([#30180](https://github.com/angular/angular/issues/30180)) ([4b2fcfd](https://github.com/angular/angular/commit/4b2fcfd))
* **bazel:** Exclude common/upgrade* in metadata.tsconfig.json ([#30133](https://github.com/angular/angular/issues/30133)) ([6711f22](https://github.com/angular/angular/commit/6711f22))
* **bazel:** update peerDep ranges ([#30155](https://github.com/angular/angular/issues/30155)) ([6067583](https://github.com/angular/angular/commit/6067583))
* **bazel:** make name param in ng add optional ([#30074](https://github.com/angular/angular/issues/30074)) ([0b5f480](https://github.com/angular/angular/commit/0b5f480))
* **bazel:** Make sure only single copy of @angular/bazel is installed ([#30072](https://github.com/angular/angular/issues/30072)) ([2905bf5](https://github.com/angular/angular/commit/2905bf5))
* **bazel:** transitive npm deps in ng_module ([#30065](https://github.com/angular/angular/issues/30065)) ([61365a9](https://github.com/angular/angular/commit/61365a9))
* **common:** add upgrade sub-package to `ng_package` rule for @angular/common ([#30117](https://github.com/angular/angular/issues/30117)) ([6de4cbd](https://github.com/angular/angular/commit/6de4cbd)), closes [#30055](https://github.com/angular/angular/issues/30055) [#30116](https://github.com/angular/angular/issues/30116)
* **common:** adjust `MockPlatformLocation` to set state to new object ([#30055](https://github.com/angular/angular/issues/30055)) ([825efa8](https://github.com/angular/angular/commit/825efa8))
* **compiler:** Fix compiler crash due to isSkipSelf of null ([#30075](https://github.com/angular/angular/issues/30075)) ([28fd5ab](https://github.com/angular/angular/commit/28fd5ab))
* **upgrade:** do not break if `onMicrotaskEmpty` emits while a `$digest` is in progress ([#29794](https://github.com/angular/angular/issues/29794)) ([0ddf2e7](https://github.com/angular/angular/commit/0ddf2e7)), closes [#24680](https://github.com/angular/angular/issues/24680) [/github.com/angular/angular/blob/78146c189/packages/core/src/util/ng_dev_mode.ts#L12](https://github.com/angular/angular/blob/78146c189/packages/core/src/util/ng_dev_mode.ts/issues/L12) [#24680](https://github.com/angular/angular/issues/24680)
* **bazel:** do not typecheck core schematic files ([#29876](https://github.com/angular/angular/issues/29876)) ([2ba799d](https://github.com/angular/angular/commit/2ba799d))
* **bazel:** restore `ng build --prod` ([#30005](https://github.com/angular/angular/issues/30005)) ([96a8289](https://github.com/angular/angular/commit/96a8289))
* **common:** prevent repeated application of `HttpParams` mutations ([#29045](https://github.com/angular/angular/issues/29045)) ([8e8e89a](https://github.com/angular/angular/commit/8e8e89a)), closes [#20430](https://github.com/angular/angular/issues/20430)
* **common:** async pipe will properly check when it receives an NaN value from an observable ([#22305](https://github.com/angular/angular/issues/22305)) ([3f6bf6d](https://github.com/angular/angular/commit/3f6bf6d)), closes [#15721](https://github.com/angular/angular/issues/15721)
* **core:** don't include a local `EventListener` in typings ([#29809](https://github.com/angular/angular/issues/29809)) ([4bde40f](https://github.com/angular/angular/commit/4bde40f)), closes [#29806](https://github.com/angular/angular/issues/29806)
* **core:** use shakeable global definitions ([#29929](https://github.com/angular/angular/issues/29929)) ([e5905bb](https://github.com/angular/angular/commit/e5905bb))
* **language-service:** Use proper types instead of any ([#29942](https://github.com/angular/angular/issues/29942)) ([1a56cd5](https://github.com/angular/angular/commit/1a56cd5))
* **bazel:** Install packages after `ng add` when invoked independently ([#29852](https://github.com/angular/angular/issues/29852)) ([bd2ce9c](https://github.com/angular/angular/commit/bd2ce9c))
* **compiler-cli:** pass config path to `ts.parseJsonConfigFileContent` ([#29872](https://github.com/angular/angular/issues/29872)) ([86a3f90](https://github.com/angular/angular/commit/86a3f90))
* **router:** support non-NgFactory promise in loadChildren typings ([#29832](https://github.com/angular/angular/issues/29832)) ([2bfb6a0](https://github.com/angular/angular/commit/2bfb6a0))
* **bazel:** add `configuration_env_vars = ["compile"]` to generated `@npm//@angular/bazel/bin:ngc-wrapped` `nodejs_binary` ([#29694](https://github.com/angular/angular/issues/29694)) ([2e66ddf](https://github.com/angular/angular/commit/2e66ddf))
* **bazel:** docs formatting ([#29817](https://github.com/angular/angular/issues/29817)) ([cc2e4b6](https://github.com/angular/angular/commit/cc2e4b6))
* **bazel:** remove karma-jasmine from `ts_web_test_suite` ([#29695](https://github.com/angular/angular/issues/29695)) ([2bd9214](https://github.com/angular/angular/commit/2bd9214))
* **bazel:** support running ng-add on minimal applications ([#29681](https://github.com/angular/angular/issues/29681)) ([9810c6c](https://github.com/angular/angular/commit/9810c6c)), closes [#29680](https://github.com/angular/angular/issues/29680)
* **common:** add `@Injectable()` to common pipes ([#29834](https://github.com/angular/angular/issues/29834)) ([387fbb8](https://github.com/angular/angular/commit/387fbb8))
* **compiler-cli:** ensure `LogicalProjectPaths` always start with a slash ([#29627](https://github.com/angular/angular/issues/29627)) ([e02684e](https://github.com/angular/angular/commit/e02684e))
* **core:** add missing migration to npm package ([#29705](https://github.com/angular/angular/issues/29705)) ([96b76dc](https://github.com/angular/angular/commit/96b76dc))
* **core:** call `ngOnDestroy` for tree-shakeable providers ([#28943](https://github.com/angular/angular/issues/28943)) ([30b0442](https://github.com/angular/angular/commit/30b0442)), closes [#28927](https://github.com/angular/angular/issues/28927)
* **core:** Deprecate `TestBed.get(...):any` ([#29290](https://github.com/angular/angular/issues/29290)) ([609024f](https://github.com/angular/angular/commit/609024f)), closes [#13785](https://github.com/angular/angular/issues/13785) [#26491](https://github.com/angular/angular/issues/26491)
* **core:** resolve ts compile issues due to lenient tsconfig ([#29843](https://github.com/angular/angular/issues/29843)) ([54058ba](https://github.com/angular/angular/commit/54058ba))
* **platform-browser:** insert `APP_ID` in styles, contentAttr and hostAttr ([#17745](https://github.com/angular/angular/issues/17745)) ([712d60e](https://github.com/angular/angular/commit/712d60e))
* **bazel:** Update schematics to support routing ([#29548](https://github.com/angular/angular/issues/29548)) ([401b8ee](https://github.com/angular/angular/commit/401b8ee))
* **bazel:** use `//:tsconfig.json` as the default for `ng_module` ([#29670](https://github.com/angular/angular/issues/29670)) ([b14537a](https://github.com/angular/angular/commit/b14537a))
* **compiler-cli:** ngcc - cope with processing entry-points multiple times ([#29657](https://github.com/angular/angular/issues/29657)) ([6b39c9c](https://github.com/angular/angular/commit/6b39c9c))
* **core:** static-query schematic should detect static queries in getters. ([#29609](https://github.com/angular/angular/issues/29609)) ([33016b8](https://github.com/angular/angular/commit/33016b8))
* **bazel:** allow `ng_module` users to set `createExternalSymbolFactoryReexports` ([#29459](https://github.com/angular/angular/issues/29459)) ([21be0fb](https://github.com/angular/angular/commit/21be0fb))
* **bazel:** workaround problem reading summary files from node_modules ([#29459](https://github.com/angular/angular/issues/29459)) ([769d960](https://github.com/angular/angular/commit/769d960))
* **compiler:** inherit param types when class has a constructor which takes no declared parameters and delegates up ([#29232](https://github.com/angular/angular/issues/29232)) ([0007564](https://github.com/angular/angular/commit/0007564))
* **core:** parse incorrect ML open tag as text ([#29328](https://github.com/angular/angular/issues/29328)) ([dafbbf8](https://github.com/angular/angular/commit/dafbbf8)), closes [#29231](https://github.com/angular/angular/issues/29231)
* **core:** static-query schematic should detect queries in `ngDoCheck` and `ngOnChanges` ([#29492](https://github.com/angular/angular/issues/29492)) ([09fab58](https://github.com/angular/angular/commit/09fab58))
* **router:** support `NgFactory` promise in loadChildren typings ([#29392](https://github.com/angular/angular/issues/29392)) ([26a8c59](https://github.com/angular/angular/commit/26a8c59))
* **bazel:** correct regexp test for self-references in metadata ([#29346](https://github.com/angular/angular/issues/29346)) ([9d090cb](https://github.com/angular/angular/commit/9d090cb))
* **bazel:** don't produce self-references in metadata ([#29317](https://github.com/angular/angular/issues/29317)) ([3facdeb](https://github.com/angular/angular/commit/3facdeb)), closes [#29315](https://github.com/angular/angular/issues/29315)
* **bazel:** fix strict null checks compile error in `packages/bazel/src/schematics/ng-add/index.ts` ([#29282](https://github.com/angular/angular/issues/29282)) ([9a7f560](https://github.com/angular/angular/commit/9a7f560))
* **bazel:** Remove @angular/upgrade from dev dependencies ([#29319](https://github.com/angular/angular/issues/29319)) ([1db8bf3](https://github.com/angular/angular/commit/1db8bf3))
* **bazel:** Support new e2e project layout ([#29318](https://github.com/angular/angular/issues/29318)) ([8ef690c](https://github.com/angular/angular/commit/8ef690c))
* **bazel:** turn off pure call tree shaking for ng_package ([#29210](https://github.com/angular/angular/issues/29210)) ([4990b93](https://github.com/angular/angular/commit/4990b93))
* **compiler-cli:** incorrect metadata bundle for multiple unnamed re-exports ([#29360](https://github.com/angular/angular/issues/29360)) ([105cfaf](https://github.com/angular/angular/commit/105cfaf))
* **core:** don't wrap `<tr>` and `<col>` elements into a required parent ([#29219](https://github.com/angular/angular/issues/29219)) ([f2dc32e](https://github.com/angular/angular/commit/f2dc32e))
* **core:** parse incorrect ML open tag as text ([#29328](https://github.com/angular/angular/issues/29328)) ([4605df8](https://github.com/angular/angular/commit/4605df8)), closes [#29231](https://github.com/angular/angular/issues/29231)
* **bazel:** add missing binary path for api-extractor ([#29202](https://github.com/angular/angular/issues/29202)) ([df354d1](https://github.com/angular/angular/commit/df354d1))
* **bazel:** ng build should produce prod bundle ([#29136](https://github.com/angular/angular/issues/29136)) ([14ce8a9](https://github.com/angular/angular/commit/14ce8a9))
* **compiler:** ensure template is updated if an output is transformed ([#29041](https://github.com/angular/angular/issues/29041)) ([c7e4931](https://github.com/angular/angular/commit/c7e4931))
* **animations:** ensure `position` and `display` styles are handled outside of keyframes/web-animations ([#28911](https://github.com/angular/angular/issues/28911)) ([a6ae759](https://github.com/angular/angular/commit/a6ae759)), closes [#24923](https://github.com/angular/angular/issues/24923) [#25635](https://github.com/angular/angular/issues/25635)
* **bazel:** add favicon to web package ([#29017](https://github.com/angular/angular/issues/29017)) ([5fdf24e](https://github.com/angular/angular/commit/5fdf24e))
* **bazel:** Add SHA256 for rules_sass ([#28994](https://github.com/angular/angular/issues/28994)) ([dc33519](https://github.com/angular/angular/commit/dc33519))
* **bazel:** api extractor don't generate tsdoc metadata ([#29023](https://github.com/angular/angular/issues/29023)) ([b5629d9](https://github.com/angular/angular/commit/b5629d9))
* **bazel:** ng serve should always watch ([#29032](https://github.com/angular/angular/issues/29032)) ([c532646](https://github.com/angular/angular/commit/c532646))
* **platform-server:** update minimum domino version to latest released ([#28893](https://github.com/angular/angular/issues/28893)) ([79e2ca0](https://github.com/angular/angular/commit/79e2ca0))
* **router:** removed obsolete TODO comment ([#29085](https://github.com/angular/angular/issues/29085)) ([72ecc45](https://github.com/angular/angular/commit/72ecc45))
* **service-worker:** detect new version even if files are identical to an old one ([#26006](https://github.com/angular/angular/issues/26006)) ([586234b](https://github.com/angular/angular/commit/586234b)), closes [#24338](https://github.com/angular/angular/issues/24338)
* **service-worker:** ignore passive mixed content requests ([#25994](https://github.com/angular/angular/issues/25994)) ([48214e2](https://github.com/angular/angular/commit/48214e2)), closes [/github.com/angular/angular/issues/23012#issuecomment-376430187](https://github.com/angular/angular/issues/23012/issues/issuecomment-376430187) [#23012](https://github.com/angular/angular/issues/23012)
* **bazel:** Pin browsers for schematics ([#28913](https://github.com/angular/angular/issues/28913)) ([1145bdb](https://github.com/angular/angular/commit/1145bdb))
* **bazel:** rxjs_umd_modules should always be present ([#28881](https://github.com/angular/angular/issues/28881)) ([9ae14db](https://github.com/angular/angular/commit/9ae14db))
* **compiler:** use correct variable in invalid function ([#28656](https://github.com/angular/angular/issues/28656)) ([f75acbd](https://github.com/angular/angular/commit/f75acbd))
* **core:** traverse and sanitize content of unsafe elements ([#28804](https://github.com/angular/angular/issues/28804)) ([262ba67](https://github.com/angular/angular/commit/262ba67)), closes [#25879](https://github.com/angular/angular/issues/25879) [#25879](https://github.com/angular/angular/issues/25879) [#26007](https://github.com/angular/angular/issues/26007) [#28427](https://github.com/angular/angular/issues/28427)
* **language-service:** Fix completions for input/output with alias ([#28904](https://github.com/angular/angular/issues/28904)) ([ad4a9bf](https://github.com/angular/angular/commit/ad4a9bf)), closes [#27959](https://github.com/angular/angular/issues/27959)
* **bazel:** Add postinstall step to generate summaries ([#28850](https://github.com/angular/angular/issues/28850)) ([96b597c](https://github.com/angular/angular/commit/96b597c))
* **bazel:** Schematics should upgrade rxjs to 6.4.0 ([#28841](https://github.com/angular/angular/issues/28841)) ([2d80419](https://github.com/angular/angular/commit/2d80419))
* **compiler-cli:** incorrect bundled metadata for static class member call expressions ([#28762](https://github.com/angular/angular/issues/28762)) ([4131715](https://github.com/angular/angular/commit/4131715)), closes [/github.com/angular/angular/blob/master/packages/core/src/change_detection/differs/keyvalue_differs.ts#L121](https://github.com/angular/angular/blob/master/packages/core/src/change_detection/differs/keyvalue_differs.ts/issues/L121) [#28741](https://github.com/angular/angular/issues/28741)
* **bazel:** Install angular repo before yarn_install ([#28670](https://github.com/angular/angular/issues/28670)) ([49fb8c3](https://github.com/angular/angular/commit/49fb8c3))
* **bazel:** Turn on strict action env ([#28675](https://github.com/angular/angular/issues/28675)) ([2ea030c](https://github.com/angular/angular/commit/2ea030c))
* **compiler:** ensure that event handlers have the correct source spans ([#28055](https://github.com/angular/angular/issues/28055)) ([cffd862](https://github.com/angular/angular/commit/cffd862))
* **compiler:** fix two existing expression transformer issues ([#28523](https://github.com/angular/angular/issues/28523)) ([09af7ea](https://github.com/angular/angular/commit/09af7ea))
* **compiler:** markup lexer should not capture quotes in attribute value ([#28055](https://github.com/angular/angular/issues/28055)) ([c0dac18](https://github.com/angular/angular/commit/c0dac18))
* **compiler:** support `sourceMappingURL` comments that have trailing lines ([#28055](https://github.com/angular/angular/issues/28055)) ([0d6fdec](https://github.com/angular/angular/commit/0d6fdec))
* **compiler-cli:** don't throw when listing lazy routes for an entry route ([#28372](https://github.com/angular/angular/issues/28372)) ([2caa419](https://github.com/angular/angular/commit/2caa419))
* **core:** improve global variable detection ([#28679](https://github.com/angular/angular/issues/28679)) ([77eee42](https://github.com/angular/angular/commit/77eee42)), closes [#16545](https://github.com/angular/angular/issues/16545)
* **core:** use the correct generated URL for JIT compiled components ([#28055](https://github.com/angular/angular/issues/28055)) ([4f46bfb](https://github.com/angular/angular/commit/4f46bfb))
* **core:** use the correct template URL in render3 JIT compilation ([#28055](https://github.com/angular/angular/issues/28055)) ([a5ea55a](https://github.com/angular/angular/commit/a5ea55a))
* **forms:** mark form as pristine before emitting value and status change events ([#28395](https://github.com/angular/angular/issues/28395)) ([1df3aef](https://github.com/angular/angular/commit/1df3aef)), closes [#28130](https://github.com/angular/angular/issues/28130)
* **router:** redirect to root url when returned as UrlTree from guard ([#28271](https://github.com/angular/angular/issues/28271)) ([50732e1](https://github.com/angular/angular/commit/50732e1)), closes [#27845](https://github.com/angular/angular/issues/27845)
* **router:** set href when routerLink is used on an 'area' element ([#28441](https://github.com/angular/angular/issues/28441)) ([ed0cf7e](https://github.com/angular/angular/commit/ed0cf7e)), closes [#28401](https://github.com/angular/angular/issues/28401)
* **bazel:** Bazel builder resolves with require.resolve() ([#28478](https://github.com/angular/angular/issues/28478)) ([36902e2](https://github.com/angular/angular/commit/36902e2))
* **bazel:** fix integration test for bazel-schematics ([#28460](https://github.com/angular/angular/issues/28460)) ([b1e099b](https://github.com/angular/angular/commit/b1e099b))
* **compiler-cli:** base synthetic filepaths on input filepath ([#28453](https://github.com/angular/angular/issues/28453)) ([7219639](https://github.com/angular/angular/commit/7219639))
* **compiler-cli:** diagnostics should respect "newLine" compiler option ([#28352](https://github.com/angular/angular/issues/28352)) ([4aa189d](https://github.com/angular/angular/commit/4aa189d))
* **core:** remove createInjector() from public API ([#28509](https://github.com/angular/angular/issues/28509)) ([f2621db](https://github.com/angular/angular/commit/f2621db))
* **bazel:** also pass afterDeclarations transformers to emitWithTsickle ([#28342](https://github.com/angular/angular/issues/28342)) ([70e426b](https://github.com/angular/angular/commit/70e426b))
* **forms:** don't override form group's dirty state when disabling controls ([#24591](https://github.com/angular/angular/issues/24591)) ([ef67282](https://github.com/angular/angular/commit/ef67282))
* **bazel:** increase node memory limit for ng_module rule to prevent OOM for big modules ([#28237](https://github.com/angular/angular/issues/28237)) ([73616ab](https://github.com/angular/angular/commit/73616ab))
* **router:** `skipLocationChange` with named outlets ([#28300](https://github.com/angular/angular/issues/28300)) ([50df897](https://github.com/angular/angular/commit/50df897)), closes [#27680](https://github.com/angular/angular/issues/27680) [#28200](https://github.com/angular/angular/issues/28200)
* **bazel:** Add [@bazel](https://github.com/bazel)/bazel to dev deps ([#28032](https://github.com/angular/angular/issues/28032)) ([5a0deb8](https://github.com/angular/angular/commit/5a0deb8))
* **bazel:** Add /bazel-out to .gitignore ([#27874](https://github.com/angular/angular/issues/27874)) ([b05baa5](https://github.com/angular/angular/commit/b05baa5))
* **bazel:** Add ibazel to deps of Bazel project ([#28090](https://github.com/angular/angular/issues/28090)) ([605f450](https://github.com/angular/angular/commit/605f450))
* **bazel:** Bazel schematics should add router package ([#28141](https://github.com/angular/angular/issues/28141)) ([06e5bf1](https://github.com/angular/angular/commit/06e5bf1))
* **bazel:** flat module misses AMD module name on windows ([#27839](https://github.com/angular/angular/issues/27839)) ([935ce63](https://github.com/angular/angular/commit/935ce63))
* **bazel:** incorrectly always uses ngc-wrapped from "npm" workspace ([#28137](https://github.com/angular/angular/issues/28137)) ([d12db4e](https://github.com/angular/angular/commit/d12db4e))
* **bazel:** ng_package creates invalid typings reexport on windows ([#27829](https://github.com/angular/angular/issues/27829)) ([4caf654](https://github.com/angular/angular/commit/4caf654))
* **bazel:** packager not properly removing amd directives on windows ([#27829](https://github.com/angular/angular/issues/27829)) ([8473d68](https://github.com/angular/angular/commit/8473d68))
* **bazel:** protractor rule does not run spec files with underscore ([#28022](https://github.com/angular/angular/issues/28022)) ([65e72e9](https://github.com/angular/angular/commit/65e72e9))
* **bazel:** protractor utils cannot start server on windows ([#27915](https://github.com/angular/angular/issues/27915)) ([9de9c8a](https://github.com/angular/angular/commit/9de9c8a))
* **bazel:** replay compilation uses wrong compiler for building esm5 ([#28053](https://github.com/angular/angular/issues/28053)) ([cd04513](https://github.com/angular/angular/commit/cd04513))
* **bazel:** ts_web_test_suite now properly includes init_browser_spec.js ([#27965](https://github.com/angular/angular/issues/27965)) ([ce51dfb](https://github.com/angular/angular/commit/ce51dfb))
* **service-worker:** navigation urls backwards compatibility ([#27244](https://github.com/angular/angular/issues/27244)) ([d49d1e7](https://github.com/angular/angular/commit/d49d1e7))


### Performance Improvements

* pngcrush all pngs ([#28479](https://github.com/angular/angular/issues/28479)) ([ec6e730](https://github.com/angular/angular/commit/ec6e730)), closes [#18243](https://github.com/angular/angular/issues/18243)
* **core:** be more consistent about typeof checks ([#28400](https://github.com/angular/angular/issues/28400)) ([9af18c2](https://github.com/angular/angular/commit/9af18c2))
* **platform-server:** use shared `DomElementSchemaRegistry` instance ([#28150](https://github.com/angular/angular/issues/28150)) ([#28151](https://github.com/angular/angular/issues/28151)) ([ce3a746](https://github.com/angular/angular/commit/ce3a746))


### Reverts

* "ci: use image based cache for windows BuildKite ([#27990](https://github.com/angular/angular/issues/27990))" ([#28160](https://github.com/angular/angular/issues/28160)) ([7bdf3fe](https://github.com/angular/angular/commit/7bdf3fe))


### DEPRECATIONS

* **core:** deprecate integration with the Web Tracing Framework (WTF) ([#30642](https://github.com/angular/angular/issues/30642)) ([b408445](https://github.com/angular/angular/commit/b408445))
* **platform-webworker:** deprecate platform-webworker ([#30642](https://github.com/angular/angular/issues/30642)) ([361f181](https://github.com/angular/angular/commit/361f181))
(which aren't supported) and abstract class tokens.

Before:

```ts
TestBed.configureTestingModule({
  providers: [{provide: "stringToken", useValue: new Service()}],
});

let service = TestBed.get("stringToken"); // type any
```

After:

```ts
const SERVICE_TOKEN = new InjectionToken<Service>("SERVICE_TOKEN");

TestBed.configureTestingModule({
  providers: [{provide: SERVICE_TOKEN, useValue: new Service()}],
});

let service = TestBed.get(SERVICE_TOKEN); // type Service
```

### BREAKING CHANGES

* **bazel:** @bazel/typescript is now a peerDependency of @angular/bazel so users of @angular/bazel must add @bazel/typescript to their package.json
* **bazel:** `ng_module` now depends on a minimum of build_bazel_rules_nodejs 0.27.12
* **core:** In Angular version 8, it's required that all `@ViewChild` and `@ContentChild`
queries have a `'static'` flag specifying whether the query is 'static' or
'dynamic'. The compiler previously sorted queries automatically, but in
8.0 developers are required to explicitly specify which behavior is wanted.
This is a temporary requirement as part of a migration; see
[static query migration guide](https://v8.angular.io/guide/static-query-migration) for more details.

  `@ViewChildren` and `@ContentChildren` queries are always dynamic, and so are
  unaffected.

* `TestBed.get()` has two signatures, one which is typed and another which accepts and returns `any`. The signature for `any` is deprecated; all usage of `TestBed.get()` should go through the typed API. This mainly affects string tokens
(which aren't supported) and abstract class tokens.

  Before:

  ```ts
  TestBed.configureTestingModule({
    providers: [{provide: "stringToken", useValue: new Service()}],
  });

  let service = TestBed.get("stringToken"); // type any
  ```

  After:

  ```ts
  const SERVICE_TOKEN = new InjectionToken<Service>("SERVICE_TOKEN");

  TestBed.configureTestingModule({
    providers: [{provide: SERVICE_TOKEN, useValue: new Service()}],
  });

  let service = TestBed.get(SERVICE_TOKEN); // type Service
  ```

* **core:** Certain elements (like `<tr>` or `<col>`) require parent elements to be of a certain type by the HTML specification
(ex. `<tr>` can only be inside `<tbody>` / `<thead>`). Before this change Angular template parser was auto-correcting
"invalid" HTML using the following rules:
  - `<tr>` would be wrapped in `<tbody>` if not inside `<tbody>`, `<tfoot>` or `<thead>`;
  - `<col>` would be wrapped in `<colgroup>` if not inside `<colgroup>`.

  This mechanism of automatic wrapping / auto-correcting was problematic for several reasons:
  - it is non-obvious and arbitrary (ex. there are more HTML elements that have rules for parent type);
  - it is incorrect for cases where `<tr>` / `<col>` are at the root of a component's content, ex.:

  ```html
  <projecting-tr-inside-tbody>
    <tr>...</tr>
  </projecting-tr-inside-tbody>
  ```

  In the above example the `<projecting-tr-inside-tbody>` component could be "surprised" to see additional
  `<tbody>` elements inserted by Angular HTML parser.

* **http:** The deprecated @angular/http package has been removed, the @angular/common/http package should be used instead.
For details on how to migrate, please refer to [the deprecations guide](https://angular.io/guide/deprecations#angularhttp).


* TypeScript 3.1 and 3.2 are no longer supported.

  Please update your TypeScript version to 3.4, as version 3.3 is also not supported.



<a name="7.2.15"></a>
## [7.2.15](https://github.com/angular/angular/compare/7.2.14...7.2.15) (2019-05-07)


### Bug Fixes

* **upgrade:** do not break if `onMicrotaskEmpty` emits while a `$digest` is in progress ([#29794](https://github.com/angular/angular/issues/29794)) ([#30107](https://github.com/angular/angular/issues/30107)) ([1084c19](https://github.com/angular/angular/commit/1084c19)), closes [#24680](https://github.com/angular/angular/issues/24680) [/github.com/angular/angular/blob/78146c189/packages/core/src/util/ng_dev_mode.ts#L12](https://github.com/angular/angular/blob/78146c189/packages/core/src/util/ng_dev_mode.ts/issues/L12) [#24680](https://github.com/angular/angular/issues/24680)


<a name="7.2.13"></a>
## [7.2.13](https://github.com/angular/angular/compare/7.2.12...7.2.13) (2019-04-12)


### Bug Fixes

* **bazel:** use //:tsconfig.json as the default for ng_module ([#29670](https://github.com/angular/angular/issues/29670)) ([#29711](https://github.com/angular/angular/issues/29711)) ([9e33dc3](https://github.com/angular/angular/commit/9e33dc3))
* **platform-browser:** insert APP_ID in styles, contentAttr and hostAttr ([#17745](https://github.com/angular/angular/issues/17745)) ([ca14509](https://github.com/angular/angular/commit/ca14509))



<a name="7.2.12"></a>
## [7.2.12](https://github.com/angular/angular/compare/7.2.11...7.2.12) (2019-04-03)


### Bug Fixes

* **common:** escape query selector used when anchor scrolling ([#29577](https://github.com/angular/angular/issues/29577)) ([7671c73](https://github.com/angular/angular/commit/7671c73)), closes [#28193](https://github.com/angular/angular/issues/28193)
* **router:** adjust setting navigationTransition when a new navigation cancels an existing one ([#29636](https://github.com/angular/angular/issues/29636)) ([e884c0c](https://github.com/angular/angular/commit/e884c0c)), closes [#29389](https://github.com/angular/angular/issues/29389) [#29590](https://github.com/angular/angular/issues/29590)


<a name="7.2.11"></a>
## [7.2.11](https://github.com/angular/angular/compare/7.2.10...7.2.11) (2019-03-26)

This release contains various API docs improvements.


<a name="7.2.10"></a>
## [7.2.10](https://github.com/angular/angular/compare/7.2.9...7.2.10) (2019-03-20)


### Bug Fixes

* **compiler-cli:** incorrect metadata bundle for multiple unnamed re-exports ([#29360](https://github.com/angular/angular/issues/29360)) ([cf8d934](https://github.com/angular/angular/commit/cf8d934)), closes [github.com/angular/material2/blob/master/tools/package-tools/build-release.ts#L78-L85](https://github.com/angular/material2/blob/master/tools/package-tools/build-release.ts#L78-L85)


<a name="7.2.9"></a>
## [7.2.9](https://github.com/angular/angular/compare/7.2.8...7.2.9) (2019-03-12)

This release contains various API docs improvements.


<a name="7.2.8"></a>
## [7.2.8](https://github.com/angular/angular/compare/7.2.7...7.2.8) (2019-03-06)


### Bug Fixes

* **animations:** ensure `position` and `display` styles are handled outside of keyframes/web-animations ([#28911](https://github.com/angular/angular/issues/28911)) ([86981b3](https://github.com/angular/angular/commit/86981b3)), closes [#24923](https://github.com/angular/angular/issues/24923) [#25635](https://github.com/angular/angular/issues/25635)
* **router:** removed obsolete TODO comment ([#29085](https://github.com/angular/angular/issues/29085)) ([2a25ac2](https://github.com/angular/angular/commit/2a25ac2))
* **service-worker:** detect new version even if files are identical to an old one ([#26006](https://github.com/angular/angular/issues/26006)) ([5669333](https://github.com/angular/angular/commit/5669333)), closes [#24338](https://github.com/angular/angular/issues/24338)
* **service-worker:** ignore passive mixed content requests ([#25994](https://github.com/angular/angular/issues/25994)) ([b598e88](https://github.com/angular/angular/commit/b598e88)), closes [/github.com/angular/angular/issues/23012#issuecomment-376430187](https://github.com/angular/angular/issues/23012/issues/issuecomment-376430187) [#23012](https://github.com/angular/angular/issues/23012)


<a name="7.2.7"></a>
## [7.2.7](https://github.com/angular/angular/compare/7.2.6...7.2.7) (2019-02-27)


### Bug Fixes

* **bazel:** pin browser repositories using [@npm](https://github.com/npm)_bazel_karma//:browser_repositories.bzl in bazel schematics ([#28896](https://github.com/angular/angular/issues/28896)) ([b686449](https://github.com/angular/angular/commit/b686449))
* **core:** traverse and sanitize content of unsafe elements ([#28804](https://github.com/angular/angular/issues/28804)) ([fdcf877](https://github.com/angular/angular/commit/fdcf877)), closes [#25879](https://github.com/angular/angular/issues/25879) [#25879](https://github.com/angular/angular/issues/25879) [#26007](https://github.com/angular/angular/issues/26007) [#28427](https://github.com/angular/angular/issues/28427)
* **language-service:** Fix completions for input/output with alias ([#28904](https://github.com/angular/angular/issues/28904)) ([d0018e6](https://github.com/angular/angular/commit/d0018e6)), closes [#27959](https://github.com/angular/angular/issues/27959)


<a name="7.2.6"></a>
## [7.2.6](https://github.com/angular/angular/compare/7.2.5...7.2.6) (2019-02-20)


### Bug Fixes

* **compiler-cli:** incorrect bundled metadata for static class member call expressions ([#28762](https://github.com/angular/angular/issues/28762)) ([ab69c31](https://github.com/angular/angular/commit/ab69c31)), closes [/github.com/angular/angular/blob/master/packages/core/src/change_detection/differs/keyvalue_differs.ts#L121](https://github.com/angular/angular/blob/master/packages/core/src/change_detection/differs/keyvalue_differs.ts/issues/L121) [#28741](https://github.com/angular/angular/issues/28741)


<a name="7.2.5"></a>
## [7.2.5](https://github.com/angular/angular/compare/7.2.4...7.2.5)
(2019-02-15)


### Bug Fixes

* **compiler-cli:** diagnostics should respect "newLine" compiler option
  ([#28550](https://github.com/angular/angular/issues/28550))
  ([ce750e6](https://github.com/angular/angular/commit/ce750e6))
* **router:** redirect to root url when returned as UrlTree from guard
  ([#28271](https://github.com/angular/angular/issues/28271))
  ([1e58a21](https://github.com/angular/angular/commit/1e58a21)), closes
  [#27845](https://github.com/angular/angular/issues/27845)
* **router:** set href when routerLink is used on an 'area' element
  ([#28441](https://github.com/angular/angular/issues/28441))
  ([d491a20](https://github.com/angular/angular/commit/d491a20)), closes
  [#28401](https://github.com/angular/angular/issues/28401)


<a name="7.2.4"></a>
## [7.2.4](https://github.com/angular/angular/compare/7.2.3...7.2.4) (2019-02-06)


### Bug Fixes

* **bazel:** Bazel builder resolves with require.resolve() ([#28478](https://github.com/angular/angular/issues/28478)) ([d85d396](https://github.com/angular/angular/commit/d85d396))
* **bazel:** fix integration test for bazel-schematics ([#28460](https://github.com/angular/angular/issues/28460)) ([449da8c](https://github.com/angular/angular/commit/449da8c))


### Performance Improvements

* pngcrush all pngs ([#28479](https://github.com/angular/angular/issues/28479)) ([1a25144](https://github.com/angular/angular/commit/1a25144)), closes [#18243](https://github.com/angular/angular/issues/18243)


<a name="7.2.3"></a>
## [7.2.3](https://github.com/angular/angular/compare/7.2.2...7.2.3) (2019-01-30)


### Bug Fixes

* **bazel:** add [@npm](https://github.com/npm)//tslib dep to e2e ts_library target in bazel-workspace schematic ([#28358](https://github.com/angular/angular/issues/28358)) ([8cee56e](https://github.com/angular/angular/commit/8cee56e))
* **bazel:** Bazel-workspace schematics should run in ScopedTree ([#28349](https://github.com/angular/angular/issues/28349)) ([260ac20](https://github.com/angular/angular/commit/260ac20))
* **bazel:** Builder should invoke local bazel/iblaze ([#28303](https://github.com/angular/angular/issues/28303)) ([12b8a6e](https://github.com/angular/angular/commit/12b8a6e))
* **bazel:** ng-new should run yarn install ([#28381](https://github.com/angular/angular/issues/28381)) ([a9d46e4](https://github.com/angular/angular/commit/a9d46e4))


### Performance Improvements

* yarn version upgrade ([#28360](https://github.com/angular/angular/issues/28360)) ([cc1b2a5](https://github.com/angular/angular/commit/cc1b2a5))


<a name="7.2.2"></a>
## [7.2.2](https://github.com/angular/angular/compare/7.2.1...7.2.2) (2019-01-22)


### Bug Fixes

* **bazel:** Fix integration test after v8 bump ([#28194](https://github.com/angular/angular/issues/28194)) ([7b772e9](https://github.com/angular/angular/commit/7b772e9)), closes [#28142](https://github.com/angular/angular/issues/28142)
* **router:** `skipLocationChange` with named outlets ([#28301](https://github.com/angular/angular/issues/28301)) ([32737a6](https://github.com/angular/angular/commit/32737a6)), closes [#27680](https://github.com/angular/angular/issues/27680) [#28200](https://github.com/angular/angular/issues/28200)


### Features

* **bazel:** Add support for SASS ([#28167](https://github.com/angular/angular/issues/28167)) ([a4d9192](https://github.com/angular/angular/commit/a4d9192))
* **compiler-cli:** resolve generated Sass/Less files to .css inputs ([#28166](https://github.com/angular/angular/issues/28166)) ([4c00059](https://github.com/angular/angular/commit/4c00059))



<a name="8.0.0-beta.0"></a>
# [8.0.0-beta.0](https://github.com/angular/angular/compare/7.2.0...8.0.0-beta.0) (2019-01-16)


### Performance Improvements




<a name="7.2.1"></a>
## [7.2.1](https://github.com/angular/angular/compare/7.2.0...7.2.1) (2019-01-16)


### Bug Fixes

* **bazel:** Add [@bazel](https://github.com/bazel)/bazel to dev deps ([#28032](https://github.com/angular/angular/issues/28032)) ([21093b9](https://github.com/angular/angular/commit/21093b9))
* **bazel:** Add /bazel-out to .gitignore ([#27874](https://github.com/angular/angular/issues/27874)) ([e4fc8ba](https://github.com/angular/angular/commit/e4fc8ba))
* **bazel:** Add ibazel to deps of Bazel project ([#28090](https://github.com/angular/angular/issues/28090)) ([28d34b6](https://github.com/angular/angular/commit/28d34b6))
* **bazel:** Bazel schematics should add router package ([#28141](https://github.com/angular/angular/issues/28141)) ([02a852a](https://github.com/angular/angular/commit/02a852a))
* **bazel:** flat module misses AMD module name on windows ([#27839](https://github.com/angular/angular/issues/27839)) ([c3d8e28](https://github.com/angular/angular/commit/c3d8e28))
* **bazel:** incorrectly always uses ngc-wrapped from "npm" workspace ([#28137](https://github.com/angular/angular/issues/28137)) ([ca3965a](https://github.com/angular/angular/commit/ca3965a))
* **bazel:** ng_package creates invalid typings reexport on windows ([#27829](https://github.com/angular/angular/issues/27829)) ([6b394f6](https://github.com/angular/angular/commit/6b394f6))
* **bazel:** packager not properly removing amd directives on windows ([#27829](https://github.com/angular/angular/issues/27829)) ([fad4145](https://github.com/angular/angular/commit/fad4145))
* **bazel:** protractor rule does not run spec files with underscore ([#28022](https://github.com/angular/angular/issues/28022)) ([f05c5f8](https://github.com/angular/angular/commit/f05c5f8))
* **bazel:** protractor utils cannot start server on windows ([#27915](https://github.com/angular/angular/issues/27915)) ([0be8487](https://github.com/angular/angular/commit/0be8487))
* **bazel:** replay compilation uses wrong compiler for building esm5 ([#28053](https://github.com/angular/angular/issues/28053)) ([fbbdaaa](https://github.com/angular/angular/commit/fbbdaaa))
* **router:** ensure URL is updated after second redirect with UrlUpdateStrategy="eager" ([#27680](https://github.com/angular/angular/issues/27680)) ([6ae7aee](https://github.com/angular/angular/commit/6ae7aee)), closes [#27116](https://github.com/angular/angular/issues/27116)
* **service-worker:** navigation urls backwards compatibility ([#27244](https://github.com/angular/angular/issues/27244)) ([585e871](https://github.com/angular/angular/commit/585e871))


### Performance Improvements

* **platform-server:** use shared `DomElementSchemaRegistry` instance ([#28150](https://github.com/angular/angular/issues/28150)) ([#28151](https://github.com/angular/angular/issues/28151)) ([6851581](https://github.com/angular/angular/commit/6851581))



<a name="7.2.0"></a>
# [7.2.0](https://github.com/angular/angular/compare/7.1.4...7.2.0) (2019-01-07)

7.2.0 release also contains all the fixes released in 7.1.4.

### Features

* add support for typescript 3.2 ([#27536](https://github.com/angular/angular/issues/27536)) ([17e702b](https://github.com/angular/angular/commit/17e702b))
* **bazel:** ng-new schematics with Bazel ([#27277](https://github.com/angular/angular/issues/27277)) ([06d4a0c](https://github.com/angular/angular/commit/06d4a0c))
* **forms:** match getError and hasError to get method signature ([#20211](https://github.com/angular/angular/issues/20211)) ([1b0b36d](https://github.com/angular/angular/commit/1b0b36d))
* **router:** add predicate function  mode for runGuardsAndResolvers ([#27682](https://github.com/angular/angular/issues/27682)) ([12c3176](https://github.com/angular/angular/commit/12c3176)), closes [#26861](https://github.com/angular/angular/issues/26861) [#18253](https://github.com/angular/angular/issues/18253) [#27464](https://github.com/angular/angular/issues/27464)
* **router:** add a Navigation type available during navigation ([#27198](https://github.com/angular/angular/issues/27198)) ([d40af0c](https://github.com/angular/angular/commit/d40af0c))
* **router:** add pathParamsOrQueryParamsChange mode for runGuardsAndResolvers ([#27464](https://github.com/angular/angular/issues/27464)) ([d70a7f3](https://github.com/angular/angular/commit/d70a7f3)), closes [#26861](https://github.com/angular/angular/issues/26861) [#18253](https://github.com/angular/angular/issues/18253)
* **router:** allow passing `state` to routerLink directives ([#27198](https://github.com/angular/angular/issues/27198)) ([73f6ed9](https://github.com/angular/angular/commit/73f6ed9)), closes [#24617](https://github.com/angular/angular/issues/24617)
* **router:** allow passing state to `NavigationExtras` ([#27198](https://github.com/angular/angular/issues/27198)) ([67f4a5d](https://github.com/angular/angular/commit/67f4a5d))
* **router:** restore whole object when navigating back to a page managed by Angular router ([#27198](https://github.com/angular/angular/issues/27198)) ([2684249](https://github.com/angular/angular/commit/2684249))


### Bug Fixes

* **animations:** do not truncate decimals for delay ([#24455](https://github.com/angular/angular/issues/24455)) ([f1c9d6a](https://github.com/angular/angular/commit/f1c9d6a))
* **animations:** mark actual descendant node as disabled ([#26180](https://github.com/angular/angular/issues/26180)) ([df123e0](https://github.com/angular/angular/commit/df123e0))
* **bazel:** unable to launch protractor test on windows ([#27850](https://github.com/angular/angular/issues/27850)) ([1e6c9be](https://github.com/angular/angular/commit/1e6c9be))
* **bazel:** devserver entry_module should have underscore name ([#27719](https://github.com/angular/angular/issues/27719)) ([f57916c](https://github.com/angular/angular/commit/f57916c))
* **bazel:** emit full node stack traces when Angular compilation crashes ([#27678](https://github.com/angular/angular/issues/27678)) ([522919a](https://github.com/angular/angular/commit/522919a))
* **bazel:** fix major/minor semver check between @angular/bazel npm packager version and angular bazel repo version ([#27635](https://github.com/angular/angular/issues/27635)) ([1cc08b4](https://github.com/angular/angular/commit/1cc08b4))
* **bazel:** Load http_archive and rules_nodejs dependencies ([#27609](https://github.com/angular/angular/issues/27609)) ([8313ffc](https://github.com/angular/angular/commit/8313ffc))
* **bazel:** ng_package writes unrelevant definitions to bazel out ([#27519](https://github.com/angular/angular/issues/27519)) ([44dfa60](https://github.com/angular/angular/commit/44dfa60)), closes [/github.com/angular/angular/blob/4f9374951d67c75f67a31c110bd61ab72563db7d/packages/bazel/src/ng_package/packager.ts#L105-L124](https://github.com/angular/angular/blob/4f9374951d67c75f67a31c110bd61ab72563db7d/packages/bazel/src/ng_package/packager.ts/issues/L105-L124)
* **bazel:** Set module_name and enable ng test ([#27715](https://github.com/angular/angular/issues/27715)) ([85866de](https://github.com/angular/angular/commit/85866de))
* **bazel:** fix TS errors in the `schematics/bazel-workspace` files ([#27600](https://github.com/angular/angular/issues/27600)) ([3290fc3](https://github.com/angular/angular/commit/3290fc3))
* **bazel:** Read latest versions from latest-versions.ts & use semver check ([#27526](https://github.com/angular/angular/issues/27526)) ([30a3b49](https://github.com/angular/angular/commit/30a3b49))
* **bazel:** tsickle dependency not working with typescript 3.1.x ([#27402](https://github.com/angular/angular/issues/27402)) ([f034114](https://github.com/angular/angular/commit/f034114))
* **bazel:** do not throw error when writing tsickle externs ([#27200](https://github.com/angular/angular/issues/27200)) ([20a2bae](https://github.com/angular/angular/commit/20a2bae))
* **bazel:** do not throw if ts compile action does not create esm5 outputs ([#27401](https://github.com/angular/angular/issues/27401)) ([c61a8b7](https://github.com/angular/angular/commit/c61a8b7))
* **bazel:** ng_package cannot be run multiple times without clean ([#27200](https://github.com/angular/angular/issues/27200)) ([4f93749](https://github.com/angular/angular/commit/4f93749))
* **bazel:** ng_package not generating UMD bundles on windows ([#27200](https://github.com/angular/angular/issues/27200)) ([7d59880](https://github.com/angular/angular/commit/7d59880))
* **bazel:** ng_package should correctly map to source maps in secondary entry-points ([#27313](https://github.com/angular/angular/issues/27313)) ([eb17502](https://github.com/angular/angular/commit/eb17502)), closes [#25510](https://github.com/angular/angular/issues/25510)
* **bazel:** Respect existing angular installation ([#27495](https://github.com/angular/angular/issues/27495)) ([4da739a](https://github.com/angular/angular/commit/4da739a))
* **common:** KeyValuePipe should return empty array for empty objects ([#27258](https://github.com/angular/angular/issues/27258)) ([b39efdd](https://github.com/angular/angular/commit/b39efdd))
* **common:** expose request url in network error ([#27143](https://github.com/angular/angular/issues/27143)) ([1db53da](https://github.com/angular/angular/commit/1db53da)), closes [#27029](https://github.com/angular/angular/issues/27029)
* **compiler-cli:** create LiteralLikeNode for String and Number literal ([#27536](https://github.com/angular/angular/issues/27536)) ([2c9b6c0](https://github.com/angular/angular/commit/2c9b6c0))
* **compiler-cli:** flatModuleIndex files not generated on windows with multiple input files ([#27200](https://github.com/angular/angular/issues/27200)) ([d3c08e7](https://github.com/angular/angular/commit/d3c08e7))
* **core:** export a value for InjectFlags ([#27279](https://github.com/angular/angular/issues/27279)) ([23b06af](https://github.com/angular/angular/commit/23b06af)), closes [#27251](https://github.com/angular/angular/issues/27251)
* **core:** More precise return type for `InjectableDecorator` ([#27360](https://github.com/angular/angular/issues/27360)) ([4b9948c](https://github.com/angular/angular/commit/4b9948c)), closes [#26942](https://github.com/angular/angular/issues/26942)
* **forms:** typed argument for FormBuilder group ([#26985](https://github.com/angular/angular/issues/26985)) ([b0c7561](https://github.com/angular/angular/commit/b0c7561))
* **platform-server:** add @angular/http to the list of peerDependencies ([#27307](https://github.com/angular/angular/issues/27307)) ([32c5be9](https://github.com/angular/angular/commit/32c5be9)), closes [#26154](https://github.com/angular/angular/issues/26154)
* **router:** ensure URL is updated after second redirect with UrlUpdateStrategy="eager" ([#27523](https://github.com/angular/angular/issues/27523)) ([ad26cd6](https://github.com/angular/angular/commit/ad26cd6)), closes [#27116](https://github.com/angular/angular/issues/27116)
* **router:** update URL after redirects when urlHandlingStrategy='eager' ([#27356](https://github.com/angular/angular/issues/27356)) ([11a8bd8](https://github.com/angular/angular/commit/11a8bd8)), closes [#27076](https://github.com/angular/angular/issues/27076)
* **upgrade:** allow nesting components from different downgraded modules ([#27217](https://github.com/angular/angular/issues/27217)) ([bc0ee01](https://github.com/angular/angular/commit/bc0ee01))
* **upgrade:** correctly handle nested downgraded components with `downgradeModule()` ([#27217](https://github.com/angular/angular/issues/27217)) ([326b464](https://github.com/angular/angular/commit/326b464)), closes [#22581](https://github.com/angular/angular/issues/22581) [#22869](https://github.com/angular/angular/issues/22869) [#27083](https://github.com/angular/angular/issues/27083)
* **upgrade:** upgrade Directive facade should not return different instance from constructor ([#27660](https://github.com/angular/angular/issues/27660)) ([c986d3d](https://github.com/angular/angular/commit/c986d3d))
* **upgrade:** don't rely upon the runtime to resolve forward refs ([#27132](https://github.com/angular/angular/issues/27132)) ([a4462c2](https://github.com/angular/angular/commit/a4462c2))



<a name="7.1.4"></a>
## [7.1.4](https://github.com/angular/angular/compare/7.1.3...7.1.4) (2018-12-18)


### Bug Fixes

* **animations:** do not truncate decimals for delay ([#24455](https://github.com/angular/angular/issues/24455)) ([cd1e206](https://github.com/angular/angular/commit/cd1e206))
* **animations:** mark actual descendant node as disabled ([#26180](https://github.com/angular/angular/issues/26180)) ([453589f](https://github.com/angular/angular/commit/453589f))
* **bazel:** devserver entry_module should have underscore name ([#27719](https://github.com/angular/angular/issues/27719)) ([b108e9a](https://github.com/angular/angular/commit/b108e9a))
* **bazel:** emit full node stack traces when Angular compilation crashes ([#27678](https://github.com/angular/angular/issues/27678)) ([0d8528b](https://github.com/angular/angular/commit/0d8528b))
* **bazel:** fix major/minor semver check between @angular/bazel npm packager version and angular bazel repo version ([#27635](https://github.com/angular/angular/issues/27635)) ([3ed1e84](https://github.com/angular/angular/commit/3ed1e84))
* **bazel:** Load http_archive and rules_nodejs dependencies ([#27609](https://github.com/angular/angular/issues/27609)) ([89ace1a](https://github.com/angular/angular/commit/89ace1a))
* **bazel:** ng_package writes unrelevant definitions to bazel out ([#27519](https://github.com/angular/angular/issues/27519)) ([ef056c5](https://github.com/angular/angular/commit/ef056c5)), closes [/github.com/angular/angular/blob/4f9374951d67c75f67a31c110bd61ab72563db7d/packages/bazel/src/ng_package/packager.ts#L105-L124](https://github.com/angular/angular/blob/4f9374951d67c75f67a31c110bd61ab72563db7d/packages/bazel/src/ng_package/packager.ts/issues/L105-L124)
* **bazel:** Read latest versions from latest-versions.ts & use semver check ([#27591](https://github.com/angular/angular/issues/27591)) ([93078e3](https://github.com/angular/angular/commit/93078e3))
* **bazel:** Set module_name and enable ng test ([#27715](https://github.com/angular/angular/issues/27715)) ([183f278](https://github.com/angular/angular/commit/183f278))
* **common:** KeyValuePipe should return empty array for empty objects ([#27258](https://github.com/angular/angular/issues/27258)) ([fa3af8b](https://github.com/angular/angular/commit/fa3af8b))



<a name="7.1.3"></a>
## [7.1.3](https://github.com/angular/angular/compare/7.1.2...7.1.3) (2018-12-11)


### Bug Fixes

* **bazel:** tsickle dependency not working with typescript 3.1.x ([#27402](https://github.com/angular/angular/issues/27402)) ([a9f39a4](https://github.com/angular/angular/commit/a9f39a4))



<a name="7.1.2"></a>
## [7.1.2](https://github.com/angular/angular/compare/7.1.1...7.1.2) (2018-12-06)


### Bug Fixes

* **bazel:** do not throw error when writing tsickle externs ([#27200](https://github.com/angular/angular/issues/27200)) ([079c4b3](https://github.com/angular/angular/commit/079c4b3))
* **bazel:** do not throw if ts compile action does not create esm5 outputs ([#27401](https://github.com/angular/angular/issues/27401)) ([9b4d959](https://github.com/angular/angular/commit/9b4d959))
* **bazel:** ng_package cannot be run multiple times without clean ([#27200](https://github.com/angular/angular/issues/27200)) ([1ca2923](https://github.com/angular/angular/commit/1ca2923))
* **bazel:** ng_package not generating UMD bundles on windows ([#27200](https://github.com/angular/angular/issues/27200)) ([e476c38](https://github.com/angular/angular/commit/e476c38))
* **bazel:** ng_package should correctly map to source maps in secondary entry-points ([#27313](https://github.com/angular/angular/issues/27313)) ([fc2c23e](https://github.com/angular/angular/commit/fc2c23e)), closes [#25510](https://github.com/angular/angular/issues/25510)
* **compiler-cli:** flatModuleIndex files not generated on windows with multiple input files ([#27200](https://github.com/angular/angular/issues/27200)) ([8087b6b](https://github.com/angular/angular/commit/8087b6b))
* **compiler-cli:** ngtsc shim files not being generated on case-insensitive platforms ([#27466](https://github.com/angular/angular/issues/27466)) ([84f2928](https://github.com/angular/angular/commit/84f2928)), closes [/github.com/Microsoft/TypeScript/blob/3e4c5c95abd515eb9713b881d27ab3a93cc00461/src/compiler/sys.ts#L681-L682](https://github.com/Microsoft/TypeScript/blob/3e4c5c95abd515eb9713b881d27ab3a93cc00461/src/compiler/sys.ts/issues/L681-L682)
* **platform-server:** add @angular/http to the list of peerDependencies ([#27307](https://github.com/angular/angular/issues/27307)) ([236ac06](https://github.com/angular/angular/commit/236ac06)), closes [#26154](https://github.com/angular/angular/issues/26154)



<a name="7.1.1"></a>
## [7.1.1](https://github.com/angular/angular/compare/7.1.0...7.1.1) (2018-11-28)


### Bug Fixes

* **core:** export a value for InjectFlags ([#27279](https://github.com/angular/angular/issues/27279)) ([bdf5f3e](https://github.com/angular/angular/commit/bdf5f3e)), closes [#27251](https://github.com/angular/angular/issues/27251)



<a name="7.1.0"></a>
# [7.1.0](https://github.com/angular/angular/compare/7.1.0-rc.0...7.1.0) (2018-11-21)


### Features

* **bazel:** Bazel workspace schematics ([#26971](https://github.com/angular/angular/issues/26971)) ([b07bd30](https://github.com/angular/angular/commit/b07bd30))


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
* **core:** Remove static dependency from @angular/core to @angular/compiler ([#26734](https://github.com/angular/angular/issues/26734)) ([d042c4a](https://github.com/angular/angular/commit/d042c4a))
* **core:** support computed base class in metadata inheritance ([#24014](https://github.com/angular/angular/issues/24014)) ([95743e3](https://github.com/angular/angular/commit/95743e3))



<a name="7.0.2"></a>
## [7.0.2](https://github.com/angular/angular/compare/7.0.1...7.0.2) (2018-10-31)


### Bug Fixes

* **compiler:** generate relative paths only in summary file errors ([#26759](https://github.com/angular/angular/issues/26759)) ([c01f340](https://github.com/angular/angular/commit/c01f340))
* **core:** Remove static dependency from @angular/core to @angular/compiler ([#26734](https://github.com/angular/angular/issues/26734)) ([#26879](https://github.com/angular/angular/issues/26879)) ([257ac83](https://github.com/angular/angular/commit/257ac83))
* **core:** support computed base class in metadata inheritance ([#24014](https://github.com/angular/angular/issues/24014)) ([b3c6409](https://github.com/angular/angular/commit/b3c6409))



<a name="7.1.0-beta.0"></a>
# [7.1.0-beta.0](https://github.com/angular/angular/compare/7.0.0-rc.1...7.1.0-beta.0) (2018-10-24)


### Bug Fixes
* **service-worker:** clean up caches from old SW versions ([#26319](https://github.com/angular/angular/issues/26319)) ([2326b9c](https://github.com/angular/angular/commit/2326b9c))


### Features

* **router:** add prioritizedGuardValue operator optimization and allowing UrlTree return from guard ([#26478](https://github.com/angular/angular/issues/26478)) ([fdfedce](https://github.com/angular/angular/commit/fdfedce))



<a name="7.0.1"></a>
## [7.0.1](https://github.com/angular/angular/compare/7.0.0...7.0.1) (2018-10-24)




<a name="7.0.0"></a>
# [7.0.0](https://github.com/angular/angular/compare/7.0.0-rc.1...7.0.0) (2018-10-18)

[Blog post "Version 7 of Angular — CLI Prompts, Virtual Scroll, Drag and Drop and more"](https://blog.angular.io/version-7-of-angular-cli-prompts-virtual-scroll-drag-and-drop-and-more-c594e22e7b8c).


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
* **core:** add missing `peerDependency ` to `@angular/compiler` ([#26033](https://github.com/angular/angular/issues/26033)) ([549de1e](https://github.com/angular/angular/commit/549de1e)), closes [/github.com/angular/angular/commit/919f42fea1df4b9e38b7d688aef5f2de668e9d3e#diff-58563046c4439699f2e6a89187099a54](https://github.com/angular/angular/commit/919f42fea1df4b9e38b7d688aef5f2de668e9d3e/issues/diff-58563046c4439699f2e6a89187099a54)
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

[Blog post "Angular v6.1 Now Available — TypeScript 2.9, Scroll Positioning, and more"](https://blog.angular.io/angular-v6-1-now-available-typescript-2-9-scroll-positioning-and-more-9f1c03007bb6).


### Bug Fixes

* **animations:** always render end-state styles for orphaned DOM nodes ([#24236](https://github.com/angular/angular/issues/24236)) ([dc4a3d0](https://github.com/angular/angular/commit/dc4a3d0))
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

[Blog post "Version 6 of Angular Now Available"](https://blog.angular.io/version-6-of-angular-now-available-cc56b0efa7a4).


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
* **upgrade:** correctly handle `=` bindings in `@angular/upgrade` ([#22167](https://github.com/angular/angular/issues/22167)) ([f089bf5](https://github.com/angular/angular/commit/f089bf5))
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

* **router:** fix URL serialization so special characters are only encoded where needed ([#22337](https://github.com/angular/angular/issues/22337)) ([789a47e](https://github.com/angular/angular/commit/789a47e)), closes [#10280](https://github.com/angular/angular/issues/10280)



<a name="5.2.7"></a>
## [5.2.7](https://github.com/angular/angular/compare/5.2.6...5.2.7) (2018-02-28)


### Bug Fixes

* **platform-server:** generate correct stylings for camel case names ([#22263](https://github.com/angular/angular/issues/22263)) ([de02a7a](https://github.com/angular/angular/commit/de02a7a)), closes [#19235](https://github.com/angular/angular/issues/19235)
* **router:** don't mutate route configs ([#22358](https://github.com/angular/angular/issues/22358)) ([8f0a064](https://github.com/angular/angular/commit/8f0a064)), closes [#22203](https://github.com/angular/angular/issues/22203)
* **upgrade:** correctly destroy nested downgraded component ([#22400](https://github.com/angular/angular/issues/22400)) ([4aef9de](https://github.com/angular/angular/commit/4aef9de)), closes [#22392](https://github.com/angular/angular/issues/22392)
* **upgrade:** correctly handle `=` bindings in `@angular/upgrade` ([#22167](https://github.com/angular/angular/issues/22167)) ([6638390](https://github.com/angular/angular/commit/6638390))
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

[Blog post "Angular 5.2 Now Available"](https://blog.angular.io/angular-5-2-now-available-312d1099bd81).


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

[Blog post "Angular 5.1 & More Now Available"](https://blog.angular.io/angular-5-1-more-now-available-27d372f5eb4e).


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

[Blog post "Version 5.0.0 of Angular Now Available"](https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced).


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
* **compiler:** enabled strict checking of parameters to an `@Injectable` ([#19412](https://github.com/angular/angular/issues/19412)) ([dfb8d21](https://github.com/angular/angular/commit/dfb8d21))
* **compiler:** make `.ngsummary.json` files portable ([2572bf5](https://github.com/angular/angular/commit/2572bf5))
* **compiler:** reuse the TypeScript typecheck for template typechecking. ([#19152](https://github.com/angular/angular/issues/19152)) ([996c7c2](https://github.com/angular/angular/commit/996c7c2))
* **compiler:** set `enableLegacyTemplate` to false by default ([#18756](https://github.com/angular/angular/issues/18756)) ([56238fe](https://github.com/angular/angular/commit/56238fe))
* **compiler:** use typescript for resolving resource paths ([43226cb](https://github.com/angular/angular/commit/43226cb))
* **core:** Create StaticInjector which does not depend on Reflect polyfill. ([d9d00bd](https://github.com/angular/angular/commit/d9d00bd))
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
* **service-worker:** introduce the @angular/service-worker package ([#19274](https://github.com/angular/angular/issues/19274)) ([d442b68](https://github.com/angular/angular/commit/d442b68))
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
* **common:** fix improper packaging for @angular/common/http ([#18613](https://github.com/angular/angular/issues/18613)) ([a203a95](https://github.com/angular/angular/commit/a203a95))
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

[Blog post "Angular 4.3 Now Available"](https://blog.angular.io/angular-4-3-now-available-8d57b57eb5a8).


### Bug Fixes

* **animations:** do not delay style() values before a stagger() runs ([34f3832](https://github.com/angular/angular/commit/34f3832)), closes [#17412](https://github.com/angular/angular/issues/17412)
* **animations:** do not remove container nodes when children are queried by a parent animation ([d699c35](https://github.com/angular/angular/commit/d699c35)), closes [#17746](https://github.com/angular/angular/issues/17746)
* **animations:** do not validate style overlap errors in different transitions ([f2ee1dc](https://github.com/angular/angular/commit/f2ee1dc))
* **animations:** properly collect :enter nodes that exist within multi-level DOM trees ([40f77cb](https://github.com/angular/angular/commit/40f77cb)), closes [#17632](https://github.com/angular/angular/issues/17632)
* **animations:** compute removal node height correctly ([185075d](https://github.com/angular/angular/commit/185075d))
* **animations:** do not treat a `0` animation state as `void` ([451257a](https://github.com/angular/angular/commit/451257a))
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
* **http:** flatten metadata for @angular/http/testing ([9da6340](https://github.com/angular/angular/commit/9da6340)), closes [#15521](https://github.com/angular/angular/issues/15521)
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
* **http:** flatten metadata for @angular/http/testing ([9c70a3c](https://github.com/angular/angular/commit/9c70a3c)), closes [#15521](https://github.com/angular/angular/issues/15521)
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
* **language-service:** improve resilience to incomplete information ([71a8627](https://github.com/angular/angular/commit/71a8627))
* **language-service:** infer correct type of `?.` expressions ([0a3a9af](https://github.com/angular/angular/commit/0a3a9af)), closes [#15885](https://github.com/angular/angular/issues/15885)
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

From 4.0.0 @angular/core uses a [`WeakMap`](https://github.com/angular/angular/commit/52b21275f4c2c26c46627f5648b41a33bb5c8283), a polyfill needs to be included for [browsers that do not support it natively](https://kangax.github.io/compat-table/es6/#test-WeakMap).

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
* **platform-server:** support @angular/http from @angular/platform-server ([9559d3e](https://github.com/angular/angular/commit/9559d3e))
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

* **compiler:** [i18n] XMB/XTB placeholder names can contain only A-Z, 0-9, _n ([d02eab4](https://github.com/angular/angular/commit/d02eab4))
* **compiler:** fix regexp to support firefox 31 ([#14082](https://github.com/angular/angular/issues/14082)) ([b2f9d56](https://github.com/angular/angular/commit/b2f9d56)), closes [#14029](https://github.com/angular/angular/issues/14029) [#13900](https://github.com/angular/angular/issues/13900)
* **core:** export animation classes required for Renderer impl ([#14002](https://github.com/angular/angular/issues/14002)) ([83361d8](https://github.com/angular/angular/commit/83361d8)), closes [#14001](https://github.com/angular/angular/issues/14001)
* **core:** fix not declared variable in view engine ([#14045](https://github.com/angular/angular/issues/14045)) ([d3a3a8e](https://github.com/angular/angular/commit/d3a3a8e))
* **upgrade/static:** ensure upgraded injector is initialized early enough ([#14065](https://github.com/angular/angular/issues/14065)) ([6152eb2](https://github.com/angular/angular/commit/6152eb2)), closes [#13811](https://github.com/angular/angular/issues/13811)


### Features

* **core:** add event support to view engine ([0adb97b](https://github.com/angular/angular/commit/0adb97b))
* **core:** add initial view engine ([#14014](https://github.com/angular/angular/issues/14014)) ([2f87eb5](https://github.com/angular/angular/commit/2f87eb5))
* **core:** add pure expression support to view engine ([6541737](https://github.com/angular/angular/commit/6541737))
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

* **core:** map 'for' attribute to 'htmlFor' property ([#10546](https://github.com/angular/angular/issues/10546)) ([634b3bb](https://github.com/angular/angular/commit/634b3bb)), closes [#7516](https://github.com/angular/angular/issues/7516)
* **core:** add the find method to QueryList ([7c16ef9](https://github.com/angular/angular/commit/7c16ef9))
* **forms:** add emitEvent to AbstractControl methods ([#11949](https://github.com/angular/angular/issues/11949)) ([b9fc090](https://github.com/angular/angular/commit/b9fc090))
* **router:** add a provider making angular1/angular2 integration easier ([#12769](https://github.com/angular/angular/issues/12769)) ([6e35d13](https://github.com/angular/angular/commit/6e35d13))
* **router:** add support for custom url matchers ([7340735](https://github.com/angular/angular/commit/7340735)), closes [#12442](https://github.com/angular/angular/issues/12442) [#12772](https://github.com/angular/angular/issues/12772)
* **router:** export routerLinkActive w/ isActive property ([c9f58cf](https://github.com/angular/angular/commit/c9f58cf))
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
* **compiler-cli:** remove peerDependency on @angular/platform-server ([#12122](https://github.com/angular/angular/issues/12122)) ([71b7654](https://github.com/angular/angular/commit/71b7654))
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
