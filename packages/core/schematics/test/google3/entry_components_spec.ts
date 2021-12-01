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

describe('Google3 entryComponents TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/entryComponentsRule'));
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {module: 'es2015', baseUrl: './'},
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'entryComponents': true}});

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


  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }

  it('should flag entryComponents in NgModule', () => {
    writeFile('/index.ts', `
      import { NgModule, Component } from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}

      @NgModule({
        declarations: [MyComp],
        entryComponents: [MyComp],
        exports: [MyComp]
      })
      export class MyModule {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(1);
    expect(failures[0]).toMatch(/entryComponents are deprecated and don't need to be passed in/);
  });

  it('should flag entryComponents in Component', () => {
    writeFile('/index.ts', `
      import { Component } from '@angular/core';

      @Component({selector: 'comp-a', template: ''})
      export class CompA {}

      @Component({
        selector: 'comp-b',
        entryComponents: [CompA],
        template: ''
      })
      export class CompB {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(1);
    expect(failures[0]).toMatch(/entryComponents are deprecated and don't need to be passed in/);
  });

  it('should remove `entryComponents` usages from NgModule', () => {
    writeFile('/index.ts', `
      import { NgModule, Component } from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}

      @NgModule({
        declarations: [MyComp],
        entryComponents: [MyComp],
        exports: [MyComp]
      })
      export class MyModule {}
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      @NgModule({
        declarations: [MyComp],
        exports: [MyComp]
      })
    `));
  });

  it('should remove `entryComponents` usages from Component', () => {
    writeFile('/index.ts', `
      import { Component } from '@angular/core';

      @Component({selector: 'comp-a', template: ''})
      export class CompA {}

      @Component({
        selector: 'comp-b',
        entryComponents: [CompA],
        template: ''
      })
      export class CompB {}
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      @Component({
        selector: 'comp-b',
        template: ''
      })
    `));
  });

  it('should remove multiple `entryComponents` usages from a single file', () => {
    writeFile('/index.ts', `
      import { NgModule, Component } from '@angular/core';

      @Component({selector: 'comp-a', template: ''})
      export class CompA {}

      @Component({
        selector: 'comp-b',
        entryComponents: [CompA],
        template: ''
      })
      export class CompB {}

      @NgModule({
        declarations: [CompA, CompB],
        entryComponents: [CompB],
        exports: [CompA, CompB]
      })
      export class MyModule {}
    `);

    runTSLint(true);

    const content = stripWhitespace(getFile('/index.ts'));

    expect(content).toContain(stripWhitespace(`
      @Component({
        selector: 'comp-b',
        template: ''
      })
    `));

    expect(content).toContain(stripWhitespace(`
      @NgModule({
        declarations: [CompA, CompB],
        exports: [CompA, CompB]
      })
    `));
  });

  it('should not remove `entryComponents` usages from decorators that do not come from Angular',
     () => {
       writeFile('/index.ts', `
        import { Component } from '@angular/core';
        import { NgModule } from '@not-angular/core';

        @Component({selector: 'my-comp', template: ''})
        export class MyComp {}

        @NgModule({
          declarations: [MyComp],
          entryComponents: [MyComp],
          exports: [MyComp]
        })
        export class MyModule {}
      `);

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
        @NgModule({
          declarations: [MyComp],
          entryComponents: [MyComp],
          exports: [MyComp]
        })
      `));
     });
});
