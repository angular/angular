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

describe('DebugElement.query migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {lib: ['es2015'], strictNullChecks: true},
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
       export declare class DebugElement {
          query(predicate: Predicate<DebugElement>): DebugElement|null {
       }
     `);

    // Fake non-Angular package to make sure that we don't migrate packages we don't own.
    writeFile('/node_modules/@not-angular/core/index.d.ts', `
       export declare class DebugElement {
          query(predicate: Predicate<DebugElement>): DebugElement|null {
       }
     `);

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

  it('should add non-null assertions to accesses of DebugElement.query', async () => {
    writeFile('/index.ts', `
       import {DebugElement} from '@angular/core';
       class App {
         private _debugElement: DebugElement;
         getElement(selector: string) {
           return this._debugElement.query(By.css(selector)).nativeElement;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`this._debugElement.query(By.css(selector))!.nativeElement`);
  });

  it('should not add non-null assertions to accesses of DebugElement.query', async () => {
    writeFile('/index.ts', `
       import {DebugElement} from '@angular/core';
       class App {
         private _debugElement: DebugElement;
         getElement(selector: string) {
            return this._debugElement.query(By.css(selector))?.nativeElement;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._debugElement.query(By.css(selector))?.nativeElement;`);
  });

  it('should add non-null assertions to accesses of DebugElement.query', async () => {
    writeFile('/index.ts', `
       import {DebugElement} from '@angular/core';
       class App {
         getElement(selector: string) {
            return this._getElement().query(By.css(selector)).nativeElement;
         }
         private _getElement() {
           return new DebugElement();
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._getElement().query(By.css(selector))!.nativeElement;`);
  });

  it('should add non-null assertions to accesses of DebugElement.query', async () => {
    writeFile('/index.ts', `
       import {DebugElement} from '@angular/core';
       class App {
         getElement(selector: string) {
           const element = (window.foo as DebugElement).query(selector);
           return element.nativeElement;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const element = (window.foo as DebugElement).query(selector)!;`);
  });

  it('should not add non-null assertions if the symbol does not come from @angular/core',
     async () => {
       writeFile('/index.ts', `
        import {DebugElement} from '@not-angular/core';
        getElement(selector: string) {
          return new DebugElement().query(By.css(selector)).nativeElement;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts'))
           .toContain(`return new DebugElement().query(By.css(selector)).nativeElement;`);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-debugElement-query', {}, tree);
  }
});
