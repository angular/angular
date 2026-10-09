/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractBoundTemplate, ParseTemplateOptions} from '@angular/compiler';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';

import {
  buildTypeCheckingConfig,
  HybridCompiler,
  IndexerBoundTemplate,
  WasmAnalyzer,
  type ClassEntity,
  type HostDirEntry,
  type HostFileStat,
  type LoadAnalyzerOptions,
  type NgDiagnostic,
  type NgpTypeCheckingConfig,
  type WasmHostFs,
  type WasmInner,
} from '../../../../preprocessor/api';
import {createRequire} from 'node:module';
import {exitCodeFromResult} from '../../../perform_compile';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {AbsoluteFsPath, FileSystem} from '../../file_system';
import {ClassDeclaration, DeclarationNode} from '../../reflection';
import {hasIgnoreForDiagnosticsMarker, readSpanComment} from '../../typecheck/src/comments';
import {shouldReportDiagnostic} from '../../typecheck/src/diagnostics';
import {getTokenAtPosition} from '../../util/src/typescript';
import type * as api from '../../../transformers/api';
import {NgtscTestCompilerHost} from './compiler_host';

const SPAN_COMMENT_REGEX = /\/\*(\d+),(\d+)\*\//g;

/**
 * Returns true if the current test run is configured to use the NGP compiler backend.
 */
export function isNgpTestMode(): boolean {
  const backend = process.env['NG_COMPILER_BACKEND'];
  const useNgp = process.env['USE_NGP'];
  return backend === 'ngp' || useNgp === '1' || useNgp === 'true';
}

/**
 * Resolves the `ng_analyze_wasm.js` glue script from Bazel runfiles or workspace output.
 */
