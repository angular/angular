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

describe('PathMatch type migration', () => {
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
        strictNullChecks: true,
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/router/index.d.ts', `
      export declare interface Route {
      }
      export declare interface Routes {
      }
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

  it('should migrate Route literal', async () => {
    writeFile('/index.ts', `
      const route = {path: 'abc', pathMatch: 'full'};
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { Route } from "@angular/router";`);
    expect(content).toContain(`const route: Route = {path: 'abc', pathMatch: 'full'};`);
  });

  it('should migrate Routes literal', async () => {
    writeFile('/index.ts', `
      const routes = [{path: 'abc', pathMatch: 'full'}];
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { Routes } from "@angular/router";`);
    expect(content).toContain(`const routes: Routes = [{path: 'abc', pathMatch: 'full'}];`);
  });

  it('should migrate Routes with children', async () => {
    writeFile('/index.ts', `
      const routes = [{path: 'home', children: [{path: 'abc', pathMatch: 'full'}]}];
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `const routes: Routes = [{path: 'home', children: [{path: 'abc', pathMatch: 'full'}]}];`);
  });

  it('should NOT migrate Route if it already has an explicit type', async () => {
    writeFile('/index.ts', `
      export interface OtherType {}
      const routes: OtherType = {path: 'abc', pathMatch: 'full'};
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`const routes: OtherType = {path: 'abc', pathMatch: 'full'};`);
  });

  it('should NOT migrate Routes if it already has an explicit type', async () => {
    writeFile('/index.ts', `
      export interface OtherType {}
      const routes: OtherType = [{path: 'abc', pathMatch: 'full'}];
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`const routes: OtherType = [{path: 'abc', pathMatch: 'full'}];`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v14-path-match-type', {}, tree).toPromise();
  }
});
