/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';

interface ClassDebugInfo {
  className: string;
  filePath?: string;
  lineNumber?: number;
}

/**
 * Sets the debug info for an Angular class.
 *
 * This runtime is guarded by ngDevMode flag.
 */
export function ɵsetClassDebugInfo(type: Type<any>, debugInfo: ClassDebugInfo): void {
  // TODO(pmvald): Implement this function
}
