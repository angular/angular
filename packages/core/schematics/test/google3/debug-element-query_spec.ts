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

describe('Google3 DebugElement at access migration', () => {
  const rulesDirectory = dirname(
      runfiles.resolvePackageRelative('../../migrations/google3/debugElementQueryCjsRule.js'));
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('testing.d.ts', `export declare class DebugElement {
      query(predicate: Predicate<DebugElement>): DebugElement|null {
   }`);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        strictNullChecks: true,
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/core': ['testing.d.ts'],
        },
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  const testFileLinting = (fileContent: string, numOfFailures: number) => {
    writeFile('/index.ts', fileContent);
    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map((failure) => failure.getFailure());

    expect(failures.length).toBe(numOfFailures);
    failures.forEach(
        (failure) => expect(failure).toMatch(
            /DebugElement.query can return null so it need to be accessed safely/));
  };

  it('should add ! to accesses to a DebugElement\'s query() return', () => {
    const fileContent = `
    import { DebugElement } from '@angular/core';
       export class Foo implements OnInit {
        debugElement = new DebugElement()
         ngOnInit() {
           console.log(this.debugElement.query(By.css('select')).value);
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
    const config = Configuration.parseConfigFile({rules: {'debugElementQueryCjs': true}});

    program.getRootFileNames().forEach((fileName) => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }
});
