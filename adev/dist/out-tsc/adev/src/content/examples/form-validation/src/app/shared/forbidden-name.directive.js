import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Directive, forwardRef, input} from '@angular/core';
import {NG_VALIDATORS} from '@angular/forms';
// #docregion custom-validator
/** An actor's name can't match the given regular expression */
export function forbiddenNameValidator(nameRe) {
  return (control) => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}
// #enddocregion custom-validator
// #docregion directive
let ForbiddenValidatorDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appForbiddenName]',
      // #docregion directive-providers
      providers: [
        {
          provide: NG_VALIDATORS,
          useExisting: forwardRef(() => ForbiddenValidatorDirective),
          multi: true,
        },
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ForbiddenValidatorDirective = class {
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
      ForbiddenValidatorDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    forbiddenName = input('', {alias: 'appForbiddenName'});
    validate(control) {
      return this.forbiddenName
        ? forbiddenNameValidator(new RegExp(this.forbiddenName(), 'i'))(control)
        : null;
    }
  };
  return (ForbiddenValidatorDirective = _classThis);
})();
export {ForbiddenValidatorDirective};
// #enddocregion directive
//# sourceMappingURL=forbidden-name.directive.js.map
