/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import path from 'path';

import {createFileSystemTsReadDirectoryFn, FileSystem, getFileSystem} from './ngtsc/file_system';
import {absoluteFrom, AbsoluteFsPath} from './ngtsc/file_system';
import {
  freshCompilationTicket,
  incrementalFromCompilerTicket,
  NgCompiler,
  NgCompilerHost,
} from './ngtsc/core';
import {TrackedIncrementalBuildStrategy} from './ngtsc/incremental';
import {TsCreateProgramDriver} from './ngtsc/program_driver';
import {retagAllTsFiles} from './ngtsc/shims';
import {OptimizeFor} from './ngtsc/typecheck/api';
import * as api from './transformers/api';
import {readConfiguration} from './perform_compile';
import {setGetSourceFileAsHashVersioned} from './typescript_support';
import {
  computeModifiedTsFilesForResourceChange,
  isWatchedResourceFile,
} from './build_mode_watch_utils';
import {extractTsBuildInfoPathFromDiagnostic} from './build_mode_tsbuildinfo_recovery';

/**
 * Exit code mapping for build mode.
 *
 * `ts.ExitStatus` is not a strict superset of Node process exit codes, but this
 * mapping matches the general expectations of `tsc`.
 */
function exitCodeFromBuildStatus(status: ts.ExitStatus): number {
  switch (status) {
    case ts.ExitStatus.Success:
      return 0;
    case ts.ExitStatus.DiagnosticsPresent_OutputsGenerated:
      return 1;
    case ts.ExitStatus.DiagnosticsPresent_OutputsSkipped:
      return 1;
    default:
      return 2;
  }
}

function createSystemFromFileSystem(fs: FileSystem): ts.System {
  // Start from ts.sys so we keep any platform-specific behaviors (newLine, etc)
  // and selectively override file system access so tests using MockFileSystem
  // are respected.
  const sys: ts.System = {
    ...ts.sys,
    args: ts.sys.args,
    newLine: ts.sys.newLine,
    useCaseSensitiveFileNames: fs.isCaseSensitive(),
    getCurrentDirectory: () => fs.pwd(),
    fileExists: (p: string) => fs.exists(fs.resolve(p)),
    readFile: (p: string, _encoding?: string) => {
      // TS passes `undefined` encoding for utf-8 reads.
      // MockFileSystem returns strings.
      try {
        return fs.readFile(fs.resolve(p));
      } catch {
        // TypeScript expects `undefined` when a read fails.
        return undefined;
      }
    },
    writeFile: (p: string, data: string, _writeByteOrderMark: boolean) => {
      const abs = fs.resolve(p);
      fs.ensureDir(fs.dirname(abs));
      fs.writeFile(abs, data);
    },
    deleteFile: (p: string) => {
      const abs = fs.resolve(p);
      if (fs.exists(abs)) {
        fs.removeFile(abs);
      }
    },
    directoryExists: (p: string) => {
      const abs = fs.resolve(p);
      return fs.exists(abs) && fs.lstat(abs).isDirectory();
    },
    createDirectory: (p: string) => {
      fs.ensureDir(fs.resolve(p));
    },
    getDirectories: (p: string) => {
      const abs = fs.resolve(p);
      if (!fs.exists(abs) || !fs.lstat(abs).isDirectory()) {
        return [];
      }
      return fs
        .readdir(abs)
        .filter((entry) => {
          const candidate = fs.resolve(abs, entry);
          return fs.exists(candidate) && fs.lstat(candidate).isDirectory();
        })
        .map((entry) => entry);
    },
    readDirectory: createFileSystemTsReadDirectoryFn(fs),
    resolvePath: (p: string) => fs.resolve(p),
    realpath: (p: string) => {
      try {
        return fs.realpath(fs.resolve(p));
      } catch {
        // If realpath fails (e.g., path doesn't exist), return the resolved path.
        return fs.resolve(p);
      }
    },
    // For build-mode watch (`ngc -b -w`), TypeScript uses these sys watchers.
    watchFile: ts.sys.watchFile,
    watchDirectory: ts.sys.watchDirectory,
  };
  return sys;
}

