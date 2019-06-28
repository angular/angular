/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SPACE} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {MatChip} from './chip';


/** Event object emitted by MatChipOption when selected or deselected. */
export class MatChipSelectionChange {
  constructor(
    /** Reference to the chip that emitted the event. */
    public source: MatChipOption,
    /** Whether the chip that emitted the event is selected. */
    public selected: boolean,
    /** Whether the selection change was a result of a user interaction. */
    public isUserInput = false) { }
}

/**
 * An extension of the MatChip component that supports chip selection.
 * Used with MatChipListbox.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-basic-chip-option, mat-chip-option',
  templateUrl: 'chip-option.html',
  styleUrls: ['chips.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'role': 'option',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
    '[class.mat-mdc-chip-selected]': 'selected',
    '[id]': 'id',
    '[tabIndex]': 'tabIndex',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-selected]': 'ariaSelected',
    '(click)': '_click($event)',
    '(keydown)': '_keydown($event)',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(transitionend)': '_chipFoundation.handleTransitionEnd($event)'
  },
  providers: [{provide: MatChip, useExisting: MatChipOption}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipOption extends MatChip {

  /** Whether the chip list is selectable. */
  chipListSelectable: boolean = true;

  /** Whether the chip list is in multi-selection mode. */
  _chipListMultiple: boolean = false;

  /**
   * Whether or not the chip is selectable.
   *
   * When a chip is not selectable, changes to its selected state are always
   * ignored. By default an option chip is selectable, and it becomes
   * non-selectable if its parent chip list is not selectable.
   */
  @Input()
  get selectable(): boolean {
    return this._selectable && this.chipListSelectable;
  }
  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }
  protected _selectable: boolean = true;

  /** Whether the chip is selected. */
  @Input()
  get selected(): boolean {
    return this._chipFoundation.isSelected();
  }
  set selected(value: boolean) {
    if (!this.selectable) {
      return;
    }
    const coercedValue = coerceBooleanProperty(value);
    if (coercedValue != this._chipFoundation.isSelected()) {
      this._chipFoundation.setSelected(coerceBooleanProperty(value));
      this._dispatchSelectionChange();
    }
  }

  /** The ARIA selected applied to the chip. */
  get ariaSelected(): string | null {
    // Remove the `aria-selected` when the chip is deselected in single-selection mode, because
    // it adds noise to NVDA users where "not selected" will be read out for each chip.
    return this.selectable && (this._chipListMultiple || this.selected) ?
        this.selected.toString() : null;
  }

  /** The unstyled chip selector for this component. */
  protected basicChipAttrName = 'mat-basic-chip-option';

  /** Emitted when the chip is selected or deselected. */
  @Output() readonly selectionChange: EventEmitter<MatChipSelectionChange> =
      new EventEmitter<MatChipSelectionChange>();

  /** Selects the chip. */
  select(): void {
    if (!this.selectable) {
      return;
    } else if (!this.selected) {
      this._chipFoundation.setSelected(true);
      this._dispatchSelectionChange();
    }
  }

  /** Deselects the chip. */
  deselect(): void {
    if (!this.selectable) {
      return;
    } else if (this.selected) {
      this._chipFoundation.setSelected(false);
      this._dispatchSelectionChange();
    }
  }

  /** Selects this chip and emits userInputSelection event */
  selectViaInteraction(): void {
    if (!this.selectable) {
      return;
    } else if (!this.selected) {
      this._chipFoundation.setSelected(true);
      this._dispatchSelectionChange(true);
    }
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(isUserInput: boolean = false): boolean {
    if (!this.selectable) {
      return this.selected;
    }

    this._chipFoundation.setSelected(!this.selected);
    this._dispatchSelectionChange(isUserInput);
    return this.selected;
  }

  /** Emits a selection change event. */
  private _dispatchSelectionChange(isUserInput = false) {
    this.selectionChange.emit({
      source: this,
      isUserInput,
      selected: this.selected
    });
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (this.disabled) {
      return;
    }

    if (!this._hasFocus) {
      this._elementRef.nativeElement.focus();
      this._onFocus.next({chip: this});
    }
    this._hasFocusInternal = true;
  }

  /** Resets the state of the chip when it loses focus. */
  _blur(): void {
    this._hasFocusInternal = false;
    this._onBlur.next({chip: this});
  }

  /** Handles click events on the chip. */
  _click(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
    } else {
      this._handleInteraction(event);
      event.stopPropagation();
    }
  }

  /** Handles custom key presses. */
  _keydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    switch (event.keyCode) {
      case SPACE:
        this.toggleSelected(true);

        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
      default:
        this._handleInteraction(event);
    }
  }
}
