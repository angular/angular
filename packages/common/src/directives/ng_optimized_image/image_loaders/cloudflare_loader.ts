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
 * Function that generates a built-in ImageLoader for Cloudflare Image Resizing
 * and turns it into an Angular provider. Note: Cloudflare has multiple image
 * products - this provider is specifically for Cloudflare Image Resizing;
 * it will not work with Cloudflare Images or Cloudflare Polish.
 *
 * @param path Your domain name
 * e.g. https://mysite.com
 * @returns Provider that provides an ImageLoader function
 */
export const provideCloudflareLoader =
    createImageLoader(cloudflareLoaderFactory, throwInvalidPathError);

function cloudflareLoaderFactory(path: string) {
  return (config: ImageLoaderConfig) => {
    let params = `format=auto`;
    if (config.width) {
      params += `,width=${config.width.toString()}`;
    }
    const url = `${path}/cdn-cgi/image/${params}/${normalizeSrc(config.src)}`;
    return url;
  };
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `CloudflareLoader has detected an invalid path: ` +
          `expecting a path like https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>` +
          `but got: \`${path}\``);
}
