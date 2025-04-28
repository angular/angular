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
} from '../mock_platform_location';

import {FakeNavigation} from './fake_navigation';

const FAKE_NAVIGATION = new InjectionToken<FakeNavigation>('fakeNavigation', {
  providedIn: 'root',
  factory: () => {
    const config = inject(MOCK_PLATFORM_LOCATION_CONFIG, {optional: true});
    const baseFallback = 'http://_empty_/';
    const startUrl = new URL(config?.startUrl || baseFallback, baseFallback);
    const fakeNavigation = new FakeNavigation(inject(DOCUMENT), startUrl.href as `http${string}`);
    fakeNavigation.setSynchronousTraversalsForTesting(true);
    return fakeNavigation;
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
