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

describe('explicit-standalone-flag migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('explicit-standalone-flag', {}, tree);
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

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  it('should update standalone to false for Directive', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('standalone: false');
  });

  it('should update standalone to false for Component', async () => {
    writeFile(
      '/index.ts',
      `
          import { Component } from '@angular/core';

          @Component({
            selector: '[someComponent]'
          })
          export class SomeComponent {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('standalone: false');
  });

  it('should update standalone to false for Pipe', async () => {
    writeFile(
      '/index.ts',
      `
          import { Pipe } from '@angular/core';

          @Pipe({
            name: 'somePipe'
          })
          export class SomePipe {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('standalone: false');
  });

  it('should not remove standalone:true without imports', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';

          @Directive({
            selector: '[someDirective]',
            standalone: true
          })
          export class SomeDirective {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');

    expect(content).toContain('standalone: true');
  });

  it('should remove standalone:true when imports are presents', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';

          @Directive({
            selector: '[someDirective]',
            imports: [FooBar],
            standalone: true
          })
          export class SomeDirective {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');

    expect(content).not.toContain('standalone');
  });

  it('should remove standalone:true when imports are presents', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';
          const myImports = [FooBar]

          @Directive({
            selector: '[someDirective]',
            imports: myImports,
            standalone: true
          })
          export class SomeDirective {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');

    expect(content).not.toContain('standalone');
  });

  it('should not update a directive with standalone:false', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';

          @Directive({
            selector: '[someDirective]',
            standalone: false
          })
          export class SomeDirective {
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('standalone: true');
    expect(content).toContain('standalone: false');
  });

  it('should not update an empty directive', async () => {
    writeFile(
      '/index.ts',
      `
            import { Directive } from '@angular/core';
            @Directive()
            export class SomeDirective {}`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('standalone');
  });

  it('should not migrate standalone if its a shorthard property assignment', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';
          const standalone = true;

          function directiveFactory(standalone: boolean) {  
            @Directive({
              selector: '[someDirective]',
              standalone,
            })
            export class SomeDirective {
            }

            return SomeDirective
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('standalone: true');
    expect(content).not.toContain('standalone: false');
    expect(content).toContain('standalone,');
  });

  it('should not migrate standalone if the property is assigned by a variable', async () => {
    writeFile(
      '/index.ts',
      `
          import { Directive } from '@angular/core';
          const isStandalone = true;

          function directiveFactory(standalone: boolean) {  
            @Directive({
              selector: '[someDirective]',
              standalone: isStandalone,
            })
            export class SomeDirective {
            }

            return SomeDirective
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('standalone: true');
    expect(content).not.toContain('standalone: false');
    expect(content).toContain('standalone');
  });

  it('should ensure that migration is idempotent for a module-based directive', async () => {
    writeFile(
      '/index.ts',
      `
      import { Directive } from '@angular/core';

      @Directive({
        selector: '[someDirective]',
      })
      export class SomeDirective {
      }
      `,
    );

    await runMigration();
    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('standalone: false');
  });

  it('should ensure that migration is idempotent for a standalone directive', async () => {
    writeFile(
      '/index.ts',
      `
      import { Directive } from '@angular/core';

      @Directive({
        selector: '[someDirective]',
        standalone: true,
      })
      export class SomeDirective {
      }
      `,
    );

    await runMigration();
    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('standalone: false');
    expect(content).toContain('standalone: true');
  });
});
