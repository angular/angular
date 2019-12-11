/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler-cli';
import * as bzl from '@bazel/typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as ts from 'typescript';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NGC_GEN_FILES = /^(.*?)\.(ngfactory|ngsummary|ngstyle|shim\.ngstyle)(.*)$/;

export function runOneBuild(args: string[], inputs?: {[path: string]: string}): boolean {
  if (args[0] === '-p') args.shift();
  // Strip leading at-signs, used to indicate a params file
  const project = args[0].replace(/^@+/, '');

  const [parsedOptions, errors] = bzl.parseTsconfig(project);
  if (errors && errors.length) {
    console.error(ng.formatDiagnostics(errors));
    return false;
  }
  const {options: tsOptions, bazelOpts, files, config} = parsedOptions;
  const angularCompilerOptions: {[k: string]: unknown} = config['angularCompilerOptions'] || {};

  // Allow Bazel users to control some of the bazel options.
  // Since TypeScript's "extends" mechanism applies only to "compilerOptions"
  // we have to repeat some of their logic to get the user's "angularCompilerOptions".
  if (config['extends']) {
    // Load the user's config file
    // Note: this doesn't handle recursive extends so only a user's top level
    // `angularCompilerOptions` will be considered. As this code is going to be
    // removed with Ivy, the added complication of handling recursive extends
    // is likely not needed.
    let userConfigFile = bzl.resolveNormalizedPath(path.dirname(project), config['extends']);
    if (!userConfigFile.endsWith('.json')) userConfigFile += '.json';
    const {config: userConfig, error} = ts.readConfigFile(userConfigFile, ts.sys.readFile);
    if (error) {
      console.error(ng.formatDiagnostics([error]));
      return false;
    }

    // All user angularCompilerOptions values that a user has control
    // over should be collected here
    if (userConfig.angularCompilerOptions) {
      angularCompilerOptions['diagnostics'] =
          angularCompilerOptions['diagnostics'] || userConfig.angularCompilerOptions.diagnostics;
      angularCompilerOptions['trace'] =
          angularCompilerOptions['trace'] || userConfig.angularCompilerOptions.trace;

      angularCompilerOptions['disableExpressionLowering'] =
          angularCompilerOptions['disableExpressionLowering'] ||
          userConfig.angularCompilerOptions.disableExpressionLowering;
      angularCompilerOptions['disableTypeScriptVersionCheck'] =
          angularCompilerOptions['disableTypeScriptVersionCheck'] ||
          userConfig.angularCompilerOptions.disableTypeScriptVersionCheck;

      angularCompilerOptions['i18nOutLocale'] = angularCompilerOptions['i18nOutLocale'] ||
          userConfig.angularCompilerOptions.i18nOutLocale;
      angularCompilerOptions['i18nOutFormat'] = angularCompilerOptions['i18nOutFormat'] ||
          userConfig.angularCompilerOptions.i18nOutFormat;
      angularCompilerOptions['i18nOutFile'] =
          angularCompilerOptions['i18nOutFile'] || userConfig.angularCompilerOptions.i18nOutFile;

      angularCompilerOptions['i18nInFormat'] =
          angularCompilerOptions['i18nInFormat'] || userConfig.angularCompilerOptions.i18nInFormat;
      angularCompilerOptions['i18nInLocale'] =
          angularCompilerOptions['i18nInLocale'] || userConfig.angularCompilerOptions.i18nInLocale;
      angularCompilerOptions['i18nInFile'] =
          angularCompilerOptions['i18nInFile'] || userConfig.angularCompilerOptions.i18nInFile;

      angularCompilerOptions['i18nInMissingTranslations'] =
          angularCompilerOptions['i18nInMissingTranslations'] ||
          userConfig.angularCompilerOptions.i18nInMissingTranslations;
      angularCompilerOptions['i18nUseExternalIds'] = angularCompilerOptions['i18nUseExternalIds'] ||
          userConfig.angularCompilerOptions.i18nUseExternalIds;

      angularCompilerOptions['preserveWhitespaces'] =
          angularCompilerOptions['preserveWhitespaces'] ||
          userConfig.angularCompilerOptions.preserveWhitespaces;

      angularCompilerOptions.createExternalSymbolFactoryReexports =
          angularCompilerOptions.createExternalSymbolFactoryReexports ||
          userConfig.angularCompilerOptions.createExternalSymbolFactoryReexports;
    }
  }

  const expectedOut = angularCompilerOptions.expectedOut as string[];
  const expectedOuts = new Set<string>(expectedOut.map(normalizeFileName));

  // Create Bazel CompilerHost
  const compilerOpts = createNgCompilerOptions(tsOptions, bazelOpts, project, config);
  const tsHost = createTsCompilerHost(compilerOpts, expectedOuts);
  const host = createBazelCompilerHost(files, compilerOpts, bazelOpts, tsHost, inputs);

  // Compile the Angular program
  const {diagnostics} = compile({
    // We compile the content of node_modules with plain ngc command line.
    allDepsCompiledWithBazel: false,
    compilerOpts,
    host,
    files,
    expectedOuts,
  });

  if (diagnostics.length) {
    console.error(ng.formatDiagnostics(diagnostics));
  }
  return diagnostics.every(d => d.category !== ts.DiagnosticCategory.Error);
}

