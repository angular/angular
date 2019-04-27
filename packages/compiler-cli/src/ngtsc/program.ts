/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile} from '@angular/compiler';
import * as ts from 'typescript';

import * as api from '../transformers/api';
import {nocollapseHack} from '../transformers/nocollapse_hack';

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, NoopReferencesRegistry, PipeDecoratorHandler, ReferencesRegistry} from './annotations';
import {BaseDefDecoratorHandler} from './annotations/src/base_def';
import {CycleAnalyzer, ImportGraph} from './cycles';
import {ErrorCode, ngErrorCode} from './diagnostics';
import {FlatIndexGenerator, ReferenceGraph, checkForPrivateExports, findFlatIndexEntryPoint} from './entry_point';
import {AbsoluteFsPath, LogicalFileSystem, absoluteFrom} from './file_system';
import {AbsoluteModuleStrategy, AliasGenerator, AliasStrategy, DefaultImportTracker, FileToModuleHost, FileToModuleStrategy, ImportRewriter, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, NoopImportRewriter, R3SymbolsImportRewriter, Reference, ReferenceEmitter} from './imports';
import {IncrementalState} from './incremental';
import {IndexedComponent, IndexingContext} from './indexer';
import {generateAnalysis} from './indexer/src/transform';
import {CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, LocalMetadataRegistry, MetadataReader} from './metadata';
import {PartialEvaluator} from './partial_evaluator';
import {NOOP_PERF_RECORDER, PerfRecorder, PerfTracker} from './perf';
import {TypeScriptReflectionHost} from './reflection';
import {HostResourceLoader} from './resource_loader';
import {NgModuleRouteAnalyzer, entryPointKeyFor} from './routing';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from './scope';
import {FactoryGenerator, FactoryInfo, GeneratedShimsHostWrapper, ShimGenerator, SummaryGenerator, TypeCheckShimGenerator, generatedFactoryTransform} from './shims';
import {ivySwitchTransform} from './switch';
import {IvyCompilation, declarationTransformFactory, ivyTransformFactory} from './transform';
import {aliasTransformFactory} from './transform/src/alias';
import {TypeCheckContext, TypeCheckingConfig, typeCheckFilePath} from './typecheck';
import {normalizeSeparators} from './util/src/path';
import {getRootDirs, getSourceFileOrNull, isDtsPath, resolveModuleName} from './util/src/typescript';

export class NgtscProgram implements api.Program {
  private tsProgram: ts.Program;
  private reuseTsProgram: ts.Program;
  private resourceManager: HostResourceLoader;
  private compilation: IvyCompilation|undefined = undefined;
  private factoryToSourceInfo: Map<string, FactoryInfo>|null = null;
  private sourceToFactorySymbols: Map<string, Set<string>>|null = null;
  private _coreImportsFrom: ts.SourceFile|null|undefined = undefined;
  private _importRewriter: ImportRewriter|undefined = undefined;
  private _reflector: TypeScriptReflectionHost|undefined = undefined;
  private _isCore: boolean|undefined = undefined;
  private rootDirs: AbsoluteFsPath[];
  private closureCompilerEnabled: boolean;
  private entryPoint: ts.SourceFile|null;
  private exportReferenceGraph: ReferenceGraph|null = null;
  private flatIndexGenerator: FlatIndexGenerator|null = null;
  private routeAnalyzer: NgModuleRouteAnalyzer|null = null;

  private constructionDiagnostics: ts.Diagnostic[] = [];
  private moduleResolver: ModuleResolver;
  private cycleAnalyzer: CycleAnalyzer;
  private metaReader: MetadataReader|null = null;

  private refEmitter: ReferenceEmitter|null = null;
  private fileToModuleHost: FileToModuleHost|null = null;
  private defaultImportTracker: DefaultImportTracker;
  private perfRecorder: PerfRecorder = NOOP_PERF_RECORDER;
  private perfTracker: PerfTracker|null = null;
  private incrementalState: IncrementalState;
  private typeCheckFilePath: AbsoluteFsPath;

