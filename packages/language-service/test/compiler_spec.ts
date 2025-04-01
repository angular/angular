/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {isNgSpecificDiagnostic, LanguageServiceTestEnv} from '../testing';

describe('language-service/compiler integration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should react to a change in an external template', () => {
    const env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', {
      'test.ts': `
        import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            templateUrl: './test.html',
            standalone: false,
          })
          export class TestCmp {}
      `,
      'test.html': `<other-cmp>Test</other-cmp>`,
    });

    expect(project.getDiagnosticsForFile('test.html').length).toBeGreaterThan(0);

    const tmplFile = project.openFile('test.html');
    tmplFile.contents = '<div>Test</div>';
    expect(project.getDiagnosticsForFile('test.html').length).toEqual(0);
  });

  it('should not produce errors from inline test declarations mixing with those of the app', () => {
    const env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', {
      'cmp.ts': `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: 'Some template',
          standalone: false,
        })
        export class AppCmp {}
      `,
      'mod.ts': `
        import {NgModule} from '@angular/core';
        import {AppCmp} from './cmp';

        @NgModule({
          declarations: [AppCmp],
        })
        export class AppModule {}
      `,
      'test_spec.ts': `
        import {NgModule} from '@angular/core';
        import {AppCmp} from './cmp';

        export function test(): void {
          @NgModule({
            declarations: [AppCmp],
          })
          class TestModule {}
        }
      `,
    });

    // Expect that this program is clean diagnostically.
    expect(project.getDiagnosticsForFile('cmp.ts')).toEqual([]);
    expect(project.getDiagnosticsForFile('mod.ts')).toEqual([]);
    expect(project.getDiagnosticsForFile('test_spec.ts')).toEqual([]);
  });

  it('should show type-checking errors from components with poisoned scopes', () => {
    // Normally, the Angular compiler suppresses errors from components that belong to NgModules
    // which themselves have errors (such scopes are considered "poisoned"), to avoid overwhelming
    // the user with secondary errors that stem from a primary root cause. However, this prevents
    // the generation of type check blocks and other metadata within the compiler which drive the
    // Language Service's understanding of components. Therefore in the Language Service, the
    // compiler is configured to make use of such data even if it's "poisoned". This test verifies
    // that a component declared in an NgModule with a faulty import still generates template
    // diagnostics.

    const env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', {
      'test.ts': `
        import {Component, Directive, Input, NgModule} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div [dir]="3"></div>',
          standalone: false,
        })
        export class Cmp {}

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class Dir {
          @Input() dir!: string;
        }

        export class NotAModule {}

        @NgModule({
          declarations: [Cmp, Dir],
          imports: [NotAModule],
        })
        export class Mod {}
      `,
    });

    const diags = project.getDiagnosticsForFile('test.ts').map((diag) => diag.messageText);
    expect(diags).toContain(`Type 'number' is not assignable to type 'string'.`);
  });

  it('should handle broken imports during incremental build steps', () => {
    // This test validates that the compiler's incremental APIs correctly handle a broken import
    // when invoked via the Language Service. Testing this via the LS is important as only the LS
    // requests Angular analysis in the presence of TypeScript-level errors. In the case of broken
    // imports this distinction is especially important: Angular's incremental analysis is
    // built on the compiler's dependency graph, and this graph must be able to function even
    // with broken imports.
    //
    // The test works by creating a component/module pair where the module imports and declares a
    // component from a separate file. That component is initially not exported, meaning the
    // module's import is broken. Angular will correctly complain that the NgModule is declaring a
    // value which is not statically analyzable.
    //
    // Then, the component file is fixed to properly export the component class, and an incremental
    // build step is performed. The compiler should recognize that the module's previous analysis
    // is stale, even though it was not able to fully understand the import during the first pass.

    const componentSource = (isExported: boolean): string => `
      import {Component} from '@angular/core';

      @Component({
        selector: 'some-cmp',
        template: 'Not important',
        standalone: false,
      })
      ${isExported ? 'export' : ''} class Cmp {}
    `;

    const env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', {
      'mod.ts': `
        import {NgModule} from '@angular/core';

        import {Cmp} from './cmp';

        @NgModule({
          declarations: [Cmp],
        })
        export class Mod {}
      `,
      'cmp.ts': componentSource(/* start with component not exported */ false),
    });

    // Angular should be complaining about the module not being understandable.
    const ngDiagsBefore = project.getDiagnosticsForFile('mod.ts').filter(isNgSpecificDiagnostic);
    expect(ngDiagsBefore.length).toBe(1);

    // Fix the import.
    const file = project.openFile('cmp.ts');
    file.contents = componentSource(/* properly export the component */ true);

    // Angular should stop complaining about the NgModule.
    const ngDiagsAfter = project.getDiagnosticsForFile('mod.ts').filter(isNgSpecificDiagnostic);
    expect(ngDiagsAfter.length).toBe(0);
  });

  it('detects source file change in between typecheck programs', () => {
    const env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', {
      'module.ts': `
        import {NgModule} from '@angular/core';
        import {BarCmp} from './bar';

        @NgModule({
          declarations: [BarCmp],
        })
        export class AppModule {}
      `,
      'bar.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '{{ bar }}',
          standalone: false,
        })
        export class BarCmp {
          readonly bar = 'bar';
        }
      `,
    });
    // The opening of 'bar.ts' causes its version to change, because the internal
    // representation switches from TextStorage to ScriptVersionCache.
    const bar = project.openFile('bar.ts');
    // When getDiagnostics is called, NgCompiler calls ensureAllShimsForOneFile
    // and caches the source file for 'bar.ts' in the input program.
    // The input program has not picked up the version change because the project
    // is clean (rightly so since there's no user-initiated change).
    expect(project.getDiagnosticsForFile('bar.ts').length).toBe(0);
    // A new program is generated due to addition of typecheck file. During
    // program creation, TS language service does a sweep of all source files,
    // and detects the version change. Consequently, it creates a new source
    // file for 'bar.ts'. This is a violation of our assumption that a SourceFile
    // will never change in between typecheck programs.
    bar.moveCursorToText(`template: '{{ b¦ar }}'`);
    expect(bar.getQuickInfoAtPosition()).toBeDefined();
  });
});