function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  // NB: the rootDirs should have been sorted longest-first
  for (let i = 0; i < rootDirs.length; i++) {
    const dir = rootDirs[i];
    const rel = path.posix.relative(dir, filePath);
    if (rel.indexOf('.') != 0) return rel;
  }
  return filePath;
}

interface CompileOptions {
  allDepsCompiledWithBazel: boolean;
  compilerOpts: ng.CompilerOptions;
  host: bzl.CompilerHost;
  files: string[];
  expectedOuts: Set<string>;
  gatherDiagnostics?: (program: ng.Program) => ng.Diagnostics;
}

export function compile({
    allDepsCompiledWithBazel, compilerOpts, host, files, expectedOuts, gatherDiagnostics,
}: CompileOptions): {diagnostics: ng.Diagnostics, program: ng.Program} {
  const bazelBin = findBazelBin(compilerOpts);
  const ngHost =
      createNgCompilerHost(host, compilerOpts, host.bazelOpts, bazelBin, allDepsCompiledWithBazel);

  const emitCallback: ng.TsEmitCallback = ({
    program,
    targetSourceFile,
    writeFile,
    cancellationToken,
    emitOnlyDtsFiles,
    customTransformers = {},
  }) =>
      tsickle.emitWithTsickle(
          program, host, host, compilerOpts, targetSourceFile, writeFile, cancellationToken,
          emitOnlyDtsFiles, {
            beforeTs: customTransformers.before,
            afterTs: customTransformers.after,
            afterDeclarations: customTransformers.afterDeclarations,
          });

  if (!gatherDiagnostics) {
    gatherDiagnostics = (program) => gatherDiagnosticsForInputsOnly(host.bazelOpts, program);
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
    if (host.bazelOpts.tsickleGenerateExterns) {
      externs += tsickle.getGeneratedExterns(tsickleEmitResult.externs);
    }
    if (host.bazelOpts.manifest) {
      const manifest = bzl.constructManifest(tsickleEmitResult.modulesManifest, host);
      fs.writeFileSync(host.bazelOpts.manifest, manifest);
    }
  }

  // If compilation fails unexpectedly, performCompilation returns no program.
  // Make sure not to crash but report the diagnostics.
  if (!program) return {program, diagnostics};

  if (!host.bazelOpts.nodeModulesPrefix) {
    // If there is no node modules, then metadata.json should be emitted since
    // there is no other way to obtain the information
    generateMetadataJson(program.getTsProgram(), files, compilerOpts.rootDirs, bazelBin, host);
  }

  if (host.bazelOpts.tsickleExternsPath) {
    // Note: when tsickleExternsPath is provided, we always write a file as a
    // marker that compilation succeeded, even if it's empty (just containing an
    // @externs).
    fs.writeFileSync(host.bazelOpts.tsickleExternsPath, externs);
  }

  // There might be some expected output files that are not written by the
  // compiler. In this case, just write an empty file.
  for (const fileName of expectedOuts) {
    host.writeFile(
        fileName, '', false /* writeByteOrderMark */, undefined /* sourceFiles */,
        undefined /* onError */);
  }

  return {program, diagnostics};
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/\\/g, '/');
}

export function createNgCompilerOptions(
    tsOptions: ts.CompilerOptions, bzlOptions: bzl.BazelOptions, project: string, config: {}) {
  const {basePath} = ng.calcProjectFileAndBasePath(project);
  const compilerOpts = ng.createNgCompilerOptions(basePath, config, tsOptions);
  if (!bzlOptions.es5Mode) {
    compilerOpts.annotateForClosureCompiler = true;
    compilerOpts.annotationsAs = 'static fields';
  }
  // Disable downleveling and Closure annotation if in Ivy mode.
  if (compilerOpts.enableIvy) {
    compilerOpts.annotationsAs = 'decorators';
  }
  return compilerOpts;
}

