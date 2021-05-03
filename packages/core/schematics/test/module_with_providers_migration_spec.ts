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

describe('ModuleWithProviders migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      }
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
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

  it('should add generic type for function return', async () => {
    writeFile('/index.ts', `
        import {NgModule, ModuleWithProviders} from '@angular/core';

        @NgModule({})
        export class BaseModule {}

        export function getProvider() {
          return {ngModule: BaseModule}
        }

        @NgModule({})
        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return getProvider();
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should add generic type for function return; external file', async () => {
    writeFile('/module.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BaseModule {}
      `);
    writeFile('/index.ts', `
        import {NgModule, ModuleWithProviders} from '@angular/core';
        import {BaseModule} from './module';

        export function getProvider() {
          return {ngModule: BaseModule}
        }

        @NgModule({})
        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return getProvider();
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should add generic type for function return without explicit type', async () => {
    writeFile('/index.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BaseModule {}

        export function getProvider() {
          return {ngModule: BaseModule}
        }

        @NgModule({})
        export class TestModule {
          static forRoot() {
            return getProvider();
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should add generic type for const variable', async () => {
    writeFile('/index.ts', `
        import {ModuleWithProviders, NgModule} from '@angular/core';

        @NgModule({})
        export class BaseModule {}

        export const myModuleWithProviders = {ngModule: BaseModule};

        @NgModule({})
        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return myModuleWithProviders;
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should add generic type for const variable without explicit type', async () => {
    writeFile('/index.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BaseModule {}

        export const myModuleWithProviders = {ngModule: BaseModule};

        @NgModule({})
        export class TestModule {
          static forRoot() {
            return myModuleWithProviders;
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should not add generic type for const variable with invalid base object', async () => {
    writeFile('/index.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class BaseModule {}

        export const myModuleWithProviders = {ngModule: BaseModule, otherKey: 'a'};

        @NgModule({})
        export class TestModule {
          static forRoot() {
            return myModuleWithProviders;
          }
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).not.toContain(`ModuleWithProviders<BaseModule>`);
  });

  it('should add generic type for const variables and functions with incomplete type', async () => {
    writeFile('/index.ts', `
      import {ModuleWithProviders, NgModule} from '@angular/core';

      @NgModule({})
      export class BaseModule {}

      export const myModuleWithProviders: ModuleWithProviders = {ngModule: BaseModule};

      export function mwpFunction(): ModuleWithProviders {
        return myModuleWithProviders;
      }

      export class MwpClass {
        mwp: ModuleWithProviders = myModuleWithProviders;
        private _mwp: ModuleWithProviders = myModuleWithProviders;

        getMwp(): ModuleWithProviders {
          return myModuleWithProviders;
        }

        static initMwp(): ModuleWithProviders {
          return myModuleWithProviders;
        }
      }
    `);

    await runMigration();
    // Note the explicit space at the end here
    expect(tree.readContent('/index.ts')).not.toContain(`ModuleWithProviders `);
  });

  it('should not add generic type for const variables without initialization', async () => {
    writeFile('/index.ts', `
      import {ModuleWithProviders} from '@angular/core';

      export const myModuleWithProviders: ModuleWithProviders;
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`TODO`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v10-module-with-providers', {}, tree).toPromise();
  }
});
