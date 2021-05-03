/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, AotCompilerOptions, createAotCompiler, GeneratedFile, toTypeScript} from '@angular/compiler';
import {MetadataBundlerHost} from '@angular/compiler-cli/src/metadata/bundler';
import {MetadataCollector} from '@angular/compiler-cli/src/metadata/collector';
import {ModuleMetadata} from '@angular/compiler-cli/src/metadata/index';
import {getCachedSourceFile} from '@angular/compiler-cli/src/ngtsc/testing';
import {newArray} from '@angular/compiler/src/util';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export interface MetadataProvider {
  getMetadata(source: ts.SourceFile): ModuleMetadata|undefined;
}

let nodeModulesPath: string;
let angularSourcePath: string;
let rootPath: string;

calcPathsOnDisc();

export type MockFileOrDirectory = string|MockDirectory;

export type MockDirectory = {
  [name: string]: MockFileOrDirectory|undefined;
};

export function isDirectory(data: MockFileOrDirectory|undefined): data is MockDirectory {
  return typeof data !== 'string';
}

const rxjs = /\/rxjs\//;
export const settings: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES5,
  declaration: true,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  removeComments: false,
  noImplicitAny: false,
  skipLibCheck: true,
  strictNullChecks: true,
  lib: ['lib.es2015.d.ts', 'lib.dom.d.ts'],
  types: []
};

export interface EmitterOptions {
  emitMetadata: boolean;
  mockData?: MockDirectory;
  context?: Map<string, string>;
}

function calcPathsOnDisc() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  if (distIndex >= 0) {
    rootPath = moduleFilename.substr(0, distIndex);
    nodeModulesPath = path.join(rootPath, 'node_modules');
    angularSourcePath = path.join(rootPath, 'packages');
  }
}


export class EmittingCompilerHost implements ts.CompilerHost {
  private addedFiles = new Map<string, string>();
  private writtenFiles = new Map<string, string>();
  private scriptNames: string[];
  private root = '/';
  private collector = new MetadataCollector();
  private cachedAddedDirectories: Set<string>|undefined;

  constructor(scriptNames: string[], private options: EmitterOptions) {
    // Rewrite references to scripts with '@angular' to its corresponding location in
    // the source tree.
    this.scriptNames = scriptNames.map(f => this.effectiveName(f));
    this.root = rootPath || this.root;
    if (options.context) {
      this.addedFiles = mergeMaps(options.context);
    }
  }

  public writtenAngularFiles(target = new Map<string, string>()): Map<string, string> {
    this.written.forEach((value, key) => {
      const path = `/node_modules/@angular${key.substring(angularSourcePath.length)}`;
      target.set(path, value);
    });
    return target;
  }

  public addScript(fileName: string, content: string) {
    const scriptName = this.effectiveName(fileName);
    this.addedFiles.set(scriptName, content);
    this.cachedAddedDirectories = undefined;
    this.scriptNames.push(scriptName);
  }

  public override(fileName: string, content: string) {
    const scriptName = this.effectiveName(fileName);
    this.addedFiles.set(scriptName, content);
    this.cachedAddedDirectories = undefined;
  }

  public addFiles(map: Map<string, string>) {
    for (const [name, content] of Array.from(map.entries())) {
      this.addedFiles.set(name, content);
    }
  }

  public addWrittenFile(fileName: string, content: string) {
    this.writtenFiles.set(this.effectiveName(fileName), content);
  }

  public getWrittenFiles(): {name: string, content: string}[] {
    return Array.from(this.writtenFiles).map(f => ({name: f[0], content: f[1]}));
  }

  public get scripts(): string[] {
    return this.scriptNames;
  }

  public get written(): Map<string, string> {
    return this.writtenFiles;
  }

  public effectiveName(fileName: string): string {
    const prefix = '@angular/';
    return angularSourcePath && fileName.startsWith(prefix) ?
        path.join(angularSourcePath, fileName.substr(prefix.length)) :
        fileName;
  }

  // ts.ModuleResolutionHost
  fileExists(fileName: string): boolean {
    return this.addedFiles.has(fileName) || open(fileName, this.options.mockData) != null ||
        fs.existsSync(fileName);
  }

