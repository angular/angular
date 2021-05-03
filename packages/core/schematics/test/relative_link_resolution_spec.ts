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

describe('initial navigation migration', () => {
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

  it('should migrate forRoot with no options', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([]),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })`);
  });

  it('should migrate options without relativeLinkResolution', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([], {useHash: true}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`RouterModule.forRoot([], { useHash: true, relativeLinkResolution: 'legacy' })`);
  });

  it('should not migrate options containing relativeLinkResolution', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([], {relativeLinkResolution: 'corrected'}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`RouterModule.forRoot([], {relativeLinkResolution: 'corrected'})`);
  });

  it('should migrate when options is a variable with AsExpression', async () => {
    writeFile('/index.ts', `
        import { ExtraOptions } from '@angular/router';
        const options = {useHash: true} as ExtraOptions;
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(
            `const options = { useHash: true, relativeLinkResolution: 'legacy' } as ExtraOptions;`);
  });

  it('should migrate when options is a variable', async () => {
    writeFile('/index.ts', `
        import { ExtraOptions } from '@angular/router';
        const options: ExtraOptions = {useHash: true};
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(
            `const options: ExtraOptions = { useHash: true, relativeLinkResolution: 'legacy' };`);
  });

  it('should migrate when options is a variable with no type', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { ExtraOptions, RouterModule } from '@angular/router';

        const options = {useHash: true};

        @NgModule({
          imports: [
            RouterModule.forRoot([], options),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const options = { useHash: true, relativeLinkResolution: 'legacy' };`);
    expect(tree.readContent('/index.ts')).toContain(`RouterModule.forRoot([], options)`);
  });

  it('should migrate when aliased options is a variable', async () => {
    writeFile('/index.ts', `
        import { ExtraOptions as RouterExtraOptions } from '@angular/router';
        const options: RouterExtraOptions = {useHash: true};
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(
            `const options: RouterExtraOptions = { useHash: true, relativeLinkResolution: 'legacy' };`);
  });

  it('should migrate aliased RouterModule.forRoot', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule as AngularRouterModule} from '@angular/router';
        @NgModule({
          imports: [
            AngularRouterModule.forRoot([]),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`AngularRouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner
        .runSchematicAsync('migration-v11-router-relative-link-resolution-default', {}, tree)
        .toPromise();
  }
});
