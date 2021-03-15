/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/compiler';
import * as ts from 'typescript';

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, NoopReferencesRegistry, PipeDecoratorHandler, ReferencesRegistry} from '../../annotations';
import {CycleAnalyzer, CycleHandlingStrategy, ImportGraph} from '../../cycles';
import {COMPILER_ERRORS_WITH_GUIDES, ERROR_DETAILS_PAGE_BASE_URL, ErrorCode, ngErrorCode} from '../../diagnostics';
import {checkForPrivateExports, ReferenceGraph} from '../../entry_point';
import {LogicalFileSystem, resolve} from '../../file_system';
import {AbsoluteModuleStrategy, AliasingHost, AliasStrategy, DefaultImportTracker, ImportRewriter, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, NoopImportRewriter, PrivateExportAliasingHost, R3SymbolsImportRewriter, Reference, ReferenceEmitStrategy, ReferenceEmitter, RelativePathStrategy, UnifiedModulesAliasingHost, UnifiedModulesStrategy} from '../../imports';
import {IncrementalBuildStrategy, IncrementalDriver} from '../../incremental';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {generateAnalysis, IndexedComponent, IndexingContext} from '../../indexer';
import {ComponentResources, CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, InjectableClassRegistry, LocalMetadataRegistry, MetadataReader, ResourceRegistry} from '../../metadata';
import {ModuleWithProvidersScanner} from '../../modulewithproviders';
import {PartialEvaluator} from '../../partial_evaluator';
import {ActivePerfRecorder} from '../../perf';
import {PerfCheckpoint, PerfEvent, PerfPhase} from '../../perf/src/api';
import {DelegatingPerfRecorder} from '../../perf/src/recorder';
import {DeclarationNode, isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {AdapterResourceLoader} from '../../resource';
import {entryPointKeyFor, NgModuleRouteAnalyzer} from '../../routing';
import {ComponentScopeReader, LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver, TypeCheckScopeRegistry} from '../../scope';
import {generatedFactoryTransform} from '../../shims';
import {ivySwitchTransform} from '../../switch';
import {aliasTransformFactory, CompilationMode, declarationTransformFactory, DecoratorHandler, DtsTransformRegistry, ivyTransformFactory, TraitCompiler} from '../../transform';
import {TemplateTypeCheckerImpl} from '../../typecheck';
import {OptimizeFor, TemplateTypeChecker, TypeCheckingConfig, TypeCheckingProgramStrategy} from '../../typecheck/api';
import {getSourceFileOrNull, isDtsPath, resolveModuleName} from '../../util/src/typescript';
import {LazyRoute, NgCompilerAdapter, NgCompilerOptions} from '../api';

import {compileUndecoratedClassesWithAngularFeatures} from './config';

/**
 * State information about a compilation which is only generated once some data is requested from
 * the `NgCompiler` (for example, by calling `getDiagnostics`).
 */
interface LazyCompilationState {
  isCore: boolean;
  traitCompiler: TraitCompiler;
  reflector: TypeScriptReflectionHost;
  metaReader: MetadataReader;
  scopeRegistry: LocalModuleScopeRegistry;
  typeCheckScopeRegistry: TypeCheckScopeRegistry;
  exportReferenceGraph: ReferenceGraph|null;
  routeAnalyzer: NgModuleRouteAnalyzer;
  dtsTransforms: DtsTransformRegistry;
  mwpScanner: ModuleWithProvidersScanner;
  defaultImportTracker: DefaultImportTracker;
  aliasingHost: AliasingHost|null;
  refEmitter: ReferenceEmitter;
  templateTypeChecker: TemplateTypeChecker;
  resourceRegistry: ResourceRegistry;
}



/**
 * Discriminant type for a `CompilationTicket`.
 */
export enum CompilationTicketKind {
  Fresh,
  IncrementalTypeScript,
  IncrementalResource,
}

/**
 * Begin an Angular compilation operation from scratch.
 */
export interface FreshCompilationTicket {
  kind: CompilationTicketKind.Fresh;
  options: NgCompilerOptions;
  incrementalBuildStrategy: IncrementalBuildStrategy;
  typeCheckingProgramStrategy: TypeCheckingProgramStrategy;
  enableTemplateTypeChecker: boolean;
  usePoisonedData: boolean;
  tsProgram: ts.Program;
  perfRecorder: ActivePerfRecorder;
}

/**
 * Begin an Angular compilation operation that incorporates changes to TypeScript code.
 */
export interface IncrementalTypeScriptCompilationTicket {
  kind: CompilationTicketKind.IncrementalTypeScript;
  options: NgCompilerOptions;
  oldProgram: ts.Program;
  newProgram: ts.Program;
  incrementalBuildStrategy: IncrementalBuildStrategy;
  typeCheckingProgramStrategy: TypeCheckingProgramStrategy;
  newDriver: IncrementalDriver;
  enableTemplateTypeChecker: boolean;
  usePoisonedData: boolean;
  perfRecorder: ActivePerfRecorder;
}

export interface IncrementalResourceCompilationTicket {
  kind: CompilationTicketKind.IncrementalResource;
  compiler: NgCompiler;
  modifiedResourceFiles: Set<string>;
  perfRecorder: ActivePerfRecorder;
}

/**
 * A request to begin Angular compilation, either starting from scratch or from a known prior state.
 *
 * `CompilationTicket`s are used to initialize (or update) an `NgCompiler` instance, the core of the
 * Angular compiler. They abstract the starting state of compilation and allow `NgCompiler` to be
 * managed independently of any incremental compilation lifecycle.
 */
export type CompilationTicket = FreshCompilationTicket|IncrementalTypeScriptCompilationTicket|
    IncrementalResourceCompilationTicket;

/**
 * Create a `CompilationTicket` for a brand new compilation, using no prior state.
 */
export function freshCompilationTicket(
    tsProgram: ts.Program, options: NgCompilerOptions,
    incrementalBuildStrategy: IncrementalBuildStrategy,
    typeCheckingProgramStrategy: TypeCheckingProgramStrategy, perfRecorder: ActivePerfRecorder|null,
    enableTemplateTypeChecker: boolean, usePoisonedData: boolean): CompilationTicket {
  return {
    kind: CompilationTicketKind.Fresh,
    tsProgram,
    options,
    incrementalBuildStrategy,
    typeCheckingProgramStrategy,
    enableTemplateTypeChecker,
    usePoisonedData,
    perfRecorder: perfRecorder ?? ActivePerfRecorder.zeroedToNow(),
  };
}

/**
 * Create a `CompilationTicket` as efficiently as possible, based on a previous `NgCompiler`
 * instance and a new `ts.Program`.
 */
export function incrementalFromCompilerTicket(
    oldCompiler: NgCompiler, newProgram: ts.Program,
    incrementalBuildStrategy: IncrementalBuildStrategy,
    typeCheckingProgramStrategy: TypeCheckingProgramStrategy, modifiedResourceFiles: Set<string>,
    perfRecorder: ActivePerfRecorder|null): CompilationTicket {
  const oldProgram = oldCompiler.getNextProgram();
  const oldDriver = oldCompiler.incrementalStrategy.getIncrementalDriver(oldProgram);
  if (oldDriver === null) {
    // No incremental step is possible here, since no IncrementalDriver was found for the old
    // program.
    return freshCompilationTicket(
        newProgram, oldCompiler.options, incrementalBuildStrategy, typeCheckingProgramStrategy,
        perfRecorder, oldCompiler.enableTemplateTypeChecker, oldCompiler.usePoisonedData);
  }

  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }

  const newDriver = IncrementalDriver.reconcile(
      oldProgram, oldDriver, newProgram, modifiedResourceFiles, perfRecorder);

  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    enableTemplateTypeChecker: oldCompiler.enableTemplateTypeChecker,
    usePoisonedData: oldCompiler.usePoisonedData,
    options: oldCompiler.options,
    incrementalBuildStrategy,
    typeCheckingProgramStrategy,
    newDriver,
    oldProgram,
    newProgram,
    perfRecorder,
  };
}

