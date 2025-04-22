/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DOCUMENT,
  PlatformLocation,
  ɵPlatformNavigation as PlatformNavigation,
} from '../../../index';
import {inject, InjectionToken, Provider} from '@angular/core';

import {
  FakeNavigationPlatformLocation,
  MOCK_PLATFORM_LOCATION_CONFIG,
  WINDOW_TARGET,
} from '../mock_platform_location';

import {FakeNavigation} from './fake_navigation';

const FAKE_NAVIGATION = new InjectionToken<FakeNavigation>('fakeNavigation', {
  providedIn: 'root',
  factory: () => {
    const config = inject(MOCK_PLATFORM_LOCATION_CONFIG, {optional: true});
    const baseFallback = 'http://_empty_/';
    const startUrl = new URL(config?.startUrl || baseFallback, baseFallback);
    const document = inject(DOCUMENT);
    function createEventTarget(): EventTarget {
      try {
        // `document.createElement` because NodeJS `EventTarget` is
        // incompatible with Domino's `Event`. That is, attempting to
        // dispatch an event created by Domino's patched `Event` will
        // throw an error since it is not an instance of a real Node
        // `Event`.
        return document.createElement('div');
      } catch {
        // Fallback to a basic EventTarget if `document.createElement`
        // fails. This can happen with tests that mock the DOCUMENT value.
        return new EventTarget();
      }
    }
    // TODO(atscott): If we want to replace MockPlatformLocation with FakeNavigationPlatformLocation
    // as the default in TestBed, we will likely need to use setSynchronousTraversalsForTesting(true);
    return new FakeNavigation(
      inject(WINDOW_TARGET),
      createEventTarget,
      startUrl.href as `http${string}`,
    );
  },
});

/**
 * Return a provider for the `FakeNavigation` in place of the real Navigation API.
 */
export function provideFakePlatformNavigation(): Provider[] {
  return [
    {
      provide: PlatformNavigation,
      useFactory: () => inject(FAKE_NAVIGATION),
    },
    {provide: PlatformLocation, useClass: FakeNavigationPlatformLocation},
  ];
}
