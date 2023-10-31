/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createImageLoader, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';

/**
 * Name and URL tester for Imgix.
 */
export const sirvLoaderInfo: ImageLoaderInfo = {
  name: 'Sirv',
  testUrl: isSirvUrl
};

const SIRV_LOADER_REGEX = /https?\:\/\/[^\/]+\.sirv\.com\/.+/;
/**
 * Tests whether a URL is from Imgix CDN.
 */
function isSirvUrl(url: string): boolean {
  return SIRV_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for Sirv and turns it into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.sirv.com or https://images.mysite.com
 * @returns Set of providers to configure the Imgix loader.
 *
 * @publicApi
 */
export const provideSirvLoader =
    createImageLoader(createSirvUrl, ngDevMode ? ['https://somepath.sirv.com/'] : undefined);

function createSirvUrl(path: string, config: ImageLoaderConfig) {
  const url = new URL(`${path}/${config.src}`);
  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }
  return url.href;
}
