/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT} from '@angular/common';
import {inject, signal, Injectable} from '@angular/core';
/**
 * Name of an attribute that is set on an element that should be
 * excluded from the `TableOfContentsLoader` lookup. This is needed
 * to exempt SSR'ed content of the `TableOfContents` component from
 * being inspected and accidentally pulling more content into ToC.
 */
export const TOC_SKIP_CONTENT_MARKER = 'toc-skip-content';
let TableOfContentsLoader = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TableOfContentsLoader = class {
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
      TableOfContentsLoader = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // There are some cases when default browser anchor scrolls a little above the
    // heading In that cases wrong item was selected. The value found by trial and
    // error.
    toleranceThreshold = 40;
    tableOfContentItems = signal([]);
    document = inject(DOCUMENT);
    buildTableOfContent(docElement) {
      const headings = this.getHeadings(docElement);
      const tocList = headings.map((heading) => ({
        id: heading.id,
        level: heading.tagName.toLowerCase(),
        title: this.getHeadingTitle(heading),
      }));
      this.tableOfContentItems.set(tocList);
    }
    getHeadingTitle(heading) {
      const div = this.document.createElement('div');
      div.innerHTML = heading.innerHTML;
      return (div.textContent || '').trim();
    }
    // Get all headings (h2 and h3) with ids, which are not children of the
    // docs-example-viewer component.
    getHeadings(element) {
      return Array.from(
        element.querySelectorAll(
          `h2[id]:not(docs-example-viewer h2):not([${TOC_SKIP_CONTENT_MARKER}]),` +
            `h3[id]:not(docs-example-viewer h3):not([${TOC_SKIP_CONTENT_MARKER}])`,
        ),
      );
    }
    /**
     * The methods setups several IntersectionObservers to determine when a heading is at the top of
     * the viewport. Using an IntersectionObserver is more efficient than reading DOM position
     * as it won't trigger any reflow.
     */
    setupIntersectionObserver(element, destroyRef, onActiveId) {
      // If we're at the top the we need the default active id to be the first heading.
      const headings = this.getHeadings(element);
      onActiveId(headings[0].id);
      headings.forEach((heading) => {
        const ioConfiguration = {
          /**
           * This rootMargin creates a horizontal line at 5% from the top of the viewport
           * that will help trigger an intersection at that the very point.
           */
          rootMargin: '0% 0% -95% 0%',
          /** 0 is the default  */
          threshold: 0,
        };
        const observer = new IntersectionObserver((entries, o) => {
          if (entries[0].isIntersecting) {
            onActiveId(entries[0].target.id);
          }
        }, ioConfiguration);
        observer.observe(heading);
        destroyRef.onDestroy(() => observer.disconnect());
      });
    }
  };
  return (TableOfContentsLoader = _classThis);
})();
export {TableOfContentsLoader};
//# sourceMappingURL=table-of-contents-loader.service.js.map
