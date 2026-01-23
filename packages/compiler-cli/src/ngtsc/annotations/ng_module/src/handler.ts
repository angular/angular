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
  compileDeclareInjectorFromMetadata,
  compileDeclareNgModuleFromMetadata,
  compileInjector,
  compileNgModule,
  Expression,
  ExternalExpr,
  FactoryTarget,
  FunctionExpr,
  InvokeFunctionExpr,
  LiteralArrayExpr,
  R3ClassMetadata,
  R3CompiledExpression,
  R3FactoryMetadata,
  R3Identifiers,
  R3InjectorMetadata,
  R3NgModuleMetadata,
  R3NgModuleMetadataKind,
  R3Reference,
  R3SelectorScopeMode,
  ReturnStatement,
  SchemaMetadata,
  Statement,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {
  ErrorCode,
  FatalDiagnosticError,
  makeDiagnostic,
  makeRelatedInformation,
} from '../../../diagnostics';
import {
  assertSuccessfulReferenceEmit,
  LocalCompilationExtraImportsTracker,
  Reference,
  ReferenceEmitter,
} from '../../../imports';
import {
  isArrayEqual,
  isReferenceEqual,
  isSymbolEqual,
  SemanticDepGraphUpdater,
  SemanticReference,
  SemanticSymbol,
} from '../../../incremental/semantic_graph';
import {
  ExportedProviderStatusResolver,
  MetadataReader,
  MetadataRegistry,
  MetaKind,
} from '../../../metadata';
import {
  DynamicValue,
  PartialEvaluator,
  ResolvedValue,
  SyntheticValue,
} from '../../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../../perf';
import {
  ClassDeclaration,
  DeclarationNode,
  Decorator,
  ReflectionHost,
  reflectObjectLiteral,
} from '../../../reflection';
import {LocalModuleScopeRegistry, ScopeData} from '../../../scope';
import {getDiagnosticNode} from '../../../scope/src/util';
import {
  AnalysisOutput,
  CompilationMode,
  CompileResult,
  DecoratorHandler,
  DetectResult,
  HandlerPrecedence,
  ResolveResult,
} from '../../../transform';
import {getSourceFile} from '../../../util/src/typescript';
import {
  combineResolvers,
  compileDeclareFactory,
  compileNgFactoryDefField,
  createForwardRefResolver,
  createValueHasWrongTypeError,
  extractClassMetadata,
  extractSchemas,
  findAngularDecorator,
  getProviderDiagnostics,
  getValidConstructorDependencies,
  InjectableClassRegistry,
  isExpressionForwardReference,
  JitDeclarationRegistry,
  ReferencesRegistry,
  resolveProvidersRequiringFactory,
  toR3Reference,
  unwrapExpression,
  wrapFunctionExpressionsInParens,
  wrapTypeReference,
} from '../../common';

import {
  createModuleWithProvidersResolver,
  isResolvedModuleWithProviders,
} from './module_with_providers';

export interface NgModuleAnalysis {
  mod: R3NgModuleMetadata;
  inj: R3InjectorMetadata;
  fac: R3FactoryMetadata;
  classMetadata: R3ClassMetadata | null;
  declarations: Reference<ClassDeclaration>[];
  rawDeclarations: ts.Expression | null;
  schemas: SchemaMetadata[];
  imports: TopLevelImportedExpression[];
  importRefs: Reference<ClassDeclaration>[];
  rawImports: ts.Expression | null;
  exports: Reference<ClassDeclaration>[];
  rawExports: ts.Expression | null;
  id: Expression | null;
  factorySymbolName: string;
  providersRequiringFactory: Set<Reference<ClassDeclaration>> | null;
  providers: ts.Expression | null;
  remoteScopesMayRequireCycleProtection: boolean;
  decorator: ts.Decorator | null;
}

export interface NgModuleResolution {
  injectorImports: Expression[];
}

/**
 * Represents an Angular NgModule.
 */
export class NgModuleSymbol extends SemanticSymbol {
  private remotelyScopedComponents: {
    component: SemanticSymbol;
    usedDirectives: SemanticReference[];
    usedPipes: SemanticReference[];
  }[] = [];

  /**
   * `SemanticSymbol`s of the transitive imports of this NgModule which came from imported
   * standalone components.
   *
   * Standalone components are excluded/included in the `InjectorDef` emit output of the NgModule
   * based on whether the compiler can prove that their transitive imports may contain exported
   * providers, so a change in this set of symbols may affect the compilation output of this
   * NgModule.
   */
  private transitiveImportsFromStandaloneComponents = new Set<SemanticSymbol>();

  constructor(
    decl: ClassDeclaration,
    public readonly hasProviders: boolean,
  ) {
    super(decl);
  }

  override isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    // Changes in the provider status of this NgModule affect downstream dependencies, which may
    // consider provider status in their own emits.
    if (previousSymbol.hasProviders !== this.hasProviders) {
      return true;
    }