  readFile(fileName: string): string {
    const result = this.addedFiles.get(fileName) || open(fileName, this.options.mockData);
    if (result) return result;

    let basename = path.basename(fileName);
    if (/^lib.*\.d\.ts$/.test(basename)) {
      let libPath = ts.getDefaultLibFilePath(settings);
      return fs.readFileSync(path.join(path.dirname(libPath), basename), 'utf8');
    }
    return fs.readFileSync(fileName, 'utf8');
  }

  directoryExists(directoryName: string): boolean {
    return directoryExists(directoryName, this.options.mockData) ||
        this.getAddedDirectories().has(directoryName) ||
        (fs.existsSync(directoryName) && fs.statSync(directoryName).isDirectory());
  }

  getCurrentDirectory(): string {
    return this.root;
  }

  getDirectories(dir: string): string[] {
    const result = open(dir, this.options.mockData);
    if (result && typeof result !== 'string') {
      return Object.keys(result);
    }
    return fs.readdirSync(dir).filter(p => {
      const name = path.join(dir, p);
      const stat = fs.statSync(name);
      return stat && stat.isDirectory();
    });
  }

  // ts.CompilerHost
  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    const content = this.readFile(fileName);
    if (content) {
      const cachedSf = getCachedSourceFile(fileName, () => content);
      if (cachedSf !== null) {
        return cachedSf;
      }
      return ts.createSourceFile(fileName, content, languageVersion, /* setParentNodes */ true);
    }
    throw new Error(`File not found '${fileName}'.`);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return 'lib.d.ts';
  }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ReadonlyArray<ts.SourceFile>) => {
        this.addWrittenFile(fileName, data);
        if (this.options.emitMetadata && sourceFiles && sourceFiles.length && DTS.test(fileName)) {
          const metadataFilePath = fileName.replace(DTS, '.metadata.json');
          const metadata = this.collector.getMetadata(sourceFiles[0]);
          if (metadata) {
            this.addWrittenFile(metadataFilePath, JSON.stringify(metadata));
          }
        }
      }

  getCanonicalFileName(fileName: string): string {
    return fileName;
  }
  useCaseSensitiveFileNames(): boolean {
    return false;
  }
  getNewLine(): string {
    return '\n';
  }

  private getAddedDirectories(): Set<string> {
    let result = this.cachedAddedDirectories;
    if (!result) {
      const newCache = new Set<string>();
      const addFile = (fileName: string) => {
        const directory = fileName.substr(0, fileName.lastIndexOf('/'));
        if (!newCache.has(directory)) {
          newCache.add(directory);
          addFile(directory);
        }
      };
      Array.from(this.addedFiles.keys()).forEach(addFile);
      this.cachedAddedDirectories = result = newCache;
    }
    return result;
  }
}

export class MockCompilerHost implements ts.CompilerHost {
  scriptNames: string[];

  public overrides = new Map<string, string>();
  public writtenFiles = new Map<string, string>();
  private sourceFiles = new Map<string, ts.SourceFile>();
  private assumeExists = new Set<string>();
  private traces: string[] = [];

  constructor(scriptNames: string[], private data: MockDirectory) {
    this.scriptNames = [...scriptNames];
  }

  // Test API
  override(fileName: string, content: string) {
    if (content) {
      this.overrides.set(fileName, content);
    } else {
      this.overrides.delete(fileName);
    }
    this.sourceFiles.delete(fileName);
  }

  addScript(fileName: string, content: string) {
    this.overrides.set(fileName, content);
    this.scriptNames.push(fileName);
    this.sourceFiles.delete(fileName);
  }

  assumeFileExists(fileName: string) {
    this.assumeExists.add(fileName);
  }

  remove(files: string[]) {
    // Remove the files from the list of scripts.
    const fileSet = new Set(files);
    this.scriptNames = this.scriptNames.filter(f => fileSet.has(f));

    // Remove files from written files
    files.forEach(f => this.writtenFiles.delete(f));
  }

