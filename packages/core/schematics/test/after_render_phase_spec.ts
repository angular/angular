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

describe('afterRender phase migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-after-render-phase', {}, tree);
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

  it('should update afterRender phase flag', async () => {
    writeFile(
      '/index.ts',
      `
          import { AfterRenderPhase, Directive, afterRender } from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
            constructor() {
              afterRender(() => {
                console.log('read');
              }, {phase: AfterRenderPhase.Read});
            }
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('AfterRenderPhase');
    expect(content).toContain(`afterRender({ read: () => { console.log('read'); } }, );`);
  });

  it('should update afterNextRender phase flag', async () => {
    writeFile(
      '/index.ts',
      `
          import { AfterRenderPhase, Directive, afterNextRender } from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
            constructor() {
              afterNextRender(() => {
                console.log('earlyRead');
              }, {phase: AfterRenderPhase.EarlyRead});
            }
          }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).not.toContain('AfterRenderPhase');
    expect(content).toContain(
      `afterNextRender({ earlyRead: () => { console.log('earlyRead'); } }, );`,
    );
  });

  it('should not update calls that do not specify phase flag', async () => {
    const originalContent = `
        import { Directive, Injector, afterRender, afterNextRender, inject } from '@angular/core';

        @Directive({
          selector: '[someDirective]'
        })
        export class SomeDirective {
          injector = inject(Injector);

          constructor() {
            afterRender(() => {
              console.log('default phase');
            });
            afterNextRender(() => {
              console.log('default phase');
            });
            afterRender(() => {
              console.log('default phase');
            }, {injector: this.injector});
            afterNextRender(() => {
              console.log('default phase');
            }, {injector: this.injector});
          }
        }`;
    writeFile('/index.ts', originalContent);

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toEqual(originalContent.replace(/\s+/g, ' '));
  });

  it('should not change options other than phase', async () => {
    writeFile(
      '/index.ts',
      `
          import { AfterRenderPhase, Directive, Injector, afterRender, inject } from '@angular/core';

          @Directive({
            selector: '[someDirective]'
          })
          export class SomeDirective {
            injector = inject(Injector);

            constructor() {
              afterRender(() => {
                console.log('earlyRead');
              }, {
                phase: AfterRenderPhase.EarlyRead,
                injector: this.injector
              });
            }
          }`,
    );

    await runMigration();
    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain(
      `afterRender({ earlyRead: () => { console.log('earlyRead'); } }, { injector: this.injector });`,
    );
  });
});
