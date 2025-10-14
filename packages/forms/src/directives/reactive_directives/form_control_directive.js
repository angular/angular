/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var FormControlDirective_1;
import {__decorate, __param} from 'tslib';
import {
  Directive,
  EventEmitter,
  forwardRef,
  Inject,
  InjectionToken,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {NG_VALUE_ACCESSOR} from '../control_value_accessor';
import {NgControl} from '../ng_control';
import {disabledAttrWarning} from '../reactive_errors';
import {
  _ngModelWarning,
  CALL_SET_DISABLED_STATE,
  cleanUpControl,
  isPropertyUpdated,
  selectValueAccessor,
  setUpControl,
} from '../shared';
/**
 * Token to provide to turn off the ngModel warning on formControl and formControlName.
 */
export const NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'NgModelWithFormControlWarning' : '',
);
const formControlBinding = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective),
};
/**
 * @description
 * Synchronizes a standalone `FormControl` instance to a form control element.
 *
 * Note that support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives was deprecated in Angular v6 and is scheduled for removal in
 * a future version of Angular.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link FormControl}
 * @see {@link AbstractControl}
 *
 * @usageNotes
 *
 * The following example shows how to register a standalone control and set its value.
 *
 * {@example forms/ts/simpleFormControl/simple_form_control_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let FormControlDirective = (FormControlDirective_1 = class FormControlDirective extends NgControl {
  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  set isDisabled(isDisabled) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }
  constructor(
    validators,
    asyncValidators,
    valueAccessors,
    _ngModelWarningConfig,
    callSetDisabledState,
  ) {
    super();
    this._ngModelWarningConfig = _ngModelWarningConfig;
    this.callSetDisabledState = callSetDisabledState;
    /** @deprecated as of v6 */
    this.update = new EventEmitter();
    /**
     * @description
     * Instance property used to track whether an ngModel warning has been sent out for this
     * particular `FormControlDirective` instance. Used to support warning config of "always".
     *
     * @internal
     */
    this._ngModelWarningSent = false;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }
  /** @docs-private */
  ngOnChanges(changes) {
    if (this._isControlChanged(changes)) {
      const previousForm = changes['form'].previousValue;
      if (previousForm) {
        cleanUpControl(previousForm, this, /* validateControlPresenceOnChange */ false);
      }
      setUpControl(this.form, this, this.callSetDisabledState);
      this.form.updateValueAndValidity({emitEvent: false});
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        _ngModelWarning('formControl', FormControlDirective_1, this, this._ngModelWarningConfig);
      }
      this.form.setValue(this.model);
      this.viewModel = this.model;
    }
  }
  /** @docs-private */
  ngOnDestroy() {
    if (this.form) {
      cleanUpControl(this.form, this, /* validateControlPresenceOnChange */ false);
    }
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return [];
  }
  /**
   * @description
   * The `FormControl` bound to this directive.
   */
  get control() {
    return this.form;
  }
  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  viewToModelUpdate(newValue) {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }
  _isControlChanged(changes) {
    return changes.hasOwnProperty('form');
  }
});
/**
 * @description
 * Static property used to track whether any ngModel warnings have been sent across
 * all instances of FormControlDirective. Used to support warning config of "once".
 *
 * @internal
 */
FormControlDirective._ngModelWarningSentOnce = false;
__decorate([Input('formControl')], FormControlDirective.prototype, 'form', void 0);
__decorate([Input('disabled')], FormControlDirective.prototype, 'isDisabled', null);
__decorate([Input('ngModel')], FormControlDirective.prototype, 'model', void 0);
__decorate([Output('ngModelChange')], FormControlDirective.prototype, 'update', void 0);
FormControlDirective = FormControlDirective_1 = __decorate(
  [
    Directive({
      selector: '[formControl]',
      providers: [formControlBinding],
      exportAs: 'ngForm',
      standalone: false,
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_VALUE_ACCESSOR)),
    __param(3, Optional()),
    __param(3, Inject(NG_MODEL_WITH_FORM_CONTROL_WARNING)),
    __param(4, Optional()),
    __param(4, Inject(CALL_SET_DISABLED_STATE)),
  ],
  FormControlDirective,
);
export {FormControlDirective};
//# sourceMappingURL=form_control_directive.js.map
