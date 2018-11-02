/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler-cli';
import {BazelOptions, CachedFileLoader, CompilerHost, FileCache, FileLoader, UncachedFileLoader, constructManifest, debug, parseTsconfig, resolveNormalizedPath, runAsWorker, runWorkerLoop} from '@bazel/typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NGC_GEN_FILES = /^(.*?)\.(ngfactory|ngsummary|ngstyle|shim\.ngstyle)(.*)$/;
// FIXME: we should be able to add the assets to the tsconfig so FileLoader
// knows about them
const NGC_ASSETS = /\.(css|html|ngsummary\.json)$/;

const BAZEL_BIN = /\b(blaze|bazel)-out\b.*?\bbin\b/;

// TODO(alexeagle): probably not needed, see
// https://github.com/bazelbuild/rules_typescript/issues/28
const ALLOW_NON_HERMETIC_READS = true;
// Note: We compile the content of node_modules with plain ngc command line.
const ALL_DEPS_COMPILED_WITH_BAZEL = false;

const NODE_MODULES = 'node_modules/';

export function main(args) {
  if (runAsWorker(args)) {
    runWorkerLoop(runOneBuild);
  } else {
    return runOneBuild(args) ? 0 : 1;
  }
  return 0;
}

/** The one FileCache instance used in this process. */
const fileCache = new FileCache<ts.SourceFile>(debug);

