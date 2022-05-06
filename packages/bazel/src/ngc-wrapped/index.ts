/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// `tsc-wrapped` helpers are not exposed in the primary `@bazel/concatjs` entry-point.
// TODO: Update when https://github.com/bazelbuild/rules_nodejs/pull/3286 is available.
import {BazelOptions as ExternalBazelOptions, CachedFileLoader, CompilerHost, constructManifest, debug, FileCache, FileLoader, parseTsconfig, resolveNormalizedPath, runAsWorker, runWorkerLoop, UncachedFileLoader} from '@bazel/concatjs/internal/tsc_wrapped';

import type {AngularCompilerOptions, CompilerHost as NgCompilerHost, TsEmitCallback, Program, CompilerOptions} from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import ts from 'typescript';
import {pathToFileURL} from 'url';

type CompilerCliModule =
    typeof import('@angular/compiler-cli')&typeof import('@angular/compiler-cli/private/bazel');

// Add devmode for blaze internal
interface BazelOptions extends ExternalBazelOptions {
  allowedInputs?: string[];
  devmode?: boolean;
  unusedInputsListPath?: string;
}

/**
 * Reference to the previously loaded `compiler-cli` module exports. We cache the exports
 * as `ngc-wrapped` can run as part of a worker where the Angular compiler should not be
 * resolved through a dynamic import for every build.
 */
let _cachedCompilerCliModule: CompilerCliModule|null = null;

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NGC_GEN_FILES = /^(.*?)\.(ngfactory|ngsummary|ngstyle|shim\.ngstyle)(.*)$/;
// FIXME: we should be able to add the assets to the tsconfig so FileLoader
// knows about them
const NGC_ASSETS = /\.(css|html|ngsummary\.json)$/;

const BAZEL_BIN = /\b(blaze|bazel)-out\b.*?\bbin\b/;

// Note: We compile the content of node_modules with plain ngc command line.
const ALL_DEPS_COMPILED_WITH_BAZEL = false;

const NODE_MODULES = 'node_modules/';

export async function main(args) {
  if (runAsWorker(args)) {
    await runWorkerLoop(runOneBuild);
  } else {
    return await runOneBuild(args) ? 0 : 1;
  }
  return 0;
}

/** The one FileCache instance used in this process. */
const fileCache = new FileCache<ts.SourceFile>(debug);

/**
 * Loads a module that can either be CommonJS or an ESModule. This is done
 * as interop with the current devmode CommonJS and prodmode ESM output.
 */
async function loadModuleInterop<T>(moduleName: string): Promise<T> {
  // Note: This assumes that there are no conditional exports switching between `import`
  // or `require`. We cannot fully rely on the dynamic import expression here because the
  // Bazel NodeJS rules do not patch the `import` NodeJS module resolution, and this would
  // make ngc-wrapped dependent on the linker. The linker is not enabled when the `ngc-wrapped`
  // binary is shipped in the NPM package and is not available in Google3 either.
  const resolvedUrl = pathToFileURL(require.resolve(moduleName));
  const exports: Partial<T>&{default?: T} =
      await new Function('m', `return import(m);`)(resolvedUrl);
  return exports.default ?? exports as T;
}

/**
 * Fetches the Angular compiler CLI module dynamically, allowing for an ESM
 * variant of the compiler.
 */
async function fetchCompilerCliModule(): Promise<CompilerCliModule> {
  if (_cachedCompilerCliModule !== null) {
    return _cachedCompilerCliModule;
  }

  // Note: We load the compiler-cli package dynamically using `loadModuleInterop` as
  // this script runs as CommonJS module but the compiler-cli could be built as strict ESM
  // package. Unfortunately we have a mix of CommonJS and ESM output here because the devmode
  // output is still using CommonJS and this is primarily used for testing. Also inside G3,
  // the devmode output will remain CommonJS regardless for now.
  // TODO: Fix this up once devmode and prodmode are combined and we use ESM everywhere.
  const compilerExports =
      await loadModuleInterop<typeof import('@angular/compiler-cli')>('@angular/compiler-cli');
  const compilerPrivateExports =
      await loadModuleInterop<typeof import('@angular/compiler-cli/private/bazel')>(
          '@angular/compiler-cli/private/bazel');
  return _cachedCompilerCliModule = {...compilerExports, ...compilerPrivateExports};
}

