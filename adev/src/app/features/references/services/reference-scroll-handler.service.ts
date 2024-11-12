/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {DestroyRef, Injectable, PLATFORM_ID, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';
import {MEMBER_ID_ATTRIBUTE} from '../constants/api-reference-prerender.constants';
import {Router} from '@angular/router';

@Injectable()
export class ReferenceScrollHandler {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  setupListeners(tocClass: string): void {
    if (!this.isBrowser) {
      return;
    }

    this.setupCodeToCListeners(tocClass);
  }

  private setupCodeToCListeners(tocClass: string): void {
    const tocContainer = this.document.querySelector<HTMLDivElement>(`.${tocClass}`);

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
