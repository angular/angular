/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileDeclarePipeFromMetadata, compilePipeFromMetadata, Identifiers, R3FactoryTarget, R3PipeDef, R3PipeMetadata, Statement, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {DefaultImportRecorder, Reference} from '../../imports';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {InjectableClassRegistry, MetadataRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, ResolveResult} from '../../transform';

import {createValueHasWrongTypeError} from './diagnostics';
import {compileNgFactoryDefField} from './factory';
import {generateSetClassMetadataCall} from './metadata';
import {findAngularDecorator, getValidConstructorDependencies, makeDuplicateDeclarationError, unwrapExpression, wrapTypeReference} from './util';

export interface PipeHandlerData {
  meta: R3PipeMetadata;
  metadataStmt: Statement|null;
}

/**
 * Represents an Angular pipe.
 */
export class PipeSymbol extends SemanticSymbol {
  constructor(decl: ClassDeclaration, public readonly name: string) {
    super(decl);
  }

  isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof PipeSymbol)) {
      return true;
    }

    return this.name !== previousSymbol.name;
  }

  isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    return this.isPublicApiAffected(previousSymbol);
  }
}

export class PipeDecoratorHandler implements
    DecoratorHandler<Decorator, PipeHandlerData, PipeSymbol, unknown> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private scopeRegistry: LocalModuleScopeRegistry,
      private defaultImportRecorder: DefaultImportRecorder,
      private injectableRegistry: InjectableClassRegistry, private isCore: boolean) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = PipeDecoratorHandler.name;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Pipe', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        decorator: decorator,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  analyze(clazz: ClassDeclaration, decorator: Readonly<Decorator>):
      AnalysisOutput<PipeHandlerData> {
    const name = clazz.name.text;
    const type = wrapTypeReference(this.reflector, clazz);
    const internalType = new WrappedNodeExpr(this.reflector.getInternalNameOfClass(clazz));

    if (decorator.args === null) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_NOT_CALLED, Decorator.nodeForError(decorator),
          `@Pipe must be called`);
    }
    if (decorator.args.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
          '@Pipe must have exactly one argument');
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
    const pipeNameExpr = pipe.get('name')!;
    const pipeName = this.evaluator.evaluate(pipeNameExpr);
    if (typeof pipeName !== 'string') {
      throw createValueHasWrongTypeError(pipeNameExpr, pipeName, `@Pipe.name must be a string`);
    }

    let pure = true;
    if (pipe.has('pure')) {
      const expr = pipe.get('pure')!;
      const pureValue = this.evaluator.evaluate(expr);
      if (typeof pureValue !== 'boolean') {
        throw createValueHasWrongTypeError(expr, pureValue, `@Pipe.pure must be a boolean`);
      }
      pure = pureValue;
    }

    return {
      analysis: {
        meta: {
          name,
          type,
          internalType,
          typeArgumentCount: this.reflector.getGenericArityOfClass(clazz) || 0,
          pipeName,
          deps: getValidConstructorDependencies(
              clazz, this.reflector, this.defaultImportRecorder, this.isCore),
          pure,
        },
        metadataStmt: generateSetClassMetadataCall(
            clazz, this.reflector, this.defaultImportRecorder, this.isCore),
      },
    };
  }

  symbol(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): PipeSymbol {
    return new PipeSymbol(node, analysis.meta.name);
  }

  register(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): void {
    const ref = new Reference(node);
    this.metaRegistry.registerPipeMetadata({ref, name: analysis.meta.pipeName});

    this.injectableRegistry.registerInjectable(node);
  }

  resolve(node: ClassDeclaration): ResolveResult<unknown> {
    const duplicateDeclData = this.scopeRegistry.getDuplicateDeclarations(node);
    if (duplicateDeclData !== null) {
      // This pipe was declared twice (or more).
      return {
        diagnostics: [makeDuplicateDeclarationError(node, duplicateDeclData, 'Pipe')],
      };
    }

    return {};
  }

  compileFull(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): CompileResult[] {
    const res = compilePipeFromMetadata(analysis.meta);
    return this.compilePipe(analysis, res);
  }

  compilePartial(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): CompileResult[] {
    const res = compileDeclarePipeFromMetadata(analysis.meta);
    return this.compilePipe(analysis, res);
  }

  private compilePipe(analysis: Readonly<PipeHandlerData>, def: R3PipeDef) {
    const factoryRes = compileNgFactoryDefField({
      ...analysis.meta,
      injectFn: Identifiers.directiveInject,
      target: R3FactoryTarget.Pipe,
    });
    if (analysis.metadataStmt !== null) {
      factoryRes.statements.push(analysis.metadataStmt);
    }
    return [
      factoryRes, {
        name: 'ɵpipe',
        initializer: def.expression,
        statements: [],
        type: def.type,
      }
    ];
  }
}
