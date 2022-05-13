/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone, ɵformatRuntimeError as formatRuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

import {getUrl, imgDirectiveDetails} from './util';

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

  constructor(@Inject(DOCUMENT) private doc: Document, private ngZone: NgZone) {
    const win = doc.defaultView;
    if (typeof win !== 'undefined') {
      this.window = win;
    }
  }

  check(rewrittenSrc: string, rawSrc: string) {
    if (!this.window) return;

    const imgUrl = getUrl(rewrittenSrc, this.window);
    if (this.alreadySeen.has(imgUrl.origin)) return;

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
          `${imgDirectiveDetails(rawSrc)} has detected that this image ` +
              `contains the "priority" attribute, but doesn't have a corresponding ` +
              `preconnect tag. Please add the following element into ` +
              `the <head> of the document to optimize loading of this image:\n` +
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
