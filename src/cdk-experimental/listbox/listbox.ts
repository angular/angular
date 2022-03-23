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
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {BooleanInput, coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {defer, merge, Observable, Subject} from 'rxjs';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Directionality} from '@angular/cdk/bidi';
import {CDK_COMBOBOX, CdkCombobox} from '@angular/cdk-experimental/combobox';

let nextId = 0;
let listboxId = 0;

export const CDK_LISTBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CdkListbox),
  multi: true,
};

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    'class': 'cdk-option',
    '(click)': 'toggle()',
    '(focus)': 'activate()',
    '(blur)': 'deactivate()',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected || null',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-active]': '_active',
    '[class.cdk-option-selected]': 'selected',
  },
})
export class CdkOption<T = unknown> implements ListKeyManagerOption, Highlightable {
  private _selected: boolean = false;
  private _disabled: boolean = false;
  private _value: T;
  _active: boolean = false;

  /** The id of the option, set to a uniqueid if the user does not provide one. */
  @Input() id = `cdk-option-${nextId++}`;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: BooleanInput) {
    if (!this._disabled) {
      this._selected = coerceBooleanProperty(value);
    }
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** The form value of the option. */
  @Input()
  get value(): T {
    return this._value;
  }
  set value(value: T) {
    if (this.selected && value !== this._value) {
      this.deselect();
    }
    this._value = value;
  }

  /**
   * The text used to locate this item during menu typeahead. If not specified,
   * the `textContent` of the item will be used.
   */
  @Input() typeahead: string;

  @Output() readonly selectionChange = new EventEmitter<OptionSelectionChangeEvent<T>>();

  constructor(
    private readonly _elementRef: ElementRef,
    @Inject(forwardRef(() => CdkListbox)) readonly listbox: CdkListbox<T>,
  ) {}

  /** Toggles the selected state, emits a change event through the injected listbox. */
  toggle() {
    if (!this._isInteractionDisabled()) {
      this.selected = !this.selected;
      this._emitSelectionChange(true);
    }
  }

  /** Sets the active property true if the option and listbox aren't disabled. */
  activate() {
    if (!this._isInteractionDisabled()) {
      this._active = true;
    }
  }

  /** Sets the active property false. */
  deactivate() {
    if (!this._isInteractionDisabled()) {
      this._active = false;
    }
  }

  /** Sets the selected property true if it was false. */
  select() {
    if (!this.selected) {
      this.selected = true;
      this._emitSelectionChange();
    }
  }

  /** Sets the selected property false if it was true. */
  deselect() {
    if (this.selected) {
      this.selected = false;
      this._emitSelectionChange();
    }
  }

  /** Applies focus to the option. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  /** Returns true if the option or listbox are disabled, and false otherwise. */
  _isInteractionDisabled(): boolean {
    return this.listbox.disabled || this._disabled;
  }

  /** Emits a change event extending the Option Selection Change Event interface. */
  private _emitSelectionChange(isUserInput = false) {
    this.selectionChange.emit({
      source: this,
      isUserInput: isUserInput,
    });
  }

  /** Returns the tab index which depends on the disabled property. */
  _getTabIndex(): string | null {
    return this._isInteractionDisabled() ? null : '-1';
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel() {
    return (this.typeahead ?? this._elementRef.nativeElement.textContent?.trim()) || '';
  }

  /** Sets the active property to true to enable the active css class. */
  setActiveStyles() {
    this._active = true;
  }

  /** Sets the active property to false to disable the active css class. */
  setInactiveStyles() {
    this._active = false;
  }
}

@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    'role': 'listbox',
    'class': 'cdk-listbox',
    '[id]': 'id',
    '(focus)': '_focusActiveOption()',
    '(keydown)': '_keydown($event)',
    '[attr.tabindex]': '_tabIndex',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [CDK_LISTBOX_VALUE_ACCESSOR],
})
export class CdkListbox<T> implements AfterContentInit, OnDestroy, OnInit, ControlValueAccessor {
  _listKeyManager: ActiveDescendantKeyManager<CdkOption<T>>;
  _selectionModel: SelectionModel<CdkOption<T>>;
  _tabIndex = 0;

  /** `View -> model callback called when select has been touched` */
  _onTouched: () => void = () => {};

  /** `View -> model callback called when value changes` */
  _onChange: (value: T) => void = () => {};

