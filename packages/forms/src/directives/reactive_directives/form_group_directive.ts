/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Inject, Input, OnChanges, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators} from '../../validators';
import {ControlContainer} from '../control_container';
import {Form} from '../form_interface';
import {ReactiveErrors} from '../reactive_errors';
import {cleanUpControl, composeAsyncValidators, composeValidators, removeDir, setUpControl, setUpFormContainer, syncPendingControls} from '../shared';

import {FormControlName} from './form_control_name';
import {FormArrayName, FormGroupName} from './form_group_name';

export const formDirectiveProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupDirective)
};

/**
 * @description
 *
 * Binds an existing `FormGroup` to a DOM element.
 *
 * This directive accepts an existing `FormGroup` instance. It will then use this
 * `FormGroup` instance to match any child `FormControl`, `FormGroup`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 * 
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see `AbstractControl`
 *
 * ### Register Form Group
 *
 * The following example registers a `FormGroup` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formGroup]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  exportAs: 'ngForm'
})
export class FormGroupDirective extends ControlContainer implements Form,
    OnChanges {
  /**
   * @description
   * Reports whether the form submission has been triggered.
   */
  public readonly submitted: boolean = false;

  // TODO(issue/24571): remove '!'.
  private _oldForm !: FormGroup;

  /**
   * @description
   * Tracks the list of added `FormControlName` instances
   */
  directives: FormControlName[] = [];

  /**
   * @description
   * Tracks the `FormGroup` bound to this directive.
   */
  @Input('formGroup') form: FormGroup = null !;

  /**
   * @description
   * Emits an event when the form submission has been triggered.
   */
  @Output() ngSubmit = new EventEmitter();

  constructor(
      @Optional() @Self() @Inject(NG_VALIDATORS) private _validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators: any[]) {
    super();
  }

  /**
   * @description
   * A lifecycle method called when the directive's inputs change. For internal use only.
   *
   * @param changes A object of key/value pairs for the set of changed inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this._checkFormPresent();
    if (changes.hasOwnProperty('form')) {
      this._updateValidators();
      this._updateDomValue();
      this._updateRegistrations();
    }
  }

  /**
   * @description
   * Returns this directive's instance.
   */
  get formDirective(): Form { return this; }

  /**
   * @description
   * Returns the `FormGroup` bound to this directive.
   */
  get control(): FormGroup { return this.form; }

  /**
   * @description
   * Returns an array representing the path to this group. Because this directive
   * always lives at the top level of a form, it always an empty array.
   */
  get path(): string[] { return []; }

  /**
   * @description
   * Method that sets up the control directive in this group, re-calculates its value
   * and validity, and adds the instance to the internal list of directives.
   *
   * @param dir The `FormControlName` directive instance.
   */
  addControl(dir: FormControlName): FormControl {
    const ctrl: any = this.form.get(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
    this.directives.push(dir);
    return ctrl;
  }

  /**
   * @description
   * Retrieves the `FormControl` instance from the provided `FormControlName` directive
   *
   * @param dir The `FormControlName` directive instance.
   */
  getControl(dir: FormControlName): FormControl { return <FormControl>this.form.get(dir.path); }

  /**
   * @description
   * Removes the `FormControlName` instance from the internal list of directives
   *
   * @param dir The `FormControlName` directive instance.
   */
  removeControl(dir: FormControlName): void { removeDir<FormControlName>(this.directives, dir); }

  /**
   * Adds a new `FormGroupName` directive instance to the form.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  addFormGroup(dir: FormGroupName): void {
    const ctrl: any = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  /**
   * No-op method to remove the form group.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  removeFormGroup(dir: FormGroupName): void {}

  /**
   * @description
   * Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
   *
   * @param dir The `FormGroupName` directive instance.
   */
  getFormGroup(dir: FormGroupName): FormGroup { return <FormGroup>this.form.get(dir.path); }

  /**
   * Adds a new `FormArrayName` directive instance to the form.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  addFormArray(dir: FormArrayName): void {
    const ctrl: any = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({emitEvent: false});
  }

  /**
   * No-op method to remove the form array.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  removeFormArray(dir: FormArrayName): void {}

  /**
   * @description
   * Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  getFormArray(dir: FormArrayName): FormArray { return <FormArray>this.form.get(dir.path); }

  /**
   * Sets the new value for the provided `FormControlName` directive.
   *
   * @param dir The `FormControlName` directive instance.
   * @param value The new value for the directive's control.
   */
  updateModel(dir: FormControlName, value: any): void {
    const ctrl  = <FormControl>this.form.get(dir.path);
    ctrl.setValue(value);
  }

  /**
   * @description
   * Method called with the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event: Event): boolean {
    (this as{submitted: boolean}).submitted = true;
    syncPendingControls(this.form, this.directives);
    this.ngSubmit.emit($event);
    return false;
  }

  /**
   * @description
   * Method called when the "reset" event is triggered on the form.
   */
  onReset(): void { this.resetForm(); }

  /**
   * @description
   * Resets the form to an initial value and resets its submitted status.
   *
   * @param value The new value for the form.
   */
  resetForm(value: any = undefined): void {
    this.form.reset(value);
    (this as{submitted: boolean}).submitted = false;
  }


  /** @internal */
  _updateDomValue() {
    this.directives.forEach(dir => {
      const newCtrl: any = this.form.get(dir.path);
      if (dir.control !== newCtrl) {
        cleanUpControl(dir.control, dir);
        if (newCtrl) setUpControl(newCtrl, dir);
        (dir as{control: FormControl}).control = newCtrl;
      }
    });

    this.form._updateTreeValidity({emitEvent: false});
  }

  private _updateRegistrations() {
    this.form._registerOnCollectionChange(() => this._updateDomValue());
    if (this._oldForm) this._oldForm._registerOnCollectionChange(() => {});
    this._oldForm = this.form;
  }

  private _updateValidators() {
    const sync = composeValidators(this._validators);
    this.form.validator = Validators.compose([this.form.validator !, sync !]);

    const async = composeAsyncValidators(this._asyncValidators);
    this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator !, async !]);
  }

  private _checkFormPresent() {
    if (!this.form) {
      ReactiveErrors.missingFormException();
    }
  }
}
