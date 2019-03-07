/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Plural, getLocalePluralCase} from './locale_data_api';


export function getPluralCase(value: any, locale: string): string {
  const plural = getLocalePluralCase(locale)(value);

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
