/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade, R3DeclareComponentFacade, R3DeclareDirectiveFacade, R3DeclarePipeFacade} from '../../compiler/compiler_facade';
import {angularCoreEnv} from './environment';

/**
 * Compiles a partial directive declaration object into a full directive definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareDirective(decl: R3DeclareDirectiveFacade): unknown {
  const compiler = getCompilerFacade();
  return compiler.compileDirectiveDeclaration(
      angularCoreEnv, `ng:///${decl.type.name}/ɵfac.js`, decl);
}

/**
 * Compiles a partial component declaration object into a full component definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareComponent(decl: R3DeclareComponentFacade): unknown {
  const compiler = getCompilerFacade();
  return compiler.compileComponentDeclaration(
      angularCoreEnv, `ng:///${decl.type.name}/ɵcmp.js`, decl);
}

/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclarePipe(decl: R3DeclarePipeFacade): unknown {
  const compiler = getCompilerFacade();
  return compiler.compilePipeDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵpipe.js`, decl);
}
