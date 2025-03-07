/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FetchBackend} from './fetch';

/**
 * A constant defining the default the default Http Backend.
 * Extracted to a separate file to facilitate G3 patches.
 */
export const NG_DEFAULT_HTTP_BACKEND = FetchBackend;
