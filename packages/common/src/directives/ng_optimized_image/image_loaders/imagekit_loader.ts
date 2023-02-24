/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createImageLoader, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';

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
 * @publicApi
 */
export const provideImageKitLoader = createImageLoader(
    createImagekitUrl,
    ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);

export function createImagekitUrl(path: string, config: ImageLoaderConfig): string {
  // Example of an ImageKit image URL:
  // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
  const {src, width} = config;
  let urlSegments: string[];

  if (width) {
    const params = `tr:w-${width}`;
    urlSegments = [path, params, src];
  } else {
    urlSegments = [path, src];
  }

  return urlSegments.join('/');
}
