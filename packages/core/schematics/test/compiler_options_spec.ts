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

describe('Compiler options migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v17-compiler-options', {}, tree);
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
    writeFile('/node_modules/@angular/core/index.d.ts', `
    export enum ViewEncapsulation {Emulated = 0,  None = 2,  ShadowDom = 3}
    export enum MissingTranslationStrategy { Error = 0, Warning = 1, Ignore = 2}
    export type CompilerOptions = {
      defaultEncapsulation?: ViewEncapsulation,
      providers?: StaticProvider[],
      preserveWhitespaces?: boolean,
      useJit: boolean,
      missingTranslation?: MissingTranslationStrategy,
    };`);

    writeFile('/node_modules/@not-angular/core/index.d.ts', `
    export enum ViewEncapsulation {Emulated = 0,  None = 2,  ShadowDom = 3}
    export enum MissingTranslationStrategy { Error = 0, Warning = 1, Ignore = 2}
    export type CompilerOptions = {
      defaultEncapsulation?: ViewEncapsulation,
      providers?: StaticProvider[],
      preserveWhitespaces?: boolean,
      useJit: boolean,
      missingTranslation?: MissingTranslationStrategy,
    };`);

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

  it('should be able to remove useJit and missingTranslation', async () => {
    writeFile('/index.ts', `
      import {CompilerOptions, ViewEncapsulation, MissingTranslationStrategy} from '@angular/core';

      const compilerOptions: CompilerOptions = {
        defaultEncapsulation: ViewEncapsulation.None,
        preserveWhitespaces: true,
        useJit: true,
        missingTranslation: MissingTranslationStrategy.Ignore,
      };
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`useJit: true`);
    expect(content).not.toContain(`missingTranslation: MissingTranslationStrategy.Ignore`);
    expect(content).not.toContain(`MissingTranslationStrategy`);
  });


  it('should be able to remove useJit and missingTranslation', async () => {
    writeFile('/index.ts', `
      import {CompilerOptions, ViewEncapsulation, MissingTranslationStrategy} from '@angular/core';

      function withOptions(compilerOptions: CompilerOptions) {}

      withOptions({
        defaultEncapsulation: ViewEncapsulation.None,
        preserveWhitespaces: true,
        useJit: true,
        missingTranslation: MissingTranslationStrategy.Ignore,
      });
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).not.toContain(`useJit: true`);
    expect(content).not.toContain(`missingTranslation: MissingTranslationStrategy.Ignore`);
    expect(content).not.toContain(`MissingTranslationStrategy`);
  });

  it('should not remove properties is not a core CompilerOptions object', async () => {
    writeFile('/index.ts', `
      import {CompilerOptions, ViewEncapsulation, MissingTranslationStrategy} from '@not-angular/core';

      const compilerOptions: CompilerOptions = {
        defaultEncapsulation: ViewEncapsulation.None,
        preserveWhitespaces: true,
        useJit: true,
        missingTranslation: MissingTranslationStrategy.Ignore,
      };
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`useJit: true`);
  });
});
