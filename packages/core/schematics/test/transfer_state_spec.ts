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
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('TransferState migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-transfer-state', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));

    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

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

  it('should change imports', async () => {
    writeFile('/index.ts', `import { TransferState } from '@angular/platform-browser';`);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { TransferState } from '@angular/core'`);
  });

  it('should change imports', async () => {
    writeFile(
        '/index.ts',
        `import { TransferState, StateKey, makeStateKey } from '@angular/platform-browser';`);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`@angular/platform-browser`);
    expect(content).toContain(
        `import { makeStateKey, StateKey, TransferState } from '@angular/core'`);
  });

  it('should change imports with existing core import', async () => {
    writeFile('/index.ts', `
    import { TransferState, StateKey, makeStateKey } from '@angular/platform-browser';
    import { NgOnInit } from '@angular/core';
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `import { NgOnInit, makeStateKey, StateKey, TransferState } from '@angular/core'`);
  });

  it('should change imports but keep others ', async () => {
    writeFile(
        '/index.ts',
        `import { TransferState, StateKey, makeStateKey, bootstrapApplication } from '@angular/platform-browser';`);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `import { makeStateKey, StateKey, TransferState } from '@angular/core'`);
    expect(content).toContain(`import { bootstrapApplication } from '@angular/platform-browser'`);
  });

  it('should not change imports', async () => {
    writeFile('/index.ts', `
       import { TransferState } from '@not-angular/platform-browser'
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { TransferState } from '@not-angular/platform-browser'`);
  });
});