/**
 * Narrow typings for TypeScript internals we intentionally rely on.
 *
 * `ts.toPath` and `ParsedCommandLine.options.configFile` are runtime-available in TS,
 * but are not part of the public `typescript.d.ts` API surface.
 */
type TsInternal = typeof ts & {
  toPath(
    fileName: string,
    currentDirectory: string,
    getCanonicalFileName: (f: string) => string,
  ): string;
};

type InternalConfigFile = ts.SourceFile & {
  path?: string;
  resolvedPath?: string;
  originalFileName?: string;
};

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isInternalConfigFile(value: unknown): value is InternalConfigFile {
  // `ts.SourceFile` objects always have a string `fileName` at runtime.
  return isNonNullObject(value) && typeof (value as {fileName?: unknown}).fileName === 'string';
}

type BuilderProgram = ts.EmitAndSemanticDiagnosticsBuilderProgram;

interface AngularBuildContext {
  compiler: NgCompiler;
  incrementalStrategy: TrackedIncrementalBuildStrategy;
  inputFiles: readonly string[];
}

/**
 * Run `ngc` in TypeScript build-mode (`--build` / `-b`).
 *
 * This integrates Angular compilation into TypeScript's solution builder so that:
 * - `references` are built in topological order,
 * - `.tsbuildinfo` is produced/consumed for incremental builds,
 * - Angular diagnostics can fail the build.
 */