/**
 * Create a `CompilationTicket` directly from an old `ts.Program` and associated Angular compilation
 * state, along with a new `ts.Program`.
 */
export function incrementalFromDriverTicket(
    oldProgram: ts.Program, oldDriver: IncrementalDriver, newProgram: ts.Program,
    options: NgCompilerOptions, incrementalBuildStrategy: IncrementalBuildStrategy,
    typeCheckingProgramStrategy: TypeCheckingProgramStrategy, modifiedResourceFiles: Set<string>,
    perfRecorder: ActivePerfRecorder|null, enableTemplateTypeChecker: boolean,
    usePoisonedData: boolean): CompilationTicket {
  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }

  const newDriver = IncrementalDriver.reconcile(
      oldProgram, oldDriver, newProgram, modifiedResourceFiles, perfRecorder);
  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    oldProgram,
    newProgram,
    options,
    incrementalBuildStrategy,
    newDriver,
    typeCheckingProgramStrategy,
    enableTemplateTypeChecker,
    usePoisonedData,
    perfRecorder,
  };
}

export function resourceChangeTicket(compiler: NgCompiler, modifiedResourceFiles: Set<string>):
    IncrementalResourceCompilationTicket {
  return {
    kind: CompilationTicketKind.IncrementalResource,
    compiler,
    modifiedResourceFiles,
    perfRecorder: ActivePerfRecorder.zeroedToNow(),
  };
}


/**
 * The heart of the Angular Ivy compiler.
 *
 * The `NgCompiler` provides an API for performing Angular compilation within a custom TypeScript
 * compiler. Each instance of `NgCompiler` supports a single compilation, which might be
 * incremental.
 *
 * `NgCompiler` is lazy, and does not perform any of the work of the compilation until one of its
 * output methods (e.g. `getDiagnostics`) is called.
 *
 * See the README.md for more information.
 */
export class NgCompiler {
  /**
   * Lazily evaluated state of the compilation.
   *
   * This is created on demand by calling `ensureAnalyzed`.
   */
  private compilation: LazyCompilationState|null = null;

  /**
   * Any diagnostics related to the construction of the compilation.
   *
   * These are diagnostics which arose during setup of the host and/or program.
   */
  private constructionDiagnostics: ts.Diagnostic[] = [];

  /**
   * Non-template diagnostics related to the program itself. Does not include template
   * diagnostics because the template type checker memoizes them itself.
   *
   * This is set by (and memoizes) `getNonTemplateDiagnostics`.
   */
  private nonTemplateDiagnostics: ts.Diagnostic[]|null = null;

  private closureCompilerEnabled: boolean;
  private nextProgram: ts.Program;
  private entryPoint: ts.SourceFile|null;
  private moduleResolver: ModuleResolver;
  private resourceManager: AdapterResourceLoader;
  private cycleAnalyzer: CycleAnalyzer;
  readonly ignoreForDiagnostics: Set<ts.SourceFile>;
  readonly ignoreForEmit: Set<ts.SourceFile>;

  /**
   * `NgCompiler` can be reused for multiple compilations (for resource-only changes), and each
   * new compilation uses a fresh `PerfRecorder`. Thus, classes created with a lifespan of the
   * `NgCompiler` use a `DelegatingPerfRecorder` so the `PerfRecorder` they write to can be updated
   * with each fresh compilation.
   */
  private delegatingPerfRecorder = new DelegatingPerfRecorder(this.perfRecorder);

