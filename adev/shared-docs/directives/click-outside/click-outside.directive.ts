/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, Input, inject, output} from '@angular/core';

@Directive({
  selector: '[docsClickOutside]',
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class ClickOutside {
  // TODO: Understand why replacing this @Input with a signal input breaks the tests
  @Input('docsClickOutsideIgnore') public ignoredElementsIds: string[] = [];
  public readonly clickOutside = output<void>({alias: 'docsClickOutside'});

  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  onClick(event: MouseEvent): void {
    if (
      !this.elementRef.nativeElement.contains(event.target) &&
      !this.wasClickedOnIgnoredElement(event)
    ) {
      this.clickOutside.emit();
    }
  }

  private wasClickedOnIgnoredElement(event: MouseEvent): boolean {
    if (this.ignoredElementsIds.length === 0) {
      return false;
    }

    return this.ignoredElementsIds.some((elementId) => {
      const element = this.document.getElementById(elementId);
      const target = event.target as Node;
      const contains = element?.contains(target);
      return contains;
    });
  }
}
