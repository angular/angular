/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Gets autocompletion proposal entries at a particular position in a file.
 */
export interface AutocompleteRequest {
  file: string;
  content: string;
  position: number;
  from?: number;
  to?: number;
}
