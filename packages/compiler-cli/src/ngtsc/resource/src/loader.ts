/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ResourceLoader, ResourceLoaderContext} from '../../annotations';
import {NgCompilerAdapter, ResourceHostContext} from '../../core/api';
import {AbsoluteFsPath, join, PathSegment} from '../../file_system';
import {RequiredDelegations} from '../../util/src/typescript';

const CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;

const RESOURCE_MARKER = '.$ngresource$';
const RESOURCE_MARKER_TS = RESOURCE_MARKER + '.ts';

/**
 * `ResourceLoader` which delegates to an `NgCompilerAdapter`'s resource loading methods.
 */
export class AdapterResourceLoader implements ResourceLoader {
  private cache = new Map<string, string>();
  private fetching = new Map<string, Promise<void>>();
  private lookupResolutionHost = createLookupResolutionHost(this.adapter);

  canPreload = !!this.adapter.readResource;
  canPreprocess = !!this.adapter.transformResource;

  constructor(private adapter: NgCompilerAdapter, private options: ts.CompilerOptions) {}

  /**
   * Resolve the url of a resource relative to the file that contains the reference to it.
   * The return value of this method can be used in the `load()` and `preload()` methods.
   *
   * Uses the provided CompilerHost if it supports mapping resources to filenames.
   * Otherwise, uses a fallback mechanism that searches the module resolution candidates.
   *
   * @param url The, possibly relative, url of the resource.
   * @param fromFile The path to the file that contains the URL of the resource.
   * @returns A resolved url of resource.
   * @throws An error if the resource cannot be resolved.
   */
  resolve(url: string, fromFile: string): string {
    let resolvedUrl: string|null = null;
    if (this.adapter.resourceNameToFileName) {
      resolvedUrl = this.adapter.resourceNameToFileName(url, fromFile);
    } else {
      resolvedUrl = this.fallbackResolve(url, fromFile);
    }
    if (resolvedUrl === null) {
      throw new Error(`HostResourceResolver: could not resolve ${url} in context of ${fromFile})`);
    }
    return resolvedUrl;
  }

  /**
   * Preload the specified resource, asynchronously.
   *
   * Once the resource is loaded, its value is cached so it can be accessed synchronously via the
   * `load()` method.
   *
   * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
   * @param context Information about the resource such as the type and containing file.
   * @returns A Promise that is resolved once the resource has been loaded or `undefined` if the
   * file has already been loaded.
   * @throws An Error if pre-loading is not available.
   */
  preload(resolvedUrl: string, context: ResourceLoaderContext): Promise<void>|undefined {
    if (!this.adapter.readResource) {
      throw new Error(
          'HostResourceLoader: the CompilerHost provided does not support pre-loading resources.');
    }
    if (this.cache.has(resolvedUrl)) {
      return undefined;
    } else if (this.fetching.has(resolvedUrl)) {
      return this.fetching.get(resolvedUrl);
    }

    let result = this.adapter.readResource(resolvedUrl);

    if (this.adapter.transformResource && context.type === 'style') {
      const resourceContext: ResourceHostContext = {
        type: 'style',
        containingFile: context.containingFile,
        resourceFile: resolvedUrl,
      };
      result = Promise.resolve(result).then(async (str) => {
        const transformResult = await this.adapter.transformResource!(str, resourceContext);
        return transformResult === null ? str : transformResult.content;
      });
    }

    if (typeof result === 'string') {
      this.cache.set(resolvedUrl, result);
      return undefined;
    } else {
      const fetchCompletion = result.then(str => {
        this.fetching.delete(resolvedUrl);
        this.cache.set(resolvedUrl, str);
      });
      this.fetching.set(resolvedUrl, fetchCompletion);
      return fetchCompletion;
    }
  }

  /**
   * Preprocess the content data of an inline resource, asynchronously.
   *
   * @param data The existing content data from the inline resource.
   * @param context Information regarding the resource such as the type and containing file.
   * @returns A Promise that resolves to the processed data. If no processing occurs, the
   * same data string that was passed to the function will be resolved.
   */
  async preprocessInline(data: string, context: ResourceLoaderContext): Promise<string> {
    if (!this.adapter.transformResource || context.type !== 'style') {
      return data;
    }

    const transformResult = await this.adapter.transformResource(
        data, {type: 'style', containingFile: context.containingFile, resourceFile: null});
    if (transformResult === null) {
      return data;
    }

    return transformResult.content;
  }

