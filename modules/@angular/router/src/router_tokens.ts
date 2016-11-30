/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core';

/**
 * @whatItDoes Is used in DI to configure the router.
 *
 * @stable
 */
export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

/**
 * A token for the router initializer that will be called after the app is bootstrapped.
 *
 * @experimental
 */
export const ROUTER_INITIALIZER = new OpaqueToken('Router Initializer');
