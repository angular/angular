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

describe('Google3 path match type', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/pathMatchTypeRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('router.d.ts', `
      export declare class UrlTree {
      }
    `);
    writeFile('rxjs.d.ts', `
      export declare class Observable<T>{}
    `);
    writeFile('operators.d.ts', `
      export declare function map(): void;
    `);

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
    const config = Configuration.parseConfigFile({rules: {'path-match-type': true}});

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


  it('should migrate Route literal', async () => {
    writeFile('/index.ts', `
      const route = {path: 'abc', pathMatch: 'full'};
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`import { Route } from "@angular/router";`);
    expect(content).toContain(`const route: Route = {path: 'abc', pathMatch: 'full'};`);
  });

  it('should migrate Routes literal', async () => {
    writeFile('/index.ts', `
      const routes = [{path: 'abc', pathMatch: 'full'}];
    `);


    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`import { Routes } from "@angular/router";`);
    expect(content).toContain(`const routes: Routes = [{path: 'abc', pathMatch: 'full'}];`);
  });

  it('should migrate Routes with children', async () => {
    writeFile('/index.ts', `
      const routes = [{path: 'home', children: [{path: 'abc', pathMatch: 'full'}]}];
    `);


    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `const routes: Routes = [{path: 'home', children: [{path: 'abc', pathMatch: 'full'}]}];`);
  });

  it('should NOT migrate Route if it already has an explicit type', async () => {
    writeFile('/index.ts', `
      export interface OtherType {}
      const routes: OtherType = {path: 'abc', pathMatch: 'full'};
    `);


    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`const routes: OtherType = {path: 'abc', pathMatch: 'full'};`);
  });

  it('should NOT migrate Routes if it already has an explicit type', async () => {
    writeFile('/index.ts', `
      export interface OtherType {}
      const routes: OtherType = [{path: 'abc', pathMatch: 'full'}];
    `);


    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`const routes: OtherType = [{path: 'abc', pathMatch: 'full'}];`);
  });
});
