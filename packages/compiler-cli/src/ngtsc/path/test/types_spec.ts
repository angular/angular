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
    it('should not throw when creating one from an absolute path',
       () => { expect(() => AbsoluteFsPath.from('/test.txt')).not.toThrow(); });
    it('should not throw when creating one from a windows absolute path',
       () => { expect(AbsoluteFsPath.from('C:\\test.txt')).toEqual('C:/test.txt'); });
    it('should not throw when creating one from a windows absolute path with POSIX separators',
       () => { expect(AbsoluteFsPath.from('C:/test.txt')).toEqual('C:/test.txt'); });
    it('should throw when creating one from a non-absolute path',
       () => { expect(() => AbsoluteFsPath.from('test.txt')).toThrow(); });
    it('should support windows drive letters',
       () => { expect(AbsoluteFsPath.from('D:\\foo\\test.txt')).toEqual('D:/foo/test.txt'); });
    it('should convert Windows path separators to POSIX separators',
       () => { expect(AbsoluteFsPath.from('\\foo\\test.txt')).toEqual('/foo/test.txt'); });
  });
});
