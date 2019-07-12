/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatChip} from './chip';
import {GridKeyManagerRow, NAVIGATION_KEYS} from './grid-key-manager';


/**
 * An extension of the MatChip component used with MatChipGrid and
 * the matChipInputFor directive.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-row, mat-basic-chip-row',
  templateUrl: 'chip-row.html',
  styleUrls: ['chips.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'role': 'row',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[tabIndex]': 'tabIndex',
    '(mousedown)': '_mousedown($event)',
    '(keydown)': '_keydown($event)',
    '(transitionend)': '_chipFoundation.handleTransitionEnd($event)',
    '(focusin)': '_focusin()',
    '(focusout)': '_focusout()'
  },
  providers: [{provide: MatChip, useExisting: MatChipRow}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipRow extends MatChip implements AfterContentInit, AfterViewInit,
  GridKeyManagerRow<HTMLElement> {
  protected basicChipAttrName = 'mat-basic-chip-row';

  /**
   * The focusable wrapper element in the first gridcell, which contains all
   * chip content other than the remove icon.
   */
  @ViewChild('chipContent', {static: false}) chipContent: ElementRef;

  /** The focusable grid cells for this row. Implemented as part of GridKeyManagerRow. */
  cells!: HTMLElement[];

  /** Key codes for which this component has a custom handler. */
  HANDLED_KEYS = NAVIGATION_KEYS.concat([BACKSPACE, DELETE]);

  ngAfterContentInit() {
    super.ngAfterContentInit();

    if (this.removeIcon) {
      // removeIcon has tabIndex 0 for regular chips, but should only be focusable by
      // the GridFocusKeyManager for row chips.
      this.removeIcon.tabIndex = -1;
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.cells = this.removeIcon ?
      [this.chipContent.nativeElement, this.removeIcon._elementRef.nativeElement] :
      [this.chipContent.nativeElement];
  }

  /**
   * Allows for programmatic focusing of the chip.
   * Sends focus to the first grid cell. The row chip element itself
   * is never focused.
   */
  focus(): void {
    if (this.disabled) {
      return;
    }

    if (!this._hasFocusInternal) {
      this._onFocus.next({chip: this});
    }

    this.chipContent.nativeElement.focus();
  }

  /**
   * Emits a blur event when one of the gridcells loses focus, unless focus moved
   * to the other gridcell.
   */
  _focusout() {
    this._hasFocusInternal = false;
    // Wait to see if focus moves to the other gridcell
    setTimeout(() => {
      if (this._hasFocus) {
        return;
      }
      this._onBlur.next({chip: this});
    });
  }

  /** Records that the chip has focus when one of the gridcells is focused. */
  _focusin() {
    this._hasFocusInternal = true;
  }

  /** Sends focus to the first gridcell when the user clicks anywhere inside the chip. */
  _mousedown(event: MouseEvent) {
    if (!this.disabled) {
      this.focus();
    }

    event.preventDefault();
  }

  /** Handles custom key presses. */
  _keydown(event: KeyboardEvent): void {
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
