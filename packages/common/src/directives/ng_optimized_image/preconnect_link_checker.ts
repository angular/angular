/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, Optional, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

import {assertDevMode} from './asserts';
import {deepForEach, extractHostname, getUrl, imgDirectiveDetails} from './util';

// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

/**
 * Multi-provider injection token to configure which origins should be excluded
 * from the preconnect checks. If can either be a single string or an array of strings
 * to represent a group of origins, for example:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, multi: true, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, multi: true,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 * @developerPreview
 */
export const PRECONNECT_CHECK_BLOCKLIST =
    new InjectionToken<Array<string|string[]>>('PRECONNECT_CHECK_BLOCKLIST');

/**
 * Contains the logic to detect whether an image, marked with the "priority" attribute
 * has a corresponding `<link rel="preconnect">` tag in the `document.head`.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 */
@Injectable({providedIn: 'root'})
export class PreconnectLinkChecker {
  // Set of <link rel="preconnect"> tags found on this page.
  // The `null` value indicates that there was no DOM query operation performed.
  private preconnectLinks: Set<string>|null = null;

  // Keep track of all already seen origin URLs to avoid repeating the same check.
  private alreadySeen = new Set<string>();

  private window: Window|null = null;

  private blocklist = new Set<string>(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);

  constructor(
      @Inject(DOCUMENT) private doc: Document,
      @Optional() @Inject(PRECONNECT_CHECK_BLOCKLIST) blocklist: Array<string|string[]>|null) {
    assertDevMode('preconnect link checker');
    const win = doc.defaultView;
    if (typeof win !== 'undefined') {
      this.window = win;
    }
    if (blocklist) {
      this.pupulateBlocklist(blocklist);
    }
  }

  private pupulateBlocklist(origins: Array<string|string[]>) {
    if (Array.isArray(origins)) {
      deepForEach(origins, origin => {
        this.blocklist.add(extractHostname(origin));
      });
    } else {
      throw new RuntimeError(
          RuntimeErrorCode.INVALID_PRECONNECT_CHECK_BLOCKLIST,
          `The blocklist for the preconnect check was not provided as an array. ` +
              `Check that the \`PRECONNECT_CHECK_BLOCKLIST\` token is configured as a \`multi: true\` provider.`);
    }
  }

  check(rewrittenSrc: string, rawSrc: string) {
    if (!this.window) return;

    const imgUrl = getUrl(rewrittenSrc, this.window);
    if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin)) return;

    // Register this origin as seen, so we don't check it again later.
    this.alreadySeen.add(imgUrl.origin);

    if (this.preconnectLinks === null) {
      // Note: we query for preconnect links only *once* and cache the results
      // for the entire lifespan of an application, since it's unlikely that the
      // list would change frequently. This allows to make sure there are no
      // performance implications of making extra DOM lookups for each image.
      this.preconnectLinks = this.queryPreconnectLinks();
    }

    if (!this.preconnectLinks.has(imgUrl.origin)) {
      console.warn(formatRuntimeError(
          RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG,
          `${imgDirectiveDetails(rawSrc)} there is no preconnect tag present for this image. ` +
              `Preconnecting to the origin(s) that serve priority images ensures that these ` +
              `images are delivered as soon as possible. To fix this, please add the following ` +
              `element into the <head> of the document:\n` +
              `  <link rel="preconnect" href="${imgUrl.origin}">`));
    }
  }

  private queryPreconnectLinks(): Set<string> {
    const preconnectURLs = new Set<string>();
    const selector = 'link[rel=preconnect]';
    const links = (this.doc.head?.querySelectorAll(selector) ?? []) as unknown as HTMLLinkElement[];
    links.forEach(link => {
      const url = getUrl(link.href, this.window!);
      preconnectURLs.add(url.origin);
    });
    return preconnectURLs;
  }

  ngOnDestroy() {
    this.preconnectLinks?.clear();
    this.alreadySeen.clear();
  }
}
