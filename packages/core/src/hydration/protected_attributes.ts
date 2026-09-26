/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {TAttributes} from '../render3/interfaces/node';

/**
 * Maps a tag name to the name of a static attribute that must not be re-applied during
 * hydration.
 *
 * Setting these attributes again on the client makes the browser reload the referenced external
 * resource, even when the value doesn't change. For example, an `<iframe src="...">` rendered on
 * the server will reload (and briefly flicker) if hydration calls `setAttribute('src', ...)` on
 * it again with the same URL.
 */
const HYDRATION_PROTECTED_ATTRIBUTES = /* @__PURE__ */ new Map<string, string>([
  ['iframe', 'src'],
  ['embed', 'src'],
  ['object', 'data'],
]);

/** Returns the protected attribute name for a given tag name, if any. */
export function getHydrationProtectedAttributeName(tagName: string): string | undefined {
  return HYDRATION_PROTECTED_ATTRIBUTES.get(tagName.toLowerCase());
}

/**
 * Looks up the value of a static attribute in a `TNode.mergedAttrs` array.
 *
 * Only considers plain, non-namespaced static attributes (the `[name, value, name, value, ...]`
 * pairs that precede any marker in the array, e.g. `AttributeMarker.Bindings`). This is
 * sufficient for the protected elements above, which are only ever matched by a plain static
 * attribute.
 */
export function getStaticAttrValue(
  mergedAttrs: TAttributes | null,
  attrName: string,
): string | null {
  if (mergedAttrs === null) return null;
  for (let i = 0; i < mergedAttrs.length; i += 2) {
    const name = mergedAttrs[i];
    if (typeof name !== 'string') {
      // Reached a marker (namespace, classes, styles, bindings, etc.). No more plain static
      // name/value pairs follow after this point.
      break;
    }
    if (name === attrName) {
      return mergedAttrs[i + 1] as string;
    }
  }
  return null;
}
