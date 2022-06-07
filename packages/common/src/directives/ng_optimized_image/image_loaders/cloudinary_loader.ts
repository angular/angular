/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';

import {IMAGE_LOADER, ImageLoaderConfig} from './image_loader';
import {isValidPath, normalizePath, normalizeSrc} from './loader_utils';

/**
 * Function that generates a built-in ImageLoader for Cloudinary
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your Cloudinary images
 * This URL should match one of the following formats:
 * https://res.cloudinary.com/mysite
 * https://mysite.cloudinary.com
 * https://subdomain.mysite.com
 * @returns Provider that provides an ImageLoader function
 */
export function provideCloudinaryLoader(path: string): Provider {
  if (ngDevMode && !isValidPath(path)) {
    throwInvalidPathError(path);
  }
  path = normalizePath(path);

  return {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      // Example of a Cloudinary image URL:
      // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
      let params = `f_auto,q_auto`;  // sets image format and quality to "auto"
      if (config.width) {
        params += `,w_${config.width}`;
      }
      const url = `${path}/image/upload/${params}/${normalizeSrc(config.src)}`;
      return url;
    }
  };
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `CloudinaryLoader has detected an invalid path: ` +
          `expecting a path matching one of the following formats: https://res.cloudinary.com/mysite, https://mysite.cloudinary.com, or https://subdomain.mysite.com - ` +
          `but got: \`${path}\``);
}
