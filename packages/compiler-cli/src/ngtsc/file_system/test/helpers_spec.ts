/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as os from 'os';

import {absoluteFrom, relativeFrom, setFileSystem} from '../src/helpers';
import {NodeJSFileSystem} from '../src/node_js_file_system';

describe('path types', () => {
  beforeEach(() => {
    setFileSystem(new NodeJSFileSystem());
  });

  describe('absoluteFrom', () => {
    it('should not throw when creating one from an absolute path', () => {
      expect(() => absoluteFrom('/test.txt')).not.toThrow();
    });

    if (os.platform() === 'win32') {
      it('should not throw when creating one from a windows absolute path', () => {
        expect(absoluteFrom('C:\\test.txt')).toEqual('C:/test.txt');
      });
      it('should not throw when creating one from a windows absolute path with POSIX separators',
         () => {
           expect(absoluteFrom('C:/test.txt')).toEqual('C:/test.txt');
         });
      it('should support windows drive letters', () => {
        expect(absoluteFrom('D:\\foo\\test.txt')).toEqual('D:/foo/test.txt');
      });
      it('should convert Windows path separators to POSIX separators', () => {
        expect(absoluteFrom('C:\\foo\\test.txt')).toEqual('C:/foo/test.txt');
      });
    }

    it('should throw when creating one from a non-absolute path', () => {
      expect(() => absoluteFrom('test.txt')).toThrow();
    });
  });

  describe('relativeFrom', () => {
    it('should not throw when creating one from a relative path', () => {
      expect(() => relativeFrom('a/b/c.txt')).not.toThrow();
    });

    it('should throw when creating one from an absolute path', () => {
      expect(() => relativeFrom('/a/b/c.txt')).toThrow();
    });

    if (os.platform() === 'win32') {
      it('should throw when creating one from a Windows absolute path', () => {
        expect(() => relativeFrom('C:/a/b/c.txt')).toThrow();
      });
    }
  });
});
