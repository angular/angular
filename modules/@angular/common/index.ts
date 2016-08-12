/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {COMMON_DIRECTIVES} from './src/common_directives';
import {COMMON_PIPES} from './src/pipes';

export * from './src/pipes';
export * from './src/directives';
export * from './src/common_directives';
export * from './src/location';
export {NgLocalization, NgLocaleLocalization, Plural, getPluralCase} from './src/localization';

// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * The module that includes all the basic Angular directives like {@link NgIf}, ${link NgFor}, ...
 *
 * @experimental
 */
@NgModule(
    {declarations: [COMMON_DIRECTIVES, COMMON_PIPES], exports: [COMMON_DIRECTIVES, COMMON_PIPES]})
export class CommonModule {
}
