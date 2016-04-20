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
  beforeEachProviders,
  SpyObject
} from 'angular2/testing_internal';

import {Injector, provide, ReflectiveInjector} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {Location, LocationStrategy, APP_BASE_HREF} from 'angular2/platform/common';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

export function main() {
  describe('Location', () => {

    var locationStrategy, location;

    function makeLocation(baseHref: string = '/my/app', provider: any = CONST_EXPR([])): Location {
      locationStrategy = new MockLocationStrategy();
      locationStrategy.internalBaseHref = baseHref;
      let injector = ReflectiveInjector.resolveAndCreate(
          [Location, provide(LocationStrategy, {useValue: locationStrategy}), provider]);
      return location = injector.get(Location);
    }

    beforeEach(makeLocation);

    it('should not prepend urls with starting slash when an empty URL is provided',
       () => { expect(location.prepareExternalUrl('')).toEqual(locationStrategy.getBaseHref()); });

    it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
      let location = makeLocation('/my/slashed/app/');
      expect(location.prepareExternalUrl('/page')).toEqual('/my/slashed/app/page');
    });

    it('should not append urls with leading slash on navigate', () => {
      location.go('/my/app/user/btford');
      expect(locationStrategy.path()).toEqual('/my/app/user/btford');
    });

    it('should normalize urls on popstate', inject([AsyncTestCompleter], (async) => {
         locationStrategy.simulatePopState('/my/app/user/btford');
         location.subscribe((ev) => {
           expect(ev['url']).toEqual('/user/btford');
           async.done();
         })
       }));

    it('should revert to the previous path when a back() operation is executed', () => {
      var locationStrategy = new MockLocationStrategy();
      var location = new Location(locationStrategy);

      function assertUrl(path) { expect(location.path()).toEqual(path); }

      location.go('/ready');
      assertUrl('/ready');

      location.go('/ready/set');
      assertUrl('/ready/set');

      location.go('/ready/set/go');
      assertUrl('/ready/set/go');

      location.back();
      assertUrl('/ready/set');

      location.back();
      assertUrl('/ready');
    });

    it('should incorporate the provided query values into the location change', () => {
      var locationStrategy = new MockLocationStrategy();
      var location = new Location(locationStrategy);

      location.go('/home', "key=value");
      expect(location.path()).toEqual("/home?key=value");
    });
  });
}
