/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** @fileoverview provides adapters for communicating with the ng compiler */

import {
  AbsoluteFsPath,
  ConfigurationHost,
  FileStats,
  getRootDirs,
  isShim,
  NgCompilerAdapter,
  PathSegment,
  PathString,
} from '@angular/compiler-cli';
import * as p from 'path';
import ts from 'typescript';

import {isTypeScriptFile} from './utils';

const PRE_COMPILED_STYLE_EXTENSIONS = ['.scss', '.sass', '.less', '.styl'];

export class LanguageServiceAdapter implements NgCompilerAdapter {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly unifiedModulesHost = null; // only used in Bazel
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

  resourceNameToFileName(
    url: string,
    fromFile: string,
    fallbackResolve?: (url: string, fromFile: string) => string | null,
  ): string | null {
    // If we are trying to resolve a `.css` file, see if we can find a pre-compiled file with the
    // same name instead. That way, we can provide go-to-definition for the pre-compiled files which
    // would generally be the desired behavior.
    if (url.endsWith('.css')) {
      const styleUrl = p.resolve(fromFile, '..', url);
      for (const ext of PRE_COMPILED_STYLE_EXTENSIONS) {
        const precompiledFileUrl = styleUrl.replace(/\.css$/, ext);
        if (this.fileExists(precompiledFileUrl)) {
          return precompiledFileUrl;
        }
      }
    }
    return fallbackResolve?.(url, fromFile) ?? null;
  }

  isShim(sf: ts.SourceFile): boolean {
    return isShim(sf);
  }

  isResource(sf: ts.SourceFile): boolean {
    const scriptInfo = this.project.getScriptInfo(sf.fileName);
    return scriptInfo?.scriptKind === ts.ScriptKind.Unknown;
  }

  fileExists(fileName: string): boolean {
    return this.project.fileExists(fileName);
  }

  readFile(fileName: string): string | undefined {
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
      console.error(`readResource() should not be called on TS file: ${fileName}`);
      return '';
    }
    // Calling getScriptSnapshot() will actually create a ScriptInfo if it does
    // not exist! The same applies for getScriptVersion().
    // getScriptInfo() will not create one if it does not exist.
    // In this case, we *want* a script info to be created so that we could
    // keep track of its version.
    const version = this.project.getScriptVersion(fileName);
    this.lastReadResourceVersion.set(fileName, version);
    const scriptInfo = this.project.getScriptInfo(fileName);
    if (!scriptInfo) {
      // This should not happen because it would have failed already at `getScriptVersion`.
      console.error(`Failed to get script info when trying to read ${fileName}`);
      return '';
    }
    // Add external resources as root files to the project since we project language service
    // features for them (this is currently only the case for HTML files, but we could investigate
    // css file features in the future). This prevents the project from being closed when navigating
    // away from a resource file.
    if (!this.project.isRoot(scriptInfo)) {
      this.project.addRoot(scriptInfo);
    }
    const snapshot = scriptInfo.getSnapshot();
    return snapshot.getText(0, snapshot.getLength());
  }

  getModifiedResourceFiles(): Set<string> | undefined {
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
      console.error(`LanguageServiceFS#readFile called on unavailable file ${path}`);
      return '';
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
  readdir(path: AbsoluteFsPath): PathSegment[] {
    return this.serverHost.readDirectory(
      path,
      undefined,
      undefined,
      undefined,
      /* depth */ 1,
    ) as PathSegment[];
  }
  pwd(): AbsoluteFsPath {
    return this.serverHost.getCurrentDirectory() as AbsoluteFsPath;
  }
  extname(path: AbsoluteFsPath | PathSegment): string {
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
