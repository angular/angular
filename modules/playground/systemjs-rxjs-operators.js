/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for an issue where RxJS cannot be used with UMD bundles only. This is because
// rxjs only ships one UMD bundle and expects everyone to only use the named "rxjs" AMD module.
// Since our code internally loads operators from "rxjs/operators/index", we need to make sure
// that we re-export all operators from the UMD module. This is a small trade-off for not loading
// all rxjs files individually.

if (typeof define === 'function' && define.amd) {
  define(['exports', 'rxjs'], (exports, rxjs) => {
    // Re-export all operators in this AMD module.
    Object.assign(exports, rxjs.operators);
  });
}
