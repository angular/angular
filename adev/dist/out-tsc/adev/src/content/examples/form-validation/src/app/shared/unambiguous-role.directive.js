import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Directive, forwardRef} from '@angular/core';
import {NG_VALIDATORS} from '@angular/forms';
// #docregion cross-validation-validator
/** An actor's name can't match the actor's role */
export const unambiguousRoleValidator = (control) => {
  const name = control.get('name');
  const role = control.get('role');
  return name && role && name.value === role.value ? {unambiguousRole: true} : null;
};
// #enddocregion cross-validation-validator
// #docregion cross-validation-directive
let UnambiguousRoleValidatorDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appUnambiguousRole]',
      providers: [
        {
          provide: NG_VALIDATORS,
          useExisting: forwardRef(() => UnambiguousRoleValidatorDirective),
          multi: true,
        },
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UnambiguousRoleValidatorDirective = class {
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
      UnambiguousRoleValidatorDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    validate(control) {
      return unambiguousRoleValidator(control);
    }
  };
  return (UnambiguousRoleValidatorDirective = _classThis);
})();
export {UnambiguousRoleValidatorDirective};
// #enddocregion cross-validation-directive
//# sourceMappingURL=unambiguous-role.directive.js.map
