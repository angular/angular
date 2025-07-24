/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  initMockFileSystem,
  MockFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {OutputMigration} from './output_migration';

describe('google3 target detection', () => {
  let fs: MockFileSystem;

  beforeEach(() => {
    fs = initMockFileSystem('Native');
    fs.ensureDir(absoluteFrom('/'));
  });

  describe('3P', () => {
    it('should create Angular programs by default', async () => {
      const tsconfigPath = absoluteFrom('/tsconfig.json');
      fs.writeFile(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {},
        }),
      );

      const migration = new OutputMigration();
      const baseInfo = migration.createProgram(tsconfigPath, fs);

      expect(baseInfo.ngCompiler).toBeTruthy();
    });
  });

  describe('1P', () => {
    beforeEach(() => {
      process.env['GOOGLE3_TSURGE'] = '1';
    });
    afterEach(() => {
      process.env['GOOGLE3_TSURGE'] = undefined;
    });

    it('should create plain TS programs if there are no Angular options', async () => {
      const tsconfigPath = absoluteFrom('/tsconfig.json');
      fs.writeFile(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {},
        }),
      );

      const migration = new OutputMigration();
      const baseInfo = migration.createProgram(tsconfigPath, fs);
      expect(baseInfo.ngCompiler).toBeFalsy();
    });

    it('should create an Angular program if there is a known Angular option', async () => {
      const tsconfigPath = absoluteFrom('/tsconfig.json');
      fs.writeFile(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {},
          angularCompilerOptions: {
            _useHostForImportGeneration: true,
          },
        }),
      );

      const migration = new OutputMigration();
      const baseInfo = migration.createProgram(tsconfigPath, fs);
      expect(baseInfo.ngCompiler).toBeTruthy();
    });
  });
});
