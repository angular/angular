/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createImageLoader, ImageLoaderConfig} from './image_loader';

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
export const provideCloudflareLoader = createImageLoader(
    createCloudflareURL,
    ngDevMode ? ['https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>'] : undefined);

function createCloudflareURL(path: string, config: ImageLoaderConfig) {
  let params = `format=auto`;
  if (config.width) {
    params += `,width=${config.width}`;
  }
  return `${path}/cdn-cgi/image/${params}/${config.src}`;
}
