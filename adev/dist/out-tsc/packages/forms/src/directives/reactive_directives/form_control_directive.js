/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, EventEmitter, forwardRef, InjectionToken, Input, Output} from '@angular/core';
import {NgControl} from '../ng_control';
import {disabledAttrWarning} from '../reactive_errors';
import {
  _ngModelWarning,
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
let FormControlDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[formControl]',
      providers: [formControlBinding],
      exportAs: 'ngForm',
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = NgControl;
  let _instanceExtraInitializers = [];
  let _form_decorators;
  let _form_initializers = [];
  let _form_extraInitializers = [];
  let _set_isDisabled_decorators;
  let _model_decorators;
  let _model_initializers = [];
  let _model_extraInitializers = [];
  let _update_decorators;
  let _update_initializers = [];
  let _update_extraInitializers = [];
  var FormControlDirective = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _form_decorators = [Input('formControl')];
      _set_isDisabled_decorators = [Input('disabled')];
      _model_decorators = [Input('ngModel')];
      _update_decorators = [Output('ngModelChange')];
      __esDecorate(
        this,
        null,
        _set_isDisabled_decorators,
        {
          kind: 'setter',
          name: 'isDisabled',
          static: false,
          private: false,
          access: {
            has: (obj) => 'isDisabled' in obj,
            set: (obj, value) => {
              obj.isDisabled = value;
            },
          },
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        null,
        null,
        _form_decorators,
        {
          kind: 'field',
          name: 'form',
          static: false,
          private: false,
          access: {
            has: (obj) => 'form' in obj,
            get: (obj) => obj.form,
            set: (obj, value) => {
              obj.form = value;
            },
          },
          metadata: _metadata,
        },
        _form_initializers,
        _form_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _model_decorators,
        {
          kind: 'field',
          name: 'model',
          static: false,
          private: false,
          access: {
            has: (obj) => 'model' in obj,
            get: (obj) => obj.model,
            set: (obj, value) => {
              obj.model = value;
            },
          },
          metadata: _metadata,
        },
        _model_initializers,
        _model_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _update_decorators,
        {
          kind: 'field',
          name: 'update',
          static: false,
          private: false,
          access: {
            has: (obj) => 'update' in obj,
            get: (obj) => obj.update,
            set: (obj, value) => {
              obj.update = value;
            },
          },
          metadata: _metadata,
        },
        _update_initializers,
        _update_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FormControlDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
    }
    _ngModelWarningConfig = __runInitializers(this, _instanceExtraInitializers);
    callSetDisabledState;
    /**
     * Internal reference to the view model value.
     * @docs-private
     */
    viewModel;
    /**
     * @description
     * Tracks the `FormControl` instance bound to the directive.
     */
    form = __runInitializers(this, _form_initializers, void 0);
    /**
     * @description
     * Triggers a warning in dev mode that this input should not be used with reactive forms.
     */
    set isDisabled(isDisabled) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(disabledAttrWarning);
      }
    }
    // TODO(kara): remove next 4 properties once deprecation period is over
    /** @deprecated as of v6 */
    model =
      (__runInitializers(this, _form_extraInitializers),
      __runInitializers(this, _model_initializers, void 0));
    /** @deprecated as of v6 */
    update =
      (__runInitializers(this, _model_extraInitializers),
      __runInitializers(this, _update_initializers, new EventEmitter()));
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
    _ngModelWarningSent = (__runInitializers(this, _update_extraInitializers), false);
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
          _ngModelWarning('formControl', FormControlDirective, this, this._ngModelWarningConfig);
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
    static {
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (FormControlDirective = _classThis);
})();
export {FormControlDirective};
//# sourceMappingURL=form_control_directive.js.map
