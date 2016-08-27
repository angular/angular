/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Optional, Self, forwardRef} from '@angular/core';

import {EventEmitter} from '../facade/async';
import {ListWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
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
 * If `NgForm` is bound in a component, `<form>` elements in that component will be
 * upgraded to use the Angular form system.
 *
 * ### Typical Use
 *
 * Include `FORM_DIRECTIVES` in the `directives` section of a {@link Component} annotation
 * to use `NgForm` and its associated controls.
 *
 * ### Structure
 *
 * An Angular form is a collection of `FormControl`s in some hierarchy.
 * `FormControl`s can be at the top level or can be organized in `FormGroup`s
 * or `FormArray`s. This hierarchy is reflected in the form's `value`, a
 * JSON object that mirrors the form structure.
 *
 * ### Submission
 *
 * The `ngSubmit` event signals when the user triggers a form submission.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <p>Submit the form to see the data object Angular builds</p>
 *       <h2>NgForm demo</h2>
 *       <form #f="ngForm" (ngSubmit)="onSubmit(f.value)">
 *         <h3>Control group: credentials</h3>
 *         <div ngModelGroup="credentials">
 *           <p>Login: <input type="text" name="login" ngModel></p>
 *           <p>Password: <input type="password" name="password" ngModel></p>
 *         </div>
 *         <h3>Control group: person</h3>
 *         <div ngModelGroup="person">
 *           <p>First name: <input type="text" name="firstName" ngModel></p>
 *           <p>Last name: <input type="text" name="lastName" ngModel></p>
 *         </div>
 *         <button type="submit">Submit Form</button>
 *       <p>Form data submitted:</p>
 *       </form>
 *       <pre>{{data}}</pre>
 *     </div>
 * `,
 *   directives: []
 * })
 * export class App {
 *   constructor() {}
 *
 *   data: string;
 *
 *   onSubmit(data) {
 *     this.data = JSON.stringify(data, null, 2);
 *   }
 * }
 *  ```
 *
 *  @stable
 */
@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,[ngForm]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit()', '(reset)': 'onReset()'},
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
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
      }
    });
  }

  addFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      var container = this._findContainer(dir.path);
      var group = new FormGroup({});
      setUpFormContainer(group, dir);
      container.registerControl(dir.name, group);
      group.updateValueAndValidity({emitEvent: false});
    });
  }

  removeFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
      }
    });
  }

  getFormGroup(dir: NgModelGroup): FormGroup { return <FormGroup>this.form.get(dir.path); }

  updateModel(dir: NgControl, value: any): void {
    resolvedPromise.then(() => {
      var ctrl = <FormControl>this.form.get(dir.path);
      ctrl.setValue(value);
    });
  }

  setValue(value: {[key: string]: any}): void { this.control.setValue(value); }

  onSubmit(): boolean {
    this._submitted = true;
    this.ngSubmit.emit(null);
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
    return ListWrapper.isEmpty(path) ? this.form : <FormGroup>this.form.get(path);
  }
}
