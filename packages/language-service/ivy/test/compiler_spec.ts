/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, getSourceFileOrError} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {OptimizeFor} from '@angular/compiler-cli/src/ngtsc/typecheck/api';

import {LanguageServiceTestEnvironment} from './env';

describe('language-service/compiler integration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should react to a change in an external template', () => {
    const cmpFile = absoluteFrom('/test.ts');
    const tmplFile = absoluteFrom('/test.html');

    const env = LanguageServiceTestEnvironment.setup([
      {
        name: cmpFile,
        contents: `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            templateUrl: './test.html',
          })
          export class TestCmp {}
        `,
        isRoot: true,
      },
      {
        name: tmplFile,
        contents: '<other-cmp>Test</other-cmp>',
      },
    ]);

    const diags = env.ngLS.getSemanticDiagnostics(cmpFile);
    expect(diags.length).toBeGreaterThan(0);

    env.updateFile(tmplFile, '<div>Test</div>');
    const afterDiags = env.ngLS.getSemanticDiagnostics(cmpFile);
    expect(afterDiags.length).toBe(0);
  });

  it('should not produce errors from inline test declarations mixing with those of the app', () => {
    const appCmpFile = absoluteFrom('/test.cmp.ts');
    const appModuleFile = absoluteFrom('/test.mod.ts');
    const testFile = absoluteFrom('/test_spec.ts');

    const env = LanguageServiceTestEnvironment.setup([
      {
        name: appCmpFile,
        contents: `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: 'Some template',
          })
          export class AppCmp {}
        `,
        isRoot: true,
      },
      {
        name: appModuleFile,
        contents: `
          import {NgModule} from '@angular/core';
          import {AppCmp} from './test.cmp';

          @NgModule({
            declarations: [AppCmp],
          })
          export class AppModule {}
        `,
        isRoot: true,
      },
      {
        name: testFile,
        contents: `
          import {NgModule} from '@angular/core';
          import {AppCmp} from './test.cmp';

          export function test(): void {
            @NgModule({
              declarations: [AppCmp],
            })
            class TestModule {}
          }
        `,
        isRoot: true,
      }
    ]);

    // Expect that this program is clean diagnostically.
    const ngCompiler = env.ngLS.compilerFactory.getOrCreate();
    const program = ngCompiler.getNextProgram();
    expect(ngCompiler.getDiagnosticsForFile(
               getSourceFileOrError(program, appCmpFile), OptimizeFor.WholeProgram))
        .toEqual([]);
    expect(ngCompiler.getDiagnosticsForFile(
               getSourceFileOrError(program, appModuleFile), OptimizeFor.WholeProgram))
        .toEqual([]);
    expect(ngCompiler.getDiagnosticsForFile(
               getSourceFileOrError(program, testFile), OptimizeFor.WholeProgram))
        .toEqual([]);
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

    const file = absoluteFrom('/test.ts');
    const env = LanguageServiceTestEnvironment.setup([{
      name: file,
      contents: `
          import {Component, Directive, Input, NgModule} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="3"></div>',
          })
          export class Cmp {}

          @Directive({
            selector: '[dir]',
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
      isRoot: true,
    }]);

    const diags = env.ngLS.getSemanticDiagnostics(file);
    expect(diags.map(diag => diag.messageText))
        .toContain(`Type 'number' is not assignable to type 'string'.`);
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

    const moduleFile = absoluteFrom('/mod.ts');
    const componentFile = absoluteFrom('/cmp.ts');

    const componentSource = (isExported: boolean): string => `
      import {Component} from '@angular/core';

      @Component({
        selector: 'some-cmp',
        template: 'Not important',
      })
      ${isExported ? 'export' : ''} class Cmp {}
    `;

    const env = LanguageServiceTestEnvironment.setup([
      {
        name: moduleFile,
        contents: `
          import {NgModule} from '@angular/core';

          import {Cmp} from './cmp';

          @NgModule({
            declarations: [Cmp],
          })
          export class Mod {}
        `,
        isRoot: true,
      },
      {
        name: componentFile,
        contents: componentSource(/* start with component not exported */ false),
        isRoot: true,
      }
    ]);

    // Angular should be complaining about the module not being understandable.
    const programBefore = env.tsLS.getProgram()!;
    const moduleSfBefore = programBefore.getSourceFile(moduleFile)!;
    const ngDiagsBefore = env.ngLS.compilerFactory.getOrCreate().getDiagnosticsForFile(
        moduleSfBefore, OptimizeFor.SingleFile);
    expect(ngDiagsBefore.length).toBe(1);

    // Fix the import.
    env.updateFile(componentFile, componentSource(/* properly export the component */ true));

    // Angular should stop complaining about the NgModule.
    const programAfter = env.tsLS.getProgram()!;
    const moduleSfAfter = programAfter.getSourceFile(moduleFile)!;
    const ngDiagsAfter = env.ngLS.compilerFactory.getOrCreate().getDiagnosticsForFile(
        moduleSfAfter, OptimizeFor.SingleFile);
    expect(ngDiagsAfter.length).toBe(0);
  });
});
