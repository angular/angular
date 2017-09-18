/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';
import {
  BACKSPACE,
  CanColor,
  CanDisable,
  DELETE,
  mixinColor,
  mixinDisabled,
  SPACE,
} from '@angular/material/core';
import {Subject} from 'rxjs/Subject';

export interface MdChipEvent {
  chip: MdChip;
}

/** Event object emitted by MdChip when selected or deselected. */
export class MdChipSelectionChange {
  constructor(public source: MdChip, public isUserInput = false) { }
}


// Boilerplate for applying mixins to MdChip.
/** @docs-private */
export class MdChipBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdChipMixinBase = mixinColor(mixinDisabled(MdChipBase), 'primary');


/**
 * Dummy directive to add CSS class to basic chips.
 * @docs-private
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], mat-basic-chip, [mat-basic-chip]`,
  host: {'class': 'mat-basic-chip'}
})
export class MdBasicChip { }

/**
 * Material design styled Chip component. Used inside the MdChipList component.
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], md-chip, [md-chip],
             mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  inputs: ['color', 'disabled'],
  exportAs: 'mdChip, matChip',
  host: {
    'class': 'mat-chip',
    'tabindex': '-1',
    'role': 'option',
    '[class.mat-chip-selected]': 'selected',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-selected]': 'ariaSelected',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_hasFocus = true',
    '(blur)': '_blur()',
  },

})
export class MdChip extends _MdChipMixinBase implements FocusableOption, OnDestroy, CanColor,
  CanDisable {

  protected _value: any;

  protected _selected: boolean = false;

  protected _selectable: boolean = true;

  protected _removable: boolean = true;

  /** Whether the chip has focus. */
  _hasFocus: boolean = false;

  /** Whether the chip is selected. */
  @Input()
  get selected(): boolean { return this._selected; }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
    this.onSelectionChange.emit({source: this, isUserInput: false});
  }

  /** The value of the chip. Defaults to the content inside <md-chip> tags. */
  @Input()
  get value(): any {
    return this._value != undefined
      ? this._value
      : this._elementRef.nativeElement.textContent;
  }
  set value(newValue: any) { this._value = newValue; }

  /**
   * Whether or not the chips are selectable. When a chip is not selectable,
   * changes to it's selected state are always ignored.
   */
  @Input()
  get selectable(): boolean { return this._selectable; }
  set selectable(value: boolean) { this._selectable = coerceBooleanProperty(value); }

  /**
   * Determines whether or not the chip displays the remove styling and emits (remove) events.
   */
  @Input()
  get removable(): boolean { return this._removable; }
  set removable(value: boolean) { this._removable = coerceBooleanProperty(value); }

  /** Emits when the chip is focused. */
  _onFocus = new Subject<MdChipEvent>();

  /** Emits when the chip is blured. */
  _onBlur = new Subject<MdChipEvent>();

  /** Emitted when the chip is selected or deselected. */
  @Output() onSelectionChange = new EventEmitter<MdChipSelectionChange>();

  /** Emitted when the chip is destroyed. */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  /** Emitted when a chip is to be removed. */
  @Output('remove') onRemove = new EventEmitter<MdChipEvent>();

  get ariaSelected(): string | null {
    return this.selectable ? this.selected.toString() : null;
  }

  constructor(renderer: Renderer2, public _elementRef: ElementRef) {
    super(renderer, _elementRef);
  }

  ngOnDestroy(): void {
    this.destroy.emit({chip: this});
  }

  /** Selects the chip. */
  select(): void {
    this._selected = true;
    this.onSelectionChange.emit({source: this, isUserInput: false});
  }

  /** Deselects the chip. */
  deselect(): void {
    this._selected = false;
    this.onSelectionChange.emit({source: this, isUserInput: false});
  }

  /** Select this chip and emit selected event */
  selectViaInteraction() {
    this._selected = true;
    // Emit select event when selected changes.
    this.onSelectionChange.emit({source: this, isUserInput: true});
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(isUserInput: boolean = false): boolean {
    this._selected = !this.selected;
    this.onSelectionChange.emit({source: this, isUserInput});
    return this.selected;
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._elementRef.nativeElement.focus();
    this._onFocus.next({chip: this});
  }

  /**
   * Allows for programmatic removal of the chip. Called by the MdChipList when the DELETE or
   * BACKSPACE keys are pressed.
   *
   * Informs any listeners of the removal request. Does not remove the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.onRemove.emit({chip: this});
    }
  }

  /** Ensures events fire properly upon click. */
  _handleClick(event: Event) {
    // Check disabled
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.focus();
  }

  /** Handle custom key presses. */
  _handleKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        // If we are removable, remove the focused chip
        this.remove();
        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      case SPACE:
        // If we are selectable, toggle the focused chip
        if (this.selectable) {
          this.toggleSelected(true);
        }

        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
    }
  }

  _blur() {
    this._hasFocus = false;
    this._onBlur.next({chip: this});
  }
}


/**
 * Applies proper (click) support and adds styling for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 *     <md-chip>
 *       <md-icon mdChipRemove>cancel</md-icon>
 *     </md-chip>
 *
 * You *may* use a custom icon, but you may need to override the `md-chip-remove` positioning styles
 * to properly center the icon within the chip.
 */
@Directive({
  selector: '[mdChipRemove], [matChipRemove]',
  host: {
    'class': 'mat-chip-remove',
    '(click)': '_handleClick($event)'
  }
})
export class MdChipRemove {
  constructor(protected _parentChip: MdChip) {}

  /** Calls the parent chip's public `remove()` method if applicable. */
  _handleClick() {
    if (this._parentChip.removable) {
      this._parentChip.remove();
    }
  }
}
