/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Provider,
  ɵformatRuntimeError as formatRuntimeError,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {RuntimeErrorCode} from '../../../errors';
import {isAbsoluteUrl, isValidPath} from '../url';

import {IMAGE_LOADER, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';
import {PLACEHOLDER_QUALITY} from './constants';

/**
 * Name and URL tester for Netlify.
 */
export const netlifyLoaderInfo: ImageLoaderInfo = {
  name: 'Netlify',
  testUrl: isNetlifyUrl,
};

const NETLIFY_LOADER_REGEX = /https?\:\/\/[^\/]+\.netlify\.app\/.+/;

/**
 * Tests whether a URL is from a Netlify site. This won't catch sites with a custom domain,
 * but it's a good start for sites in development. This is only used to warn users who haven't
 * configured an image loader.
 */
function isNetlifyUrl(url: string): boolean {
  return NETLIFY_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for Netlify and turns it into an Angular provider.
 *
 * @param path optional URL of the desired Netlify site. Defaults to the current site.
 * @returns Set of providers to configure the Netlify loader.
 *
 * @publicApi
 */
export function provideNetlifyLoader(path?: string) {
  if (path && !isValidPath(path)) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
      ngDevMode &&
        `Image loader has detected an invalid path (\`${path}\`). ` +
          `To fix this, supply either the full URL to the Netlify site, or leave it empty to use the current site.`,
    );
  }

  if (path) {
    const url = new URL(path);
    path = url.origin;
  }

  const loaderFn = (config: ImageLoaderConfig) => {
    return createNetlifyUrl(config, path);
  };

  const providers: Provider[] = [{provide: IMAGE_LOADER, useValue: loaderFn}];
  return providers;
}

const validParams = new Map<string, string>([
  ['height', 'h'],
  ['fit', 'fit'],
  ['quality', 'q'],
  ['q', 'q'],
  ['position', 'position'],
]);

function createNetlifyUrl(config: ImageLoaderConfig, path?: string) {
  // Note: `path` can be undefined, in which case we use a fake one to construct a `URL` instance.
  const url = new URL(path ?? 'https://a/');
  url.pathname = '/.netlify/images';

  if (!isAbsoluteUrl(config.src) && !config.src.startsWith('/')) {
    config.src = '/' + config.src;
  }

  url.searchParams.set('url', config.src);

  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }

  // When requesting a placeholder image we ask for a low quality image to reduce the load time.
  // If the quality is specified in the loader config - always use provided value.
  const configQuality = config.loaderParams?.['quality'] ?? config.loaderParams?.['q'];
  if (config.isPlaceholder && !configQuality) {
    url.searchParams.set('q', PLACEHOLDER_QUALITY);
  }

  for (const [param, value] of Object.entries(config.loaderParams ?? {})) {
    if (validParams.has(param)) {
      url.searchParams.set(validParams.get(param)!, value.toString());
    } else {
      if (ngDevMode) {
        console.warn(
          formatRuntimeError(
            RuntimeErrorCode.INVALID_LOADER_ARGUMENTS,
            `The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`${param}\`".`,
          ),
        );
      }
    }
  }
  // The "a" hostname is used for relative URLs, so we can remove it from the final URL.
  return url.hostname === 'a' ? url.href.replace(url.origin, '') : url.href;
}
