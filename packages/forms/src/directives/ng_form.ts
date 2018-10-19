/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Directive, EventEmitter, Inject, Input, Optional, Self, forwardRef} from '@angular/core';

import {AbstractControl, FormControl, FormGroup, FormHooks} from '../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../validators';

import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {NgControl} from './ng_control';
import {NgModel} from './ng_model';
import {NgModelGroup} from './ng_model_group';
import {composeAsyncValidators, composeValidators, removeDir, setUpControl, setUpFormContainer, syncPendingControls} from './shared';

export const formDirectiveProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgForm)
};

const resolvedPromise = Promise.resolve(null);

/**
 * @description
 *
 * Creates a top-level `FormGroup` instance and binds it to a form
 * to track aggregate form value and validation status.
 *
 * As soon as you import the `FormsModule`, this directive becomes active by default on
 * all `<form>` tags.  You don't need to add a special selector.
 *
 * You can export the directive into a local template variable using `ngForm` as the key
 * (ex: `#myForm="ngForm"`). This is optional, but useful.  Many properties from the underlying
 * `FormGroup` instance are duplicated on the directive itself, so a reference to it
 * will give you access to the aggregate value and validity status of the form, as well as
 * user interaction properties like `dirty` and `touched`.
 *
 * To register child controls with the form, you'll want to use `NgModel` with a
 * `name` attribute.  You can also use `NgModelGroup` if you'd like to create
 * sub-groups within the form.
 *
 * You can listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event will be emitted with the original form
 * submission event.
 *
 * In template driven forms, all `<form>` tags are automatically tagged as `NgForm`.
 * If you want to import the `FormsModule` but skip its usage in some forms,
 * for example, to use native HTML5 validation, you can add `ngNoForm` and the `<form>`
 * tags won't create an `NgForm` directive. In reactive forms, using `ngNoForm` is
 * unnecessary because the `<form>` tags are inert. In that case, you would
 * refrain from using the `formGroup` directive.
 *
 * Support for using `ngForm` element selector has been deprecated in Angular v6 and will be removed
 * in Angular v9.
 *
 * This has been deprecated to keep selectors consistent with other core Angular selectors,
 * as element selectors are typically written in kebab-case.
 *
 * Now deprecated:
 * ```html
 * <ngForm #myForm="ngForm">
 * ```
 *
 * After:
 * ```html
 * <ng-form #myForm="ngForm">
 * ```
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,ng-form,[ngForm]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  outputs: ['ngSubmit'],
  exportAs: 'ngForm'
})
export class NgForm extends ControlContainer implements Form,
    AfterViewInit {
  public readonly submitted: boolean = false;

  private _directives: NgModel[] = [];

  form: FormGroup;
  ngSubmit = new EventEmitter();

  /**
   * Options for the `NgForm` instance. Accepts the following properties:
   *
   * **updateOn**: Serves as the default `updateOn` value for all child `NgModels` below it
   * (unless a child has explicitly set its own value for this in `ngModelOptions`).
   * Potential values: `'change'` | `'blur'` | `'submit'`
   *
   * ```html
   * <form [ngFormOptions]="{updateOn: 'blur'}">
   *    <input name="one" ngModel>  <!-- this ngModel will update on blur -->
   * </form>
   * ```
   *
   */
  // TODO(issue/24571): remove '!'.
  @Input('ngFormOptions') options !: {updateOn?: FormHooks};

  constructor(
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this.form =
        new FormGroup({}, composeValidators(validators), composeAsyncValidators(asyncValidators));
  }

  ngAfterViewInit() { this._setUpdateStrategy(); }

  get formDirective(): Form { return this; }

  get control(): FormGroup { return this.form; }

  get path(): string[] { return []; }

  get controls(): {[key: string]: AbstractControl} { return this.form.controls; }

  addControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      (dir as{control: FormControl}).control =
          <FormControl>container.registerControl(dir.name, dir.control);
      setUpControl(dir.control, dir);
      dir.control.updateValueAndValidity({emitEvent: false});
      this._directives.push(dir);
    });
  }

  getControl(dir: NgModel): FormControl { return <FormControl>this.form.get(dir.path); }

  removeControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
      removeDir<NgModel>(this._directives, dir);
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
    (this as{submitted: boolean}).submitted = true;
    syncPendingControls(this.form, this._directives);
    this.ngSubmit.emit($event);
    return false;
  }

  onReset(): void { this.resetForm(); }

  resetForm(value: any = undefined): void {
    this.form.reset(value);
    (this as{submitted: boolean}).submitted = false;
  }

  private _setUpdateStrategy() {
    if (this.options && this.options.updateOn != null) {
      this.form._updateOn = this.options.updateOn;
    }
  }

  /** @internal */
  _findContainer(path: string[]): FormGroup {
    path.pop();
    return path.length ? <FormGroup>this.form.get(path) : this.form;
  }
}
