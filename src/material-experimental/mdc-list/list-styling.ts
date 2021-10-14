/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Optional} from '@angular/core';
import {LIST_OPTION, ListOption} from './list-option-types';

/**
 * MDC uses the very intuitively named classes `.mdc-list-item__start` and `.mat-list-item__end`
 * to position content such as icons or checkboxes that comes either before or after the text
 * content respectively. This directive detects the placement of the checkbox and applies the
 * correct MDC class to position the icon/avatar on the opposite side.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar], [mat-list-icon], [matListIcon]',
  host: {
    '[class.mdc-list-item__start]': '_isAlignedAtStart()',
    '[class.mdc-list-item__end]': '!_isAlignedAtStart()',
  },
})
export class MatListGraphicAlignmentStyler {
  constructor(@Optional() @Inject(LIST_OPTION) public _listOption: ListOption) {}

  _isAlignedAtStart() {
    // By default, in all list items the graphic is aligned at start. In list options,
    // the graphic is only aligned at start if the checkbox is at the end.
    return !this._listOption || this._listOption?._getCheckboxPosition() === 'after';
  }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-mdc-list-avatar'},
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-mdc-list-icon'},
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  // TODO(mmalerba): MDC's subheader font looks identical to the list item font, figure out why and
  //  make a change in one of the repos to visually distinguish.
  host: {'class': 'mat-mdc-subheader mdc-list-group__subheader'},
})
export class MatListSubheaderCssMatStyler {}
