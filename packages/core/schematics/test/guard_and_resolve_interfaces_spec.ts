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

describe('Guard and Resolve interfaces migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v16-guard-and-resolve-interfaces', {}, tree);
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
    writeFile('/node_modules/@angular/router/index.d.ts', `
      export declare interface Resolve<T> { }
      export declare interface CanActivate { }
      export declare interface CanActivateChild { }
      export declare interface CanDeactivate<T> { }
      export declare interface CanLoad { }
      export declare interface CanMatch { }`);

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

  it('should be able to remove multiple imports and retain other symbols', async () => {
    writeFile('/index.ts', `
        import {Router, Resolve, CanActivate} from '@angular/router';
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { Router } from '@angular/router'`);
  });

  it('should be able to multiple imports from different import statements', async () => {
    writeFile('/index.ts', `
        import {Router, Resolve} from '@angular/router';
        import {CanActivate} from '@angular/router';
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { Router } from '@angular/router'`);
    expect(content).not.toContain(`CanActivate`);
    expect(content).not.toContain(`Resolve`);
  });

  it('should be able to remove implements', async () => {
    writeFile('/index.ts', `
        import {Resolve} from '@angular/router';

        class A implements X, Resolve {}
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`implements X {}`);
  });

  it('should be able to remove last implements', async () => {
    writeFile('/index.ts', `
        import {Resolve} from '@angular/router';

        class A implements Resolve {}
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`import`);
    expect(content).not.toContain(`Resolve`);
    expect(content).toMatch(/class A\s+\{\}/);
  });

  it('should be able to remove all deprecated imports and implements', async () => {
    writeFile('/index.ts', `
        import {Resolve, CanActivate, CanActivateChild, CanDeactivate, CanMatch, CanLoad} from '@angular/router';

        class A implements Resolve {}
        class B implements CanActivate, CanActivateChild {}
        class C implements CanMatch, CanLoad {}
        class D implements CanDeactivate {}
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`implements`);
    expect(content).not.toContain(`import`);
    expect(content).toMatch(/class A\s+\{\}/);
    expect(content).toMatch(/class B\s+\{\}/);
    expect(content).toMatch(/class C\s+\{\}/);
    expect(content).toMatch(/class D\s+\{\}/);
  });

  it('should migrates type references to function types', async () => {
    writeFile('/index.ts', `
        import {Resolve, CanActivate, CanActivateChild, CanDeactivate, CanMatch, CanLoad} from '@angular/router';

        function runResolver<T>(resolver: Resolve<T>): T {}
        function runCanMatch(guard: CanMatch): any {}
        function runCanActivate(guard: CanActivate): any {}
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toMatch(/import.*ResolveFn.*angular\/router/);
    expect(content).toMatch(/import.*CanMatchFn.*angular\/router/);
    expect(content).toMatch(/import.*CanActivateFn.*angular\/router/);
    expectContainsIgnoreWhitespace(content, `runResolver<T>(resolver: {resolve: ResolveFn<T>;})`);
    expectContainsIgnoreWhitespace(content, `runCanMatch(guard: {canMatch: CanMatchFn;})`);
    expectContainsIgnoreWhitespace(content, `runCanActivate(guard: {canActivate: CanActivateFn;})`);
  });

  it('should migrate type references within type references to function types', async () => {
    writeFile('/index.ts', `
        import {Resolve} from '@angular/router';

        export interface Something  {
          resolve?: {someData?: Type<Resolve<any>>}
        }
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expectContainsIgnoreWhitespace(
        content, `resolve?: {someData?: Type<{resolve: ResolveFn<any>;}>}}`);
  });

  it('should migrates type aliases', async () => {
    writeFile('/index.ts', `
        import {Resolve} from '@angular/router';

        export interface IssueDetailViewParams {
          issueId: string;
          taskId?: string;
        }
        export type IssueDetailViewResolver = Resolve<IssueDetailViewParams>;
      `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expectContainsIgnoreWhitespace(
        content, `type IssueDetailViewResolver = {resolve: ResolveFn<IssueDetailViewParams>;}`);
  });
});

function expectContainsIgnoreWhitespace(actual: string, expected: string) {
  const originalExpected = expected;
  const originalActual = actual;
  expected = expected.replace(/ |\n|\r/g, '');
  actual = actual.replace(/ |\n|\r/g, '');

  expect(actual)
      .withContext(`Expected text\n${originalActual}\nto contain\n${originalExpected}\n\n`)
      .toContain(expected);
}
