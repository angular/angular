/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {concatStringsWithSpace} from '@angular/core/src/util/stringify';

describe('stringify', () => {
  describe('concatStringsWithSpace', () => {
    it('should concat with null', () => {
      expect(concatStringsWithSpace(null, null)).toEqual('');
      expect(concatStringsWithSpace('a', null)).toEqual('a');
      expect(concatStringsWithSpace(null, 'b')).toEqual('b');
    });

    it('should concat when empty', () => {
      expect(concatStringsWithSpace('', '')).toEqual('');
      expect(concatStringsWithSpace('a', '')).toEqual('a');
      expect(concatStringsWithSpace('', 'b')).toEqual('b');
    });

    it('should concat when not empty', () => {
      expect(concatStringsWithSpace('before', 'after')).toEqual('before after');
    });
  });
});
