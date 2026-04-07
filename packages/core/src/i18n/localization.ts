/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getLocalePluralCase} from './locale_data_api';

const pluralMapping = ['zero', 'one', 'two', 'few', 'many'];

/**
 * Returns the plural case based on the locale
 */
export function getPluralCase(value: string, locale: string): string {
  const plural = getLocalePluralCase(locale)(parseInt(value, 10));
  const result = pluralMapping[plural];
  return result !== undefined ? result : 'other';
}

/**
 * The locale id that the application is using by default (for translations and ICU expressions).
 */
export const DEFAULT_LOCALE_ID = 'en-US';

/**
 * USD currency code that the application uses by default for CurrencyPipe when no
 * DEFAULT_CURRENCY_CODE is provided.
 */
export const USD_CURRENCY_CODE = 'USD';
