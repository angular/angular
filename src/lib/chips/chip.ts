/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {BACKSPACE, DELETE, SPACE} from '@angular/cdk/keycodes';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {CanColor, CanDisable, mixinColor, mixinDisabled} from '@angular/material/core';
import {Subject} from 'rxjs/Subject';


/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

/** Event object emitted by MatChip when selected or deselected. */
export class MatChipSelectionChange {
  constructor(
    /** Reference to the chip that emitted the event. */
    public source: MatChip,
    /** Whether the chip that emitted the event is selected. */
    public selected: boolean,
    /** Whether the selection change was a result of a user interaction. */
    public isUserInput = false) { }
}


// Boilerplate for applying mixins to MatChip.
/** @docs-private */
export class MatChipBase {
  constructor(public _elementRef: ElementRef) {}
}

export const _MatChipMixinBase = mixinColor(mixinDisabled(MatChipBase), 'primary');


/**
 * Dummy directive to add CSS class to basic chips.
 * @docs-private
 */
@Directive({
  selector: `mat-basic-chip, [mat-basic-chip]`,
  host: {'class': 'mat-basic-chip'},
})
export class MatBasicChip {
}

/**
 * Material design styled Chip component. Used inside the MatChipList component.
 */
@Directive({
  selector: `mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  inputs: ['color', 'disabled'],
  exportAs: 'matChip',
  host: {
    'class': 'mat-chip',
    '[attr.tabindex]': 'disabled ? null : -1',
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
export class MatChip extends _MatChipMixinBase implements FocusableOption, OnDestroy, CanColor,
    CanDisable {

  protected _value: any;

  protected _selected: boolean = false;

  protected _selectable: boolean = true;

  protected _removable: boolean = true;

  /** Whether the chip has focus. */
  _hasFocus: boolean = false;

  /** Whether the chip is selected. */
  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
    this.selectionChange.emit({
      source: this,
      isUserInput: false,
      selected: value
    });
  }
  /** The value of the chip. Defaults to the content inside <mat-chip> tags. */
  @Input()
  get value(): any {
    return this._value != undefined
      ? this._value
      : this._elementRef.nativeElement.textContent;
  }
  set value(newValue: any) {
    this._value = newValue;
  }

  /**
   * Whether or not the chips are selectable. When a chip is not selectable,
   * changes to it's selected state are always ignored.
   */
  @Input() get selectable(): boolean {
    return this._selectable;
  }


  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  /**
   * Determines whether or not the chip displays the remove styling and emits (remove) events.
   */
  @Input() get removable(): boolean {
    return this._removable;
  }


  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
  }

  /** Emits when the chip is focused. */
  _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blured. */
  _onBlur = new Subject<MatChipEvent>();

  /** Emitted when the chip is selected or deselected. */
  @Output() selectionChange = new EventEmitter<MatChipSelectionChange>();

  /** Emitted when the chip is destroyed. */
  @Output() destroyed = new EventEmitter<MatChipEvent>();

  /**
   * Emitted when the chip is destroyed.
   * @deprecated Use 'destroyed' instead.
   */
  @Output() destroy = this.destroyed;

  /** Emitted when a chip is to be removed. */
  @Output() removed = new EventEmitter<MatChipEvent>();

  /**
   * Emitted when a chip is to be removed.
   * @deprecated Use `removed` instead.
   */
  @Output('remove') onRemove = this.removed;

  get ariaSelected(): string | null {
    return this.selectable ? this.selected.toString() : null;
  }

  constructor(public _elementRef: ElementRef) {
    super(_elementRef);
  }

  ngOnDestroy(): void {
    this.destroyed.emit({chip: this});
  }

  /** Selects the chip. */
  select(): void {
    this._selected = true;
    this.selectionChange.emit({
      source: this,
      isUserInput: false,
      selected: true
    });
  }

  /** Deselects the chip. */
  deselect(): void {
    this._selected = false;
    this.selectionChange.emit({
      source: this,
      isUserInput: false,
      selected: false
    });
  }

  /** Select this chip and emit selected event */
  selectViaInteraction(): void {
    this._selected = true;
    // Emit select event when selected changes.
    this.selectionChange.emit({
      source: this,
      isUserInput: true,
      selected: true
    });
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(isUserInput: boolean = false): boolean {
    this._selected = !this.selected;

    this.selectionChange.emit({
      source: this,
      isUserInput,
      selected: this._selected
    });

    return this.selected;
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._elementRef.nativeElement.focus();
    this._onFocus.next({chip: this});
  }

  /**
   * Allows for programmatic removal of the chip. Called by the MatChipList when the DELETE or
   * BACKSPACE keys are pressed.
   *
   * Informs any listeners of the removal request. Does not remove the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.removed.emit({chip: this});
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
  _handleKeydown(event: KeyboardEvent): void {
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

  _blur(): void {
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
 *     <mat-chip>
 *       <mat-icon matChipRemove>cancel</mat-icon>
 *     </mat-chip>
 *
 * You *may* use a custom icon, but you may need to override the `mat-chip-remove` positioning
 * styles to properly center the icon within the chip.
 */
@Directive({
  selector: '[matChipRemove]',
  host: {
    'class': 'mat-chip-remove',
    '(click)': '_handleClick()',
  }
})
export class MatChipRemove {
  constructor(protected _parentChip: MatChip) {
  }

  /** Calls the parent chip's public `remove()` method if applicable. */
  _handleClick(): void {
    if (this._parentChip.removable) {
      this._parentChip.remove();
    }
  }
}
