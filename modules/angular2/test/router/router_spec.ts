import {
  AsyncTestCompleter,
  describe,
  proxy,
  it,
  iit,
  xit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  beforeEachProviders
} from 'angular2/testing_internal';
import {SpyRouterOutlet} from './spies';
import {Type} from 'angular2/src/facade/lang';
import {PromiseWrapper, ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

import {Router, RootRouter} from 'angular2/src/router/router';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location/location';

import {RouteRegistry, ROUTER_PRIMARY_COMPONENT} from 'angular2/src/router/route_registry';
import {
  RouteConfig,
  AsyncRoute,
  Route,
  Redirect
} from 'angular2/src/router/route_config/route_config_decorator';

import {provide} from 'angular2/core';
import {RouterOutlet} from 'angular2/src/router/directives/router_outlet';

export function main() {
  describe('Router', () => {
    var router: Router;
    var location: Location;

    beforeEachProviders(() => [
      RouteRegistry,
      provide(Location, {useClass: SpyLocation}),
      provide(ROUTER_PRIMARY_COMPONENT, {useValue: AppCmp}),
      provide(Router, {useClass: RootRouter})
    ]);


    beforeEach(inject([Router, Location], (rtr: Router, loc: Location) => {
      router = rtr;
      location = loc;
    }));


    it('should navigate based on the initial URL state', inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.config([new Route({path: '/', component: DummyComponent})])
             .then((_) => router.registerPrimaryOutlet(outlet))
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               expect((<SpyLocation>location).urlChanges).toEqual([]);
               async.done();
             });
       }));

    it('should activate viewports and update URL on navigate',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([new Route({path: '/a', component: DummyComponent})]))
             .then((_) => router.navigateByUrl('/a'))
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               expect((<SpyLocation>location).urlChanges).toEqual(['/a']);
               async.done();
             });
       }));

    it('should activate viewports and update URL when navigating via DSL',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config(
                       [new Route({path: '/a', component: DummyComponent, name: 'A'})]))
             .then((_) => router.navigate(['/A']))
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               expect((<SpyLocation>location).urlChanges).toEqual(['/a']);
               async.done();
             });
       }));

    it('should not push a history change on when navigate is called with skipUrlChange',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([new Route({path: '/b', component: DummyComponent})]))
             .then((_) => router.navigateByUrl('/b', true))
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               expect((<SpyLocation>location).urlChanges).toEqual([]);
               async.done();
             });
       }));

    // See https://github.com/angular/angular/issues/5590
    // This test is disabled because it is flaky.
    // TODO: bford. make this test not flaky and reenable it.
    xit('should replace history when triggered by a hashchange with a redirect',
        inject([AsyncTestCompleter], (async) => {
          var outlet = makeDummyOutlet();

          router.registerPrimaryOutlet(outlet)
              .then((_) => router.config([
                new Redirect({path: '/a', redirectTo: ['B']}),
                new Route({path: '/b', component: DummyComponent, name: 'B'})
              ]))
              .then((_) => {
                router.subscribe((_) => {
                  expect((<SpyLocation>location).urlChanges).toEqual(['hash: a', 'replace: /b']);
                  async.done();
                });

                (<SpyLocation>location).simulateHashChange('a');
              });
        }));

    it('should push history when triggered by a hashchange without a redirect',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([new Route({path: '/a', component: DummyComponent})]))
             .then((_) => {
               router.subscribe((_) => {
                 expect((<SpyLocation>location).urlChanges).toEqual(['hash: a']);
                 async.done();
               });

               (<SpyLocation>location).simulateHashChange('a');
             });
       }));


    it('should trigger the onError callback of a router change subscription if the URL does not match a route',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([new Route({path: '/a', component: DummyComponent})]))
             .then((_) => {
               router.subscribe((_) => {}, (url) => {
                 expect(url).toEqual('b');
                 async.done();
               });
               (<SpyLocation>location).simulateHashChange('b');
             });
       }));

    it('should navigate after being configured', inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.navigateByUrl('/a'))
             .then((_) => {
               expect((<any>outlet).spy('activate')).not.toHaveBeenCalled();
               return router.config([new Route({path: '/a', component: DummyComponent})]);
             })
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               async.done();
             });
       }));

    it('should throw when linkParams does not include a route name', () => {
      expect(() => router.generate(['./']))
          .toThrowError(`Link "${ListWrapper.toJSON(['./'])}" must include a route name.`);
      expect(() => router.generate(['/']))
          .toThrowError(`Link "${ListWrapper.toJSON(['/'])}" must include a route name.`);
    });

    it('should, when subscribed to, return a disposable subscription', () => {
      expect(() => {
        var subscription = router.subscribe((_) => {});
        ObservableWrapper.dispose(subscription);
      }).not.toThrow();
    });

    it('should generate URLs from the root component when the path starts with /', () => {
      router.config(
          [new Route({path: '/first/...', component: DummyParentComp, name: 'FirstCmp'})]);

      var instruction = router.generate(['/FirstCmp', 'SecondCmp']);
      expect(stringifyInstruction(instruction)).toEqual('first/second');

      instruction = router.generate(['/FirstCmp/SecondCmp']);
      expect(stringifyInstruction(instruction)).toEqual('first/second');
    });

    it('should generate an instruction with terminal async routes',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet);
         router.config([new AsyncRoute({path: '/first', loader: loader, name: 'FirstCmp'})]);

         var instruction = router.generate(['/FirstCmp']);
         router.navigateByInstruction(instruction)
             .then((_) => {
               expect((<any>outlet).spy('activate')).toHaveBeenCalled();
               async.done();
             });
       }));

    it('should return whether a given instruction is active with isRouteActive',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([
               new Route({path: '/a', component: DummyComponent, name: 'A'}),
               new Route({path: '/b', component: DummyComponent, name: 'B'})
             ]))
             .then((_) => router.navigateByUrl('/a'))
             .then((_) => {
               var instruction = router.generate(['/A']);
               var otherInstruction = router.generate(['/B']);

               expect(router.isRouteActive(instruction)).toEqual(true);
               expect(router.isRouteActive(otherInstruction)).toEqual(false);
               async.done();
             });
       }));

    it('should provide the current instruction', inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerPrimaryOutlet(outlet)
             .then((_) => router.config([
               new Route({path: '/a', component: DummyComponent, name: 'A'}),
               new Route({path: '/b', component: DummyComponent, name: 'B'})
             ]))
             .then((_) => router.navigateByUrl('/a'))
             .then((_) => {
               var instruction = router.generate(['/A']);

               expect(router.currentInstruction).toEqual(instruction);
               async.done();
             });
       }));

    it('should provide the root level router from child routers', () => {
      let childRouter = router.childRouter(DummyComponent);
      expect(childRouter.root).toBe(router);
    });

    describe('query string params', () => {
      it('should use query string params for the root route', () => {
        router.config(
            [new Route({path: '/hi/how/are/you', component: DummyComponent, name: 'GreetingUrl'})]);

        var instruction = router.generate(['/GreetingUrl', {'name': 'brad'}]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual('hi/how/are/you?name=brad');
      });

      it('should preserve the number 1 as a query string value', () => {
        router.config(
            [new Route({path: '/hi/how/are/you', component: DummyComponent, name: 'GreetingUrl'})]);

        var instruction = router.generate(['/GreetingUrl', {'name': 1}]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual('hi/how/are/you?name=1');
      });

      it('should serialize parameters that are not part of the route definition as query string params',
         () => {
           router.config([
             new Route({path: '/one/two/:three', component: DummyComponent, name: 'NumberUrl'})
           ]);

           var instruction = router.generate(['/NumberUrl', {'three': 'three', 'four': 'four'}]);
           var path = stringifyInstruction(instruction);
           expect(path).toEqual('one/two/three?four=four');
         });
    });

    describe('matrix params', () => {
      it('should generate matrix params for each non-root component', () => {
        router.config(
            [new Route({path: '/first/...', component: DummyParentComp, name: 'FirstCmp'})]);

        var instruction =
            router.generate(['/FirstCmp', {'key': 'value'}, 'SecondCmp', {'project': 'angular'}]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual('first/second;project=angular?key=value');
      });

      it('should work with named params', () => {
        router.config(
            [new Route({path: '/first/:token/...', component: DummyParentComp, name: 'FirstCmp'})]);

        var instruction =
            router.generate(['/FirstCmp', {'token': 'min'}, 'SecondCmp', {'author': 'max'}]);
        var path = stringifyInstruction(instruction);
        expect(path).toEqual('first/min/second;author=max');
      });
    });
  });
}


function stringifyInstruction(instruction): string {
  return instruction.toRootUrl();
}

function loader(): Promise<Type> {
  return PromiseWrapper.resolve(DummyComponent);
}

class DummyComponent {}

@RouteConfig([new Route({path: '/second', component: DummyComponent, name: 'SecondCmp'})])
class DummyParentComp {
}

function makeDummyOutlet(): RouterOutlet {
  var ref = new SpyRouterOutlet();
  ref.spy('canActivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('routerCanReuse').andCallFake((_) => PromiseWrapper.resolve(false));
  ref.spy('routerCanDeactivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('activate').andCallFake((_) => PromiseWrapper.resolve(true));
  return <any>ref;
}

class AppCmp {}
