/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('test-bed-get migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('test-bed-get', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    tmpDirPath = getSystemPath(host.root);

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    writeFile(
      '/node_modules/@angular/core/testing/index.d.ts',
      `
      export declare class TestBed {
        static get(token: any): any;
      }
    `,
    );

    shx.cd(tmpDirPath);
  });

  it('should migrate a usage of TestBed.get', async () => {
    writeFile(
      '/test.ts',
      `
        import { TestBed } from '@angular/core/testing';

        const SOME_TOKEN = {};

        describe('test', () => {
          it('should inject', () => {
            console.log(TestBed.get(SOME_TOKEN, null));
          });
        });
      `,
    );

    await runMigration();
    expect(tree.readContent('/test.ts')).toContain(
      'console.log(TestBed.inject(SOME_TOKEN, null));',
    );
  });

  it('should migrate a usage of an aliased TestBed.get', async () => {
    writeFile(
      '/test.ts',
      `
        import { TestBed as Alias } from '@angular/core/testing';

        const SOME_TOKEN = {};

        describe('test', () => {
          it('should inject', () => {
            console.log(Alias.get(SOME_TOKEN, null));
          });
        });
      `,
    );

    await runMigration();
    expect(tree.readContent('/test.ts')).toContain('console.log(Alias.inject(SOME_TOKEN, null));');
  });

  it('should migrate a usage of TestBed.get that is not in a call', async () => {
    writeFile(
      '/test.ts',
      `
        import { TestBed } from '@angular/core/testing';

        export const GET = TestBed.get;
      `,
    );

    await runMigration();
    expect(tree.readContent('/test.ts')).toContain('export const GET = TestBed.inject;');
  });

  it('should handle a file that is present in multiple projects', async () => {
    writeFile('/tsconfig-2.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          a: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}},
          b: {root: '', architect: {build: {options: {tsConfig: './tsconfig-2.json'}}}},
        },
      }),
    );

    writeFile(
      'test.ts',
      `
        import { TestBed } from '@angular/core/testing';

        const SOME_TOKEN = {};

        describe('test', () => {
          it('should inject', () => {
            console.log(TestBed.get(SOME_TOKEN));
          });
        });
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain('console.log(TestBed.inject(SOME_TOKEN));');
  });
});
