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
} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Reference} from '../../imports';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {MetaKind} from '../../metadata';
import {PerfEvent} from '../../perf';
import {reflectObjectLiteral} from '../../reflection';
import {CompilationMode, HandlerPrecedence} from '../../transform';
import {
  compileDeclareFactory,
  compileNgFactoryDefField,
  compileResults,
  createValueHasWrongTypeError,
  extractClassMetadata,
  findAngularDecorator,
  getValidConstructorDependencies,
  makeDuplicateDeclarationError,
  toFactoryMetadata,
  unwrapExpression,
  wrapTypeReference,
} from '../common';
/**
 * Represents an Angular pipe.
 */
export class PipeSymbol extends SemanticSymbol {
  name;
  constructor(decl, name) {
    super(decl);
    this.name = name;
  }
  isPublicApiAffected(previousSymbol) {
    if (!(previousSymbol instanceof PipeSymbol)) {
      return true;
    }
    return this.name !== previousSymbol.name;
  }
  isTypeCheckApiAffected(previousSymbol) {
    return this.isPublicApiAffected(previousSymbol);
  }
}
export class PipeDecoratorHandler {
  reflector;
  evaluator;
  metaRegistry;
  scopeRegistry;
  injectableRegistry;
  isCore;
  perf;
  includeClassMetadata;
  compilationMode;
  generateExtraImportsInLocalMode;
  strictStandalone;
  implicitStandaloneValue;
  constructor(
    reflector,
    evaluator,
    metaRegistry,
    scopeRegistry,
    injectableRegistry,
    isCore,
    perf,
    includeClassMetadata,
    compilationMode,
    generateExtraImportsInLocalMode,
    strictStandalone,
    implicitStandaloneValue,
  ) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.metaRegistry = metaRegistry;
    this.scopeRegistry = scopeRegistry;
    this.injectableRegistry = injectableRegistry;
    this.isCore = isCore;
    this.perf = perf;
    this.includeClassMetadata = includeClassMetadata;
    this.compilationMode = compilationMode;
    this.generateExtraImportsInLocalMode = generateExtraImportsInLocalMode;
    this.strictStandalone = strictStandalone;
    this.implicitStandaloneValue = implicitStandaloneValue;
  }
  precedence = HandlerPrecedence.PRIMARY;
  name = 'PipeDecoratorHandler';
  detect(node, decorators) {
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
  analyze(clazz, decorator) {
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
    let pipeName = null;
    let pipeNameExpr = null;
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
      pipeNameExpr = pipe.get('name');
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
        const expr = pipe.get('pure');
        const pureValue = this.evaluator.evaluate(expr);
        if (typeof pureValue !== 'boolean') {
          throw createValueHasWrongTypeError(expr, pureValue, `@Pipe.pure must be a boolean`);
        }
        pure = pureValue;
      }
      if (pipe.has('standalone')) {
        const expr = pipe.get('standalone');
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
        decorator: decorator?.node ?? null,
      },
    };
  }
  symbol(node, analysis) {
    return new PipeSymbol(node, analysis.meta.pipeName ?? analysis.meta.name);
  }
  register(node, analysis) {
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
  resolve(node) {
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
  compileFull(node, analysis) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }
  compilePartial(node, analysis) {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compileDeclarePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileDeclareClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }
  compileLocal(node, analysis) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(fac, def, classMetadata, 'ɵpipe', null, null /* deferrableImports */);
  }
}
//# sourceMappingURL=pipe.js.map
