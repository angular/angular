/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {TypeScriptReflectionHost} from '../../packages/compiler-cli/src/ngtsc/reflection/src/typescript';
import {getDownlevelDecoratorsTransform} from '../../packages/compiler-cli/src/transformers/downlevel_decorators_transform/index';

/**
 * Transform for downleveling Angular decorators and Angular-decorated class
 * constructor parameters for dependency injection.
 * See https://github.com/angular/angular-cli/pull/14473 for more details.
 */
export function legacyCompilationDownlevelDecoratorTransform(program: ts.Program):
    ts.TransformerFactory<ts.SourceFile> {
  const typeChecker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(typeChecker);
  // Note: `isCore` is set to `true` since we also process the core package.
  return getDownlevelDecoratorsTransform(
      typeChecker, reflectionHost, [], /* isCore */ true,
      /* enableClosureCompiler */ false);
}
