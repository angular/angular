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
import {isValidPath, normalizePath} from '../util';

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

export function createImageLoader(urlFn: (path: string) => ImageLoader, exampleUrls?: string[]) {
  return function provideImageLoader(
      path: string, options: {ensurePreconnect?: boolean} = {ensurePreconnect: true}) {
    if (ngDevMode && !isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    path = normalizePath(path);

    const providers: Provider[] = [{provide: IMAGE_LOADER, useValue: urlFn(path)}];

    if (ngDevMode && options.ensurePreconnect === false) {
      providers.push({provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true});
    }

    return providers;
  };
}

function throwInvalidPathError(path: unknown, exampleUrls: string[]): never {
  const exampleUrlsMsg = exampleUrls.join(' or ');
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `Image loader has detected an invalid path. ` +
          `Expecting a path matching one of the following formats: ${exampleUrlsMsg}` +
          ` - but got: \`${path}\``);
}
