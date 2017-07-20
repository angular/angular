/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {COMMON_DIRECTIVES} from './directives/index';
import {NgLocaleLocalization, NgLocalization} from './i18n/localization';
import {COMMON_DEPRECATED_I18N_PIPES} from './pipes/deprecated/index';
import {COMMON_I18N_PIPES, COMMON_PIPES} from './pipes/index';

@NgModule(
    {declarations: [COMMON_DIRECTIVES, COMMON_PIPES], exports: [COMMON_DIRECTIVES, COMMON_PIPES]})
export class CommonBaseModule {
}

// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * The module that includes all the basic Angular directives like {@link NgIf}, {@link NgForOf}, ...
 *
 * @stable
 */
@NgModule({
  imports: [CommonBaseModule],
  declarations: [COMMON_I18N_PIPES],
  exports: [COMMON_I18N_PIPES, CommonBaseModule],
  providers: [
    {provide: NgLocalization, useClass: NgLocaleLocalization},
  ],
})
export class CommonModule {
}

// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * The module that includes all the basic Angular directives like {@link NgIf}, {@link NgForOf}, ...
 * It includes the deprecated i18n pipes that will be removed in Angular v6 in favor of the new
 * i18n pipes that don't use the intl api.
 *
 * @stable
 * @deprecated use CommonModule instead
 */
@NgModule({
  imports: [CommonBaseModule],
  declarations: [COMMON_DEPRECATED_I18N_PIPES],
  exports: [COMMON_DEPRECATED_I18N_PIPES, CommonBaseModule],
  providers: [
    {provide: NgLocalization, useClass: NgLocaleLocalization},
  ],
})
export class DeprecatedCommonModule {
}
