/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BoundTarget,
  LEGACY_OPTIONAL_CHAINING_DEFAULT,
  MatchSource,
  ParseTemplateOptions,
  TcbDirectiveMetadata,
} from '@angular/compiler';
import {makeClassKey} from './compiler-utils.js';
import {verifyExtendedDiagnosticsOptions} from './compiler_options.js';
import {DependencyTemplates, ngContentSignature} from './dependency_templates.js';
import {flattenNgDiagnosticMessage, withErrorGuide} from './diagnostic.js';
import {ChunkContext, FileAnalysis, getOrCreateFileAnalysis} from './file_analysis.js';
import {IndexedComponent} from './indexer_api.js';
import {IncrementalEmitTracker} from './incremental.js';
import {getIndexedComponents, getIndexedComponentsSync} from './indexing/indexer.js';
import {fingerprintOf, ProcessedFileCache} from './processed_file_cache.js';
import {buildTcbTargets, processFile, processFileSync, type ProcessedFile} from './processor.js';
import {
  buildTypeCheckingConfig,
  combineTcbContent,
  generateTcbCode,
  prepareTcbTargets,
  type NgpTypeCheckingConfig,
} from './tcb.js';
import * as nga from './types.js';

export function getDiagnosticPath(tsconfigPath: string): string {
  if (tsconfigPath.endsWith('.json')) {
    return tsconfigPath.slice(0, -5) + '.ngdiag.json';
  }
  return tsconfigPath + '.ngdiag.json';
}

/**
 * Serialize diagnostics to the `.ngdiag.json` payload. `diagnostics` is the output of
 * `HybridCompiler.getDiagnostics()`, which already leaves out diagnostics anchored on a `.d.ts`
 * file and orders the rest deterministically.
 *
 * Compiler option diagnostics (`verifyCompilerOptions`) are serialized separately under
 * `optionDiagnostics` so downstream consumers reading `diagnostics` for per-file reporting
 * do not mix option diagnostics into file diagnostics.
 */
export function serializeDiagnostics(
  tsconfigPath: string,
  diagnostics: readonly nga.NgDiagnostic[],
  optionDiagnostics: readonly nga.NgDiagnostic[] = [],
): string {
  return (
    JSON.stringify(
      {
        tsconfigPath,
        ...(optionDiagnostics.length > 0
          ? {optionDiagnostics: optionDiagnostics.map(formatSerializedDiagnostic)}
          : {}),
        diagnostics: diagnostics.map(formatSerializedDiagnostic),
      },
      null,
      2,
    ) + '\n'
  );
}

/**
 * Whether `diag` is reported against a `.d.ts` file. `analyzedPath` (the `diagnosticsMap` key)
 * is the file a diagnostic without its own `filePath` belongs to.
 *
 * The analyzer anchors some diagnostics on a declaration in a dependency, e.g. `NG1010` for an
 * `@NgModule` that imports a non-class from a `.d.ts` is reported on that declaration, like
 * ngtsc's `createValueHasWrongTypeError(entry.node, ...)`. ngtsc keeps such diagnostics in
 * `NgCompiler.getDiagnostics()`, but a build that asks for the diagnostics of each source file
 * of the compilation unit (`getDiagnosticsForFile`) never sees them, and that is what the
 * `.ngdiag.json` consumers do. `diagnosticsMap` keeps them so that
 * `getDiagnostics({includeDeclarationFiles: true})` consumers still can.
 */
function targetsDeclarationFile(diag: nga.NgDiagnostic, analyzedPath: string): boolean {
  return (diag.filePath ?? analyzedPath).endsWith('.d.ts');
}

function isAbsolutePosixOrWindowsPath(p: string): boolean {
  return p.startsWith('/') || /^[a-zA-Z]:\//.test(p);
}

/**
 * Whether `filePath` is a TypeScript/JavaScript source or a JSON file (e.g. a tsconfig), as
 * opposed to a template or stylesheet a component may read.
 */
function isSourceOrConfigFile(filePath: string): boolean {
  return /\.(?:[cm]?[jt]sx?|json)$/i.test(filePath);
}

export interface IAnalyzer {
  analyze(): AsyncIterable<nga.CompilationChunk>;
  analyzeOptimized(): AsyncIterable<nga.CompilationChunk>;
  analyzeDelta(): AsyncIterable<nga.CompilationChunk>;
  analyzeOptimizedDelta(): AsyncIterable<nga.CompilationChunk>;
  getMetadataForFile(filePath: string): Promise<nga.AnalysisResult | null>;
  /** Applies updates and returns every path whose cached analysis is now stale. */
  updateFileContent(updates: {filePath: string; content: string}[]): Promise<string[]>;
  /** Like `updateFileContent`, for changed or deleted files. */
  invalidateFiles(updates: nga.FileInvalidation[]): Promise<string[]>;
  /**
   * Replaces the compilation roots (absolute paths) and returns every path whose cached analysis
   * is now stale. From then on the roots are no longer re-read from the tsconfig.
   */
  setEntryPoints(entryPoints: string[]): Promise<string[]>;
  getTsFileForTemplate(templatePath: string): Promise<nga.TemplateUsage[] | null>;
  getFileContent(filePath: string): Promise<string>;
  /**
   * Resolves `url` from `containingFile` exactly as the analyzer resolves a component's
   * `templateUrl`/`styleUrls` (`rootDirs`, virtual overlay, preprocessor-extension fallback)
   * and reads it. `null` when the URL cannot be resolved at all; a result without `content`
   * when it resolved to a file that cannot be read.
   */
  readResource(containingFile: string, url: string): Promise<nga.ResolvedResource | null>;
  /**
   * The paths the analyzer reports `paths` as in its results (canonicalized, symlinks resolved),
   * so callers can relate host-reported paths to results without path arithmetic of their own.
   * Engines without it report paths as given.
   */
  canonicalPaths?(paths: string[]): Promise<string[]>;

  // Synchronous lookups (supported in NAPI and WASM modes, throws in Sidecar mode)
  analyzeSync?(): Iterable<nga.CompilationChunk>;
  analyzeOptimizedSync?(): Iterable<nga.CompilationChunk>;
  analyzeDeltaSync?(): Iterable<nga.CompilationChunk>;
  analyzeOptimizedDeltaSync?(): Iterable<nga.CompilationChunk>;
  updateFileContentSync?(updates: {filePath: string; content: string}[]): string[];
  invalidateFilesSync?(updates: nga.FileInvalidation[]): string[];
  getMetadataForFileSync(filePath: string): nga.AnalysisResult | null;
  getFileContentSync(filePath: string): string;
  getTsFileForTemplateSync(templatePath: string): nga.TemplateUsage[] | null;
  readResourceSync?(containingFile: string, url: string): nga.ResolvedResource | null;
  canonicalPathsSync?(paths: string[]): string[];
  close(): void;
}
export interface HybridCompilerOptions {
  optimize?: boolean;
  tcbConfig?: NgpTypeCheckingConfig;
  optionDiagnostics?: nga.NgDiagnostic[];
  templateParseOptions?: Partial<ParseTemplateOptions>;
  legacyOptionalChaining?: boolean;
  isClosureCompilerEnabled?: boolean;
  emitDeclarationOnly?: boolean;
  externalRuntimeStyles?: boolean;
  onlyExplicitDeferDependencyImports?: boolean;
  enableTemplateSourceLocations?: boolean;
  onlyPublishPublicTypingsForNgModules?: boolean;
  forbidOrphanComponents?: boolean;
  /**
   * Only validated against `forbidOrphanComponents`.
   * TODO(parity): ngtsc omits `ɵɵsetNgModuleScope` when this is `false`; we always emit it.
   */
  supportJitMode?: boolean;
  /** Default for components that don't set `preserveWhitespaces`. */
  preserveWhitespaces?: boolean;
  /** When `false`, `ɵsetClassMetadata` is omitted. */
  supportTestBed?: boolean;
  enableI18nLegacyMessageIdFormat?: boolean;
  i18nUseExternalIds?: boolean;
  /** Literal inline templates always normalize, whatever this is set to. */
  i18nNormalizeLineEndingsInICUs?: boolean;
  /** Legacy i18n whitespace preservation fallback for `preserveWhitespaces`. */
  i18nPreserveWhitespaceForLegacyExtraction?: boolean;
  /**
   * Whether HMR is enabled (`_enableHmr`): emits an HMR initializer after every component and
   * enables `emitHmrUpdateModule`. The analyzer must run with `enableHmr` as well.
   */
  enableHmr?: boolean;
  /**
   * Absolute project root used to compute the relative `filePath` emitted in `ɵsetClassDebugInfo`
   * and HMR component IDs.
   */
  rootDir?: string;
  /** If true, runs in compliance mode (emits trailing setClassMetadata to match Angular compiler goldens). */
  complianceMode?: boolean;
  workspaceName?: string;
  /**
   * Absolute root directories used to compute the shortest project-relative `filePath` for
   * `ɵsetClassDebugInfo` and HMR component IDs.
   */
  rootDirs?: string[];
  /**
   * Whether incremental compilation (delta analysis, cached TCB/ProcessedFile reuse across builds,
   * and incremental emit filtering) is enabled. Defaults to `true`.
   */
  incremental?: boolean;
  /**
   * Whether a file whose processing inputs are unchanged since it was last processed reuses that
   * output instead of being processed again.
   */
  reuseProcessedFiles?: boolean;
  /**
   * Processes a file even when its output could be reused, and throws if the reused output would
   * have differed.
   */
  verifyReusedProcessedFiles?: boolean;
}