  // ts.ModuleResolutionHost
  fileExists(fileName: string): boolean {
    if (this.overrides.has(fileName) || this.writtenFiles.has(fileName) ||
        this.assumeExists.has(fileName)) {
      return true;
    }
    const effectiveName = this.getEffectiveName(fileName);
    if (effectiveName == fileName) {
      return open(fileName, this.data) != null;
    }
    if (fileName.match(rxjs)) {
      return fs.existsSync(effectiveName);
    }
    return false;
  }

  readFile(fileName: string): string {
    return this.getFileContent(fileName)!;
  }

  trace(s: string): void {
    this.traces.push(s);
  }

  getCurrentDirectory(): string {
    return '/';
  }

  getDirectories(dir: string): string[] {
    const effectiveName = this.getEffectiveName(dir);
    if (effectiveName === dir) {
      const data = find(dir, this.data);
      if (isDirectory(data)) {
        return Object.keys(data).filter(k => isDirectory(data[k]));
      }
    }
    return [];
  }

  // ts.CompilerHost
  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile|undefined {
    let result = this.sourceFiles.get(fileName);
    if (!result) {
      const content = this.getFileContent(fileName);
      const cachedSf = getCachedSourceFile(fileName, () => content);
      if (cachedSf !== null) {
        return cachedSf;
      }
      if (content) {
        result = ts.createSourceFile(fileName, content, languageVersion);
        this.sourceFiles.set(fileName, result);
      }
    }
    return result;
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return 'lib.d.ts';
  }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean) => {
        this.writtenFiles.set(fileName, data);
        this.sourceFiles.delete(fileName);
      }

  getCanonicalFileName(fileName: string): string {
    return fileName;
  }
  useCaseSensitiveFileNames(): boolean {
    return false;
  }
  getNewLine(): string {
    return '\n';
  }

  // Private methods
  private getFileContent(fileName: string): string|undefined {
    if (this.overrides.has(fileName)) {
      return this.overrides.get(fileName);
    }
    if (this.writtenFiles.has(fileName)) {
      return this.writtenFiles.get(fileName);
    }
    let basename = path.basename(fileName);
    if (/^lib.*\.d\.ts$/.test(basename)) {
      let libPath = ts.getDefaultLibFilePath(settings);
      return fs.readFileSync(path.join(path.dirname(libPath), basename), 'utf8');
    }
    let effectiveName = this.getEffectiveName(fileName);
    if (effectiveName === fileName) {
      return open(fileName, this.data);
    }
    if (fileName.match(rxjs) && fs.existsSync(fileName)) {
      return fs.readFileSync(fileName, 'utf8');
    }
  }

  private getEffectiveName(name: string): string {
    const node_modules = 'node_modules';
    const rxjs = '/rxjs';
    if (name.startsWith('/' + node_modules)) {
      if (nodeModulesPath && name.startsWith('/' + node_modules + rxjs)) {
        return path.join(nodeModulesPath, name.substr(node_modules.length + 1));
      }
    }
    return name;
  }
}

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;
const GENERATED_FILES = /\.ngfactory\.ts$|\.ngstyle\.ts$/;

export class MockAotCompilerHost implements AotCompilerHost {
  private metadataVisible: boolean = true;
  private dtsAreSource: boolean = true;
  private resolveModuleNameHost: ts.ModuleResolutionHost;

  constructor(
      private tsHost: MockCompilerHost,
      private metadataProvider: MetadataProvider = new MetadataCollector()) {
    this.resolveModuleNameHost = Object.create(tsHost);
    this.resolveModuleNameHost.fileExists = (fileName) => {
      fileName = stripNgResourceSuffix(fileName);
      return tsHost.fileExists(fileName);
    };
  }

  hideMetadata() {
    this.metadataVisible = false;
  }

  tsFilesOnly() {
    this.dtsAreSource = false;
  }

