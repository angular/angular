/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchUserMedia(Zone: ZoneType): void {
  Zone.__load_patch('getUserMedia', (global: any, Zone: any, api: _ZonePrivate) => {
    function wrapFunctionArgs(func: Function, source?: string): Function {
      return function (this: unknown) {
        const args = Array.prototype.slice.call(arguments);
        const wrappedArgs = api.bindArguments(args, source ? source : (func as any).name);
        return func.apply(this, wrappedArgs);
      };
    }
    let navigator = global['navigator'];
    if (navigator && navigator.getUserMedia) {
      navigator.getUserMedia = wrapFunctionArgs(navigator.getUserMedia);
    }
  });
}
