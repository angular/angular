/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface CommitMessageConfig {
  maxLineLength: number;
  minBodyLength: number;
  types: string[];
  scopes: string[];
}