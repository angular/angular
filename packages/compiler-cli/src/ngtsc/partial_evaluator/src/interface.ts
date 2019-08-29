/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ReflectionHost} from '../../reflection';

import {StaticInterpreter} from './interpreter';
import {ResolvedValue} from './result';

/**
 * Implement this interface to record dependency relations between
 * source files.
 */
export interface DependencyTracker {
  trackFileDependency(dep: ts.SourceFile, src: ts.SourceFile): void;
}

export type ForeignFunctionResolver =
    (node: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
     args: ReadonlyArray<ts.Expression>) => ts.Expression | null;

export class PartialEvaluator {
  constructor(
      private host: ReflectionHost, private checker: ts.TypeChecker,
      private dependencyTracker?: DependencyTracker) {}

  evaluate(expr: ts.Expression, foreignFunctionResolver?: ForeignFunctionResolver): ResolvedValue {
    const interpreter = new StaticInterpreter(this.host, this.checker, this.dependencyTracker);
    return interpreter.visit(expr, {
      originatingFile: expr.getSourceFile(),
      absoluteModuleName: null,
      resolutionContext: expr.getSourceFile().fileName,
      scope: new Map<ts.ParameterDeclaration, ResolvedValue>(), foreignFunctionResolver,
    });
  }
}
