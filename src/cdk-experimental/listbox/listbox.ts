/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef, EventEmitter, forwardRef,
  Inject,
  Input, OnDestroy, Output,
  QueryList
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {END, ENTER, HOME, SPACE} from '@angular/cdk/keycodes';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

let nextId = 0;

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    '(click)': 'toggle()',
    '(focus)': 'activate()',
    '(blur)': 'deactivate()',
    '[id]': 'id',
    '[attr.aria-selected]': '_selected || null',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-active]': '_active'

  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
  private _selected: boolean = false;
  private _disabled: boolean = false;
  _active: boolean = false;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    if (!this._disabled) {
      this._selected = coerceBooleanProperty(value);
    }
  }

  /** The id of the option, set to a uniqueid if the user does not provide one. */
  @Input() id = `cdk-option-${nextId++}`;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  constructor(private _elementRef: ElementRef,
              @Inject(forwardRef(() => CdkListbox)) public listbox: CdkListbox) {
  }

  /** Toggles the selected state, emits a change event through the injected listbox. */
  toggle() {
    if (!this._isInteractionDisabled()) {
      this.selected = !this.selected;
      this.listbox._emitChangeEvent(this);
    }
  }

  /** Sets the active property true if the option and listbox aren't disabled. */
  activate() {
    if (!this._isInteractionDisabled()) {
      this._active = true;
      this.listbox.setActiveOption(this);
    }
  }

  /** Sets the active property false. */
  deactivate() {
    this._active = false;
  }

  /** Returns true if the option or listbox are disabled, and false otherwise. */
  _isInteractionDisabled(): boolean {
    return (this.listbox.disabled || this._disabled);
  }

  /** Returns the tab index which depends on the disabled property. */
  _getTabIndex(): string | null {
    return (this.listbox.disabled || this._disabled) ? null : '-1';
  }

  getLabel(): string {
    // TODO: improve to method to handle more complex combinations of elements and text
    return this._elementRef.nativeElement.textContent;
  }

  setActiveStyles() {
    this._active = true;
  }

  setInactiveStyles() {
    this._active = false;
  }

  static ngAcceptInputType_selected: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}

@Directive({
    selector: '[cdkListbox]',
    exportAs: 'cdkListbox',
    host: {
      'role': 'listbox',
      '(keydown)': '_keydown($event)',
      '[attr.aria-disabled]': '_disabled',
    }
})
export class CdkListbox implements AfterContentInit, OnDestroy {

  _listKeyManager: ActiveDescendantKeyManager<CdkOption>;
  private _disabled: boolean = false;

  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent> =
      new EventEmitter<ListboxSelectionChangeEvent>();

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  ngAfterContentInit() {
    this._listKeyManager = new ActiveDescendantKeyManager(this._options)
      .withWrap().withVerticalOrientation().withTypeAhead();
  }

  ngOnDestroy() {
    this._listKeyManager.change.complete();
  }

  _keydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const manager = this._listKeyManager;
    const keyCode = event.keyCode;

    if (keyCode === HOME || keyCode === END) {
      event.preventDefault();
      keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();

    } else if (keyCode === SPACE || keyCode === ENTER) {
      if (manager.activeItem && !manager.isTyping()) {
        this._toggleActiveOption();
      }

    } else {
      manager.onKeydown(event);
    }

  }

  /** Emits a selection change event, called when an option has its selected state changed. */
  _emitChangeEvent(option: CdkOption) {
    this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
  }

  private _toggleActiveOption() {
    const activeOption = this._listKeyManager.activeItem;
    if (activeOption && !activeOption.disabled) {
      activeOption.toggle();
      this._emitChangeEvent(activeOption);
    }
  }

  /** Selects the given option if the option and listbox aren't disabled. */
  select(option: CdkOption) {
    if (!this.disabled && !option.disabled) {
      option.selected = true;
    }
  }

  /** Deselects the given option if the option and listbox aren't disabled. */
  deselect(option: CdkOption) {
    if (!this.disabled && !option.disabled) {
      option.selected = false;
    }
  }

  /** Updates the key manager's active item to the given option. */
  setActiveOption(option: CdkOption) {
    this._listKeyManager.updateActiveItem(option);
  }

  static ngAcceptInputType_disabled: BooleanInput;
}

/** Change event that is being fired whenever the selected state of an option changes. */
export class ListboxSelectionChangeEvent {
  constructor(
      /** Reference to the listbox that emitted the event. */
      public source: CdkListbox,
      /** Reference to the option that has been changed. */
      public option: CdkOption) {}
}
