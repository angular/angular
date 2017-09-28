/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmitterVisitorContext, ExternalReference, GeneratedFile, ParseSourceSpan, TypeScriptEmitter, collectExternalReferences, syntaxError} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {BaseAotCompilerHost} from '../compiler_host';
import {TypeCheckHost} from '../diagnostics/translate_diagnostics';
import {ModuleMetadata} from '../metadata/index';

import {CompilerHost, CompilerOptions, LibrarySummary} from './api';
import {GENERATED_FILES} from './util';

const NODE_MODULES_PACKAGE_NAME = /node_modules\/((\w|-)+|(@(\w|-)+\/(\w|-)+))/;
const DTS = /\.d\.ts$/;
const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export function createCompilerHost(
    {options, tsHost = ts.createCompilerHost(options, true)}:
        {options: CompilerOptions, tsHost?: ts.CompilerHost}): CompilerHost {
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

/**
 * Implements the following hosts based on an api.CompilerHost:
 * - ts.CompilerHost to be consumed by a ts.Program
 * - AotCompilerHost for @angular/compiler
 * - TypeCheckHost for mapping ts errors to ng errors (via translateDiagnostics)
 */
export class TsCompilerAotCompilerTypeCheckHostAdapter extends
    BaseAotCompilerHost<CompilerHost> implements ts.CompilerHost,
    TypeCheckHost {
  private rootDirs: string[];
  private moduleResolutionCache: ts.ModuleResolutionCache;
  private originalSourceFiles = new Map<string, ts.SourceFile|undefined>();
  private originalFileExistsCache = new Map<string, boolean>();
  private generatedSourceFiles = new Map<string, GenSourceFile>();
  private generatedCodeFor = new Map<string, string[]>();
  private emitter = new TypeScriptEmitter();
  private librarySummaries = new Map<string, LibrarySummary>();
  getCancellationToken: () => ts.CancellationToken;
  getDefaultLibLocation: () => string;
  trace: (s: string) => void;
  getDirectories: (path: string) => string[];
  directoryExists?: (directoryName: string) => boolean;

  constructor(
      private rootFiles: string[], options: CompilerOptions, context: CompilerHost,
      private metadataProvider: MetadataProvider, private codeGenerator: CodeGenerator,
      librarySummaries: LibrarySummary[]) {
    super(options, context);
    librarySummaries.forEach(summary => this.librarySummaries.set(summary.fileName, summary));
    this.moduleResolutionCache = ts.createModuleResolutionCache(
        this.context.getCurrentDirectory !(), this.context.getCanonicalFileName.bind(this.context));
    const basePath = this.options.basePath !;
    this.rootDirs =
        (this.options.rootDirs || [this.options.basePath !]).map(p => path.resolve(basePath, p));
    if (context.getDirectories) {
      this.getDirectories = path => context.getDirectories !(path);
    }
    if (context.directoryExists) {
      this.directoryExists = directoryName => context.directoryExists !(directoryName);
    }
    if (context.getCancellationToken) {
      this.getCancellationToken = () => context.getCancellationToken !();
    }
    if (context.getDefaultLibLocation) {
      this.getDefaultLibLocation = () => context.getDefaultLibLocation !();
    }
    if (context.trace) {
      this.trace = s => context.trace !(s);
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
  }

  private resolveModuleName(moduleName: string, containingFile: string): ts.ResolvedModule
      |undefined {
    const rm = ts.resolveModuleName(
                     moduleName, containingFile, this.options, this, this.moduleResolutionCache)
                   .resolvedModule;
    if (rm && this.isSourceFile(rm.resolvedFileName)) {
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
    const originalImportedFile = importedFile;
    if (this.options.traceResolution) {
      console.error(
          'fileNameToModuleName from containingFile', containingFile, 'to importedFile',
          importedFile);
    }

    // drop extension
    importedFile = importedFile.replace(EXT, '');
    const importedFilePackagName = getPackageName(importedFile);
    const containingFilePackageName = getPackageName(containingFile);

    let moduleName: string;
    if (importedFilePackagName === containingFilePackageName) {
      const rootedContainingFile = relativeToRootDirs(containingFile, this.rootDirs);
      const rootedImportedFile = relativeToRootDirs(importedFile, this.rootDirs);

      if (rootedContainingFile !== containingFile && rootedImportedFile !== importedFile) {
        // if both files are contained in the `rootDirs`, then strip the rootDirs
        containingFile = rootedContainingFile;
        importedFile = rootedImportedFile;
      }
      moduleName = dotRelative(path.dirname(containingFile), importedFile);
    } else if (importedFilePackagName) {
      moduleName = stripNodeModulesPrefix(importedFile);
    } else {
      throw new Error(
          `Trying to import a source file from a node_modules package: import ${originalImportedFile} from ${containingFile}`);
    }
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
    const filePathWithNgResource =
        this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
    return filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
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
      return this.originalSourceFiles.get(filePath) !;
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

  getMetadataForSourceFile(filePath: string): ModuleMetadata|undefined {
    const sf = this.getOriginalSourceFile(filePath);
    if (!sf) {
      return undefined;
    }
    return this.metadataProvider.getMetadata(sf);
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
      throw new Error(
          `Illegal State: external references changed in ${genFile.genFileUrl}.\nOld: ${Array.from(oldRefs)}.\nNew: ${Array.from(newRefs)}`);
    }
    return this.addGeneratedFile(genFile, newRefs);
  }

  private addGeneratedFile(genFile: GeneratedFile, externalReferences: Set<string>): ts.SourceFile {
    if (!genFile.stmts) {
      throw new Error(
          `Invalid Argument: Expected a GenerateFile with statements. ${genFile.genFileUrl}`);
    }
    const {sourceText, context} = this.emitter.emitStatementsAndContext(
        genFile.srcFileUrl, genFile.genFileUrl, genFile.stmts, /* preamble */ '',
        /* emitSourceMaps */ false);
    const sf = ts.createSourceFile(
        genFile.genFileUrl, sourceText, this.options.target || ts.ScriptTarget.Latest);
    this.generatedSourceFiles.set(genFile.genFileUrl, {
      sourceFile: sf,
      emitCtx: context, externalReferences,
    });
    return sf;
  }

  shouldGenerateFile(fileName: string): {generate: boolean, baseFileName?: string} {
    // TODO(tbosch): allow generating files that are not in the rootDir
    // See https://github.com/angular/angular/issues/19337
    if (this.options.rootDir && !pathStartsWithPrefix(this.options.rootDir, fileName)) {
      return {generate: false};
    }
    const genMatch = GENERATED_FILES.exec(fileName);
    if (!genMatch) {
      return {generate: false};
    }
    const [, base, genSuffix, suffix] = genMatch;
    if (suffix !== 'ts') {
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
      // but the file from which we generated it can be a `.ts`/ `.d.ts`
      // (see options.generateCodeForLibraries).
      baseFileName = [`${base}.ts`, `${base}.d.ts`].find(
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
        (!this.options.rootDir || pathStartsWithPrefix(this.options.rootDir, fileName));
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
          genFileNames = this.codeGenerator.findGeneratedFileNames(fileName);
        }
        this.generatedCodeFor.set(fileName, genFileNames);
      }
    }
    if (sf) {
      addReferencesToSourceFile(sf, genFileNames);
    }
    // TODO(tbosch): TypeScript's typings for getSourceFile are incorrect,
    // as it can very well return undefined.
    return sf !;
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
    return super.loadSummary(filePath);
  }

  isSourceFile(filePath: string): boolean {
    // If we have a summary from a previous compilation,
    // treat the file never as a source file.
    if (this.librarySummaries.has(filePath)) {
      return false;
    }
    return super.isSourceFile(filePath);
  }

  readFile(fileName: string) {
    const summary = this.librarySummaries.get(fileName);
    if (summary) {
      return summary.text;
    }
    return this.context.readFile(fileName);
  }
  getDefaultLibFileName = (options: ts.CompilerOptions) =>
      this.context.getDefaultLibFileName(options)
  getCurrentDirectory = () => this.context.getCurrentDirectory();
  getCanonicalFileName = (fileName: string) => this.context.getCanonicalFileName(fileName);
  useCaseSensitiveFileNames = () => this.context.useCaseSensitiveFileNames();
  getNewLine = () => this.context.getNewLine();
  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  realPath = (p: string) => p;
  writeFile = this.context.writeFile.bind(this.context);
}

function genFileExternalReferences(genFile: GeneratedFile): Set<string> {
  return new Set(collectExternalReferences(genFile.stmts !).map(er => er.moduleName !));
}

function addReferencesToSourceFile(sf: ts.SourceFile, genFileNames: string[]) {
  // Note: as we modify ts.SourceFiles we need to keep the original
  // value for `referencedFiles` around in cache the original host is caching ts.SourceFiles.
  // Note: cloning the ts.SourceFile is expensive as the nodes in have parent pointers,
  // i.e. we would also need to clone and adjust all nodes.
  let originalReferencedFiles: ts.FileReference[]|undefined = (sf as any).originalReferencedFiles;
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

export function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  for (const dir of rootDirs || []) {
    const rel = pathStartsWithPrefix(dir, filePath);
    if (rel) {
      return rel;
    }
  }
  return filePath;
}

function pathStartsWithPrefix(prefix: string, fullPath: string): string|null {
  const rel = path.relative(prefix, fullPath);
  return rel.startsWith('..') ? null : rel;
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