export async function runOneBuild(
    args: string[], inputs?: {[path: string]: string}): Promise<boolean> {
  if (args[0] === '-p') {
    args.shift();
  }

  // Strip leading at-signs, used to indicate a params file
  const project = args[0].replace(/^@+/, '');
  const ng = await fetchCompilerCliModule();

  const [parsedOptions, errors] = parseTsconfig(project);
  if (errors?.length) {
    console.error(ng.formatDiagnostics(errors));
    return false;
  }

  const {bazelOpts, options: tsOptions, files, config} = parsedOptions;
  const {errors: userErrors, options: userOptions} = ng.readConfiguration(project);

  if (userErrors?.length) {
    console.error(ng.formatDiagnostics(userErrors));
    return false;
  }

  const allowedNgCompilerOptionsOverrides = new Set<string>([
    'diagnostics',
    'trace',
    'disableExpressionLowering',
    'disableTypeScriptVersionCheck',
    'i18nOutLocale',
    'i18nOutFormat',
    'i18nOutFile',
    'i18nInLocale',
    'i18nInFile',
    'i18nInFormat',
    'i18nUseExternalIds',
    'i18nInMissingTranslations',
    'preserveWhitespaces',
    'createExternalSymbolFactoryReexports',
  ]);

  const userOverrides = Object.entries(userOptions)
                            .filter(([key]) => allowedNgCompilerOptionsOverrides.has(key))
                            .reduce((obj, [key, value]) => {
                              obj[key] = value;

                              return obj;
                            }, {});

  const compilerOpts: AngularCompilerOptions = {
    ...userOverrides,
    ...config['angularCompilerOptions'],
    ...tsOptions,
  };

  // These are options passed through from the `ng_module` rule which aren't supported
  // by the `@angular/compiler-cli` and are only intended for `ngc-wrapped`.
  const {expectedOut, _useManifestPathsAsModuleName} = config['angularCompilerOptions'];

  const tsHost = ts.createCompilerHost(compilerOpts, true);
  const {diagnostics} = compile({
    allDepsCompiledWithBazel: ALL_DEPS_COMPILED_WITH_BAZEL,
    useManifestPathsAsModuleName: _useManifestPathsAsModuleName,
    expectedOuts: expectedOut,
    compilerOpts,
    tsHost,
    bazelOpts,
    files,
    inputs,
    ng,
  });
  if (diagnostics.length) {
    console.error(ng.formatDiagnostics(diagnostics));
  }
  return diagnostics.every(d => d.category !== ts.DiagnosticCategory.Error);
}

export function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  // NB: the rootDirs should have been sorted longest-first
  for (let i = 0; i < rootDirs.length; i++) {
    const dir = rootDirs[i];
    const rel = path.posix.relative(dir, filePath);
    if (rel.indexOf('.') != 0) return rel;
  }
  return filePath;
}