  private modifiedResourceFiles: Set<string>|null;

  constructor(
      rootNames: ReadonlyArray<string>, private options: api.CompilerOptions,
      private host: api.CompilerHost, oldProgram?: NgtscProgram) {
    if (shouldEnablePerfTracing(options)) {
      this.perfTracker = PerfTracker.zeroedToNow();
      this.perfRecorder = this.perfTracker;
    }

    this.modifiedResourceFiles =
        this.host.getModifiedResourceFiles && this.host.getModifiedResourceFiles() || null;
    this.rootDirs = getRootDirs(host, options);
    this.closureCompilerEnabled = !!options.annotateForClosureCompiler;
    this.resourceManager = new HostResourceLoader(host, options);
    const shouldGenerateShims = options.allowEmptyCodegenFiles || false;
    const normalizedRootNames = rootNames.map(n => absoluteFrom(n));
    if (host.fileNameToModuleName !== undefined) {
      this.fileToModuleHost = host as FileToModuleHost;
    }
    let rootFiles = [...rootNames];

    const generators: ShimGenerator[] = [];
    if (shouldGenerateShims) {
      // Summary generation.
      const summaryGenerator = SummaryGenerator.forRootFiles(normalizedRootNames);

      // Factory generation.
      const factoryGenerator = FactoryGenerator.forRootFiles(normalizedRootNames);
      const factoryFileMap = factoryGenerator.factoryFileMap;
      this.factoryToSourceInfo = new Map<string, FactoryInfo>();
      this.sourceToFactorySymbols = new Map<string, Set<string>>();
      factoryFileMap.forEach((sourceFilePath, factoryPath) => {
        const moduleSymbolNames = new Set<string>();
        this.sourceToFactorySymbols !.set(sourceFilePath, moduleSymbolNames);
        this.factoryToSourceInfo !.set(factoryPath, {sourceFilePath, moduleSymbolNames});
      });

      const factoryFileNames = Array.from(factoryFileMap.keys());
      rootFiles.push(...factoryFileNames, ...summaryGenerator.getSummaryFileNames());
      generators.push(summaryGenerator, factoryGenerator);
    }

    this.typeCheckFilePath = typeCheckFilePath(this.rootDirs);
    generators.push(new TypeCheckShimGenerator(this.typeCheckFilePath));
    rootFiles.push(this.typeCheckFilePath);

    let entryPoint: AbsoluteFsPath|null = null;
    if (options.flatModuleOutFile !== undefined) {
      entryPoint = findFlatIndexEntryPoint(normalizedRootNames);
      if (entryPoint === null) {
        // This error message talks specifically about having a single .ts file in "files". However
        // the actual logic is a bit more permissive. If a single file exists, that will be taken,
        // otherwise the highest level (shortest path) "index.ts" file will be used as the flat
        // module entry point instead. If neither of these conditions apply, the error below is
        // given.
        //
        // The user is not informed about the "index.ts" option as this behavior is deprecated -
        // an explicit entrypoint should always be specified.
        this.constructionDiagnostics.push({
          category: ts.DiagnosticCategory.Error,
          code: ngErrorCode(ErrorCode.CONFIG_FLAT_MODULE_NO_INDEX),
          file: undefined,
          start: undefined,
          length: undefined,
          messageText:
              'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.',
        });
      } else {
        const flatModuleId = options.flatModuleId || null;
        const flatModuleOutFile = normalizeSeparators(options.flatModuleOutFile);
        this.flatIndexGenerator =
            new FlatIndexGenerator(entryPoint, flatModuleOutFile, flatModuleId);
        generators.push(this.flatIndexGenerator);
        rootFiles.push(this.flatIndexGenerator.flatIndexPath);
      }
    }

    if (generators.length > 0) {
      this.host = new GeneratedShimsHostWrapper(host, generators);
    }

    this.tsProgram =
        ts.createProgram(rootFiles, options, this.host, oldProgram && oldProgram.reuseTsProgram);
    this.reuseTsProgram = this.tsProgram;

    this.entryPoint = entryPoint !== null ? getSourceFileOrNull(this.tsProgram, entryPoint) : null;
    this.moduleResolver = new ModuleResolver(this.tsProgram, options, this.host);
    this.cycleAnalyzer = new CycleAnalyzer(new ImportGraph(this.moduleResolver));
    this.defaultImportTracker = new DefaultImportTracker();
    if (oldProgram === undefined) {
      this.incrementalState = IncrementalState.fresh();
    } else {
      this.incrementalState = IncrementalState.reconcile(
          oldProgram.incrementalState, oldProgram.reuseTsProgram, this.tsProgram,
          this.modifiedResourceFiles);
    }
  }

