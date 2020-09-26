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

describe('AbstractControl.parent migration', () => {
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
      compilerOptions: {lib: ['es2015'], strictNullChecks: true},
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/forms/index.d.ts', `
      export declare abstract class AbstractControl {
        get dirty(): boolean;
        get disabled(): boolean;
        get parent(): FormGroup | FormArray | null;
      }

      export declare class FormArray extends AbstractControl {
        getRawValue(): any[];
      }

      export declare class FormControl extends AbstractControl {
        setValue(value: any): void;
      }

      export declare class FormGroup extends AbstractControl {
        getRawValue(): any;
      }
    `);

    // Fake non-Angular package to make sure that we don't migrate packages we don't own.
    writeFile('/node_modules/@not-angular/forms/index.d.ts', `
      export declare abstract class AbstractControl {
        get dirty(): boolean;
        get disabled(): boolean;
        get parent(): FormGroup | FormArray | null;
      }

      export declare class FormControl extends AbstractControl {
        setValue(value: any): void;
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

  it('should add non-null assertions to accesses of AbstractControl.parent', async () => {
    writeFile('/index.ts', `
      import {AbstractControl} from '@angular/forms';

      class App {
        private _control: AbstractControl;

        getParentValue() {
          return this._control.parent.value;
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return this._control.parent!.value;`);
  });

  it('should add non-null assertions to accesses of FormArray.parent', async () => {
    writeFile('/index.ts', `
      import {FormArray} from '@angular/forms';

      class App {
        getParentValueOf(control: FormArray) {
          return control.parent.value;
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return control.parent!.value;`);
  });

  it('should add non-null assertions to accesses of FormControl.parent', async () => {
    writeFile('/index.ts', `
      import {FormControl} from '@angular/forms';

      class App {
        getBlankControlParentValue() {
          return this._getControl().parent.value;
        }

        private _getControl() {
          return new FormControl();
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return this._getControl().parent!.value;`);
  });

  it('should add non-null assertions to accesses of FormGroup.parent', async () => {
    writeFile('/index.ts', `
      import {FormGroup} from '@angular/forms';

      class App {
        getGlobalGroupParentValue() {
          const parent = (window.foo as FormGroup).parent;
          return parent.value;
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`const parent = (window.foo as FormGroup).parent!;`);
  });

  it('should add non-null assertions to nested accesses of `AbstractControl.parent`', async () => {
    writeFile('/index.ts', `
      import {FormControl} from '@angular/forms';

      class App {
        private _control = new FormControl();

        getGreatGrandParentValue() {
          return this._control.parent.parent.parent.value;
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`return this._control.parent!.parent!.parent!.value;`);
  });

  it('should not add non-null assertions if the `parent` has been null checked in an if statement',
     async () => {
       writeFile('/index.ts', `
        import {FormControl} from '@angular/forms';

        function getParentValue(control: FormControl) {
          if (control.parent) {
            return control.parent.value;
          }

          return null;
        }
      `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toContain(`if (control.parent) {`);
       expect(content).toContain(`return control.parent.value;`);
     });

  it('should not add non-null assertions if the `parent` has been null checked in an else if statement',
     async () => {
       writeFile('/index.ts', `
        import {FormControl} from '@angular/forms';

        function getParentValue(foo: boolean, control: FormControl) {
          if (foo) {
            return foo;
          } else if (control.parent) {
            return control.parent.value;
          }

          return null;
        }
      `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toContain(`} else if (control.parent) {`);
       expect(content).toContain(`return control.parent.value;`);
     });

  it('should not add non-null assertions if the `parent` has been null checked in a ternary expression',
     async () => {
       writeFile('/index.ts', `
        import {FormControl} from '@angular/forms';

        function getParentValue(control: FormControl) {
          return control.parent ? control.parent.value : null;
        }
      `);

       await runMigration();

       expect(tree.readContent('/index.ts'))
           .toContain(`return control.parent ? control.parent.value : null;`);
     });

  it('should not add non-null assertions if a nested `parent` has been null checked', async () => {
    writeFile('/index.ts', `
      import {FormControl} from '@angular/forms';

      function getGreatGrandParentValue(control: FormControl) {
        return control.parent && control.parent.parent && control.parent.parent.parent && control.parent.parent.parent.value;
      }
    `);

    await runMigration();

    expect(tree.readContent('/index.ts'))
        .toContain(
            `return control.parent && control.parent.parent && control.parent.parent.parent && control.parent.parent.parent.value;`);
  });

  it('should not add non-null assertions if there is one already', async () => {
    writeFile('/index.ts', `
      import {FormControl} from '@angular/forms';

      function getParentValue(control: FormControl) {
        return control.parent!.value;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return control.parent!.value;`);
  });

  it('should not add non-null assertions if there is a safe access', async () => {
    writeFile('/index.ts', `
      import {FormControl} from '@angular/forms';

      function getParentValue(control: FormControl) {
        return control.parent?.value;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`return control.parent?.value;`);
  });

  it('should not add non-null assertions if the symbol does not come from @angular/forms',
     async () => {
       writeFile('/index.ts', `
        import {FormControl} from '@not-angular/forms';

        function getParentValue(control: FormControl) {
          return control.parent.value;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts')).toContain(`return control.parent.value;`);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-abstract-control-parent', {}, tree).toPromise();
  }
});
