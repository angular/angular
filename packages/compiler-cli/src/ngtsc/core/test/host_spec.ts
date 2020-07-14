/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom as _, FileSystem, getFileSystem, NgtscCompilerHost} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NgCompilerOptions} from '../api';
import {NgCompilerHost} from '../src/host';

runInEachFileSystem(() => {
  let fs!: FileSystem;
  beforeEach(() => {
    fs = getFileSystem();
    fs.ensureDir(_('/'));
  });

  describe('NgCompilerHost', () => {
    it('should add factory shims for all root files', () => {
      // This test verifies that per-file shims are guaranteed to be generated for each file in the
      // "root" input files, regardless of whether `referencedFiles`-based shimming is enabled. As
      // it turns out, setting `noResolve` in TypeScript's options disables this kind of shimming,
      // so `NgCompilerHost` needs to ensure at least the root files still get shims directly.

      // File is named index.ts to trigger flat module entrypoint logic
      // (which adds a top-level shim).
      const fileName = _('/index.ts');
      fs.writeFile(fileName, `export class Test {}`);

      const options: NgCompilerOptions = {
        // Using noResolve means that TS will not follow `referencedFiles`, which is how shims are
        // normally included in the program.
        noResolve: true,
        rootDir: _('/'),

        // Both a top-level and a per-file shim are enabled.
        flatModuleOutFile: './entry',
        generateNgFactoryShims: true,
      };
      const baseHost = new NgtscCompilerHost(fs, options);
      const host = NgCompilerHost.wrap(baseHost, [fileName], options, null);

      // A shim file should be included for the index.ts ngfactory, but not entry.ts since that
      // itself is a shim.
      expect(host.inputFiles).toContain(_('/index.ngfactory.ts'));
      expect(host.inputFiles).not.toContain(_('/entry.ngfactory.ts'));
    });
  });
});
