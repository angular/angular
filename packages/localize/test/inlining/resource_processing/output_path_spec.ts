/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getOutputPathFn} from '../../../src/inlining/resource_processing/output_path';

describe('getOutputPathFn()', () => {
  it('should return a function that joins the `outputPath` and the `relativePath`', () => {
    const fn = getOutputPathFn('/output/path');
    expect(fn('en', 'relative/path')).toEqual('/output/path/relative/path');
    expect(fn('en', '../parent/path')).toEqual('/output/parent/path');
  });

  it('should return a function that interpolates the `${locale}` in the middle of the `outputPath`',
     () => {
       const fn = getOutputPathFn('/output/${locale}/path');
       expect(fn('en', 'relative/path')).toEqual('/output/en/path/relative/path');
       expect(fn('fr', 'relative/path')).toEqual('/output/fr/path/relative/path');
     });

  it('should return a function that interpolates the `${locale}` at the start of the `outputPath`',
     () => {
       const fn = getOutputPathFn('${locale}/path');
       expect(fn('en', 'relative/path')).toEqual('en/path/relative/path');
       expect(fn('fr', 'relative/path')).toEqual('fr/path/relative/path');
     });

  it('should return a function that interpolates the `${locale}` at the end of the `outputPath`',
     () => {
       const fn = getOutputPathFn('/output/${locale}');
       expect(fn('en', 'relative/path')).toEqual('/output/en/relative/path');
       expect(fn('fr', 'relative/path')).toEqual('/output/fr/relative/path');
     });
});