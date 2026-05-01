/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di';

/**
 * Token used to the determine if the transfer cache should be used, for example for resources.
 */
export const CACHE_ACTIVE = new InjectionToken<{isActive: boolean}>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'STATE_CACHE_ACTIVE' : '',
);
