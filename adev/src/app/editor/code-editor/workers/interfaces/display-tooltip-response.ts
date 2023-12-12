/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JSDocTagInfo, SymbolDisplayPart} from 'typescript';

export interface DisplayTooltipResponse {
  displayParts: SymbolDisplayPart[] | null;
  tags: JSDocTagInfo[] | null;
  documentation: SymbolDisplayPart[] | null;
}