export function compile({
  allDepsCompiledWithBazel = true,
  useManifestPathsAsModuleName,
  compilerOpts,
  tsHost,
  bazelOpts,
  files,
  inputs,
  expectedOuts,
  gatherDiagnostics,
  bazelHost,
  ng,
}: {
  allDepsCompiledWithBazel?: boolean,
  useManifestPathsAsModuleName?: boolean, compilerOpts: CompilerOptions, tsHost: ts.CompilerHost,
  inputs?: {[path: string]: string},
        bazelOpts: BazelOptions,
        files: string[],
        expectedOuts: string[],
  gatherDiagnostics?: (program: Program) => readonly ts.Diagnostic[],
  bazelHost?: CompilerHost, ng: CompilerCliModule,
}): {diagnostics: readonly ts.Diagnostic[], program: Program} {
  let fileLoader: FileLoader;

  if (bazelOpts.maxCacheSizeMb !== undefined) {
    const maxCacheSizeBytes = bazelOpts.maxCacheSizeMb * (1 << 20);
    fileCache.setMaxCacheSize(maxCacheSizeBytes);
  } else {
    fileCache.resetMaxCacheSize();
  }

  if (inputs) {
    fileLoader = new CachedFileLoader(fileCache);
    // Resolve the inputs to absolute paths to match TypeScript internals
    const resolvedInputs = new Map<string, string>();
    const inputKeys = Object.keys(inputs);
    for (let i = 0; i < inputKeys.length; i++) {
      const key = inputKeys[i];
      resolvedInputs.set(resolveNormalizedPath(key), inputs[key]);
    }
    fileCache.updateCache(resolvedInputs);
  } else {
    fileLoader = new UncachedFileLoader();
  }

  // Detect from compilerOpts whether the entrypoint is being invoked in Ivy mode.
  const isInIvyMode = !!compilerOpts.enableIvy;
  if (!compilerOpts.rootDirs) {
    throw new Error('rootDirs is not set!');
  }
  const bazelBin = compilerOpts.rootDirs.find(rootDir => BAZEL_BIN.test(rootDir));
  if (!bazelBin) {
    throw new Error(`Couldn't find bazel bin in the rootDirs: ${compilerOpts.rootDirs}`);
  }

  const expectedOutsSet = new Set(expectedOuts.map(p => convertToForwardSlashPath(p)));

  const originalWriteFile = tsHost.writeFile.bind(tsHost);
  tsHost.writeFile =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        const relative =
            relativeToRootDirs(convertToForwardSlashPath(fileName), [compilerOpts.rootDir]);
        if (expectedOutsSet.has(relative)) {
          expectedOutsSet.delete(relative);
          originalWriteFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
        }
      };

  // Patch fileExists when resolving modules, so that CompilerHost can ask TypeScript to
  // resolve non-existing generated files that don't exist on disk, but are
  // synthetic and added to the `programWithStubs` based on real inputs.
  const generatedFileModuleResolverHost = Object.create(tsHost);
  generatedFileModuleResolverHost.fileExists = (fileName: string) => {
    const match = NGC_GEN_FILES.exec(fileName);
    if (match) {
      const [, file, suffix, ext] = match;
      // Performance: skip looking for files other than .d.ts or .ts
      if (ext !== '.ts' && ext !== '.d.ts') return false;
      if (suffix.indexOf('ngstyle') >= 0) {
        // Look for foo.css on disk
        fileName = file;
      } else {
        // Look for foo.d.ts or foo.ts on disk
        fileName = file + (ext || '');
      }
    }
    return tsHost.fileExists(fileName);
  };

  function generatedFileModuleResolver(
      moduleName: string, containingFile: string,
      compilerOptions: ts.CompilerOptions): ts.ResolvedModuleWithFailedLookupLocations {
    return ts.resolveModuleName(
        moduleName, containingFile, compilerOptions, generatedFileModuleResolverHost);
  }

  if (!bazelHost) {
    bazelHost = new CompilerHost(
        files, compilerOpts, bazelOpts, tsHost, fileLoader, generatedFileModuleResolver);
  }

  if (isInIvyMode) {
    const delegate = bazelHost.shouldSkipTsickleProcessing.bind(bazelHost);
    bazelHost.shouldSkipTsickleProcessing = (fileName: string) => {
      // The base implementation of shouldSkipTsickleProcessing checks whether `fileName` is part of
      // the original `srcs[]`. For Angular (Ivy) compilations, ngfactory/ngsummary files that are
      // shims for original .ts files in the program should be treated identically. Thus, strip the
      // '.ngfactory' or '.ngsummary' part of the filename away before calling the delegate.
      return delegate(fileName.replace(/\.(ngfactory|ngsummary)\.ts$/, '.ts'));
    };
  }

  // By default, disable tsickle decorator transforming in the tsickle compiler host.
  // The Angular compilers have their own logic for decorator processing and we wouldn't
  // want tsickle to interfere with that.
  bazelHost.transformDecorators = false;

  // By default in the `prodmode` output, we do not add annotations for closure compiler.
  // Though, if we are building inside `google3`, closure annotations are desired for
  // prodmode output, so we enable it by default. The defaults can be overridden by
  // setting the `annotateForClosureCompiler` compiler option in the user tsconfig.
  if (!bazelOpts.es5Mode && !bazelOpts.devmode) {
    if (bazelOpts.workspaceName === 'google3') {
      compilerOpts.annotateForClosureCompiler = true;
      // Enable the tsickle decorator transform in google3 with Ivy mode enabled. The tsickle
      // decorator transformation is still needed. This might be because of custom decorators
      // with the `@Annotation` JSDoc that will be processed by the tsickle decorator transform.
      // TODO: Figure out why this is needed in g3 and how we can improve this. FW-2225
      if (isInIvyMode) {
        bazelHost.transformDecorators = true;
      }
    } else {
      compilerOpts.annotateForClosureCompiler = false;
    }
  }

  // The `annotateForClosureCompiler` Angular compiler option is not respected by default
  // as ngc-wrapped handles tsickle emit on its own. This means that we need to update
  // the tsickle compiler host based on the `annotateForClosureCompiler` flag.
  if (compilerOpts.annotateForClosureCompiler) {
    bazelHost.transformTypesToClosure = true;
  }

  const origBazelHostFileExist = bazelHost.fileExists;
  bazelHost.fileExists = (fileName: string) => {
    if (NGC_ASSETS.test(fileName)) {
      return tsHost.fileExists(fileName);
    }
    return origBazelHostFileExist.call(bazelHost, fileName);
  };
  const origBazelHostShouldNameModule = bazelHost.shouldNameModule.bind(bazelHost);
  bazelHost.shouldNameModule = (fileName: string) => {
    const flatModuleOutPath =
        path.posix.join(bazelOpts.package, compilerOpts.flatModuleOutFile + '.ts');

    // The bundle index file is synthesized in bundle_index_host so it's not in the
    // compilationTargetSrc.
    // However we still want to give it an AMD module name for devmode.
    // We can't easily tell which file is the synthetic one, so we build up the path we expect
    // it to have and compare against that.
    if (fileName === path.posix.join(compilerOpts.baseUrl, flatModuleOutPath)) return true;

    // Also handle the case the target is in an external repository.
    // Pull the workspace name from the target which is formatted as `@wksp//package:target`
    // if it the target is from an external workspace. If the target is from the local
    // workspace then it will be formatted as `//package:target`.
    const targetWorkspace = bazelOpts.target.split('/')[0].replace(/^@/, '');

    if (targetWorkspace &&
        fileName ===
            path.posix.join(compilerOpts.baseUrl, 'external', targetWorkspace, flatModuleOutPath))
      return true;

    return origBazelHostShouldNameModule(fileName) || NGC_GEN_FILES.test(fileName);
  };

  const ngHost = ng.createCompilerHost({options: compilerOpts, tsHost: bazelHost});
  patchNgHostWithFileNameToModuleName(
      ngHost, compilerOpts, bazelOpts, useManifestPathsAsModuleName);

  ngHost.toSummaryFileName = (fileName: string, referringSrcFileName: string) => path.posix.join(
      bazelOpts.workspaceName,
      relativeToRootDirs(fileName, compilerOpts.rootDirs).replace(EXT, ''));
  if (allDepsCompiledWithBazel) {
    // Note: The default implementation would work as well,
    // but we can be faster as we know how `toSummaryFileName` works.
    // Note: We can't do this if some deps have been compiled with the command line,
    // as that has a different implementation of fromSummaryFileName / toSummaryFileName
    ngHost.fromSummaryFileName = (fileName: string, referringLibFileName: string) => {
      const workspaceRelative = fileName.split('/').splice(1).join('/');
      return resolveNormalizedPath(bazelBin, workspaceRelative) + '.d.ts';
    };
  }
  // Patch a property on the ngHost that allows the resourceNameToModuleName function to
  // report better errors.
  (ngHost as any).reportMissingResource = (resourceName: string) => {
    console.error(`\nAsset not found:\n  ${resourceName}`);
    console.error('Check that it\'s included in the `assets` attribute of the `ng_module` rule.\n');
  };

  const emitCallback: TsEmitCallback = ({
    program,
    targetSourceFile,
    writeFile,
    cancellationToken,
    emitOnlyDtsFiles,
    customTransformers = {},
  }) =>
      tsickle.emitWithTsickle(
          program, bazelHost, bazelHost, compilerOpts, targetSourceFile, writeFile,
          cancellationToken, emitOnlyDtsFiles, {
            beforeTs: customTransformers.before,
            afterTs: customTransformers.after,
            afterDeclarations: customTransformers.afterDeclarations,
          });

  if (!gatherDiagnostics) {
    gatherDiagnostics = (program) =>
        gatherDiagnosticsForInputsOnly(compilerOpts, bazelOpts, program, ng);
  }
  const {diagnostics, emitResult, program} = ng.performCompilation({
    rootNames: files,
    options: compilerOpts,
    host: ngHost,
    emitCallback,
    mergeEmitResultsCallback: tsickle.mergeEmitResults,
    gatherDiagnostics
  });
  const tsickleEmitResult = emitResult as tsickle.EmitResult;
  let externs = '/** @externs */\n';
  const hasError = diagnostics.some((diag) => diag.category === ts.DiagnosticCategory.Error);
  if (!hasError) {
    if (bazelOpts.tsickleGenerateExterns) {
      externs += tsickle.getGeneratedExterns(tsickleEmitResult.externs, compilerOpts.rootDir!);
    }
    if (bazelOpts.manifest) {
      const manifest = constructManifest(tsickleEmitResult.modulesManifest, bazelHost);
      fs.writeFileSync(bazelOpts.manifest, manifest);
    }
  }

  // If compilation fails unexpectedly, performCompilation returns no program.
  // Make sure not to crash but report the diagnostics.
  if (!program) return {program, diagnostics};

  if (bazelOpts.tsickleExternsPath) {
    // Note: when tsickleExternsPath is provided, we always write a file as a
    // marker that compilation succeeded, even if it's empty (just containing an
    // @externs).
    fs.writeFileSync(bazelOpts.tsickleExternsPath, externs);
  }

  // There might be some expected output files that are not written by the
  // compiler. In this case, just write an empty file.
  for (const fileName of expectedOutsSet) {
    originalWriteFile(fileName, '', false);
  }

  if (!compilerOpts.noEmit) {
    maybeWriteUnusedInputsList(program.getTsProgram(), compilerOpts, bazelOpts);
  }

  return {program, diagnostics};
}

