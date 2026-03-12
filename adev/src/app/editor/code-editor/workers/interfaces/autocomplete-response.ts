/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export interface AutocompleteItem {
  kind: string;
  name: string;
  sortText: string;

  codeActions?: ts.CodeAction[];
}

/**
 * Autocomplete response which contains all proposal entries.
 */
export type AutocompleteResponse = AutocompleteItem[];
