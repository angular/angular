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
  NgZone,
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
  private readonly ngZone = inject(NgZone);
  private readonly window = inject(WINDOW);

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

    this.ngZone.runOutsideAngular(() => {
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
            const card = this.document.querySelector<HTMLDivElement>(`#${memberId}`);
            this.scrollToCard(card);
          }
        });
    });
  }

  private setupMemberCardListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      this.getAllMemberCards().forEach((card) => {
        this.cardOffsetTop.set(card.id, card.offsetTop);
        fromEvent(card, 'click')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.scrollToCard(card);
          });
      });
    });
  }

  private setScrollEventHandlers(): void {
    const scroll$ = fromEvent(this.document, 'scroll').pipe(
      auditTime(SCROLL_EVENT_DELAY),
      takeUntilDestroyed(this.destroyRef),
    );

    this.ngZone.runOutsideAngular(() => {
      scroll$.subscribe(() => this.setActiveCodeLine());
    });
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
      this.getAllMemberCards().forEach((card) => {
        card.blur();
      });
    } else {
      const lines = this.document.querySelectorAll<HTMLButtonElement>(
        `button[${MEMBER_ID_ATTRIBUTE}="${currentActiveMemberId}"]`,
      );
      for (const line of Array.from(lines)) {
        line.classList.add(API_TAB_ACTIVE_CODE_LINE);
      }
      this.document.getElementById(`${currentActiveMemberId}`)?.focus();
    }
  }

  private scrollToCard(card: HTMLDivElement | null): void {
    if (!card) {
      return;
    }

    card.focus();

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
      this.ngZone.run(() => {
        if (tabBody.offsetTop) {
          this.membersMarginTopInPx.set(tabBody.offsetTop);
        }
      });
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
