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
      export interface FormControl<T = any> {}
      type FormControlInterface<T = any> = FormControl<T>;
      export interface ɵFormControlCtor {
        new<T = any>(value?: any): FormControl<T>;
      }
      export const FormControl: ɵFormControlCtor =
      (class FormControl<T = any> implements FormControlInterface<T> {
        constructor(value?: any) {}
      });
      export declare class FormGroup<T = any> {
        constructor(controls?: any)
      }
      export declare class FormArray {
        constructor(controls?: any)
      }
      export declare class AbstractControl {}
      export declare class FormBuilder {
        control(v: any): void;
        group(v: any): void;
        array(v: any): void;
      }
      export declare class UntypedFormControl {
        constructor(value?: any)
      }
      export declare class UntypedFormGroup {
        constructor(controls?: any)
      }
      export declare class UntypedFormArray {
        constructor(controls?: any)
      }
      export declare class UntypedFormBuilder {
        control(v: any): void;
        group(v: any): void;
        array(v: any): void;
      }
      export declare class Form {}
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
             private _control: FC = new FC(42);
             private _group = new FormGroup({});
             private _array: FormArray = new FormArray([]);
             private _ungroup: UntypedFormGroup = new UntypedFormGroup({});
             private FormC: Form = new Form();

             private nested = new FormGroup({a: new FC(1)});
             private nested2 = new FormGroup<{a: FormGroup<{b: FC<number>}>}>({a: new FormGroup<{b: FC<number>}>(new FC(1))});

             private fb = new FormBuilder();
             private fb2!: FormBuilder;

             private someSet = new Set([1]);
             private FCSet = new Set<FC>(new FC(1));

             foo(fc: FC) {}

             bar<T extends FormGroup>(baz: T) {}
             baz(T: FormGroup&string) {}

             build(fg: FormGroup) {
               let tg: UntypedFormGroup;
               const c = this.fb.control(42);
               const g = this.fb.group({one: this.fb.control('')});
               const a = this.fb.array([42]);
               const fc2 = new FC(0);
             }
           }

           class TypedFormGroup extends FormGroup {}
           let a!: TypedFormGroup;

           class ormGroup extends FormGroup {}
         `);
      await runMigration();
      // There are a huge number of positions in which identifiers can show up. This tests an
      // assortment of them, but is not exhaustive.
      const cases = [
        // Imports, excluding already migrated imports
        `import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, FormGroup, UntypedFormGroup } from '@angular/forms';`,
        // Constructor calls, in various positions and qualifications
        `private _control: UntypedFormControl = new UntypedFormControl(42);`,
        `private _group = new UntypedFormGroup({});`,
        `private _array: UntypedFormArray = new UntypedFormArray([]);`,
        `private fb = new UntypedFormBuilder();`,
        `const fc2 = new UntypedFormControl(0);`,
        // Declarations
        `let tg: UntypedFormGroup;`,
        `private fb2!: UntypedFormBuilder;`,
        // Function parameters
        `foo(fc: UntypedFormControl) {}`,
        `build(fg: UntypedFormGroup) {`,
        // Generic arguments
        `private FCSet = new Set<UntypedFormControl>(new UntypedFormControl(1));`,
        // Generic functions
        `bar<T extends UntypedFormGroup>(baz: T) {}`,
        // Intersection types
        `baz(T: UntypedFormGroup&string) {}`,
        // Nested types
        `private nested = new UntypedFormGroup({a: new UntypedFormControl(1)});`,
        `private nested2 = new UntypedFormGroup<{a: UntypedFormGroup<{b: UntypedFormControl<number>}>}>({a: new UntypedFormGroup<{b: UntypedFormControl<number>}>(new UntypedFormControl(1))});`,
        // Skip UntypedFormGroup, which is already migrated (idempotent migration)
        `private _ungroup: UntypedFormGroup = new UntypedFormGroup({});`,
        // Form class should not be changed.
        `private FormC: Form = new Form();`,
        // Unrelated constructors should not be changed.
        `private someSet = new Set([1]);`,
        // Unrelated classes with similar names should not be changed.
        `private someSet = new Set([1]);`,
        `class TypedFormGroup extends UntypedFormGroup {}`,
        `let a!: TypedFormGroup;`,
        `class ormGroup extends UntypedFormGroup {}`,
      ];
      cases.forEach(t => expect(tree.readContent('/index.ts')).toContain(t));
    });

    it('skip adding imports that would be unused', async () => {
      writeFile('/index.ts', `
        import {Component} from '@angular/core';
        import {FormControl, FormGroup} from '@angular/forms';

        @Component({template: ''}) export class MyComponent {
          private fc: FormControl;
        } `);
      await runMigration();
      const cases = [
        // Because FormGroup is never used, the import should not be updated.
        `import {UntypedFormControl, FormGroup} from '@angular/forms';`,
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
