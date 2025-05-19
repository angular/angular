/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ExternalReference, R3Identifiers} from '@angular/compiler';

import {angularCoreEnv} from '../../src/render3/jit/environment';

const INTERFACE_EXCEPTIONS = new Set<string>([
  'ɵɵComponentDeclaration',
  'ɵɵDirectiveDeclaration',
  'ɵɵInjectableDeclaration',
  'ɵɵInjectorDeclaration',
  'ɵɵInjectorDef',
  'ɵɵNgModuleDeclaration',
  'ɵɵPipeDeclaration',
  'ɵɵFactoryDeclaration',
  'ModuleWithProviders',
]);

/**
 * The following symbols are only referenced from AOT compilation outputs so are allowed to be
 * omitted from the JIT environment.
 */
const AOT_ONLY = new Set<string>([
  'ɵsetClassMetadata',
  'ɵsetClassMetadataAsync',

  // used in type-checking.
  'ɵINPUT_SIGNAL_BRAND_WRITE_TYPE',
  'ɵUnwrapDirectiveSignalInputs',
  'ɵunwrapWritableSignal',
]);

/**
 * The following symbols are only referenced from partial declaration compilation outputs, which
 * will never be emitted by the JIT compiler so are allowed to be omitted from the JIT environment.
 */
const PARTIAL_ONLY = new Set<string>([
  'ɵɵngDeclareDirective',
  'ɵɵngDeclareClassMetadata',
  'ɵɵngDeclareClassMetadataAsync',
  'ɵɵngDeclareComponent',
  'ɵɵngDeclareFactory',
  'ɵɵngDeclareInjectable',
  'ɵɵngDeclareInjector',
  'ɵɵngDeclareNgModule',
  'ɵɵngDeclarePipe',
  'ɵɵFactoryTarget',
  'ChangeDetectionStrategy',
  'ViewEncapsulation',
]);

describe('r3 jit environment', () => {
  // This test keeps render3/jit/environment and r3_identifiers in the compiler in sync, ensuring
  // that if the compiler writes a reference to a render3 symbol, it will be resolvable at runtime
  // in JIT mode.
  it('should support all r3 symbols', () => {
    Object
      // Map over the static properties of Identifiers.
      .values(R3Identifiers)
      // A few such properties are string constants. Ignore them, and focus on ExternalReferences.
      .filter(isExternalReference)
      // Some references are to interface types. Only take properties which have runtime values.
      .filter(
        (sym) =>
          !INTERFACE_EXCEPTIONS.has(sym.name) &&
          !AOT_ONLY.has(sym.name) &&
          !PARTIAL_ONLY.has(sym.name),
      )
      .forEach((sym) => {
        // Assert that angularCoreEnv has a reference to the runtime symbol.
        expect(angularCoreEnv.hasOwnProperty(sym.name)).toBe(
          true,
          `Missing symbol ${sym.name} in render3/jit/environment`,
        );
      });
  });
});

function isExternalReference(
  sym: ExternalReference | string,
): sym is ExternalReference & {name: string} {
  return typeof sym === 'object' && sym.name !== null && sym.moduleName !== null;
}
