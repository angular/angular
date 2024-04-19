/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Type used for modifications to metadata
 *
 * @publicApi
 */
export type MetadataOverride<T> = {
  add?: Partial<T>,
  remove?: Partial<T>,
  set?: Partial<T>
};
