/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchCanvas(Zone: ZoneType): void {
  Zone.__load_patch('canvas', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    const HTMLCanvasElement = global['HTMLCanvasElement'];
    if (
      typeof HTMLCanvasElement !== 'undefined' &&
      HTMLCanvasElement.prototype &&
      HTMLCanvasElement.prototype.toBlob
    ) {
      api.patchMacroTask(HTMLCanvasElement.prototype, 'toBlob', (self: any, args: any[]) => {
        return {name: 'HTMLCanvasElement.toBlob', target: self, cbIdx: 0, args: args};
      });
    }
  });
}
