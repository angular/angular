import {
  AsyncTestCompleter,
  describe,
  proxy,
  it, iit,
  ddescribe, expect,
  inject, beforeEach,
  SpyObject} from 'angular2/test_lib';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {RouterOutlet} from 'angular2/src/router/router_outlet';
import {DummyLocation} from 'angular2/src/mock/location_mock'

export function main() {
  describe('Router', () => {
    var router,
        location;

    beforeEach(() => {
      location = new DummyLocation();
      router = new RootRouter(new Pipeline(), location);
    });


    it('should navigate based on the initial URL state', inject([AsyncTestCompleter], (async) => {
      var outlet = makeDummyRef();

      router.config({'path': '/', 'component': 'Index' })
        .then((_) => router.registerOutlet(outlet))
        .then((_) => {
          expect(outlet.spy('activate')).toHaveBeenCalled();
          expect(location.urlChanges).toEqual([]);
          async.done();
        });
    }));


    it('should activate viewports and update URL on navigate', inject([AsyncTestCompleter], (async) => {
      var outlet = makeDummyRef();

      router.registerOutlet(outlet)
        .then((_) => {
          return router.config({'path': '/a', 'component': 'A' });
        })
        .then((_) => router.navigate('/a'))
        .then((_) => {
          expect(outlet.spy('activate')).toHaveBeenCalled();
          expect(location.urlChanges).toEqual(['/a']);
          async.done();
        });
    }));

    it('should navigate after being configured', inject([AsyncTestCompleter], (async) => {
      var outlet = makeDummyRef();

      router.registerOutlet(outlet)
        .then((_) => router.navigate('/a'))
        .then((_) => {
          expect(outlet.spy('activate')).not.toHaveBeenCalled();
          return router.config({'path': '/a', 'component': 'A' });
        })
        .then((_) => {
          expect(outlet.spy('activate')).toHaveBeenCalled();
          async.done();
        });
    }));
  });
}

@proxy
@IMPLEMENTS(RouterOutlet)
class DummyOutletRef extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

function makeDummyRef() {
  var ref = new DummyOutletRef();
  ref.spy('activate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('canActivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('canDeactivate').andCallFake((_) => PromiseWrapper.resolve(true));
  ref.spy('deactivate').andCallFake((_) => PromiseWrapper.resolve(true));
  return ref;
}
