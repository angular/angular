/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile, Type} from '@angular/compiler';
import * as ts from 'typescript';

import * as api from '../transformers/api';
import {nocollapseHack} from '../transformers/nocollapse_hack';
import {verifySupportedTypeScriptVersion} from '../typescript_support';

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, NoopReferencesRegistry, PipeDecoratorHandler, ReferencesRegistry} from './annotations';
import {CycleAnalyzer, ImportGraph} from './cycles';
import {ErrorCode, ngErrorCode} from './diagnostics';
import {FlatIndexGenerator, ReferenceGraph, checkForPrivateExports, findFlatIndexEntryPoint} from './entry_point';
import {AbsoluteFsPath, LogicalFileSystem, absoluteFrom} from './file_system';
import {AbsoluteModuleStrategy, AliasStrategy, AliasingHost, DefaultImportTracker, FileToModuleAliasingHost, FileToModuleHost, FileToModuleStrategy, ImportRewriter, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, NoopImportRewriter, PrivateExportAliasingHost, R3SymbolsImportRewriter, Reference, ReferenceEmitStrategy, ReferenceEmitter, RelativePathStrategy} from './imports';
import {IncrementalDriver} from './incremental';
import {IndexedComponent, IndexingContext} from './indexer';
import {generateAnalysis} from './indexer/src/transform';
import {CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, LocalMetadataRegistry, MetadataReader} from './metadata';
import {InjectableClassRegistry} from './metadata/src/registry';
import {ModuleWithProvidersScanner} from './modulewithproviders';
import {PartialEvaluator} from './partial_evaluator';
import {NOOP_PERF_RECORDER, PerfRecorder, PerfTracker} from './perf';
import {TypeScriptReflectionHost} from './reflection';
import {HostResourceLoader} from './resource_loader';
import {NgModuleRouteAnalyzer, entryPointKeyFor} from './routing';
import {ComponentScopeReader, CompoundComponentScopeReader, LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from './scope';
import {FactoryGenerator, FactoryTracker, GeneratedShimsHostWrapper, ShimGenerator, SummaryGenerator, TypeCheckShimGenerator, generatedFactoryTransform} from './shims';
import {ivySwitchTransform} from './switch';
import {DecoratorHandler, DtsTransformRegistry, TraitCompiler, declarationTransformFactory, ivyTransformFactory} from './transform';
import {aliasTransformFactory} from './transform/src/alias';
import {TypeCheckContext, TypeCheckingConfig, typeCheckFilePath} from './typecheck';
import {normalizeSeparators} from './util/src/path';
import {getRootDirs, getSourceFileOrNull, isDtsPath, resolveModuleName} from './util/src/typescript';

export class NgtscProgram implements api.Program {
  private tsProgram: ts.Program;
  private reuseTsProgram: ts.Program;
  private resourceManager: HostResourceLoader;
  private compilation: TraitCompiler|undefined = undefined;
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
  private scopeRegistry: LocalModuleScopeRegistry|null = null;

  private constructionDiagnostics: ts.Diagnostic[] = [];
  private moduleResolver: ModuleResolver;
  private cycleAnalyzer: CycleAnalyzer;
  private metaReader: MetadataReader|null = null;

  private aliasingHost: AliasingHost|null = null;
  private refEmitter: ReferenceEmitter|null = null;
  private fileToModuleHost: FileToModuleHost|null = null;
  private defaultImportTracker: DefaultImportTracker;
  private perfRecorder: PerfRecorder = NOOP_PERF_RECORDER;
  private perfTracker: PerfTracker|null = null;
  private incrementalDriver: IncrementalDriver;
  private typeCheckFilePath: AbsoluteFsPath;
  private factoryTracker: FactoryTracker|null = null;

  private modifiedResourceFiles: Set<string>|null;
  private dtsTransforms: DtsTransformRegistry|null = null;
  private mwpScanner: ModuleWithProvidersScanner|null = null;

  constructor(
      rootNames: ReadonlyArray<string>, private options: api.CompilerOptions,
      private host: api.CompilerHost, oldProgram?: NgtscProgram) {
    if (!options.disableTypeScriptVersionCheck) {
      verifySupportedTypeScriptVersion();
    }

    if (shouldEnablePerfTracing(options)) {
      this.perfTracker = PerfTracker.zeroedToNow();
      this.perfRecorder = this.perfTracker;
    }

    this.modifiedResourceFiles =
        this.host.getModifiedResourceFiles && this.host.getModifiedResourceFiles() || null;
    this.rootDirs = getRootDirs(host, options);
    this.closureCompilerEnabled = !!options.annotateForClosureCompiler;
    this.resourceManager = new HostResourceLoader(host, options);
    // TODO(alxhub): remove the fallback to allowEmptyCodegenFiles after verifying that the rest of
    // our build tooling is no longer relying on it.
    const allowEmptyCodegenFiles = options.allowEmptyCodegenFiles || false;
    const shouldGenerateFactoryShims = options.generateNgFactoryShims !== undefined ?
        options.generateNgFactoryShims :
        allowEmptyCodegenFiles;
    const shouldGenerateSummaryShims = options.generateNgSummaryShims !== undefined ?
        options.generateNgSummaryShims :
        allowEmptyCodegenFiles;
    const normalizedRootNames = rootNames.map(n => absoluteFrom(n));
    if (host.fileNameToModuleName !== undefined) {
      this.fileToModuleHost = host as FileToModuleHost;
    }
    let rootFiles = [...rootNames];

    const generators: ShimGenerator[] = [];
    let summaryGenerator: SummaryGenerator|null = null;
    if (shouldGenerateSummaryShims) {
      // Summary generation.
      summaryGenerator = SummaryGenerator.forRootFiles(normalizedRootNames);
      generators.push(summaryGenerator);
    }

    if (shouldGenerateFactoryShims) {
      // Factory generation.
      const factoryGenerator = FactoryGenerator.forRootFiles(normalizedRootNames);
      const factoryFileMap = factoryGenerator.factoryFileMap;

      const factoryFileNames = Array.from(factoryFileMap.keys());
      rootFiles.push(...factoryFileNames);
      generators.push(factoryGenerator);

      this.factoryTracker = new FactoryTracker(factoryGenerator);
    }

    // Done separately to preserve the order of factory files before summary files in rootFiles.
    // TODO(alxhub): validate that this is necessary.
    if (shouldGenerateSummaryShims) {
      rootFiles.push(...summaryGenerator !.getSummaryFileNames());
    }

    this.typeCheckFilePath = typeCheckFilePath(this.rootDirs);
    generators.push(new TypeCheckShimGenerator(this.typeCheckFilePath));
    rootFiles.push(this.typeCheckFilePath);

    let entryPoint: AbsoluteFsPath|null = null;
    if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
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
      // FIXME: Remove the any cast once google3 is fully on TS3.6.
      this.host = (new GeneratedShimsHostWrapper(host, generators) as any);
    }

    this.tsProgram =
        ts.createProgram(rootFiles, options, this.host, oldProgram && oldProgram.reuseTsProgram);
    this.reuseTsProgram = this.tsProgram;

    this.entryPoint = entryPoint !== null ? getSourceFileOrNull(this.tsProgram, entryPoint) : null;
    const moduleResolutionCache = ts.createModuleResolutionCache(
        this.host.getCurrentDirectory(), fileName => this.host.getCanonicalFileName(fileName));
    this.moduleResolver =
        new ModuleResolver(this.tsProgram, options, this.host, moduleResolutionCache);
    this.cycleAnalyzer = new CycleAnalyzer(new ImportGraph(this.moduleResolver));
    this.defaultImportTracker = new DefaultImportTracker();
    if (oldProgram === undefined) {
      this.incrementalDriver = IncrementalDriver.fresh(this.tsProgram);
    } else {
      this.incrementalDriver = IncrementalDriver.reconcile(
          oldProgram.reuseTsProgram, oldProgram.incrementalDriver, this.tsProgram,
          this.modifiedResourceFiles);
    }
  }

  getTsProgram(): ts.Program { return this.tsProgram; }

  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic> {
    return this.tsProgram.getOptionsDiagnostics(cancellationToken);
  }

  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken|
                         undefined): ReadonlyArray<ts.Diagnostic> {
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
      fileName?: string|undefined,
      cancellationToken?: ts.CancellationToken|undefined): ReadonlyArray<ts.Diagnostic> {
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
    const promises: Promise<void>[] = [];
    for (const sf of this.tsProgram.getSourceFiles()) {
      if (sf.isDeclarationFile) {
        continue;
      }

      const analyzeFileSpan = this.perfRecorder.start('analyzeFile', sf);
      let analysisPromise = this.compilation !.analyzeAsync(sf);
      this.scanForMwp(sf);
      if (analysisPromise === undefined) {
        this.perfRecorder.stop(analyzeFileSpan);
      } else if (this.perfRecorder.enabled) {
        analysisPromise = analysisPromise.then(() => this.perfRecorder.stop(analyzeFileSpan));
      }
      if (analysisPromise !== undefined) {
        promises.push(analysisPromise);
      }
    }

    await Promise.all(promises);

    this.perfRecorder.stop(analyzeSpan);

    this.resolveCompilation(this.compilation);
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
      const resolvedModule =
          resolveModuleName(entryPath, containingFile, this.options, this.host, null);

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

  private scanForMwp(sf: ts.SourceFile): void {
    this.mwpScanner !.scan(sf, {
      addTypeReplacement: (node: ts.Declaration, type: Type): void => {
        // Only obtain the return type transform for the source file once there's a type to replace,
        // so that no transform is allocated when there's nothing to do.
        this.dtsTransforms !.getReturnTypeTransform(sf).addTypeReplacement(node, type);
      }
    });
  }

  private ensureAnalyzed(): TraitCompiler {
    if (this.compilation === undefined) {
      const analyzeSpan = this.perfRecorder.start('analyze');
      this.compilation = this.makeCompilation();
      for (const sf of this.tsProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        const analyzeFileSpan = this.perfRecorder.start('analyzeFile', sf);
        this.compilation !.analyzeSync(sf);
        this.scanForMwp(sf);
        this.perfRecorder.stop(analyzeFileSpan);
      }
      this.perfRecorder.stop(analyzeSpan);

      this.resolveCompilation(this.compilation);
    }
    return this.compilation;
  }

  private resolveCompilation(compilation: TraitCompiler): void {
    compilation.resolve();

    this.recordNgModuleScopeDependencies();

    // At this point, analysis is complete and the compiler can now calculate which files need to
    // be emitted, so do that.
    this.incrementalDriver.recordSuccessfulAnalysis(compilation);
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
          if (sourceFiles !== undefined) {
            // Record successful writes for any `ts.SourceFile` (that's not a declaration file)
            // that's an input to this write.
            for (const writtenSf of sourceFiles) {
              if (writtenSf.isDeclarationFile) {
                continue;
              }

              this.incrementalDriver.recordSuccessfulEmit(writtenSf);
            }
          }
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

    const afterDeclarationsTransforms: ts.TransformerFactory<ts.Bundle|ts.SourceFile>[] = [];
    if (this.dtsTransforms !== null) {
      afterDeclarationsTransforms.push(
          declarationTransformFactory(this.dtsTransforms, this.importRewriter));
    }

    // Only add aliasing re-exports to the .d.ts output if the `AliasingHost` requests it.
    if (this.aliasingHost !== null && this.aliasingHost.aliasExportsInDts) {
      afterDeclarationsTransforms.push(aliasTransformFactory(compilation.exportStatements));
    }

    if (this.factoryTracker !== null) {
      beforeTransforms.push(
          generatedFactoryTransform(this.factoryTracker.sourceInfo, this.importRewriter));
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

      if (this.incrementalDriver.safeToSkipEmit(targetSourceFile)) {
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

  private getTemplateDiagnostics(): ReadonlyArray<ts.Diagnostic> {
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
      const strictTemplates = !!this.options.strictTemplates;
      typeCheckingConfig = {
        applyTemplateContextGuards: strictTemplates,
        checkQueries: false,
        checkTemplateBodies: true,
        checkTypeOfInputBindings: strictTemplates,
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
      };
    } else {
      typeCheckingConfig = {
        applyTemplateContextGuards: false,
        checkQueries: false,
        checkTemplateBodies: false,
        checkTypeOfInputBindings: false,
        strictNullInputBindings: false,
        checkTypeOfAttributes: false,
        checkTypeOfDomBindings: false,
        checkTypeOfOutputEvents: false,
        checkTypeOfAnimationEvents: false,
        checkTypeOfDomEvents: false,
        checkTypeOfDomReferences: false,
        checkTypeOfNonDomReferences: false,
        checkTypeOfPipes: false,
        strictSafeNavigationTypes: false,
      };
    }

    // Apply explicitly configured strictness flags on top of the default configuration
    // based on "fullTemplateTypeCheck".
    if (this.options.strictInputTypes !== undefined) {
      typeCheckingConfig.checkTypeOfInputBindings = this.options.strictInputTypes;
      typeCheckingConfig.applyTemplateContextGuards = this.options.strictInputTypes;
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

  private makeCompilation(): TraitCompiler {
    const checker = this.tsProgram.getTypeChecker();

    // Construct the ReferenceEmitter.
    if (this.fileToModuleHost === null || !this.options._useHostForImportGeneration) {
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
        localImportStrategy =
            new LogicalProjectStrategy(this.reflector, new LogicalFileSystem(this.rootDirs));
      } else {
        // Plain relative imports are all that's needed.
        localImportStrategy = new RelativePathStrategy(this.reflector);
      }

      // The CompilerHost doesn't have fileNameToModuleName, so build an NPM-centric reference
      // resolution strategy.
      this.refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Next, attempt to use an absolute import.
        new AbsoluteModuleStrategy(this.tsProgram, checker, this.moduleResolver, this.reflector),
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
        this.aliasingHost = new PrivateExportAliasingHost(this.reflector);
      }
    } else {
      // The CompilerHost supports fileNameToModuleName, so use that to emit imports.
      this.refEmitter = new ReferenceEmitter([
        // First, try to use local identifiers if available.
        new LocalIdentifierStrategy(),
        // Then use aliased references (this is a workaround to StrictDeps checks).
        new AliasStrategy(),
        // Then use fileNameToModuleName to emit imports.
        new FileToModuleStrategy(this.reflector, this.fileToModuleHost),
      ]);
      this.aliasingHost = new FileToModuleAliasingHost(this.fileToModuleHost);
    }

    const evaluator =
        new PartialEvaluator(this.reflector, checker, this.incrementalDriver.depGraph);
    const dtsReader = new DtsMetadataReader(checker, this.reflector);
    const localMetaRegistry = new LocalMetadataRegistry();
    const localMetaReader: MetadataReader = localMetaRegistry;
    const depScopeReader = new MetadataDtsModuleScopeResolver(dtsReader, this.aliasingHost);
    this.scopeRegistry = new LocalModuleScopeRegistry(
        localMetaReader, depScopeReader, this.refEmitter, this.aliasingHost);
    const scopeReader: ComponentScopeReader = this.scopeRegistry;
    const metaRegistry = new CompoundMetadataRegistry([localMetaRegistry, this.scopeRegistry]);
    const injectableRegistry = new InjectableClassRegistry();

    this.metaReader = new CompoundMetadataReader([localMetaReader, dtsReader]);


    // If a flat module entrypoint was specified, then track references via a `ReferenceGraph` in
    // order to produce proper diagnostics for incorrectly exported directives/pipes/etc. If there
    // is no flat module entrypoint then don't pay the cost of tracking references.
    let referencesRegistry: ReferencesRegistry;
    if (this.entryPoint !== null) {
      this.exportReferenceGraph = new ReferenceGraph();
      referencesRegistry = new ReferenceGraphAdapter(this.exportReferenceGraph);
    } else {
      referencesRegistry = new NoopReferencesRegistry();
    }

    this.routeAnalyzer = new NgModuleRouteAnalyzer(this.moduleResolver, evaluator);

    this.dtsTransforms = new DtsTransformRegistry();

    this.mwpScanner = new ModuleWithProvidersScanner(this.reflector, evaluator, this.refEmitter);

    // Set up the IvyCompilation, which manages state for the Ivy transformer.
    const handlers: DecoratorHandler<unknown, unknown, unknown>[] = [
      new ComponentDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.metaReader !, scopeReader,
          this.scopeRegistry, this.isCore, this.resourceManager, this.rootDirs,
          this.options.preserveWhitespaces || false, this.options.i18nUseExternalIds !== false,
          this.options.enableI18nLegacyMessageIdFormat !== false, this.moduleResolver,
          this.cycleAnalyzer, this.refEmitter, this.defaultImportTracker,
          this.incrementalDriver.depGraph, injectableRegistry, this.closureCompilerEnabled),
      // TODO(alxhub): understand why the cast here is necessary (something to do with `null` not
      // being assignable to `unknown` when wrapped in `Readonly`).
      // clang-format off
      new DirectiveDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.scopeRegistry, this.defaultImportTracker, injectableRegistry,
          this.isCore, this.closureCompilerEnabled) as Readonly<DecoratorHandler<unknown, unknown, unknown>>,
      // clang-format on
      // Pipe handler must be before injectable handler in list so pipe factories are printed
      // before injectable factories (so injectable factories can delegate to them)
      new PipeDecoratorHandler(
          this.reflector, evaluator, metaRegistry, this.scopeRegistry, this.defaultImportTracker,
          injectableRegistry, this.isCore),
      new InjectableDecoratorHandler(
          this.reflector, this.defaultImportTracker, this.isCore,
          this.options.strictInjectionParameters || false, injectableRegistry),
      new NgModuleDecoratorHandler(
          this.reflector, evaluator, this.metaReader, metaRegistry, this.scopeRegistry,
          referencesRegistry, this.isCore, this.routeAnalyzer, this.refEmitter, this.factoryTracker,
          this.defaultImportTracker, this.closureCompilerEnabled, injectableRegistry,
          this.options.i18nInLocale),
    ];

    return new TraitCompiler(
        handlers, this.reflector, this.perfRecorder, this.incrementalDriver,
        this.options.compileNonExportedClasses !== false, this.dtsTransforms);
  }

  /**
   * Reifies the inter-dependencies of NgModules and the components within their compilation scopes
   * into the `IncrementalDriver`'s dependency graph.
   */
  private recordNgModuleScopeDependencies() {
    const recordSpan = this.perfRecorder.start('recordDependencies');
    const depGraph = this.incrementalDriver.depGraph;

    for (const scope of this.scopeRegistry !.getCompilationScopes()) {
      const file = scope.declaration.getSourceFile();
      const ngModuleFile = scope.ngModule.getSourceFile();

      // A change to any dependency of the declaration causes the declaration to be invalidated,
      // which requires the NgModule to be invalidated as well.
      depGraph.addTransitiveDependency(ngModuleFile, file);

      // A change to the NgModule file should cause the declaration itself to be invalidated.
      depGraph.addDependency(file, ngModuleFile);

      const meta = this.metaReader !.getDirectiveMetadata(new Reference(scope.declaration));
      if (meta !== null && meta.isComponent) {
        // If a component's template changes, it might have affected the import graph, and thus the
        // remote scoping feature which is activated in the event of potential import cycles. Thus,
        // the module depends not only on the transitive dependencies of the component, but on its
        // resources as well.
        depGraph.addTransitiveResources(ngModuleFile, file);

        // A change to any directive/pipe in the compilation scope should cause the component to be
        // invalidated.
        for (const directive of scope.directives) {
          // When a directive in scope is updated, the component needs to be recompiled as e.g. a
          // selector may have changed.
          depGraph.addTransitiveDependency(file, directive.ref.node.getSourceFile());
        }
        for (const pipe of scope.pipes) {
          // When a pipe in scope is updated, the component needs to be recompiled as e.g. the
          // pipe's name may have changed.
          depGraph.addTransitiveDependency(file, pipe.ref.node.getSourceFile());
        }
      }
    }
    this.perfRecorder.stop(recordSpan);
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
