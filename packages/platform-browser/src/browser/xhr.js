/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from '@angular/core';
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 */
let BrowserXhr = class BrowserXhr {
  build() {
    return new XMLHttpRequest();
  }
};
BrowserXhr = __decorate([Injectable()], BrowserXhr);
export {BrowserXhr};
//# sourceMappingURL=xhr.js.map
