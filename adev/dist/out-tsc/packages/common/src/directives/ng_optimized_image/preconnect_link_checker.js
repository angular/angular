/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  inject,
  Injectable,
  InjectionToken,
  ɵformatRuntimeError as formatRuntimeError,
  DOCUMENT,
} from '@angular/core';
import {assertDevMode} from './asserts';
import {imgDirectiveDetails} from './error_helper';
import {extractHostname, getUrl} from './url';
// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
/**
 * Injection token to configure which origins should be excluded
 * from the preconnect checks. It can either be a single string or an array of strings
 * to represent a group of origins, for example:
 *
 * ```ts
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```ts
 *  {provide: PRECONNECT_CHECK_BLOCKLIST,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 */
export const PRECONNECT_CHECK_BLOCKLIST = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'PRECONNECT_CHECK_BLOCKLIST' : '',
);
/**
 * Contains the logic to detect whether an image, marked with the "priority" attribute
 * has a corresponding `<link rel="preconnect">` tag in the `document.head`.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 */
let PreconnectLinkChecker = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PreconnectLinkChecker = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      PreconnectLinkChecker = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    document = inject(DOCUMENT);
    /**
     * Set of <link rel="preconnect"> tags found on this page.
     * The `null` value indicates that there was no DOM query operation performed.
     */
    preconnectLinks = null;
    /*
     * Keep track of all already seen origin URLs to avoid repeating the same check.
     */
    alreadySeen = new Set();
    window = this.document.defaultView;
    blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
    constructor() {
      assertDevMode('preconnect link checker');
      const blocklist = inject(PRECONNECT_CHECK_BLOCKLIST, {optional: true});
      if (blocklist) {
        this.populateBlocklist(blocklist);
      }
    }
    populateBlocklist(origins) {
      if (Array.isArray(origins)) {
        deepForEach(origins, (origin) => {
          this.blocklist.add(extractHostname(origin));
        });
      } else {
        this.blocklist.add(extractHostname(origins));
      }
    }
    /**
     * Checks that a preconnect resource hint exists in the head for the
     * given src.
     *
     * @param rewrittenSrc src formatted with loader
     * @param originalNgSrc ngSrc value
     */
    assertPreconnect(rewrittenSrc, originalNgSrc) {
      if (typeof ngServerMode !== 'undefined' && ngServerMode) return;
      const imgUrl = getUrl(rewrittenSrc, this.window);
      if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin)) return;
      // Register this origin as seen, so we don't check it again later.
      this.alreadySeen.add(imgUrl.origin);
      // Note: we query for preconnect links only *once* and cache the results
      // for the entire lifespan of an application, since it's unlikely that the
      // list would change frequently. This allows to make sure there are no
      // performance implications of making extra DOM lookups for each image.
      this.preconnectLinks ??= this.queryPreconnectLinks();
      if (!this.preconnectLinks.has(imgUrl.origin)) {
        console.warn(
          formatRuntimeError(
            2956 /* RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG */,
            `${imgDirectiveDetails(originalNgSrc)} there is no preconnect tag present for this ` +
              `image. Preconnecting to the origin(s) that serve priority images ensures that these ` +
              `images are delivered as soon as possible. To fix this, please add the following ` +
              `element into the <head> of the document:\n` +
              `  <link rel="preconnect" href="${imgUrl.origin}">`,
          ),
        );
      }
    }
    queryPreconnectLinks() {
      const preconnectUrls = new Set();
      const links = this.document.querySelectorAll('link[rel=preconnect]');
      for (const link of links) {
        const url = getUrl(link.href, this.window);
        preconnectUrls.add(url.origin);
      }
      return preconnectUrls;
    }
    ngOnDestroy() {
      this.preconnectLinks?.clear();
      this.alreadySeen.clear();
    }
  };
  return (PreconnectLinkChecker = _classThis);
})();
export {PreconnectLinkChecker};
/**
 * Invokes a callback for each element in the array. Also invokes a callback
 * recursively for each nested array.
 */
function deepForEach(input, fn) {
  for (let value of input) {
    Array.isArray(value) ? deepForEach(value, fn) : fn(value);
  }
}
//# sourceMappingURL=preconnect_link_checker.js.map
