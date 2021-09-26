/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('QueryList first and last access migration', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/queryListFirstLastRule'));
  let host: TempScopedNodeJsSyncHost;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    host = new TempScopedNodeJsSyncHost();

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
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare class QueryList<T> {
        readonly first?: T;
        readonly last?: T;
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

  const testFileLinting = (fileContent: string, numOfFailures: number) => {
    writeFile('/index.ts', fileContent);
    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(numOfFailures);
    failures.forEach(
        failure => expect(failure).toMatch(
            /QueryList's first and last can be undefined so they need to be accessed safely/));
  };

  it('should add ! to accesses to a QueryList\'s first field', async () => {
    const fileContent = `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          console.log(this.testElements.first.value);
        }
      }
    `;
    const expectedFailures = 1;
    testFileLinting(fileContent, expectedFailures);
  });

  it('should add ! to accesses to a QueryList\'s last field', () => {
    const fileContent = `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          console.log(this.testElements.last.value);
        }
      }
    `;
    const expectedFailures = 1;
    testFileLinting(fileContent, expectedFailures);
  });

  it('should add ! to accesses to both QueryList\'s first and last fields', () => {
    const fileContent = `
      import { Component, QueryList, ViewChildren, Input } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        @Input() id: string!;
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        checkFirstAndLastIdsEquality() {
          return this.testElements.first.id === this.testElements.last.id;
        }
      }
    `;
    const expectedFailures = 2;
    testFileLinting(fileContent, expectedFailures);
  });

  it('should not add ! to accesses to the QueryList\'s fist/last fields if they are null checked',
     () => {
       const fileContent = `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          this.testElements.first && console.log(this.testElements.first.value);
          this.testElements.last && console.log(this.testElements.last.value);
        }
      }
    `;
       const expectedFailures = 0;
       testFileLinting(fileContent, expectedFailures);
     });

  it('should add ! to accesses to QueryList\'s first and last fields even after reassignment',
     () => {
       const fileContent = `
      import { Component, QueryList, ViewChildren, Input } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        execLogic() {}
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        onClick() {
          const allCompTests = this.testElements;
          if(allCompTests.first) {
            allCompTests.first.execLogic();
          } else {
            allCompTests.last.execLogic();
          }
        }
      }
    `;
       const expectedFailures = 1;
       testFileLinting(fileContent, expectedFailures);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDirPath, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'queryListFirstLast': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }
});
