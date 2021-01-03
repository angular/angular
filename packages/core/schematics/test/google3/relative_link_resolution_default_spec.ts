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

describe('Google3 relativeLinkResolution TSLint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/relativeLinkResolutionDefaultRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);
    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({
      rules: {'relative-link-resolution-default': true},
    });

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

  it('should flag forRoot with no options', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([]),
          ]
        })
        export class AppModule {
        }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(1);
    expect(failures[0])
        .toBe(
            'The relativeLinkResolution default is changing from `legacy` to `corrected`. To keep' +
            ' behavior consistent when the change is merged, specify `legacy` rather than using the default.');
  });

  it('should migrate forRoot with no options', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([]),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })`);
  });

  it('should migrate options without relativeLinkResolution', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([], {useHash: true}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`RouterModule.forRoot([], { useHash: true, relativeLinkResolution: 'legacy' })`);
  });

  it('should not migrate options containing relativeLinkResolution', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';
        @NgModule({
          imports: [
            RouterModule.forRoot([], {relativeLinkResolution: 'corrected'}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`RouterModule.forRoot([], {relativeLinkResolution: 'corrected'})`);
  });

  it('should migrate when options is a variable with AsExpression', () => {
    writeFile('/index.ts', `
        import { ExtraOptions } from '@angular/router';
        const options = {useHash: true} as ExtraOptions;
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `const options = { useHash: true, relativeLinkResolution: 'legacy' } as ExtraOptions;`);
  });

  it('should migrate when options is a variable', () => {
    writeFile('/index.ts', `
        import { ExtraOptions } from '@angular/router';
        const options: ExtraOptions = {useHash: true};
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `const options: ExtraOptions = { useHash: true, relativeLinkResolution: 'legacy' };`);
  });

  it('should migrate when options is a variable with no type', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { ExtraOptions, RouterModule } from '@angular/router';

        const options = {useHash: true};

        @NgModule({
          imports: [
            RouterModule.forRoot([], options),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const options = { useHash: true, relativeLinkResolution: 'legacy' };`);
    expect(getFile('/index.ts')).toContain(`RouterModule.forRoot([], options)`);
  });

  it('should migrate when aliased options is a variable', () => {
    writeFile('/index.ts', `
        import { ExtraOptions as RouterExtraOptions } from '@angular/router';
        const options: RouterExtraOptions = {useHash: true};
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(
            `const options: RouterExtraOptions = { useHash: true, relativeLinkResolution: 'legacy' };`);
  });

  it('should migrate aliased RouterModule.forRoot', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule as AngularRouterModule} from '@angular/router';
        @NgModule({
          imports: [
            AngularRouterModule.forRoot([]),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`AngularRouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),`);
  });
});
