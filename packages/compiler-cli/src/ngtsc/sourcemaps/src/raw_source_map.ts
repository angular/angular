/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This interface is the basic structure of the JSON in a raw source map that one might load from
 * disk.
 */
export interface RawSourceMap {
  version: number|string;
  file?: string;
  sourceRoot?: string;
  sources: string[];
  names: string[];
  sourcesContent?: (string|null)[];
  mappings: string;
}
