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
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), files['app.html']);
    expect(chain).toEqual([
      'name',
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
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(chain).toEqual([
      'text',
      '<b>text</b>',
      '\n    <b>text</b>\n  ',
      '@if (inner) {\n    <b>text</b>\n  }',
      '\n  @if (inner) {\n    <b>text</b>\n  }\n',
      '@if (outer) {\n  @if (inner) {\n    <b>text</b>\n  }\n}',
    ]);
  });

  it('should not create spans that cross the branches of a multi-branch @if', () => {
    const template = '@if (a) {one} @else if (b) {two} @else {three}';
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          a = true;
          b = true;
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('thr¦ee');
    expect(selectionChainText(appFile.getTemplateSelectionRange(), template)).toEqual([
      'three',
      '@else {three}',
      '@if (a) {one} @else if (b) {two} @else {three}',
    ]);

    appFile.moveCursorToText('{tw¦o}');
    expect(selectionChainText(appFile.getTemplateSelectionRange(), template)).toEqual([
      'two',
      '@else if (b) {two}',
      '@if (a) {one} @else if (b) {two} @else {three}',
    ]);
  });

  it('should expand through the expression of an interpolation', () => {
    const template = '<span>{{ user.address.city }}</span>';
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          user = {address: {city: 'Rome'}};
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('ci¦ty');
    expect(selectionChainText(appFile.getTemplateSelectionRange(), template)).toEqual([
      'user.address.city',
      '{{ user.address.city }}',
      '<span>{{ user.address.city }}</span>',
    ]);

    appFile.moveCursorToText('addr¦ess');
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(chain).toContain('user.address');
    expect(chain).toContain('user.address.city');
  });

  it('should expand through the expressions of property and event bindings', () => {
    const template = '<button [id]="user.address.city" (click)="save(user)">go</button>';
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          user = {address: {city: 'Rome'}};
          save(user: object) {}
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('[id]="user.addr¦ess.city"');
    const propertyChain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(propertyChain).toContain('user.address');
    expect(propertyChain).toContain('user.address.city');
    expect(propertyChain).toContain('[id]="user.address.city"');

    appFile.moveCursorToText('save(us¦er)');
    const eventChain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(eventChain).toContain('user');
    expect(eventChain).toContain('save(user)');
    expect(eventChain).toContain('(click)="save(user)"');
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
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), files['app.ts']);
    expect(chain).toContain('@for (item of items; track item) {<i>{{item}}</i>}');
    // The chain stops at the template boundary; the editor merges it with the
    // ranges of the TypeScript provider.
    expect(chain[chain.length - 1]).toEqual(
      '@for (item of items; track item) {<i>{{item}}</i>} @empty {none}',
    );
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
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), files['app.ts']);
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
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(chain).toContain("@case ('on') {<b>on</b>}");
    expect(chain).toContain("@switch (status) {@case ('on') {<b>on</b>} @default {off}}");
  });

  it('should expand through the blocks of @defer', () => {
    const template = '@defer {<b>ok</b>} @placeholder {<i>ph</i>} @loading {load} @error {err}';
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {}`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('<b>o¦k</b>');
    expect(selectionChainText(appFile.getTemplateSelectionRange(), template)).toEqual([
      'ok',
      '<b>ok</b>',
      '@defer {<b>ok</b>}',
      '@defer {<b>ok</b>} @placeholder {<i>ph</i>} @loading {load} @error {err}',
    ]);

    appFile.moveCursorToText('<i>p¦h</i>');
    expect(selectionChainText(appFile.getTemplateSelectionRange(), template)).toEqual([
      'ph',
      '<i>ph</i>',
      '@placeholder {<i>ph</i>}',
      '@defer {<b>ok</b>} @placeholder {<i>ph</i>} @loading {load} @error {err}',
    ]);
  });

  it('should expand through the value of a @let declaration', () => {
    const template = '@let city = user.address.city;<span>{{city}}</span>';
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          user = {address: {city: 'Rome'}};
        }`,
      'app.html': template,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('address.ci¦ty;');
    const chain = selectionChainText(appFile.getTemplateSelectionRange(), template);
    expect(chain).toContain('user.address.city');
    expect(chain).toContain('@let city = user.address.city;');
  });

  it('should return undefined outside of templates', () => {
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
    // The editor is expected to fall back to its TypeScript provider.
    expect(appFile.getTemplateSelectionRange()).toBeUndefined();
  });
});

function selectionChainText(range: ts.SelectionRange | undefined, contents: string): string[] {
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
