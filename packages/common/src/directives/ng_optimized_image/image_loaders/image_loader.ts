/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Provider, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';
import {isAbsoluteUrl, isValidPath, normalizePath, normalizeSrc} from '../url';

/**
 * Config options recognized by the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export interface ImageLoaderConfig {
  /**
   * Image file name to be added to the image request URL.
   */
  src: string;
  /**
   * Width of the requested image (to be used when generating srcset).
   */
  width?: number;
  /**
   * Height of the requested image (to be used when generating srcset).
   */
  height?: number;
  /**
   * Whether the loader should generate a URL for a small image placeholder instead of a full-sized
   * image.
   */
  isPlaceholder?: boolean;
  /**
   * Additional user-provided parameters for use by the ImageLoader.
   */
  loaderParams?: {[key: string]: any};
}

/**
 * Represents an image loader function. Image loader functions are used by the
 * NgOptimizedImage directive to produce full image URL based on the image name and its width.
 *
 * @publicApi
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;

/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 */
export const noopImageLoader = (config: ImageLoaderConfig) => config.src;

/**
 * Metadata about the image loader.
 */
export type ImageLoaderInfo = {
  name: string;
  testUrl: (url: string) => boolean;
};

/**
 * Injection token that configures the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export const IMAGE_LOADER = new InjectionToken<ImageLoader>(ngDevMode ? 'ImageLoader' : '', {
  providedIn: 'root',
  factory: () => noopImageLoader,
});

/**
 * Internal helper function that makes it easier to introduce custom image loaders for the
 * `NgOptimizedImage` directive. It is enough to specify a URL builder function to obtain full DI
 * configuration for a given loader: a DI token corresponding to the actual loader function, plus DI
 * tokens managing preconnect check functionality.
 * @param buildUrlFn a function returning a full URL based on loader's configuration
 * @param exampleUrls example of full URLs for a given loader (used in error messages)
 * @returns a set of DI providers corresponding to the configured image loader
 */
export function createImageLoader(
  buildUrlFn: (path: string, config: ImageLoaderConfig) => string,
  exampleUrls?: string[],
) {
  return function provideImageLoader(path: string) {
    if (!isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }

    // The trailing / is stripped (if provided) to make URL construction (concatenation) easier in
    // the individual loader functions.
    path = normalizePath(path);

    const loaderFn = (config: ImageLoaderConfig) => {
      if (isAbsoluteUrl(config.src)) {
        // Image loader functions expect an image file name (e.g. `my-image.png`)
        // or a relative path + a file name (e.g. `/a/b/c/my-image.png`) as an input,
        // so the final absolute URL can be constructed.
        // When an absolute URL is provided instead - the loader can not
        // build a final URL, thus the error is thrown to indicate that.
        throwUnexpectedAbsoluteUrlError(path, config.src);
      }

      return buildUrlFn(path, {...config, src: normalizeSrc(config.src)});
    };

    const providers: Provider[] = [{provide: IMAGE_LOADER, useValue: loaderFn}];
    return providers;
  };
}

function throwInvalidPathError(path: unknown, exampleUrls: string[]): never {
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
    ngDevMode &&
      `Image loader has detected an invalid path (\`${path}\`). ` +
        `To fix this, supply a path using one of the following formats: ${exampleUrls.join(
          ' or ',
        )}`,
  );
}

function throwUnexpectedAbsoluteUrlError(path: string, url: string): never {
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
    ngDevMode &&
      `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. ` +
        `This image loader expects \`ngSrc\` to be a relative URL - ` +
        `however the provided value is an absolute URL. ` +
        `To fix this, provide \`ngSrc\` as a path relative to the base URL ` +
        `configured for this loader (\`${path}\`).`,
  );
}
