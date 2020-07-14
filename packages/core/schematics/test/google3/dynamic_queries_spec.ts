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

describe('Google3 dynamic queries TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/dynamicQueriesRule'));

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
    const config = Configuration.parseConfigFile({rules: {'dynamic-queries': true}});

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

  it('should flag dynamic queries', () => {
    writeFile('/index.ts', `
      import { Directive, ViewChild, ContentChild } from '@angular/core';

      @Directive()
      export class MyDirective {
        @ViewChild('child', { static: false }) child: any;
        @ContentChild('otherChild', { static: false }) otherChild: any;
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(2);
    expect(failures[0].getFailure())
        .toMatch('The static flag defaults to false, so setting it false manually is unnecessary.');
    expect(failures[1].getFailure())
        .toMatch('The static flag defaults to false, so setting it false manually is unnecessary.');
  });

  it('should remove the options object from a dynamic ViewChild query that only has one property',
     () => {
       writeFile('/index.ts', `
        import { Directive, ViewChild } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ViewChild('child', { static: false }) child: any;
        }
      `);

       runTSLint(true);
       expect(getFile('/index.ts')).toContain(`@ViewChild('child') child: any;`);
     });

  it('should remove the options object from a dynamic ContentChild query that only has one property',
     () => {
       writeFile('/index.ts', `
        import { Directive, ContentChild } from '@angular/core';

        @Directive()
        export class MyComponent {
          @ContentChild('child', { static: false }) child: any;
        }
      `);

       runTSLint(true);
       expect(getFile('/index.ts')).toContain(`@ContentChild('child') child: any;`);
     });

  it('should only remove the `static` flag from a ViewChild query if it has more than one property',
     () => {
       writeFile('/index.ts', `
        import { Directive, ViewChild, ElementRef } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ViewChild('child', { read: ElementRef, static: false }) child: ElementRef;
        }
      `);

       runTSLint(true);
       expect(getFile('/index.ts'))
           .toContain(`@ViewChild('child', { read: ElementRef }) child: ElementRef;`);
     });

  it('should only remove the `static` flag from a ContentChild query if it has more than one property',
     () => {
       writeFile('/index.ts', `
        import { Directive, ContentChild, ElementRef } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ContentChild('child', { static: false, read: ElementRef }) child: ElementRef;
        }
      `);

       runTSLint(true);
       expect(getFile('/index.ts'))
           .toContain(`@ContentChild('child', { read: ElementRef }) child: ElementRef;`);
     });

  it('should not change static ViewChild queries', () => {
    writeFile('/index.ts', `
      import { Directive, ViewChild, ElementRef } from '@angular/core';

      @Directive()
      export class MyDirective {
        @ViewChild('child', { read: ElementRef, static: true }) child: ElementRef;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`@ViewChild('child', { read: ElementRef, static: true }) child: ElementRef;`);
  });

  it('should not change static ContentChild queries', () => {
    writeFile('/index.ts', `
      import { Directive, ContentChild, ElementRef } from '@angular/core';

      @Directive()
      export class MyDirective {
        @ContentChild('child', { static: true, read: ElementRef }) child: ElementRef;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`@ContentChild('child', { static: true, read: ElementRef }) child: ElementRef;`);
  });

  it('should migrate dynamic queries on a setter', () => {
    writeFile('/index.ts', `
     import { Directive, ContentChild, ViewChild } from '@angular/core';

     @Directive()
     export class MyDirective {
       @ContentChild('child', { static: false }) set child(c: any) {}
       @ViewChild('otherChild', { static: false }) set otherChild(c: any) {}
     }
   `);

    runTSLint(true);
    const content = getFile('/index.ts');
    expect(content).toContain(`@ContentChild('child') set child(c: any) {}`);
    expect(content).toContain(`@ViewChild('otherChild') set otherChild(c: any) {}`);
  });
});
