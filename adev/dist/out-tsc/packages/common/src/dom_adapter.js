/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
let _DOM = null;
export function getDOM() {
  return _DOM;
}
export function setRootDomAdapter(adapter) {
  _DOM ??= adapter;
}
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export class DomAdapter {}
//# sourceMappingURL=dom_adapter.js.map