export function mainBuildMode(args: string[], consoleError: (s: string) => void): number {
  const fs = getFileSystem();
  const sys = createSystemFromFileSystem(fs);

  const parsed = ts.parseBuildCommand(args);
  if (parsed.errors.length > 0) {
    for (const diag of parsed.errors) {
      consoleError(
        ts.formatDiagnostic(diag, {
          getCurrentDirectory: () => sys.getCurrentDirectory(),
          getCanonicalFileName: (f) => f,
          getNewLine: () => sys.newLine,
        }),
      );
    }
    return 1;
  }

  const projects = parsed.projects.length > 0 ? parsed.projects : ['.'];

  const angularContextsByConfig = new Map<string, AngularBuildContext>();
  const ignoredForEmit = new WeakSet<ts.SourceFile>();
  const resourceOwnersByConfig = new Map<string, Map<string, Set<string>>>();
  const modifiedResourceFilesByConfig = new Map<string, Set<AbsoluteFsPath>>();

  const isWatchBuildMode = parsed.watchOptions !== undefined;

  // Watch-mode only: watch the exact set of template/style resources discovered by Angular.
  const watchedResourceFiles = new Map<string, ts.FileWatcher>();
  const watchedResourceRefCounts = new Map<string, number>();
  const watchedResourcesByConfig = new Map<string, Set<string>>();
  // Watch-mode only: watch i18n/config files not tracked as Angular resources.
  let watchedProjectDirs: ts.FileWatcher[] = [];

  // tsbuildinfo recovery: on read/parse failures, delete the .tsbuildinfo and retry once.
  const deletedBuildInfoFiles = new Set<string>();
  let scheduleRecoveryBuild: (() => void) | null = null;

  // Watch-mode only: invoked when a resource/i18n/config file changes.
  let onResourceChange: ((changedPath: string) => void) | null = null;

  const reportDiagnostic: ts.DiagnosticReporter = (d) => {
    const buildInfoPath = extractTsBuildInfoPathFromDiagnostic(d);
    if (buildInfoPath !== null && !deletedBuildInfoFiles.has(buildInfoPath)) {
      deletedBuildInfoFiles.add(buildInfoPath);
      try {
        const deleteFile = sys.deleteFile ?? ts.sys.deleteFile;
        deleteFile?.(buildInfoPath);
        consoleError(`[ngc build-mode] deleted build info: ${buildInfoPath}`);
      } catch {
        // Best-effort recovery; ignore failures if the file cannot be deleted.
      }
      scheduleRecoveryBuild?.();
    }

    consoleError(
      ts.formatDiagnostic(d, {
        getCurrentDirectory: () => sys.getCurrentDirectory(),
        getCanonicalFileName: (f) => f,
        getNewLine: () => sys.newLine,
      }),
    );
  };

  const writeFile: ts.WriteFileCallback = (
    fileName,
    data,
    writeByteOrderMark,
    onError,
    sourceFiles,
  ) => {
    if (sourceFiles !== undefined) {
      for (const sf of sourceFiles) {
        if (ignoredForEmit.has(sf)) {
          return;
        }
      }
    }
    sys.writeFile(fileName, data, writeByteOrderMark);
  };

  const reportStatus: ts.DiagnosticReporter = reportDiagnostic;

  const addResourceWatch = (resourcePath: string) => {
    if (!isWatchBuildMode || onResourceChange === null) {
      return;
    }
    const watchFile = sys.watchFile ?? ts.sys.watchFile;
    if (watchFile === undefined) {
      return;
    }
    const prev = watchedResourceRefCounts.get(resourcePath) ?? 0;
    watchedResourceRefCounts.set(resourcePath, prev + 1);
    if (prev !== 0) {
      return;
    }
    const watcher = watchFile(resourcePath, (fileName) => onResourceChange?.(fileName));
    watchedResourceFiles.set(resourcePath, watcher);
  };

  const removeResourceWatch = (resourcePath: string) => {
    const prev = watchedResourceRefCounts.get(resourcePath);
    if (prev === undefined) {
      return;
    }
    if (prev <= 1) {
      watchedResourceRefCounts.delete(resourcePath);
      const watcher = watchedResourceFiles.get(resourcePath);
      watchedResourceFiles.delete(resourcePath);
      try {
        watcher?.close();
      } catch {
        // Best-effort cleanup; ignore failures during watcher shutdown.
      }
      return;
    }
    watchedResourceRefCounts.set(resourcePath, prev - 1);
  };

  if (parsed.watchOptions !== undefined) {
    const reportWatchStatus: ts.WatchStatusReporter = (d) => {
      // `WatchStatusReporter` signature includes extra args, but only the diagnostic is used here.
      reportDiagnostic(d);
    };

    const watchHost = ts.createSolutionBuilderWithWatchHost<BuilderProgram>(
      sys,
      createNgcBuilderProgram,
      reportDiagnostic,
      reportStatus,
      reportWatchStatus,
    );
    configureHost(watchHost);

    const builder = ts.createSolutionBuilderWithWatch(
      watchHost,
      projects,
      parsed.buildOptions,
      parsed.watchOptions,
    );

    // Add an additional watch layer for Angular resources.
    //
    // TypeScript build-mode watch primarily reacts to changes in TS inputs. Angular depends on
    // external resources (templates/styles) and (optionally) other inputs like translation files.
    //
    // We watch templates/styles via `sys.watchFile` (registered later once resources are known)
    // and watch i18n/config-like files via `sys.watchDirectory` in project roots.
    const projectDirs = projects.length
      ? projects.map((proj) => path.dirname(sys.resolvePath(proj)))
      : [sys.getCurrentDirectory()];

    const debugWatch =
      process.env['NGC_BUILD_MODE_WATCH_DEBUG'] === '1' ||
      process.env['NGC_BUILD_MODE_WATCH_DEBUG'] === 'true';
    let resourceEvents = 0;
    let triggeredBuilds = 0;

    let scheduledRebuild: any = null;
    const scheduleResourceRebuild = () => {
      if (scheduledRebuild !== null) {
        return;
      }
      const setTimeoutFn = sys.setTimeout ?? setTimeout;
      scheduledRebuild = setTimeoutFn(() => {
        scheduledRebuild = null;
        // A resource change (template/style/i18n) won't necessarily change TS input text.
        // TS solution builder may treat such a change as "pseudo up-to-date" and only update
        // output timestamps, which would prevent Angular from reprocessing resources.
        // Temporarily enable `--force` so the build graph is rebuilt and Angular's incremental
        // compiler can apply the resource invalidation.
        const prevForce = parsed.buildOptions.force;
        parsed.buildOptions.force = true;
        const start = Date.now();
        let status: ts.ExitStatus;
        try {
          status = builder.build(undefined, undefined, writeFile);
        } finally {
          parsed.buildOptions.force = prevForce;
        }
        triggeredBuilds++;
        if (debugWatch) {
          consoleError(
            `[ngc build-mode watch] build #${triggeredBuilds} status=${status} (${Date.now() - start}ms)`,
          );
        }
      }, 50);
    };

    onResourceChange = (changedPath: string) => {
      const normalized = sys.resolvePath(changedPath);
      if (!isWatchedResourceFile(normalized)) {
        return;
      }

      resourceEvents++;
      if (debugWatch) {
        consoleError(
          `[ngc build-mode watch] event #${resourceEvents} change detected: ${normalized}`,
        );
      }

      for (const [configFilePath, resourceOwners] of resourceOwnersByConfig.entries()) {
        const ctx = angularContextsByConfig.get(configFilePath);
        const change = computeModifiedTsFilesForResourceChange(
          normalized,
          configFilePath,
          resourceOwners,
          ctx,
        );
        if (change === null) {
          continue;
        }

        if (change.recordAsResource) {
          let modified = modifiedResourceFilesByConfig.get(configFilePath);
          if (modified === undefined) {
            modified = new Set();
            modifiedResourceFilesByConfig.set(configFilePath, modified);
          }
          modified.add(absoluteFrom(normalized));
        }

        for (const tsFile of change.tsFiles) {
          watchHost.setModifiedTime(tsFile, new Date());
        }
      }

      scheduleResourceRebuild();
    };

    // Used by tsbuildinfo recovery.
    scheduleRecoveryBuild = scheduleResourceRebuild;

    const ignoredPath = (p: string): boolean => {
      const normalized = p.replace(/\\/g, '/');
      return (
        /(^|\/)\./.test(normalized) ||
        normalized.includes('/node_modules/') ||
        normalized.includes('/dist/') ||
        normalized.includes('/bazel-out/') ||
        normalized.includes('/bazel-bin/') ||
        normalized.includes('/bazel-testlogs/') ||
        normalized.includes('/built/')
      );
    };

    // Watch for translation/config changes (not discovered via getResourceDependencies).
    const watchDirectory = sys.watchDirectory ?? ts.sys.watchDirectory;
    watchedProjectDirs =
      watchDirectory === undefined
        ? []
        : projectDirs.map((dir) =>
            watchDirectory(
              dir,
              (fileName) => {
                if (ignoredPath(fileName)) {
                  return;
                }
                const watchJson =
                  process.env['NGC_BUILD_MODE_WATCH_JSON'] === '1' ||
                  process.env['NGC_BUILD_MODE_WATCH_JSON'] === 'true';
                // Note: json is a broad category; keep it opt-in.
                if (
                  !/\.(xlf|xliff|xmb)$/.test(fileName) &&
                  !(watchJson && fileName.endsWith('.json'))
                ) {
                  return;
                }
                onResourceChange?.(fileName);
              },
              /* recursive */ true,
            ),
          );

    // Ensure watchers are closed on process exit or signals.
    const closeWatchers = () => {
      for (const w of watchedResourceFiles.values()) {
        try {
          w.close();
        } catch {
          // Best-effort cleanup; ignore failures during shutdown.
        }
      }
      watchedResourceFiles.clear();

      for (const w of watchedProjectDirs) {
        try {
          w.close();
        } catch {
          // Best-effort cleanup; ignore failures during shutdown.
        }
      }
      watchedProjectDirs = [];

      if (debugWatch) {
        consoleError(
          `[ngc build-mode watch] summary: resourceEvents=${resourceEvents}, buildsTriggered=${triggeredBuilds}`,
        );
      }
    };
    process.on('SIGINT', () => closeWatchers());
    process.on('SIGTERM', () => closeWatchers());
    process.on('exit', () => closeWatchers());

    const status =
      parsed.buildOptions['clean'] === true
        ? builder.clean()
        : builder.build(undefined, undefined, writeFile);
    return exitCodeFromBuildStatus(status);
  } else {
    const host = ts.createSolutionBuilderHost<BuilderProgram>(
      sys,
      createNgcBuilderProgram,
      reportDiagnostic,
      reportStatus,
    );
    configureHost(host);

    const builder = ts.createSolutionBuilder(host, projects, parsed.buildOptions);
    if (parsed.buildOptions['clean'] === true) {
      return exitCodeFromBuildStatus(builder.clean());
    }

    const status1 = builder.build(undefined, undefined, writeFile);
    if (status1 === ts.ExitStatus.Success || deletedBuildInfoFiles.size === 0) {
      return exitCodeFromBuildStatus(status1);
    }

    // Retry once after deleting the tsbuildinfo file(s).
    const status2 = builder.build(undefined, undefined, writeFile);
    return exitCodeFromBuildStatus(status2);
  }

  function createNgcBuilderProgram(
    rootNames: readonly string[] | undefined,
    options: ts.CompilerOptions | undefined,
    delegateHost?: ts.CompilerHost,
    oldProgram?: BuilderProgram,
    configFileParsingDiagnostics?: readonly ts.Diagnostic[],
    projectReferences?: readonly ts.ProjectReference[] | undefined,
  ): BuilderProgram {
    const effectiveOptions = (options ?? {}) as api.CompilerOptions;
    const compilerHost = delegateHost ?? ts.createIncrementalCompilerHost(effectiveOptions, sys);

    // Override lib file resolution to use the Angular file system abstraction.
    // This is necessary so tests using MockFileSystem can resolve lib files from
    // /node_modules/typescript/lib instead of the real TS installation path.
    const defaultLibLocation = fs.getDefaultLibLocation();
    compilerHost.getDefaultLibLocation = () => defaultLibLocation;
    const originalGetDefaultLibFileName = compilerHost.getDefaultLibFileName?.bind(compilerHost);
    compilerHost.getDefaultLibFileName = (compileOptions) => {
      const libFileName = originalGetDefaultLibFileName
        ? originalGetDefaultLibFileName(compileOptions)
        : ts.getDefaultLibFileName(compileOptions);
      // If the delegate already returns a full path, use it; otherwise join with lib location.
      if (libFileName.includes('/') || libFileName.includes('\\')) {
        return libFileName;
      }
      return fs.join(defaultLibLocation as AbsoluteFsPath, libFileName);
    };

    if (oldProgram !== undefined) {
      retagAllTsFiles(oldProgram.getProgram());
    }

    // Wrap the compiler host so Angular shims are part of the program.
    const ngHost = NgCompilerHost.wrap(
      compilerHost,
      [...(rootNames ?? [])],
      effectiveOptions,
      oldProgram?.getProgram() ?? null,
    );

    // TS BuilderPrograms require every SourceFile to have a `version`.
    // Angular's `NgCompilerHost` can synthesize shim files which would otherwise
    // miss a version and trip TS's builder invariant.
    setGetSourceFileAsHashVersioned(ngHost);

    // TS 5.9+ asserts that `commandLine.options.configFile.path` matches the canonical
    // `toPath(refPath)` when parsing project references.
    // In our setup, the parsed config SourceFile can carry a non-canonical `path` (e.g. due to
    // differing normalization between layers), which triggers a Debug Failure in
    // `parseProjectReferenceConfigFile`.
    if (ngHost.getParsedCommandLine !== undefined) {
      const originalGetParsedCommandLine = ngHost.getParsedCommandLine;
      ngHost.getParsedCommandLine = (fileName: string) => {
        const commandLine = originalGetParsedCommandLine(fileName);
        // Note: `options.configFile` is an internal field set by TS config parsing.
        const configFile = (commandLine?.options as unknown as {configFile?: unknown} | undefined)
          ?.configFile;
        if (isInternalConfigFile(configFile)) {
          // `ts.toPath` is internal, but it is exactly what TS uses to derive `sourceFilePath`
          // when asserting invariants in `parseProjectReferenceConfigFile`.
          const expectedPath = (ts as unknown as TsInternal).toPath(
            fileName,
            ngHost.getCurrentDirectory(),
            ngHost.getCanonicalFileName,
          );

          if (configFile.path !== expectedPath) {
            // These fields are internal on TS config SourceFiles, but are required to be
            // consistent for TS project reference parsing.
            configFile.fileName = fileName;
            configFile.originalFileName = fileName;
            configFile.path = expectedPath;
            configFile.resolvedPath = expectedPath;
          }
        }
        return commandLine;
      };
    }

    const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      ngHost.inputFiles,
      effectiveOptions,
      ngHost,
      oldProgram,
      configFileParsingDiagnostics,
      projectReferences,
    );

    const tsProgram = builderProgram.getProgram();
    const programDriver = new TsCreateProgramDriver(
      tsProgram,
      ngHost,
      effectiveOptions,
      ngHost.shimExtensionPrefixes,
    );
    const configFilePathRaw = (effectiveOptions as ts.CompilerOptions & {configFilePath?: unknown})
      .configFilePath;
    const configFilePath = sys.resolvePath(
      typeof configFilePathRaw === 'string' ? configFilePathRaw : '',
    );

    const prev = configFilePath ? angularContextsByConfig.get(configFilePath) : undefined;
    const incrementalStrategy =
      prev !== undefined
        ? prev.incrementalStrategy.toNextBuildStrategy()
        : new TrackedIncrementalBuildStrategy();

    const modifiedResourceFiles =
      configFilePath && modifiedResourceFilesByConfig.has(configFilePath)
        ? modifiedResourceFilesByConfig.get(configFilePath)!
        : new Set<AbsoluteFsPath>();
    if (configFilePath) {
      modifiedResourceFilesByConfig.delete(configFilePath);
    }

    const ticket =
      prev === undefined
        ? freshCompilationTicket(
            tsProgram,
            effectiveOptions,
            incrementalStrategy,
            programDriver,
            /* perfRecorder */ null,
            /* enableTemplateTypeChecker */ true,
            /* usePoisonedData */ false,
          )
        : incrementalFromCompilerTicket(
            prev.compiler,
            tsProgram,
            incrementalStrategy,
            programDriver,
            /* modifiedResourceFiles */ modifiedResourceFiles,
            /* perfRecorder */ null,
          );

    const ngCompiler = NgCompiler.fromTicket(ticket, ngHost);

    // Track files which should not be emitted.
    for (const sf of ngCompiler.ignoreForEmit) {
      ignoredForEmit.add(sf);
    }

    // Track resource ownership so build-mode watch can rebuild on template/style changes.
    if (configFilePath) {
      const owners = new Map<string, Set<string>>();
      for (const sf of tsProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        const deps = ngCompiler.getResourceDependencies(sf);
        for (const dep of deps) {
          const depPath = sys.resolvePath(dep);
          let set = owners.get(depPath);
          if (set === undefined) {
            set = new Set();
            owners.set(depPath, set);
          }
          set.add(sys.resolvePath(sf.fileName));
        }
      }
      resourceOwnersByConfig.set(configFilePath, owners);

      if (isWatchBuildMode) {
        const nextWatched = new Set<string>(owners.keys());
        const prevWatched = watchedResourcesByConfig.get(configFilePath) ?? new Set<string>();

        for (const prevPath of prevWatched) {
          if (!nextWatched.has(prevPath)) {
            removeResourceWatch(prevPath);
          }
        }

        for (const nextPath of nextWatched) {
          if (!prevWatched.has(nextPath)) {
            addResourceWatch(nextPath);
          }
        }

        watchedResourcesByConfig.set(configFilePath, nextWatched);
      }
    }

    // Associate this project with its Angular compiler for transformers and incremental reuse.
    if (configFilePath) {
      angularContextsByConfig.set(configFilePath, {
        compiler: ngCompiler,
        incrementalStrategy,
        inputFiles: ngHost.inputFiles.map((f) => sys.resolvePath(f)),
      });
    }

    // Wrap diagnostics so Angular errors fail the build.
    return wrapBuilderProgramWithAngularDiagnostics(builderProgram, ngCompiler);
  }

  function configureHost(host: ts.SolutionBuilderHostBase<BuilderProgram>): void {
    // Ensure TS uses Angular-aware config parsing so `angularCompilerOptions` are merged.
    host.getParsedCommandLine = (configFileName) => {
      const resolvedConfigPath = sys.resolvePath(configFileName);
      const cfg = readConfiguration(configFileName, /* existingOptions */ undefined, fs);
      // TypeScript normally sets `configFilePath` when it parses config files. Because ngc supplies
      // a custom parser (to merge `angularCompilerOptions`), we need to ensure this field is set so
      // build mode can associate projects with their Angular compilation context.
      (cfg.options as ts.CompilerOptions & {configFilePath?: string}).configFilePath =
        resolvedConfigPath;

      // TS 5.9+ asserts that `options.configFile.path` matches `ts.toPath(configFileName, ...)`.
      // When Angular's readConfiguration is used, this internal field is not set, causing a
      // Debug Failure in `parseProjectReferenceConfigFile`.
      // Create a synthetic configFile SourceFile with the expected internal fields.
      const expectedPath = (ts as unknown as TsInternal).toPath(
        resolvedConfigPath,
        sys.getCurrentDirectory(),
        (f) => (fs.isCaseSensitive() ? f : f.toLowerCase()),
      );
      const configFileContent = fs.readFile(fs.resolve(configFileName));
      const configSourceFile = ts.createSourceFile(
        resolvedConfigPath,
        configFileContent,
        ts.ScriptTarget.JSON,
        /* setParentNodes */ false,
        ts.ScriptKind.JSON,
      ) as InternalConfigFile;
      configSourceFile.path = expectedPath;
      configSourceFile.resolvedPath = expectedPath;
      configSourceFile.originalFileName = resolvedConfigPath;
      (cfg.options as ts.CompilerOptions & {configFile?: ts.SourceFile}).configFile =
        configSourceFile;

      return {
        options: cfg.options as ts.CompilerOptions,
        fileNames: cfg.rootNames,
        projectReferences: cfg.projectReferences,
        errors: cfg.errors,
      };
    };

    host.getCustomTransformers = (project) => {
      const ctx = angularContextsByConfig.get(sys.resolvePath(project));
      if (ctx === undefined) {
        return undefined;
      }
      return ctx.compiler.prepareEmit().transformers;
    };
  }
}

function wrapBuilderProgramWithAngularDiagnostics(
  delegate: BuilderProgram,
  ngCompiler: NgCompiler,
): BuilderProgram {
  const wrapped = Object.create(delegate) as BuilderProgram;

  wrapped.getOptionsDiagnostics = (cancellationToken?: ts.CancellationToken) => {
    return [
      ...delegate.getOptionsDiagnostics(cancellationToken),
      ...ngCompiler.getOptionDiagnostics(),
    ];
  };

  wrapped.getSemanticDiagnostics = (
    sourceFile?: ts.SourceFile,
    cancellationToken?: ts.CancellationToken,
  ) => {
    const tsDiags = delegate.getSemanticDiagnostics(sourceFile, cancellationToken);
    if (sourceFile === undefined) {
      return [...tsDiags, ...ngCompiler.getDiagnostics()];
    }
    return [...tsDiags, ...ngCompiler.getDiagnosticsForFile(sourceFile, OptimizeFor.SingleFile)];
  };

  return wrapped;
}
