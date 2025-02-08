/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PLACEHOLDER_QUALITY} from './constants';
import {createImageLoader, ImageLoaderConfig} from './image_loader';

/**
 * Function that generates an ImageLoader for [Cloudflare Image
 * Resizing](https://developers.cloudflare.com/images/image-resizing/) and turns it into an Angular
 * provider. Note: Cloudflare has multiple image products - this provider is specifically for
 * Cloudflare Image Resizing; it will not work with Cloudflare Images or Cloudflare Polish.
 *
 * @param path Your domain name, e.g. https://mysite.com
 * @returns Provider that provides an ImageLoader function
 *
 * @publicApi
 */
export const provideCloudflareLoader = createImageLoader(
  createCloudflareUrl,
  ngDevMode ? ['https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>'] : undefined,
);

function createCloudflareUrl(path: string, config: ImageLoaderConfig) {
  let params = `format=auto`;
  if (config.width) {
    params += `,width=${config.width}`;
  }

  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  if (config.isPlaceholder) {
    params += `,quality=${PLACEHOLDER_QUALITY}`;
  }

  // Cloudflare image URLs format:
  // https://developers.cloudflare.com/images/image-resizing/url-format/
  return `${path}/cdn-cgi/image/${params}/${config.src}`;
}
