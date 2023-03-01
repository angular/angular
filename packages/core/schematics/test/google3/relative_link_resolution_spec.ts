/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 relativeLinkResolution TSLint rule', () => {
  let tmpDir: string;
  const rulesDirectory = dirname(
      runfiles.resolvePackageRelative('../../migrations/google3/relativeLinkResolutionCjsRule.js'));

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
    const config = Configuration.parseConfigFile({rules: {'relativeLinkResolutionCjs': true}});

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

  // This is just a sanity check for the TSLint configuration;
  // see test/relative_link_resolution_spec.ts for the full test suite.
  it('should migrate a simple example', () => {
    writeFile('/index.ts', `
      import { RouterModule } from '@angular/router';

      let providers = RouterModule.forRoot([], {
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always',
        relativeLinkResolution: 'legacy',
        enableTracing: false,
      });
    `);

    runTSLint(true);
    const content = getFile(`/index.ts`);
    expect(content).not.toContain('relativeLinkResolution');
  });
});