  // StaticSymbolResolverHost
  getMetadataFor(modulePath: string): {[key: string]: any}[]|undefined {
    if (!this.tsHost.fileExists(modulePath)) {
      return undefined;
    }
    if (DTS.test(modulePath)) {
      if (this.metadataVisible) {
        const metadataPath = modulePath.replace(DTS, '.metadata.json');
        if (this.tsHost.fileExists(metadataPath)) {
          let result = JSON.parse(this.tsHost.readFile(metadataPath)) as {[key: string]: any}[];
          return Array.isArray(result) ? result : [result];
        }
      }
    } else {
      const sf = this.tsHost.getSourceFile(modulePath, ts.ScriptTarget.Latest);
      const metadata = sf && this.metadataProvider.getMetadata(sf);
      return metadata ? [metadata] : [];
    }
    return undefined;
  }

  moduleNameToFileName(moduleName: string, containingFile: string): string|null {
    if (!containingFile || !containingFile.length) {
      if (moduleName.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = path.join('/', 'index.ts');
    }
    moduleName = moduleName.replace(EXT, '');
    const resolved = ts.resolveModuleName(
                           moduleName, containingFile.replace(/\\/g, '/'),
                           {baseDir: '/', genDir: '/'}, this.resolveModuleNameHost)
                         .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  }

  getOutputName(filePath: string) {
    return filePath;
  }

  resourceNameToFileName(resourceName: string, containingFile: string) {
    // Note: we convert package paths into relative paths to be compatible with the the
    // previous implementation of UrlResolver.
    if (resourceName && resourceName.charAt(0) !== '.' && !path.isAbsolute(resourceName)) {
      resourceName = `./${resourceName}`;
    }
    const filePathWithNgResource =
        this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
    return filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
  }

  // AotSummaryResolverHost
  loadSummary(filePath: string): string|null {
    return this.tsHost.readFile(filePath);
  }

  isSourceFile(sourceFilePath: string): boolean {
    return !GENERATED_FILES.test(sourceFilePath) &&
        (this.dtsAreSource || !DTS.test(sourceFilePath));
  }

  toSummaryFileName(filePath: string): string {
    return filePath.replace(EXT, '') + '.d.ts';
  }

  fromSummaryFileName(filePath: string): string {
    return filePath;
  }

  // AotCompilerHost
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    return importedFile.replace(EXT, '');
  }

  loadResource(path: string): string {
    if (this.tsHost.fileExists(path)) {
      return this.tsHost.readFile(path);
    } else {
      throw new Error(`Resource ${path} not found.`);
    }
  }
}

export class MockMetadataBundlerHost implements MetadataBundlerHost {
  private collector = new MetadataCollector();

  constructor(private host: ts.CompilerHost) {}

  getMetadataFor(moduleName: string): ModuleMetadata|undefined {
    const source = this.host.getSourceFile(moduleName + '.ts', ts.ScriptTarget.Latest);
    return source && this.collector.getMetadata(source);
  }
}

function find(fileName: string, data: MockFileOrDirectory|undefined): MockFileOrDirectory|
    undefined {
  if (!data) return undefined;
  const names = fileName.split('/');
  if (names.length && !names[0].length) names.shift();
  let current: MockFileOrDirectory|undefined = data;
  for (const name of names) {
    if (typeof current !== 'object') {
      return undefined;
    }
    current = current[name];
  }
  return current;
}

function open(fileName: string, data: MockFileOrDirectory|undefined): string|undefined {
  let result = find(fileName, data);
  if (typeof result === 'string') {
    return result;
  }
  return undefined;
}

function directoryExists(dirname: string, data: MockFileOrDirectory|undefined): boolean {
  let result = find(dirname, data);
  return !!result && typeof result !== 'string';
}

export type MockFileArray = {
  fileName: string,
  content: string
}[];

export type MockData = MockDirectory|Map<string, string>|(MockDirectory|Map<string, string>)[];

export function toMockFileArray(data: MockData, target: MockFileArray = []): MockFileArray {
  if (data instanceof Map) {
    mapToMockFileArray(data, target);
  } else if (Array.isArray(data)) {
    data.forEach(entry => toMockFileArray(entry, target));
  } else {
    mockDirToFileArray(data, '', target);
  }
  return target;
}

