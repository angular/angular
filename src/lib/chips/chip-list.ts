/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusKeyManager} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {BACKSPACE, LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {startWith} from 'rxjs/operators/startWith';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {ErrorStateMatcher, mixinErrorState, CanUpdateErrorState} from '@angular/material/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {Subscription} from 'rxjs/Subscription';
import {MatChip, MatChipEvent, MatChipSelectionChange} from './chip';
import {MatChipInput} from './chip-input';

// Boilerplate for applying mixins to MatChipList.
/** @docs-private */
export class MatChipListBase {
  constructor(public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              public ngControl: NgControl) {}
}
export const _MatChipListMixinBase = mixinErrorState(MatChipListBase);


// Increasing integer for generating unique ids for chip-list components.
let nextUniqueId = 0;

/** Change event object that is emitted when the chip list value has changed. */
export class MatChipListChange {
  constructor(
    /** Chip list that emitted the event. */
    public source: MatChipList,
    /** Value of the chip list when the event was emitted. */
    public value: any) { }
}


/**
 * A material design chips component (named ChipList for it's similarity to the List component).
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-list',
  template: `<div class="mat-chip-list-wrapper"><ng-content></ng-content></div>`,
  exportAs: 'matChipList',
  host: {
    '[attr.tabindex]': '_tabIndex',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.role]': 'role',
    '[class.mat-chip-list-disabled]': 'disabled',
    '[class.mat-chip-list-invalid]': 'errorState',
    '[class.mat-chip-list-required]': 'required',
    '[attr.aria-orientation]': 'ariaOrientation',
    'class': 'mat-chip-list',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(keydown)': '_keydown($event)'
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatChipList}],
  styleUrls: ['chips.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatChipList extends _MatChipListMixinBase implements MatFormFieldControl<any>,
    ControlValueAccessor, AfterContentInit, DoCheck, OnInit, OnDestroy, CanUpdateErrorState {
  readonly controlType = 'mat-chip-list';

  /** When a chip is destroyed, we track the index so we can focus the appropriate next chip. */
  protected _lastDestroyedIndex: number|null = null;

  /** Track which chips we're listening to for focus/destruction. */
  protected _chipSet: WeakMap<MatChip, boolean> = new WeakMap();

  /** Subscription to tabbing out from the chip list. */
  private _tabOutSubscription = Subscription.EMPTY;

  /** Subscription to changes in the chip list. */
  private _changeSubscription: Subscription;

  /** Subscription to focus changes in the chips. */
  private _chipFocusSubscription: Subscription|null;

  /** Subscription to blur changes in the chips. */
  private _chipBlurSubscription: Subscription|null;

  /** Subscription to selection changes in chips. */
  private _chipSelectionSubscription: Subscription|null;

  /** Subscription to remove changes in chips. */
  private _chipRemoveSubscription: Subscription|null;

  /** Whether or not the chip is selectable. */
  protected _selectable: boolean = true;

  /** Whether the component is in multiple selection mode. */
  private _multiple: boolean = false;

  /** The chip input to add more chips */
  protected _chipInput: MatChipInput;

  /** Id of the chip list */
  protected _id: string;

  /** Uid of the chip list */
  protected _uid: string = `mat-chip-list-${nextUniqueId++}`;

  /** Whether this is required */
  protected _required: boolean = false;

  /** Whether this is disabled */
  protected _disabled: boolean = false;

  protected _value: any;

  /** Placeholder for the chip list. Alternatively, placeholder can be set on MatChipInput */
  protected _placeholder: string;

  /** The aria-describedby attribute on the chip list for improved a11y. */
  _ariaDescribedby: string;

  /** Tab index for the chip list. */
  _tabIndex = 0;

  /**
   * User defined tab index.
   * When it is not null, use user defined tab index. Otherwise use _tabIndex
   */
  _userTabIndex: number | null = null;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager<MatChip>;

  /** Function when touched */
  _onTouched = () => {};

  /** Function when changed */
  _onChange: (value: any) => void = () => {};

  _selectionModel: SelectionModel<MatChip>;

  /** Comparison function to specify which option is displayed. Defaults to object equality. */
  private _compareWith = (o1: any, o2: any) => o1 === o2;

  /** The array of selected chips inside chip list. */
  get selected(): MatChip[] | MatChip {
    return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
  }

  get role(): string|null {
    return this.empty ? null : 'listbox';
  }

  /** An object used to control when error messages are shown. */
  @Input() errorStateMatcher: ErrorStateMatcher;

  /** Whether the user should be allowed to select multiple chips. */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }

  /**
   * A function to compare the option values with the selected values. The first argument
   * is a value from an option. The second is a value from the selection. A boolean
   * should be returned.
   */
  @Input()
  get compareWith() { return this._compareWith; }
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    this._compareWith = fn;
    if (this._selectionModel) {
      // A different comparator means the selection could change.
      this._initializeSelection();
    }
  }

  /** Required for FormFieldControl */
  @Input()
  get value() { return this._value; }
  set value(newValue: any) {
    this.writeValue(newValue);
    this._value = newValue;
  }

  /** Required for FormFieldControl. The ID of the chip list */
  @Input()
  set id(value: string) {
    this._id = value;
    this.stateChanges.next();
  }
  get id() { return this._id || this._uid; }

  /** Required for FormFieldControl. Whether the chip list is required. */
  @Input()
  set required(value: any) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  get required() {
    return this._required;
  }

  /** For FormFieldControl. Use chip input's placholder if there's a chip input */
  @Input()
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  get placeholder() {
    return this._chipInput ? this._chipInput.placeholder : this._placeholder;
  }

  /** Whether any chips or the matChipInput inside of this chip-list has focus. */
  get focused(): boolean {
    return this.chips.some(chip => chip._hasFocus) ||
      (this._chipInput && this._chipInput.focused);
  }

  /** Whether this chip-list contains no chips and no matChipInput. */
  get empty(): boolean {
    return (!this._chipInput || this._chipInput.empty) && this.chips.length === 0;
  }

  get shouldLabelFloat(): boolean {
    return !this.empty || this.focused;
  }

  /** Whether this chip-list is disabled. */
  @Input()
  get disabled() { return this.ngControl ? this.ngControl.disabled : this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }


  /** Orientation of the chip list. */
  @Input('aria-orientation') ariaOrientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Whether or not this chip is selectable. When a chip is not selectable,
   * its selected state is always ignored.
   */
  @Input()
  get selectable(): boolean { return this._selectable; }
  set selectable(value: boolean) { this._selectable = coerceBooleanProperty(value); }

  @Input()
  set tabIndex(value: number) {
    this._userTabIndex = value;
    this._tabIndex = value;
  }

  /** Combined stream of all of the child chips' selection change events. */
  get chipSelectionChanges(): Observable<MatChipSelectionChange> {
    return merge(...this.chips.map(chip => chip.selectionChange));
  }

  /** Combined stream of all of the child chips' focus change events. */
  get chipFocusChanges(): Observable<MatChipEvent> {
    return merge(...this.chips.map(chip => chip._onFocus));
  }

  /** Combined stream of all of the child chips' blur change events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return merge(...this.chips.map(chip => chip._onBlur));
  }

  /** Combined stream of all of the child chips' remove change events. */
  get chipRemoveChanges(): Observable<MatChipEvent> {
    return merge(...this.chips.map(chip => chip.destroy));
  }

  /** Event emitted when the selected chip list value has been changed by the user. */
  @Output() change: EventEmitter<MatChipListChange> = new EventEmitter<MatChipListChange>();

  /**
   * Event that emits whenever the raw value of the chip-list changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() valueChange = new EventEmitter<any>();

  /** The chip components contained within this chip list. */
  @ContentChildren(MatChip) chips: QueryList<MatChip>;

  constructor(protected _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              @Optional() private _dir: Directionality,
              @Optional() _parentForm: NgForm,
              @Optional() _parentFormGroup: FormGroupDirective,
              _defaultErrorStateMatcher: ErrorStateMatcher,
              @Optional() @Self() public ngControl: NgControl) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit(): void {

    this._keyManager = new FocusKeyManager<MatChip>(this.chips).withWrap();

    // Prevents the chip list from capturing focus and redirecting
    // it back to the first chip when the user tabs out.
    this._tabOutSubscription = this._keyManager.tabOut.subscribe(() => {
      this._tabIndex = -1;
      setTimeout(() => this._tabIndex = this._userTabIndex || 0);
    });

    // When the list changes, re-subscribe
    this._changeSubscription = this.chips.changes.pipe(startWith(null)).subscribe(() => {
      this._resetChips();

      // Reset chips selected/deselected status
      this._initializeSelection();

      // Check to see if we need to update our tab index
      this._updateTabIndex();

      // Check to see if we have a destroyed chip and need to refocus
      this._updateFocusForDestroyedChips();
    });
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MatChip>(this.multiple, undefined, false);
    this.stateChanges.next();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  ngOnDestroy(): void {
    this._tabOutSubscription.unsubscribe();

    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
    }
    this._dropSubscriptions();
    this.stateChanges.complete();
  }


  /** Associates an HTML input element with this chip list. */
  registerInput(inputElement: MatChipInput) {
    this._chipInput = inputElement;
  }

  // Implemented as part of MatFormFieldControl.
  setDescribedByIds(ids: string[]) { this._ariaDescribedby = ids.join(' '); }

  // Implemented as part of ControlValueAccessor
  writeValue(value: any): void {
    if (this.chips) {
      this._setSelectionByValue(value, false);
    }
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  // Implemented as part of ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this._elementRef.nativeElement.disabled = disabled;
    this.stateChanges.next();
  }

  onContainerClick() {
    this.focus();
  }

  /**
   * Focuses the the first non-disabled chip in this chip list, or the associated input when there
   * are no eligible chips.
   */
  focus() {
    // TODO: ARIA says this should focus the first `selected` chip if any are selected.
    // Focus on first element if there's no chipInput inside chip-list
    if (this._chipInput && this._chipInput.focused) {
      // do nothing
    } else if (this.chips.length > 0) {
      this._keyManager.setFirstItemActive();
      this.stateChanges.next();
    } else {
      this._focusInput();
      this.stateChanges.next();
    }
  }

  /** Attempt to focus an input if we have one. */
  _focusInput() {
    if (this._chipInput) {
      this._chipInput.focus();
    }
  }

  /**
   * Pass events to the keyboard manager. Available here for tests.
   */
  _keydown(event: KeyboardEvent) {
    let code = event.keyCode;
    let target = event.target as HTMLElement;
    let isInputEmpty = this._isInputEmpty(target);
    let isRtl = this._dir && this._dir.value == 'rtl';

    let isPrevKey = (code === (isRtl ? RIGHT_ARROW : LEFT_ARROW));
    let isNextKey = (code === (isRtl ? LEFT_ARROW : RIGHT_ARROW));
    let isBackKey = code === BACKSPACE;
    // If they are on an empty input and hit backspace, focus the last chip
    if (isInputEmpty && isBackKey) {
      this._keyManager.setLastItemActive();
      event.preventDefault();
      return;
    }

    // If they are on a chip, check for space/left/right, otherwise pass to our key manager (like
    // up/down keys)
    if (target && target.classList.contains('mat-chip')) {
      if (isPrevKey) {
        this._keyManager.setPreviousItemActive();
        event.preventDefault();
      } else if (isNextKey) {
        this._keyManager.setNextItemActive();
        event.preventDefault();
      } else {
        this._keyManager.onKeydown(event);
      }
    }
    this.stateChanges.next();
  }


  /**
   * Check the tab index as you should not be allowed to focus an empty list.
   */
  protected _updateTabIndex(): void {
    // If we have 0 chips, we should not allow keyboard focus
    this._tabIndex = this._userTabIndex || (this.chips.length === 0 ? -1 : 0);
  }

  /**
   * Update key manager's active item when chip is deleted.
   * If the deleted chip is the last chip in chip list, focus the new last chip.
   * Otherwise focus the next chip in the list.
   * Save `_lastDestroyedIndex` so we can set the correct focus.
   */
  protected _updateKeyManager(chip: MatChip) {
    let chipIndex: number = this.chips.toArray().indexOf(chip);
    if (this._isValidIndex(chipIndex)) {
      if (chip._hasFocus) {
        // Check whether the chip is not the last item
        if (chipIndex < this.chips.length - 1) {
          this._keyManager.setActiveItem(chipIndex);
        } else if (chipIndex - 1 >= 0) {
          this._keyManager.setActiveItem(chipIndex - 1);
        }
      }
      if (this._keyManager.activeItemIndex === chipIndex) {
        this._lastDestroyedIndex = chipIndex;
      }
    }
  }

  /**
   * Checks to see if a focus chip was recently destroyed so that we can refocus the next closest
   * one.
   */
  protected _updateFocusForDestroyedChips() {
    let chipsArray = this.chips;

    if (this._lastDestroyedIndex != null && chipsArray.length > 0) {
      // Check whether the destroyed chip was the last item
      const newFocusIndex = Math.min(this._lastDestroyedIndex, chipsArray.length - 1);
      this._keyManager.setActiveItem(newFocusIndex);
      let focusChip = this._keyManager.activeItem;
      // Focus the chip
      if (focusChip) {
        focusChip.focus();
      }
    }

    // Reset our destroyed index
    this._lastDestroyedIndex = null;
  }

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of chips.
   */
  private _isValidIndex(index: number): boolean {
    return index >= 0 && index < this.chips.length;
  }

  private _isInputEmpty(element: HTMLElement): boolean {
    if (element && element.nodeName.toLowerCase() === 'input') {
      let input = element as HTMLInputElement;
      return !input.value;
    }

    return false;
  }

  _setSelectionByValue(value: any, isUserInput: boolean = true) {
    this._clearSelection();
    this.chips.forEach(chip => chip.deselect());

    if (Array.isArray(value)) {
      value.forEach(currentValue => this._selectValue(currentValue, isUserInput));
      this._sortValues();
    } else {
      const correspondingChip = this._selectValue(value, isUserInput);

      // Shift focus to the active item. Note that we shouldn't do this in multiple
      // mode, because we don't know what chip the user interacted with last.
      if (correspondingChip) {
        const correspondingChipIndex = this.chips.toArray().indexOf(correspondingChip);

        if (isUserInput) {
          this._keyManager.setActiveItem(correspondingChipIndex);
        } else {
          this._keyManager.updateActiveItemIndex(correspondingChipIndex);
        }

      }
    }
  }

  /**
   * Finds and selects the chip based on its value.
   * @returns Chip that has the corresponding value.
   */
  private _selectValue(value: any, isUserInput: boolean = true): MatChip | undefined {

    const correspondingChip = this.chips.find(chip => {
      return chip.value != null && this._compareWith(chip.value,  value);
    });

    if (correspondingChip) {
      isUserInput ? correspondingChip.selectViaInteraction() : correspondingChip.select();
      this._selectionModel.select(correspondingChip);
    }

    return correspondingChip;
  }

  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (this.ngControl || this._value) {
        this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value, false);
        this.stateChanges.next();
      }
    });
  }

  /**
   * Deselects every chip in the list.
   * @param skip Chip that should not be deselected.
   */
  private _clearSelection(skip?: MatChip): void {
    this._selectionModel.clear();
    this.chips.forEach(chip => {
      if (chip !== skip) {
        chip.deselect();
      }
    });
    this.stateChanges.next();
  }

  /**
   * Sorts the model values, ensuring that they keep the same
   * order that they have in the panel.
   */
  private _sortValues(): void {
    if (this._multiple) {
      this._selectionModel.clear();

      this.chips.forEach(chip => {
        if (chip.selected) {
          this._selectionModel.select(chip);
        }
      });
      this.stateChanges.next();
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = null;

    if (Array.isArray(this.selected)) {
      valueToEmit = this.selected.map(chip => chip.value);
    } else {
      valueToEmit = this.selected ? this.selected.value : fallbackValue;
    }
    this._value = valueToEmit;
    this.change.emit(new MatChipListChange(this, valueToEmit));
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /** When blurred, mark the field as touched when focus moved outside the chip list. */
  _blur() {
    if (!this.disabled) {
      if (this._chipInput) {
        // If there's a chip input, we should check whether the focus moved to chip input.
        // If the focus is not moved to chip input, mark the field as touched. If the focus moved
        // to chip input, do nothing.
        // Timeout is needed to wait for the focus() event trigger on chip input.
        setTimeout(() => {
          if (!this.focused) {
            this._markAsTouched();
          }
        });
      } else {
        // If there's no chip input, then mark the field as touched.
        this._markAsTouched();
      }
    }
  }

  /** Mark the field as touched */
  _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  private _resetChips() {
    this._dropSubscriptions();
    this._listenToChipsFocus();
    this._listenToChipsSelection();
    this._listenToChipsRemoved();
  }


  private _dropSubscriptions() {
    if (this._chipFocusSubscription) {
      this._chipFocusSubscription.unsubscribe();
      this._chipFocusSubscription = null;
    }

    if (this._chipBlurSubscription) {
      this._chipBlurSubscription.unsubscribe();
      this._chipBlurSubscription = null;
    }

    if (this._chipSelectionSubscription) {
      this._chipSelectionSubscription.unsubscribe();
      this._chipSelectionSubscription = null;
    }
  }

  /** Listens to user-generated selection events on each chip. */
  private _listenToChipsSelection(): void {
    this._chipSelectionSubscription = this.chipSelectionChanges.subscribe(event => {
      event.source.selected
        ? this._selectionModel.select(event.source)
        : this._selectionModel.deselect(event.source);

      // For single selection chip list, make sure the deselected value is unselected.
      if (!this.multiple) {
        this.chips.forEach(chip => {
          if (!this._selectionModel.isSelected(chip) && chip.selected) {
            chip.deselect();
          }
        });
      }

      if (event.isUserInput) {
        this._propagateChanges();
      }
    });
  }

  /** Listens to user-generated selection events on each chip. */
  private _listenToChipsFocus(): void {
    this._chipFocusSubscription = this.chipFocusChanges.subscribe(event => {
      let chipIndex: number = this.chips.toArray().indexOf(event.chip);

      if (this._isValidIndex(chipIndex)) {
        this._keyManager.updateActiveItemIndex(chipIndex);
      }
      this.stateChanges.next();
    });

    this._chipBlurSubscription = this.chipBlurChanges.subscribe(_ => {
      this._blur();
      this.stateChanges.next();
    });
  }

  private _listenToChipsRemoved(): void {
    this._chipRemoveSubscription = this.chipRemoveChanges.subscribe((event) => {
      this._updateKeyManager(event.chip);
    });
  }
}
