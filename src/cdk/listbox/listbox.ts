/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  InjectFlags,
  Input,
  OnDestroy,
  Output,
  QueryList,
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {
  A,
  DOWN_ARROW,
  END,
  ENTER,
  hasModifierKey,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {BooleanInput, coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {defer, merge, Observable, Subject} from 'rxjs';
import {filter, map, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {Directionality} from '@angular/cdk/bidi';

/** The next id to use for creating unique DOM IDs. */
let nextId = 0;

/**
 * An implementation of SelectionModel that internally always represents the selection as a
 * multi-selection. This is necessary so that we can recover the full selection if the user
 * switches the listbox from single-selection to multi-selection after initialization.
 *
 * This selection model may report multiple selected values, even if it is in single-selection
 * mode. It is up to the user (CdkListbox) to check for invalid selections.
 */
class ListboxSelectionModel<T> extends SelectionModel<T> {
  constructor(
    public multiple = false,
    initiallySelectedValues?: T[],
    emitChanges = true,
    compareWith?: (o1: T, o2: T) => boolean,
  ) {
    super(true, initiallySelectedValues, emitChanges, compareWith);
  }

  override isMultipleSelection(): boolean {
    return this.multiple;
  }

  override select(...values: T[]) {
    // The super class is always in multi-selection mode, so we need to override the behavior if
    // this selection model actually belongs to a single-selection listbox.
    if (this.multiple) {
      return super.select(...values);
    } else {
      return super.setSelection(...values);
    }
  }
}

/** A selectable option in a listbox. */
@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    'class': 'cdk-option',
    '[id]': 'id',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled',
    '[class.cdk-option-active]': 'isActive()',
    '(click)': '_clicked.next($event)',
    '(focus)': '_handleFocus()',
  },
})
export class CdkOption<T = unknown> implements ListKeyManagerOption, Highlightable, OnDestroy {
  /** The id of the option's host element. */
  @Input()
  get id() {
    return this._id || this._generatedId;
  }
  set id(value) {
    this._id = value;
  }
  private _id: string;
  private _generatedId = `cdk-option-${nextId++}`;

  /** The value of this option. */
  @Input('cdkOption') value: T;

  /**
   * The text used to locate this item during listbox typeahead. If not specified,
   * the `textContent` of the item will be used.
   */
  @Input('cdkOptionTypeaheadLabel') typeaheadLabel: string;

