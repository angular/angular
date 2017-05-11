/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, AotCompilerOptions, GeneratedFile, createAotCompiler} from '@angular/compiler';
import {ɵReflectionCapabilities as ReflectionCapabilities, ɵreflector as reflector} from '@angular/core';
import {MetadataBundlerHost, MetadataCollector, ModuleMetadata} from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

let nodeModulesPath: string;
let angularSourcePath: string;
let rootPath: string;

calcPathsOnDisc();

export type MockFileOrDirectory = string | MockDirectory;

export type MockDirectory = {
  [name: string]: MockFileOrDirectory | undefined;
};

export function isDirectory(data: MockFileOrDirectory | undefined): data is MockDirectory {
  return typeof data !== 'string';
}

const NODE_MODULES = '/node_modules/';
const IS_GENERATED = /\.(ngfactory|ngstyle)$/;
const angularts = /@angular\/(\w|\/|-)+\.tsx?$/;
const rxjs = /\/rxjs\//;
const tsxfile = /\.tsx$/;
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

  constructor(scriptNames: string[], private options: EmitterOptions) {
    // Rewrite references to scripts with '@angular' to its corresponding location in
    // the source tree.
    this.scriptNames = scriptNames.map(f => this.effectiveName(f));
    this.root = rootPath;
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
    this.scriptNames.push(scriptName);
  }

  public override(fileName: string, content: string) {
    const scriptName = this.effectiveName(fileName);
    this.addedFiles.set(scriptName, content);
  }

  public addWrittenFile(fileName: string, content: string) {
    this.writtenFiles.set(this.effectiveName(fileName), content);
  }

  public getWrittenFiles(): {name: string, content: string}[] {
    return Array.from(this.writtenFiles).map(f => ({name: f[0], content: f[1]}));
  }

  public get scripts(): string[] { return this.scriptNames; }

  public get written(): Map<string, string> { return this.writtenFiles; }

  public effectiveName(fileName: string): string {
    const prefix = '@angular/';
    return fileName.startsWith('@angular/') ?
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
        (fs.existsSync(directoryName) && fs.statSync(directoryName).isDirectory());
  }

  getCurrentDirectory(): string { return this.root; }

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
      return ts.createSourceFile(fileName, content, languageVersion, /* setParentNodes */ true);
    }
    throw new Error(`File not found '${fileName}'.`);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string { return 'lib.d.ts'; }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
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
  useCaseSensitiveFileNames(): boolean { return false; }
  getNewLine(): string { return '\n'; }
}

export class MockCompilerHost implements ts.CompilerHost {
  scriptNames: string[];

  public overrides = new Map<string, string>();
  public writtenFiles = new Map<string, string>();
  private sourceFiles = new Map<string, ts.SourceFile>();
  private assumeExists = new Set<string>();
  private traces: string[] = [];

