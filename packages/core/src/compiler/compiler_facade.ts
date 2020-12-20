/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from '../util/global';
import {CompilerFacade, ExportedCompilerFacade} from './compiler_facade_interface';
export * from './compiler_facade_interface';

export function getCompilerFacade(): CompilerFacade {
  const globalNg: ExportedCompilerFacade = global['ng'];
  if (!globalNg || !globalNg.ɵcompilerFacade) {
    throw new Error(
        `Angular JIT compilation failed: '@angular/compiler' not loaded!\n` +
        `  - JIT compilation is discouraged for production use-cases! Consider AOT mode instead.\n` +
        `  - Did you bootstrap using '@angular/platform-browser-dynamic' or '@angular/platform-server'?\n` +
        `  - Alternatively provide the compiler with 'import "@angular/compiler";' before bootstrapping.`);
  }
  return globalNg.ɵcompilerFacade;
}
