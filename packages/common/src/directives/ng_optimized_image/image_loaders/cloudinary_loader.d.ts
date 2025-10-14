/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Provider } from '@angular/core';
import { ImageLoaderInfo } from './image_loader';
/**
 * Name and URL tester for Cloudinary.
 */
export declare const cloudinaryLoaderInfo: ImageLoaderInfo;
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
export declare const provideCloudinaryLoader: (path: string) => Provider[];
