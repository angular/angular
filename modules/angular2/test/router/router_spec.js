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
import {RootRouter, Viewport} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {RouterOutlet} from 'angular2/src/router/router_outlet';


export function main() {
  describe('Router', () => {
    var router;

    beforeEach(() => {
      router = new RootRouter(new Pipeline());
    });

    it('should navigate after being configured', inject([AsyncTestCompleter], (async) => {
      var outlet = makeDummyRef();

      router.registerOutlet(outlet)
        .then((_) => router.navigate('/a'))
        .then((_) => {
          expect(outlet.spy('activate')).not.toHaveBeenCalled();
          return router.config('/a', {'component': 'A' });
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
