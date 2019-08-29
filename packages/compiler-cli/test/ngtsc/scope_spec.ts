/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Diagnostic} from '@angular/compiler-cli';
import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {getTokenAtPosition} from '../../src/ngtsc/util/src/typescript';
import {loadStandardTestFiles} from '../helpers/src/mock_file_loading';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc module scopes', () => {
    let env !: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    describe('diagnostics', () => {
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
                  '/*@__PURE__*/ i0.ɵɵsetNgModuleScope(TestModule, { imports: [OtherModule] });');

          const dtsContents = env.getContents('test.d.ts');
          expect(dtsContents)
              .toContain(
                  'static ngModuleDef: i0.ɵɵNgModuleDefWithMeta<TestModule, never, [typeof OtherModule], never>');
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
          expect(error.messageText).toContain('IsAModule');
          expect(error.messageText).toContain('NgModule.imports');
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
                  '/*@__PURE__*/ i0.ɵɵsetNgModuleScope(TestModule, { exports: [OtherModule] });');

          const dtsContents = env.getContents('test.d.ts');
          expect(dtsContents)
              .toContain(
                  'static ngModuleDef: i0.ɵɵNgModuleDefWithMeta<TestModule, never, never, [typeof OtherModule]>');
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
    });
  });

  function diagnosticToNode<T extends ts.Node>(
      diagnostic: ts.Diagnostic | Diagnostic, guard: (node: ts.Node) => node is T): T {
    const diag = diagnostic as ts.Diagnostic;
    if (diag.file === undefined) {
      throw new Error(`Expected ts.Diagnostic to have a file source`);
    }
    const node = getTokenAtPosition(diag.file, diag.start !);
    expect(guard(node)).toBe(true);
    return node as T;
  }
});
