/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, PathSegment} from '@angular/compiler-cli/src/ngtsc/file_system';

import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {CleaningStrategy} from '../../../src/writing/cleaning/cleaning_strategies';
import {PackageCleaner} from '../../../src/writing/cleaning/package_cleaner';

runInEachFileSystem(() => {
  describe('PackageCleaner', () => {
    let fs: FileSystem;
    let _: typeof absoluteFrom;
    beforeEach(() => {
      fs = getFileSystem();
      _ = absoluteFrom;
    });

    describe('clean()', () => {
      it('should call `canClean()` on each cleaner for each directory and file below the given one',
         () => {
           const log: string[] = [];
           fs.ensureDir(_('/a/b/c'));
           fs.writeFile(_('/a/b/d.txt'), 'd contents');
           fs.writeFile(_('/a/b/c/e.txt'), 'e contents');
           const a = new MockCleaningStrategy(log, 'a', false);
           const b = new MockCleaningStrategy(log, 'b', false);
           const c = new MockCleaningStrategy(log, 'c', false);
           const cleaner = new PackageCleaner(fs, [a, b, c]);
           cleaner.clean(_('/a/b'));
           expect(log).toEqual([
             `a:canClean('${_('/a/b/c')}', 'c')`,
             `b:canClean('${_('/a/b/c')}', 'c')`,
             `c:canClean('${_('/a/b/c')}', 'c')`,
             `a:canClean('${_('/a/b/c/e.txt')}', 'e.txt')`,
             `b:canClean('${_('/a/b/c/e.txt')}', 'e.txt')`,
             `c:canClean('${_('/a/b/c/e.txt')}', 'e.txt')`,
             `a:canClean('${_('/a/b/d.txt')}', 'd.txt')`,
             `b:canClean('${_('/a/b/d.txt')}', 'd.txt')`,
             `c:canClean('${_('/a/b/d.txt')}', 'd.txt')`,
           ]);
         });

      it('should call `clean()` for the first cleaner that returns true for `canClean()`', () => {
        const log: string[] = [];
        fs.ensureDir(_('/a/b/c'));
        fs.writeFile(_('/a/b/d.txt'), 'd contents');
        fs.writeFile(_('/a/b/c/e.txt'), 'e contents');
        const a = new MockCleaningStrategy(log, 'a', false);
        const b = new MockCleaningStrategy(log, 'b', true);
        const c = new MockCleaningStrategy(log, 'c', false);
        const cleaner = new PackageCleaner(fs, [a, b, c]);
        cleaner.clean(_('/a/b'));
        expect(log).toEqual([
          `a:canClean('${_('/a/b/c')}', 'c')`,
          `b:canClean('${_('/a/b/c')}', 'c')`,
          `b:clean('${_('/a/b/c')}', 'c')`,
          `a:canClean('${_('/a/b/c/e.txt')}', 'e.txt')`,
          `b:canClean('${_('/a/b/c/e.txt')}', 'e.txt')`,
          `b:clean('${_('/a/b/c/e.txt')}', 'e.txt')`,
          `a:canClean('${_('/a/b/d.txt')}', 'd.txt')`,
          `b:canClean('${_('/a/b/d.txt')}', 'd.txt')`,
          `b:clean('${_('/a/b/d.txt')}', 'd.txt')`,
        ]);
      });
    });
  });
});


class MockCleaningStrategy implements CleaningStrategy {
  constructor(private log: string[], private label: string, private _canClean: boolean) {}

  canClean(path: AbsoluteFsPath, basename: PathSegment) {
    this.log.push(`${this.label}:canClean('${path}', '${basename}')`);
    return this._canClean;
  }

  clean(path: AbsoluteFsPath, basename: PathSegment): void {
    this.log.push(`${this.label}:clean('${path}', '${basename}')`);
  }
}
