/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {BACKSPACE, TAB} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Self,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {
  CanUpdateErrorState,
  CanUpdateErrorStateCtor,
  ErrorStateMatcher,
  mixinErrorState,
} from '@angular/material/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {MatChipTextControl} from './chip-text-control';
import {merge, Observable, Subscription} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {MatChipEvent} from './chip';
import {MatChipRow} from './chip-row';
import {MatChipSet} from './chip-set';
import {GridFocusKeyManager} from './grid-focus-key-manager';


/** Change event object that is emitted when the chip grid value has changed. */
export class MatChipGridChange {
  constructor(
    /** Chip grid that emitted the event. */
    public source: MatChipGrid,
    /** Value of the chip grid when the event was emitted. */
    public value: any) { }
}

/**
 * Boilerplate for applying mixins to MatChipGrid.
 * @docs-private
 */
class MatChipGridBase extends MatChipSet {
  constructor(_elementRef: ElementRef,
              _changeDetectorRef: ChangeDetectorRef,
              public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              /** @docs-private */
              public ngControl: NgControl) {
    super(_elementRef, _changeDetectorRef);
  }
}
const _MatChipGridMixinBase: CanUpdateErrorStateCtor & typeof MatChipGridBase =
    mixinErrorState(MatChipGridBase);

/**
 * An extension of the MatChipSet component used with MatChipRow chips and
 * the matChipInputFor directive.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-grid',
  template: '<ng-content></ng-content>',
  styleUrls: ['chips.css'],
  inputs: ['tabIndex'],
  host: {
    'class': 'mat-mdc-chip-set mat-mdc-chip-grid mdc-chip-set',
    'role': 'grid',
    '[tabIndex]': 'tabIndex',
    // TODO: replace this binding with use of AriaDescriber
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-disabled]': 'disabled',
    '[class.mat-mdc-chip-list-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-required]': 'required',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(keydown)': '_keydown($event)',
    '[id]': '_uid',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatChipGrid}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipGrid extends _MatChipGridMixinBase implements AfterContentInit, AfterViewInit,
  CanUpdateErrorState, ControlValueAccessor, DoCheck, MatFormFieldControl<any>, OnDestroy {
  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  readonly controlType: string = 'mat-chip-grid';

  /** Subscription to blur changes in the chips. */
  private _chipBlurSubscription: Subscription | null;

  /** Subscription to focus changes in the chips. */
  private _chipFocusSubscription: Subscription | null;

  /** The chip input to add more chips */
  protected _chipInput: MatChipTextControl;

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

  /** The GridFocusKeyManager which handles focus. */
  _keyManager: GridFocusKeyManager;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get disabled(): boolean { return this.ngControl ? !!this.ngControl.disabled : this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._syncChipsState();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get id(): string { return this._chipInput.id; }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get empty(): boolean { return this._chipInput.empty && this._chips.length === 0; }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get placeholder(): string { return this._chipInput.placeholder; }

  /** Whether any chips or the matChipInput inside of this chip-grid has focus. */
  get focused(): boolean { return this._chipInput.focused || this._hasFocusedChip(); }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  protected _required: boolean = false;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean { return !this.empty || this.focused; }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get value(): any { return this._value; }
  set value(value: any) {
    this._value = value;
  }
  protected _value: any;

  /** Combined stream of all of the child chips' blur events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return merge(...this._chips.map(chip => chip._onBlur));
  }

  /** Combined stream of all of the child chips' focus events. */
  get chipFocusChanges(): Observable<MatChipEvent> {
    return merge(...this._chips.map(chip => chip._onFocus));
  }

  /** Emits when the chip grid value has been changed by the user. */
  @Output() readonly change: EventEmitter<MatChipGridChange> =
      new EventEmitter<MatChipGridChange>();

  /**
   * Emits whenever the raw value of the chip-grid changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MatChipRow, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true
  })
  _rowChips: QueryList<MatChipRow>;

  constructor(_elementRef: ElementRef,
              _changeDetectorRef: ChangeDetectorRef,
              @Optional() private _dir: Directionality,
              @Optional() _parentForm: NgForm,
              @Optional() _parentFormGroup: FormGroupDirective,
              _defaultErrorStateMatcher: ErrorStateMatcher,
              /** @docs-private */
              @Optional() @Self() public ngControl: NgControl) {
    super(_elementRef, _changeDetectorRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup,
      ngControl);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();
    this._initKeyManager();

    this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      this._updateTabIndex();

      // Check to see if we have a destroyed chip and need to refocus
      this._updateFocusForDestroyedChips();

      this.stateChanges.next();
    });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (!this._chipInput) {
      throw Error('mat-chip-grid must be used in combination with matChipInputFor.');
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stateChanges.complete();
  }

  /** Associates an HTML input element with this chip grid. */
  registerInput(inputElement: MatChipTextControl): void {
    this._chipInput = inputElement;
    this._setMdcClass('mdc-chip-set--input', true);
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  onContainerClick(event: MouseEvent) {
    if (!this._originatesFromChip(event) && !this.disabled) {
      this.focus();
    }
  }

  /**
   * Focuses the first chip in this chip grid, or the associated input when there
   * are no eligible chips.
   */
  focus(): void {
    if (this.disabled || this._chipInput.focused) {
      return;
    }

    if (this._chips.length > 0) {
      this._keyManager.setFirstCellActive();
    } else {
      this._focusInput();
    }

    this.stateChanges.next();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  setDescribedByIds(ids: string[]) { this._ariaDescribedby = ids.join(' '); }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  writeValue(value: any): void {
    // The user is responsible for creating the child chips, so we just store the value.
    this._value = value;
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

  /** When blurred, mark the field as touched when focus moved outside the chip grid. */
  _blur() {
    if (this.disabled) {
      return;
    }

    // Check whether the focus moved to chip input.
    // If the focus is not moved to chip input, mark the field as touched. If the focus moved
    // to chip input, do nothing.
    // Timeout is needed to wait for the focus() event trigger on chip input.
    setTimeout(() => {
      if (!this.focused) {
        this._keyManager.setActiveCell({row: -1, column: -1});
        this._propagateChanges();
        this._markAsTouched();
      }
    });
  }

  /**
   * Removes the `tabindex` from the chip grid and resets it back afterwards, allowing the
   * user to tab out of it. This prevents the grid from capturing focus and redirecting
   * it back to the first chip, creating a focus trap, if it user tries to tab away.
   */
  _allowFocusEscape() {
    if (this._chipInput.focused) {
      return;
    }

    if (this.tabIndex !== -1) {
      this.tabIndex = -1;

      setTimeout(() => {
        this.tabIndex = 0;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Handles custom keyboard events. */
  _keydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    // If they are on an empty input and hit backspace, focus the last chip
    if (event.keyCode === BACKSPACE && this._isEmptyInput(target)) {
      if (this._chips.length) {
        this._keyManager.setLastCellActive();
      }
      event.preventDefault();
    } else if (event.keyCode === TAB) {
      this._allowFocusEscape();
    } else {
      this._keyManager.onKeydown(event);
    }
    this.stateChanges.next();
  }

  /** Unsubscribes from all chip events. */
  protected _dropSubscriptions() {
    super._dropSubscriptions();
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
    this._listenToChipsFocus();
    this._listenToChipsBlur();
  }

  /** Initializes the key manager to manage focus. */
  private _initKeyManager() {
    this._keyManager = new GridFocusKeyManager(this._rowChips)
      .withDirectionality(this._dir ? this._dir.value : 'ltr');

    if (this._dir) {
      this._dir.change
        .pipe(takeUntil(this._destroyed))
        .subscribe(dir => this._keyManager.withDirectionality(dir));
    }
  }

   /** Subscribes to chip focus events. */
  private _listenToChipsFocus(): void {
    this._chipFocusSubscription = this.chipFocusChanges.subscribe((event: MatChipEvent) => {
      let chipIndex: number = this._chips.toArray().indexOf(event.chip);

      if (this._isValidIndex(chipIndex)) {
        this._keyManager.updateActiveCell({row: chipIndex, column: 0});
      }
    });
  }

  /** Subscribes to chip blur events. */
  private _listenToChipsBlur(): void {
    this._chipBlurSubscription = this.chipBlurChanges.subscribe(() => {
      this._blur();
      this.stateChanges.next();
    });
  }

 /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    const valueToEmit = this._chips.length ? this._chips.toArray().map(
      chip => chip.value) : fallbackValue;
    this._value = valueToEmit;
    this.change.emit(new MatChipGridChange(this, valueToEmit));
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /** Mark the field as touched */
  private _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  /** Checks whether an event comes from inside a chip element. */
  private _originatesFromChip(event: Event): boolean {
    let currentElement = event.target as HTMLElement | null;

    while (currentElement && currentElement !== this._elementRef.nativeElement) {
      if (currentElement.classList.contains('mdc-chip')) {
        return true;
      }

      currentElement = currentElement.parentElement;
    }

    return false;
  }

  /**
   * If the amount of chips changed, we need to focus the next closest chip.
   */
  private _updateFocusForDestroyedChips() {
    // Wait for chips to be updated in keyManager
    setTimeout(() => {
    // Move focus to the closest chip. If no other chips remain, focus the chip-grid itself.
    if (this._lastDestroyedChipIndex != null) {
      if (this._chips.length) {
        const newChipIndex = Math.min(this._lastDestroyedChipIndex, this._chips.length - 1);
        this._keyManager.setActiveCell({
          row: newChipIndex,
          column: this._keyManager.activeColumnIndex
        });
      } else {
        this.focus();
      }
    }

    this._lastDestroyedChipIndex = null;
    });
  }

  /** Focus input element. */
  private _focusInput() {
    this._chipInput.focus();
  }

  /** Returns true if element is an input with no value. */
  private _isEmptyInput(element: HTMLElement): boolean {
    if (element && element.nodeName.toLowerCase() === 'input') {
      let input = element as HTMLInputElement;
      return !input.value;
    }

    return false;
  }

  /**
   * Check the tab index as you should not be allowed to focus an empty grid.
   */
  protected _updateTabIndex(): void {
    // If we have 0 chips, we should not allow keyboard focus
    this.tabIndex = this._chips.length === 0 ? -1 : 0;
  }
}
