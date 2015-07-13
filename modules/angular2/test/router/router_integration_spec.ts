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
import {RouteConfig, Route, Redirect} from 'angular2/src/router/route_config_decorator';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/lang';
import {routerInjectables, Router, appBaseHrefToken, routerDirectives} from 'angular2/router';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

export function main() {
  describe('router injectables', () => {
    var fakeDoc, el, testBindings;
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('app-cmp', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      testBindings = [
        routerInjectables,
        bind(LocationStrategy).toClass(MockLocationStrategy),
        bind(DOCUMENT_TOKEN).toValue(fakeDoc)
      ];
    });

    it('should bootstrap a simple app', inject([AsyncTestCompleter], (async) => {
         bootstrap(AppCmp, testBindings)
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('outer { hello }');
                 expect(applicationRef.hostComponent.location.path()).toEqual('');
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
                 expect(error.message).toContain('oops!');
                 async.done();
               });
             });
       }));

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

    it('should bootstrap an app with a custom app base href',
       inject([AsyncTestCompleter], (async) => {
         bootstrap(HierarchyAppCmp, [testBindings, bind(appBaseHrefToken).toValue('/my/app')])
             .then((applicationRef) => {
               var router = applicationRef.hostComponent.router;
               router.subscribe((_) => {
                 expect(el).toHaveText('root { parent { hello } }');
                 expect(applicationRef.hostComponent.location.path())
                     .toEqual('/my/app/parent/child');
                 async.done();
               });
               router.navigate('/parent/child');
             });
       }));
    // TODO: add a test in which the child component has bindings
  });
}


@Component({selector: 'hello-cmp'})
@View({template: 'hello'})
class HelloCmp {
}

@Component({selector: 'app-cmp'})
@View({template: "outer { <router-outlet></router-outlet> }", directives: routerDirectives})
@RouteConfig([new Route({path: '/', component: HelloCmp})])
class AppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

@Component({selector: 'parent-cmp'})
@View({template: `parent { <router-outlet></router-outlet> }`, directives: routerDirectives})
@RouteConfig([new Route({path: '/child', component: HelloCmp})])
class ParentCmp {
}

@Component({selector: 'app-cmp'})
@View({template: `root { <router-outlet></router-outlet> }`, directives: routerDirectives})
@RouteConfig([new Route({path: '/parent/...', component: ParentCmp})])
class HierarchyAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}

@Component({selector: 'oops-cmp'})
@View({template: "oh no"})
class BrokenCmp {
  constructor() { throw new BaseException('oops!'); }
}

@Component({selector: 'app-cmp'})
@View({template: `outer { <router-outlet></router-outlet> }`, directives: routerDirectives})
@RouteConfig([new Route({path: '/cause-error', component: BrokenCmp})])
class BrokenAppCmp {
  constructor(public router: Router, public location: LocationStrategy) {}
}
