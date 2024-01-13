/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, LOCALE_ID, ɵgetLocalePluralCase,} from '@angular/core';

/**
 * @publicApi
 */
@Injectable({
  providedIn: 'root',
  useFactory: (locale: string) => new NgLocaleLocalization(locale),
  deps: [LOCALE_ID],
})
export abstract class NgLocalization {
  abstract getPluralCategory(value: any, locale?: string): string;
}

/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(
    value: number, cases: string[], ngLocalization: NgLocalization, locale?: string): string {
  let key = `=${value}`;

  if (cases.indexOf(key) > -1) {
    return key;
  }

  key = ngLocalization.getPluralCategory(value, locale);

  if (cases.indexOf(key) > -1) {
    return key;
  }

  if (cases.indexOf('other') > -1) {
    return 'other';
  }

  throw new Error(`No plural message found for value "${value}"`);
}

/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
@Injectable()
export class NgLocaleLocalization extends NgLocalization {
  private readonly isSupported: boolean;

  constructor(@Inject(LOCALE_ID) protected locale: string) {
    super();
    this.isSupported = Intl.PluralRules.supportedLocalesOf(locale).length > 0;
  }

  override getPluralCategory(value: any, locale?: string): string {
    // Force unknown locale to return 'other'
    // calling the private ɵgetLocalePluralCase for a direct access to the plural case string.
    return this.isSupported ? ɵgetLocalePluralCase(locale || this.locale)(value) : 'other';
  }
}
