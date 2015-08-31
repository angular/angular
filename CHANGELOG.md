<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2015-08-19)


### Bug Fixes

* **benchmarks:** remove reference to String.prototype.contains() ([b6ee208](https://github.com/angular/angular/commit/b6ee208)), closes [#3570](https://github.com/angular/angular/issues/3570)
* **browser_adapter.ts:** baseElement.getAttribute ([235dec2](https://github.com/angular/angular/commit/235dec2)), closes [#3214](https://github.com/angular/angular/issues/3214)
* **compiler:** strip script tag from templates ([748c2d6](https://github.com/angular/angular/commit/748c2d6)), closes [#2766](https://github.com/angular/angular/issues/2766) [#3486](https://github.com/angular/angular/issues/3486)
* **CSSClass:** change selector to ng-class ([ff1b110](https://github.com/angular/angular/commit/ff1b110)), closes [#3498](https://github.com/angular/angular/issues/3498)
* **dart:** @proxy is a value, not a factory ([b4a0629](https://github.com/angular/angular/commit/b4a0629)), closes [#3494](https://github.com/angular/angular/issues/3494)
* **docs:** export bootstrap in core.ts but not in core.dart ([5f7d4fa](https://github.com/angular/angular/commit/5f7d4fa))
* **docs:** ng-non-bindable ([f2f4b90](https://github.com/angular/angular/commit/f2f4b90)), closes [#3607](https://github.com/angular/angular/issues/3607)
* **exception_handler:** log errors that are thrown by the compiler ([07b9be7](https://github.com/angular/angular/commit/07b9be7))
* **NgClass:** take initial classes into account during cleanup ([ed25a29](https://github.com/angular/angular/commit/ed25a29)), closes [#3557](https://github.com/angular/angular/issues/3557)
* **presubmit:** uses proper branch instead of hard coded ([96e34c1](https://github.com/angular/angular/commit/96e34c1)), closes [#3552](https://github.com/angular/angular/issues/3552)
* **query:** do not visit dehydrated injectors. ([6c9e712](https://github.com/angular/angular/commit/6c9e712))
* **router:** fix regression with generating links to async routes ([26d2ea8](https://github.com/angular/angular/commit/26d2ea8)), closes [#3650](https://github.com/angular/angular/issues/3650)
* **router:** throw when component in route config is not defined ([903a0f0](https://github.com/angular/angular/commit/903a0f0)), closes [#3265](https://github.com/angular/angular/issues/3265) [#3569](https://github.com/angular/angular/issues/3569)
* **test_lib:** run unit tests in default Documnent ([a37de36](https://github.com/angular/angular/commit/a37de36)), closes [#3501](https://github.com/angular/angular/issues/3501) [#3475](https://github.com/angular/angular/issues/3475)
* **testability:** properly throw when no testability available ([841206c](https://github.com/angular/angular/commit/841206c))
* **testability:** throw if no testability available ([08dbe87](https://github.com/angular/angular/commit/08dbe87))
* **Testability:** fix type error in getAllAngularTestability (dart) ([574bbea](https://github.com/angular/angular/commit/574bbea))
* **transformers:** be more specific in the imports to rewrite ([86eb46a](https://github.com/angular/angular/commit/86eb46a)), closes [#3473](https://github.com/angular/angular/issues/3473) [#3523](https://github.com/angular/angular/issues/3523)
* improper use package name in facade ([64ebf27](https://github.com/angular/angular/commit/64ebf27)), closes [#3613](https://github.com/angular/angular/issues/3613)
* **typescript:** update to typescript with fixed system emit ([ac31191](https://github.com/angular/angular/commit/ac31191)), closes [#3594](https://github.com/angular/angular/issues/3594)
* **UrlResolver:** encode URLs before resolving ([4f5e405](https://github.com/angular/angular/commit/4f5e405)), closes [#3543](https://github.com/angular/angular/issues/3543) [#3545](https://github.com/angular/angular/issues/3545)
* **WebWorkers:** Run XHR requests on the UI ([2968517](https://github.com/angular/angular/commit/2968517)), closes [#3652](https://github.com/angular/angular/issues/3652)

### Features

* **change_detection:** added an example demonstrating how to use observable models ([52da220](https://github.com/angular/angular/commit/52da220)), closes [#3684](https://github.com/angular/angular/issues/3684)
* **change_detection:** added an experimental support for observables ([cbfc9cb](https://github.com/angular/angular/commit/cbfc9cb))
* **change_detection:** request a change detection check when  an event happens ([5e6317f](https://github.com/angular/angular/commit/5e6317f)), closes [#3679](https://github.com/angular/angular/issues/3679)
* **compiler:** allow binding to className using class alias ([a7a1851](https://github.com/angular/angular/commit/a7a1851)), closes [#2364](https://github.com/angular/angular/issues/2364)
* **coreDirectives:** add NgClass to coreDirectives ([6bd95c1](https://github.com/angular/angular/commit/6bd95c1)), closes [#3534](https://github.com/angular/angular/issues/3534)
* **dart/transform:** Support `part` directives ([aa480fe](https://github.com/angular/angular/commit/aa480fe)), closes [#1817](https://github.com/angular/angular/issues/1817)
* **di:** added resolveAndInstantiate and instantiateResolved to Injector ([06da60f](https://github.com/angular/angular/commit/06da60f))
* **http:** serialize search parameters from request options ([77d3668](https://github.com/angular/angular/commit/77d3668)), closes [#2417](https://github.com/angular/angular/issues/2417) [#3020](https://github.com/angular/angular/issues/3020)
* **npm:** add typescript block to package.json ([b5fb05b](https://github.com/angular/angular/commit/b5fb05b)), closes [#3590](https://github.com/angular/angular/issues/3590) [#3609](https://github.com/angular/angular/issues/3609)
* **npm:** publish bundles and their typings in npm distribution ([7b3cca2](https://github.com/angular/angular/commit/7b3cca2)), closes [#3555](https://github.com/angular/angular/issues/3555)
* **pipe:** added the Pipe decorator and the pipe property to View ([5b5d31f](https://github.com/angular/angular/commit/5b5d31f)), closes [#3572](https://github.com/angular/angular/issues/3572)
* **pipes:** changed PipeTransform to make onDestroy optional ([839edaa](https://github.com/angular/angular/commit/839edaa))
* **PropertyBindingParser:** support onbubble-event as an alternate syntax for (^event) ([1f54e64](https://github.com/angular/angular/commit/1f54e64)), closes [#3448](https://github.com/angular/angular/issues/3448) [#3616](https://github.com/angular/angular/issues/3616)
* **query:** allow to query for `TemplateRef` ([585ea5d](https://github.com/angular/angular/commit/585ea5d)), closes [#3202](https://github.com/angular/angular/issues/3202)
* **query:** view query is properly updated when dom changes. ([2150a8f](https://github.com/angular/angular/commit/2150a8f)), closes [#3033](https://github.com/angular/angular/issues/3033) [#3439](https://github.com/angular/angular/issues/3439)
* **query_list:** delegate `toString` to `_results` array ([35a83b4](https://github.com/angular/angular/commit/35a83b4)), closes [#3004](https://github.com/angular/angular/issues/3004)
* **refactor:** replaced ObservablePipe and PromisePipe with AsyncPipe ([106a28b](https://github.com/angular/angular/commit/106a28b))
* **router:** auxiliary routes ([ac6227e](https://github.com/angular/angular/commit/ac6227e)), closes [#2775](https://github.com/angular/angular/issues/2775)
* **router:** user metadata in route configs ([ed81cb9](https://github.com/angular/angular/commit/ed81cb9)), closes [#2777](https://github.com/angular/angular/issues/2777) [#3541](https://github.com/angular/angular/issues/3541)
* **test:** find testabilities across dart js applications ([1d65b38](https://github.com/angular/angular/commit/1d65b38)), closes [#3611](https://github.com/angular/angular/issues/3611)
* **testability:** option to disable tree walking ([8f5360c](https://github.com/angular/angular/commit/8f5360c))
* **typings:** allow declaration of reference paths ([1f692ae](https://github.com/angular/angular/commit/1f692ae)), closes [#3540](https://github.com/angular/angular/issues/3540)
* **typings:** allow defining custom namespace for bundle ([dfa5103](https://github.com/angular/angular/commit/dfa5103)), closes [#2948](https://github.com/angular/angular/issues/2948) [#3544](https://github.com/angular/angular/issues/3544)


### BREAKING CHANGES

* rename all constants to UPPER_CASE names

  - `appComponentTypeToken` => `APP_COMPONENT`
  - `coreDirectives` => `CORE_DIRECTIVES`
  - `formDirectives` => `FORM_DIRECTIVES`
  - `formInjectables` => `FORM_BINDINGS`
  - `httpInjectables` => `HTTP_BINDINGS`
  - `jsonpInjectables` => `JSONP_BINDINGS`
  - `PROTO_CHANGE_DETECTOR_KEY` => `PROTO_CHANGE_DETECTOR`
  - `appComponentRefPromiseToken` => `APP_COMPONENT_REF_PROMISE`
  - `appComponentTypeToken` => `APP_COMPONENT`
  - `undefinedValue` => `UNDEFINED`
  - `formDirectives` => `FORM_DIRECTIVES`
  - `DOCUMENT_TOKEN` => `DOCUMENT`
  - `APP_ID_TOKEN` => `APP_ID`
  - `MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE_TOKEN` => `MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE`
  - `appBaseHrefToken` => `APP_BASE_HREF`

* renamed DI visibility flags

  - `PRIVATE` => `Visibility.Private`
  - `PUBLIC` => `Visibility.Public`
  - `PUBLIC_AND_PRIVATE` => `Visibility.PublicAndPrivate`

* renamed all "annotation" references to "metadata"

  - *Annotations => *Metadata
  - renderer.DirectiveMetadata => renderer.RendererDirectiveMetadata
  - renderer.ElementBinder => renderer.RendererElementBinder
  - impl.Directive => impl.DirectiveMetadata
  - impl.Component => impl.ComponentMetadata
  - impl.View => impl.ViewMetadata


* `IS_DARTIUM` constant is no longer exported/supported

* The HTTP package is no longer supported in Dart (use standard library apis instead)

* Remove IRequestOptions / IResponseOptions / IQueryList interfaces

* Pipe factories have been removed and Pipe names to pipe implementations are 1-to-1  instead of 1-to-*

  Before:
  <code><pre>
   class DateFormatter {
       transform(date, args){}
   }

   class DateFormatterFactory {
     supporst(obj) { return true; }
     create(cdRef) { return new DateFormatter(); }
   }
   new Pipes({date: [new DateFormatterFactory()]})
  </pre></code>

  After:
  <code><pre>
  class DateFormatter {
    transform(date, args){}
  }
  new Pipes({date: DateFormatter})
  </pre></code>


* Previously Angular called onDestroy on all pipes. Now Angular calls onDestroy only on pipes that have the onDestroy method.

* Instead of configuring pipes via a Pipes object, now you can configure them by providing the pipes property to the View decorator.

  <code><pre>
    @Pipe({
      name: 'double'
    })
    class DoublePipe {
      transform(value, args) { return value * 2; }
    }
    @View({
      template: '{{ 10 | double}}'
      pipes: [DoublePipe]
    })
    class CustomComponent {}
  </pre></code>


* The router was previously exported as ng.router in the 
    angular.sfx.dev.js bundle, but now it is exported as ngRouter.

* The selector for the CSSClass directive was changed
from [class] to [ng-class]. The directive itself was
renamed from CSSClass to NgClass




<a name="2.0.0-alpha.34"></a>
# [2.0.0-alpha.34](https://github.com/angular/angular/compare/2.0.0-alpha.33...2.0.0-alpha.34) (2015-08-05)


### Bug Fixes

* **bootstrap:** fix expressions containing bootstrap (fixes #3309) ([2909576](https://github.com/angular/angular/commit/2909576)), closes [#3309](https://github.com/angular/angular/issues/3309)
* **browser_adapter:** fix clearNodes() in IE ([70bc485](https://github.com/angular/angular/commit/70bc485)), closes [#3295](https://github.com/angular/angular/issues/3295) [#3355](https://github.com/angular/angular/issues/3355)
* **collection:** MapIterator.next() is not supported (Safari) ([12e4c73](https://github.com/angular/angular/commit/12e4c73)), closes [#3015](https://github.com/angular/angular/issues/3015) [#3389](https://github.com/angular/angular/issues/3389)
* **compiler:** Allow components to use any style of selector. Fixes #1602 ([c20a5d6](https://github.com/angular/angular/commit/c20a5d6)), closes [#1602](https://github.com/angular/angular/issues/1602)
* **core:** export LifeCycle at top-level modules ([4e76cac](https://github.com/angular/angular/commit/4e76cac)), closes [#3395](https://github.com/angular/angular/issues/3395)
* **dart/transform:** Remove malfunctioning zone error handler ([68a581a](https://github.com/angular/angular/commit/68a581a)), closes [#3368](https://github.com/angular/angular/issues/3368)
* **decorators:** stop directives inheriting parent class decorators. ([f7d7789](https://github.com/angular/angular/commit/f7d7789)), closes [#2291](https://github.com/angular/angular/issues/2291)
* **docs:** add ViewDefinition, DirectiveMetadata to public API ([d4ded1a](https://github.com/angular/angular/commit/d4ded1a)), closes [#3346](https://github.com/angular/angular/issues/3346)
* remove unused imports ([39b0286](https://github.com/angular/angular/commit/39b0286))
* **parser:** detect empty expression in strings to interpolate ([4422819](https://github.com/angular/angular/commit/4422819)), closes [#3412](https://github.com/angular/angular/issues/3412) [#3451](https://github.com/angular/angular/issues/3451)
* **query:** view query should not be updated when subviews are attached. ([34acef5](https://github.com/angular/angular/commit/34acef5))
* **render:** allow to configure when templates are serialized to strings ([dd06a87](https://github.com/angular/angular/commit/dd06a87)), closes [#3418](https://github.com/angular/angular/issues/3418) [#3433](https://github.com/angular/angular/issues/3433)
* **router:** ensure navigation via back button works ([7bf7ec6](https://github.com/angular/angular/commit/7bf7ec6)), closes [#2201](https://github.com/angular/angular/issues/2201)
* **style_url_resolver:** fix data: url resolution ([73b7d99](https://github.com/angular/angular/commit/73b7d99))
* **testing:** Fixed race condition in WebWorker and Routing tests ([eee2146](https://github.com/angular/angular/commit/eee2146))
* **XHRConnection:** use xhr status code ([96eefdf](https://github.com/angular/angular/commit/96eefdf)), closes [#2841](https://github.com/angular/angular/issues/2841)

### Features

* implement web-tracing-framework support ([77875a2](https://github.com/angular/angular/commit/77875a2)), closes [#2610](https://github.com/angular/angular/issues/2610)
* **compiler:** introduce schema for elements ([d894aa9](https://github.com/angular/angular/commit/d894aa9)), closes [#3353](https://github.com/angular/angular/issues/3353)
* enable the decorators compiler option. ([0bb78b7](https://github.com/angular/angular/commit/0bb78b7))
* **md-button:** enhance button focus appearance. ([6d280ea](https://github.com/angular/angular/commit/6d280ea))
* export a proper promise type. ([861be30](https://github.com/angular/angular/commit/861be30))
* upgrade ts2dart to 0.7.1. ([a62a6ba](https://github.com/angular/angular/commit/a62a6ba))
* **core:** made directives shadow native element properties ([3437d56](https://github.com/angular/angular/commit/3437d56))
* **pipes:** replaces iterable and key value diffing pipes with services ([392de4a](https://github.com/angular/angular/commit/392de4a))
* **router:** add `back()` support to `MockLocationStrategy` ([60f38ea](https://github.com/angular/angular/commit/60f38ea))
* **testability:** Expose function getAllAngularTestabilities ([7b94bbf](https://github.com/angular/angular/commit/7b94bbf))
* **transformers:** add more information to factory debug reflection ([be79942](https://github.com/angular/angular/commit/be79942))
* **WebWorkers:** Add WebWorker Todo Example. Add support for more DOM events. ([c5cb700](https://github.com/angular/angular/commit/c5cb700))
* **WebWorkers:** Add WebWorker Todo Example. Add support for more DOM events. ([d44827a](https://github.com/angular/angular/commit/d44827a))

### Performance Improvements

* **change_detection:** do not check intermediate results ([c1ee943](https://github.com/angular/angular/commit/c1ee943))
* **change_detection:** do not generate onAllChangesDone when not needed ([adc2739](https://github.com/angular/angular/commit/adc2739))
* **change_detection:** removed the currentProto property ([71ea199](https://github.com/angular/angular/commit/71ea199))


### BREAKING CHANGES

*     Directives that previously injected Pipes to get iterableDiff or keyvalueDiff, now should inject IterableDiffers and KeyValueDiffers.
*     Previously, if an element had a property, Angular would update that property even if there was a directive placed on the same element with the same property. Now, the directive would have to explicitly update the native elmement by either using hostProperties or the renderer.



<a name="2.0.0-alpha.33"></a>
# [2.0.0-alpha.33](https://github.com/angular/angular/compare/2.0.0-alpha.32...2.0.0-alpha.33) (2015-07-29)


### Bug Fixes

* **.d.ts:** Correct new Type interface return type ([78fdf9a](https://github.com/angular/angular/commit/78fdf9a)), closes [#2399](https://github.com/angular/angular/issues/2399) [#3316](https://github.com/angular/angular/issues/3316)
* **build:** don't trigger travis on g3sync branch ([61b7703](https://github.com/angular/angular/commit/61b7703))
* **change_detection:** convert interpolated null values to empty strings ([345fa52](https://github.com/angular/angular/commit/345fa52)), closes [#3007](https://github.com/angular/angular/issues/3007) [#3271](https://github.com/angular/angular/issues/3271)
* **class:** allow class names with mixed case ([a8b5725](https://github.com/angular/angular/commit/a8b5725)), closes [#3001](https://github.com/angular/angular/issues/3001) [#3264](https://github.com/angular/angular/issues/3264)
* **class:** correctly clean up on destroy ([1438922](https://github.com/angular/angular/commit/1438922)), closes [#3249](https://github.com/angular/angular/issues/3249) [#3256](https://github.com/angular/angular/issues/3256)
* **compiler:** prevent race conditions ([5ec67ee](https://github.com/angular/angular/commit/5ec67ee)), closes [#3206](https://github.com/angular/angular/issues/3206) [#3211](https://github.com/angular/angular/issues/3211)
* **core:** fix type error in setElementProperty ([448264b](https://github.com/angular/angular/commit/448264b)), closes [#3279](https://github.com/angular/angular/issues/3279)
* **dart/transform:** Handle mixed lifecycle specs ([23cd385](https://github.com/angular/angular/commit/23cd385)), closes [#3276](https://github.com/angular/angular/issues/3276)
* **element_injector:** do not throw when cannot find element when trying to report an error ([03c8e74](https://github.com/angular/angular/commit/03c8e74))
* **lowercase,uppercase:** make stateless pipes ([4dc6d74](https://github.com/angular/angular/commit/4dc6d74)), closes [#3173](https://github.com/angular/angular/issues/3173) [#3189](https://github.com/angular/angular/issues/3189)
* **presubmit:** corrected user/email for git push ([e40ff36](https://github.com/angular/angular/commit/e40ff36))
* **projection:** allow more bound render elements than app elements. ([46502e4](https://github.com/angular/angular/commit/46502e4)), closes [#3236](https://github.com/angular/angular/issues/3236) [#3247](https://github.com/angular/angular/issues/3247)
* **projection:** allow to project to a non text node ([b44b06c](https://github.com/angular/angular/commit/b44b06c)), closes [#3230](https://github.com/angular/angular/issues/3230) [#3241](https://github.com/angular/angular/issues/3241)
* **query:** the view should not be visible to @Query. ([1d45029](https://github.com/angular/angular/commit/1d45029))
* **transformer:** Don't throw on annotations that don't match a descriptor. ([f575ba6](https://github.com/angular/angular/commit/f575ba6)), closes [#3280](https://github.com/angular/angular/issues/3280)
* **transformer:** Fix generation of `annotations` argument when registering functions. ([2faa898](https://github.com/angular/angular/commit/2faa898))
* **transformer:** Loggers now are per zone and each transform runs in its own zone ([bd65b63](https://github.com/angular/angular/commit/bd65b63))
* **typings:** test our .d.ts with --noImplicitAny ([19d8b22](https://github.com/angular/angular/commit/19d8b22))
* **url_resolver:** in Dart make package urls relative to AppRootUrl ([469afda](https://github.com/angular/angular/commit/469afda))
* addresses a couple ddc type errors ([f1e4292](https://github.com/angular/angular/commit/f1e4292))

### Features

* **benchmark:** add static_tree benchmark ([854b5b7](https://github.com/angular/angular/commit/854b5b7)), closes [#3196](https://github.com/angular/angular/issues/3196)
* **bootstrap:** remove the need for explicit reflection setup in bootstrap code ([3531bb7](https://github.com/angular/angular/commit/3531bb7))
* **build:** initial SauceLabs setup ([eebd736](https://github.com/angular/angular/commit/eebd736)), closes [#2347](https://github.com/angular/angular/issues/2347)
* **change_detection:** generate checkNoChanges only in dev mode ([71bb4b3](https://github.com/angular/angular/commit/71bb4b3))
* **change_detection:** provide error context for change detection errors ([c2bbda0](https://github.com/angular/angular/commit/c2bbda0))
* **core:** provide an error context when an exception happens in an error handler ([8543c34](https://github.com/angular/angular/commit/8543c34))
* **dart/transform:** Populate `lifecycle` from lifecycle interfaces ([8ad4ad5](https://github.com/angular/angular/commit/8ad4ad5)), closes [#3181](https://github.com/angular/angular/issues/3181)
* **di:** added context to runtime DI errors ([5a86f85](https://github.com/angular/angular/commit/5a86f85))
* **exception_handler:** change ExceptionHandler to output context ([fdf226a](https://github.com/angular/angular/commit/fdf226a))
* **exception_handler:** print originalException and originalStack for all exceptions ([e744409](https://github.com/angular/angular/commit/e744409))
* **http:** call complete on request complete ([6fac901](https://github.com/angular/angular/commit/6fac901)), closes [#2635](https://github.com/angular/angular/issues/2635)
* **http.ts:** export BrowserXHR ([8a91d71](https://github.com/angular/angular/commit/8a91d71)), closes [#2641](https://github.com/angular/angular/issues/2641)
* **lang:** added "context" to BaseException ([8ecb632](https://github.com/angular/angular/commit/8ecb632))
* **router:** use querystring params for top-level routes ([fdffcab](https://github.com/angular/angular/commit/fdffcab)), closes [#3017](https://github.com/angular/angular/issues/3017)
* **testability:** hook zone into whenstable api with async support ([a8b75c3](https://github.com/angular/angular/commit/a8b75c3))
* **transformers:** directive aliases in Dart transformers (fix #1747) ([fd46b49](https://github.com/angular/angular/commit/fd46b49)), closes [#1747](https://github.com/angular/angular/issues/1747)
* **url_resolver:** support package: urls (fixes #2991) ([408618b](https://github.com/angular/angular/commit/408618b)), closes [#2991](https://github.com/angular/angular/issues/2991)

### Reverts

* style(ngFor): add whitespace to `Directive` annotation ([74b311a](https://github.com/angular/angular/commit/74b311a))


### BREAKING CHANGES

* View renderer used to take normalized CSS class names (ex. fooBar for foo-bar).
With this change a rendered implementation gets a calss name as specified in a
template, without any transformations / normalization. This change only affects
custom view renderers that should be updated accordingly.
* S:
Dart applications and TypeScript applications meant to transpile to Dart must now
import `package:angular2/bootstrap.dart` instead of `package:angular2/angular2.dart`
in their bootstrap code. `package:angular2/angular2.dart` no longer export the
bootstrap function. The transformer rewrites imports of `bootstrap.dart` and calls
to `bootstrap` to `bootstrap_static.dart` and `bootstrapStatic` respectively.



<a name="2.0.0-alpha.32"></a>
# [2.0.0-alpha.32](https://github.com/angular/angular/compare/2.0.0-alpha.31...2.0.0-alpha.32) (2015-07-21)


### Bug Fixes

* **api_docs:** slightly more accurate description of Dart overrideOnEventDone ([a4915ad](https://github.com/angular/angular/commit/a4915ad))
* **api_docs:** slightly more accurate description of TS overrideOnEventDone ([fe3a559](https://github.com/angular/angular/commit/fe3a559))
* **build:** clang-format ([66ec4d1](https://github.com/angular/angular/commit/66ec4d1))
* **change_detect:** Handle '$' in change detector strings ([f1e8176](https://github.com/angular/angular/commit/f1e8176))
* **change_detect:** Sort `DirectiveMetadata` properties during processing ([b2a0be8](https://github.com/angular/angular/commit/b2a0be8))
* **content_projection:** allow to project text nodes to a place without bindings ([a472eac](https://github.com/angular/angular/commit/a472eac)), closes [#3163](https://github.com/angular/angular/issues/3163) [#3179](https://github.com/angular/angular/issues/3179)
* **di:** do not rely on the fact that types are canonicalized ([2147ce4](https://github.com/angular/angular/commit/2147ce4))
* **di:** fixed dynamic component loading of components created in child injector ([5749692](https://github.com/angular/angular/commit/5749692))
* **di:** fixed types ([2f08ed8](https://github.com/angular/angular/commit/2f08ed8))
* **di:** instatiate services lazily ([7531b48](https://github.com/angular/angular/commit/7531b48))
* **element_injector:** inject the containing change detector ref to directives ([7879761](https://github.com/angular/angular/commit/7879761))
* **examples:** add a couple entrypoints, adjust pubspec, fix change detector bug in Dart ([b03560b](https://github.com/angular/angular/commit/b03560b))
* **facade:** use base element to get base href ([8296dce](https://github.com/angular/angular/commit/8296dce))
* **forms:** default the initial value of Control to null ([5b597de](https://github.com/angular/angular/commit/5b597de))
* **forms:** do not reset the value of the input when it came from the view ([b123159](https://github.com/angular/angular/commit/b123159))
* **html_adapter:** Implement hasAttribute and getAttribute. ([e988f59](https://github.com/angular/angular/commit/e988f59))
* **ng_for:** fixed ng_for to pass a change detector ref to the pipe registry ([583c5ff](https://github.com/angular/angular/commit/583c5ff))
* **publish:** add force flag for pub publish script ([621604d](https://github.com/angular/angular/commit/621604d)), closes [#3077](https://github.com/angular/angular/issues/3077)
* **renderer:** handle empty fragments correctly ([61c7357](https://github.com/angular/angular/commit/61c7357)), closes [#3100](https://github.com/angular/angular/issues/3100)
* **router:** improve error for missing base href ([011fab3](https://github.com/angular/angular/commit/011fab3)), closes [#3096](https://github.com/angular/angular/issues/3096)
* **router:** improve error messages for routes with no config ([8bdca5c](https://github.com/angular/angular/commit/8bdca5c)), closes [#2323](https://github.com/angular/angular/issues/2323)
* **router:** throw when reserved characters used in route definition ([c6409cb](https://github.com/angular/angular/commit/c6409cb)), closes [#3021](https://github.com/angular/angular/issues/3021)
* **transformers:** fix sort order for reflective imports ([762a94f](https://github.com/angular/angular/commit/762a94f))
* **view_manager:** allow to create host views even if there is an embedded view at the same place. ([116b64d](https://github.com/angular/angular/commit/116b64d))

### Features

* FunctionWithParamTokens.execute now returns the value of the function ([3dd05ef](https://github.com/angular/angular/commit/3dd05ef))
* **compiler:** attach components and project light dom during compilation. ([b1df545](https://github.com/angular/angular/commit/b1df545)), closes [#2529](https://github.com/angular/angular/issues/2529)
* upgrade ts2dart to 0.6.9. ([3810e4b](https://github.com/angular/angular/commit/3810e4b))
* **build:** require parameter types ([de18da2](https://github.com/angular/angular/commit/de18da2)), closes [#2833](https://github.com/angular/angular/issues/2833)
* **change_detection:** added support for ObservableList from package:observe ([d449ea5](https://github.com/angular/angular/commit/d449ea5))
* **compiler:** Support $baseUrl in HTML attributes when loading a template. ([e942709](https://github.com/angular/angular/commit/e942709))
* **core:** add ability to reflect DOM properties as attributes ([903ff90](https://github.com/angular/angular/commit/903ff90)), closes [#2910](https://github.com/angular/angular/issues/2910)
* **facade:** add getTypeNameForDebugging function ([ccb4163](https://github.com/angular/angular/commit/ccb4163))
* **forms:** Export NgSelectOption directive ([f74d97e](https://github.com/angular/angular/commit/f74d97e))
* **http:** add support for JSONP requests ([81abc39](https://github.com/angular/angular/commit/81abc39)), closes [#2905](https://github.com/angular/angular/issues/2905) [#2818](https://github.com/angular/angular/issues/2818)
* **pipes:** changed .append to .extend ([4c8ea12](https://github.com/angular/angular/commit/4c8ea12))
* **router:** add interfaces for route definitions in RouteConfig ([4d28167](https://github.com/angular/angular/commit/4d28167)), closes [#2261](https://github.com/angular/angular/issues/2261)
* **transformers:** expose DI transformer for use by packages ([2bc1217](https://github.com/angular/angular/commit/2bc1217)), closes [#2814](https://github.com/angular/angular/issues/2814)
* **transformers:** implement initializing deferred libraries ([5cc84ed](https://github.com/angular/angular/commit/5cc84ed))

### Performance Improvements

* **dom:** Only send values for existing properties to js interior ([153660f](https://github.com/angular/angular/commit/153660f)), closes [#3149](https://github.com/angular/angular/issues/3149)


### BREAKING CHANGES

*     Pipes.append has been renamed into Pipes.extend.
    Pipes.extend prepends pipe factories instead of appending them.
* S:
- shadow dom emulation no longer
  supports the `<content>` tag. Use the new `<ng-content>` instead
  (works with all shadow dom strategies).
- removed `DomRenderer.setViewRootNodes` and `AppViewManager.getComponentView`
  -> use `DomRenderer.getNativeElementSync(elementRef)` and change shadow dom directly
- the `Renderer` interface has changed:
  * `createView` now also has to support sub views
  * the notion of a container has been removed. Instead, the renderer has
    to implement methods to attach views next to elements or other views.
  * a RenderView now contains multiple RenderFragments. Fragments
    are used to move DOM nodes around.
Internal changes / design changes:
- Introduce notion of view fragments on render side
- DomProtoViews and DomViews on render side are merged,
  AppProtoViews are not merged, AppViews are partially merged
  (they share arrays with the other merged AppViews but we keep
  individual AppView instances for now).
- DomProtoViews always have a `<template>` element as root
  * needed for storing subviews
  * we have less chunks of DOM to clone now
- remove fake ElementBinder / Bound element for root text bindings
  and model them explicitly. This removes a lot of special cases we had!
- AppView shares data with nested component views
- some methods in AppViewManager (create, hydrate, dehydrate) are iterative now
  * now possible as we have all child AppViews / ElementRefs already in an array!



<a name="2.0.0-alpha.31"></a>
# [2.0.0-alpha.31](https://github.com/angular/angular/compare/2.0.0-alpha.30...2.0.0-alpha.31) (2015-07-14)


### Bug Fixes

* **build:** clang-format ([df877a7](https://github.com/angular/angular/commit/df877a7))
* **build:** reduce the deploy upload. ([4264bd3](https://github.com/angular/angular/commit/4264bd3))
* **build:** remove the travis deploy step, which is broken. ([206c9bd](https://github.com/angular/angular/commit/206c9bd))
* **compiler:** keep `DOM.hasProperty` in sync between browser and transformer. ([b3a763a](https://github.com/angular/angular/commit/b3a763a)), closes [#2984](https://github.com/angular/angular/issues/2984) [#2981](https://github.com/angular/angular/issues/2981)
* **css_shim:** fixes multiple uses of polyfill-unscoped-rule. ([749d043](https://github.com/angular/angular/commit/749d043))
* **di:** do not use exceptions to detect if reflection is enabled ([a621046](https://github.com/angular/angular/commit/a621046))
* **di:** hostInjector and viewInjector support nested arrays ([0ed5dd0](https://github.com/angular/angular/commit/0ed5dd0))
* **di:** removed default visibility ([04baa46](https://github.com/angular/angular/commit/04baa46))
* **example:** add missing todo ([1427d73](https://github.com/angular/angular/commit/1427d73))
* **package.json:** move some deps into dev deps. ([546a8f9](https://github.com/angular/angular/commit/546a8f9)), closes [#2448](https://github.com/angular/angular/issues/2448)
* **router:** ensure that page refresh with hash URLs works ([c177d88](https://github.com/angular/angular/commit/c177d88)), closes [#2920](https://github.com/angular/angular/issues/2920)
* **router:** export lifecycle hooks in bundle ([97ef1c2](https://github.com/angular/angular/commit/97ef1c2))
* **router:** fix broken `HashLocationStrategy` string issue for dart ([d6dadc6](https://github.com/angular/angular/commit/d6dadc6))
* **transform:** handle multiple interfaces in directive processor ([ac50ffc](https://github.com/angular/angular/commit/ac50ffc)), closes [#2941](https://github.com/angular/angular/issues/2941)
* **transformer:** Event getters now use property name not event name ([cf103de](https://github.com/angular/angular/commit/cf103de))
* **transformer:** fix 'pub build' in examples ([6258929](https://github.com/angular/angular/commit/6258929))
* **tsconfig:** target should be lower case ([0792f1a](https://github.com/angular/angular/commit/0792f1a)), closes [#2938](https://github.com/angular/angular/issues/2938)

### Features

* **build:** Allow building in windows without admin priviledges ([f1f5784](https://github.com/angular/angular/commit/f1f5784)), closes [#2873](https://github.com/angular/angular/issues/2873)
* **forms:** changed all form directives to have basic control attributes ([3f7ebde](https://github.com/angular/angular/commit/3f7ebde))
* **license:** include license files in dev and dev.sfx bundles ([1eab4f5](https://github.com/angular/angular/commit/1eab4f5))
* **pipes:** add date pipe ([b716046](https://github.com/angular/angular/commit/b716046)), closes [#2877](https://github.com/angular/angular/issues/2877)
* **pipes:** add number (decimal, percent, currency) pipes ([3143d18](https://github.com/angular/angular/commit/3143d18))
* **pipes:** add static append method to Pipes ([1eebcea](https://github.com/angular/angular/commit/1eebcea)), closes [#2901](https://github.com/angular/angular/issues/2901)
* upgrade clang-format to v1.0.28. ([45994a5](https://github.com/angular/angular/commit/45994a5))
* **query:** initial implementation of view query. ([7ee6963](https://github.com/angular/angular/commit/7ee6963)), closes [#1935](https://github.com/angular/angular/issues/1935)
* **router:** introduce matrix params ([5677bf7](https://github.com/angular/angular/commit/5677bf7)), closes [#2774](https://github.com/angular/angular/issues/2774) [#2989](https://github.com/angular/angular/issues/2989)
* **router:** lifecycle hooks ([a9a552c](https://github.com/angular/angular/commit/a9a552c)), closes [#2640](https://github.com/angular/angular/issues/2640)
* **test:** add test bundle ([71c65b4](https://github.com/angular/angular/commit/71c65b4))
* **zone:** add "on event done" zone hook ([0e28297](https://github.com/angular/angular/commit/0e28297))


### BREAKING CHANGES

*     Directives will use the Unbounded visibility by default, whereas before the change they used Self



<a name="2.0.0-alpha.30"></a>
# [2.0.0-alpha.30](https://github.com/angular/angular/compare/2.0.0-alpha.29...2.0.0-alpha.30) (2015-07-08)


### Bug Fixes

* **.d.ts:** correct ComponentAnnotation inheritance ([12a427e](https://github.com/angular/angular/commit/12a427e)), closes [#2356](https://github.com/angular/angular/issues/2356)
* **angular2.d.ts:** show typing for Component, etc ([b10d7a2](https://github.com/angular/angular/commit/b10d7a2))
* **change_detection:** do not coalesce records with different directive indices ([d277442](https://github.com/angular/angular/commit/d277442))
* **change_detection:** throw ChangeDetectionError in JIT mode ([c2efa23](https://github.com/angular/angular/commit/c2efa23))
* **compiler:** detect and strip data- prefix from bindings ([cd65fc2](https://github.com/angular/angular/commit/cd65fc2)), closes [#2687](https://github.com/angular/angular/issues/2687) [#2719](https://github.com/angular/angular/issues/2719)
* **di:** injecting null causes a cyclic dependency ([d1393b0](https://github.com/angular/angular/commit/d1393b0))
* handle errors w/o file information. ([e69af1a](https://github.com/angular/angular/commit/e69af1a))
* **forms:** Remove cyclic dependency ([e5405e4](https://github.com/angular/angular/commit/e5405e4)), closes [#2856](https://github.com/angular/angular/issues/2856)
* **Http:** add support for headers ([883b506](https://github.com/angular/angular/commit/883b506))
* **router:** allow generating links with numeric params ([d828664](https://github.com/angular/angular/commit/d828664))
* **router:** child routers should delegate navigation to the root router ([1c94c32](https://github.com/angular/angular/commit/1c94c32))
* **transformer:** Fix string interpolation for bindings. ([311b477](https://github.com/angular/angular/commit/311b477))
* **transformer:** Put paramater data in the same order as the reflected version. ([2b45bd2](https://github.com/angular/angular/commit/2b45bd2))
* **transformer:** Support prefixed annotations in the transformer. ([9e1158d](https://github.com/angular/angular/commit/9e1158d))

### Features

* upgrade t2dart to 0.6.8. ([d381c5f](https://github.com/angular/angular/commit/d381c5f))
* **NgStyle:** Export NgStyle in angular2/directives ([edf5053](https://github.com/angular/angular/commit/edf5053)), closes [#2878](https://github.com/angular/angular/issues/2878)
* **router:** support deep-linking to siblings ([286a249](https://github.com/angular/angular/commit/286a249)), closes [#2807](https://github.com/angular/angular/issues/2807)
* **transformer:** Support @Injectable() on static functions ([7986e7c](https://github.com/angular/angular/commit/7986e7c))
* **typings:** mark void methods in angular2.d.ts ([a56d33d](https://github.com/angular/angular/commit/a56d33d))



<a name="2.0.0-alpha.29"></a>
# [2.0.0-alpha.29](https://github.com/angular/angular/compare/2.0.0-alpha.28...2.0.0-alpha.29) (2015-07-01)


### Bug Fixes

* **build:** add missing return types now enforced by linter ([4489199](https://github.com/angular/angular/commit/4489199))
* **build:** fix paths in `test.typings` task ([1c8a589](https://github.com/angular/angular/commit/1c8a589))
* **build:** Reduce rx typings to what we actually require. ([8bab6dd](https://github.com/angular/angular/commit/8bab6dd))
* **bundle:** don’t bundle traceur/reflect into benchpress ([da4de21](https://github.com/angular/angular/commit/da4de21))
* **bundle:** don’t bundle traceur/reflect into benchpress - amended change ([d629ed7](https://github.com/angular/angular/commit/d629ed7))
* **change detectors:** Fix deduping of protos in transformed dart mode. ([73a939e](https://github.com/angular/angular/commit/73a939e))
* **compiler:** don't trigger duplicated directives ([0598226](https://github.com/angular/angular/commit/0598226)), closes [#2756](https://github.com/angular/angular/issues/2756) [#2568](https://github.com/angular/angular/issues/2568)
* **docs:** link to clang-format ([f1cf529](https://github.com/angular/angular/commit/f1cf529))
* **docs:** to run js test 'gulp docs' is needed ([3e65037](https://github.com/angular/angular/commit/3e65037)), closes [#2762](https://github.com/angular/angular/issues/2762)
* export top-level pipe factories as const ([393f703](https://github.com/angular/angular/commit/393f703))
* **dynamic_component_loader:** check whether the dynamically loaded component has already been destroyed ([d6cef88](https://github.com/angular/angular/commit/d6cef88)), closes [#2748](https://github.com/angular/angular/issues/2748) [#2767](https://github.com/angular/angular/issues/2767)
* **Router:** mark Pipeline and RouteRegistry as Injectable ([eea989b](https://github.com/angular/angular/commit/eea989b)), closes [#2755](https://github.com/angular/angular/issues/2755)
* **transformer:** Add getters for `events`. ([5a21dc5](https://github.com/angular/angular/commit/5a21dc5))
* **transformer:** Don't hang on bad urls and log better errors ([d037c08](https://github.com/angular/angular/commit/d037c08))
* **transformer:** Fix annotation_matcher for NgForm directive. ([9c76850](https://github.com/angular/angular/commit/9c76850))
* **typings:** Minor issues preventing angular2.d.ts from working in TS 1.4. ([7a4a3c8](https://github.com/angular/angular/commit/7a4a3c8))

### Features

* **async:** added PromiseWrapper.wrap ([b688dee](https://github.com/angular/angular/commit/b688dee))
* **benchpress:** initial support for firefox ([0949a4b](https://github.com/angular/angular/commit/0949a4b)), closes [#2419](https://github.com/angular/angular/issues/2419)
* **build:** add tslint to the build. ([bc585f2](https://github.com/angular/angular/commit/bc585f2))
* **di:** changed InstantiationError to print the original stack ([eb0fd79](https://github.com/angular/angular/commit/eb0fd79))
* **di:** removed app injector ([f0e962c](https://github.com/angular/angular/commit/f0e962c))
* **facade:** add ListWrapper.toJSON method ([2335075](https://github.com/angular/angular/commit/2335075))
* **http:** refactor library to work in dart ([55bf0e5](https://github.com/angular/angular/commit/55bf0e5)), closes [#2415](https://github.com/angular/angular/issues/2415)
* **lang:** added originalException and originalStack to BaseException ([56245c6](https://github.com/angular/angular/commit/56245c6))
* **NgStyle:** add new NgStyle directive ([b50edfd](https://github.com/angular/angular/commit/b50edfd)), closes [#2665](https://github.com/angular/angular/issues/2665)
* **pipes:** add limitTo pipe ([0b50258](https://github.com/angular/angular/commit/0b50258))
* upgrade clang-format and gulp-clang-format. ([1f7296c](https://github.com/angular/angular/commit/1f7296c))
* **pipes:** support arguments in transform function ([600d53c](https://github.com/angular/angular/commit/600d53c))
* **router:** support deep-linking to anywhere in the app ([f66ce09](https://github.com/angular/angular/commit/f66ce09)), closes [#2642](https://github.com/angular/angular/issues/2642)
* **transformers:** provide a flag to disable inlining views ([dcdd730](https://github.com/angular/angular/commit/dcdd730)), closes [#2658](https://github.com/angular/angular/issues/2658)

### Performance Improvements

* **Compiler:** do not resolve bindings for cached ProtoViews ([7a7b3a6](https://github.com/angular/angular/commit/7a7b3a6))


### BREAKING CHANGES

* THe appInjector property has been removed. Instead use viewInjector or hostInjector.



<a name="2.0.0-alpha.28"></a>
# [2.0.0-alpha.28](https://github.com/angular/angular/compare/2.0.0-alpha.27...2.0.0-alpha.28) (2015-06-24)


### Bug Fixes

* **annotations:** swap DirectiveArgs & ComponentArgs ([dcc4bc2](https://github.com/angular/angular/commit/dcc4bc2))
* **benchmarks:** add waits for naive scrolling benchmark to ensure loading ([d8929c1](https://github.com/angular/angular/commit/d8929c1)), closes [#1706](https://github.com/angular/angular/issues/1706)
* **benchpress:** do not throw on unkown frame timestamp event ([ed3af5f](https://github.com/angular/angular/commit/ed3af5f)), closes [#2622](https://github.com/angular/angular/issues/2622)
* **change detection:** preserve memoized results from pure functions ([5beaf6d](https://github.com/angular/angular/commit/5beaf6d))
* **compiler:** make text interpolation more robust ([9d4111d](https://github.com/angular/angular/commit/9d4111d)), closes [#2591](https://github.com/angular/angular/issues/2591)
* **docs:** Fix docs for Directive.compileChildren ([9700e80](https://github.com/angular/angular/commit/9700e80))
* **injectors:** sync injector tree with dom element tree. ([d800d2f](https://github.com/angular/angular/commit/d800d2f))
* **parse5:** do not try to insert empty text node ([0a2f6dd](https://github.com/angular/angular/commit/0a2f6dd))
* **render:** fix failing tests in dynamic_component_loader.ts ([6149ce2](https://github.com/angular/angular/commit/6149ce2))
* **router:** return promise with error handler ([bc798b1](https://github.com/angular/angular/commit/bc798b1))
* **ShadowDomStrategy:** always inline import rules ([1c4d233](https://github.com/angular/angular/commit/1c4d233)), closes [#1694](https://github.com/angular/angular/issues/1694)
* **transformer:** Throw unimplemented errors in HtmlAdapter. ([f9d72bd](https://github.com/angular/angular/commit/f9d72bd)), closes [#2624](https://github.com/angular/angular/issues/2624) [#2627](https://github.com/angular/angular/issues/2627)
* **views:** remove dynamic component views, free host views, free embedded views ([5dee8e2](https://github.com/angular/angular/commit/5dee8e2)), closes [#2472](https://github.com/angular/angular/issues/2472) [#2339](https://github.com/angular/angular/issues/2339)
* **XHRImpl:** file:/// and IE9 bugs ([cd735c4](https://github.com/angular/angular/commit/cd735c4))

### Features

* **compiler:** detect dangling property bindings ([d7b9345](https://github.com/angular/angular/commit/d7b9345)), closes [#2598](https://github.com/angular/angular/issues/2598)
* **CSSClass:** add support for string and array expresions ([8c993dc](https://github.com/angular/angular/commit/8c993dc)), closes [#2025](https://github.com/angular/angular/issues/2025)
* **element_injector:** support multiple injectables with the same token ([c899b0a](https://github.com/angular/angular/commit/c899b0a))
* **host:** limits host properties to renames ([92ffc46](https://github.com/angular/angular/commit/92ffc46))
* **mock:** add mock module and bundle ([2932377](https://github.com/angular/angular/commit/2932377)), closes [#2325](https://github.com/angular/angular/issues/2325)
* **query:** added support for querying by var bindings ([b0e2ebd](https://github.com/angular/angular/commit/b0e2ebd))
* **render:** don’t use the reflector for setting properties ([0a51ccb](https://github.com/angular/angular/commit/0a51ccb)), closes [#2637](https://github.com/angular/angular/issues/2637)
* add constructors without type arguments. ([35e882e](https://github.com/angular/angular/commit/35e882e))
* remove MapWrapper.clear(). ([9413620](https://github.com/angular/angular/commit/9413620))
* remove MapWrapper.contains(). ([dfd3091](https://github.com/angular/angular/commit/dfd3091))
* remove MapWrapper.create()/get()/set(). ([be7ac9f](https://github.com/angular/angular/commit/be7ac9f))
* **router:** add support for hash-based location ([a67f231](https://github.com/angular/angular/commit/a67f231)), closes [#2555](https://github.com/angular/angular/issues/2555)
* update clang-format to 1.0.21. ([254e58c](https://github.com/angular/angular/commit/254e58c))
* upgrade ts2dart to 0.6.4. ([58b38c9](https://github.com/angular/angular/commit/58b38c9))
* **router:** enforce usage of ... syntax for parent to child component routes ([2d2ae9b](https://github.com/angular/angular/commit/2d2ae9b))
* **transformers:** inline styleUrls to view directive ([f2ef90b](https://github.com/angular/angular/commit/f2ef90b)), closes [#2566](https://github.com/angular/angular/issues/2566)
* **typings:** add typing specs ([24646e7](https://github.com/angular/angular/commit/24646e7))


### BREAKING CHANGES

* S:
- host actions don't take an expression as value any more but only a method name,
  and assumes to get an array via the EventEmitter with the method arguments.
- Renderer.setElementProperty does not take `style.`/... prefixes any more.
  Use the new methods `Renderer.setElementAttribute`, ... instead
Part of #2476
* compiler will throw on binding to non-existing properties.
Till now it was possible to have a binding to a non-existing property,
ex.: `<div [foo]="exp">`. From now on this is compilation error - any
property binding needs to have at least one associated property:
eaither on an HTML element or on any directive associated with a
given element (directives' properites need to be declared using the
`properties` field in the `@Directive` / `@Component` annotation).
* - `Compiler.compile` has been removed, the only way to compile
  components dynamically is via `Compiler.compileInHost`
- `DynamicComponentLoader.loadIntoExistingLocation` has changed:
  * renamed into `loadIntoLocation`
  * will always create the host element as well
  * requires an element with a variable inside of the host component view
    next to which it will load new component.
- `DynamicComponentLoader.loadNextToExistingLocation` was renamed into
  `DynamicComponentLoader.loadNextToLocation`
- `DynamicComponentLoader.loadIntoNewLocation` is removed
  * use `DynamicComponentLoader.loadNextToLocation` instead
    and then move the view nodes
    manually around via `DomRenderer.getRootNodes()`
- `AppViewManager.{create,destroy}Free{Host,Embedded}View` was removed
  * use `AppViewManager.createViewInContainer` and then move the view nodes
    manually around via `DomRenderer.getRootNodes()`
- `Renderer.detachFreeView` was removed. Use `DomRenderer.getRootNodes()`
  to get the root nodes of a view and detach them manually.



<a name="2.0.0-alpha.27"></a>
# [2.0.0-alpha.27](https://github.com/angular/angular/compare/2.0.0-alpha.26...2.0.0-alpha.27) (2015-06-17)


### Bug Fixes

* **analzyer:** removed unused imports ([902759e](https://github.com/angular/angular/commit/902759e))
* **benchmarks:** Do not apply the angular transformer to e2e tests ([cee2682](https://github.com/angular/angular/commit/cee2682)), closes [#2454](https://github.com/angular/angular/issues/2454)
* **bootstrap:** temporary disable jit change detection because of a bug in handling pure functio ([9908def](https://github.com/angular/angular/commit/9908def))
* **broccoli:** ensure that inputTrees are stable ([928ec1c](https://github.com/angular/angular/commit/928ec1c))
* **build:** ensure that asset files are copied over to example directories ([60b97b2](https://github.com/angular/angular/commit/60b97b2))
* **build:** Minify files for angular2.min.js bundle ([76797df](https://github.com/angular/angular/commit/76797df))
* **build:** only pass ts files to ts2dart transpilation. ([b5431e4](https://github.com/angular/angular/commit/b5431e4))
* **bundle:** makes interfaces.ts non-empty when transpiled. ([83e99fc](https://github.com/angular/angular/commit/83e99fc))
* **change detect:** Fix bug in JIT change detectors ([e0fbd4b](https://github.com/angular/angular/commit/e0fbd4b))
* **ci:** remove non-existent gulp task from test_e2e_dart ([1cf807c](https://github.com/angular/angular/commit/1cf807c)), closes [#2509](https://github.com/angular/angular/issues/2509)
* **Compiler:** fix text nodes after content tags ([d599fd3](https://github.com/angular/angular/commit/d599fd3)), closes [#2095](https://github.com/angular/angular/issues/2095)
* **dart/transform:** Don't set ReflectionCapabilities over an async gap ([d1b35f9](https://github.com/angular/angular/commit/d1b35f9))
* **dartfmt:** don't break win32 command line limit ([617d693](https://github.com/angular/angular/commit/617d693)), closes [#2420](https://github.com/angular/angular/issues/2420) [#1875](https://github.com/angular/angular/issues/1875)
* **diffing-broccoli-plugin:** wrapped trees are always stable ([7611f92](https://github.com/angular/angular/commit/7611f92))
* **DirectiveMetadata:** add support for events, changeDetection ([b4e82b8](https://github.com/angular/angular/commit/b4e82b8))
* **docs:** ensure no duplicates in alias names of docs ([05d02fa](https://github.com/angular/angular/commit/05d02fa))
* **docs:** order class members in order of declaration ([ea27704](https://github.com/angular/angular/commit/ea27704)), closes [#2569](https://github.com/angular/angular/issues/2569)
* **docs:** update link paths in annotations ([dd23bab](https://github.com/angular/angular/commit/dd23bab)), closes [#2452](https://github.com/angular/angular/issues/2452) [#2475](https://github.com/angular/angular/issues/2475)
* **docs:** Working generated angular2.d.ts ([7141c15](https://github.com/angular/angular/commit/7141c15))
* **dynamic_component_loader:** Fix for ts2dart issue ([bbfb4e1](https://github.com/angular/angular/commit/bbfb4e1))
* **dynamic_component_loader:** implemented dispose for dynamically-loaded components ([21dcfc8](https://github.com/angular/angular/commit/21dcfc8))
* **element_injector:** changed visibility rules to expose hostInjector of the component to its shadow d ([c51aef9](https://github.com/angular/angular/commit/c51aef9))
* **forms:** fixed the handling of the select element ([f1541e6](https://github.com/angular/angular/commit/f1541e6))
* **forms:** fixed the selector of NgRequiredValidator ([35197ac](https://github.com/angular/angular/commit/35197ac))
* **forms:** getError does not work without path ([a858f6a](https://github.com/angular/angular/commit/a858f6a))
* **forms:** updated form examples to contain select elements ([c34cb01](https://github.com/angular/angular/commit/c34cb01))
* **JsonPipe:** always transform to json ([e77710a](https://github.com/angular/angular/commit/e77710a))
* **life_cycle:** throw when recursively reentering LifeCycle.tick ([af35ab5](https://github.com/angular/angular/commit/af35ab5))
* **locals:** improved an error message ([4eb8c9b](https://github.com/angular/angular/commit/4eb8c9b))
* add types for ts2dart's façade handling. ([f3d7418](https://github.com/angular/angular/commit/f3d7418))
* Class factory now adds annotations ([bc9e482](https://github.com/angular/angular/commit/bc9e482))
* compare strings with StringWrapper.equals ([633cf63](https://github.com/angular/angular/commit/633cf63))
* corrected var/# parsing in template ([a418397](https://github.com/angular/angular/commit/a418397)), closes [#2084](https://github.com/angular/angular/issues/2084)
* declare var global. ([1346660](https://github.com/angular/angular/commit/1346660))
* Improve error message on missing dependency ([2ccc65d](https://github.com/angular/angular/commit/2ccc65d))
* improve type of TreeNode.children. ([c3c2ad1](https://github.com/angular/angular/commit/c3c2ad1))
* **npm:** update scripts and readme for npm packages. ([8923103](https://github.com/angular/angular/commit/8923103)), closes [#2377](https://github.com/angular/angular/issues/2377)
* improve type safety by typing `refs`. ([4ae7df2](https://github.com/angular/angular/commit/4ae7df2))
* include error message in the stack trace ([8d081ea](https://github.com/angular/angular/commit/8d081ea))
* increase the stack frame size for tests ([ab8eb4f](https://github.com/angular/angular/commit/ab8eb4f))
* makes NgModel work in strict mode ([eb3586d](https://github.com/angular/angular/commit/eb3586d))
* **ng_zone:** updated zone not to run onTurnDown when invoking run synchronously from onTurnDo ([15dab7c](https://github.com/angular/angular/commit/15dab7c))
* **Parser:** Parse pipes in arguments ([f974532](https://github.com/angular/angular/commit/f974532)), closes [#1680](https://github.com/angular/angular/issues/1680)
* **router:** avoid two slash values between the baseHref and the path ([cdc7b03](https://github.com/angular/angular/commit/cdc7b03))
* rename FORWARD_REF to forwardRef in the Angular code base. ([c4ecbf0](https://github.com/angular/angular/commit/c4ecbf0))
* **router:** do not prepend the root URL with a starting slash ([e372cc7](https://github.com/angular/angular/commit/e372cc7))
* **router:** ensure that root URL redirect doesn't redirect non-root URLs ([73d1525](https://github.com/angular/angular/commit/73d1525)), closes [#2221](https://github.com/angular/angular/issues/2221)
* **router:** rethrow exceptions ([5782f06](https://github.com/angular/angular/commit/5782f06)), closes [#2391](https://github.com/angular/angular/issues/2391)
* **selector:** select by attribute independent of value and order ([9bad70b](https://github.com/angular/angular/commit/9bad70b)), closes [#2513](https://github.com/angular/angular/issues/2513)
* **shadow_dom:** moves the imported nodes into the correct location. ([92d5658](https://github.com/angular/angular/commit/92d5658))
* **ShadowDom:** fix emulation integration spec to test all 3 strategies ([6e38515](https://github.com/angular/angular/commit/6e38515)), closes [#2546](https://github.com/angular/angular/issues/2546)
* **shrinkwrap:** restore fsevents dependency ([833048f](https://github.com/angular/angular/commit/833048f)), closes [#2511](https://github.com/angular/angular/issues/2511)
* **view:** local variables override local variables set by ng-for ([d8e2795](https://github.com/angular/angular/commit/d8e2795))

### Features

* **AstTranformer:** add support for missing nodes ([da60381](https://github.com/angular/angular/commit/da60381))
* **BaseRequestOptions:** add merge method to make copies of options ([93596df](https://github.com/angular/angular/commit/93596df))
* **benchpress:** add mean frame time metric ([6834c49](https://github.com/angular/angular/commit/6834c49)), closes [#2474](https://github.com/angular/angular/issues/2474)
* **benchpress:** more smoothness metrics ([35589a6](https://github.com/angular/angular/commit/35589a6))
* **broccoli:** add diffing MergeTrees plugin ([4ee3fda](https://github.com/angular/angular/commit/4ee3fda)), closes [#1815](https://github.com/angular/angular/issues/1815) [#2064](https://github.com/angular/angular/issues/2064)
* **broccoli:** improve merge-trees plugin and add "overwrite" option ([dc8dac7](https://github.com/angular/angular/commit/dc8dac7))
* **build:** add `test.unit.dartvm` for a faster roundtrip of dartvm tests ([46eeee6](https://github.com/angular/angular/commit/46eeee6))
* **change detect:** Throw on attempts to use dehydrated detector ([b6e95bb](https://github.com/angular/angular/commit/b6e95bb))
* **dart/change_detect:** Add type to ChangeDetector context ([5298055](https://github.com/angular/angular/commit/5298055)), closes [#2070](https://github.com/angular/angular/issues/2070)
* **dart/transform:** Add onInit and onCheck hooks in Dart ([17c6d6a](https://github.com/angular/angular/commit/17c6d6a))
* **dart/transform:** Allow absolute urls in templates ([a187c78](https://github.com/angular/angular/commit/a187c78))
* **dart/transform:** Record Type interfaces ([dc6e7eb](https://github.com/angular/angular/commit/dc6e7eb)), closes [#2204](https://github.com/angular/angular/issues/2204)
* **dart/transform:** Use the best available Change Detectors ([8e3bf39](https://github.com/angular/angular/commit/8e3bf39)), closes [#502](https://github.com/angular/angular/issues/502)
* **diffing-broccoli-plugin:** support multiple inputTrees ([41ae8e7](https://github.com/angular/angular/commit/41ae8e7)), closes [#1815](https://github.com/angular/angular/issues/1815) [#2064](https://github.com/angular/angular/issues/2064)
* **Directive:** Have a single Directive.host which mimics HTML ([f3b4937](https://github.com/angular/angular/commit/f3b4937)), closes [#2268](https://github.com/angular/angular/issues/2268)
* **e2e:** added e2e tests for forms ([552d1ed](https://github.com/angular/angular/commit/552d1ed))
* **ElementInjector:** throw if multiple directives define the same host injectable ([6a6b43d](https://github.com/angular/angular/commit/6a6b43d))
* **Events:** allow a different event vs field name ([29c72ab](https://github.com/angular/angular/commit/29c72ab)), closes [#2272](https://github.com/angular/angular/issues/2272) [#2344](https://github.com/angular/angular/issues/2344)
* **facade:** add isMap method ([548f3dd](https://github.com/angular/angular/commit/548f3dd))
* **FakeAsync:** check pending timers at the end of fakeAsync in Dart ([53694eb](https://github.com/angular/angular/commit/53694eb))
* **forms:** added hasError and getError methods to all controls ([1a4d237](https://github.com/angular/angular/commit/1a4d237))
* **forms:** changed forms to capture submit events and fires synthetic ng-submit events ([5fc23ca](https://github.com/angular/angular/commit/5fc23ca))
* **forms:** export validator directives as part of formDirectives ([73bce40](https://github.com/angular/angular/commit/73bce40))
* **forms:** set exportAs to form for all form related directives ([e7e82cb](https://github.com/angular/angular/commit/e7e82cb))
* **forms.ts:** formInjectables with FormBuilder ([a6cb86b](https://github.com/angular/angular/commit/a6cb86b)), closes [#2367](https://github.com/angular/angular/issues/2367)
* adjust formatting for clang-format v1.0.19. ([a6e7123](https://github.com/angular/angular/commit/a6e7123))
* allow Type.annotations = Component(...).View(...) ([b2c6694](https://github.com/angular/angular/commit/b2c6694)), closes [#2577](https://github.com/angular/angular/issues/2577)
* support decorator chaining and class creation in ES5 ([c3ae34f](https://github.com/angular/angular/commit/c3ae34f)), closes [#2534](https://github.com/angular/angular/issues/2534)
* update ts2dart to 0.6.1. ([9613772](https://github.com/angular/angular/commit/9613772))
* **http:** add basic http service ([2156810](https://github.com/angular/angular/commit/2156810)), closes [#2028](https://github.com/angular/angular/issues/2028)
* **Http:** add Http class ([b68e561](https://github.com/angular/angular/commit/b68e561)), closes [#2530](https://github.com/angular/angular/issues/2530)
* **Parser:** implement Unparser ([331a051](https://github.com/angular/angular/commit/331a051)), closes [#1949](https://github.com/angular/angular/issues/1949) [#2395](https://github.com/angular/angular/issues/2395)
* **Parser:** support if statements in actions ([7d32879](https://github.com/angular/angular/commit/7d32879)), closes [#2022](https://github.com/angular/angular/issues/2022)
* **query:** adds support for descendants and more list apis. ([355ab5b](https://github.com/angular/angular/commit/355ab5b))
* **query:** notify on changes ([5bfcca2](https://github.com/angular/angular/commit/5bfcca2))
* **router:** add routing to async components ([cd95e07](https://github.com/angular/angular/commit/cd95e07))
* **router:** allow configuring app base href via token ([cab1d0e](https://github.com/angular/angular/commit/cab1d0e))
* upgrade to clang-format v1.0.19. ([1c2abbc](https://github.com/angular/angular/commit/1c2abbc))
* **transform:** update for Directive.host ([591f742](https://github.com/angular/angular/commit/591f742))
* **transformers:** updated transformers ([e5419fe](https://github.com/angular/angular/commit/e5419fe))
* **view:** added support for exportAs, so any directive can be assigned to a variable ([69b75b7](https://github.com/angular/angular/commit/69b75b7))
* **View:** add support for styleUrls and styles ([ac3e624](https://github.com/angular/angular/commit/ac3e624)), closes [#2382](https://github.com/angular/angular/issues/2382)

### Performance Improvements

* **render:** don't create property setters if not needed ([4f27611](https://github.com/angular/angular/commit/4f27611))
* **render:** don’t create an intermediate element array in renderer ([9cd510a](https://github.com/angular/angular/commit/9cd510a))
* **render:** only create `LightDom` instances if the element has children ([ca09701](https://github.com/angular/angular/commit/ca09701))
* **render:** precompute # bound text nodes and root nodes in `DomProtoView` ([24e647e](https://github.com/angular/angular/commit/24e647e))
* **RouterLink:** use hostListeners for click ([92f1af8](https://github.com/angular/angular/commit/92f1af8)), closes [#2401](https://github.com/angular/angular/issues/2401)


### BREAKING CHANGES

* By default Query only queries direct children.
* Before
    @Directive({
      hostListeners: {'event': 'statement'},
      hostProperties: {'expression': 'hostProp'},
      hostAttributes: {'attr': 'value'},
      hostActions: {'action': 'statement'}
    })
After
    @Directive({
      host: {
        '(event)': 'statement',
        '[hostProp]': 'expression'  // k & v swapped
        'attr': 'value',
        '@action': 'statement'
      }
    })
* no longer cache ref



<a name="2.0.0-alpha.26"></a>
# [2.0.0-alpha.26](https://github.com/angular/angular/compare/2.0.0-alpha.25...2.0.0-alpha.26) (2015-06-04)


### Bug Fixes

* **ast:** fix the size of a list in _evalListCache ([0387221](https://github.com/angular/angular/commit/0387221))
* **benchpress:** add index to root of module ([383f0a1](https://github.com/angular/angular/commit/383f0a1))
* **benchpress:** support nested intervals ([c280fe8](https://github.com/angular/angular/commit/c280fe8))
* **binding:** unbalanced curly brackets in documentation ([a80921b](https://github.com/angular/angular/commit/a80921b))
* **browser_adapter:** assigning null to document.title sets the title to "null" (IE11, Firefox) ([92c2c33](https://github.com/angular/angular/commit/92c2c33))
* **browser_adapter:** element.getBoundingClientRect fails when element not in DOM (IE11) ([f35dbb9](https://github.com/angular/angular/commit/f35dbb9))
* **browser_adapter:** element.matches only available with prefix (IE11) ([a393f84](https://github.com/angular/angular/commit/a393f84))
* **browser_adapter:** event creation fails (IE11, Firefox) ([665ccaf](https://github.com/angular/angular/commit/665ccaf))
* **browser_adapter:** HTMLStyleElement.innerText does not trigger creation of CSS rules (Firefox) ([b2a24e0](https://github.com/angular/angular/commit/b2a24e0))
* **build:** also run ts tests in node. ([05774f6](https://github.com/angular/angular/commit/05774f6))
* **build:** make dart formatter errors more readable ([31b6687](https://github.com/angular/angular/commit/31b6687))
* **build:** remove nonexistant dart format task from gulpfile ([f74d772](https://github.com/angular/angular/commit/f74d772))
* **collection:** iterator on Map keys is not supported (Safari) ([4b98ed1](https://github.com/angular/angular/commit/4b98ed1)), closes [#2096](https://github.com/angular/angular/issues/2096)
* **collection:** new Map(iterable) is not supported (Safari) ([d308e55](https://github.com/angular/angular/commit/d308e55))
* **collection:** new Set(iterable) is not supported (IE11, Safari) ([57b88ec](https://github.com/angular/angular/commit/57b88ec)), closes [#2063](https://github.com/angular/angular/issues/2063)
* **core:** resurrect OnChange interface ([d48fae3](https://github.com/angular/angular/commit/d48fae3))
* **dart/transform:** Fix DirectiveMetadata read tests ([000a8e2](https://github.com/angular/angular/commit/000a8e2))
* **dartdocs:** Hide duplicate exports from guinness. ([17e1d7f](https://github.com/angular/angular/commit/17e1d7f))
* **deps:** Update clang-format to 1.0.14. ([15f1eb2](https://github.com/angular/angular/commit/15f1eb2))
* **di:** allow `@Inject(…)` to work in dart2js and dynamic reflection ([4a3fd5e](https://github.com/angular/angular/commit/4a3fd5e)), closes [#2185](https://github.com/angular/angular/issues/2185)
* **docs:** generate d.ts file only for angular2/angular2. ([0a0b84a](https://github.com/angular/angular/commit/0a0b84a))
* **dom:** `querySelectorAll` should only query child nodes ([307011a](https://github.com/angular/angular/commit/307011a))
* **dom:** allow to correctly clone document fragments ([2351896](https://github.com/angular/angular/commit/2351896))
* **example:** unused event ([f83f1ee](https://github.com/angular/angular/commit/f83f1ee))
* **examples:** update form example to use NgIf ([1ad6558](https://github.com/angular/angular/commit/1ad6558))
* **facade:** Fix bug in TS indexOf ([cda3510](https://github.com/angular/angular/commit/cda3510))
* **facade:** Make PromiseWrapper#all semantics equivalent ([22f5925](https://github.com/angular/angular/commit/22f5925))
* **fake_async:** fixed fakeAsync to throw instead of crashing on cjs ([5c53cf6](https://github.com/angular/angular/commit/5c53cf6))
* **forms:** disabled form tests on cjs until fakeAsync is fixed ([cd52d8a](https://github.com/angular/angular/commit/cd52d8a))
* **Global && src/facade && Protractor:** Allows List to be imported. ([1d24e2c](https://github.com/angular/angular/commit/1d24e2c))
* **gulp:** prevent duplicate error messages ([381d4cb](https://github.com/angular/angular/commit/381d4cb)), closes [#2021](https://github.com/angular/angular/issues/2021)
* **injectable:** add missing @Injectables annotations ([0c7f05f](https://github.com/angular/angular/commit/0c7f05f)), closes [#2173](https://github.com/angular/angular/issues/2173)
* **package.json:** add `reflect-metadata` to package.json ([6080177](https://github.com/angular/angular/commit/6080177)), closes [#2170](https://github.com/angular/angular/issues/2170)
* **render:** don’t store a document fragment as bound element ([24bc4b6](https://github.com/angular/angular/commit/24bc4b6))
* **render:** only look for content tags in views that might have them. ([ba7956f](https://github.com/angular/angular/commit/ba7956f)), closes [#2297](https://github.com/angular/angular/issues/2297)
* **router:** event.defaultPrevented is not reliable (IE11) ([2287938](https://github.com/angular/angular/commit/2287938))
* **selector:** support multiple `:not` clauses ([62a9582](https://github.com/angular/angular/commit/62a9582)), closes [#2243](https://github.com/angular/angular/issues/2243)
* **ShadowCss:** keyframes tests failing in Safari ([4c8e11a](https://github.com/angular/angular/commit/4c8e11a)), closes [#2283](https://github.com/angular/angular/issues/2283)
* **src/reflection && src/test_lib:** Fixes bugs that caused benchmarks to fail. ([9e36539](https://github.com/angular/angular/commit/9e36539))
* **test:** adds longer timers for NgZone and PromisePipe tests (IE11) ([661a047](https://github.com/angular/angular/commit/661a047)), closes [#2055](https://github.com/angular/angular/issues/2055)
* **test:** clang formatting errors ([05d66bb](https://github.com/angular/angular/commit/05d66bb))
* **test:** function.name is not available (IE11) ([5103f08](https://github.com/angular/angular/commit/5103f08))
* **test:** native shadow DOM is required (IE11, Firefox) ([9802deb](https://github.com/angular/angular/commit/9802deb))
* fix clang errors ([01fb8e6](https://github.com/angular/angular/commit/01fb8e6))
* format a file that slipped in. ([471a1b6](https://github.com/angular/angular/commit/471a1b6))
* **test:** solve CSS discrepancies across browsers ([fb42d59](https://github.com/angular/angular/commit/fb42d59)), closes [#2177](https://github.com/angular/angular/issues/2177)
* **test:** use a not expandable CSS rule in ShadowCSS spec (Firefox) ([588fbfd](https://github.com/angular/angular/commit/588fbfd)), closes [#2061](https://github.com/angular/angular/issues/2061)
* **tests:** disable mobile emulation so benchmarks run on current chrome ([b071b66](https://github.com/angular/angular/commit/b071b66))
* **Tools:** Moves files out of dart2js/**/web. ([4015037](https://github.com/angular/angular/commit/4015037))
* **types:** parametrize QueryList. ([552985e](https://github.com/angular/angular/commit/552985e))

### Features

* **benchpress:** Add extension for ff metrics reporting ([b390f44](https://github.com/angular/angular/commit/b390f44)), closes [#1976](https://github.com/angular/angular/issues/1976)
* **binding:** throw on binding to a blank alias ([ec2d8cc](https://github.com/angular/angular/commit/ec2d8cc)), closes [#2068](https://github.com/angular/angular/issues/2068)
* **broccoli:** add incremental dartfmt plugin ([e5d06e4](https://github.com/angular/angular/commit/e5d06e4)), closes [#2211](https://github.com/angular/angular/issues/2211)
* **change_detection:** added onInit and onCheck hooks ([c39c8eb](https://github.com/angular/angular/commit/c39c8eb))
* **change_detection.ts:** export PipeFactory ([93f464a](https://github.com/angular/angular/commit/93f464a)), closes [#2245](https://github.com/angular/angular/issues/2245)
* **core:** added missing interfaces for onDestroy and onAllChangesDone lifecycle events ([2b6a653](https://github.com/angular/angular/commit/2b6a653))
* **core:** added support for detecting lifecycle events based on interfaces ([30b6542](https://github.com/angular/angular/commit/30b6542))
* **core/compiler:** AppViewPool use OpaqueToken ([ef27919](https://github.com/angular/angular/commit/ef27919))
* **dart/transform:** Add support for the safe navigation operator ([83f1856](https://github.com/angular/angular/commit/83f1856)), closes [#791](https://github.com/angular/angular/issues/791)
* **dart/transform:** Generate ChangeDetector classes ([8a3b0b3](https://github.com/angular/angular/commit/8a3b0b3))
* **dart/transform:** Improve constant evaluation ([5d2af54](https://github.com/angular/angular/commit/5d2af54))
* **dart/transform:** Remove unnecessary .ng_deps.dart files ([c065fb1](https://github.com/angular/angular/commit/c065fb1)), closes [#1929](https://github.com/angular/angular/issues/1929)
* **di:** added optional self parameter to Parent, Ancestor, and Unbounded ([34cfc9f](https://github.com/angular/angular/commit/34cfc9f))
* **Directive:** convert properties to an array ([d7df853](https://github.com/angular/angular/commit/d7df853)), closes [#2013](https://github.com/angular/angular/issues/2013)
* **dom:** add `setData()` method. ([6f3368e](https://github.com/angular/angular/commit/6f3368e))
* **ElementInjector:** support an arbitrary number of bindings ([b1c9bf1](https://github.com/angular/angular/commit/b1c9bf1)), closes [#1853](https://github.com/angular/angular/issues/1853)
* **facade:** add read/write access to global variables ([cdf791f](https://github.com/angular/angular/commit/cdf791f))
* **fakeAsync:** flush the microtasks before returning ([c7572ac](https://github.com/angular/angular/commit/c7572ac)), closes [#2269](https://github.com/angular/angular/issues/2269)
* **form:** implemented an imperative way of updating the view by updating the value of a co ([652ed0c](https://github.com/angular/angular/commit/652ed0c))
* **forms:** added ng-model ([559f54e](https://github.com/angular/angular/commit/559f54e))
* **forms:** added support for status classes ([3baf815](https://github.com/angular/angular/commit/3baf815))
* **forms:** added touched and untouched to Control ([ec3a782](https://github.com/angular/angular/commit/ec3a782))
* **forms:** changed the selector of TemplatdrivenFormDirective to match <form> ([6bef1c4](https://github.com/angular/angular/commit/6bef1c4))
* **forms:** implemented template-driven forms ([a9d6fd9](https://github.com/angular/angular/commit/a9d6fd9))
* **forms:** renamed control, control-group into ng-control and ng-control-group ([f543834](https://github.com/angular/angular/commit/f543834))
* **key_event:** alias esc to escape ([10bc7e9](https://github.com/angular/angular/commit/10bc7e9)), closes [#2010](https://github.com/angular/angular/issues/2010)
* **OpaqueToken:** now a const constructor ([c571b26](https://github.com/angular/angular/commit/c571b26))
* **reflector:** added a method to get type's interfaces ([34d75e8](https://github.com/angular/angular/commit/34d75e8))
* **RegExpWrapper:** implement a test method ([551586c](https://github.com/angular/angular/commit/551586c))
* **render:** re-export render and export `DirectiveResolver` ([662da0d](https://github.com/angular/angular/commit/662da0d)), closes [#2026](https://github.com/angular/angular/issues/2026)
* **render/dom_renderer:** DocumentToken use OpaqueToken ([db7a1f1](https://github.com/angular/angular/commit/db7a1f1))
* **router:** add the router bundle to the bundle task. ([05fa9bc](https://github.com/angular/angular/commit/05fa9bc))
* **router.js:** export router injectables ([28ee061](https://github.com/angular/angular/commit/28ee061))
* **router.js:** export routerDirectives ([1f20ef9](https://github.com/angular/angular/commit/1f20ef9))
* **test:** add element probe ([f9908cd](https://github.com/angular/angular/commit/f9908cd)), closes [#1992](https://github.com/angular/angular/issues/1992)
* **test:** added not.toBeNull ([74882c6](https://github.com/angular/angular/commit/74882c6))
* add support for the safe navigation (aka Elvis) operator ([a9be2eb](https://github.com/angular/angular/commit/a9be2eb)), closes [#791](https://github.com/angular/angular/issues/791)
* **test_lib:** add `containsRegex` ([23d59df](https://github.com/angular/angular/commit/23d59df))
* **test_lib:** add method to compare stringified DOM element ([c6335c1](https://github.com/angular/angular/commit/c6335c1)), closes [#2106](https://github.com/angular/angular/issues/2106)
* **tests:** add TestComponentBuilder ([c32dbad](https://github.com/angular/angular/commit/c32dbad)), closes [#1812](https://github.com/angular/angular/issues/1812)
* **transformers:** added support for lifecycle events ([f19970a](https://github.com/angular/angular/commit/f19970a))
* **view:** add `AppViewListener` interface ([75578f4](https://github.com/angular/angular/commit/75578f4))
* **view:** introduce free embedded views ([5030ffb](https://github.com/angular/angular/commit/5030ffb))


### BREAKING CHANGES

* - `Renderer.detachFreeHostView` was renamed to
  `Renderer.detachFreeView`
- `DomRenderer.getHostElement()` was generalized into
  `DomRenderer.getRootNodes()`
* No longer a `const` string. Now a const OpaqueToken
* No longer a `const` string. Now a const OpaqueToken
* now a `const` constructor
* Before
    @Directive(properties: {
      'sameName': 'sameName',
      'directiveProp': 'elProp | pipe'
    })
After
    @Directive(properties: [
      'sameName',
      'directiveProp: elProp | pipe'
    ])



<a name="2.0.0-alpha.25"></a>
# [2.0.0-alpha.25](https://github.com/angular/angular/compare/2.0.0-alpha.24...2.0.0-alpha.25) (2015-05-22)


### Bug Fixes

* don't call onAllChangesDone on checkNoChanges ([a664f5a](https://github.com/angular/angular/commit/a664f5a))
* **browser:** template elements should have content imported instead of the element itself. ([c9ab8e4](https://github.com/angular/angular/commit/c9ab8e4))
* **di:** changed host and view injector to respect visibility ([705ee46](https://github.com/angular/angular/commit/705ee46))
* **element_injector:** fixed element injector to inject view dependencies into its components ([b6b52e6](https://github.com/angular/angular/commit/b6b52e6))
* **element_injector:** fixed element injector to resolve dependencies of regular services ([28c2b8f](https://github.com/angular/angular/commit/28c2b8f))
* **forms:** changed forms to create only one value accessor instead of always creating Defau ([30c3e5a](https://github.com/angular/angular/commit/30c3e5a))
* **gulp:** continue watching when tasks throw ([ac28ac3](https://github.com/angular/angular/commit/ac28ac3)), closes [#1915](https://github.com/angular/angular/issues/1915)
* **router:** router link should navigate to non-base Url. ([c452832](https://github.com/angular/angular/commit/c452832))
* **test_lib:** fixes nested beforeEach. ([826af40](https://github.com/angular/angular/commit/826af40))
* **XHRImpl:** fix errors, add a spec ([91ccc9a](https://github.com/angular/angular/commit/91ccc9a)), closes [#1715](https://github.com/angular/angular/issues/1715)

### Features

* **CD:** add support for === and !== ([0ae89ac](https://github.com/angular/angular/commit/0ae89ac))
* **di:** changed toFactory to support dependency annotations ([f210c41](https://github.com/angular/angular/commit/f210c41))
* **forms:** migrated forms to typescript ([00c3693](https://github.com/angular/angular/commit/00c3693))
* **injector:** support forwardRef in toAlias ([fed86fc](https://github.com/angular/angular/commit/fed86fc))
* **PromisePipe:** remove ref onDestroy ([4afd2b4](https://github.com/angular/angular/commit/4afd2b4))



<a name="2.0.0-alpha.24"></a>
# [2.0.0-alpha.24](https://github.com/angular/angular/compare/2.0.0-alpha.23...2.0.0-alpha.24) (2015-05-19)


### Bug Fixes

* **benchmark:** change If for NgIf ([cdbb247](https://github.com/angular/angular/commit/cdbb247))
* **benchmark:** fixes ng-if ng-for renaming for templates. ([38926f7](https://github.com/angular/angular/commit/38926f7))
* **build:** npm shrinkwrap to pick up changed SHA1. ([04a9eb8](https://github.com/angular/angular/commit/04a9eb8))
* **Compiler:** add an error when a directive is null or undefined ([25cd6e4](https://github.com/angular/angular/commit/25cd6e4)), closes [#1908](https://github.com/angular/angular/issues/1908)
* **directives:** fix import path ([c20060d](https://github.com/angular/angular/commit/c20060d))
* **errors:** require passing stack traces explicitly in ng2 own code ([8ab7735](https://github.com/angular/angular/commit/8ab7735))
* **examples:** prefix directives with Ng ([0e82970](https://github.com/angular/angular/commit/0e82970))
* **facade:** MapWrapper.createFromPairs ([af9dcad](https://github.com/angular/angular/commit/af9dcad)), closes [#1640](https://github.com/angular/angular/issues/1640)
* **ng1 benchmarks:** revert *ng-if to ng-if ([909233f](https://github.com/angular/angular/commit/909233f))
* **router:** generate links for router-link with baseHref ([390cfb7](https://github.com/angular/angular/commit/390cfb7))
* **router:** improve route matching priorities ([5db8907](https://github.com/angular/angular/commit/5db8907))
* **router:** sort possible routes by cost ([17392f6](https://github.com/angular/angular/commit/17392f6))
* **router:** use appRootComponentToken to get root route configs ([791caf0](https://github.com/angular/angular/commit/791caf0)), closes [#1947](https://github.com/angular/angular/issues/1947)
* **tree-differ:** treat symlinks to deleted paths as removals ([aad5795](https://github.com/angular/angular/commit/aad5795)), closes [#1961](https://github.com/angular/angular/issues/1961)

### Features

* **change_detection:** implemented change detection that can be configured with pregenerated change det ([08f21db](https://github.com/angular/angular/commit/08f21db))
* **change_detection:** json pipe ([9860382](https://github.com/angular/angular/commit/9860382)), closes [#1957](https://github.com/angular/angular/issues/1957)
* **change_detection:** uppercase and lowercase pipes ([7a4a635](https://github.com/angular/angular/commit/7a4a635))
* **compiler:** added support for [()] syntax ([685a650](https://github.com/angular/angular/commit/685a650))
* **compiler:** special-case class attribute in hostAttributes ([3011cd8](https://github.com/angular/angular/commit/3011cd8)), closes [#1774](https://github.com/angular/angular/issues/1774) [#1841](https://github.com/angular/angular/issues/1841)
* **di:** added hostInjector and viewInjector to the Directive annotation ([b066b8d](https://github.com/angular/angular/commit/b066b8d))
* **di:** removed publishAs ([3a53f67](https://github.com/angular/angular/commit/3a53f67))
* **element_injector:** allow @Optional for ProtoViewRef ([bb2eda2](https://github.com/angular/angular/commit/bb2eda2))
* **errors:** preserve stack traces of user exceptions in Dart ([b6f29b4](https://github.com/angular/angular/commit/b6f29b4))
* **facade:** toUpperCase and toLowerCase ([557d54b](https://github.com/angular/angular/commit/557d54b))
* **fakeAsync:** allow simulating the passage of time ([0f002a5](https://github.com/angular/angular/commit/0f002a5))
* **forms:** improved error messages ([11e4385](https://github.com/angular/angular/commit/11e4385)), closes [#1839](https://github.com/angular/angular/issues/1839)
* **pipe:** reexported pipes to genereate docs ([155b1e2](https://github.com/angular/angular/commit/155b1e2))
* allow for forward references in injection ([1eea2b2](https://github.com/angular/angular/commit/1eea2b2)), closes [#1891](https://github.com/angular/angular/issues/1891)

### Performance Improvements

* **compiler:** Avoid unnecessary List concats ([05a1c6c](https://github.com/angular/angular/commit/05a1c6c)), closes [#1905](https://github.com/angular/angular/issues/1905)
* **dart:** Improve Dart ListWrapper#concat ([5114411](https://github.com/angular/angular/commit/5114411))


### BREAKING CHANGES

* S
Removes the publishAs property from the Component annotation.



<a name="2.0.0-alpha.23"></a>
# [2.0.0-alpha.23](https://github.com/angular/angular/compare/2.0.0-alpha.22...2.0.0-alpha.23) (2015-05-12)


### Bug Fixes

* **change_detection:** updated dynamic change detector not to mutate when throwing ([d717529](https://github.com/angular/angular/commit/d717529)), closes [#1762](https://github.com/angular/angular/issues/1762)
* **dart:** Remove unused imports. ([4ce0d5e](https://github.com/angular/angular/commit/4ce0d5e))
* **dart/transform:** Handle `hostAttributes` in DirectiveMetadata ([200e190](https://github.com/angular/angular/commit/200e190)), closes [#1742](https://github.com/angular/angular/issues/1742)
* **forms:** export directives as const in Dart ([5036086](https://github.com/angular/angular/commit/5036086)), closes [#1283](https://github.com/angular/angular/issues/1283)
* **gulpfile:** fixed test.unit.dart to format dart code before running test ([92d6aa1](https://github.com/angular/angular/commit/92d6aa1))
* **location:** dartium does not like pushState with null. ([c2a42d5](https://github.com/angular/angular/commit/c2a42d5))
* **router:** add baseUrl to relative paths, but not absolute. ([a574154](https://github.com/angular/angular/commit/a574154)), closes [#1783](https://github.com/angular/angular/issues/1783)
* **router:** reuse common parent components ([ac80df0](https://github.com/angular/angular/commit/ac80df0))
* **router:** router-link works without params ([77d1fc1](https://github.com/angular/angular/commit/77d1fc1))
* **router:** strip base href from URLs when navigating ([853d1de](https://github.com/angular/angular/commit/853d1de))
* **test:** fixed a test ([032f8b7](https://github.com/angular/angular/commit/032f8b7))
* **test_lib:** spy funcs should match null arguments ([84dc6ae](https://github.com/angular/angular/commit/84dc6ae))
* **transformer:** remove classDefParser in favor of hardcoded strings to speed up build ([01d5c29](https://github.com/angular/angular/commit/01d5c29))
* **view:** fixed ProtoViewFactory to get all property bindings ([7f97638](https://github.com/angular/angular/commit/7f97638))

### Features

* **change_detection.js:** export null pipes ([4b62a72](https://github.com/angular/angular/commit/4b62a72)), closes [#1624](https://github.com/angular/angular/issues/1624)
* **compiler:** added support for host actions ([f9c1de4](https://github.com/angular/angular/commit/f9c1de4))
* **compiler:** allow setting attributes on a host element ([51839ca](https://github.com/angular/angular/commit/51839ca)), closes [#1402](https://github.com/angular/angular/issues/1402)
* **dart/transform:** Inline `templateUrl` values ([97d2456](https://github.com/angular/angular/commit/97d2456)), closes [#1035](https://github.com/angular/angular/issues/1035)
* **dart/transform:** Reuse readDirectiveMetadata in plugin ([abc8878](https://github.com/angular/angular/commit/abc8878))
* **dart/transform:** Use the render Compiler and the DirectiveParser ([44f829d](https://github.com/angular/angular/commit/44f829d))
* **di:** components can self-publish via publishAs ([1a0da11](https://github.com/angular/angular/commit/1a0da11))
* **di:** expose parent injector ([2185e7c](https://github.com/angular/angular/commit/2185e7c))
* **di:** support type literals in DI ([358a675](https://github.com/angular/angular/commit/358a675))
* **directives:** export collection of core directives ([a5638a9](https://github.com/angular/angular/commit/a5638a9)), closes [#1524](https://github.com/angular/angular/issues/1524)
* **dom:** add getBaseHref method ([05219a5](https://github.com/angular/angular/commit/05219a5))
* **facade:** add equals method to StringMapWrapper ([aff85b5](https://github.com/angular/angular/commit/aff85b5))
* **gulpfuile:** added watch.js.dev ([3256ff1](https://github.com/angular/angular/commit/3256ff1))
* **lang:** support const expressions in TS/JS and Dart ([4665726](https://github.com/angular/angular/commit/4665726)), closes [#1796](https://github.com/angular/angular/issues/1796)
* **material:** add early version of md-grid-list. ([8ef183b](https://github.com/angular/angular/commit/8ef183b)), closes [#1683](https://github.com/angular/angular/issues/1683)
* **material:** early version of md-input ([ad23921](https://github.com/angular/angular/commit/ad23921)), closes [#1753](https://github.com/angular/angular/issues/1753)
* **PromisePipe:** add pipe for promises ([7498758](https://github.com/angular/angular/commit/7498758))
* **view:** allow to transplant a view into a ViewContainer at another place. ([4f3433b](https://github.com/angular/angular/commit/4f3433b)), closes [#1492](https://github.com/angular/angular/issues/1492)
* **VmTurnZone:** Rework the implementation to minimize change detection runs ([e8a6c95](https://github.com/angular/angular/commit/e8a6c95))



<a name="2.0.0-alpha.22"></a>
# [2.0.0-alpha.22](https://github.com/angular/angular/compare/2.0.0-alpha.21...2.0.0-alpha.22) (2015-05-07)


### Bug Fixes

* **brocolli:** escape special regexp characters when building regexps ([a58c9f8](https://github.com/angular/angular/commit/a58c9f8)), closes [#1721](https://github.com/angular/angular/issues/1721) [#1752](https://github.com/angular/angular/issues/1752)
* **build:** build the broccoli tools with correct typescript version. ([6bba289](https://github.com/angular/angular/commit/6bba289))
* **build:** refer to newest version of hammerjs typings ([a7a9463](https://github.com/angular/angular/commit/a7a9463))
* **build:** revert typescript upgrade which broke the build. ([b5032fd](https://github.com/angular/angular/commit/b5032fd))
* **build:** use correct tsd command to get typings at requested versions ([1205f54](https://github.com/angular/angular/commit/1205f54))
* **bundle:** update the bundle config to point to rx.js ([cf32213](https://github.com/angular/angular/commit/cf32213))
* **change_detector:** ensure that locals are only used when implicit receiver ([d4925b6](https://github.com/angular/angular/commit/d4925b6)), closes [#1542](https://github.com/angular/angular/issues/1542)
* **compiler:** changed the compiler to set up event listeners and host properties on host view  ([e3c1104](https://github.com/angular/angular/commit/e3c1104)), closes [#1584](https://github.com/angular/angular/issues/1584)
* **compiler:** clone templates before compiling them ([9e8d31d](https://github.com/angular/angular/commit/9e8d31d)), closes [#1058](https://github.com/angular/angular/issues/1058)
* **compiler:** only sets viewDefinition absUrl if the view has either a template or templateUrl ([3d62546](https://github.com/angular/angular/commit/3d62546)), closes [#1326](https://github.com/angular/angular/issues/1326) [#1327](https://github.com/angular/angular/issues/1327)
* **decorators:** fixed decorators ([4977764](https://github.com/angular/angular/commit/4977764))
* **decorators:** fixes decorator reflection. ([be7504d](https://github.com/angular/angular/commit/be7504d))
* **decorators:** incorrect annotation to decorator adapter ([b0c735f](https://github.com/angular/angular/commit/b0c735f))
* **decorators:** updates missing benchmark and fixes typo. ([87dcd5e](https://github.com/angular/angular/commit/87dcd5e))
* **decorators.es6:** export Directive decorator ([93c331d](https://github.com/angular/angular/commit/93c331d)), closes [#1688](https://github.com/angular/angular/issues/1688)
* **di:** improve error messages for invalid bindings ([ee1b574](https://github.com/angular/angular/commit/ee1b574)), closes [#1515](https://github.com/angular/angular/issues/1515) [#1573](https://github.com/angular/angular/issues/1573)
* **docs:** fix broken docs test after addition of .ts extension to dgeni ([62bf777](https://github.com/angular/angular/commit/62bf777))
* **exception_handler:** log errors via `console.error` ([ead21c9](https://github.com/angular/angular/commit/ead21c9))
* **formatter:** point to the newest clang-format ([51c4779](https://github.com/angular/angular/commit/51c4779))
* **router:** fix for leading slash in dart ([c9cec60](https://github.com/angular/angular/commit/c9cec60))
* **router:** infer top-level routing from app component ([46ad355](https://github.com/angular/angular/commit/46ad355)), closes [#1600](https://github.com/angular/angular/issues/1600)
* **router:** navigate on popstate event ([2713b78](https://github.com/angular/angular/commit/2713b78))
* **router:** throw if config does not contain required fields ([259f872](https://github.com/angular/angular/commit/259f872))
* **router:** use lists for RouteConfig annotations ([4965226](https://github.com/angular/angular/commit/4965226))
* **view:** changed view manager to hydrate change detector after creating directives ([c157922](https://github.com/angular/angular/commit/c157922))

### Features

* **benchmark:** added an implementation of the tree benchmark in React ([e434274](https://github.com/angular/angular/commit/e434274))
* **benchmarks:** Add basic dart transformer benchmarks. ([1864f60](https://github.com/angular/angular/commit/1864f60))
* **dart/analysis:** Build DirectiveMetadata for LibrarySpecificUnit ([0b1bb17](https://github.com/angular/angular/commit/0b1bb17))
* **dart/transform:** Add directiveMetadata{To,From}Map ([648c514](https://github.com/angular/angular/commit/648c514))
* **dart/transform:** Add DirectiveMetadataExtractor transform step ([0520ca6](https://github.com/angular/angular/commit/0520ca6))
* **dart/transform:** Generate DirectiveMetadata for exports ([c8ebd11](https://github.com/angular/angular/commit/c8ebd11))
* **dart/transform:** Turn on transform for examples/todo ([726fecb](https://github.com/angular/angular/commit/726fecb)), closes [#1527](https://github.com/angular/angular/issues/1527)
* **decorators:** adds decorator versions of DI annotations. ([457c15c](https://github.com/angular/angular/commit/457c15c))
* **decorators:** adds decorators to be used by TS and Babel transpiled apps. ([fb67e37](https://github.com/angular/angular/commit/fb67e37))
* **decorators:** adds support for parameter decorators. ([f863ea0](https://github.com/angular/angular/commit/f863ea0))
* **dom:** add location and history as DOM-like APIs. ([f356d03](https://github.com/angular/angular/commit/f356d03))
* **material:** add prototype dialog component w/ demo. ([f88c4b7](https://github.com/angular/angular/commit/f88c4b7))
* **router:** add location service ([ea546f5](https://github.com/angular/angular/commit/ea546f5))
* **router:** adds the router to the self-executing bundle. ([8e1d53b](https://github.com/angular/angular/commit/8e1d53b))
* **router:** export decorator version of RouteConfig ([75da6e4](https://github.com/angular/angular/commit/75da6e4))
* **router:** export routerInjectables ([ef7014f](https://github.com/angular/angular/commit/ef7014f))
* **router:** route redirects ([9153331](https://github.com/angular/angular/commit/9153331))
* **router:** sibling outlets ([9d5c33f](https://github.com/angular/angular/commit/9d5c33f))



<a name="2.0.0-alpha.21"></a>
# [2.0.0-alpha.21](https://github.com/angular/angular/compare/2.0.0-alpha.20...2.0.0-alpha.21) (2015-04-28)


### Bug Fixes

* **angular2:** export QueryList in angular2/core ([8a92a1f](https://github.com/angular/angular/commit/8a92a1f)), closes [#1502](https://github.com/angular/angular/issues/1502)
* **benchmarks:** wait for end of benchmarks ([97e6fb6](https://github.com/angular/angular/commit/97e6fb6))
* **benchpress:** only print the CV when it is meaningful ([642e7e5](https://github.com/angular/angular/commit/642e7e5)), closes [#908](https://github.com/angular/angular/issues/908) [#1444](https://github.com/angular/angular/issues/1444)
* **dart/transform:** Use `var` instead of `bool` in generated files ([99fdb9a](https://github.com/angular/angular/commit/99fdb9a)), closes [#1455](https://github.com/angular/angular/issues/1455)
* **di:** capture original exception in InvalidBindingError ([e23004d](https://github.com/angular/angular/commit/e23004d)), closes [#1406](https://github.com/angular/angular/issues/1406) [#1459](https://github.com/angular/angular/issues/1459)
* **dom:** remove methods is allowed on text nodes as well ([e70a2f2](https://github.com/angular/angular/commit/e70a2f2)), closes [#1473](https://github.com/angular/angular/issues/1473) [#1478](https://github.com/angular/angular/issues/1478)
* **jsserve:** serve empty favicon to prevent errors in benchmarks ([14a7b9f](https://github.com/angular/angular/commit/14a7b9f))
* **ListWrapper:** follow JS semantics ([2e3e41b](https://github.com/angular/angular/commit/2e3e41b))
* export ShadowDom strategies ([6896305](https://github.com/angular/angular/commit/6896305)), closes [#1510](https://github.com/angular/angular/issues/1510) [#1511](https://github.com/angular/angular/issues/1511)
* **render:** return views when destroyed in ViewContainer ([6fcd370](https://github.com/angular/angular/commit/6fcd370)), closes [#1316](https://github.com/angular/angular/issues/1316)
* **test_lib:** support multi matches with deep equality for function calls ([f784063](https://github.com/angular/angular/commit/f784063))
* **ViewManager:** dehydrate views recursively over ViewContainers ([a801da6](https://github.com/angular/angular/commit/a801da6)), closes [#1560](https://github.com/angular/angular/issues/1560)

### Features

* alllow specifying directives as bindings ([4bab25b](https://github.com/angular/angular/commit/4bab25b)), closes [#1498](https://github.com/angular/angular/issues/1498)
* **dart/transform:** Dedup getters, setters, & methods ([15376a6](https://github.com/angular/angular/commit/15376a6))
* **facade:** add isType method ([e617ca6](https://github.com/angular/angular/commit/e617ca6))
* **parser:** support === and !== operators ([afe0e45](https://github.com/angular/angular/commit/afe0e45)), closes [#1496](https://github.com/angular/angular/issues/1496) [#1500](https://github.com/angular/angular/issues/1500)
* **router:** add initial implementation ([1b2754d](https://github.com/angular/angular/commit/1b2754d))
* **view:** reimplemented property setters using change detection ([8ccafb0](https://github.com/angular/angular/commit/8ccafb0))

### Performance Improvements

* **benchmarks:** benchmark measuring cost of decorators (fixes #1479) ([9fc9d53](https://github.com/angular/angular/commit/9fc9d53)), closes [#1479](https://github.com/angular/angular/issues/1479)
* **benchmarks:** benchmark that measure cost of dynamic components ([427f0d0](https://github.com/angular/angular/commit/427f0d0))



<a name="2.0.0-alpha.20"></a>
# [2.0.0-alpha.20](https://github.com/angular/angular/compare/2.0.0-alpha.19...2.0.0-alpha.20) (2015-04-21)


### Bug Fixes

* **benchpress:** explicitly require navigation to finish before continuing ([8b28e99](https://github.com/angular/angular/commit/8b28e99))
* **build:** Fail the build for certain TS errors. ([2d09f84](https://github.com/angular/angular/commit/2d09f84))
* **build:** remove import of gulp-traceur which pulls in a different version of traceur ([e145434](https://github.com/angular/angular/commit/e145434))
* **core:** typo ComponetRef -> ComponentRef ([0fc66da](https://github.com/angular/angular/commit/0fc66da)), closes [#1426](https://github.com/angular/angular/issues/1426)
* **dart/transform:** Ensure consistent ordering of generated imports ([fef1dee](https://github.com/angular/angular/commit/fef1dee))
* **facades:** fix splice semantics; add test ([526c51d](https://github.com/angular/angular/commit/526c51d))
* Fix issues found by Dart analyzer ([957384c](https://github.com/angular/angular/commit/957384c))
* **shadowdom:** remove unused nodes on redistribute ([64ad74a](https://github.com/angular/angular/commit/64ad74a)), closes [#1416](https://github.com/angular/angular/issues/1416)
* **tests:** create default spys for all methods on a class ([cb2e646](https://github.com/angular/angular/commit/cb2e646))
* **view:** chagned view factory to keep AstWithSource ([56f3429](https://github.com/angular/angular/commit/56f3429))
* **view:** fixed hydrator to export the dom element instead of ng element ([eac5c88](https://github.com/angular/angular/commit/eac5c88))
* **view:** fixed hydrator to pass the right element index when attaching an event listener ([4943c0f](https://github.com/angular/angular/commit/4943c0f))
* **view:** remove dynamic components when the parent view is dehydrated ([213dabd](https://github.com/angular/angular/commit/213dabd)), closes [#1201](https://github.com/angular/angular/issues/1201)
* **viewFactory:** allow empty view cache ([02997f4](https://github.com/angular/angular/commit/02997f4))

### Features

* **build:** Move HTML copying into the broccoli task. ([db97d73](https://github.com/angular/angular/commit/db97d73))
* **bundle:** add script to push bundles to code.angularjs.org ([ffe1307](https://github.com/angular/angular/commit/ffe1307))
* **bundle:** adds a self-executing dev bundle (SFX). ([3177576](https://github.com/angular/angular/commit/3177576))
* **change detection:** add removeShadowDomChild ([6ecaa9a](https://github.com/angular/angular/commit/6ecaa9a))
* **change_detection:** added async pipe ([a97a226](https://github.com/angular/angular/commit/a97a226))
* **change_detection:** updated handling ON_PUSH detectors so they get notified when their bindings chan ([68faddb](https://github.com/angular/angular/commit/68faddb))
* **Compiler:** Make Compiler.buildRenderDirective() static. ([a00cb1d](https://github.com/angular/angular/commit/a00cb1d))
* **dart/transform:** Add debug transform parameters ([77b31ab](https://github.com/angular/angular/commit/77b31ab))
* **dart/transform:** Add the DirectiveMetadataReader ([cf7bef5](https://github.com/angular/angular/commit/cf7bef5))
* **dart/transform:** Detect annotations which extend Injectable or Template. ([c65fd31](https://github.com/angular/angular/commit/c65fd31))
* **events:** support preventdefault ([883e1c1](https://github.com/angular/angular/commit/883e1c1)), closes [#1039](https://github.com/angular/angular/issues/1039) [#1397](https://github.com/angular/angular/issues/1397)
* **material:** first ng2 material design components ([f149ae7](https://github.com/angular/angular/commit/f149ae7))
* **parser:** changed parser to parse pipes in the middle of a binding ([7bd682b](https://github.com/angular/angular/commit/7bd682b))
* **view:** add imperative views ([ada1e64](https://github.com/angular/angular/commit/ada1e64))
* **view:** changed event emitters to be observables ([233cb0f](https://github.com/angular/angular/commit/233cb0f))
* **view:** implemented loading component next to existing location ([681d063](https://github.com/angular/angular/commit/681d063))



<a name="2.0.0-alpha.19"></a>
# [2.0.0-alpha.19](https://github.com/angular/angular/compare/2.0.0-alpha.18...2.0.0-alpha.19) (2015-04-13)


### Bug Fixes

* **angular2:** export PrivateComponent{Loader,Location} in angular2/core ([25c709c](https://github.com/angular/angular/commit/25c709c))
* **benchmark_util:** remove strict equality check from getStringParameter ([7bf9525](https://github.com/angular/angular/commit/7bf9525))
* **benchmarks:** Stop working around a Traceur bug. ([22c1a0d](https://github.com/angular/angular/commit/22c1a0d))
* **build:** Actually code in the subset of JS that Traceur-Dart supports. ([eb7b758](https://github.com/angular/angular/commit/eb7b758))
* **build:** add package.json again to the copy files for js ([c63b316](https://github.com/angular/angular/commit/c63b316))
* **build:** Don't include rtts in the dart build. ([cc7c7b3](https://github.com/angular/angular/commit/cc7c7b3))
* **build:** don’t read out chrome perflogs during e2e tests ([47542b0](https://github.com/angular/angular/commit/47542b0)), closes [#1137](https://github.com/angular/angular/issues/1137)
* **build:** Only return directories from subDirs() ([70cea03](https://github.com/angular/angular/commit/70cea03))
* **build:** Remove unused `done` function arguments. ([8c3007e](https://github.com/angular/angular/commit/8c3007e))
* **build:** Require gulp-ts2dart at least at 1.0.6. ([09067eb](https://github.com/angular/angular/commit/09067eb))
* **bundles:** remove work-around rx.js module detection. ([c349eb4](https://github.com/angular/angular/commit/c349eb4)), closes [#1245](https://github.com/angular/angular/issues/1245)
* **dart:** don't instantiate abstract directive. ([136f64f](https://github.com/angular/angular/commit/136f64f))
* **dart:** The Traceur dart transpiler doesn't support shorthand syntax. ([54a4e4a](https://github.com/angular/angular/commit/54a4e4a))
* **dart/transform:** Gracefully handle log calls before init ([bba8499](https://github.com/angular/angular/commit/bba8499))
* **di:** allow injecting event emitter fns without specifying type annotation ([ae30d7b](https://github.com/angular/angular/commit/ae30d7b)), closes [#965](https://github.com/angular/angular/issues/965) [#1155](https://github.com/angular/angular/issues/1155)
* **di:** allow injecting static attrs without type annotations ([a3387b7](https://github.com/angular/angular/commit/a3387b7)), closes [#1226](https://github.com/angular/angular/issues/1226)
* **di:** refactor bindings to support Dart annotations ([6c8398d](https://github.com/angular/angular/commit/6c8398d))
* **forms:** fixed a directive selector ([982bb8b](https://github.com/angular/angular/commit/982bb8b))
* **IE11:** first fixes ([90d9a1d](https://github.com/angular/angular/commit/90d9a1d)), closes [#1179](https://github.com/angular/angular/issues/1179)
* **repo:** .gitignore the broccoli tmp dir ([ad083ed](https://github.com/angular/angular/commit/ad083ed))
* **shadow_dom:** redistribute light dom when a dynamic component is attached. ([8499cf8](https://github.com/angular/angular/commit/8499cf8)), closes [#1077](https://github.com/angular/angular/issues/1077) [#1315](https://github.com/angular/angular/issues/1315)
* **test:** add a test for @PropertySetter on a class with a dash ([d822793](https://github.com/angular/angular/commit/d822793)), closes [#1113](https://github.com/angular/angular/issues/1113) [#1099](https://github.com/angular/angular/issues/1099)
* **tests:** add missing ;s ([59c1299](https://github.com/angular/angular/commit/59c1299))
* **traceur:** Fix a couple of unsupported or incorrect tests. ([3285ffb](https://github.com/angular/angular/commit/3285ffb))
* **ts2dart:** Adjust to new ts2dart API. ([838aa2a](https://github.com/angular/angular/commit/838aa2a))
* **view_factory:** fix caching of views ([e34146f](https://github.com/angular/angular/commit/e34146f))

### Features

* **benchmark:** make view cache a parameter to the tree benchmark ([6ce085a](https://github.com/angular/angular/commit/6ce085a))
* **bootstrap:** changed bootstrap to return ComponentRef ([6f8fef4](https://github.com/angular/angular/commit/6f8fef4))
* **build:** Add rudimentary TS typings for broccoli. ([4e2316c](https://github.com/angular/angular/commit/4e2316c))
* **build:** enforce formatting of some files. ([daf0f47](https://github.com/angular/angular/commit/daf0f47))
* **build:** Use broccoli for ts2dart transpilation. ([a3decad](https://github.com/angular/angular/commit/a3decad))
* **bundle:** work-around rx.all.js bundle issue. ([bcbed28](https://github.com/angular/angular/commit/bcbed28))
* **change_detection:** added changeDetection to Component ([514ba54](https://github.com/angular/angular/commit/514ba54))
* **change_detection:** updated change detection to update directive directly, without the dispatcher ([69c3bff](https://github.com/angular/angular/commit/69c3bff))
* **CSSClass:** support binding to classList ([aca4604](https://github.com/angular/angular/commit/aca4604)), closes [#876](https://github.com/angular/angular/issues/876)
* **dart:** Use ts2dart for transpilation in Karma Dart. ([17e8857](https://github.com/angular/angular/commit/17e8857))
* **dart:** Use ts2dart for transpilation. ([226cbc7](https://github.com/angular/angular/commit/226cbc7))
* **dart/transform:** Add a `di` transformer ([09948f4](https://github.com/angular/angular/commit/09948f4)), closes [#700](https://github.com/angular/angular/issues/700)
* **dart/transform:** Add stub implementations to Html5LibAdapter ([cac74c7](https://github.com/angular/angular/commit/cac74c7))
* **dart/transform:** Allow multiple transformer entry points ([2cab7c7](https://github.com/angular/angular/commit/2cab7c7)), closes [#1246](https://github.com/angular/angular/issues/1246)
* **dart/transform:** Fix handling of Dart keywords ([f6e9d1f](https://github.com/angular/angular/commit/f6e9d1f))
* **dart/transform:** Mark Compiler as Injectable ([f375dbd](https://github.com/angular/angular/commit/f375dbd))
* **dart/transform:** Parse `url` values in `Template`s ([1a788e6](https://github.com/angular/angular/commit/1a788e6))
* **dart/transform:** Use the Dart transformer for benchmarks ([8212757](https://github.com/angular/angular/commit/8212757))
* **di:** Mark objects @Injectable ([788461b](https://github.com/angular/angular/commit/788461b))
* **di:** provide two ways to create an injector, resolved and unresolved ([4a961f4](https://github.com/angular/angular/commit/4a961f4))
* **docs:** more docs on binding resolution ([c5c1c9e](https://github.com/angular/angular/commit/c5c1c9e))
* **dom:** add replaceChild to DOM adapter ([123ee8e](https://github.com/angular/angular/commit/123ee8e))
* **events:** add support for global events ([b96e560](https://github.com/angular/angular/commit/b96e560)), closes [#1098](https://github.com/angular/angular/issues/1098) [#1255](https://github.com/angular/angular/issues/1255)
* **gulp:** adds System.register bundle task. ([c0b04ca](https://github.com/angular/angular/commit/c0b04ca))
* **keyEvents:** support for <div (keyup.enter)="callback()"> ([8fa1539](https://github.com/angular/angular/commit/8fa1539)), closes [#523](https://github.com/angular/angular/issues/523) [#1136](https://github.com/angular/angular/issues/1136)
* **perf:** add Angular2 implementation of largetable benchmark from AngularJS 1.x ([a55efbd](https://github.com/angular/angular/commit/a55efbd))
* **query:** adds initial implementation of the query api. ([e9f7029](https://github.com/angular/angular/commit/e9f7029)), closes [#792](https://github.com/angular/angular/issues/792)
* **render:** add initial implementation of render layer ([6c60c3e](https://github.com/angular/angular/commit/6c60c3e))
* **Ruler:** introduce Ruler service ([41262f4](https://github.com/angular/angular/commit/41262f4)), closes [#1089](https://github.com/angular/angular/issues/1089) [#1253](https://github.com/angular/angular/issues/1253)
* add class directive to a list of directives ([7e2c04e](https://github.com/angular/angular/commit/7e2c04e)), closes [#1292](https://github.com/angular/angular/issues/1292)
* intiial commit for angular 2 dart analysis ([28ba179](https://github.com/angular/angular/commit/28ba179))
* **testability:** add an initial scaffold for the testability api ([e81e5fb](https://github.com/angular/angular/commit/e81e5fb))
* **tooling:** Add a .clang-format for automated JavaScript formatting. ([60e4197](https://github.com/angular/angular/commit/60e4197))
* **view:** generalized loading of dynamic components ([f45281a](https://github.com/angular/angular/commit/f45281a))

### Performance Improvements

* **benchmark:** measure Injector init from resolved bindings ([c05bad3](https://github.com/angular/angular/commit/c05bad3))
* **benchmarks:** measure cost of Injector init with a variety of bindings ([0012caa](https://github.com/angular/angular/commit/0012caa))
* **build:** use patched broccoli-funnel version ([cfc5dd8](https://github.com/angular/angular/commit/cfc5dd8))
* **change detection:** Assign this.locals in change detector ctor ([a6736ff](https://github.com/angular/angular/commit/a6736ff))
* **view:** use pre-resolved bindings for child injector init ([308823b](https://github.com/angular/angular/commit/308823b))



<a name="2.0.0-alpha.18"></a>
# [2.0.0-alpha.18](https://github.com/angular/angular/compare/2.0.0-alpha.17...2.0.0-alpha.18) (2015-03-28)


### Bug Fixes

* **build:** publish docs as well and correct bench press docs ([8c5d9d3](https://github.com/angular/angular/commit/8c5d9d3))



<a name="2.0.0-alpha.17"></a>
# [2.0.0-alpha.17](https://github.com/angular/angular/compare/2.0.0-alpha.16...2.0.0-alpha.17) (2015-03-27)


### Bug Fixes

* **build:** try to eliminate build flakes by running dartstyle:format sequentially ([dd235f3](https://github.com/angular/angular/commit/dd235f3))
* **change_detection:** expose values when detecting changes in key-value pairs ([5306b6d](https://github.com/angular/angular/commit/5306b6d)), closes [#1118](https://github.com/angular/angular/issues/1118) [#1123](https://github.com/angular/angular/issues/1123)
* **ElementBinderBuilder:** properly bind CSS classes with "-" in their names ([edc3709](https://github.com/angular/angular/commit/edc3709)), closes [#1057](https://github.com/angular/angular/issues/1057) [#1059](https://github.com/angular/angular/issues/1059)
* **PrivateComponentLoader:** add the loader to the app injector ([65d7593](https://github.com/angular/angular/commit/65d7593)), closes [#1063](https://github.com/angular/angular/issues/1063)
* **tests:** fixed a broken test ([ee36aaf](https://github.com/angular/angular/commit/ee36aaf))
* **ts:** ts doesn't like ";;" ([878fce6](https://github.com/angular/angular/commit/878fce6))

### Features

* **bench press:** replace microIterations with microMetrics ([33bfc4c](https://github.com/angular/angular/commit/33bfc4c))
* **change_detection:** added a directive lifecycle hook that is called after children are checked ([723e8fd](https://github.com/angular/angular/commit/723e8fd))
* **change_detection:** pass binding propagation config to pipe registry ([8d85b83](https://github.com/angular/angular/commit/8d85b83))
* **change_detector:** split light dom and shadow dom children ([e92918b](https://github.com/angular/angular/commit/e92918b))
* **compiler:** Add support for setting attributes to Component host element ([58dd75a](https://github.com/angular/angular/commit/58dd75a)), closes [#1008](https://github.com/angular/angular/issues/1008) [#1009](https://github.com/angular/angular/issues/1009) [#1052](https://github.com/angular/angular/issues/1052)
* **core:** @Attribute annotation ([b1dc623](https://github.com/angular/angular/commit/b1dc623)), closes [#1091](https://github.com/angular/angular/issues/1091) [#622](https://github.com/angular/angular/issues/622)
* **facade:** added support for observables ([9b3b3d3](https://github.com/angular/angular/commit/9b3b3d3))
* **forms:** added an observable of value changes to Control ([19c1773](https://github.com/angular/angular/commit/19c1773))
* **forms:** added support for arrays of controls ([ff84506](https://github.com/angular/angular/commit/ff84506))
* **forms:** made forms works with single controls ([b02bd65](https://github.com/angular/angular/commit/b02bd65))
* **PrivateComponentLoader:** Explicit error message when loading a non-component ([101a4aa](https://github.com/angular/angular/commit/101a4aa)), closes [#1062](https://github.com/angular/angular/issues/1062)
* **ts2dart:** include srcFolderInsertion in ts2dart step. ([18ff2be](https://github.com/angular/angular/commit/18ff2be))



<a name="2.0.0-alpha.15"></a>
# [2.0.0-alpha.15](https://github.com/angular/angular/compare/2.0.0-alpha.14...2.0.0-alpha.15) (2015-03-24)


### Bug Fixes

* **view:** fixed view instantiation to use the component template's change detector when cr ([f8e7a37](https://github.com/angular/angular/commit/f8e7a37))



<a name="2.0.0-alpha.14"></a>
# [2.0.0-alpha.14](https://github.com/angular/angular/compare/2.0.0-alpha.13...2.0.0-alpha.14) (2015-03-24)


### Bug Fixes

* allow creation of var with camelCased names ([59a1f83](https://github.com/angular/angular/commit/59a1f83)), closes [#957](https://github.com/angular/angular/issues/957)
* **bootstrap:** report error on bootstrapping non-Component directive ([376bdf4](https://github.com/angular/angular/commit/376bdf4)), closes [#951](https://github.com/angular/angular/issues/951) [#961](https://github.com/angular/angular/issues/961)
* **ElementBinderBuilder:** properly bind to web component properties ([0fb9f3b](https://github.com/angular/angular/commit/0fb9f3b)), closes [#776](https://github.com/angular/angular/issues/776) [#1024](https://github.com/angular/angular/issues/1024)
* **examples:** Fix type registration in hello_world ([014a28f](https://github.com/angular/angular/commit/014a28f)), closes [#991](https://github.com/angular/angular/issues/991)
* **PropertyBindingParser:** detect bindings using full attribute name ([e0710c4](https://github.com/angular/angular/commit/e0710c4)), closes [#1001](https://github.com/angular/angular/issues/1001) [#1004](https://github.com/angular/angular/issues/1004)
* **PropertyBindingParser:** properly parse event bindings as actions ([a35cc27](https://github.com/angular/angular/commit/a35cc27)), closes [#981](https://github.com/angular/angular/issues/981) [#987](https://github.com/angular/angular/issues/987)

### Features

* **build:** check circular depencies in Node.js ([a46af9c](https://github.com/angular/angular/commit/a46af9c)), closes [#980](https://github.com/angular/angular/issues/980)
* **compiler:** added the DynamicComponent annotation ([b69f304](https://github.com/angular/angular/commit/b69f304))
* **compiler:** support bindings for any attribute ([02aa8e7](https://github.com/angular/angular/commit/02aa8e7)), closes [#1029](https://github.com/angular/angular/issues/1029)
* **dart/transform:** Add simple ParseTemplates step ([b3fa1fa](https://github.com/angular/angular/commit/b3fa1fa))
* **dart/transform:** Add simple ParseTemplates step ([08b56e1](https://github.com/angular/angular/commit/08b56e1))
* **dart/transform:** Implement `Html5LibDomAdapter` methods. ([5d502d4](https://github.com/angular/angular/commit/5d502d4))
* **di:** Add the `@Injectable` annotation ([b656f63](https://github.com/angular/angular/commit/b656f63))
* **di:** Add the `@Injectable` annotation to `Compiler` ([57723e1](https://github.com/angular/angular/commit/57723e1))
* **di:** Modify hello_world to use @Injectable ([153cee1](https://github.com/angular/angular/commit/153cee1)), closes [#986](https://github.com/angular/angular/issues/986)
* **element_injector:** added PrivateComponentLocation ([7488456](https://github.com/angular/angular/commit/7488456))
* **forms:** added pristine and dirty ([8a10ede](https://github.com/angular/angular/commit/8a10ede))
* **forms:** added support for textarea ([f42e633](https://github.com/angular/angular/commit/f42e633))
* **forms:** added value accessor for input=text ([47c1a0f](https://github.com/angular/angular/commit/47c1a0f))
* **selector:** support , for multiple targets ([41b53e7](https://github.com/angular/angular/commit/41b53e7)), closes [#867](https://github.com/angular/angular/issues/867) [#1019](https://github.com/angular/angular/issues/1019)
* added an ability to dynamically load components ([2041860](https://github.com/angular/angular/commit/2041860))
* **ShadowCss:** Support the new deep combinator syntax >>> ([ee523ef](https://github.com/angular/angular/commit/ee523ef)), closes [#990](https://github.com/angular/angular/issues/990) [#1028](https://github.com/angular/angular/issues/1028)
* **test:** more tests in Node.js ([46b03a5](https://github.com/angular/angular/commit/46b03a5))

### Performance Improvements

* **DirectiveDependency:** iterate only once over Dependency properties ([c6893ac](https://github.com/angular/angular/commit/c6893ac)), closes [#918](https://github.com/angular/angular/issues/918)



<a name="2.0.0-alpha.13"></a>
# [2.0.0-alpha.13](https://github.com/angular/angular/compare/87dd88f...2.0.0-alpha.13) (2015-03-14)


### Bug Fixes

* constrain stack_trace version, which breaks build ([cf51057](https://github.com/angular/angular/commit/cf51057))
* **ListWrapper:** fix JS ListWrapper.remove() ([211cb12](https://github.com/angular/angular/commit/211cb12))
* correct library not to have lib and dart in name. ([87dd88f](https://github.com/angular/angular/commit/87dd88f))
* Enabled annotation support for Dart ([6c8da62](https://github.com/angular/angular/commit/6c8da62))
* flip attr / property bind in directives annotations ([56f4e84](https://github.com/angular/angular/commit/56f4e84)), closes [#648](https://github.com/angular/angular/issues/648) [#684](https://github.com/angular/angular/issues/684)
* **views:** adds dehydration calls to ng-repeat removed views. ([8612af9](https://github.com/angular/angular/commit/8612af9)), closes [#416](https://github.com/angular/angular/issues/416)
* properly bind to camelCased properties ([b39d2c0](https://github.com/angular/angular/commit/b39d2c0)), closes [#866](https://github.com/angular/angular/issues/866) [#941](https://github.com/angular/angular/issues/941)
* **analyzer:** fix a warning about an unused variable ([59d6d60](https://github.com/angular/angular/commit/59d6d60))
* **application:** also bind the root component to the injector ([9329c0e](https://github.com/angular/angular/commit/9329c0e))
* **BaseException:** Support stack traces in BaseException ([352b640](https://github.com/angular/angular/commit/352b640))
* **bench press:** Don’t use unicode in console reporter to prevent problems ([5cbb174](https://github.com/angular/angular/commit/5cbb174))
* **bench press:** remove check for android ([eba751e](https://github.com/angular/angular/commit/eba751e))
* **benchmark:** remove duplicate line. ([bccc863](https://github.com/angular/angular/commit/bccc863))
* **benchmarks:** add the reflection module to benchmark config files ([3d05f52](https://github.com/angular/angular/commit/3d05f52))
* **benchmarks:** fix infinite scroll benchmark. ([7dba3a3](https://github.com/angular/angular/commit/7dba3a3))
* **benchmarks:** fix scrolling benchmark; add more tests ([6d45153](https://github.com/angular/angular/commit/6d45153))
* **benchmarks:** prepare publish to pub ([8adac53](https://github.com/angular/angular/commit/8adac53))
* **benchmarks:** use explicit `main()` function and do not reexport ([5793311](https://github.com/angular/angular/commit/5793311))
* **benchmarks_external:** use angular dart transformer ([9b7e2e3](https://github.com/angular/angular/commit/9b7e2e3))
* **benchpress:** add filter for when cloud config is not present ([39977bd](https://github.com/angular/angular/commit/39977bd))
* **benchpress:** benchpress fixes and a smoke test for Dart ([d1f03e5](https://github.com/angular/angular/commit/d1f03e5))
* **benchpress:** support `tdur` in events ([b0c6db1](https://github.com/angular/angular/commit/b0c6db1))
* **bootstrap:** change bootstrap not to create a separate injector for the provided bindings ([2074cc1](https://github.com/angular/angular/commit/2074cc1))
* **browser_adapter:** work around WebKit bug with importing template elements ([749a758](https://github.com/angular/angular/commit/749a758)), closes [#851](https://github.com/angular/angular/issues/851) [#853](https://github.com/angular/angular/issues/853)
* **build:** `gulp build.js.prod` should call `benchpress.js.prod` ([bc6f0db](https://github.com/angular/angular/commit/bc6f0db))
* **build:** analyze examples and benchmarks again ([1cd848d](https://github.com/angular/angular/commit/1cd848d))
* **build:** copy files that are included in html files to the same folder ([9c9769e](https://github.com/angular/angular/commit/9c9769e))
* **build:** disable the analysis of third-party libs ([d985045](https://github.com/angular/angular/commit/d985045))
* **build:** don’t do `pub get` until all pub specs have been copied ([41856ad](https://github.com/angular/angular/commit/41856ad)), closes [#130](https://github.com/angular/angular/issues/130) [#227](https://github.com/angular/angular/issues/227)
* **build:** Escape dollar signs in dart-transpiled string literals ([93c18f5](https://github.com/angular/angular/commit/93c18f5)), closes [#509](https://github.com/angular/angular/issues/509)
* **build:** finally publish to `rtts_assert` on npm ([74c0699](https://github.com/angular/angular/commit/74c0699))
* **build:** make perf tests work again ([15afb80](https://github.com/angular/angular/commit/15afb80))
* **build:** open new window for every benchmark ([eb6385e](https://github.com/angular/angular/commit/eb6385e))
* **build:** report and fail on errors ([81a5ae8](https://github.com/angular/angular/commit/81a5ae8))
* **build:** run dartanalyzer after transpiler and html to avoid races ([de855a7](https://github.com/angular/angular/commit/de855a7))
* **build:** simplify the e2e/perf config via command line arguments ([8b7df90](https://github.com/angular/angular/commit/8b7df90))
* **build:** support transpile to commonjs ([013e1fa](https://github.com/angular/angular/commit/013e1fa))
* **build:** use `rtts-assert` instead of `ng-rtts-assert`. ([bbd212c](https://github.com/angular/angular/commit/bbd212c))
* **cd:** report all changes on first cd run ([b734d56](https://github.com/angular/angular/commit/b734d56)), closes [#454](https://github.com/angular/angular/issues/454)
* **Change Detection:** fix merge error ([ceb9ee9](https://github.com/angular/angular/commit/ceb9ee9))
* **change_detection:** handle locals when invoking a method ([0dfd287](https://github.com/angular/angular/commit/0dfd287)), closes [#660](https://github.com/angular/angular/issues/660)
* **change_detection:** pass the correct previous value when using pipes ([7f31036](https://github.com/angular/angular/commit/7f31036)), closes [#588](https://github.com/angular/angular/issues/588)
* **change_detection/lexer:** support production mode ([aa9eeb8](https://github.com/angular/angular/commit/aa9eeb8))
* **change_detector:** adding new ranges when disabling the current enabled record ([7f941eb](https://github.com/angular/angular/commit/7f941eb))
* **ChangeDetector:** fix issues with handling empty ranges ([2b53a2f](https://github.com/angular/angular/commit/2b53a2f))
* **ChangeDispatcher:** update the onRecordChange signature ([86fb564](https://github.com/angular/angular/commit/86fb564))
* **class fields:** handle untyped fields ([f864aa1](https://github.com/angular/angular/commit/f864aa1))
* **compiler:** add a missing ; ([dd1898c](https://github.com/angular/angular/commit/dd1898c))
* **compiler:** add missing support to string literals ([cf169f1](https://github.com/angular/angular/commit/cf169f1)), closes [#531](https://github.com/angular/angular/issues/531) [#559](https://github.com/angular/angular/issues/559)
* **compiler:** allow identifiers with `-` in the template bindings as keys. ([0758165](https://github.com/angular/angular/commit/0758165))
* **compiler:** always wrap views into an own `<template>` element ([6305343](https://github.com/angular/angular/commit/6305343))
* **compiler:** elements with events only create binders but not protoElementInjectors. ([6e923cb](https://github.com/angular/angular/commit/6e923cb)), closes [#577](https://github.com/angular/angular/issues/577)
* **compiler:** fix a dart analyzer warning ([53906e4](https://github.com/angular/angular/commit/53906e4))
* **compiler:** fix a typo in BIND_NAME_REGEXP ([7027674](https://github.com/angular/angular/commit/7027674))
* **compiler:** fix directive registration order ([b4338b6](https://github.com/angular/angular/commit/b4338b6)), closes [#328](https://github.com/angular/angular/issues/328)
* **compiler:** fix nextSibling iterator in compiler. ([a6a6273](https://github.com/angular/angular/commit/a6a6273))
* **compiler:** fixes a bug with top level template directives. ([5c4238c](https://github.com/angular/angular/commit/5c4238c))
* **compiler:** properly bind to properties that don't have matching attr name ([7e6f536](https://github.com/angular/angular/commit/7e6f536)), closes [#619](https://github.com/angular/angular/issues/619) [#783](https://github.com/angular/angular/issues/783)
* **compiler:** use parentheses around expressions and escape quotes ([b2ecdb5](https://github.com/angular/angular/commit/b2ecdb5))
* **compiler:** workaround for circular dependencies in nodejs ([f1f0601](https://github.com/angular/angular/commit/f1f0601)), closes [#897](https://github.com/angular/angular/issues/897)
* **Compiler:** asynchronous error reporting ([c3873be](https://github.com/angular/angular/commit/c3873be))
* **compiler, view:** centralize TemplateElement checks and fix inconsistencies ([1b79c91](https://github.com/angular/angular/commit/1b79c91)), closes [#189](https://github.com/angular/angular/issues/189) [#194](https://github.com/angular/angular/issues/194)
* **CompileStep:** use namespace to resolve circular dep issue ([e0feeaf](https://github.com/angular/angular/commit/e0feeaf))
* **core:** export ViewPort in the public exports ([72b970e](https://github.com/angular/angular/commit/72b970e))
* **core:** workaround for circular dependencies in nodejs ([85211f0](https://github.com/angular/angular/commit/85211f0)), closes [#716](https://github.com/angular/angular/issues/716)
* **dart_libs:** add _dart suffix only for reserved lib names. ([ce29862](https://github.com/angular/angular/commit/ce29862)), closes [#871](https://github.com/angular/angular/issues/871)
* **Dart1.8:** fix analyzer warnings ([0703ee5](https://github.com/angular/angular/commit/0703ee5))
* **Dart1.8:** Promise handling ([fc2181e](https://github.com/angular/angular/commit/fc2181e))
* **DartWriter:** number (js) maps to num (dart) ([cff47d4](https://github.com/angular/angular/commit/cff47d4))
* **docgen:** hide additional exports that throw off docgen. ([a768f2e](https://github.com/angular/angular/commit/a768f2e)), closes [#707](https://github.com/angular/angular/issues/707)
* **docs:** fix typo in compiler integration_spec.js ([f30e3e5](https://github.com/angular/angular/commit/f30e3e5)), closes [#834](https://github.com/angular/angular/issues/834)
* **docs:** make them run again and integrate into ci ([e490861](https://github.com/angular/angular/commit/e490861))
* **e2e:** adds events to hello world static. ([af02f2b](https://github.com/angular/angular/commit/af02f2b))
* **ElementBinderBuilder:** allow a directive to have mutliple bindings ([09092b2](https://github.com/angular/angular/commit/09092b2)), closes [#320](https://github.com/angular/angular/issues/320)
* **event:** check hydration before firing event. ([2381c36](https://github.com/angular/angular/commit/2381c36))
* **events:** extract eventHandler to new function scope. ([7f701da](https://github.com/angular/angular/commit/7f701da))
* **example:** correct markup in the hello world example ([95d86d1](https://github.com/angular/angular/commit/95d86d1))
* **example:** make it work ([2b7738c](https://github.com/angular/angular/commit/2b7738c))
* **examples:** fix hello_world example (js) ([3e57189](https://github.com/angular/angular/commit/3e57189))
* **examples:** hello-world app on Windows ([ead2769](https://github.com/angular/angular/commit/ead2769))
* **examples:** make todo example run again ([d42fa07](https://github.com/angular/angular/commit/d42fa07))
* **examples.dart:** add LifeCycle to the reflector ([75549a6](https://github.com/angular/angular/commit/75549a6))
* **examples.dart:** initialize the reflector ([90daca0](https://github.com/angular/angular/commit/90daca0)), closes [#309](https://github.com/angular/angular/issues/309)
* **facade:** `ListWrapper.sort()` should not return the list ([f54f4e8](https://github.com/angular/angular/commit/f54f4e8))
* **facade/lang:** use strict equality for performance ([cc115d5](https://github.com/angular/angular/commit/cc115d5))
* **gulpfile:** fix the dartanalyzer task ([0a4d617](https://github.com/angular/angular/commit/0a4d617))
* **gulpfile:** fix the pubbuild task on Windows ([368cc29](https://github.com/angular/angular/commit/368cc29)), closes [#349](https://github.com/angular/angular/issues/349)
* **Injector:** fix dependencies in static injectors ([1376e49](https://github.com/angular/angular/commit/1376e49)), closes [#784](https://github.com/angular/angular/issues/784)
* **Interpolation:** switch to new AST API ([4df1825](https://github.com/angular/angular/commit/4df1825))
* **js2dart:** make tests work again ([7e3005e](https://github.com/angular/angular/commit/7e3005e))
* **lang:** fix small typo. ([62efb56](https://github.com/angular/angular/commit/62efb56))
* **life_cycle:** remove cyclic dependency ([63f23ec](https://github.com/angular/angular/commit/63f23ec)), closes [#477](https://github.com/angular/angular/issues/477) [#530](https://github.com/angular/angular/issues/530)
* **NgRepeat:** activate index ([52d8845](https://github.com/angular/angular/commit/52d8845))
* **parser:** handle empty strings ([a3d9f0f](https://github.com/angular/angular/commit/a3d9f0f))
* **parser:** parse pipes in template bindings ([6b26509](https://github.com/angular/angular/commit/6b26509))
* **perf:** cloud reporter, calculate insertId correctly so that we don’t loose rows! ([2265370](https://github.com/angular/angular/commit/2265370))
* **perf:** fix selector benchmark ([48125a8](https://github.com/angular/angular/commit/48125a8))
* **perf:** increase default timeout for perf tests ([0aa0c26](https://github.com/angular/angular/commit/0aa0c26))
* **perf:** use correct param name in compiler benchmark ([f24b9f2](https://github.com/angular/angular/commit/f24b9f2))
* **ProtoView:** element injector should have either a parent or a host ([457cbaa](https://github.com/angular/angular/commit/457cbaa)), closes [#359](https://github.com/angular/angular/issues/359)
* **record-range:** fixes bug when disabling empty ranges. ([5bdefee](https://github.com/angular/angular/commit/5bdefee))
* **reflection:** fix a typo ([f55011c](https://github.com/angular/angular/commit/f55011c))
* **reflection:** update pubspec.yaml to add a missing dependency on reflection ([bfd3c2d](https://github.com/angular/angular/commit/bfd3c2d))
* **scripts:** make chrome launcher executable ([d02e192](https://github.com/angular/angular/commit/d02e192))
* **setup:** don’t transpile transpiler sources via karma, only the specs ([63d8107](https://github.com/angular/angular/commit/63d8107))
* **setup:** use upstream traceur with explicit patches ([f39c6dc](https://github.com/angular/angular/commit/f39c6dc))
* **shadow_dom_emulation:** handle the case when the array of element injectors has nulls ([29f5ee0](https://github.com/angular/angular/commit/29f5ee0))
* **shadowdom:** allow conditional content tags. ([f7963e1](https://github.com/angular/angular/commit/f7963e1))
* **ShimShadowCss:** preserve attribute on style elements ([9250cd6](https://github.com/angular/angular/commit/9250cd6))
* **StyleInliner:** add support for url(url) format ([4d8d17c](https://github.com/angular/angular/commit/4d8d17c))
* **StyleUrlResolver:** add support for media query in import rules ([9f181f3](https://github.com/angular/angular/commit/9f181f3))
* Static DI init ([009e11a](https://github.com/angular/angular/commit/009e11a))
* **super:** `super()` now means call the proto of the current function. ([94958e0](https://github.com/angular/angular/commit/94958e0))
* **test:** add `v8` category to server spec ([e1a1dd0](https://github.com/angular/angular/commit/e1a1dd0))
* **test_lib:** allow equality tests for `Map` ([7482b68](https://github.com/angular/angular/commit/7482b68))
* **test_lib:** remove getDistributedNodes emulation in NodeJS ([c67194a](https://github.com/angular/angular/commit/c67194a))
* **test_lib:** support comparing Maps in nested structures ([ec93556](https://github.com/angular/angular/commit/ec93556))
* **test_lib:** support deep compare of objects with private/static fields ([e163eb2](https://github.com/angular/angular/commit/e163eb2))
* **tests:** don’t fail on current chrome canary ([62f08d3](https://github.com/angular/angular/commit/62f08d3))
* **tests:** make Angular 2 compiler perf test use correct param name ([9682437](https://github.com/angular/angular/commit/9682437))
* **tests:** show stack traces for transpiler unitttests ([713b670](https://github.com/angular/angular/commit/713b670))
* **transpile:** fix usage of `int` and references to `assert` module ([6f59f2f](https://github.com/angular/angular/commit/6f59f2f))
* **transpiler:** only call transform/visit when defined ([94e5564](https://github.com/angular/angular/commit/94e5564))
* **transpiler:** support arrow functions with complex body in named arguments ([4484583](https://github.com/angular/angular/commit/4484583))
* **transpiler/dart:** re-exporting only some bindings ([c515317](https://github.com/angular/angular/commit/c515317))
* **treeBenchmark:** bootstrap only relevant portion to prevent angular from clobbering form ([dfcce3a](https://github.com/angular/angular/commit/dfcce3a))
* **types:** Add StringMap type ([cd90038](https://github.com/angular/angular/commit/cd90038))
* **view:** fix DirectivePropertyGroupMemento to return a new group instead of null ([33b47bd](https://github.com/angular/angular/commit/33b47bd))
* **view:** move nodes into the live document when cloning. ([b1fc3e8](https://github.com/angular/angular/commit/b1fc3e8)), closes [#724](https://github.com/angular/angular/issues/724)
* **view:** ViewPort light should come from the direct parent ([fc1b791](https://github.com/angular/angular/commit/fc1b791))
* **view_container:** fixes injection on dynamically added views. ([2f015cc](https://github.com/angular/angular/commit/2f015cc)), closes [#777](https://github.com/angular/angular/issues/777)
* properly close the <tree> tag in benchmark ([c25e9e7](https://github.com/angular/angular/commit/c25e9e7))
* **zones:** update to v0.4.0 ([4623e88](https://github.com/angular/angular/commit/4623e88)), closes [#487](https://github.com/angular/angular/issues/487)
* remove one more use of for..of ([91426a8](https://github.com/angular/angular/commit/91426a8))

### Features

* add keyValDiff to default pipes ([85abfa9](https://github.com/angular/angular/commit/85abfa9))
* allow using KeyValueChanges as a pipe ([4a5d53c](https://github.com/angular/angular/commit/4a5d53c))
* change template micro-syntax to new syntax ([9db13be](https://github.com/angular/angular/commit/9db13be)), closes [#482](https://github.com/angular/angular/issues/482)
* introduce ExceptionHandler service ([a1f4060](https://github.com/angular/angular/commit/a1f4060))
* introduce Title service ([0d1dece](https://github.com/angular/angular/commit/0d1dece)), closes [#612](https://github.com/angular/angular/issues/612) [#900](https://github.com/angular/angular/issues/900)
* support binding to aria-* attributes ([1846ce8](https://github.com/angular/angular/commit/1846ce8)), closes [#643](https://github.com/angular/angular/issues/643)
* support binding to class.classname ([7ce4f66](https://github.com/angular/angular/commit/7ce4f66)), closes [#551](https://github.com/angular/angular/issues/551)
* support binding to style.stylename.suffix ([ee3f709](https://github.com/angular/angular/commit/ee3f709)), closes [#553](https://github.com/angular/angular/issues/553)
* support bindings for the 'role' attribute ([92afad6](https://github.com/angular/angular/commit/92afad6)), closes [#630](https://github.com/angular/angular/issues/630)
* **compiler:** allow ignoring element children ([4f2f083](https://github.com/angular/angular/commit/4f2f083))
* travis-ci integration ([85b5543](https://github.com/angular/angular/commit/85b5543))
* **application:** move classes to the application level injector ([53d5f36](https://github.com/angular/angular/commit/53d5f36)), closes [#649](https://github.com/angular/angular/issues/649)
* **bench press:** add microIterations option ([043b8c6](https://github.com/angular/angular/commit/043b8c6))
* **bench press:** allow multiple reporters, metrics and driver extensions. ([1d4ffd9](https://github.com/angular/angular/commit/1d4ffd9))
* **bench press:** detect major gcs ([146d731](https://github.com/angular/angular/commit/146d731))
* **bench press:** use chrome tracing protocol and initial iOS support ([7aa031b](https://github.com/angular/angular/commit/7aa031b))
* **benchmark:** add a simple benchmark for the di module ([1f4caa8](https://github.com/angular/angular/commit/1f4caa8))
* **benchmarks:** add polymer js 0.8-preview benchmark ([a963ae4](https://github.com/angular/angular/commit/a963ae4)), closes [#943](https://github.com/angular/angular/issues/943)
* **benchmarks:** initial version of tree benchmark ([01fa90c](https://github.com/angular/angular/commit/01fa90c)), closes [#269](https://github.com/angular/angular/issues/269)
* **benchmarks:** tree benchmark baseline ([e7de5f8](https://github.com/angular/angular/commit/e7de5f8))
* **benchpress:** add a file reporter ([f9dcfa3](https://github.com/angular/angular/commit/f9dcfa3))
* **benchpress:** add getStringParameter method to support text and radio inputs ([a2b5820](https://github.com/angular/angular/commit/a2b5820))
* **benchpress:** rewritten implementation ([f6284f2](https://github.com/angular/angular/commit/f6284f2))
* **benchpress:** show more metrics and make the run mode configurable ([77aa3ed](https://github.com/angular/angular/commit/77aa3ed)), closes [#368](https://github.com/angular/angular/issues/368)
* **bootstrap:** use VmTurnZone and LifeCycle to bootstrap an application ([2184150](https://github.com/angular/angular/commit/2184150))
* **bootstraping:** application bootstrapping implementation. ([1221857](https://github.com/angular/angular/commit/1221857))
* **build:** add general copy/multicopy method ([3f25f5a](https://github.com/angular/angular/commit/3f25f5a))
* **build:** add npm publish script ([729e38a](https://github.com/angular/angular/commit/729e38a))
* **build:** add package.json and README.md for publishing to npm ([dd532fe](https://github.com/angular/angular/commit/dd532fe))
* **build:** auto format the generated dart code. ([b1e76c5](https://github.com/angular/angular/commit/b1e76c5)), closes [#480](https://github.com/angular/angular/issues/480) [#504](https://github.com/angular/angular/issues/504)
* **build:** copy css files ([e3f4c60](https://github.com/angular/angular/commit/e3f4c60))
* **build:** enforce mobile layout during e2e tests ([3b40052](https://github.com/angular/angular/commit/3b40052))
* **build:** transpile to es6 ([69bba9b](https://github.com/angular/angular/commit/69bba9b))
* **Change Detection:** Add support for keyed access ([7cb93fd](https://github.com/angular/angular/commit/7cb93fd))
* **Change Detection:** Child watch groups ([384f0ae](https://github.com/angular/angular/commit/384f0ae))
* **Change Detection:** Implement collection changes ([1bd304e](https://github.com/angular/angular/commit/1bd304e))
* **Change Detection:** Implement map changes ([0a766f4](https://github.com/angular/angular/commit/0a766f4))
* **Change Detector:** Add support for collection content watch ([bf71b94](https://github.com/angular/angular/commit/bf71b94))
* **change_detection:** add benchmarks ([9a9a13a](https://github.com/angular/angular/commit/9a9a13a))
* **change_detection:** add mode to ChangeDetector ([23a0800](https://github.com/angular/angular/commit/23a0800))
* **change_detection:** add support for binary operations and literals ([79a9430](https://github.com/angular/angular/commit/79a9430))
* **change_detection:** add support for pipes ([695b4eb](https://github.com/angular/angular/commit/695b4eb))
* **change_detection:** add support for pipes in the template ([987a5fd](https://github.com/angular/angular/commit/987a5fd))
* **change_detection:** change binding syntax to explicitly specify pipes ([58ba700](https://github.com/angular/angular/commit/58ba700))
* **change_detection:** change proto change detectors to coalesce records ([2793d47](https://github.com/angular/angular/commit/2793d47))
* **change_detection:** do not register a change from switching from null to null ([709df12](https://github.com/angular/angular/commit/709df12))
* **change_detection:** ensure that expression do not change after they have been checked ([8acf9fb](https://github.com/angular/angular/commit/8acf9fb))
* **change_detection:** implement a change detector generator ([850cf0f](https://github.com/angular/angular/commit/850cf0f))
* **change_detection:** implement hydration/dehydration ([21f24d1](https://github.com/angular/angular/commit/21f24d1))
* **change_detection:** modify change detectors to recompute pure functions only when their args change ([af41fa9](https://github.com/angular/angular/commit/af41fa9))
* **change_detection:** reimplement change detection ([9957c13](https://github.com/angular/angular/commit/9957c13))
* **change_detection:** update change detection benchmark ([3067601](https://github.com/angular/angular/commit/3067601))
* **change_detector:** add a way to inspect records and record ranges ([1d03c2a](https://github.com/angular/angular/commit/1d03c2a))
* **change_detector:** add support for array literals ([75fd984](https://github.com/angular/angular/commit/75fd984))
* **change_detector:** add support for formatters ([dcd905a](https://github.com/angular/angular/commit/dcd905a))
* **change_detector:** add support for map literals ([34d76f1](https://github.com/angular/angular/commit/34d76f1))
* **change_detector:** add support for method calls ([4e38e3a](https://github.com/angular/angular/commit/4e38e3a))
* **change_detector:** add support for negate ([f38b940](https://github.com/angular/angular/commit/f38b940))
* **change_detector:** add support for ternary ([0e6d523](https://github.com/angular/angular/commit/0e6d523))
* **change_detector:** cleanup ([0341085](https://github.com/angular/angular/commit/0341085))
* **change_detector:** notify directives on property changes ([847cefc](https://github.com/angular/angular/commit/847cefc))
* **change_detector:** wrap exceptions into ChangeDetectionError ([d642c6a](https://github.com/angular/angular/commit/d642c6a))
* **ChangeDetection:** convert Record.mode to a bit field ([69af7ea](https://github.com/angular/angular/commit/69af7ea))
* **ChangeDetector:** Add support for chained properties ([c90a711](https://github.com/angular/angular/commit/c90a711))
* **ChangeDetector:** change View to construct a WatchGroup hierarchy ([f0d6464](https://github.com/angular/angular/commit/f0d6464))
* **ChangeDetector:** implement enabling/disabling records ([daf8f72](https://github.com/angular/angular/commit/daf8f72))
* **ChangeDetector:** implement enabling/disabling watch group ([862c641](https://github.com/angular/angular/commit/862c641))
* **compiler:** add benchmarks ([b07ea6b](https://github.com/angular/angular/commit/b07ea6b)), closes [#197](https://github.com/angular/angular/issues/197)
* **compiler:** add BindingPropagationConfig to the list of pre-built objects ([fc6e421](https://github.com/angular/angular/commit/fc6e421))
* **compiler:** allow recursive components ([9c2d411](https://github.com/angular/angular/commit/9c2d411))
* **compiler:** DOM adapters + html5lib implementation; misc fixes ([757eae8](https://github.com/angular/angular/commit/757eae8))
* **compiler:** handle compileChildren from @Decorator ([48e5012](https://github.com/angular/angular/commit/48e5012))
* **compiler:** initial version of the compiler. ([7a70f8f](https://github.com/angular/angular/commit/7a70f8f))
* **compiler:** make directive bindings optional. Fixes #647 ([785ec26](https://github.com/angular/angular/commit/785ec26)), closes [#647](https://github.com/angular/angular/issues/647)
* **compiler:** new semantics for `template` attributes and view variables. ([c6846f1](https://github.com/angular/angular/commit/c6846f1))
* **compiler:** parse5 DOM adapter ([1d4ff9b](https://github.com/angular/angular/commit/1d4ff9b)), closes [#841](https://github.com/angular/angular/issues/841)
* **compiler:** pass compilation unit to the parser ([d5fcac4](https://github.com/angular/angular/commit/d5fcac4))
* **compiler:** support `on-` and `[]` ([fc5b7ed](https://github.com/angular/angular/commit/fc5b7ed))
* **Compiler:** Multiple template per component ([e6c8bde](https://github.com/angular/angular/commit/e6c8bde)), closes [#596](https://github.com/angular/angular/issues/596)
* **compiler, ShadowDom:** adds TemplateLoader using XHR. ([746f85a](https://github.com/angular/angular/commit/746f85a))
* **components:** initial implementation of emulated content tag ([fbcc59d](https://github.com/angular/angular/commit/fbcc59d))
* **ComponentUrlMapper:** retrieve the base URL for components ([26872f6](https://github.com/angular/angular/commit/26872f6))
* **CssProcessor:** add support for CssTransformers ([03793d0](https://github.com/angular/angular/commit/03793d0)), closes [#860](https://github.com/angular/angular/issues/860)
* **dart/transform:** Add a `.ng_deps.dart` file parser. ([92b22d2](https://github.com/angular/angular/commit/92b22d2))
* **dart/transform:** Add a parser for `.ng_deps.dart` files and use. ([4b12c19](https://github.com/angular/angular/commit/4b12c19))
* **dart/transform:** Generate setter stubs. ([50a74b1](https://github.com/angular/angular/commit/50a74b1)), closes [#780](https://github.com/angular/angular/issues/780)
* **DartWriter:** support string interpolation ([c7feaba](https://github.com/angular/angular/commit/c7feaba))
* **deps:** update Traceur 0.0.74 ([b4ff802](https://github.com/angular/angular/commit/b4ff802))
* **di:** add metadata to Key ([ea0df35](https://github.com/angular/angular/commit/ea0df35))
* **di:** add OpaqueToken to DI ([6f889e3](https://github.com/angular/angular/commit/6f889e3))
* **di:** add support for optional dependencies ([ba0a1ec](https://github.com/angular/angular/commit/ba0a1ec))
* **di:** introduce aliasing ([0c4fbfc](https://github.com/angular/angular/commit/0c4fbfc)), closes [#710](https://github.com/angular/angular/issues/710) [#747](https://github.com/angular/angular/issues/747)
* **directive:** add ng-non-bindable directive ([bcd6e4c](https://github.com/angular/angular/commit/bcd6e4c))
* **directive:** add ng-switch directive ([683bb6e](https://github.com/angular/angular/commit/683bb6e))
* **directive:** notify directive before they get destroyed ([fb1b1da](https://github.com/angular/angular/commit/fb1b1da))
* **DirectiveParser:** throw errors when expected directives are not present ([94e203b](https://github.com/angular/angular/commit/94e203b)), closes [#527](https://github.com/angular/angular/issues/527) [#570](https://github.com/angular/angular/issues/570)
* **Directives:** add the ability to declaratively bind events ([bfa18ff](https://github.com/angular/angular/commit/bfa18ff))
* **directives/forms:** run tests in NodeJS ([e896565](https://github.com/angular/angular/commit/e896565)), closes [#921](https://github.com/angular/angular/issues/921)
* **DomAdapter:** add types ([23786aa](https://github.com/angular/angular/commit/23786aa)), closes [#842](https://github.com/angular/angular/issues/842)
* **element_injector:** add distance to propertly implement @parent ([3c692a1](https://github.com/angular/angular/commit/3c692a1))
* **elementBinder:** introduce element binder. ([8c566dc](https://github.com/angular/angular/commit/8c566dc))
* **ElementInjector:** add NgElement ([d7208b8](https://github.com/angular/angular/commit/d7208b8))
* **ElementInjector:** add support for "special" objects ([79d270c](https://github.com/angular/angular/commit/79d270c))
* **ElementInjector:** change ElementInjector so @parent and @ancestor do not include self. ([ac8351b](https://github.com/angular/angular/commit/ac8351b))
* **ElementInjector:** change ElementInjector to accept bindings or types ([e3b7724](https://github.com/angular/angular/commit/e3b7724))
* **ElementInjector:** implement @PropertySetter ([b349c35](https://github.com/angular/angular/commit/b349c35))
* **ElementInjector:** implement ElementInjector ([e3548b4](https://github.com/angular/angular/commit/e3548b4))
* **ElementInjector:** throw when encounter a cyclic dependency ([9bd65ab](https://github.com/angular/angular/commit/9bd65ab))
* **emuldated_shadow_dom:** implement intermediate content tags ([ec8e9f5](https://github.com/angular/angular/commit/ec8e9f5))
* **EventManager:** implement the EventManager ([8844671](https://github.com/angular/angular/commit/8844671))
* **events:** add the $event local variable to the handler context ([03c21a8](https://github.com/angular/angular/commit/03c21a8))
* **events:** adds support for bubbling native events (^event). ([6ad2c18](https://github.com/angular/angular/commit/6ad2c18))
* **events:** adds support for injectable angular event emitters. ([fd34a56](https://github.com/angular/angular/commit/fd34a56))
* **examples:** Add TodoMVC sample application. ([afda43d](https://github.com/angular/angular/commit/afda43d))
* **examples:** adds hello-world app. ([d6193e9](https://github.com/angular/angular/commit/d6193e9))
* **examples:** adds static dart hello world example. ([c59cc86](https://github.com/angular/angular/commit/c59cc86))
* **facade:** add bool type ([971e31f](https://github.com/angular/angular/commit/971e31f))
* **facade:** add support for `Date` ([6748486](https://github.com/angular/angular/commit/6748486))
* **facade/collection:** add StringMap support ([d0c870f](https://github.com/angular/angular/commit/d0c870f))
* **facade/lang:** add math and regexp support ([d4c099d](https://github.com/angular/angular/commit/d4c099d))
* **facade/lang:** support int ([3482fb1](https://github.com/angular/angular/commit/3482fb1))
* **forms:** add form builder ([08bd3a4](https://github.com/angular/angular/commit/08bd3a4))
* **forms:** add optional controls ([f27e538](https://github.com/angular/angular/commit/f27e538))
* **forms:** add support for checkbox ([4b24734](https://github.com/angular/angular/commit/4b24734))
* **forms:** add support for nested forms ([733915d](https://github.com/angular/angular/commit/733915d))
* **forms:** add support for validations ([ded83e5](https://github.com/angular/angular/commit/ded83e5))
* **forms:** initial implementation of forms ([cdb1e82](https://github.com/angular/angular/commit/cdb1e82))
* **forms:** initial implementation of forms declared in html ([640134d](https://github.com/angular/angular/commit/640134d))
* **forms:** remove support for declaring forms in html ([a73c643](https://github.com/angular/angular/commit/a73c643))
* **injector:** add support for default bindings ([f524a89](https://github.com/angular/angular/commit/f524a89))
* **injector:** change injector to recover from errors ([9b41137](https://github.com/angular/angular/commit/9b41137))
* **injector:** change injector to show the full path when error happens in a constructor (async ([62004e2](https://github.com/angular/angular/commit/62004e2))
* **injector:** handle async cyclic dependencies ([e7666d0](https://github.com/angular/angular/commit/e7666d0))
* **injector:** handle construction errors ([4d6c748](https://github.com/angular/angular/commit/4d6c748))
* **injector:** handle in-progress async construction ([e02cdfe](https://github.com/angular/angular/commit/e02cdfe))
* **injector:** implement async dependencies ([14af5a0](https://github.com/angular/angular/commit/14af5a0))
* **injector:** implement InjectLazy ([a017627](https://github.com/angular/angular/commit/a017627))
* **injector:** initial implementaion of dynamic injector ([b219963](https://github.com/angular/angular/commit/b219963))
* **Injector:** Support binding to null ([a82e208](https://github.com/angular/angular/commit/a82e208))
* **largeTable:** add AngularJS 1.x largetable benchmark ([bc8e517](https://github.com/angular/angular/commit/bc8e517))
* **lexer:** initial (wip) implementation. ([c85ab3a](https://github.com/angular/angular/commit/c85ab3a))
* **LifeCycle:** change LifeCycle to be able register it with a zone ([0b550f9](https://github.com/angular/angular/commit/0b550f9))
* **ng-if:** an implementation of ng-if ([d5a12d5](https://github.com/angular/angular/commit/d5a12d5)), closes [#317](https://github.com/angular/angular/issues/317)
* **ng-repeat:** initial implementaion of ng-repeat. ([60456c8](https://github.com/angular/angular/commit/60456c8))
* **package:** introduce a catch-all package angular. ([ec5cb3e](https://github.com/angular/angular/commit/ec5cb3e))
* **packaging:** automatically copy LICENSE to dist folders ([320c089](https://github.com/angular/angular/commit/320c089))
* **parser:** add support for formatters ([00bc9e5](https://github.com/angular/angular/commit/00bc9e5))
* **parser:** add support for ternary operator ([a7fe25d](https://github.com/angular/angular/commit/a7fe25d))
* **parser:** adds basic expressions to the parser. ([965fa1a](https://github.com/angular/angular/commit/965fa1a))
* **parser:** adds support for variable bindings ([1863d50](https://github.com/angular/angular/commit/1863d50))
* **parser:** change Parser to return null when one of the operands is null ([c41f59c](https://github.com/angular/angular/commit/c41f59c))
* **parser:** make method calls aware of ContextWithVariableBindings ([156f3d9](https://github.com/angular/angular/commit/156f3d9))
* **parser:** split parse into parseBinding and parseAction ([52b3838](https://github.com/angular/angular/commit/52b3838))
* **parser:** throw when expected an identifier ([8a829d3](https://github.com/angular/angular/commit/8a829d3))
* **Parser:** add support for arrays and maps ([ac060ed](https://github.com/angular/angular/commit/ac060ed))
* **Parser:** add support for assignments ([8cc008b](https://github.com/angular/angular/commit/8cc008b))
* **Parser:** add support for method invocations ([7b777b1](https://github.com/angular/angular/commit/7b777b1))
* **Parser:** implement Parser ([01e6c7b](https://github.com/angular/angular/commit/01e6c7b))
* **Parser:** improve error handling ([977bc77](https://github.com/angular/angular/commit/977bc77))
* **perf:** add AngularDart v1 of table scrolling benchmark ([7379140](https://github.com/angular/angular/commit/7379140))
* **perf:** autoscale benchmarks depending on the browser. ([5c064c1](https://github.com/angular/angular/commit/5c064c1))
* **perf:** cloud reporter should retry in case of a timeout ([5f5ed06](https://github.com/angular/angular/commit/5f5ed06))
* **perf:** cloud reporter, more generic table layout ([ed7d1cf](https://github.com/angular/angular/commit/ed7d1cf))
* **perf:** disable wake lock and cpu freq scaling on android ([8b2a5d7](https://github.com/angular/angular/commit/8b2a5d7))
* **perf:** measure error and stop automatically when the numbers are good enough. ([35ac3f3](https://github.com/angular/angular/commit/35ac3f3))
* **perf:** port table scrolling benchmark to Angular 2 ([fcbdf02](https://github.com/angular/angular/commit/fcbdf02))
* **publish:** update files to publish to npm ([cde8ffd](https://github.com/angular/angular/commit/cde8ffd))
* **RecordRange:** Set context for implicit receivers only ([ab961b3](https://github.com/angular/angular/commit/ab961b3))
* **Reflection:** extract reflection capabilities into a separate module ([6e8175a](https://github.com/angular/angular/commit/6e8175a))
* **RegExp:** expose match indexes in Dart ([06f7481](https://github.com/angular/angular/commit/06f7481))
* **rtts_assert:** avoid deep recursion in prettyPrint ([e05079f](https://github.com/angular/angular/commit/e05079f))
* **selector:** add support for :not ([8d2ee6b](https://github.com/angular/angular/commit/8d2ee6b)), closes [#609](https://github.com/angular/angular/issues/609) [#948](https://github.com/angular/angular/issues/948)
* **selector:** initial version of the selector ([08d4a37](https://github.com/angular/angular/commit/08d4a37))
* **ShadowCss:** Make the shim also accept a selector for the host ([5111f9a](https://github.com/angular/angular/commit/5111f9a))
* **ShadowCss:** port implementation from webcomponent.js ([d67f029](https://github.com/angular/angular/commit/d67f029))
* **shadowdom:** turn on ShadowDom Emulated Mode by default. ([f1593eb](https://github.com/angular/angular/commit/f1593eb))
* **ShadowDomStrategy:** implemented EmulatedUnscopedShadowDomStrategy ([8541cfd](https://github.com/angular/angular/commit/8541cfd))
* **spec:** add spec argument to the protractor config, allows to filter tests to run ([0a0c0d8](https://github.com/angular/angular/commit/0a0c0d8)), closes [#695](https://github.com/angular/angular/issues/695)
* **StyleInliner:** StyleInliner inlines @import css rules ([e0cf1c7](https://github.com/angular/angular/commit/e0cf1c7))
* **StyleUrlResolver:** rewrite url in styles ([edb797e](https://github.com/angular/angular/commit/edb797e))
* **template:** add bang syntax shortcut ([3395624](https://github.com/angular/angular/commit/3395624)), closes [#522](https://github.com/angular/angular/issues/522)
* **TemplateConfig:** support array of arrays in TemplateConfig directives ([6d8ccaa](https://github.com/angular/angular/commit/6d8ccaa)), closes [#592](https://github.com/angular/angular/issues/592) [#600](https://github.com/angular/angular/issues/600)
* **test:** add e2e tests for benchmarks and examples ([14e91e2](https://github.com/angular/angular/commit/14e91e2))
* **test_lib:** change test_lib.dart to structurally compare objects ([acd7035](https://github.com/angular/angular/commit/acd7035))
* **test_lib:** implement SpyObject ([f06433f](https://github.com/angular/angular/commit/f06433f))
* **test_lib:** support a timeout for dart async tests ([9b08ab3](https://github.com/angular/angular/commit/9b08ab3))
* **test_lib:** support not.toBePromise() for Dart ([e8bec99](https://github.com/angular/angular/commit/e8bec99))
* **tests:** add a test injector ([33b5ba8](https://github.com/angular/angular/commit/33b5ba8)), closes [#614](https://github.com/angular/angular/issues/614)
* **transiler/dart:** re-export imported vars ([c68e780](https://github.com/angular/angular/commit/c68e780)), closes [#41](https://github.com/angular/angular/issues/41)
* **transpiler:** add support for arrow functions ([d1b90e1](https://github.com/angular/angular/commit/d1b90e1)), closes [#28](https://github.com/angular/angular/issues/28)
* **transpiler:** add support for getters ([035dc5b](https://github.com/angular/angular/commit/035dc5b))
* **transpiler:** add support for named params to new expressions ([ee1e54c](https://github.com/angular/angular/commit/ee1e54c))
* **transpiler:** allow @CONST annotation on class ([8e6326f](https://github.com/angular/angular/commit/8e6326f)), closes [#148](https://github.com/angular/angular/issues/148)
* **transpiler:** class fields for Dart ([d16d6a0](https://github.com/angular/angular/commit/d16d6a0))
* **transpiler:** constructor and typed field semantics ([089a2f1](https://github.com/angular/angular/commit/089a2f1)), closes [#11](https://github.com/angular/angular/issues/11) [#42](https://github.com/angular/angular/issues/42) [#17](https://github.com/angular/angular/issues/17) [#45](https://github.com/angular/angular/issues/45)
* **transpiler:** handle named params ([64fe73e](https://github.com/angular/angular/commit/64fe73e))
* **transpiler:** implement @IMPLEMENTS ([965f70b](https://github.com/angular/angular/commit/965f70b))
* **transpiler:** implement optional params ([1214f42](https://github.com/angular/angular/commit/1214f42))
* **transpiler:** Transform for..of to Dart as for..in ([f088e9e](https://github.com/angular/angular/commit/f088e9e)), closes [#53](https://github.com/angular/angular/issues/53)
* **transpiler:** Transform template strings to triple quoted Dart strings ([93f6d26](https://github.com/angular/angular/commit/93f6d26))
* **TreeBenchmark:** use angular2 If directive ([8a3d905](https://github.com/angular/angular/commit/8a3d905))
* **UrlResolver:** combine a base URL with an URL ([ff406e6](https://github.com/angular/angular/commit/ff406e6))
* **vars:** assignment of component or element instance to vars. ([6dbfe0d](https://github.com/angular/angular/commit/6dbfe0d))
* **view:** add onChange implementation to view. ([b0c9d05](https://github.com/angular/angular/commit/b0c9d05))
* **view:** add support for components that use shadow dom emulation ([da9d041](https://github.com/angular/angular/commit/da9d041))
* **view:** add support for instantiation of nested component views. ([be4cb2d](https://github.com/angular/angular/commit/be4cb2d))
* **view:** adds event binding to view instantiation. ([c5b0baf](https://github.com/angular/angular/commit/c5b0baf))
* **view:** hook watch group instantiation in the view. ([91f50b6](https://github.com/angular/angular/commit/91f50b6))
* **View:** implement ProtoView.instantiate ([31831ee](https://github.com/angular/angular/commit/31831ee))
* **view_pool:** adds a view pool of dehydrated views per protoview. ([7bf5ab8](https://github.com/angular/angular/commit/7bf5ab8))
* **viewport:** add initial integration test for template directives ([7bc282d](https://github.com/angular/angular/commit/7bc282d))
* **viewPort:** adds initial implementation of ViewPort. ([c6f14dd](https://github.com/angular/angular/commit/c6f14dd))
* **views:** adds (de)hydration of views and template vars. ([1746130](https://github.com/angular/angular/commit/1746130))
* **ViewSplitter:** Change template shorthand syntax from '!' to '*' ([69e02ee](https://github.com/angular/angular/commit/69e02ee)), closes [#717](https://github.com/angular/angular/issues/717) [#727](https://github.com/angular/angular/issues/727)
* **zone:** add initial implementation of VmTurnZone ([df36ffb](https://github.com/angular/angular/commit/df36ffb))
* **zone:** add support for long stack traces ([df21c3c](https://github.com/angular/angular/commit/df21c3c))

### Performance Improvements

* **CD:** Special cased interpolation in AST, Parser, and CD ([3b34ef4](https://github.com/angular/angular/commit/3b34ef4))
* **change detection:** minimized amount of code in protective try-catch ([1320175](https://github.com/angular/angular/commit/1320175))
* **Change Detection:** Remove a useless test ([2d2f449](https://github.com/angular/angular/commit/2d2f449))
* **Change Detection:** remove the usage of getters/setters ([68da001](https://github.com/angular/angular/commit/68da001))
* **Change Detection:** Track the range & group on changes only ([2c4a2f5](https://github.com/angular/angular/commit/2c4a2f5))
* **change_detection:** add baseline to change detection benchmark ([65242fb](https://github.com/angular/angular/commit/65242fb))
* **change_detection:** use object pools not to create unnecessary garbage ([db0f0c4](https://github.com/angular/angular/commit/db0f0c4))
* Traverse dom using firstChild instead of childNodes ([0866485](https://github.com/angular/angular/commit/0866485))
* **Compiler:** use Promises only when strictly required ([74f92c6](https://github.com/angular/angular/commit/74f92c6))
* **ElementInjector:** add a benchmark measuring the instantiation of element injectors without using r ([c11ca94](https://github.com/angular/angular/commit/c11ca94))
* **ProtoRecord:** remove the unused prev field ([f8c070c](https://github.com/angular/angular/commit/f8c070c))
* **ProtoRecordRange:** re-use a ProtoRecordCreator ([0f3134a](https://github.com/angular/angular/commit/0f3134a))
* **RecordRange:** optimize disable() ([5c531f7](https://github.com/angular/angular/commit/5c531f7))
* **view:** inline and refactor view instantiation and hydration ([3ec3d5e](https://github.com/angular/angular/commit/3ec3d5e)), closes [#291](https://github.com/angular/angular/issues/291)
* add button for profiling tree benchmark ([6e9f485](https://github.com/angular/angular/commit/6e9f485))
* Change baseline benchmark to be more consistent with the Angular ([bed4b52](https://github.com/angular/angular/commit/bed4b52))
* force GC on profiles ([f6ebaf7](https://github.com/angular/angular/commit/f6ebaf7))
* improve baseline speed by 30% ([56b7ba4](https://github.com/angular/angular/commit/56b7ba4))
* remove field declarations from branches in constructors ([c0a99ee](https://github.com/angular/angular/commit/c0a99ee))
* run CPU profile on constant count so that time numbers can be compared between r ([e4a4ec8](https://github.com/angular/angular/commit/e4a4ec8))
* use === instead of == for faster checks. ([2e1feec](https://github.com/angular/angular/commit/2e1feec))



