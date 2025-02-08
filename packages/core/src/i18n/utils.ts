/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TNode, TNodeFlags} from '../render3/interfaces/node';

/**
 * Checks whether a TNode is considered detached, i.e. not present in the
 * translated i18n template. We should not attempt hydration for such nodes
 * and instead, use a regular "creation mode".
 */
export function isDetachedByI18n(tNode: TNode) {
  return (tNode.flags & TNodeFlags.isDetached) === TNodeFlags.isDetached;
}
