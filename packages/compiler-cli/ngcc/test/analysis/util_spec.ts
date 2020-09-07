/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {isWithinPackage} from '../../src/analysis/util';

runInEachFileSystem(() => {
  describe('isWithinPackage', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => _ = absoluteFrom);

    it('should return true if the source-file is contained in the package', () => {
      const packagePath = _('/node_modules/test');
      const file = _('/node_modules/test/src/index.js');
      expect(isWithinPackage(packagePath, file)).toBe(true);
    });

    it('should return false if the source-file is not contained in the package', () => {
      const packagePath = _('/node_modules/test');
      const file = _('/node_modules/other/src/index.js');
      expect(isWithinPackage(packagePath, file)).toBe(false);
    });

    it('should return false if the source-file is inside the package\'s `node_modules/`', () => {
      const packagePath = _('/node_modules/test');

      // An external file inside the package's `node_modules/`.
      const file1 = _('/node_modules/test/node_modules/other/src/index.js');
      expect(isWithinPackage(packagePath, file1)).toBe(false);

      // An internal file starting with `node_modules`.
      const file2 = _('/node_modules/test/node_modules_optimizer.js');
      expect(isWithinPackage(packagePath, file2)).toBe(true);
    });
  });
});
