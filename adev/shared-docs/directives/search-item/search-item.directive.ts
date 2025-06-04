/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, Input, inject, input, signal} from '@angular/core';
import {Highlightable} from '@angular/cdk/a11y';
import {SearchResultItem} from '../../interfaces';

@Directive({
  selector: '[docsSearchItem]',
  host: {
    '[class.active]': 'isActive',
  },
})
export class SearchItem implements Highlightable {
  // Those inputs are required by the Highlightable interface
  // We can't migrate them to signals yet
  @Input() disabled = false;

  item = input<SearchResultItem | undefined>();

  private readonly elementRef = inject(ElementRef<HTMLLIElement>);

  private _isActive = signal(false);

  protected get isActive() {
    return this._isActive();
  }

  setActiveStyles(): void {
    this._isActive.set(true);
  }

  setInactiveStyles(): void {
    this._isActive.set(false);
  }

  scrollIntoView(): void {
    this.elementRef?.nativeElement.scrollIntoView({block: 'nearest'});
  }
}
