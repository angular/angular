/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function supportFeature(Observable: any, method: string) {
  const func = function() {
    return !!Observable.prototype[method];
  };
  (func as any).message = `Observable.${method} not support`;
}
