/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {NgControl} from '../ng_control';
import {
  controlParentException,
  disabledAttrWarning,
  ngModelGroupException,
} from '../reactive_errors';
import {_ngModelWarning, controlPath, isPropertyUpdated, selectValueAccessor} from '../shared';
import {FormArrayName, FormGroupName} from './form_group_name';
import {AbstractFormDirective} from './abstract_form.directive';
const controlNameBinding = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName),
};
/**
 * @description
 * Syncs a `FormControl` in an existing `FormGroup` to a form control
 * element by name.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link FormControl}
 * @see {@link AbstractControl}
 *
 * @usageNotes
 *
 * ### Register `FormControl` within a group
 *
 * The following example shows how to register multiple form controls within a form group
 * and set their value.
 *
 * {@example forms/ts/simpleFormGroup/simple_form_group_example.ts region='Component'}
 *
 * To see `formControlName` examples with different form control types, see:
 *
 * * Radio buttons: `RadioControlValueAccessor`
 * * Selects: `SelectControlValueAccessor`
 *
 * ### Use with ngModel is deprecated
 *
 * Support for using the `ngModel` input property and `ngModelChange` event with reactive
 * form directives has been deprecated in Angular v6 and is scheduled for removal in
 * a future version of Angular.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let FormControlName = (() => {
  let _classDecorators = [
    Directive({
      selector: '[formControlName]',
      providers: [controlNameBinding],
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = NgControl;
  let _instanceExtraInitializers = [];
  let _name_decorators;
  let _name_initializers = [];
  let _name_extraInitializers = [];
  let _set_isDisabled_decorators;
  let _model_decorators;
  let _model_initializers = [];
  let _model_extraInitializers = [];
  let _update_decorators;
  let _update_initializers = [];
  let _update_extraInitializers = [];
  var FormControlName = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _name_decorators = [Input('formControlName')];
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
        _name_decorators,
        {
          kind: 'field',
          name: 'name',
          static: false,
          private: false,
          access: {
            has: (obj) => 'name' in obj,
            get: (obj) => obj.name,
            set: (obj, value) => {
              obj.name = value;
            },
          },
          metadata: _metadata,
        },
        _name_initializers,
        _name_extraInitializers,
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
      FormControlName = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
    }
    _ngModelWarningConfig = __runInitializers(this, _instanceExtraInitializers);
    _added = false;
    /**
     * Internal reference to the view model value.
     * @internal
     */
    viewModel;
    /**
     * @description
     * Tracks the `FormControl` instance bound to the directive.
     */
    control;
    /**
     * @description
     * Tracks the name of the `FormControl` bound to the directive. The name corresponds
     * to a key in the parent `FormGroup` or `FormArray`.
     * Accepts a name as a string or a number.
     * The name in the form of a string is useful for individual forms,
     * while the numerical form allows for form controls to be bound
     * to indices when iterating over controls in a `FormArray`.
     */
    name = __runInitializers(this, _name_initializers, null);
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
      (__runInitializers(this, _name_extraInitializers),
      __runInitializers(this, _model_initializers, void 0));
    /** @deprecated as of v6 */
    update =
      (__runInitializers(this, _model_extraInitializers),
      __runInitializers(this, _update_initializers, new EventEmitter()));
    /**
     * @description
     * Static property used to track whether any ngModel warnings have been sent across
     * all instances of FormControlName. Used to support warning config of "once".
     *
     * @internal
     */
    static _ngModelWarningSentOnce = false;
    /**
     * @description
     * Instance property used to track whether an ngModel warning has been sent out for this
     * particular FormControlName instance. Used to support warning config of "always".
     *
     * @internal
     */
    _ngModelWarningSent = (__runInitializers(this, _update_extraInitializers), false);
    constructor(parent, validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
      super();
      this._ngModelWarningConfig = _ngModelWarningConfig;
      this._parent = parent;
      this._setValidators(validators);
      this._setAsyncValidators(asyncValidators);
      this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    /** @docs-private */
    ngOnChanges(changes) {
      if (!this._added) this._setUpControl();
      if (isPropertyUpdated(changes, this.viewModel)) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          _ngModelWarning('formControlName', FormControlName, this, this._ngModelWarningConfig);
        }
        this.viewModel = this.model;
        this.formDirective.updateModel(this, this.model);
      }
    }
    /** @docs-private */
    ngOnDestroy() {
      if (this.formDirective) {
        this.formDirective.removeControl(this);
      }
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
    /**
     * @description
     * Returns an array that represents the path from the top-level form to this control.
     * Each index is the string name of the control on that level.
     */
    get path() {
      return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
    }
    /**
     * @description
     * The top-level directive for this group if present, otherwise null.
     */
    get formDirective() {
      return this._parent ? this._parent.formDirective : null;
    }
    _setUpControl() {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        checkParentType(this._parent, this.name);
      }
      this.control = this.formDirective.addControl(this);
      this._added = true;
    }
    static {
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (FormControlName = _classThis);
})();
export {FormControlName};
function checkParentType(parent, name) {
  if (!(parent instanceof FormGroupName) && parent instanceof AbstractFormGroupDirective) {
    throw ngModelGroupException();
  } else if (
    !(parent instanceof FormGroupName) &&
    !(parent instanceof AbstractFormDirective) &&
    !(parent instanceof FormArrayName)
  ) {
    throw controlParentException(name);
  }
}
//# sourceMappingURL=form_control_name.js.map
