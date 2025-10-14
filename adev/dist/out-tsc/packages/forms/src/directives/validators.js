/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {booleanAttribute, Directive, forwardRef, Input} from '@angular/core';
import {
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  NG_VALIDATORS,
  nullValidator,
  patternValidator,
  requiredTrueValidator,
  requiredValidator,
} from '../validators';
/**
 * Method that updates string to integer if not already a number
 *
 * @param value The value to convert to integer.
 * @returns value of parameter converted to number or integer.
 */
function toInteger(value) {
  return typeof value === 'number' ? value : parseInt(value, 10);
}
/**
 * Method that ensures that provided value is a float (and converts it to float if needed).
 *
 * @param value The value to convert to float.
 * @returns value of parameter converted to number or float.
 */
function toFloat(value) {
  return typeof value === 'number' ? value : parseFloat(value);
}
/**
 * A base class for Validator-based Directives. The class contains common logic shared across such
 * Directives.
 *
 * For internal use only, this class is not intended for use outside of the Forms package.
 */
let AbstractValidatorDirective = (() => {
  let _classDecorators = [Directive()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AbstractValidatorDirective = class {
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
      AbstractValidatorDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _validator = nullValidator;
    _onChange;
    /**
     * A flag that tracks whether this validator is enabled.
     *
     * Marking it `internal` (vs `protected`), so that this flag can be used in host bindings of
     * directive classes that extend this base class.
     * @internal
     */
    _enabled;
    /** @docs-private */
    ngOnChanges(changes) {
      if (this.inputName in changes) {
        const input = this.normalizeInput(changes[this.inputName].currentValue);
        this._enabled = this.enabled(input);
        this._validator = this._enabled ? this.createValidator(input) : nullValidator;
        if (this._onChange) {
          this._onChange();
        }
      }
    }
    /** @docs-private */
    validate(control) {
      return this._validator(control);
    }
    /** @docs-private */
    registerOnValidatorChange(fn) {
      this._onChange = fn;
    }
    /**
     * @description
     * Determines whether this validator should be active or not based on an input.
     * Base class implementation checks whether an input is defined (if the value is different from
     * `null` and `undefined`). Validator classes that extend this base class can override this
     * function with the logic specific to a particular validator directive.
     */
    enabled(input) {
      return input != null /* both `null` and `undefined` */;
    }
  };
  return (AbstractValidatorDirective = _classThis);
})();
/**
 * @description
 * Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxValidator),
  multi: true,
};
/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a max validator
 *
 * The following example shows how to add a max validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel max="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MaxValidator = (() => {
  let _classDecorators = [
    Directive({
      selector:
        'input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]',
      providers: [MAX_VALIDATOR],
      host: {'[attr.max]': '_enabled ? max : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _max_decorators;
  let _max_initializers = [];
  let _max_extraInitializers = [];
  var MaxValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _max_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _max_decorators,
        {
          kind: 'field',
          name: 'max',
          static: false,
          private: false,
          access: {
            has: (obj) => 'max' in obj,
            get: (obj) => obj.max,
            set: (obj, value) => {
              obj.max = value;
            },
          },
          metadata: _metadata,
        },
        _max_initializers,
        _max_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MaxValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the max bound to this directive.
     */
    max = __runInitializers(this, _max_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _max_extraInitializers), 'max');
    /** @internal */
    normalizeInput = (input) => toFloat(input);
    /** @internal */
    createValidator = (max) => maxValidator(max);
  };
  return (MaxValidator = _classThis);
})();
export {MaxValidator};
/**
 * @description
 * Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinValidator),
  multi: true,
};
/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a min validator
 *
 * The following example shows how to add a min validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel min="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MinValidator = (() => {
  let _classDecorators = [
    Directive({
      selector:
        'input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]',
      providers: [MIN_VALIDATOR],
      host: {'[attr.min]': '_enabled ? min : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _min_decorators;
  let _min_initializers = [];
  let _min_extraInitializers = [];
  var MinValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _min_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _min_decorators,
        {
          kind: 'field',
          name: 'min',
          static: false,
          private: false,
          access: {
            has: (obj) => 'min' in obj,
            get: (obj) => obj.min,
            set: (obj, value) => {
              obj.min = value;
            },
          },
          metadata: _metadata,
        },
        _min_initializers,
        _min_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MinValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the min bound to this directive.
     */
    min = __runInitializers(this, _min_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _min_extraInitializers), 'min');
    /** @internal */
    normalizeInput = (input) => toFloat(input);
    /** @internal */
    createValidator = (min) => minValidator(min);
  };
  return (MinValidator = _classThis);
})();
export {MinValidator};
/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
  multi: true,
};
/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const CHECKBOX_REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CheckboxRequiredValidator),
  multi: true,
};
/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required validator using template-driven forms
 *
 * ```html
 * <input name="fullName" ngModel required>
 * ```
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let RequiredValidator = (() => {
  let _classDecorators = [
    Directive({
      selector:
        ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
      providers: [REQUIRED_VALIDATOR],
      host: {'[attr.required]': '_enabled ? "" : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _required_decorators;
  let _required_initializers = [];
  let _required_extraInitializers = [];
  var RequiredValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _required_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _required_decorators,
        {
          kind: 'field',
          name: 'required',
          static: false,
          private: false,
          access: {
            has: (obj) => 'required' in obj,
            get: (obj) => obj.required,
            set: (obj, value) => {
              obj.required = value;
            },
          },
          metadata: _metadata,
        },
        _required_initializers,
        _required_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RequiredValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the required attribute bound to this directive.
     */
    required = __runInitializers(this, _required_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _required_extraInitializers), 'required');
    /** @internal */
    normalizeInput = booleanAttribute;
    /** @internal */
    createValidator = (input) => requiredValidator;
    /** @docs-private */
    enabled(input) {
      return input;
    }
  };
  return (RequiredValidator = _classThis);
})();
export {RequiredValidator};
/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required checkbox validator using template-driven forms
 *
 * The following example shows how to add a checkbox required validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
let CheckboxRequiredValidator = (() => {
  let _classDecorators = [
    Directive({
      selector:
        'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
      providers: [CHECKBOX_REQUIRED_VALIDATOR],
      host: {'[attr.required]': '_enabled ? "" : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = RequiredValidator;
  var CheckboxRequiredValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CheckboxRequiredValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /** @internal */
    createValidator = (input) => requiredTrueValidator;
  };
  return (CheckboxRequiredValidator = _classThis);
})();
export {CheckboxRequiredValidator};
/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const EMAIL_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailValidator),
  multi: true,
};
/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * The email validation is based on the WHATWG HTML specification with some enhancements to
 * incorporate more RFC rules. More information can be found on the [Validators.email
 * page](api/forms/Validators#email).
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding an email validator
 *
 * The following example shows how to add an email validator to an input attached to an ngModel
 * binding.
 *
 * ```html
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
let EmailValidator = (() => {
  let _classDecorators = [
    Directive({
      selector: '[email][formControlName],[email][formControl],[email][ngModel]',
      providers: [EMAIL_VALIDATOR],
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _email_decorators;
  let _email_initializers = [];
  let _email_extraInitializers = [];
  var EmailValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _email_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _email_decorators,
        {
          kind: 'field',
          name: 'email',
          static: false,
          private: false,
          access: {
            has: (obj) => 'email' in obj,
            get: (obj) => obj.email,
            set: (obj, value) => {
              obj.email = value;
            },
          },
          metadata: _metadata,
        },
        _email_initializers,
        _email_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      EmailValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the email attribute bound to this directive.
     */
    email = __runInitializers(this, _email_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _email_extraInitializers), 'email');
    /** @internal */
    normalizeInput = booleanAttribute;
    /** @internal */
    createValidator = (input) => emailValidator;
    /** @docs-private */
    enabled(input) {
      return input;
    }
  };
  return (EmailValidator = _classThis);
})();
export {EmailValidator};
/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinLengthValidator),
  multi: true,
};
/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a minimum length validator
 *
 * The following example shows how to add a minimum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel minlength="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MinLengthValidator = (() => {
  let _classDecorators = [
    Directive({
      selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
      providers: [MIN_LENGTH_VALIDATOR],
      host: {'[attr.minlength]': '_enabled ? minlength : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _minlength_decorators;
  let _minlength_initializers = [];
  let _minlength_extraInitializers = [];
  var MinLengthValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _minlength_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _minlength_decorators,
        {
          kind: 'field',
          name: 'minlength',
          static: false,
          private: false,
          access: {
            has: (obj) => 'minlength' in obj,
            get: (obj) => obj.minlength,
            set: (obj, value) => {
              obj.minlength = value;
            },
          },
          metadata: _metadata,
        },
        _minlength_initializers,
        _minlength_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MinLengthValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the minimum length bound to this directive.
     */
    minlength = __runInitializers(this, _minlength_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _minlength_extraInitializers), 'minlength');
    /** @internal */
    normalizeInput = (input) => toInteger(input);
    /** @internal */
    createValidator = (minlength) => minLengthValidator(minlength);
  };
  return (MinLengthValidator = _classThis);
})();
export {MinLengthValidator};
/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxLengthValidator),
  multi: true,
};
/**
 * A directive that adds maximum length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a maximum length validator
 *
 * The following example shows how to add a maximum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel maxlength="25">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MaxLengthValidator = (() => {
  let _classDecorators = [
    Directive({
      selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
      providers: [MAX_LENGTH_VALIDATOR],
      host: {'[attr.maxlength]': '_enabled ? maxlength : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _maxlength_decorators;
  let _maxlength_initializers = [];
  let _maxlength_extraInitializers = [];
  var MaxLengthValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _maxlength_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _maxlength_decorators,
        {
          kind: 'field',
          name: 'maxlength',
          static: false,
          private: false,
          access: {
            has: (obj) => 'maxlength' in obj,
            get: (obj) => obj.maxlength,
            set: (obj, value) => {
              obj.maxlength = value;
            },
          },
          metadata: _metadata,
        },
        _maxlength_initializers,
        _maxlength_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MaxLengthValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the maximum length bound to this directive.
     */
    maxlength = __runInitializers(this, _maxlength_initializers, void 0);
    /** @internal */
    inputName = (__runInitializers(this, _maxlength_extraInitializers), 'maxlength');
    /** @internal */
    normalizeInput = (input) => toInteger(input);
    /** @internal */
    createValidator = (maxlength) => maxLengthValidator(maxlength);
  };
  return (MaxLengthValidator = _classThis);
})();
export {MaxLengthValidator};
/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const PATTERN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => PatternValidator),
  multi: true,
};
/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a pattern validator
 *
 * The following example shows how to add a pattern validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel pattern="[a-zA-Z ]*">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let PatternValidator = (() => {
  let _classDecorators = [
    Directive({
      selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
      providers: [PATTERN_VALIDATOR],
      host: {'[attr.pattern]': '_enabled ? pattern : null'},
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractValidatorDirective;
  let _pattern_decorators;
  let _pattern_initializers = [];
  let _pattern_extraInitializers = [];
  var PatternValidator = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _pattern_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _pattern_decorators,
        {
          kind: 'field',
          name: 'pattern',
          static: false,
          private: false,
          access: {
            has: (obj) => 'pattern' in obj,
            get: (obj) => obj.pattern,
            set: (obj, value) => {
              obj.pattern = value;
            },
          },
          metadata: _metadata,
        },
        _pattern_initializers,
        _pattern_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      PatternValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Tracks changes to the pattern bound to this directive.
     */
    pattern = __runInitializers(this, _pattern_initializers, void 0); // This input is always defined, since the name matches selector.
    /** @internal */
    inputName = (__runInitializers(this, _pattern_extraInitializers), 'pattern');
    /** @internal */
    normalizeInput = (input) => input;
    /** @internal */
    createValidator = (input) => patternValidator(input);
  };
  return (PatternValidator = _classThis);
})();
export {PatternValidator};
//# sourceMappingURL=validators.js.map
