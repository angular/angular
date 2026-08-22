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

export class MockServerHost implements ts.server.ServerHost {
  private readonly fileWatchers = new Map<string, Set<ts.FileWatcherCallback>>();

  /**
   * Deterministic queued scheduler for `setTimeout`/`setImmediate`.
   *
   * Real server hosts defer these callbacks to the event loop; running them synchronously (as
   * this host previously did) can introduce reentrancy and mask ordering behavior in TypeScript's
   * throttled project-graph updates. Callbacks are instead queued in insertion order — one
   * id-space for both timer kinds, no wall-clock involvement — and run only when the test
   * environment explicitly yields via `flushPendingTimers()`, mirroring the point where a real
   * editor host would return to the server event loop.
   */
  private readonly pendingTimers = new Map<number, () => void>();
  private nextTimerId = 1;

  /**
   * Runs queued timer callbacks in insertion order until none remain. Callbacks may schedule
   * further callbacks; `maxIterations` guards against tests that would otherwise reschedule
   * indefinitely.
   */
  flushPendingTimers(maxIterations = 10_000): void {
    for (let iteration = 0; this.pendingTimers.size > 0; iteration++) {
      if (iteration >= maxIterations) {
        throw new Error(
          `flushPendingTimers: callbacks kept scheduling further callbacks after ` +
            `${maxIterations} iterations; a test is likely rescheduling indefinitely.`,
        );
      }
      const [id, callback] = this.pendingTimers.entries().next().value as [number, () => void];
      this.pendingTimers.delete(id);
      callback();
    }
  }

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
    const normalizedPath = this.resolvePath(path);
    let callbacks = this.fileWatchers.get(normalizedPath);
    if (callbacks === undefined) {
      callbacks = new Set();
      this.fileWatchers.set(normalizedPath, callbacks);
    }
    callbacks.add(callback);
    return {
      close: () => {
        callbacks!.delete(callback);
        if (callbacks!.size === 0) {
          this.fileWatchers.delete(normalizedPath);
        }
      },
    };
  }

  watchDirectory(
    path: string,
    callback: ts.DirectoryWatcherCallback,
    recursive?: boolean,
    options?: ts.WatchOptions,
  ): ts.FileWatcher {
    return {close() {}};
  }

  invokeFileWatcher(path: string, eventKind: ts.FileWatcherEventKind): void {
    const normalizedPath = this.resolvePath(path);
    for (const callback of this.fileWatchers.get(normalizedPath) ?? []) {
      callback(normalizedPath, eventKind);
    }
  }

  setTimeout(callback: (...args: unknown[]) => void, ms: number, ...args: unknown[]): number {
    const id = this.nextTimerId++;
    this.pendingTimers.set(id, () => callback(...args));
    return id;
  }

  clearTimeout(timeoutId: unknown): void {
    if (typeof timeoutId === 'number') {
      this.pendingTimers.delete(timeoutId);
    }
  }

  setImmediate(callback: (...args: unknown[]) => void, ...args: unknown[]): number {
    const id = this.nextTimerId++;
    this.pendingTimers.set(id, () => callback(...args));
    return id;
  }

  clearImmediate(timeoutId: unknown): void {
    if (typeof timeoutId === 'number') {
      this.pendingTimers.delete(timeoutId);
    }
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
