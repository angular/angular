/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 */
@Injectable({providedIn: 'platform', useFactory: () => window.navigation})
export abstract class PlatformNavigation extends Navigation {
}