/**
 * Writes a collection of unused input files and directories which can be
 * consumed by bazel to avoid triggering rebuilds if only unused inputs are
 * changed.
 *
 * See https://bazel.build/contribute/codebase#input-discovery
 */
export function maybeWriteUnusedInputsList(
    program: ts.Program, options: ts.CompilerOptions, bazelOpts: BazelOptions) {
  if (!bazelOpts?.unusedInputsListPath) {
    return;
  }

  // ts.Program's getSourceFiles() gets populated by the sources actually
  // loaded while the program is being built.
  const usedFiles = new Set();
  for (const sourceFile of program.getSourceFiles()) {
    // Only concern ourselves with typescript files.
    usedFiles.add(sourceFile.fileName);
  }

  // allowedInputs are absolute paths to files which may also end with /* which
  // implies any files in that directory can be used.
  const unusedInputs: string[] = [];
  for (const f of bazelOpts.allowedInputs) {
    // A ts/x file is unused if it was not found directly in the used sources.
    if ((f.endsWith('.ts') || f.endsWith('.tsx')) && !usedFiles.has(f)) {
      unusedInputs.push(f);
      continue;
    }

    // TODO: Iterate over contents of allowed directories checking for used files.
  }

  // Bazel expects the unused input list to contain paths relative to the
  // execroot directory.
  // See https://docs.bazel.build/versions/main/output_directories.html
  fs.writeFileSync(
      bazelOpts.unusedInputsListPath,
      unusedInputs.map(f => path.relative(options.rootDir!, f)).join('\n'));
}

