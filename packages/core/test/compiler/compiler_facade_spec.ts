/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade, JitCompilerUsage} from '../../src/compiler/compiler_facade';
import {CompilerFacade, ExportedCompilerFacade} from '../../src/compiler/compiler_facade_interface';
import {global} from '../../src/util/global';

describe('getCompilerFacade', () => {
  describe('errors', () => {
    beforeEach(clearCompilerFacade);
    afterEach(restoreCompilerFacade);

    it('reports an error when requested for a decorator', () => {
      try {
        getCompilerFacade({usage: JitCompilerUsage.Decorator, kind: 'directive', type: TestClass});
        fail('Error expected as compiler facade is not available');
      } catch (e) {
        expect(e.message).toEqual(
            `The directive 'TestClass' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.

JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.
Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`);
      }
    });

    it('reports an error when requested for a partial declaration', () => {
      try {
        getCompilerFacade(
            {usage: JitCompilerUsage.PartialDeclaration, kind: 'directive', type: TestClass});
        fail('Error expected as compiler facade is not available');
      } catch (e) {
        expect(e.message).toEqual(
            `The directive 'TestClass' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.

The directive is part of a library that has been partially compiled.
However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.

Ideally, the library is processed using the Angular Linker to become fully AOT compiled.
Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`);
      }
    });
  });
});

class TestClass {}

let ɵcompilerFacade: CompilerFacade|null = null;

function clearCompilerFacade() {
  const ng: ExportedCompilerFacade = global.ng;
  ɵcompilerFacade = ng.ɵcompilerFacade;
  ng.ɵcompilerFacade = undefined!;
}

function restoreCompilerFacade() {
  if (ɵcompilerFacade === null) {
    return;
  }
  const ng: ExportedCompilerFacade = global.ng;
  ng.ɵcompilerFacade = ɵcompilerFacade;
  ɵcompilerFacade = null;
}
