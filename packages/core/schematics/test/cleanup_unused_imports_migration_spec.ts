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

describe('cleanup unused imports schematic', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let logs: string[];

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('cleanup-unused-imports', {}, tree);
  }

  function stripWhitespace(content: string) {
    return content.replace(/\s+/g, '');
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

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);

    writeFile(
      'directives.ts',
      `
        import {Directive} from '@angular/core';

        @Directive({selector: '[one]'})
        export class One {}

        @Directive({selector: '[two]'})
        export class Two {}

        @Directive({selector: '[three]'})
        export class Three {}
      `,
    );
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should clean up an array where some imports are not used', async () => {
    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';
        import {One, Two, Three} from './directives';

        @Component({
          imports: [Three, One, Two],
          template: '<div one></div>',
        })
        export class Comp {}
      `,
    );

    await runMigration();

    expect(logs.pop()).toBe('Removed 2 imports in 1 file');
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {One} from './directives';

        @Component({
          imports: [One],
          template: '<div one></div>',
        })
        export class Comp {}
    `),
    );
  });

  it('should clean up an array where all imports are not used', async () => {
    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';
        import {One, Two, Three} from './directives';

        @Component({
          imports: [Three, One, Two],
          template: '',
        })
        export class Comp {}
      `,
    );

    await runMigration();

    expect(logs.pop()).toBe('Removed 3 imports in 1 file');
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';

        @Component({
          imports: [],
          template: '',
        })
        export class Comp {}
    `),
    );
  });

  it('should clean up an array where aliased imports are not used', async () => {
    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';
        import {One as OneAlias, Two as TwoAlias, Three as ThreeAlias} from './directives';

        @Component({
          imports: [ThreeAlias, OneAlias, TwoAlias],
          template: '<div one></div>',
        })
        export class Comp {}
      `,
    );

    await runMigration();

    expect(logs.pop()).toBe('Removed 2 imports in 1 file');
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {One as OneAlias} from './directives';

        @Component({
          imports: [OneAlias],
          template: '<div one></div>',
        })
        export class Comp {}
    `),
    );
  });

  it('should preserve import declaration if unused import is still used within the file', async () => {
    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';
        import {One} from './directives';

        @Component({
          imports: [One],
          template: '',
        })
        export class Comp {}

        @Component({
          imports: [One],
          template: '<div one></div>',
        })
        export class OtherComp {}
      `,
    );

    await runMigration();

    expect(logs.pop()).toBe('Removed 1 import in 1 file');
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {One} from './directives';

        @Component({
          imports: [],
          template: '',
        })
        export class Comp {}

        @Component({
          imports: [One],
          template: '<div one></div>',
        })
        export class OtherComp {}
    `),
    );
  });

  it('should not touch a file where all imports are used', async () => {
    const initialContent = `
      import {Component} from '@angular/core';
      import {One, Two, Three} from './directives';

      @Component({
        imports: [Three, One, Two],
        template: '<div one two three></div>',
      })
      export class Comp {}
    `;

    writeFile('comp.ts', initialContent);

    await runMigration();

    expect(logs.pop()).toBe('Schematic could not find unused imports in the project');
    expect(tree.readContent('comp.ts')).toBe(initialContent);
  });

  it('should not touch unused import declarations that are not referenced in an `imports` array', async () => {
    const initialContent = `
      import {Component} from '@angular/core';
      import {One, Two, Three} from './directives';

      @Component({template: 'Hello'})
      export class Comp {}
    `;

    writeFile('comp.ts', initialContent);

    await runMigration();

    expect(logs.pop()).toBe('Schematic could not find unused imports in the project');
    expect(tree.readContent('comp.ts')).toBe(initialContent);
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
      'comp.ts',
      `
        import {Component} from '@angular/core';
        import {One, Two, Three} from './directives';

        @Component({
          imports: [Three, One, Two],
          template: '<div one></div>',
        })
        export class Comp {}
      `,
    );

    await runMigration();

    expect(logs.pop()).toBe('Removed 2 imports in 1 file');
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {One} from './directives';

        @Component({
          imports: [One],
          template: '<div one></div>',
        })
        export class Comp {}
    `),
    );
  });
});
