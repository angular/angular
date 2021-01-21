/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {extractCursorInfo, LanguageServiceTestEnvironment} from './env';
import {assertFileNames, createModuleWithDeclarations, humanizeDocumentSpanLike} from './test_utils';

describe('definitions', () => {
  it('gets definition for template reference in overridden template', () => {
    initMockFileSystem('Native');
    const templateFile = {contents: '', name: absoluteFrom('/app.html')};
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
        import {Component} from '@angular/core';

        @Component({templateUrl: '/app.html'})
        export class AppCmp {}
      `,
    };

    const env = createModuleWithDeclarations([appFile], [templateFile]);
    const {cursor} = env.updateFileWithCursor(
        absoluteFrom('/app.html'), '<input #myInput /> {{myIn¦put.value}}');
    env.expectNoSourceDiagnostics();
    const {definitions} = env.ngLS.getDefinitionAndBoundSpan(absoluteFrom('/app.html'), cursor)!;
    expect(definitions![0].name).toEqual('myInput');
    assertFileNames(Array.from(definitions!), ['app.html']);
  });

  it('returns the pipe class as definition when checkTypeOfPipes is false', () => {
    initMockFileSystem('Native');
    const {cursor, text} = extractCursorInfo('{{"1/1/2020" | dat¦e}}');
    const templateFile = {contents: text, name: absoluteFrom('/app.html')};
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}
      `,
    };
    // checkTypeOfPipes is set to false when strict templates is false
    const env = createModuleWithDeclarations([appFile], [templateFile], {strictTemplates: false});
    const {textSpan, definitions} =
        getDefinitionsAndAssertBoundSpan(env, absoluteFrom('/app.html'), cursor);
    expect(text.substr(textSpan.start, textSpan.length)).toEqual('date');

    expect(definitions.length).toEqual(1);
    const [def] = definitions;
    expect(def.textSpan).toContain('DatePipe');
    expect(def.contextSpan).toContain('DatePipe');
  });

  it('gets definitions for all inputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const {cursor, text} = extractCursorInfo('<div dir inpu¦tA="abc"></div>');
    const templateFile = {contents: text, name: absoluteFrom('/app.html')};
    const dirFile = {
      name: absoluteFrom('/dir.ts'),
      contents: `
      import {Directive, Input} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {
        @Input() inputA!: any;
      }`,
    };
    const dirFile2 = {
      name: absoluteFrom('/dir2.ts'),
      contents: `
      import {Directive, Input} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir2 {
        @Input() inputA!: any;
      }`,
    };
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}
      `
    };
    const env = createModuleWithDeclarations([appFile, dirFile, dirFile2], [templateFile]);
    const {textSpan, definitions} =
        getDefinitionsAndAssertBoundSpan(env, absoluteFrom('/app.html'), cursor);
    expect(text.substr(textSpan.start, textSpan.length)).toEqual('inputA');

    expect(definitions.length).toEqual(2);
    const [def, def2] = definitions;
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    // TODO(atscott): investigate why the text span includes more than just 'inputA'
    // assertTextSpans([def, def2], ['inputA']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all outputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const {cursor, text} = extractCursorInfo('<div dir (someEv¦ent)="doSomething()"></div>');
    const templateFile = {contents: text, name: absoluteFrom('/app.html')};
    const dirFile = {
      name: absoluteFrom('/dir.ts'),
      contents: `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {
        @Output() someEvent = new EventEmitter<void>();
      }`,
    };
    const dirFile2 = {
      name: absoluteFrom('/dir2.ts'),
      contents: `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir2 {
        @Output() someEvent = new EventEmitter<void>();
      }`,
    };
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {
          doSomething() {}
        }
      `
    };
    const env = createModuleWithDeclarations([appFile, dirFile, dirFile2], [templateFile]);
    const {textSpan, definitions} =
        getDefinitionsAndAssertBoundSpan(env, absoluteFrom('/app.html'), cursor);
    expect(text.substr(textSpan.start, textSpan.length)).toEqual('someEvent');

    expect(definitions.length).toEqual(2);
    const [def, def2] = definitions;
    expect(def.textSpan).toContain('someEvent');
    expect(def2.textSpan).toContain('someEvent');
    // TODO(atscott): investigate why the text span includes more than just 'someEvent'
    // assertTextSpans([def, def2], ['someEvent']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  function getDefinitionsAndAssertBoundSpan(
      env: LanguageServiceTestEnvironment, fileName: AbsoluteFsPath, cursor: number) {
    env.expectNoSourceDiagnostics();
    const definitionAndBoundSpan = env.ngLS.getDefinitionAndBoundSpan(fileName, cursor);
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(definitions).toBeTruthy();
    return {textSpan, definitions: definitions!.map(d => humanizeDocumentSpanLike(d, env))};
  }
});
