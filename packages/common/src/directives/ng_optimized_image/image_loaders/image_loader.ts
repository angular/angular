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
import {isAbsoluteURL, isValidPath, normalizePath, normalizeSrc} from '../util';

/**
 * Config options recognized by the image loader function.
 */
export interface ImageLoaderConfig {
  // Name of the image to be added to the image request URL
  src: string;
  // Width of the requested image (to be used when generating srcset)
  width?: number;
}

/**
 * Represents an image loader function.
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;

/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 */
const noopImageLoader = (config: ImageLoaderConfig) => config.src;

/**
 * Special token that allows to configure a function that will be used to produce an image URL based
 * on the specified input.
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
      if (ngDevMode && isAbsoluteURL(config.src)) {
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
      `Image loader has detected an invalid path. ` +
          `Expecting a path matching one of the following formats: ${exampleUrlsMsg}` +
          ` - but got: \`${path}\``);
}

function throwUnexpectedAbsoluteUrlError(path: string, url: string): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
      `Image loader has detected an absolute URL used for one of the \`rawSrc\` ` +
          `attributes on an \`<img>\` tag: ${url}. The absolute URLs are not ` +
          `supported by this image loader. Please update the \`rawSrc\` attribute ` +
          `of that \`<img>\` tag to use a path relative to the base URL configured ` +
          `for this loader (\`${path}\`).`);
}
