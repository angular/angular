/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {TAB} from '@angular/cdk/keycodes';
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
  Inject,
  Input,
  OnDestroy,
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
  NgForm,
  Validators,
} from '@angular/forms';
import {DOCUMENT} from '@angular/common';
import {
  CanUpdateErrorState,
  ErrorStateMatcher,
  mixinErrorState,
} from '@angular/material-experimental/mdc-core';
import {MatFormFieldControl} from '@angular/material-experimental/mdc-form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatChipTextControl} from './chip-text-control';
import {Observable, Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {MatChipEvent} from './chip';
import {MatChipRow} from './chip-row';
import {MatChipSet} from './chip-set';

/** Change event object that is emitted when the chip grid value has changed. */
export class MatChipGridChange {
  constructor(
    /** Chip grid that emitted the event. */
    public source: MatChipGrid,
    /** Value of the chip grid when the event was emitted. */
    public value: any,
  ) {}
}

/**
 * Boilerplate for applying mixins to MatChipGrid.
 * @docs-private
 */
class MatChipGridBase extends MatChipSet {
  /**
   * Emits whenever the component state changes and should cause the parent
   * form-field to update. Implemented as part of `MatFormFieldControl`.
   * @docs-private
   */
  readonly stateChanges = new Subject<void>();

  constructor(
    liveAnnouncer: LiveAnnouncer,
    document: any,
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    /**
     * Form control bound to the component.
     * Implemented as part of `MatFormFieldControl`.
     * @docs-private
     */
    public ngControl: NgControl,
  ) {
    super(liveAnnouncer, document, elementRef, changeDetectorRef);
  }
}
const _MatChipGridMixinBase = mixinErrorState(MatChipGridBase);

/**
 * An extension of the MatChipSet component used with MatChipRow chips and
 * the matChipInputFor directive.
 */
@Component({
  selector: 'mat-chip-grid',
  template: `
    <span class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['chip-set.css'],
  inputs: ['tabIndex'],
  host: {
    'class': 'mat-mdc-chip-set mat-mdc-chip-grid mdc-evolution-chip-set',
    '[attr.role]': 'role',
    '[tabIndex]': '_chips && _chips.length === 0 ? -1 : tabIndex',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-disabled]': 'disabled',
    '[class.mat-mdc-chip-list-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-required]': 'required',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(keydown)': '_keydown($event)',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatChipGrid}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipGrid
  extends _MatChipGridMixinBase
  implements
    AfterContentInit,
    AfterViewInit,
    CanUpdateErrorState,
    ControlValueAccessor,
    DoCheck,
    MatFormFieldControl<any>,
    OnDestroy
{
  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  readonly controlType: string = 'mat-chip-grid';

  /** The chip input to add more chips */
  protected _chipInput: MatChipTextControl;

  protected override _defaultRole = 'grid';

  /**
   * List of element ids to propagate to the chipInput's aria-describedby attribute.
   */
  private _ariaDescribedbyIds: string[] = [];

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

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  override get disabled(): boolean {
    return this.ngControl ? !!this.ngControl.disabled : this._disabled;
  }
  override set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._syncChipsState();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get id(): string {
    return this._chipInput.id;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  override get empty(): boolean {
    return (
      (!this._chipInput || this._chipInput.empty) && (!this._chips || this._chips.length === 0)
    );
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get placeholder(): string {
    return this._chipInput ? this._chipInput.placeholder : this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  protected _placeholder: string;

  /** Whether any chips or the matChipInput inside of this chip-grid has focus. */
  override get focused(): boolean {
    return this._chipInput.focused || this._hasFocusedChip();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  protected _required: boolean | undefined;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    return !this.empty || this.focused;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    this._value = value;
  }
  protected _value: any[] = [];

  /** An object used to control when error messages are shown. */
  @Input() override errorStateMatcher: ErrorStateMatcher;

  /** Combined stream of all of the child chips' blur events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip._onBlur);
  }

  /** Combined stream of all of the child chips' focus events. */
  get chipFocusChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip._onFocus);
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
    descendants: true,
  })
  override _chips: QueryList<MatChipRow>;

  constructor(
    liveAnnouncer: LiveAnnouncer,
    @Inject(DOCUMENT) document: any,
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() ngControl: NgControl,
  ) {
    super(
      liveAnnouncer,
      document,
      elementRef,
      changeDetectorRef,
      defaultErrorStateMatcher,
      parentForm,
      parentFormGroup,
      ngControl,
    );
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();

    this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      // Check to see if we have a destroyed chip and need to refocus
      this._updateFocusForDestroyedChips();
      this.stateChanges.next();
    });

    this.chipBlurChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._blur();
      this.stateChanges.next();
    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (!this._chipInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.stateChanges.complete();
  }

  /** Associates an HTML input element with this chip grid. */
  registerInput(inputElement: MatChipTextControl): void {
    this._chipInput = inputElement;
    this._chipInput.setDescribedByIds(this._ariaDescribedbyIds);
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  onContainerClick(event: MouseEvent) {
    if (!this.disabled && !this._originatesFromChip(event)) {
      this.focus();
    }
  }

  /**
   * Focuses the first chip in this chip grid, or the associated input when there
   * are no eligible chips.
   */
  override focus(): void {
    if (this.disabled || this._chipInput.focused) {
      return;
    }

    if (this._chips.length > 0) {
      // MDC sets the tabindex directly on the DOM node when the user is navigating which means
      // that we may end up with a `0` value from a previous interaction. We reset it manually
      // here to ensure that the state is correct.
      this._chips.forEach(chip => chip.primaryAction._updateTabindex(-1));
      this._chips.first.focus();
    } else {
      // Delay until the next tick, because this can cause a "changed after checked"
      // error if the input does something on focus (e.g. opens an autocomplete).
      Promise.resolve().then(() => this._chipInput.focus());
    }

    this.stateChanges.next();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    // We must keep this up to date to handle the case where ids are set
    // before the chip input is registered.
    this._ariaDescribedbyIds = ids;

    if (this._chipInput) {
      // Use a setTimeout in case this is being run during change detection
      // and the chip input has already determined its host binding for
      // aria-describedBy.
      setTimeout(() => {
        this._chipInput.setDescribedByIds(ids);
      }, 0);
    }
  }

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

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
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
  protected override _allowFocusEscape() {
    if (!this._chipInput.focused) {
      super._allowFocusEscape();
    }
  }

  /** Handles custom keyboard events. */
  _keydown(event: KeyboardEvent) {
    if (event.keyCode === TAB && (event.target as HTMLElement).id !== this._chipInput.id) {
      this._allowFocusEscape();
    }

    this.stateChanges.next();
  }

  _focusLastChip() {
    if (this._chips.length) {
      this._chips.last.primaryAction.focus();
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(): void {
    const valueToEmit = this._chips.length ? this._chips.toArray().map(chip => chip.value) : [];
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

  /**
   * If the amount of chips changed, we need to focus the next closest chip.
   */
  private _updateFocusForDestroyedChips() {
    // Move focus to the closest chip. If no other chips remain, focus the chip-grid itself.
    if (this._lastDestroyedChipIndex != null) {
      if (this._chips.length) {
        const newChipIndex = Math.min(this._lastDestroyedChipIndex, this._chips.length - 1);
        this._chips.toArray()[newChipIndex].focus();
      } else {
        this.focus();
      }
    }

    this._lastDestroyedChipIndex = null;
  }
}
