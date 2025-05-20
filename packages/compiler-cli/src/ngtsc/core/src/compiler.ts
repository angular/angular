/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {R3Identifiers} from '@angular/compiler';
import ts from 'typescript';

import {
  ComponentDecoratorHandler,
  DirectiveDecoratorHandler,
  InjectableDecoratorHandler,
  NgModuleDecoratorHandler,
  NoopReferencesRegistry,
  PipeDecoratorHandler,
  ReferencesRegistry,
} from '../../annotations';
import {InjectableClassRegistry, JitDeclarationRegistry} from '../../annotations/common';
import {CycleAnalyzer, CycleHandlingStrategy, ImportGraph} from '../../cycles';
import {
  COMPILER_ERRORS_WITH_GUIDES,
  ERROR_DETAILS_PAGE_BASE_URL,
  ErrorCode,
  isFatalDiagnosticError,
  ngErrorCode,
} from '../../diagnostics';
import {DocEntry, DocsExtractor} from '../../docs';
import {checkForPrivateExports, ReferenceGraph} from '../../entry_point';
import {
  absoluteFromSourceFile,
  AbsoluteFsPath,
  LogicalFileSystem,
  resolve,
} from '../../file_system';
import {
  AbsoluteModuleStrategy,
  AliasingHost,
  AliasStrategy,
  DefaultImportTracker,
  DeferredSymbolTracker,
  ImportedSymbolsTracker,
  ImportRewriter,
  LocalCompilationExtraImportsTracker,
  LocalIdentifierStrategy,
  LogicalProjectStrategy,
  ModuleResolver,
  NoopImportRewriter,
  PrivateExportAliasingHost,
  R3SymbolsImportRewriter,
  Reference,
  ReferenceEmitStrategy,
  ReferenceEmitter,
  RelativePathStrategy,
  UnifiedModulesAliasingHost,
  UnifiedModulesStrategy,
} from '../../imports';
import {
  IncrementalBuildStrategy,
  IncrementalCompilation,
  IncrementalState,
} from '../../incremental';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {generateAnalysis, IndexedComponent, IndexingContext} from '../../indexer';
import {
  DirectiveResources,
  CompoundMetadataReader,
  CompoundMetadataRegistry,
  DirectiveMeta,
  DtsMetadataReader,
  ExportedProviderStatusResolver,
  HostDirectivesResolver,
  LocalMetadataRegistry,
  MetadataReader,
  MetadataReaderWithIndex,
  PipeMeta,
  ResourceRegistry,
} from '../../metadata';
import {NgModuleIndexImpl} from '../../metadata/src/ng_module_index';
import {PartialEvaluator} from '../../partial_evaluator';
import {
  ActivePerfRecorder,
  DelegatingPerfRecorder,
  PerfCheckpoint,
  PerfEvent,
  PerfPhase,
} from '../../perf';
import {FileUpdate, ProgramDriver, UpdateMode} from '../../program_driver';
import {DeclarationNode, isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {AdapterResourceLoader} from '../../resource';
import {
  ComponentScopeReader,
  CompoundComponentScopeReader,
  LocalModuleScopeRegistry,
  MetadataDtsModuleScopeResolver,
  SelectorlessComponentScopeReader,
  TypeCheckScopeRegistry,
} from '../../scope';
import {StandaloneComponentScopeReader} from '../../scope/src/standalone';
import {
  aliasTransformFactory,
  CompilationMode,
  declarationTransformFactory,
  DecoratorHandler,
  DtsTransformRegistry,
  ivyTransformFactory,
  TraitCompiler,
} from '../../transform';
import {TemplateTypeCheckerImpl} from '../../typecheck';
import {OptimizeFor, TemplateTypeChecker, TypeCheckingConfig} from '../../typecheck/api';
import {
  ALL_DIAGNOSTIC_FACTORIES,
  ExtendedTemplateCheckerImpl,
  SUPPORTED_DIAGNOSTIC_NAMES,
} from '../../typecheck/extended';
import {ExtendedTemplateChecker} from '../../typecheck/extended/api';
import {TemplateSemanticsChecker} from '../../typecheck/template_semantics/api/api';
import {TemplateSemanticsCheckerImpl} from '../../typecheck/template_semantics/src/template_semantics_checker';
import {getSourceFileOrNull, isDtsPath, toUnredirectedSourceFile} from '../../util/src/typescript';
import {SourceFileValidator} from '../../validation';
import {Xi18nContext} from '../../xi18n';
import {DiagnosticCategoryLabel, NgCompilerAdapter, NgCompilerOptions} from '../api';

import {coreVersionSupportsFeature} from './feature_detection';
import {angularJitApplicationTransform} from '../../transform/jit';
import {untagAllTsFiles} from '../../shims';

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
  exportReferenceGraph: ReferenceGraph | null;
  dtsTransforms: DtsTransformRegistry;
  aliasingHost: AliasingHost | null;
  refEmitter: ReferenceEmitter;
  templateTypeChecker: TemplateTypeChecker;
  resourceRegistry: ResourceRegistry;
  extendedTemplateChecker: ExtendedTemplateChecker | null;
  templateSemanticsChecker: TemplateSemanticsChecker | null;
  sourceFileValidator: SourceFileValidator | null;
  jitDeclarationRegistry: JitDeclarationRegistry;
  supportJitMode: boolean;

  /**
   * Only available in local compilation mode when option `generateExtraImportsInLocalMode` is set.
   */
  localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null;
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
  programDriver: ProgramDriver;
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
  newProgram: ts.Program;
  incrementalBuildStrategy: IncrementalBuildStrategy;
  incrementalCompilation: IncrementalCompilation;
  programDriver: ProgramDriver;
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
export type CompilationTicket =
  | FreshCompilationTicket
  | IncrementalTypeScriptCompilationTicket
  | IncrementalResourceCompilationTicket;

/**
 * Create a `CompilationTicket` for a brand new compilation, using no prior state.
 */
export function freshCompilationTicket(
  tsProgram: ts.Program,
  options: NgCompilerOptions,
  incrementalBuildStrategy: IncrementalBuildStrategy,
  programDriver: ProgramDriver,
  perfRecorder: ActivePerfRecorder | null,
  enableTemplateTypeChecker: boolean,
  usePoisonedData: boolean,
): CompilationTicket {
  return {
    kind: CompilationTicketKind.Fresh,
    tsProgram,
    options,
    incrementalBuildStrategy,
    programDriver,
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
  oldCompiler: NgCompiler,
  newProgram: ts.Program,
  incrementalBuildStrategy: IncrementalBuildStrategy,
  programDriver: ProgramDriver,
  modifiedResourceFiles: Set<AbsoluteFsPath>,
  perfRecorder: ActivePerfRecorder | null,
): CompilationTicket {
  const oldProgram = oldCompiler.getCurrentProgram();
  const oldState = oldCompiler.incrementalStrategy.getIncrementalState(oldProgram);
  if (oldState === null) {
    // No incremental step is possible here, since no IncrementalState was found for the old
    // program.
    return freshCompilationTicket(
      newProgram,
      oldCompiler.options,
      incrementalBuildStrategy,
      programDriver,
      perfRecorder,
      oldCompiler.enableTemplateTypeChecker,
      oldCompiler.usePoisonedData,
    );
  }

  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }

  const incrementalCompilation = IncrementalCompilation.incremental(
    newProgram,
    versionMapFromProgram(newProgram, programDriver),
    oldProgram,
    oldState,
    modifiedResourceFiles,
    perfRecorder,
  );

  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    enableTemplateTypeChecker: oldCompiler.enableTemplateTypeChecker,
    usePoisonedData: oldCompiler.usePoisonedData,
    options: oldCompiler.options,
    incrementalBuildStrategy,
    incrementalCompilation,
    programDriver,
    newProgram,
    perfRecorder,
  };
}

