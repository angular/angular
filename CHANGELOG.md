<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2015-09-09)


### Bug Fixes

* **build:** delete unreferenced typings on npm install ([42e1b07](https://github.com/angular/angular/commit/42e1b07)), closes [#1636](https://github.com/angular/angular/issues/1636) [#3940](https://github.com/angular/angular/issues/3940)
* **bundle:** don't include System.config in dev bundle ([a94f051](https://github.com/angular/angular/commit/a94f051)), closes [#3826](https://github.com/angular/angular/issues/3826) [#3862](https://github.com/angular/angular/issues/3862)
* **ComponentUrlMapper:** support relative template URLs in Dartium ([7c7888d](https://github.com/angular/angular/commit/7c7888d)), closes [#2771](https://github.com/angular/angular/issues/2771) [#3743](https://github.com/angular/angular/issues/3743)
* **core:** Fix type error ([6c3c606](https://github.com/angular/angular/commit/6c3c606))
* **http:** change type declarations to interfaces and export EventEmitter ([10437ab](https://github.com/angular/angular/commit/10437ab))
* **router:** re-export of Type ([b8be4bf](https://github.com/angular/angular/commit/b8be4bf)), closes [#3632](https://github.com/angular/angular/issues/3632) [#3704](https://github.com/angular/angular/issues/3704)
* **RouteRegistry:** initialize RouteParams.params ([3791c4a](https://github.com/angular/angular/commit/3791c4a)), closes [#3755](https://github.com/angular/angular/issues/3755)
* **test:** error in karma when systemjs imports fail ([7820086](https://github.com/angular/angular/commit/7820086)), closes [#3846](https://github.com/angular/angular/issues/3846)
* **typings:** emit spread parameters ([a34d4c6](https://github.com/angular/angular/commit/a34d4c6)), closes [#3875](https://github.com/angular/angular/issues/3875)
* **WebWorker:** Return boolean from `dispatchRenderEvent` ([457eb5d](https://github.com/angular/angular/commit/457eb5d))
* **WebWorker:** WebWorkerRenderer removes views after they're destroyed ([9619636](https://github.com/angular/angular/commit/9619636)), closes [#3240](https://github.com/angular/angular/issues/3240) [#3894](https://github.com/angular/angular/issues/3894)

### Features

* **compile:** add HtmlParser, TemplateParser, ComponentMetadataLoader ([9f576b0](https://github.com/angular/angular/commit/9f576b0)), closes [#3839](https://github.com/angular/angular/issues/3839)
* **compiler:** add full directive metadata and validation logic ([f93cd9c](https://github.com/angular/angular/commit/f93cd9c)), closes [#3880](https://github.com/angular/angular/issues/3880)
* **core:** added afterContentInit, afterViewInit, and afterViewChecked hooks ([d49bc43](https://github.com/angular/angular/commit/d49bc43)), closes [#3897](https://github.com/angular/angular/issues/3897)
* **core:** remove the (^ syntax and make all DOM events bubbling ([60ce884](https://github.com/angular/angular/commit/60ce884)), closes [#3864](https://github.com/angular/angular/issues/3864)
* **docs:** document code size management tools for Dart ([6532171](https://github.com/angular/angular/commit/6532171))
* **docs:** document unused reflection info tracking ([46f751b](https://github.com/angular/angular/commit/46f751b))
* **exception_handler:** changed ExceptionHandler to use console.error instead of console.log ([3bb27de](https://github.com/angular/angular/commit/3bb27de)), closes [#3812](https://github.com/angular/angular/issues/3812)
* **router:** hash-cons ComponentInstructions ([e1a7e03](https://github.com/angular/angular/commit/e1a7e03))
* **router:** implement Router.isRouteActive ([de37729](https://github.com/angular/angular/commit/de37729))
* **router:** router-link-active CSS class support ([36eb9d3](https://github.com/angular/angular/commit/36eb9d3)), closes [#3209](https://github.com/angular/angular/issues/3209)
* **WebWorker:** Expose MessageBroker API ([358908e](https://github.com/angular/angular/commit/358908e)), closes [#3942](https://github.com/angular/angular/issues/3942)
* **WebWorkers:** Add WebSocket MessageBuses for debugging apps ([4ba4427](https://github.com/angular/angular/commit/4ba4427)), closes [#3858](https://github.com/angular/angular/issues/3858)


### BREAKING CHANGES

#### Events

* Before

```html
<div (^click)="onEventHandler()">
  <button></button>
</div>
```

* After

```html
<div (click)="onEventHandler()">
  <button></button>
</div>
```

#### Lifecycle

* Before (ES5)

```js
var HelloCmp = ng.
  Component({
    selector: 'hello-cmp',
    lifecycle: [LifecycleEvent.onInit]
  })
  .View({
    template: `<h1>hello, there!</h1>`
  })
  .Class({
    onInit: function() {
      console.log('hello-cmp init');
    }
  });
```

* Before (ES6)

```js
import {Component, View, LifecycleEvent} from 'angular2/angular2';

@Component({
  selector: 'hello-cmp',
  lifecycle: [LifecycleEvent.onInit]
})
@View({
  template: `<h1>hello, there!</h1>`
})
class HelloCmp {
  onInit() {
    console.log('hello-cmp init');
  }
}
```

* After (ES5)

```js
var HelloCmp = ng.
  Component({
    selector: 'hello-cmp'
  })
  .View({
    template: `<h1>hello, there!</h1>`
  })
  .Class({
    onInit: function() {
      console.log('hello-cmp init');
    }
  });
```

* After (ES6)

```js
import {Component, View, OnInit} from 'angular2/angular2';

@Component({
  selector: 'hello-cmp'  
})
@View({
  template: `<h1>hello, there!</h1>`
})
class HelloCmp implements OnInit {
  onInit() {
    console.log('hello-cmp init');
  }
}
```


<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2015-08-31)


### Bug Fixes

* **.d.ts:** show unknown fields as ‘any’ not ‘void’. ([a0b2408](https://github.com/angular/angular/commit/a0b2408)), closes [#3637](https://github.com/angular/angular/issues/3637)
* **build:** do not run build/pubbuild.dart twice ([e72305e](https://github.com/angular/angular/commit/e72305e)), closes [#3831](https://github.com/angular/angular/issues/3831)
* **build:** error when running `npm test` locally ([bf4b75e](https://github.com/angular/angular/commit/bf4b75e)), closes [#3806](https://github.com/angular/angular/issues/3806)
* **build:** make e2e tests faster ([c2279dd](https://github.com/angular/angular/commit/c2279dd)), closes [#3822](https://github.com/angular/angular/issues/3822)
* **change_detection:** fixed reflect properties as attributes ([a9ce454](https://github.com/angular/angular/commit/a9ce454)), closes [#3761](https://github.com/angular/angular/issues/3761)
* **change_detection:** update the right change detector when using ON_PUSH mode ([195c5c2](https://github.com/angular/angular/commit/195c5c2))
* **compiler:** detect and report error for views with empty templateUrl ([215c4aa](https://github.com/angular/angular/commit/215c4aa)), closes [#3762](https://github.com/angular/angular/issues/3762) [#3768](https://github.com/angular/angular/issues/3768)
* **dart:** bad export in core.dart ([984e7b8](https://github.com/angular/angular/commit/984e7b8))
* **examples:** Modifies web worker examples to be compatible with systemjs 0.18.10. ([675cb87](https://github.com/angular/angular/commit/675cb87)), closes [#3630](https://github.com/angular/angular/issues/3630)
* **http:** allow using JSONP_INJECTABLES and HTTP_INJECTABLES in same injector ([5725f71](https://github.com/angular/angular/commit/5725f71)), closes [#3365](https://github.com/angular/angular/issues/3365) [#3390](https://github.com/angular/angular/issues/3390)
* **http/http:** allow for commonjs as ngHttp ([16eb8ce](https://github.com/angular/angular/commit/16eb8ce)), closes [#3633](https://github.com/angular/angular/issues/3633)
* **injector:** support getRootInjectors on dehydrated injectors. ([92da543](https://github.com/angular/angular/commit/92da543)), closes [#3760](https://github.com/angular/angular/issues/3760)
* **injectors:** reset the construction counter in dynamic strategy. ([272ad61](https://github.com/angular/angular/commit/272ad61)), closes [#3635](https://github.com/angular/angular/issues/3635)
* <template> tag for browsers that do not suppor them ([ddcfd46](https://github.com/angular/angular/commit/ddcfd46)), closes [#3636](https://github.com/angular/angular/issues/3636)
* **karma:** corrected race condition with RX loading ([8dc509f](https://github.com/angular/angular/commit/8dc509f))
* **parser:** detect and report interpolation in expressions ([b039ec3](https://github.com/angular/angular/commit/b039ec3)), closes [#3645](https://github.com/angular/angular/issues/3645) [#3750](https://github.com/angular/angular/issues/3750)
* **router:** allow router-link to link to redirects ([72e0b8f](https://github.com/angular/angular/commit/72e0b8f)), closes [#3335](https://github.com/angular/angular/issues/3335) [#3624](https://github.com/angular/angular/issues/3624)
* **router:** subscribe should return subscription ([5c95b37](https://github.com/angular/angular/commit/5c95b37)), closes [#3491](https://github.com/angular/angular/issues/3491) [#3695](https://github.com/angular/angular/issues/3695)
* **typings:** include static members ([894af28](https://github.com/angular/angular/commit/894af28)), closes [#3175](https://github.com/angular/angular/issues/3175) [#3780](https://github.com/angular/angular/issues/3780)
* **ViewLoader:** provide componentId in missing template / templateUrl errors ([3871f89](https://github.com/angular/angular/commit/3871f89))
* **wtf:** fix NgZone.run instrumentation ([5f0a0fd](https://github.com/angular/angular/commit/5f0a0fd)), closes [#3788](https://github.com/angular/angular/issues/3788)
* wtf paramater passing on scope ([9afcb00](https://github.com/angular/angular/commit/9afcb00)), closes [#3726](https://github.com/angular/angular/issues/3726)

### Features

* track unused reflection data ([8336881](https://github.com/angular/angular/commit/8336881))
* **browser:** support Edge ([3b49652](https://github.com/angular/angular/commit/3b49652)), closes [#3667](https://github.com/angular/angular/issues/3667)
* **build:** added a temporary fix to make test.unit.dart work ([85ec34d](https://github.com/angular/angular/commit/85ec34d))
* **change_detection:** added support for observable components and directives ([e8e430e](https://github.com/angular/angular/commit/e8e430e))
* **change_detection:** do not reparse AST when using generated detectors ([d2d0715](https://github.com/angular/angular/commit/d2d0715))
* **docs:** export type info for var and const exports ([9262727](https://github.com/angular/angular/commit/9262727)), closes [#3700](https://github.com/angular/angular/issues/3700)
* **facade:** add maximum method for ListWrapper ([b5c4d8b](https://github.com/angular/angular/commit/b5c4d8b))
* **http:** xhr error listener invokes throw on EventEmitter ([f2d3bdb](https://github.com/angular/angular/commit/f2d3bdb)), closes [#2667](https://github.com/angular/angular/issues/2667)
* **router:** add angular 1.x router ([fde026a](https://github.com/angular/angular/commit/fde026a))
* **router:** add reuse support for angular 1.x router ([ddb62fe](https://github.com/angular/angular/commit/ddb62fe)), closes [#3698](https://github.com/angular/angular/issues/3698)
* **url_resolver:** Allow a developer to customize their package prefix ([9cc1cd2](https://github.com/angular/angular/commit/9cc1cd2)), closes [#3794](https://github.com/angular/angular/issues/3794)



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
# 2.0.0-alpha.34 (2015-08-07)


### Bug Fixes

* **XHRConnection:** use xhr status code ([96eefdf](https://github.com/angular/angular/commit/96eefdf)), closes [#2841](https://github.com/angular/angular/issues/2841)
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

### Features

* **WebWorkers:** Add WebWorker Todo Example. Add support for more DOM events. ([d44827a](https://github.com/angular/angular/commit/d44827a))
* **WebWorkers:** Add WebWorker Todo Example. Add support for more DOM events. ([c5cb700](https://github.com/angular/angular/commit/c5cb700))
* implement web-tracing-framework support ([77875a2](https://github.com/angular/angular/commit/77875a2)), closes [#2610](https://github.com/angular/angular/issues/2610)
* **compiler:** introduce schema for elements ([d894aa9](https://github.com/angular/angular/commit/d894aa9)), closes [#3353](https://github.com/angular/angular/issues/3353)
* **core:** made directives shadow native element properties ([3437d56](https://github.com/angular/angular/commit/3437d56))
* **md-button:** enhance button focus appearance. ([6d280ea](https://github.com/angular/angular/commit/6d280ea))
* **pipes:** replaces iterable and key value diffing pipes with services ([392de4a](https://github.com/angular/angular/commit/392de4a))
* enable the decorators compiler option. ([0bb78b7](https://github.com/angular/angular/commit/0bb78b7))
* export a proper promise type. ([861be30](https://github.com/angular/angular/commit/861be30))
* upgrade ts2dart to 0.7.1. ([a62a6ba](https://github.com/angular/angular/commit/a62a6ba))
* **router:** add `back()` support to `MockLocationStrategy` ([60f38ea](https://github.com/angular/angular/commit/60f38ea))
* **testability:** Expose function getAllAngularTestabilities ([7b94bbf](https://github.com/angular/angular/commit/7b94bbf))
* **transformers:** add more information to factory debug reflection ([be79942](https://github.com/angular/angular/commit/be79942))

### Performance Improvements

* **change_detection:** do not check intermediate results ([c1ee943](https://github.com/angular/angular/commit/c1ee943))
* **change_detection:** do not generate onAllChangesDone when not needed ([adc2739](https://github.com/angular/angular/commit/adc2739))
* **change_detection:** removed the currentProto property ([71ea199](https://github.com/angular/angular/commit/71ea199))


### BREAKING CHANGES

*     Directives that previously injected Pipes to get iterableDiff or keyvalueDiff, now should inject IterableDiffers and KeyValueDiffers.

*     Previously, if an element had a property, Angular would update that property even if there was a directive placed on the same element with the same property. Now, the directive would have to explicitly update the native elmement by either using hostProperties or the renderer.



<a name"2.0.0-alpha.33"></a>
### 2.0.0-alpha.33 (2015-07-30)


#### Bug Fixes

* addresses a couple ddc type errors ([f1e42920](https://github.com/angular/angular/commit/f1e42920))
* **.d.ts:** Correct new Type interface return type ([78fdf9a1](https://github.com/angular/angular/commit/78fdf9a1), closes [#2399](https://github.com/angular/angular/issues/2399), [#3316](https://github.com/angular/angular/issues/3316))
* **build:** don't trigger travis on g3sync branch ([61b77034](https://github.com/angular/angular/commit/61b77034))
* **change_detection:** convert interpolated null values to empty strings ([345fa521](https://github.com/angular/angular/commit/345fa521), closes [#3007](https://github.com/angular/angular/issues/3007), [#3271](https://github.com/angular/angular/issues/3271))
* **class:**
  * allow class names with mixed case ([a8b57256](https://github.com/angular/angular/commit/a8b57256), closes [#3001](https://github.com/angular/angular/issues/3001), [#3264](https://github.com/angular/angular/issues/3264))
  * correctly clean up on destroy ([1438922f](https://github.com/angular/angular/commit/1438922f), closes [#3249](https://github.com/angular/angular/issues/3249), [#3256](https://github.com/angular/angular/issues/3256))
* **compiler:** prevent race conditions ([5ec67ee2](https://github.com/angular/angular/commit/5ec67ee2), closes [#3206](https://github.com/angular/angular/issues/3206), [#3211](https://github.com/angular/angular/issues/3211))
* **core:** fix type error in setElementProperty ([448264be](https://github.com/angular/angular/commit/448264be), closes [#3279](https://github.com/angular/angular/issues/3279))
* **element_injector:** do not throw when cannot find element when trying to report an error ([03c8e742](https://github.com/angular/angular/commit/03c8e742))
* **presubmit:** corrected user/email for git push ([e40ff368](https://github.com/angular/angular/commit/e40ff368))
* **projection:**
  * allow more bound render elements than app elements. ([46502e4d](https://github.com/angular/angular/commit/46502e4d), closes [#3236](https://github.com/angular/angular/issues/3236), [#3247](https://github.com/angular/angular/issues/3247))
  * allow to project to a non text node ([b44b06c2](https://github.com/angular/angular/commit/b44b06c2), closes [#3230](https://github.com/angular/angular/issues/3230), [#3241](https://github.com/angular/angular/issues/3241))
* **query:** the view should not be visible to @Query. ([1d450294](https://github.com/angular/angular/commit/1d450294))
* **transformer:**
  * Fix generation of `annotations` argument when registering functions. ([2faa8985](https://github.com/angular/angular/commit/2faa8985))
  * Don't throw on annotations that don't match a descriptor. ([f575ba60](https://github.com/angular/angular/commit/f575ba60), closes [#3280](https://github.com/angular/angular/issues/3280))
  * Loggers now are per zone and each transform runs in its own zone ([bd65b63c](https://github.com/angular/angular/commit/bd65b63c))
* **typings:** test our .d.ts with --noImplicitAny ([19d8b221](https://github.com/angular/angular/commit/19d8b221))
* **url_resolver:** in Dart make package urls relative to AppRootUrl ([469afda5](https://github.com/angular/angular/commit/469afda5))


#### Features

* **benchmark:** add static_tree benchmark ([854b5b7d](https://github.com/angular/angular/commit/854b5b7d), closes [#3196](https://github.com/angular/angular/issues/3196))
* **bootstrap:** remove the need for explicit reflection setup in bootstrap code ([3531bb71](https://github.com/angular/angular/commit/3531bb71))
* **build:** initial SauceLabs setup ([eebd736c](https://github.com/angular/angular/commit/eebd736c), closes [#2347](https://github.com/angular/angular/issues/2347))
* **change_detection:**
  * generate checkNoChanges only in dev mode ([71bb4b3e](https://github.com/angular/angular/commit/71bb4b3e))
  * provide error context for change detection errors ([c2bbda02](https://github.com/angular/angular/commit/c2bbda02))
* **core:** provide an error context when an exception happens in an error handler ([8543c347](https://github.com/angular/angular/commit/8543c347))
* **di:** added context to runtime DI errors ([5a86f859](https://github.com/angular/angular/commit/5a86f859))
* **exception_handler:**
  * print originalException and originalStack for all exceptions ([e744409c](https://github.com/angular/angular/commit/e744409c))
  * change ExceptionHandler to output context ([fdf226ab](https://github.com/angular/angular/commit/fdf226ab))
* **http:** call complete on request complete ([6fac9011](https://github.com/angular/angular/commit/6fac9011), closes [#2635](https://github.com/angular/angular/issues/2635))
* **http.ts:** export BrowserXHR ([8a91d716](https://github.com/angular/angular/commit/8a91d716), closes [#2641](https://github.com/angular/angular/issues/2641))
* **lang:** added "context" to BaseException ([8ecb632d](https://github.com/angular/angular/commit/8ecb632d))
* **router:** use querystring params for top-level routes ([fdffcaba](https://github.com/angular/angular/commit/fdffcaba), closes [#3017](https://github.com/angular/angular/issues/3017))
* **testability:** hook zone into whenstable api with async support ([a8b75c3d](https://github.com/angular/angular/commit/a8b75c3d))
* **transformers:** directive aliases in Dart transformers (fix #1747) ([fd46b49e](https://github.com/angular/angular/commit/fd46b49e))
* **url_resolver:** support package: urls () ([408618b8](https://github.com/angular/angular/commit/408618b8), closes [#2991](https://github.com/angular/angular/issues/2991))


#### Breaking Changes

* View renderer used to take normalized CSS class names (ex. fooBar for foo-bar).
With this change a rendered implementation gets a calss name as specified in a
template, without any transformations / normalization. This change only affects
custom view renderers that should be updated accordingly.

Closes #3264

 ([a8b57256](https://github.com/angular/angular/commit/a8b57256))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2015-07-29)


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
* **style_url_resolver:** fix data: url resolution ([73b7d99](https://github.com/angular/angular/commit/73b7d99))
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
* **compiler:** introduce schema for elements ([d894aa9](https://github.com/angular/angular/commit/d894aa9)), closes [#3353](https://github.com/angular/angular/issues/3353)
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
# 2.0.0-alpha.32 (2015-07-21)


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
# 2.0.0-alpha.31 (2015-07-14)


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
# 2.0.0-alpha.30 (2015-07-08)


### Bug Fixes

* **.d.ts:** correct ComponentAnnotation inheritance ([12a427e](https://github.com/angular/angular/commit/12a427e)), closes [#2356](https://github.com/angular/angular/issues/2356)
* **Http:** add support for headers ([883b506](https://github.com/angular/angular/commit/883b506))
* **angular2.d.ts:** show typing for Component, etc ([b10d7a2](https://github.com/angular/angular/commit/b10d7a2))
* **change_detection:** do not coalesce records with different directive indices ([d277442](https://github.com/angular/angular/commit/d277442))
* **change_detection:** throw ChangeDetectionError in JIT mode ([c2efa23](https://github.com/angular/angular/commit/c2efa23))
* **compiler:** detect and strip data- prefix from bindings ([cd65fc2](https://github.com/angular/angular/commit/cd65fc2)), closes [#2687](https://github.com/angular/angular/issues/2687) [#2719](https://github.com/angular/angular/issues/2719)
* **di:** injecting null causes a cyclic dependency ([d1393b0](https://github.com/angular/angular/commit/d1393b0))
* handle errors w/o file information. ([e69af1a](https://github.com/angular/angular/commit/e69af1a))
* **forms:** Remove cyclic dependency ([e5405e4](https://github.com/angular/angular/commit/e5405e4)), closes [#2856](https://github.com/angular/angular/issues/2856)
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
# 2.0.0-alpha.29 (2015-07-01)


### Bug Fixes

* **Router:** mark Pipeline and RouteRegistry as Injectable ([eea989b](https://github.com/angular/angular/commit/eea989b)), closes [#2755](https://github.com/angular/angular/issues/2755)
* **build:** Reduce rx typings to what we actually require. ([8bab6dd](https://github.com/angular/angular/commit/8bab6dd))
* **build:** add missing return types now enforced by linter ([4489199](https://github.com/angular/angular/commit/4489199))
* **build:** fix paths in `test.typings` task ([1c8a589](https://github.com/angular/angular/commit/1c8a589))
* **bundle:** don’t bundle traceur/reflect into benchpress ([da4de21](https://github.com/angular/angular/commit/da4de21))
* **bundle:** don’t bundle traceur/reflect into benchpress - amended change ([d629ed7](https://github.com/angular/angular/commit/d629ed7))
* **change detectors:** Fix deduping of protos in transformed dart mode. ([73a939e](https://github.com/angular/angular/commit/73a939e))
* **compiler:** don't trigger duplicated directives ([0598226](https://github.com/angular/angular/commit/0598226)), closes [#2756](https://github.com/angular/angular/issues/2756) [#2568](https://github.com/angular/angular/issues/2568)
* export top-level pipe factories as const ([393f703](https://github.com/angular/angular/commit/393f703))
* **docs:** link to clang-format ([f1cf529](https://github.com/angular/angular/commit/f1cf529))
* **docs:** to run js test 'gulp docs' is needed ([3e65037](https://github.com/angular/angular/commit/3e65037)), closes [#2762](https://github.com/angular/angular/issues/2762)
* **dynamic_component_loader:** check whether the dynamically loaded component has already been destroyed ([d6cef88](https://github.com/angular/angular/commit/d6cef88)), closes [#2748](https://github.com/angular/angular/issues/2748) [#2767](https://github.com/angular/angular/issues/2767)
* **transformer:** Add getters for `events`. ([5a21dc5](https://github.com/angular/angular/commit/5a21dc5))
* **transformer:** Don't hang on bad urls and log better errors ([d037c08](https://github.com/angular/angular/commit/d037c08))
* **transformer:** Fix annotation_matcher for NgForm directive. ([9c76850](https://github.com/angular/angular/commit/9c76850))
* **typings:** Minor issues preventing angular2.d.ts from working in TS 1.4. ([7a4a3c8](https://github.com/angular/angular/commit/7a4a3c8))

### Features

* **NgStyle:** add new NgStyle directive ([b50edfd](https://github.com/angular/angular/commit/b50edfd)), closes [#2665](https://github.com/angular/angular/issues/2665)
* **async:** added PromiseWrapper.wrap ([b688dee](https://github.com/angular/angular/commit/b688dee))
* **benchpress:** initial support for firefox ([0949a4b](https://github.com/angular/angular/commit/0949a4b)), closes [#2419](https://github.com/angular/angular/issues/2419)
* **build:** add tslint to the build. ([bc585f2](https://github.com/angular/angular/commit/bc585f2))
* upgrade clang-format and gulp-clang-format. ([1f7296c](https://github.com/angular/angular/commit/1f7296c))
* **di:** changed InstantiationError to print the original stack ([eb0fd79](https://github.com/angular/angular/commit/eb0fd79))
* **di:** removed app injector ([f0e962c](https://github.com/angular/angular/commit/f0e962c))
* **facade:** add ListWrapper.toJSON method ([2335075](https://github.com/angular/angular/commit/2335075))
* **http:** refactor library to work in dart ([55bf0e5](https://github.com/angular/angular/commit/55bf0e5)), closes [#2415](https://github.com/angular/angular/issues/2415)
* **lang:** added originalException and originalStack to BaseException ([56245c6](https://github.com/angular/angular/commit/56245c6))
* **pipes:** add limitTo pipe ([0b50258](https://github.com/angular/angular/commit/0b50258))
* **pipes:** support arguments in transform function ([600d53c](https://github.com/angular/angular/commit/600d53c))
* **router:** support deep-linking to anywhere in the app ([f66ce09](https://github.com/angular/angular/commit/f66ce09)), closes [#2642](https://github.com/angular/angular/issues/2642)
* **transformers:** provide a flag to disable inlining views ([dcdd730](https://github.com/angular/angular/commit/dcdd730)), closes [#2658](https://github.com/angular/angular/issues/2658)

### Performance Improvements

* **Compiler:** do not resolve bindings for cached ProtoViews ([7a7b3a6](https://github.com/angular/angular/commit/7a7b3a6))


### BREAKING CHANGES

* THe appInjector property has been removed. Instead use viewInjector or hostInjector.



<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2015-06-24)


### Bug Fixes

* **ShadowDomStrategy:** always inline import rules ([1c4d233](https://github.com/angular/angular/commit/1c4d233)), closes [#1694](https://github.com/angular/angular/issues/1694)
* **XHRImpl:** file:/// and IE9 bugs ([cd735c4](https://github.com/angular/angular/commit/cd735c4))
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
* **transformer:** Throw unimplemented errors in HtmlAdapter. ([f9d72bd](https://github.com/angular/angular/commit/f9d72bd)), closes [#2624](https://github.com/angular/angular/issues/2624) [#2627](https://github.com/angular/angular/issues/2627)
* **views:** remove dynamic component views, free host views, free embedded views ([5dee8e2](https://github.com/angular/angular/commit/5dee8e2)), closes [#2472](https://github.com/angular/angular/issues/2472) [#2339](https://github.com/angular/angular/issues/2339)

### Features

* **CSSClass:** add support for string and array expresions ([8c993dc](https://github.com/angular/angular/commit/8c993dc)), closes [#2025](https://github.com/angular/angular/issues/2025)
* **compiler:** detect dangling property bindings ([d7b9345](https://github.com/angular/angular/commit/d7b9345)), closes [#2598](https://github.com/angular/angular/issues/2598)
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
# 2.0.0-alpha.27 (2015-06-17)


### Bug Fixes

* **Compiler:** fix text nodes after content tags ([d599fd3](https://github.com/angular/angular/commit/d599fd3)), closes [#2095](https://github.com/angular/angular/issues/2095)
* **DirectiveMetadata:** add support for events, changeDetection ([b4e82b8](https://github.com/angular/angular/commit/b4e82b8))
* **JsonPipe:** always transform to json ([e77710a](https://github.com/angular/angular/commit/e77710a))
* **Parser:** Parse pipes in arguments ([f974532](https://github.com/angular/angular/commit/f974532)), closes [#1680](https://github.com/angular/angular/issues/1680)
* **ShadowDom:** fix emulation integration spec to test all 3 strategies ([6e38515](https://github.com/angular/angular/commit/6e38515)), closes [#2546](https://github.com/angular/angular/issues/2546)
* **analzyer:** removed unused imports ([902759e](https://github.com/angular/angular/commit/902759e))
* **benchmarks:** Do not apply the angular transformer to e2e tests ([cee2682](https://github.com/angular/angular/commit/cee2682)), closes [#2454](https://github.com/angular/angular/issues/2454)
* **bootstrap:** temporary disable jit change detection because of a bug in handling pure functio ([9908def](https://github.com/angular/angular/commit/9908def))
* **broccoli:** ensure that inputTrees are stable ([928ec1c](https://github.com/angular/angular/commit/928ec1c))
* **build:** Minify files for angular2.min.js bundle ([76797df](https://github.com/angular/angular/commit/76797df))
* **build:** ensure that asset files are copied over to example directories ([60b97b2](https://github.com/angular/angular/commit/60b97b2))
* **build:** only pass ts files to ts2dart transpilation. ([b5431e4](https://github.com/angular/angular/commit/b5431e4))
* **bundle:** makes interfaces.ts non-empty when transpiled. ([83e99fc](https://github.com/angular/angular/commit/83e99fc))
* **change detect:** Fix bug in JIT change detectors ([e0fbd4b](https://github.com/angular/angular/commit/e0fbd4b))
* **ci:** remove non-existent gulp task from test_e2e_dart ([1cf807c](https://github.com/angular/angular/commit/1cf807c)), closes [#2509](https://github.com/angular/angular/issues/2509)
* **dart/transform:** Don't set ReflectionCapabilities over an async gap ([d1b35f9](https://github.com/angular/angular/commit/d1b35f9))
* **dartfmt:** don't break win32 command line limit ([617d693](https://github.com/angular/angular/commit/617d693)), closes [#2420](https://github.com/angular/angular/issues/2420) [#1875](https://github.com/angular/angular/issues/1875)
* **diffing-broccoli-plugin:** wrapped trees are always stable ([7611f92](https://github.com/angular/angular/commit/7611f92))
* **docs:** Working generated angular2.d.ts ([7141c15](https://github.com/angular/angular/commit/7141c15))
* **docs:** ensure no duplicates in alias names of docs ([05d02fa](https://github.com/angular/angular/commit/05d02fa))
* **docs:** order class members in order of declaration ([ea27704](https://github.com/angular/angular/commit/ea27704)), closes [#2569](https://github.com/angular/angular/issues/2569)
* **docs:** update link paths in annotations ([dd23bab](https://github.com/angular/angular/commit/dd23bab)), closes [#2452](https://github.com/angular/angular/issues/2452) [#2475](https://github.com/angular/angular/issues/2475)
* **dynamic_component_loader:** Fix for ts2dart issue ([bbfb4e1](https://github.com/angular/angular/commit/bbfb4e1))
* **dynamic_component_loader:** implemented dispose for dynamically-loaded components ([21dcfc8](https://github.com/angular/angular/commit/21dcfc8))
* **element_injector:** changed visibility rules to expose hostInjector of the component to its shadow d ([c51aef9](https://github.com/angular/angular/commit/c51aef9))
* **forms:** fixed the handling of the select element ([f1541e6](https://github.com/angular/angular/commit/f1541e6))
* **forms:** fixed the selector of NgRequiredValidator ([35197ac](https://github.com/angular/angular/commit/35197ac))
* **forms:** getError does not work without path ([a858f6a](https://github.com/angular/angular/commit/a858f6a))
* **forms:** updated form examples to contain select elements ([c34cb01](https://github.com/angular/angular/commit/c34cb01))
* **life_cycle:** throw when recursively reentering LifeCycle.tick ([af35ab5](https://github.com/angular/angular/commit/af35ab5))
* **locals:** improved an error message ([4eb8c9b](https://github.com/angular/angular/commit/4eb8c9b))
* Class factory now adds annotations ([bc9e482](https://github.com/angular/angular/commit/bc9e482))
* Improve error message on missing dependency ([2ccc65d](https://github.com/angular/angular/commit/2ccc65d))
* add types for ts2dart's façade handling. ([f3d7418](https://github.com/angular/angular/commit/f3d7418))
* compare strings with StringWrapper.equals ([633cf63](https://github.com/angular/angular/commit/633cf63))
* corrected var/# parsing in template ([a418397](https://github.com/angular/angular/commit/a418397)), closes [#2084](https://github.com/angular/angular/issues/2084)
* declare var global. ([1346660](https://github.com/angular/angular/commit/1346660))
* improve type of TreeNode.children. ([c3c2ad1](https://github.com/angular/angular/commit/c3c2ad1))
* improve type safety by typing `refs`. ([4ae7df2](https://github.com/angular/angular/commit/4ae7df2))
* include error message in the stack trace ([8d081ea](https://github.com/angular/angular/commit/8d081ea))
* increase the stack frame size for tests ([ab8eb4f](https://github.com/angular/angular/commit/ab8eb4f))
* makes NgModel work in strict mode ([eb3586d](https://github.com/angular/angular/commit/eb3586d))
* **ng_zone:** updated zone not to run onTurnDown when invoking run synchronously from onTurnDo ([15dab7c](https://github.com/angular/angular/commit/15dab7c))
* **npm:** update scripts and readme for npm packages. ([8923103](https://github.com/angular/angular/commit/8923103)), closes [#2377](https://github.com/angular/angular/issues/2377)
* **router:** avoid two slash values between the baseHref and the path ([cdc7b03](https://github.com/angular/angular/commit/cdc7b03))
* rename FORWARD_REF to forwardRef in the Angular code base. ([c4ecbf0](https://github.com/angular/angular/commit/c4ecbf0))
* **router:** do not prepend the root URL with a starting slash ([e372cc7](https://github.com/angular/angular/commit/e372cc7))
* **router:** ensure that root URL redirect doesn't redirect non-root URLs ([73d1525](https://github.com/angular/angular/commit/73d1525)), closes [#2221](https://github.com/angular/angular/issues/2221)
* **router:** rethrow exceptions ([5782f06](https://github.com/angular/angular/commit/5782f06)), closes [#2391](https://github.com/angular/angular/issues/2391)
* **selector:** select by attribute independent of value and order ([9bad70b](https://github.com/angular/angular/commit/9bad70b)), closes [#2513](https://github.com/angular/angular/issues/2513)
* **shadow_dom:** moves the imported nodes into the correct location. ([92d5658](https://github.com/angular/angular/commit/92d5658))
* **shrinkwrap:** restore fsevents dependency ([833048f](https://github.com/angular/angular/commit/833048f)), closes [#2511](https://github.com/angular/angular/issues/2511)
* **view:** local variables override local variables set by ng-for ([d8e2795](https://github.com/angular/angular/commit/d8e2795))

### Features

* **AstTranformer:** add support for missing nodes ([da60381](https://github.com/angular/angular/commit/da60381))
* **BaseRequestOptions:** add merge method to make copies of options ([93596df](https://github.com/angular/angular/commit/93596df))
* **Directive:** Have a single Directive.host which mimics HTML ([f3b4937](https://github.com/angular/angular/commit/f3b4937)), closes [#2268](https://github.com/angular/angular/issues/2268)
* **ElementInjector:** throw if multiple directives define the same host injectable ([6a6b43d](https://github.com/angular/angular/commit/6a6b43d))
* **Events:** allow a different event vs field name ([29c72ab](https://github.com/angular/angular/commit/29c72ab)), closes [#2272](https://github.com/angular/angular/issues/2272) [#2344](https://github.com/angular/angular/issues/2344)
* **FakeAsync:** check pending timers at the end of fakeAsync in Dart ([53694eb](https://github.com/angular/angular/commit/53694eb))
* **Http:** add Http class ([b68e561](https://github.com/angular/angular/commit/b68e561)), closes [#2530](https://github.com/angular/angular/issues/2530)
* **Parser:** implement Unparser ([331a051](https://github.com/angular/angular/commit/331a051)), closes [#1949](https://github.com/angular/angular/issues/1949) [#2395](https://github.com/angular/angular/issues/2395)
* **Parser:** support if statements in actions ([7d32879](https://github.com/angular/angular/commit/7d32879)), closes [#2022](https://github.com/angular/angular/issues/2022)
* **View:** add support for styleUrls and styles ([ac3e624](https://github.com/angular/angular/commit/ac3e624)), closes [#2382](https://github.com/angular/angular/issues/2382)
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
* **e2e:** added e2e tests for forms ([552d1ed](https://github.com/angular/angular/commit/552d1ed))
* **facade:** add isMap method ([548f3dd](https://github.com/angular/angular/commit/548f3dd))
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
* **query:** adds support for descendants and more list apis. ([355ab5b](https://github.com/angular/angular/commit/355ab5b))
* **query:** notify on changes ([5bfcca2](https://github.com/angular/angular/commit/5bfcca2))
* **router:** add routing to async components ([cd95e07](https://github.com/angular/angular/commit/cd95e07))
* **router:** allow configuring app base href via token ([cab1d0e](https://github.com/angular/angular/commit/cab1d0e))
* **transform:** update for Directive.host ([591f742](https://github.com/angular/angular/commit/591f742))
* **transformers:** updated transformers ([e5419fe](https://github.com/angular/angular/commit/e5419fe))
* **view:** added support for exportAs, so any directive can be assigned to a variable ([69b75b7](https://github.com/angular/angular/commit/69b75b7))
* upgrade to clang-format v1.0.19. ([1c2abbc](https://github.com/angular/angular/commit/1c2abbc))

### Performance Improvements

* **RouterLink:** use hostListeners for click ([92f1af8](https://github.com/angular/angular/commit/92f1af8)), closes [#2401](https://github.com/angular/angular/issues/2401)
* **render:** don't create property setters if not needed ([4f27611](https://github.com/angular/angular/commit/4f27611))
* **render:** don’t create an intermediate element array in renderer ([9cd510a](https://github.com/angular/angular/commit/9cd510a))
* **render:** only create `LightDom` instances if the element has children ([ca09701](https://github.com/angular/angular/commit/ca09701))
* **render:** precompute # bound text nodes and root nodes in `DomProtoView` ([24e647e](https://github.com/angular/angular/commit/24e647e))


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
