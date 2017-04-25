import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy, PlatformLocation } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';

import { GaService } from 'app/shared/ga.service';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let injector: ReflectiveInjector;
  let location: MockLocationStrategy;
  let service: LocationService;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        LocationService,
        Location,
        { provide: GaService, useClass: TestGaService },
        { provide: LocationStrategy, useClass: MockLocationStrategy },
        { provide: PlatformLocation, useClass: MockPlatformLocation }
    ]);

    location  = injector.get(LocationStrategy);
    service  = injector.get(LocationService);
  });

  describe('currentUrl', () => {
    it('should emit the latest url at the time it is subscribed to', () => {

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      let initialUrl;
      service.currentUrl.subscribe(url => initialUrl = url);
      expect(initialUrl).toEqual('next-url3');
    });

    it('should emit all location changes after it has been subscribed to', () => {
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

    it('should strip leading and trailing slashes', () => {
      const urls: string[] = [];

      service.currentUrl.subscribe(u => urls.push(u));

      location.simulatePopState('///some/url1///');
      location.simulatePopState('///some/url2///?foo=bar');
      location.simulatePopState('///some/url3///#baz');
      location.simulatePopState('///some/url4///?foo=bar#baz');

      expect(urls.slice(-4)).toEqual([
        'some/url1',
        'some/url2?foo=bar',
        'some/url3#baz',
        'some/url4?foo=bar#baz'
      ]);
    });
  });

  describe('currentPath', () => {
    it('should strip leading and trailing slashes off the url', () => {
      const paths: string[] = [];

      service.currentPath.subscribe(p => paths.push(p));

      location.simulatePopState('///initial/url1///');
      location.simulatePopState('///initial/url2///?foo=bar');
      location.simulatePopState('///initial/url3///#baz');
      location.simulatePopState('///initial/url4///?foo=bar#baz');

      expect(paths.slice(-4)).toEqual([
        'initial/url1',
        'initial/url2',
        'initial/url3',
        'initial/url4'
      ]);
    });

    it('should not strip other slashes off the url', () => {
      const paths: string[] = [];

      service.currentPath.subscribe(p => paths.push(p));

      location.simulatePopState('initial///url1');
      location.simulatePopState('initial///url2?foo=bar');
      location.simulatePopState('initial///url3#baz');
      location.simulatePopState('initial///url4?foo=bar#baz');

      expect(paths.slice(-4)).toEqual([
        'initial///url1',
        'initial///url2',
        'initial///url3',
        'initial///url4'
      ]);
    });

    it('should strip the query off the url', () => {
      let path: string;

      service.currentPath.subscribe(p => path = p);

      location.simulatePopState('/initial/url1?foo=bar');

      expect(path).toBe('initial/url1');
    });

    it('should strip the hash fragment off the url', () => {
      const paths: string[] = [];

      service.currentPath.subscribe(p => paths.push(p));

      location.simulatePopState('/initial/url1#foo');
      location.simulatePopState('/initial/url2?foo=bar#baz');

      expect(paths.slice(-2)).toEqual([
        'initial/url1',
        'initial/url2'
      ]);
    });

    it('should emit the latest path at the time it is subscribed to', () => {
      location.simulatePopState('/initial/url1');
      location.simulatePopState('/initial/url2');
      location.simulatePopState('/initial/url3');

      location.simulatePopState('/next/url1');
      location.simulatePopState('/next/url2');
      location.simulatePopState('/next/url3');

      let initialPath: string;
      service.currentPath.subscribe(path => initialPath = path);

      expect(initialPath).toEqual('next/url3');
    });

    it('should emit all location changes after it has been subscribed to', () => {
      location.simulatePopState('/initial/url1');
      location.simulatePopState('/initial/url2');
      location.simulatePopState('/initial/url3');

      const paths: string[] = [];
      service.currentPath.subscribe(path => paths.push(path));

      location.simulatePopState('/next/url1');
      location.simulatePopState('/next/url2');
      location.simulatePopState('/next/url3');

      expect(paths).toEqual([
        'initial/url3',
        'next/url1',
        'next/url2',
        'next/url3'
      ]);
    });

    it('should pass only the latest and later paths to each subscriber', () => {
      location.simulatePopState('/initial/url1');
      location.simulatePopState('/initial/url2');
      location.simulatePopState('/initial/url3');

      const paths1: string[] = [];
      service.currentPath.subscribe(path => paths1.push(path));

      location.simulatePopState('/next/url1');
      location.simulatePopState('/next/url2');

      const paths2: string[] = [];
      service.currentPath.subscribe(path => paths2.push(path));

      location.simulatePopState('/next/url3');

      expect(paths1).toEqual([
        'initial/url3',
        'next/url1',
        'next/url2',
        'next/url3'
      ]);

      expect(paths2).toEqual([
        'next/url2',
        'next/url3'
      ]);
    });
  });

  describe('go', () => {

    it('should update the location', () => {
      service.go('some-new-url');
      expect(location.internalPath).toEqual('some-new-url');
      expect(location.path(true)).toEqual('some-new-url');
    });

    it('should emit the new url', () => {
      const urls = [];
      service.go('some-initial-url');

      service.currentUrl.subscribe(url => urls.push(url));
      service.go('some-new-url');
      expect(urls).toEqual([
        'some-initial-url',
        'some-new-url'
      ]);
    });

    it('should strip leading and trailing slashes', () => {
      let url: string;

      service.currentUrl.subscribe(u => url = u);
      service.go('/some/url/');

      expect(location.internalPath).toEqual('some/url');
      expect(location.path(true)).toEqual('some/url');
      expect(url).toBe('some/url');
    });

    it('should ignore undefined URL string', noUrlTest(undefined));
    it('should ignore null URL string', noUrlTest(null));
    it('should ignore empty URL string', noUrlTest(''));
    function noUrlTest(testUrl: string) {
      return function() {
        const initialUrl = 'some/url';
        const goExternalSpy = spyOn(service, 'goExternal');
        let url: string;

        service.go(initialUrl);
        service.currentUrl.subscribe(u => url = u);

        service.go(testUrl);
        expect(url).toEqual(initialUrl, 'should not have re-navigated locally');
        expect(goExternalSpy.wasCalled).toBeFalsy('should not have navigated externally');
      };
    }

    it('should leave the site for external url that starts with "http"', () => {
      const goExternalSpy = spyOn(service, 'goExternal');
      const externalUrl = 'http://some/far/away/land';
      service.go(externalUrl);
      expect(goExternalSpy).toHaveBeenCalledWith(externalUrl);
    });

    it('should not update currentUrl for external url that starts with "http"', () => {
      let localUrl: string;
      spyOn(service, 'goExternal');
      service.currentUrl.subscribe(url => localUrl = url);
      service.go('https://some/far/away/land');
      expect(localUrl).toBeFalsy('should not set local url');
    });
  });

  describe('search', () => {
    it('should read the query from the current location.path', () => {
      location.simulatePopState('a/b/c?foo=bar&moo=car');
      expect(service.search()).toEqual({ foo: 'bar', moo: 'car' });
    });

    it('should cope with an empty query', () => {
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
      location.simulatePopState('a/b/c?query=a%26b%2Bc%20d');
      expect(service.search()).toEqual({ query: 'a&b+c d' });
    });

    it('should URL decode query keys', () => {
      location.simulatePopState('a/b/c?a%26b%2Bc%20d=value');
      expect(service.search()).toEqual({ 'a&b+c d': 'value' });
    });

    it('should cope with a hash on the URL', () => {
      spyOn(location, 'path').and.callThrough();
      service.search();
      expect(location.path).toHaveBeenCalledWith(false);
    });
  });

  describe('setSearch', () => {
    let platformLocation: MockPlatformLocation;

    beforeEach(() => {
      platformLocation = injector.get(PlatformLocation);
    });

    it('should call replaceState on PlatformLocation', () => {
      const params = {};
      service.setSearch('Some label', params);
      expect(platformLocation.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'Some label', 'a/b/c');
    });

    it('should convert the params to a query string', () => {
      const params = { foo: 'bar', moo: 'car' };
      service.setSearch('Some label', params);
      expect(platformLocation.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'Some label', jasmine.any(String));
      const [path, query] = platformLocation.replaceState.calls.mostRecent().args[2].split('?');
      expect(path).toEqual('a/b/c');
      expect(query).toContain('foo=bar');
      expect(query).toContain('moo=car');
    });

    it('should URL encode param values', () => {
      const params = { query: 'a&b+c d' };
      service.setSearch('', params);
      const [, query] = platformLocation.replaceState.calls.mostRecent().args[2].split('?');
      expect(query).toContain('query=a%26b%2Bc%20d');
    });

    it('should URL encode param keys', () => {
      const params = { 'a&b+c d': 'value' };
      service.setSearch('', params);
      const [, query] = platformLocation.replaceState.calls.mostRecent().args[2].split('?');
      expect(query).toContain('a%26b%2Bc%20d=value');
    });
  });

  describe('handleAnchorClick', () => {
    let anchor: HTMLAnchorElement;

    beforeEach(() => {
      anchor = document.createElement('a');
    });

    describe('intercepting', () => {
      it('should intercept clicks on anchors for relative local urls', () => {
        anchor.href = 'some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for absolute local urls', () => {
        anchor.href = '/some/local/url';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with query params', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('/some/local/url?query=xxx&other=yyy');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with hash fragment', () => {
        anchor.href = 'some/local/url#somefragment';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('/some/local/url#somefragment');
        expect(result).toBe(false);
      });

      it('should intercept clicks on anchors for local urls, with query params and hash fragment', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy#somefragment';
        spyOn(service, 'go');
        const result = service.handleAnchorClick(anchor, 0, false, false);
        expect(service.go).toHaveBeenCalledWith('/some/local/url?query=xxx&other=yyy#somefragment');
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
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });
    });
  });

  describe('google analytics - GaService#locationChanged', () => {

    let gaLocationChanged: jasmine.Spy;

    beforeEach(() => {
      const gaService = injector.get(GaService);
      gaLocationChanged = gaService.locationChanged;
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
      location.simulatePopState('/next-url');

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
