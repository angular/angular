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

import {Injector, bind} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {Location, appBaseHrefToken} from 'angular2/src/router/location';
import {BrowserLocation} from 'angular2/src/router/browser_location';
import {DummyBrowserLocation} from 'angular2/src/mock/browser_location_mock';

export function main() {
  describe('Location', () => {

    var browserLocation, location;

    function makeLocation(baseHref: string = '/my/app', binding: any = CONST_EXPR([])): Location {
      browserLocation = new DummyBrowserLocation();
      browserLocation.internalBaseHref = baseHref;
      let injector = Injector.resolveAndCreate(
          [Location, bind(BrowserLocation).toValue(browserLocation), binding]);
      return location = injector.get(Location);
    }

    beforeEach(makeLocation);

    it('should normalize relative urls on navigate', () => {
      location.go('user/btford');
      expect(browserLocation.path()).toEqual('/my/app/user/btford');
    });

    it('should not prepend urls with starting slash when an empty URL is provided',
       () => { expect(location.normalizeAbsolutely('')).toEqual(browserLocation.getBaseHref()); });

    it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
      let location = makeLocation('/my/slashed/app/');
      expect(location.normalizeAbsolutely('/page')).toEqual('/my/slashed/app/page');
    });

    it('should not append urls with leading slash on navigate', () => {
      location.go('/my/app/user/btford');
      expect(browserLocation.path()).toEqual('/my/app/user/btford');
    });

    it('should remove index.html from base href', () => {
      let location = makeLocation('/my/app/index.html');
      location.go('user/btford');
      expect(browserLocation.path()).toEqual('/my/app/user/btford');
    });

    it('should normalize urls on popstate', inject([AsyncTestCompleter], (async) => {
         browserLocation.simulatePopState('/my/app/user/btford');
         location.subscribe((ev) => {
           expect(ev['url']).toEqual('/user/btford');
           async.done();
         })
       }));

    it('should normalize location path', () => {
      browserLocation.internalPath = '/my/app/user/btford';
      expect(location.path()).toEqual('/user/btford');
    });

    it('should use optional base href param', () => {
      let location = makeLocation('/', bind(appBaseHrefToken).toValue('/my/custom/href'));
      location.go('user/btford');
      expect(browserLocation.path()).toEqual('/my/custom/href/user/btford');
    });
  });
}