export interface CompileOptions {
  readFile?: (filePath: string) => string | undefined;
  readResource?: ((file: string) => string | undefined) | Map<string, nga.ResolvedResource | null>;
}

/** A diagnostic together with the file it is reported against in `diagnosticsMap`. */
interface DiagnosticContribution {
  target: string;
  diag: nga.NgDiagnostic;
}

export class HybridCompiler {
  readonly analyzer: IAnalyzer;
  /** Bound targets and TCBs per file, keyed by `AnalysisResult.filePath`. */
  readonly fileCache = new Map<string, FileAnalysis>();
  /** Decides which files an incremental build has to re-emit. */
  readonly incremental = new IncrementalEmitTracker();
  readonly incrementalEnabled: boolean;
  /**
   * Persistent map of the latest `ProcessedFile` for every file in the program across incremental
   * builds, updated by `compile()` and `compileSync()`.
   */
  readonly currentProcessedFiles = new Map<string, ProcessedFile>();
  /** Errors thrown while processing individual files in the latest `compile()` / `compileSync()`. */
  readonly currentProcessErrors = new Map<string, string>();
  readonly optimize: boolean;
  readonly diagnosticsMap = new Map<string, nga.NgDiagnostic[]>();
  private readonly analysisDiagnosticsBySource = new Map<string, DiagnosticContribution[]>();
  private readonly processedDiagnosticsBySource = new Map<string, DiagnosticContribution[]>();
  readonly optionDiagnostics: nga.NgDiagnostic[] = [];
  tcbConfig: NgpTypeCheckingConfig;
  readonly templateParseOptions: Partial<ParseTemplateOptions>;
  readonly legacyOptionalChaining: boolean;
  readonly isClosureCompilerEnabled: boolean;
  readonly emitDeclarationOnly: boolean;
  readonly externalRuntimeStyles: boolean;
  readonly onlyExplicitDeferDependencyImports: boolean;
  readonly enableTemplateSourceLocations: boolean;
  readonly onlyPublishPublicTypingsForNgModules: boolean;
  readonly forbidOrphanComponents: boolean;
  readonly supportJitMode: boolean;
  readonly supportTestBed: boolean;
  readonly i18nUseExternalIds: boolean;
  readonly enableHmr: boolean;
  readonly rootDir?: string;
  readonly complianceMode: boolean;
  readonly workspaceName?: string;
  readonly rootDirs?: string[];
  private readonly reuseProcessedFiles: boolean;
  private readonly verifyReusedProcessedFiles: boolean;
  private readonly processedFiles = new ProcessedFileCache();
  private readonly pendingVerification = new Map<string, ProcessedFile>();
  private readonly knownResources = new Set<string>();
  private readonly templateStyleUrlsByFile = new Map<string, string[]>();
  private readonly metadataByFile = new Map<string, nga.AnalysisResult>();
  private readonly lastChunkByFile = new Map<string, nga.CompilationChunk>();
  private readonly componentTemplateConsumers = new Map<string, Set<string>>();
  private readonly ngContentSignatureByFile = new Map<string, string>();
  private readonly jsDirtyFiles = new Set<string>();
  private readonly pendingDeltaChunks: nga.CompilationChunk[] = [];
  private readonly serializedObjects = new WeakMap<object, string>();
  private readonly ngContentSignatures = new WeakMap<nga.ComponentMetadata, string>();
  private hasCompiled = false;
  private pendingCompilation: Promise<void> = Promise.resolve();

  constructor(analyzer: IAnalyzer, options: HybridCompilerOptions = {}) {
    this.optimize = options.optimize ?? true;
    this.templateParseOptions = {
      preserveWhitespaces: options.preserveWhitespaces ?? false,
      preserveSignificantWhitespace: options.i18nPreserveWhitespaceForLegacyExtraction ?? true,
      enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat !== false,
      i18nNormalizeLineEndingsInICUs: options.i18nNormalizeLineEndingsInICUs === true,
      ...options.templateParseOptions,
    };
    this.supportJitMode = options.supportJitMode !== false;
    this.supportTestBed = options.supportTestBed !== false;
    this.i18nUseExternalIds = options.i18nUseExternalIds !== false;
    this.enableHmr = options.enableHmr === true;
    this.analyzer = analyzer;
    this.tcbConfig = options.tcbConfig ?? buildTypeCheckingConfig({});
    this.legacyOptionalChaining =
      options.legacyOptionalChaining ?? LEGACY_OPTIONAL_CHAINING_DEFAULT;
    this.isClosureCompilerEnabled = options.isClosureCompilerEnabled ?? false;
    this.emitDeclarationOnly = options.emitDeclarationOnly ?? false;
    this.externalRuntimeStyles = options.externalRuntimeStyles ?? false;
    this.onlyExplicitDeferDependencyImports = options.onlyExplicitDeferDependencyImports ?? false;
    this.enableTemplateSourceLocations = options.enableTemplateSourceLocations ?? false;
    this.onlyPublishPublicTypingsForNgModules =
      options.onlyPublishPublicTypingsForNgModules ?? false;
    this.forbidOrphanComponents = options.forbidOrphanComponents ?? false;
    if (options.supportJitMode === false && this.forbidOrphanComponents) {
      throw new Error(
        'JIT mode support ("supportJitMode" option) cannot be disabled when forbidOrphanComponents is set to true',
      );
    }
    const configErrors =
      options.optionDiagnostics ??
      (this.tcbConfig.extendedDiagnostics
        ? verifyExtendedDiagnosticsOptions({
            strictTemplates: this.tcbConfig.checkTemplateBodies,
            extendedDiagnostics: this.tcbConfig.extendedDiagnostics,
          })
        : []);
    this.optionDiagnostics = [...configErrors];
    // Mirrors `NgCompiler`, which doesn't construct the extended template checker, the template
    // semantics checker or the source file validator when it has construction diagnostics. Note
    // that `controlFlowPreventingContentProjection` is intentionally left alone: ngtsc reports
    // it from the type check block regardless of option diagnostics.
    if (this.optionDiagnostics.length > 0) {
      this.tcbConfig = {...this.tcbConfig, disabledExtendedDiagnostics: true};
    }
    if (options.rootDir !== undefined) {
      const norm = options.rootDir.replace(/\\/g, '/');
      if (!isAbsolutePosixOrWindowsPath(norm)) {
        throw new Error(`'${options.rootDir}' in 'rootDir' must be an absolute path`);
      }
      this.rootDir = norm;
    }
    this.complianceMode = options.complianceMode ?? false;
    this.incrementalEnabled = options.incremental ?? true;
    this.reuseProcessedFiles = this.incrementalEnabled && (options.reuseProcessedFiles ?? true);
    this.verifyReusedProcessedFiles = options.verifyReusedProcessedFiles ?? false;
    this.workspaceName = options.workspaceName;
    if (options.rootDirs) {
      this.rootDirs = options.rootDirs.map((d) => {
        const norm = d.replace(/\\/g, '/');
        if (!isAbsolutePosixOrWindowsPath(norm)) {
          throw new Error(`'${d}' in 'rootDirs' must be an absolute path`);
        }
        return norm;
      });
    } else {
      this.rootDirs = undefined;
    }
  }

  /**
   * Returns the collected per-file diagnostics. `diagnosticsMap` is keyed by completion order of
   * the parallel analysis chunks, which varies from run to run (and across transports), so the
   * result is sorted (file path, then span start) to keep consumers such as the `.ngdiag.json`
   * deterministic; the sort is stable, so a file's diagnostics sharing a span keep their
   * reporting order.
   *
   * Diagnostics anchored on `.d.ts` files are excluded unless `includeDeclarationFiles` is
   * `true` (see `targetsDeclarationFile`).
   *
   * Compiler option diagnostics (`this.optionDiagnostics`) are kept separate so per-file
   * diagnostic consumers do not mix option diagnostics into file diagnostics.
   */
  getDiagnostics(options?: {includeDeclarationFiles?: boolean}): nga.NgDiagnostic[] {
    const includeDeclarationFiles = options?.includeDeclarationFiles ?? false;
    const allDiagnostics: Array<nga.NgDiagnostic> = [];
    for (const [analyzedPath, diags] of this.diagnosticsMap) {
      for (const diag of diags) {
        if (includeDeclarationFiles || !targetsDeclarationFile(diag, analyzedPath)) {
          allDiagnostics.push(diag);
        }
      }
    }
    allDiagnostics.sort(
      (a, b) =>
        (a.filePath ?? '').localeCompare(b.filePath ?? '') ||
        (a.span?.start ?? -1) - (b.span?.start ?? -1),
    );
    return allDiagnostics;
  }

