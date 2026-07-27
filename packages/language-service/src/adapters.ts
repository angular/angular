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
  NgCompilerAdapter,
  PathSegment,
  PathString,
  getRootDirs,
  isShim,
} from '@angular/compiler-cli';

import * as p from 'path';
import ts from 'typescript';

import {isTypeScriptFile} from './utils';

const PRE_COMPILED_STYLE_EXTENSIONS = ['.scss', '.sass', '.less', '.styl'];

interface ReadResourceVersion {
  kind: 'read';
  scriptVersion: string;
  projectVersion: string;
  modifiedTime: number | undefined;
  fileSize: number | undefined;
  /**
   * A content hash is only needed when TypeScript declines to retain the resource's contents in
   * its `ScriptInfo` snapshot (for example, for non-TypeScript files over its size limit).
   */
  contentHash: string | undefined;
}

interface MissingResourceVersion {
  kind: 'missing';
}

type ResourceVersion = ReadResourceVersion | MissingResourceVersion;

export class LanguageServiceAdapter implements NgCompilerAdapter {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly unifiedModulesHost = null; // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];

  /**
   * The adapter outlives the `NgCompiler` instances created per program change; this slot lets
   * the manifest loader reuse Custom Elements Manifest load results across them instead of
   * re-parsing and re-validating unchanged manifests on every edit.
   */
  readonly customElementsManifestCache: NonNullable<
    NgCompilerAdapter['customElementsManifestCache']
  > = {entry: null};

  /**
   * Map of resource filenames to the version last read via `readResource`, or to an observation
   * that a configured resource did not yet exist.
   *
   * Used to implement `getModifiedResourceFiles`.
   */
  private readonly lastReadResourceVersion = new Map<string, ResourceVersion>();

  constructor(private readonly project: ts.server.Project) {
    this.rootDirs = getRootDirs(this, project.getCompilationSettings());
  }

  getSourceFile(
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean,
  ): ts.SourceFile | undefined {
    return this.project.getSourceFile(this.project.projectService.toPath(fileName));
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

  recordResourceDependency(fileName: AbsoluteFsPath): void {
    if (!this.project.projectService.host.fileExists(fileName)) {
      // Do not call `readResource` for an absent path: the compiler must retain its "not found"
      // diagnostic rather than attempting to parse an empty resource. Polling this small set of
      // explicitly configured paths lets a later creation trigger a resource-only compilation.
      this.lastReadResourceVersion.set(fileName, {kind: 'missing'});
    }
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
    // `Project.getScriptVersion()` creates a `ScriptInfo` and immediately asks it for a snapshot.
    // For large non-TypeScript files, TypeScript expects the info to already belong to a project
    // when it applies its oversized-file policy. Create and attach it explicitly first.
    let scriptInfo = this.project.getScriptInfo(fileName);
    if (scriptInfo === undefined) {
      scriptInfo = this.project.projectService.getOrCreateScriptInfoForNormalizedPath(
        ts.server.toNormalizedPath(fileName),
        false,
        undefined,
        ts.ScriptKind.Unknown,
        false,
        this.project.projectService.host,
      );
    }
    if (!scriptInfo) {
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

    let content: string;
    let contentHash: string | undefined;
    const snapshot = scriptInfo.getSnapshot();
    if (scriptInfo.isScriptOpen()) {
      content = snapshot.getText(0, snapshot.getLength());
    } else {
      // A closed resource is owned by the filesystem. Read it directly because TypeScript uses an
      // empty snapshot for oversized non-TypeScript files. Open resources must continue to use the
      // snapshot above so that unsaved editor changes win over disk contents.
      content = this.readResourceFromDisk(fileName);
      if (snapshot.getLength() !== content.length) {
        contentHash = this.hashResourceContent(content);
      }
    }

    const host = this.project.projectService.host;
    this.lastReadResourceVersion.set(fileName, {
      kind: 'read',
      scriptVersion: scriptInfo.getLatestVersion(),
      projectVersion: this.project.getProjectVersion(),
      modifiedTime: host.getModifiedTime?.(fileName)?.getTime(),
      fileSize: host.getFileSize?.(fileName),
      contentHash,
    });
    return content;
  }

  getModifiedResourceFiles(): Set<string> | undefined {
    const modifiedFiles = new Set<string>();
    const host = this.project.projectService.host;
    const projectVersion = this.project.getProjectVersion();
    for (const [fileName, oldVersion] of this.lastReadResourceVersion) {
      if (oldVersion.kind === 'missing') {
        if (host.fileExists(fileName)) {
          modifiedFiles.add(fileName);
        }
        continue;
      }
      const scriptInfo = this.project.getScriptInfo(fileName);
      if (scriptInfo === undefined || scriptInfo.getLatestVersion() !== oldVersion.scriptVersion) {
        modifiedFiles.add(fileName);
        continue;
      }

      if (oldVersion.contentHash === undefined || scriptInfo.isScriptOpen()) {
        continue;
      }

      const modifiedTime = host.getModifiedTime?.(fileName)?.getTime();
      const fileSize = host.getFileSize?.(fileName);
      if (modifiedTime !== oldVersion.modifiedTime || fileSize !== oldVersion.fileSize) {
        modifiedFiles.add(fileName);
        continue;
      }

      // A watcher-driven project update catches same-size edits even on filesystems with coarse
      // mtimes. Hosts without file metadata (including the LS test host) use the hash every time.
      if (modifiedTime === undefined || projectVersion !== oldVersion.projectVersion) {
        const contentHash = this.hashResourceContent(this.readResourceFromDisk(fileName));
        oldVersion.projectVersion = projectVersion;
        oldVersion.modifiedTime = modifiedTime;
        oldVersion.fileSize = fileSize;
        if (contentHash !== oldVersion.contentHash) {
          // A missing manifest is rejected before `readResource` runs. Record the observed hash
          // here so that recreating the file can produce a second resource-change ticket.
          oldVersion.contentHash = contentHash;
          modifiedFiles.add(fileName);
        }
      }
    }
    return modifiedFiles.size > 0 ? modifiedFiles : undefined;
  }

  private hashResourceContent(content: string): string {
    return this.project.projectService.host.createHash?.(content) ?? content;
  }

  private readResourceFromDisk(fileName: string): string {
    // The file can disappear between compiler requests. Some server hosts throw from `readFile`
    // for a missing file instead of returning `undefined`.
    return this.project.projectService.host.fileExists(fileName)
      ? (this.project.readFile(fileName) ?? '')
      : '';
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
