/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';

import {MockResponse} from './fetch';

export type HeaderMap = {
  [key: string]: string
};

export class MockFile {
  constructor(
      readonly path: string, readonly contents: string, readonly headers = {},
      readonly hashThisFile: boolean) {}

  get hash(): string {
    return sha1(this.contents);
  }
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

  build(): MockFileSystem {
    return new MockFileSystem(this.resources);
  }
}

export class MockFileSystem {
  constructor(private resources: Map<string, MockFile>) {}

  lookup(path: string): MockFile|undefined {
    return this.resources.get(path);
  }

  extend(): MockFileSystemBuilder {
    const builder = new MockFileSystemBuilder();
    Array.from(this.resources.keys()).forEach(path => {
      const res = this.resources.get(path)!;
      if (res.hashThisFile) {
        builder.addFile(path, res.contents, res.headers);
      } else {
        builder.addUnhashedFile(path, res.contents, res.headers);
      }
    });
    return builder;
  }

  list(): string[] {
    return Array.from(this.resources.keys());
  }
}

export class MockServerStateBuilder {
  private rootDir = '/';
  private resources = new Map<string, Response>();
  private errors = new Set<string>();

  withRootDirectory(newRootDir: string): MockServerStateBuilder {
    // Update existing resources/errors.
    const oldRootDir = this.rootDir;
    const updateRootDir = (path: string) =>
        path.startsWith(oldRootDir) ? joinPaths(newRootDir, path.slice(oldRootDir.length)) : path;

    this.resources = new Map(
        [...this.resources].map(([path, contents]) => [updateRootDir(path), contents.clone()]));
    this.errors = new Set([...this.errors].map(url => updateRootDir(url)));

    // Set `rootDir` for future resource/error additions.
    this.rootDir = newRootDir;

    return this;
  }

  withStaticFiles(dir: MockFileSystem): MockServerStateBuilder {
    dir.list().forEach(path => {
      const file = dir.lookup(path)!;
      this.resources.set(
          joinPaths(this.rootDir, path), new MockResponse(file.contents, {headers: file.headers}));
    });
    return this;
  }

  withManifest(manifest: Manifest): MockServerStateBuilder {
    const manifestPath = joinPaths(this.rootDir, 'ngsw.json');
    this.resources.set(manifestPath, new MockResponse(JSON.stringify(manifest)));
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

  build(): MockServerState {
    // Take a "snapshot" of the current `resources` and `errors`.
    const resources = new Map(this.resources.entries());
    const errors = new Set(this.errors.values());

    return new MockServerState(resources, errors);
  }
}

export class MockServerState {
  private requests: Request[] = [];
  private gate: Promise<void> = Promise.resolve();
  private resolve: Function|null = null;
  // TODO(issue/24571): remove '!'.
  private resolveNextRequest!: Function;
  online = true;
  nextRequest: Promise<Request>;

  constructor(private resources: Map<string, Response>, private errors: Set<string>) {
    this.nextRequest = new Promise(resolve => {
      this.resolveNextRequest = resolve;
    });
  }

  async fetch(req: Request): Promise<Response> {
    this.resolveNextRequest(req);
    this.nextRequest = new Promise(resolve => {
      this.resolveNextRequest = resolve;
    });

    await this.gate;

    if (!this.online) {
      throw new Error('Offline.');
    }

    this.requests.push(req);

    if ((req.credentials === 'include') || (req.mode === 'no-cors')) {
      return new MockResponse(null, {status: 0, statusText: '', type: 'opaque'});
    }
    const url = req.url.split('?')[0];
    if (this.resources.has(url)) {
      return this.resources.get(url)!.clone();
    }
    if (this.errors.has(url)) {
      throw new Error('Intentional failure!');
    }
    return new MockResponse(null, {status: 404, statusText: 'Not Found'});
  }

  pause(): void {
    this.gate = new Promise(resolve => {
      this.resolve = resolve;
    });
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
      throw new Error(`Expected no other requests, got requests for ${
          this.requests.map(req => req.url.split('?')[0]).join(', ')}`);
    }
  }

  noOtherRequests(): boolean {
    return this.requests.length === 0;
  }

  clearRequests(): void {
    this.requests = [];
  }

  reset(): void {
    this.clearRequests();
    this.nextRequest = new Promise(resolve => {
      this.resolveNextRequest = resolve;
    });
    this.gate = Promise.resolve();
    this.resolve = null;
    this.online = true;
  }
}

export function tmpManifestSingleAssetGroup(fs: MockFileSystem): Manifest {
  const files = fs.list();
  const hashTable: {[url: string]: string} = {};
  files.forEach(path => {
    hashTable[path] = fs.lookup(path)!.hash;
  });
  return {
    configVersion: 1,
    timestamp: 1234567890123,
    index: '/index.html',
    assetGroups: [
      {
        name: 'group',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: files,
        patterns: [],
        cacheQueryOptions: {ignoreVary: true}
      },
    ],
    navigationUrls: [],
    navigationRequestStrategy: 'performance',
    hashTable,
  };
}

export function tmpHashTableForFs(
    fs: MockFileSystem, breakHashes: {[url: string]: boolean} = {},
    baseHref = '/'): {[url: string]: string} {
  const table: {[url: string]: string} = {};
  fs.list().forEach(filePath => {
    const urlPath = joinPaths(baseHref, filePath);
    const file = fs.lookup(filePath)!;
    if (file.hashThisFile) {
      table[urlPath] = file.hash;
      if (breakHashes[filePath]) {
        table[urlPath] = table[urlPath].split('').reverse().join('');
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

// Helpers
/**
 * Join two path segments, ensuring that there is exactly one slash (`/`) between them.
 */
function joinPaths(path1: string, path2: string): string {
  return `${path1.replace(/\/$/, '')}/${path2.replace(/^\//, '')}`;
}
