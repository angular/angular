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

import {dedent} from './helpers';

describe('Remove `moduleId` migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v16-remove-module-id', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2022'],
        strict: true,
      },
    }));

    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
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

  it('should remove `moduleId` from `@Directive`', async () => {
    writeFile('/index.ts', dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir',
        moduleId: module.id,
        standalone: true,
      })
      export class MyDir {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toEqual(dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir',
        standalone: true,
      })
      export class MyDir {}
    `);
  });

  it('should be able to remove `moduleId` from multiple classes in the same file', async () => {
    writeFile('/index.ts', dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir-a',
        moduleId: module.id,
        standalone: true,
      })
      export class MyDirA {}

      @Directive({
        selector: 'my-dir-b',
        moduleId: module.id,
        standalone: true,
      })
      export class MyDirB {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toEqual(dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir-a',
        standalone: true,
      })
      export class MyDirA {}

      @Directive({
        selector: 'my-dir-b',
        standalone: true,
      })
      export class MyDirB {}
    `);
  });

  it('should not fail if `moduleId` is last property of decorator', async () => {
    writeFile('/index.ts', dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir',
        moduleId: module.id,
      })
      export class MyDir {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toEqual(dedent`
      import {Directive} from '@angular/core';

      @Directive({
        selector: 'my-dir',
      })
      export class MyDir {}
    `);
  });
});
