/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @fileoverview provides adapters for communicating with the ng compiler */

import {ConfigurationHost} from '@angular/compiler-cli';
import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {AbsoluteFsPath, FileStats, PathSegment, PathString} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {getRootDirs} from '@angular/compiler-cli/src/ngtsc/util/src/typescript';
import * as p from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';

import {isTypeScriptFile} from './utils';

export class LanguageServiceAdapter implements NgCompilerAdapter {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly factoryTracker = null;      // no .ngfactory shims
  readonly unifiedModulesHost = null;  // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];

  /**
   * Map of resource filenames to the version of the file last read via `readResource`.
   *
   * Used to implement `getModifiedResourceFiles`.
   */
  private readonly lastReadResourceVersion = new Map<string, string>();

  constructor(private readonly project: ts.server.Project) {
    this.rootDirs = getRootDirs(this, project.getCompilationSettings());
  }

  isShim(sf: ts.SourceFile): boolean {
    return isShim(sf);
  }

  fileExists(fileName: string): boolean {
    return this.project.fileExists(fileName);
  }

  readFile(fileName: string): string|undefined {
    return this.project.readFile(fileName);
  }

  getCurrentDirectory(): string {
    return this.project.getCurrentDirectory();
  }

  getCanonicalFileName(fileName: string): string {
    return this.project.projectService.toCanonicalFileName(fileName);
  }

  /**
   * Return the real path of a symlink. This method is required in order to
   * resolve symlinks in node_modules.
   */
  realpath(path: string): string {
    return this.project.realpath?.(path) ?? path;
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
    this.lastReadResourceVersion.set(fileName, version);
    return snapshot.getText(0, snapshot.getLength());
  }

  getModifiedResourceFiles(): Set<string>|undefined {
    const modifiedFiles = new Set<string>();
    for (const [fileName, oldVersion] of this.lastReadResourceVersion) {
      if (this.project.getScriptVersion(fileName) !== oldVersion) {
        modifiedFiles.add(fileName);
      }
    }
    return modifiedFiles.size > 0 ? modifiedFiles : undefined;
  }
}

/**
 * Used to read configuration files.
 *
 * A language service parse configuration host is independent of the adapter
 * because signatures of calls like `FileSystem#readFile` are a bit stricter
 * than those on the adapter.
 */
export class LSParseConfigHost implements ConfigurationHost {
  constructor(private readonly serverHost: ts.server.ServerHost) {}
  exists(path: AbsoluteFsPath): boolean {
    return this.serverHost.fileExists(path) || this.serverHost.directoryExists(path);
  }
  readFile(path: AbsoluteFsPath): string {
    const content = this.serverHost.readFile(path);
    if (content === undefined) {
      throw new Error(`LanguageServiceFS#readFile called on unavailable file ${path}`);
    }
    return content;
  }
  lstat(path: AbsoluteFsPath): FileStats {
    return {
      isFile: () => {
        return this.serverHost.fileExists(path);
      },
      isDirectory: () => {
        return this.serverHost.directoryExists(path);
      },
      isSymbolicLink: () => {
        throw new Error(`LanguageServiceFS#lstat#isSymbolicLink not implemented`);
      },
    };
  }
  pwd(): AbsoluteFsPath {
    return this.serverHost.getCurrentDirectory() as AbsoluteFsPath;
  }
  extname(path: AbsoluteFsPath|PathSegment): string {
    return p.extname(path);
  }
  resolve(...paths: string[]): AbsoluteFsPath {
    return p.resolve(...paths) as AbsoluteFsPath;
  }
  dirname<T extends PathString>(file: T): T {
    return p.dirname(file) as T;
  }
  join<T extends PathString>(basePath: T, ...paths: string[]): T {
    return p.join(basePath, ...paths) as T;
  }
}
