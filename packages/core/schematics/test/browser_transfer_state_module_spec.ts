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

describe('Compiler options migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v16-browser-transfer-state-module', {}, tree);
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

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare interface NgModule {}
   `);

    writeFile('/node_modules/@angular/platform-browser/index.d.ts', `
      @NgModule({})
      export class BrowserTransferStateModule {}
   `);

    writeFile('/node_modules/@not-angular/platform-browser/index.d.ts', `
   @NgModule({})
   export class BrowserTransferStateModule {}
`);

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

  it('should be able to remove BrowserTransferStateModule', async () => {
    writeFile('/index.ts', `
      import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

      @NgModule({
        imports: [
          BrowserModule, 
          BrowserTransferStateModule
        ]
      })
      export class MyModule  {}
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`BrowserTransferStateModule`);
    expect(content).toContain(`@angular/platform-browser`);
    expect(content).toContain(`BrowserModule`);
  });

  it('should be able to remove BrowserTransferStateModule', async () => {
    writeFile('/index.ts', `
      import { BrowserTransferStateModule } from '@angular/platform-browser';

      @NgModule({
        imports: [
          BrowserTransferStateModule
        ]
      })
      export class MyModule  {}
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`BrowserTransferStateModule`);
    expect(content).not.toContain(`@angular/platform-browser`);
  });

  it('should not remove non-angular BrowserTransferStateModule', async () => {
    writeFile('/index.ts', `
      import { BrowserModule, BrowserTransferStateModule } from '@not-angular/platform-browser';

      @NgModule({
        imports: [
          BrowserModule, 
          BrowserTransferStateModule
        ]
      })
      export class MyModule  {}
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`BrowserModule`);
    expect(content).toContain(`BrowserTransferStateModule`);
  });
});
