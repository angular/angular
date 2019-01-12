
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findFlatIndexEntryPoint} from '../src/logic';

describe('entry_point logic', () => {

  describe('findFlatIndexEntryPoint', () => {

    it('should use the only source file if only a single one is specified',
       () => { expect(findFlatIndexEntryPoint(['/src/index.ts'])).toBe('/src/index.ts'); });

    it('should use the shortest source file ending with "index.ts" for multiple files', () => {
      expect(findFlatIndexEntryPoint([
        '/src/deep/index.ts', '/src/index.ts', '/index.ts'
      ])).toBe('/index.ts');
    });

    it('should normalize the path separators for the found entry point',
       () => { expect(findFlatIndexEntryPoint(['\\src\\index.ts'])).toBe('/src/index.ts'); });
  });
});
