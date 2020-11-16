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

describe('Google3 initial navigation tslint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/initialNavigationRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'initial-navigation': true}});

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

  it('should migrate legacy_disabled to disabled', () => {
    writeFile('/index.ts', `
      import { NgModule } from '@angular/core';
      import { RouterModule } from '@angular/router';

      @NgModule({
        imports: [
          RouterModule.forRoot([], {initialNavigation: 'legacy_disabled'}),
        ]
      })
      export class AppModule {
      }
    `);


    runTSLint();

    expect(getFile('/index.ts')).toContain(`{initialNavigation: 'disabled'}`);
  });

  it(`should migrate false to disabled`, () => {
    writeFile('/index.ts', `
      import { NgModule } from '@angular/core';
      import { RouterModule } from '@angular/router';

      @NgModule({
        imports: [
          RouterModule.forRoot([], {initialNavigation: false}),
        ]
      })
      export class AppModule {
      }
    `);

    runTSLint();

    expect(getFile('/index.ts')).toContain(`{initialNavigation: 'disabled'}`);
  });

  it('should migrate legacy_enabled to enabledNonBlocking', () => {
    writeFile('/index.ts', `
      import { NgModule } from '@angular/core';
      import { RouterModule } from '@angular/router';

      @NgModule({
        imports: [
          RouterModule.forRoot([], {initialNavigation: 'legacy_enabled'}),
        ]
      })
      export class AppModule {
      }
    `);

    runTSLint(true);

    expect(getFile('/index.ts')).toContain(`{initialNavigation: 'enabledNonBlocking'}`);
  });

  it(`should migrate true to enabledNonBlocking`, () => {
    writeFile('/index.ts', `
      mport { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: true}),
          ]
        })
        export class AppModule {
        }
    `);

    runTSLint(true);

    expect(getFile('/index.ts')).toContain(`{initialNavigation: 'enabledNonBlocking'}`);
  });

  it('should migrate nested objects', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'legacy_disabled', ...options}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(getFile('/index.ts')).toContain(`{initialNavigation: 'disabled', ...options}`);
  });

  it('should migrate nested objects mixed validity', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {initialNavigation: 'disabled', ...options}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
  });

  it('should migrate nested objects opposite order', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {...options, initialNavigation: 'legacy_disabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(getFile('/index.ts')).toContain(`{...options, initialNavigation: 'disabled'}`);
  });

  it('should migrate nested objects mixed validity opposite order', () => {
    writeFile('/index.ts', `
        import { NgModule } from '@angular/core';
        import { RouterModule } from '@angular/router';

        const options = {initialNavigation: 'legacy_enabled'};

        @NgModule({
          imports: [
            RouterModule.forRoot([], {...options, initialNavigation: 'disabled'}),
          ]
        })
        export class AppModule {
        }
      `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`const options = {initialNavigation: 'enabledNonBlocking'};`);
    expect(getFile('/index.ts')).toContain(`{...options, initialNavigation: 'disabled'}`);
  });
});
