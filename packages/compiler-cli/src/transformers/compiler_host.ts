/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, collectExternalReferences, EmitterVisitorContext, GeneratedFile, ParseSourceSpan, syntaxError, TypeScriptEmitter} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {TypeCheckHost} from '../diagnostics/translate_diagnostics';
import {ModuleMetadata} from '../metadata/index';
import {join} from '../ngtsc/file_system';

import {CompilerHost, CompilerOptions, LibrarySummary} from './api';
import {createMetadataReaderCache, MetadataReaderHost, readMetadata} from './metadata_reader';
import {DTS, GENERATED_FILES, isInRootDir, relativeToRootDirs} from './util';

const NODE_MODULES_PACKAGE_NAME = /node_modules\/((\w|-|\.)+|(@(\w|-|\.)+\/(\w|-|\.)+))/;
const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;

let wrapHostForTest: ((host: ts.CompilerHost) => ts.CompilerHost)|null = null;

export function setWrapHostForTest(wrapFn: ((host: ts.CompilerHost) => ts.CompilerHost)|
                                   null): void {
  wrapHostForTest = wrapFn;
}

export function createCompilerHost(
    {options, tsHost = ts.createCompilerHost(options, true)}:
        {options: CompilerOptions, tsHost?: ts.CompilerHost}): CompilerHost {
  if (wrapHostForTest !== null) {
    tsHost = wrapHostForTest(tsHost);
  }
  return tsHost;
}

export interface MetadataProvider {
  getMetadata(sourceFile: ts.SourceFile): ModuleMetadata|undefined;
}

interface GenSourceFile {
  externalReferences: Set<string>;
  sourceFile: ts.SourceFile;
  emitCtx: EmitterVisitorContext;
}

export interface CodeGenerator {
  generateFile(genFileName: string, baseFileName?: string): GeneratedFile;
  findGeneratedFileNames(fileName: string): string[];
}

function assert<T>(condition: T|null|undefined) {
  if (!condition) {
    // TODO(chuckjaz): do the right thing
  }
  return condition!;
}

/**
 * Implements the following hosts based on an api.CompilerHost:
 * - ts.CompilerHost to be consumed by a ts.Program
 * - AotCompilerHost for @angular/compiler
 * - TypeCheckHost for mapping ts errors to ng errors (via translateDiagnostics)
 */
