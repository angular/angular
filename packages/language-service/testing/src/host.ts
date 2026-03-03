/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

const NOOP_FILE_WATCHER: ts.FileWatcher = {
  close() {},
};

export class MockServerHost implements ts.server.ServerHost {
  get newLine(): string {
    return '\n';
  }

  get useCaseSensitiveFileNames(): boolean {
    const fs = getFileSystem();
    return (fs as any).isCaseSensitive ? (fs as any).isCaseSensitive() : false;
  }

  readFile(path: string, encoding?: string): string | undefined {
    return getFileSystem().readFile(absoluteFrom(path));
  }

  resolvePath(path: string): string {
    return getFileSystem().resolve(path);
  }

  fileExists(path: string): boolean {
    const absPath = absoluteFrom(path);
    const fs = getFileSystem();
    return fs.exists(absPath) && fs.lstat(absPath).isFile();
  }

  directoryExists(path: string): boolean {
    const absPath = absoluteFrom(path);
    const fs = getFileSystem();
    return fs.exists(absPath) && fs.lstat(absPath).isDirectory();
  }

  createDirectory(path: string): void {
    getFileSystem().ensureDir(absoluteFrom(path));
  }

  getExecutingFilePath(): string {
    // This is load-bearing, as TypeScript uses the result of this call to locate the directory in
    // which it expects to find .d.ts files for the "standard libraries" - DOM, ES2015, etc.
    return '/node_modules/typescript/lib/tsserver.js';
  }

  getCurrentDirectory(): string {
    return '/';
  }

  createHash(data: string): string {
    return ts.sys.createHash!(data);
  }

  get args(): string[] {
    throw new Error('Property not implemented.');
  }

  watchFile(
    path: string,
    callback: ts.FileWatcherCallback,
    pollingInterval?: number,
    options?: ts.WatchOptions,
  ): ts.FileWatcher {
    return NOOP_FILE_WATCHER;
  }

  watchDirectory(
    path: string,
    callback: ts.DirectoryWatcherCallback,
    recursive?: boolean,
    options?: ts.WatchOptions,
  ): ts.FileWatcher {
    return NOOP_FILE_WATCHER;
  }

  setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  clearTimeout(timeoutId: any): void {
    throw new Error('Method not implemented.');
  }

  setImmediate(callback: (...args: any[]) => void, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  clearImmediate(timeoutId: any): void {
    throw new Error('Method not implemented.');
  }

  write(s: string): void {
    throw new Error('Method not implemented.');
  }

  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
    throw new Error('Method not implemented.');
  }

  getDirectories(path: string): string[] {
    throw new Error('Method not implemented.');
  }

  readDirectory(
    path: string,
    extensions?: readonly string[],
    exclude?: readonly string[],
    include?: readonly string[],
    depth?: number,
  ): string[] {
    throw new Error('Method not implemented.');
  }

  exit(exitCode?: number): void {
    throw new Error('Method not implemented.');
  }
}
