/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵregisterLocaleData} from '@angular/core';

/**
 * Register global data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
 *
 * The signature registerLocaleData(data: any, extraData?: any) is deprecated since v5.1
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 *
 * @publicApi
 */
export function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void {
  return ɵregisterLocaleData(data, localeId, extraData);
}
