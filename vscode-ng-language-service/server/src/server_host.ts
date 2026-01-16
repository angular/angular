/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as path from 'path';

const NOOP_WATCHER: ts.FileWatcher = {
  close() {},
};

enum FileChangeType {
  Created = 1,
  Changed = 2,
  Deleted = 3,
}

/**
 * `ServerHost` is a wrapper around `ts.sys` for the Node system. In Node, all
 * optional methods of `ts.System` are implemented.
 * See
 * https://github.com/microsoft/TypeScript/blob/ec39d412876d0dcf704fc886d5036cb625220d2f/src/compiler/sys.ts#L716
 */
export class ServerHost implements ts.server.ServerHost {
  readonly args: string[];
  readonly newLine: string;
  readonly useCaseSensitiveFileNames: boolean;
  private readonly fileWatchers = new Map<string, Set<ts.FileWatcherCallback>>();
  private readonly directoryWatchers = new Map<
    string,
    Set<{callback: ts.DirectoryWatcherCallback; recursive: boolean}>
  >();

  constructor(
    readonly isG3: boolean,
    private readonly supportClientSideFileChanges: boolean,
  ) {
    this.args = ts.sys.args;
    this.newLine = ts.sys.newLine;
    this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
  }

  write(s: string): void {
    ts.sys.write(s);
  }

  writeOutputIsTTY(): boolean {
    return ts.sys.writeOutputIsTTY!();
  }

  readFile(path: string, encoding?: string): string | undefined {
    return ts.sys.readFile(path, encoding);
  }