  async prepareChunk(chunk: nga.CompilationChunk): Promise<ChunkContext> {
    this.recordChunkDiagnostics(chunk);
    if (!this.incrementalEnabled) {
      for (const file of chunk.files) {
        this.fileCache.delete(file.filePath);
      }
    }

    const metadataMap = chunkMetadataMap(chunk);
    const boundFiles = await Promise.all(
      chunk.files.map(async (file) => ({
        file,
        analysis: await this.ensureBoundWithMetadata(file, undefined, metadataMap),
      })),
    );
    return this.finalizePreparedChunk(chunk, boundFiles, metadataMap);
  }

  prepareChunkSync(chunk: nga.CompilationChunk): ChunkContext {
    this.recordChunkDiagnostics(chunk);
    if (!this.incrementalEnabled) {
      for (const file of chunk.files) {
        this.fileCache.delete(file.filePath);
      }
    }

    const metadataMap = chunkMetadataMap(chunk);
    const boundFiles = chunk.files.map((file) => ({
      file,
      analysis: this.ensureBoundWithMetadataSync(file, undefined, metadataMap),
    }));
    return this.finalizePreparedChunk(chunk, boundFiles, metadataMap);
  }

  private recordChunkDiagnostics(chunk: nga.CompilationChunk): void {
    if (chunk.removedFiles && chunk.removedFiles.length > 0) {
      for (const removed of chunk.removedFiles) {
        this.evictRemovedFile(removed);
      }
      if (this.incrementalEnabled) {
        this.incremental.recordChanges([], chunk.removedFiles);
      }
    }
    // `NgCompiler` skips the `SourceFileValidator` when it has construction diagnostics.
    const skipSourceFileValidator = this.optionDiagnostics.length > 0;
    for (const file of chunk.files) {
      this.recordMetadata(file);
      this.lastChunkByFile.set(file.filePath, chunk);
      const diagnostics: nga.NgDiagnostic[] = [];
      if (file.diagnostics) {
        diagnostics.push(...file.diagnostics.map(withErrorGuide));
      }
      if (!skipSourceFileValidator && file.sourceFileValidatorDiagnostics) {
        diagnostics.push(...file.sourceFileValidatorDiagnostics.map(withErrorGuide));
      }
      this.replaceDiagnostics(
        this.analysisDiagnosticsBySource,
        file.filePath,
        diagnostics.map((diag) => ({target: file.filePath, diag})),
      );
    }
  }

  /**
   * Replaces the diagnostics `source` contributed through `contributions` with `next`, leaving
   * every other file's diagnostics, and their order, untouched. Each file reports diagnostics at
   * two points (analysis, then processing) and a processed diagnostic may target another file
   * (e.g. an external template), so a re-run has to remove exactly what that run reported before.
   */
  private replaceDiagnostics(
    contributions: Map<string, DiagnosticContribution[]>,
    source: string,
    next: DiagnosticContribution[],
  ): void {
    for (const {target, diag} of contributions.get(source) ?? []) {
      const existing = this.diagnosticsMap.get(target);
      if (existing === undefined) {
        continue;
      }
      const remaining = existing.filter((d) => d !== diag);
      if (remaining.length > 0) {
        this.diagnosticsMap.set(target, remaining);
      } else {
        this.diagnosticsMap.delete(target);
      }
    }
    if (next.length === 0) {
      contributions.delete(source);
      return;
    }
    contributions.set(source, next);
    for (const {target, diag} of next) {
      const existing = this.diagnosticsMap.get(target);
      if (existing === undefined) {
        this.diagnosticsMap.set(target, [diag]);
      } else {
        existing.push(diag);
      }
    }
  }

  /** Drops every diagnostic `filePath` reported, e.g. once it has left the program. */
  private forgetDiagnosticsOf(filePath: string): void {
    this.replaceDiagnostics(this.analysisDiagnosticsBySource, filePath, []);
    this.replaceDiagnostics(this.processedDiagnosticsBySource, filePath, []);
  }

  /** Evicts all cached state for a file that was deleted or left the program closure. */
  private evictRemovedFile(filePath: string): void {
    this.forgetDiagnosticsOf(filePath);
    this.fileCache.delete(filePath);
    this.metadataByFile.delete(filePath);
    this.lastChunkByFile.delete(filePath);
    this.processedFiles.delete(filePath);
    this.currentProcessedFiles.delete(filePath);
    this.currentProcessErrors.delete(filePath);
    this.templateStyleUrlsByFile.delete(filePath);
    this.ngContentSignatureByFile.delete(filePath);
    this.jsDirtyFiles.delete(filePath);
    this.componentTemplateConsumers.delete(filePath);
    for (const consumers of this.componentTemplateConsumers.values()) {
      consumers.delete(filePath);
    }
  }

  private recordMetadata(result: nga.AnalysisResult): void {
    if (this.metadataByFile.get(result.filePath) === result) {
      return;
    }
    this.metadataByFile.set(result.filePath, result);
    this.recordComponentTemplateConsumers(result.filePath, result);
  }

  private invalidateCachedFile(filePath: string): void {
    this.fileCache.delete(filePath);
    this.metadataByFile.delete(filePath);
  }

  private recordComponentTemplateConsumers(filePath: string, result: nga.AnalysisResult): void {
    for (const consumers of this.componentTemplateConsumers.values()) {
      consumers.delete(filePath);
    }
    const ngContentParts: string[] = [];
    for (const cls of result.classes) {
      const component = cls.component;
      if (!component) {
        continue;
      }
      if (cls.className) {
        ngContentParts.push(`${cls.className}:${this.ngContentSignatureOf(component)}`);
      }
      if (component.templateUrl) {
        this.knownResources.add(component.templateUrl.resolvedPath);
      }
      for (const styleUrl of component.styleUrls ?? []) {
        this.knownResources.add(styleUrl.resolvedPath);
      }
      const declarations = [
        ...(component.resolvedDeclarations ?? []),
        ...(component.resolvedDeferredDeclarations ?? []),
        ...Object.values(component.resolvedDeferredDeclarationsByBlock ?? {}).flat(),
      ];
      for (const decl of declarations) {
        if (
          decl.declarationType !== 'component' ||
          decl.ngContentSelectors != null ||
          !decl.filePath ||
          decl.filePath === filePath
        ) {
          continue;
        }
        let consumers = this.componentTemplateConsumers.get(decl.filePath);
        if (!consumers) {
          consumers = new Set<string>();
          this.componentTemplateConsumers.set(decl.filePath, consumers);
        }
        consumers.add(filePath);
      }
    }
    const nextSignature = ngContentParts.join(';');
    const prevSignature = this.ngContentSignatureByFile.get(filePath);
    this.ngContentSignatureByFile.set(filePath, nextSignature);
    if (prevSignature !== undefined && prevSignature !== nextSignature) {
      for (const consumer of this.componentTemplateConsumers.get(filePath) ?? []) {
        this.jsDirtyFiles.add(consumer);
      }
    }
  }

  private finalizePreparedChunk(
    chunk: nga.CompilationChunk,
    boundFiles: Array<{file: nga.AnalysisResult; analysis: FileAnalysis}>,
    metadataMap: Map<string, nga.AnalysisResult>,
  ): ChunkContext {
    const remoteScopedClasses = new Set<string>();
    const eagerlyUsedDeclarations = new Map<string, nga.DeclarationMetadata[]>();

    // Identify template dependencies of components in the chunk and check cycleProne.
    const chunkFileIds = new Set(chunk.files.map((f) => f.fileId));
    const dynamicGraph = new Map<number, Set<number>>();

    // Pre-seed graph with intra-chunk static TypeScript import edges from Rust
    if (chunk.staticEdges) {
      for (const [fromIdStr, targets] of Object.entries(chunk.staticEdges)) {
        const fromId = Number(fromIdStr);
        let edges = dynamicGraph.get(fromId);
        if (!edges) {
          edges = new Set<number>();
          dynamicGraph.set(fromId, edges);
        }
        for (const target of targets) {
          if (chunkFileIds.has(target) && target !== fromId) {
            edges.add(target);
          }
        }
      }
    }

    for (const {file, analysis} of boundFiles) {
      if (!analysis) continue;

      for (const classMeta of file.classes) {
        if (!classMeta.component || !classMeta.className) continue;
        const className = classMeta.className;

        const classKey = makeClassKey(className, classMeta.span.start);
        const boundTarget = analysis.preparedTcbData?.boundTargetMap.get(classKey);
        if (!boundTarget) continue;

        // Remote scoping replaces the component's own dependency list, so it carries the
        // eager set only — deferred dependencies keep their dynamic imports and do not create static cycles.
        const eagerDirs = new Set(
          boundTarget
            .getEagerlyUsedDirectives()
            .filter((d) => d.matchSource === MatchSource.Selector)
            .map((d) => d.name),
        );
        const eagerPipes = new Set(boundTarget.getEagerlyUsedPipes());
        const resolvedDecls = classMeta.component.resolvedDeclarations || [];
        const pipeNameToDecl = new Map<string, nga.DeclarationMetadata>();
        for (const decl of resolvedDecls) {
          if (decl.declarationType === 'pipe' && decl.pipeName) {
            pipeNameToDecl.set(decl.pipeName, decl);
          }
        }
        const eagerDirDecls = resolvedDecls.filter(
          (d) =>
            d.declarationType !== 'pipe' &&
            d.declarationType !== 'ngmodule' &&
            eagerDirs.has(d.name),
        );
        const eagerPipeDecls = Array.from(pipeNameToDecl.values()).filter(
          (d) => !!d.pipeName && eagerPipes.has(d.pipeName),
        );
        const eagerDecls = [...eagerDirDecls, ...eagerPipeDecls];
        eagerlyUsedDeclarations.set(`${file.filePath}#${className}`, eagerDecls);

        if (classMeta.component.standalone && !classMeta.component.declaringNgModule) {
          continue;
        }

        // Check if any eagerly used dependency is statically cycleProne
        let hasStaticCycle = false;
        for (const decl of eagerDecls) {
          if (decl.cycleProne) {
            hasStaticCycle = true;
            break;
          }
        }

        if (hasStaticCycle) {
          remoteScopedClasses.add(`${file.filePath}#${className}`);
          continue;
        }

        let createsCycle = false;
        for (const decl of eagerDecls) {
          if (
            chunkFileIds.has(decl.fileId) &&
            decl.fileId !== file.fileId &&
            hasGraphPath(dynamicGraph, decl.fileId, file.fileId)
          ) {
            createsCycle = true;
            break;
          }
        }

        if (createsCycle) {
          remoteScopedClasses.add(`${file.filePath}#${className}`);
          continue;
        }

        // Add eager dependencies to local dynamic graph only when not remote-scoped
        let edges = dynamicGraph.get(file.fileId);
        if (!edges) {
          edges = new Set<number>();
          dynamicGraph.set(file.fileId, edges);
        }
        for (const decl of eagerDecls) {
          if (chunkFileIds.has(decl.fileId) && decl.fileId !== file.fileId) {
            edges.add(decl.fileId);
          }
        }
      }
    }

    return {remoteScopedClasses, metadataMap, eagerlyUsedDeclarations};
  }

