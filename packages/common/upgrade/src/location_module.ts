/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {LocationUpgradeService} from './location';

/**
 * Module used for configuring Angular's LocationUpgradeService.
 */
@NgModule({providers: [LocationUpgradeService]})
export class LocationUpgradeModule {
}
