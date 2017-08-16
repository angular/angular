/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {COMMON_DEPRECATED_DIRECTIVES, COMMON_DIRECTIVES} from './directives/index';
import {NgLocaleLocalization, NgLocalization} from './localization';
import {COMMON_PIPES} from './pipes/index';


// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * The module that includes all the basic Angular directives like {@link NgIf}, {@link NgForOf}, ...
 *
 * @stable
 */
@NgModule({
  declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
  exports: [COMMON_DIRECTIVES, COMMON_PIPES],
  providers: [
    {provide: NgLocalization, useClass: NgLocaleLocalization},
  ],
})
export class CommonModule {
}

/**
 * I18N pipes are being changed to move away from using the JS Intl API.
 *
 * The former pipes relying on the Intl API will be moved to this module while the `CommonModule`
 * will contain the new pipes that do not rely on Intl.
 *
 * As a first step this module is created empty to ease the migration.
 *
 * see https://github.com/angular/angular/pull/18284
 *
 * @deprecated from v5
 */
@NgModule({declarations: [], exports: []})
export class DeprecatedI18NPipesModule {
}
