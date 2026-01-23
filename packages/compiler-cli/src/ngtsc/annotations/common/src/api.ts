/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
   * If true, the resource loader is able to preprocess inline resources.
   */
  canPreprocess: boolean;

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
   * @param context Information regarding the resource such as the type and containing file.
   * @returns A Promise that is resolved once the resource has been loaded or `undefined`
   * if the file has already been loaded.
   * @throws An Error if pre-loading is not available.
   */
  preload(resolvedUrl: string, context: ResourceLoaderContext): Promise<void> | undefined;

  /**
   * Preprocess the content data of an inline resource, asynchronously.
   *
   * @param data The existing content data from the inline resource.
   * @param context Information regarding the resource such as the type and containing file.
   * @returns A Promise that resolves to the processed data. If no processing occurs, the
   * same data string that was passed to the function will be resolved.
   */
  preprocessInline(data: string, context: ResourceLoaderContext): Promise<string>;

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

/**
 * Contextual information used by members of the ResourceLoader interface.
 */
export interface ResourceLoaderContext {
  /**
   * The type of the component resource.
   * * Resources referenced via a component's `styles` or `styleUrls` properties are of
   * type `style`.
   * * Resources referenced via a component's `template` or `templateUrl` properties are of type
   * `template`.
   */
  type: 'style' | 'template';

  /**
   * The absolute path to the file that contains the resource or reference to the resource.
   */
  containingFile: string;

  /**
   * For style resources, the placement of the style within the containing file with lower numbers
   * being before higher numbers.
   * The value is primarily used by the Angular CLI to create a deterministic identifier for each
   * style in HMR scenarios.
   * This is undefined for templates.
   */
  order?: number;

  /**
   * The name of the class that defines the component using the resource.
   * This allows identifying the source usage of a resource in cases where multiple components are
   * contained in a single source file.
   */
  className: string;
}