function isCompilationTarget(bazelOpts: BazelOptions, sf: ts.SourceFile): boolean {
  return !NGC_GEN_FILES.test(sf.fileName) &&
      (bazelOpts.compilationTargetSrc.indexOf(sf.fileName) !== -1);
}

function convertToForwardSlashPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function gatherDiagnosticsForInputsOnly(
    options: CompilerOptions, bazelOpts: BazelOptions, ngProgram: Program,
    ng: CompilerCliModule): ts.Diagnostic[] {
  const tsProgram = ngProgram.getTsProgram();

  // For the Ivy compiler, track the amount of time spent fetching TypeScript diagnostics.
  let previousPhase = ng.PerfPhase.Unaccounted;
  if (ngProgram instanceof ng.NgtscProgram) {
    previousPhase = ngProgram.compiler.perfRecorder.phase(ng.PerfPhase.TypeScriptDiagnostics);
  }
  const diagnostics: ts.Diagnostic[] = [];
  // These checks mirror ts.getPreEmitDiagnostics, with the important
  // exception of avoiding b/30708240, which is that if you call
  // program.getDeclarationDiagnostics() it somehow corrupts the emit.
  diagnostics.push(...tsProgram.getOptionsDiagnostics());
  diagnostics.push(...tsProgram.getGlobalDiagnostics());
  const programFiles = tsProgram.getSourceFiles().filter(f => isCompilationTarget(bazelOpts, f));
  for (let i = 0; i < programFiles.length; i++) {
    const sf = programFiles[i];
    // Note: We only get the diagnostics for individual files
    // to e.g. not check libraries.
    diagnostics.push(...tsProgram.getSyntacticDiagnostics(sf));
    diagnostics.push(...tsProgram.getSemanticDiagnostics(sf));
  }

  if (ngProgram instanceof ng.NgtscProgram) {
    ngProgram.compiler.perfRecorder.phase(previousPhase);
  }

  if (!diagnostics.length) {
    // only gather the angular diagnostics if we have no diagnostics
    // in any other files.
    diagnostics.push(...ngProgram.getNgStructuralDiagnostics());
    diagnostics.push(...ngProgram.getNgSemanticDiagnostics());
  }
  return diagnostics;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(exitCode => process.exitCode = exitCode).catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
}

