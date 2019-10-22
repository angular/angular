/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {splitOnWhitespace} from '@angular/core/src/render3/util/styling_utils';

describe('styling_utils', () => {
  describe('splitOnWhitespace', () => {
    it('should treat empty strings as null', () => {
      expect(splitOnWhitespace('')).toEqual(null);
      expect(splitOnWhitespace('  ')).toEqual(null);
      expect(splitOnWhitespace(' \n\r\t ')).toEqual(null);
    });

    it('should split strings into parts', () => {
      expect(splitOnWhitespace('a\nb\rc')).toEqual(['a', 'b', 'c']);
      expect(splitOnWhitespace('\ta-long\nb-long\rc-long ')).toEqual([
        'a-long', 'b-long', 'c-long'
      ]);
    });
  });
});