/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectorRef} from '@angular/core';
import {
  DirEnt,
  ErrorListener,
  FSWatchCallback,
  FSWatchOptions,
  FileSystemAPI,
  FileSystemTree,
  IFSWatcher,
  PortListener,
  PreviewMessageListener,
  ServerReadyListener,
  Unsubscribe,
  WebContainer,
  WebContainerProcess,
} from '@webcontainer/api';

export class FakeEventTarget implements EventTarget {
  listeners: Map<string, EventListenerOrEventListenerObject[]> = new Map();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else {
          listener.handleEvent(event);
        }
      }
    }
    return true;
  }
}

export class MockLocalStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private items = new Map<string, string | null>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string | null): void {
    this.items.set(key, value);
  }
}

export class FakeChangeDetectorRef implements ChangeDetectorRef {
  markForCheck(): void {}
  detach(): void {}
  checkNoChanges(): void {}
  reattach(): void {}
  detectChanges(): void {}
}

export class FakeWebContainer extends WebContainer {
  fakeSpawn: FakeWebContainerProcess | undefined = undefined;

  constructor(fakeOptions?: {spawn: FakeWebContainerProcess}) {
    super();
    if (fakeOptions?.spawn) this.fakeSpawn = fakeOptions.spawn;
  }

  override spawn(
    command: unknown,
    args?: unknown,
    options?: unknown,
  ): Promise<FakeWebContainerProcess> {
    if (this.fakeSpawn) return Promise.resolve(this.fakeSpawn);

    const fakeProcess = new FakeWebContainerProcess();

    return Promise.resolve(fakeProcess);
  }
  override on(event: 'port', listener: PortListener): Unsubscribe;
  override on(event: 'server-ready', listener: ServerReadyListener): Unsubscribe;
  override on(event: 'error', listener: ErrorListener): Unsubscribe;
  override on(event: 'preview-message', listener: PreviewMessageListener): Unsubscribe;
  override on(event: unknown, listener: unknown): Unsubscribe {
    return () => {};
  }
  override mount(
    tree: FileSystemTree,
    options?: {mountPoint?: string | undefined} | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }
  override get path() {
    return '/fake-path';
  }
  override get workdir() {
    return '/fake-workdir';
  }

  override teardown() {}

  override fs: FakeFileSystemAPI = new FakeFileSystemAPI();
}

class FakeFileSystemAPI implements FileSystemAPI {
  readdir(
    path: string,
    options: 'buffer' | {encoding: 'buffer'; withFileTypes?: false | undefined},
  ): Promise<Uint8Array[]>;
  readdir(
    path: string,
    options?:
      | string
      | {encoding?: string | null | undefined; withFileTypes?: false | undefined}
      | null
      | undefined,
  ): Promise<string[]>;
  readdir(
    path: string,
    options: {encoding: 'buffer'; withFileTypes: true},
  ): Promise<DirEnt<Uint8Array>[]>;
  readdir(
    path: string,
    options: {encoding?: string | null | undefined; withFileTypes: true},
  ): Promise<DirEnt<string>[]>;
  readdir(
    path: unknown,
    options?: {encoding?: string | null | undefined; withFileTypes?: boolean} | string | null,
  ):
    | Promise<Uint8Array[]>
    | Promise<string[]>
    | Promise<DirEnt<Uint8Array>[]>
    | Promise<DirEnt<string>[]> {
    if (typeof options === 'object' && options?.withFileTypes === true) {
      return Promise.resolve([{name: 'fake-file', isFile: () => true, isDirectory: () => false}]);
    }

    return Promise.resolve(['/fake-dirname']);
  }

  readFile(path: string, encoding?: null | undefined): Promise<Uint8Array>;
  readFile(path: string, encoding: string): Promise<string>;
  readFile(path: unknown, encoding?: unknown): Promise<Uint8Array> | Promise<string> {
    return Promise.resolve('fake file content');
  }
  writeFile(
    path: string,
    data: string | Uint8Array,
    options?: string | {encoding?: string | null | undefined} | null | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }
  mkdir(path: string, options?: {recursive?: false | undefined} | undefined): Promise<void>;
  mkdir(path: string, options: {recursive: true}): Promise<string>;
  mkdir(path: unknown, options?: unknown): Promise<void> | Promise<string> {
    return Promise.resolve();
  }
  rm(
    path: string,
    options?: {force?: boolean | undefined; recursive?: boolean | undefined} | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }

  rename(oldPath: string, newPath: string): Promise<void> {
    throw Error('Not implemented');
  }
  watch(
    filename: string,
    options?: FSWatchOptions | undefined,
    listener?: FSWatchCallback | undefined,
  ): IFSWatcher;
  watch(filename: string, listener?: FSWatchCallback | undefined): IFSWatcher;
  watch(filename: unknown, options?: unknown, listener?: unknown): IFSWatcher {
    throw Error('Not implemented');
  }
}

export class FakeWebContainerProcess implements WebContainerProcess {
  exit: Promise<number> = Promise.resolve(0);
  input: WritableStream<string> = new WritableStream<string>();
  output: ReadableStream<string> = new ReadableStream<string>();

  kill(): void {}
  resize(dimensions: {cols: number; rows: number}): void {}
}