export function resolveNgpWasmBinding(): string {
  if (process.env['NGP_WASM_BINDING']) {
    return process.env['NGP_WASM_BINDING'];
  }
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(
        runfilesDir,
        '_main/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
      path.join(
        runfilesDir,
        'angular/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
      path.join(
        runfilesDir,
        'packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(
      process.cwd(),
      '../../packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
    ),
    path.resolve(
      process.cwd(),
      'dist/bin/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
    ),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  throw new Error(
    `Could not find ng_analyze_wasm.js in runfiles. Checked runfilesDir=${runfilesDir}, cwd=${process.cwd()}`,
  );
}

const requireFromHere = createRequire(import.meta.url);
type WasmInnerConstructor = new (optionsJson: string, hostFs?: WasmHostFs | null) => WasmInner;

function createTestWasmAnalyzerSync(
  tsconfigPath: string,
  options: LoadAnalyzerOptions & {wasmBinding: string},
): WasmAnalyzer {
  const mod = requireFromHere(options.wasmBinding) as {WasmAnalyzer?: WasmInnerConstructor};
  const Inner = mod?.WasmAnalyzer;
  if (typeof Inner !== 'function') {
    throw new Error(`'${options.wasmBinding}' does not export a 'WasmAnalyzer' constructor`);
  }
  const inner = new Inner(
    JSON.stringify({
      virtualFiles: options.virtualFiles,
      optimize: options.optimize ?? true,
      tsconfigPath,
      nodeModulesPathOverride: options.nodeModulesPathOverride,
      workspaceName: options.workspaceName,
      rootDirs: options.rootDirs,
    }),
    options.hostFs,
  );
  return new WasmAnalyzer(inner);
}

/**
 * Converts a compiler-cli `AbsoluteFsPath` (which may start with `C:/` on `MockFileSystemWindows`)
 * into a POSIX path starting with `/` for the `wasm32-unknown-unknown` analyzer.
 */
export function toPosixPath(fsPath: string): string {
  const forward = fsPath.replace(/\\/g, '/');
  const strippedDrive = forward.replace(/^[a-zA-Z]:/, '');
  return strippedDrive.startsWith('/') ? strippedDrive : '/' + strippedDrive;
}

/**
 * Converts a POSIX path from the WASM analyzer back to an `AbsoluteFsPath` on `fs`.
 */
export function fromPosixPath(fs: FileSystem, posixPath: string): AbsoluteFsPath {
  return fs.resolve(posixPath);
}

/**
 * Bridges a compiler-cli `FileSystem` (`MockFileSystem` or `NodeJSFileSystem`) to NGP's
 * synchronous `WasmHostFs` interface so `WasmAnalyzer` can read files and resolve modules
 * directly from the test's in-memory filesystem.
 */
export function createMockFileSystemHostFs(fs: FileSystem): WasmHostFs {
  const orNull = <T>(op: () => T): T | null => {
    try {
      return op();
    } catch {
      return null;
    }
  };

  const toStat = (stats: {
    isFile(): boolean;
    isDirectory(): boolean;
    isSymbolicLink(): boolean;
  }): HostFileStat => ({
    isFile: stats.isFile(),
    isDir: stats.isDirectory(),
    isSymlink: stats.isSymbolicLink(),
  });

  return {
    read(p: string): Uint8Array | null {
      const fsPath = fromPosixPath(fs, p);
      if (p.endsWith('.wasm')) {
        return orNull(() => new Uint8Array(fs.readFileBuffer(fsPath)));
      }
      return orNull(() => new TextEncoder().encode(fs.readFile(fsPath)));
    },
    metadata(p: string): HostFileStat | null {
      const fsPath = fromPosixPath(fs, p);
      const stats = orNull(() => fs.stat(fsPath));
      return stats ? toStat(stats) : null;
    },
    symlinkMetadata(p: string): HostFileStat | null {
      const fsPath = fromPosixPath(fs, p);
      const stats = orNull(() => fs.lstat(fsPath));
      return stats ? toStat(stats) : null;
    },
    readLink(p: string): string | null {
      const fsPath = fromPosixPath(fs, p);
      const real = orNull(() => fs.realpath(fsPath));
      return real ? toPosixPath(real) : null;
    },
    canonicalize(p: string): string | null {
      const fsPath = fromPosixPath(fs, p);
      const real = orNull(() => fs.realpath(fsPath));
      return real ? toPosixPath(real) : null;
    },
    readDir(p: string): HostDirEntry[] | null {
      const fsPath = fromPosixPath(fs, p);
      const entries = orNull(() => fs.readdir(fsPath));
      if (!entries) {
        return null;
      }
      const out: HostDirEntry[] = [];
      for (const name of entries) {
        if (name === '.' || name === '..') {
          continue;
        }
        const entryPath = fs.join(fsPath, name);
        const lstat = orNull(() => fs.lstat(entryPath));
        if (!lstat) {
          continue;
        }
        out.push({
          name,
          isFile: lstat.isFile(),
          isDir: lstat.isDirectory(),
          isSymlink: lstat.isSymbolicLink(),
        });
      }
      return out;
    },
  };
}

export interface NgpCompilationResult {
  exitCode: number;
  diagnostics: ReadonlyArray<ts.Diagnostic>;
  tsProgram: ts.Program;
  compiler: HybridCompiler;
  originalSourceFiles: ReadonlyMap<AbsoluteFsPath, ts.SourceFile>;
  preprocessedTsMap: ReadonlyMap<AbsoluteFsPath, string>;
  emittedFiles: AbsoluteFsPath[];
}

/**
 * Runs a full synchronous compilation and diagnostic pass using NGP (`HybridCompiler` + WASM
 * `ng-analyze` + TypeScript over `.ng.ts` and `.ngtypecheck.ts`), mapping all diagnostics back
 * to the original `.ts` and `.html` `ts.SourceFile`s.
 */
export function performNgpCompilationSync(params: {
  fs: FileSystem;
  basePath: AbsoluteFsPath;
  tsconfigPath: AbsoluteFsPath;
  rootNames: readonly string[];
  options: api.CompilerOptions;
  emit: boolean;
  complianceMode?: boolean;
  customTransformers?: api.CustomTransformers;
  writeFileCallback?: ts.WriteFileCallback;
  closeAnalyzer?: boolean;
  tcbConfigOverride?: Partial<NgpTypeCheckingConfig>;
  templateDiagnosticsOnly?: boolean;
}): NgpCompilationResult {
  const {
    fs,
    basePath,
    tsconfigPath,
    rootNames,
    options,
    emit,
    complianceMode = false,
    customTransformers,
    writeFileCallback,
    closeAnalyzer = true,
    tcbConfigOverride,
    templateDiagnosticsOnly = false,
  } = params;

  const posixTsconfigPath = toPosixPath(tsconfigPath);
  const posixBasePath = toPosixPath(basePath);
  const hostFs = createMockFileSystemHostFs(fs);
  const wasmBinding = resolveNgpWasmBinding();

  const rawOpts = options as Record<string, unknown>;
  const optimize =
    rawOpts['compilationMode'] !== 'experimental-local' && rawOpts['compilationMode'] !== 'local';
  if (!optimize) {
    options.noEmitOnError = false;
  }
  const isClosureCompilerEnabled = Boolean(options.annotateForClosureCompiler);
  const emitDeclarationOnly =
    Boolean(options.emitDeclarationOnly) &&
    Boolean(rawOpts['_experimentalAllowEmitDeclarationOnly']);
  const workspaceName = rawOpts['workspaceName'] as string | undefined;
  const rootDirs = options.rootDirs?.map((d: string) => toPosixPath(fs.resolve(basePath, d)));

  // If tsconfig.json does not exist or does not explicitly specify `files` or `include`,
  // inject `files` from TypeScript's resolved `rootNames` via `virtualFiles` so `WasmAnalyzer`
  // does not walk `/node_modules` over the JS-WASM bridge on every test compilation.
  const virtualFiles: Record<string, string> = {};
  if (fs.exists(tsconfigPath)) {
    try {
      const rawTsconfig = JSON.parse(fs.readFile(tsconfigPath)) as Record<string, unknown>;
      if (rawTsconfig['files'] === undefined && rawTsconfig['include'] === undefined) {
        rawTsconfig['files'] = rootNames.map((r) => toPosixPath(fs.resolve(basePath, r)));
        virtualFiles[posixTsconfigPath] = JSON.stringify(rawTsconfig);
      }
    } catch {
      // Keep original tsconfig on disk if not valid JSON
    }
  } else {
    virtualFiles[posixTsconfigPath] = JSON.stringify({
      compilerOptions: {
        rootDirs,
        preserveSymlinks: Boolean(options.preserveSymlinks),
        allowJs: Boolean(options.allowJs),
      },
      angularCompilerOptions: {
        _generateExtraImportsInLocalMode: Boolean(rawOpts['_generateExtraImportsInLocalMode']),
        compileNonExportedClasses: rawOpts['compileNonExportedClasses'] !== false,
        workspaceName,
      },
      files: rootNames.map((r) => toPosixPath(fs.resolve(basePath, r))),
    });
  }

  const analyzer = createTestWasmAnalyzerSync(posixTsconfigPath, {
    backend: 'wasm',
    wasmBinding,
    hostFs,
    optimize,
    virtualFiles,
    nodeModulesPathOverride: toPosixPath(fs.resolve('/node_modules')),
    workspaceName,
    rootDirs,
  });

  const tcbConfig: NgpTypeCheckingConfig = {
    ...buildTypeCheckingConfig({
      strictTemplates: options.strictTemplates ?? true,
      ...options,
      strictContextGenerics:
        (rawOpts['strictContextGenerics'] as boolean | undefined) ??
        (rawOpts['useContextGenericType'] as boolean | undefined),
    }),
    ...tcbConfigOverride,
  };

  let compiler: HybridCompiler;
  try {
    compiler = new HybridCompiler(analyzer, {
      optimize,
      tsconfigPath: posixTsconfigPath,
      virtualFiles,
      tcbConfig,
      templateParseOptions: {
        enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat,
        i18nNormalizeLineEndingsInICUs: options.i18nNormalizeLineEndingsInICUs,
        preserveWhitespaces: options.preserveWhitespaces,
        enableSelectorless: Boolean(rawOpts['_enableSelectorless']),
      },
      legacyOptionalChaining: Boolean(rawOpts['legacyOptionalChaining']),
      isClosureCompilerEnabled,
      emitDeclarationOnly,
      externalRuntimeStyles: Boolean(rawOpts['externalRuntimeStyles']),
      onlyExplicitDeferDependencyImports: Boolean(rawOpts['onlyExplicitDeferDependencyImports']),
      enableTemplateSourceLocations: Boolean(rawOpts['enableTemplateSourceLocations']),
      onlyPublishPublicTypingsForNgModules: Boolean(
        rawOpts['onlyPublishPublicTypingsForNgModules'],
      ),
      forbidOrphanComponents: Boolean(rawOpts['forbidOrphanComponents']),
      supportJitMode: rawOpts['supportJitMode'] as boolean | undefined,
      preserveWhitespaces: options.preserveWhitespaces,
      supportTestBed: rawOpts['supportTestBed'] as boolean | undefined,
      enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat,
      i18nUseExternalIds: options.i18nUseExternalIds,
      i18nNormalizeLineEndingsInICUs: options.i18nNormalizeLineEndingsInICUs,
      enableHmr: Boolean(rawOpts['_enableHmr']),
      rootDir: options.rootDir ? toPosixPath(fs.resolve(basePath, options.rootDir)) : posixBasePath,
      workspaceName,
      rootDirs,
      complianceMode,
    });
  } catch (e) {
    analyzer.close();
    throw e;
  }

  // Map of original AbsoluteFsPath -> preprocessed .ng.ts content
  const preprocessedTsMap = new Map<AbsoluteFsPath, string>();
  // Map of virtual .ngtypecheck.ts AbsoluteFsPath -> TCB content
  const tcbFileMap = new Map<AbsoluteFsPath, {code: string; originFsPath: AbsoluteFsPath}>();
  // Map of original Posix filePath -> Map<typeCheckId, resolvedTemplatePosixPath>
  const templatePathByTypeCheckId = new Map<string, string>();
  const processorThrownErrors: Array<{fsFilePath: AbsoluteFsPath; message: string}> = [];

  const chunks =
    rootNames.length === 0
      ? []
      : optimize && !emitDeclarationOnly
        ? compiler.analyzeOptimizedSync()
        : compiler.analyzeSync();
  for (const chunk of chunks) {
    const chunkContext = compiler.prepareChunkSync(chunk);
    for (const fileResult of chunk.files) {
      const posixFilePath = fileResult.filePath;
      const fsFilePath = fromPosixPath(fs, posixFilePath);
      if (!fs.exists(fsFilePath)) {
        continue;
      }
      const originalContent = fs.readFile(fsFilePath);
      let processed;
      try {
        processed = compiler.processFileSync(
          posixFilePath,
          originalContent,
          (resPosixPath: string) => {
            const resFsPath = fromPosixPath(fs, resPosixPath);
            return fs.exists(resFsPath) ? fs.readFile(resFsPath) : undefined;
          },
          fileResult,
          chunkContext,
        );
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        processorThrownErrors.push({fsFilePath, message});
        continue;
      }

      preprocessedTsMap.set(fsFilePath, processed.magicString.toString());

      if (processed.tcb && !options.emitDeclarationOnly) {
        const tcbFsPath = fs.resolve(fsFilePath.replace(/\.ts$/, '.ngtypecheck.ts'));
        tcbFileMap.set(tcbFsPath, {code: processed.tcb.code, originFsPath: fsFilePath});
      }

      const typeCheckIdMap = compiler.getTypeCheckIdMap(posixFilePath);
      if (typeCheckIdMap) {
        for (const cls of fileResult.classes) {
          if (cls.className && cls.component?.templateUrl?.resolvedPath) {
            const classKey = `${cls.className}@${cls.span.start}`;
            const tcId = typeCheckIdMap.get(classKey);
            if (tcId) {
              templatePathByTypeCheckId.set(tcId, cls.component.templateUrl.resolvedPath);
            }
          }
        }
      }
    }
  }

  // Create a CompilerHost that serves preprocessed .ng.ts content for compilation and
  // .ngtypecheck.ts for TCB checking, while keeping a cache of original ts.SourceFiles so mapped
  // diagnostics carry the original source text.
  const baseHost = new NgtscTestCompilerHost(fs, options);
  const originalSourceFiles = new Map<AbsoluteFsPath, ts.SourceFile>();

  const getOriginalSourceFile = (fsPath: AbsoluteFsPath): ts.SourceFile | undefined => {
    let sf = originalSourceFiles.get(fsPath);
    if (sf) {
      return sf;
    }
    if (!fs.exists(fsPath)) {
      return undefined;
    }
    const content = fs.readFile(fsPath);
    sf = ts.createSourceFile(
      fsPath,
      content,
      options.target ?? ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
    );
    originalSourceFiles.set(fsPath, sf);
    return sf;
  };

  const overlayHost: ts.CompilerHost = Object.create(baseHost);
  overlayHost.fileExists = (fileName: string): boolean => {
    const absPath = fs.resolve(fileName);
    if (tcbFileMap.has(absPath) || preprocessedTsMap.has(absPath)) {
      return true;
    }
    return baseHost.fileExists(fileName);
  };

  overlayHost.readFile = (fileName: string): string | undefined => {
    const absPath = fs.resolve(fileName);
    const tcb = tcbFileMap.get(absPath);
    if (tcb !== undefined) {
      return tcb.code;
    }
    const preprocessed = preprocessedTsMap.get(absPath);
    if (preprocessed !== undefined) {
      return preprocessed;
    }
    return baseHost.readFile(fileName);
  };

  overlayHost.getSourceFile = (
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
  ): ts.SourceFile | undefined => {
    const absPath = fs.resolve(fileName);
    const tcb = tcbFileMap.get(absPath);
    if (tcb !== undefined) {
      return ts.createSourceFile(absPath, tcb.code, languageVersionOrOptions, true);
    }
    const preprocessed = preprocessedTsMap.get(absPath);
    if (preprocessed !== undefined) {
      // Cache original SourceFile before returning preprocessed SourceFile
      getOriginalSourceFile(absPath);
      return ts.createSourceFile(absPath, preprocessed, languageVersionOrOptions, true);
    }
    const languageVersion =
      typeof languageVersionOrOptions === 'object'
        ? languageVersionOrOptions.languageVersion
        : languageVersionOrOptions;
    const sf = baseHost.getSourceFile(fileName, languageVersion);
    if (sf) {
      originalSourceFiles.set(absPath, sf);
    }
    return sf;
  };

  if (writeFileCallback) {
    overlayHost.writeFile = writeFileCallback;
  }

  const programRootNames: string[] = [...rootNames];
  for (const tcbPath of tcbFileMap.keys()) {
    programRootNames.push(tcbPath);
  }

  const tsProgram = ts.createProgram(programRootNames, options, overlayHost);

  const allDiagnostics: ts.Diagnostic[] = [];
  for (const thrown of processorThrownErrors) {
    const origSf = getOriginalSourceFile(thrown.fsFilePath);
    allDiagnostics.push({
      file: origSf,
      start: 0,
      length: 0,
      category: ts.DiagnosticCategory.Error,
      code: 0,
      messageText: thrown.message,
    });
  }
  if (!templateDiagnosticsOnly) {
    allDiagnostics.push(...tsProgram.getOptionsDiagnostics());
    if (optimize || !complianceMode) {
      allDiagnostics.push(...tsProgram.getGlobalDiagnostics());
    }

    // 1. Collect syntactic & semantic TS diagnostics on non-TCB source files
    for (const sf of tsProgram.getSourceFiles()) {
      const absPath = fs.resolve(sf.fileName);
      if (tcbFileMap.has(absPath)) {
        continue;
      }
      const origSf = getOriginalSourceFile(absPath) ?? sf;
      for (const d of tsProgram.getSyntacticDiagnostics(sf)) {
        allDiagnostics.push({...d, file: origSf});
      }
      if (!options.emitDeclarationOnly && (optimize || !complianceMode)) {
        for (const d of tsProgram.getSemanticDiagnostics(sf)) {
          allDiagnostics.push({...d, file: origSf});
        }
      }
    }
  }

  // 2. Collect NGP analyzer & processor diagnostics from compiler.diagnosticsMap
  for (const [diagPosixPath, ngDiags] of compiler.diagnosticsMap.entries()) {
    const diagFsPath = fromPosixPath(fs, diagPosixPath);
    const origSf = getOriginalSourceFile(diagFsPath);
    for (const ngDiag of ngDiags) {
      allDiagnostics.push(convertNgDiagnosticToTs(ngDiag, origSf));
    }
  }

  // 3. Collect and map TCB semantic diagnostics from .ngtypecheck.ts files
  for (const [tcbFsPath, {code: tcbCode, originFsPath}] of tcbFileMap.entries()) {
    const tcbSf = tsProgram.getSourceFile(tcbFsPath);
    if (!tcbSf) {
      continue;
    }
    const rawTcbDiags = tsProgram.getSemanticDiagnostics(tcbSf);
    for (const diag of rawTcbDiags) {
      const mapped = translateTcbDiagnostic(
        diag,
        tcbSf,
        tcbCode,
        originFsPath,
        templatePathByTypeCheckId,
        fs,
        getOriginalSourceFile,
      );
      if (mapped !== null) {
        allDiagnostics.push(mapped);
      }
    }
  }

  // 4. Emit .js and .d.ts for non-TCB files when requested and no blocking errors exist
  const emittedFiles: AbsoluteFsPath[] = [];
  const hasError = allDiagnostics.some((d) => d.category === ts.DiagnosticCategory.Error);
  if (emit && !(hasError && options.noEmitOnError)) {
    const tsTransformers: ts.CustomTransformers | undefined = customTransformers
      ? {
          before: customTransformers.beforeTs,
          after: customTransformers.afterTs,
        }
      : undefined;
    const baseWriteFile = writeFileCallback ?? overlayHost.writeFile.bind(overlayHost);
    const trackingWriteFile: ts.WriteFileCallback = (
      fileName,
      data,
      writeByteOrderMark,
      onError,
      sourceFiles,
      writeFileData,
    ) => {
      emittedFiles.push(fs.resolve(basePath, fileName));
      baseWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles, writeFileData);
    };
    for (const sf of tsProgram.getSourceFiles()) {
      const absPath = fs.resolve(sf.fileName);
      if (tcbFileMap.has(absPath) || sf.isDeclarationFile) {
        continue;
      }
      const emitResult = tsProgram.emit(
        sf,
        trackingWriteFile,
        /* cancellationToken */ undefined,
        /* emitOnlyDtsFiles */ Boolean(options.emitDeclarationOnly),
        tsTransformers,
      );
      for (const d of emitResult.diagnostics) {
        allDiagnostics.push(d);
      }
    }
  }

  if (closeAnalyzer) {
    compiler.analyzer.close();
  }

  return {
    exitCode: exitCodeFromResult(allDiagnostics),
    diagnostics: allDiagnostics,
    tsProgram,
    compiler,
    originalSourceFiles,
    preprocessedTsMap,
    emittedFiles,
  };
}

export function convertNgDiagnosticToTs(
  ngDiag: NgDiagnostic,
  sourceFile: ts.SourceFile | undefined,
): ts.Diagnostic {
  let category = ts.DiagnosticCategory.Error;
  if (ngDiag.category === 0) {
    category = ts.DiagnosticCategory.Warning;
  } else if (ngDiag.category === 2) {
    category = ts.DiagnosticCategory.Suggestion;
  } else if (ngDiag.category === 3) {
    category = ts.DiagnosticCategory.Message;
  }

  const rawCode = ngDiag.code ?? ErrorCode.VALUE_HAS_WRONG_TYPE;
  // Convert positive Angular error codes (e.g. 8001, 1010) to negative -99xxxx codes via ngErrorCode
  const code =
    rawCode > 0 && rawCode < 90000 ? ngErrorCode(rawCode as unknown as ErrorCode) : rawCode;
  const start = ngDiag.span?.start;
  const length = ngDiag.span ? Math.max(0, ngDiag.span.end - ngDiag.span.start) : undefined;

  return {
    file: sourceFile,
    start,
    length,
    messageText: ngDiag.messageText,
    category,
    code,
    source: 'ngtsc',
  };
}

function findClosestPrecedingNode(
  node: ts.Node,
  position: number,
  sourceFile: ts.SourceFile,
): ts.Node | undefined {
  let bestNode: ts.Node | undefined;
  function visit(n: ts.Node): void {
    if (n.getEnd() <= position) {
      if (!bestNode || n.getEnd() > bestNode.getEnd()) {
        bestNode = n;
      }
    }
    if (n.getStart(sourceFile) <= position) {
      n.getChildren(sourceFile).forEach(visit);
    }
  }
  visit(node);
  return bestNode;
}

export function getTemplateSpanFromTcbLocation(
  tcbCode: string,
  targetPos: number,
): {start: number; end: number} | null {
  let closestMatch: RegExpExecArray | null = null;
  let minDistance = Infinity;

  for (const match of tcbCode.matchAll(SPAN_COMMENT_REGEX)) {
    const commentPos = match.index!;
    const distance = Math.abs(commentPos - targetPos);
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = match;
    } else {
      break;
    }
  }

  if (!closestMatch) {
    return null;
  }

  return {
    start: parseInt(closestMatch[1], 10),
    end: parseInt(closestMatch[2], 10),
  };
}

