import {
  AsyncTestCompleter,
  describe,
  proxy,
  it,
  iit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  beforeEachBindings,
  SpyObject
} from 'angular2/test_lib';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Router, RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {RouterOutlet} from 'angular2/src/router/router_outlet';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';

import {RouteRegistry} from 'angular2/src/router/route_registry';
import {RouteConfig, Route} from 'angular2/src/router/route_config_decorator';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

import {bind} from 'angular2/di';

export function main() {
  describe('Router', () => {
    var router, location;

    beforeEachBindings(() => [
      Pipeline,
      RouteRegistry,
      DirectiveResolver,
      bind(Location).toClass(SpyLocation),
      bind(Router)
          .toFactory((registry, pipeline,
                      location) => { return new RootRouter(registry, pipeline, location, AppCmp); },
                     [RouteRegistry, Pipeline, Location])
    ]);


    beforeEach(inject([Router, Location], (rtr, loc) => {
      router = rtr;
      location = loc;
    }));


    it('should navigate based on the initial URL state', inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.config([new Route({path: '/', component: DummyComponent})])
             .then((_) => router.registerOutlet(outlet))
             .then((_) => {
               expect(outlet.spy('commit')).toHaveBeenCalled();
               expect(location.urlChanges).toEqual([]);
               async.done();
             });
       }));


    it('should activate viewports and update URL on navigate',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerOutlet(outlet)
             .then((_) => router.config([new Route({path: '/a', component: DummyComponent})]))
             .then((_) => router.navigate('/a'))
             .then((_) => {
               expect(outlet.spy('commit')).toHaveBeenCalled();
               expect(location.urlChanges).toEqual(['/a']);
               async.done();
             });
       }));

    it('should not push a history change on when navigate is called with skipUrlChange',
       inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerOutlet(outlet)
             .then((_) => router.config([new Route({path: '/b', component: DummyComponent})]))
             .then((_) => router.navigate('/b', true))
             .then((_) => {
               expect(outlet.spy('commit')).toHaveBeenCalled();
               expect(location.urlChanges).toEqual([]);
               async.done();
             });
       }));


    it('should navigate after being configured', inject([AsyncTestCompleter], (async) => {
         var outlet = makeDummyOutlet();

         router.registerOutlet(outlet)
             .then((_) => router.navigate('/a'))
             .then((_) => {
               expect(outlet.spy('commit')).not.toHaveBeenCalled();
               return router.config([new Route({path: '/a', component: DummyComponent})]);
             })
             .then((_) => {
               expect(outlet.spy('commit')).toHaveBeenCalled();
               async.done();
             });
       }));


    it('should throw when linkParams does not start with a "/" or "./"', () => {
      expect(() => router.generate(['firstCmp', 'secondCmp']))
          .toThrowError(
              `Link "${ListWrapper.toJSON(['firstCmp', 'secondCmp'])}" must start with "/", "./", or "../"`);
    });


    it('should throw when linkParams does not include a route name', () => {
      expect(() => router.generate(['./']))
          .toThrowError(`Link "${ListWrapper.toJSON(['./'])}" must include a route name.`);
      expect(() => router.generate(['/']))
          .toThrowError(`Link "${ListWrapper.toJSON(['/'])}" must include a route name.`);
    });


    it('should generate URLs from the root component when the path starts with /', () => {
      router.config([new Route({path: '/first/...', component: DummyParentComp, as: 'firstCmp'})]);

      expect(router.generate(['/firstCmp', 'secondCmp'])).toEqual('/first/second');
      expect(router.generate(['/firstCmp', 'secondCmp'])).toEqual('/first/second');
      expect(router.generate(['/firstCmp/secondCmp'])).toEqual('/first/second');
    });

    describe('querstring params', () => {
      it('should only apply querystring params if the given URL is on the root router and is terminal',
         () => {
           router.config([
             new Route({path: '/hi/how/are/you', component: DummyComponent, as: 'greeting-url'})
           ]);

           var path = router.generate(['/greeting-url', {'name': 'brad'}]);
           expect(path).toEqual('/hi/how/are/you?name=brad');
         });

      it('should use parameters that are not apart of the route definition as querystring params',
         () => {
           router.config(
               [new Route({path: '/one/two/:three', component: DummyComponent, as: 'number-url'})]);

           var path = router.generate(['/number-url', {'three': 'three', 'four': 'four'}]);
           expect(path).toEqual('/one/two/three?four=four');
         });
    });

    describe('matrix params', () => {
      it('should apply inline matrix params for each router path within the generated URL', () => {
        router.config(
            [new Route({path: '/first/...', component: DummyParentComp, as: 'firstCmp'})]);

        var path =
            router.generate(['/firstCmp', {'key': 'value'}, 'secondCmp', {'project': 'angular'}]);
        expect(path).toEqual('/first;key=value/second;project=angular');
      });

      it('should apply inline matrix params for each router path within the generated URL and also include named params',
         () => {
           router.config([
             new Route({path: '/first/:token/...', component: DummyParentComp, as: 'firstCmp'})
           ]);

           var path =
               router.generate(['/firstCmp', {'token': 'min'}, 'secondCmp', {'author': 'max'}]);
           expect(path).toEqual('/first/min/second;author=max');
         });
    });
  });
}

@proxy
@IMPLEMENTS(RouterOutlet)
class DummyOutlet extends SpyObject {
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

class DummyComponent {}

@RouteConfig([new Route({path: '/second', component: DummyComponent, as: 'secondCmp'})])
class DummyParentComp {
}

function makeDummyOutlet() {
  var ref = new DummyOutlet();
  ref.spy('canActivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('canReuse').andCallFake((_) => PromiseWrapper.resolve(false));
  ref.spy('canDeactivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('commit').andCallFake((_) => PromiseWrapper.resolve(true));
  return ref;
}

class AppCmp {}
