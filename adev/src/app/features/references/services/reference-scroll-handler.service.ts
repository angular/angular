/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';
import {auditTime} from 'rxjs/operators';
import {
  API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME,
  API_REFERENCE_MEMBER_CARD_CLASS_NAME,
  API_TAB_ACTIVE_CODE_LINE,
  MEMBER_ID_ATTRIBUTE,
} from '../constants/api-reference-prerender.constants';
import {WINDOW} from '@angular/docs';
import {Router, Scroll} from '@angular/router';
import {AppScroller} from '../../../app-scroller';

export const SCROLL_EVENT_DELAY = 20;
export const SCROLL_THRESHOLD = 20;

interface ReferenceScrollHandlerInterface {
  setupListeners(tocSelector: string): void;
  updateMembersMarginTop(selectorOfTheElementToAlign: string): void;
}

@Injectable()
export class ReferenceScrollHandler implements OnDestroy, ReferenceScrollHandlerInterface {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(EnvironmentInjector);
  private readonly window = inject(WINDOW);
  private readonly router = inject(Router);
  private readonly appScroller = inject(AppScroller);

  private readonly cardOffsetTop = new Map<string, number>();
  private resizeObserver: ResizeObserver | null = null;

  membersMarginTopInPx = signal<number>(0);

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  setupListeners(tocSelector: string): void {
    this.setupCodeToCListeners(tocSelector);
    this.setupMemberCardListeners();
    this.setScrollEventHandlers();
    this.listenToResizeCardContainer();
    this.setupFragmentChangeListener();
  }

  private setupFragmentChangeListener() {
    this.router.routerState.root.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fragment) => {
        // If there is no fragment or the scroll event has a position (traversing through history),
        // allow the scroller to handler scrolling instead of going to the fragment
        if (!fragment || this.appScroller.lastScrollEvent?.position) {
          this.appScroller.scroll();
          return;
        }

        const card = this.document.getElementById(fragment) as HTMLDivElement | null;
        this.scrollToCard(card);
      });
  }

  updateMembersMarginTop(selectorOfTheElementToAlign: string): void {
    const elementToAlign = this.document.querySelector<HTMLElement>(selectorOfTheElementToAlign);

    if (elementToAlign) {
      this.updateMarginTopWhenTabBodyIsResized(elementToAlign);
    }
  }

  private setupCodeToCListeners(tocSelector: string): void {
    const tocContainer = this.document.querySelector<HTMLDivElement>(tocSelector);

    if (!tocContainer) {
      return;
    }

    fromEvent(tocContainer, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
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

  private setupMemberCardListeners(): void {
    this.getAllMemberCards().forEach((card) => {
      this.cardOffsetTop.set(card.id, card.offsetTop);
      fromEvent(card, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate([], {fragment: card.id, replaceUrl: true});
        });
    });
  }

  private setScrollEventHandlers(): void {
    const scroll$ = fromEvent(this.document, 'scroll').pipe(
      auditTime(SCROLL_EVENT_DELAY),
      takeUntilDestroyed(this.destroyRef),
    );

    scroll$.subscribe(() => this.setActiveCodeLine());
  }

  private listenToResizeCardContainer(): void {
    const membersCardContainer = this.document.querySelector(
      API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME,
    );
    if (membersCardContainer) {
      afterNextRender(
        () => {
          const resizeObserver = new ResizeObserver(() => {
            this.updateCardsOffsetTop();
            this.setActiveCodeLine();
          });
          resizeObserver.observe(membersCardContainer);
          this.destroyRef.onDestroy(() => resizeObserver.disconnect());
        },
        {injector: this.injector},
      );
    }
  }

  private setActiveCodeLine(): void {
    const activeCard = Array.from(this.cardOffsetTop)
      .filter(([_, offsetTop]) => {
        return offsetTop < this.window.scrollY + this.membersMarginTopInPx() + SCROLL_THRESHOLD;
      })
      .pop();

    if (!activeCard) {
      return;
    }

    const activeLines = this.document.querySelectorAll<HTMLButtonElement>(
      `button.${API_TAB_ACTIVE_CODE_LINE}`,
    );

    const activeLine = activeLines.length > 0 ? activeLines.item(0) : null;
    const previousActiveMemberId = this.getMemberId(activeLine);
    const currentActiveMemberId = activeCard[0];

    if (previousActiveMemberId && previousActiveMemberId !== currentActiveMemberId) {
      for (const line of Array.from(activeLines)) {
        line.classList.remove(API_TAB_ACTIVE_CODE_LINE);
      }
    } else {
      const lines = this.document.querySelectorAll<HTMLButtonElement>(
        `button[${MEMBER_ID_ATTRIBUTE}="${currentActiveMemberId}"]`,
      );
      for (const line of Array.from(lines)) {
        line.classList.add(API_TAB_ACTIVE_CODE_LINE);
      }
      this.document.getElementById(`${currentActiveMemberId}`)?.focus({preventScroll: true});
    }
  }

  private scrollToCard(card: HTMLDivElement | null): void {
    if (!card) {
      return;
    }

    if (card !== <HTMLElement>document.activeElement) {
      (<HTMLElement>document.activeElement).blur();
    }

    this.window.scrollTo({
      top: card!.offsetTop - this.membersMarginTopInPx(),
      behavior: 'smooth',
    });
  }

  private updateCardsOffsetTop(): void {
    this.getAllMemberCards().forEach((card) => {
      this.cardOffsetTop.set(card.id, card.offsetTop);
    });
  }

  private getAllMemberCards(): NodeListOf<HTMLDivElement> {
    return this.document.querySelectorAll<HTMLDivElement>(
      `${API_REFERENCE_MEMBER_CARD_CLASS_NAME}`,
    );
  }

  private getMemberId(lineButton: HTMLButtonElement | null): string | undefined {
    if (!lineButton) {
      return undefined;
    }
    return lineButton.attributes.getNamedItem(MEMBER_ID_ATTRIBUTE)?.value;
  }

  private updateMarginTopWhenTabBodyIsResized(tabBody: HTMLElement): void {
    this.resizeObserver?.disconnect();

    this.resizeObserver = new ResizeObserver((_) => {
      const offsetTop = tabBody.getBoundingClientRect().top;
      if (offsetTop) {
        this.membersMarginTopInPx.set(offsetTop);
      }
    });

    this.resizeObserver.observe(tabBody);
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

export class ReferenceScrollHandlerNoop implements ReferenceScrollHandlerInterface {
  membersMarginTopInPx = signal<number>(0);
  setupListeners(_tocSelector: string): void {}
  updateMembersMarginTop(_selectorOfTheElementToAlign: string): void {}
}
