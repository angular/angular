/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  absoluteFrom,
  getFileSystem,
  PathManipulation,
  runInEachFileSystem,
} from '@angular/compiler-cli';

import {getOutputPathFn} from '../../src/translate/output_path';

runInEachFileSystem(() => {
  let fs: PathManipulation;
  beforeEach(() => (fs = getFileSystem()));

  describe('getOutputPathFn()', () => {
    it('should return a function that joins the `outputPath` and the `relativePath`', () => {
      const fn = getOutputPathFn(fs, absoluteFrom('/output/path'));
      expect(fn('en', 'relative/path')).toEqual(absoluteFrom('/output/path/relative/path'));
      expect(fn('en', '../parent/path')).toEqual(absoluteFrom('/output/parent/path'));
    });

    it('should return a function that interpolates the `{{LOCALE}}` in the middle of the `outputPath`', () => {
      const fn = getOutputPathFn(fs, absoluteFrom('/output/{{LOCALE}}/path'));
      expect(fn('en', 'relative/path')).toEqual(absoluteFrom('/output/en/path/relative/path'));
      expect(fn('fr', 'relative/path')).toEqual(absoluteFrom('/output/fr/path/relative/path'));
    });

    it('should return a function that interpolates the `{{LOCALE}}` in the middle of a path segment in the `outputPath`', () => {
      const fn = getOutputPathFn(fs, absoluteFrom('/output-{{LOCALE}}-path'));
      expect(fn('en', 'relative/path')).toEqual(absoluteFrom('/output-en-path/relative/path'));
      expect(fn('fr', 'relative/path')).toEqual(absoluteFrom('/output-fr-path/relative/path'));
    });

    it('should return a function that interpolates the `{{LOCALE}}` at the end of the `outputPath`', () => {
      const fn = getOutputPathFn(fs, absoluteFrom('/output/{{LOCALE}}'));
      expect(fn('en', 'relative/path')).toEqual(absoluteFrom('/output/en/relative/path'));
      expect(fn('fr', 'relative/path')).toEqual(absoluteFrom('/output/fr/relative/path'));
    });
  });
});
