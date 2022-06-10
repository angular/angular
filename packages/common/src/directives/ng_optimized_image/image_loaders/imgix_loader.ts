/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';
import {normalizeSrc} from '../util';

import {createImageLoader, ImageLoaderConfig} from './image_loader';

/**
 * Function that generates a built-in ImageLoader for Imgix and turns it
 * into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the Imgix loader.
 */
export const provideImgixLoader = createImageLoader(imgixLoaderFactory, throwInvalidPathError);

function imgixLoaderFactory(path: string) {
  return (config: ImageLoaderConfig) => {
    const url = new URL(`${path}/${normalizeSrc(config.src)}`);
    // This setting ensures the smallest allowable format is set.
    url.searchParams.set('auto', 'format');
    if (config.width) {
      url.searchParams.set('w', config.width.toString());
    }
    return url.href;
  };
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `ImgixLoader has detected an invalid path: ` +
          `expecting a path like https://somepath.imgix.net/` +
          `but got: \`${path}\``);
}
