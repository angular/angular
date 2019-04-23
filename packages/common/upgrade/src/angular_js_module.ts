/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {downgradeInjectable} from '@angular/upgrade/static';
import {LocationUpgradeProvider} from './$location';

/**
 * Name of AngularJS module under which $location upgrade services are exported.
 *
 * @publicApi
 */
export const LOCATION_UPGRADE_MODULE = 'LOCATION_UPGRADE_MODULE';

/**
 * Downgraded $location provider. API should match AngularJS $location and should be a drop-in
 * replacement.
 *
 * @publicApi
 */
export const $locationProvider = downgradeInjectable(LocationUpgradeProvider);
