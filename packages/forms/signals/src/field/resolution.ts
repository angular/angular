/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The depth of the current path when evaluating a logic function.
 * Do not set this directly, it is a context variable managed by `setBoundPathDepthForResolution`.
 */
export let boundPathDepth = 0;

/**
 * Sets the bound path depth for the duration of the given logic function.
 * This is used to ensure that the field resolution algorithm walks far enough up the field tree to
 * reach the point where the root of the path we're bound to is applied. This normally isn't a big
 * concern, but matters when we're dealing with recursive structures.
 *
 * Consider this example:
 *
 * ```
 * const s = schema(p => {
 *   disabled(p.next, ({valueOf}) => valueOf(p.data));
 *   apply(p.next, s);
 * });
 * ```
 *
 * Here we need to know that the `disabled` logic was bound to a path of depth 1. Otherwise we'd
 * attempt to resolve `p.data` in the context of the field corresponding to `p.next`.
 * The resolution algorithm would start with the field for `p.next` and see that it *does* contain
 * the logic for `s` (due to the fact that its recursively applied.) It would then decide not to
 * walk up the field tree at all, and to immediately start walking down the keys for the target path
 * `p.data`, leading it to grab the field corresponding to `p.next.data`.
 *
 * We avoid the problem described above by keeping track of the depth (relative to Schema root) of
 * the path we were bound to. We then require the resolution algorithm to walk at least that far up
 * the tree before finding a node that contains the logic for `s`.
 *
 * @param fn A logic function that is bound to a particular path
 * @param depth The depth in the field tree of the field the logic is bound to
 * @returns A version of the logic function that is aware of its depth.
 */
export function setBoundPathDepthForResolution<A extends any[], R>(
  fn: (...args: A) => R,
  depth: number,
): (...args: A) => R {
  return (...args: A) => {
    try {
      boundPathDepth = depth;
      return fn(...args);
    } finally {
      boundPathDepth = 0;
    }
  };
}
