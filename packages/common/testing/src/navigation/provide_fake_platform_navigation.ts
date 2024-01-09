/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';

// @ng_package: ignore-cross-repo-import
import {PlatformNavigation} from '../../../src/navigation/platform_navigation';

import {FakeNavigation} from './fake_navigation';

/**
 * Return a provider for the `FakeNavigation` in place of the real Navigation API.
 *
 * @internal
 */
export function provideFakePlatformNavigation(): Provider[] {
  return [
    {
      provide: PlatformNavigation,
      useFactory: () => {
        return new FakeNavigation(window, 'https://test.com');
      }
    },
  ];
}