  async init() {
    const iterator = this.optimize ? this.analyzer.analyzeOptimized() : this.analyzer.analyze();
    for await (const _ of iterator) {
    }
  }

  /**
   * Resolves once every update queued so far has been applied, or has failed.
   *
   * This is a barrier for readers (the language service awaits it before each request), not a
   * report of how the updates went: a failed update's error goes to that update's caller, and
   * rethrowing it here would fail every later request for an error the requester can't act on.
   */
  async ensureReady(): Promise<void> {
    await this.pendingCompilation;
  }

  async updateFileContent(updates: {filePath: string; content: string}[]): Promise<void> {
    if (updates.length === 0) {
      return;
    }
    await this.enqueueUpdate(async () => {
      await this.recordInvalidations(
        updates.map(({filePath}) => ({filePath, updateType: nga.FileUpdateType.Changed})),
      );
      return this.analyzer.updateFileContent(updates);
    });
  }

  async invalidateFiles(updates: nga.FileInvalidation[]): Promise<void> {
    if (updates.length === 0) {
      return;
    }
    await this.enqueueUpdate(async () => {
      await this.recordInvalidations(updates);
      return this.analyzer.invalidateFiles(updates);
    });
  }

  /**
   * Synchronous counterpart of `updateFileContent` for callers that drive each build
   * synchronously, such as the ngtsc test driver. The caller runs the delta pass that follows
   * (`analyzeDeltaSync` or `analyzeOptimizedDeltaSync`) and must not mix this with the
   * asynchronous update queue.
   */
  updateFileContentSync(updates: {filePath: string; content: string}[]): void {
    if (updates.length === 0) {
      return;
    }
    if (!this.analyzer.updateFileContentSync) {
      throw new Error('Analyzer does not support updateFileContentSync');
    }
    const invalidations = updates.map(({filePath}) => ({
      filePath,
      updateType: nga.FileUpdateType.Changed,
    }));
    this.recordCanonicalInvalidations(
      invalidations,
      this.analyzer.canonicalPathsSync?.(updates.map(({filePath}) => filePath)),
    );
    const invalidated = this.analyzer.updateFileContentSync(updates);
    for (const filePath of invalidated) {
      this.invalidateCachedFile(filePath);
    }
  }

  /** Synchronous counterpart of `invalidateFiles`; see `updateFileContentSync`. */
  invalidateFilesSync(updates: nga.FileInvalidation[]): void {
    if (updates.length === 0) {
      return;
    }
    if (!this.analyzer.invalidateFilesSync) {
      throw new Error('Analyzer does not support invalidateFilesSync');
    }
    this.recordCanonicalInvalidations(
      updates,
      this.analyzer.canonicalPathsSync?.(updates.map(({filePath}) => filePath)),
    );
    const invalidated = this.analyzer.invalidateFilesSync(updates);
    for (const filePath of invalidated) {
      this.invalidateCachedFile(filePath);
    }
  }

  private async recordInvalidations(updates: readonly nga.FileInvalidation[]): Promise<void> {
    const canonical = await this.analyzer.canonicalPaths?.(updates.map(({filePath}) => filePath));
    this.recordCanonicalInvalidations(updates, canonical);
  }

  /**
   * Records host-reported changes for incremental emit and drops what deleted files reported.
   * Both are keyed by the paths results carry, so a change is recorded under `canonicalPaths`,
   * the analyzer's form of each update's path, when the engine provides it: hosts may report a
   * path through a symlink (macOS `/tmp`, Bazel output trees) that results never mention.
   */
  private recordCanonicalInvalidations(
    updates: readonly nga.FileInvalidation[],
    canonicalPaths: readonly string[] | undefined,
  ): void {
    const changed: string[] = [];
    const deleted: string[] = [];
    updates.forEach(({filePath: hostPath, updateType}, i) => {
      const filePath = canonicalPaths?.[i] ?? hostPath;
      // A resource no component is known to use may still be read during processing (e.g. a
      // stylesheet a template links that could not be read before), so every reusable output is
      // dropped. Sources and config files (a `tsconfig.json` edit is how roots change) are never
      // read that way, and are tracked through the analyzer instead. Whether a reprocessed file
      // is then re-emitted is decided by its output (`IncrementalEmitTracker`), so this costs
      // processing time, not spurious emits.
      if (!isSourceOrConfigFile(filePath) && !this.knownResources.has(filePath)) {
        this.processedFiles.clear();
        for (const knownTs of this.lastChunkByFile.keys()) {
          this.jsDirtyFiles.add(knownTs);
        }
      }
      for (const [ownerTs, styleFiles] of this.templateStyleUrlsByFile) {
        if (styleFiles.includes(filePath)) {
          this.processedFiles.delete(ownerTs);
          this.jsDirtyFiles.add(ownerTs);
        }
      }
      this.invalidateCachedFile(filePath);
      if (updateType === nga.FileUpdateType.Deleted) {
        deleted.push(filePath);
        this.evictRemovedFile(filePath);
      } else {
        changed.push(filePath);
      }
    });
    if (this.incrementalEnabled) {
      this.incremental.recordChanges(changed, deleted);
    }
  }

  /**
   * Runs `applyUpdate` and the delta pass that follows it once every earlier update has
   * settled, so the analyzer sees updates one at a time and in call order.
   *
   * The returned promise rejects if this update fails. `pendingCompilation` itself never
   * rejects: a rejected link would skip every later update and make `ensureReady` throw for the
   * rest of the session.
   */
  private enqueueUpdate(applyUpdate: () => Promise<string[]>): Promise<void> {
    const update = this.pendingCompilation.then(() => this.runUpdate(applyUpdate));
    this.pendingCompilation = update.catch(() => {});
    return update;
  }

  private async runUpdate(applyUpdate: () => Promise<string[]>): Promise<void> {
    try {
      const invalidatedTsFiles = await applyUpdate();
      for (const filePath of invalidatedTsFiles) {
        this.invalidateCachedFile(filePath);
      }
      const iterator = this.optimize
        ? this.analyzer.analyzeOptimizedDelta()
        : this.analyzer.analyzeDelta();
      for await (const chunk of iterator) {
        if (chunk.files.length > 0 || (chunk.removedFiles && chunk.removedFiles.length > 0)) {
          for (const file of chunk.files) {
            this.invalidateCachedFile(file.filePath);
          }
          for (const removed of chunk.removedFiles ?? []) {
            this.invalidateCachedFile(removed);
          }
          this.pendingDeltaChunks.push(chunk);
        }
      }
    } catch (error) {
      // A failed update may stop partway through, so there's no telling which cached analyses are
      // stale. Drop them all.
      this.fileCache.clear();
      this.metadataByFile.clear();
      this.pendingDeltaChunks.length = 0;
      throw error;
    }
  }

  analyze(): AsyncIterable<nga.CompilationChunk> {
    return this.fullAsync(this.analyzer.analyze());
  }

  analyzeOptimized(): AsyncIterable<nga.CompilationChunk> {
    return this.fullAsync(this.analyzer.analyzeOptimized());
  }

  analyzeSync(): Iterable<nga.CompilationChunk> {
    if (!this.analyzer.analyzeSync) {
      throw new Error('Analyzer does not support analyzeSync');
    }
    return this.fullSync(this.analyzer.analyzeSync());
  }

  analyzeOptimizedSync(): Iterable<nga.CompilationChunk> {
    if (!this.analyzer.analyzeOptimizedSync) {
      throw new Error('Analyzer does not support analyzeOptimizedSync');
    }
    return this.fullSync(this.analyzer.analyzeOptimizedSync());
  }

