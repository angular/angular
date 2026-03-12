/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Inject, Injectable, LOCALE_ID, ɵRuntimeError as RuntimeError} from '@angular/core';

import {getLocalePluralCase, Plural} from './locale_data_api';
import {RuntimeErrorCode} from '../errors';

/**
 * @publicApi
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => new NgLocaleLocalization(inject(LOCALE_ID)),
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
  value: number,
  cases: string[],
  ngLocalization: NgLocalization,
  locale?: string,
): string {
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

  throw new RuntimeError(
    RuntimeErrorCode.NO_PLURAL_MESSAGE_FOUND,
    ngDevMode && `No plural message found for value "${value}"`,
  );
}

/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
@Injectable()
export class NgLocaleLocalization extends NgLocalization {
  constructor(@Inject(LOCALE_ID) protected locale: string) {
    super();
  }

  override getPluralCategory(value: any, locale?: string): string {
    const plural = getLocalePluralCase(locale || this.locale)(value);

    switch (plural) {
      case Plural.Zero:
        return 'zero';
      case Plural.One:
        return 'one';
      case Plural.Two:
        return 'two';
      case Plural.Few:
        return 'few';
      case Plural.Many:
        return 'many';
      default:
        return 'other';
    }
  }
}
