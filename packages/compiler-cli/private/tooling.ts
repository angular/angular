/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * This file is used as a private API channel to shared Angular FW APIs with @angular/cli.
 *
 * Any changes to this file should be discussed with the Angular CLI team.
 */

import ts from 'typescript';

import {PartialEvaluator} from '../src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '../src/ngtsc/reflection';
import {getDownlevelDecoratorsTransform, getInputSignalsMetadataTransform} from '../src/transformers/jit_transforms/index';

/**
 * Known values for global variables in `@angular/core` that Terser should set using
 * https://github.com/terser-js/terser#conditional-compilation
 */
export const GLOBAL_DEFS_FOR_TERSER = {
  ngDevMode: false,
  ngI18nClosureMode: false,
};

export const GLOBAL_DEFS_FOR_TERSER_WITH_AOT = {
  ...GLOBAL_DEFS_FOR_TERSER,
  ngJitMode: false,
};

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
    program: ts.Program, isCore = false): ts.TransformerFactory<ts.SourceFile> {
  const typeChecker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(typeChecker);
  const evaluator = new PartialEvaluator(reflectionHost, typeChecker, null);

  const downlevelDecoratorTransform = getDownlevelDecoratorsTransform(
      typeChecker, reflectionHost, [], isCore,
      /* enableClosureCompiler */ false);

  const inputSignalMetadataTransform = getInputSignalsMetadataTransform(reflectionHost, isCore);

  return (ctx) => {
    return (sourceFile) => {
      sourceFile = inputSignalMetadataTransform(ctx)(sourceFile);
      sourceFile = downlevelDecoratorTransform(ctx)(sourceFile);

      return sourceFile;
    };
  };
}

/**
 * Re-export for backwards compatibility.
 * The Angular CLI relies on this name for the transform.
 */
export const constructorParametersDownlevelTransform = angularJitApplicationTransform;
