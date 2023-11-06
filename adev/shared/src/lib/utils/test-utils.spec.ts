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
  FileSystemAPI,
  FileSystemTree,
  PortListener,
  ServerReadyListener,
  Unsubscribe,
  WebContainer,
  WebContainerProcess,
} from '@webcontainer/api';

export class FakeChangeDetectorRef implements ChangeDetectorRef {
  markForCheck(): void {}
  detach(): void {}
  checkNoChanges(): void {}
  reattach(): void {}
  detectChanges(): void {}
}

export class FakeWebContainer implements WebContainer {
  fakeSpawn: FakeWebContainerProcess | undefined = undefined;

  constructor(fakeOptions?: {spawn: FakeWebContainerProcess}) {
    if (fakeOptions?.spawn) this.fakeSpawn = fakeOptions.spawn;
  }

  spawn(command: unknown, args?: unknown, options?: unknown): Promise<FakeWebContainerProcess> {
    if (this.fakeSpawn) return Promise.resolve(this.fakeSpawn);

    const fakeProcess = new FakeWebContainerProcess();

    return Promise.resolve(fakeProcess);
  }
  on(event: 'port', listener: PortListener): Unsubscribe;
  on(event: 'server-ready', listener: ServerReadyListener): Unsubscribe;
  on(event: 'error', listener: ErrorListener): Unsubscribe;
  on(event: unknown, listener: unknown): Unsubscribe {
    return () => {};
  }
  mount(
    tree: FileSystemTree,
    options?: {mountPoint?: string | undefined} | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }
  get path() {
    return '/fake-path';
  }
  get workdir() {
    return '/fake-workdir';
  }

  teardown() {}

  fs: FakeFileSystemAPI = new FakeFileSystemAPI();
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
    options?: unknown,
  ):
    | Promise<Uint8Array[]>
    | Promise<string[]>
    | Promise<DirEnt<Uint8Array>[]>
    | Promise<DirEnt<string>[]> {
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
}

export class FakeWebContainerProcess implements WebContainerProcess {
  exit: Promise<number> = Promise.resolve(0);
  input: WritableStream<string> = new WritableStream<string>();
  output: ReadableStream<string> = new ReadableStream<string>();

  kill(): void {}
  resize(dimensions: {cols: number; rows: number}): void {}
}