  /**
   * Load the resource at the given url, synchronously.
   *
   * The contents of the resource may have been cached by a previous call to `preload()`.
   *
   * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
   * @returns The contents of the resource.
   */
  load(resolvedUrl: string): string {
    if (this.cache.has(resolvedUrl)) {
      return this.cache.get(resolvedUrl)!;
    }

    const result = this.adapter.readResource ? this.adapter.readResource(resolvedUrl) :
                                               this.adapter.readFile(resolvedUrl);
    if (typeof result !== 'string') {
      throw new Error(`HostResourceLoader: loader(${resolvedUrl}) returned a Promise`);
    }
    this.cache.set(resolvedUrl, result);
    return result;
  }

  /**
   * Invalidate the entire resource cache.
   */
  invalidate(): void {
    this.cache.clear();
  }

  /**
   * Attempt to resolve `url` in the context of `fromFile`, while respecting the rootDirs
   * option from the tsconfig. First, normalize the file name.
   */
  private fallbackResolve(url: string, fromFile: string): string|null {
    let candidateLocations: string[];
    if (url.startsWith('/')) {
      // This path is not really an absolute path, but instead the leading '/' means that it's
      // rooted in the project rootDirs. So look for it according to the rootDirs.
      candidateLocations = this.getRootedCandidateLocations(url);
    } else {
      // This path is a "relative" path and can be resolved as such. To make this easier on the
      // downstream resolver, the './' prefix is added if missing to distinguish these paths from
      // absolute node_modules paths.
      if (!url.startsWith('.')) {
        url = `./${url}`;
      }
      candidateLocations = this.getResolvedCandidateLocations(url, fromFile);
    }

    for (const candidate of candidateLocations) {
      if (this.adapter.fileExists(candidate)) {
        return candidate;
      } else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
        /**
         * If the user specified styleUrl points to *.scss, but the Sass compiler was run before
         * Angular, then the resource may have been generated as *.css. Simply try the resolution
         * again.
         */
        const cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, '.css');
        if (this.adapter.fileExists(cssFallbackUrl)) {
          return cssFallbackUrl;
        }
      }
    }
    return null;
  }

  private getRootedCandidateLocations(url: string): AbsoluteFsPath[] {
    // The path already starts with '/', so add a '.' to make it relative.
    const segment: PathSegment = ('.' + url) as PathSegment;
    return this.adapter.rootDirs.map(rootDir => join(rootDir, segment));
  }

  /**
   * TypeScript provides utilities to resolve module names, but not resource files (which aren't
   * a part of the ts.Program). However, TypeScript's module resolution can be used creatively
   * to locate where resource files should be expected to exist. Since module resolution returns
   * a list of file names that were considered, the loader can enumerate the possible locations
   * for the file by setting up a module resolution for it that will fail.
   */
  private getResolvedCandidateLocations(url: string, fromFile: string): string[] {
    // `failedLookupLocations` is in the name of the type ts.ResolvedModuleWithFailedLookupLocations
    // but is marked @internal in TypeScript. See
    // https://github.com/Microsoft/TypeScript/issues/28770.
    type ResolvedModuleWithFailedLookupLocations =
        ts.ResolvedModuleWithFailedLookupLocations&{failedLookupLocations: ReadonlyArray<string>};

    // clang-format off
    const failedLookup = ts.resolveModuleName(url + RESOURCE_MARKER, fromFile, this.options, this.lookupResolutionHost) as ResolvedModuleWithFailedLookupLocations;
    // clang-format on
    if (failedLookup.failedLookupLocations === undefined) {
      throw new Error(
          `Internal error: expected to find failedLookupLocations during resolution of resource '${
              url}' in context of ${fromFile}`);
    }

    return failedLookup.failedLookupLocations
        .filter(candidate => candidate.endsWith(RESOURCE_MARKER_TS))
        .map(candidate => candidate.slice(0, -RESOURCE_MARKER_TS.length));
  }
}

/**
 * Derives a `ts.ModuleResolutionHost` from a compiler adapter that recognizes the special resource
 * marker and does not go to the filesystem for these requests, as they are known not to exist.
 */
function createLookupResolutionHost(adapter: NgCompilerAdapter):
    RequiredDelegations<ts.ModuleResolutionHost> {
  return {
    directoryExists(directoryName: string): boolean {
      if (directoryName.includes(RESOURCE_MARKER)) {
        return false;
      } else if (adapter.directoryExists !== undefined) {
        return adapter.directoryExists(directoryName);
      } else {
        // TypeScript's module resolution logic assumes that the directory exists when no host
        // implementation is available.
        return true;
      }
    },
    fileExists(fileName: string): boolean {
      if (fileName.includes(RESOURCE_MARKER)) {
        return false;
      } else {
        return adapter.fileExists(fileName);
      }
    },
    readFile: adapter.readFile.bind(adapter),
    getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
    getDirectories: adapter.getDirectories?.bind(adapter),
    realpath: adapter.realpath?.bind(adapter),
    trace: adapter.trace?.bind(adapter),
  };
}
