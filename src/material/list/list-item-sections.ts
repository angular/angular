/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Optional} from '@angular/core';
import {LIST_OPTION, ListOption} from './list-option-types';

/**
 * Directive capturing the title of a list item. A list item usually consists of a
 * title and optional secondary or tertiary lines.
 *
 * Text content for the title never wraps. There can only be a single title per list item.
 */
@Directive({
  selector: '[matListItemTitle]',
  host: {'class': 'mat-mdc-list-item-title mdc-list-item__primary-text'},
})
export class MatListItemTitle {
  constructor(public _elementRef: ElementRef<HTMLElement>) {}
}

/**
 * Directive capturing a line in a list item. A list item usually consists of a
 * title and optional secondary or tertiary lines.
 *
 * Text content inside a line never wraps. There can be at maximum two lines per list item.
 */
@Directive({
  selector: '[matListItemLine]',
  host: {'class': 'mat-mdc-list-item-line mdc-list-item__secondary-text'},
})
export class MatListItemLine {
  constructor(public _elementRef: ElementRef<HTMLElement>) {}
}

/**
 * Directive matching an optional meta section for list items.
 *
 * List items can reserve space at the end of an item to display a control,
 * button or additional text content.
 */
@Directive({
  selector: '[matListItemMeta]',
  host: {'class': 'mat-mdc-list-item-meta mdc-list-item__end'},
})
export class MatListItemMeta {}

/**
 * @docs-private
 *
 * MDC uses the very intuitively named classes `.mdc-list-item__start` and `.mat-list-item__end`
 * to position content such as icons or checkboxes that comes either before or after the text
 * content respectively. This directive detects the placement of the checkbox and applies the
 * correct MDC class to position the icon/avatar on the opposite side.
 */
@Directive({
  host: {
    // MDC uses intuitively named classes `.mdc-list-item__start` and `.mat-list-item__end`
    // to position content such as icons or checkboxes that comes either before or after the text
    // content respectively. This directive detects the placement of the checkbox and applies the
    // correct MDC class to position the icon/avatar on the opposite side.
    '[class.mdc-list-item__start]': '_isAlignedAtStart()',
    '[class.mdc-list-item__end]': '!_isAlignedAtStart()',
  },
})
export class _MatListItemGraphicBase {
  constructor(@Optional() @Inject(LIST_OPTION) public _listOption: ListOption) {}

  _isAlignedAtStart() {
    // By default, in all list items the graphic is aligned at start. In list options,
    // the graphic is only aligned at start if the checkbox is at the end.
    return !this._listOption || this._listOption?._getCheckboxPosition() === 'after';
  }
}

/**
 * Directive matching an optional avatar within a list item.
 *
 * List items can reserve space at the beginning of an item to display an avatar.
 */
@Directive({
  selector: '[matListItemAvatar]',
  host: {'class': 'mat-mdc-list-item-avatar'},
})
export class MatListItemAvatar extends _MatListItemGraphicBase {}

/**
 * Directive matching an optional icon within a list item.
 *
 * List items can reserve space at the beginning of an item to display an icon.
 */
@Directive({
  selector: '[matListItemIcon]',
  host: {'class': 'mat-mdc-list-item-icon'},
})
export class MatListItemIcon extends _MatListItemGraphicBase {}
