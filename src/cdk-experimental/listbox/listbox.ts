/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  Directive,
  EventEmitter, forwardRef, Inject,
  Input, Output,
  QueryList
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

let nextId = 0;

/**
 * Directive that applies interaction patterns to an element following the aria role of option.
 * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
 * value is built in.
 */
@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '(click)': 'toggle()',
    '[attr.aria-selected]': 'selected || null',
    '[id]': 'id',
  }
})
export class CdkOption {
  private _selected: boolean = false;

  /** Whether the option is selected or not */
  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
  }

  /** The id of the option, set to a uniqueid if the user does not provide one */
  @Input() id = `cdk-option-${nextId++}`;

  constructor(@Inject(forwardRef(() => CdkListbox)) public listbox: CdkListbox) {}

  /** Toggles the selected state, emits a change event through the injected listbox */
  toggle() {
    this.selected = !this.selected;
    this.listbox._emitChangeEvent(this);
  }

  static ngAcceptInputType_selected: BooleanInput;
}

/**
 * Directive that applies interaction patterns to an element following the aria role of listbox.
 * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
 * selection of options, active options, and disabled states is built in.
 */
@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    role: 'listbox',
  }
})
export class CdkListbox {

  /** A query list containing all CdkOption elements within this listbox */
  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent> =
      new EventEmitter<ListboxSelectionChangeEvent>();

  /** Emits a selection change event, called when an option has its selected state changed */
  _emitChangeEvent(option: CdkOption) {
    this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
  }

  /** Sets the given option's selected state to true */
  select(option: CdkOption) {
    option.selected = true;
  }

  /** Sets the given option's selected state to null. Null is preferable for screen readers */
  deselect(option: CdkOption) {
    option.selected = false;
  }
}

/** Change event that is being fired whenever the selected state of an option changes. */
export class ListboxSelectionChangeEvent {
  constructor(
    /** Reference to the listbox that emitted the event. */
    public source: CdkListbox,
    /** Reference to the option that has been changed. */
    public option: CdkOption) {}
}
