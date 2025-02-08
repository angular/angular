/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('get outlining spans', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should get block outlining spans for an inline template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @if (1) { if body }
        \`,
        standalone: false,
      })
      export class AppCmp {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const result = appFile.getOutliningSpans();
    const {textSpan} = result[0];
    expect(files['app.ts'].substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      ' if body ',
    );
  });

  it('should get block outlining spans for an external template', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
        }`,
      'app.html': '@defer { lazy text }',
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    const result = appFile.getOutliningSpans();
    const {textSpan} = result[0];
    expect(files['app.html'].substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      ' lazy text ',
    );
  });

  it('should have outlining spans for all defer block parts', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: \`
          @defer {
            defer main block
          } @placeholder {
            defer placeholder block
          } @error {
            defer error block
          } @loading {
            defer loading block
          }
          \`,
          standalone: false,
        })
        export class AppCmp {
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const result = appFile.getOutliningSpans();
    expect(getTrimmedSpanText(result[0].textSpan, files['app.ts'])).toEqual('defer main block');
    expect(getTrimmedSpanText(result[1].textSpan, files['app.ts'])).toEqual(
      'defer placeholder block',
    );
    expect(getTrimmedSpanText(result[2].textSpan, files['app.ts'])).toEqual('defer loading block');
    expect(getTrimmedSpanText(result[3].textSpan, files['app.ts'])).toEqual('defer error block');
  });

  it('should have outlining spans for all connected if blocks', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: \`
          @if (val1) {
            if1
          } @else if (val2) {
            elseif2
          } @else if (val3) {
            elseif3
          } @else {
            else block
          }
          \`,
          standalone: false,
        })
        export class AppCmp {
          val1: any;
          val2: any;
          val3: any;
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const result = appFile.getOutliningSpans();
    expect(getTrimmedSpanText(result[0].textSpan, files['app.ts'])).toEqual('if1');
    expect(getTrimmedSpanText(result[1].textSpan, files['app.ts'])).toEqual('elseif2');
    expect(getTrimmedSpanText(result[2].textSpan, files['app.ts'])).toEqual('elseif3');
    expect(getTrimmedSpanText(result[3].textSpan, files['app.ts'])).toEqual('else block');
  });

  it('should have outlining spans for all switch cases, including the main', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: \`
          @switch (test) {
            @case ('test') {
                yes
            } @case ('x') {
                definitely not
            } @case ('y') {
                stop trying
            } @default {
                just in case
            }
          }
          \`,
          standalone: false,
        })
        export class AppCmp {
            test = 'test';
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const result = appFile.getOutliningSpans();
    expect(getTrimmedSpanText(result[0].textSpan, files['app.ts'])).toMatch(
      /case..'test'.*default.*\}/,
    );
    expect(getTrimmedSpanText(result[1].textSpan, files['app.ts'])).toEqual('yes');
    expect(getTrimmedSpanText(result[2].textSpan, files['app.ts'])).toEqual('definitely not');
    expect(getTrimmedSpanText(result[3].textSpan, files['app.ts'])).toEqual('stop trying');
    expect(getTrimmedSpanText(result[4].textSpan, files['app.ts'])).toEqual('just in case');
  });

  it('should have outlining spans for repeater and empty block', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: \`
          @for (item of items; track $index) {
            {{item}}
          } @empty {
            empty list
          }
          \`,
          standalone: false,
        })
        export class AppCmp {
            items = [];
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const result = appFile.getOutliningSpans();
    expect(getTrimmedSpanText(result[0].textSpan, files['app.ts'])).toEqual('{{item}}');
    expect(getTrimmedSpanText(result[1].textSpan, files['app.ts'])).toEqual('empty list');
  });
});

function getTrimmedSpanText(span: ts.TextSpan, contents: string) {
  return trim(contents.substring(span.start, span.start + span.length));
}

function trim(text: string | null): string {
  return text ? text.replace(/[\s\n]+/gm, ' ').trim() : '';
}
