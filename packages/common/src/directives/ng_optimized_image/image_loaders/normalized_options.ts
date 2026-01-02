/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Converts transform parameter to URL parameter string.
 * @param transform The transform parameter as string or object
 * @param separator The separator between key and value ('_' for Cloudinary, '=' for Cloudflare/Imgix , '-' for ImageKit)
 */
export function normalizeLoaderTransform(
  transform: string | Record<string, string>,
  separator: string,
): string {
  if (typeof transform === 'string') {
    return transform;
  }

  return Object.entries(transform)
    .map(([key, value]) => `${key}${separator}${value}`)
    .join(',');
}