  /**
   * Convert a `CompilationTicket` into an `NgCompiler` instance for the requested compilation.
   *
   * Depending on the nature of the compilation request, the `NgCompiler` instance may be reused
   * from a previous compilation and updated with any changes, it may be a new instance which
   * incrementally reuses state from a previous compilation, or it may represent a fresh
   * compilation entirely.
   */
  static fromTicket(ticket: CompilationTicket, adapter: NgCompilerAdapter) {
    switch (ticket.kind) {
      case CompilationTicketKind.Fresh:
        return new NgCompiler(
            adapter,
            ticket.options,
            ticket.tsProgram,
            ticket.typeCheckingProgramStrategy,
            ticket.incrementalBuildStrategy,
            IncrementalDriver.fresh(ticket.tsProgram),
            ticket.enableTemplateTypeChecker,
            ticket.usePoisonedData,
            ticket.perfRecorder,
        );
      case CompilationTicketKind.IncrementalTypeScript:
        return new NgCompiler(
            adapter,
            ticket.options,
            ticket.newProgram,
            ticket.typeCheckingProgramStrategy,
            ticket.incrementalBuildStrategy,
            ticket.newDriver,
            ticket.enableTemplateTypeChecker,
            ticket.usePoisonedData,
            ticket.perfRecorder,
        );
      case CompilationTicketKind.IncrementalResource:
        const compiler = ticket.compiler;
        compiler.updateWithChangedResources(ticket.modifiedResourceFiles, ticket.perfRecorder);
        return compiler;
    }
  }

  private constructor(
      private adapter: NgCompilerAdapter,
      readonly options: NgCompilerOptions,
      private tsProgram: ts.Program,
      readonly typeCheckingProgramStrategy: TypeCheckingProgramStrategy,
      readonly incrementalStrategy: IncrementalBuildStrategy,
      readonly incrementalDriver: IncrementalDriver,
      readonly enableTemplateTypeChecker: boolean,
      readonly usePoisonedData: boolean,
      private livePerfRecorder: ActivePerfRecorder,
  ) {
    this.constructionDiagnostics.push(...this.adapter.constructionDiagnostics);
    const incompatibleTypeCheckOptionsDiagnostic = verifyCompatibleTypeCheckOptions(this.options);
    if (incompatibleTypeCheckOptionsDiagnostic !== null) {
      this.constructionDiagnostics.push(incompatibleTypeCheckOptionsDiagnostic);
    }

    this.nextProgram = tsProgram;
    this.closureCompilerEnabled = !!this.options.annotateForClosureCompiler;

    this.entryPoint =
        adapter.entryPoint !== null ? getSourceFileOrNull(tsProgram, adapter.entryPoint) : null;

    const moduleResolutionCache = ts.createModuleResolutionCache(
        this.adapter.getCurrentDirectory(),
        // doen't retain a reference to `this`, if other closures in the constructor here reference
        // `this` internally then a closure created here would retain them. This can cause major
        // memory leak issues since the `moduleResolutionCache` is a long-lived object and finds its
        // way into all kinds of places inside TS internal objects.
        this.adapter.getCanonicalFileName.bind(this.adapter));
    this.moduleResolver =
        new ModuleResolver(tsProgram, this.options, this.adapter, moduleResolutionCache);
    this.resourceManager = new AdapterResourceLoader(adapter, this.options);
    this.cycleAnalyzer =
        new CycleAnalyzer(new ImportGraph(tsProgram.getTypeChecker(), this.delegatingPerfRecorder));
    this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, tsProgram);

    this.ignoreForDiagnostics =
        new Set(tsProgram.getSourceFiles().filter(sf => this.adapter.isShim(sf)));
    this.ignoreForEmit = this.adapter.ignoreForEmit;

    let dtsFileCount = 0;
    let nonDtsFileCount = 0;
    for (const sf of tsProgram.getSourceFiles()) {
      if (sf.isDeclarationFile) {
        dtsFileCount++;
      } else {
        nonDtsFileCount++;
      }
    }

