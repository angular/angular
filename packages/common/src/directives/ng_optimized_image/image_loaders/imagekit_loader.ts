/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider} from '@angular/core';
import {PLACEHOLDER_QUALITY} from './constants';
import {createImageLoader, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';
import {normalizeLoaderTransform} from './normalized_options';

/**
 * Name and URL tester for ImageKit.
 */
export const imageKitLoaderInfo: ImageLoaderInfo = {
  name: 'ImageKit',
  testUrl: isImageKitUrl,
};

const IMAGE_KIT_LOADER_REGEX = /https?\:\/\/[^\/]+\.imagekit\.io\/.+/;
/**
 * Tests whether a URL is from ImageKit CDN.
 */
function isImageKitUrl(url: string): boolean {
  return IMAGE_KIT_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for ImageKit and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @returns Set of providers to configure the ImageKit loader.
 *
 * @see [Image Optimization Guide](guide/image-optimization)
 * @publicApi
 */
export const provideImageKitLoader: (path: string) => Provider[] = createImageLoader(
  createImagekitUrl,
  ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined,
);

export function createImagekitUrl(path: string, config: ImageLoaderConfig): string {
  // Example of an ImageKit image URL:
  // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
  const {src, width} = config;
  const params: string[] = [];

  if (width) {
    params.push(`w-${width}`);
  }

  if (config.height) {
    params.push(`h-${config.height}`);
  }

  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    params.push(`q-${PLACEHOLDER_QUALITY}`);
  }

  // Allows users to add any ImageKit transformation parameters as a string or object
  if (config.loaderParams?.['transform']) {
    const transformStr = normalizeLoaderTransform(config.loaderParams['transform'], '-');
    params.push(transformStr);
  }

  const urlSegments = params.length ? [path, `tr:${params.join(',')}`, src] : [path, src];
  const url = new URL(urlSegments.join('/'));
  return url.href;
}
