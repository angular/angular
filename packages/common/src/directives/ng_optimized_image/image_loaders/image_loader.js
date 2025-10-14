/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken, ɵRuntimeError as RuntimeError} from '@angular/core';
import {isAbsoluteUrl, isValidPath, normalizePath, normalizeSrc} from '../url';
/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 */
export const noopImageLoader = (config) => config.src;
/**
 * Injection token that configures the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export const IMAGE_LOADER = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'ImageLoader' : '',
  {
    providedIn: 'root',
    factory: () => noopImageLoader,
  },
);
/**
 * Internal helper function that makes it easier to introduce custom image loaders for the
 * `NgOptimizedImage` directive. It is enough to specify a URL builder function to obtain full DI
 * configuration for a given loader: a DI token corresponding to the actual loader function, plus DI
 * tokens managing preconnect check functionality.
 * @param buildUrlFn a function returning a full URL based on loader's configuration
 * @param exampleUrls example of full URLs for a given loader (used in error messages)
 * @returns a set of DI providers corresponding to the configured image loader
 */
export function createImageLoader(buildUrlFn, exampleUrls) {
  return function provideImageLoader(path) {
    if (!isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    // The trailing / is stripped (if provided) to make URL construction (concatenation) easier in
    // the individual loader functions.
    path = normalizePath(path);
    const loaderFn = (config) => {
      if (isAbsoluteUrl(config.src)) {
        // Image loader functions expect an image file name (e.g. `my-image.png`)
        // or a relative path + a file name (e.g. `/a/b/c/my-image.png`) as an input,
        // so the final absolute URL can be constructed.
        // When an absolute URL is provided instead - the loader can not
        // build a final URL, thus the error is thrown to indicate that.
        throwUnexpectedAbsoluteUrlError(path, config.src);
      }
      return buildUrlFn(path, {...config, src: normalizeSrc(config.src)});
    };
    const providers = [{provide: IMAGE_LOADER, useValue: loaderFn}];
    return providers;
  };
}
function throwInvalidPathError(path, exampleUrls) {
  throw new RuntimeError(
    2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */,
    ngDevMode &&
      `Image loader has detected an invalid path (\`${path}\`). ` +
        `To fix this, supply a path using one of the following formats: ${exampleUrls.join(' or ')}`,
  );
}
function throwUnexpectedAbsoluteUrlError(path, url) {
  throw new RuntimeError(
    2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */,
    ngDevMode &&
      `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. ` +
        `This image loader expects \`ngSrc\` to be a relative URL - ` +
        `however the provided value is an absolute URL. ` +
        `To fix this, provide \`ngSrc\` as a path relative to the base URL ` +
        `configured for this loader (\`${path}\`).`,
  );
}
//# sourceMappingURL=image_loader.js.map
