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

describe('FormArray.at migration', () => {
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
    writeFile('/node_modules/@angular/forms/index.d.ts', `
       export declare class FormArray extends AbstractControl {
         getRawValue(): any[];
         at(index: number): {} | undefined
       }
     `);

    // Fake non-Angular package to make sure that we don't migrate packages we don't own.
    writeFile('/node_modules/@not-angular/forms/index.d.ts', `
        export declare class FormArray extends AbstractControl {
          getRawValue(): any[];
          at(index: number): {} | undefined
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

  it('should add non-null assertions to accesses of FormArray.at', async () => {
    writeFile('/index.ts', `
       import {FormArray} from '@angular/forms';
       class App {
         private _formArray: FormArray;
         getValueAt(index:number) {
           return this._formArray.at(index).value;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return this._formArray.at(index)!.value;`);
  });

  it('should not add non-null assertions to accesses of FormArray.at', async () => {
    writeFile('/index.ts', `
       import {FormArray} from '@angular/forms';
       class App {
         private _formArray: FormArray;
         getValueAt(index:number) {
           return this._formArray.at(index)?.value;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return this._formArray.at(index)?.value;`);
  });

  it('should add non-null assertions to accesses of FormArray.at', async () => {
    writeFile('/index.ts', `
       import {FormArray} from '@angular/forms';
       class App {
         getValueAt(index:number) {
          return this._getFormArray().at(index).value;
         }
         private _getFormArray() {
           return new FormArray();
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._getFormArray().at(index)!.value;`);
  });

  it('should add non-null assertions to accesses of FormArray.at', async () => {
    writeFile('/index.ts', `
       import {FormArray} from '@angular/forms';
       class App {
         getValueAt(index:number) {
           const ctrl = (window.foo as FormArray).at(index);
           return ctrl.value;
         }
       }
     `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const ctrl = (window.foo as FormArray).at(index)!;`);
  });

  it('should not add non-null assertions if the symbol does not come from @angular/forms',
     async () => {
       writeFile('/index.ts', `
        import {FormArray} from '@not-angular/forms';
        getValueAt(index:number) {
          return new FormArray([]).at(index).value;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts')).toContain(`return new FormArray([]).at(index).value;`);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v17-formArray-at', {}, tree);
  }
});
