/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  compileClassMetadata,
  compileDeclareClassMetadata,
  compileDeclarePipeFromMetadata,
  compilePipeFromMetadata,
  FactoryTarget,
  R3ClassMetadata,
  R3PipeMetadata,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Reference} from '../../imports';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {MetadataRegistry, MetaKind} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../perf';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {
  AnalysisOutput,
  CompilationMode,
  CompileResult,
  DecoratorHandler,
  DetectResult,
  HandlerPrecedence,
  ResolveResult,
} from '../../transform';
import {
  compileDeclareFactory,
  compileNgFactoryDefField,
  compileResults,
  createValueHasWrongTypeError,
  extractClassMetadata,
  findAngularDecorator,
  getValidConstructorDependencies,
  InjectableClassRegistry,
  makeDuplicateDeclarationError,
  toFactoryMetadata,
  unwrapExpression,
  wrapTypeReference,
} from '../common';

export interface PipeHandlerData {
  meta: R3PipeMetadata;
  classMetadata: R3ClassMetadata | null;
  pipeNameExpr: ts.Expression | null;
  decorator: ts.Decorator | null;
}

/**
 * Represents an Angular pipe.
 */
export class PipeSymbol extends SemanticSymbol {
  constructor(
    decl: ClassDeclaration,
    public readonly name: string,
  ) {
    super(decl);
  }

  override isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof PipeSymbol)) {
      return true;
    }

    return this.name !== previousSymbol.name;
  }

  override isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    return this.isPublicApiAffected(previousSymbol);
  }
}

export class PipeDecoratorHandler
  implements DecoratorHandler<Decorator, PipeHandlerData, PipeSymbol, unknown>
{
  constructor(
    private reflector: ReflectionHost,
    private evaluator: PartialEvaluator,
    private metaRegistry: MetadataRegistry,
    private scopeRegistry: LocalModuleScopeRegistry,
    private injectableRegistry: InjectableClassRegistry,
    private isCore: boolean,
    private perf: PerfRecorder,
    private includeClassMetadata: boolean,
    private readonly compilationMode: CompilationMode,
    private readonly generateExtraImportsInLocalMode: boolean,
    private readonly strictStandalone: boolean,
    private readonly implicitStandaloneValue: boolean,
  ) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = 'PipeDecoratorHandler';

  detect(
    node: ClassDeclaration,
    decorators: Decorator[] | null,
  ): DetectResult<Decorator> | undefined {
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

  analyze(
    clazz: ClassDeclaration,
    decorator: Readonly<Decorator>,
  ): AnalysisOutput<PipeHandlerData> {
    this.perf.eventCount(PerfEvent.AnalyzePipe);

    const name = clazz.name.text;
    const type = wrapTypeReference(this.reflector, clazz);

    if (decorator.args === null) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_NOT_CALLED,
        decorator.node,
        `@Pipe must be called`,
      );
    }

    const meta =
      decorator.args.length === 0 ||
      // TODO(crisbeto): temporary for testing until we've changed
      // the pipe public API not to require a name.
      (ts.isNonNullExpression(decorator.args[0]) &&
        decorator.args[0].expression.kind === ts.SyntaxKind.NullKeyword)
        ? null
        : unwrapExpression(decorator.args[0]);
    let pipeName: string | null = null;
    let pipeNameExpr: ts.Expression | null = null;
    let pure = true;
    let isStandalone = this.implicitStandaloneValue;

    if (meta !== null) {
      if (!ts.isObjectLiteralExpression(meta)) {
        throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL,
          meta,
          '@Pipe must have a literal argument',
        );
      }

      const pipe = reflectObjectLiteral(meta);
      if (!pipe.has('name')) {
        throw new FatalDiagnosticError(
          ErrorCode.PIPE_MISSING_NAME,
          meta,
          `@Pipe decorator is missing name field`,
        );
      }
      pipeNameExpr = pipe.get('name')!;
      const evaluatedName = this.evaluator.evaluate(pipeNameExpr);
      if (typeof evaluatedName !== 'string') {
        throw createValueHasWrongTypeError(
          pipeNameExpr,
          evaluatedName,
          `@Pipe.name must be a string`,
        );
      }
      pipeName = evaluatedName;

      if (pipe.has('pure')) {
        const expr = pipe.get('pure')!;
        const pureValue = this.evaluator.evaluate(expr);
        if (typeof pureValue !== 'boolean') {
          throw createValueHasWrongTypeError(expr, pureValue, `@Pipe.pure must be a boolean`);
        }
        pure = pureValue;
      }

      if (pipe.has('standalone')) {
        const expr = pipe.get('standalone')!;
        const resolved = this.evaluator.evaluate(expr);
        if (typeof resolved !== 'boolean') {
          throw createValueHasWrongTypeError(expr, resolved, `standalone flag must be a boolean`);
        }
        isStandalone = resolved;

        if (!isStandalone && this.strictStandalone) {
          throw new FatalDiagnosticError(
            ErrorCode.NON_STANDALONE_NOT_ALLOWED,
            expr,
            `Only standalone pipes are allowed when 'strictStandalone' is enabled.`,
          );
        }
      }
    }

    return {
      analysis: {
        meta: {
          name,
          type,
          typeArgumentCount: this.reflector.getGenericArityOfClass(clazz) || 0,
          pipeName,
          deps: getValidConstructorDependencies(clazz, this.reflector, this.isCore),
          pure,
          isStandalone,
        },
        classMetadata: this.includeClassMetadata
          ? extractClassMetadata(clazz, this.reflector, this.isCore)
          : null,
        pipeNameExpr,
        decorator: (decorator?.node as ts.Decorator | null) ?? null,
      },
    };
  }

  symbol(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): PipeSymbol {
    return new PipeSymbol(node, analysis.meta.pipeName ?? analysis.meta.name);
  }

  register(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): void {
    const ref = new Reference(node);
    this.metaRegistry.registerPipeMetadata({
      kind: MetaKind.Pipe,
      ref,
      name: analysis.meta.pipeName,
      nameExpr: analysis.pipeNameExpr,
      isStandalone: analysis.meta.isStandalone,
      decorator: analysis.decorator,
      isExplicitlyDeferred: false,
      isPure: analysis.meta.pure,
    });

    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps,
    });
  }

  resolve(node: ClassDeclaration): ResolveResult<unknown> {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }

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
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }

  compilePartial(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): CompileResult[] {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compileDeclarePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileDeclareClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }

  compileLocal(node: ClassDeclaration, analysis: Readonly<PipeHandlerData>): CompileResult[] {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }
}
