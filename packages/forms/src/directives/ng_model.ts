/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Host, Inject, Input, OnChanges, OnDestroy, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {FormControl} from '../model';
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
const resolvedPromise = Promise.resolve(null);

/**
 * @whatItDoes Creates a {@link FormControl} instance from a domain model and binds it
 * to a form control element.
 *
 * The {@link FormControl} instance will track the value, user interaction, and
 * validation status of the control and keep the view synced with the model. If used
 * within a parent form, the directive will also register itself with the form as a child
 * control.
 *
 * @howToUse
 *
 * This directive can be used by itself or as part of a larger form. All you need is the
 * `ngModel` selector to activate it.
 *
 * It accepts a domain model as an optional {@link Input}. If you have a one-way binding
 * to `ngModel` with `[]` syntax, changing the value of the domain model in the component
 * class will set the value in the view. If you have a two-way binding with `[()]` syntax
 * (also known as 'banana-box syntax'), the value in the UI will always be synced back to
 * the domain model in your class as well.
 *
 * If you wish to inspect the properties of the associated {@link FormControl} (like
 * validity state), you can also export the directive into a local template variable using
 * `ngModel` as the key (ex: `#myVar="ngModel"`). You can then access the control using the
 * directive's `control` property, but most properties you'll need (like `valid` and `dirty`)
 * will fall through to the control anyway, so you can access them directly. You can see a
 * full list of properties directly available in {@link AbstractControlDirective}.
 *
 * The following is an example of a simple standalone control using `ngModel`:
 *
 * {@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
 *
 * When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
 * so that the control can be registered with the parent form under that name.
 *
 * It's worth noting that in the context of a parent form, you often can skip one-way or
 * two-way binding because the parent form will sync the value for you. You can access
 * its properties by exporting it into a local template variable using `ngForm` (ex:
 * `#f="ngForm"`). Then you can pass it where it needs to go on submit.
 *
 * If you do need to populate initial values into your form, using a one-way binding for
 * `ngModel` tends to be sufficient as long as you use the exported form's value rather
 * than the domain model's value on submit.
 *
 * Take a look at an example of using `ngModel` within a form:
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * To see `ngModel` examples with different form control types, see:
 *
 * * Radio buttons: {@link RadioControlValueAccessor}
 * * Selects: {@link SelectControlValueAccessor}
 *
 * **npm package**: `@angular/forms`
 *
 * **NgModule**: `FormsModule`
 *
 *  @stable
 */
@Directive({
  selector: '[ngModel]:not([formControlName]):not([formControl])',
  providers: [formControlBinding],
  exportAs: 'ngModel'
})
export class NgModel extends NgControl implements OnChanges,
    OnDestroy {
  /** @internal */
  _control = new FormControl();
  /** @internal */
  _registered = false;
  viewModel: any;

  @Input() name: string;
  @Input('disabled') isDisabled: boolean;
  @Input('ngModel') model: any;
  @Input('ngModelOptions') options: {name?: string, standalone?: boolean};

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

              ngOnDestroy(): void { this.formDirective && this.formDirective.removeControl(this); }

              get control(): FormControl { return this._control; }

              get path(): string[] {
                return this._parent ? controlPath(this.name, this._parent) : [this.name];
              }

              get formDirective(): any { return this._parent ? this._parent.formDirective : null; }

              get validator(): ValidatorFn|null { return composeValidators(this._rawValidators); }

              get asyncValidator(): AsyncValidatorFn|null {
                return composeAsyncValidators(this._rawAsyncValidators);
              }

              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                this.update.emit(newValue);
              }

              private _setUpControl(): void {
                this._isStandalone() ? this._setUpStandalone() :
                                       this.formDirective.addControl(this);
                this._registered = true;
              }

              private _isStandalone(): boolean {
                return !this._parent || !!(this.options && this.options.standalone);
              }

              private _setUpStandalone(): void {
                setUpControl(this._control, this);
                this._control.updateValueAndValidity({emitEvent: false});
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
