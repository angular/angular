/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** closest implementation that is able to start from non-Element Nodes. */
export function closest(
  element: EventTarget | Element | null | undefined,
  selector: string,
): Element | null {
  if (!(element instanceof Node)) {
    return null;
  }

  let curr: Node | null = element;
  while (curr != null && !(curr instanceof Element)) {
    curr = curr.parentNode;
  }

  return curr?.closest(selector) ?? null;
}