  private recordFullChunk(chunk: nga.CompilationChunk): void {
    for (const file of chunk.files) {
      this.recordMetadata(file);
      this.lastChunkByFile.set(file.filePath, chunk);
    }
  }

  private *fullSync(
    chunks: Iterable<nga.CompilationChunk>,
  ): Generator<nga.CompilationChunk, void, unknown> {
    this.jsDirtyFiles.clear();
    this.pendingDeltaChunks.length = 0;
    for (const chunk of chunks) {
      this.recordFullChunk(chunk);
      yield chunk;
    }
  }

  private async *fullAsync(
    chunks: AsyncIterable<nga.CompilationChunk>,
  ): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    this.jsDirtyFiles.clear();
    this.pendingDeltaChunks.length = 0;
    for await (const chunk of chunks) {
      this.recordFullChunk(chunk);
      yield chunk;
    }
  }

  /** Synchronous delta pass after `updateFileContentSync`/`invalidateFilesSync`. */
  analyzeDeltaSync(): Iterable<nga.CompilationChunk> {
    if (!this.analyzer.analyzeDeltaSync) {
      throw new Error('Analyzer does not support analyzeDeltaSync');
    }
    return this.deltaSync(this.analyzer.analyzeDeltaSync());
  }

  /** Synchronous optimized delta pass after `updateFileContentSync`/`invalidateFilesSync`. */
  analyzeOptimizedDeltaSync(): Iterable<nga.CompilationChunk> {
    if (!this.analyzer.analyzeOptimizedDeltaSync) {
      throw new Error('Analyzer does not support analyzeOptimizedDeltaSync');
    }
    return this.deltaSync(this.analyzer.analyzeOptimizedDeltaSync());
  }

  private recordDeltaChunk(chunk: nga.CompilationChunk, yieldedFiles: Set<string>): boolean {
    if (chunk.removedFiles && chunk.removedFiles.length > 0) {
      for (const removed of chunk.removedFiles) {
        this.evictRemovedFile(removed);
      }
      if (this.incrementalEnabled) {
        this.incremental.recordChanges([], chunk.removedFiles);
      }
    }
    for (const file of chunk.files) {
      yieldedFiles.add(file.filePath);
      this.recordMetadata(file);
      this.lastChunkByFile.set(file.filePath, chunk);
    }
    return chunk.files.length > 0 || Boolean(chunk.removedFiles && chunk.removedFiles.length > 0);
  }

  private *drainJsDirtyChunks(yieldedFiles: Set<string>): Generator<nga.CompilationChunk> {
    while (this.jsDirtyFiles.size > 0) {
      const dirtyFile = this.jsDirtyFiles.values().next().value!;
      this.jsDirtyFiles.delete(dirtyFile);
      if (yieldedFiles.has(dirtyFile)) {
        continue;
      }
      const prevChunk = this.lastChunkByFile.get(dirtyFile);
      if (!prevChunk) {
        continue;
      }
      const refreshedFiles = prevChunk.files.map((f) => this.metadataByFile.get(f.filePath) ?? f);
      const refreshedChunk: nga.CompilationChunk = {
        files: refreshedFiles,
        staticEdges: prevChunk.staticEdges,
      };
      for (const f of refreshedFiles) {
        yieldedFiles.add(f.filePath);
        this.lastChunkByFile.set(f.filePath, refreshedChunk);
      }
      yield refreshedChunk;
    }
  }

  private *deltaSync(
    chunks: Iterable<nga.CompilationChunk>,
  ): Generator<nga.CompilationChunk, void, unknown> {
    const yieldedFiles = new Set<string>();
    for (const chunk of this.pendingDeltaChunks.splice(0)) {
      if (this.recordDeltaChunk(chunk, yieldedFiles)) {
        yield chunk;
      }
    }
    for (const chunk of chunks) {
      if (this.recordDeltaChunk(chunk, yieldedFiles)) {
        yield chunk;
      }
    }
    yield* this.drainJsDirtyChunks(yieldedFiles);
  }

  analyzeDelta(): AsyncIterable<nga.CompilationChunk> {
    return this.deltaAsync(this.analyzer.analyzeDelta());
  }

  analyzeOptimizedDelta(): AsyncIterable<nga.CompilationChunk> {
    return this.deltaAsync(this.analyzer.analyzeOptimizedDelta());
  }

  private async *deltaAsync(
    chunks: AsyncIterable<nga.CompilationChunk>,
  ): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    const yieldedFiles = new Set<string>();
    for (const chunk of this.pendingDeltaChunks.splice(0)) {
      if (this.recordDeltaChunk(chunk, yieldedFiles)) {
        yield chunk;
      }
    }
    for await (const chunk of chunks) {
      if (this.recordDeltaChunk(chunk, yieldedFiles)) {
        yield chunk;
      }
    }
    yield* this.drainJsDirtyChunks(yieldedFiles);
  }

  private beginCompilationPass(): {useDelta: boolean; useOptimized: boolean} {
    const useDelta = this.hasCompiled && this.incrementalEnabled;
    if (!useDelta) {
      this.currentProcessedFiles.clear();
      this.currentProcessErrors.clear();
      if (!this.incrementalEnabled) {
        this.fileCache.clear();
        this.metadataByFile.clear();
        this.lastChunkByFile.clear();
        this.processedFiles.clear();
        this.analysisDiagnosticsBySource.clear();
        this.processedDiagnosticsBySource.clear();
        this.diagnosticsMap.clear();
      }
    }
    return {useDelta, useOptimized: this.optimize && !this.emitDeclarationOnly};
  }

  /**
   * Runs an initial or incremental delta compilation pass, preparing and processing only the
   * chunks affected since the previous build (or all chunks on the initial build / when
   * `incremental` is `false`), and returns the full map of current `ProcessedFile`s across the
   * program.
   */
  compileSync(options?: CompileOptions): ReadonlyMap<string, ProcessedFile> {
    const {useDelta, useOptimized} = this.beginCompilationPass();
    const chunks = useDelta
      ? useOptimized
        ? this.analyzeOptimizedDeltaSync()
        : this.analyzeDeltaSync()
      : useOptimized
        ? this.analyzeOptimizedSync()
        : this.analyzeSync();

    for (const chunk of chunks) {
      if (chunk.files.length === 0) {
        this.recordChunkDiagnostics(chunk);
        continue;
      }
      const chunkContext = this.prepareChunkSync(chunk);
      for (const fileResult of chunk.files) {
        const filePath = fileResult.filePath;
        const content = options?.readFile
          ? options.readFile(filePath)
          : (this.fileCache.get(filePath)?.sourceContent ??
            this.analyzer.getFileContentSync(filePath));
        if (content === undefined) {
          this.currentProcessedFiles.delete(filePath);
          continue;
        }
        try {
          const processed = this.processFileSync(
            filePath,
            content,
            options?.readResource,
            fileResult,
            chunkContext,
          );
          this.currentProcessedFiles.set(filePath, processed);
          this.currentProcessErrors.delete(filePath);
        } catch (e: unknown) {
          this.currentProcessedFiles.delete(filePath);
          this.currentProcessErrors.set(filePath, e instanceof Error ? e.message : String(e));
        }
      }
    }
    this.hasCompiled = true;
    return this.currentProcessedFiles;
  }

  /** Asynchronous counterpart of `compileSync`. */
  async compile(options?: CompileOptions): Promise<ReadonlyMap<string, ProcessedFile>> {
    const {useDelta, useOptimized} = this.beginCompilationPass();
    const chunks = useDelta
      ? useOptimized
        ? this.analyzeOptimizedDelta()
        : this.analyzeDelta()
      : useOptimized
        ? this.analyzeOptimized()
        : this.analyze();

    for await (const chunk of chunks) {
      if (chunk.files.length === 0) {
        this.recordChunkDiagnostics(chunk);
        continue;
      }
      const chunkContext = await this.prepareChunk(chunk);
      for (const fileResult of chunk.files) {
        const filePath = fileResult.filePath;
        const content = options?.readFile
          ? options.readFile(filePath)
          : (this.fileCache.get(filePath)?.sourceContent ??
            (await this.analyzer.getFileContent(filePath)));
        if (content === undefined) {
          this.currentProcessedFiles.delete(filePath);
          continue;
        }
        try {
          const processed = await this.processFile(filePath, content, fileResult, chunkContext);
          this.currentProcessedFiles.set(filePath, processed);
          this.currentProcessErrors.delete(filePath);
        } catch (e: unknown) {
          this.currentProcessedFiles.delete(filePath);
          this.currentProcessErrors.set(filePath, e instanceof Error ? e.message : String(e));
        }
      }
    }
    this.hasCompiled = true;
    return this.currentProcessedFiles;
  }

  /**
   * Returns a predicate `(filePath: string) => boolean` for `ts.Program.emit` that decides whether
   * `filePath` must be emitted in the current build. When `incremental` is `false`, every file is
   * emitted.
   */
  createEmitFilter(): (filePath: string) => boolean {
    if (!this.incrementalEnabled) {
      return () => true;
    }
    return this.incremental.createEmitFilter();
  }

  /** Records the source files whose `.js`/`.d.ts` outputs were emitted in the current build. */
  recordSuccessfulEmit(emittedFiles: Iterable<string>): void {
    if (!this.incrementalEnabled) {
      return;
    }
    this.incremental.recordSuccessfulEmit(emittedFiles);
  }

  /** Returns the latest cached `AnalysisResult` for `filePath`, or queries the analyzer if needed. */
  getCachedMetadata(filePath: string): nga.AnalysisResult | null {
    return this.metadataByFile.get(filePath) ?? this.analyzer.getMetadataForFileSync(filePath);
  }

  getTcbForFile(filePath: string): string | null {
    return this.ensureTcb(filePath).tcb || null;
  }

  private hasTcbCandidates(classes: nga.ClassMetadata[]): boolean {
    return classes.some(
      (c) =>
        Boolean(c.className) &&
        ((c.component !== undefined && !c.component.isJit) ||
          (c.directive !== undefined &&
            !c.directive.isJit &&
            this.tcbConfig.typeCheckHostBindings !== false &&
            (c.directive.hostProperties.length > 0 ||
              c.hostBindings.length > 0 ||
              c.hostListeners.length > 0))),
    );
  }

  /**
   * Binds template targets for `filePath` without generating or printing TCB code (sufficient for
   * template indexing, which only needs `BoundTarget`).
   */
  private ensureBoundSync(filePath: string): FileAnalysis {
    const cached = this.fileCache.get(filePath);
    if (cached && cached.preparedTcbData !== undefined && this.metadataByFile.has(filePath)) {
      return cached;
    }
    const result = this.analyzer.getMetadataForFileSync(filePath);
    if (!result) {
      return unanalyzedFile(filePath);
    }
    return this.ensureBoundWithMetadataSync(result);
  }

  private prepareFileAnalysisForBinding(
    result: nga.AnalysisResult,
    content?: string,
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): {
    fileAnalysis: FileAnalysis;
    effectiveContent: string | undefined;
    boundFingerprint: string | undefined;
    reuseExisting: boolean;
  } {
    const normalized = result.filePath;
    this.recordMetadata(result);
    const fileAnalysis = getOrCreateFileAnalysis(this.fileCache, normalized);
    if (!this.hasTcbCandidates(result.classes)) {
      fileAnalysis.parsedTemplates.clear();
      fileAnalysis.preparedTcbData = null;
      fileAnalysis.tcb = null;
      fileAnalysis.boundFingerprint = undefined;
      return {
        fileAnalysis,
        effectiveContent: content,
        boundFingerprint: undefined,
        reuseExisting: true,
      };
    }

    const effectiveContent = content ?? fileAnalysis.sourceContent;
    const boundFingerprint =
      effectiveContent !== undefined
        ? this.computeBoundFingerprint(normalized, effectiveContent, result, knownMetadata)
        : undefined;
    if (
      fileAnalysis.preparedTcbData !== undefined &&
      boundFingerprint !== undefined &&
      fileAnalysis.boundFingerprint === boundFingerprint
    ) {
      return {fileAnalysis, effectiveContent, boundFingerprint, reuseExisting: true};
    }
    if (
      fileAnalysis.boundFingerprint !== undefined &&
      fileAnalysis.boundFingerprint !== boundFingerprint
    ) {
      fileAnalysis.parsedTemplates.clear();
      fileAnalysis.preparedTcbData = undefined;
      fileAnalysis.tcb = undefined;
    }
    return {fileAnalysis, effectiveContent, boundFingerprint, reuseExisting: false};
  }

  /**
   * Synchronously binds template targets using a pre-fetched `AnalysisResult`. `knownMetadata`
   * (e.g. the other files of the chunk) spares a round trip to the analyzer for the templates of
   * dependencies declared in those files.
   */
  ensureBoundWithMetadataSync(
    result: nga.AnalysisResult,
    content?: string,
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): FileAnalysis {
    const {fileAnalysis, effectiveContent, boundFingerprint, reuseExisting} =
      this.prepareFileAnalysisForBinding(result, content, knownMetadata);
    if (reuseExisting) {
      return fileAnalysis;
    }
    const fileContent =
      effectiveContent !== undefined
        ? effectiveContent
        : this.analyzer.getFileContentSync(result.filePath);
    const finalFingerprint =
      boundFingerprint ??
      this.computeBoundFingerprint(result.filePath, fileContent, result, knownMetadata);
    return this.populateBoundData(
      result.filePath,
      fileAnalysis,
      result,
      fileContent,
      this.dependencyTemplates(knownMetadata),
      finalFingerprint,
    );
  }

  /**
   * Asynchronously ensures that the targets for the given file are bound.
   * This is used in sidecar/async mode to avoid blocking CPU tasks.
   */
  async ensureBound(filePath: string): Promise<FileAnalysis> {
    const result = await this.analyzer.getMetadataForFile(filePath);
    if (!result) {
      return unanalyzedFile(filePath);
    }
    return this.ensureBoundWithMetadata(result);
  }

  /** Asynchronously binds template targets using a pre-fetched `AnalysisResult`. */
  async ensureBoundWithMetadata(
    result: nga.AnalysisResult,
    content?: string,
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): Promise<FileAnalysis> {
    const {fileAnalysis, effectiveContent, boundFingerprint, reuseExisting} =
      this.prepareFileAnalysisForBinding(result, content, knownMetadata);
    if (reuseExisting) {
      return fileAnalysis;
    }
    const fileContent =
      effectiveContent !== undefined
        ? effectiveContent
        : await this.analyzer.getFileContent(result.filePath);
    const finalFingerprint =
      boundFingerprint ??
      this.computeBoundFingerprint(result.filePath, fileContent, result, knownMetadata);
    // Binding is synchronous; read the templates of dependencies declared in other files here,
    // where the analyzer can be awaited (the sidecar analyzer has no synchronous lookups).
    const dependencyTemplates = this.dependencyTemplates(knownMetadata);
    await dependencyTemplates.prefetch(result);
    return this.populateBoundData(
      result.filePath,
      fileAnalysis,
      result,
      fileContent,
      dependencyTemplates,
      finalFingerprint,
    );
  }

  private dependencyTemplates(
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): DependencyTemplates {
    return new DependencyTemplates(
      this.analyzer,
      this.fileCache,
      this.templateParseOptions,
      knownMetadata,
    );
  }

  private computeBoundFingerprint(
    filePath: string,
    content: string | undefined,
    result: nga.AnalysisResult,
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): string | undefined {
    if (content === undefined) {
      return undefined;
    }
    const pieces = [
      content,
      this.serializeCached(result),
      this.serializeCached(this.tcbConfig),
      this.serializeCached(this.templateParseOptions),
    ];
    for (const cls of result.classes) {
      if (!cls.className || !cls.component) {
        continue;
      }
      const depInputs = this.dependencyTemplateInputs(filePath, cls.component, knownMetadata);
      if (depInputs === null) {
        return undefined;
      }
      pieces.push(...depInputs);
    }
    return fingerprintOf(pieces);
  }

  /**
   * Helper that populates template parsing options and runs template target binding.
   */
  private populateBoundData(
    filePath: string,
    fileAnalysis: FileAnalysis,
    result: nga.AnalysisResult,
    content: string,
    dependencyTemplates: DependencyTemplates,
    boundFingerprint?: string,
  ): FileAnalysis {
    const templatesByClass = fileAnalysis.parsedTemplates;

    const tcbTargets = buildTcbTargets(
      filePath,
      content,
      result.classes,
      templatesByClass,
      this.templateParseOptions,
      this.tcbConfig,
      dependencyTemplates,
    );

    const prepared = prepareTcbTargets(
      filePath,
      tcbTargets,
      content,
      this.tcbConfig,
      result.classes,
    );
    if (prepared) {
      fileAnalysis.preparedTcbData = prepared;
    } else {
      fileAnalysis.preparedTcbData = null;
    }
    fileAnalysis.sourceContent = content;
    fileAnalysis.boundFingerprint = boundFingerprint;
    return fileAnalysis;
  }

  /** Generates and caches the Type Check Block (TCB) for `filePath` on demand. */
  private ensureTcb(filePath: string): FileAnalysis {
    const fileAnalysis = this.ensureBoundSync(filePath);

    if (fileAnalysis.tcb !== undefined) {
      return fileAnalysis;
    }

    if (!this.optimize || !fileAnalysis.preparedTcbData) {
      fileAnalysis.tcb = null;
      return fileAnalysis;
    }

    const normPath = fileAnalysis.filePath;
    const result = this.analyzer.getMetadataForFileSync(normPath);
    if (!result) {
      fileAnalysis.tcb = null;
      return fileAnalysis;
    }

    const tcbResult = generateTcbCode(normPath, fileAnalysis.preparedTcbData, this.tcbConfig);
    if (!tcbResult) {
      fileAnalysis.tcb = null;
      return fileAnalysis;
    }

    let inlineTcbInfo = {sourceContent: '', classes: [] as nga.ClassMetadata[]};
    if (tcbResult.isInline) {
      const content = this.analyzer.getFileContentSync(normPath);
      inlineTcbInfo = {
        sourceContent: content,
        classes: result.classes,
      };
    }

    const tcbCode = combineTcbContent(tcbResult, normPath, inlineTcbInfo);
    fileAnalysis.tcb = tcbCode;

    return fileAnalysis;
  }

  getParsedTemplate(filePath: string, classKey: string): any | null {
    const parsed = this.ensureBoundSync(filePath).parsedTemplates.get(classKey);
    return parsed ? {...parsed, nodes: parsed.diagNodes} : null;
  }

  getHostElement(filePath: string, classKey: string): any | null {
    return this.ensureBoundSync(filePath).preparedTcbData?.hostElementsMap.get(classKey) ?? null;
  }

  getTypeCheckIdMap(filePath: string): Map<string, string> | null {
    return this.ensureBoundSync(filePath).preparedTcbData?.typeCheckIdMap ?? null;
  }

  getClassMetadata(filePath: string): nga.AnalysisResult | null {
    return this.analyzer.getMetadataForFileSync(filePath);
  }

  async processFile(
    filePath: string,
    content: string,
    metadata?: nga.AnalysisResult,
    chunkContext?: ChunkContext,
  ): Promise<ProcessedFile> {
    const result = metadata || (await this.analyzer.getMetadataForFile(filePath));
    if (result) {
      this.recordMetadata(result);
    }
    const normPath = result ? result.filePath : filePath;
    let processed: ProcessedFile | undefined;
    try {
      const boundFingerprint = result
        ? this.computeBoundFingerprint(normPath, content, result, chunkContext?.metadataMap)
        : undefined;
      const fingerprint = this.processingFingerprint(
        normPath,
        result,
        chunkContext,
        boundFingerprint,
      );
      const reused = this.reusableOutput(normPath, fingerprint);
      if (!reused && result) {
        this.invalidateStaleFileAnalysis(normPath, content, boundFingerprint);
      }
      processed = reused
        ? this.adoptReused(normPath, reused)
        : this.rememberProcessed(
            normPath,
            fingerprint,
            await processFile(this, normPath, content, result || undefined, chunkContext),
          );
      this.recordProcessedDiagnostics(normPath, processed);
      return processed;
    } catch (e) {
      this.processedFiles.delete(normPath);
      throw e;
    } finally {
      this.recordForIncrementalEmit(result, chunkContext, processed);
    }
  }

  processFileSync(
    filePath: string,
    content: string,
    readResource?:
      ((file: string) => string | undefined) | Map<string, nga.ResolvedResource | null>,
    metadata?: nga.AnalysisResult,
    chunkContext?: ChunkContext,
  ): ProcessedFile {
    const result = metadata || this.analyzer.getMetadataForFileSync(filePath);
    if (result) {
      this.recordMetadata(result);
    }
    const normPath = result ? result.filePath : filePath;
    let processed: ProcessedFile | undefined;
    try {
      const boundFingerprint = result
        ? this.computeBoundFingerprint(normPath, content, result, chunkContext?.metadataMap)
        : undefined;
      const fingerprint = this.processingFingerprint(
        normPath,
        result,
        chunkContext,
        boundFingerprint,
      );
      const reused = this.reusableOutput(normPath, fingerprint);
      if (!reused && result) {
        this.invalidateStaleFileAnalysis(normPath, content, boundFingerprint);
      }
      processed = reused
        ? this.adoptReused(normPath, reused)
        : this.rememberProcessed(
            normPath,
            fingerprint,
            processFileSync(
              this,
              normPath,
              content,
              readResource,
              result || undefined,
              chunkContext,
            ),
          );
      this.recordProcessedDiagnostics(normPath, processed);
      return processed;
    } catch (e) {
      this.processedFiles.delete(normPath);
      throw e;
    } finally {
      this.recordForIncrementalEmit(result, chunkContext, processed);
    }
  }

  private invalidateStaleFileAnalysis(
    filePath: string,
    content: string,
    nextFingerprint: string | undefined,
  ): void {
    const existing = this.fileCache.get(filePath);
    if (!existing) {
      return;
    }
    if (
      existing.sourceContent !== content ||
      (existing.boundFingerprint !== undefined && existing.boundFingerprint !== nextFingerprint)
    ) {
      existing.parsedTemplates.clear();
      existing.preparedTcbData = undefined;
      existing.tcb = undefined;
      existing.boundFingerprint = nextFingerprint;
      existing.sourceContent = content;
    }
  }

  /**
   * The output `filePath` can reuse instead of being processed, if any. In verification mode
   * there is none, but the would-be reused output is kept so `rememberProcessed` can compare it
   * with what processing actually produces.
   */
  private reusableOutput(filePath: string, fingerprint: string | null): ProcessedFile | undefined {
    const reused =
      fingerprint !== null ? this.processedFiles.get(filePath, fingerprint) : undefined;
    if (reused !== undefined && this.verifyReusedProcessedFiles) {
      this.pendingVerification.set(filePath, reused);
      return undefined;
    }
    return reused;
  }

  /** Repeats what processing `filePath` does besides returning its output. */
  private adoptReused(filePath: string, reused: ProcessedFile): ProcessedFile {
    if (reused.tcb) {
      getOrCreateFileAnalysis(this.fileCache, filePath).tcb = reused.tcb.code;
    }
    return reused;
  }

  private rememberProcessed(
    filePath: string,
    fingerprint: string | null,
    processed: ProcessedFile,
  ): ProcessedFile {
    const reusable = this.pendingVerification.get(filePath);
    if (reusable !== undefined) {
      this.pendingVerification.delete(filePath);
      assertSameProcessedOutput(filePath, reusable, processed);
    }
    if (processed.referencedStyleFiles && processed.referencedStyleFiles.length > 0) {
      this.templateStyleUrlsByFile.set(filePath, processed.referencedStyleFiles);
      for (const styleFile of processed.referencedStyleFiles) {
        this.knownResources.add(styleFile);
      }
    } else {
      this.templateStyleUrlsByFile.delete(filePath);
    }
    if (fingerprint === null) {
      this.processedFiles.delete(filePath);
    } else {
      this.processedFiles.set(filePath, fingerprint, processed);
    }
    return processed;
  }

  /**
   * Fingerprints everything processing `filePath` reads besides the compiler's own options, or
   * `null` when the output must not be reused:
   *
   * - `boundFingerprint`, which covers the file's content, `AnalysisResult` (including external
   *   templates/styles and resolved dependencies), `tcbConfig`, `templateParseOptions`, and the
   *   `<ng-content>` tags of the cross-file component templates read for `ngContentSelectors`;
   * - from the chunk: whether each of its components is remotely scoped, and for each of its
   *   NgModules, which components it remotely scopes with which dependencies.
   *
   * Stylesheets a template links (`<link rel="stylesheet">`) are read during processing and are
   * not fingerprinted; a change to a non-TS file that is no known resource drops every reusable
   * output instead (see `recordCanonicalInvalidations`).
   */
  private processingFingerprint(
    filePath: string,
    result: nga.AnalysisResult | null | undefined,
    chunkContext: ChunkContext | undefined,
    boundFingerprint: string | undefined,
  ): string | null {
    if (!this.reuseProcessedFiles || !result || boundFingerprint === undefined) {
      return null;
    }
    const pieces = [boundFingerprint];
    const remoteScoped = chunkContext?.remoteScopedClasses;
    for (const cls of result.classes) {
      if (!cls.className) {
        continue;
      }
      if (cls.component) {
        pieces.push(`remote:${remoteScoped?.has(`${filePath}#${cls.className}`) ?? false}`);
      }
      if (cls.ngModule) {
        pieces.push(...remoteScopeInputs(filePath, cls, chunkContext));
      }
    }
    return pieces.length === 1 ? boundFingerprint : fingerprintOf(pieces);
  }

  /**
   * What `DependencyTemplates` would read off the cross-file component dependencies of
   * `component` (the `<ng-content>` tags of their templates, see `ngContentSignature`), or `null`
   * if one of them can't be read.
   */
  private dependencyTemplateInputs(
    filePath: string,
    component: nga.ComponentMetadata,
    knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ): string[] | null {
    const inputs: string[] = [];
    const declarations = [
      ...(component.resolvedDeclarations ?? []),
      ...(component.resolvedDeferredDeclarations ?? []),
      ...Object.values(component.resolvedDeferredDeclarationsByBlock ?? {}).flat(),
    ];
    for (const decl of declarations) {
      if (
        decl.declarationType !== 'component' ||
        decl.ngContentSelectors != null ||
        !decl.filePath ||
        decl.filePath === filePath
      ) {
        continue;
      }
      let metadata = knownMetadata?.get(decl.filePath) ?? this.metadataByFile.get(decl.filePath);
      if (metadata === undefined) {
        try {
          metadata = this.analyzer.getMetadataForFileSync(decl.filePath) ?? undefined;
          if (metadata) {
            this.recordMetadata(metadata);
          }
        } catch {
          // No synchronous lookups (sidecar): nothing to fingerprint the dependency by.
          return null;
        }
      }
      const declaring = metadata?.classes.find(
        (c) => c.className === decl.name && c.nameSpan?.start === decl.nameSpan.start,
      );
      inputs.push(
        `dep:${decl.filePath}#${decl.name}`,
        declaring?.component ? this.ngContentSignatureOf(declaring.component) : 'null',
      );
    }
    return inputs;
  }

  private serializeCached(value: object | null | undefined): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    let cached = this.serializedObjects.get(value);
    if (cached === undefined) {
      cached = JSON.stringify(value);
      this.serializedObjects.set(value, cached);
    }
    return cached;
  }

  /** `ngContentSignature` of `component`'s template, computed once per metadata object. */
  private ngContentSignatureOf(component: nga.ComponentMetadata): string {
    let cached = this.ngContentSignatures.get(component);
    if (cached === undefined) {
      cached = ngContentSignature(component.template ?? '');
      this.ngContentSignatures.set(component, cached);
    }
    return cached;
  }

  /**
   * Records what `result` contributes to incremental re-emit decisions. Runs even when processing
   * throws (`processed` is `undefined` then), so the file's previous semantics never outlive it.
   */
  private recordForIncrementalEmit(
    result: nga.AnalysisResult | null | undefined,
    chunkContext: ChunkContext | undefined,
    processed: ProcessedFile | undefined,
  ): void {
    if (!this.incrementalEnabled || !result) {
      return;
    }
    this.incremental.recordFile(
      result,
      this.fileCache.get(result.filePath)?.preparedTcbData?.boundTargetMap,
      chunkContext?.remoteScopedClasses,
      this.templateStyleUrlsByFile.get(result.filePath),
      processed,
    );
  }

  private recordProcessedDiagnostics(normPath: string, processed: ProcessedFile): void {
    this.replaceDiagnostics(
      this.processedDiagnosticsBySource,
      normPath,
      (processed.diagnostics ?? []).map((diag) => ({
        target: diag.filePath || normPath,
        diag: withErrorGuide(diag),
      })),
    );
  }

  async emitHmrUpdateModule(filePath: string, className: string): Promise<string | null> {
    if (!this.enableHmr) {
      return null;
    }
    const result = await this.analyzer.getMetadataForFile(filePath);
    if (!result) {
      return null;
    }
    const content = await this.analyzer.getFileContent(result.filePath);
    const processed = await processFile(
      {...this, hmrUpdateTarget: className},
      result.filePath,
      content,
      result,
    );
    return processed.hmrUpdateModule ?? null;
  }

  emitHmrUpdateModuleSync(filePath: string, className: string): string | null {
    if (!this.enableHmr) {
      return null;
    }
    const result = this.analyzer.getMetadataForFileSync(filePath);
    if (!result) {
      return null;
    }
    const content = this.analyzer.getFileContentSync(result.filePath);
    const processed = processFileSync(
      {...this, hmrUpdateTarget: className},
      result.filePath,
      content,
      undefined,
      result,
    );
    return processed.hmrUpdateModule ?? null;
  }

  getBoundTarget(filePath: string, classKey: string): BoundTarget<TcbDirectiveMetadata> | null {
    return this.ensureBoundSync(filePath).preparedTcbData?.boundTargetMap.get(classKey) || null;
  }

  async getIndexedComponents(): Promise<Map<string, IndexedComponent>> {
    // Drain any remaining items from the analyzer queue first.
    const iterator = this.optimize ? this.analyzer.analyzeOptimized() : this.analyzer.analyze();
    for await (const chunk of iterator) {
      for (const result of chunk.files) {
        await this.ensureBoundWithMetadata(result);
      }
    }

    return getIndexedComponents(this);
  }

  getIndexedComponentsSync(): Map<string, IndexedComponent> {
    const chunks = this.optimize ? this.analyzeOptimizedSync() : this.analyzeSync();
    for (const chunk of chunks) {
      for (const result of chunk.files) {
        this.ensureBoundWithMetadataSync(result);
      }
    }
    return getIndexedComponentsSync(this);
  }

  getTsFileForTemplate(templatePath: string): nga.TemplateUsage | null {
    const res = this.analyzer.getTsFileForTemplateSync(templatePath);
    return res?.[0] ?? null;
  }

  getFileContent(filePath: string): string {
    return this.analyzer.getFileContentSync(filePath);
  }
}

