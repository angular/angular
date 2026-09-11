/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('smart selection ranges', () => {
  it('should expand through control flow blocks in an external template', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          show = true;
          name = 'name';
        }`,
      'app.html': '<div>@if (show) {<span>{{name}}</span>}</div>',
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('{{na¦me}}');
    const chain = selectionChainText(appFile.getSmartSelectionRange(), files['app.html']);
    expect(chain).toEqual([
      '{{name}}',
      '<span>{{name}}</span>',
      '@if (show) {<span>{{name}}</span>}',
      '<div>@if (show) {<span>{{name}}</span>}</div>',
    ]);
  });

  it('should expand nested @if blocks one step at a time', () => {
    const template = ['@if (outer) {', '  @if (inner) {', '    <b>text</b>', '  }', '}'].join('\n');
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          outer = true;
          inner = true;
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('te¦xt');
    const chain = selectionChainText(appFile.getSmartSelectionRange(), template);
    expect(chain).toEqual([
      'text',
      '<b>text</b>',
      '\n    <b>text</b>\n  ',
      '@if (inner) {\n    <b>text</b>\n  }',
      '\n  @if (inner) {\n    <b>text</b>\n  }\n',
      '@if (outer) {\n  @if (inner) {\n    <b>text</b>\n  }\n}',
    ]);
  });

  it('should only include the main block of @for when expanding from its body', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '@for (item of items; track item) {<i>{{item}}</i>} @empty {none}',
          standalone: false,
        })
        export class AppCmp {
          items = ['a'];
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('{{ite¦m}}');
    const chain = selectionChainText(appFile.getSmartSelectionRange(), files['app.ts']);
    expect(chain).toContain('@for (item of items; track item) {<i>{{item}}</i>}');
    expect(chain).toContain('@for (item of items; track item) {<i>{{item}}</i>} @empty {none}');
    // The chain continues beyond the inline template into the TypeScript file.
    expect(chain[chain.length - 1]).toContain('@Component');
  });

  it('should expand from the secondary block of @for to the whole block', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '@for (item of items; track item) {<i>{{item}}</i>} @empty {none}',
          standalone: false,
        })
        export class AppCmp {
          items = ['a'];
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('no¦ne');
    const chain = selectionChainText(appFile.getSmartSelectionRange(), files['app.ts']);
    expect(chain).toContain('@empty {none}');
    expect(chain).toContain('@for (item of items; track item) {<i>{{item}}</i>} @empty {none}');
  });

  it('should expand through @switch cases', () => {
    const template = ["@switch (status) {@case ('on') {<b>on</b>} @default {off}}"].join('\n');
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          status = 'on';
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('<b>o¦n</b>');
    const chain = selectionChainText(appFile.getSmartSelectionRange(), template);
    expect(chain).toContain("@case ('on') {<b>on</b>}");
    expect(chain).toContain("@switch (status) {@case ('on') {<b>on</b>} @default {off}}");
  });

  it('should fall back to TypeScript outside of templates', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '{{greeting}}',
          standalone: false,
        })
        export class AppCmp {
          greeting = 'hello world';
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText(`greeting = 'hello wor¦ld';`);
    const chain = selectionChainText(appFile.getSmartSelectionRange(), files['app.ts']);
    expect(chain).toContain(`greeting = 'hello world';`);
  });
});

function selectionChainText(range: ts.SelectionRange, contents: string): string[] {
  const result: string[] = [];
  let current: ts.SelectionRange | undefined = range;
  while (current !== undefined) {
    result.push(
      contents.substring(current.textSpan.start, current.textSpan.start + current.textSpan.length),
    );
    current = current.parent;
  }
  return result;
}
