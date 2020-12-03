/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnvironment} from '@angular/language-service/ivy/test/env';
import * as ts from 'typescript';
import {createModuleWithDeclarations} from './test_utils';

describe('getSemanticDiagnostics', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should not produce error for a minimal component defintion', () => {
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: ''
      })
      export class AppComponent {}
    `
    };
    const env = createModuleWithDeclarations([appFile]);

    const diags = env.ngLS.getSemanticDiagnostics(absoluteFrom('/app.ts'));
    expect(diags.length).toEqual(0);
  });

  it('should report member does not exist', () => {
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: '{{nope}}'
      })
      export class AppComponent {}
    `
    };
    const env = createModuleWithDeclarations([appFile]);

    const diags = env.ngLS.getSemanticDiagnostics(absoluteFrom('/app.ts'));
    expect(diags.length).toBe(1);
    const {category, file, start, length, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/app.ts');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'AppComponent'.`);
  });

  it('should process external template', () => {
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {}
    `
    };
    const templateFile = {
      name: absoluteFrom('/app.html'),
      contents: `
      Hello world!
    `
    };

    const env = createModuleWithDeclarations([appFile], [templateFile]);
    const diags = env.ngLS.getSemanticDiagnostics(absoluteFrom('/app.html'));
    expect(diags).toEqual([]);
  });

  it('should report member does not exist in external template', () => {
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {}
    `
    };
    const templateFile = {name: absoluteFrom('/app.html'), contents: `{{nope}}`};

    const env = createModuleWithDeclarations([appFile], [templateFile]);
    const diags = env.ngLS.getSemanticDiagnostics(absoluteFrom('/app.html'));
    expect(diags.length).toBe(1);
    const {category, file, start, length, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/app.html');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'AppComponent'.`);
  });

  it('should report a parse error in external template', () => {
    const appFile = {
      name: absoluteFrom('/app.ts'),
      contents: `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {
        nope = false;
      }
    `
    };
    const templateFile = {name: absoluteFrom('/app.html'), contents: `{{nope = true}}`};

    const env = createModuleWithDeclarations([appFile], [templateFile]);
    const diags = env.ngLS.getSemanticDiagnostics(absoluteFrom('/app.html'));
    expect(diags.length).toBe(1);

    const {category, file, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/app.html');
    expect(messageText)
        .toBe(
            `Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = true}}] in /app.html@0:0`);
  });
});