function createFileLoader(bazelOptions: bzl.BazelOptions, inputs?: {}) {
  /** The one FileCache instance used in this process. */
  const fileCache = new bzl.FileCache<ts.SourceFile>(bzl.debug);

  if (bazelOptions.maxCacheSizeMb !== undefined) {
    const maxCacheSizeBytes = bazelOptions.maxCacheSizeMb * (1 << 20);
    fileCache.setMaxCacheSize(maxCacheSizeBytes);
  } else {
    fileCache.resetMaxCacheSize();
  }

  if (!inputs) {
    return new bzl.UncachedFileLoader();
  }

  // Resolve the inputs to absolute paths to match TypeScript internals
  const resolvedInputs = new Map<string, string>();
  const inputKeys = Object.keys(inputs);
  for (let i = 0; i < inputKeys.length; i++) {
    const key = inputKeys[i];
    resolvedInputs.set(bzl.resolveNormalizedPath(key), inputs[key]);
  }
  fileCache.updateCache(resolvedInputs);
  return new bzl.CachedFileLoader(fileCache);
}

function createModuleResolver(host: ts.CompilerHost) {
  // Patch fileExists when resolving modules, so that CompilerHost can ask TypeScript to
  // resolve non-existing generated files that don't exist on disk, but are
  // synthetic and added to the `programWithStubs` based on real inputs.
  const moduleResolverHost = {
    ...host,
    fileExists(fileName: string) {
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
      return host.fileExists(fileName);
    },
  };

  return function generatedFileModuleResolver(
             moduleName: string, containingFile: string,
             compilerOptions: ts.CompilerOptions): ts.ResolvedModuleWithFailedLookupLocations {
    return ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolverHost);
  };
}

function createNgCompilerHost(
    host: ts.CompilerHost, compilerOpts: ng.CompilerOptions, bazelOpts: bzl.BazelOptions,
    bazelBin: string, allDepsCompiledWithBazel: boolean) {
  const ngHost = ng.createCompilerHost({
    options: compilerOpts,
    tsHost: host,
  });

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
        const moduleName =
            JSON.parse(fs.readFileSync(maybeMetadataFile, {encoding: 'utf-8'})).importAs;
        if (moduleName) {
          return moduleName;
        }
      }
    }

    if ((compilerOpts.module === ts.ModuleKind.UMD || compilerOpts.module === ts.ModuleKind.AMD) &&
        ngHost.amdModuleName) {
      return ngHost.amdModuleName({ fileName: importedFilePath } as ts.SourceFile);
    }
    const result = relativeToRootDirs(importedFilePath, compilerOpts.rootDirs).replace(EXT, '');
    const NODE_MODULES = 'node_modules/';
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
      return bzl.resolveNormalizedPath(bazelBin, workspaceRelative) + '.d.ts';
    };
  }

  // Patch a property on the ngHost that allows the resourceNameToModuleName function to
  // report better errors.
  (ngHost as any).reportMissingResource = (resourceName: string) => {
    console.error(`\nAsset not found:\n  ${resourceName}`);
    console.error('Check that it\'s included in the `assets` attribute of the `ng_module` rule.\n');
  };

  return ngHost;
}

export function createTsCompilerHost(
    options: ts.CompilerOptions, expectedOuts: Set<string>): ts.CompilerHost {
  const host = ts.createCompilerHost(options, true /* setParentNodes */);
  return {
    ...host,
    writeFile(
        fileName: string, data: string, writeByteOrderMark: boolean,
        onError?: (message: string) => void, sourceFiles?: ReadonlyArray<ts.SourceFile>) {
      const relative = relativeToRootDirs(normalizeFileName(fileName), [options.rootDir]);
      if (expectedOuts.has(relative)) {
        expectedOuts.delete(relative);
        host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
      }
    },
  };
}

export function createBazelCompilerHost(
    files: string[], ngOptions: ng.CompilerOptions, bazelOptions: bzl.BazelOptions,
    tsHost: ts.CompilerHost, inputs?: {}) {
  const fileLoader = createFileLoader(bazelOptions, inputs);
  return new BazelCompilerHost(files, ngOptions, bazelOptions, tsHost, fileLoader);
}

class BazelCompilerHost extends bzl.CompilerHost {
  private readonly tsHost: ts.CompilerHost;
  private readonly ngOptions: ng.CompilerOptions;

  constructor(
      files: string[], ngOptions: ng.CompilerOptions, bazelOptions: bzl.BazelOptions,
      tsHost: ts.CompilerHost, fileLoader: bzl.FileLoader) {
    const moduleResolver = createModuleResolver(tsHost);
    super(files, ngOptions, bazelOptions, tsHost, fileLoader, moduleResolver);
    this.tsHost = tsHost;
    this.ngOptions = ngOptions;

    // Also need to disable decorator downleveling in the BazelHost in Ivy mode.
    if (ngOptions.enableIvy) {
      this.transformDecorators = false;
    }

    // Prevent tsickle adding any types at all if we don't want closure compiler annotations.
    if (ngOptions.annotateForClosureCompiler) {
      this.transformTypesToClosure = true;
      this.transformDecorators = true;
    }
  }

