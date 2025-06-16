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

describe('self-closing-tags migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let logs: string[];

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string}) {
    return runner.runSchematic('self-closing-tag', options, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    logs = [];

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);
    runner.logger.subscribe((log) => logs.push(log.message));
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should work', async () => {
    writeFile(
      '/app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp></my-cmp>' })
      export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts').replace(/\s+/g, ' ');
    expect(content).toContain('<my-cmp />');
    expect(logs.pop()).toBe(
      '  -> Migrated 1 components to self-closing tags in 1 component files.',
    );
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
      '/app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp></my-cmp>' })
      export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts').replace(/\s+/g, ' ');
    expect(content).toContain('<my-cmp />');
    expect(logs.pop()).toBe(
      '  -> Migrated 1 components to self-closing tags in 1 component files.',
    );
  });
});
