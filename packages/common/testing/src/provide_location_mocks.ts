/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, LocationStrategy} from '../../index';
import {Provider} from '@angular/core';

import {SpyLocation} from './location_mock';
import {MockLocationStrategy} from './mock_location_strategy';

/**
 * Returns mock providers for the `Location` and `LocationStrategy` classes.
 * The mocks are helpful in tests to fire simulated location events.
 *
 * @publicApi
 */
export function provideLocationMocks(): Provider[] {
  return [
    {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
  ];
}
