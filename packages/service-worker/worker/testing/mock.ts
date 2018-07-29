/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AssetGroupConfig, Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';

import {MockResponse} from './fetch';

export type HeaderMap = {
  [key: string]: string
};

export class MockFile {
  constructor(
      readonly path: string, readonly contents: string, readonly headers = {},
      readonly hashThisFile: boolean) {}

  get hash(): string { return sha1(this.contents); }
}

export class MockFileSystemBuilder {
  private resources = new Map<string, MockFile>();

  addFile(path: string, contents: string, headers?: HeaderMap): MockFileSystemBuilder {
    this.resources.set(path, new MockFile(path, contents, headers, true));
    return this;
  }

  addUnhashedFile(path: string, contents: string, headers?: HeaderMap): MockFileSystemBuilder {
    this.resources.set(path, new MockFile(path, contents, headers, false));
    return this;
  }

  build(): MockFileSystem { return new MockFileSystem(this.resources); }
}

export class MockFileSystem {
  constructor(private resources: Map<string, MockFile>) {}

  lookup(path: string): MockFile|undefined { return this.resources.get(path); }

  extend(): MockFileSystemBuilder {
    const builder = new MockFileSystemBuilder();
    Array.from(this.resources.keys()).forEach(path => {
      const res = this.resources.get(path) !;
      if (res.hashThisFile) {
        builder.addFile(path, res.contents, res.headers);
      } else {
        builder.addUnhashedFile(path, res.contents, res.headers);
      }
    });
    return builder;
  }

  list(): string[] { return Array.from(this.resources.keys()); }
}

export class MockServerStateBuilder {
  private resources = new Map<string, Response>();
  private errors = new Set<string>();

  withStaticFiles(fs: MockFileSystem): MockServerStateBuilder {
    fs.list().forEach(path => {
      const file = fs.lookup(path) !;
      this.resources.set(path, new MockResponse(file.contents, {headers: file.headers}));
    });
    return this;
  }

  withManifest(manifest: Manifest): MockServerStateBuilder {
    this.resources.set('ngsw.json', new MockResponse(JSON.stringify(manifest)));
    return this;
  }

  withRedirect(from: string, to: string, toContents: string): MockServerStateBuilder {
    this.resources.set(from, new MockResponse(toContents, {redirected: true, url: to}));
    this.resources.set(to, new MockResponse(toContents));
    return this;
  }

  withError(url: string): MockServerStateBuilder {
    this.errors.add(url);
    return this;
  }

  build(): MockServerState { return new MockServerState(this.resources, this.errors); }
}

export class MockServerState {
  private requests: Request[] = [];
  private gate: Promise<void> = Promise.resolve();
  private resolve: Function|null = null;
  // TODO(issue/24571): remove '!'.
  private resolveNextRequest !: Function;
  online = true;
  nextRequest: Promise<Request>;

  constructor(private resources: Map<string, Response>, private errors: Set<string>) {
    this.nextRequest = new Promise(resolve => { this.resolveNextRequest = resolve; });
  }

  async fetch(req: Request): Promise<Response> {
    this.resolveNextRequest(req);
    this.nextRequest = new Promise(resolve => { this.resolveNextRequest = resolve; });

    await this.gate;

    if (!this.online) {
      throw new Error('Offline.');
    }

    if (req.credentials === 'include') {
      return new MockResponse(null, {status: 0, statusText: '', type: 'opaque'});
    }
    const url = req.url.split('?')[0];
    this.requests.push(req);
    if (this.resources.has(url)) {
      return this.resources.get(url) !.clone();
    }
    if (this.errors.has(url)) {
      throw new Error('Intentional failure!');
    }
    return new MockResponse(null, {status: 404, statusText: 'Not Found'});
  }

  pause(): void {
    this.gate = new Promise(resolve => { this.resolve = resolve; });
  }

  unpause(): void {
    if (this.resolve === null) {
      return;
    }
    this.resolve();
    this.resolve = null;
  }

  assertSawRequestFor(url: string): void {
    if (!this.sawRequestFor(url)) {
      throw new Error(`Expected request for ${url}, got none.`);
    }
  }

  assertNoRequestFor(url: string): void {
    if (this.sawRequestFor(url)) {
      throw new Error(`Expected no request for ${url} but saw one.`);
    }
  }

  sawRequestFor(url: string): boolean {
    const matching = this.requests.filter(req => req.url.split('?')[0] === url);
    if (matching.length > 0) {
      this.requests = this.requests.filter(req => req !== matching[0]);
      return true;
    }
    return false;
  }

  assertNoOtherRequests(): void {
    if (!this.noOtherRequests()) {
      throw new Error(
          `Expected no other requests, got requests for ${this.requests.map(req => req.url.split('?')[0]).join(', ')}`);
    }
  }

  noOtherRequests(): boolean { return this.requests.length === 0; }

  clearRequests(): void { this.requests = []; }

  reset(): void {
    this.clearRequests();
    this.nextRequest = new Promise(resolve => { this.resolveNextRequest = resolve; });
    this.gate = Promise.resolve();
    this.resolve = null;
    this.online = true;
  }
}

export function tmpManifestSingleAssetGroup(fs: MockFileSystem): Manifest {
  const files = fs.list();
  const hashTable: {[url: string]: string} = {};
  files.forEach(path => { hashTable[path] = fs.lookup(path) !.hash; });
  return {
    configVersion: 1,
    index: '/index.html',
    assetGroups: [
      {
        name: 'group',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: files,
        patterns: [],
      },
    ],
    navigationUrls: [], hashTable,
  };
}

export function tmpHashTableForFs(
    fs: MockFileSystem, breakHashes: {[url: string]: boolean} = {}): {[url: string]: string} {
  const table: {[url: string]: string} = {};
  fs.list().forEach(path => {
    const file = fs.lookup(path) !;
    if (file.hashThisFile) {
      table[path] = file.hash;
      if (breakHashes[path]) {
        table[path] = table[path].split('').reverse().join('');
      }
    }
  });
  return table;
}

export function tmpHashTable(manifest: Manifest): Map<string, string> {
  const map = new Map<string, string>();
  Object.keys(manifest.hashTable).forEach(url => {
    const hash = manifest.hashTable[url];
    map.set(url, hash);
  });
  return map;
}
