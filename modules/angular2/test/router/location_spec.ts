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

import {Injector, bind} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Location, APP_BASE_HREF} from 'angular2/src/router/location';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';

export function main() {
  describe('Location', () => {

    var locationStrategy, location;

    function makeLocation(baseHref: string = '/my/app', binding: any = CONST_EXPR([])): Location {
      locationStrategy = new MockLocationStrategy();
      locationStrategy.internalBaseHref = baseHref;
      let injector = Injector.resolveAndCreate(
          [Location, bind(LocationStrategy).toValue(locationStrategy), binding]);
      return location = injector.get(Location);
    }

    beforeEach(makeLocation);

    it('should normalize relative urls on navigate', () => {
      location.go('user/btford');
      expect(locationStrategy.path()).toEqual('/my/app/user/btford');
    });

    it('should not prepend urls with starting slash when an empty URL is provided',
       () => { expect(location.normalizeAbsolutely('')).toEqual(locationStrategy.getBaseHref()); });

    it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
      let location = makeLocation('/my/slashed/app/');
      expect(location.normalizeAbsolutely('/page')).toEqual('/my/slashed/app/page');
    });

    it('should not append urls with leading slash on navigate', () => {
      location.go('/my/app/user/btford');
      expect(locationStrategy.path()).toEqual('/my/app/user/btford');
    });

    it('should remove index.html from base href', () => {
      let location = makeLocation('/my/app/index.html');
      location.go('user/btford');
      expect(locationStrategy.path()).toEqual('/my/app/user/btford');
    });

    it('should normalize urls on popstate', inject([AsyncTestCompleter], (async) => {
         locationStrategy.simulatePopState('/my/app/user/btford');
         location.subscribe((ev) => {
           expect(ev['url']).toEqual('/user/btford');
           async.done();
         })
       }));

    it('should normalize location path', () => {
      locationStrategy.internalPath = '/my/app/user/btford';
      expect(location.path()).toEqual('/user/btford');
    });

    it('should use optional base href param', () => {
      let location = makeLocation('/', bind(APP_BASE_HREF).toValue('/my/custom/href'));
      location.go('user/btford');
      expect(locationStrategy.path()).toEqual('/my/custom/href/user/btford');
    });

    it('should throw when no base href is provided', () => {
      var locationStrategy = new MockLocationStrategy();
      locationStrategy.internalBaseHref = null;
      expect(() => new Location(locationStrategy))
          .toThrowError(
              `No base href set. Either provide a binding to "appBaseHrefToken" or add a base element.`);
    });

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
  });
}