function mockDirToFileArray(dir: MockDirectory, path: string, target: MockFileArray) {
  Object.keys(dir).forEach((localFileName) => {
    const value = dir[localFileName]!;
    const fileName = `${path}/${localFileName}`;
    if (typeof value === 'string') {
      target.push({fileName, content: value});
    } else {
      mockDirToFileArray(value, fileName, target);
    }
  });
}

function mapToMockFileArray(files: Map<string, string>, target: MockFileArray) {
  files.forEach((content, fileName) => {
    target.push({fileName, content});
  });
}

export function arrayToMockMap(arr: MockFileArray): Map<string, string> {
  const map = new Map<string, string>();
  arr.forEach(({fileName, content}) => {
    map.set(fileName, content);
  });
  return map;
}

export function arrayToMockDir(arr: MockFileArray): MockDirectory {
  const rootDir: MockDirectory = {};
  arr.forEach(({fileName, content}) => {
    let pathParts = fileName.split('/');
    // trim trailing slash
    let startIndex = pathParts[0] ? 0 : 1;
    // get/create the directory
    let currentDir = rootDir;
    for (let i = startIndex; i < pathParts.length - 1; i++) {
      const pathPart = pathParts[i];
      let localDir = <MockDirectory>currentDir[pathPart];
      if (!localDir) {
        currentDir[pathPart] = localDir = {};
      }
      currentDir = localDir;
    }
    // write the file
    currentDir[pathParts[pathParts.length - 1]] = content;
  });
  return rootDir;
}

const minCoreIndex = `
  export * from './src/application_module';
  export * from './src/change_detection';
  export * from './src/metadata';
  export * from './src/di/metadata';
  export * from './src/di/injectable';
  export * from './src/di/injector';
  export * from './src/di/injection_token';
  export * from './src/linker';
  export * from './src/render';
  export * from './src/codegen_private_exports';
`;

function readBazelWrittenFilesFrom(
    bazelPackageRoot: string, packageName: string, map: Map<string, string>,
    skip: (name: string, fullName: string) => boolean = () => false) {
  function processDirectory(dir: string, dest: string) {
    const entries = fs.readdirSync(dir);
    for (const name of entries) {
      const fullName = path.posix.join(dir, name);
      const destName = path.posix.join(dest, name);
      const stat = fs.statSync(fullName);
      if (!skip(name, fullName)) {
        if (stat.isDirectory()) {
          processDirectory(fullName, destName);
        } else {
          const content = fs.readFileSync(fullName, 'utf8');
          map.set(destName, content);
        }
      }
    }
  }
  try {
    processDirectory(bazelPackageRoot, path.posix.join('/node_modules/@angular', packageName));
    // todo: check why we always need an index.d.ts
    if (fs.existsSync(path.join(bazelPackageRoot, `${packageName}.d.ts`))) {
      const content = fs.readFileSync(path.join(bazelPackageRoot, `${packageName}.d.ts`), 'utf8');
      map.set(path.posix.join('/node_modules/@angular', packageName, 'index.d.ts'), content);
    }
  } catch (e) {
    console.error(`Consider adding //packages/${
        packageName} as a data dependency in the BUILD.bazel rule for the failing test`);
    throw e;
  }
}

export function isInBazel(): boolean {
  return process.env.TEST_SRCDIR != null;
}

