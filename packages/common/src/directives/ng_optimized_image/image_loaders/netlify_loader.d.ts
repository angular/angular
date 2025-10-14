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
 * Name and URL tester for Netlify.
 */
export declare const netlifyLoaderInfo: ImageLoaderInfo;
/**
 * Function that generates an ImageLoader for Netlify and turns it into an Angular provider.
 *
 * @param path optional URL of the desired Netlify site. Defaults to the current site.
 * @returns Set of providers to configure the Netlify loader.
 *
 * @publicApi
 */
export declare function provideNetlifyLoader(path?: string): Provider[];
