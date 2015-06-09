import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';

import {bootstrap} from 'angular2/src/core/application';
import {Component, Directive, View} from 'angular2/src/core/annotations/decorators';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {bind} from 'angular2/di';
import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {RouteConfig} from 'angular2/src/router/route_config_decorator';
import {routerInjectables, Router} from 'angular2/router';
import {RouterOutlet} from 'angular2/src/router/router_outlet';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/lang';

export function main() {
  describe('router injectables', () => {
    var fakeDoc, el, testBindings;
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('app-cmp', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      testBindings = [
        routerInjectables,
        bind(Location).toClass(SpyLocation),
        bind(DOCUMENT_TOKEN).toValue(fakeDoc)
      ];
    });

    it('should support bootstrap a simple app', inject([AsyncTestCompleter], (async) => {
         bootstrap(AppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('outer { hello }');
                 async.done();
               });
             });
       }));

    it('should rethrow exceptions from component constructors',
       inject([AsyncTestCompleter], (async) => {
         bootstrap(BrokenAppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               PromiseWrapper.catchError(router.navigate('/cause-error'), (error) => {
                 expect(el).toHaveText('outer { oh no }');
                 expect(error.message).toBe('oops!');
                 async.done();
               });
             });
       }));

    // TODO: add a test in which the child component has bindings
  });
}


@Component({selector: 'hello-cmp'})
@View({template: "hello"})
class HelloCmp {
}

@Component({selector: 'app-cmp'})
@View({template: "outer { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([{path: '/', component: HelloCmp}])
class AppCmp {
  router: Router;
  constructor(router: Router) { this.router = router; }
}

@Component({selector: 'oops-cmp'})
@View({template: "oh no"})
class BrokenCmp {
  constructor() { throw new BaseException('oops!'); }
}

@Component({selector: 'app-cmp'})
@View({template: "outer { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([{path: '/cause-error', component: BrokenCmp}])
class BrokenAppCmp {
  router: Router;
  constructor(router: Router) { this.router = router; }
}
