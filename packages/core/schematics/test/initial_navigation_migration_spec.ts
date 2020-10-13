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

  it('should migrate legacy_disabled to disabled', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'legacy_disabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`{initialNavigation: 'disabled'}`);
  });

  it('should migrate false to disabled', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: false}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`{initialNavigation: 'disabled'}`);
  });

  it('should migrate legacy_enabled to enabledNonBlocking', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'legacy_enabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`{initialNavigation: 'enabledNonBlocking'}`);
  });

  it('should migrate true to enabledNonBlocking', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: true}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`{initialNavigation: 'enabledNonBlocking'}`);
  });

  it('should migrate nested objects', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'legacy_disabled', ...options}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(tree.readContent('/index.ts')).toContain(`{initialNavigation: 'disabled', ...options}`);
  });

  it('should migrate nested objects mixed validity', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'disabled', ...options}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
  });


  it('should migrate nested objects opposite order', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {...options, initialNavigation: 'legacy_disabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(tree.readContent('/index.ts')).toContain(`{...options, initialNavigation: 'disabled'}`);
  });

  it('should migrate nested objects mixed validity opposite order', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {...options, initialNavigation: 'disabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(tree.readContent('/index.ts')).toContain(`disabled`);
  });

  it('should not migrate variable not used in forRoot', async () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

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
        .toContain(`const options = {initialNavigation: 'legacy_enabled'};`);
    expect(tree.readContent('/index.ts')).toContain(`RouterModule.forRoot([])`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-router-initial-navigation-options', {}, tree)
        .toPromise();
  }
});
