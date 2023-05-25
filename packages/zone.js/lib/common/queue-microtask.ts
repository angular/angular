/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

Zone.__load_patch('queueMicrotask', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  api.patchMethod(global, 'queueMicrotask', delegate => {
    return function(self: any, args: any[]) {
      Zone.current.scheduleMicroTask('queueMicrotask', args[0]);
    }
  });
});
