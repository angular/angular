/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Host, Inject, Input, OnChanges, OnDestroy, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {FormControl, FormHooks} from '../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../validators';

import {AbstractFormGroupDirective} from './abstract_form_group_directive';
import {ControlContainer} from './control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
import {NgControl} from './ng_control';
import {NgForm} from './ng_form';
import {NgModelGroup} from './ng_model_group';
import {composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor, setUpControl} from './shared';
import {TemplateDrivenErrors} from './template_driven_errors';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from './validators';

export const formControlBinding: any = {
  provide: NgControl,
  useExisting: forwardRef(() => NgModel)
};

/**
 * `ngModel` forces an additional change detection run when its inputs change:
 * E.g.:
 * ```
 * <div>{{myModel.valid}}</div>
 * <input [(ngModel)]="myValue" #myModel="ngModel">
 * ```
 * I.e. `ngModel` can export itself on the element and then be used in the template.
 * Normally, this would result in expressions before the `input` that use the exported directive
 * to have and old value as they have been
 * dirty checked before. As this is a very common case for `ngModel`, we added this second change
 * detection run.
 *
 * Notes:
 * - this is just one extra run no matter how many `ngModel` have been changed.
 * - this is a general problem when using `exportAs` for directives!
 */
const resolvedPromise = (() => Promise.resolve(null))();

