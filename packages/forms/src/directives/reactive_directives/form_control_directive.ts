/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Inject, InjectionToken, Input, OnChanges, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {FormControl} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {ReactiveErrors} from '../reactive_errors';
import {_ngModelWarning, composeAsyncValidators, composeValidators, isPropertyUpdated, selectValueAccessor, setUpControl} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';


/**
 * Token to provide to turn off the ngModel warning on formControl and formControlName.
 */
export const NG_MODEL_WITH_FORM_CONTROL_WARNING =
    new InjectionToken('NgModelWithFormControlWarning');

export const formControlBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective)
};

/**
 * @description
 *
 * Syncs a standalone `FormControl` instance to a form control element.
 *
 * This directive ensures that any values written to the `FormControl`
 * instance programmatically will be written to the DOM element (model -> view). Conversely,
 * any values written to the DOM element through user input will be reflected in the
 * `FormControl` instance (view -> model).
 *
 * Use this directive if you'd like to create and manage a `FormControl` instance directly.
 * Simply create a `FormControl`, save it to your component class, and pass it into the
 * `FormControlDirective`.
 *
 * This directive is designed to be used as a standalone control.  Unlike `FormControlName`,
 * it does not require that your `FormControl` instance be part of any parent
 * `FormGroup`, and it won't be registered to any `FormGroupDirective` that
 * exists above it.
 *
 * **Get the value**: the `value` property is always synced and available on the
 * `FormControl` instance. See a full list of available properties in
 * `AbstractControl`.
 *
 * **Set the value**: You can pass in an initial value when instantiating the `FormControl`,
 * or you can set it programmatically later using {@link AbstractControl#setValue setValue} or
 * {@link AbstractControl#patchValue patchValue}.
 *
 * **Listen to value**: If you want to listen to changes in the value of the control, you can
 * subscribe to the {@link AbstractControl#valueChanges valueChanges} event.  You can also listen to
 * {@link AbstractControl#statusChanges statusChanges} to be notified when the validation status is
 * re-calculated.
 *
 * ### Example
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * * **npm package**: `@angular/forms`
 *
 * * **NgModule**: `ReactiveFormsModule`
 *
 * ### Use with ngModel
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and will be removed in Angular v7.
 *
 * Now deprecated:
 * ```html
 * <input [formControl]="control" [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * This has been deprecated for a few reasons. First, developers have found this pattern
 * confusing. It seems like the actual `ngModel` directive is being used, but in fact it's
 * an input/output property named `ngModel` on the reactive form directive that simply
 * approximates (some of) its behavior. Specifically, it allows getting/setting the value
 * and intercepting value events. However, some of `ngModel`'s other features - like
 * delaying updates with`ngModelOptions` or exporting the directive - simply don't work,
 * which has understandably caused some confusion.
 *
 * In addition, this pattern mixes template-driven and reactive forms strategies, which
 * we generally don't recommend because it doesn't take advantage of the full benefits of
 * either strategy. Setting the value in the template violates the template-agnostic
 * principles behind reactive forms, whereas adding a `FormControl`/`FormGroup` layer in
 * the class removes the convenience of defining forms in the template.
 *
 * To update your code before v7, you'll want to decide whether to stick with reactive form
 * directives (and get/set values using reactive forms patterns) or switch over to
 * template-driven directives.
 *
 * After (choice 1 - use reactive forms):
 *
 * ```html
 * <input [formControl]="control">
 * ```
 *
 * ```ts
 * this.control.setValue('some value');
 * ```
 *
 * After (choice 2 - use template-driven forms):
 *
 * ```html
 * <input [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * By default, when you use this pattern, you will see a deprecation warning once in dev
 * mode. You can choose to silence this warning by providing a config for
 * `ReactiveFormsModule` at import time:
 *
 * ```ts
 * imports: [
 *   ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'});
 * ]
 * ```
 *
 * Alternatively, you can choose to surface a separate warning for each instance of this
 * pattern with a config value of `"always"`. This may help to track down where in the code
 * the pattern is being used as the code is being updated.
 *
 *
 */
@Directive({selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm'})

export class FormControlDirective extends NgControl implements OnChanges {
  viewModel: any;

  // TODO(issue/24571): remove '!'.
  @Input('formControl') form !: FormControl;

  @Input('disabled')
  set isDisabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  // TODO(kara): remove next 4 properties once deprecation period is over

  /** @deprecated as of v6 */
  @Input('ngModel') model: any;

  /** @deprecated as of v6 */
  @Output('ngModelChange') update = new EventEmitter();

  /**
   * Static property used to track whether any ngModel warnings have been sent across
   * all instances of FormControlDirective. Used to support warning config of "once".
   *
   * @internal
   */
  static _ngModelWarningSentOnce = false;

  /**
   * Instance property used to track whether an ngModel warning has been sent out for this
   * particular FormControlDirective instance. Used to support warning config of "always".
   *
   * @internal
   */
  _ngModelWarningSent = false;

  constructor(@Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<AsyncValidator|AsyncValidatorFn>,
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[],
              @Optional() @Inject(NG_MODEL_WITH_FORM_CONTROL_WARNING) private _ngModelWarningConfig: string|null) {
                super();
                this._rawValidators = validators || [];
                this._rawAsyncValidators = asyncValidators || [];
                this.valueAccessor = selectValueAccessor(this, valueAccessors);
              }

              ngOnChanges(changes: SimpleChanges): void {
                if (this._isControlChanged(changes)) {
                  setUpControl(this.form, this);
                  if (this.control.disabled && this.valueAccessor !.setDisabledState) {
                    this.valueAccessor !.setDisabledState !(true);
                  }
                  this.form.updateValueAndValidity({emitEvent: false});
                }
                if (isPropertyUpdated(changes, this.viewModel)) {
                  _ngModelWarning(
                      'formControl', FormControlDirective, this, this._ngModelWarningConfig);
                  this.form.setValue(this.model);
                  this.viewModel = this.model;
                }
              }

              get path(): string[] { return []; }

              get validator(): ValidatorFn|null { return composeValidators(this._rawValidators); }

              get asyncValidator(): AsyncValidatorFn|null {
                return composeAsyncValidators(this._rawAsyncValidators);
              }

              get control(): FormControl { return this.form; }

              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _isControlChanged(changes: {[key: string]: any}): boolean {
                return changes.hasOwnProperty('form');
              }
}
