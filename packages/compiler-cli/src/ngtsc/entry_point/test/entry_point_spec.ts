
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {findFlatIndexEntryPoint} from '../src/logic';

runInEachFileSystem(() => {
  describe('entry_point logic', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    describe('findFlatIndexEntryPoint', () => {
      it('should use the only source file if only a single one is specified', () => {
        expect(findFlatIndexEntryPoint([_('/src/index.ts')])).toBe(_('/src/index.ts'));
      });

      it('should use the shortest source file ending with "index.ts" for multiple files', () => {
        expect(findFlatIndexEntryPoint([
          _('/src/deep/index.ts'), _('/src/index.ts'), _('/index.ts')
        ])).toBe(_('/index.ts'));
      });
    });
  });
});