/**
 * @description
 * Creates a `FormControl` instance from a domain model and binds it
 * to a form control element.
 *
 * The `FormControl` instance tracks the value, user interaction, and
 * validation status of the control and keeps the view synced with the model. If used
 * within a parent form, the directive also registers itself with the form as a child
 * control.
 *
 * This directive is used by itself or as part of a larger form. Use the
 * `ngModel` selector to activate it.
 *
 * It accepts a domain model as an optional `Input`. If you have a one-way binding
 * to `ngModel` with `[]` syntax, changing the value of the domain model in the component
 * class sets the value in the view. If you have a two-way binding with `[()]` syntax
 * (also known as 'banana-box syntax'), the value in the UI always syncs back to
 * the domain model in your class.
 *
 * To inspect the properties of the associated `FormControl` (like validity state), 
 * export the directive into a local template variable using `ngModel` as the key (ex: `#myVar="ngModel"`).
 * You then access the control using the directive's `control` property, 
 * but most properties used (like `valid` and `dirty`) fall through to the control anyway for direct access. 
 * See a full list of properties directly available in `AbstractControlDirective`.
 *
 * @see `RadioControlValueAccessor` 
 * @see `SelectControlValueAccessor`
 * 
 * @usageNotes
 * 
 * ### Using ngModel on a standalone control
 *
 * The following examples show a simple standalone control using `ngModel`:
 *
 * {@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
 *
 * When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
 * so that the control can be registered with the parent form under that name.
 *
 * In the context of a parent form, it's often unnecessary to include one-way or two-way binding, 
 * as the parent form syncs the value for you. You access its properties by exporting it into a 
 * local template variable using `ngForm` such as (`#f="ngForm"`). Use the variable where 
 * needed on form submission.
 *
 * If you do need to populate initial values into your form, using a one-way binding for
 * `ngModel` tends to be sufficient as long as you use the exported form's value rather
 * than the domain model's value on submit.
 * 
 * ### Using ngModel within a form
 *
 * The following example shows controls using `ngModel` within a form:
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 * 
 * ### Using a standalone ngModel within a group
 * 
 * The following example shows you how to use a standalone ngModel control
 * within a form. This controls the display of the form, but doesn't contain form data.
 *
 * ```html
 * <form>
 *   <input name="login" ngModel placeholder="Login">
 *   <input type="checkbox" ngModel [ngModelOptions]="{standalone: true}"> Show more options?
 * </form>
 * <!-- form value: {login: ''} -->
 * ```
 * 
 * ### Setting the ngModel name attribute through options
 * 
 * The following example shows you an alternate way to set the name attribute. The name attribute is used
 * within a custom form component, and the name `@Input` property serves a different purpose.
 *
 * ```html
 * <form>
 *   <my-person-control name="Nancy" ngModel [ngModelOptions]="{name: 'user'}">
 *   </my-person-control>
 * </form>
 * <!-- form value: {user: ''} -->
 * ```
 *
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector: '[ngModel]:not([formControlName]):not([formControl])',
  providers: [formControlBinding],
  exportAs: 'ngModel'
})
export class NgModel extends NgControl implements OnChanges,
    OnDestroy {
  public readonly control: FormControl = new FormControl();
  /** @internal */
  _registered = false;

  /**
   * @description
   * Internal reference to the view model value.
   */
  viewModel: any;

  /**
   * @description
   * Tracks the name bound to the directive. The parent form
   * uses this name as a key to retrieve this control's value.
   */
  // TODO(issue/24571): remove '!'.
  @Input() name !: string;

  /**
   * @description
   * Tracks whether the control is disabled.
   */
  // TODO(issue/24571): remove '!'.
  @Input('disabled') isDisabled !: boolean;

  /**
   * @description
   * Tracks the value bound to this directive.
   */
  @Input('ngModel') model: any;

  /**
   * @description
   * Tracks the configuration options for this `ngModel` instance.
   *
   * **name**: An alternative to setting the name attribute on the form control element. See
   * the [example](api/forms/NgModel#using-ngmodel-on-a-standalone-control) for using `NgModel`
   * as a standalone control.
   *
   * **standalone**: When set to true, the `ngModel` will not register itself with its parent form,
   * and acts as if it's not in the form. Defaults to false.
   *
   * **updateOn**: Defines the event upon which the form control value and validity update.
   * Defaults to 'change'. Possible values: `'change'` | `'blur'` | `'submit'`.
   *
   */
  // TODO(issue/24571): remove '!'.
  @Input('ngModelOptions')
  options !: {name?: string, standalone?: boolean, updateOn?: FormHooks};

  /**
   * @description
   * Event emitter for producing the `ngModelChange` event after
   * the view model updates.
   */
  @Output('ngModelChange') update = new EventEmitter();

  constructor(@Optional() @Host() parent: ControlContainer,
              @Optional() @Self() @Inject(NG_VALIDATORS) validators: Array<Validator|ValidatorFn>,
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<AsyncValidator|AsyncValidatorFn>,
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
                super();
                this._parent = parent;
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
              ngOnChanges(changes: SimpleChanges) {
                this._checkForErrors();
                if (!this._registered) this._setUpControl();
                if ('isDisabled' in changes) {
                  this._updateDisabled(changes);
                }

                if (isPropertyUpdated(changes, this.viewModel)) {
                  this._updateValue(this.model);
                  this.viewModel = this.model;
                }
              }

              /**
               * @description
               * Lifecycle method called before the directive's instance is destroyed. For internal
               * use only.
               */
              ngOnDestroy(): void { this.formDirective && this.formDirective.removeControl(this); }

              /**
               * @description
               * Returns an array that represents the path from the top-level form to this control.
               * Each index is the string name of the control on that level.
               */
              get path(): string[] {
                return this._parent ? controlPath(this.name, this._parent) : [this.name];
              }

              /**
               * @description
               * The top-level directive for this control if present, otherwise null.
               */
              get formDirective(): any { return this._parent ? this._parent.formDirective : null; }

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
               * Sets the new value for the view model and emits an `ngModelChange` event.
               *
               * @param newValue The new value emitted by `ngModelChange`.
               */
              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _setUpControl(): void {
                this._setUpdateStrategy();
                this._isStandalone() ? this._setUpStandalone() :
                                       this.formDirective.addControl(this);
                this._registered = true;
              }

              private _setUpdateStrategy(): void {
                if (this.options && this.options.updateOn != null) {
                  this.control._updateOn = this.options.updateOn;
                }
              }

              private _isStandalone(): boolean {
                return !this._parent || !!(this.options && this.options.standalone);
              }

              private _setUpStandalone(): void {
                setUpControl(this.control, this);
                this.control.updateValueAndValidity({emitEvent: false});
              }

              private _checkForErrors(): void {
                if (!this._isStandalone()) {
                  this._checkParentType();
                }
                this._checkName();
              }

              private _checkParentType(): void {
                if (!(this._parent instanceof NgModelGroup) &&
                    this._parent instanceof AbstractFormGroupDirective) {
                  TemplateDrivenErrors.formGroupNameException();
                } else if (
                    !(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm)) {
                  TemplateDrivenErrors.modelParentException();
                }
              }

              private _checkName(): void {
                if (this.options && this.options.name) this.name = this.options.name;

                if (!this._isStandalone() && !this.name) {
                  TemplateDrivenErrors.missingNameException();
                }
              }

              private _updateValue(value: any): void {
                resolvedPromise.then(
                    () => { this.control.setValue(value, {emitViewToModelChange: false}); });
              }

              private _updateDisabled(changes: SimpleChanges) {
                const disabledValue = changes['isDisabled'].currentValue;

                const isDisabled =
                    disabledValue === '' || (disabledValue && disabledValue !== 'false');

                resolvedPromise.then(() => {
                  if (isDisabled && !this.control.disabled) {
                    this.control.disable();
                  } else if (!isDisabled && this.control.disabled) {
                    this.control.enable();
                  }
                });
              }
}
