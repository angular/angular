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
 * Token to provide to turn off the `ngModel` warning on `formControl` and `formControlName`.
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
 * Synchronizes a standalone `FormControl` instance with a form control element in a
 * reactive form.
 *
 * Values written to the `FormControl` programmatically are automatically updated
 * in the associated DOM element (model-to-view), and values written to the
 * DOM element through user input are automatically reflected in the
 * `FormControl` instance (view-to-model).
 *
 * @usageNotes
 * Use this directive if you'd like to create and manage a `FormControl` instance directly.
 * Simply create a `FormControl`, save it to your component class, and pass it into the
 * `FormControlDirective`.
 *
 * Use this directive to get, set, and listen for values changers in a standalone control.
 * Unlike `FormControlName`, it does not require that your `FormControl` instance
 * be part of any parent `FormGroup`, and it is not registered to any `FormGroupDirective`
 * that exists above it.
 *
 * * **Get a value** : The `value` property is always synced and available on the
 * `FormControl` instance. See a full list of available properties in `AbstractControl`.
 *
 * * **Set a value**: Pass in an initial value when instantiating the `FormControl`,
 * or set a value programmatically later using the `setValue()` or `patchValue()` method.
 *
 * * **Listen for a value change**: Subscribe to the `valueChanges` event, or listen
 * to `statusChanges` to be notified when the validation status is re-calculated.
 *
 * ### Registering a single form control
 *
 * The following examples shows how to register a standalone control and set its value.
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * ### Use instead of `ngModel` with reactive forms
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6.
 * See [Deprecation policy](guide/releases#deprecation-practices).
 *
 * Now deprecated:
 *
 * ```html
 * <input [formControl]="control" [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * This pattern has been deprecated because it mixes template-driven and reactive forms approaches,
 * which limits the benefits of each approach and creates unnecessarily complex behaviors.
 *
 * * Setting the value in the template violates the template-agnostic principles
 * behind reactive forms.
 *
 * * Adding a `FormControl/FormGroup` layer in the class removes the convenience of defining forms
 * in the template.
 *
 * * Although it seems like the actual `ngModel` directive is being used,
 * an input/output property named `ngModel` on the reactive form directive is being used instead.
 * That input/output property approximates (some of) the `ngModel` directive's behavior.
 * Specifically, it allows getting/setting the value and intercepting value events
 * However, some of the `ngModel` directive's other features (such as delaying updates with
 * `ngModelOptions` or exporting the directive) don't work.
 *
 * To update your code to the current best practices, first decide whether to use
 * reactive forms or template-driven forms.
 * The two approaches are explained and compared in [Introduction to forms](guide/forms-overview).
 *
 * When using with reactive forms:
 *
 * ```html
 * <input [formControl]="control">
 * ```
 *
 * ```ts
 * this.control.setValue('some value');
 * ```
 *
 * When using template-driven forms:
 *
 * ```html
 * <input [(ngModel)]="value">
 * ```
 *
 * ```ts
 * this.value = 'some value';
 * ```
 *
 * By default, when you use this pattern, you see a deprecation warning in development
 * mode. You can choose to silence this warning by providing a configuration value for
 * `ReactiveFormsModule` at import time:
 *
 * ```ts
 * imports: [
 *   ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'});
 * ]
 * ```
 *
 * Alternatively, you can choose to surface a separate warning for each instance of this
 * pattern with a configuration value of `"always"`. This can help you find where in the code
 * the pattern is being used as the code is being updated.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({selector: '[formControl]', providers: [formControlBinding], exportAs: 'ngForm'})

export class FormControlDirective extends NgControl implements OnChanges {
  /**
   * @description
   * Internal reference to the view model value.
   */
  viewModel: any;

  /**
   * @description
   * Tracks the `FormControl` instance bound to the directive.
   */
  // TODO(issue/24571): remove '!'.
  @Input('formControl') form !: FormControl;

  /**
   * @description
   * Triggers a warning that this input should not be used with reactive forms.
   */
  @Input('disabled')
  set isDisabled(isDisabled: boolean) { ReactiveErrors.disabledAttrWarning(); }

  // TODO(kara): remove next 4 properties once deprecation period is over

  /** @deprecated as of v6 */
  @Input('ngModel') model: any;

  /** @deprecated as of v6 */
  @Output('ngModelChange') update = new EventEmitter();

  /**
   * @description
   * Static property used to track whether any ngModel warnings have been sent across
   * all instances of FormControlDirective. Used to support warning config of "once".
   *
   * @internal
   */
  static _ngModelWarningSentOnce = false;

  /**
   * @description
   * Instance property used to track whether an ngModel warning has been sent out for this
   * particular `FormControlDirective` instance. Used to support warning config of "always".
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

              /**
               * @description
               * A lifecycle method called when the directive's inputs change. For internal use
               * only.
               *
               * @param changes A object of key/value pairs for the set of changed inputs.
               */
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

              /**
               * @description
               * Returns an array that represents the path from the top-level form to this control.
               * Each index is the string name of the control on that level.
               */
              get path(): string[] { return []; }

              /**
               * @description
               * Synchronous validator function composed of all the synchronous validators
               * registered with this directive.
               */
              get validator(): ValidatorFn|null { return composeValidators(this._rawValidators); }

              /**
               * @description
               * Async validator function composed of all the async validators registered with this
               * directive.
               */
              get asyncValidator(): AsyncValidatorFn|null {
                return composeAsyncValidators(this._rawAsyncValidators);
              }

              /**
               * @description
               * The `FormControl` bound to this directive.
               */
              get control(): FormControl { return this.form; }

              /**
               * @description
               * Sets the new value for the view model and emits an `ngModelChange` event.
               *
               * @param newValue The new value for the view model.
               */
              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _isControlChanged(changes: {[key: string]: any}): boolean {
                return changes.hasOwnProperty('form');
              }
}
