/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {writeFileSync} from 'fs';
import {dirname, join} from 'path';
import shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('FormArray at access migration', () => {
  const rulesDirectory =
      dirname(runfiles.resolvePackageRelative('../../migrations/google3/formArrayAtCjsRule.js'));
  let tmpDir: string;
  let previousWorkingDir: string;


  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);
    shx.cd(tmpDir);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));
    writeFile('angular.json', JSON.stringify({
      version: 1,
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
    }));

    shx.mkdir('-p', 'node_modules/@angular/forms');
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('node_modules/@angular/forms/index.d.ts', `
       export declare class FormArray<T> {
         at(index: number): {} | undefined
       }
     `);

    previousWorkingDir = shx.pwd();

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDir);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDir);
  });

  const testFileLinting = (fileContent: string, numOfFailures: number) => {
    writeFile('/index.ts', fileContent);
    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map((failure) => failure.getFailure());

    expect(failures.length).toBe(numOfFailures);
    failures.forEach(
        (failure) => expect(failure).toMatch(
            /FormArray's at can return undefined so it need to be accessed safely/));
  };

  it('should add ! to accesses to a FormArray\'s at() return', () => {
    const fileContent = `
    import { FormArray } from '@angular/forms';
       export class Foo implements OnInit {
        formArray = new FormArray()

         ngOnInit() {
           console.log(this.formArray.at(0).value);
         }
       }
     `;
    const expectedFailures = 1;
    testFileLinting(fileContent, expectedFailures);
  });

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'form-array-at-cjs': true}});

    program.getRootFileNames().forEach((fileName) => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }
});
