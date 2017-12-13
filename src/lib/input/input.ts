/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {getSupportedInputTypes, Platform} from '@angular/cdk/platform';
import {
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import {FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {ErrorStateMatcher, mixinErrorState, CanUpdateErrorState} from '@angular/material/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {Subject} from 'rxjs/Subject';
import {getMatInputUnsupportedTypeError} from './input-errors';
import {MAT_INPUT_VALUE_ACCESSOR} from './input-value-accessor';


// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const MAT_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];

let nextUniqueId = 0;

// Boilerplate for applying mixins to MatInput.
/** @docs-private */
export class MatInputBase {
  constructor(public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              public ngControl: NgControl) {}
}
export const _MatInputMixinBase = mixinErrorState(MatInputBase);

/** Directive that allows a native input to work inside a `MatFormField`. */
@Directive({
  selector: `input[matInput], textarea[matInput]`,
  exportAs: 'matInput',
  host: {
    'class': 'mat-input-element mat-form-field-autofill-control',
    '[class.mat-input-server]': '_isServer',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '[placeholder]': 'placeholder',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[readonly]': 'readonly',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required.toString()',
    '(blur)': '_focusChanged(false)',
    '(focus)': '_focusChanged(true)',
    '(input)': '_onInput()',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatInput}],
})
export class MatInput extends _MatInputMixinBase implements MatFormFieldControl<any>, OnChanges,
    OnDestroy, DoCheck, CanUpdateErrorState {
  /** Variables used as cache for getters and setters. */
  protected _type = 'text';
  protected _disabled = false;
  protected _required = false;
  protected _id: string;
  protected _uid = `mat-input-${nextUniqueId++}`;
  protected _previousNativeValue: any;
  private _readonly = false;
  private _inputValueAccessor: {value: any};

  /** Whether the input is focused. */
  focused = false;

  /** The aria-describedby attribute on the input for improved a11y. */
  _ariaDescribedby: string;

  /** Whether the component is being rendered on the server. */
  _isServer = false;

  /**
   * Stream that emits whenever the state of the input changes such that the wrapping `MatFormField`
   * needs to run change detection.
   */
  stateChanges = new Subject<void>();

  /** A name for this control that can be used by `mat-form-field`. */
  controlType = 'mat-input';

  /** Whether the element is disabled. */
  @Input()
  get disabled() { return this.ngControl ? this.ngControl.disabled : this._disabled; }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  /** Unique id of the element. */
  @Input()
  get id() { return this._id; }
  set id(value: string) { this._id = value || this._uid; }

  /** Placeholder attribute of the element. */
  @Input() placeholder: string = '';

  /** Whether the element is required. */
  @Input()
  get required() { return this._required; }
  set required(value: any) { this._required = coerceBooleanProperty(value); }

  /** Input type of the element. */
  @Input()
  get type() { return this._type; }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();

    // When using Angular inputs, developers are no longer able to set the properties on the native
    // input element. To ensure that bindings for `type` work, we need to sync the setter
    // with the native property. Textarea elements don't support the type property or attribute.
    if (!this._isTextarea() && getSupportedInputTypes().has(this._type)) {
      this._elementRef.nativeElement.type = this._type;
    }
  }

  /** An object used to control when error messages are shown. */
  @Input() errorStateMatcher: ErrorStateMatcher;

  /** The input element's value. */
  @Input()
  get value(): any { return this._inputValueAccessor.value; }
  set value(value: any) {
    if (value !== this.value) {
      this._inputValueAccessor.value = value;
      this.stateChanges.next();
    }
  }

  /** Whether the element is readonly. */
  @Input()
  get readonly() { return this._readonly; }
  set readonly(value: any) { this._readonly = coerceBooleanProperty(value); }

  protected _neverEmptyInputTypes = [
    'date',
    'datetime',
    'datetime-local',
    'month',
    'time',
    'week'
  ].filter(t => getSupportedInputTypes().has(t));

  constructor(protected _elementRef: ElementRef,
              protected _platform: Platform,
              @Optional() @Self() public ngControl: NgControl,
              @Optional() _parentForm: NgForm,
              @Optional() _parentFormGroup: FormGroupDirective,
              _defaultErrorStateMatcher: ErrorStateMatcher,
              @Optional() @Self() @Inject(MAT_INPUT_VALUE_ACCESSOR) inputValueAccessor: any) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    // If no input value accessor was explicitly specified, use the element as the input value
    // accessor.
    this._inputValueAccessor = inputValueAccessor || this._elementRef.nativeElement;

    this._previousNativeValue = this.value;

    // Force setter to be called in case id was not specified.
    this.id = this.id;

    // On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
    // key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
    // exists on iOS, we only bother to install the listener on iOS.
    if (_platform.IOS) {
      _elementRef.nativeElement.addEventListener('keyup', (event: Event) => {
        let el = event.target as HTMLInputElement;
        if (!el.value && !el.selectionStart && !el.selectionEnd) {
          // Note: Just setting `0, 0` doesn't fix the issue. Setting `1, 1` fixes it for the first
          // time that you type text and then hold delete. Toggling to `1, 1` and then back to
          // `0, 0` seems to completely fix it.
          el.setSelectionRange(1, 1);
          el.setSelectionRange(0, 0);
        }
      });
    }

    this._isServer = !this._platform.isBrowser;
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    } else {
      // When the input isn't used together with `@angular/forms`, we need to check manually for
      // changes to the native `value` property in order to update the floating label.
      this._dirtyCheckNativeValue();
    }
  }

  focus() { this._elementRef.nativeElement.focus(); }

  /** Callback for the cases where the focused state of the input changes. */
  _focusChanged(isFocused: boolean) {
    if (isFocused !== this.focused && !this.readonly) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  _onInput() {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
    // It's necessary that Angular recognizes the value change, because when floatingLabel
    // is set to false and Angular forms aren't used, the placeholder won't recognize the
    // value changes and will not disappear.
    // Listening to the input event wouldn't be necessary when the input is using the
    // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
  }

  /** Does some manual dirty checking on the native input `value` property. */
  protected _dirtyCheckNativeValue() {
    const newValue = this.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  /** Make sure the input is a supported type. */
  protected _validateType() {
    if (MAT_INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
      throw getMatInputUnsupportedTypeError(this._type);
    }
  }

  /** Checks whether the input type is one of the types that are never empty. */
  protected _isNeverEmpty() {
    return this._neverEmptyInputTypes.indexOf(this._type) > -1;
  }

  /** Checks whether the input is invalid based on the native validation. */
  protected _isBadInput() {
    // The `validity` property won't be present on platform-server.
    let validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
    return validity && validity.badInput;
  }

  /** Determines if the component host is a textarea. If not recognizable it returns false. */
  protected _isTextarea() {
    let nativeElement = this._elementRef.nativeElement;

    // In Universal, we don't have access to `nodeName`, but the same can be achieved with `name`.
    // Note that this shouldn't be necessary once Angular switches to an API that resembles the
    // DOM closer.
    let nodeName = this._platform.isBrowser ? nativeElement.nodeName : nativeElement.name;
    return nodeName ? nodeName.toLowerCase() === 'textarea' : false;
  }

  // Implemented as part of MatFormFieldControl.
  get empty(): boolean {
    return !this._isNeverEmpty() && !this._elementRef.nativeElement.value && !this._isBadInput();
  }

  // Implemented as part of MatFormFieldControl.
  get shouldLabelFloat(): boolean { return this.focused || !this.empty; }

  // Implemented as part of MatFormFieldControl.
  setDescribedByIds(ids: string[]) { this._ariaDescribedby = ids.join(' '); }

  // Implemented as part of MatFormFieldControl.
  onContainerClick() { this.focus(); }
}
