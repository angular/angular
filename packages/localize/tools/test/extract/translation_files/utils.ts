/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormatOptions} from '../../../src/extract/translation_files/format_options';

export function toAttributes(options: FormatOptions) {
  let result = '';
  for (const option in options) {
    result += ` ${option}="${options[option]}"`;
  }
  return result;
}
