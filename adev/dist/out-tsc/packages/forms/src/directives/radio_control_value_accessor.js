/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  Directive,
  forwardRef,
  inject,
  Injectable,
  Input,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {BuiltInControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
import {NgControl} from './ng_control';
import {CALL_SET_DISABLED_STATE, setDisabledStateDefault} from './shared';
const RADIO_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioControlValueAccessor),
  multi: true,
};
function throwNameError() {
  throw new RuntimeError(
    1202 /* RuntimeErrorCode.NAME_AND_FORM_CONTROL_NAME_MUST_MATCH */,
    `
      If you define both a name and a formControlName attribute on your radio button, their values
      must match. Ex: <input type="radio" formControlName="food" name="food">
    `,
  );
}
/**
 * @description
 * Class used by Angular to track radio buttons. For internal use only.
 */
let RadioControlRegistry = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RadioControlRegistry = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RadioControlRegistry = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _accessors = [];
    /**
     * @description
     * Adds a control to the internal registry. For internal use only.
     */
    add(control, accessor) {
      this._accessors.push([control, accessor]);
    }
    /**
     * @description
     * Removes a control from the internal registry. For internal use only.
     */
    remove(accessor) {
      for (let i = this._accessors.length - 1; i >= 0; --i) {
        if (this._accessors[i][1] === accessor) {
          this._accessors.splice(i, 1);
          return;
        }
      }
    }
    /**
     * @description
     * Selects a radio button. For internal use only.
     */
    select(accessor) {
      this._accessors.forEach((c) => {
        if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
          c[1].fireUncheck(accessor.value);
        }
      });
    }
    _isSameGroup(controlPair, accessor) {
      if (!controlPair[0].control) return false;
      return (
        controlPair[0]._parent === accessor._control._parent &&
        controlPair[1].name === accessor.name
      );
    }
  };
  return (RadioControlRegistry = _classThis);
})();
export {RadioControlRegistry};
/**
 * @description
 * The `ControlValueAccessor` for writing radio control values and listening to radio control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using radio buttons with reactive form directives
 *
 * The follow example shows how to use radio buttons in a reactive form. When using radio buttons in
 * a reactive form, radio buttons in the same group should have the same `formControlName`.
 * Providing a `name` attribute is optional.
 *
 * {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let RadioControlValueAccessor = (() => {
  let _classDecorators = [
    Directive({
      selector:
        'input[type=radio][formControlName],input[type=radio][formControl],input[type=radio][ngModel]',
      host: {'(change)': 'onChange()', '(blur)': 'onTouched()'},
      providers: [RADIO_VALUE_ACCESSOR],
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = BuiltInControlValueAccessor;
  let _name_decorators;
  let _name_initializers = [];
  let _name_extraInitializers = [];
  let _formControlName_decorators;
  let _formControlName_initializers = [];
  let _formControlName_extraInitializers = [];
  let _value_decorators;
  let _value_initializers = [];
  let _value_extraInitializers = [];
  var RadioControlValueAccessor = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _name_decorators = [Input()];
      _formControlName_decorators = [Input()];
      _value_decorators = [Input()];
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
        _formControlName_decorators,
        {
          kind: 'field',
          name: 'formControlName',
          static: false,
          private: false,
          access: {
            has: (obj) => 'formControlName' in obj,
            get: (obj) => obj.formControlName,
            set: (obj, value) => {
              obj.formControlName = value;
            },
          },
          metadata: _metadata,
        },
        _formControlName_initializers,
        _formControlName_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _value_decorators,
        {
          kind: 'field',
          name: 'value',
          static: false,
          private: false,
          access: {
            has: (obj) => 'value' in obj,
            get: (obj) => obj.value,
            set: (obj, value) => {
              obj.value = value;
            },
          },
          metadata: _metadata,
        },
        _value_initializers,
        _value_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RadioControlValueAccessor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _registry;
    _injector;
    /** @internal */
    _state;
    /** @internal */
    _control;
    /** @internal */
    _fn;
    setDisabledStateFired = false;
    /**
     * The registered callback function called when a change event occurs on the input element.
     * Note: we declare `onChange` here (also used as host listener) as a function with no arguments
     * to override the `onChange` function (which expects 1 argument) in the parent
     * `BaseControlValueAccessor` class.
     * @docs-private
     */
    onChange = () => {};
    /**
     * @description
     * Tracks the name of the radio input element.
     */
    name = __runInitializers(this, _name_initializers, void 0);
    /**
     * @description
     * Tracks the name of the `FormControl` bound to the directive. The name corresponds
     * to a key in the parent `FormGroup` or `FormArray`.
     */
    formControlName =
      (__runInitializers(this, _name_extraInitializers),
      __runInitializers(this, _formControlName_initializers, void 0));
    /**
     * @description
     * Tracks the value of the radio input element
     */
    value =
      (__runInitializers(this, _formControlName_extraInitializers),
      __runInitializers(this, _value_initializers, void 0));
    callSetDisabledState =
      (__runInitializers(this, _value_extraInitializers),
      inject(CALL_SET_DISABLED_STATE, {optional: true}) ?? setDisabledStateDefault);
    constructor(renderer, elementRef, _registry, _injector) {
      super(renderer, elementRef);
      this._registry = _registry;
      this._injector = _injector;
    }
    /** @docs-private */
    ngOnInit() {
      this._control = this._injector.get(NgControl);
      this._checkName();
      this._registry.add(this._control, this);
    }
    /** @docs-private */
    ngOnDestroy() {
      this._registry.remove(this);
    }
    /**
     * Sets the "checked" property value on the radio input element.
     * @docs-private
     */
    writeValue(value) {
      this._state = value === this.value;
      this.setProperty('checked', this._state);
    }
    /**
     * Registers a function called when the control value changes.
     * @docs-private
     */
    registerOnChange(fn) {
      this._fn = fn;
      this.onChange = () => {
        fn(this.value);
        this._registry.select(this);
      };
    }
    /** @docs-private */
    setDisabledState(isDisabled) {
      /**
       * `setDisabledState` is supposed to be called whenever the disabled state of a control changes,
       * including upon control creation. However, a longstanding bug caused the method to not fire
       * when an *enabled* control was attached. This bug was fixed in v15 in #47576.
       *
       * This had a side effect: previously, it was possible to instantiate a reactive form control
       * with `[attr.disabled]=true`, even though the corresponding control was enabled in the
       * model. This resulted in a mismatch between the model and the DOM. Now, because
       * `setDisabledState` is always called, the value in the DOM will be immediately overwritten
       * with the "correct" enabled value.
       *
       * However, the fix also created an exceptional case: radio buttons. Because Reactive Forms
       * models the entire group of radio buttons as a single `FormControl`, there is no way to
       * control the disabled state for individual radios, so they can no longer be configured as
       * disabled. Thus, we keep the old behavior for radio buttons, so that `[attr.disabled]`
       * continues to work. Specifically, we drop the first call to `setDisabledState` if `disabled`
       * is `false`, and we are not in legacy mode.
       */
      if (
        this.setDisabledStateFired ||
        isDisabled ||
        this.callSetDisabledState === 'whenDisabledForLegacyCode'
      ) {
        this.setProperty('disabled', isDisabled);
      }
      this.setDisabledStateFired = true;
    }
    /**
     * Sets the "value" on the radio input element and unchecks it.
     *
     * @param value
     */
    fireUncheck(value) {
      this.writeValue(value);
    }
    _checkName() {
      if (
        this.name &&
        this.formControlName &&
        this.name !== this.formControlName &&
        (typeof ngDevMode === 'undefined' || ngDevMode)
      ) {
        throwNameError();
      }
      if (!this.name && this.formControlName) this.name = this.formControlName;
    }
  };
  return (RadioControlValueAccessor = _classThis);
})();
export {RadioControlValueAccessor};
//# sourceMappingURL=radio_control_value_accessor.js.map
