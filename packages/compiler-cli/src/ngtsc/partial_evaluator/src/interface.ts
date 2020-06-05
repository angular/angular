/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {DependencyTracker} from '../../incremental/api';
import {MinorPhase, PerfRecorder} from '../../perf';
import {ReflectionHost} from '../../reflection';

import {StaticInterpreter} from './interpreter';
import {ResolvedValue} from './result';

export type ForeignFunctionResolver =
    (node: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
     args: ReadonlyArray<ts.Expression>) => ts.Expression|null;

export class PartialEvaluator {
  constructor(
      private host: ReflectionHost, private checker: ts.TypeChecker,
      private dependencyTracker: DependencyTracker|null, private perf: PerfRecorder) {}

  evaluate(expr: ts.Expression, foreignFunctionResolver?: ForeignFunctionResolver): ResolvedValue {
    const prevPhase = this.perf.trackMinorTimeAs(MinorPhase.CycleDetection);
    const interpreter = new StaticInterpreter(this.host, this.checker, this.dependencyTracker);
    const sourceFile = expr.getSourceFile();
    const res = interpreter.visit(expr, {
      originatingFile: sourceFile,
      absoluteModuleName: null,
      resolutionContext: sourceFile.fileName,
      scope: new Map<ts.ParameterDeclaration, ResolvedValue>(),
      foreignFunctionResolver,
    });
    this.perf.trackMinorTimeAs(prevPhase);
    return res;
  }
}
