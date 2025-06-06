/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {untracked} from '@angular/core';
import type {FieldNode} from './node';

/**
 * Proxy handler which implements `Field<T>` on top of `FieldNode`.
 */
export const FIELD_PROXY_HANDLER: ProxyHandler<() => FieldNode> = {
  get(getTgt: () => FieldNode, p: string | symbol) {
    const tgt = getTgt();

    // First, check whether the requested property is a defined child node of this node.
    const child = tgt.structure.getChild(p);
    if (child !== undefined) {
      // If so, return the child node's `Field` proxy, allowing the developer to continue navigating
      // the form structure.
      return child.fieldProxy;
    }

    // Otherwise, we need to consider whether the properties they're accessing are related to array
    // iteration. We're specifically interested in `length`, but we only want to pass this through
    // if the value is actually an array.
    //
    // We untrack the value here to avoid spurious reactive notifications. In reality, we've already
    // incurred a dependency on the value via `tgt.getChild()` above.
    const value = untracked(tgt.value);

    // TODO: does it make sense to just pass these through to reads of `value[p]` at this point?
    if (Array.isArray(value)) {
      switch (p) {
        case 'length':
          return (tgt.value() as Array<unknown>).length;
        default:
          // Other array properties are interpreted as references to array functions, and read off
          // of the prototype.
          // TODO: it would be slightly more correct to reference the actual prototype of `value`.
          return (Array.prototype as any)[p];
      }
    }

    // Otherwise, this property doesn't exist.
    return undefined;
  },
};
