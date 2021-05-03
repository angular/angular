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

describe('Google3 explicitQueryTiming TSLint rule', () => {
  /**
   * Path to the static-query schematic rules directory. The path needs to be resolved through
   * the Bazel runfiles, because on Windows runfiles are not symlinked into the working directory.
   */
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/explicitQueryTimingRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  /**
   * Runs TSLint with the static-query timing TSLint rule. By default the rule fixes
   * are automatically applied.
   */
  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'explicit-query-timing': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  /** Writes a file to the current temporary directory. */
  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  /** Expects a given file in the temporary directory to contain the specified string. */
  function expectFileToContain(fileName: string, match: string) {
    expect(readFileSync(join(tmpDir, fileName), 'utf8')).toContain(match);
  }

  it('should properly apply query timing replacements', () => {
    writeFile('index.ts', `
      import {Component, ViewChild} from '@angular/core';

      @Component({template: '<span #test></span>'})
      export class MyComp {
        @ViewChild('test') query: any;
        @ViewChild('test') query2: any;
        @ViewChild('test') query3: any;

        ngAfterContentInit() {
          this.query.classList.add('test');
        }
      }
    `);

    writeFile('external.ts', `
      import {MyComp} from './index';

      export class Test extends MyComp {
        ngOnInit() {
          this.query3.doSomething();
        }
      }
    `);

    runTSLint();

    expectFileToContain('index.ts', `@ViewChild('test', { static: true }) query: any;`);
    expectFileToContain('index.ts', `@ViewChild('test', { static: false }) query2: any;`);
    expectFileToContain('index.ts', `@ViewChild('test', { static: true }) query3: any;`);
  });

  it('should report non-explicit static query definitions', () => {
    writeFile('index.ts', `
      import {Component, ViewChild} from '@angular/core';

      @Component({template: '<span #test></span>'})
      export class MyComp {
        @ViewChild('test') query: any;

        ngAfterContentInit() {
          this.query.classList.add('test');
        }
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/analysis of the query.*"{static: true}"/);
  });

  it('should report non-explicit dynamic query definitions', () => {
    writeFile('index.ts', `
      import {Component, ContentChild} from '@angular/core';

      @Component({template: '<span #test></span>'})
      export class MyComp {
        @ContentChild('test') query: any;
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/analysis of the query.*"{static: false}"/);
  });

  it('should detect query usage in component template', () => {
    writeFile('index.ts', `
      import {Component, ViewChild} from '@angular/core';

      @Component({
        template: \`
          <span #test></span>
          <my-comp [binding]="query"></my-comp>
        \`
      })
      export class MyComp {
        @ViewChild('test') query: any;
      }
    `);

    runTSLint();

    expectFileToContain('index.ts', `@ViewChild('test', { static: true }) query: any;`);
  });
});
