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
import {isValidPath, normalizePath, normalizeSrc} from '../util';

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
  if (ngDevMode && !isValidPath(path)) {
    throwInvalidPathError(path);
  }
  path = normalizePath(path);

  const providers: Provider[] = [{
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      let params = `format=auto`;
      if (config.width) {
        params += `,width=${config.width.toString()}`;
      }
      const url = `${path}/cdn-cgi/image/${params}/${normalizeSrc(config.src)}`;
      return url;
    }
  }];

  if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
    providers.push({provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true});
  }

  return providers;
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `CloudflareLoader has detected an invalid path: ` +
          `expecting a path like https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>` +
          `but got: \`${path}\``);
}