    livePerfRecorder.eventCount(PerfEvent.InputDtsFile, dtsFileCount);
    livePerfRecorder.eventCount(PerfEvent.InputTsFile, nonDtsFileCount);
  }

  get perfRecorder(): ActivePerfRecorder {
    return this.livePerfRecorder;
  }

  private updateWithChangedResources(
      changedResources: Set<string>, perfRecorder: ActivePerfRecorder): void {
    this.livePerfRecorder = perfRecorder;
    this.delegatingPerfRecorder.target = perfRecorder;

    perfRecorder.inPhase(PerfPhase.ResourceUpdate, () => {
      if (this.compilation === null) {
        // Analysis hasn't happened yet, so no update is necessary - any changes to resources will
        // be captured by the inital analysis pass itself.
        return;
      }

      this.resourceManager.invalidate();

      const classesToUpdate = new Set<DeclarationNode>();
      for (const resourceFile of changedResources) {
        for (const templateClass of this.getComponentsWithTemplateFile(resourceFile)) {
          classesToUpdate.add(templateClass);
        }

        for (const styleClass of this.getComponentsWithStyleFile(resourceFile)) {
          classesToUpdate.add(styleClass);
        }
      }

      for (const clazz of classesToUpdate) {
        this.compilation.traitCompiler.updateResources(clazz);
        if (!ts.isClassDeclaration(clazz)) {
          continue;
        }

        this.compilation.templateTypeChecker.invalidateClass(clazz);
      }
    });
  }

  /**
   * Get the resource dependencies of a file.
   *
   * If the file is not part of the compilation, an empty array will be returned.
   */
  getResourceDependencies(file: ts.SourceFile): string[] {
    this.ensureAnalyzed();

    return this.incrementalDriver.depGraph.getResourceDependencies(file);
  }

  /**
   * Get all Angular-related diagnostics for this compilation.
   */
  getDiagnostics(): ts.Diagnostic[] {
    return this.addMessageTextDetails(
        [...this.getNonTemplateDiagnostics(), ...this.getTemplateDiagnostics()]);
  }

  /**
   * Get all Angular-related diagnostics for this compilation.
   *
   * If a `ts.SourceFile` is passed, only diagnostics related to that file are returned.
   */
  getDiagnosticsForFile(file: ts.SourceFile, optimizeFor: OptimizeFor): ts.Diagnostic[] {
    return this.addMessageTextDetails([
      ...this.getNonTemplateDiagnostics().filter(diag => diag.file === file),
      ...this.getTemplateDiagnosticsForFile(file, optimizeFor)
    ]);
  }

  /**
   * Add Angular.io error guide links to diagnostics for this compilation.
   */
  private addMessageTextDetails(diagnostics: ts.Diagnostic[]): ts.Diagnostic[] {
    return diagnostics.map(diag => {
      if (diag.code && COMPILER_ERRORS_WITH_GUIDES.has(ngErrorCode(diag.code))) {
        return {
          ...diag,
          messageText: diag.messageText +
              `. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG${ngErrorCode(diag.code)}`
        };
      }
      return diag;
    });
  }

  /**
   * Get all setup-related diagnostics for this compilation.
   */
  getOptionDiagnostics(): ts.Diagnostic[] {
    return this.constructionDiagnostics;
  }

  /**
   * Get the `ts.Program` to use as a starting point when spawning a subsequent incremental
   * compilation.
   *
   * The `NgCompiler` spawns an internal incremental TypeScript compilation (inheriting the
   * consumer's `ts.Program` into a new one for the purposes of template type-checking). After this
   * operation, the consumer's `ts.Program` is no longer usable for starting a new incremental
   * compilation. `getNextProgram` retrieves the `ts.Program` which can be used instead.
   */
  getNextProgram(): ts.Program {
    return this.nextProgram;
  }

  getTemplateTypeChecker(): TemplateTypeChecker {
    if (!this.enableTemplateTypeChecker) {
      throw new Error(
          'The `TemplateTypeChecker` does not work without `enableTemplateTypeChecker`.');
    }
    return this.ensureAnalyzed().templateTypeChecker;
  }

  /**
   * Retrieves the `ts.Declaration`s for any component(s) which use the given template file.
   */
  getComponentsWithTemplateFile(templateFilePath: string): ReadonlySet<DeclarationNode> {
    const {resourceRegistry} = this.ensureAnalyzed();
    return resourceRegistry.getComponentsWithTemplate(resolve(templateFilePath));
  }

  /**
   * Retrieves the `ts.Declaration`s for any component(s) which use the given template file.
   */
  getComponentsWithStyleFile(styleFilePath: string): ReadonlySet<DeclarationNode> {
    const {resourceRegistry} = this.ensureAnalyzed();
    return resourceRegistry.getComponentsWithStyle(resolve(styleFilePath));
  }

  /**
   * Retrieves external resources for the given component.
   */
  getComponentResources(classDecl: DeclarationNode): ComponentResources|null {
    if (!isNamedClassDeclaration(classDecl)) {
      return null;
    }
    const {resourceRegistry} = this.ensureAnalyzed();
    const styles = resourceRegistry.getStyles(classDecl);
    const template = resourceRegistry.getTemplate(classDecl);
    if (template === null) {
      return null;
    }

    return {styles, template};
  }

  /**
   * Perform Angular's analysis step (as a precursor to `getDiagnostics` or `prepareEmit`)
   * asynchronously.
   *
   * Normally, this operation happens lazily whenever `getDiagnostics` or `prepareEmit` are called.
   * However, certain consumers may wish to allow for an asynchronous phase of analysis, where
   * resources such as `styleUrls` are resolved asynchonously. In these cases `analyzeAsync` must be
   * called first, and its `Promise` awaited prior to calling any other APIs of `NgCompiler`.
   */
  async analyzeAsync(): Promise<void> {
    if (this.compilation !== null) {
      return;
    }

    await this.perfRecorder.inPhase(PerfPhase.Analysis, async () => {
      this.compilation = this.makeCompilation();

      const promises: Promise<void>[] = [];
      for (const sf of this.tsProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }

        let analysisPromise = this.compilation.traitCompiler.analyzeAsync(sf);
        this.scanForMwp(sf);
        if (analysisPromise !== undefined) {
          promises.push(analysisPromise);
        }
      }

      await Promise.all(promises);

      this.perfRecorder.memory(PerfCheckpoint.Analysis);
      this.resolveCompilation(this.compilation.traitCompiler);
    });
  }

  /**
   * List lazy routes detected during analysis.
   *
   * This can be called for one specific route, or to retrieve all top-level routes.
   */
  listLazyRoutes(entryRoute?: string): LazyRoute[] {
    if (entryRoute) {
      // htts://github.com/angular/angular/blob/50732e156/packages/compiler-cli/src/transformers/compiler_host.ts#L175-L188).
      //
      // `@angular/cli` will always call this API with an absolute path, so the resolution step is
      // not necessary, but keeping it backwards compatible in case someone else is using the API.

      // Relative entry paths are disallowed.
      if (entryRoute.startsWith('.')) {
        throw new Error(`Failed to list lazy routes: Resolution of relative paths (${
            entryRoute}) is not supported.`);
      }

      // Non-relative entry paths fall into one of the following categories:
      // - Absolute system paths (e.g. `/foo/bar/my-project/my-module`), which are unaffected by the
      //   logic below.
      // - Paths to enternal modules (e.g. `some-lib`).
      // - Paths mapped to directories in `tsconfig.json` (e.g. `shared/my-module`).
      //   (See https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping.)
      //
      // In all cases above, the `containingFile` argument is ignored, so we can just take the first
      // of the root files.
      const containingFile = this.tsProgram.getRootFileNames()[0];
      const [entryPath, moduleName] = entryRoute.split('#');
      const resolvedModule =
          resolveModuleName(entryPath, containingFile, this.options, this.adapter, null);

      if (resolvedModule) {
        entryRoute = entryPointKeyFor(resolvedModule.resolvedFileName, moduleName);
      }
    }

    const compilation = this.ensureAnalyzed();
    return compilation.routeAnalyzer.listLazyRoutes(entryRoute);
  }

  /**
   * Fetch transformers and other information which is necessary for a consumer to `emit` the
   * program with Angular-added definitions.
   */
  prepareEmit(): {
    transformers: ts.CustomTransformers,
  } {
    const compilation = this.ensureAnalyzed();

    const coreImportsFrom = compilation.isCore ? getR3SymbolsFile(this.tsProgram) : null;
    let importRewriter: ImportRewriter;
    if (coreImportsFrom !== null) {
      importRewriter = new R3SymbolsImportRewriter(coreImportsFrom.fileName);
    } else {
      importRewriter = new NoopImportRewriter();
    }

    const before = [
      ivyTransformFactory(
          compilation.traitCompiler, compilation.reflector, importRewriter,
          compilation.defaultImportTracker, this.delegatingPerfRecorder, compilation.isCore,
          this.closureCompilerEnabled),
      aliasTransformFactory(compilation.traitCompiler.exportStatements),
      compilation.defaultImportTracker.importPreservingTransformer(),
    ];

    const afterDeclarations: ts.TransformerFactory<ts.SourceFile>[] = [];
    if (compilation.dtsTransforms !== null) {
      afterDeclarations.push(
          declarationTransformFactory(compilation.dtsTransforms, importRewriter));
    }

    // Only add aliasing re-exports to the .d.ts output if the `AliasingHost` requests it.
    if (compilation.aliasingHost !== null && compilation.aliasingHost.aliasExportsInDts) {
      afterDeclarations.push(aliasTransformFactory(compilation.traitCompiler.exportStatements));
    }

    if (this.adapter.factoryTracker !== null) {
      before.push(
          generatedFactoryTransform(this.adapter.factoryTracker.sourceInfo, importRewriter));
    }
    before.push(ivySwitchTransform);

    return {transformers: {before, afterDeclarations} as ts.CustomTransformers};
  }

  /**
   * Run the indexing process and return a `Map` of all indexed components.
   *
   * See the `indexing` package for more details.
   */
  getIndexedComponents(): Map<DeclarationNode, IndexedComponent> {
    const compilation = this.ensureAnalyzed();
    const context = new IndexingContext();
    compilation.traitCompiler.index(context);
    return generateAnalysis(context);
  }

  private ensureAnalyzed(this: NgCompiler): LazyCompilationState {
    if (this.compilation === null) {
      this.analyzeSync();
    }
    return this.compilation!;
  }

  private analyzeSync(): void {
    this.perfRecorder.inPhase(PerfPhase.Analysis, () => {
      this.compilation = this.makeCompilation();
      for (const sf of this.tsProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        this.compilation.traitCompiler.analyzeSync(sf);
        this.scanForMwp(sf);
      }

      this.perfRecorder.memory(PerfCheckpoint.Analysis);

      this.resolveCompilation(this.compilation.traitCompiler);
    });
  }

  private resolveCompilation(traitCompiler: TraitCompiler): void {
    this.perfRecorder.inPhase(PerfPhase.Resolve, () => {
      traitCompiler.resolve();

      // At this point, analysis is complete and the compiler can now calculate which files need to
      // be emitted, so do that.
      this.incrementalDriver.recordSuccessfulAnalysis(traitCompiler);

      this.perfRecorder.memory(PerfCheckpoint.Resolve);
    });
  }

  private get fullTemplateTypeCheck(): boolean {
    // Determine the strictness level of type checking based on compiler options. As
    // `strictTemplates` is a superset of `fullTemplateTypeCheck`, the former implies the latter.
    // Also see `verifyCompatibleTypeCheckOptions` where it is verified that `fullTemplateTypeCheck`
    // is not disabled when `strictTemplates` is enabled.
    const strictTemplates = !!this.options.strictTemplates;
    return strictTemplates || !!this.options.fullTemplateTypeCheck;
  }

  private getTypeCheckingConfig(): TypeCheckingConfig {
    // Determine the strictness level of type checking based on compiler options. As
    // `strictTemplates` is a superset of `fullTemplateTypeCheck`, the former implies the latter.
    // Also see `verifyCompatibleTypeCheckOptions` where it is verified that `fullTemplateTypeCheck`
    // is not disabled when `strictTemplates` is enabled.
    const strictTemplates = !!this.options.strictTemplates;

    const useInlineTypeConstructors = this.typeCheckingProgramStrategy.supportsInlineOperations;

    // First select a type-checking configuration, based on whether full template type-checking is
    // requested.
    let typeCheckingConfig: TypeCheckingConfig;
    if (this.fullTemplateTypeCheck) {
      typeCheckingConfig = {
        applyTemplateContextGuards: strictTemplates,
        checkQueries: false,
        checkTemplateBodies: true,
        alwaysCheckSchemaInTemplateBodies: true,
        checkTypeOfInputBindings: strictTemplates,
        honorAccessModifiersForInputBindings: false,
        strictNullInputBindings: strictTemplates,
        checkTypeOfAttributes: strictTemplates,
        // Even in full template type-checking mode, DOM binding checks are not quite ready yet.
        checkTypeOfDomBindings: false,
        checkTypeOfOutputEvents: strictTemplates,
        checkTypeOfAnimationEvents: strictTemplates,
        // Checking of DOM events currently has an adverse effect on developer experience,
        // e.g. for `<input (blur)="update($event.target.value)">` enabling this check results in:
        // - error TS2531: Object is possibly 'null'.
        // - error TS2339: Property 'value' does not exist on type 'EventTarget'.
        checkTypeOfDomEvents: strictTemplates,
        checkTypeOfDomReferences: strictTemplates,
        // Non-DOM references have the correct type in View Engine so there is no strictness flag.
        checkTypeOfNonDomReferences: true,
        // Pipes are checked in View Engine so there is no strictness flag.
        checkTypeOfPipes: true,
        strictSafeNavigationTypes: strictTemplates,
        useContextGenericType: strictTemplates,
        strictLiteralTypes: true,
        enableTemplateTypeChecker: this.enableTemplateTypeChecker,
        useInlineTypeConstructors,
        // Warnings for suboptimal type inference are only enabled if in Language Service mode
        // (providing the full TemplateTypeChecker API) and if strict mode is not enabled. In strict
        // mode, the user is in full control of type inference.
        suggestionsForSuboptimalTypeInference: this.enableTemplateTypeChecker && !strictTemplates,
      };
    } else {
      typeCheckingConfig = {
        applyTemplateContextGuards: false,
        checkQueries: false,
        checkTemplateBodies: false,
        // Enable deep schema checking in "basic" template type-checking mode only if Closure
        // compilation is requested, which is a good proxy for "only in google3".
        alwaysCheckSchemaInTemplateBodies: this.closureCompilerEnabled,
        checkTypeOfInputBindings: false,
        strictNullInputBindings: false,
        honorAccessModifiersForInputBindings: false,
        checkTypeOfAttributes: false,
        checkTypeOfDomBindings: false,
        checkTypeOfOutputEvents: false,
        checkTypeOfAnimationEvents: false,
        checkTypeOfDomEvents: false,
        checkTypeOfDomReferences: false,
        checkTypeOfNonDomReferences: false,
        checkTypeOfPipes: false,
        strictSafeNavigationTypes: false,
        useContextGenericType: false,
        strictLiteralTypes: false,
        enableTemplateTypeChecker: this.enableTemplateTypeChecker,
        useInlineTypeConstructors,
        // In "basic" template type-checking mode, no warnings are produced since most things are
        // not checked anyways.
        suggestionsForSuboptimalTypeInference: false,
      };
    }

    // Apply explicitly configured strictness flags on top of the default configuration
    // based on "fullTemplateTypeCheck".
    if (this.options.strictInputTypes !== undefined) {
      typeCheckingConfig.checkTypeOfInputBindings = this.options.strictInputTypes;
      typeCheckingConfig.applyTemplateContextGuards = this.options.strictInputTypes;
    }
    if (this.options.strictInputAccessModifiers !== undefined) {
      typeCheckingConfig.honorAccessModifiersForInputBindings =
          this.options.strictInputAccessModifiers;
    }
    if (this.options.strictNullInputTypes !== undefined) {
      typeCheckingConfig.strictNullInputBindings = this.options.strictNullInputTypes;
    }
    if (this.options.strictOutputEventTypes !== undefined) {
      typeCheckingConfig.checkTypeOfOutputEvents = this.options.strictOutputEventTypes;
      typeCheckingConfig.checkTypeOfAnimationEvents = this.options.strictOutputEventTypes;
    }
    if (this.options.strictDomEventTypes !== undefined) {
      typeCheckingConfig.checkTypeOfDomEvents = this.options.strictDomEventTypes;
    }
    if (this.options.strictSafeNavigationTypes !== undefined) {
      typeCheckingConfig.strictSafeNavigationTypes = this.options.strictSafeNavigationTypes;
    }
    if (this.options.strictDomLocalRefTypes !== undefined) {
      typeCheckingConfig.checkTypeOfDomReferences = this.options.strictDomLocalRefTypes;
    }
    if (this.options.strictAttributeTypes !== undefined) {
      typeCheckingConfig.checkTypeOfAttributes = this.options.strictAttributeTypes;
    }
    if (this.options.strictContextGenerics !== undefined) {
      typeCheckingConfig.useContextGenericType = this.options.strictContextGenerics;
    }
    if (this.options.strictLiteralTypes !== undefined) {
      typeCheckingConfig.strictLiteralTypes = this.options.strictLiteralTypes;
    }

    return typeCheckingConfig;
  }

  private getTemplateDiagnostics(): ReadonlyArray<ts.Diagnostic> {
    const compilation = this.ensureAnalyzed();

    // Get the diagnostics.
    const diagnostics: ts.Diagnostic[] = [];
    for (const sf of this.tsProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || this.adapter.isShim(sf)) {
        continue;
      }

      diagnostics.push(
          ...compilation.templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram));
    }

    const program = this.typeCheckingProgramStrategy.getProgram();
    this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, program);
    this.nextProgram = program;

    return diagnostics;
  }

  private getTemplateDiagnosticsForFile(sf: ts.SourceFile, optimizeFor: OptimizeFor):
      ReadonlyArray<ts.Diagnostic> {
    const compilation = this.ensureAnalyzed();

    // Get the diagnostics.
    const diagnostics: ts.Diagnostic[] = [];
    if (!sf.isDeclarationFile && !this.adapter.isShim(sf)) {
      diagnostics.push(...compilation.templateTypeChecker.getDiagnosticsForFile(sf, optimizeFor));
    }

    const program = this.typeCheckingProgramStrategy.getProgram();
    this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, program);
    this.nextProgram = program;

    return diagnostics;
  }

  private getNonTemplateDiagnostics(): ts.Diagnostic[] {
    if (this.nonTemplateDiagnostics === null) {
      const compilation = this.ensureAnalyzed();
      this.nonTemplateDiagnostics = [...compilation.traitCompiler.diagnostics];
      if (this.entryPoint !== null && compilation.exportReferenceGraph !== null) {
        this.nonTemplateDiagnostics.push(...checkForPrivateExports(
            this.entryPoint, this.tsProgram.getTypeChecker(), compilation.exportReferenceGraph));
      }
    }
    return this.nonTemplateDiagnostics;
  }

  private scanForMwp(sf: ts.SourceFile): void {
    this.compilation!.mwpScanner.scan(sf, {
      addTypeReplacement: (node: ts.Declaration, type: Type): void => {
        // Only obtain the return type transform for the source file once there's a type to replace,
        // so that no transform is allocated when there's nothing to do.
        this.compilation!.dtsTransforms!.getReturnTypeTransform(sf).addTypeReplacement(node, type);
      }
    });
  }

  private makeCompilation(): LazyCompilationState {
    const checker = this.tsProgram.getTypeChecker();

    const reflector = new TypeScriptReflectionHost(checker);

    // Construct the ReferenceEmitter.
    let refEmitter: ReferenceEmitter;
    let aliasingHost: AliasingHost|null = null;
    if (this.adapter.unifiedModulesHost === null || !this.options._useHostForImportGeneration) {
      let localImportStrategy: ReferenceEmitStrategy;

      // The strategy used for local, in-project imports depends on whether TS has been configured
      // with rootDirs. If so, then multiple directories may be mapped in the same "module
      // namespace" and the logic of `LogicalProjectStrategy` is required to generate correct
      // imports which may cross these multiple directories. Otherwise, plain relative imports are
      // sufficient.
      if (this.options.rootDir !== undefined ||
          (this.options.rootDirs !== undefined && this.options.rootDirs.length > 0)) {
        // rootDirs logic is in effect - use the `LogicalProjectStrategy` for in-project relative
        // imports.
        localImportStrategy = new LogicalProjectStrategy(
            reflector, new LogicalFileSystem([...this.adapter.rootDirs], this.adapter));
      } else {
        // Plain relative imports are all that's needed.
        localImportStrategy = new RelativePathStrategy(reflector);
      }

      // The CompilerHost doesn't have fileNameToModuleName, so build an NPM-centric reference
      // resolution strategy.
      refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Next, attempt to use an absolute import.
        new AbsoluteModuleStrategy(this.tsProgram, checker, this.moduleResolver, reflector),
        // Finally, check if the reference is being written into a file within the project's .ts
        // sources, and use a relative import if so. If this fails, ReferenceEmitter will throw
        // an error.
        localImportStrategy,
      ]);

      // If an entrypoint is present, then all user imports should be directed through the
      // entrypoint and private exports are not needed. The compiler will validate that all publicly
      // visible directives/pipes are importable via this entrypoint.
      if (this.entryPoint === null && this.options.generateDeepReexports === true) {
        // No entrypoint is present and deep re-exports were requested, so configure the aliasing
        // system to generate them.
        aliasingHost = new PrivateExportAliasingHost(reflector);
      }
    } else {
      // The CompilerHost supports fileNameToModuleName, so use that to emit imports.
      refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Then use aliased references (this is a workaround to StrictDeps checks).
        new AliasStrategy(),
        // Then use fileNameToModuleName to emit imports.
        new UnifiedModulesStrategy(reflector, this.adapter.unifiedModulesHost),
      ]);
      aliasingHost = new UnifiedModulesAliasingHost(this.adapter.unifiedModulesHost);
    }

    const evaluator = new PartialEvaluator(reflector, checker, this.incrementalDriver.depGraph);
    const dtsReader = new DtsMetadataReader(checker, reflector);
    const localMetaRegistry = new LocalMetadataRegistry();
    const localMetaReader: MetadataReader = localMetaRegistry;
    const depScopeReader = new MetadataDtsModuleScopeResolver(dtsReader, aliasingHost);
    const scopeRegistry =
        new LocalModuleScopeRegistry(localMetaReader, depScopeReader, refEmitter, aliasingHost);
    const scopeReader: ComponentScopeReader = scopeRegistry;
    const semanticDepGraphUpdater = this.incrementalDriver.getSemanticDepGraphUpdater();
    const metaRegistry = new CompoundMetadataRegistry([localMetaRegistry, scopeRegistry]);
    const injectableRegistry = new InjectableClassRegistry(reflector);

    const metaReader = new CompoundMetadataReader([localMetaReader, dtsReader]);
    const typeCheckScopeRegistry = new TypeCheckScopeRegistry(scopeReader, metaReader);


    // If a flat module entrypoint was specified, then track references via a `ReferenceGraph` in
    // order to produce proper diagnostics for incorrectly exported directives/pipes/etc. If there
    // is no flat module entrypoint then don't pay the cost of tracking references.
    let referencesRegistry: ReferencesRegistry;
    let exportReferenceGraph: ReferenceGraph|null = null;
    if (this.entryPoint !== null) {
      exportReferenceGraph = new ReferenceGraph();
      referencesRegistry = new ReferenceGraphAdapter(exportReferenceGraph);
    } else {
      referencesRegistry = new NoopReferencesRegistry();
    }

    const routeAnalyzer = new NgModuleRouteAnalyzer(this.moduleResolver, evaluator);

    const dtsTransforms = new DtsTransformRegistry();

    const mwpScanner = new ModuleWithProvidersScanner(reflector, evaluator, refEmitter);

    const isCore = isAngularCorePackage(this.tsProgram);

    const defaultImportTracker = new DefaultImportTracker();
    const resourceRegistry = new ResourceRegistry();

    const compilationMode =
        this.options.compilationMode === 'partial' ? CompilationMode.PARTIAL : CompilationMode.FULL;

    // Cycles are handled in full compilation mode by "remote scoping".
    // "Remote scoping" does not work well with tree shaking for libraries.
    // So in partial compilation mode, when building a library, a cycle will cause an error.
    const cycleHandlingStrategy = compilationMode === CompilationMode.FULL ?
        CycleHandlingStrategy.UseRemoteScoping :
        CycleHandlingStrategy.Error;

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers: DecoratorHandler<unknown, unknown, SemanticSymbol|null, unknown>[] = [
      new ComponentDecoratorHandler(
          reflector, evaluator, metaRegistry, metaReader, scopeReader, scopeRegistry,
          typeCheckScopeRegistry, resourceRegistry, isCore, this.resourceManager,
          this.adapter.rootDirs, this.options.preserveWhitespaces || false,
          this.options.i18nUseExternalIds !== false,
          this.options.enableI18nLegacyMessageIdFormat !== false, this.usePoisonedData,
          this.options.i18nNormalizeLineEndingsInICUs, this.moduleResolver, this.cycleAnalyzer,
          cycleHandlingStrategy, refEmitter, defaultImportTracker, this.incrementalDriver.depGraph,
          injectableRegistry, semanticDepGraphUpdater, this.closureCompilerEnabled,
          this.delegatingPerfRecorder),

      // TODO(alxhub): understand why the cast here is necessary (something to do with `null`
      // not being assignable to `unknown` when wrapped in `Readonly`).
      // clang-format off
        new DirectiveDecoratorHandler(
            reflector, evaluator, metaRegistry, scopeRegistry, metaReader,
            defaultImportTracker, injectableRegistry, isCore, semanticDepGraphUpdater,
          this.closureCompilerEnabled, compileUndecoratedClassesWithAngularFeatures,
          this.delegatingPerfRecorder,
        ) as Readonly<DecoratorHandler<unknown, unknown, SemanticSymbol | null,unknown>>,
      // clang-format on
      // Pipe handler must be before injectable handler in list so pipe factories are printed
      // before injectable factories (so injectable factories can delegate to them)
      new PipeDecoratorHandler(
          reflector, evaluator, metaRegistry, scopeRegistry, defaultImportTracker,
          injectableRegistry, isCore, this.delegatingPerfRecorder),
      new InjectableDecoratorHandler(
          reflector, defaultImportTracker, isCore, this.options.strictInjectionParameters || false,
          injectableRegistry, this.delegatingPerfRecorder),
      new NgModuleDecoratorHandler(
          reflector, evaluator, metaReader, metaRegistry, scopeRegistry, referencesRegistry, isCore,
          routeAnalyzer, refEmitter, this.adapter.factoryTracker, defaultImportTracker,
          this.closureCompilerEnabled, injectableRegistry, this.delegatingPerfRecorder,
          this.options.i18nInLocale),
    ];

    const traitCompiler = new TraitCompiler(
        handlers, reflector, this.delegatingPerfRecorder, this.incrementalDriver,
        this.options.compileNonExportedClasses !== false, compilationMode, dtsTransforms,
        semanticDepGraphUpdater);

    const templateTypeChecker = new TemplateTypeCheckerImpl(
        this.tsProgram, this.typeCheckingProgramStrategy, traitCompiler,
        this.getTypeCheckingConfig(), refEmitter, reflector, this.adapter, this.incrementalDriver,
        scopeRegistry, typeCheckScopeRegistry, this.delegatingPerfRecorder);

    return {
      isCore,
      traitCompiler,
      reflector,
      scopeRegistry,
      dtsTransforms,
      exportReferenceGraph,
      routeAnalyzer,
      mwpScanner,
      metaReader,
      typeCheckScopeRegistry,
      defaultImportTracker,
      aliasingHost,
      refEmitter,
      templateTypeChecker,
      resourceRegistry,
    };
  }
}

