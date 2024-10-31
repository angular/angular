/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, EventEmitter, Output, inject, input} from '@angular/core';

@Directive({
  selector: '[docsClickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class ClickOutside {
  public readonly ignoredElementsIds = input<string[]>([], {alias: 'docsClickOutsideIgnore'});
  @Output('docsClickOutside') public clickOutside = new EventEmitter<void>();

  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  onClick($event: PointerEvent): void {
    if (
      !this.elementRef.nativeElement.contains($event.target) &&
      !this.wasClickedOnIgnoredElement($event)
    ) {
      this.clickOutside.emit();
    }
  }

  private wasClickedOnIgnoredElement($event: PointerEvent): boolean {
    const ignoredElementsIds = this.ignoredElementsIds();
    if (ignoredElementsIds.length === 0) {
      return false;
    }

    return ignoredElementsIds.some((elementId) => {
      const element = this.document.getElementById(elementId);
      const target = $event.target as Node;
      const contains = element?.contains(target);
      return contains;
    });
  }
}
