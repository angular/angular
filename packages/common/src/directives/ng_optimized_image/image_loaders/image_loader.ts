/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Provider, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';
import {PRECONNECT_CHECK_BLOCKLIST} from '../preconnect_link_checker';
import {isAbsoluteUrl, isValidPath, normalizePath, normalizeSrc} from '../url';

/**
 * Config options recognized by the image loader function.
 *
 * @publicApi
 * @developerPreview
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
}

/**
 * Represents an image loader function.
 *
 * @publicApi
 * @developerPreview
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;

/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 */
const noopImageLoader = (config: ImageLoaderConfig) => config.src;

/**
 * Injection token that configures the function that produces image URLs based on the specified
 * input.
 *
 * @publicApi
 * @developerPreview
 */
export const IMAGE_LOADER = new InjectionToken<ImageLoader>('ImageLoader', {
  providedIn: 'root',
  factory: () => noopImageLoader,
});

export function createImageLoader(
    buildUrlFn: (path: string, config: ImageLoaderConfig) => string, exampleUrls?: string[]) {
  return function provideImageLoader(
      path: string, options: {ensurePreconnect?: boolean} = {ensurePreconnect: true}) {
    if (ngDevMode && !isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    path = normalizePath(path);

    const loaderFn = (config: ImageLoaderConfig) => {
      if (ngDevMode && isAbsoluteUrl(config.src)) {
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

    if (ngDevMode && options.ensurePreconnect === false) {
      providers.push({provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true});
    }

    return providers;
  };
}

function throwInvalidPathError(path: unknown, exampleUrls: string[]): never {
  const exampleUrlsMsg = exampleUrls.join(' or ');
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
      `Image loader has detected an invalid path (\`${path}\`). ` +
          `To fix this, supply a path using one of the following formats: ${exampleUrlsMsg}`);
}

function throwUnexpectedAbsoluteUrlError(path: string, url: string): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
      `Image loader has detected a \`<img>\` tag with an invalid \`rawSrc\` attribute: ${url}. ` +
          `This image loader expects \`rawSrc\` to be a relative URL - ` +
          `however the provided value is an absolute URL. ` +
          `To fix this, provide \`rawSrc\` as a path relative to the base URL ` +
          `configured for this loader (\`${path}\`).`);
}
