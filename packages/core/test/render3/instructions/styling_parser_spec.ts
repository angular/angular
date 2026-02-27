/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {consumeQuotedText} from '../../../src/render3/styling/styling_parser';
import {CharCode} from '../../../src/util/char_code';

describe('styling parser', () => {
  it('should not split surrogate pairs in malformed style diagnostics', () => {
    expect(() => consumeQuotedText('"😀', CharCode.DOUBLE_QUOTE, 1, 1)).toThrowError(
      /Malformed style at location 1 in string '"\[>>😀<<\]'.*Expecting '"'\./,
    );
  });
});
