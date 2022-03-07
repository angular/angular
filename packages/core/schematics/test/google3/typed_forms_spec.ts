/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 typedForms TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/typedFormsRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('testing.d.ts', `
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

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/forms': ['testing.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'typedForms': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should migrate a complete example', () => {
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

        build() {
          const c = this.fb.control(42);
          const g = this.fb.group({one: this.fb.control('')});
          const a = this.fb.array([42]);
          const fc2 = new FC(0);
        }
      }
    `);

    const linter = runTSLint(true);
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
    ];
    cases.forEach(t => expect(getFile(`/index.ts`)).toContain(t));
  });
});
