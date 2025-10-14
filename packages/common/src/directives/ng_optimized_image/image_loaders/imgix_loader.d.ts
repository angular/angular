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
 * Name and URL tester for Imgix.
 */
export declare const imgixLoaderInfo: ImageLoaderInfo;
/**
 * Function that generates an ImageLoader for Imgix and turns it into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @returns Set of providers to configure the Imgix loader.
 *
 * @publicApi
 */
export declare const provideImgixLoader: (path: string) => Provider[];