/**
 * Create a `CompilationTicket` directly from an old `ts.Program` and associated Angular compilation
 * state, along with a new `ts.Program`.
 */
export function incrementalFromStateTicket(
  oldProgram: ts.Program,
  oldState: IncrementalState,
  newProgram: ts.Program,
  options: NgCompilerOptions,
  incrementalBuildStrategy: IncrementalBuildStrategy,
  programDriver: ProgramDriver,
  modifiedResourceFiles: Set<AbsoluteFsPath>,
  perfRecorder: ActivePerfRecorder | null,
  enableTemplateTypeChecker: boolean,
  usePoisonedData: boolean,
): CompilationTicket {
  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }
  const incrementalCompilation = IncrementalCompilation.incremental(
    newProgram,
    versionMapFromProgram(newProgram, programDriver),
    oldProgram,
    oldState,
    modifiedResourceFiles,
    perfRecorder,
  );
  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    newProgram,
    options,
    incrementalBuildStrategy,
    incrementalCompilation,
    programDriver,
    enableTemplateTypeChecker,
    usePoisonedData,
    perfRecorder,
  };
}

export function resourceChangeTicket(
  compiler: NgCompiler,
  modifiedResourceFiles: Set<string>,
): IncrementalResourceCompilationTicket {
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
  private compilation: LazyCompilationState | null = null;

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
  private nonTemplateDiagnostics: ts.Diagnostic[] | null = null;

  private closureCompilerEnabled: boolean;
  private currentProgram: ts.Program;
  private entryPoint: ts.SourceFile | null;
  private moduleResolver: ModuleResolver;
  private resourceManager: AdapterResourceLoader;
  private cycleAnalyzer: CycleAnalyzer;
  readonly ignoreForDiagnostics: Set<ts.SourceFile>;
  readonly ignoreForEmit: Set<ts.SourceFile>;
  readonly enableTemplateTypeChecker: boolean;
  private readonly enableBlockSyntax: boolean;
  private readonly enableLetSyntax: boolean;
  private readonly angularCoreVersion: string | null;
  private readonly enableHmr: boolean;
  private readonly implicitStandaloneValue: boolean;
  private readonly enableSelectorless: boolean;
  private readonly emitDeclarationOnly: boolean;

  /**
   * `NgCompiler` can be reused for multiple compilations (for resource-only changes), and each
   * new compilation uses a fresh `PerfRecorder`. Thus, classes created with a lifespan of the
   * `NgCompiler` use a `DelegatingPerfRecorder` so the `PerfRecorder` they write to can be updated
   * with each fresh compilation.
   */
  private delegatingPerfRecorder: DelegatingPerfRecorder;

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
          ticket.programDriver,
          ticket.incrementalBuildStrategy,
          IncrementalCompilation.fresh(
            ticket.tsProgram,
            versionMapFromProgram(ticket.tsProgram, ticket.programDriver),
          ),
          ticket.enableTemplateTypeChecker,
          ticket.usePoisonedData,
          ticket.perfRecorder,
        );
      case CompilationTicketKind.IncrementalTypeScript:
        return new NgCompiler(
          adapter,
          ticket.options,
          ticket.newProgram,
          ticket.programDriver,
          ticket.incrementalBuildStrategy,
          ticket.incrementalCompilation,
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
    private inputProgram: ts.Program,
    readonly programDriver: ProgramDriver,
    readonly incrementalStrategy: IncrementalBuildStrategy,
    readonly incrementalCompilation: IncrementalCompilation,
    enableTemplateTypeChecker: boolean,
    readonly usePoisonedData: boolean,
    private livePerfRecorder: ActivePerfRecorder,
  ) {
    this.angularCoreVersion = options['_angularCoreVersion'] ?? null;
    this.delegatingPerfRecorder = new DelegatingPerfRecorder(this.perfRecorder);
    this.usePoisonedData = usePoisonedData || !!options._compilePoisonedComponents;
    this.enableTemplateTypeChecker =
      enableTemplateTypeChecker || !!options._enableTemplateTypeChecker;
    // TODO(crisbeto): remove this flag and base `enableBlockSyntax` on the `angularCoreVersion`.
    this.enableBlockSyntax = options['_enableBlockSyntax'] ?? true;
    this.enableLetSyntax = options['_enableLetSyntax'] ?? true;
    this.enableSelectorless = options['_enableSelectorless'] ?? false;
    this.emitDeclarationOnly =
      !!options.emitDeclarationOnly && !!options._experimentalAllowEmitDeclarationOnly;
    // Standalone by default is enabled since v19. We need to toggle it here,
    // because the language service extension may be running with the latest
    // version of the compiler against an older version of Angular.
    this.implicitStandaloneValue =
      this.angularCoreVersion === null ||
      coreVersionSupportsFeature(this.angularCoreVersion, '>= 19.0.0');
    this.enableHmr = !!options['_enableHmr'];
    this.constructionDiagnostics.push(
      ...this.adapter.constructionDiagnostics,
      ...verifyCompatibleTypeCheckOptions(this.options),
    );

    this.currentProgram = inputProgram;
    this.closureCompilerEnabled = !!this.options.annotateForClosureCompiler;

    this.entryPoint =
      adapter.entryPoint !== null ? getSourceFileOrNull(inputProgram, adapter.entryPoint) : null;

    const moduleResolutionCache = ts.createModuleResolutionCache(
      this.adapter.getCurrentDirectory(),
      // doen't retain a reference to `this`, if other closures in the constructor here reference
      // `this` internally then a closure created here would retain them. This can cause major
      // memory leak issues since the `moduleResolutionCache` is a long-lived object and finds its
      // way into all kinds of places inside TS internal objects.
      this.adapter.getCanonicalFileName.bind(this.adapter),
    );
    this.moduleResolver = new ModuleResolver(
      inputProgram,
      this.options,
      this.adapter,
      moduleResolutionCache,
    );
    this.resourceManager = new AdapterResourceLoader(adapter, this.options);
    this.cycleAnalyzer = new CycleAnalyzer(
      new ImportGraph(inputProgram.getTypeChecker(), this.delegatingPerfRecorder),
    );
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, inputProgram);

    this.ignoreForDiagnostics = new Set(
      inputProgram.getSourceFiles().filter((sf) => this.adapter.isShim(sf)),
    );
    this.ignoreForEmit = this.adapter.ignoreForEmit;

    let dtsFileCount = 0;
    let nonDtsFileCount = 0;
    for (const sf of inputProgram.getSourceFiles()) {
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
    changedResources: Set<string>,
    perfRecorder: ActivePerfRecorder,
  ): void {
    this.livePerfRecorder = perfRecorder;
    this.delegatingPerfRecorder.target = perfRecorder;

    perfRecorder.inPhase(PerfPhase.ResourceUpdate, () => {
      if (this.compilation === null) {
        // Analysis hasn't happened yet, so no update is necessary - any changes to resources will
        // be captured by the initial analysis pass itself.
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

    return this.incrementalCompilation.depGraph.getResourceDependencies(file);
  }

  /**
   * Get all Angular-related diagnostics for this compilation.
   */
  getDiagnostics(): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [...this.getNonTemplateDiagnostics()];

    // Type check code may throw fatal diagnostic errors if e.g. the type check
    // block cannot be generated. Gracefully return the associated diagnostic.
    // Note: If a fatal diagnostic is raised, do not repeat the same diagnostics
    // by running the extended template checking code, which will attempt to
    // generate the same TCB.
    try {
      diagnostics.push(...this.getTemplateDiagnostics(), ...this.runAdditionalChecks());
    } catch (err: unknown) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }

    return this.addMessageTextDetails(diagnostics);
  }

  /**
   * Get all Angular-related diagnostics for this compilation.
   *
   * If a `ts.SourceFile` is passed, only diagnostics related to that file are returned.
   */
  getDiagnosticsForFile(file: ts.SourceFile, optimizeFor: OptimizeFor): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [
      ...this.getNonTemplateDiagnostics().filter((diag) => diag.file === file),
    ];

    // Type check code may throw fatal diagnostic errors if e.g. the type check
    // block cannot be generated. Gracefully return the associated diagnostic.
    // Note: If a fatal diagnostic is raised, do not repeat the same diagnostics
    // by running the extended template checking code, which will attempt to
    // generate the same TCB.
    try {
      diagnostics.push(
        ...this.getTemplateDiagnosticsForFile(file, optimizeFor),
        ...this.runAdditionalChecks(file),
      );
    } catch (err: unknown) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }

    return this.addMessageTextDetails(diagnostics);
  }

  /**
   * Get all `ts.Diagnostic`s currently available that pertain to the given component.
   */
  getDiagnosticsForComponent(component: ts.ClassDeclaration): ts.Diagnostic[] {
    const compilation = this.ensureAnalyzed();
    const ttc = compilation.templateTypeChecker;
    const diagnostics: ts.Diagnostic[] = [];

    // Type check code may throw fatal diagnostic errors if e.g. the type check
    // block cannot be generated. Gracefully return the associated diagnostic.
    // Note: If a fatal diagnostic is raised, do not repeat the same diagnostics
    // by running the extended template checking code, which will attempt to
    // generate the same TCB.
    try {
      diagnostics.push(...ttc.getDiagnosticsForComponent(component));

      const {extendedTemplateChecker, templateSemanticsChecker} = compilation;

      if (templateSemanticsChecker !== null) {
        diagnostics.push(...templateSemanticsChecker.getDiagnosticsForComponent(component));
      }
      if (this.options.strictTemplates && extendedTemplateChecker !== null) {
        diagnostics.push(...extendedTemplateChecker.getDiagnosticsForComponent(component));
      }
    } catch (err: unknown) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }
    return this.addMessageTextDetails(diagnostics);
  }

  /**
   * Add Angular.io error guide links to diagnostics for this compilation.
   */
  private addMessageTextDetails(diagnostics: ts.Diagnostic[]): ts.Diagnostic[] {
    return diagnostics.map((diag) => {
      if (diag.code && COMPILER_ERRORS_WITH_GUIDES.has(ngErrorCode(diag.code))) {
        return {
          ...diag,
          messageText:
            diag.messageText +
            `. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG${ngErrorCode(diag.code)}`,
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
   * Get the current `ts.Program` known to this `NgCompiler`.
   *
   * Compilation begins with an input `ts.Program`, and during template type-checking operations new
   * `ts.Program`s may be produced using the `ProgramDriver`. The most recent such `ts.Program` to
   * be produced is available here.
   *
   * This `ts.Program` serves two key purposes:
   *
   * * As an incremental starting point for creating the next `ts.Program` based on files that the
   *   user has changed (for clients using the TS compiler program APIs).
   *
   * * As the "before" point for an incremental compilation invocation, to determine what's changed
   *   between the old and new programs (for all compilations).
   */
  getCurrentProgram(): ts.Program {
    return this.currentProgram;
  }

  getTemplateTypeChecker(): TemplateTypeChecker {
    if (!this.enableTemplateTypeChecker) {
      throw new Error(
        'The `TemplateTypeChecker` does not work without `enableTemplateTypeChecker`.',
      );
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
   * Retrieves external resources for the given directive.
   */
  getDirectiveResources(classDecl: DeclarationNode): DirectiveResources | null {
    if (!isNamedClassDeclaration(classDecl)) {
      return null;
    }
    const {resourceRegistry} = this.ensureAnalyzed();
    const styles = resourceRegistry.getStyles(classDecl);
    const template = resourceRegistry.getTemplate(classDecl);
    const hostBindings = resourceRegistry.getHostBindings(classDecl);
    return {styles, template, hostBindings};
  }

  getMeta(classDecl: DeclarationNode): PipeMeta | DirectiveMeta | null {
    if (!isNamedClassDeclaration(classDecl)) {
      return null;
    }
    const ref = new Reference(classDecl);
    const {metaReader} = this.ensureAnalyzed();
    const meta = metaReader.getPipeMetadata(ref) ?? metaReader.getDirectiveMetadata(ref);
    if (meta === null) {
      return null;
    }
    return meta;
  }

  /**
   * Perform Angular's analysis step (as a precursor to `getDiagnostics` or `prepareEmit`)
   * asynchronously.
   *
   * Normally, this operation happens lazily whenever `getDiagnostics` or `prepareEmit` are called.
   * However, certain consumers may wish to allow for an asynchronous phase of analysis, where
   * resources such as `styleUrls` are resolved asynchronously. In these cases `analyzeAsync` must
   * be called first, and its `Promise` awaited prior to calling any other APIs of `NgCompiler`.
   */
  async analyzeAsync(): Promise<void> {
    if (this.compilation !== null) {
      return;
    }

    await this.perfRecorder.inPhase(PerfPhase.Analysis, async () => {
      this.compilation = this.makeCompilation();

      const promises: Promise<void>[] = [];
      for (const sf of this.inputProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }

        let analysisPromise = this.compilation.traitCompiler.analyzeAsync(sf);
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
   * Fetch transformers and other information which is necessary for a consumer to `emit` the
   * program with Angular-added definitions.
   */
  prepareEmit(): {
    transformers: ts.CustomTransformers;
  } {
    const compilation = this.ensureAnalyzed();

    // Untag all the files, otherwise TS 5.4 may end up emitting
    // references to typecheck files (see #56945 and #57135).
    untagAllTsFiles(this.inputProgram);

    const coreImportsFrom = compilation.isCore ? getR3SymbolsFile(this.inputProgram) : null;
    let importRewriter: ImportRewriter;
    if (coreImportsFrom !== null) {
      importRewriter = new R3SymbolsImportRewriter(coreImportsFrom.fileName);
    } else {
      importRewriter = new NoopImportRewriter();
    }

    const defaultImportTracker = new DefaultImportTracker();

    const before = [
      ivyTransformFactory(
        compilation.traitCompiler,
        compilation.reflector,
        importRewriter,
        defaultImportTracker,
        compilation.localCompilationExtraImportsTracker,
        this.delegatingPerfRecorder,
        compilation.isCore,
        this.closureCompilerEnabled,
        this.emitDeclarationOnly,
      ),
      aliasTransformFactory(compilation.traitCompiler.exportStatements),
      defaultImportTracker.importPreservingTransformer(),
    ];

    // If there are JIT declarations, wire up the JIT transform and efficiently
    // run it against the target declarations.
    if (compilation.supportJitMode && compilation.jitDeclarationRegistry.jitDeclarations.size > 0) {
      const {jitDeclarations} = compilation.jitDeclarationRegistry;
      const jitDeclarationsArray = Array.from(jitDeclarations);
      const jitDeclarationOriginalNodes = new Set(
        jitDeclarationsArray.map((d) => ts.getOriginalNode(d)),
      );
      const sourceFilesWithJit = new Set(
        jitDeclarationsArray.map((d) => d.getSourceFile().fileName),
      );

      before.push((ctx) => {
        const reflectionHost = new TypeScriptReflectionHost(this.inputProgram.getTypeChecker());
        const jitTransform = angularJitApplicationTransform(
          this.inputProgram,
          compilation.isCore,
          (node) => {
            // Class may be synthetic at this point due to Ivy transform.
            node = ts.getOriginalNode(node, ts.isClassDeclaration);
            return reflectionHost.isClass(node) && jitDeclarationOriginalNodes.has(node);
          },
        )(ctx);

        return (sourceFile) => {
          if (!sourceFilesWithJit.has(sourceFile.fileName)) {
            return sourceFile;
          }
          return jitTransform(sourceFile);
        };
      });
    }

    const afterDeclarations: ts.TransformerFactory<ts.SourceFile>[] = [];

    // In local compilation mode we don't make use of .d.ts files for Angular compilation, so their
    // transformation can be ditched.
    if (
      (this.options.compilationMode !== 'experimental-local' || this.emitDeclarationOnly) &&
      compilation.dtsTransforms !== null
    ) {
      // If we are emitting declarations only, the script transformations are skipped by the TS
      // compiler, so we have to add them to the afterDeclarations transforms to run their analysis
      // because the declaration transform depends on their metadata output.
      if (this.emitDeclarationOnly) {
        afterDeclarations.push(...before);
      }
      afterDeclarations.push(
        declarationTransformFactory(
          compilation.dtsTransforms,
          compilation.reflector,
          compilation.refEmitter,
          importRewriter,
        ),
      );
    }

    // Only add aliasing re-exports to the .d.ts output if the `AliasingHost` requests it.
    if (compilation.aliasingHost !== null && compilation.aliasingHost.aliasExportsInDts) {
      afterDeclarations.push(aliasTransformFactory(compilation.traitCompiler.exportStatements));
    }

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

  /**
   * Gets information for the current program that may be used to generate API
   * reference documentation. This includes Angular-specific information, such
   * as component inputs and outputs.
   *
   * @param entryPoint Path to the entry point for the package for which API
   *     docs should be extracted.
   *
   * @returns A map of symbols with their associated module, eg: ApplicationRef => @angular/core
   */
  getApiDocumentation(
    entryPoint: string,
    privateModules: Set<string>,
  ): {entries: DocEntry[]; symbols: Map<string, string>} {
    const compilation = this.ensureAnalyzed();
    const checker = this.inputProgram.getTypeChecker();
    const docsExtractor = new DocsExtractor(checker, compilation.metaReader);

    const entryPointSourceFile = this.inputProgram.getSourceFiles().find((sourceFile) => {
      // TODO: this will need to be more specific than `.includes`, but the exact path comparison
      //     will be easier to figure out when the pipeline is running end-to-end.
      return sourceFile.fileName.includes(entryPoint);
    });

    if (!entryPointSourceFile) {
      throw new Error(`Entry point "${entryPoint}" not found in program sources.`);
    }

    // TODO: Technically the current directory is not the root dir.
    // Should probably be derived from the config.
    const rootDir = this.inputProgram.getCurrentDirectory();
    return docsExtractor.extractAll(entryPointSourceFile, rootDir, privateModules);
  }

  /**
   * Collect i18n messages into the `Xi18nContext`.
   */
  xi18n(ctx: Xi18nContext): void {
    // Note that the 'resolve' phase is not strictly necessary for xi18n, but this is not currently
    // optimized.
    const compilation = this.ensureAnalyzed();
    compilation.traitCompiler.xi18n(ctx);
  }

  /**
   * Emits the JavaScript module that can be used to replace the metadata of a class during HMR.
   * @param node Class for which to generate the update module.
   */
  emitHmrUpdateModule(node: DeclarationNode): string | null {
    const {traitCompiler, reflector} = this.ensureAnalyzed();

    if (!reflector.isClass(node)) {
      return null;
    }

    const callback = traitCompiler.compileHmrUpdateCallback(node);

    if (callback === null) {
      return null;
    }

    const sourceFile = node.getSourceFile();
    const printer = ts.createPrinter();
    const nodeText = printer.printNode(ts.EmitHint.Unspecified, callback, sourceFile);

    return ts.transpileModule(nodeText, {
      compilerOptions: {
        ...this.options,

        // Some module types can produce additional code (see #60795) whereas we need the
        // HMR update module to use a native `export`. Override the `target` and `module`
        // to ensure that it looks as expected.
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      } as ts.CompilerOptions,
      fileName: sourceFile.fileName,
      reportDiagnostics: false,
    }).outputText;
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
      for (const sf of this.inputProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        this.compilation.traitCompiler.analyzeSync(sf);
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
      this.incrementalCompilation.recordSuccessfulAnalysis(traitCompiler);

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

    const useInlineTypeConstructors = this.programDriver.supportsInlineOperations;
    const checkTwoWayBoundEvents = this.options['_checkTwoWayBoundEvents'] ?? false;

    // Check whether the loaded version of `@angular/core` in the `ts.Program` supports unwrapping
    // writable signals for type-checking. Only Angular versions greater than 17.2 have the necessary
    // symbols to type check signals in two-way bindings. We also allow version 0.0.0 in case somebody is
    // using Angular at head.
    const allowSignalsInTwoWayBindings =
      this.angularCoreVersion === null ||
      coreVersionSupportsFeature(this.angularCoreVersion, '>= 17.2.0-0');

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
        checkControlFlowBodies: true,
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
        controlFlowPreventingContentProjection:
          this.options.extendedDiagnostics?.defaultCategory || DiagnosticCategoryLabel.Warning,
        unusedStandaloneImports:
          this.options.extendedDiagnostics?.defaultCategory || DiagnosticCategoryLabel.Warning,
        allowSignalsInTwoWayBindings,
        checkTwoWayBoundEvents,
      };
    } else {
      typeCheckingConfig = {
        applyTemplateContextGuards: false,
        checkQueries: false,
        checkTemplateBodies: false,
        checkControlFlowBodies: false,
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
        controlFlowPreventingContentProjection:
          this.options.extendedDiagnostics?.defaultCategory || DiagnosticCategoryLabel.Warning,
        unusedStandaloneImports:
          this.options.extendedDiagnostics?.defaultCategory || DiagnosticCategoryLabel.Warning,
        allowSignalsInTwoWayBindings,
        checkTwoWayBoundEvents,
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
    if (
      this.options.extendedDiagnostics?.checks?.controlFlowPreventingContentProjection !== undefined
    ) {
      typeCheckingConfig.controlFlowPreventingContentProjection =
        this.options.extendedDiagnostics.checks.controlFlowPreventingContentProjection;
    }
    if (this.options.extendedDiagnostics?.checks?.unusedStandaloneImports !== undefined) {
      typeCheckingConfig.unusedStandaloneImports =
        this.options.extendedDiagnostics.checks.unusedStandaloneImports;
    }

    return typeCheckingConfig;
  }

  private getTemplateDiagnostics(): ReadonlyArray<ts.Diagnostic> {
    const compilation = this.ensureAnalyzed();
    const diagnostics: ts.Diagnostic[] = [];

    // Get diagnostics for all files.
    for (const sf of this.inputProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || this.adapter.isShim(sf)) {
        continue;
      }

      diagnostics.push(
        ...compilation.templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram),
      );
    }

    const program = this.programDriver.getProgram();
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
    this.currentProgram = program;

    return diagnostics;
  }

  private getTemplateDiagnosticsForFile(
    sf: ts.SourceFile,
    optimizeFor: OptimizeFor,
  ): ReadonlyArray<ts.Diagnostic> {
    const compilation = this.ensureAnalyzed();

    // Get the diagnostics.
    const diagnostics: ts.Diagnostic[] = [];
    if (!sf.isDeclarationFile && !this.adapter.isShim(sf)) {
      diagnostics.push(...compilation.templateTypeChecker.getDiagnosticsForFile(sf, optimizeFor));
    }

    const program = this.programDriver.getProgram();
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
    this.currentProgram = program;

    return diagnostics;
  }

  private getNonTemplateDiagnostics(): ts.Diagnostic[] {
    if (this.nonTemplateDiagnostics === null) {
      const compilation = this.ensureAnalyzed();
      this.nonTemplateDiagnostics = [...compilation.traitCompiler.diagnostics];
      if (this.entryPoint !== null && compilation.exportReferenceGraph !== null) {
        this.nonTemplateDiagnostics.push(
          ...checkForPrivateExports(
            this.entryPoint,
            this.inputProgram.getTypeChecker(),
            compilation.exportReferenceGraph,
          ),
        );
      }
    }
    return this.nonTemplateDiagnostics;
  }

  private runAdditionalChecks(sf?: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const compilation = this.ensureAnalyzed();
    const {extendedTemplateChecker, templateSemanticsChecker, sourceFileValidator} = compilation;
    const files = sf ? [sf] : this.inputProgram.getSourceFiles();

    for (const sf of files) {
      if (sourceFileValidator !== null) {
        const sourceFileDiagnostics = sourceFileValidator.getDiagnosticsForFile(sf);
        if (sourceFileDiagnostics !== null) {
          diagnostics.push(...sourceFileDiagnostics);
        }
      }

      if (templateSemanticsChecker !== null) {
        diagnostics.push(
          ...compilation.traitCompiler.runAdditionalChecks(sf, (clazz, handler) => {
            return handler.templateSemanticsCheck?.(clazz, templateSemanticsChecker) || null;
          }),
        );
      }
      if (this.options.strictTemplates && extendedTemplateChecker !== null) {
        diagnostics.push(
          ...compilation.traitCompiler.runAdditionalChecks(sf, (clazz, handler) => {
            return handler.extendedTemplateCheck?.(clazz, extendedTemplateChecker) || null;
          }),
        );
      }
    }

    return diagnostics;
  }

  private makeCompilation(): LazyCompilationState {
    const isCore =
      this.options._isAngularCoreCompilation ?? isAngularCorePackage(this.inputProgram);

    // Note: If this compilation builds `@angular/core`, we always build in full compilation
    // mode. Code inside the core package is always compatible with itself, so it does not
    // make sense to go through the indirection of partial compilation
    let compilationMode: CompilationMode = CompilationMode.FULL;
    if (!isCore) {
      switch (this.options.compilationMode) {
        case 'full':
          compilationMode = CompilationMode.FULL;
          break;
        case 'partial':
          compilationMode = CompilationMode.PARTIAL;
          break;
        case 'experimental-local':
          compilationMode = CompilationMode.LOCAL;
          break;
      }
    }
    if (this.emitDeclarationOnly) {
      compilationMode = CompilationMode.LOCAL;
    }

    const checker = this.inputProgram.getTypeChecker();

    const reflector = new TypeScriptReflectionHost(
      checker,
      compilationMode === CompilationMode.LOCAL,
    );

    // Construct the ReferenceEmitter.
    let refEmitter: ReferenceEmitter;
    let aliasingHost: AliasingHost | null = null;
    if (
      this.adapter.unifiedModulesHost === null ||
      (!this.options['_useHostForImportGeneration'] &&
        !this.options['_useHostForImportAndAliasGeneration'])
    ) {
      let localImportStrategy: ReferenceEmitStrategy;

      // The strategy used for local, in-project imports depends on whether TS has been configured
      // with rootDirs. If so, then multiple directories may be mapped in the same "module
      // namespace" and the logic of `LogicalProjectStrategy` is required to generate correct
      // imports which may cross these multiple directories. Otherwise, plain relative imports are
      // sufficient.
      if (this.options.rootDirs !== undefined && this.options.rootDirs.length > 0) {
        // rootDirs logic is in effect - use the `LogicalProjectStrategy` for in-project relative
        // imports.
        localImportStrategy = new LogicalProjectStrategy(
          reflector,
          new LogicalFileSystem([...this.adapter.rootDirs], this.adapter),
        );
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
        new AbsoluteModuleStrategy(this.inputProgram, checker, this.moduleResolver, reflector),
        // Finally, check if the reference is being written into a file within the project's .ts
        // sources, and use a relative import if so. If this fails, ReferenceEmitter will throw
        // an error.
        localImportStrategy,
      ]);

      // If an entrypoint is present, then all user imports should be directed through the
      // entrypoint and private exports are not needed. The compiler will validate that all
      // publicly visible directives/pipes are importable via this entrypoint.
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
        ...(this.options['_useHostForImportAndAliasGeneration'] ? [new AliasStrategy()] : []),
        // Then use fileNameToModuleName to emit imports.
        new UnifiedModulesStrategy(reflector, this.adapter.unifiedModulesHost),
      ]);

      if (this.options['_useHostForImportAndAliasGeneration']) {
        aliasingHost = new UnifiedModulesAliasingHost(this.adapter.unifiedModulesHost);
      }
    }

    const evaluator = new PartialEvaluator(
      reflector,
      checker,
      this.incrementalCompilation.depGraph,
    );
    const dtsReader = new DtsMetadataReader(checker, reflector);
    const localMetaRegistry = new LocalMetadataRegistry();
    const localMetaReader: MetadataReaderWithIndex = localMetaRegistry;
    const depScopeReader = new MetadataDtsModuleScopeResolver(dtsReader, aliasingHost);
    const metaReader = new CompoundMetadataReader([localMetaReader, dtsReader]);
    const ngModuleIndex = new NgModuleIndexImpl(metaReader, localMetaReader);
    const ngModuleScopeRegistry = new LocalModuleScopeRegistry(
      localMetaReader,
      metaReader,
      depScopeReader,
      refEmitter,
      aliasingHost,
    );
    const standaloneScopeReader = new StandaloneComponentScopeReader(
      metaReader,
      ngModuleScopeRegistry,
      depScopeReader,
    );
    const selectorlessScopeReader = new SelectorlessComponentScopeReader(metaReader, reflector);
    const scopeReader: ComponentScopeReader = new CompoundComponentScopeReader([
      ngModuleScopeRegistry,
      selectorlessScopeReader,
      standaloneScopeReader,
    ]);
    const semanticDepGraphUpdater = this.incrementalCompilation.semanticDepGraphUpdater;
    const metaRegistry = new CompoundMetadataRegistry([localMetaRegistry, ngModuleScopeRegistry]);
    const injectableRegistry = new InjectableClassRegistry(reflector, isCore);
    const hostDirectivesResolver = new HostDirectivesResolver(metaReader);
    const exportedProviderStatusResolver = new ExportedProviderStatusResolver(metaReader);
    const importTracker = new ImportedSymbolsTracker();

    const typeCheckScopeRegistry = new TypeCheckScopeRegistry(
      scopeReader,
      metaReader,
      hostDirectivesResolver,
    );

    // If a flat module entrypoint was specified, then track references via a `ReferenceGraph` in
    // order to produce proper diagnostics for incorrectly exported directives/pipes/etc. If there
    // is no flat module entrypoint then don't pay the cost of tracking references.
    let referencesRegistry: ReferencesRegistry;
    let exportReferenceGraph: ReferenceGraph | null = null;
    if (this.entryPoint !== null) {
      exportReferenceGraph = new ReferenceGraph();
      referencesRegistry = new ReferenceGraphAdapter(exportReferenceGraph);
    } else {
      referencesRegistry = new NoopReferencesRegistry();
    }

    const dtsTransforms = new DtsTransformRegistry();

    const resourceRegistry = new ResourceRegistry();

    const deferredSymbolsTracker = new DeferredSymbolTracker(
      this.inputProgram.getTypeChecker(),
      this.options.onlyExplicitDeferDependencyImports ?? false,
    );

    let localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null = null;
    if (compilationMode === CompilationMode.LOCAL && this.options.generateExtraImportsInLocalMode) {
      localCompilationExtraImportsTracker = new LocalCompilationExtraImportsTracker(checker);
    }

    // Cycles are handled in full and local compilation modes by "remote scoping".
    // "Remote scoping" does not work well with tree shaking for libraries.
    // So in partial compilation mode, when building a library, a cycle will cause an error.
    const cycleHandlingStrategy =
      compilationMode === CompilationMode.PARTIAL
        ? CycleHandlingStrategy.Error
        : CycleHandlingStrategy.UseRemoteScoping;

    const strictCtorDeps = this.options.strictInjectionParameters || false;
    const supportJitMode = this.options['supportJitMode'] ?? true;
    const supportTestBed = this.options['supportTestBed'] ?? true;
    const externalRuntimeStyles = this.options['externalRuntimeStyles'] ?? false;
    const typeCheckHostBindings = this.options.typeCheckHostBindings ?? false;

    // Libraries compiled in partial mode could potentially be used with TestBed within an
    // application. Since this is not known at library compilation time, support is required to
    // prevent potential downstream application testing breakage.
    if (supportTestBed === false && compilationMode === CompilationMode.PARTIAL) {
      throw new Error(
        'TestBed support ("supportTestBed" option) cannot be disabled in partial compilation mode.',
      );
    }
    if (supportJitMode === false && compilationMode === CompilationMode.PARTIAL) {
      throw new Error(
        'JIT mode support ("supportJitMode" option) cannot be disabled in partial compilation mode.',
      );
    }

    // Currently forbidOrphanComponents depends on the code generated behind ngJitMode flag. Until
    // we come up with a better design for these flags, it is necessary to have the JIT mode in
    // order for forbidOrphanComponents to be able to work properly.
    if (supportJitMode === false && this.options.forbidOrphanComponents) {
      throw new Error(
        'JIT mode support ("supportJitMode" option) cannot be disabled when forbidOrphanComponents is set to true',
      );
    }

    const jitDeclarationRegistry = new JitDeclarationRegistry();

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers: DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>[] = [
      new ComponentDecoratorHandler(
        reflector,
        evaluator,
        metaRegistry,
        metaReader,
        scopeReader,
        this.adapter,
        ngModuleScopeRegistry,
        typeCheckScopeRegistry,
        resourceRegistry,
        isCore,
        strictCtorDeps,
        this.resourceManager,
        this.adapter.rootDirs,
        this.options.preserveWhitespaces || false,
        this.options.i18nUseExternalIds !== false,
        this.options.enableI18nLegacyMessageIdFormat !== false,
        this.usePoisonedData,
        this.options.i18nNormalizeLineEndingsInICUs === true,
        this.moduleResolver,
        this.cycleAnalyzer,
        cycleHandlingStrategy,
        refEmitter,
        referencesRegistry,
        this.incrementalCompilation.depGraph,
        injectableRegistry,
        semanticDepGraphUpdater,
        this.closureCompilerEnabled,
        this.delegatingPerfRecorder,
        hostDirectivesResolver,
        importTracker,
        supportTestBed,
        compilationMode,
        deferredSymbolsTracker,
        !!this.options.forbidOrphanComponents,
        this.enableBlockSyntax,
        this.enableLetSyntax,
        externalRuntimeStyles,
        localCompilationExtraImportsTracker,
        jitDeclarationRegistry,
        this.options.i18nPreserveWhitespaceForLegacyExtraction ?? true,
        !!this.options.strictStandalone,
        this.enableHmr,
        this.implicitStandaloneValue,
        typeCheckHostBindings,
        this.enableSelectorless,
        this.emitDeclarationOnly,
      ),

      // TODO(alxhub): understand why the cast here is necessary (something to do with `null`
      // not being assignable to `unknown` when wrapped in `Readonly`).
      new DirectiveDecoratorHandler(
        reflector,
        evaluator,
        metaRegistry,
        ngModuleScopeRegistry,
        metaReader,
        injectableRegistry,
        refEmitter,
        referencesRegistry,
        isCore,
        strictCtorDeps,
        semanticDepGraphUpdater,
        this.closureCompilerEnabled,
        this.delegatingPerfRecorder,
        importTracker,
        supportTestBed,
        typeCheckScopeRegistry,
        compilationMode,
        jitDeclarationRegistry,
        resourceRegistry,
        !!this.options.strictStandalone,
        this.implicitStandaloneValue,
        this.usePoisonedData,
        typeCheckHostBindings,
        this.emitDeclarationOnly,
      ) as Readonly<DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>>,
      // Pipe handler must be before injectable handler in list so pipe factories are printed
      // before injectable factories (so injectable factories can delegate to them)
      new PipeDecoratorHandler(
        reflector,
        evaluator,
        metaRegistry,
        ngModuleScopeRegistry,
        injectableRegistry,
        isCore,
        this.delegatingPerfRecorder,
        supportTestBed,
        compilationMode,
        !!this.options.generateExtraImportsInLocalMode,
        !!this.options.strictStandalone,
        this.implicitStandaloneValue,
      ),
      new InjectableDecoratorHandler(
        reflector,
        evaluator,
        isCore,
        strictCtorDeps,
        injectableRegistry,
        this.delegatingPerfRecorder,
        supportTestBed,
        compilationMode,
      ),
      new NgModuleDecoratorHandler(
        reflector,
        evaluator,
        metaReader,
        metaRegistry,
        ngModuleScopeRegistry,
        referencesRegistry,
        exportedProviderStatusResolver,
        semanticDepGraphUpdater,
        isCore,
        refEmitter,
        this.closureCompilerEnabled,
        this.options.onlyPublishPublicTypingsForNgModules ?? false,
        injectableRegistry,
        this.delegatingPerfRecorder,
        supportTestBed,
        supportJitMode,
        compilationMode,
        localCompilationExtraImportsTracker,
        jitDeclarationRegistry,
        this.emitDeclarationOnly,
      ),
    ];

    const traitCompiler = new TraitCompiler(
      handlers,
      reflector,
      this.delegatingPerfRecorder,
      this.incrementalCompilation,
      this.options.compileNonExportedClasses !== false,
      compilationMode,
      dtsTransforms,
      semanticDepGraphUpdater,
      this.adapter,
      this.emitDeclarationOnly,
    );

    // Template type-checking may use the `ProgramDriver` to produce new `ts.Program`(s). If this
    // happens, they need to be tracked by the `NgCompiler`.
    const notifyingDriver = new NotifyingProgramDriverWrapper(
      this.programDriver,
      (program: ts.Program) => {
        this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
        this.currentProgram = program;
      },
    );

    const typeCheckingConfig = this.getTypeCheckingConfig();
    const templateTypeChecker = new TemplateTypeCheckerImpl(
      this.inputProgram,
      notifyingDriver,
      traitCompiler,
      typeCheckingConfig,
      refEmitter,
      reflector,
      this.adapter,
      this.incrementalCompilation,
      metaReader,
      localMetaReader,
      ngModuleIndex,
      scopeReader,
      typeCheckScopeRegistry,
      this.delegatingPerfRecorder,
    );

    // Only construct the extended template checker if the configuration is valid and usable.
    const extendedTemplateChecker =
      this.constructionDiagnostics.length === 0
        ? new ExtendedTemplateCheckerImpl(
            templateTypeChecker,
            checker,
            ALL_DIAGNOSTIC_FACTORIES,
            this.options,
          )
        : null;

    const templateSemanticsChecker =
      this.constructionDiagnostics.length === 0
        ? new TemplateSemanticsCheckerImpl(templateTypeChecker)
        : null;

    const sourceFileValidator =
      this.constructionDiagnostics.length === 0
        ? new SourceFileValidator(reflector, importTracker, templateTypeChecker, typeCheckingConfig)
        : null;

    return {
      isCore,
      traitCompiler,
      reflector,
      scopeRegistry: ngModuleScopeRegistry,
      dtsTransforms,
      exportReferenceGraph,
      metaReader,
      typeCheckScopeRegistry,
      aliasingHost,
      refEmitter,
      templateTypeChecker,
      resourceRegistry,
      extendedTemplateChecker,
      localCompilationExtraImportsTracker,
      jitDeclarationRegistry,
      templateSemanticsChecker,
      sourceFileValidator,
      supportJitMode,
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
  return r3Symbols.statements.some((stmt) => {
    // The statement must be a variable declaration statement.
    if (!ts.isVariableStatement(stmt)) {
      return false;
    }
    // It must be exported.
    const modifiers = ts.getModifiers(stmt);
    if (
      modifiers === undefined ||
      !modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      return false;
    }
    // It must declare ITS_JUST_ANGULAR.
    return stmt.declarationList.declarations.some((decl) => {
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
function getR3SymbolsFile(program: ts.Program): ts.SourceFile | null {
  return (
    program.getSourceFiles().find((file) => file.fileName.indexOf('r3_symbols.ts') >= 0) || null
  );
}

/**
 * Since "strictTemplates" is a true superset of type checking capabilities compared to
 * "fullTemplateTypeCheck", it is required that the latter is not explicitly disabled if the
 * former is enabled.
 */
function* verifyCompatibleTypeCheckOptions(
  options: NgCompilerOptions,
): Generator<ts.Diagnostic, void, void> {
  if (options.fullTemplateTypeCheck === false && options.strictTemplates === true) {
    yield makeConfigDiagnostic({
      category: ts.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK,
      messageText: `
Angular compiler option "strictTemplates" is enabled, however "fullTemplateTypeCheck" is disabled.

Having the "strictTemplates" flag enabled implies that "fullTemplateTypeCheck" is also enabled, so
the latter can not be explicitly disabled.

One of the following actions is required:
1. Remove the "fullTemplateTypeCheck" option.
2. Remove "strictTemplates" or set it to 'false'.

More information about the template type checking compiler options can be found in the documentation:
https://angular.dev/tools/cli/template-typecheck
      `.trim(),
    });
  }

  if (options.extendedDiagnostics && options.strictTemplates === false) {
    yield makeConfigDiagnostic({
      category: ts.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES,
      messageText: `
Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.

Using "extendedDiagnostics" requires that "strictTemplates" is also enabled.

One of the following actions is required:
1. Remove "strictTemplates: false" to enable it.
2. Remove "extendedDiagnostics" configuration to disable them.
      `.trim(),
    });
  }

  const allowedCategoryLabels = Array.from(Object.values(DiagnosticCategoryLabel)) as string[];
  const defaultCategory = options.extendedDiagnostics?.defaultCategory;
  if (defaultCategory && !allowedCategoryLabels.includes(defaultCategory)) {
    yield makeConfigDiagnostic({
      category: ts.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
      messageText: `
Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "${defaultCategory}".

Allowed diagnostic categories are:
${allowedCategoryLabels.join('\n')}
      `.trim(),
    });
  }

  for (const [checkName, category] of Object.entries(options.extendedDiagnostics?.checks ?? {})) {
    if (!SUPPORTED_DIAGNOSTIC_NAMES.has(checkName)) {
      yield makeConfigDiagnostic({
        category: ts.DiagnosticCategory.Error,
        code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK,
        messageText: `
Angular compiler option "extendedDiagnostics.checks" has an unknown check: "${checkName}".

Allowed check names are:
${Array.from(SUPPORTED_DIAGNOSTIC_NAMES).join('\n')}
        `.trim(),
      });
    }

    if (!allowedCategoryLabels.includes(category)) {
      yield makeConfigDiagnostic({
        category: ts.DiagnosticCategory.Error,
        code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
        messageText: `
Angular compiler option "extendedDiagnostics.checks['${checkName}']" has an unknown diagnostic category: "${category}".

Allowed diagnostic categories are:
${allowedCategoryLabels.join('\n')}
        `.trim(),
      });
    }
  }
}

function makeConfigDiagnostic({
  category,
  code,
  messageText,
}: {
  category: ts.DiagnosticCategory;
  code: ErrorCode;
  messageText: string;
}): ts.Diagnostic {
  return {
    category,
    code: ngErrorCode(code),
    file: undefined,
    start: undefined,
    length: undefined,
    messageText,
  };
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

class NotifyingProgramDriverWrapper implements ProgramDriver {
  getSourceFileVersion: ProgramDriver['getSourceFileVersion'];

  constructor(
    private delegate: ProgramDriver,
    private notifyNewProgram: (program: ts.Program) => void,
  ) {
    this.getSourceFileVersion = this.delegate.getSourceFileVersion?.bind(this);
  }

  get supportsInlineOperations() {
    return this.delegate.supportsInlineOperations;
  }

  getProgram(): ts.Program {
    return this.delegate.getProgram();
  }

  updateFiles(contents: Map<AbsoluteFsPath, FileUpdate>, updateMode: UpdateMode): void {
    this.delegate.updateFiles(contents, updateMode);
    this.notifyNewProgram(this.delegate.getProgram());
  }
}

function versionMapFromProgram(
  program: ts.Program,
  driver: ProgramDriver,
): Map<AbsoluteFsPath, string> | null {
  if (driver.getSourceFileVersion === undefined) {
    return null;
  }

  const versions = new Map<AbsoluteFsPath, string>();
  for (const possiblyRedirectedSourceFile of program.getSourceFiles()) {
    const sf = toUnredirectedSourceFile(possiblyRedirectedSourceFile);
    versions.set(absoluteFromSourceFile(sf), driver.getSourceFileVersion(sf));
  }
  return versions;
}
