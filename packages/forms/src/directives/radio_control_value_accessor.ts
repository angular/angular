/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  forwardRef,
  inject,
  Injectable,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Provider,
  Renderer2,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

import {
  BuiltInControlValueAccessor,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from './control_value_accessor';
import {NgControl} from './ng_control';
import {CALL_SET_DISABLED_STATE, setDisabledStateDefault} from './shared';

const RADIO_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioControlValueAccessor),
  multi: true,
};

function throwNameError() {
  throw new RuntimeError(
    RuntimeErrorCode.NAME_AND_FORM_CONTROL_NAME_MUST_MATCH,
    `
      If you define both a name and a formControlName attribute on your radio button, their values
      must match. Ex: <input type="radio" formControlName="food" name="food">
    `,
  );
}

/**
 * @description
 * Class used by Angular to track radio buttons. For internal use only.
 */
@Injectable({providedIn: 'root'})
export class RadioControlRegistry {
  private _accessors: any[] = [];

  /**
   * @description
   * Adds a control to the internal registry. For internal use only.
   */
  add(control: NgControl, accessor: RadioControlValueAccessor) {
    this._accessors.push([control, accessor]);
  }

  /**
   * @description
   * Removes a control from the internal registry. For internal use only.
   */
  remove(accessor: RadioControlValueAccessor) {
    for (let i = this._accessors.length - 1; i >= 0; --i) {
      if (this._accessors[i][1] === accessor) {
        this._accessors.splice(i, 1);
        return;
      }
    }
  }

  /**
   * @description
   * Selects a radio button. For internal use only.
   */
  select(accessor: RadioControlValueAccessor) {
    this._accessors.forEach((c) => {
      if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].fireUncheck(accessor.value);
      }
    });
  }

  private _isSameGroup(
    controlPair: [NgControl, RadioControlValueAccessor],
    accessor: RadioControlValueAccessor,
  ): boolean {
    if (!controlPair[0].control) return false;
    return (
      controlPair[0]._parent === accessor._control._parent && controlPair[1].name === accessor.name
    );
  }
}

/**
 * @description
 * The `ControlValueAccessor` for writing radio control values and listening to radio control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using radio buttons with reactive form directives
 *
 * The follow example shows how to use radio buttons in a reactive form. When using radio buttons in
 * a reactive form, radio buttons in the same group should have the same `formControlName`.
 * Providing a `name` attribute is optional.
 *
 * {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector:
    'input[type=radio][formControlName],input[type=radio][formControl],input[type=radio][ngModel]',
  host: {'(change)': 'onChange()', '(blur)': 'onTouched()'},
  providers: [RADIO_VALUE_ACCESSOR],
  standalone: false,
})
export class RadioControlValueAccessor
  extends BuiltInControlValueAccessor
  implements ControlValueAccessor, OnDestroy, OnInit
{
  /** @internal */
  _state!: boolean;
  /** @internal */
  _control!: NgControl;
  /** @internal */
  _fn!: Function;

  private setDisabledStateFired = false;

  /**
   * The registered callback function called when a change event occurs on the input element.
   * Note: we declare `onChange` here (also used as host listener) as a function with no arguments
   * to override the `onChange` function (which expects 1 argument) in the parent
   * `BaseControlValueAccessor` class.
   * @docs-private
   */
  override onChange = () => {};

  /**
   * @description
   * Tracks the name of the radio input element.
   */
  @Input() name!: string;

  /**
   * @description
   * Tracks the name of the `FormControl` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   */
  @Input() formControlName!: string;

  /**
   * @description
   * Tracks the value of the radio input element
   */
  @Input() value: any;

  private callSetDisabledState =
    inject(CALL_SET_DISABLED_STATE, {optional: true}) ?? setDisabledStateDefault;

  constructor(
    renderer: Renderer2,
    elementRef: ElementRef,
    private _registry: RadioControlRegistry,
    private _injector: Injector,
  ) {
    super(renderer, elementRef);
  }

  /** @docs-private */
  ngOnInit(): void {
    this._control = this._injector.get(NgControl);
    this._checkName();
    this._registry.add(this._control, this);
  }

  /** @docs-private */
  ngOnDestroy(): void {
    this._registry.remove(this);
  }

  /**
   * Sets the "checked" property value on the radio input element.
   * @docs-private
   */
  writeValue(value: any): void {
    this._state = value === this.value;
    this.setProperty('checked', this._state);
  }

  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  override registerOnChange(fn: (_: any) => {}): void {
    this._fn = fn;
    this.onChange = () => {
      fn(this.value);
      this._registry.select(this);
    };
  }

  /** @docs-private */
  override setDisabledState(isDisabled: boolean): void {
    /**
     * `setDisabledState` is supposed to be called whenever the disabled state of a control changes,
     * including upon control creation. However, a longstanding bug caused the method to not fire
     * when an *enabled* control was attached. This bug was fixed in v15 in #47576.
     *
     * This had a side effect: previously, it was possible to instantiate a reactive form control
     * with `[attr.disabled]=true`, even though the corresponding control was enabled in the
     * model. This resulted in a mismatch between the model and the DOM. Now, because
     * `setDisabledState` is always called, the value in the DOM will be immediately overwritten
     * with the "correct" enabled value.
     *
     * However, the fix also created an exceptional case: radio buttons. Because Reactive Forms
     * models the entire group of radio buttons as a single `FormControl`, there is no way to
     * control the disabled state for individual radios, so they can no longer be configured as
     * disabled. Thus, we keep the old behavior for radio buttons, so that `[attr.disabled]`
     * continues to work. Specifically, we drop the first call to `setDisabledState` if `disabled`
     * is `false`, and we are not in legacy mode.
     */
    if (
      this.setDisabledStateFired ||
      isDisabled ||
      this.callSetDisabledState === 'whenDisabledForLegacyCode'
    ) {
      this.setProperty('disabled', isDisabled);
    }
    this.setDisabledStateFired = true;
  }

  /**
   * Sets the "value" on the radio input element and unchecks it.
   *
   * @param value
   */
  fireUncheck(value: any): void {
    this.writeValue(value);
  }

  private _checkName(): void {
    if (
      this.name &&
      this.formControlName &&
      this.name !== this.formControlName &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throwNameError();
    }
    if (!this.name && this.formControlName) this.name = this.formControlName;
  }
}
