/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, assertTextSpans, createModuleAndProjectWithDeclarations, humanizeDocumentSpanLike, LanguageServiceTestEnv, OpenBuffer} from '../testing';

describe('definitions', () => {
  it('gets definition for template reference in overridden template', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '',
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({templateUrl: '/app.html'})
        export class AppCmp {}
      `,
    };
    const env = LanguageServiceTestEnv.setup();

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.contents = '<input #myInput /> {{myInput.value}}';
    project.expectNoSourceDiagnostics();

    template.moveCursorToText('{{myIn¦put.value}}');
    const {definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(definitions![0].name).toEqual('myInput');
    assertFileNames(Array.from(definitions!), ['app.html']);
  });

  it('returns the pipe definitions when checkTypeOfPipes is false', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}
      `,
      'app.html': '{{"1/1/2020" | date}}'
    };
    // checkTypeOfPipes is set to false when strict templates is false
    const env = LanguageServiceTestEnv.setup();
    const project =
        createModuleAndProjectWithDeclarations(env, 'test', files, {strictTemplates: false});
    const template = project.openFile('app.html');
    project.expectNoSourceDiagnostics();
    template.moveCursorToText('da¦te');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.substr(textSpan.start, textSpan.length)).toEqual('date');
    expect(definitions.length).toEqual(3);
    assertTextSpans(definitions, ['transform']);
    assertFileNames(definitions, ['index.d.ts']);
  });

  it('gets definitions for all inputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}
      `,
      'app.html': '<div dir inputA="abc"></div>',
      'dir.ts': `
      import {Directive, Input} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {
        @Input() inputA!: any;
      }`,
      'dir2.ts': `
      import {Directive, Input} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir2 {
        @Input() inputA!: any;
      }`

    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('inpu¦tA="abc"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.substr(textSpan.start, textSpan.length)).toEqual('inputA');

    expect(definitions!.length).toEqual(2);
    const [def, def2] = definitions!;
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    // TODO(atscott): investigate why the text span includes more than just 'inputA'
    // assertTextSpans([def, def2], ['inputA']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all outputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '<div dir (someEvent)="doSomething()"></div>',
      'dir.ts': `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {
        @Output() someEvent = new EventEmitter<void>();
      }`,
      'dir2.ts': `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir2 {
        @Output() someEvent = new EventEmitter<void>();
      }`,
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {
          doSomething() {}
        }
      `
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('(someEv¦ent)');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.substr(textSpan.start, textSpan.length)).toEqual('someEvent');

    expect(definitions.length).toEqual(2);
    const [def, def2] = definitions;
    expect(def.textSpan).toContain('someEvent');
    expect(def2.textSpan).toContain('someEvent');
    // TODO(atscott): investigate why the text span includes more than just 'someEvent'
    // assertTextSpans([def, def2], ['someEvent']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('should go to the pre-compiled style sheet', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: '',
        styleUrls: ['./style.css'],
      })
      export class AppCmp {}
      `,
      'style.scss': '',
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText(`['./styl¦e.css']`);
    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, appFile);
    expect(appFile.contents.substr(textSpan.start, textSpan.length)).toEqual('./style.css');

    expect(definitions.length).toEqual(1);
    assertFileNames(definitions, ['style.scss']);
  });

  it('gets definition for property of variable declared in template', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': `
        <ng-container *ngIf="{prop: myVal} as myVar">
          {{myVar.prop.name}}
        </ng-container>
      `,
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({templateUrl: '/app.html'})
        export class AppCmp {
          myVal = {name: 'Andrew'};
        }
      `,
    };
    const env = LanguageServiceTestEnv.setup();

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    project.expectNoSourceDiagnostics();

    template.moveCursorToText('{{myVar.pro¦p.name}}');
    const {definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(definitions![0].name).toEqual('"prop"');
    assertFileNames(Array.from(definitions!), ['app.html']);
  });

  function getDefinitionsAndAssertBoundSpan(env: LanguageServiceTestEnv, file: OpenBuffer) {
    env.expectNoSourceDiagnostics();
    const definitionAndBoundSpan = file.getDefinitionAndBoundSpan();
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(definitions).toBeTruthy();
    return {textSpan, definitions: definitions!.map(d => humanizeDocumentSpanLike(d, env))};
  }
});
