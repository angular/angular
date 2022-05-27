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

/**
 * Function that generates a built-in ImageLoader for Imgix and turns it
 * into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @returns Provider that provides an ImageLoader function
 */
export function provideImgixLoader(path: string): Provider {
  ngDevMode && assertValidPath(path);
  path = normalizePath(path);

  return {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      const url = new URL(`${path}/${normalizeSrc(config.src)}`);
      // This setting ensures the smallest allowable format is set.
      url.searchParams.set('auto', 'format');
      config.width && url.searchParams.set('w', config.width.toString());
      return url.href;
    }
  };
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
