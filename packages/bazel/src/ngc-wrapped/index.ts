/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ng from '@angular/compiler-cli';
import {CompilerHost, UncachedFileLoader, parseTsconfig} from '@bazel/typescript';
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

function topologicalSort(
    result: tsickle.FileMap<boolean>, current: string, modulesManifest: tsickle.ModulesManifest,
    visiting: tsickle.FileMap<boolean>) {
  const referencedModules = modulesManifest.getReferencedModules(current);
  if (!referencedModules) return;  // not in the local set of sources.
  for (const referencedModule of referencedModules) {
    const referencedFileName = modulesManifest.getFileNameFromModule(referencedModule);
    if (!referencedFileName) continue;  // Ambient modules.
    if (!result[referencedFileName]) {
      if (visiting[referencedFileName]) {
        const path = current + ' -> ' + Object.keys(visiting).join(' -> ');
        throw new Error('Cyclical dependency between files:\n' + path);
      }
      visiting[referencedFileName] = true;
      topologicalSort(result, referencedFileName, modulesManifest, visiting);
      delete visiting[referencedFileName];
    }
  }
  result[current] = true;
}
// TODO(alexeagle): move to tsc-wrapped in third_party so it's shared
export function constructManifest(
    modulesManifest: tsickle.ModulesManifest,
    host: {flattenOutDir: (f: string) => string}): string {
  const result: tsickle.FileMap<boolean> = {};
  for (const file of modulesManifest.fileNames) {
    topologicalSort(result, file, modulesManifest, {});
  }

  // NB: The object literal maintains insertion order.
  return Object.keys(result).map(fn => host.flattenOutDir(fn)).join('\n') + '\n';
}

export function main(args) {
  const project = args[1];
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
      if (rel.indexOf('.') != 0) return rel;
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
      files, tsOptions, bazelOpts, tsHost, new UncachedFileLoader(), generatedFileModuleResolver);
  bazelHost.allowNonHermeticRead = (filePath: string) =>
      NGC_NON_TS_INPUTS.test(filePath) || filePath.split(path.sep).indexOf('node_modules') != -1;
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

  return diagnostics.some(d => d.category === ts.DiagnosticCategory.Error) ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