/**
 * Determine if the given `Program` is @angular/core.
 */
export function isAngularCorePackage(program: ts.Program): boolean {
  // Look for its_just_angular.ts somewhere in the program.
  const r3Symbols = getR3SymbolsFile(program);
  if (r3Symbols === null) {
    return false;
  }

  // Look for the constant ITS_JUST_ANGULAR in that file.
  return r3Symbols.statements.some(stmt => {
    // The statement must be a variable declaration statement.
    if (!ts.isVariableStatement(stmt)) {
      return false;
    }
    // It must be exported.
    if (stmt.modifiers === undefined ||
        !stmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return false;
    }
    // It must declare ITS_JUST_ANGULAR.
    return stmt.declarationList.declarations.some(decl => {
      // The declaration must match the name.
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'ITS_JUST_ANGULAR') {
        return false;
      }
      // It must initialize the variable to true.
      if (decl.initializer === undefined || decl.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
        return false;
      }
      // This definition matches.
      return true;
    });
  });
}

/**
 * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
 */
function getR3SymbolsFile(program: ts.Program): ts.SourceFile|null {
  return program.getSourceFiles().find(file => file.fileName.indexOf('r3_symbols.ts') >= 0) || null;
}

/**
 * Since "strictTemplates" is a true superset of type checking capabilities compared to
 * "fullTemplateTypeCheck", it is required that the latter is not explicitly disabled if the
 * former is enabled.
 */
