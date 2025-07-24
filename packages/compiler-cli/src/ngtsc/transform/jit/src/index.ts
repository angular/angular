/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
import {TypeScriptReflectionHost} from '../../../reflection';

import {getDownlevelDecoratorsTransform} from './downlevel_decorators_transform';
import {getInitializerApiJitTransform} from './initializer_api_transforms/transform';

export {getDownlevelDecoratorsTransform} from './downlevel_decorators_transform';
export {getInitializerApiJitTransform} from './initializer_api_transforms/transform';

/**
 * JIT transform for Angular applications. Used by the Angular CLI for unit tests and
 * explicit JIT applications.
 *
 * The transforms include:
 *
 *  - A transform for downleveling Angular decorators and Angular-decorated class constructor
 *    parameters for dependency injection. This transform can be used by the CLI for JIT-mode
 *    compilation where constructor parameters and associated Angular decorators should be
 *    downleveled so that apps are not exposed to the ES2015 temporal dead zone limitation
 *    in TypeScript. See https://github.com/angular/angular-cli/pull/14473 for more details.
 *
 *  - A transform for adding `@Input` to signal inputs. Signal inputs cannot be recognized
 *    at runtime using reflection. That is because the class would need to be instantiated-
 *    but is not possible before creation. To fix this for JIT, a decorator is automatically
 *    added that will declare the input as a signal input while also capturing the necessary
 *    metadata
 */
export function angularJitApplicationTransform(
  program: ts.Program,
  isCore = false,
  shouldTransformClass?: (node: ts.ClassDeclaration) => boolean,
): ts.TransformerFactory<ts.SourceFile> {
  const typeChecker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(typeChecker);
  const importTracker = new ImportedSymbolsTracker();

  const downlevelDecoratorTransform = getDownlevelDecoratorsTransform(
    typeChecker,
    reflectionHost,
    [],
    isCore,
    /* enableClosureCompiler */ false,
    shouldTransformClass,
  );

  const initializerApisJitTransform = getInitializerApiJitTransform(
    reflectionHost,
    importTracker,
    isCore,
    shouldTransformClass,
  );

  return (ctx) => {
    return (sourceFile) => {
      sourceFile = initializerApisJitTransform(ctx)(sourceFile);
      sourceFile = downlevelDecoratorTransform(ctx)(sourceFile);

      return sourceFile;
    };
  };
}