  getTsProgram(): ts.Program { return this.tsProgram; }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getOptionsDiagnostics(cancellationToken);
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic|api.Diagnostic> {
    return this.constructionDiagnostics;
  }

  getTsSyntacticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
  }

  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken|
                             undefined): ReadonlyArray<api.Diagnostic> {
    return [];
  }

  getTsSemanticDiagnostics(
      sourceFile?: ts.SourceFile|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
  }

  getNgSemanticDiagnostics(
      fileName?: string|undefined, cancellationToken?: ts.CancellationToken|
                                   undefined): ReadonlyArray<ts.Diagnostic|api.Diagnostic> {
    const compilation = this.ensureAnalyzed();
    const diagnostics = [...compilation.diagnostics, ...this.getTemplateDiagnostics()];
    if (this.entryPoint !== null && this.exportReferenceGraph !== null) {
      diagnostics.push(...checkForPrivateExports(
          this.entryPoint, this.tsProgram.getTypeChecker(), this.exportReferenceGraph));
    }
    return diagnostics;
  }

  async loadNgStructureAsync(): Promise<void> {
    if (this.compilation === undefined) {
      this.compilation = this.makeCompilation();
    }
    const analyzeSpan = this.perfRecorder.start('analyze');
    await Promise.all(this.tsProgram.getSourceFiles()
                          .filter(file => !file.fileName.endsWith('.d.ts'))
                          .map(file => {

                            const analyzeFileSpan = this.perfRecorder.start('analyzeFile', file);
                            let analysisPromise = this.compilation !.analyzeAsync(file);
                            if (analysisPromise === undefined) {
                              this.perfRecorder.stop(analyzeFileSpan);
                            } else if (this.perfRecorder.enabled) {
                              analysisPromise = analysisPromise.then(
                                  () => this.perfRecorder.stop(analyzeFileSpan));
                            }
                            return analysisPromise;
                          })
                          .filter((result): result is Promise<void> => result !== undefined));
    this.perfRecorder.stop(analyzeSpan);
    this.compilation.resolve();
  }

  listLazyRoutes(entryRoute?: string|undefined): api.LazyRoute[] {
    if (entryRoute) {
      // Note:
      // This resolution step is here to match the implementation of the old `AotCompilerHost` (see
      // https://github.com/angular/angular/blob/50732e156/packages/compiler-cli/src/transformers/compiler_host.ts#L175-L188).
      //
      // `@angular/cli` will always call this API with an absolute path, so the resolution step is
      // not necessary, but keeping it backwards compatible in case someone else is using the API.

      // Relative entry paths are disallowed.
      if (entryRoute.startsWith('.')) {
        throw new Error(
            `Failed to list lazy routes: Resolution of relative paths (${entryRoute}) is not supported.`);
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
      const resolvedModule = resolveModuleName(entryPath, containingFile, this.options, this.host);

      if (resolvedModule) {
        entryRoute = entryPointKeyFor(resolvedModule.resolvedFileName, moduleName);
      }
    }

    this.ensureAnalyzed();
    return this.routeAnalyzer !.listLazyRoutes(entryRoute);
  }

  getLibrarySummaries(): Map<string, api.LibrarySummary> {
    throw new Error('Method not implemented.');
  }

  getEmittedGeneratedFiles(): Map<string, GeneratedFile> {
    throw new Error('Method not implemented.');
  }

  getEmittedSourceFiles(): Map<string, ts.SourceFile> {
    throw new Error('Method not implemented.');
  }

  private ensureAnalyzed(): IvyCompilation {
    if (this.compilation === undefined) {
      const analyzeSpan = this.perfRecorder.start('analyze');
      this.compilation = this.makeCompilation();
      this.tsProgram.getSourceFiles()
          .filter(file => !file.fileName.endsWith('.d.ts'))
          .forEach(file => {
            const analyzeFileSpan = this.perfRecorder.start('analyzeFile', file);
            this.compilation !.analyzeSync(file);
            this.perfRecorder.stop(analyzeFileSpan);
          });
      this.perfRecorder.stop(analyzeSpan);
      this.compilation.resolve();
    }
    return this.compilation;
  }

  emit(opts?: {
    emitFlags?: api.EmitFlags,
    cancellationToken?: ts.CancellationToken,
    customTransformers?: api.CustomTransformers,
    emitCallback?: api.TsEmitCallback,
    mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback
  }): ts.EmitResult {
    const emitCallback = opts && opts.emitCallback || defaultEmitCallback;

    const compilation = this.ensureAnalyzed();

    const writeFile: ts.WriteFileCallback =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError: ((message: string) => void) | undefined,
         sourceFiles: ReadonlyArray<ts.SourceFile>| undefined) => {
          if (this.closureCompilerEnabled && fileName.endsWith('.js')) {
            data = nocollapseHack(data);
          }
          this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        };

    const customTransforms = opts && opts.customTransformers;

    const beforeTransforms = [
      ivyTransformFactory(
          compilation, this.reflector, this.importRewriter, this.defaultImportTracker, this.isCore,
          this.closureCompilerEnabled),
      aliasTransformFactory(compilation.exportStatements) as ts.TransformerFactory<ts.SourceFile>,
      this.defaultImportTracker.importPreservingTransformer(),
    ];
    const afterDeclarationsTransforms = [
      declarationTransformFactory(compilation),
    ];


    if (this.factoryToSourceInfo !== null) {
      beforeTransforms.push(
          generatedFactoryTransform(this.factoryToSourceInfo, this.importRewriter));
    }
    beforeTransforms.push(ivySwitchTransform);
    if (customTransforms && customTransforms.beforeTs) {
      beforeTransforms.push(...customTransforms.beforeTs);
    }

    const emitSpan = this.perfRecorder.start('emit');
    const emitResults: ts.EmitResult[] = [];

    const typeCheckFile = getSourceFileOrNull(this.tsProgram, this.typeCheckFilePath);

    for (const targetSourceFile of this.tsProgram.getSourceFiles()) {
      if (targetSourceFile.isDeclarationFile || targetSourceFile === typeCheckFile) {
        continue;
      }

      if (this.incrementalState.safeToSkip(targetSourceFile)) {
        continue;
      }

      const fileEmitSpan = this.perfRecorder.start('emitFile', targetSourceFile);
      emitResults.push(emitCallback({
        targetSourceFile,
        program: this.tsProgram,
        host: this.host,
        options: this.options,
        emitOnlyDtsFiles: false, writeFile,
        customTransformers: {
          before: beforeTransforms,
          after: customTransforms && customTransforms.afterTs,
          afterDeclarations: afterDeclarationsTransforms,
        },
      }));
      this.perfRecorder.stop(fileEmitSpan);
    }
    this.perfRecorder.stop(emitSpan);

    if (this.perfTracker !== null && this.options.tracePerformance !== undefined) {
      this.perfTracker.serializeToFile(this.options.tracePerformance, this.host);
    }

    // Run the emit, including a custom transformer that will downlevel the Ivy decorators in code.
    return ((opts && opts.mergeEmitResultsCallback) || mergeEmitResults)(emitResults);
  }

  private getTemplateDiagnostics(): ReadonlyArray<api.Diagnostic|ts.Diagnostic> {
    // Skip template type-checking if it's disabled.
    if (this.options.ivyTemplateTypeCheck === false &&
        this.options.fullTemplateTypeCheck !== true) {
      return [];
    }

    const compilation = this.ensureAnalyzed();

    // Run template type-checking.

    // First select a type-checking configuration, based on whether full template type-checking is
    // requested.
    let typeCheckingConfig: TypeCheckingConfig;
    if (this.options.fullTemplateTypeCheck) {
      typeCheckingConfig = {
        applyTemplateContextGuards: true,
        checkQueries: false,
        checkTemplateBodies: true,
        checkTypeOfBindings: true,
        checkTypeOfPipes: true,
        strictSafeNavigationTypes: true,
      };
    } else {
      typeCheckingConfig = {
        applyTemplateContextGuards: false,
        checkQueries: false,
        checkTemplateBodies: false,
        checkTypeOfBindings: false,
        checkTypeOfPipes: false,
        strictSafeNavigationTypes: false,
      };
    }

    // Execute the typeCheck phase of each decorator in the program.
    const prepSpan = this.perfRecorder.start('typeCheckPrep');
    const ctx = new TypeCheckContext(typeCheckingConfig, this.refEmitter !, this.typeCheckFilePath);
    compilation.typeCheck(ctx);
    this.perfRecorder.stop(prepSpan);

    // Get the diagnostics.
    const typeCheckSpan = this.perfRecorder.start('typeCheckDiagnostics');
    const {diagnostics, program} =
        ctx.calculateTemplateDiagnostics(this.tsProgram, this.host, this.options);
    this.perfRecorder.stop(typeCheckSpan);
    this.reuseTsProgram = program;

    return diagnostics;
  }

  getIndexedComponents(): Map<ts.Declaration, IndexedComponent> {
    const compilation = this.ensureAnalyzed();
    const context = new IndexingContext();
    compilation.index(context);
    return generateAnalysis(context);
  }

  private makeCompilation(): IvyCompilation {
    const checker = this.tsProgram.getTypeChecker();

    let aliasGenerator: AliasGenerator|null = null;
    // Construct the ReferenceEmitter.
    if (this.fileToModuleHost === null || !this.options._useHostForImportGeneration) {
      // The CompilerHost doesn't have fileNameToModuleName, so build an NPM-centric reference
      // resolution strategy.
      this.refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Next, attempt to use an absolute import.
        new AbsoluteModuleStrategy(
            this.tsProgram, checker, this.options, this.host, this.reflector),
        // Finally, check if the reference is being written into a file within the project's logical
        // file system, and use a relative import if so. If this fails, ReferenceEmitter will throw
        // an error.
        new LogicalProjectStrategy(checker, new LogicalFileSystem(this.rootDirs)),
      ]);
    } else {
      // The CompilerHost supports fileNameToModuleName, so use that to emit imports.
      this.refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Then use aliased references (this is a workaround to StrictDeps checks).
        new AliasStrategy(),
        // Then use fileNameToModuleName to emit imports.
        new FileToModuleStrategy(checker, this.fileToModuleHost),
      ]);
      aliasGenerator = new AliasGenerator(this.fileToModuleHost);
    }

    const evaluator = new PartialEvaluator(this.reflector, checker, this.incrementalState);
    const dtsReader = new DtsMetadataReader(checker, this.reflector);
    const localMetaRegistry = new LocalMetadataRegistry();
    const localMetaReader = new CompoundMetadataReader([localMetaRegistry, this.incrementalState]);
    const depScopeReader = new MetadataDtsModuleScopeResolver(dtsReader, aliasGenerator);
    const scopeRegistry = new LocalModuleScopeRegistry(
        localMetaReader, depScopeReader, this.refEmitter, aliasGenerator);
    const metaRegistry =
        new CompoundMetadataRegistry([localMetaRegistry, scopeRegistry, this.incrementalState]);

    this.metaReader = new CompoundMetadataReader([localMetaReader, dtsReader]);


    // If a flat module entrypoint was specified, then track references via a `ReferenceGraph`
    // in
    // order to produce proper diagnostics for incorrectly exported directives/pipes/etc. If
    // there
    // is no flat module entrypoint then don't pay the cost of tracking references.
    let referencesRegistry: ReferencesRegistry;
    if (this.entryPoint !== null) {
      this.exportReferenceGraph = new ReferenceGraph();
      referencesRegistry = new ReferenceGraphAdapter(this.exportReferenceGraph);
    } else {
      referencesRegistry = new NoopReferencesRegistry();
    }

    this.routeAnalyzer = new NgModuleRouteAnalyzer(this.moduleResolver, evaluator);

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers = [
      new BaseDefDecoratorHandler(this.reflector, evaluator, this.isCore),
      new ComponentDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.metaReader !, scopeRegistry, this.isCore,
          this.resourceManager, this.rootDirs, this.options.preserveWhitespaces || false,
          this.options.i18nUseExternalIds !== false, this.moduleResolver, this.cycleAnalyzer,
          this.refEmitter, this.defaultImportTracker, this.incrementalState),
      new DirectiveDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.defaultImportTracker, this.isCore),
      new InjectableDecoratorHandler(
          this.reflector, this.defaultImportTracker, this.isCore,
          this.options.strictInjectionParameters || false),
      new NgModuleDecoratorHandler(
          this.reflector, evaluator, metaRegistry, scopeRegistry, referencesRegistry, this.isCore,
          this.routeAnalyzer, this.refEmitter, this.defaultImportTracker,
          this.options.i18nInLocale),
      new PipeDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.defaultImportTracker, this.isCore),
    ];

    return new IvyCompilation(
        handlers, this.reflector, this.importRewriter, this.incrementalState, this.perfRecorder,
        this.sourceToFactorySymbols, scopeRegistry);
  }

  private get reflector(): TypeScriptReflectionHost {
    if (this._reflector === undefined) {
      this._reflector = new TypeScriptReflectionHost(this.tsProgram.getTypeChecker());
    }
    return this._reflector;
  }

  private get coreImportsFrom(): ts.SourceFile|null {
    if (this._coreImportsFrom === undefined) {
      this._coreImportsFrom = this.isCore && getR3SymbolsFile(this.tsProgram) || null;
    }
    return this._coreImportsFrom;
  }

  private get isCore(): boolean {
    if (this._isCore === undefined) {
      this._isCore = isAngularCorePackage(this.tsProgram);
    }
    return this._isCore;
  }

  private get importRewriter(): ImportRewriter {
    if (this._importRewriter === undefined) {
      const coreImportsFrom = this.coreImportsFrom;
      this._importRewriter = coreImportsFrom !== null ?
          new R3SymbolsImportRewriter(coreImportsFrom.fileName) :
          new NoopImportRewriter();
    }
    return this._importRewriter;
  }
}

const defaultEmitCallback: api.TsEmitCallback =
    ({program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
      customTransformers}) =>
        program.emit(
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);

function mergeEmitResults(emitResults: ts.EmitResult[]): ts.EmitResult {
  const diagnostics: ts.Diagnostic[] = [];
  let emitSkipped = false;
  const emittedFiles: string[] = [];
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...(er.emittedFiles || []));
  }

  return {diagnostics, emitSkipped, emittedFiles};
}

/**
 * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
 */
function getR3SymbolsFile(program: ts.Program): ts.SourceFile|null {
  return program.getSourceFiles().find(file => file.fileName.indexOf('r3_symbols.ts') >= 0) || null;
}

/**
 * Determine if the given `Program` is @angular/core.
 */
function isAngularCorePackage(program: ts.Program): boolean {
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

export class ReferenceGraphAdapter implements ReferencesRegistry {
  constructor(private graph: ReferenceGraph) {}

  add(source: ts.Declaration, ...references: Reference<ts.Declaration>[]): void {
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

function shouldEnablePerfTracing(options: api.CompilerOptions): boolean {
  return options.tracePerformance !== undefined;
}
