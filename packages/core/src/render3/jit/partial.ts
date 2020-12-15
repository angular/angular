/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade, R3DeclareComponentFacade, R3DeclareDirectiveFacade} from '../../compiler/compiler_facade';
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