export function setup(options: {
  compileAngular: boolean,
  compileFakeCore?: boolean, compileAnimations: boolean,
  compileCommon?: boolean
} = {
  compileAngular: true,
  compileAnimations: true,
  compileCommon: false,
  compileFakeCore: false,
}) {
  let angularFiles = new Map<string, string>();

  beforeAll(() => {
    const sources = process.env.TEST_SRCDIR;
    if (sources) {
      // If running under bazel then we get the compiled version of the files from the bazel package
      // output.
      const bundles = new Set([
        'bundles', 'esm2015', 'esm5', 'testing', 'testing.d.ts', 'testing.metadata.json', 'browser',
        'browser.d.ts'
      ]);
      const skipDirs = (name: string) => bundles.has(name);
      if (options.compileAngular) {
        // If this fails please add //packages/core:npm_package as a test data dependency.
        readBazelWrittenFilesFrom(
            resolveNpmTreeArtifact('angular/packages/core/npm_package'), 'core', angularFiles,
            skipDirs);
      }
      if (options.compileFakeCore) {
        readBazelWrittenFilesFrom(
            resolveNpmTreeArtifact(
                'angular/packages/compiler-cli/src/ngtsc/testing/fake_core/npm_package'),
            'core', angularFiles, skipDirs);
      }
      if (options.compileAnimations) {
        // If this fails please add //packages/animations:npm_package as a test data dependency.
        readBazelWrittenFilesFrom(
            resolveNpmTreeArtifact('angular/packages/animations/npm_package'), 'animations',
            angularFiles, skipDirs);
      }
      if (options.compileCommon) {
        // If this fails please add //packages/common:npm_package as a test data dependency.
        readBazelWrittenFilesFrom(
            resolveNpmTreeArtifact('angular/packages/common/npm_package'), 'common', angularFiles,
            skipDirs);
      }
      return;
    }

    if (options.compileAngular) {
      const emittingHost = new EmittingCompilerHost([], {emitMetadata: true});
      emittingHost.addScript('@angular/core/index.ts', minCoreIndex);
      const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
      emittingProgram.emit();
      emittingHost.writtenAngularFiles(angularFiles);
    }
    if (options.compileCommon) {
      const emittingHost =
          new EmittingCompilerHost(['@angular/common/index.ts'], {emitMetadata: true});
      const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
      emittingProgram.emit();
      emittingHost.writtenAngularFiles(angularFiles);
    }
    if (options.compileAnimations) {
      const emittingHost =
          new EmittingCompilerHost(['@angular/animations/index.ts'], {emitMetadata: true});
      const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
      emittingProgram.emit();
      emittingHost.writtenAngularFiles(angularFiles);
    }
  });

  return angularFiles;
}

export function expectNoDiagnostics(program: ts.Program) {
  function fileInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      return `${diagnostic.file.fileName}(${diagnostic.start}): `;
    }
    return '';
  }

  function chars(len: number, ch: string): string {
    return newArray(len, ch).join('');
  }

  function lineNoOf(offset: number, text: string): number {
    let result = 1;
    for (let i = 0; i < offset; i++) {
      if (text[i] == '\n') result++;
    }
    return result;
  }

  function lineInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      const start = diagnostic.start!;
      let end = diagnostic.start! + diagnostic.length!;
      const source = diagnostic.file.text;
      let lineStart = start;
      let lineEnd = end;
      while (lineStart > 0 && source[lineStart] != '\n') lineStart--;
      if (lineStart < start) lineStart++;
      while (lineEnd < source.length && source[lineEnd] != '\n') lineEnd++;
      let line = source.substring(lineStart, lineEnd);
      const lineIndex = line.indexOf('/n');
      if (lineIndex > 0) {
        line = line.substr(0, lineIndex);
        end = start + lineIndex;
      }
      const lineNo = lineNoOf(start, source) + ': ';
      return '\n' + lineNo + line + '\n' + chars(start - lineStart + lineNo.length, ' ') +
          chars(end - start, '^');
    }
    return '';
  }

  function expectNoDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>) {
    if (diagnostics && diagnostics.length) {
      throw new Error(
          'Errors from TypeScript:\n' +
          diagnostics
              .map(
                  d => `${fileInfo(d)}${ts.flattenDiagnosticMessageText(d.messageText, '\n')}${
                      lineInfo(d)}`)
              .join(' \n'));
    }
  }
  expectNoDiagnostics(program.getOptionsDiagnostics());
  expectNoDiagnostics(program.getSyntacticDiagnostics());
  expectNoDiagnostics(program.getSemanticDiagnostics());
}

export function isSource(fileName: string): boolean {
  return !isDts(fileName) && /\.ts$/.test(fileName);
}

function isDts(fileName: string): boolean {
  return /\.d.ts$/.test(fileName);
}

function isSourceOrDts(fileName: string): boolean {
  return /\.ts$/.test(fileName) && !/(ngfactory|ngstyle|ngsummary).d.ts$/.test(fileName);
}

