import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy, PlatformLocation } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Subject } from 'rxjs';

import { GaService } from 'app/shared/ga.service';
import { SwUpdatesService } from 'app/sw-updates/sw-updates.service';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let injector: ReflectiveInjector;
  let location: MockLocationStrategy;
  let service: LocationService;
  let swUpdates: MockSwUpdatesService;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        LocationService,
        Location,
        { provide: GaService, useClass: TestGaService },
        { provide: LocationStrategy, useClass: MockLocationStrategy },
        { provide: PlatformLocation, useClass: MockPlatformLocation },
        { provide: SwUpdatesService, useClass: MockSwUpdatesService }
    ]);

    location  = injector.get(LocationStrategy);
    service  = injector.get(LocationService);
    swUpdates  = injector.get(SwUpdatesService);
  });

  describe('currentUrl', () => {
    it('should emit the latest url at the time it is subscribed to', () => {

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      let initialUrl: string|undefined;
      service.currentUrl.subscribe(url => initialUrl = url);
      expect(initialUrl).toEqual('next-url3');
    });

    it('should emit all location changes after it has been subscribed to', () => {
      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      const urls: string[] = [];
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

      const urls1: string[] = [];
      service.currentUrl.subscribe(url => urls1.push(url));

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');

      const urls2: string[] = [];
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
      let path: string|undefined;

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

      let initialPath: string|undefined;
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
      const urls: string[] = [];
      service.go('some-initial-url');

      service.currentUrl.subscribe(url => urls.push(url));
      service.go('some-new-url');
      expect(urls).toEqual([
        'some-initial-url',
        'some-new-url'
      ]);
    });

    it('should strip leading and trailing slashes', () => {
      let url: string|undefined;

      service.currentUrl.subscribe(u => url = u);
      service.go('/some/url/');

      expect(location.internalPath).toEqual('some/url');
      expect(location.path(true)).toEqual('some/url');
      expect(url).toBe('some/url');
    });

    it('should ignore empty URL string', () => {
        const initialUrl = 'some/url';
        const goExternalSpy = spyOn(service, 'goExternal');
        let url: string|undefined;

        service.go(initialUrl);
        service.currentUrl.subscribe(u => url = u);

        service.go('');
        expect(url).toEqual(initialUrl, 'should not have re-navigated locally');
        expect(goExternalSpy).not.toHaveBeenCalled();
    });

    it('should leave the site for external url that starts with "http"', () => {
      const goExternalSpy = spyOn(service, 'goExternal');
      const externalUrl = 'http://some/far/away/land';
      service.go(externalUrl);
      expect(goExternalSpy).toHaveBeenCalledWith(externalUrl);
    });

    it('should do a "full page navigation" if a ServiceWorker update has been activated', () => {
      const goExternalSpy = spyOn(service, 'goExternal');

      // Internal URL - No ServiceWorker update
      service.go('some-internal-url');
      expect(goExternalSpy).not.toHaveBeenCalled();
      expect(location.path(true)).toEqual('some-internal-url');

      // Internal URL - ServiceWorker update
      swUpdates.updateActivated.next('foo');
      service.go('other-internal-url');
      expect(goExternalSpy).toHaveBeenCalledWith('other-internal-url');
      expect(location.path(true)).toEqual('some-internal-url');
    });

    it('should not update currentUrl for external url that starts with "http"', () => {
      let localUrl: string|undefined;
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
      spyOn(service, 'go');
    });

    describe('should try to navigate with go() when anchor clicked for', () => {
      it('relative local url', () => {
        anchor.href = 'some/local/url';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });

      it('absolute local url', () => {
        anchor.href = '/some/local/url';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });

      it('local url with query params', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url?query=xxx&other=yyy');
        expect(result).toBe(false);
      });

      it('local url with hash fragment', () => {
        anchor.href = 'some/local/url#somefragment';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url#somefragment');
        expect(result).toBe(false);
      });

      it('local url with query params and hash fragment', () => {
        anchor.href = 'some/local/url?query=xxx&other=yyy#somefragment';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url?query=xxx&other=yyy#somefragment');
        expect(result).toBe(false);
      });

      it('local url with period in a path segment but no extension', () => {
        anchor.href = 'tut.or.ial/toh-p2';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalled();
        expect(result).toBe(false);
      });
    });

    describe('should let browser handle anchor click when', () => {
      it('url is external to the site', () => {
        anchor.href = 'http://other.com/some/local/url?query=xxx&other=yyy#somefragment';
        let result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.href = 'some/local/url.pdf';
        anchor.protocol = 'ftp';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('mouse button is not zero (middle or right)', () => {
        anchor.href = 'some/local/url';
        const result = service.handleAnchorClick(anchor, 1, false, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('ctrl key is pressed', () => {
        anchor.href = 'some/local/url';
        const result = service.handleAnchorClick(anchor, 0, true, false);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('meta key is pressed', () => {
        anchor.href = 'some/local/url';
        const result = service.handleAnchorClick(anchor, 0, false, true);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('anchor has (non-_self) target', () => {
        anchor.href = 'some/local/url';
        anchor.target = '_blank';
        let result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_parent';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_top';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = 'other-frame';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);

        anchor.target = '_self';
        result = service.handleAnchorClick(anchor);
        expect(service.go).toHaveBeenCalledWith('/some/local/url');
        expect(result).toBe(false);
      });

      it('zip url', () => {
        anchor.href = 'tutorial/toh-p2.zip';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('image or media url', () => {
        anchor.href = 'cat-photo.png';
        let result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true, 'png');

        anchor.href = 'cat-photo.gif';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true, 'gif');

        anchor.href = 'cat-photo.jpg';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true, 'jpg');

        anchor.href = 'dog-bark.mp3';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true, 'mp3');

        anchor.href = 'pet-tricks.mp4';
        result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true, 'mp4');
      });

      it('url has any extension', () => {
        anchor.href = 'tutorial/toh-p2.html';
        const result = service.handleAnchorClick(anchor);
        expect(service.go).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });
  });

  describe('google analytics - GaService#locationChanged', () => {

    let gaLocationChanged: jasmine.Spy;

    beforeEach(() => {
      const gaService = injector.get(GaService);
      gaLocationChanged = gaService.locationChanged;
      // execute currentPath observable so that gaLocationChanged is called
      service.currentPath.subscribe();
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

    it('should call locationChanged with url stripped of hash or query', () => {
      // Important to keep GA service from sending tracking event when the doc hasn't changed
      // e.g., when the user navigates within the page via # fragments.
      service.go('some-new-url#one');
      service.go('some-new-url#two');
      service.go('some-new-url/?foo="true"');
      expect(gaLocationChanged.calls.count()).toBe(4, 'gaService.locationChanged called');
      const args = gaLocationChanged.calls.allArgs();
      expect(args[1]).toEqual(args[2], 'same url for hash calls');
      expect(args[1]).toEqual(args[3], 'same url for query string call');
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

class MockSwUpdatesService {
  updateActivated = new Subject<string>();
}

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}
