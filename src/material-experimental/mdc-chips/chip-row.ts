/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {MatChip} from './chip';

/**
 * An extension of the MatChip component used with MatChipGrid and
 * the matChipInputFor directive.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-row, mat-basic-chip-row',
  templateUrl: 'chip-row.html',
  styleUrls: ['chips.css'],
  inputs: ['color', 'disabled', 'disableRipple'],
  host: {
    'role': 'row',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon',
    '[id]': 'id',
    '[tabIndex]': 'disabled ? null : -1',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(transitionend)': '_chipFoundation.handleTransitionEnd($event)'
  },
  providers: [{provide: MatChip, useExisting: MatChipRow}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipRow extends MatChip {
  protected basicChipAttrName = 'mat-basic-chip-row';

  /** Handle custom key presses. */
  _handleKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        // Remove the focused chip
        this.remove();
        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      default:
        this._handleInteraction(event);
    }
  }
}
