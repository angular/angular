/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, signal, input} from '@angular/core';
import {Highlightable} from '@angular/cdk/a11y';
import {SearchResult} from '../../interfaces/search-results';

@Directive({
  selector: '[docsSearchItem]',
  standalone: true,
  host: {
    '[class.active]': 'isActive',
  },
})
export class SearchItem implements Highlightable {
  readonly item = input<SearchResult>();
  readonly disabled = input(false);

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

  getLabel(): string {
    const item = this.item();
    if (!item?.hierarchy) {
      return '';
    }
    const {hierarchy} = item;
    return `${hierarchy.lvl0}${hierarchy.lvl1}${hierarchy.lvl2}`;
  }

  scrollIntoView(): void {
    this.elementRef?.nativeElement.scrollIntoView({block: 'nearest'});
  }
}
