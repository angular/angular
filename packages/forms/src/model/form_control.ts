
import {removeListItem} from '../directives/shared';
import {AsyncValidatorFn, ValidatorFn} from '../directives/validators';

import {AbstractControl} from './abstract_control';
import {FormArray as IFormArray, FormControl as IFormControl, FormControlOptions, FormGroup as IFormGroup} from './api';
import {isOptionsObj, pickAsyncValidators, pickValidators} from './util';

const FormControlImpl = class FormControl extends AbstractControl implements IFormControl {
  public readonly defaultValue: any = null;

  _onChange: Function[] = [];

  _pendingValue: any;

  _pendingChange: boolean = false;

  constructor(
      formState: any = null, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._applyFormState(formState);
    this._setUpdateStrategy(validatorOrOpts);
    this._initObservables();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set
      // `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
    if (isOptionsObj(validatorOrOpts) && validatorOrOpts.initialValueIsDefault) {
      if (this._isBoxedValue(formState)) {
        (this.defaultValue as any) = formState.value;
      } else {
        (this.defaultValue as any) = formState;
      }
    }
  }

  override setValue(value: any, options: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  } = {}): void {
    (this as {value: any}).value = this._pendingValue = value;
    if (this._onChange.length && options.emitModelToViewChange !== false) {
      this._onChange.forEach(
          (changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
    }
    this.updateValueAndValidity(options);
  }

  override patchValue(value: any, options: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  } = {}): void {
    this.setValue(value, options);
  }

  override reset(formState: any = this.defaultValue, options: {
    onlySelf?: boolean,
    emitEvent?: boolean
  } = {}): void {
    this._applyFormState(formState);
    this.markAsPristine(options);
    this.markAsUntouched(options);
    this.setValue(this.value, options);
    this._pendingChange = false;
  }

  override _updateValue(): void {}

  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

  override _allControlsDisabled(): boolean {
    return this.disabled;
  }

  registerOnChange(fn: Function): void {
    this._onChange.push(fn);
  }

  _unregisterOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void {
    removeListItem(this._onChange, fn);
  }

  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    this._onDisabledChange.push(fn);
  }

  _unregisterOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    removeListItem(this._onDisabledChange, fn);
  }

  override _forEachChild(cb: (c: AbstractControl) => void): void {}

  override _syncPendingControls(): boolean {
    if (this.updateOn === 'submit') {
      if (this._pendingDirty) this.markAsDirty();
      if (this._pendingTouched) this.markAsTouched();
      if (this._pendingChange) {
        this.setValue(this._pendingValue, {onlySelf: true, emitModelToViewChange: false});
        return true;
      }
    }
    return false;
  }

  private _applyFormState(formState: any) {
    if (this._isBoxedValue(formState)) {
      (this as {value: any}).value = this._pendingValue = formState.value;
      formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
                           this.enable({onlySelf: true, emitEvent: false});
    } else {
      (this as {value: any}).value = this._pendingValue = formState;
    }
  }
}

export interface ɵFormControlCtor {
  new(formState?: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): IFormControl;
}

export const FormControl: ɵFormControlCtor = FormControlImpl as ɵFormControlCtor;
export type FormControl = IFormControl;


export function getRawValue(control: AbstractControl): any {
  return control instanceof FormControlImpl ? control.value :
                                              (control as IFormGroup | IFormArray).getRawValue();
}
