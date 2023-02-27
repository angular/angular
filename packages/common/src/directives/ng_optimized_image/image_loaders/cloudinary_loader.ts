/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createImageLoader, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';

/**
 * Name and URL tester for Cloudinary.
 */
export const cloudinaryLoaderInfo: ImageLoaderInfo = {
  name: 'Cloudinary',
  testUrl: isCloudinaryUrl
};

const CLOUDINARY_LOADER_REGEX = /https?\:\/\/[^\/]+\.cloudinary\.com\/.+/;
/**
 * Tests whether a URL is from Cloudinary CDN.
 */
function isCloudinaryUrl(url: string): boolean {
  return CLOUDINARY_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for Cloudinary and turns it into an Angular provider.
 *
 * @param path Base URL of your Cloudinary images
 * This URL should match one of the following formats:
 * https://res.cloudinary.com/mysite
 * https://mysite.cloudinary.com
 * https://subdomain.mysite.com
 * @returns Set of providers to configure the Cloudinary loader.
 *
 * @publicApi
 */
export const provideCloudinaryLoader = createImageLoader(
    createCloudinaryUrl,
    ngDevMode ?
        [
          'https://res.cloudinary.com/mysite', 'https://mysite.cloudinary.com',
          'https://subdomain.mysite.com'
        ] :
        undefined);

function createCloudinaryUrl(path: string, config: ImageLoaderConfig) {
  // Cloudinary image URLformat:
  // https://cloudinary.com/documentation/image_transformations#transformation_url_structure
  // Example of a Cloudinary image URL:
  // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
  let params = `f_auto,q_auto`;  // sets image format and quality to "auto"
  if (config.width) {
    params += `,w_${config.width}`;
  }
  return `${path}/image/upload/${params}/${config.src}`;
}
