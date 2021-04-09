/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';


describe('getSemanticDiagnostics', () => {
  let env: LanguageServiceTestEnv;
  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  it('should not produce error for a minimal component definition', () => {
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

  it('should not report external template diagnostics on the TS file', () => {
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
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags).toEqual([]);
  });

  it('should report diagnostics in inline templates', () => {
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';

        @Component({
          template: '{{nope}}',
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

  it('reports html parse errors along with typecheck errors as diagnostics', () => {
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
      'app.html': '<dne'
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    expect(diags.length).toBe(2);

    expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
    expect(diags[0].file?.fileName).toBe('/test/app.html');
    expect(diags[0].messageText).toContain(`'dne' is not a known element`);

    expect(diags[1].category).toBe(ts.DiagnosticCategory.Error);
    expect(diags[1].file?.fileName).toBe('/test/app.html');
    expect(diags[1].messageText).toContain(`Opening tag "dne" not terminated.`);
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
    const diags1 = project.getDiagnosticsForFile('app1.html');
    expect(diags1.length).toBe(1);
    expect(diags1[0].messageText)
        .toBe(
            'Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = false}}] in /test/app1.html@0:0');

    const diags2 = project.getDiagnosticsForFile('app2.html');
    expect(diags2.length).toBe(1);
    expect(diags2[0].messageText)
        .toBe(
            'Parser Error: Bindings cannot contain assignments at column 8 in [{{nope = true}}] in /test/app2.html@0:0');
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

  it('reports a warning when the project configuration prevents good type inference', () => {
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          template: '<div *ngFor="let user of users">{{user}}</div>',
        })
        export class MyComponent {
          users = ['Alpha', 'Beta'];
        }
      `
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files, {
      // Disable `strictTemplates`.
      strictTemplates: false,
      // Use `fullTemplateTypeCheck` mode instead.
      fullTemplateTypeCheck: true,
    });
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toBe(1);
    const diag = diags[0];
    expect(diag.code).toBe(ngErrorCode(ErrorCode.SUGGEST_SUBOPTIMAL_TYPE_INFERENCE));
    expect(diag.category).toBe(ts.DiagnosticCategory.Suggestion);
    expect(getTextOfDiagnostic(diag)).toBe('user');
  });

  it('should process a component that would otherwise require an inline TCB', () => {
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        interface PrivateInterface {}

        @Component({
          template: 'Simple template',
        })
        export class MyComponent<T extends PrivateInterface> {}
      `
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toBe(0);
  });

  it('logs perf tracing', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';
        @Component({ template: '' })
        export class MyComponent {}
      `
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);

    const logger = project.getLogger();
    spyOn(logger, 'hasLevel').and.returnValue(true);
    spyOn(logger, 'perftrc').and.callFake(() => {});

    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toEqual(0);
    expect(logger.perftrc)
        .toHaveBeenCalledWith(jasmine.stringMatching(
            /LanguageService\#LsDiagnostics\:.*\"LsDiagnostics\":\s*\d+.*/g));
  });

  it('does not produce diagnostics when pre-compiled file is found', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          styleUrls: ['./one.css', './two/two.css', './three.css', '../test/four.css'],
        })
        export class MyComponent {}
      `,
      'one.scss': '',
      'two/two.sass': '',
      'three.less': '',
      'four.styl': '',
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toBe(0);
  });

  it('produces missing resource diagnostic for missing css', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          styleUrls: ['./missing.css'],
        })
        export class MyComponent {}
      `,
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.ts');
    expect(diags.length).toBe(1);
    const diag = diags[0];
    expect(diag.code).toBe(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));
    expect(diag.category).toBe(ts.DiagnosticCategory.Error);
    expect(getTextOfDiagnostic(diag)).toBe(`'./missing.css'`);
  });
});

function getTextOfDiagnostic(diag: ts.Diagnostic): string {
  expect(diag.file).not.toBeUndefined();
  expect(diag.start).not.toBeUndefined();
  expect(diag.length).not.toBeUndefined();
  return diag.file!.text.substring(diag.start!, diag.start! + diag.length!);
}