/** The chunk's files keyed by path, as `ChunkContext.metadataMap`. */
function chunkMetadataMap(chunk: nga.CompilationChunk): Map<string, nga.AnalysisResult> {
  const metadataMap = new Map<string, nga.AnalysisResult>();
  for (const file of chunk.files) {
    metadataMap.set(file.filePath, file);
  }
  return metadataMap;
}

/** Uncached empty analysis for a file the analyzer has no metadata for. */
function unanalyzedFile(filePath: string): FileAnalysis {
  return {filePath, parsedTemplates: new Map(), preparedTcbData: null};
}

export function hasGraphPath(
  graph: ReadonlyMap<number, ReadonlySet<number>>,
  start: number,
  target: number,
): boolean {
  if (start === target) return true;
  const visited = new Set<number>([start]);
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const neighbors = graph.get(current);
    if (!neighbors) continue;
    for (const neighbor of neighbors) {
      if (neighbor === target) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return false;
}

export function findCyclicNodes(graph: ReadonlyMap<number, ReadonlySet<number>>): Set<number> {
  const cyclic = new Set<number>();
  const index = new Map<number, number>();
  const lowLink = new Map<number, number>();
  const onStack = new Set<number>();
  const stack: number[] = [];
  let nextIndex = 0;

  for (const root of graph.keys()) {
    if (index.has(root)) {
      continue;
    }

    const frames: {
      node: number;
      edges: Iterator<number>;
    }[] = [];
    const enter = (node: number): void => {
      index.set(node, nextIndex);
      lowLink.set(node, nextIndex);
      nextIndex++;
      stack.push(node);
      onStack.add(node);
      frames.push({node, edges: (graph.get(node) ?? new Set<number>())[Symbol.iterator]()});
    };
    enter(root);

    while (frames.length > 0) {
      const frame = frames[frames.length - 1];
      const step = frame.edges.next();

      if (!step.done) {
        const neighbor = step.value;
        if (neighbor === frame.node) {
          // A one-node cycle, which an SCC of size one cannot express.
          cyclic.add(neighbor);
        } else if (!index.has(neighbor)) {
          enter(neighbor);
        } else if (onStack.has(neighbor)) {
          lowLink.set(frame.node, Math.min(lowLink.get(frame.node)!, index.get(neighbor)!));
        }
        continue;
      }

      frames.pop();
      const caller = frames[frames.length - 1];
      if (caller !== undefined) {
        lowLink.set(caller.node, Math.min(lowLink.get(caller.node)!, lowLink.get(frame.node)!));
      }

      if (lowLink.get(frame.node) !== index.get(frame.node)) {
        continue;
      }

      // The node roots a strongly connected component: itself and everything stacked above it.
      const component: number[] = [];
      for (;;) {
        const member = stack.pop()!;
        onStack.delete(member);
        component.push(member);
        if (member === frame.node) {
          break;
        }
      }
      if (component.length > 1) {
        for (const member of component) {
          cyclic.add(member);
        }
      }
    }
  }

  return cyclic;
}

function formatSerializedDiagnostic(d: nga.NgDiagnostic) {
  return {
    filePath: d.filePath,
    category: d.category === 1 ? 'error' : 'warning',
    code: d.code,
    messageText: flattenNgDiagnosticMessage(d),
    span: d.span,
    ...(d.relatedInformation && d.relatedInformation.length > 0
      ? {relatedInformation: d.relatedInformation}
      : {}),
  };
}

/**
 * What processing the NgModule `ngModule` of `filePath` reads from the chunk: the components of
 * the chunk it declares, whether each is remotely scoped, and the dependencies it would scope
 * them with (`ɵɵsetComponentScope`).
 */
function remoteScopeInputs(
  filePath: string,
  ngModule: nga.ClassMetadata,
  chunkContext: ChunkContext | undefined,
): string[] {
  const inputs: string[] = [];
  for (const [declaringPath, fileMeta] of chunkContext?.metadataMap ?? []) {
    for (const cls of fileMeta.classes) {
      const owner = cls.component?.declaringNgModule;
      if (!cls.className || owner?.filePath !== filePath || owner.symbolId !== ngModule.symbolId) {
        continue;
      }
      const key = `${declaringPath}#${cls.className}`;
      inputs.push(
        `scope:${key}`,
        String(chunkContext!.remoteScopedClasses.has(key)),
        JSON.stringify(chunkContext!.eagerlyUsedDeclarations.get(key) ?? null),
      );
    }
  }
  return inputs;
}

/** Throws unless `fresh`, just produced by processing `filePath`, matches the `reused` output. */
function assertSameProcessedOutput(
  filePath: string,
  reused: ProcessedFile,
  fresh: ProcessedFile,
): void {
  const parts = (processed: ProcessedFile) => ({
    code: processed.magicString.toString(),
    tcb: processed.tcb?.code ?? null,
    diagnostics: JSON.stringify(processed.diagnostics ?? []),
    hmrUpdateModule: processed.hmrUpdateModule ?? null,
  });
  const expected = parts(fresh);
  const actual = parts(reused);
  const stale = (Object.keys(expected) as Array<keyof typeof expected>).filter(
    (part) => expected[part] !== actual[part],
  );
  if (stale.length > 0) {
    throw new Error(
      `The reused processed output of ${filePath} is stale (${stale.join(', ')}): processing ` +
        `read an input its fingerprint does not cover.`,
    );
  }
}
