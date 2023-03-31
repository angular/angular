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

describe('QueryList.changes migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v16-querylist-changes', {}, tree);
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
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare class QueryList<T> { }`);

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

  it('should add an Observable<any> type assertion', async () => {
    writeFile('/index.ts', `
        import { QueryList } from '@angular/core';

        new QueryList<number>().changes.subscribe();
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`(new QueryList<number>().changes as Observable<any>).subscribe()`);
  });

  it('should add an Observable<any> type assertion', async () => {
    writeFile('/index.ts', `
        import { QueryList } from '@angular/core';

        const queryList = new QueryList<number>();
        queryList.changes.subscribe();
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`(queryList.changes as Observable<any>).subscribe()`);
  });

  it('should add an Observable<any> type assertion', async () => {
    writeFile('/index.ts', `
        import { QueryList } from '@angular/core';


        class Foo {
          queryList = new QueryList<number>();
        }


        class Bar {
          foo = new Foo();

          someMethod() {
            this.foo.queryList.changes.subscribe();
          }
        }
        `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`(this.foo.queryList.changes as Observable<any>).subscribe()`);
  });

  it('should replace invalid assertion', async () => {
    writeFile('/index.ts', `
        import { QueryList } from '@angular/core';

        (new QueryList<number>().changes as Observable<number[]>).subscribe()
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `((new QueryList<number>().changes as Observable<any>) as Observable<number[]>).subscribe()`);
  });
});
