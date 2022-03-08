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
import * as shx from 'shelljs';

describe('Typed Forms migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
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
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/forms/index.d.ts', `
       export declare class FormControl {}
       export declare class FormGroup {}
       export declare class FormArray {}
       export declare class AbstractControl {}
       export declare class FormBuilder {}
       export declare class UntypedFormControl {}
       export declare class UntypedFormGroup {}
       export declare class UntypedFormArray {}
       export declare class UntypedFormBuilder {}
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

  describe('should', () => {
    it('rename imports and constructor calls', async () => {
      writeFile('/index.ts', `
           import { Component } from '@angular/core';
           import { AbstractControl, FormArray, FormBuilder, FormControl as FC, FormGroup, UntypedFormGroup } from '@angular/forms';

           @Component({template: ''})
           export class MyComponent {
             private _control = new FC(42);
             private _group = new FormGroup({});
             private _array = new FormArray([]);
             private _ungroup = new FormGroup({});

             private fb = new FormBuilder();

             private someSet = new Set([1]);

             build() {
               const c = this.fb.control(42);
               const g = this.fb.group({one: this.fb.control('')});
               const a = this.fb.array([42]);
               const fc2 = new FC(0);
             }
           }
         `);
      await runMigration();
      const cases = [
        // All the imports should be paired with an new untyped version,
        // except UntypedFormGroup (which is already present).
        `import { AbstractControl, FormArray, UntypedFormArray, FormBuilder, UntypedFormBuilder, FormControl as FC, UntypedFormControl, FormGroup, UntypedFormGroup } from '@angular/forms';`,
        // Existing constructor calls should be rewritten, in various positions, including qualified
        // imports.
        `private _control = new UntypedFormControl(42);`,
        `private _group = new UntypedFormGroup({});`,
        `private _array = new UntypedFormArray([]);`,
        `private fb = new UntypedFormBuilder();`,
        `const fc2 = new UntypedFormControl(0);`,
        // Except UntypedFormGroup, which is already migrated.
        `private _ungroup = new UntypedFormGroup({});`,
        // Unrelated constructors should not be changed.
        `private someSet = new Set([1]);`,
      ];
      cases.forEach(t => expect(tree.readContent('/index.ts')).toContain(t));
    });

    it('skip adding imports that would be unused', async () => {
      writeFile('/index.ts', `
           import { Component } from '@angular/core';
           import { FormControl, FormGroup } from '@angular/forms';

           @Component({template: ''})
           export class MyComponent {
             private _group!: FormGroup;
             private _control = new FormControl(42);
           }
         `);
      await runMigration();
      const cases = [
        // Because FormGroup is never directly constructed, the import should not be added.
        `import { FormControl, UntypedFormControl, FormGroup } from '@angular/forms';`,
      ];
      cases.forEach(t => expect(tree.readContent('/index.ts')).toContain(t));
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v14-typed-forms', {}, tree).toPromise();
  }
});
