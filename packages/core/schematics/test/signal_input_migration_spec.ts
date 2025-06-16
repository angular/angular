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

describe('signal input migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {bestEffortMode?: boolean}) {
    return runner.runSchematic('signal-input-migration', options, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

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
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should work', async () => {
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
      }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('readonly name = input.required<string>()');
  });

  it('should work when extending tsconfig from node_modules', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
      }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('readonly name = input.required<string>()');
  });

  it('should report correct statistics', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
        @Input({required: true}) lastName = '';

        someFn() {
          this.lastName = 'other name';
        }
      }`,
    );

    const messages: string[] = [];
    runner.logger.subscribe((m) => messages.push(m.message));

    await runMigration();

    expect(messages).toContain(`  -> Migrated 1/2 inputs.`);
  });

  it('should report correct statistics with best effort mode', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
        @Input({required: true}) lastName = '';

        someFn() {
          this.lastName = 'other name';
        }
      }`,
    );

    const messages: string[] = [];
    runner.logger.subscribe((m) => messages.push(m.message));

    await runMigration({bestEffortMode: true});

    expect(messages).toContain(`  -> Migrated 2/2 inputs.`);
  });
});
