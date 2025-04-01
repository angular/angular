/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export interface DisplayTooltipResponse {
  displayParts: ts.SymbolDisplayPart[] | null;
  tags: ts.JSDocTagInfo[] | null;
  documentation: ts.SymbolDisplayPart[] | null;
}
