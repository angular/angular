/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Diagnostic} from '@angular/compiler-cli';
import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {getTokenAtPosition} from '../../src/ngtsc/util/src/typescript';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc module scopes', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    describe('diagnostics', () => {
      describe('declarations', () => {
        it('should detect when a random class is declared', () => {
          env.write('test.ts', `
            import {NgModule} from '@angular/core';

            export class RandomClass {}

            @NgModule({
              declarations: [RandomClass],
            })
            export class Module {}
          `);

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          const node = diagnosticToNode(diags[0], ts.isIdentifier);
          expect(node.text).toEqual('RandomClass');
          expect(diags[0].messageText).toContain('is not a directive, a component, or a pipe.');
        });

        it('should detect when a declaration lives outside the current compilation', () => {
          env.write('dir.d.ts', `
            import {ɵɵDirectiveDeclaration} from '@angular/core';

            export declare class ExternalDir {
              static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
            }
          `);
          env.write('test.ts', `
            import {NgModule} from '@angular/core';
            import {ExternalDir} from './dir';

            @NgModule({
              declarations: [ExternalDir],
            })
            export class Module {}
          `);
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          const node = diagnosticToNode(diags[0], ts.isIdentifier);
          expect(node.text).toEqual('ExternalDir');
          expect(diags[0].messageText).toContain(`not a part of the current compilation`);
        });

        it('should detect when a declaration is shared between two modules', () => {
          env.write('test.ts', `
            import {Directive, NgModule} from '@angular/core';

            @Directive({selector: '[test]'})
            export class TestDir {}

            @NgModule({
              declarations: [TestDir]
            })
            export class ModuleA {}

            @NgModule({
              declarations: [TestDir],
            })
            export class ModuleB {}
          `);
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          const node = findContainingClass(diagnosticToNode(diags[0], ts.isIdentifier));
          expect(node.name!.text).toEqual('TestDir');

          const relatedNodes = new Set(diags[0].relatedInformation!.map(
              related =>
                  findContainingClass(diagnosticToNode(related, ts.isIdentifier)).name!.text));
          expect(relatedNodes).toContain('ModuleA');
          expect(relatedNodes).toContain('ModuleB');
          expect(relatedNodes.size).toBe(2);
        });

        it('should detect when a declaration is repeated within the same module', () => {
          env.write('test.ts', `
            import {Directive, NgModule} from '@angular/core';

            @Directive({selector: '[test]'})
            export class TestDir {}


            @NgModule({
              declarations: [TestDir, TestDir],
            })
            export class Module {}
          `);

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });

        it('should detect when a declaration is shared between two modules, and is repeated within them',
           () => {
             env.write('test.ts', `
              import {Directive, NgModule} from '@angular/core';

              @Directive({selector: '[test]'})
              export class TestDir {}

              @NgModule({
                declarations: [TestDir, TestDir]
              })
              export class ModuleA {}

              @NgModule({
                declarations: [TestDir, TestDir],
              })
              export class ModuleB {}
            `);
             const diags = env.driveDiagnostics();
             expect(diags.length).toBe(1);
             const node = findContainingClass(diagnosticToNode(diags[0], ts.isIdentifier));
             expect(node.name!.text).toEqual('TestDir');

             const relatedNodes = new Set(diags[0].relatedInformation!.map(
                 related =>
                     findContainingClass(diagnosticToNode(related, ts.isIdentifier)).name!.text));
             expect(relatedNodes).toContain('ModuleA');
             expect(relatedNodes).toContain('ModuleB');
             expect(relatedNodes.size).toBe(2);
           });
      });
      describe('imports', () => {
        it('should emit imports in a pure function call', () => {
          env.write('test.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class OtherModule {}

          @NgModule({imports: [OtherModule]})
          export class TestModule {}
        `);

          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
          expect(jsContents)
              .toContain(
                  'function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(TestModule, { imports: [OtherModule] }); })();');

          const dtsContents = env.getContents('test.d.ts');
          expect(dtsContents)
              .toContain(
                  'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof OtherModule], never>');
        });

        it('should produce an error when an invalid class is imported', () => {
          env.write('test.ts', `
          import {NgModule} from '@angular/core';

          class NotAModule {}

          @NgModule({imports: [NotAModule]})
          class IsAModule {}
        `);
          const [error] = env.driveDiagnostics();
          expect(error).not.toBeUndefined();
          expect(error.messageText).toContain('IsAModule');
          expect(error.messageText).toContain('NgModule.imports');
          expect(error.code).toEqual(ngErrorCode(ErrorCode.NGMODULE_INVALID_IMPORT));
          expect(diagnosticToNode(error, ts.isIdentifier).text).toEqual('NotAModule');
        });

        it('should produce an error when a non-class is imported from a .d.ts dependency', () => {
          env.write('dep.d.ts', `export declare let NotAClass: Function;`);
          env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {NotAClass} from './dep';

          @NgModule({imports: [NotAClass]})
          class IsAModule {}
        `);
          const [error] = env.driveDiagnostics();
          expect(error).not.toBeUndefined();
          const messageText = ts.flattenDiagnosticMessageText(error.messageText, '\n');
          expect(messageText)
              .toContain('Value at position 0 in the NgModule.imports of IsAModule is not a class');
          expect(messageText).toContain('Value is a reference to \'NotAClass\'.');
          expect(error.code).toEqual(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
          expect(diagnosticToNode(error, ts.isIdentifier).text).toEqual('NotAClass');
        });
      });

      describe('exports', () => {
        it('should emit exports in a pure function call', () => {
          env.write('test.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class OtherModule {}

          @NgModule({exports: [OtherModule]})
          export class TestModule {}
        `);

          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
          expect(jsContents)
              .toContain(
                  '(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(TestModule, { exports: [OtherModule] }); })();');

          const dtsContents = env.getContents('test.d.ts');
          expect(dtsContents)
              .toContain(
                  'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, never, never, [typeof OtherModule]>');
        });

        it('should produce an error when a non-NgModule class is exported', () => {
          env.write('test.ts', `
          import {NgModule} from '@angular/core';

          class NotAModule {}

          @NgModule({exports: [NotAModule]})
          class IsAModule {}
        `);
          const [error] = env.driveDiagnostics();
          expect(error).not.toBeUndefined();
          expect(error.messageText).toContain('IsAModule');
          expect(error.messageText).toContain('NgModule.exports');
          expect(error.code).toEqual(ngErrorCode(ErrorCode.NGMODULE_INVALID_EXPORT));
          expect(diagnosticToNode(error, ts.isIdentifier).text).toEqual('NotAModule');
        });

        it('should produce a transitive error when an invalid NgModule is exported', () => {
          env.write('test.ts', `
          import {NgModule} from '@angular/core';

          export class NotAModule {}

          @NgModule({
            imports: [NotAModule],
          })
          class InvalidModule {}

          @NgModule({exports: [InvalidModule]})
          class IsAModule {}
        `);

          // Find the diagnostic referencing InvalidModule, which should have come from IsAModule.
          const error = env.driveDiagnostics().find(
              error => diagnosticToNode(error, ts.isIdentifier).text === 'InvalidModule');
          if (error === undefined) {
            return fail('Expected to find a diagnostic referencing InvalidModule');
          }
          expect(error.messageText).toContain('IsAModule');
          expect(error.messageText).toContain('NgModule.exports');
          expect(error.code).toEqual(ngErrorCode(ErrorCode.NGMODULE_INVALID_EXPORT));
        });
      });

      describe('re-exports', () => {
        it('should produce an error when a non-declared/imported class is re-exported', () => {
          env.write('test.ts', `
          import {Directive, NgModule} from '@angular/core';

          @Directive({selector: 'test'})
          class Dir {}

          @NgModule({exports: [Dir]})
          class IsAModule {}
        `);
          const [error] = env.driveDiagnostics();
          expect(error).not.toBeUndefined();
          expect(error.messageText).toContain('IsAModule');
          expect(error.messageText).toContain('NgModule.exports');
          expect(error.code).toEqual(ngErrorCode(ErrorCode.NGMODULE_INVALID_REEXPORT));
          expect(diagnosticToNode(error, ts.isIdentifier).text).toEqual('Dir');
        });
      });

      it('should not produce component template type-check errors if its module is invalid', () => {
        env.tsconfig({'fullTemplateTypeCheck': true});

        // Set up 3 files, each of which declare an NgModule that's invalid in some way. This will
        // produce a bunch of diagnostics related to the issues with the modules. Each module also
        // declares a component with a template that references a <doesnt-exist> element. This test
        // verifies that none of the produced diagnostics mention this nonexistent element, since
        // no template type-checking should be performed for a component that's part of an invalid
        // NgModule.

        // This NgModule declares something which isn't a directive/pipe.
        env.write('invalid-declaration.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<doesnt-exist></doesnt-exist>',
          })
          export class TestCmp {}

          export class NotACmp {}

          @NgModule({declarations: [TestCmp, NotACmp]})
          export class Module {}
        `);

        // This NgModule imports something which isn't an NgModule.
        env.write('invalid-import.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<doesnt-exist></doesnt-exist>',
          })
          export class TestCmp {}

          export class NotAModule {}

          @NgModule({
            declarations: [TestCmp],
            imports: [NotAModule],
          })
          export class Module {}
        `);

        // This NgModule imports a DepModule which itself is invalid (it declares something which
        // isn't a directive/pipe).
        env.write('transitive-error-in-import.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<doesnt-exist></doesnt-exist>',
          })
          export class TestCmp {}

          export class NotACmp {}

          @NgModule({
            declarations: [NotACmp],
            exports: [NotACmp],
          })
          export class DepModule {}

          @NgModule({
            declarations: [TestCmp],
            imports: [DepModule],
          })
          export class Module {}
        `);

        for (const diag of env.driveDiagnostics()) {
          // None of the diagnostics should be related to the fact that the component uses an
          // unknown element, because in all cases the component's scope was invalid.
          expect(diag.messageText)
              .not.toContain(
                  'doesnt-exist',
                  'Template type-checking ran for a component, when it shouldn\'t have.');
        }
      });
    });
  });

  function diagnosticToNode<T extends ts.Node>(
      diagnostic: ts.Diagnostic|Diagnostic|ts.DiagnosticRelatedInformation,
      guard: (node: ts.Node) => node is T): T {
    const diag = diagnostic as ts.Diagnostic | ts.DiagnosticRelatedInformation;
    if (diag.file === undefined) {
      throw new Error(`Expected ts.Diagnostic to have a file source`);
    }
    const node = getTokenAtPosition(diag.file, diag.start!);
    expect(guard(node)).toBe(true);
    return node as T;
  }
});

function findContainingClass(node: ts.Node): ts.ClassDeclaration {
  while (!ts.isClassDeclaration(node)) {
    if (node.parent && node.parent !== node) {
      node = node.parent;
    } else {
      throw new Error('Expected node to have a ClassDeclaration parent');
    }
  }
  return node;
}
