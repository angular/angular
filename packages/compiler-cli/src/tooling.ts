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

import * as ts from 'typescript';

import {TypeScriptReflectionHost} from './ngtsc/reflection';
import {getDownlevelDecoratorsTransform} from './transformers/downlevel_decorators_transform';

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
 * Transform for downleveling Angular decorators and Angular-decorated class constructor
 * parameters for dependency injection. This transform can be used by the CLI for JIT-mode
 * compilation where constructor parameters and associated Angular decorators should be
 * downleveled so that apps are not exposed to the ES2015 temporal dead zone limitation
 * in TypeScript. See https://github.com/angular/angular-cli/pull/14473 for more details.
 */
export function constructorParametersDownlevelTransform(program: ts.Program):
    ts.TransformerFactory<ts.SourceFile> {
  const typeChecker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(typeChecker);
  return getDownlevelDecoratorsTransform(
      typeChecker, reflectionHost, [], /* isCore */ false,
      /* enableClosureCompiler */ false, /* skipClassDecorators */ true);
}
