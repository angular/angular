/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @fileoverview provides adapters for communicating with the ng compiler */

import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath, FileStats, FileSystem, PathSegment, PathString} from '@angular/compiler-cli/src/ngtsc/file_system';
import {AdapterResourceLoader} from '@angular/compiler-cli/src/ngtsc/resource';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import * as p from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';
import {ResourceResolver} from './definitions';

import {isTypeScriptFile} from './utils';

export class LanguageServiceAdapter implements NgCompilerAdapter, ResourceResolver {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly factoryTracker = null;      // no .ngfactory shims
  readonly unifiedModulesHost = null;  // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];
  private readonly templateVersion = new Map<string, string>();

  constructor(readonly project: ts.server.Project) {
    this.rootDirs = project.getCompilationSettings().rootDirs?.map(absoluteFrom) || [];
  }

  isShim(sf: ts.SourceFile): boolean {
    return isShim(sf);
  }

  fileExists(fileName: string): boolean {
    return this.project.fileExists(fileName);
  }

  readFile(fileName: AbsoluteFsPath): string|undefined {
    return this.project.readFile(fileName);
  }

  getCurrentDirectory(): string {
    return this.project.getCurrentDirectory();
  }

  getCanonicalFileName(fileName: string): string {
    return this.project.projectService.toCanonicalFileName(fileName);
  }

  /**
   * readResource() is an Angular-specific method for reading files that are not
   * managed by the TS compiler host, namely templates and stylesheets.
   * It is a method on ExtendedTsCompilerHost, see
   * packages/compiler-cli/src/ngtsc/core/api/src/interfaces.ts
   */
  readResource(fileName: string): string {
    if (isTypeScriptFile(fileName)) {
      throw new Error(`readResource() should not be called on TS file: ${fileName}`);
    }
    // Calling getScriptSnapshot() will actually create a ScriptInfo if it does
    // not exist! The same applies for getScriptVersion().
    // getScriptInfo() will not create one if it does not exist.
    // In this case, we *want* a script info to be created so that we could
    // keep track of its version.
    const snapshot = this.project.getScriptSnapshot(fileName);
    if (!snapshot) {
      // This would fail if the file does not exist, or readFile() fails for
      // whatever reasons.
      throw new Error(`Failed to get script snapshot while trying to read ${fileName}`);
    }
    const version = this.project.getScriptVersion(fileName);
    this.templateVersion.set(fileName, version);
    return snapshot.getText(0, snapshot.getLength());
  }

  isTemplateDirty(fileName: string): boolean {
    const lastVersion = this.templateVersion.get(fileName);
    const latestVersion = this.project.getScriptVersion(fileName);
    return lastVersion !== latestVersion;
  }

  resolve(file: string, basePath: string): string {
    const loader = new AdapterResourceLoader(this, this.project.getCompilationSettings());
    return loader.resolve(file, basePath);
  }
}

/**
 * Provides a file system abstraction over the project a language service is
 * associated with. This is consumed by some Ivy compiler APIs.
 *
 * This is independent of the language service adapter because signatures of
 * calls like `FileSystem#readFile` are a bit stricter than those on the
 * adapter.
 *
 * Note: file system APIs that would change the state of the native filesystem
 * are disabled intentionally, as the language service should be read-only.
 */
export class LanguageServiceFS implements FileSystem {
  private readonly host: ts.server.ServerHost = this.project.projectService.host;
  constructor(private readonly project: ts.server.Project) {}
  exists(path: AbsoluteFsPath): boolean {
    return this.project.fileExists(path) || this.project.directoryExists(path);
  }
  readFile(path: AbsoluteFsPath): string {
    const content = this.project.readFile(path);
    if (content === undefined) {
      throw new Error(`LanguageServiceFS#readFile called on unavailable file ${path}`);
    }
    return content;
  }
  readFileBuffer(_path: AbsoluteFsPath): Uint8Array {
    // Note/TODO: Usages of the LanguageServiceFS should not require reading/writing byte arrays,
    // encoding/decoding byte arrays ourselves is out of scope, and I would like to avoid
    // introducing a dependency if we don't need to.
    throw new Error('LanguageServiceFS#readFileBuffer not implemented');
  }
  writeFile(_path: AbsoluteFsPath, _data: string|Uint8Array, _exclusive?: boolean): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#writeFile not implemented.');
  }
  removeFile(_path: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#removeFile not implemented');
  }
  symlink(_target: AbsoluteFsPath, _path: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#symlink not implemented');
  }
  readdir(path: AbsoluteFsPath): PathSegment[] {
    return this.project.readDirectory(path) as PathSegment[];
  }
  lstat(path: AbsoluteFsPath): FileStats {
    return {
      isFile: () => {
        return this.project.fileExists(path);
      },
      isDirectory: () => {
        return this.project.directoryExists(path);
      },
      isSymbolicLink: () => {
        throw new Error(`LanguageServiceFS#lstat#isSymbolicLink not implemented`);
      },
    };
  }
  stat(path: AbsoluteFsPath): FileStats {
    return {
      isFile: () => {
        return this.project.fileExists(path);
      },
      isDirectory: () => {
        return this.project.directoryExists(path);
      },
      isSymbolicLink: () => {
        return false;
      },
    };
  }
  pwd(): AbsoluteFsPath {
    return this.project.getCurrentDirectory() as AbsoluteFsPath;
  }
  chdir(path: AbsoluteFsPath): void {
    process.chdir(path);
  }
  extname(path: AbsoluteFsPath|PathSegment): string {
    return p.extname(path);
  }
  copyFile(_from: AbsoluteFsPath, _to: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#symlink not implemented');
  }
  moveFile(_from: AbsoluteFsPath, _to: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#symlink not implemented');
  }
  ensureDir(_path: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#symlink not implemented');
  }
  removeDeep(_path: AbsoluteFsPath): void {
    // Modifies FS
    throw new Error('LanguageServiceFS#symlink not implemented');
  }
  isCaseSensitive(): boolean {
    return this.host.useCaseSensitiveFileNames;
  }
  isRoot(path: AbsoluteFsPath): boolean {
    return this.dirname(path) === this.normalize(path);
  }
  isRooted(path: string): boolean {
    return p.isAbsolute(path);
  }
  resolve(...paths: string[]): AbsoluteFsPath {
    return this.host.resolvePath(this.join(paths[0], ...paths.slice(1))) as AbsoluteFsPath;
  }
  dirname<T extends PathString>(file: T): T {
    return p.dirname(file) as T;
  }
  join<T extends PathString>(basePath: T, ...paths: string[]): T {
    return p.join(basePath, ...paths) as T;
  }
  relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath {
    return p.relative(from, to) as PathSegment | AbsoluteFsPath;
  }
  basename(filePath: string, extension?: string): PathSegment {
    return p.basename(filePath, extension) as PathSegment;
  }
  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath {
    if (this.host.realpath) return this.host.realpath(filePath) as AbsoluteFsPath;
    // TODO: consider falling back on path's utilities here.
    throw new Error(`LanguageServiceFS#realpath cannot determine file's real path`);
  }
  getDefaultLibLocation(): AbsoluteFsPath {
    return ts.getDefaultLibFilePath(this.project.getCompilerOptions()) as AbsoluteFsPath;
  }
  normalize<T extends PathString>(path: T): T {
    return p.normalize(path) as T;
  }
}
