/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getLocalePluralCase} from './locale_data_api';

/**
 * Returns the plural case based on the locale
 */
export function getPluralCase(value: any, locale: string): string {
  const plural = getLocalePluralCase(locale)(value);

  switch (plural) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'few';
    case 4:
      return 'many';
    default:
      return 'other';
  }
}

/**
 * The locale id that the application is using by default (for translations and ICU expressions).
 */
export const DEFAULT_LOCALE_ID = 'en-US';
