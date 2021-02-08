/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';


describe('getSemanticDiagnostics', () => {
  let env: LanguageServiceTestEnv;
  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  it('should not produce error for a minimal component defintion', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: ''
      })
      export class AppComponent {}
    `
    };
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);

    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toEqual(0);
  });

  it('should report member does not exist', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: '{{nope}}'
      })
      export class AppComponent {}
    `
    };
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);

    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toBe(1);
    const {category, file, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/test/app.ts');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'AppComponent'.`);
  });

  it('should process external template', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {}
    `,
      'app.html': `Hello world!`
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    expect(diags).toEqual([]);
  });

  it('should report member does not exist in external template', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {}
    `,
      'app.html': '{{nope}}'
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    expect(diags.length).toBe(1);
    const {category, file, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/test/app.html');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'AppComponent'.`);
  });

  it('should report a parse error in external template', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {
        nope = false;
      }
    `,
      'app.html': '{{nope = true}}'
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    expect(diags.length).toBe(1);

    const {category, file, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe('/test/app.html');
    expect(messageText)
        .toContain(
            `Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = true}}]`);
  });

  it('should report parse errors of components defined in the same ts file', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({ templateUrl: './app1.html' })
      export class AppComponent1 { nope = false; }

      @Component({ templateUrl: './app2.html' })
      export class AppComponent2 { nope = false; }
    `,
      'app1.html': '{{nope = false}}',
      'app2.html': '{{nope = true}}',
      'app-module.ts': `
        import {NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';
        import {AppComponent, AppComponent2} from './app';

        @NgModule({
          declarations: [AppComponent, AppComponent2],
          imports: [CommonModule],
        })
        export class AppModule {}
    `
    };

    const project = env.addProject('test', files);
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.map(x => x.messageText).sort()).toEqual([
      'Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = false}}] in /test/app1.html@0:0',
      'Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = true}}] in /test/app2.html@0:0'
    ]);
  });

  it('reports a diagnostic for a component without a template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';
      @Component({})
      export class MyComponent {}
    `
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.map(x => x.messageText)).toEqual([
      'component is missing a template',
    ]);
  });
});
