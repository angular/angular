/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from './di';
let Console = class Console {
  log(message) {
    // tslint:disable-next-line:no-console
    console.log(message);
  }
  // Note: for reporting errors use `DOM.logError()` as it is platform specific
  warn(message) {
    console.warn(message);
  }
};
Console = __decorate([Injectable({providedIn: 'platform'})], Console);
export {Console};
//# sourceMappingURL=console.js.map
