/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {MDCListAdapter, numbers as mdcListNumbers} from '@material/list';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {getInteractiveListAdapter, MatInteractiveListBase} from './interactive-list-base';
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
  extends MatInteractiveListBase<MatListOption>
  implements SelectionList, ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  private _multiple = true;
  private _initialized = false;

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

  /** The currently selected options. */
  selectedOptions = new SelectionModel<MatListOption>(this._multiple);

  /** View to model callback that should be called whenever the selected options change. */
  private _onChange: (value: any) => void = (_: any) => {};

  /** Keeps track of the currently-selected value. */
  _value: string[] | null;

  /** Emits when the list has been destroyed. */
  private _destroyed = new Subject<void>();

  /** View to model callback that should be called if the list or its options lost focus. */
  _onTouched: () => void = () => {};

  /** Whether the list has been destroyed. */
  private _isDestroyed: boolean;

  constructor(element: ElementRef<HTMLElement>, @Inject(DOCUMENT) document: any) {
    super(element, document);
    super._initWithAdapter(getSelectionListAdapter(this));
  }

  override ngAfterViewInit() {
    // Mark the selection list as initialized so that the `multiple`
    // binding can no longer be changed.
    this._initialized = true;

    // Update the options if a control value has been set initially. Note that this should happen
    // before watching for selection changes as otherwise we would sync options with MDC multiple
    // times as part of view initialization (also the foundation would not be initialized yet).
    if (this._value) {
      this._setOptionsFromValues(this._value);
    }

    // Start monitoring the selected options so that the list foundation can be
    // updated accordingly.
    this._watchForSelectionChange();

    // Initialize the list foundation, including the initial `layout()` invocation.
    super.ngAfterViewInit();

    // List options can be pre-selected using the `selected` input. We need to sync the selected
    // options after view initialization with the foundation so that focus can be managed
    // accordingly. Note that this needs to happen after the initial `layout()` call because the
    // list wouldn't know about multi-selection and throw.
    if (this._items.length !== 0) {
      this._syncSelectedOptionsWithFoundation();
      this._resetTabindexForItemsIfBlurred();
    }
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

  override ngOnDestroy() {
    super.ngOnDestroy();
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

  /**
   * Resets tabindex for all options and sets tabindex for the first selected option so that
   * it will become active when users tab into the selection-list. This will be a noop if the
   * list is currently focused as otherwise multiple options might become reachable through tab.
   * e.g. A user currently already focused an option. We set tabindex to a new option but the
   * focus on the current option does persist. Pressing `TAB` then might go to the other option
   * that received a tabindex. We can skip the reset here as the MDC foundation resets the
   * tabindex to the first selected option automatically once the current item is blurred.
   */
  private _resetTabindexForItemsIfBlurred() {
    // If focus is inside the list already, then we do not change the tab index of the list.
    // Changing it while an item is focused could cause multiple items to be reachable through
    // the tab key. The MDC list foundation will update the tabindex on blur to the appropriate
    // selected or focused item.
    if (!this._adapter.isFocusInsideList()) {
      this._resetTabindexToFirstSelectedOrFocusedItem();
    }
  }

  private _watchForSelectionChange() {
    // Sync external changes to the model back to the options.
    this.selectedOptions.changed.pipe(takeUntil(this._destroyed)).subscribe(event => {
      if (event.added) {
        for (let item of event.added) {
          item.selected = true;
        }
      }

      if (event.removed) {
        for (let item of event.removed) {
          item.selected = false;
        }
      }

      // Sync the newly selected options with the foundation. Also reset tabindex for all
      // items if the list is currently not focused. We do this so that always the first
      // selected list item is focused when users tab into the selection list.
      this._syncSelectedOptionsWithFoundation();
      this._resetTabindexForItemsIfBlurred();
    });
  }

  private _syncSelectedOptionsWithFoundation() {
    if (this._multiple) {
      this._foundation.setSelectedIndex(
        this.selectedOptions.selected.map(o => this._itemsArr.indexOf(o)),
      );
    } else {
      const selected = this.selectedOptions.selected[0];
      const index =
        selected === undefined ? mdcListNumbers.UNSET_INDEX : this._itemsArr.indexOf(selected);
      this._foundation.setSelectedIndex(index);
    }
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
}

// TODO: replace with class using inheritance once material-components-web/pull/6256 is available.
/** Gets a `MDCListAdapter` instance for the given selection list. */
function getSelectionListAdapter(list: MatSelectionList): MDCListAdapter {
  const baseAdapter = getInteractiveListAdapter(list);
  return {
    ...baseAdapter,
    hasRadioAtIndex(): boolean {
      // If multi selection is not used, we treat the list as a radio list so that
      // the MDC foundation does not keep track of multiple selected list options.
      // Note that we cannot use MDC's non-radio single selection mode as that one
      // will keep track of the selection state internally and we cannot update a
      // control model, or notify/update list-options on selection change. The radio
      // mode is similar to what we want but with support for change notification
      // (i.e. `setCheckedCheckboxOrRadioAtIndex`) while maintaining single selection.
      return !list.multiple;
    },
    hasCheckboxAtIndex() {
      // If multi selection is used, we treat the list as a checkbox list so that
      // the MDC foundation can keep track of multiple selected list options.
      return list.multiple;
    },
    isCheckboxCheckedAtIndex(index: number) {
      return list._itemsArr[index].selected;
    },
    setCheckedCheckboxOrRadioAtIndex(index: number, checked: boolean) {
      list._itemsArr[index].selected = checked;
    },
    setAttributeForElementIndex(index: number, attribute: string, value: string): void {
      // MDC list by default sets `aria-checked` for multi selection lists. We do not want to
      // use this as that signifies a bad accessibility experience. Instead, we change the
      // attribute update to `aria-selected` as that works best with list-options. See:
      // https://github.com/material-components/material-components-web/issues/6367.
      // TODO: Remove this once material-components-web#6367 is improved/fixed.
      if (attribute === 'aria-checked') {
        attribute = 'aria-selected';
      }

      baseAdapter.setAttributeForElementIndex(index, attribute, value);
    },
    notifySelectionChange(changedIndices: number[]): void {
      list._emitChangeEvent(changedIndices.map(index => list._itemsArr[index]));
    },
  };
}
