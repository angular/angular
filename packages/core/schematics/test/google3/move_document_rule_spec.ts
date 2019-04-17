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

describe('Google3 moveDocument TSLint rule', () => {

  /**
   * Path to the move-document schematic rules directory. The path needs to be resolved through
   * the Bazel runfiles, because on Windows runfiles are not symlinked into the working directory.
   */
  const rulesDirectory =
      dirname(require.resolve('../../migrations/move-document/google3/moveDocumentRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR'] !, 'google3-test');
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
    const config = Configuration.parseConfigFile(
        {rules: {'move-document': true}, linterOptions: {typeCheck: true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName) !.getFullText(), config);
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

  /** Expects a given file in the temporary directory not to contain the specified string. */
  function expectFileNotToContain(fileName: string, match: string) {
    expect(readFileSync(join(tmpDir, fileName), 'utf8')).not.toContain(match);
  }

  it('should properly apply import replacement', () => {
    writeFile('index.ts', `
      import {DOCUMENT} from '@angular/platform-browser';
    `);

    runTSLint();

    expectFileToContain('index.ts', `import {DOCUMENT} from '@angular/common';`);
    expectFileNotToContain('index.ts', `import {DOCUMENT} from '@angular/platform-browser';`);
  });

  it('should report incorrect imports', () => {
    writeFile('index.ts', `
      import {DOCUMENT} from '@angular/platform-browser';
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/DOCUMENT is no longer exported.*/);
  });

  it('should properly apply import replacement with existing import', () => {
    writeFile('index.ts', `
      import {DOCUMENT} from '@angular/platform-browser';
      import {someImport} from '@angular/common';
    `);

    runTSLint();

    expectFileToContain('index.ts', `import { someImport, DOCUMENT } from '@angular/common';`);
    expectFileNotToContain('index.ts', `import {DOCUMENT} from '@angular/platform-browser';`);
  });

  it('should properly apply import replacement with existing import (reverse)', () => {
    writeFile('index.ts', `
      import {someImport} from '@angular/common';
      import {DOCUMENT} from '@angular/platform-browser';
    `);

    runTSLint();

    expectFileToContain('index.ts', `import { someImport, DOCUMENT } from '@angular/common';`);
    expectFileNotToContain('index.ts', `import {DOCUMENT} from '@angular/platform-browser';`);
  });

  it('should properly apply import replacement with existing import w/ comments', () => {
    writeFile('index.ts', `
      /**
       * this is a comment
       */
      import {DOCUMENT} from '@angular/platform-browser';
      import {someImport} from '@angular/common';
    `);

    runTSLint();

    expectFileToContain('index.ts', `import { someImport, DOCUMENT } from '@angular/common';`);
    expectFileNotToContain('index.ts', `import {DOCUMENT} from '@angular/platform-browser';`);
  });

  it('should properly apply import replacement with existing and redundant imports', () => {
    writeFile('index.ts', `
      import {DOCUMENT} from '@angular/platform-browser';
      import {anotherImport} from '@angular/platform-browser-dynamic';
      import {someImport} from '@angular/common';
    `);

    runTSLint();

    expectFileToContain('index.ts', `import { someImport, DOCUMENT } from '@angular/common';`);
    expectFileNotToContain('index.ts', `import {DOCUMENT} from '@angular/platform-browser';`);
  });

  it('should properly apply import replacement with existing import and leave original import',
     () => {
       writeFile('index.ts', `
      import {DOCUMENT, anotherImport} from '@angular/platform-browser';
      import {someImport} from '@angular/common';
    `);

       runTSLint();

       expectFileToContain('index.ts', `import { someImport, DOCUMENT } from '@angular/common';`);
       expectFileToContain(
           'index.ts', `import { anotherImport } from '@angular/platform-browser';`);
     });
});
