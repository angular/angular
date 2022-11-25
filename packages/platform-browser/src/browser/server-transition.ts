/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/**
 * An id that identifies a particular application being bootstrapped, that should
 * match across the client/server boundary.
 */
export const TRANSITION_ID = new InjectionToken('TRANSITION_ID');