  constructor(scriptNames: string[], private data: MockDirectory) {
    this.scriptNames = scriptNames.slice(0);
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

  assumeFileExists(fileName: string) { this.assumeExists.add(fileName); }

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
      let result = open(fileName, this.data) != null;
      return result;
    } else {
      if (fileName.match(rxjs)) {
        let result = fs.existsSync(effectiveName);
        return result;
      }
      return false;
    }
  }

  readFile(fileName: string): string { return this.getFileContent(fileName) !; }

  trace(s: string): void { this.traces.push(s); }

  getCurrentDirectory(): string { return '/'; }

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
      onError?: (message: string) => void): ts.SourceFile {
    let result = this.sourceFiles.get(fileName);
    if (!result) {
      const content = this.getFileContent(fileName);
      if (content) {
        result = ts.createSourceFile(fileName, content, languageVersion);
        this.sourceFiles.set(fileName, result);
      }
    }
    return result !;
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string { return 'lib.d.ts'; }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean) => {
        this.writtenFiles.set(fileName, data);
        this.sourceFiles.delete(fileName);
      }

  getCanonicalFileName(fileName: string): string {
    return fileName;
  }
  useCaseSensitiveFileNames(): boolean { return false; }
  getNewLine(): string { return '\n'; }

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
    } else {
      let effectiveName = this.getEffectiveName(fileName);
      if (effectiveName === fileName) {
        const result = open(fileName, this.data);
        return result;
      } else {
        if (fileName.match(rxjs)) {
          if (fs.existsSync(fileName)) {
            return fs.readFileSync(fileName, 'utf8');
          }
        }
      }
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
  private metadataCollector = new MetadataCollector();
  private metadataVisible: boolean = true;
  private dtsAreSource: boolean = true;

  constructor(private tsHost: MockCompilerHost) {}

  hideMetadata() { this.metadataVisible = false; }

  tsFilesOnly() { this.dtsAreSource = false; }

  // StaticSymbolResolverHost
  getMetadataFor(modulePath: string): {[key: string]: any}[]|undefined {
    if (!this.tsHost.fileExists(modulePath)) {
      return undefined;
    }
    if (DTS.test(modulePath)) {
      if (this.metadataVisible) {
        const metadataPath = modulePath.replace(DTS, '.metadata.json');
        if (this.tsHost.fileExists(metadataPath)) {
          let result = JSON.parse(this.tsHost.readFile(metadataPath));
          return Array.isArray(result) ? result : [result];
        }
      }
    } else {
      const sf = this.tsHost.getSourceFile(modulePath, ts.ScriptTarget.Latest);
      const metadata = this.metadataCollector.getMetadata(sf);
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
                           {baseDir: '/', genDir: '/'}, this.tsHost)
                         .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  }

  // AotSummaryResolverHost
  loadSummary(filePath: string): string|null { return this.tsHost.readFile(filePath); }

  isSourceFile(sourceFilePath: string): boolean {
    return !GENERATED_FILES.test(sourceFilePath) &&
        (this.dtsAreSource || !DTS.test(sourceFilePath));
  }

  getOutputFileName(sourceFilePath: string): string {
    return sourceFilePath.replace(EXT, '') + '.d.ts';
  }

  // AotCompilerHost
  fileNameToModuleName(importedFile: string, containingFile: string): string|null {
    return importedFile.replace(EXT, '');
  }

  loadResource(path: string): Promise<string> {
    if (this.tsHost.fileExists(path)) {
      return Promise.resolve(this.tsHost.readFile(path));
    } else {
      return Promise.reject(new Error(`Resource ${path} not found.`))
    }
  }
}

export class MockMetadataBundlerHost implements MetadataBundlerHost {
  private collector = new MetadataCollector();

  constructor(private host: ts.CompilerHost) {}

  getMetadataFor(moduleName: string): ModuleMetadata {
    const source = this.host.getSourceFile(moduleName + '.ts', ts.ScriptTarget.Latest);
    return this.collector.getMetadata(source);
  }
}

function find(fileName: string, data: MockFileOrDirectory | undefined): MockFileOrDirectory|
    undefined {
  if (!data) return undefined;
  let names = fileName.split('/');
  if (names.length && !names[0].length) names.shift();
  let current: MockFileOrDirectory|undefined = data;
  for (let name of names) {
    if (typeof current === 'string')
      return undefined;
    else
      current = (<MockDirectory>current)[name];
    if (!current) return undefined;
  }
  return current;
}

function open(fileName: string, data: MockFileOrDirectory | undefined): string|undefined {
  let result = find(fileName, data);
  if (typeof result === 'string') {
    return result;
  }
  return undefined;
}

function directoryExists(dirname: string, data: MockFileOrDirectory | undefined): boolean {
  let result = find(dirname, data);
  return !!result && typeof result !== 'string';
}

export type MockFileArray = {
  fileName: string,
  content: string
}[];

export type MockData = MockDirectory | Map<string, string>| (MockDirectory | Map<string, string>)[];

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
    const value = dir[localFileName] !;
    const fileName = `${path}/${localFileName}`;
    if (typeof value === 'string') {
      target.push({fileName, content: value});
    } else {
      mockDirToFileArray(value, fileName, target);
    }
  });
}

function mapToMockFileArray(files: Map<string, string>, target: MockFileArray) {
  files.forEach((content, fileName) => { target.push({fileName, content}); });
}

