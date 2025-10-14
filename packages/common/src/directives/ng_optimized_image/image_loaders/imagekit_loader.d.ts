/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Provider } from '@angular/core';
import { ImageLoaderConfig, ImageLoaderInfo } from './image_loader';
/**
 * Name and URL tester for ImageKit.
 */
export declare const imageKitLoaderInfo: ImageLoaderInfo;
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
export declare const provideImageKitLoader: (path: string) => Provider[];
export declare function createImagekitUrl(path: string, config: ImageLoaderConfig): string;
