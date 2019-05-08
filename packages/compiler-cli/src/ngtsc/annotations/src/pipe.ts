/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3PipeMetadata, Statement, WrappedNodeExpr, compilePipeFromMetadata} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {DefaultImportRecorder, Reference} from '../../imports';
import {MetadataRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {findAngularDecorator, getValidConstructorDependencies, unwrapExpression} from './util';

export interface PipeHandlerData {
  meta: R3PipeMetadata;
  metadataStmt: Statement|null;
}

export class PipeDecoratorHandler implements DecoratorHandler<PipeHandlerData, Decorator> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private defaultImportRecorder: DefaultImportRecorder,
      private isCore: boolean) {}

  readonly precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Pipe', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  analyze(clazz: ClassDeclaration, decorator: Decorator): AnalysisOutput<PipeHandlerData> {
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
    const pipeName = this.evaluator.evaluate(pipeNameExpr);
    if (typeof pipeName !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, pipeNameExpr, `@Pipe.name must be a string`);
    }
    const ref = new Reference(clazz);
    this.metaRegistry.registerPipeMetadata({ref, name: pipeName});

    let pure = true;
    if (pipe.has('pure')) {
      const expr = pipe.get('pure') !;
      const pureValue = this.evaluator.evaluate(expr);
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
          typeArgumentCount: this.reflector.getGenericArityOfClass(clazz) || 0, pipeName,
          deps: getValidConstructorDependencies(
              clazz, this.reflector, this.defaultImportRecorder, this.isCore),
          pure,
        },
        metadataStmt: generateSetClassMetadataCall(
            clazz, this.reflector, this.defaultImportRecorder, this.isCore),
      },
    };
  }

  compile(node: ClassDeclaration, analysis: PipeHandlerData): CompileResult {
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
