/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as ts from 'typescript';

import {ResourceLoader} from './annotations';

/**
 * `ResourceLoader` which delegates to a `CompilerHost` resource loading method.
 */
export class HostResourceLoader implements ResourceLoader {
  private cache = new Map<string, string>();
  private fetching = new Map<string, Promise<void>>();

  constructor(
      private resolver: (file: string, basePath: string) => string | null,
      private loader: (url: string) => string | Promise<string>) {}

  preload(file: string, containingFile: string): Promise<void>|undefined {
    const resolved = this.resolver(file, containingFile);
    if (resolved === null) {
      return undefined;
    }

    if (this.cache.has(resolved)) {
      return undefined;
    } else if (this.fetching.has(resolved)) {
      return this.fetching.get(resolved);
    }

    const result = this.loader(resolved);
    if (typeof result === 'string') {
      this.cache.set(resolved, result);
      return undefined;
    } else {
      const fetchCompletion = result.then(str => {
        this.fetching.delete(resolved);
        this.cache.set(resolved, str);
      });
      this.fetching.set(resolved, fetchCompletion);
      return fetchCompletion;
    }
  }

  load(file: string, containingFile: string): string {
    const resolved = this.resolver(file, containingFile);
    if (resolved === null) {
      throw new Error(
          `HostResourceLoader: could not resolve ${file} in context of ${containingFile})`);
    }

    if (this.cache.has(resolved)) {
      return this.cache.get(resolved) !;
    }

    const result = this.loader(resolved);
    if (typeof result !== 'string') {
      throw new Error(`HostResourceLoader: loader(${resolved}) returned a Promise`);
    }
    this.cache.set(resolved, result);
    return result;
  }
}



// `failedLookupLocations` is in the name of the type ts.ResolvedModuleWithFailedLookupLocations
// but is marked @internal in TypeScript. See https://github.com/Microsoft/TypeScript/issues/28770.
type ResolvedModuleWithFailedLookupLocations =
    ts.ResolvedModuleWithFailedLookupLocations & {failedLookupLocations: ReadonlyArray<string>};

/**
 * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
 */
export class FileResourceLoader implements ResourceLoader {
  constructor(private host: ts.CompilerHost, private options: ts.CompilerOptions) {}

  load(file: string, containingFile: string): string {
    // Attempt to resolve `file` in the context of `containingFile`, while respecting the rootDirs
    // option from the tsconfig. First, normalize the file name.

    // Strip a leading '/' if one is present.
    if (file.startsWith('/')) {
      file = file.substr(1);
    }
    // Turn absolute paths into relative paths.
    if (!file.startsWith('.')) {
      file = `./${file}`;
    }

    // TypeScript provides utilities to resolve module names, but not resource files (which aren't
    // a part of the ts.Program). However, TypeScript's module resolution can be used creatively
    // to locate where resource files should be expected to exist. Since module resolution returns
    // a list of file names that were considered, the loader can enumerate the possible locations
    // for the file by setting up a module resolution for it that will fail.
    file += '.$ngresource$';

    // clang-format off
    const failedLookup = ts.resolveModuleName(file, containingFile, this.options, this.host) as ResolvedModuleWithFailedLookupLocations;
    // clang-format on
    if (failedLookup.failedLookupLocations === undefined) {
      throw new Error(
          `Internal error: expected to find failedLookupLocations during resolution of resource '${file}' in context of ${containingFile}`);
    }

    const candidateLocations =
        failedLookup.failedLookupLocations
            .filter(candidate => candidate.endsWith('.$ngresource$.ts'))
            .map(candidate => candidate.replace(/\.\$ngresource\$\.ts$/, ''));

    for (const candidate of candidateLocations) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf8');
      }
    }
    throw new Error(`Could not find resource ${file} in context of ${containingFile}`);
  }
}
