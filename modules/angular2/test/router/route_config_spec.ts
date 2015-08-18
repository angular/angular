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

import {bootstrap} from 'angular2/bootstrap';
import {Component, Directive, View} from 'angular2/metadata';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {bind} from 'angular2/di';
import {DOCUMENT} from 'angular2/src/render/render';
import {Type} from 'angular2/src/facade/lang';

import {
  ROUTER_BINDINGS,
  Router,
  RouteConfig,
  APP_BASE_HREF,
  ROUTER_DIRECTIVES
} from 'angular2/router';

import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd(){};
}

export function main() {
  describe('RouteConfig with POJO arguments', () => {
    var fakeDoc, el, testBindings;
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('app-cmp', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      var logger = new _ArrayLogger();
      var exceptionHandler = new ExceptionHandler(logger, true);
      testBindings = [
        ROUTER_BINDINGS,
        bind(LocationStrategy).toClass(MockLocationStrategy),
        bind(DOCUMENT).toValue(fakeDoc),
        bind(ExceptionHandler).toValue(exceptionHandler)
      ];
    });

    it('should bootstrap an app with a hierarchy', inject([AsyncTestCompleter], (async) => {
         bootstrap(HierarchyAppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('root { parent { hello } }');
                 expect(applicationRef.hostComponent.location.path()).toEqual('/parent/child');
                 async.done();
               });
               router.navigate('/parent/child');
             });
       }));


    it('should work in an app with redirects', inject([AsyncTestCompleter], (async) => {
         bootstrap(RedirectAppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('root { hello }');
                 expect(applicationRef.hostComponent.location.path()).toEqual('/after');
                 async.done();
               });
               router.navigate('/before');
             });
       }));


    it('should work in an app with async components', inject([AsyncTestCompleter], (async) => {
         bootstrap(AsyncAppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('root { hello }');
                 expect(applicationRef.hostComponent.location.path()).toEqual('/hello');
                 async.done();
               });
               router.navigate('/hello');
             });
       }));


    it('should work in an app with a constructor component',
       inject([AsyncTestCompleter], (async) => {
         bootstrap(ExplicitConstructorAppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('root { hello }');
                 expect(applicationRef.hostComponent.location.path()).toEqual('/hello');
                 async.done();
               });
               router.navigate('/hello');
             });
       }));

    it('should throw if a config is missing a target',
       inject(
           [AsyncTestCompleter],
           (async) => {
               bootstrap(WrongConfigCmp, testBindings)
                   .catch((e) => {
                     expect(e.originalException)
                         .toContainError(
                             'Route config should contain exactly one "component", "loader", or "redirectTo" property.');
                     async.done();
                     return null;
                   })}));

    it('should throw if a config has an invalid component type',
       inject(
           [AsyncTestCompleter],
           (async) => {
               bootstrap(WrongComponentTypeCmp, testBindings)
                   .catch((e) => {
                     expect(e.originalException)
                         .toContainError(
                             'Invalid component type "intentionallyWrongComponentType". Valid types are "constructor" and "loader".');
                     async.done();
                     return null;
                   })}));
  });
}


@Component({selector: 'hello-cmp'})
@View({template: 'hello'})
class HelloCmp {
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([{path: '/before', redirectTo: '/after'}, {path: '/after', component: HelloCmp}])
class RedirectAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

function HelloLoader(): Promise<any> {
  return Promise.resolve(HelloCmp);
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([
  {path: '/hello', component: {type: 'loader', loader: HelloLoader}},
])
class AsyncAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([
  {path: '/hello', component: {type: 'constructor', constructor: HelloCmp}},
])
class ExplicitConstructorAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

@Component({selector: 'parent-cmp'})
@View({template: `parent { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([{path: '/child', component: HelloCmp}])
class ParentCmp {
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([{path: '/parent/...', component: ParentCmp}])
class HierarchyAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([{path: '/hello'}])
class WrongConfigCmp {
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: ROUTER_DIRECTIVES})
@RouteConfig([
  {path: '/hello', component: {type: 'intentionallyWrongComponentType', constructor: HelloCmp}},
])
class WrongComponentTypeCmp {
}
