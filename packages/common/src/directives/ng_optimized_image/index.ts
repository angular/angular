/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵImageConfig as ImageConfig} from '@angular/core';
// These exports represent the set of symbols exposed as a public API.
export {provideCloudflareLoader} from './image_loaders/cloudflare_loader';
export {provideCloudinaryLoader} from './image_loaders/cloudinary_loader';
export {IMAGE_LOADER, ImageLoader, ImageLoaderConfig} from './image_loaders/image_loader';
export {provideImageKitLoader} from './image_loaders/imagekit_loader';
export {provideImgixLoader} from './image_loaders/imgix_loader';
export {provideNetlifyLoader} from './image_loaders/netlify_loader';
export {ImagePlaceholderConfig, NgOptimizedImage} from './ng_optimized_image';
export {PRECONNECT_CHECK_BLOCKLIST} from './preconnect_link_checker';
