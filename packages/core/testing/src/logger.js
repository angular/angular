/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from '../../src/core';
let Log = class Log {
  constructor() {
    this.logItems = [];
  }
  add(value) {
    this.logItems.push(value);
  }
  fn(value) {
    return () => {
      this.logItems.push(value);
    };
  }
  clear() {
    this.logItems = [];
  }
  result() {
    return this.logItems.join('; ');
  }
};
Log = __decorate([Injectable()], Log);
export {Log};
//# sourceMappingURL=logger.js.map
