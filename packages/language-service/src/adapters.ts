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
  CustomElementsManifestCache,
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
   * Hash used when TypeScript omits resource contents from its snapshot, such as oversized files.
   */
  contentHash: string | undefined;
}

interface MissingResourceVersion {
  kind: 'missing';
}

interface ResourceDependencyVersion {
  kind: 'dependency';
  contentHash: string;
}

type ResourceVersion = ReadResourceVersion | MissingResourceVersion | ResourceDependencyVersion;

export class LanguageServiceAdapter implements NgCompilerAdapter {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly unifiedModulesHost = null; // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];

  /**
   * Reuses manifest load results across compiler instances created after program changes.
   */
  readonly customElementsManifestCache: CustomElementsManifestCache = {entry: null};

  /**
   * Last observed resource versions, including metadata dependencies and missing files.
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
      // Record missing files so creation triggers an update. Reading them as empty resources
      // would replace the missing-file diagnostic with a parse error.
      this.lastReadResourceVersion.set(fileName, {kind: 'missing'});
    } else if (this.lastReadResourceVersion.get(fileName)?.kind !== 'read') {
      // Track resolution metadata, such as package.json, without adding it to the project's roots.
      this.lastReadResourceVersion.set(fileName, {
        kind: 'dependency',
        contentHash: this.hashResourceContent(this.readResourceFromDisk(fileName)),
      });
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

  directoryExists(directoryName: string): boolean {
    return this.project.directoryExists(directoryName);
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
    // Attach ScriptInfo to the project before reading its snapshot. TypeScript requires a project
    // when it checks the size of large non-TypeScript files.
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
      // Read closed resources from disk because TypeScript leaves oversized snapshots empty.
      // Open resources use the snapshot above to include unsaved edits.
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
      if (oldVersion.kind === 'dependency') {
        if (
          !host.fileExists(fileName) ||
          this.hashResourceContent(this.readResourceFromDisk(fileName)) !== oldVersion.contentHash
        ) {
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

      // Recheck the hash after project updates to catch edits with unchanged size and mtime.
      // Hosts without file metadata check the hash on every call.
      if (modifiedTime === undefined || projectVersion !== oldVersion.projectVersion) {
        const contentHash = this.hashResourceContent(this.readResourceFromDisk(fileName));
        oldVersion.projectVersion = projectVersion;
        oldVersion.modifiedTime = modifiedTime;
        oldVersion.fileSize = fileSize;
        if (contentHash !== oldVersion.contentHash) {
          // Missing manifests skip readResource. Update the hash here to detect later recreation.
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
    // Check existence because some hosts throw when reading a file deleted between requests.
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
