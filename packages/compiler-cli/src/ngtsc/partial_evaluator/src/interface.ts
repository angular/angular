/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {OwningModule, Reference} from '../../imports';
import {DependencyTracker} from '../../incremental/api';
import {ReflectionHost} from '../../reflection';

import {DynamicValue} from './dynamic';
import {StaticInterpreter} from './interpreter';
import {ResolvedValue} from './result';

export type ForeignFunctionResolver = (
  fn: Reference<ts.FunctionDeclaration | ts.MethodDeclaration | ts.FunctionExpression>,
  callExpr: ts.CallExpression,
  resolve: (expr: ts.Expression) => ResolvedValue,
  unresolvable: DynamicValue,
) => ResolvedValue;

export type ForeignTypeResolver = (typeNode: ts.TypeNode) => ts.TypeNode | null;

export class PartialEvaluator {
  constructor(
    private host: ReflectionHost,
    private checker: ts.TypeChecker,
    private dependencyTracker: DependencyTracker | null,
  ) {}

  evaluate(expr: ts.Expression, foreignFunctionResolver?: ForeignFunctionResolver): ResolvedValue {
    const interpreter = new StaticInterpreter(this.host, this.checker, this.dependencyTracker);
    const sourceFile = expr.getSourceFile();
    return interpreter.visit(expr, {
      originatingFile: sourceFile,
      absoluteModuleName: null,
      resolutionContext: sourceFile.fileName,
      scope: new Map<ts.ParameterDeclaration, ResolvedValue>(),
      foreignFunctionResolver,
    });
  }

  /**
   * Statically evaluates a `ts.TypeNode` (rather than a value expression) to a `ResolvedValue`.
   *
   * This is used when reading metadata that was encoded into `.d.ts` type positions - for example
   * the `imports`/`exports`/`declarations` tuples of `ɵɵNgModuleDeclaration`, which may be written
   * as `typeof X` queries, `ReturnType<typeof X.forRoot>`, references to constants that themselves
   * resolve to tuples, etc.
   */
  evaluateType(
    typeNode: ts.TypeNode,
    owningModule: OwningModule | null = null,
    foreignFunctionResolver?: ForeignFunctionResolver,
    foreignTypeResolver?: ForeignTypeResolver,
  ): ResolvedValue {
    const interpreter = new StaticInterpreter(this.host, this.checker, this.dependencyTracker);
    const sourceFile = typeNode.getSourceFile();
    return interpreter.visitType(typeNode, {
      originatingFile: sourceFile,
      absoluteModuleName: owningModule ? owningModule.specifier : null,
      resolutionContext: owningModule ? owningModule.resolutionContext : sourceFile.fileName,
      scope: new Map<ts.ParameterDeclaration, ResolvedValue>(),
      foreignFunctionResolver,
      foreignTypeResolver,
    });
  }
}