    return false;
  }

  override isEmitAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    // compare our remotelyScopedComponents to the previous symbol
    if (previousSymbol.remotelyScopedComponents.length !== this.remotelyScopedComponents.length) {
      return true;
    }

    for (const currEntry of this.remotelyScopedComponents) {
      const prevEntry = previousSymbol.remotelyScopedComponents.find((prevEntry) => {
        return isSymbolEqual(prevEntry.component, currEntry.component);
      });

      if (prevEntry === undefined) {
        // No previous entry was found, which means that this component became remotely scoped and
        // hence this NgModule needs to be re-emitted.
        return true;
      }

      if (!isArrayEqual(currEntry.usedDirectives, prevEntry.usedDirectives, isReferenceEqual)) {
        // The list of used directives or their order has changed. Since this NgModule emits
        // references to the list of used directives, it should be re-emitted to update this list.
        // Note: the NgModule does not have to be re-emitted when any of the directives has had
        // their public API changed, as the NgModule only emits a reference to the symbol by its
        // name. Therefore, testing for symbol equality is sufficient.
        return true;
      }

      if (!isArrayEqual(currEntry.usedPipes, prevEntry.usedPipes, isReferenceEqual)) {
        return true;
      }
    }

    if (
      previousSymbol.transitiveImportsFromStandaloneComponents.size !==
      this.transitiveImportsFromStandaloneComponents.size
    ) {
      return true;
    }

    const previousImports = Array.from(previousSymbol.transitiveImportsFromStandaloneComponents);
    for (const transitiveImport of this.transitiveImportsFromStandaloneComponents) {
      const prevEntry = previousImports.find((prevEntry) =>
        isSymbolEqual(prevEntry, transitiveImport),
      );
      if (prevEntry === undefined) {
        return true;
      }

      if (transitiveImport.isPublicApiAffected(prevEntry)) {
        return true;
      }
    }

    return false;
  }

  override isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }

    return false;
  }

  addRemotelyScopedComponent(
    component: SemanticSymbol,
    usedDirectives: SemanticReference[],
    usedPipes: SemanticReference[],
  ): void {
    this.remotelyScopedComponents.push({component, usedDirectives, usedPipes});
  }

  addTransitiveImportFromStandaloneComponent(importedSymbol: SemanticSymbol): void {
    this.transitiveImportsFromStandaloneComponents.add(importedSymbol);
  }
}

/**
 * Compiles @NgModule annotations to ngModuleDef fields.
 */
