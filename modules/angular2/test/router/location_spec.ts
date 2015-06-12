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
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {BrowserLocation} from 'angular2/src/router/browser_location';
import {Location} from 'angular2/src/router/location';

export function main() {
  describe('Location', () => {

    var browserLocation, location;

    beforeEach(() => {
      browserLocation = new DummyBrowserLocation();
      browserLocation.spy('pushState');
      browserLocation.baseHref = '/my/app';
      location = new Location(browserLocation);
    });

    it('should normalize relative urls on navigate', () => {
      location.go('user/btford');
      expect(browserLocation.spy('pushState'))
          .toHaveBeenCalledWith(null, '', '/my/app/user/btford');
    });

    it('should not prepend urls with starting slash when an empty URL is provided',
       () => { expect(location.normalizeAbsolutely('')).toEqual(browserLocation.baseHref); });

    it('should not prepend path with an extra slash when a baseHref has a trailing slash', () => {
      browserLocation = new DummyBrowserLocation();
      browserLocation.spy('pushState');
      browserLocation.baseHref = '/my/slashed/app/';
      location = new Location(browserLocation);
      expect(location.normalizeAbsolutely('/page')).toEqual('/my/slashed/app/page');
    });

    it('should not append urls with leading slash on navigate', () => {
      location.go('/my/app/user/btford');
      expect(browserLocation.spy('pushState'))
          .toHaveBeenCalledWith(null, '', '/my/app/user/btford');
    });

    it('should remove index.html from base href', () => {
      browserLocation.baseHref = '/my/app/index.html';
      location = new Location(browserLocation);
      location.go('user/btford');
      expect(browserLocation.spy('pushState'))
          .toHaveBeenCalledWith(null, '', '/my/app/user/btford');
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
  });
}

@proxy
@IMPLEMENTS(BrowserLocation)
class DummyBrowserLocation extends SpyObject {
  baseHref;
  internalPath;
  _subject: EventEmitter;
  constructor() {
    super();
    this.internalPath = '/';
    this._subject = new EventEmitter();
  }

  simulatePopState(url) {
    this.internalPath = url;
    ObservableWrapper.callNext(this._subject, null);
  }

  path() { return this.internalPath; }

  onPopState(fn) { ObservableWrapper.subscribe(this._subject, fn); }

  getBaseHref() { return this.baseHref; }

  noSuchMethod(m) { return super.noSuchMethod(m); }
}
