/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {isWithinPackage} from '../../src/analysis/util';

runInEachFileSystem(() => {
  describe('isWithinPackage', () => {
    it('should return true if the source-file is contained in the package', () => {
      const _ = absoluteFrom;
      const file =
          ts.createSourceFile(_('/node_modules/test/src/index.js'), '', ts.ScriptTarget.ES2015);
      const packagePath = _('/node_modules/test');
      expect(isWithinPackage(packagePath, file)).toBe(true);
    });

    it('should return false if the source-file is not contained in the package', () => {
      const _ = absoluteFrom;
      const file =
          ts.createSourceFile(_('/node_modules/other/src/index.js'), '', ts.ScriptTarget.ES2015);
      const packagePath = _('/node_modules/test');
      expect(isWithinPackage(packagePath, file)).toBe(false);
    });
  });
});