export class NgModuleDecoratorHandler
  implements DecoratorHandler<Decorator, NgModuleAnalysis, NgModuleSymbol, NgModuleResolution>
{
  constructor(
    private reflector: ReflectionHost,
    private evaluator: PartialEvaluator,
    private metaReader: MetadataReader,
    private metaRegistry: MetadataRegistry,
    private scopeRegistry: LocalModuleScopeRegistry,
    private referencesRegistry: ReferencesRegistry,
    private exportedProviderStatusResolver: ExportedProviderStatusResolver,
    private semanticDepGraphUpdater: SemanticDepGraphUpdater | null,
    private isCore: boolean,
    private refEmitter: ReferenceEmitter,
    private annotateForClosureCompiler: boolean,
    private onlyPublishPublicTypings: boolean,
    private injectableRegistry: InjectableClassRegistry,
    private perf: PerfRecorder,
    private includeClassMetadata: boolean,
    private includeSelectorScope: boolean,
    private readonly compilationMode: CompilationMode,
    private readonly localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null,
    private readonly jitDeclarationRegistry: JitDeclarationRegistry,
    private readonly emitDeclarationOnly: boolean,
  ) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = 'NgModuleDecoratorHandler';

  detect(
    node: ClassDeclaration,
    decorators: Decorator[] | null,
  ): DetectResult<Decorator> | undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'NgModule', this.isCore);
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
  ): AnalysisOutput<NgModuleAnalysis> {
    this.perf.eventCount(PerfEvent.AnalyzeNgModule);

    const name = node.name.text;
    if (decorator.args === null || decorator.args.length > 1) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG,
        decorator.node,
        `Incorrect number of arguments to @NgModule decorator`,
      );
    }

    // @NgModule can be invoked without arguments. In case it is, pretend as if a blank object
    // literal was specified. This simplifies the code below.
    const meta =
      decorator.args.length === 1
        ? unwrapExpression(decorator.args[0])
        : ts.factory.createObjectLiteralExpression([]);

    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        meta,
        '@NgModule argument must be an object literal',
      );
    }
    const ngModule = reflectObjectLiteral(meta);

    if (ngModule.has('jit')) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      // The only allowed value is true, so there's no need to expand further.
      return {};
    }

    const forwardRefResolver = createForwardRefResolver(this.isCore);
    const moduleResolvers = combineResolvers([
      createModuleWithProvidersResolver(this.reflector, this.isCore),
      forwardRefResolver,
    ]);

    const allowUnresolvedReferences =
      this.compilationMode === CompilationMode.LOCAL && !this.emitDeclarationOnly;
    const diagnostics: ts.Diagnostic[] = [];

    // Resolving declarations
    let declarationRefs: Reference<ClassDeclaration>[] = [];
    const rawDeclarations: ts.Expression | null = ngModule.get('declarations') ?? null;
    if (rawDeclarations !== null) {
      const declarationMeta = this.evaluator.evaluate(rawDeclarations, forwardRefResolver);
      declarationRefs = this.resolveTypeList(
        rawDeclarations,
        declarationMeta,
        name,
        'declarations',
        0,
        allowUnresolvedReferences,
      ).references;

      // Look through the declarations to make sure they're all a part of the current compilation.
      for (const ref of declarationRefs) {
        if (ref.node.getSourceFile().isDeclarationFile) {
          const errorNode = ref.getOriginForDiagnostics(rawDeclarations);

          diagnostics.push(
            makeDiagnostic(
              ErrorCode.NGMODULE_INVALID_DECLARATION,
              errorNode,
              `Cannot declare '${ref.node.name.text}' in an NgModule as it's not a part of the current compilation.`,
              [makeRelatedInformation(ref.node.name, `'${ref.node.name.text}' is declared here.`)],
            ),
          );
        }
      }
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    // Resolving imports
    let importRefs: Reference<ClassDeclaration>[] = [];
    let rawImports: ts.Expression | null = ngModule.get('imports') ?? null;
    if (rawImports !== null) {
      const importsMeta = this.evaluator.evaluate(rawImports, moduleResolvers);

      const result = this.resolveTypeList(
        rawImports,
        importsMeta,
        name,
        'imports',
        0,
        allowUnresolvedReferences,
      );

      if (
        this.compilationMode === CompilationMode.LOCAL &&
        this.localCompilationExtraImportsTracker !== null
      ) {
        // For generating extra imports in local mode, the NgModule imports that are from external
        // files (i.e., outside of the compilation unit) are to be added to all the files in the
        // compilation unit. This is because any external component that is a dependency of some
        // component in the compilation unit must be imported by one of these NgModule's external
        // imports (or the external component cannot be a dependency of that internal component).
        // This approach can be further optimized by adding these NgModule external imports to a
        // subset of files in the compilation unit and not all. See comments in {@link
        // LocalCompilationExtraImportsTracker} and {@link
        // LocalCompilationExtraImportsTracker#addGlobalImportFromIdentifier} for more details.
        for (const d of result.dynamicValues) {
          this.localCompilationExtraImportsTracker.addGlobalImportFromIdentifier(d.node);
        }
      }

      importRefs = result.references;
    }

    // Resolving exports
    let exportRefs: Reference<ClassDeclaration>[] = [];
    const rawExports: ts.Expression | null = ngModule.get('exports') ?? null;
    if (rawExports !== null) {
      const exportsMeta = this.evaluator.evaluate(rawExports, moduleResolvers);
      exportRefs = this.resolveTypeList(
        rawExports,
        exportsMeta,
        name,
        'exports',
        0,
        allowUnresolvedReferences,
      ).references;
      this.referencesRegistry.add(node, ...exportRefs);
    }

    // Resolving bootstrap
    let bootstrapRefs: Reference<ClassDeclaration>[] = [];
    const rawBootstrap: ts.Expression | null = ngModule.get('bootstrap') ?? null;
    if (!allowUnresolvedReferences && rawBootstrap !== null) {
      const bootstrapMeta = this.evaluator.evaluate(rawBootstrap, forwardRefResolver);
      bootstrapRefs = this.resolveTypeList(
        rawBootstrap,
        bootstrapMeta,
        name,
        'bootstrap',
        0,
        /* allowUnresolvedReferences */ false,
      ).references;

      // Verify that the `@NgModule.bootstrap` list doesn't have Standalone Components.
      for (const ref of bootstrapRefs) {
        const dirMeta = this.metaReader.getDirectiveMetadata(ref);
        if (dirMeta?.isStandalone) {
          diagnostics.push(makeStandaloneBootstrapDiagnostic(node, ref, rawBootstrap));
        }
      }
    }

    let schemas: SchemaMetadata[] | undefined;
    try {
      schemas =
        this.compilationMode !== CompilationMode.LOCAL && ngModule.has('schemas')
          ? extractSchemas(ngModule.get('schemas')!, this.evaluator, 'NgModule')
          : [];
    } catch (e) {
      if (e instanceof FatalDiagnosticError) {
        diagnostics.push(e.toDiagnostic());

        // Use an empty schema array if schema extract fails.
        // A build will still fail in this case. However, for the language service,
        // this allows the module to exist in the compiler registry and prevents
        // cascading diagnostics within an IDE due to "missing" components. The
        // originating schema related errors will still be reported in the IDE.
        schemas = [];
      } else {
        throw e;
      }
    }

    let id: Expression | null = null;
    if (ngModule.has('id')) {
      const idExpr = ngModule.get('id')!;
      if (!isModuleIdExpression(idExpr)) {
        id = new WrappedNodeExpr(idExpr);
      } else {
        const diag = makeDiagnostic(
          ErrorCode.WARN_NGMODULE_ID_UNNECESSARY,
          idExpr,
          `Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by the Angular compiler.`,
        );
        diag.category = ts.DiagnosticCategory.Warning;
        diagnostics.push(diag);
      }
    }

    const valueContext = node.getSourceFile();

    const exportedNodes = new Set(exportRefs.map((ref) => ref.node));
    const declarations: R3Reference[] = [];
    const exportedDeclarations: Expression[] = [];

    const bootstrap = bootstrapRefs.map((bootstrap) =>
      this._toR3Reference(
        bootstrap.getOriginForDiagnostics(meta, node.name),
        bootstrap,
        valueContext,
      ),
    );

    for (const ref of declarationRefs) {
      const decl = this._toR3Reference(
        ref.getOriginForDiagnostics(meta, node.name),
        ref,
        valueContext,
      );
      declarations.push(decl);
      if (exportedNodes.has(ref.node)) {
        exportedDeclarations.push(decl.type);
      }
    }
    const imports = importRefs.map((imp) =>
      this._toR3Reference(imp.getOriginForDiagnostics(meta, node.name), imp, valueContext),
    );
    const exports = exportRefs.map((exp) =>
      this._toR3Reference(exp.getOriginForDiagnostics(meta, node.name), exp, valueContext),
    );

    const isForwardReference = (ref: R3Reference) =>
      isExpressionForwardReference(ref.value, node.name!, valueContext);
    const containsForwardDecls =
      bootstrap.some(isForwardReference) ||
      declarations.some(isForwardReference) ||
      imports.some(isForwardReference) ||
      exports.some(isForwardReference);

    const type = wrapTypeReference(this.reflector, node);

    let ngModuleMetadata: R3NgModuleMetadata;
    if (allowUnresolvedReferences) {
      ngModuleMetadata = {
        kind: R3NgModuleMetadataKind.Local,
        type,
        bootstrapExpression: rawBootstrap ? new WrappedNodeExpr(rawBootstrap) : null,
        declarationsExpression: rawDeclarations ? new WrappedNodeExpr(rawDeclarations) : null,
        exportsExpression: rawExports ? new WrappedNodeExpr(rawExports) : null,
        importsExpression: rawImports ? new WrappedNodeExpr(rawImports) : null,
        id,
        // Use `ɵɵsetNgModuleScope` to patch selector scopes onto the generated definition in a
        // tree-shakeable way.
        selectorScopeMode: R3SelectorScopeMode.SideEffect,
        // TODO: to be implemented as a part of FW-1004.
        schemas: [],
      };
    } else {
      ngModuleMetadata = {
        kind: R3NgModuleMetadataKind.Global,
        type,
        bootstrap,
        declarations,
        publicDeclarationTypes: this.onlyPublishPublicTypings ? exportedDeclarations : null,
        exports,
        imports,
        // Imported types are generally private, so include them unless restricting the .d.ts emit
        // to only public types.
        includeImportTypes: !this.onlyPublishPublicTypings,
        containsForwardDecls,
        id,
        // Use `ɵɵsetNgModuleScope` to patch selector scopes onto the generated definition in a
        // tree-shakeable way.
        selectorScopeMode: this.includeSelectorScope
          ? R3SelectorScopeMode.SideEffect
          : R3SelectorScopeMode.Omit,
        // TODO: to be implemented as a part of FW-1004.
        schemas: [],
      };
    }

    const rawProviders = ngModule.has('providers') ? ngModule.get('providers')! : null;
    let wrappedProviders: WrappedNodeExpr<ts.Expression> | null = null;

    // In most cases the providers will be an array literal. Check if it has any elements
    // and don't include the providers if it doesn't which saves us a few bytes.
    if (
      rawProviders !== null &&
      (!ts.isArrayLiteralExpression(rawProviders) || rawProviders.elements.length > 0)
    ) {
      wrappedProviders = new WrappedNodeExpr(
        this.annotateForClosureCompiler
          ? wrapFunctionExpressionsInParens(rawProviders)
          : rawProviders,
      );
    }

    const topLevelImports: TopLevelImportedExpression[] = [];
    if (!allowUnresolvedReferences && ngModule.has('imports')) {
      const rawImports = unwrapExpression(ngModule.get('imports')!);

      let topLevelExpressions: ts.Expression[] = [];
      if (ts.isArrayLiteralExpression(rawImports)) {
        for (const element of rawImports.elements) {
          if (ts.isSpreadElement(element)) {
            // Because `imports` allows nested arrays anyway, a spread expression (`...foo`) can be
            // treated the same as a direct reference to `foo`.
            topLevelExpressions.push(element.expression);
            continue;
          }
          topLevelExpressions.push(element);
        }
      } else {
        // Treat the whole `imports` expression as top-level.
        topLevelExpressions.push(rawImports);
      }

      let absoluteIndex = 0;
      for (const importExpr of topLevelExpressions) {
        const resolved = this.evaluator.evaluate(importExpr, moduleResolvers);

        const {references, hasModuleWithProviders} = this.resolveTypeList(
          importExpr,
          [resolved],
          node.name.text,
          'imports',
          absoluteIndex,
          /* allowUnresolvedReferences */ false,
        );
        absoluteIndex += references.length;

        topLevelImports.push({
          expression: importExpr,
          resolvedReferences: references,
          hasModuleWithProviders,
        });
      }
    }

    const injectorMetadata: R3InjectorMetadata = {
      name,
      type,
      providers: wrappedProviders,
      imports: [],
    };

    if (allowUnresolvedReferences) {
      // Adding NgModule's raw imports/exports to the injector's imports field in local compilation
      // mode.
      for (const exp of [rawImports, rawExports]) {
        if (exp === null) {
          continue;
        }

        if (ts.isArrayLiteralExpression(exp)) {
          // If array expression then add it entry-by-entry to the injector imports
          if (exp.elements) {
            injectorMetadata.imports.push(...exp.elements.map((n) => new WrappedNodeExpr(n)));
          }
        } else {
          // if not array expression then add it as is to the injector's imports field.
          injectorMetadata.imports.push(new WrappedNodeExpr(exp));
        }
      }
    }

    const factoryMetadata: R3FactoryMetadata = {
      name,
      type,
      typeArgumentCount: 0,
      deps: getValidConstructorDependencies(node, this.reflector, this.isCore),
      target: FactoryTarget.NgModule,
    };

    // Remote scoping is used when adding imports to a component file would create a cycle. In such
    // circumstances the component scope is monkey-patched from the NgModule file instead.
    //
    // However, if the NgModule itself has a cycle with the desired component/directive
    // reference(s), then we need to be careful. This can happen for example if an NgModule imports
    // a standalone component and the component also imports the NgModule.
    //
    // In this case, it'd be tempting to rely on the compiler's cycle detector to automatically put
    // such circular references behind a function/closure. This requires global knowledge of the
    // import graph though, and we don't want to depend on such techniques for new APIs like
    // standalone components.
    //
    // Instead, we look for `forwardRef`s in the NgModule dependencies - an explicit signal from the
    // user that a reference may not be defined until a circular import is resolved. If an NgModule
    // contains forward-referenced declarations or imports, we assume that remotely scoped
    // components should also guard against cycles using a closure-wrapped scope.
    //
    // The actual detection here is done heuristically. The compiler doesn't actually know whether
    // any given `Reference` came from a `forwardRef`, but it does know when a `Reference` came from
    // a `ForeignFunctionResolver` _like_ the `forwardRef` resolver. So we know when it's safe to
    // not use a closure, and will use one just in case otherwise.
    const remoteScopesMayRequireCycleProtection =
      declarationRefs.some(isSyntheticReference) || importRefs.some(isSyntheticReference);

    return {
      diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
      analysis: {
        id,
        schemas,
        mod: ngModuleMetadata,
        inj: injectorMetadata,
        fac: factoryMetadata,
        declarations: declarationRefs,
        rawDeclarations,
        imports: topLevelImports,
        rawImports,
        importRefs,
        exports: exportRefs,
        rawExports,
        providers: rawProviders,
        providersRequiringFactory: rawProviders
          ? resolveProvidersRequiringFactory(rawProviders, this.reflector, this.evaluator)
          : null,
        classMetadata: this.includeClassMetadata
          ? extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler)
          : null,
        factorySymbolName: node.name.text,
        remoteScopesMayRequireCycleProtection,
        decorator: (decorator?.node as ts.Decorator | null) ?? null,
      },
    };
  }

  symbol(node: ClassDeclaration, analysis: NgModuleAnalysis): NgModuleSymbol {
    return new NgModuleSymbol(node, analysis.providers !== null);
  }

  register(node: ClassDeclaration, analysis: NgModuleAnalysis): void {
    // Register this module's information with the LocalModuleScopeRegistry. This ensures that
    // during the compile() phase, the module's metadata is available for selector scope
    // computation.
    this.metaRegistry.registerNgModuleMetadata({
      kind: MetaKind.NgModule,
      ref: new Reference(node),
      schemas: analysis.schemas,
      declarations: analysis.declarations,
      imports: analysis.importRefs,
      exports: analysis.exports,
      rawDeclarations: analysis.rawDeclarations,
      rawImports: analysis.rawImports,
      rawExports: analysis.rawExports,
      decorator: analysis.decorator,
      mayDeclareProviders: analysis.providers !== null,
      isPoisoned: false,
    });

    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.fac.deps,
    });
  }

  resolve(
    node: ClassDeclaration,
    analysis: Readonly<NgModuleAnalysis>,
  ): ResolveResult<NgModuleResolution> {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }

    const scope = this.scopeRegistry.getScopeOfModule(node);
    const diagnostics: ts.Diagnostic[] = [];

    const scopeDiagnostics = this.scopeRegistry.getDiagnosticsOfModule(node);
    if (scopeDiagnostics !== null) {
      diagnostics.push(...scopeDiagnostics);
    }

    if (analysis.providersRequiringFactory !== null) {
      const providerDiagnostics = getProviderDiagnostics(
        analysis.providersRequiringFactory,
        analysis.providers!,
        this.injectableRegistry,
      );
      diagnostics.push(...providerDiagnostics);
    }

    const data: NgModuleResolution = {
      injectorImports: [],
    };

    // Add all top-level imports from the `imports` field to the injector imports.
    for (const topLevelImport of analysis.imports) {
      if (topLevelImport.hasModuleWithProviders) {
        // We have no choice but to emit expressions which contain MWPs, as we cannot filter on
        // individual references.
        data.injectorImports.push(new WrappedNodeExpr(topLevelImport.expression));
        continue;
      }

      const refsToEmit: Reference<ClassDeclaration>[] = [];
      let symbol: NgModuleSymbol | null = null;
      if (this.semanticDepGraphUpdater !== null) {
        const sym = this.semanticDepGraphUpdater.getSymbol(node) as NgModuleSymbol;
        if (sym instanceof NgModuleSymbol) {
          symbol = sym;
        }
      }

      for (const ref of topLevelImport.resolvedReferences) {
        const dirMeta = this.metaReader.getDirectiveMetadata(ref);
        if (dirMeta !== null) {
          if (!dirMeta.isComponent) {
            // Skip emit of directives in imports - directives can't carry providers.
            continue;
          }

          // Check whether this component has providers.
          const mayExportProviders = this.exportedProviderStatusResolver.mayExportProviders(
            dirMeta.ref,
            (importRef) => {
              // We need to keep track of which transitive imports were used to decide
              // `mayExportProviders`, since if those change in a future compilation this
              // NgModule will need to be re-emitted.
              if (symbol !== null && this.semanticDepGraphUpdater !== null) {
                const importSymbol = this.semanticDepGraphUpdater.getSymbol(importRef.node);
                symbol.addTransitiveImportFromStandaloneComponent(importSymbol);
              }
            },
          );

          if (!mayExportProviders) {
            // Skip emit of components that don't carry providers.
            continue;
          }
        }

        const pipeMeta = dirMeta === null ? this.metaReader.getPipeMetadata(ref) : null;
        if (pipeMeta !== null) {
          // Skip emit of pipes in imports - pipes can't carry providers.
          continue;
        }

        refsToEmit.push(ref);
      }

      if (refsToEmit.length === topLevelImport.resolvedReferences.length) {
        // All references within this top-level import should be emitted, so just use the user's
        // expression.
        data.injectorImports.push(new WrappedNodeExpr(topLevelImport.expression));
      } else {
        // Some references have been filtered out. Emit references to individual classes.
        const context = node.getSourceFile();
        for (const ref of refsToEmit) {
          const emittedRef = this.refEmitter.emit(ref, context);
          assertSuccessfulReferenceEmit(emittedRef, topLevelImport.expression, 'class');
          data.injectorImports.push(emittedRef.expression);
        }
      }
    }

    if (scope !== null && !scope.compilation.isPoisoned) {
      // Using the scope information, extend the injector's imports using the modules that are
      // specified as module exports.
      const context = getSourceFile(node);
      for (const exportRef of analysis.exports) {
        if (isNgModule(exportRef.node, scope.compilation)) {
          const type = this.refEmitter.emit(exportRef, context);
          assertSuccessfulReferenceEmit(type, node, 'NgModule');
          data.injectorImports.push(type.expression);
        }
      }

      for (const decl of analysis.declarations) {
        const dirMeta = this.metaReader.getDirectiveMetadata(decl);
        if (dirMeta !== null) {
          const refType = dirMeta.isComponent ? 'Component' : 'Directive';

          if (dirMeta.selector === null) {
            throw new FatalDiagnosticError(
              ErrorCode.DIRECTIVE_MISSING_SELECTOR,
              decl.node,
              `${refType} ${decl.node.name.text} has no selector, please add it!`,
            );
          }

          continue;
        }
      }
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    if (
      scope === null ||
      scope.compilation.isPoisoned ||
      scope.exported.isPoisoned ||
      scope.reexports === null
    ) {
      return {data};
    } else {
      return {
        data,
        reexports: scope.reexports,
      };
    }
  }

  compileFull(
    node: ClassDeclaration,
    {
      inj,
      mod,
      fac,
      classMetadata,
      declarations,
      remoteScopesMayRequireCycleProtection,
    }: Readonly<NgModuleAnalysis>,
    {injectorImports}: Readonly<NgModuleResolution>,
  ): CompileResult[] {
    const factoryFn = compileNgFactoryDefField(fac);
    const ngInjectorDef = compileInjector({
      ...inj,
      imports: injectorImports,
    });
    const ngModuleDef = compileNgModule(mod);
    const statements = ngModuleDef.statements;
    const metadata = classMetadata !== null ? compileClassMetadata(classMetadata) : null;
    this.insertMetadataStatement(statements, metadata);
    this.appendRemoteScopingStatements(
      statements,
      node,
      declarations,
      remoteScopesMayRequireCycleProtection,
    );

    return this.compileNgModule(factoryFn, ngInjectorDef, ngModuleDef);
  }

  compilePartial(
    node: ClassDeclaration,
    {inj, fac, mod, classMetadata}: Readonly<NgModuleAnalysis>,
    {injectorImports}: Readonly<NgModuleResolution>,
  ): CompileResult[] {
    const factoryFn = compileDeclareFactory(fac);
    const injectorDef = compileDeclareInjectorFromMetadata({
      ...inj,
      imports: injectorImports,
    });
    const ngModuleDef = compileDeclareNgModuleFromMetadata(mod);
    const metadata = classMetadata !== null ? compileDeclareClassMetadata(classMetadata) : null;
    this.insertMetadataStatement(ngModuleDef.statements, metadata);
    // NOTE: no remote scoping required as this is banned in partial compilation.
    return this.compileNgModule(factoryFn, injectorDef, ngModuleDef);
  }

  compileLocal(
    node: ClassDeclaration,
    {
      inj,
      mod,
      fac,
      classMetadata,
      declarations,
      remoteScopesMayRequireCycleProtection,
    }: Readonly<NgModuleAnalysis>,
  ): CompileResult[] {
    const factoryFn = compileNgFactoryDefField(fac);
    const ngInjectorDef = compileInjector({
      ...inj,
    });
    const ngModuleDef = compileNgModule(mod);
    const statements = ngModuleDef.statements;
    const metadata = classMetadata !== null ? compileClassMetadata(classMetadata) : null;
    this.insertMetadataStatement(statements, metadata);
    this.appendRemoteScopingStatements(
      statements,
      node,
      declarations,
      remoteScopesMayRequireCycleProtection,
    );

    return this.compileNgModule(factoryFn, ngInjectorDef, ngModuleDef);
  }

  /**
   * Add class metadata statements, if provided, to the `ngModuleStatements`.
   */
  private insertMetadataStatement(
    ngModuleStatements: Statement[],
    metadata: Expression | null,
  ): void {
    if (metadata !== null) {
      ngModuleStatements.unshift(metadata.toStmt());
    }
  }

  /**
   * Add remote scoping statements, as needed, to the `ngModuleStatements`.
   */
  private appendRemoteScopingStatements(
    ngModuleStatements: Statement[],
    node: ClassDeclaration,
    declarations: Reference<ClassDeclaration>[],
    remoteScopesMayRequireCycleProtection: boolean,
  ): void {
    // Local compilation mode generates its own runtimes to compute the dependencies. So there no
    // need to add remote scope statements (which also conflicts with local compilation runtimes)
    if (this.compilationMode === CompilationMode.LOCAL) {
      return;
    }
    const context = getSourceFile(node);
    for (const decl of declarations) {
      const remoteScope = this.scopeRegistry.getRemoteScope(decl.node);
      if (remoteScope !== null) {
        const directives = remoteScope.directives.map((directive) => {
          const type = this.refEmitter.emit(directive, context);
          assertSuccessfulReferenceEmit(type, node, 'directive');
          return type.expression;
        });
        const pipes = remoteScope.pipes.map((pipe) => {
          const type = this.refEmitter.emit(pipe, context);
          assertSuccessfulReferenceEmit(type, node, 'pipe');
          return type.expression;
        });
        const directiveArray = new LiteralArrayExpr(directives);
        const pipesArray = new LiteralArrayExpr(pipes);

        const directiveExpr =
          remoteScopesMayRequireCycleProtection && directives.length > 0
            ? new FunctionExpr([], [new ReturnStatement(directiveArray)])
            : directiveArray;
        const pipesExpr =
          remoteScopesMayRequireCycleProtection && pipes.length > 0
            ? new FunctionExpr([], [new ReturnStatement(pipesArray)])
            : pipesArray;
        const componentType = this.refEmitter.emit(decl, context);
        assertSuccessfulReferenceEmit(componentType, node, 'component');
        const declExpr = componentType.expression;
        const setComponentScope = new ExternalExpr(R3Identifiers.setComponentScope);
        const callExpr = new InvokeFunctionExpr(setComponentScope, [
          declExpr,
          directiveExpr,
          pipesExpr,
        ]);

        ngModuleStatements.push(callExpr.toStmt());
      }
    }
  }

  private compileNgModule(
    factoryFn: CompileResult,
    injectorDef: R3CompiledExpression,
    ngModuleDef: R3CompiledExpression,
  ): CompileResult[] {
    const res: CompileResult[] = [
      factoryFn,
      {
        name: 'ɵmod',
        initializer: ngModuleDef.expression,
        statements: ngModuleDef.statements,
        type: ngModuleDef.type,
        deferrableImports: null,
      },
      {
        name: 'ɵinj',
        initializer: injectorDef.expression,
        statements: injectorDef.statements,
        type: injectorDef.type,
        deferrableImports: null,
      },
    ];
    return res;
  }

  private _toR3Reference(
    origin: ts.Node,
    valueRef: Reference<ClassDeclaration>,
    valueContext: ts.SourceFile,
  ): R3Reference {
    if (valueRef.hasOwningModuleGuess) {
      return toR3Reference(origin, valueRef, valueContext, this.refEmitter);
    } else {
      return toR3Reference(origin, valueRef, valueContext, this.refEmitter);
    }
  }

  // Verify that a "Declaration" reference is a `ClassDeclaration` reference.
  private isClassDeclarationReference(ref: Reference): ref is Reference<ClassDeclaration> {
    return this.reflector.isClass(ref.node);
  }

  /**
   * Compute a list of `Reference`s from a resolved metadata value.
   */
  private resolveTypeList(
    expr: ts.Node,
    resolvedList: ResolvedValue,
    className: string,
    arrayName: string,
    absoluteIndex: number,
    allowUnresolvedReferences: boolean,
  ): {
    references: Reference<ClassDeclaration>[];
    hasModuleWithProviders: boolean;
    dynamicValues: DynamicValue[];
  } {
    let hasModuleWithProviders = false;
    const refList: Reference<ClassDeclaration>[] = [];
    const dynamicValueSet = new Set<DynamicValue>();

    if (!Array.isArray(resolvedList)) {
      if (allowUnresolvedReferences) {
        return {
          references: [],
          hasModuleWithProviders: false,
          dynamicValues: [],
        };
      }

      throw createValueHasWrongTypeError(
        expr,
        resolvedList,
        `Expected array when reading the NgModule.${arrayName} of ${className}`,
      );
    }

    for (let idx = 0; idx < resolvedList.length; idx++) {
      let entry = resolvedList[idx];
      // Unwrap ModuleWithProviders for modules that are locally declared (and thus static
      // resolution was able to descend into the function and return an object literal, a Map).
      if (entry instanceof SyntheticValue && isResolvedModuleWithProviders(entry)) {
        entry = entry.value.ngModule;
        hasModuleWithProviders = true;
      } else if (entry instanceof Map && entry.has('ngModule')) {
        entry = entry.get('ngModule')!;
        hasModuleWithProviders = true;
      }

      if (Array.isArray(entry)) {
        // Recurse into nested arrays.
        const recursiveResult = this.resolveTypeList(
          expr,
          entry,
          className,
          arrayName,
          absoluteIndex,
          allowUnresolvedReferences,
        );
        refList.push(...recursiveResult.references);

        for (const d of recursiveResult.dynamicValues) {
          dynamicValueSet.add(d);
        }

        absoluteIndex += recursiveResult.references.length;
        hasModuleWithProviders = hasModuleWithProviders || recursiveResult.hasModuleWithProviders;
      } else if (entry instanceof Reference) {
        if (!this.isClassDeclarationReference(entry)) {
          throw createValueHasWrongTypeError(
            entry.node,
            entry,
            `Value at position ${absoluteIndex} in the NgModule.${arrayName} of ${className} is not a class`,
          );
        }
        refList.push(entry);
        absoluteIndex += 1;
      } else if (entry instanceof DynamicValue && allowUnresolvedReferences) {
        dynamicValueSet.add(entry);
        continue;
      } else if (
        this.emitDeclarationOnly &&
        entry instanceof DynamicValue &&
        entry.isFromUnknownIdentifier()
      ) {
        throw createValueHasWrongTypeError(
          entry.node,
          entry,
          `Value at position ${absoluteIndex} in the NgModule.${arrayName} of ${className} is an external reference. ` +
            'External references in @NgModule declarations are not supported in experimental declaration-only emission mode',
        );
      } else {
        // TODO(alxhub): Produce a better diagnostic here - the array index may be an inner array.
        throw createValueHasWrongTypeError(
          expr,
          entry,
          `Value at position ${absoluteIndex} in the NgModule.${arrayName} of ${className} is not a reference`,
        );
      }
    }

    return {
      references: refList,
      hasModuleWithProviders,
      dynamicValues: [...dynamicValueSet],
    };
  }
}

