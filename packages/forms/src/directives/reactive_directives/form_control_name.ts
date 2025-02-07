/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  EventEmitter,
  forwardRef,
  Host,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Provider,
  Self,
  SimpleChanges,
  SkipSelf,
  ɵWritable as Writable,
} from '@angular/core';

import {FormControl} from '../../model/form_control';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {
  controlParentException,
  disabledAttrWarning,
  ngModelGroupException,
} from '../reactive_errors';
import {_ngModelWarning, controlPath, isPropertyUpdated, selectValueAccessor} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import {NG_MODEL_WITH_FORM_CONTROL_WARNING} from './form_control_directive';
import {FormGroupDirective} from './form_group_directive';
import {FormArrayName, FormGroupName} from './form_group_name';

const controlNameBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName),
};

/**
 * @description
 * Syncs a `FormControl` in an existing `FormGroup` to a form control
 * element by name.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link FormControl}
 * @see {@link AbstractControl}
 *
 * @usageNotes
 *
 * ### Register `FormControl` within a group
 *
 * The following example shows how to register multiple form controls within a form group
 * and set their value.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * To see `formControlName` examples with different form control types, see:
 *
 * * Radio buttons: `RadioControlValueAccessor`
 * * Selects: `SelectControlValueAccessor`
 *
 * ### Use with ngModel is deprecated
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and is scheduled for removal in
 * a future version of Angular.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formControlName]',
  providers: [controlNameBinding],
  standalone: false,
})
export class FormControlName extends NgControl implements OnChanges, OnDestroy {
  private _added = false;
  /**
   * Internal reference to the view model value.
   * @internal
   */
  viewModel: any;

  /**
   * @description
   * Tracks the `FormControl` instance bound to the directive.
   */
  // TODO(issue/24571): remove '!'.
  override readonly control!: FormControl;

  /**
   * @description
   * Tracks the name of the `FormControl` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   * Accepts a name as a string or a number.
   * The name in the form of a string is useful for individual forms,
   * while the numerical form allows for form controls to be bound
   * to indices when iterating over controls in a `FormArray`.
   */
  @Input('formControlName') override name: string | number | null = null;

  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }

  // TODO(kara): remove next 4 properties once deprecation period is over

  /** @deprecated as of v6 */
  @Input('ngModel') model: any;

  /** @deprecated as of v6 */
  @Output('ngModelChange') update = new EventEmitter();

  /**
   * @description
   * Static property used to track whether any ngModel warnings have been sent across
   * all instances of FormControlName. Used to support warning config of "once".
   *
   * @internal
   */
  static _ngModelWarningSentOnce = false;

  /**
   * @description
   * Instance property used to track whether an ngModel warning has been sent out for this
   * particular FormControlName instance. Used to support warning config of "always".
   *
   * @internal
   */
  _ngModelWarningSent = false;

  constructor(
    @Optional() @Host() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
    @Optional()
    @Inject(NG_MODEL_WITH_FORM_CONTROL_WARNING)
    private _ngModelWarningConfig: string | null,
  ) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    if (!this._added) this._setUpControl();
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        _ngModelWarning('formControlName', FormControlName, this, this._ngModelWarningConfig);
      }
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  }

  /** @nodoc */
  ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  override viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent!);
  }

  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective(): any {
    return this._parent ? this._parent.formDirective : null;
  }

  private _checkParentType(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (
        !(this._parent instanceof FormGroupName) &&
        this._parent instanceof AbstractFormGroupDirective
      ) {
        throw ngModelGroupException();
      } else if (
        !(this._parent instanceof FormGroupName) &&
        !(this._parent instanceof FormGroupDirective) &&
        !(this._parent instanceof FormArrayName)
      ) {
        throw controlParentException(this.name);
      }
    }
  }

  private _setUpControl() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      this._checkParentType();
    }
    (this as Writable<this>).control = this.formDirective.addControl(this);
    this._added = true;
  }
}
