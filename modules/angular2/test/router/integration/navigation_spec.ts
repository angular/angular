import {
  ComponentFixture,
  AsyncTestCompleter,
  TestComponentBuilder,
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
} from 'angular2/testing_internal';

import {provide, Component, View, Injector, Inject} from 'angular2/core';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {RootRouter} from 'angular2/src/router/router';
import {Router, RouterOutlet, RouterLink, RouteParams, RouteData} from 'angular2/router';
import {
  RouteConfig,
  Route,
  AuxRoute,
  AsyncRoute,
  Redirect
} from 'angular2/src/router/route_config_decorator';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';
import {RouteRegistry} from 'angular2/src/router/route_registry';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';

var cmpInstanceCount;
var childCmpInstanceCount;
var log: string[];

export function main() {
  describe('navigation', () => {

    var tcb: TestComponentBuilder;
    var fixture: ComponentFixture;
    var rtr;

    beforeEachBindings(() => [
      RouteRegistry,
      DirectiveResolver,
      provide(Location, {useClass: SpyLocation}),
      provide(Router,
              {
                useFactory:
                    (registry, location) => { return new RootRouter(registry, location, MyComp); },
                deps: [RouteRegistry, Location]
              })
    ]);

    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
      tcb = tcBuilder;
      rtr = router;
      childCmpInstanceCount = 0;
      cmpInstanceCount = 0;
      log = [];
    }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      return tcb.overrideView(MyComp, new View({
                                template: ('<div>' + template + '</div>'),
                                directives: [RouterOutlet, RouterLink]
                              }))
          .createAsync(MyComp)
          .then((tc) => { fixture = tc; });
    }

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/test', component: HelloCmp})]))
             .then((_) => rtr.navigateByUrl('/test'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('hello');
               async.done();
             });
       }));


    it('should navigate between components with different parameters',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/user/:name', component: UserCmp})]))
             .then((_) => rtr.navigateByUrl('/user/brian'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('hello brian');
             })
             .then((_) => rtr.navigateByUrl('/user/igor'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('hello igor');
               async.done();
             });
       }));


    it('should navigate to child routes', inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config([new Route({path: '/a/...', component: ParentCmp})]))
             .then((_) => rtr.navigateByUrl('/a/b'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));

    it('should navigate to child routes that capture an empty path',
       inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config([new Route({path: '/a/...', component: ParentCmp})]))
             .then((_) => rtr.navigateByUrl('/a'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));


    it('should navigate to child routes of async routes', inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config([new AsyncRoute({path: '/a/...', loader: parentLoader})]))
             .then((_) => rtr.navigateByUrl('/a/b'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));


    it('should recognize and apply redirects',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile()
             .then((_) => rtr.config([
               new Redirect({path: '/original', redirectTo: '/redirected'}),
               new Route({path: '/redirected', component: HelloCmp})
             ]))
             .then((_) => rtr.navigateByUrl('/original'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('hello');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));


    it('should reuse common parent components', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/team/:id/...', component: TeamCmp})]))
             .then((_) => rtr.navigateByUrl('/team/angular/user/rado'))
             .then((_) => {
               fixture.detectChanges();
               expect(cmpInstanceCount).toBe(1);
               expect(fixture.debugElement.nativeElement).toHaveText('team angular { hello rado }');
             })
             .then((_) => rtr.navigateByUrl('/team/angular/user/victor'))
             .then((_) => {
               fixture.detectChanges();
               expect(cmpInstanceCount).toBe(1);
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('team angular { hello victor }');
               async.done();
             });
       }));

    it('should not reuse children when parent components change',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/team/:id/...', component: TeamCmp})]))
             .then((_) => rtr.navigateByUrl('/team/angular/user/rado'))
             .then((_) => {
               fixture.detectChanges();
               expect(cmpInstanceCount).toBe(1);
               expect(childCmpInstanceCount).toBe(1);
               expect(fixture.debugElement.nativeElement).toHaveText('team angular { hello rado }');
             })
             .then((_) => rtr.navigateByUrl('/team/dart/user/rado'))
             .then((_) => {
               fixture.detectChanges();
               expect(cmpInstanceCount).toBe(2);
               expect(childCmpInstanceCount).toBe(2);
               expect(fixture.debugElement.nativeElement).toHaveText('team dart { hello rado }');
               async.done();
             });
       }));

    it('should inject route data into component', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([
               new Route({path: '/route-data', component: RouteDataCmp, data: {isAdmin: true}})
             ]))
             .then((_) => rtr.navigateByUrl('/route-data'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('true');
               async.done();
             });
       }));

    it('should inject route data into component with AsyncRoute',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([
               new AsyncRoute(
                   {path: '/route-data', loader: AsyncRouteDataCmp, data: {isAdmin: true}})
             ]))
             .then((_) => rtr.navigateByUrl('/route-data'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('true');
               async.done();
             });
       }));

    it('should inject empty object if the route has no data property',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config(
                       [new Route({path: '/route-data-default', component: RouteDataCmp})]))
             .then((_) => rtr.navigateByUrl('/route-data-default'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('');
               async.done();
             });
       }));

    describe('auxiliary routes', () => {
      it('should recognize a simple case', inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: AuxCmp})]))
               .then((_) => rtr.navigateByUrl('/hello(modal)'))
               .then((_) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement)
                     .toHaveText('main {hello} | aux {modal}');
                 async.done();
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


function AsyncRouteDataCmp() {
  return PromiseWrapper.resolve(RouteDataCmp);
}

@Component({selector: 'data-cmp'})
@View({template: "{{myData}}"})
class RouteDataCmp {
  myData: boolean;
  constructor(data: RouteData) { this.myData = data.get('isAdmin'); }
}

@Component({selector: 'user-cmp'})
@View({template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) {
    childCmpInstanceCount += 1;
    this.user = params.get('name');
  }
}


function parentLoader() {
  return PromiseWrapper.resolve(ParentCmp);
}

@Component({selector: 'parent-cmp'})
@View({
  template: "inner { <router-outlet></router-outlet> }",
  directives: [RouterOutlet],
})
@RouteConfig([
  new Route({path: '/b', component: HelloCmp}),
  new Route({path: '/', component: HelloCmp}),
])
class ParentCmp {
  constructor() {}
}


@Component({selector: 'team-cmp'})
@View({
  template: "team {{id}} { <router-outlet></router-outlet> }",
  directives: [RouterOutlet],
})
@RouteConfig([new Route({path: '/user/:name', component: UserCmp})])
class TeamCmp {
  id: string;
  constructor(params: RouteParams) {
    this.id = params.get('id');
    cmpInstanceCount += 1;
  }
}


@Component({selector: 'my-comp'})
class MyComp {
  name;
}

@Component({selector: 'modal-cmp'})
@View({template: "modal"})
class ModalCmp {
}

@Component({selector: 'aux-cmp'})
@View({
  template: 'main {<router-outlet></router-outlet>} | ' +
                'aux {<router-outlet name="modal"></router-outlet>}',
  directives: [RouterOutlet],
})
@RouteConfig([
  new Route({path: '/hello', component: HelloCmp}),
  new AuxRoute({path: '/modal', component: ModalCmp}),
])
class AuxCmp {
}