  readonly optionSelectionChanges: Observable<OptionSelectionChangeEvent<T>> = defer(() => {
    const options = this._options;

    return options.changes.pipe(
      startWith(options),
      switchMap(() => merge(...options.map(option => option.selectionChange))),
    );
  }) as Observable<OptionSelectionChangeEvent<T>>;

  private _disabled: boolean = false;
  private _multiple: boolean = false;
  private _useActiveDescendant: boolean = false;
  private _autoFocus: boolean = true;
  private _activeOption: CdkOption<T>;
  private readonly _destroyed = new Subject<void>();

  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption<T>>;

  @Output() readonly selectionChange = new EventEmitter<ListboxSelectionChangeEvent<T>>();

  @Input() id = `cdk-listbox-${listboxId++}`;

  /**
   * Whether the listbox allows multiple options to be selected.
   * If `multiple` switches from `true` to `false`, all options are deselected.
   */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: BooleanInput) {
    const coercedValue = coerceBooleanProperty(value);
    this._updateSelectionOnMultiSelectionChange(coercedValue);
    this._multiple = coercedValue;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the listbox will use active descendant or will move focus onto the options. */
  @Input()
  get useActiveDescendant(): boolean {
    return this._useActiveDescendant;
  }
  set useActiveDescendant(shouldUseActiveDescendant: BooleanInput) {
    this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
  }

  /** Whether on focus the listbox will focus its active option, default to true. */
  @Input()
  get autoFocus(): boolean {
    return this._autoFocus;
  }
  set autoFocus(shouldAutoFocus: BooleanInput) {
    this._autoFocus = coerceBooleanProperty(shouldAutoFocus);
  }

  /** Determines the orientation for the list key manager. Affects keyboard interaction. */
  @Input('listboxOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  @Input() compareWith: (o1: T, o2: T) => boolean = (a1, a2) => a1 === a2;

  constructor(
    @Optional() @Inject(CDK_COMBOBOX) private readonly _combobox: CdkCombobox,
    @Optional() private readonly _dir?: Directionality,
  ) {}

  ngOnInit() {
    this._selectionModel = new SelectionModel<CdkOption<T>>(this.multiple);
  }

  ngAfterContentInit() {
    this._initKeyManager();
    this._initSelectionModel();
    this._combobox?._registerContent(this.id, 'listbox');

    this.optionSelectionChanges.subscribe(event => {
      this._emitChangeEvent(event.source);
      this._updateSelectionModel(event.source);
      this.setActiveOption(event.source);
      this._updatePanelForSelection(event.source);
    });
  }

  ngOnDestroy() {
    this._listKeyManager.change.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _initKeyManager() {
    this._listKeyManager = new ActiveDescendantKeyManager(this._options)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd()
      .withAllowedModifierKeys(['shiftKey']);

    if (this.orientation === 'vertical') {
      this._listKeyManager.withVerticalOrientation();
    } else {
      this._listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
    }

    this._listKeyManager.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._updateActiveOption();
    });
  }

  private _initSelectionModel() {
    this._selectionModel.changed
      .pipe(takeUntil(this._destroyed))
      .subscribe((event: SelectionChange<CdkOption<T>>) => {
        for (const option of event.added) {
          option.selected = true;
        }

        for (const option of event.removed) {
          option.selected = false;
        }
      });
  }

  _keydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const manager = this._listKeyManager;
    const {keyCode} = event;
    const previousActiveIndex = manager.activeItemIndex;

    if (keyCode === SPACE || keyCode === ENTER) {
      if (manager.activeItem && !manager.isTyping()) {
        this._toggleActiveOption();
      }
      event.preventDefault();
    } else {
      manager.onKeydown(event);
    }

    /** Will select an option if shift was pressed while navigating to the option */
    const isArrow =
      keyCode === UP_ARROW ||
      keyCode === DOWN_ARROW ||
      keyCode === LEFT_ARROW ||
      keyCode === RIGHT_ARROW;
    if (isArrow && event.shiftKey && previousActiveIndex !== this._listKeyManager.activeItemIndex) {
      this._toggleActiveOption();
    }
  }

  /** Emits a selection change event, called when an option has its selected state changed. */
  _emitChangeEvent(option: CdkOption<T>) {
    this.selectionChange.emit({
      source: this,
      option: option,
    });
  }

  /** Updates the selection model after a toggle. */
  _updateSelectionModel(option: CdkOption<T>) {
    if (!this.multiple && this._selectionModel.selected.length !== 0) {
      const previouslySelected = this._selectionModel.selected[0];
      this.deselect(previouslySelected);
    }

    option.selected ? this._selectionModel.select(option) : this._selectionModel.deselect(option);
  }

  _updatePanelForSelection(option: CdkOption<T>) {
    if (this._combobox) {
      if (!this.multiple) {
        this._combobox.updateAndClose(option.selected ? option.value : []);
      } else {
        this._combobox.updateAndClose(this.getSelectedValues());
      }
    }
  }

  /** Toggles the selected state of the active option if not disabled. */
  private _toggleActiveOption() {
    const activeOption = this._listKeyManager.activeItem;
    if (activeOption && !activeOption.disabled) {
      activeOption.toggle();
    }
  }

  /** Returns the id of the active option if active descendant is being used. */
  _getAriaActiveDescendant(): string | null | undefined {
    return this._useActiveDescendant ? this._listKeyManager?.activeItem?.id : null;
  }

  /** Updates the activeOption and the active and focus properties of the option. */
  private _updateActiveOption() {
    if (!this._listKeyManager.activeItem) {
      return;
    }

    this._activeOption?.deactivate();
    this._activeOption = this._listKeyManager.activeItem;
    this._activeOption.activate();

    if (!this.useActiveDescendant) {
      this._activeOption.focus();
    }
  }

  /** Updates selection states of options when the 'multiple' property changes. */
  private _updateSelectionOnMultiSelectionChange(value: boolean) {
    if (this.multiple && !value) {
      // Deselect all options instead of arbitrarily keeping one of the selected options.
      this.setAllSelected(false);
    } else if (!this.multiple && value) {
      this._selectionModel = new SelectionModel<CdkOption<T>>(
        value,
        this._selectionModel?.selected,
      );
    }
  }

  _focusActiveOption() {
    if (!this.autoFocus) {
      return;
    }

    if (this._listKeyManager.activeItem) {
      this.setActiveOption(this._listKeyManager.activeItem);
    } else if (this._options.first) {
      this.setActiveOption(this._options.first);
    }
  }

  /** Selects the given option if the option and listbox aren't disabled. */
  select(option: CdkOption<T>) {
    if (!this.disabled && !option.disabled) {
      option.select();
    }
  }

  /** Deselects the given option if the option and listbox aren't disabled. */
  deselect(option: CdkOption<T>) {
    if (!this.disabled && !option.disabled) {
      option.deselect();
    }
  }

  /** Sets the selected state of all options to be the given value. */
  setAllSelected(isSelected: boolean) {
    for (const option of this._options.toArray()) {
      isSelected ? this.select(option) : this.deselect(option);
    }
  }

  /** Updates the key manager's active item to the given option. */
  setActiveOption(option: CdkOption<T>) {
    this._listKeyManager.updateActiveItem(option);
    this._updateActiveOption();
  }

  /**
   * Saves a callback function to be invoked when the select's value
   * changes from user input. Required to implement ControlValueAccessor.
   */
  registerOnChange(fn: (value: T) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the select is blurred
   * by the user. Required to implement ControlValueAccessor.
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /** Sets the select's value. Required to implement ControlValueAccessor. */
  writeValue(values: T | T[]): void {
    if (this._options) {
      this._setSelectionByValue(values);
    }
  }

  /** Disables the select. Required to implement ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Returns the values of the currently selected options. */
  getSelectedValues(): T[] {
    return this._options.filter(option => option.selected).map(option => option.value);
  }

  /** Selects an option that has the corresponding given value. */
  private _setSelectionByValue(values: T | T[]) {
    for (const option of this._options.toArray()) {
      this.deselect(option);
    }

    const valuesArray = coerceArray(values);
    for (const value of valuesArray) {
      const correspondingOption = this._options.find((option: CdkOption<T>) => {
        return option.value != null && this.compareWith(option.value, value);
      });

      if (correspondingOption) {
        this.select(correspondingOption);
        if (!this.multiple) {
          return;
        }
      }
    }
  }
}

/** Change event that is being fired whenever the selected state of an option changes. */
export interface ListboxSelectionChangeEvent<T> {
  /** Reference to the listbox that emitted the event. */
  readonly source: CdkListbox<T>;

  /** Reference to the option that has been changed. */
  readonly option: CdkOption<T>;
}

/** Event object emitted by MatOption when selected or deselected. */
export interface OptionSelectionChangeEvent<T> {
  /** Reference to the option that emitted the event. */
  source: CdkOption<T>;

  /** Whether the change in the option's value was a result of a user action. */
  isUserInput: boolean;
}
