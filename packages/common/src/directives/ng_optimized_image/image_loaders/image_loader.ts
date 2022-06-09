/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Provider} from '@angular/core';

import {PRECONNECT_CHECK_BLOCKLIST} from '../preconnect_link_checker';
import {isValidPath, normalizePath, normalizeSrc} from '../util';

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
    urlFn: (path: string) => ImageLoader,
    invalidPathFn: (path: unknown) => void,
) {
  return function provideImageLoader(
      path: string, options: {ensurePreconnect?: boolean} = {ensurePreconnect: true}) {
    if (ngDevMode && !isValidPath(path)) {
      invalidPathFn(path);
    }
    path = normalizePath(path);

    const providers: Provider[] = [{provide: IMAGE_LOADER, useValue: urlFn(path)}];

    if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
      providers.push({provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true});
    }

    return providers;
  };
}
