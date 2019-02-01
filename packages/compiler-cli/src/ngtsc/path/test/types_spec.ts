/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../src/types';

describe('path types', () => {
  describe('AbsoluteFsPath', () => {
    it('should not throw when creating one from a non-absolute path',
       () => { expect(AbsoluteFsPath.from('/test.txt')).toEqual('/test.txt'); });
    it('should throw when creating one from a non-absolute path',
       () => { expect(() => AbsoluteFsPath.from('test.txt')).toThrow(); });
    it('should convert Windows path separators to POSIX separators',
       () => { expect(AbsoluteFsPath.from('\\foo\\test.txt')).toEqual('/foo/test.txt'); });
  });
});