  fileExists(fileName: string) {
    const NGC_ASSETS = /\.(css|html|ngsummary\.json)$/;
    if (NGC_ASSETS.test(fileName)) {
      return this.tsHost.fileExists(fileName);
    }
    // super.filesExists() will never hit the filesystem, it'll merely check if
    // fileName is in the knownFiles map.
    return super.fileExists(fileName);
  }

  shouldNameModule(fileName: string) {
    const {package: bazelPackage, target: bazelTarget} = this.bazelOpts;
    const {flatModuleOutFile, baseUrl} = this.ngOptions;

    const flatModuleOutPath = path.posix.join(bazelPackage, flatModuleOutFile + '.ts');

    // The bundle index file is synthesized in bundle_index_host so it's not in the
    // compilationTargetSrc.
    // However we still want to give it an AMD module name for devmode.
    // We can't easily tell which file is the synthetic one, so we build up the path we expect
    // it to have and compare against that.
    if (fileName === path.posix.join(baseUrl, flatModuleOutPath)) {
      return true;
    }

    // Also handle the case the target is in an external repository.
    // Pull the workspace name from the target which is formatted as `@wksp//package:target`
    // if it the target is from an external workspace. If the target is from the local
    // workspace then it will be formatted as `//package:target`.
    const targetWorkspace = bazelTarget.split('/')[0].replace(/^@/, '');

    const extFileName = path.posix.join(baseUrl, 'external', targetWorkspace, flatModuleOutPath);
    if (targetWorkspace && fileName === extFileName) {
      return true;
    }

    return super.shouldNameModule(fileName) || NGC_GEN_FILES.test(fileName);
  }
}

function findBazelBin(options: ts.CompilerOptions) {
  const {rootDirs} = options;
  if (!rootDirs) {
    throw new Error('rootDirs is not set!');
  }
  const BAZEL_BIN = /\b(blaze|bazel)-out\b.*?\bbin\b/;
  const bazelBin = rootDirs.find(rootDir => BAZEL_BIN.test(rootDir));
  if (!bazelBin) {
    throw new Error(`Couldn't find bazel bin in the rootDirs: ${rootDirs}`);
  }
  return bazelBin;
}

/**
 * Generate metadata.json for the specified `files`. By default, metadata.json
 * is only generated by the compiler if --flatModuleOutFile is specified. But
 * if compiled under blaze, we want the metadata to be generated for each
 * Angular component.
 */
function generateMetadataJson(
    program: ts.Program, files: string[], rootDirs: string[], bazelBin: string,
    host: bzl.CompilerHost) {
  const collector = new ng.MetadataCollector();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourceFile = program.getSourceFile(file);
    if (sourceFile) {
      const metadata = collector.getMetadata(sourceFile);
      if (metadata) {
        const relative = relativeToRootDirs(file, rootDirs);
        const shortPath = relative.replace(EXT, '.metadata.json');
        const outFile = bzl.resolveNormalizedPath(bazelBin, shortPath);
        const data = JSON.stringify(metadata);
        host.writeFile(outFile, data, false, undefined, []);
      }
    }
  }
}

function gatherDiagnosticsForInputsOnly(
    bazelOpts: bzl.BazelOptions, ngProgram: ng.Program): (ng.Diagnostic | ts.Diagnostic)[] {
  const tsProgram = ngProgram.getTsProgram();
  const diagnostics: (ng.Diagnostic | ts.Diagnostic)[] = [];
  // These checks mirror ts.getPreEmitDiagnostics, with the important
  // exception of avoiding b/30708240, which is that if you call
  // program.getDeclarationDiagnostics() it somehow corrupts the emit.
  diagnostics.push(...tsProgram.getOptionsDiagnostics());
  diagnostics.push(...tsProgram.getGlobalDiagnostics());
  const compilationTargetSrc = new Set(bazelOpts.compilationTargetSrc);
  const programFiles = tsProgram.getSourceFiles().filter(({fileName}) => {
    // Only return compilation target source files
    return !NGC_GEN_FILES.test(fileName) && compilationTargetSrc.has(fileName);
  });
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

function main(args) {
  if (bzl.runAsWorker(args)) {
    bzl.runWorkerLoop(runOneBuild);
  } else {
    return runOneBuild(args) ? 0 : 1;
  }
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
