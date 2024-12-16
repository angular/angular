/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {DestroyRef, Injectable, Injector, PLATFORM_ID, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';
import {MEMBER_ID_ATTRIBUTE} from '../constants/api-reference-prerender.constants';
import {WINDOW} from '@angular/docs';
import {Router} from '@angular/router';
import {AppScroller} from '../../../app-scroller';

// Adds some space/margin between the top of the target element and the top of viewport.
const SCROLL_MARGIN_TOP = 100;

@Injectable()
export class ReferenceScrollHandler {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly window = inject(WINDOW);
  private readonly router = inject(Router);
  private readonly appScroller = inject(AppScroller);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  setupListeners(tocSelector: string): void {
    if (!this.isBrowser) {
      return;
    }

    this.setupCodeToCListeners(tocSelector);
    this.setupFragmentChangeListener();
  }

  private setupFragmentChangeListener() {
    this.router.routerState.root.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fragment) => {
        // If there is no fragment or the scroll event has a position (traversing through history),
        // allow the scroller to handle scrolling instead of going to the fragment
        if (!fragment || this.appScroller.lastScrollEvent?.position) {
          this.appScroller.scroll(this.injector);
          return;
        }

        const card = this.document.getElementById(fragment) as HTMLDivElement | null;
        card?.focus();
        this.scrollToCard(card);
      });
  }

  private setupCodeToCListeners(tocSelector: string): void {
    const tocContainer = this.document.querySelector<HTMLDivElement>(tocSelector);

    if (!tocContainer) {
      return;
    }

    fromEvent(tocContainer, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.target instanceof HTMLAnchorElement) {
          event.stopPropagation();
          return;
        }

        // Get the card member ID from the attributes
        const target =
          event.target instanceof HTMLButtonElement
            ? event.target
            : this.findButtonElement(event.target as HTMLElement);
        const memberId = this.getMemberId(target);

        if (memberId) {
          this.router.navigate([], {fragment: memberId, replaceUrl: true});
        }
      });
  }

  private scrollToCard(card: HTMLDivElement | null): void {
    if (!card) {
      return;
    }

    if (card !== <HTMLElement>document.activeElement) {
      (<HTMLElement>document.activeElement).blur();
    }

    this.window.scrollTo({
      top: card!.offsetTop - SCROLL_MARGIN_TOP,
      behavior: 'smooth',
    });
  }

  private getMemberId(lineButton: HTMLButtonElement | null): string | undefined {
    if (!lineButton) {
      return undefined;
    }
    return lineButton.attributes.getNamedItem(MEMBER_ID_ATTRIBUTE)?.value;
  }

  private findButtonElement(element: HTMLElement) {
    let parent = element.parentElement;

    while (parent) {
      if (parent instanceof HTMLButtonElement) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return null;
  }
}
