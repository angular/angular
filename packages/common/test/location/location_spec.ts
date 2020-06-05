/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, Location, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {MockLocationStrategy, MockPlatformLocation} from '@angular/common/testing';
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
        imports: [CommonModule],
        providers: [
          {provide: LocationStrategy, useClass: PathLocationStrategy},
          {
            provide: PlatformLocation,
            useFactory: () => {
              return new MockPlatformLocation();
            }
          },
          {provide: Location, useClass: Location, deps: [LocationStrategy, PlatformLocation]},
        ]
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
            }
          },
          {provide: Location, useClass: Location, deps: [LocationStrategy, PlatformLocation]},
        ]
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
});
