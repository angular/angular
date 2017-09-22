/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO(tbosch): figure out why we need this as it breaks node code within ngc-wrapped
/// <reference types="node" />
import * as ng from '@angular/compiler-cli';
import {BazelOptions, CachedFileLoader, CompilerHost, FileCache, FileLoader, UncachedFileLoader, constructManifest, debug, fixUmdModuleDeclarations, parseTsconfig, runAsWorker, runWorkerLoop} from '@bazel/typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NGC_GEN_FILES = /^(.*?)\.(ngfactory|ngsummary|ngstyle|shim\.ngstyle)(.*)$/;
// FIXME: we should be able to add the assets to the tsconfig so FileLoader
// knows about them
const NGC_ASSETS = /\.(css|html|ngsummary\.json)$/;

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
  const [{options: tsOptions, bazelOpts, files, config}] = parseTsconfig(project);
  const expectedOuts = config['angularCompilerOptions']['expectedOut'];

  const {basePath} = ng.calcProjectFileAndBasePath(project);
  const compilerOpts = ng.createNgCompilerOptions(basePath, config, tsOptions);
  const tsHost = ts.createCompilerHost(compilerOpts, true);
  const {diagnostics} = compile({
    allowNonHermeticReads: ALLOW_NON_HERMETIC_READS,
    compilerOpts,
    tsHost,
    bazelOpts,
    files,
    inputs,
    expectedOuts
  });
  return diagnostics.every(d => d.category !== ts.DiagnosticCategory.Error);
}

export function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  // NB: the rootDirs should have been sorted longest-first
  for (const dir of rootDirs || []) {
    const rel = path.relative(dir, filePath);
    if (rel.indexOf('.') != 0) return rel;
  }
  return filePath;
}

export function compile({allowNonHermeticReads, compilerOpts, tsHost, bazelOpts, files, inputs,
                         expectedOuts, gatherDiagnostics}: {
  allowNonHermeticReads: boolean,
  compilerOpts: ng.CompilerOptions,
  tsHost: ts.CompilerHost, inputs?: {[path: string]: string},
  bazelOpts: BazelOptions,
  files: string[],
  expectedOuts: string[], gatherDiagnostics?: (program: ng.Program) => ng.Diagnostics
}): {diagnostics: ng.Diagnostics, program: ng.Program} {
  let fileLoader: FileLoader;
  if (inputs) {
    fileLoader = new CachedFileLoader(fileCache, ALLOW_NON_HERMETIC_READS);
    // Resolve the inputs to absolute paths to match TypeScript internals
    const resolvedInputs: {[path: string]: string} = {};
    for (const key of Object.keys(inputs)) {
      resolvedInputs[path.resolve(key)] = inputs[key];
    }
    fileCache.updateCache(resolvedInputs);
  } else {
    fileLoader = new UncachedFileLoader();
  }

  if (!bazelOpts.es5Mode) {
    compilerOpts.annotateForClosureCompiler = true;
    compilerOpts.annotationsAs = 'static fields';
  }

  if (!compilerOpts.rootDirs) {
    throw new Error('rootDirs is not set!');
  }

  const writtenExpectedOuts = [...expectedOuts];

  const originalWriteFile = tsHost.writeFile.bind(tsHost);
  tsHost.writeFile =
      (fileName: string, content: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        const relative = relativeToRootDirs(fileName, [compilerOpts.rootDir]);
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

  // TODO(alexeagle): does this also work in third_party?
  const allowNonHermeticRead = false;
  const bazelHost = new CompilerHost(
      files, compilerOpts, bazelOpts, tsHost, fileLoader, ALLOW_NON_HERMETIC_READS,
      generatedFileModuleResolver);
  const origBazelHostFileExist = bazelHost.fileExists;
  bazelHost.fileExists = (fileName: string) => {
    if (NGC_ASSETS.test(fileName)) {
      return tsHost.fileExists(fileName);
    }
    return origBazelHostFileExist.call(bazelHost, fileName);
  };

  const ngHost = ng.createCompilerHost({options: compilerOpts, tsHost: bazelHost});

  ngHost.fileNameToModuleName = (importedFilePath: string, containingFilePath: string) =>
      relativeToRootDirs(importedFilePath, compilerOpts.rootDirs).replace(EXT, '');
  ngHost.toSummaryFileName = (fileName: string, referringSrcFileName: string) =>
      ngHost.fileNameToModuleName(fileName, referringSrcFileName);

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
            afterTs: [
              ...(customTransformers.after || []),
              fixUmdModuleDeclarations((sf: ts.SourceFile) => bazelHost.amdModuleName(sf)),
            ],
          });

  const {diagnostics, emitResult, program} = ng.performCompilation(
      {rootNames: files, options: compilerOpts, host: ngHost, emitCallback, gatherDiagnostics});
  const tsickleEmitResult = emitResult as tsickle.EmitResult;
  let externs = '/** @externs */\n';
  if (diagnostics.length) {
    console.error(ng.formatDiagnostics(compilerOpts, diagnostics));
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

  for (const missing of writtenExpectedOuts) {
    originalWriteFile(missing, '', false);
  }

  return {program, diagnostics};
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
