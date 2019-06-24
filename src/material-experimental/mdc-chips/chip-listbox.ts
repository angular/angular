/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusKeyManager} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {HOME, END} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MDCChipSetAdapter, MDCChipSetFoundation} from '@material/chips';
import {merge, Observable, Subscription} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

import {MatChip, MatChipEvent} from './chip';
import {MatChipOption, MatChipSelectionChange} from './chip-option';
import {MatChipSet} from './chip-set';


/** Change event object that is emitted when the chip listbox value has changed. */
export class MatChipListboxChange {
  constructor(
    /** Chip listbox that emitted the event. */
    public source: MatChipListbox,
    /** Value of the chip listbox when the event was emitted. */
    public value: any) { }
}

/**
 * Provider Expression that allows mat-chip-listbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatChipListbox),
  multi: true
};

/**
 * An extension of the MatChipSet component that supports chip selection.
 * Used with MatChipOption chips.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-listbox',
  template: '<ng-content></ng-content>',
  styleUrls: ['chips.css'],
  host: {
    'class': 'mat-mdc-chip-set mat-mdc-chip-listbox mdc-chip-set',
    'role': 'listbox',
    '[tabIndex]': 'disabled ? null : _tabIndex',
    // TODO: replace this binding with use of AriaDescriber
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-multiselectable]': 'multiple',
    '[class.mat-mdc-chip-list-disabled]': 'disabled',
    '[class.mat-mdc-chip-list-required]': 'required',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(keydown)': '_keydown($event)',
    '[id]': '_uid',
  },
  providers: [MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipListbox extends MatChipSet implements AfterContentInit, ControlValueAccessor {

  /** Subscription to selection changes in the chips. */
  private _chipSelectionSubscription: Subscription | null;

  /** Subscription to blur changes in the chips. */
  private _chipBlurSubscription: Subscription | null;

  /** Subscription to focus changes in the chips. */
  private _chipFocusSubscription: Subscription | null;

  /**
   * Implementation of the MDC chip-set adapter interface.
   * These methods are called by the chip set foundation.
   *
   * Overrides the base MatChipSet adapter to provide a setSelected method.
   */
  protected _chipSetAdapter: MDCChipSetAdapter = {
    hasClass: (className: string) => this._hasMdcClass(className),
    // No-op. We keep track of chips via ContentChildren, which will be updated when a chip is
    // removed.
    removeChip: () => {},
    setSelected: (chipId: string, selected: boolean) => {
      this._setSelected(chipId, selected);
    }
  };

  /** Tab index for the chip list. */
  _tabIndex = 0;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager<MatChip>;

  /**
   * Function when touched. Set as part of ControlValueAccessor implementation.
   * @docs-private
   */
  _onTouched = () => {};

  /**
   * Function when changed. Set as part of ControlValueAccessor implementation.
   * @docs-private
   */
  _onChange: (value: any) => void = () => {};

  /** Whether the user should be allowed to select multiple chips. */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
    this._updateMdcSelectionClasses();
    this._syncListboxProperties();
  }
  private _multiple: boolean = false;

  /** The array of selected chips inside the chip listbox. */
  get selected(): MatChipOption[] | MatChipOption  {
    const selectedChips = this._optionChips.toArray().filter(chip => chip.selected);
    return this.multiple ? selectedChips : selectedChips[0];
  }

  /**
   * Whether or not this chip listbox is selectable.
   *
   * When a chip listbox is not selectable, the selected states for all
   * the chips inside the chip listbox are always ignored.
   */
  @Input()
  get selectable(): boolean { return this._selectable; }
  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
    this._updateMdcSelectionClasses();
    this._syncListboxProperties();
  }
  protected _selectable: boolean = true;

  /**
   * A function to compare the option values with the selected values. The first argument
   * is a value from an option. The second is a value from the selection. A boolean
   * should be returned.
   */
  @Input()
  get compareWith(): (o1: any, o2: any) => boolean { return this._compareWith; }
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    this._compareWith = fn;
    this._initializeSelection();
  }
  private _compareWith = (o1: any, o2: any) => o1 === o2;


  /** Whether this chip listbox is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  protected _required: boolean = false;

  /** Combined stream of all of the child chips' selection change events. */
  get chipSelectionChanges(): Observable<MatChipSelectionChange> {
    return merge(...this._optionChips.map(chip => chip.selectionChange));
  }

  /** Combined stream of all of the child chips' focus events. */
  get chipFocusChanges(): Observable<MatChipEvent> {
    return merge(...this._chips.map(chip => chip._onFocus));
  }

  /** Combined stream of all of the child chips' blur events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return merge(...this._chips.map(chip => chip._onBlur));
  }

  /** The value of the listbox, which is the combined value of the selected chips. */
  get value(): any {
    if (Array.isArray(this.selected)) {
      return this.selected.map(chip => chip.value);
    } else {
      return this.selected ? this.selected.value : null;
    }
  }

  /** Event emitted when the selected chip listbox value has been changed by the user. */
  @Output() readonly change: EventEmitter<MatChipListboxChange> =
      new EventEmitter<MatChipListboxChange>();

  @ContentChildren(MatChipOption, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true
  })
  _optionChips: QueryList<MatChipOption>;

  constructor(protected _elementRef: ElementRef,
              _changeDetectorRef: ChangeDetectorRef) {
    super(_elementRef, _changeDetectorRef);
    // Reinitialize the foundation with our overridden adapter
    this._chipSetFoundation = new MDCChipSetFoundation(this._chipSetAdapter);
    this._updateMdcSelectionClasses();
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();
    this._initKeyManager();

    this._optionChips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      // Update listbox selectable/multiple properties on chips
      this._syncListboxProperties();

      // Reset chips selected/deselected status
      this._initializeSelection();

      // Check to see if we need to update our tab index
      this._updateTabIndex();

      // Check to see if we have a destroyed chip and need to refocus
      this._updateFocusForDestroyedChips();
    });
  }

  /**
   * Focuses the first selected chip in this chip listbox, or the first non-disabled chip when there
   * are no selected chips.
   */
  focus(): void {
    if (this.disabled) {
      return;
    }

    const firstSelectedChip = this._getFirstSelectedChip();

    if (firstSelectedChip) {
      const firstSelectedChipIndex = this._chips.toArray().indexOf(firstSelectedChip);
      this._keyManager.setActiveItem(firstSelectedChipIndex);
    } else if (this._chips.length > 0) {
      this._keyManager.setFirstItemActive();
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  writeValue(value: any): void {
    if (this._chips) {
      this._setSelectionByValue(value, false);
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /** Selects all chips with value. */
  _setSelectionByValue(value: any, isUserInput: boolean = true) {
    this._clearSelection();

    if (Array.isArray(value)) {
      value.forEach(currentValue => this._selectValue(currentValue, isUserInput));
    } else {
      const correspondingChip = this._selectValue(value, isUserInput);

      // Shift focus to the active item. Note that we shouldn't do this in multiple
      // mode, because we don't know what chip the user interacted with last.
      if (correspondingChip) {
        if (isUserInput) {
          this._keyManager.setActiveItem(correspondingChip);
        }
      }
    }
  }

  /** Selects or deselects a chip by id. */
  _setSelected(chipId: string, selected: boolean) {
    const chip = this._optionChips.find(c => c.id === chipId);
    if (chip && chip.selected != selected) {
      chip.toggleSelected(true);
    }
  }

  /** When blurred, marks the field as touched when focus moved outside the chip listbox. */
  _blur() {
    if (this.disabled) {
      return;
    }

    // Wait to see if focus moves to an indivdual chip.
    setTimeout(() => {
      if (!this.focused) {
        this._keyManager.setActiveItem(-1);
        this._propagateChanges();
        this._markAsTouched();
      }
    });
  }

  /**
   * Removes the `tabindex` from the chip listbox and resets it back afterwards, allowing the
   * user to tab out of it. This prevents the listbox from capturing focus and redirecting
   * it back to the first chip, creating a focus trap, if it user tries to tab away.
   */
  _allowFocusEscape() {
    if (this._tabIndex !== -1) {
      this._tabIndex = -1;

      setTimeout(() => {
        this._tabIndex = 0;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * Handles custom keyboard shortcuts, and passes other keyboard events to the keyboard manager.
   */
  _keydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    if (target && target.classList.contains('mdc-chip')) {
      if (event.keyCode === HOME) {
        this._keyManager.setFirstItemActive();
        event.preventDefault();
      } else if (event.keyCode === END) {
        this._keyManager.setLastItemActive();
        event.preventDefault();
      } else {
        this._keyManager.onKeydown(event);
      }
    }
  }

  /** Marks the field as touched */
  private _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
  }

 /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = this.value || fallbackValue;
    this.change.emit(new MatChipListboxChange(this, valueToEmit));
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initializes the chip listbox selection state to reflect any chips that were preselected.
   */
  private _initializeSelection() {
    this._optionChips.forEach(chip => {
      if (chip.selected) {
        this._chipSetFoundation.select(chip.id);
      }
    });
  }

  /**
   * Deselects every chip in the listbox.
   * @param skip Chip that should not be deselected.
   */
  private _clearSelection(skip?: MatChip): void {
    this._optionChips.forEach(chip => {
      if (chip !== skip) {
        chip.deselect();
      }
    });
  }

  /**
   * Finds and selects the chip based on its value.
   * @returns Chip that has the corresponding value.
   */
  private _selectValue(value: any, isUserInput: boolean = true): MatChip | undefined {

    const correspondingChip = this._optionChips.find(chip => {
      return chip.value != null && this._compareWith(chip.value,  value);
    });

    if (correspondingChip) {
      isUserInput ? correspondingChip.selectViaInteraction() : correspondingChip.select();
    }

    return correspondingChip;
  }

  /** Syncs the chip-listbox selection state with the individual chips. */
  private _syncListboxProperties() {
    if (this._optionChips) {
      // Defer setting the value in order to avoid the "Expression
      // has changed after it was checked" errors from Angular.
      Promise.resolve().then(() => {
        this._optionChips.forEach(chip => {
          chip._chipListMultiple = this.multiple;
          chip.chipListSelectable = this._selectable;
          chip._changeDetectorRef.markForCheck();
        });
      });
    }
  }

  /** Sets the mdc classes for single vs multi selection. */
  private _updateMdcSelectionClasses() {
    this._setMdcClass('mdc-chip-set--filter', this.selectable && this.multiple);
    this._setMdcClass('mdc-chip-set--choice', this.selectable && !this.multiple);
  }

  /** Initializes the key manager to manage focus. */
  private _initKeyManager() {
    this._keyManager = new FocusKeyManager<MatChip>(this._chips)
      .withWrap()
      .withVerticalOrientation()
      .withHorizontalOrientation('ltr');

    this._keyManager.tabOut.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._allowFocusEscape();
    });
  }

  /** Returns the first selected chip in this listbox, or undefined if no chips are selected. */
  private _getFirstSelectedChip(): MatChipOption | undefined {
    if (Array.isArray(this.selected)) {
      return this.selected.length ? this.selected[0] : undefined;
    } else {
      return this.selected;
    }
  }

  /** Unsubscribes from all chip events. */
  protected _dropSubscriptions() {
    super._dropSubscriptions();
    if (this._chipSelectionSubscription) {
      this._chipSelectionSubscription.unsubscribe();
      this._chipSelectionSubscription = null;
    }

    if (this._chipBlurSubscription) {
      this._chipBlurSubscription.unsubscribe();
      this._chipBlurSubscription = null;
    }

    if (this._chipFocusSubscription) {
      this._chipFocusSubscription.unsubscribe();
      this._chipFocusSubscription = null;
    }
  }

  /** Subscribes to events on the child chips. */
  protected _subscribeToChipEvents() {
    super._subscribeToChipEvents();
    this._listenToChipsSelection();
    this._listenToChipsFocus();
    this._listenToChipsBlur();
  }

  /** Subscribes to chip focus events. */
  private _listenToChipsFocus(): void {
    this._chipFocusSubscription = this.chipFocusChanges.subscribe((event: MatChipEvent) => {
      let chipIndex: number = this._chips.toArray().indexOf(event.chip);

      if (this._isValidIndex(chipIndex)) {
        this._keyManager.updateActiveItemIndex(chipIndex);
      }
    });
  }

  /** Subscribes to chip blur events. */
  private _listenToChipsBlur(): void {
    this._chipBlurSubscription = this.chipBlurChanges.subscribe(() => {
      this._blur();
    });
  }

  /** Subscribes to selection changes in the option chips. */
  private _listenToChipsSelection(): void {
    this._chipSelectionSubscription = this.chipSelectionChanges.subscribe(
      (chipSelectionChange: MatChipSelectionChange) => {
        this._chipSetFoundation.handleChipSelection(
          chipSelectionChange.source.id, chipSelectionChange.selected);
        if (chipSelectionChange.isUserInput) {
          this._propagateChanges();
        }
    });
  }

  /**
   * Check the tab index as you should not be allowed to focus an empty list.
   */
  protected _updateTabIndex(): void {
    // If we have 0 chips, we should not allow keyboard focus
    this._tabIndex = this._chips.length === 0 ? -1 : 0;
  }

  /**
   * If the amount of chips changed, we need to update the
   * key manager state and focus the next closest chip.
   */
  private _updateFocusForDestroyedChips() {
    // Move focus to the closest chip. If no other chips remain, focus the chip-listbox itself.
    if (this._lastDestroyedChipIndex != null) {
      if (this._chips.length) {
        const newChipIndex = Math.min(this._lastDestroyedChipIndex, this._chips.length - 1);
        this._keyManager.setActiveItem(newChipIndex);
      } else {
        this.focus();
      }
    }

    this._lastDestroyedChipIndex = null;
  }
}

