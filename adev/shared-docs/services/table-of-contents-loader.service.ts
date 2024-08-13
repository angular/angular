/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {inject, signal, Injectable, PLATFORM_ID} from '@angular/core';

import {TableOfContentsItem, TableOfContentsLevel} from '../interfaces/index';

/**
 * Name of an attribute that is set on an element that should be
 * excluded from the `TableOfContentsLoader` lookup. This is needed
 * to exempt SSR'ed content of the `TableOfContents` component from
 * being inspected and accidentally pulling more content into ToC.
 */
export const TOC_SKIP_CONTENT_MARKER = 'toc-skip-content';

@Injectable({providedIn: 'root'})
export class TableOfContentsLoader {
  // There are some cases when default browser anchor scrolls a little above the
  // heading In that cases wrong item was selected. The value found by trial and
  // error.
  readonly toleranceThreshold = 40;

  readonly tableOfContentItems = signal([] as TableOfContentsItem[]);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  buildTableOfContent(docElement: Element): void {
    const headings = this.getHeadings(docElement);
    const tocList: TableOfContentsItem[] = headings.map((heading) => ({
      id: heading.id,
      level: heading.tagName.toLowerCase() as TableOfContentsLevel,
      title: this.getHeadingTitle(heading),
      top: this.calculateTop(heading),
    }));

    this.tableOfContentItems.set(tocList);
  }

  // Update top value of heading, it should be executed after window resize
  updateHeadingsTopValue(element: HTMLElement): void {
    const headings = this.getHeadings(element);
    const updatedTopValues = new Map<string, number>();

    for (const heading of headings) {
      const parentTop = heading.parentElement?.offsetTop ?? 0;
      const top = Math.floor(parentTop + heading.offsetTop - this.toleranceThreshold);
      updatedTopValues.set(heading.id, top);
    }

    this.tableOfContentItems.update((oldItems) => {
      let newItems = [...oldItems];
      for (const item of newItems) {
        item.top = updatedTopValues.get(item.id) ?? 0;
      }
      return newItems;
    });
  }

  private getHeadingTitle(heading: HTMLHeadingElement): string {
    const div: HTMLDivElement = this.document.createElement('div');
    div.innerHTML = heading.innerHTML;

    return (div.textContent || '').trim();
  }

  // Get all headings (h2 and h3) with ids, which are not children of the
  // docs-example-viewer component.
  private getHeadings(element: Element): HTMLHeadingElement[] {
    return Array.from(
      element.querySelectorAll<HTMLHeadingElement>(
        `h2[id]:not(docs-example-viewer h2):not([${TOC_SKIP_CONTENT_MARKER}]),` +
          `h3[id]:not(docs-example-viewer h3):not([${TOC_SKIP_CONTENT_MARKER}])`,
      ),
    );
  }

  private calculateTop(heading: HTMLHeadingElement): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    return (
      Math.floor(heading.offsetTop > 0 ? heading.offsetTop : heading.getClientRects()[0]?.top) -
      this.toleranceThreshold
    );
  }
}
