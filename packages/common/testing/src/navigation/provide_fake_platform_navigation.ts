/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, PlatformLocation} from '@angular/common';
import {inject, Provider} from '@angular/core';

// @ng_package: ignore-cross-repo-import
import {PlatformNavigation} from '../../../src/navigation/platform_navigation';
import {
  FakeNavigationPlatformLocation,
  MOCK_PLATFORM_LOCATION_CONFIG,
} from '../mock_platform_location';

import {FakeNavigation} from './fake_navigation';

/**
 * Return a provider for the `FakeNavigation` in place of the real Navigation API.
 */
export function provideFakePlatformNavigation(): Provider[] {
  return [
    {
      provide: PlatformNavigation,
      useFactory: () => {
        const config = inject(MOCK_PLATFORM_LOCATION_CONFIG, {optional: true});
        return new FakeNavigation(
          inject(DOCUMENT).defaultView!,
          (config?.startUrl as `http${string}`) ?? 'http://_empty_/',
        );
      },
    },
    {provide: PlatformLocation, useClass: FakeNavigationPlatformLocation},
  ];
}
