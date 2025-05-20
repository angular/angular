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

/**
 * Name and URL tester for Imgix.
 */
export const imgixLoaderInfo: ImageLoaderInfo = {
  name: 'Imgix',
  testUrl: isImgixUrl,
};

const IMGIX_LOADER_REGEX = /https?\:\/\/[^\/]+\.imgix\.net\/.+/;
/**
 * Tests whether a URL is from Imgix CDN.
 */
function isImgixUrl(url: string): boolean {
  return IMGIX_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for Imgix and turns it into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @returns Set of providers to configure the Imgix loader.
 *
 * @publicApi
 */
export const provideImgixLoader: (path: string) => Provider[] = createImageLoader(
  createImgixUrl,
  ngDevMode ? ['https://somepath.imgix.net/'] : undefined,
);

function createImgixUrl(path: string, config: ImageLoaderConfig) {
  const url = new URL(`${path}/${config.src}`);
  // This setting ensures the smallest allowable format is set.
  url.searchParams.set('auto', 'format');
  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }

  // When requesting a placeholder image we ask a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    url.searchParams.set('q', PLACEHOLDER_QUALITY);
  }
  return url.href;
}
