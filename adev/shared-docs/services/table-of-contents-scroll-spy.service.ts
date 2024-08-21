/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ViewportScroller} from '@angular/common';
import {
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {RESIZE_EVENT_DELAY} from '../constants/index';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {auditTime, debounceTime, fromEvent, startWith} from 'rxjs';
import {WINDOW} from '../providers/index';
import {shouldReduceMotion} from '../utils/index';
import {TableOfContentsLoader} from './table-of-contents-loader.service';

export const SCROLL_EVENT_DELAY = 20;
export const SCROLL_FINISH_DELAY = SCROLL_EVENT_DELAY * 2;

@Injectable({providedIn: 'root'})
// The service is responsible for listening for scrolling and resizing,
// thanks to which it sets the active item in the Table of contents
export class TableOfContentsScrollSpy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableOfContentsLoader = inject(TableOfContentsLoader);
  private readonly document = inject(DOCUMENT);
  private readonly window = inject(WINDOW);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly injector = inject(EnvironmentInjector);
  private contentSourceElement: HTMLElement | null = null;
  private lastContentWidth = 0;

  activeItemId = signal<string | null>(null);
  scrollbarThumbOnTop = signal<boolean>(true);

  startListeningToScroll(contentSourceElement: HTMLElement | null): void {
    this.contentSourceElement = contentSourceElement;
    this.lastContentWidth = this.getContentWidth();

    this.setScrollEventHandlers();
    this.setResizeEventHandlers();
  }

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  scrollToSection(id: string): void {
    if (shouldReduceMotion()) {
      this.offsetToSection(id);
    } else {
      const section = this.document.getElementById(id);
      section?.scrollIntoView({behavior: 'smooth', block: 'start'});
      // We don't want to set the active item here, it would mess up the animation
      // The scroll event handler will handle it for us
    }
  }

  private offsetToSection(id: string): void {
    const section = this.document.getElementById(id);
    section?.scrollIntoView({block: 'start'});
    // Here we need to set the active item manually because scroll events might not be fired
    this.activeItemId.set(id);
  }

  // After window resize, we should update top value of each table content item
  private setResizeEventHandlers() {
    fromEvent(this.window, 'resize')
      .pipe(debounceTime(RESIZE_EVENT_DELAY), takeUntilDestroyed(this.destroyRef), startWith())
      .subscribe(() => {
        this.updateHeadingsTopAfterResize();
      });

    // We need to observe the height of the docs-viewer because it may change after the
    // assets (fonts, images) are loaded. They can (and will) change the y-position of the headings.
    const docsViewer = this.document.querySelector('docs-viewer');
    if (docsViewer) {
      afterNextRender(
        () => {
          const resizeObserver = new ResizeObserver(() => this.updateHeadingsTopAfterResize());
          resizeObserver.observe(docsViewer);
          this.destroyRef.onDestroy(() => resizeObserver.disconnect());
        },
        {injector: this.injector},
      );
    }
  }

  private updateHeadingsTopAfterResize(): void {
    this.lastContentWidth = this.getContentWidth();

    const contentElement = this.contentSourceElement;
    if (contentElement) {
      this.tableOfContentsLoader.updateHeadingsTopValue(contentElement);
      this.setActiveItemId();
    }
  }

  private setScrollEventHandlers(): void {
    const scroll$ = fromEvent(this.document, 'scroll').pipe(
      auditTime(SCROLL_EVENT_DELAY),
      takeUntilDestroyed(this.destroyRef),
    );

    scroll$.subscribe(() => this.setActiveItemId());
  }

  private setActiveItemId(): void {
    const tableOfContentItems = this.tableOfContentsLoader.tableOfContentItems();

    if (tableOfContentItems.length === 0) return;

    // Resize could emit scroll event, in that case we could stop setting active item until resize will be finished
    if (this.lastContentWidth !== this.getContentWidth()) {
      return;
    }

    const scrollOffset = this.getScrollOffset();
    if (scrollOffset === null) return;

    for (const [i, currentLink] of tableOfContentItems.entries()) {
      const nextLink = tableOfContentItems[i + 1];

      // A link is considered active if the page is scrolled past the
      // anchor without also being scrolled passed the next link.
      const isActive =
        scrollOffset >= currentLink.top && (!nextLink || nextLink.top >= scrollOffset);

      // When active item was changed then trigger change detection
      if (isActive && this.activeItemId() !== currentLink.id) {
        this.activeItemId.set(currentLink.id);
        return;
      }
    }

    if (scrollOffset < tableOfContentItems[0].top && this.activeItemId() !== null) {
      this.activeItemId.set(null);
    }

    const scrollOffsetZero = scrollOffset === 0;
    if (scrollOffsetZero !== this.scrollbarThumbOnTop()) {
      // we want to trigger change detection only when the value changes
      this.scrollbarThumbOnTop.set(scrollOffsetZero);
    }
  }

  // Gets the scroll offset of the scroll container
  private getScrollOffset(): number {
    return this.window.scrollY;
  }

  private getContentWidth(): number {
    return this.document.body.clientWidth || Number.MAX_SAFE_INTEGER;
  }
}
