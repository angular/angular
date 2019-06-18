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

describe('Google3 injectable pipe TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/injectablePipeRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR'] !, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile(
        {rules: {'injectable-pipe': true}, linterOptions: {typeCheck: true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName) !.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) { return readFileSync(join(tmpDir, fileName), 'utf8'); }

  it('should report pipes that are not marked as Injectable', () => {
    writeFile('index.ts', `
      import { Pipe } from '@angular/core';

      @Pipe({ name: 'myPipe' })
      export class MyPipe {
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/@Pipe should be decorated with @Injectable/);
  });

  it('should add @Injectable to pipes that do not have it', () => {
    writeFile('/index.ts', `
      import { Pipe } from '@angular/core';

      @Pipe({ name: 'myPipe' })
      export class MyPipe {
      }
    `);

    runTSLint();
    expect(getFile('/index.ts'))
        .toMatch(/@Injectable\(\)\s+@Pipe\(\{ name: 'myPipe' \}\)\s+export class MyPipe/);
  });

  it('should add an import for Injectable to the @angular/core import declaration', () => {
    writeFile('/index.ts', `
      import { Pipe } from '@angular/core';

      @Pipe()
      export class MyPipe {
      }
    `);

    runTSLint();

    const content = getFile('/index.ts');
    expect(content).toContain('import { Pipe, Injectable } from \'@angular/core\'');
    expect((content.match(/import/g) || []).length).toBe(1, 'Expected only one import statement');
  });

});
