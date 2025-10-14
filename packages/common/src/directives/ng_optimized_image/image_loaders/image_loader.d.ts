/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, Provider } from '@angular/core';
/**
 * Config options recognized by the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export interface ImageLoaderConfig {
    /**
     * Image file name to be added to the image request URL.
     */
    src: string;
    /**
     * Width of the requested image (to be used when generating srcset).
     */
    width?: number;
    /**
     * Whether the loader should generate a URL for a small image placeholder instead of a full-sized
     * image.
     */
    isPlaceholder?: boolean;
    /**
     * Additional user-provided parameters for use by the ImageLoader.
     */
    loaderParams?: {
        [key: string]: any;
    };
}
/**
 * Represents an image loader function. Image loader functions are used by the
 * NgOptimizedImage directive to produce full image URL based on the image name and its width.
 *
 * @publicApi
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;
/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 */
export declare const noopImageLoader: (config: ImageLoaderConfig) => string;
/**
 * Metadata about the image loader.
 */
export type ImageLoaderInfo = {
    name: string;
    testUrl: (url: string) => boolean;
};
/**
 * Injection token that configures the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export declare const IMAGE_LOADER: InjectionToken<ImageLoader>;
/**
 * Internal helper function that makes it easier to introduce custom image loaders for the
 * `NgOptimizedImage` directive. It is enough to specify a URL builder function to obtain full DI
 * configuration for a given loader: a DI token corresponding to the actual loader function, plus DI
 * tokens managing preconnect check functionality.
 * @param buildUrlFn a function returning a full URL based on loader's configuration
 * @param exampleUrls example of full URLs for a given loader (used in error messages)
 * @returns a set of DI providers corresponding to the configured image loader
 */
export declare function createImageLoader(buildUrlFn: (path: string, config: ImageLoaderConfig) => string, exampleUrls?: string[]): (path: string) => Provider[];