export function translateTcbDiagnostic(
  diag: ts.Diagnostic,
  tcbSf: ts.SourceFile,
  tcbCode: string,
  originFsPath: AbsoluteFsPath,
  templatePathByTypeCheckId: ReadonlyMap<string, string>,
  fs: FileSystem,
  getOriginalSourceFile: (fsPath: AbsoluteFsPath) => ts.SourceFile | undefined,
): ts.Diagnostic | null {
  if (!shouldReportDiagnostic(diag) || diag.start === undefined) {
    return null;
  }

  const node = getTokenAtPosition(tcbSf, diag.start);
  const precedingNode = findClosestPrecedingNode(tcbSf, diag.start, tcbSf);
  if (precedingNode && hasIgnoreForDiagnosticsMarker(precedingNode, tcbSf)) {
    return null;
  }

  let currentNode: ts.Node | undefined = node;
  let typeCheckId: string | undefined;
  let span: {start: number; end: number} | null = null;
  while (currentNode !== undefined) {
    if (hasIgnoreForDiagnosticsMarker(currentNode, tcbSf)) {
      return null;
    }
    if (span === null) {
      span = readSpanComment(currentNode, tcbSf);
    }
    if (
      ts.isFunctionDeclaration(currentNode) &&
      currentNode.name &&
      currentNode.name.text.startsWith('_tcb')
    ) {
      typeCheckId = currentNode.name.text.substring(1);
      break;
    }
    currentNode = currentNode.parent;
  }

  if (typeCheckId === undefined) {
    // Diagnostic is outside a _tcb function (e.g., in an inline TCB's copied class body)
    return null;
  }

  if (!span) {
    span = getTemplateSpanFromTcbLocation(tcbCode, diag.start);
  }
  if (!span) {
    return null;
  }

  const templatePosixPath = templatePathByTypeCheckId.get(typeCheckId);
  const targetFsPath = templatePosixPath ? fromPosixPath(fs, templatePosixPath) : originFsPath;
  const targetSf = getOriginalSourceFile(targetFsPath);
  if (!targetSf) {
    return null;
  }

  return {
    ...diag,
    file: targetSf,
    start: span.start,
    length: Math.max(0, span.end - span.start),
  };
}

