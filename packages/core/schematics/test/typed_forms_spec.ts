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
      export declare class FormBuilder {
        constructor();
        control(
          formState: any, validatorOrOpts?: any,
          asyncValidator?: any): FormControl;
        group(
          controlsConfig: {[key: string]: any},
          options?: any,
          ): FormGroup;
        group(
          controlsConfig: {[key: string]: any},
          options: {[key: string]: any},
          ): FormGroup;
        group(
          controlsConfig: {[key: string]: any},
          options: any): FormGroup;
        array(
          controlsConfig: any[],
          validatorOrOpts?: any,
          asyncValidator?: any): FormArray;
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

  describe('should add <any> to constructors', () => {
    it('for FormControl', async () => {
      writeFile('/index.ts', `
          import { FormControl } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            const fc1 = new FormControl();
            new FormControl(42);
            constructor() {}
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`const fc1 = new FormControl<any>();`);
      expect(tree.readContent('/index.ts')).toContain(`new FormControl<any>(42);`);
    });

    it('for FormGroup', async () => {
      writeFile('/index.ts', `
          import { FormGroup } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            const fg = new FormGroup({foo: 3});
            constructor() {}
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`const fg = new FormGroup<any>({foo: 3});`);
    });

    it('for FormArray', async () => {
      writeFile('/index.ts', `
          import { FormArray } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            const fa = new FormArray([null]);
            constructor() {}
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`const fa = new FormArray<any[]>([null]);`);
    });

    it('for FormControl with a qualified import', async () => {
      writeFile('/index.ts', `
          import { FormControl as FC } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            const fc = new FC({foo: 3});
            constructor() {}
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`const fc = new FC<any>({foo: 3});`);
    });
  });

  describe('should add <any> to FormBuilder method', () => {
    it('control', async () => {
      writeFile('/index.ts', `
          import { FormBuilder } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            constructor() {
              const fb = new FormBuilder();
              const fc = fb.control(43);
              const fd = new FormBuilder().control(42);
            }
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`.control<any>(43);`);
      expect(tree.readContent('/index.ts'))
          .toContain(`const fd = new FormBuilder().control<any>(42)`);
    });

    it('group', async () => {
      writeFile('/index.ts', `
          import { FormBuilder } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            constructor() {
              const fb = new FormBuilder();
              const fc = fb.group({});
              const fd = new FormBuilder().group({});
            }
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`fb.group<any>({});`);
      expect(tree.readContent('/index.ts'))
          .toContain(`const fd = new FormBuilder().group<any>({})`);
    });

    it('array', async () => {
      writeFile('/index.ts', `
          import { FormBuilder } from '@angular/forms';
          @Component({template: ''})
          export class MyComp {
            constructor() {
              const fb = new FormBuilder();
              const fc = fb.array([0]);
              const fd = new FormBuilder().array([0]);
            }
          }
        `);
      await runMigration();
      expect(tree.readContent('/index.ts')).toContain(`fb.array<any[]>([0]);`);
      expect(tree.readContent('/index.ts'))
          .toContain(`const fd = new FormBuilder().array<any[]>([0])`);
    });
  });

  describe('should handle', () => {
    it('an integrated example', async () => {
      writeFile('/index.ts', `
          import { Component } from '@angular/core';
          import { AbstractControl, FormArray, FormBuilder, FormControl as FC, FormGroup } from '@angular/forms';
          
          @Component({template: ''})
          export class MyComponent {
            private _control = new FC(42);
            private _group = new FormGroup({});
            private _array = new FormArray([]);
          
            private fb = new FormBuilder();
          
            build() {
              const c = this.fb.control(42);
              const g = this.fb.group({one: this.fb.control('')});
              const a = this.fb.array([42]);
              const fc2 = new FC(0);
            }
          }
        `);
      await runMigration();
      ['new FC<any>(42)', 'new FormGroup<any>({})', 'new FormArray<any[]>([])',
       'const fc2 = new FC<any>(0)', 'this.fb.control<any>(42)',
       'this.fb.group<any>({one: this.fb.control<any>(\'\')})', 'this.fb.array<any[]>([42])']
          .forEach(t => expect(tree.readContent('/index.ts')).toContain(t));
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v14-typed-forms', {}, tree).toPromise();
  }

  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }
});