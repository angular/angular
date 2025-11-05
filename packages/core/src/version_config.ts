/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, makeEnvironmentProviders} from './di';

/**
 * Injection token to control whether Angular version information
 * should be emitted in production builds.
 *
 * @publicApi
 */
export const NG_VERSION_EMISSION_FLAG = new InjectionToken<boolean>('NG_VERSION_EMISSION_FLAG', {
  providedIn: 'root',
  factory: () => true,
});

/**
 * Configures whether Angular should emit version information.
 * When disabled, the ng-version attribute will not be added to
 * root component elements.
 *
 * @param enabled - Whether to emit version information (default: true)
 * @publicApi
 */
export function provideVersionEmission(enabled: boolean) {
  return makeEnvironmentProviders([{provide: NG_VERSION_EMISSION_FLAG, useValue: enabled}]);
}