  getFileSize(path: string): number {
    return ts.sys.getFileSize!(path);
  }

  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
    return ts.sys.writeFile(path, data, writeByteOrderMark);
  }

  /**
   * @pollingInterval - this parameter is used in polling-based watchers and
   * ignored in watchers that use native OS file watching
   */
  watchFile(
    path: string,
    callback: ts.FileWatcherCallback,
    pollingInterval?: number,
    options?: ts.WatchOptions,
  ): ts.FileWatcher {
    if (this.supportClientSideFileChanges) {
      const callbacks = this.fileWatchers.get(path) ?? new Set();
      callbacks.add(callback);
      this.fileWatchers.set(path, callbacks);
      return {
        close: () => {
          const callbacks = this.fileWatchers.get(path);
          if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
              this.fileWatchers.delete(path);
            }
          }
        },
      };
    }
    return ts.sys.watchFile!(path, callback, pollingInterval, options);
  }

  watchDirectory(
    path: string,
    callback: ts.DirectoryWatcherCallback,
    recursive?: boolean,
    options?: ts.WatchOptions,
  ): ts.FileWatcher {
    if (this.isG3 && path.startsWith('/google/src')) {
      return NOOP_WATCHER;
    }
    if (this.supportClientSideFileChanges) {
      const callbacks = this.directoryWatchers.get(path) ?? new Set();
      const watcher = {callback, recursive: !!recursive};
      callbacks.add(watcher);
      this.directoryWatchers.set(path, callbacks);
      return {
        close: () => {
          const callbacks = this.directoryWatchers.get(path);
          if (callbacks) {
            callbacks.delete(watcher);
            if (callbacks.size === 0) {
              this.directoryWatchers.delete(path);
            }
          }
        },
      };
    }
    return ts.sys.watchDirectory!(path, callback, recursive, options);
  }

  notifyFileChange(fileName: string, type: FileChangeType): void {
    if (!this.supportClientSideFileChanges) {
      return;
    }

    const callbacks = this.fileWatchers.get(fileName);
    if (callbacks) {
      callbacks.forEach((callback) =>
        callback(
          fileName,
          type === FileChangeType.Deleted
            ? ts.FileWatcherEventKind.Deleted
            : ts.FileWatcherEventKind.Changed,
        ),
      );
    }

    for (const [dirPath, watchers] of this.directoryWatchers) {
      if (fileName.startsWith(dirPath)) {
        // If it's a direct child or recursive watch
        const relative = path.relative(dirPath, fileName);
        const isDirectChild = !relative.includes(path.sep);

        for (const watcher of watchers) {
          if (watcher.recursive || isDirectChild) {
            watcher.callback(fileName);
          }
        }
      }
    }
  }

  resolvePath(path: string): string {
    return ts.sys.resolvePath(path);
  }

  fileExists(path: string): boolean {
    // When a project is reloaded (due to changes in node_modules for example),
    // the typecheck files ought to be retained. However, if they do not exist
    // on disk, tsserver will remove them from project. See
    // https://github.com/microsoft/TypeScript/blob/3c32f6e154ead6749b76ec9c19cbfdd2acad97d6/src/server/editorServices.ts#L2188-L2193
    // To fix this, we fake the existence of the typecheck files.
    if (path.endsWith('.ngtypecheck.ts')) {
      return true;
    }
    return ts.sys.fileExists(path);
  }

  directoryExists(path: string): boolean {
    return ts.sys.directoryExists(path);
  }

  createDirectory(path: string): void {
    return ts.sys.createDirectory(path);
  }

  getExecutingFilePath(): string {
    return ts.sys.getExecutingFilePath();
  }

  getCurrentDirectory(): string {
    return ts.sys.getCurrentDirectory();
  }

  getDirectories(path: string): string[] {
    return ts.sys.getDirectories(path);
  }

  readDirectory(
    path: string,
    extensions?: ReadonlyArray<string>,
    exclude?: ReadonlyArray<string>,
    include?: ReadonlyArray<string>,
    depth?: number,
  ): string[] {
    return ts.sys.readDirectory(path, extensions, exclude, include, depth);
  }

  getModifiedTime(path: string): Date | undefined {
    return ts.sys.getModifiedTime!(path);
  }

  setModifiedTime(path: string, time: Date): void {
    return ts.sys.setModifiedTime!(path, time);
  }

  deleteFile(path: string): void {
    return ts.sys.deleteFile!(path);
  }

  /**
   * A good implementation is node.js' `crypto.createHash`.
   * (https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
   */
  createHash(data: string): string {
    return ts.sys.createHash!(data);
  }

  /**
   * This must be cryptographically secure. Only implement this method using
   * `crypto.createHash("sha256")`.
   */
  createSHA256Hash(data: string): string {
    return ts.sys.createSHA256Hash!(data);
  }

  getMemoryUsage(): number {
    return ts.sys.getMemoryUsage!();
  }

  exit(exitCode?: number): void {
    return ts.sys.exit(exitCode);
  }

  realpath(path: string): string {
    return ts.sys.realpath!(path);
  }

  setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any {
    return ts.sys.setTimeout!(callback, ms, ...args);
  }

  clearTimeout(timeoutId: any): void {
    return ts.sys.clearTimeout!(timeoutId);
  }

  clearScreen(): void {
    return ts.sys.clearScreen!();
  }

  base64decode(input: string): string {
    return ts.sys.base64decode!(input);
  }

  base64encode(input: string): string {
    return ts.sys.base64encode!(input);
  }

  setImmediate(callback: (...args: any[]) => void, ...args: any[]): any {
    return setImmediate(callback, ...args);
  }

  clearImmediate(timeoutId: any): void {
    return clearImmediate(timeoutId);
  }

  require(initialPath: string, moduleName: string): ts.server.RequireResult {
    if (moduleName !== '@angular/language-service') {
      return {
        module: undefined,
        error: new Error(`Angular server will not load plugin '${moduleName}'.`),
      };
    }
    try {
      const modulePath = require.resolve(moduleName, {
        paths: [initialPath],
      });
      return {
        module: require(modulePath),
        error: undefined,
      };
    } catch (e) {
      return {
        module: undefined,
        error: e as Error,
      };
    }
  }
}
