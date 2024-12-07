/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

export function patchQueueMicrotask(global: any, api: _ZonePrivate) {
  api.patchMethod(global, 'queueMicrotask', (delegate) => {
    return function (self: any, args: any[]) {
      Zone.current.scheduleMicroTask('queueMicrotask', args[0]);
    };
  });
}
