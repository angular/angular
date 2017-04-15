import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy, PlatformLocation } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';

import { GaService } from 'app/shared/ga.service';
import { LocationService } from './location.service';

describe('LocationService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        LocationService,
        Location,
        { provide: GaService, useClass: TestGaService },
        { provide: LocationStrategy, useClass: MockLocationStrategy },
        { provide: PlatformLocation, useClass: MockPlatformLocation }
    ]);
  });

  describe('urlStream', () => {
    it('should emit the latest url at the time it is subscribed to', () => {

      const location: MockLocationStrategy = injector.get(LocationStrategy);

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      let initialUrl;
      service.currentUrl.subscribe(url => initialUrl = url);
      expect(initialUrl).toEqual('next-url3');
    });

    it('should emit all location changes after it has been subscribed to', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      const urls = [];
      service.currentUrl.subscribe(url => urls.push(url));

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      expect(urls).toEqual([
        'initial-url3',
        'next-url1',
        'next-url2',
        'next-url3'
      ]);
    });

    it('should pass only the latest and later urls to each subscriber', () => {
        const location: MockLocationStrategy = injector.get(LocationStrategy);
        const service: LocationService = injector.get(LocationService);

        location.simulatePopState('/initial-url1');
        location.simulatePopState('/initial-url2');
        location.simulatePopState('/initial-url3');

        const urls1 = [];
        service.currentUrl.subscribe(url => urls1.push(url));

        location.simulatePopState('/next-url1');
        location.simulatePopState('/next-url2');

        const urls2 = [];
        service.currentUrl.subscribe(url => urls2.push(url));

        location.simulatePopState('/next-url3');

        expect(urls1).toEqual([
          'initial-url3',
          'next-url1',
          'next-url2',
          'next-url3'
        ]);

        expect(urls2).toEqual([
          'next-url2',
          'next-url3'
        ]);
    });
  });

  describe('go', () => {
    it('should update the location', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      service.go('some-new-url');

      expect(location.internalPath).toEqual('some-new-url');
      expect(location.path(true)).toEqual('some-new-url');
    });

    it('should emit the new url', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      service.go('some-initial-url');

      const urls = [];
      service.currentUrl.subscribe(url => urls.push(url));

      service.go('some-new-url');

      expect(urls).toEqual([
        'some-initial-url',
        'some-new-url'
      ]);
    });
  });

  describe('search', () => {
    it('should read the query from the current location.path', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('a/b/c?foo=bar&moo=car');
      expect(service.search()).toEqual({ foo: 'bar', moo: 'car' });
    });

    it('should cope with an empty query', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('a/b/c');
      expect(service.search()).toEqual({ });

      location.simulatePopState('x/y/z?');
      expect(service.search()).toEqual({ });

      location.simulatePopState('x/y/z?x=');
      expect(service.search()).toEqual({ x: '' });

      location.simulatePopState('x/y/z?x');
      expect(service.search()).toEqual({ x: undefined });
    });

    it('should URL decode query values', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('a/b/c?query=a%26b%2Bc%20d');
      expect(service.search()).toEqual({ query: 'a&b+c d' });
    });

    it('should URL decode query keys', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('a/b/c?a%26b%2Bc%20d=value');
      expect(service.search()).toEqual({ 'a&b+c d': 'value' });
    });

    it('should cope with a hash on the URL', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      spyOn(location, 'path').and.callThrough();
      service.search();
      expect(location.path).toHaveBeenCalledWith(false);
    });
  });

  describe('setSearch', () => {
    it('should call replaceState on PlatformLocation', () => {
      const location: MockPlatformLocation = injector.get(PlatformLocation);
      const service: LocationService = injector.get(LocationService);

      const params = {};
      service.setSearch('Some label', params);
      expect(location.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'Some label', 'a/b/c');
    });

    it('should convert the params to a query string', () => {
      const location: MockPlatformLocation = injector.get(PlatformLocation);
      const service: LocationService = injector.get(LocationService);

      const params = { foo: 'bar', moo: 'car' };
      service.setSearch('Some label', params);
      expect(location.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'Some label', jasmine.any(String));
      const [path, query] = location.replaceState.calls.mostRecent().args[2].split('?');
      expect(path).toEqual('a/b/c');
      expect(query).toContain('foo=bar');
      expect(query).toContain('moo=car');
    });

    it('should URL encode param values', () => {
      const location: MockPlatformLocation = injector.get(PlatformLocation);
      const service: LocationService = injector.get(LocationService);

      const params = { query: 'a&b+c d' };
      service.setSearch('', params);
      const [, query] = location.replaceState.calls.mostRecent().args[2].split('?');
      expect(query).toContain('query=a%26b%2Bc%20d');
    });

    it('should URL encode param keys', () => {
      const location: MockPlatformLocation = injector.get(PlatformLocation);
      const service: LocationService = injector.get(LocationService);

      const params = { 'a&b+c d': 'value' };
      service.setSearch('', params);
      const [, query] = location.replaceState.calls.mostRecent().args[2].split('?');
      expect(query).toContain('a%26b%2Bc%20d=value');
    });
  });

  describe('handleAnchorClick', () => {
    let service: LocationService, anchor: HTMLAnchorElement;
    beforeEach(() => {
      service = injector.get(LocationService);
      anchor = document.createElement('a');
    });

    describe('intercepting', () => {
      it('should intercept clicks on anchors for relative local urls', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for absolute local urls', () => {
        anchor.href = '/some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with query params', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url?query=xxx&other=yyy');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with hash fragment', () => {
        anchor.href = 'some/local/url#somefragment';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url#somefragment');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with query params and hash fragment', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy#somefragment';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url?query=xxx&other=yyy#somefragment');
        expect(result).toBe(false);
      });
    });

    describe('not intercepting', () => {
      it('should not intercept clicks on anchors for external urls', () => {
        anchor.href = 'http://other.com/some/local/url?query=xxx&other=yyy#somefragment';
        spyOn(service, 'go');
        let result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.href = 'some/local/url.pdf';
        anchor.protocol = 'ftp';
        result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should not intercept clicks on anchors if button is not zero', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 1, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should not intercept clicks on anchors if ctrl key is pressed', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, true, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should not intercept clicks on anchors if meta key is pressed', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, true);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should not intercept clicks on links with (non-_self) targets', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');

        anchor.target = '_blank';
        let result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_parent';
        result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_top';
        result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = 'other-frame';
        result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_self';
        result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('some/local/url');
        expect(result).toBe(false);
      });
    });
  });

  describe('google analytics - GaService#locationChanged', () => {

    let gaLocationChanged: jasmine.Spy;
    let location: Location;
    let service: LocationService;

    beforeEach(() => {
      const gaService = injector.get(GaService);
      gaLocationChanged = gaService.locationChanged;
      location = injector.get(Location);
      service = injector.get(LocationService);
    });

    it('should call locationChanged with initial URL', () => {
      const initialUrl = location.path().replace(/^\/+/, '');  // strip leading slashes

      expect(gaLocationChanged.calls.count()).toBe(1, 'gaService.locationChanged');
      const args = gaLocationChanged.calls.first().args;
      expect(args[0]).toBe(initialUrl);
    });

    it('should call locationChanged when `go` to a page', () => {
      service.go('some-new-url');
      expect(gaLocationChanged.calls.count()).toBe(2, 'gaService.locationChanged');
      const args = gaLocationChanged.calls.argsFor(1);
      expect(args[0]).toBe('some-new-url');
    });

    it('should call locationChanged when window history changes', () => {
      const locationStrategy: MockLocationStrategy = injector.get(LocationStrategy);
      locationStrategy.simulatePopState('/next-url');

      expect(gaLocationChanged.calls.count()).toBe(2, 'gaService.locationChanged');
      const args = gaLocationChanged.calls.argsFor(1);
      expect(args[0]).toBe('next-url');
    });

  });

});

/// Test Helpers ///
class MockPlatformLocation {
  pathname = 'a/b/c';
  replaceState = jasmine.createSpy('PlatformLocation.replaceState');
}

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}
