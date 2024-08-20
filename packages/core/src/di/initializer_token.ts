/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from './injection_token';

/**
 * A multi-provider token for initialization functions that will run upon construction of an
 * environment injector.
 *
 * Note: As opposed to the `APP_INITIALIZER` token, the `ENVIRONMENT_INITIALIZER` functions are not awaited,
 * hence they should not be `async`.
 *
 * @publicApi
 */
export const ENVIRONMENT_INITIALIZER = new InjectionToken<ReadonlyArray<() => void>>(
  ngDevMode ? 'ENVIRONMENT_INITIALIZER' : '',
);
