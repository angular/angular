import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, forwardRef, inject, Injectable} from '@angular/core';
import {NG_ASYNC_VALIDATORS} from '@angular/forms';
import {catchError, map} from 'rxjs/operators';
import {ActorsService} from './actors.service';
import {of} from 'rxjs';
// #docregion async-validator
let UniqueRoleValidator = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UniqueRoleValidator = class {
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
      UniqueRoleValidator = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    actorsService = inject(ActorsService);
    validate(control) {
      return this.actorsService.isRoleTaken(control.value).pipe(
        map((isTaken) => (isTaken ? {uniqueRole: true} : null)),
        catchError(() => of(null)),
      );
    }
  };
  return (UniqueRoleValidator = _classThis);
})();
export {UniqueRoleValidator};
// #enddocregion async-validator
// #docregion async-validator-directive
let UniqueRoleValidatorDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appUniqueRole]',
      providers: [
        {
          provide: NG_ASYNC_VALIDATORS,
          useExisting: forwardRef(() => UniqueRoleValidatorDirective),
          multi: true,
        },
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UniqueRoleValidatorDirective = class {
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
      UniqueRoleValidatorDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    validator = inject(UniqueRoleValidator);
    validate(control) {
      return this.validator.validate(control);
    }
  };
  return (UniqueRoleValidatorDirective = _classThis);
})();
export {UniqueRoleValidatorDirective};
// #enddocregion async-validator-directive
//# sourceMappingURL=role.directive.js.map
