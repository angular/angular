/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 explicitQueryTiming TSLint rule', () => {

  /**
   * Path to the static-query schematic rules directory. The path needs to be resolved through
   * the Bazel runfiles, because on Windows runfiles are not symlinked into the working directory.
   */
  const rulesDirectory =
      dirname(require.resolve('../../migrations/static-queries/google3/explicitQueryTimingRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR'] !, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile(
        'tsconfig.json',
        JSON.stringify({compilerOptions: {moduleResolution: 'node', module: 'es2015'}}));
    writeFakeAngular();
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function writeFakeAngular() { writeFile('/node_modules/@angular/core/index.d.ts', ``); }

  /**
   * Runs TSLint with the static-query timing TSLint rule. By default the rule fixes
   * are automatically applied.
   */
  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile(
        {rules: {'explicit-query-timing': true}, linterOptions: {typeCheck: true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName) !.getFullText(), config);
    });

    return linter;
  }

  /** Writes a file to the current temporary directory. */
  function writeFile(fileName: string, content: string) {
    shx.mkdir('-p', dirname(join(tmpDir, fileName)));
    writeFileSync(join(tmpDir, fileName), content);
  }

  /** Expects a given file in the temporary directory to contain the specified string. */
  function expectFileToContain(fileName: string, match: string) {
    expect(readFileSync(join(tmpDir, fileName), 'utf8')).toContain(match);
  }

  it('should properly apply query timing replacements', () => {
    writeFile('index.ts', `
      import {Component, NgModule, ViewChild} from '@angular/core';
      
      @Component({template: '<span #static><ng-template><p #dynamic></p></ng-template></span>'})
      export class MyComp {
        @ViewChild('static') query: any;
        @ViewChild('dynamic') query2: any;
        @ViewChild('no_match') query3: any;
        
        @ViewChild('static') set myQuery(res: any) {}
      }
      
      @NgModule({declarations: [MyComp]})
      export class MyModule {}
    `);

    runTSLint();

    expectFileToContain('index.ts', `@ViewChild('static', { static: true }) query: any;`);
    expectFileToContain('index.ts', `@ViewChild('dynamic', { static: false }) query2: any;`);
    expectFileToContain('index.ts', `@ViewChild('no_match', { static: false }) query3: any;`);
    expectFileToContain(
        'index.ts', `@ViewChild('static', { static: true }) set myQuery(res: any) {`);
  });

  it('should report non-explicit static query definitions', () => {
    writeFile('index.ts', `
      import {Component, NgModule, ViewChild} from '@angular/core';
      
      @Component({template: '<span #test></span>'})
      export class MyComp {
        @ViewChild('test') query: any;
        
        ngAfterContentInit() {
          this.query.classList.add('test');
        }
      }
      
      @NgModule({declarations: [MyComp]})
      export class MyModule {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/analysis of the query.*"{static: true}"/);
  });

  it('should report non-explicit dynamic query definitions', () => {
    writeFile('index.ts', `
      import {Component, NgModule, ViewChild} from '@angular/core';
      
      @Component({template: '<ng-template><p #test></p></ng-template>'})
      export class MyComp {
        @ViewChild('test') query: any;
      }
      
      @NgModule({declarations: [MyComp]})
      export class MyModule {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/analysis of the query.*"{static: false}"/);
  });

  it('should add a failure for content queries which cannot be migrated', () => {
    writeFile('index.ts', `
      import {Component, NgModule, ContentChild} from '@angular/core';
      
      @Component({
        template: ''
      })
      export class MyComp {
        @ContentChild('test') query: any;
      }
      
      @NgModule({declarations: [MyComp]})
      export class MyModule {}
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expectFileToContain(
        'index.ts', `@ContentChild('test', /* TODO: add static flag */ {}) query: any;`);
    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/Content queries cannot be migrated automatically/);
  });
});
