/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Type used for modifications to metadata
 *
 * @experimental
 */
export type MetadataOverride<T> = {
  add?: T,
  remove?: T,
  set?: T
};