/**
 * Adds support for the optional `fileNameToModuleName` operation to a given `ng.CompilerHost`.
 *
 * This is used within `ngc-wrapped` and the Bazel compilation flow, but is exported here to allow
 * for other consumers of the compiler to access this same logic. For example, the xi18n operation
 * in g3 configures its own `ng.CompilerHost` which also requires `fileNameToModuleName` to work
 * correctly.
 */
export function patchNgHostWithFileNameToModuleName(
    ngHost: NgCompilerHost, compilerOpts: CompilerOptions, bazelOpts: BazelOptions,
    useManifestPathsAsModuleName: boolean): void {
  const fileNameToModuleNameCache = new Map<string, string>();
  ngHost.fileNameToModuleName = (importedFilePath: string, containingFilePath?: string) => {
    const cacheKey = `${importedFilePath}:${containingFilePath}`;
    // Memoize this lookup to avoid expensive re-parses of the same file
    // When run as a worker, the actual ts.SourceFile is cached
    // but when we don't run as a worker, there is no cache.
    // For one example target in g3, we saw a cache hit rate of 7590/7695
    if (fileNameToModuleNameCache.has(cacheKey)) {
      return fileNameToModuleNameCache.get(cacheKey);
    }
    const result = doFileNameToModuleName(importedFilePath, containingFilePath);
    fileNameToModuleNameCache.set(cacheKey, result);
    return result;
  };

  function doFileNameToModuleName(importedFilePath: string, containingFilePath?: string): string {
    const relativeTargetPath =
        relativeToRootDirs(importedFilePath, compilerOpts.rootDirs).replace(EXT, '');
    const manifestTargetPath = `${bazelOpts.workspaceName}/${relativeTargetPath}`;
    if (useManifestPathsAsModuleName === true) {
      return manifestTargetPath;
    }

    // Unless manifest paths are explicitly enforced, we initially check if a module name is
    // set for the given source file. The compiler host from `@bazel/concatjs` sets source
    // file module names if the compilation targets either UMD or AMD. To ensure that the AMD
    // module names match, we first consider those.
    try {
      const sourceFile = ngHost.getSourceFile(importedFilePath, ts.ScriptTarget.Latest);
      if (sourceFile && sourceFile.moduleName) {
        return sourceFile.moduleName;
      }
    } catch (err) {
      // File does not exist or parse error. Ignore this case and continue onto the
      // other methods of resolving the module below.
    }

    // It can happen that the ViewEngine compiler needs to write an import in a factory file,
    // and is using an ngsummary file to get the symbols.
    // The ngsummary comes from an upstream ng_module rule.
    // The upstream rule based its imports on ngsummary file which was generated from a
    // metadata.json file that was published to npm in an Angular library.
    // However, the ngsummary doesn't propagate the 'importAs' from the original metadata.json
    // so we would normally not be able to supply the correct module name for it.
    // For example, if the rootDir-relative filePath is
    //  node_modules/@angular/material/toolbar/typings/index
    // we would supply a module name
    //  @angular/material/toolbar/typings/index
    // but there is no JavaScript file to load at this path.
    // This is a workaround for https://github.com/angular/angular/issues/29454
    if (importedFilePath.indexOf('node_modules') >= 0) {
      const maybeMetadataFile = importedFilePath.replace(EXT, '') + '.metadata.json';
      if (fs.existsSync(maybeMetadataFile)) {
        const moduleName = (JSON.parse(fs.readFileSync(maybeMetadataFile, {encoding: 'utf-8'})) as {
                             importAs: string
                           }).importAs;
        if (moduleName) {
          return moduleName;
        }
      }
    }

    if ((compilerOpts.module === ts.ModuleKind.UMD || compilerOpts.module === ts.ModuleKind.AMD) &&
        ngHost.amdModuleName) {
      return ngHost.amdModuleName({fileName: importedFilePath} as ts.SourceFile);
    }

    // If no AMD module name has been set for the source file by the `@bazel/concatjs` compiler
    // host, and the target file is not part of a flat module node module package, we use the
    // following rules (in order):
    //    1. If target file is part of `node_modules/`, we use the package module name.
    //    2. If no containing file is specified, or the target file is part of a different
    //       compilation unit, we use a Bazel manifest path. Relative paths are not possible
    //       since we don't have a containing file, and the target file could be located in the
    //       output directory, or in an external Bazel repository.
    //    3. If both rules above didn't match, we compute a relative path between the source files
    //       since they are part of the same compilation unit.
    // Note that we don't want to always use (2) because it could mean that compilation outputs
    // are always leaking Bazel-specific paths, and the output is not self-contained. This could
    // break `esm2015` or `esm5` output for Angular package release output
    // Omit the `node_modules` prefix if the module name of an NPM package is requested.
    if (relativeTargetPath.startsWith(NODE_MODULES)) {
      return relativeTargetPath.slice(NODE_MODULES.length);
    } else if (
        containingFilePath == null || !bazelOpts.compilationTargetSrc.includes(importedFilePath)) {
      return manifestTargetPath;
    }
    const containingFileDir =
        path.dirname(relativeToRootDirs(containingFilePath, compilerOpts.rootDirs));
    const relativeImportPath = path.posix.relative(containingFileDir, relativeTargetPath);
    return relativeImportPath.startsWith('.') ? relativeImportPath : `./${relativeImportPath}`;
  }
}