function resolveNpmTreeArtifact(manifestPath: string, resolveFile = 'package.json') {
  return path.dirname(require.resolve(path.posix.join(manifestPath, resolveFile)));
}

export function compile(
    rootDirs: MockData, options: {
      emit?: boolean,
      useSummaries?: boolean,
      preCompile?: (program: ts.Program) => void,
      postCompile?: (program: ts.Program) => void,
    }&AotCompilerOptions = {},
    tsOptions: ts.CompilerOptions = {}): {genFiles: GeneratedFile[], outDir: MockDirectory} {
  // when using summaries, always emit so the next step can use the results.
  const emit = options.emit || options.useSummaries;
  const preCompile = options.preCompile || (() => {});
  const postCompile = options.postCompile || expectNoDiagnostics;
  const rootDirArr = toMockFileArray(rootDirs);
  const scriptNames = rootDirArr.map(entry => entry.fileName)
                          .filter(options.useSummaries ? isSource : isSourceOrDts);

  const host = new MockCompilerHost(scriptNames, arrayToMockDir(rootDirArr));
  const aotHost = new MockAotCompilerHost(host);
  if (options.useSummaries) {
    aotHost.hideMetadata();
    aotHost.tsFilesOnly();
  }
  const tsSettings = {...settings, ...tsOptions};
  const program = ts.createProgram([...host.scriptNames], tsSettings, host);
  preCompile(program);
  const {compiler, reflector} = createAotCompiler(aotHost, options, (err) => {
    throw err;
  });
  const analyzedModules =
      compiler.analyzeModulesSync(program.getSourceFiles().map(sf => sf.fileName));
  const genFiles = compiler.emitAllImpls(analyzedModules);
  genFiles.forEach((file) => {
    const source = file.source || toTypeScript(file);
    if (isSource(file.genFileUrl)) {
      host.addScript(file.genFileUrl, source);
    } else {
      host.override(file.genFileUrl, source);
    }
  });
  const newProgram = ts.createProgram([...host.scriptNames], tsSettings, host);
  postCompile(newProgram);
  if (emit) {
    newProgram.emit();
  }
  let outDir: MockDirectory = {};
  if (emit) {
    const dtsFilesWithGenFiles = new Set<string>(genFiles.map(gf => gf.srcFileUrl).filter(isDts));
    outDir =
        arrayToMockDir(toMockFileArray([host.writtenFiles, host.overrides])
                           .filter((entry) => !isSource(entry.fileName))
                           .concat(rootDirArr.filter(e => dtsFilesWithGenFiles.has(e.fileName))));
  }
  return {genFiles, outDir};
}

function stripNgResourceSuffix(fileName: string): string {
  return fileName.replace(/\.\$ngresource\$.*/, '');
}

function addNgResourceSuffix(fileName: string): string {
  return `${fileName}.$ngresource$`;
}

function extractFileNames(directory: MockDirectory): string[] {
  const result: string[] = [];
  const scan = (directory: MockDirectory, prefix: string) => {
    for (let name of Object.getOwnPropertyNames(directory)) {
      const entry = directory[name];
      const fileName = `${prefix}/${name}`;
      if (typeof entry === 'string') {
        result.push(fileName);
      } else if (entry) {
        scan(entry, fileName);
      }
    }
  };
  scan(directory, '');
  return result;
}

export function emitLibrary(
    context: Map<string, string>, mockData: MockDirectory,
    scriptFiles?: string[]): Map<string, string> {
  const emittingHost = new EmittingCompilerHost(
      scriptFiles || extractFileNames(mockData), {emitMetadata: true, mockData, context});
  const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
  expectNoDiagnostics(emittingProgram);
  emittingProgram.emit();
  return emittingHost.written;
}

export function mergeMaps<K, V>(...maps: Map<K, V>[]): Map<K, V> {
  const result = new Map<K, V>();

  for (const map of maps) {
    for (const [key, value] of Array.from(map.entries())) {
      result.set(key, value);
    }
  }

  return result;
}
