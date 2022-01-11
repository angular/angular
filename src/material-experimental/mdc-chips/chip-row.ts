/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, ENTER} from '@angular/cdk/keycodes';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MatChip, MatChipEvent} from './chip';
import {MatChipEditInput} from './chip-edit-input';

/** Represents an event fired on an individual `mat-chip` when it is edited. */
export interface MatChipEditedEvent extends MatChipEvent {
  /** The final edit value. */
  value: string;
}

/**
 * An extension of the MatChip component used with MatChipGrid and
 * the matChipInputFor directive.
 */
@Component({
  selector: 'mat-chip-row, mat-basic-chip-row',
  templateUrl: 'chip-row.html',
  styleUrls: ['chip.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'class': 'mat-mdc-chip mat-mdc-chip-row mdc-evolution-chip',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-editing]': '_isEditing',
    '[class.mat-mdc-chip-editable]': 'editable',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-graphic]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[id]': 'id',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.role]': 'role',
    '(mousedown)': '_mousedown($event)',
    '(keydown)': '_keydown($event)',
    '(dblclick)': '_doubleclick()',
    '(focusin)': '_focusin($event)',
    '(focusout)': '_focusout($event)',
  },
  providers: [{provide: MatChip, useExisting: MatChipRow}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipRow extends MatChip implements AfterViewInit {
  protected override basicChipAttrName = 'mat-basic-chip-row';

  @Input() editable: boolean = false;

  /** Emitted when the chip is edited. */
  @Output() readonly edited: EventEmitter<MatChipEditedEvent> =
    new EventEmitter<MatChipEditedEvent>();

  /** The default chip edit input that is used if none is projected into this chip row. */
  @ViewChild(MatChipEditInput) defaultEditInput?: MatChipEditInput;

  /** The projected chip edit input. */
  @ContentChild(MatChipEditInput) contentEditInput?: MatChipEditInput;

  _isEditing = false;

  /**
   * Timeout used to give some time between `focusin` and `focusout`
   * in order to determine whether focus has left the chip.
   */
  private _focusoutTimeout: number | null;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    ngZone: NgZone,
    focusMonitor: FocusMonitor,
    @Inject(DOCUMENT) _document: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    globalRippleOptions?: RippleGlobalOptions,
    @Attribute('tabindex') tabIndex?: string,
  ) {
    super(
      changeDetectorRef,
      elementRef,
      ngZone,
      focusMonitor,
      _document,
      dir,
      animationMode,
      globalRippleOptions,
      tabIndex,
    );

    this.role = 'row';
  }

  override _hasTrailingIcon() {
    // The trailing icon is hidden while editing.
    return !this._isEditing && super._hasTrailingIcon();
  }

  /**
   * Emits a blur event when one of the gridcells loses focus, unless focus moved
   * to the other gridcell.
   */
  _focusout() {
    if (this._focusoutTimeout) {
      clearTimeout(this._focusoutTimeout);
    }

    // Wait to see if focus moves to the other gridcell
    this._focusoutTimeout = window.setTimeout(() => {
      if (this._isEditing) {
        this._onEditFinish();
      }

      this._hasFocusInternal = false;
      this._onBlur.next({chip: this});
    });
  }

  /** Records that the chip has focus when one of the gridcells is focused. */
  _focusin() {
    if (this._focusoutTimeout) {
      clearTimeout(this._focusoutTimeout);
      this._focusoutTimeout = null;
    }

    this._hasFocusInternal = true;
  }

  /** Sends focus to the first gridcell when the user clicks anywhere inside the chip. */
  _mousedown(event: MouseEvent) {
    if (!this._isEditing) {
      if (!this.disabled) {
        this.focus();
      }

      event.preventDefault();
    }
  }

  /** Handles custom key presses. */
  _keydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    switch (event.keyCode) {
      case ENTER:
        if (this._isEditing) {
          event.preventDefault();
          // Wrap in a timeout so the timing is consistent as when it is emitted in `focusout`.
          setTimeout(() => this._onEditFinish());
        } else if (this.editable) {
          this._startEditing();
        }
        break;
      case DELETE:
      case BACKSPACE:
        if (!this._isEditing) {
          // Remove the focused chip
          this.remove();
          // Always prevent so page navigation does not occur
          event.preventDefault();
        }
        break;
    }
  }

  _doubleclick() {
    if (!this.disabled && this.editable) {
      this._startEditing();
    }
  }

  private _startEditing() {
    // The value depends on the DOM so we need to extract it before we flip the flag.
    const value = this.value;

    // Make the primary action non-interactive so that it doesn't
    // navigate when the user presses the arrow keys while editing.
    this.primaryAction.isInteractive = false;
    this._isEditing = true;

    // Defer initializing the input so it has time to be added to the DOM.
    setTimeout(() => this._getEditInput().initialize(value));
  }

  private _onEditFinish() {
    // If the edit input is still focused or focus was returned to the body after it was destroyed,
    // return focus to the chip contents.
    if (
      this._document.activeElement === this._getEditInput().getNativeElement() ||
      this._document.activeElement === this._document.body
    ) {
      this.primaryAction.focus();
    }
    this.edited.emit({chip: this, value: this._getEditInput().getValue()});
    this.primaryAction.isInteractive = true;
    this._isEditing = false;
  }

  /**
   * Gets the projected chip edit input, or the default input if none is projected in. One of these
   * two values is guaranteed to be defined.
   */
  private _getEditInput(): MatChipEditInput {
    return this.contentEditInput || this.defaultEditInput!;
  }
}