/**
 * Binds a template using NGP's `HybridCompiler` and `IndexerBoundTemplate` for template indexer
 * tests.
 */
export function createNgpBoundTemplate(
  fs: FileSystem,
  template: string,
  options: ParseTemplateOptions = {},
  components: Array<{
    selector: string | null;
    declaration: ClassDeclaration;
    inputs?: Record<string, string>;
    outputs?: Record<string, string>;
  }> = [],
  pipes: Array<{
    name: string;
    declaration: ClassDeclaration;
  }> = [],
): AbstractBoundTemplate<DeclarationNode> {
  const coreDtsPath = fs.resolve('/node_modules/@angular/core/index.d.ts');
  if (!fs.exists(coreDtsPath)) {
    fs.ensureDir(fs.resolve('/node_modules/@angular/core'));
    fs.writeFile(
      coreDtsPath,
      'export declare const Component: any;\n' +
        'export declare const Directive: any;\n' +
        'export declare const Pipe: any;\n' +
        'export declare const Input: any;\n' +
        'export declare const Output: any;\n',
    );
  }

  const declarationsByName = new Map<string, DeclarationNode>();
  const classDecls: string[] = [];
  const importNames: string[] = [];

  for (const {selector, declaration, inputs = {}, outputs = {}} of components) {
    const className = declaration.name.getText();
    declarationsByName.set(className, declaration);
    importNames.push(className);
    const inputMembers = Object.entries(inputs)
      .map(([prop, binding]) => `  @Input(${JSON.stringify(binding)}) ${prop}!: any;`)
      .join('\n');
    const outputMembers = Object.entries(outputs)
      .map(([prop, binding]) => `  @Output(${JSON.stringify(binding)}) ${prop}!: any;`)
      .join('\n');
    const decorator =
      selector !== null
        ? `@Component({\n  selector: ${JSON.stringify(selector)},\n  template: '',\n  standalone: true,\n})`
        : `@Directive({\n  standalone: true,\n})`;
    classDecls.push(
      `${decorator}\nexport class ${className} {\n${inputMembers}\n${outputMembers}\n}`,
    );
  }

  for (const {name: pipeName, declaration} of pipes) {
    const className = declaration.name.getText();
    declarationsByName.set(className, declaration);
    importNames.push(className);
    classDecls.push(
      `@Pipe({\n  name: ${JSON.stringify(pipeName)},\n  standalone: true,\n})\n` +
        `export class ${className} {\n  transform(v: any): any { return v; }\n}`,
    );
  }

  const hostClassName = 'NgpIndexerHostCmp';
  const templateFsPath = fs.resolve('/ngp_indexer_template.html');
  const testFsPath = fs.resolve('/ngp_indexer_test.ts');
  const tsconfigFsPath = fs.resolve('/ngp_indexer_tsconfig.json');

  fs.writeFile(templateFsPath, template);
  fs.writeFile(
    testFsPath,
    `import {Component, Directive, Input, Output, Pipe} from '@angular/core';\n\n` +
      `${classDecls.join('\n\n')}\n\n` +
      `@Component({\n` +
      `  selector: 'ngp-indexer-host-cmp',\n` +
      `  templateUrl: './ngp_indexer_template.html',\n` +
      `  standalone: true,\n` +
      `  imports: [${importNames.join(', ')}],\n` +
      `})\n` +
      `export class ${hostClassName} {}\n`,
  );

  const posixTestPath = toPosixPath(testFsPath);
  const posixTsconfigPath = toPosixPath(tsconfigFsPath);
  const virtualFiles: Record<string, string> = {
    [posixTsconfigPath]: JSON.stringify({
      compilerOptions: {},
      angularCompilerOptions: {},
      files: [posixTestPath],
    }),
  };

  const hostFs = createMockFileSystemHostFs(fs);
  const wasmBinding = resolveNgpWasmBinding();
  const analyzer = createTestWasmAnalyzerSync(posixTsconfigPath, {
    backend: 'wasm',
    wasmBinding,
    hostFs,
    optimize: true,
    virtualFiles,
    nodeModulesPathOverride: toPosixPath(fs.resolve('/node_modules')),
  });

  let ngpBound: IndexerBoundTemplate;
  try {
    const compiler = new HybridCompiler(analyzer, {
      optimize: true,
      tsconfigPath: posixTsconfigPath,
      virtualFiles,
      templateParseOptions: options,
    });
    for (const chunk of compiler.analyzeOptimizedSync()) {
      for (const result of chunk.files) {
        compiler.ensureBoundWithMetadataSync(result);
      }
    }
    const fileAnalysis = compiler.fileCache.get(posixTestPath);
    const result = analyzer.getMetadataForFileSync(posixTestPath);
    const hostCls = result?.classes.find((c) => c.className === hostClassName);
    const classKey = hostCls ? `${hostCls.className}@${hostCls.span.start}` : '';
    const boundTarget = fileAnalysis?.preparedTcbData?.boundTargetMap.get(classKey);
    const target = fileAnalysis?.preparedTcbData?.targets.find(
      (t) => t.comp.className === hostClassName,
    );
    const pipeMap = new Map<string, ClassEntity>();
    if (target?.comp.pipeRegistry) {
      for (const [name, pipeMeta] of target.comp.pipeRegistry.entries()) {
        pipeMap.set(name, {
          name: pipeMeta.className,
          filePath: pipeMeta.filePath || '',
        });
      }
    }
    ngpBound = new IndexerBoundTemplate(boundTarget, pipeMap);
  } finally {
    analyzer.close();
  }

  const mapDirectiveRef = (dir: {ref: {node: ClassEntity}; selector: string | null}) => ({
    ref: {node: declarationsByName.get(dir.ref.node.name)!},
    selector: dir.selector,
  });

  return {
    getDirectivesOfNode(node) {
      const dirs = ngpBound.getDirectivesOfNode(node);
      if (!dirs) {
        return null;
      }
      return dirs.filter((d) => declarationsByName.has(d.ref.node.name)).map(mapDirectiveRef);
    },
    getReferenceTarget(node) {
      const target = ngpBound.getReferenceTarget(node);
      if (!target) {
        return null;
      }
      if ('directive' in target) {
        return {
          node: target.node,
          directive: mapDirectiveRef(target.directive),
        };
      }
      return target;
    },
    getConsumerOfBinding(binding) {
      const consumer = ngpBound.getConsumerOfBinding(binding);
      if (consumer && 'ref' in consumer && consumer.ref) {
        const decl = declarationsByName.get(consumer.ref.node.name);
        return decl ? {ref: {node: decl}} : null;
      }
      return null;
    },
    getExpressionTarget(ast) {
      return ngpBound.getExpressionTarget(ast);
    },
    getUsedDirectives() {
      return ngpBound
        .getUsedDirectives()
        .filter((d) => declarationsByName.has(d.ref.node.name))
        .map((dir) => ({
          ref: {node: declarationsByName.get(dir.ref.node.name)!},
          isComponent: dir.isComponent,
        }));
    },
    getTemplateAst() {
      return ngpBound.getTemplateAst();
    },
    getPipe(name) {
      const pipe = ngpBound.getPipe(name);
      if (!pipe) {
        return null;
      }
      const decl = declarationsByName.get(pipe.ref.node.name);
      return decl ? {ref: {node: decl}} : null;
    },
  };
}

