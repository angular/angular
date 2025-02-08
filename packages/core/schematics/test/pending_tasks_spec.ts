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
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('experimental pending tasks migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('pending-tasks', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          lib: ['es2015'],
          strictNullChecks: true,
        },
      }),
    );

    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  it('should update ExperimentalPendingTasks', async () => {
    writeFile(
      '/index.ts',
      `
          import {ExperimentalPendingTasks, Directive} from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
            x = inject(ExperimentalPendingTasks);
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain("import {PendingTasks, Directive} from '@angular/core';");
    expect(content).toContain('x = inject(PendingTasks);');
  });

  it('should update import alias', async () => {
    writeFile(
      '/index.ts',
      `
          import {ExperimentalPendingTasks as Y, Directive} from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
            x = inject(Y);
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain("import {PendingTasks as Y, Directive} from '@angular/core';");
    expect(content).toContain('x = inject(Y);');
  });
});
