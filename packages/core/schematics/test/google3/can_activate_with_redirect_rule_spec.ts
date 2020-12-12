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

describe('Google3 canActivate with redirectTo', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/canActivateWithRedirectToRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'can-activate-with-redirect-to': true}});

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

  it('should not flag canActivate when redirectTo is not present', async () => {
    writeFile('/index.ts', `const route = {path: '', canActivate: ['my_guard_token']}`);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(0);
  });

  it('should flag when canActivate when redirectTo is present', async () => {
    writeFile(
        '/index.ts',
        `const route = {path: '', redirectTo: 'other', canActivate: ['my_guard_token']}`);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(1);
    expect(failures[0]).toMatch(/canActivate cannot be used with redirectTo./);
  });

  it('should fix when canActivate when redirectTo is present', async () => {
    writeFile(
        '/index.ts',
        `const route = {path: '', redirectTo: 'other', canActivate: ['my_guard_token']}`);

    runTSLint(true);
    const content = getFile('/index.ts');
    expect(content).toContain(`const route = { path: '', redirectTo: 'other' }`);
  });
});
