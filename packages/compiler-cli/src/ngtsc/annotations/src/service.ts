/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  compileClassMetadata,
  CompileClassMetadataFn,
  compileDeclareClassMetadata,
  compileDeclareServiceFromMetadata,
  compileService,
  FactoryTarget,
  R3ClassMetadata,
  R3CompiledExpression,
  R3ServiceMetadata,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnostic} from '../../diagnostics';
import {PartialEvaluator} from '../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../perf';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
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
  CompileFactoryFn,
  compileNgFactoryDefField,
  extractClassMetadata,
  findAngularDecorator,
  readBaseClass,
  toFactoryMetadata,
  wrapTypeReference,
} from '../common';

export interface ServiceHandlerData {
  meta: R3ServiceMetadata;
  classMetadata: R3ClassMetadata | null;
}

/**
 * Adapts the `compileService` compiler for `@Service` decorators to the Ivy compiler.
 */
export class ServiceDecoratorHandler implements DecoratorHandler<
  Decorator,
  ServiceHandlerData,
  null,
  unknown
> {
  constructor(
    private reflector: ReflectionHost,
    private evaluator: PartialEvaluator,
    private isCore: boolean,
    private perf: PerfRecorder,
    private includeClassMetadata: boolean,
    private readonly compilationMode: CompilationMode,
  ) {}

  readonly precedence = HandlerPrecedence.SHARED;
  readonly name = 'ServiceDecoratorHandler';

  detect(
    node: ClassDeclaration,
    decorators: Decorator[] | null,
  ): DetectResult<Decorator> | undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Service', this.isCore);
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
    node: ClassDeclaration,
    decorator: Readonly<Decorator>,
  ): AnalysisOutput<ServiceHandlerData> {
    this.perf.eventCount(PerfEvent.AnalyzeService);

    const decorators = this.reflector.getDecoratorsOfDeclaration(node);
    let diagnostics: ts.Diagnostic[] | undefined;

    if (decorators !== null && decorators.length > 1) {
      const nonServiceDecorator = decorators.find(
        (decorator) => decorator.import?.from === '@angular/core' && decorator.name !== 'Service',
      );

      if (nonServiceDecorator) {
        diagnostics ??= [];
        diagnostics.push(
          makeDiagnostic(
            ErrorCode.DECORATOR_COLLISION,
            nonServiceDecorator.node,
            'Cannot apply more than one Angular decorator on an @Service class.',
          ),
        );
      }
    }

    return {
      analysis: {
        meta: this.extractServiceMetadata(node, decorator),
        classMetadata: this.includeClassMetadata
          ? extractClassMetadata(node, this.reflector, this.isCore)
          : null,
      },
      diagnostics,
    };
  }

  symbol(): null {
    return null;
  }

  resolve(node: ClassDeclaration): ResolveResult<unknown> {
    const diagnostics = this.getDependencyInjectionDiagnostics(node);
    return diagnostics === null ? {} : {diagnostics};
  }

  compileFull(node: ClassDeclaration, analysis: Readonly<ServiceHandlerData>): CompileResult[] {
    return this.compile(
      compileNgFactoryDefField,
      (meta) => compileService(meta, false),
      compileClassMetadata,
      node,
      analysis,
    );
  }

  compilePartial(node: ClassDeclaration, analysis: Readonly<ServiceHandlerData>): CompileResult[] {
    return this.compile(
      compileDeclareFactory,
      compileDeclareServiceFromMetadata,
      compileDeclareClassMetadata,
      node,
      analysis,
    );
  }

  compileLocal(node: ClassDeclaration, analysis: Readonly<ServiceHandlerData>): CompileResult[] {
    return this.compile(
      compileNgFactoryDefField,
      (meta) => compileService(meta, false),
      compileClassMetadata,
      node,
      analysis,
    );
  }

  private compile(
    compileFactoryFn: CompileFactoryFn,
    compileServiceFn: (meta: R3ServiceMetadata) => R3CompiledExpression,
    compileClassMetadataFn: CompileClassMetadataFn,
    node: ClassDeclaration,
    analysis: Readonly<ServiceHandlerData>,
  ): CompileResult[] {
    const results: CompileResult[] = [];
    const meta = analysis.meta;
    const factoryRes = compileFactoryFn(
      toFactoryMetadata({...meta, deps: []}, FactoryTarget.Service),
    );
    if (analysis.classMetadata !== null) {
      factoryRes.statements.push(compileClassMetadataFn(analysis.classMetadata).toStmt());
    }
    results.push(factoryRes);

    const ɵprov = this.reflector.getMembersOfClass(node).find((member) => member.name === 'ɵprov');

    if (ɵprov !== undefined) {
      throw new FatalDiagnosticError(
        ErrorCode.INJECTABLE_DUPLICATE_PROV,
        ɵprov.nameNode || ɵprov.node || node,
        'Services cannot contain a static ɵprov property, because the compiler is going to generate one.',
      );
    }

    if (ɵprov === undefined) {
      // Only add a new ɵprov if there is not one already
      const res = compileServiceFn(analysis.meta);
      results.push({
        name: 'ɵprov',
        initializer: res.expression,
        statements: res.statements,
        type: res.type,
        deferrableImports: null,
      });
    }

    return results;
  }

  /**
   * Read metadata from the `@Service` decorator and produce the metadata needed to run
   * `compileService`.
   *
   * A `null` return value indicates this is `@Service` has invalid data.
   */
  private extractServiceMetadata(clazz: ClassDeclaration, decorator: Decorator): R3ServiceMetadata {
    const name = clazz.name.text;
    const type = wrapTypeReference(clazz);
    const typeArgumentCount = this.reflector.getGenericArityOfClass(clazz) || 0;
    if (decorator.args === null) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_NOT_CALLED,
        decorator.node,
        '@Service must be called',
      );
    }
    if (decorator.args.length === 0) {
      return {
        name,
        type,
        typeArgumentCount,
      };
    } else if (decorator.args.length === 1) {
      const metaNode = decorator.args[0];

      if (!ts.isObjectLiteralExpression(metaNode)) {
        throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL,
          metaNode,
          '@Service argument must be an object literal',
        );
      }

      // Resolve the fields of the literal into a map of field name to expression.
      const meta = reflectObjectLiteral(metaNode);
      let autoProvided: boolean | undefined;

      if (meta.has('autoProvided')) {
        const value = meta.get('autoProvided')!;

        if (value.kind !== ts.SyntaxKind.TrueKeyword && value.kind !== ts.SyntaxKind.FalseKeyword) {
          throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE,
            metaNode,
            '`autoProvided` property must be a boolean literal',
          );
        }

        autoProvided = value.kind === ts.SyntaxKind.TrueKeyword;
      }

      const result: R3ServiceMetadata = {name, type, typeArgumentCount, autoProvided};

      if (meta.has('factory')) {
        result.factory = new WrappedNodeExpr(meta.get('factory')!);
      }

      return result;
    } else {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG,
        decorator.args[2],
        'Too many arguments to @Service',
      );
    }
  }

  private getDependencyInjectionDiagnostics(node: ClassDeclaration): ts.Diagnostic[] | null {
    const ownCtorParams = this.reflector.getConstructorParameters(node);

    if (ownCtorParams !== null) {
      return ownCtorParams.length > 0 ? [makeConstructorDependencyInjectionDiagnostic(node)] : null;
    }

    // Don't traverse parent classes in local mode.
    if (this.compilationMode === CompilationMode.LOCAL) {
      return null;
    }

    let baseClass = readBaseClass(node, this.reflector, this.evaluator);

    while (baseClass !== null) {
      if (baseClass === 'dynamic') {
        return null;
      }

      const baseCtorParams = this.reflector.getConstructorParameters(baseClass.node);

      if (baseCtorParams !== null) {
        return baseCtorParams.length > 0
          ? [makeConstructorDependencyInjectionDiagnostic(node)]
          : null;
      }

      baseClass = readBaseClass(baseClass.node, this.reflector, this.evaluator);
    }

    return null;
  }
}

function makeConstructorDependencyInjectionDiagnostic(node: ClassDeclaration): ts.Diagnostic {
  return makeDiagnostic(
    ErrorCode.SERVICE_CONSTRUCTOR_DI,
    node.name,
    '@Service class cannot use constructor dependency injection. Use the `inject` function instead.',
  );
}
