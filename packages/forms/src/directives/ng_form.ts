/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Inject, Optional, Self, forwardRef} from '@angular/core';

import {AbstractControl, FormControl, FormGroup} from '../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../validators';

import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {NgControl} from './ng_control';
import {NgModel} from './ng_model';
import {NgModelGroup} from './ng_model_group';
import {composeAsyncValidators, composeValidators, setUpControl, setUpFormContainer} from './shared';

export const formDirectiveProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgForm)
};

const resolvedPromise = Promise.resolve(null);

/**
 * @whatItDoes Creates a top-level {@link FormGroup} instance and binds it to a form
 * to track aggregate form value and validation status.
 *
 * @howToUse
 *
 * As soon as you import the `FormsModule`, this directive becomes active by default on
 * all `<form>` tags.  You don't need to add a special selector.
 *
 * You can export the directive into a local template variable using `ngForm` as the key
 * (ex: `#myForm="ngForm"`). This is optional, but useful.  Many properties from the underlying
 * {@link FormGroup} instance are duplicated on the directive itself, so a reference to it
 * will give you access to the aggregate value and validity status of the form, as well as
 * user interaction properties like `dirty` and `touched`.
 *
 * To register child controls with the form, you'll want to use {@link NgModel} with a
 * `name` attribute.  You can also use {@link NgModelGroup} if you'd like to create
 * sub-groups within the form.
 *
 * You can listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event will be emitted with the original form
 * submission event.
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `FormsModule`
 *
 *  @stable
 */
@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,[ngForm]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  outputs: ['ngSubmit'],
  exportAs: 'ngForm'
})
export class NgForm extends ControlContainer implements Form {
  private _submitted: boolean = false;

  form: FormGroup;
  ngSubmit = new EventEmitter();

  constructor(
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this.form =
        new FormGroup({}, composeValidators(validators), composeAsyncValidators(asyncValidators));
  }

  get submitted(): boolean { return this._submitted; }

  get formDirective(): Form { return this; }

  get control(): FormGroup { return this.form; }

  get path(): string[] { return []; }

  get controls(): {[key: string]: AbstractControl} { return this.form.controls; }

  addControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      dir._control = <FormControl>container.registerControl(dir.name, dir.control);
      setUpControl(dir.control, dir);
      dir.control.updateValueAndValidity({emitEvent: false});
    });
  }

  getControl(dir: NgModel): FormControl { return <FormControl>this.form.get(dir.path); }

  removeControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
    });
  }

  addFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      const group = new FormGroup({});
      setUpFormContainer(group, dir);
      container.registerControl(dir.name, group);
      group.updateValueAndValidity({emitEvent: false});
    });
  }

  removeFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
    });
  }

  getFormGroup(dir: NgModelGroup): FormGroup { return <FormGroup>this.form.get(dir.path); }

  updateModel(dir: NgControl, value: any): void {
    resolvedPromise.then(() => {
      const ctrl = <FormControl>this.form.get(dir.path !);
      ctrl.setValue(value);
    });
  }

  setValue(value: {[key: string]: any}): void { this.control.setValue(value); }

  onSubmit($event: Event): boolean {
    this._submitted = true;
    this.ngSubmit.emit($event);
    return false;
  }

  onReset(): void { this.resetForm(); }

  resetForm(value: any = undefined): void {
    this.form.reset(value);
    this._submitted = false;
  }

  /** @internal */
  _findContainer(path: string[]): FormGroup {
    path.pop();
    return path.length ? <FormGroup>this.form.get(path) : this.form;
  }
}
