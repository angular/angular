/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DEFAULT_LOCALE_ID} from '../../i18n/localization';
import {assertDefined} from '../../util/assert';


/**
 * The locale id that the application is currently using (for translations and ICU expressions).
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 */
let LOCALE_ID = DEFAULT_LOCALE_ID;

/**
 * Sets the locale id that will be used for translations and ICU expressions.
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 *
 * @param localeId
 */
export function setLocaleId(localeId: string) {
  assertDefined(localeId, `Expected localeId to be defined`);
  if (typeof localeId === 'string') {
    LOCALE_ID = localeId.toLowerCase().replace(/_/g, '-');
  }
}

/**
 * Gets the locale id that will be used for translations and ICU expressions.
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 */
export function getLocaleId(): string {
  return LOCALE_ID;
}
