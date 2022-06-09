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
 * Function that generates a built-in ImageLoader for Cloudinary
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your Cloudinary images
 * This URL should match one of the following formats:
 * https://res.cloudinary.com/mysite
 * https://mysite.cloudinary.com
 * https://subdomain.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the Cloudinary loader.
 */
export const provideCloudinaryLoader =
    createImageLoader(cloudinaryLoaderFactory, throwInvalidPathError);

function cloudinaryLoaderFactory(path: string) {
  return (config: ImageLoaderConfig) => {
    // Example of a Cloudinary image URL:
    // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
    let params = `f_auto,q_auto`;  // sets image format and quality to "auto"
    if (config.width) {
      params += `,w_${config.width}`;
    }
    const url = `${path}/image/upload/${params}/${normalizeSrc(config.src)}`;
    return url;
  };
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `CloudinaryLoader has detected an invalid path: ` +
          `expecting a path matching one of the following formats: https://res.cloudinary.com/mysite, https://mysite.cloudinary.com, or https://subdomain.mysite.com - ` +
          `but got: \`${path}\``);
}
