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
import {isValidPath, normalizePath, normalizeSrc} from './loader_utils';

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
export function provideImageKitLoader(path: string, options: {ensurePreconnect?: boolean} = {
  ensurePreconnect: true
}): Provider[] {
  if (ngDevMode && !isValidPath(path)) {
    throwInvalidPathError(path);
  }
  path = normalizePath(path);

  const providers: Provider[] = [{
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      // Example of an ImageKit image URL:
      // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
      let params = `tr:q-auto`;  // applies the "auto quality" transformation
      if (config.width) {
        params += `,w-${config.width?.toString()}`;
      };
      const url = `${path}/${params}/${normalizeSrc(config.src)}`;
      return url;
    }
  }];

  if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
    providers.push({
      provide: PRECONNECT_CHECK_BLOCKLIST,
      useValue: [path],
      multi: true,
    });
  }

  return providers;
}

function throwInvalidPathError(path: unknown): never {
  throw new RuntimeError(
      RuntimeErrorCode.INVALID_INPUT,
      `ImageKitLoader has detected an invalid path: ` +
          `expecting a path matching one of the following formats: https://ik.imagekit.io/mysite or https://subdomain.mysite.com - ` +
          `but got: \`${path}\``);
}
