import {
  AsyncTestCompleter,
  TestComponentBuilder,
  asNativeElements,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit
} from 'angular2/test_lib';

import {Injector, bind} from 'angular2/di';
import {Component, View} from 'angular2/src/core/annotations/decorators';
import * as annotations from 'angular2/src/core/annotations_impl/view';
import {CONST} from 'angular2/src/facade/lang';

import {RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {Router, RouterOutlet, RouterLink, RouteParams} from 'angular2/router';
import {RouteConfig} from 'angular2/src/router/route_config_decorator';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';
import {RouteRegistry} from 'angular2/src/router/route_registry';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

var teamCmpCount;

export function main() {
  describe('Outlet Directive', () => {

    var tcb: TestComponentBuilder;
    var rootTC, rtr, location;

    beforeEachBindings(() => [
      Pipeline,
      bind(RouteRegistry).toFactory(() => new RouteRegistry(MyComp)),
      DirectiveResolver,
      bind(Location).toClass(SpyLocation),
      bind(Router)
          .toFactory((registry, pipeline,
                      location) => { return new RootRouter(registry, pipeline, location, MyComp); },
                     [RouteRegistry, Pipeline, Location])
    ]);

    beforeEach(inject([TestComponentBuilder, Router, Location], (tcBuilder, router, loc) => {
      tcb = tcBuilder;
      rtr = router;
      location = loc;
      teamCmpCount = 0;
    }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      return tcb.overrideView(MyComp, new annotations.View({
                  template: ('<div>' + template + '</div>'),
                  directives: [RouterOutlet, RouterLink]
                }))
          .createAsync(MyComp)
          .then((tc) => { rootTC = tc; });
    }

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/test', 'component': HelloCmp}))
             .then((_) => rtr.navigate('/test'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello');
               async.done();
             });
       }));


    it('should navigate between components with different parameters',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp}))
             .then((_) => rtr.navigate('/user/brian'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello brian');
             })
             .then((_) => rtr.navigate('/user/igor'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello igor');
               async.done();
             });
       }));


    it('should work with child routers', inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config({'path': '/a/...', 'component': ParentCmp}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));


    it('should work with redirects', inject([AsyncTestCompleter, Location], (async, location) => {
         compile()
             .then((_) => rtr.config({'path': '/original', 'redirectTo': '/redirected'}))
             .then((_) => rtr.config({'path': '/redirected', 'component': A}))
             .then((_) => rtr.navigate('/original'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('A');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));

    function getHref(tc) {
      return DOM.getAttribute(tc.componentViewChildren[0].nativeElement, 'href');
    }

    it('should generate absolute hrefs that include the base href',
       inject([AsyncTestCompleter], (async) => {
         location.setBaseHref('/my/base');
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/user');
               async.done();
             });
       }));


    it('should reuse common parent components', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/team/:id/...', 'component': TeamCmp}))
             .then((_) => rtr.navigate('/team/angular/user/rado'))
             .then((_) => {
               rootTC.detectChanges();
               expect(teamCmpCount).toBe(1);
               expect(rootTC.nativeElement).toHaveText('team angular { hello rado }');
             })
             .then((_) => rtr.navigate('/team/angular/user/victor'))
             .then((_) => {
               rootTC.detectChanges();
               expect(teamCmpCount).toBe(1);
               expect(rootTC.nativeElement).toHaveText('team angular { hello victor }');
               async.done();
             });
       }));


    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\', {name: name}]">{{name}}</a>')
             .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.componentInstance.name = 'brian';
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('brian');
               expect(DOM.getAttribute(rootTC.componentViewChildren[0].nativeElement, 'href'))
                   .toEqual('/user/brian');
               async.done();
             });
       }));

    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = rootTC.componentViewChildren[0].nativeElement;
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(dispatchedEvent.defaultPrevented || !dispatchedEvent.returnValue)
                     .toBe(true);

                 // router navigation is async.
                 rtr.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/user']);
                   async.done();
                 });
               });
         }));

      it('should navigate to link hrefs in presence of base href',
         inject([AsyncTestCompleter], (async) => {
           location.setBaseHref('/base');
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(dispatchedEvent.defaultPrevented || !dispatchedEvent.returnValue)
                     .toBe(true);

                 // router navigation is async.
                 rtr.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/base/user']);
                   async.done();
                 });
               });
         }));
    });
  });
}


@Component({selector: 'hello-cmp'})
@View({template: "{{greeting}}"})
class HelloCmp {
  greeting: string;
  constructor() { this.greeting = "hello"; }
}


@Component({selector: 'a-cmp'})
@View({template: "A"})
class A {
}


@Component({selector: 'b-cmp'})
@View({template: "B"})
class B {
}


@Component({selector: 'user-cmp'})
@View({template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}


@Component({selector: 'parent-cmp'})
@View({template: "inner { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([{path: '/b', component: HelloCmp}])
class ParentCmp {
  constructor() {}
}


@Component({selector: 'team-cmp'})
@View({template: "team {{id}} { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([{path: '/user/:name', component: UserCmp}])
class TeamCmp {
  id: string;
  constructor(params: RouteParams) {
    this.id = params.get('id');
    teamCmpCount += 1;
  }
}


@Component({selector: 'my-comp'})
class MyComp {
  name;
}
