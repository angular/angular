/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {isArray, isObject} from '../util/type_guards';
import type {FieldNode} from './node';

/**
 * Proxy handler which implements `FieldTree<T>` on top of `FieldNode`.
 */
export const FIELD_PROXY_HANDLER: ProxyHandler<() => FieldNode> = {
  get(getTgt: () => FieldNode, p: string | symbol, receiver: {[key: string]: unknown}) {
    const tgt = getTgt();

    // First, check whether the requested property is a defined child node of this node.
    const child = tgt.structure.getChild(p);
    if (child !== undefined) {
      // If so, return the child node's `FieldTree` proxy, allowing the developer to continue
      // navigating the form structure.
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
        return () => {
          // When creating an iterator, we need to account for reactivity. The iterator itself will
          // read things each time `.next()` is called, but that may happen outside of the context
          // where the iterator was created (e.g. with `@for`, actual diffing happens outside the
          // reactive context of the template).
          //
          // Instead, side-effectfully read the value here to ensure iterator creation is reactive.
          tgt.value();
          return Array.prototype[Symbol.iterator].apply(tgt.fieldProxy);
        };
      }
      // Note: We can consider supporting additional array methods if we want in the future,
      // but they should be thoroughly tested. Just forwarding the method directly from the
      // `Array` prototype results in broken behavior for some methods like `map`.
    }

    if (isObject(value)) {
      // For object fields, allow iteration over their entries for convenience of use with `@for`.
      if (p === Symbol.iterator) {
        return function* () {
          for (const key in receiver) {
            yield [key, receiver[key]];
          }
        };
      }
    }

    // Otherwise, this property doesn't exist.
    return undefined;
  },

  getOwnPropertyDescriptor(getTgt, prop) {
    const value = untracked(getTgt().value) as Object;
    const desc = Reflect.getOwnPropertyDescriptor(value, prop);
    // In order for `Object.keys` to function properly, keys must be reported as configurable.
    if (desc && !desc.configurable) {
      desc.configurable = true;
    }
    return desc;
  },

  ownKeys(getTgt: () => FieldNode) {
    const value = untracked(getTgt().value);
    return typeof value === 'object' && value !== null ? Reflect.ownKeys(value) : [];
  },
};