export function runOneBuild(args: string[], inputs?: {[path: string]: string}): boolean {
  if (args[0] === '-p') args.shift();
  // Strip leading at-signs, used to indicate a params file
  const project = args[0].replace(/^@+/, '');

  const [parsedOptions, errors] = parseTsconfig(project);
  if (errors && errors.length) {
    console.error(ng.formatDiagnostics(errors));
    return false;
  }
  const {options: tsOptions, bazelOpts, files, config} = parsedOptions;
  const expectedOuts = config['angularCompilerOptions']['expectedOut'];

  const {basePath} = ng.calcProjectFileAndBasePath(project);
  const compilerOpts = ng.createNgCompilerOptions(basePath, config, tsOptions);
  const tsHost = ts.createCompilerHost(compilerOpts, true);
  const {diagnostics} = compile({
    allowNonHermeticReads: ALLOW_NON_HERMETIC_READS,
    allDepsCompiledWithBazel: ALL_DEPS_COMPILED_WITH_BAZEL,
    compilerOpts,
    tsHost,
    bazelOpts,
    files,
    inputs,
    expectedOuts
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

export function compile({allowNonHermeticReads, allDepsCompiledWithBazel = true, compilerOpts,
                         tsHost, bazelOpts, files, inputs, expectedOuts, gatherDiagnostics}: {
  allowNonHermeticReads: boolean,
  allDepsCompiledWithBazel?: boolean,
  compilerOpts: ng.CompilerOptions,
  tsHost: ts.CompilerHost, inputs?: {[path: string]: string},
  bazelOpts: BazelOptions,
  files: string[],
  expectedOuts: string[], gatherDiagnostics?: (program: ng.Program) => ng.Diagnostics
}): {diagnostics: ng.Diagnostics, program: ng.Program} {
  let fileLoader: FileLoader;

  if (bazelOpts.maxCacheSizeMb !== undefined) {
    const maxCacheSizeBytes = bazelOpts.maxCacheSizeMb * (1 << 20);
    fileCache.setMaxCacheSize(maxCacheSizeBytes);
  } else {
    fileCache.resetMaxCacheSize();
  }

  if (inputs) {
    fileLoader = new CachedFileLoader(fileCache, allowNonHermeticReads);
    // Resolve the inputs to absolute paths to match TypeScript internals
    const resolvedInputs: {[path: string]: string} = {};
    const inputKeys = Object.keys(inputs);
    for (let i = 0; i < inputKeys.length; i++) {
      const key = inputKeys[i];
      resolvedInputs[resolveNormalizedPath(key)] = inputs[key];
    }
    fileCache.updateCache(resolvedInputs);
  } else {
    fileLoader = new UncachedFileLoader();
  }

  if (!bazelOpts.es5Mode) {
    compilerOpts.annotateForClosureCompiler = true;
    compilerOpts.annotationsAs = 'static fields';
  }

  // Detect from compilerOpts whether the entrypoint is being invoked in Ivy mode.
  const isInIvyMode = compilerOpts.enableIvy === 'ngtsc' || compilerOpts.enableIvy === 'tsc';

  // Disable downleveling and Closure annotation if in Ivy mode.
  if (isInIvyMode) {
    // In pass-through mode for TypeScript, we want to turn off decorator transpilation entirely.
    // This causes ngc to be have exactly like tsc.
    if (compilerOpts.enableIvy === 'tsc') {
      compilerOpts.annotateForClosureCompiler = false;
    }
    compilerOpts.annotationsAs = 'decorators';
  }

  if (!compilerOpts.rootDirs) {
    throw new Error('rootDirs is not set!');
  }
  const bazelBin = compilerOpts.rootDirs.find(rootDir => BAZEL_BIN.test(rootDir));
  if (!bazelBin) {
    throw new Error(`Couldn't find bazel bin in the rootDirs: ${compilerOpts.rootDirs}`);
  }

  const writtenExpectedOuts = [...expectedOuts];

  const originalWriteFile = tsHost.writeFile.bind(tsHost);
  tsHost.writeFile =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        const relative = relativeToRootDirs(fileName.replace(/\\/g, '/'), [compilerOpts.rootDir]);
        const expectedIdx = writtenExpectedOuts.findIndex(o => o === relative);
        if (expectedIdx >= 0) {
          writtenExpectedOuts.splice(expectedIdx, 1);
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

  const bazelHost = new CompilerHost(
      files, compilerOpts, bazelOpts, tsHost, fileLoader, allowNonHermeticReads,
      generatedFileModuleResolver);

  // Also need to disable decorator downleveling in the BazelHost in Ivy mode.
  if (isInIvyMode) {
    bazelHost.transformDecorators = false;
  }

  // Prevent tsickle adding any types at all if we don't want closure compiler annotations.
  bazelHost.transformTypesToClosure = compilerOpts.annotateForClosureCompiler;
  const origBazelHostFileExist = bazelHost.fileExists;
  bazelHost.fileExists = (fileName: string) => {
    if (NGC_ASSETS.test(fileName)) {
      return tsHost.fileExists(fileName);
    }
    return origBazelHostFileExist.call(bazelHost, fileName);
  };
  const origBazelHostShouldNameModule = bazelHost.shouldNameModule.bind(bazelHost);
  bazelHost.shouldNameModule = (fileName: string) => {
    // The bundle index file is synthesized in bundle_index_host so it's not in the
    // compilationTargetSrc.
    // However we still want to give it an AMD module name for devmode.
    // We can't easily tell which file is the synthetic one, so we build up the path we expect
    // it to have and compare against that.
    if (fileName ===
        path.join(compilerOpts.baseUrl, bazelOpts.package, compilerOpts.flatModuleOutFile + '.ts'))
      return true;
    // Also handle the case the target is in an external repository.
    // Pull the workspace name from the target which is formatted as `@wksp//package:target`
    // if it the target is from an external workspace. If the target is from the local
    // workspace then it will be formatted as `//package:target`.
    const targetWorkspace = bazelOpts.target.split('/')[0].replace(/^@/, '');
    if (targetWorkspace &&
        fileName ===
            path.join(
                compilerOpts.baseUrl, 'external', targetWorkspace, bazelOpts.package,
                compilerOpts.flatModuleOutFile + '.ts'))
      return true;
    return origBazelHostShouldNameModule(fileName) || NGC_GEN_FILES.test(fileName);
  };

  const ngHost = ng.createCompilerHost({options: compilerOpts, tsHost: bazelHost});
  const fileNameToModuleNameCache = new Map<string, string>();
  ngHost.fileNameToModuleName = (importedFilePath: string, containingFilePath: string) => {
    // Memoize this lookup to avoid expensive re-parses of the same file
    // When run as a worker, the actual ts.SourceFile is cached
    // but when we don't run as a worker, there is no cache.
    // For one example target in g3, we saw a cache hit rate of 7590/7695
    if (fileNameToModuleNameCache.has(importedFilePath)) {
      return fileNameToModuleNameCache.get(importedFilePath);
    }
    const result = doFileNameToModuleName(importedFilePath);
    fileNameToModuleNameCache.set(importedFilePath, result);
    return result;
  };

  function doFileNameToModuleName(importedFilePath: string): string {
    try {
      const sourceFile = ngHost.getSourceFile(importedFilePath, ts.ScriptTarget.Latest);
      if (sourceFile && sourceFile.moduleName) {
        return sourceFile.moduleName;
      }
    } catch (err) {
      // File does not exist or parse error. Ignore this case and continue onto the
      // other methods of resolving the module below.
    }
    if ((compilerOpts.module === ts.ModuleKind.UMD || compilerOpts.module === ts.ModuleKind.AMD) &&
        ngHost.amdModuleName) {
      return ngHost.amdModuleName({ fileName: importedFilePath } as ts.SourceFile);
    }
    const result = relativeToRootDirs(importedFilePath, compilerOpts.rootDirs).replace(EXT, '');
    if (result.startsWith(NODE_MODULES)) {
      return result.substr(NODE_MODULES.length);
    }
    return bazelOpts.workspaceName + '/' + result;
  }

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

  const emitCallback: ng.TsEmitCallback = ({
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
          });

  if (!gatherDiagnostics) {
    gatherDiagnostics = (program) =>
        gatherDiagnosticsForInputsOnly(compilerOpts, bazelOpts, program);
  }
  const {diagnostics, emitResult, program} = ng.performCompilation({
    rootNames: files,
    options: compilerOpts,
    host: ngHost, emitCallback,
    mergeEmitResultsCallback: tsickle.mergeEmitResults, gatherDiagnostics
  });
  const tsickleEmitResult = emitResult as tsickle.EmitResult;
  let externs = '/** @externs */\n';
  if (!diagnostics.length) {
    if (bazelOpts.tsickleGenerateExterns) {
      externs += tsickle.getGeneratedExterns(tsickleEmitResult.externs);
    }
    if (bazelOpts.manifest) {
      const manifest = constructManifest(tsickleEmitResult.modulesManifest, bazelHost);
      fs.writeFileSync(bazelOpts.manifest, manifest);
    }
  }

  // If compilation fails unexpectedly, performCompilation returns no program.
  // Make sure not to crash but report the diagnostics.
  if (!program) return {program, diagnostics};

  if (!bazelOpts.nodeModulesPrefix) {
    // If there is no node modules, then metadata.json should be emitted since
    // there is no other way to obtain the information
    generateMetadataJson(program.getTsProgram(), files, compilerOpts.rootDirs, bazelBin, tsHost);
  }

  if (bazelOpts.tsickleExternsPath) {
    // Note: when tsickleExternsPath is provided, we always write a file as a
    // marker that compilation succeeded, even if it's empty (just containing an
    // @externs).
    fs.writeFileSync(bazelOpts.tsickleExternsPath, externs);
  }

  for (let i = 0; i < writtenExpectedOuts.length; i++) {
    originalWriteFile(writtenExpectedOuts[i], '', false);
  }

  return {program, diagnostics};
}

/**
 * Generate metadata.json for the specified `files`. By default, metadata.json
 * is only generated by the compiler if --flatModuleOutFile is specified. But
 * if compiled under blaze, we want the metadata to be generated for each
 * Angular component.
 */
function generateMetadataJson(
    program: ts.Program, files: string[], rootDirs: string[], bazelBin: string,
    tsHost: ts.CompilerHost) {
  const collector = new ng.MetadataCollector();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourceFile = program.getSourceFile(file);
    if (sourceFile) {
      const metadata = collector.getMetadata(sourceFile);
      if (metadata) {
        const relative = relativeToRootDirs(file, rootDirs);
        const shortPath = relative.replace(EXT, '.metadata.json');
        const outFile = resolveNormalizedPath(bazelBin, shortPath);
        const data = JSON.stringify(metadata);
        tsHost.writeFile(outFile, data, false, undefined, []);
      }
    }
  }
}

function isCompilationTarget(bazelOpts: BazelOptions, sf: ts.SourceFile): boolean {
  return !NGC_GEN_FILES.test(sf.fileName) &&
      (bazelOpts.compilationTargetSrc.indexOf(sf.fileName) !== -1);
}

function gatherDiagnosticsForInputsOnly(
    options: ng.CompilerOptions, bazelOpts: BazelOptions,
    ngProgram: ng.Program): (ng.Diagnostic | ts.Diagnostic)[] {
  const tsProgram = ngProgram.getTsProgram();
  const diagnostics: (ng.Diagnostic | ts.Diagnostic)[] = [];
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
  if (!diagnostics.length) {
    // only gather the angular diagnostics if we have no diagnostics
    // in any other files.
    diagnostics.push(...ngProgram.getNgStructuralDiagnostics());
    diagnostics.push(...ngProgram.getNgSemanticDiagnostics());
  }
  return diagnostics;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
