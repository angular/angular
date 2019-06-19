/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {DependencyTracker, ForeignFunctionResolver, PartialEvaluator} from '../src/interface';
import {ResolvedValue} from '../src/result';

export function makeExpression(
    code: string, expr: string, supportingFiles: {name: string, contents: string}[] = []): {
  expression: ts.Expression,
  host: ts.CompilerHost,
  checker: ts.TypeChecker,
  program: ts.Program,
  options: ts.CompilerOptions
} {
  const {program, options, host} = makeProgram(
      [{name: 'entry.ts', contents: `${code}; const target$ = ${expr};`}, ...supportingFiles]);
  const checker = program.getTypeChecker();
  const decl = getDeclaration(program, 'entry.ts', 'target$', ts.isVariableDeclaration);
  return {
    expression: decl.initializer !,
    host,
    options,
    checker,
    program,
  };
}

export function makeEvaluator(
    checker: ts.TypeChecker, tracker?: DependencyTracker): PartialEvaluator {
  const reflectionHost = new TypeScriptReflectionHost(checker);
  return new PartialEvaluator(reflectionHost, checker, tracker);
}

export function evaluate<T extends ResolvedValue>(
    code: string, expr: string, supportingFiles: {name: string, contents: string}[] = [],
    foreignFunctionResolver?: ForeignFunctionResolver): T {
  const {expression, checker} = makeExpression(code, expr, supportingFiles);
  const evaluator = makeEvaluator(checker);
  return evaluator.evaluate(expression, foreignFunctionResolver) as T;
}

export function owningModuleOf(ref: Reference): string|null {
  return ref.bestGuessOwningModule !== null ? ref.bestGuessOwningModule.specifier : null;
}

export function firstArgFfr(
    node: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
    args: ReadonlyArray<ts.Expression>): ts.Expression {
  return args[0];
}
