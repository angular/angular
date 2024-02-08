/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { inject, Injectable, InjectionToken, Renderer2 } from '@angular/core';

import { DOCUMENT } from '../../dom_tokens';

import { PRECONNECTED_DOMAINS } from './tokens';
import { extractHostname } from './url';

// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

/**
 * Injection token to configure which origins should be excluded
 * from the preconnect link generation. It can either be a single string
 * or an array of strings to represent a group of origins, for example:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 */
export const PRECONNECT_CHECK_BLOCKLIST =
    new InjectionToken<Array<string|string[]>>('PRECONNECT_CHECK_BLOCKLIST');

/**
 * @description Contains the logic needed to track and add preconnect link tags to the
 * `<head>` tag. It will also track which domains have already had preconnect link tags
 * added to avoid duplication.
 */
@Injectable({providedIn: 'root'})
export class PreconnectLinkCreator {
  private readonly preconnectedDomains = inject(PRECONNECTED_DOMAINS);
  private readonly document = inject(DOCUMENT);
  
  private blocklist = new Set<string>(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);

  constructor() {
    const blocklist = inject(PRECONNECT_CHECK_BLOCKLIST, {optional: true});
    if (blocklist) {
      this.populateBlocklist(blocklist);
    }
  }

  private populateBlocklist(origins: Array<string|string[]>|string) {
    if (Array.isArray(origins)) {
      deepForEach(origins, origin => {
        this.blocklist.add(extractHostname(origin));
      });
    } else {
      this.blocklist.add(extractHostname(origins));
    }
  }

  /**
   * @description Add a preconnect `<link>` to the `<head>` of the `index.html` to speed up
   * the load of priority images.
   *
   * @param renderer The `Renderer2` passed in from the directive
   * @param src The original src of the image that is set on the `ngSrc` input.
   */
  createPreconnectLinkTag(renderer: Renderer2, src: string): void {
    const domain = extractHostname(src)

    if (this.blocklist.has(domain) || this.preconnectedDomains.has(domain)) {
      return;
    }

    this.preconnectedDomains.add(domain);

    const preconnect = renderer.createElement('link');
    renderer.setAttribute(preconnect, 'href', src);
    renderer.setAttribute(preconnect, 'rel', 'preconnect');

    renderer.appendChild(this.document.head, preconnect);
  }
}

/**
 * Invokes a callback for each element in the array. Also invokes a callback
 * recursively for each nested array.
 */
function deepForEach<T>(input: (T|any[])[], fn: (value: T) => void): void {
  for (let value of input) {
    Array.isArray(value) ? deepForEach(value, fn) : fn(value);
  }
}