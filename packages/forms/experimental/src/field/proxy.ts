/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {isArray} from '../util/type_guards';
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

    if (isArray(value)) {
      // Allow access to the length for field arrays, it should be the same as the length of the data.
      if (p === 'length') {
        return (tgt.value() as Array<unknown>).length;
      }
      // Allow access to the iterator. This allows the user to spread the field array into a
      // standard array in order to call methods like `filter`, `map`, etc.
      if (p === Symbol.iterator) {
        return (Array.prototype as any)[p];
      }
      // Note: We can consider supporting additional array methods if we want in the future,
      // but they should be thoroughly tested. Just forwarding the method directly from the
      // `Array` prototype results in broken behavior for some methods like `map`.
    }

    // Otherwise, this property doesn't exist.
    return undefined;
  },
};
