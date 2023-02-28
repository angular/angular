/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * Internal token that specifies whether hydration is enabled.
 */
export const IS_HYDRATION_FEATURE_ENABLED =
    new InjectionToken<boolean>(NG_DEV_MODE ? 'IS_HYDRATION_FEATURE_ENABLED' : '');

// By default (in client rendering mode), we remove all the contents
// of the host element and render an application after that.
export const PRESERVE_HOST_CONTENT_DEFAULT = false;

/**
 * Internal token that indicates whether host element content should be
 * retained during the bootstrap.
 */
export const PRESERVE_HOST_CONTENT =
    new InjectionToken<boolean>(NG_DEV_MODE ? 'PRESERVE_HOST_CONTENT' : '', {
      providedIn: 'root',
      factory: () => PRESERVE_HOST_CONTENT_DEFAULT,
    });
