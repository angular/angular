/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_BASE_HREF,
  CommonModule,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PlatformLocation,
} from '../../index';
import {MockLocationStrategy, MockPlatformLocation} from '../../testing';
import {TestBed} from '@angular/core/testing';

const baseUrl = '/base';

describe('Location Class', () => {
  describe('stripTrailingSlash', () => {
    it('should strip single character slash', () => {
      const input = '/';
      expect(Location.stripTrailingSlash(input)).toBe('');
    });

    it('should normalize strip a trailing slash', () => {
      const input = baseUrl + '/';
      expect(Location.stripTrailingSlash(input)).toBe(baseUrl);
    });

    it('should ignore query params when stripping a slash', () => {
      const input = baseUrl + '/?param=1';
      expect(Location.stripTrailingSlash(input)).toBe(baseUrl + '?param=1');
    });

    it('should not remove slashes inside query params', () => {
      const input = baseUrl + '?test/?=3';
      expect(Location.stripTrailingSlash(input)).toBe(input);
    });

    it('should not remove slashes after a pound sign', () => {
      const input = baseUrl + '#test/?=3';
      expect(Location.stripTrailingSlash(input)).toBe(input);
    });
  });

  describe('location.getState()', () => {
    let location: Location;

    beforeEach(() => {
      TestBed.configureTestingModule({
        teardown: {destroyAfterEach: true},
        imports: [CommonModule],
        providers: [
          {provide: LocationStrategy, useClass: PathLocationStrategy},
          {
            provide: PlatformLocation,
            useFactory: () => {
              return new MockPlatformLocation();
            },
          },
          {provide: Location, useClass: Location, deps: [LocationStrategy]},
        ],
      });

      location = TestBed.inject(Location);
    });

    it('should get the state object', () => {
      expect(location.getState()).toBe(null);

      location.go('/test', '', {foo: 'bar'});

      expect(location.getState()).toEqual({foo: 'bar'});
    });

    it('should work after using back button', () => {
      expect(location.getState()).toBe(null);

      location.go('/test1', '', {url: 'test1'});
      location.go('/test2', '', {url: 'test2'});

      expect(location.getState()).toEqual({url: 'test2'});

      location.back();

      expect(location.getState()).toEqual({url: 'test1'});
    });

    it('should work after using forward button', () => {
      expect(location.getState()).toBe(null);

      location.go('/test1', '', {url: 'test1'});
      location.go('/test2', '', {url: 'test2'});
      expect(location.getState()).toEqual({url: 'test2'});

      location.back();
      expect(location.getState()).toEqual({url: 'test1'});

      location.forward();
      expect(location.getState()).toEqual({url: 'test2'});
    });

    it('should work after using location.historyGo()', () => {
      expect(location.getState()).toBe(null);

      location.go('/test1', '', {url: 'test1'});
      location.go('/test2', '', {url: 'test2'});
      location.go('/test3', '', {url: 'test3'});
      expect(location.getState()).toEqual({url: 'test3'});

      location.historyGo(-2);
      expect(location.getState()).toEqual({url: 'test1'});

      location.historyGo(2);
      expect(location.getState()).toEqual({url: 'test3'});

      location.go('/test3', '', {url: 'test4'});
      location.historyGo(0);
      expect(location.getState()).toEqual({url: 'test4'});

      location.historyGo();
      expect(location.getState()).toEqual({url: 'test4'});

      // we are testing the behaviour of the `historyGo` method  at the moment when the value of
      // the relativePosition goes out of bounds.
      // The result should be that the locationState does not change.
      location.historyGo(100);
      expect(location.getState()).toEqual({url: 'test4'});

      location.historyGo(-100);
      expect(location.getState()).toEqual({url: 'test4'});

      location.back();
      expect(location.getState()).toEqual({url: 'test3'});
    });
  });

  describe('location.onUrlChange()', () => {
    let location: Location;
    let locationStrategy: MockLocationStrategy;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule],
        providers: [
          {provide: LocationStrategy, useClass: MockLocationStrategy},
          {
            provide: PlatformLocation,
            useFactory: () => {
              return new MockPlatformLocation();
            },
          },
          {provide: Location, useClass: Location, deps: [LocationStrategy]},
        ],
      });

      location = TestBed.inject(Location);
      locationStrategy = TestBed.inject(LocationStrategy) as MockLocationStrategy;
    });

    it('should have onUrlChange method', () => {
      expect(typeof location.onUrlChange).toBe('function');
    });

    it('should add registered functions to urlChangeListeners', () => {
      function changeListener(url: string, state: unknown) {
        return undefined;
      }

      expect((location as any)._urlChangeListeners.length).toBe(0);

      location.onUrlChange(changeListener);

      expect((location as any)._urlChangeListeners.length).toBe(1);
      expect((location as any)._urlChangeListeners[0]).toEqual(changeListener);
    });

    it('should unregister a URL change listener and unsubscribe from URL changes when the root view is removed', () => {
      const changeListener = jasmine.createSpy('changeListener');

      const removeUrlChangeFn = location.onUrlChange(changeListener);
      location.go('x');
      expect(changeListener).toHaveBeenCalledTimes(1);

      removeUrlChangeFn();
      expect(changeListener).toHaveBeenCalledTimes(1);

      location.onUrlChange((url: string, state: unknown) => {});
      TestBed.resetTestingModule();
      // Let's ensure that URL change listeners are unregistered when the root view is removed,
      // tho the last returned `onUrlChange` function hasn't been invoked.
      expect((location as any)._urlChangeListeners.length).toEqual(0);
      expect((location as any)._urlChangeSubscription.closed).toEqual(true);
    });

    it('should only notify listeners once when multiple listeners are registered', () => {
      let notificationCount = 0;

      function incrementChangeListener(url: string, state: unknown) {
        notificationCount += 1;

        return undefined;
      }

      function noopChangeListener(url: string, state: unknown) {
        return undefined;
      }

      location.onUrlChange(incrementChangeListener);
      location.onUrlChange(noopChangeListener);

      expect(notificationCount).toBe(0);

      locationStrategy.simulatePopState('/test');

      expect(notificationCount).toBe(1);
    });
  });

  describe('location.normalize(url) should return only route', () => {
    const basePath = '/en';
    const route = '/go/to/there';
    const url = basePath + route;
    const getBaseHref = (origin: string) => origin + basePath + '/';

    it('in case APP_BASE_HREF starts with http:', () => {
      const origin = 'http://example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with https:', () => {
      const origin = 'https://example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with no protocol', () => {
      const origin = '//example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with no origin', () => {
      const origin = '';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(url)).toBe(route);
    });
  });

  describe('location.normalize(url) should return properly normalized url', () => {
    it('in case url starts with the substring equals APP_BASE_HREF', () => {
      const baseHref = '/en';
      const path = '/enigma';
      const queryParams = '?param1=123';
      const matrixParams = ';param1=123';
      const fragment = '#anchor1';

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(path)).toBe(path);
      expect(location.normalize(baseHref)).toBe('');
      expect(location.normalize(baseHref + path)).toBe(path);
      expect(location.normalize(baseHref + queryParams)).toBe(queryParams);
      expect(location.normalize(baseHref + matrixParams)).toBe(matrixParams);
      expect(location.normalize(baseHref + fragment)).toBe(fragment);
    });

    it('in case APP_BASE_HREF contains characters that have special meaning in a regex', () => {
      const baseHref = 'c:/users/name(test)/en';
      const path = '/test-path';

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const location = TestBed.inject(Location);

      expect(location.normalize(path)).toBe(path);
      expect(location.normalize(baseHref)).toBe('');
      expect(location.normalize(baseHref + path)).toBe(path);
    });
  });
});
