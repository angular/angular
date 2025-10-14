/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getCurrentTNode, getLView} from './state';
export class ViewContext {
  constructor(view, node) {
    this.view = view;
    this.node = node;
  }
}
/**
 * @internal
 * @nocollapse
 */
ViewContext.__NG_ELEMENT_ID__ = injectViewContext;
export function injectViewContext() {
  return new ViewContext(getLView(), getCurrentTNode());
}
//# sourceMappingURL=view_context.js.map