export class TsCompilerAotCompilerTypeCheckHostAdapter implements ts.CompilerHost, AotCompilerHost,
                                                                  TypeCheckHost {
  private metadataReaderCache = createMetadataReaderCache();
  private fileNameToModuleNameCache = new Map<string, string>();
  private flatModuleIndexCache = new Map<string, boolean>();
  private flatModuleIndexNames = new Set<string>();
  private flatModuleIndexRedirectNames = new Set<string>();
  private rootDirs: string[];
  private moduleResolutionCache: ts.ModuleResolutionCache;
  private originalSourceFiles = new Map<string, ts.SourceFile|null>();
  private originalFileExistsCache = new Map<string, boolean>();
  private generatedSourceFiles = new Map<string, GenSourceFile>();
  private generatedCodeFor = new Map<string, string[]>();
  private emitter = new TypeScriptEmitter();
  private metadataReaderHost: MetadataReaderHost;

  // TODO(issue/24571): remove '!'.
  getCancellationToken!: () => ts.CancellationToken;
  // TODO(issue/24571): remove '!'.
  getDefaultLibLocation!: () => string;
  // TODO(issue/24571): remove '!'.
  trace!: (s: string) => void;
  // TODO(issue/24571): remove '!'.
  getDirectories!: (path: string) => string[];
  resolveTypeReferenceDirectives?:
      (names: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[];
  directoryExists?: (directoryName: string) => boolean;

  constructor(
      private rootFiles: ReadonlyArray<string>, private options: CompilerOptions,
      private context: CompilerHost, private metadataProvider: MetadataProvider,
      private codeGenerator: CodeGenerator,
      private librarySummaries = new Map<string, LibrarySummary>()) {
    this.moduleResolutionCache = ts.createModuleResolutionCache(
        this.context.getCurrentDirectory!(), this.context.getCanonicalFileName.bind(this.context));
    const basePath = this.options.basePath!;
    this.rootDirs =
        (this.options.rootDirs || [this.options.basePath!]).map(p => path.resolve(basePath, p));
    if (context.getDirectories) {
      this.getDirectories = path => context.getDirectories!(path);
    }
    if (context.directoryExists) {
      this.directoryExists = directoryName => context.directoryExists!(directoryName);
    }
    if (context.getCancellationToken) {
      this.getCancellationToken = () => context.getCancellationToken!();
    }
    if (context.getDefaultLibLocation) {
      this.getDefaultLibLocation = () => context.getDefaultLibLocation!();
    }
    if (context.resolveTypeReferenceDirectives) {
      // Backward compatibility with TypeScript 2.9 and older since return
      // type has changed from (ts.ResolvedTypeReferenceDirective | undefined)[]
      // to ts.ResolvedTypeReferenceDirective[] in Typescript 3.0
      type ts3ResolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          ts.ResolvedTypeReferenceDirective[];
      this.resolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          (context.resolveTypeReferenceDirectives as ts3ResolveTypeReferenceDirectives)!
          (names, containingFile);
    }
    if (context.trace) {
      this.trace = s => context.trace!(s);
    }
    if (context.fileNameToModuleName) {
      this.fileNameToModuleName = context.fileNameToModuleName.bind(context);
    }
    // Note: don't copy over context.moduleNameToFileName as we first
    // normalize undefined containingFile to a filled containingFile.
    if (context.resourceNameToFileName) {
      this.resourceNameToFileName = context.resourceNameToFileName.bind(context);
    }
    if (context.toSummaryFileName) {
      this.toSummaryFileName = context.toSummaryFileName.bind(context);
    }
    if (context.fromSummaryFileName) {
      this.fromSummaryFileName = context.fromSummaryFileName.bind(context);
    }
    this.metadataReaderHost = {
      cacheMetadata: () => true,
      getSourceFileMetadata: (filePath) => {
        const sf = this.getOriginalSourceFile(filePath);
        return sf ? this.metadataProvider.getMetadata(sf) : undefined;
      },
      fileExists: (filePath) => this.originalFileExists(filePath),
      readFile: (filePath) => assert(this.context.readFile(filePath)),
    };
  }

  private resolveModuleName(moduleName: string, containingFile: string): ts.ResolvedModule
      |undefined {
    const rm = ts.resolveModuleName(
                     moduleName, containingFile.replace(/\\/g, '/'), this.options, this,
                     this.moduleResolutionCache)
                   .resolvedModule;
    if (rm && this.isSourceFile(rm.resolvedFileName) && DTS.test(rm.resolvedFileName)) {
      // Case: generateCodeForLibraries = true and moduleName is
      // a .d.ts file in a node_modules folder.
      // Need to set isExternalLibraryImport to false so that generated files for that file
      // are emitted.
      rm.isExternalLibraryImport = false;
    }
    return rm;
  }

  // Note: We implement this method so that TypeScript and Angular share the same
  // ts.ModuleResolutionCache
  // and that we can tell ts.Program about our different opinion about
  // ResolvedModule.isExternalLibraryImport
  // (see our isSourceFile method).
  resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
    // TODO(tbosch): this seems to be a typing error in TypeScript,
    // as it contains assertions that the result contains the same number of entries
    // as the given module names.
    return <ts.ResolvedModule[]>moduleNames.map(
        moduleName => this.resolveModuleName(moduleName, containingFile));
  }

  moduleNameToFileName(m: string, containingFile?: string): string|null {
    if (!containingFile) {
      if (m.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = this.rootFiles[0];
    }
    if (this.context.moduleNameToFileName) {
      return this.context.moduleNameToFileName(m, containingFile);
    }
    const resolved = this.resolveModuleName(m, containingFile);
    return resolved ? resolved.resolvedFileName : null;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code
   * which will be written to `containingFile`.
   *
   * Note that we also generate files for files in node_modules, as libraries
   * only ship .metadata.json files but not the generated code.
   *
   * Logic:
   * 1. if the importedFile and the containingFile are from the project sources
   *    or from the same node_modules package, use a relative path
   * 2. if the importedFile is in a node_modules package,
   *    use a path that starts with the package name.
   * 3. Error if the containingFile is in the node_modules package
   *    and the importedFile is in the project soures,
   *    as that is a violation of the principle that node_modules packages cannot
   *    import project sources.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    const cacheKey = `${importedFile}:${containingFile}`;
    let moduleName = this.fileNameToModuleNameCache.get(cacheKey);
    if (moduleName != null) {
      return moduleName;
    }

    const originalImportedFile = importedFile;
    if (this.options.traceResolution) {
      console.error(
          'fileNameToModuleName from containingFile', containingFile, 'to importedFile',
          importedFile);
    }

    // drop extension
    importedFile = importedFile.replace(EXT, '');
    const importedFilePackageName = getPackageName(importedFile);
    const containingFilePackageName = getPackageName(containingFile);

    if (importedFilePackageName === containingFilePackageName ||
        GENERATED_FILES.test(originalImportedFile)) {
      const rootedContainingFile = relativeToRootDirs(containingFile, this.rootDirs);
      const rootedImportedFile = relativeToRootDirs(importedFile, this.rootDirs);

      if (rootedContainingFile !== containingFile && rootedImportedFile !== importedFile) {
        // if both files are contained in the `rootDirs`, then strip the rootDirs
        containingFile = rootedContainingFile;
        importedFile = rootedImportedFile;
      }
      moduleName = dotRelative(path.dirname(containingFile), importedFile);
    } else if (importedFilePackageName) {
      moduleName = stripNodeModulesPrefix(importedFile);
      if (originalImportedFile.endsWith('.d.ts')) {
        // the moduleName for these typings could be shortented to the npm package name
        // if the npm package typings matches the importedFile
        try {
          const modulePath = importedFile.substring(0, importedFile.length - moduleName.length) +
              importedFilePackageName;
          const packageJson = require(modulePath + '/package.json');
          const packageTypings = join(modulePath, packageJson.typings);
          if (packageTypings === originalImportedFile) {
            moduleName = importedFilePackageName;
          }
        } catch {
          // the above require() will throw if there is no package.json file
          // and this is safe to ignore and correct to keep the longer
          // moduleName in this case
        }
      }
    } else {
      throw new Error(`Trying to import a source file from a node_modules package: import ${
          originalImportedFile} from ${containingFile}`);
    }

    this.fileNameToModuleNameCache.set(cacheKey, moduleName);
    return moduleName;
  }

  resourceNameToFileName(resourceName: string, containingFile: string): string|null {
    // Note: we convert package paths into relative paths to be compatible with the the
    // previous implementation of UrlResolver.
    const firstChar = resourceName[0];
    if (firstChar === '/') {
      resourceName = resourceName.slice(1);
    } else if (firstChar !== '.') {
      resourceName = `./${resourceName}`;
    }
    let filePathWithNgResource =
        this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
    // If the user specified styleUrl pointing to *.scss, but the Sass compiler was run before
    // Angular, then the resource may have been generated as *.css. Simply try the resolution again.
    if (!filePathWithNgResource && CSS_PREPROCESSOR_EXT.test(resourceName)) {
      const fallbackResourceName = resourceName.replace(CSS_PREPROCESSOR_EXT, '.css');
      filePathWithNgResource =
          this.moduleNameToFileName(addNgResourceSuffix(fallbackResourceName), containingFile);
    }
    const result = filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
    // Used under Bazel to report more specific error with remediation advice
    if (!result && (this.context as any).reportMissingResource) {
      (this.context as any).reportMissingResource(resourceName);
    }
    return result;
  }

  toSummaryFileName(fileName: string, referringSrcFileName: string): string {
    return this.fileNameToModuleName(fileName, referringSrcFileName);
  }

  fromSummaryFileName(fileName: string, referringLibFileName: string): string {
    const resolved = this.moduleNameToFileName(fileName, referringLibFileName);
    if (!resolved) {
      throw new Error(`Could not resolve ${fileName} from ${referringLibFileName}`);
    }
    return resolved;
  }

  parseSourceSpanOf(fileName: string, line: number, character: number): ParseSourceSpan|null {
    const data = this.generatedSourceFiles.get(fileName);
    if (data && data.emitCtx) {
      return data.emitCtx.spanOf(line, character);
    }
    return null;
  }

  private getOriginalSourceFile(
      filePath: string, languageVersion?: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined): ts.SourceFile|null {
    // Note: we need the explicit check via `has` as we also cache results
    // that were null / undefined.
    if (this.originalSourceFiles.has(filePath)) {
      return this.originalSourceFiles.get(filePath)!;
    }
    if (!languageVersion) {
      languageVersion = this.options.target || ts.ScriptTarget.Latest;
    }
    // Note: This can also return undefined,
    // as the TS typings are not correct!
    const sf = this.context.getSourceFile(filePath, languageVersion, onError) || null;
    this.originalSourceFiles.set(filePath, sf);
    return sf;
  }

  updateGeneratedFile(genFile: GeneratedFile): ts.SourceFile {
    if (!genFile.stmts) {
      throw new Error(
          `Invalid Argument: Expected a GenerateFile with statements. ${genFile.genFileUrl}`);
    }
    const oldGenFile = this.generatedSourceFiles.get(genFile.genFileUrl);
    if (!oldGenFile) {
      throw new Error(`Illegal State: previous GeneratedFile not found for ${genFile.genFileUrl}.`);
    }
    const newRefs = genFileExternalReferences(genFile);
    const oldRefs = oldGenFile.externalReferences;
    let refsAreEqual = oldRefs.size === newRefs.size;
    if (refsAreEqual) {
      newRefs.forEach(r => refsAreEqual = refsAreEqual && oldRefs.has(r));
    }
    if (!refsAreEqual) {
      throw new Error(`Illegal State: external references changed in ${genFile.genFileUrl}.\nOld: ${
          Array.from(oldRefs)}.\nNew: ${Array.from(newRefs)}`);
    }
    return this.addGeneratedFile(genFile, newRefs);
  }

  private addGeneratedFile(genFile: GeneratedFile, externalReferences: Set<string>): ts.SourceFile {
    if (!genFile.stmts) {
      throw new Error(
          `Invalid Argument: Expected a GenerateFile with statements. ${genFile.genFileUrl}`);
    }
    const {sourceText, context} = this.emitter.emitStatementsAndContext(
        genFile.genFileUrl, genFile.stmts, /* preamble */ '',
        /* emitSourceMaps */ false);
    const sf = ts.createSourceFile(
        genFile.genFileUrl, sourceText, this.options.target || ts.ScriptTarget.Latest);
    if (this.options.module === ts.ModuleKind.AMD || this.options.module === ts.ModuleKind.UMD) {
      if (this.context.amdModuleName) {
        const moduleName = this.context.amdModuleName(sf);
        if (moduleName) sf.moduleName = moduleName;
      } else if (/node_modules/.test(genFile.genFileUrl)) {
        // If we are generating an ngModule file under node_modules, we know the right module name
        // We don't need the host to supply a function in this case.
        sf.moduleName = stripNodeModulesPrefix(genFile.genFileUrl.replace(EXT, ''));
      }
    }
    this.generatedSourceFiles.set(genFile.genFileUrl, {
      sourceFile: sf,
      emitCtx: context,
      externalReferences,
    });
    return sf;
  }

  shouldGenerateFile(fileName: string): {generate: boolean, baseFileName?: string} {
    // TODO(tbosch): allow generating files that are not in the rootDir
    // See https://github.com/angular/angular/issues/19337
    if (!isInRootDir(fileName, this.options)) {
      return {generate: false};
    }
    const genMatch = GENERATED_FILES.exec(fileName);
    if (!genMatch) {
      return {generate: false};
    }
    const [, base, genSuffix, suffix] = genMatch;
    if (suffix !== 'ts' && suffix !== 'tsx') {
      return {generate: false};
    }
    let baseFileName: string|undefined;
    if (genSuffix.indexOf('ngstyle') >= 0) {
      // Note: ngstyle files have names like `afile.css.ngstyle.ts`
      if (!this.originalFileExists(base)) {
        return {generate: false};
      }
    } else {
      // Note: on-the-fly generated files always have a `.ts` suffix,
      // but the file from which we generated it can be a `.ts`/ `.tsx`/ `.d.ts`
      // (see options.generateCodeForLibraries).
      baseFileName = [`${base}.ts`, `${base}.tsx`, `${base}.d.ts`].find(
          baseFileName => this.isSourceFile(baseFileName) && this.originalFileExists(baseFileName));
      if (!baseFileName) {
        return {generate: false};
      }
    }
    return {generate: true, baseFileName};
  }

  shouldGenerateFilesFor(fileName: string) {
    // TODO(tbosch): allow generating files that are not in the rootDir
    // See https://github.com/angular/angular/issues/19337
    return !GENERATED_FILES.test(fileName) && this.isSourceFile(fileName) &&
        isInRootDir(fileName, this.options);
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined): ts.SourceFile {
    // Note: Don't exit early in this method to make sure
    // we always have up to date references on the file!
    let genFileNames: string[] = [];
    let sf = this.getGeneratedFile(fileName);
    if (!sf) {
      const summary = this.librarySummaries.get(fileName);
      if (summary) {
        if (!summary.sourceFile) {
          summary.sourceFile = ts.createSourceFile(
              fileName, summary.text, this.options.target || ts.ScriptTarget.Latest);
        }
        sf = summary.sourceFile;
        // TypeScript doesn't allow returning redirect source files. To avoid unforseen errors we
        // return the original source file instead of the redirect target.
        const redirectInfo = (sf as any).redirectInfo;
        if (redirectInfo !== undefined) {
          sf = redirectInfo.unredirected;
        }
        genFileNames = [];
      }
    }
    if (!sf) {
      sf = this.getOriginalSourceFile(fileName);
      const cachedGenFiles = this.generatedCodeFor.get(fileName);
      if (cachedGenFiles) {
        genFileNames = cachedGenFiles;
      } else {
        if (!this.options.noResolve && this.shouldGenerateFilesFor(fileName)) {
          genFileNames = this.codeGenerator.findGeneratedFileNames(fileName).filter(
              fileName => this.shouldGenerateFile(fileName).generate);
        }
        this.generatedCodeFor.set(fileName, genFileNames);
      }
    }
    if (sf) {
      addReferencesToSourceFile(sf, genFileNames);
    }
    // TODO(tbosch): TypeScript's typings for getSourceFile are incorrect,
    // as it can very well return undefined.
    return sf!;
  }

  private getGeneratedFile(fileName: string): ts.SourceFile|null {
    const genSrcFile = this.generatedSourceFiles.get(fileName);
    if (genSrcFile) {
      return genSrcFile.sourceFile;
    }
    const {generate, baseFileName} = this.shouldGenerateFile(fileName);
    if (generate) {
      const genFile = this.codeGenerator.generateFile(fileName, baseFileName);
      return this.addGeneratedFile(genFile, genFileExternalReferences(genFile));
    }
    return null;
  }

  private originalFileExists(fileName: string): boolean {
    let fileExists = this.originalFileExistsCache.get(fileName);
    if (fileExists == null) {
      fileExists = this.context.fileExists(fileName);
      this.originalFileExistsCache.set(fileName, fileExists);
    }
    return fileExists;
  }

  fileExists(fileName: string): boolean {
    fileName = stripNgResourceSuffix(fileName);
    if (this.librarySummaries.has(fileName) || this.generatedSourceFiles.has(fileName)) {
      return true;
    }
    if (this.shouldGenerateFile(fileName).generate) {
      return true;
    }
    return this.originalFileExists(fileName);
  }

  loadSummary(filePath: string): string|null {
    const summary = this.librarySummaries.get(filePath);
    if (summary) {
      return summary.text;
    }
    if (this.originalFileExists(filePath)) {
      return assert(this.context.readFile(filePath));
    }
    return null;
  }

  isSourceFile(filePath: string): boolean {
    // Don't generate any files nor typecheck them
    // if skipTemplateCodegen is set and fullTemplateTypeCheck is not yet set,
    // for backwards compatibility.
    if (this.options.skipTemplateCodegen && !this.options.fullTemplateTypeCheck) {
      return false;
    }
    // If we have a summary from a previous compilation,
    // treat the file never as a source file.
    if (this.librarySummaries.has(filePath)) {
      return false;
    }
    if (GENERATED_FILES.test(filePath)) {
      return false;
    }
    if (this.options.generateCodeForLibraries === false && DTS.test(filePath)) {
      return false;
    }
    if (DTS.test(filePath)) {
      // Check for a bundle index.
      if (this.hasBundleIndex(filePath)) {
        const normalFilePath = path.normalize(filePath);
        return this.flatModuleIndexNames.has(normalFilePath) ||
            this.flatModuleIndexRedirectNames.has(normalFilePath);
      }
    }
    return true;
  }

  readFile(fileName: string) {
    const summary = this.librarySummaries.get(fileName);
    if (summary) {
      return summary.text;
    }
    return this.context.readFile(fileName);
  }

  getMetadataFor(filePath: string): ModuleMetadata[]|undefined {
    return readMetadata(filePath, this.metadataReaderHost, this.metadataReaderCache);
  }

  loadResource(filePath: string): Promise<string>|string {
    if (this.context.readResource) return this.context.readResource(filePath);
    if (!this.originalFileExists(filePath)) {
      throw syntaxError(`Error: Resource file not found: ${filePath}`);
    }
    return assert(this.context.readFile(filePath));
  }

  getOutputName(filePath: string): string {
    return path.relative(this.getCurrentDirectory(), filePath);
  }

  private hasBundleIndex(filePath: string): boolean {
    const checkBundleIndex = (directory: string): boolean => {
      let result = this.flatModuleIndexCache.get(directory);
      if (result == null) {
        if (path.basename(directory) == 'node_module') {
          // Don't look outside the node_modules this package is installed in.
          result = false;
        } else {
          // A bundle index exists if the typings .d.ts file has a metadata.json that has an
          // importAs.
          try {
            const packageFile = path.join(directory, 'package.json');
            if (this.originalFileExists(packageFile)) {
              // Once we see a package.json file, assume false until it we find the bundle index.
              result = false;
              const packageContent =
                  JSON.parse(assert(this.context.readFile(packageFile))) as {typings: string};
              if (packageContent.typings) {
                const typings = path.normalize(path.join(directory, packageContent.typings));
                if (DTS.test(typings)) {
                  const metadataFile = typings.replace(DTS, '.metadata.json');
                  if (this.originalFileExists(metadataFile)) {
                    const metadata = JSON.parse(assert(this.context.readFile(metadataFile))) as
                        {flatModuleIndexRedirect: string, importAs: string};
                    if (metadata.flatModuleIndexRedirect) {
                      this.flatModuleIndexRedirectNames.add(typings);
                      // Note: don't set result = true,
                      // as this would mark this folder
                      // as having a bundleIndex too early without
                      // filling the bundleIndexNames.
                    } else if (metadata.importAs) {
                      this.flatModuleIndexNames.add(typings);
                      result = true;
                    }
                  }
                }
              }
            } else {
              const parent = path.dirname(directory);
              if (parent != directory) {
                // Try the parent directory.
                result = checkBundleIndex(parent);
              } else {
                result = false;
              }
            }
          } catch {
            // If we encounter any errors assume we this isn't a bundle index.
            result = false;
          }
        }
        this.flatModuleIndexCache.set(directory, result);
      }
      return result;
    };

    return checkBundleIndex(path.dirname(filePath));
  }

  getDefaultLibFileName = (options: ts.CompilerOptions) =>
      this.context.getDefaultLibFileName(options)
  getCurrentDirectory = () => this.context.getCurrentDirectory();
  getCanonicalFileName = (fileName: string) => this.context.getCanonicalFileName(fileName);
  useCaseSensitiveFileNames = () => this.context.useCaseSensitiveFileNames();
  getNewLine = () => this.context.getNewLine();
  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  realpath = (p: string) => p;
  writeFile = this.context.writeFile.bind(this.context);
}

function genFileExternalReferences(genFile: GeneratedFile): Set<string> {
  return new Set(collectExternalReferences(genFile.stmts!).map(er => er.moduleName!));
}

function addReferencesToSourceFile(sf: ts.SourceFile, genFileNames: string[]) {
  // Note: as we modify ts.SourceFiles we need to keep the original
  // value for `referencedFiles` around in cache the original host is caching ts.SourceFiles.
  // Note: cloning the ts.SourceFile is expensive as the nodes in have parent pointers,
  // i.e. we would also need to clone and adjust all nodes.
  let originalReferencedFiles: ReadonlyArray<ts.FileReference> =
      (sf as any).originalReferencedFiles;
  if (!originalReferencedFiles) {
    originalReferencedFiles = sf.referencedFiles;
    (sf as any).originalReferencedFiles = originalReferencedFiles;
  }
  const newReferencedFiles = [...originalReferencedFiles];
  genFileNames.forEach(gf => newReferencedFiles.push({fileName: gf, pos: 0, end: 0}));
  sf.referencedFiles = newReferencedFiles;
}

export function getOriginalReferences(sourceFile: ts.SourceFile): ts.FileReference[]|undefined {
  return sourceFile && (sourceFile as any).originalReferencedFiles;
}

function dotRelative(from: string, to: string): string {
  const rPath: string = path.relative(from, to).replace(/\\/g, '/');
  return rPath.startsWith('.') ? rPath : './' + rPath;
}

/**
 * Moves the path into `genDir` folder while preserving the `node_modules` directory.
 */
function getPackageName(filePath: string): string|null {
  const match = NODE_MODULES_PACKAGE_NAME.exec(filePath);
  return match ? match[1] : null;
}

function stripNodeModulesPrefix(filePath: string): string {
  return filePath.replace(/.*node_modules\//, '');
}

function getNodeModulesPrefix(filePath: string): string|null {
  const match = /.*node_modules\//.exec(filePath);
  return match ? match[1] : null;
}

function stripNgResourceSuffix(fileName: string): string {
  return fileName.replace(/\.\$ngresource\$.*/, '');
}

function addNgResourceSuffix(fileName: string): string {
  return `${fileName}.$ngresource$`;
}
