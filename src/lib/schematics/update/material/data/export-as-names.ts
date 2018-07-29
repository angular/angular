/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {transformChanges} from '../transform-change-data';

export interface MaterialExportAsNameData {
  /** The exportAs name to replace. */
  replace: string;
  /** The new exportAs name. */
  replaceWith: string;
}

export const exportAsNames = transformChanges<MaterialExportAsNameData>([]);
