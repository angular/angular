/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';

import {ResourceLoader} from './annotations';

export class ApiResourceLoader implements ResourceLoader {
  private cache = new Map<string, string>();
  private fetching = new Set<string>();

  constructor(private host: (url: string) => string | Promise<string>) {}

  preload(url: string): Promise<void>|undefined {
    if (this.cache.has(url) || this.fetching.has(url)) {
      return undefined;
    }

    const result = this.host(url);
    if (typeof result === 'string') {
      this.cache.set(url, result);
      return undefined;
    } else {
      this.fetching.add(url);
      return result.then(str => {
        this.fetching.delete(url);
        this.cache.set(url, str);
      });
    }
  }

  load(url: string): string {
    if (this.cache.has(url)) {
      return this.cache.get(url) !;
    }

    const result = this.host(url);
    if (typeof result !== 'string') {
      throw new Error(`ApiResourceLoader: host(${url}) returned a Promise`);
    }
    this.cache.set(url, result);
    return result;
  }
}

export class FileResourceLoader implements ResourceLoader {
  load(url: string): string { return fs.readFileSync(url, 'utf8'); }
}