function verifyCompatibleTypeCheckOptions(options: NgCompilerOptions): ts.Diagnostic|null {
  if (options.fullTemplateTypeCheck === false && options.strictTemplates === true) {
    return {
      category: ts.DiagnosticCategory.Error,
      code: ngErrorCode(ErrorCode.CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK),
      file: undefined,
      start: undefined,
      length: undefined,
      messageText:
          `Angular compiler option "strictTemplates" is enabled, however "fullTemplateTypeCheck" is disabled.

Having the "strictTemplates" flag enabled implies that "fullTemplateTypeCheck" is also enabled, so
the latter can not be explicitly disabled.

One of the following actions is required:
1. Remove the "fullTemplateTypeCheck" option.
2. Remove "strictTemplates" or set it to 'false'.

More information about the template type checking compiler options can be found in the documentation:
https://v9.angular.io/guide/template-typecheck#template-type-checking`,
    };
  }

  return null;
}

class ReferenceGraphAdapter implements ReferencesRegistry {
  constructor(private graph: ReferenceGraph) {}

  add(source: DeclarationNode, ...references: Reference<DeclarationNode>[]): void {
    for (const {node} of references) {
      let sourceFile = node.getSourceFile();
      if (sourceFile === undefined) {
        sourceFile = ts.getOriginalNode(node).getSourceFile();
      }

      // Only record local references (not references into .d.ts files).
      if (sourceFile === undefined || !isDtsPath(sourceFile.fileName)) {
        this.graph.add(source, node);
      }
    }
  }
}
