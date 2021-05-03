/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('all migrations', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  const migrationCollectionPath = require.resolve('../migrations.json');
  const allMigrationSchematics = Object.keys(require(migrationCollectionPath).schematics);

  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationCollectionPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/node_modules/@angular/core/index.d.ts', `export const MODULE: any;`);
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    writeFile('/tsconfig.json', `{}`);


    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  async function runMigration(migrationName: string) {
    await runner.runSchematicAsync(migrationName, undefined, tree).toPromise();
  }

  if (!allMigrationSchematics.length) {
    throw Error('No migration schematics found.');
  }

  allMigrationSchematics.forEach(name => {
    describe(name, () => createTests(name));
  });

  function createTests(migrationName: string) {
    // Regression test for: https://github.com/angular/angular/issues/36346.
    it('should not throw if non-existent symbols are imported with rootDirs', async () => {
      writeFile(`/tsconfig.json`, JSON.stringify({
        compilerOptions: {
          rootDirs: [
            './generated',
          ]
        }
      }));
      writeFile('/index.ts', `
      import {Renderer} from '@angular/core';

      const variableDecl: Renderer = null;

      export class Test {
        constructor(renderer: Renderer) {}
      }
    `);

      let error: any = null;
      try {
        await runMigration(migrationName);
      } catch (e) {
        error = e;
      }

      expect(error).toBe(null);
    });
  }
});
