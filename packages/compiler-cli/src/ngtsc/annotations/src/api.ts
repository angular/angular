/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Resolves and loads resource files that are referenced in Angular metadata.
 *
 * Note that `preload()` and `load()` take a `resolvedUrl`, which can be found
 * by calling `resolve()`. These two steps are separated because sometimes the
 * resolved URL to the resource is needed as well as its contents.
 */
export interface ResourceLoader {
  /**
   * True if this resource loader can preload resources.
   *
   * Sometimes a `ResourceLoader` is not able to do asynchronous pre-loading of resources.
   */
  canPreload: boolean;

  /**
   * Resolve the url of a resource relative to the file that contains the reference to it.
   * The return value of this method can be used in the `load()` and `preload()` methods.
   *
   * @param url The, possibly relative, url of the resource.
   * @param fromFile The path to the file that contains the URL of the resource.
   * @returns A resolved url of resource.
   * @throws An error if the resource cannot be resolved.
   */
  resolve(file: string, basePath: string): string;

  /**
   * Preload the specified resource, asynchronously. Once the resource is loaded, its value
   * should be cached so it can be accessed synchronously via the `load()` method.
   *
   * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
   * @returns A Promise that is resolved once the resource has been loaded or `undefined`
   * if the file has already been loaded.
   * @throws An Error if pre-loading is not available.
   */
  preload(resolvedUrl: string): Promise<void>|undefined;

  /**
   * Load the resource at the given url, synchronously.
   *
   * The contents of the resource may have been cached by a previous call to `preload()`.
   *
   * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
   * @returns The contents of the resource.
   */
  load(resolvedUrl: string): string;
}
