/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiteralExpr, R3PipeMetadata, Statement, WrappedNodeExpr, compilePipeFromMetadata} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Decorator, ReflectionHost} from '../../host';
import {reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {SelectorScopeRegistry} from './selector_scope';
import {getConstructorDependencies, isAngularCore, unwrapExpression} from './util';

export interface PipeHandlerData {
  meta: R3PipeMetadata;
  metadataStmt: Statement|null;
}

export class PipeDecoratorHandler implements DecoratorHandler<PipeHandlerData, Decorator> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Pipe' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(clazz: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<PipeHandlerData> {
    if (clazz.name === undefined) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ON_ANONYMOUS_CLASS, clazz, `@Pipes must have names`);
    }
    const name = clazz.name.text;
    const type = new WrappedNodeExpr(clazz.name);
    if (decorator.args === null) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_NOT_CALLED, decorator.node, `@Pipe must be called`);
    }
    if (decorator.args.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, '@Pipe must have exactly one argument');
    }
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, '@Pipe must have a literal argument');
    }
    const pipe = reflectObjectLiteral(meta);

    if (!pipe.has('name')) {
      throw new FatalDiagnosticError(
          ErrorCode.PIPE_MISSING_NAME, meta, `@Pipe decorator is missing name field`);
    }
    const pipeNameExpr = pipe.get('name') !;
    const pipeName = staticallyResolve(pipeNameExpr, this.reflector, this.checker);
    if (typeof pipeName !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, pipeNameExpr, `@Pipe.name must be a string`);
    }
    this.scopeRegistry.registerPipe(clazz, pipeName);

    let pure = true;
    if (pipe.has('pure')) {
      const expr = pipe.get('pure') !;
      const pureValue = staticallyResolve(expr, this.reflector, this.checker);
      if (typeof pureValue !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `@Pipe.pure must be a boolean`);
      }
      pure = pureValue;
    }

    return {
      analysis: {
        meta: {
          name,
          type,
          pipeName,
          deps: getConstructorDependencies(clazz, this.reflector, this.isCore), pure,
        },
        metadataStmt: generateSetClassMetadataCall(clazz, this.reflector, this.isCore),
      },
    };
  }

  compile(node: ts.ClassDeclaration, analysis: PipeHandlerData): CompileResult {
    const res = compilePipeFromMetadata(analysis.meta);
    const statements = res.statements;
    if (analysis.metadataStmt !== null) {
      statements.push(analysis.metadataStmt);
    }
    return {
      name: 'ngPipeDef',
      initializer: res.expression, statements,
      type: res.type,
    };
  }
}
