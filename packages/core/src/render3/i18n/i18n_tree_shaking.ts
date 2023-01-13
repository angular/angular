/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 *
 * This file provides mechanism by which code relevant to the `TIcuContainerNode` is only loaded if
 * ICU is present in the template.
 */

import {TIcuContainerNode} from '../interfaces/node';
import {RNode} from '../interfaces/renderer_dom';
import {LView} from '../interfaces/view';


let _icuContainerIterate: (tIcuContainerNode: TIcuContainerNode, lView: LView) =>
    (() => RNode | null);

/**
 * Iterator which provides ability to visit all of the `TIcuContainerNode` root `RNode`s.
 */
export function icuContainerIterate(tIcuContainerNode: TIcuContainerNode, lView: LView): () =>
    RNode | null {
  return _icuContainerIterate(tIcuContainerNode, lView);
}

/**
 * Ensures that `IcuContainerVisitor`'s implementation is present.
 *
 * This function is invoked when i18n instruction comes across an ICU. The purpose is to allow the
 * bundler to tree shake ICU logic and only load it if ICU instruction is executed.
 */
export function ensureIcuContainerVisitorLoaded(
    loader: () => ((tIcuContainerNode: TIcuContainerNode, lView: LView) => (() => RNode | null))) {
  if (_icuContainerIterate === undefined) {
    // Do not inline this function. We want to keep `ensureIcuContainerVisitorLoaded` light, so it
    // can be inlined into call-site.
    _icuContainerIterate = loader();
  }
}