export function arrayToMockMap(arr: MockFileArray): Map<string, string> {
  const map = new Map<string, string>();
  arr.forEach(({fileName, content}) => { map.set(fileName, content); });
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
  export * from './src/di/injector';
  export * from './src/di/injection_token';
  export * from './src/linker';
  export * from './src/render';
  export * from './src/codegen_private_exports';
`;

export function setup(options: {compileAngular: boolean} = {
  compileAngular: true
}) {
  let angularFiles = new Map<string, string>();

  beforeAll(() => {
    if (options.compileAngular) {
      const emittingHost = new EmittingCompilerHost([], {emitMetadata: true});
      emittingHost.addScript('@angular/core/index.ts', minCoreIndex);
      const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
      emittingProgram.emit();
      emittingHost.writtenAngularFiles(angularFiles);
    }
  });
  // Restore reflector since AoT compiler will update it with a new static reflector
  afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });

  return angularFiles;
}

export function expectNoDiagnostics(program: ts.Program) {
  function fileInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      return `${diagnostic.file.fileName}(${diagnostic.start}): `;
    }
    return '';
  }

  function chars(len: number, ch: string): string { return new Array(len).fill(ch).join(''); }

  function lineNoOf(offset: number, text: string): number {
    let result = 1;
    for (let i = 0; i < offset; i++) {
      if (text[i] == '\n') result++;
    }
    return result;
  }

  function lineInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      const start = diagnostic.start;
      let end = diagnostic.start + diagnostic.length;
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

  function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
    if (diagnostics && diagnostics.length) {
      throw new Error(
          'Errors from TypeScript:\n' +
          diagnostics.map(d => `${fileInfo(d)}${d.messageText}${lineInfo(d)}`).join(' \n'));
    }
  }
  expectNoDiagnostics(program.getOptionsDiagnostics());
  expectNoDiagnostics(program.getSyntacticDiagnostics());
  expectNoDiagnostics(program.getSemanticDiagnostics());
}

function isSource(fileName: string): boolean {
  return !/\.d\.ts$/.test(fileName) && /\.ts$/.test(fileName);
}

export function compile(
    rootDirs: MockData, options: {
      emit?: boolean,
      useSummaries?: boolean,
      preCompile?: (program: ts.Program) => void,
      postCompile?: (program: ts.Program) => void,
    }& AotCompilerOptions = {},
    tsOptions: ts.CompilerOptions = {}):
    Promise<{genFiles: GeneratedFile[], outDir: MockDirectory}> {
  // Make sure we always return errors via the promise...
  return Promise.resolve(null).then(() => {
    // when using summaries, always emit so the next step can use the results.
    const emit = options.emit || options.useSummaries;
    const preCompile = options.preCompile || expectNoDiagnostics;
    const postCompile = options.postCompile || expectNoDiagnostics;
    const rootDirArr = toMockFileArray(rootDirs);
    const scriptNames = rootDirArr.map(entry => entry.fileName).filter(isSource);

    const host = new MockCompilerHost(scriptNames, arrayToMockDir(rootDirArr));
    const aotHost = new MockAotCompilerHost(host);
    if (options.useSummaries) {
      aotHost.hideMetadata();
      aotHost.tsFilesOnly();
    }
    const tsSettings = {...settings, ...tsOptions};
    const scripts = host.scriptNames.slice(0);
    const program = ts.createProgram(scripts, tsSettings, host);
    if (preCompile) preCompile(program);
    const {compiler, reflector} = createAotCompiler(aotHost, options);
    return compiler.compileAll(program.getSourceFiles().map(sf => sf.fileName)).then(genFiles => {
      genFiles.forEach(
          file => isSource(file.genFileUrl) ? host.addScript(file.genFileUrl, file.source) :
                                              host.override(file.genFileUrl, file.source));
      const scripts = host.scriptNames.slice(0);
      const newProgram = ts.createProgram(scripts, tsSettings, host);
      if (postCompile) postCompile(newProgram);
      if (emit) {
        newProgram.emit();
      }
      let outDir: MockDirectory = {};
      if (emit) {
        outDir = arrayToMockDir(toMockFileArray([
                                  host.writtenFiles, host.overrides
                                ]).filter((entry) => !isSource(entry.fileName)));
      }
      return {genFiles, outDir};
    });
  });
}