function isNgModule(node: ClassDeclaration, compilation: ScopeData): boolean {
  return !compilation.dependencies.some((dep) => dep.ref.node === node);
}

/**
 * Checks whether the given `ts.Expression` is the expression `module.id`.
 */
function isModuleIdExpression(expr: ts.Expression): boolean {
  return (
    ts.isPropertyAccessExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === 'module' &&
    expr.name.text === 'id'
  );
}

export interface TopLevelImportedExpression {
  expression: ts.Expression;
  resolvedReferences: Array<Reference<ClassDeclaration>>;
  hasModuleWithProviders: boolean;
}

/**
 * Helper method to produce a diagnostics for a situation when a standalone component
 * is referenced in the `@NgModule.bootstrap` array.
 */
function makeStandaloneBootstrapDiagnostic(
  ngModuleClass: ClassDeclaration,
  bootstrappedClassRef: Reference<ClassDeclaration>,
  rawBootstrapExpr: ts.Expression | null,
): ts.Diagnostic {
  const componentClassName = bootstrappedClassRef.node.name.text;
  // Note: this error message should be aligned with the one produced by JIT.
  const message = //
    `The \`${componentClassName}\` class is a standalone component, which can ` +
    `not be used in the \`@NgModule.bootstrap\` array. Use the \`bootstrapApplication\` ` +
    `function for bootstrap instead.`;
  const relatedInformation: ts.DiagnosticRelatedInformation[] | undefined = [
    makeRelatedInformation(ngModuleClass, `The 'bootstrap' array is present on this NgModule.`),
  ];

  return makeDiagnostic(
    ErrorCode.NGMODULE_BOOTSTRAP_IS_STANDALONE,
    getDiagnosticNode(bootstrappedClassRef, rawBootstrapExpr),
    message,
    relatedInformation,
  );
}

function isSyntheticReference(ref: Reference<DeclarationNode>): boolean {
  return ref.synthetic;
}