  /** Whether this option is disabled. */
  @Input('cdkOptionDisabled')
  get disabled(): boolean {
    return this.listbox.disabled || this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** The tabindex of the option when it is enabled. */
  @Input('tabindex')
  get enabledTabIndex() {
    return this._enabledTabIndex === undefined
      ? this.listbox.enabledTabIndex
      : this._enabledTabIndex;
  }
  set enabledTabIndex(value) {
    this._enabledTabIndex = value;
  }
  private _enabledTabIndex?: number | null;

  /** The option's host element */
  readonly element: HTMLElement = inject(ElementRef).nativeElement;

  /** The parent listbox this option belongs to. */
  protected readonly listbox: CdkListbox<T> = inject(CdkListbox);

  /** Emits when the option is destroyed. */
  protected destroyed = new Subject<void>();

  /** Emits when the option is clicked. */
  readonly _clicked = new Subject<MouseEvent>();

  /** Whether the option is currently active. */
  private _active = false;

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Whether this option is selected. */
  isSelected() {
    return this.listbox.isSelected(this);
  }

  /** Whether this option is active. */
  isActive() {
    return this._active;
  }

  /** Toggle the selected state of this option. */
  toggle() {
    this.listbox.toggle(this);
  }

  /** Select this option if it is not selected. */
  select() {
    this.listbox.select(this);
  }

  /** Deselect this option if it is selected. */
  deselect() {
    this.listbox.deselect(this);
  }

  /** Focus this option. */
  focus() {
    this.element.focus();
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel() {
    return (this.typeaheadLabel ?? this.element.textContent?.trim()) || '';
  }

  /**
   * Set the option as active.
   * @docs-private
   */
  setActiveStyles() {
    this._active = true;
  }

  /**
   * Set the option as inactive.
   * @docs-private
   */
  setInactiveStyles() {
    this._active = false;
  }

  /** Handle focus events on the option. */
  protected _handleFocus() {
    // Options can wind up getting focused in active descendant mode if the user clicks on them.
    // In this case, we push focus back to the parent listbox to prevent an extra tab stop when
    // the user performs a shift+tab.
    if (this.listbox.useActiveDescendant) {
      this.listbox._setActiveOption(this);
      this.listbox.focus();
    }
  }

  /** Get the tabindex for this option. */
  protected _getTabIndex() {
    if (this.listbox.useActiveDescendant || this.disabled) {
      return -1;
    }
    return this.isActive() ? this.enabledTabIndex : -1;
  }
}

@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    'role': 'listbox',
    'class': 'cdk-listbox',
    '[id]': 'id',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[attr.aria-orientation]': 'orientation',
    '(focus)': '_handleFocus()',
    '(keydown)': '_handleKeydown($event)',
    '(focusout)': '_handleFocusOut($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CdkListbox),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CdkListbox),
      multi: true,
    },
  ],
})
export class CdkListbox<T = unknown>
  implements AfterContentInit, OnDestroy, ControlValueAccessor, Validator
{
  /** The id of the option's host element. */
  @Input()
  get id() {
    return this._id || this._generatedId;
  }
  set id(value) {
    this._id = value;
  }
  private _id: string;
  private _generatedId = `cdk-listbox-${nextId++}`;

  /** The tabindex to use when the listbox is enabled. */
  @Input('tabindex')
  get enabledTabIndex() {
    return this._enabledTabIndex === undefined ? 0 : this._enabledTabIndex;
  }
  set enabledTabIndex(value) {
    this._enabledTabIndex = value;
  }
  private _enabledTabIndex?: number | null;

  /** The value selected in the listbox, represented as an array of option values. */
  @Input('cdkListboxValue')
  get value(): readonly T[] {
    return this._invalid ? [] : this.selectionModel.selected;
  }
  set value(value: readonly T[]) {
    this._setSelection(value);
  }

  /**
   * Whether the listbox allows multiple options to be selected. If the value switches from `true`
   * to `false`, and more than one option is selected, all options are deselected.
   */
  @Input('cdkListboxMultiple')
  get multiple(): boolean {
    return this.selectionModel.multiple;
  }
  set multiple(value: BooleanInput) {
    this.selectionModel.multiple = coerceBooleanProperty(value);
    this._updateInternalValue();
  }

  /** Whether the listbox is disabled. */
  @Input('cdkListboxDisabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** Whether the listbox will use active descendant or will move focus onto the options. */
  @Input('cdkListboxUseActiveDescendant')
  get useActiveDescendant(): boolean {
    return this._useActiveDescendant;
  }
  set useActiveDescendant(shouldUseActiveDescendant: BooleanInput) {
    this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
  }
  private _useActiveDescendant: boolean = false;

  /** The orientation of the listbox. Only affects keyboard interaction, not visual layout. */
  @Input('cdkListboxOrientation')
  get orientation() {
    return this._orientation;
  }
  set orientation(value: 'horizontal' | 'vertical') {
    this._orientation = value === 'horizontal' ? 'horizontal' : 'vertical';
    if (value === 'horizontal') {
      this.listKeyManager?.withHorizontalOrientation(this._dir?.value || 'ltr');
    } else {
      this.listKeyManager?.withVerticalOrientation();
    }
  }
  private _orientation: 'horizontal' | 'vertical' = 'vertical';

  /** The function used to compare option values. */
  @Input('cdkListboxCompareWith')
  get compareWith(): undefined | ((o1: T, o2: T) => boolean) {
    return this.selectionModel.compareWith;
  }
  set compareWith(fn: undefined | ((o1: T, o2: T) => boolean)) {
    this.selectionModel.compareWith = fn;
  }

  /**
   * Whether the keyboard navigation should wrap when the user presses arrow down on the last item
   * or arrow up on the first item.
   */
  @Input('cdkListboxNavigationWrapDisabled')
  get navigationWrapDisabled() {
    return this._navigationWrapDisabled;
  }
  set navigationWrapDisabled(wrap: BooleanInput) {
    this._navigationWrapDisabled = coerceBooleanProperty(wrap);
    this.listKeyManager?.withWrap(!this._navigationWrapDisabled);
  }
  private _navigationWrapDisabled = false;

  /** Whether keyboard navigation should skip over disabled items. */
  @Input('cdkListboxNavigatesDisabledOptions')
  get navigateDisabledOptions() {
    return this._navigateDisabledOptions;
  }
  set navigateDisabledOptions(skip: BooleanInput) {
    this._navigateDisabledOptions = coerceBooleanProperty(skip);
    this.listKeyManager?.skipPredicate(
      this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate,
    );
  }
  private _navigateDisabledOptions = false;

  /** Emits when the selected value(s) in the listbox change. */
  @Output('cdkListboxValueChange') readonly valueChange = new Subject<ListboxValueChangeEvent<T>>();

  /** The child options in this listbox. */
  @ContentChildren(CdkOption, {descendants: true}) protected options: QueryList<CdkOption<T>>;

  /** The selection model used by the listbox. */
  protected selectionModel = new ListboxSelectionModel<T>();

  /** The key manager that manages keyboard navigation for this listbox. */
  protected listKeyManager: ActiveDescendantKeyManager<CdkOption<T>>;

  /** Emits when the listbox is destroyed. */
  protected readonly destroyed = new Subject<void>();

  /** The host element of the listbox. */
  protected readonly element: HTMLElement = inject(ElementRef).nativeElement;

  /** The change detector for this listbox. */
  protected readonly changeDetectorRef = inject(ChangeDetectorRef);

  /** Whether the currently selected value in the selection model is invalid. */
  private _invalid = false;

  /** The last user-triggered option. */
  private _lastTriggered: CdkOption<T> | null = null;

  /** Callback called when the listbox has been touched */
  private _onTouched = () => {};

  /** Callback called when the listbox value changes */
  private _onChange: (value: readonly T[]) => void = () => {};

  /** Callback called when the form validator changes. */
  private _onValidatorChange = () => {};

  /** Emits when an option has been clicked. */
  private _optionClicked = defer(() =>
    (this.options.changes as Observable<CdkOption<T>[]>).pipe(
      startWith(this.options),
      switchMap(options =>
        merge(...options.map(option => option._clicked.pipe(map(event => ({option, event}))))),
      ),
    ),
  );

  /** The directionality of the page. */
  private readonly _dir = inject(Directionality, InjectFlags.Optional);

  /** A predicate that skips disabled options. */
  private readonly _skipDisabledPredicate = (option: CdkOption<T>) => option.disabled;

  /** A predicate that does not skip any options. */
  private readonly _skipNonePredicate = () => false;

  /**
   * Validator that produces an error if multiple values are selected in a single selection
   * listbox.
   * @param control The control to validate
   * @return A validation error or null
   */
  private _validateUnexpectedMultipleValues: ValidatorFn = (control: AbstractControl) => {
    const controlValue = this._coerceValue(control.value);
    if (!this.multiple && controlValue.length > 1) {
      return {'cdkListboxUnexpectedMultipleValues': true};
    }
    return null;
  };

  /**
   * Validator that produces an error if any selected values are not valid options for this listbox.
   * @param control The control to validate
   * @return A validation error or null
   */
  private _validateUnexpectedOptionValues: ValidatorFn = (control: AbstractControl) => {
    const controlValue = this._coerceValue(control.value);
    const invalidValues = this._getInvalidOptionValues(controlValue);
    if (invalidValues.length) {
      return {'cdkListboxUnexpectedOptionValues': {'values': invalidValues}};
    }
    return null;
  };

  /** The combined set of validators for this listbox. */
  private _validators = Validators.compose([
    this._validateUnexpectedMultipleValues,
    this._validateUnexpectedOptionValues,
  ])!;

  constructor() {
    // Update the internal value whenever the selection model's selection changes.
    this.selectionModel.changed.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this._updateInternalValue();
    });
  }

  ngAfterContentInit() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      this._verifyNoOptionValueCollisions();
    }

    this._initKeyManager();

    // Update the internal value whenever the options change, as this may change the validity of
    // the current selection
    this.options.changes.pipe(startWith(this.options), takeUntil(this.destroyed)).subscribe(() => {
      this._updateInternalValue();
    });

    this._optionClicked
      .pipe(
        filter(({option}) => !option.disabled),
        takeUntil(this.destroyed),
      )
      .subscribe(({option, event}) => this._handleOptionClicked(option, event));
  }

  ngOnDestroy() {
    this.listKeyManager.change.complete();
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * Toggle the selected state of the given option.
   * @param option The option to toggle
   */
  toggle(option: CdkOption<T>) {
    this.toggleValue(option.value);
  }

  /**
   * Toggle the selected state of the given value.
   * @param value The value to toggle
   */
  toggleValue(value: T) {
    if (this._invalid) {
      this.selectionModel.clear(false);
    }
    this.selectionModel.toggle(value);
  }

  /**
   * Select the given option.
   * @param option The option to select
   */
  select(option: CdkOption<T>) {
    this.selectValue(option.value);
  }

  /**
   * Select the given value.
   * @param value The value to select
   */
  selectValue(value: T) {
    if (this._invalid) {
      this.selectionModel.clear(false);
    }
    this.selectionModel.select(value);
  }

  /**
   * Deselect the given option.
   * @param option The option to deselect
   */
  deselect(option: CdkOption<T>) {
    this.deselectValue(option.value);
  }

  /**
   * Deselect the given value.
   * @param value The value to deselect
   */
  deselectValue(value: T) {
    if (this._invalid) {
      this.selectionModel.clear(false);
    }
    this.selectionModel.deselect(value);
  }

  /**
   * Set the selected state of all options.
   * @param isSelected The new selected state to set
   */
  setAllSelected(isSelected: boolean) {
    if (!isSelected) {
      this.selectionModel.clear();
    } else {
      if (this._invalid) {
        this.selectionModel.clear(false);
      }
      this.selectionModel.select(...this.options.map(option => option.value));
    }
  }

  /**
   * Get whether the given option is selected.
   * @param option The option to get the selected state of
   */
  isSelected(option: CdkOption<T>) {
    return this.isValueSelected(option.value);
  }

  /**
   * Get whether the given value is selected.
   * @param value The value to get the selected state of
   */
  isValueSelected(value: T) {
    if (this._invalid) {
      return false;
    }
    return this.selectionModel.isSelected(value);
  }

  /**
   * Registers a callback to be invoked when the listbox's value changes from user input.
   * @param fn The callback to register
   * @docs-private
   */
  registerOnChange(fn: (value: readonly T[]) => void): void {
    this._onChange = fn;
  }

  /**
   * Registers a callback to be invoked when the listbox is blurred by the user.
   * @param fn The callback to register
   * @docs-private
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /**
   * Sets the listbox's value.
   * @param value The new value of the listbox
   * @docs-private
   */
  writeValue(value: readonly T[]): void {
    this._setSelection(value);
  }

  /**
   * Sets the disabled state of the listbox.
   * @param isDisabled The new disabled state
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Validate the given control
   * @docs-private
   */
  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return this._validators(control);
  }

  /**
   * Registers a callback to be called when the form validator changes.
   * @param fn The callback to call
   * @docs-private
   */
  registerOnValidatorChange(fn: () => void) {
    this._onValidatorChange = fn;
  }

  /** Focus the listbox's host element. */
  focus() {
    this.element.focus();
  }

  /**
   * Triggers the given option in response to user interaction.
   * - In single selection mode: selects the option and deselects any other selected option.
   * - In multi selection mode: toggles the selected state of the option.
   * @param option The option to trigger
   */
  protected triggerOption(option: CdkOption<T> | null) {
    if (option && !option.disabled) {
      this._lastTriggered = option;
      const changed = this.multiple
        ? this.selectionModel.toggle(option.value)
        : this.selectionModel.select(option.value);
      if (changed) {
        this._onChange(this.value);
        this.valueChange.next({
          value: this.value,
          listbox: this,
          option: option,
        });
      }
    }
  }

  /**
   * Trigger the given range of options in response to user interaction.
   * Should only be called in multi-selection mode.
   * @param trigger The option that was triggered
   * @param from The start index of the options to toggle
   * @param to The end index of the options to toggle
   * @param on Whether to toggle the option range on
   */
  protected triggerRange(trigger: CdkOption<T> | null, from: number, to: number, on: boolean) {
    if (this.disabled || (trigger && trigger.disabled)) {
      return;
    }
    this._lastTriggered = trigger;
    const isEqual = this.compareWith ?? Object.is;
    const updateValues = [...this.options]
      .slice(Math.max(0, Math.min(from, to)), Math.min(this.options.length, Math.max(from, to) + 1))
      .filter(option => !option.disabled)
      .map(option => option.value);
    const selected = [...this.value];
    for (const updateValue of updateValues) {
      const selectedIndex = selected.findIndex(selectedValue =>
        isEqual(selectedValue, updateValue),
      );
      if (on && selectedIndex === -1) {
        selected.push(updateValue);
      } else if (!on && selectedIndex !== -1) {
        selected.splice(selectedIndex, 1);
      }
    }
    let changed = this.selectionModel.setSelection(...selected);
    if (changed) {
      this._onChange(this.value);
      this.valueChange.next({
        value: this.value,
        listbox: this,
        option: trigger,
      });
    }
  }

  /**
   * Sets the given option as active.
   * @param option The option to make active
   */
  _setActiveOption(option: CdkOption<T>) {
    this.listKeyManager.setActiveItem(option);
  }

  /** Called when the listbox receives focus. */
  protected _handleFocus() {
    if (!this.useActiveDescendant) {
      this.listKeyManager.setNextItemActive();
      this._focusActiveOption();
    }
  }

  /** Called when the user presses keydown on the listbox. */
  protected _handleKeydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const {keyCode} = event;
    const previousActiveIndex = this.listKeyManager.activeItemIndex;
    const ctrlKeys = ['ctrlKey', 'metaKey'] as const;

    if (this.multiple && keyCode === A && hasModifierKey(event, ...ctrlKeys)) {
      // Toggle all options off if they're all selected, otherwise toggle them all on.
      this.triggerRange(
        null,
        0,
        this.options.length - 1,
        this.options.length !== this.value.length,
      );
      event.preventDefault();
      return;
    }

    if (
      this.multiple &&
      (keyCode === SPACE || keyCode === ENTER) &&
      hasModifierKey(event, 'shiftKey')
    ) {
      if (this.listKeyManager.activeItem && this.listKeyManager.activeItemIndex != null) {
        this.triggerRange(
          this.listKeyManager.activeItem,
          this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex,
          this.listKeyManager.activeItemIndex,
          !this.listKeyManager.activeItem.isSelected(),
        );
      }
      event.preventDefault();
      return;
    }

    if (
      this.multiple &&
      keyCode === HOME &&
      hasModifierKey(event, ...ctrlKeys) &&
      hasModifierKey(event, 'shiftKey')
    ) {
      const trigger = this.listKeyManager.activeItem;
      if (trigger) {
        const from = this.listKeyManager.activeItemIndex!;
        this.listKeyManager.setFirstItemActive();
        this.triggerRange(
          trigger,
          from,
          this.listKeyManager.activeItemIndex!,
          !trigger.isSelected(),
        );
      }
      event.preventDefault();
      return;
    }

    if (
      this.multiple &&
      keyCode === END &&
      hasModifierKey(event, ...ctrlKeys) &&
      hasModifierKey(event, 'shiftKey')
    ) {
      const trigger = this.listKeyManager.activeItem;
      if (trigger) {
        const from = this.listKeyManager.activeItemIndex!;
        this.listKeyManager.setLastItemActive();
        this.triggerRange(
          trigger,
          from,
          this.listKeyManager.activeItemIndex!,
          !trigger.isSelected(),
        );
      }
      event.preventDefault();
      return;
    }

    if (keyCode === SPACE || keyCode === ENTER) {
      this.triggerOption(this.listKeyManager.activeItem);
      event.preventDefault();
      return;
    }

    const isNavKey =
      keyCode === UP_ARROW ||
      keyCode === DOWN_ARROW ||
      keyCode === LEFT_ARROW ||
      keyCode === RIGHT_ARROW ||
      keyCode === HOME ||
      keyCode === END;
    this.listKeyManager.onKeydown(event);
    // Will select an option if shift was pressed while navigating to the option
    if (isNavKey && event.shiftKey && previousActiveIndex !== this.listKeyManager.activeItemIndex) {
      this.triggerOption(this.listKeyManager.activeItem);
    }
  }

  /**
   * Called when the focus leaves an element in the listbox.
   * @param event The focusout event
   */
  protected _handleFocusOut(event: FocusEvent) {
    const otherElement = event.relatedTarget as Element;
    if (this.element !== otherElement && !this.element.contains(otherElement)) {
      this._onTouched();
    }
  }

  /** Get the id of the active option if active descendant is being used. */
  protected _getAriaActiveDescendant(): string | null | undefined {
    return this._useActiveDescendant ? this.listKeyManager?.activeItem?.id : null;
  }

  /** Get the tabindex for the listbox. */
  protected _getTabIndex() {
    if (this.disabled) {
      return -1;
    }
    return this.useActiveDescendant || !this.listKeyManager.activeItem ? this.enabledTabIndex : -1;
  }

  /** Initialize the key manager. */
  private _initKeyManager() {
    this.listKeyManager = new ActiveDescendantKeyManager(this.options)
      .withWrap(!this._navigationWrapDisabled)
      .withTypeAhead()
      .withHomeAndEnd()
      .withAllowedModifierKeys(['shiftKey'])
      .skipPredicate(
        this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate,
      );

    if (this.orientation === 'vertical') {
      this.listKeyManager.withVerticalOrientation();
    } else {
      this.listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
    }

    this.listKeyManager.change
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => this._focusActiveOption());
  }

  /** Focus the active option. */
  private _focusActiveOption() {
    if (!this.useActiveDescendant) {
      this.listKeyManager.activeItem?.focus();
    }
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Set the selected values.
   * @param value The list of new selected values.
   */
  private _setSelection(value: readonly T[]) {
    if (this._invalid) {
      this.selectionModel.clear(false);
    }
    this.selectionModel.setSelection(...this._coerceValue(value));
  }

  /** Update the internal value of the listbox based on the selection model. */
  private _updateInternalValue() {
    const indexCache = new Map<T, number>();
    this.selectionModel.sort((a: T, b: T) => {
      const aIndex = this._getIndexForValue(indexCache, a);
      const bIndex = this._getIndexForValue(indexCache, b);
      return aIndex - bIndex;
    });
    const selected = this.selectionModel.selected;
    this._invalid =
      (!this.multiple && selected.length > 1) || !!this._getInvalidOptionValues(selected).length;
    this._onValidatorChange();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Gets the index of the given value in the given list of options.
   * @param cache The cache of indices found so far
   * @param value The value to find
   * @return The index of the value in the options list
   */
  private _getIndexForValue(cache: Map<T, number>, value: T) {
    const isEqual = this.compareWith || Object.is;
    if (!cache.has(value)) {
      let index = -1;
      for (let i = 0; i < this.options.length; i++) {
        if (isEqual(value, this.options.get(i)!.value)) {
          index = i;
          break;
        }
      }
      cache.set(value, index);
    }
    return cache.get(value)!;
  }

  /**
   * Handle the user clicking an option.
   * @param option The option that was clicked.
   */
  private _handleOptionClicked(option: CdkOption<T>, event: MouseEvent) {
    this.listKeyManager.setActiveItem(option);
    if (event.shiftKey && this.multiple) {
      this.triggerRange(
        option,
        this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex!,
        this.listKeyManager.activeItemIndex!,
        !option.isSelected(),
      );
    } else {
      this.triggerOption(option);
    }
  }

  /** Verifies that no two options represent the same value under the compareWith function. */
  private _verifyNoOptionValueCollisions() {
    this.options.changes.pipe(startWith(this.options), takeUntil(this.destroyed)).subscribe(() => {
      const isEqual = this.compareWith ?? Object.is;
      for (let i = 0; i < this.options.length; i++) {
        const option = this.options.get(i)!;
        let duplicate: CdkOption<T> | null = null;
        for (let j = i + 1; j < this.options.length; j++) {
          const other = this.options.get(j)!;
          if (isEqual(option.value, other.value)) {
            duplicate = other;
            break;
          }
        }
        if (duplicate) {
          // TODO(mmalerba): Link to docs about this.
          if (this.compareWith) {
            console.warn(
              `Found multiple CdkOption representing the same value under the given compareWith function`,
              {
                option1: option.element,
                option2: duplicate.element,
                compareWith: this.compareWith,
              },
            );
          } else {
            console.warn(`Found multiple CdkOption with the same value`, {
              option1: option.element,
              option2: duplicate.element,
            });
          }
          return;
        }
      }
    });
  }

  /**
   * Coerces a value into an array representing a listbox selection.
   * @param value The value to coerce
   * @return An array
   */
  private _coerceValue(value: readonly T[]) {
    return value == null ? [] : coerceArray(value);
  }

  /**
   * Get the sublist of values that do not represent valid option values in this listbox.
   * @param values The list of values
   * @return The sublist of values that are not valid option values
   */
  private _getInvalidOptionValues(values: readonly T[]) {
    const isEqual = this.compareWith || Object.is;
    const validValues = (this.options || []).map(option => option.value);
    return values.filter(value => !validValues.some(validValue => isEqual(value, validValue)));
  }

  /** Get the index of the last triggered option. */
  private _getLastTriggeredIndex() {
    const index = this.options.toArray().indexOf(this._lastTriggered!);
    return index === -1 ? null : index;
  }
}

/** Change event that is fired whenever the value of the listbox changes. */
export interface ListboxValueChangeEvent<T> {
  /** The new value of the listbox. */
  readonly value: readonly T[];

  /** Reference to the listbox that emitted the event. */
  readonly listbox: CdkListbox<T>;

  /** Reference to the option that was triggered. */
  readonly option: CdkOption<T> | null;
}