/**
 * Creates an NGP-backed compiler instance for `NgCompiler` core unit tests (`compiler_spec.ts`).
 */
export function createNgpTestCompiler(
  fs: FileSystem,
  inputFiles: readonly string[],
  options: api.CompilerOptions,
  program: ts.Program,
) {
  let currentResult!: NgpCompilationResult;
  const metadataByFile = new Map<
    AbsoluteFsPath,
    NonNullable<ReturnType<HybridCompiler['analyzer']['getMetadataForFileSync']>>
  >();

  const runCompile = () => {
    metadataByFile.clear();
    const res = performNgpCompilationSync({
      fs,
      basePath: fs.resolve('/'),
      tsconfigPath: fs.resolve('/tsconfig.json'),
      rootNames: inputFiles,
      options,
      emit: false,
      closeAnalyzer: false,
      templateDiagnosticsOnly: true,
    });
    try {
      for (const rootName of inputFiles) {
        const fsPath = fs.resolve(rootName);
        const meta = res.compiler.analyzer.getMetadataForFileSync(toPosixPath(fsPath));
        if (meta) {
          metadataByFile.set(fsPath, meta);
        }
      }
    } finally {
      res.compiler.analyzer.close();
    }
    currentResult = res;
  };

  runCompile();

  const findClassInSourceFile = (sf: ts.SourceFile, name: string): DeclarationNode | null => {
    for (const stmt of sf.statements) {
      if (ts.isClassDeclaration(stmt) && stmt.name?.text === name) {
        return stmt as DeclarationNode;
      }
    }
    return null;
  };

  const compilerInstance = {
    getDiagnosticsForFile(file: ts.SourceFile): ts.Diagnostic[] {
      const targetFsPath = fs.resolve(file.fileName);
      const relatedPaths = new Set<AbsoluteFsPath>([targetFsPath]);
      const meta = metadataByFile.get(targetFsPath);
      if (meta) {
        for (const cls of meta.classes) {
          if (cls.component?.templateUrl?.resolvedPath) {
            relatedPaths.add(fromPosixPath(fs, cls.component.templateUrl.resolvedPath));
          }
        }
      }
      return currentResult.diagnostics.filter(
        (d) => d.file !== undefined && relatedPaths.has(fs.resolve(d.file.fileName)),
      );
    },
    getComponentsWithTemplateFile(templateFilePath: string): ReadonlySet<DeclarationNode> {
      const targetTemplatePath = fs.resolve(templateFilePath);
      const matches = new Set<DeclarationNode>();
      for (const [fileFsPath, meta] of metadataByFile.entries()) {
        for (const cls of meta.classes) {
          if (
            cls.className &&
            cls.component?.templateUrl?.resolvedPath &&
            fromPosixPath(fs, cls.component.templateUrl.resolvedPath) === targetTemplatePath
          ) {
            const sf = program.getSourceFile(fileFsPath);
            const decl = sf ? findClassInSourceFile(sf, cls.className) : null;
            if (decl) {
              matches.add(decl);
            }
          }
        }
      }
      return matches;
    },
    getComponentsWithStyleFile(styleFilePath: string): ReadonlySet<DeclarationNode> {
      const targetStylePath = fs.resolve(styleFilePath);
      const matches = new Set<DeclarationNode>();
      for (const [fileFsPath, meta] of metadataByFile.entries()) {
        for (const cls of meta.classes) {
          if (
            cls.className &&
            cls.component?.styleUrls?.some(
              (s) => fromPosixPath(fs, s.resolvedPath) === targetStylePath,
            )
          ) {
            const sf = program.getSourceFile(fileFsPath);
            const decl = sf ? findClassInSourceFile(sf, cls.className) : null;
            if (decl) {
              matches.add(decl);
            }
          }
        }
      }
      return matches;
    },
    getDirectiveResources(decl: DeclarationNode) {
      const sf = decl.getSourceFile();
      const meta = metadataByFile.get(fs.resolve(sf.fileName));
      const className = ts.isClassDeclaration(decl) && decl.name ? decl.name.text : '';
      const cls = meta?.classes.find((c) => c.className === className);
      if (!cls?.component) {
        return null;
      }
      const template = cls.component.templateUrl?.resolvedPath
        ? {
            path: fromPosixPath(fs, cls.component.templateUrl.resolvedPath),
            expression: decl as unknown as ts.Expression,
          }
        : null;
      const styles = new Set<{path: AbsoluteFsPath; expression: ts.Expression}>();
      for (const s of cls.component.styleUrls ?? []) {
        if (
          s.stringLiteralSpan &&
          s.stringLiteralSpan.start >= cls.decoratedSpan.start &&
          s.stringLiteralSpan.end <= cls.decoratedSpan.end
        ) {
          styles.add({
            path: fromPosixPath(fs, s.resolvedPath),
            expression: decl as unknown as ts.Expression,
          });
        }
      }
      return {template, styles, hostBindings: new Set()};
    },
    getResourceDependencies(file: ts.SourceFile): string[] {
      const meta = metadataByFile.get(fs.resolve(file.fileName));
      if (!meta) {
        return [];
      }
      const deps: string[] = [];
      for (const cls of meta.classes) {
        if (cls.component?.templateUrl?.resolvedPath) {
          deps.push(fromPosixPath(fs, cls.component.templateUrl.resolvedPath));
        }
        for (const s of cls.component?.styleUrls ?? []) {
          deps.push(fromPosixPath(fs, s.resolvedPath));
        }
      }
      return deps;
    },
    applyResourceChange() {
      runCompile();
      return compilerInstance;
    },
  };

  return compilerInstance;
}
