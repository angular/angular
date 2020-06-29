/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 noTemplateVariableAssignment TSLint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/noTemplateVariableAssignmentRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  /** Runs TSLint with the no-template-variable TSLint rule.*/
  function runTSLint() {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix: false, rulesDirectory: [rulesDirectory]}, program);
    const config =
        Configuration.parseConfigFile({rules: {'no-template-variable-assignment': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  /** Writes a file to the current temporary directory. */
  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  it('should create failure for detected two-way data binding assignment', () => {
    writeFile('index.ts', `
      import {Component} from '@angular/core';

      @Component({template: '<span *ngFor="let i of options" [(a)]="i"></span>'})
      export class MyComp {}
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFileName()).toContain('index.ts');
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 3, character: 68});
    expect(failures[0].getEndPosition().getLineAndCharacter()).toEqual({line: 3, character: 69});
    expect(failures[0].getFailure()).toMatch(/^Found assignment to template variable./);
  });

  it('should create failure with correct offsets for external templates', () => {
    writeFile('index.ts', `
      import {Component} from '@angular/core';

      @Component({templateUrl: './my-tmpl.html'})
      export class MyComp {}
    `);

    writeFile(`my-tmpl.html`, `
      <span *ngFor="let option of options" [(a)]="option"></span>
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFileName()).toContain('my-tmpl.html');
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 1, character: 50});
    expect(failures[0].getEndPosition().getLineAndCharacter()).toEqual({line: 1, character: 56});
    expect(failures[0].getFailure()).toMatch(/^Found assignment to template variable./);
  });

  it('should create failure for template variable assignment within output', () => {
    writeFile('index.ts', `
      import {Component} from '@angular/core';

      @Component({templateUrl: './my-tmpl.html'})
      export class MyComp {}
    `);

    writeFile(`my-tmpl.html`, `
      <!-- Comment -->
      <span *ngFor="let option of options" (click)="option = true"></span>
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFileName()).toContain('my-tmpl.html');
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 2, character: 52});
    expect(failures[0].getEndPosition().getLineAndCharacter()).toEqual({line: 2, character: 65});
    expect(failures[0].getFailure()).toMatch(/^Found assignment to template variable./);
  });
});
