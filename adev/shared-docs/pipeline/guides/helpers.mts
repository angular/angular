/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JSDOM} from 'jsdom';

/** Whether the link provided is external to the application. */
export function isExternalLink(href: string | undefined | null) {
  return href?.startsWith('http') ?? false;
}

/** Provide the correct target for the anchor tag based on the link provided. */
export function anchorTarget(href: string | undefined | null) {
  return isExternalLink(href) ? ` target="_blank"` : '';
}

/**
 *
 * @param htmlString
 * @returns the first unknown anchor found or undefined if all anchors are valid
 */
export function hasUnknownAnchors(htmlString: string) {
  const fragment = JSDOM.fragment(htmlString);
  const anchors = fragment.querySelectorAll('a');
  return Array.from(anchors).find((anchor) => {
    const href = anchor.getAttribute('href');
    if (href?.startsWith('#')) {
      const id = href.slice(1);
      const target = fragment.getElementById(id);
      if (!target) {
        return href;
      }
    }
    return undefined;
  });
}
