/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {provideRouter} from '../src';
import {withPlatformNavigation} from '../src/provide_router';
import {PlatformLocation, Location, PlatformNavigation} from '@angular/common';
import {
  ɵFakeNavigation as FakeNavigation,
  ɵFakeNavigationPlatformLocation as FakeNavigationPlatformLocation,
  provideLocationMocks,
} from '@angular/common/testing';

/// <reference types="dom-navigation" />

describe('withPlatformNavigation feature', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideRouter([], withPlatformNavigation())]});
  });

  it('provides FakeNavigation by default', () => {
    expect(TestBed.inject(PlatformNavigation)).toBeInstanceOf(FakeNavigation);
  });

  it('provides FakeNavigationPlatformLocation by default', () => {
    expect(TestBed.inject(PlatformLocation)).toBeInstanceOf(FakeNavigationPlatformLocation);
  });

  describe('ensures location information is synced with navigation', () => {
    let location: Location;
    let navigation: PlatformNavigation;
    beforeEach(() => {
      location = TestBed.inject(Location);
      navigation = TestBed.inject(PlatformNavigation);
    });

    it('state changes via location are reflected in navigation', () => {
      location.go('/a', undefined, {someState: 'someValue'});
      expect(navigation.currentEntry!.getState()).toEqual(
        jasmine.objectContaining({someState: 'someValue'}),
      );
    });

    it('state changes via navigation are reflected in location', () => {
      navigation.navigate('/b', {state: {otherState: 'otherValue'}});
      expect(location.getState()).toEqual(jasmine.objectContaining({otherState: 'otherValue'}));
    });

    it('onurlchange tracks changes from navigation API', async () => {
      let changed = false;
      location.onUrlChange(() => {
        changed = true;
      });

      navigation.navigate('/c');
      expect(changed).toBeTrue();
    });

    it('onurlchange is not synchronous if navigation commit is delayed', async () => {
      let changed = false;
      location.onUrlChange(() => {
        changed = true;
      });

      navigation.addEventListener('navigate', (e: any) => {
        e.intercept({
          precommitHandler: () => new Promise((resolve) => setTimeout(resolve)),
        });
      });

      location.go('/c');
      expect(changed).toBeFalse();
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(changed).toBeTrue();
    });
  });
});

it('something', async () => {
  TestBed.configureTestingModule({
    providers: [provideRouter([], withPlatformNavigation()), provideLocationMocks()],
  });
  expect(() => TestBed.inject(Location)).toThrowError(/SpyLocation/);
});
