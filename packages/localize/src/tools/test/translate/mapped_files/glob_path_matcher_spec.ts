/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {GlobPathMatcher} from '../../../src/translate/mapped_files/glob_path_matcher';

describe('GlobPathMatcher', () => {
  describe('matchesPath', () => {
    it('should return true for paths that match the pattern', () => {
      const matcher = new GlobPathMatcher('x/**/aaa/*.bbb');
      expect(matcher.matchesPath('x.bbb')).toBe(false);
      expect(matcher.matchesPath('x/aaa/y.bbb')).toBe(true);
      expect(matcher.matchesPath('x/yyy/zzz/aaa/1234.bbb')).toBe(true);
    });
  });
});
