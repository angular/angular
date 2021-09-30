/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput} from '@angular/cdk/coercion';
import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  AfterContentInit,
  AfterViewInit,
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
  ViewEncapsulation
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {MatChip, MatChipEvent} from './chip';
import {MatChipEditInput} from './chip-edit-input';
import {GridKeyManagerRow} from './grid-key-manager';


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
  styleUrls: ['chips.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'role': 'row',
    'class': 'mat-mdc-chip-row',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
    '[class.mdc-chip--editable]': 'editable',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[tabIndex]': 'tabIndex',
    '(mousedown)': '_mousedown($event)',
    '(dblclick)': '_dblclick($event)',
    '(keydown)': '_keydown($event)',
    '(focusin)': '_focusin($event)',
    '(focusout)': '_focusout($event)'
  },
  providers: [{provide: MatChip, useExisting: MatChipRow}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipRow extends MatChip implements AfterContentInit, AfterViewInit,
  GridKeyManagerRow<HTMLElement> {
  protected override basicChipAttrName = 'mat-basic-chip-row';

  @Input() editable: boolean = false;

  /** Emitted when the chip is edited. */
  @Output() readonly edited: EventEmitter<MatChipEditedEvent> =
      new EventEmitter<MatChipEditedEvent>();

  /**
   * The focusable wrapper element in the first gridcell, which contains all
   * chip content other than the remove icon.
   */
  @ViewChild('chipContent') chipContent: ElementRef;

  /** The default chip edit input that is used if none is projected into this chip row. */
  @ViewChild(MatChipEditInput) defaultEditInput?: MatChipEditInput;

  /** The projected chip edit input. */
  @ContentChild(MatChipEditInput) contentEditInput?: MatChipEditInput;

  /** The focusable grid cells for this row. Implemented as part of GridKeyManagerRow. */
  cells!: HTMLElement[];

  /**
   * Timeout used to give some time between `focusin` and `focusout`
   * in order to determine whether focus has left the chip.
   */
  private _focusoutTimeout: any;

  constructor(
    @Inject(DOCUMENT) private readonly _document: any,
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef, ngZone: NgZone,
    @Optional() dir: Directionality,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
        globalRippleOptions?: RippleGlobalOptions) {
    super(changeDetectorRef, elementRef, ngZone, dir, animationMode, globalRippleOptions);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();

    if (this.removeIcon) {
      // Defer setting the value in order to avoid the "Expression
      // has changed after it was checked" errors from Angular.
      setTimeout(() => {
        // removeIcon has tabIndex 0 for regular chips, but should only be focusable by
        // the GridFocusKeyManager for row chips.
        this.removeIcon.tabIndex = -1;
      });
    }
  }

  override ngAfterViewInit() {
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
  _focusout(event: FocusEvent) {
    if (this._focusoutTimeout) {
      clearTimeout(this._focusoutTimeout);
    }

    // Wait to see if focus moves to the other gridcell
    this._focusoutTimeout = setTimeout(() => {
      this._hasFocusInternal = false;
      this._onBlur.next({chip: this});
      this._handleInteraction(event);
    });
  }

  /** Records that the chip has focus when one of the gridcells is focused. */
  _focusin(event: FocusEvent) {
    if (this._focusoutTimeout) {
      clearTimeout(this._focusoutTimeout);
      this._focusoutTimeout = null;
    }

    this._hasFocusInternal = true;
    this._handleInteraction(event);
  }

  /** Sends focus to the first gridcell when the user clicks anywhere inside the chip. */
  _mousedown(event: MouseEvent) {
    if (this._isEditing()) {
      return;
    }

    if (!this.disabled) {
      this.focus();
    }

    event.preventDefault();
  }

  _dblclick(event: MouseEvent) {
    this._handleInteraction(event);
  }

  /** Handles custom key presses. */
  _keydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    if (this._isEditing()) {
      this._handleInteraction(event);
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

  _isEditing() {
    return this._chipFoundation.isEditing();
  }

  protected override _onEditStart() {
    // Defer initializing the input so it has time to be added to the DOM.
    setTimeout(() => {
      this._getEditInput().initialize(this.value);
    });
  }

  protected override _onEditFinish() {
    // If the edit input is still focused or focus was returned to the body after it was destroyed,
    // return focus to the chip contents.
    if (this._document.activeElement === this._getEditInput().getNativeElement() ||
        this._document.activeElement === this._document.body) {
      this.chipContent.nativeElement.focus();
    }
    this.edited.emit({chip: this, value: this._getEditInput().getValue()});
  }

  /**
   * Gets the projected chip edit input, or the default input if none is projected in. One of these
   * two values is guaranteed to be defined.
   */
  private _getEditInput(): MatChipEditInput {
    return this.contentEditInput || this.defaultEditInput!;
  }

  static ngAcceptInputType_editable: BooleanInput;
}
