import {
  AsyncTestCompleter,
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

import {TestBed} from 'angular2/test';

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

    var ctx: MyComp;
    var tb: TestBed;
    var view, rtr, location;

    beforeEachBindings(() => [
      Pipeline,
      RouteRegistry,
      DirectiveResolver,
      bind(Location).toClass(SpyLocation),
      bind(Router)
          .toFactory((registry, pipeline,
                      location) => { return new RootRouter(registry, pipeline, location, MyComp); },
                     [RouteRegistry, Pipeline, Location])
    ]);

    beforeEach(inject([TestBed, Router, Location], (testBed, router, loc) => {
      tb = testBed;
      ctx = new MyComp();
      rtr = router;
      location = loc;
      teamCmpCount = 0;
    }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      tb.overrideView(
          MyComp,
          new annotations.View(
              {template: ('<div>' + template + '</div>'), directives: [RouterOutlet, RouterLink]}));
      return tb.createView(MyComp, {context: ctx}).then((v) => { view = v; });
    }

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/test', 'component': HelloCmp}))
             .then((_) => rtr.navigate('/test'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello');
               async.done();
             });
       }));


    it('should navigate between components with different parameters',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp}))
             .then((_) => rtr.navigate('/user/brian'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello brian');
             })
             .then((_) => rtr.navigate('/user/igor'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello igor');
               async.done();
             });
       }));


    it('should work with child routers', inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config({'path': '/a', 'component': ParentCmp}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));


    it('should work with redirects', inject([AsyncTestCompleter, Location], (async, location) => {
         compile()
             .then((_) => rtr.config({'path': '/original', 'redirectTo': '/redirected'}))
             .then((_) => rtr.config({'path': '/redirected', 'component': A}))
             .then((_) => rtr.navigate('/original'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('A');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));

    function getHref(view) { return DOM.getAttribute(view.rootNodes[0].childNodes[0], 'href'); }

    it('should generate absolute hrefs that include the base href',
       inject([AsyncTestCompleter], (async) => {
         location.setBaseHref('/my/base');
         compile('<a href="hello" router-link="user"></a>')
             .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               view.detectChanges();
               expect(getHref(view)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" router-link="user"></a>')
             .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               view.detectChanges();
               expect(getHref(view)).toEqual('/user');
               async.done();
             });
       }));


    it('should reuse common parent components', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config({'path': '/team/:id', 'component': TeamCmp}))
             .then((_) => rtr.navigate('/team/angular/user/rado'))
             .then((_) => {
               view.detectChanges();
               expect(teamCmpCount).toBe(1);
               expect(view.rootNodes).toHaveText('team angular { hello rado }');
             })
             .then((_) => rtr.navigate('/team/angular/user/victor'))
             .then((_) => {
               view.detectChanges();
               expect(teamCmpCount).toBe(1);
               expect(view.rootNodes).toHaveText('team angular { hello victor }');
               async.done();
             });
       }));


    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         ctx.name = 'brian';
         compile('<a href="hello" router-link="user" [router-params]="{name: name}">{{name}}</a>')
             .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp, 'as': 'user'}))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('brian');
               expect(DOM.getAttribute(view.rootNodes[0].childNodes[0], 'href'))
                   .toEqual('/user/brian');
               async.done();
             });
       }));

    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = view.rootNodes[0].childNodes[0];
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('test', inject([AsyncTestCompleter], (async) => { async.done(); }));

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" router-link="user"></a>')
               .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 view.detectChanges();

                 var dispatchedEvent = clickOnElement(view);
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
           compile('<a href="hello" router-link="user"></a>')
               .then((_) => rtr.config({'path': '/user', 'component': UserCmp, 'as': 'user'}))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 view.detectChanges();

                 var dispatchedEvent = clickOnElement(view);
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
