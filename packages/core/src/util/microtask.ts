/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const promise: Promise<any> = (() => Promise.resolve(0))();

declare const Zone: any;

export function scheduleMicroTask(fn: Function) {
  if (typeof Zone === 'undefined') {
    // use promise to schedule microTask instead of use Zone
    promise.then(() => {
      fn && fn.apply(null, null);
    });
  } else {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
  }
}
