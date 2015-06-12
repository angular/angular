import {
  AsyncTestCompleter,
  describe,
  it,
  iit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  SpyObject
} from 'angular2/test_lib';

import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {RouteRegistry} from 'angular2/src/router/route_registry';
import {RouteConfig} from 'angular2/src/router/route_config_decorator';

export function main() {
  describe('RouteRegistry', () => {
    var registry, rootHostComponent = new Object();

    beforeEach(() => { registry = new RouteRegistry(); });

    it('should match the full URL', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/', 'component': DummyCompA});
         registry.config(rootHostComponent, {'path': '/test', 'component': DummyCompB});

         registry.recognize('/test', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompB);
               async.done();
             });
       }));

    it('should prefer static segments to dynamic', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/:site', 'component': DummyCompB});
         registry.config(rootHostComponent, {'path': '/home', 'component': DummyCompA});

         registry.recognize('/home', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompA);
               async.done();
             });
       }));

    it('should prefer dynamic segments to star', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/:site', 'component': DummyCompA});
         registry.config(rootHostComponent, {'path': '/*site', 'component': DummyCompB});

         registry.recognize('/home', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompA);
               async.done();
             });
       }));

    it('should prefer routes with more dynamic segments', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/:first/*rest', 'component': DummyCompA});
         registry.config(rootHostComponent, {'path': '/*all', 'component': DummyCompB});

         registry.recognize('/some/path', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompA);
               async.done();
             });
       }));

    it('should prefer routes with more static segments', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/first/:second', 'component': DummyCompA});
         registry.config(rootHostComponent, {'path': '/:first/:second', 'component': DummyCompB});

         registry.recognize('/first/second', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompA);
               async.done();
             });
       }));

    it('should prefer routes with static segments before dynamic segments',
       inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent,
                         {'path': '/first/second/:third', 'component': DummyCompB});
         registry.config(rootHostComponent,
                         {'path': '/first/:second/third', 'component': DummyCompA});

         registry.recognize('/first/second/third', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyCompB);
               async.done();
             });
       }));

    it('should match the full URL using child components', inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/first', 'component': DummyParentComp});

         registry.recognize('/first/second', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyParentComp);
               expect(instruction.child.component).toBe(DummyCompB);
               async.done();
             });
       }));

    it('should match the URL using async child components',
       inject([AsyncTestCompleter], (async) => {
         registry.config(rootHostComponent, {'path': '/first', 'component': DummyAsyncComp});

         registry.recognize('/first/second', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyAsyncComp);
               expect(instruction.child.component).toBe(DummyCompB);
               async.done();
             });
       }));

    it('should match the URL using an async parent component',
       inject([AsyncTestCompleter], (async) => {
         registry.config(
             rootHostComponent,
             {'path': '/first', 'component': {'loader': AsyncParentLoader, 'type': 'loader'}});

         registry.recognize('/first/second', rootHostComponent)
             .then((instruction) => {
               expect(instruction.component).toBe(DummyParentComp);
               expect(instruction.child.component).toBe(DummyCompB);
               async.done();
             });
       }));

    it('should throw when a config does not have a component or redirectTo property', () => {
      expect(() => registry.config(rootHostComponent, {'path': '/some/path'}))
          .toThrowError(
              'Route config should contain exactly one \'component\', or \'redirectTo\' property');
    });

    it('should throw when a config has an invalid component type', () => {
      expect(() => registry.config(
                 rootHostComponent,
                 {'path': '/some/path', 'component': {'type': 'intentionallyWrongComponentType'}}))
          .toThrowError('Invalid component type \'intentionallyWrongComponentType\'');
    });
  });
}

function AsyncParentLoader() {
  return PromiseWrapper.resolve(DummyParentComp);
}

function AsyncChildLoader() {
  return PromiseWrapper.resolve(DummyCompB);
}

@RouteConfig([{'path': '/second', 'component': {'loader': AsyncChildLoader, 'type': 'loader'}}])
class DummyAsyncComp {
}

class DummyCompA {}
class DummyCompB {}

@RouteConfig([{'path': '/second', 'component': DummyCompB}])
class DummyParentComp {
}
