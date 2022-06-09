/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';
import {PRECONNECT_CHECK_BLOCKLIST} from '../preconnect_link_checker';

import {IMAGE_LOADER, ImageLoaderConfig} from './image_loader';

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
export function provideCloudflareLoader(path: string, options: {ensurePreconnect?: boolean} = {
  ensurePreconnect: true
}) {
  ngDevMode && assertValidPath(path);
  path = normalizePath(path);

  const providers: Provider[] = [{
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      let params = `format=auto`;
      if (config.width) {
        params += `,width=${config.width.toString()}`;
      }
      const url = `${normalizePath(path)}/cdn-cgi/image/${params}/${normalizeSrc(config.src)}`
      return url;
    }
  }];

  if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
    providers.push({provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true});
  }

  return providers;
}

function assertValidPath(path: unknown) {
  const isString = typeof path === 'string';

  if (!isString || path.trim() === '') {
    throwInvalidPathError(path);
  }

  try {
    const url = new URL(path);
  } catch {
    throwInvalidPathError(path);
  }
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `ImgixLoader has detected an invalid path: ` +
          `expecting a path like https://somepath.imgix.net/` +
          `but got: \`${path}\``);
}

function normalizePath(path: string) {
  return path[path.length - 1] === '/' ? path.slice(0, -1) : path;
}

function normalizeSrc(src: string) {
  return src[0] === '/' ? src.slice(1) : src;
}
