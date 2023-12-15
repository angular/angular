/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common/public_api';
import {Provider} from '@angular/core';

// @ng_package: ignore-cross-repo-import
import {PlatformNavigation} from '../../../src/navigation/platform_navigation';

import {FakeNavigation} from './fake_navigation';
import {FakePlatformLocation} from './fake_platform_location';

/**
 * Return a provider for classes that interface with platform navigation: `PlatformNavigation`,
 * `PlatformLocation`.
 */
export function provideFakeNavigation(): Provider[] {
  return [
    {
      provide: PlatformNavigation,
      useFactory: () => {
        return new FakeNavigation(window, 'https://test.com');
      },
    },
    {
      provide: PlatformLocation,
      useClass: FakePlatformLocation,
    },
  ];
}
