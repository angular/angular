import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachBindings,
  ddescribe,
  describe,
  expect,
  iit,
  flushMicrotasks,
  inject,
  it,
  xdescribe,
  TestComponentBuilder,
  xit,
} from 'angular2/test_lib';

import {bootstrap} from 'angular2/src/core/application';
import {Component, Directive, View} from 'angular2/src/core/annotations/decorators';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {bind} from 'angular2/di';
import {DOCUMENT_TOKEN} from 'angular2/src/render/render';
import {RouteConfig, Route, Redirect} from 'angular2/src/router/route_config_decorator';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/lang';
import {
  routerInjectables,
  RouteParams,
  Router,
  appBaseHrefToken,
  routerDirectives
} from 'angular2/router';

import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';
import {appComponentTypeToken} from 'angular2/src/core/application_tokens';

export function main() {
  describe('router injectables', () => {
    beforeEachBindings(() => {
      return [routerInjectables, bind(LocationStrategy).toClass(MockLocationStrategy)];
    });

    // do not refactor out the `bootstrap` functionality. We still want to
    // keep this test around so we can ensure that bootstrapping a router works
    describe('boostrap functionality', () => {
      it('should bootstrap a simple app', inject([AsyncTestCompleter], (async) => {
           var fakeDoc = DOM.createHtmlDocument();
           var el = DOM.createElement('app-cmp', fakeDoc);
           DOM.appendChild(fakeDoc.body, el);

           bootstrap(AppCmp,
                     [
                       routerInjectables,
                       bind(LocationStrategy).toClass(MockLocationStrategy),
                       bind(DOCUMENT_TOKEN).toValue(fakeDoc)
                     ])
               .then((applicationRef) => {
                 var router = applicationRef.hostComponent.router;
                 router.subscribe((_) => {
                   expect(el).toHaveText('outer { hello }');
                   expect(applicationRef.hostComponent.location.path()).toEqual('');
                   async.done();
                 });
               });
         }));
    });

    describe('broken app', () => {
      beforeEachBindings(() => { return [bind(appComponentTypeToken).toValue(BrokenAppCmp)]; });

      it('should rethrow exceptions from component constructors',
         inject([AsyncTestCompleter, TestComponentBuilder], (async, tcb: TestComponentBuilder) => {
           tcb.createAsync(AppCmp).then((rootTC) => {
             var router = rootTC.componentInstance.router;
             PromiseWrapper.catchError(router.navigate('/cause-error'), (error) => {
               expect(rootTC.nativeElement).toHaveText('outer { oh no }');
               expect(error).toContainError('oops!');
               async.done();
             });
           });
         }));
    });

    describe('hierarchical app', () => {
      beforeEachBindings(() => { return [bind(appComponentTypeToken).toValue(HierarchyAppCmp)]; });

      it('should bootstrap an app with a hierarchy',
         inject([AsyncTestCompleter, TestComponentBuilder], (async, tcb: TestComponentBuilder) => {

           tcb.createAsync(HierarchyAppCmp)
               .then((rootTC) => {
                 var router = rootTC.componentInstance.router;
                 router.subscribe((_) => {
                   expect(rootTC.nativeElement).toHaveText('root { parent { hello } }');
                   expect(rootTC.componentInstance.location.path()).toEqual('/parent/child');
                   async.done();
                 });
                 router.navigate('/parent/child');
               });
         }));

      describe('custom app base ref', () => {
        beforeEachBindings(() => { return [bind(appBaseHrefToken).toValue('/my/app')]; });
        it('should bootstrap', inject([AsyncTestCompleter, TestComponentBuilder],
                                      (async, tcb: TestComponentBuilder) => {

                                        tcb.createAsync(HierarchyAppCmp)
                                            .then((rootTC) => {
                                              var router = rootTC.componentInstance.router;
                                              router.subscribe((_) => {
                                                expect(rootTC.nativeElement)
                                                    .toHaveText('root { parent { hello } }');
                                                expect(rootTC.componentInstance.location.path())
                                                    .toEqual('/my/app/parent/child');
                                                async.done();
                                              });
                                              router.navigate('/parent/child');
                                            });
                                      }));
      });
    });
    // TODO: add a test in which the child component has bindings

    describe('querystring params app', () => {
      beforeEachBindings(
          () => { return [bind(appComponentTypeToken).toValue(QueryStringAppCmp)]; });

      it('should recognize and return querystring params with the injected RouteParams',
         inject([AsyncTestCompleter, TestComponentBuilder], (async, tcb: TestComponentBuilder) => {
           tcb.createAsync(QueryStringAppCmp)
               .then((rootTC) => {
                 var router = rootTC.componentInstance.router;
                 router.subscribe((_) => {
                   rootTC.detectChanges();

                   expect(rootTC.nativeElement).toHaveText('qParam = search-for-something');
                   /*
                   expect(applicationRef.hostComponent.location.path())
                       .toEqual('/qs?q=search-for-something');*/
                   async.done();
                 });
                 router.navigate('/qs?q=search-for-something');
                 rootTC.detectChanges();
               });
         }));
    });
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

@Component({selector: 'qs-cmp'})
@View({template: "qParam = {{q}}"})
class QSCmp {
  q: string;
  constructor(params: RouteParams) { this.q = params.get('q'); }
}

@Component({selector: 'app-cmp'})
@View({template: `<router-outlet></router-outlet>`, directives: routerDirectives})
@RouteConfig([new Route({path: '/qs', component: QSCmp})])
class QueryStringAppCmp {
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
