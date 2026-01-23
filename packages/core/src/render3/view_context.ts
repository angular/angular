/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {TNode} from './interfaces/node';
import type {LView} from './interfaces/view';
import {getCurrentTNode, getLView} from './state';

export class ViewContext {
  constructor(
    readonly view: LView,
    readonly node: TNode,
  ) {}

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__ = injectViewContext;
}

export function injectViewContext(): ViewContext {
  return new ViewContext(getLView()!, getCurrentTNode()!);
}
