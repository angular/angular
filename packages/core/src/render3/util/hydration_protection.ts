/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This represents a mapping of element tag name to an attribute name that should not be reset
 * during hydration in case the value is the same.
 * Values are implemented as a list in case they need to be expanded in the future to accommodate
 * more cases.
 */
const hydrationProtectedElementToAttributeMap = new Map<string, string>([
  // All these elements and their attributes force the browser to reload resources when they're set
  // again with the same value. For example, consider an `<object>` element with its `data`
  // attribute set to `/assets/some-file.pdf`. When the browser retrieves an HTML document from the
  // server and finishes parsing it (after the document state is set to `complete`), it loads
  // external resources such as images, videos, audios, etc. This includes loading
  // `/assets/some-file.pdf`. Subsequently, when Angular begins its hydration process, it attempts
  // to call `setAttribute` on the `<object>` element again with `setAttribute('data',
  // '/assets/some-file.pdf')`. This action forces the browser to reload the same resources, even
  // though they have already been loaded previously.
  ['iframe', 'src'],
  ['embed', 'src'],
  ['object', 'data'],
]);

export function getHydrationProtectedAttribute(tagName: string): string | undefined {
  return hydrationProtectedElementToAttributeMap.get(
    // Convert to lowercase so we cover both cases when the tag name is `iframe` or `IFRAME`.
    tagName.toLowerCase(),
  );
}
