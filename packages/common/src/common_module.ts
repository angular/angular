/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {COMMON_DIRECTIVES} from './directives/index';
import {DEPRECATED_PLURAL_FN, NgLocaleLocalization, NgLocalization, getPluralCase} from './i18n/localization';
import {COMMON_DEPRECATED_I18N_PIPES} from './pipes/deprecated/index';
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
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 */
@NgModule({
  declarations: [COMMON_DEPRECATED_I18N_PIPES],
  exports: [COMMON_DEPRECATED_I18N_PIPES],
  providers: [{provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase}],
})
export class DeprecatedI18NPipesModule {
}
