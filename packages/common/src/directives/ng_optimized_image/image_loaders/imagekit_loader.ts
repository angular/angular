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
 * Function that generates a built-in ImageLoader for ImageKit
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the ImageKit loader.
 */
export const provideImageKitLoader =
    createImageLoader(imagekitLoaderFactory, throwInvalidPathError);

export function imagekitLoaderFactory(path: string) {
  return (config: ImageLoaderConfig) => {
    // Example of an ImageKit image URL:
    // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
    let params = `tr:q-auto`;  // applies the "auto quality" transformation
    if (config.width) {
      params += `,w-${config.width}`;
    }
    const url = `${path}/${params}/${normalizeSrc(config.src)}`;
    return url;
  };
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `ImageKitLoader has detected an invalid path: ` +
          `expecting a path matching one of the following formats: https://ik.imagekit.io/mysite or https://subdomain.mysite.com - ` +
          `but got: \`${path}\``);
}
