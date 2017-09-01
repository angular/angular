/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ng from '@angular/compiler-cli';
import {CachedFileLoader, CompilerHost, FileCache, FileLoader, UncachedFileLoader, constructManifest, debug, parseTsconfig, runAsWorker, runWorkerLoop} from '@bazel/typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
// FIXME: we should be able to add the assets to the tsconfig so FileLoader
// knows about them
const NGC_NON_TS_INPUTS =
    /(\.(ngsummary|ngstyle|ngfactory)(\.d)?\.ts|\.ngsummary\.json|\.css|\.html)$/;
// FIXME should need only summary, css, html

// TODO(alexeagle): probably not needed, see
// https://github.com/bazelbuild/rules_typescript/issues/28
const ALLOW_NON_HERMETIC_READS = true;

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

function runOneBuild(args: string[], inputs?: {[path: string]: string}): boolean {
  if (args[0] === '-p') args.shift();
  // Strip leading at-signs, used to indicate a params file
  const project = args[0].replace(/^@+/, '');
  let fileLoader: FileLoader;
  if (inputs) {
    fileLoader = new CachedFileLoader(fileCache, ALLOW_NON_HERMETIC_READS);
    fileCache.updateCache(inputs);
  } else {
    fileLoader = new UncachedFileLoader();
  }
  const [{options: tsOptions, bazelOpts, files, config}] = parseTsconfig(project);

  const {basePath} = ng.calcProjectFileAndBasePath(project);
  const ngOptions = ng.createNgCompilerOptions(basePath, config, tsOptions);
  if (!bazelOpts.es5Mode) {
    ngOptions.annotateForClosureCompiler = true;
    ngOptions.annotationsAs = 'static fields';
  }

  if (!tsOptions.rootDirs) {
    throw new Error('rootDirs is not set!');
  }

  function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
    if (!filePath) return filePath;
    // NB: the rootDirs should have been sorted longest-first
    for (const dir of rootDirs || []) {
      const rel = path.relative(dir, filePath);
      if (rel.indexOf('.') !== 0) return rel;
    }
    return filePath;
  }
  const expectedOuts = [...config['angularCompilerOptions']['expectedOut']];
  const tsHost = ts.createCompilerHost(tsOptions, true);

  const originalWriteFile = tsHost.writeFile.bind(tsHost);
  tsHost.writeFile =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        const relative = relativeToRootDirs(fileName, [tsOptions.rootDir]);
        const expectedIdx = expectedOuts.findIndex(o => o === relative);
        if (expectedIdx >= 0) {
          expectedOuts.splice(expectedIdx, 1);
          originalWriteFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
        }
      };


  // Patch fileExists when resolving modules, so that ngc can ask TypeScript to
  // resolve non-existing generated files that don't exist on disk, but are
  // synthetic and added to the `programWithStubs` based on real inputs.
  const generatedFileModuleResolverHost = Object.create(tsHost);
  generatedFileModuleResolverHost.fileExists = (fileName: string) => {
    const match = /^(.*?)\.(ngfactory|ngsummary|ngstyle|shim\.ngstyle)(.*)$/.exec(fileName);
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
      files, tsOptions, bazelOpts, tsHost, fileLoader, ALLOW_NON_HERMETIC_READS,
      generatedFileModuleResolver);
  // The file cache is populated by Bazel with workspace-relative filenames
  // so we must relativize paths before looking them up in the cache.
  const originalGetSourceFile = bazelHost.getSourceFile.bind(bazelHost);
  bazelHost.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
    return originalGetSourceFile(relativeToRootDirs(fileName, [tsOptions.rootDir]));
  };
  bazelHost.shouldSkipTsickleProcessing = (fileName: string): boolean =>
      bazelOpts.compilationTargetSrc.indexOf(fileName) === -1 && !NGC_NON_TS_INPUTS.test(fileName);

  const ngHost = ng.createCompilerHost({options: ngOptions, tsHost: bazelHost});

  ngHost.fileNameToModuleName = (importedFilePath: string, containingFilePath: string) =>
      relativeToRootDirs(importedFilePath, tsOptions.rootDirs).replace(EXT, '');
  ngHost.toSummaryFileName = (fileName: string, referringSrcFileName: string) =>
      ngHost.fileNameToModuleName(fileName, referringSrcFileName);

  const tsickleOpts = {
    googmodule: bazelOpts.googmodule,
    es5Mode: bazelOpts.es5Mode,
    prelude: bazelOpts.prelude,
    untyped: bazelOpts.untyped,
    typeBlackListPaths: new Set(bazelOpts.typeBlackListPaths),
    transformDecorators: bazelOpts.tsickle,
    transformTypesToClosure: bazelOpts.tsickle,
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
          program, bazelHost, tsickleOpts, bazelHost, ngOptions, targetSourceFile, writeFile,
          cancellationToken, emitOnlyDtsFiles, {
            beforeTs: customTransformers.before,
            afterTs: customTransformers.after,
          });

  const {diagnostics, emitResult} =
      ng.performCompilation({rootNames: files, options: ngOptions, host: ngHost, emitCallback});
  const tsickleEmitResult = emitResult as tsickle.EmitResult;
  let externs = '/** @externs */\n';
  if (diagnostics.length) {
    console.error(ng.formatDiagnostics(ngOptions, diagnostics));
  } else {
    if (bazelOpts.tsickleGenerateExterns) {
      externs += tsickle.getGeneratedExterns(tsickleEmitResult.externs);
    }
    if (bazelOpts.manifest) {
      const manifest = constructManifest(tsickleEmitResult.modulesManifest, bazelHost);
      fs.writeFileSync(bazelOpts.manifest, manifest);
    }
  }

  if (bazelOpts.tsickleExternsPath) {
    // Note: when tsickleExternsPath is provided, we always write a file as a
    // marker that compilation succeeded, even if it's empty (just containing an
    // @externs).
    fs.writeFileSync(bazelOpts.tsickleExternsPath, externs);
  }

  for (const missing of expectedOuts) {
    originalWriteFile(missing, '', false);
  }

  return diagnostics.every(d => d.category !== ts.DiagnosticCategory.Error);
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
