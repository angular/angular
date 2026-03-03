/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {concatStringsWithSpace, stringify} from '../../src/util/stringify';

describe('stringify', () => {
  it('should return string undefined when toString returns undefined', () =>
    expect(stringify({toString: (): any => undefined})).toBe('undefined'));

  it('should return string null when toString returns null', () =>
    expect(stringify({toString: (): any => null})).toBe('null'));

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
