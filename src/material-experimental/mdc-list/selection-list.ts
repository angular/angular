/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusKeyManager} from '@angular/cdk/a11y';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {A, ENTER, hasModifierKey, SPACE} from '@angular/cdk/keycodes';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatListBase} from './list-base';
import {MatListOption, SELECTION_LIST, SelectionList} from './list-option';

const MAT_SELECTION_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSelectionList),
  multi: true,
};

/** Change event that is being fired whenever the selected state of an option changes. */
export class MatSelectionListChange {
  constructor(
    /** Reference to the selection list that emitted the event. */
    public source: MatSelectionList,
    /**
     * Reference to the option that has been changed.
     * @deprecated Use `options` instead, because some events may change more than one option.
     * @breaking-change 12.0.0
     */
    public option: MatListOption,
    /** Reference to the options that have been changed. */
    public options: MatListOption[],
  ) {}
}

@Component({
  selector: 'mat-selection-list',
  exportAs: 'matSelectionList',
  host: {
    'class': 'mat-mdc-selection-list mat-mdc-list-base mdc-list',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple',
    '(keydown)': '_handleKeydown($event)',
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_SELECTION_LIST_VALUE_ACCESSOR,
    {provide: MatListBase, useExisting: MatSelectionList},
    {provide: SELECTION_LIST, useExisting: MatSelectionList},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSelectionList
  extends MatListBase
  implements SelectionList, ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  private _initialized = false;
  private _keyManager: FocusKeyManager<MatListOption>;

  /** Emits when the list has been destroyed. */
  private _destroyed = new Subject<void>();

  /** Whether the list has been destroyed. */
  private _isDestroyed: boolean;

  /** View to model callback that should be called whenever the selected options change. */
  private _onChange: (value: any) => void = (_: any) => {};

  @ContentChildren(MatListOption, {descendants: true}) _items: QueryList<MatListOption>;

  /** Emits a change event whenever the selected state of an option changes. */
  @Output() readonly selectionChange: EventEmitter<MatSelectionListChange> =
    new EventEmitter<MatSelectionListChange>();

  /** Theme color of the selection list. This sets the checkbox color for all list options. */
  @Input() color: ThemePalette = 'accent';

  /**
   * Function used for comparing an option against the selected value when determining which
   * options should appear as selected. The first argument is the value of an options. The second
   * one is a value from the selected value. A boolean must be returned.
   */
  @Input() compareWith: (o1: any, o2: any) => boolean = (a1, a2) => a1 === a2;

  /** Whether selection is limited to one or multiple items (default multiple). */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: BooleanInput) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._multiple) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._initialized) {
        throw new Error(
          'Cannot change `multiple` mode of mat-selection-list after initialization.',
        );
      }

      this._multiple = newValue;
      this.selectedOptions = new SelectionModel(this._multiple, this.selectedOptions.selected);
    }
  }
  private _multiple = true;

  /** The currently selected options. */
  selectedOptions = new SelectionModel<MatListOption>(this._multiple);

  /** Keeps track of the currently-selected value. */
  _value: string[] | null;

  /** View to model callback that should be called if the list or its options lost focus. */
  _onTouched: () => void = () => {};

  constructor(public _element: ElementRef<HTMLElement>, private _ngZone: NgZone) {
    super();
    this._isNonInteractive = false;
  }

  ngAfterViewInit() {
    // Mark the selection list as initialized so that the `multiple`
    // binding can no longer be changed.
    this._initialized = true;
    this._setupRovingTabindex();

    // These events are bound outside the zone, because they don't change
    // any change-detected properties and they can trigger timeouts.
    this._ngZone.runOutsideAngular(() => {
      this._element.nativeElement.addEventListener('focusin', this._handleFocusin);
      this._element.nativeElement.addEventListener('focusout', this._handleFocusout);
    });

    if (this._value) {
      this._setOptionsFromValues(this._value);
    }

    this._watchForSelectionChange();
  }

  ngOnChanges(changes: SimpleChanges) {
    const disabledChanges = changes['disabled'];
    const disableRippleChanges = changes['disableRipple'];

    if (
      (disableRippleChanges && !disableRippleChanges.firstChange) ||
      (disabledChanges && !disabledChanges.firstChange)
    ) {
      this._markOptionsForCheck();
    }
  }

  ngOnDestroy() {
    this._element.nativeElement.removeEventListener('focusin', this._handleFocusin);
    this._element.nativeElement.removeEventListener('focusout', this._handleFocusout);
    this._destroyed.next();
    this._destroyed.complete();
    this._isDestroyed = true;
  }

  /** Focuses the selection list. */
  focus(options?: FocusOptions) {
    this._element.nativeElement.focus(options);
  }

  /** Selects all of the options. Returns the options that changed as a result. */
  selectAll(): MatListOption[] {
    return this._setAllOptionsSelected(true);
  }

  /** Deselects all of the options. Returns the options that changed as a result. */
  deselectAll(): MatListOption[] {
    return this._setAllOptionsSelected(false);
  }

  /** Reports a value change to the ControlValueAccessor */
  _reportValueChange() {
    // Stop reporting value changes after the list has been destroyed. This avoids
    // cases where the list might wrongly reset its value once it is removed, but
    // the form control is still live.
    if (this.options && !this._isDestroyed) {
      const value = this._getSelectedOptionValues();
      this._onChange(value);
      this._value = value;
    }
  }

  /** Emits a change event if the selected state of an option changed. */
  _emitChangeEvent(options: MatListOption[]) {
    this.selectionChange.emit(new MatSelectionListChange(this, options[0], options));
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(values: string[]): void {
    this._value = values;

    if (this.options) {
      this._setOptionsFromValues(values || []);
    }
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /** Watches for changes in the selected state of the options and updates the list accordingly. */
  private _watchForSelectionChange() {
    this.selectedOptions.changed.pipe(takeUntil(this._destroyed)).subscribe(event => {
      // Sync external changes to the model back to the options.
      for (let item of event.added) {
        item.selected = true;
      }

      for (let item of event.removed) {
        item.selected = false;
      }

      if (!this._containsFocus()) {
        this._resetActiveOption();
      }
    });
  }

  /** Sets the selected options based on the specified values. */
  private _setOptionsFromValues(values: string[]) {
    this.options.forEach(option => option._setSelected(false));

    values.forEach(value => {
      const correspondingOption = this.options.find(option => {
        // Skip options that are already in the model. This allows us to handle cases
        // where the same primitive value is selected multiple times.
        return option.selected ? false : this.compareWith(option.value, value);
      });

      if (correspondingOption) {
        correspondingOption._setSelected(true);
      }
    });
  }

  /** Returns the values of the selected options. */
  private _getSelectedOptionValues(): string[] {
    return this.options.filter(option => option.selected).map(option => option.value);
  }

  /** Marks all the options to be checked in the next change detection run. */
  private _markOptionsForCheck() {
    if (this.options) {
      this.options.forEach(option => option._markForCheck());
    }
  }

  /**
   * Sets the selected state on all of the options
   * and emits an event if anything changed.
   */
  private _setAllOptionsSelected(isSelected: boolean, skipDisabled?: boolean): MatListOption[] {
    // Keep track of whether anything changed, because we only want to
    // emit the changed event when something actually changed.
    const changedOptions: MatListOption[] = [];

    this.options.forEach(option => {
      if ((!skipDisabled || !option.disabled) && option._setSelected(isSelected)) {
        changedOptions.push(option);
      }
    });

    if (changedOptions.length) {
      this._reportValueChange();
    }

    return changedOptions;
  }

  // Note: This getter exists for backwards compatibility. The `_items` query list
  // cannot be named `options` as it will be picked up by the interactive list base.
  /** The option components contained within this selection-list. */
  get options(): QueryList<MatListOption> {
    return this._items;
  }

  /** Handles keydown events within the list. */
  _handleKeydown(event: KeyboardEvent) {
    const activeItem = this._keyManager.activeItem;

    if (
      (event.keyCode === ENTER || event.keyCode === SPACE) &&
      !this._keyManager.isTyping() &&
      activeItem &&
      !activeItem.disabled
    ) {
      event.preventDefault();
      activeItem._toggleOnInteraction();
    } else if (
      event.keyCode === A &&
      this.multiple &&
      !this._keyManager.isTyping() &&
      hasModifierKey(event, 'ctrlKey')
    ) {
      const shouldSelect = this.options.some(option => !option.disabled && !option.selected);
      event.preventDefault();
      this._emitChangeEvent(this._setAllOptionsSelected(shouldSelect, true));
    } else {
      this._keyManager.onKeydown(event);
    }
  }

  /** Handles focusout events within the list. */
  private _handleFocusout = () => {
    // Focus takes a while to update so we have to wrap our call in a timeout.
    setTimeout(() => {
      if (!this._containsFocus()) {
        this._resetActiveOption();
      }
    });
  };

  /** Handles focusin events within the list. */
  private _handleFocusin = (event: FocusEvent) => {
    const activeIndex = this._items
      .toArray()
      .findIndex(item => item._elementRef.nativeElement.contains(event.target as HTMLElement));

    if (activeIndex > -1) {
      this._setActiveOption(activeIndex);
    } else {
      this._resetActiveOption();
    }
  };

  /** Sets up the logic for maintaining the roving tabindex. */
  private _setupRovingTabindex() {
    this._keyManager = new FocusKeyManager(this._items)
      .withHomeAndEnd()
      .withTypeAhead()
      .withWrap()
      // Allow navigation to disabled items.
      .skipPredicate(() => false);

    // Set the initial focus.
    this._resetActiveOption();

    // Move the tabindex to the currently-focused list item.
    this._keyManager.change
      .pipe(takeUntil(this._destroyed))
      .subscribe(activeItemIndex => this._setActiveOption(activeItemIndex));

    // If the active item is removed from the list, reset back to the first one.
    this._items.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      const activeItem = this._keyManager.activeItem;

      if (!activeItem || !this._items.toArray().indexOf(activeItem)) {
        this._resetActiveOption();
      }
    });
  }

  /**
   * Sets an option as active.
   * @param index Index of the active option. If set to -1, no option will be active.
   */
  private _setActiveOption(index: number) {
    this._items.forEach((item, itemIndex) => item._setTabindex(itemIndex === index ? 0 : -1));
    this._keyManager.updateActiveItem(index);
  }

  /** Resets the active option to the first selected option. */
  private _resetActiveOption() {
    const activeItem =
      this._items.find(item => item.selected && !item.disabled) || this._items.first;
    this._setActiveOption(activeItem ? this._items.toArray().indexOf(activeItem) : -1);
  }

  /** Returns whether the focus is currently within the list. */
  private _containsFocus() {
    const activeElement = _getFocusedElementPierceShadowDom();
    return activeElement && this._element.nativeElement.contains(activeElement);
  }
}
